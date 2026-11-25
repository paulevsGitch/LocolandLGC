# Locoland Logic Script for Visual Studio Code

Language support for Locoland `.lgc` scripts.

## Features

- TextMate syntax highlighting for comments, strings, numeric literals, preprocessor directives, keywords, types, functions and engine constants.
- IntelliSense for the engine API extracted from the supplied `export.lgc`, including function signatures, optional parameters and English hover documentation.
- Completion and hover data for commonly used helpers from the supplied script set (`basefunctions.lgc`, `ai_functions.lgc`, capture, environment, weather and reinforcement scripts).
- Workspace indexing of `.lgc` files for user-defined functions and `#define` constants.
- Signature help, navigation to workspace function declarations and workspace symbol search.
- Static diagnostics for unmatched delimiters, undeclared variables and unknown types, case-sensitive function names and declaration order, function arity and argument types, assignments to explicitly typed variables, non-constant variable initializers, unsupported `int` declarations in `for` headers, repeated type names in declarations, mixed string/integer addition and likely missing statement semicolons.
- Function-name collision diagnostics for duplicate definitions, unsupported overloads and user functions that reuse engine API names. The checker recognizes `#ifndef FunctionName` fallback declarations used by the supplied script library.
- Scope-aware variable renaming with **F2** and the editor context menu. Only references bound to the selected declaration are renamed, so same-named variables in nested blocks remain untouched.
- Snippets for functions, control flow, unit iteration, train iteration and common `Action()` patterns.
- Configurable source formatting with indentation, brace placement, operator spacing, parenthesis spacing, comma spacing, blank-line and `switch` label options. Formatting preserves string literals, comments and preprocessor directives.

## Install from source

1. Open this folder in Visual Studio Code.
2. Run `npm install` only if you want to use the standard VS Code extension development workflow. This extension has no runtime npm dependencies.
3. Press `F5` to launch an Extension Development Host.
4. Open a `.lgc` file. The language is registered automatically.

To package it as a VSIX, install `vsce` and run:

```sh
npx @vscode/vsce package --out "./builds"
```

The runtime itself uses only the VS Code API and Node.js built-ins.

## Code formatting

The extension registers an LGC document formatter. Use **LGC: Format Document** from the Command Palette or the standard VS Code **Format Document** command (`Shift+Alt+F` on Windows/Linux, `Shift+Option+F` on macOS). To format every saved `.lgc` file automatically, enable:

```json
{
    "[lgc]": {
        "editor.formatOnSave": true
    }
}
```

The formatter is deliberately lexical rather than a full compiler: it does not rewrite expressions or rename symbols. It preserves string and character literal contents, comments, preprocessor lines and token order. Trailing whitespace is removed as part of formatting. The formatter has been checked against all 35 `.lgc` files in the supplied script archive; formatting preserved the token sequence and was idempotent on that corpus.

Formatting options are available under **Locoland Logic Script**:

| Setting | Default | Purpose |
| --- | --- | --- |
| `lgc.format.indentStyle` | `editor` | Follow the editor indentation settings, or force `spaces` / `tabs`. |
| `lgc.format.indentSize` | `0` | Spaces per level. `0` follows the editor tab size. |
| `lgc.format.braceStyle` | `sameLine` | Opening braces on the declaration/control line (`sameLine`) or the next line (`nextLine`). |
| `lgc.format.spaceBeforeParens` | `control` | `control`, `always` or `never`. |
| `lgc.format.spaceInsideParentheses` | `false` | Add padding inside parentheses. |
| `lgc.format.spaceInsideBrackets` | `false` | Add padding inside array brackets. |
| `lgc.format.spaceAroundOperators` | `true` | Add spaces around binary and assignment operators. |
| `lgc.format.spaceAfterComma` | `true` | Add a space after commas. |
| `lgc.format.spaceBeforeColon` / `spaceAfterColon` | `true` | Control ternary-expression colon spacing. |
| `lgc.format.blankLinesBetweenFunctions` | `1` | Blank lines between top-level braced declarations. |
| `lgc.format.preserveBlankLines` | `true` | Retain blank lines found in the source. |
| `lgc.format.maxBlankLines` | `1` | Maximum number of consecutive blank lines preserved. |
| `lgc.format.indentCaseLabels` | `false` | Indent `case` and `default` labels inside `switch` blocks. |
| `lgc.format.keepEmptyBlocksSingleLine` | `true` | Keep empty blocks as `{}`. |
| `lgc.format.insertFinalNewline` | `true` | Ensure the formatted file ends with a newline. |

Example configuration using Allman braces and tabs:

```json
{
    "[lgc]": {
        "editor.formatOnSave": true,
        "editor.insertSpaces": false,
        "editor.tabSize": 4
    },
    "lgc.format.braceStyle": "nextLine",
    "lgc.format.indentStyle": "editor",
    "lgc.format.spaceAroundOperators": true
}
```

## Static analysis settings

The following settings are available under **Locoland Logic Script**. The test command also runs a catalogue contract audit over every bundled function and constant: it checks names, parameter and return types, values, signatures and non-empty hover descriptions. Constant types are inferred from their literal or macro values; expressions that cannot be safely resolved remain `unknown` rather than being guessed.

| Setting | Default | Purpose |
| --- | --- | --- |
| `lgc.analysis.enabled` | `true` | Enable or disable LGC diagnostics. |
| `lgc.analysis.checkFunctionArity` | `true` | Check calls against known required and optional parameter counts. |
| `lgc.analysis.checkArgumentTypes` | `true` | Check known `int`, `string` and `char` parameter types when the expression type is clear. |
| `lgc.analysis.checkAssignments` | `true` | Check assignments to explicitly typed variables when both sides have known types. |
| `lgc.analysis.checkConstantInitializers` | `true` | Report initializers that depend on runtime variables or function calls. Literal values, known `#define` values and constant array initializers are accepted. Unknown all-uppercase identifiers are treated as possible build-time defines. |
| `lgc.analysis.checkForLoopIntDeclarations` | `true` | Report `for (int i = ...)`; declare `int i;` before the loop and assign `i` in the initializer. |
| `lgc.analysis.checkSemicolons` | `true` | Report statement lines missing a terminating semicolon. Preprocessor directives and their backslash continuations are ignored. |
| `lgc.analysis.checkFunctionDeclarationOrder` | `true` | Require a function to be declared before its call; earlier prototypes and `#include`d scripts count. |
| `lgc.analysis.checkUnknownVariables` | `true` | Report undeclared variables/values, including unknown names in function arguments. |
| `lgc.analysis.checkUnknownTypes` | `true` | Report unsupported variable types such as `bool`. |
| `lgc.analysis.checkRepeatedDeclarationTypes` | `true` | Require `int a, b;` instead of `int a, int b;`. |
| `lgc.analysis.checkStringAdditionTypes` | `true` | Require `itoa(number)` before adding an integer to a string. |
| `lgc.analysis.checkFunctionNameCollisions` | `true` | Report duplicate definitions, overload attempts, collisions with engine API names and same-name declarations in other indexed workspace scripts. |
| `lgc.analysis.strictUnknownFunctions` | `true` | Report calls not found in the engine API, current file or scripts included before the call. Function names are case-sensitive. |
| `lgc.analysis.severity` | `Warning` | Default severity for static-analysis findings. |
| `lgc.analysis.maxWorkspaceFiles` | `500` | Maximum `.lgc` files indexed in a workspace. |

Run **LGC: Analyze Current File** from the Command Palette to refresh diagnostics for the active document.

### Variable initializers

LGC variable initializers must be compile-time constant expressions. For example, this is diagnosed:

```c
int map_state_old = 0;
int map_state = 1;

StateWasChanged() {
    int result = map_state - map_state_old; // Not a compile-time constant.
}
```

Rewrite it as a declaration followed by a runtime assignment:

```c
StateWasChanged() {
    int result;
    result = map_state - map_state_old;
}
```

For a simple, non-static local variable declaration, the diagnostic offers **Split declaration and runtime assignment** as a Quick Fix. The checker also accepts literals, recursively resolvable `#define` values, and arrays whose elements are compile-time constants. Unresolved all-uppercase names are assumed to be conditional build defines (for example, defines supplied by the game build) to avoid false positives; a variable declared in the current file is still treated as a runtime value.

### `for` loop variables

LGC does not support declaring an `int` variable in a `for` initializer. This form is diagnosed:

```c
for (int i = 0; i < count; i++) {
    // ...
}
```

Declare the variable before the loop instead:

```c
int i;
for (i = 0; i < count; i++) {
    // ...
}
```

The diagnostic explains that the declaration is interpreted as an assignment to a constant. This check can be disabled with `lgc.analysis.checkForLoopIntDeclarations`.

### Statement semicolons

Completed declarations, assignments, calls, `return` statements and similar statements must end with `;`. The checker skips preprocessor directives (including `\`-continued directives), blank lines, comments, control-flow/function headers, block braces and lines that appear to continue an expression onto the next line. Since LGC has no formal grammar in the supplied materials, the check is deliberately heuristic; disable it with `lgc.analysis.checkSemicolons` if a project-specific construct is reported incorrectly.

### Rename variables

Place the cursor on a variable name and press **F2**, or choose **LGC: Rename Variable** from the editor context menu. The rename provider follows lexical bindings, including function parameters and nested-block shadowing. It does not rename function names, constants or unrelated variables with the same spelling.

## API data and language assumptions

`data/functions.json` contains 452 functions extracted from the native API and the complete transitive include tree rooted at `header.lgc`. `data/constants.json` contains 666 constants: the 471 original catalogue records plus object-like defines found throughout the standard header sources. The generated English references are available in [docs/FUNCTIONS.md](docs/FUNCTIONS.md) and [docs/CONSTANTS.md](docs/CONSTANTS.md).

File-scope declarations are recognized even when preceded by preprocessor definitions. All functions from source files in the transitive include closure of the standard `header.lgc` are globally visible based on the `source` metadata in `data/functions.json`; no individual names are special-cased. Other script-library helpers still require the corresponding preceding `#include`. The engine declarations in `export.lgc` do not consistently spell out return types. Parameter types are taken from the declarations; script-function return types are inferred only when all observed return expressions have the same known type. Uncertain return types are intentionally marked as `unknown` so the checker does not invent certainty.

LGC resembles a small C-like language, but it is not treated as standard C. The checker is deliberately conservative: it checks only known signatures and expressions with inferable types. In particular, pointer-like expressions, engine-specific values and unresolved expressions are not assigned guessed types. Strict unknown-function checking is enabled by default and can be disabled with `lgc.analysis.strictUnknownFunctions` for projects that rely on custom dynamic includes.

## Data sources

- The API catalogue and constants were extracted from the user-supplied script archive, primarily `export.lgc` and `obsolete.lgc`.
- The standard function catalogue was extracted from all 27 sources in the transitive `header.lgc` include tree, including `menuend.lgc` (which defines `Win()`), AI event handlers and their fallback dependencies. The constants catalogue merges the supplied `constants.json` with object-like defines from those same sources.
- Project context: [Dysprohol/OpenLocoland](https://github.com/Dysprohol/OpenLocoland), particularly its [developer documentation](https://github.com/Dysprohol/OpenLocoland/blob/main/DEVELOPERS.md). The repository describes how OpenLocoland documents and restores the original Locoland engine; it is not presented as an official language specification.

## Limitations

- There is no formal LGC grammar or compiler specification in the supplied materials. Syntax coverage is based on the supplied scripts and engine declarations.
- The static checker is not a game runtime or full compiler. It recognizes common `#ifndef NAME` fallback function guards but does not fully evaluate arbitrary preprocessor branches.
- `Action()` and `AddCommand()` argument semantics depend on the selected `ACT_*` opcode; the checker validates their declared integer parameter types but cannot validate every action-specific payload.
- Functions outside the standard-header source tree remain workspace-specific. Workspace indexing discovers additional declarations from `.lgc` files in the opened project, while source-aware diagnostics prevent unrelated level folders from leaking symbols into each other.

## License

MIT. This extension is an independent fan-made development aid and is not affiliated with Gromada, ESDigital Games or the OpenLocoland project.

## Architecture compatibility

This release follows the modular source layout used by the upstream [LocolandLGC repository](https://github.com/paulevsGitch/LocolandLGC): parsing and document modelling, static analysis, document caching, workspace indexing and language providers remain separate modules. The initializer diagnostics, safe Quick Fix, scope-aware variable rename and function-name collision checks are integrated into those modules rather than relying on the earlier monolithic extension implementation.

Run `npm test` to perform JavaScript syntax checks and the regression smoke suite.


### Names, declarations and expression types (0.1.6)

LGC variable declarations have one type per declaration statement:

```c
int a, b;       // valid
int a, int b;   // error: do not repeat the type after the comma
```

Only `int`, `string` and `char` are supported variable types. A declaration such as `bool enabled;` is diagnosed as an unknown variable type. Pointer-like declarations remain conservatively typed as `unknown` where the language sources do not establish a safe primitive type.

Function names are case-sensitive. The API function is `Sin(time)`, not `sin(time)`. A user function is visible after its declaration in the current file, or after a preceding `#include` that makes its source available. A later definition does not retroactively make an earlier call valid; add a prototype before the call when needed.

Identifiers used as values must resolve to a declared variable, parameter, known constant or `#define`. Unknown names in function arguments are errors. All-uppercase unresolved names remain exempt because game builds may provide conditional macros outside the editor workspace.

LGC does not implicitly convert integers to strings during `+` concatenation. Use `itoa()` explicitly:

```c
string label;
label = "Score: " + itoa(score);
```

The analyser reports mixed string/integer addition even when the destination variable is a string. Assignment and argument type mismatches are errors rather than warnings.


## Standard header, macro styling and game-script validation

Standard engine and library functions are recognised from `data/functions.json` by their `source` metadata. The source list in `data/always-available-sources.json` contains the complete transitive include closure of `header.lgc`; this includes engine exports, legacy API helpers and standard script libraries. Object-like aliases such as `GetVid -> GetVidData`, `SetVid -> SetVidData` and `sprintf -> Printf` are generated from `#define` directives in their declared source file, so they need no analyzer name-specific exception. Functions from other `.lgc` files still require a preceding `#include` or a declaration earlier in the same script.

File-scope variables are indexed across the workspace with their declaring source path. This lets scripts resolve global arrays from standard header libraries without treating unrelated script globals as universally visible. Local variables and parameters continue to use lexical-scope-aware lookup.

`#define` directives must follow `#define NAME value` syntax. The analyser reports `=` and `;` tokens inside directives; quoted string contents are ignored. Known `#define` names and catalogue constants are displayed in bold without overriding their syntax colour.

Run the inline regression suite with `npm test`. To validate every standard level script in a game installation, run:

```sh
npm run test:game -- "C:\Games\Locoland"
```

The integration test scans `.lgc` files below folders `l01`–`l20` and prints the script name, line and diagnostic reason for every failure. It does not add game files or previous user-provided maps to the test fixtures.


### Game-wide global variables

The checker includes a small verified catalogue of game globals in `data/global-variables.json`. This covers variables declared by `header.lgc` (`time_game_total`, `nuke_time`, `end`, `we_are_win`) and the train-tactics globals used by level scripts (`ai_trains`, `ai_trains_task`, `ai_trains_task2`, `ai_trains_type`, `ai_trains_target`, `temp_array`, `stgbeh`). Their type and array metadata are used both for unknown-variable diagnostics and expression type inference.
