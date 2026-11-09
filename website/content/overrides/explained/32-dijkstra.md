---
title: "Dijkstra's algorithm"
lede: "Dijkstra's algorithm expands the cheapest known frontier, using nonnegative edge costs to make each settled distance trustworthy."
youtube: b1gLmFgQW1c
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Dijkstra's algorithm

A map can mislead you if you count roads instead of travel cost. One direct road may take ten minutes while two shorter roads take three minutes each. Breadth-first search solves a different problem when it treats every edge as an equal step.

Dijkstra's algorithm maintains tentative distances from a starting point. It repeatedly chooses the unsettled node with the smallest known distance and checks whether routes through that node improve its neighbors. A priority queue makes finding the next candidate efficient on larger graphs.

## The assumption that makes the shortcut safe

Nonnegative edge weights are essential to the usual algorithm. Once the cheapest candidate is settled, a later detour cannot make it cheaper by adding only nonnegative costs. Negative edges break that reasoning and call for a different approach.

For a small dungeon map, draw four rooms and write a cost beside each corridor. Keep two records: the best distance found so far and the previous room on that route. The second record lets you reconstruct an actual path instead of merely reporting its price.

Do one round at a time and explain every changed distance. A route that was discovered first may later improve; a settled route has a stronger claim. That distinction is the heart of the algorithm and a useful introduction to proving why a greedy choice is justified.

[Original episode on YouTube](https://www.youtube.com/watch?v=b1gLmFgQW1c).
