---
title: "Laravel: building and deploying an API"
framework: Laravel
version: "13.40"
lede: "Build a todo API in Laravel 13 — migration, model, API resource controller, JSON errors, CORS — test it with curl and the contract check, then deploy it with Postgres on Railway."
updated_from: "the 2021 'Full Stack Build Part 1 - Building and Deploying an API' lesson (Laravel 8, Heroku)"
verified: 2026-11-07
docs:
  - https://laravel.com/docs/13.x/migrations
  - https://laravel.com/docs/13.x/eloquent
  - https://laravel.com/docs/13.x/controllers
  - https://laravel.com/docs/13.x/routing
  - https://laravel.com/docs/13.x/validation
  - https://laravel.com/docs/13.x/errors
  - https://laravel.com/docs/13.x/eloquent-resources
  - https://laravel.com/docs/13.x/deployment
  - https://laravel.com/docs/13.x/configuration
  - https://docs.railway.com/guides/laravel
  - https://docs.railway.com/guides/dockerfiles
  - https://docs.railway.com/guides/postgresql
exec: ran
verified_note: "Deployed to Railway on 2026-11-07 from commit b9ed53fc94b81593c02b6b7ee29f762b1fd0c4a0 of github.com/arthurbernierjr/dtc-php-api, live at https://api-production-2278d.up.railway.app; `node check.mjs https://api-production-2278d.up.railway.app` printed 16/16 PASS (health, CORS preflights, list shape, three 400 cases, create 201, show, 404s, update, delete 204). Railway built PHP 8.4.27, Composer 2.11.1, the laravel/laravel 13.11.0 skeleton and laravel/framework v13.40.0. Every whole-file block on this page is the file in that repo. No PHP toolchain ran on the build machine."
changes:
  - "Aligned with the shared Todos contract: routes moved from `/api/todos` to `/todos` (`apiPrefix: ''`), validation errors answer 400 `{\"error\":...}` instead of 422 and missing rows 404 `{\"error\":\"not found\"}` as JSON, `created_at`/`updated_at` are hidden from every response, the list is ordered by id, `GET /health` was added, and CORS is `*` on every path."
  - "Deployment rewritten for Railway: a Dockerfile builds the pinned Laravel skeleton and copies the lesson's files over it, and a `boot` script writes `.env` from Railway's Postgres variables, migrates and serves. Heroku's free tier ended in November 2022; the Procfile is gone."
  - "Setup adds `php artisan install:api` (no `routes/api.php` without it since Laravel 11) and `php artisan make:model Todo -m --api` for model, migration and API controller at once; the table is `todos`, not `_todos_`."
  - "The CORS section the original promised but never wrote is here: `HandleCors` ships with Laravel and `php artisan config:publish cors` exposes `config/cors.php`."
  - "`store`, `update` and `destroy` now return their responses (the originals dropped them), use route model binding so a bad id is a 404, validate input, and answer 201 / 204."
  - "Testing shows `curl` next to the Postman steps plus the `check.mjs` run; 'Resources to Learn More', empty in the original, links the 13.x docs and Railway guides."
---

# Full Stack Build Part 1 - Building and Deploying an API

---

## What you will learn

- Creating an API
- Setting Cors Headers
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

Every backend guide on this site builds this same API, with no trailing slashes, objects that contain exactly `id`, `subject` and `details`, and CORS open to any origin so the four frontend guides can point at any of them. The finished example is [github.com/arthurbernierjr/dtc-php-api](https://github.com/arthurbernierjr/dtc-php-api), live at [api-production-2278d.up.railway.app](https://api-production-2278d.up.railway.app).

---

## Setup

- Create a New Laravel Project `composer create-project laravel/laravel:13.11.0 todoapi` (the skeleton the example's Dockerfile pins; Railway built PHP 8.4.27, Composer 2.11.1, framework v13.40.0)
- cd into todoapi folder
- test dev server `php artisan serve`
- turn on API routing `php artisan install:api`
- go into psql `psql`
- create a new database `CREATE DATABASE todolaravel;`
- fill out database info in .env file (uncomment the `DB_*` lines)

`.env`

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=todolaravel
DB_USERNAME=test5
DB_PASSWORD=test5
```

- run the built-in migrations against the new database `php artisan migrate`

## Creating the API

#### Creating Our todo table

- one generator for the model, its migration and a model-bound API controller: `php artisan make:model Todo -m --api`

- replace the new `create_todos_table` migration under `database/migrations/` with this (your timestamp prefix will differ)

`database/migrations/2026_11_07_000000_create_todos_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->string('subject');
            $table->string('details');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('todos');
    }
};
```

- `php artisan migrate`

**WHY:** `timestamps()` stays — the three-key rule is a JSON rule, not a table rule; the model hides the two columns.

#### Creating Our Model

- edit `app/Models/Todo.php`

`app/Models/Todo.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Todo extends Model
{
    protected $fillable = ['subject', 'details'];

    protected $hidden = ['created_at', 'updated_at'];
}
```

`Todo` maps to `todos` by convention. `$fillable` is what `create()` and `update()` may take from a request; `$hidden` drops `created_at` and `updated_at` from every JSON response.

##### Seeding The Todos Table

- optional, local only — the example repo has no seeder and `check.mjs` makes its own rows. For rows to look at, add `Todo::create(['subject' => 'Breakfast', 'details' => 'Eat Breakfast']);` to `run()` in `database/seeders/DatabaseSeeder.php`, then `php artisan db:seed`.

##### Create our Routes and Controller

- the controller already exists — `--api` above generated `app/Http/Controllers/TodoController.php`

- replace `routes/api.php` (the `/user` route `install:api` left there needs a Sanctum token; it goes)

`routes/api.php`

```php
<?php

use App\Http\Controllers\TodoController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['ok' => true]));

Route::apiResource('todos', TodoController::class)->where(['todo' => '[0-9]+']);
```

`where(['todo' => '[0-9]+'])` means `GET /todos/abc` never reaches the controller — it falls through to the 404 handler below.

- now drop the `/api` prefix and make errors JSON in `bootstrap/app.php`

`bootstrap/app.php`

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: '',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn () => true);

        $exceptions->render(function (ValidationException $e, Request $request) {
            return response()->json(['error' => $e->validator->errors()->first()], 400);
        });

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            return response()->json(['error' => 'not found'], 404);
        });
    })->create();
```

**WHY:** Laravel mounts `routes/api.php` under `/api`; `apiPrefix: ''` puts it at the root so the routes are `/todos`. `shouldRenderJsonWhen(fn () => true)` makes every error JSON even without an `Accept` header; a `ValidationException` (422 by default) becomes 400 with the first message under `error`; a `NotFoundHttpException` — unknown path, binding miss, `[0-9]+` miss — becomes `{"error":"not found"}` instead of an HTML page.

#### Index Action

- `App\Models\Todo` and `Request` are already imported in `app/Http/Controllers/TodoController.php`; add the two response types

```php
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
```

The Index Action

```php
    public function index(): JsonResponse
    {
        return response()->json(Todo::orderBy('id')->get());
    }
```

`orderBy('id')` — the contract says ascending id; Postgres promises no order.

#### Show Action

```php
    public function show(Todo $todo): JsonResponse
    {
        return response()->json($todo);
    }
```

Route model binding loaded `{todo}`; a missing id is the `NotFoundHttpException` above.

#### Store/Create action

```php
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'details' => ['required', 'string', 'max:255'],
        ]);

        $todo = Todo::create($validated)->refresh();

        return response()->json($todo, 201);
    }
```

`validate()` keeps only the listed fields and throws for anything missing — including `"   "`, which the default `TrimStrings` and `ConvertEmptyStringsToNull` middleware turn into `null` first.

**WHY `->refresh()`:** `create()` returns the model with attributes in assignment order — `subject`, `details`, `id` — while `GET /todos/:id` reads the row with `id` first. `check.mjs` compares the two as strings, so `refresh()` re-reads the row once and both serialize identically.

#### Update Action

```php
    public function update(Request $request, Todo $todo): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'details' => ['required', 'string', 'max:255'],
        ]);

        $todo->update($validated);

        return response()->json($todo);
    }
```

Both fields are `required` on update too, not `sometimes` — the contract sends the whole object on `PUT`, and an empty body must be a 400.

#### Destroy Action

```php
    public function destroy(Todo $todo): Response
    {
        $todo->delete();

        return response()->noContent();
    }
```

`noContent()` is a 204 with an empty body; deleting the same id again is the same 404 as `show`. These five methods plus the `use` lines are the whole [`TodoController.php`](https://github.com/arthurbernierjr/dtc-php-api/blob/main/overlay/app/Http/Controllers/TodoController.php).

#### Setting CORS Headers

A frontend on another origin can only call this API if the responses carry CORS headers. Laravel's `HandleCors` middleware is in the default stack — nothing to install. Its default config only covers `api/*`, which we just un-prefixed, so publish it and open it up:

```bash
php artisan config:publish cors
```

`config/cors.php`

```php
<?php

return [
    'paths' => ['*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

`paths` is `*` because the routes live at the root. `allowed_origins` `*` is right for the lesson, where any of the four frontend guides may call this API from any host; in a real product narrow it to your frontend's origin.

The example's [`routes/web.php`](https://github.com/arthurbernierjr/dtc-php-api/blob/main/overlay/routes/web.php) swaps Laravel's welcome view for a small HTML page at `/` pointing to `/todos`.

## Testing the API

- With `php artisan serve` running, hit the routes from Postman or `curl`:

- get request to /health — 200 `{"ok":true}`; to /todos — 200, an array; to /todos/1 — 200 (or 404 `{"error":"not found"}` on an empty table)

- post request to /todos — 201; update request to /todos/4 — 200; delete request to /todos/4 — 204 (get request after: now a 404)

- post request to /todos with `{}` — 400 `{"error":"The subject field is required."}`

The same with `curl` (`-i` prints the status line):

```bash
curl -i http://localhost:8000/todos                      # 200

curl -i -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"subject": "Snack", "details": "Eat Snack"}'       # 201

curl -i -X PUT http://localhost:8000/todos/4 \
  -H "Content-Type: application/json" \
  -d '{"subject": "Snack", "details": "Eat a Snack"}'     # 200

curl -i -X DELETE http://localhost:8000/todos/4          # 204
curl -i http://localhost:8000/todos/4                    # 404 {"error":"not found"}
```

Without `Content-Type: application/json` Laravel doesn't parse the body, so you get a 400. `Accept: application/json` is no longer needed — `shouldRenderJsonWhen` answers JSON regardless.

Run the contract check against your own deploy: `node check.mjs https://your-api.up.railway.app` (copy `check.mjs` from the example repo). All 16 lines should say PASS.

## Deploying the API

Heroku's free tier ended in November 2022. [Railway](https://docs.railway.com/guides/laravel) can detect a Laravel app on its own, but the example repo gives it a [Dockerfile](https://docs.railway.com/guides/dockerfiles), so the build is exactly the Setup steps.

##### Preparing Your Project

- the repo is an overlay: this guide's files under `overlay/`, plus a `Dockerfile`, a `boot` script, `check.mjs` and a README. `vendor/` and `.env` are git-ignored.

`Dockerfile`

```dockerfile
FROM php:8.4-cli-bookworm
RUN apt-get update \
 && apt-get install -y --no-install-recommends libpq-dev unzip git curl \
 && docker-php-ext-install pdo_pgsql \
 && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer create-project laravel/laravel:13.11.0 . --no-interaction --prefer-dist --no-dev \
 && php artisan install:api --no-interaction
COPY overlay/ ./
COPY boot /usr/local/bin/boot
RUN chmod +x /usr/local/bin/boot
EXPOSE 8080
CMD ["boot"]
```

[`boot`](https://github.com/arthurbernierjr/dtc-php-api/blob/main/boot) runs on every start: it copies `.env.example` to `.env`, sets `APP_ENV=production`, `APP_DEBUG=false` and the `DB_*` lines from the `PG*` variables Railway injects, runs `php artisan key:generate --force` (no sessions here, so a fresh key per boot is fine) and `php artisan migrate --force`, then `exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"`.

**WHY:** no Pre-Deploy Command, no manual migrate — the table is built on boot. `php artisan serve` is the development server, fine for a lesson API; a real product puts php-fpm behind nginx or Caddy.

- commit and push your project up to GitHub

##### Preparing Railway

- log in to [Railway](https://railway.com/), **New Project** → **Deploy from GitHub repo**, pick the repository. Railway sees the `Dockerfile` and builds with it.

- on the project canvas, **+ New** → **Database** → **Add PostgreSQL**; the new service exposes `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` and `PGPASSWORD`

- in your app service → **Variables** → **Raw Editor** add the five references `boot` reads (Railway injects `PORT`):

```env
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
```

**WHY:** `${{Postgres.PGHOST}}` is a Railway reference variable — it reads the value off the Postgres service, so you never paste credentials.

##### Connecting to Railway

- in **Settings → Networking** click **Generate Domain** and set the port to `8080` (what `boot` serves on)

- click **Deploy**; if the build fails, read the log — it's usually a missing variable

- check `/health` on your new domain, run `node check.mjs https://your-api.up.railway.app`, and your API is up — every push redeploys it, every boot migrates.

- CORS is `*` for the lesson. Before a real frontend goes live, narrow `allowed_origins` in `config/cors.php` to that frontend's origin and push.

---

## Resources to Learn More

- [Validation](https://laravel.com/docs/13.x/validation) and [Error Handling](https://laravel.com/docs/13.x/errors) — the `render()` callbacks in `bootstrap/app.php`
- [Eloquent: API Resources](https://laravel.com/docs/13.x/eloquent-resources) — `make:resource` once `$hidden` isn't enough
- [Routing: CORS](https://laravel.com/docs/13.x/routing#cors), [Deployment](https://laravel.com/docs/13.x/deployment) and [Sanctum](https://laravel.com/docs/13.x/sanctum)
- [Railway: Deploy a Laravel App](https://docs.railway.com/guides/laravel), [Dockerfiles](https://docs.railway.com/guides/dockerfiles), [PostgreSQL](https://docs.railway.com/guides/postgresql)

---
