---
title: "Disk and memory"
lede: "A value can exist in your program without being safely saved. Memory and persistent storage have different lifetimes, and users care about the difference."
youtube: Uys9PYFDMcE
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Disk and memory

You type a character biography and see it on screen. That proves the interface can display your draft. It does not yet prove the draft will survive a refresh, a process restart, or a machine failure.

Memory holds the working state a running program uses. Persistent storage is intended to retain data beyond that program's lifetime. A database builds additional behavior around storage, such as queries, indexes, and rules for coordinating updates. These are related layers rather than interchangeable names for “where data goes.”

## Ask what survives the next interruption

A JavaScript array disappears when its process exits. A file on a persistent disk may survive that restart, but a file inside a disposable deployment may not survive replacement. A database write has its own durability guarantees and failure conditions.

That is why the reload test is so revealing. Create a record, reload, and trace where the second request obtains it. If the result survives only because the frontend still remembers it, you have demonstrated a convincing screen rather than persistence.

[The Vault](/path/4-5-the-vault/) gives the course a place for records to outlive the server process. Keep the episode's storage imagery, then attach a lifetime to every box in your diagram: this request, this process, this deployment, or the durable record the user expects to find tomorrow.

[Original episode on YouTube](https://www.youtube.com/watch?v=Uys9PYFDMcE).
