---
title: "shelf: models and migrations"
version: "1.4.3"
lede: "Connect the shelf app to Postgres with the postgres 3.x driver (a pooled connection read from environment variables), create a table with a SQL migration file, write a model class that runs parameterized queries, and expose it through a controller."
updated_from: "the 2021 'Opinionated Framework - Models & Migrations' lesson (Dart 2.12, postgres 2.x `PostgreSQLConnection`)"
verified: 2026-11-02
docs:
  - https://pub.dev/packages/postgres
  - https://pub.dev/documentation/postgres/latest/postgres/Pool-class.html
  - https://pub.dev/documentation/postgres/latest/postgres/Endpoint-class.html
  - https://pub.dev/documentation/postgres/latest/postgres/ConnectionSettings-class.html
  - https://pub.dev/documentation/postgres/latest/postgres/Session/execute.html
  - https://pub.dev/documentation/postgres/latest/postgres/Sql/Sql.named.html
  - https://pub.dev/documentation/postgres/latest/postgres/ResultRow-class.html
  - https://pub.dev/documentation/shelf_router/latest/shelf_router/Router-class.html
  - https://www.postgresql.org/docs/current/libpq-envars.html
exec: not run
verified_note: "Every API call was checked against the postgres 3.5.20 reference (Pool.withEndpoints, Endpoint, PoolSettings/ConnectionSettings.sslMode, Session.execute, Sql.named, Result/ResultRow.toColumnMap) and the shelf_router 1.1.5 Router docs; the SQL is standard Postgres. There is no Dart SDK or Postgres server on the build machine, so nothing on this page was executed."
changes:
  - "postgres 2.x is gone from this page: `PostgreSQLConnection(host, port, db, …)`, `conn.open()`, `conn.query(sql, substitutionValues:)` and `useSSL:` were removed in postgres 3.0 (2023). The driver is now postgres 3.5 — `Pool.withEndpoints([Endpoint(…)])`, `execute(Sql.named('… @id'), parameters: {…})`, `row.toColumnMap()`, `SslMode`."
  - "Resource leak fixed: the 2021 `turtle()` helper opened a brand-new database connection on every request and never closed it. One app-wide `Pool` (max 5 connections) is created once and shared by every model."
  - "Null-safety fixes throughout: `insert({String name, int age})` is `({required String name, required int age})`, `getOne` returns `Map<String, dynamic>?` and the controller answers 404 instead of crashing on `list[0]` for a missing id."
  - "Rows are converted with `toColumnMap()` instead of hand-indexing `row[0]`, `row[1]`; the table gets a `PRIMARY KEY` and `NOT NULL` constraints; `RETURNING *` sends back the affected row instead of re-selecting the whole table; the `<id|[0-9]+>` route constraint keeps `int.parse` safe."
  - "Connection settings come from the standard libpq variables (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE`) with local defaults; the driver's default is SSL *required*, which is why local development sets `SslMode.disable` explicitly."
  - "The CREATE TABLE lives in a numbered `.sql` file run with `psql -f` — a minimal migration you can commit — and the model is tried from a `dart run` script before the controller is built."
---

# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- How to create models and migrations
- How to use models to add, update, and delete records

---

## Setup

- Use the same `firstproject` from this morning's lesson

- Add the Postgres driver: `dart pub add postgres` (this writes `postgres: ^3.5.20` into `pubspec.yaml` and fetches it, like `npm install`)

- Make sure Postgres is running locally: `psql --version` and `psql postgres -c "select 1"` should both work

## Setting Up the Database Settings

The driver needs five things to reach a database: host, port, database name, user and password. We read them from environment variables and fall back to local defaults, so the same file works on your laptop and on the server.

Create `lib/db/connection.dart`:

```dart
import 'dart:io' show Platform;

import 'package:postgres/postgres.dart';

/// One connection pool for the whole app, created the first time it's used.
/// Opening a fresh connection on every request leaks sockets; a pool keeps a
/// few open and hands them out as needed.
final Pool db = Pool.withEndpoints(
  [
    Endpoint(
      host: _env('PGHOST', 'localhost'),
      port: int.parse(_env('PGPORT', '5432')),
      database: _env('PGDATABASE', 'dartpets'),
      username: _env('PGUSER', 'postgres'),
      password: _env('PGPASSWORD', 'postgres'),
    ),
  ],
  settings: PoolSettings(
    maxConnectionCount: 5,
    // postgres 3.x REQUIRES SSL by default. A local Postgres has no TLS, so
    // turn it off unless PGSSLMODE asks for it (hosted databases will).
    sslMode: _env('PGSSLMODE', 'disable') == 'disable' ? SslMode.disable : SslMode.require,
  ),
);

/// Read an environment variable, or use the local-development default.
String _env(String key, String fallback) => Platform.environment[key] ?? fallback;
```

- Change the two `'postgres'` defaults to your local Postgres user and password if they differ.

- Create the database: `createdb dartpets`

**WHY these names:** `PGHOST`, `PGUSER` and friends are the variable names `psql` itself reads (libpq's environment variables), so `PGDATABASE=dartpets psql` opens the same database your app uses. `Platform.environment[key]` returns `String?` — the `??` fallback is what makes `_env` return a plain `String`.

If you ever need a single connection instead of a pool — a one-off script, say — it's `final conn = await Connection.open(Endpoint(…), settings: ConnectionSettings(sslMode: SslMode.disable));` and `await conn.close()` when done. `Pool` and `Connection` both implement `Session`, which is the type our model will accept.

## Models and Migrations

shelf has no ORM, so we do the two jobs an ORM would do ourselves:

- define the tables with SQL (the **migration**)
- write a model class whose methods run the right queries

#### Making the turtles table

Keep table definitions in version control as numbered SQL files. Create `db/migrations/001_create_turtles.sql` in the project root:

```sql
CREATE TABLE IF NOT EXISTS turtles (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  age  INTEGER NOT NULL
);
```

- Run it: `psql dartpets -f db/migrations/001_create_turtles.sql`

- Seed a test record: `psql dartpets -c "INSERT INTO turtles (name, age) VALUES ('Filbert', 5);"`

- Check: `psql dartpets -c "SELECT * FROM turtles;"`

Every later change to the schema is a new file (`002_add_shell_color.sql`, …) run the same way, in order.

#### Making the turtles model

Create `lib/models/turtle.dart`. The model holds a `Session` (the pool) and one method per database operation:

```dart
import 'package:postgres/postgres.dart';

class Turtle {
  // Session is implemented by both Pool and Connection, so either works here.
  final Session db;

  Turtle(this.db);

  // Each row comes back as a List of values; toColumnMap() turns it into
  // {'id': 1, 'name': 'Filbert', 'age': 5}, which jsonEncode understands.
  List<Map<String, dynamic>> _rows(Result result) =>
      result.map((row) => row.toColumnMap()).toList();

  // all turtles
  Future<List<Map<String, dynamic>>> getAll() async {
    final result = await db.execute('SELECT * FROM turtles ORDER BY id');
    return _rows(result);
  }

  // one turtle, or null if the id doesn't exist
  Future<Map<String, dynamic>?> getOne(int id) async {
    // Sql.named lets us write @id; `parameters` fills it in safely (no SQL injection)
    final result = await db.execute(
      Sql.named('SELECT * FROM turtles WHERE id = @id'),
      parameters: {'id': id},
    );
    return _rows(result).firstOrNull;
  }

  // insert one turtle and return the new row (RETURNING * gives us the id)
  Future<Map<String, dynamic>> insert({required String name, required int age}) async {
    final result = await db.execute(
      Sql.named('INSERT INTO turtles (name, age) VALUES (@name, @age) RETURNING *'),
      parameters: {'name': name, 'age': age},
    );
    return _rows(result).first;
  }

  // update one turtle and return the updated row, or null if the id doesn't exist
  Future<Map<String, dynamic>?> update(int id, {required String name, required int age}) async {
    final result = await db.execute(
      Sql.named('UPDATE turtles SET name = @name, age = @age WHERE id = @id RETURNING *'),
      parameters: {'id': id, 'name': name, 'age': age},
    );
    return _rows(result).firstOrNull;
  }

  // delete one turtle and return what was deleted, or null if the id doesn't exist
  Future<Map<String, dynamic>?> destroy(int id) async {
    final result = await db.execute(
      Sql.named('DELETE FROM turtles WHERE id = @id RETURNING *'),
      parameters: {'id': id},
    );
    return _rows(result).firstOrNull;
  }
}
```

Things to notice:

- `execute` returns a `Result`, which is a `List<ResultRow>` plus `affectedRows`. `firstOrNull` (Dart 3) gives `null` for an empty result instead of throwing like `[0]` would.
- Named parameters in the Dart method (`{required String name, required int age}`) are unrelated to the `@name` parameters in the SQL — one is Dart syntax, the other is the driver's. Both exist to stop you from mixing up the order.
- Never build SQL with string interpolation from request data. `Sql.named` + `parameters` sends values separately from the query text, so `'Filbert; DROP TABLE turtles'` is just a weird name.

## Using the Model

#### Initiating the Model

The model is a plain class that takes the pool: `Turtle(db)`. Because `db` is a top-level `final`, Dart creates the pool lazily the first time any code touches it, and every model shares it.

#### Trying it from a script

Before wiring it to HTTP, drive the model from a script — Dart's version of a framework shell. Create `bin/try_turtles.dart`:

```dart
import 'package:firstproject/db/connection.dart';
import 'package:firstproject/models/turtle.dart';

void main() async {
  final turtles = Turtle(db);

  final wilbert = await turtles.insert(name: 'Wilbert', age: 5);
  print(wilbert); // {id: 2, name: Wilbert, age: 5}

  final id = wilbert['id'] as int;
  print(await turtles.getOne(id));
  print(await turtles.update(id, name: 'Dilbert', age: 6));
  print(await turtles.destroy(id));
  print(await turtles.getAll()); // back to just Filbert

  await db.close(); // close the pool so the program can exit
}
```

- Run it with `dart run bin/try_turtles.dart`. If it can't connect, the error names the problem: wrong password, database doesn't exist, or "Server does not support SSL" (set `PGSSLMODE=disable` or fix the default in `connection.dart`).

#### Creating the TurtleController

Now a controller that calls the model. Create `lib/controllers/turtle_controller.dart`, reusing `jsonResponse` from this morning:

```dart
import 'dart:convert';

import 'package:shelf/shelf.dart';
import 'package:shelf_router/shelf_router.dart';

import '../db/connection.dart';
import '../json.dart';
import '../models/turtle.dart';

class TurtleController {
  // one model, sharing the app-wide pool
  final Turtle turtles = Turtle(db);

  Router get router {
    final router = Router();

    // GET /turtles
    router.get('/', (Request request) async {
      return jsonResponse(await turtles.getAll());
    });

    // GET /turtles/<id> — the regex only matches digits, so int.parse can't throw
    router.get('/<id|[0-9]+>', (Request request, String id) async {
      final turtle = await turtles.getOne(int.parse(id));
      if (turtle == null) return jsonResponse({'error': 'turtle not found'}, status: 404);
      return jsonResponse(turtle);
    });

    // POST /turtles  with a JSON body {"name": "...", "age": 5}
    router.post('/', (Request request) async {
      final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
      final created = await turtles.insert(name: body['name'] as String, age: body['age'] as int);
      return jsonResponse(created, status: 201);
    });

    // PUT /turtles/<id>
    router.put('/<id|[0-9]+>', (Request request, String id) async {
      final body = jsonDecode(await request.readAsString()) as Map<String, dynamic>;
      final updated = await turtles.update(int.parse(id), name: body['name'] as String, age: body['age'] as int);
      if (updated == null) return jsonResponse({'error': 'turtle not found'}, status: 404);
      return jsonResponse(updated);
    });

    // DELETE /turtles/<id>
    router.delete('/<id|[0-9]+>', (Request request, String id) async {
      final deleted = await turtles.destroy(int.parse(id));
      if (deleted == null) return jsonResponse({'error': 'turtle not found'}, status: 404);
      return jsonResponse(deleted);
    });

    return router;
  }
}
```

- Mount it in `bin/server.dart` under the other controllers:

```dart
import 'package:firstproject/controllers/turtle_controller.dart';

// Configure routes.
final _router = Router()
  ..get('/', _rootHandler)
  ..get('/echo/<message>', _echoHandler)
  ..mount('/first', FirstController().router.call)
  ..mount('/turtles', TurtleController().router.call);
```

- Run `dart run bin/server.dart` and test every route as you go:

```bash
curl http://localhost:8080/turtles
curl -X POST http://localhost:8080/turtles -H "Content-Type: application/json" -d '{"name": "Wilbert", "age": 5}'
curl http://localhost:8080/turtles/2
curl -X PUT http://localhost:8080/turtles/2 -H "Content-Type: application/json" -d '{"name": "Dilbert", "age": 6}'
curl -X DELETE http://localhost:8080/turtles/2
curl http://localhost:8080/turtles/999
```

The `as String` / `as int` casts turn a wrong-shaped body into a `TypeError`, which shelf reports as a 500. That's acceptable today; tomorrow's API lesson adds a 400 for bad input. All your routes should be working now — off to lab/homework!

---

## Resources to Learn More

- [postgres package](https://pub.dev/packages/postgres) — the README covers `Connection.open`, `execute`, named parameters, transactions and pooling
- [postgres API reference](https://pub.dev/documentation/postgres/latest/) — `Pool`, `Endpoint`, `ConnectionSettings`, `Sql`, `Result`
- [libpq environment variables](https://www.postgresql.org/docs/current/libpq-envars.html) — `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGSSLMODE`
- [shelf_router `Router`](https://pub.dev/documentation/shelf_router/latest/shelf_router/Router-class.html) — regex-constrained params like `<id|[0-9]+>`

---
