---
title: "TCP, IP, HTTP, and DNS"
lede: "A browser visit crosses several boundaries. Knowing which boundary failed is more useful than calling every problem “the internet.”"
youtube: -C6PKeEHA70
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# TCP, IP, HTTP, and DNS

You type the guild hall's address and wait. Before its homepage can appear, several separate agreements have to work. DNS helps resolve the name. IP addresses identify where packets should go. A transport carries data between endpoints. HTTP gives the request and response their meaning.

## Follow one journey to the hall

For a typical HTTPS connection using HTTP/1.1 or HTTP/2, TCP provides an ordered byte stream and TLS protects the conversation. HTTP then carries a request such as `GET /quests`. HTTP/3 uses QUIC over UDP instead of TCP, as [MDN's protocol history](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Evolution_of_HTTP) explains. The useful lesson is the separation of jobs, rather than one universal sequence of acronyms.

That separation becomes practical when something fails. If the name cannot be resolved, your Express route has not had a chance to answer. If the connection is refused, there may be no listener at the destination. A 404 is different: an HTTP response arrived, but the requested resource was not found. A 500 tells you that a responding server encountered a problem.

Imagine a courier with the wrong address, a locked gate, and a clerk who cannot find your file. All three prevent delivery, but arguing with the clerk will not repair the address book.

The [Waiting Room](/path/4-2-the-waiting-room/) turns that distinction into code: a response reporting an error and a request that receives no response need different explanations, even when the screen offers the same retry button.

[Original episode on YouTube](https://www.youtube.com/watch?v=-C6PKeEHA70).
