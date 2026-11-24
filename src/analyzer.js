"use strict";

const { CONTROL_WORDS, TYPE_WORDS } = require("./language-constants");
const { tokenize, findMatching } = require("./lexer");
const { splitTokenArguments, resolveVariable } = require("./parser");
const { LgcFunction } = require("./models");

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
		if (types.includes("string")) return "string";
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
function functionCollisionReason(fn, parsed, functionCatalog = [], workspaceFunctionEntries = new Map()) {
	const engineFunction = functionCatalog.find(item => item.name === fn.name && typeof item.id === "number");
	if (engineFunction && !fn.external) return "the Locoland engine already exports a function with this name";
	const sameName = parsed.functions.filter(item => item.name === fn.name &&
		(item === fn || (!isConditionalFallback(item, fn.name) && !isConditionalFallback(fn, fn.name))));
	if (sameName.length <= 1) {
		const otherEntries = workspaceFunctionEntries.get(fn.name) || [];
		const other = otherEntries.find(item => item.uri && fn.uri && item.uri.toString() !== fn.uri.toString() && !item.external &&
			!isConditionalFallback(item, fn.name) && !isConditionalFallback(fn, fn.name) && !isCompatibleForwardDeclarationPair(fn, item));
		return other ? `another script already declares this function (${other.source || "workspace"})` : null;
	}
	const definitions = sameName.filter(hasFunctionBody);
	const signatureKeys = new Set(sameName.map(functionParameterKey));
	const returnTypes = new Set(sameName.map(item => item.returnType || "unknown").filter(type => type !== "unknown"));
	if (signatureKeys.size > 1) return "the name is already declared with a different parameter list (function overloading is unsupported)";
	if (returnTypes.size > 1) return "the name is already declared with a different return type";
	if (definitions.length > 1) return "another definition with the same name already exists in this file";
	const otherEntries = workspaceFunctionEntries.get(fn.name) || [];
	const other = otherEntries.find(item => item.uri && fn.uri && item.uri.toString() !== fn.uri.toString() && !item.external &&
		!isConditionalFallback(item, fn.name) && !isConditionalFallback(fn, fn.name) && !isCompatibleForwardDeclarationPair(fn, item));
	return other ? `another script already declares this function (${other.source || "workspace"})` : null;
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
 * Adds diagnostics for duplicate, overloaded and engine-reserved function names.
 * @param {*} VSCODE VS Code API namespace.
 * @param {*} document Analysed text document.
 * @param {import("./models").ParsedSource} parsed Current document parse.
 * @param {Array<*>} diagnostics Mutable diagnostic output array.
 * @param {Array<object>} functionCatalog Bundled engine/helper function entries.
 * @param {Map<string, import("./models").LgcFunction[]>} workspaceFunctionEntries Cross-file declarations.
 */
function addFunctionCollisionDiagnostics(VSCODE, document, parsed, diagnostics, functionCatalog, workspaceFunctionEntries) {
	const visited = new Set();
	for (const fn of parsed.functions) {
		if (fn.external && functionCatalog.some(item => item.name === fn.name && typeof item.id === "number")) continue;
		const key = `${fn.name}:${fn.offset}`;
		if (visited.has(key)) continue;
		visited.add(key);
		const reason = functionCollisionReason(fn, parsed, functionCatalog, workspaceFunctionEntries);
		if (!reason) continue;
		diagnostics.push(diagnostic(VSCODE, document,
			{ start: fn.offset, end: fn.offset + fn.name.length },
			`Function name '${fn.name}' is already occupied. Reason: ${reason}. LGC does not support function overriding or overloading. Fix: rename this function and update its call sites.`,
			VSCODE.DiagnosticSeverity.Error, "lgc.functionNameCollision"));
	}
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
 * @returns {Array<*>} VS Code diagnostics for the document.
 */
function analyzeDocument(VSCODE, document, parsed, functions, constants, workspaceFunctionEntries = new Map(), functionCatalog = []) {
	const config = VSCODE.workspace.getConfiguration("lgc.analysis", document.uri);
	if (!config.get("enabled", true)) return [];
	const severityValue = config.get("severity", "Warning");
	const severity = severityValue === "Error" ? VSCODE.DiagnosticSeverity.Error :
		severityValue === "Information" ? VSCODE.DiagnosticSeverity.Information : VSCODE.DiagnosticSeverity.Warning;
	const diagnostics = [];
	const tokens = parsed.tokens;
	const variables = parsed.variables;
	const sourceText = document.getText();

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
		addFunctionCollisionDiagnostics(VSCODE, document, parsed, diagnostics, functionCatalog, workspaceFunctionEntries);
	}
	const checkArity = config.get("checkFunctionArity", true);
	const checkTypes = config.get("checkArgumentTypes", true);
	const strictUnknown = config.get("strictUnknownFunctions", false);
	const knownFunctionNames = new Set(functions.keys());
	for (let i = 0; i < tokens.length - 1; i++) {
		const token = tokens[i];
		if (token.type !== "identifier" || tokens[i + 1].value !== "(") continue;
		if (parsed.declarationPositions.has(token.start) || CONTROL_WORDS.has(token.value)) continue;
		const lineStart = sourceText.lastIndexOf("\n", token.start - 1) + 1;
		if (/^\s*#\s*define\b/.test(sourceText.slice(lineStart, token.start))) continue;
		const close = findMatching(tokens, i + 1, "(", ")");
		if (close < 0) continue;
		const args = splitTokenArguments(tokens, i + 2, close);
		const fn = functions.get(token.value);
		if (!fn) {
			if (strictUnknown && !knownFunctionNames.has(token.value)) {
				diagnostics.push(diagnostic(VSCODE, document, token,
					`Unknown function '${token.value}'. Add its script to the workspace or declare it before using strict mode.`, severity));
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
						`Argument ${argIndex + 1} of ${token.value} expects ${expected}, but the expression is ${actual}.`, severity));
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
					`Cannot assign ${actual} to ${target.type} variable '${tokens[i - 1].value}'.`, severity));
			}
		}
	}
	return diagnostics;
}

module.exports = {
	splitTopLevel, constantExpressionType, isCompileTimeConstant, inferFunctionReturnTypes,
	expressionType, areTypesCompatible, diagnostic, functionParameterKey,
	isCompatibleForwardDeclarationPair, functionCollisionReason, explainNonConstantInitializer,
	addFunctionCollisionDiagnostics, preprocessorLines, findForLoopIntDeclarations,
	findMissingSemicolonTokens, analyzeDocument
};
