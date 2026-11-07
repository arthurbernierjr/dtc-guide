## The idea

Picture a homework notebook. Page 7 asks a question that contains page 3 inside it. You already did page 3. You do not work it again. You look at what you wrote and use it. Dynamic programming is that notebook for a problem that keeps containing smaller copies of itself, the same copies, over and over.

The page number is the state. You say it in words: "page i is the cheapest way to make amount i" or "page i is the number of ways to climb i stairs." The sentence that builds page i from earlier pages is the recurrence. You decide what the last choice was, then trust the pages that choice would have left behind. The first pages, the ones you can fill with no earlier page, are the base cases. You fill the notebook in an order where every page you need is already written. That filling order is tabulation, bottom-up. Memoization is the other direction: start at the last page, and the first time you need an earlier page, solve it and write it down. A rolling array is keeping only the last page or two when later pages never look further back.

The structure you need is called optimal substructure. The best answer really is built from best answers to the smaller pages. If a locally best page could spoil the final answer, the notebook lies, and this is the wrong tool.

## Why it matters

You reach for the notebook when the problem asks for a number of ways, a minimum cost, a maximum value, a longest subsequence, whether you can reach or partition something, an edit, a knapsack with a capacity, or paths across a grid. The brute force is exponential, because it re-solves the same page every time it appears.

The time is the number of states times the work to fill one of them from its neighbors. The space is the number of states, and you can often drop a dimension when a page only reads the previous row or the previous one or two values.

## A small example

```javascript
function ways(n) {
  if (n <= 1) return 1;
  let prev = 1;
  let cur = 1;
  for (let i = 2; i <= n; i++) {
    const next = prev + cur;
    prev = cur;
    cur = next;
  }
  return cur;
}

const stairs = ways(4);
```

Page i is the ways to climb i stairs, one or two at a time. It is the sum of the previous two pages. `stairs` is `5`. `prev` and `cur` are the rolling notebook: two pages, constant space, linear time.

## What the code below is doing

The sheet's template is the five-step fill: name the state in words, write the recurrence from the last choice, set the base case, iterate so dependencies come first, then read the answer off `dp[n]` or the max over the table. It also names the two directions, top-down memo and bottom-up tabulation, and the rolling array that shrinks a row.

The 1-D pages come first. Climbing stairs is Fibonacci with two rolling variables. House robber takes the better of skipping this house or robbing it plus the page from two houses back. House robber II runs that twice on a circle, once without the first house and once without the last. Coin change (fewest coins) is an unbounded knapsack for a minimum: `dp[a]` is one plus the best page at `a - coin`. Coin change II counts combinations, and the coins loop stays outside the amount loop so order does not get counted as a different combination. The 0/1 knapsack for maximum value walks capacity descending, so each item is used once. The unbounded twin walks capacity ascending, so items can repeat. Partition into an equal subset sum is the boolean cousin: target is half the total, and a descending capacity loop marks reachable sums.

Longest increasing subsequence is the sequence page, O(n²) by checking every earlier smaller value, plus the patience-sorting version that keeps the smallest tail of each length and binary-searches it, O(n log n). Longest common subsequence and edit distance are the string tables, rows by columns, O(mn). Unique paths and minimum path sum are the grid tables; the first rolls a row, the second writes into the grid. Word break asks whether a prefix can be split into dictionary words. Decode ways counts ways to read a digit string, one digit or a pair from 10 to 26. Maximum product subarray tracks a running max and a running min, because a negative flips them. Longest palindromic subsequence fills by substring length, and it is the same answer as the longest common subsequence of the string and its reverse. Kadane shows up again as the page "best subarray ending here."

When you talk about it, say this: name the state in a sentence, name the last choice, then fill the notebook in dependency order.
