## The idea

Picture a cash-register receipt. Each line is a number. Beside every line the register prints the running total from the top of the tape down to here. That column of running totals is a prefix sum. Once it is printed, the total of any stretch of lines is one subtraction: the running total just after the stretch ends, minus the running total just before the stretch starts. You paid for a linear walk once. Every range question after that is constant time.

Kadane's algorithm is a second habit on the same tape. You walk the lines once, keeping the best streak that ends on the line you are touching. That streak is either this line alone, if gluing it onto the previous streak would make things worse, or the previous streak plus this line. You also keep a separate note of the best streak you have seen anywhere. You never look two lines back. You never restart from scratch for every possible start. One pass, a couple of numbers in your head.

The rest of the patterns are the same promise: one walk, and a constant amount of extra memory unless the answer itself needs a new array. A hash map for complements, three reversals to rotate, three zones for three colors, a cycle of indexes when the values are `1..n`.

## Why it matters

A nested loop over every pair of indexes is quadratic, and a lot of array problems are disguised pair loops. You reach for these patterns when the problem says subarray, in place, constant extra space, numbers in `1..n`, a majority, range-sum queries, or a rotation. The tell is the shape of the question. The tool is a single pass that leaves behind either a prefix, a candidate, or a rearranged tape.

Almost everything on this sheet is O(n) time, with O(1) or O(n) extra space.

## A small example

```javascript
function rangeSum(nums, left, right) {
  const pre = [0];
  for (const x of nums) pre.push(pre[pre.length - 1] + x);
  return pre[right + 1] - pre[left];
}

const total = rangeSum([2, 4, 6, 8], 1, 2);
```

`pre` is the receipt: `[0, 2, 6, 12, 20]`. The stretch from index 1 through 2 is `12 - 2`. `total` is `10`, which is `4 + 6`. Building the tape is linear. Reading one stretch is constant.

## What the code below is doing

Prefix sums are section 1: `pre[i]` is the sum of the half-open prefix `nums[0..i)`, and `sum(l..r)` is `pre[r + 1] - pre[l]`. Kadane is section 2: `cur = max(x, cur + x)` and `best = max(best, cur)`, the best subarray in linear time and constant space. Two-sum stores each value's complement as you scan, so the pair is a hash lookup. Rotate-right by k is three reversals: reverse the whole tape, reverse the first k, reverse the rest. No extra array.

Dutch national flag is three pointers, `lo`, `mid`, and `hi`, partitioning 0s, 1s, and 2s in one pass. Product of array except self runs a left product into the answer, then a right product back across it, constant extra space besides the answer. Merging two sorted arrays is two pointers taking the smaller head and then draining the rest. Cyclic sort is for values `1..n`: while a value is not home, swap it toward index `x - 1`. Each value moves at most once.

Missing number, for `0..n` with one hole, is the expected sum minus the actual sum, or the same idea with XOR. The duplicate in `1..n`, read-only and constant space, is Floyd's tortoise and hare on the arrow `i -> nums[i]`. Majority, the value that appears more than `n/2` times, is Boyer-Moore voting: a candidate and a count that cancels out on disagreement. Best time to buy and sell once tracks the minimum price so far and the best difference. Move zeroes keeps a write pointer for the non-zero values, then fills the tail with zeroes so the original order survives.

When you talk about it, say this: one pass over the tape, and name the thing you are carrying, a prefix, a streak, a candidate, or a write pointer.
