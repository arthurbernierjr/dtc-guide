---
title: "The sliding window"
lede: "A sliding window saves work by carrying useful information from one neighboring range to the next."
youtube: fiCGZHIs30Y
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# The sliding window

You want the largest total from any three consecutive days of guild donations. The obvious approach adds each group of three from scratch. But adjacent groups overlap: moving from days 1–3 to days 2–4 removes day 1 and adds day 4. The middle two values do not need to be processed again.

That is a fixed-size window. Its update rule is easy to explain because the range always has the same length. Variable-size windows need another rule: when should the left edge move, and what remains true as it moves?

## State the condition before trusting the pattern

Finding the shortest range whose sum reaches a target can use an expanding-and-shrinking window when the values are nonnegative. Removing a value then cannot increase the sum. Negative values change that reasoning, so an implementation that works beautifully on positive examples may miss a valid answer.

The pattern's power comes from this argument about what can be skipped. Two pointers moving across an array are only the visible mechanism.

[Trial of Wits](/path/9-3-trial-of-wits/) walks a window cell by cell and includes a deliberately incorrect shrink step. Keep a slow version beside the optimized one. When they disagree, a small counterexample teaches you more than another page of successful examples ever could.

[Original episode on YouTube](https://www.youtube.com/watch?v=fiCGZHIs30Y).
