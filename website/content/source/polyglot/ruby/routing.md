# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- Ruby 3 or later (installed with rbenv ideally)
- Rails 6.1.3 or later
- A Text Editor (like vscode)
- Postgres 12 or higher installed 

*if you have issues installing the pg Gem, make sure you have Xcode installed on mac or libpq-dev installed on linux, `sudo apt-get install libpq-dev` on any ubuntu based system*

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

The `rails new` command allows us to generate new products. For our purposes we will be using several flags to create an API with postgres as our database.

`rails new firstrails --api -d postgresql`

- `--api` Tells rails to generate a project using a template optimized for RESTful APIs vs its default Full Stack Template.

- `-d postgresql` tell rails to setup the database settings to be ready for using postgres as the database.

#### Testing The Dev Server

- cd into the new firstrails folder and run the development server with the command `rails server`, go to localhost:3000 in the browser and you'll find a database error, its because our database doesn't exist yet.

#### Creating Our Database

If your on a mac and installed postgres using postgres.app shouldn't have to change any of the database settings for development. If you are one Linux and maybe windows you may have to specify your local database credentials for the development environment in config/database.yml

```yml
default: &default
  adapter: postgresql
  encoding: unicode
  # For details on connection pooling, see Rails configuration guide
  # https://guides.rubyonrails.org/configuring.html#database-pooling
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  ## Add the lines below to connect your local database
  host: localhost
  port: 5432
  username: test5 #use the username for your local environment
  password: test5 #use the password for your local environment

development:
  <<: *default
  database: firstrails_development
```

If planning to deploy a project to heroku you should change the production settings to look like so in the database.yml before deploying.

```yml
production:
  <<: *default
  url: <%= ENV['DATABASE_URL'] %>
```

Now that the settings are in database.yml rails can create our database for us by running the command `rails db:create`. Try your dev server again and you should see the default rails page.

## Creating a Controller

A controller is a class that will house functions that will determine what kind of response we will send the user. We can generate a new controller with the following command.

`rails g controller first`

This will create the file app/controllers/first_controller.rb

```ruby
class FirstController < ApplicationController
end
```

Notice it inherits from ApplicationController, which if you look at application_controller.rb inherits from ActiveController.

- ActiveController -> The base class in rails that give controllers all their methods

- ApplicationController -> is the middle controller that can be used to pass functionality to multiple controllers via inheritance

- YourController -> All the controllers you create which inherit from ApplicationController, the functions in these classes determine the responses to server request.


## Writing an Action

Create the following function in FirstController

```rb
class FirstController < ApplicationController
    def first
        render json: {hello: "world"}
    end
end
```

Every controller function must end by invoking the render function which sends the response. The function can then receive a key of the type of data you are sending (json:, text:, xml:) followed by the data to be sent.

These functions are referred to as actions, every controller is made up of several actions.

## Creating a Route

Routes determine which URLs point to which actions, these are tracked in config/routes.rb. Let's add a route for our "first" action.

```rb
Rails.application.routes.draw do
  get "/", to: "first#first"
end
```

notice the pattern
```
verb "/endpoint", to: "controller#action"
```

Pretty straightforward, right!
## Using URL Params

Let's create a route that uses a URL param:

```rb
Rails.application.routes.draw do
  get "/", to: "first#first"
  get "/route/:myparam", to: "first#second"
end
```

Now let's add the matching action to our controller!

```rb
class FirstController < ApplicationController
    
    def first
        render json: {hello: "world"}
    end

    def second
        render json: {myparam: params["myparam"]}
    end
    
end
```

Head over to the browser and visit, "/route/itworks!" and you'll that the variable part of the route ":myparam" was captured inside the params object.

## Accessing URL Queries

The params object also captures url queries, modify the second function like so!

```rb
    def second
        render json: {myparam: params["myparam"], myquery: params["query"]}
    end
```

Now visit "/route/itworks!?query=stillworking" in the browser and see that you successfully captured the query. Nice!

## Accessing the Request Body

The params object houses everything in rails, the params, the queries and the request body. Let's create a new route...

```rb
Rails.application.routes.draw do
  get "/", to: "first#first"
  get "/route/:myparam", to: "first#second"
  post "/route/:myparam", to: "first#third"
end
```
then create the matching action

```rb
    def third
        render json: params.to_json
    end
```

send a post request to "localhost:3000/route/another?here=somemore" and including some data in the body and look at the response to see how rails packages the params object.

Notice that it includes all the body properties individually but also packages in a sub-object named after the controller.

Now you know all about writing controllers and routes in rails!
---

## Resources to Learn More

- [Rails Controller Documentation](https://guides.rubyonrails.org/action_controller_overview.html)
- [Rails Routing Documentation](https://guides.rubyonrails.org/routing.html)
- [More on the render function in Rails](https://guides.rubyonrails.org/layouts_and_rendering.html)
---
