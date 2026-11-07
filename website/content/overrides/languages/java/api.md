---
title: "Spring Boot: building and deploying an API"
framework: Spring Boot
version: "4.1.2"
lede: "Build the /todos CRUD API with Spring Boot 4.1, Spring Data JPA, Bean Validation and Postgres, open CORS for a frontend, test it with curl and the contract check, then deploy it from a Dockerfile with a managed Postgres on Railway."
updated_from: "the 2021 'Full Stack Build Part 1' lesson (Spring Boot 2.4, javax.persistence, Heroku)"
verified: 2026-11-07
docs:
  - https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html
  - https://docs.spring.io/spring-boot/reference/web/servlet.html
  - https://docs.spring.io/spring-boot/reference/features/external-config.html
  - https://docs.spring.io/spring-boot/reference/io/validation.html
  - https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-advice.html
  - https://docs.spring.io/spring-boot/how-to/deployment/cloud.html
  - https://docs.spring.io/spring-boot/tutorial/first-application/index.html
  - https://docs.railway.com/guides/dockerfiles
  - https://docs.railway.com/guides/postgresql
  - https://docs.railway.com/guides/variables
  - https://docs.railway.com/guides/healthchecks
exec: ran
verified_note: "Deployed to Railway on 2026-11-07 from commit 3b566abcaec66552435a70bc616367e211e563b2 of github.com/arthurbernierjr/dtc-java-api, live at https://api-production-c419.up.railway.app; `node check.mjs https://api-production-c419.up.railway.app` printed 16/16 PASS (health, CORS preflights, list shape, three 400 cases, create 201, show, 404s, update, delete 204). Every whole-file block on this page is the file in that repo. No Java toolchain ran on the build machine."
changes:
  - "Aligned with the shared Todos contract: `/health` replaces `/actuator/health`, blank or missing `subject`/`details` are a 400 with a JSON body instead of a saved empty row, every 404 carries `{\"error\":\"not found\"}`, the list is ordered by id, CORS is one `WebMvcConfigurer` open to any origin instead of `@CrossOrigin`, and Railway builds the Maven multi-stage `Dockerfile` instead of Railpack with `RAILPACK_JDK_VERSION`."
  - "Heroku's free tier ended in November 2022 and `system.properties` is Heroku-specific; the deploy section is rewritten for Railway (build from the GitHub repo via the Dockerfile, managed Postgres with reference variables, generated domain, `/health` as the health check) and the same Dockerfile works on Render or Fly.io."
  - "`javax.persistence.*` is `jakarta.persistence.*` (Spring Boot 3+/Jakarta EE); the Boot 4 web starter is `spring-boot-starter-webmvc`; `spring-boot-starter-validation` is added for `@NotBlank` and `@Valid`."
  - "Database settings read Railway's `PGHOST`/`PGPORT`/`PGDATABASE`/`PGUSER`/`PGPASSWORD` variables through `${VAR:default}` placeholders, so one application.properties works locally and in production; the unnecessary Hibernate dialect line is gone."
  - "Bug fixed: `update` ignored a missing id and returned the whole list; show/update/delete now 404 on a missing id, create returns 201 with the saved todo, delete returns 204. Entity fields are `private`, the id is a `Long` identity column, and the repository field is `private final todos` instead of a public `Todos`."
  - "Testing is spelled out as curl commands with expected status codes plus the shared `check.mjs` contract check; resources link Spring's and Railway's docs instead of third-party blog posts."
---

# Full Stack Build Part 1 - Building and Deploying an API

---

## What you will learn

- Creating an API
- Setting CORS headers
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

Every backend guide on this site builds this same API: no trailing slashes, objects that contain exactly `id`, `subject` and `details`, and CORS open to any origin so the four frontend guides can point at any of them. The finished Spring Boot example is [github.com/arthurbernierjr/dtc-java-api](https://github.com/arthurbernierjr/dtc-java-api), live at [api-production-c419.up.railway.app](https://api-production-c419.up.railway.app).

---

## Setup

- Generate a new project at [start.spring.io](https://start.spring.io/): Maven · Java · Spring Boot 4.1.2 · Group `learning.java` · Artifact `todos` · Java 25
- Dependencies: **Spring Web**, **Validation**, **Spring Data JPA**, **PostgreSQL Driver**, **Spring Boot Actuator**
- Generate, unzip, open the `todos` folder in your editor. The `pom.xml` you end up with (version `0.0.1`, which the Dockerfile below relies on):

`pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.2</version>
  </parent>
  <groupId>learning.java</groupId>
  <artifactId>todos</artifactId>
  <version>0.0.1</version>
  <properties>
    <java.version>25</java.version>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
```

- `createdb javatodos`, then put your database settings in `src/main/resources/application.properties` (this version is already set up for deployment):

`src/main/resources/application.properties`

```env
spring.datasource.url=jdbc:postgresql://${PGHOST:localhost}:${PGPORT:5432}/${PGDATABASE:javatodos}
spring.datasource.username=${PGUSER:postgres}
spring.datasource.password=${PGPASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=update
server.port=${PORT:8080}
```

- `./mvnw spring-boot:run` and check that [localhost:8080/todos](http://localhost:8080/todos) answers `[]`. The generated `TodosApplication.java` main class stays exactly as start.spring.io wrote it.

**WHY `${VAR:default}`:** Spring Boot reads `application.properties` *and* environment variables, with the environment winning. The placeholder gives each setting a local default and lets a host supply the real value without a second config file. `ddl-auto=update` has Hibernate create the `todo` table on first boot, so there is no migration step.

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
import jakarta.validation.constraints.NotBlank;

@Entity
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String subject;

    @NotBlank
    private String details;

    protected Todo() {}

    public Long getId() { return id; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
```

- `@Id` plus `@GeneratedValue(IDENTITY)` is a Postgres identity column, so the JSON you POST never carries an id.
- `@NotBlank` (from `spring-boot-starter-validation`) rejects `null`, `""` and `"   "`. No other fields, so the JSON is exactly `id`, `subject`, `details`.
- The `protected` no-argument constructor is for JPA and Jackson, not for your code.

#### Create a New Repository

`src/main/java/learning/java/todos/repositories/TodoRepository.java`

```java
package learning.java.todos.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import learning.java.todos.entities.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long> {}
```

The two type arguments are the entity and the type of its id. `JpaRepository` gives you `findAll`, `findById`, `save`, `existsById` and `deleteById` for free.

#### Creating Our Controller

`src/main/java/learning/java/todos/controllers/TodoController.java`

```java
package learning.java.todos.controllers;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import learning.java.todos.entities.Todo;
import learning.java.todos.repositories.TodoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/todos")
public class TodoController {
    private final TodoRepository todos;

    public TodoController(TodoRepository todos) {
        this.todos = todos;
    }

    @GetMapping
    public List<Todo> index() {
        return todos.findAll(Sort.by("id"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> show(@PathVariable Long id) {
        return todos.findById(id)
            .<ResponseEntity<?>>map(todo -> ResponseEntity.ok(todo))
            .orElseGet(TodoController::notFound);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Todo create(@Valid @RequestBody Todo newTodo) {
        return todos.save(newTodo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody Todo fixTodo) {
        return todos.findById(id).<ResponseEntity<?>>map(todo -> {
            todo.setSubject(fixTodo.getSubject());
            todo.setDetails(fixTodo.getDetails());
            return ResponseEntity.ok(todos.save(todo));
        }).orElseGet(TodoController::notFound);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> destroy(@PathVariable Long id) {
        if (!todos.existsById(id)) return notFound();
        todos.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    static ResponseEntity<Map<String, String>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "not found"));
    }
}
```

- `@RequestMapping("/todos")` prefixes every method; `@GetMapping("/{id}")` is `GET /todos/:id`. Spring does **not** match trailing slashes, so `/todos/` is a 404 — fine, the contract never uses one.
- `findAll(Sort.by("id"))` is the "ordered by id" line of the contract; Postgres returns rows in any order unless you ask.
- `@Valid` runs the `@NotBlank` checks before the method body; a failure throws `MethodArgumentNotValidException`, which the advice below turns into a 400.
- `ResponseEntity<?>` lets one method return either a `Todo` (200) or the `{"error":"not found"}` map (404); the `.<ResponseEntity<?>>map(...)` type witness makes `Optional` accept both.
- `@ResponseStatus(HttpStatus.CREATED)` makes `create` a 201; `noContent()` makes `destroy` a 204 with no body.

#### Turning exceptions into JSON errors

Without this class Spring answers a bad request with its own error page. A `@RestControllerAdvice` catches exceptions from every controller and returns exactly the small bodies the contract names:

`src/main/java/learning/java/todos/controllers/ApiErrors.java`

```java
package learning.java.todos.controllers;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalid(MethodArgumentNotValidException e) {
        return Map.of("error", "subject and details are required");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> unreadable(HttpMessageNotReadableException e) {
        return Map.of("error", "invalid json");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> badId(MethodArgumentTypeMismatchException e) {
        return Map.of("error", "not found");
    }
}
```

- `MethodArgumentNotValidException` → 400, a blank or missing field
- `HttpMessageNotReadableException` → 400, the body was not JSON (or was empty)
- `MethodArgumentTypeMismatchException` → 404, an id like `/todos/abc` that cannot become a `Long`

#### Health check and CORS

`src/main/java/learning/java/todos/controllers/HealthController.java`

```java
package learning.java.todos.controllers;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @GetMapping("/health")
    public Map<String, Boolean> health() {
        return Map.of("ok", true);
    }
}
```

Browsers only let a page on one origin call an API on another when the API says so. Instead of `@CrossOrigin` on each controller, one `WebMvcConfigurer` covers every route, preflight `OPTIONS` requests included:

`src/main/java/learning/java/todos/config/CorsConfig.java`

```java
package learning.java.todos.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Content-Type");
    }
}
```

`allowedOrigins("*")` with `Content-Type` as the only allowed header is enough for every frontend guide on this site; credentials (cookies) stay off. The repo also carries an optional `src/main/resources/static/index.html`, which Spring serves at `/`.

## Testing the API

- Start the server: `./mvnw spring-boot:run`
- Create 3 todos with POST requests to `/todos` (JSON body, `Content-Type: application/json` header) — expect 201
- See the todos with a GET request to `/todos`, fetch one with `/todos/:id`, update one with PUT
- Delete a todo with a DELETE request to `/todos/:id` — expect 204 and no body
- Try a made-up id — expect 404; POST a blank subject — expect 400

The same run in `curl` (`-i` prints the status line):

```bash
curl -i localhost:8080/health                                        # 200 {"ok":true}
curl -i -X POST localhost:8080/todos -H "Content-Type: application/json" \
  -d '{"subject": "Learn Spring", "details": "controllers, entities, repositories"}'   # 201
curl -i localhost:8080/todos                                         # 200 [...]
curl -i localhost:8080/todos/1                                       # 200
curl -i -X PUT localhost:8080/todos/1 -H "Content-Type: application/json" \
  -d '{"subject": "Learn Spring Boot 4", "details": "and deploy it"}'   # 200
curl -i -X POST localhost:8080/todos -H "Content-Type: application/json" \
  -d '{"subject": "   "}'                                            # 400 {"error":"subject and details are required"}
curl -i -X DELETE localhost:8080/todos/1                             # 204, no body
curl -i localhost:8080/todos/1                                       # 404 {"error":"not found"}
```

Checking CORS without a frontend: send a preflight and look for `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Methods` in the response:

```bash
curl -i -X OPTIONS localhost:8080/todos -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type"
```

Run the contract check against your own deploy: `node check.mjs https://your-api.up.railway.app` (copy `check.mjs` from the example repo; Node 18 or later, no packages). All 16 lines should say PASS. It works against `http://localhost:8080` too.

## Deploying the API

Any host that can build a Docker image works; the free-to-start choice here is **Railway**, which builds the repo's `Dockerfile` and provides Postgres in the same project. The same Dockerfile deploys unchanged on Render or Fly.io.

- Add this `Dockerfile` at the project root. The first stage builds the jar with Maven on a JDK 25 image; the second copies only the jar onto a JRE image:

`Dockerfile`

```dockerfile
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /src
COPY pom.xml .
COPY src src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /src/target/todos-0.0.1.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

- Commit and push the project to a GitHub repository. The `.gitignore` excludes `target/`, `.idea` and `.env`.

- On Railway, create a **New Project → Deploy from GitHub repo** and pick the repository. Railway finds the `Dockerfile` and uses it instead of its own builder; the images pin the toolchain (`maven:3.9-eclipse-temurin-25` to build, `eclipse-temurin:25-jre` to run).

- Add a database: **+ New → Database → PostgreSQL**. The new service exposes `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` and `DATABASE_URL`.

- Hand those to the API with **reference variables** so you never paste a password. In the API service's Variables tab add:

```env
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGDATABASE=${{Postgres.PGDATABASE}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
```

  (`Postgres` is the database service's name; the dashboard autocompletes it.) `application.properties` reads exactly these names, so no code changes are needed. Railway's `DATABASE_URL` is *not* a JDBC URL, which is why we assemble `jdbc:postgresql://host:port/db` from the parts. Railway sets `PORT` on its own and `server.port=${PORT:8080}` picks it up.

- There is no migrate step: on the first boot Hibernate's `ddl-auto=update` creates the `todo` table in the Railway database.

- Under the API service's **Settings → Networking**, click **Generate Domain** to get a public `https://….up.railway.app` URL. Under **Settings → Deploy**, set the health check path to `/health`; Railway only switches traffic to a new deploy once that returns 2xx.

- Railway redeploys on every push. Watch **Deploy Logs** for the Spring banner and `Tomcat started on port …`, then run `node check.mjs https://<your-domain>` — and you're ready for the frontend.

**WHY `*` is fine for now:** CORS open to any origin is what lets every frontend guide on this site talk to this API during the lesson. In a real product narrow `allowedOrigins` in `CorsConfig` to the frontend's exact origin before launch.

The deploy this page was verified against ran Java 25.0.5, Spring Boot 4.1.2, Hibernate ORM 7.4.13 and Tomcat 11.0.27 against PostgreSQL 18.6.

---

## Resources to Learn More

- [CORS in Spring MVC](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html) — `@CrossOrigin`, global configuration, credentials
- [Spring Boot: externalized configuration](https://docs.spring.io/spring-boot/reference/features/external-config.html) — property precedence and `${VAR:default}`
- [Validation](https://docs.spring.io/spring-boot/reference/io/validation.html) and [controller advice](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-advice.html) — `@NotBlank`, `@Valid` and turning exceptions into responses
- [Deploying to the cloud](https://docs.spring.io/spring-boot/how-to/deployment/cloud.html) — containers, `PORT` and `server.port`
- [Railway: Dockerfiles](https://docs.railway.com/guides/dockerfiles), [PostgreSQL](https://docs.railway.com/guides/postgresql), [variables](https://docs.railway.com/guides/variables) and [healthchecks](https://docs.railway.com/guides/healthchecks)

---
