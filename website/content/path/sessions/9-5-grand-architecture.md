---
editorial: true
title: Grand Architecture
subtitle: System design fundamentals
hook: "Your product spec says what the capstone does. Today you write the document that says how it will hold up: a workload you estimated, boxes you can defend, one request traced through them, one failure walked through, and one decision recorded with its reasons."
read: 60
artifact: "docs/system-design.md in the capstone repository, with a workload estimate, an architecture diagram, a traced request, a failure walkthrough, a scaling plan, and a named decision record"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://docs.railway.com/
  - https://railway.com/pricing
  - https://www.mongodb.com/docs/manual/indexes/
  - https://www.mongodb.com/docs/manual/replication/
  - https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
  - https://adr.github.io/
say:
  - "Start from the workload: who does what, how often, and what happens at peak."
  - "One process and one database until a measured pressure says otherwise."
  - "A cache is a second copy of the truth; say who owns the first one and when the second expires."
---

## The hook

The guild hall is one Node process on port 4100, one MongoDB, and a folder of static files, and in Unit 6 that shape went on the internet behind Nginx. It handles you and your test accounts without effort. The question this session asks is the one you have not had to answer yet: what happens at a thousand users, and at a hundred thousand? Which box fills up first, what do you add, and what does adding it cost in complexity and money?

System design is answering that in writing, before the pressure arrives, with numbers you chose and can revise. Today you read `docs/product-spec.md` from Unit 8 with a different eye, estimate the workload it implies, draw the smallest architecture that serves it, trace one request through the drawing, walk one failure through it, and record one decision with its alternatives. The result is `docs/system-design.md` in your capstone repository, and it is the plan Unit 10 builds from and the document Unit 11 hands to anyone who asks whether the thing can scale.

> *A castle is not strong because it has many walls. It is strong because the builder knew which wall the river would test first.*

## The idea

Begin with the workload, not with a diagram. Who uses the product, what do they do, how often, and which operations matter most? A public catalog that is read ten thousand times for every write is a different system from a booking page where every action is a write that must not be lost. Count the reads and writes per user per day from the user stories in `docs/user-stories.md`, multiply by the users you expect at launch and at a hundred times launch, divide by the seconds in a day, and multiply by a peak factor, because traffic is not flat. The numbers do not need to be precise. They need to be stated, so that a reviewer can challenge a number instead of an adjective, and so that you can see which component becomes the first concern when an assumption changes by ten times.

Separate what the system does from how well it must do it. Booking a seat is a functional requirement. Keeping one member's bookings invisible to another is a security requirement. Answering a page in under half a second is a performance requirement. Surviving a restart without losing a paid booking is a durability requirement. Each important requirement should point at a mechanism in the design and at an observation that would confirm it, a test, a log line, a metric. A requirement with no mechanism is a wish.

Then draw the boxes and say who owns what. Client, edge, application, database, and the external services you depend on. Label the arrows with the operation and the protocol. For every record, name the component allowed to change it. A diagram with many boxes and no ownership rules cannot say what happens when two requests race for the last seat, and that is the question the diagram exists to answer. Start with a modular monolith: one deployable process with clear internal boundaries, one database, and a note on where a split would go if a measured pressure ever justified it.

What you should be able to draw on a napkin: a workload in requests per second at launch and at a hundred times launch; one process, one database, one static client, on Railway; the external services with a line each; one request traced through; one failure walked through; and the first box you would change, with the number that would make you change it. Requirements, architecture, tradeoffs.

![](diagram:session-9-5/fig1-model)

### The shape you already run, and what each added box is for

The capstone starts the way the hall runs: a browser loads a static Vite build, calls one Express API, and the API talks to one MongoDB. On Railway, which [6-4](/path/6-4-opening-the-world-gate/) introduced and which is where this capstone deploys in Unit 10, that is one service for the API, one for the static client, and a MongoDB add-on, with Railway's own proxy in front doing TLS and routing. The [Railway docs](https://docs.railway.com/) describe the pieces; the shape is the hall's shape with the Nginx box replaced by a managed one.

Every box beyond that solves a specific, nameable problem. A load balancer spreads requests across several copies of the API so one process is not the limit, and it only helps once the API is stateless, which yours is, because the token carries the identity and the database carries everything else. Read replicas take the read traffic off the primary; MongoDB's [replication](https://www.mongodb.com/docs/manual/replication/) gives durability first and read scaling second, with the tradeoff that a replica can lag the primary by a moment. A cache keeps a hot read in memory so the database does not answer the same question a thousand times a minute. A queue moves slow work, an email, an image resize, a webhook, out of the request so the user is not waiting on it, at the cost of a second process that can crash and must not lose or duplicate the job. A CDN puts static files near the user. Each of these is a correct answer to a question. Write the question before you add the box.

Numbers about how much one process or one database can take are only true for one machine, one workload, and one day. Treat any figure you read as illustrative and replace it with one you measured: the hall's `GET /api/inbox` under a small load test from Unit 7 is a better capacity number for your design than any table on the internet. An index is the first scaling tool and the cheapest: the [indexes page](https://www.mongodb.com/docs/manual/indexes/) is the difference between a collection scan and a tree walk, the same difference you measured in 9.2 between `includes` and a `Set`.

### Monolith first, with the seam marked

A design with five services, three queues, and no users has five deploys, three retry policies, and a distributed debugging problem it did not need. One process with internal modules, `auth`, `bookings`, `payments`, each owning its collections and exposing a few functions, gives you the boundary without the network. When a real pressure arrives, a module that needs its own scaling, a team that needs to ship apart, a failure domain you can name, the seam is already drawn. Until then the monolith is the correct architecture, and the design document says so in a sentence rather than apologizing for it.

The one split worth making early is the static client from the API, which you already have: two Railway services, one serving files and one serving JSON. They scale differently and fail differently, and the split costs nothing but a CORS origin.

### Caches, queues, and the second copy of the truth

A cache is a second representation of data whose first representation lives in the database. The moment you add one you owe four answers: what is the source of truth, what is the cache key, how long may the cached value lie, and what event removes it. A cached workshop description that is five minutes stale is harmless. A cached "seats remaining" that is five minutes stale sells the same seat twice. The policy depends on the record, not on the library. The simplest correct design for a launch is no cache at all and a sentence naming the read that would justify one and the number that would trigger it.

A queue has the same shape of obligation. Work put on a queue may be delivered twice or not at all, depending on the queue and on what crashed when. The consumer must be idempotent, able to run the same job twice without double effect, and the design must say what happens to a job whose worker died halfway. Stripe's webhook in Unit 10 is exactly this: an event that may arrive more than once, matched against a record so the second arrival is a no-op. If your design shows a queue, it shows the idempotency key too, or it does not show the queue.

### Failure, consistency, and the words that mean something

The CAP theorem says that during a network partition a distributed store must choose between answering with possibly stale data and refusing to answer. It is not a menu where a database picks two of three forever, and for a single MongoDB it barely applies. What applies is the ordinary question: for each important read, can it be stale, and for each important write, can it be refused temporarily? A booking count can be a few seconds stale on a public page. A payment confirmation cannot be lost. Write those sentences and you have done the consistency section.

Every remote call needs a timeout, and every retry needs a limit and a delay that grows with jitter, because a thousand clients retrying at the same instant is the outage, not the recovery. The [AWS builders' library article on timeouts, retries, and backoff](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/) is the reference to cite; the version for your design is one paragraph that names the call, the timeout, the retry count, and the backoff. Then walk one failure through the diagram end to end: the database restarts for thirty seconds during a booking. What does the user see, what does the API log, what is in the database afterwards, and what did the design do to make that acceptable?

### One decision, recorded

An architecture decision record is a short named section: the context, the options considered, the decision, the consequences, and the condition that would make you revisit it. The format on [adr.github.io](https://adr.github.io/) is the common one; this course keeps the records inside `docs/system-design.md` under their own headings rather than in separate files, so the document stays one page a reviewer can read top to bottom. The first record is almost always "one process, one database, on Railway, with these seams." Write it with the alternatives you rejected, because the rejected alternatives are what make the decision reviewable.

## The demonstration

One capstone, from the spec to the finished document. The sample is a booking app for a pottery studio's workshops, called Kilnbook, specified in Unit 8 the way yours was; your capstone differs, and the moves are the same. The user stories say: a member browses upcoming workshops, books a seat, pays, and gets a confirmation; the studio owner creates workshops, sets the seat count, and sees who is coming; a workshop description can be drafted by the AI feature from a few notes.

Workload first. Say two hundred members at launch, each visiting twice a week and making about twenty requests per visit, mostly reads, with one booking write per week. That is roughly `200 × 2 × 20 / 7` requests a day, around eleven hundred, which is a hundredth of a request per second on average. Peak is the Sunday evening when the new schedule goes up; call it eight times average. At a hundred times launch, twenty thousand members, the average is about one request per second and the peak around eight. Storage: a booking row is a few hundred bytes, a workshop row about the same; at a hundred times launch, with one booking per member per week, that is about a million rows a year, under a gigabyte. Those are planning numbers chosen from the stories, not measurements, and the document says so. The conclusion they support is specific: one Node process and one MongoDB are not the bottleneck at any size this document considers; the first real pressure is correctness under concurrent booking of the last seat, not throughput.

The model you can run here does the same arithmetic for a thousand and a hundred thousand daily users. It proves that the estimate depends on the peak factor and on the stated inputs, and nothing else. It does not measure capacity; a load test against your deployed API in Unit 10 is that measurement.

```js run=checkpoint-9-5
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function estimate(assumptions) {
  const requestsPerDay = assumptions.dailyUsers * assumptions.requestsPerUser;
  const averageRps = requestsPerDay / 86400;
  const peakRps = averageRps * assumptions.peakMultiplier;
  const storagePerYearMb = (assumptions.dailyUsers * assumptions.writesPerUser * assumptions.bytesPerWrite * 365) / 1e6;
  return { averageRps, peakRps, storagePerYearMb };
}

const launch = estimate({ dailyUsers: 1000, requestsPerUser: 20, peakMultiplier: 8, writesPerUser: 2, bytesPerWrite: 500 });
check(launch.peakRps > launch.averageRps, 'Peak assumption matters');
check(Math.ceil(launch.peakRps) === 2 && Math.round(launch.storagePerYearMb) === 365, 'Illustrative workload estimate');

const grown = estimate({ dailyUsers: 100000, requestsPerUser: 20, peakMultiplier: 8, writesPerUser: 2, bytesPerWrite: 500 });
check(Math.ceil(grown.peakRps) === 186, 'a hundred times the users is under two hundred requests a second at peak');

console.log({ launch, grown, note: 'planning inputs you chose, not measured capacity' });
console.log('ok: checkpoint-9-5');
```

Now the document itself, written into `~/projects/kilnbook/docs/system-design.md`. This is the filled example; the empty template is in Your turn.

```markdown
# Kilnbook: system design

Version 1.0, written from docs/product-spec.md v1.0. Changes to this document get a dated line at the bottom.

## 1. What the system must do

Functional: members browse upcoming workshops, book a seat, pay by card, and receive a confirmation;
the owner creates and edits workshops with a seat count and sees the attendee list; the owner can
ask for a drafted description from notes.

Quality: a member never sees another member's bookings (security); a workshop never sells more seats
than it has (correctness under concurrency); a paid booking is never lost (durability); the workshop
list answers in under 500 ms at peak (performance); the site is back within minutes after a
process restart (availability).

## 2. Workload estimate (planning inputs, not measurements)

| Input | Launch | 100× |
|---|---|---|
| Members | 200 | 20,000 |
| Visits per member per week | 2 | 2 |
| Requests per visit | 20 | 20 |
| Average requests/s | 0.01 | 1.3 |
| Peak factor | 8 | 8 |
| Peak requests/s | 0.1 | 11 |
| Booking writes per week | 200 | 20,000 |
| Rows per year (bookings) | 10,000 | 1,000,000 |
| Storage per year | under 10 MB | under 1 GB |

Conclusion: throughput is not the first problem at either size. The first problem is two members
booking the last seat at the same moment.

## 3. Architecture

    browser (Vite static build, Railway service "web")
        |  HTTPS, JSON, Bearer token
    Express API (Node 24, Railway service "api", one process)
        |  Mongoose
    MongoDB (Railway add-on, one primary)
        |
    external: Stripe (Checkout + webhook), Anthropic API (description drafts)

Ownership: the API is the only writer to MongoDB. Stripe owns payment state; the API records what
Stripe reports through the signed webhook. The AI feature reads workshop notes and writes nothing.

## 4. One request, traced

POST /api/bookings { workshopId } with a member token.
1. requireUser verifies the token and sets req.userId.
2. The handler validates workshopId as a string and loads the workshop.
3. One conditional update: find the workshop where seatsTaken < seatCount and increment seatsTaken;
   if no document matches, answer 409 "workshop is full". This is the hall's conditional debit.
4. Insert the booking { member, workshop, status: "pending" } and create a Stripe Checkout session.
5. Answer 201 with the Checkout URL. The booking becomes "paid" only when the webhook arrives.

## 5. One failure, walked through

MongoDB restarts for 30 seconds while bookings are being made. The API's Mongoose calls fail with
a connection error; the error handler answers 503 with { error: "try again in a moment" }; the
client shows that sentence and keeps the form. No seat was incremented without its booking,
because step 3 and step 4 run in that order and a failed step 4 is followed by a compensating
decrement. A webhook that arrives during the outage is retried by Stripe; the handler is
idempotent on the Stripe event id, so the retry completes the booking once.

Timeouts: 5 s on Stripe and Anthropic calls, no retry inside a request; the client may retry a
GET, never a POST without a fresh form. Mongoose uses its default server selection timeout.

## 6. Data model

User { name, email unique, passwordHash, role: member | owner }
Workshop { title, startsAt, seatCount, seatsTaken, notes, description } indexed on startsAt
Booking { member -> User, workshop -> Workshop, status: pending | paid | cancelled, stripeSessionId }
  unique on (member, workshop)
PaymentEvent { stripeEventId unique, type, receivedAt }

## 7. Scaling plan

At launch: as drawn. At 10×: add an index on Booking.member for the "my bookings" page; nothing
else. At 100×: measure first; the expected first move is a second API instance behind Railway's
load balancing, which the stateless token design already allows, then a read-heavy cache for the
workshop list with a 60 s expiry, deleted on any workshop edit. Not before a measurement.

## 8. Cost

Two Railway services plus the MongoDB add-on at the usage-based plan on https://railway.com/pricing;
the numbers change, so the plan name and the link are recorded here rather than a figure. Stripe
takes a per-transaction fee. The AI feature is metered per token and capped in code at a daily
budget.

## 9. ADR-1: one process, one database, on Railway

Context: a two-person product with an estimated peak under a dozen requests a second at 100×.
Options: (a) one Express process and one MongoDB on Railway; (b) separate services for auth,
bookings, and payments; (c) a serverless function per route with a hosted database.
Decision: (a), with modules auth/, workshops/, bookings/, payments/ inside one process and one
collection per module.
Consequences: one deploy, one log, one place to debug; a single process is a single failure
domain, mitigated by Railway restarts and by stateless requests; a split later is a module
boundary, not a rewrite.
Revisit when: a measured peak passes 50 requests/s, or the AI feature's latency starts to hold
booking requests, in which case the AI route moves to its own service first.

## 10. Deferred alternatives

A queue for confirmation email: not now, because the email is sent by the webhook handler and a
failure there is retried by Stripe. A CDN for the static build: Railway's edge serves it; revisit
if the client bundle grows past a few hundred kilobytes.

Changes: 2026-11-07 first version.
```

Read section 4 against section 3. Every hop in the trace is a box or an arrow in the drawing, and the one mechanism the quality requirements depend on, the conditional update in step 3, is named rather than assumed. Section 5 is the part most design documents skip, and it is the part a reviewer reads first, because it shows whether the author has thought about the system when it is not working. Section 9 is the decision record, inside the document, with the alternatives written down and a revisit condition that is a number.

## Where it breaks

![](diagram:session-9-5/fig2-diagnosis)

### Premature microservices

The design has five services, three queues, and no users. The symptom is a diagram you cannot run on your laptop and a feature that needs four deploys. The cause is designing for a scale you have not seen, with boxes borrowed from a company whose problems you do not have.

Start with the smallest thing you can deploy: one process, one database, modules with clear ownership inside the process. Mark the seam where a split would go. Extract a service when a real pressure shows up, a load you measured, a team that needs to ship apart, a failure domain you can name. Until then the drawing has three boxes and the document says why.

### Cache becomes authority

The cache says the workshop has a seat and the database says it sold out an hour ago, and a reader trusted the cache. The symptom is two users with a confirmation for the same seat, or a page that shows a booking the user just cancelled. The cause is a cache with no owner, no expiry, and no invalidation event, which is a second database that drifts.

For each cached value, write the source of truth, the key, how long it may lie, and what deletes it. If you cannot answer the last one, you do not have a cache yet. For anything that gates money or a scarce resource, read the database; cache the description, not the count.

### Scale claim lacks numbers

The document says the design "scales" and does not say to what. The symptom is a review where nobody can disagree because nothing was claimed. The cause is an adjective where a number belongs.

Add the estimate: requests per second at launch and at a hundred times launch, rows per year, the one read you think is hot, and the assumption behind each in the same sentence. State the number at which you would revisit the first decision. A review can challenge a number. It cannot challenge "scales well."

## Your turn

Everything happens in your capstone repository, `~/projects/<capstone-name>`, which has held `docs/` since Unit 8.

1. `cd ~/projects/<capstone-name> && ls docs` and read `product-spec.md` and `user-stories.md` once more, with a pen, marking every read and every write a user performs.
2. Copy this into `docs/system-design.md` and fill it in. The headings are the ten sections from the demonstration; keep them, because [9-6](/path/9-6-the-runesmiths-forge/) adds a second decision record under the same numbering.

   ```markdown
   # <Capstone name>: system design

   Version 1.0, written from docs/product-spec.md v1.0.

   ## 1. What the system must do
   Functional: ...
   Quality: ... (one sentence each for security, correctness, durability, performance, availability)

   ## 2. Workload estimate (planning inputs, not measurements)
   | Input | Launch | 100× |
   |---|---|---|
   | Users | | |
   | Visits per user per week | | |
   | Requests per visit | | |
   | Average requests/s | | |
   | Peak factor | | |
   | Peak requests/s | | |
   | Writes per week | | |
   | Rows per year | | |
   | Storage per year | | |
   Conclusion: ...

   ## 3. Architecture
   (text diagram: client, API, database, external services, with the protocol on each arrow)
   Ownership: ...

   ## 4. One request, traced
   (the most important write, step by step, naming the validation, the authorization, the
   persistence, and the response)

   ## 5. One failure, walked through
   (what the user sees, what is logged, what is in the database afterwards, and why that is acceptable)
   Timeouts and retries: ...

   ## 6. Data model
   (one line per collection, with refs, indexes, and unique constraints)

   ## 7. Scaling plan
   At launch: ... At 10×: ... At 100×: ... Not before a measurement.

   ## 8. Cost
   (plan names and links, not figures)

   ## 9. ADR-1: <the decision>
   Context: ... Options: ... Decision: ... Consequences: ... Revisit when: ...

   ## 10. Deferred alternatives
   ...

   Changes: <date> first version.
   ```
3. Fill section 2 first, with your own inputs, and run the arithmetic in the checkpoint above with your numbers by changing the two `estimate` calls. Paste the resulting `peakRps` values into the table.
4. Draw section 3 as text. Every box is something you will actually deploy in Unit 10: the Vite build, the Express API, MongoDB, Stripe, the Anthropic API. Nothing else unless section 2 forced it.
5. Trace the write from your top user story in section 4, naming the conditional update if the story involves a scarce thing, the way the hall's `spend` did.
6. Walk the database-restart failure in section 5 and write the timeout for every external call.
7. Write ADR-1 with at least two rejected options and a numeric revisit condition. Commit: `git add docs/system-design.md && git commit -m "Add system design v1.0"` and push.

If section 2 produces a peak above a few dozen requests a second at launch, check the inputs before you check the architecture. Most first estimates are off by a factor of ten in the pessimistic direction, and the fix is a sentence about which input you doubt, not a load balancer.

## The quest

![](diagram:session-9-5/fig3-evidence)

The deliverable is `docs/system-design.md`, version 1.0, committed and pushed in the capstone repository, with all ten sections filled and the diagram readable as plain text in the file. It is the document Unit 10 builds against, and 10-4's security audit and first deploy refer back to sections 3, 5, and 8.

Evidence to keep:

- The workload table with your inputs and the two `peakRps` numbers you computed, and the sentence under it naming which input you are least sure of.
- The traced request in section 4, in which every step corresponds to a box or an arrow in section 3.
- The failure walkthrough in section 5, with a timeout written for every external call.
- ADR-1 with two rejected options and a revisit condition that is a number.
- The commit hash of the version you pushed, in the Changes line at the bottom.

## Side quests

The interview-framework sheet is this document compressed into forty-five minutes out loud, the back-of-the-envelope sheet is the arithmetic from section 2 with the reference numbers you should treat as starting guesses, and the caching sheet is the four questions you owe before any cache goes in the drawing.

## Before next session

Next session returns to code: the guild hall's API is converted to TypeScript in place, with the Unit 7 tests as the baseline that must stay green, and a second decision record goes into the document you just wrote, explaining why the capstone itself stays in JavaScript. Reread section 4 of your design once, because the conversion session asks you to trace the same kind of request through typed code. Nothing is running between sessions; the hall's server is stopped, and the design is a file. You arrive with `docs/system-design.md` v1.0 pushed and the `hall-api` repository from Unit 7 clean, with `npm test` passing.
