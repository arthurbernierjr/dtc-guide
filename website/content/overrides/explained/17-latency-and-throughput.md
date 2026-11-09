---
title: "Latency and throughput"
lede: "The time one person waits and the amount of work the system completes are related measurements, but improving one does not guarantee the other improves."
youtube: Oe5j0TAtnK0
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Latency and throughput

The bus analogy is memorable because a bus can carry many passengers and still leave one passenger waiting a long time. Throughput concerns completed work over an interval. Latency concerns how long a particular operation takes.

Suppose the guild's export job processes a thousand records at once. Batching might increase records processed per second while making the first person wait longer for any result. Conversely, reserving resources for interactive requests might make the screen feel faster while reducing the capacity available to background jobs.

## Watch the slowest experiences, too

An average can hide the people who had the worst wait. Nine fast requests and one painfully slow request may produce an acceptable-looking average, even though the unlucky user experiences the service as broken. Percentiles help describe that spread.

Always name the operation and the boundary you are timing. Browser-to-browser elapsed time includes work that a database query timer does not. Requests per second says little without knowing what each request does and how many fail.

For a first measurement, follow one user action from click to visible result. Then separately count how many successful actions the system completes during a busy interval. You now have two questions you can improve deliberately, rather than a single vague complaint that “the server is slow.”

[Original episode on YouTube](https://www.youtube.com/watch?v=Oe5j0TAtnK0).
