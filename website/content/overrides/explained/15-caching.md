---
title: "Caching"
lede: "A cache buys speed by keeping a reusable copy. The hard design question is how long that copy deserves to be believed."
youtube: xkRg_Tyil0w
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Caching

The treasure-chest image in this episode captures the pleasure of a cache hit: you find what you need nearby instead of making the full journey again. A miss sends you to the original source, and eviction makes room when the chest cannot hold everything.

Now give the guild's public quest list a sixty-second cache. Most visitors get a quick answer without repeating the database query. But a newly accepted quest may remain visible until the cached copy expires. The speed improvement has introduced a freshness decision.

## Different facts tolerate different ages

A slightly old profile picture may be harmless. A slightly old permission decision or remaining inventory count can affect what someone is allowed to do. The right cache policy follows the meaning of the data, not a universal preference for faster responses.

Decide what identifies a cached answer. If two users have different private results, a key containing only the URL can accidentally treat those results as interchangeable. Decide also what happens when the cache is empty or unavailable; the application needs a fallback whose load it can survive.

Before adding a cache, measure the expensive repeated work. Then write down what invalidates the copy and how a user might notice its age. [The guild-hall system-design primer](/system-design/digital-mansion-primer/) is a useful counterweight to the urge to add one everywhere: sometimes the simpler database query already meets the need.

[Original episode on YouTube](https://www.youtube.com/watch?v=xkRg_Tyil0w).
