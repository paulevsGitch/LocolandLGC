"use strict";

const assert = require("assert");
const { tokenize } = require("../src/lexer");
const { parseSyntax, resolveVariable } = require("../src/parser");
const { findVariableAt, variableReferenceTokens } = require("../src/refactor");
const { formatLgcText } = require("../src/formatter");
const { Lazy } = require("../src/lazy");
const { WorkspaceIndex } = require("../src/workspace-index");
const { parseDocument } = require("../src/document-model");

const source = [
	"void ScopeTest() {",
	"    int value;",
	"    value = 1;",
	"    { string value; value = \"inner\"; }",
	"    value = 2;",
	"}"
].join("\n");
const parsed = parseSyntax(source, { toString: () => "file:///scope.lgc" });
const outer = findVariableAt(parsed, "value", source.indexOf("value;"));
const innerOffset = source.indexOf("value;", source.indexOf("value;") + 1);
const inner = findVariableAt(parsed, "value", innerOffset);
assert(outer && inner && outer !== inner, "the parser must create distinct symbols for shadowed declarations");
assert.strictEqual(resolveVariable(parsed.variables, "value", source.indexOf("value = 2")).type, "int");
assert.strictEqual(variableReferenceTokens(parsed, outer).length, 3, "rename references must stay bound to the outer variable");
assert.strictEqual(variableReferenceTokens(parsed, inner).length, 2, "rename references must stay bound to the inner variable");

const lexical = 'string text = "brace } // content"; /* comment { */ int n = 1;';
assert(tokenize(lexical).some(token => token.type === "string" && token.value === '"brace } // content"'));
assert.strictEqual(formatLgcText(formatLgcText(source)), formatLgcText(source), "formatter output must be idempotent");

let calls = 0;
const lazy = new Lazy(() => ++calls);
assert.strictEqual(lazy.get(), 1);
assert.strictEqual(lazy.get(), 1);
assert.strictEqual(calls, 1, "lazy symbol maps must be evaluated once per snapshot");

async function verifyWorkspaceIndex() {
	const fileA = { toString: () => "file:///a.lgc" };
	const fileB = { toString: () => "file:///b.lgc" };
	const files = new Map([
		[fileA.toString(), Buffer.from("void SharedName() {}")],
		[fileB.toString(), Buffer.from("void SharedName() {}")]
	]);
	const vscode = {
		workspace: {
			textDocuments: [],
			getConfiguration() { return { get(_name, fallback) { return fallback; } }; },
			async findFiles() { return [fileA, fileB]; },
			fs: { async readFile(uri) { return files.get(uri.toString()); } },
			asRelativePath(uri) { return uri.toString(); }
		}
	};
	const index = new WorkspaceIndex(vscode, [], [], (text, uri, relative) =>
		parseDocument(text, uri, relative, []));
	await index.refresh();
	assert.strictEqual(index.workspaceFunctionEntries.get("SharedName").length, 2,
		"workspace indexing must preserve every same-name function declaration for collision analysis");
	assert(index.workspaceFunctions.has("SharedName"), "workspace index must retain a lookup-friendly function map");
	index.dispose();
}

verifyWorkspaceIndex().then(() => {
	console.log("Modular refactor smoke tests passed.");
}).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
