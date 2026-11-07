---
title: "ASP.NET Core: setup and routing"
version: "10.0"
lede: "Scaffold an ASP.NET Core 10 Web API with controllers, read the generated Program.cs, then write controller actions reached by conventional routes and by attribute routes, reading URL params, query strings and JSON bodies."
updated_from: "the 2021 'Opinionated Framework Part 1' lesson (.NET 5, Startup.cs, Heroku CLI)"
verified: 2026-11-02
docs:
  - https://learn.microsoft.com/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/web-api/?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/fundamentals/routing?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/mvc/controllers/routing?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/fundamentals/openapi/aspnetcore-openapi?view=aspnetcore-10.0
  - https://learn.microsoft.com/dotnet/core/tools/dotnet-new-sdk-templates
  - https://learn.microsoft.com/dotnet/core/tools/dotnet-watch
  - https://learn.microsoft.com/dotnet/csharp/language-reference/keywords/namespace
  - https://dotnet.microsoft.com/download
exec: not run
verified_note: "Every command, file name, attribute and API on this page was checked against the ASP.NET Core 10 and .NET SDK 10 docs listed above (template options against the `dotnet new` reference, Program.cs against the Web API tutorial, route behaviour against the controller-routing article). There is no .NET SDK on the build machine, so the project was not scaffolded or run."
changes:
  - ".NET 5 (end of life May 2022) replaced by .NET 10 LTS. `dotnet new webapi` now generates a minimal API by default, so the scaffold command is `dotnet new webapi --use-controllers -o firstdotnet`; the generated project has no `Startup.cs` — services and the pipeline live in a top-level `Program.cs` built with `WebApplication.CreateBuilder`."
  - "Swashbuckle/Swagger is gone from the template; the built-in `AddOpenApi()`/`MapOpenApi()` serve the document at `/openapi/v1.json`. The dev server listens on the port in `Properties/launchSettings.json` (printed on start), not a fixed 5000."
  - "Bug fixed: the first controller returned `new Hashtable(){\"Result\", \"You Made a Route\"}`, which does not compile (an initializer entry needs its own braces). The controllers return `Dictionary<string, string>`, the generic type that replaced `Hashtable`, and `System.Text.Json` serialises it."
  - "The attribute-routed controller derives from `ControllerBase` with `[ApiController]`, the shape the Web API tutorial uses; the request-body echo binds to `JsonElement` so any JSON object round-trips."
  - "Prerequisites drop the Heroku CLI (free tier ended November 2022) and Docker (not needed until the deploy lesson), name the C# Dev Kit extension for VS Code, and point at the official docs instead of a dev.to article."
  - "Framework table corrected: Flask (not 'Flash'), ASP.NET Core minimal APIs vs MVC for C#, Dart's shelf/Serverpod (Aqueduct and Angel were abandoned), Ktor, Vapor (Kitura was discontinued)."
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

- .NET 10 SDK installed from [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download) (`dotnet --version` prints `10.0.x`)
- Postgres installed (not used until the models lesson; any supported version works)
- VS Code with the [C# Dev Kit](https://code.visualstudio.com/docs/csharp/get-started) extension, or any editor
- Postman or `curl` for making requests

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

ASP.NET Core is both: the same framework gives you **minimal APIs** (`app.MapGet("/", () => "hi")` in one file, Express-style) and **MVC controllers** (classes, attributes, conventions). We use controllers here because they map most directly onto Rails, Django and Spring; routing and binding work the same way in minimal APIs.

## Setting Up the Project

- To create a new Web API project with controllers:

```bash
dotnet new webapi --use-controllers -o firstdotnet
cd firstdotnet
```

**WHY** `--use-controllers`: since .NET 8, plain `dotnet new webapi` generates a minimal API (one `Program.cs`, no `Controllers` folder). The flag gives you the controller layout this lesson uses.

- Look at what was generated: `firstdotnet.csproj` (the project file — package references go here), `Program.cs` (startup), `Controllers/WeatherForecastController.cs` (a sample controller), `appsettings.json` / `appsettings.Development.json` (configuration) and `Properties/launchSettings.json` (dev-server ports and environment).

- Start the server with `dotnet run`. The terminal prints `Now listening on: http://localhost:5xxx` — the port is picked per project and lives in `launchSettings.json`. Open that URL plus `/weatherforecast` and you get JSON. In Development the template also serves an OpenAPI description of your routes at `/openapi/v1.json` (the Swagger UI from older templates is no longer bundled; Postman can import that file).

- `Ctrl+C` stops the server. `dotnet watch` runs it with hot reload so you do not have to restart after every edit.

## Creating a Controller

A controller is a class whose methods (**actions**) are triggered by routes: combinations of URL and HTTP verb. The starting point of the application is `Program.cs`. There is no `Startup.cs` any more — the *builder pattern* does both jobs in one top-level file: register services on `builder.Services`, build the app, describe the request pipeline on `app`.

Make sure to add the `MapControllerRoute` call for pattern routing below:

`Program.cs`

```cs
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();   // collects all our controllers for routing
builder.Services.AddOpenApi();       // generates /openapi/v1.json

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// Attribute routing: controllers that carry [Route] / [HttpGet] attributes
app.MapControllers();

// Pattern (conventional) routing: URL segments pick the controller and action
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

Note there is no `using` block and no `namespace` — the Web SDK turns on implicit usings, so `WebApplication` and friends are already in scope.

###### Pattern Routing

- This line sets up a style of routing called **conventional** (or pattern) routing:

```cs
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
```

So when a request comes in, the server assumes the first part of the URL is the controller name (`first` → `FirstController`; the `Controller` suffix is implied), the second is the method of the controller, and optionally the third part is saved in a route value called `id` that an action can receive as a parameter. `=Home` and `=Index` are the defaults when a segment is missing; `?` makes `id` optional.

In the `Controllers` folder create a `FirstController.cs` file with the following.

`Controllers/FirstController.cs`

```cs
using Microsoft.AspNetCore.Mvc;

namespace firstdotnet.Controllers;

public class FirstController : Controller
{
    // This route would match /first/first
    public Dictionary<string, string> First()
    {
        return new Dictionary<string, string> { ["Result"] = "You Made a Route" };
    }
}
```

Whatever object an action returns is serialised to JSON by `System.Text.Json`, so the dictionary comes out as `{"Result":"You Made a Route"}`. The `namespace firstdotnet.Controllers;` line with a semicolon is a *file-scoped namespace* — it covers the whole file without wrapping everything in braces.

- We can now test our app by running `dotnet run` and visiting `http://localhost:5xxx/first/first` (use the port printed in your terminal).

#### Getting the URL Param

We just need to give the action a parameter with the same name as the route token (`id`) and model binding fills it in.

```cs
// This route would match /first/second/{id}
public Dictionary<string, string> Second(string id)
{
    return new Dictionary<string, string> { ["PARAM"] = id };
}
```

- Restart your server (or let `dotnet watch` do it) and visit `http://localhost:5xxx/first/second/something` in the browser.

#### Getting a URL Query

- Add this to your controller

```cs
// This would match /first/third?query={anything}
public Dictionary<string, string> Third(string? query)
{
    return new Dictionary<string, string> { ["query"] = query ?? "no query" };
}
```

- Restart your server and go to `http://localhost:5xxx/first/third?query=itworks`

Model binding looks for a value named `query` in the route values first, then the query string, then form fields. The parameter is `string?` because the query may be missing, and `??` supplies the fallback.

#### Attribute Routing

Conventional routing is what MVC websites use; the docs recommend **attribute routing** for REST APIs — URL and verb declared right on the class and method. Create another controller class, `SecondController.cs`:

`Controllers/SecondController.cs`

```cs
using Microsoft.AspNetCore.Mvc;

namespace firstdotnet.Controllers;

[ApiController]
[Route("theurl")] // defines the URL prefix for every action in the controller
public class SecondController : ControllerBase
{
    [HttpGet] // GET request to /theurl
    public Dictionary<string, string> First()
    {
        return new Dictionary<string, string> { ["Result"] = "You Made a Route" };
    }
}
```

Two differences from `FirstController`: it derives from `ControllerBase` (`Controller` minus the view-rendering helpers an API never uses), and `[ApiController]` switches on API conventions — attribute routing becomes required, validation errors return a 400 automatically, and complex parameters are read from the request body without you saying so.

- Restart your server and go to `http://localhost:5xxx/theurl`

#### Adding a Param to an Attribute Route

Add this to `SecondController`

```cs
[HttpGet("{urlParam}")] // GET request to /theurl/{urlParam}
public Dictionary<string, string> Second(string urlParam)
{
    return new Dictionary<string, string> { ["Result"] = urlParam };
}
```

- Restart your server and go to `http://localhost:5xxx/theurl/anotherparam` in the browser

The method's template is appended to the controller's: `theurl` + `{urlParam}`. You can constrain it — `[HttpGet("{id:int}")]` only matches digits and binds an `int`, so a non-numeric id is a 404 at the router instead of an exception in your code.

##### Getting the Request Body

```cs
using System.Text.Json; // add at the top of the file

[HttpPost] // POST request to /theurl
public JsonElement Third([FromBody] JsonElement body)
{
    return body; // echo the JSON back
}
```

- Restart your server and use Postman (or `curl`) to make a POST request to `/theurl` with a JSON body and the `Content-Type: application/json` header; the same JSON comes back.

```bash
curl -X POST http://localhost:5xxx/theurl \
  -H "Content-Type: application/json" \
  -d '{"hello": "body"}'
```

`JsonElement` is "any JSON value" from `System.Text.Json`. Tomorrow the body binds to a model class instead (`Turtle turtle`), which is what a real API wants: the framework validates the shape and you get typed properties.

- Time to head to lab

---

## Resources to Learn More

- [Tutorial: Create a web API with ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0) — the official walk-through, controllers plus EF Core
- [Routing to controller actions](https://learn.microsoft.com/aspnet/core/mvc/controllers/routing?view=aspnetcore-10.0) — conventional vs attribute routing, tokens, constraints
- [Routing in ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/routing?view=aspnetcore-10.0) — the routing engine underneath controllers and minimal APIs
- [Create web APIs with ASP.NET Core](https://learn.microsoft.com/aspnet/core/web-api/?view=aspnetcore-10.0) — `ControllerBase`, `[ApiController]`, binding-source inference
- [Minimal APIs](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-10.0) — the other, Express-shaped half of ASP.NET Core

---
