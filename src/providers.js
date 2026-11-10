"use strict";

const { formatLgcText } = require("./formatter");
const { resolveVariable } = require("./parser");
const { ActiveFunctionCall } = require("./models");
const { KEYWORDS } = require("./language-constants");
const { tokenize } = require("./lexer");

/**
 * Builds Markdown documentation for a function signature, return type, source and parameters.
 * @param {LgcFunction} fn Function entry to document.
 * @returns {string} Markdown text suitable for VS Code hover and completion documentation.
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
 * Creates a VS Code completion item with a function signature and parameter placeholders.
 * @param {LgcFunction} fn Function entry to expose in IntelliSense.
 * @returns {VSCODE.CompletionItem} Completion item with sorting, snippet and Markdown documentation.
 */
function completionForFunction(VSCODE, fn) {
	const item = new VSCODE.CompletionItem(fn.name, VSCODE.CompletionItemKind.Function);
	item.detail = fn.signature || `${fn.name}()`;
	item.documentation = new VSCODE.MarkdownString(markdownForFunction(fn));
	const requiredParams = (fn.params || []).filter(param => !param.optional);
	if (requiredParams.length === 0) {
		item.insertText = new VSCODE.SnippetString(`${fn.name}()`);
	} else {
		const placeholders = requiredParams.map((param, index) => `\${${index + 1}:${param.name}}`);
		item.insertText = new VSCODE.SnippetString(`${fn.name}(${placeholders.join(", ")})`);
	}
	item.sortText = fn.category === "Workspace function" ? `0_${fn.name}` :
		fn.category === "Engine API" ? `1_${fn.name}` : `2_${fn.name}`;
	return item;
}

/**
 * Returns the identifier range immediately before a cursor position on the current line.
 * @param {VSCODE.TextDocument} document Document containing the cursor.
 * @param {VSCODE.Position} position Cursor position.
 * @returns {VSCODE.Range | null} Range of the preceding identifier, or `null` when none exists.
 */
function wordRangeAt(VSCODE, document, position) {
	const line = document.lineAt(position.line).text;
	const before = line.slice(0, position.character);
	const match = before.match(/[A-Za-z_]\w*$/);
	if (!match) return null;
	return new VSCODE.Range(position.line, position.character - match[0].length, position.line, position.character);
}

/**
 * Resolves the function call surrounding the cursor and counts the active argument.
 * Nested calls and array expressions are ignored when counting top-level commas.
 * @param {VSCODE.TextDocument} document Document containing the call.
 * @param {VSCODE.Position} position Cursor position within the document.
 * @param {Map<string, LgcFunction>} functions Available function signatures.
 * @returns {ActiveFunctionCall | null} Active call context, or `null` when no known call surrounds the cursor.
 */
function currentFunctionAt(VSCODE, document, position, functions) {
	const before = document.getText(new VSCODE.Range(new VSCODE.Position(0, 0), position));
	const tokens = tokenize(before);
	let openIndex = -1;
	const stack = [];
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i].value === "(") stack.push(i);
		else if (tokens[i].value === ")" && stack.length) stack.pop();
	}
	if (!stack.length) return null;
	openIndex = stack[stack.length - 1];
	const nameToken = tokens[openIndex - 1];
	if (!nameToken || nameToken.type !== "identifier") return null;
	const fn = functions.get(nameToken.value);
	if (!fn) return null;

	let activeParameter = 0;
	let paren = 0;
	let bracket = 0;
	for (let i = openIndex + 1; i < tokens.length; i++) {
		const v = tokens[i].value;
		if (v === "(") paren++;
		else if (v === ")") {
			if (paren === 0) break;
			paren--;
		} else if (v === "[") bracket++;
		else if (v === "]") bracket--;
		else if (v === "," && paren === 0 && bracket === 0) activeParameter++;
	}
	return new ActiveFunctionCall(fn, activeParameter);
}

/**
 * Converts a stored source position or offset into a VS Code document position.
 * If only a numeric offset is available, the matching open document is used when possible.
 * @param {VSCODE.Uri} uri URI identifying the source document.
 * @param {VSCODE.Position | SourcePosition | number} position Existing line/character position or numeric offset.
 * @returns {VSCODE.Position} Resolved position; `(0, 0)` is used when the document is not open.
 */
function documentPositionFromOffset(VSCODE, uri, position) {
	if (position && typeof position.line === "number" && typeof position.character === "number") {
		return new VSCODE.Position(position.line, position.character);
	}
	const document = VSCODE.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
	if (!document) return new VSCODE.Position(0, 0);
	return document.positionAt(typeof position === "number" ? position : 0);
}

/** VS Code document formatting provider for LGC files. */
class FormattingProvider {
	constructor(vscode) {
		this.vscode = vscode;
	}

	/** @returns {*} Text edits replacing the document when formatting changes are needed. */
	provideDocumentFormattingEdits(document, formattingOptions) {
		const vscode = this.vscode;
		const config = vscode.workspace.getConfiguration("lgc.format", document.uri);
		const source = document.getText();
		const configuredIndentStyle = config.get("indentStyle", "editor");
		const configuredIndentSize = config.get("indentSize", 0);
		const formatted = formatLgcText(source, {
			indentStyle: configuredIndentStyle === "editor"
				? (formattingOptions && formattingOptions.insertSpaces === false ? "tabs" : "spaces")
				: configuredIndentStyle,
			indentSize: configuredIndentSize > 0
				? configuredIndentSize
				: (formattingOptions && formattingOptions.tabSize ? formattingOptions.tabSize : 4),
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
		return [vscode.TextEdit.replace(
			new vscode.Range(document.positionAt(0), document.positionAt(source.length)),
			formatted
		)];
	}
}

/** Completion provider for engine/workspace functions, constants and language keywords. */
class CompletionProvider {
	constructor(vscode, documentCache) {
		this.vscode = vscode;
		this.documentCache = documentCache;
	}

	/** @returns {*} Completion list for the prefix immediately before the cursor. */
	provideCompletionItems(document, position) {
		const vscode = this.vscode;
		const cachedDocument = this.documentCache.get(document);
		const functions = cachedDocument.functionsMap.get();
		const constants = cachedDocument.constantsMap.get();
		const items = [];
		const prefixRange = wordRangeAt(vscode, document, position);
		const prefix = prefixRange ? document.getText(prefixRange) : "";

		for (const fn of functions.values()) {
			if (!prefix || fn.name.toLowerCase().startsWith(prefix.toLowerCase())) {
				items.push(completionForFunction(vscode, fn));
			}
		}
		for (const constant of constants.values()) {
			if (!prefix || constant.name.toLowerCase().startsWith(prefix.toLowerCase())) {
				const item = new vscode.CompletionItem(
					constant.name,
					vscode.CompletionItemKind.Constant
				);
				item.detail = constant.value ? `LGC constant = ${constant.value}` : "LGC constant";
				item.documentation = new vscode.MarkdownString(
					constant.description || "Game-script constant."
				);
				item.sortText = `3_${constant.name}`;
				items.push(item);
			}
		}
		if (!prefix) {
			for (const keyword of KEYWORDS) {
				const item = new vscode.CompletionItem(
					keyword,
					vscode.CompletionItemKind.Keyword
				);
				item.sortText = `9_${keyword}`;
				items.push(item);
			}
		}
		return new vscode.CompletionList(items, false);
	}
}

/** Hover provider for variables, known functions and constants. */
class HoverProvider {
	constructor(vscode, documentCache) {
		this.vscode = vscode;
		this.documentCache = documentCache;
	}

	/** @returns {*} Hover details, or `null` when no known symbol is under the cursor. */
	provideHover(document, position) {
		const vscode = this.vscode;
		const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
		if (!range) return null;

		const name = document.getText(range);
		const cachedDocument = this.documentCache.get(document);
		const functions = cachedDocument.functionsMap.get();
		const constants = cachedDocument.constantsMap.get();
		const variable = resolveVariable(
			cachedDocument.parsedSource.variables,
			name,
			document.offsetAt(position)
		);

		if (variable) {
			return new vscode.Hover(
				new vscode.MarkdownString(`**\`${name}\`**\n\nType: \`${variable.type}\``),
				range
			);
		}
		const fn = functions.get(name);
		if (fn) {
			return new vscode.Hover(new vscode.MarkdownString(markdownForFunction(fn)), range);
		}
		const constant = constants.get(name);
		if (constant) {
			return new vscode.Hover(new vscode.MarkdownString(
				`**\`${name}\`**\n\n${constant.description || "LGC constant."}` +
				`${constant.value ? `\n\n**Value:** \`${constant.value}\`` : ""}` +
				`\n\n**Source:** \`${constant.source || "workspace"}\``
			), range);
		}
		return null;
	}
}

/** Signature-help provider that highlights the argument currently being edited. */
class SignatureHelpProvider {
	constructor(vscode, documentCache) {
		this.vscode = vscode;
		this.documentCache = documentCache;
	}

	/** @returns {*} Active function signature help, or `null` outside a known call. */
	provideSignatureHelp(document, position) {
		const vscode = this.vscode;
		const functions = this.documentCache.get(document).functionsMap.get();
		const active = currentFunctionAt(vscode, document, position, functions);
		if (!active) return null;

		const info = new vscode.SignatureInformation(
			active.fn.signature || `${active.fn.name}()`,
			active.fn.description || ""
		);
		info.parameters = (active.fn.params || []).map(param => new vscode.ParameterInformation(
			`${param.type} ${param.name}${param.optional ? ` = ${param.default}` : ""}`,
			""
		));
		const help = new vscode.SignatureHelp();
		help.signatures = [info];
		help.activeSignature = 0;
		help.activeParameter = Math.min(
			active.activeParameter,
			Math.max(0, info.parameters.length - 1)
		);
		return help;
	}
}

/** Definition provider for workspace function declarations. */
class DefinitionProvider {
	constructor(vscode, workspaceIndex) {
		this.vscode = vscode;
		this.workspaceIndex = workspaceIndex;
	}

	/** @returns {*} Declaration location, or `null` when the symbol is not indexed. */
	provideDefinition(document, position) {
		const vscode = this.vscode;
		const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
		if (!range) return null;
		const name = document.getText(range);
		const fn = this.workspaceIndex.workspaceFunctions.get(name);
		if (fn && fn.uri && fn.position !== undefined) {
			return new vscode.Location(
				fn.uri,
				documentPositionFromOffset(vscode, fn.uri, fn.position)
			);
		}
		return null;
	}
}

/** Workspace-symbol provider exposing indexed LGC functions. */
class WorkspaceSymbolProvider {
	constructor(vscode, workspaceIndex) {
		this.vscode = vscode;
		this.workspaceIndex = workspaceIndex;
	}

	/** @returns {*} Workspace symbols matching the supplied query. */
	provideWorkspaceSymbols(query) {
		const vscode = this.vscode;
		const symbols = [];
		for (const fn of this.workspaceIndex.workspaceFunctions.values()) {
			if (!query || fn.name.toLowerCase().includes(query.toLowerCase())) {
				if (fn.uri && fn.position !== undefined) {
					symbols.push(new vscode.SymbolInformation(
						fn.name,
						vscode.SymbolKind.Function,
						fn.category || "LGC",
						new vscode.Location(
							fn.uri,
							documentPositionFromOffset(vscode, fn.uri, fn.position)
						)
					));
				}
			}
		}
		return symbols;
	}
}

module.exports = {
	markdownForFunction,
	completionForFunction,
	wordRangeAt,
	currentFunctionAt,
	documentPositionFromOffset,
	FormattingProvider,
	CompletionProvider,
	HoverProvider,
	SignatureHelpProvider,
	DefinitionProvider,
	WorkspaceSymbolProvider
};
