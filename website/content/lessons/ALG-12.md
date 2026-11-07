## The idea

Picture a class lining up for a photo. The photographer shouts one rule: shortest in front. That shout is the whole sort. Change it to "tallest in front" or "last name first" and the same kids form a different line. The shout is a comparator. It looks at two kids and answers with a sign. Negative means the first kid stands ahead. Zero means leave them where they already stand. Positive means the second kid stands ahead.

A hundred kids still have to move. You can split the mob in half, get each half into order, and zipper the two ordered lines together. That zipper is merge sort. You can point at one kid, Jordan, and send everyone shorter to Jordan's left and everyone taller to Jordan's right, then do the same inside each side. Jordan is the pivot. The step that plants Jordan in a final spot is the partition. Lomuto parks the pivot at the end and scans once. Hoare walks two fingers inward and returns a split point.

Those sorts only compare. If the heights are small whole numbers, you can tally instead: three kids at 48 inches, five at 49, then read the tally back out. That is counting sort. The line is the picture. The shout, and whether you zipper, pivot, or tally, is the algorithm.

## Why it matters

The built-in array sort is TimSort, stable since ES2019, so equal items stay in the order you handed them. The default comparator sorts as strings. `[10, 9, 1].sort()` comes back `[1, 10, 9]`, because `"10"` comes before `"9"`. For numbers, pass `(a, b) => a - b`.

You reach for a particular sort when the problem names the constraint. "kth smallest" or "kth largest" is quickselect: partition once and walk into one side. A small integer range is counting sort. Nearly sorted data is insertion sort, the way you sort a hand of cards one card at a time. "Stable" points at merge sort or TimSort. "In place, constant extra space" points at heap sort or quick sort. "Top N" is a sort plus a slice, and a heap of size N is the tighter tool once the list is large.

Merge sort and heap sort are O(n log n) every time. Quick sort is O(n log n) on average and O(n²) in the worst case. Counting sort is O(n + k), where k is the size of the key range.

## A small example

```javascript
function mergeSorted(left, right) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) out.push(left[i++]);
    else out.push(right[j++]);
  }
  while (i < left.length) out.push(left[i++]);
  while (j < right.length) out.push(right[j++]);
  return out;
}

const line = mergeSorted([1, 4, 8], [2, 3, 9]);
```

`<=` keeps an equal from the left line ahead of an equal from the right. That is stability on two already-sorted halves. `line` is `[1, 2, 3, 4, 8, 9]`.

## What the code below is doing

The sheet opens with the comparator recap, including the string-order trap, numeric ascending, descending, and `localeCompare`. Merge sort splits, sorts, and merges: stable, always O(n log n), O(n) extra space. Quick sort partitions and recurses both sides. A random pivot swap guards the sorted-input case, where a fixed end pivot degrades to quadratic. It is unstable, with O(log n) stack when the splits stay balanced.

Quickselect is that same partition, then one side only, for the kth smallest: average linear, worst quadratic. Counting sort tallies `count[v - min]` and emits, and a prefix-sum variant of the tally makes it stable. Bucket sort drops values into k buckets by range, sorts each, and concatenates, average O(n + k). Heap sort heapifies, then parks the root at the end and sifts down: always O(n log n), constant extra space, unstable. Insertion sort grows a sorted prefix and shifts larger items right: quadratic at worst, linear when the line is nearly sorted, stable.

The "when to choose which" block is the menu in one place: stable and guaranteed n log n, in-place and fast on average, guaranteed n log n with constant space, small integer keys, uniform floats in a unit range, tiny or nearly sorted, or kth only. Top-N sorts by a custom key and slices, with a note that a heap is O(n log N) for large n. Sort colors is the Dutch national flag, a 3-way partition in one linear pass. Merge intervals is the application: sort by start, then extend the last block when the next one overlaps.

When you talk about it, say this: name the comparator, say whether you need stable or in place, and pick the algorithm from the constraint.
