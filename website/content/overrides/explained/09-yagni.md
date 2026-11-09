---
title: "YAGNI"
lede: "Every imagined future feature becomes a present obligation. YAGNI asks whether that obligation has a real customer yet."
youtube: aqKjjgUDIUo
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# YAGNI

You are building a quest board for one guild. Before the first member can post a quest, you add multiple currencies, a plugin marketplace, and five interchangeable database adapters. It feels like preparing for success. It also means the first useful version now depends on decisions nobody has asked you to make.

“You aren't gonna need it” is a discipline for working under uncertainty. Build the capability supported by the requirement you have. Let an actual new requirement teach you what the next capability must be.

## Keep the future cheap to change

This does not mean hard-coding everything or ignoring obvious boundaries. A small function around an external service can make today's code easier to understand and tomorrow's provider easier to replace. A universal integration framework may cost far more than the replacement it imagines.

The distinction is evidence. Is a second caller already waiting? Are two implementations repeating the same business rule? Does this boundary isolate a dependency you already have? Those are concrete reasons to invest. “Successful companies eventually need this” is much less specific.

A useful backlog has a place for good ideas that are not current work. Write the condition that would justify revisiting each one: a second paying organization, a measured query bottleneck, or a repeated support request. In [The Quest Board](/path/8-2-the-quest-board/), those conditions help you keep ambition visible without making the first release carry all of it.

[Original episode on YouTube](https://www.youtube.com/watch?v=aqKjjgUDIUo).
