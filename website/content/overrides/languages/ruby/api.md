---
title: "Rails: building and deploying an API"
framework: Rails
version: "8.1.4.1"
lede: "Scaffold a JSON API in Rails 8.1 with one command, shape it to the shared Todos contract, test it with curl, deploy it with a Postgres database on Railway, and open it up to your frontend with rack-cors."
updated_from: "the 2021 'Full Stack Build Part 1' lesson (Rails 6.1, Heroku)"
verified: 2026-11-07
docs:
  - https://guides.rubyonrails.org/api_app.html
  - https://guides.rubyonrails.org/command_line.html
  - https://guides.rubyonrails.org/configuring.html#configuring-a-database
  - https://guides.rubyonrails.org/getting_started.html
  - https://guides.rubyonrails.org/action_controller_overview.html#rescue-from
  - https://github.com/rails/rails/blob/8-1-stable/railties/lib/rails/generators/rails/scaffold_controller/templates/api_controller.rb.tt
  - https://docs.railway.com/guides/rails
  - https://github.com/cyu/rack-cors
  - https://rubygems.org/gems/rack-cors
exec: ran
verified_note: "Deployed to Railway on 2026-11-07 from commit 136c7a01d5f670a2a9145815c4fb79609881dbdf of github.com/arthurbernierjr/dtc-ruby-api, live at https://api-production-0197.up.railway.app; `node check.mjs https://api-production-0197.up.railway.app` printed 16/16 PASS (health, CORS preflights, list shape, three 400 cases, create 201, show, 404s, update, delete 204). Railway built Ruby 3.4.12, Rails 8.1.4.1, Puma 6.6.1, pg 1.7.0, rack 3.2.8 and rack-cors 3.0.0. Every whole-file block on this page is the file in that repo. No Ruby toolchain ran on the build machine."
changes:
  - "Aligned with the shared Todos contract: the scaffold's 422 validation responses and per-field error hashes became 400 with a single `error` string, a missing id answers 404 with the same shape instead of a Rails error page, `created_at`/`updated_at` are hidden by an `as_json` override so objects carry exactly `id`, `subject` and `details`, and `GET /health` was added."
  - "Deployment rewritten for Railway (Heroku's free tier ended in November 2022): GitHub deploy from a short `Dockerfile`, a Postgres service wired in through `DATABASE_URL`, `SECRET_KEY_BASE` from `bin/rails secret`, and `bin/rails db:prepare` in `bin/boot` instead of a manual `db:migrate` from a dashboard console."
  - "The 2021 `production: url: <%= ENV['DATABASE_URL'] %>` snippet was mis-indented YAML; the example keeps that line, correctly indented, inside the `production` block (Rails would also merge `DATABASE_URL` in on its own)."
  - "The app is generated with `--skip-solid`: Rails 8's default production `database.yml` expects four Postgres databases (primary, cache, queue, cable) and `DATABASE_URL` only covers the first, which breaks `db:prepare` on a single hosted database."
  - "The test checklist used `/todo/:id`; the routes are `/todos/:id`. Each request is now shown as a `curl` command with the JSON body the controller expects and the status to expect, plus the `check.mjs` contract run."
  - "Shows the controller the scaffold generates (Rails 8.1: `params.expect`, `destroy!`) and the edits that turn it into the contract's responses, so the one-command API maps back to yesterday's hand-written one."
  - "CORS section matches rack-cors 3.0 and the initializer Rails 8.1 generates (double quotes, `origins` list), with a note on tightening origins and the no-trailing-slash gotcha; resources now link official docs only."
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

Every backend guide on this site builds this same API, with no trailing slashes, objects that contain exactly `id`, `subject` and `details`, and CORS open to any origin so the four frontend guides can point at any of them. The finished Rails version is [github.com/arthurbernierjr/dtc-ruby-api](https://github.com/arthurbernierjr/dtc-ruby-api), live at [api-production-0197.up.railway.app](https://api-production-0197.up.railway.app).

---

## Setup

- Create a new Rails project: `rails new todos --api -d postgresql --skip-solid`, then `cd todos`

- Set up your database settings in `config/database.yml` as before (only if your local Postgres wants a username/password), then `bin/rails db:create`

**WHY `--skip-solid`:** Rails 8 ships Solid Queue, Solid Cache and Solid Cable, each with its *own* database. With Postgres that means the generated production config lists four databases, and the `DATABASE_URL` a host gives you only fills in the first. A small API doesn't need background jobs, a cache store or websockets, so we skip them and get a single-database production block that works unchanged on Railway. (Add them back later with `bin/rails solid_queue:install` and friends.)

Keep your `development` and `test` blocks, and make `production` read like the example's `config/database.yml` (the whole file, since the example only runs in production):

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS", 5) %>

production:
  <<: *default
  url: <%= ENV["DATABASE_URL"] %>
```

Rails would merge `DATABASE_URL` into `production` on its own; the explicit line just makes it visible.

The example repo is trimmed to the files this lesson touches: no test files, no credentials, no development config. Treat it as the answer key for *what to write*, not as a snapshot of `rails new` output. Its `Gemfile` pins `gem "rails", "8.1.4.1"` next to `pg`, `puma` and `rack-cors`, which Railway resolved to Ruby 3.4.12, Rails 8.1.4.1, Puma 6.6.1, pg 1.7.0, rack 3.2.8 and rack-cors 3.0.0.

## Creating the API

While we can build the API brick by brick like we did yesterday, one of the coolest features in Rails is its scaffold generator. We can build our whole API in just a few commands like so...

```bash
bin/rails generate scaffold Todo subject:string details:string
```

Notice all that was created for us...

- A migration file in `db/migrate` with `t.string :subject`, `t.string :details` and `t.timestamps` (the example's is `db/migrate/20261107000000_create_todos.rb`; yours carries the timestamp of when you ran the generator)
- A model file, `app/models/todo.rb`
- A controller with all the resource actions ready to go
- `resources :todos` in `config/routes.rb`
- Test files (no views or helpers, because this is an `--api` app)

The table keeps `created_at` and `updated_at`; the contract just doesn't show them. That's the model's job. Replace `app/models/todo.rb` with:

```ruby
class Todo < ApplicationRecord
  validates :subject, :details, presence: true

  def as_json(options = {})
    super(options.merge(only: %i[id subject details]))
  end
end
```

**WHY `as_json`:** `render json: @todo` calls `as_json` on the record, so one override here shapes every response in the app to exactly `id`, `subject` and `details`. `presence: true` rejects both missing and blank (`"   "`) values, which is what gives us the contract's 400s.

Three things can go wrong in any action: the id doesn't exist, the `todo` key is missing, or the body isn't JSON. Handle them once, in `app/controllers/application_controller.rb`:

```ruby
class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "not found" }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do
    render json: { error: "subject and details are required" }, status: :bad_request
  end

  rescue_from ActionDispatch::Http::Parameters::ParseError do
    render json: { error: "malformed JSON body" }, status: :bad_request
  end
end
```

Now open `app/controllers/todos_controller.rb` — it's yesterday's turtles controller, written for you. Make it read like this (what changed is listed underneath):

```ruby
class TodosController < ApplicationController
  before_action :set_todo, only: %i[show update destroy]

  def index
    render json: Todo.order(:id)
  end

  def show
    render json: @todo
  end

  def create
    @todo = Todo.new(todo_params)
    if @todo.save
      render json: @todo, status: :created
    else
      render json: { error: @todo.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def update
    if @todo.update(todo_params)
      render json: @todo
    else
      render json: { error: @todo.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    @todo.destroy!
    head :no_content
  end

  private

  def set_todo
    @todo = Todo.find(params.expect(:id))
  end

  def todo_params
    params.expect(todo: [:subject, :details])
  end
end
```

What changed from the generated file:

- `index` orders by `id` instead of `Todo.all`, so the list is stable
- the two failure branches answer `400` with one `error` sentence (`"Subject can't be blank and Details can't be blank"`) instead of `422` with `@todo.errors` as a hash, and `create` drops `location: @todo`
- `destroy` adds `head :no_content` so the `204` is explicit; `params.expect` and `Todo.find` stay, because when the key or the row is missing they raise and `ApplicationController` answers the `400` or `404`

Add the health check, `app/controllers/health_controller.rb`:

```ruby
class HealthController < ApplicationController
  def show
    render json: { ok: true }
  end
end
```

And `config/routes.rb`:

```ruby
Rails.application.routes.draw do
  resources :todos, only: %i[index show create update destroy]
  get "health", to: "health#show"
  root to: "home#show"
end
```

`only:` lists the five actions we have (`resources` would also route `new` and `edit`, which an API doesn't define). `root` points at a one-method `HomeController` in the example repo that does `render html: PAGE, layout: false` with a small inline HTML page, so `/` in a browser isn't a 404; copy it from the repo, or drop that line. The example also deletes `public/index.html` so `root` wins.

**WHY flat bodies work:** the contract sends `{"subject": "...", "details": "..."}`, but `params.expect(todo: [...])` reads `params[:todo]`. Parameter wrapping copies the keys that match the model's columns under `todo` for every JSON request. Rails 8.1 does this by default; the example says so out loud in `config/initializers/wrap_parameters.rb` (`wrap_parameters format: [:json]`), and a body nested under `todo` keeps working too.

All we have left to do is `bin/rails db:migrate`. That's it, our API is ready to go...

## Testing the API

Run your server (`bin/rails server`) and run the following tests, in Postman or with `curl -i` so you can see the status line:

- create 3 todos with a POST request to `/todos` — expect `201 Created` and `{"id":1,"subject":"Learn Rails","details":"scaffold is magic"}`

```bash
curl -i -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"subject": "Learn Rails", "details": "scaffold is magic"}'
```

- see all the todos with a GET request to `/todos` — `curl http://localhost:3000/todos` — expect `200` and an array with no `created_at` in it
- see an individual todo with a GET request to `/todos/:id` — `curl http://localhost:3000/todos/1` — expect `200`
- update a todo with a PUT request to `/todos/:id`, sending both fields — expect `200` and the updated object (`PATCH` is routed too)

```bash
curl -i -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"subject": "Learn Rails", "details": "done"}'
```

- send a bad body — `curl -i -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d '{}'` — expect `400 Bad Request` and `{"error":"subject and details are required"}`; `{"subject": "   ", "details": "x"}` also answers `400`, with the validation sentence
- ask for a todo that isn't there — `curl -i http://localhost:3000/todos/999` — expect `404` and `{"error":"not found"}`
- delete a todo with a DELETE request to `/todos/:id` — `curl -i -X DELETE http://localhost:3000/todos/1` — expect `204 No Content`, and `404` if you run it again

Run the contract check against your own deploy: `node check.mjs https://your-api.up.railway.app` (copy `check.mjs` from the example repo). All 16 lines should say PASS. It works against `http://localhost:3000` too.

## Deploying the API

We'll deploy to [Railway](https://docs.railway.com/guides/rails), which deploys straight from GitHub and builds whatever `Dockerfile` it finds at the root of the repo. `rails new` generated one, and it works, but it is a long multi-stage build. The example replaces it with eight lines:

```dockerfile
FROM ruby:3.4-bookworm
WORKDIR /app
ENV BUNDLE_DEPLOYMENT=0
COPY Gemfile ./
RUN bundle install
COPY . .
RUN chmod +x /app/bin/boot /app/bin/rails
CMD ["/app/bin/boot"]
```

The `CMD` is a two-line script, `bin/boot`, which migrates and then starts Puma on the port Railway hands us:

```bash
#!/bin/bash
cd /app || exit 1
echo BOOT
bundle exec ruby bin/rails db:prepare
exec bundle exec ruby bin/rails server -b 0.0.0.0 -p "${PORT:-8080}"
```

**WHY `db:prepare`:** it creates the database if needed and then loads the schema or runs pending migrations, so every deploy migrates itself — there is no "open a console and run `db:migrate`" step like the old Heroku flow, and no custom start command on Railway either. `exec` hands the process over to Puma so Railway's stop signals reach it. Railway sets `PORT`; the `${PORT:-8080}` fallback is for running the image locally.

Production secrets come from the environment, not from `config/master.key`: Rails reads `SECRET_KEY_BASE` in production, and the example's `config/environments/production.rb` says so with `config.secret_key_base = ENV["SECRET_KEY_BASE"]` (plus `config.hosts << /.*\.up\.railway\.app/` so Puma answers for the Railway domain; a `rails new` app leaves `config.hosts` empty, which allows every host). Then:

- Commit and push your code to a repo on GitHub

- On railway.com create a **New Project** → **Deploy from GitHub repo** and pick your repo (link your GitHub account if asked)

- Add a database: **Create** → **Database** → **Add PostgreSQL**

- In your app service's **Variables**, add `DATABASE_URL` with the value `${{Postgres.DATABASE_URL}}` (a reference to the Postgres service you just created), `RAILS_ENV` set to `production`, and `SECRET_KEY_BASE` set to the output of `bin/rails secret`

- **Deploy**, then watch **View logs** for `BOOT`, the `db:prepare` output and Puma listening

- Under **Settings** → **Networking**, click **Generate Domain** to get a public URL

Everything the app reads from the environment: `DATABASE_URL` (required), `SECRET_KEY_BASE` (required in production), `RAILS_ENV` (`production` on Railway), `PORT` (Railway sets it; falls back to 8080) and `RAILS_MAX_THREADS` (Puma's pool, defaults to 5). Never commit `SECRET_KEY_BASE` or `DATABASE_URL`.

Your API is deployed! Rerun your tests against your new `https://<your-app>.up.railway.app/todos` URL, then `node check.mjs https://<your-app>.up.railway.app`. Congrats!

## CORS

While your API is deployed and working, our frontend application will currently find itself experiencing CORS errors since we haven't configured the CORS headers. So let's do that!

- In your `Gemfile`, uncomment the `gem "rack-cors"` line (the example's Gemfile above already has it)

- run `bundle install`

- edit `config/initializers/cors.rb` — Rails generated it with everything commented out; make it read:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "*"

    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head]
  end
end
```

- now commit and push your code back up; Railway redeploys on every push and you shouldn't receive any more CORS errors on your frontend.

`origins "*"` is right for this lesson: any of the four frontend guides, running on any origin, can call your API, and `check.mjs` sends its preflights from a made-up origin. In a real product list the exact origins of your frontend instead, with no trailing slash:

```ruby
origins "http://localhost:5173", "https://your-frontend.example.com"
```

(`"*"` can't be combined with `credentials: true`, so cookie-based auth needs the explicit list.) `bin/rails middleware` shows `Rack::Cors` at the top of the stack, which is what `insert_before 0` guarantees.

---

## Resources to Learn More

- [Using Rails for API-only Applications](https://guides.rubyonrails.org/api_app.html) — what the `--api` flag includes and how to add middleware back
- [The Rails Command Line](https://guides.rubyonrails.org/command_line.html) — `generate scaffold`, `db:prepare`, `secret`, `middleware`
- [Deploy a Ruby on Rails App on Railway](https://docs.railway.com/guides/rails) — the steps above, plus workers and Solid Queue when you need them
- [rack-cors](https://github.com/cyu/rack-cors) — every option for `origins`, `resource`, `credentials` and `expose`

---
