---
editorial: true
title: The Counter's Three Laws
subtitle: REST, MVC, and JSON
hook: "A URL is not a page. It is a noun, the method is the verb, and the body is JSON. MVC is how you keep those three from collapsing into one file."
read: 50
artifact: "A resource map for quests: method, path, status, and which of model, view, or controller owns it"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://expressjs.com/en/guide/routing.html
  - https://expressjs.com/en/5x/api.html#res.json
  - https://www.rfc-editor.org/rfc/rfc9110
say:
  - "A resource is a noun. The method is the verb. The path identifies which noun."
  - "MVC splits data, the decision, and the bytes you send back."
  - "JSON is text with a shape. res.json sets the content type and serializes the value."
---

## The hook

The door from last session will answer any path you register. That freedom is how a server turns into a pile of names like `/getQuests`, `/doQuest`, and `/quest/delete`. A client can call them. A cache cannot tell which ones are safe to store. A teammate cannot tell which file owns the rule. Today you stop naming actions and start naming things. A quest is a resource. The method is the verb. The bytes you send back are a representation, and right now that representation is JSON. MVC is the split that keeps the noun, the decision, and the bytes from collapsing into one function that knows everything.

By the end of the session you can draw a map of the quest resource: method, path, success status, and which of model, view, or controller owns the work. You can say why a create answers 201, and why `res.json` is not the same call as `res.send` of a string you built by hand.

> *The counter does not shout the verb. The counter names the thing, and the way you approach it is the verb.*

## The idea

A resource is a noun you can point at. Quests are a resource. One quest is a resource. The path identifies which noun. `/quests` is the collection. `/quests/42` is one quest, if `42` is its id. The path does not say "get" or "create" or "search." Those words are methods. `GET` reads a representation. `POST` asks the collection to accept a new quest. `PUT` replaces the representation of one quest. `PATCH` sends a partial change. `DELETE` removes the quest. The same path `/quests/42` can be all of `GET`, `PUT`, `PATCH`, and `DELETE`, and they stay distinct because the method is part of the request, not part of the spelling.

That split is what RFC 9110 is about, in the part that assigns meaning to methods. `GET` is safe: intermediaries are allowed to assume it does not change the resource. A `GET` that deletes a quest is a lie the protocol will not catch, and a cache may replay it. `PUT` and `DELETE` are idempotent: doing them twice leaves the resource in the same state as doing them once. `POST` is not. Two identical `POST /quests` calls are allowed to create two quests. You will care about that again when a browser refresh resubmits a form. Today, care about it because the status code is how the client tells those outcomes apart without reading your function names.

A create that returns 200 asks the client to guess. The request succeeded, but so does a search, a no-op, and a "we accepted the bytes and ignored them." `201` says a resource now exists. Pair it with a body that is the quest you stored, so the client can read the id the database assigned. A read of a missing quest is `404`. A body that fails validation is `400`. A conflict, such as a duplicate you forbade, is `409`. You do not need the whole registry. You need one success status per route on the map, chosen because of what the method did, and used the same way every time.

JSON is the representation, not the resource. The quest can be HTML in a later session and JSON in this one, and it is still the same quest. On the wire JSON is text with a grammar. Quotes are escaped. Nested objects use braces. There is no `undefined`, and there are no comments. `res.json(value)` does two things the API page documents: it serializes the value, and it sets the content type to `application/json`. `res.send` of a string you concatenated does the first job badly and skips the second. Express treats a string passed to `res.send` as HTML unless you already set a type. A title like `Fetch the "banner"` breaks a hand-built string the moment a quote meets your concatenation, and the client that does `JSON.parse` throws. `JSON.stringify`, which is what `res.json` uses, escapes the quote. You never build JSON with `+`.

MVC is how the code stays as separated as the protocol. The model knows what a quest is and how it is stored. It takes plain objects and returns plain objects or throws. It does not read `req`, and it does not call `res`. The controller is the function Express calls. It reads the method's inputs, `req.params`, `req.query`, and `req.body`, calls the model, and chooses the status. The view, for this session, is the small function that turns the model's value into the response body. With JSON, that function is mostly `res.status(code).json(value)`. It does not call the database. Later, when the view is an HTML string, the same boundary holds: the function that builds tags does not query, and the function that queries does not know the tags.

If you skip the split, the route handler becomes the only place that knows the shape, the status, and the storage. It works for one route. At seven routes the validation is copied, the status codes drift, and a change to "what a quest is" means editing every handler. The map you write today is the antidote. Every route has a method, a path, one success status, and a single owner for the decision.

What you should be able to draw on a napkin: nouns in the path, verbs in the method, one status for success, JSON via `res.json`, and three piles of code that do not reach into each other's arguments.

![](diagram:session-4-3/fig1-model)

### The map, before any new code

Write this down before you open the editor. It is the artifact, and it is also the specification.

| Method | Path | Success | Who decides |
| --- | --- | --- | --- |
| GET | /quests | 200 | Controller asks the model for the list. The response is a JSON array. |
| POST | /quests | 201 | Controller checks the body. Model creates. Response is the created quest. |
| GET | /quests/:id | 200 | Model looks up one. Missing is 404, not an empty 200. |
| PUT | /quests/:id | 200 | Model replaces the stored fields you allow. Response is the quest after. |
| PATCH | /quests/:id | 200 | Model applies a partial change. Omitted fields stay. |
| DELETE | /quests/:id | 200 | Model removes it. Response is the quest that was removed. |

`PATCH` is the partial-update method. `PUT` means the body is the replacement of the representation you accept. Using `POST /quests/:id/update` throws away both of those meanings and hides a write inside a path. Using `GET /deleteQuest?id=1` is worse: the method that caches are allowed to treat as safe would delete. The path `/getQuests` is the diagnosis in miniature. Even if you implement it as `GET`, the name says the verb twice, and a later teammate will "fix" it into `POST /getQuests` because the path already sounds like a procedure. Clients, logs, and caches key on method plus path. Give them a method worth reading.

Collection routes and item routes are different resources. `POST` goes to the collection, because the client does not know the id yet. The server assigns it. `PUT` and `PATCH` and `DELETE` go to the item, because they name an existing quest. `PUT /quests` with no id is a request to replace the entire collection. You are not offering that. Leave it unregistered so it falls through to 404, rather than quietly creating one quest.

### What the controller is allowed to know

The controller coordinates. It does not invent quest rules, and it does not hand-format JSON. A create controller looks like this in responsibilities, even before the database exists:

The body is either an object or it is not. Last session's parser is why. If `req.body` is missing, that is a stack bug, not a validation bug. If `title` is missing or blank, the controller responds 400 and does not call the model. If the title is present, the controller passes `{ title: title }` to the model and waits. On success it responds 201 with the value the model returned, which may contain an id and a default status the client never sent. On a failure the model throws, the error reaches the handler you wrote last session, and the status follows the error. The controller does not catch merely to `console.log` and then fall off the end. That is the hanging request again.

The model function for a list returns an array. An empty board is `[]` and status 200. Emptiness is not a 404. A 404 means the resource named in the path does not exist. The collection exists even when it contains nothing. The item route is the opposite: a well-formed id that matches nothing is 404, with a JSON body that says so, one object, not a stack trace. You will meet a third case in the Mongoose session, a malformed id, and that one is 400. Leave room for it on the map. Do not call every failure 500, and do not call every failure 200 with `{ ok: false }` buried in the body. The status is the sentence. The body is the detail.

The response function is deliberately boring.

```js
function sendJson(res, status, value) {
  res.status(status).json(value);
}
```

It does not read `req`. It does not know what a quest is. Controllers call it. If you later change the error shape to `{ message: string }`, you change it in the places that build errors, and `sendJson` still only serializes. If a controller starts concatenating strings "just for this one route," the content type drifts and the map is a lie.

### Representation, and the traps inside `JSON.stringify`

`res.json` calls `JSON.stringify` on the value. A few results surprise people who only ever `console.log` objects in a browser, where the console shows live objects rather than text.

A field whose value is `undefined` is omitted. `{ title: 'Ring the bell', note: undefined }` becomes `{"title":"Ring the bell"}`. The client cannot tell "you stored null" from "you left the key out." If absence matters, store `null` on purpose. A `Date` becomes an ISO string. You will not get a date object back from `JSON.parse` on the client. A function on the object disappears. A `BigInt` throws. Circular structures throw. None of these are Express bugs. They are the grammar of JSON, and they happen before the bytes hit the socket.

Strings are escaped. A title containing a quote, a backslash, or a newline survives `res.json` and fails the hand-built version:

```js
const title = 'Fetch the "banner"';
const broken = '{"title":"' + title + '"}';
const sound = JSON.stringify({ title: title });
```

`broken` is not valid JSON. `sound` is. The content type is the other half. A client that branches on `Content-Type` will treat a `text/html` body as a page even when the text happens to look like JSON. `curl -i` shows the header. Look at it once per route and write it on the map. The success line for every JSON route in this session includes `application/json`.

Status and body disagree when you remember one and forget the other. `res.status(201)` without `.json` or `.send` does not end the response. You set a field on `res` and then returned. That is last session's hang, wearing a status code. `res.json(value)` sends 200 unless you set a status first, or unless you pass the status in the chain `res.status(201).json(value)`. The 201 has to be on the same response as the body. A log that says "created" is not a 201.

### MVC when there is still no database

You can split the files before MongoDB exists. The model holds an array in the module on purpose, and you already know from the runtime session that the array will die when the process dies. That limitation is the next session's subject. It does not excuse mixing `req` into the model today.

```js
const quests = [];
let nextId = 1;

function listQuests() {
  return quests.map(copyQuest);
}

function createQuest(input) {
  const quest = {
    id: String(nextId),
    title: input.title,
    status: 'open'
  };
  nextId += 1;
  quests.push(quest);
  return copyQuest(quest);
}

function findQuest(id) {
  const found = quests.find((quest) => quest.id === id);
  return found ? copyQuest(found) : null;
}

function copyQuest(quest) {
  return { id: quest.id, title: quest.title, status: quest.status };
}

module.exports = { listQuests, createQuest, findQuest };
```

`copyQuest` keeps the stored object from being the same reference you handed to `res.json`. A caller that mutates the response value must not mutate the store. The model returns data. It does not return its internal array. `createQuest` does not look at `req.body`. The controller does:

```js
const model = require('./quests-model');

function create(req, res) {
  const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    res.status(400).json({ message: 'title required' });
    return;
  }
  const quest = model.createQuest({ title: title });
  res.status(201).json(quest);
}
```

The controller knows HTTP. The model knows the default status. Neither builds a string of JSON by hand. When the array is replaced by a database, `createQuest` changes and this controller stays. That is the point of the split. If the controller imported a schema, or the model imported Express, the split has already failed and the map's "who decides" column is fiction.

### Verbs that do not belong in the path

A search is still a read of the collection. `GET /quests?status=open` filters. The query string is not a second path. Caches and logs keep the path stable and show the query beside it. `POST /quests/search` with a JSON body is a different design, used when the filter is large or must not be logged in a URL. A quest board's filters fit in the query string. Do not invent `/getOpenQuests` because the `if` was easy.

Actions that are real operations still get nouns when you can name the result. "Complete a quest" can be `PATCH /quests/:id` with `{ "status": "done" }`, because completion is a change to the quest's state, not a new kind of endpoint. You resort to `POST /quests/:id/completion` only when the operation has its own rules and its own resource. That day is not today. Today the board is one noun and five methods.

Names are plural for the collection. `/quest` and `/quests` as two styles in one app will split your client code in half. Pick `/quests`. The id segment is a noun's identity, not a verb. `:id` in Express is a pattern. The client sends the actual id. Your map writes `/quests/:id`. Your curls write `/quests/1`.

## The demonstration

Keep the stack from last session: logger, `express.json()`, router, 404, error handler. Stop last session's server with Ctrl-C before you restart. Put the model in `quests-model.js` and the routes in `quests-router.js`, both in `~/projects/guild-door`. The router is the controller layer.

```js
const express = require('express');
const model = require('./quests-model');

const quests = express.Router();

quests.get('/', (req, res) => {
  const status = req.query.status;
  let rows = model.listQuests();
  if (status) {
    rows = rows.filter((quest) => quest.status === status);
  }
  res.status(200).json(rows);
});

quests.post('/', (req, res) => {
  const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    res.status(400).json({ message: 'title required' });
    return;
  }
  const quest = model.createQuest({ title: title });
  res.status(201).json(quest);
});

quests.get('/:id', (req, res) => {
  const quest = model.findQuest(req.params.id);
  if (!quest) {
    res.status(404).json({ message: 'quest not found' });
    return;
  }
  res.status(200).json(quest);
});

module.exports = quests;
```

Then wire it. In `server.js`, delete the `const quests = express.Router()` block and its three inline handlers from last session, and put this in their place. The mount line stays where it was, after `express.json()` and before the 404.

```js
const quests = require('./quests-router');

app.use('/quests', quests);
```

`GET /quests` returns `[]` and `200` and `Content-Type: application/json`. `POST` a title and the next `GET` includes it, with `status` equal to `open`, because the model applied the default and the controller did not invent a second one. `GET /quests/nope` returns 404 and a JSON object, not an HTML page and not a 200 with `null`. `GET /quests?status=open` still hits the collection route. The query never changes which function matches.

Then prove the string bug in a scratch handler you delete afterward.

```js
app.get('/broken', (req, res) => {
  const title = 'Fetch the "banner"';
  res.send('{"title":"' + title + '"}');
});
```

`curl -i http://localhost:3000/broken` shows a `text/html` content type, or whatever Express assigns a raw string, and a body that `JSON.parse` rejects. The repaired version is `res.json({ title: title })`. The header becomes `application/json`. The quote survives. Delete `/broken` when you have seen both. It should not remain on the map.

```js run=checkpoint-4-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function routeFor(action) {
  const table = {
    list: { method: 'GET', path: '/quests', status: 200 },
    create: { method: 'POST', path: '/quests', status: 201 },
    read: { method: 'GET', path: '/quests/:id', status: 200 },
    replace: { method: 'PUT', path: '/quests/:id', status: 200 },
    change: { method: 'PATCH', path: '/quests/:id', status: 200 },
    remove: { method: 'DELETE', path: '/quests/:id', status: 200 }
  };
  return table[action];
}

check(routeFor('list').method === 'GET' && routeFor('list').path === '/quests', 'a list is a noun plus GET');
check(routeFor('list').path.indexOf('get') === -1, 'the verb is not hiding in the path');
check(routeFor('create').status === 201, 'create answers 201');
check(routeFor('create').path === '/quests', 'create targets the collection');
check(routeFor('replace').method === 'PUT' && routeFor('change').method === 'PATCH', 'replace and partial change are different verbs');

function jsonResponse(value) {
  return { type: 'application/json', body: JSON.stringify(value) };
}

function stringResponse(text) {
  return { type: 'text/html', body: text };
}

const quest = { title: 'Fetch the "banner"' };
const good = jsonResponse(quest);
check(good.type === 'application/json', 'json sets the content type');
check(JSON.parse(good.body).title === quest.title, 'json serializes a title that contains a quote');

const bad = stringResponse('{"title":"' + quest.title + '"}');
let parsed = true;
try {
  JSON.parse(bad.body);
} catch (err) {
  parsed = false;
}
check(parsed === false, 'a hand-built string breaks when the title contains a quote');
check(bad.type !== 'application/json', 'a hand-built string does not set the json content type');

function owns(layer, thing) {
  const rules = {
    model: { req: false, schema: true, database: true },
    controller: { req: true, schema: false, database: false },
    response: { req: false, schema: false, database: false }
  };
  return rules[layer][thing];
}

check(owns('model', 'req') === false, 'the model has no req');
check(owns('controller', 'schema') === false, 'the controller has no schema');
check(owns('response', 'database') === false, 'the response function has no database call');

const emptyBoard = { status: 200, body: [] };
const missing = { status: 404, body: { message: 'quest not found' } };
check(emptyBoard.status === 200 && emptyBoard.body.length === 0, 'an empty collection is 200 and an array');
check(missing.status === 404, 'a missing quest is 404');

console.log('ok: checkpoint-4-3');
```

The checkpoint is the map, the content type, and the ownership rules, checked as data. Your curls are the other half. If the model file imports Express, the checkpoint's rule and the folder disagree, and the folder is wrong.

## Where it breaks

![](diagram:session-4-3/fig2-diagnosis)

### Verb in the path

`/getQuests`, `/createQuest`, `/quests/delete` hide the method, so caches and clients cannot tell a read from a write. The log line `GET /getQuests` looks like a read and might be one, until someone adds a side effect because the name sounded like a command. The log line `POST /getQuests` is a write that the path claims is a read. Neither URL tells the truth without opening the handler.

Rename by the noun. The collection is `/quests`. One quest is `/quests/:id`. The method carries the verb. If a client already calls the old path, keep the old route as a temporary forwarder that calls `next` into the real handler, or answer 404 and fix the client. Do not let both spellings grow separate behavior. Two paths that create quests will drift, and the map will not say which status is real.

### Wrong status

A create that returns 200 forces the client to guess. The body might contain the quest, or a message, or the whole list. `201` plus the created quest is the contract. The other direction is just as common: a missing quest returns 200 and `null`, or 200 and `{ found: false }`. The client that only checks "the request succeeded" will render a blank page and call it success. `404` is how HTTP says the noun is not there.

Check the map against `curl -i`, not against the happy text in the body. The status is on the first line of the response. If `POST` shows `200 OK`, the chain never set 201. `res.json` alone does not look up "what this method should mean." You set it.

A validation failure returned as 500 is the same family of bug. The client did something fixable, sent no title, and you let the model throw a generic error. The controller should have answered 400 before the model ran. Reserve 500 for failures the client cannot repair by changing the body.

### JSON as a string

`res.send` of a hand-built string forgets the content type, and a quote in the title breaks the body. It shows up the first time a player names a quest with an apostrophe or a quote, which they will do immediately. The handler looked fine when every title was `hello`.

Replace the concatenation with an object and `res.json`. If you need a field renamed for the client, rename it in the object, then serialize once. Do not `JSON.stringify` yourself and then `res.send` the string unless you also set the content type, and even then you have done `res.json`'s job by hand. One path. One serializer.

If the body is already a string because some earlier layer stringified it, `res.json` will stringify again. The client receives a JSON string whose contents are JSON, quotes escaped twice. Pass the object.

## Your turn

1. Write the map, on paper or in the quest file, before you add routes. Six rows. Method, path, success status, and the layer that owns the decision.
2. Split a model module from the router. The model holds the array, the default status, and functions that take plain values. It does not import Express.
3. Implement `GET /quests`, `POST /quests`, and `GET /quests/:id` to match the map. Empty list is 200 and `[]`. Missing id is 404 and a JSON message. Create is 201 and the quest, including the id and `status: "open"`.
4. Curl each one with `-i`. Copy the status line and the `Content-Type` into the map. If the type is not `application/json`, you sent a string.
5. Add the broken string route, curl a title that contains a quote, watch `JSON.parse` fail, then delete the route.
6. Add `GET /quests?status=open` as a filter inside the collection handler, not as a new path. Confirm `POST /getQuests` does not exist.

When a status surprises you, fix the map and the handler together. A handler that has drifted off the map is the bug, even if the body looks right.

## The quest

![](diagram:session-4-3/fig3-evidence)

Turn the map into `RESOURCE.md`. One table for the quest resource. Each row is a method, a path, the success status, and a sentence for who owns it: model, controller, or the response. Under the table, three short proofs from your own curls:

- The list path contains no verb, and `GET` versus `POST` on that path do different work.
- Create's status line is `201`, and a missing quest's status line is `404`.
- The content type on every success and error you implemented is `application/json`.

Add a fourth note that points at the files: the model has no `req`, the controller has no schema and no stored array of its own, and the response call has no database call. You do not have a schema yet. Say that plainly, so the next session has somewhere to put one. Commit the model, the router, and `RESOURCE.md`.

## Side quests

REST is one choice among API styles, sitting beside GraphQL and gRPC, and a controller that coordinates the model and the response so they never talk past it is a mediator.

## Before next session

The array in the model is about to embarrass you. Restart the process and the quests are gone. Next session is why a database exists at all: documents that outlive the process, collections instead of modules, and an index that is both a speed tool and a rule. Read the MongoDB introduction's opening, and the pages on documents and on databases and collections. You want the vocabulary, not a cluster design. Arrive able to say "document" and "collection" out loud, and able to explain why the array you used today is a different kind of memory.

The map stays. The methods stay. The owner of storage changes from a variable to a database. MVC still means the controller does not grow a connection string in the middle of a status decision. Stop the server with Ctrl-C when you are done; next session starts by installing the database, with nothing running.
