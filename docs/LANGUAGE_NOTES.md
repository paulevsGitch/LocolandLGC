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
