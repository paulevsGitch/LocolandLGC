"use strict";

const fs = require("fs");
const path = require("path");
const { parseDocument } = require("../src/document-model");
const { analyzeDocument, parseIncludeDirectives } = require("../src/analyzer");
const { createFunctionMap } = require("../src/workspace-index");
const FUNCTION_CATALOG = require("../data/functions.json");
const CONSTANT_CATALOG = require("../data/constants.json");
const HEADER_SOURCES = require("../data/always-available-sources.json");

const root = process.argv[2] ? path.resolve(process.argv[2]) : "";
if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
	console.error('Usage: npm run test:game -- "<path-to-game-folder>"');
	process.exit(2);
}

const vscode = {
	DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2 },
	Position: class Position { constructor(line, character) { this.line = line; this.character = character; } },
	Range: class Range { constructor(start, end) { this.start = start; this.end = end; } },
	Diagnostic: class Diagnostic { constructor(range, message, severity) { this.range = range; this.message = message; this.severity = severity; } },
	workspace: { getConfiguration() { return { get(_key, fallback) { return fallback; } }; } }
};

const LEVEL_PATTERN = /^l(?:0[1-9]|1[0-9]|20)$/i;

function walk(directory, files = []) {
	let entries;
	try { entries = fs.readdirSync(directory, { withFileTypes: true }); }
	catch (_error) { return files; }
	for (const entry of entries) {
		if (entry.name === ".git" || entry.name === "node_modules") continue;
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) walk(fullPath, files);
		else if (entry.isFile() && entry.name.toLowerCase().endsWith(".lgc")) files.push(fullPath);
	}
	return files;
}

function relativePath(filePath) {
	return path.relative(root, filePath).split(path.sep).join("/");
}

function levelDirectoryFor(filePath) {
	const relative = relativePath(filePath).split("/");
	if (LEVEL_PATTERN.test(path.basename(root))) return root;
	const index = relative.findIndex(part => LEVEL_PATTERN.test(part));
	return index < 0 ? null : path.join(root, ...relative.slice(0, index + 1));
}

function readLgc(filePath) {
	// Preserve the ASCII syntax tokens in legacy Windows-1251 sources.
	return fs.readFileSync(filePath).toString("latin1");
}

function createDocument(filePath, text) {
	const uri = { fsPath: filePath, toString: () => `file://${filePath.replace(/\\/g, "/")}` };
	return {
		uri,
		languageId: "lgc",
		getText: () => text,
		positionAt(offset) {
			const before = text.slice(0, offset);
			const line = before.split(/\r?\n/).length - 1;
			return new vscode.Position(line, offset - Math.max(before.lastIndexOf("\n"), before.lastIndexOf("\r")) - 1);
		}
	};
}

function chooseStandardSources(allFiles) {
	const byName = new Map();
	for (const filePath of allFiles) {
		const name = path.basename(filePath).toLowerCase();
		if (!byName.has(name)) byName.set(name, []);
		byName.get(name).push(filePath);
	}
	const selected = [];
	const missing = [];
	for (const source of HEADER_SOURCES) {
		const candidates = byName.get(String(source).toLowerCase()) || [];
		if (!candidates.length) {
			missing.push(source);
			continue;
		}
		candidates.sort((left, right) => {
			const leftPreferred = /\/maps\/script\//i.test(left.replace(/\\/g, "/")) ? 0 : 1;
			const rightPreferred = /\/maps\/script\//i.test(right.replace(/\\/g, "/")) ? 0 : 1;
			return leftPreferred - rightPreferred || left.localeCompare(right);
		});
		selected.push(candidates[0]);
	}
	return { selected, missing };
}

function addVariableEntries(target, parsed, source) {
	for (const [name, declarations] of parsed.variables) {
		for (const declaration of declarations) {
			if (!declaration.scope || declaration.scope.depth !== 0 || declaration.isLocal) continue;
			if (!target.has(name)) target.set(name, []);
			target.get(name).push({
				name,
				type: declaration.type,
				isArray: declaration.isArray,
				source,
				declaration
			});
		}
	}
}

const allFiles = walk(root);
const targetFiles = allFiles.filter(filePath => levelDirectoryFor(filePath)).sort((a, b) => a.localeCompare(b));
if (!targetFiles.length) {
	console.error(`No .lgc files found in folders l01..l20 below: ${root}`);
	process.exit(2);
}

const { selected: standardFiles, missing: missingStandardSources } = chooseStandardSources(allFiles);
let sourceFailureCount = 0;
for (const source of missingStandardSources) {
	console.error(`header.lgc: missing standard include source '${source}'`);
	sourceFailureCount++;
}

const levelGroups = new Map();
for (const filePath of targetFiles) {
	const levelDirectory = levelDirectoryFor(filePath);
	if (!levelGroups.has(levelDirectory)) levelGroups.set(levelDirectory, []);
	levelGroups.get(levelDirectory).push(filePath);
}

let diagnosticFailureCount = 0;
let parserFailureCount = 0;
let checkedCount = 0;
for (const [levelDirectory, levelFiles] of levelGroups) {
	const contextFiles = [...new Set([...standardFiles, ...levelFiles])];
	const parsedByPath = new Map();
	const workspaceFunctions = new Map();
	const workspaceFunctionEntries = new Map();
	const workspaceConstants = new Map();
	const workspaceVariableEntries = new Map();

	for (const filePath of contextFiles) {
		try {
			const text = readLgc(filePath);
			const relative = relativePath(filePath);
			const uri = { fsPath: filePath, toString: () => `file://${filePath.replace(/\\/g, "/")}` };
			const parsed = parseDocument(text, uri, () => relative, FUNCTION_CATALOG);
			parsedByPath.set(filePath, { text, parsed, relative });

			for (const fn of parsed.functions) {
				if (!workspaceFunctionEntries.has(fn.name)) workspaceFunctionEntries.set(fn.name, []);
				workspaceFunctionEntries.get(fn.name).push(fn);
				if (!workspaceFunctions.has(fn.name)) workspaceFunctions.set(fn.name, fn);
			}
			for (const [name, constant] of parsed.constants) workspaceConstants.set(name, constant);
			addVariableEntries(workspaceVariableEntries, parsed, relative);
		} catch (error) {
			console.error(`${relativePath(filePath)}: parser failed: ${error && error.message ? error.message : error}`);
			parserFailureCount++;
		}
	}

	const functionMap = createFunctionMap({ functions: [] }, FUNCTION_CATALOG, workspaceFunctions);
	const constantMap = new Map(CONSTANT_CATALOG.map(item => [item.name, item]));
	for (const [name, constant] of workspaceConstants) constantMap.set(name, constant);

	// The level is one compilation unit: globals and helper declarations in its sibling
	// scripts are available within this level, but never leak into a different level.
	const visibilityIncludes = contextFiles.map(filePath => ({ path: relativePath(filePath), offset: -1 }));
	for (const filePath of levelFiles) {
		const record = parsedByPath.get(filePath);
		if (!record) continue;
		const document = createDocument(filePath, record.text);
		const actualIncludes = parseIncludeDirectives(record.text);
		const includes = [...actualIncludes, ...visibilityIncludes];
		const diagnostics = analyzeDocument(
			vscode,
			document,
			record.parsed,
			functionMap,
			constantMap,
			workspaceFunctionEntries,
			FUNCTION_CATALOG,
			workspaceVariableEntries,
			includes
		);
		checkedCount++;
		if (diagnostics.length) {
			diagnosticFailureCount++;
			for (const item of diagnostics) {
				const line = item.range && item.range.start ? item.range.start.line + 1 : "?";
				console.error(`${relativePath(filePath)}:${line}: ${item.message}`);
			}
		}
	}
}

if (diagnosticFailureCount || parserFailureCount || sourceFailureCount) {
	console.error(`\nFAILED: ${diagnosticFailureCount} of ${checkedCount} level scripts produced diagnostics; ${parserFailureCount} source files failed to parse; ${sourceFailureCount} standard header source(s) missing.`);
	process.exitCode = 1;
} else {
	console.log(`PASSED: all ${checkedCount} .lgc scripts in ${levelGroups.size} independent level(s) passed analysis.`);
}
