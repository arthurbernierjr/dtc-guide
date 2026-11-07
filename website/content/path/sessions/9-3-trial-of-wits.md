---
editorial: true
title: Trial of Wits
subtitle: Algorithm patterns and whiteboard practice
hook: "A pattern is not a trick to memorize. It is what the structure of the input allows. Today you write the slow version first, keep it as the oracle, and let it prove that the fast version you wrote next gives the same answers."
read: 55
artifact: "One sliding-window pair in typescript-practice: a brute-force oracle, a fast version with its invariant, a correct hand table, a seeded agreement test, a bench line, and the first entry of ALGORITHMS.md"
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

Today you solve one problem the way you will solve every problem at a whiteboard and in a code review: understand the input, write the obvious slow version, state what makes it slow, then write the fast version with its invariant beside the loop and a test that runs both on the same generated cases. The slow version is not wasted. It is the oracle. By the end you have one pair of solutions in `~/projects/typescript-practice`, a hand table you can trust, a sentence that stays true inside the loop, a measurement showing which one you would ship and at what size it starts to matter, and, if there is time after the pair, four smaller functions that rehearse the other patterns. The six-problem set is not today. It is [next session](/path/9-4-trial-of-patience/), once this one pair is solid.

> *A trial of wits is not won by knowing the answer. It is won by knowing how you would check one.*

## The idea

Every pattern is a consequence of a structure in the input. A frequency counter works because membership in a `Map` or `Set` is expected constant time, so counting things once replaces comparing every pair. Two pointers work when the input is sorted, or when moving one boundary can never throw away a valid answer. A sliding window works when the property of a contiguous range can be updated as one element enters and one leaves, which for a sum means the values are not negative. Binary search works when the answer space is ordered, so one comparison discards half of it. Memoization works when a subproblem's result depends only on its arguments, so a repeated call can be answered from a table. Say the condition out loud before you pick the pattern. If you cannot say it, you do not have the pattern yet; you have its name.

The method is the same for every problem, and it is worth doing in writing until it is reflex. Understand: what are the inputs, the output, and the cases at the edge, empty, one element, all the same, a match at each end. Match: which structure in the input makes which pattern safe. Plan: the slow version in two sentences, then the fast one. Implement: the slow version first, because it is the definition of correct. Review: walk one small input by hand through the fast version and watch the invariant hold. Evaluate: time and space for both, and the size at which the difference matters. Interviewers ask for this sequence out loud. Code reviewers ask for it in the commit message. The whiteboard and the pull request are the same exercise.

An invariant is a sentence that is true at the top of every iteration of a loop. For a sliding window that tracks a sum: `sum` is the total of `nums[left]` through `nums[right]` inclusive. For binary search over a half-open interval: the answer, if it exists, is at an index in `[lo, hi)`. For a frequency counter after the first pass: each count equals the number of times that key appeared. Write the sentence as a comment above the loop. Then check three things: it is true before the loop starts, each iteration keeps it true, and when the loop ends it gives you the answer. Most off-by-one errors are a loop whose invariant was never written down, so nobody noticed that `right` was inclusive in one line and exclusive in the next.

A hand trace is how you check the invariant before a test exists, and the form of the trace matters more than people admit. A paragraph that says "then the sum is 7, shrink, best 3" is easy to write and easy to get wrong, because nothing forces you to write down every variable at every step. A table does. One row per step, one column per variable, and a column for what the inner loop did. When a row disagrees with the code, you can point at the cell. When a paragraph disagrees with the code, you start over. Today the trace is a table first, and the paragraph form appears only once, as a thing to diagnose.

What you should be able to draw on a napkin: a small input worked by hand as a table, the sentence that stays true inside the loop, and a check of termination, correctness, and growth. Example, invariant, proof. The code is the last thing you write and the easiest thing to fix.

![](diagram:session-9-3/fig1-model)

### The oracle

The slow version is usually two nested loops or a sort followed by a scan. It is easy to read and easy to get right, and that is its value. Keep it in the same file, with `Slow` on the end of its name. Then write one test that generates a few hundred small random inputs, runs both versions, and asserts they agree. When they disagree, the fast one is wrong until you can explain the case, because the slow one is the definition. The test will find the case you did not think of, usually an empty array or a run of equal values, and it will print the input that broke, which is more than a hand-picked example ever gives you.

Deterministic randomness matters for a test that runs on another machine. A tiny linear congruential generator, one line that multiplies the previous number, adds a constant, and keeps the remainder, with a fixed seed produces the same five hundred cases every time, so a failure is reproducible from the seed alone. `Math.random` is fine while you explore and wrong for a test you commit.

### Frequency counter, two pointers, window

A frequency counter is a `Map` from value to count, or a `Set` when you only need membership. Anagrams: count the characters of one string, subtract the characters of the other, and refuse the moment a count would go below zero. Two sum on an unsorted array: for each number, check whether the complement is already in the map, then add the number. Both are O(n) time and O(n) space, replacing an O(n²) pair comparison. The space is the price; name it.

Two pointers is two indexes walking an array under a rule that guarantees nothing valid is skipped. On a sorted array, a pair that sums to a target can be found with `left` at the start and `right` at the end: if the sum is too small, only moving `left` up can help, because `right` already holds the largest remaining value. That sentence is the proof, and it depends on the sort. A slow and a fast pointer over the same array is the shape for removing duplicates in place from sorted input, and for reversing a linked list with `previous`, `current`, and `next`, which you wrote last session.

A sliding window is a contiguous range that grows at the right and shrinks at the left, with some state updated incrementally. For the shortest run whose sum reaches a target, extend `right` and add; while the sum is at least the target, record the length and shrink from the left. This is O(n) because each index enters the window once and leaves once. It is only correct when shrinking the window cannot increase the sum, which means every value is at least zero. Write that condition in the function's comment. With negative numbers the window pattern gives wrong answers, confidently, and the oracle test is how you find out.

### Binary search and the half-open interval

Binary search finds a position in an ordered array by halving. The version worth memorizing is the lower bound: the first index whose value is at least the target, over a half-open interval `[lo, hi)`. `lo` starts at 0, `hi` at the length, and the loop runs while `lo < hi`. `mid` is `lo + floor((hi - lo) / 2)`. If `values[mid] < target`, the answer is to the right, so `lo = mid + 1`. Otherwise `mid` might be the answer, so `hi = mid`. When the loop ends, `lo` is the first position where the target would fit. On an empty array it returns 0. On a target past the end it returns the length. On duplicates it returns the first one. One function answers "is it here," "where does it go," and "where does the run start," which is why this is the form to keep.

The reason for the half-open convention is that `hi = mid` and `lo = mid + 1` can never skip an index or loop forever, and the empty interval is `lo === hi`, a condition you can read. Mixing an inclusive `right` with a length computation written for an exclusive one is the oldest off-by-one, and it survives small tests because a few inputs happen to work.

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

### The hand table

Review by hand with `7` and `[2, 3, 1, 2, 4, 3]`, as a table, before any sentence about it. One row per value of `right`. The `added` column is `nums[right]`, `sum` is the total after adding it, and the last column records every pass through the `while` loop as three numbers: `left` after the shrink, `sum` after the shrink, and `best` after the length was recorded. `left` starts at 0 and `best` starts at infinity.

| step | right | added | sum | while sum ≥ 7: left, sum, best |
|---|---|---|---|---|
| 1 | 0 | 2 | 2 | not entered |
| 2 | 1 | 3 | 5 | not entered |
| 3 | 2 | 1 | 6 | not entered |
| 4 | 3 | 2 | 8 | length 4; left 1, sum 6, best 4 |
| 5 | 4 | 4 | 10 | length 4; left 2, sum 7, best 4. Then length 3; left 3, sum 6, best 3 |
| 6 | 5 | 3 | 9 | length 3; left 4, sum 7, best 3. Then length 2; left 5, sum 3, best 2 |

The loop ends after step 6 with `best` at 2, which is the run `[4, 3]` at indexes 4 and 5. Read the invariant against the rows. After every row, `sum` is the total of `nums[left]` through `nums[right]`: in row 5, `left` 3 and `right` 4 is `[2, 4]`, which sums to 6, and the cell says 6. After every row, `sum` is below 7, because the `while` loop only stops when it is. Each shrink records the length before dropping the left element, which is why row 6 records 3 and then 2 rather than 2 and then 1. Every number in the table is one the code computes, and if your table and the code ever disagree on a cell, one of them is wrong and the cell tells you where to look.

Rows 5 and 6 are the rows that matter. Each one enters the `while` loop twice. After the first shrink the sum is exactly 7, which still reaches the target, so the loop runs again.

### A trace with one mistake

Here is the same input traced as prose, the way most people trace at a whiteboard. It contains one mistake. Find it before reading on.

`right` 0: sum 2. `right` 1: sum 5. `right` 2: sum 6. `right` 3: sum 8, reaches 7: length 4, best 4; drop `nums[0]`, sum 6, `left` 1. `right` 4: sum 10, reaches 7: length 4, best 4; drop `nums[1]`, sum 7, `left` 2. `right` 5: sum 10, reaches 7: length 4, best 4; drop `nums[2]`, sum 9, `left` 3. End of the array. Answer 4.

**Stop. Find the mistake in the trace above, and name the row of the table it disagrees with, before you read the next paragraph.**

The mistake is at `right` 4. After dropping `nums[1]` the sum is 7, which still reaches the target, and the `while` loop must run again: length 3, best 3, drop `nums[2]`, sum 6, `left` 3. The trace moved to the next `right` instead. Everything after that is consistent with the mistake and wrong because of it: `right` 5 starts from the wrong `left`, measures a window of 4 instead of 3, shrinks once instead of twice, and the answer comes out 4 instead of 2. One skipped re-check cost two lengths. Compare the trace with row 5 of the table: the table has two shrinks in that row, the trace has one. The behaviour the trace describes is exactly the code with `if (sum >= target)` in place of `while (sum >= target)`, which is the version you break on purpose next session. A hand trace that shrinks "once" is a hand trace of a different program.

That is why the table comes first. The paragraph could only be checked by writing the table anyway.

### Evaluate, then test

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

`npm test` prints the pass count two higher than before. The third argument to `assert.equal` is the message, so a disagreement prints the exact `target` and `nums` that caused it. The last assertion is the hand table's answer, so the table and the test now say the same thing, and the code agrees with both.

### Measure

Then measure, because the growth claim is a claim. `src/bench-window.ts` times both versions at three sizes, with a target no run can reach, which is the worst case for the slow version because every start scans to the end:

```ts
import { minSubarrayLen, minSubarrayLenSlow } from './patterns.ts';

for (const n of [1_000, 4_000, 16_000]) {
  const nums = Array.from({ length: n }, (_, i) => (i * 7919) % 10);
  const target = 10 * n;
  let start = performance.now();
  const slow = minSubarrayLenSlow(target, nums);
  const slowMs = performance.now() - start;
  start = performance.now();
  const fast = minSubarrayLen(target, nums);
  const fastMs = performance.now() - start;
  console.log(`n = ${String(n).padStart(5)}  slow ${slowMs.toFixed(1).padStart(7)} ms  window ${fastMs.toFixed(2).padStart(6)} ms  agree ${slow === fast}`);
}
```

`node src/bench-window.ts` prints, on the machine this page was written on:

```text
n =  1000  slow     0.9 ms  window   0.09 ms  agree true
n =  4000  slow     8.6 ms  window   0.02 ms  agree true
n = 16000  slow   117.2 ms  window   0.06 ms  agree true
```

Four times the input, roughly sixteen times the slow time: that is the square. The window line barely moves, and the first line is the noisy one, as it was in last session's bench. The `agree` column is the oracle again, inline: both functions gave the same answer on the same input. Growth and a stopwatch, side by side, which is the evidence this session wants. `performance.now()` is the same global you used last session, documented on the [perf_hooks page](https://nodejs.org/api/perf_hooks.html).

Here is a small model you can run here: the window in plain JavaScript, written so that it returns the rows of the table above instead of only the answer. It checks the rows against the hand table, checks the invariant after every step, shows that the mistake from the diagnosis trace gives a worse answer, and runs the seeded comparison against the slow version. It proves that the table on this page is the table the code produces. It does not measure anything; the timings above are only true on your machine, from `node src/bench-window.ts`.

```js run=checkpoint-9-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

// One row per right index: what was added, the sum, and every shrink the
// while loop made as [left after, sum after, best after].
function windowTable(target, nums) {
  const rows = [];
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right];
    const row = { step: right + 1, right: right, added: nums[right], sum: sum, shrinks: [] };
    while (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left += 1;
      row.shrinks.push([left, sum, best]);
    }
    rows.push(row);
  }
  return { rows: rows, best: best === Infinity ? 0 : best };
}

const demo = windowTable(7, [2, 3, 1, 2, 4, 3]);
const hand = [
  [1, 0, 2, 2, []],
  [2, 1, 3, 5, []],
  [3, 2, 1, 6, []],
  [4, 3, 2, 8, [[1, 6, 4]]],
  [5, 4, 4, 10, [[2, 7, 4], [3, 6, 3]]],
  [6, 5, 3, 9, [[4, 7, 3], [5, 3, 2]]]
];
check(demo.rows.length === hand.length, 'six rows, one per right index');
for (let i = 0; i < hand.length; i += 1) {
  const row = demo.rows[i];
  const want = hand[i];
  const same = row.step === want[0] && row.right === want[1] && row.added === want[2] && row.sum === want[3] &&
    JSON.stringify(row.shrinks) === JSON.stringify(want[4]);
  check(same, 'row ' + want[0] + ' matches the hand table');
}
check(demo.best === 2, 'best is 2, the run [4, 3]');

// Invariant: sum is the total of nums[left .. right] inclusive, and the loop
// only shrinks while that total is at least the target.
function invariantHolds(target, nums) {
  let left = 0;
  let sum = 0;
  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right];
    while (sum >= target) {
      sum -= nums[left];
      left += 1;
    }
    let direct = 0;
    for (let i = left; i <= right; i += 1) direct += nums[i];
    if (direct !== sum) return false;
    if (sum >= target) return false;
  }
  return true;
}
check(invariantHolds(7, [2, 3, 1, 2, 4, 3]), 'after each step sum equals nums[left..right] and is below the target');

// The mistake from the diagnosis trace: shrinking once per step instead of
// while the sum still reaches the target.
function minSubarrayLenOnce(target, nums) {
  let left = 0;
  let sum = 0;
  let best = Infinity;
  for (let right = 0; right < nums.length; right += 1) {
    sum += nums[right];
    if (sum >= target) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left];
      left += 1;
    }
  }
  return best === Infinity ? 0 : best;
}
check(minSubarrayLenOnce(7, [2, 3, 1, 2, 4, 3]) === 4, 'shrinking one step too few answers 4, not 2');
check(minSubarrayLenOnce(7, [2, 3, 1, 2, 4, 3]) > demo.best, 'the mistake gives a worse answer than the table');

function minSubarrayLenSlow(target, nums) {
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

let seed = 7;
function random(limit) {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed % limit;
}

let agreed = 0;
let caughtOnce = 0;
for (let round = 0; round < 300; round += 1) {
  const nums = Array.from({ length: random(12) }, () => random(10));
  const target = 1 + random(30);
  const fast = windowTable(target, nums).best;
  const slow = minSubarrayLenSlow(target, nums);
  if (fast !== slow) throw new Error('disagree on ' + JSON.stringify({ target, nums }));
  if (!invariantHolds(target, nums)) throw new Error('invariant broke on ' + JSON.stringify({ target, nums }));
  if (minSubarrayLenOnce(target, nums) !== slow) caughtOnce += 1;
  agreed += 1;
}
check(agreed === 300, 'the window agrees with the slow version on 300 generated cases');
check(caughtOnce > 0, 'the generated cases catch the one-shrink mistake ' + caughtOnce + ' times');

console.log('ok: checkpoint-9-3');
```

The last line before `ok` is worth reading twice. The seeded cases catch the one-shrink mistake dozens of times, and the hand-picked boundary cases would catch it only once, on the table's own input. A generator finds the inputs you did not think to write.

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

First, the stop line from The quest below, so you read it before this list and not after it: today's deliverable is the one window pair, `minSubarrayLenSlow` beside `minSubarrayLen`, with its tests, its bench lines, and its entry in `ALGORITHMS.md`. Finish that pair before anything here. The six steps below are practice for after the pair, optional today and fair game in a later sitting, and the quest needs none of them. In `~/projects/typescript-practice`, extend `src/patterns.ts` and `tests/patterns.test.ts`. Each step rehearses one more pattern from the idea section on a function small enough to trace by hand. Run `npm test` after each step. Step 1 also needs a second bench, `src/bench-search.ts`, which times ten thousand lookups through the binary search you are about to write against a linear scan, at three sizes:

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

1. Add `lowerBound(values: number[], target: number): number` over a half-open interval, as described in the idea section, with the invariant as a comment. Tests: `lowerBound([], 3)` is `0`, `lowerBound([1, 3, 3, 7], 3)` is `1`, `lowerBound([1, 3, 7], 9)` is `3`. Then run `node src/bench-search.ts` and keep the three lines. On the machine this page was written on they were `n =   1000  linear      2.1 ms  binary    4.7 ms  agree true`, then `11.4` against `1.7` at ten thousand, then `326.1` against `1.7` at a hundred thousand. Read the first line before the last: at a thousand elements the linear scan wins, because the engine is still warming up and a short scan is cheap. At a hundred thousand the scan is two hundred times slower and the binary search has not moved.
2. Add `areAnagrams(a: string, b: string): boolean` with a `Map<string, number>`, returning `false` early on a length mismatch and the moment a count would go below zero. `areAnagrams('listen', 'silent')` is `true`; `areAnagrams('aab', 'abb')` is `false`; two empty strings are `true`. Write `areAnagramsSlow` as sort-and-compare, O(n log n), and an oracle test over generated strings from a three-letter alphabet.
3. Add `pairWithSum(sorted: number[], target: number): [number, number] | null` with two pointers. `pairWithSum([1, 2, 3, 4, 6], 6)` is `[1, 3]`, the indexes of the values `2` and `4`, because the function returns indexes, not values; an empty array gives `null`. The oracle is the nested loop over every pair; generate arrays, sort them with a numeric comparator, and compare. Then feed the fast version an unsorted array on purpose and watch the oracle test fail, which is the sort condition proving it matters. Remove that case.
4. Add `fibMemo(n: number, memo = new Map<number, number>()): number`. `fibMemo(10)` is `55`, `fibMemo(50)` is `12586269025`. Write `fibSlow` without the memo and time both at `n = 30` with `performance.now()` in a scratch file you do not commit; the slow one takes long enough to notice, the memoized one does not.
5. Run `[10, 9, 1].sort()` in `node` once and write the result in a comment above `areAnagramsSlow`. Every sort in this file passes a comparator from now on.
6. Run `npx tsc --noEmit` and read silence, then `npx tsc`, `node dist/bench-window.js`, and `node dist/bench-search.js`, and confirm the compiled programs print the same `agree true` lines.

If a generated test prints a failing input you cannot explain, shrink it by hand: remove one element at a time until it passes, and the last element you removed is the case your invariant does not cover.

## The quest

![](diagram:session-9-3/fig3-evidence)

The deliverable is one pair, finished: `minSubarrayLenSlow` and `minSubarrayLen` in `src/patterns.ts`, the seeded agreement test and the boundary test in `tests/patterns.test.ts`, the three lines from `node src/bench-window.ts`, and a new file `ALGORITHMS.md` with its first entry, written in the six-step form from the idea section: the inputs and edge cases, the matched pattern and its condition, the plan, the invariant as written in the code, the hand table copied from this page and checked against your own run of `minSubarrayLen(7, [2, 3, 1, 2, 4, 3])` in `node`, which must return the table's final `best`, 2, and the time and space of both versions.

Before you write the entry, do one thing on paper. Take the first case your generator produces whose array is not empty. With seed 7 the first case is the empty array with target 1, a boundary the test covers anyway, and the second is `[2, 0, 6, 6]` with target 27. Run that second case through the table form by hand: four rows, the `while` loop never entered, `best` still infinity, answer 0. Then run it through `minSubarrayLenSlow` by hand: four starts, each scanning to the end without reaching 27, answer 0. When the two agree, you have done once, by hand, what the test does five hundred times. Write the case and both answers at the bottom of the entry.

Stop here. The six problems are next session, and so is the answer key. Today ends with one pair you can defend cell by cell, not six you can defend in outline.

Evidence to keep:

- The `ℹ pass` and `ℹ fail` lines from `npm test`, with the agreement test running at least five hundred seeded rounds.
- `ALGORITHMS.md` with one entry, naming the condition that makes the window safe and the input size at which the slow version stops being acceptable, from the bench you ran.
- The three lines from `node src/bench-window.ts`. The three from `node src/bench-search.ts` join them only if you did step 1 of Your turn, which is optional today.
- One sentence saying which cell of your own hand table you got wrong the first time, or the sentence "none; my table matched the page on the first pass".

Push to `typescript-practice`. The comparison habit, slow beside fast and a seeded test between them, is the one to carry into the capstone when a query gets clever.

## Side quests

The which-pattern-when sheet is the table of conditions this session kept asking you to say out loud, and the two-pointers and sliding-window sheets are the two patterns whose conditions are easiest to forget, each with the inputs that break them.

## Before next session

Next session is the problem set this one made room for: six problems, each solved slowly and then fast, each with a seeded test between the two versions, and each worked the way the window was worked today, restate, smallest example, brute force, pattern from its tell, invariant, oracle, bench. The first one, the best single trade, is traced for you as a table; the other five are yours, in order. What is tested is the method, not the memory: a prediction written before each run and an invariant written before each loop. Keep `src/patterns.ts` and `tests/patterns.test.ts` open when you start, because the test shape is copied from them into `src/answers.ts` and `tests/answers.test.ts`, and the generator goes with it with one small change that next session explains, and the first thing you break on purpose is the `while` in `minSubarrayLen`. Nothing is running between sessions. You arrive with the window pair tested, the two bench outputs kept, `ALGORITHMS.md` holding one entry, and `npm test` green.
