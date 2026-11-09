---
title: "Availability"
lede: "Availability is a promise about a user's ability to complete a particular action, measured over a particular period."
youtube: NcdrWrHooh8
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Availability

A friend who answers every message except the urgent ones may be technically responsive and practically unreliable. The same problem appears in software: a homepage can load while checkout, login, or saving a document is unavailable.

Before discussing “high availability,” name the operation that matters. For a guild hall, being available might mean that a signed-in member can read their inbox and send a letter. A health endpoint returning 200 is useful evidence about one boundary, but it cannot alone establish that whole journey.

## Extra copies need independent ways to fail

Two application instances help when one process crashes. They help less if both rely on the same failed database, credential, or network path. Redundancy deserves a dependency map, otherwise the diagram can look resilient while preserving one shared point of failure.

Recovery time matters too. A service that usually restarts quickly may still require a person to notice and repair some failures. Name that person or monitoring mechanism before relying on the restart story.

A practical availability discussion ends with a scenario: this dependency stops, this user action fails, this signal detects it, and this procedure restores it. [Opening the World Gate](/path/6-4-opening-the-world-gate/) gives you a deployed service on which to ask those questions. The percentage becomes useful after you know what experience it is measuring.

[Original episode on YouTube](https://www.youtube.com/watch?v=NcdrWrHooh8).
