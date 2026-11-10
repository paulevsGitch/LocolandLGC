"use strict";

const CONTROL_WORDS = new Set([
	"if", "iff", "else", "while", "for", "do", "switch", "case", "return", "sizeof"
]);
const TYPE_WORDS = new Set(["int", "string", "char", "void"]);
const KEYWORDS = Object.freeze([
	"if", "else", "while", "for", "do", "switch", "case", "default",
	"break", "continue", "return", "static", "extern", "int", "string", "char", "void"
]);
const MULTI_OPERATORS = Object.freeze([
	"==", "!=", "<=", ">=", "++", "--", "&&", "||", "<<", ">>",
	"+=", "-=", "*=", "/=", "%=", "->"
]);

module.exports = {
	CONTROL_WORDS,
	TYPE_WORDS,
	KEYWORDS,
	MULTI_OPERATORS
};
