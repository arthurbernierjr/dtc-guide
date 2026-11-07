---
title: "Entity Framework Core: models and migrations"
version: "10.0"
lede: "Add EF Core 10 and the Npgsql provider to the ASP.NET Core project, keep the Postgres connection string out of git, define a model and its DbContext, generate and run a migration, then expose full CRUD from an attribute-routed controller."
updated_from: "the 2021 'Opinionated Framework - Models & Migrations' lesson (.NET 5, EF Core 5, Npgsql 5, Startup.cs)"
verified: 2026-11-02
docs:
  - https://learn.microsoft.com/ef/core/get-started/overview/first-app
  - https://learn.microsoft.com/ef/core/managing-schemas/migrations/
  - https://learn.microsoft.com/ef/core/cli/dotnet
  - https://learn.microsoft.com/ef/core/dbcontext-configuration/
  - https://learn.microsoft.com/ef/core/querying/
  - https://www.npgsql.org/efcore/
  - https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL
  - https://learn.microsoft.com/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/fundamentals/configuration/?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/security/app-secrets?view=aspnetcore-10.0
exec: not run
verified_note: "Package names, `dotnet ef` commands, the DbContext/DbSet shape, `AddDbContext`/`UseNpgsql`, `GetConnectionString`, the Npgsql connection-string keywords and every controller call (`ToListAsync`, `FindAsync`, `Add`, `Remove`, `SaveChangesAsync`, `CreatedAtAction`) were checked against the EF Core 10, ASP.NET Core 10 and Npgsql docs listed above. There is no .NET SDK or Postgres on the build machine, so nothing was compiled, migrated or run."
changes:
  - "Bug fixed: the 2021 setup installed `EntityFramework 6.4.4`, which is the old .NET Framework ORM, not Entity Framework Core — the Npgsql provider pulls in EF Core itself. The packages are now `Npgsql.EntityFrameworkCore.PostgreSQL` (10.x, which brings EF Core 10) and `Microsoft.EntityFrameworkCore.Design`, unpinned."
  - "`Startup.cs` is gone: the context is registered in `Program.cs` with `builder.Services.AddDbContext`, and the connection string is read with `builder.Configuration.GetConnectionString()` from the standard `ConnectionStrings` section instead of a custom `DBContextSettings` key."
  - "The connection string lives in `appsettings.Development.json` (with `dotnet user-secrets` shown for anything you do not want on disk) and `.gitignore` comes from `dotnet new gitignore`, rather than ignoring the whole `appsettings.json` the app needs to start."
  - "Model properties are `Id`/`Name`/`Age` (PascalCase, `string?` under nullable reference types) and the `DbSet` uses `Set<Turtle>()`, matching the EF Core conventions and the Web API tutorial."
  - "Bug fixed: `show`, `update` and `destroy` called `FirstOrDefault` and then dereferenced the result, so a missing id crashed with a 500. The controller uses `FindAsync` and returns 404; POST returns 201 with a `Location` header, PUT the updated record, DELETE 204."
  - "The controller is `[ApiController]` + `ControllerBase` and fully async (`ToListAsync`, `SaveChangesAsync`), the shape the ASP.NET Core docs use; the `turtles`/`Turtle` name clash from the original is gone."
---

# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- How to create models and migrations
- How to use models to add, update, and delete records

---

## Setup

- Open up the same `firstdotnet` project from this morning
- Add the following packages with NuGet (the .NET package manager, driven from the `dotnet` CLI):

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design
```

**Entity Framework Core** (EF Core) is .NET's ORM. The first package is the Postgres *provider*; it depends on EF Core itself, so EF Core 10 comes along with it. The second is what the `dotnet ef` command-line tools need to build migrations. (`dotnet package add …` is the newer spelling of the same command; both work in .NET 10.)

- Install the EF Core tools once per machine (or `dotnet tool update --global dotnet-ef` if you already have an older one):

```bash
dotnet tool install --global dotnet-ef
dotnet ef --version
```

The tool major version should match the EF Core packages — 10.x with 10.x.

## Setting Up the Database Settings

- Generate the standard .NET `.gitignore` (it covers `bin/`, `obj/` and editor files):

```bash
dotnet new gitignore
```

- Create a Postgres database with the command `createdb firstdotnetdb`

- Add a `ConnectionStrings` section to `appsettings.Development.json`, reflecting your local Postgres username and password. The Development file is read on top of `appsettings.json` whenever `ASPNETCORE_ENVIRONMENT` is `Development`, which is what `dotnet run` sets.

`appsettings.Development.json`

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "TurtleContext": "Host=localhost;Port=5432;Database=firstdotnetdb;Username=test5;Password=test5"
  }
}
```

Npgsql connection strings are `Key=Value;` pairs, not `postgres://` URLs. If you would rather not have a password in a file at all, the **Secret Manager** stores it outside the project folder and the configuration system reads it the same way:

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:TurtleContext" "Host=localhost;Port=5432;Database=firstdotnetdb;Username=test5;Password=test5"
```

**WHY:** configuration is layered — `appsettings.json`, then `appsettings.{Environment}.json`, then user secrets (Development only), then environment variables. In production the same key arrives as the environment variable `ConnectionStrings__TurtleContext` (double underscore for the colon), and no code changes.

#### Creating Our Model

Create a `Models` folder and create a file called `Turtle.cs`.

`Models/Turtle.cs`

```cs
namespace firstdotnet.Models;

public class Turtle
{
    public long Id { get; set; }
    public string? Name { get; set; }
    public int Age { get; set; }
}
```

Pretty straightforward: the properties of the class become the columns of the table. By convention a property called `Id` (or `TurtleId`) is the primary key and is generated by the database. `string?` says the column may be null; with nullable reference types on (the default), a plain `string` would be a warning until you gave it a value.

Now we need a **database context** for our model — the class that connects models to the database. Create `TurtleContext.cs` in the `Models` folder.

`Models/TurtleContext.cs`

```cs
using Microsoft.EntityFrameworkCore;

namespace firstdotnet.Models;

public class TurtleContext : DbContext
{
    public TurtleContext(DbContextOptions<TurtleContext> options) : base(options)
    {
    }

    // One DbSet per table. A context can hold many; you can also create several contexts.
    public DbSet<Turtle> Turtles => Set<Turtle>();
}
```

Now that we have our context we register it as a service so controllers can receive it through dependency injection. In `Program.cs`, before `builder.Build()`:

`Program.cs`

```cs
using firstdotnet.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Register the db context as a service; read the connection string from configuration
builder.Services.AddDbContext<TurtleContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("TurtleContext")));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

`GetConnectionString("TurtleContext")` is shorthand for `builder.Configuration["ConnectionStrings:TurtleContext"]`.

#### Migrations

We should be all wired up! Now let's have EF Core migrate our database.

- Create the initial migration. EF Core reads your context and models and writes a `Migrations/` folder with a C# file describing the table:

```bash
dotnet ef migrations add InitialCreate
```

- Then apply it to the database:

```bash
dotnet ef database update
```

Open `Migrations/<timestamp>_InitialCreate.cs` — that file *is* the table definition, and it goes in git with the rest of the code. Every time you change a model, run `migrations add <Name>` again and `database update` to apply it. (The tools need the project to build, so fix compile errors first.)

We're good to go — now we just need to build the controller!

## Using the Model

We will use attribute routing. Create a new controller, `TurtleController.cs`, in the `Controllers` folder.

`Controllers/TurtleController.cs`

```cs
using firstdotnet.Models;
using Microsoft.AspNetCore.Mvc;   // Route and Http attributes, ControllerBase
using Microsoft.EntityFrameworkCore; // ToListAsync

namespace firstdotnet.Controllers;

[ApiController]
[Route("turtles")] // The controller handles routes for /turtles
public class TurtleController : ControllerBase
{
    // property to hold the database context
    private readonly TurtleContext _db;

    // constructor receives the context via dependency injection
    public TurtleController(TurtleContext db)
    {
        _db = db;
    }

    [HttpGet] // GET /turtles
    public async Task<IEnumerable<Turtle>> Index()
    {
        // return all the turtles
        return await _db.Turtles.ToListAsync();
    }

    [HttpGet("{id}")] // GET /turtles/{id}
    public async Task<ActionResult<Turtle>> Show(long id)
    {
        var turtle = await _db.Turtles.FindAsync(id);
        if (turtle is null)
        {
            return NotFound(); // 404 instead of a null reference crash
        }
        return turtle;
    }

    [HttpPost] // POST /turtles
    public async Task<ActionResult<Turtle>> Create(Turtle turtle)
    {
        _db.Turtles.Add(turtle);
        await _db.SaveChangesAsync(); // nothing hits the database until SaveChanges
        // 201 Created with a Location header pointing at the new turtle
        return CreatedAtAction(nameof(Show), new { id = turtle.Id }, turtle);
    }

    [HttpPut("{id}")] // PUT /turtles/{id}
    public async Task<ActionResult<Turtle>> Update(long id, Turtle turtle)
    {
        var existing = await _db.Turtles.FindAsync(id);
        if (existing is null)
        {
            return NotFound();
        }
        // change the tracked entity's properties; SaveChanges writes an UPDATE
        existing.Name = turtle.Name;
        existing.Age = turtle.Age;
        await _db.SaveChangesAsync();
        return existing;
    }

    [HttpDelete("{id}")] // DELETE /turtles/{id}
    public async Task<IActionResult> Destroy(long id)
    {
        var turtle = await _db.Turtles.FindAsync(id);
        if (turtle is null)
        {
            return NotFound();
        }
        _db.Turtles.Remove(turtle);
        await _db.SaveChangesAsync();
        return NoContent(); // 204
    }
}
```

A few things to notice:

- `[ApiController]` reads the `Turtle` parameter on `Create` and `Update` from the JSON body without a `[FromBody]`, and answers 400 on its own if the JSON does not fit the model.
- `ActionResult<Turtle>` lets an action return either a turtle (200, serialised to JSON) or a status such as `NotFound()`.
- Everything is `async`/`await`: database calls are I/O, and `ToListAsync`, `FindAsync` and `SaveChangesAsync` free the thread while Postgres works — same idea as `await` in Node.
- `_db.Turtles` is an `IQueryable`; chain LINQ on it and EF Core turns it into SQL: `_db.Turtles.Where(t => t.Age > 5).OrderBy(t => t.Name).ToListAsync()`.

Test all the routes with Postman or `curl`:

```bash
curl -X POST http://localhost:5xxx/turtles -H "Content-Type: application/json" -d '{"name": "Wilbert", "age": 5}'
curl http://localhost:5xxx/turtles
curl -X PUT http://localhost:5xxx/turtles/1 -H "Content-Type: application/json" -d '{"name": "Dilbert", "age": 6}'
curl -X DELETE http://localhost:5xxx/turtles/1
```

Property names arrive and leave as camelCase (`name`, `age`) — `System.Text.Json` converts to and from the PascalCase properties for you. You've done it, head to lab!

---

## Resources to Learn More

- [Getting started with EF Core](https://learn.microsoft.com/ef/core/get-started/overview/first-app) — model, context, migrations and queries in one pass
- [Migrations overview](https://learn.microsoft.com/ef/core/managing-schemas/migrations/) — how `migrations add` and `database update` work and how to handle changes
- [EF Core tools reference (.NET CLI)](https://learn.microsoft.com/ef/core/cli/dotnet) — every `dotnet ef` command and option
- [Querying data](https://learn.microsoft.com/ef/core/querying/) and [saving data](https://learn.microsoft.com/ef/core/saving/basic) — LINQ to SQL, tracking, `SaveChanges`
- [Npgsql EF Core provider](https://www.npgsql.org/efcore/) — Postgres-specific types, connection string keywords, `UseNpgsql` options
- [Configuration in ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/configuration/?view=aspnetcore-10.0) — appsettings, environments, environment variables, user secrets

---
