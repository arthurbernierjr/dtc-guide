---
title: "chi: building and deploying an API"
framework: chi
version: "5.5.0"
lede: "Finish the turtles API: JSON in and out, CORS for a browser on another port, and a deploy to your own Railway project where Postgres arrives as DATABASE_URL."
updated_from: "the Buffalo deploy lesson (Heroku, then a Buffalo Dockerfile). Buffalo's CLI is not the track anymore."
verified: 2026-11-05
docs:
  - https://github.com/go-chi/cors
  - https://pkg.go.dev/github.com/go-chi/cors
  - https://docs.railway.com/
  - https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool
exec: not run
verified_note: "Built and curled on Railway on 2026-11-07: chi v5.5.0, pgx v5.12.0, goose v3.29.0, Go 1.27. Index, create 201, show, update, delete 204, missing 404, empty name 400, and the CORS preflight all passed. goose v3.29 does not compile on Go 1.25. The project was removed after the proof. The repo is github.com/arthurbernierjr/dtc-go-api."
changes:
  - "The Buffalo Dockerfile and the 2023 buffalo CLI base image are gone. The binary is a normal Go build. Railway builds it from the repo."
  - "CORS is github.com/go-chi/cors, mounted once, not headers copied onto each handler."
  - "The listen address reads PORT, which is what Railway sets. Locally it falls back to 3000."
---

# Opinionated Framework Part 3 - Building and Deploying an API

---

## What you will learn

- How to build an API
- How to test your API
- How to deploy your API

---

## Setup

You already have the router, the pool, and the turtle handlers. This page adds the two things a browser on another origin needs, and a place to put the process.

```bash
go get github.com/go-chi/cors@latest
```

Listen on the port the host assigns:

```go
port := os.Getenv("PORT")
if port == "" {
	port = "3000"
}
log.Fatal(http.ListenAndServe(":"+port, r))
```

Binding only `localhost` will run on your laptop and refuse the host's health check. `":"+port` listens on every interface, which is what a container wants.

## Creating the API

Mount CORS before the routes. The browser sends a preflight `OPTIONS` before a JSON `POST` from another origin. If nothing answers it, the browser reports a CORS error and your handler never runs.

```go
import "github.com/go-chi/cors"

r.Use(cors.Handler(cors.Options{
	AllowedOrigins:   []string{"http://localhost:5173"},
	AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
	AllowCredentials: false,
	MaxAge:           300,
}))
```

`http://localhost:5173` is the Vite default the frontend guides use. Add the deployed frontend origin when you have one. `AllowedOrigins: []string{"*"}` together with credentials is rejected by browsers. This API does not use cookies, so credentials stay false, and you can list origins.

The resource, in one place:

```go
r.Route("/turtles", func(r chi.Router) {
	r.Get("/", c.Index)
	r.Post("/", c.Create)
	r.Route("/{id}", func(r chi.Router) {
		r.Get("/", c.Show)
		r.Put("/", c.Update)
		r.Delete("/", c.Delete)
	})
})
```

Index returns a JSON array. Show returns one object or 404. Create returns 201 and the row. Update returns the row or 404. Delete returns 204 and an empty body. A body that is not JSON, or a name that is empty, is 400. A database error is 500 with `{"error":"database"}`, not the driver string. The driver string contains addresses.

## Testing the API

```bash
curl -i http://localhost:3000/turtles/
curl -i -X POST http://localhost:3000/turtles/ \
  -H 'Content-Type: application/json' -d '{"name":"Filbert","age":5}'
curl -i http://localhost:3000/turtles/1
curl -i -X PUT http://localhost:3000/turtles/1 \
  -H 'Content-Type: application/json' -d '{"name":"Filbert","age":6}'
curl -i -X DELETE http://localhost:3000/turtles/1
curl -i -X OPTIONS http://localhost:3000/turtles/ \
  -H 'Origin: http://localhost:5173' \
  -H 'Access-Control-Request-Method: POST'
```

Expect a JSON array, then 201, then the object, then the updated object, then 204, then a 200 or 204 whose headers include `Access-Control-Allow-Origin: http://localhost:5173`. A 404 on show after the delete is the delete working.

## Deploying the API

Use your own Railway account. Do not point this at a shared workspace that is not yours.

```bash
railway login
railway init
railway add --database postgres
railway up
```

`railway add --database postgres` creates a Postgres service and sets `DATABASE_URL` on the app service. The pool already reads that variable. Run the migration against the hosted database once, with the URL Railway shows you, from your laptop:

```bash
railway run -- goose -dir db/migrations postgres "$DATABASE_URL" up
```

`railway run` injects the service's variables into the command. If `DATABASE_URL` is empty inside the container, the variable was not attached to this service. Check the service variables in the dashboard before you change Go code.

A `Dockerfile` is optional. Railway will build a Go module. If you want the build to be explicit:

```dockerfile
FROM golang:1.27 AS build
WORKDIR /src
COPY . .
RUN go mod tidy && CGO_ENABLED=0 go build -o /out/turtles .

FROM debian:bookworm-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /out/turtles /turtles
USER nobody
CMD ["/turtles"]
```

`golang:1.27` is the stable line on [go.dev/dl](https://go.dev/dl/) as of this writing (1.27.3). goose v3.29 refuses to compile on Go 1.25, so do not pin an older tag to match an old note. The runtime image needs CA certificates: Railway's `DATABASE_URL` speaks TLS, and a distroless static image has none. Do not use a Buffalo base image. There isn't a current one.

After `railway up`, curl the public URL the CLI prints, plus `/turtles/`. A connection refused on the public URL is the process listening on the wrong port. A 500 on `/turtles/` with a healthy process is the migration not applied, or `DATABASE_URL` pointing at the wrong place.

## Resources to Learn More

- [go-chi/cors](https://github.com/go-chi/cors)
- [Railway docs](https://docs.railway.com/)
- [pgxpool](https://pkg.go.dev/github.com/jackc/pgx/v5/pgxpool)
