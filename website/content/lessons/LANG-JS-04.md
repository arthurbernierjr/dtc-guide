## The idea

Think of a `Map` like a coat check. You hand the clerk any token you like: a word, a number, or a whole object. They hang the coat and remember the token, and they remember who arrived first. `size` is how many coats are on the wall. A missed token comes back as `undefined`, which is why the counting line reads `(counts.get(word) ?? 0) + 1`. The `??` fills in 0 only when the hook is empty.

A `Set` is the clipboard at that same door. Each token is written once, in the order it first appeared. `has`, `add`, and `delete` are average O(1) lookups. That average comes from a hash map under the hood. `add` returns the set, so two adds can chain. Spread the set when you want an array of the tokens that remain.

A plain object is the row of mailboxes built into the same lobby. The label maker only prints strings. `obj[1] = 'one'` stores the key `'1'`. The mailbox labeled `1` and the mailbox labeled `'1'` are the same box. Labels that look like integers get lined up in numeric order when you list the keys, even if you inserted `2` before `1`. Other labels keep insertion order. The wall also shipped with inherited mailboxes. `'toString' in obj` is true for an ordinary `{}`, because the building has a prototype. `Object.hasOwn` asks whether you filed that label yourself. `Object.create(null)` builds a mailbox row with no prototype at all.

## Why it matters

Counting, grouping, and "have I already seen this" are half of the loops you will write by hand. A frequency map is the coat check of counts. A seen set drops duplicates and keeps first-seen order: `[...new Set(xs)]`. `new Set(xs).size !== xs.length` means the list had a repeat.

Grouping anagrams uses the sorted letters as the token, then pushes each word onto that token's list. `Object.groupBy` and `Map.groupBy` exist on newer engines. The loop with `has` and `set` runs everywhere, so it is the one to write when you do not know the runtime.

The trap is identity. Map and Set compare objects and arrays by reference. Two similar jackets are two tickets unless you hand over the same object. `new Set([[1, 2]]).has([1, 2])` is false. Stringify a compound key, `` `${row},${col}` ``, or pack it into one number when the bounds are known, `row * 100000 + col`.

Insertion order is something you can lean on. An LRU cache deletes a key and sets it again to move that coat to the recent end, then evicts the first key when the size passes the cap. `WeakMap` and `WeakSet` accept only objects, skip enumeration, and let those objects be collected. Hang private metadata there. A different object with the same fields is a different key.

Reach for a Map when you add and remove often, when keys are not strings, when you need `.size` or a reliable order, or when the keys come from outside. Reach for an object when the shape is a fixed record, you are about to send JSON, or you want destructuring and dot access.

## A small example

```javascript
const hook = new Map();
hook.set('wool', 'Ada');
hook.set('linen', 'Grace');

function tally(tokens) {
  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

const visits = tally(['ada', 'grace', 'ada']);
const door = new Set(['ada', 'grace', 'ada']);
const seen = new Set();
seen.add('1,2');
const hit = seen.has('1,2');
const miss = new Set([[1, 2]]).has([1, 2]);
```

`hook.get('wool')` is `'Ada'`, and `hook.size` is 2. The clerk kept arrival order. `visits.get('ada')` is 2. `door.size` is 2, because the clipboard writes a token once. `hit` is true: the key is the string you built. `miss` is false: each `[1, 2]` is its own array, and the set compares those arrays by reference.

## What the code below is doing

The code below is nine sections, from the counting idiom to the choice between Map and object.

Counting uses `set`, `get` with `?? 0`, `has`, `size`, and `delete` (true the first time, false after). Iterating spreads keys, values, and entries, round-trips through `Object.fromEntries`, and reduces to the key with the largest count. Grouping files words by their sorted letters.

Set covers duplicates, chained `add`, spread order, `uniq`, and a size check for repeats. Intersection, difference, and union are filters and spreads, so they run without newer Set methods. Compound keys hit on the string `'1,2'`, miss on a fresh `[1, 2]`, and show a numeric packing trick. The LRU class moves a hit to the recent end with delete-then-set, and `put` evicts the oldest key once `size` passes the cap.

Plain objects show a numeric key stored as `'1'`, ordinary labels in insertion order, integer-like labels sorted ascending, `'toString' in obj` as an inherited hit, `Object.hasOwn`, `Object.create(null)`, and an empty check with `Object.keys`. WeakMap stores metadata on a user object and misses a lookalike. The closing note is when you pick a Map and when you pick an object.

The trap: Map and Set compare objects and arrays by reference. Stringify a compound key, or the lookup misses a value that only looks the same. Say hash map, O(1) average lookup, frequency map, seen set, insertion-ordered, and WeakMap for metadata without leaks.
