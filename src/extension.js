"use strict";

const VSCODE = require("vscode");

const FUNCTION_CATALOG = require("../data/functions.json");
const CONSTANT_CATALOG = require("../data/constants.json");
const { formatLgcText } = require("./formatter");
const { Lazy } = require("./lazy");

const CONTROL_WORDS = new Set(["if", "iff", "else", "while", "for", "do", "switch", "case", "return", "sizeof"]);
const TYPE_WORDS = new Set(["int", "string", "char", "void"]);
const KEYWORDS = [
	"if", "else", "while", "for", "do", "switch", "case", "default",
	"break", "continue", "return", "static", "extern", "int", "string", "char", "void"
];
const MULTI_OPERATORS = ["==", "!=", "<=", ">=", "++", "--", "&&", "||", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "->"];

const DOCUMENT_CACHE = new Map();

/** @type {VSCODE.DiagnosticCollection} */
let diagnosticCollection;

/** @type {Map<string, LgcFunction>} */
let workspaceFunctions = new Map();
/** @type {Map<string, LgcConstant>} */
let workspaceConstants = new Map();

/** @type {Promise<void> | undefined} */
let refreshPromise;

/** @type {NodeJS.Timeout} */
let refreshTimer;

/**
 * Primitive value types understood by the conservative LGC type analyser.
 * `unknown` is used whenever the source does not provide enough information.
 * @typedef {"int" | "string" | "char" | "void" | "unknown"} LgcType
 */

/**
 * A token produced by the LGC lexer.
 * Offsets are zero-based UTF-16 offsets into the source document; lines are zero-based.
 * @typedef {object} Token
 * @property {"identifier" | "number" | "string" | "char" | "operator" | "punctuation"} type
 * @property {string} value Exact token text as it appears in the source.
 * @property {number} start Inclusive source offset of the token.
 * @property {number} end Exclusive source offset of the token.
 * @property {number} line Zero-based source line containing the token.
 */

/**
 * A function parameter parsed from a declaration or loaded from the API catalogue.
 * @typedef {object} LgcParameter
 * @property {string} name Parameter identifier.
 * @property {LgcType} type Declared or inferred primitive type; pointer-like types remain `unknown`.
 * @property {boolean} optional Whether the declaration specifies a default value.
 * @property {string | null} default Source text of the default value, or `null` when required.
 */

/**
 * A zero-based line/character position in a source document.
 * @typedef {object} SourcePosition
 * @property {number} line Zero-based line number.
 * @property {number} character Zero-based UTF-16 character offset within the line.
 */

/**
 * A function signature from the engine catalogue or an LGC workspace declaration.
 * Catalogue-only metadata is optional because workspace functions do not have engine IDs.
 * @typedef {object} LgcFunction
 * @property {string} name Function name.
 * @property {LgcParameter[]} params Ordered function parameters.
 * @property {string} signature Display-ready function signature.
 * @property {LgcType} returnType Declared return type or a safely inferred type.
 * @property {string} [description] Human-readable function description.
 * @property {string} [category] API or workspace category used for completion sorting.
 * @property {string} [source] Name of the source script or catalogue file.
 * @property {VSCODE.Uri} [uri] URI of the workspace file containing the declaration.
 * @property {SourcePosition} [position] Position of the function name in its source file.
 * @property {number} [offset] Source offset of the function name.
 * @property {number} [range] Legacy copy of the function-name source offset.
 * @property {number} [paramStartOffset] Inclusive source offset at the start of the parameter list.
 * @property {number} [paramEndOffset] Exclusive source offset at the end of the parameter list.
 * @property {number | null} [bodyOpenOffset] Offset of the function's opening brace, or `null` for prototypes.
 * @property {number | null} [bodyCloseOffset] Exclusive offset after the function's closing brace, or `null` when absent.
 * @property {boolean} [declaration] Whether this entry was parsed from a workspace declaration.
 * @property {boolean} [external] Whether the declaration is marked `extern`.
 * @property {number | null} [id] Engine function ID, when supplied by the catalogue.
 * @property {string} [returnTypeSource] Explanation of how the return type was obtained.
 */

/**
 * A lexical block scope delimited by braces.
 * @typedef {object} Scope
 * @property {number} id Stable index within the scope list produced for one document.
 * @property {Scope | null} parent Parent scope, or `null` for the document root.
 * @property {number} start Inclusive source offset where the scope begins.
 * @property {number} end Source offset at the end of the scope (the closing brace end, or document length).
 * @property {number} depth Nesting depth; the document root has depth zero.
 */

/**
 * A variable or function-parameter declaration and the region where it is visible.
 * @typedef {object} VariableDeclaration
 * @property {string} name Variable identifier.
 * @property {LgcType} type Declared primitive type; pointer-like declarations are `unknown`.
 * @property {Token} token Token containing the variable name.
 * @property {Scope} scope Lexical scope containing the declaration.
 * @property {number} visibleFrom First source offset at which the variable is visible.
 * @property {number} declarationOffset Source offset of the declaration's type token (or function name for a parameter).
 */

/** @typedef {Map<string, VariableDeclaration[]>} VariableMap */

/**
 * Workspace constant or preprocessor definition.
 * Function-like definitions may contain a comma-separated parameter string.
 * @typedef {object} LgcConstant
 * @property {string} name Constant or macro name.
 * @property {string} [value] Raw replacement text, when available.
 * @property {string} [params] Raw macro parameter list, when the definition is function-like.
 * @property {string} [description] Human-readable description shown by IntelliSense.
 * @property {string} [source] Source catalogue or workspace label.
 */

/**
 * Complete syntactic and semantic snapshot produced for one source document.
 * @typedef {object} ParsedSource
 * @property {Token[]} tokens Lexed source tokens.
 * @property {LgcFunction[]} functions Function declarations and definitions found in the document.
 * @property {Set<number>} declarationPositions Offsets of function names that must not be treated as calls.
 * @property {VariableMap} variables Variable declarations grouped by identifier.
 * @property {Map<string, LgcConstant>} constants Preprocessor definitions grouped by name.
 */

/**
 * Result of scanning function definitions and prototypes.
 * @typedef {object} FunctionDeclarationResult
 * @property {LgcFunction[]} functions Parsed function declarations.
 * @property {Set<number>} declarationPositions Source offsets of parsed function names.
 */

/** @typedef {{ start: number, end: number }} ParameterRange */

/**
 * Function call context at the current cursor position.
 * @typedef {object} ActiveFunctionCall
 * @property {LgcFunction} fn Resolved function signature.
 * @property {number} activeParameter Zero-based index of the argument currently being edited.
 */

/**
 * @typedef {object} DocumentCache
 * @property {number} version
 * @property {Lazy<ParsedSource>} parsedSource
 * @property {Lazy<Map<string, LgcFunction>>} functionsMap
 * @property {Lazy<Map<string, LgcConstant>>} constantsMap
 */

/**
 * Converts LGC source text into a flat token stream while preserving source offsets.
 * Whitespace and comments are skipped; literals, identifiers, numbers and operators are retained.
 * @param {string} text Complete LGC source text to tokenize.
 * @returns {Token[]} Tokens in source order. Line and offset values are zero-based.
 */
function tokenize(text) {
	const tokens = [];
	let i = 0;
	let line = 0;

	while (i < text.length) {
		const ch = text[i];
		if (ch === "\n") {
			line++;
			i++;
			continue;
		}
		if (/\s/.test(ch)) {
			i++;
			continue;
		}
		if (ch === "/" && text[i + 1] === "/") {
			while (i < text.length && text[i] !== "\n") i++;
			continue;
		}
		if (ch === "/" && text[i + 1] === "*") {
			i += 2;
			while (i < text.length) {
				if (text[i] === "\n") line++;
				if (text[i] === "*" && text[i + 1] === "/") {
					i += 2;
					break;
				}
				i++;
			}
			continue;
		}

		const start = i;
		const startLine = line;

		if (ch === '"' || ch === "'") {
			const quote = ch;
			i++;
			while (i < text.length) {
				if (text[i] === "\\") {
					i += 2;
					continue;
				}
				if (text[i] === quote) {
					i++;
					break;
				}
				if (text[i] === "\n") line++;
				i++;
			}
			tokens.push({ type: quote === '"' ? "string" : "char", value: text.slice(start, i), start, end: i, line: startLine });
			continue;
		}

		if (/[A-Za-z_]/.test(ch)) {
			i++;
			while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) i++;
			tokens.push({ type: "identifier", value: text.slice(start, i), start, end: i, line: startLine });
			continue;
		}

		if (/[0-9]/.test(ch)) {
			i++;
			if (ch === "0" && (text[i] === "x" || text[i] === "X")) {
				i++;
				while (i < text.length && /[0-9A-Fa-f]/.test(text[i])) i++;
			} else {
				while (i < text.length && /[0-9.]/.test(text[i])) i++;
			}
			tokens.push({ type: "number", value: text.slice(start, i), start, end: i, line: startLine });
			continue;
		}

		const op = MULTI_OPERATORS.find(candidate => text.startsWith(candidate, i));
		if (op) {
			i += op.length;
			tokens.push({ type: "operator", value: op, start, end: i, line: startLine });
			continue;
		}

		i++;
		tokens.push({ type: "punctuation", value: ch, start, end: i, line: startLine });
	}
	return tokens;
}

/**
 * Finds the closing token paired with an opening delimiter, accounting for nesting.
 * @param {Token[]} tokens Token stream to inspect.
 * @param {number} openIndex Index of the opening delimiter in `tokens`.
 * @param {string} openValue Opening delimiter, such as `(` or `{`.
 * @param {string} closeValue Matching closing delimiter, such as `)` or `}`.
 * @returns {number} Index of the matching closing token, or `-1` when no match exists.
 */
function findMatching(tokens, openIndex, openValue, closeValue) {
	let depth = 0;
	for (let i = openIndex; i < tokens.length; i++) {
		if (tokens[i].value === openValue) depth++;
		else if (tokens[i].value === closeValue) {
			depth--;
			if (depth === 0) return i;
		}
	}
	return -1;
}

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

	return {
		name: nameToken.value,
		type: isPointer ? "unknown" : type,
		optional: eq >= 0,
		default: eq >= 0 ? tokens.slice(eq + 1).map(token => token.value).join(" ") : null
	};
}

/**
 * Extracts function prototypes and braced function definitions from a token stream.
 * The returned offset set lets diagnostics distinguish declarations from call expressions.
 * @param {Token[]} tokens Tokenized source document.
 * @param {string} text Original source text used to inspect declaration prefixes and positions.
 * @param {VSCODE.Uri} [uri] URI of the source document, used for relative source metadata.
 * @returns {FunctionDeclarationResult} Parsed functions and their name-token offsets.
 */
function parseFunctionDeclarations(tokens, text, uri) {
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
		const item = {
			name: nameToken.value,
			params,
			signature,
			returnType,
			description: "Function declared in the current LGC workspace.",
			category: "Workspace function",
			source: uri ? VSCODE.workspace.asRelativePath(uri, false) : "current document",
			uri,
			position: {
				line: nameToken.line,
				character: nameToken.start - (text.lastIndexOf("\n", nameToken.start - 1) + 1)
			},
			offset: nameToken.start,
			range: nameToken.start,
			paramStartOffset: tokens[i + 2] ? tokens[i + 2].start : tokens[i + 1].end,
			paramEndOffset: tokens[close - 1] ? tokens[close - 1].end : tokens[i + 1].end,
			bodyOpenOffset: isFunctionBody ? after.start : null,
			bodyCloseOffset: bodyClose >= 0 ? tokens[bodyClose].end : null,
			declaration: true,
			external: hasExternPrefix
		};
		functions.push(item);
		declarationPositions.add(nameToken.start);
	}

	return { functions, declarationPositions };
}

/**
 * Builds a root scope and nested lexical scopes from opening and closing braces.
 * @param {Token[]} tokens Token stream whose braces define nested blocks.
 * @param {string} text Source text used to determine the root scope's end offset.
 * @returns {Scope[]} Scopes in discovery order, with parent and depth information.
 */
function buildLexicalScopes(tokens, text) {
	const root = { id: 0, parent: null, start: 0, end: text.length, depth: 0 };
	const scopes = [root];
	const stack = [root];

	for (const token of tokens) {
		if (token.value === "{") {
			const parent = stack[stack.length - 1];
			const scope = {
				id: scopes.length,
				parent,
				start: token.start,
				end: text.length,
				depth: parent.depth + 1
			};
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
 * @returns {void}
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
	return {
		name: nameToken.value,
		type: pointer ? "unknown" : type,
		token: nameToken,
		scope,
		visibleFrom,
		declarationOffset
	};
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
			parameterRanges.push({ start: fn.paramStartOffset, end: fn.paramEndOffset });
		}
		if (fn.bodyOpenOffset === null || fn.bodyOpenOffset === undefined) continue;
		const bodyScope = scopes.find(scope => scope.start === fn.bodyOpenOffset);
		if (!bodyScope) continue;
		for (const param of fn.params || []) {
			if (!param.name) continue;
			const token = tokens.find(item => item.value === param.name && item.start >= fn.paramStartOffset && item.end <= fn.paramEndOffset);
			if (!token) continue;
			addVariable(variables, param.name, {
				name: param.name,
				type: param.type || "unknown",
				token,
				scope: bodyScope,
				visibleFrom: bodyScope.start,
				declarationOffset: fn.offset
			});
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
		result.set(name, {
			name,
			value,
			params,
			description: `Workspace preprocessor definition${value ? ` (value: ${value})` : ""}.`,
			source: "workspace"
		});
	}
	return result;
}

/**
 * Creates the complete parsed representation used by completion, navigation and diagnostics.
 * @param {string} text LGC source text to parse.
 * @param {VSCODE.Uri} [uri] URI of the source document, when available.
 * @returns {ParsedSource} Tokens, declarations, variables, constants and declaration offsets.
 */
function parseSource(text, uri) {
	const tokens = tokenize(text);
	const parsedFunctions = parseFunctionDeclarations(tokens, text, uri);
	const variables = parseVariables(tokens, text, parsedFunctions.functions);
	const constants = parseDefines(text);
	inferFunctionReturnTypes(parsedFunctions.functions, tokens, variables, constants);
	return {
		tokens,
		functions: parsedFunctions.functions,
		declarationPositions: parsedFunctions.declarationPositions,
		variables,
		constants
	};
}

/**
 * Uses cached parsed document version for look up, if there is no such - parses document and returns it.
 * @param {VSCODE.TextDocument} document Document whose diagnostics should be refreshed.
 * @returns {DocumentCache}
 */
function getDocumentCache(document) {
	const key = document.uri.toString();
	const cached = DOCUMENT_CACHE.get(key);
	const version = document.version;

	if (cached && cached.version === version) {
		return cached;
	}

	const text = document.getText();
	const parsedSource = parseSource(text, document.uri);

	const documentCache = {
		version: version,
		parsedSource: parsedSource,
		functionsMap: new Lazy(() => makeFunctionMap(parsedSource)),
		constantsMap: new Lazy(() => makeConstantMap(parsedSource))
	}

	DOCUMENT_CACHE.set(key, documentCache);
	return documentCache;
}

/**
 * Merges bundled API functions, workspace declarations and current-document declarations.
 * Later sources override earlier entries with the same function name.
 * @param {VSCODE.TextDocument} document Document requesting the symbol map.
 * @param {ParsedSource} parsed Parsed representation of that document.
 * @returns {Map<string, LgcFunction>} Functions indexed by name.
 */
function makeFunctionMap(parsed) {
	const result = new Map();
	for (const item of FUNCTION_CATALOG) result.set(item.name, item);
	for (const [name, item] of workspaceFunctions) result.set(name, item);
	for (const item of parsed.functions) {
		if (!item.external || !result.has(item.name)) result.set(item.name, item);
	}
	return result;
}

/**
 * Merges bundled constants, indexed workspace constants and current-document definitions.
 * @param {ParsedSource} parsed Parsed representation of the current document.
 * @returns {Map<string, LgcConstant>} Constants indexed by name.
 */
function makeConstantMap(parsed) {
	const result = new Map();
	for (const item of CONSTANT_CATALOG) result.set(item.name, item);
	for (const [name, item] of workspaceConstants) result.set(name, item);
	for (const [name, item] of parsed.constants) result.set(name, item);
	return result;
}

/**
 * Splits an expression at selected operators while ignoring operators inside nested groups.
 * @param {Token[]} tokens Expression token stream.
 * @param {Set<string>} operators Operators that act as split points at nesting depth zero.
 * @returns {Token[][]} Expression segments, or an empty array when no split operator is found.
 */
function splitTopLevel(tokens, operators) {
	const parts = [];
	let start = 0;
	let paren = 0;
	let bracket = 0;
	let brace = 0;
	for (let i = 0; i < tokens.length; i++) {
		const value = tokens[i].value;
		if (value === "(") paren++;
		else if (value === ")") paren--;
		else if (value === "[") bracket++;
		else if (value === "]") bracket--;
		else if (value === "{") brace++;
		else if (value === "}") brace--;
		else if (operators.has(value) && paren === 0 && bracket === 0 && brace === 0) {
			parts.push(tokens.slice(start, i));
			start = i + 1;
		}
	}
	if (parts.length) parts.push(tokens.slice(start));
	return parts;
}

/**
 * Infers the primitive type of a constant from its literal replacement text.
 * @param {LgcConstant | null | undefined} constant Constant definition to inspect.
 * @returns {LgcType} `int`, `string`, `char` or `unknown` when the value is not a simple literal.
 */
function constantExpressionType(constant) {
	if (!constant || constant.value === undefined || constant.value === "") return "unknown";
	const value = String(constant.value).trim();
	if (/^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')$/.test(value)) {
		return value[0] === '"' ? "string" : "char";
	}
	if (/^[+-]?(?:0[xX][0-9A-Fa-f]+|\d+(?:\.\d+)?)$/.test(value)) return "int";
	return "unknown";
}

/**
 * Infers return types for workspace functions when every discovered return expression agrees.
 * The function objects are updated in place; uncertain or inconsistent results remain `unknown`.
 * @param {LgcFunction[]} functions Workspace functions to analyse.
 * @param {Token[]} tokens Token stream containing their bodies.
 * @param {VariableMap} variables Variables available to return expressions.
 * @param {Map<string, LgcConstant>} constants Known constants used by return expressions.
 * @returns {void}
 */
function inferFunctionReturnTypes(functions, tokens, variables, constants) {
	const functionMap = new Map(FUNCTION_CATALOG.map(fn => [fn.name, fn]));
	for (const fn of functions) {
		if (!fn.external || !functionMap.has(fn.name)) functionMap.set(fn.name, fn);
	}

	for (let pass = 0; pass < 3; pass++) {
		let changed = false;
		for (const fn of functions) {
			if (fn.returnType !== "unknown" || fn.bodyOpenOffset === null || fn.bodyOpenOffset === undefined ||
				fn.bodyCloseOffset === null || fn.bodyCloseOffset === undefined) continue;
			const returns = [];
			for (let i = 0; i < tokens.length; i++) {
				if (tokens[i].start <= fn.bodyOpenOffset || tokens[i].start >= fn.bodyCloseOffset || tokens[i].value !== "return") continue;
				let end = i + 1;
				let paren = 0;
				let bracket = 0;
				for (; end < tokens.length; end++) {
					const value = tokens[end].value;
					if (value === "(") paren++;
					else if (value === ")") paren--;
					else if (value === "[") bracket++;
					else if (value === "]") bracket--;
					if (value === ";" && paren === 0 && bracket === 0) break;
				}
				const expression = tokens.slice(i + 1, end);
				returns.push(expression.length
					? expressionType(expression, variables, functionMap, constants, expression[0].start)
					: "void");
			}
			if (!returns.length || returns.some(type => type === "unknown")) continue;
			const inferred = returns[0];
			if (returns.every(type => type === inferred)) {
				fn.returnType = inferred;
				fn.returnTypeSource = "inferred from return statements";
				functionMap.set(fn.name, fn);
				changed = true;
			}
		}
		if (!changed) break;
	}
}

/**
 * Conservatively infers the primitive type of a supported LGC expression.
 * Unknown, pointer-like and otherwise unsupported expressions deliberately remain `unknown`.
 * @param {Token[]} tokens Tokens forming the expression.
 * @param {VariableMap} variables Visible variable declarations.
 * @param {Map<string, LgcFunction>} functions Known function signatures.
 * @param {Map<string, LgcConstant>} constants Known constants and macros.
 * @param {number} [offset] Source offset used when resolving identifiers; defaults to the first token.
 * @returns {LgcType} Best-known expression type.
 */
function expressionType(tokens, variables, functions, constants, offset) {
	if (!tokens || !tokens.length) return "unknown";
	let list = tokens.slice();
	const expressionOffset = offset === undefined ? list[0].start : offset;

	while (list.length >= 2 && list[0].value === "(" && findMatching(list, 0, "(", ")") === list.length - 1) {
		list = list.slice(1, -1);
	}
	if (!list.length) return "unknown";

	if (list[0].value === "&" || list[0].value === "*") return "unknown";

	// Recognize simple C-style casts without attempting general pointer analysis.
	if (list[0].value === "(" && list[1] && TYPE_WORDS.has(list[1].value) && list[2] && list[2].value === ")" && list.length > 3) {
		return list[1].value;
	}

	// Array indexing preserves the declared element type for primitive LGC arrays.
	if (list[0].type === "identifier" && list[1] && list[1].value === "[") {
		const close = findMatching(list, 1, "[", "]");
		if (close === list.length - 1) {
			const variable = resolveVariable(variables, list[0].value, list[0].start);
			return variable ? (variable.type || "unknown") : "unknown";
		}
	}

	if (list.length >= 2 && list[0].type === "identifier" && list[1].value === "(") {
		const close = findMatching(list, 1, "(", ")");
		if (close === list.length - 1) {
			const fn = functions.get(list[0].value);
			return fn ? (fn.returnType || "unknown") : "unknown";
		}
	}

	if (list.length === 1) {
		const token = list[0];
		if (token.type === "string") return "string";
		if (token.type === "char") return "char";
		if (token.type === "number") return "int";
		if (token.type === "identifier") {
			const variable = resolveVariable(variables, token.value, token.start === undefined ? expressionOffset : token.start);
			if (variable) return variable.type || "unknown";
			const constant = constants.get(token.value);
			if (constant) return constantExpressionType(constant);
			const fn = functions.get(token.value);
			if (fn) return fn.returnType || "unknown";
			if (token.value === "sizeof") return "int";
		}
		return "unknown";
	}

	if (["+", "-", "!", "~", "++", "--"].includes(list[0].value) && list.length > 1) {
		if (list[0].value === "!" || list[0].value === "~") return "int";
		const operandType = expressionType(list.slice(1), variables, functions, constants, list[1].start);
		return operandType === "int" || operandType === "char" ? "int" : "unknown";
	}

	const comparisonParts = splitTopLevel(list, new Set(["==", "!=", "<", ">", "<=", ">=", "&&", "||"]));
	if (comparisonParts.length) return "int";

	const plusParts = splitTopLevel(list, new Set(["+"]));
	if (plusParts.length) {
		const types = plusParts.map(part => expressionType(part, variables, functions, constants, part[0] ? part[0].start : expressionOffset));
		if (types.includes("string")) return "string";
		if (types.every(type => type === "int" || type === "char")) return "int";
		return "unknown";
	}

	const arithmeticParts = splitTopLevel(list, new Set(["-", "*", "/", "%", "<<", ">>", "&", "|", "^"]));
	if (arithmeticParts.length) {
		const types = arithmeticParts.map(part => expressionType(part, variables, functions, constants, part[0] ? part[0].start : expressionOffset));
		return types.every(type => type === "int" || type === "char") ? "int" : "unknown";
	}

	if (list[0].value === "!" || list[0].value === "~" || list[0].value === "++" || list[0].value === "--" ||
		list[list.length - 1].value === "++" || list[list.length - 1].value === "--") return "int";

	if (list.some(token => token.type === "string")) return "string";
	if (list.some(token => token.type === "number")) return "unknown";
	return "unknown";
}

/**
 * Checks compatibility between two known primitive LGC types.
 * `int` and `char` are compatible because character values use integer storage.
 * @param {LgcType} expected Required type from a declaration or function signature.
 * @param {LgcType} actual Inferred type of the supplied expression.
 * @returns {boolean} Whether the actual type can be used where the expected type is required.
 */
function areTypesCompatible(expected, actual) {
	if (expected === actual) return true;
	// LGC uses integer storage for character values, as in C integer promotions.
	return (expected === "int" && actual === "char") || (expected === "char" && actual === "int");
}

/**
 * Creates a VS Code diagnostic covering the exact source range of a token.
 * @param {VSCODE.TextDocument} document Document containing the token.
 * @param {Token} token Token to underline.
 * @param {string} message Diagnostic message displayed to the user.
 * @param {VSCODE.DiagnosticSeverity} severity VS Code diagnostic severity.
 * @returns {VSCODE.Diagnostic} Diagnostic tagged with the `Locoland LGC` source label.
 */
function diagnostic(document, token, message, severity) {
	const start = document.positionAt(token.start);
	const end = document.positionAt(token.end);
	const result = new VSCODE.Diagnostic(new VSCODE.Range(start, end), message, severity);
	result.source = "Locoland LGC";
	return result;
}

/**
 * Runs the configured static checks for a document and returns all detected diagnostics.
 * Checks delimiters, known function arity and argument types, and assignments to typed variables.
 * @param {VSCODE.TextDocument} document Document being analysed.
 * @param {ParsedSource} parsed Parsed tokens and semantic data for the document.
 * @param {Map<string, LgcFunction>} functions Available engine, helper and workspace functions.
 * @param {Map<string, LgcConstant>} constants Available engine and workspace constants.
 * @returns {VSCODE.Diagnostic[]} Diagnostics produced by the enabled checks.
 */
function analyzeDocument(document, parsed, functions, constants) {
	const config = VSCODE.workspace.getConfiguration("lgc.analysis", document.uri);
	if (!config.get("enabled", true)) return [];

	const severityValue = config.get("severity", "Warning");
	const severity = severityValue === "Error" ? VSCODE.DiagnosticSeverity.Error :
		severityValue === "Information" ? VSCODE.DiagnosticSeverity.Information : VSCODE.DiagnosticSeverity.Warning;
	const diagnostics = [];
	const tokens = parsed.tokens;
	const variables = parsed.variables;

	const brackets = [];
	const closingToOpening = { ")": "(", "]": "[", "}": "{" };
	const matching = { "(": ")", "[": "]", "{": "}" };
	for (const token of tokens) {
		if (["(", "[", "{"].includes(token.value)) brackets.push(token);
		else if (closingToOpening[token.value]) {
			const top = brackets[brackets.length - 1];
			if (!top || top.value !== closingToOpening[token.value]) {
				diagnostics.push(diagnostic(document, token, `Unmatched closing '${token.value}'.`, VSCODE.DiagnosticSeverity.Error));
			} else {
				brackets.pop();
			}
		}
	}
	for (const token of brackets) {
		diagnostics.push(diagnostic(document, token, `Unclosed '${token.value}'.`, VSCODE.DiagnosticSeverity.Error));
	}

	const checkArity = config.get("checkFunctionArity", true);
	const checkTypes = config.get("checkArgumentTypes", true);
	const strictUnknown = config.get("strictUnknownFunctions", false);
	const knownFunctionNames = new Set(functions.keys());

	for (let i = 0; i < tokens.length - 1; i++) {
		const token = tokens[i];
		if (token.type !== "identifier" || tokens[i + 1].value !== "(") continue;
		if (parsed.declarationPositions.has(token.start) || CONTROL_WORDS.has(token.value)) continue;

		const lineStart = document.getText().lastIndexOf("\n", token.start - 1) + 1;
		const prefix = document.getText().slice(lineStart, token.start);
		if (/^\s*#\s*define\b/.test(prefix)) continue;

		const close = findMatching(tokens, i + 1, "(", ")");
		if (close < 0) continue;
		const args = splitTokenArguments(tokens, i + 2, close);
		const fn = functions.get(token.value);

		if (!fn) {
			if (strictUnknown && !knownFunctionNames.has(token.value)) {
				diagnostics.push(diagnostic(document, token, `Unknown function '${token.value}'. Add its script to the workspace or declare it before using strict mode.`, severity));
			}
			continue;
		}

		const required = (fn.params || []).filter(param => !param.optional).length;
		const maximum = (fn.params || []).length;
		if (checkArity && (args.length < required || args.length > maximum)) {
			diagnostics.push(diagnostic(document, token,
				`${token.value} expects ${required === maximum ? required : `${required}-${maximum}`} argument(s), but ${args.length} supplied.`,
				severity));
		}

		if (checkTypes && fn.params) {
			for (let argIndex = 0; argIndex < Math.min(args.length, fn.params.length); argIndex++) {
				const expected = fn.params[argIndex].type;
				if (expected !== "int" && expected !== "string" && expected !== "char") continue;
				const argument = args[argIndex];
				const actual = expressionType(argument, variables, functions, constants, argument[0] ? argument[0].start : token.start);
				if (actual !== "unknown" && !areTypesCompatible(expected, actual)) {
					const arg = args[argIndex][0];
					diagnostics.push(diagnostic(document, arg,
						`Argument ${argIndex + 1} of ${token.value} expects ${expected}, but the expression is ${actual}.`,
						severity));
				}
			}
		}
	}

	if (config.get("checkAssignments", true)) {
		for (let i = 1; i < tokens.length - 1; i++) {
			if (tokens[i].value !== "=" || tokens[i - 1].type !== "identifier") continue;
			const previous = tokens[i - 2] ? tokens[i - 2].value : "";
			const next = tokens[i + 1] ? tokens[i + 1].value : "";
			if (["=", "!", "<", ">"].includes(previous) || next === "=") continue;
			const target = resolveVariable(variables, tokens[i - 1].value, tokens[i - 1].start);
			if (!target || !["int", "string", "char"].includes(target.type)) continue;

			let end = i + 1;
			let nesting = 0;
			for (; end < tokens.length; end++) {
				const v = tokens[end].value;
				if (["(", "["].includes(v)) nesting++;
				else if ([")", "]"].includes(v)) {
					if (nesting === 0) break;
					nesting--;
				}
				if (nesting === 0 && (v === ";" || v === ",")) break;
			}
			const rhsTokens = tokens.slice(i + 1, end);
			const actual = expressionType(rhsTokens, variables, functions, constants, rhsTokens[0] ? rhsTokens[0].start : tokens[i].start);
			if (actual !== "unknown" && !areTypesCompatible(target.type, actual)) {
				diagnostics.push(diagnostic(document, tokens[i - 1],
					`Cannot assign ${actual} to ${target.type} variable '${tokens[i - 1].value}'.`,
					severity));
			}
		}
	}

	return diagnostics;
}

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
function completionForFunction(fn) {
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
function wordRangeAt(document, position) {
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
function currentFunctionAt(document, position, functions) {
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
	return { fn, activeParameter };
}

/**
 * Rebuilds the workspace function and constant indexes from all matching `.lgc` files.
 * Concurrent callers share the same in-flight refresh promise.
 * @returns {Promise<void>} Promise resolved after the workspace indexes have been replaced.
 */
async function refreshWorkspaceIndex() {
	if (refreshPromise) return refreshPromise;
	refreshPromise = (async () => {
		const limit = VSCODE.workspace.getConfiguration("lgc.analysis").get("maxWorkspaceFiles", 500);
		const files = await VSCODE.workspace.findFiles("**/*.lgc", "**/{node_modules,.git,dist,out}/**", limit);
		const nextFunctions = new Map();
		const nextConstants = new Map();
		for (const uri of files) {
			try {
				const openDoc = VSCODE.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
				const text = openDoc ? openDoc.getText() : Buffer.from(await VSCODE.workspace.fs.readFile(uri)).toString("utf8");
				const parsed = parseSource(text, uri);
				for (const fn of parsed.functions) {
					const isBundledEngineFunction = fn.external && FUNCTION_CATALOG.some(item => item.name === fn.name);
					if (!isBundledEngineFunction && !nextFunctions.has(fn.name)) nextFunctions.set(fn.name, fn);
				}
				for (const [name, value] of parsed.constants) nextConstants.set(name, value);
			} catch (_error) {
				// Ignore files that cannot be read; other workspace scripts remain available.
			}
		}
		workspaceFunctions = nextFunctions;
		workspaceConstants = nextConstants;
	})().finally(() => { refreshPromise = undefined; });
	return refreshPromise;
}

/**
 * Schedules a debounced workspace-index refresh and then re-runs diagnostics for open LGC files.
 * @returns {void}
 */
function scheduleWorkspaceRefresh() {
	if (refreshTimer) clearTimeout(refreshTimer);
	refreshTimer = setTimeout(() => {
		refreshTimer = undefined;
		refreshWorkspaceIndex().then(() => {
			for (const document of VSCODE.workspace.textDocuments) {
				if (document.languageId === "lgc") updateDiagnostics(document);
			}
		}).catch(() => undefined);
	}, 250);
}

/**
 * Parses the supplied LGC document and replaces its current static-analysis diagnostics.
 * Non-LGC documents and calls made before activation are ignored.
 * @param {VSCODE.TextDocument} document Document whose diagnostics should be refreshed.
 * @returns {void}
 */
function updateDiagnostics(document) {
	if (!diagnosticCollection || document.languageId !== "lgc") return;
	const cachedDocument = getDocumentCache(document);
	diagnosticCollection.set(document.uri, analyzeDocument(
		document,
		cachedDocument.parsedSource,
		cachedDocument.functionsMap.get(),
		cachedDocument.constantsMap.get()
	));
}

/**
 * Activates the LGC language extension and registers its formatter, IntelliSense providers,
 * navigation providers, workspace listeners and user commands.
 * @param {VSCODE.ExtensionContext} context VS Code extension context for disposable registrations.
 * @returns {void}
 */
function activate(context) {
	diagnosticCollection = VSCODE.languages.createDiagnosticCollection("lgc");
	context.subscriptions.push(diagnosticCollection);

	const selector = { language: "lgc", scheme: "file" };

	context.subscriptions.push(VSCODE.languages.registerDocumentFormattingEditProvider(selector, {
		/**
		 * Produces document-wide formatting edits using the extension's configured LGC style.
		 * @param {VSCODE.TextDocument} document LGC document to format.
		 * @param {VSCODE.FormattingOptions} formattingOptions Editor indentation settings used by `editor` mode.
		 * @returns {VSCODE.TextEdit[]} Replacement edit, or an empty array when the document is already formatted.
		 */
		provideDocumentFormattingEdits(document, formattingOptions) {
			const config = VSCODE.workspace.getConfiguration("lgc.format", document.uri);
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
			return [VSCODE.TextEdit.replace(
				new VSCODE.Range(document.positionAt(0), document.positionAt(source.length)),
				formatted
			)];
		}
	}));

	context.subscriptions.push(VSCODE.languages.registerCompletionItemProvider(selector, {
		/**
		 * Provides completions for known functions, constants and LGC keywords.
		 * @param {VSCODE.TextDocument} document Document being completed.
		 * @param {VSCODE.Position} position Cursor position used to determine the current prefix.
		 * @returns {VSCODE.CompletionList} Completion items in extension-defined priority order.
		 */
		provideCompletionItems(document, position) {
			const cachedDocument = getDocumentCache(document);
			const functions = cachedDocument.functionsMap.get();
			const constants = cachedDocument.constantsMap.get();
			const items = [];
			const prefixRange = wordRangeAt(document, position);
			const prefix = prefixRange ? document.getText(prefixRange) : "";

			for (const fn of functions.values()) {
				if (!prefix || fn.name.toLowerCase().startsWith(prefix.toLowerCase())) items.push(completionForFunction(fn));
			}
			for (const constant of constants.values()) {
				if (!prefix || constant.name.toLowerCase().startsWith(prefix.toLowerCase())) {
					const item = new VSCODE.CompletionItem(constant.name, VSCODE.CompletionItemKind.Constant);
					item.detail = constant.value ? `LGC constant = ${constant.value}` : "LGC constant";
					item.documentation = new VSCODE.MarkdownString(constant.description || "Game-script constant.");
					item.sortText = `3_${constant.name}`;
					items.push(item);
				}
			}
			if (!prefix) {
				for (const keyword of KEYWORDS) {
					const item = new VSCODE.CompletionItem(keyword, VSCODE.CompletionItemKind.Keyword);
					item.sortText = `9_${keyword}`;
					items.push(item);
				}
			}
			return new VSCODE.CompletionList(items, false);
		}
	}, ".", "#"));

	context.subscriptions.push(VSCODE.languages.registerHoverProvider(selector, {
		/**
		 * Shows documentation for a variable, known function or constant under the cursor.
		 * @param {VSCODE.TextDocument} document Document containing the hovered symbol.
		 * @param {VSCODE.Position} position Cursor position to resolve.
		 * @returns {VSCODE.Hover | null} Hover contents, or `null` when the symbol is unknown.
		 */
		provideHover(document, position) {
			const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
			if (!range) return null;
			const name = document.getText(range);
			const cachedDocument = getDocumentCache(document);
			const functions = cachedDocument.functionsMap.get();
			const constants = cachedDocument.constantsMap.get();
			const variable = resolveVariable(cachedDocument.parsedSource.variables, name, document.offsetAt(position));
			if (variable) return new VSCODE.Hover(new VSCODE.MarkdownString(`**\`${name}\`**\n\nType: \`${variable.type}\``), range);
			const fn = functions.get(name);
			if (fn) return new VSCODE.Hover(new VSCODE.MarkdownString(markdownForFunction(fn)), range);
			const constant = constants.get(name);
			if (constant) {
				return new VSCODE.Hover(new VSCODE.MarkdownString(`**\`${name}\`**\n\n${constant.description || "LGC constant."}${constant.value ? `\n\n**Value:** \`${constant.value}\`` : ""}\n\n**Source:** \`${constant.source || "workspace"}\``), range);
			}
			return null;
		}
	}));

	context.subscriptions.push(VSCODE.languages.registerSignatureHelpProvider(selector, {
		/**
		 * Provides the active function signature and argument index for the current call.
		 * @param {VSCODE.TextDocument} document Document containing the function call.
		 * @param {VSCODE.Position} position Cursor position within the argument list.
		 * @returns {VSCODE.SignatureHelp | null} Signature information, or `null` when no known call is active.
		 */
		provideSignatureHelp(document, position) {
			const cachedDocument = getDocumentCache(document);
			const functions = cachedDocument.functionsMap.get();
			const active = currentFunctionAt(document, position, functions);
			if (!active) return null;
			const info = new VSCODE.SignatureInformation(active.fn.signature || `${active.fn.name}()`, active.fn.description || "");
			info.parameters = (active.fn.params || []).map(param => new VSCODE.ParameterInformation(
				`${param.type} ${param.name}${param.optional ? ` = ${param.default}` : ""}`,
				""
			));
			const help = new VSCODE.SignatureHelp();
			help.signatures = [info];
			help.activeSignature = 0;
			help.activeParameter = Math.min(active.activeParameter, Math.max(0, info.parameters.length - 1));
			return help;
		}
	}, "(", ","));

	context.subscriptions.push(VSCODE.languages.registerDefinitionProvider(selector, {
		/**
		 * Resolves a workspace function name to the file and position of its declaration.
		 * @param {VSCODE.TextDocument} document Document containing the symbol reference.
		 * @param {VSCODE.Position} position Cursor position on the symbol name.
		 * @returns {VSCODE.Location | null} Declaration location, or `null` when no indexed definition exists.
		 */
		provideDefinition(document, position) {
			const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
			if (!range) return null;
			const name = document.getText(range);
			const fn = workspaceFunctions.get(name);
			if (fn && fn.uri && fn.position !== undefined) {
				return new VSCODE.Location(fn.uri, documentPositionFromOffset(fn.uri, fn.position));
			}
			return null;
		}
	}));

	context.subscriptions.push(VSCODE.languages.registerWorkspaceSymbolProvider({
		/**
		 * Returns indexed workspace functions matching the user's symbol search query.
		 * @param {string} query Case-insensitive substring used to filter function names.
		 * @returns {VSCODE.SymbolInformation[]} Matching workspace function symbols.
		 */
		provideWorkspaceSymbols(query) {
			const symbols = [];
			for (const fn of workspaceFunctions.values()) {
				if (!query || fn.name.toLowerCase().includes(query.toLowerCase())) {
					if (fn.uri && fn.position !== undefined) {
						symbols.push(new VSCODE.SymbolInformation(
							fn.name,
							VSCODE.SymbolKind.Function,
							fn.category || "LGC",
							new VSCODE.Location(fn.uri, documentPositionFromOffset(fn.uri, fn.position))
						));
					}
				}
			}
			return symbols;
		}
	}));

	context.subscriptions.push(VSCODE.workspace.onDidOpenTextDocument(document => {
		if (document.languageId === "lgc") {
			updateDiagnostics(document);
			scheduleWorkspaceRefresh();
		}
	}));
	context.subscriptions.push(VSCODE.workspace.onDidChangeTextDocument(event => {
		if (event.document.languageId === "lgc") updateDiagnostics(event.document);
	}));
	context.subscriptions.push(VSCODE.workspace.onDidSaveTextDocument(document => {
		if (document.languageId === "lgc") {
			updateDiagnostics(document);
			scheduleWorkspaceRefresh();
		}
	}));
	context.subscriptions.push(VSCODE.workspace.onDidCloseTextDocument(document => {
		if (document.languageId === "lgc") diagnosticCollection.delete(document.uri);
	}));

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
		updateDiagnostics(editor.document);
		const count = diagnosticCollection.get(editor.document.uri) || [];
		VSCODE.window.showInformationMessage(`LGC analysis completed: ${count.length} diagnostic(s).`);
	}));

	refreshWorkspaceIndex().then(() => {
		for (const document of VSCODE.workspace.textDocuments) {
			if (document.languageId === "lgc") updateDiagnostics(document);
		}
	}).catch(() => undefined);

	for (const document of VSCODE.workspace.textDocuments) {
		if (document.languageId === "lgc") updateDiagnostics(document);
	}
}

/**
 * Converts a stored source position or offset into a VS Code document position.
 * If only a numeric offset is available, the matching open document is used when possible.
 * @param {VSCODE.Uri} uri URI identifying the source document.
 * @param {VSCODE.Position | SourcePosition | number} position Existing line/character position or numeric offset.
 * @returns {VSCODE.Position} Resolved position; `(0, 0)` is used when the document is not open.
 */
function documentPositionFromOffset(uri, position) {
	if (position && typeof position.line === "number" && typeof position.character === "number") {
		return new VSCODE.Position(position.line, position.character);
	}
	const document = VSCODE.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
	if (!document) return new VSCODE.Position(0, 0);
	return document.positionAt(typeof position === "number" ? position : 0);
}

/**
 * Releases the pending workspace-refresh timer when the extension is deactivated.
 * @returns {void}
 */
function deactivate() {
	if (refreshTimer) clearTimeout(refreshTimer);
}

module.exports = {
	activate,
	deactivate,
	__test: {
		tokenize,
		parseSource,
		makeFunctionMap,
		makeConstantMap,
		analyzeDocument,
		expressionType,
		resolveVariable,
		parseVariables,
		inferFunctionReturnTypes,
		splitTokenArguments,
		formatLgcText
	}
};
