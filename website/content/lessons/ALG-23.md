## The idea

Picture a wooden ruler and strips of colored tape. Each strip covers a start inch and an end inch. Piano is the tape from 1 to 3. Soccer is the tape from 2 to 6. They share the inches from 2 to 3, so they overlap. A third strip from 8 to 10 sits in a gap. You can see the overlap with one test: each strip starts at or before the other one ends. `a` starts at or before `b` ends, and `b` starts at or before `a` ends.

Almost every question on this ruler starts the same way. Sort the strips, then sweep a finger from left to right once. Which end you sort by is the whole decision. Sort by start when you are merging, inserting, or asking what is open right now. The finger extends the last piece of tape whenever the next strip starts before that piece ends. Sort by end when you want as many strips as possible that do not overlap, or as few arrows as possible to burst every balloon. The strip that finishes earliest leaves the most ruler for everyone else. Picking it never spoils a later choice. That is the greedy step, the same one as activity selection.

## Why it matters

You reach for this when the problem says intervals, meetings, overlap, merge, rooms, schedule, balloons or arrows, free time, busy, or non-overlapping. Drawing every pair and testing it is quadratic. The sort puts the ruler in order. The sweep is a single finger.

The sort is O(n log n). The sweep after it is O(n). Versions that keep a min-heap of end times stay O(n log n).

## A small example

```javascript
function mergeTape(blocks) {
  const sorted = blocks.slice().sort((a, b) => a[0] - b[0]);
  const out = [];
  for (const [start, end] of sorted) {
    const last = out[out.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else out.push([start, end]);
  }
  return out;
}

const day = mergeTape([[1, 3], [2, 6], [8, 10]]);
```

Sorted by start, `[1, 3]` and `[2, 6]` fuse into `[1, 6]`, and `[8, 10]` stays its own strip. `day` is `[[1, 6], [8, 10]]`.

## What the code below is doing

The sheet starts with two comparators, `byStart` and `byEnd`, and the overlap test for closed intervals. Merge intervals sorts by start and extends `last.end` when the current start falls at or before it. Insert interval assumes the input is already sorted and non-overlapping: copy everything that ends before the new strip, fuse everything that overlaps it, then copy the rest. That one is linear, because the sort was already done.

Non-overlapping intervals, the minimum number to remove, sorts by end. You keep a strip when its start is at or after the last kept end. Removals are `n` minus how many you kept. Meeting rooms I sorts by start and reports a conflict when any meeting starts before the previous one ends. Meeting rooms II, the minimum number of rooms, has two shapes. The two-pointer shape sorts starts and ends separately: a start before the next end means a new room, otherwise you reuse one. The heap shape sorts by start and keeps a min-heap of end times, popping any room that has freed up. The heap's size is the room count.

Minimum arrows to burst balloons sorts by end and fires a new arrow only when a balloon starts after the last arrow's position. Interval-list intersection takes two already-sorted lists and walks two fingers: the overlap runs from the later start to the earlier end, and you advance the list that ends first. That is O(n + m). Employee free time flattens every schedule, sorts by start, merges, and reads the gaps between merged blocks as the free stretches.

The last section is the heuristic in one place. Sort by start for merging, inserting, any-overlap, and sweeping resources. Sort by end for the maximum number of non-overlapping intervals, minimum arrows, and minimum removals. Rooms II is the case that sorts both.

When you talk about it, say this: sort, then sweep, and say whether you sorted by the start or by the end.
