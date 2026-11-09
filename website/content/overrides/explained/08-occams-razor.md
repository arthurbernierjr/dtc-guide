---
title: "Occam's razor"
lede: "A good debugging hypothesis explains the evidence and suggests a cheap way to prove itself wrong."
youtube: OY1B-2f1uSE
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Occam's razor

The login screen worked yesterday. Today it rejects everyone. You could invent a story about corrupted databases, a broken cryptographic library, and a coordinated attack. You could also check whether the server loaded the signing secret you changed this morning.

Occam's razor helps order the investigation. When several explanations fit the evidence, prefer the one that requires fewer unsupported assumptions. That preference is a starting point for a test, not permission to declare victory before gathering evidence.

## Let the result change your mind

Write down the observation precisely: “every token receives 401 after deployment” is more useful than “authentication is broken.” Then choose a hypothesis and a discriminating check. If the secret is missing, the startup configuration should show that fact without printing the secret itself. If configuration is correct, move on to the next explanation.

The dangerous habit is protecting your first guess. Repeating the same restart five times does not make the explanation stronger. A failed check should reduce your confidence and change what you inspect next.

This makes debugging feel less like being judged by an all-knowing machine. You are conducting a small investigation. Keep a record of what you expected, what you observed, and which possibility you eliminated. Over time, that record becomes more valuable than a collection of mysterious fixes that happened to make the error disappear.

[Original episode on YouTube](https://www.youtube.com/watch?v=OY1B-2f1uSE).
