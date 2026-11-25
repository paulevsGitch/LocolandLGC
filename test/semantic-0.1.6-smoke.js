"use strict";

const assert = require("assert");
const { parseSyntax } = require("../src/parser");
const { analyzeDocument } = require("../src/analyzer");

const vscode = {
	DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2 },
	Position: class Position { constructor(line, character) { this.line = line; this.character = character; } },
	Range: class Range { constructor(start, end) { this.start = start; this.end = end; } },
	Diagnostic: class Diagnostic { constructor(range, message, severity) { this.range = range; this.message = message; this.severity = severity; } },
	workspace: {
		getConfiguration() {
			return { get(key, fallback) {
				const values = {
					enabled: true, severity: "Warning", checkFunctionArity: true,
					checkArgumentTypes: true, checkAssignments: true,
					checkConstantInitializers: false, checkFunctionNameCollisions: false,
					checkForLoopIntDeclarations: false, checkSemicolons: false,
					strictUnknownFunctions: true, checkFunctionDeclarationOrder: true,
					checkUnknownVariables: true, checkUnknownTypes: true,
					checkRepeatedDeclarationTypes: true, checkStringAdditionTypes: true
				};
				return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback;
			} };
		}
	}
};

function run(source, functionCatalog = [], workspaceFunctions = new Map()) {
	const uri = { toString: () => "file:///project/main.lgc" };
	const parsed = parseSyntax(source, uri, () => "main.lgc");
	const functions = new Map(functionCatalog.map(item => [item.name, item]));
	for (const [name, fn] of workspaceFunctions) functions.set(name, fn);
	for (const fn of parsed.functions) functions.set(fn.name, fn);
	const constants = parsed.constants;
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
	const entries = new Map([...workspaceFunctions].map(([name, fn]) => [name, [fn]]));
	const diagnostics = analyzeDocument(vscode, document, parsed, functions, constants, entries, functionCatalog);
	return { diagnostics, parsed };
}

const sinApi = { name: "Sin", id: 165, params: [{ name: "time", type: "int", optional: false }], returnType: "int", source: "export.lgc" };

let result = run("int a, int b;\n");
assert(result.diagnostics.some(item => item.code === "lgc.repeatedDeclaratorType"), "repeated type in declaration must be an error");

result = run("int Calculate(int a, int b) { return a + b; }\n");
assert(!result.diagnostics.some(item => item.code === "lgc.repeatedDeclaratorType"), "typed function parameters must not be mistaken for repeated variable declarators");

result = run("int time;\nvoid Test() { sin(time); }\n", [sinApi]);
assert(result.diagnostics.some(item => item.code === "lgc.unknownFunction" && item.message.includes("sin")), "function name lookup must be case-sensitive");

result = run("void Caller() { Later(); }\nvoid Later() {}\n");
assert(result.diagnostics.some(item => item.code === "lgc.functionUsedBeforeDeclaration"), "a function call before its declaration must be diagnosed");

result = run("#include \"helpers.lgc\"\nvoid Test() { Helper(); }\n", [], new Map([['Helper', { name: 'Helper', source: 'helpers.lgc', offset: 0, params: [], returnType: 'void' }]]));
assert(!result.diagnostics.some(item => item.code === "lgc.unknownFunction"), "a helper from a preceding include must be available");

result = run("bool enabled;\n");
assert(result.diagnostics.some(item => item.code === "lgc.unknownVariableType"), "unsupported variable type must be diagnosed");

result = run("void Test() { Sin(something); }\n", [sinApi]);
assert(result.diagnostics.some(item => item.code === "lgc.unknownVariable" && item.message.includes("something")), "undeclared function argument must be diagnosed");

result = run("int declared;\nvoid Test() { declared = 4; }\n");
assert(!result.diagnostics.some(item => item.code === "lgc.unknownVariable"), "declared variables must not be diagnosed as unknown at their use sites");

result = run("int a;\nvoid Test() { a = \"text\"; }\n");
assert(result.diagnostics.some(item => item.code === "lgc.assignmentTypeMismatch" && item.severity === vscode.DiagnosticSeverity.Error), "assignment type mismatch must be a hard error");

result = run("string a;\nint n;\nvoid Test() { a = \"text\" + n; }\n");
assert(result.diagnostics.some(item => item.code === "lgc.stringIntegerAddition"), "string plus integer must request itoa conversion");

const included = { name: "Helper", source: "helpers.lgc", offset: 10, uri: { toString: () => "file:///project/helpers.lgc" }, params: [], returnType: "void" };
result = run("#include \"helpers.lgc\"\nvoid Test() { Helper(); }\n", [], new Map([["Helper", included]]));
assert(!result.diagnostics.some(item => item.code === "lgc.unknownFunction"), "a preceding include must make its function visible");

result = run("void Test() { Helper(); }\n", [], new Map([["Helper", included]]));
assert(result.diagnostics.some(item => item.code === "lgc.unknownFunction"), "a workspace function without an include must not be globally visible");

console.log("LGC 0.1.6 semantic-analysis smoke tests passed.");
