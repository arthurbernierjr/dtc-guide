---
editorial: true
title: Grand Architecture
subtitle: System Design Fundamentals
hook: "A system design document with estimates, failure paths, and explicit tradeoffs. Define users, operations, and quality needs."
read: 60
artifact: "A system design document with estimates, failure paths, and explicit tradeoffs"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/
say:
  - "Requirements: Define users, operations, and quality needs."
  - "Architecture: Assign responsibilities and data ownership."
  - "Tradeoffs: Explain capacity, failure, and consistency choices."
---

## The hook

Welcome to the Grand Architecture session. You have built full-stack applications. You have deployed them. They work. But here is the question nobody has asked you yet: what happens when your app gets popular? What happens when you go from 100 users to 10,000 to 100,000? Does your single Express server handle that? Does your single MongoDB instance survive? Does your React app stay fast when the API takes 3 seconds to respond because the database is choking?

System design is how you answer those questions before they become emergencies. It is how you plan infrastructure that scales. It is how technical co-founders earn their title. And yes, it is what gets asked in senior engineering interviews. But forget the interview for a second. System design is what separates a weekend project from a real business. If you cannot explain how your system handles scale, you do not have a product. You have a prototype.

Today we cover load balancing, caching, database scaling, message queues, microservices, and the CAP theorem. Then we walk through two complete system design exercises: a URL shortener and a social media feed. By the end of this session, you will be able to draw an architecture diagram for any web application and explain every component in it.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Evaluate System Design Tradeoffs for Web Application Architecture
You will evaluate architectural tradeoffs including load balancing, caching, database scaling, and service decomposition to design web applications that handle growth.

**Enabling Objectives:**
- Diagram client-server architecture and explain the request-response lifecycle at scale
- Compare load balancing strategies (round robin, least connections, IP hash) and explain when to use each
- Evaluate caching strategies (in-memory, Redis, CDN) and identify cache invalidation challenges
- Analyze database scaling approaches (vertical vs horizontal, read replicas, sharding) and their tradeoffs
- Compare monolithic and microservice architectures and explain when each is appropriate
- Apply the CAP theorem to evaluate distributed system tradeoffs

**You should be able to:**
- Draw a system architecture diagram for a web application
- Explain how to scale a web application from 100 to 100,000 users
- Evaluate architectural decisions and articulate their tradeoffs

**Why System Design Matters for Founders**

Three reasons you need this:
1. **Investor conversations:** "How does your system handle 100x growth?" You need a real answer.
2. **Hiring engineers:** If you cannot read an architecture diagram, you cannot evaluate technical hires.
3. **Cost control:** Bad architecture burns money. A system that scales efficiently costs 10x less to run than one that does not.

The mental model: system design is about identifying bottlenecks before they happen and choosing tradeoffs intentionally.

**Client-Server Architecture at Scale**

At its simplest, your app is:

```
[Browser/Client] --> [Server (Express)] --> [Database (MongoDB)]
```

This works for 100 users. Here is what breaks at scale:

```
Problem 1: Single server handles all requests
  - One server can handle ~1000-5000 concurrent connections
  - At 10,000 users, requests start queuing and timing out

Problem 2: Single database handles all reads and writes
  - MongoDB can handle ~10,000 operations/sec on good hardware
  - At 100,000 users doing frequent reads, the database becomes the bottleneck

Problem 3: No caching
  - Every request hits the database, even for data that rarely changes
  - The same user profile gets fetched 1000 times per minute

Problem 4: No fault tolerance
  - If your one server crashes, your entire app goes down
  - If your one database crashes, all data access stops
```

The scaled version:

```
                    [Load Balancer]
                   /      |       \
            [Server 1] [Server 2] [Server 3]
                   \      |       /
                    [Cache (Redis)]
                        |
              [Primary Database]
             /          |         \
    [Read Replica] [Read Replica] [Read Replica]
```

Every component we add solves a specific problem. Let us go through each one.

**Load Balancing**

A load balancer distributes incoming requests across multiple servers. If one server can handle 5,000 users, three servers behind a load balancer can handle 15,000.

Load balancing strategies:

```
Round Robin:
  Request 1 -> Server A
  Request 2 -> Server B
  Request 3 -> Server C
  Request 4 -> Server A  (cycles back)
  Simple, fair, does not consider server load.

Least Connections:
  Send each request to the server with the fewest active connections.
  Better for uneven workloads (some requests take longer than others).

IP Hash:
  Hash the client's IP address to determine which server handles it.
  Same client always hits the same server (useful for session affinity).
  Problem: if that server goes down, those users lose their sessions.

Weighted Round Robin:
  Like round robin, but servers have different weights.
  Server A (weight 3): gets 3x more traffic than Server C (weight 1).
  Useful when you have servers with different hardware specs.
```

Real-world tools: AWS ALB (Application Load Balancer), Nginx, HAProxy, Cloudflare.

Health checks: the load balancer pings each server every few seconds. If a server stops responding, it gets removed from the pool automatically. This is how you get fault tolerance.

**Caching Strategies**

Caching stores frequently accessed data in fast memory so you do not hit the database every time.

```
Without cache:
  User requests profile -> Server queries database -> Returns data
  Every single time. 100 requests = 100 database queries.

With cache:
  User requests profile -> Server checks cache -> Found! Returns cached data
  First request: cache miss, query database, store in cache
  Next 99 requests: cache hit, return from memory instantly
  100 requests = 1 database query + 99 cache hits
```

Types of caching:

```
In-Memory Cache (on the server):
  - Stored in the application's memory (Node.js process)
  - Fastest possible (no network hop)
  - Lost when server restarts
  - Not shared between multiple servers
  - Good for: single-server apps, small datasets

Redis (external cache):
  - Separate server dedicated to caching
  - Shared between all your application servers
  - Persists across server restarts (optional)
  - Supports data structures (strings, lists, sets, sorted sets)
  - Sub-millisecond response times
  - Good for: multi-server apps, session storage, real-time leaderboards

CDN (Content Delivery Network):
  - Caches static assets (images, CSS, JS) at edge locations worldwide
  - User in Tokyo gets assets from a Tokyo server, not your US server
  - Reduces latency dramatically for static content
  - Services: CloudFront, Cloudflare, Vercel Edge
  - Good for: static files, pre-rendered pages, media
```

The hardest problem in caching: cache invalidation. When the underlying data changes, you need to update or remove the cached version. Strategies:

```
TTL (Time to Live):
  - Cache expires after N seconds/minutes
  - Simple but data can be stale during TTL window
  - Good for: data that does not need to be real-time (user profiles, product listings)

Write-Through:
  - When data is written to the database, also update the cache
  - Cache is always fresh
  - Adds latency to writes
  - Good for: data that is read frequently and written occasionally

Cache-Aside (Lazy Loading):
  - On read: check cache first, if miss, read from database and populate cache
  - On write: update database, invalidate (delete) the cache entry
  - Most common pattern
  - Good for: general purpose caching
```

**Database Scaling**

Vertical scaling vs. horizontal scaling:

```
Vertical Scaling (Scale Up):
  - Get a bigger, faster server
  - More RAM, more CPU, faster disk
  - Simple: no code changes needed
  - Limited: there is a maximum server size
  - Expensive: big servers cost disproportionately more
  - Single point of failure remains

Horizontal Scaling (Scale Out):
  - Add more servers
  - Distribute data and load across them
  - Complex: requires code changes and coordination
  - Unlimited: keep adding servers as needed
  - Cost-effective: commodity hardware
  - Fault tolerant: one server going down does not kill everything
```

Read replicas:

```
[Client] -> [Load Balancer]
                |
          [Primary DB] ----replicates-to---> [Read Replica 1]
              (writes)                        [Read Replica 2]
                                              [Read Replica 3]
                                                (reads)

- All writes go to the primary database
- Reads are distributed across replicas
- If your app is 90% reads (most apps are), this is a massive improvement
- Tradeoff: slight lag between write and replica update (eventual consistency)
```

Database sharding:

```
Shard by user ID:
  Users 1-1,000,000     -> Database Shard A
  Users 1,000,001-2,000,000  -> Database Shard B
  Users 2,000,001-3,000,000  -> Database Shard C

Each shard is a complete database that holds a subset of the data.
Queries only hit the relevant shard, so each one handles less load.

Tradeoff: cross-shard queries are expensive or impossible.
  "Get all users" now requires querying every shard.
  Joins across shards do not work.

When to shard: when a single database cannot handle your data volume
  or query load even with read replicas.
```

**Message Queues and Async Processing**

Some tasks should not block the user's request. If a user signs up, do not make them wait while you send a welcome email, resize their profile picture, and notify their friends. Put those tasks in a queue and process them in the background.

```
Synchronous (blocking):
  User signs up -> Send email -> Resize image -> Notify friends -> Return response
  Total time: 3 seconds. User waits for all of it.

Asynchronous (with queue):
  User signs up -> Add tasks to queue -> Return response immediately (200ms)
  Background workers:
    Worker 1: Send email
    Worker 2: Resize image
    Worker 3: Notify friends
  User gets instant response, tasks complete in the background.
```

Real-world message queues: RabbitMQ, AWS SQS, Redis (with Bull/BullMQ), Kafka (for streaming).

Use cases: email sending, image processing, data aggregation, webhook delivery, report generation, search index updates.

**Microservices vs. Monolith**

```
Monolith:
  One codebase, one deployment, one database.
  +------------------------------------------+
  | Auth | Users | Products | Orders | Payments |
  +------------------------------------------+
  |            Single Database               |
  +------------------------------------------+

  Pros: simple to develop, simple to deploy, simple to debug
  Cons: one bug can crash everything, scaling is all-or-nothing,
        large codebase becomes hard to manage

Microservices:
  Separate services, separate deployments, separate databases.
  [Auth Service]  [User Service]  [Product Service]
       |               |               |
  [Auth DB]       [User DB]       [Product DB]

  Pros: independent scaling, independent deployment, team autonomy
  Cons: network complexity, distributed debugging, eventual consistency
```

When to use which:

```
Start with a monolith if:
  - You are a small team (1-5 engineers)
  - You are still figuring out your product
  - You want to move fast and iterate
  - You are building an MVP or early-stage startup

Consider microservices if:
  - You have 20+ engineers working on the same codebase
  - Different parts of your system have different scaling needs
  - You need independent deployment cycles
  - You have experienced monolith pain (long deploy times, merge conflicts)

The founder's rule: "Start with a monolith. Split into microservices
  when the pain of the monolith exceeds the complexity of microservices."
```

**CAP Theorem (brief)**

In a distributed system, you can only guarantee two of three properties:
- **Consistency:** Every read returns the most recent write
- **Availability:** Every request gets a response (even if it might be stale)
- **Partition Tolerance:** The system works even if network communication between nodes fails

In practice, network partitions happen, so you are really choosing between consistency and availability:
- **CP systems** (Consistent + Partition Tolerant): banking systems, inventory management. Better to reject a request than return wrong data.
- **AP systems** (Available + Partition Tolerant): social media feeds, shopping carts. Better to return slightly stale data than return nothing.

![](diagram:session-9-4/fig1-model)

### Begin with a workload, not a diagram collection

Ask what users do, how often they do it, and which operations matter most. A read-heavy public catalog differs from a collaborative editor or a payment ledger. Estimate requests, storage, and peak behavior using stated assumptions. The numbers do not need false precision; they need to expose whether a design choice is plausible. If an assumption changes by ten times, identify which component becomes the first concern.

Separate functional requirements from quality requirements. Creating a quest is a capability. Keeping another user's private quest inaccessible is a security requirement. Serving a result within a target latency is a performance requirement. Recovering after a server failure is an availability concern. A useful design document connects each important requirement to a mechanism and an observation that could verify it.

### Draw boundaries and ownership

Show the client, edge or proxy, application, database, and external dependencies. Label arrows with operations and protocols where that helps. State which component owns each record and which is allowed to mutate it. A diagram with many boxes but no ownership rules cannot explain what happens when two requests race. Start with a modular monolith unless an actual requirement justifies additional deployment boundaries.

For a write, trace validation, authorization, persistence, and response. For an asynchronous side effect, explain when work is queued and what happens if the worker crashes. A message queue does not make duplicate delivery disappear. Consumers may need idempotency and durable progress tracking. The architecture should describe recovery behavior, not merely the happy-path route.

### Caches create a second representation

Choose a cache because a measured or expected read path benefits from it. Identify the source of truth, cache key, expiry, invalidation policy, and stale-data tolerance. A cached profile name and a cached payment entitlement have different consequences when outdated. Do not use a single cache policy for all data simply because one library makes it convenient.

A cache miss can cause many simultaneous requests to hit the database. Consider request coalescing, bounded concurrency, or staggered expiry where the workload warrants them. A cache outage should have a defined fallback that does not instantly overwhelm the origin. The simplest learning design may omit caching entirely and document the threshold that would justify adding it.

### Failure changes the consistency conversation

The CAP theorem concerns choices during network partitions in a distributed system; it is not a menu where every database permanently picks any two desirable properties. Explain the actual failure you are considering and the behavior users will see. Can a read be stale? Can a write be rejected temporarily? Which invariant must never be violated? Concrete answers are more useful than labels.

Set timeouts for remote calls and bound retries. Retries can amplify overload, so use backoff, jitter, and operation-specific idempotency. Record latency distributions and error rates rather than only averages. The design artifact should include one failure walkthrough, one capacity estimate, and one deferred alternative with a reason. That makes the design reviewable without pretending the first version must solve every future scale problem.

## The demonstration

Take ten minutes.
Architecture is a lot of concepts. Let them settle. When we return, we design real systems.

**System Design Walkthrough 1: URL Shortener**

Let us design a service like bit.ly. Walk through the full process.

**Requirements:**
- Shorten a long URL to a short one (e.g., mysite.com/abc123)
- Redirect short URL to original URL
- Track click analytics (count, referrer, timestamp)
- Handle 100 million URLs, 1 billion redirects per month

**Architecture:**

```
[Client] -> [Load Balancer] -> [API Servers (x3)]
                                    |
                              [Redis Cache]
                                    |
                              [Database]
                              (URL mappings)

Endpoints:
  POST /api/shorten  { url: "https://very-long-url.com/..." }
    -> Returns { shortUrl: "https://short.ly/abc123" }

  GET /:shortCode
    -> 301 Redirect to original URL
    -> Log analytics event to queue

  GET /api/analytics/:shortCode
    -> Returns click count, recent clicks, referrers
```

**Key Design Decisions:**

```typescript
// Generating short codes:
// Option 1: Counter-based (Base62 encoding)
function generateShortCode(id: number): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  while (id > 0) {
    code = chars[id % 62] + code;
    id = Math.floor(id / 62);
  }
  return code.padStart(6, "0");
}

// Option 2: Random generation with collision check
function generateRandomCode(): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 7; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
// 62^7 = 3.5 trillion possible codes. Collision is rare but must be handled.
```

Why cache matters here: redirects (GET /:shortCode) are 99% of traffic. Cache the most popular URLs in Redis. Cache hit = no database query. Most popular URLs get accessed millions of times.

Analytics: do NOT write to the database on every redirect. Put analytics events in a message queue (Redis/SQS). A background worker processes them in batches.

**System Design Walkthrough 2: Social Media Feed**

Design a simplified Twitter/X feed system.

**Requirements:**
- Users can post messages (280 chars)
- Users can follow other users
- Each user has a personalized feed (posts from people they follow, newest first)
- Handle 10 million users, average 200 follows per user

**The core challenge:** generating the feed. Two approaches:

```
Fan-Out on Write (Push Model):
  When User A posts, immediately push that post to the feed
  cache of every follower.

  User A posts -> For each of A's 1000 followers:
    Add post to follower's feed cache

  Pros: Reading the feed is instant (just read the cache)
  Cons: Writing is expensive (celebrity with 10M followers = 10M writes)

Fan-Out on Read (Pull Model):
  When a user opens their feed, query the database for recent posts
  from everyone they follow.

  User opens feed -> Get list of followed users -> Query recent posts
    from each -> Merge and sort by timestamp -> Return top N

  Pros: Writing is simple (just one database write)
  Cons: Reading is slow (must query and merge from many sources)

Hybrid Approach (what Twitter actually does):
  - Regular users: fan-out on write (push to followers' caches)
  - Celebrities (>10K followers): fan-out on read (query on demand)
  - This balances write cost and read speed
```

**Architecture:**

```
[Client App]
    |
[Load Balancer]
    |
[API Gateway]
   / | \
[Post     [Feed      [User
Service]  Service]   Service]
   |         |          |
[Post DB] [Redis     [User DB]
          Feed Cache]
   |
[Message Queue]
   |
[Feed Worker] -> Pushes posts to follower feed caches
```

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-9-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const dailyUsers = 10000, readsPerUser = 20, peakMultiplier = 8;
const averageRps = dailyUsers * readsPerUser / 86400;
const peakRps = averageRps * peakMultiplier;
check(peakRps > averageRps, 'Peak assumption matters');
check(Math.ceil(peakRps) === 19, 'Illustrative workload estimate');
console.log({averageRps, peakRps, assumption: 'synthetic planning inputs, not measured capacity'});
console.log('ok: checkpoint-9-4');
```

## Where it breaks

![](diagram:session-9-4/fig2-diagnosis)

### Premature microservices

The design has five services, three queues, and no users. Every feature now needs a deploy dance and a failure mode that a single process would not have had. Start with the smallest thing you can run: one application, one database, a boundary in the code where a split could later go. Extract a service when a real pressure shows up, a load you measured, a team that needs to ship apart, a failure domain you can name. A diagram of services is not an architecture. It is a guess about scale you have not seen.

### Cache becomes authority

The cache says the quest is open and the database says it was completed an hour ago. Some reader trusted the cache. Decide which store is the source of truth, how long a cached value may lie, and what event deletes it. A cache without an invalidation story will serve the stale value with confidence, which is worse than being slow. If you cannot say what happens on write, you do not have a cache yet. You have a second database that drifts.

### Scale claim lacks numbers

The design says it "scales" and does not say to how many requests, of what size, with what data growth. Add an estimate you can check: requests per minute, rows per year, the read you think is hot. State the assumption in the same sentence. An architecture review can challenge a number. It cannot challenge an adjective. If you have no traffic yet, say the number you want the first design to survive, and the number at which you would revisit it.

## Your turn

Take ten minutes.
System design is big-picture thinking. Let your mind rest and synthesize what you have learned.

**Guided Exercise: Design a Chat Application**

Work through this out loud, one decision at a time, and write down the decision you almost skipped.

**Requirements:** Real-time messaging between users. Group chats. Message history. Read receipts. Online status.

Walk through each component together:
1. What protocol for real-time? (WebSockets vs. polling vs. SSE)
2. How to store messages? (Database choice, schema design)
3. How to handle group chats efficiently?
4. How to show online/offline status?
5. How to scale WebSocket connections across multiple servers?

```
Key Architecture Decisions:

Real-time: WebSockets for persistent connections
  - Each server holds WebSocket connections for N users
  - When User A sends message to User B:
    - If User B is connected to the same server: deliver directly
    - If User B is on a different server: use Redis Pub/Sub to route

Message Storage:
  - Store messages in database (MongoDB or PostgreSQL)
  - Use message queue for delivery guarantees
  - Cache recent messages per chat room in Redis

Scaling WebSockets:
  - Use Redis Pub/Sub or a dedicated message broker
  - Each server subscribes to channels for its connected users
  - Load balancer uses sticky sessions (IP hash) for WebSocket connections

Read Receipts:
  - When user reads a message, send an update via WebSocket
  - Store "last read" timestamp per user per chat
  - Calculate unread count: messages after "last read" timestamp
```

**Success Criteria:**
- You can draw the architecture diagram with all major components
- You can explain why WebSockets are used instead of HTTP polling
- You can describe how messages get routed between servers

## The quest

**Independent Lab: Design Your Capstone Architecture**

This is the most important exercise in this session. You are designing the architecture for YOUR capstone project or a project of your choosing.

**Requirements:**
1. Draw a complete architecture diagram including:
   - Client application(s)
   - Load balancer (if applicable)
   - API server(s)
   - Database(s)
   - Cache layer (if applicable)
   - Any third-party services (auth, email, payment, etc.)
2. For each component, write 2-3 sentences explaining:
   - What it does
   - Why you chose it
   - How it would scale
3. Identify the top 3 potential bottlenecks in your system
4. For each bottleneck, describe how you would address it
5. Estimate the cost of running your architecture at 1,000 users vs. 100,000 users

**Stretch Goals:**
- Add a message queue for at least one async workflow
- Design a caching strategy with specific TTLs for different data types
- Create a data flow diagram showing how a single user request travels through your system

### Review the artifact

Your deliverable is **A system design document with estimates, failure paths, and explicit tradeoffs**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-9-4/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Read about client-server architecture. Review how your full-stack projects from Units 5-8 are structured (frontend, backend, database). Think about what would happen if your app suddenly had 100,000 users.
**Materials:** Whiteboard or diagramming tool (draw.io, Excalidraw, or Miro), system design reference sheet, architecture diagram templates.

**Assignment: System Design Document**
- **Objective:** Write a 1-2 page system design document for your capstone project
- **Tasks:**
  1. Architecture diagram (use draw.io, Excalidraw, or even hand-drawn and photographed)
  2. Component descriptions (what each piece does and why)
  3. Database schema overview (main collections/tables and their relationships)
  4. Scaling strategy (what you would do at 1K, 10K, and 100K users)
  5. Technology justifications (why Express vs. other frameworks, why MongoDB vs. PostgreSQL, etc.)
  6. Identify and address the top 3 potential bottlenecks
- **Stretch Goals:**
  - Add a cost estimate using AWS/Vercel/Railway pricing
  - Include a sequence diagram for one critical user flow
  - Research and document one alternative architecture and explain why you did not choose it
- **Submission:** Add to your capstone repository as `SYSTEM_DESIGN.md` with embedded or linked diagrams
- **Due:** Before Session 9.5

---

### Manual verification and further reading

- [Official reference 1](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
