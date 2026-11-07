# Full Stack Build Part 1 - Building and Deploying an API
-------

## What you will learn
- Creating an API
- Setting Cors Headers
- Testing an API
- Deploying an API

-------

## Setup

- Create a new rails project `rails new todos --api -d postgresql`
- configure your database, make sure your production settings look like this

```yaml
production:
  <<: *default
  url: <%= ENV['DATABASE_URL'] %>
```

## Creating the API

While we can build the API brick by brick like we did yesterday, one of the coolest features in rails is it's scaffold generator. We can build our whole API in just a few commands like so...

- `rails g scaffold Todo subject:string details:string`

Notice all that was created for us...

- A migration file with the fields pre-populated
- A model file
- A controller with all the resource actions ready to go
- resources routes in our routes.rb

All we have left to do is...

- `rails db:migrate`

That's it, our API is ready to go...

## Testing the API

Run your server and run the following tests

- create 3 todos using a post request to "/todos"
- see all the todos with a get request to "/todos"
- see an individual todo with a get request to "/todo/:id"
- update a todo with a put request to "/todo/:id"
- delete a todo with a delete request to "/todo/:id"

## Deploying the API

Deploying Rails to Heroku is pretty straightforward like everything else in rails.

- commit and push your code to a repo on github

- create a new heroku project

- under the deploy tab select github deployment and connect the repo

- enable automatic deploys

- trigger a manual deploy

- once that is complete, with the heroku cli or using the more -> run console command in the upper right of the heroku dashboard run `rails db:migrate` to migrate your production database

Your API is deployed, rerun your tests as you did before to your new heroku URL!!! Congrats!

## CORS

While your API is deployed and working, our frontend application will currently find itself experience CORS errors since we haven't configured the CORS headers.

So let's do that!

- In you gemfile uncomment out `rack-cors`

- run `bundle install`

- edit config/initializers/cors.rb like so

```rb
# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin AJAX requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins '*'

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

- now commit and push your code back up and you shouldn't receive anymore cors errors on your frontend. (Keep in mind when complete you may want to tighten up your cors settings, in particular the allowed origins)



-------
## Resources to Learn More

-------



