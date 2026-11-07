# Opinionated Framework - Models & Migrations
-------

## What you will learn

- How to set the database settings
- how create models and migrations
- how to use models to add, update, and delete records

-------

## Setup

- Open up the same project from this morning
- download the following libraries with nuget (.net package manager)

```
dotnet add package EntityFramework --version 6.4.4
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 5.0.2
dotnet add package Microsoft.EntityFrameworkCore.Design --version 5.0.4
```

Entity is the .Net frameworks ORM for working with Databases.
## Setting Up the Database Settings

- create a .gitignore file with the following

```
/obj
/out
appsettings.json
```

- create a postgres database with command `createdb firstdotnetdb`

- add the following to appsettings.json reflecting your local postgres username and password.

```json
  "DBContextSettings": {
    "ConnectionString": "User ID=test5;Password=test5;Host=localhost;Port=5432;Database=firstdotnetdb;Pooling=true;"
  }
```

#### Creating Our Model

Create a Models folder and create a file called Turtle.cs.

```cs
namespace firstdotnet.Models
{
    public class Turtle
    {
        public long id {get; set;}
        public string name {get; set;}
        public int age {get; set;}
    }
}
```

Pretty straight forward, the properties of the class will be used later in determining how to execute migrations.

Now we need to create a Database Context for our model, this is the class the connects the model to the database. Create a new file TurtleContext.cs in the Models folder.

```cs
using Microsoft.EntityFrameworkCore;

namespace firstdotnet.Models
{
    public class TurtleContext : DbContext
    {
        public TurtleContext(DbContextOptions<TurtleContext> options) : base(options)
        {
        }
        // Database Contexts can had db sets for multiple models, you add them as properties, you can also create mutliple database contexts
        public DbSet<Turtle> Turtles { get; set; } 
    }
}
```

Now that we have our database context we need to register it as a service so our controllers can receive it through dependency injection. In Startup.cs we will edit out configuration function.

```cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using firstdotnet.Models;
using Microsoft.EntityFrameworkCore;

namespace firstdotnet
{
    public class Startup
    {
        // Constructor: Grabbing the configurtation object that will let us grab variables from appsettings.
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // the property to receive the configuration object
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            // The collects all our controllers for routing
            services.AddControllers();

            // We save the connection string appsettings.json in a variable
            var connectionString = Configuration["DbContextSettings:ConnectionString"];
            // We register the db context as a service
            services.AddDbContext<TurtleContext>(opt => opt.UseNpgsql(connectionString));

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "firstdotnet", Version = "v1" });
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "firstdotnet v1"));
            }
            
            // forces site to redirect to https, comment out for now
            // app.UseHttpsRedirection();

            app.UseRouting(); // enables writing

            app.UseAuthorization(); // enables authorization

            // this function is where we define all our routing
            app.UseEndpoints(endpoints =>
            {
                // Enable Attribute Routing
                endpoints.MapControllers();
                // Enable Pattern Matching
                endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{URLParam?}");

            });
        }
    }
}
```

#### Migrations

We should be all wired up! Now let's have the Entity Framework migrate our database!

If you haven't yet, you need to download the Entity Framework tools

```
dotnet tool install --global dotnet-ef
```

- Once that is installed let's create our initial migration

- `dotnet ef migrations add InitialCreate`

- then run the migrations with `dotnet ef database update`

We're good to go, now we just need to build out controller!

## Using the Model

We will use attribute routing. Create a new controller, TurtleController.cs, in the controllers folder.

```cs
using firstdotnet.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc; // For the Route and Http attributes
using System.Linq; // For the IEnumerable interface

namespace firstdotnet.Controllers
{
    [Route("turtles")] //The Controller handles routes for /turtles
    public class TurtleController
    {
        // declare property to hold Database Context
        private readonly TurtleContext turtles;

        // define constructor to receive database context via DI
        public TurtleController(TurtleContext turtlesCtx){
            turtles = turtlesCtx;
        }

        [HttpGet] // get request to "/turtles"
        public IEnumerable<Turtle> index(){
            // return all the turtles
            return turtles.Turtles.ToList();
        }

        [HttpPost] // post request to "/turtles"
        public IEnumerable<Turtle> Post([FromBody]Turtle Turtle){
            // add a Turtle
            turtles.Turtles.Add(Turtle);
            // save changes
            turtles.SaveChanges();
            // return all the turtles
            return turtles.Turtles.ToList();
        }

        [HttpGet("{id}")] // get requestion to "turtles/{id}"
        public Turtle show(long id){
            // return the specified Turtle matched based on id
            return turtles.Turtles.FirstOrDefault(x => x.id == id);
        }

        [HttpPut("{id}")] // put request to "turtles/{id}
        public IEnumerable<Turtle> update([FromBody]Turtle Turtle, long id){
            // retrieve Turtle to be updated
            Turtle oldTurtle = turtles.Turtles.FirstOrDefault(x => x.id == id);
            //update their properties, can also be done with turtles.Turtles.Update
            oldTurtle.name = Turtle.name;
            oldTurtle.age = Turtle.age;
            // Save changes
            turtles.SaveChanges();
            // return updated list of turtles
            return turtles.Turtles.ToList();
        }

        [HttpDelete("{id}")] // delete request to "turtles/{id}
        public IEnumerable<Turtle> destroy(long id){
            //retrieve existing Turtle
            Turtle oldTurtle = turtles.Turtles.FirstOrDefault(x => x.id == id);
            //remove them
            turtles.Turtles.Remove(oldTurtle);
            // saves changes
            turtles.SaveChanges();
            // return updated list of turtles
            return turtles.Turtles.ToList();
        }
    }
}
```

Test all the routes! You've done it, head to lab!




-------
## Resources to Learn More

-------



