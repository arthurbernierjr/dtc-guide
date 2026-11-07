---
title: "chi: building and deploying an API"
framework: chi
version: "5.5.0"
lede: "Start a fresh todos project with chi, pgx, and goose, serve the Todos contract every backend guide on this site shares, prove it with check.mjs, and deploy it to Railway where Postgres arrives as DATABASE_URL and the migration runs on boot."
updated_from: "the Buffalo deploy lesson (Heroku, then a Buffalo Dockerfile). Buffalo's CLI is not the track anymore."
verified: 2026-11-07
docs:
  - https://go.dev/dl/
  - https://go.dev/doc/modules/managing-dependencies
  - https://github.com/go-chi/chi
  - https://github.com/go-chi/cors
  - https://pkg.go.dev/github.com/go-chi/cors
  - https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool
  - https://github.com/pressly/goose
  - https://pkg.go.dev/github.com/pressly/goose/v3
  - https://docs.railway.com/
  - https://docs.railway.com/guides/dockerfiles
  - https://docs.railway.com/guides/postgresql
  - https://docs.railway.com/guides/variables
exec: ran
verified_note: "Deployed to Railway on 2026-11-07 from commit f0956e84464055cc3c5ce00ee49ed309f51defa8 of github.com/arthurbernierjr/dtc-go-api, live at https://api-production-a3ab.up.railway.app; `node check.mjs https://api-production-a3ab.up.railway.app` printed 16/16 PASS (health, CORS preflights, list shape, three 400 cases, create 201, show, 404s, update, delete 204). Railway built the golang:1.27 image with chi v5.5.0, go-chi/cors v1.2.2, pgx v5.12.0, and goose v3.29.0. Every whole-file block on this page is the file in that repo. No Go toolchain ran on the build machine."
changes:
  - "Contract alignment: the page used to extend the turtles project at `/turtles/` with trailing slashes, a `name` and `age` body, a pinned `http://localhost:5173` origin, and a manual goose command after deploy; it now starts a fresh todos project that serves `/health` and `/todos` with no trailing slashes, rows of exactly `id`, `subject` and `details`, 400 JSON for a blank or missing field, CORS open to every origin, and goose running on boot."
  - "The Buffalo Dockerfile and the 2023 buffalo CLI base image are gone. The binary is a normal Go build. Railway builds it from the repo."
  - "CORS is github.com/go-chi/cors, mounted once, not headers copied onto each handler."
  - "The listen address reads PORT, which is what Railway sets. Locally it falls back to 8080."
---

# Opinionated Framework Part 3 - Building and Deploying an API

---

## What you will learn

- How to build an API
- How to test your API
- How to deploy your API

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

Every backend guide on this site builds this same API: no trailing slashes, objects that contain exactly `id`, `subject` and `details`, and CORS open to any origin so the four frontend guides can point at any of them. The finished example is [github.com/arthurbernierjr/dtc-go-api](https://github.com/arthurbernierjr/dtc-go-api), live at [api-production-a3ab.up.railway.app](https://api-production-a3ab.up.railway.app).

**WHY:** This page starts a new project instead of adding to the turtles API from the [routing](/languages/go/routing/) and [models](/languages/go/models/) pages. One app per lesson, and every language's API page builds the same todos app against the same contract, so a frontend guide can swap your Go API for a Ruby or Rust one without changing a line. The 2021 original started fresh too, with `buffalo new`. The turtles project was the practice run. Everything it taught about chi and pgx is used here, so read those two pages first if `chi.URLParam` or `pgxpool.New` is new to you.

---

## Setup

You need Go 1.27 from [go.dev/dl](https://go.dev/dl/) and a Postgres you can reach. Nothing else: goose runs inside the program on this page, so there is no `goose` binary to install.

```bash
mkdir todos && cd todos
go mod init example.com/todos
go get github.com/go-chi/chi/v5@v5.5.0 github.com/go-chi/cors@v1.2.2 \
  github.com/jackc/pgx/v5@v5.12.0 github.com/pressly/goose/v3@v3.29.0
```

Those are the versions Railway built on 2026-11-07. Your `go.mod` should now read like this (a patch number after `1.27` is fine):

```go
module example.com/todos

go 1.27

require (
	github.com/go-chi/chi/v5 v5.5.0
	github.com/go-chi/cors v1.2.2
	github.com/jackc/pgx/v5 v5.12.0
	github.com/pressly/goose/v3 v3.29.0
)
```

`go get` also writes `go.sum`. Commit both. The example repo leaves `go.sum` out because its Dockerfile runs `go mod tidy`; on your laptop keep it.

**WHY:** goose v3.29 does not compile on Go 1.25. If `go build` fails inside goose, check `go version` before you check your code.

Create the database and give the process its URL. `DATABASE_URL` is the one string every host, including Railway Postgres, injects, so it is the one string the program reads:

```bash
createdb todos
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/todos?sslmode=disable"
```

Change the user and password if your local Postgres differs. On a host, do not add `sslmode=disable`. The host's URL already says how to connect.

Add `.gitignore` so the built binary and any `.env` stay out of the repo:

```text
/todos
.env
```

---

## Creating the API

The project is five files: a migration, `todos.go`, `main.go`, `home.html`, and the `Dockerfile` from the deploy section. Paste each one as a whole file.

### The migration

Create `db/migrations/20261108000000_create_todos.sql`:

```sql
-- +goose Up
CREATE TABLE IF NOT EXISTS todos (
  id      SERIAL PRIMARY KEY,
  subject TEXT NOT NULL,
  details TEXT NOT NULL
);

-- +goose Down
DROP TABLE todos;
```

The number at the front of the file name is the migration's version. goose keeps a `goose_db_version` table in your database with one row per version it has applied. On every boot the program hands goose the folder, goose compares the files to that table, and applies only the files whose version has no row, in order. Boot the same binary twice and the second run applies nothing.

A database that already has rows for older versions is fine. If you point this at the database from the models page, the turtles row stays, the turtles table stays, and goose applies only `20261108000000`. It looks at the files you gave it, not at every version it has ever seen.

`CREATE TABLE IF NOT EXISTS` is belt and braces: goose will not run the file twice, but it costs nothing and makes a hand-run of the SQL safe. The `-- +goose Down` block is what `goose down` would run; the program never calls it.

### todos.go

The model, the queries, and the handlers, in one file:

```go
package main

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Todo struct {
	ID      int    `json:"id"`
	Subject string `json:"subject"`
	Details string `json:"details"`
}

type todoInput struct {
	Subject string `json:"subject"`
	Details string `json:"details"`
}

type Controller struct {
	DB *pgxpool.Pool
}

func ListTodos(ctx context.Context, db *pgxpool.Pool) ([]Todo, error) {
	rows, err := db.Query(ctx, `SELECT id, subject, details FROM todos ORDER BY id`)
	if err != nil {
		return nil, err
	}
	return pgx.CollectRows(rows, pgx.RowToStructByName[Todo])
}

func FindTodo(ctx context.Context, db *pgxpool.Pool, id int) (Todo, error) {
	return oneTodo(ctx, db, `SELECT id, subject, details FROM todos WHERE id = $1`, id)
}

func InsertTodo(ctx context.Context, db *pgxpool.Pool, in todoInput) (Todo, error) {
	return oneTodo(ctx, db,
		`INSERT INTO todos (subject, details) VALUES ($1, $2) RETURNING id, subject, details`,
		in.Subject, in.Details)
}

func UpdateTodo(ctx context.Context, db *pgxpool.Pool, id int, in todoInput) (Todo, error) {
	return oneTodo(ctx, db,
		`UPDATE todos SET subject = $1, details = $2 WHERE id = $3 RETURNING id, subject, details`,
		in.Subject, in.Details, id)
}

// DeleteTodo reports pgx.ErrNoRows when no row had that id.
func DeleteTodo(ctx context.Context, db *pgxpool.Pool, id int) error {
	tag, err := db.Exec(ctx, `DELETE FROM todos WHERE id = $1`, id)
	if err == nil && tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return err
}

// oneTodo runs a query that yields one row, or pgx.ErrNoRows when nothing matched.
func oneTodo(ctx context.Context, db *pgxpool.Pool, sql string, args ...any) (Todo, error) {
	rows, err := db.Query(ctx, sql, args...)
	if err != nil {
		return Todo{}, err
	}
	return pgx.CollectOneRow(rows, pgx.RowToStructByName[Todo])
}

// idParam reads {id} from the URL. A non-numeric id becomes 0, which no row has, so it ends as 404.
func idParam(r *http.Request) int {
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	return id
}

// readInput decodes and trims the body; it answers 400 itself when the body is unusable.
func readInput(w http.ResponseWriter, r *http.Request) (todoInput, bool) {
	var in todoInput
	if err := decode(r, &in); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return in, false
	}
	in.Subject, in.Details = strings.TrimSpace(in.Subject), strings.TrimSpace(in.Details)
	if in.Subject == "" || in.Details == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "subject and details are required"})
		return in, false
	}
	return in, true
}

// reply sends value with the given status, or turns the error into 404 / 500 JSON.
func reply(w http.ResponseWriter, status int, value any, err error) {
	switch {
	case errors.Is(err, pgx.ErrNoRows):
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
	case err != nil:
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "database"})
	case status == http.StatusNoContent:
		w.WriteHeader(status)
	default:
		writeJSON(w, status, value)
	}
}

func (c Controller) Index(w http.ResponseWriter, r *http.Request) {
	todos, err := ListTodos(r.Context(), c.DB)
	reply(w, http.StatusOK, todos, err)
}

func (c Controller) Show(w http.ResponseWriter, r *http.Request) {
	t, err := FindTodo(r.Context(), c.DB, idParam(r))
	reply(w, http.StatusOK, t, err)
}

func (c Controller) Create(w http.ResponseWriter, r *http.Request) {
	in, ok := readInput(w, r)
	if !ok {
		return
	}
	t, err := InsertTodo(r.Context(), c.DB, in)
	reply(w, http.StatusCreated, t, err)
}

func (c Controller) Update(w http.ResponseWriter, r *http.Request) {
	in, ok := readInput(w, r)
	if !ok {
		return
	}
	t, err := UpdateTodo(r.Context(), c.DB, idParam(r), in)
	reply(w, http.StatusOK, t, err)
}

func (c Controller) Delete(w http.ResponseWriter, r *http.Request) {
	err := DeleteTodo(r.Context(), c.DB, idParam(r))
	reply(w, http.StatusNoContent, nil, err)
}
```

Read it top to bottom. `Todo` is the JSON shape with exactly the three keys the contract names. `todoInput` is the body a client may send: no `id`, because the database assigns it. The query functions take a `context.Context` and the pool, the same pattern as the models page, and all of them end in either a `Todo` or `pgx.ErrNoRows`.

`readInput` does the 400s. `decode` (defined in `main.go`) refuses unknown keys, so a body with an `id` or an `isComplete` in it is `{"error":"invalid json"}`, not silently dropped. Then whitespace is trimmed and a blank `subject` or `details` is `{"error":"subject and details are required"}`. Both answers are JSON with an `error` key, which is what the frontends read.

`reply` does the 404s and 500s once instead of in every handler. `pgx.ErrNoRows` is 404. Any other database error is 500 with `{"error":"database"}`, not the driver string, because the driver string contains addresses. A 204 writes the status and nothing else.

`idParam` turns a non-numeric id into 0. No row has id 0, so `GET /todos/abc` falls through to a 404 like any other missing row.

### main.go

```go
package main

import (
	"context"
	"database/sql"
	"embed"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/pressly/goose/v3"
)

//go:embed db/migrations/*.sql
var migrationFS embed.FS

//go:embed home.html
var homePage []byte

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	migrate(databaseURL)

	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer pool.Close()

	todos := Controller{DB: pool}
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
		MaxAge:         300,
	}))
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Write(homePage)
	})
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
	})
	r.Route("/todos", func(r chi.Router) {
		r.Get("/", todos.Index)
		r.Post("/", todos.Create)
		r.Get("/{id}", todos.Show)
		r.Put("/{id}", todos.Update)
		r.Delete("/{id}", todos.Delete)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("listening on :" + port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

// migrate applies every file in db/migrations that the database has not seen yet.
func migrate(databaseURL string) {
	sqlDB, err := sql.Open("pgx", databaseURL)
	if err != nil {
		log.Fatal(err)
	}
	defer sqlDB.Close()
	goose.SetBaseFS(migrationFS)
	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatal(err)
	}
	if err := goose.Up(sqlDB, "db/migrations"); err != nil {
		log.Fatal(err)
	}
}

func decode(r *http.Request, dest any) error {
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	return decoder.Decode(dest)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(value)
}
```

`main` does four things in order: refuse to start without `DATABASE_URL`, migrate, open the pool, serve.

`migrate` is the goose call. goose speaks `database/sql`, not pgx's native API, so it opens a second, short-lived connection through `pgx/v5/stdlib` (the blank import) and closes it before the pool opens. `go:embed` puts the SQL files inside the binary, which is why the container only needs the one executable.

The router mounts `cors.Handler` before any route. The browser sends a preflight `OPTIONS` before a JSON `POST` from another origin. If nothing answers it, the browser reports a CORS error and your handler never runs.

**WHY:** `AllowedOrigins` is `*` here, where the previous version of this page pinned `http://localhost:5173`. Every frontend guide on this site, on any port and any deployed host, has to be able to call your API without you editing Go and redeploying. This API sets no cookies and `AllowCredentials` is off, so `*` is what browsers accept. In a real product, list the frontend's origin instead.

`r.Route("/todos", ...)` answers `/todos` and `/todos/` the same way, so the contract's no-trailing-slash paths just work. `/` serves a small HTML page so a person who opens the URL in a browser sees something, and `/health` is the JSON the deploy step and `check.mjs` both poll.

### home.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Todos API</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #08080A; color: #EAE6E1; font: 16px/1.5 system-ui, sans-serif; }
    main { width: min(40rem, calc(100% - 32px)); }
    h1 { font-size: clamp(40px, 6vw, 64px); letter-spacing: -.03em; margin: 0 0 8px; }
    p { color: #8A8A94; }
    a { color: #2FD48F; }
    code { color: #E8D800; }
  </style>
</head>
<body>
  <main>
    <p>Go · chi</p>
    <h1>Todos</h1>
    <p>JSON lives at <code>/todos</code></p>
    <p><a href="https://github.com/arthurbernierjr/dtc-go-api">GitHub</a></p>
  </main>
</body>
</html>
```

Edit the colours if you like. The only line that matters is the `go:embed home.html` directive in `main.go`, which needs this file to exist at build time.

### Run it

```bash
go run .
```

The log shows goose applying the migration, then `listening on :8080`. `PORT` is read when set, which is what Railway does; locally it falls back to 8080. A `DATABASE_URL is required` exit means the export from Setup is missing from this shell.

---

## Testing the API

With the server running, the contract in six requests:

```bash
curl -i http://localhost:8080/health
curl -i -X POST http://localhost:8080/todos \
  -H 'Content-Type: application/json' -d '{"subject":"Learn chi","details":"Read the routing page"}'
curl -i http://localhost:8080/todos
curl -i -X PUT http://localhost:8080/todos/1 \
  -H 'Content-Type: application/json' -d '{"subject":"Learn chi","details":"Done"}'
curl -i -X DELETE http://localhost:8080/todos/1
curl -i http://localhost:8080/todos/1
```

Expect `200 {"ok":true}`, then `201` with the new object and its id, then `200` with a JSON array, then `200` with the updated object, then `204` with no body, then `404 {"error":"not found"}`. A 404 on show after the delete is the delete working.

The two 400 cases and the preflight:

```bash
curl -i -X POST http://localhost:8080/todos \
  -H 'Content-Type: application/json' -d '{"subject":"  ","details":"x"}'
curl -i -X POST http://localhost:8080/todos \
  -H 'Content-Type: application/json' -d 'not json'
curl -i -X OPTIONS http://localhost:8080/todos \
  -H 'Origin: https://example.test' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: Content-Type'
```

The first two are `400` with `{"error":"subject and details are required"}` and `{"error":"invalid json"}`. The third is a `200` whose headers include `Access-Control-Allow-Origin: *`.

Run the contract check against your own deploy: `node check.mjs https://your-api.up.railway.app` (copy [`check.mjs`](https://github.com/arthurbernierjr/dtc-go-api/blob/main/check.mjs) from the example repo). All 16 lines should say PASS. It needs Node 18 or later and no packages, and it works against `http://localhost:8080` too.

---

## Deploying the API

Use your own Railway account. Do not point this at a shared workspace that is not yours.

### The Dockerfile

Railway builds a `Dockerfile` when it finds one at the root of the repo ([docs](https://docs.railway.com/guides/dockerfiles)):

```dockerfile
FROM golang:1.27 AS build
WORKDIR /src
COPY . .
RUN go mod tidy && CGO_ENABLED=0 go build -o /out/todos .

FROM debian:bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /out/todos /todos
USER nobody
CMD ["/todos"]
```

Two stages. The first is the `golang:1.27` image, which runs `go mod tidy` and builds a static binary. The second is a small Debian with CA certificates and nothing else; the binary is copied in and runs as `nobody`.

**WHY:** The runtime image needs CA certificates because Railway's `DATABASE_URL` speaks TLS, and a distroless static image has no roots to verify it with. `CGO_ENABLED=0` is what lets the binary run on an image without Go installed.

### Railway

- commit everything and push the repo to GitHub

- in [Railway](https://railway.com/), **New Project** → **Deploy from GitHub repo**, pick the `todos` repository

- on the project canvas, **+ New** → **Database** → **Add PostgreSQL** ([docs](https://docs.railway.com/guides/postgresql)); the new service exposes `DATABASE_URL`

- in your app service → **Variables** add one variable:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**WHY:** `${{Postgres.DATABASE_URL}}` is a Railway [reference variable](https://docs.railway.com/guides/variables). It reads the URL off the Postgres service, so you never paste credentials and the app follows the database if Railway rotates them. `PORT` is set by Railway on its own; do not add it.

- in **Settings → Networking** click **Generate Domain**

- click **Deploy** and read the deploy log: goose prints the migration it applied, then the program prints `listening on :` and the port Railway chose

There is no migrate step. The program migrates on every boot, and a boot that finds nothing new to apply is a boot that serves. Every push to the repository redeploys it.

- open the domain in a browser for the HTML page, then `/health`, then run `node check.mjs https://your-api.up.railway.app`

A connection refused on the public URL is the process listening on the wrong port. A crash loop whose log says `DATABASE_URL is required` is the variable not attached to this service. A 500 on `/todos` with a healthy `/health` is `DATABASE_URL` pointing at the wrong database.

CORS `*` is for the lesson. In a real product, narrow `AllowedOrigins` to the frontend's origin before anything that needs a login goes in.

---

## Resources to Learn More

- [chi](https://github.com/go-chi/chi) and [go-chi/cors](https://github.com/go-chi/cors)
- [pgxpool](https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool)
- [goose](https://github.com/pressly/goose), including `go:embed` migrations
- [Railway docs](https://docs.railway.com/): [Dockerfiles](https://docs.railway.com/guides/dockerfiles), [PostgreSQL](https://docs.railway.com/guides/postgresql), [variables](https://docs.railway.com/guides/variables)
- The finished example: [github.com/arthurbernierjr/dtc-go-api](https://github.com/arthurbernierjr/dtc-go-api), live at [api-production-a3ab.up.railway.app](https://api-production-a3ab.up.railway.app)
