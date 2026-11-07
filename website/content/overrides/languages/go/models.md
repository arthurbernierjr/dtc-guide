---
title: "chi and pgx: models and migrations"
framework: chi
version: "5.5.0"
lede: "Create the turtles table with a SQL migration run by goose, talk to Postgres through a pgx pool, and hang list, show, create, update, and delete handlers on the chi router from the last page."
updated_from: "the Buffalo pop/fizz lesson. pop and the buffalo CLI are no longer the track."
verified: 2026-11-05
docs:
  - https://github.com/jackc/pgx
  - https://pkg.go.dev/github.com/jackc/pgx/v5
  - https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool
  - https://github.com/pressly/goose
  - https://pkg.go.dev/github.com/pressly/goose/v3
  - https://github.com/go-chi/chi/blob/master/_examples/rest/main.go
exec: not run
verified_note: "Pool setup, Query/QueryRow/Exec, and goose's SQL migration commands were checked against pgx v5 and goose v3 docs. Nothing was migrated or served."
changes:
  - "pop, fizz, and buffalo pop g model are gone. The migration is SQL. goose applies it. pgx v5 is the Postgres driver Go projects use now."
  - "A missing id returns 404 because QueryRow's ErrNoRows is checked. Create returns 201 with the row Postgres gave back, including the serial id."
  - "Queries use placeholders ($1, $2). Names are never concatenated into SQL."
---

# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- How to create models and migrations
- How to use models to add, update, and delete records

---

## Setup

From the project you started on the routing page:

```bash
go get github.com/jackc/pgx/v5@latest
go install github.com/pressly/goose/v3/cmd/goose@latest
createdb turtles
```

`DATABASE_URL` is the one string every host, including Railway Postgres, injects. Locally:

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/turtles?sslmode=disable"
```

Change the user and password if your local Postgres differs. On a host, do not add `sslmode=disable`. The host's URL already says how to connect.

Open the pool once, in `main`, and close it when the process exits:

```go
pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
if err != nil {
	log.Fatal(err)
}
defer pool.Close()
```

The handlers receive `pool`. They do not call `pgxpool.New` per request.

## Models and Migrations

goose wants numbered SQL files. Create `db/migrations/00001_create_turtles.sql`:

```sql
-- +goose Up
CREATE TABLE turtles (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  age  INTEGER NOT NULL
);

-- +goose Down
DROP TABLE turtles;
```

Apply it:

```bash
goose -dir db/migrations postgres "$DATABASE_URL" up
```

`goose status` shows the version. A second change is `00002_....sql`, never an edit to a migration that has already run on a shared database.

The model is a struct plus functions that take the pool. Create `store.go`:

```go
type Turtle struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func ListTurtles(ctx context.Context, db *pgxpool.Pool) ([]Turtle, error) {
	rows, err := db.Query(ctx, `SELECT id, name, age FROM turtles ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Turtle{}
	for rows.Next() {
		var t Turtle
		if err := rows.Scan(&t.ID, &t.Name, &t.Age); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}
```

`[]Turtle{}` encodes as `[]`, not `null`. An uninitialized nil slice encodes as `null`, and a client that expects an array will break on an empty table.

## Using the Model

Show checks `pgx.ErrNoRows` and turns it into 404. Create uses `RETURNING` so the JSON includes the id Postgres assigned.

```go
func FindTurtle(ctx context.Context, db *pgxpool.Pool, id int) (Turtle, error) {
	var t Turtle
	err := db.QueryRow(ctx, `SELECT id, name, age FROM turtles WHERE id = $1`, id).
		Scan(&t.ID, &t.Name, &t.Age)
	return t, err
}

func InsertTurtle(ctx context.Context, db *pgxpool.Pool, name string, age int) (Turtle, error) {
	var t Turtle
	err := db.QueryRow(ctx,
		`INSERT INTO turtles (name, age) VALUES ($1, $2) RETURNING id, name, age`,
		name, age).Scan(&t.ID, &t.Name, &t.Age)
	return t, err
}
```

The handler:

```go
func (c Controller) Show(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "bad id", http.StatusBadRequest)
		return
	}
	t, err := FindTurtle(r.Context(), c.DB, id)
	if errors.Is(err, pgx.ErrNoRows) {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "database", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, t)
}
```

`writeJSON` sets `Content-Type: application/json` and encodes. Update is `UPDATE turtles SET name = $1, age = $2 WHERE id = $3 RETURNING ...`. Delete is `Exec` with `WHERE id = $1`, and `RowsAffected() == 0` is a 404. Create answers 201.

```bash
curl -i -X POST http://localhost:3000/turtles/ \
  -H 'Content-Type: application/json' -d '{"name":"Filbert","age":5}'
curl -i http://localhost:3000/turtles/1
curl -i http://localhost:3000/turtles/999
```

The first is 201 with an id. The second is that row. The third is 404. If the third is 200 with zeros, `ErrNoRows` was ignored.

The API page starts a fresh todos project with the same tools; this turtles project is the practice run.

## Resources to Learn More

- [pgx](https://github.com/jackc/pgx) and [pgxpool](https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool)
- [goose](https://github.com/pressly/goose)
- Next page: a fresh todos project with the same tools, deployed on Railway with CORS for the frontend guides.
