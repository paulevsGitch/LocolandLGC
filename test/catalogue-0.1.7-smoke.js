"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const functions = require("../data/functions.json");
const constants = require("../data/constants.json");
const globalVariables = require("../data/global-variables.json");

const allowedFunctionTypes = new Set(["int", "string", "char", "void", "unknown"]);
const allowedConstantTypes = new Set(["int", "string", "char", "function"]);
const requiredText = value => typeof value === "string" && value.trim().length > 0;

for (const fn of functions) {
	assert(requiredText(fn.name), "every function catalogue entry must have a name");
	assert(allowedFunctionTypes.has(fn.returnType), `${fn.name}: returnType must be explicit`);
	assert(requiredText(fn.signature), `${fn.name}: signature must be documented`);
	assert(requiredText(fn.description), `${fn.name}: English description must be present`);
	assert(requiredText(fn.source), `${fn.name}: original source must be present`);
	assert(Array.isArray(fn.params), `${fn.name}: params must be an array`);
	for (const param of fn.params) {
		assert(requiredText(param.name), `${fn.name}: every parameter must have a name`);
		assert(allowedFunctionTypes.has(param.type), `${fn.name}.${param.name}: parameter type must be explicit`);
		assert.strictEqual(typeof param.optional, "boolean", `${fn.name}.${param.name}: optionality must be explicit`);
	}
}

for (const constant of constants) {
	assert(requiredText(constant.name), "every constant must have a name");
	assert.strictEqual(typeof constant.value, "string", `${constant.name}: replacement value must be explicitly recorded (empty means context-dependent)`);
	assert(allowedConstantTypes.has(constant.type), `${constant.name}: constant type must be explicit`);
	assert(requiredText(constant.source), `${constant.name}: declaration source must be present`);
	assert(requiredText(constant.description), `${constant.name}: English description must be present`);
	if (constant.type === "function") {
		assert(/alias/i.test(constant.description), `${constant.name}: function-like constants must be documented as aliases`);
	}
}

for (const variable of globalVariables) {
	assert(requiredText(variable.name), "every global variable must have a name");
	assert(["int", "string", "char"].includes(variable.type), `${variable.name}: primitive type must be explicit`);
	assert.strictEqual(typeof variable.isArray, "boolean", `${variable.name}: array status must be explicit`);
	assert(requiredText(variable.source), `${variable.name}: declaration source must be present`);
	assert(requiredText(variable.description), `${variable.name}: English description must be present`);
}

const docs = ["FUNCTIONS.md", "CONSTANTS.md", "GLOBAL_VARIABLES.md"]
	.map(name => fs.readFileSync(path.join(__dirname, "..", "docs", name), "utf8"));
assert(docs.every(text => text.includes("| Description |")), "generated API references must expose English description columns");
assert(docs[0].includes(`**Entries:** ${functions.length}.`), "function reference count must match functions.json");
assert(docs[1].includes(`**Entries:** ${constants.length}.`), "constant reference count must match constants.json");
assert(docs[2].includes(`**Entries:** ${globalVariables.length}.`), "global-variable reference count must match global-variables.json");

console.log(`LGC 0.1.7 catalogue contracts passed (${functions.length} functions, ${constants.length} constants, ${globalVariables.length} globals).`);
