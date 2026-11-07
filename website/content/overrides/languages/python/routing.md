---
title: "Django: setup and routing"
framework: Django
version: "6.1"
lede: "Start a Django project in a virtual environment, write a class-based view with one method per HTTP verb, wire it to a URL, and read path params, query strings and JSON bodies."
updated_from: "the 2021 'Opinionated Framework Part 1' lesson (Django 3.1)"
verified: 2026-11-02
docs:
  - https://docs.djangoproject.com/en/6.1/intro/install/
  - https://docs.djangoproject.com/en/6.1/intro/tutorial01/
  - https://docs.djangoproject.com/en/6.1/topics/http/urls/
  - https://docs.djangoproject.com/en/6.1/topics/class-based-views/
  - https://docs.djangoproject.com/en/6.1/ref/request-response/
  - https://docs.djangoproject.com/en/6.1/ref/applications/#configuring-applications
  - https://docs.djangoproject.com/en/6.1/faq/install/#what-python-version-can-i-use-with-django
  - https://docs.python.org/3/library/venv.html
exec: ran
verified_note: "Every command and code block on this page was executed in a fresh venv: `startproject`, `startapp`, the three views and both urls.py versions, then GET/POST/PUT/DELETE requests against /first/, /second/<param>/?query= and /third/ with Django's test client. The build machine has Python 3.10, so the run used Django 5.2 LTS (the newest release that supports 3.10); nothing on this page differs between 5.2 and 6.1."
changes:
  - "Prerequisite bumped from 'Python 3.3+' to Python 3.12+, which is what Django 6.x requires (Django 5.2 LTS still runs on 3.10–3.13 if you are stuck on an older interpreter)."
  - "Fixed the dev-server command: it is `python manage.py runserver`, not `python manage.py`."
  - "Since Django 3.2 an app can be listed in INSTALLED_APPS as plain `'firstapp'`; the longer `firstapp.apps.FirstappConfig` form still works and is shown as the alternative."
  - "Framework table corrected: Flask (not 'Flash'), ASP.NET Core, Dart's shelf/Serverpod (Aqueduct and Angel were abandoned), Ktor, Vapor (Kitura was discontinued)."
  - "URL converters (`<str:param>`, `<int:id>`) and the `request.GET.get` default are called out explicitly; the docs links point at the 6.1 manual."
  - "Virtual environment is created as `.venv` inside the project folder, the layout the Python docs and most editors expect."
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

- Python 3.12 or newer installed (Django 6.1 requires it; check with `python3 --version`). On some systems the command is `python`, on others `python3` — use whichever prints a 3.12+ version.
- Postgres installed (not used until the models lesson; Django's default SQLite is enough for today)

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

Django sits firmly on the opinionated side: project generator, ORM, migrations, admin, auth and a template engine all come in the box.

## Setting Up the Project

#### Step 1 Setting Up Our Django Environment

- Create a `django` folder from which we will be doing all of our Django work, and `cd` into it.

- Create a virtual environment: `python3 -m venv .venv`

- Activate it: `source .venv/bin/activate` (on Windows: `.venv\Scripts\activate`). Your prompt now starts with `(.venv)`.

*Turn the virtual environment off with `deactivate` at any time; reactivate it with the same `source` command.*

**WHY:** The virtual environment is an isolated Python install for this project's dependencies, so Django 6 here can't fight with another project's Django 4 (it plays the role `node_modules` + `package.json` play in Node).

- Install Django: `python -m pip install django`

- Confirm: `python -m django --version` prints `6.1.x`.

#### Creating a Django Project

Creating Django projects and apps both use the `django-admin` command. From the `django` folder run:

```bash
django-admin startproject firstdjango
```

- `cd firstdjango`. You'll see `manage.py` and an inner `firstdjango/` package holding `settings.py` and `urls.py`.

- Start the dev server with `python manage.py runserver`, then open [http://localhost:8000](http://localhost:8000) — you should see the default "The install worked successfully!" page. (The warning about unapplied migrations is expected until the models lesson.)

## Creating a Controller

Django is unique in that it lets you organize parts of your project as **apps**. One app houses related items:

- models
- migrations
- views (in Django your controllers are class-based views; the actions are the methods on them)

This makes the workflow different from "Rails-style" frameworks, but it buys modularity: an app can be copied from one project to the next and be almost immediately usable. Use cases:

- build an authentication app you reuse from project to project
- build out common features like blogging and copy them between projects
- bring in apps other developers published — [Django Packages](https://djangopackages.org/) lists them

#### creating our first app

- From the folder with `manage.py`, run `python manage.py startapp firstapp` (a `firstapp` folder appears).

- Your project does not recognize the app until it's **installed**. Open `firstdjango/settings.py` and add it to `INSTALLED_APPS`:

```py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'firstapp',
]
```

- `'firstapp'` makes Django look for the `FirstappConfig` class in `firstapp/apps.py` automatically; writing `'firstapp.apps.FirstappConfig'` in full does the same thing and is what you'll see in older tutorials.

While you are in `settings.py`, comment out the CSRF middleware so POST/PUT/DELETE requests from Postman work without a CSRF token for now. (Tomorrow's REST framework lesson puts it back; never ship a site with this off.)

```py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

#### Creating Our Classed Based View

In the `firstapp` folder you'll see `views.py`; this is where views live. We'll create a class-based view (our controller).

- Import `JsonResponse` so we can send back JSON, and `View`, the base class.

```py
from django.http import JsonResponse  # for sending JSON responses
from django.views import View         # lets our class act as a view

class FirstView(View):
    pass
```

## Writing an Action

"Actions" are the individual functions in a controller. Here that means methods on the class-based view. `View` dispatches on the HTTP method: a method named `get` runs for GET requests, `post` for POST, and so on. Any verb you don't define returns **405 Method Not Allowed** automatically.

```py
from django.http import JsonResponse  # for sending JSON responses
from django.views import View         # lets our class act as a view

class FirstView(View):
    # named "get", so it runs on GET requests
    def get(self, request):
        return JsonResponse({"hello": "world", "method": request.method})

    # named "post", so it runs on POST requests
    def post(self, request):
        return JsonResponse({"hello": "world", "method": request.method})

    # named "put", so it runs on PUT requests
    def put(self, request):
        return JsonResponse({"hello": "world", "method": request.method})

    # named "delete", so it runs on DELETE requests
    def delete(self, request):
        return JsonResponse({"hello": "world", "method": request.method})
```

## Creating a Route

The view does nothing until it's connected to a URL. In Django, routes are called **URL patterns** and live in `urls.py` in the project package (`firstdjango/urls.py`, next to `settings.py`).

Import the view and attach it to an endpoint. `as_view()` turns the class into the callable Django's URL resolver expects.

`firstdjango/urls.py`

```py
from django.contrib import admin
from django.urls import path
from firstapp.views import FirstView

urlpatterns = [
    path('admin/', admin.site.urls),
    # associate our view class with an endpoint
    path('first/', FirstView.as_view()),
]
```

- Open Postman (or `curl`) and make a GET, POST, PUT and DELETE request to `http://localhost:8000/first/`.

- Then request `/first` **without** the trailing slash. GET gets redirected to `/first/` (the `APPEND_SLASH` setting); a POST without the slash errors. Django cares about trailing slashes — remembering this saves a long debugging session one day.

## Using URL Params

Create a second view class with a `get` method that takes the parameter as a named argument.

`firstapp/views.py`

```py
class SecondView(View):
    def get(self, request, param):
        return JsonResponse({"param": param})
```

Import it into `urls.py` and add a route. Angle brackets capture a URL segment and pass it to the view by name.

```py
from django.contrib import admin
from django.urls import path
from firstapp.views import FirstView, SecondView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('first/', FirstView.as_view()),
    # a URL with a URL param
    path('second/<param>/', SecondView.as_view()),
]
```

- Make a GET request to `/second/someparam/`, then to `/second/anotherparam/`.

`<param>` matches any text without a slash and arrives as a string. Path **converters** validate and convert: `<int:id>` only matches digits and passes an `int`; `<slug:name>`, `<uuid:key>` and `<path:rest>` exist too. Use them — a non-numeric id then 404s at the router instead of blowing up in your code.

## Accessing URL Queries

Query-string values (`?query=myquery`) are in `request.GET`, a dictionary-like object. Update `SecondView`:

```py
class SecondView(View):
    def get(self, request, param):
        query = request.GET.get("query", "no query")  # grab ?query= from the URL
        return JsonResponse({"param": param, "query": query})

    def post(self, request, param):
        query = request.GET.get("query", "no query")
        return JsonResponse({"param": param, "query": query})

    def put(self, request, param):
        query = request.GET.get("query", "no query")
        return JsonResponse({"param": param, "query": query})

    def delete(self, request, param):
        query = request.GET.get("query", "no query")
        return JsonResponse({"param": param, "query": query})
```

- Make GET, POST, PUT and DELETE requests to `/second/someparam/?query=myquery`

- then the same requests to `/second/someparam/`

The second argument to `request.GET.get` is the default when the query isn't present. (`request.GET` is named for the query string, not the HTTP method — it is populated on POSTs too.)

## Accessing the Request Body

Last thing: reading a JSON request body. `request.body` is raw bytes, so decode and parse it. Create `firstapp/helpers.py`:

```py
import json  # standard library JSON

def get_body(request):
    # decode the raw bytes into a string, then parse the JSON into a dict
    return json.loads(request.body.decode("utf-8"))
```

- import it into `views.py`

```py
from .helpers import get_body
```

- add a third view class

```py
class ThirdView(View):
    def post(self, request):
        return JsonResponse(get_body(request))
```

- connect it to a URL

```py
    # connecting our ThirdView
    path('third/', ThirdView.as_view()),
```

- POST `{"hello": "body"}` to `/third/` with the header `Content-Type: application/json`; the same JSON comes back.

`request.POST` only holds HTML-form fields (`application/x-www-form-urlencoded` or multipart), which is why a JSON API reads `request.body` instead.

---

## Resources to Learn More

- [URL dispatcher](https://docs.djangoproject.com/en/6.1/topics/http/urls/) — `path()`, converters, `include()`
- [Class-based views](https://docs.djangoproject.com/en/6.1/topics/class-based-views/) — `View`, `as_view()`, the generic views
- [Request and response objects](https://docs.djangoproject.com/en/6.1/ref/request-response/) — `request.GET`, `request.body`, `JsonResponse`
- [Writing your first Django app](https://docs.djangoproject.com/en/6.1/intro/tutorial01/) — the official tutorial, which covers the same ground with templates

---
