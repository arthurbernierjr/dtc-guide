---
editorial: true
title: Trial of Wits
subtitle: Algorithm Patterns and Whiteboard Practice
hook: "Algorithm solutions with invariants, edge cases, and comparative complexity. Work a small input by hand."
read: 60
artifact: "Algorithm solutions with invariants, edge cases, and comparative complexity"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
say:
  - "Example: Work a small input by hand."
  - "Invariant: State what remains true during each step."
  - "Proof: Check termination, correctness, and resource growth."
---

## The hook

Welcome to the Trial of Wits. The Trial of Blades tested your ability to build weapons. This trial tests your ability to use them. Today is algorithm day. Two pointers. Sliding window. Frequency counters. Binary search. Sorting algorithms. Recursion. These are the patterns that show up in 90 percent of technical interviews, and more importantly, they are the patterns that let you solve real engineering problems efficiently.

Here is what most bootcamp graduates get wrong about algorithms. They think algorithms are an academic exercise with no practical value. That is dead wrong. When you need to find duplicates in a user database, you use a frequency counter. When you need to search through sorted data, you use binary search. When you need to process a stream of incoming data, you use a sliding window. These are not interview tricks. These are engineering tools.

By the end of this session, you will have solved 10 algorithm problems using established patterns. You will have a whiteboard problem-solving framework you can use in any interview. And you will understand recursion well enough to explain it to someone else, which is the real test of understanding.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Analyze Algorithm Efficiency Using Big O Notation
You will analyze the time and space complexity of algorithms using Big O notation and select appropriate solutions based on performance requirements.

**Enabling Objectives:**
- Define Big O notation and explain what it measures (growth rate, not exact time)
- Identify the time complexity of code containing loops, nested loops, recursive calls, and divide-and-conquer patterns
- Compare common complexity classes (O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n)) and rank them by efficiency
- Analyze space complexity by tracking memory allocation relative to input size
- Evaluate algorithm tradeoffs between time complexity, space complexity, and code readability

**You should be able to:**
- Look at a function and determine its Big O time and space complexity
- Explain why an O(n) solution is preferable to an O(n^2) solution at scale
- Choose between algorithmic approaches based on performance characteristics

### Apply Core Data Structures to Solve Programming Problems
You will implement and apply stacks, queues, linked lists, hash tables, and trees to solve programming problems, selecting the appropriate data structure based on the problem's requirements.

**Enabling Objectives:**
- Implement a generic Stack class with push, pop, peek, and isEmpty operations in TypeScript
- Implement a generic Queue class with enqueue, dequeue, and front operations in TypeScript
- Build a singly linked list with append, prepend, remove, find, and reverse methods in TypeScript
- Explain how hash tables work (hashing, collisions, chaining) and use Map and Set effectively
- Describe binary tree structure, traversal orders, and when trees are used in real systems
- Apply algorithm patterns (two pointers, sliding window, frequency counter, divide and conquer) to solve problems efficiently

**You should be able to:**
- Build data structures from scratch using TypeScript generics
- Select the right data structure for a given problem based on operation complexity
- Solve algorithm problems using established patterns

**The UMPIRE Problem-Solving Framework**

Before we write a single line of code, you need a framework for approaching any problem. Interviewers care as much about your process as your answer. The UMPIRE method:

- **U - Understand:** Read the problem. Ask clarifying questions. What are the inputs? What are the outputs? What are the edge cases? Can the array be empty? Can numbers be negative?
- **M - Match:** What pattern does this problem match? Two pointers? Sliding window? Hash map? Sorting?
- **P - Plan:** Write pseudocode. Outline your approach step by step BEFORE writing code.
- **I - Implement:** Now write the actual code. Follow your plan.
- **R - Review:** Walk through your code with a test case. Check for off-by-one errors, edge cases, and typos.
- **E - Evaluate:** What is the Big O time and space complexity? Can you optimize it?

This framework works for whiteboard interviews, take-home challenges, and real engineering problems. Use it every time.

**Pattern 1: Frequency Counter**

The frequency counter pattern uses an object or Map to count occurrences. It eliminates the need for nested loops, converting O(n^2) solutions to O(n).

When to use it: anagrams, duplicate detection, character counting, comparing two datasets.

```typescript
// Problem: Check if two strings are anagrams
// "listen" and "silent" are anagrams (same letters, different order)

// SLOW approach: O(n^2) - sort both and compare
function areAnagramsSlow(str1: string, str2: string): boolean {
  return str1.split("").sort().join("") === str2.split("").sort().join("");
  // Sorting is O(n log n), which is fine but we can do better
}

// FAST approach: O(n) - frequency counter
function areAnagrams(str1: string, str2: string): boolean {
  if (str1.length !== str2.length) return false;

  const freq: Record<string, number> = {};

  // Count characters in str1
  for (const char of str1) {
    freq[char] = (freq[char] || 0) + 1;
  }

  // Subtract characters from str2
  for (const char of str2) {
    if (!freq[char]) return false;
    freq[char]--;
  }

  return true;
}

// Time: O(n), Space: O(n)
console.log(areAnagrams("listen", "silent")); // true
console.log(areAnagrams("hello", "world"));   // false
```

```typescript
// Problem: Find the first non-repeating character in a string
function firstUniqueChar(str: string): string | null {
  const freq = new Map<string, number>();

  // Count frequencies
  for (const char of str) {
    freq.set(char, (freq.get(char) || 0) + 1);
  }

  // Find first character with count 1
  for (const char of str) {
    if (freq.get(char) === 1) return char;
  }

  return null;
}

// Time: O(n), Space: O(n)
console.log(firstUniqueChar("aabccbde")); // "d"
console.log(firstUniqueChar("aabb"));     // null
```

```typescript
// Problem: Given an array of numbers, find two numbers that sum to a target
function twoSum(nums: number[], target: number): [number, number] | null {
  const seen = new Map<number, number>(); // value -> index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }

  return null;
}

// Time: O(n), Space: O(n)
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1] (2 + 7 = 9)
console.log(twoSum([3, 2, 4], 6));       // [1, 2] (2 + 4 = 6)
```

**Pattern 2: Two Pointers**

The two pointers pattern uses two index variables that move toward each other (or in the same direction) through an array. It is typically used on sorted arrays or linked lists.

When to use it: pair sum on sorted array, palindrome checking, removing duplicates from sorted array, container with most water.

```typescript
// Problem: Check if a string is a palindrome
function isPalindrome(str: string): boolean {
  let left = 0;
  let right = str.length - 1;

  while (left < right) {
    if (str[left] !== str[right]) return false;
    left++;
    right--;
  }

  return true;
}

// Time: O(n), Space: O(1)
console.log(isPalindrome("racecar")); // true
console.log(isPalindrome("hello"));   // false
```

```typescript
// Problem: Given a SORTED array, find two numbers that sum to a target
function twoSumSorted(nums: number[], target: number): [number, number] | null {
  let left = 0;
  let right = nums.length - 1;

  while (left < right) {
    const sum = nums[left] + nums[right];

    if (sum === target) return [left, right];
    if (sum < target) left++;    // Need a bigger sum, move left pointer right
    else right--;                 // Need a smaller sum, move right pointer left
  }

  return null;
}

// Time: O(n), Space: O(1) -- better than the hash map version for sorted arrays!
console.log(twoSumSorted([1, 2, 3, 4, 6], 6)); // [1, 3] (2 + 4 = 6)
```

```typescript
// Problem: Remove duplicates from a sorted array in place
// Return the new length (array is modified in place)
function removeDuplicates(nums: number[]): number {
  if (nums.length === 0) return 0;

  let slow = 0; // Points to the last unique element

  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }

  return slow + 1; // Length of unique elements
}

// Time: O(n), Space: O(1)
const arr = [1, 1, 2, 2, 3, 4, 4, 5];
const newLength = removeDuplicates(arr);
console.log(arr.slice(0, newLength)); // [1, 2, 3, 4, 5]
```

**Pattern 3: Sliding Window**

The sliding window pattern maintains a "window" that slides across data. It converts nested loop problems (O(n^2)) into single-pass solutions (O(n)).

When to use it: maximum sum subarray, longest substring without repeating characters, smallest subarray with a given sum.

```typescript
// Problem: Find the maximum sum of any contiguous subarray of size k
function maxSubarraySum(arr: number[], k: number): number | null {
  if (arr.length < k) return null;

  // Calculate sum of first window
  let windowSum = 0;
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }

  let maxSum = windowSum;

  // Slide the window: add next element, remove first element
  for (let i = k; i < arr.length; i++) {
    windowSum = windowSum + arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}

// Time: O(n), Space: O(1)
console.log(maxSubarraySum([1, 4, 2, 10, 2, 3, 1, 0, 20], 4)); // 24 (2+3+1+0+20? No: 10+2+3+1=16? Actually: let me recalc)
// Window sums: [1+4+2+10]=17, [4+2+10+2]=18, [2+10+2+3]=17, [10+2+3+1]=16, [2+3+1+0]=6, [3+1+0+20]=24
// Answer: 24
```

```typescript
// Problem: Find the longest substring without repeating characters
function longestUniqueSubstring(str: string): number {
  const charSet = new Set<string>();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < str.length; right++) {
    // Shrink window from left while duplicate exists
    while (charSet.has(str[right])) {
      charSet.delete(str[left]);
      left++;
    }

    charSet.add(str[right]);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
}

// Time: O(n), Space: O(min(n, alphabet_size))
console.log(longestUniqueSubstring("abcabcbb")); // 3 ("abc")
console.log(longestUniqueSubstring("bbbbb"));    // 1 ("b")
console.log(longestUniqueSubstring("pwwkew"));   // 3 ("wke")
```

```typescript
// Problem: Find the smallest subarray with sum >= target
function minSubarrayLen(target: number, nums: number[]): number {
  let left = 0;
  let sum = 0;
  let minLen = Infinity;

  for (let right = 0; right < nums.length; right++) {
    sum += nums[right];

    while (sum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      sum -= nums[left];
      left++;
    }
  }

  return minLen === Infinity ? 0 : minLen;
}

// Time: O(n), Space: O(1)
console.log(minSubarrayLen(7, [2, 3, 1, 2, 4, 3])); // 2 ([4, 3])
console.log(minSubarrayLen(11, [1, 1, 1, 1, 1]));    // 0 (impossible)
```

**Recursion Fundamentals**

Recursion is when a function calls itself. Every recursive function needs a base case (when to stop) and a recursive case (when to call itself with a smaller problem).

```typescript
// Classic example: Factorial
// 5! = 5 * 4 * 3 * 2 * 1 = 120
function factorial(n: number): number {
  // Base case: stop when n is 0 or 1
  if (n <= 1) return 1;

  // Recursive case: n * factorial of (n-1)
  return n * factorial(n - 1);
}

// Call stack visualization:
// factorial(5)
//   5 * factorial(4)
//     4 * factorial(3)
//       3 * factorial(2)
//         2 * factorial(1)
//           return 1        <- base case hit
//         return 2 * 1 = 2
//       return 3 * 2 = 6
//     return 4 * 6 = 24
//   return 5 * 24 = 120

console.log(factorial(5));  // 120
console.log(factorial(10)); // 3628800
```

```typescript
// Fibonacci sequence: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...
// Each number is the sum of the two before it

// NAIVE recursive: O(2^n) - exponentially slow!
function fibNaive(n: number): number {
  if (n <= 1) return n;
  return fibNaive(n - 1) + fibNaive(n - 2);
}

// MEMOIZED recursive: O(n) - cache previous results
function fibMemo(n: number, memo: Map<number, number> = new Map()): number {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n)!;

  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);
  return result;
}

// ITERATIVE: O(n) time, O(1) space - the best for this problem
function fibIterative(n: number): number {
  if (n <= 1) return n;

  let prev = 0;
  let curr = 1;

  for (let i = 2; i <= n; i++) {
    const next = prev + curr;
    prev = curr;
    curr = next;
  }

  return curr;
}

console.log(fibIterative(10)); // 55
console.log(fibIterative(20)); // 6765
```

![](diagram:session-9-3/fig1-model)

### A pattern is a consequence of structure

Two pointers work when moving a boundary can eliminate possibilities without losing a valid answer. A sliding window works when the property of a contiguous range can be updated as elements enter and leave. Binary search requires an ordered or monotonic decision space. Memorizing these names without their conditions leads to elegant-looking wrong answers. Start by explaining the input structure that makes the chosen movement safe.

Write a brute-force solution first when it clarifies the contract. It can serve as an oracle for small inputs while you develop an optimized version. Generate or enumerate short cases and compare both results. The slow version need not ship to production to be valuable. It gives you independent evidence that an optimization preserved behavior rather than merely producing the expected answer for one demonstration.

### State an invariant in ordinary language

For binary search with a half-open interval, every possible answer remains between the lower bound and the exclusive upper bound. For a frequency counter, each stored count equals the number of occurrences processed so far. For a sliding window, the maintained state describes exactly the current interval. Write the invariant beside the loop, then check initialization, preservation, and termination.

Off-by-one errors become easier to diagnose when interval conventions are explicit. Do not mix an inclusive right boundary with a length calculation designed for an exclusive one. Test an empty input, one element, a match at each end, and a missing value. For duplicate values, decide whether any match, the first match, or the last match is required. Those are different contracts and may require different boundary updates.

### Sorting changes the problem and sometimes the input

Sorting can enable two pointers or make duplicates adjacent, but it adds a cost and may change the original array. If the caller expects the input preserved, copy it before sorting or document mutation as part of the contract. In JavaScript, supply a comparator for numeric ordering; the default ordering is based on string representations. Test negative numbers and multi-digit values so the mistake is visible.

Some sliding-window techniques assume nonnegative values or a monotonic condition. If negative values are allowed, shrinking the window may not predictably reduce the sum. Do not generalize a solution beyond its assumptions. Write those assumptions in the function contract and include a counterexample that shows why they matter. Recognizing when a pattern does not apply is part of mastering it.

### Explain recursion as state and progress

Every recursive call needs a smaller or otherwise advancing problem and a base case. Draw the call tree for a tiny input and identify repeated subproblems. Memoization can avoid repeated work when the subproblem result depends only on its key. A key that omits relevant state can produce fast but incorrect answers. Include the recursion stack in space analysis and consider iterative alternatives when depth can grow large.

In whiteboard practice, communicate the contract, examples, baseline, improvement, and tradeoffs. Pause to test your own code before declaring it finished. The final artifact should include at least one solution with a written invariant, a set of boundary cases, and a comparison to a simpler baseline. Clear reasoning is more transferable than memorizing a final implementation.

## The demonstration

Take ten minutes.
The Trial of Wits pauses. Rest your mind. These patterns need time to settle. When we return, we tackle sorting algorithms and binary search.

**Sorting Algorithms**

Why learn sorting? JavaScript has `Array.sort()`, but understanding HOW sorting works teaches you divide-and-conquer thinking, helps you analyze performance, and shows up in interviews constantly.

**Bubble Sort: The Simplest (and Slowest) Sort**

```typescript
// Bubble Sort: repeatedly swap adjacent elements if they are in the wrong order
// Time: O(n^2), Space: O(1)
function bubbleSort(arr: number[]): number[] {
  const result = [...arr]; // Do not mutate the original
  const n = result.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j++) {
      if (result[j] > result[j + 1]) {
        // Swap
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    }

    // Optimization: if no swaps happened, array is already sorted
    if (!swapped) break;
  }

  return result;
}

console.log(bubbleSort([64, 34, 25, 12, 22, 11, 90]));
// [11, 12, 22, 25, 34, 64, 90]
```

**Merge Sort: Divide and Conquer**

```typescript
// Merge Sort: divide array in half, sort each half, merge them back
// Time: O(n log n), Space: O(n)
function mergeSort(arr: number[]): number[] {
  // Base case: array of 0 or 1 elements is already sorted
  if (arr.length <= 1) return arr;

  // Divide: split array in half
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  // Conquer: merge the sorted halves
  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  // Compare elements from both arrays and take the smaller one
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] <= right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  // Add remaining elements (one side will be empty)
  return result.concat(left.slice(leftIndex), right.slice(rightIndex));
}

console.log(mergeSort([38, 27, 43, 3, 9, 82, 10]));
// [3, 9, 10, 27, 38, 43, 82]
```

**Quick Sort: The Fast Pragmatic Choice**

```typescript
// Quick Sort: pick a pivot, partition around it, recurse on each side
// Time: O(n log n) average, O(n^2) worst case, Space: O(log n)
function quickSort(arr: number[]): number[] {
  // Base case
  if (arr.length <= 1) return arr;

  // Pick pivot (using last element for simplicity)
  const pivot = arr[arr.length - 1];
  const left: number[] = [];
  const right: number[] = [];

  // Partition: elements smaller than pivot go left, larger go right
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] <= pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  // Recurse on both sides and combine
  return [...quickSort(left), pivot, ...quickSort(right)];
}

console.log(quickSort([10, 7, 8, 9, 1, 5]));
// [1, 5, 7, 8, 9, 10]
```

Sorting algorithm comparison:

```
+---------------+----------+----------+----------+--------+
| Algorithm     | Best     | Average  | Worst    | Space  |
+---------------+----------+----------+----------+--------+
| Bubble Sort   | O(n)     | O(n^2)   | O(n^2)   | O(1)   |
| Merge Sort    | O(nlogn) | O(nlogn) | O(nlogn) | O(n)   |
| Quick Sort    | O(nlogn) | O(nlogn) | O(n^2)   | O(logn)|
| JS .sort()    | O(nlogn) | O(nlogn) | O(nlogn) | O(logn)|
+---------------+----------+----------+----------+--------+

When to use which:
- Bubble Sort: never in production, but great for learning
- Merge Sort: guaranteed O(n log n), good for linked lists, stable
- Quick Sort: fastest in practice for arrays, used by many languages
- JS .sort(): use this in production! It uses TimSort (hybrid merge/insertion)
```

**Binary Search**

Binary search finds an element in a SORTED array by repeatedly cutting the search space in half. It is O(log n), which means searching 1 million items takes about 20 steps instead of 1 million.

```typescript
// Standard binary search: find index of target in sorted array
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) return mid;       // Found it!
    if (arr[mid] < target) left = mid + 1;     // Target is in right half
    else right = mid - 1;                       // Target is in left half
  }

  return -1; // Not found
}

// Time: O(log n), Space: O(1)
const sorted = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
console.log(binarySearch(sorted, 7));  // 3 (index)
console.log(binarySearch(sorted, 12)); // -1 (not found)
```

```typescript
// Binary search variation: find the first occurrence of a value
function findFirstOccurrence(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;
  let result = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (arr[mid] === target) {
      result = mid;        // Found one, but keep looking left for earlier ones
      right = mid - 1;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

console.log(findFirstOccurrence([1, 2, 2, 2, 3, 4, 5], 2)); // 1 (first index of 2)
```

```typescript
// Binary search variation: find insert position
function searchInsert(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }

  return left; // Where target would be inserted
}

console.log(searchInsert([1, 3, 5, 6], 5)); // 2 (exists at index 2)
console.log(searchInsert([1, 3, 5, 6], 2)); // 1 (would insert at index 1)
console.log(searchInsert([1, 3, 5, 6], 7)); // 4 (would insert at end)
```

**Divide and Conquer Pattern**

Divide and conquer breaks a problem into smaller subproblems, solves each one, then combines the results. Merge sort and binary search both use this pattern.

```typescript
// Problem: Find the maximum element using divide and conquer
function findMaxDC(arr: number[], left: number = 0, right: number = arr.length - 1): number {
  // Base case: one element
  if (left === right) return arr[left];

  // Divide
  const mid = Math.floor((left + right) / 2);

  // Conquer
  const leftMax = findMaxDC(arr, left, mid);
  const rightMax = findMaxDC(arr, mid + 1, right);

  // Combine
  return Math.max(leftMax, rightMax);
}

// Time: O(n), Space: O(log n) for call stack
console.log(findMaxDC([3, 1, 4, 1, 5, 9, 2, 6])); // 9
```

```typescript
// Problem: Count occurrences of a value in a sorted array
// Uses binary search (divide and conquer) to find first and last occurrence
function countOccurrences(arr: number[], target: number): number {
  function findBound(isFirst: boolean): number {
    let left = 0;
    let right = arr.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (arr[mid] === target) {
        result = mid;
        if (isFirst) right = mid - 1;  // Keep searching left
        else left = mid + 1;            // Keep searching right
      } else if (arr[mid] < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }

  const first = findBound(true);
  if (first === -1) return 0;
  const last = findBound(false);
  return last - first + 1;
}

// Time: O(log n), Space: O(1)
console.log(countOccurrences([1, 2, 2, 2, 3, 4, 5], 2)); // 3
console.log(countOccurrences([1, 2, 2, 2, 3, 4, 5], 6)); // 0
```

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-9-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function lowerBound(values, target) {
  let lo = 0, hi = values.length;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (values[mid] < target) lo = mid + 1; else hi = mid;
  }
  return lo;
}
check(lowerBound([], 3) === 0, 'Empty interval');
check(lowerBound([1, 3, 3, 7], 3) === 1, 'First matching boundary');
check(lowerBound([1, 3, 7], 9) === 3, 'Insertion at the end');
console.log('ok: checkpoint-9-3');
```

## Where it breaks

![](diagram:session-9-3/fig2-diagnosis)

### Pattern chosen too soon

You reach for a sliding window, or dynamic programming, because the chapter is about that pattern, and the input does not have the structure the pattern needs. You then spend the hour fitting the problem to the tool. Write the brute-force version first, including its cost, and write down the constraint that makes it too slow: sorted input, a bound on the values, overlapping subproblems you can name. The pattern is the consequence of that constraint. A pattern chosen because it was next on the syllabus produces a solution you cannot repair when the constraint is different.

### Off-by-one boundary

The loop handles the middle and drops the first element, or it reads one past the end. You defined the window as "up to `right`" and then wrote `right` as exclusive in one place and inclusive in another. State the interval in the code, in words, next to the loop: `left` inclusive, `right` exclusive, empty when `left === right`. Test the empty input, the single element, and the pair. Those three catch more off-by-ones than a long random case, because the bug lives in the boundary you have not named.

### Optimization changes behavior

The faster version passes the tests you wrote for it and disagrees with the slow version on an input you did not write down. Speed is not correctness. Keep the brute-force function and run both on the same cases, including the ones at the boundary. When they disagree, the faster one is wrong until you can explain the case, because the slow one is the definition. Delete the slow one only after that comparison has survived the cases you were afraid of, not before.

## Your turn

Take ten minutes.
Rest your mind. Algorithm practice is mentally intense. Stretch, hydrate, and prepare for the guided problem-solving session.

**Guided Whiteboard Practice**

We will solve three problems together using the UMPIRE method. For each problem, we will go through every step out loud.

**Problem 1: Valid Anagram (Frequency Counter)**

```typescript
// UNDERSTAND: Given two strings, determine if one is an anagram of the other
// Input: two strings. Output: boolean.
// Edge cases: empty strings (true), different lengths (false)

// MATCH: Frequency counter pattern - count characters in both strings

// PLAN:
// 1. If lengths differ, return false
// 2. Create a frequency map from string 1
// 3. Subtract frequencies using string 2
// 4. If any frequency goes negative, return false

// IMPLEMENT:
function validAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;

  const charCount: Record<string, number> = {};

  for (const char of s) {
    charCount[char] = (charCount[char] || 0) + 1;
  }

  for (const char of t) {
    if (!charCount[char]) return false;
    charCount[char]--;
  }

  return true;
}

// REVIEW: Walk through with "anagram" and "nagaram"
// charCount after s: {a:3, n:1, g:1, r:1, m:1}
// Processing t: n(ok), a(ok), g(ok), a(ok), r(ok), a(ok), m(ok)
// All pass, return true

// EVALUATE: Time O(n), Space O(n) where n is string length
```

**Problem 2: Maximum Subarray (Kadane's Algorithm)**

```typescript
// UNDERSTAND: Find the contiguous subarray with the largest sum
// Input: array of numbers (can be negative). Output: maximum sum number.
// Edge cases: all negative numbers (return the largest), single element

// MATCH: This is Kadane's algorithm - a sliding window variant

// PLAN:
// 1. Track current running sum and max sum seen so far
// 2. At each element, choose: start new subarray or extend current one
// 3. Update max if current sum exceeds it

// IMPLEMENT:
function maxSubArray(nums: number[]): number {
  let currentSum = nums[0];
  let maxSum = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // Either extend the current subarray or start a new one
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// REVIEW: Walk through [-2, 1, -3, 4, -1, 2, 1, -5, 4]
// i=1: curr=max(1, -2+1)=1, max=1
// i=2: curr=max(-3, 1-3)=-2, max=1
// i=3: curr=max(4, -2+4)=4, max=4
// i=4: curr=max(-1, 4-1)=3, max=4
// i=5: curr=max(2, 3+2)=5, max=5
// i=6: curr=max(1, 5+1)=6, max=6
// i=7: curr=max(-5, 6-5)=1, max=6
// i=8: curr=max(4, 1+4)=5, max=6
// Answer: 6 (subarray [4, -1, 2, 1])

// EVALUATE: Time O(n), Space O(1)
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
```

**Problem 3: Reverse a Linked List (Two Pointers)**

```typescript
// UNDERSTAND: Reverse a singly linked list in place
// Input: head of linked list. Output: new head (originally the tail).
// Edge cases: empty list (null), single node (return as is)

// MATCH: Two pointers (three actually: prev, current, next)

// PLAN:
// 1. Initialize prev = null, current = head
// 2. While current exists:
//    a. Save next = current.next
//    b. Point current.next to prev (reverse the link)
//    c. Move prev to current
//    d. Move current to next
// 3. Return prev (new head)

// IMPLEMENT:
function reverseLinkedList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let current = head;

  while (current !== null) {
    const next = current.next;  // Save next
    current.next = prev;         // Reverse the link
    prev = current;              // Move prev forward
    current = next;              // Move current forward
  }

  return prev; // prev is now the new head
}

// REVIEW: Walk through 1 -> 2 -> 3 -> null
// Step 1: prev=null, curr=1, next=2. 1->null. prev=1, curr=2
// Step 2: prev=1, curr=2, next=3. 2->1. prev=2, curr=3
// Step 3: prev=2, curr=3, next=null. 3->2. prev=3, curr=null
// Result: 3 -> 2 -> 1 -> null. Correct!

// EVALUATE: Time O(n), Space O(1)
```

## The quest

**Independent Algorithm Practice**

Solve as many of these as you can. Use the UMPIRE method for each one. Write your solutions in TypeScript. Include Big O analysis in comments.

**Problem 1: Contains Duplicate**
Given an integer array, return true if any value appears at least twice.

```typescript
function containsDuplicate(nums: number[]): boolean {
  const seen = new Set<number>();
  for (const num of nums) {
    if (seen.has(num)) return true;
    seen.add(num);
  }
  return false;
}
// Time: O(n), Space: O(n)
```

**Problem 2: Merge Two Sorted Arrays**
Given two sorted arrays, merge them into one sorted array.

```typescript
function mergeSortedArrays(arr1: number[], arr2: number[]): number[] {
  const result: number[] = [];
  let i = 0;
  let j = 0;

  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] <= arr2[j]) {
      result.push(arr1[i]);
      i++;
    } else {
      result.push(arr2[j]);
      j++;
    }
  }

  return result.concat(arr1.slice(i), arr2.slice(j));
}
// Time: O(n + m), Space: O(n + m)
```

**Problem 3: Move Zeroes**
Given an array, move all 0s to the end while maintaining relative order of non-zero elements.

```typescript
function moveZeroes(nums: number[]): void {
  let insertPos = 0;

  // Move all non-zero elements to the front
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      nums[insertPos] = nums[i];
      insertPos++;
    }
  }

  // Fill remaining positions with 0
  while (insertPos < nums.length) {
    nums[insertPos] = 0;
    insertPos++;
  }
}
// Time: O(n), Space: O(1)
```

**Problem 4: Valid Parentheses**
Given a string containing just '(', ')', '{', '}', '[', ']', determine if the input string is valid.

```typescript
function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ")": "(",
    "}": "{",
    "]": "["
  };

  for (const char of s) {
    if (char === "(" || char === "{" || char === "[") {
      stack.push(char);
    } else {
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}
// Time: O(n), Space: O(n)
```

**Problem 5: Best Time to Buy and Sell Stock**
Given an array of prices where prices[i] is the price on day i, find the maximum profit from one buy and one sell.

```typescript
function maxProfit(prices: number[]): number {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else {
      maxProfit = Math.max(maxProfit, price - minPrice);
    }
  }

  return maxProfit;
}
// Time: O(n), Space: O(1)
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5 (buy at 1, sell at 6)
```

**Problem 6: Rotate Array**
Given an array, rotate it to the right by k steps.

```typescript
function rotate(nums: number[], k: number): void {
  k = k % nums.length; // Handle k > array length

  function reverseSection(start: number, end: number): void {
    while (start < end) {
      [nums[start], nums[end]] = [nums[end], nums[start]];
      start++;
      end--;
    }
  }

  // Reverse entire array, then reverse first k and last n-k
  reverseSection(0, nums.length - 1);
  reverseSection(0, k - 1);
  reverseSection(k, nums.length - 1);
}
// Time: O(n), Space: O(1)
```

**Stretch Problems:**
- Implement a function to find the kth largest element in an unsorted array
- Write a function that groups anagrams together from an array of strings
- Implement a recursive solution for generating all permutations of a string

### Review the artifact

Your deliverable is **Algorithm solutions with invariants, edge cases, and comparative complexity**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-9-3/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Session 9.2 homework (data structure implementations). Review recursion basics. Practice writing functions on paper or a whiteboard (not in an IDE) for at least 20 minutes.
**Materials:** Whiteboard or paper, TypeScript environment, timer for practice problems, UMPIRE problem-solving framework reference card.

**Assignment: Algorithm Arena**
- **Objective:** Practice algorithm patterns and build confidence with whiteboard-style problems
- **Tasks:**
  1. Solve at least 5 of the following problems using TypeScript (with UMPIRE method comments):
     - Two Sum (frequency counter / hash map)
     - Reverse a string in place (two pointers)
     - Maximum subarray sum of size k (sliding window)
     - Merge sort implementation (divide and conquer)
     - Binary search on a sorted array (divide and conquer)
     - Check if a string is a palindrome (two pointers)
     - Find the missing number in an array of 1 to n (math / XOR)
     - Implement a function to flatten a nested array (recursion)
  2. For each solution, include:
     - A comment explaining the pattern used
     - Time complexity analysis
     - Space complexity analysis
  3. Write at least one solution on paper or a whiteboard first, then type it up
- **Stretch Goals:**
  - Solve 3 medium-difficulty problems on LeetCode using the patterns from today
  - Implement an in-place quicksort (partitioning without extra arrays)
  - Write a memoized recursive solution and explain why memoization helps
- **Submission:** Push to your GitHub repo in the `algorithm-practice/` folder
- **Due:** Before Session 9.4

---

### Manual verification and further reading

- [Official reference 1](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
