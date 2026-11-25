# LGC language notes

These notes summarize language behavior observed in the supplied script set. They are working assumptions for editor tooling, not a formal compiler specification.

## Syntax observed

- C-like function bodies with braces and optional explicit `int`, `string`, `char` or `void` return declarations.
- Many legacy functions omit the return type entirely.
- Variable declarations use `int` and `string`; arrays use square brackets and brace initializers.
- Function parameters may have default values, such as `int dir=0`.
- `static` local variables are used for persistent per-function state.
- Preprocessor directives include `#include`, `#define`, `#ifndef`, `#ifdef`, `#else`, `#endif` and related conditional directives.
- Both `//` and `/* ... */` comments occur.
- Integer literals include decimal and hexadecimal forms.
- Strings are concatenated with `+` in the supplied scripts.

## Engine handles and values

Most engine-facing object references are represented as integers. Functions such as `CreateSprite`, `FirstUnit`, `GetSprite` and `FindNearestSprite` return integer handles; zero is commonly used as the no-object/end-of-iteration sentinel.

Coordinates, directions, IDs, action codes and many flags are also integer values. The same integer representation is used for values with very different semantic meanings; this extension therefore reports type mismatches only for declared `int` and `string` parameters, not for semantic subtypes such as a unit handle versus a coordinate.

## Function declarations and inferred return types

The supplied `export.lgc` uses declarations of the form:

```c
extern CreateSprite(int nvid, int x, int y, int z, int dir=0, int parent=0) 65;
```

The numeric suffix is an engine function identifier, not a return type. The return type is not written in this declaration format. The extension records a return type only when the name, accompanying comments or call sites give reasonable evidence. Otherwise it uses `unknown` and skips return-value checks.

Most script-defined helper functions also omit an explicit return type. Workspace functions still participate in completion, hover, signature help, definition navigation and argument-count checking.

## Iteration patterns

LGC does not support declaring an `int` variable in a `for` initializer. The form `for (int unit = ...; ...)` is treated by the compiler as an assignment to a constant and causes an error. Declare the iterator before the loop, then use the existing variable in the initializer:

```c
int unit;
for (unit = FirstUnit(U_UNIT); unit; unit = NextUnit())
{
    // Process the current unit.
}

int train;
for (train = FirstTrain(army); train; train = NextTrain())
{
    // Process the current train.
}
```

The iteration state is maintained by the engine, so nested calls using the same iterator family may affect the active iteration.

## Statement terminators

Completed variable declarations, assignments, function calls, `return` statements and other simple statements end with a semicolon (`;`). For example:

```c
int counter = 0;

UpdateCounter()
{
    counter = counter + 1;
    Action(counter);
    return counter;
}
```

A semicolon is not required after a function or control-flow block's closing brace, a function/control-flow header, a `case`/`default` label or a preprocessor directive. The analyzer ignores preprocessor directives and their backslash continuations. It also skips blank/comment-only lines, multiline expressions and control-flow/function headers. This is a heuristic statement-boundary check rather than a complete grammar; project-specific syntax may require disabling `lgc.analysis.checkSemicolons`.

## Actions and train commands

`Action(unit, action, var1, var2, var3)` performs an action immediately. `AddCommand(unit, action, var1, var2, var3)` appends an action to a command queue. The meaning of the optional payload values depends on the `ACT_*` code. For example, movement actions use coordinate values, while text actions use a pointer-like value.

Train orders commonly combine `ACT_TRAIN_BEHAVE`, `ACT_MOVE`, and the train-specific helpers such as `PatrolEngine()`.

## Known uncertainty

The supplied scripts show several legacy aliases and macros, including lowercase action names and `GetVid`/`SetVid` aliases. Some game-specific expressions rely on pointer conventions such as `&text`; these are not modeled as ordinary C pointers. The checker treats such expressions as unknown rather than claiming they are valid or invalid C pointer operations.

## Type analysis behavior

- Variables declared at file scope are visible to functions in that file after their declaration. Function parameters are visible throughout the function body.
- Local declarations are associated with their enclosing brace scope. An inner declaration shadows an outer declaration only inside the inner block; leaving the block restores the outer binding. Same-named locals in different functions are independent.
- The analyzer recognizes comma-separated declarations, primitive arrays, `static`/`extern` declarations and the observed primitive types `int`, `string` and `char`. Pointer and reference declarations remain `unknown`.
- Character literals have type `char`; integer literals have type `int`; string literals have type `string`. Numeric `int`/`char` conversions are treated as compatible, following C-like integer promotion behavior.
- For script functions without an explicit return type, the analyzer infers a return type only when every observed `return` expression resolves to the same known primitive type. Mixed or unresolved return expressions remain `unknown`.
- Array indexing preserves the primitive element type. Pointer operations and more complex engine-specific expressions remain `unknown`.


## Declarations and identifier resolution (0.1.6)

- A comma-separated declaration has one leading type: `int a, b;`. Repeating the type (`int a, int b;`) is invalid and is reported at the repeated type token.
- Supported primitive variable types are `int`, `string` and `char`. Unknown type spellings such as `bool` are reported rather than silently treated as variable names.
- Identifiers used in value positions must resolve to a visible variable/parameter or known constant/macro. Unknown function arguments are reported at the identifier token.
- Function identifiers are case-sensitive. `Sin` and `sin` are different names.
- Standard functions are resolved from the `source` field in `data/functions.json`. A function is globally available when its source file belongs to the transitive include closure rooted at the standard `header.lgc` (27 source files in the supplied archive). This rule applies uniformly to all functions from those sources, including function-like macros such as `GETSPRITE_ARMY`; it does not depend on a function name or numeric ID.
- User functions from other sources must be declared before the call in the same file, or supplied by a preceding `#include`. A later definition does not satisfy an earlier call; a prototype before the call does.
- File-scope variables declared in the current file or in an indexed source included by `header.lgc` / a preceding `#include` are visible to the checker. Workspace indexing retains their source path so unrelated `.lgc` files do not leak global names into the current script.
- LGC does not implicitly convert an integer to a string for concatenation. Convert integers explicitly with `itoa(value)`, for example `"Score: " + itoa(score)`.
- The bundled function catalogue validates each function's return type, parameter names/types, signature and English hover description. A helper return type remains `unknown` unless it can be established from the source declaration or consistent return expressions. Constant types are inferred from literal replacement values; compound macros remain `unknown` when their type cannot be established safely.

## Static-analysis diagnostics

The 0.1.6 analyser emits hard errors for unknown variable types, unresolved value identifiers, unknown/unavailable functions, calls before declarations, repeated type names, assignment/argument type mismatches and mixed string/integer addition. Each check can be disabled independently through `lgc.analysis.*` settings. Return types that cannot be inferred from engine declarations or script return expressions remain `unknown`; this is intentional and avoids inventing a type.


## File-scope declarations and standard-header functions (0.1.6 hotfix)

- File-scope variables are declarations even when preprocessor directives occur immediately before them. Root-scope declarations such as `int music_turn = -1;` and `int start_time, resource_pile;` are retained in the symbol table.
- Standard functions are identified only by their `source` field in `data/functions.json` and the transitive source list in `data/always-available-sources.json`. Functions from every source in that header tree are visible in every script. Function names and numeric legacy IDs are not used as exceptions.
- Workspace indexing retains global variables with their source path. Those variables are visible when the source is loaded by `header.lgc` or a preceding `#include`; unrelated files in the workspace do not automatically export their globals.
- The analyser's regression snippets are embedded in test source. User-provided level scripts and exports are not copied into the repository's test fixtures. Each level gets its own symbol/function index; the 27 standard-header sources are shared, but unrelated levels and custom scenario folders do not participate in collision checks.

## Preprocessor defines and standard-header source visibility

Use the LGC preprocessor replacement syntax `#define NAME value`:

```c
#define MAX_ARRIVALS 32
#define MUSIC_NAME "mission_theme"
```

Do not write `#define MAX_ARRIVALS = 32;`; `=` and `;` inside the directive are reported as errors. Semicolons or equals signs inside a quoted string value are not treated as syntax errors. Backslash-continued directives are checked as one logical directive. This check can be disabled with `lgc.analysis.checkDefineSyntax`.

Names defined by `#define` and constants from the bundled catalogue are rendered in **bold**. The extension applies a bold blue foreground (`#569CD6`) to known constants and `#define` names, including names defined in other indexed workspace files.

The standard-header source list is the transitive include closure rooted at `header.lgc` and stored in `data/always-available-sources.json` (27 sources in the supplied archive). Function visibility is then decided from the catalogue `source` field. Do not add name-specific exceptions for standard functions. Global variables from these source files are indexed alongside the rest of the workspace and become visible to all scripts that load the standard header.

To check the standard game scripts, pass the game installation directory to the additional integration test:

```sh
npm run test:game -- "C:\Games\Locoland"
```

The test scans `.lgc` files beneath folders `l01` through `l20`. Any diagnostic is printed with the relative script path, line number and message. These game files are read from the supplied installation and are not copied into the repository's test fixtures.


## Game-wide global variables

The analyser treats the following game-provided variables as visible in every level script:

- `header.lgc`: `time_game_total`, `nuke_time`, `end`, and `we_are_win`.
- `trainstactdeclares.lgc`: the integer arrays `ai_trains`, `ai_trains_task`, `ai_trains_task2`, `ai_trains_type`, `ai_trains_target`, `temp_array`, and the integer `stgbeh`.

These entries are maintained in `data/global-variables.json` with their primitive type, array flag, source file, and English description. The `trainstactdeclares.lgc` declarations are an explicit game-compatibility set; this does not make every declaration from that file globally visible.

Local variables declared in a function or nested block continue to use lexical scope resolution. A declaration statement is parsed as a single unit, including all comma-separated declarators, before the scanner proceeds to later expressions.
