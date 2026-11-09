---
title: "Node.js"
lede: "Node.js can make progress while a request waits for data. It still needs you to keep long calculations from occupying the main JavaScript thread."
youtube: EGpZEmrA86s
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Node.js

The chef in this episode's kitchen metaphor can put a pot on the stove and prepare another order while it heats. Standing motionless beside every pot would waste the kitchen. Non-blocking I/O gives a server a comparable opportunity: arrange a database or network operation, then let other work proceed while the result is pending.

That does not mean every operation happens in parallel or that JavaScript has become infinitely fast. The event loop still needs opportunities to run callbacks and continue waiting requests. A long synchronous calculation can occupy the main thread while every customer watches the same door.

## Waiting and working need different remedies

Consider two slow endpoints. One spends most of its time waiting for a remote API. The other calculates a huge report in a tight loop. Adding `async` to both functions does not solve both problems. The first may benefit from overlapping independent I/O. The second needs smaller work, an improved algorithm, a worker, or a separate job process.

This distinction also helps you read an incident. If all endpoints become sluggish during one expensive report, the problem may be shared execution time rather than a slow database. Measure where the time is spent before adding machines.

[The Runtime Beyond the Browser](/path/4-1-the-runtime-beyond-the-browser/) introduces Node as an actual process with files, modules, and a lifetime. Keep that picture alongside the kitchen: requests arrive at a running program, and its choices affect everyone it serves.

[Original episode on YouTube](https://www.youtube.com/watch?v=EGpZEmrA86s).
