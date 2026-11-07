## The idea

Think of an object like a filing cabinet. Each drawer has a label, the key, and holds one thing, the value. `cabinet.permit` opens the drawer whose label you already know. `cabinet[key]` opens the drawer whose label is sitting in a variable. A method is a drawer that holds a function. The cabinet is one object in memory. Two variables can point at that same cabinet.

`{ permit: '2024' } === { permit: '2024' }` is false. Those are two cabinets that happen to hold similar papers. Equality of objects is reference equality. Same cabinet, true. Similar papers, false.

Destructuring pulls the papers you need onto the desk in one line. `const { permit, missing = 'none', folder: { city } } = cabinet` opens drawers by name, unpacks a nested folder, and uses `'none'` when `missing` is absent. A default applies when the value is `undefined`. Rest copies the leftover drawers into a new cabinet. Arrays unpack by position: a bare comma skips a slot, and `[p, q] = [q, p]` swaps two names. You can unpack right in a parameter list, `({ w, h = w }) => w * h`.

A shallow copy, `{ ...cabinet }`, is a new cabinet whose nested folders are still the old ones. An immutable update copies the nested folder too: `folder: { ...cabinet.folder, city: 'Dallas' }`. `structuredClone` deep-copies plain data. A function in the cabinet is something it cannot copy. `Object.assign` is the older merge. Later keys win.

## Why it matters

The usual copy shares the inner folders. Push into a nested array on the copy and the original sees the push. Spread the level you mean to change. `Object.freeze` locks the top drawers. In strict mode, assigning a frozen property throws. The folder inside stays writable. Freeze is shallow.

`?.` opens a drawer only when the cabinet in front of it exists, so `user.address?.zip?.code` is `undefined` when a drawer along the way is missing. `??` treats only `null` and `undefined` as missing. `||` also replaces `0`, `''`, and `false`. `??=` assigns only in the missing case. `||=` uses the wider test. A retry count of `0` is a real setting. Keep it with `??`.

Existence is three questions. `'name' in user` and `for...in` walk inherited drawers. `Object.hasOwn` asks about this cabinet. Reading `undefined` happens both for a missing drawer and for a drawer that holds `undefined` on purpose. List your own labels with `Object.keys`, `Object.values`, and `Object.entries`.

JSON is a shipping box with rules. `JSON.stringify` drops `undefined` and functions, turns `NaN` and `Infinity` into `null`, writes a `Date` as an ISO string, and turns a `Map` or a `Set` into `{}`. Key order is part of that string. A replacer array is an allowlist. A reviver runs on the way back through `JSON.parse`. Broken text throws `SyntaxError`.

A computed key uses brackets: `{ [key]: 1 }`. A shorthand property is `{ name }` when the variable and the label match. A property descriptor says whether a drawer is enumerable, writable, and configurable. `Object.defineProperty` can hide a value from `Object.keys`. Getters and setters look like drawers and run code on the way through.

## A small example

```javascript
const cabinet = {
  permit: '2024',
  folder: { city: 'Austin' },
};

const { permit, missing = 'none', folder: { city } } = cabinet;

const moved = {
  ...cabinet,
  permit: '2025',
  folder: { ...cabinet.folder, city: 'Dallas' },
};

const twins = { permit: '2024' } === { permit: '2024' };
const retries = 0;
const used = retries ?? 2;
```

`permit` is `'2024'`, `missing` is `'none'`, and `city` is `'Austin'`. `moved.permit` is `'2025'`, while `cabinet.permit` stays `'2024'` and `cabinet.folder.city` stays `'Austin'`. The nested folder was copied before the city changed. `twins` is false: two cabinets, similar papers. `used` is `0`, because `??` keeps a real zero. `retries || 2` produces `2`.

## What the code below is doing

The code below is nine sections. One `user` cabinet sits open for every section: `id`, `name`, `tags`, and a nested `address`.

Destructuring pulls `name`, a default `role`, a nested `city`, and a renamed `id`, then rest, an array skip, a default over an explicit `undefined`, a swap, a parameter unpack, and `Object.entries`. Optional chaining covers a property, a call, and an index. `??` sits beside `||`, and `??=` leaves a `retries` of `0` alone while `||=` fills `timeout`.

Spread builds an immutable update: a new `name`, and a copied `address` before the `city` changes. Later keys win. `structuredClone` keeps a pushed tag off the original. `Object.assign` is the older merge. Keys cover a computed name, shorthand, a method, then `mapValues`, `pick`, and `invertObj`. Existence uses `in`, `hasOwn`, a present key whose value is `undefined`, and `delete`. Equality checks reference `===`, key order inside `JSON.stringify`, and a deep compare. JSON drops `undefined` and a function, turns `NaN` into `null`, writes a `Date` as text, turns an `undefined` array element into `null`, and writes a `Map` as `{}`. Freeze is shallow. Getters and setters convert Fahrenheit, and a non-enumerable property stays out of `Object.keys`.

The header's trap: `{} === {}` is false. `JSON.stringify` drops `undefined` and functions, turns `NaN` and `Infinity` into `null`, and loses `Map`, `Set`, and `Date` as types. Key order is part of that string. Say shallow versus deep copy, immutable update, reference equality, property descriptor, computed key, and shorthand property.
