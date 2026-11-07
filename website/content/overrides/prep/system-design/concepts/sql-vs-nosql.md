# SQL vs NoSQL

**One-liner:** Relational for structured data with joins and transactions; pick a NoSQL family only when a specific access pattern or scale need justifies it.

## Say this
If you came from Session [9.5](/path/9-5-grand-architecture/): your guild hall keeps heroes and quests in MongoDB, and the first rule under "How it works" says "Default: Postgres". Both are right, for different reasons. Here are two heroes and three quests laid out both ways (in your hall the models are `User` and `Todo`; the shape is the same).

```text
Relational (Postgres): two tables; a quest points at its hero by id

heroes                 quests
id | name              id | title             | hero_id   <- foreign key: must match a heroes.id
---+------             ---+-------------------+--------
 1 | Sera               1 | Clear the cellar  | 1
 2 | Bran               2 | Escort the mage   | 1
                        3 | Map the marsh     | 2

Sera's quests:  SELECT q.title FROM quests q JOIN heroes h ON q.hero_id = h.id WHERE h.name = 'Sera';

Document (MongoDB): one quests collection; the hero rides inside each quest, or is referenced by id

embedded                                      referenced (what the hall does)
{ _id: 1, title: "Clear the cellar",          { _id: 1, title: "Clear the cellar", hero: ObjectId("..a1") }
  hero: { name: "Sera" } }                    { _id: 2, title: "Escort the mage",  hero: ObjectId("..a1") }
{ _id: 2, title: "Escort the mage",           { _id: 3, title: "Map the marsh",    hero: ObjectId("..b2") }
  hero: { name: "Sera" } }                    plus a heroes collection; populate('hero', 'name') adds the name
{ _id: 3, title: "Map the marsh",
  hero: { name: "Bran" } }                    Rename Sera in the embedded layout and two documents must change.

Sera's quests:  Quest.find({ hero: seraId })   (one collection, no JOIN keyword)
```

This path teaches MongoDB first because one document is one thing, the same shape as the JavaScript object you already write, printed whole by `console.log(await Quest.findById(id))`, with no join syntax to learn on day one. This sheet defaults to Postgres because once data has relationships, a hero who owns quests, a message with a sender and a recipient, the database can enforce them (a `hero_id` that must exist, no orphaned quest) and answer cross-table questions with one `JOIN`, and the hall's holdings already have those relationships. The bullets below are interview vocabulary; the ones tagged (later) name stores you have not run yet.

- **Relational (SQL)** — tables, schema-on-write, joins, ACID, SQL. Postgres, MySQL, SQL Server, Oracle, Aurora, Spanner, CockroachDB.
- **Key-value** — opaque value by key, O(1). Redis, Memcached, DynamoDB (also wide-column-ish), Riak, etcd.
- **Document** — JSON-like docs, nested, flexible schema, secondary indexes. MongoDB, Couchbase, DynamoDB, Firestore, Postgres JSONB.
- **Wide-column** — rows with dynamic columns grouped by partition key, LSM-backed, write-optimized. Cassandra, HBase, ScyllaDB, Bigtable. (later)
- **Graph** — nodes/edges, traversal queries. Neo4j, Neptune, JanusGraph, TigerGraph. (later)
- **Time-series** — timestamped append-heavy data, downsampling, retention. InfluxDB, TimescaleDB, Prometheus, ClickHouse (OLAP).
- **Search** — inverted index, full-text, relevance, aggregations. Elasticsearch/OpenSearch, Solr, Meilisearch, Typesense.
- **Schema-on-write vs schema-on-read** — enforce at insert vs interpret at query time.
- **Denormalization** — duplicate data to avoid joins; the NoSQL default.
- **Access-pattern-first modeling** — DynamoDB/Cassandra: design tables from the queries, not the entities.
- **Polyglot persistence** — several stores, each for what it's good at; CDC/events keep them in sync.
- **NewSQL / distributed SQL** — SQL + horizontal scale via consensus: Spanner, CockroachDB, YugabyteDB, TiDB. (later)

## How it works
```
Postgres (system of record) --CDC/Debezium--> Kafka --> Elasticsearch (search)
                                                    --> Redis (cache/counters)
                                                    --> ClickHouse / warehouse (analytics)
```
Decision flow:
1. Default: Postgres. Normalized schema, indexes, JSONB for the flexible bits.
2. Need sub-ms reads or counters/leaderboards/sessions → Redis.
3. Need write ingest of 100k+/s with simple key access, or multi-region active-active → Cassandra/DynamoDB.
4. Need full-text or faceted search → Elasticsearch fed by CDC.
5. Need many-hop relationship queries (friends-of-friends, fraud rings) → graph DB.
6. Need metrics/events with time-range queries → time-series or columnar.
7. Need SQL *and* horizontal writes → distributed SQL (Spanner/CockroachDB), accepting latency cost.

## Trade-offs
| Choice | Pro | Con |
|---|---|---|
| Relational | Joins, constraints, transactions, mature tooling, flexible queries | Vertical write ceiling; sharding is manual |
| Key-value | Fastest, simplest, trivial to shard | No queries beyond key; no relationships |
| Document | Natural for aggregates, flexible schema | Joins weak; duplicated data drifts; big docs cost |
| Wide-column | Linear write scale, tunable consistency, multi-DC | Query only by designed keys; no ad-hoc queries or joins |
| Graph | Traversals in ms that would be N joins | Scale-out is hard; niche |
| Search engine | Relevance, fuzzy, facets | Not a source of truth; near-real-time (refresh ~1 s) |
| Distributed SQL | SQL + scale + strong consistency | Higher write latency; cost; fewer extensions |

## Numbers
- Single Postgres/MySQL primary: order of thousands to low tens of thousands of writes/s; tens of thousands+ reads/s with indexes; comfortable to a few TB.
- Redis: ~100k ops/s per node; sub-ms latency; memory-bound.
- Cassandra: ~10k+ writes/s per node and scales linearly with nodes; single-digit ms p99.
- DynamoDB: item max 400 KB; partition throughput 3,000 RCU / 1,000 WCU; effectively unlimited table throughput.
- MongoDB: document max 16 MB. Elasticsearch: default refresh interval 1 s.

## In the interview
- Start with "Postgres as the system of record" and justify any additional store by an access pattern: "Search needs an inverted index, so Elasticsearch fed by CDC."
- Say: "I'm not reaching for NoSQL for scale until the numbers show one primary can't take the writes."
- Follow-up: "Why not MongoDB for everything?" → "Relationships and transactions across aggregates get painful; Postgres gives JSONB when I want document flexibility."
- Follow-up: "When Cassandra over Postgres?" → "Write-heavy, append-mostly, partition-key access (messages, events, time-series), multi-region, and I can live with eventual consistency."
