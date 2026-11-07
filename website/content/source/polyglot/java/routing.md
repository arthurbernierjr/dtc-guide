# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- Java openSDK 11 or Higher
- VSCode with Java Extensions and Java Spring Extension Pack
- Postgres 11 or Higher

## What is an opinionated framework?

Most web frameworks for building full-stack websites or APIs/Microservices fall into one of two categories.

- **Minimalist:** Like express, these frameworks provide you the basic features to create a web server leaving it up to you to decide which libraries to use for connecting to databases, encryption, authentication, etc. and how to structure your files and folders in your workflow.

- **Opinionated:** These frameworks usually come with CLI tools that allow you to spin-up new projects with pre-defined projects structures, conventions and all the libraries for full functionality already built in.

These are the main web frameworks across many languages:

| Language   | Minimalist     | Opinionated       |
| ---------- | -------------- | ----------------- |
| Javascript | Express, Koa   | Nest, Foal, Sails |
| Python     | Flash, FastAPI | Django, Masonite  |
| Ruby       | Sinatra        | Ruby on Rails     |
| PHP        | Slim           | Laravel           |
| GO         | Echo           | Buffalo, Revel    |
| Rust       | Warp           | Rocket            |
| Java       |                | Spring Boot       |
| C#         |                | .Net              |
| Dart       |                | Aqueduct, Angel   |
| Kotlin     | kTor, Javalin  | Spring Boot       |
| Swift      |                | Vapor, Kitura     |

## Setting Up the Project

- In VSCode open the command palette (ctrl/command + shift + p)
- Look up the Spring Initalizer and Initialize a new Maven project (Maven plays the role of NPM in Java)
- choose a version (2.4.3 as of writing this)
- choose Java (but hey, you can learn Kotlin or Groovy and use the same framework!)
- For groupID put learning.java
- For artifact ID accept the default demo
- The select to package it as a JAR
- Your Java Version (mine was 11)
- For Dependencies only select Spring Web for now and hit enter
- then select where the project folder should be generated

## How to run in Development

- Re-open your vscode in your project project folder (demo)
- hit f5 to trigger the VSCode code runner and select Java
- You'll see the debugger output, go to localhost:8080 and you should see `WhiteLabel Error Page` meaning your server is working

## Creating a Controller

Controllers are classes that have functions that handle incoming requests. In src/main/java/learning/java/demo (going further I'll call this our code folder) create a folder called controllers. In the controllers folder create a file called...

src/main/java/learning/java/demo/controllers/FirstController.java

```java
package learning.java.demo.controllers;

import org.springframework.web.bind.annotation.RestController;

// This annotation tells spring this class is a Controller
@RestController
public class FirstController {

}
```

Make sure to type any annotations or classes slowly, the Java tools will recognize them and allow you to not just autocomplete but also auto import them for you as well.

Let's write our first route...

```java
package learning.java.demo.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// This annotation tells spring this class is a Controller
@RestController
public class FirstController {

    @GetMapping("/") //This will use the function below for get requests to "/"
    public String first(){
        return "Hello World";
    }
}
```

Restart your server and visit localhost:8080/ to see our String.

Let's make another route that sends over an ArrayList of Integers as a response!
_make sure to let VSCode import ArrayList for you_

```java
    @GetMapping("/numbers") // handles get requests to "/numbers"
    public ArrayList<Integer> numbers(){
        ArrayList<Integer> arr = new ArrayList<Integer>();
        arr.add(1);
        arr.add(2);
        arr.add(3);
        return arr;
    }
```

Go to localhost:8080/numbers and checkout the result

One more route where we return a HashMap
_Make sure to let VSCode import HashMap for You_

```java
    @GetMapping("/hash") // handles get requests to "/hash"
    public HashMap<String, String> hash(){
        HashMap<String, String> myself = new HashMap<String, String>();
        myself.put("name", "Alex Merced");
        myself.put("age", "35");
        return myself;
    }
```

Go to localhost:8080/hash to see the result.

## Using URL Params

Let's make a route that grab a url param, follow below!

```java
    @GetMapping("/param/{myparam}") //get requests to /param/:myparam
    public String para(@PathVariable String myparam){
        return myparam;
    }
```

Go to localhost:8080/param/itworks

Then go to Go to localhost:8080/param/stillworks

## Accessing URL Queries

Let's see if we can also grab url queries, we'll use our param route to grab some queries.

```java
    @GetMapping("/param/{myparam}") //get requests to /param/:myparam
    public String para(@PathVariable String myparam, @RequestParam("myquery") String myquery){
        return myparam + " " + myquery;
    }
```

- go to localhost:8080/param/GettingAQuery?myquery=YouDidIt

## Accessing the Request Body

Let's make another route that let's us get the request body!

```java
    @PostMapping("/getthebody") //get requests to /param/:myparam
    public HashMap<String, String> getBody(@RequestBody HashMap<String, String> body){
        return body;
    }
```

In postman, make a Post request to localhost:8080/getthebody and include some json in the body and you should get it back!

 Now, time for lab!

## Resources to Learn More
- [Spring Web Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web.html)
---
