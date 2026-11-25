"use strict";

const { CONTROL_WORDS, TYPE_WORDS } = require("./language-constants");
const { tokenize, findMatching } = require("./lexer");
const {
	LgcParameter, LgcFunction, SourcePosition, Scope, VariableDeclaration,
	LgcConstant, ParsedSource, FunctionDeclarationResult, ParameterRange
} = require("./models");
/**
 * Splits a token range at commas that are not nested in calls, arrays or initializer lists.
 *
 * @param {import("./models").Token[]} tokens Complete token stream.
 * @param {number} start Inclusive index of the first token.
 * @param {number} end Exclusive index immediately after the range.
 * @returns {import("./models").Token[][]} Non-empty segments in source order.
 */
function splitTokenArguments(tokens, start, end) {
	if (start >= end) return [];
	const parts = [];
	let partStart = start;
	let paren = 0;
	let bracket = 0;
	let brace = 0;
	for (let i = start; i < end; i++) {
		const value = tokens[i].value;
		if (value === "(") paren++;
		else if (value === ")") paren--;
		else if (value === "[") bracket++;
		else if (value === "]") bracket--;
		else if (value === "{") brace++;
		else if (value === "}") brace--;
		else if (value === "," && paren === 0 && bracket === 0 && brace === 0) {
			parts.push(tokens.slice(partStart, i));
			partStart = i + 1;
		}
	}
	parts.push(tokens.slice(partStart, end));
	return parts.filter(part => part.length > 0);
}
/**
 * Parses one parameter declaration, including its declared primitive type and default value.
 * Pointer/reference-like parameters deliberately use `unknown` because the supplied LGC
 * scripts do not establish a reliable pointer type model.
 *
 * @param {import("./models").Token[]} tokens Tokens for one comma-delimited parameter.
 * @returns {import("./models").LgcParameter|null} Parsed parameter, or `null` for an empty slot.
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
	const pointer = core.some(token => token.value === "*" || token.value === "&");
	return new LgcParameter({
		name: nameToken.value,
		type: pointer ? "unknown" : type,
		optional: eq >= 0,
		default: eq >= 0 ? tokens.slice(eq + 1).map(token => token.value).join(" ") : null
	});
}
/**
 * Tracks simple conditional-preprocessor guards surrounding a source offset.
 * Only a positive `#ifndef NAME` guard is retained; `#else` clears the active
 * fallback marker. This is intentionally not a complete preprocessor evaluator.
 *
 * @param {string} text Complete source text.
 * @param {number} offset Source offset whose preceding directives are inspected.
 * @returns {string[]} Active `#ifndef` macro names at the requested offset.
 */
function preprocessorGuardsAt(text, offset) {
	const stack = [];
	for (const line of text.slice(0, offset).split(/\r?\n/)) {
		const directive = line.match(/^\s*#\s*(if|ifdef|ifndef|endif|else)\b\s*(.*)$/);
		if (!directive) continue;
		if (directive[1] === "endif") {
			if (stack.length) stack.pop();
		} else if (["if", "ifdef", "ifndef"].includes(directive[1])) {
			const macro = directive[1] === "ifndef" ? directive[2].trim().match(/^([A-Za-z_]\w*)/) : null;
			stack.push(macro ? macro[1] : null);
		} else if (directive[1] === "else" && stack.length) {
			stack[stack.length - 1] = null;
		}
	}
	return stack.filter(Boolean);
}
/**
 * Extracts external prototypes and braced function definitions from a token stream.
 * It records the function-name offsets separately so call analysis can distinguish
 * declarations from call expressions. In legacy `extern Name(...) ID;` prototypes,
 * the numeric suffix is an engine function ID, not a return type.
 *
 * @param {import("./models").Token[]} tokens Tokenized source document.
 * @param {string} text Original source text used for declaration prefixes and positions.
 * @param {*} [uri] Optional source URI for workspace metadata.
 * @param {(uri: *) => string} [getRelativePath] Optional URI-to-workspace-path resolver.
 * @returns {import("./models").FunctionDeclarationResult} Functions and declaration offsets.
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
		const signature = `${nameToken.value}(${params.map(param => `${param.type} ${param.name}${param.optional ? ` = ${param.default}` : ""}`).join(", ")})`;
		const item = new LgcFunction({
			name: nameToken.value,
			params,
			signature,
			returnType,
			description: "Function declared in the current LGC workspace.",
			category: "Workspace function",
			source: uri ? (getRelativePath ? getRelativePath(uri) : String(uri)) : "current document",
			uri,
			position: new SourcePosition(nameToken.line, nameToken.start - (text.lastIndexOf("\n", nameToken.start - 1) + 1)),
			offset: nameToken.start,
			range: nameToken.start,
			paramStartOffset: tokens[i + 2] ? tokens[i + 2].start : tokens[i + 1].end,
			paramEndOffset: tokens[close - 1] ? tokens[close - 1].end : tokens[i + 1].end,
			bodyOpenOffset: isFunctionBody ? after.start : null,
			bodyCloseOffset: bodyClose >= 0 ? tokens[bodyClose].end : null,
			declaration: true,
			external: hasExternPrefix,
			preprocessorGuards: preprocessorGuardsAt(text, nameToken.start)
		});
		functions.push(item);
		declarationPositions.add(nameToken.start);
	}
	return new FunctionDeclarationResult(functions, declarationPositions);
}
/**
 * Builds the root scope and nested lexical scopes from matched brace pairs.
 *
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} text Original source text, used for the root scope end offset.
 * @returns {import("./models").Scope[]} Scopes in discovery order, with parent/depth links.
 */
function buildLexicalScopes(tokens, text) {
	const root = new Scope({ id: 0, parent: null, start: 0, end: text.length, depth: 0 });
	const scopes = [root];
	const stack = [root];
	for (const token of tokens) {
		if (token.value === "{") {
			const parent = stack[stack.length - 1];
			const scope = new Scope({ id: scopes.length, parent, start: token.start, end: text.length, depth: parent.depth + 1 });
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
 * Finds the deepest scope containing a source offset.
 * @param {import("./models").Scope[]} scopes Scopes produced by `buildLexicalScopes`.
 * @param {number} offset Source offset to resolve.
 * @returns {import("./models").Scope} Deepest containing scope, or the root scope.
 */
function innermostScopeAt(scopes, offset) {
	let result = scopes[0];
	for (const scope of scopes) {
		if (scope.start <= offset && offset <= scope.end && scope.depth > result.depth) result = scope;
	}
	return result;
}
/**
 * Adds a declaration to the variable map without discarding same-name declarations
 * from other functions or nested lexical scopes.
 * @param {Map<string, import("./models").VariableDeclaration[]>} variables Variable map.
 * @param {string} name Variable identifier.
 * @param {import("./models").VariableDeclaration} declaration Parsed declaration.
 */
function addVariable(variables, name, declaration) {
	if (!variables.has(name)) variables.set(name, []);
	variables.get(name).push(declaration);
}
/**
 * Resolves the nearest declaration visible at an exact source offset.
 * Deeper scopes win over outer scopes; within one scope, the latest declaration
 * visible at the use site wins. This is also the binding rule used by F2 rename.
 *
 * @param {Map<string, import("./models").VariableDeclaration[]>} variables Variable map.
 * @param {string} name Identifier to resolve.
 * @param {number} offset Source offset of the identifier use.
 * @returns {import("./models").VariableDeclaration|null} Resolved declaration, if any.
 */
function resolveVariable(variables, name, offset) {
	if (!variables || !variables.has(name)) return null;
	const entries = variables.get(name);
	if (!Array.isArray(entries)) return entries || null;
	const visible = entries.filter(entry =>
		offset >= entry.visibleFrom && offset >= entry.scope.start && offset <= entry.scope.end
	);
	if (!visible.length) return null;
	visible.sort((a, b) => b.scope.depth - a.scope.depth || b.visibleFrom - a.visibleFrom || b.token.start - a.token.start);
	return visible[0];
}
/**
 * Determines whether a primitive type token begins a variable declaration.
 * Function parameter ranges and preprocessor lines are excluded. File-scope declarations
 * are accepted even when a preceding `#define` contributes non-declaration tokens to the
 * flat lexer stream; block-scope declarations retain the stricter statement-boundary rule.
 * `void` is a function return marker, not a variable type in the observed scripts.
 *
 * @param {import("./models").Token[]} tokens Token stream.
 * @param {number} index Candidate type-token index.
 * @param {string} text Original source text.
 * @param {import("./models").ParameterRange[]} parameterRanges Function parameter regions.
 * @param {import("./models").Scope[]} [scopes] Lexical scopes used to detect file scope.
 * @returns {boolean} Whether the token begins a variable declaration.
 */
function isDeclarationTypePosition(tokens, index, text, parameterRanges, scopes, constants = new Map()) {
	const token = tokens[index];
	if (!token || token.type !== "identifier") return false;
	const aliasValue = constants && constants.get(token.value) ? String(constants.get(token.value).value || "").trim() : "";
	const effectiveType = TYPE_WORDS.has(token.value) ? token.value : (["int", "string", "char"].includes(aliasValue) ? aliasValue : null);
	if (!effectiveType || effectiveType === "void") return false;
	if (parameterRanges.some(range => token.start >= range.start && token.start <= range.end)) return false;
	const lineStart = text.lastIndexOf("\n", token.start - 1) + 1;
	if (/^\s*#/.test(text.slice(lineStart, token.start))) return false;
	let previous = index - 1;
	const qualifiers = new Set(["static", "extern", "const", "volatile", "register", "auto"]);
	while (previous >= 0) {
		const previousLineStart = text.lastIndexOf("\n", tokens[previous].start - 1) + 1;
		const previousLinePrefix = text.slice(previousLineStart, tokens[previous].start);
		const previousIsPreprocessor = /^\s*#/.test(previousLinePrefix);
		if (previousIsPreprocessor || qualifiers.has(tokens[previous].value)) {
			previous--;
			continue;
		}
		break;
	}
	const boundary = previous < 0 ? null : tokens[previous].value;
	const scope = scopes && scopes.length ? innermostScopeAt(scopes, token.start) : null;
	const isFileScope = Boolean(scope && scope.depth === 0);
	if (!isFileScope && boundary !== null && ![";", "{", "}", "(", ":", "else", "do"].includes(boundary)) return false;
	let nameIndex = index + 1;
	while (tokens[nameIndex] && ["*", "&"].includes(tokens[nameIndex].value)) nameIndex++;
	if (!tokens[nameIndex] || tokens[nameIndex].type !== "identifier") return false;
	if (tokens[nameIndex + 1] && tokens[nameIndex + 1].value === "(") return false;
	return true;
}
/**
 * Finds the semicolon terminating a declaration while ignoring nested expressions.
 * @param {import("./models").Token[]} tokens Token stream.
 * @param {number} start Index of the first declarator token.
 * @returns {number} Semicolon index, closing-delimiter index, or `tokens.length`.
 */
function declarationEnd(tokens, start) {
	let paren = 0, bracket = 0, brace = 0;
	for (let i = start; i < tokens.length; i++) {
		const value = tokens[i].value;
		if (value === "(") paren++;
		else if (value === ")") { if (paren === 0) return i; paren--; }
		else if (value === "[") bracket++;
		else if (value === "]") { if (bracket === 0) return i; bracket--; }
		else if (value === "{") brace++;
		else if (value === "}") { if (brace === 0) return i; brace--; }
		else if (value === ";" && paren === 0 && bracket === 0 && brace === 0) return i;
	}
	return tokens.length;
}
/**
 * Parses one declarator from a comma-separated declaration.
 * Initializer tokens and precise offsets are retained for compile-time-constant diagnostics
 * and the Quick Fix that splits a safe local declaration from its runtime assignment.
 * Pointer/reference declarators remain `unknown`; arrays retain their primitive element type.
 *
 * @param {import("./models").Token[]} part Tokens for one declarator.
 * @param {import("./models").LgcType} type Type token preceding the declarators.
 * @param {import("./models").Scope} scope Enclosing lexical scope.
 * @param {number} visibleFrom First offset at which this declaration is visible.
 * @param {number} declarationOffset Offset of the declared type.
 * @param {object} [declarationInfo={}] Shared statement metadata used by Quick Fix.
 * @returns {import("./models").VariableDeclaration|null} Parsed declaration.
 */
function parseVariableDeclarator(part, type, scope, visibleFrom, declarationOffset, declarationInfo = {}) {
	if (!part.length) return null;
	let index = 0;
	let pointer = false;
	while (part[index] && ["*", "&"].includes(part[index].value)) { pointer = true; index++; }
	while (part[index] && ["const", "volatile"].includes(part[index].value)) index++;
	const nameToken = part[index];
	if (!nameToken || nameToken.type !== "identifier") return null;
	let paren = 0, bracket = 0, brace = 0, initializerIndex = -1;
	for (let i = index + 1; i < part.length; i++) {
		const value = part[i].value;
		if (value === "(") paren++;
		else if (value === ")") paren--;
		else if (value === "[") bracket++;
		else if (value === "]") bracket--;
		else if (value === "{") brace++;
		else if (value === "}") brace--;
		else if (value === "=" && paren === 0 && bracket === 0 && brace === 0) { initializerIndex = i; break; }
	}
	const initializerTokens = initializerIndex >= 0 ? part.slice(initializerIndex + 1) : [];
	const beforeInitializer = part.slice(index + 1, initializerIndex >= 0 ? initializerIndex : part.length);
	const isArray = beforeInitializer.some(item => item.value === "[");
	return new VariableDeclaration({
		name: nameToken.value,
		type: pointer ? "unknown" : type,
		token: nameToken,
		scope,
		visibleFrom,
		declarationOffset,
		initializerTokens,
		initializerEqualsToken: initializerIndex >= 0 ? part[initializerIndex] : null,
		initializerStart: initializerTokens.length ? initializerTokens[0].start : null,
		initializerEnd: initializerTokens.length ? initializerTokens[initializerTokens.length - 1].end : null,
		isArray,
		declaratorCount: declarationInfo.declaratorCount || 1,
		declarationSemicolonToken: declarationInfo.semicolonToken || null,
		declarationTypeToken: declarationInfo.typeToken || null,
		isLocal: scope.depth > 0,
		isStatic: declarationInfo.isStatic || false
	});
}
/**
 * Parses file-scope variables, parameters and local declarations into a scope-aware map.
 * Each key maps to an array because identical names may be declared in different functions
 * or in nested blocks. `resolveVariable` later selects the declaration visible at a use site.
 *
 * @param {import("./models").Token[]} tokens Token stream.
 * @param {string} text Original source text.
 * @param {import("./models").LgcFunction[]} functions Parsed functions and prototypes.
 * @returns {Map<string, import("./models").VariableDeclaration[]>} Declarations by name.
 */
function parseVariables(tokens, text, functions, constants = new Map()) {
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
				name: param.name, type: param.type || "unknown", token, scope: bodyScope,
				visibleFrom: bodyScope.start, declarationOffset: fn.offset, isLocal: true
			}));
		}
	}
	for (let i = 0; i < tokens.length; i++) {
		if (!isDeclarationTypePosition(tokens, i, text, parameterRanges, scopes, constants)) continue;
		const aliasValue = constants && constants.get(tokens[i].value) ? String(constants.get(tokens[i].value).value || "").trim() : "";
		const type = TYPE_WORDS.has(tokens[i].value) ? tokens[i].value : aliasValue;
		const nameIndex = i + 1;
		const end = declarationEnd(tokens, nameIndex);
		const parts = splitTokenArguments(tokens, nameIndex, end);
		const declarationScope = innermostScopeAt(scopes, tokens[i].start);
		let qualifierIndex = i - 1;
		let isStatic = false;
		const declarationQualifiers = new Set(["static", "extern", "const", "volatile", "register", "auto"]);
		while (qualifierIndex >= 0 && declarationQualifiers.has(tokens[qualifierIndex].value)) {
			if (tokens[qualifierIndex].value === "static") isStatic = true;
			qualifierIndex--;
		}
		const declarationInfo = {
			declaratorCount: parts.length,
			semicolonToken: tokens[end] && tokens[end].value === ";" ? tokens[end] : null,
			typeToken: tokens[i],
			isStatic
		};
		for (const part of parts) {
			const declaration = parseVariableDeclarator(part, type, declarationScope, tokens[i].start, tokens[i].start, declarationInfo);
			if (declaration) addVariable(variables, declaration.name, declaration);
		}
		// All declarators and initializer tokens belong to this one declaration.
		// Skip them as a unit so later operators (including chained `*` expressions)
		// cannot be reconsidered as declaration candidates by the outer scan.
		i = Math.max(i, end - 1);
	}
	return variables;
}
/**
 * Parses object-like and function-like workspace `#define` directives.
 * The replacement text is retained as-is (minus trailing line comments) so the analyser
 * can recursively resolve simple constant macros. Function-like macros are indexed for
 * completion but are not treated as constant expressions when invoked.
 *
 * @param {string} text Complete source text.
 * @returns {Map<string, import("./models").LgcConstant>} Workspace preprocessor definitions.
 */
function parseDefines(text) {
	const result = new Map();
	const pattern = /^\s*#\s*define\s+([A-Za-z_]\w*)(?:\(([^)]*)\))?\s*(.*)$/gm;
	let match;
	while ((match = pattern.exec(text)) !== null) {
		const value = (match[3] || "").replace(/\/\/.*$/, "").trim();
		result.set(match[1], new LgcConstant({
			name: match[1], value, params: match[2],
			description: `Workspace preprocessor definition${value ? ` (value: ${value})` : ""}.`,
			source: "workspace"
		}));
	}
	return result;
}
/**
 * Runs the syntax-parsing phase without VS Code dependencies.
 * The returned model contains tokens, function declarations, scoped variables and defines.
 *
 * @param {string} text LGC source text.
 * @param {*} [uri] Optional source URI.
 * @param {(uri: *) => string} [getRelativePath] Optional URI-to-workspace-path resolver.
 * @returns {import("./models").ParsedSource} Parsed source model.
 */
function parseSyntax(text, uri, getRelativePath) {
	const tokens = tokenize(text);
	const parsedFunctions = parseFunctionDeclarations(tokens, text, uri, getRelativePath);
	const constants = parseDefines(text);
	const variables = parseVariables(tokens, text, parsedFunctions.functions, constants);
	return new ParsedSource({
		tokens, functions: parsedFunctions.functions, declarationPositions: parsedFunctions.declarationPositions,
		variables, constants, text
	});
}
module.exports = {
	splitTokenArguments, parseParameter, preprocessorGuardsAt, parseFunctionDeclarations,
	buildLexicalScopes, innermostScopeAt, addVariable, resolveVariable,
	isDeclarationTypePosition, declarationEnd, parseVariableDeclarator,
	parseVariables, parseDefines, parseSyntax
};
