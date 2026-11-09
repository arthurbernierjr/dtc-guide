---
title: "Divide and conquer"
lede: "Dividing a problem helps only when the smaller answers can be combined correctly and the division eventually reaches something simple."
youtube: rGzmoZ1dREQ
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Divide and conquer

Sorting a large stack of quest cards is easier to organize when you split it into smaller stacks, sort each one, and merge the results. Merge sort makes that idea precise: the smaller stacks obey the same problem definition as the original, and the merge step has a clear responsibility.

A single card is already sorted. That is the base case, the point where division stops. Without a stopping condition that the recursion actually approaches, the elegant story turns into a program that keeps asking itself for help.

## The combine step earns the result

Two sorted halves do not automatically make a sorted whole. Compare the first remaining item in each half, take the smaller, and continue. That merge operation explains why the recursive answers are useful.

The cost of dividing and combining matters too. Splitting work into many calls does not itself guarantee a faster algorithm. You need to account for how much work happens at each level and how many levels the input creates.

Try sorting eight numbered cards while saying which stage you are performing: divide, solve, or combine. Then compare that picture with [dynamic programming](/explained/dynamic-programming/). Independent subproblems suggest one kind of structure; repeatedly overlapping subproblems suggest a reason to remember answers. The names become useful once you can see the shape of the work.

[Original episode on YouTube](https://www.youtube.com/watch?v=rGzmoZ1dREQ).
