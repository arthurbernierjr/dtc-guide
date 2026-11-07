# Full Stack Build Part 1 - Building and Deploying an API

---

## What you will learn

- Creating an API
- Setting Cors Headers
- Testing an API
- Deploying an API

---

## Setup

- In VSCode use the Command Palette to generate a new spring project
- Add Spring Web, JPA and Postgres as dependencies
- add your database settings to application.properties
- reopen vscode in your projects folder
- hit f5 and try out your development server

## Creating the API

#### Creating Our Todo Entitry

- Create an Entities Folder with Todo.Java

```java
package learning.java.demo.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Todo {

    //**************************************** */
    //  Entity Properties
    //**************************************** */

    @Id //Denotes this property as the id/primary key
    @GeneratedValue(strategy = GenerationType.AUTO) //auto generates
    public Integer id;

    public String subject;

    public String details;

    //**************************************** */
    //  Constructors
    //**************************************** */

    public Todo(){

    }

    public Todo(String subject, String details){
        this.subject = subject;
        this.details = details;
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

    public String getSubject(){
        return this.subject;
    }

    public void setSubject(String subject){
        this.subject = subject;
    }

    public String getDetails(){
        return this.details;
    }

    public void setDetails(String details){
        this.details = details;
    }
}
```

#### Create a New Repository

```java
package learning.java.demo.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import learning.java.demo.entities.Todo;

// Our Repository, the two types in <> are the Entity and type of the ID
public interface TodoRepository extends JpaRepository<Todo, Integer>{

}
```

#### Creating Our Controller

Last we make our controller, this time we'll add the @CrossOrigins annotation to enable CORS Headers so our frontend can access the page.

```java
package learning.java.demo.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import learning.java.demo.repositories.TodoRepository;
import learning.java.demo.entities.Todo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
public class TodoController {

    // Property to hold Todo Repository
    public TodoRepository Todos;

    // Receive Todo Repository via Dependency Injection
    public TodoController(TodoRepository Todos){
        this.Todos = Todos;
    }

    // get request to /Todos
    @CrossOrigin // Enable CORS <-
    @GetMapping("/todos")
    public List<Todo> index(){
        return Todos.findAll();
    }

    // get request to /Todos/:id
    @CrossOrigin // Enable CORS <-
    @GetMapping("/todos/{id}")
    public Optional<Todo> show(@PathVariable Integer id){
        return Todos.findById(id);
    }

    @CrossOrigin // Enable CORS <-
    @PostMapping("/todos")
    public List<Todo> create(@RequestBody Todo newTodo){
        Todos.save(newTodo); // Create the New Todo
        return Todos.findAll();
    }

    @CrossOrigin // Enable CORS <-
    @PutMapping("/todos/{id}")
    public List<Todo> update(@RequestBody Todo fixTodo, @PathVariable Integer id){
        // Find Todo by it's then use map to update it
        Todos.findById(id).map(Todo -> {

        Todo.setSubject(fixTodo.getSubject());
        Todo.setDetails(fixTodo.getDetails());
        Todos.save(Todo);
        return Todo;

        });

        // return all Todos
        return Todos.findAll();
    }

    @CrossOrigin // Enable CORS <-
    @DeleteMapping("/todos/{id}")
    public List<Todo> destroy(@PathVariable Integer id){
        Todos.deleteById(id);
        return Todos.findAll();
    }

}
```

## Testing the API

- Turn on your server with f5 (run > debugging)

- create 3 Todos with posts request to /todos

- see those todos with get request to /todos

- try and one todo with a get request to /todos/:id

- update a todo with a put request /todos/:id

- delete a todo with a delete request to /todos/:id

## Deploying the API

- in the root of your project where the pom.xml lives add a system.properties file with the follow:

```
java.runtime.version=11
```

- Update your application.properties to receive the database details from an env variable list so.

```yaml
# Database Settings
# spring.datasource.url=jdbc:postgresql://localhost:5432/javaspringtest
spring.datasource.url=${DATABASE_URL}
# spring.datasource.username=test5
# spring.datasource.password=test5

# The SQL dialect makes Hibernate generate better SQL for the chosen database
spring.jpa.properties.hibernate.dialect = org.hibernate.dialect.PostgreSQLDialect

# Hibernate ddl auto (create, create-drop, validate, update)
spring.jpa.hibernate.ddl-auto = update
```

- commit and push to github.com

- go to Heroku and create a new project

- under deploys select deploy by Github

- connect your repo

- enable automatic deploys

- trigger a manual deploy

Now test your deployed app and your ready to go!

---

## Resources to Learn More

- [Cors in Java Spring](https://spring.io/blog/2015/06/08/cors-support-in-spring-framework)
- [Environment Variables in Spring](https://blog.indrek.io/articles/using-environment-variables-with-spring-boot/)
- [Response Headers in Spring](https://www.techiedelight.com/add-header-to-response-spring-boot/)

---
