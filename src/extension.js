"use strict";

const VSCODE = require("vscode");

const FUNCTION_CATALOG = require("../data/functions.json");
const CONSTANT_CATALOG = require("../data/constants.json");

const { parseDocument } = require("./document-model");
const {
	analyzeDocument,
	expressionType,
	inferFunctionReturnTypes
} = require("./analyzer");
const { DocumentCacheStore } = require("./document-cache");
const {
	WorkspaceIndex,
	createFunctionMap,
	createConstantMap
} = require("./workspace-index");
const {
	FormattingProvider,
	CompletionProvider,
	HoverProvider,
	SignatureHelpProvider,
	DefinitionProvider,
	WorkspaceSymbolProvider
} = require("./providers");
const { tokenize } = require("./lexer");
const {
	parseSyntax,
	resolveVariable,
	parseVariables,
	splitTokenArguments
} = require("./parser");
const { formatLgcText } = require("./formatter");

let activeState;

/**
 * Refreshes diagnostics for every currently open LGC document.
 * @param {*} state Active extension state.
 */
function refreshOpenDiagnostics(state) {
	for (const document of VSCODE.workspace.textDocuments) {
		if (document.languageId === "lgc") updateDiagnostics(state, document);
	}
}

/**
 * Runs static analysis and publishes the diagnostics for one open LGC document.
 * @param {*} state Active extension state.
 * @param {*} document VS Code text document.
 */
function updateDiagnostics(state, document) {
	if (!state || document.languageId !== "lgc") return;
	const cachedDocument = state.documentCache.get(document);
	const diagnostics = analyzeDocument(
		VSCODE,
		document,
		cachedDocument.parsedSource,
		cachedDocument.functionsMap.get(),
		cachedDocument.constantsMap.get()
	);
	state.diagnosticCollection.set(document.uri, diagnostics);
}

/**
 * Activates the LGC extension and registers language providers, diagnostics and commands.
 * @param {*} context VS Code extension context.
 */
function activate(context) {
	const parseForWorkspace = (text, uri, getRelativePath) =>
		parseDocument(text, uri, getRelativePath, FUNCTION_CATALOG);

	const workspaceIndex = new WorkspaceIndex(
		VSCODE,
		FUNCTION_CATALOG,
		CONSTANT_CATALOG,
		parseForWorkspace
	);
	const documentCache = new DocumentCacheStore(
		parseForWorkspace,
		workspaceIndex,
		VSCODE
	);
	const diagnosticCollection = VSCODE.languages.createDiagnosticCollection("lgc");
	const diagnosticTimers = new Map();

	activeState = {
		workspaceIndex,
		documentCache,
		diagnosticCollection,
		diagnosticTimers
	};
	context.subscriptions.push(diagnosticCollection);

	const selector = { language: "lgc", scheme: "file" };

	context.subscriptions.push(
		VSCODE.languages.registerDocumentFormattingEditProvider(
			selector,
			new FormattingProvider(VSCODE)
		),
		VSCODE.languages.registerCompletionItemProvider(
			selector,
			new CompletionProvider(VSCODE, documentCache),
			".",
			"#"
		),
		VSCODE.languages.registerHoverProvider(
			selector,
			new HoverProvider(VSCODE, documentCache)
		),
		VSCODE.languages.registerSignatureHelpProvider(
			selector,
			new SignatureHelpProvider(VSCODE, documentCache),
			"(",
			","
		),
		VSCODE.languages.registerDefinitionProvider(
			selector,
			new DefinitionProvider(VSCODE, workspaceIndex)
		),
		VSCODE.languages.registerWorkspaceSymbolProvider(
			new WorkspaceSymbolProvider(VSCODE, workspaceIndex)
		)
	);

	context.subscriptions.push(VSCODE.workspace.onDidOpenTextDocument(document => {
		if (document.languageId !== "lgc") return;
		updateDiagnostics(activeState, document);
		workspaceIndex.scheduleRefresh(() => refreshOpenDiagnostics(activeState));
	}));

	context.subscriptions.push(VSCODE.workspace.onDidChangeTextDocument(event => {
		const document = event.document;
		if (document.languageId !== "lgc") return;

		const key = document.uri.toString();
		const existingTimer = diagnosticTimers.get(key);
		if (existingTimer) clearTimeout(existingTimer);

		const timer = setTimeout(() => {
			diagnosticTimers.delete(key);
			updateDiagnostics(activeState, document);
		}, 200);
		diagnosticTimers.set(key, timer);
	}));

	context.subscriptions.push(VSCODE.workspace.onDidSaveTextDocument(document => {
		if (document.languageId !== "lgc") return;
		updateDiagnostics(activeState, document);
		workspaceIndex.scheduleRefresh(() => refreshOpenDiagnostics(activeState));
	}));

	context.subscriptions.push(VSCODE.workspace.onDidCloseTextDocument(document => {
		if (document.languageId !== "lgc") return;
		const key = document.uri.toString();
		const timer = diagnosticTimers.get(key);
		if (timer) clearTimeout(timer);
		diagnosticTimers.delete(key);
		documentCache.delete(document.uri);
		diagnosticCollection.delete(document.uri);
	}));

	// File-system events cover additions and removals that do not originate from an open editor.
	const fileWatcher = VSCODE.workspace.createFileSystemWatcher("**/*.lgc");
	context.subscriptions.push(
		fileWatcher,
		fileWatcher.onDidCreate(() => workspaceIndex.scheduleRefresh(() => refreshOpenDiagnostics(activeState))),
		fileWatcher.onDidChange(() => workspaceIndex.scheduleRefresh(() => refreshOpenDiagnostics(activeState))),
		fileWatcher.onDidDelete(() => workspaceIndex.scheduleRefresh(() => refreshOpenDiagnostics(activeState)))
	);

	context.subscriptions.push(VSCODE.commands.registerCommand("lgc.formatDocument", () => {
		const editor = VSCODE.window.activeTextEditor;
		if (!editor || editor.document.languageId !== "lgc") {
			VSCODE.window.showInformationMessage("Open an .lgc file to format it.");
			return;
		}
		return VSCODE.commands.executeCommand("editor.action.formatDocument");
	}));

	context.subscriptions.push(VSCODE.commands.registerCommand("lgc.analyzeCurrentFile", () => {
		const editor = VSCODE.window.activeTextEditor;
		if (!editor || editor.document.languageId !== "lgc") {
			VSCODE.window.showInformationMessage("Open an .lgc file to analyze it.");
			return;
		}
		updateDiagnostics(activeState, editor.document);
		const diagnostics = diagnosticCollection.get(editor.document.uri) || [];
		VSCODE.window.showInformationMessage(
			`LGC analysis completed: ${diagnostics.length} diagnostic(s).`
		);
	}));

	workspaceIndex.refresh()
		.then(() => refreshOpenDiagnostics(activeState))
		.catch(() => undefined);

	refreshOpenDiagnostics(activeState);
}

/** Releases debounce timers and workspace-index resources on deactivation. */
function deactivate() {
	if (!activeState) return;
	for (const timer of activeState.diagnosticTimers.values()) clearTimeout(timer);
	activeState.diagnosticTimers.clear();
	activeState.workspaceIndex.dispose();
	activeState.documentCache.clear();
	activeState = undefined;
}

module.exports = {
	activate,
	deactivate,
	__test: {
		tokenize,
		parseSource: (text, uri) => parseDocument(
			text,
			uri,
			value => value && value.fsPath ? value.fsPath : String(value),
			FUNCTION_CATALOG
		),
		parseSyntax,
		makeFunctionMap: parsed => createFunctionMap(
			parsed,
			FUNCTION_CATALOG,
			activeState ? activeState.workspaceIndex.workspaceFunctions : new Map()
		),
		makeConstantMap: parsed => createConstantMap(
			parsed,
			CONSTANT_CATALOG,
			activeState ? activeState.workspaceIndex.workspaceConstants : new Map()
		),
		analyzeDocument: (document, parsed, functions, constants) =>
			analyzeDocument(VSCODE, document, parsed, functions, constants),
		expressionType,
		resolveVariable,
		parseVariables,
		inferFunctionReturnTypes,
		splitTokenArguments,
		formatLgcText,
		updateDiagnostics: document => updateDiagnostics(activeState, document)
	}
};
