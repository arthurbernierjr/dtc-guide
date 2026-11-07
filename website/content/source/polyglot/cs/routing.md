# Opinionated Framework Part 1 - Setup and Routing

---

## What you will learn

- What is an Opinionated Framework?
- How to start up a new project
- How to create a controller and actions
- How to connect controller actions to routes

---

## Prerequisites

- dotnet 5
- postgres 12 or higher
- docker
- heroku cli
- VSCode with the dotnet extension pack
- [Blog Article If you Run Into Roadblocks](https://dev.to/alexmercedcoder/intro-to-net-5-with-vscode-zero-to-deploy-58o3)

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

- to create a new web api project the command is `dotnet new webapi -o firstdotnet`

## Creating a Controller

A controller is class that has several methods that can be triggered routes/endpoints, mixtures of urls and http verbs users make a request too. The starting point of our application is the Startup.cs file.

Make sure to add the code for pattern routing below:

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

###### Pattern Routing

- This part of Startup.cs set up a style of routing called Pattern Routing

```cs
    endpoints.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{URLParam?}");

```

So when a request comes in the server will assume the first part of the URL is the controller name, the second the method of the controller, and optionally the third part will be saved in a variable called URLParam that can be received.

In the Controllers folder create a FirstController.cs file with the following.

```cs
using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;
using System.Collections;

namespace firstdotnet.Controllers
{
    public class FirstController : Controller
    {
        // This route would match /first/first
        public Hashtable First(){
            return new Hashtable(){"Result", "You Made a Route"};
        }
    }
}
```

- We can now finally test our app by running `dotnet run` and see the route on http://localhost:5000/first/first

#### Getting the URL Param

We just need to pass an argument with the same name to the controller method and it should be able to receive the param.

```cs
        // This route would match /first/second/{URLParam}
        public Hashtable Second(string URLParam){
            return new Hashtable(){{"PARAM", URLParam}};
        }
```

- restart your server and visit http://localhost:5000/first/second/something in the browser

#### Getting a URL Query

- Add this to your controller

```cs
        // this would match /first/third?query={anything}
        public Hashtable Third(string query){
            return new Hashtable(){{"query", query}};
        }
```

- restart your server and go to http://localhost:5000/first/third?query=itworks!

#### Attribute Routing

Create Another Controller Class, SecondController.cs

```cs
using Microsoft.AspNetCore.Mvc;
using System.Text.Encodings.Web;
using System.Collections;


namespace firstdotnet.Controllers
{
    [Route("/theurl")] //defines an endpoint for the controller
    public class SecondController
    {
        [HttpGet] // get request to /theurl
        public Hashtable First(){
            return new Hashtable(){{"Result", "You Made a Route"}};
        }
    }
}
```

- restart your server and go to http://localhost:5000/theurl

#### Adding a Param to an Attribute Route

Add this to SecondController

```cs
        [HttpGet("{URLParam}")] // get request to /theurl/URLParam
        public Hashtable Second(string URLParam){
            return new Hashtable(){{"Result", URLParam}};
        }
```

- restart your server and go to http://localhost:5000/theurl/anotherparam in the browser

##### Getting the Request Body

```cs
        [HttpPost] // post request to /theurl
        public Hashtable Third([FromBody] Hashtable body){
            return body;
        }
```

- restart your server and use postman to make a post request to /theurl with a json and body and it should return it to you.

- Time to head to lab

---

## Resources to Learn More

- [ASP NET CORE 5 Docs](https://docs.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc?view=aspnetcore-5.0)
- [Routing Documentation](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-5.0)

---
