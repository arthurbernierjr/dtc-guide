---
title: "Rails: setup and routing"
version: "8.1"
lede: "Generate a Rails 8.1 API-only app on Postgres, create its database, write a controller with actions, wire them to routes, and read path params, query strings and JSON bodies from `params`."
updated_from: "the 2021 'Opinionated Framework Part 1' lesson (Rails 6.1, Ruby 3.0)"
verified: 2026-11-02
docs:
  - https://guides.rubyonrails.org/getting_started.html
  - https://guides.rubyonrails.org/install_ruby_on_rails.html
  - https://guides.rubyonrails.org/api_app.html
  - https://guides.rubyonrails.org/routing.html
  - https://guides.rubyonrails.org/action_controller_overview.html
  - https://guides.rubyonrails.org/configuring.html#configuring-a-database
  - https://guides.rubyonrails.org/command_line.html
  - https://rubygems.org/gems/rails
  - https://rubygems.org/gems/pg
exec: not run
verified_note: "Every command, generated file and code block was checked against the Rails 8.1 guides listed and against the 8.1 application generator templates on GitHub (Gemfile, config/database.yml for PostgreSQL, config/routes.rb, the --api option's implied flags). There is no Ruby toolchain on the build machine, so nothing on this page was executed."
changes:
  - "Prerequisites bumped to Ruby 3.2+ (4.0 is current) and Rails 8.1, which is what `gem install rails` gives you today; the `rails new` output is described as it is now (Puma, Propshaft skipped in API mode, Solid Queue/Cache/Cable, Kamal, Thruster, a Dockerfile, `bin/rails`)."
  - "The `pg` gem ships precompiled builds since 1.6, so the 'install Xcode / libpq-dev first' step is now a fallback note rather than a prerequisite."
  - "database.yml matches what Rails 8.1 generates: `max_connections` (renamed from `pool` in 8.1), credentials only if your local Postgres needs them, and `DATABASE_URL` in production instead of a Heroku-specific edit."
  - "Fixed the inheritance chain: there is no `ActiveController`; API controllers inherit from `ActionController::API` (full apps from `ActionController::Base`)."
  - "Corrected 'every action must call render' — an action that renders nothing returns 204 in an API app; and `render text:` (removed in Rails 5.1) is `render plain:`."
  - "Commands use the `bin/rails` binstub inside the app; the request-body example reads the JSON with `params` directly and explains the wrapped `first` key; Postman steps are shown as `curl` too. Framework table corrected (Flask, ASP.NET Core, shelf/Serverpod, Ktor, Vapor)."
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

- Ruby 3.2 or newer — 4.0 is the current release and Rails 8.1 requires at least 3.2. Install it with a version manager; the [Install Ruby on Rails guide](https://guides.rubyonrails.org/install_ruby_on_rails.html) covers macOS, Ubuntu and Windows (WSL). Check with `ruby --version`.
- Rails 8.1: `gem install rails`, then `rails --version` should print `Rails 8.1.4` or newer.
- A text editor (like VS Code)
- PostgreSQL installed and running locally (any currently supported version)

*The `pg` gem (1.7) ships precompiled builds, so it normally installs without a compiler. If it does try to compile and fails, install the Postgres client headers first: `sudo apt install libpq-dev` on Ubuntu/Debian, `brew install libpq` on a Mac.*

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

Rails is the original: "convention over configuration" is its slogan, and if you follow its naming rules you configure almost nothing.

## Setting Up the Project

The `rails new` command generates new projects. For our purposes we will use two flags to create an API with Postgres as our database.

```bash
rails new firstrails --api -d postgresql
cd firstrails
```

- `--api` tells Rails to generate a project optimized for JSON APIs instead of its default full-stack template: a smaller middleware stack (no cookies/sessions), `ApplicationController` inheriting from `ActionController::API`, generators that skip views and helpers, and no asset pipeline or JavaScript setup at all.

- `-d postgresql` adds the `pg` gem and writes a `config/database.yml` for Postgres.

Look around the new folder. The `Gemfile` lists `rails`, `pg`, `puma` (the web server), the database-backed `solid_cache`/`solid_queue`/`solid_cable`, `kamal` and `thruster` for deployment, and a commented-out `rack-cors` line we'll need on API day. There is also a `Dockerfile` and a `.ruby-version`.

**WHY `bin/rails`:** inside an app folder run `bin/rails ...` rather than `rails ...`. The binstub guarantees the commands use *this app's* Rails version from its `Gemfile.lock`, not whatever is installed globally.

#### Testing The Dev Server

- Start the development server with `bin/rails server` (`bin/rails s` for short), go to [http://localhost:3000](http://localhost:3000) and you'll find a database error (`ActiveRecord::NoDatabaseError`). That's expected: our database doesn't exist yet.

#### Creating Our Database

`config/database.yml` is where the connection settings live. The generated file connects to your local Postgres over a socket as your OS user with no password — which just works with Postgres.app on a Mac and with many Linux setups. If your Postgres asks for a user and password (Docker, Windows, most Linux distro packages), add them to the `default` block:

`config/database.yml`

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  # For details on connection pooling, see Rails configuration guide
  # https://guides.rubyonrails.org/configuring.html#database-pooling
  max_connections: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  ## Add the lines below only if your local Postgres needs them
  host: localhost
  port: 5432
  username: postgres # the role for your local Postgres
  password: postgres # its password

development:
  <<: *default
  database: firstrails_development
```

Leave the `production` section alone. Every host (Railway, Render, Fly.io) hands your app a `DATABASE_URL` environment variable and Rails merges it into the production configuration automatically. We'll use that on API day.

Now that the settings are in `database.yml`, Rails can create the database for us: `bin/rails db:create`. Try your dev server again and you should see the Rails welcome page.

## Creating a Controller

A controller is a class that houses the methods that decide what response we send back. Generate one with:

```bash
bin/rails generate controller First
```

(`bin/rails g controller First` is the short form.) This creates `app/controllers/first_controller.rb` and a test file:

```ruby
class FirstController < ApplicationController
end
```

Notice it inherits from `ApplicationController`, which, if you open `app/controllers/application_controller.rb`, inherits from `ActionController::API`.

- `ActionController::API` → the Rails base class that gives API controllers their methods (rendering, params, callbacks). Full-stack apps use `ActionController::Base`, which adds cookies, sessions and view rendering.

- `ApplicationController` → the middle controller you own; anything you put here (authentication, error handling) is inherited by every controller.

- `FirstController` and the rest → the controllers you create. Their public methods decide the responses.

## Writing an Action

Create the following method in `FirstController`:

```ruby
class FirstController < ApplicationController
  def first
    render json: { hello: "world" }
  end
end
```

`render` sends the response. The key names the format and the value is the data: `json:` runs the value through `to_json`, `plain:` sends text as-is (the old `render text:` was removed in Rails 5.1). You can add `status: :created` (or any HTTP status) alongside. An action that never calls `render` isn't an error in an API app — Rails answers **204 No Content** — and `head :no_content` says the same thing on purpose.

These public methods are called **actions**; every controller is made up of several actions.

## Creating a Route

Routes determine which URLs point to which actions, and they live in `config/routes.rb`. The generated file already has a health-check route; add one for our `first` action:

`config/routes.rb`

```ruby
Rails.application.routes.draw do
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  get "up" => "rails/health#show", as: :rails_health_check

  get "/", to: "first#first"
end
```

Notice the pattern:

```text
verb "/endpoint", to: "controller#action"
```

The controller is named in snake_case without the `Controller` suffix: `"first#first"` means `FirstController#first`. `root "first#first"` is the dedicated way to write the `/` route, and `bin/rails routes` prints every route your app has — keep that command close.

Pretty straightforward, right!

## Using URL Params

Let's create a route that uses a URL param. A `:name` segment in the path is a placeholder that matches whatever is in that position:

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  get "/", to: "first#first"
  get "/route/:myparam", to: "first#second"
end
```

Now let's add the matching action to our controller:

```ruby
class FirstController < ApplicationController
  def first
    render json: { hello: "world" }
  end

  def second
    render json: { myparam: params[:myparam] }
  end
end
```

Head over to the browser and visit `/route/itworks` and you'll see that the variable part of the route (`:myparam`) was captured inside `params`.

`params` is an `ActionController::Parameters` object that behaves like a Hash and treats symbol and string keys the same (`params[:myparam]` and `params["myparam"]` are identical). Values are always strings — `/route/42` gives you `"42"`, so `.to_i` it if you need a number.

## Accessing URL Queries

`params` also captures the query string. Modify the `second` action like so:

```ruby
def second
  render json: { myparam: params[:myparam], myquery: params[:query] }
end
```

Now visit `/route/itworks?query=stillworking` in the browser and see that you successfully captured the query (a missing key is simply `nil`). Nice!

## Accessing the Request Body

`params` houses everything in Rails: the path params, the query string and the request body. Let's create a new route...

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  get "/", to: "first#first"
  get "/route/:myparam", to: "first#second"
  post "/route/:myparam", to: "first#third"
end
```

then create the matching action:

```ruby
def third
  render json: params
end
```

Send a POST request to `localhost:3000/route/another?here=somemore` with some JSON in the body — in Postman, or from the terminal:

```bash
curl -X POST "http://localhost:3000/route/another?here=somemore" \
  -H "Content-Type: application/json" \
  -d '{"hello": "body"}'
```

The `Content-Type: application/json` header is what tells Rails to parse the body as JSON into `params`. Look at the response to see how Rails packages the `params` object.

Notice that it includes the path param, the query, every body property individually, the `controller` and `action` names — and a sub-object named after the controller (`"first": {"hello": "body"}`). That last one is **wrap_parameters**: for JSON requests Rails also nests the body under the controller's name, so tomorrow's `params.expect(turtle: [:name, :age])` finds a `turtle` key whether or not the client sent one.

Now you know all about writing controllers and routes in Rails!

---

## Resources to Learn More

- [Action Controller Overview](https://guides.rubyonrails.org/action_controller_overview.html) — `params`, strong parameters, callbacks, `render` and `head`
- [Rails Routing from the Outside In](https://guides.rubyonrails.org/routing.html) — simple routes, `resources`, nesting, constraints
- [Using Rails for API-only Applications](https://guides.rubyonrails.org/api_app.html) — what `--api` includes and leaves out
- [The Rails Command Line](https://guides.rubyonrails.org/command_line.html) — `bin/rails server`, `generate`, `routes`, `console`, `dbconsole`

---
