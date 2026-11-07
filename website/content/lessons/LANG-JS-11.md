## The idea

Think of `===` as a coat check that returns your coat only when the ticket matches exactly. The number `1` and the string `'1'` are a coat and a claim stub. `1 === '1'` is false. `Object.is` is a stricter hook for two weird coats: `NaN` matches `NaN`, and `0` is different from `-0`. `===` does the opposite on both.

`==` is the attendant who squints and converts. The string `'1'` becomes the number `1`, and then they say yes. That conversion is type coercion. `null == undefined` is true, and `null == 0` is false, because `null` only loosely matches `undefined`. `0 == ''` and `0 == '0'` are true, and `'' == '0'` is false. Loose equality is not transitive. `false == '0'` is true. `false == 'false'` is false, because that string becomes `NaN`. Arrays go through `toString`, so `[] == false` and `[1, 2] == '1,2'`. An object becomes `'[object Object]'`.

The one loose check worth using is `x == null`. It catches `null` and `undefined`, and it leaves `0` alone.

Falsy values are the empty hangers: `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, and `NaN`. Everything else is truthy. An empty array is still a coat. So is `{}`. The strings `'0'` and `'false'` are non-empty, so they are truthy.

`typeof` reports a string: `'undefined'`, `'boolean'`, `'number'`, `'bigint'`, `'string'`, `'symbol'`, `'function'`, or `'object'`. The historic misfile is `typeof null === 'object'`. Arrays are objects too. Use `Array.isArray`, and use `=== null` for null. `typeof` on a name that was never declared is the safe `'undefined'`. `Object.prototype.toString.call(value)` is the reliable tag, such as `[object Null]` or `[object Array]`.

## Why it matters

Use `===` in real code. `+` next to a string glues, so `1 + '2'` is `'12'`. Other math converts. `||` and `&&` hand back an operand, and `??` only fills in for `null` or `undefined`, so `0 ?? 5` stays `0`. Two empty arrays are two coats: matching is by identity. `includes` can find `NaN` where `indexOf` cannot. Default `sort` is text order, and `map(parseInt)` feeds the index in as the radix.

Say strict versus loose equality, type coercion, truthy and falsy, `Object.is` for `NaN` and `-0`, and SameValueZero.

## A small example

```javascript
const sameType = 1 === '1';
const coerced = 1 == '1';
const emptyList = [] ? 'yes' : 'no';
const glued = 1 + '2';
const subtracted = '3' - 1;
const nan = NaN === NaN;
const nanIs = Object.is(NaN, NaN);
```

`sameType` is false and `coerced` is true. `emptyList` is `'yes'`, because an empty array is a real object. `glued` is `'12'` and `subtracted` is `2`. `nan` is false and `nanIs` is true.

## What the code below is doing

The first block is `===`, `==`, and `Object.is`: the conversions above, the non-transitive trio of `0`, `''`, and `'0'`, `NaN === NaN` false, `Object.is(NaN, NaN)` true, `Object.is(0, -0)` false, and `0 === -0` true. `includes` and `Map` find `NaN`. `indexOf` does not.

Two fresh arrays are not equal, two fresh objects are not equal, `'a' === 'a'` is true, and one array compared to itself is true.

`typeof` reports `null` and arrays as `'object'`, functions as `'function'`, an undeclared name as `'undefined'`, `NaN` as `'number'`, bigint, symbol, and a class as `'function'`. An array is an `instanceof` Array and Object. `toString.call` tags null, arrays, and dates.

The falsy list is those eight empty hangers. The truthy list includes `[]`, `{}`, `'0'`, `'false'`, and `new Boolean(false)`. `filter(Boolean)` keeps `1` and `'a'`.

`+` concatenates. The other operators coerce to numbers: `true + 1`, `[] + []` as `''`, `[] + {}` as `'[object Object]'`, `1 + null` as `1`, `1 + undefined` as `NaN`, and `'5' + 3 - 2` as `51`. `+''` and `+[]` are `0`. `+{}` is `NaN`. `String(null)` is `'null'`, while `String([null])` is empty, because null inside an array becomes `''`.

`'10' < '9'` is lexicographic. `10 < '9'` is numeric. `null >= 0` is true because a relational compare treats `null` as `0`, and `null == 0` is still false. Both `undefined < 1` and `undefined > 1` are false.

`0 || 'default'`, `'' && 'x'`, and `'a' && 'b'` return an operand. `null ?? 0` is `0`. `0 ?? 5` is `0`.

The trivia block is the same coat check in costume. `0.1 + 0.2 === 0.3` is false. Past `Number.MAX_SAFE_INTEGER`, adding 1 and adding 2 can look equal. `typeof typeof 1` is `'string'`. Default sort turns `[10, 1, 3]` into `1,10,3`. `['1','7','11'].map(parseInt)` is `1`, `NaN`, `3`. `map(Number)` is the fix. `arguments` is an object. `void 0` is `undefined`. `1 < 2 < 3` is true and `3 > 2 > 1` is false. `'b' + 'a' + +'a' + 'a'` is `'baNaNa'`. `Math.max()` with no arguments is less than `Math.min()`. `[] + null + 1` is `'null1'`. A holey array `[,,]` has length 2. `new Array(3).join('-')` is `'--'`. Setting `length` truncates.

The patterns to keep: `v == null` for nil, an object check that rejects `null` and arrays, and a numeric check that requires a finite number, so the string `'1'` does not pass.
