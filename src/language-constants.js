"use strict";

/**
 * Control-flow and declaration words that the parser must not treat as function names.
 * This set is intentionally narrower than `KEYWORDS`: it is used while recognizing
 * function declarations and calls in token streams.
 * @type {Set<string>}
 */
const CONTROL_WORDS = new Set([
	"if", "iff", "else", "while", "for", "do", "switch", "case", "return", "sizeof"
]);

/**
 * Primitive source types understood by the conservative semantic analyser.
 * `unknown` is not included because it is an internal analysis sentinel, not LGC syntax.
 * @type {Set<"int"|"string"|"char"|"void">}
 */
const TYPE_WORDS = new Set(["int", "string", "char", "void"]);

/**
 * Language words offered for syntax highlighting and completion.
 * This list describes observed LGC syntax; it does not imply full C compatibility.
 * @type {ReadonlyArray<string>}
 */
const KEYWORDS = Object.freeze([
	"if", "else", "while", "for", "do", "switch", "case", "default",
	"break", "continue", "return", "static", "extern", "int", "string", "char", "void"
]);

/**
 * Multi-character operators consumed as a single token by the semantic lexer.
 * Keep this list ordered/consistent with the lexer so longer operators are not split.
 * @type {ReadonlyArray<string>}
 */
const MULTI_OPERATORS = Object.freeze([
	"==", "!=", "<=", ">=", "++", "--", "&&", "||", "<<", ">>",
	"+=", "-=", "*=", "/=", "%=", "->"
]);

module.exports = { CONTROL_WORDS, TYPE_WORDS, KEYWORDS, MULTI_OPERATORS };
