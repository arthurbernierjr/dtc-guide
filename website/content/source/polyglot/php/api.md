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
- go into psql `psql`
- create a new database `CREATE DATABASE todolaravel;`
- fill out database info in .env file

```
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=todolaravel
DB_USERNAME=test5
DB_PASSWORD=test5
```

## Creating the API

#### Creating Our todo table

- `php artisan make:migration Create_Todos_Table`

- add the following fields to the table

```php
    public function up()
    {
        Schema::create('_todos_', function (Blueprint $table) {
            $table->id();
            $table->string("subject");
            $table->string("details");
            $table->timestamps();
        });
    }
```

- `php artisan migrate`

#### Creating Our Model

- `php artisan make:model Todo`

- edit /app/Models/Todo.php to connect table and enable fields

```php
class Todo extends Model
{
    use HasFactory;

    // Explicit Linking to table
    protected $table = '_todos_';
    // Allow fields to be used in create for controller functions
    protected $fillable = ['subject', 'details'];
}
```

##### Seeding The Todos Table

- edit /database/seeders/DatabaseSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Todo;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        Todo::create(["subject" => "Breakfast", "details" => "Eat Breakfast"]);
        Todo::create(["subject" => "Lunch", "details" => "Eat Lunch"]);
        Todo::create(["subject" => "Dinner", "details" => "Eat Dinner"]);
        echo("Todos Created!");
    }
}
```

- run `php artisan db:seed`

- confirm the todos exist by going to psql `php artisan db` and running the following query, `SELECT * FROM _todos_;`.

##### Create our Routes and Controller

- generate our controller `php artisan make:controller TodoController --api`

- import the controller in /routes/api.php

```php
use App\Http\Controllers\TodoController;
```

- add apiResources routes... `Route::apiResource("todos", TodoController::class);`

#### Index Action

- import model in /app/Http/Controllers/TodoController.php

```php
use App\Models\Todo;
```

The Index Action

```php
    public function index()
    {
        $todos = Todo::all();
        return response()->json($todos);
    }
```

#### Show Action

```php
    public function show($id)
    {
        $todo = Todo::find($id);
        return response()->json($todo);
    }
```

#### Store/Create action

```php
    public function store(Request $request)
    {
        $input = $request->all(); // Get Request Items
        $newtodo = ["subject" => $input["subject"], "details" => $input["details"]]; // Extract Properties
        $todo = Todo::create($newtodo); // Create Todo
        response()->json(Todo::all()); // Response
    }
```

#### Update Action

```php
    public function update(Request $request, $id)
    {
        $input = $request->all(); // Get Request Items
        $newtodo = ["subject" => $input["subject"], "details" => $input["details"]]; // Extract Properties
        $todo = Todo::find($id)->update($newtodo); // Update Todo
        response()->json(Todo::all()); // Response
    }
```

#### Destroy Action

```php
    public function destroy($id)
    {
        Todo::find($id)->delete(); // DeleteTodo
        response()->json(Todo::all()); // Response
    }
```

## Testing the API

- Head into postman and test all the routes

- get request to /api/todos/

- get request to /api/todos/1

- post request to /api/todos/ (get request after to confirm creation)

- update request to /api/todos/4 (get request after to confirm update)

- delete request to /api/todos/4 (get request after to confirm deletion)

## Deploying the API

##### Preparing Heroku

- login to heroku

- generate a new project

- under the resources tab provision a new postgres database

- from the resources tab open up the database dashboard

- in settings you'll find the database credentials

- Under your project settings add config vars to match the database settings in your local .env except the values match your heroku postgres credentials

- Add the APP_KEY from your .env to your heroku config vars (this and the database variables are the minimum env variables needed to run your project)

##### Preparing Your Project

- In the root of your project (where the composer.json is) create a file called `Procfile` and in it put the following:

```
web: vendor/bin/heroku-php-apache2 public/
```

##### Connecting to Heroku

- commit and push your project up to github

- in your heroku project under deployment select github

- connect your projects github repository

- enable automatic deploys

- trigger and manual deploy

- should build successfully, if not read the errors and address

- once successful in the upper right corner you'll see a "more" button, it should open up a menu with "run console"

- In the heroku console (or cli) run the following commands for your project

- `php artisan migrate`

- `php artisan db:seed`

- Your API should now be up and running!

---

## Resources to Learn More

---
