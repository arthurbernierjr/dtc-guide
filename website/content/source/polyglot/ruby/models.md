# Opinionated Framework - Models & Migrations
-------

## What you will learn

- How to set the database settings
- how create models and migrations
- how to use models to add, update, and delete records

-------

## Setup

- create a new project `rails new pets --api -d postgresql`

- Setup your database settings

- run `rails db:create` to create your database

## Models and Migrations

Let's define our terms:

- migrations are directions on how to modify a database by adding, updating, deleting tables and their fields

- models are objects that will be bound to particular table in our database that have many built in methods for adding, updating and deleting records in the table and possibly related ones.

#### Creating a migration

Conventions are pretty important in Rails. Rails hopes that if you follow it's conventions that you will be configuring very little of your app and can focus on the building of your application. In migrations using the name "Create_ModelName" will signal to rails to create a migration to create a new table.

`rails generate migration create_turtles`

This will generate a migration in db/migrate to create a new table called turtles!

```rb
class CreateTurtles < ActiveRecord::Migration[6.1]
  def change
    create_table :turtles do |t|

      t.timestamps
    end
  end
end
```

Now all we have to do is specify what fields our table should have.

```rb
class CreateTurtles < ActiveRecord::Migration[6.1]
  def change
    create_table :turtles do |t|
      t.string :name
      t.timestamps
    end
  end
end
```

Now let's run our migration with the `rails db:migrate` command!

Our table was created and a new file db/schema.rb was created which sketches out how our application sees the tables in the database.

#### Modifying a Table

Maybe we should also track the ages of our turtles, but our first migration has already ran and can't be run again for the same database. Let's create a new migration for our modifications.

`rails g migration add_age_to_turtles`

In that new migration make sure it looks like the following:

```rb
class AddAgeToTurtles < ActiveRecord::Migration[6.1]
class AddAgeToTurtles < ActiveRecord::Migration[6.1]
  def change
    add_column :turtles, :age, :integer
  end
end
```

Run the migration and inspect the changes to your schema.rb

#### Creating our Model

Before we can begin adding data to our turtles table we need to create a Model that will act as the way we add, update and delete records in the turtles table. To do so we need to create a file in app/models but it has to be named singular! (The filename lowercase and the class uppercased)

So since our table is turtles, our model should turtle.

create app/models/turtle.rb

```rb
class Turtle < ApplicationRecord
end
```

That's it! Turtle will inherit all the necessary functionality from ApplicationRecord which inherits it from ActiveRecord and as long as we followed the naming conventions should all just magically work together.

Later on, if you create related models you can pass macros here that can denote data relationships and build in extra functionality to take advantage. Here is an example.

```rb
class Turtle < ApplicationRecord
belongs_to :owner
has_many :meals
has_one :shell
end
```

**Relationship Documentation Linked at the bottom of this lesson**

#### Seeding the Table

Let's add some turtles to our data. To handle adding seed data there is a db/seeds.rb where you can add any code you like and run with the command `rails db:seed`. Let's add a few turtles.

```rb
### Create 3 turtles, use puts to have informative terminal output

puts Turtle.create(name: "Dilbert", age: 5)

puts Turtle.create(name: "Filbert", age: 5)

puts Turtle.create(name: "Norbert", age: 5)

puts "3 turtles added"
```

#### Confirming Our Turtles were added to the Database

We can enter our database shell very easily using the command `rails dbconsole`.

then then run the sql query `select * from turtles;` (quit the psql shell with `\q`)

Another way we can check as well is by using the rails console with the command `rails console`.

`all = Turtle.all` will save all the turtles in a variable called all

`all[0]`, `all[1]`, and `all[2]` should allow you to see each turtle individually!

Type `exit` to leave the Ruby Shell.


## Using the Model

So we have our model up and running, now let's wire it altogether and connect our model to a controller.

Head over to routes.rb and add the following...

```rb
  resources :turtles
```

The resources macro auto generates all the conventional CRUD routes for a model. That one line is the equivalent of typing.

```rb
get "/turtles", to: "turtles#index"
get "/turtles/:id", to: "turtles#show"
post "/turtles", to: "turtles#create"
put "/turtles/:id", to: "turtles#update"
patch "/turtles/:id", to: "turtles#update"
delete "/turtles:id", to: "turtles#destroy"
```

That's nice we didn't have to type all that. Although if we want additional routes we'd have to add them in manually. Now we just have to create a controller that matches these routes. Since it refers to a "turtles" controller it will be expecting a file called "turtles_controller.rb" in your controllers folder, let's create it.

```rb
class TurtlesController < ApplicationController
end
```

Now let's start creating our actions for our routes!

#### get "/turtles", to: "turtles#index"

```rb
class TurtlesController < ApplicationController

    ## get "/turtles", to: "turtles#index"
    def index
        ## Render All of of the Turtles as JSON
        render json: Turtle.all
    end

end
```

Then run your server and check out "/turtles/" in the browser.
#### get "/turtles/:id", to: "turtles#show"

```rb
class TurtlesController < ApplicationController

    ## get "/turtles", to: "turtles#index"
    def index
        ## Render All of of the Turtles as JSON
        render json: Turtle.all
    end

    ## "/turtles/:id", to: "turtles#show"
    def show
        ## get the id from params
        id = params["id"]
        ## query the turtle and render as json
        render json: Turtle.find(id)
    end

end
```

Try out "/turtles/1" in the browser!

#### post "/turtles", to: "turtles#create"

Couple of things to notice...

- The properties that match our model are grouped in params in a property called "turtle"

- the params object is a unique object type that actually locks up the model grouping unless we "permit" it

- We will run into this again in other routes so instead of permitting it multiple times we will write a helper function we can use to unlock the body when needed.

```rb
class TurtlesController < ApplicationController

    ## get "/turtles", to: "turtles#index"
    def index
        ## Render All of of the Turtles as JSON
        render json: Turtle.all
    end

    ## "/turtles/:id", to: "turtles#show"
    def show
        ## get the id from params
        id = params["id"]
        ## query the turtle and render as json
        render json: Turtle.find(id)
    end

    ## post "/turtles", to: "turtles#create"
    def create
        # Grab the turtle param using our helper function
        body = turtle_params
        #create a new turtle
        turtle = Turtle.create(body)
        #return the turtle as json
        render json: turtle.to_json
    end

    ## We will store helper functions under the private label
    private

    ## This will whitelist the "turtle" property in params and return it
    def turtle_params
        return params.require(:turtle).permit(:name, :age)
    end

end
```
#### put "/turtles/:id", to: "turtles#update" & patch "/turtles/:id", to: "turtles#update"

```rb
class TurtlesController < ApplicationController

    ## get "/turtles", to: "turtles#index"
    def index
        ## Render All of of the Turtles as JSON
        render json: Turtle.all
    end

    ## "/turtles/:id", to: "turtles#show"
    def show
        ## get the id from params
        id = params["id"]
        ## query the turtle and render as json
        render json: Turtle.find(id)
    end

    ## post "/turtles", to: "turtles#create"
    def create
        # Grab the turtle param using our helper function
        body = turtle_params
        #create a new turtle
        turtle = Turtle.create(body)
        #return the turtle as json
        render json: turtle.to_json
    end

    # put "/turtles/:id", to: "turtles#update" 
    # & patch "/turtles/:id", to: "turtles#update"
    def update
        ## get the id from params
        id = params["id"]
        ## query the turtle
        turtle = Turtle.find(id)
        ## Update the turtle
        turtle.update(turtle_params)
        ## render the turtle as json
        render json: turtle.to_json
    end

    ## We will store helper functions under the private label
    private

    ## This will whitelist the "turtle" property in params and return it
    def turtle_params
        return params.require(:turtle).permit(:name, :age)
    end

end
```

#### delete "/turtles:id", to: "turtles#destroy"

```rb
class TurtlesController < ApplicationController

    ## get "/turtles", to: "turtles#index"
    def index
        ## Render All of of the Turtles as JSON
        render json: Turtle.all
    end

    ## "/turtles/:id", to: "turtles#show"
    def show
        ## get the id from params
        id = params["id"]
        ## query the turtle and render as json
        render json: Turtle.find(id)
    end

    ## post "/turtles", to: "turtles#create"
    def create
        # Grab the turtle param using our helper function
        body = turtle_params
        #create a new turtle
        turtle = Turtle.create(body)
        #return the turtle as json
        render json: turtle.to_json
    end

    # put "/turtles/:id", to: "turtles#update" 
    # & patch "/turtles/:id", to: "turtles#update"
    def update
        ## get the id from params
        id = params["id"]
        ## query the turtle
        turtle = Turtle.find(id)
        ## Update the turtle
        turtle.update(turtle_params)
        ## render the turtle as json
        render json: turtle.to_json
    end

    # delete "/turtles:id", to: "turtles#destroy"
    def destroy
        ## get the id from params
        id = params["id"]
        ## query the turtle
        turtle = Turtle.find(id)
        ## delete the turtle
        turtle.delete()
        ## send response that all went well
        render text: "Turtle Deleted"
    end

    ## We will store helper functions under the private label
    private

    ## This will whitelist the "turtle" property in params and return it
    def turtle_params
        return params.require(:turtle).permit(:name, :age)
    end


end
```

#### One more Helper Function!

While we have crud functionality in show, update and delete we are repeating ourselves in grabbing the param and querying for a turtle. How about we make a help function that does that to clear up our code and have it run before those particular actions.

```rb
class TurtlesController < ApplicationController

    ## have the get_turtle function run before show/update/delete
    before_action :get_turtle, only: ["show", "update", "delete"]

    ## get "/turtles", to: "turtles#index"
    def index
        ## Render All of of the Turtles as JSON
        render json: Turtle.all
    end

    ## "/turtles/:id", to: "turtles#show"
    def show
        ## query the turtle and render as json
        render json: @turtle.to_json
    end

    ## post "/turtles", to: "turtles#create"
    def create
        # Grab the turtle param using our helper function
        body = turtle_params
        #create a new turtle
        turtle = Turtle.create(body)
        #return the turtle as json
        render json: turtle.to_json
    end

    # put "/turtles/:id", to: "turtles#update" 
    # & patch "/turtles/:id", to: "turtles#update"
    def update
        ## Update the turtle
        @turtle.update(turtle_params)
        ## render the turtle as json
        render json: @turtle.to_json
    end

    # delete "/turtles:id", to: "turtles#destroy"
    def destroy
        ## delete the turtle
        @turtle.delete()
        ## send response that all went well
        render text: "Turtle Deleted"
    end

    ## We will store helper functions under the private label
    private

    ## This will whitelist the "turtle" property in params and return it
    def turtle_params
        return params.require(:turtle).permit(:name, :age)
    end

    ## for show/update/delete get turtle based on id and store in instance variable
    def get_turtle
        @turtle = Turtle.find(params["id"])
    end


end
```

You have full CRUD! On to the lab!


-------
## Resources to Learn More
- [Rails Migrations Documentation](https://guides.rubyonrails.org/active_record_migrations.html)
- [Rails Model Relationships Documentation](https://guides.rubyonrails.org/association_basics.html)
- [Rails Model Queries Documentation](https://guides.rubyonrails.org/active_record_querying.html)

-------



