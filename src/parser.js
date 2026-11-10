"use strict";

const { CONTROL_WORDS, TYPE_WORDS } = require("./language-constants");
const { tokenize, findMatching } = require("./lexer");
const {
    LgcParameter,
    LgcFunction,
    SourcePosition,
    Scope,
    VariableDeclaration,
    LgcConstant,
    ParsedSource,
    FunctionDeclarationResult,
    ParameterRange
} = require("./models");

/**
 * Splits a token range at commas that are not nested inside parentheses, brackets or braces.
 * @param {Token[]} tokens Complete token stream.
 * @param {number} start Inclusive index of the first token to inspect.
 * @param {number} end Exclusive index immediately after the inspected range.
 * @returns {Token[][]} Non-empty argument/segment token arrays in source order.
 */
function splitTokenArguments(tokens, start, end) {
	if (start >= end) return [];

	const parts = [];
	let partStart = start;
	let paren = 0;
	let bracket = 0;
	let brace = 0;

	for (let i = start; i < end; i++) {
		const v = tokens[i].value;
		if (v === "(") paren++;
		else if (v === ")") paren--;
		else if (v === "[") bracket++;
		else if (v === "]") bracket--;
		else if (v === "{") brace++;
		else if (v === "}") brace--;
		else if (v === "," && paren === 0 && bracket === 0 && brace === 0) {
			parts.push(tokens.slice(partStart, i));
			partStart = i + 1;
		}
	}

	parts.push(tokens.slice(partStart, end));
	return parts.filter(part => part.length > 0);
}

/**
 * Parses one parameter declaration, including its primitive type and optional default value.
 * Pointer and reference parameters are conservatively typed as `unknown`.
 * @param {Token[]} tokens Tokens belonging to a single parameter declaration.
 * @returns {LgcParameter | null} Parsed parameter, or `null` when no parameter name is present.
 */
function parseParameter(tokens) {
	if (!tokens.length) return null;

	const eq = tokens.findIndex(token => token.value === "=");
	const core = eq >= 0 ? tokens.slice(0, eq) : tokens;
	const identifiers = core.filter(token => token.type === "identifier");
	if (!identifiers.length) return null;

	const nameToken = identifiers[identifiers.length - 1];
	const typeToken = identifiers.find(token => TYPE_WORDS.has(token.value));
	const type = typeToken ? typeToken.value : "unknown";
	const isPointer = core.some(token => token.value === "*" || token.value === "&");

	return new LgcParameter({
        name: nameToken.value,
        type: isPointer ? "unknown" : type,
        optional: eq >= 0,
        default: eq >= 0 ? tokens.slice(eq + 1).map(token => token.value).join(" ") : null
    });
}

/**
 * Extracts function prototypes and braced function definitions from a token stream.
 * The returned offset set lets diagnostics distinguish declarations from call expressions.
 * @param {Token[]} tokens Tokenized source document.
 * @param {string} text Original source text used to inspect declaration prefixes and positions.
 * @param {*} [uri] URI of the source document, used for source metadata.
 * @param {(uri: *) => string} [getRelativePath] Optional URI-to-workspace-path resolver.
 * @returns {FunctionDeclarationResult} Parsed functions and their name-token offsets.
 */
function parseFunctionDeclarations(tokens, text, uri, getRelativePath) {
	const functions = [];
	const declarationPositions = new Set();

	for (let i = 0; i < tokens.length - 1; i++) {
		const nameToken = tokens[i];
		if (nameToken.type !== "identifier" || tokens[i + 1].value !== "(" || CONTROL_WORDS.has(nameToken.value)) continue;
		const close = findMatching(tokens, i + 1, "(", ")");
		if (close < 0) continue;

		const after = tokens[close + 1];
		if (!after) continue;

		const lineStart = text.lastIndexOf("\n", nameToken.start - 1) + 1;
		const prefix = text.slice(lineStart, nameToken.start).trim();
		if (!/^(?:(?:extern|static|inline|const)(?:\s+|$))*(?:(?:int|string|char|void)\s*\*?\s*)?$/.test(prefix)) continue;
		const hasDeclarationPrefix = /\b(?:extern|int|string|char|void)\b/.test(prefix);
		const hasExternPrefix = /\bextern\b/.test(prefix);
		const isFunctionBody = after.value === "{";
		const isPrototype = (after.value === ";" && hasDeclarationPrefix) ||
			(hasExternPrefix && after.type === "number" && tokens[close + 2] && tokens[close + 2].value === ";");
		if (!isFunctionBody && !isPrototype) continue;

		const args = splitTokenArguments(tokens, i + 2, close);
		const params = args.map(parseParameter).filter(Boolean);
		const bodyClose = isFunctionBody ? findMatching(tokens, close + 1, "{", "}") : -1;
		const returnMatch = prefix.match(/\b(int|string|char|void)\b/);
		const returnType = returnMatch ? returnMatch[1] : "unknown";
		const signature = `${nameToken.value}(${params.map(p => `${p.type} ${p.name}${p.optional ? ` = ${p.default}` : ""}`).join(", ")})`;
		const item = new LgcFunction({
			name: nameToken.value,
			params,
			signature,
			returnType,
			description: "Function declared in the current LGC workspace.",
			category: "Workspace function",
			source: uri ? (getRelativePath ? getRelativePath(uri) : String(uri)) : "current document",
			uri,
			position: new SourcePosition(
				nameToken.line,
				nameToken.start - (text.lastIndexOf("\\n", nameToken.start - 1) + 1)
			),
			offset: nameToken.start,
			range: nameToken.start,
			paramStartOffset: tokens[i + 2] ? tokens[i + 2].start : tokens[i + 1].end,
			paramEndOffset: tokens[close - 1] ? tokens[close - 1].end : tokens[i + 1].end,
			bodyOpenOffset: isFunctionBody ? after.start : null,
			bodyCloseOffset: bodyClose >= 0 ? tokens[bodyClose].end : null,
			declaration: true,
			external: hasExternPrefix
		});
		functions.push(item);
		declarationPositions.add(nameToken.start);
	}

	return new FunctionDeclarationResult(functions, declarationPositions);
}

/**
 * Builds a root scope and nested lexical scopes from opening and closing braces.
 * @param {Token[]} tokens Token stream whose braces define nested blocks.
 * @param {string} text Source text used to determine the root scope's end offset.
 * @returns {Scope[]} Scopes in discovery order, with parent and depth information.
 */
function buildLexicalScopes(tokens, text) {
	const root = new Scope({ id: 0, parent: null, start: 0, end: text.length, depth: 0 });
	const scopes = [root];
	const stack = [root];

	for (const token of tokens) {
		if (token.value === "{") {
			const parent = stack[stack.length - 1];
			const scope = new Scope({
				id: scopes.length,
				parent,
				start: token.start,
				end: text.length,
				depth: parent.depth + 1
			});
			scopes.push(scope);
			stack.push(scope);
		} else if (token.value === "}" && stack.length > 1) {
			stack[stack.length - 1].end = token.end;
			stack.pop();
		}
	}

	return scopes;
}

/**
 * Resolves the deepest lexical scope containing a source offset.
 * @param {Scope[]} scopes Scopes produced by {@link buildLexicalScopes}.
 * @param {number} offset Zero-based source offset to resolve.
 * @returns {Scope} The deepest matching scope, or the root scope when none is deeper.
 */
function innermostScopeAt(scopes, offset) {
	let result = scopes[0];
	for (const scope of scopes) {
		if (scope.start <= offset && offset <= scope.end && scope.depth > result.depth) result = scope;
	}
	return result;
}

/**
 * Adds a variable declaration to the name-indexed variable map.
 * @param {VariableMap} variables Variable map to update.
 * @param {string} name Identifier used as the map key.
 * @param {VariableDeclaration} declaration Declaration metadata to append.
 */
function addVariable(variables, name, declaration) {
	if (!variables.has(name)) variables.set(name, []);
	variables.get(name).push(declaration);
}

/**
 * Resolves the variable declaration visible at a source offset, respecting nested scopes and shadowing.
 * @param {VariableMap} variables Variable declarations grouped by identifier.
 * @param {string} name Variable identifier to resolve.
 * @param {number} offset Zero-based source offset of the reference.
 * @returns {VariableDeclaration | null} The nearest visible declaration, or `null` when unresolved.
 */
function resolveVariable(variables, name, offset) {
	if (!variables || !variables.has(name)) return null;
	const entries = variables.get(name);
	if (!Array.isArray(entries)) return entries || null;
	const visible = entries.filter(entry =>
		offset >= entry.visibleFrom &&
		offset >= entry.scope.start &&
		offset <= entry.scope.end
	);
	if (!visible.length) return null;
	visible.sort((a, b) =>
		b.scope.depth - a.scope.depth ||
		b.visibleFrom - a.visibleFrom ||
		b.token.start - a.token.start
	);
	return visible[0];
}

/**
 * Determines whether a primitive type token begins a variable declaration rather than an expression.
 * @param {Token[]} tokens Complete token stream.
 * @param {number} index Token index to test.
 * @param {string} text Original source text, used to exclude preprocessor lines.
 * @param {ParameterRange[]} parameterRanges Source ranges occupied by function parameter lists.
 * @returns {boolean} `true` when the token appears in a variable-declaration type position.
 */
function isDeclarationTypePosition(tokens, index, text, parameterRanges) {
	const token = tokens[index];
	if (!token || token.type !== "identifier" || !TYPE_WORDS.has(token.value) || token.value === "void") return false;
	if (parameterRanges.some(range => token.start >= range.start && token.start <= range.end)) return false;

	const lineStart = text.lastIndexOf("\n", token.start - 1) + 1;
	if (/^\s*#/.test(text.slice(lineStart, token.start))) return false;

	let previous = index - 1;
	const qualifiers = new Set(["static", "extern", "const", "volatile", "register", "auto"]);
	while (previous >= 0 && qualifiers.has(tokens[previous].value)) previous--;
	const boundary = previous < 0 ? null : tokens[previous].value;
	if (boundary !== null && ![";", "{", "}", "(", ":", "else", "do"].includes(boundary)) return false;

	let nameIndex = index + 1;
	while (tokens[nameIndex] && ["*", "&"].includes(tokens[nameIndex].value)) nameIndex++;
	if (!tokens[nameIndex] || tokens[nameIndex].type !== "identifier") return false;
	if (tokens[nameIndex + 1] && tokens[nameIndex + 1].value === "(") return false;
	return true;
}

/**
 * Finds the end of a variable declaration, stopping at its top-level semicolon or closing delimiter.
 * @param {Token[]} tokens Complete token stream.
 * @param {number} start Index of the first token after the declaration's type.
 * @returns {number} Index of the terminating token, or `tokens.length` at end of input.
 */
function declarationEnd(tokens, start) {
	let paren = 0;
	let bracket = 0;
	let brace = 0;
	for (let i = start; i < tokens.length; i++) {
		const value = tokens[i].value;
		if (value === "(") paren++;
		else if (value === ")") {
			if (paren === 0) return i;
			paren--;
		} else if (value === "[") bracket++;
		else if (value === "]") {
			if (bracket === 0) return i;
			bracket--;
		} else if (value === "{") brace++;
		else if (value === "}") {
			if (brace === 0) return i;
			brace--;
		} else if (value === ";" && paren === 0 && bracket === 0 && brace === 0) {
			return i;
		}
	}
	return tokens.length;
}

/**
 * Parses one comma-separated variable declarator and associates it with its lexical scope.
 * @param {Token[]} part Tokens for a single declarator.
 * @param {LgcType} type Primitive type declared before the declarator.
 * @param {Scope} scope Lexical scope containing the declaration.
 * @param {number} visibleFrom First source offset at which the variable is visible.
 * @param {number} declarationOffset Offset of the declaration's type token.
 * @returns {VariableDeclaration | null} Parsed variable declaration, or `null` for an invalid declarator.
 */
function parseVariableDeclarator(part, type, scope, visibleFrom, declarationOffset) {
	if (!part.length) return null;
	let index = 0;
	let pointer = false;
	while (part[index] && ["*", "&"].includes(part[index].value)) {
		pointer = true;
		index++;
	}
	while (part[index] && (part[index].value === "const" || part[index].value === "volatile")) index++;
	const nameToken = part[index];
	if (!nameToken || nameToken.type !== "identifier") return null;
	return new VariableDeclaration({
		name: nameToken.value,
		type: pointer ? "unknown" : type,
		token: nameToken,
		scope,
		visibleFrom,
		declarationOffset
	});
}

/**
 * Collects function parameters and local variable declarations into a scope-aware symbol map.
 * @param {Token[]} tokens Token stream for one source document.
 * @param {string} text Original source text.
 * @param {LgcFunction[]} functions Function declarations whose parameters and bodies are inspected.
 * @returns {VariableMap} Variable declarations grouped by identifier.
 */
function parseVariables(tokens, text, functions) {
	const variables = new Map();
	const scopes = buildLexicalScopes(tokens, text);
	const parameterRanges = [];

	for (const fn of functions) {
		if (fn.paramStartOffset !== undefined && fn.paramEndOffset !== undefined) {
			parameterRanges.push(new ParameterRange(fn.paramStartOffset, fn.paramEndOffset));
		}
		if (fn.bodyOpenOffset === null || fn.bodyOpenOffset === undefined) continue;
		const bodyScope = scopes.find(scope => scope.start === fn.bodyOpenOffset);
		if (!bodyScope) continue;
		for (const param of fn.params || []) {
			if (!param.name) continue;
			const token = tokens.find(item => item.value === param.name && item.start >= fn.paramStartOffset && item.end <= fn.paramEndOffset);
			if (!token) continue;
			addVariable(variables, param.name, new VariableDeclaration({
				name: param.name,
				type: param.type || "unknown",
				token,
				scope: bodyScope,
				visibleFrom: bodyScope.start,
				declarationOffset: fn.offset
			}));
		}
	}

	for (let i = 0; i < tokens.length; i++) {
		if (!isDeclarationTypePosition(tokens, i, text, parameterRanges)) continue;
		const type = tokens[i].value;
		const nameIndex = i + 1;
		const end = declarationEnd(tokens, nameIndex);
		const parts = splitTokenArguments(tokens, nameIndex, end);
		const declarationScope = innermostScopeAt(scopes, tokens[i].start);
		for (const part of parts) {
			const declaration = parseVariableDeclarator(part, type, declarationScope, tokens[i].start, tokens[i].start);
			if (declaration) addVariable(variables, declaration.name, declaration);
		}
		i = Math.max(i, nameIndex - 1);
	}
	return variables;
}

/**
 * Extracts object-like and function-like `#define` directives from the source text.
 * @param {string} text Complete LGC source text.
 * @returns {Map<string, LgcConstant>} Definitions indexed by macro name.
 */
function parseDefines(text) {
	const result = new Map();
	const definePattern = /^\s*#\s*define\s+([A-Za-z_]\w*)(?:\(([^)]*)\))?\s*(.*)$/gm;
	let match;
	while ((match = definePattern.exec(text)) !== null) {
		const name = match[1];
		const params = match[2];
		const value = (match[3] || "").replace(/\/\/.*$/, "").trim();
		result.set(name, new LgcConstant({
			name,
			value,
			params,
			description: `Workspace preprocessor definition${value ? ` (value: ${value})` : ""}.`,
			source: "workspace"
		}));
	}
	return result;
}

/**
 * Creates the complete parsed representation used by completion, navigation and diagnostics.
 * @param {string} text LGC source text to parse.
 * @param {*} [uri] URI of the source document, when available.
 * @param {(uri: *) => string} [getRelativePath] Optional URI-to-workspace-path resolver.
 * @returns {ParsedSource} Tokens, declarations, variables, constants and declaration offsets.
 */
function parseSyntax(text, uri, getRelativePath) {
    const tokens = tokenize(text);
    const parsedFunctions = parseFunctionDeclarations(tokens, text, uri, getRelativePath);
    const variables = parseVariables(tokens, text, parsedFunctions.functions);
    const constants = parseDefines(text);
    return new ParsedSource({
        tokens,
        functions: parsedFunctions.functions,
        declarationPositions: parsedFunctions.declarationPositions,
        variables,
        constants
    });
}

module.exports = {
    splitTokenArguments,
    parseParameter,
    parseFunctionDeclarations,
    buildLexicalScopes,
    innermostScopeAt,
    addVariable,
    resolveVariable,
    isDeclarationTypePosition,
    declarationEnd,
    parseVariableDeclarator,
    parseVariables,
    parseDefines,
    parseSyntax
};
