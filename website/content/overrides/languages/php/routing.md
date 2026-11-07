---
title: "Laravel: setup and routing"
framework: Laravel
version: "13.40"
lede: "Create a Laravel 13 project, switch on the API route file, write a controller with one action per endpoint, and read path params, query strings and JSON bodies from the Request object."
updated_from: "the 2021 'Opinionated Framework Part 1' lesson (Laravel 8, PHP 8.0)"
verified: 2026-11-02
docs:
  - https://laravel.com/docs/13.x/installation
  - https://laravel.com/docs/13.x/routing
  - https://laravel.com/docs/13.x/controllers
  - https://laravel.com/docs/13.x/requests
  - https://laravel.com/docs/13.x/responses
  - https://laravel.com/docs/13.x/releases
  - https://laravel.com/docs/13.x/artisan
  - https://raw.githubusercontent.com/laravel/laravel/13.x/composer.json
exec: not run
verified_note: "Every command and code block was checked against the Laravel 13.x documentation listed, the laravel/laravel 13.x skeleton (composer.json requires php ^8.3; app/Http/Controllers/Controller.php is an empty abstract class) and the framework's install:api and make:controller sources. There is no PHP or Composer on the build machine, so nothing was executed."
changes:
  - "Prerequisite bumped from PHP 8.0 to PHP 8.3+ (Laravel 13.x's floor; 8.5 is current). Composer 2 and the `laravel` installer are the two ways to create a project; Laravel Herd bundles both on macOS and Windows."
  - "Since Laravel 11 a new project has no `routes/api.php`; the page now runs `php artisan install:api` before adding API routes, which is what creates the file and registers the `/api` prefix."
  - "Postgres and the `php.ini` extension surgery are gone from the prerequisites: Laravel 11+ defaults to SQLite, so nothing database-related is needed until the models lesson."
  - "Framework table corrected: Flask (not 'Flash'), ASP.NET Core, Dart's shelf/Serverpod (Aqueduct and Angel were abandoned), Ktor, Vapor (Kitura was discontinued), Symfony alongside Laravel."
  - "Controller actions carry parameter and return types (`string $myparam`, `: JsonResponse`) as the 13.x stubs and docs do; the explanation of why `Request $request` must come before route parameters is now stated, not implied."
  - "Added `php artisan route:list`, `$request->query()` vs `$request->input()`, the `Content-Type: application/json` requirement for JSON bodies, and the 8.x docs links are now 13.x."
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

- PHP 8.3 or newer installed (Laravel 13 requires it; 8.5 is current). Check with `php --version`.
- Composer 2 installed (`composer --version`), and optionally the Laravel installer: `composer global require laravel/installer`.
- Postgres is **not** needed today — a new Laravel project uses an SQLite file by default. The models lesson switches to Postgres.

*On macOS and Windows the quickest route is [Laravel Herd](https://herd.laravel.com/), which installs PHP, Composer and the `laravel` command together. On Linux, `php -m` lists the loaded extensions; Laravel needs `mbstring`, `openssl`, `pdo`, `tokenizer` and `xml` among others, and your distro's `php-cli`, `php-mbstring`, `php-xml` and `php-sqlite3` packages cover today's work.*

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
| Dart       | shelf                | Serverpod            |
| Kotlin     | Ktor, Javalin        | Spring Boot          |
| Swift      | Hummingbird          | Vapor                |

Laravel is firmly opinionated: a project generator, a router, controllers, the Eloquent ORM, migrations, queues, auth and a template engine all arrive in the box, and the `artisan` command generates the files for you.

## Setting Up the Project

- Create a new project with Composer: `composer create-project laravel/laravel firstlaravel` (or, with the installer, `laravel new firstlaravel` — answer "None" to the starter kit question for an API project).

- `cd firstlaravel`. Either command copied `.env.example` to `.env`, generated an `APP_KEY`, created `database/database.sqlite` and ran the built-in migrations.

- Start the dev server with `php artisan serve`, then open [http://localhost:8000](http://localhost:8000) — you should see Laravel's welcome page. (`composer run dev` starts the server, the queue worker, the log tail and Vite together; for an API, `serve` is enough.)

- Switch on API routing:

```bash
php artisan install:api
```

**WHY:** Since Laravel 11 a fresh project only ships `routes/web.php`. `install:api` creates `routes/api.php`, registers it in `bootstrap/app.php` under the `/api` prefix, and installs Laravel Sanctum for token auth (it asks to run Sanctum's migration — say yes). Routes in `api.php` are stateless: no sessions and no CSRF token, which is exactly what Postman and a separate frontend need.

## Creating a Controller

A controller is a class with several methods that decide the right response for a particular request; each of these methods is called an action.

To create a controller use the following command.

- `php artisan make:controller FirstController`

- This creates `app/Http/Controllers/FirstController.php`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FirstController extends Controller
{
    //
}
```

`Controller` is `app/Http/Controllers/Controller.php`, an empty abstract class the skeleton gives you as a place for shared helpers. Extending it is a convention, not a requirement.

## Writing an Action

The actions in our routes determine what the response will be when a route is requested. Let's create our first basic action that responds with JSON data.

`app/Http/Controllers/FirstController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FirstController extends Controller
{
    // Our first controller action
    public function first(): JsonResponse
    {
        // response()->json() sets Content-Type: application/json and encodes the array
        return response()->json(['Hello' => 'World']);
    }
}
```

Returning a plain array (`return ['Hello' => 'World'];`) does the same thing — Laravel JSON-encodes arrays and Eloquent models automatically. `response()->json()` is the explicit form, and it is where you set a status code: `response()->json($data, 201)`.

## Creating a Route

Every route in `routes/api.php` is automatically prefixed with `/api`. Import the controller and point a GET route at the action.

`routes/api.php`

```php
<?php

use App\Http\Controllers\FirstController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// GET /api/first -> FirstController::first (backslashes in the import: it's a PHP namespace)
Route::get('/first', [FirstController::class, 'first']);
```

- spin up your dev server (`php artisan serve`)
- visit [http://localhost:8000/api/first](http://localhost:8000/api/first) and see our response! You did it!
- `php artisan route:list` prints every registered route, its verb and its action — the quickest way to check what the file produced.

The `[Controller::class, 'method']` pair replaces the `'Controller@method'` strings you'll see in very old tutorials. `Route::post`, `put`, `patch` and `delete` exist for the other verbs.

## Using URL Params

Let's make another route that uses a URL param! Segments in `{braces}` are captured and passed to the action **in order** — the parameter's name in the method doesn't have to match.

`routes/api.php`

```php
<?php

use App\Http\Controllers\FirstController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/first', [FirstController::class, 'first']);

// {myparam} is a required URL parameter
Route::get('/second/{myparam}', [FirstController::class, 'second']);
```

Let's add another action to our controller to match!

`app/Http/Controllers/FirstController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FirstController extends Controller
{
    // Our first controller action
    public function first(): JsonResponse
    {
        return response()->json(['Hello' => 'World']);
    }

    // Our second controller action, which receives the URL param
    public function second(string $myparam): JsonResponse
    {
        return response()->json(['myparam' => $myparam]);
    }
}
```

- make a GET request to `/api/second/itworks` and see that the param shows up!

Params always arrive as strings. To accept only digits chain a constraint onto the route: `->whereNumber('myparam')` (also `whereAlpha`, `whereUuid`, or `->where('myparam', '[a-z]+')` for your own regex). A non-matching URL then 404s at the router instead of inside your code. `{myparam?}` with a default value in the method makes it optional.

## Accessing URL Queries

Query-string values and the request body both live on the `Request` object. Type-hint `Illuminate\Http\Request` as the **first** parameter and Laravel injects it; route parameters follow after any injected dependencies.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FirstController extends Controller
{
    public function first(): JsonResponse
    {
        return response()->json(['Hello' => 'World']);
    }

    // Dependencies (Request) first, then route params
    public function second(Request $request, string $myparam): JsonResponse
    {
        // every input: query string + body
        $input = $request->all();
        // just one key from the query string, with a default
        $query = $request->query('query', 'no query');

        return response()->json(['input' => $input, 'query' => $query, 'param' => $myparam]);
    }
}
```

- Now if you go to `/api/second/itworks?query=alsoworks` you should see the param and the query in the output.

`$request->input('key')` reads from the query string **and** the body; `$request->query('key')` reads only the query string. Both take a default as the second argument.

## Accessing the Request Body

The body of the request is also included in the input! Let's create a POST route to test it out.

`routes/api.php`

```php
<?php

use App\Http\Controllers\FirstController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/first', [FirstController::class, 'first']);

Route::get('/second/{myparam}', [FirstController::class, 'second']);

// POST /api/third
Route::post('/third', [FirstController::class, 'third']);
```

Let's add another action to our controller

`app/Http/Controllers/FirstController.php`

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FirstController extends Controller
{
    public function first(): JsonResponse
    {
        return response()->json(['Hello' => 'World']);
    }

    public function second(Request $request, string $myparam): JsonResponse
    {
        $input = $request->all();
        $query = $request->query('query', 'no query');

        return response()->json(['input' => $input, 'query' => $query, 'param' => $myparam]);
    }

    // Our third action, for seeing the request body of a POST
    public function third(Request $request): JsonResponse
    {
        // all() includes the parsed JSON body; input('hello') would read one key
        return response()->json(['input' => $request->all()]);
    }
}
```

Now in Postman (or `curl`) send a POST request to `/api/third` with some JSON in the body — set the header `Content-Type: application/json`, or Laravel will not parse it — and see how it changes the `input` object:

```bash
curl -X POST http://localhost:8000/api/third \
  -H "Content-Type: application/json" \
  -d '{"hello": "body"}'
```

Now you know the rules of API routing in Laravel.

---

## Resources to Learn More

- [Routing](https://laravel.com/docs/13.x/routing) — parameters, constraints, groups, `apiResource`, route model binding
- [Controllers](https://laravel.com/docs/13.x/controllers) — `make:controller`, resource and API resource controllers
- [HTTP Requests](https://laravel.com/docs/13.x/requests) — `all`, `input`, `query`, `json`, files, headers
- [HTTP Responses](https://laravel.com/docs/13.x/responses) — `response()->json()`, status codes, headers
- [Installation](https://laravel.com/docs/13.x/installation) — `laravel new`, Herd, `composer run dev`

---
