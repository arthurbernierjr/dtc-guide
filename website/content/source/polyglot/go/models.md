# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- how create models and migrations
- how to use models to add, update, and delete records

---

## Setup

Use our project from the morning lesson where our database settings should already be set and our database is created. Now let's get to work.

## Models and Migrations

#### Creating a Migration

Migrations allow us to add, alter, delete tables from our database. To create a new migration run the command.

```
buffalo pop g model turtle
```

This will create an up and down file in the migrations folder, open up the up file and add this.

```go
create_table("turtles") {
  t.Column("id", "integer", {primary: true})
  t.Column("name", "string", {"size": 100})
  t.Column("age", "integer")
}
```

then run `buffalo pop migrate`

Our table has been created, now we need to create our model!

#### Creating Our Model

Now it's time to create a model so we can update and edit that table, our model was created earlier and can be found in the models folder (turtle.go). It will automatically create most of what we need, (a struct defining a Turtle, a Turtles type that is an array of Turtle, A String function to convert a turtle into a String, and functions where you can define any validations).

We just need to add our age and name properties to the struct. The tag on each property defines how the property is named in the database and in json (ca)

```go
// Turtle is used by pop to map your turtles database table to your go code.
type Turtle struct {
    ID int `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
	Age int `json:"age" db:"age"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
```

## Using the Model

Create a new file for our turtles routes actions/turtle.go and let's write all our usual crud routes and test as we go.

```go
package actions

import (
	"net/http"
	"github.com/gobuffalo/buffalo"
	"firstproject/models"
	// "fmt"
	"strconv"
)

// Create a Resource to Bundle standard CRUD Routes
type TurtlesResource struct{ }

// get request to /turtles return all turtles
func (u TurtlesResource) List(c buffalo.Context) error {
	var turtles models.Turtles // declare variable to receive turtles
	err := models.DB.All(&turtles) // store all turtles in the turtles variable
	if err != nil {
		return err
	}
	// send response
	return c.Render(http.StatusOK, r.JSON(turtles))
}

// get request to /turtles/{turtle_id}
func (u TurtlesResource) Show(c buffalo.Context) error {
	//grab the id from url param
	id := c.Param("turtle_id")
	// declare a variable to receive the turtle
	turtle := models.Turtle{}
	//Search for the Turtle
	models.DB.Find(&turtle, id)
	// return response
	return c.Render(http.StatusOK, r.JSON(turtle))
}

// post request to /turtle to create new turtle from request body
func (u TurtlesResource) Create(c buffalo.Context) error {
	// create a turtle to receive request body
	turtle := &models.Turtle{}
	// handle possible error when binding
	if err := c.Bind(turtle); err != nil {
		return err
	  }
	// handle possible error when creating
	err2 := models.DB.Create(turtle)
	if (err2 != nil){
		return err2
	}
	// We must return a response
	return c.Render(http.StatusOK, r.JSON(turtle))
}


// put request to /turtle/{turtle_id} to update a Turtle
func (u TurtlesResource) Update(c buffalo.Context) error {
	//grab the id from url param, convert from string 
	id, strerr := strconv.Atoi(c.Param("turtle_id"))
	// handle possible error
	if strerr != nil {
		return strerr
	}
	// declare a variable to receive the turtle
	turtle := &models.Turtle{}
	// handle possible error when binding
	if err := c.Bind(turtle); err != nil {
			return err
		  }
	// set the id
	turtle.ID = id
	//Search for the Turtle
	models.DB.Update(turtle)
	// return response
	return c.Render(http.StatusOK, r.JSON(turtle))
}

// delete request to /turtles/{turtle_id}
func (u TurtlesResource) Destroy(c buffalo.Context) error {
	//grab the id from url param, convert from string 
	id, strerr := strconv.Atoi(c.Param("turtle_id"))
	// handle possible error
	if strerr != nil {
		return strerr
	}
	// declare a variable to receive the turtle
	turtle := &models.Turtle{ID: id}
	//delete turtle
	err := models.DB.Destroy(turtle)
	// handle possible error
	if err != nil {
		return err
	}
	return c.Render(http.StatusOK, r.JSON(map[string]string{"Done": "Turtle Destroyed"}))
}
```

Add the routes to go with them in app.go

```go
		// A Resource routes creates all the crud routes on one line
		app.Resource("/turtles", TurtlesResource{})
```

Test out all the end points then let's get into lab.

---

## Resources to Learn More
- [Query Docs](https://gobuffalo.io/en/docs/db/querying/)
---
