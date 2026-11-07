## The idea

Picture a train window. You sit facing the countryside, and the window shows one contiguous stretch of it. The right edge of the window only moves forward, as the train does. The left edge only moves forward too. You never slide the window backward. What you can see — the sum of the fields, the set of letters on the billboards, the number of zeros — is the state you keep. When the right edge takes in a new field, you add it. When the left edge leaves a field behind, you drop it. You do not rescan the fields still in the window.

Two kinds of window share that train. A fixed window is a frame of size k. You add the new right edge and, once the frame is full, drop the element that just fell out on the left. A variable window grows until it breaks a rule, then the left edge catches up until the rule holds again. Template B wants the longest valid stretch, so you shrink while the state is invalid and then record the length. Template C wants the shortest valid stretch, so you record the length while the state is valid, and you record it before you shrink.

The rule that makes the left edge safe to move only forward is monotone state. Growing the window should only add information you can undo by dropping the left side. A target sum that includes negative numbers breaks that. Those problems belong with a prefix-sum map.

## Why it matters

You reach for the window when the problem says contiguous subarray or substring, longest or shortest or a count with at most k, a window of size k, an anagram or permutation inside a string, or a minimum window. The nested loop that tries every start and every end is quadratic. The train replaces it when each index enters once and leaves once.

That is O(n) time. The extra space is O(k) for a frequency map, or O(1) when the alphabet is fixed, like 26 letters.

## A small example

```javascript
function maxSumK(nums, k) {
  let sum = 0;
  let best = -Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    if (r >= k) sum -= nums[r - k];
    if (r >= k - 1) best = Math.max(best, sum);
  }
  return best;
}

const best = maxSumK([2, 1, 5, 1, 3, 2], 3);
```

That is Template A. The frame slides across `[2, 1, 5]`, `[1, 5, 1]`, `[5, 1, 3]`, `[1, 3, 2]`. `best` is `9`. Each add and each drop is O(1), so the ride is linear.

## What the code below is doing

The sheet writes the three templates before the problems. Template A is the fixed frame of size k: add the right, drop the left once `r >= k`, record once the frame is full. Template B is the longest valid window: shrink while invalid, then take the max length. Template C is the shortest valid window: while the state is valid, record the length, then shrink. Recording happens before the shrink, or you lose the window you just proved.

Max sum of size k is Template A with a running sum. Longest substring without repeating characters keeps a set or a map of last indexes and shrinks while the new character is a duplicate. Longest substring with at most k distinct characters keeps a frequency map and shrinks while the map's size is over k. Minimum window substring is Template C with a need-map and a "formed" count: you have matched every required character when `formed === required`, and you shrink while that stays true. Find-all-anagrams is a fixed window the length of the pattern, comparing length-26 count arrays as the frame moves.

Max consecutive ones, with at most k zeros flipped, counts zeros inside the window and shrinks while that count exceeds k. Sliding-window maximum keeps a deque of indexes whose values are decreasing. The front is the max. You pop the front when it falls out of the frame, and you pop the back while it is smaller than the new value. Each index enters and leaves the deque once, so the whole ride stays linear.

When you talk about it, say this: the right edge only moves forward, the left edge only moves forward, and name which template is driving.
