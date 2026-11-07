# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- Rust installed using Rustup
- Postgres 12 or higher
- Heroku CLI

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

- create a new rust project `cargo new firstrocket --bin`

- cd into the new folder

- in the folder create a file called `rust-toolchain` and in the file add the text `nightly`

- add the following dependencies in Cargo.toml (Cargo is the npm of Rust, and Cargo.toml the package.json)

```yaml
[dependencies]
rocket = "0.4.7" # The Web Framework
dotenv = "0.15.0" # for using .env files
serde = "1.0.124" # For converting to and from json
serde_json = "1.0.64" # For converting to and from json
serde_derive = "1.0.124" # For converting to and from json
postgres = "0.19.0" # postgres database drivers
openssl = "0.10.33" # ssl connection tools for connecting to heroku postgres
postgres-openssl = "0.5.0" # ssl connection tools for connecting to heroku postgres

[dependencies.rocket_contrib]
version = "0.4.7" # version of rocket_contrib
default-features = false # don't download all default features
features = ["json", "serve"] # only download these features
```

- create a .env file, leave it empty for now, add the .env file to your .gitignore file

- in src/main.rs let's inject the following

```rust
// Enabling all the rocket macros
#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use] extern crate rocket;

// get macro for designating a route handling
#[get("/")]
fn index() -> &'static str {
    return "Hello, world!"
}

// main function
fn main() {
    // igniting the rocket app
    rocket::ignite()
    //mounting routes on an endpoint
    .mount("/", routes![index])
    //launching the server
    .launch();
}
```

- start the server with `cargo run` and check localhost:8000/ to make sure the server is working.

## Creating a Controller

So there are no classes in Rust, so instead we will bundle methods in a module which can be inside another file.

So first we must declare the module in the main project file (src/main.rs):

```rust
// Enabling all the rocket macros
#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use] extern crate rocket;

// Declare our modules
pub mod firstcontroller;

// get macro for designating a route handling
#[get("/")]
fn index() -> &'static str {
    return "Hello, world!"
}
```

- create a src/firstcontroller.rs like so...

```rust
// Enabling all the rocket macros
#![feature(proc_macro_hygiene, decl_macro)]

// route in our module declared as a public method (pub)
#[get("/")]
pub fn index() -> &'static str {
    return "The First Controller!"
}

```

- Let's mount these routes in our main.rs

```rust
    //mounting routes on an endpoint
    .mount("/", routes![index])
    .mount("/first", routes![firstcontroller::index])
```

- run your server `cargo run` and go to localhost:8000/first to see your route at work

- let's add another route to demonstrate how to send data as JSON

```rust
// Enabling all the rocket macros
#![feature(proc_macro_hygiene, decl_macro)]

use rocket_contrib::json::Json; // enables the rocket json struct
use std::collections::HashMap; // enable HashMaps

// get macro for designating a route handling
#[get("/")]
pub fn index() -> &'static str {
    return "The First Controller!"
}

// route that returns Json based on a Hashmap
#[get("/other")]
pub fn other() -> Json<HashMap<String, String>> {
    let mut my_map = HashMap::new(); // create new hashmap and add two properties
    my_map.insert(String::from("you"), String::from("can"));
    my_map.insert(String::from("do"), String::from("it"));
    return Json(my_map);
}
```

- add the route in main.rs

```rust
.mount("/first", routes![firstcontroller::index, firstcontroller::other])
```

- run the server and go to localhost:8000/first/other

## Using URL Params & Url Queries

We can declare url params in our route macros and then receive it as an argument to your route handler, url queries also must be declared as well.

```rust
// route that returns Json based on a Hashmap
#[get("/another/<param>?<query>")]
pub fn queryparam(param: String, query: String) -> Json<HashMap<String, String>> {
    let mut my_map = HashMap::new(); // create new hashmap and add two properties
    my_map.insert(String::from("Param"), param);
    my_map.insert(String::from("Query"), query);
    return Json(my_map);
}
```

- update your routes

```rust
    .mount("/first", routes![firstcontroller::index, firstcontroller::other, firstcontroller::queryparam])

```

- restart your server and go to: http://localhost:8000/first/another/thisistheparam?query=thisisthequery

## Accessing the Request Body

To access the request body we need to give the body a name by declaring the data property in our route macro. Then we need to declare the type of our body whose type must implement the FromData trait. To avoid needing to implement FromData on custom structs we can wrap any serializable type with the Rocket built in Json struct.

```rust
// route that returns Json based on a Hashmap
#[post("/body", data="<body>")]
pub fn getthatbody(body:Json<HashMap<String, String>>) -> Json<HashMap<String, String>> {
    // extracting the body
    let bodydata = body.into_inner();
    //print the body
    print!("{:?}", bodydata );
    // return the body as a response
    return Json(bodydata);
}
```

- mount the route

```rust
// main function
fn main() {
    // igniting the rocket app
    rocket::ignite()
    //mounting routes on an endpoint
    .mount("/", routes![index])
    .mount("/first", routes![
    firstcontroller::index,
    firstcontroller::other,
    firstcontroller::queryparam,
    firstcontroller::getthatbody
    ])
    //launching the server
    .launch();
}
```

- open up postman, restart your server, send a post request with JSON (string values only) to localhost:8000/first/body

---

## Resources to Learn More

- [Rocket Documentation](https://rocket.rs/v0.4/guide/getting-started/)

---
