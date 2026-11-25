# Changelog

## 0.1.6 - Semantic analysis improvements and file-scope hotfix

- Diagnose repeated type names in comma-separated declarations (`int a, int b;`).
- Resolve functions using exact, case-sensitive names and report unknown or unavailable functions.
- Require user functions to be declared before use; earlier prototypes and preceding `#include` directives are considered.
- Diagnose unsupported/unknown variable types such as `bool`.
- Diagnose unresolved variable/value identifiers, including identifiers passed as function arguments.
- Make assignment and argument type mismatches hard errors.
- Diagnose string/integer addition and recommend explicit conversion with `itoa(value)`.
- Add independent settings for the new checks and document the conservative type-resolution rules.
- Preserve unknown API return types when the source does not support a reliable inference.
- Parse file-scope variables even when `#define` directives appear immediately before declarations.
- Resolve standard functions by matching `data/functions.json` `source` metadata to the transitive include closure rooted at `header.lgc`; no name-specific exceptions or numeric-ID shortcuts are used.
- Index file-scope variables from workspace scripts with source-aware visibility, including global arrays from standard header libraries.
- Add `#define` syntax diagnostics and bold blue constant highlighting for standard constants and workspace defines.
- Replace map fixtures with short inline regression snippets and add the optional `l01`–`l20` game-folder integration test.
- Fix game integration tests to build an independent compilation context per level, sharing only standard-header sources and scripts from that level.
- Rebuild the standard function catalogue from `export.lgc` plus all functions defined in the transitive `header.lgc` include tree (452 entries, including `Win()` and macro aliases such as `GetVid()` / `SetVid()` from `obsolete.lgc`).
- Expand the constant catalogue to 666 entries by merging the 471 records from `constants.json` with missing object-like `#define`s in standard header sources.
- Publish English function and constant references in `docs/FUNCTIONS.md` and `docs/CONSTANTS.md`.
- Render known catalogue constants and workspace `#define` names bold blue (`#569CD6`) across all open `.lgc` files.

## 0.1.5

- Added diagnostics for unsupported `int` declarations in `for` initializers and likely missing statement semicolons; preprocessor directives and backslash-continued directives are excluded from the semicolon check.
- Added an icon.

## 0.1.4
- Expanded `docs/LANGUAGE_NOTES.md` with primitive type rules, expression inference, numeric `int`/`char` compatibility, scoped declarations, return-type inference and compile-time initializer behavior.
- Added JSDoc type contracts and module/API documentation across the parser, analyser, semantic models, providers, refactoring, workspace index, formatter and extension lifecycle.
- Added `.editorconfig` to preserve the repository's tab-based JavaScript and JSON style.
- Added workspace-wide declaration indexing so duplicate function names across separate scripts are diagnosed.
- Integrated compile-time initializer diagnostics into the modular analyzer, including reason text and a safe Quick Fix for simple local declarations.
- Added scope-aware variable rename through the VS Code Rename Provider, F2 and the editor context-menu command.
- Added function-name collision diagnostics for engine API functions, bundled helper functions, duplicate definitions and unsupported overloads.
- Preserved guarded `#ifndef FunctionName` fallback implementations and valid external engine declarations.
- Added syntax checks for all source modules to the npm check/test workflow.

## 0.1.3

- Diagnose variable initializers that are not compile-time constant expressions; include the reason and a suggested runtime-assignment rewrite.
- Add a Quick Fix that splits safe, simple local initializers into a declaration and a runtime assignment.
- Accept literal and recursively resolved `#define` initializers, constant array initializers and unresolved uppercase build-time defines.
- Diagnose user-defined functions that collide with engine API names, duplicate definitions, overload attempts or same-name declarations in other indexed workspace scripts.
- Recognize `#ifndef FunctionName` fallback declarations to avoid reporting guarded event-hook defaults as duplicate functions.
- Add scope-aware variable rename support through F2 and the editor context menu; rename edits follow the selected variable binding and preserve nested-block shadowing.
- Add configuration switches for constant-initializer and function-name collision diagnostics, plus regression tests for diagnostics, quick fixes, guarded functions and scope-safe rename.

## 0.1.2

- Add an LGC document formatter and the `LGC: Format Document` command.
- Add settings for indentation style/size, brace placement, parenthesis and bracket padding, operator/comma/ternary spacing, blank lines, `switch` labels, empty blocks and final newlines.
- Follow VS Code editor indentation settings by default and support format-on-save through `editor.formatOnSave`.
- Preserve lexical token order, string/character literals, comments and preprocessor directives while formatting.
- Add formatter regression tests, including idempotency and source-token preservation checks.

## 0.1.1

- Fixed type resolution for variables with the same name in different functions and nested blocks.
- Added lexical-scope-aware variable lookup and function-parameter typing.
- Improved declaration parsing for comma-separated variables, arrays, and storage qualifiers.
- Added conservative return-type inference for script functions with consistent, explicitly typed return expressions.
- Type checks now validate known function-call return types when used as arguments or assignment values.
- Added regression coverage for shadowing, function parameters, character values, inferred returns and cross-scope name reuse.

## 0.1.0

- Initial language support for `.lgc` files.
- Added TextMate syntax highlighting, snippets, completions, hover documentation, signature help and workspace navigation.
- Added static diagnostics for delimiters, known function arity and conservative type mismatches.
- Bundled an API and helper catalogue derived from the supplied Locoland scripts.


### Global-variable and lexical declaration hotfix

- Added verified game globals from `header.lgc` and the selected `trainstactdeclares.lgc` declarations to `data/global-variables.json`.
- Included `header.lgc` itself in the always-available source set so indexed header declarations are visible even when referenced through the header file.
- Merged standard globals into semantic analysis for unknown-variable checks, array indexing, and expression type inference.
- Updated variable parsing to finish each declaration statement before scanning subsequent expression tokens.
- Added the `CaptureLine` chained-multiplication regression (`l*s*s`) and assertions for all requested standard globals.


### Global variable catalogue and engine-name reservation hotfix

- Extracted all 200 file-scope variables declared by the 28 standard `header.lgc` sources from the supplied game-script archive and added their types, array flags, source files and English descriptions to `data/global-variables.json`.
- Retained the seven explicitly shared train declarations from `trainstactdeclares.lgc`; the file is not globally included wholesale.
- Expanded `docs/GLOBAL_VARIABLES.md` to document all 207 unique global variables, including `player_x` and `player_y` from `reinforcement.lgc`.
- Reserved bundled function catalogue names in function-map merging even when optional `source` metadata is missing; only a declaration located in the matching real `maps/script` file may enrich its catalogue entry.
- Added regression tests for `player_x`/`player_y`, all synthetic globals, and engine API name reservation with source-less array and Map catalogues.
