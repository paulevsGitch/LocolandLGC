"use strict";

const assert = require("node:assert/strict");

const { Lazy } = require("../src/lazy");
const {
	Token,
	LgcFunction,
	LgcParameter,
	VariableDeclaration,
	Scope,
	LgcConstant,
	ParsedSource
} = require("../src/models");
const { tokenize } = require("../src/lexer");
const { parseDocument } = require("../src/document-model");
const { expressionType, areTypesCompatible } = require("../src/analyzer");
const { formatLgcText, scanTokens, FormatterToken, FormatterOptions } = require("../src/formatter");
const { DocumentCacheStore } = require("../src/document-cache");
const { WorkspaceIndex, createFunctionMap, createConstantMap } = require("../src/workspace-index");

const source = `
int Add(int left, int right) {
	int result = left + right;
	return result;
}

int GetAnswer() {
	return Add(20, 22);
}
`;

const parsed = parseDocument(source, { fsPath: "scripts/math.lgc" }, uri => uri.fsPath, []);
assert.ok(parsed instanceof ParsedSource);
assert.ok(parsed.tokens.every(token => token instanceof Token));
assert.ok(parsed.functions.every(fn => fn instanceof LgcFunction));
assert.ok(parsed.functions[0].params.every(param => param instanceof LgcParameter));
assert.ok([...parsed.variables.values()].flat().every(item => item instanceof VariableDeclaration));
assert.ok([...parsed.variables.values()].flat().every(item => item.scope instanceof Scope));
assert.equal(parsed.functions.find(fn => fn.name === "GetAnswer").returnType, "int");
assert.equal(expressionType(tokenize("1 + 2"), parsed.variables, new Map(), new Map()), "int");
assert.equal(areTypesCompatible("int", "char"), true);

const constant = new LgcConstant({ name: "MAX_VALUE", value: "100" });
const functionItem = new LgcFunction({
	name: "ExternalCall",
	params: [{ name: "value", type: "int" }],
	returnType: "int"
});
assert.ok(functionItem.params[0] instanceof LgcParameter);
assert.equal(createFunctionMap(parsed, [functionItem]).get("ExternalCall"), functionItem);
assert.equal(createConstantMap(new ParsedSource({ constants: new Map() }), [constant]).get("MAX_VALUE"), constant);

let lazyCalls = 0;
const lazy = new Lazy(() => {
	lazyCalls++;
	return undefined;
});
assert.equal(lazy.get(), undefined);
assert.equal(lazy.get(), undefined);
assert.equal(lazyCalls, 1);
lazy.reset();
lazy.get();
assert.equal(lazyCalls, 2);

const formatterTokens = scanTokens("int x = 1;");
assert.ok(formatterTokens.every(token => token instanceof FormatterToken));
assert.ok(new (FormatterOptions)({ indentSize: 4 }) instanceof FormatterOptions);
const onceFormatted = formatLgcText(source);
assert.equal(formatLgcText(onceFormatted), onceFormatted);

// A changed workspace generation must rebuild lazy symbol maps without reparsing the document.
let parseCalls = 0;
const fakeIndex = {
	version: 0,
	makeFunctionMap: () => new Map([["A", new LgcFunction({ name: "A" })]]),
	makeConstantMap: () => new Map()
};
const fakeVscode = { workspace: { asRelativePath: uri => uri.fsPath } };
const cacheStore = new DocumentCacheStore((text, uri) => {
	parseCalls++;
	return parseDocument(text, uri, u => u.fsPath, []);
}, fakeIndex, fakeVscode);
const document = {
	uri: { fsPath: "scripts/cache.lgc", toString() { return this.fsPath; } },
	version: 1,
	languageId: "lgc",
	getText() { return "int Cached() { return 1; }"; }
};
const entryA = cacheStore.get(document);
assert.equal(entryA.functionsMap.get().has("A"), true);
assert.equal(cacheStore.get(document), entryA);
fakeIndex.version++;
fakeIndex.makeFunctionMap = () => new Map([["B", new LgcFunction({ name: "B" })]]);
const entryB = cacheStore.get(document);
assert.notEqual(entryB, entryA);
assert.equal(entryB.functionsMap.get().has("B"), true);
assert.equal(parseCalls, 1);

console.log("LocolandLGC refactor smoke tests passed.");
