# algorithms/ — interview cheat-sheets

Every `.js` file runs standalone: `node <file>` prints `ok: algorithms/<file>` and exits 0.
Every example is an `assert`, so each file is also a self-test.

## Files

| File | What's inside |
|---|---|
| `complexity-cheatsheet.md` | Big-O tables: data structure ops, sorting algorithms, recurrences, vocabulary |
| `arrays.js` | prefix sums, Kadane, two-sum, rotate (triple reverse), Dutch flag, product except self, merge sorted, cyclic sort / missing / duplicate (Floyd), Boyer-Moore majority, buy-sell stock, move zeroes |
| `strings.js` | palindrome, anagram (freq[26]), reverse words, longest palindromic substring (expand center), LCP, compression, first unique, isomorphic, group anagrams, atoi, roman, KMP failure table, char-code math |
| `hash-maps.js` | frequency idiom, two-sum, group anagrams, longest consecutive (Set), subarray sum = k (prefix map), dup within k, LRU via Map order, first non-repeating, intersection, top-k (bucket), HashMap design (chaining) |
| `two-pointers.js` | two-sum II, 3-sum, container with most water, remove dups in place, sorted squares, trapping rain water, palindrome II, merge from back, Lomuto partition |
| `sliding-window.js` | fixed + variable window TEMPLATES, max sum k, longest no-repeat, at most k distinct, min window substring, anagrams in string, max consecutive ones III, sliding max (monotonic deque) |
| `binary-search.js` | lo<=hi template, lower/upper bound, insert position, first bad version, rotated search/min, peak, binary-search-on-answer (Koko, ship capacity, split array), 2D matrix, sqrt |
| `sorting.js` | comparators, merge sort, quick sort (Lomuto + Hoare), quickselect, counting, bucket, heap sort, insertion, sort colors, merge intervals, TimSort note |
| `stacks-queues.js` | valid parens, min stack, RPN, decode string, simplify path, queue via 2 stacks, stack via queue, monotonic stack TEMPLATE (next greater, daily temps, histogram, remove k digits), circular queue, O(1) queue head-index |
| `linked-lists.js` | ListNode + helpers, reverse, middle, Floyd cycle + start, merge sorted, remove nth from end, reorder, palindrome, add two numbers, intersection, remove dups, DLL + LRU sketch, reverse k-group |
| `trees-bst.js` | DFS pre/in/post, BFS level order, views (left/right/top/bottom), boundary, LCA, validate BST, serialize |
| `heaps.js` | MinHeap class (comparator), kth largest, top-k frequent, merge k sorted, median stream (two heaps), k closest, task scheduler, meeting rooms II, reorganize string, ugly numbers |
| `graphs.js` | adjacency list, BFS (+path), DFS rec/iter, components, islands, clone, cycle detect (3-color / parent), topo sort (Kahn + DFS), course schedule, Dijkstra, Bellman-Ford, Union-Find, Kruskal, bipartite, word ladder |
| `tries.js` | Trie insert/search/startsWith/delete, autocomplete, word search II idea, LCP via trie, replace words, wildcard search, count prefix |
| `dynamic-programming.js` | DP TEMPLATE, memo vs tab vs rolling; stairs, house robber I/II, coin change I/II, LIS (n^2 + n log n), LCS, edit distance, 0/1 + unbounded knapsack, unique paths, min path sum, word break, partition subset, decode ways, max product, LPS, Kadane |
| `backtracking.js` | choose/explore/un-choose TEMPLATE; subsets I/II, permutations I/II, combinations, combination sum I/II, parentheses, phone letters, N-Queens, word search, palindrome partition, sudoku |
| `recursion.js` | anatomy, fast pow, digit sum, reverse string, flatten, deep clone, Hanoi, memo fib, recursion -> explicit stack, TCO note, stack depth, mutual recursion |
| `intervals.js` | merge, insert, non-overlapping (min removals), meeting rooms I/II (two-pointer + heap), arrows, intersection, employee free time, sort-by-start vs sort-by-end |
| `matrices.js` | directions idiom, in-bounds, traversals, transpose, rotate CW/CCW, spiral, set zeroes O(1), search 2D I/II, islands, flood fill, max island, rotting oranges, diagonal, game of life, pascal, word search |
| `bit-manipulation.js` | operator table, bit idioms, single number I/II, popcount (Kernighan), counting bits, reverse bits, missing via XOR, add without +, subsets via bitmask, bitmask visited |


## Which pattern when

Rows marked ★ use only moves Session 9.3 already handed you: the frequency counter, two pointers, sliding window, binary search, sorting and the stack. The third column is the condition the pattern needs, or the input that breaks it; say it out loud before you pick the pattern.

| Problem TELL | Pattern | Condition or counterexample |
|---|---|---|
| ★ sorted array + target | binary search / two pointers | the array is already sorted; unsorted input costs an O(n log n) sort first |
| ★ contiguous subarray / substring | sliding window or prefix sum | a target-sum window needs every value >= 0; `[3, -2, 4, 1]` with target 5 breaks it, so negatives go to prefix sum |
| ★ subarray sum equals k / count subarrays | prefix sum + hash map | none; negatives are fine, which is why it replaces the window there |
| top k / kth largest / kth smallest | heap (size k) or quickselect | quickselect is O(n) on average and O(n^2) on an unlucky pivot; the heap is O(n log k) always |
| k-way merge / "k sorted lists" | min-heap of heads | each list is already sorted |
| running median | two heaps | none |
| next greater / next smaller / span | monotonic stack | none |
| sliding window max/min | monotonic deque | the window size k is fixed |
| shortest path, unweighted | BFS | every edge costs the same; one weighted edge and BFS is wrong |
| shortest path, weighted non-negative | Dijkstra | no negative edge weights |
| shortest path, negative edges | Bellman-Ford | no negative cycle reachable from the source (it can detect one, not route through it) |
| all combinations / permutations / subsets | backtracking | n is small; the output itself is n! or 2^n items |
| count ways / min cost / max value, overlapping subproblems | dynamic programming | the same subproblem must come up again; if nothing repeats, it is plain recursion |
| optimal substructure + greedy-choice works | greedy (prove exchange argument) | counterexample: coins 1, 3, 4 and target 6; greedy takes 4 + 1 + 1, optimal is 3 + 3 |
| connected components / "union" / "same group" | union-find or DFS | the graph is undirected; directed groups need strongly connected components |
| dependencies / prerequisites / ordering | topological sort | the graph is directed with no cycle; a cycle means no valid order exists |
| prefix matching / autocomplete / many words | trie | none |
| ★ intervals / meetings / overlaps | sort by start, then sweep | none |
| ★ max non-overlapping intervals | sort by end, greedy | sort by end, not start; one long early interval breaks the sort-by-start version |
| linked list middle / cycle | fast & slow pointers | none |
| in-place array of 1..n | cyclic sort / index as hash | the values are exactly 1..n (or 0..n-1) |
| duplicate in array of 1..n, O(1) space | Floyd cycle on indices | n+1 values, each in 1..n |
| majority element | Boyer-Moore voting | a majority (more than n/2 copies) exists; if it is not promised, verify with a second pass |
| ★ matching brackets / nested structure | stack | none |
| grid traversal | BFS/DFS with directions array | none |
| multi-source spread (rotting, distance to nearest) | multi-source BFS | every source starts at the same time and every step costs the same |
| minimize the maximum / "min capacity such that..." | binary search on the answer | the check is monotone: if capacity c works, every larger capacity works too |
| XOR / parity / "appears once" | bit manipulation | every other value appears an even number of times |
| n <= 20 and subsets | bitmask enumeration | n is about 20 or less; 2^n masks |
| LRU / LFU | Map insertion order or DLL + map | none |
| string equality under rotation/pattern | KMP / hashing | hashing can collide; KMP is exact |

## Constraint -> acceptable complexity

| n | Target complexity | Typical approach |
|---|---|---|
| n <= 12 | O(n!) | permutations, brute force |
| n <= 25 | O(2^n) | bitmask, subsets, backtracking |
| n <= 100 | O(n^4) | nested loops, 3D DP |
| n <= 500 | O(n^3) | Floyd-Warshall, interval DP |
| n <= 10^4 | O(n^2) | 2D DP, pairs |
| n <= 10^6 | O(n log n) | sort, heap, binary search, divide & conquer |
| n <= 10^8 | O(n) | single pass, hash map, two pointers, sliding window |
| bigger | O(log n) / O(1) | binary search, math, bit tricks |

Rule of thumb: ~10^8 simple operations per second in JS. Multiply the complexity by n and compare.

Worked once, with n = 10,000 items. The nested-loop version is n^2 = 10,000 × 10,000 = 100,000,000 operations, about one second in JS. The sort-first version is n log n ≈ 10,000 × 14 = 140,000 operations, well under a millisecond. The n^2 already counts both loops (the outer runs n times, the inner runs n times inside each), so you do not multiply by n again; "multiply the complexity by n" above means put your n into the formula, once.
