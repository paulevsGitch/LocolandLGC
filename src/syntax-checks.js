"use strict";

const CONTINUATION_TOKENS = new Set([
	",", ".", "=", "+", "-", "*", "/", "%", "&", "|", "^", "!", "~",
	"<", ">", "<=", ">=", "==", "!=", "&&", "||", "?", "(", "[", "->"
]);

const CONTROL_WORDS = new Set(["if", "for", "while", "switch"]);

/**
 * Returns physical line numbers occupied by preprocessor directives, including
 * backslash-continued lines. A leading hash inside a block comment is not a directive.
 *
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Complete source text.
 * @returns {Set<number>} Ignored physical line numbers.
 */
function preprocessorLines(tokens, sourceText) {
	const lines = sourceText.split(/\r?\n/);
	const tokensByLine = Array.from({ length: lines.length }, () => []);
	for (const token of tokens || []) {
		if (Number.isInteger(token.line) && tokensByLine[token.line]) tokensByLine[token.line].push(token);
	}

	const ignored = new Set();
	let continuation = false;
	for (let line = 0; line < lines.length; line++) {
		const firstToken = tokensByLine[line][0];
		const startsDirective = firstToken && firstToken.value === "#" && /^\s*#/.test(lines[line]);
		if (!continuation && !startsDirective) continue;

		ignored.add(line);
		continuation = /\\\s*$/.test(lines[line]);
	}

	return ignored;
}

/**
 * Finds `int` declarations placed directly in a `for` initializer.
 * LGC does not support this declaration form; the loop variable must be
 * declared before the loop and assigned in the initializer instead.
 *
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Complete source text, used to skip preprocessor directives.
 * @returns {Array<{typeToken: import("./models").Token, nameToken: import("./models").Token}>}
 *	Declarations found in `for (int name = ...; ...; ...)` headers.
 */
function findForLoopIntDeclarations(tokens, sourceText = "") {
	const declarations = [];
	const ignoredLines = sourceText ? preprocessorLines(tokens, sourceText) : new Set();

	for (let i = 0; i < tokens.length - 3; i++) {
		if (ignoredLines.has(tokens[i].line)) continue;
		if (tokens[i].value !== "for" || tokens[i + 1].value !== "(" || tokens[i + 2].value !== "int") continue;

		const nameToken = tokens[i + 3];
		if (!nameToken || nameToken.type !== "identifier") continue;

		declarations.push({ typeToken: tokens[i + 2], nameToken });
	}

	return declarations;
}

/**
 * Finds source-line endings that look like completed statements but have no
 * terminating semicolon. The check is token-based, so comments and literal
 * contents cannot create false semicolon matches. It deliberately allows
 * multiline expressions, control-flow headers, function definitions, block
 * braces, case labels and preprocessor directives.
 *
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Complete source text.
 * @param {import("./models").ParsedSource} parsed Parsed document metadata.
 * @returns {import("./models").Token[]} Last tokens on lines missing a semicolon.
 */
function findMissingSemicolonTokens(tokens, sourceText, parsed = {}) {
	if (!tokens || !tokens.length || !sourceText) return [];

	const lines = sourceText.split(/\r?\n/);
	const ignoredPreprocessorLines = preprocessorLines(tokens, sourceText);
	const tokensByLine = Array.from({ length: lines.length }, () => []);
	const tokenIndices = new Map();

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const line = Number.isInteger(token.line) ? token.line : 0;
		if (line >= 0 && line < tokensByLine.length) tokensByLine[line].push({ token, index: i });
		tokenIndices.set(token.start, i);
	}

	const matchingOpenByClose = new Map();
	const initializerCloseTokens = new Set();
	const functionHeaderCloseTokens = new Set();
	const delimiterStacks = { "(": [], "[": [], "{": [] };
	const openForClose = { ")": "(", "]": "[", "}": "{" };

	for (let i = 0; i < tokens.length; i++) {
		if (ignoredPreprocessorLines.has(tokens[i].line)) continue;
		const value = tokens[i].value;
		if (value === "(" || value === "[") {
			delimiterStacks[value].push(i);
			continue;
		}

		if (value === "{") {
			const previous = tokens[i - 1] ? tokens[i - 1].value : "";
			const parentInitializer = delimiterStacks["{"].length > 0 &&
				delimiterStacks["{"].at(-1).isInitializer;
			const isInitializer = parentInitializer || previous === "=" || previous === ",";
			delimiterStacks["{"].push({ index: i, isInitializer });
			continue;
		}

		const opening = openForClose[value];
		if (!opening) continue;
		const stack = delimiterStacks[opening];
		if (!stack.length) continue;

		const openEntry = stack.pop();
		const openIndex = typeof openEntry === "number" ? openEntry : openEntry.index;
		matchingOpenByClose.set(i, openIndex);
		if (opening === "{" && openEntry.isInitializer && !stack.some(entry => typeof entry === "object" && entry.isInitializer)) initializerCloseTokens.add(i);
	}

	// Function declarations with bodies may put the opening brace on the next line.
	for (const fn of parsed.functions || []) {
		if (fn.bodyOpenOffset === null || fn.bodyOpenOffset === undefined) continue;
		const nameIndex = tokenIndices.get(fn.offset);
		if (nameIndex === undefined || tokens[nameIndex + 1]?.value !== "(") continue;

		let depth = 0;
		for (let i = nameIndex + 1; i < tokens.length; i++) {
			if (tokens[i].value === "(") depth++;
			else if (tokens[i].value === ")") {
				depth--;
				if (depth === 0) {
					functionHeaderCloseTokens.add(i);
					break;
				}
			}
		}
	}

	const missing = [];
	const parens = [];
	const brackets = [];
	const braces = [];

	for (let line = 0; line < lines.length; line++) {
		const entries = tokensByLine[line];
		if (!entries.length) continue;
		if (ignoredPreprocessorLines.has(line)) continue;

		for (const entry of entries) {
			const value = entry.token.value;
			if (value === "(") parens.push(entry.index);
			else if (value === "[") brackets.push(entry.index);
			else if (value === "{") {
				const previous = tokens[entry.index - 1] ? tokens[entry.index - 1].value : "";
				const parentInitializer = braces.length > 0 && braces[braces.length - 1].isInitializer;
				braces.push({ index: entry.index, isInitializer: parentInitializer || previous === "=" || previous === "," });
			} else if (value === ")" && parens.length) parens.pop();
			else if (value === "]" && brackets.length) brackets.pop();
			else if (value === "}" && braces.length) braces.pop();
		}

		const lastEntry = entries[entries.length - 1];
		const last = lastEntry.token;
		const lastIndex = lastEntry.index;
		const value = last.value;

		if (value === ";" || value === "{" || value === ":") continue;
		if (value === "else" || value === "do") continue;
		if (CONTINUATION_TOKENS.has(value)) continue;

		// An unfinished parenthesized/bracketed/array-initializer expression continues below.
		const insideInitializer = braces.some(item => item.isInitializer);
		if (parens.length || brackets.length || insideInitializer) continue;

		// A brace that closes an array/aggregate initializer still needs a semicolon.
		if (value === "}") {
			if (initializerCloseTokens.has(lastIndex)) missing.push(last);
			continue;
		}

		if (value === ")") {
			const openIndex = matchingOpenByClose.get(lastIndex);
			if (openIndex !== undefined) {
				const controlWord = tokens[openIndex - 1]?.value;
				const doWhileTail = controlWord === "while" && tokens[openIndex - 2]?.value === "}";
				if (CONTROL_WORDS.has(controlWord) && !doWhileTail) continue;
			}
			if (functionHeaderCloseTokens.has(lastIndex)) continue;
		}

		// If the next physical line continues this expression with an operator or opener,
		// do not report the current line as a completed statement.
		const nextEntry = tokens[lastIndex + 1];
		if (nextEntry && nextEntry.line > line &&
			["(", "[", ".", "->", "+", "-", "*", "/", "%", "&&", "||", "==", "!=", "<", ">", "<=", ">=", "?", ":", ","].includes(nextEntry.value)) {
			continue;
		}

		missing.push(last);
	}

	return missing;
}

module.exports = { preprocessorLines, findForLoopIntDeclarations, findMissingSemicolonTokens };
