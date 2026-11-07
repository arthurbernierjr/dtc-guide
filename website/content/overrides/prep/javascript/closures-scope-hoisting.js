// ─────────────────────────────────────────────────────────────────────────────
// JS CLOSURES, SCOPE, HOISTING, TDZ — the "explain this output" questions
// ─────────────────────────────────────────────────────────────────────────────
// SCOPE   : var = function-scoped, hoisted as undefined. let/const = block-scoped,
//           hoisted but in the TEMPORAL DEAD ZONE until the declaration line.
// CLOSURE : a function + the variables it captured by REFERENCE (not by value).
//           Why the classic for-var-setTimeout loop prints 3,3,3.
// HOIST   : function DECLARATIONS are fully hoisted; function EXPRESSIONS and
//           arrows are not (they follow their var/let/const rules).
// SAY     : "lexical scoping", "closure captures the binding, not the value",
//           "IIFE", "module pattern", "memoization", "currying", "partial
//           application", "debounce/throttle are closures over a timer".
//           First visit from Session 3.2 or 3.4: read section 0, then 1 to 3.
//           Sections 4 to 7 are tagged "after Unit 3"; come back for them later.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');

// ── 0. Start here: one counter, two calls
// A closure is a function that keeps a variable alive after the function that made it has
// returned. Read top to bottom; each assert checks the private number at that exact moment.
function makeCounter() {
  let count = 0;                                             // private: nothing outside can read or change it
  return function next() { count += 1; return count; };     // `next` is the closure; it holds on to `count`
}
const tally = makeCounter();                                 // makeCounter has returned; count is 0 and still alive
assert.equal(tally(), 1);                                    // call 1: count went 0 -> 1
assert.equal(tally(), 2);                                    // call 2: count went 1 -> 2; it remembered
const other = makeCounter();                                 // a second makeCounter() call makes a second private count
assert.equal(other(), 1);                                    // other's count: 0 -> 1; tally's count is still 2
assert.equal(tally(), 3);                                    // tally's count: 2 -> 3; the two counters never share
assert.equal(typeof tally.count, 'undefined');               // no way in from outside; only the function can touch it
// Stop here on your first visit from Session 3.2; sections 4 to 7 are for after Unit 3.
// Sections 1 to 3 are the scope rules; read them when Session 3.4 sends you back.

// ── 1. var vs let vs const
{
  assert.equal(typeof hoisted, 'undefined');                 // checked BEFORE its line on purpose: var is hoisted as undefined
  var hoisted = 1;                                           // the declaration line; now it holds 1
  assert.equal(hoisted, 1);
  assert.throws(() => tdz, ReferenceError);                  // checked BEFORE its line: let exists but is in the TDZ
  let tdz = 2;                                               // the declaration line ends the dead zone
  assert.equal(tdz, 2);
  const k = { a: 1 };
  k.a = 2;                                                   // const = binding is constant, object is not
  assert.equal(k.a, 2);                                      // `k = {}` would be TypeError: Assignment to constant variable
}
{
  if (true) { var leaks = 'var'; let stays = 'let'; }
  assert.equal(leaks, 'var');                                // var ignores the block
  assert.equal(typeof stays, 'undefined');                   // let didn't leak
}

// ── 2. The classic loop
const fns1 = [];
for (var i = 0; i < 3; i++) fns1.push(() => i);              // one shared `i`; the loop leaves it at 3
assert.equal(i, 3);                                          // var leaked out of the loop and it is 3 now
assert.deepEqual(fns1.map((f) => f()), [3, 3, 3]);           // every closure reads that same `i`, after the loop ended
const fns2 = [];
for (let j = 0; j < 3; j++) fns2.push(() => j);              // fresh `j` per iteration
assert.deepEqual(fns2.map((f) => f()), [0, 1, 2]);           // each closure kept its own `j`
// Pre-let fix: IIFE capturing the value:  (function (x) { fns.push(() => x); })(i)

// ── 3. Function hoisting
assert.equal(decl(), 'declared');                            // works before the line: declarations are fully hoisted
function decl() { return 'declared'; }
assert.throws(() => expr(), ReferenceError);                 // before the line: a const arrow is in the TDZ
const expr = () => 'expression';
assert.equal(expr(), 'expression');                          // after the line: works

// ── 4. Closures: private state, counters, once, memoize (after Unit 3)
function makeCounterWithApi(start = 0) {
  let n = start;                                             // private — no way in except these functions
  return { inc: () => ++n, dec: () => --n, get value() { return n; } };
}
const c1 = makeCounterWithApi(), c2 = makeCounterWithApi(10);
c1.inc(); c1.inc(); c2.dec();
assert.equal(c1.value, 2);
assert.equal(c2.value, 9);                                   // independent closures

const once = fn => { let done = false, result; return (...a) => (done ? result : (done = true, result = fn(...a))); };
let calls = 0;
const init = once(() => ++calls);
init(); init();
assert.equal(calls, 1);

const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};
let slowCalls = 0;
const slowSquare = memoize(x => (slowCalls++, x * x));
slowSquare(4); slowSquare(4); slowSquare(5);
assert.equal(slowCalls, 2);
const fib = memoize(n => (n < 2 ? n : fib(n - 1) + fib(n - 2)));
assert.equal(fib(50), 12586269025);

// ── 5. Currying / partial application / compose / pipe (after Unit 3)
const curry = fn => function curried(...a) { return a.length >= fn.length ? fn(...a) : (...b) => curried(...a, ...b); };
const add3 = curry((a, b, c) => a + b + c);
assert.equal(add3(1)(2)(3), 6);
assert.equal(add3(1, 2)(3), 6);
const partial = (fn, ...preset) => (...later) => fn(...preset, ...later);
assert.equal(partial(Math.max, 10)(3, 7), 10);
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
assert.equal(pipe(x => x + 1, x => x * 2)(3), 8);
assert.equal(compose(x => x + 1, x => x * 2)(3), 7);

// ── 6. Debounce / throttle shapes (timer captured in a closure) (after Unit 3)
function debounce(fn, ms, setT = setTimeout, clearT = clearTimeout) {
  let t;                                                     // the timer id lives in the closure
  return (...a) => { clearT(t); t = setT(() => fn(...a), ms); };
}
function throttle(fn, ms, now = Date.now) {
  let last = -Infinity;                                      // the last accepted time lives in the closure
  return (...a) => { if (now() - last >= ms) { last = now(); return fn(...a); } };
}
{
  // Fake timer so the file stays synchronous: `pending` holds the one callback the debounce scheduled.
  let debounced = 0, pending = null;
  const fakeSet = (cb) => { pending = cb; return 1; }, fakeClear = () => { pending = null; };
  const d = debounce(() => debounced++, 100, fakeSet, fakeClear);
  d();
  assert.equal(debounced, 0);                                // call 1 only scheduled the timer; nothing ran yet
  d();
  assert.equal(debounced, 0);                                // call 2 cancelled that timer and scheduled a new one
  pending();                                                 // the timer fires once, 100 ms after the LAST call
  assert.equal(debounced, 1);                                // one run for two calls
}
{
  // Fake clock: `clock` is "now" in ms; the throttle lets one call through per 100 ms.
  let throttled = 0, clock = 0;
  const th = throttle(() => throttled++, 100, () => clock);
  th();
  assert.equal(throttled, 1);                                // clock 0: the first call runs
  th();
  assert.equal(throttled, 1);                                // clock still 0: too soon, dropped
  clock = 150;
  th();
  assert.equal(throttled, 2);                                // clock 150: 100 ms have passed, runs again
}

// ── 7. IIFE and the module pattern (pre-ESM encapsulation) (after Unit 3)
const Store = (() => {
  const items = [];                                          // private
  return { add: x => items.push(x), size: () => items.length };
})();
Store.add(1);
assert.equal(Store.size(), 1);
assert.equal(typeof Store.items, 'undefined');

// ── 8. Closure gotcha: captured binding changes
let shared = 'a';
const read = () => shared;
shared = 'b';
assert.equal(read(), 'b');                                   // sees the latest value, not a snapshot

// ── 9. Scope chain / shadowing
const x = 'outer';
function shadow() { const x = 'inner'; return x; }
assert.equal(shadow(), 'inner');
assert.equal(x, 'outer');
assert.equal(typeof globalThis, 'object');                   // the global object in any environment

console.log('ok: javascript/closures-scope-hoisting.js');
