---
title: "chi: setup and routing"
framework: chi
version: "5.5.0"
lede: "Build a Go REST API with chi 5.5 on the standard net/http server: a router, handlers, path params, query strings, and a JSON body."
updated_from: "the 2021 Buffalo lesson, and the 2026 Buffalo 1.1.4 rewrite. The buffalo CLI's last release is v0.18.14 from February 2023, so this track no longer teaches it."
verified: 2026-11-05
docs:
  - https://go.dev/doc/install
  - https://go.dev/doc/modules/managing-dependencies
  - https://github.com/go-chi/chi
  - https://github.com/go-chi/chi/blob/master/_examples/rest/main.go
  - https://pkg.go.dev/github.com/go-chi/chi/v5
  - https://pkg.go.dev/github.com/go-chi/chi/v5/middleware
exec: not run
verified_note: "Handlers, router setup, URLParam, and JSON decoding were checked against chi v5.5.0 (released 14 October 2026) and its REST example. Nothing was compiled or served: there is no Go toolchain on the build machine, and this pass does not deploy."
changes:
  - "Buffalo is gone. The CLI that scaffolds it has not shipped since February 2023. chi v5.5.0 is a maintained net/http router with no third-party dependencies, which is the current way to write a Go REST API."
  - "There is no buffalo new. The project is go mod init, go get github.com/go-chi/chi/v5, and a main package you can read."
  - "Handlers are http.HandlerFunc. Path params are chi.URLParam. The body is json.NewDecoder(r.Body).Decode. Content-Type is set by the handler, not forced by a generated template."
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

- [Go installed](https://go.dev/doc/install) from the current stable on go.dev. As of this writing that is 1.27.3. goose v3.29, used on the models page, does not compile on Go 1.25. chi 5.5 builds on the current stable.
- Postgres is not required on this page. The next page opens the database.
- A terminal. Commands below are what you type, without a prompt character.

## What is an opinionated framework?

Most web frameworks fall into two piles.

- **Minimalist:** a router and a way to read the request. You choose the database library and the folder layout. Express, and chi, live here.
- **Opinionated:** a CLI that generates the folders, the ORM, and the middleware. Rails and Django live here. Buffalo tried to be that for Go. Its command-line tool, `buffalo`, was last released as v0.18.14 in February 2023. Teaching a generator that old means teaching files you then have to repair. This track uses chi instead, and writes the files in the open.

The main web frameworks across languages, as of November 2026:

| Language   | Minimalist                         | Opinionated        |
| ---------- | ---------------------------------- | ------------------ |
| JavaScript | Express 5, Hono                    | NestJS             |
| Python     | FastAPI                            | Django 6.1         |
| Ruby       | Sinatra                            | Rails 8.1          |
| PHP        | Slim                               | Laravel 13         |
| Go         | net/http, chi, Echo                | (none worth teaching; Buffalo's CLI is frozen) |
| Rust       | Axum, Actix Web                    | Loco               |
| Java       | Javalin                            | Spring Boot 4.1    |
| C#         | ASP.NET Core minimal APIs          | ASP.NET Core MVC   |
| Dart       | shelf                              | Serverpod          |

chi is the minimalist column, on purpose. It is small, it is `net/http`, and v5.5.0 shipped in October 2026.

## Setting Up the Project

```bash
mkdir turtles && cd turtles
go mod init example.com/turtles
go get github.com/go-chi/chi/v5@v5.5.0
```

`go mod init` writes `go.mod`. `go get` adds chi at the version you named and writes `go.sum`. Commit both. Do not commit a binary.

`main.go`:

```go
package main

import (
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("the hall is open"))
	})

	log.Fatal(http.ListenAndServe(":3000", r))
}
```

`go run .` then, in another terminal, `curl -i http://localhost:3000/`. You should see `200` and `the hall is open`. Ctrl-C stops the process. chi does not have its own server. `http.ListenAndServe` is the standard library, and the router is the handler.

`middleware.Recoverer` turns a panic in a handler into a 500 instead of killing the process. `middleware.Logger` writes one line per request. Both come from `github.com/go-chi/chi/v5/middleware`, which is the same module.

## Creating a Controller

A controller here is a type with methods that match `http.HandlerFunc`. Create `turtle.go`:

```go
package main

import (
	"fmt"
	"net/http"
)

type TurtleController struct{}

func (TurtleController) Index(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "all the turtles")
}

func (TurtleController) Show(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "one turtle")
}
```

Mount it from `main`:

```go
turtles := TurtleController{}
r.Route("/turtles", func(r chi.Router) {
	r.Get("/", turtles.Index)
	r.Get("/{id}", turtles.Show)
})
```

`r.Route` scopes the paths. `GET /turtles/` hits Index. `GET /turtles/4` hits Show. The method is the verb. The path is the noun. That is the whole router.

## Using URL Params and URL Queries

chi's REST example reads a path param with `chi.URLParam`. The query string is the standard library.

```go
import "github.com/go-chi/chi/v5"

func (TurtleController) Show(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	color := r.URL.Query().Get("color")
	fmt.Fprintf(w, "turtle %s, color query %q\n", id, color)
}
```

`curl http://localhost:3000/turtles/4?color=green` prints `turtle 4, color query "green"`. A missing query is an empty string, not an error. A missing path segment does not match the route, so chi answers 404 before your function runs.

`{id}` is the pattern chi documents. Do not write `:id`. That is Express, and chi will treat it as a literal.

## Accessing the Request Body

Decode JSON with the standard library. Refuse a bad body with 400. Do not trust the map you decoded until you have checked the fields you require.

```go
import "encoding/json"

type turtleInput struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
}

func (TurtleController) Create(w http.ResponseWriter, r *http.Request) {
	var in turtleInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		http.Error(w, "invalid json", http.StatusBadRequest)
		return
	}
	if in.Name == "" {
		http.Error(w, "name is required", http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(in)
}
```

Register it: `r.Post("/", turtles.Create)` inside the `/turtles` route. Then:

```bash
curl -i -X POST http://localhost:3000/turtles/ \
  -H 'Content-Type: application/json' \
  -d '{"name":"Filbert","age":5}'
```

Expect `201` and the JSON object. Send `not json` and expect `400`. The tag `json:"name"` is what maps the key. A tag written `json: name` with a space does not compile as a tag and will not decode. The field stays empty, and your "name is required" check is the symptom.

## Resources to Learn More

- [chi](https://github.com/go-chi/chi) and the [REST example](https://github.com/go-chi/chi/blob/master/_examples/rest/main.go), which this page follows
- [pkg.go.dev chi/v5](https://pkg.go.dev/github.com/go-chi/chi/v5)
- [Go modules](https://go.dev/doc/modules/managing-dependencies)
- Next page: the same router, with Postgres through pgx
