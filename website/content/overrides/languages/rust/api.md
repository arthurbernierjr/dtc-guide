---
title: "Axum: API routes and CORS"
framework: Axum
version: "0.8.9"
lede: "Put CORS in front of the turtles API with tower-http, and deploy the binary to your own Railway project. Postgres is still DATABASE_URL."
updated_from: "the Rocket CORS and Heroku lesson. Heroku's free tier ended in 2022. Rocket is no longer the framework on this track."
verified: 2026-11-05
docs:
  - https://docs.rs/tower-http/latest/tower_http/cors/index.html
  - https://docs.rs/axum/0.8.9/axum/struct.Router.html
  - https://docs.railway.com/
exec: not run
verified_note: "Built and curled on Railway on 2026-11-07: Axum 0.8.9, SQLx 0.9.0, tower-http 0.6.11. Index, create 201, show, update, delete 204, missing 404, empty name 400, and the CORS preflight all passed. tower-http 0.6 is the release that matches Axum 0.8; cargo add without a version now resolves 0.7. The project was removed after the proof. The repo is github.com/arthurbernierjr/dtc-rust-api."
changes:
  - "rocket_cors is gone. CORS is tower_http::cors::CorsLayer, which is the layer Axum's ecosystem uses."
  - "Deploy is railway up on your own account, with railway add --database postgres. There is no Heroku CLI and no Rocket.toml for the port. The process reads PORT."
---

# Opinionated Framework - Building an API

---

## What you will learn

- How to expose the turtle routes as JSON
- How to answer a browser on another origin
- How to deploy the binary

---

## Setup

```bash
cargo add tower-http@0.6 --features cors
```

The pool, the migration, and the handlers are the models page. This page is the edge in front of them.

## Create a New Set of Routes

Keep one `Router`. Do not start a second server for "the API." The turtles routes are the API.

```rust
let app = Router::new()
    .route("/turtles", get(turtles::index).post(turtles::create))
    .route(
        "/turtles/{id}",
        get(turtles::show).put(turtles::update).delete(turtles::destroy),
    )
    .layer(cors_layer())
    .with_state(pool);
```

`.layer` wraps the whole router. Put it on the router that owns the routes, not on a single handler, or the preflight will miss the routes you forgot.

## Connecting to the Database

Same pool as the models page. `DATABASE_URL` in the environment. On Railway that variable is injected when the Postgres service is attached. The binary does not contain a password.

## Setting Up Our Database

`sqlx migrate run` against the URL you are about to serve. For the hosted database, run it once from your laptop with the URL Railway gives the service, before you call the public URL a success. A fresh database has no `turtles` table. The first request will 500, and the 500 is the missing migration, not a bad handler.

## Index Route

`GET /turtles` returns a JSON array. Empty is `[]`.

## Create Route

`POST /turtles` with `Content-Type: application/json` returns 201 and the row, including `id`.

## Update Route

`PUT /turtles/{id}` returns the updated row, or 404.

## Delete Route

`DELETE /turtles/{id}` returns 204, or 404 when the id was already gone.

## Handling CORS

```rust
use tower_http::cors::{Any, CorsLayer};

fn cors_layer() -> CorsLayer {
    CorsLayer::new()
        .allow_origin("http://localhost:5173".parse().unwrap())
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::PUT,
            axum::http::Method::DELETE,
        ])
        .allow_headers([axum::http::header::CONTENT_TYPE])
}
```

`Any` is in the import if you later open the origin list. Do not combine `allow_origin(Any)` with credentialed cookies. This API does not use cookies. The origin above is the Vite port the frontend guides use. Add the deployed origin as a second `allow_origin` call, or build the layer from a list you read from the environment, when the frontend has a public URL.

```bash
curl -i -X OPTIONS http://127.0.0.1:3000/turtles \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

Expect `access-control-allow-origin: http://localhost:5173`. If that header is missing, the layer is not on the router that owns `/turtles`, or the process you curled is an older binary.

## Deploying the API

Your own Railway account. Not a shared workspace that belongs to someone else's product.

```bash
railway login
railway init
railway add --database postgres
railway up
```

The service receives `PORT` and `DATABASE_URL`. The listener must use `PORT`:

```rust
let port = std::env::var("PORT").unwrap_or_else(|_| "3000".into());
let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}")).await.unwrap();
axum::serve(listener, app).await.unwrap();
```

Apply migrations to that database once:

```bash
railway run -- sqlx migrate run
```

`railway run` puts the service variables in the command's environment, so `sqlx` sees `DATABASE_URL`. Curl the public URL plus `/turtles`. A refused connection is the listen address. A 500 with a running process is the migration or the URL.

## Resources to Learn More

- [tower-http CORS](https://docs.rs/tower-http/latest/tower_http/cors/index.html)
- [Axum Router](https://docs.rs/axum/0.8.9/axum/struct.Router.html)
- [Railway](https://docs.railway.com/)
