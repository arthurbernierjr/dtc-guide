---
title: "The KISS principle"
lede: "Simplicity is the amount of reasoning a change requires, not the number of characters you can squeeze onto one line."
youtube: _mSi8e8y8w0
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# The KISS principle

A small guild needs a way to mark quests complete. You can write one clear update function, or build a configurable workflow engine with plugins for kingdoms that do not exist yet. Both might support today's checkbox. Only one asks tomorrow's maintainer to understand a second product before changing it.

KISS is useful when you make that comparison honestly. It favors a design whose behavior you can explain and whose moving parts have earned their places. Short code can be difficult to understand; a few explicit branches may make the same rule much easier to review.

## Simplicity must include the inconvenient case

A transfer function that subtracts gold and hopes the deposit succeeds is short. It is not a complete solution to moving gold. The required failure behavior belongs in the design, even when it costs more lines.

The question is therefore: what is the simplest design that satisfies the real contract? Include the empty list, invalid input, permissions, and the interruption you actually need to survive. Remove machinery that contributes nothing to those requirements.

During your next review, choose one abstraction and explain the decision it centralizes. If the answer is only “we might need it later,” investigate whether a direct implementation would be clearer. If it protects an important rule across several callers, keeping it may be the simpler choice. [YAGNI](/explained/yagni/) takes that same judgment into the question of when to build a feature at all.

[Original episode on YouTube](https://www.youtube.com/watch?v=_mSi8e8y8w0).
