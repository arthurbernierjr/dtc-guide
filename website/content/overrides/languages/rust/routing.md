---
title: "Axum: setup and routing"
framework: Axum
version: "0.8.9"
lede: "Start an Axum 0.8 service on stable Rust: a Router, handlers, path params, query strings, and a JSON body."
updated_from: "the Rocket 0.4 lesson, then the Rocket 0.5 rewrite. The database half of that stack depended on rocket_sync_db_pools 0.1.0 from 2023, which cannot track current Diesel. This track is Axum and, on the next page, SQLx."
verified: 2026-11-05
docs:
  - https://docs.rs/axum/0.8.9/axum/
  - https://github.com/tokio-rs/axum
  - https://docs.rs/axum/0.8.9/axum/extract/struct.Path.html
  - https://docs.rs/axum/0.8.9/axum/extract/struct.Query.html
  - https://docs.rs/axum/0.8.9/axum/struct.Json.html
  - https://doc.rust-lang.org/cargo/commands/cargo-add.html
exec: not run
verified_note: "Router, Path, Query, and Json were checked against the axum 0.8.9 docs (released 14 April 2026, MSRV 1.80). Path syntax is {id}, which is what 0.8 uses. Nothing was compiled."
changes:
  - "Rocket is no longer the framework on this track. Axum 0.8.9 is the maintained router on tokio and hyper, and it has a current Postgres story on the next page."
  - "The app is Router plus axum::serve on a TcpListener. There is no #[launch] and no rocket::build."
  - "Path params are extractors, Path<i32> or Path<String>, and the route pattern is /turtles/{id}."
---

# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- [rustup](https://rustup.rs/), so `rustc` and `cargo` track stable. Axum 0.8.9's minimum Rust is 1.80. Stable in 2026 is well past that. `rustc --version` tells you what you have.
- No nightly toolchain. Axum builds on stable.
- Postgres waits until the models page.

## What is an opinionated framework?

Axum is a minimalist router. It does not generate a project, an ORM, or a folder layout. You add it with cargo and you can read `main`. Rocket is still published (0.5.2), but the supported way to put Diesel behind it was `rocket_sync_db_pools` 0.1.0, last released in 2023, and the async pool's Diesel feature pins an older Diesel than the one you would install today. That combination does not compile into a current project without a fight. Axum plus SQLx does. Loco is the opinionated Rust framework if you want generators later. This track does not need them.

| Language   | Minimalist           | Opinionated     |
| ---------- | -------------------- | --------------- |
| JavaScript | Express 5, Hono      | NestJS          |
| Python     | FastAPI              | Django 6.1      |
| Ruby       | Sinatra              | Rails 8.1       |
| Go         | chi, net/http        | —               |
| Rust       | Axum 0.8, Actix Web  | Loco            |
| Java       | Javalin              | Spring Boot 4.1 |
| C#         | ASP.NET Core minimal | ASP.NET Core MVC |
| Dart       | shelf                | Serverpod       |

## Setting Up the Project

```bash
cargo new turtles --bin
cd turtles
cargo add axum --features macros
cargo add tokio --features macros,rt-multi-thread
cargo add serde --features derive
```

`cargo add` writes the versions into `Cargo.toml` and `Cargo.lock`. Commit the lockfile.

`src/main.rs`:

```rust
use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(root));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "the hall is open"
}
```

`cargo run`, then `curl -i http://127.0.0.1:3000/`. Expect `200` and the sentence. `0.0.0.0` is what a container needs. `127.0.0.1` is fine on a laptop and invisible to a host.

## Creating a Controller

Handlers are async functions. A module is the controller. Create `src/turtles.rs`:

```rust
pub async fn index() -> &'static str {
    "all the turtles"
}

pub async fn show() -> &'static str {
    "one turtle"
}
```

In `main.rs`:

```rust
mod turtles;

let app = Router::new()
    .route("/", get(root))
    .route("/turtles", get(turtles::index))
    .route("/turtles/{id}", get(turtles::show));
```

The pattern is `{id}`, with braces. Axum 0.7 used `:id`. A tutorial that still writes `:id` is on 0.7, and 0.8 will not match the route the way you expect.

## Using URL Params & Url Queries

```rust
use axum::extract::{Path, Query};
use serde::Deserialize;

#[derive(Deserialize)]
pub struct ColorQuery {
    color: Option<String>,
}

pub async fn show(Path(id): Path<i32>, Query(q): Query<ColorQuery>) -> String {
    format!("turtle {id}, color {:?}", q.color)
}
```

`Path<i32>` rejects `/turtles/nope` with 400 before your function body runs, because the extractor failed. `color` is optional, so `/turtles/4` and `/turtles/4?color=green` both match. A query struct whose fields are all required will 400 when the query is missing. That is the extractor, not a bug in the route.

## Accessing the Request Body

```rust
use axum::Json;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct TurtleInput {
    name: String,
    age: i32,
}

pub async fn create(Json(input): Json<TurtleInput>) -> (axum::http::StatusCode, Json<TurtleInput>) {
    (axum::http::StatusCode::CREATED, Json(input))
}
```

`.route("/turtles", get(turtles::index).post(turtles::create))` registers both verbs on one path. A body that is not JSON, or a JSON object missing `name`, fails the `Json` extractor and Axum returns 422. You do not write the 400 by hand for a shape error. You do write a 400 if `name` is present and empty, after the extractor has succeeded:

```rust
if input.name.is_empty() {
    return (axum::http::StatusCode::BAD_REQUEST, Json(input));
}
```

Returning the same input on both branches is only for this page, before a database exists. The next page returns the row.

## Resources to Learn More

- [axum docs, 0.8.9](https://docs.rs/axum/0.8.9/axum/)
- [Path](https://docs.rs/axum/0.8.9/axum/extract/struct.Path.html), [Query](https://docs.rs/axum/0.8.9/axum/extract/struct.Query.html), [Json](https://docs.rs/axum/0.8.9/axum/struct.Json.html)
- Next page: SQLx, migrations, and the same routes against Postgres
