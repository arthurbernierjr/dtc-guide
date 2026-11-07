---
title: "Rails: models and migrations"
version: "8.1"
lede: "Create a Postgres database for a Rails 8.1 API, write and run migrations, define an Active Record model, seed and query it from the console, then expose full CRUD through `resources` routes and a controller with strong parameters."
updated_from: "the 2021 'Opinionated Framework - Models & Migrations' lesson (Rails 6.1)"
verified: 2026-11-02
docs:
  - https://guides.rubyonrails.org/active_record_migrations.html
  - https://guides.rubyonrails.org/active_record_basics.html
  - https://guides.rubyonrails.org/active_record_querying.html
  - https://guides.rubyonrails.org/association_basics.html
  - https://guides.rubyonrails.org/routing.html
  - https://guides.rubyonrails.org/action_controller_overview.html#strong-parameters
  - https://guides.rubyonrails.org/api_app.html
  - https://guides.rubyonrails.org/command_line.html
exec: not run
verified_note: "Every generator command, migration, model, route and controller action was checked against the Rails 8.1 guides listed and against the 8.1 API scaffold controller template on GitHub (which is where `before_action`, `params.expect`, the 201/422 statuses and `destroy` come from). There is no Ruby toolchain on the build machine, so nothing on this page was executed."
changes:
  - "Migrations are `ActiveRecord::Migration[8.1]`; the generators are given their column arguments (`CreateTurtles name:string`, `AddAgeToTurtles age:integer`) so Rails writes the migration body, and the duplicated `class AddAgeToTurtles` line is gone."
  - "Bug fixed: `before_action :get_turtle, only: [\"show\", \"update\", \"delete\"]` named an action that doesn't exist (`delete`), so `@turtle` was nil inside `destroy`. It is `only: %i[show update destroy]` with the helper named `set_turtle`, as the Rails generators do."
  - "Bug fixed: the route list had `delete \"/turtles:id\"` (missing slash); and `render text:` was removed in Rails 5.1 — `destroy` now answers `head :no_content`."
  - "`params.require(:turtle).permit(:name, :age)` is now `params.expect(turtle: [:name, :age])`, the Rails 8 form that also rejects a malformed `turtle` key with a 400."
  - "`create` and `update` check the save result and answer 201/422 with the validation errors instead of always 200; `turtle.delete` (skips callbacks) is `destroy`."
  - "Every command uses the `bin/rails` binstub; the console walk-through avoids the variable name `all`; resources link the current Active Record guides only."
---

# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- How to create models and migrations
- How to use models to add, update, and delete records

---

## Setup

- Create a new project: `rails new pets --api -d postgresql`, then `cd pets`

- Set up your database settings in `config/database.yml` exactly as you did in the routing lesson (only needed if your local Postgres wants a username/password)

- Run `bin/rails db:create` to create your database

## Models and Migrations

Let's define our terms:

- **migrations** are directions on how to modify a database by adding, updating and deleting tables and their fields. They are Ruby files in `db/migrate`, numbered by timestamp so they run in order.

- **models** are classes bound to a particular table in our database, with many built-in methods for adding, updating and deleting records in that table (and related ones).

#### Creating a migration

Conventions are pretty important in Rails. Rails hopes that if you follow its conventions you will configure very little and can focus on building your application. In migrations, a name like `CreateTurtles` signals to Rails that this migration creates a new `turtles` table:

```bash
bin/rails generate migration CreateTurtles
```

This generates a file in `db/migrate` named `<timestamp>_create_turtles.rb`:

```ruby
class CreateTurtles < ActiveRecord::Migration[8.1]
  def change
    create_table :turtles do |t|

      t.timestamps
    end
  end
end
```

`t.timestamps` adds `created_at` and `updated_at` columns that Rails maintains for you; an auto-incrementing `id` primary key is added without being asked. Now all we have to do is specify what fields our table should have:

```ruby
class CreateTurtles < ActiveRecord::Migration[8.1]
  def change
    create_table :turtles do |t|
      t.string :name

      t.timestamps
    end
  end
end
```

**WHY the `[8.1]`:** a migration is pinned to the Rails version that wrote it, so an old migration keeps behaving the way it did even after you upgrade Rails.

Now let's run our migration with `bin/rails db:migrate`.

Our table was created and a new file, `db/schema.rb`, was written. It sketches out how our application sees the tables in the database; it is generated from the database after every migration, so you never edit it by hand. If you make a mistake, `bin/rails db:rollback` undoes the last migration.

#### Modifying a Table

Maybe we should also track the ages of our turtles, but our first migration has already run and can't run again against the same database. Let's create a new migration for the change. Pass the column along and Rails writes the body for us:

```bash
bin/rails generate migration AddAgeToTurtles age:integer
```

The `Add…To…` name tells the generator which table; the new migration looks like this:

```ruby
class AddAgeToTurtles < ActiveRecord::Migration[8.1]
  def change
    add_column :turtles, :age, :integer
  end
end
```

Run `bin/rails db:migrate` again and inspect the changes to your `schema.rb`.

#### Creating our Model

Before we can begin adding data to our `turtles` table we need a model: the class we go through to add, update and delete records. Create a file in `app/models` named in the **singular** — lowercase filename, CamelCase class — so for the `turtles` table the model is `Turtle`.

`app/models/turtle.rb`

```ruby
class Turtle < ApplicationRecord
end
```

That's it! `Turtle` inherits all the necessary functionality from `ApplicationRecord` (which inherits it from `ActiveRecord::Base`) and, as long as we followed the naming conventions, it all just works together. Rails reads the column names and types from the database, so `name` and `age` become attributes without a line of code.

(`bin/rails generate model Turtle name:string age:integer` creates the model file *and* the matching migration in one go — now that you've seen both halves, that's the command you'll normally reach for.)

Later on, if you create related models you can declare the relationships here, which adds methods like `turtle.owner` and `turtle.meals`:

```ruby
class Turtle < ApplicationRecord
  belongs_to :owner
  has_many :meals
  has_one :shell
end
```

**Relationship documentation is linked at the bottom of this lesson.**

#### Seeding the Table

Let's add some turtles. To handle seed data there is `db/seeds.rb`, where you can write any Ruby you like and run it with `bin/rails db:seed`:

`db/seeds.rb`

```ruby
# Create 3 turtles; p prints each saved record (with its new id) for informative terminal output
p Turtle.create(name: "Dilbert", age: 5)
p Turtle.create(name: "Filbert", age: 5)
p Turtle.create(name: "Norbert", age: 5)

puts "3 turtles added"
```

`create` builds the object and saves it in one call. If a validation fails it quietly returns the unsaved object; `create!` raises instead, which is usually what you want in a seed file.

#### Confirming Our Turtles were added to the Database

We can enter the database shell with `bin/rails dbconsole` — Rails reads `database.yml` and starts `psql` with the right arguments.

Run the SQL query `select * from turtles;` (quit the psql shell with `\q`).

The other way to check is the Rails console, `bin/rails console`, which loads your whole app into an interactive Ruby shell:

- `turtles = Turtle.all` saves all the turtles in a variable called `turtles` (an `ActiveRecord::Relation`, an array-like collection that runs its SQL lazily)

- `turtles[0]`, `turtles[1]` and `turtles[2]` show each turtle individually

- `Turtle.find(1)` looks one up by id (raising `ActiveRecord::RecordNotFound` if it doesn't exist); `Turtle.where(age: 5)` filters; `Turtle.find_by(name: "Norbert")` returns the first match or `nil`

Type `exit` to leave the console.

## Using the Model

So we have our model up and running, now let's wire it all together and connect our model to a controller.

Head over to `config/routes.rb` and add the following inside the `draw` block:

```ruby
resources :turtles
```

The `resources` macro generates all the conventional CRUD routes for a model. That one line is the equivalent of typing:

```ruby
get "/turtles", to: "turtles#index"
post "/turtles", to: "turtles#create"
get "/turtles/:id", to: "turtles#show"
patch "/turtles/:id", to: "turtles#update"
put "/turtles/:id", to: "turtles#update"
delete "/turtles/:id", to: "turtles#destroy"
```

(It also adds `new` and `edit` routes that HTML forms use; an API never hits them. `resources :turtles, except: [:new, :edit]` leaves them out, and `bin/rails routes` shows you the result either way.)

Nice that we didn't have to type all that. The routes refer to a `turtles` controller, so Rails expects `app/controllers/turtles_controller.rb` with a `TurtlesController` class — generate it:

```bash
bin/rails generate controller Turtles
```

```ruby
class TurtlesController < ApplicationController
end
```

Now let's create our actions for our routes, one at a time.

#### get "/turtles", to: "turtles#index"

```ruby
class TurtlesController < ApplicationController
  # GET /turtles
  def index
    # render all of the turtles as JSON
    render json: Turtle.all
  end
end
```

Run your server and check out `/turtles` in the browser. `render json:` calls `to_json` on the relation, which gives you an array of every column of every turtle.

#### get "/turtles/:id", to: "turtles#show"

```ruby
class TurtlesController < ApplicationController
  # GET /turtles
  def index
    render json: Turtle.all
  end

  # GET /turtles/:id
  def show
    # get the id from params, query the turtle, render it as JSON
    turtle = Turtle.find(params[:id])
    render json: turtle
  end
end
```

Try out `/turtles/1` in the browser! Then try `/turtles/999`: `find` raises `RecordNotFound`, which Rails turns into a **404** for you (in development you see the error page with the details).

#### post "/turtles", to: "turtles#create"

A couple of things to notice...

- The properties that match our model arrive in `params` grouped under a `turtle` key — either because the client nested them that way or because wrap_parameters did it for a JSON body (see the routing lesson).

- `params` is locked: Rails refuses to mass-assign it to a model until you say which keys are allowed. This is **strong parameters**, and it is why a stray `"admin": true` in a request body can't set a column you didn't intend.

- We'll need the same allow-list again in `update`, so it goes in a private helper method.

```ruby
class TurtlesController < ApplicationController
  # GET /turtles
  def index
    render json: Turtle.all
  end

  # GET /turtles/:id
  def show
    turtle = Turtle.find(params[:id])
    render json: turtle
  end

  # POST /turtles
  def create
    # build a turtle from the permitted params
    turtle = Turtle.new(turtle_params)

    if turtle.save
      # 201 Created, with the saved turtle (now with an id) as JSON
      render json: turtle, status: :created
    else
      # 422 with the validation errors
      render json: turtle.errors, status: :unprocessable_content
    end
  end

  # helper methods live under the private label; they are not routable actions
  private

  # require a "turtle" key and permit only name and age inside it
  def turtle_params
    params.expect(turtle: [:name, :age])
  end
end
```

Send a POST to `/turtles` with the JSON body `{"turtle": {"name": "Gilbert", "age": 2}}` and the `Content-Type: application/json` header. If the `turtle` key is missing or isn't an object, `expect` answers **400 Bad Request** before your code runs. (`:unprocessable_content` is the current name for 422; older tutorials write `:unprocessable_entity`, which still works.)

#### put "/turtles/:id", to: "turtles#update" & patch "/turtles/:id", to: "turtles#update"

```ruby
  # PATCH/PUT /turtles/:id
  def update
    # query the turtle
    turtle = Turtle.find(params[:id])

    # update it with the permitted params; update returns true or false
    if turtle.update(turtle_params)
      render json: turtle
    else
      render json: turtle.errors, status: :unprocessable_content
    end
  end
```

`update` assigns the attributes, runs validations and saves in one call. PATCH with only `{"turtle": {"age": 3}}` changes just the age; that's why Rails routes both PUT and PATCH here.

#### delete "/turtles/:id", to: "turtles#destroy"

```ruby
  # DELETE /turtles/:id
  def destroy
    turtle = Turtle.find(params[:id])
    # destroy removes the row and runs the model's callbacks (delete would skip them)
    turtle.destroy
    # 204 No Content: success, nothing to send back
    head :no_content
  end
```

#### One more Helper Function!

We have full CRUD, but `show`, `update` and `destroy` all repeat the same two lines: grab the id, find the turtle. Let's move that into a helper and have Rails run it *before* those three actions with `before_action`:

```ruby
class TurtlesController < ApplicationController
  # run set_turtle before show, update and destroy (and nothing else)
  before_action :set_turtle, only: %i[show update destroy]

  # GET /turtles
  def index
    render json: Turtle.all
  end

  # GET /turtles/:id
  def show
    render json: @turtle
  end

  # POST /turtles
  def create
    turtle = Turtle.new(turtle_params)

    if turtle.save
      render json: turtle, status: :created
    else
      render json: turtle.errors, status: :unprocessable_content
    end
  end

  # PATCH/PUT /turtles/:id
  def update
    if @turtle.update(turtle_params)
      render json: @turtle
    else
      render json: @turtle.errors, status: :unprocessable_content
    end
  end

  # DELETE /turtles/:id
  def destroy
    @turtle.destroy
    head :no_content
  end

  private

  # permit only name and age inside the "turtle" key
  def turtle_params
    params.expect(turtle: [:name, :age])
  end

  # for show/update/destroy: find the turtle once and store it in an instance variable
  def set_turtle
    @turtle = Turtle.find(params[:id])
  end
end
```

`%i[show update destroy]` is Ruby shorthand for an array of symbols, and the action names must match exactly — the original version of this lesson listed `delete` instead of `destroy`, so the callback never ran for deletes. Instance variables (`@turtle`) are how a `before_action` hands data to the action that follows it.

You have full CRUD! Compare it with what `bin/rails generate scaffold` writes for you tomorrow — it is this controller, line for line. On to the lab!

---

## Resources to Learn More

- [Active Record Migrations](https://guides.rubyonrails.org/active_record_migrations.html) — generators, column types, `change` vs `up`/`down`, rollback
- [Active Record Basics](https://guides.rubyonrails.org/active_record_basics.html) — naming conventions, CRUD, validations, callbacks
- [Active Record Query Interface](https://guides.rubyonrails.org/active_record_querying.html) — `find`, `where`, `order`, `find_by` and everything else you typed in the console
- [Active Record Associations](https://guides.rubyonrails.org/association_basics.html) — `belongs_to`, `has_many`, `has_one` and the foreign keys behind them
- [Strong Parameters](https://guides.rubyonrails.org/action_controller_overview.html#strong-parameters) — `expect`, `permit`, nested and array params

---
