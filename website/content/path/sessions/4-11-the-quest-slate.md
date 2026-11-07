---
editorial: true
title: The Quest Slate
subtitle: A React todo on your API, with JWT auth
hook: "The pieces meet. A todo list in React, a JSON API in Express, a token from the login you already proved with curl. The screen waits for the server before it says saved."
read: 65
artifact: "A todo app: register, login, and CRUD against your API, with the token on each request"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://react.dev/learn/synchronizing-with-effects
  - https://react.dev/reference/react/useEffect
  - https://expressjs.com/en/guide/routing.html
  - https://github.com/auth0/node-jsonwebtoken#readme
say:
  - "fetch sends the token in the Authorization header. The server still verifies it."
  - "Show saved only after a 2xx. Keep the draft if the request fails."
  - "The token is a credential. Do not print it, and do not put it in the URL."
---

## The hook

The fixture was a file you controlled. The slate is the first screen that has to believe someone else. A person registers, a person logs in, the server signs a token, and every later request carries that token back. The list on the screen is whatever `GET /api/todos` returns for that token, not whatever the component hoped was true a moment earlier. Show saved only after a 2xx. Keep the draft if the request fails. The token is a credential. Do not print it, and do not put it in the URL.

`fetch` sends the token in the `Authorization` header. The server still verifies it. A header that Postman added for you is not a header your browser will invent. A token that verifies is an identity, and identity is not yet permission. The todo routes have to decide, per record, whether this account owns this row. A button you hid in React is not that decision. The decision is a query that includes the owner.

By the end of the session you can register two accounts against your own API, create a todo as the first, and watch the second account's list stay empty. A refresh after a real 201 still shows the todo, because it was stored. Clearing the token and loading again sends you to the login form. The row never says saved while the response is still in flight.

> *The slate does not get to announce that the ink is dry. The vault does.*

## The idea

Three motions, in order. Login: `POST /api/login` with the email and the password, and keep the token that comes back. Load: `GET /api/todos` with the bearer header, and render the array. Change: `POST`, `PATCH`, or `DELETE`, and trust the response body, not the hope. The screen is a client of the contract you already proved with curl and Postman. It does not get a softer contract because it is made of components. Two things change on purpose. The slate's accounts use an `email` where the guild door used a `name`; that is the one field of the seal that changes, and the user schema below is written again for it. Error bodies from this API on are `{ "error": "..." }` where the guild door answered `{ "message": "..." }`; pick one key per project and keep it, and from here the key is `error`.

The two processes stay two processes. Vite serves the page, usually at `http://localhost:5173`. Express serves the API at `http://localhost:3000`. The React bundle never imports a Mongoose model. The model lives in the server project, behind routes. The client knows paths, methods, status codes, and JSON shapes. That boundary is the point of having built the API before the screen. If a component file starts requiring `mongoose`, the boundary is gone and the browser cannot run the file anyway.

Login is an event, so it lives in a submit handler, not in an effect. The handler posts JSON. The content type is `application/json`, which means `express.json()` on the server will parse it, the same parser you already mounted for the courier. A 200 returns `{ "token": "..." }`. You store that string. A 401 leaves the form as it is and shows a failure. You do not store a token you did not receive. The signing is the library you already used: `jsonwebtoken`, documented at [github.com/auth0/node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken). `jwt.sign` puts `sub` on the payload, set to the user id, and sets an expiry. `jwt.verify` checks the signature and the expiry with the same secret. The secret comes from the environment. The payload is base64. Anyone holding the token can read `sub`. They cannot change it without breaking the signature. So `sub` may be an id. It must not be the password, and it must not be the hash.

The header on every later request is `Authorization: Bearer` plus a space plus the token. One space. The scheme is the word `Bearer`. The middleware splits on that space, refuses a missing header with 401, and refuses a token `verify` rejects with 401. The same message for a missing header and a bad token is fine. A different message for "no such email" and "wrong password" is not fine, because it tells a stranger which emails are registered. Login's failure text is one sentence for both cases.

Where the token lives matters. This slate keeps it in `sessionStorage` under a name you choose, and also in React state so a login re-renders into the board. `sessionStorage` survives a refresh of the tab and dies when the tab closes. That is why a refresh after a real 201 can load the todo again: the token is still there, the effect sends it, the database still has the document. It is also readable by any script that runs on this origin, so you still never write it into `console.log`, never interpolate it into a URL, and never put it in an error string you render. A query string such as `/api/todos?access_token=` followed by the token would be copied into server logs, browser history, and the `Referer` header when the browser asks for something else. The header is the place. The URL is not a place for a credential.

Load is synchronization with an external system, the API, so it is an effect. The effect depends on the token. No token, no request, and the render shows the login form. A token, and the effect calls `GET /api/todos` with the header and no body. `response.ok` means the status is in the 200 range. You parse JSON only in that case, and you set the todos to that array. A 401 means the token is no longer good. Clear it and return to the form. The cleanup flag from the last session still belongs here: if the token changes or the component unmounts before the response arrives, do not `setTodos` from the abandoned request. [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) and the [useEffect reference](https://react.dev/reference/react/useEffect) are the same pages as last time. The external system changed from a static file to your process.

Change waits. The create handler prevents the browser submit, posts `{ "title": draft }` with the bearer header and the JSON content type, and then looks at the status. If the status is not a 2xx, the handler sets a notice that the todo was not saved, and it returns. The draft state is untouched, so the field still holds what the person typed. If the status is 201, the handler reads the JSON the server sent, appends that object to the list, clears the draft, and only then may the screen say saved. The object you append is the server's object, with the server's id and the server's owner. It is not a homemade `{ title: draft, saved: true }` you invented before the request left the machine. [The routing guide](https://expressjs.com/en/guide/routing.html) is still the description of which method does which job. `POST` creates. `PATCH` changes a title or a done flag. `DELETE` removes. `GET` reads. The client does not get to pick a different meaning.

The owner check is the part you cannot see from a happy-path screenshot. The schema has `title`, `done`, and `owner`. `owner` is an ObjectId referencing the user, required, and indexed because every list is a find by that field. `create` sets `owner` from `req.userId`, the `sub` the middleware verified. It does not read `owner` from the body. A client that sends someone else's id is ignored. `GET /api/todos` is `Todo.find({ owner: req.userId })`. There is no route that lists every todo in the collection. `PATCH` and `DELETE` use `findOneAndUpdate` and `findOneAndDelete` with `{ _id: req.params.id, owner: req.userId }` together. If that filter matches nothing, the response is 404. A missing todo and a todo owned by someone else look the same to the caller. The other person does not learn that the id exists. The evidence you owe this session is the list evidence: a todo created by one account is not listed for another. Hit the update route with the other account's token as well, once, so you know the filter is on the write and not only on the read.

CORS sits between the two ports, and it is a browser rule, not an Express hobby. The page's origin is `http://localhost:5173`. The API's origin is `http://localhost:3000`. Those are different origins. A request with `Authorization` and `Content-Type: application/json` is not a "simple" request, so the browser first sends `OPTIONS` and asks permission. If Express does not answer that preflight with `Access-Control-Allow-Origin` set to the page's origin, the browser never sends the `POST`, and a log inside the `POST` handler stays silent. The console in the browser is the one that speaks, and it says the request was blocked by CORS. Postman does not perform this check. Postman worked yesterday. The browser fails today. That pair is the diagnosis. The `cors` package answers the preflight. Mount `cors({ origin: 'http://localhost:5173' })` before the routes, and if Vite printed a different port, use the origin it printed. The package's `origin` option is the setting. Credentials and cookies are not how this slate authenticates. The token is on the header you set yourself, so you do not need a cookie mode to make the bearer token go out.

A napkin you can check a request against: the handler reads `Authorization`, verifies, and sets `req.userId`. The query includes that id. The response status is the only thing that flips the screen from draft to saved. The token is in the header and in `sessionStorage`, and it is absent from the path and the query string. A second account is a different `sub`, and the find does not return the first account's rows.

![](diagram:session-4-11/fig1-model)

### The header, verified again

The middleware is small on purpose. It has one job.

```js
const jwt = require('jsonwebtoken');

function requireUser(req, res, next) {
  const header = req.get('authorization') || '';
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || parts[1] === '') {
    return res.status(401).json({ error: 'missing token' });
  }
  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'bad token' });
    }
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'bad token' });
  }
}

module.exports = { requireUser };
```

`req.get` folds the header name, so `Authorization` and `authorization` both arrive. `jwt.verify` throws when the signature is wrong, when the token is expired, and when the secret does not match. The `catch` is 401, not 500. A 500 here would tell the client that your code crashed. The token was simply not acceptable. You do not attach the decoded payload's email and then trust it for authorization. You attach the id. The database is where the row's owner lives.

On the client the header is built in one place so a request cannot forget it by having been copied from a snippet that only set the content type.

```jsx
function bearerHeaders(token, jsonBody) {
  const headers = { Authorization: 'Bearer ' + token };
  if (jsonBody) headers['Content-Type'] = 'application/json';
  return headers;
}
```

`GET` does not need a JSON content type. `POST` and `PATCH` do. `DELETE` does not. Calling this function is the whole client-side contract. Logging `headers` during development will print the token into the console, which is the thing the session forbids. If a request fails, log the status and the path. Leave the header value out of the log.

### The owner, on the server

```js
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
});

const Todo = mongoose.model('Todo', todoSchema);

async function listTodos(req, res) {
  const todos = await Todo.find({ owner: req.userId }).sort({ createdAt: 1 });
  res.json(todos);
}

async function createTodo(req, res) {
  const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (title === '') return res.status(400).json({ error: 'title required' });
  const todo = await Todo.create({ title: title, owner: req.userId });
  res.status(201).json(todo);
}

async function updateTodo(req, res) {
  const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (title === '') return res.status(400).json({ error: 'title required' });
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { title: title },
    { new: true, runValidators: true }
  );
  if (!todo) return res.status(404).json({ error: 'not found' });
  res.json(todo);
}

async function deleteTodo(req, res) {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!todo) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
}

module.exports = { Todo, listTodos, createTodo, updateTodo, deleteTodo };
```

`createdAt` in the sort needs a timestamp. Add `{ timestamps: true }` as the second argument to `new mongoose.Schema` if you want `createdAt` without declaring it. The sort can also be `_id` if you would rather not think about timestamps today. The ownership filter is the part that cannot be optional.

Walk two accounts. Sera registers and receives a token whose `sub` is her id. She posts "Oil the hinges." The document's `owner` is her id. Bran logs in. His `GET /api/todos` runs `find({ owner: branId })`. Sera's document is not in the cursor. Bran pastes Sera's todo id into `PATCH /api/todos/:id` with his own bearer token. The filter requires both the id and Bran's id. Nothing matches. He receives 404. Sera refreshes and the title is still "Oil the hinges." That is the owner check. A version that does `findById` and then updates, with a comment that says you should also compare the owner, will forget the comparison the first time someone is in a hurry. Put the owner in the filter so there is no second step to forget.

`done` can be a separate `PATCH` that sends `{ "done": true }` if you would rather not overload title. If you accept either field, validate the types. `done` has to be a boolean. A string `"false"` is not false. Reject what you do not understand with 400, and write nothing.

### The moment the screen says saved

```jsx
async function onCreate(event) {
  event.preventDefault();
  setNotice('');
  let response;
  try {
    response = await fetch(apiBase + '/api/todos', {
      method: 'POST',
      headers: bearerHeaders(token, true),
      body: JSON.stringify({ title: draft })
    });
  } catch (err) {
    setNotice('not saved');
    return;
  }
  if (!response.ok) {
    setNotice('not saved');
    return;
  }
  const created = await response.json();
  setTodos(function (current) { return current.concat([created]); });
  setDraft('');
  setNotice('saved');
}
```

`response.ok` is true for 200 through 299. 201 is inside that range. 400, 401, 404, and 500 are not. There are two different failures here, and the `try` is for the second one. A response with `ok` false means the server answered and said no. No response at all means `fetch` rejected, because the API is stopped or the network is down, and without the `try` that rejection is unhandled and the notice never changes. Both failures land on the same notice, `not saved`, and both keep the draft. The notice `saved` is on the far side of that check, and so is the `concat`. There is no optimistic row. Optimistic UI is a later refinement you earn by being able to roll it back. This session's bug is the row that claims success before the server has agreed. Keep the draft on failure so the person can edit and send again without retyping the whole line.

`DELETE` often returns 204 and an empty body. `response.ok` is still the check. `response.json()` on an empty body throws, which you would then display as a failure after a success. For 204, check `ok` and skip the parser. The same `try` wraps the delete, so a rejected `fetch` is `not deleted` rather than an unhandled error. Remove the id from local state only after that check. If the 204 never comes, the row stays.

The login form and the board are two renders of one parent. The parent holds `token`. When `token` is empty, it returns the login and register forms. When `token` is set, it returns the board. You do not need a router for that. A register handler posts to `/api/register`, and on 201 it can either ask the person to log in or, if you also return a token from register, store it the same way login does. Returning a token from register is a convenience. It is not a different security model. The password still goes through `bcrypt.hash` on the way into the user document, and `bcrypt.compare` on login, the seal from the previous session. The cost factor you already chose is the one to keep using. Do not drop it to make the demo feel faster.

## The demonstration

Two folders, two terminals. Stop the guild door first, with Ctrl-C in its terminal, so nothing else answers on 3000. The API is a new small server beside the guild door, built the same way as the courier: from `~/projects`, run `mkdir slate-api && cd slate-api && npm init -y && npm install express mongoose bcrypt jsonwebtoken cors`, then write `server.js` from the block below. The guild door stays as it was. The client is a fresh Vite app: from `~/projects`, run `npm create vite@latest slate-client -- --template react`, then `cd slate-client && npm install`, the same way you made the primer, and leave the primer as it is. `~/projects/slate-api` and `~/projects/slate-client` do not share a `package.json`. The client depends on `react`. The server depends on `express`, `mongoose`, `bcrypt`, `jsonwebtoken`, and `cors`. Copying `node_modules` from one to the other is how you get a client that thinks it can talk to the database.

The server entry below is the whole API in one file so you can read the order. Splitting the middleware and the model into other files is fine when the file gets noisy. The behavior to preserve is the order: connect, refuse to listen without `JWT_SECRET`, mount `cors` and `express.json`, then the routes, then a JSON error handler.

```js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const pageOrigin = process.env.PAGE_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: pageOrigin }));
app.use(express.json());

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
});

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
const Todo = mongoose.model('Todo', todoSchema);

function requireUser(req, res, next) {
  const header = req.get('authorization') || '';
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || parts[1] === '') {
    return res.status(401).json({ error: 'missing token' });
  }
  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'bad token' });
  }
}

app.post('/api/register', async function (req, res) {
  const email = req.body && typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';
  if (email === '' || password.length < 8) {
    return res.status(400).json({ error: 'email and a password of 8 or more characters' });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await User.create({ email: email, passwordHash: passwordHash });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'email already registered' });
    throw err;
  }
  res.status(201).json({ email: email });
});

app.post('/api/login', async function (req, res) {
  const email = req.body && typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';
  const user = await User.findOne({ email: email });
  const match = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!match) return res.status(401).json({ error: 'invalid credentials' });
  const token = jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, { expiresIn: '2h' });
  res.json({ token: token });
});

app.get('/api/todos', requireUser, async function (req, res) {
  const todos = await Todo.find({ owner: req.userId }).sort({ createdAt: 1 });
  res.json(todos);
});

app.post('/api/todos', requireUser, async function (req, res) {
  const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (title === '') return res.status(400).json({ error: 'title required' });
  const todo = await Todo.create({ title: title, owner: req.userId, done: false });
  res.status(201).json(todo);
});

app.patch('/api/todos/:id', requireUser, async function (req, res) {
  const body = req.body || {};
  const updates = {};
  if (typeof body.title === 'string') {
    const title = body.title.trim();
    if (title === '') return res.status(400).json({ error: 'title required' });
    updates.title = title;
  }
  if (typeof body.done === 'boolean') updates.done = body.done;
  if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'nothing to update' });
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    updates,
    { new: true, runValidators: true }
  );
  if (!todo) return res.status(404).json({ error: 'not found' });
  res.json(todo);
});

app.delete('/api/todos/:id', requireUser, async function (req, res) {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!todo) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

app.use(function (err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.name === 'CastError' ? 400 : err.status || 500;
  res.status(status).json({ error: status === 500 ? 'server error' : err.message });
});

async function main() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/slate');
  const port = process.env.PORT || 3000;
  app.listen(port, function () {
    console.log('listening on ' + port);
  });
}

main().catch(function (err) {
  console.error(err.message);
  process.exit(1);
});
```

`bcrypt.compare` still runs when the user is missing only if you structure it carefully. The code above skips `compare` when there is no user, and still returns the same 401. Timing will differ. For this slate, the shared message is the requirement. You can later hash a dummy when the user is missing if you want the timing closer. Do not return a different status.

Start Mongo if it is not running. In `slate-api`, write a `.env` with three lines: `MONGODB_URI=mongodb://127.0.0.1:27017/slate`, `JWT_SECRET=` followed by a long random string, and `PAGE_ORIGIN=http://localhost:5173`. The database name matters. A `MONGODB_URI` still exported from the guild door's sessions points at `guild`, whose `users` collection carries a unique index on `name` that slate users do not have, and the second register would fail with a 409 that blames the email. Node's `--env-file` does not override a variable the shell already exports, so `unset MONGODB_URI` first if an earlier export is still in this shell. Then run `node --env-file=.env server.js`. The listen line is the API being up. It is not the page. In the second terminal, `cd ~/projects/slate-client && npm run dev` prints `http://localhost:5173`, the origin the `.env` named.

The client talks to that origin explicitly.

```jsx
import { useEffect, useState } from 'react';

const apiBase = 'http://localhost:3000';

function bearerHeaders(token, jsonBody) {
  const headers = { Authorization: 'Bearer ' + token };
  if (jsonBody) headers['Content-Type'] = 'application/json';
  return headers;
}

function LoginForm(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setNotice('');
    const response = await fetch(apiBase + '/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    if (!response.ok) {
      setNotice('Login failed');
      return;
    }
    const body = await response.json();
    props.onToken(body.token);
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={email} onChange={function (event) { setEmail(event.target.value); }} aria-label="Email" />
      <input value={password} onChange={function (event) { setPassword(event.target.value); }} type="password" aria-label="Password" />
      <button type="submit">Log in</button>
      <p>{notice}</p>
    </form>
  );
}

function TodoBoard(props) {
  const [todos, setTodos] = useState([]);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(function () {
    let ignore = false;
    fetch(apiBase + '/api/todos', { headers: bearerHeaders(props.token, false) })
      .then(function (response) {
        if (response.status === 401) {
          if (!ignore) props.onUnauthorized();
          return null;
        }
        if (!response.ok) throw new Error('load failed');
        return response.json();
      })
      .then(function (rows) {
        if (!ignore && rows) setTodos(rows);
      })
      .catch(function () {
        if (!ignore) setNotice('Could not load');
      });
    return function () { ignore = true; };
  }, [props.token]);

  async function onCreate(event) {
    event.preventDefault();
    setNotice('');
    let response;
    try {
      response = await fetch(apiBase + '/api/todos', {
        method: 'POST',
        headers: bearerHeaders(props.token, true),
        body: JSON.stringify({ title: draft })
      });
    } catch (err) {
      setNotice('not saved');
      return;
    }
    if (!response.ok) {
      setNotice('not saved');
      return;
    }
    const created = await response.json();
    setTodos(function (current) { return current.concat([created]); });
    setDraft('');
    setNotice('saved');
  }

  async function onDelete(id) {
    let response;
    try {
      response = await fetch(apiBase + '/api/todos/' + id, {
        method: 'DELETE',
        headers: bearerHeaders(props.token, false)
      });
    } catch (err) {
      setNotice('not deleted');
      return;
    }
    if (!response.ok) {
      setNotice('not deleted');
      return;
    }
    setTodos(function (current) {
      return current.filter(function (todo) { return todo._id !== id; });
    });
  }

  return (
    <section>
      <ul>
        {todos.map(function (todo) {
          return (
            <li key={todo._id}>
              {todo.title}
              <button type="button" onClick={function () { onDelete(todo._id); }}>Delete</button>
            </li>
          );
        })}
      </ul>
      <form onSubmit={onCreate}>
        <input value={draft} onChange={function (event) { setDraft(event.target.value); }} aria-label="Todo title" />
        <button type="submit">Add</button>
      </form>
      <p>{notice}</p>
      <button type="button" onClick={props.onLogout}>Log out</button>
    </section>
  );
}

export default function App() {
  const [token, setToken] = useState(function () {
    return sessionStorage.getItem('slateToken') || '';
  });

  function keep(next) {
    sessionStorage.setItem('slateToken', next);
    setToken(next);
  }

  function clearToken() {
    sessionStorage.removeItem('slateToken');
    setToken('');
  }

  if (!token) return <LoginForm onToken={keep} />;
  return <TodoBoard token={token} onLogout={clearToken} onUnauthorized={clearToken} />;
}
```

The rows are the server's documents now. The fixture had `id`; MongoDB documents have `_id`, so the key on each row and the delete both use `todo._id`. The client above has no register form. Register the two accounts with curl, the way you registered at the guild door but with an email, `curl -s -H 'Content-Type: application/json' -d '{"email":"sera@example.com","password":"a-long-passphrase"}' http://localhost:3000/api/register`, or add a second form beside login that posts to `/api/register` and shows the 201 or the 409. It is the same shape as login without storing a token. After 201, the person logs in. The password field is `type="password"` so the screen does not echo it. That is not the security boundary. The hash on the server is.

Try the failure on purpose. Stop the API and submit a todo. The notice says not saved. The draft is still in the field. Start the API and submit again. The notice says saved, and the row's text is the title the JSON returned. Refresh the browser. The effect runs because `sessionStorage` still has the token, and the row is there because MongoDB has the document. Log out. The form returns. That is the 401 path with the token cleared by you. Create a second user in another browser profile, or after logging out, and confirm the first todo is absent.

The checkpoint models the status gate, the header, the owner filter, and the refusal to put the token in the URL. The Vite app and the API are the real proof.

```js run=checkpoint-4-11
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function applySave(draft, status, body) {
  if (status < 200 || status >= 300) {
    return { notice: 'not saved', draft: draft, rows: [] };
  }
  return { notice: 'saved', draft: '', rows: [body] };
}

const failed = applySave('Oil the hinges', 500, null);
check(failed.notice === 'not saved' && failed.draft === 'Oil the hinges' && failed.rows.length === 0, 'a non-2xx keeps the draft and adds no row');
const created = applySave('Oil the hinges', 201, { _id: 't1', title: 'Oil the hinges' });
check(created.notice === 'saved' && created.draft === '' && created.rows[0]._id === 't1', 'a 201 is the moment the row is saved');

function describeRequest(path, token) {
  return {
    url: path,
    authorization: 'Bearer ' + token,
    tokenInUrl: path.indexOf(token) !== -1
  };
}
const request = describeRequest('/api/todos', 'eyJhbGciOi.payload.sig');
check(request.authorization === 'Bearer eyJhbGciOi.payload.sig' && request.tokenInUrl === false, 'the token is in the Authorization header and not the URL');

function visibleTo(todos, userId) {
  return todos.filter(function (todo) { return todo.owner === userId; });
}
const all = [
  { _id: 't1', owner: 'sera', title: 'Oil the hinges' },
  { _id: 't2', owner: 'bran', title: 'Buy rope' }
];
const seras = visibleTo(all, 'sera');
check(seras.length === 1 && seras[0]._id === 't1', 'the list is filtered by the token user');

function canMutate(todo, userId) {
  return todo.owner === userId;
}
check(canMutate(all[0], 'bran') === false, 'another account does not pass the owner filter');

console.log('ok: checkpoint-4-11');
```

## Where it breaks

![](diagram:session-4-11/fig2-diagnosis)

### Saved too early

The row says saved, and a reload shows the old text, or the row is gone. The setter ran before the response. You appended a local object, or you set the notice, and then you `await`ed the fetch, and the fetch came back 400 or failed to connect. The screen had already told the truth you wanted. Reload runs the effect, the effect trusts the server, and the server never received a document.

Move every state update that means "this exists" to the far side of `response.ok`. On the failure branch, return while the draft still holds the title. Read the status in the network panel. If it is red and the UI said saved, you are in this section even if the happy path works with the API running. Stop the API and submit. The UI's job in that moment is to keep the draft and withhold the word saved. A 201 with a body is the only path that appends, and the appended object is the parsed body, so a later `DELETE` has a real `_id`.

A cousin of this bug parses JSON before checking the status. Error bodies are JSON too. You might append `{ error: 'title required' }` as if it were a todo. Check `ok` first. Parse second. Append third.

### Missing header

Postman worked and the browser got 401. `fetch` did not send `Authorization`. The API log is not silent. The request arrived, `requireUser` ran, and it answered 401 because the header was absent or was not `Bearer` plus a token. Postman's Authorization tab does not export itself into your component. A `fetch` you copied from a no-auth example sets `Content-Type` and nothing else.

Look at the request headers in the browser's network panel. You should see `Authorization`. You should not see the token in the request URL. If the header is missing, the call site forgot `bearerHeaders`. If the header says `Bearer undefined`, the token state was empty and you fetched anyway. Guard the effect on a non-empty token. If the header is present and the status is still 401, the secret used to sign and the secret used to verify are different shells, or the token is expired. That is a verify failure, not a missing header. The response body from your middleware tells you which branch you hit only if you kept the messages distinct. Keep `missing token` and `bad token` different while you are debugging, if you want that extra fact, and know that both are 401 to the person using the form.

### CORS

The API log is silent and the browser reports a CORS failure. The page's origin is not allowed. A log inside `POST /api/todos` never runs, because the browser sent `OPTIONS` and disliked the answer, or sent nothing you are logging. Postman never showed you this. Curl never showed you this. Only the browser enforces it.

Confirm the page's origin, scheme plus host plus port, character for character. `http://localhost:5173` and `http://127.0.0.1:5173` are different origins. The `cors` origin has to be the one in the address bar. Restart the API after you change it. A middleware mounted after the routes does not help the preflight if the preflight is answered by something else first, so put `cors` up with `express.json()`, before the routes. If the browser message names `Authorization` specifically, the preflight did not allow that header. The `cors` package reflects requested headers when you set `origin` and leave the header list at its default. Read the package readme before you add a second CORS plugin. Two of them fighting is a silent log with a confusing console.

A request that reaches the route and returns 401 is not this section. CORS failures do not look like your JSON error body in the network response. The browser hides the body. That hiding is why "it works in Postman" and "the console says blocked" are the same bug.

## Your turn

Build the slate as two projects.

1. Server: register, login, and the four todo routes. `JWT_SECRET` comes from the environment. Passwords are hashed. The token's `sub` is the user id. Every todo route runs `requireUser`.
2. `owner` is set from `req.userId` on create. List, update, and delete all include `owner` in the query. Send a second token at the first account's todo id and record the 404.
3. Client: login form, then a board. The token is stored in `sessionStorage` and in state. Logout removes it. The load effect sends `Authorization: Bearer` and the token. No request URL contains the token.
4. Create sets the notice to saved only after a 2xx, and appends the parsed todo. Stop the server, submit, and confirm the draft remains and the notice does not say saved.
5. Register two users. Create a todo as the first. Log in as the second. The list is empty.
6. Refresh after a successful create. The todo is still there. Clear the token. The login form is back.
7. If the browser reports CORS, fix the origin until the API log shows the `GET`. Write down the origin you allowed.

Use curl for the owner check if that is faster than a second profile. Use the screen for saved-too-early. Both are part of the session.

## The quest

![](diagram:session-4-11/fig3-evidence)

Write `SLATE.md` in `~/projects/slate-client`, and point it at `~/projects/slate-api` by path or remote name.

- Owner. The two accounts, the title the first created, and what the second account's `GET /api/todos` returned. Include the status you got when the second token called `PATCH` or `DELETE` on the first id.
- 401. What you did to clear the token, and what the screen showed on the next load.
- Reload. The status of the create, then what a browser refresh showed, and why that row exists after the JavaScript memory was wiped.
- Header. One sentence confirming `Authorization` is present in the network panel and the token is absent from the URL.
- The failure you forced by stopping the API: the notice text and whether the draft survived.

Commit both projects. Leave `.env` uncommitted; add it to `.gitignore` the way the guild door did. A `.env.example` with the key names and empty values is the file that belongs in git. The slate is the pattern the next session repeats with a different noun. You are not done with it until the three evidence lines are true of the running screen, not only of the code you meant to write.

## Side quests

Hiding a delete button leaves the route open, a token only establishes identity, and the todo route still has to decide whether this account owns this row, so read the broken-access-control sheet and the authentication-versus-authorization sheet before you ship a screen that only checks that some token exists.

## Before next session

Next session you build the same contract again, as a spellbook, with the todo repository closed. The fields change. The header, the owner filter, and the rule about waiting for a 2xx do not. Before you sit down, draw the todo request from memory on paper: method, path, who sets `owner`, which status means saved, where the token goes. If you cannot draw it, reread `SLATE.md`, not the whole server. The point of the next hour is to find out whether the contract is yours or whether the files were yours. Open the todo project only when a specific error names a layer, and open the doc for that layer.
