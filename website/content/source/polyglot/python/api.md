# Full Stack Build Part 1 - Building and Deploying an API
-------

## What you will learn
- Creating an API
- Setting Cors Headers
- Testing an API
- Deploying an API

-------

## Setup

- Open up terminal in your django folder

- activate your virtual environment `source ./djangoenv/bin/activate`

- generate a new django project `django-admin startproject todoproject`

- cd into the todoproject folder

- test your dev server `python manage.py runserver`

## Creating the API

- create a new app `django-admin startapp todos`

#### DjangoRestFramework

When creating an API previously we did without any external help and making basic crud routes ended being a bit tedious...

- write all crud functions individually

- we had to convert our data to json then back to a dictionary to send back as json

- the shape of the data isn't we would traditionally would expect

- we had to turn off CSRF security and other security features to make work

DjangoRestFramework fixes all the above and creates a nice abstraction for creating REST API's with django. Let's do it!

**[DJANGO REST FRAMEWORK DOCUMENTATION](https://www.django-rest-framework.org/)**

- install djangorestframework `pip install djangorestframework`

- install djangorestframework and the todos app in settings.py

```py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'todos.apps.TodosConfig',
    'rest_framework'
]
```

#### Creating our Model

todos/models.py

```py
from django.db import models

class Todo(models.Model):
    subject = models.CharField(max_length=100)
    details = models.CharField(max_length=100)
```
#### Make and Run Migrations

- `python manage.py makemigrations`
- `python manage.py migrate`

#### Making Our Serializer

Serializing objects into json strings and then turning them back into python dictionaries can be a tedious process. With djangorestframework, we can build a serializer for our model that handles all this for us along with arranging the data in a more traditional form.

- create a serializers.py in our todos app

```py
from .models import Todo
from django.contrib.auth.models import User, Group
from rest_framework import serializers

# Our TodoSerializer
class TodoSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        # The model it will serialize
        model = Todo
        # the fields that should be included in the serialized output
        fields = ['id', 'subject', 'details']
```

#### Creating Our Viewset

djangorestframework has classes for building out views called ViewSets. With these we can wire up all our CRUD routes pretty easily.

in todos/views.py

```py

from .models import Todo
from rest_framework import viewsets
from rest_framework import permissions
from .serializers import TodoSerializer


class TodoViewSet(viewsets.ModelViewSet):
    ## The Main Query for the index route
    queryset = Todo.objects.all()
    # The serializer class for serializing output
    serializer_class = TodoSerializer
    # optional permission class set permission level
    permission_classes = [permissions.AllowAny] #Coule be [permissions.IsAuthenticated]

```

#### Setting Up Our Router

To make sure all of the ViewSets methods connects to the rights urls, djangorestframework provides with a router to wire it all up. Let's head over to our urls.py.

```py

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from todos.views import TodoViewSet

# create a new router
router = routers.DefaultRouter()
# register our viewsets
router.register(r'todos', TodoViewSet) #register "/todos" routes


urlpatterns = [
    # add all of our router urls
    path('', include(router.urls)),
    path('admin/', admin.site.urls),
]

```

## Testing the API

- fire up postman

- create 3-4 todos with post requests to `/todos/`

- get the full list with a get request to `/todos/`

- see one todo with a get request to `/todos/<id>`

- edit a todo with a put request to `/todos/<id>`

- delete a todo with delete request to `/todos/<id>`

## Deploying the API

Now it's time to deploy the API, so first we have setup to do...

- install the libraries we need... `pip install django-heroku gunicorn django-cors-headers`

    - gunicorn: web server to run in production
    - django-heroku: configures our app for heroku deployment
    - [django-cors-headers](https://pypi.org/project/django-cors-headers/): will be used to handle cors

    **If you have any issues with installing psychopg2 (django-heroku dep), it is either cause you don't have x-code installed on mac or on linux you need to install "libpq-dev", on ubuntu based systems the command would be `sudo apt-get install libpq-dev`**

#### setting up django-heroku

In settings.py

- at the top import django-heroku `import django_heroku`

- at the bottom add `django_heroku.settings(locals())`

#### setting up django-cors-headers

In settings.py

- install the django-cors-headers app

```py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'todos.apps.TodosConfig',
    'rest_framework',
    'corsheaders'
]
```

- add the cors middleware

```py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware', ## <---- add here
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

- after the middleware section add this line to allow all origins

```py
CORS_ALLOW_ALL_ORIGINS = True ## <---- will allow all origins, read cors docs to limit
```

#### Additional Setup

- create a file called `Procfile` in the root of your project (where manage.py is)

```
web: gunicorn todoproject.wsgi
```

- add a runtime.txt in the project root with your python version

```
python-3.9.0
```

- generate a list of dependencies in requirements.txt with the command `pip freeze > requirements.txt` make sure to redo this anytime you add new dependencies

#### Getting it to heroku

- create a git repo in the root, commit, then push up to github.com repo

- create a new heroku project, connect your git repo to it, deploy

- run `python manage.py migrate` from the heroku dashboard or the heroku cli

- test you newly deployed api in postman.



-------
## Resources to Learn More

-------



