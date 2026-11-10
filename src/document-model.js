"use strict";

const { parseSyntax } = require("./parser");
const { inferFunctionReturnTypes } = require("./analyzer");
const { LgcFunction } = require("./models");

/**
 * Builds the complete syntax and semantic snapshot used by the language features.
 *
 * Parsing remains independent of VS Code. The caller supplies a URI display-path
 * resolver so the same pipeline can be used in tests and in the extension host.
 *
 * @param {string} text LGC source text.
 * @param {*} [uri] Source document URI.
 * @param {(uri: *) => string} [getRelativePath] Optional URI-to-workspace-path resolver.
 * @param {Array<object>} [functionCatalog] Bundled engine function catalogue.
 * @returns {import("./models").ParsedSource} Parsed and semantically enriched document.
 */
function parseDocument(text, uri, getRelativePath, functionCatalog = []) {
	const parsed = parseSyntax(text, uri, getRelativePath);
	inferFunctionReturnTypes(
		parsed.functions,
		parsed.tokens,
		parsed.variables,
		parsed.constants,
		functionCatalog
	);
	return parsed;
}

module.exports = { parseDocument };
