"use strict";

const assert = require("assert");
const functions = require("../data/functions.json");
const constants = require("../data/constants.json");
const { constantExpressionType } = require("../src/analyzer");

const allowedTypes = new Set(["int", "string", "char", "void", "unknown"]);
assert(Array.isArray(functions) && functions.length > 0, "function catalogue must be a non-empty array");
assert(Array.isArray(constants) && constants.length > 0, "constant catalogue must be a non-empty array");

for (const fn of functions) {
	assert.strictEqual(typeof fn.name, "string", "every function must have a name");
	assert(fn.name.length > 0, "function names must not be empty");
	assert(allowedTypes.has(fn.returnType), `${fn.name}: unsupported or missing returnType '${fn.returnType}'`);
	assert.strictEqual(typeof fn.signature, "string", `${fn.name}: signature documentation is required`);
	assert(fn.signature.startsWith(`${fn.name}(`), `${fn.name}: signature must match the function name`);
	assert.strictEqual(typeof fn.description, "string", `${fn.name}: English hover documentation is required`);
	assert(fn.description.trim().length > 0, `${fn.name}: description must not be empty`);
	assert(Array.isArray(fn.params), `${fn.name}: params must be an array`);
	for (const param of fn.params) {
		assert.strictEqual(typeof param.name, "string", `${fn.name}: every parameter must have a name`);
		assert(allowedTypes.has(param.type), `${fn.name}.${param.name}: unsupported or missing parameter type '${param.type}'`);
		assert.strictEqual(typeof param.optional, "boolean", `${fn.name}.${param.name}: optional must be boolean`);
	}
}

for (const constant of constants) {
	assert.strictEqual(typeof constant.name, "string", "every constant must have a name");
	assert(constant.name.length > 0, "constant names must not be empty");
	assert(constant.value !== undefined && constant.value !== null, `${constant.name}: constant value is required`);
	assert.strictEqual(typeof constant.description, "string", `${constant.name}: English hover documentation is required`);
	assert(constant.description.trim().length > 0, `${constant.name}: description must not be empty`);
	const rawValue = String(constant.value).trim();
	const expectedType = /^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')$/.test(rawValue)
		? (rawValue.startsWith('"') ? "string" : "char")
		: /^[+-]?(?:0[xX][0-9A-Fa-f]+|\d+(?:\.\d+)?)$/.test(rawValue) ? "int" : "unknown";
	const inferredType = constantExpressionType(constant);
	assert.strictEqual(inferredType, expectedType, `${constant.name}: literal value type inference must be consistent`);
}

const byName = new Map(functions.map(fn => [fn.name, fn]));
assert.strictEqual(byName.get("itoa")?.returnType, "string", "itoa must return string");
assert.strictEqual(byName.get("Sin")?.returnType, "int", "Sin must return int");
assert.strictEqual(byName.get("Sin")?.params?.[0]?.type, "int", "Sin angle parameter must be int");

const unknownReturns = functions.filter(fn => fn.returnType === "unknown").map(fn => fn.name);
console.log(`Catalogue metadata checks passed (${functions.length} functions, ${constants.length} constants).`);
if (unknownReturns.length) {
	console.log(`Return type remains unknown for ${unknownReturns.length} function(s) because the source does not provide enough evidence: ${unknownReturns.join(", ")}`);
}
