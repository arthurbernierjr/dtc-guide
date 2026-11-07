// ─────────────────────────────────────────────────────────────────────────────
// ARRAYS
// ─────────────────────────────────────────────────────────────────────────────
// FIRST VISIT : From Session 9.2, read the BIG-O row and section 1, prefix sums: one O(n) pass buys O(1)
//               range sums, the trade you measured today. Stop there; sections 2 to 13 are the catalogue
//               9.3 and 9.4 draw from, one per tell.
// WHAT   : single-pass and in-place array techniques that avoid O(n^2).
// TELL   : "subarray", "in place", "O(1) extra space", "numbers 1..n", "majority",
//          "range sum queries", "rotate".
// SAY    : prefix sum, Kadane, triple reverse, Dutch national flag (3-way partition),
//          cyclic sort, Floyd's tortoise-and-hare, Boyer-Moore voting, two pointers.
// BIG-O  : almost everything here is O(n) time, O(1) or O(n) space.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');

// ── 1. Prefix sums (range sum query)  —  pre[i] = sum(nums[0..i)); sum(l..r) = pre[r+1]-pre[l]  —  O(n) build / O(1) query
function buildPrefix(nums) {
  const pre = new Array(nums.length + 1).fill(0);
  for (let i = 0; i < nums.length; i++) pre[i + 1] = pre[i] + nums[i];
  return pre;
}
const rangeSum = (pre, l, r) => pre[r + 1] - pre[l]; // inclusive l..r
const pre1 = buildPrefix([1, 2, 3, 4, 5]);
assert.equal(rangeSum(pre1, 1, 3), 9);
assert.equal(rangeSum(pre1, 0, 4), 15);
assert.deepEqual(buildPrefix([]), [0]);

// ── 2. Kadane's algorithm (max subarray)  —  cur = max(x, cur + x); best = max(best, cur)  —  O(n) / O(1)
function maxSubarray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}
assert.equal(maxSubarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]), 6);
assert.equal(maxSubarray([-3, -1, -2]), -1); // all negatives: pick the max single
assert.equal(maxSubarray([5]), 5);

// ── 3. Two-sum (hash map)  —  store complement -> index while scanning  —  O(n) / O(n)
function twoSum(nums, target) {
  const seen = new Map(); // value -> index
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
assert.deepEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
assert.deepEqual(twoSum([3, 3], 6), [0, 1]);
assert.deepEqual(twoSum([1, 2], 10), []);

// ── 4. Rotate array right by k in place (triple reverse)  —  reverse all, reverse [0,k), reverse [k,n)  —  O(n) / O(1)
function reverseRange(a, i, j) {
  while (i < j) { [a[i], a[j]] = [a[j], a[i]]; i++; j--; }
}
function rotate(nums, k) {
  const n = nums.length;
  if (n === 0) return nums;
  k = ((k % n) + n) % n;
  reverseRange(nums, 0, n - 1);
  reverseRange(nums, 0, k - 1);
  reverseRange(nums, k, n - 1);
  return nums;
}
assert.deepEqual(rotate([1, 2, 3, 4, 5, 6, 7], 3), [5, 6, 7, 1, 2, 3, 4]);
assert.deepEqual(rotate([1, 2], 3), [2, 1]); // k > n
assert.deepEqual(rotate([], 2), []);

// ── 5. Dutch national flag (sort colors / 3-way partition)  —  lo, mid, hi pointers; swap into zones  —  O(n) / O(1)
function sortColors(nums) {
  let lo = 0, mid = 0, hi = nums.length - 1;
  while (mid <= hi) {
    if (nums[mid] === 0) { [nums[lo], nums[mid]] = [nums[mid], nums[lo]]; lo++; mid++; }
    else if (nums[mid] === 2) { [nums[mid], nums[hi]] = [nums[hi], nums[mid]]; hi--; } // do NOT advance mid
    else mid++;
  }
  return nums;
}
assert.deepEqual(sortColors([2, 0, 2, 1, 1, 0]), [0, 0, 1, 1, 2, 2]);
assert.deepEqual(sortColors([2, 2, 2]), [2, 2, 2]);
assert.deepEqual(sortColors([]), []);

// ── 6. Product of array except self  —  left-running product, then right-running product multiplied in  —  O(n) / O(1) extra
function productExceptSelf(nums) {
  const n = nums.length, out = new Array(n).fill(1);
  for (let i = 1; i < n; i++) out[i] = out[i - 1] * nums[i - 1];
  let right = 1;
  for (let i = n - 1; i >= 0; i--) { out[i] *= right; right *= nums[i]; }
  return out.map((x) => x + 0); // +0 normalizes -0 (strict deepEqual distinguishes -0 from 0)
}
assert.deepEqual(productExceptSelf([1, 2, 3, 4]), [24, 12, 8, 6]);
assert.deepEqual(productExceptSelf([-1, 1, 0, -3, 3]), [0, 0, 9, 0, 0]);
assert.deepEqual(productExceptSelf([5]), [1]);

// ── 7. Merge two sorted arrays  —  two pointers, take smaller; drain remainder  —  O(n+m) / O(n+m)
function mergeSorted(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);
  while (i < a.length) out.push(a[i++]);
  while (j < b.length) out.push(b[j++]);
  return out;
}
assert.deepEqual(mergeSorted([1, 3, 5], [2, 4, 6]), [1, 2, 3, 4, 5, 6]);
assert.deepEqual(mergeSorted([], [1, 2]), [1, 2]);
assert.deepEqual(mergeSorted([1, 1], [1]), [1, 1, 1]);

// ── 8. Cyclic sort  —  values 1..n: put x at index x-1 by swapping until fixed point  —  O(n) / O(1)
function cyclicSort(nums) {
  let i = 0;
  while (i < nums.length) {
    const j = nums[i] - 1;
    if (nums[i] !== nums[j]) [nums[i], nums[j]] = [nums[j], nums[i]];
    else i++;
  }
  return nums;
}
assert.deepEqual(cyclicSort([3, 1, 5, 4, 2]), [1, 2, 3, 4, 5]);
assert.deepEqual(cyclicSort([1]), [1]);

// ── 9. Find missing number (0..n, one missing)  —  expected sum minus actual (or XOR)  —  O(n) / O(1)
const missingNumber = (nums) => (nums.length * (nums.length + 1)) / 2 - nums.reduce((s, x) => s + x, 0);
assert.equal(missingNumber([3, 0, 1]), 2);
assert.equal(missingNumber([0]), 1);
assert.equal(missingNumber([]), 0);

// ── 10. Find the duplicate (1..n, one repeated, read-only, O(1) space)  —  Floyd's cycle detection on i -> nums[i]  —  O(n) / O(1)
function findDuplicate(nums) {
  let slow = nums[0], fast = nums[0];
  do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow !== fast);
  slow = nums[0];
  while (slow !== fast) { slow = nums[slow]; fast = nums[fast]; } // meet at cycle entrance = duplicate
  return slow;
}
assert.equal(findDuplicate([1, 3, 4, 2, 2]), 2);
assert.equal(findDuplicate([3, 1, 3, 4, 2]), 3);
assert.equal(findDuplicate([1, 1]), 1);

// ── 11. Majority element (> n/2)  —  Boyer-Moore voting: candidate + count; cancel out  —  O(n) / O(1)
function majorityElement(nums) {
  let cand = null, count = 0;
  for (const x of nums) {
    if (count === 0) cand = x;
    count += x === cand ? 1 : -1;
  }
  return cand; // if majority not guaranteed, do a second pass to verify count > n/2
}
assert.equal(majorityElement([3, 2, 3]), 3);
assert.equal(majorityElement([2, 2, 1, 1, 1, 2, 2]), 2);
assert.equal(majorityElement([7]), 7);

// ── 12. Best time to buy and sell stock (one transaction)  —  track min so far, best = max(price - min)  —  O(n) / O(1)
function maxProfit(prices) {
  let min = Infinity, best = 0;
  for (const p of prices) { min = Math.min(min, p); best = Math.max(best, p - min); }
  return best;
}
assert.equal(maxProfit([7, 1, 5, 3, 6, 4]), 5);
assert.equal(maxProfit([7, 6, 4, 3, 1]), 0); // decreasing: no profit
assert.equal(maxProfit([]), 0);

// ── 13. Move zeroes (keep order, in place)  —  write pointer for non-zeros, then fill zeros  —  O(n) / O(1)
function moveZeroes(nums) {
  let w = 0;
  for (const x of nums) if (x !== 0) nums[w++] = x;
  while (w < nums.length) nums[w++] = 0;
  return nums;
}
assert.deepEqual(moveZeroes([0, 1, 0, 3, 12]), [1, 3, 12, 0, 0]);
assert.deepEqual(moveZeroes([0]), [0]);
assert.deepEqual(moveZeroes([1, 2]), [1, 2]);

console.log('ok: algorithms/arrays.js');
