# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- [GO installed](https://golang.org/doc/install)
- [Buffalo Installed](https://gobuffalo.io/en/docs/getting-started/installation/)
- Postgres Installed

## What is an opinionated framework?

Most web frameworks for building full-stack websites or APIs/Microservices fall into one of two categories.

- **Minimalist:** Like express, these frameworks provide you the basic features to create a web server leaving it up to you to decide which libraries to use for connecting to databases, encryption, authentication, etc. and how to structure your files and folders in your workflow.

- **Opinionated:** These frameworks usually come with CLI tools that allow you to spin-up new projects with pre-defined projects structures, conventions and all the libraries for full functionality already built in.

These are the main web frameworks across many languages:

| Language   | Minimalist     | Opinionated       |
| ---------- | -------------- | ----------------- |
| Javascript | Express, Koa   | Nest, Foal, Sails |
| Python     | Flash, FastAPI | Django, Masonite  |
| Ruby       | Sinatra        | Ruby on Rails     |
| PHP        | Slim           | Laravel           |
| GO         | Echo           | Buffalo, Revel    |
| Rust       | Warp           | Rocket            |
| Java       |                | Spring Boot       |
| C#         |                | .Net              |
| Dart       |                | Aqueduct, Angel   |
| Kotlin     | kTor, Javalin  | Spring Boot       |
| Swift      |                | Vapor, Kitura     |

## Setting Up the Project

- run the command to generate a new project `buffalo new firstproject --api`
- cd into the folder and run the following commands

`buffalo dev` to run the dev server, if you get an error follow the steps below.

#### Trouble Shooting buffalo dev
```
go get github.com/gobuffalo/envy@v1.9.0
go get github.com/gobuffalo/pop/v5@v5.3.0
go get github.com/gobuffalo/packr/v2@v2.8.0
go get github.com/rs/cors
go get github.com/gobuffalo/buffalo-pop/v2/pop/popmw@v2.3.0
go get github.com/gobuffalo/validate/v3@v3.1.0
go get github.com/gofrs/uuid@v3.2.0+incompatible
go get github.com/gobuffalo/validate/v3@v3.1.0
go get
go mod tidy
```
**If you get an error regarding "sqlite3SelectNew" run the following command `export CGO_CFLAGS="-g -O2 -Wno-return-local-addr"` and then run the command that caused the error again.**

- add the following in the import statements in actions/app.go

```
"github.com/gobuffalo/packr/v2"
```

- run `buffalo dev` again and it should be working (likely you'll see a database related error)

#### Configuring the Database

It'll expect a database connection on the onset, so you'll notice and error when you visit the site.

Add your local postgres details in database.yml. When done your file should look like this, just make sure to use the user and password for your local postgres server.

```
---yaml
development:
  dialect: postgres
  database: firstproject_development
  user: test5
  password: test5
  host: 127.0.0.1
  pool: 5

test:
  url: {{envOr "TEST_DATABASE_URL" "postgres://test5:test5@127.0.0.1:5432/firstproject_test?sslmode=disable"}}

production:
  url: {{envOr "DATABASE_URL" "postgres://test5:test5@127.0.0.1:5432/firstproject_production?sslmode=disable"}}
```

Afterwards create the development database with the command

```
buffalo pop create -e development
```

- now try to run `buffalo dev` again and the project should be working!
## Creating a Controller

Controllers are usually classes with methods that handle our request but since go doesn't have classes are controllers are just files with out functions. Remember for items to be exported from a Go file they must be uppercase!

Create a file called first.go and add the following...

```go
package actions

import (
	"net/http"
	"github.com/gobuffalo/buffalo"
)

//Convention is to suffix your functions with the word handler
func FirstHandler(c buffalo.Context) error {
	// We must return a response
	return c.Render(http.StatusOK, r.JSON(map[string]string{"Hello": "World"}))
}
```

In the App function in App.go is where we wire up all our routes. Let's add a route and use our FirstHandler for the function.

*In go if a function or variable has an uppercased name in one file, it is "exported". It is visible to files in the same package (folder) and to files that import the package it is in. App.go is also part of the actions package so we can just use FirstHandler*

```go
func App() *buffalo.App {
	if app == nil {
		app = buffalo.New(buffalo.Options{
			Env:          ENV,
			SessionStore: sessions.Null{},
			PreWares: []buffalo.PreWare{
				cors.Default().Handler,
			},
			SessionName: "_firstproject_session",
		})

		// Automatically redirect to SSL
		app.Use(forceSSL())

		// Log request parameters (filters apply).
		app.Use(paramlogger.ParameterLogger)

		// Set the request content type to JSON
		app.Use(contenttype.Set("application/json"))

		// Wraps each request in a transaction.
		//  c.Value("tx").(*pop.Connection)
		// Remove to disable this.
		app.Use(popmw.Transaction(models.DB))

        // The Route Route
		app.GET("/", HomeHandler)
        // get route for "/first" that runs FirstHandler
		app.GET("/first", FirstHandler)
	}

	return app
}
```

- Now restart your server and go to localhost:3000/first and see our new route!

## Using URL Params and URL Queries

Let's add another handler function to our first.go file

**You can see all existing routes at anytime with the command `buffalo routes`**

```go
//Convention is to suffix your functions with the word handler
func SecondHandler(c buffalo.Context) error {
	// grabbing the url param
	URLParam := c.Param("URLParam")
	// grabbing the url query
	query := c.Param("query")
	// We must return a response
	return c.Render(http.StatusOK, r.JSON(map[string]string{"URLparam": URLParam, "Query": query}))
}
```

Url Params and Url queries are all stored in the Param property of Context (c). Let's now create a route this function can handle in app.go .

```go
// The Route Route
app.GET("/", HomeHandler)
// get route for "/first" that runs FirstHandler
app.GET("/first", FirstHandler)
// get route for "/second" that runs Second Handler
app.GET("/second/{URLParam}", SecondHandler)
```

Now start up your server and head to `http://localhost:3000/second/thisisaparam?query=thisisaquery` and you should see we successfully accessed the param and the query.

## Accessing the Request Body

Now let's try to access the request body, let's add this to first.go.

```go
//Convention is to suffix your functions with the word handler
func ThirdHandler(c buffalo.Context) error {
	// define a struct to bind our body too
	type Person struct {
		Name string `json:"name"`
		Age int `json: age`
	}
	// declare a variable to receive the body
	person := &Person{}
	//handle possible error when binding
	if err := c.Bind(person); err != nil {
		return err
	  }
	// We must return a response
	return c.Render(http.StatusOK, r.JSON(person))
}
```

So to bind the body you need to define a struct that has the exact properties you plan on receiving from the body. We declare a variable that holds reference to a new instance of the struct and the bind functions binds those properties to the struct. Let's test this out by wiring the above function to a route.

```go
        // The Route Route
		app.GET("/", HomeHandler)
        // get route for "/first" that runs FirstHandler
		app.GET("/first", FirstHandler)
		// get route for "/second" that runs Second Handler
		app.GET("/second/{URLParam}", SecondHandler)
		// post route for "/third" that returns the request body
		app.POST("/third", ThirdHandler)
```

Now try to make some post request to /third with the properties in the struct, and even try to add extra properties and you'll see only the stuff in your sturct is available in there.

---

## Resources to Learn More
- [Buffalo DB CLI Commands](https://gobuffalo.io/en/docs/db/toolbox/)
- [Buffalo Routing Docs](https://gobuffalo.io/en/docs/routing/)

---
