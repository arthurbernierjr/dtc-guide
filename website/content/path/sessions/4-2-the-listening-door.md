---
editorial: true
title: The Listening Door
subtitle: Create a server with Express
hook: "One process, one port, and a stack of functions. Today you build the door: routes, middleware, and an error handler that actually answers."
read: 55
artifact: "An Express server with a router, JSON parsing, a logging middleware, and a four-argument error handler"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://expressjs.com/en/starter/hello-world.html
  - https://expressjs.com/en/guide/routing.html
  - https://expressjs.com/en/guide/using-middleware.html
  - https://expressjs.com/en/guide/error-handling.html
say:
  - "app.METHOD(path, handler) registers one match."
  - "Middleware is a function of req, res, next, and order is the program."
  - "Async handlers that throw reach the error middleware on their own in Express 5."
---

## The hook

Last session the process listened, and one function answered `GET /`. That is a door with a single knock. A real server is a stack of functions standing behind the same port. One of them logs. One of them reads a JSON body. One of them matches `/quests`. One of them matches `/quests/:id`. The last one exists only for failures, and it has a different shape from the rest. Today you build that stack, and you learn the three ways it goes quiet or shouts: a request that never gets an answer, a second answer after the first, and a promise Express never heard.

By the end of the session you have an Express application with a router mounted on a prefix, `express.json()` in front of the routes, a logging middleware you can see in the terminal, and a four-argument error handler. You can point at the file and say which function runs first, which one is allowed to end the response, and which one runs only when something threw.

> *The port is the street number. The stack is who actually comes to the door, and in what order.*

## The idea

`app.get(path, handler)` is one registration. The method and the path together are the match. `app.post` is a different list from `app.get`, even when the path string is identical. `POST /quests` and `GET /quests` can live side by side and will never steal each other's requests. What they can steal is a request of the same method, if you register two `GET`s that both match and you expected the second one to win. Express walks the stack in the order you mounted it and runs the first match that accepts the request. Registration order is the program. The file's visual order is not a suggestion.

A middleware function has the signature `(req, res, next)`. `req` is the request Express already parsed into method, path, headers, query string, and params. `res` is the response you are allowed to finish. `next` is how you decline to finish it and hand the same request to the next function in the stack. You do one of three things. You call `next()` with no argument, and the walk continues. You call `next(err)` with any value other than the special string `'route'`, and Express skips every remaining normal middleware and looks for an error handler. Or you write the response, with `res.send`, `res.json`, `res.status(...).send`, or `res.end`, and you stop. A function that returns without doing any of those three leaves the socket open. The browser keeps spinning. Express does not treat a JavaScript `return` as an HTTP answer. Returning from a function only returns from the function.

Order is not a style preference. A logger mounted after a route that sends a response never sees that request, because the route did not call `next`. A JSON parser mounted after the route that reads `req.body` runs too late, and the handler sees `undefined`. An error handler mounted before the routes never sits downstream of them, so the errors those routes produce fall through to Express's built-in handler instead of yours. The using-middleware guide and the error-handling guide are describing the same stack from two ends: ordinary functions that continue, and the four-argument function that receives what they could not finish.

Express 5 changed the part that used to be folklore. The error-handling guide says it directly. Synchronous `throw` inside a route was always caught. An `async` function always returns a promise, and a route or middleware that returns a promise has its rejection forwarded: Express calls `next` with the thrown error or the rejected value. You do not wrap every `async` handler in `try/catch` just to call `next(err)`. If you build a promise chain by hand instead of using `async`, you must `return` that promise from the handler. If you do not return it, Express does not know the promise exists. The guide's wording is the one to keep: the rejection is then unhandled, and it can crash the process. The fix the guide shows for that style is `.catch(next)`, or, more simply, write `async` and `await` so the returned promise is not optional.

`express.json()` is built in. You do not install a body-parser package to read JSON. The middleware looks at the `Content-Type` header, and it parses the body when the type is `application/json`. Mount it before any route that reads `req.body`. After it runs, `req.body` is the value `JSON.parse` would have produced. A malformed body does not become a half object in your handler. The parser passes the failure onward as an error, which is why your error handler has to exist before you start trusting clients.

A router is an Express application you can mount. `express.Router()` gives you an object with its own `get`, `post`, and `use`. `app.use('/quests', questsRouter)` means a request whose path starts with `/quests` is handed to that router, and the router matches the rest. Inside the router you register `'/'` and `'/:id'`, not `'/quests'` again. A request to `/health` never enters that router. The evidence you want from this session is small and physical: log lines appear in mount order, a thrown error becomes a 500 from your handler while the process stays up, and the router mounted at `/quests` does not answer `/`.

What you should be able to draw on a napkin: a request arrives with a method and a path. The stack runs top to bottom. Each function continues with `next`, answers and stops, or fails into the error handler. `async` functions that reject are already a returned promise. A promise you forget to return is invisible. The error handler has four parameters and is mounted last.

![](diagram:session-4-2/fig1-model)

### What `req`, `res`, and `next` actually hold

`req.method` is the verb, uppercase, such as `GET`. `req.path` is the path. `req.query` is the object Express built from the query string, so `/quests?status=open` still matches a route registered as `/quests`, and `req.query.status` is the string `open`. `req.params` is filled only after a route pattern with `:id` or another name has matched. `req.get('Content-Type')` reads a header without you caring about the capitalization the client used. None of these fields is something you parse from the raw socket yourself. That work already happened in `node:http` before your first middleware ran.

`res` is a single response. HTTP allows one status line and one set of headers. `res.status(201)` records the status and returns `res`, so you can chain `.json(value)` or `.send(text)`. `res.json` serializes a value and sets the content type. `res.send` with a string sends that string. Calling either one writes headers. A later attempt to write headers again fails with the Node error you will learn to recognize as headers already sent. The practical rule is smaller than the error name: once you have answered, return. Do not also call `next()`. The next function will often try to answer too.

`next` is a function Express gave you, not a keyword. Call it when this layer's work is done and some later layer should run. Logging is the clean example. The logger prints `req.method` and `req.originalUrl`, then calls `next()`, and it does not touch `res`. Parsing is the same shape. The parser fills `req.body` and calls `next()`, or it fails and calls `next(err)`. A route at the end of a successful match usually does not call `next`, because the response is the end of the story. If you call `next` after `res.json`, you have told Express the story continues.

There is a fourth argument only on error-handling middleware: `(err, req, res, next)`. JavaScript does not care about parameter names. Express decides you wrote an error handler by counting the parameters. A function declared with three parameters is ordinary middleware, even if the first one is named `err`. A function declared with four is an error handler, even if you never use `next` inside it. If you omit the fourth parameter to silence a linter, you have silently converted your error handler into a normal middleware that will not be called when an error is in flight. Keep the four names. If `res.headersSent` is already true, the error-handling guide says to delegate with `next(err)` and return, because you cannot send a second status. Otherwise the handler sets a status and sends a body. If an error handler neither sends nor calls `next`, the request hangs. That sentence in the guide is the same bug as a route that returns early, moved one layer down.

### Mount order, said as a story

Picture one request, `POST /quests`, with a JSON body `{ "title": "Ring the bell" }`. The functions were mounted in this order: logger, `express.json()`, the quests router, a 404 middleware, the error handler.

The logger runs first. It prints `POST /quests` and calls `next()`. The JSON middleware sees `Content-Type: application/json`, parses the bytes, sets `req.body.title`, and calls `next()`. The router is mounted at `/quests`. The remaining path is `/`. The `POST /` handler inside the router runs, calls `res.status(201).json({ title: req.body.title })`, and returns. The 404 middleware does not run. The error handler does not run. The client receives 201 and a JSON body. The log has one line, from the logger, printed before the status existed.

Now change only the mount order. Put the logger under the router. The router answers and does not call `next`. The logger never runs. The client still receives 201. If you judge success by the log, you will say the route is broken. The route is fine. The witness was standing behind the door instead of in front of it.

Now remove `res.json` and also forget `next`. The logger prints. The parser runs. The handler returns. No later function runs, because you did not call `next`, and no bytes go out, because you did not send. Curl sits there until it times out. That is a hanging request. The process looks healthy. `listen` already succeeded last session. Health of the process and completion of the response are different facts.

### Routers, prefixes, and the 404 that is not an error

`express.Router()` exists so `/quests` can be a pile of related matches without every path in the application starting with the same string typed out by hand. You write the prefix once, at the mount.

```js
const quests = express.Router();

quests.get('/', (req, res) => {
  res.json([]);
});

quests.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

app.use('/quests', quests);
```

`GET /quests` enters the router and matches `'/'`. `GET /quests/bell` enters the router and matches `'/:id'`, and `req.params.id` is `bell`. `GET /` on the app does not enter the router at all. That is the evidence line for this session: a router mounted at `/quests` only sees paths under that prefix. If you registered `quests.get('/quests', ...)` by habit, the path you actually matched would be `/quests/quests`. When a route 404s, print `req.originalUrl` and the path you think you registered. The doubled prefix is a registration bug, not a network bug.

A 404 handler is ordinary middleware mounted after the routes.

```js
app.use((req, res) => {
  res.status(404).send('No such path');
});
```

It has three parameters. It runs when nothing earlier answered and nothing earlier called `next(err)`. It must send. It is not the error handler. A missing path is a client asking for something you do not have. A thrown exception is your program failing while you did have a match. They deserve different functions and different status codes. If you fold both into the error handler by calling `next(new Error('not found'))` from the 404 layer, you can, but then you have to branch on the error inside the four-argument function. Starting out, keep them apart: 404 middleware sends 404, error middleware sends 500 unless the error already carries a status.

### Async, in the version you are actually running

Read the asynchronous section of the error-handling guide with your `package.json` open. Express 5 is the behavior this unit uses. An async route looks like this:

```js
app.get('/boom', async (req, res) => {
  throw new Error('bell cracked');
});
```

The function throws. The promise rejects. Express calls `next` with that error. Your four-argument handler runs. You send 500. The process is still listening. That is the whole feature. Older posts written for Express 4 show a wrapper around every route, or a `.catch(next)` on every call, and they were right for that version. They are not the guide you follow when `express` in your lockfile is 5.

The hole that remains is the promise you do not return.

```js
app.get('/boom', (req, res) => {
  Promise.reject(new Error('bell cracked'));
});
```

This handler is not `async`. It returns `undefined`. The rejected promise is not the return value. Express has nothing to forward. The guide describes that rejection as unhandled, and an unhandled rejection is the crash the diagnosis is pointing at. The same handler, repaired, returns the chain:

```js
app.get('/boom', (req, res) => {
  return Promise.reject(new Error('bell cracked'));
});
```

Or you attach `.catch(next)`. Or you mark the function `async` and `await` the work, which forces the promise to be the return value even when you do not think about returning it. Pick `async` and `await` for every route that talks to a database later in this unit. The forgotten-return bug shows up when someone "just fires" a promise inside a non-async function, often inside an `if`, and the `return` keyword is sitting on a different line.

Callback APIs are the other hole the guide names. `fs.readFile` does not return a promise and does not throw when the file is missing. The error arrives as the first argument of the callback. You pass it yourself: `if (err) { next(err); return; }`. A `try/catch` around the `readFile` call does not catch that error. The call returns before the disk does. This unit mostly awaits promises, but the moment you copy a Node sample that uses a callback, the rule changes, and `next(err)` is your job again.

### One error handler, mounted last

```js
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = Number(err.status || err.statusCode) || 500;
  res.status(status).send(err.message || 'Server error');
});
```

Four parameters. Mounted after the router and after the 404 middleware. It logs if you want a server-side trace, and it sends a short body to the client. The built-in handler, which runs if you never define your own, writes the stack trace when `NODE_ENV` is not `production`. That is useful on your machine and a bad default on a server other people can hit. Your handler replaces that behavior for errors that reach it. Set `err.status = 400` before you throw, or `next` an error that already has `status`, when the failure is the client's fault. A cast from a bad id, later, is that kind of failure. A database that refused the connection is a 500. The handler above trusts a status only when it is already a number. Everything else stays 500, which is what the default handler does when `err.status` is outside the 4xx and 5xx ranges.

Do not mount this function up by the logger "so we don't forget." Error handlers run when an error is already in flight, and Express searches forward from the point of the failure. A handler registered above the route that threw is behind the search, not ahead of it. Last means last: after `app.use` calls, after routes, after the 404.

## The demonstration

One file, continuing the door from last session. Install nothing new if Express is already a dependency. `express.json` ships with it.

```js
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.originalUrl);
  next();
});

app.use(express.json());

const quests = express.Router();

quests.get('/', (req, res) => {
  res.json([]);
});

quests.post('/', (req, res) => {
  const title = req.body && req.body.title;
  if (!title) {
    res.status(400).send('title required');
    return;
  }
  res.status(201).json({ title: title });
});

quests.get('/:id', (req, res) => {
  res.json({ id: req.params.id });
});

app.use('/quests', quests);

app.get('/', (req, res) => {
  res.send('The door is open.');
});

app.get('/boom', async (req, res) => {
  throw new Error('bell cracked');
});

app.use((req, res) => {
  res.status(404).send('No such path');
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  console.error(err.stack || err.message || err);
  res.status(500).send('Server error');
});

app.listen(port, () => {
  console.log('listening on ' + port);
});
```

Read that file from top to bottom as a timeline. The logger is first, so it sees every request that reaches the process. `express.json()` is next, so a later route can read `req.body`. The quests router only claims paths under `/quests`. `/` and `/boom` are app routes, registered before the 404, and the error handler is last, with four parameters. `curl -i http://localhost:3000/boom` returns 500 and the text `Server error`, and the terminal still accepts the next curl. That is "a thrown error becomes 500 from the error handler, not a dead process." If you drag the error handler above `/boom` and restart, the throw still happens and the built-in handler answers instead, often with a stack trace in the body. Position is the bug. Put your handler back at the bottom.

`curl -i http://localhost:3000/quests` prints a log line and returns `[]` with a JSON content type. `curl -i http://localhost:3000/quests/bell` returns the id. `curl -i -H 'Content-Type: application/json' -d '{"title":"Ring the bell"}' http://localhost:3000/quests` returns 201. The same curl without the content-type header does not give `express.json()` a JSON body to parse. `curl --data` defaults to a form content type. `req.body` is then not the object you pictured, the `title` check fails, and you get 400. That is the parser doing what it was mounted to do, not a broken route.

`curl -i http://localhost:3000/nope` hits the 404 middleware. The log line still prints, because the logger is first and always calls `next`.

Then break it once, on purpose, and put it back. In the `POST` handler, delete the `res.status(400).send` line and leave the `return`. Restart, and curl a body with no title. The request hangs. You returned. You did not send. You did not call `next`. Put the `send` back and keep the `return`, so the 201 line cannot also run.

```js run=checkpoint-4-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function run(route) {
  const trace = [];
  let sent = 0;
  let status = null;
  let calledNext = false;
  const res = {
    send: function (code) {
      sent += 1;
      if (sent === 1) status = code;
    }
  };
  function next(err) {
    calledNext = true;
    if (err) {
      status = 500;
      sent += 1;
    }
  }
  route(trace, res, next);
  return {
    trace: trace,
    status: status,
    hanging: sent === 0 && calledNext === false,
    headersSent: sent > 1
  };
}

const ordered = run(function (trace, res, next) {
  trace.push('log');
  trace.push('parse');
  res.send(200);
});
check(ordered.trace[0] === 'log' && ordered.trace[1] === 'parse', 'middleware runs in mount order');
check(ordered.status === 200 && ordered.hanging === false, 'a send finishes the request');

const hung = run(function (trace, res, next) {
  trace.push('branch');
  return;
});
check(hung.hanging === true, 'no next and no response hangs');

const twice = run(function (trace, res, next) {
  res.send(200);
  res.send(201);
});
check(twice.headersSent === true, 'a second send means headers were already sent');

function settleAsync(returnedPromise) {
  if (returnedPromise) return { reachedNext: true, status: 500 };
  return { reachedNext: false, status: null };
}
check(settleAsync(true).status === 500, 'a returned rejection reaches the error middleware');
check(settleAsync(false).reachedNext === false, 'a promise that was not returned never reaches next');

function seesPrefix(mount, path) {
  return path.indexOf(mount) === 0;
}
check(seesPrefix('/quests', '/quests/bell') === true, 'a router mounted at /quests sees paths under that prefix');
check(seesPrefix('/quests', '/health') === false, 'a router mounted at /quests does not see other prefixes');

console.log('ok: checkpoint-4-2');
```

The checkpoint does not bind a port. It models the three exits from a middleware function, the order of the stack, the prefix a router claims, and the difference between a promise Express was given and a promise it was not. Run the real curls in your terminal. The model only checks that you can say what those curls are proving.

## Where it breaks

![](diagram:session-4-2/fig2-diagnosis)

### Hanging request

A branch returned without `next()` and without a response. You will swear the route works, because the other branch sends. Curl the branch you did not try. The usual shapes are an `if` that returns on a missing title, a `return` you added while debugging and left in place, and a code path that logs "about to send" and then hits the closing brace. Add a log at the top of the handler and a log immediately before every `return`. The return that has no `res.send` and no `next()` on the lines above it is the hole.

The same hang happens in an error handler that logs the stack and then falls off the end. The client already did its part. Your function has to answer or call `next`. Look at the open curl and the quiet terminal together. A listening process plus a spinner is this bug until you prove otherwise.

### Headers sent

A second `res.send` or `res.json` ran after the first. Node raises `ERR_HTTP_HEADERS_SENT`. Sometimes it surfaces as an exception that your error handler then tries to answer, which throws the same error again, which is why the handler above checks `res.headersSent` and delegates. The cause is almost always control flow. You sent the 400 and forgot to `return`, so execution continued into the 201. Or you called `next()` after sending, and the 404 middleware sent too. Or two routes matched because the first one called `next()` on purpose and both of them write a body.

Pick one writer per request. After `res.json`, `return`. If you need shared work after the response, do it without touching `res`, and do not call `next`. Search the handler for a second `send`, `json`, `redirect`, or `end`. One of them is the extra.

### Async crash

A promise was not returned, and the rejection never reached `next`. The handler was a plain function, something inside it called an async function and ignored the promise, and the database error became an unhandled rejection instead of a 500 response. The symptom is a stack in the terminal and a client that either hangs or gets a dropped connection, not the calm body from your error handler. The route "has a catch" only if that catch is actually attached to the promise Express can see.

Mark the handler `async`. `await` the call that can reject. Let the rejection leave the function. If you are keeping a `.then` chain, `return` it, the way the error-handling guide shows, or end it with `.catch(next)`. A `try/catch` that does not `await` does not catch a promise. It catches throws that happen before the first await point, and nothing else.

## Your turn

Build this in your own folder, beside the one-file server from last session, or in that same project if you would rather grow it.

1. Mount a logger first. It prints method and `originalUrl`, then calls `next()`. It does not send.
2. Mount `express.json()` next. Confirm a `POST` with `Content-Type: application/json` can read `req.body.title`, and a `POST` without that header does not pretend the body was parsed.
3. Create a router and mount it at `/quests`. `GET /` on the router returns a JSON array. `GET /:id` returns an object with that id. `POST /` returns 400 when title is missing and 201 when it is present, and every branch either sends and returns, or calls `next`.
4. Add `GET /boom` as an `async` function that throws. Mount a four-argument error handler last, after a three-argument 404 handler. Curl `/boom` and confirm the process is still listening afterward.
5. Move the logger below the router, curl `/quests`, and write down what disappeared. Move it back. That note is the order evidence.
6. In the `POST` handler, send a response and then send another one without returning. Read the terminal. Put the `return` back. That note is the headers evidence.

If a curl hangs, you are not stuck on install. You are in the first diagnosis. Ctrl-C the client, not the idea.

## The quest

![](diagram:session-4-2/fig3-evidence)

Write `STACK.md` in the same folder. One page. Draw the stack in the order it is mounted, one function per line, and under each line write whether it calls `next()`, answers, or both on the paths you have actually curled. Then answer, in sentences:

- Which curl proved the log order, and what changed when you moved the logger?
- Which curl proved a thrown error becomes a 500 while the process stays up?
- Which path is handled only by the router mounted at `/quests`, and which path never enters it?
- Where is the error handler relative to `/boom`, and what would break if you moved it above that route?
- Which branch used to hang, and which line fixed it?

Commit the server file and `STACK.md`. Leave `node_modules` out. This stack is the door every later session stands behind. The database, the HTML, and the JSON API are new functions in this same order, not a new kind of program.

## Side quests

Middleware is a chain of responsibility, each function doing its part and then calling `next` or ending the response, and the app object is still the facade from last session, the small surface in front of that chain.

## Before next session

Next session the paths stop being arbitrary strings. A quest is a noun, the method is the verb, and the body is JSON with a status code that means one thing. Read the opening of the routing guide again, this time for how a path and a method pair, and skim `res.json` on the API page so you know it both serializes and sets the content type. RFC 9110 is the semantics behind the methods. You are not memorizing status tables. You are arriving able to say why `GET /quests` and `POST /quests` are two operations on one resource.

Bring one habit with you. Every branch sends or calls `next`, and every `async` route is allowed to reject into the handler you just wrote. The resource map you draw next session will assume that the stack under it already answers.
