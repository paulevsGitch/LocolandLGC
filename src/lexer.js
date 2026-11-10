"use strict";

const { MULTI_OPERATORS } = require("./language-constants");
const { Token } = require("./models");

/**
 * Converts LGC source text into a flat token stream while preserving source offsets.
 * Whitespace and comments are skipped; literals, identifiers, numbers and operators are retained.
 * @param {string} text Complete LGC source text to tokenize.
 * @returns {Token[]} Tokens in source order. Line and offset values are zero-based.
 */
function tokenize(text) {
	const tokens = [];
	let i = 0;
	let line = 0;

	while (i < text.length) {
		const ch = text[i];
		if (ch === "\n") {
			line++;
			i++;
			continue;
		}
		if (/\s/.test(ch)) {
			i++;
			continue;
		}
		if (ch === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") i++;
			continue;
		}
		if (ch === "/" && text[i + 1] === "*") {
			i += 2;
			while (i < text.length) {
				if (text[i] === "\n") line++;
				if (text[i] === "*" && text[i + 1] === "/") {
					i += 2;
					break;
				}
				i++;
			}
			continue;
		}

		const start = i;
		const startLine = line;

		if (ch === '"' || ch === "'") {
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
				if (text[i] === "\n") line++;
				i++;
			}
			tokens.push(new Token(quote === '"' ? "string" : "char", text.slice(start, i), start, i, startLine));
			continue;
		}

		if (/[A-Za-z_]/.test(ch)) {
			i++;
			while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) i++;
			tokens.push(new Token("identifier", text.slice(start, i), start, i, startLine));
			continue;
		}

		if (/[0-9]/.test(ch)) {
			i++;
			if (ch === "0" && (text[i] === "x" || text[i] === "X")) {
				i++;
				while (i < text.length && /[0-9A-Fa-f]/.test(text[i])) i++;
			} else {
				while (i < text.length && /[0-9.]/.test(text[i])) i++;
			}
			tokens.push(new Token("number", text.slice(start, i), start, i, startLine));
			continue;
		}

		const op = MULTI_OPERATORS.find(candidate => text.startsWith(candidate, i));
		if (op) {
			i += op.length;
			tokens.push(new Token("operator", op, start, i, startLine));
			continue;
		}

		i++;
		tokens.push(new Token("punctuation", ch, start, i, startLine));
	}
	return tokens;
}

/**
 * Finds the closing token paired with an opening delimiter, accounting for nesting.
 * @param {Token[]} tokens Token stream to inspect.
 * @param {number} openIndex Index of the opening delimiter in `tokens`.
 * @param {string} openValue Opening delimiter, such as `(` or `{`.
 * @param {string} closeValue Matching closing delimiter, such as `)` or `}`.
 * @returns {number} Index of the matching closing token, or `-1` when no match exists.
 */
function findMatching(tokens, openIndex, openValue, closeValue) {
	let depth = 0;
	for (let i = openIndex; i < tokens.length; i++) {
		if (tokens[i].value === openValue) depth++;
		else if (tokens[i].value === closeValue) {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

module.exports = { tokenize, findMatching };
