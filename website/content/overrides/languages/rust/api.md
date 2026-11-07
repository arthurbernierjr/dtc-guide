---
title: "Axum: API routes and CORS"
framework: Axum
version: "0.8.9"
lede: "Build the Todos API from an empty crate: Axum 0.8 routes, a SQLx pool, JSON errors, CORS open to any origin, and a Dockerfile that Railway builds. Postgres arrives as DATABASE_URL."
updated_from: "the Rocket CORS and Heroku lesson. Heroku's free tier ended in 2022. Rocket is no longer the framework on this track."
verified: 2026-11-07
docs:
  - https://docs.rs/axum/0.8.9/axum/struct.Router.html
  - https://docs.rs/axum/0.8.9/axum/extract/struct.State.html
  - https://docs.rs/axum/0.8.9/axum/extract/rejection/index.html
  - https://docs.rs/tower-http/latest/tower_http/cors/index.html
  - https://docs.rs/sqlx/latest/sqlx/postgres/struct.PgPoolOptions.html
  - https://docs.rs/sqlx/latest/sqlx/macro.migrate.html
  - https://docs.railway.com/
  - https://docs.railway.com/variables
  - https://docs.railway.com/cli
exec: ran
verified_note: "Deployed to Railway on 2026-11-07 from commit 15b0f301ef885ace292c2c37ec579116d196bd00 of github.com/arthurbernierjr/dtc-rust-api, live at https://api-production-da990.up.railway.app; `node check.mjs https://api-production-da990.up.railway.app` printed 16/16 PASS (health, CORS preflights, list shape, three 400 cases, create 201, show, 404s, update, delete 204). Every whole-file block on this page is the file in that repo. Railway's build log printed axum 0.8.9, sqlx 0.9.0, tower-http 0.6.11, tokio 1.54.1, and serde 1.0.229 from cargo tree. No Rust toolchain ran on the build machine."
changes:
  - "The lesson is now a standalone todos crate that meets the shared contract: /todos and /todos/{id} instead of /turtles, objects with exactly id, subject, and details, a JSON 400 for blank or missing fields and for malformed JSON instead of Axum's plain-text 422, a JSON 404 for an unknown or non-numeric id, CORS open to Any origin instead of pinned to localhost:5173, and the table created on boot instead of a sqlx migrate run step."
  - "rocket_cors is gone. CORS is tower_http::cors::CorsLayer, which is the layer Axum's ecosystem uses."
  - "Deploy is a Dockerfile that Railway builds from the repo, with a Railway Postgres attached as DATABASE_URL. There is no Heroku CLI and no Rocket.toml for the port. The process reads PORT."
---

# Opinionated Framework - Building an API

---

## What you will learn

- How to start a fresh Axum crate and grow one `src/main.rs` into a JSON API
- How to make every error a JSON body with the right status
- How to answer a browser on another origin
- How to deploy the binary with a Dockerfile and a Railway Postgres

### The Todos contract

| Request | Response |
|---|---|
| `GET /health` | 200 `{"ok":true}` |
| `GET /todos` | 200 `[{id,subject,details}]` ordered by id |
| `GET /todos/:id` | 200 the object, or 404 `{"error":"not found"}` |
| `POST /todos` with `{subject,details}` | 201 the new object |
| `PUT /todos/:id` with `{subject,details}` | 200 the updated object, or 404 |
| `DELETE /todos/:id` | 204 with no body, or 404 |
| blank or missing `subject` or `details` | 400 `{"error":"…"}` |

Every backend guide on this site builds this same API, with no trailing slashes, objects that contain exactly `id`, `subject` and `details`, and CORS open to any origin so the four frontend guides can point at any of them. The finished example is [github.com/arthurbernierjr/dtc-rust-api](https://github.com/arthurbernierjr/dtc-rust-api), live at [api-production-da990.up.railway.app](https://api-production-da990.up.railway.app).

This page is a standalone lesson. The [routing page](/languages/rust/routing/) taught the Axum pieces, Router, handlers, `Path`, and `Json`. The [models page](/languages/rust/models/) taught the SQLx pieces, the pool, `State`, `query_as`, and `FromRow`. That turtles crate was the practice run. Here you start a new crate and use the same tools to meet the contract above, in one file, with nothing left over from the earlier pages.

---

## Setup

```bash
cargo new todos
cd todos
```

Replace the generated `Cargo.toml` with this one. It is the file in the repo.

```toml
[package]
name = "todos"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.8.9"
serde = { version = "1", features = ["derive"] }
sqlx = { version = "0.9", default-features = false, features = ["runtime-tokio", "tls-rustls", "postgres", "macros"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread", "net"] }
tower-http = { version = "0.6", features = ["cors"] }
```

Five crates do the work:

- `axum` is the router and the HTTP server glue. Pin the patch version you are reading docs for.
- `serde` with `derive` turns structs into JSON and JSON into structs.
- `sqlx` with `runtime-tokio`, `tls-rustls`, and `postgres` is the pool and the queries. The models page explained the first three features.
- `tokio` with `macros`, `rt-multi-thread`, and `net` is the runtime behind `#[tokio::main]` and `TcpListener`.
- `tower-http` with `cors` is the CORS layer. tower-http 0.6 is the release that matches Axum 0.8. `cargo add tower-http` without a version now resolves 0.7, which is why the version is written down.

> **WHY `default-features = false` on sqlx?** SQLx's defaults pull in `any`, `json`, and `migrate`. This crate uses none of them, and each one is compile time inside a Railway build container. Turning the defaults off and naming the features you want is how you keep a Rust build short enough to finish. The catch is `macros`. It is a default feature too, and `#[derive(FromRow)]` comes from it. Drop it and the `Todo` struct will not compile. So the list is the three features from the models page plus `macros`.

There is no `migrations/` folder and no `sqlx-cli` on this page. The reason is under "Setting Up Our Database."

## Create a New Set of Routes

Open `src/main.rs`, delete the hello world, and build the file top to bottom. Start with the imports. Every name below is used before the page ends.

```rust
use axum::extract::rejection::{JsonRejection, PathRejection};
use axum::extract::{Path, State};
use axum::http::{header::CONTENT_TYPE, Method, StatusCode};
use axum::response::Html;
use axum::routing::get;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPoolOptions;
use sqlx::{FromRow, PgPool};
use tower_http::cors::{Any, CorsLayer};
```

`JsonRejection` and `PathRejection` are the errors Axum makes when a body is not JSON or an id is not a number. You will catch both.

### The structs

```rust
#[derive(Serialize, FromRow)]
struct Todo {
    id: i32,
    subject: String,
    details: String,
}

// Both fields are Option so a missing key is our 400, not Axum's rejection.
#[derive(Deserialize)]
struct TodoInput {
    subject: Option<String>,
    details: Option<String>,
}

#[derive(Serialize)]
struct ApiError {
    error: String,
}

#[derive(Serialize)]
struct Health {
    ok: bool,
}
```

`Todo` is what goes out: `Serialize` for the response, `FromRow` so `query_as` can build it from `SELECT id, subject, details`. `TodoInput` is what comes in.

> **WHY are the input fields `Option`?** If `subject` were a `String`, a request with no `subject` key would fail inside Axum's `Json` extractor. Axum answers that with a 422 and a plain-text message. The contract says 400 with a JSON body. Making both fields `Option<String>` means a missing key deserializes fine, and the check for it is yours, in `validate`, where you can answer 400 `{"error":"subject is required"}` the same way every other backend on this site does.

`ApiError` is the shape of every error body. `Health` is the shape of `/health`.

### The type aliases and the helpers

```rust
// Every handler fails the same way: a status plus {"error": "..."}.
type Failure = (StatusCode, Json<ApiError>);
// Wrapping an extractor in Result lets us answer its rejection ourselves.
type Id = Result<Path<i32>, PathRejection>;
type Body = Result<Json<TodoInput>, JsonRejection>;

fn fail(status: StatusCode, message: &str) -> Failure {
    (status, Json(ApiError { error: message.to_string() }))
}

fn not_found() -> Failure {
    fail(StatusCode::NOT_FOUND, "not found")
}

fn database_error(_: sqlx::Error) -> Failure {
    fail(StatusCode::INTERNAL_SERVER_ERROR, "database")
}
```

`Failure` is a tuple of a status and a JSON body. Axum already knows how to turn `(StatusCode, Json<T>)` into a response, so every handler can return `Result<_, Failure>` and use `?`.

> **WHY wrap the extractors in `Result`?** An extractor argument like `Path<i32>` either succeeds or Axum answers with its own rejection before your handler runs. Write the argument as `Result<Path<i32>, PathRejection>` instead and Axum hands you the rejection. Now `/todos/abc` can be your 404 and a body that is not JSON can be your 400. `Id` and `Body` are those two `Result` types with short names, so handler signatures stay readable.

`fail` builds a `Failure`. `not_found` is the one 404 the contract allows. `database_error` turns any `sqlx::Error` into a 500 and keeps the database message off the wire.

### Validation and parsing

```rust
fn validate(input: &TodoInput) -> Result<(String, String), Failure> {
    let subject = input.subject.as_deref().unwrap_or("").trim();
    let details = input.details.as_deref().unwrap_or("").trim();
    if subject.is_empty() {
        return Err(fail(StatusCode::BAD_REQUEST, "subject is required"));
    }
    if details.is_empty() {
        return Err(fail(StatusCode::BAD_REQUEST, "details is required"));
    }
    Ok((subject.to_string(), details.to_string()))
}

// Malformed JSON would normally get Axum's plain-text reply; turn it into our 400.
fn parse_body(body: Body) -> Result<(String, String), Failure> {
    let Json(input) = body.map_err(|_| fail(StatusCode::BAD_REQUEST, "invalid json"))?;
    validate(&input)
}

// A non-numeric id like /todos/abc is simply something we do not have.
fn parse_id(id: Id) -> Result<i32, Failure> {
    id.map(|Path(id)| id).map_err(|_| not_found())
}
```

`validate` trims both fields and reports the first one that is blank or missing. `parse_body` runs before it, turning malformed JSON into `400 {"error":"invalid json"}`. `parse_id` maps a non-numeric id to the same 404 a missing row gets.

### `/` and `/health`

```rust
async fn root() -> Html<&'static str> {
    Html(PAGE)
}

async fn health() -> Json<Health> {
    Json(Health { ok: true })
}
```

`root` serves a small HTML page from `src/page.html`, compiled into the binary with `include_str!` at the bottom of the file. `health` is the first thing to curl after a deploy. If it answers, the process is up and the port is right, before you ask anything of the database.

### Handler signatures

Every data handler has the same shape: `State(pool)` first, then `Id` if the route has one, then `Body` if the request has one.

> **WHY that order?** `Json` reads the request body, and a body can only be read once. Axum requires the extractor that consumes the body to be the last argument. `State` and `Path` consume nothing, so they go first.

The router that ties the handlers together is in `main`, at the end of the file. Here it is now so you can see where each handler lands:

```rust
    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/todos", get(index).post(create))
        .route("/todos/{id}", get(show).put(update).delete(destroy))
        .layer(cors)
        .with_state(pool);
```

Axum 0.8 writes the path parameter as `{id}`. The older `:id` syntax from Axum 0.7 is a compile-time error in 0.8. `.layer(cors)` is on the router that owns the routes, so the preflight reaches every one of them.

## Connecting to the Database

The pool is built once in `main`, before the server, and handed to every handler as `State`. This is the shape from the models page and from Axum's own `sqlx-postgres` example.

```rust
#[tokio::main]
async fn main() {
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("could not connect to postgres");
```

`DATABASE_URL` is read from the environment and nowhere else. The binary does not look in a file. Locally, export it in the shell that runs `cargo run`. On Railway, the variable comes from the Postgres service, which is the "Deploying the API" section.

```bash
createdb todos
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/todos"
```

`expect` on the connect is deliberate. A process that refuses to boot without a database is easier to diagnose than one that boots and 500s every request.

## Setting Up Our Database

The table is created by the process itself, right after the pool connects:

```rust
    // Idempotent, so it is safe on every boot, even when the table already exists.
    sqlx::query("CREATE TABLE IF NOT EXISTS todos (id SERIAL PRIMARY KEY, subject TEXT NOT NULL, details TEXT NOT NULL)")
        .execute(&pool)
        .await
        .expect("could not create the todos table");
```

> **WHY not `sqlx::migrate!` here?** The models page used SQL migration files and `sqlx migrate run`. That is the right tool when a schema changes over time, because the ledger in `_sqlx_migrations` records what ran. This API has one table that never changes, and the deploy target is a database you may have just created. `CREATE TABLE IF NOT EXISTS` is idempotent, so it is safe on every boot, needs no ledger to keep in sync, needs no `sqlx-cli` on the build machine, and needs no second command after the deploy. When this API grows a second table or a column rename, move to [`sqlx::migrate!`](https://docs.rs/sqlx/latest/sqlx/macro.migrate.html), which embeds the `migrations/` folder in the binary and applies it on boot with the same one-call shape.

`SERIAL PRIMARY KEY` gives you the `id` the contract returns. Both text columns are `NOT NULL`, which `validate` already guarantees before the insert.

## Index Route

`GET /todos` is a `SELECT` ordered by id. An empty table returns `[]` because `fetch_all` returns an empty `Vec`.

```rust
async fn index(State(pool): State<PgPool>) -> Result<Json<Vec<Todo>>, Failure> {
    let todos = sqlx::query_as::<_, Todo>("SELECT id, subject, details FROM todos ORDER BY id")
        .fetch_all(&pool)
        .await
        .map_err(database_error)?;
    Ok(Json(todos))
}
```

`GET /todos/{id}` is the same query with a `WHERE`, and `fetch_optional` instead of `fetch_all`:

```rust

async fn show(State(pool): State<PgPool>, id: Id) -> Result<Json<Todo>, Failure> {
    let id = parse_id(id)?;
    let todo = sqlx::query_as::<_, Todo>("SELECT id, subject, details FROM todos WHERE id = $1")
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(database_error)?;
    todo.map(Json).ok_or_else(not_found)
}
```

`fetch_optional` returns `None` when the row is not there. `todo.map(Json).ok_or_else(not_found)` turns `Some(row)` into 200 and `None` into the 404. Do not answer 200 with a default struct. That is a successful response about a todo that does not exist.

## Create Route

`POST /todos` parses, validates, inserts, and answers 201 with the row the database returns.

```rust
async fn create(
    State(pool): State<PgPool>,
    body: Body,
) -> Result<(StatusCode, Json<Todo>), Failure> {
    let (subject, details) = parse_body(body)?;
    let sql = "INSERT INTO todos (subject, details) VALUES ($1, $2) RETURNING id, subject, details";
    let todo = sqlx::query_as::<_, Todo>(sql)
        .bind(subject)
        .bind(details)
        .fetch_one(&pool)
        .await
        .map_err(database_error)?;
    Ok((StatusCode::CREATED, Json(todo)))
```

`parse_body(body)?` is the whole 400 story. Malformed JSON, a missing key, and a blank string all leave through that `?` as a `Failure` with a JSON body. `$1` and `$2` are the Postgres placeholders. The text never gets concatenated into the statement. `RETURNING` sends the id back without a second query. `(StatusCode::CREATED, Json(todo))` is how a handler sets a status other than 200.

## Update Route

`PUT /todos/{id}` is the create handler plus an id. The order of the arguments is `State`, `Id`, `Body`, for the reason above.

```rust
async fn update(State(pool): State<PgPool>, id: Id, body: Body) -> Result<Json<Todo>, Failure> {
    let id = parse_id(id)?;
    let (subject, details) = parse_body(body)?;
    let sql = "UPDATE todos SET subject = $1, details = $2 WHERE id = $3 RETURNING id, subject, details";
    let todo = sqlx::query_as::<_, Todo>(sql)
        .bind(subject)
        .bind(details)
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(database_error)?;
    todo.map(Json).ok_or_else(not_found)
}
```

Validation runs before the query, so a bad body on a missing id is a 400, not a 404. `UPDATE ... RETURNING` with `fetch_optional` means a missing id is `None` and the same `not_found` as `show`.

## Delete Route

`DELETE /todos/{id}` returns 204 with no body, or 404 when the id was already gone.

```rust
async fn destroy(State(pool): State<PgPool>, id: Id) -> Result<StatusCode, Failure> {
    let id = parse_id(id)?;
    let result = sqlx::query("DELETE FROM todos WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(database_error)?;
    if result.rows_affected() == 0 {
        return Err(not_found());
    }
    Ok(StatusCode::NO_CONTENT)
}
```

`execute` returns a result with `rows_affected`. Zero rows means there was nothing to delete, which is the 404. A bare `StatusCode` is a valid Axum response, so `Ok(StatusCode::NO_CONTENT)` is the whole 204. A client that tries to parse JSON from a 204 will fail, which is why the frontend guides check the status before they parse.

### Test it locally

Run the server with the `DATABASE_URL` from above exported in the same shell:

```bash
cargo run
```

The first build is a few minutes. Then, in another terminal, walk the contract with curl and read the status line of each reply:

```bash
curl -i http://127.0.0.1:8080/health
# HTTP/1.1 200 OK  {"ok":true}

curl -i -X POST http://127.0.0.1:8080/todos \
  -H 'Content-Type: application/json' \
  -d '{"subject":"Learn Axum","details":"Build the todos API"}'
# HTTP/1.1 201 Created  {"id":1,"subject":"Learn Axum","details":"Build the todos API"}

curl -i -X POST http://127.0.0.1:8080/todos \
  -H 'Content-Type: application/json' \
  -d '{"subject":"","details":"x"}'
# HTTP/1.1 400 Bad Request  {"error":"subject is required"}

curl -i http://127.0.0.1:8080/todos/abc
# HTTP/1.1 404 Not Found  {"error":"not found"}

curl -i -X DELETE http://127.0.0.1:8080/todos/1
# HTTP/1.1 204 No Content
```

No trailing slashes. `/todos/` is a different path in Axum and answers 404.

## Handling CORS

The layer is built in `main`, just before the router:

```rust
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers([CONTENT_TYPE]);
```

The browser sends a preflight `OPTIONS` before a JSON `POST` from another origin. If nothing answers it, the browser reports a CORS error and your handler never runs. `CorsLayer` answers the preflight and adds the `access-control-allow-*` headers to every real response.

`Any` on the origin means `access-control-allow-origin: *`. That is what the contract asks for, so every frontend guide on this site can point at this API from any port and any host. In a real product, narrow it to the frontend's origin with `.allow_origin("https://your-app.example".parse::<HeaderValue>().unwrap())`. Never combine `Any` with credentialed cookies. This API has no cookies.

```bash
curl -i -X OPTIONS http://127.0.0.1:8080/todos \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

Expect `HTTP/1.1 200 OK` and `access-control-allow-origin: *`. If the header is missing, the layer is not on the router that owns `/todos`, or the process you curled is an older binary.

## Deploying the API

Railway builds the repo from this `Dockerfile`. It is the file in the repo.

```dockerfile
FROM rust:1-bookworm AS build
WORKDIR /src
COPY . .
RUN CARGO_BUILD_JOBS=1 cargo build --release --message-format=short > /tmp/build.txt 2>&1 || (cat /tmp/build.txt && exit 1)
RUN cargo tree --depth 1 --edges normal

FROM debian:bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /src/target/release/todos /todos
USER nobody
CMD ["/todos"]
```

Two stages. The first compiles on the official `rust:1-bookworm` image. The second copies the one binary onto `debian:bookworm-slim` with `ca-certificates`, so the TLS stack can verify the database server when the URL asks for it, and runs it as `nobody`.

> **WHY `CARGO_BUILD_JOBS=1`?** Cargo compiles crates in parallel, one rustc per core, and each rustc holds a lot of memory. A Railway build container has less memory than your laptop. With the default job count, the build gets killed mid-way and the log ends with no error from Rust at all. One job at a time is slower and finishes. The release build of this crate took about eight minutes on Railway. That is normal for Rust. Do not cancel it.

The rest of that `RUN` line keeps the build log readable: `--message-format=short` prints one line per warning, the output goes to a file, and the file is printed only if the build fails. `cargo tree --depth 1` prints the exact crate versions that were compiled into the log, which is how the versions on this page were verified.

### Railway Postgres becomes DATABASE_URL

Use your own Railway account, not a shared workspace that belongs to someone else's product. From the crate folder:

```bash
railway login
railway init
railway add --database postgres
railway variable set 'DATABASE_URL=${{Postgres.DATABASE_URL}}'
railway up
```

`railway add --database postgres` creates a Postgres service in the project. The API service does not see its URL until you reference it. The `${{Postgres.DATABASE_URL}}` value is a Railway [reference variable](https://docs.railway.com/variables): it stays in sync if the database password is regenerated. The same thing from the dashboard is a Postgres service from "+ New," then a `DATABASE_URL` variable on the API service with that reference as its value. Railway sets `PORT` on its own.

`railway up` uploads the folder and builds the Dockerfile. When the build finishes, the process connects, runs `CREATE TABLE IF NOT EXISTS`, and listens. There is no migrate step to run afterward. Generate a public domain from the service settings, or with the CLI:

```bash
railway domain
```

### Check the deploy

Curl `/health` first. A refused connection is the port or the domain. A 500 from `/todos` with a healthy `/health` is `DATABASE_URL`.

```bash
curl -i https://your-api.up.railway.app/health
# HTTP/1.1 200 OK  {"ok":true}

curl -i https://your-api.up.railway.app/todos
# HTTP/1.1 200 OK  []
```

Run the contract check against your own deploy: `node check.mjs https://your-api.up.railway.app` (copy `check.mjs` from the example repo). All 16 lines should say PASS.

### The whole file

Here is the complete `src/main.rs`, copied from the repo so you can diff yours against it.

```rust
use axum::extract::rejection::{JsonRejection, PathRejection};
use axum::extract::{Path, State};
use axum::http::{header::CONTENT_TYPE, Method, StatusCode};
use axum::response::Html;
use axum::routing::get;
use axum::{Json, Router};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPoolOptions;
use sqlx::{FromRow, PgPool};
use tower_http::cors::{Any, CorsLayer};

#[derive(Serialize, FromRow)]
struct Todo {
    id: i32,
    subject: String,
    details: String,
}

// Both fields are Option so a missing key is our 400, not Axum's rejection.
#[derive(Deserialize)]
struct TodoInput {
    subject: Option<String>,
    details: Option<String>,
}

#[derive(Serialize)]
struct ApiError {
    error: String,
}

#[derive(Serialize)]
struct Health {
    ok: bool,
}

// Every handler fails the same way: a status plus {"error": "..."}.
type Failure = (StatusCode, Json<ApiError>);
// Wrapping an extractor in Result lets us answer its rejection ourselves.
type Id = Result<Path<i32>, PathRejection>;
type Body = Result<Json<TodoInput>, JsonRejection>;

fn fail(status: StatusCode, message: &str) -> Failure {
    (status, Json(ApiError { error: message.to_string() }))
}

fn not_found() -> Failure {
    fail(StatusCode::NOT_FOUND, "not found")
}

fn database_error(_: sqlx::Error) -> Failure {
    fail(StatusCode::INTERNAL_SERVER_ERROR, "database")
}

fn validate(input: &TodoInput) -> Result<(String, String), Failure> {
    let subject = input.subject.as_deref().unwrap_or("").trim();
    let details = input.details.as_deref().unwrap_or("").trim();
    if subject.is_empty() {
        return Err(fail(StatusCode::BAD_REQUEST, "subject is required"));
    }
    if details.is_empty() {
        return Err(fail(StatusCode::BAD_REQUEST, "details is required"));
    }
    Ok((subject.to_string(), details.to_string()))
}

// Malformed JSON would normally get Axum's plain-text reply; turn it into our 400.
fn parse_body(body: Body) -> Result<(String, String), Failure> {
    let Json(input) = body.map_err(|_| fail(StatusCode::BAD_REQUEST, "invalid json"))?;
    validate(&input)
}

// A non-numeric id like /todos/abc is simply something we do not have.
fn parse_id(id: Id) -> Result<i32, Failure> {
    id.map(|Path(id)| id).map_err(|_| not_found())
}

async fn root() -> Html<&'static str> {
    Html(PAGE)
}

async fn health() -> Json<Health> {
    Json(Health { ok: true })
}

async fn index(State(pool): State<PgPool>) -> Result<Json<Vec<Todo>>, Failure> {
    let todos = sqlx::query_as::<_, Todo>("SELECT id, subject, details FROM todos ORDER BY id")
        .fetch_all(&pool)
        .await
        .map_err(database_error)?;
    Ok(Json(todos))
}

async fn create(
    State(pool): State<PgPool>,
    body: Body,
) -> Result<(StatusCode, Json<Todo>), Failure> {
    let (subject, details) = parse_body(body)?;
    let sql = "INSERT INTO todos (subject, details) VALUES ($1, $2) RETURNING id, subject, details";
    let todo = sqlx::query_as::<_, Todo>(sql)
        .bind(subject)
        .bind(details)
        .fetch_one(&pool)
        .await
        .map_err(database_error)?;
    Ok((StatusCode::CREATED, Json(todo)))
}

async fn show(State(pool): State<PgPool>, id: Id) -> Result<Json<Todo>, Failure> {
    let id = parse_id(id)?;
    let todo = sqlx::query_as::<_, Todo>("SELECT id, subject, details FROM todos WHERE id = $1")
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(database_error)?;
    todo.map(Json).ok_or_else(not_found)
}

async fn update(State(pool): State<PgPool>, id: Id, body: Body) -> Result<Json<Todo>, Failure> {
    let id = parse_id(id)?;
    let (subject, details) = parse_body(body)?;
    let sql = "UPDATE todos SET subject = $1, details = $2 WHERE id = $3 RETURNING id, subject, details";
    let todo = sqlx::query_as::<_, Todo>(sql)
        .bind(subject)
        .bind(details)
        .bind(id)
        .fetch_optional(&pool)
        .await
        .map_err(database_error)?;
    todo.map(Json).ok_or_else(not_found)
}

async fn destroy(State(pool): State<PgPool>, id: Id) -> Result<StatusCode, Failure> {
    let id = parse_id(id)?;
    let result = sqlx::query("DELETE FROM todos WHERE id = $1")
        .bind(id)
        .execute(&pool)
        .await
        .map_err(database_error)?;
    if result.rows_affected() == 0 {
        return Err(not_found());
    }
    Ok(StatusCode::NO_CONTENT)
}

#[tokio::main]
async fn main() {
    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("could not connect to postgres");

    // Idempotent, so it is safe on every boot, even when the table already exists.
    sqlx::query("CREATE TABLE IF NOT EXISTS todos (id SERIAL PRIMARY KEY, subject TEXT NOT NULL, details TEXT NOT NULL)")
        .execute(&pool)
        .await
        .expect("could not create the todos table");

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE, Method::OPTIONS])
        .allow_headers([CONTENT_TYPE]);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health))
        .route("/todos", get(index).post(create))
        .route("/todos/{id}", get(show).put(update).delete(destroy))
        .layer(cors)
        .with_state(pool);

    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .expect("could not bind the port");
    axum::serve(listener, app).await.expect("server stopped");
}

const PAGE: &str = include_str!("page.html");
```

And `src/page.html`, which `include_str!` compiles into the binary:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Todos</title>
<style>
  body { margin: 0; padding: 48px 24px; background: #08080A; color: #EAE6E1; font-family: system-ui, sans-serif; }
  main { max-width: 640px; margin: 0 auto; }
  p { color: #8A8A94; }
  a { color: #2FD48F; }
  code { color: #E8D800; }
</style>
</head>
<body>
<main>
  <p>Rust · Axum</p>
  <h1>Todos</h1>
  <p>JSON lives at <a href="/todos"><code>/todos</code></a></p>
  <p><a href="https://github.com/arthurbernierjr/dtc-rust-api">Source on GitHub</a></p>
</main>
</body>
</html>
```

## Resources to Learn More

- [Axum Router](https://docs.rs/axum/0.8.9/axum/struct.Router.html)
- [Axum State](https://docs.rs/axum/0.8.9/axum/extract/struct.State.html)
- [Axum extractor rejections](https://docs.rs/axum/0.8.9/axum/extract/rejection/index.html)
- [tower-http CORS](https://docs.rs/tower-http/latest/tower_http/cors/index.html)
- [SQLx PgPoolOptions](https://docs.rs/sqlx/latest/sqlx/postgres/struct.PgPoolOptions.html)
- [sqlx::migrate!](https://docs.rs/sqlx/latest/sqlx/macro.migrate.html), the step up from `CREATE TABLE IF NOT EXISTS`
- [Railway variables](https://docs.railway.com/variables) and the [Railway CLI](https://docs.railway.com/cli)
- The finished example: [github.com/arthurbernierjr/dtc-rust-api](https://github.com/arthurbernierjr/dtc-rust-api)
