"use strict";

/**
 * @type {Set<string>}
 */
const CONTINUATION_TOKENS = new Set([
	",", ".", "=", "+", "-", "*", "/", "%", "&", "|", "^", "!", "~",
	"<", ">", "<=", ">=", "==", "!=", "&&", "||", "?", "(", "[", "->"
]);

/** @type {typeof import("./language-constants")} */
const { CONTROL_WORDS } = require("./language-constants");

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



/**
 * Finds top-level commas used as separators in a `for` header where LGC requires
 * semicolons. Commas nested inside function calls, array indices or grouped
 * expressions are not considered separators.
 *
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Complete source text, used to skip preprocessor directives.
 * @returns {import("./models").Token[]} Invalid top-level comma separator tokens.
 */
function findForLoopSeparatorErrors(tokens, sourceText = "") {
	const invalid = [];
	const ignoredLines = sourceText ? preprocessorLines(tokens, sourceText) : new Set();
	for (let i = 0; i < tokens.length - 1; i++) {
		if (tokens[i].value !== "for" || ignoredLines.has(tokens[i].line) || tokens[i + 1]?.value !== "(") continue;
		let paren = 1, bracket = 0, brace = 0;
		const commas = [];
		let semicolons = 0;
		for (let j = i + 2; j < tokens.length && paren > 0; j++) {
			const value = tokens[j].value;
			if (value === "(") paren++;
			else if (value === ")") paren--;
			else if (value === "[") bracket++;
			else if (value === "]") bracket = Math.max(0, bracket - 1);
			else if (value === "{") brace++;
			else if (value === "}") brace = Math.max(0, brace - 1);
			else if (paren === 1 && bracket === 0 && brace === 0) {
				if (value === ",") commas.push(tokens[j]);
				else if (value === ";") semicolons++;
			}
		}
		// A normal LGC for header has two top-level semicolons. A comma at
		// this level is almost always a mistaken separator in this language.
		if (commas.length && semicolons < 2) invalid.push(...commas);
	}
	return invalid;
}

/**
 * Finds adjacent assignment operators such as `value = = expression`.
 * Equality operators are emitted as a single `==` token and remain valid.
 *
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Complete source text, used to skip preprocessor directives.
 * @returns {import("./models").Token[]} The second standalone equals token in each invalid run.
 */
function findRepeatedAssignmentTokens(tokens, sourceText = "") {
	const invalid = [];
	const ignoredLines = sourceText ? preprocessorLines(tokens, sourceText) : new Set();
	for (let i = 0; i < tokens.length - 1; i++) {
		if (ignoredLines.has(tokens[i].line)) continue;
		if (tokens[i].value !== "=") continue;
		const next = tokens[i + 1];
		if (next && !ignoredLines.has(next.line) && (next.value === "=" || next.value === "==")) {
			invalid.push(next);
			i++;
		}
	}
	return invalid;
}

/**
 * Builds the active preprocessor branch path at a source offset. Declarations in
 * opposite branches of the same conditional are mutually exclusive and are not
 * considered duplicate declarations.
 *
 * @param {string} sourceText Complete source text.
 * @param {number} offset Source offset.
 * @returns {Array<{id:number, branch:number}>} Active conditional branch path.
 */
function preprocessorBranchPath(sourceText, offset) {
	const stack = [];
	let lineOffset = 0;
	for (const line of sourceText.split(/\r?\n/)) {
		if (lineOffset >= offset) break;
		const directive = line.match(/^\s*#\s*(if|ifdef|ifndef|elif|else|endif)\b/);
		if (directive) {
			const kind = directive[1];
			if (["if", "ifdef", "ifndef"].includes(kind)) stack.push({ id: lineOffset, branch: 0 });
			else if (kind === "elif" || kind === "else") {
				if (stack.length) stack[stack.length - 1].branch++;
			} else if (kind === "endif" && stack.length) stack.pop();
		}
		lineOffset += line.length + 1;
	}
	return stack;
}

/**
 * Returns whether two declarations are located in mutually exclusive preprocessor branches.
 *
 * @param {Array<{id:number, branch:number}>} left First declaration branch path.
 * @param {Array<{id:number, branch:number}>} right Second declaration branch path.
 * @returns {boolean} True when both paths select different branches of one conditional.
 */
function mutuallyExclusiveBranches(left, right) {
	const rightById = new Map(right.map(item => [item.id, item.branch]));
	return left.some(item => rightById.has(item.id) && rightById.get(item.id) !== item.branch);
}

/**
 * Finds repeated variable declarations in the same lexical scope and repeated
 * object-like or function-like `#define` names in the same preprocessor branch.
 * Shadowing in nested scopes and mutually exclusive preprocessor alternatives remain valid.
 *
 * @param {import("./models").ParsedSource} parsed Parsed source with scoped declarations.
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Complete source text.
 * @returns {Array<{name:string, kind:"variable"|"constant", token:import("./models").Token}>} Duplicate declarations after the first declaration.
 */
function findDuplicateDeclarationTokens(parsed, tokens, sourceText) {
	const duplicates = [];
	for (const [name, declarations] of parsed.variables || []) {
		const byScope = new Map();
		for (const declaration of declarations) {
			if (!declaration.token) continue;
			const scopeKey = declaration.scope || "<file-scope>";
			if (!byScope.has(scopeKey)) byScope.set(scopeKey, []);
			byScope.get(scopeKey).push(declaration);
		}
		for (const scopedDeclarations of byScope.values()) {
			scopedDeclarations.sort((left, right) => left.token.start - right.token.start);
			const seen = [];
			for (const declaration of scopedDeclarations) {
				const branch = preprocessorBranchPath(sourceText, declaration.token.start);
				const previous = seen.find(item => !mutuallyExclusiveBranches(item.branch, branch));
				if (previous) duplicates.push({ name, kind: "variable", token: declaration.token });
				else seen.push({ declaration, branch });
			}
		}
	}

	const tokenByStart = new Map(tokens.map(token => [token.start, token]));
	const definePattern = /^\s*#\s*define\s+([A-Za-z_]\w*)/gm;
	const seenDefines = new Map();
	let match;
	while ((match = definePattern.exec(sourceText)) !== null) {
		const name = match[1];
		const nameOffset = match.index + match[0].lastIndexOf(name);
		const token = tokenByStart.get(nameOffset);
		if (!token) continue;
		const branch = preprocessorBranchPath(sourceText, nameOffset);
		const previous = (seenDefines.get(name) || []).find(item => !mutuallyExclusiveBranches(item.branch, branch));
		if (previous) duplicates.push({ name, kind: "constant", token });
		else {
			if (!seenDefines.has(name)) seenDefines.set(name, []);
			seenDefines.get(name).push({ branch });
		}
	}
	return duplicates;
}

module.exports = {
	preprocessorLines,
	findForLoopIntDeclarations,
	findMissingSemicolonTokens,
	findForLoopSeparatorErrors,
	findRepeatedAssignmentTokens,
	findDuplicateDeclarationTokens,
	preprocessorBranchPath,
	mutuallyExclusiveBranches
};