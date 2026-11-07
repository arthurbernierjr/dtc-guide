---
editorial: true
title: Trial of Patience
subtitle: Attacking a problem you have not seen
hook: "Six problems you have not seen, one method you have. Today you take the best single trade from a restatement to a bench line, pause when the fast version agrees with the brute force on paper, and then run the same method five more times without the page holding your hand."
read: 55
artifact: "Six solved problems in typescript-practice, each with a brute-force oracle, a prediction written before the run, an invariant written before the loop, a seeded agreement test, and a boundary report"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://nodejs.org/api/test.html
  - https://nodejs.org/api/assert.html
  - https://nodejs.org/api/perf_hooks.html
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
say:
  - "Restate the problem in your own words before you touch the keyboard."
  - "The brute force is the definition; write it first and keep it."
  - "Write the prediction down, then run; the gap between them is the lesson."
---

## The hook

Last session you worked one problem all the way through: the sliding window, with a hand table you could check cell by cell, a trace with a mistake you found, an oracle that agreed on five hundred seeded cases, and a bench line that showed the square. You also learned why the table comes before the paragraph. What you have not done yet is start from nothing. A problem you have never seen does not arrive with its pattern named, and the hardest moment is the first one, when the page is blank and the pattern list in your head is no help because you do not know which row applies.

Today is that moment, six times across more than one sitting, with the page beside you for the first and out of the way for the rest. The method has seven moves: restate the problem in your own words, work the smallest example by hand, write the brute force and keep it, name the pattern from the tell in the restatement, write the invariant before the loop, run the oracle, then bench. The best single trade is worked for you in that order, with one deliberate pause after the fast version agrees with the brute force on paper and before anything runs. Then the other five are yours, in order, and the proof that you did them is the same proof as last session: `npm test` green, the bench lines kept, and a sentence per problem about which boundary the oracle found before you did, or the honest sentence that it found none.

> *Patience is not waiting. It is doing the slow version first when you can already see the fast one.*

## The idea

A problem you have not seen is a reading task before it is a coding task. The statement was written by someone who knew the answer, and it hides the tell, the one phrase that says which structure in the input makes a fast version safe, inside ordinary words. "Later day" means order matters, so sorting is out. "Contiguous" means a window might apply. "Sorted" means two pointers or halving might apply. "In place" means a write index, not a new array. "Most recent first" means a stack. You cannot see the tell until you have restated the problem in your own words, because the restatement is where you notice which words you were about to drop. Write one sentence that says what goes in, what comes out, and what is allowed to change. If the sentence has a word you cannot define, the problem is not understood yet.

Then work the smallest example by hand. Not the example on the page, which was chosen to look convincing; the smallest one that is not trivial. Two prices. Two sorted arrays of one element each. A string of two brackets. The small example tells you what the output is when there is almost nothing to do, and that is the boundary you will otherwise forget, because the first test you write is always a medium example in which everything goes right.

The brute force is next, and it is the move people skip because they can already see the fast version. Do not skip it. The brute force is the definition of the answer, written as code. It is the only version you will be sure of, and it is the oracle for every version that comes later. For most problems it is two nested loops, or a sort and a scan, and it takes five minutes. The fast version without the brute force beside it is a guess with tests written from its own point of view, which is the third failure from last session.

### Naming the pattern from the tell

Now, and only now, match the pattern. You already have the list from last session: frequency counter, two pointers, window, binary search, memoized recursion, and a stack for anything that nests. The question is not "which pattern is this problem" but "which structural fact in the restatement makes which pattern safe". The best single trade says "buy on one day, sell on a later day". The tell is "later": for each sell day, the best buy is the lowest price before it. That sentence is a single pass with one remembered value, a running minimum. It is not on the pattern list by name, and it does not need to be: the list is a set of consequences, and this one follows from the tell the same way. The pattern follows from the fact. If you had reached for a sort because "lowest and highest" sounded like the ends of a sorted array, you would have thrown away the order, and the order is the whole problem.

Write the invariant before the loop. For the running minimum: at the top of each iteration, `lowest` is the smallest price among the days already seen, and `best` is the best profit whose sell day was already seen. Check it three ways, as you did last session: true before the loop starts, with `lowest` at infinity and `best` at 0; kept true by each iteration; and giving the answer when the loop ends, because then every day has been seen. An invariant you cannot write is a loop you do not understand yet, and the honest move is to go back to the brute force and the small example until you can.

### The oracle, the pause, and the bench

The oracle is the seeded agreement test from last session, copied into the new file with one change explained below. Before you run it, there is a pause, and it is the part of the method that makes this session different from a list of exercises. Take the first generated case, the one your seed produces first, and run it by hand through both versions: the brute force by listing the pairs, the fast version as a table. When the two agree on paper, stop. Do not type. Write the prediction: the pass count you expect from `npm test`, the one assertion you think is most likely to fail if your invariant is wrong, and the shape you expect from the bench, a square against a line. Then run. The gap between the prediction and the output is the lesson, and if there is no gap, that is a lesson too, the one that says the method worked.

The bench is the last move, and it is the same `performance.now()` as the three benches you already have, `bench.ts`, `bench-window.ts`, and `bench-search.ts`, at the three sizes `bench-window.ts` used. For a brute force that is O(n²), four times the input is sixteen times the time, and you read the last two lines, not the first.

What you should be able to draw on a napkin: Restate, Brute force, Pattern, Prove. The restatement finds the tell. The brute force is the definition. The pattern is the consequence of the tell. The proof is the invariant, the oracle, and the bench, in that order. The four boxes are the seven moves grouped: Restate holds the restatement and the smallest example, Brute force is the third move, Pattern is the fourth, and Prove holds the invariant, the oracle, and the bench. Every problem in the set goes through the same four boxes, and the only thing that changes is how long you spend in each.

![](diagram:session-9-4/fig1-model)

### A better generator

Last session's generator returned `seed % limit`. It is correct and deterministic, and its first case was the empty array, its second had a zero in it, and its first three lengths were small. That is because the low bits of that multiplier cycle quickly, so taking the remainder reads the weakest part of the number. Today the generator is a factory, `seeded(seed)`, that returns a function reading the high bits, `Math.floor(seed / 65536) % limit`. Each problem's test calls `seeded(7)` for its own generator, so the cases for one problem do not depend on how many cases another problem drew, and the first case for the best single trade is the same on your machine as on this page. That is what makes the pause possible: the case you work on paper is the case the test runs first.

## The demonstration

Everything is in `~/projects/typescript-practice`, in two new files beside last session's: `src/answers.ts` for the six solutions and their oracles, and `tests/answers.test.ts` for the tests. `npm test` still means `node --test`, and the runner finds the new file by its name.

**Restate.** Given a list of prices, one per day, choose one day to buy and a later day to sell so that the profit is as large as possible; if no later day has a higher price, the profit is 0. In: an array of numbers. Out: one number, never negative. Nothing changes; the array is read only. The tell is "later".

**Smallest example.** Two prices. `[1, 5]` is 4. `[5, 1]` is 0, because the only later day is lower. One price is 0, because there is no later day. No prices is 0. Those four lines are the boundary test, written before any loop exists.

**Brute force.** Every buy day against every later sell day, keep the largest difference, never below 0. Fifteen pairs for six prices, `n(n - 1) / 2` in general, so O(n²) time and O(1) space.

```ts
// Best single trade: buy once, sell once on a later day.
export function maxProfitSlow(prices: number[]): number {
  let best = 0;
  for (let buy = 0; buy < prices.length; buy += 1) {
    for (let sell = buy + 1; sell < prices.length; sell += 1) {
      best = Math.max(best, prices[sell] - prices[buy]);
    }
  }
  return best;
}
```

`sell` starts at `buy + 1`, not at `buy`, which is the "later" in the restatement written as a loop bound. Starting at `buy` would be harmless here because the difference is 0, but on a different problem the same slip is the off-by-one in the diagnosis section, so write the bound you mean.

**Pattern from the tell.** For any sell day, the best buy is the lowest price on an earlier day. Walk the days once; remember the lowest price so far; on each day, the profit if you sold today is today's price minus that lowest; keep the best. One pass, two variables, O(n) time, O(1) space.

```ts
export function maxProfit(prices: number[]): number {
  // Invariant: lowest is the smallest price among the days already seen, and
  // best is the best profit whose sell day has already been seen.
  let lowest = Infinity;
  let best = 0;
  for (const price of prices) {
    if (price < lowest) lowest = price;
    else best = Math.max(best, price - lowest);
  }
  return best;
}
```

The `else` is doing quiet work. A price that is a new lowest cannot also be a sell day worth recording, because selling at the lowest price so far gives at most 0, which `best` already holds. Writing it as two separate `if` statements is also correct and does one more subtraction per day; either way the invariant holds, and the comment above the loop is the thing a reader checks first.

**Hand table.** `[7, 1, 5, 3, 6, 4]`, one row per day. The `lowest` and `best` columns are the values after the row's work, and the `profit` column is `price - lowest` on the days the `else` branch ran.

| step | price | branch | profit if sold today | lowest | best |
|---|---|---|---|---|---|
| 1 | 7 | new lowest | not computed | 7 | 0 |
| 2 | 1 | new lowest | not computed | 1 | 0 |
| 3 | 5 | sell | 4 | 1 | 4 |
| 4 | 3 | sell | 2 | 1 | 4 |
| 5 | 6 | sell | 5 | 1 | 5 |
| 6 | 4 | sell | 3 | 1 | 5 |

The answer is 5, buying at 1 on day 2 and selling at 6 on day 5. Read the invariant against row 4: the days already seen are `7, 1, 5`, the lowest among them is 1, and the best profit with a sell day among them is 4, from day 3. Both cells agree. The brute force on the same input lists fifteen differences, and the largest non-negative one is `6 - 1`. Same answer, two definitions.

**The pause.** The first case `seeded(7)` produces, with a length of `2 + random(5)` and prices from `random(10)`, is `[6, 9, 5, 6, 0, 4]`. Brute force on paper: the largest later-minus-earlier difference is `4 - 0`, so 4. One pass as a table: 6 is a new lowest; 9 sells for 3, best 3; 5 is a new lowest; 6 sells for 1; 0 is a new lowest; 4 sells for 4, best 4. They agree on 4. Stop here. Write the prediction into the test file as a comment before the test exists:

```ts
// fragment: prediction, written before the first run
// npm test: pass count rises by 2 (expected outputs, seeded agreement), fail stays 0.
// If the invariant is wrong it shows on a falling-then-rising array like [6, 9, 5, 6, 0, 4],
// where the best buy is not the first lowest.
// Bench: slow roughly x16 per x4 input; fast roughly x4 per x4 input, linear.
```

Only now does the test get written. `tests/answers.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maxProfit, maxProfitSlow } from '../src/answers.ts';

function seeded(seed: number): (limit: number) => number {
  return (limit: number): number => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return Math.floor(seed / 65536) % limit;
  };
}

test('maxProfit: expected outputs and boundaries', () => {
  assert.equal(maxProfit([7, 1, 5, 3, 6, 4]), 5);
  assert.equal(maxProfit([7, 6, 4, 3, 1]), 0);
  assert.equal(maxProfit([1, 5]), 4);
  assert.equal(maxProfit([5, 1]), 0);
  assert.equal(maxProfit([5]), 0);
  assert.equal(maxProfit([]), 0);
});

test('maxProfit agrees with the brute force on 400 generated arrays', () => {
  const random = seeded(7);
  for (let round = 0; round < 400; round += 1) {
    const prices = Array.from({ length: 2 + random(5) }, () => random(10));
    assert.equal(maxProfit(prices), maxProfitSlow(prices), JSON.stringify(prices));
  }
});
```

`npm test` prints a pass count two higher than it did after last session, and `ℹ fail 0`. Compare that with the prediction. If the count is right and nothing failed, the method worked and you say so. If the seeded test fails, the message is the array, and the array is the lesson: shrink it one element at a time until it passes, and the element you removed last is the case the invariant does not cover.

**Bench.** `src/bench-profit.ts`, three sizes, prices generated from a stride so the file has no dependency on the test's generator:

```ts
import { maxProfit, maxProfitSlow } from './answers.ts';

for (const n of [1_000, 4_000, 16_000]) {
  const prices = Array.from({ length: n }, (_, i) => (i * 7919) % 1000);
  let start = performance.now();
  const slow = maxProfitSlow(prices);
  const slowMs = performance.now() - start;
  start = performance.now();
  const fast = maxProfit(prices);
  const fastMs = performance.now() - start;
  console.log(`n = ${String(n).padStart(5)}  slow ${slowMs.toFixed(1).padStart(7)} ms  fast ${fastMs.toFixed(2).padStart(6)} ms  agree ${slow === fast}`);
}
```

`node src/bench-profit.ts` prints, on the machine this page was written on:

```text
n =  1000  slow     1.9 ms  fast   0.04 ms  agree true
n =  4000  slow     5.3 ms  fast   0.16 ms  agree true
n = 16000  slow    83.7 ms  fast   0.70 ms  agree true
```

Read the last two lines. Four times the input, sixteen times the slow time, and about four times the fast time: 0.04, 0.16, 0.70 is a line that grows with the input, which is what linear means, and it stays under a millisecond only because one pass over sixteen thousand numbers is cheap. It is not flat. Flat would be the same time at every size, and nothing that reads every element can be flat. The first line is warm-up noise, as it was in the three benches before it. The `agree` column is the oracle one more time, on an input far larger than the test ever generates. Compare with the prediction's last line, and write one sentence under the bench output saying whether the shape matched.

Here is a small model you can run here. It is the lower-bound search you wrote in last session's Your turn, with the linear scan from `bench-search.ts` as its oracle, placed beside this session's pair: the brute-force trade and the one-pass trade compared on three hundred seeded arrays, with the first three cases printed so you can check that the case you worked on paper is the case the model ran first. It proves the agreement and the boundaries. It does not measure anything; the bench lines are only true on your machine, from `node src/bench-profit.ts`.

```js run=checkpoint-9-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function seeded(seed) {
  return function random(limit) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return Math.floor(seed / 65536) % limit;
  };
}

// Last session's Your turn: the lower-bound search, with the linear scan as its oracle.
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

function lowerBoundSlow(values, target) {
  let i = 0;
  while (i < values.length && values[i] < target) i += 1;
  return i;
}

check(lowerBound([], 3) === 0, 'Empty interval');
check(lowerBound([1, 3, 3, 7], 3) === 1, 'First matching boundary');
check(lowerBound([1, 3, 7], 9) === 3, 'Insertion at the end');

const searchRandom = seeded(7);
let searches = 0;
for (let round = 0; round < 300; round += 1) {
  const values = Array.from({ length: searchRandom(9) }, () => searchRandom(10)).sort((a, b) => a - b);
  const target = searchRandom(12);
  if (lowerBound(values, target) !== lowerBoundSlow(values, target)) {
    throw new Error('search disagrees on ' + JSON.stringify({ values, target }));
  }
  searches += 1;
}
check(searches === 300, 'lowerBound agrees with the linear scan on 300 generated cases');

// This session's pair: the best single trade, brute force and one pass.
function maxProfitSlow(prices) {
  let best = 0;
  for (let buy = 0; buy < prices.length; buy += 1) {
    for (let sell = buy + 1; sell < prices.length; sell += 1) {
      best = Math.max(best, prices[sell] - prices[buy]);
    }
  }
  return best;
}

function maxProfit(prices) {
  // Invariant: lowest is the smallest price among the days already seen, and
  // best is the best profit whose sell day has already been seen.
  let lowest = Infinity;
  let best = 0;
  for (const price of prices) {
    if (price < lowest) lowest = price;
    else best = Math.max(best, price - lowest);
  }
  return best;
}

check(maxProfit([7, 1, 5, 3, 6, 4]) === 5, 'buy at 1, sell at 6');
check(maxProfit([7, 6, 4, 3, 1]) === 0, 'falling prices give 0');
check(maxProfit([]) === 0 && maxProfit([5]) === 0, 'empty and single give 0');

const profitRandom = seeded(7);
const firstThree = [];
let trades = 0;
for (let round = 0; round < 300; round += 1) {
  const prices = Array.from({ length: 2 + profitRandom(5) }, () => profitRandom(10));
  const slow = maxProfitSlow(prices);
  const fast = maxProfit(prices);
  if (round < 3) firstThree.push(JSON.stringify(prices) + ' -> ' + slow);
  if (slow !== fast) throw new Error('maxProfit disagrees on ' + JSON.stringify(prices));
  trades += 1;
}
console.log('first three generated cases: ' + firstThree.join('; '));
check(firstThree[0] === '[6,9,5,6,0,4] -> 4', 'the first generated case is the one worked on paper');
check(trades === 300, 'maxProfit agrees with the brute force on 300 generated arrays');

console.log('ok: checkpoint-9-4');
```

### The other five, in order

Each of these gets the same seven moves, and the order matters because each one leans on the one before it. The first, Contains duplicate, belongs to today's required sitting with the trade; the other four are scheduled sittings, and Your turn says how to schedule them. Write the restatement and the prediction before the code, every time. The statement and the tell are all the page gives you; the answer key at the end of this page is for after you have tried.

1. **Contains duplicate.** `containsDuplicate([1, 2, 3, 1])` is `true`; `[]` is `false`. The tell: "have I seen this value before" is membership, so a `Set`. Slow: every pair.
2. **Merge two sorted arrays.** `mergeSorted([1, 4, 9], [2, 3, 10])` is `[1, 2, 3, 4, 9, 10]`. The tell: both inputs are already sorted, so two pointers, one per array, and the smaller head goes out first. Slow: concatenate and sort with a numeric comparator.
3. **Move zeroes.** `moveZeroes` rearranges in place so `[0, 1, 0, 3, 12]` becomes `[1, 3, 12, 0, 0]`, with the order of the non-zero values preserved. The tell: "in place" and "order preserved" together mean a write index that never passes the read index. Slow: filter the non-zeroes, append the zeroes, copy back.
4. **Balanced brackets.** `isBalanced('([]{})')` is `true`, `isBalanced('(]')` is `false`, `isBalanced('')` is `true`, and any character outside the six brackets makes it `false`. The tell: the most recent opener must close first, so a stack, your `Stack` from two sessions ago or an array. Slow: repeatedly delete `()`, `[]`, and `{}` until nothing changes, then check for an empty string.
5. **Rotate right.** `rotateRight(nums, k)` in place: `[1, 2, 3, 4, 5, 6, 7]` by `3` becomes `[5, 6, 7, 1, 2, 3, 4]`; an empty array stays empty for any `k`; `k` larger than the length wraps. The tell: "in place" with O(1) extra space, and a rotation is a reversal of the whole followed by a reversal of each part. Slow: pop and unshift `k` times on a copy. Trace the three reversals by hand before the code. Take `[1, 2, 3, 4, 5]` with `k` 2, so the shift is 2. Reverse the whole array, indexes 0 to 4: `[5, 4, 3, 2, 1]`. Reverse the first two, indexes 0 to 1: `[4, 5, 3, 2, 1]`. Reverse the rest, indexes 2 to 4: `[4, 5, 1, 2, 3]`. Now the oracle on a copy: pop 5 and unshift it, `[5, 1, 2, 3, 4]`; pop 4 and unshift it, `[4, 5, 1, 2, 3]`. Same array. The first reversal puts the last `k` values at the front in the wrong order, and the two smaller reversals turn each part back the right way round.

For the two that change the array in place, the oracle has to compare whole arrays, not a summary, and both versions must receive their own copy of the input. `assert.deepEqual` from the [assert page](https://nodejs.org/api/assert.html) is the comparison; the strict import you already use makes it compare with `===` element by element.

## Where it breaks

![](diagram:session-9-4/fig2-diagnosis)

### Pattern applied too soon

The symptom is a fast version that passes the examples you chose and fails the oracle on an input you did not. For the trade, the version that sorts the prices and subtracts the smallest from the largest returns 6 for `[7, 1, 5, 3, 6, 4]`, because 7 comes before 1 and the sort hid that. For the window from last session, `minSubarrayLen(4, [2, 3, -5, 4])` returns 2 while the brute force returns 1, because shrinking past `-5` raised the sum and the loop stopped early. The cause is the same both times: the pattern was chosen from a word in the statement rather than from a fact about the input, and the fact was absent. Sorting needs order not to matter. The window needs non-negative values.

The fix is in the restatement. Go back to the one sentence and underline the word you dropped: "later" for the trade, "non-negative" for the window. Write the condition into the function's comment, where the next reader sees it before the loop, and add the input that broke it to the boundary test, so the condition is a test and not a memory. When the fact is genuinely absent, the fast version is a different problem, and the honest answer is the brute force plus a note on the size at which it stops being acceptable.

### Off-by-one at the boundary

The symptom is a wrong answer only when the input is empty, has one element, or has the answer at an end. `mergeSorted` returns the merged prefix and drops whatever was left in the longer array, because the loop stopped when one pointer ran out and nothing copied the tail. `rotateRight` on an empty array computes `k % 0`, which is `NaN`, and the reversal bounds become nonsense. `maxProfitSlow` with the inner loop starting at `buy` instead of `buy + 1` still passes, which is the dangerous kind of off-by-one: the one that happens not to matter on this problem and will on the next.

The cause is a bound that was never written as a sentence. The fix is to write it: "the inner loop runs over sell days strictly after the buy day"; "after the main loop, whichever array has elements left is appended whole"; "a rotation of an empty array is the empty array, returned before the modulus". Then test the five boundary cases, empty, one, two, match at the start, match at the end, before the seeded test, because the seeded test will find them eventually and the boundary test finds them now, with a name.

### An optimisation that changes behaviour

The symptom is a test that stays green while the output has changed in a way the test did not look at. `mergeSorted` with `<` instead of `<=` is still sorted and still passes any test that checks only numbers, but with equal keys it now takes the second array's element first, and if those elements were records with the same key and different payloads, the merge is no longer stable. `moveZeroes` done by swapping each zero with the last non-zero is still "zeroes at the end" and passes a test that counts zeroes, but the non-zero values are now out of order, which the statement forbade. A sort with no comparator is the oldest version of this: it still sorts, as strings.

The cause is an oracle that compares a summary instead of the whole output, or a restatement that never said whether order matters. The fix is two sentences and one assertion. In the restatement, say what must be preserved: order of equal keys, order of the non-zeroes, the caller's array. In the test, compare whole outputs with `deepEqual`, and for the in-place problems hand each version its own copy of the input. If a faster version changes the behaviour the restatement promised, it is not an optimisation; it is a different function, and it needs a different name.

## Your turn

In `~/projects/typescript-practice`. Run `npm test` after every step; the pass count only goes up, and `ℹ fail 0` is the line you are watching.

1. Create `src/answers.ts` and `tests/answers.test.ts`. Copy the `seeded` factory from the demonstration into the test file and the `test` and `assert` imports from `tests/patterns.test.ts`. Run `npm test` once with no tests in the new file. `node --test` counts a file that registers no tests as one passing test of its own, so the output has a new line, `✔ tests/answers.test.ts`, and `ℹ pass` is one higher than last session's count. That line goes away as soon as the file holds a real test.
2. The trade. Write the restatement as a comment at the top of `src/answers.ts`. Write `maxProfitSlow`. Work `[6, 9, 5, 6, 0, 4]` on paper through the pairs and through the one-pass table, and when they agree on 4, stop and write the prediction comment into the test file. Then write `maxProfit` with the invariant above the loop, add the two tests from the demonstration, and run `npm test`. The line you want is `ℹ pass` two higher than last session's count, with `ℹ fail 0`; the file's own line from step 1 is gone, replaced by the two tests. Under the prediction comment, write whether it matched.
3. Add `src/bench-profit.ts` and run `node src/bench-profit.ts`. Keep the three lines. Check the shape against the prediction: the slow column roughly sixteen times per four times the input, the fast column roughly four times, linear, not flat.
4. Break the window from last session on purpose. In `src/patterns.ts`, change `while (sum >= target)` to `if (sum >= target)` and run `npm test`. The boundary test fails on exactly one of its four cases, the hand table's input, and the seeded test fails first, printing `{"target":...,"nums":[...]}` for an input where the window needed to shrink twice. Put the `while` back and run again. Then run `node` and evaluate `minSubarrayLen(4, [2, 3, -5, 4])` and `minSubarrayLenSlow(4, [2, 3, -5, 4])`; write the two answers, 2 and 1, as a sentence in the window's entry of `ALGORITHMS.md`, under the condition that makes the pattern safe.
5. One independent problem, Contains duplicate, with the page out of the way: the restatement as a comment, the smallest example in the boundary test, `containsDuplicateSlow`, the prediction comment, the invariant comment, `containsDuplicate`, and a seeded test with its own `seeded(7)` and at least 400 rounds. `npm test` shows two more passes. Then stop. This is the required first sitting, the trade and one problem whose pattern you named yourself, and it is enough for one day. Before you close the editor, open `ALGORITHMS.md` and write a short "Scheduled" section under today's entries: the four remaining problems, in order, each with the date of the sitting you will give it, one or two problems per sitting. Do step 7 now, then push.
6. The remaining four, in order, in the sittings you scheduled: Merge two sorted arrays, Move zeroes, Balanced brackets, Rotate right. Each gets the same seven moves as step 5, its own `seeded(7)` and at least 400 rounds, and its entry in `ALGORITHMS.md`, and each one's row in the Scheduled section gets the word done beside the date. For `moveZeroes` and `rotateRight`, give each version `nums.slice()` and compare with `assert.deepEqual`. After each problem, `npm test` shows two more passes.
7. Run `npx tsc --noEmit` and read silence. Then `npx tsc` and `node dist/bench-profit.js`, and confirm the compiled program prints `agree true` three times. Run this step again at the end of every later sitting.

If a generated test prints a failing input you cannot explain, shrink it by hand: remove one element at a time until it passes, and the last element you removed is the case your invariant does not cover. If you cannot write an invariant for one of the five, go back to its brute force and its smallest example and stay there until you can. That is what the session's name means.

## The quest

![](diagram:session-9-4/fig3-evidence)

The deliverable today is `src/answers.ts` with `maxProfit` and `containsDuplicate` and their two `Slow` oracles, `tests/answers.test.ts` with an expected-outputs test and a seeded agreement test for each, `src/bench-profit.ts` with its output kept, and `ALGORITHMS.md` grown from last session's one entry to three, with a Scheduled section naming the four remaining problems and the date of the sitting for each. The deliverable when the schedule is done is the full set: six functions and six `Slow` oracles, a pair of tests per problem, and seven entries, the six new ones each in the seven-move form this session used: the restatement with its inputs and edge cases, the smallest example worked by hand, the brute force and its cost, the matched pattern and the tell that named it, the invariant as written in the code, the oracle's result with the hand trace of one small input as a table, and the bench or growth argument giving the time and space of both versions. The trade's entry also carries the prediction and whether it matched.

Evidence to keep:

- The `ℹ pass` and `ℹ fail` lines from `npm test` after today's sitting, with both seeded agreement tests running at least four hundred rounds, and the same lines again after each later sitting.
- `ALGORITHMS.md` with three entries today, the window, the trade, and Contains duplicate, each naming the condition that makes its pattern safe and the input size at which the slow version stops being acceptable, from a measurement you ran or a growth argument you wrote. Under them, the Scheduled section with four dated rows. The honest report for today is "trade plus one today, four scheduled", and it is the first line of that section. Seven entries, with done beside every date, once the sittings are over.
- The three lines from `node src/bench-profit.ts`, beside the two bench outputs from last session.
- One sentence per finished problem on which boundary case the oracle test found before you did, or the sentence "none, and here are the five boundary cases I had already written". Both are evidence. A generator that finds nothing after four hundred rounds is telling you the boundary test was complete, and that is worth writing down as much as a failure is.

Push to `typescript-practice`. The habit this session built, restate and brute force before the clever version, prediction before the run, is the one that keeps a capstone query honest when it gets clever in Unit 10.

## Side quests

The which-pattern-when sheet is the table of tells you just used six times, and the two-pointers and sliding-window sheets list the inputs that break the two patterns whose conditions this set leaned on hardest.

## Before next session

Next session leaves the editor for a document: the system design of your capstone, written from `docs/product-spec.md` with a workload estimate, a diagram you can defend, a failure walkthrough, and one recorded decision. Reread `COMPLEXITY.md` and `ALGORITHMS.md` once, because the estimate you will write is the same growth argument applied to users and requests instead of array elements. Nothing is running between sessions. You arrive with the six answers tested, the bench lines kept, `typescript-practice` pushed with `npm test` green, and the capstone repository from Unit 8 ready to receive one more file under `docs/`.

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

The oracles are the nested loop, `a.concat(b).sort((x, y) => x - y)`, `filter` plus `filter`, the replace-until-stable loop, the two-day nested loop, and `k` rounds of `pop` and `unshift` on a copy. The one that bites is `rotateRight` with an empty array: `k % 0` is `NaN`, and the early return is the fix. The `<=` in `mergeSorted` is the stability choice from the diagnosis section, and it is deliberate.
