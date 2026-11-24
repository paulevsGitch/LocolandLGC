# Changelog

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
