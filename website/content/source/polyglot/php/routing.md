# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- PHP 8 or higher Installed

- Composer 2 or higher installed

- Postgres 12 or Higher Installed

_if you have issues with postgres or initializing a Laravel project, make sure you have Xcode installed on mac or libpq-dev installed on linux, `sudo apt-get install libpq-dev` on any ubuntu based system, also make sure the postgres PHP drivers are uncommented from the php installs php.ini file (uncomment mbstring, pdo_pgsql, pg). should be in /etc/php/8.0/cli/php.ini, you may also have to install mbstring, google how for your operating system, for ubuntu `sudo apt-get install php8.0-mbstring php8.0-pgsql php8.0-dev libpq-dev php-xml` to install the necessary libraries_

## What is an opinionated framework?

Most web frameworks for building full-stack websites or APIs/Microservices fall into one of two categories.

- **Minimalist:** Like express, these frameworks provide you the basic features to create a web server leaving it up to you to decide which libraries to use for connecting to databases, encryption, authentication, etc. and how to structure your files and folders in your workflow.

- **Opinionated:** These frameworks usually come with CLI tools that allow you to spin-up new projects with pre-defined projects structures, conventions and all the libraries for full functionality already built in.

These are the main web frameworks across many languages:

| Language   | Minimalist     | Opinionated       |
| ---------- | -------------- | ----------------- |
| Javascript | Express, Koa   | Nest, Foal, Sails |
| Python     | Flash, FastAPI | Django, Masonite  |
| Ruby       | Sinatra        | Ruby on Rails     |
| PHP        | Slim           | Laravel           |
| GO         | Echo           | Buffalo, Revel    |
| Rust       | Warp           | Rocket            |
| Java       |                | Spring Boot       |
| C#         |                | .Net              |
| Dart       |                | Aqueduct, Angel   |
| Kotlin     | kTor, Javalin  | Spring Boot       |
| Swift      |                | Vapor, Kitura     |

## Setting Up the Project

- create new project with the command `composer create-project laravel/laravel firstlaravel`

- Once the package is generated cd into the new firstlaravel folder

- to run the dev server run the command `php artisan serve`

## Creating a Controller

A controller is a class that has several functions to determine what is the right response for a particular server request, each of these functions are called an action.

To create a controller use the following command.

- `php artisan make:controller FirstController`

- This will create a controller in `/app/Http/Controllers/FirstController.php`

## Writing an Action

So the actions in our routes determine what the response will be when a route is requested. Let's create our first basic action that responds with JSON data.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FirstController extends Controller
{
    // Our First Controller Action
    public function first(){
        // returns a JSON Response
        return response()->json(["Hello" => "World"]);
    }
}
```

## Creating a Route

In Laravel there exists an API route group which all begin "/api". We will be adding a route to this group using our controller so head into /routes/api.php and add the following...

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// Import our controller, make sure to use back-slashes
use App\Http\Controllers\FirstController;

//define a get route for "/api/first" that points to the first function on FirstController
Route::get("/first", [FirstController::class, "first"]);
```

- spin up your dev server
- visit /api/first and see our response! You did it!

## Using URL Params

Let's make another route that uses a URL Param!

routes/api.php

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// Import our controller, make sure to use back-slashes
use App\Http\Controllers\FirstController;

//define a get route for "/api/first" that points to the first function on FirstController
Route::get("/first", [FirstController::class, "first"]);

Route::get("/second/{myparam}", [FirstController::class, "second"]);
```

Let's add another action to our controller to match!

app/Http/Controllers/FirstController.php

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FirstController extends Controller
{
    // Our First Controller Action
    public function first(){
        // returns a JSON Response
        return response()->json(["Hello" => "World"]);
    }

    // Our Second Controller Action That Uses a Param
    public function second($myparam){
        // returns a JSON Response
        return response()->json(["myparam" => $myparam]);
    }
}
```

- make a get request to /api/second/itworks and see that the param shows up!

## Accessing URL Queries

The url queries and request body are found in the input section of the Request object (you may notice the Request type was already imported in our controller). We just need to type hint or action to receive the request (by typing our parameters we can tell laravel to inject certain information).

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FirstController extends Controller
{
    // Our First Controller Action
    public function first(){
        // returns a JSON Response
        return response()->json(["Hello" => "World"]);
    }

    // Our Second Controller Action That Uses a Param, and brings in the request object
    public function second(Request $request, $myparam){
        // Get all input from request
        $input = $request->all();
        // returns a JSON Response
        return response()->json(["input" => $input, "param" => $myparam]);
    }
}
```

- So now if you go to /api/second/itworks?query=alsoworks you should see the param and the query in the output

## Accessing the Request Body

The body of the request would also be included in the input! Let's create a post route to test it out.

routes/api.php
```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
// Import our controller, make sure to use back-slashes
use App\Http\Controllers\FirstController;

//define a get route for "/api/first" that points to the first function on FirstController
Route::get("/first", [FirstController::class, "first"]);

Route::get("/second/{myparam}", [FirstController::class, "second"]);

Route::get("/third", [FirstController::class, "third"]);
```

Let's add another action to our controller
App/Http/Controllers/FirstController.php

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FirstController extends Controller
{
    // Our First Controller Action
    public function first(){
        // returns a JSON Response
        return response()->json(["Hello" => "World"]);
    }

    // Our Second Controller Action That Uses a Param, and brings in the request object
    public function second(Request $request, $myparam){
        // Get all input from request
        $input = $request->all();
        // returns a JSON Response
        return response()->json(["input" => $input, "param" => $myparam]);
    }

        // Our third controller for seeing the request body in a post request
        public function third(Request $request){
            // Get all input from request
            $input = $request->all();
            // returns a JSON Response
            return response()->json(["input" => $input]);
        }
}
```

Now in postman send a post request to "/api/third" with some data in the body and see how it changes the $input object. Now you know the rules of API routing in Laravel.


---

## Resources to Learn More
- [Laravel Controllers Documentation](https://laravel.com/docs/8.x/controllers)
- [Laravel Response Documentation](https://laravel.com/docs/8.x/responses)
- [Laravel Request Documentation](https://laravel.com/docs/8.x/requests)
- [Laravel Routing Documentation](https://laravel.com/docs/8.x/routing)

---
