## The idea

Picture a number line drawn on the sidewalk, chalk marks in sorted order. You put one finger on the leftmost mark and one finger on the rightmost. You want two marks that add up to a target. You look at the sum under your fingers. Too small, and the left finger is the problem, because every mark to its left is even smaller. You slide the left finger right. Too big, and the right finger is the problem. You slide it left. The fingers only move toward each other. When they meet, you have tried the pairs that could have worked, without ever writing a nested loop.

That converging pair is one shape. The other shape puts both fingers on the left and lets them move the same direction at different speeds. A slow finger writes, a fast finger reads. Or a left-max and a right-max inch inward, and you always process the side whose wall is shorter. The invariant is what stays true after each slide: everything behind the write finger is already the answer, or every pair you skipped could not hit the target.

Two fingers replace a loop inside a loop when the array is sorted, or when you can sort it first and live with that cost.

## Why it matters

You reach for this when the problem says sorted array, a pair or a triplet with a sum, in place, remove duplicates, container and water, palindrome, or merge. The nested loop is the habit. The fingers are the replacement. If the array is not sorted and you only need one pair, a hash map is the other tool. If it is sorted, the fingers use constant extra space.

One pass of the fingers is O(n). Three-sum, which fixes one index and runs the fingers on the rest, is O(n²). Sorting first, when you need it, is O(n log n) and usually cheaper than the quadratic part that follows.

## A small example

```javascript
function twoSumSorted(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const sum = nums[lo] + nums[hi];
    if (sum === target) return [lo, hi];
    if (sum < target) lo += 1;
    else hi -= 1;
  }
  return [-1, -1];
}

const pair = twoSumSorted([1, 3, 5, 8, 12], 11);
```

`3 + 8` is `11`, so `pair` is `[1, 3]`. Each step throws away a whole end of the number line, because the array only increases as you walk right.

## What the code below is doing

Two-sum on a sorted input is the converging pair: sum too small moves the left finger, too big moves the right, linear time and constant space. Three-sum sorts, fixes `i`, and runs that same pair on the remainder, skipping equal neighbors so the same triplet is not recorded twice. Container with the most water treats the width between the fingers as one side and the shorter height as the other. You move the shorter side, because moving the taller one cannot raise the waterline.

Remove-duplicates on a sorted array is the read/write pair. The write finger advances only when the value changes, and the returned length is how far it got. Squares of a sorted array notice that the largest absolute value sits at one end or the other, so you fill the output from the back. Trapping rain water keeps `leftMax` and `rightMax` and processes the side with the smaller max, constant extra space. Valid palindrome II, at most one deletion, walks inward and, on the first mismatch, tries skipping either side.

Merging two sorted arrays when the first has slack at the end writes from the back, taking the larger value, so you never overwrite a number you still need. The last section is Lomuto's partition, the same idea inside quicksort: the pivot sits at the end, a boundary finger marks "everything here is smaller," and smaller values are swapped forward. One linear pass, constant extra space.

When you talk about it, say this: two fingers, an invariant, and which finger moves when the test fails.
