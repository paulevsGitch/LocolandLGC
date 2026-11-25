"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const functions = require("../data/functions.json");
const constants = require("../data/constants.json");
const globalVariables = require("../data/global-variables.json");
const sources = require("../data/always-available-sources.json");
const readme = fs.readFileSync(path.join(__dirname, "../README.md"), "utf8");
const extension = fs.readFileSync(path.join(__dirname, "../src/extension.js"), "utf8");

const sourceKeys = new Set(sources.map(value => String(value).toLowerCase()));
assert.strictEqual(sources.length, 28, "header source list must include the transitive include closure");
assert.strictEqual(sourceKeys.size, sources.length, "header source list must not contain duplicates");
assert.strictEqual(functions.length, 452, "function catalogue should reflect the uploaded standard script archive");
assert.strictEqual(constants.length, 666, "constant catalogue should merge constants.json with header defines");
assert.strictEqual(globalVariables.length, 207, "global variable catalogue should contain every standard-header file-scope declaration and the seven shared train declarations");

const functionNames = new Set();
for (const item of functions) {
	assert(item.name && !functionNames.has(item.name), `duplicate or empty function name: ${item.name}`);
	functionNames.add(item.name);
	assert(item.source && sourceKeys.has(path.basename(item.source).toLowerCase()), `${item.name} has a non-header source`);
	assert(item.signature && item.signature.startsWith(`${item.name}(`), `${item.name} has no valid signature`);
	assert(item.description && item.description.trim(), `${item.name} has no English hover description`);
	assert(!/\\[1-9]/.test(item.description), `${item.name} has a malformed generated description`);
	assert(["int", "string", "char", "void", "unknown"].includes(item.returnType), `${item.name} has invalid return type`);
	for (const param of item.params || []) {
		assert(param.name, `${item.name} contains a parameter without a name`);
		assert(["int", "string", "char", "unknown"].includes(param.type), `${item.name}.${param.name} has invalid type`);
	}
}

const constantNames = new Set();
for (const item of constants) {
	assert(item.name && !constantNames.has(item.name), `duplicate or empty constant name: ${item.name}`);
	constantNames.add(item.name);
	assert(item.source && sourceKeys.has(path.basename(item.source).toLowerCase()), `${item.name} has a non-header source`);
	assert(typeof item.value === "string", `${item.name} value must be stored as text`);
	assert(item.description && item.description.trim(), `${item.name} has no English description`);
}

const globalNames = new Set();
for (const item of globalVariables) {
	assert(item.name && !globalNames.has(item.name), `duplicate or empty global variable name: ${item.name}`);
	globalNames.add(item.name);
	assert(["int", "string", "char"].includes(item.type), `${item.name} has invalid global variable type`);
	const globalSource = path.basename(item.source || "").toLowerCase();
	assert(item.source && (sourceKeys.has(globalSource) || globalSource === "trainstactdeclares.lgc"), `${item.name} has an unapproved global source`);
	assert(typeof item.isArray === "boolean", `${item.name} must declare whether it is an array`);
	assert(item.description && item.description.trim(), `${item.name} has no English description`);
}
for (const name of ["player_x", "player_y"]) {
	const item = globalVariables.find(entry => entry.name === name);
	assert(item && item.type === "int" && item.source.toLowerCase() === "reinforcement.lgc", `${name} must be a global int from reinforcement.lgc`);
}

const win = functions.find(item => item.name === "Win");
assert(win && win.source.toLowerCase() === "menuend.lgc", "Win must be included from menuend.lgc");
for (const alias of ["GetVid", "SetVid", "sprintf"]) {
	const entry = functions.find(item => item.name === alias);
	assert(entry && entry.source.toLowerCase() === "obsolete.lgc", `${alias} must be catalogued from its #define alias in obsolete.lgc`);
}
assert(extension.includes('fontWeight: "bold", color: "#569CD6"'), "define and catalogue constants must be bold blue");
assert(readme.includes("docs/FUNCTIONS.md") && readme.includes("docs/CONSTANTS.md"), "README must link to generated function and constant references");

console.log(`Catalogue audit passed: ${functions.length} functions, ${constants.length} constants, ${globalVariables.length} global variables, ${sources.length} standard-header sources.`);
