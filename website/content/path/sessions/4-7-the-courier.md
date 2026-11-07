---
editorial: true
title: The Courier
subtitle: A RESTful API that returns JSON
hook: "The same quests, with the HTML left behind. The client sends JSON and receives JSON. Status codes do the talking that a redirect used to do."
read: 55
artifact: "A JSON API for quests: GET, POST, PUT, DELETE, validation errors as 400, missing records as 404"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://expressjs.com/en/guide/routing.html
  - https://expressjs.com/en/5x/api.html#res.json
  - https://expressjs.com/en/guide/error-handling.html
  - https://mongoosejs.com/docs/models.html
say:
  - "express.json() parses a body only when the content type is application/json, and only if it is mounted before the route."
  - "Success is a status plus one body. Errors are a status plus a message, not an HTML page."
  - "The API does not redirect. The client decides what to show."
---

## The hook

The ledger prints pages. A courier carries one parcel and a status, and does not stand in the doorway redirecting people to another counter. This session is the same quests, with the HTML left behind. The client sends JSON and receives JSON. `express.json()` runs before the routes, and only when the content type says the body is JSON. Create answers 201 and the document. A title that fails validation answers 400 and writes nothing. An id that matches nothing answers 404. Every one of those responses has one body. None of them is a 302, and none of them is an HTML stack trace.

By the end you can drive the board with curl and read the contract off the status line without opening the handler. The browser is no longer the client you are designing for. The client is anything that can send a method, a path, a content type, and a JSON body.

> *The page was a letter the server wrote. The API is a parcel with the status stamped on the outside.*

## The idea

The resource map does not change. `GET /api/quests` is the collection. `POST /api/quests` creates. `GET /api/quests/:id` reads one. `PUT /api/quests/:id` replaces the fields you allow. `DELETE /api/quests/:id` removes one. The `/api` prefix is how this router sits beside the paper routes if you still have them, and how a log line tells you which door was used. Inside the router you still register `'/'` and `'/:id'`. The mount is `app.use('/api/quests', quests)`.

What changes is the representation and the way a write finishes. The paper ledger answered a successful `POST` with 302 and a `Location`, and the browser issued a second request to get HTML. This API does not redirect. The client that sent the `POST` is the client that needs the result, and it may not be a browser that follows redirects and paints pages. `201` plus the created document is the whole answer. One status. One body. The client decides what to show. If you `res.redirect` here, a JSON client receives 302 and then, if it follows, a document from a different URL, or an HTML page it cannot parse. You took the courier's parcel and replaced it with a forwarding note.

`express.json()` is built in, the same as `express.urlencoded`. It parses a body only when `Content-Type` matches `application/json`, and only if it is mounted before the route that reads `req.body`. After it runs, `req.body` is the object. Before it runs, or when the header is something else, `req.body` stays unset. Curl's `--data` flag defaults to `application/x-www-form-urlencoded`. A careful JSON post looks like this.

```bash
curl -i -H 'Content-Type: application/json' \
  -d '{"title":"Ring the bell"}' \
  http://localhost:3000/api/quests
```

Drop the header and the parser skips the body. The route sees `undefined` and, if you wrote it carefully, answers 400 because there is no title. If you wrote `req.body.title` without checking that `req.body` exists, it throws, and the client gets whatever your error handler sends. Those are different bugs. Undefined body means the parser did not run. A thrown read of `.title` means the handler assumed too much. Malformed JSON is a third case: the content type is right and the bytes are not JSON. The parser fails the request and your create function does not run. Teach the error handler to answer that failure as JSON too, or the client receives the default error page for a typo in a payload.

`res.status(code).json(value)` sets the content type and ends the response. Call it once. The collection route sends the array itself, not an envelope with a message beside it. The evidence for this session is that `GET /api/quests` returns an array. `[]` is a legal body and a 200. The item route sends the document, or it sends 404 and one object, `{ "message": "quest not found" }`. Create sends the document and 201. Validation sends one object whose only job is a `message`, and 400, and the collection is unchanged. Delete sends the deleted document and 200, or 404 if it was already gone. This contract uses a body on every answer, including delete, so a client always parses one JSON value. You are not using 204. 204 means no body, and a body after 204 is a protocol mistake. One status, one JSON value, every time.

The model stays the Mongoose model. The controller reads JSON fields instead of form fields, calls the same `create`, `find`, `findById`, `findByIdAndUpdate`, and `findByIdAndDelete`, and picks the status. The response function is `res.status().json()`. It does not build HTML, and it does not redirect. If a handler contains both `res.json` and `res.redirect`, one of them is dead code or a headers-sent bug. Delete the redirect.

Validation happens before the write. An empty title, a title that is not a string, a status outside the enum: 400, and `Quest.create` is not called. You can prove the "writes nothing" half with a count in the shell before and after the curl. A 400 that still inserts is a handler that saved first and checked later, or a handler that checked the HTTP status in a log and ignored the database. The status is not the proof of the write. The collection is.

Missing and malformed ids stay distinct. `findById` returning `null` is 404. A `CastError` is 400. Both bodies are JSON. A 500 on either one means the error handler is still the default, or your branch did not recognize the error. The default handler, as the error-handling guide describes it, writes HTML: the stack when `NODE_ENV` is not `production`, and an HTML status message when it is. An API client cannot parse that page as a quest. Your four-argument handler answers `{ "message": "..." }` and the right status, including for errors the parser produced. Mount it last, with four parameters, the same way as before.

What you should be able to draw on a napkin: `express.json()` in front of the router, one status and one JSON body, 201 on create, 400 on a bad body with no write, 404 when the document is absent, no redirect, no HTML.

![](diagram:session-4-7/fig1-model)

### The handlers, one status each

The router is small because the model already exists. The new discipline is refusing to do two things at the end.

```js
const express = require('express');
const Quest = require('./quest-model');

const quests = express.Router();

quests.get('/', async (req, res) => {
  const filter = {};
  if (typeof req.query.status === 'string' && req.query.status) {
    filter.status = req.query.status;
  }
  const docs = await Quest.find(filter);
  res.status(200).json(docs);
});

quests.post('/', async (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ message: 'json body required' });
    return;
  }
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    res.status(400).json({ message: 'title required' });
    return;
  }
  const input = { title: title };
  if (typeof body.status === 'string') input.status = body.status;
  if (typeof body.hero === 'string' && body.hero.trim()) input.hero = body.hero.trim();
  const quest = await Quest.create(input);
  res.status(201).json(quest);
});

quests.get('/:id', async (req, res) => {
  const quest = await Quest.findById(req.params.id);
  if (!quest) {
    res.status(404).json({ message: 'quest not found' });
    return;
  }
  res.status(200).json(quest);
});

quests.put('/:id', async (req, res) => {
  const body = req.body;
  if (!body || typeof body.title !== 'string' || body.title.trim() === '') {
    res.status(400).json({ message: 'title required' });
    return;
  }
  const update = {
    title: body.title.trim(),
    status: typeof body.status === 'string' ? body.status : 'open'
  };
  if (typeof body.hero === 'string' && body.hero.trim()) update.hero = body.hero.trim();
  const quest = await Quest.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });
  if (!quest) {
    res.status(404).json({ message: 'quest not found' });
    return;
  }
  res.status(200).json(quest);
});

quests.delete('/:id', async (req, res) => {
  const quest = await Quest.findByIdAndDelete(req.params.id);
  if (!quest) {
    res.status(404).json({ message: 'quest not found' });
    return;
  }
  res.status(200).json(quest);
});

module.exports = quests;
```

Read the endings. Every path that finishes the response uses `.json` once and returns. `POST` uses 201 only after `create` resolves. If `create` throws a `ValidationError`, the error handler answers 400 and the document is not in the collection, because the save failed. The empty-title branch never calls `create` at all, which is the one you can prove with a count even if the database is empty. `PUT` requires a title because this handler is writing the fields it intends to keep. It still uses `findByIdAndUpdate` with `runValidators: true`, so a status outside the enum fails, and the plain object is sent as `$set`, so a field you left out of `update` is not blanked. `findOneAndReplace` would blank it. If your `PUT` is a stricter replace, say so in the route's note and require every field. Do not `res.redirect` to the `GET` afterward. The body of the 200 is the document. The client already has it.

`GET /` returning an array means the JSON text starts with `[`. A wrapper object that contains an array fails the contract even when the data is right. Clients will look at `response[0].title` or at `response.length`. Give them the array. Errors are the exception: there is no document, so the body is `{ "message": "..." }`. Do not sometimes return the document and sometimes return `{ quest: document }`. One shape for success on that route, one shape for errors across the API.

### The parser, in front, and the handler behind it

```js
app.use(express.json());
app.use('/api/quests', quests);
```

That order is the whole undefined-body bug when it is a mount bug. Reverse the two lines and a correct curl still arrives with `Content-Type: application/json`, and `req.body` is still undefined, because the route answered before the parser ran. Express does not rewind the stack after a route fails to see a body. Mount the parser on the app, above every API router. If you also serve the paper ledger, keep `express.urlencoded` for the form routes. The two parsers look at different content types and can both be mounted. A JSON request will not be eaten by the urlencoded parser. A form post will not be eaten by `express.json()`. Each one skips bodies it does not claim, and calls `next`.

A route mounted on a separate `express()` application that you forgot to give the parser is the same bug in disguise. The app that listens is the one that needs the middleware. A router file that calls `express.json()` at the bottom of the file, after `module.exports`, does nothing for the requests you already registered.

When the body is undefined, answer 400 from the create handler if you can do it without throwing. The check `if (!body || typeof body !== 'object')` covers the skipped parser. An array body is an object in JavaScript, and it is still the wrong shape for a quest. You can reject arrays with `Array.isArray(body)`. A quest create is one object with a title. Anything else is 400 and no write.

### Errors as parcels, not pages

```js
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err.name === 'CastError') {
    res.status(400).json({ message: 'bad id' });
    return;
  }
  if (err.code === 11000) {
    res.status(409).json({ message: 'that hero already has a quest' });
    return;
  }
  if (err.name === 'ValidationError') {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    res.status(400).json({ message: 'invalid json' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});
```

Four arguments. Last in the file. The `SyntaxError` branch is there because a broken JSON body arrives as an error from the parser, and the default behavior is to print a stack into an HTML response. Sending `{ "message": "invalid json" }` keeps the client on the contract. If the status is already 400 on `err.status`, use that. Do not send `err.stack` in the JSON. The stack is for your terminal. The client gets a sentence.

`headersSent` still matters. If you `res.json` and then throw, you cannot send the error body. Delegate with `next(err)`. The way to avoid that path is the same return-after-answer rule from the listening door.

Try the failure on purpose. Remove the error handler, throw inside a route, and curl `-i`. The body starts with `<!DOCTYPE` or a stack that mentions HTML, and `JSON.parse` on it throws. Put the handler back. The same curl returns `{ "message": "Server error" }` or the more specific message, and the content type is `application/json`. That difference is the whole diagnosis called HTML error.

### 201, and the client that guesses

`res.json(quest)` without a status sends 200. The document exists, the bytes are right, and the status is still wrong. A client that treats 200 as "maybe, read the body and decide" will do that, and a client that treats 201 as "this resource was created, here it is" will not notice your create at all if it only special-cases 201. The map said 201. The curl must show `201 Created` on the first line.

Send the document in that same response. The id is in `_id`. The default `status` of the quest is `open` if the client omitted it. The client should not have to `GET` the collection and guess which row is new. You are not a redirect. You are the parcel.

A create that returns 200 and `{ ok: true }` forces a second request and throws away the document you already had in memory. A create that returns 201 and the full list is a different resource's body on this route. Send the one quest.

### What you deliberately do not carry over from the ledger

No `methodOverride` on these routes. The client can send `PUT` and `DELETE` itself. Postman can. Curl can, with `-X PUT` and `-X DELETE`. A form cannot, and this session is not a form.

No `res.redirect`. Search the router for the word. It should not be there.

No layout function, no `escapeHtml`, no stylesheet. If a title contains a quote, `res.json` escapes it because that is how JSON works. You are not interpolating into HTML. The quote bug from the resource session stays fixed as long as you pass an object to `res.json` and not a hand-built string.

No page that "looks like" an error. A 404 is JSON even if a human reads the curl in a terminal and finds it ugly. Ugliness is acceptable. HTML is a contract break.

The paper routes can remain in the process for the clicks you already built. Do not point the API client at them. `POST /quests` with a JSON body will not be parsed by `express.urlencoded`, and `POST /quests` with a form body will not satisfy `express.json()`. Each door has a content type. The courier's door is `/api/quests`.

## The demonstration

Mount `express.json()` above the API router. Restart. Then run the contract in order, and write down the status line of each.

```bash
curl -i http://localhost:3000/api/quests
curl -i -H 'Content-Type: application/json' \
  -d '{"title":""}' \
  http://localhost:3000/api/quests
curl -i -H 'Content-Type: application/json' \
  -d '{"title":"Ring the bell","hero":"Ada"}' \
  http://localhost:3000/api/quests
curl -i http://localhost:3000/api/quests/NOT_AN_ID
curl -i http://localhost:3000/api/quests/000000000000000000000000
```

The list is 200 and an array. The empty title is 400 and `{ "message": "title required" }`, and a `find` in the shell shows no new document. The good create is 201 and one quest object, with `_id` and `"status":"open"`. The nonsense id is 400. Twenty-four hex zeros, if you never inserted them, are 404. Fetch the real `_id` from the 201 body and you get 200 and the same document.

Then the parser bug, on purpose.

```bash
curl -i -d '{"title":"Ring the bell"}' http://localhost:3000/api/quests
```

Without the content-type header, curl sends a form body. You get 400, "json body required" or "title required", and you do not get a new quest whose title is the entire raw string. Put the header back.

Update and delete, still one body each.

```bash
curl -i -X PUT -H 'Content-Type: application/json' \
  -d '{"title":"Ring the bell","status":"done"}' \
  http://localhost:3000/api/quests/THE_ID
curl -i -X DELETE http://localhost:3000/api/quests/THE_ID
```

`PUT` returns 200 and the document with `status` `done`. `DELETE` returns 200 and the document that was removed. A second delete of the same id returns 404. Neither response is a redirect. `curl -i` would show `302` if you had left `res.redirect` in place. If you see 302, the ledger handler is still the one you are calling, or the API handler copied it.

```js run=checkpoint-4-7
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function handle(req) {
  if (!req.jsonMountedBefore) {
    return { status: 400, body: undefined, wrote: false, redirected: false };
  }
  if (req.method === 'GET' && req.path === '/api/quests') {
    return { status: 200, body: req.rows, type: 'application/json', redirected: false };
  }
  if (req.method === 'GET' && req.path.indexOf('/api/quests/') === 0) {
    if (!req.found) {
      return { status: 404, body: { message: 'quest not found' }, type: 'application/json', redirected: false };
    }
    return { status: 200, body: req.doc, type: 'application/json', redirected: false };
  }
  if (req.method === 'POST' && req.path === '/api/quests') {
    const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      return { status: 400, body: { message: 'title required' }, type: 'application/json', wrote: false, redirected: false };
    }
    return {
      status: 201,
      body: { title: title, status: 'open' },
      type: 'application/json',
      wrote: true,
      redirected: false
    };
  }
  if (req.method === 'DELETE' && req.path.indexOf('/api/quests/') === 0) {
    if (!req.found) return { status: 404, body: { message: 'quest not found' }, redirected: false };
    return { status: 200, body: req.doc, redirected: false };
  }
  return { status: 404, body: { message: 'quest not found' }, redirected: false };
}

const list = handle({
  method: 'GET',
  path: '/api/quests',
  jsonMountedBefore: true,
  rows: [{ title: 'Ring the bell' }]
});
check(Array.isArray(list.body) && list.status === 200, 'GET /api/quests returns an array');
check(list.redirected === false, 'the list does not redirect');

const missing = handle({
  method: 'GET',
  path: '/api/quests/1',
  jsonMountedBefore: true,
  found: false
});
check(missing.status === 404 && missing.body.message === 'quest not found', 'a missing document is 404 with one body');

const bad = handle({
  method: 'POST',
  path: '/api/quests',
  jsonMountedBefore: true,
  body: { title: '' }
});
check(bad.status === 400 && bad.wrote === false, 'an empty title is 400 and writes nothing');

const created = handle({
  method: 'POST',
  path: '/api/quests',
  jsonMountedBefore: true,
  body: { title: 'Ring the bell' }
});
check(created.status === 201 && created.body.title === 'Ring the bell', 'create returns 201 and the document');
check(created.redirected === false && created.body.status === 'open', 'create does not redirect, and the default status is on the body');

const late = handle({
  method: 'POST',
  path: '/api/quests',
  jsonMountedBefore: false,
  body: { title: 'Ring the bell' }
});
check(late.body === undefined && late.wrote === false, 'a parser mounted too late leaves the body undefined and writes nothing');

function errorBody(kind) {
  if (kind === 'html') return { type: 'text/html', body: '<!DOCTYPE html><pre>stack</pre>' };
  return { type: 'application/json', body: { message: 'Server error' } };
}
check(errorBody('html').type !== 'application/json', 'an HTML error page is not a JSON body');
check(errorBody('json').type === 'application/json', 'the API error handler sends JSON');

console.log('ok: checkpoint-4-7');
```

The checkpoint models the contract. Your curls are the evidence. If the 201 body is HTML, you hit the ledger. If the list body is an object with a `quests` key, you wrapped the array. Send the array.

## Where it breaks

![](diagram:session-4-7/fig2-diagnosis)

### Undefined body

The client sent JSON and `req.body` is undefined. The parser is missing, mounted too late, or the content type is not `application/json`.

Log `req.get('Content-Type')` and log whether `req.body` is undefined, before you log the title. If the header is missing or is `application/x-www-form-urlencoded`, curl forgot `-H`, or Postman is sending a form. Fix the client, and keep the handler's 400 for a missing body so the next caller gets a parcel instead of a throw.

If the header is correct and the body is still undefined, look at mount order. `app.use(express.json())` has to appear above `app.use('/api/quests', quests)`. A parser inside a route, after you already read `req.body`, is too late for that request. Restart after you move it. A long-running process keeps the old order, and you will "fix" the handler instead of the stack.

Malformed JSON is the nearby case, not this one. The header is right, the parser runs, and it errors. You see a 400 from the error handler, and the route's first line never logs. Do not treat that as an undefined body. The body was rejected before it could become a value.

### HTML error

A thrown error hit the default handler and returned a stack-trace page. The API client cannot parse it. You can see it with `curl -i`: the content type is HTML, the body contains `<` or a stack, and `JSON.parse` fails. Postman shows a preview that looks like a document, which is a trap, because the preview is the browser inside Postman rendering HTML. Look at the raw body.

Put the four-argument handler last. Send `res.status(...).json({ message })`. Do not `res.send(err.stack)`. Do not call `next(err)` after you have already decided to answer, unless headers were sent and you are delegating. If one branch of the handler sends JSON and another calls the default by falling through, the fall-through is this bug. Every branch either sends JSON or calls `next(err)` on purpose.

A `ValidationError` you forgot to branch on becomes a 500. That may still be JSON if your final branch sends JSON. Check the status. Validation is 400. A 500 with a Mongoose message means the name check did not run.

### 200 on create

The resource exists and the client treats it as a maybe. 201, with the document, is the contract. `res.json(quest)` is 200. `res.status(201).json(quest)` is the line you want. If a wrapper "helps" by always sending 200 and putting the real code in `{ status: 201 }` inside the body, you have invented a second protocol. Take it out. The HTTP status is the status.

Confirm with `curl -i`, first line, after a create that used a fresh hero so a 409 does not confuse you. If you see 302, you redirected, which is the ledger's ending and this session's bug as well. If you see 201 and the body is the whole list, you sent the wrong value with the right status. One quest. The one you just created.

## Your turn

1. Mount `express.json()` before the API router. Keep the error handler last and make every branch `json`.
2. Implement `GET /api/quests` so the body is an array. Implement `GET /api/quests/:id` so a real id returns the document and a missing id returns 404 JSON.
3. Implement `POST /api/quests`. Empty title: 400, and the count in the shell does not change. Good title: 201 and that document, including the default status.
4. Implement `PUT` and `DELETE` with one JSON body each, no redirects. `PUT` runs validators. `DELETE` of a missing id is 404.
5. Curl the create without `Content-Type: application/json` and record what `req.body` was.
6. Temporarily remove the error handler, hit a bad id, and record the HTML. Put the handler back and record the JSON.
7. Search the API router for `redirect`. There should be no matches.

When a client library "almost works," read the status and the content type before you change the model. The model already stored quests in the ledger session. This session is the parcel around them.

## The quest

![](diagram:session-4-7/fig3-evidence)

Write `COURIER.md`. It is the contract, proved with your curls. Include:

- `GET /api/quests`, the status, and the first character of the body, which should be `[`.
- `GET /api/quests/:id` for an id that exists, and for one that does not, with both statuses.
- `POST` with an empty title: the 400 body, and the shell count before and after, showing nothing was written.
- `POST` with a title: the status line `201`, and the `_id` in the body.
- The content type on one success and one error.
- A sentence that says the router does not redirect, and where `express.json()` sits relative to the router.

Commit the router, the error handler, and `COURIER.md`. The next session's Postman collection will call this same shape. If create is 200 today, the token work tomorrow will be built on a guess.

## Side quests

You chose a resource style on purpose, which is the API-design argument worth rereading beside GraphQL and gRPC, and the documents behind these routes are still documents if a teammate reaches for a join of rows.

## Before next session

Next session seals the door. A password becomes a bcrypt hash, a login returns a token from `jwt.sign`, and Postman sends that token as `Authorization: Bearer`. The secret comes from the environment. A hidden button on a page is not a check. Read the bcrypt README's hash and compare example, and the jsonwebtoken README's sign and verify example, before you sit down. You are arriving knowing that the API you just built answers JSON, so login will too: 200 or 401, one body, no redirect.
