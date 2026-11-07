# Opinionated Framework - Models & Migrations
-------

## What you will learn

- How to set the database settings
- how create models and migrations
- how to use models to add, update, and delete records

-------

## Setup

- Use the same project from this mornings lesson

## Setting Up the Database Settings

In the db folder there is a file called connection.dart. This define our DB class that allows us to connect to the database. If mainly is comprised of 2 things.

- A conn property which represents a Postgres Connection

- A constructor which establishes the connection and saves it in the property.

So let's set this up to work with our local postgres, it should already have the main default postgres settings as the default you'll only have to change the database, username and password from "test5" to what matches your local postgres settings.

- create a new local database with the command `createdb dartpets` and make sure to set that as the default for database in our constructor.

connection.dart

```dart
import 'package:postgres/postgres.dart';
import 'dart:io' show Platform;

class DB {

  PostgreSQLConnection conn;

  DB(){
    Map<String, String> envVars = Platform.environment;
    var host = envVars["DB_HOST"] == null ? "localhost" : envVars["DB_HOST"];
    var port = envVars["DB_PORT"] == null ? 5432 : int.parse(envVars["DB_PORT"]);
    var database = envVars["DB_DATABASE"] == null ? "dartpets" : envVars["DB_DATABASE"];
    var username = envVars["DB_USERNAME"] == null ? "test5" : envVars["DB_USERNAME"];
    var password = envVars["DB_PASSWORD"] == null ? "test5" : envVars["DB_PASSWORD"];
    this.conn = PostgreSQLConnection(host, port, database, username: username, password: password);
  }
}
```

## Models and Migrations

Since we are using the raw Postgres drivers, we will do a lot of the heavy lifting an Object Relationship Mapper would do for ourselves.

#### Making the turtles table

- Setting up our own tables

- creating our own model class with methods that execute the right queries

First step is let's add a turtles table to our database.

- `psql dartpets` to open psql to our database

- `CREATE TABLE turtles (id SERIAL, name VARCHAR(30), age INTEGER);` to create our table

- Seed a test record `INSERT INTO turtles (name, age) VALUES ('Filbert', 5);`

#### Making the turtles model

- make a copy of SampleModel file and call the copy turtle.dart.

- Refactor it for your turtles table

```dart
// import "../db/connection.dart";
import 'package:postgres/postgres.dart';

class Turtle {

  PostgreSQLConnection conn;
  String table;

  // our constructor sets the connection and table name
  Turtle(conn){
    this.conn = conn;
    this.table = "turtles";
  }

  // This method inserts one new record into our table
  insert({String name, int age}) async {
    // We execure a query and pass in arguments where needed
    List<List<dynamic>> results = await this.conn.query("INSERT INTO ${this.table} (name, age) VALUES (@name, @age)", substitutionValues: {
      // replaces the @name in the query
      "name": name,
      // replaces the @age in the query
      "age": age
    });
    // return the current list of turtles
    return await this.getAll();
  }

    // This method returns all turtles
    getAll() async {
    // execute a query
    List<List<dynamic>> results = await this.conn.query("SELECT * FROM ${this.table};");

    // empty array to hold objects
    List<Map <String, dynamic>> list = [];

    // loop over each row and turn the data into an array of objects
    for (final row in results){
      list.add({
        "id": row[0],
        "name": row[1],
        "age": row[2]
      });

    };
    // return the populated list
    return list;
  }

    // get one turtle
    getOne(int id) async {
    List<List<dynamic>> results = await this.conn.query("SELECT * FROM ${this.table} WHERE id=@id", substitutionValues: {
      "id": id
    });

    // build search results into an object

    List<Map <String, dynamic>> list = [];

    for (final row in results){
      list.add({
        "id": row[0],
        "name": row[1],
        "age": row[2]
      });}

    //return object representing results
    return list[0];
  }

    // this method takes info and updates a particular turtle
    update(int id, {String name, int age}) async {
    List<List<dynamic>> results = await this.conn.query("UPDATE ${this.table} SET name=@name, age=@age WHERE id=@id", substitutionValues: {
      "id": id,
      "name": name,
      "age": age
    });
    // return updated list of turtles
    return await this.getAll();
  }

    // this method will delete a particular turtle
    destroy(int id) async {
    List<List<dynamic>> results = await this.conn.query("DELETE FROM ${this.table} WHERE id=@id", substitutionValues: {
      "id": id
    });
    // return updated list of turtles
    return await this.getAll();
  }
}
```



## Using the Model

#### Initiating the Model

open the file initiateModels.dart, here we write a function which allows us to call upon our models as needed. Copy the sample "model" method and refactor.

```dart
import "./samplemodel.dart";
import "./turtle.dart";
import "../db/connection.dart";

Future<SampleModel> model () async {
var db = DB();
await db.conn.open();
return SampleModel(db.conn);
}

Future<Turtle> turtle () async {
var db = DB();
await db.conn.open();
return Turtle(db.conn);
}
```

#### Creating the TurtleController

So to try out our new model let's make another Controller, in the controller folder make another copy of TestController called TurtleController.dart.

- mount it in HomeController.dart

```dart
import './TurtleController.dart';

///////////////////////////////////
///////////////////////////////////

    // Mount TurtleController Here (trailing slash required)
    router.mount('/turtles/', TurtleController().router);
```

- then let's refactor TurtleController.dart, test out each route as you go!

```dart
// import 'dart:async' show Future;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf/shelf.dart';
import '../cors.dart';
import '../models/initiateModels.dart';
import 'dart:convert';
// import 'package:shelf/shelf_io.dart' as shelf_io;

class TurtleController {

  // By exposing a [Router] for an object, it can be mounted in other routers.
  Router get router {
    final router = Router();

    // get request to "/turtles/"
    router.get('/', (Request req)async {
      // get database
      var turtleDB = await turtle();
      // query db
      var results = await turtleDB.getAll();
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    //get request to /turtles/<id>
    router.get('/<id>', (Request req, String id)async {
      // get database
      var turtleDB = await turtle();
      // query db
      var results = await turtleDB.getOne(int.parse(id));
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    // post request to "/turtles/"
    router.post('/', (Request req)async {
      // get the body of the request as a string
      var stringBody = await req.read().transform(Utf8Decoder()).join();
      // turn the string into a map
      var body = await jsonDecode(stringBody.toString());
      // get database
      var turtleDB = await turtle();
      // query db
      var results = await turtleDB.insert(name: body["name"], age: body["age"]);
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    //put request to /turtles/<id>
    router.put('/<id>', (Request req, String id)async {
      // get the body of the request as a string
      var stringBody = await req.read().transform(Utf8Decoder()).join();
      // turn the string into a map
      var body = await jsonDecode(stringBody.toString());
      // get database
      var turtleDB = await turtle();
      // query db
      var results = await turtleDB.update(int.parse(id), name: body["name"], age: body["age"]);
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    //delete request to /turtles/<id>
    router.delete('/<id>', (Request req, String id)async {
      // get database
      var turtleDB = await turtle();
      // query db
      var results = await turtleDB.destroy(int.parse(id));
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });



    // catch all for "/turtles"
    router.all('/<ignored|.*>', (Request request) => Response.notFound('go ninja go'));

    return router;
  }
}
```

- all your routes should be working now off to lab/homework!


-------
## Resources to Learn More

-------



