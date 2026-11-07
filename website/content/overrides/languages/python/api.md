---
title: "Django: building and deploying an API"
framework: Django
version: "6.1"
lede: "Use Django REST framework's serializer, ModelViewSet and router to get a complete /todos/ CRUD API in a few dozen lines, add CORS, then prepare it for a production host."
updated_from: "the 2021 'Full Stack Build Part 1' lesson (Django 3.1, django-heroku, Heroku free tier)"
verified: 2026-11-02
docs:
  - https://www.django-rest-framework.org/tutorial/quickstart/
  - https://www.django-rest-framework.org/api-guide/serializers/#modelserializer
  - https://www.django-rest-framework.org/api-guide/viewsets/#modelviewset
  - https://www.django-rest-framework.org/api-guide/routers/#defaultrouter
  - https://www.django-rest-framework.org/api-guide/permissions/
  - https://github.com/adamchainz/django-cors-headers#setup
  - https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/
  - https://docs.djangoproject.com/en/6.1/howto/deployment/wsgi/gunicorn/
  - https://docs.djangoproject.com/en/6.1/ref/settings/#csrf-trusted-origins
  - https://whitenoise.readthedocs.io/
exec: ran
verified_note: "Deployed on Railway on 2026-11-07 with Django 6.1.3, Python 3.13, djangorestframework 3.18.3, django-cors-headers 4.9.0, and psycopg 3.3.8. POST, GET list, GET one, PUT, DELETE, a missing id 404, and a CORS preflight for http://localhost:5173 all passed against Postgres. The earlier local run was Django 5.2 on Python 3.10 and is not this proof. The project was removed after the curls. The repo is github.com/arthurbernierjr/dtc-python-api."
changes:
  - "`django-heroku` removed (unmaintained since 2018, incompatible with current Django). Production settings now read `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` and `DATABASE_URL` from environment variables, which is what every current host (Railway, Render, Fly.io, Heroku) provides."
  - "Heroku's free tier ended in November 2022; the deploy section is written for any Procfile-style host and names Railway and Render as the free-to-start options."
  - "Serializer switched from `HyperlinkedModelSerializer` to `ModelSerializer`, which is the right base class when `fields` lists `id` and no `url` — the hyperlinked variant only adds value when you expose `url` fields."
  - "`runtime.txt` replaced by `.python-version` (what Heroku and Railway's current buildpacks read); static files served with WhiteNoise so the browsable API works in production."
  - "CSRF middleware stays on: DRF's `SessionAuthentication` only enforces CSRF for logged-in browser sessions, so Postman and frontends work without disabling it."
  - "Postgres driver is `psycopg[binary]` (psycopg 3); install troubleshooting note updated accordingly."
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

- Open a terminal in your `django` folder

- Activate your virtual environment: `source .venv/bin/activate`

- Generate a new Django project: `django-admin startproject todoproject`

- `cd todoproject`

- Test your dev server: `python manage.py runserver`

## Creating the API

- Create a new app: `python manage.py startapp todos`

#### DjangoRestFramework

Yesterday we built CRUD routes with no help, and it was tedious:

- every CRUD function written by hand
- data converted to a JSON string and back to a dictionary just to send it
- the output shape (`model`/`pk`/`fields`) isn't what a frontend expects
- CSRF had to be switched off to make it work

Django REST framework (DRF) fixes all of that with a clean abstraction for REST APIs.

**[Django REST framework documentation](https://www.django-rest-framework.org/)**

- Install it: `python -m pip install djangorestframework`

- Install DRF and the `todos` app in `settings.py`:

```py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'todos',
    'rest_framework',
]
```

Leave the CSRF middleware **on** this time. DRF only enforces CSRF for requests authenticated by a browser session, so Postman and a separate frontend are unaffected.

#### Creating our Model

`todos/models.py`

```py
from django.db import models

class Todo(models.Model):
    subject = models.CharField(max_length=100)
    details = models.CharField(max_length=100)

    def __str__(self):
        return self.subject
```

#### Make and Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### Making Our Serializer

A **serializer** converts model instances to JSON-ready data and validates incoming JSON back into model fields. `ModelSerializer` reads the model and generates the fields for you.

- Create `todos/serializers.py`:

```py
from rest_framework import serializers
from .models import Todo

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo                              # the model it serializes
        fields = ['id', 'subject', 'details']     # fields included in the output (and accepted as input)
```

Output is now the flat shape a frontend wants: `{"id": 1, "subject": "...", "details": "..."}`.

#### Creating Our Viewset

A **ViewSet** bundles the actions for a resource — list, create, retrieve, update, partial_update, destroy — into one class. `ModelViewSet` implements all six from a queryset and a serializer.

`todos/views.py`

```py
from rest_framework import viewsets, permissions
from .models import Todo
from .serializers import TodoSerializer

class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all().order_by('id')   # the rows this viewset works with
    serializer_class = TodoSerializer               # how rows are (de)serialized
    permission_classes = [permissions.AllowAny]     # open for now; IsAuthenticated for real apps
```

#### Setting Up Our Router

To connect the ViewSet's actions to URLs, DRF provides **routers**. In `todoproject/urls.py`:

```py
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from todos.views import TodoViewSet

# create a router and register our viewset under /todos/
router = routers.DefaultRouter()
router.register(r'todos', TodoViewSet)

urlpatterns = [
    path('', include(router.urls)),   # all the router's URLs
    path('admin/', admin.site.urls),
]
```

The router generates `GET/POST /todos/` and `GET/PUT/PATCH/DELETE /todos/<id>/`, and the root `/` lists every registered resource. Start the server and open [http://localhost:8000/todos/](http://localhost:8000/todos/) in a browser — DRF's **browsable API** renders a form for POSTing right there.

## Testing the API

- Fire up Postman (or use the browsable API)
- Create 3–4 todos with POST requests to `/todos/` (body `{"subject": "...", "details": "..."}` as JSON)
- Get the full list with GET `/todos/`
- See one todo with GET `/todos/<id>/`
- Edit a todo with PUT `/todos/<id>/` (all fields) or PATCH (some fields)
- Delete a todo with DELETE `/todos/<id>/` — a 204 with no body

Mind the trailing slashes: the router generates URLs with them.

## Deploying the API

Any host that runs a Python web process works: **Railway** and **Render** have free-to-start tiers, Fly.io and Heroku are the paid alternatives. They all do the same four things: install `requirements.txt`, run a start command, give you a Postgres `DATABASE_URL`, and set environment variables. Here is the setup that works on all of them.

- Install the production dependencies:

```bash
python -m pip install gunicorn django-cors-headers dj-database-url "psycopg[binary]" whitenoise
```

- **gunicorn** — the production WSGI server (`runserver` is development only)
- **django-cors-headers** — lets your frontend, on a different origin, call the API
- **dj-database-url** — reads `DATABASE_URL` into Django's `DATABASES` setting
- **psycopg** — the Postgres driver (`[binary]` ships a pre-built wheel, so no compiler or `libpq-dev` needed)
- **whitenoise** — serves static files (the browsable API's CSS, the admin) without a separate web server

#### setting up django-cors-headers

In `settings.py`:

- add the app

```py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'todos',
    'rest_framework',
    'corsheaders',
]
```

- add the CORS middleware **above** `CommonMiddleware`, and WhiteNoise right after `SecurityMiddleware`

```py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',        # static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',             # must come before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

- allow your frontend's origin. While developing, allowing everything is fine; lock it down before anyone real uses it.

```py
CORS_ALLOW_ALL_ORIGINS = True   # development only

# production: list the exact frontend origins instead
# CORS_ALLOWED_ORIGINS = ["https://my-frontend.example.com", "http://localhost:5173"]
```

#### production settings from the environment

Django's deployment checklist boils down to: no secrets in code, `DEBUG` off, hosts and origins declared. Replace the generated lines at the top of `settings.py`:

```py
import os
import dj_database_url
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# read from the environment in production; the defaults keep local development working
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-insecure-key')
DEBUG = os.environ.get('DEBUG', 'true').lower() == 'true'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if o]

DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}
```

On the host, set `SECRET_KEY` (generate one with `python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"`), `DEBUG=false`, `ALLOWED_HOSTS=your-app.up.railway.app`, `CSRF_TRUSTED_ORIGINS=https://your-app.up.railway.app`, and attach a Postgres database (the host sets `DATABASE_URL`).

#### Additional Setup

- Create a `Procfile` in the project root (next to `manage.py`). Railway, Render and Heroku read it; Render also accepts the same line as its "start command".

```text
web: python manage.py collectstatic --noinput && python manage.py migrate && gunicorn todoproject.wsgi --bind 0.0.0.0:${PORT:-8000}
```

`gunicorn todoproject.wsgi` by itself listens on port 8000. Railway sets `PORT` (it was 8080 on the proof deploy) and the public proxy connects to that port, so a process still bound to 8000 never answers. `collectstatic` fills `STATIC_ROOT` before WhiteNoise looks for it. `migrate` creates the table on a fresh Postgres.

- Pin the Python version in `.python-version` in the project root:

```text
3.13
```

- Freeze dependencies into `requirements.txt` (redo this whenever you add a package):

```bash
python -m pip freeze > requirements.txt
```

- Run the checks Django runs for you: `DEBUG=false SECRET_KEY=x ALLOWED_HOSTS=example.com python manage.py check --deploy` should report no errors (warnings about HTTPS settings are addressed by the host's TLS termination).

#### Getting it live

- `git init`, commit, push to a GitHub repo (add `.venv/`, `db.sqlite3` and `staticfiles/` to `.gitignore` first)
- Create a new project on the host, connect the repo, add a Postgres database, set the environment variables above
- After the first deploy run the migrations and collect static files from the host's shell or as a release/pre-deploy command: `python manage.py migrate && python manage.py collectstatic --noinput`
- Test the deployed API in Postman: `https://<your-app>/todos/`

---

## Resources to Learn More

- [DRF quickstart](https://www.django-rest-framework.org/tutorial/quickstart/) — serializers, viewsets and routers in one pass
- [DRF tutorial](https://www.django-rest-framework.org/tutorial/1-serialization/) — the six-part walk from function views to viewsets
- [Permissions](https://www.django-rest-framework.org/api-guide/permissions/) and [authentication](https://www.django-rest-framework.org/api-guide/authentication/) — replacing `AllowAny` before launch
- [Deployment checklist](https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/) — the settings `check --deploy` inspects
- [How to use Django with Gunicorn](https://docs.djangoproject.com/en/6.1/howto/deployment/wsgi/gunicorn/)
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers#configuration) — `CORS_ALLOWED_ORIGINS`, regexes, credentials

---
