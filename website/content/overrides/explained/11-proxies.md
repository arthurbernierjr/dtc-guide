---
title: "Forward and reverse proxies"
lede: "A proxy changes who speaks directly to whom. That single distinction explains the difference between a gateway for users and a gateway for servers."
youtube: EWMX_1qZxaI
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Forward and reverse proxies

Imagine two doors in the same city. At one, travelers ask a representative to fetch things on their behalf. At the other, visitors approach a public reception desk that forwards requests to the appropriate office. Both involve an intermediary, but the intermediary represents a different side.

A forward proxy sits on the client's side of the relationship. A reverse proxy fronts the server side. That distinction is more durable than memorizing a diagram, because it tells you whose routing, access, or availability problem the proxy is helping solve.

## One public address, several private jobs

The guild hall might publish a single HTTPS address while its application runs on an internal port. A reverse proxy can terminate TLS, serve static files, and forward API requests. Later it might distribute requests among several application instances.

Each new hop also adds something to inspect. A healthy application can be unreachable through a misconfigured proxy. A proxy can answer successfully while forwarding the wrong path. Trace the request across both boundaries instead of assuming the public response came directly from your program.

[The Gatekeeper](/path/6-2-the-gatekeeper/) makes this concrete with Nginx. Draw the browser, proxy, and application as three boxes. Label each connection with its address and port. If you can explain both arrows, configuration stops looking like a collection of magic incantations.

[Original episode on YouTube](https://www.youtube.com/watch?v=EWMX_1qZxaI).
