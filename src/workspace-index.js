"use strict";

const { LgcFunction, LgcConstant } = require("./models");


/** Creates the merged function map independently of the VS Code extension host. */
function createFunctionMap(parsed, functionCatalog = [], workspaceFunctions = new Map()) {
	const result = new Map();
	for (const item of functionCatalog) {
		const fn = item instanceof LgcFunction ? item : new LgcFunction(item);
		result.set(fn.name, fn);
	}
	for (const [name, item] of workspaceFunctions) result.set(name, item);
	for (const item of parsed.functions) {
		if (!item.external || !result.has(item.name)) result.set(item.name, item);
	}
	return result;
}

/** Creates the merged constant map independently of the VS Code extension host. */
function createConstantMap(parsed, constantCatalog = [], workspaceConstants = new Map()) {
	const result = new Map();
	for (const item of constantCatalog) {
		const constant = item instanceof LgcConstant ? item : new LgcConstant(item);
		result.set(constant.name, constant);
	}
	for (const [name, item] of workspaceConstants) result.set(name, item);
	for (const [name, item] of parsed.constants) result.set(name, item);
	return result;
}

/**
 * Owns the workspace-wide function and constant indexes.
 * A refresh currently rebuilds the index from all matching files; the class boundary
 * makes the indexing strategy replaceable without changing language providers.
 */
class WorkspaceIndex {
	/**
	 * @param {*} vscode VS Code API namespace.
	 * @param {object[]} functionCatalog Bundled engine function definitions.
	 * @param {object[]} constantCatalog Bundled engine constants.
	 * @param {Function} parseDocument Function that parses and enriches one LGC source file.
	 */
	constructor(vscode, functionCatalog, constantCatalog, parseDocument) {
		this.vscode = vscode;
		this.functionCatalog = functionCatalog;
		this.constantCatalog = constantCatalog;
		this.parseDocument = parseDocument;
		this.workspaceFunctions = new Map();
		this.workspaceConstants = new Map();
		this.version = 0;
		this.engineFunctionNames = new Set(functionCatalog.map(item => item.name));
		this.refreshPromise = undefined;
		this.refreshTimer = undefined;
	}

	/**
	 * Merges engine, workspace and current-document functions; later sources win.
	 * @param {import("./models").ParsedSource} parsed Current document model.
	 * @returns {Map<string, import("./models").LgcFunction>}
	 */
	makeFunctionMap(parsed) {
		return createFunctionMap(parsed, this.functionCatalog, this.workspaceFunctions);
	}

	/**
	 * Merges bundled constants, workspace constants and current-document definitions.
	 * @param {import("./models").ParsedSource} parsed Current document model.
	 * @returns {Map<string, import("./models").LgcConstant>}
	 */
	makeConstantMap(parsed) {
		return createConstantMap(parsed, this.constantCatalog, this.workspaceConstants);
	}

	/**
	 * Rebuilds indexes from workspace `.lgc` files. Concurrent calls share one promise.
	 * Open, unsaved documents are indexed from their in-memory contents.
	 * @returns {Promise<void>}
	 */
	async refresh() {
		if (this.refreshPromise) return this.refreshPromise;

		this.refreshPromise = (async () => {
			const limit = this.vscode.workspace.getConfiguration("lgc.analysis")
				.get("maxWorkspaceFiles", 500);
			const files = await this.vscode.workspace.findFiles(
				"**/*.lgc",
				"**/{node_modules,.git,dist,out}/**",
				limit
			);
			const nextFunctions = new Map();
			const nextConstants = new Map();

			for (const uri of files) {
				try {
					const openDocument = this.vscode.workspace.textDocuments.find(
						document => document.uri.toString() === uri.toString()
					);
					const text = openDocument
						? openDocument.getText()
						: Buffer.from(await this.vscode.workspace.fs.readFile(uri)).toString("utf8");
					const parsed = this.parseDocument(
						text,
						uri,
						value => this.vscode.workspace.asRelativePath(value, false)
					);

					for (const fn of parsed.functions) {
						const isBundledExternal = fn.external && this.engineFunctionNames.has(fn.name);
						if (!isBundledExternal && !nextFunctions.has(fn.name)) {
							nextFunctions.set(fn.name, fn);
						}
					}
					for (const [name, constant] of parsed.constants) {
						nextConstants.set(name, constant);
					}
				} catch (_error) {
					// A single unreadable file must not prevent indexing the rest of the workspace.
				}
			}

			this.workspaceFunctions = nextFunctions;
			this.workspaceConstants = nextConstants;
			this.version++;
		})().finally(() => {
			this.refreshPromise = undefined;
		});

		return this.refreshPromise;
	}

	/**
	 * Debounces workspace reindexing and invokes a callback when it completes.
	 * @param {() => void} [onUpdated] Callback for revalidating open documents.
	 * @param {number} [delay=250] Debounce interval in milliseconds.
	 */
	scheduleRefresh(onUpdated = () => {}, delay = 250) {
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.refreshTimer = setTimeout(() => {
			this.refreshTimer = undefined;
			this.refresh()
				.then(onUpdated)
				.catch(() => undefined);
		}, delay);
	}

	/** Cancels a pending debounced refresh. */
	dispose() {
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.refreshTimer = undefined;
	}
}

module.exports = { WorkspaceIndex, createFunctionMap, createConstantMap };
