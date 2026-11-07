**System Design Primer with Big Poppa Code: Building Your Digital Mansion**

*One small house, the guild hall from Unit 4, opened to a thousand members. One request walks through every room, the arithmetic says which rooms earn their keep, one room burns down mid-request, and one room is deliberately never built. Then the big houses, in a single table.*

---

![MERN architecture](/assets/diagrams/mern-architecture.svg)

![mern architecture](https://www.dropbox.com/s/4ty5gmm1kefk7yw/arthurGraphic-01.jpg?dl=1)

Designing a system is like building a house. You gotta have a plan, and you gotta make sure it's solid. But a house is sized for the people who live in it. A mansion with a ballroom nobody dances in is not grand. It is expensive, drafty, and one more room to keep clean.

So this primer builds one small house instead of the next Twitter: your guild hall from [Session 4.15](/path/4-15-the-guild-hall/), `hall-api` on port 4100, `hall-client` built with Vite, one MongoDB called `guildhall`. Accounts, letters between members, and a pack of holdings. In [Session 6.2](/path/6-2-the-gatekeeper/) you put Nginx in front of it, and in [Session 6.4](/path/6-4-opening-the-world-gate/) it reached the internet. Today the guild opens its doors to a thousand members, and you decide, room by room, what that number justifies.

If you came from [Session 9.5](/path/9-5-grand-architecture/): this page is the same moves as `docs/system-design.md`, a workload, a trace, a failure, a decision, applied to a house you have already built. Read "One request through the house" first. The eight numbered steps are the rooms, and the request visits them in order.

## One request through the house

The request is the one every member makes most: Sera opens her inbox. Her phone already holds a token from login. The client calls `GET /api/inbox` with `Authorization: Bearer <token>`. Follow it in.

### **1. Introduction: Architecting a Digital Mansion**

Before any room, the plan. For this house the plan is a workload: a thousand members, two visits a day each, about ten requests a visit, two letters written per member per day. The arithmetic is in the next section. Every room below is justified or rejected by it, not by a feeling.
The guild is not a bank. The target is "a member never notices a single process dying," which is two nines of patience, meaning the hall may be unreachable about one percent of the time, three or four days a year, plus one honest failure walkthrough. Not the five nines of marketing, which allow five minutes a year and cost a bank's budget.

Guest-ready means Sera's inbox answers in under half a second on the evening after a raid, when everyone opens it at once. That is the peak the numbers plan for.

### **2. The Grand Entrance: Load Balancer**

Before the door there is the address. Sera's phone asks DNS for `guildhall.example` and gets the IP of your one machine, cached for the record's TTL the way [Session 6.3](/path/6-3-the-teleportation-network/) showed. Then the packet arrives at Nginx on port 443. Nginx terminates TLS, so the token is decrypted here and nowhere earlier.
In Unit 6 the `location /api/` block had one `proxy_pass http://127.0.0.1:4100;`. For a thousand members it points at an upstream group of two `hall-api` processes, 4100 and 4101, and hands requests to them in turn. Round robin is enough, because the processes are identical and stateless: a process keeps nothing about Sera between requests, since the token carries her identity, so either process can answer any request. Sera's request goes to 4101. The traffic does not justify this door. At two requests a second one process would be bored. The failure in the third section justifies it, and the numbers say so out loud.

### **3. The Rooms: Servers**

Room 4101 is one Node process running `hall-api`, under pm2 so a crash becomes a restart. Inside, `requireUser` reads the bearer header, verifies the signature with `JWT_SECRET`, and sets `req.userId` to Sera's id. The handler is the one you wrote, `Message.find({ recipient: req.userId })` newest first with `populate('sender', 'name')`, plus a `limit(20)` now that an inbox can hold a year of letters.
Two processes is a hotel with two rooms, and pm2 is the manager who notices when a guest stops breathing. Docker and Kubernetes are the same job for two hundred rooms. The hall does not hire that manager, and the design document says so in one sentence.

### **4. The Vault: Databases**

The query leaves the droplet. The database is not on your machine. It is the MongoDB Atlas cluster from Session 6.4, a managed replica set reached over TLS, and the cluster accepts the connection only because the droplet's public IP is on its network access list. The `messages` collection holds every letter the guild has ever written, about seven hundred thousand after a year. The index on `recipient` from Session 4.15 is why this is a tree walk and not a scan: the database steps to Sera's twenty newest letters in a few milliseconds of its own time and never looks at the other six hundred ninety-nine thousand. The round trip to the cluster adds a few tens of milliseconds when the cluster is in the droplet's region, which is why 6.4 told you to pick that region. `populate` is a second small query, twenty sender ids to twenty names. Two round trips, ten kilobytes back.

Sharding splits a vault across machines when one machine cannot hold or serve it. Seven hundred thousand half-kilobyte letters is a third of a gigabyte. One vault holds a decade of this guild. Rejected, by arithmetic. Replication is a different question, durability rather than size, and it is the one database room a thousand members do justify: one primary plus a replica, so a disk failure is not the guild's whole history. This room exists because Atlas provides it. The free cluster is already a three-member replica set, a primary and two copies, and `rs.status()` in `mongosh` lists them. Without Atlas, with `mongod` on the droplet the way 6.4's aside describes, you would build the room yourself: a second `mongod` on a second machine, joined as a replica set member, before the first real letters arrive.

### **5. The Security System: Monitoring and Logging**

The request leaves one line behind it in the API's log: method, path, status, and milliseconds, `GET /api/inbox 200 38ms`. Nginx leaves its own line in the access log with the upstream it chose. Those two lines are your Prometheus and your ELK stack at this size; `pm2 logs hall-api` and `tail /var/log/nginx/access.log` are the dashboards.
Give each process the `GET /health` route that 6.2's test app had, answering `200` only when it can reach the database. Nobody watches that route for you. Nothing in Session 6.2 told Nginx or pm2 about it: pm2 restarts a process that exits, and Nginx only notices an upstream that fails a real request. You are the watcher. `curl -s http://127.0.0.1:4101/health` on the server is the first of the two curls 6.2 taught, and if you add a Railway health check or an outside uptime check, that is who calls the route every minute and messages you when it stops answering. The thing to monitor is not CPU. It is the ratio of `5xx` lines to all lines, and the slowest ten percent of `/api/inbox` timings, because those are the two numbers that tell you a room is failing before a member tells you.

### **6. The Property: Cloud Infrastructure**

The whole house stands on one rented droplet plus the Atlas cluster, or on Railway as two services and a database add-on, the same shape with the Nginx box replaced by a managed one. "Buying more land" for this house means a second small machine for the second `hall-api` process, so that one machine's power supply is not the whole guild. That is the one expansion the failure section argues for.
Backups are the perk you take on day one, after checking who provides it. The free Atlas tier takes no scheduled backups, 6.4 says so at the point of choice, so the nightly dump of `guildhall` is yours: `mongodump` against the cluster, which Session 12.3 practises, with the archive kept somewhere other than the droplet. A paid Atlas tier makes that dump Atlas's job, and it is the first thing a thousand members' letters are worth paying for. Everything else, autoscaling, managed queues, a dozen regions, is a perk for a house with a different workload.

### **7. The Mail Delivery: Content Delivery Network**

The JSON goes back the way it came, 4101 to Nginx to Sera's phone, about ten kilobytes, encrypted at the door. The page itself, the `hall-client` build, is a few hundred kilobytes of static files that Nginx serves straight from disk with a long `Cache-Control` so a returning member's phone does not ask twice. A CDN would put copies of those files in forty cities. The guild's members are in one. See "The room we did not build" for the decision record.

### **8. The Protective Moat: Security**

Four things guarded Sera's request. TLS at the door, so nobody on the coffee shop wifi reads her token. The signature check, so a forged token is a `401`. The recipient rule, so a letter id in a URL is `403` for anyone but the recipient, the leak Session 4.15 made you kill. And `JWT_SECRET` and `MONGODB_URI` in the environment, never in the repository.
A hall that leaks letters empties itself; nobody writes a second one.

## The numbers that justify each room

These are planning inputs chosen from how the hall is used, not measurements. The design document says so in its first line. A reviewer can argue with a number; nobody can argue with "it should scale."

| Input | Value | Where it comes from |
|---|---|---|
| Members | 1,000 | the guild's roster |
| Visits per member per day | 2 | morning and after the raid |
| Requests per visit | 10 | page, inbox, two letters, the pack, a few assets |
| Requests per day | 20,000 | 1,000 × 2 × 10 |
| Average requests per second | 0.23 | 20,000 / 86,400 |
| Peak factor | 8 | everyone opens the inbox in the same hour |
| Peak requests per second | about 2 | 0.23 × 8 |
| Letters written per day | 2,000 | 2 per member |
| Inbox and letter reads per day | 6,000 | 2 inbox opens + 4 letter opens per member, from 2 visits × (inbox + two letters) |
| Reads per write | 3 | 6,000 / 2,000 |
| Bytes per letter | 500 | body, two ids, a timestamp, overhead |
| Storage per year | about 365 MB | 2,000 × 500 × 365 |
| Inbox response | about 10 KB | 20 letters × 500 bytes |

Now hold each room up against that table.

| Room | Verdict | The arithmetic |
|---|---|---|
| DNS | Built, already | One record, cached for its TTL; cost is nothing. |
| Load balancer (Nginx upstream of two) | Built | Not for 2 requests a second. For the failure below: one dead process must not be the house being closed. |
| Two app processes | Built | Same reason. The second process is the cheapest availability you will ever buy. |
| One MongoDB (the Atlas cluster) with an index on `recipient` | Built | 2 reads a second at peak against an indexed query is far below what one small instance serves. The index is the scaling tool. |
| Replica of the database | Built, already | Durability, not throughput. 365 MB a year on one disk is one disk failure from zero letters. The Atlas cluster is a replica set, so the room came with the vault; on your own `mongod` you add the second member yourself. |
| Cache for the inbox | Rejected | Each inbox is read about twice a day and changes about twice a day. Reads per change is roughly one, so the hit rate is near zero, and a stale inbox hides a letter. A cache earns its room when the same answer is read many times before it changes. |
| Sharding | Rejected | A third of a gigabyte a year. One vault holds a decade. |
| Message queue | Rejected | Sending a letter is one insert. There is no slow work, no email, no image resize, to move out of the request. A queue with nothing to carry is a second process that can crash. |
| CDN | Rejected | Decision record below. |
| Docker, Kubernetes | Rejected | Two processes under pm2. The manager for two hundred rooms is not hired for two. |

The habit matters more than the verdicts. At ten thousand members every number is ten times larger and every verdict is the same. At a hundred thousand the peak is about two hundred requests a second, and the first room that changes is the database, with the replica taking the inbox reads. Write that sentence in the scaling plan now, with the number, so the reader knows which input to watch.

## The first failure

The evening after the raid. Peak hour. Sera opens her inbox, Nginx hands the request to 4101, and process 4101 dies while the handler is waiting on Atlas. An unhandled rejection, a memory spike, it does not matter which.

What Sera sees. Nginx was waiting on 4101 and gets a closed connection instead of a response. Its default rule for an upstream error on a request it has not started answering is to try the next upstream, so the same `GET /api/inbox` goes to 4100, which answers in a few tens of milliseconds. Sera's inbox arrives perhaps fifty milliseconds later than usual. She sees nothing. That is the load balancer's whole justification, written as an event rather than an adjective. If the crash had happened after 4101 began sending the response, Nginx cannot retry a half-sent reply, and Sera gets a `502` and the client's sentence, "The hall did not answer, try again," with her place on the page kept. Either way the request was a read, so retrying it is safe. If it had been `POST /api/messages`, the client does not retry on its own; Sera checks her outbox and sends again only if the letter is not there. That rule is the difference between one letter and two.

What the monitoring shows. `pm2 list` shows `hall-api` on 4101 with a restart count of one and an uptime of seconds. `pm2 logs hall-api` has the stack trace above the new `listening on 4101` line. Nginx's `error.log` has a line ending `upstream prematurely closed connection while reading response header from upstream`, and a few `connect() failed (111: Connection refused)` lines during the seconds the port was empty. The access log shows a burst of requests all served by 4100 and, if the retry could not help, a handful of `502` lines. Your two numbers moved: the `5xx` ratio ticked up for one minute and the slow tail of `/api/inbox` did not move at all. It is worth seeing once on purpose: `pm2 stop` one process under a small load test and read the logs.

What the load balancer does. After the first failed attempt Nginx marks 4101 as failed and stops sending it traffic for ten seconds, its default. pm2 has the process back within two or three seconds. After the ten seconds Nginx sends 4101 the next real request; pm2 restarted it long ago, the request succeeds, and 4101 is back in rotation. No person did anything, and `/health` played no part. It is the route you curl afterwards to confirm the restarted process can reach the database. If the cluster's primary had died instead, both processes would fail the same way for the seconds Atlas takes to elect a new primary, and the answer is that replica set plus a `503` with a kind sentence, which is the failure [Session 9.5](/path/9-5-grand-architecture/) walks for the capstone.

What is in the database afterwards. Nothing changed. It was a read. That sentence belongs in every failure walkthrough, because the day it is not true is the day you need the walkthrough.

## The room we did not build

A decision record, in the shape Session 9.5 asks for, written here in full so you can copy the shape.

**ADR-2: no CDN for the guild hall's static files**

**Context.** `hall-client` builds to about three hundred kilobytes of hashed files: each file's name carries a fingerprint of its contents, `index-3f9a2c.js`, so a changed file gets a new name and an unchanged name is safe to cache forever. Two thousand visits a day, so at most six hundred megabytes a day of static transfer, and most returning phones send `If-None-Match`, the header that asks "has the copy I hold changed?", and get `304`, the status that answers "no, use yours" with no body. The guild's members are in one region. Nginx serves static files from disk faster than Express would and sets `Cache-Control: public, max-age=31536000, immutable` on hashed filenames.

**Options.** (a) Nginx serves the build directly, as it does now. (b) A CDN in front of the whole domain, which caches the static files at its edge and proxies `/api/` through. (c) Upload the build to object storage with a CDN in front, and serve only the API from the machine.

**Decision.** (a). The latency a CDN removes is the distance between the member and the one machine. For members in one region that is tens of milliseconds, once per deploy, because the hashed files are cached on the phone after the first load. The two requests a second at peak are JSON, which a CDN does not cache.

**Consequences.** One fewer account, one fewer secret, no cache purge step in the deploy script, and no second place a stale file can live. Members on the far side of the world see a first page load a hundred milliseconds slower. The API is untouched either way.

**Revisit when.** More than a fifth of members are a continent away, or the build passes a megabyte, or members can upload avatars, at which point the files become blob storage with a CDN in front of it as one decision, not two.

What makes this reviewable: the context has numbers, the options include the rejected ones, and the revisit condition is something a log can measure. "Add a CDN later if needed" is a wish with a heading.

## Then the big houses

Now you can read the famous houses the way an architect reads them: not as lists of technologies, but as the one room each one needed more of than the guild hall does. The hall's rooms are the same rooms. The sizes are not.

| House | What its members do that the hall's do not | The room that grows first | The hall's version |
|---|---|---|---|
| Myspace | Customize a profile page and let strangers browse it; stream music from it | Fan-out: one profile read by thousands, so the cache the hall rejected becomes the main room, with blob storage for the audio | An inbox read twice a day by one person; no cache |
| Facebook Messenger | Expect a message to appear on the other phone within a second, with a push notification | Message delivery: a connection the server keeps open per member and a queue that promises every message arrives once | A letter that waits in the database until the recipient opens the inbox |
| Instagram | Upload a photo and have ten thousand followers see it in their feed | Media storage and the write fan-out: every photo is copied into blob storage and resized, and every post is written into thousands of feeds | Five hundred bytes of text, written once, to one recipient |
| Discord | Sit in a server with hundreds of others and see who is online, typing, and speaking right now | Real-time presence: a gateway that tracks every open connection and broadcasts tiny state changes to everyone in the room, plus voice | No presence at all; the hall does not know who is in it |

Read the table against the eight rooms and the pattern is plain. Each big house is the hall's rooms scaled up, plus one new room that answers one measured pressure: a cache and a blob store, an open connection, a media pipeline, a presence tracker. None of them starts by adding Kubernetes.

### Use this as a tool

When someone asks you to design anything, do what this page did. Say who the members are and what they do twice a day. Trace the one request they make most, through the address, the door, the room, the vault, and back. Kill one room mid-request and say what the member saw. Reject one room on purpose, with the number that would make you build it. Then, and only then, name the technologies.
