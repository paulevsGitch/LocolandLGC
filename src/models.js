"use strict";

const { Lazy } = require("./lazy");

/**
 * Primitive value types understood by the conservative LGC analyser.
 * @typedef {"int" | "string" | "char" | "void" | "unknown"} LgcType
 */
const LGC_TYPES = Object.freeze({
	INT: "int",
	STRING: "string",
	CHAR: "char",
	VOID: "void",
	UNKNOWN: "unknown"
});

/**
 * A token produced by the semantic lexer.
 * @property {"identifier"|"number"|"string"|"char"|"operator"|"punctuation"} type Token category.
 * @property {string} value Exact source text.
 * @property {number} start Inclusive UTF-16 source offset.
 * @property {number} end Exclusive UTF-16 source offset.
 * @property {number} line Zero-based source line.
 */
class Token {
	/**
	 * @param {"identifier"|"number"|"string"|"char"|"operator"|"punctuation"} type Token category.
	 * @param {string} value Exact source text.
	 * @param {number} start Inclusive UTF-16 source offset.
	 * @param {number} end Exclusive UTF-16 source offset.
	 * @param {number} line Zero-based source line.
	 */
	constructor(type, value, start, end, line) {
		this.type = type;
		this.value = value;
		this.start = start;
		this.end = end;
		this.line = line;
	}
}

/**
 * A zero-based line and character position.
 * @property {number} line Zero-based line number.
 * @property {number} character Zero-based UTF-16 character within the line.
 */
class SourcePosition {
	constructor(line, character) {
		this.line = line;
		this.character = character;
	}
}

/**
 * A parameter in an LGC function signature.
 * @property {string} name Parameter identifier.
 * @property {LgcType} type Declared or inferred primitive type.
 * @property {boolean} optional Whether the declaration has a default value.
 * @property {string|null} default Default source text, or `null` when required.
 */
class LgcParameter {
	constructor({ name, type = "unknown", optional = false, default: defaultValue = null } = {}) {
		this.name = name;
		this.type = type;
		this.optional = optional;
		this.default = defaultValue;
	}
}

/**
 * A function signature from the engine catalogue or workspace.
 * @property {string} name Function identifier.
 * @property {LgcParameter[]} params Ordered function parameters.
 * @property {string} [signature] Display-ready signature.
 * @property {LgcType} [returnType] Declared or inferred return type.
 * @property {string} [description] Human-readable documentation.
 * @property {string} [category] Completion category.
 * @property {string} [source] Catalogue or workspace source label.
 * @property {*} [uri] Source-file URI for workspace declarations.
 * @property {SourcePosition} [position] Function-name position.
 * @property {number} [offset] Function-name source offset.
 * @property {number|null} [bodyOpenOffset] Function body opening-brace offset.
 * @property {number|null} [bodyCloseOffset] Exclusive end of the function body.
 */
class LgcFunction {
	constructor(data = {}) {
		Object.assign(this, data);
		this.params = Array.isArray(data.params)
			? data.params.map(param => param instanceof LgcParameter ? param : new LgcParameter(param))
			: [];
	}
}

/**
 * A lexical block scope delimited by braces.
 * @property {number} id Stable index within one parsed document.
 * @property {Scope|null} parent Parent scope, or `null` for the root.
 * @property {number} start Inclusive opening offset.
 * @property {number} end Closing offset or document length.
 * @property {number} depth Nesting depth.
 */
class Scope {
	constructor({ id, parent = null, start, end, depth }) {
		this.id = id;
		this.parent = parent;
		this.start = start;
		this.end = end;
		this.depth = depth;
	}
}

/**
 * A variable declaration and the source region in which it is visible.
 * @property {string} name Variable identifier.
 * @property {LgcType} type Declared primitive type.
 * @property {Token} token Name token.
 * @property {Scope} scope Lexical scope containing the declaration.
 * @property {number} visibleFrom First visible source offset.
 * @property {number} declarationOffset Source offset of the declaration type.
 */
class VariableDeclaration {
	constructor({ name, type = "unknown", token, scope, visibleFrom, declarationOffset }) {
		this.name = name;
		this.type = type;
		this.token = token;
		this.scope = scope;
		this.visibleFrom = visibleFrom;
		this.declarationOffset = declarationOffset;
	}
}

/**
 * An engine constant or a workspace preprocessor definition.
 * @property {string} name Constant or macro identifier.
 * @property {string} [value] Replacement value when available.
 * @property {string} [params] Macro parameter list for function-like macros.
 * @property {string} [description] Human-readable completion/hover text.
 * @property {string} [source] Catalogue or workspace source label.
 */
class LgcConstant {
	constructor(data = {}) {
		Object.assign(this, data);
	}
}

/**
 * A complete parse and semantic snapshot for one document.
 * @property {Token[]} tokens Lexical token stream.
 * @property {LgcFunction[]} functions Function prototypes and definitions.
 * @property {Set<number>} declarationPositions Function-name offsets.
 * @property {Map<string, VariableDeclaration[]>} variables Variable declarations by name.
 * @property {Map<string, LgcConstant>} constants Preprocessor definitions by name.
 */
class ParsedSource {
	constructor({
		tokens = [],
		functions = [],
		declarationPositions = new Set(),
		variables = new Map(),
		constants = new Map()
	} = {}) {
		this.tokens = tokens;
		this.functions = functions;
		this.declarationPositions = declarationPositions;
		this.variables = variables;
		this.constants = constants;
	}
}

/**
 * Result of parsing function declarations and prototypes.
 * @property {LgcFunction[]} functions Parsed functions.
 * @property {Set<number>} declarationPositions Offsets of function-name tokens.
 */
class FunctionDeclarationResult {
	constructor(functions = [], declarationPositions = new Set()) {
		this.functions = functions;
		this.declarationPositions = declarationPositions;
	}
}

/**
 * Half-open source range occupied by a function parameter list.
 * @property {number} start Inclusive start offset.
 * @property {number} end Exclusive end offset.
 */
class ParameterRange {
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}
}

/**
 * Function call context at a cursor position.
 * @property {LgcFunction} fn Resolved function signature.
 * @property {number} activeParameter Zero-based active parameter index.
 */
class ActiveFunctionCall {
	constructor(fn, activeParameter) {
		this.fn = fn;
		this.activeParameter = activeParameter;
	}
}

/**
 * Versioned document cache entry with lazily-created symbol maps.
 * @property {number} version VS Code document version.
 * @property {number} workspaceVersion Workspace-index generation used by the symbol maps.
 * @property {ParsedSource} parsedSource Parsed syntax and semantic snapshot.
 * @property {Lazy<Map<string,LgcFunction>>} functionsMap Lazy merged function map.
 * @property {Lazy<Map<string,LgcConstant>>} constantsMap Lazy merged constant map.
 */
class DocumentCache {
	/**
	 * @param {number} version Document version.
	 * @param {number} workspaceVersion Workspace-index generation used to build its symbol maps.
	 * @param {ParsedSource} parsedSource Parsed snapshot for this version.
	 * @param {() => Map<string, LgcFunction>} makeFunctions Factory for the document function map.
	 * @param {() => Map<string, LgcConstant>} makeConstants Factory for the document constant map.
	 */
	constructor(version, workspaceVersion, parsedSource, makeFunctions, makeConstants) {
		this.version = version;
		this.workspaceVersion = workspaceVersion;
		this.parsedSource = parsedSource;
		this.functionsMap = new Lazy(makeFunctions);
		this.constantsMap = new Lazy(makeConstants);
	}
}

module.exports = {
	LGC_TYPES,
	Token,
	SourcePosition,
	LgcParameter,
	LgcFunction,
	Scope,
	VariableDeclaration,
	LgcConstant,
	ParsedSource,
	FunctionDeclarationResult,
	ParameterRange,
	ActiveFunctionCall,
	DocumentCache
};
