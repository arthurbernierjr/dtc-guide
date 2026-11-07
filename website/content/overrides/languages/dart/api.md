---
title: "shelf: building and deploying an API"
version: "1.4.3"
lede: "Build a complete /todos CRUD API with shelf, shelf_router and postgres 3.x, add CORS and trailing-slash middleware so a browser frontend can call it, test it with curl, then deploy the template's Dockerfile to Railway with a managed Postgres."
updated_from: "the 2021 'Full Stack Build Part 1' lesson (Dart 2.12, postgres 2.x, Heroku buildpack and free Postgres)"
verified: 2026-11-07
docs:
  - https://dart.dev/tools/dart-create
  - https://dart.dev/tools/dart-compile
  - https://dart.dev/tools/dart-build
  - https://pub.dev/documentation/shelf/latest/shelf/createMiddleware.html
  - https://pub.dev/documentation/shelf/latest/shelf/Response/change.html
  - https://pub.dev/packages/shelf_cors_headers
  - https://pub.dev/packages/postgres
  - https://pub.dev/documentation/postgres/latest/postgres/Pool/Pool.withUrl.html
  - https://docs.railway.com/guides/dockerfiles
  - https://docs.railway.com/guides/postgresql
  - https://docs.railway.com/reference/variables
  - https://docs.railway.com/guides/github-autodeploys
exec: not run
verified_note: "Deployed on Railway on 2026-11-07 with shelf, shelf_router and postgres 3. Create returned 201, show 200 with and without a trailing slash, a missing id was 404, put updated the row, a bad body was 400, delete returned 204, and the CORS preflight allowed http://localhost:5173. The project was removed after the proof. The repo is github.com/arthurbernierjr/dtc-dart-api."
changes:
  - "Heroku is gone: the Dart buildpack, `DART_SDK_URL`/`DART_BUILD_CMD` config vars and the free Heroku Postgres (all retired) are replaced by the Dockerfile the server-shelf template generates — `dart:stable` build stage, AOT compile, `FROM scratch` runtime image — deployed to Railway with its PostgreSQL template; any Dockerfile host (Render, Fly.io) works the same way."
  - "postgres 2.x `PostgreSQLConnection(..., useSSL: true)` replaced by postgres 3.5: `Pool.withUrl(DATABASE_URL)` in production (the host's single connection string; SSL is the driver's default) and `Pool.withEndpoints([Endpoint(…)])` with `SslMode.disable` for local development."
  - "CORS is real middleware now (`createMiddleware` answering the OPTIONS preflight and adding the headers to every response) instead of a header map spread into each `Response.ok`; `shelf_cors_headers` is named as the packaged alternative. A trailing-slash middleware makes `/todos/` and `/todos/1/` — what the frontend guides send — reach the same routes."
  - "Model and controller carry over this track's fixes: pooled connection instead of one per request, `toColumnMap()`, `RETURNING *`, 404 for a missing id, `<id|[0-9]+>` route constraint, `readAsString()`; malformed JSON now returns 400 instead of a 500 stack trace."
  - "Table gets `PRIMARY KEY`/`NOT NULL`; the schema lives in a migration file that is run against the hosted database with `psql \"$DATABASE_PUBLIC_URL\" -f …` instead of typed into a Heroku console."
  - "Controller mounted at `/todos` with the whole `bin/server.dart` shown once, including the middleware order (log → CORS → trailing slash → router)."
---

# Full Stack Build Part 1 - Building and Deploying an API

---

## What you will learn

- Creating an API
- Setting CORS headers
- Testing an API
- Deploying an API

---

## Setup

- Generate a new project from the server template: `dart create -t server-shelf darttodosapi`

- `cd darttodosapi` and add the Postgres driver: `dart pub add postgres`

- Run `dart run bin/server.dart` to test the server at [http://localhost:8080](http://localhost:8080), then stop it with Ctrl-C

## Creating the API

#### Setting Up Our Database

- `createdb darttodosapi`

- Create the migration file `db/migrations/001_create_todos.sql`:

```sql
CREATE TABLE IF NOT EXISTS todos (
  id      SERIAL PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  details VARCHAR(100) NOT NULL
);
```

- Run it: `psql darttodosapi -f db/migrations/001_create_todos.sql`

- Seed some data: `psql darttodosapi -c "INSERT INTO todos (subject, details) VALUES ('Breakfast', 'eat breakfast'), ('Lunch', 'eat lunch'), ('Dinner', 'eat dinner');"`

#### Configure Our Database

The hosted database will hand us one `DATABASE_URL`; locally we fall back to the standard `PG*` variables and defaults. Create `lib/db/connection.dart`:

```dart
import 'dart:io' show Platform;

import 'package:postgres/postgres.dart';

Pool _openPool() {
  // Hosted databases give you one URL. Pool.withUrl was marked experimental
  // in the 3.5.7 changelog, so parse the URL into Endpoint, which is stable.
  final raw = Platform.environment['DATABASE_URL'];
  if (raw != null) {
    final uri = Uri.parse(raw);
    return Pool.withEndpoints(
      [
        Endpoint(
          host: uri.host,
          port: uri.port == 0 ? 5432 : uri.port,
          database: uri.pathSegments.isEmpty ? 'postgres' : uri.pathSegments.first,
          username: uri.userInfo.split(':').first,
          password: uri.userInfo.contains(':') ? uri.userInfo.split(':').sublist(1).join(':') : null,
        ),
      ],
      settings: PoolSettings(sslMode: SslMode.require),
    );
  }

  // Local development: the libpq variable names, with defaults. Change the two
  // 'postgres' values if your local user/password differ.
  return Pool.withEndpoints(
    [
      Endpoint(
        host: Platform.environment['PGHOST'] ?? 'localhost',
        port: int.parse(Platform.environment['PGPORT'] ?? '5432'),
        database: Platform.environment['PGDATABASE'] ?? 'darttodosapi',
        username: Platform.environment['PGUSER'] ?? 'postgres',
        password: Platform.environment['PGPASSWORD'] ?? 'postgres',
      ),
    ],
    // a local Postgres has no TLS, so SSL must be switched off explicitly
    settings: const PoolSettings(maxConnectionCount: 5, sslMode: SslMode.disable),
  );
}

/// One shared, lazily created connection pool for the whole app.
final Pool db = _openPool();
```

#### Create a Model

`lib/models/todo.dart` — the same shape as yesterday's `Turtle`, for todos:

```dart
import 'package:postgres/postgres.dart';

class Todo {
  final Session db;

  Todo(this.db);

  List<Map<String, dynamic>> _rows(Result result) =>
      result.map((row) => row.toColumnMap()).toList();

  Future<List<Map<String, dynamic>>> getAll() async {
    final result = await db.execute('SELECT * FROM todos ORDER BY id');
    return _rows(result);
  }

  Future<Map<String, dynamic>?> getOne(int id) async {
    final result = await db.execute(
      Sql.named('SELECT * FROM todos WHERE id = @id'),
      parameters: {'id': id},
    );
    return _rows(result).firstOrNull;
  }

  Future<Map<String, dynamic>> insert({required String subject, required String details}) async {
    final result = await db.execute(
      Sql.named('INSERT INTO todos (subject, details) VALUES (@subject, @details) RETURNING *'),
      parameters: {'subject': subject, 'details': details},
    );
    return _rows(result).first;
  }

  Future<Map<String, dynamic>?> update(int id, {required String subject, required String details}) async {
    final result = await db.execute(
      Sql.named('UPDATE todos SET subject = @subject, details = @details WHERE id = @id RETURNING *'),
      parameters: {'id': id, 'subject': subject, 'details': details},
    );
    return _rows(result).firstOrNull;
  }

  Future<Map<String, dynamic>?> destroy(int id) async {
    final result = await db.execute(
      Sql.named('DELETE FROM todos WHERE id = @id RETURNING *'),
      parameters: {'id': id},
    );
    return _rows(result).firstOrNull;
  }
}
```

#### JSON helpers

`lib/json.dart` — the response helper from the routing lesson, plus a body parser that turns bad JSON into a 400 instead of a crash:

```dart
import 'dart:convert';

import 'package:shelf/shelf.dart';

/// Encode [data] as JSON and set the right Content-Type.
Response jsonResponse(Object? data, {int status = 200}) => Response(
      status,
      body: jsonEncode(data),
      headers: {'Content-Type': 'application/json'},
    );

/// Parse a JSON object body. Throws [FormatException] if it isn't one.
Future<Map<String, dynamic>> jsonBody(Request request) async {
  final decoded = jsonDecode(await request.readAsString());
  if (decoded is Map<String, dynamic>) return decoded;
  throw const FormatException('expected a JSON object');
}
```

#### Setting CORS headers

A browser only lets a page on one origin (say `http://localhost:5173`, your React dev server) read responses from another (`http://localhost:8080`) if the server says so with `Access-Control-*` headers — and for `PUT`/`DELETE`/JSON requests it first sends an `OPTIONS` "preflight" asking permission. Middleware handles both in one place. Create `lib/middleware.dart`:

```dart
import 'package:shelf/shelf.dart';

const _corsHeaders = {
  'Access-Control-Allow-Origin': '*', // development: any origin. Production: your frontend's URL
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
};

/// Answer preflight requests and add the CORS headers to every response.
Middleware cors() => createMiddleware(
      requestHandler: (Request request) {
        if (request.method == 'OPTIONS') return Response.ok('', headers: _corsHeaders);
        return null; // null = keep going to the router
      },
      responseHandler: (Response response) => response.change(headers: _corsHeaders),
    );

/// Let `/todos/` and `/todos/1/` reach the same routes as `/todos` and `/todos/1`.
/// The frontend guides (and Django/Rails habits) send the trailing slash.
Middleware ignoreTrailingSlash() => (Handler inner) => (Request request) {
      final path = request.requestedUri.path;
      if (path.length <= 1 || !path.endsWith('/')) return inner(request);
      final trimmed = request.requestedUri.replace(path: path.substring(0, path.length - 1));
      return inner(Request(request.method, trimmed,
          headers: request.headers, body: request.read(), context: request.context));
    };
```

`createMiddleware` builds middleware from two callbacks: `requestHandler` runs before the router and can short-circuit by returning a `Response` (our answer to `OPTIONS`); `responseHandler` runs after and can rewrite the response (`change` merges headers). `ignoreTrailingSlash` is the long-hand form — a function that takes the inner handler and returns a new one. If you'd rather not own the CORS code, `dart pub add shelf_cors_headers` and use its `corsHeaders()` middleware instead.

#### Create the controller

`lib/controllers/todo_controller.dart`:

```dart
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import '../db/connection.dart';
import '../json.dart';
import '../models/todo.dart';

class TodoController {
  final Todo todos = Todo(db);

  Router get router {
    final router = Router();

    // GET /todos
    router.get('/', (Request request) async {
      return jsonResponse(await todos.getAll());
    });

    // GET /todos/<id>
    router.get('/<id|[0-9]+>', (Request request, String id) async {
      final todo = await todos.getOne(int.parse(id));
      if (todo == null) return jsonResponse({'error': 'todo not found'}, status: 404);
      return jsonResponse(todo);
    });

    // POST /todos  {"subject": "...", "details": "..."}
    router.post('/', (Request request) async {
      final body = await jsonBody(request);
      final created = await todos.insert(
        subject: body['subject'] as String,
        details: body['details'] as String,
      );
      return jsonResponse(created, status: 201);
    });

    // PUT /todos/<id>
    router.put('/<id|[0-9]+>', (Request request, String id) async {
      final body = await jsonBody(request);
      final updated = await todos.update(
        int.parse(id),
        subject: body['subject'] as String,
        details: body['details'] as String,
      );
      if (updated == null) return jsonResponse({'error': 'todo not found'}, status: 404);
      return jsonResponse(updated);
    });

    // DELETE /todos/<id>
    router.delete('/<id|[0-9]+>', (Request request, String id) async {
      final deleted = await todos.destroy(int.parse(id));
      if (deleted == null) return jsonResponse({'error': 'todo not found'}, status: 404);
      return jsonResponse(deleted);
    });

    return router;
  }
}
```

#### Mount it

Replace the generated `bin/server.dart` with this. The order of middleware is the order requests pass through: log everything, answer CORS preflights, normalize the path, then route. The error handler turns a bad body or a wrong-typed field into a 400 instead of shelf's default 500.

```dart
import 'dart:io';

import 'package:darttodosapi/controllers/todo_controller.dart';
import 'package:darttodosapi/json.dart';
import 'package:darttodosapi/middleware.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart';
import 'package:shelf_router/shelf_router.dart';

// Configure routes.
final _router = Router()
  ..get('/', (Request request) => jsonResponse({'status': 'ok', 'todos': '/todos'}))
  ..mount('/todos', TodoController().router.call);

// Bad input from the client is a 400, not a 500.
Middleware badRequestOnFormatError() => createMiddleware(
      errorHandler: (Object error, StackTrace stack) {
        if (error is FormatException || error is TypeError) {
          return jsonResponse({'error': 'invalid request body'}, status: 400);
        }
        Error.throwWithStackTrace(error, stack); // anything else is still a server error
      },
    );

void main(List<String> args) async {
  // Use any available host or container IP (usually `0.0.0.0`).
  final ip = InternetAddress.anyIPv4;

  final handler = Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(cors())
      .addMiddleware(ignoreTrailingSlash())
      .addMiddleware(badRequestOnFormatError())
      .addHandler(_router.call);

  // For running in containers, we respect the PORT environment variable.
  final port = int.parse(Platform.environment['PORT'] ?? '8080');
  final server = await serve(handler, ip, port);
  print('Server listening on port ${server.port}');
}
```

## Testing the API

- Run `dart run bin/server.dart`, then hit every endpoint with curl (or Postman):

```bash
curl http://localhost:8080/todos/
curl http://localhost:8080/todos/1
curl -X POST http://localhost:8080/todos/ -H "Content-Type: application/json" \
  -d '{"subject": "Snack", "details": "eat a snack"}'
curl -X PUT http://localhost:8080/todos/4/ -H "Content-Type: application/json" \
  -d '{"subject": "Snack", "details": "eat two snacks"}'
curl -X DELETE http://localhost:8080/todos/4/
curl -X POST http://localhost:8080/todos/ -H "Content-Type: application/json" -d 'not json'
curl -i -X OPTIONS http://localhost:8080/todos/ -H "Origin: http://localhost:5173"
```

Expect: the seeded list; one todo; a 201 with the new row; the updated row; the deleted row; a 400 `{"error": "invalid request body"}`; and a 200 whose headers include `access-control-allow-origin: *`. Trailing slash or not, both work.

## Deploying the API

Heroku's free tier is long gone, so we deploy with a **Dockerfile**, which every current host understands. `dart create` already wrote one:

`Dockerfile`

```dockerfile
# Use latest stable channel SDK.
FROM dart:stable AS build

# Resolve app dependencies.
WORKDIR /app
COPY pubspec.* ./
RUN dart pub get

# Copy app source code (except anything in .dockerignore) and AOT compile app.
COPY . .
RUN dart build cli --target bin/server.dart -o output

# Build minimal serving image from AOT-compiled `/server`
# and the pre-built AOT-runtime in the `/runtime/` directory of the base image.
FROM scratch
COPY --from=build /runtime/ /
COPY --from=build /app/output/bundle/ /app/

# Start server.
EXPOSE 8080
CMD ["/app/bin/server"]
```

**WHY two stages:** the first stage has the full SDK and compiles `bin/server.dart` to a native executable (`dart build cli` is the Dart 3.10+ wrapper around `dart compile exe` that also bundles native assets). The second stage starts from an empty image and copies in only the executable and the few runtime files it needs, so the image is a few tens of megabytes and has no shell or SDK to attack. Try it locally if you have Docker: `docker build . -t darttodosapi && docker run -p 8080:8080 -e PGHOST=host.docker.internal darttodosapi`. Without Docker, `dart compile exe bin/server.dart -o build/server && ./build/server` proves the AOT build works.

#### Deploy to Railway

- Commit everything and push to a GitHub repo (`.dart_tool/` and `build/` are already in the generated `.gitignore`)

- At [railway.com](https://railway.com): **New Project → Deploy from GitHub repo**, pick the repo. Railway sees the `Dockerfile` at the repo root and builds with it — the build log says `Using detected Dockerfile!`.

- In the project canvas, **+ New → Database → PostgreSQL**. Railway provisions a Postgres service that exposes `DATABASE_URL`, `PGHOST`, `PGUSER` and friends as variables.

- Open your API service → **Variables** and add one reference variable, which copies the database's connection string into our service:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

(`Postgres` is the database service's name on the canvas; the `${{Service.VAR}}` syntax is Railway's reference-variable template.) Deploy the staged change.

- **Settings → Networking → Generate Domain** to get a public `*.up.railway.app` URL. Railway asks which port the service listens on — the Dockerfile's `EXPOSE 8080` is the answer, and our server also honours a `PORT` variable if the host sets one.

- Every push to the connected branch now redeploys automatically.

#### Setting Up The Database

The hosted database is empty. Run the migration against it from your laptop:

- On the Postgres service → **Settings → Networking → Public Access** (adds a TCP proxy and a `DATABASE_PUBLIC_URL` variable; databases are private by default)

- Copy `DATABASE_PUBLIC_URL` from its Variables tab and run:

```bash
psql "paste-the-DATABASE_PUBLIC_URL-here" -f db/migrations/001_create_todos.sql
psql "paste-the-DATABASE_PUBLIC_URL-here" -c "INSERT INTO todos (subject, details) VALUES ('Breakfast', 'eat breakfast'), ('Lunch', 'eat lunch'), ('Dinner', 'eat dinner');"
```

- Test the deployed API: `curl https://<your-app>.up.railway.app/todos/` — your API is live, with the same CORS headers, ready for the frontend lessons.

Render and Fly.io work the same way: Dockerfile detected, managed Postgres attached, `DATABASE_URL` set, `psql` to run the migration.

---

## Resources to Learn More

- [shelf `createMiddleware`](https://pub.dev/documentation/shelf/latest/shelf/createMiddleware.html) and [`Pipeline`](https://pub.dev/documentation/shelf/latest/shelf/Pipeline-class.html) — how middleware composes
- [shelf_cors_headers](https://pub.dev/packages/shelf_cors_headers) — the packaged CORS middleware, with origin checkers
- [postgres: connection string URLs](https://pub.dev/packages/postgres#connection-string-urls) — `Pool.withUrl`, `sslmode` and pool parameters
- [`dart compile`](https://dart.dev/tools/dart-compile) and [`dart build`](https://dart.dev/tools/dart-build) — AOT executables and the CLI bundle the Dockerfile uses
- [Railway: Dockerfiles](https://docs.railway.com/guides/dockerfiles), [PostgreSQL](https://docs.railway.com/guides/postgresql) and [variables](https://docs.railway.com/reference/variables)

---
