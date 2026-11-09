---
title: "Big O"
lede: "Big O describes how an algorithm's appetite grows as the input grows. It helps you see when a solution that feels instant will stop feeling small."
youtube: HILULGoJISk
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Big O

Finding a name in an unsorted guest list may require reading every entry. Comparing every guest with every other guest creates far more work. Both tasks can feel effortless with ten names, which is why a tiny successful example tells you little about how the approach will behave later.

If a single scan doubles its work when the list doubles, linear growth is a useful model. If the relevant work involves all pairs, doubling the list produces roughly four times as many pairs. Big O describes that growth rather than promising a particular number of milliseconds.

## Count the work you actually repeat

A loop inside another loop deserves attention, but the shape of the code is not the whole argument. A nested loop whose inner section always runs three times still performs work proportional to the outer input. A helper that scans an array can hide another loop behind an innocent-looking function call.

Space is a separate question. A faster lookup may need a map holding every distinct value. That can be a good trade, provided you name the memory cost instead of calling the optimization free.

In [Trial of Blades](/path/9-2-trial-of-blades/), compare the slow version with its replacement at several input sizes. First predict the growth, then inspect the measurements. The prediction is what turns a benchmark from a dramatic number into an explanation.

[Original episode on YouTube](https://www.youtube.com/watch?v=HILULGoJISk).
