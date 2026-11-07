---
title: "Django: building and deploying an API"
framework: Django
version: "6.1.3"
lede: "Use Django REST framework's serializer, ModelViewSet and router to get a complete /todos CRUD API in a few dozen lines, shape every error as JSON, add CORS, then deploy it to Railway with Postgres."
updated_from: "the 2021 'Full Stack Build Part 1' lesson (Django 3.1, django-heroku, Heroku free tier)"
verified: 2026-11-07
docs:
  - https://www.django-rest-framework.org/tutorial/quickstart/
  - https://www.django-rest-framework.org/api-guide/serializers/#modelserializer
  - https://www.django-rest-framework.org/api-guide/viewsets/#modelviewset
  - https://www.django-rest-framework.org/api-guide/routers/#defaultrouter
  - https://www.django-rest-framework.org/api-guide/exceptions/#custom-exception-handling
  - https://www.django-rest-framework.org/api-guide/permissions/
  - https://github.com/adamchainz/django-cors-headers#setup
  - https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/
  - https://docs.djangoproject.com/en/6.1/howto/deployment/wsgi/gunicorn/
  - https://docs.djangoproject.com/en/6.1/ref/settings/#csrf-trusted-origins
  - https://whitenoise.readthedocs.io/
  - https://docs.railway.com/guides/django
exec: ran
verified_note: "Deployed to Railway on 2026-11-07 from commit 18c49b88fa38ff2c6aa11142ef560872d09a588a of github.com/arthurbernierjr/dtc-python-api, live at https://api-production-02380.up.railway.app; `node check.mjs https://api-production-02380.up.railway.app` printed 16/16 PASS (health, CORS preflights, list shape, three 400 cases, create 201, show, 404s, update, delete 204). Railway built Python 3.13.17, Django 6.1.3, DRF 3.18.3, django-cors-headers 4.9.0, gunicorn 26.2.0, psycopg 3.3.8, dj-database-url 3.1.2, whitenoise 6.12.0. Every whole-file block on this page is the file in that repo. No Python toolchain ran on the build machine."
changes:
  - "Aligned with the shared Todos contract: `DefaultRouter(trailing_slash=False)` makes the paths `/todos` and `/todos/:id` (the old page had trailing slashes), `GET /health` answers `{\"ok\": true}`, the serializer rejects blank or whitespace-only `subject`/`details` with a 400, and a custom DRF exception handler shapes every error (400, 404, bad JSON) as `{\"error\": \"...\"}` instead of DRF's per-field dictionaries."
  - "`django-heroku` removed (unmaintained since 2018, incompatible with current Django). Production settings now read `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS` and `DATABASE_URL` from environment variables, which is what every current host (Railway, Render, Fly.io, Heroku) provides."
  - "Heroku's free tier ended in November 2022; the deploy section is written for Railway, which reads the same `Procfile`."
  - "Serializer switched from `HyperlinkedModelSerializer` to `ModelSerializer`, which is the right base class when `fields` lists `id` and no `url` — the hyperlinked variant only adds value when you expose `url` fields."
  - "`runtime.txt` replaced by `.python-version` (what Railway's Railpack builder reads); static files served with WhiteNoise so the Django admin works in production."
  - "CSRF middleware stays on: DRF only enforces CSRF for logged-in browser sessions and this API has no authentication classes, so Postman and frontends work without disabling it."
  - "Postgres driver is `psycopg[binary]` (psycopg 3); install troubleshooting note updated accordingly."
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

Every backend guide on this site builds this same API, with no trailing slashes, objects that contain exactly `id`, `subject` and `details`, and CORS open to any origin so the four frontend guides can point at any of them. The finished Django example is [github.com/arthurbernierjr/dtc-python-api](https://github.com/arthurbernierjr/dtc-python-api), live at [https://api-production-02380.up.railway.app](https://api-production-02380.up.railway.app).

---

## Setup

- Open a terminal in your `django` folder

- Activate your virtual environment: `source .venv/bin/activate`

- Generate a new Django project: `django-admin startproject todoproject`

- `cd todoproject`

- Test your dev server: `python manage.py runserver`

The example runs Python 3.13 and Django 6.1.3 (`python -m django --version`).

## Creating the API

- Create a new app: `python manage.py startapp todos`

#### DjangoRestFramework

Yesterday we built CRUD routes with no help, and it was tedious:

- every CRUD function written by hand
- data converted to a JSON string and back to a dictionary just to send it
- the output shape (`model`/`pk`/`fields`) isn't what a frontend expects
- CSRF had to be switched off to make it work

Django REST framework (DRF) fixes all of that.

**[Django REST framework documentation](https://www.django-rest-framework.org/)**

- Install it: `python -m pip install djangorestframework`

- Install DRF, the `todos` app and `corsheaders` (the CORS package from the deploy section, added now so you edit this list once) in `settings.py`:

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "todos",
    "rest_framework",
    "corsheaders",
]
```

Leave the CSRF middleware **on** this time. DRF only enforces CSRF for requests authenticated by a browser session, so Postman and a separate frontend are unaffected.

#### Creating our Model

`todos/models.py`

```python
from django.db import models


class Todo(models.Model):
    subject = models.CharField(max_length=100)
    details = models.CharField(max_length=100)

    def __str__(self):
        return self.subject
```

Django names the table `todos_todo`; `id` is an auto-incrementing integer.

#### Make and Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### Making Our Serializer

A **serializer** converts model instances to JSON-ready data and validates incoming JSON back into model fields. `ModelSerializer` reads the model and generates the fields for you.

The contract says a blank `subject` or `details` is a 400, so the two fields are declared explicitly with `allow_blank=False`, plus a `validate_<field>` method each, which DRF calls during `is_valid()`.

- Create `todos/serializers.py`:

```python
from rest_framework import serializers

from .models import Todo


class TodoSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(max_length=100, allow_blank=False, trim_whitespace=True)
    details = serializers.CharField(max_length=100, allow_blank=False, trim_whitespace=True)

    class Meta:
        model = Todo
        fields = ["id", "subject", "details"]

    @staticmethod
    def _require_text(value, name):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError(f"{name} is required")
        return value

    def validate_subject(self, value):
        return self._require_text(value, "subject")

    def validate_details(self, value):
        return self._require_text(value, "details")
```

Output is now the flat shape a frontend wants: `{"id": 1, "subject": "...", "details": "..."}`; `fields` is also what is **accepted** as input.

WHY: `trim_whitespace=True` turns `"   "` into `""` before `allow_blank` is checked, so DRF rejects whitespace-only values with `This field may not be blank.` and missing ones with `This field is required.` `_require_text` is a belt-and-braces guard for the same rule.

#### Creating Our Viewset

A **ViewSet** bundles the actions for a resource — list, create, retrieve, update, partial_update, destroy — into one class. `ModelViewSet` implements all six from a queryset and a serializer.

The contract also needs `GET /health`, so it is a plain Django view in the same file. `todos/views.py` (the top of the file; below this excerpt is a `home` view that returns a small HTML page pointing at `/todos`):

```python
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_GET
from rest_framework import permissions, viewsets

from .models import Todo
from .serializers import TodoSerializer


class TodoViewSet(viewsets.ModelViewSet):
    queryset = Todo.objects.all().order_by("id")
    serializer_class = TodoSerializer
    permission_classes = [permissions.AllowAny]


@require_GET
def health(request):
    return JsonResponse({"ok": True})
```

`order_by("id")` keeps the list order stable. `AllowAny` is open for now — use `IsAuthenticated` for a real app.

#### Shaping errors as JSON

Out of the box DRF answers a bad POST with `{"subject": ["This field may not be blank."]}` and a missing row with `{"detail": "..."}`. The contract wants `{"error": "..."}` every time, so we swap in our own exception handler.

Create `todos/exceptions.py`:

```python
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import NotFound, ParseError, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as default_exception_handler


def _first_message(detail):
    """Flatten a DRF error detail (dict, list or string) into one line."""
    if isinstance(detail, dict):
        for field, messages in detail.items():
            message = _first_message(messages)
            if field == "non_field_errors":
                return message
            return f"{field}: {message}"
        return "invalid"
    if isinstance(detail, (list, tuple)):
        return _first_message(detail[0]) if detail else "invalid"
    return str(detail)


def todos_exception_handler(exc, context):
    if isinstance(exc, ValidationError):
        return Response({"error": _first_message(exc.detail)}, status=status.HTTP_400_BAD_REQUEST)
    if isinstance(exc, (NotFound, Http404)):
        return Response({"error": "not found"}, status=status.HTTP_404_NOT_FOUND)
    if isinstance(exc, ParseError):
        return Response({"error": "invalid json"}, status=status.HTTP_400_BAD_REQUEST)

    response = default_exception_handler(exc, context)
    if response is not None and hasattr(exc, "detail"):
        response.data = {"error": _first_message(exc.detail)}
    return response
```

`ValidationError` (the serializer's 400) becomes the first field's first message, e.g. `{"error": "subject: This field may not be blank."}`; `Http404` (what `ModelViewSet` raises when `get_object()` finds nothing) becomes `not found`; `ParseError` (a body that is not JSON) becomes `invalid json`.

Then tell DRF to use it, and lock the API to JSON, at the bottom of `settings.py`:

```python
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "EXCEPTION_HANDLER": "todos.exceptions.todos_exception_handler",
}
```

WHY: `JSONRenderer` only switches off DRF's **browsable API**, which would hand a browser tab HTML instead of JSON. No authentication classes means no session lookups, which is also why CSRF never gets in the way.

#### Setting Up Our Router

To connect the ViewSet's actions to URLs, DRF provides **routers**. `DefaultRouter` normally generates URLs with trailing slashes (`/todos/`); the contract has none, so pass `trailing_slash=False`. `todoproject/urls.py`:

```python
from django.contrib import admin
from django.urls import include, path
from rest_framework import routers

from todos.views import TodoViewSet, health, home

router = routers.DefaultRouter(trailing_slash=False)
router.register(r"todos", TodoViewSet)

urlpatterns = [
    path("", home),
    path("health", health),
    path("", include(router.urls)),
    path("admin/", admin.site.urls),
]
```

The router generates `GET/POST /todos` and `GET/PUT/PATCH/DELETE /todos/<id>`. `path("", home)` sits above the router so `/` serves our HTML page instead of DRF's API root. Start the server and run `curl http://localhost:8000/todos` — you should get `[]`.

## Testing the API

Test with `curl` (or Postman with a JSON body). Each line shows the status you should see:

```bash
curl -i http://localhost:8000/health                                    # 200 {"ok": true}
curl -i -X POST http://localhost:8000/todos \
     -H "Content-Type: application/json" \
     -d '{"subject": "Learn Django", "details": "serializers and viewsets"}'   # 201 {"id": 1, ...}
curl -i http://localhost:8000/todos                                     # 200 [{"id": 1, ...}]
curl -i http://localhost:8000/todos/1                                   # 200 {"id": 1, ...}
curl -i -X POST http://localhost:8000/todos \
     -H "Content-Type: application/json" -d '{"subject": "  "}'         # 400 {"error": "..."}
curl -i http://localhost:8000/todos/999                                 # 404 {"error": "not found"}
curl -i -X DELETE http://localhost:8000/todos/1                         # 204, no body
```

PUT `/todos/<id>` with both fields answers 200 with the updated object; a second DELETE of the same id is a 404. No trailing slashes: `GET /todos/` is a 404 now.

Run the contract check against your own deploy: `node check.mjs https://your-api.up.railway.app` (copy [`check.mjs`](https://github.com/arthurbernierjr/dtc-python-api/blob/main/check.mjs) from the example repo; Node 18 or later, no packages). All 16 lines should say PASS.

## Deploying the API

We deploy to **Railway**. It builds from your GitHub repo, reads the `Procfile` for the start command, gives you a Postgres `DATABASE_URL`, and sets `PORT` plus the variables you add.

- Install the production dependencies:

```bash
python -m pip install gunicorn django-cors-headers dj-database-url "psycopg[binary]" whitenoise
```

**gunicorn** is the production WSGI server; **django-cors-headers** lets a frontend on another origin call the API; **dj-database-url** reads `DATABASE_URL` into `DATABASES`; **psycopg** is the Postgres driver (`[binary]` ships a wheel, so no compiler or `libpq-dev`); **whitenoise** serves the admin's static files without a separate web server.

#### setting up django-cors-headers

In `settings.py`:

- `corsheaders` is already in `INSTALLED_APPS` from earlier

- add the CORS middleware **above** `CommonMiddleware`, and WhiteNoise right after `SecurityMiddleware`

```python
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
```

- open CORS to every origin, so any of the four frontend guides can call the API:

```python
CORS_ALLOW_ALL_ORIGINS = True
```

`CORS_ALLOW_ALL_ORIGINS = True` is for the lesson. In a real product replace it with your frontend's exact origins, e.g. `CORS_ALLOWED_ORIGINS = ["https://my-frontend.example.com", "http://localhost:5173"]`.

#### production settings from the environment

Django's deployment checklist boils down to: no secrets in code, `DEBUG` off, hosts declared. Replace the generated lines at the top of `settings.py`:

```python
import os
import dj_database_url
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-only-insecure-key")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o]

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}
```

WHY: `DEBUG` defaults to **false**. Set `DEBUG=true` in your shell while developing; forgetting it on the host then fails safe instead of leaking tracebacks.

Further down, keep `STATIC_URL`, add `STATIC_ROOT = BASE_DIR / "staticfiles"` and set `STORAGES["staticfiles"]` to `whitenoise.storage.CompressedManifestStaticFilesStorage` so WhiteNoise has somewhere to serve from (the repo's `settings.py` has the exact block).

#### Additional Setup

- Create a `Procfile` in the project root (next to `manage.py`). Railway reads it for the start command:

```text
web: python manage.py collectstatic --noinput && python manage.py migrate && gunicorn todoproject.wsgi --bind 0.0.0.0:${PORT:-8080}
```

Railway sets `PORT` and its proxy connects to that port, so gunicorn must bind to it (its default 8000 never answers); `${PORT:-8080}` falls back to 8080 locally. `collectstatic` fills `STATIC_ROOT` before WhiteNoise looks for it. `migrate` creates the `todos_todo` table on a fresh Postgres and is a no-op on later boots, so there is no separate migrate step to remember.

- Pin the Python version in `.python-version` in the project root (Railway's builder reads it):

```text
3.13
```

- Pin the dependencies in `requirements.txt`. These are the exact versions the live example was built with:

```text
django==6.1.3
djangorestframework==3.18.3
django-cors-headers==4.9.0
dj-database-url==3.1.2
psycopg[binary]==3.3.8
gunicorn==26.2.0
whitenoise==6.12.0
```

- Add a `.gitignore` with `__pycache__/`, `db.sqlite3`, `staticfiles/`, `.env` and your `.venv/`.

- Run `DEBUG=false SECRET_KEY=x ALLOWED_HOSTS=example.com python manage.py check --deploy`: no errors (the HTTPS warnings are handled by Railway's TLS termination).

#### Getting it live

Railway's [Django guide](https://docs.railway.com/guides/django) has the screenshots; the steps:

- `git init`, commit, push to a GitHub repo
- In Railway, create a new project from that repo, then add a **PostgreSQL** database. Reference it from the web service as `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
- Under the web service's **Variables**, set `SECRET_KEY` (generate one with `python -c "from django.core.management.utils import get_random_secret_key as k; print(k())"`), `DEBUG=false`, `ALLOWED_HOSTS=your-app.up.railway.app` and `CSRF_TRUSTED_ORIGINS=https://your-app.up.railway.app`. Railway sets `PORT` itself.
- Under **Settings → Networking**, generate a public domain. The deploy runs the `Procfile` (collect static, migrate, gunicorn); then `curl https://your-app.up.railway.app/health` prints `{"ok": true}` and `node check.mjs https://your-app.up.railway.app` prints 16 lines of PASS.

---

## Resources to Learn More

- [DRF quickstart](https://www.django-rest-framework.org/tutorial/quickstart/) — serializers, viewsets and routers in one pass
- [Permissions](https://www.django-rest-framework.org/api-guide/permissions/) and [authentication](https://www.django-rest-framework.org/api-guide/authentication/) — replacing `AllowAny` before launch
- [Deployment checklist](https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/) — the settings `check --deploy` inspects
- [How to use Django with Gunicorn](https://docs.djangoproject.com/en/6.1/howto/deployment/wsgi/gunicorn/)
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers#configuration) — `CORS_ALLOWED_ORIGINS`, regexes, credentials
- [Railway: Deploy a Django app](https://docs.railway.com/guides/django) — the dashboard steps, Postgres and variables

---
