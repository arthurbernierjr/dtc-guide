---
title: "shelf: setup and routing"
version: "1.4.3"
lede: "Scaffold a Dart server with `dart create -t server-shelf`, add a controller class that exposes a shelf_router Router, mount it, and read path params, query strings and JSON bodies — shelf 1.4.3, shelf_router 1.1.5, Dart 3.13."
updated_from: "the 2021 'Opinionated Framework Part 1' lesson (Dart 2.12, a third-party degit template, Aqueduct/Angel era)"
verified: 2026-11-02
docs:
  - https://dart.dev/get-dart
  - https://dart.dev/tools/dart-create
  - https://dart.dev/server
  - https://pub.dev/packages/shelf
  - https://pub.dev/packages/shelf_router
  - https://pub.dev/documentation/shelf_router/latest/shelf_router/Router-class.html
  - https://pub.dev/documentation/shelf/latest/shelf/Request-class.html
  - https://pub.dev/documentation/shelf/latest/shelf/Response-class.html
  - https://api.dart.dev/dart-convert/jsonDecode.html
exec: not run
verified_note: "Every command, generated file name and API call was checked against the Dart 3.13.7 `server-shelf` template source, the shelf 1.4.3 and shelf_router 1.1.5 API references and the dart.dev tool pages listed; there is no Dart SDK on the build machine, so nothing on this page was executed."
changes:
  - "The project is scaffolded with the official `dart create -t server-shelf` template (bin/server.dart, pubspec.yaml, Dockerfile, test/) instead of a third-party `npx degit` template; the server listens on 8080 (or `$PORT`) rather than 7777, and controllers live in `lib/controllers/` as `snake_case.dart` files so `package:` imports and the file_names lint work."
  - "Framework choice stated plainly: Aqueduct and Angel are abandoned, so the track uses shelf + shelf_router (the minimalist option, now also what the Dart team's own template and samples use). The framework table is corrected (Flask not 'Flash', ASP.NET Core, Dart Frog/Serverpod for Dart, Vapor for Swift)."
  - "shelf_router 1.1.x: `mount('/first', …)` no longer needs the trailing slash, unmatched routes fall through to the parent router's 404, and `request.params` replaces the old `params()` helper — so the per-controller catch-all route and the home-made CORS header map are gone."
  - "Request bodies are read with `request.readAsString()` instead of `req.read().transform(Utf8Decoder()).join()`, and the stray `await` on the synchronous `jsonDecode` is removed; a shared `jsonResponse()` helper sets `Content-Type: application/json` once instead of on every route."
  - "Route order is called out (`/first` must be registered before `/<second>`), path params can be constrained with a regex (`<id|[0-9]+>`), and `queryParameters['query']` is handled as the `String?` it is."
  - "Heroku CLI dropped from the prerequisites (deployment is a Dockerfile host in step 5); every code block is null-safe Dart 3."
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

- Dart SDK 3.13 (shelf_router 1.1.5 needs 3.9 or newer; `dart --version` to check). The Flutter SDK includes it — no separate install needed.
- Postgres 16 or higher (not used until the models lesson)
- Postman or `curl` for making requests
- Docker Desktop, optional, for the deploy lesson

## What is an opinionated framework?

Most web frameworks for building full-stack websites or APIs/microservices fall into one of two categories.

- **Minimalist:** Like Express, these frameworks provide the basic features to create a web server, leaving it up to you to decide which libraries to use for databases, encryption, authentication, etc., and how to structure your files and folders.

- **Opinionated:** These frameworks usually come with CLI tools that spin up new projects with a pre-defined structure, conventions and all the libraries for full functionality already built in.

The main web frameworks across many languages:

| Language   | Minimalist           | Opinionated          |
| ---------- | -------------------- | -------------------- |
| JavaScript | Express, Koa, Hono   | NestJS, AdonisJS     |
| Python     | Flask, FastAPI       | Django               |
| Ruby       | Sinatra              | Ruby on Rails        |
| PHP        | Slim                 | Laravel, Symfony     |
| Go         | chi, net/http, Echo  | —                    |
| Rust       | Axum, Actix Web      | Loco                 |
| Java       | Javalin              | Spring Boot          |
| C#         | ASP.NET Core minimal APIs | ASP.NET Core MVC |
| Dart       | shelf, Dart Frog     | Serverpod            |
| Kotlin     | Ktor, Javalin        | Spring Boot          |
| Swift      | Hummingbird          | Vapor                |

In 2021 Dart's opinionated frameworks (Aqueduct, Angel) were waiting on null-safety updates that never came — both are abandoned today. So this track uses **shelf**, the minimalist library the Dart team maintains, plus **shelf_router**, which gives it Express-style routes. It is also what `dart create` scaffolds and what the official server samples use, so you're learning the mainstream path. (Serverpod is the full-stack, opinionated option if you want an ORM and code generation later.)

## Setting Up the Project

The Dart SDK ships a server template:

```bash
dart create -t server-shelf firstproject
cd firstproject
dart run bin/server.dart
```

- `dart create` makes the folder and runs `dart pub get` for you (pub is Dart's npm; `pubspec.yaml` is its `package.json`).
- You should see `Server listening on port 8080`. Open [http://localhost:8080](http://localhost:8080) for "Hello, World!" and [http://localhost:8080/echo/hi](http://localhost:8080/echo/hi) to see a URL param echoed back.
- Stop it with Ctrl-C. There is no hot reload for servers: after every change, stop and `dart run bin/server.dart` again.

What the template generated:

- `bin/server.dart` — the entry point: a `Router`, a logging `Pipeline`, and `serve()` on `0.0.0.0` using `$PORT` or 8080
- `pubspec.yaml` — depends on `shelf` and `shelf_router`
- `Dockerfile` and `.dockerignore` — a two-stage build we'll use to deploy
- `test/server_test.dart` — starts the server and hits it with `package:http`

`bin/server.dart`

```dart
import 'dart:io';

import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart';
import 'package:shelf_router/shelf_router.dart';

// Configure routes.
final _router = Router()
  ..get('/', _rootHandler)
  ..get('/echo/<message>', _echoHandler);

Response _rootHandler(Request req) {
  return Response.ok('Hello, World!\n');
}

Response _echoHandler(Request request) {
  final message = request.params['message'];
  return Response.ok('$message\n');
}

void main(List<String> args) async {
  // Use any available host or container IP (usually `0.0.0.0`).
  final ip = InternetAddress.anyIPv4;

  // Configure a pipeline that logs requests.
  final handler = Pipeline().addMiddleware(logRequests()).addHandler(_router.call);

  // For running in containers, we respect the PORT environment variable.
  final port = int.parse(Platform.environment['PORT'] ?? '8080');
  final server = await serve(handler, ip, port);
  print('Server listening on port ${server.port}');
}
```

**WHY:** shelf's whole model is one function type — a `Handler` takes a `Request` and returns a `Response`. `Router` is a handler that picks another handler by method and path; `Pipeline` wraps handlers in middleware (logging here, CORS later). `..` is Dart's cascade: call several methods on the same object.

## Creating a Controller

We'll organize routes the way the opinionated frameworks do: one controller class per resource, each exposing a `Router` that gets mounted in `bin/server.dart`.

#### Step 1 - Make a New Controller

Code that other files import lives in `lib/`. Create `lib/controllers/first_controller.dart` (Dart file names are `snake_case`):

```dart
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

class FirstController {
  // Exposing a Router as a getter lets this controller be mounted in another router.
  Router get router {
    final router = Router();

    // GET /first  (and /first/)
    router.get('/', (Request request) {
      return Response.ok('The First Controller');
    });

    return router;
  }
}
```

#### Step 2 - Mount it

Import it in `bin/server.dart` with a `package:` URL (the package name is the folder name from `dart create`) and add it to the cascade:

```dart
import 'package:firstproject/controllers/first_controller.dart';

// Configure routes.
final _router = Router()
  ..get('/', _rootHandler)
  ..get('/echo/<message>', _echoHandler)
  // everything FirstController defines now lives under /first
  ..mount('/first', FirstController().router.call);
```

- Restart the server and check [http://localhost:8080/first](http://localhost:8080/first).

`mount` strips the prefix before handing the request to the inner router, so inside the controller `/` means `/first`. If nothing in the mounted router matches, matching continues in the parent and ends at shelf_router's built-in 404 (`Route not found`) — no catch-all route needed.

## Writing Routes

JSON responses need `jsonEncode` from `dart:convert` and a `Content-Type` header. Since every route will do the same thing, write it once. Create `lib/json.dart`:

```dart
import 'dart:convert';

import 'package:shelf/shelf.dart';

/// Encode [data] as JSON and set the right Content-Type.
Response jsonResponse(Object? data, {int status = 200}) => Response(
      status,
      body: jsonEncode(data),
      headers: {'Content-Type': 'application/json'},
    );
```

Import it in the controller (`import '../json.dart';` — relative imports are fine inside `lib/`) and add a route:

```dart
    // GET /first/first — send back a Map as JSON
    router.get('/first', (Request request) {
      final data = {'Hello': 'World', 'More': 'data'};
      return jsonResponse(data);
    });
```

- Restart and test [http://localhost:8080/first/first](http://localhost:8080/first/first)

## Using URL Params

Angle brackets capture a path segment. The matched value arrives as an extra `String` argument to the handler, in the order the params appear in the route.

```dart
    // GET /first/<second> — the matched segment arrives as a String argument
    router.get('/<second>', (Request request, String second) {
      return jsonResponse({'param': second});
    });
```

- Restart and go to `/first/IMadeAParam` in your browser

Two things to know:

- **Order matters.** Routes are tried in the order you registered them and the first match wins. `/first` must be added *before* `/<second>`, or `/<second>` would swallow it.
- **Constrain with a regex.** `<id|[0-9]+>` only matches digits, so a non-numeric id gets a 404 at the router instead of blowing up in `int.parse`. Params are also available as `request.params['second']` if you'd rather not add handler arguments.

## Accessing URL Queries

Query-string values (`?query=myquery`) are in `request.url.queryParameters`, a `Map<String, String>`. Looking up a key that may be missing gives a `String?`, so give it a default. Replace the `/<second>` route from the last step with this version:

```dart
    // GET /first/<second>?query=... — adds the query to the response
    router.get('/<second>', (Request request, String second) {
      final query = request.url.queryParameters['query'] ?? 'no query';
      return jsonResponse({'param': second, 'query': query});
    });
```

- Restart and go to `http://localhost:8080/first/thisisaparam?query=thisisaquery`, then the same URL without `?query=`

## Accessing the Request Body

The body is a byte stream; `readAsString()` collects it, `jsonDecode` parses it. `jsonDecode` returns `dynamic`, so say what shape you expect with `as`:

```dart
    // POST /first/third/body — echo the JSON body back
    router.post('/third/body', (Request request) async {
      final bodyText = await request.readAsString();
      final body = jsonDecode(bodyText) as Map<String, dynamic>;
      return jsonResponse(body);
    });
```

`async` on the handler is what lets you `await` inside it; shelf accepts a `Response` or a `Future<Response>` equally. Add `import 'dart:convert';` at the top of the controller for `jsonDecode`.

- Restart and POST to it with the header `Content-Type: application/json`:

```bash
curl -X POST http://localhost:8080/first/third/body \
  -H "Content-Type: application/json" \
  -d '{"hello": "body", "count": 2}'
```

The same JSON comes back. (A body that isn't valid JSON throws a `FormatException`; shelf turns uncaught errors into a 500 and logs them — tomorrow we'll return a 400 instead.)

Now let's head to lab!

---

## Resources to Learn More

- [shelf](https://pub.dev/packages/shelf) — `Handler`, `Pipeline`, `Request`, `Response`, `logRequests`
- [shelf_router](https://pub.dev/packages/shelf_router) and the [`Router` class](https://pub.dev/documentation/shelf_router/latest/shelf_router/Router-class.html) — route patterns, params, regex constraints, `mount`
- [Command-line and server apps](https://dart.dev/server) — the Dart team's server page and samples
- [`dart create`](https://dart.dev/tools/dart-create) — the templates, including `server-shelf`

---
