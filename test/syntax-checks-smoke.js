"use strict";

const assert = require("assert");
const { findForLoopIntDeclarations, findMissingSemicolonTokens } = require("../src/syntax-checks");

function tokenizeForTest(text) {
	const tokens = [];
	let line = 0;
	let i = 0;

	while (i < text.length) {
		const ch = text[i];
		if (ch === "\n") { line++; i++; continue; }
		if (/\s/.test(ch)) { i++; continue; }
		if (ch === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") i++;
			continue;
		}
		if (ch === "/" && text[i + 1] === "*") {
			i += 2;
			while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) {
				if (text[i] === "\n") line++;
				i++;
			}
			i = Math.min(text.length, i + 2);
			continue;
		}

		const start = i;
		const startLine = line;
		if (ch === "\"" || ch === "'") {
			const quote = ch;
			i++;
			while (i < text.length) {
				if (text[i] === "\\") { i += 2; continue; }
				if (text[i] === quote) { i++; break; }
				if (text[i] === "\n") line++;
				i++;
			}
			tokens.push({ type: quote === "\"" ? "string" : "char", value: text.slice(start, i), start, end: i, line: startLine });
			continue;
		}
		if (/[A-Za-z_]/.test(ch)) {
			i++;
			while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) i++;
			tokens.push({ type: "identifier", value: text.slice(start, i), start, end: i, line: startLine });
			continue;
		}
		if (/[0-9]/.test(ch)) {
			i++;
			while (i < text.length && /[0-9.]/.test(text[i])) i++;
			tokens.push({ type: "number", value: text.slice(start, i), start, end: i, line: startLine });
			continue;
		}

		const op = ["==", "!=", "<=", ">=", "&&", "||", "++", "--", "->"].find(item => text.startsWith(item, i));
		if (op) {
			i += op.length;
			tokens.push({ type: "operator", value: op, start, end: i, line: startLine });
		} else {
			i++;
			tokens.push({ type: "punctuation", value: ch, start, end: i, line: startLine });
		}
	}

	return tokens;
}

function missingLines(source, functions = []) {
	return findMissingSemicolonTokens(tokenizeForTest(source), source, { functions })
		.map(token => token.line + 1);
}

const forSource = [
	"for (int i = 0; i < 4; i++) {",
	"    Action(i);",
	"}",
	"// for (int ignored = 0; ignored < 1; ignored++)",
	"#define LOOP for (int macroIndex = 0; macroIndex < 1; macroIndex++) \\",
	"    macroIndex++",
	"string text = \"for (int alsoIgnored = 0;\";"
].join("\n");
const declarations = findForLoopIntDeclarations(tokenizeForTest(forSource), forSource);
assert.strictEqual(declarations.length, 1, "only a real int declaration in a for header should be detected");
assert.strictEqual(declarations[0].nameToken.value, "i");

const missingSource = [
	"#define FLAG 1",
	"int missingDeclaration = 1",
	"int validDeclaration = 2;",
	"void Update()",
	"{",
	"    Action(0)",
	"    if (validDeclaration > 0)",
	"    {",
	"        return validDeclaration",
	"    }",
	"    int wrapped = 1 +",
	"        2;",
	"    Action(",
	"        1, 2);",
	"    int values[] = {",
	"        1,",
	"        2",
	"    };",
	"}",
	"#define MULTILINE(x) \\",
	"    x + 1",
	"do { Action(1); } while (validDeclaration > 0)"
].join("\n");
const fakeFunction = {
	name: "Update",
	offset: tokenizeForTest(missingSource).find(token => token.value === "Update").start,
	bodyOpenOffset: missingSource.indexOf("{")
};
assert.deepStrictEqual(missingLines(missingSource, [fakeFunction]), [2, 6, 9, 22],
	"only completed statement lines should require semicolons; directives and headers are exempt");

const initializerMissing = "int values[] = {\n    1,\n    2\n}";
assert.deepStrictEqual(missingLines(initializerMissing), [4],
	"an initializer closing brace must be followed by a semicolon");

const nestedInitializer = "int values[] = {\n    {1, 2},\n    {3, 4}\n};";
assert.deepStrictEqual(missingLines(nestedInitializer), [],
	"nested initializer braces must not trigger a semicolon warning");

const doWhile = "do {\n    Action();\n} while (ready)";
assert.deepStrictEqual(missingLines(doWhile), [3],
	"a do-while tail requires its terminating semicolon");

console.log("LGC syntax-check smoke tests passed.");
