## The idea

Picture a phone book. You want "Nguyen." You open the middle. The name on that page comes before Nguyen, so every page on the left is too early. You set it aside and open the middle of what is left. Each look throws away half the remaining pages. The middle page is useful because every name before it is earlier and every name after it is later. The book is monotonic: as you move right, names only move forward in the alphabet.

In code the phone book is any range with that property. You keep two bounds, `lo` and `hi`. The answer, if it exists, sits between them. You test the middle. One comparison moves one bound, and the range shrinks by half. You stop when the bounds meet or the middle is the thing you wanted.

Three templates live on that same picture. Template A looks for an exact match on a closed interval. `lo` and `hi` are both legal indexes, and the loop runs while `lo <= hi`. When the middle name is too early, `lo = mid + 1`. When it is too late, `hi = mid - 1`. Template B looks for the first index where a yes-or-no predicate becomes true, on a half-open interval `[lo, hi)`. The loop runs while `lo < hi`. When the middle might still be the answer, you set `hi = mid` and keep that page. Lower bound is "first index `>=` target." Upper bound is "first index `>` target." Template C searches the answer, the way you would search for the slowest eating speed that still finishes the bananas. `lo` is the smallest answer you would accept, `hi` is the largest. You ask whether the middle answer works. The predicate has to be monotone: once a value works, every larger value works, or the other way around if you are maximizing.

## Why it matters

A linear scan of a million sorted pages is a million looks. Halving is about twenty. You reach for this when the problem says the input is sorted, asks for a logarithmic bound, or talks about a rotated sorted array, a peak, or the first and last occurrence. You also reach for it when the question is "minimum X such that a condition holds": minimum capacity, maximum speed, split into k parts. There the array is the cost of checking one candidate. The thing you halve is the answer.

Plain search is O(log n) time and O(1) space. Search on the answer is O(n log(range)). The usual bug is the bounds: closed versus half-open, and whether `mid` stays inside the range. Compute `mid` as `lo + ((hi - lo) >> 1)` so the index stays an integer.

## A small example

```javascript
function findName(pages, name) {
  let lo = 0;
  let hi = pages.length - 1;
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    if (pages[mid] === name) return mid;
    if (pages[mid] < name) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

const page = findName(['ann', 'bea', 'cy', 'dee', 'ed'], 'cy');
```

That is Template A. `page` is `2`. A missing name returns `-1` once the two bounds cross.

## What the code below is doing

The sheet writes Template A and Template B before any problem, so you can see the loop you are copying. Classic binary search is Template A. Lower bound and upper bound are Template B. Search-insert position is the lower bound under another name. First bad version is Template B over versions `1..n`, with the predicate "is this version bad?"

Then the book has been rotated: a sorted run, cut, and the right piece moved to the front. One half is always still sorted. You test whether the target sits in that sorted half and throw the other half away. Finding the minimum compares `mid` to `hi` and walks into the unsorted half, which is where the drop lives. A peak climbs toward the larger neighbor. If `a[mid] < a[mid + 1]`, the peak is on the right.

Template C is binary search on the answer. Koko eating bananas finds the minimum speed whose hour count fits the limit. Shipping within D days and splitting an array into k parts share that shape: `lo` is the heaviest single piece, `hi` is the total, and "feasible" means the number of days or pieces you would need is small enough. A fully sorted 2D matrix is one flat phone book. You binary-search the index `0 .. mn - 1` and turn it back into a row and a column with division and remainder, O(log(mn)). Integer square root asks for the largest `m` with `m * m <= x`, upper-bound style.

When you talk about it, say this: halve a monotonic range, name the template, and keep the bounds honest.
