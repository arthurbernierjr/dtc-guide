# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- Dart SDK 2.12 or higher (if you install flutter it comes with the Dart SDK)
- Heroku CLI
- Postgres 12 or higher

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
| Dart       | Shelf          | Aqueduct, Angel   |
| Kotlin     | kTor, Javalin  | Spring Boot       |
| Swift      |                | Vapor, Kitura     |

## Setting Up the Project

At the time of writing this, the Aqueduct and Angel frameworks needed to update their frameworks for recent changes in the Dart language. So we will be using Shelf, the minimalist framework for Dart which is most similar to KoaJS. We are using the shelf_router library as well which makes the feel more express like. We will be using a template that spins up a lot of the basic structure for us.

- create a new project with the command `npx degit AlexMercedCoder/DartShelfPostgresTemplate#main firstproject`

- cd into the folder and run `pub get` to download all neccessary libraries (pub is like npm for Dart)

- `dart run web/server.dart` to run and test the webserver and check to see if you see hellow world at localhost:7777

## Creating a Controller

In this template the server is initiated in web/server.dart. In this file the HomeController is mounted as the servers handler. Our HomeController will be the heart of our routing logic. What we will do is create a new controller and mount it.

#### Step 1 - Make a New Controller

In the controllers folder create a file called FirstController.dart and add the following below.

```dart
// import 'dart:async' show Future;
import 'package:shelf_router/shelf_router.dart';
import 'package:shelf/shelf.dart';
import '../cors.dart';
import '../models/initiateModels.dart';
import 'dart:convert';
// import 'package:shelf/shelf_io.dart' as shelf_io;

class FirstController {

  // By exposing a [Router] for an object, it can be mounted in other routers.
  // We are defining a custom getter that returns the router
  Router get router {
    final router = Router(); // CREATE A NEW ROUTER

    // get request to "/first"
    router.get('/', (Request req){
      return Response.ok("The First Controller", headers: cors);
    });

    // catch all for "/first"
    router.all('/<ignored|.*>', (Request request) => Response.notFound('No FirstController Route Available'));

    return router;
  }
}
```

Now let's mount our controller to HomeController below the test controller

```dart
// Make sure to import the controller
import './FirstController.dart';

/////////////////////////////////////////////
////////////////////////////////////////////

    // Mount Other Controllers Here
    router.mount('/test/', TestController().router);

    // Mount FirstController Here (trailing slash required)
    router.mount('/first/', FirstController().router);

```

- Lets turn on the server ` dart run web/server.dart` and checkout `localhost:7777/first/`

## Writing Routes

Now that we've created our controller, let's add some more routes to our controller.

```dart
    // get request to "/first/first" sends back a json response
    router.get('/first', (Request req){
      // create a new Map
      var response = {"Hello": "World", "More": "data"};
      // Encode the MAP as JSON and send response
      return Response.ok(jsonEncode(response), headers: cors);
    });
```

- run server and test our localhost:7777/first/first
## Using URL Params

Let's create another route that uses a URL Parameter

```dart

    // get request to "/first/<second>" sends back a json response with the param
    router.get('/<second>', (Request req, String second){
      // create a new Map
      var response = {"Param": second};
      // Encode the MAP as JSON and send response
      return Response.ok(jsonEncode(response), headers: cors);
    });

```

- restart the server and go to /first/IMadeAParam in your browser

## Accessing URL Queries

Let's modify that last route to add a query into the Map.

```dart
    // get request to "/first/<second>" sends back a json response with the param
    router.get('/<second>', (Request req, String second){
      // pull the "query" query from the url
      var query = req.url.queryParameters["query"];
      // create a new Map
      var response = {"Param": second, "query": query};
      // Encode the MAP as JSON and send response
      return Response.ok(jsonEncode(response), headers: cors);
    });
```

restart server and go to `http://localhost:7777/first/thisisaparam?query=thisisaquery`

## Accessing the Request Body

Let's create one more post route to receive the request body!

```dart
      // post request to "/first/third/body" sends back a json response with the body
    router.post('/third/body', (Request req) async {
      // get the body of the request as a string
      var stringBody = await req.read().transform(Utf8Decoder()).join();
      // turn the string into a map
      var stringBody2 = await jsonDecode(stringBody.toString());
      // convert the map into json
      var body = jsonEncode(stringBody2);
      // Encode the MAP as JSON and send response
      return Response.ok(body, headers: {...cors, "Content-Type": "application/json"});
    });
```

Now let's head to lab!
---

## Resources to Learn More
[Google Shelf Documentation](https://pub.dev/packages/shelf)
[Shelf Router Documentation](https://pub.dev/packages/shelf_router)
---
