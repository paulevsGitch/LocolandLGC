"use strict";

const { CONTROL_WORDS, TYPE_WORDS } = require("./language-constants");
const { tokenize, findMatching } = require("./lexer");
const { splitTokenArguments, resolveVariable } = require("./parser");
const { LgcFunction } = require("./models");
const { isAlwaysAvailableSource, normalizeLgcSource } = require("./header-symbols");
const GLOBAL_VARIABLE_CATALOG = require("../data/global-variables.json");
const GLOBAL_VARIABLES_BY_NAME = new Map(GLOBAL_VARIABLE_CATALOG.map(item => [item.name, item]));

/** @typedef {Map<string, import("./models").VariableDeclaration[]>} VariableMap */

/**
 * Splits an expression at selected operators, ignoring operators inside nested groups.
 * @param {import("./models").Token[]} tokens Expression token stream.
 * @param {Set<string>} operators Operators to split at nesting depth zero.
 * @returns {import("./models").Token[][]} Expression segments, or `[]` when no split exists.
 */
function splitTopLevel(tokens, operators) {
	const parts = [];
	let start = 0, paren = 0, bracket = 0, brace = 0;
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
 * Infers the primitive type represented by a simple macro replacement value.
 * Only quoted string/character and numeric literal replacements are classified.
 * Compound macros remain `unknown` unless their complete expression is analysed elsewhere.
 * @param {import("./models").LgcConstant|null|undefined} constant Constant to inspect.
 * @returns {import("./models").LgcType} `int`, `string`, `char` or `unknown`.
 */
function constantExpressionType(constant) {
	if (!constant || constant.value === undefined || constant.value === "") return "unknown";
	const value = String(constant.value).trim();
	if (/^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')$/.test(value)) return value[0] === '"' ? "string" : "char";
	if (/^[+-]?(?:0[xX][0-9A-Fa-f]+|\d+(?:\.\d+)?)$/.test(value)) return "int";
	return "unknown";
}

/**
 * Checks whether an initializer can be evaluated without reading runtime state.
 * Literals, supported operators, brace arrays and recursively resolvable object-like
 * macros are accepted. Variables and function calls are rejected. Unknown all-uppercase
 * identifiers are treated as possible build-time defines to avoid false positives when
 * the game build supplies macros that are not present in the workspace.
 *
 * @param {import("./models").Token[]} tokens Initializer expression.
 * @param {Map<string, import("./models").LgcConstant>} constants Known constants/macros.
 * @param {Set<string>} [expansionStack] Macro names currently being expanded (cycle guard).
 * @param {VariableMap} [variables] Known variables, used to distinguish variables from defines.
 * @returns {boolean} Whether the expression is accepted as compile-time constant.
 */
function isCompileTimeConstant(tokens, constants, expansionStack = new Set(), variables) {
	if (!tokens || !tokens.length) return false;
	let list = tokens.slice();
	while (list.length >= 2 && list[0].value === "(" && findMatching(list, 0, "(", ")") === list.length - 1) {
		list = list.slice(1, -1);
	}
	if (list.length >= 2 && list[0].value === "{" && findMatching(list, 0, "{", "}") === list.length - 1) {
		const elements = splitTokenArguments(list, 1, list.length - 1);
		return elements.every(element => isCompileTimeConstant(element, constants, expansionStack, variables));
	}
	const allowedOperators = new Set([
		"+", "-", "*", "/", "%", "<<", ">>", "&", "|", "^", "~", "!",
		"<", ">", "<=", ">=", "==", "!=", "&&", "||", "?", ":", "(", ")"
	]);
	for (let i = 0; i < list.length; i++) {
		const token = list[i];
		if (["number", "string", "char"].includes(token.type)) continue;
		if (token.type === "identifier") {
			const isTypeCast = TYPE_WORDS.has(token.value) && list[i - 1] && list[i - 1].value === "(" &&
				list[i + 1] && list[i + 1].value === ")";
			if (isTypeCast) continue;
			if (variables && resolveVariable(variables, token.value, token.start)) return false;
			if (list[i + 1] && list[i + 1].value === "(") return false;
			const constant = constants && constants.get(token.value);
			if (!constant && /^[A-Z_][A-Z0-9_]*$/.test(token.value)) continue;
			if (!constant || constant.value === undefined || constant.value === "" || expansionStack.has(token.value)) return false;
			const nextStack = new Set(expansionStack);
			nextStack.add(token.value);
			if (!isCompileTimeConstant(tokenize(String(constant.value)), constants, nextStack, variables)) return false;
			continue;
		}
		if (["{", "}", "[", "]", ","].includes(token.value)) continue;
		if (!allowedOperators.has(token.value)) return false;
	}
	return true;
}

/**
 * Infers workspace function return types only when every observed return expression agrees.
 * Inference is intentionally conservative: mixed, missing or unknown return expressions
 * do not produce a guessed result. A small number of passes allows calls to functions whose
 * return types were inferred earlier in the same document to flow into their callers.
 *
 * @param {import("./models").LgcFunction[]} functions Functions declared in the document.
 * @param {import("./models").Token[]} tokens Document token stream.
 * @param {VariableMap} variables Scope-aware variable declarations.
 * @param {Map<string, import("./models").LgcConstant>} constants Known constants/macros.
 * @param {Array<object>} [functionCatalog=[]] Bundled engine/helper function definitions.
 */
function inferFunctionReturnTypes(functions, tokens, variables, constants, functionCatalog = []) {
	const functionMap = new Map(functionCatalog.map(item => {
		const fn = item instanceof LgcFunction ? item : new LgcFunction(item);
		return [fn.name, fn];
	}));
	for (const fn of functions) {
		const catalogFunction = functionMap.get(fn.name);
		const catalogOwnsSource = catalogFunction && isAlwaysAvailableSource(catalogFunction.source) &&
			normalizeLgcSource(catalogFunction.source) === normalizeLgcSource(fn.source);
		if ((!fn.external || !functionMap.has(fn.name)) && !catalogOwnsSource) functionMap.set(fn.name, fn);
	}
	for (let pass = 0; pass < 3; pass++) {
		let changed = false;
		for (const fn of functions) {
			if (fn.returnType !== "unknown" || fn.bodyOpenOffset === null || fn.bodyOpenOffset === undefined ||
				fn.bodyCloseOffset === null || fn.bodyCloseOffset === undefined) continue;
			const returns = [];
			for (let i = 0; i < tokens.length; i++) {
				if (tokens[i].start <= fn.bodyOpenOffset || tokens[i].start >= fn.bodyCloseOffset || tokens[i].value !== "return") continue;
				let end = i + 1, paren = 0, bracket = 0;
				for (; end < tokens.length; end++) {
					const value = tokens[end].value;
					if (value === "(") paren++;
					else if (value === ")") paren--;
					else if (value === "[") bracket++;
					else if (value === "]") bracket--;
					if (value === ";" && paren === 0 && bracket === 0) break;
				}
				const expression = tokens.slice(i + 1, end);
				returns.push(expression.length ? expressionType(expression, variables, functionMap, constants, expression[0].start) : "void");
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
 * Literal types are exact; identifiers resolve through lexical scopes, constants or known
 * functions; array indexing preserves the declared element type; and supported arithmetic,
 * comparisons and string concatenation infer their common result types. Pointer-like,
 * engine-specific or otherwise ambiguous expressions deliberately remain `unknown`.
 *
 * @param {import("./models").Token[]} tokens Tokens forming the expression.
 * @param {VariableMap} variables Visible variable declarations.
 * @param {Map<string, import("./models").LgcFunction>} functions Known function signatures.
 * @param {Map<string, import("./models").LgcConstant>} constants Known constants/macros.
 * @param {number} [offset] Offset used to resolve identifiers; defaults to the first token.
 * @returns {import("./models").LgcType} Best-known primitive expression type.
 */
function expressionType(tokens, variables, functions, constants, offset) {
	if (!tokens || !tokens.length) return "unknown";
	let list = tokens.slice();
	const expressionOffset = offset === undefined ? list[0].start : offset;
	while (list.length >= 2 && list[0].value === "(" && findMatching(list, 0, "(", ")") === list.length - 1) list = list.slice(1, -1);
	if (!list.length || list[0].value === "&" || list[0].value === "*") return "unknown";
	if (list[0].value === "(" && list[1] && TYPE_WORDS.has(list[1].value) && list[2] && list[2].value === ")" && list.length > 3) return list[1].value;
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
	if (splitTopLevel(list, new Set(["==", "!=", "<", ">", "<=", ">=", "&&", "||"])).length) return "int";
	const plusParts = splitTopLevel(list, new Set(["+"]));
	if (plusParts.length) {
		const types = plusParts.map(part => expressionType(part, variables, functions, constants, part[0] ? part[0].start : expressionOffset));
		// LGC does not implicitly convert integer operands to strings for `+`.
		// Keep the expression unknown here; the dedicated diagnostic below explains `itoa()`.
		if (types.includes("string")) {
			if (types.includes("int") || types.includes("unknown")) return "unknown";
			return "string";
		}
		if (types.every(type => type === "int" || type === "char")) return "int";
		return "unknown";
	}
	const arithmeticParts = splitTopLevel(list, new Set(["-", "*", "/", "%", "<<", ">>", "&", "|", "^"]));
	if (arithmeticParts.length) {
		const types = arithmeticParts.map(part => expressionType(part, variables, functions, constants, part[0] ? part[0].start : expressionOffset));
		return types.every(type => type === "int" || type === "char") ? "int" : "unknown";
	}
	if (["!", "~", "++", "--"].includes(list[0].value) || ["++", "--"].includes(list[list.length - 1].value)) return "int";
	if (list.some(token => token.type === "string")) return "string";
	return "unknown";
}

/**
 * Applies the analyser's known primitive compatibility rule.
 * `int` and `char` are compatible numeric types; `string` is not implicitly converted.
 * Unknown types are handled by callers and are not passed here as a positive match.
 * @param {import("./models").LgcType} expected Declared parameter/variable type.
 * @param {import("./models").LgcType} actual Inferred expression type.
 * @returns {boolean} Whether the two known types are compatible.
 */
function areTypesCompatible(expected, actual) {
	if (expected === actual) return true;
	return (expected === "int" && actual === "char") || (expected === "char" && actual === "int");
}

/**
 * Creates a source diagnostic from a token range and attaches the LGC diagnostic code.
 * @param {*} VSCODE VS Code API namespace.
 * @param {*} document VS Code text document.
 * @param {{start:number, end?:number}} token Source offsets; `end` may be omitted for identifiers.
 * @param {string} message User-facing diagnostic message including explanation/fix where relevant.
 * @param {*} severity VS Code diagnostic severity.
 * @param {string} [code] Stable diagnostic code used by Quick Fix providers.
 * @param {*} [data] Optional diagnostic metadata.
 * @returns {*} VS Code `Diagnostic` instance.
 */
function diagnostic(VSCODE, document, token, message, severity, code, data) {
	const start = document.positionAt(token.start);
	const end = document.positionAt(token.end);
	const result = new VSCODE.Diagnostic(new VSCODE.Range(start, end), message, severity);
	result.source = "Locoland LGC";
	if (code) result.code = code;
	if (data !== undefined) result.data = data;
	return result;
}

/** Returns a stable parameter-type key used to detect unsupported overloads. */
function functionParameterKey(fn) { return (fn.params || []).map(param => param.type || "unknown").join(","); }
/** Normalises a workspace-relative source path without discarding its parent directories. */
function normalizeWorkspaceSourcePath(source) {
	return String(source || "").replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase();
}
/** Returns whether a parsed function entry owns a braced implementation. */
function hasFunctionBody(fn) { return fn.bodyOpenOffset !== null && fn.bodyOpenOffset !== undefined; }
/** Checks whether a declaration is guarded by `#ifndef` for the same function name. */
function isConditionalFallback(fn, name) { return (fn.preprocessorGuards || []).includes(name); }
/**
 * Identifies a compatible prototype/definition pair that is not a name collision.
 * Parameter types must match; an unknown return type is accepted as incomplete metadata.
 */
function isCompatibleForwardDeclarationPair(left, right) {
	const sameParameters = functionParameterKey(left) === functionParameterKey(right);
	const leftReturn = left.returnType || "unknown";
	const rightReturn = right.returnType || "unknown";
	const compatibleReturns = leftReturn === "unknown" || rightReturn === "unknown" || leftReturn === rightReturn;
	return sameParameters && compatibleReturns && (!hasFunctionBody(left) || !hasFunctionBody(right));
}

/**
 * Finds why a function name is unavailable in LGC's single-name function namespace.
 * Detects engine API collisions, duplicate definitions, parameter-list overloads,
 * return-type conflicts and same-name definitions in other indexed workspace files.
 * Conditional `#ifndef NAME` fallbacks and compatible prototype/definition pairs are ignored.
 *
 * @param {import("./models").LgcFunction} fn Function entry being checked.
 * @param {import("./models").ParsedSource} parsed Current document parse.
 * @param {Array<object>} [functionCatalog=[]] Bundled engine and helper function entries.
 * @param {Map<string, import("./models").LgcFunction[]>} [workspaceFunctionEntries] All workspace declarations by name.
 * @returns {string|null} Human-readable collision reason, or `null` when the name is available.
 */
function functionCollisionReason(fn, parsed, functionCatalog = [], workspaceFunctionEntries = new Map(), includes = []) {
	// Every record in data/functions.json is part of the bundled standard API catalogue.
	// Do not re-filter it by `source` here: old catalogue fixtures and consumer-provided
	// catalogue subsets may omit source metadata, but the function name is still reserved.
	const catalogueEntries = Array.isArray(functionCatalog)
		? functionCatalog
		: functionCatalog && typeof functionCatalog.values === "function"
			? [...functionCatalog.values()]
			: [];
	const engineFunction = catalogueEntries.find(item => item && item.name === fn.name);
	// Catalogue entries contain only basenames (for example `export.lgc`). A parsed
	// declaration is considered to come from that catalogue source only when its actual
	// workspace path or URI points into the game's shared maps/script directory. Matching
	// basenames alone would let a level-local file named `export.lgc` bypass API collisions.
	const uriPath = fn.uri && (fn.uri.fsPath || fn.uri.path || fn.uri.toString && fn.uri.toString()) || "";
	const parsedSourcePath = `${fn.source || ""} ${uriPath}`.replace(/\\/g, "/");
	const isStandardScriptPath = /(?:^|\/)maps\/script\//i.test(parsedSourcePath);
	const sameCatalogSource = Boolean(engineFunction && isStandardScriptPath &&
		normalizeLgcSource(fn.source || uriPath) === normalizeLgcSource(engineFunction.source));
	// A user-authored prototype (`extern`) is still a declaration and cannot replace an
	// engine API name. Only the corresponding declaration parsed from the actual standard
	// library source is exempt from the collision diagnostic.
	if (engineFunction && !sameCatalogSource) return "the standard header already provides a function with this name";
	const isVisibleOtherDeclaration = item => {
		if (!item || item.external) return false;
		if (item.uri && fn.uri && item.uri.toString() === fn.uri.toString()) return false;
		if (normalizeWorkspaceSourcePath(item.source) === normalizeWorkspaceSourcePath(fn.source)) return false;
		const source = item.source || "";
		return isAlwaysAvailableSource(source) || isFunctionSourceIncluded(source, includes, fn.offset);
	};
	const sameName = parsed.functions.filter(item => item.name === fn.name &&
		(item === fn || (!isConditionalFallback(item, fn.name) && !isConditionalFallback(fn, fn.name))));
	if (sameName.length <= 1) {
		const otherEntries = workspaceFunctionEntries.get(fn.name) || [];
		const other = otherEntries.find(item => isVisibleOtherDeclaration(item) && !isConditionalFallback(item, fn.name) &&
			!isCompatibleForwardDeclarationPair(fn, item));
		return other ? `another included script already declares this function (${other.source || "workspace"})` : null;
	}
	const definitions = sameName.filter(hasFunctionBody);
	const signatureKeys = new Set(sameName.map(functionParameterKey));
	const returnTypes = new Set(sameName.map(item => item.returnType || "unknown").filter(type => type !== "unknown"));
	if (signatureKeys.size > 1) return "the name is already declared with a different parameter list (function overloading is unsupported)";
	if (returnTypes.size > 1) return "the name is already declared with a different return type";
	if (definitions.length > 1) return "another definition with the same name already exists in this file";
	const otherEntries = workspaceFunctionEntries.get(fn.name) || [];
	const other = otherEntries.find(item => isVisibleOtherDeclaration(item) && !isConditionalFallback(item, fn.name) &&
		!isCompatibleForwardDeclarationPair(fn, item));
	return other ? `another included script already declares this function (${other.source || "workspace"})` : null;
}

/**
 * Explains the first runtime-dependent or unresolved token in a rejected initializer.
 * The message is paired with a suggested declaration-then-assignment rewrite.
 * @param {import("./models").VariableDeclaration} declaration Variable declaration under analysis.
 * @param {Map<string, import("./models").LgcConstant>} constants Known constants/macros.
 * @param {VariableMap} variables Scope-aware variable declarations.
 * @param {Map<string, import("./models").LgcFunction>} functions Known functions.
 * @returns {string} Concise reason suitable for a VS Code diagnostic.
 */
function explainNonConstantInitializer(declaration, constants, variables, functions) {
	for (let i = 0; i < declaration.initializerTokens.length; i++) {
		const token = declaration.initializerTokens[i];
		if (token.type !== "identifier") continue;
		if (resolveVariable(variables, token.value, token.start)) return `'${token.value}' is a runtime variable`;
		if (declaration.initializerTokens[i + 1] && declaration.initializerTokens[i + 1].value === "(") {
			return functions && functions.has(token.value)
				? `function call '${token.value}()' is evaluated at runtime`
				: `call expression '${token.value}()' is evaluated at runtime`;
		}
		if (constants && constants.has(token.value)) continue;
		if (/^[A-Z_][A-Z0-9_]*$/.test(token.value)) continue;
		if (!TYPE_WORDS.has(token.value)) return `'${token.value}' is not a known compile-time constant`;
	}
	return "the expression contains an operation or value that cannot be resolved at compile time";
}

/**
 * Returns physical lines occupied by preprocessor directives, including backslash continuations.
 * Token data is used so a hash inside a block comment is not mistaken for a directive.
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Complete source text.
 * @returns {Set<number>} Zero-based lines to exclude from statement checks.
 */
function preprocessorLines(tokens, sourceText) {
	const lines = sourceText.split(/\r?\n/);
	const tokensByLine = Array.from({ length: lines.length }, () => []);
	for (const token of tokens || []) {
		if (Number.isInteger(token.line) && tokensByLine[token.line]) tokensByLine[token.line].push(token);
	}
	const ignored = new Set();
	let continuation = false;
	for (let line = 0; line < lines.length; line++) {
		const firstToken = tokensByLine[line][0];
		const startsDirective = firstToken && firstToken.value === "#" && /^\s*#/.test(lines[line]);
		if (!continuation && !startsDirective) continue;
		ignored.add(line);
		continuation = /\\\s*$/.test(lines[line]);
	}
	return ignored;
}

/**
 * Finds `int` declarations placed directly in a `for` initializer.
 * LGC does not support this declaration form; the loop variable must be declared
 * before the loop and assigned in its initializer instead.
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Source text used to skip preprocessor lines.
 * @returns {Array<{typeToken: import("./models").Token, nameToken: import("./models").Token}>}
 */
function findForLoopIntDeclarations(tokens, sourceText = "") {
	const declarations = [];
	const ignoredLines = sourceText ? preprocessorLines(tokens, sourceText) : new Set();
	for (let i = 0; i < tokens.length - 3; i++) {
		if (ignoredLines.has(tokens[i].line)) continue;
		if (tokens[i].value !== "for" || tokens[i + 1].value !== "(" || tokens[i + 2].value !== "int") continue;
		const nameToken = tokens[i + 3];
		if (!nameToken || nameToken.type !== "identifier") continue;
		declarations.push({ typeToken: tokens[i + 2], nameToken });
	}
	return declarations;
}

const SEMICOLON_CONTINUATION_TOKENS = new Set([
	",", ".", "=", "+", "-", "*", "/", "%", "&", "|", "^", "!", "~",
	"<", ">", "<=", ">=", "==", "!=", "&&", "||", "?", "(", "[", "->"
]);

/**
 * Finds likely completed statements that lack a terminating semicolon.
 * The check uses lexer tokens rather than raw line text, ignores preprocessor directives,
 * and avoids reporting multiline expressions, control-flow headers and block braces.
 * It is intentionally a conservative editor diagnostic, not a full grammar check.
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Complete source text.
 * @param {import("./models").ParsedSource} parsed Parsed document metadata.
 * @returns {import("./models").Token[]} Last tokens on lines that appear to be missing `;`.
 */
function findMissingSemicolonTokens(tokens, sourceText, parsed = {}) {
	if (!tokens || !tokens.length || !sourceText) return [];
	const lines = sourceText.split(/\r?\n/);
	const ignoredPreprocessorLines = preprocessorLines(tokens, sourceText);
	const tokensByLine = Array.from({ length: lines.length }, () => []);
	const tokenIndices = new Map();
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const line = Number.isInteger(token.line) ? token.line : 0;
		if (line >= 0 && line < tokensByLine.length) tokensByLine[line].push({ token, index: i });
		tokenIndices.set(token.start, i);
	}

	const matchingOpenByClose = new Map();
	const initializerCloseTokens = new Set();
	const functionHeaderCloseTokens = new Set();
	const delimiterStacks = { "(": [], "[": [], "{": [] };
	const openForClose = { ")": "(", "]": "[", "}": "{" };
	for (let i = 0; i < tokens.length; i++) {
		if (ignoredPreprocessorLines.has(tokens[i].line)) continue;
		const value = tokens[i].value;
		if (value === "(" || value === "[") {
			delimiterStacks[value].push(i);
			continue;
		}
		if (value === "{") {
			const previous = tokens[i - 1] ? tokens[i - 1].value : "";
			const parentInitializer = delimiterStacks["{"].length > 0 && delimiterStacks["{"].at(-1).isInitializer;
			const isInitializer = parentInitializer || previous === "=" || previous === ",";
			delimiterStacks["{"].push({ index: i, isInitializer });
			continue;
		}
		const opening = openForClose[value];
		if (!opening) continue;
		const stack = delimiterStacks[opening];
		if (!stack.length) continue;
		const openEntry = stack.pop();
		const openIndex = typeof openEntry === "number" ? openEntry : openEntry.index;
		matchingOpenByClose.set(i, openIndex);
		if (opening === "{" && openEntry.isInitializer && !stack.some(entry => typeof entry === "object" && entry.isInitializer)) initializerCloseTokens.add(i);
	}

	// A function declaration may place its opening brace on the next physical line.
	for (const fn of parsed.functions || []) {
		if (fn.bodyOpenOffset === null || fn.bodyOpenOffset === undefined) continue;
		const nameIndex = tokenIndices.get(fn.offset);
		if (nameIndex === undefined || tokens[nameIndex + 1]?.value !== "(") continue;
		let depth = 0;
		for (let i = nameIndex + 1; i < tokens.length; i++) {
			if (tokens[i].value === "(") depth++;
			else if (tokens[i].value === ")") {
				depth--;
				if (depth === 0) {
					functionHeaderCloseTokens.add(i);
					break;
				}
			}
		}
	}

	const missing = [];
	const parens = [];
	const brackets = [];
	const braces = [];
	for (let line = 0; line < lines.length; line++) {
		const entries = tokensByLine[line];
		if (!entries.length || ignoredPreprocessorLines.has(line)) continue;
		for (const entry of entries) {
			const value = entry.token.value;
			if (value === "(") parens.push(entry.index);
			else if (value === "[") brackets.push(entry.index);
			else if (value === "{") {
				const previous = tokens[entry.index - 1] ? tokens[entry.index - 1].value : "";
				const parentInitializer = braces.length > 0 && braces[braces.length - 1].isInitializer;
				braces.push({ index: entry.index, isInitializer: parentInitializer || previous === "=" || previous === "," });
			} else if (value === ")" && parens.length) parens.pop();
			else if (value === "]" && brackets.length) brackets.pop();
			else if (value === "}" && braces.length) braces.pop();
		}

		const lastEntry = entries[entries.length - 1];
		const last = lastEntry.token;
		const lastIndex = lastEntry.index;
		const value = last.value;
		if (value === ";" || value === "{" || value === ":") continue;
		if (value === "else" || value === "do") continue;
		if (SEMICOLON_CONTINUATION_TOKENS.has(value)) continue;
		const insideInitializer = braces.some(item => item.isInitializer);
		if (parens.length || brackets.length || insideInitializer) continue;
		if (value === "}") {
			if (initializerCloseTokens.has(lastIndex)) missing.push(last);
			continue;
		}
		if (value === ")") {
			const openIndex = matchingOpenByClose.get(lastIndex);
			if (openIndex !== undefined) {
				const controlWord = tokens[openIndex - 1]?.value;
				const doWhileTail = controlWord === "while" && tokens[openIndex - 2]?.value === "}";
				if (CONTROL_WORDS.has(controlWord) && !doWhileTail) continue;
			}
			if (functionHeaderCloseTokens.has(lastIndex)) continue;
		}
		const nextEntry = tokens[lastIndex + 1];
		if (nextEntry && nextEntry.line > line &&
			["(", "[", ".", "->", "+", "-", "*", "/", "%", "&&", "||", "==", "!=", "<", ">", "<=", ">=", "?", ":", ","].includes(nextEntry.value)) {
			continue;
		}
		missing.push(last);
	}
	return missing;
}

/**
 * Finds primitive type keywords repeated after a comma in a single declaration.
 * LGC declarations use one type followed by comma-separated names (`int a, b;`),
 * not a repeated type per declarator (`int a, int b;`).
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Source text used to ignore preprocessor directives.
 * @returns {Array<{typeToken: import("./models").Token, nameToken: import("./models").Token}>}
 */
function findRepeatedDeclaratorTypes(tokens, sourceText = "") {
	const ignoredLines = sourceText ? preprocessorLines(tokens, sourceText) : new Set();
	const result = [];
	const primitiveTypes = new Set(["int", "string", "char"]);
	for (let i = 1; i < tokens.length - 1; i++) {
		if (tokens[i - 1].value !== "," || !primitiveTypes.has(tokens[i].value) || ignoredLines.has(tokens[i].line)) continue;
		const nameToken = tokens[i + 1];
		if (!nameToken || nameToken.type !== "identifier") continue;
		let start = i - 2;
		while (start >= 0) {
			const value = tokens[start].value;
			if ([";", "{", "}"].includes(value)) break;
			if (value === "(" && tokens[start - 1]?.value === "for") break;
			start--;
		}
		let firstTypeIndex = start + 1;
		while (tokens[firstTypeIndex] && ["static", "extern", "const", "volatile", "register", "auto"].includes(tokens[firstTypeIndex].value)) firstTypeIndex++;
		const firstType = tokens[firstTypeIndex];
		const firstName = tokens[firstTypeIndex + 1];
		// A function header can begin with the same primitive return type, but its name
		// is followed by `(` rather than a declarator separator.
		const looksLikeVariableDeclaration = firstType && primitiveTypes.has(firstType.value) &&
			firstName && firstName.type === "identifier" && tokens[firstTypeIndex + 2]?.value !== "(";
		if (looksLikeVariableDeclaration) result.push({ typeToken: tokens[i], nameToken });
	}
	return result;
}

/**
 * Finds declarations that begin with a type-like identifier unsupported by LGC.
 * This catches explicit C-like types such as `bool a;` without treating ordinary
 * value expressions or function calls as declarations.
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {string} sourceText Source text used to ignore preprocessor directives.
 * @returns {Array<{typeToken: import("./models").Token, nameToken: import("./models").Token}>}
 */
function findUnsupportedTypeDeclarations(tokens, sourceText = "", constants = new Map(), knownVariables = new Map()) {
	const ignoredLines = sourceText ? preprocessorLines(tokens, sourceText) : new Set();
	const primitiveTypes = new Set(["int", "string", "char", "void"]);
	const qualifiers = new Set(["static", "extern", "const", "volatile", "register", "auto"]);
	const blocked = new Set([
		"return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
		"goto", "sizeof", "extern", "static", "const", "volatile", "register", "auto"
	]);
	const result = [];
	for (let i = 0; i < tokens.length - 1; i++) {
		const token = tokens[i];
		if (token.type !== "identifier" || primitiveTypes.has(token.value) || blocked.has(token.value) || ignoredLines.has(token.line)) continue;
		// A project #define can be a type alias (for example MESSAGE_FONT_X -> int).
		// Known constants and already-declared variables are values, not candidate types.
		if (constants && constants.has(token.value)) continue;
		if (knownVariables && typeof knownVariables.has === "function" &&
			knownVariables.has(token.value) && resolveVariable(knownVariables, token.value, token.start)) continue;
		let nameIndex = i + 1;
		while (tokens[nameIndex] && ["*", "&", "const", "volatile"].includes(tokens[nameIndex].value)) nameIndex++;
		const nameToken = tokens[nameIndex];
		if (!nameToken || nameToken.type !== "identifier") continue;
		let previous = i - 1;
		while (previous >= 0 && qualifiers.has(tokens[previous].value)) previous--;
		const boundary = previous < 0 ? null : tokens[previous].value;
		if (![null, ";", "{", "}", "(", ","].includes(boundary)) continue;
		// Require a declarator-shaped suffix. Without this guard, `if (dx*dx ... )`
		// looks like an unknown type `dx` followed by a pointer declarator `dx`.
		// After an identifier, a declaration must terminate, start an initializer,
		// continue another declarator, or specify an array suffix that does so.
		let suffixIndex = nameIndex + 1;
		while (tokens[suffixIndex]?.value === "[") {
			const close = findMatching(tokens, suffixIndex, "[", "]");
			if (close < 0) break;
			suffixIndex = close + 1;
		}
		const suffix = tokens[suffixIndex]?.value;
		if (![";", "=", ","].includes(suffix)) continue;
		// Ordinary variables at expression starts (notably the left operand of `x*x`)
		// must never be reclassified as unsupported types.
		if (knownVariables && typeof knownVariables.has === "function" &&
			knownVariables.has(token.value) && resolveVariable(knownVariables, token.value, token.start)) continue;
		result.push({ typeToken: token, nameToken });
	}
	return result;
}

/**
 * Extracts source-level include directives in lexical order.
 * @param {string} sourceText Complete source text.
 * @returns {Array<{path:string, offset:number}>} Include paths and directive offsets.
 */
function parseIncludeDirectives(sourceText) {
	const result = [];
	const pattern = /^[ \t]*#[ \t]*include[ \t]*[<"]([^">]+)[>"][^\r\n]*$/gm;
	let match;
	while ((match = pattern.exec(sourceText)) !== null) {
		result.push({ path: match[1].replace(/\\/g, "/").replace(/^\.\//, ""), offset: match.index });
	}
	return result;
}

/**
 * Checks whether an indexed function source corresponds to a preceding include directive.
 * Matching accepts the exact workspace-relative path or a path suffix because include
 * directives are commonly written relative to the including script's directory.
 * @param {string} functionSource Function metadata's source path.
 * @param {{path:string,offset:number}[]} includes Directives in the current file.
 * @param {number} callOffset Call-site offset.
 * @returns {boolean} Whether the function's source has been included before this call.
 */
function isFunctionSourceIncluded(functionSource, includes, callOffset) {
	const source = String(functionSource || "").replace(/\\/g, "/").replace(/^\.\//, "");
	if (!source) return false;
	const sourceKey = source.toLowerCase();
	return includes.some(include => {
		if (include.offset > callOffset) return false;
		const path = include.path.replace(/\\/g, "/").replace(/^\.\//, "");
		const pathKey = path.toLowerCase();
		const sourceName = sourceKey.split("/").pop();
		const includeName = pathKey.split("/").pop();
		// File systems used by Locoland modding workflows may be case-insensitive;
		// function identifiers remain case-sensitive in the resolver itself.
		return sourceKey === pathKey || sourceKey.endsWith(`/${pathKey}`) || pathKey.endsWith(`/${sourceKey}`) ||
			(!pathKey.includes("/") && sourceName === includeName);
	});
}

/**
 * Returns whether a catalogue entry comes from a source loaded by `header.lgc`.
 * This deliberately relies only on the catalogue `source` field. Numeric IDs,
 * legacy status, and individual function names never grant global visibility.
 * @param {object} item Catalogue function metadata.
 * @returns {boolean} Whether the function is globally visible through the standard header.
 */
function isAlwaysAvailableFunction(item) {
	return Boolean(item && isAlwaysAvailableSource(item.source));
}

/**
 * Resolves the best function declaration visible at a call site.
 * Functions whose catalogue source is included by `header.lgc` are always visible; user
 * functions must be declared earlier in this document or come from a file included before
 * the call. Exact identifier casing is used.
 * @param {string} name Function identifier as written at the call site.
 * @param {import("./models").Token} callToken Call-site identifier token.
 * @param {import("./models").ParsedSource} parsed Current parsed document.
 * @param {Map<string, import("./models").LgcFunction>} functions Merged function map.
 * @param {Array<object>} functionCatalog Bundled engine and helper catalogue.
 * @param {Map<string, import("./models").LgcFunction[]>} workspaceFunctionEntries Workspace function declarations.
 * @param {{path:string,offset:number}[]} includes Current document include directives.
 * @returns {import("./models").LgcFunction|null} A visible declaration, or `null`.
 */
function resolveVisibleFunction(name, callToken, parsed, functions, functionCatalog = [], workspaceFunctionEntries = new Map(), includes = []) {
	const engine = functionCatalog.find(item => item.name === name && isAlwaysAvailableFunction(item));
	if (engine) return engine instanceof LgcFunction ? engine : new LgcFunction(engine);

	const local = (parsed.functions || []).filter(fn => fn.name === name && fn.offset <= callToken.start)
		.sort((a, b) => b.offset - a.offset);
	if (local.length) return local[0];

	const candidates = [];
	const indexed = workspaceFunctionEntries.get(name) || [];
	candidates.push(...indexed);
	const mapped = functions.get(name);
	if (mapped) candidates.push(mapped);
	candidates.push(...functionCatalog.filter(item => item.name === name));
	const seen = new Set();
	for (const item of candidates) {
		const fn = item instanceof LgcFunction ? item : new LgcFunction(item);
		const key = `${fn.name}:${fn.source || ""}:${fn.offset ?? ""}`;
		if (seen.has(key)) continue;
		seen.add(key);
		if (isAlwaysAvailableSource(fn.source) || isFunctionSourceIncluded(fn.source, includes, callToken.start)) return fn;
	}
	return null;
}

/**
 * Builds the semantic variable map by combining lexical declarations with the
 * small set of game globals that are available to every level script.
 * Synthetic globals occupy the file scope and are visible from offset zero;
 * local declarations still win because their lexical scopes are deeper.
 * @param {Map<string, import("./models").VariableDeclaration[]>} parsedVariables Parsed declarations.
 * @param {number} sourceLength Current document length.
 * @returns {VariableMap} Combined variable map for analysis.
 */
function createAnalysisVariableMap(parsedVariables = new Map(), sourceLength = 0) {
	const result = new Map();
	for (const [name, entries] of parsedVariables) result.set(name, Array.isArray(entries) ? entries.slice() : [entries]);
	const globalScope = { id: -1, parent: null, start: 0, end: Math.max(sourceLength, Number.MAX_SAFE_INTEGER), depth: 0 };
	for (const item of GLOBAL_VARIABLE_CATALOG) {
		if (!result.has(item.name)) result.set(item.name, []);
		result.get(item.name).push({
			name: item.name,
			type: item.type || "unknown",
			isArray: Boolean(item.isArray),
			token: { type: "identifier", value: item.name, start: -1, end: -1, line: 0 },
			scope: globalScope,
			visibleFrom: 0,
			declarationOffset: -1,
			initializerTokens: [],
			initializerEqualsToken: null,
			isLocal: false,
			isStatic: false,
			source: item.source
		});
	}
	return result;
}

/**
 * Checks whether a file-scope variable from another indexed source is visible here.
 * Standard-header sources are available everywhere; other sources require a preceding include.
 * @param {string} name Variable name.
 * @param {Map<string, object[]>} workspaceVariableEntries Workspace global declarations.
 * @param {{path:string,offset:number}[]} includes Current include directives.
 * @param {number} useOffset Identifier use offset.
 * @returns {boolean} Whether an indexed global variable is visible.
 */
function hasVisibleWorkspaceGlobalVariable(name, workspaceVariableEntries, includes, useOffset) {
	if (GLOBAL_VARIABLES_BY_NAME.has(name)) return true;
	const entries = workspaceVariableEntries.get(name) || [];
	return entries.some(entry => {
		const source = entry && (entry.source || entry.declaration?.source);
		return isAlwaysAvailableSource(source) || isFunctionSourceIncluded(source, includes, useOffset);
	});
}

/**
 * Finds identifier tokens that are used as values but have no visible variable/constant
 * declaration. Keywords, function names, member names, declarations and likely external
 * uppercase build macros are excluded to keep the diagnostic conservative.
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {import("./models").ParsedSource} parsed Current parsed document.
 * @param {Map<string, import("./models").LgcConstant>} constants Known constants/macros.
 * @param {Map<string, import("./models").LgcFunction>} functions Known function names.
 * @param {string} sourceText Complete source text.
 * @param {Set<number>} [excludedOffsets] Token offsets owned by a separate declaration diagnostic.
 * @param {Map<string, object[]>} [workspaceVariableEntries] Indexed file-scope declarations from workspace files.
 * @param {{path:string,offset:number}[]} [includes] Include directives in the current document.
 * @returns {import("./models").Token[]} Unresolved value identifiers.
 */
function findUnknownValueIdentifiers(tokens, parsed, constants, functions, sourceText, excludedOffsets = new Set(), workspaceVariableEntries = new Map(), includes = parseIncludeDirectives(sourceText)) {
	const variables = parsed.variables || new Map();
	const ignoredLines = preprocessorLines(tokens, sourceText);
	const declarationOffsets = new Set(parsed.declarationPositions || []);
	for (const entries of variables.values()) {
		for (const entry of Array.isArray(entries) ? entries : [entries]) {
			if (entry && entry.token) declarationOffsets.add(entry.token.start);
		}
	}
	const keywords = new Set([
		"return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
		"goto", "sizeof", "true", "false", "TRUE", "FALSE", "NULL", "null"
	]);
	const valueBefore = new Set([
		"=", "(", ",", "return", "case", "+", "-", "*", "/", "%", "&", "|", "^", "!", "~",
		"==", "!=", "<", ">", "<=", ">=", "&&", "||", "?", ":", "[", "++", "--"
	]);
	const valueAfter = new Set([
		"=", ")", ",", ";", "]", "+", "-", "*", "/", "%", "&", "|", "^", "==", "!=",
		"<", ">", "<=", ">=", "&&", "||", "?", ":", "++", "--"
	]);
	const result = [];
	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		if (token.type !== "identifier" || ignoredLines.has(token.line) || excludedOffsets.has(token.start) || declarationOffsets.has(token.start)) continue;
		if (TYPE_WORDS.has(token.value) || CONTROL_WORDS.has(token.value) || keywords.has(token.value)) continue;
		if (constants.has(token.value) || parsed.constants?.has(token.value) || functions.has(token.value)) continue;
		if (resolveVariable(variables, token.value, token.start)) continue;
		if (hasVisibleWorkspaceGlobalVariable(token.value, workspaceVariableEntries, includes, token.start)) continue;
		if (tokens[i + 1]?.value === "(" || tokens[i - 1]?.value === "." || tokens[i - 1]?.value === "->") continue;
		if (/^[A-Z_][A-Z0-9_]*$/.test(token.value)) continue;
		if ((parsed.functions || []).some(fn => fn.paramStartOffset !== undefined && token.start >= fn.paramStartOffset && token.start <= fn.paramEndOffset)) continue;
		const previous = tokens[i - 1]?.value;
		const next = tokens[i + 1]?.value;
		if (valueBefore.has(previous) || valueAfter.has(next)) result.push(token);
	}
	return result;
}

/**
 * Returns the complete token range of the primary expression immediately left of `+`.
 * Parenthesized expressions, function calls and array reads are retained as one operand.
 * @param {import("./models").Token[]} tokens Token stream.
 * @param {number} plusIndex Index of a `+` token.
 * @returns {import("./models").Token[]} Left operand tokens.
 */
function leftPlusOperand(tokens, plusIndex) {
	let end = plusIndex;
	let index = plusIndex - 1;
	if (index < 0) return [];
	if (tokens[index].value === ")") {
		let depth = 0, open = -1;
		for (let i = index; i >= 0; i--) {
			if (tokens[i].value === ")") depth++;
			else if (tokens[i].value === "(" && --depth === 0) { open = i; break; }
		}
		if (open >= 0) {
			index = open;
			if (open > 0 && tokens[open - 1].type === "identifier") index--;
		}
	} else if (tokens[index].value === "]") {
		let depth = 0, open = -1;
		for (let i = index; i >= 0; i--) {
			if (tokens[i].value === "]") depth++;
			else if (tokens[i].value === "[" && --depth === 0) { open = i; break; }
		}
		if (open > 0) index = open - 1;
	} else {
		while (index > 0 && ["+", "-", "!", "~"].includes(tokens[index - 1].value)) index--;
	}
	return tokens.slice(index, end);
}

/**
 * Returns the complete token range of the primary expression immediately right of `+`.
 * Parenthesized expressions, function calls and array reads are retained as one operand.
 * @param {import("./models").Token[]} tokens Token stream.
 * @param {number} plusIndex Index of a `+` token.
 * @returns {import("./models").Token[]} Right operand tokens.
 */
function rightPlusOperand(tokens, plusIndex) {
	let index = plusIndex + 1;
	if (index >= tokens.length) return [];
	if (tokens[index].value === "(") {
		const close = findMatching(tokens, index, "(", ")");
		return close >= 0 ? tokens.slice(index, close + 1) : [tokens[index]];
	}
	if (tokens[index].type === "identifier" && tokens[index + 1]?.value === "(") {
		const close = findMatching(tokens, index + 1, "(", ")");
		return close >= 0 ? tokens.slice(index, close + 1) : [tokens[index]];
	}
	if (tokens[index].type === "identifier" && tokens[index + 1]?.value === "[") {
		const close = findMatching(tokens, index + 1, "[", "]");
		return close >= 0 ? tokens.slice(index, close + 1) : [tokens[index]];
	}
	return [tokens[index]];
}

/**
 * Finds `string + int` and `int + string` expressions that require explicit conversion.
 * In LGC, use `itoa(number)` before concatenating a number with a string.
 * @param {import("./models").Token[]} tokens Semantic token stream.
 * @param {VariableMap} variables Current lexical variables.
 * @param {Map<string, import("./models").LgcFunction>} functions Visible function signatures.
 * @param {Map<string, import("./models").LgcConstant>} constants Known constants.
 * @returns {import("./models").Token[]} Plus tokens participating in invalid mixed additions.
 */
function findMixedStringAdditionTokens(tokens, variables, functions, constants) {
	const result = [];
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i].value !== "+") continue;
		const left = leftPlusOperand(tokens, i);
		const right = rightPlusOperand(tokens, i);
		if (!left.length || !right.length) continue;
		const leftType = expressionType(left, variables, functions, constants, left[0].start);
		const rightType = expressionType(right, variables, functions, constants, right[0].start);
		if ((leftType === "string" && rightType === "int") || (leftType === "int" && rightType === "string")) result.push(tokens[i]);
	}
	return result;
}

/**
 * Adds diagnostics for duplicate, overloaded and engine-reserved function names.
 * @param {*} VSCODE VS Code API namespace.
 * @param {*} document Analysed text document.
 * @param {import("./models").ParsedSource} parsed Current document parse.
 * @param {Array<*>} diagnostics Mutable diagnostic output array.
 * @param {Array<object>} functionCatalog Bundled engine/helper function entries.
 * @param {Map<string, import("./models").LgcFunction[]>} workspaceFunctionEntries Cross-file declarations.
 */
function addFunctionCollisionDiagnostics(VSCODE, document, parsed, diagnostics, functionCatalog, workspaceFunctionEntries, includes = []) {
	const visited = new Set();
	for (const fn of parsed.functions) {
		const key = `${fn.name}:${fn.offset}`;
		if (visited.has(key)) continue;
		visited.add(key);
		const reason = functionCollisionReason(fn, parsed, functionCatalog, workspaceFunctionEntries, includes);
		if (!reason) continue;
		diagnostics.push(diagnostic(VSCODE, document,
			{ start: fn.offset, end: fn.offset + fn.name.length },
			`Function name '${fn.name}' is already occupied. Reason: ${reason}. LGC does not support function overriding or overloading. Fix: rename this function and update its call sites.`,
			VSCODE.DiagnosticSeverity.Error, "lgc.functionNameCollision"));
	}
}

/**
 * Finds `=` and `;` tokens inside logical #define directives.
 * Quoted strings and comments are already atomic/omitted by the lexer, so punctuation
 * inside a string literal is not reported. Backslash-continued directives are supported.
 * @param {import("./models").Token[]} tokens Token stream.
 * @param {string} sourceText Original source text.
 * @returns {import("./models").Token[]} Invalid tokens in #define directives.
 */
function findInvalidDefineTokens(tokens, sourceText) {
	const lines = sourceText.split(/\r?\n/);
	const lineStarts = [];
	let offset = 0;
	for (const line of lines) {
		lineStarts.push(offset);
		offset += line.length;
		if (sourceText[offset] === "\r") offset++;
		if (sourceText[offset] === "\n") offset++;
	}
	const invalid = [];
	for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
		if (!/^\s*#\s*define\b/.test(lines[lineIndex])) continue;
		let lastLine = lineIndex;
		while (lastLine < lines.length - 1 && /\\\s*$/.test(lines[lastLine])) lastLine++;
		const start = lineStarts[lineIndex];
		const end = lineStarts[lastLine] + lines[lastLine].length;
		for (const token of tokens) {
			if (token.start < start || token.start >= end) continue;
			if (token.value === "=" || token.value === ";") invalid.push(token);
		}
		lineIndex = lastLine;
	}
	return invalid;
}

/**
 * Runs configured syntax and semantic checks for one parsed LGC document.
 * Checks delimiters, compile-time initializers, function-name collisions, known function
 * arity, inferable argument types, assignments and the configured syntax checks.
 * Checks are intentionally skipped when expression types or API signatures are unknown.
 *
 * @param {*} VSCODE VS Code API namespace.
 * @param {*} document Document being analysed.
 * @param {import("./models").ParsedSource} parsed Syntax and semantic document snapshot.
 * @param {Map<string, import("./models").LgcFunction>} functions Merged function symbol map.
 * @param {Map<string, import("./models").LgcConstant>} constants Merged constant symbol map.
 * @param {Map<string, import("./models").LgcFunction[]>} [workspaceFunctionEntries] All workspace declarations by name.
 * @param {Array<object>} [functionCatalog=[]] Bundled engine/helper function catalogue.
 * @param {Map<string, object[]>} [workspaceVariableEntries] Global variables indexed from workspace source files.
 * @returns {Array<*>} VS Code diagnostics for the document.
 */
function analyzeDocument(VSCODE, document, parsed, functions, constants, workspaceFunctionEntries = new Map(), functionCatalog = [], workspaceVariableEntries = new Map(), visibilityIncludes = null) {
	const config = VSCODE.workspace.getConfiguration("lgc.analysis", document.uri);
	if (!config.get("enabled", true)) return [];
	const severityValue = config.get("severity", "Warning");
	const severity = severityValue === "Error" ? VSCODE.DiagnosticSeverity.Error :
		severityValue === "Information" ? VSCODE.DiagnosticSeverity.Information : VSCODE.DiagnosticSeverity.Warning;
	const diagnostics = [];
	const tokens = parsed.tokens;
	const sourceText = document.getText();
	const variables = createAnalysisVariableMap(parsed.variables, sourceText.length);
	const analysisParsed = { ...parsed, variables };
	const includes = parseIncludeDirectives(sourceText);
	if (Array.isArray(visibilityIncludes)) {
		const seenIncludePaths = new Set(includes.map(item => item.path.toLowerCase()));
		for (const entry of visibilityIncludes) {
			const path = typeof entry === "string" ? entry : entry && entry.path;
			if (!path) continue;
			const key = String(path).replace(/\\/g, "/").toLowerCase();
			if (seenIncludePaths.has(key)) continue;
			seenIncludePaths.add(key);
			includes.push({ path: String(path), offset: typeof entry === "object" && Number.isFinite(entry.offset) ? entry.offset : -1 });
		}
	}

	const forLoopDeclarations = config.get("checkForLoopIntDeclarations", true)
		? findForLoopIntDeclarations(tokens, sourceText) : [];
	const forLoopVariableOffsets = new Set();
	for (const declaration of forLoopDeclarations) {
		forLoopVariableOffsets.add(declaration.nameToken.start);
		const name = declaration.nameToken.value;
		diagnostics.push(diagnostic(VSCODE, document, declaration.typeToken,
			`Declaring 'int ${name}' inside a for-loop initializer is not supported by LGC and is treated as an assignment to a constant. Fix: declare 'int ${name};' before the loop, then use 'for (${name} = ...; ...; ...)'.`,
			VSCODE.DiagnosticSeverity.Error, "lgc.forLoopIntDeclaration"));
	}
	if (config.get("checkSemicolons", true)) {
		for (const token of findMissingSemicolonTokens(tokens, sourceText, parsed)) {
			diagnostics.push(diagnostic(VSCODE, document, token,
				"Missing ';' at the end of this statement. Add a semicolon before the line break.",
				VSCODE.DiagnosticSeverity.Error, "lgc.missingSemicolon"));
		}
	}
	if (config.get("checkDefineSyntax", true)) {
		for (const token of findInvalidDefineTokens(tokens, sourceText)) {
			diagnostics.push(diagnostic(VSCODE, document, token,
				"Invalid #define syntax. Use '#define NAME value' without '=' or ';'.",
				VSCODE.DiagnosticSeverity.Error, "lgc.invalidDefineSyntax"));
		}
	}

	const closingToOpening = { ")": "(", "]": "[", "}": "{" };
	const brackets = [];
	for (const token of tokens) {
		if (["(", "[", "{"].includes(token.value)) brackets.push(token);
		else if (closingToOpening[token.value]) {
			const top = brackets[brackets.length - 1];
			if (!top || top.value !== closingToOpening[token.value]) {
				diagnostics.push(diagnostic(VSCODE, document, token, `Unmatched closing '${token.value}'.`, VSCODE.DiagnosticSeverity.Error));
			} else brackets.pop();
		}
	}
	for (const token of brackets) diagnostics.push(diagnostic(VSCODE, document, token, `Unclosed '${token.value}'.`, VSCODE.DiagnosticSeverity.Error));
	if (config.get("checkConstantInitializers", true)) {
		for (const entries of variables.values()) {
			for (const entry of entries) {
				if (!entry.initializerEqualsToken || !entry.initializerTokens || !entry.initializerTokens.length) continue;
				if (entry.token && forLoopVariableOffsets.has(entry.token.start)) continue;
				if (isCompileTimeConstant(entry.initializerTokens, constants, new Set(), variables)) continue;
				const reason = explainNonConstantInitializer(entry, constants, variables, functions);
				const data = {
					name: entry.name,
					equalsOffset: entry.initializerEqualsToken.start,
					initializerStart: entry.initializerStart,
					initializerEnd: entry.initializerEnd,
					isLocal: entry.isLocal,
					isArray: entry.isArray,
					declaratorCount: entry.declaratorCount
				};
				diagnostics.push(diagnostic(VSCODE, document,
					{ start: entry.initializerEqualsToken.start, end: entry.initializerEnd },
					`Initializer for '${entry.name}' is not a compile-time constant. Reason: ${reason}. Fix: declare the variable without an initializer, then assign this expression at runtime inside a function.`,
					VSCODE.DiagnosticSeverity.Error, "lgc.nonConstantInitializer", data));
			}
		}
	}
	if (config.get("checkFunctionNameCollisions", true)) {
		addFunctionCollisionDiagnostics(VSCODE, document, parsed, diagnostics, functionCatalog, workspaceFunctionEntries, includes);
	}
	const checkArity = config.get("checkFunctionArity", true);
	const checkTypes = config.get("checkArgumentTypes", true);
	const strictUnknown = config.get("strictUnknownFunctions", true);
	const checkOrder = config.get("checkFunctionDeclarationOrder", true);
	const checkUnknownVariables = config.get("checkUnknownVariables", true);
	const checkUnknownTypes = config.get("checkUnknownTypes", true);
	const checkRepeatedTypes = config.get("checkRepeatedDeclarationTypes", true);
	const checkStringAddition = config.get("checkStringAdditionTypes", true);
	const excludedUnknownOffsets = new Set();
	const repeatedTypeDeclarations = checkRepeatedTypes ? findRepeatedDeclaratorTypes(tokens, sourceText) : [];
	for (const declaration of repeatedTypeDeclarations) {
		excludedUnknownOffsets.add(declaration.typeToken.start);
		excludedUnknownOffsets.add(declaration.nameToken.start);
		diagnostics.push(diagnostic(VSCODE, document, declaration.typeToken,
			`Do not repeat the type in a comma-separated declaration. Use 'int a, b;' instead of 'int a, int b;'.`,
			VSCODE.DiagnosticSeverity.Error, "lgc.repeatedDeclaratorType"));
	}
	const unsupportedTypeDeclarations = checkUnknownTypes ? findUnsupportedTypeDeclarations(tokens, sourceText, constants, parsed.variables) : [];
	for (const declaration of unsupportedTypeDeclarations) {
		excludedUnknownOffsets.add(declaration.typeToken.start);
		excludedUnknownOffsets.add(declaration.nameToken.start);
		diagnostics.push(diagnostic(VSCODE, document, declaration.typeToken,
			`Unknown variable type '${declaration.typeToken.value}'. LGC supports 'int', 'string' and 'char' for variables.`,
			VSCODE.DiagnosticSeverity.Error, "lgc.unknownVariableType"));
	}
	if (checkStringAddition) {
		for (const token of findMixedStringAdditionTokens(tokens, variables, functions, constants)) {
			diagnostics.push(diagnostic(VSCODE, document, token,
				`Cannot add an integer to a string in LGC. Convert the number explicitly with itoa(value), for example: "text" + itoa(10).`,
				VSCODE.DiagnosticSeverity.Error, "lgc.stringIntegerAddition"));
		}
	}
	for (let i = 0; i < tokens.length - 1; i++) {
		const token = tokens[i];
		if (token.type !== "identifier" || tokens[i + 1].value !== "(") continue;
		if (parsed.declarationPositions.has(token.start) || CONTROL_WORDS.has(token.value)) continue;
		const lineStart = sourceText.lastIndexOf("\n", token.start - 1) + 1;
		if (/^\s*#\s*define\b/.test(sourceText.slice(lineStart, token.start))) continue;
		const close = findMatching(tokens, i + 1, "(", ")");
		if (close < 0) continue;
		const args = splitTokenArguments(tokens, i + 2, close);
		const fn = resolveVisibleFunction(token.value, token, parsed, functions, functionCatalog, workspaceFunctionEntries, includes);
		if (!fn) {
			const futureLocal = (parsed.functions || []).find(item => item.name === token.value && item.offset > token.start);
			const indexedExternal = (workspaceFunctionEntries.get(token.value) || []).find(item => item.source);
			const catalogExternal = functionCatalog.find(item => item.name === token.value);
			if (checkOrder && futureLocal) {
				diagnostics.push(diagnostic(VSCODE, document, token,
					`Function '${token.value}' is called before its declaration. LGC requires functions to be declared before use. Move the declaration above this call or add a prototype before it.`,
					VSCODE.DiagnosticSeverity.Error, "lgc.functionUsedBeforeDeclaration"));
			} else if (strictUnknown) {
				const suggestion = functionCatalog.find(item => item.name.toLowerCase() === token.value.toLowerCase() && item.name !== token.value);
				const suffix = suggestion ? ` Did you mean '${suggestion.name}'? LGC function names are case-sensitive.` :
					(indexedExternal || catalogExternal ? ` Add an #include for '${(indexedExternal || catalogExternal).source || "the declaring script"}' before this call.` :
					" Declare the function earlier in this file or include the script that defines it.");
				diagnostics.push(diagnostic(VSCODE, document, token,
					`Unknown or unavailable function '${token.value}'.${suffix}`,
					VSCODE.DiagnosticSeverity.Error, "lgc.unknownFunction"));
			}
			continue;
		}
		const required = (fn.params || []).filter(param => !param.optional).length;
		const maximum = (fn.params || []).length;
		if (checkArity && (args.length < required || args.length > maximum)) {
			diagnostics.push(diagnostic(VSCODE, document, token,
				`${token.value} expects ${required === maximum ? required : `${required}-${maximum}`} argument(s), but ${args.length} supplied.`, severity));
		}
		if (checkTypes && fn.params) {
			for (let argIndex = 0; argIndex < Math.min(args.length, fn.params.length); argIndex++) {
				const expected = fn.params[argIndex].type;
				if (!["int", "string", "char"].includes(expected)) continue;
				const argument = args[argIndex];
				const actual = expressionType(argument, variables, functions, constants, argument[0] ? argument[0].start : token.start);
				if (actual !== "unknown" && !areTypesCompatible(expected, actual)) {
					diagnostics.push(diagnostic(VSCODE, document, args[argIndex][0],
						`Argument ${argIndex + 1} of ${token.value} expects ${expected}, but the expression is ${actual}.`, VSCODE.DiagnosticSeverity.Error, "lgc.argumentTypeMismatch"));
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
			let end = i + 1, nesting = 0;
			for (; end < tokens.length; end++) {
				const value = tokens[end].value;
				if (["(", "["].includes(value)) nesting++;
				else if ([")", "]"].includes(value)) { if (nesting === 0) break; nesting--; }
				if (nesting === 0 && (value === ";" || value === ",")) break;
			}
			const rhsTokens = tokens.slice(i + 1, end);
			const actual = expressionType(rhsTokens, variables, functions, constants, rhsTokens[0] ? rhsTokens[0].start : tokens[i].start);
			if (actual !== "unknown" && !areTypesCompatible(target.type, actual)) {
				diagnostics.push(diagnostic(VSCODE, document, tokens[i - 1],
					`Cannot assign ${actual} to ${target.type} variable '${tokens[i - 1].value}'.`, VSCODE.DiagnosticSeverity.Error, "lgc.assignmentTypeMismatch"));
			}
		}
	}
	if (checkUnknownVariables) {
		for (const token of findUnknownValueIdentifiers(tokens, analysisParsed, constants, functions, sourceText, excludedUnknownOffsets, workspaceVariableEntries, includes)) {
			diagnostics.push(diagnostic(VSCODE, document, token,
				`Unknown variable or value '${token.value}'. Declare it before use or define it as a #define constant.`,
				VSCODE.DiagnosticSeverity.Error, "lgc.unknownVariable"));
		}
	}
	return diagnostics;
}

module.exports = {
	splitTopLevel, constantExpressionType, isCompileTimeConstant, inferFunctionReturnTypes,
	expressionType, areTypesCompatible, diagnostic, functionParameterKey,
	isCompatibleForwardDeclarationPair, functionCollisionReason, explainNonConstantInitializer,
	addFunctionCollisionDiagnostics, preprocessorLines, findForLoopIntDeclarations,
	findMissingSemicolonTokens, findRepeatedDeclaratorTypes, findUnsupportedTypeDeclarations,
	parseIncludeDirectives, isFunctionSourceIncluded, isAlwaysAvailableFunction, resolveVisibleFunction,
	findUnknownValueIdentifiers, hasVisibleWorkspaceGlobalVariable, createAnalysisVariableMap, findInvalidDefineTokens, leftPlusOperand, rightPlusOperand, findMixedStringAdditionTokens,
	analyzeDocument
};
