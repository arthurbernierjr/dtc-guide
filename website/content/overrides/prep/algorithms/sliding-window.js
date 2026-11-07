// ─────────────────────────────────────────────────────────────────────────────
// SLIDING WINDOW
// ─────────────────────────────────────────────────────────────────────────────
// WHAT   : maintain a contiguous [l, r] range and its running state; move r forward, l forward only.
// TELL   : "contiguous subarray / substring", "longest / shortest / count ... with at most k",
//          "window of size k", "anagram / permutation in string", "minimum window".
// SAY    : fixed-size window, variable-size window, expand right / shrink left, window invariant,
//          frequency map, "need / have" counters, monotonic deque (for window max/min).
// BIG-O  : O(n) time (each index enters and leaves once); O(k) or O(alphabet) space.
// NOTE   : two shapes. FIXED window (size k is given: Template A, sections 1, 5, 7) works on any numbers,
//          negatives included. VARIABLE window on a target sum (Template C, "shortest sum >= target") needs
//          every number >= 0; one negative breaks the shrink step (section 0 shows it). Negatives in
//          "subarray sum = k" -> use prefix-sum map.
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');

// ── TEMPLATE A: fixed window of size k
//   for r in 0..n-1:
//     add nums[r] to state
//     if r >= k: remove nums[r-k] from state          // window is now exactly [r-k+1, r]
//     if r >= k-1: best = f(best, state)
//
// ── TEMPLATE B: variable window (longest valid)
//   l = 0
//   for r in 0..n-1:
//     add s[r] to state
//     while state is INVALID: remove s[l]; l++         // shrink until valid again
//     best = max(best, r - l + 1)                      // window [l, r] is valid
//
// ── TEMPLATE C: variable window (shortest valid)
//   for r: add s[r]
//     while state is VALID: best = min(best, r-l+1); remove s[l]; l++   // record BEFORE shrinking
//   PRECONDITION for a target sum: every number >= 0 (section 0)

// ── 0. The precondition  —  Template C on a target sum needs every number >= 0; a brute-force oracle shows the break  —  O(n) vs O(n^2)
// If you came from Session 9.3: this is the case your oracle test catches. The shrink step assumes that
// dropping a number from the left can only lower the sum. One negative number makes that false.
function shortestSumAtLeast(nums, target) {              // Template C, as written for non-negative input
  let l = 0, sum = 0, best = Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    while (sum >= target) { best = Math.min(best, r - l + 1); sum -= nums[l++]; }
  }
  return best === Infinity ? 0 : best;
}
function shortestSumAtLeastSlow(nums, target) {          // the oracle: every [l, r], no assumptions
  let best = Infinity;
  for (let l = 0; l < nums.length; l++) {
    let sum = 0;
    for (let r = l; r < nums.length; r++) { sum += nums[r]; if (sum >= target) best = Math.min(best, r - l + 1); }
  }
  return best === Infinity ? 0 : best;
}
assert.equal(shortestSumAtLeast([2, 3, 1, 2, 4, 3], 7), 2);           // all >= 0: [4, 3]
assert.equal(shortestSumAtLeastSlow([2, 3, 1, 2, 4, 3], 7), 2);       // the oracle agrees
assert.equal(shortestSumAtLeastSlow([3, -2, 4, 1], 5), 2);            // one negative: the true answer is [4, 1]
assert.equal(shortestSumAtLeast([3, -2, 4, 1], 5), 3);                // the window says [3, -2, 4] and never sees [4, 1]:
// at r = 2 the sum hit 5, it dropped the 3, the sum fell to 2, and shrinking stopped. The -2 stays in the window
// for good because the loop only shrinks while the sum is still >= target. Negatives: use a prefix-sum map instead.
//
// From Session 9.3, stop here: Template A, Template C and this section are the visit. Sections 1 and 2 are the two
// shapes you already wrote; sections 3 to 7 are interview practice for after Session 9.4.

// ── 1. Max sum subarray of size k (fixed)  —  add right, drop left  —  O(n) / O(1)
function maxSumK(nums, k) {
  if (nums.length < k) return 0;
  let sum = 0, best = -Infinity;
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    if (r >= k) sum -= nums[r - k];
    if (r >= k - 1) best = Math.max(best, sum);
  }
  return best;
}
assert.equal(maxSumK([2, 1, 5, 1, 3, 2], 3), 9);
assert.equal(maxSumK([-1, -2, -3], 2), -3);
assert.equal(maxSumK([1], 2), 0);

// ── 2. Longest substring without repeating chars (variable, longest)  —  Set or last-index map; shrink while dup  —  O(n) / O(k)
function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    while (seen.has(s[r])) seen.delete(s[l++]);
    seen.add(s[r]);
    best = Math.max(best, r - l + 1);
  }
  return best;
}
assert.equal(lengthOfLongestSubstring('abcabcbb'), 3);
assert.equal(lengthOfLongestSubstring('bbbb'), 1);
assert.equal(lengthOfLongestSubstring(''), 0);

// ── 3. Longest substring with at most k distinct  —  freq map; shrink while map.size > k  —  O(n) / O(k)
function longestKDistinct(s, k) {
  const f = new Map();
  let l = 0, best = 0;
  for (let r = 0; r < s.length; r++) {
    f.set(s[r], (f.get(s[r]) ?? 0) + 1);
    while (f.size > k) {
      f.set(s[l], f.get(s[l]) - 1);
      if (f.get(s[l]) === 0) f.delete(s[l]);
      l++;
    }
    best = Math.max(best, r - l + 1);
  }
  return best;
}
assert.equal(longestKDistinct('eceba', 2), 3);
assert.equal(longestKDistinct('aa', 1), 2);
assert.equal(longestKDistinct('abc', 0), 0);

// ── 4. Minimum window substring (variable, shortest)  —  need map + "formed" count; shrink while formed === required  —  O(n+m) / O(k)
function minWindow(s, t) {
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) ?? 0) + 1);
  let have = 0, l = 0, best = [0, Infinity];
  const win = new Map();
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    win.set(c, (win.get(c) ?? 0) + 1);
    if (need.has(c) && win.get(c) === need.get(c)) have++;
    while (have === need.size) {
      if (r - l < best[1] - best[0]) best = [l, r];
      const d = s[l++];
      win.set(d, win.get(d) - 1);
      if (need.has(d) && win.get(d) < need.get(d)) have--;
    }
  }
  return best[1] === Infinity ? '' : s.slice(best[0], best[1] + 1);
}
assert.equal(minWindow('ADOBECODEBANC', 'ABC'), 'BANC');
assert.equal(minWindow('a', 'a'), 'a');
assert.equal(minWindow('a', 'aa'), '');

// ── 5. Find all anagrams / permutation in string (fixed window = |p|)  —  26-count arrays; compare per step  —  O(n * 26) / O(1)
function findAnagrams(s, p) {
  const out = [], need = new Array(26).fill(0), win = new Array(26).fill(0);
  const ix = (c) => c.charCodeAt(0) - 97;
  for (const c of p) need[ix(c)]++;
  for (let r = 0; r < s.length; r++) {
    win[ix(s[r])]++;
    if (r >= p.length) win[ix(s[r - p.length])]--;
    if (r >= p.length - 1 && win.every((v, i) => v === need[i])) out.push(r - p.length + 1);
  }
  return out;
}
const checkInclusion = (p, s) => findAnagrams(s, p).length > 0; // "permutation in string"
assert.deepEqual(findAnagrams('cbaebabacd', 'abc'), [0, 6]);
assert.deepEqual(findAnagrams('abab', 'ab'), [0, 1, 2]);
assert.equal(checkInclusion('ab', 'eidboaoo'), false);

// ── 6. Max consecutive ones III (flip at most k zeros)  —  count zeros in window; shrink while zeros > k  —  O(n) / O(1)
function longestOnes(nums, k) {
  let l = 0, zeros = 0, best = 0;
  for (let r = 0; r < nums.length; r++) {
    if (nums[r] === 0) zeros++;
    while (zeros > k) if (nums[l++] === 0) zeros--;
    best = Math.max(best, r - l + 1);
  }
  return best;
}
assert.equal(longestOnes([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2), 6);
assert.equal(longestOnes([0, 0, 0], 0), 0);
assert.equal(longestOnes([1, 1], 5), 2);

// ── 7. Sliding window maximum (monotonic deque)  —  deque of indices, values decreasing; front = max; pop front when out of window  —  O(n) / O(k)
function maxSlidingWindow(nums, k) {
  const dq = []; // indices; nums[dq] strictly decreasing front->back
  let head = 0; // head index instead of shift() to keep O(1)
  const out = [];
  for (let r = 0; r < nums.length; r++) {
    while (dq.length > head && nums[dq[dq.length - 1]] <= nums[r]) dq.pop(); // drop smaller tail
    dq.push(r);
    if (dq[head] <= r - k) head++; // front fell out of the window
    if (r >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}
assert.deepEqual(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3), [3, 3, 5, 5, 6, 7]);
assert.deepEqual(maxSlidingWindow([1], 1), [1]);
assert.deepEqual(maxSlidingWindow([4, 4, 4], 2), [4, 4]);

console.log('ok: algorithms/sliding-window.js');
