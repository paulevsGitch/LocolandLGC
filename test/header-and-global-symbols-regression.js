"use strict";

const assert = require("assert");
const { parseSyntax, resolveVariable } = require("../src/parser");
const {
	analyzeDocument, isAlwaysAvailableFunction, resolveVisibleFunction, expressionType,
	createAnalysisVariableMap, functionCollisionReason, findUnsupportedTypeDeclarations,
	findInvalidDefineTokens, findUnknownValueIdentifiers, parseIncludeDirectives,
	hasVisibleWorkspaceGlobalVariable
} = require("../src/analyzer");
const { HEADER_SOURCE_FILES, isAlwaysAvailableSource } = require("../src/header-symbols");
const { collectDefinedNames, findDefinedIdentifierRanges } = require("../src/define-highlighting");
const { tokenize } = require("../src/lexer");
const { WorkspaceIndex, createFunctionMap } = require("../src/workspace-index");
const GLOBAL_VARIABLE_CATALOG = require("../data/global-variables.json");

// In the complete extension repository these are the real catalogues. The small fallback
// keeps this file independently runnable when only the source patch has been extracted.
let functionCatalog = [];
let constantCatalog = [];
try { functionCatalog = require("../data/functions.json"); } catch (_error) {
	functionCatalog = [
		{ name: "GETSPRITE_ARMY", source: "export.lgc", returnType: "int", params: [{ name: "army", type: "int" }] },
		{ name: "FirstInBox", source: "export.lgc", returnType: "int", params: [] },
		{ name: "NextInBox", source: "export.lgc", returnType: "int", params: [] },
		{ name: "GetVid", source: "obsolete.lgc", returnType: "int", params: [] },
		{ name: "GetUnitVid", source: "export.lgc", returnType: "int", params: [] },
		{ name: "Action", source: "export.lgc", returnType: "int", params: [] },
		{ name: "GetAnimation", source: "export.lgc", returnType: "int", params: [] },
		{ name: "GetX", source: "export.lgc", returnType: "int", params: [] },
		{ name: "GetY", source: "export.lgc", returnType: "int", params: [] },
		{ name: "GetZ", source: "export.lgc", returnType: "int", params: [] },
		{ name: "FindNearestSprite", source: "export.lgc", returnType: "int", params: [] },
		{ name: "Log", source: "basefunctions.lgc", returnType: "void", params: [] },
		{ name: "itoa", source: "export.lgc", returnType: "string", params: [{ name: "n", type: "int" }] }
	];
}
try { constantCatalog = require("../data/constants.json"); } catch (_error) {
	constantCatalog = ["B_ENGINE", "VID_CLASS", "act_getarmy", "ANI_DEATH", "GETSPRITE_VID", "ACT_FIRST_ENGINE"]
		.map(name => ({ name, value: "1", source: "export.lgc" }));
}

const vscode = {
	DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2 },
	Position: class Position { constructor(line, character) { this.line = line; this.character = character; } },
	Range: class Range { constructor(start, end) { this.start = start; this.end = end; } },
	Diagnostic: class Diagnostic { constructor(range, message, severity) { this.range = range; this.message = message; this.severity = severity; } },
	workspace: { getConfiguration() { return { get(_key, fallback) { return fallback; } }; } }
};

function makeDocument(source, name = "inline-regression.lgc") {
	return {
		uri: { toString: () => `file:///lgc-inline-tests/${name}` },
		languageId: "lgc",
		getText: () => source,
		positionAt(offset) {
			const before = source.slice(0, offset);
			const line = before.split("\n").length - 1;
			return new vscode.Position(line, offset - before.lastIndexOf("\n") - 1);
		}
	};
}

function createWorkspaceVariableEntries(names, source = "ai_functions.lgc") {
	return new Map(names.map(name => [name, [{ name, type: "int", isArray: true, source }]]));
}

function makeFunctionMaps(parsed, extras = []) {
	const functions = new Map(functionCatalog.map(item => [item.name, item]));
	for (const fn of parsed.functions) functions.set(fn.name, fn);
	for (const fn of extras) functions.set(fn.name, fn);
	const entries = new Map();
	for (const fn of extras) entries.set(fn.name, [fn]);
	return { functions, entries };
}

function analyze(source, options = {}) {
	const parsed = parseSyntax(source, { toString: () => "inline-regression.lgc" }, () => "inline-regression.lgc");
	const { functions, entries } = makeFunctionMaps(parsed, options.workspaceFunctions || []);
	const constants = new Map(constantCatalog.map(item => [item.name, item]));
	for (const [name, value] of parsed.constants) constants.set(name, value);
	const workspaceVariables = createWorkspaceVariableEntries(options.workspaceVariables || []);
	const diagnostics = analyzeDocument(
		vscode, makeDocument(source, options.name), parsed, functions, constants,
		entries, functionCatalog, workspaceVariables
	);
	return { parsed, diagnostics, functions, constants, workspaceVariables };
}

// Every function whose metadata source is one of header.lgc's direct includes is global.
assert.strictEqual(HEADER_SOURCE_FILES.length, 28, "the always-available source list should include header.lgc and its standard include closure");
for (const fn of functionCatalog) {
	if (isAlwaysAvailableSource(fn.source)) {
		assert.strictEqual(isAlwaysAvailableFunction(fn), true, `${fn.name} from ${fn.source} must be globally visible`);
	}
}
assert(isAlwaysAvailableSource("header.lgc"), "global declarations in header.lgc must be considered always available");
assert.strictEqual(isAlwaysAvailableFunction({ name: "ArbitraryScriptFn", id: 17, source: "custom_map_helpers.lgc" }), false,
	"a numeric function ID must not bypass source-based visibility");
assert.strictEqual(isAlwaysAvailableFunction({ name: "FakeExport", source: "custom/export.lgc" }), false,
	"a custom file with a standard basename must not be mistaken for the engine source");
assert.strictEqual(isAlwaysAvailableFunction({ name: "Anything", source: "maps\\script\\export.lgc" }), true,
	"source paths must normalise Windows separators");
const winFunction = functionCatalog.find(item => item.name === "Win");
assert(winFunction && winFunction.source.toLowerCase() === "menuend.lgc", "Win must be catalogued from menuend.lgc");
assert(isAlwaysAvailableFunction(winFunction), "Win must be global because menuend.lgc is in header.lgc's transitive closure");
const getSpriteArmy = functionCatalog.find(item => item.name === "GETSPRITE_ARMY");
assert(getSpriteArmy, "the function catalogue should contain GETSPRITE_ARMY");
assert(isAlwaysAvailableFunction(getSpriteArmy), "GETSPRITE_ARMY must be global because its source is included by header.lgc");
const emptyParsed = parseSyntax("");
assert(resolveVisibleFunction("GETSPRITE_ARMY", { start: 0 }, emptyParsed,
	new Map(functionCatalog.map(item => [item.name, item])), functionCatalog, new Map(), []),
"GETSPRITE_ARMY must resolve without an explicit include because export.lgc is loaded by header.lgc");


// Every root-scope declaration from the standard header source closure is bundled as a
// synthetic global, even when the game scripts are not part of the user's VS Code workspace.
assert.strictEqual(GLOBAL_VARIABLE_CATALOG.length, 207,
	"the global variable catalogue must include every header-loaded file-scope declaration plus the seven shared train declarations");
for (const name of ["player_x", "player_y"]) {
	const entry = GLOBAL_VARIABLE_CATALOG.find(item => item.name === name);
	assert(entry && entry.type === "int" && entry.source === "reinforcement.lgc",
		`${name} must be included as a standard-header global from reinforcement.lgc`);
	assert(hasVisibleWorkspaceGlobalVariable(name, new Map(), [], 100),
		`${name} must be visible without requiring the game's script folder in the workspace`);
}
const playerCoordinatesSource = `ReadPlayerCoordinates()\n{\n  int x,y;\n  x=player_x;\n  y=player_y;\n  return x+y;\n}`;
const playerCoordinatesParsed = parseSyntax(playerCoordinatesSource);
const playerCoordinatesUnknown = findUnknownValueIdentifiers(playerCoordinatesParsed.tokens,
	playerCoordinatesParsed, new Map(), new Map(), playerCoordinatesSource);
assert.deepStrictEqual(playerCoordinatesUnknown.filter(token => token.value === "player_x" || token.value === "player_y"), [],
	"player_x and player_y from reinforcement.lgc must not be reported as unknown variables");
const playerCoordinatesAnalysis = analyze(playerCoordinatesSource, { name: "player-coordinates.lgc" });
assert.deepStrictEqual(playerCoordinatesAnalysis.diagnostics.filter(item => item.code === "lgc.unknownVariable"), [],
	"the integrated analyzer must accept player_x and player_y as standard globals");
const playerCoordinatesVariableMap = createAnalysisVariableMap(playerCoordinatesParsed.variables, playerCoordinatesSource.length);
for (const name of ["player_x", "player_y"]) {
	const token = playerCoordinatesParsed.tokens.find(item => item.value === name);
	assert.strictEqual(resolveVariable(playerCoordinatesVariableMap, name, token.start)?.type, "int",
		`${name} must retain its declared int type for expression analysis`);
}
for (const item of GLOBAL_VARIABLE_CATALOG) {
	assert(hasVisibleWorkspaceGlobalVariable(item.name, new Map(), [], 100),
		`${item.name} from ${item.source} must be globally visible`);
}

const visibilityEntries = new Map([
	["header_global", [{ source: "ai_functions.lgc" }]],
	["custom_global", [{ source: "custom_helpers.lgc" }]]
]);
assert(hasVisibleWorkspaceGlobalVariable("header_global", visibilityEntries, [], 100),
	"a workspace global from a standard-header source must be visible without a local include");
assert(!hasVisibleWorkspaceGlobalVariable("custom_global", visibilityEntries, [], 100),
	"an unrelated workspace global must not leak into the current script");
assert(hasVisibleWorkspaceGlobalVariable("custom_global", visibilityEntries,
	[{ path: "maps/script/custom_helpers.lgc", offset: 0 }], 100),
"an unrelated workspace global becomes visible after its source is included");
const customValueSource = "UseCustom()\n{\n  int value;\n  value=custom_global;\n}";
const customParsed = parseSyntax(customValueSource);
const customUnknownWithoutInclude = findUnknownValueIdentifiers(customParsed.tokens, customParsed,
	new Map(), new Map(), customValueSource, new Set(), visibilityEntries, []);
assert(customUnknownWithoutInclude.some(token => token.value === "custom_global"),
	"custom globals must still be diagnosed when their source has not been included");
const customUnknownWithInclude = findUnknownValueIdentifiers(customParsed.tokens, customParsed,
	new Map(), new Map(), '#include "maps\\script\\custom_helpers.lgc"\n' + customValueSource,
	new Set(), visibilityEntries, [{ path: "maps/script/custom_helpers.lgc", offset: 0 }]);
assert(!customUnknownWithInclude.some(token => token.value === "custom_global"),
	"custom globals must resolve after a preceding include");

// A standard-header source is global; a source not present in header.lgc still requires include.
const includedFunction = { name: "HeaderFunction", source: "captures.lgc", params: [], returnType: "int" };
const customFunction = { name: "CustomFunction", source: "custom_helpers.lgc", params: [], returnType: "int" };
assert(isAlwaysAvailableFunction(includedFunction));
assert(!isAlwaysAvailableFunction(customFunction));
assert(resolveVisibleFunction("HeaderFunction", { start: 0 }, emptyParsed, new Map(), [includedFunction], new Map(), []));
assert.strictEqual(resolveVisibleFunction("CustomFunction", { start: 0 }, emptyParsed, new Map(), [customFunction], new Map(), []), null);
assert(resolveVisibleFunction("CustomFunction", { start: 100 }, emptyParsed, new Map(), [customFunction], new Map(),
	[{ path: "maps/script/custom_helpers.lgc", offset: 0 }]));

// User declarations, including extern prototypes, cannot shadow a standard engine API name.
const userSinDefinition = parseSyntax("Sin(int angle)\n{ return 0; }",
	{ toString: () => "file:///game/l01/user.lgc" }, () => "l01/user.lgc");
assert(functionCollisionReason(userSinDefinition.functions[0], userSinDefinition, functionCatalog, new Map(), []),
	"user functions must not replace names from the engine API");
// The collision check must reserve catalogue names even when a test or consumer passes
// a compact catalogue record without `source` metadata. Visibility/source filtering is for
// resolving calls, not for deciding whether a bundled API name can be redefined.
assert(functionCollisionReason(userSinDefinition.functions[0], userSinDefinition,
	[{ name: "Sin", returnType: "int", params: [{ name: "angle", type: "int" }] }], new Map(), []),
	"engine API names must remain reserved when catalogue records omit source metadata");
assert(functionCollisionReason(userSinDefinition.functions[0], userSinDefinition,
	new Map([ ["Sin", { name: "Sin", returnType: "int" }] ]), new Map(), []),
	"engine API collisions must also work when the catalogue is supplied as a Map");
const sourceLessEngineFunction = { name: "Sin", returnType: "int", params: [{ name: "angle", type: "int" }] };
const sourceLessFunctionMap = createFunctionMap(userSinDefinition, [sourceLessEngineFunction]);
assert.notStrictEqual(sourceLessFunctionMap.get("Sin"), userSinDefinition.functions[0],
	"a user function must not replace a bundled engine function when optional source metadata is absent");
const sourceLessMapCatalogue = new Map([["Sin", sourceLessEngineFunction]]);
const sourceLessMapFunctionMap = createFunctionMap(userSinDefinition, sourceLessMapCatalogue);
assert.notStrictEqual(sourceLessMapFunctionMap.get("Sin"), userSinDefinition.functions[0],
	"a user function must not replace a bundled engine function when the catalogue is supplied as a Map");
const sourceLessWorkspaceFunctionMap = createFunctionMap(parseSyntax("", { toString: () => "file:///game/empty.lgc" }, () => "empty.lgc"),
	[sourceLessEngineFunction], new Map([["Sin", userSinDefinition.functions[0]]]));
assert.notStrictEqual(sourceLessWorkspaceFunctionMap.get("Sin"), userSinDefinition.functions[0],
	"a workspace function must not replace a bundled engine function when optional source metadata is absent");
const standardSinDeclaration = parseSyntax("extern Sin(int angle) 165;",
	{ toString: () => "file:///game/maps/script/export.lgc" }, () => "maps/script/export.lgc");
const enrichedStandardSinMap = createFunctionMap(standardSinDeclaration, [{ ...sourceLessEngineFunction, source: "export.lgc" }]);
assert.strictEqual(enrichedStandardSinMap.get("Sin"), standardSinDeclaration.functions[0],
	"the matching declaration in the actual standard export.lgc may enrich its catalogue entry");
const userSinPrototype = parseSyntax("extern Sin(int angle) 123;",
	{ toString: () => "file:///game/l01/user-api.lgc" }, () => "l01/user-api.lgc");
assert(functionCollisionReason(userSinPrototype.functions[0], userSinPrototype, functionCatalog, new Map(), []),
	"user extern prototypes must not bypass engine API name collisions");
const userSinPrototypeAnalysis = analyze("extern Sin(int angle) 123;", { name: "user-api-prototype.lgc" });
assert(userSinPrototypeAnalysis.diagnostics.some(item => item.code === "lgc.functionNameCollision"),
	"a user extern prototype must produce an engine API collision diagnostic");
const engineSinPrototype = parseSyntax("extern Sin(int angle) 123;",
	{ toString: () => "file:///game/maps/script/export.lgc" }, () => "maps/script/export.lgc");
assert.strictEqual(functionCollisionReason(engineSinPrototype.functions[0], engineSinPrototype, functionCatalog, new Map(), []), null,
	"the original engine declaration in maps/script/export.lgc must not collide with its own catalogue entry");

// Identically named functions in separate levels are not visible across level boundaries.
const l04Parsed = parseSyntax("moveto(int x)\n{\n  return;\n}",
	{ toString: () => "file:///game/l04/pirates.lgc" }, () => "l04/pirates.lgc");
const l18Moveto = {
	...l04Parsed.functions[0],
	source: "l18/pirates.lgc",
	uri: { toString: () => "file:///game/l18/pirates.lgc" }
};
const levelFunctionEntries = new Map([["moveto", [l18Moveto]]]);
assert.strictEqual(functionCollisionReason(l04Parsed.functions[0], l04Parsed, functionCatalog,
	levelFunctionEntries, [{ path: "l04/l06.lgc", offset: -1 }]), null,
"same-named functions in different level folders must not collide without a shared include");
assert(functionCollisionReason(l04Parsed.functions[0], l04Parsed, functionCatalog,
	levelFunctionEntries, [{ path: "l18/pirates.lgc", offset: -1 }]),
"same-named functions must still collide when their source is part of the same level context");

// A known macro imported from another file must not be misclassified as a variable type.
const externalMacro = new Map([["MESSAGE_FONT_X", { name: "MESSAGE_FONT_X", value: "12", source: "l01/defines.lgc" }]]);
const externalMacroText = "MESSAGE_FONT_X text_label;\n";
const externalMacroTokens = tokenize(externalMacroText);
assert.deepStrictEqual(findUnsupportedTypeDeclarations(externalMacroTokens, externalMacroText, externalMacro), [],
"workspace #define names must not be mistaken for unknown variable types");

// File-scope globals and function-local comma declarations must both bind correctly.
const planTaken = `
#define ARR_LENGTH 128
int ai_trains_type[ARR_LENGTH];
PlanTaken(int t)
{
  int i,j,k;
  i=plan_fifo[0];
  for( j=0; j<PLANS-1; j++ )
    plan_fifo[j]=plan_fifo[j+1];
  plan_state[i]=2;
  plan_slot[i]=-1;
  for( k=0; k<ARR_LENGTH; k++ )
    if( ai_trains[k] && ai_trains_type[k]>=ATT_DEPO_CREATED )
      plan_slot[i]=k;
  Log("ARRIVAL F"+itoa(i+1)+" wave "+itoa(plan_done[i]+1)+" taken at "+itoa(t)+" s slot "+itoa(plan_slot[i]));
}
`;
const planGlobals = ["plan_fifo", "plan_state", "plan_slot", "ai_trains", "plan_done"];
let result = analyze(planTaken, { workspaceVariables: planGlobals, name: "PlanTaken.lgc" });
assert(result.parsed.variables.has("ai_trains_type"), "the file-scope array ai_trains_type must be parsed as a declaration");
assert.strictEqual(result.parsed.variables.get("ai_trains_type")[0].type, "int");
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariable"), [],
	"PlanTaken's file-scope array and indexed workspace globals must not be unknown");

const captureTrain = `
CaptureTrain(int x,int y,int r)
{
  int u,dx,dy,found;
  found=0;
  for( u=FirstInBox(x-r,y-r,x+r,y+r+CAPTURE_HIGH); u; u=NextInBox() )
    if( !found && GetVid(GetUnitVid(u),VID_CLASS)==B_ENGINE )
      if( Action(u,act_getarmy,0,0)==0 && GetAnimation(u)<ANI_DEATH )
      {
        dx=GetX(u)-x;
        dy=GetY(u)-GetZ(u)-y;
        if( dx*dx+dy*dy<=r*r )
          found=u;
      }
  return found;
}
`;
result = analyze(captureTrain, { name: "CaptureTrain.lgc" });
for (const name of ["u", "dx", "dy", "found"]) {
	assert(result.parsed.variables.has(name), `CaptureTrain local '${name}' must be declared in its function scope`);
}
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariable"), [],
	"CaptureTrain local variables, including dx*dx, must resolve");
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownFunction"), [],
	"all CaptureTrain engine functions from header.lgc must resolve");
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariableType"), [],
	"CaptureTrain's dx*dx expression must not be mistaken for an unknown type declaration");
const firstDxMultiplierOffset = captureTrain.indexOf("dx*dx");
const firstDxMultiplierToken = result.parsed.tokens.find(token => token.start === firstDxMultiplierOffset);
assert(firstDxMultiplierToken && firstDxMultiplierToken.value === "dx",
	"the first dx multiplier must be present as its own token");
assert.strictEqual(resolveVariable(createAnalysisVariableMap(result.parsed.variables, captureTrain.length),
	"dx", firstDxMultiplierToken.start)?.type, "int",
	"the first dx multiplier must resolve to the local int declaration");

// A compact independent regression isolates the first operand of a multiplication.
const firstMultiplierRegression = `FirstMultiplier(int x)\n{\n  int dx,dy;\n  dx=x*2;\n  dy=x*3;\n  if( dx*dx+dy*dy<=x*x )\n    return dx;\n  return 0;\n}`;
result = analyze(firstMultiplierRegression, { name: "first-multiplier-regression.lgc" });
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariableType"), [],
	"the left operand of dx*dx must not be classified as an unknown type");
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariable"), [],
	"both occurrences of dx in dx*dx must resolve to the same local declaration");
const genuinelyUnknownType = parseSyntax("UnknownTypeProbe()\n{\n  bool a;\n}");
assert.strictEqual(findUnsupportedTypeDeclarations(genuinelyUnknownType.tokens, genuinelyUnknownType.text,
	new Map(), genuinelyUnknownType.variables).length, 1,
	"a real unsupported type declaration such as bool a; must still be reported");

const nearestSprite = `
int cr_n;
int cr_army[8];
int cr_x[8], cr_y[8];
FindNearestSprite(GETSPRITE_VID+117+GETSPRITE_ARMY(cr_army[cr_n]),cr_x[cr_n],cr_y[cr_n],100000)!=0;
`;
result = analyze(nearestSprite, { name: "FindNearestSprite.lgc" });
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownFunction"), [],
	"GETSPRITE_ARMY must resolve as a standard header function");
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariable"), [],
	"the array arguments in the sprite expression must resolve");

// Representative helper functions (ported as inline snippets, not fixture files).
const helperSamples = [
	`MissionMusic()\n{\n  music_turn++;\n  if( music_turn>=MUSIC_FILES ) music_turn=0;\n  if( music_turn==0 ) return MUSIC_FILE0;\n  if( music_turn==1 ) return MUSIC_FILE1;\n  return \"\";\n}`,
	`ArrivalsLeft(int army)\n{\n  int i,n;\n  n=0;\n  for( i=0; i<ARRIVALS; i++ )\n    if( arrival_army[i]==army && (arrival_x[i] || arrival_y[i]) )\n      if( !arrival_times[i] || arrival_done[i]<arrival_times[i] )\n        if( !arrival_if[i] || arrival_or[i] || ArrivalIf(i) ) n++;\n  return n;\n}`,
	`PlanLoco(int u)\n{\n  int c,v;\n  for( c=Action(u,ACT_FIRST_ENGINE); c; c=Action(c,ACT_NEXT_ENGINE) )\n  {\n    v=GetUnitVid(c);\n    if( v==5 || v==10 || v==97 ) return c;\n  }\n  return u;\n}`
];
const embeddedGlobals = [
	"music_turn", "arrival_army", "arrival_x", "arrival_y", "arrival_times", "arrival_done", "arrival_if", "arrival_or"
];
const helperFunctions = [{ name: "ArrivalIf", source: "ai_functions.lgc", params: [{ name: "i", type: "int" }], returnType: "int" }];
for (let i = 0; i < helperSamples.length; i++) {
	result = analyze(helperSamples[i], {
		name: `inline-helper-${i}.lgc`,
		workspaceVariables: embeddedGlobals,
		workspaceFunctions: helperFunctions
	});
	assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariable"), [],
		`inline helper sample ${i + 1} must not report unresolved variables`);
	assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownFunction"), [],
		`inline helper sample ${i + 1} must not report unresolved functions`);
}

// #define directives may not use C-style '=' or ';'; punctuation inside a quoted value is safe.
const defineSource = `#define GOOD_LIMIT 25\r\n#define TEXT_VALUE "a;=b"\r\n#define BAD_LIMIT \\\r\n = 25;\r\n`;
const defineParsed = parseSyntax(defineSource);
const invalidDefines = findInvalidDefineTokens(defineParsed.tokens, defineSource);
assert.deepStrictEqual(invalidDefines.map(token => token.value), ["=", ";"],
	"only unquoted '=' and ';' inside the define directive should be diagnosed");
result = analyze(defineSource, { name: "defines.lgc" });
assert.strictEqual(result.diagnostics.filter(item => item.code === "lgc.invalidDefineSyntax").length, 2);

const highlightText = `#define LOCAL_LIMIT 50\nint value;\nvalue=LOCAL_LIMIT+GETSPRITE_VID;\n`;
const highlightNames = collectDefinedNames(highlightText, constantCatalog, new Map([ ["WORKSPACE_LIMIT", { value: "3" }] ]));
const highlightRanges = findDefinedIdentifierRanges(tokenize(highlightText), highlightNames);
const highlightedSource = highlightRanges.map(range => highlightText.slice(range.start, range.end));
assert.strictEqual(highlightedSource.filter(name => name === "LOCAL_LIMIT").length, 2,
	"the local #define name and its use must both be decorated bold");
assert(highlightedSource.includes("GETSPRITE_VID"), "catalogue constants must receive the same bold-only decoration");
assert(highlightNames.has("WORKSPACE_LIMIT"), "workspace defines must be included in the decoration name set");

// Game globals declared by header.lgc and the selected train-tactics declarations are
// available to all maps even when trainstactdeclares.lgc is not included by header.lgc.
const gameGlobalNames = [
	"time_game_total", "nuke_time", "end", "we_are_win",
	"temp_array", "ai_trains", "ai_trains_task2", "ai_trains_task",
	"ai_trains_type", "ai_trains_target", "stgbeh"
];
const globalUse = `CheckGameGlobals()
{
  int value;
  value=time_game_total+nuke_time+end+we_are_win+stgbeh;
  value=value+temp_array[0]+ai_trains[0]+ai_trains_task2[0]+ai_trains_task[0]+ai_trains_type[0]+ai_trains_target[0];
  return value;
}
`;
result = analyze(globalUse, { name: "game-globals.lgc" });
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariable"), [],
	"all header and trainstactdeclares globals must resolve without workspace fixtures");
const semanticGlobals = createAnalysisVariableMap(result.parsed.variables, globalUse.length);
for (const name of gameGlobalNames) {
	const entry = semanticGlobals.get(name);
	assert(entry && entry.some(item => item.type === "int"), `${name} must be present in the semantic global-variable map`);
	const useToken = result.parsed.tokens.find(token => token.value === name && token.start > globalUse.indexOf("value="));
	assert(useToken && resolveVariable(semanticGlobals, name, useToken.start), `${name} must resolve at its use site`);
}
for (const name of ["temp_array", "ai_trains", "ai_trains_task2", "ai_trains_task", "ai_trains_type", "ai_trains_target"]) {
	assert(semanticGlobals.get(name).some(item => item.isArray), `${name} must retain its array metadata`);
}
for (const name of gameGlobalNames) {
	assert(GLOBAL_VARIABLE_CATALOG.some(item => item.name === name && item.source && item.description),
		`${name} must have source metadata and an English description`);
}
const arrayUseStart = globalUse.indexOf("temp_array[0]");
const arrayUseIndex = result.parsed.tokens.findIndex(token => token.value === "temp_array" && token.start >= arrayUseStart);
const arrayExpression = result.parsed.tokens.slice(arrayUseIndex, arrayUseIndex + 4);
assert.strictEqual(expressionType(arrayExpression, semanticGlobals, result.functions, result.constants, arrayExpression[0].start), "int",
	"an indexed standard global integer array must infer as int");
const globalTypeCheck = `CheckGlobalType()
{
  string text_value;
  text_value=time_game_total;
}
`;
result = analyze(globalTypeCheck, { name: "game-global-type.lgc" });
assert.strictEqual(result.diagnostics.filter(item => item.code === "lgc.assignmentTypeMismatch").length, 1,
	"header globals must retain their int type for assignment checking");

// Regression for the chained multiplication in CaptureLine. All locals are declared
// together before #ifdef; the declaration must remain visible inside nested blocks.
const captureLine = `CaptureLine(int b)
{
  int i,v,x,y,dx,dy,ex,ey,vx,vy,s,l,t,d,best,found;
  v=GetUnitVid(b);
  x=GetX(b);
  y=GetY(b)-GetZ(b);
  found=0;
  best=999999;
#ifdef PUSH_LINES
  for( i=0; i<PUSH_LINES; i++ )
  {
    dx=x-push_bx[i];
    dy=y-push_by[i];
    if( dx>=-240 && dx<=240 && dy>=-240 && dy<=240 )
    {
      d=dx*dx+dy*dy;
      if( v==102 && d<=5625 && d<best )
      {
        ex=x-push_ex[i];
        ey=y-push_ey[i];
        if( ex<-100 || ex>100 || ey<-100 || ey>100 || ex*ex+ey*ey>d )
        {
          best=d;
          found=i+1;
        }
      }
      if( v==104 )
      {
        vx=push_ex[i]-push_bx[i];
        vy=push_ey[i]-push_by[i];
        s=1;
        while( vx>256 || vx<-256 || vy>256 || vy<-256 )
        {
          vx=vx/2;
          vy=vy/2;
          s=s*2;
        }
        l=vx*vx+vy*vy;
        t=dx*vx+dy*vy;
        if( l>0 && s<=2 && t>=0 && t<=l*s )
          if( l*s*s<=230400 )
          {
            ex=dx-vx*t/l;
            ey=dy-vy*t/l;
            d=ex*ex+ey*ey;
            if( d<=8100 && d<best )
            {
              best=d;
              found=i+1;
            }
          }
      }
    }
  }
#endif
  return found;
}
`;
const pushGlobals = ["push_bx", "push_by", "push_ex", "push_ey"];
result = analyze(captureLine, { name: "CaptureLine.lgc", workspaceVariables: pushGlobals });
assert.deepStrictEqual(result.diagnostics.filter(item => item.code === "lgc.unknownVariable"), [],
	"CaptureLine locals including l*s*s and referenced push arrays must resolve");
const captureSemanticVariables = createAnalysisVariableMap(result.parsed.variables, captureLine.length);
const multiplicationOffset = captureLine.indexOf("l*s*s");
const multiplicationIndex = result.parsed.tokens.findIndex(token => token.value === "l" && token.start >= multiplicationOffset);
assert(multiplicationIndex >= 0, "the l*s*s expression must be tokenized");
const multiplicationTokens = result.parsed.tokens.slice(multiplicationIndex, multiplicationIndex + 5);
assert.deepStrictEqual(multiplicationTokens.map(token => token.value), ["l", "*", "s", "*", "s"]);
assert.strictEqual(resolveVariable(captureSemanticVariables, "l", multiplicationTokens[0].start)?.type, "int",
	"the local l must resolve inside the chained-multiplication expression");
assert.strictEqual(expressionType(multiplicationTokens, captureSemanticVariables, result.functions, result.constants,
	multiplicationTokens[0].start), "int", "l*s*s must infer as an integer expression");

async function verifyWorkspaceGlobalIndex() {
	const libraryText = "int ai_trains_type[128];\nint library_counter;\n";
	const uri = { toString: () => "file:///mock/maps/script/ai_functions.lgc" };
	const openDocument = { uri, getText: () => libraryText };
	const indexVscode = {
		workspace: {
			textDocuments: [openDocument],
			getConfiguration() { return { get(_key, fallback) { return fallback; } }; },
			async findFiles() { return [uri]; },
			asRelativePath() { return "maps/script/ai_functions.lgc"; }
		}
	};
	const index = new WorkspaceIndex(indexVscode, functionCatalog, constantCatalog,
		(text, sourceUri, getRelativePath) => parseSyntax(text, sourceUri, getRelativePath));
	await index.refresh();
	assert(index.workspaceVariableEntries.has("ai_trains_type"),
		"WorkspaceIndex must retain file-scope global arrays from included library sources");
	assert.strictEqual(index.workspaceVariableEntries.get("ai_trains_type")[0].source, "maps/script/ai_functions.lgc");
	assert(!index.workspaceVariableEntries.get("ai_trains_type")[0].declaration.isLocal,
		"only root-scope declarations may enter the workspace global index");
	index.dispose();
}

verifyWorkspaceGlobalIndex().then(() => {
	console.log("LGC header source visibility, global variables, define syntax/highlighting and inline function regressions passed.");
}).catch(error => {
	console.error(error);
	process.exitCode = 1;
});
