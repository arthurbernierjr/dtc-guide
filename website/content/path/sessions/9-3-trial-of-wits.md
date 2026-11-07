---
editorial: true
title: Trial of Wits
subtitle: Algorithm patterns and whiteboard practice
hook: "A pattern is not a trick to memorize. It is what the structure of the input allows. Today you write the slow version first, keep it as the oracle, and let it prove that the fast version you wrote next gives the same answers."
read: 60
artifact: "Algorithm solutions in typescript-practice, each with a brute-force oracle, a written invariant, boundary tests, and a measured comparison of the two versions"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
  - https://nodejs.org/api/test.html
  - https://nodejs.org/api/perf_hooks.html
say:
  - "Work a small input by hand before you write a loop."
  - "The invariant is the sentence that is true at the top of every iteration."
  - "The slow version is the definition; the fast one is only right when they agree."
---

## The hook

Last session you measured an `includes` loop going from a millisecond to six seconds and replaced it with a `Set`. That replacement has a name, the frequency counter, and it is one of a handful of moves that turn a nested loop into a single pass when the input has the right shape. Two pointers, sliding window, binary search, divide and conquer, memoized recursion. People call them patterns and teach them as a list. The list is the least useful part. What matters is the condition under which each one is safe, because applied without its condition a pattern produces an elegant wrong answer.

Today you solve problems the way you will solve them at a whiteboard and in a code review: understand the input, write the obvious slow version, state what makes it slow, then write the fast version with its invariant beside the loop and a test that runs both on the same generated cases. The slow version is not wasted. It is the oracle. By the end you have a file of solutions in `~/projects/typescript-practice`, each with two implementations, a sentence that stays true inside the loop, and a measurement showing which one you would ship and at what size it starts to matter.

> *A trial of wits is not won by knowing the answer. It is won by knowing how you would check one.*

## The idea

Every pattern is a consequence of a structure in the input. A frequency counter works because membership in a `Map` or `Set` is expected constant time, so counting things once replaces comparing every pair. Two pointers work when the input is sorted, or when moving one boundary can never throw away a valid answer. A sliding window works when the property of a contiguous range can be updated as one element enters and one leaves, which for a sum means the values are not negative. Binary search works when the answer space is ordered, so one comparison discards half of it. Memoization works when a subproblem's result depends only on its arguments, so a repeated call can be answered from a table. Say the condition out loud before you pick the pattern. If you cannot say it, you do not have the pattern yet; you have its name.

The method is the same for every problem, and it is worth doing in writing until it is reflex. Understand: what are the inputs, the output, and the cases at the edge, empty, one element, all the same, a match at each end. Match: which structure in the input makes which pattern safe. Plan: the slow version in two sentences, then the fast one. Implement: the slow version first, because it is the definition of correct. Review: walk one small input by hand through the fast version and watch the invariant hold. Evaluate: time and space for both, and the size at which the difference matters. Interviewers ask for this sequence out loud. Code reviewers ask for it in the commit message. The whiteboard and the pull request are the same exercise.

An invariant is a sentence that is true at the top of every iteration of a loop. For a sliding window that tracks a sum: `sum` is the total of `nums[left]` through `nums[right]` inclusive. For binary search over a half-open interval: the answer, if it exists, is at an index in `[lo, hi)`. For a frequency counter after the first pass: each count equals the number of times that key appeared. Write the sentence as a comment above the loop. Then check three things: it is true before the loop starts, each iteration keeps it true, and when the loop ends it gives you the answer. Most off-by-one errors are a loop whose invariant was never written down, so nobody noticed that `right` was inclusive in one line and exclusive in the next.

What you should be able to draw on a napkin: a small input worked by hand, the sentence that stays true inside the loop, and a check of termination, correctness, and growth. Example, invariant, proof. The code is the last thing you write and the easiest thing to fix.

![](diagram:session-9-3/fig1-model)

### The oracle

The slow version is usually two nested loops or a sort followed by a scan. It is easy to read and easy to get right, and that is its value. Keep it in the same file, with `Slow` on the end of its name. Then write one test that generates a few hundred small random inputs, runs both versions, and asserts they agree. When they disagree, the fast one is wrong until you can explain the case, because the slow one is the definition. The test will find the case you did not think of, usually an empty array or a run of equal values, and it will print the input that broke, which is more than a hand-picked example ever gives you.

Deterministic randomness matters for a test that runs on another machine. A tiny linear congruential generator with a fixed seed produces the same four hundred cases every time, so a failure is reproducible from the seed alone. `Math.random` is fine while you explore and wrong for a test you commit.

### Frequency counter, two pointers, window

A frequency counter is a `Map` from value to count, or a `Set` when you only need membership. Anagrams: count the characters of one string, subtract the characters of the other, and refuse the moment a count would go below zero. Two sum on an unsorted array: for each number, check whether the complement is already in the map, then add the number. Both are O(n) time and O(n) space, replacing an O(n²) pair comparison. The space is the price; name it.

Two pointers is two indexes walking an array under a rule that guarantees nothing valid is skipped. On a sorted array, a pair that sums to a target can be found with `left` at the start and `right` at the end: if the sum is too small, only moving `left` up can help, because `right` already holds the largest remaining value. That sentence is the proof, and it depends on the sort. A slow and a fast pointer over the same array is the shape for removing duplicates in place from sorted input, and for reversing a linked list with `previous`, `current`, and `next`, which you wrote last session.

A sliding window is a contiguous range that grows at the right and shrinks at the left, with some state updated incrementally. For the shortest run whose sum reaches a target, extend `right` and add; while the sum is at least the target, record the length and shrink from the left. This is O(n) because each index enters the window once and leaves once. It is only correct when shrinking the window cannot increase the sum, which means every value is at least zero. Write that condition in the function's comment. With negative numbers the window pattern gives wrong answers, confidently, and the oracle test is how you find out.

### Binary search and the half-open interval

Binary search finds a position in an ordered array by halving. The version worth memorizing is the lower bound: the first index whose value is at least the target, over a half-open interval `[lo, hi)`. `lo` starts at 0, `hi` at the length, and the loop runs while `lo < hi`. `mid` is `lo + floor((hi - lo) / 2)`. If `values[mid] < target`, the answer is to the right, so `lo = mid + 1`. Otherwise `mid` might be the answer, so `hi = mid`. When the loop ends, `lo` is the first position where the target would fit. On an empty array it returns 0. On a target past the end it returns the length. On duplicates it returns the first one. One function answers "is it here," "where does it go," and "where does the run start," which is why this is the form to keep.

The reason for the half-open convention is that `hi = mid` and `lo = mid + 1` can never skip an index or loop forever, and the empty interval is `lo === hi`, a condition you can read. Mixing an inclusive `right` with a length computation written for an exclusive one is the classic off-by-one, and it survives small tests because a few inputs happen to work.

### Sorting, and what it costs

Sorting enables patterns: two pointers needs it, duplicates become adjacent after it. It costs O(n log n) and it may change the caller's array, since `sort` works in place. Copy first if the caller expects the input preserved, or use `toSorted`. And pass a comparator. The default order on the [sort page](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) compares strings, so `[10, 9, 1].sort()` gives `[1, 10, 9]`. `(a, b) => a - b` is the comparator for numbers. Test with negatives and with multi-digit values so the mistake has somewhere to show up.

The sort you call is V8's TimSort, stable, O(n log n), with O(n) auxiliary space in the worst case. Merge sort is the one to understand because it is the cleanest divide and conquer: split, sort each half, merge, with O(n) extra space. Quicksort partitions around a pivot and is O(n log n) on average and O(n²) in the worst case; the version that allocates two new arrays per level uses O(n) space, and only the in-place partition gets down to O(log n) stack. Bubble sort is O(n²) and exists to be recognized, not used.

### Recursion as state and progress

A recursive function needs a base case and a call on a smaller problem. Draw the call tree for a small input and count the repeated subproblems. Naive Fibonacci calls itself twice per level and is O(2ⁿ); the same function with a `Map` memo is O(n), because each argument is computed once. The memo key must include everything the result depends on, or the cache hands back a fast wrong answer. The recursion stack is memory too: a function that recurses `n` deep uses O(n) space whether or not it allocates anything, and in Node that stack overflows somewhere around ten thousand frames. When depth can be large, the iterative version with an explicit stack or two variables is the one to ship.

## The demonstration

One problem end to end, in `~/projects/typescript-practice`. The shortest contiguous run of non-negative numbers whose sum reaches a target: `minSubarrayLen(7, [2, 3, 1, 2, 4, 3])` is `2`, for the run `[4, 3]`, and `minSubarrayLen(11, [1, 1, 1, 1, 1])` is `0`, meaning no such run.

Understand first. Input: a target and an array of numbers that are at least zero. Output: a length, or `0` when no run reaches the target. Edge cases: an empty array gives `0`; a single element equal to the target gives `1`; a target larger than the whole sum gives `0`. Match: contiguous range, sum updated incrementally, values non-negative, so a sliding window. Plan: the slow version tries every start, extends until the sum reaches the target, and keeps the best length. The fast version keeps one window.

`src/patterns.ts`, both versions:

```ts
// Sliding window: the shortest contiguous run whose sum reaches the target.
// Only valid when every number is >= 0 (shrinking the window never raises the sum).
export function minSubarrayLenSlow(target: number, nums: number[]): number {
  let best = Infinity;
  for (let start = 0; start < nums.length; start += 1) {
    let sum = 0;
    for (let end = start; end < nums.length; end += 1) {
      sum += nums[end];
      if (sum >= target) {
        best = Math.min(best, end - start + 1);
        break;
      }
    }
  }
  return best === Infinity ? 0 : best;
}

export function minSubarrayLen(target: number, nums: number[]): number {
  // Invariant: sum is the total of nums[left .. right] inclusive, and every
  // window that ends before right has already been measured.
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right];
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left += 1;
    }
  }
  return best === Infinity ? 0 : best;
}
```

Review by hand with `7` and `[2, 3, 1, 2, 4, 3]`. `right` at 0: sum 2. At 1: 5. At 2: 6. At 3: 8, which reaches 7; best is 4, shrink, sum 6, `left` 1. At 4: 10; best 4, shrink to 7, best 4, shrink to 4, `left` 3. At 5: 7; best 3, shrink to 3, `left` 4. Done. Best is 3? Trace it again, slowly: at `right` 4 the window is indexes 1 to 4, `[3, 1, 2, 4]`, sum 10, length 4; shrink to `[1, 2, 4]`, sum 7, length 3, best 3; shrink to `[2, 4]`, sum 6, stop. At `right` 5 the window is `[2, 4, 3]`, sum 9, length 3; shrink to `[4, 3]`, sum 7, length 2, best 2; shrink to `[3]`, sum 3, stop. Best is 2. The first pass through that trace was wrong, and the second was right, which is the point of tracing: the invariant said the window is `left` to `right` inclusive, and the mistake was shrinking one step too few. A hand trace that disagrees with itself is a hand trace worth doing twice.

Evaluate: the slow version is O(n²) time in the worst case, when no run reaches the target and every start scans to the end, and O(1) space. The fast version is O(n) time, because `left` and `right` each advance at most `n` times, and O(1) space. Now the oracle test, `tests/patterns.test.ts`, with a seeded generator so the cases are the same on every machine:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minSubarrayLen, minSubarrayLenSlow } from '../src/patterns.ts';

let seed = 7;
function random(limit: number): number {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed % limit;
}

test('the fast version agrees with the slow one on 500 generated arrays', () => {
  for (let round = 0; round < 500; round += 1) {
    const nums = Array.from({ length: random(12) }, () => random(10));
    const target = 1 + random(30);
    assert.equal(minSubarrayLen(target, nums), minSubarrayLenSlow(target, nums), JSON.stringify({ target, nums }));
  }
});

test('boundaries: empty, single, impossible', () => {
  assert.equal(minSubarrayLen(7, []), 0);
  assert.equal(minSubarrayLen(7, [7]), 1);
  assert.equal(minSubarrayLen(11, [1, 1, 1, 1, 1]), 0);
  assert.equal(minSubarrayLen(7, [2, 3, 1, 2, 4, 3]), 2);
});
```

`npm test` prints the pass count two higher than before. The third argument to `assert.equal` is the message, so a disagreement prints the exact `target` and `nums` that caused it. Break the fast version once: change `while (sum >= target)` to `if (sum >= target)`. The boundary test still passes on three of its four cases. The oracle test fails and prints an input where the window needed to shrink twice. Put the `while` back.

Then measure, because the growth claim is a claim. Add `src/bench-search.ts` for the binary search you will write in Your turn, timing ten thousand lookups against a linear scan at three sizes:

```ts
import { lowerBound } from './patterns.ts';

function linearBound(values: number[], target: number): number {
  let i = 0;
  while (i < values.length && values[i] < target) i += 1;
  return i;
}

for (const n of [1_000, 10_000, 100_000]) {
  const values = Array.from({ length: n }, (_, i) => i * 2);
  const targets = Array.from({ length: 10_000 }, (_, i) => (i * 7919) % (n * 2));
  let start = performance.now();
  let a = 0;
  for (const t of targets) a += linearBound(values, t);
  const linearMs = performance.now() - start;
  start = performance.now();
  let b = 0;
  for (const t of targets) b += lowerBound(values, t);
  const binaryMs = performance.now() - start;
  console.log(`n = ${String(n).padStart(6)}  linear ${linearMs.toFixed(1).padStart(8)} ms  binary ${binaryMs.toFixed(1).padStart(6)} ms  agree ${a === b}`);
}
```

Once `lowerBound` exists, `node src/bench-search.ts` prints, on the machine this page was written on:

```text
n =   1000  linear      2.1 ms  binary    4.7 ms  agree true
n =  10000  linear     11.4 ms  binary    1.7 ms  agree true
n = 100000  linear    326.1 ms  binary    1.7 ms  agree true
```

Read the first line before the last. At a thousand elements the linear scan wins, because the engine was still warming up and because a short scan is cheap. At a hundred thousand the scan is two hundred times slower and the binary search has not moved. The `agree` column is the oracle again, inline: the two functions summed the same answers over ten thousand lookups. Growth and a stopwatch, side by side, which is the evidence this session wants.

Here is a small model you can run here: the lower-bound search in plain JavaScript, plus a linear oracle and three hundred seeded cases. It proves the boundary behavior and the agreement. It does not measure anything; the timings above are only true on your machine, from `node src/bench-search.ts`.

```js run=checkpoint-9-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function lowerBound(values, target) {
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (values[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

check(lowerBound([], 3) === 0, 'Empty interval');
check(lowerBound([1, 3, 3, 7], 3) === 1, 'First matching boundary');
check(lowerBound([1, 3, 7], 9) === 3, 'Insertion at the end');

function lowerBoundSlow(values, target) {
  let i = 0;
  while (i < values.length && values[i] < target) i += 1;
  return i;
}

let seed = 7;
function random(limit) {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed % limit;
}

let steps = 0;
for (let round = 0; round < 300; round += 1) {
  const values = Array.from({ length: random(9) }, () => random(10)).sort((a, b) => a - b);
  const target = random(12);
  if (lowerBound(values, target) !== lowerBoundSlow(values, target)) {
    throw new Error('disagree on ' + JSON.stringify({ values, target }));
  }
  steps += 1;
}
check(steps === 300, 'fast and slow agree on 300 generated cases');

console.log('ok: checkpoint-9-3');
```

## Where it breaks

![](diagram:session-9-3/fig2-diagnosis)

### Pattern chosen too soon

You reach for a sliding window because the problem says "subarray," and the array has negative numbers. The symptom is a function that passes your hand-picked examples and fails the oracle on an input with a `-3` in it. The cause is a pattern applied without its condition: shrinking the window was supposed to lower the sum, and a negative value makes that false.

Write the slow version first, including its cost. Then write the one sentence that makes it too slow and the one structural fact that would make a faster version safe: sorted input, non-negative values, a bounded alphabet, overlapping subproblems. The pattern is the consequence of that fact. If the fact is absent, the fast version is a different problem, and the honest answer is the slow one plus a note on the size at which it stops being acceptable.

### Off-by-one boundary

The loop handles the middle and drops the first element, or reads one past the end and compares against `undefined`. The symptom is a wrong answer only on inputs of length zero, one, or two, or when the match is at either end. The cause is an interval whose convention was never written: `right` is inclusive on one line and exclusive on the next, or `hi` is the last index in one branch and the length in another.

State the interval in a comment next to the loop: `left` inclusive, `right` exclusive, empty when `left === right`. Then test the empty input, the single element, the pair, and a match at each end. Those five cases catch more off-by-ones than a hundred random ones, because the bug lives at the boundary you never named. If the oracle test is already in place, it prints the shortest failing input, which is almost always one of those five.

### Optimization changes behavior

The fast version passes the tests you wrote for it and disagrees with the slow version on an input you did not write down. The symptom is a green test file and a wrong answer in production. The cause is that the tests were written from the fast version's point of view, with inputs chosen to show it working.

Keep the slow function. Run both on the same generated cases, with a seed, and assert they agree. When they differ, the fast one is wrong until you can explain the case, because the slow one is the definition. Delete the oracle only after the comparison has survived the cases you were afraid of, and even then, consider leaving it in the file under its `Slow` name with the measurement that justified replacing it.

## Your turn

In `~/projects/typescript-practice`, extend `src/patterns.ts` and `tests/patterns.test.ts`. Run `npm test` after each step.

1. Add `lowerBound(values: number[], target: number): number` over a half-open interval, as described in the idea section, with the invariant as a comment. Tests: `lowerBound([], 3)` is `0`, `lowerBound([1, 3, 3, 7], 3)` is `1`, `lowerBound([1, 3, 7], 9)` is `3`. Then run `node src/bench-search.ts` and keep the three lines.
2. Add `areAnagrams(a: string, b: string): boolean` with a `Map<string, number>`, returning `false` early on a length mismatch and the moment a count would go below zero. `areAnagrams('listen', 'silent')` is `true`; `areAnagrams('aab', 'abb')` is `false`; two empty strings are `true`. Write `areAnagramsSlow` as sort-and-compare, O(n log n), and an oracle test over generated strings from a three-letter alphabet.
3. Add `pairWithSum(sorted: number[], target: number): [number, number] | null` with two pointers. `pairWithSum([1, 2, 3, 4, 6], 6)` is `[1, 3]`; an empty array gives `null`. The oracle is the nested loop over every pair; generate arrays, sort them with a numeric comparator, and compare. Then feed the fast version an unsorted array on purpose and watch the oracle test fail, which is the sort condition proving it matters. Remove that case.
4. Add `fibMemo(n: number, memo = new Map<number, number>()): number`. `fibMemo(10)` is `55`, `fibMemo(50)` is `12586269025`. Write `fibSlow` without the memo and time both at `n = 30` with `performance.now()` in a scratch file you do not commit; the slow one takes long enough to notice, the memoized one does not.
5. Run `[10, 9, 1].sort()` in `node` once and write the result in a comment above `areAnagramsSlow`. Every sort in this file passes a comparator from now on.
6. Run `npx tsc --noEmit` and read silence, then `npx tsc` and `node dist/bench-search.js`, and confirm the compiled program prints the same `agree true` lines.

If a generated test prints a failing input you cannot explain, shrink it by hand: remove one element at a time until it passes, and the last element you removed is the case your invariant does not cover.

## The quest

![](diagram:session-9-3/fig3-evidence)

The deliverable is `src/answers.ts`, six functions each with a `Slow` oracle beside it, `tests/answers.test.ts` with one seeded agreement test and one expected-outputs test, and `ALGORITHMS.md` describing each solution in the six-step form from the idea section: the inputs and edge cases, the matched pattern and its condition, the plan, the invariant as written in the code, the hand trace of one small input, and the time and space of both versions. Statements and expected outputs only; the answer key is at the end of this page.

1. **Contains duplicate.** `containsDuplicate([1, 2, 3, 1])` is `true`; `[]` is `false`. Fast: a `Set`. Slow: every pair.
2. **Merge two sorted arrays.** `mergeSorted([1, 4, 9], [2, 3, 10])` is `[1, 2, 3, 4, 9, 10]`. Fast: two pointers, O(n + m). Slow: concatenate and sort with a comparator.
3. **Move zeroes.** `moveZeroes` rearranges in place so `[0, 1, 0, 3, 12]` becomes `[1, 3, 12, 0, 0]`, order of the non-zero values preserved. Fast: a write index, O(1) extra space. Slow: filter the non-zeroes and append the zeroes into a new array.
4. **Balanced brackets.** `isBalanced('([]{})')` is `true`, `isBalanced('(]')` is `false`, `isBalanced('')` is `true`, and any character outside the six brackets makes it `false`. Fast: your `Stack` or an array. Slow: repeatedly delete `()`, `[]`, and `{}` until nothing changes, then check for an empty string.
5. **Best single trade.** `maxProfit([7, 1, 5, 3, 6, 4])` is `5`, buying at 1 and selling at 6; `[7, 6, 4, 3, 1]` is `0`. Fast: one pass tracking the lowest price so far. Slow: every buy day against every later sell day.
6. **Rotate right.** `rotateRight(nums, k)` in place: `[1, 2, 3, 4, 5, 6, 7]` by `3` becomes `[5, 6, 7, 1, 2, 3, 4]`; an empty array stays empty for any `k`; `k` larger than the length wraps. Fast: three reversals, O(1) extra space. Slow: pop and unshift `k` times into a copy.

Evidence to keep:

- The `ℹ pass` and `ℹ fail` lines from `npm test`, with the agreement test running at least four hundred seeded rounds.
- `ALGORITHMS.md` with six entries, each naming the condition that makes its pattern safe and the input size at which the slow version stops being acceptable, from a measurement you ran or a growth argument you wrote.
- The three lines from `node src/bench-search.ts`.
- One sentence per problem on which boundary case the oracle test found before you did, or the sentence "none, and here are the five boundary cases I had already written".

Push to `typescript-practice`. The comparison habit, slow beside fast and a seeded test between them, is the one to carry into the capstone when a query gets clever.

## Side quests

The which-pattern-when sheet is the table of conditions this session kept asking you to say out loud, and the two-pointers and sliding-window sheets are the two patterns whose conditions are easiest to forget, each with the inputs that break them.

## Before next session

Next session leaves the editor for a document: the system design of your capstone, written from `docs/product-spec.md` with a workload estimate, a diagram you can defend, a failure walkthrough, and one recorded decision. Reread `COMPLEXITY.md` and `ALGORITHMS.md` once, because the estimate you will write is the same growth argument applied to users and requests instead of array elements. Nothing is running between sessions. You arrive with the six answers tested, the bench lines kept, and the capstone repository from Unit 8 ready to receive one more file under `docs/`.

### The answer key, for after you have tried

Compare against yours; if yours passes the same seeded test, keep it and write down the difference.

```ts
export function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const n of nums) {
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}

export function mergeSorted(a: number[], b: number[]): number[] {
  const out: number[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) { out.push(a[i]); i += 1; } else { out.push(b[j]); j += 1; }
  }
  return out.concat(a.slice(i), b.slice(j));
}

export function moveZeroes(nums: number[]): void {
  let insertAt = 0;
  for (let i = 0; i < nums.length; i += 1) {
    if (nums[i] !== 0) { nums[insertAt] = nums[i]; insertAt += 1; }
  }
  while (insertAt < nums.length) { nums[insertAt] = 0; insertAt += 1; }
}

export function isBalanced(s: string): boolean {
  const closers: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch);
    else if (ch in closers) { if (stack.pop() !== closers[ch]) return false; }
    else return false;
  }
  return stack.length === 0;
}

export function maxProfit(prices: number[]): number {
  let lowest = Infinity;
  let best = 0;
  for (const price of prices) {
    if (price < lowest) lowest = price;
    else best = Math.max(best, price - lowest);
  }
  return best;
}

export function rotateRight(nums: number[], k: number): void {
  if (nums.length === 0) return;
  const shift = k % nums.length;
  const reverse = (start: number, end: number): void => {
    while (start < end) { [nums[start], nums[end]] = [nums[end], nums[start]]; start += 1; end -= 1; }
  };
  reverse(0, nums.length - 1);
  reverse(0, shift - 1);
  reverse(shift, nums.length - 1);
}
```

The oracles are the nested loop, `a.concat(b).sort((x, y) => x - y)`, `filter` plus `filter`, the replace-until-stable loop, the two-day nested loop, and `k` rounds of `pop` and `unshift` on a copy. The one that bites is `rotateRight` with an empty array: `k % 0` is `NaN`, and the early return is the fix.
