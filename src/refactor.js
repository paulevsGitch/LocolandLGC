"use strict";

/** @type {typeof import("./lexer")} */
const { tokenize } = require("./lexer");
/** @type {typeof import("./parser")} */
const { resolveVariable } = require("./parser");
/** @type {typeof import("./language-constants")} */
const { KEYWORDS } = require("./language-constants");

/**
 * Finds the variable declaration selected by a cursor position.
 * The declaration token is checked first; otherwise the nearest visible lexical binding
 * is resolved. Function names, constants and unknown identifiers are not variable targets.
 * @param {import("./models").ParsedSource} parsed Parsed document with lexical variable bindings.
 * @param {string} name Identifier under the cursor.
 * @param {number} offset Cursor source offset.
 * @returns {import("./models").VariableDeclaration|null} Selected declaration, if any.
 */
function findVariableAt(parsed, name, offset) {
	const entries = parsed.variables.get(name) || [];
	const declaration = entries.find(entry => entry.token && entry.token.start === offset);
	return declaration || resolveVariable(parsed.variables, name, offset);
}

/**
 * Returns only tokens that resolve to one exact variable declaration.
 * Same-spelled identifiers bound to a different function or nested block are excluded;
 * this identity check is what makes rename safe in the presence of lexical shadowing.
 * @param {import("./models").ParsedSource} parsed Parsed document.
 * @param {import("./models").VariableDeclaration} declaration Selected declaration.
 * @returns {import("./models").Token[]} Declaration token and its bound references.
 */
function variableReferenceTokens(parsed, declaration) {
	if (!declaration) return [];
	return parsed.tokens.filter(token => {
		if (token.type !== "identifier" || token.value !== declaration.name) return false;
		if (declaration.token && token.start === declaration.token.start) return true;
		return resolveVariable(parsed.variables, token.value, token.start) === declaration;
	});
}

/**
 * Creates a workspace edit that renames one variable and its lexically bound references.
 * The new spelling must be a valid non-keyword identifier and must not collide with another
 * declaration in the same scope or a preprocessor definition in the current document.
 *
 * @param {*} vscode VS Code API namespace.
 * @param {*} document Text document being edited.
 * @param {import("./models").ParsedSource} parsed Parsed snapshot for the document.
 * @param {*} position Cursor position on the variable name.
 * @param {string} newName Requested identifier spelling.
 * @returns {*} VS Code `WorkspaceEdit` containing declaration/reference replacements.
 * @throws {Error} When the symbol cannot be renamed safely or the new name is invalid.
 */
function renameVariableEdits(vscode, document, parsed, position, newName) {
	if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(newName) || KEYWORDS.includes(newName)) {
		throw new Error("The new name must be a valid LGC identifier and must not be a keyword.");
	}
	const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
	if (!range) throw new Error("Place the cursor on a variable name to rename it.");
	const name = document.getText(range);
	const declaration = findVariableAt(parsed, name, document.offsetAt(range.start));
	if (!declaration) throw new Error("The symbol at this position is not a variable in the current scope.");
	if (newName !== name) {
		const sameScope = parsed.variables.get(newName) || [];
		if (sameScope.some(entry => entry.scope === declaration.scope && entry !== declaration)) {
			throw new Error(`A variable named '${newName}' already exists in this scope.`);
		}
		if (parsed.constants && parsed.constants.has(newName)) {
			throw new Error(`The name '${newName}' is already used by a preprocessor definition.`);
		}
	}

	const edit = new vscode.WorkspaceEdit();
	for (const token of variableReferenceTokens(parsed, declaration)) {
		edit.replace(document.uri,
			new vscode.Range(document.positionAt(token.start), document.positionAt(token.end)), newName);
	}
	return edit;
}

/**
 * Offers a Quick Fix that splits a safe local initializer into declaration and assignment.
 * Only one simple, non-static, non-array declarator is edited; multi-declarator statements,
 * static storage and array initializers are skipped because a mechanical split may alter scope,
 * initialization timing or declaration semantics. The original expression text and EOL style
 * are preserved.
 *
 * @param {*} vscode VS Code API namespace.
 * @param {*} document Document containing the diagnostic.
 * @param {*} context VS Code code-action context.
 * @param {(text: string, uri: *) => import("./models").ParsedSource} parseDocument Parser callback.
 * @returns {Array<*>} Available VS Code Quick Fix actions.
 */
function codeActionsForDiagnostics(vscode, document, context, parseDocument) {
	const requested = (context.diagnostics || []).filter(item =>
		item.code === "lgc.nonConstantInitializer" && item.range && item.range.start);
	if (!requested.length) return [];

	const parsed = parseDocument(document.getText(), document.uri);
	const declarations = [];
	for (const entries of parsed.variables.values()) declarations.push(...entries);
	const actions = [];
	const sourceText = document.getText();

	for (const item of requested) {
		const equalsOffset = document.offsetAt(item.range.start);
		const declaration = declarations.find(entry =>
			entry.initializerEqualsToken && entry.initializerEqualsToken.start === equalsOffset);
		if (!declaration || !declaration.isLocal || declaration.isStatic || declaration.isArray ||
			declaration.declaratorCount !== 1 || !declaration.declarationSemicolonToken ||
			!declaration.initializerTokens.length) continue;

		const expression = sourceText.slice(declaration.initializerStart, declaration.initializerEnd);
		const declarationLine = document.lineAt(document.positionAt(declaration.declarationTypeToken.start).line).text;
		const indent = (declarationLine.match(/^\s*/) || [""])[0];
		const eol = document.eol === vscode.EndOfLine.CRLF ? "\r\n" : "\n";
		let removalStart = declaration.initializerEqualsToken.start;
		while (removalStart > 0 && /[ \t]/.test(sourceText[removalStart - 1])) removalStart--;

		const action = new vscode.CodeAction(
			"Split declaration and runtime assignment", vscode.CodeActionKind.QuickFix);
		action.edit = new vscode.WorkspaceEdit();
		action.edit.replace(document.uri,
			new vscode.Range(document.positionAt(removalStart), document.positionAt(declaration.initializerEnd)), "");
		action.edit.insert(document.uri, document.positionAt(declaration.declarationSemicolonToken.end),
			`${eol}${indent}${declaration.name} = ${expression};`);
		action.diagnostics = [item];
		action.isPreferred = true;
		actions.push(action);
	}
	return actions;
}

module.exports = { findVariableAt, variableReferenceTokens, renameVariableEdits, codeActionsForDiagnostics };
