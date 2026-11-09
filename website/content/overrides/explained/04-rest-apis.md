---
title: "REST APIs"
lede: "An API becomes easier to reason about when every request makes its intention visible and every response makes its outcome clear."
youtube: hDecH3aK43g
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# REST APIs

The restaurant analogy in this episode is useful because ordering food involves a contract. You ask for something the kitchen knows how to prepare; it accepts, refuses, or reports a problem. You do not reach through the counter and rearrange its cupboards yourself.

For a quest API, the shared contract might include a collection at `/quests` and individual records at `/quests/42`. The method adds intent: read the collection, create an entry, update one, or remove it. The response describes what happened using both a status and, when appropriate, a representation of the resource.

## The second request is the revealing one

Suppose you delete quest 42, but the response disappears on the way back. Repeating the request should not delete quest 43. This is the practical importance of idempotence: repeating an operation has the same intended effect, even if the second response differs because the resource is already gone.

Creating an order is trickier. Two identical submissions may produce two orders unless the application deliberately recognizes a retry. Choosing an HTTP method is part of designing the contract; it does not automatically implement every safety property behind it.

REST also involves more than attractive URLs. Stateless requests, representations, and HTTP semantics let independently written clients and servers cooperate. In [The Counter's Three Laws](/path/4-4-the-counters-three-laws/), pay attention to what a caller can infer without reading the server's source. That is where a collection of routes starts becoming an understandable interface.

[Original episode on YouTube](https://www.youtube.com/watch?v=hDecH3aK43g).
