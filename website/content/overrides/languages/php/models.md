---
title: "Laravel: models and migrations"
framework: Laravel
version: "13.40"
lede: "Point Laravel 13 at Postgres (or keep the default SQLite), generate a model with its migration, seed it, then expose full CRUD through an API resource controller and Route::apiResource."
updated_from: "the 2021 'Opinionated Framework - Models & Migrations' lesson (Laravel 8, PHP 8.0)"
verified: 2026-11-02
docs:
  - https://laravel.com/docs/13.x/database
  - https://laravel.com/docs/13.x/migrations
  - https://laravel.com/docs/13.x/eloquent
  - https://laravel.com/docs/13.x/seeding
  - https://laravel.com/docs/13.x/controllers
  - https://laravel.com/docs/13.x/routing
  - https://laravel.com/docs/13.x/validation
  - https://laravel.com/docs/13.x/artisan
  - https://raw.githubusercontent.com/laravel/laravel/13.x/.env.example
exec: not run
verified_note: "Commands, generated file shapes and every Eloquent/Schema call were checked against the Laravel 13.x docs listed, the laravel/laravel 13.x skeleton (.env.example, config/database.php) and the framework's make:model, model and API-controller stubs. No PHP, Composer or Postgres on the build machine, so nothing was executed."
changes:
  - "Setup now runs `php artisan install:api` (Laravel 11+ has no routes/api.php until you do) and shows that SQLite is the default, so Postgres is an opt-in `.env` change rather than a prerequisite."
  - "Migrations are the current anonymous-class shape (`return new class extends Migration`) with `up(): void` / `down(): void`; model and migration are generated together with `make:model Turtle -m`."
  - "Mass assignment uses the `#[Fillable]` attribute the 13.x Eloquent docs teach (with a note that `protected $fillable` still works); `HasFactory` is only added when you ask for a factory."
  - "Four bugs fixed in the original controller: `store`, `update` and `destroy` built a response but never returned it (every write answered empty), `destroy` was pasted inside a second `update` declaration (a parse error), the route list had `show` as a POST and the single-record URLs as `/api/{id}` instead of `/api/turtles/{id}`."
  - "The controller is generated with `--api --model=Turtle`, so `show`/`update`/`destroy` receive the Turtle through route model binding and a bad id is a 404, not a null-pointer crash; `store`/`update` validate input instead of indexing `$input['name']` blindly."
  - "Seeding uses `$this->command->info()` instead of `echo`, Tinker is introduced for poking at the model, and the 8.x docs links are now 13.x."
---

# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- How to create models and migrations
- How to use models to add, update, and delete records

---

## Setup

- Create a new Laravel project: `composer create-project laravel/laravel secondlaravel` (or `laravel new secondlaravel`)

- `cd secondlaravel`

- Enable the API route file: `php artisan install:api` (say yes when it offers to run the migration)

- Run the dev server with `php artisan serve` and check [http://localhost:8000](http://localhost:8000) to make sure the project is working.

## Setting Up the Database Settings

Laravel reads its database settings from the `.env` file in the project root (`config/database.php` maps them onto connections). A new project is already pointed at an SQLite file, `database/database.sqlite`, with the built-in migrations run — to stay on SQLite today, skip to the next section.

To use Postgres instead, edit `.env`: change `DB_CONNECTION` and uncomment and fill in the `DB_*` lines below it.

`.env`

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=secondlaravel
DB_USERNAME=postgres
DB_PASSWORD=secret
```

*Match the username and password to your local Postgres, and make sure PHP has the `pdo_pgsql` extension (`php -m | grep pgsql`; the `php-pgsql` package on Debian/Ubuntu, included in Herd).*

Laravel won't create the database for us, so open the Postgres shell with `psql`:

1. Create a new database for the project: `CREATE DATABASE secondlaravel;`

2. If you don't know your username and password, create a superuser: `CREATE USER test5 WITH SUPERUSER PASSWORD 'test5';` (and put those in `.env`)

3. Exit psql with `\q`

Now run the migrations Laravel ships with against the new database:

```bash
php artisan migrate
```

**WHY:** `migrate` is how every table gets created from now on; running it here proves the `.env` settings work before you write code of your own.

## Models and Migrations

Migrations add, change and drop tables; models are the PHP classes that read and write the rows. Much like Rails, Laravel reads the names you give it: `create_turtles_table` is pre-filled with `Schema::create('turtles', ...)`, and a model called `Turtle` assumes a table called `turtles`. Generate both at once (`-m` is `--migration`):

```bash
php artisan make:model Turtle -m
```

Open the new file in `database/migrations/`:

`database/migrations/XXXX_XX_XX_XXXXXX_create_turtles_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('turtles', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('turtles');
    }
};
```

`id()` is an auto-incrementing primary key; `timestamps()` adds `created_at` and `updated_at`, which Eloquent maintains. Let's add fields to track turtles' names and ages:

```php
    public function up(): void
    {
        Schema::create('turtles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('age');
            $table->timestamps();
        });
    }
```

Now run the migration and create the table!

```bash
php artisan migrate
```

Confirm it with `php artisan db:table turtles`, or open the database CLI with `php artisan db` and run `\dt`. `php artisan migrate:rollback` undoes the last batch by running `down()`.

#### Creating A Model

`make:model` already created the class that will create, update and delete records in our turtles table:

`app/Models/Turtle.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Turtle extends Model
{
    //
}
```

Since the model is called `Turtle` (singular) it automatically connects to the table `turtles` (plural). Two attributes to add: `#[Table]` to make the link explicit, and `#[Fillable]` to say which columns a request may set in one go.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;

// Explicit link to the table (optional here — it matches the convention)
#[Table('turtles')]
// Columns that create() and update() may fill from an array
#[Fillable(['name', 'age'])]
class Turtle extends Model
{
    //
}
```

**WHY:** Eloquent blocks mass assignment by default, so `Turtle::create($request->all())` ignores every column until you list the safe ones — which stops a request from setting `is_admin => true` just because the column exists. Older code writes `protected $table = 'turtles';` and `protected $fillable = ['name', 'age'];` instead; both forms still work.

#### Seeding Our Database

To seed the database, use `database/seeders/DatabaseSeeder.php`: import the model and add some records.

`database/seeders/DatabaseSeeder.php`

```php
<?php

namespace Database\Seeders;

use App\Models\Turtle;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create 3 turtles
        Turtle::create(['name' => 'Dilbert', 'age' => 5]);
        Turtle::create(['name' => 'Filbert', 'age' => 5]);
        Turtle::create(['name' => 'Gilbert', 'age' => 5]);

        $this->command->info('Turtles created!');
    }
}
```

Run the seed with `php artisan db:seed` (`php artisan migrate:fresh --seed` drops everything, re-migrates and seeds in one go — handy while iterating, destructive by design). Confirm in `php artisan db` with `SELECT * FROM turtles;`.

## Using the Model

Before writing routes, try the model in **Tinker**, Laravel's REPL with your project loaded (`exit` to leave):

```bash
php artisan tinker
```

- `Turtle::all()`, `Turtle::find(1)` (`null` if missing), `Turtle::where('age', '>=', 5)->get()`
- `Turtle::create(['name' => 'Wilbert', 'age' => 2])`
- `$t = Turtle::find(1); $t->age = 6; $t->save();` and `$t->delete()`

Now let's create a controller and build the turtle routes. Laravel generates an API **resource controller** pre-set for CRUD, with the model wired into the single-record actions:

```bash
php artisan make:controller TurtleController --api --model=Turtle
```

The new controller has stubs for:

- `index()` for a GET request to `/api/turtles`
- `store()` for a POST request to `/api/turtles`
- `show()` for a GET request to `/api/turtles/{turtle}`
- `update()` for a PUT or PATCH request to `/api/turtles/{turtle}`
- `destroy()` for a DELETE request to `/api/turtles/{turtle}`

(`--api` drops the `create` and `edit` actions, which only render HTML forms.) Connect it to those routes in one line:

`routes/api.php`

```php
<?php

use App\Http\Controllers\TurtleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Five routes: index, store, show, update, destroy
Route::apiResource('turtles', TurtleController::class);
```

`php artisan route:list --path=turtles` shows the five routes it registered.

#### Building out our Controller Functions

The generated file already type-hints the model on `show`, `update` and `destroy`. Because the route parameter is `{turtle}` and the method asks for `Turtle $turtle`, Laravel looks the row up for you — **route model binding** — and answers 404 when the id doesn't exist. Add the two response imports and fill in the actions.

`app/Http/Controllers/TurtleController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Turtle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TurtleController extends Controller
{
    // ... actions below go here
}
```

##### index

```php
    public function index(): JsonResponse
    {
        return response()->json(Turtle::all());
    }
```

- test with a GET request to `/api/turtles`

##### show

```php
    public function show(Turtle $turtle): JsonResponse
    {
        // $turtle was loaded by route model binding; a bad id already returned 404
        return response()->json($turtle);
    }
```

- test with a GET request to `/api/turtles/1`, then `/api/turtles/999`

##### store (create)

```php
    public function store(Request $request): JsonResponse
    {
        // validate() returns only the fields listed, or answers 422 with the errors
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'age' => ['required', 'integer', 'min:0'],
        ]);

        $turtle = Turtle::create($validated);

        return response()->json($turtle, 201);
    }
```

- test with a POST request to `/api/turtles` with a JSON body like `{"name": "Wilbert", "age": 2}` (header `Content-Type: application/json`)
- then confirm the new turtle was added with a GET request to `/api/turtles`

##### update

```php
    public function update(Request $request, Turtle $turtle): JsonResponse
    {
        // 'sometimes': validate the field only if it was sent, so PATCH can send a subset
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'age' => ['sometimes', 'required', 'integer', 'min:0'],
        ]);

        $turtle->update($validated);

        return response()->json($turtle);
    }
```

- test with a PUT request to `/api/turtles/4`
- then confirm the turtle was updated with a GET request to `/api/turtles/4`

##### destroy

```php
    public function destroy(Turtle $turtle): Response
    {
        $turtle->delete();

        // 204 No Content: the standard answer to a successful DELETE
        return response()->noContent();
    }
```

- test with a DELETE request to `/api/turtles/4`
- then confirm the turtle was deleted: GET `/api/turtles/4` is now a 404

You got it, full CRUD! Returning the affected record (and nothing on delete) is what REST clients expect. Now to the afternoon lab!

---

## Resources to Learn More

- [Migrations](https://laravel.com/docs/13.x/migrations) — column types, modifiers, altering tables, rollback
- [Eloquent: Getting Started](https://laravel.com/docs/13.x/eloquent) — retrieving, inserting, updating, deleting, mass assignment
- [Seeding](https://laravel.com/docs/13.x/seeding) and [Eloquent: Relationships](https://laravel.com/docs/13.x/eloquent-relationships) — `hasMany`, `belongsTo` and friends for tomorrow
- [Validation](https://laravel.com/docs/13.x/validation) — every rule `validate()` accepts

---
