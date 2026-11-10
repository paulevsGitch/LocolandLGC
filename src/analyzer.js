"use strict";

const { CONTROL_WORDS, TYPE_WORDS } = require("./language-constants");
const { findMatching } = require("./lexer");
const { splitTokenArguments, resolveVariable } = require("./parser");
const { LgcFunction } = require("./models");

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
function diagnostic(VSCODE, document, token, message, severity) {
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
function analyzeDocument(VSCODE, document, parsed, functions, constants) {
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
				diagnostics.push(diagnostic(VSCODE, document, token, `Unmatched closing '${token.value}'.`, VSCODE.DiagnosticSeverity.Error));
			} else {
				brackets.pop();
			}
		}
	}
	for (const token of brackets) {
		diagnostics.push(diagnostic(VSCODE, document, token, `Unclosed '${token.value}'.`, VSCODE.DiagnosticSeverity.Error));
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
				diagnostics.push(diagnostic(VSCODE, document, token, `Unknown function '${token.value}'. Add its script to the workspace or declare it before using strict mode.`, severity));
			}
			continue;
		}

		const required = (fn.params || []).filter(param => !param.optional).length;
		const maximum = (fn.params || []).length;
		if (checkArity && (args.length < required || args.length > maximum)) {
			diagnostics.push(diagnostic(VSCODE, document, token,
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
					diagnostics.push(diagnostic(VSCODE, document, arg,
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
				diagnostics.push(diagnostic(VSCODE, document, tokens[i - 1],
					`Cannot assign ${actual} to ${target.type} variable '${tokens[i - 1].value}'.`,
					severity));
			}
		}
	}

	return diagnostics;
}

module.exports = {
	splitTopLevel,
	constantExpressionType,
	inferFunctionReturnTypes,
	expressionType,
	areTypesCompatible,
	diagnostic,
	analyzeDocument
};
