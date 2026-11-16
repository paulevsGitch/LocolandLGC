"use strict";

const { LgcFunction, LgcConstant } = require("./models");

/**
 * Creates the merged function lookup map independently of the VS Code extension host.
 * Bundled API entries provide the baseline; workspace and current-document declarations
 * override them for normal completion/hover lookup. The separate declaration index retains
 * every same-name function so collision analysis is not hidden by this lookup precedence.
 * @param {import("./models").ParsedSource} parsed Current document parse.
 * @param {Array<object>} [functionCatalog=[]] Bundled function definitions.
 * @param {Map<string, import("./models").LgcFunction>} [workspaceFunctions] Workspace lookup map.
 * @returns {Map<string, import("./models").LgcFunction>} Merged function map.
 */
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

/**
 * Creates the merged constant lookup map independently of the VS Code extension host.
 * @param {import("./models").ParsedSource} parsed Current document parse.
 * @param {Array<object>} [constantCatalog=[]] Bundled engine constants.
 * @param {Map<string, import("./models").LgcConstant>} [workspaceConstants] Workspace definitions.
 * @returns {Map<string, import("./models").LgcConstant>} Merged constant map.
 */
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
 * Owns workspace-wide function and constant indexes.
 * `workspaceFunctions` is a convenient one-entry-per-name lookup map, while
 * `workspaceFunctionEntries` deliberately retains duplicate declarations for collision checks.
 * Refreshes are coalesced so concurrent callers share one indexing operation.
 */
class WorkspaceIndex {
	/**
	 * @param {*} vscode VS Code API namespace.
	 * @param {Array<object>} functionCatalog Bundled engine and helper function definitions.
	 * @param {Array<object>} constantCatalog Bundled constants.
	 * @param {(text: string, uri: *, getRelativePath: Function) => import("./models").ParsedSource} parseDocument Parser pipeline.
	 */
	constructor(vscode, functionCatalog, constantCatalog, parseDocument) {
		this.vscode = vscode;
		this.functionCatalog = functionCatalog;
		this.constantCatalog = constantCatalog;
		this.parseDocument = parseDocument;
		this.workspaceFunctions = new Map();
		this.workspaceFunctionEntries = new Map();
		this.workspaceConstants = new Map();
		this.version = 0;
		this.engineFunctionNames = new Set(functionCatalog.map(item => item.name));
		this.refreshPromise = undefined;
		this.refreshTimer = undefined;
	}

	/** Merges engine, workspace and current-document functions for language providers. */
	makeFunctionMap(parsed) {
		return createFunctionMap(parsed, this.functionCatalog, this.workspaceFunctions);
	}

	/** Merges engine, workspace and current-document constants for language providers. */
	makeConstantMap(parsed) {
		return createConstantMap(parsed, this.constantCatalog, this.workspaceConstants);
	}

	/**
	 * Rebuilds indexes from workspace `.lgc` files; open unsaved files use in-memory contents.
	 * @returns {Promise<void>} Resolves after all readable workspace files have been indexed.
	 */
	async refresh() {
		if (this.refreshPromise) return this.refreshPromise;
		this.refreshPromise = (async () => {
			const limit = this.vscode.workspace.getConfiguration("lgc.analysis")
				.get("maxWorkspaceFiles", 500);
			const files = await this.vscode.workspace.findFiles(
				"**/*.lgc", "**/{node_modules,.git,dist,out}/**", limit
			);
			const nextFunctions = new Map();
			const nextFunctionEntries = new Map();
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
						text, uri,
						value => this.vscode.workspace.asRelativePath(value, false)
					);
					for (const fn of parsed.functions) {
						const isBundledExternal = fn.external && this.engineFunctionNames.has(fn.name);
						if (isBundledExternal) continue;
						if (!nextFunctionEntries.has(fn.name)) nextFunctionEntries.set(fn.name, []);
						nextFunctionEntries.get(fn.name).push(fn);
						if (!nextFunctions.has(fn.name)) nextFunctions.set(fn.name, fn);
					}
					for (const [name, constant] of parsed.constants) nextConstants.set(name, constant);
				} catch (_error) {
					// A single unreadable source file must not prevent indexing the rest of the workspace.
				}
			}
			this.workspaceFunctions = nextFunctions;
			this.workspaceFunctionEntries = nextFunctionEntries;
			this.workspaceConstants = nextConstants;
			this.version++;
		})().finally(() => { this.refreshPromise = undefined; });
		return this.refreshPromise;
	}

	/**
	 * Schedules a debounced workspace refresh and invokes a callback after completion.
	 * @param {() => void} [onUpdated] Callback used to refresh diagnostics after indexing.
	 * @param {number} [delay=250] Debounce interval in milliseconds.
	 */
	scheduleRefresh(onUpdated = () => {}, delay = 250) {
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.refreshTimer = setTimeout(() => {
			this.refreshTimer = undefined;
			this.refresh().then(onUpdated).catch(() => undefined);
		}, delay);
	}

	/** Cancels a pending refresh timer when the extension is deactivated. */
	dispose() {
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.refreshTimer = undefined;
	}
}

module.exports = { WorkspaceIndex, createFunctionMap, createConstantMap };
