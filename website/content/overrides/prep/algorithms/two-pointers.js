// ─────────────────────────────────────────────────────────────────────────────
// TWO POINTERS
// ─────────────────────────────────────────────────────────────────────────────
// FIRST VISIT : From Session 9.3, read the TELL row and section 1, two-sum on sorted input: the sort is the
//               condition, and the one-element assert is the input that breaks a careless loop. Stop there.
//               Session 9.4 sends you back for the last assert of each section, the inputs that break the
//               pattern; the sections themselves are interview lookup.
// WHAT   : two indices moving toward each other (or same direction) to replace a nested loop.
// TELL   : "sorted array", "pair/triplet with sum", "in place", "remove duplicates",
//          "container / water", "palindrome", "merge".
// SAY    : converging pointers (opposite ends), fast/slow (same direction), read/write pointer,
//          partition (Lomuto / Hoare), skip duplicates, invariant.
// BIG-O  : O(n) per pass; 3-sum is O(n^2); sort first costs O(n log n).
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');

// ── 1. Two-sum II (sorted input)  —  converging pointers: sum too small -> l++, too big -> r--  —  O(n) / O(1)
function twoSumSorted(nums, target) {
  let l = 0, r = nums.length - 1;
  while (l < r) {
    const s = nums[l] + nums[r];
    if (s === target) return [l, r];
    if (s < target) l++; else r--;
  }
  return [];
}
assert.deepEqual(twoSumSorted([2, 7, 11, 15], 9), [0, 1]);
assert.deepEqual(twoSumSorted([-3, -1, 0, 2, 4], -4), [0, 1]); // negatives
assert.deepEqual(twoSumSorted([1], 1), []);

// ── 2. Three-sum (sort + skip duplicates)  —  fix i, two-pointer the rest; skip equal neighbors  —  O(n^2) / O(1) extra
function threeSum(nums) {
  nums = [...nums].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue; // skip dup anchor
    if (nums[i] > 0) break; // pruning: all positive from here
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s === 0) {
        out.push([nums[i], nums[l], nums[r]]);
        while (l < r && nums[l] === nums[l + 1]) l++; // skip dup l
        while (l < r && nums[r] === nums[r - 1]) r--; // skip dup r
        l++; r--;
      } else if (s < 0) l++; else r--;
    }
  }
  return out;
}
assert.deepEqual(threeSum([-1, 0, 1, 2, -1, -4]), [[-1, -1, 2], [-1, 0, 1]]);
assert.deepEqual(threeSum([0, 0, 0, 0]), [[0, 0, 0]]);
assert.deepEqual(threeSum([1, 2]), []);

// ── 3. Container with most water  —  area = min(h[l], h[r]) * (r-l); move the shorter side  —  O(n) / O(1)
function maxArea(h) {
  let l = 0, r = h.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, Math.min(h[l], h[r]) * (r - l));
    if (h[l] < h[r]) l++; else r--;
  }
  return best;
}
assert.equal(maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]), 49);
assert.equal(maxArea([1, 1]), 1);
assert.equal(maxArea([5]), 0);

// ── 4. Remove duplicates from sorted array in place  —  read/write pointers; write when value changes  —  O(n) / O(1)
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let w = 1;
  for (let r = 1; r < nums.length; r++) if (nums[r] !== nums[w - 1]) nums[w++] = nums[r];
  return w; // new length; nums[0..w) are the uniques
}
const rd = [1, 1, 2, 3, 3];
assert.equal(removeDuplicates(rd), 3);
assert.deepEqual(rd.slice(0, 3), [1, 2, 3]);
assert.equal(removeDuplicates([]), 0);
assert.equal(removeDuplicates([1, 1, 1]), 1);

// ── 5. Squares of a sorted array  —  largest |x| is at one end; fill output from the back  —  O(n) / O(n)
function sortedSquares(nums) {
  const n = nums.length, out = new Array(n);
  let l = 0, r = n - 1;
  for (let k = n - 1; k >= 0; k--) {
    if (Math.abs(nums[l]) > Math.abs(nums[r])) out[k] = nums[l] * nums[l++];
    else out[k] = nums[r] * nums[r--];
  }
  return out;
}
assert.deepEqual(sortedSquares([-4, -1, 0, 3, 10]), [0, 1, 9, 16, 100]);
assert.deepEqual(sortedSquares([-3, -2, -1]), [1, 4, 9]);
assert.deepEqual(sortedSquares([]), []);

// ── 6. Trapping rain water  —  leftMax/rightMax; process the side with the smaller max  —  O(n) / O(1)
function trap(h) {
  let l = 0, r = h.length - 1, lMax = 0, rMax = 0, water = 0;
  while (l < r) {
    if (h[l] < h[r]) { lMax = Math.max(lMax, h[l]); water += lMax - h[l]; l++; }
    else { rMax = Math.max(rMax, h[r]); water += rMax - h[r]; r--; }
  }
  return water;
}
assert.equal(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]), 6);
assert.equal(trap([4, 2, 0, 3, 2, 5]), 9);
assert.equal(trap([1, 2, 3]), 0);

// ── 7. Valid palindrome II (at most one deletion)  —  on first mismatch, try skipping either side  —  O(n) / O(1)
function validPalindrome(s) {
  const isPal = (i, j) => { while (i < j) if (s[i++] !== s[j--]) return false; return true; };
  let i = 0, j = s.length - 1;
  while (i < j) {
    if (s[i] !== s[j]) return isPal(i + 1, j) || isPal(i, j - 1);
    i++; j--;
  }
  return true;
}
assert.equal(validPalindrome('abca'), true);
assert.equal(validPalindrome('abc'), false);
assert.equal(validPalindrome(''), true);

// ── 8. Merge sorted arrays from the back (nums1 has m valid + n slack)  —  write pointer at m+n-1; take larger  —  O(m+n) / O(1)
function mergeInto(nums1, m, nums2, n) {
  let i = m - 1, j = n - 1, w = m + n - 1;
  while (j >= 0) nums1[w--] = i >= 0 && nums1[i] > nums2[j] ? nums1[i--] : nums2[j--];
  return nums1; // leftover nums1 elements are already in place
}
assert.deepEqual(mergeInto([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3), [1, 2, 2, 3, 5, 6]);
assert.deepEqual(mergeInto([0], 0, [1], 1), [1]);
assert.deepEqual(mergeInto([1], 1, [], 0), [1]);

// ── 9. Partition / Lomuto  —  pivot = last; i = boundary of "< pivot"; swap smaller forward; place pivot at i  —  O(n) / O(1)
//        SAY: Lomuto (single pointer, pivot at end, simple) vs Hoare (two converging pointers, fewer swaps).
function lomuto(a, lo = 0, hi = a.length - 1) {
  const pivot = a[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) if (a[j] < pivot) { [a[i], a[j]] = [a[j], a[i]]; i++; }
  [a[i], a[hi]] = [a[hi], a[i]];
  return i; // final pivot index; a[lo..i) < pivot <= a(i..hi]
}
const lp = [3, 8, 1, 9, 4, 5];
const pIdx = lomuto(lp);
assert.equal(lp[pIdx], 5);
assert.ok(lp.slice(0, pIdx).every((x) => x < 5) && lp.slice(pIdx + 1).every((x) => x >= 5));
assert.equal(lomuto([7]), 0);
assert.equal(lomuto([2, 2, 2]), 0); // with strict '<', equal elements stay right of pivot (Lomuto's weakness on duplicates)

console.log('ok: algorithms/two-pointers.js');
