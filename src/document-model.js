"use strict";

const { parseSyntax } = require("./parser");
const { inferFunctionReturnTypes } = require("./analyzer");

/**
 * Builds the complete syntax and semantic snapshot consumed by language features.
 * Parsing and type inference remain independent of the VS Code extension host, allowing
 * exactly the same pipeline to run in unit tests and in the editor.
 *
 * @param {string} text LGC source text.
 * @param {*} [uri] Source document URI.
 * @param {(uri: *) => string} [getRelativePath] Optional URI-to-workspace-path resolver.
 * @param {Array<object>} [functionCatalog=[]] Bundled engine/helper function catalogue.
 * @returns {import("./models").ParsedSource} Parsed and semantically enriched source model.
 */
function parseDocument(text, uri, getRelativePath, functionCatalog = []) {
	const parsed = parseSyntax(text, uri, getRelativePath);
	inferFunctionReturnTypes(parsed.functions, parsed.tokens, parsed.variables, parsed.constants, functionCatalog);
	return parsed;
}
module.exports = { parseDocument };
