const assert = require("assert");
const Module = require("module");

const vscodeMock = {
	EndOfLine: { LF: 1, CRLF: 2 },
	CodeActionKind: { QuickFix: "quickfix" },
	DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2 },
	Position: class Position { constructor(line, character) { this.line = line; this.character = character; } },
	Range: class Range { constructor(start, end) { this.start = start; this.end = end; } },
	Diagnostic: class Diagnostic { constructor(range, message, severity) { this.range = range; this.message = message; this.severity = severity; } },
	CodeAction: class CodeAction { constructor(title, kind) { this.title = title; this.kind = kind; } },
	WorkspaceEdit: class WorkspaceEdit {
		constructor() { this.entries = []; }
		replace(uri, range, text) { this.entries.push({ type: "replace", uri, range, text }); }
		insert(uri, position, text) { this.entries.push({ type: "insert", uri, position, text }); }
	},
	workspace: {
		getConfiguration() {
			return { get(key, fallback) {
				const values = {
					enabled: true,
					severity: "Warning",
					checkFunctionArity: true,
					checkArgumentTypes: true,
					checkAssignments: true,
					strictUnknownFunctions: false
				};
				return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback;
			}};
		},
		asRelativePath(uri) { return String(uri); }
	}
};

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
	if (request === "vscode") return vscodeMock;
	return originalLoad.call(this, request, parent, isMain);
};

const extension = require("../src/extension.js");
Module._load = originalLoad;

const {
	parseSource, makeFunctionMap, makeConstantMap, analyzeDocument, resolveVariable,
	expressionType, formatLgcText, isCompileTimeConstant, findVariableAt,
	variableReferenceTokens, renameVariableEdits, codeActionsForDiagnostics,
	setWorkspaceFunctionEntriesForTests
} = extension.__test;

const source = [
	"int counter = 0;",
	"string label = \"ready\";",
	"void LocalHelper(int unit) {",
	"    AddCommand(unit, ACT_MOVE, 10, 20);",
	"}",
	"void Test() {",
	"    LocalHelper(\"wrong\");",
	"    SetCommands(1, 42);",
	"    counter = \"not an integer\";",
	"}"
].join("\n");

const uri = { toString: () => "file:///test.lgc" };
const parsed = parseSource(source, null);
assert(parsed.functions.some(fn => fn.name === "LocalHelper"), "workspace function should be parsed");
const externalSource = "extern AddCommand(int unit, int action, int x, int y, int z) 1;";
const externalParsed = parseSource(externalSource, null);
assert(externalParsed.functions.some(fn => fn.name === "AddCommand" && fn.external), "engine prototypes should be identified as external declarations");
const bundledAddCommand = makeFunctionMap(null, externalParsed).get("AddCommand");
assert(bundledAddCommand && bundledAddCommand.source === "export.lgc", "external engine prototypes must not replace bundled API documentation");
assert(parsed.variables.has("counter"), "typed variables should be indexed");
assert(parsed.variables.has("label"), "string variables should be indexed");

const document = {
	uri,
	languageId: "lgc",
	getText() { return source; },
	positionAt(offset) {
		const before = source.slice(0, offset);
		const line = before.split("\n").length - 1;
		const lastNewline = before.lastIndexOf("\n");
		return new vscodeMock.Position(line, offset - lastNewline - 1);
	}
};

const functions = makeFunctionMap(document, parsed);
const constants = makeConstantMap(parsed);
const diagnostics = analyzeDocument(document, parsed, functions, constants);
assert(diagnostics.some(item => item.message.includes("expects int, but the expression is string")),
	"typed function arguments should be checked");
assert(diagnostics.some(item => item.message.includes("expects string, but the expression is int")),
	"string arguments should be checked");
assert(diagnostics.some(item => item.message.includes("Cannot assign string to int")),
	"typed variable assignments should be checked");


// Verify that identical variable names retain the type of their own lexical scope.
const scopedSource = [
	"string shared;",
	"void First() {",
	"    string s;",
	"    s = 1;",
	"}",
	"void Second() {",
	"    int s;",
	"    s = \"wrong\";",
	"}",
	"void Nested() {",
	"    string s;",
	"    { int s; s = \"wrong-inner\"; }",
	"    s = 1;",
	"}",
	"void Takes(string input) {",
	"    int copy;",
	"    copy = input;",
	"}",
	"void UsesGlobal() { shared = 42; }",
	"void Characters() { char c; c = 'a'; }"
].join("\n");
const scopedParsed = parseSource(scopedSource, null);
const firstS = scopedSource.indexOf("s = 1;");
const secondS = scopedSource.indexOf('s = "wrong";');
const innerS = scopedSource.indexOf('s = "wrong-inner";');
const outerS = scopedSource.lastIndexOf("s = 1;");
assert.strictEqual(resolveVariable(scopedParsed.variables, "s", firstS).type, "string",
	"string locals must keep their declared type in their own function");
assert.strictEqual(resolveVariable(scopedParsed.variables, "s", secondS).type, "int",
	"same-named int locals in another function must not overwrite string locals");
assert.strictEqual(resolveVariable(scopedParsed.variables, "s", innerS).type, "int",
	"an inner block declaration must shadow an outer declaration");
assert.strictEqual(resolveVariable(scopedParsed.variables, "s", outerS).type, "string",
	"the outer declaration must become visible again after leaving a nested block");
const parameterUse = scopedSource.indexOf("copy = input;") + "copy = ".length;
assert.strictEqual(resolveVariable(scopedParsed.variables, "input", parameterUse).type, "string",
	"function parameters must be included in function-local type resolution");
const globalUse = scopedSource.indexOf("shared = 42") + 1;
assert.strictEqual(resolveVariable(scopedParsed.variables, "shared", globalUse).type, "string",
	"global declarations must be visible inside functions");
const characterUse = scopedSource.indexOf("c = 'a'") + 1;
assert.strictEqual(resolveVariable(scopedParsed.variables, "c", characterUse).type, "char",
	"char variables must not be collapsed into int variables");

const scopedDocument = {
	uri,
	languageId: "lgc",
	getText() { return scopedSource; },
	positionAt(offset) {
		const before = scopedSource.slice(0, offset);
		const line = before.split("\n").length - 1;
		const lastNewline = before.lastIndexOf("\n");
		return new vscodeMock.Position(line, offset - lastNewline - 1);
	}
};
const scopedFunctions = makeFunctionMap(scopedDocument, scopedParsed);
const scopedDiagnostics = analyzeDocument(scopedDocument, scopedParsed, scopedFunctions, makeConstantMap(scopedParsed));
assert(scopedDiagnostics.some(item => item.message.includes("Cannot assign int to string variable 's'")),
	"assignments to string locals must be checked using the local declaration type");
assert(scopedDiagnostics.some(item => item.message.includes("Cannot assign string to int variable 's'")),
	"assignments to int locals must be checked using the local declaration type");
assert(scopedDiagnostics.some(item => item.message.includes("Cannot assign string to int variable 'copy'")),
	"function parameter types must participate in assignment checks");

function makeDocumentForText(text) {
	return {
		uri,
		languageId: "lgc",
		eol: vscodeMock.EndOfLine.LF,
		getText(range) {
			if (!range) return text;
			const start = this.offsetAt(range.start);
			const end = this.offsetAt(range.end);
			return text.slice(start, end);
		},
		positionAt(offset) {
			const before = text.slice(0, offset);
			const line = before.split("\n").length - 1;
			const lastNewline = before.lastIndexOf("\n");
			return new vscodeMock.Position(line, offset - lastNewline - 1);
		},
		offsetAt(position) {
			const lines = text.split("\n");
			let offset = 0;
			for (let line = 0; line < position.line; line++) offset += lines[line].length + 1;
			return offset + position.character;
		},
		getWordRangeAtPosition(position, regex) {
			const lines = text.split("\n");
			const line = lines[position.line] || "";
			const character = position.character;
			const pattern = regex || /[A-Za-z_]\w*/;
			let match;
			const matcher = new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
			while ((match = matcher.exec(line)) !== null) {
				if (character >= match.index && character <= match.index + match[0].length) {
					return new vscodeMock.Range(
						new vscodeMock.Position(position.line, match.index),
						new vscodeMock.Position(position.line, match.index + match[0].length)
					);
				}
			}
			return null;
		},
		lineAt(line) {
			return { text: text.split("\n")[line] || "" };
		}
	};
}

// Non-constant initializers must be reported while literals, macros and constant arrays remain valid.
const initializerSource = [
	"#define BASE_VALUE 3",
	"int globalValue = BASE_VALUE + 2;",
	"int values[] = {0, BASE_VALUE, -2};",
	"int buildFlagValue = FLY_COUNT1;",
	"int GLOBAL_RUNTIME_VALUE = 0;",
	"int copiedGlobalRuntimeValue = GLOBAL_RUNTIME_VALUE;",
	'string caption = "literal";',
	"void Initialize(int runtimeValue) {",
	"    int constantValue = 2 + 3;",
	"    int dynamicValue = runtimeValue - globalValue;",
	"    int callValue = GetMoney(0);",
	"}"
].join("\n");
const initializerParsed = parseSource(initializerSource, uri);
const initializerDocument = makeDocumentForText(initializerSource);
const initializerDiagnostics = analyzeDocument(initializerDocument, initializerParsed,
	makeFunctionMap(initializerDocument, initializerParsed), makeConstantMap(initializerParsed));
const initializerErrors = initializerDiagnostics.filter(item => item.code === "lgc.nonConstantInitializer");
assert.strictEqual(initializerErrors.length, 3,
	"runtime-variable and function-call initializers should be rejected, while literals, macros and arrays are accepted");
assert(initializerErrors.every(item => item.severity === vscodeMock.DiagnosticSeverity.Error),
	"non-constant initializers must be marked as errors");
assert(initializerErrors.some(item => item.message.includes("'runtimeValue' is a runtime variable") && item.message.includes("Fix:")),
	"initializer diagnostics must explain the runtime-value cause and provide a fix");
assert(initializerErrors.some(item => item.message.includes("GLOBAL_RUNTIME_VALUE") && item.message.includes("runtime variable")),
	"uppercase variables declared in the file must not be mistaken for build-time macros");
assert(isCompileTimeConstant(parseSource("int x;", null).tokens.slice(0, 0), new Map()) === false,
	"an empty expression cannot be treated as a compile-time constant");

// Regression for the exact state-change pattern reported from a tutorial map.
const stateChangeSource = [
	"#define STATE_OBJECTIVE_NONE 0",
	"#define STATE_OBJECTIVE_MONEY 1",
	"int map_state_old = STATE_OBJECTIVE_NONE;",
	"int map_state = STATE_OBJECTIVE_MONEY;",
	"StateWasChanged() {",
	"    int result = map_state - map_state_old;",
	"    map_state_old = map_state;",
	"    return result != 0;",
	"}"
].join("\n");
const stateChangeParsed = parseSource(stateChangeSource, uri);
const stateChangeDocument = makeDocumentForText(stateChangeSource);
const stateChangeDiagnostics = analyzeDocument(stateChangeDocument, stateChangeParsed,
	makeFunctionMap(stateChangeDocument, stateChangeParsed), makeConstantMap(stateChangeParsed));
const stateInitializerError = stateChangeDiagnostics.find(item => item.code === "lgc.nonConstantInitializer");
assert(stateInitializerError && stateInitializerError.message.includes("'map_state' is a runtime variable"),
	"the reported map_state initializer must be diagnosed as a runtime expression");
assert(stateInitializerError.message.includes("declare the variable without an initializer") &&
	stateInitializerError.message.includes("assign this expression at runtime"),
	"the initializer diagnostic must explain the reason and the recommended fix");

// The code action can safely split one local declaration into a declaration and a runtime assignment.
const fixSource = "void Initialize() {\n    int value = GetMoney(0);\n    static int cached = GetMoney(0);\n}";
const fixDocument = makeDocumentForText(fixSource);
const fixParsed = parseSource(fixSource, uri);
const fixDiagnostics = analyzeDocument(fixDocument, fixParsed,
	makeFunctionMap(fixDocument, fixParsed), makeConstantMap(fixParsed));
const fixActions = codeActionsForDiagnostics(fixDocument, { diagnostics: fixDiagnostics.map(item => ({
	code: item.code,
	range: item.range,
	message: item.message
})) });
assert.strictEqual(fixActions.length, 1, "a simple non-static local initializer should offer a quick fix without custom diagnostic metadata");
assert(fixActions[0].title.includes("runtime assignment"), "the quick fix should describe the declaration split");
assert(fixActions[0].edit.entries.some(edit => edit.type === "insert" && edit.text.includes("value = GetMoney(0);")),
	"the quick fix should insert the runtime assignment after the declaration");

// F2 rename binding must stay inside the declaration's lexical scope.
const renameSource = [
	"#define value 99",
	"void RenameScope() {",
	"    int value;",
	"    value = 1;",
	"    {",
	"        string value;",
	'        value = "nested";',
	"    }",
	"    value = 2;",
	"}"
].join("\n");
const renameParsed = parseSource(renameSource, uri);
const outerDeclaration = findVariableAt(renameParsed, "value", renameSource.indexOf("value;"));
const innerDeclaration = findVariableAt(renameParsed, "value", renameSource.indexOf("value;", renameSource.indexOf("value;") + 1));
assert(outerDeclaration && innerDeclaration && outerDeclaration !== innerDeclaration,
	"same-named declarations in nested blocks must resolve to separate symbols");
assert.strictEqual(variableReferenceTokens(renameParsed, outerDeclaration).length, 3,
	"renaming the outer variable should include its declaration and both outer references only");
assert.strictEqual(variableReferenceTokens(renameParsed, innerDeclaration).length, 2,
	"renaming the inner variable should include only its declaration and inner reference");
const renameDocument = makeDocumentForText(renameSource);
const renamePosition = renameDocument.positionAt(renameSource.indexOf("value = 2"));
const renameEdit = renameVariableEdits(renameDocument, renameParsed, renamePosition, "score");
assert.strictEqual(renameEdit.entries.length, 3,
	"F2 rename edits must change only the declaration and references bound to the selected scope");

// A function name cannot be reused for an overload, duplicate definition or engine API replacement.
const collisionSource = [
	"void LocalName(int value) {}",
	"void LocalName(string value) {}",
	"int AddCommand() {}",
	"void Duplicate() {}",
	"void Duplicate() {}",
	"extern AddCommand(int unit, int action, int x, int y, int z) 82;"
].join("\n");
const collisionParsed = parseSource(collisionSource, uri);
const collisionDocument = makeDocumentForText(collisionSource);
const collisionDiagnostics = analyzeDocument(collisionDocument, collisionParsed,
	makeFunctionMap(collisionDocument, collisionParsed), makeConstantMap(collisionParsed));
const collisions = collisionDiagnostics.filter(item => item.code === "lgc.functionNameCollision");
assert(collisions.some(item => item.message.includes("LocalName") && item.message.includes("overloading is unsupported")),
	"overloaded functions must produce a collision diagnostic");
assert(collisions.some(item => item.message.includes("AddCommand") && item.message.includes("engine already exports")),
	"user functions must not replace names from the engine API");
assert(collisions.some(item => item.message.includes("Duplicate") && item.message.includes("another definition")),
	"duplicate definitions must produce a collision diagnostic");
assert(collisions.every(item => item.severity === vscodeMock.DiagnosticSeverity.Error),
	"function name collisions must be marked as errors");
assert(!collisions.some(item => item.message.includes("extern AddCommand")),
	"an extern declaration of a bundled engine API must remain valid");

const guardedFallbackSource = [
	"#ifndef EventHook",
	"EventHook(int value) { DefaultHook(value); }",
	"#endif",
	"EventHook(int value) { CustomHook(value); }"
].join("\n");
const guardedParsed = parseSource(guardedFallbackSource, uri);
assert(guardedParsed.functions.find(fn => fn.name === "EventHook" && fn.preprocessorGuards.includes("EventHook")),
	"function declarations under #ifndef NAME must retain their preprocessor guard");
const guardedDocument = makeDocumentForText(guardedFallbackSource);
const guardedDiagnostics = analyzeDocument(guardedDocument, guardedParsed,
	makeFunctionMap(guardedDocument, guardedParsed), makeConstantMap(guardedParsed));
assert(!guardedDiagnostics.some(item => item.code === "lgc.functionNameCollision"),
	"a same-name #ifndef fallback should not be reported as a duplicate definition");

const workspaceCollisionUri = { toString: () => "file:///another-script.lgc" };
const workspaceCollisionFunction = parseSource("void WorkspaceHelper() {}", workspaceCollisionUri).functions[0];
setWorkspaceFunctionEntriesForTests(new Map([["WorkspaceHelper", [workspaceCollisionFunction]]]));
const currentCollisionSource = "void WorkspaceHelper() {}";
const currentCollisionDocument = makeDocumentForText(currentCollisionSource);
const currentCollisionParsed = parseSource(currentCollisionSource, uri);
const workspaceCollisionDiagnostics = analyzeDocument(currentCollisionDocument, currentCollisionParsed,
	makeFunctionMap(currentCollisionDocument, currentCollisionParsed), makeConstantMap(currentCollisionParsed));
assert(workspaceCollisionDiagnostics.some(item => item.code === "lgc.functionNameCollision" &&
	item.message.includes("another script already declares")),
	"a function name already used by another workspace script must be reported");
setWorkspaceFunctionEntriesForTests(new Map());

const returnTypeSource = [
	'string MakeString() { return "text"; }',
	"int MakeInt() { return 1; }",
	"void CheckReturns() { SetCommands(1, MakeString()); SetCommands(1, MakeInt()); }"
].join("\n");
const returnTypeParsed = parseSource(returnTypeSource, null);
const returnTypeDocument = {
	uri,
	languageId: "lgc",
	getText() { return returnTypeSource; },
	positionAt(offset) {
		const before = returnTypeSource.slice(0, offset);
		const line = before.split("\n").length - 1;
		const lastNewline = before.lastIndexOf("\n");
		return new vscodeMock.Position(line, offset - lastNewline - 1);
	}
};
const returnTypeDiagnostics = analyzeDocument(returnTypeDocument, returnTypeParsed,
	makeFunctionMap(returnTypeDocument, returnTypeParsed), makeConstantMap(returnTypeParsed));
assert(returnTypeDiagnostics.some(item => item.message.includes("expects string, but the expression is int")),
	"known function return types must be checked when passed as arguments");


const inferredReturnSource = [
	'MakeText() { return "text"; }',
	'MakeNumber() { return -42; }',
	'MakeMixed(int flag) { if (flag) return "text"; return 42; }',
	'void CheckInferredReturns() { SetCommands(1, MakeText()); SetCommands(1, MakeNumber()); }'
].join("\n");
const inferredReturnParsed = parseSource(inferredReturnSource, null);
assert.strictEqual(inferredReturnParsed.functions.find(fn => fn.name === "MakeText").returnType, "string",
	"unannotated helper return types should be inferred from consistent return statements");
assert.strictEqual(inferredReturnParsed.functions.find(fn => fn.name === "MakeNumber").returnType, "int",
	"unary numeric return expressions should be inferred as int");
assert.strictEqual(inferredReturnParsed.functions.find(fn => fn.name === "MakeMixed").returnType, "unknown",
	"conflicting return expressions must remain unknown rather than guessing");
const inferredReturnDocument = {
	uri,
	languageId: "lgc",
	getText() { return inferredReturnSource; },
	positionAt(offset) {
		const before = inferredReturnSource.slice(0, offset);
		const line = before.split("\n").length - 1;
		const lastNewline = before.lastIndexOf("\n");
		return new vscodeMock.Position(line, offset - lastNewline - 1);
	}
};
const inferredReturnDiagnostics = analyzeDocument(inferredReturnDocument, inferredReturnParsed,
	makeFunctionMap(inferredReturnDocument, inferredReturnParsed), makeConstantMap(inferredReturnParsed));
assert(inferredReturnDiagnostics.some(item => item.message.includes("expects string, but the expression is int")),
	"inferred helper return types should be used for function argument validation");


// Verify formatting output, custom settings, comment/string preservation and idempotency.
const unformatted = [
	'#include "base.lgc"',
	'int Run(int x,int y){string text="brace { ; } // not a comment";if(x>0){Foo(x,y);}// trailing comment',
	'else{text="done";}for(int i=0;i<3;i++){text=text+"!";}return x?y:0;}',
	''
].join("\n");
const formatted = formatLgcText(unformatted);
assert(formatted.includes('    if (x > 0) {'), "control-flow blocks should be indented and use the configured same-line brace style");
assert(formatted.includes('Foo(x, y);'), "commas should be followed by a space");
assert(formatted.includes('// trailing comment'), "line comments should be preserved");
assert(formatted.includes('"brace { ; } // not a comment"'), "string contents must remain unchanged");
assert(formatted.includes('return x ? y : 0;'), "ternary expressions should receive consistent spacing");
assert.strictEqual(formatLgcText(formatted), formatted, "formatting should be idempotent");
const caseIndented = formatLgcText('void Test(){switch(1){case 0:break;default:foo();}}', { indentCaseLabels: true });
assert(caseIndented.includes('        case 0:\n            break;'), "indented case labels should keep their statements one level deeper");
assert(caseIndented.includes('    }\n}'), "switch closing braces should return to the correct indentation after case labels");
const blankLines = formatLgcText('void First(){}\n\nvoid Second(){}');
assert(blankLines.includes('void First() {}\n\nvoid Second() {}'), "blank lines between top-level functions should be preserved by default");

const tabsFormatted = formatLgcText('void Test(){if(1){Call(1,2);}}', {
	indentStyle: "tabs",
	braceStyle: "nextLine",
	spaceBeforeParens: "always",
	spaceInsideParentheses: true,
	spaceAfterComma: false
});
assert(tabsFormatted.includes('void Test ()\n{'), "next-line braces and always-space-before-parens settings should be honored");
const allmanConditional = formatLgcText('void Branch(){if(a){}else if(b){}else{Run();}}', { braceStyle: "nextLine" });
assert(allmanConditional.includes('    {}\n    else if (b)\n    {}\n    else\n    {'), "next-line brace style should also move else clauses consistently");
assert(tabsFormatted.includes('\t\tCall ( 1,2 );'), "tabs, nested indentation, parenthesis padding and comma settings should be honored");
assert.strictEqual(formatLgcText(tabsFormatted, {
	indentStyle: "tabs", braceStyle: "nextLine", spaceBeforeParens: "always",
	spaceInsideParentheses: true, spaceAfterComma: false
}), tabsFormatted, "non-default formatting should also be idempotent");

const compactFormatted = formatLgcText('int f(){int a=1+2;return a;}', {
	indentStyle: "spaces", indentSize: 2, spaceAroundOperators: false,
	blankLinesBetweenFunctions: 0, preserveBlankLines: false, insertFinalNewline: false
});
assert(compactFormatted.includes('  int a=1+2;'), "operator spacing and indentation size settings should be honored");
assert(!compactFormatted.endsWith("\n"), "insertFinalNewline=false should be honored");

const formatter = require("../src/formatter");
const tokenSample = 'string s="// /* } ;"; /* block\n comment */ int x=a->b[0]+1; // tail\n';
const originalTokens = formatter.scanTokens(tokenSample).map(token => token.value);
const formattedTokens = formatter.scanTokens(formatLgcText(tokenSample)).map(token => token.value);
assert.deepStrictEqual(formattedTokens, originalTokens, "formatting must preserve all lexical tokens, comments and literals");
const crlfFormatted = formatLgcText('void CrLf(){\r\nint value=1;\r\n}\r\n');
assert(!crlfFormatted.replace(/\r\n/g, "").includes("\n"), "the source CRLF line-ending style should be preserved");

const catalog = require("../data/functions.json");
const constantCatalog = require("../data/constants.json");
assert(catalog.length >= 200, "built-in and helper catalog should be populated");
assert(constantCatalog.length >= 400, "engine constants should be populated");
assert(catalog.every(item => !/[А-Яа-яЁё]/.test(item.description)), "function documentation must be English");
assert(constantCatalog.every(item => !/[А-Яа-яЁё]/.test(item.description)), "constant documentation must be English");

console.log(`Smoke tests passed (${catalog.length} functions, ${constantCatalog.length} constants).`);
