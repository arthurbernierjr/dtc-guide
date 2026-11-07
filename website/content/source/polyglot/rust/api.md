# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- how create models and migrations
- how to use models to add, update, and delete records

---

## Setup

- Use the same project as you did for the morning lesson

- create a database using postgres `createdb rocketpets`

- in your .env file add a variable called DATABASE_STRING like so...

_make sure to use your local postgres settings_

```
DATABASE_STRING="user=test5 password=test5 dbname=rocketpets sslmode=disable host=localhost port=5432"
```

- We already added the postgres drivers in our Cargo.toml earlier so we will dive right in!

## Create a New Set of Routes

- declare a new module in main.rs

```rust
pub mod turtlecontroller;
```

- create a turtleroutes.rs and in it we will create a struct to define our turtle data and use the serde macros to make it serializable into JSON.

```rust
use rocket_contrib::json::Json; // Json struct from rocket library
use serde::{Serialize, Deserialize}; // Macro to create serializable structs
use postgres::{Client, NoTls, Error}; // Postgres library for db connection
use dotenv::dotenv; // ability get variables from .env file
use std::env; // standard library for accessing env variables

// CREATE STRUCT THAT IS SERIALIZABLE INTO JSON
#[derive(Serialize, Deserialize, Debug)]
pub struct Turtle {
    id: i32,
    name: String,
    age: i32
}

//Struct for json data for new turtles that does include id
#[derive(Serialize, Deserialize, Debug)]
pub struct InsertTurtle {
    name: String,
    age: i32
}
```

## Connecting to the Database

Next we need a function that'll retrieve our database connection for each route.

```rust
// CREATE FUNCTION TO ESABLISH DATABASE CONNECTION
fn getConn() -> Result<Client, Error> {
    // GET DATABASE URL ENV VARIABLE
    let uri;
    let connector = get_connector();
    // populate env variables from .env file
    dotenv().ok();
    // grab desired environmental variable using pattern matching
    match env::var("DATABASE_STRING") {
        Ok(val) => uri = val,
        Err(_e) => uri = "none".to_string(),
    }
    // return database connection
    return Client::connect(&uri, connector);
}
```

## Setting Up Our Database

- let's enter our database shell `psql rocketpets`

- create a table `CREATE TABLE turtles(id SERIAL, name VARCHAR(30), age INTEGER);`

- seed some data `INSERT INTO turtles (name, age) VALUES ('Dilbert', 5), ('Filbert', 6);`

## Index Route

Add the following to main.rs

```rust
// making serde macros available
#[macro_use] extern crate serde;
#[macro_use] extern crate serde_derive;
#[macro_use] extern crate serde_json;
```

and mount the the turtlescontroller

```rust
    //mounting routes on an endpoint
    .mount("/", routes![index])
    .mount("/first", routes![
    firstcontroller::index,
    firstcontroller::other,
    firstcontroller::queryparam,
    firstcontroller::getthatbody
    ])
    .mount("/turtles", routes![
    turtlecontroller::index
    ])
```

- now add the route to turtlecontroller.rs

```rust
// INDEX ROUTE TO GET ALL turtles
#[get("/")]
pub fn index() -> Json<Vec<Turtle>> {
    //declare vector to hold turtles
    let mut result: Vec<Turtle> = Vec::new();

    //query database and build vector
    match getConn(){
        // if database connection successful
        Ok(val) => {
            // save client
            let mut client = val;
            // for each row generate a new turtle and push into Vector
            for row in client.query("SELECT * FROM turtles;", &[]).unwrap() {
                let id:i32 = row.get(0);
                let name: String= row.get(1);
                let age: i32 = row.get(2);
                result.push(Turtle { id, name, age});

            }
        },
        // if database connection fails, print error
        Err(err) => print!("ERROR: {}", err),
    }

    // turn hashmap into json and return it
    return Json(result);
}
```

## Create Route

- add route in main.rs

```rust
// CREATE ROUTE TO CREATE A NEW PERSON
#[post("/", data="<body>")]
pub fn create(body:Json<InsertTurtle>) -> String {
    //unwrap turtle from json body
    let turtle = body.into_inner();
    //insert new turtle into database
    match getConn(){
        Ok(val) => {
            let mut client = val;
            let mut name = turtle.name;
            let mut age = turtle.age;
            client.execute("INSERT INTO turtles (name, age) VALUES ($1, $2)",
            &[&name, &age]).ok();
        },
        Err(err) => print!("{}", err),
    }

    // return string denoting completion
    return String::from("Request Complete");
}
```

- add handler in turtlecontroller.rs

```rs
    .mount("/turtles", routes![
    turtlecontroller::index,
    turtlecontroller::create,
    ])
```

## Update Route

- add route in main.rs

```rust
// UPDATE ROUTE TO UPDATE A turtle
#[put("/<id>", data="<body>")]
pub fn update(id: i32, body:Json<InsertTurtle>) -> String {
    //unwrap turtle from json body
    let turtle = body.into_inner();
    //insert new turtle into database
    match getConn(){
        Ok(val) => {
            let mut client = val;
            let mut name = turtle.name;
            let mut age = turtle.age;
            client.execute("UPDATE turtles SET name=$1, age=$2 WHERE id=$3;",
            &[&name, &age, &id]).ok();
        },
        Err(err) => print!("{}", err),
    }

    // return string denoting completion
    return String::from("Request Complete");
}
```

- add handler in turtlecontroller.rs

```rs
    .mount("/turtles", routes![
    turtlecontroller::index,
    turtlecontroller::create,
    turtlecontroller::update,
    ])
```

## Delete Route

- add route in main.rs

```rust
// DELETE ROUTE TO DELETE turtles
#[delete("/<id>",)]
pub fn destroy(id: i32) -> String {

    //insert new turtle into database
    match getConn(){
        Ok(val) => {
            let mut client = val;
            client.execute("DELETE FROM turtles WHERE id=$1",
            &[&id]).ok();
        },
        Err(err) => print!("{}", err),
    }

    // return string denoting completion
    return String::from("Request Complete");
}
```

- add handler in turtlecontroller.rs

```rs
    .mount("/turtles", routes![
    turtlecontroller::index,
    turtlecontroller::create,
    turtlecontroller::update,
    turtlecontroller::destroy,
    ])
```

## Handling Cors in Rocket

add the following to your Cargo.toml

```rust
rocket_cors = "0.5.2"
```

then add this to your main.rs

```rust
//import the crate
extern crate rocket_cors;

//create a cors struct and attach it as a fairing
fn main() {

    // Create CORS STRUCT
    let corsOptions = rocket_cors::CorsOptions::default();
    print!("{:?}", corsOptions);
    let mut CORS = corsOptions.to_cors().expect("this didn't work");

    // igniting the rocket app
    rocket::ignite()
    .attach(CORS)
```

This default to very open settings, if you want to customize it further read the [documentation for rocket_cors.](https://lawliet89.github.io/rocket_cors/rocket_cors/index.html)

---

## Resources to Learn More

---
