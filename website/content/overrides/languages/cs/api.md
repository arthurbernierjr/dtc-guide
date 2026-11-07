---
title: "ASP.NET Core: building and deploying an API"
framework: "ASP.NET Core / Entity Framework Core"
version: "10.0"
editorial: true
lede: "Build the /todos CRUD API with ASP.NET Core 10 controllers and EF Core 10 on Postgres, open it to any frontend with the CORS middleware, create its table on boot, and deploy it to Railway with a two-stage .NET Dockerfile and the connection string coming from the environment."
updated_from: "the 2021 'Lab and Homework - MORE PETS' stub (77 words; .NET 5, Heroku)"
verified: 2026-11-07
docs:
  - https://learn.microsoft.com/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/web-api/?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/security/cors?view=aspnetcore-10.0
  - https://learn.microsoft.com/aspnet/core/fundamentals/configuration/?view=aspnetcore-10.0
  - https://learn.microsoft.com/dotnet/core/tools/dotnet-publish
  - https://learn.microsoft.com/dotnet/core/docker/build-container
  - https://learn.microsoft.com/dotnet/core/compatibility/containers/8.0/aspnet-port
  - https://learn.microsoft.com/ef/core/managing-schemas/ensure-created
  - https://learn.microsoft.com/ef/core/managing-schemas/migrations/applying
  - https://learn.microsoft.com/ef/core/cli/dotnet
  - https://docs.railway.com/builds/dockerfiles
  - https://railway.com/guides/aspnet-core
exec: ran
verified_note: "Deployed to Railway on 2026-11-07 from commit b92bc22109e1b904c3917137d35c9f6f8f1478de of github.com/arthurbernierjr/dtc-cs-api, live at https://api-production-efe3.up.railway.app; `node check.mjs https://api-production-efe3.up.railway.app` printed 16/16 PASS (health, CORS preflights, list shape, three 400 cases, create 201, show, 404s, update, delete 204). Every whole-file block on this page is the file in that repo. No .NET toolchain ran on the build machine; Railway built the image with .NET SDK 10.0.403, ASP.NET Core runtime 10.0.14 and Npgsql.EntityFrameworkCore.PostgreSQL 10.0.0."
changes:
  - "Aligned with the shared Todos contract: the `isComplete` field is gone so objects are exactly `id`, `subject` and `details`; blank or missing fields and malformed JSON answer 400 `{\"error\":…}` instead of the framework's ProblemDetails; 404s answer `{\"error\":\"not found\"}`; `/health` was added; CORS is open to any origin instead of a pinned origin list; and the `todos` table is created on boot with `CREATE TABLE IF NOT EXISTS` instead of `dotnet ef` migrations run by hand."
  - "The 2021 page was a 77-word homework stub (Dogs, Cats, Birds with CRUD, test in Postman). It is now a full build-and-deploy lesson mirroring the other API pages; the original lab is kept under 'Hungry for More?'."
  - "Project is scaffolded with `dotnet new webapi --use-controllers` on .NET 10 LTS; the only package is `Npgsql.EntityFrameworkCore.PostgreSQL` 10.0.0."
  - "CORS is done with the built-in `AddCors`/`UseCors` default policy, placed before the endpoints as the docs require, rather than a third-party package."
  - "Heroku's free tier ended in November 2022; deployment is written for Railway with a two-stage Dockerfile (`mcr.microsoft.com/dotnet/sdk:10.0` → `mcr.microsoft.com/dotnet/aspnet:10.0`) after the official .NET container guide."
  - "The connection string is never in the image or the repo: locally and in production it arrives as the `ConnectionStrings__TodoContext` environment variable, built on Railway from the Postgres reference variables."
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

Every backend guide on this site builds this same API: no trailing slashes, objects that contain exactly `id`, `subject` and `details`, and CORS open to any origin, so the four frontend guides can point at any of them. The finished example is [github.com/arthurbernierjr/dtc-cs-api](https://github.com/arthurbernierjr/dtc-cs-api), live at [api-production-efe3.up.railway.app](https://api-production-efe3.up.railway.app).

---

## Setup

The example was built on Railway with .NET SDK 10.0.403, runs on ASP.NET Core 10.0.14, and uses `Npgsql.EntityFrameworkCore.PostgreSQL` 10.0.0, which pulls in EF Core 10. Any .NET 10 SDK on your machine will do.

- Scaffold a fresh Web API project with controllers and step into it:

```bash
dotnet new webapi --use-controllers -o todoapi
cd todoapi
```

- The template ships a sample endpoint and a few files this page never reads. Delete `Controllers/WeatherForecastController.cs`, `WeatherForecast.cs`, both `appsettings*.json` files and the `Properties/` folder. The example repo contains only what you see on this page.

- Replace the generated project file with this one. The only package is EF Core's Postgres provider:

`todoapi.csproj`

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.0.0" />
  </ItemGroup>
</Project>
```

`.gitignore`

```text
bin
obj
.env
```

- Create a local database: `createdb tododb`

- Put the local connection string in your shell, not in a file. ASP.NET Core reads the environment variable `ConnectionStrings__TodoContext` (double underscore) as the configuration key `ConnectionStrings:TodoContext`, which is exactly what `Program.cs` asks for, so nothing changes in code between your laptop and production:

```bash
export ConnectionStrings__TodoContext="Host=localhost;Port=5432;Database=tododb;Username=test5;Password=test5"
dotnet restore
```

**WHY** no `appsettings.Development.json`: it works, but it is one more place a password can end up in git.

## Creating the API

#### Creating our Model

`Models/TodoItem.cs`

```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace todoapi.Models;

[Table("todos")]
public class TodoItem
{
    public long Id { get; set; }

    [Required]
    public string Subject { get; set; } = "";

    [Required]
    public string Details { get; set; } = "";
}
```

- `[Table("todos")]` names the table; without it EF Core would call it `Todos` after the `DbSet` below.
- `[Required]` on a string rejects `null`, `""` and whitespace-only values: the contract's "blank or missing" rule. The `= ""` default keeps the nullable analysis quiet.

`Models/TodoContext.cs`

```csharp
using Microsoft.EntityFrameworkCore;

namespace todoapi.Models;

public class TodoContext : DbContext
{
    public TodoContext(DbContextOptions<TodoContext> options) : base(options) { }
    public DbSet<TodoItem> Todos => Set<TodoItem>();
}
```

#### Wiring up Program.cs — validation, database, CORS, port

`Program.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using todoapi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().ConfigureApiBehaviorOptions(options =>
{
    // One 400 shape for every bad body: missing or blank fields and malformed JSON alike.
    options.InvalidModelStateResponseFactory = context =>
    {
        var malformed = context.ModelState.Keys.Any(k => k == "" || k.StartsWith("$"));
        return new BadRequestObjectResult(new
        {
            error = malformed ? "malformed JSON body" : "subject and details are required",
        });
    };
});

builder.Services.AddDbContext<TodoContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("TodoContext")));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

// Create the table on boot. Idempotent, so every deploy can run it.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TodoContext>();
    db.Database.ExecuteSqlRaw(
        "CREATE TABLE IF NOT EXISTS todos (\"Id\" bigserial PRIMARY KEY, \"Subject\" text NOT NULL, \"Details\" text NOT NULL)");
}

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors();

app.MapGet("/health", () => Results.Ok(new { ok = true }));
app.MapControllers();
// Anything else under /todos (for example a non-numeric id) answers the contract's JSON 404.
app.MapFallback("/todos/{*path}", () => Results.NotFound(new { error = "not found" }));

app.Run();
```

Top to bottom:

- **Validation.** `[ApiController]` already validates the bound `TodoItem` and answers 400 on its own, but with a ProblemDetails body. `ConfigureApiBehaviorOptions` swaps in our own factory so every bad body gets the contract's `{"error": "..."}`. Malformed JSON shows up in `ModelState` under an empty key or a `$`-prefixed JSON path; anything else is a failed `[Required]`.
- **Database.** The connection string comes from configuration, never from code: the environment variable from Setup locally, a service variable of the same name on Railway.
- **CORS.** The default policy allows any origin, header and method. `app.UseCors()` applies it, placed before `MapControllers` so it can answer the preflight `OPTIONS` request.
- **Port.** Hosts say where to listen through `PORT`; with nothing set it is 8080, the port the runtime image expects since .NET 8.
- **Table on boot.** One idempotent `CREATE TABLE IF NOT EXISTS`, run once per start inside a scope (a `DbContext` is scoped). The quoted column names are the ones EF Core expects.
- **Health and fallback.** `/health` is a one-line minimal endpoint; `MapFallback` catches `/todos/anything-not-numeric` so that 404 is JSON rather than the framework's empty response.

**WHY** CORS: browsers block JavaScript on `http://localhost:5173` from reading responses from `http://localhost:8080` unless the API says that origin is allowed. The middleware answers the preflight `OPTIONS` request and adds the `Access-Control-Allow-Origin` header. `AllowAnyOrigin()` is right for this lesson, where four frontend guides point at the same API; in a real product use `.WithOrigins("https://your-frontend.example.com")`, **without a trailing slash** (`https://site.com/` never matches). Postman and `curl` ignore CORS entirely: if a request works there and fails in the browser console, CORS is the first suspect.

**WHY** not `EnsureCreated()` or migrations: `db.Database.EnsureCreated()` looks tempting, but it only creates the schema when the database has no tables at all, so once anything exists it silently does nothing, and it writes no migration history, so you cannot switch to migrations later without starting over. Migrations (`dotnet ef migrations add`, then `dotnet ef database update` or `Migrate()` at startup) are the tool for a real project; see [Applying migrations](https://learn.microsoft.com/ef/core/managing-schemas/migrations/applying). For one table in a lesson, a `CREATE TABLE IF NOT EXISTS` that is safe on every boot is the smallest thing that works, and it needs no `dotnet ef` anywhere.

#### Creating our Controller

`Controllers/TodosController.cs`

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using todoapi.Models;

namespace todoapi.Controllers;

[ApiController]
[Route("todos")]
public class TodosController : ControllerBase
{
    private readonly TodoContext _db;
    public TodosController(TodoContext db) => _db = db;

    [HttpGet]
    public async Task<IEnumerable<TodoItem>> Index() =>
        await _db.Todos.OrderBy(t => t.Id).ToListAsync();

    [HttpGet("{id:long}")]
    public async Task<ActionResult<TodoItem>> Show(long id)
    {
        var todo = await _db.Todos.FindAsync(id);
        return todo is null ? NotFound(new { error = "not found" }) : todo;
    }

    [HttpPost]
    public async Task<ActionResult<TodoItem>> Create(TodoItem todo)
    {
        var item = new TodoItem { Subject = todo.Subject, Details = todo.Details };
        _db.Todos.Add(item);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(Show), new { id = item.Id }, item);
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<TodoItem>> Update(long id, TodoItem todo)
    {
        var existing = await _db.Todos.FindAsync(id);
        if (existing is null) return NotFound(new { error = "not found" });
        existing.Subject = todo.Subject;
        existing.Details = todo.Details;
        await _db.SaveChangesAsync();
        return existing;
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Destroy(long id)
    {
        var todo = await _db.Todos.FindAsync(id);
        if (todo is null) return NotFound(new { error = "not found" });
        _db.Todos.Remove(todo);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
```

Same shape as yesterday's turtles, deliberately:

- `[ApiController]` binds the JSON body to `TodoItem` and validates it before the action runs, so by the time `Create` runs the fields are present.
- `ActionResult<T>` lets each action return either data or a status code: `NotFound(new { error = "not found" })` is the JSON 404, `NoContent()` the empty 204.
- `{id:long}` is a route constraint: `/todos/abc` matches none of these actions and falls through to the `MapFallback` in `Program.cs`.
- `Create` copies `Subject` and `Details` into a fresh object so a client cannot pick its own `Id`; `CreatedAtAction` answers 201 with a `Location: /todos/<id>` header.
- The JSON serializer camel-cases names by default, so `Subject` goes out as `subject`: the contract's shape with no extra configuration.

#### The home page

`UseDefaultFiles` and `UseStaticFiles` in `Program.cs` serve `wwwroot/index.html` at `/`, so a browser visiting the root sees a short page instead of a 404. Any HTML will do; copy the example repo's or write your own.

## Testing the API

- Start the server with `dotnet run` (or `dotnet watch`). It listens on `http://localhost:8080` and creates the `todos` table on the way up.
- In Postman, or with `curl`, create 3–4 todos with POST requests to `/todos` (body `{"subject": "...", "details": "..."}` as JSON, header `Content-Type: application/json`): **201** with the new object each time
- GET `/todos` (**200**, an array ordered by id); GET `/todos/<id>` (**200**, or **404** `{"error":"not found"}`)
- PUT `/todos/<id>` with both fields (**200** with the updated object); DELETE `/todos/<id>` (**204**, no body; a second time **404**)
- Send `{"subject": "", "details": "x"}` or `{}` and expect **400** `{"error":"subject and details are required"}`
- Check CORS: `curl -i http://localhost:8080/todos -H "Origin: http://localhost:5173"` shows `Access-Control-Allow-Origin: *`

```bash
curl -i -X POST http://localhost:8080/todos \
  -H "Content-Type: application/json" \
  -d '{"subject": "Deploy", "details": "ship the API"}'
# HTTP/1.1 201 Created  {"id":1,"subject":"Deploy","details":"ship the API"}

curl -i -X POST http://localhost:8080/todos \
  -H "Content-Type: application/json" \
  -d '{"subject": "", "details": "x"}'
# HTTP/1.1 400 Bad Request  {"error":"subject and details are required"}

curl -i -X DELETE http://localhost:8080/todos/1
# HTTP/1.1 204 No Content

curl -i http://localhost:8080/todos/1
# HTTP/1.1 404 Not Found  {"error":"not found"}
```

Run the contract check against your own deploy: `node check.mjs https://your-api.up.railway.app` (copy `check.mjs` from the example repo; it needs Node 18 or later and no packages). All 16 lines should say PASS.

## Deploying the API

Any host that can build a Dockerfile works; this page uses **Railway**. Railway's own builder (Railpack) does not build .NET, so a Dockerfile is required there, and the same Dockerfile works on Render and Fly.io.

#### Dockerfile

Create `Dockerfile` in the project folder (next to `todoapi.csproj`). Two stages, after the official .NET container guide: the SDK image runs `dotnet publish` (Release build into a folder), the much smaller ASP.NET runtime image runs the published DLL with configuration coming from **environment variables**.

`Dockerfile`

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /out .
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "todoapi.dll"]
```

The runtime image runs as a non-root user and, since .NET 8, listens on port **8080** (not 80). `ASPNETCORE_URLS` and `EXPOSE` both say 8080 so a plain `docker run` works; when a host sets `PORT`, the `UseUrls` line in `Program.cs` wins and listens there instead. Test it locally if you have Docker:

```bash
docker build -t todoapi .
docker run --rm -p 8080:8080 -e ConnectionStrings__TodoContext="Host=host.docker.internal;Port=5432;Database=tododb;Username=test5;Password=test5" todoapi
```

#### Railway

- `git init`, commit, and push the project to a GitHub repository.
- In Railway create a **New Project → Deploy from GitHub repo** and pick the repository. Railway sees the `Dockerfile` and builds it (the example's build used SDK 10.0.403).
- Add a database: **+ New → Database → PostgreSQL**. The Postgres service exposes `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` and `DATABASE_URL`.
- Open your API service → **Variables** and add this one variable, the only one the example service has. The `${{Postgres.…}}` pieces are Railway *reference variables*, filled in from the database service; Npgsql wants `Key=Value` pairs rather than the `postgresql://` URL:

```env
ConnectionStrings__TodoContext=Host=${{Postgres.PGHOST}};Port=${{Postgres.PGPORT}};Database=${{Postgres.PGDATABASE}};Username=${{Postgres.PGUSER}};Password=${{Postgres.PGPASSWORD}}
```

- **Settings → Networking → Generate Domain** gives you `https://<app>.up.railway.app`. Point it at port **8080**, the port the Dockerfile exposes (the example's domain targets 8080).
- There is no migration step. The app runs `CREATE TABLE IF NOT EXISTS todos` every time it starts, so the first deploy creates the table and every later deploy finds it already there.
- Test the deployed API: `curl https://<app>.up.railway.app/health`, then `node check.mjs https://<app>.up.railway.app`.

CORS `*` is for the lesson, so any of the frontend guides can talk to your API from any origin. In a real product narrow it to the frontend's origin with `WithOrigins(...)` in `Program.cs`, commit, and Railway redeploys.

## Hungry for More?

You've created full CRUD for todos (and turtles yesterday). Give them some company by creating the following models with full CRUD, each in its own controller, and test every route in Postman. All should have `Name` and `Age` just like `Turtle`.

1. Dogs
2. Cats
3. Birds

- Each new model needs its own `DbSet` in `TodoContext` and its own `CREATE TABLE IF NOT EXISTS` in `Program.cs`. When that list gets long, switch to migrations: add `Microsoft.EntityFrameworkCore.Design`, install `dotnet-ef`, run `dotnet ef migrations add InitialCreate`, and put `db.Database.Migrate()` where the raw SQL was.
- Add additional properties, like a boolean `Adopted`, and a query-string filter on the list action: `GET /dogs?adopted=false` → `bool? adopted` parameter and a `.Where(...)` on the `DbSet`.

---

## Resources to Learn More

- [Tutorial: Create a web API with ASP.NET Core](https://learn.microsoft.com/aspnet/core/tutorials/first-web-api?view=aspnetcore-10.0) — controllers plus EF Core, the official version of this page
- [Create web APIs with ASP.NET Core](https://learn.microsoft.com/aspnet/core/web-api/?view=aspnetcore-10.0) — `[ApiController]`, automatic 400 responses and `ConfigureApiBehaviorOptions`
- [Enable CORS in ASP.NET Core](https://learn.microsoft.com/aspnet/core/security/cors?view=aspnetcore-10.0) — policies, `AllowAnyOrigin`, `WithOrigins`, middleware order
- [Containerize a .NET app](https://learn.microsoft.com/dotnet/core/docker/build-container) — the Dockerfile above, explained line by line
- [Configuration in ASP.NET Core](https://learn.microsoft.com/aspnet/core/fundamentals/configuration/?view=aspnetcore-10.0) — environment variables and the `__` separator
- [Create and drop APIs](https://learn.microsoft.com/ef/core/managing-schemas/ensure-created) — what `EnsureCreated` does and does not do
- [Applying migrations](https://learn.microsoft.com/ef/core/managing-schemas/migrations/applying) — the real-project path, with the runtime `Migrate()` caveats
- [Deploy an ASP.NET Core app on Railway](https://railway.com/guides/aspnet-core) — Dockerfile requirement, `PORT`, domains

---
