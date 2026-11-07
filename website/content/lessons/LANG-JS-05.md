## The idea

Think of every JavaScript number as one measuring tape. There is no second tape for whole numbers and a third for fractions. The tape is an IEEE-754 double, a 64-bit binary stick, and its tick marks are binary fractions. One tenth is a repeating mark on that stick, so `0.1 + 0.2` lands a hair past `0.3`. `===` sees the hair. That miss is floating-point error.

The tape has a reliable stretch for whole numbers and a fuzzy stretch past it. `Number.MAX_SAFE_INTEGER` is 2^53 - 1, about nine quadrillion. Past that safe integer, two different whole numbers can share a tick. `9007199254740992 === 9007199254740993` is true. When the problem says the values reach 10^18, or you are computing a large factorial, switch to `BigInt`. You write it with an `n`: `123n`. BigInt division truncates. `7n / 2n` is `3n`. You add BigInt to BigInt. `1n + 1` throws. Convert on purpose with `BigInt(x)` or `Number(b)`.

Ordinary division is real division. `7 / 2` is `3.5`. You ask for an integer result. `Math.floor` moves toward negative infinity, so the floor of `-3.5` is `-4`. `Math.trunc` chops toward zero. The `%` operator keeps the dividend's sign, so `-7 % 3` is `-1`. A positive modulo is `((a % n) + n) % n`. Dividing by zero reports `Infinity`. `0 / 0` is `NaN`. Overflow climbs to `Infinity` the same way. Nothing is thrown.

## Why it matters

Money, scores, and "is this input a number" all fail on this tape if you treat it like a calculator from school.

Store money as integer cents and divide only when you display. `(10 + 20) / 100` is `0.3` on the nose, because the addition happened on whole ticks. Compare real fractions by distance: `Math.abs(a - b) < Number.EPSILON`. `toFixed(n)` returns a string, and it is a display tool. `(1.005).toFixed(2)` is `'1.00'`, because 1.005 is already stored as a slightly smaller tick. `Math.round` sends halves toward positive infinity. `Math.round(2.5)` is `3`. `Math.round(-2.5)` is `-2`. That is toward `+Infinity`, not "away from zero."

Parsing is three tools. `Number(s)` is strict: `'42abc'` becomes `NaN`, while `''` and `null` become `0`. `parseInt(s, 10)` reads a prefix and stops, so `'42abc'` is `42`. Always pass the radix. `parseFloat` does that for a decimal prefix. A unary `+` is a short `Number`. With `+`, a string partner concatenates: `'3' + 4` is `'34'`. Other operators coerce: `'3' * 4` is `12`.

`Number.isNaN` checks the value as it is. The global `isNaN('x')` converts first and then answers true. `Number.isInteger('5')` is false. `Number.isFinite` rejects `Infinity`. `Math.max()` with no arguments is `-Infinity`, and `Math.min()` with none is `Infinity`, so guard an empty list before you spread it. JSON stores both `Infinity` and `NaN` as `null`.

Bitwise operators use a smaller tape: 32-bit signed integers. `>>` keeps the sign. `>>>` is the unsigned view. `~n` is `-(n + 1)`. A positive power of two satisfies `(n & (n - 1)) === 0`. `n & -n` isolates the lowest set bit. A shift that walks off that 32-bit end wraps.

## A small example

```javascript
const tape = 0.1 + 0.2;
const sameTick = tape === 0.3;
const closeEnough = Math.abs(tape - 0.3) < Number.EPSILON;

function totalDollars(cents) {
  const sum = cents.reduce((total, c) => total + c, 0);
  return sum / 100;
}

const bill = totalDollars([10, 20]);
const rawMod = -7 % 3;
const positiveMod = ((-7 % 3) + 3) % 3;
```

`sameTick` is false. The binary tape cannot mark 0.1 exactly, so the sum is a hair over 0.3. `closeEnough` is true. `bill` is `0.3`, because 10 cents and 20 cents were added as integers and divided once at the end. `rawMod` is `-1`. `positiveMod` is `2`.

## What the code below is doing

The code below is eight sections on one tape.

Division and modulo cover real division, `floor` versus `trunc`, a 32-bit bitwise trunc, the sign of `%`, a positive `mod` helper, and `Infinity` and `NaN` from dividing by zero. Parsing runs `Number` across strings, `''`, `null`, `undefined`, and booleans, then `parseInt` with a radix, `parseFloat`, unary plus, string `+` versus `*`, and `Number.isNaN` beside the global `isNaN`. Formatting shows `toFixed` as a string, the `1.005` case, `Math.round` toward positive infinity, a two-place helper that adds `Number.EPSILON`, and base conversion. Floating point checks `0.1 + 0.2`, an epsilon comparison, integer cents, and the two integers past `MAX_SAFE_INTEGER` that compare equal.

BigInt covers powers, truncating division, the throw on `1n + 1`, and `==` versus `===` with an ordinary `1`. The Math grab-bag is abs, sign, empty max and min, roots, logs, digit counts, `gcd`, `lcm`, a prime check, digits, `clamp`, and a note that `Math.random` is the wrong tool for secrets. Bitwise covers and, or, xor, not, both shifts, 32-bit wrap, a power-of-two test, and the lowest set bit. The last section starts a running max at `-Infinity` and shows JSON turning `Infinity` and `NaN` into `null`.

The header's warning: everything is a double, so integer division does not exist, and overflow does not throw. It goes to `Infinity`. Keep money in integer cents. Past the safe integer, use BigInt. Say IEEE-754 double, floating-point error, safe integer, BigInt, and integer cents.
