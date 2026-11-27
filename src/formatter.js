"use strict";

/**
 * Lexical formatter and configurable pretty-printer for Locoland Logic Script (LGC).
 * Formatting is independent from semantic analysis: it changes whitespace and brace layout
 * while preserving token order, literals, comments and preprocessor lines.
 *
 * @typedef {object} FormatterOptions
 * @property {"spaces"|"tabs"} indentStyle Character sequence used for each indentation level.
 * @property {number} indentSize Width of one indentation level when spaces are used.
 * @property {"sameLine"|"nextLine"} braceStyle Placement of opening braces.
 * @property {"control"|"always"|"never"} spaceBeforeParens Spacing before opening parentheses.
 * @property {boolean} spaceInsideParentheses Whether non-empty parentheses receive inner padding.
 * @property {boolean} spaceInsideBrackets Whether non-empty array brackets receive inner padding.
 * @property {boolean} spaceAroundOperators Whether operators are padded with spaces.
 * @property {boolean} spaceAfterComma Whether a space follows commas.
 * @property {boolean} spaceBeforeColon Whether a space precedes ternary colons.
 * @property {boolean} spaceAfterColon Whether a space follows ternary colons.
 * @property {number} blankLinesBetweenFunctions Number of blank lines between top-level blocks.
 * @property {boolean} preserveBlankLines Whether source blank lines are retained.
 * @property {number} maxBlankLines Maximum consecutive blank lines to retain.
 * @property {boolean} indentCaseLabels Whether `case`/`default` labels receive an extra indent.
 * @property {boolean} keepEmptyBlocksSingleLine Whether empty blocks remain `{}`.
 * @property {boolean} insertFinalNewline Whether formatted output ends with a newline.
 */

/**
 * @type {Readonly<object>}
 */
const DEFAULTS = Object.freeze({
	indentStyle: "spaces",
	indentSize: 4,
	braceStyle: "sameLine",
	spaceBeforeParens: "control",
	spaceInsideParentheses: false,
	spaceInsideBrackets: false,
	spaceAroundOperators: true,
	spaceAfterComma: true,
	spaceBeforeColon: true,
	spaceAfterColon: true,
	blankLinesBetweenFunctions: 1,
	preserveBlankLines: true,
	maxBlankLines: 1,
	indentCaseLabels: false,
	keepEmptyBlocksSingleLine: true,
	insertFinalNewline: true
});

/** @type {Set<string>} */
const CONTROL_PAREN_WORDS = new Set(["if", "iff", "for", "while", "switch", "catch"]);
/** @type {Set<string>} */
const WORD_LIKE = new Set(["identifier", "number", "string", "char", "preprocessor"]);
/** @type {Set<string>} */
const OPERATORS = new Set([
	"=", "+", "-", "*", "/", "%", "==", "!=", "<", ">", "<=", ">=",
	"&&", "||", "&", "|", "^", "<<", ">>", "+=", "-=", "*=", "/=", "%=",
	"?", "~", "!", "<<=", ">>=", "&=", "|=", "^="
]);
/** @type {Set<string>} */
const UNARY_OPERATORS = new Set(["+", "-", "!", "~", "*", "&", "++", "--"]);
/** @type {string[]} */
const MULTI_CHAR = ["<<=", ">>=", "==", "!=", "<=", ">=", "++", "--", "&&", "||", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "->", "&=", "|=", "^="];

/**
 * Scans source text into formatter tokens while retaining comments and preprocessor lines.
 * Unlike the semantic lexer, this scanner records line gaps for blank-line preservation.
 * @param {string} text Source text.
 * @returns {Array<{value:string, kind:string, start:number, end:number, line:number, blankLinesBefore:number}>} Formatter tokens in source order.
 */
function scanTokens(text) {
	const tokens = [];
	let i = 0;
	let line = 0;
	let lineStart = 0;
	let previousEnd = 0;

	while (i < text.length) {
		const ch = text[i];
		if (ch === "\r" || ch === "\n") {
			if (ch === "\r" && text[i + 1] === "\n") i += 2;
			else i++;
			line++;
			lineStart = i;
			continue;
		}
		if (/\s/.test(ch)) {
			i++;
			continue;
		}

		const start = i;
		const startLine = line;
		const prefix = text.slice(lineStart, i);
		let kind;

		if (ch === "#" && /^\s*$/.test(prefix)) {
			kind = "preprocessor";
			let continued;
			do {
				continued = false;
				while (i < text.length && text[i] !== "\n" && text[i] !== "\r") i++;
				const segment = text.slice(start, i).replace(/[\r\n]+$/, "");
				if (/\\\s*$/.test(segment) && i < text.length) {
					if (text[i] === "\r" && text[i + 1] === "\n") i += 2;
					else i++;
					line++;
					lineStart = i;
					continued = true;
				}
			} while (continued);
		} else if (ch === "/" && text[i + 1] === "/") {
			kind = "lineComment";
			while (i < text.length && text[i] !== "\n" && text[i] !== "\r") i++;
		} else if (ch === "/" && text[i + 1] === "*") {
			kind = "blockComment";
			i += 2;
			while (i < text.length) {
				if (text[i] === "\r" || text[i] === "\n") {
					if (text[i] === "\r" && text[i + 1] === "\n") i += 2;
					else i++;
					line++;
					lineStart = i;
					continue;
				}
				if (text[i] === "*" && text[i + 1] === "/") {
					i += 2;
					break;
				}
				i++;
			}
		} else if (ch === '"' || ch === "'") {
			kind = ch === '"' ? "string" : "char";
			const quote = ch;
			i++;
			while (i < text.length) {
				if (text[i] === "\\") {
					i += 2;
					continue;
				}
				if (text[i] === quote) {
					i++;
					break;
				}
				if (text[i] === "\r" || text[i] === "\n") {
					if (text[i] === "\r" && text[i + 1] === "\n") i += 2;
					else i++;
					line++;
					lineStart = i;
					continue;
				}
				i++;
			}
		} else if (/[A-Za-z_]/.test(ch)) {
			kind = "identifier";
			i++;
			while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) i++;
		} else if (/[0-9]/.test(ch)) {
			kind = "number";
			i++;
			if (ch === "0" && (text[i] === "x" || text[i] === "X")) {
				i++;
				while (i < text.length && /[0-9A-Fa-f]/.test(text[i])) i++;
			} else {
				while (i < text.length && /[0-9.]/.test(text[i])) i++;
			}
		} else {
			const operator = MULTI_CHAR.find(value => text.startsWith(value, i));
			if (operator) {
				kind = "operator";
				i += operator.length;
			} else {
				i++;
				kind = "punctuation";
			}
		}

		const tokenText = text.slice(start, i);
		const gap = text.slice(previousEnd, start);
		const newlineCount = (gap.match(/\r\n|\r|\n/g) || []).length;
		tokens.push({
			value: tokenText,
			kind,
			start,
			end: i,
			line: startLine,
			blankLinesBefore: Math.max(0, newlineCount - 1)
		});
		previousEnd = i;
	}
	return tokens;
}

/**
 * Merges custom formatting options with defaults and validates enum/numeric values.
 * @param {Partial<FormatterOptions>} [options={}] User overrides.
 * @returns {FormatterOptions} Complete normalized formatter configuration.
 */
function normalizeOptions(options = {}) {
	const result = { ...DEFAULTS, ...options };
	result.indentSize = Number.isFinite(Number(result.indentSize))
		? Math.min(8, Math.max(1, Math.trunc(Number(result.indentSize)))) : DEFAULTS.indentSize;
	result.blankLinesBetweenFunctions = Math.min(3, Math.max(0, Math.trunc(Number(result.blankLinesBetweenFunctions) || 0)));
	result.maxBlankLines = Math.min(5, Math.max(0, Math.trunc(Number(result.maxBlankLines) || 0)));
	if (!["spaces", "tabs"].includes(result.indentStyle)) result.indentStyle = DEFAULTS.indentStyle;
	if (!["sameLine", "nextLine"].includes(result.braceStyle)) result.braceStyle = DEFAULTS.braceStyle;
	if (!["control", "always", "never"].includes(result.spaceBeforeParens)) result.spaceBeforeParens = DEFAULTS.spaceBeforeParens;
	return result;
}

/**
 * Formats LGC source without reordering tokens or changing literal/comment contents.
 * The original newline convention is preserved; this is not a compiler or semantic refactorer.
 * @param {string} source LGC source text.
 * @param {Partial<FormatterOptions>} [rawOptions={}] Formatting overrides.
 * @returns {string} Formatted source text.
 */
function formatLgcText(source, rawOptions = {}) {
	if (typeof source !== "string" || source.length === 0) return source;
	const options = normalizeOptions(rawOptions);
	const eolMatch = source.match(/\r\n|\n|\r/);
	const eol = eolMatch ? eolMatch[0] : "\n";
	const tokens = scanTokens(source);
	if (tokens.length === 0) return options.insertFinalNewline ? eol : "";

	const unit = options.indentStyle === "tabs" ? "\t" : " ".repeat(options.indentSize);
	let output = "";
	let indent = 0;
	let parenDepth = 0;
	let bracketDepth = 0;
	let caseLabelPending = false;
	let caseLabelFrame = null;
	let ternaryPending = 0;
	let previous = null;
	const parenContexts = [];
	const braceContexts = [];
	let lastClosedParenContext = null;
	let lastWasTopLevelClose = false;

	/**
	 * @returns {boolean} Whether the trailing whitespace should be removed.
	 */
	const atLineStart = () => output.length === 0 || /[\r\n]$/.test(output);
	/**
	 * @returns {void} Appends the requested indentation or line break to the formatter output.
	 */
	const trimTrailingWhitespace = () => { output = output.replace(/[ \t]+$/g, ""); };
	/**
	 * @returns {number} Number of consecutive newline characters at the end of the output.
	 */
	const countTrailingNewlines = () => {
		const match = output.match(/(?:\r\n|\r|\n)+$/);
		return match ? (match[0].match(/\r\n|\r|\n/g) || []).length : 0;
	};
	/**
	 * @param {string} value Character or token value to test.
	 * @param {boolean} noIndent Whether the new line should omit indentation.
	 * @returns {void} Appends the requested indentation or line break to the formatter output.
	 */
	const write = (value, noIndent = false) => {
		if (!value) return;
		if (atLineStart() && !noIndent && !/^[\r\n]/.test(value)) {
			output += unit.repeat(Math.max(0, indent));
		}
		output += value;
	};
	/**
	 * @returns {void} Appends the requested indentation or line break to the formatter output.
	 */
	const space = () => {
		if (output.length && !/[\s]$/.test(output)) output += " ";
	};
	/**
	 * @param {number} count Number of indentation units to append.
	 * @returns {void} Appends the requested indentation or line break to the formatter output.
	 */
	const newline = (count = 1) => {
		trimTrailingWhitespace();
		if (!output) return;
		const existing = countTrailingNewlines();
		const needed = Math.max(0, count - existing);
		if (needed) output += eol.repeat(needed);
	};
	/**
	 * @param {object} token Formatter token with its lexical kind and source value.
	 * @returns {void} Appends the requested indentation or line break to the formatter output.
	 */
	const preserveBlankLines = token => {
		if (!options.preserveBlankLines || !atLineStart() || !previous) return;
		const count = Math.min(options.maxBlankLines, token.blankLinesBefore || 0);
		if (count + 1 > countTrailingNewlines()) newline(count + 1);
	};
	/**
	 * @param {object} token Formatter token with its lexical kind and source value.
	 * @returns {boolean} Whether the trailing whitespace should be removed.
	 */
	const isWordLike = token => token && WORD_LIKE.has(token.kind);
	/**
	 * @param {number} index Token index to inspect.
	 * @returns {boolean} Whether the trailing whitespace should be removed.
	 */
	const isUnary = index => {
		const before = tokens[index - 1];
		if (!before) return true;
		return before.value === "(" || before.value === "[" || before.value === "{" ||
			before.value === "," || before.value === ";" || before.value === ":" ||
			before.value === "?" || OPERATORS.has(before.value) ||
			["return", "case"].includes(before.value);
	};
	/**
	 * @param {object} left Previous formatter token.
	 * @param {object} right Next formatter token.
	 * @returns {boolean} Whether the trailing whitespace should be removed.
	 */
	const needsSpaceBetweenWords = (left, right) => isWordLike(left) && isWordLike(right);

	for (let index = 0; index < tokens.length; index++) {
		const token = tokens[index];
		const value = token.value;
		const next = tokens[index + 1];
		preserveBlankLines(token);

		if (token.kind === "preprocessor") {
			if (!atLineStart()) newline();
			write(value, true);
			newline();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (token.kind === "lineComment") {
			if (!atLineStart()) space();
			write(value);
			newline();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (token.kind === "blockComment") {
			if (!atLineStart()) space();
			write(value);
			if (/[\r\n]$/.test(value)) trimTrailingWhitespace();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "{") {
			const isEmpty = options.keepEmptyBlocksSingleLine && next && next.value === "}";
			if (isEmpty) {
				if (options.braceStyle === "nextLine") {
					if (previous && !atLineStart()) newline();
				} else if (previous && !atLineStart()) {
					space();
				}
				write("{}");
				index++;
				previous = tokens[index];
				lastWasTopLevelClose = indent === 0;
				const afterEmptyBlock = tokens[index + 1];
				if (afterEmptyBlock && afterEmptyBlock.value === "else" && options.braceStyle === "nextLine") newline();
				else if (lastWasTopLevelClose && afterEmptyBlock) newline(options.blankLinesBetweenFunctions + 1);
				continue;
			}
			if (options.braceStyle === "nextLine") {
				if (!atLineStart()) newline();
			} else if (previous && !atLineStart()) {
				space();
			}
			write("{");
			braceContexts.push({ isSwitch: lastClosedParenContext === "switch", caseBodyExtraIndent: false });
			lastClosedParenContext = null;
			indent++;
			newline();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "}") {
			if (previous && previous.value !== "{" && !atLineStart()) newline();
			const closingBraceContext = braceContexts.pop();
			if (closingBraceContext && closingBraceContext.isSwitch && closingBraceContext.caseBodyExtraIndent) {
				indent = Math.max(0, indent - 1);
			}
			indent = Math.max(0, indent - 1);
			write("}");
			const isTopLevelClose = indent === 0;
			if (next && next.value === "else" && options.braceStyle === "nextLine") {
				newline();
			} else if (next && (["else", "while", ";", ",", ")", "]"].includes(next.value) ||
				((next.kind === "lineComment" || next.kind === "blockComment") && next.line === token.line))) {
				if (["else", "while"].includes(next.value) || next.kind === "lineComment" || next.kind === "blockComment") space();
			} else {
				newline(isTopLevelClose && next ? options.blankLinesBetweenFunctions + 1 : 1);
			}
			previous = token;
			lastWasTopLevelClose = isTopLevelClose;
			continue;
		}

		if (value === "(") {
			const prevValue = previous ? previous.value : "";
			parenContexts.push(prevValue);
			lastClosedParenContext = null;
			const shouldSpace = options.spaceBeforeParens === "always" ||
				(options.spaceBeforeParens === "control" && CONTROL_PAREN_WORDS.has(prevValue));
			if (shouldSpace) space();
			else if (previous && previous.value === "return") space();
			write("(");
			parenDepth++;
			if (options.spaceInsideParentheses && next && next.value !== ")") space();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === ")") {
			if (options.spaceInsideParentheses && previous && previous.value !== "(") space();
			write(")");
			lastClosedParenContext = parenContexts.pop() || null;
			parenDepth = Math.max(0, parenDepth - 1);
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "[") {
			if (previous && (isWordLike(previous) || [")", "]"].includes(previous.value))) {
				// Array indexing stays attached to the preceding expression.
			}
			write("[");
			bracketDepth++;
			if (options.spaceInsideBrackets && next && next.value !== "]") space();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "]") {
			if (options.spaceInsideBrackets && previous && previous.value !== "[") space();
			write("]");
			bracketDepth = Math.max(0, bracketDepth - 1);
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === ";") {
			write(";");
			if (parenDepth > 0 || (next && (next.kind === "lineComment" || next.kind === "blockComment") && next.line === token.line)) space();
			else newline();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === ",") {
			write(",");
			if (options.spaceAfterComma && next && ![")", "]", "}"].includes(next.value)) space();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === ":") {
			const isTernaryColon = ternaryPending > 0;
			if (isTernaryColon && options.spaceBeforeColon) space();
			write(":");
			if (isTernaryColon) {
				ternaryPending--;
				if (options.spaceAfterColon) space();
			} else {
				if (caseLabelPending && caseLabelFrame) {
					indent++;
					if (options.indentCaseLabels) caseLabelFrame.caseBodyExtraIndent = true;
				}
				caseLabelPending = false;
				caseLabelFrame = null;
				newline();
			}
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "?") {
			if (options.spaceAroundOperators) space();
			write("?");
			ternaryPending++;
			if (options.spaceAroundOperators) space();
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "." || value === "->") {
			write(value);
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "++" || value === "--") {
			if (isUnary(index)) write(value);
			else write(value);
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (OPERATORS.has(value)) {
			const previousIsType = previous && ["int", "string", "char", "void"].includes(previous.value);
			const isPointerDeclarator = value === "*" && previousIsType && next && next.kind === "identifier";
			const unary = UNARY_OPERATORS.has(value) && isUnary(index);
			if (isPointerDeclarator) {
				if (options.spaceAroundOperators) space();
				write(value);
			} else if (unary) {
				if (["!", "~", "++", "--"].includes(value)) {
					if (previous && isWordLike(previous)) space();
				} else if (previous && [")", "]"].includes(previous.value)) {
					space();
				}
				write(value);
			} else {
				if (options.spaceAroundOperators) space();
				write(value);
				if (options.spaceAroundOperators) space();
			}
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "else") {
			if (previous && !atLineStart()) space();
			write(value);
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "case" || value === "default") {
			const switchFrame = [...braceContexts].reverse().find(frame => frame.isSwitch) || null;
			if (switchFrame && switchFrame.caseBodyExtraIndent) {
				indent = Math.max(0, indent - 1);
				switchFrame.caseBodyExtraIndent = false;
			}
			if (!options.indentCaseLabels && switchFrame && indent > 0) indent--;
			if (!atLineStart()) newline();
			write(value);
			caseLabelPending = Boolean(switchFrame);
			caseLabelFrame = switchFrame;
			previous = token;
			lastWasTopLevelClose = false;
			continue;
		}

		if (value === "}" || value === "{" || value === ")" || value === "]") {
			write(value);
			previous = token;
			continue;
		}

		if (previous && previous.kind === "blockComment") space();
		else if (needsSpaceBetweenWords(previous, token)) space();
		else if (previous && [")", "]"].includes(previous.value) && isWordLike(token)) space();
		else if (previous && previous.value === "}" && isWordLike(token)) space();
		else if (previous && previous.value === "else") space();
		else if (previous && previous.value === "return") space();
		else if (previous && previous.value === "=" && !options.spaceAroundOperators) {
			// No action: compact operator mode intentionally keeps expressions tight.
		}
		write(value);
		previous = token;
		lastWasTopLevelClose = false;
	}

	trimTrailingWhitespace();
	output = output.replace(/\r\n|\r|\n/g, "\n").replace(/\n/g, eol);
	output = output.replace(/(?:\r\n|\r|\n)+$/, "");
	if (options.insertFinalNewline) output += eol;
	return output;
}

module.exports = {
	DEFAULTS,
	scanTokens,
	normalizeOptions,
	formatLgcText
};