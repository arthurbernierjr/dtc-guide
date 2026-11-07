# Full Stack Build Part 1 - Building and Deploying an API
-------

## What you will learn
- Creating an API
- Setting Cors Headers
- Testing an API
- Deploying an API

-------

## Setup

- generate a new project `npx degit AlexMercedCoder/DartShelfPostgresTemplate#main darttodosapi`

- cd into the new folder and run `pub get`

- run `dart web/server.dart` to test the server

## Creating the API

#### Setting Up Our Database

- `createdb darttodosapi`

- enter the psql console `psql darttodosapi`

- create our todos table `CREATE TABLE todos (id SERIAl, subject VARCHAR(100), details VARCHAR(100));`

- create some sample data `INSERT INTO todos (subject, details) VALUES ('Breakfast', 'eat breakfast'), ('Lunch', 'eat lunch'), ('dinner', 'eat dinner');`

#### Configure Our Database

- setup up the defaults in connection.dart with your local postgres details in the defaults

```dart
import 'package:postgres/postgres.dart';
import 'dart:io' show Platform;

class DB {

  PostgreSQLConnection conn;

  DB(){
    Map<String, String> envVars = Platform.environment;
    var host = envVars["DB_HOST"] == null ? "localhost" : envVars["DB_HOST"];
    var port = envVars["DB_PORT"] == null ? 5432 : int.parse(envVars["DB_PORT"]);
    var database = envVars["DB_DATABASE"] == null ? "darttodosapi" : envVars["DB_DATABASE"];
    var username = envVars["DB_USERNAME"] == null ? "test5" : envVars["DB_USERNAME"];
    var password = envVars["DB_PASSWORD"] == null ? "test5" : envVars["DB_PASSWORD"];
    this.conn = PostgreSQLConnection(host, port, database, username: username, password: password);
  }
}
```

#### Create a Model

- In the models folder create a copy of the Sample and refactor it for our todos.

/models/todo.dart

```dart
// import "../db/connection.dart";
import 'package:postgres/postgres.dart';

class Todo {

  PostgreSQLConnection conn;
  String table;

  // our constructor sets the connection and table name
  Todo(conn){
    this.conn = conn;
    this.table = "todos";
  }

  // This method inserts one new record into our table
  insert({String subject, String details}) async {
    // We execure a query and pass in arguments where needed
    List<List<dynamic>> results = await this.conn.query("INSERT INTO ${this.table} (subject,details) VALUES (@subject, @details)", substitutionValues: {
      // replaces the @name in the query
      "subject": subject,
      // replaces the @age in the query
      "details": details
    });
    // return the current list of todos
    return await this.getAll();
  }

    // This method returns all todos
    getAll() async {
    // execute a query
    List<List<dynamic>> results = await this.conn.query("SELECT * FROM ${this.table};");

    // empty array to hold objects
    List<Map <String, dynamic>> list = [];

    // loop over each row and turn the data into an array of objects
    for (final row in results){
      list.add({
        "id": row[0],
        "subject": row[1],
        "details": row[2]
      });

    };
    // return the populated list
    return list;
  }

    // get one todo
    getOne(int id) async {
    List<List<dynamic>> results = await this.conn.query("SELECT * FROM ${this.table} WHERE id=@id", substitutionValues: {
      "id": id
    });

    // build search results into an object

    List<Map <String, dynamic>> list = [];

    for (final row in results){
      list.add({
        "id": row[0],
        "subject": row[1],
        "details": row[2]
      });}

    //return object representing results
    return list[0];
  }

    // this method takes info and updates a particular todo
    update(int id, {String subject, String details}) async {
    List<List<dynamic>> results = await this.conn.query("UPDATE ${this.table} SET subject=@subject, details=@details WHERE id=@id", substitutionValues: {
      "id": id,
      "subject": subject,
      "details": details
    });
    // return updated list of todos
    return await this.getAll();
  }

    // this method will delete a particular todo
    destroy(int id) async {
    List<List<dynamic>> results = await this.conn.query("DELETE FROM ${this.table} WHERE id=@id", substitutionValues: {
      "id": id
    });
    // return updated list of todos
    return await this.getAll();
  }
}
```

- initiate the model in initiatemodels.dart

```dart
import "./samplemodel.dart";
import "./todo.dart";
import "../db/connection.dart";

Future<SampleModel> model () async {
var db = DB();
await db.conn.open();
return SampleModel(db.conn);
}

Future<Todo> todo () async {
var db = DB();
await db.conn.open();
return Todo(db.conn);
}
```

- create a new controller in the controllers folder called TodoController.dart

```dart
// import 'dart:async' show Future;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf/shelf.dart';
import '../cors.dart';
import '../models/initiateModels.dart';
import 'dart:convert';
// import 'packdetails:shelf/shelf_io.dart' as shelf_io;

class TodoController {

  Router get router {
    final router = Router();

    // get request to "/todos/"
    router.get('/', (Request req)async {
      // get database
      var todoDB = await todo();
      // query db
      var results = await todoDB.getAll();
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    //get request to /todos/<id>
    router.get('/<id>', (Request req, String id)async {
      // get database
      var todoDB = await todo();
      // query db
      var results = await todoDB.getOne(int.parse(id));
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    // post request to "/todos/"
    router.post('/', (Request req)async {
      // get the body of the request as a string
      var stringBody = await req.read().transform(Utf8Decoder()).join();
      // turn the string into a map
      var body = await jsonDecode(stringBody.toString());
      // get database
      var todoDB = await todo();
      // query db
      var results = await todoDB.insert(subject: body["subject"], details: body["details"]);
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    //put request to /todos/<id>
    router.put('/<id>', (Request req, String id)async {
      // get the body of the request as a string
      var stringBody = await req.read().transform(Utf8Decoder()).join();
      // turn the string into a map
      var body = await jsonDecode(stringBody.toString());
      // get database
      var todoDB = await todo();
      // query db
      var results = await todoDB.update(int.parse(id), subject: body["subject"], details: body["details"]);
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    //delete request to /todos/<id>
    router.delete('/<id>', (Request req, String id)async {
      // get database
      var todoDB = await todo();
      // query db
      var results = await todoDB.destroy(int.parse(id));
      // encode and send results with proper headers
      return Response.ok(await jsonEncode(results), headers: {...cors, "Content-Type": "application/json"});
    });

    // catch all for "/todos"
    router.all('/<ignored|.*>', (Request request) => Response.notFound('null'));

    return router;
  }
}
```

- Mount the controller in HomeController.dart

```dart
import 'dart:async' show Future;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as shelf_io;
import './TestController.dart';
import './TodoController.dart';
import '../cors.dart';

class HomeController {

  // Define our getter for our handler
  Handler get handler {
    final router = Router();

    // main route
    router.get('/', (Request request) {
      return Response.ok('Hello World', headers: cors);
    });

    // Mount Other Controllers Here
    router.mount('/test/', TestController().router);

    // Mount Other Controllers Here
    router.mount('/todos/', TodoController().router);

    // You can catch all verbs and use a URL-parameter with a regular expression
    // that matches everything to catch app.
    router.all('/<ignored|.*>', (Request request) {
      return Response.notFound('Page not found');
    });

    return router;
  }
}
```

## Testing the API

- Run server and test out all the API endpoints

## Deploying the API

- commit your code

- create a new heroku project `heroku create darttodoapi-am` use your initials at the end

-  Set the SDK config var `heroku config:set DART_SDK_URL=https://storage.googleapis.com/dart-archive/channels/stable/release/2.12.1/sdk/dartsdk-linux-x64-release.zip`

- Set the dart buildpack `heroku config:add BUILDPACK_URL=https://github.com/igrigorik/heroku-buildpack-dart.git`

- Override the default build command `heroku config:set DART_BUILD_CMD="./dart-sdk/bin/dart compile exe web/server.dart"`

- `git push heroku master`

- API Deployed... but not 100%, we still need to configure the database!

#### Setting Up The Database

- head to the heroku dashboard for your project

- go to the resources tab

- provision a free heroku postgres database

- go the database dashboard, under settings you'll find the database credentials

- use those credentials to add the following heroku config vars

```
DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD
```

- you'll see a command like this that will let us access the psql shell for the database so we can create our table. `heroku pg:psql postgresql-objective-XXXX --app projectname`

- create our todos table `CREATE TABLE todos (id SERIAl, subject VARCHAR(100), details VARCHAR(100));`

- create some sample data `INSERT INTO todos (subject, details) VALUES ('Breakfast', 'eat breakfast'), ('Lunch', 'eat lunch'), ('dinner', 'eat dinner');`

- in connection.dart add useSSL in the list of arguments `this.conn = PostgreSQLConnection(host, port, database, username: username, password: password, useSSL: true);` and push your code again your api will be deployed!



-------
## Resources to Learn More

-------



