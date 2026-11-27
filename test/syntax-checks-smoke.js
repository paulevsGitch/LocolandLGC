"use strict";

const assert = require("assert");
const {
	findForLoopIntDeclarations,
	findMissingSemicolonTokens,
	findForLoopSeparatorErrors,
	findRepeatedAssignmentTokens,
	findDuplicateDeclarationTokens
} = require("../src/syntax-checks");
const { tokenize } = require("../src/lexer");
const { parseSyntax } = require("../src/parser");
const { analyzeDocument } = require("../src/analyzer");

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

const iffHeader = "void Test() {\n    iff(ready)\n    {\n        Action();\n    }\n}";
const iffFunction = {
	name: "Test",
	offset: tokenizeForTest(iffHeader).find(token => token.value === "Test").start,
	bodyOpenOffset: iffHeader.indexOf("{")
};
assert.deepStrictEqual(missingLines(iffHeader, [iffFunction]), [],
	"LGC iff control-flow headers must not be reported as missing semicolons");

const doWhile = "do {\n    Action();\n} while (ready)";
assert.deepStrictEqual(missingLines(doWhile), [3],
	"a do-while tail requires its terminating semicolon");



// Version 0.1.7 syntax/semantic regressions are also exercised through the same
// analyzer entry point used by the extension, not only through helper functions.
const vscode = {
	DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2 },
	Position: class Position { constructor(line, character) { this.line = line; this.character = character; } },
	Range: class Range { constructor(start, end) { this.start = start; this.end = end; } },
	Diagnostic: class Diagnostic { constructor(range, message, severity) { this.range = range; this.message = message; this.severity = severity; } },
	workspace: {
		getConfiguration() {
			return { get(_key, fallback) { return fallback; } };
		}
	}
};

function analyze(source, functionCatalog = []) {
	const uri = { toString: () => "file:///syntax-check-regression.lgc" };
	const parsed = parseSyntax(source, uri, () => "syntax-check-regression.lgc");
	const functions = new Map(functionCatalog.map(item => [item.name, item]));
	for (const fn of parsed.functions) functions.set(fn.name, fn);
	const document = {
		uri,
		languageId: "lgc",
		getText: () => source,
		positionAt(offset) {
			const before = source.slice(0, offset);
			const line = before.split("\n").length - 1;
			const lastNewline = before.lastIndexOf("\n");
			return new vscode.Position(line, offset - lastNewline - 1);
		}
	};
	return { parsed, diagnostics: analyzeDocument(vscode, document, parsed, functions, parsed.constants, new Map(), functionCatalog) };
}

const commaForSource = "void Test() { for (x = 0, x < 50, x++) { Action(x); } }";
const commaForTokens = tokenize(commaForSource);
assert.strictEqual(findForLoopSeparatorErrors(commaForTokens, commaForSource).length, 2,
	"top-level commas in a for header must be reported as invalid separators");
let result = analyze(commaForSource);
assert(result.diagnostics.some(item => item.code === "lgc.invalidForLoopSeparator" && item.severity === vscode.DiagnosticSeverity.Error),
	"comma-separated for-loop clauses must produce an error diagnostic");
result = analyze("void Test() { int x; for (x = 0; x < 50; x++) { Action(x); } }");
assert(!result.diagnostics.some(item => item.code === "lgc.invalidForLoopSeparator"),
	"the valid semicolon-separated for-loop header must remain accepted");

const duplicateSource = [
	"int x;",
	"int x;",
	"#define LIMIT 10",
	"#define LIMIT 20",
	"void SeparateScope() { int x; }",
	"void NestedScope() { int y; { int y; } }"
].join("\n");
result = analyze(duplicateSource);
assert(result.diagnostics.some(item => item.code === "lgc.duplicateDeclaration" && item.message.includes("variable declaration 'x'")),
	"a repeated variable declaration in the same scope must be an error");
const defineOverride = result.diagnostics.find(item => item.code === "lgc.duplicateDeclaration" &&
	item.message.includes("Constant 'LIMIT' is redefined"));
assert(defineOverride && defineOverride.severity === vscode.DiagnosticSeverity.Warning,
	"a repeated #define constant in the same preprocessor branch must be a warning because the last value wins");
assert(result.diagnostics.some(item => item.code === "lgc.duplicateDeclaration" &&
	item.message.includes("variable declaration 'x'") && item.severity === vscode.DiagnosticSeverity.Error),
	"repeated variable declarations must remain errors");
assert(!result.diagnostics.some(item => item.code === "lgc.duplicateDeclaration" && item.message.includes("variable declaration 'y'")),
	"a declaration that shadows a variable in a nested lexical scope must remain valid");

const branchDuplicateSource = [
	"#ifdef FEATURE_A",
	"#define MODE 1",
	"#else",
	"#define MODE 2",
	"#endif"
].join("\n");
result = analyze(branchDuplicateSource);
assert(!result.diagnostics.some(item => item.code === "lgc.duplicateDeclaration"),
	"same-named constants in mutually exclusive preprocessor branches must remain valid");

const repeatedEqualsSource = "void Test() { int dx; dx =  = MapSizeX() / 2; }";
assert.strictEqual(findRepeatedAssignmentTokens(tokenize(repeatedEqualsSource), repeatedEqualsSource).length, 1,
	"a spaced repeated assignment operator must be detected once");
result = analyze(repeatedEqualsSource);
assert(result.diagnostics.some(item => item.code === "lgc.repeatedAssignmentOperator" && item.severity === vscode.DiagnosticSeverity.Error),
	"adjacent assignment operators must produce an error diagnostic");
result = analyze("void Test() { int dx; dx = MapSizeX() == 0; } ");
assert(!result.diagnostics.some(item => item.code === "lgc.repeatedAssignmentOperator"),
	"the equality comparison operator must not be mistaken for repeated assignment");

const requiredFunction = {
	name: "NeedsRequiredArgument",
	returnType: "void",
	params: [{ name: "value", type: "int", optional: false }],
	signature: "NeedsRequiredArgument(int value)",
	source: "export.lgc",
	external: true
};
result = analyze("void Test() { NeedsRequiredArgument(); }", [requiredFunction]);
const missingArgument = result.diagnostics.find(item => item.message.includes("NeedsRequiredArgument expects"));
assert(missingArgument && missingArgument.severity === vscode.DiagnosticSeverity.Error,
	"calls missing required arguments must be errors rather than warnings");

console.log("LGC syntax-check smoke tests passed.");
