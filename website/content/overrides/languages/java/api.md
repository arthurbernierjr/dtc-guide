---
title: "Spring Boot: building and deploying an API"
version: "4.1.2"
lede: "Build a /todos CRUD API with Spring Boot 4.1, Spring Data JPA and Postgres, enable CORS for a frontend, test it with Postman or curl, then deploy it with a managed Postgres on Railway."
updated_from: "the 2021 'Full Stack Build Part 1' lesson (Spring Boot 2.4, javax.persistence, Heroku)"
verified: 2026-11-07
docs:
  - https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html
  - https://docs.spring.io/spring-boot/reference/web/servlet.html
  - https://docs.spring.io/spring-boot/reference/features/external-config.html
  - https://docs.spring.io/spring-boot/reference/actuator/endpoints.html
  - https://docs.spring.io/spring-boot/how-to/deployment/cloud.html
  - https://docs.spring.io/spring-boot/tutorial/first-application/index.html
  - https://docs.railway.com/guides/spring-boot
  - https://docs.railway.com/guides/postgresql
  - https://docs.railway.com/guides/variables
  - https://docs.railway.com/guides/healthchecks
  - https://railpack.com/languages/java
exec: not run
verified_note: "Deployed on Railway on 2026-11-07 with Spring Boot 4.1.2 and Java 25. Health was UP. Create returned 201, show 200, a missing id was 404, put updated the row, delete returned 204. The project was removed after the proof. The repo is github.com/arthurbernierjr/dtc-java-api."
changes:
  - "Heroku's free tier ended in November 2022 and `system.properties` is Heroku-specific; the deploy section is rewritten for Railway (build from the GitHub repo, managed Postgres, `RAILPACK_JDK_VERSION=25`, generated domain, `/actuator/health` as the health check) and the same settings work on Render or Fly.io."
  - "`javax.persistence.*` is `jakarta.persistence.*` (Spring Boot 3+/Jakarta EE); the starter is `spring-boot-starter-webmvc`; Spring Boot Actuator is added for the health endpoint."
  - "Database settings read Railway's `PGHOST`/`PGPORT`/`PGDATABASE`/`PGUSER`/`PGPASSWORD` variables through `${VAR:default}` placeholders, so one application.properties works locally and in production; the unnecessary Hibernate dialect line is gone and the file is fenced as `properties`, not `yaml`."
  - "`@CrossOrigin` moved from every method to the class (Spring supports class-level CORS), with the global `WebMvcConfigurer` alternative shown for locking origins down before launch."
  - "Bug fixed: `update` ignored a missing id and returned the whole list; show/update now 404 on a missing id, create returns 201 with the saved todo, delete returns 204. Entity fields are `private`, the id is a `Long` identity column, and the repository field is `private final todos` instead of a public `Todos`."
  - "Testing is spelled out as curl commands next to the Postman steps; resources link Spring's CORS reference and Railway's docs instead of third-party blog posts."
---

# Full Stack Build Part 1 - Building and Deploying an API

---

## What you will learn

- Creating an API
- Setting CORS headers
- Testing an API
- Deploying an API

---

## Setup

- Generate a new project at [start.spring.io](https://start.spring.io/): Maven · Java · Spring Boot 4.1.2 · Group `learning.java` · Artifact `todos` · Java 25
- Dependencies: **Spring Web**, **Spring Data JPA**, **PostgreSQL Driver**, **Spring Boot DevTools**, **Spring Boot Actuator**
- Generate, unzip, open the `todos` folder in your editor
- `createdb javatodos`, then add your database settings to `src/main/resources/application.properties` (the version below is already set up for deployment):

`src/main/resources/application.properties`

```properties
# Local values are the defaults after the colon; the host overrides them with environment variables
spring.datasource.url=jdbc:postgresql://${PGHOST:localhost}:${PGPORT:5432}/${PGDATABASE:javatodos}
spring.datasource.username=${PGUSER:test5}
spring.datasource.password=${PGPASSWORD:test5}

spring.jpa.hibernate.ddl-auto=update

# Listen on the port the host assigns (Railway, Render and Fly.io all set PORT); 8080 locally
server.port=${PORT:8080}
```

- `./mvnw spring-boot:run` and check that [localhost:8080/actuator/health](http://localhost:8080/actuator/health) answers `{"status":"UP"}` — Actuator's health endpoint, which also checks the database connection.

**WHY `${VAR:default}`:** Spring Boot reads properties from `application.properties` *and* from environment variables, with the environment winning. The placeholder syntax gives each setting a local default and lets a host supply the real value without a second config file.

## Creating the API

#### Creating Our Todo Entity

- Create an `entities` package in the code folder (`src/main/java/learning/java/todos`) with `Todo.java`

`src/main/java/learning/java/todos/entities/Todo.java`

```java
package learning.java.todos.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Todo {

    // **************************************** //
    //  Entity properties
    // **************************************** //

    @Id // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Postgres identity column
    private Long id;

    private String subject;

    private String details;

    // **************************************** //
    //  Constructors
    // **************************************** //

    protected Todo() {
        // required by JPA
    }

    public Todo(String subject, String details) {
        this.subject = subject;
        this.details = details;
    }

    // **************************************** //
    //  Getters and setters
    // **************************************** //

    public Long getId() {
        return this.id;
    }

    public String getSubject() {
        return this.subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDetails() {
        return this.details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
```

#### Create a New Repository

`src/main/java/learning/java/todos/repositories/TodoRepository.java`

```java
package learning.java.todos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import learning.java.todos.entities.Todo;

// The two types are the entity and the type of its id
public interface TodoRepository extends JpaRepository<Todo, Long> {

}
```

#### Creating Our Controller

Last we make our controller. This time we add `@CrossOrigin` so browsers allow a frontend on another origin (your React dev server on `localhost:5173`, your deployed site) to call the API. Putting it on the class applies it to every route.

`src/main/java/learning/java/todos/controllers/TodoController.java`

```java
package learning.java.todos.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import learning.java.todos.entities.Todo;
import learning.java.todos.repositories.TodoRepository;

@RestController
@RequestMapping("/todos")
@CrossOrigin // enable CORS for every route in this controller (all origins while developing)
public class TodoController {

    private final TodoRepository todos;

    // Receive the repository via dependency injection
    public TodoController(TodoRepository todos) {
        this.todos = todos;
    }

    // GET /todos
    @GetMapping
    public List<Todo> index() {
        return todos.findAll();
    }

    // GET /todos/:id
    @GetMapping("/{id}")
    public ResponseEntity<Todo> show(@PathVariable Long id) {
        return ResponseEntity.of(todos.findById(id)); // 200 with the todo, or 404
    }

    // POST /todos
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Todo create(@RequestBody Todo newTodo) {
        return todos.save(newTodo); // comes back with its id
    }

    // PUT /todos/:id
    @PutMapping("/{id}")
    public ResponseEntity<Todo> update(@PathVariable Long id, @RequestBody Todo fixTodo) {
        return todos.findById(id)
                .map(todo -> {
                    todo.setSubject(fixTodo.getSubject());
                    todo.setDetails(fixTodo.getDetails());
                    return ResponseEntity.ok(todos.save(todo));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /todos/:id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> destroy(@PathVariable Long id) {
        if (!todos.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        todos.deleteById(id);
        return ResponseEntity.noContent().build(); // 204
    }

}
```

`@CrossOrigin` with no arguments allows every origin, every header and the methods the handler is mapped to; credentials (cookies) are off. Before real users arrive, name your frontend instead: `@CrossOrigin(origins = "https://my-frontend.example.com")`. If you'd rather configure CORS once for the whole app, drop the annotation and add a configuration class:

`src/main/java/learning/java/todos/CorsConfig.java`

```java
package learning.java.todos;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/todos/**")
                        .allowedOrigins("http://localhost:5173", "https://my-frontend.example.com")
                        .allowedMethods("GET", "POST", "PUT", "DELETE");
            }
        };
    }
}
```

## Testing the API

- Start the server: `./mvnw spring-boot:run`
- Create 3 todos with POST requests to `/todos` (JSON body, `Content-Type: application/json` header)
- See the todos with a GET request to `/todos`
- Fetch one todo with a GET request to `/todos/:id`
- Update a todo with a PUT request to `/todos/:id`
- Delete a todo with a DELETE request to `/todos/:id` — expect 204 and no body
- Try a made-up id — expect 404

The same run in `curl`:

```bash
curl -X POST localhost:8080/todos -H "Content-Type: application/json" \
  -d '{"subject": "Learn Spring", "details": "controllers, entities, repositories"}'
curl localhost:8080/todos
curl localhost:8080/todos/1
curl -X PUT localhost:8080/todos/1 -H "Content-Type: application/json" \
  -d '{"subject": "Learn Spring Boot 4", "details": "and deploy it"}'
curl -X DELETE -i localhost:8080/todos/1
```

Checking CORS without a frontend: send a request with an `Origin` header and look for `Access-Control-Allow-Origin` in the response — `curl -i -H "Origin: http://localhost:5173" localhost:8080/todos`.

## Deploying the API

Any host that can run `java -jar` works; the free-to-start choice here is **Railway**, which builds Maven and Gradle projects without a Dockerfile and provides Postgres as a service in the same project. The steps map directly onto Render and Fly.io.

- Commit and push the project to a GitHub repository (the generated `.gitignore` already excludes `target/`).

- On Railway, create a **New Project → Deploy from GitHub repo** and pick the repository. Railway's builder (Railpack) detects `pom.xml`, builds with `./mvnw … install -DskipTests` and starts the jar with `java -Dserver.port=$PORT -jar target/*.jar`.

- Railpack's default JDK is 21 and this project compiles for 25, so on the API service open **Variables** and add `RAILPACK_JDK_VERSION` = `25`. (Alternatively set `<java.version>21</java.version>` in `pom.xml` — Spring Boot 4 is happy with 17 through 27.)

- Add a database: **+ New → Database → PostgreSQL**. The new service exposes `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` and `DATABASE_URL`.

- Hand those to the API with **reference variables** so you never paste a password. In the API service's Variables tab add:

```env
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
```

  (`Postgres` is the database service's name; the dashboard autocompletes it.) Because `application.properties` reads exactly these names, no code changes are needed. Railway's `DATABASE_URL` (`postgresql://user:password@host:port/db`) is *not* a JDBC URL, which is why we assemble `jdbc:postgresql://host:port/db` from the parts ourselves.

- Under the API service's **Settings → Networking**, click **Generate Domain** to get a public `https://….up.railway.app` URL. Under **Settings → Deploy**, set the health check path to `/actuator/health`; Railway only switches traffic to a new deploy once that returns 2xx.

- Railway redeploys on every push to the connected branch. Watch **Deploy Logs** for the Spring banner and `Tomcat started on port …`.

Now test the deployed API in Postman: `https://<your-domain>/todos` — and you're ready for the frontend.

**WHY a Dockerfile is optional:** if you ever need full control (a specific base image, JVM flags), add a `Dockerfile` that runs `./mvnw -DskipTests package` and `java -jar target/*.jar`; Railway's Spring Boot guide has one, and Railway uses it automatically when present.

---

## Resources to Learn More

- [CORS in Spring MVC](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html) — `@CrossOrigin`, global configuration, credentials
- [Spring Boot: externalized configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html) — property precedence, `${VAR:default}`, environment variable binding
- [Actuator endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html) — `/actuator/health` and what else you can expose
- [Deploying to the cloud](https://docs.spring.io/spring-boot/how-to/deployment/cloud.html) — Spring's own notes on buildpacks, `PORT` and `server.port`
- [Railway: Deploy a Spring Boot app](https://docs.railway.com/guides/spring-boot), [PostgreSQL](https://docs.railway.com/guides/postgresql), [variables](https://docs.railway.com/guides/variables) and [healthchecks](https://docs.railway.com/guides/healthchecks)

---
