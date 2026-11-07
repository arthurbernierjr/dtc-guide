---
title: "Rails: building and deploying an API"
version: "8.1"
lede: "Scaffold a complete JSON API in Rails 8.1 with one command, test it with curl, deploy it with a Postgres database on Railway, and open it up to your frontend with rack-cors."
updated_from: "the 2021 'Full Stack Build Part 1' lesson (Rails 6.1, Heroku)"
verified: 2026-11-07
docs:
  - https://guides.rubyonrails.org/api_app.html
  - https://guides.rubyonrails.org/command_line.html
  - https://guides.rubyonrails.org/configuring.html#configuring-a-database
  - https://guides.rubyonrails.org/getting_started.html
  - https://github.com/rails/rails/blob/8-1-stable/railties/lib/rails/generators/rails/scaffold_controller/templates/api_controller.rb.tt
  - https://docs.railway.com/guides/rails
  - https://github.com/cyu/rack-cors
  - https://rubygems.org/gems/rack-cors
exec: not run
verified_note: "A Rails 8.1.4.1 todos API was built on Railway on 2026-11-07 in the personal workspace. Create returned 201, show 200, patch updated the row, delete returned 204, and the id was 404 afterward. The process needs bin/rails, because the gem command only prints generator help outside an app, and Bundler.require so rack-cors loads. The project was removed after the proof. The repo is github.com/arthurbernierjr/dtc-ruby-api."
changes:
  - "Deployment rewritten for Railway (Heroku's free tier ended in November 2022): GitHub deploy, `RAILS_MASTER_KEY`, a Postgres service wired in through `DATABASE_URL`, and `bin/rails db:prepare` in the start command instead of a manual `db:migrate` from a dashboard console."
  - "The hand-edited `production: url: <%= ENV['DATABASE_URL'] %>` step is gone — Rails merges `DATABASE_URL` into the production config on its own, and the 2021 snippet was mis-indented YAML anyway."
  - "The app is generated with `--skip-solid`: Rails 8's default production `database.yml` expects four Postgres databases (primary, cache, queue, cable) and `DATABASE_URL` only covers the first, which breaks `db:prepare` on a single hosted database."
  - "The test checklist used `/todo/:id`; the scaffold's routes are `/todos/:id`. Each request is now shown as a `curl` command with the JSON body the controller expects."
  - "Shows the controller the scaffold generates (Rails 8.1: `params.expect`, `:unprocessable_content`, `destroy!`) so the one-command API maps back to yesterday's hand-written one."
  - "CORS section matches the rack-cors 3.0 README and the initializer Rails 8.1 generates (double quotes, `origins` list), with a note on tightening origins and the no-trailing-slash gotcha; resources now link official docs only."
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

- Create a new Rails project: `rails new todos --api -d postgresql --skip-solid`, then `cd todos`

- Set up your database settings in `config/database.yml` as before (only if your local Postgres wants a username/password), then `bin/rails db:create`

**WHY `--skip-solid`:** Rails 8 ships Solid Queue, Solid Cache and Solid Cable, each with its *own* database. With Postgres that means the generated production config lists four databases, and the `DATABASE_URL` a host gives you only fills in the first. A small API doesn't need background jobs, a cache store or websockets, so we skip them and get a single-database production block that works unchanged on Railway. (Add them back later with `bin/rails solid_queue:install` and friends.)

Leave the `production` section alone: Rails merges `DATABASE_URL` into it automatically.

## Creating the API

While we can build the API brick by brick like we did yesterday, one of the coolest features in Rails is its scaffold generator. We can build our whole API in just a few commands like so...

```bash
bin/rails generate scaffold Todo subject:string details:string
```

Notice all that was created for us...

- A migration file in `db/migrate` with the fields pre-populated
- A model file, `app/models/todo.rb`
- A controller with all the resource actions ready to go
- `resources :todos` in `config/routes.rb`
- Test files (no views or helpers, because this is an `--api` app)

Open `app/controllers/todos_controller.rb` — it's yesterday's turtles controller, written for you:

```ruby
class TodosController < ApplicationController
  before_action :set_todo, only: %i[ show update destroy ]

  # GET /todos
  def index
    @todos = Todo.all

    render json: @todos
  end

  # GET /todos/1
  def show
    render json: @todo
  end

  # POST /todos
  def create
    @todo = Todo.new(todo_params)

    if @todo.save
      render json: @todo, status: :created, location: @todo
    else
      render json: @todo.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /todos/1
  def update
    if @todo.update(todo_params)
      render json: @todo
    else
      render json: @todo.errors, status: :unprocessable_content
    end
  end

  # DELETE /todos/1
  def destroy
    @todo.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_todo
      @todo = Todo.find(params.expect(:id))
    end

    # Only allow a list of trusted parameters through.
    def todo_params
      params.expect(todo: [ :subject, :details ])
    end
end
```

All we have left to do is...

```bash
bin/rails db:migrate
```

That's it, our API is ready to go...

## Testing the API

Run your server (`bin/rails server`) and run the following tests, in Postman or with `curl`:

- create 3 todos using a POST request to `/todos`

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"todo": {"subject": "Learn Rails", "details": "scaffold is magic"}}'
```

- see all the todos with a GET request to `/todos` — `curl http://localhost:3000/todos`
- see an individual todo with a GET request to `/todos/:id` — `curl http://localhost:3000/todos/1`
- update a todo with a PATCH (or PUT) request to `/todos/:id`

```bash
curl -X PATCH http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"todo": {"details": "done"}}'
```

- delete a todo with a DELETE request to `/todos/:id` — `curl -i -X DELETE http://localhost:3000/todos/1` (expect `204 No Content`)

The body can be nested under `todo` as above, or flat (`{"subject": "...", "details": "..."}`): for JSON requests Rails wraps the keys that match the model's columns under `todo` for you.

## Deploying the API

We'll deploy to [Railway](https://docs.railway.com/guides/rails), which deploys straight from GitHub and runs the `Dockerfile` that `rails new` already generated.

- Commit and push your code to a repo on GitHub (`config/master.key` is gitignored — keep it that way, you'll copy its value in a moment)

- On railway.com create a **New Project** → **Deploy from GitHub repo** and pick your repo (link your GitHub account if asked)

- Click **Add Variables** and set `RAILS_ENV` to `production` and `RAILS_MASTER_KEY` to the contents of your local `config/master.key`, then **Deploy**

- Add a database: **Create** → **Database** → **Add PostgreSQL**

- Back in your app service's **Variables**, add `DATABASE_URL` with the value `${{Postgres.DATABASE_URL}}` — a reference to the Postgres service you just created

- In the app service **Settings** → **Deploy**, set the **Custom Start Command** to `bin/rails db:prepare && bin/rails server -b ::`

- Click **Deploy** again, then watch **View logs** for Puma starting

- Under **Settings** → **Networking**, click **Generate Domain** to get a public URL

**WHY `db:prepare`:** it creates the database if needed and then loads the schema or runs pending migrations, so every deploy migrates itself — there is no "open a console and run `db:migrate`" step like the old Heroku flow. `RAILS_MASTER_KEY` is what decrypts `config/credentials.yml.enc`, where `secret_key_base` lives; without it the app refuses to boot in production.

Your API is deployed! Rerun your tests as you did before against your new `https://<your-app>.up.railway.app/todos` URL. Congrats!

## CORS

While your API is deployed and working, our frontend application will currently find itself experiencing CORS errors since we haven't configured the CORS headers.

So let's do that!

- In your `Gemfile`, uncomment the `gem "rack-cors"` line

- run `bundle install`

- edit `config/initializers/cors.rb` — Rails generated it with everything commented out; uncomment the block and set the origins:

`config/initializers/cors.rb`

```ruby
# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "*"

    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

- now commit and push your code back up; Railway redeploys on every push and you shouldn't receive any more CORS errors on your frontend.

Keep in mind that when complete you'll want to tighten up your CORS settings, in particular the allowed origins — list the exact origins of your frontend instead of `"*"`, with no trailing slash:

```ruby
origins "http://localhost:5173", "https://my-todos.netlify.app"
```

(`"*"` also can't be combined with `credentials: true`, so cookie-based auth needs the explicit list.) `bin/rails middleware` shows `Rack::Cors` at the top of the stack, which is what `insert_before 0` guarantees.

---

## Resources to Learn More

- [Using Rails for API-only Applications](https://guides.rubyonrails.org/api_app.html) — what the `--api` flag includes and how to add middleware back
- [The Rails Command Line](https://guides.rubyonrails.org/command_line.html) — `generate scaffold`, `db:prepare`, `middleware`
- [Deploy a Ruby on Rails App on Railway](https://docs.railway.com/guides/rails) — the steps above, plus workers and Solid Queue when you need them
- [rack-cors](https://github.com/cyu/rack-cors) — every option for `origins`, `resource`, `credentials` and `expose`

---
