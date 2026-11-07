---
editorial: true
title: The Paper Ledger
subtitle: Server-rendered HTML with Express, Mongoose, and INDUCES
hook: "Before React, the server sends the page. Seven routes, one resource, plain HTML and CSS. The name of the seven is INDUCES."
read: 60
artifact: "A server-rendered quest board: index, new, delete, update, create, edit, show, backed by a Mongoose model"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://expressjs.com/en/guide/routing.html
  - https://expressjs.com/en/guide/using-middleware.html
  - https://mongoosejs.com/docs/queries.html
  - https://expressjs.com/en/resources/middleware/method-override.html
say:
  - "INDUCES is seven routes for one noun: Index, New, Delete, Update, Create, Edit, Show."
  - "HTML forms only speak GET and POST. method-override restores PUT and DELETE from a hidden field."
  - "Declare /new and /:id/edit before /:id, or the word new is captured as an id."
---

## The hook

The quests exist in the collection, and so far the only way to see them is a JSON body in curl. A browser can do better than that, and it can do it without React. The server builds the page, sends HTML, and the stylesheet is an ordinary file the browser fetches next. One resource, quests, gets seven routes. The name of the seven is INDUCES: Index, New, Delete, Update, Create, Edit, Show. HTML forms know only `GET` and `POST`, so `PUT` and `DELETE` come back through method-override. A successful create redirects to a `GET`, because a refresh must not insert a second document.

By the end of the session you can click through a quest's whole life: the list, the blank form, the created page, the edit form, the update, the delete, and the list again. The address bar stays in sync with what you see, because every successful write ends on a `GET`.

> *The ledger is paper the server prints on demand. The ink is the collection. The pages are routes.*

## The idea

INDUCES is seven routes for one noun. It is not seven resources, and it is not a suggestion to invent `/quests/create` as a path that means the verb. The paths stay the ones from the resource map. The letters are a checklist so you notice which route you forgot.

Index is `GET /quests`. It loads the documents and sends a list. Each item is a link to that quest's show page. The page also links to the new form. An empty collection is still this page, with a sentence that there are no quests yet, and status 200. Emptiness is not a 404.

New is `GET /quests/new`. It sends the empty form. It does not insert anything. The form's `method` is `POST` and its `action` is `/quests`. Opening the form is a read.

Create is `POST /quests`. It reads the urlencoded body, validates, inserts, and redirects. It does not send the list as the body of the `POST`. The redirect's target is a `GET`, either the new show page or the index. This session uses the show page, so the browser lands on the quest you just made.

Show is `GET /quests/:id`. It loads one document and sends one page. If `findById` returns `null`, the response is a 404 page, still HTML. The show page links to the edit form and includes the delete form.

Edit is `GET /quests/:id/edit`. It loads the document and sends the form again, with the current title and status filled in. It does not update anything. Saving the form is the update route.

Update is `PUT /quests/:id`. The browser cannot set a form's method to `PUT`, so the form posts, and method-override rewrites `req.method` before the router runs. The handler updates the document and redirects to the show page.

Delete is `DELETE /quests/:id`. Same constraint. A small form posts, the override rewrites the method, the handler deletes, and the redirect goes to the index, because the show page no longer has a document to render.

That is the whole surface. Seven functions. One model, the Mongoose model you already have. The controller reads `req`, calls the model, and either sends HTML or redirects. The HTML functions do not call Mongoose. If a function that builds a string also calls `Quest.find`, the split you drew two sessions ago has collapsed.

Route order is part of the checklist. Express matches in the order you registered, for a given method. Register the specific `GET`s before the parameter `GET`. The seven live in a new file, `quests-pages.js`, as named functions, and the router in that file is called `pages`, not `quests`, so that `server.js` can hold both routers without one name shadowing the other. The JSON router from the keeper session is still `quests`, in `quests-router.js`.

```js
const pages = express.Router();

pages.get('/', index);
pages.get('/new', fresh);
pages.get('/:id/edit', edit);
pages.get('/:id', show);
pages.post('/', create);
pages.put('/:id', update);
pages.delete('/:id', destroy);

module.exports = pages;
```

`GET /quests/new` is the collision you can reproduce. If `pages.get('/:id', show)` is registered first, a request for `/quests/new` matches it, and `req.params.id` is the string `new`. `findById('new')` throws a `CastError`, because `new` is not 24 hex characters. The form never renders. You then "fix" the cast by special-casing the word `new` inside the show handler, and now one function is two routes. Register `/new` first and the word never becomes an id.

`GET /quests/:id/edit` is a two-segment path. A one-segment `/:id` pattern does not swallow `/abc/edit`. You still register `/:id/edit` before `/:id`, so the file lists the specific patterns above the parameter pattern and so a later edit to the show pattern cannot hide the form. The bug the cast will actually catch this week is the word `new`.

HTML forms only speak `GET` and `POST`. You can look at the form element for as long as you like. There is no `method="PUT"` that browsers honor as a real `PUT`. If you write it, the browser sends `GET`. Delete and update would never hit your routes. The method-override package exists for this hole. Install it, in `~/projects/guild-door`: `npm install method-override`. It is not built into Express. `express.urlencoded` is built in, and it is the parser that turns a form body into `req.body`.

The method-override page defines two different getters. `methodOverride('_method')` treats `_method` as a query-string key, because the string does not start with `X-`. The form's action carries the override:

```html
<form method="POST" action="/quests/ID_HERE?_method=PUT">
```

Mount that middleware after `express.urlencoded` and before the router.

```js
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
```

`extended: false` parses flat name and value fields with the `querystring` library, which is what a title field and a status field are. The override has to run before routing, or `pages.put` will not see a `PUT`. It sits after the parser so that, by the time any later function runs, the body has already become `req.body`. The query helper itself reads `?_method=`, not the body. A hidden input named `_method` does nothing for this string helper. If you want the hidden input, the method-override page shows a custom getter that reads `req.body._method` and deletes it so it is not saved as a quest field. That getter must be mounted after `express.urlencoded`. If it runs before the parser, `req.body` is empty, the method stays `POST`, and the update route never runs. The browser sent `POST`. Your `pages.put` waited for a `PUT`. Both are true, and the page appears to refresh without saving. That is the diagnosis.

Redirect after a successful `POST`. The pattern's name is Post/Redirect/Get. `res.redirect('/quests/' + id)` responds with 302 and a `Location` header. Express uses 302 when you do not pass a status. The browser then issues a `GET` for that location. Refresh repeats the `GET`. It does not repeat the insert. If create renders HTML directly, the address bar is still the `POST`. Refresh submits the form again, and you get a second document. The duplicate may even 409 if `hero` is unique, which hides the bug until the hero field is blank and you suddenly have two bells to ring.

Failed validation does not redirect. If the title is empty, respond 400 and send the form again, with a message in the HTML. A redirect would throw away the message unless you stored it somewhere else. The success path redirects. The failure path re-renders. A refresh of the failure page will try the `POST` again, which is the leftover cost of answering a `POST` with HTML, and it is still the right trade for a one-page form without a session store.

The stylesheet is a static file. `express.static(path.join(__dirname, 'public'))` serves files from that folder. `public/styles.css` is requested as `/styles.css`. The HTML links it.

```html
<link rel="stylesheet" href="/styles.css">
```

Express does not invent the design. If the link is missing, the browser shows unstyled HTML and the route is still fine. If the link is present and the CSS 404s, the static middleware is mounted wrong, or the file is not in `public`, or you opened a saved HTML file from disk and there is no server to answer `/styles.css`. Load the page through the port you listen on.

You do not need a template engine for this. Functions can return strings. A template engine is a later convenience, not the thing that makes INDUCES true. What you do need is escaping. A title of `<b>` or a quote must not break the markup, and it must not become live HTML that the next viewer runs. Escape before you interpolate into HTML. Do not escape when you store. Store the characters the person typed. Escape when you print.

What you should be able to draw on a napkin: seven routes, one noun, `/new` and `/:id/edit` before `/:id`, parser then `methodOverride('_method')` then the router, redirect on a successful write, a stylesheet that is a real file.

![](diagram:session-4-7/fig1-model)

### The seven, as a person actually clicks them

Start at `GET /quests`. The handler `await Quest.find({})` and builds a list. Each title is an anchor whose `href` is `/quests/` plus the id. A second anchor, `href="/quests/new"`, is the new page. No form on the index posts a create. The index is a read.

The new page is a form and a heading, nothing else.

```html
<form method="POST" action="/quests">
  <label>Title <input name="title" /></label>
  <label>Hero <input name="hero" /></label>
  <label>Status
    <select name="status">
      <option value="open">open</option>
      <option value="done">done</option>
      <option value="failed">failed</option>
    </select>
  </label>
  <button type="submit">Create</button>
</form>
```

Submit. The browser sends `POST /quests` with `Content-Type: application/x-www-form-urlencoded` and a body like `title=Ring+the+bell&hero=Ada&status=open`. `express.urlencoded` fills `req.body`. Create trims the title, rejects an empty one with the form and a 400, and otherwise `Quest.create`. On success, `res.redirect('/quests/' + quest._id)`. The next thing the browser paints is the show page, and the method in the address bar is `GET`.

The show page prints the title, the status, and the hero. It links to `/quests/` plus the id plus `/edit`. It also contains the delete form, which has to be a `POST` with the override in the query.

```html
<form method="POST" action="/quests/ID_HERE?_method=DELETE">
  <button type="submit">Delete</button>
</form>
```

The edit page is the same fields as new, with `value` attributes filled from the document, and the action points at the item.

```html
<form method="POST" action="/quests/ID_HERE?_method=PUT">
  <label>Title <input name="title" value="CURRENT" /></label>
  <button type="submit">Update</button>
</form>
```

Update loads nothing from the query string except the method. The fields come from the body. Build the update from `title`, `status`, and `hero` the way the keeper session's `PATCH` handler did; here the form's method is `PUT`, and the handler is the same shape: allowed keys only, `{ new: true, runValidators: true }`, and `findByIdAndUpdate` rather than `findOneAndReplace`. Then `res.redirect('/quests/' + id)`. A failed enum re-renders the edit form with 400. A missing document is a 404 page.

Delete calls `findByIdAndDelete`. If the document was already gone, 404. If it was removed, `res.redirect('/quests')`. The index query runs on that following `GET`, and the quest is absent. You never rendered a "deleted" template as the body of the `DELETE`. The index is the page that shows absence.

Walk that once with a single quest named something awkward, `Bell & "banner"`. If the show page prints the ampersand and the quote as characters, your escape works. If the markup tears or the rest of the page disappears, you interpolated raw text into HTML.

### How the strings get built

Keep the HTML in functions that take data and return a string. The layout function wraps every page so the stylesheet shows up once.

```js
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function layout(title, body) {
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<title>' + escapeHtml(title) + '</title>',
    '<link rel="stylesheet" href="/styles.css">',
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>'
  ].join('\n');
}
```

`escapeHtml` is not optional polish. It is the difference between a title and markup. Escape each piece of data at the point it enters a tag. Do not escape the HTML you yourself wrote, the tags and the link, or you will see the tags as text. The pattern is: you write the tags, you escape the quest.

```js
function questShow(quest) {
  const id = escapeHtml(quest._id);
  const body = [
    '<p><a href="/quests">All quests</a></p>',
    '<h1>' + escapeHtml(quest.title) + '</h1>',
    '<p>Status: ' + escapeHtml(quest.status) + '</p>',
    '<p>Hero: ' + escapeHtml(quest.hero || 'unassigned') + '</p>',
    '<p><a href="/quests/' + id + '/edit">Edit</a></p>',
    '<form method="POST" action="/quests/' + id + '?_method=DELETE">',
    '<button type="submit">Delete</button>',
    '</form>'
  ].join('\n');
  return layout(quest.title, body);
}
```

The new page and the edit page are the same form with different values, so one function builds it. `formFields` takes the values to fill in, the action, the method, and the button label. For `POST` the action is used as is. For `PUT` the override goes into the query string, because that is where `methodOverride('_method')` looks.

```js
function formFields(values, action, method, label) {
  const statuses = ['open', 'done', 'failed'];
  const options = statuses.map(function (status) {
    const selected = status === values.status ? ' selected' : '';
    return '<option value="' + status + '"' + selected + '>' + status + '</option>';
  });
  const target = method === 'POST' ? action : action + '?_method=' + method;
  return [
    '<form method="POST" action="' + escapeHtml(target) + '">',
    '<label>Title <input name="title" value="' + escapeHtml(values.title || '') + '" /></label>',
    '<label>Hero <input name="hero" value="' + escapeHtml(values.hero || '') + '" /></label>',
    '<label>Status <select name="status">' + options.join('') + '</select></label>',
    '<button type="submit">' + escapeHtml(label) + '</button>',
    '</form>'
  ].join('\n');
}
```

The new page is `layout('New quest', formFields({ title: '', status: 'open', hero: '' }, '/quests', 'POST', 'Create'))`. The edit page is `layout('Edit quest', formFields(quest, '/quests/' + quest._id, 'PUT', 'Update'))`, and the values come from the document, so the title and the hero are already in the boxes and the stored status is the selected option.

The id is escaped too. An ObjectId hex string has no special characters, and you still escape it, so the day the id is something else you do not have a second policy. `res.type('html').send(questShow(quest))` sends the string as HTML. `res.send` of a string already defaults toward HTML. Setting the type makes the intention obvious when you are also still thinking about `res.json` from the API sessions.

The index maps documents into list items. If the array is empty, the body says the board is empty and still links to `/quests/new`. Do not skip the layout on the empty path. The stylesheet belongs on the empty page too.

### Middleware order, including the static file

The stack, from the top of the file:

```js
const express = require('express');
const methodOverride = require('method-override');
const path = require('path');

const app = express();

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.originalUrl);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const quests = require('./quests-router');
const pages = require('./quests-pages');

app.use('/api/quests', quests);
app.use('/quests', pages);
```

Logger first, so you can see the `POST` and the following `GET` as two lines. Both parsers next; `express.json()` stays from the keeper session, and each parser skips the bodies it does not claim. Override next. Static next, so `/styles.css` is a file and not a route you hand-write. Then the two routers, then the 404, then the four-argument error handler.

The mounts are the step people skip. The JSON router from the keeper session was mounted at `/quests`. It moves to `/api/quests` now, in this one line, and nothing inside `quests-router.js` changes. Next session grows it there. `/quests` belongs to the paper router from today on. If both routers stay at `/quests`, whichever is mounted first answers, and the other one looks broken for no reason the log will explain. `path.join` keeps the public folder next to the server file even if you start Node from another working directory. The link in the HTML stays `/styles.css`, because that is a URL, not a disk path.

`public/styles.css` can be short and still prove the pipeline.

```css
body {
  font-family: Georgia, serif;
  margin: 2rem;
}

a {
  color: inherit;
}

form {
  margin-top: 1rem;
}
```

If you change the font and the browser does not change, view the source of the HTML and check that the link is there, then open `/styles.css` directly on the same origin. A 404 on that URL is the static middleware or the filename. A 200 on the CSS and an unstyled page means the HTML never linked it, or the browser cached an older failed load. Hard-reload once. Then believe the file.

### Create, update, and delete, the handlers that redirect

```js
async function create(req, res) {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const status = typeof req.body.status === 'string' ? req.body.status : 'open';
  const hero = typeof req.body.hero === 'string' ? req.body.hero.trim() : '';
  if (!title) {
    res.status(400).send(layout('New quest', formFields({ title: '', status: status, hero: hero }, '/quests', 'POST', 'Create') + '<p>Title is required.</p>'));
    return;
  }
  const input = { title: title, status: status };
  if (hero) input.hero = hero;
  let quest;
  try {
    quest = await Quest.create(input);
  } catch (err) {
    if (err.name !== 'ValidationError') throw err;
    res.status(400).send(layout('New quest', formFields({ title: title, status: status, hero: hero }, '/quests', 'POST', 'Create') + '<p>' + escapeHtml(err.message) + '</p>'));
    return;
  }
  res.redirect('/quests/' + quest._id);
}
```

Omitting `hero` when the box is blank keeps a sparse unique index from treating two empty heroes as duplicates. If your schema requires `hero`, this is the branch that should re-render with a message instead of omitting the field. Match `VAULT.md`. Do not silently drop a required field and hope the keeper's error page is HTML. A `ValidationError` that falls through to the JSON error handler shows JSON in the browser, which is why create catches it and re-renders the form with 400. Update does the same around `findByIdAndUpdate`. Everything else is rethrown with `throw err`, so a cast error or a duplicate key still reaches the four-argument handler, and that handler stays JSON: the courier next session needs it that way, and a 409 as a JSON body in a browser tab is an ugly page, not a wrong one.

Update redirects the same way after `findByIdAndUpdate`. Delete redirects to `/quests`. Neither handler sends the page that comes next. The next request does.

You can see the 302 without a browser. `curl -i` does not follow redirects unless you pass `-L`.

```bash
curl -i -X POST -d 'title=Ring+the+bell&hero=Ada&status=open' http://localhost:3000/quests
```

The status line is 302. `Location` points at `/quests/` and an id. A second curl of that location returns the HTML. Run the first curl again with the same body, without a redirect, only if you mean to create two quests. In the browser, click the button, then refresh. The document count does not increase. If it does, create sent HTML instead of redirecting, or you refreshed a 400 page that really was a `POST`.

### What the controller must not do

The controller does not concatenate a query into HTML. The show function does. The controller does not know the font. The stylesheet does. The model does not know what `_method` is. By the time `Quest.create` runs, the method has already been normalized and the body is an object of fields. If the model starts reading `req.query._method`, the keeper has learned HTTP, and the paper ledger can no longer be swapped for the JSON API you are about to write.

`_method` must not be stored. The query form of the override never puts it in `req.body`, which is why the action URL is the right default for `methodOverride('_method')`. The hidden-field getter has to delete `req.body._method` before you pass the body onward. If a quest document appears in the shell with a field named `_method`, a form field leaked into the insert. You passed `req.body` through. Stop doing that. Copy `title`, `status`, and `hero`.

## The demonstration

Stand up the seven routes against the model from the keeper session. Stop the old server with Ctrl-C, check that `server.js` mounts `quests` at `/api/quests` and `pages` at `/quests`, and start it again with `node --env-file=.env server.js`. One quest, clicked in order.

1. `GET /quests` shows an empty board and a link labeled New.
2. `GET /quests/new` shows the form. The terminal logged `GET`, and `db.quests.countDocuments()` did not change.
3. Submit a title of `Bell & "banner"` and a hero of `Ada`. The browser lands on the show page. The heading shows the ampersand and the quote as text. The terminal shows `POST /quests` and then `GET /quests/` plus the id.
4. Refresh. One document in the shell, not two.
5. Edit, change the status to `done`, submit. The show page shows `done`. Refresh. Still one document, still `done`.
6. Open `/styles.css` in the same origin and confirm the file is the one in `public`.
7. Delete. The browser lands on the index. The quest is gone from the list and from the shell.

Then break order on purpose. Move `pages.get('/:id', show)` above `pages.get('/new', fresh)`, restart, and open `/quests/new`. You get the cast failure, a 400 if your error handler maps `CastError`, or a 500 if it does not. The log shows `GET /quests/new`. The show route ran. Put `/new` back above `/:id`.

Then break the override. Remove `?_method=PUT` from the edit form's action, restart, and save. The terminal shows `POST /quests/` plus the id, and no `PUT` route handled it. The 404 middleware answers, or a `POST /:id` you accidentally registered creates a mess. Put the query back. If you are using the hidden-input getter instead, move it above `express.urlencoded` and watch the same symptom: the log stays `POST`. Parser first, then override. That order is the lesson, not a style.

```js run=checkpoint-4-7
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const routes = [
  { method: 'GET', path: '/quests' },
  { method: 'GET', path: '/quests/new' },
  { method: 'GET', path: '/quests/:id/edit' },
  { method: 'GET', path: '/quests/:id' },
  { method: 'POST', path: '/quests' },
  { method: 'PUT', path: '/quests/:id' },
  { method: 'DELETE', path: '/quests/:id' }
];

function match(method, path) {
  for (let i = 0; i < routes.length; i += 1) {
    const route = routes[i];
    if (route.method !== method) continue;
    const pattern = '^' + route.path.replace(':id', '[^/]+') + '$';
    if (new RegExp(pattern).test(path)) return route.path;
  }
  return null;
}

check(routes.length === 7, 'INDUCES is seven routes');
check(match('GET', '/quests') === '/quests', 'index is GET /quests');
check(match('GET', '/quests/new') === '/quests/new', 'new is a page, not an id');
check(match('GET', '/quests/abc/edit') === '/quests/:id/edit', 'edit matches the edit pattern');
check(match('GET', '/quests/abc') === '/quests/:id', 'show matches the id pattern');
check(match('POST', '/quests') === '/quests', 'create is POST /quests');
check(match('PUT', '/quests/abc') === '/quests/:id', 'update is PUT /quests/:id');
check(match('DELETE', '/quests/abc') === '/quests/:id', 'delete is DELETE /quests/:id');

function wrongOrder(path) {
  const bad = ['/quests/:id', '/quests/new'];
  for (let i = 0; i < bad.length; i += 1) {
    const pattern = '^' + bad[i].replace(':id', '[^/]+') + '$';
    if (new RegExp(pattern).test(path)) return bad[i];
  }
  return null;
}
check(wrongOrder('/quests/new') === '/quests/:id', 'registered too late, new is captured as an id');

function formMethod(browserMethod, queryMethod) {
  if (browserMethod === 'POST' && queryMethod) return queryMethod;
  return browserMethod;
}
check(formMethod('POST', 'PUT') === 'PUT', 'method-override restores PUT from _method');
check(formMethod('POST', null) === 'POST', 'without _method the update route never runs');
check(formMethod('GET', 'DELETE') === 'GET', 'a non-POST does not get rewritten by the default override');

function createResult(redirects) {
  if (redirects) return { status: 302, location: '/quests/1', insertsOnRefresh: false };
  return { status: 200, location: null, insertsOnRefresh: true };
}
check(createResult(true).status === 302 && createResult(true).insertsOnRefresh === false, 'a redirect makes refresh safe');
check(createResult(false).insertsOnRefresh === true, 'HTML after POST inserts again on refresh');

function stackOrder(names) {
  return names.indexOf('urlencoded') < names.indexOf('methodOverride') && names.indexOf('methodOverride') < names.indexOf('router');
}
check(stackOrder(['urlencoded', 'methodOverride', 'router']) === true, 'urlencoded is mounted before method-override, and both are before the router');
check(stackOrder(['methodOverride', 'urlencoded', 'router']) === false, 'method-override before the parser is the wrong order');

function stylesheet(html) {
  return html.indexOf('href="/styles.css"') !== -1;
}
check(stylesheet('<link rel="stylesheet" href="/styles.css">') === true, 'the page links the static stylesheet');

console.log('ok: checkpoint-4-7');
```

The checkpoint is the seven paths, the order bug, the override, the redirect, and the link. Click the real board before you call the session done. A checkpoint cannot see your CSS file.

## Where it breaks

![](diagram:session-4-7/fig2-diagnosis)

### new is an id

`/quests/new` was registered after `/quests/:id`, so `new` is passed to `findById` and the cast fails. The log is `GET /quests/new`. The handler that runs is show, not the form. The error is a `CastError` on `_id`, which you already know how to answer with 400, and that 400 is the wrong page. The person wanted a form.

Move `GET /new` above `GET /:id`. Restart, because a running process will keep the old order. Request `/quests/new` again. The log is the same URL and the handler is the form. Do not add `if (req.params.id === 'new')` inside show. That hides the order bug inside a function that is supposed to load one document.

If edit 404s, check the path you registered. It is `/:id/edit` on a router mounted at `/quests`, or `/quests/:id/edit` on the app, not both prefixes stacked. A doubled prefix is a different bug, and the log's `originalUrl` shows it.

### Form cannot PUT

The browser sent `POST` and the update route never ran. `_method` was missing, or method-override was mounted before the body parser.

Look at the log's method. If it says `POST` and the path is the quest id, the override did not change `req.method`. Open the form in the page source. For `methodOverride('_method')`, the action must include `?_method=PUT` or `?_method=DELETE`. A hidden input without the query is invisible to that helper. Either add the query, or switch to the custom getter on the method-override page, the one that reads `req.body._method`.

If the source already has the hidden input and you wrote the custom getter, check mount order. `express.urlencoded` has to run first, or `req.body` is empty and the getter returns nothing. The method stays `POST`. `pages.put` does not run. A `POST` handler for `/:id` might run instead, if you added one, and you will insert or 404 for reasons that look supernatural. Fix the order. Parser, then override, then routes. The default allowed original method is `POST`, so a real `GET` is left alone. Your form's method attribute stays `POST`.

### Double submit

Create did not redirect, so a refresh inserts a second document. The address bar shows `/quests` and the page looks like the list, but the document that produced the page was the response to `POST`. Refresh repeats the last request. Two bells. Or a 409, if the unique index saves you, which is luck rather than a design.

Send 302 to a `GET`. Confirm with `curl -i` that create's status is 302 and `Location` is the show path. Then click it in the browser and refresh while watching `db.quests.find()`. The count stays still. Apply the same redirect to update and delete. An update that re-renders the edit page on success has the same refresh bug: a second save. It may be harmless if the write is idempotent, and it is still the wrong shape. Land on a `GET`.

If the redirect points at `/quests/new`, you are sending people back to an empty form after success. That is a choice, and it is a worse one, because they cannot see the document they made. Point at the show page or the index. Both are `GET`s you already wrote.

## Your turn

1. `npm install method-override`. Keep `express.urlencoded` from Express itself. Mount `express.json()`, the urlencoded parser, then `methodOverride('_method')`, then `express.static` for `public`.
2. Add `public/styles.css`, the layout function that links `/styles.css`, and `formFields`. Escape titles before they enter HTML.
3. In `server.js`, move the JSON router's mount from `/quests` to `/api/quests`. Then create `quests-pages.js`, register all seven routes in the safe order, and mount it at `/quests`. Index, new, edit, show, create, update, delete. One resource, two doors.
4. New renders the empty form. Create validates, inserts, and redirects to show. Show links to edit and contains the delete form. Edit's form posts with `?_method=PUT`. Update redirects to show. Delete redirects to index.
5. Use a title that contains an ampersand and a quote. The page shows them as text.
6. Refresh after create. Confirm a single document.
7. Swap the order of `/new` and `/:id`, watch the cast fail, and put the order back.
8. Remove `_method` once, watch the log stay `POST`, and put it back.

When a write seems to do nothing, read the method in the log before you read the model. The model is often never called.

## The quest

![](diagram:session-4-7/fig3-evidence)

Write `LEDGER.md`. One line per INDUCES letter: the method, the path, and the one job, including whether the route sends HTML or redirects. Then three proofs from the running board:

- The order proof: what `/quests/new` did when `/:id` was registered above it, and what it did after you fixed the order.
- The redirect proof: the 302 and `Location` from `curl -i` on create, and the document count after a browser refresh.
- The CSS proof: the HTML link, the URL you opened for the file, and the status of that URL.

Add the mount order as a short list: json, urlencoded, method-override, static, the JSON router at `/api/quests`, the pages router at `/quests`, 404, error handler. Commit the routes, the layout, `public/styles.css`, and `LEDGER.md`. Do not commit a template-engine dependency you do not use. Plain HTML strings and a static file are the whole view.

## Side quests

The controller is a mediator between the Mongoose model and the HTML you send, and method-override together with the body parser is a chain of responsibility whose order is the design.

## Before next session

Next session throws the paper away and keeps the quests. The client sends JSON and receives JSON. Nothing redirects. `express.json()` has to be mounted before the routes, success on create is 201 with one body, a bad title is 400, and a missing document is 404. Read `res.json` again and the error-handling note about what the default handler sends, because an HTML stack trace in an API response is the bug you are about to remove. The seven names can stay in your head. The verbs stay. The representation changes. Stop the server with Ctrl-C when you are done.
