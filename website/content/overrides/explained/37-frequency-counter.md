---
title: "The frequency counter"
lede: "A frequency table preserves how many times something appears. That makes it useful for questions a simple membership check cannot answer."
youtube: i3qv0fc5nb4
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# The frequency counter

A party's crafting recipe needs two rubies and one shard. The inventory contains one ruby and two shards. Both inventories contain the same kinds of objects, so a set would miss the shortage. Counts reveal the difference immediately.

The frequency-counter pattern turns repeated searches into a record of occurrences. Build the counts once, then compare or consume them as the problem requires. For anagram checking, for example, each character used by the second word must have a remaining occurrence from the first.

## Keep the question attached to the table

A map can count letters, item identifiers, response statuses, or almost anything with a meaningful key. The choice of key matters: treating uppercase and lowercase as equivalent is a requirement you must decide, not a property the data structure supplies.

The usual benefit is avoiding repeated scans. Building and checking a table can take linear expected time with suitable map operations, at the cost of memory for distinct keys. You have traded space for less repeated work.

Trace a case with duplicates and a missing occurrence, rather than only two perfectly matching lists. Watch the count reach zero and decide what another request for that key should mean. That moment connects an interview pattern to practical inventory, reconciliation, and validation problems throughout the course.

[Original episode on YouTube](https://www.youtube.com/watch?v=i3qv0fc5nb4).
