## The idea

Think of a thrown error as a red tag on a part at a workshop bench. You stop the job, and the tag says what broke. `throw new Error(message)` is the ordinary tag. A custom class extends `Error`, so the tag can be a `ValidationError` with a field like `'age'`. Pass `{ cause }` into `super` and the new tag keeps the old one stapled on. Set `this.name`. Skip that and the name stays `'Error'`. `instanceof` still walks the chain, so a `ValidationError` is an `Error`.

`try` is the attempt. `catch` reads the tag. The binding is optional when you do not need the object. `finally` sweeps the bench even after a `return` in `try`. The trap: a `return` inside `finally` wins, and the value you meant to hand back is replaced. You can throw a string. It works, and callers still expect an object with `message` and `stack`. Built-in tags: TypeError, ReferenceError, RangeError, SyntaxError, and AggregateError.

A generator is a parts drawer that hands you one piece when you pull, instead of dumping the drawer. That is lazy evaluation. The iterator protocol is the shape of the pull. `[Symbol.iterator]()` returns `{ next() }`, and `next()` returns `{ value, done }`. Spread, `for...of`, and destructuring pull until `done`. `function*` builds that object. `yield` is one piece. `yield*` lets another drawer finish the pull. After the first pull, `next(arg)` sends a value in.

A symbol is an unmarked bin. `Symbol('id')` is a key `Object.keys` will not list and `JSON.stringify` will drop. Two symbols with the same description are never equal. `Symbol.for('a')` uses a shop-wide registry, so the name returns the same symbol. Well-known symbols are hooks the language already looks for: `Symbol.iterator` for the pull, `Symbol.toPrimitive` for string versus number, `Symbol.toStringTag` for the `[object ...]` label.

## Why it matters

Fail fast means tag the bad part at the door. `parseAge` throws before `'x'` or a negative age becomes a quiet `NaN` later. Rethrow with `cause` when a config load fails, so your message is on the outside and the parse error is still attached. An error boundary is the one place that catches and decides what happens next. A result object, `{ ok, value, error }`, returns the tag instead of throwing. The sheet names that style and does not build it.

An endless drawer is useful because `take` can stop pulling. A date is a count of milliseconds since 1970-01-01 UTC, and `Date.UTC` numbers January as 0. Borrowing a tool from the next bench is CommonJS `require` or ESM `import`. A plain script needs neither.

Say fail fast, error boundary, rethrow with cause, lazy evaluation, iterator protocol, generator yields, and well-known symbols.

## A small example

```javascript
class BadAge extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadAge';
  }
}

function parseAge(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) throw new BadAge('bad age');
  return n;
}

function* range(lo, hi) {
  for (let i = lo; i < hi; i++) yield i;
}

const age = parseAge('12');
const nums = [...range(0, 3)];
```

`age` is `12`. `parseAge('x')` throws a `BadAge`, which is also an `Error`. `nums` is `[0, 1, 2]`.

## What the code below is doing

`ValidationError` takes a field, a message, and options, and passes the options to `super` so `cause` works. It sets `name` and `field`. `NotFoundError` sets `name` and a `status` of 404 with class fields. `parseAge` returns an integer or throws. A catch can match the class, or match `name` and `field`. The value is both a `ValidationError` and an `Error`, with a string `stack`. Bad `JSON.parse` is wrapped as `new Error('config load failed', { cause })`, and the cause is the SyntaxError.

`finally` runs even when `try` returns `'try'`. An optional `catch` returns `'caught'`. In `h`, `try` would return `1` and `finally` returns `2`, so the result is `2`. The built-in throws are `null.x`, a missing function, `new Array(-1)`, and bad JSON. Throwing the string `'string'` is the habit to drop.

`countdown` starts at 3. Spread produces `[3, 2, 1]`. Destructuring takes `[3, 2]`. `Math.max` pulls a fresh cursor and gets `3`, because each call to `Symbol.iterator` starts over.

`idGen` yields forever. `range(0, 10, 3)` is `[0, 3, 6, 9]`. `take(3, idGen(10))` is `[10, 11, 12]`. `flatten` uses `yield*` and turns nested arrays into `[1, 2, 3, 4]`. `twoWay` yields `'first'`, then `next('hello')` comes back as `'got hello'`. An inorder walk yields `[1, 2, 3]`. Generators also have `.return` and `.throw`.

A symbol key stays out of `Object.keys` and `JSON.stringify`, and `o[id]` still reads `1`. Separate `Symbol('a')` values never match. `Symbol.for('a')` does. `Temp` becomes `'21°C'` in a string and `22` in addition. `Symbol.toStringTag` reports `[object Thing]`.

`Date.UTC(2024, 0, 31, 12)` is January, ISO `2024-01-31T12:00:00.000Z`. Months are 0-based. `getTime()` is epoch milliseconds, and the epoch itself is `1970-01-01T00:00:00.000Z`. February 2024 spans 29 days. `getUTCDay()` is 3, Sunday being 0. One UTC day is `86_400_000` ms. `'garbage'` is an Invalid Date. Leave `Date.now()` out of the logic when the inputs are already timestamps.

The module notes are comments: CommonJS has `__dirname`, ESM has `import.meta.url`, and Node picks ESM from `"type": "module"` or a `.mjs` file.

The last block is the separator `1_000_000`, a labeled `continue outer` / `break outer`, and checks that `structuredClone`, `fetch`, and `queueMicrotask` exist. The section title also names logical assignment. The lines that run do not use it.
