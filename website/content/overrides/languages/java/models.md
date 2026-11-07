---
title: "Spring Boot: models and migrations"
version: "4.1.2"
lede: "Point Spring Boot 4.1 at Postgres, write a Jakarta Persistence entity and a Spring Data JPA repository, let Hibernate create the table, and expose full CRUD from a controller."
updated_from: "the 2021 'Opinionated Framework - Models & Migrations' lesson (Spring Boot 2.4, javax.persistence)"
verified: 2026-11-02
docs:
  - https://docs.spring.io/spring-boot/reference/data/sql.html
  - https://docs.spring.io/spring-boot/how-to/data-initialization.html
  - https://docs.spring.io/spring-boot/reference/using/build-systems.html
  - https://docs.spring.io/spring-data/jpa/reference/jpa/getting-started.html
  - https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html
  - https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html
  - https://jakarta.ee/specifications/persistence/3.2/
  - https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html
  - https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html
exec: not run
verified_note: "Dependency coordinates, every `spring.*` property, the `jakarta.persistence` annotations, the repository methods and the Spring MVC annotations were checked against the Spring Boot 4.1.2, Spring Data JPA and Jakarta Persistence 3.2 documentation listed (Boot 4.1.2 manages jakarta.persistence-api 3.2.0, Hibernate 7.4 and the 42.7 Postgres driver). There is no JDK or Postgres on the build machine, so nothing was compiled or run against a database."
changes:
  - "`javax.persistence.*` is now `jakarta.persistence.*`: Spring Boot 3+ moved to Jakarta EE and the old imports do not compile against Boot 4 (Jakarta Persistence 3.2, Hibernate 7)."
  - "Dependencies are added by editing `pom.xml` (`spring-boot-starter-data-jpa` plus the `org.postgresql:postgresql` driver at runtime scope) or re-generating at start.spring.io, instead of a VS Code-only 'Add Starters' command; a Gradle equivalent is shown."
  - "Removed `spring.jpa.properties.hibernate.dialect`: Hibernate 6+ detects the dialect from the JDBC connection, and the file is fenced as `properties`, not `yaml`. The `ddl-auto` values and the fact that the default is `none` for Postgres are spelled out, with a pointer to Flyway/Liquibase for real migrations."
  - "Entity fields are `private` (they were `public` and also had getters), the id is a `Long` generated with `GenerationType.IDENTITY` (a Postgres identity column), and the no-argument constructor JPA requires is explained."
  - "Bug fixed: `update` silently returned the full list when the id did not exist. Show/update now return `ResponseEntity` with 404 for a missing id, create returns the saved turtle with its new id (201), and delete returns 204 — instead of every route returning `findAll()`."
  - "The repository field is `private final turtles` (was a public field named `Turtles`), the class carries a single `@RequestMapping(\"/turtles\")`, and a derived query (`findByName`) shows what Spring Data generates for you."
---

# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- How to create models and migrations
- How to use models to add, update, and delete records

---

## Setup

- We will keep using the `demo` project from this morning's lesson.
- Add two dependencies to `pom.xml`, inside `<dependencies>`: Spring Data JPA (the ORM layer) and the Postgres JDBC driver. No versions needed — the Spring Boot parent manages them.

`pom.xml`

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

(Gradle: `implementation 'org.springframework.boot:spring-boot-starter-data-jpa'` and `runtimeOnly 'org.postgresql:postgresql'`. Or tick **Spring Data JPA** and **PostgreSQL Driver** on start.spring.io and copy the generated block.)

- Your editor will offer to reload the Maven project; accept, or run `./mvnw dependency:resolve`.

**WHY two dependencies:** JPA (Jakarta Persistence) is the standard API for mapping classes to tables, Hibernate is the implementation Spring Boot ships, Spring Data JPA writes the repository code on top, and the driver is what actually speaks to Postgres.

## Setting Up the Database Settings

- Create a local Postgres database: `createdb javaspringtest`

Open `src/main/resources/application.properties` and add the following. *Use the username and password of your local Postgres.*

`src/main/resources/application.properties`

```properties
# Database settings (Spring Boot picks the driver from the jdbc: URL)
spring.datasource.url=jdbc:postgresql://localhost:5432/javaspringtest
spring.datasource.username=test5
spring.datasource.password=test5

# Hibernate schema management: none (default for Postgres), validate, update, create, create-drop.
# update creates missing tables and columns on startup, which is what we want while learning.
spring.jpa.hibernate.ddl-auto=update

# Log the SQL Hibernate runs (handy today, noisy in production)
spring.jpa.show-sql=true
```

Start the app. If the credentials are wrong it fails fast with a connection error; if they are right, nothing visible happens yet — Hibernate has nothing to create.

**WHY no migrations today:** with `ddl-auto=update`, Hibernate compares your entities to the database on every start and adds what is missing. That is enough for a lesson. Real projects set it to `validate` and manage schema changes with versioned SQL files through Flyway or Liquibase (`spring-boot-starter-flyway`), which Spring Boot runs automatically on startup — the equivalent of `rails db:migrate`.

## Models and Migrations

An **entity** is a class mapped to a table. Create an `entities` package in the code folder and inside it:

`src/main/java/learning/java/demo/entities/Turtle.java`

```java
package learning.java.demo.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity // maps this class to a table named turtle
public class Turtle {

    // **************************************** //
    //  Entity properties
    // **************************************** //

    @Id // this field is the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Postgres identity column, assigned on insert
    private Long id;

    private String name;

    private Integer age;

    // **************************************** //
    //  Constructors
    // **************************************** //

    // JPA needs a no-argument constructor to build instances from rows
    protected Turtle() {
    }

    public Turtle(String name, Integer age) {
        this.name = name;
        this.age = age;
    }

    // **************************************** //
    //  Getters and setters (JPA, Jackson and you use these)
    // **************************************** //

    public Long getId() {
        return this.id;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return this.age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
```

The imports are `jakarta.persistence.*` — the old `javax.persistence` names you'll see in pre-2022 tutorials do not work with Spring Boot 3 or 4. The table and column names are derived from the class and field names (`turtle`, `id`, `name`, `age`); `@Table(name = "…")` and `@Column(name = "…")` override that when you need to. Restart the app and look at the log: Hibernate issues `create table turtle (…)` for you.

#### Creating Our Repository

The entity defines the shape of the data, like a Mongoose schema; the **repository** is what you call to query and save, like a Mongoose model — except you only declare an interface and Spring Data JPA generates the implementation at startup. Create a `repositories` package and inside it:

`src/main/java/learning/java/demo/repositories/TurtleRepository.java`

```java
package learning.java.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import learning.java.demo.entities.Turtle;

// The two types are the entity and the type of its id
public interface TurtleRepository extends JpaRepository<Turtle, Long> {

    // A derived query: Spring Data parses the method name and writes the SQL
    List<Turtle> findByName(String name);

}
```

`JpaRepository` gives you `findAll()`, `findById(id)` (returns an `Optional`), `save(entity)`, `existsById(id)`, `deleteById(id)`, `count()` and paging/sorting overloads. Method names like `findByAgeGreaterThan(int age)` or `findByNameContainingIgnoreCase(String part)` are turned into queries for you.

That's it — time to make another controller and put this repository to work.

## Using the Model

In the `controllers` package create `TurtleController.java`.

To use the repository we receive it through **constructor injection**: declare a field, add a constructor parameter of the repository type, and Spring passes the implementation in when it creates the controller.

`src/main/java/learning/java/demo/controllers/TurtleController.java`

```java
package learning.java.demo.controllers;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import learning.java.demo.entities.Turtle;
import learning.java.demo.repositories.TurtleRepository;

@RestController
@RequestMapping("/turtles") // every route in this class starts with /turtles
public class TurtleController {

    // Field to hold the repository; final because it never changes after construction
    private final TurtleRepository turtles;

    // Spring calls this constructor and supplies the repository (dependency injection)
    public TurtleController(TurtleRepository turtles) {
        this.turtles = turtles;
    }

    // GET /turtles
    @GetMapping
    public List<Turtle> index() {
        return turtles.findAll();
    }
}
```

Start the app and GET `localhost:8080/turtles` — an empty array. Now the rest of the routes; each one needs its imports (`PathVariable`, `PostMapping`, `PutMapping`, `DeleteMapping`, `RequestBody`, `ResponseStatus` from `org.springframework.web.bind.annotation`; `HttpStatus` and `ResponseEntity` from `org.springframework.http`).

#### Show

- GET `/turtles/:id` returns one turtle, or 404 if the id doesn't exist

```java
    // GET /turtles/:id
    @GetMapping("/{id}")
    public ResponseEntity<Turtle> show(@PathVariable Long id) {
        // findById returns Optional<Turtle>; ResponseEntity.of maps empty to 404
        return ResponseEntity.of(turtles.findById(id));
    }
```

#### Create

- POST `/turtles` with a JSON body creates a turtle and returns it with its new id

```java
    // POST /turtles
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // 201 instead of the default 200
    public Turtle create(@RequestBody Turtle newTurtle) {
        return turtles.save(newTurtle); // save returns the persisted entity, id filled in
    }
```

Spring builds the `Turtle` from the JSON using the no-argument constructor and the setters. Leave `id` out of the body — the database assigns it, and `save` hands back the entity with the value filled in.

#### Update

- PUT `/turtles/:id` with a JSON body changes a turtle's name and age

```java
    // PUT /turtles/:id
    @PutMapping("/{id}")
    public ResponseEntity<Turtle> update(@PathVariable Long id, @RequestBody Turtle fixTurtle) {
        // Find the turtle, copy the new values onto it, save, and wrap in a 200;
        // if the Optional is empty, answer 404 instead
        return turtles.findById(id)
                .map(turtle -> {
                    turtle.setName(fixTurtle.getName());
                    turtle.setAge(fixTurtle.getAge());
                    return ResponseEntity.ok(turtles.save(turtle));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
```

The `map` / `orElseGet` pair is how you work with an `Optional` without `if (x.isPresent())`; it is the same idea as `?.` plus `??` in JavaScript.

#### Destroy

- DELETE `/turtles/:id` removes a turtle

```java
    // DELETE /turtles/:id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> destroy(@PathVariable Long id) {
        if (!turtles.existsById(id)) {
            return ResponseEntity.notFound().build(); // 404
        }
        turtles.deleteById(id);
        return ResponseEntity.noContent().build(); // 204, no body
    }
```

Test your API: create a few turtles with POST (`{"name": "Wilbert", "age": 5}` and the header `Content-Type: application/json`), list them, fetch one, update one, delete one, and check that a made-up id gives 404. Then let's head into lab!

---

## Resources to Learn More

- [Spring Boot: SQL databases](https://docs.spring.io/spring-boot/reference/data/sql.html) — `spring.datasource.*`, connection pools, `spring.jpa.*`
- [Database initialization](https://docs.spring.io/spring-boot/how-to/data-initialization.html) — `ddl-auto`, `schema.sql`, Flyway and Liquibase
- [Spring Data JPA: core concepts](https://docs.spring.io/spring-data/jpa/reference/repositories/core-concepts.html) and [query methods](https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html) — what `JpaRepository` gives you and how `findBy…` names become queries
- [Jakarta Persistence 3.2](https://jakarta.ee/specifications/persistence/3.2/) — the specification behind `@Entity`, `@Id`, `@GeneratedValue` and friends
- [`ResponseEntity`](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responseentity.html) — setting status codes and headers from a controller

---
