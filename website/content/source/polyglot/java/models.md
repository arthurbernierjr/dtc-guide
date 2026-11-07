# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- how create models and migrations
- how to use models to add, update, and delete records

---

## Setup

- We will keep using our demo lesson from this mornings lesson.
- open the command palette and select Spring -> Add Starters
- Add JPA Data and Postgres Drivers
- Allow the pom.xml file to updated with the new dependencies

## Setting Up the Database Settings

- create a new local postgres database `createdb javaspringtest`

Open up src/main/resources/application.properties and add the following...
_Make sure to use the username & password for your local postgres_

```yaml
# Database Settings
spring.datasource.url=jdbc:postgresql://localhost:5432/javaspringtest
spring.datasource.username=test5
spring.datasource.password=test5

# The SQL dialect makes Hibernate generate better SQL for the chosen database
spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.PostgreSQLDialect

# Hibernate ddl auto (create, create-drop, validate, update)
# Allows for auto creation of tables
spring.jpa.hibernate.ddl-auto = update
```

## Models and Migrations

JPA/Hibernate manages all of our database needs and will auto generate the tables based our Entities/Models when we first access them, so no need for migrations like in other setups.

So let's create another folder in our code folder (demo) called entities.

Let's create our first entity!

```java
package learning.java.demo.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Turtle {

    //**************************************** */
    //  Entity Properties
    //**************************************** */

    @Id //Denotes this property as the id/primary key
    @GeneratedValue(strategy = GenerationType.AUTO) //auto generates
    public Integer id;

    public String name;

    public Integer age;

    //**************************************** */
    //  Constructors
    //**************************************** */

    public Turtle(){

    }

    public Turtle(String name, Integer age){
        this.name = name;
        this.age = age;
    }

    //**************************************** */
    //  GETTERS AND SETTERS
    //**************************************** */

    public Integer getId(){
        return this.id;
    }

    public void setId(Integer id){
        this.id = id;
    }

    public String getName(){
        return this.name;
    }

    public void setName(String name){
        this.name = name;
    }

    public Integer getAge(){
        return this.age;
    }

    public void setAge(Integer age){
        this.age = age;
    }
}
```

#### Creating Our Repository

Our entity works very similar to a mongoose schema in that it defines the shape of our data, but a repository is like a mongoose model with functions that allow us to actually add, update and delete data in the database. Create another folder called repositories and create a file called TurtleRepository.java inside of it.

```java
package learning.java.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import learning.java.demo.entities.Turtle;

// Our Repository, the two types in <> are the Entity and type of the ID
public interface TurtleRepository extends JpaRepository<Turtle, Integer>{

}
```

That's it time to make another controller and put this repository to work.

## Using the Model

In the controllers folder create TurtleController.java

```java
package learning.java.demo.controllers;

import org.springframework.web.bind.annotation.RestController;

@RestController
public class TurtleController {

}
```

In order to use our repository we to receive it in two steps...

- Create a property we can store the repository in

- Add the repository as an argument to the controllers constructor so spring passes an instance of the repository to our controller which we can store in the property.

```java
    // Property to hold Turtle Repository
    public TurtleRepository Turtles;

    // Receive Turtle Repository via Dependency Injection
    public TurtleController(TurtleRepository Turtles){
        this.Turtles = Turtles;
    }
```

#### index

- get request to "/turtles/" that returns all turtles

```java
package learning.java.demo.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import learning.java.demo.repositories.TurtleRepository;
import learning.java.demo.entities.Turtle;

@RestController
public class TurtleController {

    // Property to hold Turtle Repository
    public TurtleRepository Turtles;

    // Receive Turtle Repository via Dependency Injection
    public TurtleController(TurtleRepository Turtles){
        this.Turtles = Turtles;
    }

    // get request to /turtles
    @GetMapping("/turtles")
    public List<Turtle> index(){
        return Turtles.findAll();
    }
}
```

#### Show

- get request to /turtles/:id to get a particular turtle

```java
    // get request to /turtles/:id
    @GetMapping("/turtles/{id}")
    public Optional<Turtle> show(@PathVariable Integer id){
        return Turtles.findById(id);
    }
```

#### Create

- post request to /turtles to create a turtle

```java
    @PostMapping("/turtles")
    public List<Turtle> create(@RequestBody Turtle newTurtle){
        Turtles.save(newTurtle); // Create the New Turtle
        return Turtles.findAll();
    }
```

#### Update

```java
    @PutMapping("/turtles/{id}")
    public List<Turtle> update(@RequestBody Turtle fixTurtle, @PathVariable Integer id){
        // Find turtle by it's then use map to update it
        Turtles.findById(id).map(turtle -> {

        turtle.setName(fixTurtle.getName());
        turtle.setAge(fixTurtle.getAge());
        Turtles.save(turtle);
        return turtle;

        });
        
        // return all turtles
        return Turtles.findAll();
    }
```


#### Destroy
```java
    @DeleteMapping("/turtles/{id}")
    public List<Turtle> destroy(@PathVariable Integer id){
        Turtles.deleteById(id);
        return Turtles.findAll();
    }
```

Test your API, make sure all the routes work as expected then let's head into lab!
---

## Resources to Learn More
-[JPA Documentation](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/#reference)
---
