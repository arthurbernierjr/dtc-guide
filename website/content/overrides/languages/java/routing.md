---
title: "Spring Boot: setup and routing"
version: "4.1.2"
lede: "Generate a Spring Boot 4.1 project at start.spring.io, run it with the Maven wrapper, write a @RestController, and read path variables, query strings and JSON bodies."
updated_from: "the 2021 'Opinionated Framework Part 1' lesson (Spring Boot 2.4, Java 11)"
verified: 2026-11-02
docs:
  - https://docs.spring.io/spring-boot/system-requirements.html
  - https://docs.spring.io/spring-boot/tutorial/first-application/index.html
  - https://start.spring.io/
  - https://docs.spring.io/spring-boot/reference/using/build-systems.html
  - https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html
  - https://docs.spring.io/spring-boot/reference/using/devtools.html
  - https://docs.spring.io/spring-boot/maven-plugin/using.html
  - https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html
  - https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html
  - https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html
exec: not run
verified_note: "Every command, annotation and import on this page was checked against the Spring Boot 4.1.2 and Spring Framework 7 reference pages listed, and the starter names against start.spring.io's dependency metadata for Boot 4.1.2 (`web` resolves to spring-boot-starter-webmvc). There is no JDK on the build machine, so nothing was generated, compiled or run."
changes:
  - "Spring Boot 2.4.3 on Java 11 is now Spring Boot 4.1.2 (Spring Framework 7, Jakarta EE 11), which requires Java 17+; the page recommends Java 25 LTS and uses start.spring.io, which works with any editor, instead of a VS Code-only wizard."
  - "The web starter is `spring-boot-starter-webmvc` in Boot 4 — `spring-boot-starter-web` is deprecated — and start.spring.io's 'Spring Web' now resolves to it."
  - "Running the app: `./mvnw spring-boot:run` (or `./gradlew bootRun`) with the generated wrappers replaces 'hit F5'; DevTools is added so saves restart the server instead of restarting by hand."
  - "Controller examples return `List`/`Map` interface types built with `List.of`/`Map.of`, show the imports explicitly, and the request-body route is a `@PostMapping` with a `Map<String, Object>` body (the original's comment and `HashMap<String, String>` type would reject numeric JSON values)."
  - "Framework table corrected: Flask (not 'Flash'), Hono, Gin, chi, Axum, ASP.NET Core, Dart's shelf/Serverpod (Aqueduct and Angel were abandoned), Ktor, Vapor (Kitura was discontinued)."
  - "Resources link the current Spring Boot tutorial and the Spring Framework 7 reference pages for each annotation instead of the retired single-page HTML manual."
---

# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- A JDK, version 17 or newer (Spring Boot 4 requires it; Java 25 is the current LTS and what we use). Check with `java -version`.
- An editor with Java support: VS Code with the *Extension Pack for Java* and *Spring Boot Extension Pack*, or IntelliJ IDEA Community. Either gives you auto-imports, which matter in Java.
- Postgres 14 or newer installed (not used until the models lesson).
- Postman or `curl` for sending requests.

## What is an opinionated framework?

Most web frameworks for building full-stack websites or APIs/microservices fall into one of two categories.

- **Minimalist:** Like Express, these frameworks provide the basic features to create a web server, leaving it up to you to decide which libraries to use for databases, encryption, authentication, etc., and how to structure your files and folders.

- **Opinionated:** These frameworks usually come with CLI tools that spin up new projects with a pre-defined structure, conventions and all the libraries for full functionality already built in.

The main web frameworks across many languages:

| Language   | Minimalist           | Opinionated          |
| ---------- | -------------------- | -------------------- |
| JavaScript | Express, Koa, Hono   | NestJS, AdonisJS     |
| Python     | Flask, FastAPI       | Django               |
| Ruby       | Sinatra              | Ruby on Rails        |
| PHP        | Slim                 | Laravel, Symfony     |
| Go         | chi, net/http, Echo  | —                    |
| Rust       | Axum, Actix Web      | Loco                 |
| Java       | Javalin              | Spring Boot          |
| C#         | ASP.NET Core minimal APIs | ASP.NET Core MVC |
| Dart       | shelf                | Serverpod            |
| Kotlin     | Ktor, Javalin        | Spring Boot          |
| Swift      | Hummingbird          | Vapor                |

Spring Boot is the opinionated layer on top of the Spring Framework: it picks the web server (Tomcat), the JSON library, the logging, and wires them together from the dependencies you declare, so a web API is a generated project plus one annotated class.

## Setting Up the Project

Spring projects are generated by **Spring Initializr**. Go to [start.spring.io](https://start.spring.io/) (the same form is built into IntelliJ and the VS Code Spring extension) and choose:

- Project: **Maven** (Maven plays the role of npm in Java; Gradle is the alternative and everything below has a Gradle equivalent)
- Language: **Java**
- Spring Boot: **4.1.2** (the default; avoid SNAPSHOT and RC versions)
- Group: `learning.java` · Artifact: `demo` · Packaging: **Jar** · Java: **25**
- Dependencies: **Spring Web** and **Spring Boot DevTools**

Click **Generate**, unzip the download and open the `demo` folder in your editor. The important files:

- `pom.xml` — the Maven build file (your `package.json`). Spring Web appears as `spring-boot-starter-webmvc`.
- `mvnw` / `mvnw.cmd` — the Maven wrapper, so nobody needs Maven installed.
- `src/main/java/learning/java/demo/DemoApplication.java` — the entry point. Going forward I'll call `src/main/java/learning/java/demo` our **code folder**; everything you write goes in it or a sub-package of it, because `@SpringBootApplication` scans from this package down.
- `src/main/resources/application.properties` — configuration (empty for now).

`src/main/java/learning/java/demo/DemoApplication.java`

```java
package learning.java.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Configuration + auto-configuration + component scanning, in one annotation
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

}
```

## How to run in Development

From the `demo` folder:

```bash
./mvnw spring-boot:run
```

(On Windows: `mvnw.cmd spring-boot:run`. Gradle projects: `./gradlew bootRun`. Every IDE also has a run button on `DemoApplication`.)

The first run downloads dependencies and takes a minute; afterwards you'll see the Spring banner and `Tomcat started on port 8080`. Open [http://localhost:8080](http://localhost:8080) — the **Whitelabel Error Page** (a 404) means the server is running and simply has no routes yet. `Ctrl-C` stops it.

**WHY DevTools:** with `spring-boot-devtools` on the classpath, the app restarts itself whenever compiled classes change. In IntelliJ that means on build (`Ctrl/Cmd-F9`); in VS Code, on save. Without it you restart `spring-boot:run` by hand after every edit.

## Creating a Controller

Controllers are classes whose methods handle incoming requests. In the code folder create a `controllers` package (folder) and inside it:

`src/main/java/learning/java/demo/controllers/FirstController.java`

```java
package learning.java.demo.controllers;

import org.springframework.web.bind.annotation.RestController;

// This annotation tells Spring this class is a controller whose return values are the response body
@RestController
public class FirstController {

}
```

Type annotations and class names slowly: the Java tools recognise them and offer to auto-import. Every `import` you see below is one of those.

Let's write our first route:

```java
package learning.java.demo.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FirstController {

    @GetMapping("/") // this method handles GET requests to "/"
    public String first() {
        return "Hello World";
    }
}
```

Save (restart if you skipped DevTools) and visit [localhost:8080/](http://localhost:8080/) to see the string.

`@GetMapping`, `@PostMapping`, `@PutMapping`, `@PatchMapping` and `@DeleteMapping` are shortcuts for `@RequestMapping(method = …)`, one per HTTP verb. Whatever the method returns becomes the response: a `String` is sent as text; anything else is converted to JSON by Jackson, which Spring Web brings in.

Let's make another route that sends a list of integers as a response (let the editor import `java.util.List`):

```java
    @GetMapping("/numbers") // handles GET requests to "/numbers"
    public List<Integer> numbers() {
        return List.of(1, 2, 3);   // an immutable list; new ArrayList<>() works too
    }
```

Go to [localhost:8080/numbers](http://localhost:8080/numbers) and you get `[1,2,3]`.

One more route where we return a map (import `java.util.Map`):

```java
    @GetMapping("/hash") // handles GET requests to "/hash"
    public Map<String, Object> hash() {
        return Map.of("name", "Arthur", "age", 35);
    }
```

Go to [localhost:8080/hash](http://localhost:8080/hash) to see the JSON object. A `Map` serialises to a JSON object, a `List` to an array, and — next lesson — your own classes to objects keyed by their getters.

## Using URL Params

Path segments in braces are **URI template variables**; `@PathVariable` binds one to a method argument, converting to the declared type (import `org.springframework.web.bind.annotation.PathVariable`):

```java
    @GetMapping("/param/{myparam}") // GET requests to /param/:myparam
    public String param(@PathVariable String myparam) {
        return myparam;
    }
```

Go to [localhost:8080/param/itworks](http://localhost:8080/param/itworks), then [localhost:8080/param/stillworks](http://localhost:8080/param/stillworks).

Spring matches the variable to the argument by *name*, which works because Spring Boot's Maven and Gradle plugins compile with `-parameters`. If you ever build another way, name it explicitly: `@PathVariable("myparam") String myparam`. Declare the argument as `int` or `Long` and a non-numeric segment is rejected with a 400 before your code runs.

## Accessing URL Queries

Query-string values bind with `@RequestParam`. We'll extend the param route (import `org.springframework.web.bind.annotation.RequestParam`):

```java
    @GetMapping("/param/{myparam}") // GET requests to /param/:myparam?myquery=...
    public String param(@PathVariable String myparam,
                        @RequestParam(defaultValue = "no query") String myquery) {
        return myparam + " " + myquery;
    }
```

- go to [localhost:8080/param/GettingAQuery?myquery=YouDidIt](http://localhost:8080/param/GettingAQuery?myquery=YouDidIt)
- then to `/param/GettingAQuery` without the query

A `@RequestParam` is required by default — leave it off and Spring answers 400 Bad Request. `defaultValue` (or `required = false`, or an `Optional<String>` argument) makes it optional. Type conversion applies here too: `@RequestParam int page` works.

## Accessing the Request Body

Let's make another route that gives us the request body. `@RequestBody` reads the body and deserialises it into the argument type (import `org.springframework.web.bind.annotation.PostMapping` and `RequestBody`):

```java
    @PostMapping("/getthebody") // POST requests to /getthebody
    public Map<String, Object> getBody(@RequestBody Map<String, Object> body) {
        return body;
    }
```

In Postman, make a POST request to `localhost:8080/getthebody` with the header `Content-Type: application/json` and some JSON in the body; the same JSON comes back. With curl:

```bash
curl -X POST localhost:8080/getthebody \
  -H "Content-Type: application/json" \
  -d '{"hello": "body", "count": 3}'
```

`Map<String, Object>` accepts any JSON object (values can be strings, numbers, booleans, nested objects). Tomorrow the argument becomes one of your own classes, and Spring fills its fields from the matching JSON keys.

Now, time for lab!

## Resources to Learn More

- [Developing Your First Spring Boot Application](https://docs.spring.io/spring-boot/tutorial/first-application/index.html) — the official walk-through, Maven and Gradle side by side
- [Spring Initializr](https://start.spring.io/) and the [starters list](https://docs.spring.io/spring-boot/reference/using/build-systems.html) — what each dependency checkbox adds
- [Request mapping](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-requestmapping.html) — `@RequestMapping`, URI patterns, `consumes`/`produces`
- [`@RequestParam`](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestparam.html) and [`@RequestBody`](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html) — binding details, validation
- [Developer Tools](https://docs.spring.io/spring-boot/reference/using/devtools.html) — automatic restart and what triggers it

---
