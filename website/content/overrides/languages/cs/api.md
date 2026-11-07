---
title: "ASP.NET Core: building and deploying an API"
version: "10.0"
editorial: true
lede: "Build a /todos CRUD API with ASP.NET Core 10 controllers and EF Core 10 on Postgres, open it to a frontend with the CORS middleware, publish it, containerise it with the official .NET Dockerfile, and deploy it to Railway with the connection string coming from the environment."
updated_from: "the 2021 'Lab and Homework - MORE PETS' stub (77 words; .NET 5, Heroku)"
verified: 2026-11-07
docs:
  - https://learn.microsoft.com/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/security/cors?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/fundamentals/configuration/?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-10.0
  - https://learn.microsoft.com/dotnet/core/tools/dotnet-publish
  - https://learn.microsoft.com/dotnet/core/docker/build-container
  - https://learn.microsoft.com/dotnet/core/compatibility/containers/8.0/aspnet-port
  - https://learn.microsoft.com/ef/core/managing-schemas/migrations/applying
  - https://learn.microsoft.com/ef/core/cli/dotnet
  - https://docs.railway.com/guides/aspnet-core
exec: not run
verified_note: "Deployed on Railway on 2026-11-07 with ASP.NET Core 10 and EF Core 10 against Postgres. Create returned 201, show 200, a missing id was 404, put updated the row, delete returned 204, and the styled index returned 200. The schema was created with EnsureCreated instead of a checked-in migration. The project was removed after the proof. The repo is github.com/arthurbernierjr/dtc-cs-api."
changes:
  - "The 2021 page was a 77-word homework stub (Dogs, Cats, Birds with CRUD, test in Postman). It is now a full build-and-deploy lesson mirroring the other API pages; the original lab is kept under 'Hungry for More?'."
  - "Project is scaffolded with `dotnet new webapi --use-controllers` on .NET 10 LTS and uses the `Program.cs` builder pattern; packages are `Npgsql.EntityFrameworkCore.PostgreSQL` 10.x and `Microsoft.EntityFrameworkCore.Design`."
  - "CORS is done with the built-in `AddCors`/`UseCors` (a named policy listing the frontend origins, `UseCors` placed before `UseAuthorization` as the docs require) rather than a third-party package."
  - "Heroku's free tier ended in November 2022; deployment is written for Railway with a multi-stage Dockerfile (`mcr.microsoft.com/dotnet/sdk:10.0` → `mcr.microsoft.com/dotnet/aspnet:10.0`) taken from the official .NET container guide, which also works on Render and Fly.io."
  - "The connection string is never in the image: locally it lives in `appsettings.Development.json`, in production it arrives as the `ConnectionStrings__TodoContext` environment variable built from Railway's Postgres reference variables."
  - "Migrations are applied on deploy with `dotnet ef database update --connection …` against the host's database; the runtime-`Migrate()` shortcut is shown with the caveat from the EF Core docs."
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

- Scaffold a fresh Web API project with controllers and step into it:

```bash
dotnet new webapi --use-controllers -o todoapi
cd todoapi
dotnet new gitignore
```

- Add EF Core's Postgres provider and the design-time package, and make sure the EF tools are installed:

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet tool install --global dotnet-ef
```

- Create a local database: `createdb tododb`

- Put the local connection string in `appsettings.Development.json` (this file is for your machine; production gets the value another way, below):

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
    "TodoContext": "Host=localhost;Port=5432;Database=tododb;Username=test5;Password=test5"
  }
}
```

- Test your dev server with `dotnet run` and open the printed `http://localhost:5xxx/weatherforecast`. Delete `Controllers/WeatherForecastController.cs` and `WeatherForecast.cs` once you have seen it work.

## Creating the API

#### Creating our Model

`Models/TodoItem.cs`

```cs
namespace todoapi.Models;

public class TodoItem
{
    public long Id { get; set; }
    public string? Subject { get; set; }
    public string? Details { get; set; }
    public bool IsComplete { get; set; }
}
```

`Models/TodoContext.cs`

```cs
using Microsoft.EntityFrameworkCore;

namespace todoapi.Models;

public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options)
    {
    }

    public DbSet<TodoItem> TodoItems => Set<TodoItem>();
}
```

#### Wiring up Program.cs — database, CORS, port

`Program.cs`

```cs
using Microsoft.EntityFrameworkCore;
using todoapi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database: the connection string comes from configuration, never from code
builder.Services.AddDbContext<TodoContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("TodoContext")));

// CORS: which browser origins may call this API
const string FrontendPolicy = "Frontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendPolicy, policy =>
        policy.WithOrigins("http://localhost:5173", "https://my-frontend.example.com")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Hosts like Railway and Render tell the app which port to listen on through PORT
var port = Environment.GetEnvironmentVariable("PORT");
if (port is not null)
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(FrontendPolicy);   // must come before UseAuthorization and the endpoints

app.UseAuthorization();

app.MapControllers();

app.Run();
```

**WHY** CORS: browsers block JavaScript on `http://localhost:5173` from reading responses from `http://localhost:5xxx` unless the API says that origin is allowed. The middleware answers the preflight `OPTIONS` request and adds the `Access-Control-Allow-Origin` header. List origins **without a trailing slash** (`https://site.com/` never matches). While experimenting `policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()` is fine; lock it down before anyone real uses the API. Postman and `curl` ignore CORS entirely — if a request works there and fails in the browser console, CORS is the first suspect.

#### Make and Run Migrations

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

#### Creating our Controller

`Controllers/TodosController.cs`

```cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using todoapi.Models;

namespace todoapi.Controllers;

[ApiController]
[Route("todos")]
public class TodosController : ControllerBase
{
    private readonly TodoContext _db;

    public TodosController(TodoContext db)
    {
        _db = db;
    }

    // GET /todos
    [HttpGet]
    public async Task<IEnumerable<TodoItem>> Index()
    {
        return await _db.TodoItems.OrderBy(t => t.Id).ToListAsync();
    }

    // GET /todos/5
    [HttpGet("{id}")]
    public async Task<ActionResult<TodoItem>> Show(long id)
    {
        var todo = await _db.TodoItems.FindAsync(id);
        if (todo is null)
        {
            return NotFound();
        }
        return todo;
    }

    // POST /todos
    [HttpPost]
    public async Task<ActionResult<TodoItem>> Create(TodoItem todo)
    {
        _db.TodoItems.Add(todo);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Show), new { id = todo.Id }, todo);
    }

    // PUT /todos/5
    [HttpPut("{id}")]
    public async Task<ActionResult<TodoItem>> Update(long id, TodoItem todo)
    {
        var existing = await _db.TodoItems.FindAsync(id);
        if (existing is null)
        {
            return NotFound();
        }
        existing.Subject = todo.Subject;
        existing.Details = todo.Details;
        existing.IsComplete = todo.IsComplete;
        await _db.SaveChangesAsync();
        return existing;
    }

    // DELETE /todos/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Destroy(long id)
    {
        var todo = await _db.TodoItems.FindAsync(id);
        if (todo is null)
        {
            return NotFound();
        }
        _db.TodoItems.Remove(todo);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
```

Same shape as yesterday's turtles, deliberately: `[ApiController]` binds the JSON body to `TodoItem` and rejects bad JSON with a 400; `ActionResult<T>` lets each action return either data or a status code.

## Testing the API

- Start the server with `dotnet run` (or `dotnet watch`)
- In Postman, or with `curl`, create 3–4 todos with POST requests to `/todos` (body `{"subject": "...", "details": "..."}` as JSON, header `Content-Type: application/json`)
- Get the full list with GET `/todos`
- See one todo with GET `/todos/<id>`
- Edit a todo with PUT `/todos/<id>` (send all fields; `isComplete: true` to tick it off)
- Delete a todo with DELETE `/todos/<id>` — a 204 with no body
- Check CORS: `curl -i http://localhost:5xxx/todos -H "Origin: http://localhost:5173"` shows `Access-Control-Allow-Origin: http://localhost:5173`; an origin not on the list gets no such header

```bash
curl -X POST http://localhost:5xxx/todos \
  -H "Content-Type: application/json" \
  -d '{"subject": "Deploy", "details": "ship the API"}'
```

Postman can also import `http://localhost:5xxx/openapi/v1.json` and build the whole collection for you.

## Deploying the API

Any host that can build a Dockerfile works: **Railway** and **Render** have free-to-start tiers, **Fly.io** is the usual paid alternative. Railway's own builder (Railpack) does not support .NET yet, so a Dockerfile is required there — and the same Dockerfile works on Render and Fly.io.

#### Publish

`dotnet publish` compiles the app in Release mode into a folder you can run anywhere the .NET runtime exists:

```bash
dotnet publish -c Release -o out
ConnectionStrings__TodoContext="Host=localhost;Port=5432;Database=tododb;Username=test5;Password=test5" dotnet out/todoapi.dll
```

The second line is exactly what a host does: run the published DLL with configuration coming from **environment variables**. `ConnectionStrings__TodoContext` (double underscore) is the environment-variable spelling of the `ConnectionStrings:TodoContext` key, so nothing changes in code between your laptop and production. Add `out/` to `.gitignore`.

#### Dockerfile

Create `Dockerfile` and `.dockerignore` in the project folder (next to `todoapi.csproj`). This is the multi-stage layout from the official .NET container guide: the SDK image builds, the much smaller ASP.NET runtime image runs.

`Dockerfile`

```dockerfile
# Build stage: full SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Restore as a separate layer so it is cached until the csproj changes
COPY *.csproj ./
RUN dotnet restore

# Build and publish a release
COPY . ./
RUN dotnet publish -c Release -o out

# Runtime stage: ASP.NET Core runtime only
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out ./
ENTRYPOINT ["dotnet", "todoapi.dll"]
```

`.dockerignore`

```text
bin/
obj/
out/
.git/
```

Two things to know about the runtime image: it runs as a non-root user, and since .NET 8 it listens on port **8080** (not 80). Test it locally if you have Docker:

```bash
docker build -t todoapi .
docker run --rm -p 8080:8080 -e ConnectionStrings__TodoContext="Host=host.docker.internal;Port=5432;Database=tododb;Username=test5;Password=test5" todoapi
```

#### Railway

- `git init`, commit, and push the project to a GitHub repository.
- In Railway create a **New Project → Deploy from GitHub repo** and pick the repository. Railway detects the `Dockerfile` and builds it.
- Add a database: **+ New → Database → PostgreSQL**. The Postgres service exposes `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` and `DATABASE_URL`.
- Open your API service → **Variables** and add these (the `${{Postgres.…}}` pieces are Railway *reference variables*, filled in from the database service — Npgsql wants `Key=Value` pairs rather than the `postgresql://` URL):

```env
ConnectionStrings__TodoContext=Host=${{Postgres.PGHOST}};Port=${{Postgres.PGPORT}};Database=${{Postgres.PGDATABASE}};Username=${{Postgres.PGUSER}};Password=${{Postgres.PGPASSWORD}}
ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
```

`ASPNETCORE_FORWARDEDHEADERS_ENABLED` makes the app trust the `X-Forwarded-Proto` header Railway's proxy adds, so `UseHttpsRedirection` knows the request was already HTTPS. Railway injects `PORT` itself, which the `UseUrls` lines in `Program.cs` pick up (Railway's guide also accepts `ASPNETCORE_URLS` set as a variable instead).

- **Settings → Networking → Generate Domain** gives you `https://<app>.up.railway.app`.
- Run the migrations against the production database. The runtime image has no SDK, so run them from your machine: on the Postgres service open **Settings → Networking → Public Access**, which creates a TCP proxy and a `DATABASE_PUBLIC_URL` variable (`postgresql://postgres:<password>@<host>:<port>/railway`). Rewrite it in Npgsql form and point `dotnet ef` at it:

```bash
dotnet ef database update --connection "Host=<host>;Port=<port>;Database=railway;Username=postgres;Password=<password>"
```

Repeat that whenever you add a migration. (The shortcut is `db.Database.Migrate()` at startup; the EF Core docs allow it for small single-instance apps and warn that several replicas starting at once can race. Fine for this project; prefer the explicit step for a real one.)

- Test the deployed API in Postman: `https://<app>.up.railway.app/todos`, then add your deployed frontend's origin to `WithOrigins`, commit, and Railway redeploys.

**Render** builds the same Dockerfile (Web Service → Docker), sets `PORT` for you and takes the same variables; build the connection string from the credentials of its Postgres. **Fly.io**: `fly launch` detects the Dockerfile; set `internal_port = 8080` in `fly.toml` and `fly secrets set ConnectionStrings__TodoContext=...`.

## Hungry for More?

You've created full CRUD for todos (and turtles yesterday). Give them some company by creating the following models with full CRUD, each in its own controller, and test every route in Postman. All should have `Name` and `Age` just like `Turtle`.

1. Dogs
2. Cats
3. Birds

- Add additional properties, like a boolean `Adopted` — every model change is `dotnet ef migrations add <Name>` then `dotnet ef database update`, locally and on the deployed database.
- Add a query-string filter to the list action: `GET /dogs?adopted=false` → `bool? adopted` parameter and a `.Where(...)` on the `DbSet`.

---

## Resources to Learn More

- [Tutorial: Create a web API with ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0) — controllers plus EF Core, the official version of this page
- [Enable CORS in ASP.NET Core](https://learn.microsoft.com/aspnet/core/security/cors?view=aspnetcore-10.0) — policies, `WithOrigins`, credentials, middleware order
- [Containerize a .NET app](https://learn.microsoft.com/dotnet/core/docker/build-container) — the Dockerfile above, explained line by line
- [Configuration in ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/configuration/?view=aspnetcore-10.0) — `appsettings.*.json`, environment variables, the `__` separator
- [Applying migrations](https://learn.microsoft.com/ef/core/managing-schemas/migrations/applying) — `database update`, SQL scripts, bundles, and the runtime `Migrate()` caveats
- [Deploy an ASP.NET Core app on Railway](https://docs.railway.com/guides/aspnet-core) — Dockerfile requirement, `PORT`, domains

---
