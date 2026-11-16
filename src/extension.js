"use strict";

const VSCODE = require("vscode");
const FUNCTION_CATALOG = require("../data/functions.json");
const CONSTANT_CATALOG = require("../data/constants.json");
const { parseDocument } = require("./document-model");
const {
	analyzeDocument, expressionType, inferFunctionReturnTypes, isCompileTimeConstant
} = require("./analyzer");
const { DocumentCacheStore } = require("./document-cache");
const { WorkspaceIndex, createFunctionMap, createConstantMap } = require("./workspace-index");
const {
	FormattingProvider, CompletionProvider, HoverProvider, SignatureHelpProvider,
	DefinitionProvider, WorkspaceSymbolProvider, RenameProvider, CodeActionProvider
} = require("./providers");
const { tokenize } = require("./lexer");
const {
	parseSyntax, resolveVariable, parseVariables, splitTokenArguments
} = require("./parser");
const { formatLgcText } = require("./formatter");
const { findVariableAt, variableReferenceTokens, renameVariableEdits, codeActionsForDiagnostics } = require("./refactor");

let activeState;
let workspaceFunctionEntriesForTests = new Map();

/** Refreshes static-analysis diagnostics for every currently open LGC document. */
function refreshOpenDiagnostics(state) {
	for (const document of VSCODE.workspace.textDocuments) {
		if (document.languageId === "lgc") updateDiagnostics(state, document);
	}
}

/** Runs semantic analysis and publishes diagnostics for one open LGC document. */
function updateDiagnostics(state, document) {
	if (!state || document.languageId !== "lgc") return;
	const cachedDocument = state.documentCache.get(document);
	const diagnostics = analyzeDocument(
		VSCODE,
		document,
		cachedDocument.parsedSource,
		cachedDocument.functionsMap.get(),
		cachedDocument.constantsMap.get(),
		state.workspaceIndex.workspaceFunctionEntries,
		FUNCTION_CATALOG
	);
	state.diagnosticCollection.set(document.uri, diagnostics);
}

/**
 * Activates the LGC extension and registers language providers, diagnostics and commands.
 * The parser, index, document cache and providers remain independent modules; this function
 * is the composition root that connects them to the VS Code extension host.
 * @param {*} context VS Code extension context and subscription owner.
 */
function activate(context) {
	const parseForWorkspace = (text, uri, getRelativePath) =>
		parseDocument(text, uri, getRelativePath, FUNCTION_CATALOG);
	const workspaceIndex = new WorkspaceIndex(VSCODE, FUNCTION_CATALOG, CONSTANT_CATALOG, parseForWorkspace);
	const documentCache = new DocumentCacheStore(parseForWorkspace, workspaceIndex, VSCODE);
	const diagnosticCollection = VSCODE.languages.createDiagnosticCollection("lgc");
	const diagnosticTimers = new Map();

	activeState = { workspaceIndex, documentCache, diagnosticCollection, diagnosticTimers };
	context.subscriptions.push(diagnosticCollection);
	const selector = { language: "lgc", scheme: "file" };
	context.subscriptions.push(
		VSCODE.languages.registerDocumentFormattingEditProvider(selector, new FormattingProvider(VSCODE)),
		VSCODE.languages.registerCompletionItemProvider(selector, new CompletionProvider(VSCODE, documentCache), ".", "#"),
		VSCODE.languages.registerHoverProvider(selector, new HoverProvider(VSCODE, documentCache)),
		VSCODE.languages.registerSignatureHelpProvider(selector, new SignatureHelpProvider(VSCODE, documentCache), "(", ","),
		VSCODE.languages.registerDefinitionProvider(selector, new DefinitionProvider(VSCODE, workspaceIndex)),
		VSCODE.languages.registerWorkspaceSymbolProvider(new WorkspaceSymbolProvider(VSCODE, workspaceIndex)),
		VSCODE.languages.registerRenameProvider(selector, new RenameProvider(VSCODE, documentCache)),
		VSCODE.languages.registerCodeActionsProvider(
			selector,
			new CodeActionProvider(VSCODE, parseForWorkspace),
			{ providedCodeActionKinds: [VSCODE.CodeActionKind.QuickFix] }
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
		VSCODE.window.showInformationMessage(`LGC analysis completed: ${diagnostics.length} diagnostic(s).`);
	}));
	context.subscriptions.push(VSCODE.commands.registerCommand("lgc.renameVariable", () => {
		const editor = VSCODE.window.activeTextEditor;
		if (!editor || editor.document.languageId !== "lgc") {
			VSCODE.window.showInformationMessage("Open an .lgc file and place the cursor on a variable to rename it.");
			return;
		}
		return VSCODE.commands.executeCommand("editor.action.rename");
	}));

	workspaceIndex.refresh().then(() => refreshOpenDiagnostics(activeState)).catch(() => undefined);
	refreshOpenDiagnostics(activeState);
}

/** Cancels pending work and releases document/workspace caches on extension shutdown. */
function deactivate() {
	if (!activeState) return;
	for (const timer of activeState.diagnosticTimers.values()) clearTimeout(timer);
	activeState.diagnosticTimers.clear();
	activeState.workspaceIndex.dispose();
	activeState.documentCache.clear();
	activeState = undefined;
}

/** Test helper that parses source using the same semantic pipeline as the extension. */
function parseSource(text, uri) {
	return parseDocument(text, uri, value => value && value.fsPath ? value.fsPath : String(value), FUNCTION_CATALOG);
}
/** Test helper for creating the merged engine/workspace/current-document function map. */
function makeFunctionMap(_document, parsed) {
	const workspaceFunctions = activeState ? activeState.workspaceIndex.workspaceFunctions : new Map();
	return createFunctionMap(parsed, FUNCTION_CATALOG, workspaceFunctions);
}
/** Test helper for creating the merged constant map. */
function makeConstantMap(parsed) {
	const workspaceConstants = activeState ? activeState.workspaceIndex.workspaceConstants : new Map();
	return createConstantMap(parsed, CONSTANT_CATALOG, workspaceConstants);
}
/** Test adapter that runs diagnostics without requiring an activated VS Code extension host. */
function analyzeForTests(document, parsed, functions, constants) {
	const entries = activeState ? activeState.workspaceIndex.workspaceFunctionEntries : workspaceFunctionEntriesForTests;
	return analyzeDocument(VSCODE, document, parsed, functions, constants, entries, FUNCTION_CATALOG);
}
/** Injects a workspace declaration index for cross-file collision regression tests. */
function setWorkspaceFunctionEntriesForTests(entries) { workspaceFunctionEntriesForTests = entries || new Map(); }
/** Test adapter for the non-constant-initializer Quick Fix provider. */
function codeActionsForTests(document, context) {
	return codeActionsForDiagnostics(VSCODE, document, context, (text, uri) => parseSource(text, uri));
}

module.exports = {
	activate,
	deactivate,
	__test: {
		tokenize,
		parseSource,
		parseSyntax,
		makeFunctionMap,
		makeConstantMap,
		analyzeDocument: analyzeForTests,
		expressionType,
		resolveVariable,
		parseVariables,
		inferFunctionReturnTypes,
		splitTokenArguments,
		formatLgcText,
		isCompileTimeConstant,
		findVariableAt,
		variableReferenceTokens,
		renameVariableEdits: (document, parsed, position, newName) => renameVariableEdits(VSCODE, document, parsed, position, newName),
		codeActionsForDiagnostics: codeActionsForTests,
		setWorkspaceFunctionEntriesForTests,
		updateDiagnostics: document => updateDiagnostics(activeState, document)
	}
};
