// ─────────────────────────────────────────────────────────────────────────────
// JS ARRAYS — the methods, the mutators, the traps
// ─────────────────────────────────────────────────────────────────────────────
// FIRST VISIT : From Session 3.2, read the MUTATE and COPY rows below, then section 4 (slice copies, splice
//               changes the array) and stop. Session 3.3 sends you back for section 3, the alias check.
//               Sections 5 to 10 are lookup for Unit 9.
// MUTATE  : push pop shift unshift splice sort reverse fill copyWithin
// COPY    : slice concat map filter flat flatMap toSorted(20+) toReversed(20+) [...a]
// TRAP    : fill(Array) shares one inner array; sort() is lexicographic; reverse()
//           mutates; shift() is O(n); indexOf uses === (NaN never found);
//           holes from `new Array(n)` are skipped by map/forEach — use fill first.
// SAY     : "shallow copy", "in place", "higher-order", "predicate", "accumulator"
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');

// ── 1. Building
assert.deepEqual(new Array(3).fill(0), [0, 0, 0]);
assert.deepEqual(Array.from({ length: 4 }, (_, i) => i * i), [0, 1, 4, 9]);
assert.deepEqual(Array.from('abc'), ['a', 'b', 'c']);
assert.deepEqual(Array.from(new Set([1, 1, 2])), [1, 2]);
const range = (lo, hi) => Array.from({ length: hi - lo }, (_, i) => lo + i);
assert.deepEqual(range(3, 7), [3, 4, 5, 6]);

// ── 2. 2D grid — THE trap
const bad = new Array(2).fill(new Array(2).fill(0));
bad[0][0] = 9;
assert.deepEqual(bad, [[9, 0], [9, 0]]);                       // one shared row object
const grid = Array.from({ length: 2 }, () => new Array(2).fill(0));
grid[0][0] = 9;
assert.deepEqual(grid, [[9, 0], [0, 0]]);

// ── 3. Copy vs alias; shallow vs deep
const a = [1, [2, 3]];
const alias = a, shallow = [...a], deep = structuredClone(a);
alias.push(4); shallow[1].push(99);
assert.deepEqual(a, [1, [2, 3, 99], 4]);                      // alias saw push; shallow shared the inner array
assert.deepEqual(deep, [1, [2, 3]]);

// ── 4. slice (copy, [start, end)) vs splice (mutate: start, deleteCount, ...insert)
const s = [10, 20, 30, 40, 50];
assert.deepEqual(s.slice(1, 3), [20, 30]);
assert.deepEqual(s.slice(-2), [40, 50]);
assert.deepEqual(s.splice(1, 2, 'x'), [20, 30]);              // returns removed
assert.deepEqual(s, [10, 'x', 40, 50]);
s.splice(1, 0, 'ins');                                         // insert without deleting
assert.deepEqual(s, [10, 'ins', 'x', 40, 50]);

// ── 5. Workhorses
const nums = [3, 1, 4, 1, 5, 9, 2, 6];
assert.deepEqual(nums.filter(n => n % 2 === 0), [4, 2, 6]);
assert.deepEqual(nums.map(n => n * 10).slice(0, 3), [30, 10, 40]);
assert.equal(nums.reduce((sum, n) => sum + n, 0), 31);         // ALWAYS pass the initial value
assert.equal(nums.find(n => n > 4), 5);                        // value or undefined
assert.equal(nums.findIndex(n => n > 4), 4);                   // index or -1
assert.equal(nums.findLast(n => n < 3), 2);                    // Node 18+
assert.equal(nums.indexOf(1), 1);
assert.equal(nums.lastIndexOf(1), 3);
assert.equal([NaN].includes(NaN), true);                       // includes finds NaN; indexOf doesn't
assert.equal([NaN].indexOf(NaN), -1);
assert.equal(nums.some(n => n > 8), true);
assert.equal(nums.every(n => n > 0), true);
assert.equal([].every(() => false), true);                     // vacuous truth on empty
assert.deepEqual([[1, [2]], [3]].flat(Infinity), [1, 2, 3]);
assert.deepEqual([1, 2].flatMap(n => [n, n]), [1, 1, 2, 2]);
assert.deepEqual([...nums].reverse().slice(0, 2), [6, 2]);
assert.equal([1, 2, 3].at(-1), 3);
assert.equal([1, 2, 3].join('-'), '1-2-3');
assert.deepEqual([1, 2].concat([3], 4), [1, 2, 3, 4]);
assert.deepEqual(Object.entries(['a', 'b']), [['0', 'a'], ['1', 'b']]);
assert.deepEqual([...nums.entries()].slice(0, 2), [[0, 3], [1, 1]]);
assert.deepEqual([...nums.keys()].slice(0, 2), [0, 1]);

// ── 6. Max / min / sum / avg
assert.equal(Math.max(...nums), 9);                            // spread ok to ~1e5 elements
assert.equal(nums.reduce((m, n) => (n < m ? n : m), Infinity), 1);
assert.equal(Math.max(...[]), -Infinity);                      // empty! guard it
const avg = xs => (xs.length ? xs.reduce((p, c) => p + c, 0) / xs.length : 0);
assert.equal(avg([2, 4]), 3);

// ── 7. Unique / count / group / zip / chunk / partition
assert.deepEqual([...new Set(nums)], [3, 1, 4, 5, 9, 2, 6]);
const counts = nums.reduce((m, n) => m.set(n, (m.get(n) ?? 0) + 1), new Map());
assert.equal(counts.get(1), 2);
const groupBy = (xs, f) => xs.reduce((m, x) => { const k = f(x); (m[k] ??= []).push(x); return m; }, {});
assert.deepEqual(groupBy(['ant', 'bee', 'cat', 'do'], w => w.length), { 2: ['do'], 3: ['ant', 'bee', 'cat'] });
const zip = (xs, ys) => xs.map((x, i) => [x, ys[i]]);
assert.deepEqual(zip([1, 2], ['a', 'b']), [[1, 'a'], [2, 'b']]);
const chunk = (xs, k) => Array.from({ length: Math.ceil(xs.length / k) }, (_, i) => xs.slice(i * k, i * k + k));
assert.deepEqual(chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
const partition = (xs, p) => xs.reduce(([yes, no], x) => (p(x) ? [[...yes, x], no] : [yes, [...no, x]]), [[], []]);
assert.deepEqual(partition([1, 2, 3, 4], n => n % 2), [[1, 3], [2, 4]]);

// ── 8. Loops: for..of (values) — for..in is for OBJECT KEYS, never arrays
let total = 0;
for (const n of nums) total += n;
assert.equal(total, 31);
for (const [i, n] of nums.entries()) if (i === 0) assert.equal(n, 3);
// forEach cannot break/return early. Need to exit? for..of, some(), or every().

// ── 9. Queue in O(1): shift() is O(n). Use a head index or a Map-based deque.
function makeQueue() {
  const items = []; let head = 0;
  return {
    push: x => items.push(x),
    shift: () => items[head++],
    get size() { return items.length - head; },
  };
}
const q = makeQueue(); q.push(1); q.push(2);
assert.equal(q.shift(), 1);
assert.equal(q.size, 1);

// ── 10. Holes & sparse arrays
const sparse = new Array(3);                                   // [ <3 empty items> ]
assert.deepEqual(sparse.map(() => 1), new Array(3));           // map SKIPS holes
assert.deepEqual(Array.from({ length: 3 }, () => 1), [1, 1, 1]);
assert.deepEqual([...sparse], [undefined, undefined, undefined]); // spread fills them

console.log('ok: javascript/arrays.js');
