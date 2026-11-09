---
title: "Content delivery networks"
lede: "A CDN shortens the journey for reusable content. Its effectiveness depends on which response can be shared and how a changed version becomes visible."
youtube: pS1vetPV1UM
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Content delivery networks

A neighborhood pizza shop does not send every order back to one distant kitchen. The episode uses that intuition to introduce distributed delivery: copies closer to the audience can reduce the distance and repeated work involved in serving the same content.

A course's stylesheet is a good candidate. Thousands of learners can receive identical bytes. A private inbox is a different case, because two people visiting the same route are not entitled to the same response.

## Publish a new identity when the file changes

If you replace `styles.css` while caches still hold the old bytes, some visitors may see yesterday's design. A versioned filename lets the page request a new resource explicitly. The old cached file can remain valid for pages that still reference it.

Caching rules are therefore part of publishing. Decide what may be cached, how long it may be reused, and how a new version is addressed. Check personalized responses carefully so a performance improvement does not become an accidental sharing mechanism.

A CDN also does not remove the need for an origin or a plan for misses. The first request for an uncached object still has to find the content somewhere. Connect this episode with [Caching](/explained/caching/): the network of copies becomes easier to reason about once each copy has a defined identity and lifetime.

[Original episode on YouTube](https://www.youtube.com/watch?v=pS1vetPV1UM).
