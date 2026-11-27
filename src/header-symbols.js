"use strict";

/**
 * @type {ReadonlyArray<string>}
 */
const HEADER_SOURCE_FILES = require("../data/always-available-sources.json");
/** @type {Set<string>} */
const HEADER_SOURCE_KEYS = new Set(HEADER_SOURCE_FILES.map(normalizeLgcSource));

/**
 * Normalises a catalogue source path to its case-insensitive file name.
 * The game may store scripts under `maps/script`, while catalogues keep original basenames.
 * @param {string} source Catalogue source field.
 * @returns {string} Normalised lower-case basename.
 */
function normalizeLgcSource(source) {
	const parts = String(source || "").replace(/\\/g, "/").split("/").filter(Boolean);
	return (parts[parts.length - 1] || "").toLowerCase();
}

/**
 * Returns whether a source is part of the transitive include closure of standard `header.lgc`.
 * Availability is based exclusively on source metadata, never on function names or numeric IDs.
 * @param {string} source Function, constant or variable source metadata.
 * @returns {boolean} Whether the source is loaded by the standard header.
 */
function isAlwaysAvailableSource(source) {
	const value = String(source || "").replace(/\\/g, "/").toLowerCase();
	const basename = normalizeLgcSource(source);
	if (!HEADER_SOURCE_KEYS.has(basename)) return false;
	// Catalogue metadata stores basenames. Indexed workspace paths must point into
	// the game's standard script directory; an unrelated custom/export.lgc is not global.
	return !value.includes("/") || value.includes("/maps/script/") || value.startsWith("maps/script/");
}

module.exports = { HEADER_SOURCE_FILES, normalizeLgcSource, isAlwaysAvailableSource };