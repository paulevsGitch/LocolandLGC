"use strict";

/**
 * Collects names which should receive the bold blue define-constant decoration.
 * @param {string} sourceText Current LGC source.
 * @param {Array<object>} constantCatalog Engine and standard-header constants.
 * @param {Map<string, object>} workspaceConstants Workspace #define map.
 * @returns {Set<string>} Constant and macro names.
 */
function collectDefinedNames(sourceText, constantCatalog = [], workspaceConstants = new Map()) {
	const names = new Set();
	for (const item of constantCatalog) {
		if (item && item.name) names.add(item.name);
	}
	for (const name of workspaceConstants.keys()) names.add(name);
	const pattern = /^[\t ]*#[\t ]*define[\t ]+([A-Za-z_]\w*)/gm;
	let match;
	while ((match = pattern.exec(sourceText)) !== null) names.add(match[1]);
	return names;
}

/**
 * Finds identifier-token source ranges matching a known macro/constant name.
 * @param {Array<{type:string,value:string,start:number,end:number}>} tokens Semantic tokens.
 * @param {Set<string>} names Known macro and constant names.
 * @returns {Array<{start:number,end:number}>} Ranges to render in bold.
 */
function findDefinedIdentifierRanges(tokens, names) {
	const result = [];
	for (const token of tokens) {
		if (token.type === "identifier" && names.has(token.value)) result.push({ start: token.start, end: token.end });
	}
	return result;
}

module.exports = { collectDefinedNames, findDefinedIdentifierRanges };
