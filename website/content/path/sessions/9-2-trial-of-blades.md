---
editorial: true
title: Trial of Blades
subtitle: Arrays, objects, Big O, and core data structures
hook: "A lookup that takes a millisecond at a thousand rows takes six seconds at a hundred thousand. Today you measure that on your own machine, learn to say why, and build the three structures that make the shape of the growth a choice instead of a surprise."
read: 60
artifact: "A typed Stack, Queue, and LinkedList in typescript-practice with sequence tests, a benchmark you ran, and a complexity table whose claims match the code"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
  - https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
  - https://nodejs.org/api/test.html
say:
  - "Big O is the shape of growth, not a stopwatch; measure the stopwatch too."
  - "Name the operation first, then pick the structure that makes it cheap."
  - "Every claim in the complexity table points at a line in the code."
---

## The hook

The guild hall's inbox is a `find` on an indexed field, and it is fast because MongoDB keeps a tree beside the collection. In memory you have no such help. `names.includes(name)` walks the whole array every time, and a loop that calls it for every name walks the array once per name. At a thousand names that is a millisecond. At a hundred thousand it is seconds, on the same machine, with the same code. Nothing broke. The shape of the work grew faster than the input.

Today you learn to see that shape before you run the code, and to measure it after. The vocabulary is Big O, which describes how work grows with input size and deliberately ignores everything else. The tools are the structures you already use without naming them, arrays and `Map` and `Set`, plus three you build yourself in `~/projects/typescript-practice`: a stack, a queue, and a linked list. Each comes with a test that pushes it through a sequence, a line in a table that says how it grows, and a benchmark that shows the table was telling the truth.

> *A blade is not good or bad. It is good for one cut and wrong for another. Learn which cut you are making.*

## The idea

Start from the operation, not the structure. Before you choose an array or a map, write down what the program does most often to the data: look up by key, scan everything in order, add at the end, remove from the front, find the most recent. Each structure makes some of those cheap and others expensive, and the trade is the whole decision. An array gives you order and index access and makes removal from the front expensive. A `Map` gives you lookup by key and makes "the fifth one" meaningless. A stack gives you the most recent item and nothing else. Naming a structure before naming the operation is how you end up with a queue built on `shift()`.

Big O is the language for the trade. It describes how the amount of work grows as the input grows, and it throws away constants and small terms on purpose. O(1) means the work does not depend on the size: reading `items[3]`, `map.get(key)`, `array.push`. O(n) means the work grows in step with the size: `includes`, `find`, a loop over everything. O(n²) means a loop inside a loop over the same data, so ten times the input is a hundred times the work. O(log n) means each step halves what is left, which is why binary search over a million sorted numbers takes about twenty comparisons. O(n log n) is the cost of sorting by comparison, which no comparison sort beats.

What Big O does not say matters as much. It does not say how long anything takes. A linear scan of fifty items beats a hash lookup that first has to build the hash. It does not say what `n` is unless you do: for the inbox, `n` is messages to one recipient, not messages in the collection. And it describes the dominant term only, so two algorithms that are both O(n) can differ by a factor of fifty. The claim "this is O(1)" is a claim about shape. The claim "this is fast" needs a measurement with a number and a size attached.

Space has the same vocabulary. A function that keeps one counter is O(1) space. A function that copies the array is O(n) space. A recursive function that goes `n` levels deep uses O(n) stack, which is a kind of memory you do not see until it overflows. Trading space for time is the most common optimization there is: `hasDuplicates` with a `Set` is O(n) time and O(n) space; the nested loop is O(n²) time and O(1) space. Neither is right in general. The one with the memory is right when `n` is large enough that the square hurts, which is the number you measure.

What you should be able to draw on a napkin: a column of operations the program performs most, a structure chosen to make the top one cheap, and one line per operation saying how its cost grows. Then one measurement at three sizes that confirms the shape. The table and the benchmark are two views of the same claim.

![](diagram:session-9-2/fig1-model)

### What an array actually costs

An array is a contiguous list with an index. `items[i]` is O(1). `push` and `pop` at the end are O(1), amortized, because the engine keeps spare room and occasionally copies into a bigger block. `includes`, `indexOf`, and `find` are O(n), because they may look at every element before giving up. `unshift` and `shift` are O(n), because every remaining element moves one slot; the [shift page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift) says so in its first paragraph. `splice` in the middle is O(n) for the same reason. `sort` with a comparator is O(n log n).

The trap is the method whose name sounds cheap. `shift()` is one word and one call, and the bill is proportional to what is left. A queue built on `shift()` pays that bill on every dequeue, so draining a queue of `n` items costs O(n²). At a hundred items it is invisible. At a hundred thousand it is half a second, measured below. Read the method's cost, not its length.

`Set` and `Map` are the structures for membership and lookup by key. `set.has(value)` and `map.get(key)` are expected O(1): the engine hashes the key and jumps to a bucket. "Expected" is the honest word, because a hash can collide and a bucket can hold more than one entry; for ordinary keys the average is constant, and that is what you cite. The [Map page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) and [Set page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) are the reference. Prefer `Map` to a plain object when keys are not strings, when you need `.size`, or when you will add and delete a lot; use an object when the shape is fixed and you want JSON.

### Stack, queue, list: the operation each one is for

A stack is last-in, first-out. `push` adds to the top, `pop` removes the top, `peek` reads it. Both are O(1) on an array, because the top is the end. Undo history, a call stack, matching brackets, and evaluating reverse Polish notation are stacks: the most recent thing is the next thing you need.

A queue is first-in, first-out. `enqueue` adds to the back, `dequeue` removes the front. On a plain array the front is index zero, and removing it is the `shift()` trap. The fix is to keep a `head` index: `dequeue` reads `items[head]`, advances `head`, and never moves anything. The consumed slots stay behind the head until a compaction step copies the live part forward, which you do only when the dead prefix is at least half the array, so the copying is paid at most once per item on average. That is still O(1) amortized, and it comes with an invariant you have to state: live items are `items[head]` through the end, and `size` is `items.length - head`. Work queues, breadth-first search, and the print spool are queues.

A linked list is nodes that point to the next node. `prepend` is O(1). `append` is O(1) if you keep a `tail` pointer and O(n) if you walk from the head each time. `find` and `remove` by value are O(n), because you walk. Insert or remove at a node you already hold is O(1), which is the list's one real advantage over an array and the reason it is worth building once. Reversal in place is O(n) time and O(1) space with three pointers. You will rarely ship a linked list in application code. You will constantly read code that assumes you know what one is.

A binary search tree is the structure behind database indexes and sorted maps: left subtree smaller, right subtree larger, O(log n) search when balanced and O(n) when you insert sorted data into a naive one. This session names it so you recognize it; building one is a side exercise, not the quest.

### Tests check sequences, not single calls

A stack that passes "push one, pop one" can still be wrong. Push three, pop one, push one, drain, and check the order. A queue that passes "enqueue one, dequeue one" can still return items out of order after an interleave. A linked list that removes a middle node fine can lose its tail pointer when you remove the last node, and the bug appears on the next append. The tests that matter are sequences that cross the boundaries: empty, one, the head, the tail, the only node, and remove-then-add. Include the empty case and decide what it returns; `undefined` is the choice here, and the type `T | undefined` makes every caller handle it.

Node's test runner from last session is enough. One file per structure, one `test` per sequence, `assert.deepEqual` on the array form of the structure after the sequence. If a test needs a dozen steps to reach the boundary, that is the test.

## The demonstration

One worked example end to end: a queue, measured, in `~/projects/typescript-practice`. The project exists from last session; nothing new is installed.

First the naive version, in `src/queue.ts`, so you can watch it fail.

```ts
export class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  get size(): number {
    return this.items.length;
  }
}
```

It is correct. Every test you would write passes. Now measure it. `src/bench.ts` times four jobs at three sizes with `performance.now()`, which Node provides as a global, documented on the [Performance page](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now). The first pair is `includes` against `Set.has`; the second pair is this queue against the one you are about to write.

```ts
import { Queue } from './queue.ts';

function time(label: string, work: () => void): void {
  const start = performance.now();
  work();
  const ms = performance.now() - start;
  console.log(label.padEnd(34) + ms.toFixed(1).padStart(9) + ' ms');
}

for (const n of [1_000, 10_000, 100_000]) {
  const numbers = Array.from({ length: n }, (_, i) => i);
  const wanted = numbers.map((x) => x * 7 + 3);
  console.log('n = ' + n);
  time('  array.includes, n lookups', () => {
    let hits = 0;
    for (const w of wanted) if (numbers.includes(w)) hits += 1;
  });
  time('  Set.has, n lookups', () => {
    const set = new Set(numbers);
    let hits = 0;
    for (const w of wanted) if (set.has(w)) hits += 1;
  });
  time('  shift() queue, n in n out', () => {
    const arr: number[] = [];
    for (const x of numbers) arr.push(x);
    while (arr.length > 0) arr.shift();
  });
  time('  head-index Queue, n in n out', () => {
    const q = new Queue<number>();
    for (const x of numbers) q.enqueue(x);
    while (q.size > 0) q.dequeue();
  });
}
```

`wanted` is built so most lookups miss, which is the expensive case for `includes`. Run it with `node src/bench.ts`. With the naive queue still in place, the last line of each block is the same as the `shift()` line above it, because it is the same code: on the machine this page was written on, 469 milliseconds at a hundred thousand. The first block's numbers are noisy, since the engine is still warming up; read the second and third.

Now the real queue. Replace `src/queue.ts`:

```ts
export class Queue<T> {
  private items: T[] = [];
  private head = 0;

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    if (this.head === this.items.length) return undefined;
    const item = this.items[this.head];
    this.head += 1;
    if (this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return item;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  get size(): number {
    return this.items.length - this.head;
  }
}
```

The invariant, written where the next reader will see it: live items are `items[head]` through the end; `head` never passes `items.length`; when the dead prefix reaches half the array, the live half is copied to a fresh array and `head` returns to zero. The copy is O(k) for `k` live items, and it happens only after at least `k` dequeues, so each item is copied at most about once. Run the benchmark again:

```text
n = 1000
  array.includes, n lookups             0.6 ms
  Set.has, n lookups                    0.1 ms
  shift() queue, n in n out             0.1 ms
  head-index Queue, n in n out          0.2 ms
n = 10000
  array.includes, n lookups            58.2 ms
  Set.has, n lookups                    1.1 ms
  shift() queue, n in n out             1.3 ms
  head-index Queue, n in n out          0.6 ms
n = 100000
  array.includes, n lookups          5784.1 ms
  Set.has, n lookups                    8.2 ms
  shift() queue, n in n out           467.5 ms
  head-index Queue, n in n out          3.8 ms
```

Your numbers will differ. The ratios will not. `includes` went from 0.6 to 58 to 5784 milliseconds as `n` went up by ten each time: a hundredfold per step, which is the signature of n². `Set.has` went 0.1, 1.1, 8.2: roughly tenfold per step, which is linear in the number of lookups, each one constant. The `shift()` queue is quiet at a thousand and ten thousand, which is why nobody notices it, and then costs half a second at a hundred thousand, another n² curve. The head-index queue drains the same hundred thousand in under four milliseconds, more than a hundred times faster, and its three numbers grow in a straight line.

The test, `tests/queue.test.ts`, checks a sequence that crosses the compaction boundary and the empty case:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Queue } from '../src/queue.ts';

test('a queue returns items in insertion order', () => {
  const q = new Queue<string>();
  q.enqueue('Bran');
  q.enqueue('Sera');
  assert.equal(q.dequeue(), 'Bran');
  q.enqueue('Ivo');
  assert.equal(q.dequeue(), 'Sera');
  assert.equal(q.dequeue(), 'Ivo');
  assert.equal(q.dequeue(), undefined);
  assert.equal(q.size, 0);
});
```

`npm test` prints `ℹ pass 1` more than it did before, and `npx tsc --noEmit` stays silent. Commit the queue, the bench, and the test. The naive version is in the commit before it, which is the comparison you want in the history.

Here is a small model you can run here: the head-index queue in plain JavaScript, plus a count of how many element moves `shift()` would make to drain a queue of `n`. It proves the order and the shape of the growth. It does not measure anything; the timings are only true on your machine, from `node src/bench.ts`.

```js run=checkpoint-9-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

class Queue {
  constructor() { this.items = []; this.head = 0; }
  enqueue(item) { this.items.push(item); }
  dequeue() {
    if (this.head === this.items.length) return undefined;
    const item = this.items[this.head];
    this.head += 1;
    if (this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }
    return item;
  }
  get size() { return this.items.length - this.head; }
}

const q = new Queue();
q.enqueue('Bran');
q.enqueue('Sera');
check(q.dequeue() === 'Bran', 'FIFO first');
q.enqueue('Ivo');
check(q.dequeue() === 'Sera' && q.dequeue() === 'Ivo', 'Interleaved order');
check(q.dequeue() === undefined && q.size === 0, 'Empty queue');

function countShiftMoves(n) {
  let moves = 0;
  for (let remaining = n; remaining > 0; remaining -= 1) moves += remaining - 1;
  return moves;
}
check(countShiftMoves(10) === 45 && countShiftMoves(100) === 4950, 'shift moves grow with the square of n');

console.log('ok: checkpoint-9-2');
```

## Where it breaks

![](diagram:session-9-2/fig2-diagnosis)

### Big O treated as a stopwatch

You replace an O(n) scan with an O(1) structure and the program gets slower. The symptom is a benchmark that goes the wrong way after an optimization you were sure of. The cause is that Big O describes growth and you changed a case where growth was not the problem: fifty items, scanned once, are cheaper than building a `Set` of fifty items to look up one of them. Or the constant hiding inside the O(1) is large, like a hash of a long string.

Ask how big `n` actually is, in this program, today. Measure the operation you care about at that size and at ten times that size. If the slow version is fine at ten times, keep the simple one and write down the size at which you would revisit. Cite Big O when you compare what happens as the input grows. Do not cite it as a timing result you never took.

### Queue uses repeated shift

A queue backed by `shift()` passes every test and then takes half a second to drain at a hundred thousand items. The symptom is a program that is fine in development and slow with real data, and a profiler that blames a one-word method. The cause is that `shift()` moves every remaining element, so a queue of `n` costs O(n²) to drain. Nothing in the code looks like a nested loop. The loop is inside the method.

Keep a head index, or use a structure with a cheap pop from the front. State what happens to the dead prefix: compact at half, or cap the array, or accept growth and say so. A correct Big O claim names the representation, not just the word queue. "A queue is O(1) to dequeue" is true of the abstract type and false of this array.

### Hash lookup called guaranteed constant

The table says `Map.get` is O(1) as if that were a promise, and a reviewer asks what happens when the keys collide. The symptom is a claim you cannot defend. The cause is a missing word: hash lookup is expected constant time under a hash that spreads keys evenly, and a hostile or unlucky key set turns a bucket into a list.

Write "expected O(1)" or "average O(1)" in the table, and say what the keys are. For ordinary application keys, ids and names, the average is what you will see and `Map` is the right tool. If you are designing against input an attacker chooses, collision behavior is part of the design and belongs in the system design document two sessions from now, not in a footnote.

## Your turn

Everything happens in `~/projects/typescript-practice`, beside the queue. Run `npm test` after every step; the pass count only goes up.

1. Write `src/stack.ts`: a generic `Stack<T>` with `push`, `pop`, `peek`, and a `size` getter, backed by an array with the top at the end. Every operation is O(1); write that as a comment at the top of the file. `tests/stack.test.ts` pushes three, pops one, pushes one, and drains, asserting the order `'d', 'b', 'a'` for pushes of `a, b, c, d` with `c` popped early, then asserts `pop()` on the empty stack is `undefined`.
2. Write `src/linked-list.ts`: a `ListNode<T>` with `value` and `next`, written as explicit fields and a constructor, not as parameter properties, because Node's type stripping refuses those. A `LinkedList<T>` with `head`, a private `tail`, a private `count`, and the methods `append` (O(1) with the tail pointer), `prepend`, `find(predicate)`, `remove(value)`, `reverse()`, `toArray()`, and a `size` getter. `remove` must fix the tail when it removes the last node.
3. Write `tests/linked-list.test.ts` with the sequence from the idea section: append 1 through 4, remove the head, the middle, the tail, then append and confirm the new node lands after the surviving tail; remove down to empty, append once more, and check `toArray()` is `[7]` and `size` is `1`. A second test reverses `a, b, c`, appends `d`, and expects `['c', 'b', 'a', 'd']`. The tail bug in step 2 fails exactly this line.
4. Run `node src/bench.ts` once more and paste the output into a new file `COMPLEXITY.md`, under the heading "Measured on my machine". Below it, write a table with one row per operation you implemented: structure, operation, time, space, and the line of code the claim points at. `dequeue` is "O(1) amortized, src/queue.ts compaction at half". `append` is "O(1), tail pointer".
5. Run `npx tsc --noEmit`. Silence. Then `npx tsc` and `node dist/bench.js` to confirm the compiled program gives the same ratios.
6. Break the list once: remove the line in `remove` that reassigns `tail`, run `npm test`, and read the failing assertion. It is the append-after-tail-removal line, not the removal line. Put it back. That is the sequence test earning its keep.

If `npm test` reports a file it cannot import, check that the relative path from `tests/` ends in `.ts`. The runner executes files from disk, and the compiler is the only thing that rewrites extensions.

## The quest

![](diagram:session-9-2/fig3-evidence)

The deliverable is a challenge set in `src/challenges.ts`, solved with the structures you built, with a test file that proves each one and a complexity line above each function. Statements and expected outputs only; the answer key is at the end of this page, after you have tried.

1. **Reverse Polish notation.** `evaluateRpn(tokens: string[]): number` evaluates `['3', '4', '+', '2', '*']` to `14`, using your `Stack<number>`. Operators are `+ - * /`. Throw on a malformed expression such as `['+']`.
2. **Print queue.** `runPrintQueue(jobs: { name: string; pages: number }[]): string[]` enqueues every job into your `Queue`, dequeues them in order, and returns one line per job in the form `Bran: 3 pages`. Five jobs in, five lines out, same order.
3. **Remove duplicates from a list.** Add `removeDuplicates(): void` to `LinkedList<T>`, keeping the first occurrence of each value, so `1, 2, 1, 3, 2` becomes `[1, 2, 3]` and `size` is `3`. O(n) time with a `Set`, and the tail still correct afterwards.
4. **Intersection.** `intersection(a: number[], b: number[]): number[]` returns the values present in both, each once, in the order they appear in `a`. `[1, 2, 2, 3]` and `[2, 3, 4]` give `[2, 3]`. O(n + m) with a `Set`; write the O(n·m) nested-loop version too, under the name `intersectionSlow`, and have one test assert they agree on ten generated pairs.

Evidence to keep:

- `npm test` output with the `ℹ pass` count, which should now be at least nine.
- `COMPLEXITY.md` with the measured block and the table, one row per method, each row naming its line of code.
- The commit history showing the naive queue before the head-index queue, so the benchmark comparison is reproducible from the repository alone.
- A sentence in `COMPLEXITY.md` saying which `n` your bench proved the shape at, and which `n` you have not tested.

Push to the `typescript-practice` repository. Next session's algorithm files reuse the stack and the list, so leave the names as they are.

## Side quests

The Big O sheet is the growth vocabulary in one page, the spatial complexity sheet is the half of the table you are most likely to leave blank, and the arrays pattern sheet is a catalogue of the array operations whose costs you just measured.

## Before next session

Next session is algorithms: the patterns that turn an O(n²) loop into O(n) when the input has the right structure, and the habit of keeping the slow version as an oracle to check the fast one. Reread your `COMPLEXITY.md` and the `includes` row of the benchmark, because the first pattern, the frequency counter, is that row turned into a technique. Nothing is running between sessions. You arrive with the three structures tested, the challenge set solved, and the bench output pasted, and the next session's files go in the same `src`.

### The answer key, for after you have tried

Compare, do not copy. If yours differs and passes the same tests, keep yours and write down why.

```ts
import { Stack } from './stack.ts';
import { Queue } from './queue.ts';

// O(n) time, O(n) space: every token is pushed at most once.
export function evaluateRpn(tokens: string[]): number {
  const stack = new Stack<number>();
  for (const token of tokens) {
    if (token === '+' || token === '-' || token === '*' || token === '/') {
      const right = stack.pop();
      const left = stack.pop();
      if (left === undefined || right === undefined) throw new Error('malformed expression at ' + token);
      stack.push(token === '+' ? left + right : token === '-' ? left - right : token === '*' ? left * right : left / right);
    } else {
      const value = Number(token);
      if (Number.isNaN(value)) throw new Error('not a number: ' + token);
      stack.push(value);
    }
  }
  const result = stack.pop();
  if (result === undefined || stack.size !== 0) throw new Error('malformed expression');
  return result;
}

// O(n) time, O(n) space for the queue and the output.
export function runPrintQueue(jobs: { name: string; pages: number }[]): string[] {
  const queue = new Queue<{ name: string; pages: number }>();
  for (const job of jobs) queue.enqueue(job);
  const lines: string[] = [];
  let job = queue.dequeue();
  while (job !== undefined) {
    lines.push(job.name + ': ' + job.pages + ' pages');
    job = queue.dequeue();
  }
  return lines;
}

// O(n + m) time, O(min(n, m)) space.
export function intersection(a: number[], b: number[]): number[] {
  const inB = new Set(b);
  const seen = new Set<number>();
  const out: number[] = [];
  for (const value of a) {
    if (inB.has(value) && !seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

// O(n * m) time, O(1) extra space: the oracle.
export function intersectionSlow(a: number[], b: number[]): number[] {
  const out: number[] = [];
  for (const value of a) {
    if (b.includes(value) && !out.includes(value)) out.push(value);
  }
  return out;
}
```

`removeDuplicates` on the list walks with `previous` and `current`, keeps a `Set` of seen values, unlinks a node whose value was seen, decrements `count`, and sets `tail` to `previous` whenever the unlinked node was the tail. The three places people forget are the count, the tail, and advancing `current` without advancing `previous` after an unlink.
