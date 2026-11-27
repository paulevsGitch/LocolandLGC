"use strict";

/** @type {typeof import("./lazy.js")} */
const { Lazy } = require("./lazy");

/**
 * Primitive value types understood by the conservative LGC analyser.
 *
 * `unknown` is an analysis sentinel, not a keyword or value type in source code.
 * Engine handles, coordinates, IDs, flags and action codes are represented by
 * `int`; the analyser does not invent semantic subtypes for those integer values.
 *
 * @typedef {"int" | "string" | "char" | "void" | "unknown"} LgcType
 */

/** Primitive type labels accepted by the bundled constant catalogue. @typedef {"int" | "string" | "char" | "function" | "unknown"} CatalogueConstantType */
/**
 * A documented engine or standard-header function record bundled with the extension.
 * @typedef {object} FunctionCatalogueEntry
 * @property {string} name Case-sensitive function identifier.
 * @property {LgcType} returnType Explicit or evidence-backed return type.
 * @property {LgcParameter[]} params Ordered parameters with explicit types and optionality.
 * @property {string} signature Human-readable signature shown by completion and hover.
 * @property {string} description English API documentation.
 * @property {string} category Completion category.
 * @property {string} source Declaration source file.
 * @property {number|null} [id] Legacy engine function identifier, when one exists.
 * @property {boolean} [external] Whether the record is an engine-provided external declaration.
 */
/**
 * A typed preprocessor constant or compatibility alias from the bundled catalogue.
 * @typedef {object} ConstantCatalogueEntry
 * @property {string} name Case-sensitive constant or macro identifier.
 * @property {string} value Original replacement text.
 * @property {CatalogueConstantType} type Explicit replacement-value type.
 * @property {string} description English description derived from source comments and use sites.
 * @property {string} source Original declaration source file.
 */
/**
 * A file-scope variable provided by the standard game script library.
 * @typedef {object} GlobalVariableCatalogueEntry
 * @property {string} name Case-sensitive variable identifier.
 * @property {"int"|"string"|"char"} type Declared primitive element type.
 * @property {boolean} isArray Whether the declaration is an array.
 * @property {string} source File containing the declaration.
 * @property {string} description English description based on comments and script usage.
 */
/**
 * @type {Readonly<{INT:"int", STRING:"string", CHAR:"char", VOID:"void", UNKNOWN:"unknown"}>}
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
 * Whitespace and comments are omitted; exact source offsets are retained for
 * diagnostics, navigation, refactoring and lexical-scope resolution.
 *
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

/** A zero-based line and character position in an LGC source document. */
class SourcePosition {
	/**
	 * @param {number} line Zero-based line number.
	 * @param {number} character Zero-based UTF-16 character within the line.
	 */
	constructor(line, character) {
		this.line = line;
		this.character = character;
	}
}

/**
 * A parameter in an LGC function signature.
 *
 * @property {string} name Parameter identifier.
 * @property {LgcType} type Declared primitive type, or `unknown` when it cannot be established.
 * @property {boolean} optional Whether the declaration has a default value.
 * @property {string|null} default Default-value source text, or `null` when required.
 */
class LgcParameter {
	/**
	 * @param {object} [data={}] Parameter metadata.
	 * @param {string} data.name Parameter identifier.
	 * @param {LgcType} [data.type="unknown"] Declared or inferred primitive type.
	 * @param {boolean} [data.optional=false] Whether a default value is present.
	 * @param {string|null} [data.default=null] Original default-value expression.
	 */
	constructor({ name, type = "unknown", optional = false, default: defaultValue = null } = {}) {
		this.name = name;
		this.type = type;
		this.optional = optional;
		this.default = defaultValue;
	}
}

/**
 * A function signature from the engine catalogue or an LGC workspace.
 * The original engine prototype format does not consistently declare return
 * types, so `returnType` may intentionally remain `unknown`.
 *
 * @property {string} name Function identifier.
 * @property {LgcParameter[]} params Ordered function parameters.
 * @property {string} [signature] Display-ready signature.
 * @property {LgcType} [returnType] Declared or safely inferred return type.
 * @property {string} [returnTypeSource] Explanation of an inferred return type.
 * @property {string} [description] Human-readable English documentation.
 * @property {string} [category] Completion category.
 * @property {string} [source] Catalogue or workspace source label.
 * @property {*} [uri] Source-file URI for workspace declarations.
 * @property {SourcePosition} [position] Function-name position.
 * @property {number} [offset] Function-name source offset.
 * @property {number|null} [bodyOpenOffset] Function body opening-brace offset.
 * @property {number|null} [bodyCloseOffset] Exclusive end of the function body.
 * @property {boolean} [external] Whether this is an external engine prototype.
 * @property {string[]} [preprocessorGuards] Conditional fallback guards surrounding the declaration.
 */
class LgcFunction {
	/** @param {object} [data={}] Function metadata. */
	constructor(data = {}) {
		Object.assign(this, data);
		this.params = Array.isArray(data.params)
			? data.params.map(param => param instanceof LgcParameter ? param : new LgcParameter(param))
			: [];
	}
}

/**
 * A lexical block scope delimited by braces.
 * A declaration is visible only from its declaration point to the end of its
 * scope. Resolution walks to the deepest visible scope, implementing shadowing.
 *
 * @property {number} id Stable index within one parsed document.
 * @property {Scope|null} parent Parent scope, or `null` for the root.
 * @property {number} start Inclusive opening offset (zero for the root scope).
 * @property {number} end Closing offset or document length.
 * @property {number} depth Nesting depth; the root has depth zero.
 */
class Scope {
	/** @param {object} data Scope boundaries and parent information. */
	constructor({ id, parent = null, start, end, depth }) {
		this.id = id;
		this.parent = parent;
		this.start = start;
		this.end = end;
		this.depth = depth;
	}
}

/**
 * A variable declaration and its source visibility metadata.
 *
 * `type` is one of the primitive types observed in LGC (`int`, `string`,
 * `char`) or `unknown` for pointer/reference-like declarations. Arrays retain
 * their element's primitive type. Initializer metadata is kept as tokens and
 * offsets so the analyser can check compile-time constant rules and the Quick
 * Fix can split a safe local declaration from its runtime assignment.
 *
 * @property {string} name Variable identifier.
 * @property {LgcType} type Declared primitive or conservatively unknown type.
 * @property {Token} token Token identifying the variable name.
 * @property {Scope} scope Lexical scope containing the declaration.
 * @property {number} visibleFrom First source offset at which the name is visible.
 * @property {number} declarationOffset Source offset of the declaration type.
 * @property {Token[]} initializerTokens Tokens after the initializer `=`.
 * @property {Token|null} initializerEqualsToken The initializer assignment token.
 * @property {number|null} initializerStart First initializer token offset.
 * @property {number|null} initializerEnd Exclusive end of the final initializer token.
 * @property {boolean} isArray Whether the declarator declares an array.
 * @property {number} declaratorCount Number of comma-separated declarators in the statement.
 * @property {Token|null} declarationSemicolonToken Statement terminator used by Quick Fix.
 * @property {Token|null} declarationTypeToken Type token used to recover declaration indentation.
 * @property {boolean} isLocal Whether the declaration belongs to a non-root block.
 * @property {boolean} isStatic Whether the declaration has the `static` qualifier.
 */
class VariableDeclaration {
	/**
	 * @param {object} data Variable identity, type, scope and optional initializer metadata.
	 * @param {string} data.name Variable identifier.
	 * @param {LgcType} [data.type="unknown"] Declared primitive type.
	 * @param {Token} [data.token] Name token.
	 * @param {Scope} [data.scope] Enclosing lexical scope.
	 * @param {number} [data.visibleFrom] First visible source offset.
	 * @param {number} [data.declarationOffset] Type-declaration source offset.
	 * @param {Token[]} [data.initializerTokens=[]] Initializer expression tokens.
	 * @param {Token|null} [data.initializerEqualsToken=null] Initializer `=` token.
	 * @param {number|null} [data.initializerStart=null] First initializer token offset.
	 * @param {number|null} [data.initializerEnd=null] Exclusive end of initializer tokens.
	 * @param {boolean} [data.isArray=false] Whether this is an array declaration.
	 * @param {number} [data.declaratorCount=1] Number of declarators in the statement.
	 * @param {Token|null} [data.declarationSemicolonToken=null] Declaration terminator.
	 * @param {Token|null} [data.declarationTypeToken=null] Declared type token.
	 * @param {boolean} [data.isLocal=false] Whether the variable is local to a block.
	 * @param {boolean} [data.isStatic=false] Whether the declaration is static.
	 */
	constructor({
		name, type = "unknown", token, scope, visibleFrom, declarationOffset,
		initializerTokens = [], initializerEqualsToken = null, initializerStart = null, initializerEnd = null,
		isArray = false, declaratorCount = 1, declarationSemicolonToken = null,
		declarationTypeToken = null, isLocal = false, isStatic = false
	} = {}) {
		this.name = name;
		this.type = type;
		this.token = token;
		this.scope = scope;
		this.visibleFrom = visibleFrom;
		this.declarationOffset = declarationOffset;
		this.initializerTokens = initializerTokens;
		this.initializerEqualsToken = initializerEqualsToken;
		this.initializerStart = initializerStart;
		this.initializerEnd = initializerEnd;
		this.isArray = isArray;
		this.declaratorCount = declaratorCount;
		this.declarationSemicolonToken = declarationSemicolonToken;
		this.declarationTypeToken = declarationTypeToken;
		this.isLocal = isLocal;
		this.isStatic = isStatic;
	}
}

/**
 * An engine constant or a workspace preprocessor definition.
 *
 * @property {string} name Constant or macro identifier.
 * @property {string} [value] Replacement text when available.
 * @property {string|null} [params] Parameter list for function-like macros.
 * @property {string} [description] Human-readable completion and hover text.
 * @property {string} [source] Catalogue or workspace source label.
 * @property {CatalogueConstantType} [type] Explicit replacement-value type when loaded from the bundled catalogue.
 */
class LgcConstant {
	/** @param {object} [data={}] Constant metadata. */
	constructor(data = {}) {
		Object.assign(this, data);
	}
}

/**
 * A complete parse and semantic snapshot for one LGC document.
 * Maps are keyed by symbol name; variable-map values are arrays because one
 * spelling can refer to different declarations in disjoint or nested scopes.
 *
 * @property {Token[]} tokens Semantic token stream.
 * @property {LgcFunction[]} functions Function prototypes and definitions.
 * @property {Set<number>} declarationPositions Function-name token offsets.
 * @property {Map<string, VariableDeclaration[]>} variables Variable declarations grouped by name.
 * @property {Map<string, LgcConstant>} constants Preprocessor definitions grouped by name.
 * @property {string} text Original source text.
 */
class ParsedSource {
	/** @param {object} [data={}] Parsed document components. */
	constructor({
		tokens = [],
		functions = [],
		declarationPositions = new Set(),
		variables = new Map(),
		constants = new Map(),
		text = ""
	} = {}) {
		this.tokens = tokens;
		this.functions = functions;
		this.declarationPositions = declarationPositions;
		this.variables = variables;
		this.constants = constants;
		this.text = text;
	}
}

/** Result of parsing function prototypes and definitions. */
class FunctionDeclarationResult {
	/**
	 * @param {LgcFunction[]} [functions=[]] Parsed function entries.
	 * @param {Set<number>} [declarationPositions=new Set()] Offsets of function-name tokens.
	 */
	constructor(functions = [], declarationPositions = new Set()) {
		this.functions = functions;
		this.declarationPositions = declarationPositions;
	}
}

/** Half-open source range occupied by a function parameter list. */
class ParameterRange {
	/** @param {number} start Inclusive start offset. @param {number} end Exclusive end offset. */
	constructor(start, end) {
		this.start = start;
		this.end = end;
	}
}

/** Function-call context at the current cursor position. */
class ActiveFunctionCall {
	/**
	 * @param {LgcFunction} fn Resolved function signature.
	 * @param {number} activeParameter Zero-based index of the active argument.
	 */
	constructor(fn, activeParameter) {
		this.fn = fn;
		this.activeParameter = activeParameter;
	}
}

/**
 * Versioned document cache entry with lazily-created workspace symbol maps.
 *
 * @property {number} version VS Code document version.
 * @property {number} workspaceVersion Workspace-index generation used by the maps.
 * @property {ParsedSource} parsedSource Parsed syntax and semantic snapshot.
 * @property {Lazy<Map<string, LgcFunction>>} functionsMap Lazily merged function map.
 * @property {Lazy<Map<string, LgcConstant>>} constantsMap Lazily merged constant map.
 */
class DocumentCache {
	/**
	 * @param {number} version Document version.
	 * @param {number} workspaceVersion Workspace-index generation used to build symbol maps.
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