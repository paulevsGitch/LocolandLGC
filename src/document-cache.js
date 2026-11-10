"use strict";

const { DocumentCache } = require("./models");

/**
 * Stores one parsed snapshot per open document URI and document version.
 * Symbol maps are created lazily by the associated workspace index.
 */
class DocumentCacheStore {
	/**
	 * @param {(text: string, uri: *, getRelativePath: Function) => import("./models").ParsedSource} parseDocumentFn
	 * @param {*} workspaceIndex Workspace index exposing symbol-map factories.
	 * @param {*} vscode VS Code API namespace.
	 */
	constructor(parseDocumentFn, workspaceIndex, vscode) {
		this.parseDocument = parseDocumentFn;
		this.workspaceIndex = workspaceIndex;
		this.vscode = vscode;
		this.entries = new Map();
	}

	/**
	 * Returns the cached snapshot for the current document version, parsing on a cache miss.
	 * @param {*} document VS Code text document.
	 * @returns {DocumentCache}
	 */
	get(document) {
		const key = document.uri.toString();
		const cached = this.entries.get(key);
		if (cached && cached.version === document.version &&
			cached.workspaceVersion === this.workspaceIndex.version) {
			return cached;
		}

		// A workspace-index refresh only invalidates symbol maps, not the document parse.
		const parsed = cached && cached.version === document.version
			? cached.parsedSource
			: this.parseDocument(
				document.getText(),
				document.uri,
				uri => this.vscode.workspace.asRelativePath(uri, false)
			);
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

	/** Invalidates one document cache entry. */
	delete(uri) {
		this.entries.delete(typeof uri === "string" ? uri : uri.toString());
	}

	/** Clears every cached document. */
	clear() {
		this.entries.clear();
	}
}

module.exports = { DocumentCacheStore };
