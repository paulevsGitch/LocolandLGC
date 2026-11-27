"use strict";

/** @type {typeof import("./models")} */
const { LgcFunction, LgcConstant } = require("./models");
/** @type {typeof import("./header-symbols")} */
const { isAlwaysAvailableSource, normalizeLgcSource } = require("./header-symbols");

/**
 * Stops pending workspace indexing and releases its file watcher resources.
 * directory and matches the basename of its bundled catalogue source. Requiring the actual
 * maps/script path prevents a level-local file named `export.lgc` from replacing an API entry.
 * @param {object} declaration Parsed workspace/current-document function.
 * @param {object} catalogEntry Corresponding bundled function catalogue record.
 * @returns {boolean} Whether the declaration is the original standard-library declaration.
 */
function isSameStandardLibraryDeclaration(declaration, catalogEntry) {
	if (!declaration || !catalogEntry || !isAlwaysAvailableSource(catalogEntry.source)) return false;
	const uri = declaration.uri;
	const uriPath = uri && (uri.fsPath || uri.path || uri.toString && uri.toString()) || "";
	const candidates = [declaration.source, uriPath].filter(Boolean).map(value => String(value).replace(/\\/g, "/"));
	const isStandardScriptPath = candidates.some(value => /(?:^|\/)maps\/script\//i.test(value));
	const declarationSource = declaration.source || uriPath;
	return isStandardScriptPath && normalizeLgcSource(declarationSource) === normalizeLgcSource(catalogEntry.source);
}

/**
 * Creates the merged function lookup map independently of the VS Code extension host.
 * Bundled API names remain reserved even when a catalogue record lacks optional source metadata.
 * Only declarations parsed from the matching real maps/script file may enrich their catalogue
 * entry. The separate declaration index retains every same-name function so collision analysis
 * is not hidden by this lookup precedence.
 * @param {import("./models").ParsedSource} parsed Current document parse.
 * @param {Array<object>} [functionCatalog=[]] Bundled function definitions.
 * @param {Map<string, import("./models").LgcFunction>} [workspaceFunctions] Workspace lookup map.
 * @returns {Map<string, import("./models").LgcFunction>} Merged function map.
 */
function createFunctionMap(parsed, functionCatalog = [], workspaceFunctions = new Map()) {
	const result = new Map();
	const catalogueNames = new Set();
	const catalogueEntries = Array.isArray(functionCatalog)
		? functionCatalog
		: functionCatalog && typeof functionCatalog.values === "function"
			? [...functionCatalog.values()]
			: [];
	for (const item of catalogueEntries) {
		const fn = item instanceof LgcFunction ? item : new LgcFunction(item);
		result.set(fn.name, fn);
		catalogueNames.add(fn.name);
	}
	for (const [name, item] of workspaceFunctions) {
		const bundled = result.get(name);
		if (!catalogueNames.has(name) || isSameStandardLibraryDeclaration(item, bundled)) result.set(name, item);
	}
	for (const item of parsed.functions) {
		const bundled = result.get(item.name);
		if (!catalogueNames.has(item.name) || isSameStandardLibraryDeclaration(item, bundled)) result.set(item.name, item);
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
 * Owns workspace-wide function, constant and file-scope variable indexes.
 * `workspaceFunctions` and `workspaceConstants` are convenient lookup maps, while the
 * corresponding entry maps retain all declarations and source paths for visibility checks.
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
		this.workspaceVariableEntries = new Map();
		this.version = 0;
		this.engineFunctionNames = new Set(functionCatalog.map(item => item.name));
		this.refreshPromise = undefined;
		this.refreshTimer = undefined;
	}

	/** Merges engine, workspace and current-document functions for language providers. 
	 * @param {import("./models").ParsedSource} parsed Current document declarations to merge with the workspace snapshot.
	 * @returns {Map<string, import("./models").LgcFunction>} Current function lookup with standard API names reserved.
	 */
	makeFunctionMap(parsed) {
		return createFunctionMap(parsed, this.functionCatalog, this.workspaceFunctions);
	}

	/** Merges engine, workspace and current-document constants for language providers. 
	 * @param {import("./models").ParsedSource} parsed Current document declarations to merge with the workspace snapshot.
	 * @returns {Map<string, import("./models").LgcConstant>} Current constant lookup including workspace defines.
	 */
	makeConstantMap(parsed) {
		return createConstantMap(parsed, this.constantCatalog, this.workspaceConstants);
	}

	/**
	 * Rebuilds indexes from workspace `.lgc` files; open unsaved files use in-memory contents.
	 * Only declarations in the root lexical scope are indexed as global variables.
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
			const nextVariableEntries = new Map();

			for (const uri of files) {
				try {
					const openDocument = this.vscode.workspace.textDocuments.find(
						document => document.uri.toString() === uri.toString()
					);
					const text = openDocument
						? openDocument.getText()
						: Buffer.from(await this.vscode.workspace.fs.readFile(uri)).toString("utf8");
					const source = this.vscode.workspace.asRelativePath(uri, false).replace(/\\/g, "/");
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

					for (const [name, declarations] of parsed.variables) {
						for (const declaration of declarations) {
							if (!declaration.scope || declaration.scope.depth !== 0 || declaration.isLocal) continue;
							if (!nextVariableEntries.has(name)) nextVariableEntries.set(name, []);
							nextVariableEntries.get(name).push({
								name,
								type: declaration.type,
								isArray: declaration.isArray,
								source,
								declaration
							});
						}
					}
				} catch (_error) {
					// A single unreadable or malformed source file must not prevent other files indexing.
				}
			}

			this.workspaceFunctions = nextFunctions;
			this.workspaceFunctionEntries = nextFunctionEntries;
			this.workspaceConstants = nextConstants;
			this.workspaceVariableEntries = nextVariableEntries;
			this.version++;
		})().finally(() => { this.refreshPromise = undefined; });
		return this.refreshPromise;
	}

	/**
	 * Schedules a debounced workspace refresh and invokes a callback after completion.
	 * @param {() => void} [onUpdated] Callback used to refresh diagnostics after indexing.
	 * @param {number} [delay=250] Debounce interval in milliseconds.
	 * @returns {void} Invalidates the relevant index snapshot and schedules a refresh.
	 */
	scheduleRefresh(onUpdated = () => {}, delay = 250) {
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.refreshTimer = setTimeout(() => {
			this.refreshTimer = undefined;
			this.refresh().then(onUpdated).catch(() => undefined);
		}, delay);
	}

	/** Cancels a pending workspace refresh timer when the extension is deactivated. 
	 * @returns {void} Invalidates the relevant index snapshot and schedules a refresh.
	 */
	dispose() {
		if (this.refreshTimer) clearTimeout(this.refreshTimer);
		this.refreshTimer = undefined;
	}
}

module.exports = { WorkspaceIndex, createFunctionMap, createConstantMap, isSameStandardLibraryDeclaration };