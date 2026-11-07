---
title: "Laravel: building and deploying an API"
framework: Laravel
version: "13.40"
lede: "Build a todo API in Laravel 13 end to end — model, migration, seed, API resource controller, CORS — test it with Postman or curl, then deploy it with a Postgres database on Railway."
updated_from: "the 2021 'Full Stack Build Part 1 - Building and Deploying an API' lesson (Laravel 8, Heroku)"
verified: 2026-11-07
docs:
  - https://laravel.com/docs/13.x/migrations
  - https://laravel.com/docs/13.x/eloquent
  - https://laravel.com/docs/13.x/controllers
  - https://laravel.com/docs/13.x/routing
  - https://laravel.com/docs/13.x/eloquent-resources
  - https://laravel.com/docs/13.x/deployment
  - https://laravel.com/docs/13.x/configuration
  - https://docs.railway.com/guides/laravel
  - https://docs.railway.com/guides/postgresql
  - https://docs.railway.com/guides/pre-deploy-command
exec: not run
verified_note: "Deployed on Railway on 2026-11-07 from the Laravel 13.11 skeleton, which pulled framework 13.40. The index returned 200, create returned 201, show 200, a missing id was 404, update returned the row, delete returned 204, and the CORS preflight allowed http://localhost:5173. The project was removed after the proof. The repo is github.com/arthurbernierjr/dtc-php-api."
changes:
  - "Deployment rewritten for Railway: deploy from a GitHub repo, add a Postgres service, reference its `DATABASE_URL` as `DB_URL`, run migrations as a Pre-Deploy Command, generate a domain. Heroku's free tier ended in November 2022; the Procfile and `heroku-php-apache2` steps are gone."
  - "Setup adds `php artisan install:api` (no `routes/api.php` without it since Laravel 11) and generates model, migration and API controller in one command: `php artisan make:model Todo -m --api`."
  - "The table is `todos`, not `_todos_`, and the migration is named `create_todos_table` in snake_case, so Laravel pre-fills `Schema::create('todos', ...)` and the model needs no explicit table link."
  - "The CORS section the original promised but never wrote is here: `HandleCors` is in Laravel's default middleware stack, `php artisan config:publish cors` exposes `config/cors.php`, and there is no package to install (the old `fruitcake/laravel-cors` is retired)."
  - "`store`, `update` and `destroy` now return their responses (the originals built one and dropped it), take the model through route model binding so a bad id is a 404, validate input, and answer 201 / 204 where REST expects."
  - "Testing shows the `curl` shape next to the Postman steps (and why `Content-Type`/`Accept: application/json` matter), and 'Resources to Learn More', empty in the original, links the 13.x docs plus the Railway guides used."
---

# Full Stack Build Part 1 - Building and Deploying an API

---

## What you will learn

- Creating an API
- Setting Cors Headers
- Testing an API
- Deploying an API

---

## Setup

- Create a New Laravel Project `composer create-project laravel/laravel todoapi`
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

- add the following fields to the table in the new `create_todos_table` migration under `database/migrations/`

```php
    public function up(): void
    {
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->string('subject');
            $table->string('details');
            $table->timestamps();
        });
    }
```

- `php artisan migrate`

#### Creating Our Model

- edit `app/Models/Todo.php` to allow the fields through mass assignment

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

// Allow fields to be used in create()/update() from a request
#[Fillable(['subject', 'details'])]
class Todo extends Model
{
    //
}
```

`Todo` maps to `todos` by convention (`#[Table('other_name')]` overrides it); `protected $fillable = [...]` is the older spelling and still works.

##### Seeding The Todos Table

- edit `database/seeders/DatabaseSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\Todo;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Todo::create(['subject' => 'Breakfast', 'details' => 'Eat Breakfast']);
        Todo::create(['subject' => 'Lunch', 'details' => 'Eat Lunch']);
        Todo::create(['subject' => 'Dinner', 'details' => 'Eat Dinner']);

        $this->command->info('Todos Created!');
    }
}
```

- run `php artisan db:seed`

- confirm the todos exist by going into the database CLI `php artisan db` and running the following query, `SELECT * FROM todos;`

##### Create our Routes and Controller

- the controller already exists — `--api` above generated `app/Http/Controllers/TodoController.php` (otherwise: `php artisan make:controller TodoController --api --model=Todo`)

- import the controller in `routes/api.php`

```php
use App\Http\Controllers\TodoController;
```

- add apiResources routes... `Route::apiResource('todos', TodoController::class);` (the `/user` route `install:api` left in the file needs a Sanctum token — ignore or delete it)

- `php artisan route:list --path=todos` shows the five routes

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
        $todos = Todo::all();
        return response()->json($todos);
    }
```

#### Show Action

```php
    public function show(Todo $todo): JsonResponse
    {
        // Route model binding loaded {todo}; a missing id is already a 404
        return response()->json($todo);
    }
```

#### Store/Create action

```php
    public function store(Request $request): JsonResponse
    {
        // Keep only the listed fields; invalid input answers 422
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'details' => ['required', 'string', 'max:255'],
        ]);
        $todo = Todo::create($validated); // Create Todo
        return response()->json($todo, 201); // Response: 201 Created
    }
```

#### Update Action

```php
    public function update(Request $request, Todo $todo): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['sometimes', 'required', 'string', 'max:255'],
            'details' => ['sometimes', 'required', 'string', 'max:255'],
        ]);
        $todo->update($validated); // Update Todo
        return response()->json($todo); // Response: the updated record
    }
```

#### Destroy Action

```php
    public function destroy(Todo $todo): Response
    {
        $todo->delete(); // Delete Todo
        return response()->noContent(); // Response: 204, nothing to send back
    }
```

#### Setting CORS Headers

A frontend on another origin can only call this API if the responses carry CORS headers. Laravel does this out of the box: the `HandleCors` middleware is in the default middleware stack and allows every origin on `api/*`. Nothing to install — the `fruitcake/laravel-cors` package in old tutorials was folded into the framework. To tighten it for production, publish the config file and edit `allowed_origins`:

```bash
php artisan config:publish cors
```

`config/cors.php`

```php
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    // Replace '*' with your frontend's origins once you know them
    'allowed_origins' => ['http://localhost:5173', 'https://your-frontend.example'],
```

For today, the default `['*']` is fine.

## Testing the API

- Head into Postman (or use `curl`) and test all the routes with the dev server running (`php artisan serve`)

- get request to /api/todos

- get request to /api/todos/1

- post request to /api/todos (get request after to confirm creation)

- update request to /api/todos/4 (get request after to confirm update)

- delete request to /api/todos/4 (get request after to confirm deletion — it should now be a 404)

The same with `curl` (`-X PUT` and `-X DELETE` follow the POST pattern):

```bash
curl http://localhost:8000/api/todos

curl -X POST http://localhost:8000/api/todos \
  -H "Content-Type: application/json" -H "Accept: application/json" \
  -d '{"subject": "Snack", "details": "Eat Snack"}'
```

Without `Content-Type: application/json` Laravel doesn't parse the body; `Accept: application/json` makes validation errors come back as JSON (422) instead of a redirect.

## Deploying the API

Heroku's free tier ended in November 2022. [Railway](https://docs.railway.com/guides/laravel) detects a Laravel app, runs it behind php-fpm and Caddy, and gives you a Postgres service in the same project (Render and Fly.io work the same way with the same variables).

##### Preparing Your Project

- print an app key for production: `php artisan key:generate --show` (secrets go into Railway's variables; `.env` stays git-ignored)

- commit and push your project up to GitHub

##### Preparing Railway

- log in to [Railway](https://railway.com/), **New Project** → **Deploy from GitHub repo**, pick the `todoapi` repository

- on the project canvas, **+ New** → **Database** → **Add PostgreSQL**; the new service exposes `DATABASE_URL`

- in your app service → **Variables** → **Raw Editor** add the minimum set (Laravel reads `DB_URL` as a full connection string, so the separate `DB_HOST`/`DB_USERNAME`/… aren't needed):

```env
APP_ENV=production
APP_KEY=base64:paste-the-key-from-key-generate-show
APP_DEBUG=false
APP_URL=https://your-service.up.railway.app
LOG_CHANNEL=stderr
DB_CONNECTION=pgsql
DB_URL=${{Postgres.DATABASE_URL}}
QUEUE_CONNECTION=database
```

**WHY:** `${{Postgres.DATABASE_URL}}` is a Railway reference variable — it reads the URL off the Postgres service, so you never paste credentials. `APP_DEBUG=false` keeps stack traces out of error responses; `LOG_CHANNEL=stderr` sends logs to Railway's log view instead of a disk that is wiped on every deploy.

##### Connecting to Railway

- in **Settings → Deploy**, set the **Pre-Deploy Command** so the schema is built before each release goes live (`--force` skips the production confirmation):

```bash
php artisan migrate --force
```

- for the first deploy only, make it `php artisan migrate --force && php artisan db:seed --force`, then change it back — otherwise every deploy adds three more meals

- in **Settings → Networking** click **Generate Domain**; set `APP_URL` to match

- click **Deploy**; if the build fails, read the log — it's almost always a missing variable

- check `/up` (Laravel's built-in health route) on your new domain, then `/api/todos`

- Your API should now be up and running! Every push to the repository redeploys it.

---

## Resources to Learn More

- [Eloquent: API Resources](https://laravel.com/docs/13.x/eloquent-resources) — `make:resource TodoResource` to shape the JSON
- [Routing: CORS](https://laravel.com/docs/13.x/routing#cors), [Deployment](https://laravel.com/docs/13.x/deployment) and [Sanctum](https://laravel.com/docs/13.x/sanctum) (the token auth `install:api` set up)
- [Railway: Deploy a Laravel App](https://docs.railway.com/guides/laravel), [PostgreSQL](https://docs.railway.com/guides/postgresql), [Pre-deploy command](https://docs.railway.com/guides/pre-deploy-command)

---
