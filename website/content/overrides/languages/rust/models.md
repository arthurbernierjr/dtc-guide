---
title: "Axum and SQLx: models and migrations"
framework: Axum
version: "0.8.9"
lede: "Connect the Axum app to Postgres with a SQLx pool, keep the schema in SQL migrations, and answer index, create, update, and delete with the rows the database returns."
updated_from: "the Rocket plus rocket_sync_db_pools 0.1.0 plus Diesel lesson. That pool crate has not shipped since 2023 and pins an older Diesel than current."
verified: 2026-11-05
docs:
  - https://github.com/tokio-rs/axum/blob/main/examples/sqlx-postgres/src/main.rs
  - https://docs.rs/sqlx/latest/sqlx/
  - https://github.com/launchbadge/sqlx
  - https://docs.rs/axum/0.8.9/axum/extract/struct.State.html
exec: not run
verified_note: "Checked against the sqlx 0.9 docs and Axum's sqlx-postgres example on 2026-11-07: PgPoolOptions, State<PgPool>, runtime query_as with FromRow, fetch_optional for the 404, and sqlx migrate add and run from sqlx-cli. Nothing on this page was compiled or run. The todos crate on the API page is the one that was built and checked on Railway."
changes:
  - "Diesel and rocket_sync_db_pools are gone. SQLx 0.9 speaks Postgres from async Rust, which is what Axum's own example uses."
  - "Migrations are SQL files applied with sqlx migrate run, not a schema.rs generated against a crate version fight."
  - "A missing id is 404 because fetch_optional returns None. Create returns 201 and the inserted row."
---

# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- How to create models and migrations
- How to use models to add, update, and delete records

---

## Setup

From the turtles crate:

```bash
cargo add sqlx --features runtime-tokio,tls-rustls,postgres
cargo install sqlx-cli --no-default-features --features rustls,postgres
createdb turtles
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/turtles"
```

`runtime-tokio` is required. Without a runtime feature, SQLx compiles and panics on the first connect, which the crate documents. `tls-rustls` is the TLS backend SQLx asks you to name even for a local server that does not use TLS. On Railway, the hosted URL uses TLS and this feature is what speaks it.

Do not commit `.env` if you put the URL there. `DATABASE_URL` is the name SQLx, Diesel, and Railway all already use.

## Create a New Set of Routes

The routes from the last page stay. They gain `State<PgPool>` so each handler can reach the pool without a global.

```rust
use axum::extract::State;
use sqlx::PgPool;

pub async fn index(State(pool): State<PgPool>) -> Result<Json<Vec<Turtle>>, StatusCode> {
    let rows = sqlx::query_as::<_, Turtle>("SELECT id, name, age FROM turtles ORDER BY id")
        .fetch_all(&pool)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok(Json(rows))
}
```

`main` builds the pool before the server, and fails the process if it cannot connect. A server that starts and 500s every request is a worse failure than a process that refuses to boot.

```rust
let pool = sqlx::postgres::PgPoolOptions::new()
    .max_connections(5)
    .connect(&std::env::var("DATABASE_URL").expect("DATABASE_URL"))
    .await
    .expect("postgres");
let app = Router::new()
    .route("/turtles", get(turtles::index).post(turtles::create))
    .route("/turtles/{id}", get(turtles::show).put(turtles::update).delete(turtles::destroy))
    .with_state(pool);
```

## Connecting to the Database

The pool is `State`, not an extractor you write by hand, until you need a transaction. Axum's sqlx example uses this shape. `with_state` is once. Every handler that wants the pool names `State(pool): State<PgPool>` in its arguments. The order of extractors matters only when one consumes the body. `State` and `Path` do not, so they can sit beside `Json`.

If `cargo run` exits with "DATABASE_URL", the variable is not in the environment of that shell. Export it in the same shell, or use a tool that loads it. The binary will not look in a file unless you write that yourself. This page does not add a dotenv crate. The host injects the variable. Your shell can too.

## Setting Up Our Database

```bash
mkdir -p migrations
sqlx migrate add create_turtles
```

That writes `migrations/<timestamp>_create_turtles.sql`. Put this in it:

```sql
CREATE TABLE turtles (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age  INTEGER NOT NULL
);
```

```bash
sqlx migrate run
```

`sqlx migrate info` lists what ran. The next change is a new file from `sqlx migrate add`, not an edit to a migration that has already been applied on a shared database.

```rust
#[derive(serde::Serialize, sqlx::FromRow)]
pub struct Turtle {
    id: i32,
    name: String,
    age: i32,
}
```

`FromRow` is why `query_as` can build the struct from `SELECT id, name, age`. The column names and the field names match. A column you do not select is not filled.

## Index Route

The index handler above is the whole list. An empty table returns `[]` because `fetch_all` returns an empty `Vec`, and serde encodes that as `[]`.

## Create Route

```rust
pub async fn create(
    State(pool): State<PgPool>,
    Json(input): Json<TurtleInput>,
) -> Result<(StatusCode, Json<Turtle>), StatusCode> {
    if input.name.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }
    let row = sqlx::query_as::<_, Turtle>(
        "INSERT INTO turtles (name, age) VALUES ($1, $2) RETURNING id, name, age",
    )
    .bind(&input.name)
    .bind(input.age)
    .fetch_one(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    Ok((StatusCode::CREATED, Json(row)))
}
```

`$1` and `$2` are the Postgres placeholders. The name never gets concatenated into the statement. `RETURNING` is how you send the id back without a second query.

## Update Route

Same statement shape, with `UPDATE turtles SET name = $1, age = $2 WHERE id = $3 RETURNING id, name, age`. `fetch_optional` returns `None` when the id is not there. Map `None` to 404 and `Some(row)` to 200. Do not answer 200 with a default struct. That is a successful response about a turtle that does not exist.

## Delete Route

```rust
let result = sqlx::query("DELETE FROM turtles WHERE id = $1")
    .bind(id)
    .execute(&pool)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
if result.rows_affected() == 0 {
    return Err(StatusCode::NOT_FOUND);
}
Ok(StatusCode::NO_CONTENT)
```

204 has no body. A client that tries to parse JSON from a 204 will fail, which is why the frontend guides should check the status before they parse. Say that when you test.

## Resources to Learn More

- [Axum's SQLx example](https://github.com/tokio-rs/axum/blob/main/examples/sqlx-postgres/src/main.rs)
- [SQLx](https://github.com/launchbadge/sqlx)
- Next page: a fresh todos crate built with the same tools, with CORS and a Railway deploy

The API page starts a fresh todos project with the same tools; this turtles project is the practice run.
