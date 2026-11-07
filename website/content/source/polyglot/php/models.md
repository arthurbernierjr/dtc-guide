# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- how create models and migrations
- how to use models to add, update, and delete records

---

## Setup

- create a new laravel project `composer create-project laravel/laravel secondlaravel`

- cd into secondlaravel folder

- run dev server with `php artisan serve` checkout localhost:8000 make sure the project is working.

## Setting Up the Database Settings

The database settings in Laravel are read from environment variables, for local development they are inside the .env file in the root folder. Head into the .env file and make sure to set up all your postgres settings.

```
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=secondlaravel
DB_USERNAME=test5
DB_PASSWORD=test5
```

_Make sure the username and password match your local postgres settings_

Now Laravel won't make the database for us so we need to do so ourselves. So let's head into the postgres shell with the command `psql`.

1. Create a new database for the project with the command `CREATE DATABASE secondlaravel;`

2. If you don't know your username and password, create a new superuser with the command `CREATE USER test5 WITH SUPERUSER PASSWORD 'test5';`

3. exit psql with `\q`

## Models and Migrations

Migrations allow us to add, update and delete tables from our database. Much like Ruby of Rails, Laravel will look at the name of your migration to simplify things. If we prefix our name with create when generate it will create migration for creating a table.

`php artisan make:migration create_turtles_table`

/database/migrations/XXXX_XX_XX_XXXXXX_create_turtles_table

```php
    public function up()
    {
        Schema::create('turtles', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
```

let's add fields to track turtles names and ages!

```php
    public function up()
    {
        Schema::create('turtles', function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->integer("age");
            $table->timestamps();
        });
    }
```

Now let's run the migration and create the table!

`php artisan migrate`

We can confirm that the table was created by opening up the psql shell directly to our database with the command `php artisan db` and once in psql you can run the command `\dt` to see the list of tables. Exit psql with `\q`.

#### Creating A Model

So now it's time create a model class that will be used to create, update and delete records in our Turtle table. Run the following command to generate our model.

`php artisan make:model Turtle`

/app/Models/Turtle.php

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Turtle extends Model
{
    use HasFactory;
}
```

Since model is called Turtle (singular) it will automatically assume that it will connect with the table turtles (plural). Although, when it doubt we can explicitly link the model to our table.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Turtle extends Model
{
    use HasFactory;

    // Explicit Linking to table
    protected $table = 'turtles';
    // Allow fields to be used in create for controller functions
    protected $fillable = ['name', 'age'];
}
```

#### Seeding Our Database

If we want to seed our database we can use /database/seeders/DatabaseSeeder.php, let's just import our model and get to adding some records!

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// Importing Our Turtle Model
use App\Models\Turtle;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create 3 Models
        Turtle::create(["name" => "Dilbert", "age" => 5]);
        Turtle::create(["name" => "Filbert", "age" => 5]);
        Turtle::create(["name" => "Gilbert", "age" => 5]);
        echo("Turtles Created!");
    }
}
```

Run the seed with the command `php artisan db:seed`

If you want you can revisit psql with `php artisan db` and run the query `SELECT * FROM turtles;` to confirm all the Turtles were added!

## Using the Model

Let's create a controller and start making our turtles routes. Laravel allows use to create a "Resource" controller which pre-set for all our standard CRUD operations.

`php artisan make:controller TurtleController --api`

Then you'll have a new controller with the following functions...

- index() for a get request to /api/turtles
- store() for a post request to /api/turtles
- show() for a post request to /api/{id}
- update() for a put request to /api/{id}
- destroy() for a delete request to /api/{id}

Let's connect this controller to the right routes using the apiResource route method. In routes/api.php add the following.

```php
//Importing our controller
use App\Http\Controllers\TurtleController;

// Creating our API Resource routes
Route::apiResource("turtles", TurtleController::class);
```

#### Building out our Controller Functions

import our model in TurtleController.php

```php
// Import Our Model
use App\Models\Turtle;
```

##### index

```php
    public function index()
    {
        $turtles = Turtle::all();
        return response()->json($turtles);
    }
```

- test with get request to /api/turtles

##### show

```php
    public function show($id)
    {
        $turtle = Turtle::find($id);
        return response()->json($turtle);
    }
```

- test with get request to /api/turtles/1

##### store (create)

```php
    public function store(Request $request)
    {
        $input = $request->all(); // Get Request Items
        $newturtle = ["name" => $input["name"], "age" => $input["age"]]; // Extract Properties
        Turtle::create($newturtle); // Create Turtle
        response()->json(Turtle::all()); // Response
    }
```

- test with post request to /api/turtles/
- then confirm new turtle was added with get request to /api/turtles

##### update

```php
    public function update(Request $request, $id)
    {
        $input = $request->all(); // Get Request Items
        $newturtle = ["name" => $input["name"], "age" => $input["age"]]; // Extract Properties
        Turtle::find($id)->update($newturtle); // UpdateTurtle
        response()->json(Turtle::all()); // Response
    }
```

- test with put request to /api/turtles/5
- then confirm turtle was updated with get request to /api/turtles/5

##### destroy

```php
    public function update(Request $request, $id)
    {
    public function destroy($id)
    {
        Turtle::find($id)->delete(); // DeleteTurtle
        response()->json(Turtle::all()); // Response
    }
    }
```

- test with delete request to /api/turtles/5
- then confirm turtle was deleted with get request to /api/turtles/5

You got it, full CRUD! Now to the afternoon lab!
---

## Resources to Learn More

- [Laravel Migration Docs](https://laravel.com/docs/8.x/migrations)
- [Laravel Model Docs](https://laravel.com/docs/8.x/eloquent#generating-model-classes)
- [Laravel Seeding Docs](https://laravel.com/docs/8.x/seeding)
- [Laravel Relationships Docs](https://laravel.com/docs/8.x/eloquent-relationships)

---
