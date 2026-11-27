"use strict";

/** @type {typeof import("./models")} */
const { DocumentCache } = require("./models");

/**
 * Removes every cached document snapshot.
 * The parsed syntax is reused when only the workspace index changes; merged function and
 * constant maps are created lazily against the current index generation.
 */
class DocumentCacheStore {
	/**
	 * @param {(text: string, uri: *, getRelativePath: Function) => import("./models").ParsedSource} parseDocumentFn Parser pipeline.
	 * @param {*} workspaceIndex Workspace index exposing symbol-map factories and a generation counter.
	 * @param {*} vscode VS Code API namespace.
	 */
	constructor(parseDocumentFn, workspaceIndex, vscode) {
		this.parseDocument = parseDocumentFn;
		this.workspaceIndex = workspaceIndex;
		this.vscode = vscode;
		this.entries = new Map();
	}

	/**
	 * Returns the cache entry for the current document and workspace versions.
	 * @param {*} document VS Code text document.
	 * @returns {import("./models").DocumentCache} Current parsed snapshot and lazy symbol maps.
	 */
	get(document) {
		const key = document.uri.toString();
		const cached = this.entries.get(key);
		if (cached && cached.version === document.version && cached.workspaceVersion === this.workspaceIndex.version) {
			return cached;
		}
		const parsed = cached && cached.version === document.version
			? cached.parsedSource
			: this.parseDocument(document.getText(), document.uri,
				uri => this.vscode.workspace.asRelativePath(uri, false));
		const entry = new DocumentCache(
			document.version,
			this.workspaceIndex.version,
			parsed,
			() => this.workspaceIndex.makeFunctionMap(parsed),
			() => this.workspaceIndex.makeConstantMap(parsed)
		);
		this.entries.set(key, entry);
		return entry;
	}

	/** Invalidates one document by URI or URI string. 
	 * @param {string | {toString(): string}} uri Document URI or its string representation.
	 * @returns {void} Removes the selected document snapshot from the cache.
	 */
	delete(uri) { this.entries.delete(typeof uri === "string" ? uri : uri.toString()); }
	/** Invalidates every cached document. 
	 * @returns {void} Removes the selected document snapshot from the cache.
	 */
	clear() { this.entries.clear(); }
}

module.exports = { DocumentCacheStore };