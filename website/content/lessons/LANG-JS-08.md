## The idea

Think of variables like labeled boxes in your garage. Scope is which room a box lives in. A `var` box is function-wide. An `if` or a `for` inside that function does not get its own room, so the box leaks out of the block. A `let` or `const` box stays in the braces where you wrote it.

Hoisting means the boxes are set on the shelf before your lines run. A `var` box is already there, empty, so an early read is `undefined`. A `let` or `const` box is on the shelf with the lid taped until its declaration line. Touch it early and you get a ReferenceError. That taped stretch is the temporal dead zone. `const` means you cannot swap the box for a different box. You can still change a property of an object inside it. `k.a = 2` is legal. `k = {}` throws.

A function declaration is the whole instruction sheet, already pinned up, so you can call it before its line. A function expression or an arrow follows the box rules. With `const`, the name sits in the dead zone until the assignment.

A closure is a function that keeps its hand on a box after the outer function has gone home. It keeps the box, the binding, not a photocopy of what was inside. Change the contents later and the function sees the new contents. Two calls to `makeCounter()` get two boxes. They do not share a count.

The famous loop is one shared box. `for (var i = 0; i < 3; i++)` has a single `i`. Every function you store closes over that box, and by the time you call them `i` is `3`, so you get `3, 3, 3`. `for (let j = 0; j < 3; j++)` puts a fresh box in the room each trip, so those functions return `0, 1, 2`. The old repair was an IIFE: a function that runs immediately, takes the current number as a parameter, and closes over that parameter's own box.

## Why it matters

This is the "why did that print that?" pile. A leaked `var` collides with another block. A dead-zone `let` crashes a line that looks like it should see an outer variable of the same name, because the inner box is already shadowing it. The outer box is still there. The inner function is looking at its own box.

Closures are also privacy without a class. The `n` inside `makeCounter` has no door except `inc`, `dec`, and the getter. `once`, `memoize`, currying, partial application, `pipe`, `compose`, debounce, and throttle are all functions holding a private box: a flag, a `Map`, some preset arguments, or a timer. The module pattern is an IIFE that returns only the public methods. The array stays in a box the outside cannot name.

Say lexical scoping, closure captures the binding, IIFE, module pattern, memoization, currying, partial application, and that debounce and throttle are closures over a timer.

## A small example

```javascript
const shared = [];
const fresh = [];

for (var i = 0; i < 3; i++) shared.push(() => i);
for (let j = 0; j < 3; j++) fresh.push(() => j);

const fromVar = shared.map((fn) => fn());
const fromLet = fresh.map((fn) => fn());
```

`fromVar` is `[3, 3, 3]`. Every function is holding the one `i` box, and that box ends at `3`. `fromLet` is `[0, 1, 2]`, because each trip got its own `j` box.

## What the code below is doing

`var` reads as `undefined` before its line. A `let` in the dead zone throws. A `const` object can change a property and cannot be pointed at a new object. Then `var leaks` escapes an `if`, and `let stays` does not.

The classic loop pushes functions and calls them. The `var` batch is `[3, 3, 3]`. The `let` batch is `[0, 1, 2]`. The comment shows the pre-`let` IIFE that captured the current value in a parameter.

`decl()` works before its line because a function declaration is fully hoisted. `expr` is a `const` arrow, so calling it early throws a ReferenceError. After the line it returns `'expression'`.

`makeCounter` closes over `n`. Two counters move independently. `once` runs its function a single time and replays the saved result. `memoize` caches by `JSON.stringify` of the arguments. The slow square computes twice, for `4` and `5`. The memoized fibonacci of `50` is `12586269025`.

Currying waits until it has enough arguments, so `add3(1)(2)(3)` and `add3(1, 2)(3)` both make `6`. `partial(Math.max, 10)(3, 7)` is `10`. Pipe of add-one then double, starting at `3`, is `8`. Compose of those same functions is `7`, because the double runs first.

Debounce and throttle are shown with a fake clock so the file stays synchronous. Three debounce calls clear the previous pending callback, and one fire remains. Throttle calls through when the fake time has moved at least `ms` since `last`.

The IIFE store hides `items`. `add` and `size` work. `Store.items` is `undefined`.

The trap is the captured binding. `read` was created while `shared` was `'a'`. After `shared = 'b'`, `read()` returns `'b'`, not a snapshot of `'a'`.

Inside `shadow`, a new `x` hides the outer `'outer'`. Outside, `x` is still `'outer'`. `globalThis` is the global object.
