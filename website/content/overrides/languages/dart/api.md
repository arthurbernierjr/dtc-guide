---
title: "shelf: building and deploying an API"
framework: shelf
version: "1.4.3"
lede: "Build the /todos CRUD API with shelf, shelf_router and postgres 3.x, add CORS middleware so a browser frontend on any origin can call it, test it with curl and the shared contract check, then deploy the template's Dockerfile to Railway with a managed Postgres."
updated_from: "the 2021 'Full Stack Build Part 1' lesson (Dart 2.12, postgres 2.x, Heroku buildpack and free Postgres)"
verified: 2026-11-07
docs:
  - https://dart.dev/tools/dart-create
  - https://dart.dev/tools/dart-compile
  - https://dart.dev/tools/dart-build
  - https://pub.dev/packages/shelf_router
  - https://pub.dev/documentation/shelf_router/latest/shelf_router/Router/Router.html
  - https://pub.dev/documentation/shelf/latest/shelf/createMiddleware.html
  - https://pub.dev/documentation/shelf/latest/shelf/Response/change.html
  - https://pub.dev/packages/shelf_cors_headers
  - https://pub.dev/packages/postgres
  - https://pub.dev/documentation/postgres/latest/postgres/Pool/Pool.withUrl.html
  - https://docs.railway.com/guides/dockerfiles
  - https://docs.railway.com/guides/postgresql
  - https://docs.railway.com/reference/variables
  - https://docs.railway.com/guides/github-autodeploys
exec: ran
verified_note: "Deployed to Railway on 2026-11-07 from commit 6337263d0b28e3c593e1e9044103f922ffda9b8c of github.com/arthurbernierjr/dtc-dart-api, live at https://api-production-5f5ac.up.railway.app; `node check.mjs https://api-production-5f5ac.up.railway.app` printed 16/16 PASS (health, CORS preflights, list shape, three 400 cases, create 201, show, 404s, update, delete 204). Every whole-file block on this page is the file in that repo. No Dart toolchain ran on the build machine."
changes:
  - "Aligned with the shared Todos contract: the routes are `/health` and `/todos` with no trailing slash (the slash-trimming middleware stays as a courtesy, the frontends no longer need it), every query selects exactly `id, subject, details`, a blank or missing field is a 400 with a one-key error body (`subject and details are required`), a missing id or unknown path is a 404 (`not found`) from the router's `notFoundHandler`, DELETE answers 204 with no body instead of echoing the row, the preflight answers 204 allowing only `Content-Type`, and the table is created on boot instead of by a migration file run with psql."
  - "Heroku is gone: the Dart buildpack, `DART_SDK_URL`/`DART_BUILD_CMD` config vars and the free Heroku Postgres (all retired) are replaced by the Dockerfile the server-shelf template generates — `dart:stable` build stage, AOT compile, `FROM scratch` runtime image — deployed to Railway with its PostgreSQL template; any Dockerfile host (Render, Fly.io) works the same way."
  - "postgres 2.x `PostgreSQLConnection(..., useSSL: true)` replaced by postgres 3.x: `Pool.withEndpoints([Endpoint(…)])` built from the host's `DATABASE_URL` with `SslMode.require` in production, and from the `PG*` variables with `SslMode.disable` for local development."
  - "CORS is real middleware now (`createMiddleware` answering the OPTIONS preflight with 204 and adding the headers to every response) instead of a header map spread into each `Response.ok`; `shelf_cors_headers` is named as the packaged alternative. A trailing-slash middleware is kept so `/todos/` still reaches `/todos`, though nothing on this site sends the slash any more."
  - "Model and controller carry over this track's fixes: pooled connection instead of one per request, `toColumnMap()`, `RETURNING id, subject, details`, 404 for a missing id, `<id|[0-9]+>` route constraint, `readAsString()`; malformed JSON now returns 400 instead of a 500 stack trace."
  - "Table gets `PRIMARY KEY`/`NOT NULL` and is created by `CREATE TABLE IF NOT EXISTS` in `main()` on every boot, so a fresh Railway Postgres needs no console step at all."
  - "Controller mounted at `/todos` with the whole `bin/server.dart` shown once, including the HTML landing page, `/health`, the JSON 404 handler and the middleware order (log → CORS → trailing slash → 400-on-bad-body → router)."
---

# Full Stack Build Part 1 - Building and Deploying an API

---

## What you will learn

- Creating an API
- Setting CORS headers
- Testing an API
- Deploying an API

### The Todos contract

| Request | Response |
|---|---|
| `GET /health` | 200 `{"ok":true}` |
| `GET /todos` | 200 `[{id,subject,details}]` ordered by id |
| `GET /todos/:id` | 200 the object, or 404 `{"error":"not found"}` |
| `POST /todos` with `{subject,details}` | 201 the new object |
| `PUT /todos/:id` with `{subject,details}` | 200 the updated object, or 404 |
| `DELETE /todos/:id` | 204 with no body, or 404 |
| blank or missing `subject` or `details` | 400 `{"error":"…"}` |

Every backend guide on this site builds this same API: no trailing slashes, objects that contain exactly `id`, `subject` and `details`, and CORS open to any origin, so the four frontend guides can point at any of them. The finished Dart version is [github.com/arthurbernierjr/dtc-dart-api](https://github.com/arthurbernierjr/dtc-dart-api), live at [https://api-production-5f5ac.up.railway.app](https://api-production-5f5ac.up.railway.app).

---

## Setup

- Generate a new project from the server template: `dart create -t server-shelf darttodosapi`

- `cd darttodosapi` and add the Postgres driver: `dart pub add postgres` (`shelf` and `shelf_router` are already in the template)

- Run `dart run bin/server.dart` to test the server at [http://localhost:8080](http://localhost:8080), then stop it with Ctrl-C

The example repo trims the generated `pubspec.yaml` down to what the API uses:

```yaml
name: darttodosapi
description: Deeper Than Code shelf todos API
environment:
  sdk: ^3.6.0
dependencies:
  shelf: ^1.4.2
  shelf_router: ^1.1.4
  postgres: ^3.5.6
```

**Versions:** Railway built the example with Dart SDK 3.13.7, which resolved shelf 1.4.3, shelf_router 1.1.5 and postgres 3.6.0. The repo does not commit a `pubspec.lock`, so `dart pub get` picks the newest versions that satisfy those carets each time it runs; if a later release breaks something, commit the lock file to pin what you tested.

## Creating the API

#### Setting Up Our Database

- `createdb darttodosapi`

- That is the only manual step. The `todos` table is created by the server itself the moment it boots (you will see the `CREATE TABLE IF NOT EXISTS` in `bin/server.dart` below), which is what lets a fresh Railway Postgres work with no console session. The schema is:

```sql
CREATE TABLE IF NOT EXISTS todos (
  id serial PRIMARY KEY,
  subject text NOT NULL,
  details text NOT NULL
)
```

- If you want rows to look at before the frontend exists, seed a few after the first boot: `psql darttodosapi -c "INSERT INTO todos (subject, details) VALUES ('Breakfast', 'eat breakfast'), ('Lunch', 'eat lunch'), ('Dinner', 'eat dinner');"`

#### Configure Our Database

The hosted database hands us one `DATABASE_URL`; locally we fall back to the standard `PG*` variables and defaults. Create `lib/db/connection.dart`:

```dart
import 'dart:io';

import 'package:postgres/postgres.dart';

Pool _openPool() {
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
    settings: const PoolSettings(maxConnectionCount: 5, sslMode: SslMode.disable),
  );
}

final Pool db = _openPool();
```

**WHY parse the URL by hand:** `Pool.withUrl` exists, but the 3.5.7 changelog marked it experimental, so the URL is split into an `Endpoint`, which is the stable API. The hosted branch forces `SslMode.require` because Railway's Postgres speaks TLS; the local branch switches SSL off explicitly because a laptop Postgres has none. Change the two `'postgres'` defaults if your local user and password differ. `db` is a single lazily created pool shared by the whole app, not a connection per request.

#### Create a Model

`lib/models/todo.dart` — the same shape as yesterday's `Turtle`, for todos. Every query names its columns (`id, subject, details`) instead of `SELECT *`, so the JSON the frontend receives has exactly the three keys in the contract even if you add a column later:

```dart
import 'package:postgres/postgres.dart';

class Todo {
  final Session db;
  Todo(this.db);

  List<Map<String, dynamic>> _rows(Result result) =>
      result.map((row) => row.toColumnMap()).toList();

  Future<List<Map<String, dynamic>>> getAll() async {
    final result = await db.execute('SELECT id, subject, details FROM todos ORDER BY id');
    return _rows(result);
  }

  Future<Map<String, dynamic>?> getOne(int id) async {
    final result = await db.execute(
      Sql.named('SELECT id, subject, details FROM todos WHERE id = @id'),
      parameters: {'id': id},
    );
    return _rows(result).firstOrNull;
  }

  Future<Map<String, dynamic>> insert({required String subject, required String details}) async {
    final result = await db.execute(
      Sql.named('INSERT INTO todos (subject, details) VALUES (@subject, @details) RETURNING id, subject, details'),
      parameters: {'subject': subject, 'details': details},
    );
    return _rows(result).first;
  }

  Future<Map<String, dynamic>?> update(int id, {required String subject, required String details}) async {
    final result = await db.execute(
      Sql.named('UPDATE todos SET subject = @subject, details = @details WHERE id = @id RETURNING id, subject, details'),
      parameters: {'id': id, 'subject': subject, 'details': details},
    );
    return _rows(result).firstOrNull;
  }

  Future<Map<String, dynamic>?> destroy(int id) async {
    final result = await db.execute(
      Sql.named('DELETE FROM todos WHERE id = @id RETURNING id, subject, details'),
      parameters: {'id': id},
    );
    return _rows(result).firstOrNull;
  }
}
```

#### JSON helpers

`lib/json.dart` — the response helper from the routing lesson, plus a body parser that turns bad JSON into a `FormatException` the server will convert to a 400:

```dart
import 'dart:convert';

import 'package:shelf/shelf.dart';

Response jsonResponse(Object? data, {int status = 200}) => Response(
      status,
      body: jsonEncode(data),
      headers: {'content-type': 'application/json; charset=utf-8'},
    );

Future<Map<String, dynamic>> jsonBody(Request request) async {
  final decoded = jsonDecode(await request.readAsString());
  if (decoded is Map<String, dynamic>) return decoded;
  throw const FormatException('expected a JSON object');
}
```

The content type is `application/json; charset=utf-8`. The `charset` is what makes a browser decode non-ASCII subjects correctly, and `fetch` is happy with either form.

#### Setting CORS headers

A browser only lets a page on one origin (say `http://localhost:5173`, your React dev server) read responses from another (`http://localhost:8080`) if the server says so with `Access-Control-*` headers — and for `PUT`/`DELETE`/JSON requests it first sends an `OPTIONS` "preflight" asking permission. Middleware handles both in one place. Create `lib/middleware.dart`:

```dart
import 'package:shelf/shelf.dart';

const _corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'Content-Type',
};

Middleware cors() => createMiddleware(
      requestHandler: (Request request) {
        if (request.method == 'OPTIONS') return Response(204, headers: _corsHeaders);
        return null;
      },
      responseHandler: (Response response) => response.change(headers: _corsHeaders),
    );

Middleware ignoreTrailingSlash() => (Handler inner) => (Request request) {
      final path = request.requestedUri.path;
      if (path.length <= 1 || !path.endsWith('/')) return inner(request);
      final trimmed = request.requestedUri.replace(path: path.substring(0, path.length - 1));
      return inner(Request(request.method, trimmed,
          headers: request.headers, body: request.read(), context: request.context));
    };
```

`createMiddleware` builds middleware from two callbacks: `requestHandler` runs before the router and can short-circuit by returning a `Response` — here a `204` with the CORS headers for any `OPTIONS` request; `responseHandler` runs after and can rewrite the response (`change` merges headers). Header names are lower-case because that is how shelf stores them; HTTP headers are case-insensitive, so `access-control-allow-origin` and `Access-Control-Allow-Origin` are the same header. `Content-Type` is the only header the preflight allows, because it is the only one the frontends send.

`*` means any origin, which is what a lesson wants: every frontend guide on this site, on any port, can call this API. In a real product set it to your frontend's origin (`https://todos.example.com`) so other sites cannot read your users' data from their browsers.

`ignoreTrailingSlash` is the long-hand form of middleware — a function that takes the inner handler and returns a new one. It trims `/todos/` to `/todos` before the router sees it. Nothing on this site sends the slash any more, so you can drop it; it stays in the example as a courtesy for people who type it. If you'd rather not own the CORS code, `dart pub add shelf_cors_headers` and use its `corsHeaders()` middleware instead.

#### Create the controller

`lib/controllers/todo_controller.dart`:

```dart
import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import '../db/connection.dart';
import '../json.dart';
import '../models/todo.dart';

Response _notFound() => jsonResponse({'error': 'not found'}, status: 404);

Response _invalid() => jsonResponse({'error': 'subject and details are required'}, status: 400);

/// Returns the value when it is a string with visible characters, otherwise null.
String? _text(Object? value) {
  if (value is String && value.trim().isNotEmpty) return value;
  return null;
}

class TodoController {
  final Todo todos = Todo(db);

  Router get router {
    final router = Router();
    router.get('/', (Request request) async => jsonResponse(await todos.getAll()));
    router.get('/<id|[0-9]+>', (Request request, String id) async {
      final todo = await todos.getOne(int.parse(id));
      if (todo == null) return _notFound();
      return jsonResponse(todo);
    });
    router.post('/', (Request request) async {
      final body = await jsonBody(request);
      final subject = _text(body['subject']);
      final details = _text(body['details']);
      if (subject == null || details == null) return _invalid();
      final created = await todos.insert(subject: subject, details: details);
      return jsonResponse(created, status: 201);
    });
    router.put('/<id|[0-9]+>', (Request request, String id) async {
      final body = await jsonBody(request);
      final subject = _text(body['subject']);
      final details = _text(body['details']);
      if (subject == null || details == null) return _invalid();
      final updated = await todos.update(int.parse(id), subject: subject, details: details);
      if (updated == null) return _notFound();
      return jsonResponse(updated);
    });
    router.delete('/<id|[0-9]+>', (Request request, String id) async {
      final deleted = await todos.destroy(int.parse(id));
      if (deleted == null) return _notFound();
      return Response(204);
    });
    return router;
  }
}
```

- `_text` is the whole validation layer: a field counts only if it is a string with visible characters, so `{}`, `{"subject": "   "}` and `{"subject": 1}` all get `400 {"error":"subject and details are required"}` without touching the database.
- Both error bodies are one-key objects, `{"error": "..."}`, which is what the frontends display.
- `DELETE` answers `Response(204)` — no body — after the model confirms a row was actually removed; a second delete of the same id is a 404.

#### Mount it

Replace the generated `bin/server.dart` with this. The order of middleware is the order requests pass through: log everything, answer CORS preflights, trim the trailing slash, turn a bad body into a 400, then route. The `Router` gets a `notFoundHandler` so an unknown path is `404 {"error":"not found"}` in JSON rather than shelf's plain-text default, and `main()` creates the table before it starts listening.

```dart
import 'dart:io';

import 'package:darttodosapi/controllers/todo_controller.dart';
import 'package:darttodosapi/db/connection.dart';
import 'package:darttodosapi/json.dart';
import 'package:darttodosapi/middleware.dart';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart';
import 'package:shelf_router/shelf_router.dart';

const _page = '''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Todos API</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #08080A; color: #EAE6E1; font: 17px/1.5 system-ui, sans-serif; }
    main { width: min(36rem, calc(100% - 32px)); }
    h1 { font-size: clamp(42px, 6vw, 68px); letter-spacing: -.03em; margin: 0; }
    p { color: #8A8A94; }
    a { color: #2FD48F; }
    code { color: #E8D800; }
  </style>
</head>
<body>
  <main>
    <p>Dart · shelf</p>
    <h1>Todos</h1>
    <p>JSON lives at <code>/todos</code>.</p>
    <p><a href="https://github.com/arthurbernierjr/dtc-dart-api">GitHub</a></p>
  </main>
</body>
</html>
''';

final _router = Router(notFoundHandler: (Request request) => jsonResponse({'error': 'not found'}, status: 404))
  ..get('/', (Request request) => Response.ok(_page, headers: {'content-type': 'text/html; charset=utf-8'}))
  ..get('/health', (Request request) => jsonResponse({'ok': true}))
  ..mount('/todos', TodoController().router.call);

Middleware badRequestOnFormatError() => createMiddleware(
      errorHandler: (Object error, StackTrace stack) {
        if (error is FormatException || error is TypeError) {
          return jsonResponse({'error': 'invalid request body'}, status: 400);
        }
        Error.throwWithStackTrace(error, stack);
      },
    );

Future<void> main() async {
  await db.execute('''
    CREATE TABLE IF NOT EXISTS todos (
      id serial PRIMARY KEY,
      subject text NOT NULL,
      details text NOT NULL
    )
  ''');
  final handler = Pipeline()
      .addMiddleware(logRequests())
      .addMiddleware(cors())
      .addMiddleware(ignoreTrailingSlash())
      .addMiddleware(badRequestOnFormatError())
      .addHandler(_router.call);
  final port = int.parse(Platform.environment['PORT'] ?? '8080');
  final server = await serve(handler, InternetAddress.anyIPv4, port);
  print('Server listening on port ${server.port}');
}
```

**WHY the HTML page at `/`:** a bare API root that returns JSON confuses people who click the Railway domain to see whether it is up. The landing page tells them where the JSON lives; `GET /health` is the machine-readable version and is the first thing the contract check hits.

The `badRequestOnFormatError` middleware catches the `FormatException` from `jsonBody` (not JSON, or JSON that is not an object) and the `TypeError` a wrong-typed field would raise, and answers `400 {"error":"invalid request body"}`. Anything else is rethrown with its stack so shelf still logs a real server error as a 500.

## Testing the API

- Run `dart run bin/server.dart`, then hit every endpoint with curl (or Postman). `-i` prints the status line so you can compare with the contract:

```bash
curl -i http://localhost:8080/health
curl -i http://localhost:8080/todos
curl -i http://localhost:8080/todos/1
curl -i -X POST http://localhost:8080/todos -H "Content-Type: application/json" \
  -d '{"subject": "Snack", "details": "eat a snack"}'
curl -i -X PUT http://localhost:8080/todos/4 -H "Content-Type: application/json" \
  -d '{"subject": "Snack", "details": "eat two snacks"}'
curl -i -X DELETE http://localhost:8080/todos/4
curl -i -X POST http://localhost:8080/todos -H "Content-Type: application/json" -d '{"subject": "  "}'
curl -i -X POST http://localhost:8080/todos -H "Content-Type: application/json" -d 'not json'
curl -i http://localhost:8080/todos/999
curl -i -X OPTIONS http://localhost:8080/todos -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: content-type"
```

Expect, in order: `200 {"ok":true}`; `200` with the list (or `[]` on a fresh database); `200` with one todo; `201` with the new row; `200` with the updated row; `204` with no body; `400 {"error":"subject and details are required"}`; `400 {"error":"invalid request body"}`; `404 {"error":"not found"}`; and a `204` whose headers include `access-control-allow-origin: *` and `access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS`.

Run the contract check against your own deploy: `node check.mjs https://your-api.up.railway.app` (copy [`check.mjs`](https://github.com/arthurbernierjr/dtc-dart-api/blob/main/check.mjs) from the example repo; it needs Node 18 or later and no packages). All 16 lines should say PASS. It works against `http://localhost:8080` too.

## Deploying the API

Heroku's free tier is long gone, so we deploy with a **Dockerfile**, which every current host understands. `dart create` already wrote one; the example repo's copy is the same two stages with the comments stripped and one line added to print the SDK version into the build log:

`Dockerfile`

```dockerfile
FROM dart:stable AS build
WORKDIR /app
RUN dart --version
COPY pubspec.* ./
RUN dart pub get
COPY . .
RUN dart build cli --target bin/server.dart -o output

FROM scratch
COPY --from=build /runtime/ /
COPY --from=build /app/output/bundle/ /app/
EXPOSE 8080
CMD ["/app/bin/server"]
```

**WHY two stages:** the first stage has the full SDK and compiles `bin/server.dart` to a native executable (`dart build cli` is the Dart 3.10+ wrapper around `dart compile exe` that also bundles native assets). The second stage starts from an empty image and copies in only the executable and the few runtime files it needs, so the image is a few tens of megabytes and has no shell or SDK to attack. Try it locally if you have Docker: `docker build . -t darttodosapi && docker run -p 8080:8080 -e PGHOST=host.docker.internal darttodosapi`. Without Docker, `dart compile exe bin/server.dart -o build/server && ./build/server` proves the AOT build works.

The container reads two variables: `DATABASE_URL` (a Postgres URL; TLS required) and `PORT` (falls back to 8080). Without `DATABASE_URL` it reads `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` and `PGPASSWORD` for a local database. `DATABASE_URL` stays in Railway, never in the repo — `.env` is in the `.gitignore` for that reason.

#### Deploy to Railway

- Commit everything and push to a GitHub repo (`.dart_tool`, `build` and `.env` are in the `.gitignore`)

- At [railway.com](https://railway.com): **New Project → Deploy from GitHub repo**, pick the repo. Railway sees the `Dockerfile` at the repo root and builds with it — the build log says `Using detected Dockerfile!`, and the `RUN dart --version` line shows you which SDK it compiled with (3.13.7 on 2026-11-07). See [Railway: Dockerfiles](https://docs.railway.com/guides/dockerfiles).

- In the project canvas, **+ New → Database → PostgreSQL**. Railway provisions a Postgres service that exposes `DATABASE_URL`, `PGHOST`, `PGUSER` and friends as variables.

- Open your API service → **Variables** and add one reference variable, which copies the database's connection string into our service:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

(`Postgres` is the database service's name on the canvas; the `${{Service.VAR}}` syntax is Railway's [reference-variable](https://docs.railway.com/reference/variables) template.) Deploy the staged change.

- **Settings → Networking → Generate Domain** to get a public `*.up.railway.app` URL. Railway asks which port the service listens on — the Dockerfile's `EXPOSE 8080` is the answer, and our server also honours a `PORT` variable if the host sets one.

- Every push to the connected branch now redeploys automatically ([GitHub autodeploys](https://docs.railway.com/guides/github-autodeploys)).

#### Setting Up The Database

There is nothing to run. The first boot executes `CREATE TABLE IF NOT EXISTS todos …` against the hosted database, and every later boot is a no-op — the deploy log shows `Server listening on port 8080` once the table exists. If you ever need to look at the data directly, the Postgres service's **Data** tab is a query console, or enable **Settings → Networking → Public Access** on it and use `psql "$DATABASE_PUBLIC_URL"` from your laptop ([Railway: PostgreSQL](https://docs.railway.com/guides/postgresql)).

- Test the deployed API: `curl -i https://<your-app>.up.railway.app/health` then `curl -i https://<your-app>.up.railway.app/todos` — your API is live, with the same CORS headers, ready for the frontend lessons. Then `node check.mjs https://<your-app>.up.railway.app` for the full 16.

- Before you point a real product at it, change `access-control-allow-origin` from `*` to the frontend's origin. `*` is for the lesson, where any of the four frontend guides on any port needs to reach any backend.

Render and Fly.io work the same way: Dockerfile detected, managed Postgres attached, `DATABASE_URL` set, table created on first boot.

---

## Resources to Learn More

- [shelf `createMiddleware`](https://pub.dev/documentation/shelf/latest/shelf/createMiddleware.html) and [`Pipeline`](https://pub.dev/documentation/shelf/latest/shelf/Pipeline-class.html) — how middleware composes
- [shelf_router `Router`](https://pub.dev/documentation/shelf_router/latest/shelf_router/Router/Router.html) — `notFoundHandler`, `mount` and route parameters like `<id|[0-9]+>`
- [shelf_cors_headers](https://pub.dev/packages/shelf_cors_headers) — the packaged CORS middleware, with origin checkers
- [postgres: connection string URLs](https://pub.dev/packages/postgres#connection-string-urls) — `Pool.withUrl`, `sslmode` and pool parameters
- [`dart compile`](https://dart.dev/tools/dart-compile) and [`dart build`](https://dart.dev/tools/dart-build) — AOT executables and the CLI bundle the Dockerfile uses
- [Railway: Dockerfiles](https://docs.railway.com/guides/dockerfiles), [PostgreSQL](https://docs.railway.com/guides/postgresql) and [variables](https://docs.railway.com/reference/variables)

---
