# Observability

**One-liner:** Logs, metrics, and traces tied together by correlation IDs so you can ask new questions about production without shipping new code.

## Say this
If you came from Session [9.5](/path/9-5-grand-architecture/): section 5 of your design asks what the API logs when something fails, and this sheet answers with three words you have not met. Here is one `GET /api/inbox` on the hall, the request from [4.15](/path/4-15-the-guild-hall/), and the three things it leaves behind.

```text
Sera's browser:  GET /api/inbox   (token in the header)   ->  200, 3 messages, 12 ms

1. one log line     an event: what happened, once, with the fields you will search by
   {"level":"info","method":"GET","route":"/api/inbox","status":200,"ms":12,"user":"sera","trace_id":"7f3a"}

2. one metric       a number that goes up or is sampled; no text, no ids
   http_requests_total{route="/api/inbox",status="200"}      +1
   http_request_duration_seconds{route="/api/inbox"}          observe 0.012

3. one trace        the request's path, one span per step, every span carrying trace_id 7f3a
   trace 7f3a   GET /api/inbox ....................................... 12 ms   span 1: the whole request
                  Message.find({ recipient }).populate('sender') ..... 9 ms   span 2: the MongoDB query
```

A log is line 1: one event with named fields, so you search for `trace_id=7f3a` instead of reading a wall of text. A metric is line 2: a count or a timing with a few labels, cheap to keep for months, and the thing a dashboard or an alert reads. A trace is line 3: the same request as a tree of timed steps, each step a span, so a slow request shows which step took the time. The `trace_id` is the thread through all three: the alert comes from the metric, the request is found in the log, and the slow step is read off the trace. The bullets below are interview vocabulary; the ones tagged (later) are tools you will meet when a second service exists.

- **Three pillars** — logs (events), metrics (numbers over time), traces (request paths).
- **Structured logging** — JSON with fields (`level`, `trace_id`, `user_id`), not printf strings.
- **Correlation ID / trace ID / span ID** — propagated via headers (W3C `traceparent`, `X-Request-ID`).
- **Distributed tracing** — spans per hop; OpenTelemetry, Jaeger, Zipkin, Honeycomb, Datadog APM.
- **RED method** — per service: Rate, Errors, Duration. For request-driven systems.
- **USE method** — per resource: Utilization, Saturation, Errors. For hosts, disks, pools.
- **Four golden signals (Google SRE)** — latency, traffic, errors, saturation.
- **SLI / SLO / error budget** — measured indicator, target, and allowed failure.
- **Alert on symptoms, not causes** — page on user-facing SLO burn, not on CPU.
- **Burn-rate alerting** — multi-window alerts on how fast the error budget is being spent. (later)
- **Cardinality** — number of unique label combinations; `user_id` as a metric label will blow up Prometheus. (later)
- **Sampling** — head-based vs tail-based trace sampling. (later)
- **Tooling** — Prometheus + Grafana, ELK/OpenSearch, Loki, Datadog, New Relic, Splunk, PagerDuty.

## How it works
```
request -> gateway assigns trace_id -> svc A (span) -> svc B (span) -> DB (span)
            |            |              |
          logs{trace_id} metrics{service,route,status} traces -> Jaeger/Tempo
```
1. Instrument once with OpenTelemetry SDK/auto-instrumentation; export via OTel Collector.
2. Metrics: counters (requests_total), histograms (request_duration_seconds buckets), gauges (queue_depth); scrape with Prometheus.
3. Logs: structured, include `trace_id`; ship via Fluent Bit/Vector to Loki/Elasticsearch.
4. Traces: propagate context across HTTP/gRPC/Kafka headers; sample 1-10% head-based, or tail-sample errors/slow.
5. Dashboards per service with RED; per resource with USE. Alerts on SLO burn rate → PagerDuty; runbooks linked.

## Trade-offs
| Choice | Pro | Con |
|---|---|---|
| Metrics | Cheap, fast queries, great for alerting | Pre-aggregated; limited cardinality |
| Logs | Arbitrary detail, searchable | Expensive at volume; noisy |
| Traces | Shows where time went across services | Sampling loses rare cases; instrumentation effort |
| Head sampling | Simple, low overhead | Might drop the interesting slow/error traces |
| Tail sampling | Keep errors and slow traces | Needs buffering collector; more infra |
| Alert on causes (CPU 80%) | Early warning | Pager fatigue, false positives |
| Alert on symptoms (SLO burn) | Only wakes you for user impact | Needs well-defined SLIs |

## Numbers
- Common SLO alert pair: 2% budget burn in 1 h (page) and 5% in 6 h (ticket); burn rate 14.4x and 6x for a 30-day 99.9% SLO.
- Trace sampling in production: 1-10% head-based is typical; 100% for low-traffic services.
- Prometheus scrape interval: 15-60 s; retention days-weeks locally, long-term in Thanos/Cortex/Mimir.
- Latency histogram buckets: use p50/p95/p99 from histograms, not averaged percentiles.

## In the interview
- Add it in the "how do we operate this" closing: "Every request carries a trace ID; RED metrics per service; SLO at p99 < 300 ms with burn-rate alerts."
- Say: "Logs are structured JSON with the trace ID so I can jump from an alert to the exact request path."
- Follow-up: "What do you alert on?" → "Symptoms: error-rate and latency SLO burn. CPU and queue depth are dashboards, not pages."
- Follow-up: "How do you debug a slow request across 8 services?" → "Pull the trace by ID, find the long span, pivot to that service's logs and the USE metrics of its dependencies."
