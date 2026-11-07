---
title: "Django: models and migrations"
framework: Django
version: "6.1"
lede: "Point Django at a database, define a model, generate and run migrations, query it from the shell, then expose it as JSON from class-based views."
updated_from: "the 2021 'Opinionated Framework - Models & Migrations' lesson (Django 3.1, Heroku)"
verified: 2026-11-02
docs:
  - https://docs.djangoproject.com/en/6.1/ref/settings/#databases
  - https://docs.djangoproject.com/en/6.1/ref/databases/
  - https://docs.djangoproject.com/en/6.1/topics/migrations/
  - https://docs.djangoproject.com/en/6.1/topics/db/models/
  - https://docs.djangoproject.com/en/6.1/topics/db/queries/
  - https://docs.djangoproject.com/en/6.1/ref/models/querysets/
  - https://docs.djangoproject.com/en/6.1/topics/serialization/
  - https://pypi.org/project/dj-database-url/
exec: ran
verified_note: "Executed end to end in a fresh venv: startproject/startapp, migrate, the Turtle model, makemigrations + migrate, every shell command in 'Using the Model' (create/all/get/save/delete), and the two views with GET/POST/PUT/DELETE requests through Django's test client. Ran on Django 5.2 LTS under Python 3.10 (the newest interpreter on the build machine); the model, migration and ORM calls here are unchanged in 6.1."
changes:
  - "`django-heroku` is gone: the package has not been updated since 2018 and does not work with current Django. Database settings now come from a `DATABASE_URL` environment variable through `dj-database-url`, which works on Railway, Render, Fly.io and Heroku alike."
  - "Bug fixed: the `delete` view built a `JsonResponse` and never returned it, so DELETE requests answered with a 500."
  - "The variable `all` shadowed Python's built-in `all()`; renamed to `turtles`. The URL param is typed `<int:id>` so a non-numeric id 404s at the router."
  - "`Model.objects.get` raises `DoesNotExist` for a missing row; the views use `get_object_or_404` so a bad id returns 404 instead of 500."
  - "Postgres pointer updated to `psycopg` 3 (the `psycopg2` era driver is legacy); docs links point at the 6.1 manual; third-party tutorial links removed."
---

# Opinionated Framework - Models & Migrations

---

## What you will learn

- How to set the database settings
- How to create models and migrations
- How to use models to add, update, and delete records

---

## Setup

- Open a terminal in your `django` folder
- Activate your virtual environment: `source .venv/bin/activate`
- Start a new project: `django-admin startproject seconddjango` then `cd seconddjango`
- Create a new app: `python manage.py startapp pets`

## Setting Up the Database Settings

In Django all settings for your application live in `settings.py`. For local development the defaults create an SQLite database file in your project folder, which is all we need today.

`seconddjango/settings.py`

```py
# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

When you deploy, the host gives you a Postgres connection string in an environment variable, usually `DATABASE_URL`. The small `dj-database-url` package turns that string into the dictionary above, so one settings file works everywhere:

```bash
python -m pip install dj-database-url "psycopg[binary]"
```

```py
import dj_database_url

DATABASES = {
    # read DATABASE_URL if it is set, otherwise fall back to local SQLite
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}
```

`psycopg` (version 3) is the Postgres driver Django uses; `[binary]` installs a pre-built wheel so you don't need Postgres headers on your machine. Other engines are covered in the [database docs](https://docs.djangoproject.com/en/6.1/ref/databases/).

Django ships with user, group and session models we can migrate right away, which creates the SQLite database:

**In Django, migrations are generated from your models; running them creates, alters and drops tables as the project evolves.**

```bash
python manage.py migrate
```

You should now see `db.sqlite3` in your project — that's your development database.

## Models and Migrations

To add tables to the database we:

- create the model in an installed app
- make the migrations
- run the migrations

#### Installing our pets app

Install the pets app in `seconddjango/settings.py`:

```py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'pets',
]
```

and, as yesterday, comment out the CSRF middleware so Postman can POST without a token:

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

#### Making a Model

Your app folder has a `models.py`. A model is a class whose attributes describe the columns of a table.

`pets/models.py`

```py
from django.db import models  # the Model base class

class Turtle(models.Model):
    # a string column of at most 100 characters
    name = models.CharField(max_length=100)
    # an integer column
    age = models.IntegerField()

    def __str__(self):
        return self.name
```

Django adds an auto-incrementing `id` primary key for you. Other common fields: `TextField`, `BooleanField`, `DateTimeField(auto_now_add=True)`, `DecimalField`, and `ForeignKey` for relations.

#### Making a Migration

`makemigrations` reads every model and compares it to the last migration. If anything changed (new, modified or removed models) it writes a migration file describing the change; `migrate` then applies it to the database.

```bash
python manage.py makemigrations
python manage.py migrate
```

Look in `pets/migrations/0001_initial.py` — that file is the table definition, and it goes in git with the rest of the code.

## Using the Model

Let's practice with the model in the Django shell.

- `python manage.py shell` opens a Python shell with your project loaded (type `exit()` to leave). Django 5.2+ auto-imports your models in the shell; the explicit import still works everywhere:

```py
from pets.models import Turtle
```

- [Making queries](https://docs.djangoproject.com/en/6.1/topics/db/queries/)
- [QuerySet reference](https://docs.djangoproject.com/en/6.1/ref/models/querysets/)

#### Adding a turtle

Every model has a **manager** at `Model.objects`; it is how you query the table.

- create a Turtle: `Turtle.objects.create(name="Wilbert", age=5)`
- create 3 more turtles

#### Getting all the turtles

Queries return a **QuerySet** — lazy, chainable, and evaluated when you iterate or index it.

- save all of them in a variable: `turtles = Turtle.objects.all()`
- access the first object: `turtles[0]`
- access its name: `turtles[0].name`
- filter: `Turtle.objects.filter(age__gte=5)` (`__gte`, `__lt`, `__contains`, `__icontains` and friends are "lookups")

#### Getting just one turtle

- `wilbert = Turtle.objects.get(id=1)`
- `wilbert.name`
- `wilbert.age`

`get` returns exactly one object or raises `Turtle.DoesNotExist` (or `MultipleObjectsReturned`).

#### Updating a Turtle

Once we have a Turtle we can change and save it:

- modify the object: `wilbert.name = "Dilbert"`
- write it to the database: `wilbert.save()`
- confirm: `Turtle.objects.get(id=1).name`

#### Deleting a Turtle

- `wilbert.delete()`
- confirm it's gone: `Turtle.objects.filter(id=1).exists()` is `False` (and `.get(id=1)` now raises `DoesNotExist`)

#### Using your model in a view

Head over to `pets/views.py` and write views that use the model.

**Copy `helpers.py` from yesterday's app into `pets/`** (the `get_body` function that parses a JSON request body).

```py
from django.http import JsonResponse          # for sending JSON responses
from django.shortcuts import get_object_or_404 # 404 instead of a crash on a bad id
from django.core.serializers import serialize  # model instances -> JSON text
from django.views import View
import json

from .models import Turtle
from .helpers import get_body

# class for "/turtle/" routes
class TurtleView(View):
    # list all turtles
    def get(self, request):
        turtles = Turtle.objects.all()
        # serialize() returns a JSON *string*; load it back into Python so JsonResponse can send it
        data = json.loads(serialize("json", turtles))
        # safe=False lets JsonResponse send a list instead of a dict
        return JsonResponse(data, safe=False)

    # create a turtle
    def post(self, request):
        body = get_body(request)
        turtle = Turtle.objects.create(name=body["name"], age=body["age"])
        data = json.loads(serialize("json", [turtle]))  # serialize wants an iterable
        return JsonResponse(data, safe=False)
```

Connect the class to a URL:

`seconddjango/urls.py`

```py
from django.contrib import admin
from django.urls import path
from pets.views import TurtleView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('turtle/', TurtleView.as_view()),
]
```

- Test both routes in Postman (`GET /turtle/`, `POST /turtle/` with `{"name": "Wilbert", "age": 5}`), then add the single-turtle routes:

```py
# class for "/turtle/<id>/" routes
class TurtleViewID(View):
    # show one turtle
    def get(self, request, id):
        turtle = get_object_or_404(Turtle, id=id)
        data = json.loads(serialize("json", [turtle]))
        return JsonResponse(data, safe=False)

    # update one turtle
    def put(self, request, id):
        body = get_body(request)
        # ** unpacks the dict into keyword arguments (like spreading an object in JS)
        Turtle.objects.filter(id=id).update(**body)
        turtle = get_object_or_404(Turtle, id=id)
        data = json.loads(serialize("json", [turtle]))
        return JsonResponse(data, safe=False)

    # delete one turtle
    def delete(self, request, id):
        turtle = get_object_or_404(Turtle, id=id)
        data = json.loads(serialize("json", [turtle]))  # capture it before it's gone
        turtle.delete()
        return JsonResponse(data, safe=False)
```

Connect the URL. `<int:id>` only matches digits and passes an integer.

```py
from django.contrib import admin
from django.urls import path
from pets.views import TurtleView, TurtleViewID

urlpatterns = [
    path('admin/', admin.site.urls),
    path('turtle/', TurtleView.as_view()),
    path('turtle/<int:id>/', TurtleViewID.as_view()),
]
```

You've created a full CRUD API. The output shape (`{"model": "pets.turtle", "pk": 1, "fields": {...}}`) is Django's serialization format rather than the flat JSON a frontend expects — tomorrow Django REST framework fixes that, and removes most of this boilerplate.

---

## Resources to Learn More

- [Models](https://docs.djangoproject.com/en/6.1/topics/db/models/) — fields, options, relationships
- [Migrations](https://docs.djangoproject.com/en/6.1/topics/migrations/) — how `makemigrations`/`migrate` work and how to handle conflicts
- [Making queries](https://docs.djangoproject.com/en/6.1/topics/db/queries/) and the [QuerySet API](https://docs.djangoproject.com/en/6.1/ref/models/querysets/)
- [Databases](https://docs.djangoproject.com/en/6.1/ref/databases/) — Postgres, MySQL, MariaDB, Oracle and SQLite notes

---
