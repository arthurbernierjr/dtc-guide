# API Design: REST vs GraphQL vs gRPC

**One-liner:** REST is resource-oriented over HTTP; GraphQL is a client-shaped query language; gRPC is binary RPC over HTTP/2 with Protobuf.

## Say this
If you came from Session [9.5](/path/9-5-grand-architecture/): your quest board (the `Todo` routes from [4.12](/path/4-12-the-quest-slate/); call them quests here) is a REST API, and your design document only has to say why. Here is one request, "give me quest 7 with its hero's name", in all three styles. A board that needs only titles asks the same way; a screen that needs the hero's other quests as well is where the styles differ.

```text
The question: give me quest 7 with its hero's name.

REST      GET /api/quests/7                       the URL names the thing; the server picks the shape
          200 OK   Content-Type: application/json
          { "id": 7, "title": "Map the marsh", "done": false,
            "hero": { "id": 2, "name": "Bran" } }
          Only the title wanted? You still get all of it (over-fetching).
          The hero's other quests too? A second request, GET /api/heroes/2/quests (under-fetching).

GraphQL   POST /graphql                           one endpoint; the client writes the shape it wants
          query { quest(id: 7) { title hero { name quests { title } } } }
          200 OK
          { "data": { "quest": { "title": "Map the marsh",
                                 "hero": { "name": "Bran", "quests": [ { "title": "Map the marsh" } ] } } } }
          Exactly the fields asked for, related records included, one round trip.

gRPC      GetQuest(GetQuestRequest{ id: 7 })      a function call; the shape is fixed in a .proto file
          message Quest { int32 id = 1; string title = 2; bool done = 3; Hero hero = 4; }
          message Hero  { int32 id = 1; string name = 2; }
          The reply travels as binary, not text; curl and the browser cannot read it without a translator.
```

The hall uses REST because `curl` can read the reply, the browser caches a `GET` by its URL, and there is one client, the hall's own page, so nobody needs to pick their own field shape. The bullets below are interview vocabulary; the ones tagged (later) are features you will not need until a second client appears.

- **Resource / noun-based URLs** — `/users/{id}/orders`; verbs are HTTP methods.
- **Idempotent methods** — GET, PUT, DELETE (HEAD, OPTIONS); POST and PATCH are not by default.
- **Safe methods** — GET, HEAD: no side effects.
- **HATEOAS** — hypermedia links in responses (Richardson maturity level 3; rarely used). (later)
- **Versioning** — URL (`/v1/`), header (`Accept: application/vnd.api+json;v=2`), or query param.
- **Pagination** — offset/limit vs cursor (keyset) pagination; cursor scales, offset doesn't.
- **Over-fetching / under-fetching** — REST's problem GraphQL solves.
- **N+1 problem** — GraphQL resolver pitfall; fixed with DataLoader batching.
- **Schema / SDL** — GraphQL type system; introspection.
- **Protobuf / IDL** — gRPC's binary schema; generated stubs.
- **Streaming** — gRPC unary, server-stream, client-stream, bidirectional. (later)
- **Status codes** — 200/201/204, 400/401/403/404/409/422/429, 500/502/503/504.

## How it works
```
REST:     GET /users/42/orders?cursor=abc&limit=20   -> JSON, cacheable by URL
GraphQL:  POST /graphql { user(id:42){ name orders(first:20){ id } } } -> exactly those fields
gRPC:     OrderService.ListOrders(ListOrdersRequest{user_id:42}) -> binary protobuf over HTTP/2
```
- REST: stateless, uniform interface, HTTP caching (ETag, Cache-Control) works out of the box.
- GraphQL: single endpoint, client specifies shape, resolvers fetch per field; persisted queries for caching.
- gRPC: contract-first `.proto`, codegen in many languages, HTTP/2 multiplexing, deadlines/cancellation built in; needs gRPC-Web or a gateway for browsers.

## Trade-offs
| Choice | Pro | Con |
|---|---|---|
| REST | Ubiquitous, cacheable, simple tooling | Over/under-fetching, many round trips, loose contracts |
| GraphQL | One round trip, exact shape, strong schema, great for varied clients | Caching harder, N+1, complexity/cost of arbitrary queries, auth per field |
| gRPC | Fast (binary, HTTP/2), strict contracts, streaming, deadlines | Not browser-native, less human-readable, needs proxy for public web |
| Cursor pagination | Stable under inserts, O(1) seek | No "jump to page N" |
| Offset pagination | Simple, jump to page | Slow at depth, skips/dupes under writes |

## Numbers
- Protobuf payloads commonly 3-10x smaller than equivalent JSON; parse cost lower by similar order.
- HTTP/2 multiplexes many streams over one TCP connection; HTTP/1.1 browsers cap ~6 connections/host.
- Typical public API rate limits quoted per key: hundreds to thousands of req/min.

## In the interview
- Bring it up in the API sketch phase: "External clients get REST (or GraphQL if many client types); service-to-service is gRPC."
- Say: "I'll use cursor pagination and idempotency keys on POST so retries are safe."
- Follow-up: "Why not GraphQL everywhere?" → "Caching and query-cost control get hard; for a known client I'd rather have cacheable REST or typed gRPC."
- Follow-up: "How do you version?" → "Additive changes only; breaking changes get `/v2`; gRPC field numbers are never reused."
