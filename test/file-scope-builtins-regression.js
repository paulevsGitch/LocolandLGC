"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const functionCatalog = require("../data/functions.json");
const { parseSyntax } = require("../src/parser");
const {
	analyzeDocument, findUnknownValueIdentifiers, parseIncludeDirectives, resolveVisibleFunction
} = require("../src/analyzer");

const fixtureDirectory = path.join(__dirname, "fixtures");
const exportText = fs.readFileSync(path.join(fixtureDirectory, "export.lgc"), "latin1");
const exportNames = new Set();
const exportPattern = /^\s*extern\s+([A-Za-z_]\w*)\s*\(/gm;
let exportMatch;
while ((exportMatch = exportPattern.exec(exportText)) !== null) exportNames.add(exportMatch[1]);

assert(exportNames.size >= 100, "the bundled regression fixture must contain the standard engine exports");
const missingEngineExports = [...exportNames].filter(name => !functionCatalog.some(fn => fn.name === name && typeof fn.id === "number"));
assert.deepStrictEqual(missingEngineExports, [], `all export.lgc functions must be globally indexed: ${missingEngineExports.join(", ")}`);
assert(functionCatalog.some(fn => fn.name === "GetVid"), "the bundled catalogue must retain the GetVid compatibility alias");
assert(functionCatalog.some(fn => fn.name === "SetVid"), "the bundled catalogue must retain the SetVid compatibility alias");

const vscode = {
	DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2 },
	Position: class Position { constructor(line, character) { this.line = line; this.character = character; } },
	Range: class Range { constructor(start, end) { this.start = start; this.end = end; } },
	Diagnostic: class Diagnostic { constructor(range, message, severity) { this.range = range; this.message = message; this.severity = severity; } },
	workspace: {
		getConfiguration() {
			return { get(key, fallback) {
				const values = {
					enabled: true,
					severity: "Warning",
					checkFunctionArity: false,
					checkArgumentTypes: false,
					checkAssignments: true,
					checkConstantInitializers: false,
					checkFunctionNameCollisions: false,
					checkForLoopIntDeclarations: false,
					checkSemicolons: false,
					strictUnknownFunctions: true,
					checkFunctionDeclarationOrder: true,
					checkUnknownVariables: true,
					checkUnknownTypes: true,
					checkRepeatedDeclarationTypes: true,
					checkStringAdditionTypes: true
				};
				return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback;
			} };
		}
	}
};

function verifyLevel(fileName, expectedGlobals) {
	const source = fs.readFileSync(path.join(fixtureDirectory, fileName), "latin1");
	const uri = { toString: () => `file:///lgc-regression/${fileName}` };
	const parsed = parseSyntax(source, uri, () => fileName);
	const functions = new Map(functionCatalog.map(fn => [fn.name, fn]));
	for (const fn of parsed.functions) functions.set(fn.name, fn);
	const noIncludeCall = { start: 0 };
	for (const name of exportNames) {
		assert(resolveVisibleFunction(name, noIncludeCall, parsed, functions, functionCatalog, new Map(), []),
			`${fileName}: standard export '${name}' must be globally visible without an include`);
	}
	for (const name of ["GetVid", "SetVid"]) {
		assert(resolveVisibleFunction(name, noIncludeCall, parsed, functions, functionCatalog, new Map(), []),
			`${fileName}: standard compatibility alias '${name}' must be globally visible without an include`);
	}
	const workspaceEntries = new Map();
	for (const fn of parsed.functions) {
		if (!workspaceEntries.has(fn.name)) workspaceEntries.set(fn.name, []);
		workspaceEntries.get(fn.name).push(fn);
	}

	for (const name of expectedGlobals) {
		const declarations = parsed.variables.get(name) || [];
		const global = declarations.find(item => item.scope && item.scope.depth === 0);
		assert(global, `${fileName}: '${name}' must be parsed as a file-scope variable`);
		assert.strictEqual(global.type, "int", `${fileName}: '${name}' must retain its int type`);
	}

	const includes = parseIncludeDirectives(source);
	const getVidCalls = [];
	for (let i = 0; i < parsed.tokens.length - 1; i++) {
		if (parsed.tokens[i].value === "GetVid" && parsed.tokens[i + 1].value === "(") getVidCalls.push(parsed.tokens[i]);
	}
	assert(getVidCalls.length > 0, `${fileName}: fixture must exercise the standard GetVid alias`);
	for (const call of getVidCalls) {
		assert(resolveVisibleFunction("GetVid", call, parsed, functions, functionCatalog, workspaceEntries, includes),
			`${fileName}: GetVid must resolve without an obsolete.lgc include`);
	}

	const unresolved = findUnknownValueIdentifiers(parsed.tokens, parsed, parsed.constants, functions, source);
	const fileScopeDeclarations = [...parsed.variables.values()].flat().filter(item => item.scope && item.scope.depth === 0);
	assert(fileScopeDeclarations.length >= expectedGlobals.length,
		`${fileName}: the parser must retain the file-scope variable table`);
	for (const declaration of fileScopeDeclarations) {
		const references = parsed.tokens.filter(token => token.value === declaration.name &&
			token.start !== declaration.token.start && token.start > declaration.token.start);
		for (const reference of references) {
			assert(!unresolved.some(token => token.start === reference.start),
				`${fileName}: reference to declared global '${declaration.name}' at line ${reference.line + 1} must not be unknown`);
		}
	}

	const document = {
		uri,
		getText: () => source,
		positionAt(offset) {
			const before = source.slice(0, offset);
			const line = before.split("\n").length - 1;
			return new vscode.Position(line, offset - before.lastIndexOf("\n") - 1);
		}
	};
	const diagnostics = analyzeDocument(vscode, document, parsed, functions, parsed.constants, workspaceEntries, functionCatalog);
	for (const call of getVidCalls) {
		assert(!diagnostics.some(item => item.code === "lgc.unknownFunction" && item.message.includes("GetVid")),
			`${fileName}: GetVid must not produce an unknown-function diagnostic`);
	}

	console.log(`${fileName}: ${fileScopeDeclarations.length} file-scope declarations and ${getVidCalls.length} global GetVid calls resolved`);
}

verifyLevel("l03.lgc", ["civil_train_type", "civil_train_x", "civil_train_y", "player_reinforcement_train"]);
verifyLevel("GolemFactory.lgc", ["music_turn", "start_time", "resource_pile", "was_cutscene", "is_cutscene", "map_state"]);
console.log("LGC file-scope and always-available API regression tests passed.");
