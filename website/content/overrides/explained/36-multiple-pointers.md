---
title: "Multiple pointers"
lede: "Two positions can replace a search through every pair when the input gives you a reason to discard whole groups of candidates."
youtube: XsDuqhS2apE
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Multiple pointers

Take the sorted numbers 1, 3, 4, and 7, and look for a pair totaling 8. Put one pointer at each end. The first sum is already 8. If it had been too small, moving the right pointer left could only make it smaller; moving the left pointer right is the useful direction.

That argument is why sorting matters. Pointer movement is justified by an ordering property. Without it, the same movement can skip the answer you need.

## The pointers do not always move toward each other

Another form uses a reader and a writer traveling in the same direction. When removing unwanted values in place, the reader examines each item while the writer marks where the next kept item belongs. The region behind the writer is the finished part of the answer.

These are different patterns with a shared habit: each pointer has a job, and movement preserves a rule you can explain. Naming those jobs is more useful than memorizing a loop skeleton.

On paper, mark what has been ruled out after every step. If you cannot justify skipping it, the algorithm needs another condition or another approach. The [Two Pointers reference](/algorithms/patterns/two-pointers/) offers variations once the basic elimination argument feels convincing.

[Original episode on YouTube](https://www.youtube.com/watch?v=XsDuqhS2apE).
