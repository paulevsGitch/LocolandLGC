"use strict";

const { formatLgcText } = require("./formatter");
const { resolveVariable } = require("./parser");
const { ActiveFunctionCall } = require("./models");
const { KEYWORDS } = require("./language-constants");
const { tokenize } = require("./lexer");
const { renameVariableEdits, codeActionsForDiagnostics, findVariableAt } = require("./refactor");

/**
 * Builds English Markdown documentation for a function's signature and known metadata.
 * Unknown return types are omitted rather than presented as established facts.
 * @param {import("./models").LgcFunction} fn Function entry to document.
 * @returns {string} Markdown suitable for hover and completion documentation.
 */
function markdownForFunction(fn) {
	const lines = [`**\`${fn.signature || `${fn.name}()`}\`**`, "", fn.description || "LGC function."];
	if (fn.returnType && fn.returnType !== "unknown") lines.push("", `**Returns:** \`${fn.returnType}\``);
	if (fn.returnTypeSource) lines.push("**Return type note:** inferred from consistent return statements in the workspace script.");
	if (fn.source) lines.push("", `**Source:** \`${fn.source}\`${fn.id !== null && fn.id !== undefined ? ` (engine function ID ${fn.id})` : ""}`);
	if (fn.params && fn.params.length) {
		lines.push("", "**Parameters:**");
		for (const param of fn.params) {
			lines.push(`- \`${param.name}\` (\`${param.type}\`)${param.optional ? ` — optional, default \`${param.default}\`` : ""}`);
		}
	}
	return lines.join("\n");
}

/**
 * Creates an IntelliSense completion item with a call snippet and API documentation.
 * Required parameters become snippet placeholders; optional parameters are left out
 * of the inserted call but remain visible in the displayed signature.
 * @param {*} vscode VS Code API namespace.
 * @param {import("./models").LgcFunction} fn Function entry.
 * @returns {*} VS Code `CompletionItem`.
 */
function completionForFunction(vscode, fn) {
	const item = new vscode.CompletionItem(fn.name, vscode.CompletionItemKind.Function);
	item.detail = fn.signature || `${fn.name}()`;
	item.documentation = new vscode.MarkdownString(markdownForFunction(fn));
	const requiredParams = (fn.params || []).filter(param => !param.optional);
	item.insertText = requiredParams.length === 0
		? new vscode.SnippetString(`${fn.name}()`)
		: new vscode.SnippetString(`${fn.name}(${requiredParams.map((param, index) => `\${${index + 1}:${param.name}}`).join(", ")})`);
	item.sortText = fn.category === "Workspace function" ? `0_${fn.name}` :
		fn.category === "Engine API" ? `1_${fn.name}` : `2_${fn.name}`;
	return item;
}

/**
 * Returns the identifier range immediately before the cursor on its current line.
 * @param {*} vscode VS Code API namespace.
 * @param {*} document VS Code text document.
 * @param {*} position Cursor position.
 * @returns {*} VS Code `Range`, or `null` when no identifier precedes the cursor.
 */
function wordRangeAt(vscode, document, position) {
	const line = document.lineAt(position.line).text;
	const before = line.slice(0, position.character);
	const match = before.match(/[A-Za-z_]\w*$/);
	if (!match) return null;
	return new vscode.Range(position.line, position.character - match[0].length, position.line, position.character);
}

/**
 * Resolves the function call surrounding a cursor and counts the active argument.
 * Nested parentheses and array brackets are ignored when counting top-level commas.
 * @param {*} vscode VS Code API namespace.
 * @param {*} document Text document containing the call.
 * @param {*} position Cursor position inside the call.
 * @param {Map<string, import("./models").LgcFunction>} functions Merged function signatures.
 * @returns {import("./models").ActiveFunctionCall|null} Active call and argument index.
 */
function currentFunctionAt(vscode, document, position, functions) {
	const before = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
	const tokens = tokenize(before);
	const stack = [];
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i].value === "(") stack.push(i);
		else if (tokens[i].value === ")" && stack.length) stack.pop();
	}
	if (!stack.length) return null;
	const openIndex = stack[stack.length - 1];
	const nameToken = tokens[openIndex - 1];
	if (!nameToken || nameToken.type !== "identifier") return null;
	const fn = functions.get(nameToken.value);
	if (!fn) return null;

	let activeParameter = 0;
	let paren = 0;
	let bracket = 0;
	for (let i = openIndex + 1; i < tokens.length; i++) {
		const value = tokens[i].value;
		if (value === "(") paren++;
		else if (value === ")") { if (paren === 0) break; paren--; }
		else if (value === "[") bracket++;
		else if (value === "]") bracket--;
		else if (value === "," && paren === 0 && bracket === 0) activeParameter++;
	}
	return new ActiveFunctionCall(fn, activeParameter);
}

/**
 * Converts a stored line/character position or numeric source offset into a VS Code position.
 * If only an offset exists, the matching open document is used when available.
 * @param {*} vscode VS Code API namespace.
 * @param {*} uri Source document URI.
 * @param {import("./models").SourcePosition|number} position Stored position or source offset.
 * @returns {*} VS Code `Position`; `(0, 0)` is used when the document is not open.
 */
function documentPositionFromOffset(vscode, uri, position) {
	if (position && typeof position.line === "number" && typeof position.character === "number") {
		return new vscode.Position(position.line, position.character);
	}
	const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
	return document ? document.positionAt(typeof position === "number" ? position : 0) : new vscode.Position(0, 0);
}

/** VS Code document-formatting provider for LGC files. */
class FormattingProvider {
	/** @param {*} vscode VS Code API namespace. */
	constructor(vscode) { this.vscode = vscode; }
	/**
	 * Formats a document using workspace settings and editor indentation preferences.
	 * @param {*} document LGC text document.
	 * @param {*} formattingOptions VS Code editor formatting options.
	 * @returns {Array<*>} A replacement edit, or an empty array when the text is unchanged.
	 */
	provideDocumentFormattingEdits(document, formattingOptions) {
		const vscode = this.vscode;
		const config = vscode.workspace.getConfiguration("lgc.format", document.uri);
		const source = document.getText();
		const style = config.get("indentStyle", "editor");
		const size = config.get("indentSize", 0);
		const formatted = formatLgcText(source, {
			indentStyle: style === "editor" ? (formattingOptions && formattingOptions.insertSpaces === false ? "tabs" : "spaces") : style,
			indentSize: size > 0 ? size : (formattingOptions && formattingOptions.tabSize ? formattingOptions.tabSize : 4),
			braceStyle: config.get("braceStyle", "sameLine"),
			spaceBeforeParens: config.get("spaceBeforeParens", "control"),
			spaceInsideParentheses: config.get("spaceInsideParentheses", false),
			spaceInsideBrackets: config.get("spaceInsideBrackets", false),
			spaceAroundOperators: config.get("spaceAroundOperators", true),
			spaceAfterComma: config.get("spaceAfterComma", true),
			spaceBeforeColon: config.get("spaceBeforeColon", true),
			spaceAfterColon: config.get("spaceAfterColon", true),
			blankLinesBetweenFunctions: config.get("blankLinesBetweenFunctions", 1),
			preserveBlankLines: config.get("preserveBlankLines", true),
			maxBlankLines: config.get("maxBlankLines", 1),
			indentCaseLabels: config.get("indentCaseLabels", false),
			keepEmptyBlocksSingleLine: config.get("keepEmptyBlocksSingleLine", true),
			insertFinalNewline: config.get("insertFinalNewline", true)
		});
		if (formatted === source) return [];
		return [vscode.TextEdit.replace(new vscode.Range(document.positionAt(0), document.positionAt(source.length)), formatted)];
	}
}

/** Completion provider for engine APIs, helper functions, constants and language keywords. */
class CompletionProvider {
	/** @param {*} vscode VS Code API namespace. @param {*} documentCache Parsed-document cache. */
	constructor(vscode, documentCache) { this.vscode = vscode; this.documentCache = documentCache; }
	/**
	 * Provides completion candidates filtered by the identifier prefix at the cursor.
	 * @param {*} document LGC text document.
	 * @param {*} position Cursor position.
	 * @returns {*} VS Code completion list.
	 */
	provideCompletionItems(document, position) {
		const vscode = this.vscode;
		const cached = this.documentCache.get(document);
		const functions = cached.functionsMap.get();
		const constants = cached.constantsMap.get();
		const prefixRange = wordRangeAt(vscode, document, position);
		const prefix = prefixRange ? document.getText(prefixRange) : "";
		const items = [];
		for (const fn of functions.values()) {
			if (!prefix || fn.name.toLowerCase().startsWith(prefix.toLowerCase())) items.push(completionForFunction(vscode, fn));
		}
		for (const constant of constants.values()) {
			if (!prefix || constant.name.toLowerCase().startsWith(prefix.toLowerCase())) {
				const item = new vscode.CompletionItem(constant.name, vscode.CompletionItemKind.Constant);
				item.detail = constant.value ? `LGC constant = ${constant.value}` : "LGC constant";
				item.documentation = new vscode.MarkdownString(constant.description || "Game-script constant.");
				item.sortText = `3_${constant.name}`;
				items.push(item);
			}
		}
		if (!prefix) {
			for (const keyword of KEYWORDS) {
				const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
				item.sortText = `9_${keyword}`;
				items.push(item);
			}
		}
		return new vscode.CompletionList(items, false);
	}
}

/** Hover provider for variables, function signatures and constants. */
class HoverProvider {
	/** @param {*} vscode VS Code API namespace. @param {*} documentCache Parsed-document cache. */
	constructor(vscode, documentCache) { this.vscode = vscode; this.documentCache = documentCache; }
	/**
	 * Shows lexical variable types or English function/constant documentation.
	 * Variable bindings are resolved at the cursor offset, so shadowed names show the right type.
	 * @param {*} document LGC text document.
	 * @param {*} position Hover position.
	 * @returns {*} VS Code `Hover`, or `null` when no known symbol is under the cursor.
	 */
	provideHover(document, position) {
		const vscode = this.vscode;
		const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
		if (!range) return null;
		const name = document.getText(range);
		const cached = this.documentCache.get(document);
		const variable = resolveVariable(cached.parsedSource.variables, name, document.offsetAt(position));
		if (variable) return new vscode.Hover(new vscode.MarkdownString(`**\`${name}\`**\n\nType: \`${variable.type}\``), range);
		const fn = cached.functionsMap.get().get(name);
		if (fn) return new vscode.Hover(new vscode.MarkdownString(markdownForFunction(fn)), range);
		const constant = cached.constantsMap.get().get(name);
		if (constant) {
			return new vscode.Hover(new vscode.MarkdownString(
				`**\`${name}\`**\n\n${constant.description || "LGC constant."}` +
				`${constant.value ? `\n\n**Value:** \`${constant.value}\`` : ""}` +
				`\n\n**Source:** \`${constant.source || "workspace"}\``), range);
		}
		return null;
	}
}

/** Signature-help provider for active LGC function calls. */
class SignatureHelpProvider {
	/** @param {*} vscode VS Code API namespace. @param {*} documentCache Parsed-document cache. */
	constructor(vscode, documentCache) { this.vscode = vscode; this.documentCache = documentCache; }
	/**
	 * Shows the active function signature and parameter at the cursor.
	 * @param {*} document LGC text document.
	 * @param {*} position Cursor position inside an argument list.
	 * @returns {*} VS Code `SignatureHelp`, or `null` outside a known function call.
	 */
	provideSignatureHelp(document, position) {
		const vscode = this.vscode;
		const functions = this.documentCache.get(document).functionsMap.get();
		const active = currentFunctionAt(vscode, document, position, functions);
		if (!active) return null;
		const info = new vscode.SignatureInformation(active.fn.signature || `${active.fn.name}()`, active.fn.description || "");
		info.parameters = (active.fn.params || []).map(param => new vscode.ParameterInformation(
			`${param.type} ${param.name}${param.optional ? ` = ${param.default}` : ""}`, ""));
		const help = new vscode.SignatureHelp();
		help.signatures = [info];
		help.activeSignature = 0;
		help.activeParameter = Math.min(active.activeParameter, Math.max(0, info.parameters.length - 1));
		return help;
	}
}

/** Definition provider for workspace function declarations. */
class DefinitionProvider {
	/** @param {*} vscode VS Code API namespace. @param {*} workspaceIndex Workspace declaration index. */
	constructor(vscode, workspaceIndex) { this.vscode = vscode; this.workspaceIndex = workspaceIndex; }
	/** Resolves a function reference to its indexed declaration location. */
	provideDefinition(document, position) {
		const vscode = this.vscode;
		const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
		if (!range) return null;
		const fn = this.workspaceIndex.workspaceFunctions.get(document.getText(range));
		if (fn && fn.uri && fn.position !== undefined) {
			return new vscode.Location(fn.uri, documentPositionFromOffset(vscode, fn.uri, fn.position));
		}
		return null;
	}
}

/** Exposes indexed workspace functions to VS Code's symbol search. */
class WorkspaceSymbolProvider {
	/** @param {*} vscode VS Code API namespace. @param {*} workspaceIndex Workspace declaration index. */
	constructor(vscode, workspaceIndex) { this.vscode = vscode; this.workspaceIndex = workspaceIndex; }
	/** Returns workspace function symbols matching the supplied name query. */
	provideWorkspaceSymbols(query) {
		const vscode = this.vscode;
		const symbols = [];
		for (const fn of this.workspaceIndex.workspaceFunctions.values()) {
			if ((!query || fn.name.toLowerCase().includes(query.toLowerCase())) && fn.uri && fn.position !== undefined) {
				symbols.push(new vscode.SymbolInformation(fn.name, vscode.SymbolKind.Function, fn.category || "LGC",
					new vscode.Location(fn.uri, documentPositionFromOffset(vscode, fn.uri, fn.position))));
			}
		}
		return symbols;
	}
}

/**
 * F2 rename provider that follows lexical variable bindings rather than matching text globally.
 * Only declared variables and function parameters are renameable through this provider.
 */
/** Scope-aware F2 rename provider for variable declarations and parameters. */
class RenameProvider {
	/** @param {*} vscode VS Code API namespace. @param {*} documentCache Parsed-document cache. */
	constructor(vscode, documentCache) { this.vscode = vscode; this.documentCache = documentCache; }
	/**
	 * Confirms that the cursor selects a variable binding and returns its rename range.
	 * @throws {Error} When the selected identifier is not a variable or parameter.
	 */
	prepareRename(document, position) {
		const vscode = this.vscode;
		const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
		if (!range) throw new Error("Place the cursor on a variable name to rename it.");
		const cached = this.documentCache.get(document);
		const name = document.getText(range);
		const declaration = findVariableAt(cached.parsedSource, name, document.offsetAt(range.start));
		if (!declaration) throw new Error("Only variables and parameters can be renamed by this provider.");
		return { range, placeholder: name };
	}
	/** Builds the scope-aware workspace edit for a variable rename. */
	provideRenameEdits(document, position, newName) {
		const parsed = this.documentCache.get(document).parsedSource;
		return renameVariableEdits(this.vscode, document, parsed, position, newName);
	}
}

/** Quick Fix provider for splitting runtime-dependent variable initializers. */
/** Quick Fix provider for runtime-dependent variable initializers. */
class CodeActionProvider {
	/** @param {*} vscode VS Code API namespace. @param {Function} parseDocument LGC parser callback. */
	constructor(vscode, parseDocument) { this.vscode = vscode; this.parseDocument = parseDocument; }
	/** Provides fixes associated with the current document diagnostics. */
	provideCodeActions(document, _range, context) {
		return codeActionsForDiagnostics(this.vscode, document, context, this.parseDocument);
	}
}

module.exports = {
	markdownForFunction, completionForFunction, wordRangeAt, currentFunctionAt, documentPositionFromOffset,
	FormattingProvider, CompletionProvider, HoverProvider, SignatureHelpProvider,
	DefinitionProvider, WorkspaceSymbolProvider, RenameProvider, CodeActionProvider
};
