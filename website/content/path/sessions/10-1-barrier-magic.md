---
editorial: true
title: Barrier Magic
subtitle: OWASP, Input Validation, and Secrets Management
hook: "The capstone gets its first line of code today, copied from the hall you already trust, and then it gets a barrier: every body validated into a shape you chose, headers Helmet sets for you, a limiter on the login door, and a process that refuses to start without its secrets."
read: 60
artifact: "A capstone API and client scaffolded from the hall's auth pattern, hardened with validation, Helmet, CORS, and rate limits, plus docs/threat-model.md"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://owasp.org/Top10/2025/
  - https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
  - https://express-validator.github.io/docs/
  - https://helmetjs.github.io/
  - https://express-rate-limit.mintlify.app/
  - https://nodejs.org/api/cli.html#--env-fileconfig
say:
  - "Validation builds a trusted shape; it does not clean a dirty one."
  - "Sanitizing a string and authorizing an operation are two different checks, and you need both."
  - "A secret that was ever committed is public; rotate it, then delete it."
---

## The hook

Nine sessions of documents sit in `~/projects/<capstone-name>/docs`: `research.md` with the interviews and the empathy map, `user-stories.md`, `sprint-plan.md`, `product-spec.md`, and last session's `system-design.md`. The folder has no `package.json`. Today that changes. You scaffold the capstone's API and client, and you do not invent a login from scratch. You copy the user model, `register`, `login`, and `requireUser` from `~/projects/hall-api`, because the hall is the code you have already proven with three accounts and a 403.

Then you put the barrier up before there is anything behind it worth stealing. The order matters. A route that accepts `{ "role": "admin" }` on day one is still accepting it on the day you have real users, unless the validation chain was there first. By the end of the session the capstone answers `POST /api/register` with a 201 that contains only the fields you chose, answers a NoSQL operator with a 400, sends Helmet's headers on every response, returns 429 on the eleventh login attempt, and exits with one FATAL line when `JWT_SECRET` is missing.

> *The hall taught you to check the token. The barrier is everything the token does not check.*

## The idea

The [OWASP Top 10:2025](https://owasp.org/Top10/2025/) is an awareness list, not a certificate. Ten categories, ordered by how often they turn up in real breaches. You read it once with the capstone open and ask of each category: where in my API could this happen, and which line prevents it. The answers are the threat model. Most of them are short. Some of them are "nowhere yet, because the feature does not exist," and that is a legitimate entry as long as you come back when the feature arrives in 10-2 and 10-3.

Here is the list, with the capstone's answer next to each item. A01 Broken Access Control: a route reads `req.params.id` and returns the document without checking `req.userId` owns it. The hall's inbox already shows the fix, which is a filter with the token's id in it. A02 Security Misconfiguration: debug output in production, a wildcard CORS origin, a stack trace in a JSON error. A03 Software Supply Chain Failures: a dependency with a known hole, or a lockfile you never read. A04 Cryptographic Failures: a password stored as text, a token signed with the string `secret`. A05 Injection: a request body that is an operator instead of a string, reaching `User.findOne`. A06 Insecure Design: a flow that lets anyone reach the paid feature by typing its URL. A07 Authentication Failures: unlimited login attempts, tokens that never expire. A08 Software or Data Integrity Failures: a webhook you believe without checking its signature, which is next session. A09 Security Logging and Alerting Failures: a failed login that leaves no line anywhere. A10 Mishandling of Exceptional Conditions: a thrown error that becomes a hung request or a leaked message.

The old names you will see in older posts, Broken Authentication, XSS, CSRF, SSRF, are still real attacks. In the 2025 list XSS lives under Injection, SSRF lives under Broken Access Control, and the authentication category was renamed. The [side quest on A01](/security/owasp/a01-broken-access-control/) and [the one on A05](/security/owasp/a05-injection/) are the two most likely to bite a JSON API, and the [quick reference](/security/web-vulns-quick-reference/) is the glossary for the rest.

### Boundaries first, then controls

Start by listing what the capstone must protect: user records, password hashes, the JWT secret, and from next session on, payment state and a provider key. Then name where untrusted input crosses into an operation. The JSON body, the query string, the URL parameters, the `Authorization` header, and later a webhook body and a model's reply. Each of those is a boundary. A boundary has an ordinary request and an abuse request, and the server has to tell them apart without help from the screen. A user editing their own profile is ordinary. The same user changing the id in the URL to someone else's is abuse. Hiding the edit button in React does nothing to a `curl` command.

Draw one request through the capstone and mark the boundary it crosses. `POST /api/register` carries a body. The body is bytes until `express.json()` parses it. After parsing it is an object with whatever keys the client chose. That object is not your data. It is a proposal. Validation is the step that turns a proposal into a shape you decided on, and that is the sentence to keep: validation builds a trusted shape, it does not clean a dirty one.

### Validation creates a trusted shape

[express-validator](https://express-validator.github.io/docs/) is a set of middleware that checks and transforms fields on `req`. You write a chain per field: `body('email').isString().trim().toLowerCase().isEmail()`. Each call adds a rule. `validationResult(req)` collects the failures, and `matchedData(req)` returns an object holding only the fields that had a chain. That second function is the whole trick. If the client sends `role: 'admin'`, there is no chain for `role`, so `matchedData` does not return it, so it never reaches `User.create`. You did not write code to strip `role`. You wrote code that only accepts `name`, `email`, and `password`, and everything else fell off.

Compare that with the habit of passing `req.body` straight into `User.create(req.body)`. Mongoose drops unknown keys that are not in the schema, so you might feel safe. Then one day you add `role` to the schema for an admin screen, and the register route starts accepting it the same afternoon. The chain is the place that says what register accepts, and it does not change because the schema grew.

Validation and output encoding are different jobs. A `name` of `<script>` is valid text; it is not valid HTML. The capstone's client renders text through React, which escapes by default, so the API does not need to mangle the name on the way in. If a later feature needs rich HTML, that is the moment to add a maintained sanitizer with an allowlist, not a regular expression you wrote at midnight.

### The operator that is not a string

A MongoDB query is an object, and so is a JSON body. That is the whole of NoSQL injection. The hall's login did `User.findOne({ email })` with `email` from the body. Send this body and read it as the query it becomes:

```json
{ "email": { "$gt": "" }, "password": { "$gt": "" } }
```

`{ email: { $gt: '' } }` matches every user whose email is greater than the empty string, which is every user. The hall was saved by `bcrypt.compare`, which needs a real string, and by the schema's string cast on the way in. Do not lean on that. Two defences are cheaper. The chain's `isString()` rejects an object before the handler runs. A small middleware that walks the body and refuses any key starting with `$` or containing a `.` rejects the shape itself. You will write both. The older `express-mongo-sanitize` package does the second job by assigning to `req.query`, and Express 5 made `req.query` a read-only getter, so write the twelve lines yourself.

### Headers, origins, and the door you throttle

[Helmet](https://helmetjs.github.io/) is one middleware that sets a bundle of response headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, and a few more. `app.use(helmet())` with no options is the right call for an API that serves JSON. The CSP it sets on a JSON response does not govern your React page, because the page comes from Vite in development and from a static host in production. The page's CSP belongs to whoever serves the page. Do not spend the evening tuning `scriptSrc` on an API.

CORS you already know from 4-12. The origin is `PAGE_ORIGIN` from the environment, a single string, not `*`. A wildcard with credentials is a misconfiguration the browser will refuse anyway, and a wildcard without credentials means any page on the internet can call your API with a stolen token in a header. One origin in development, one in production, both from the environment.

[express-rate-limit](https://express-rate-limit.mintlify.app/) counts requests per key inside a window and answers 429 once the count passes `limit`. The option is `limit`. Older tutorials write `max`, which was the name in version 6, and current versions accept it only as a deprecated alias. Two limiters are enough today: a general one on `/api` with a generous number, and a strict one on `/api/login` and `/api/register` with a number you can hit by hand in a loop. The login limiter is the control for A07. Ten attempts in fifteen minutes is a wall for a script and not a wall for a person who forgot a password twice.

### Secrets, and the process that refuses to start

The capstone reads `.env` the way every project since 4-6 has: `node --env-file=.env server.js`. There is no package for it. The `dotenv` package you will see in other codebases does the same job from inside the program, with `require('dotenv').config()` as the first line; it is the library alternative, and you only need it when you cannot control the command line, which you can. What you add today is a check that runs before `app.listen`: a short list of required names, a loop that prints `FATAL: missing environment variable X` and exits with code 1 if one is absent. A process that starts without `JWT_SECRET` and signs tokens with `undefined` is a worse outcome than a process that refuses to start.

The secret-handling rules fit on a card. `.env` is in `.gitignore` before the first commit, and `git check-ignore api/.env` proves it. A `.env.example` with names and empty values is the file that belongs in the repo. A secret that was ever committed is public, even if the next commit deleted it, because history keeps it; rotate first, then clean. Secrets never go in a log line and never in a URL. The bearer token lives in `sessionStorage` and in the `Authorization` header, which is a deliberate choice you record, not a cookie you forgot to set.

Here is the napkin version. Untrusted input crosses a boundary. A chain turns it into a trusted shape or a 400. A middleware rejects operator keys. Helmet and CORS set the envelope. A limiter guards the door that can be guessed at. The process checks its secrets before it listens. Authorization is still a separate check inside every handler, because none of the above knows who owns what.

![](diagram:session-10-1/fig1-model)

## The demonstration

Stop any server from Unit 9 with Ctrl-C in its terminal. Nothing else should be on port 3000. Mongo is running locally on 27017 from 4-5.

The capstone repo already exists from 8-1, with `docs/` inside it. Scaffold the two halves beside the docs. Replace `<capstone-name>` with your folder's name in every command.

```bash
cd ~/projects/<capstone-name>
mkdir -p api/models api/routes api/middleware
cd api && npm init -y
npm install express mongoose bcrypt jsonwebtoken cors helmet express-rate-limit express-validator
cd ..
npm create vite@latest client -- --template react
cd client && npm install && cd ..
printf 'node_modules/\n.env\ndist/\n' >> .gitignore
```

The repo root `.gitignore` covers both halves: `node_modules/` and `.env` match at any depth. Run `git check-ignore api/.env` after you create the file. It prints the path back when the rule works, and prints nothing when it does not.

Now the four pieces from the hall. Open `~/projects/hall-api` beside the capstone. If you finished 9-6's conversion, the hall's code is TypeScript under `src/`; the JavaScript below is what those files are without the type annotations, so copy the shape and drop the types as you paste. Copy the `userSchema` and the `User` model into `api/models/user.js`. Copy `requireUser` into `api/middleware/require-user.js`. Copy `register` and `login` into `api/routes/auth.js`. Rename three things as you go: the audience `'guild'` becomes `'capstone'`, the port `4100` becomes `3000`, and the database `guildhall` becomes `<capstone-name>`.

`api/models/user.js` is the hall's schema with timestamps:

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = { User };
```

`api/config.js` is new. It runs before anything listens.

```js
const required = ['MONGODB_URI', 'JWT_SECRET', 'PAGE_ORIGIN'];

for (const name of required) {
  if (!process.env[name]) {
    console.error('FATAL: missing environment variable ' + name);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET is too short; generate one with: openssl rand -hex 32');
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  pageOrigin: process.env.PAGE_ORIGIN,
  nodeEnv: process.env.NODE_ENV || 'development'
};
```

`api/middleware/require-user.js` is the hall's middleware with the new audience:

```js
const jwt = require('jsonwebtoken');
const config = require('../config');

function requireUser(req, res, next) {
  const header = req.get('authorization') || '';
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || parts[1] === '') {
    return res.status(401).json({ error: 'missing token' });
  }
  try {
    const payload = jwt.verify(parts[1], config.jwtSecret, { audience: 'capstone' });
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

`req.userId` is the name every later route reads. Not `req.user.userId`, not `req.user.id`. One name, set in one place.

`api/middleware/validate.js` holds the two small pieces the chains need:

```js
const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'invalid input',
      fields: errors.array().map((e) => ({ field: e.path, message: e.msg }))
    });
  }
  next();
}

function hasOperatorKey(value) {
  if (Array.isArray(value)) return value.some(hasOperatorKey);
  if (value && typeof value === 'object') {
    return Object.keys(value).some(
      (key) => key.startsWith('$') || key.includes('.') || hasOperatorKey(value[key])
    );
  }
  return false;
}

function rejectOperators(req, res, next) {
  if (hasOperatorKey(req.body) || hasOperatorKey(req.query)) {
    return res.status(400).json({ error: 'invalid input' });
  }
  next();
}

module.exports = { validateRequest, rejectOperators };
```

`api/routes/auth.js` is the hall's two handlers with chains in front of them and `matchedData` instead of `req.body`:

```js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, matchedData } = require('express-validator');
const { User } = require('../models/user');
const { validateRequest } = require('../middleware/validate');
const { requireUser } = require('../middleware/require-user');
const config = require('../config');

const router = express.Router();

const registerRules = [
  body('name').isString().trim().isLength({ min: 1, max: 60 }).withMessage('name is 1 to 60 characters'),
  body('email').isString().trim().toLowerCase().isEmail().withMessage('email must be an address'),
  body('password').isString().isLength({ min: 8, max: 200 }).withMessage('password is at least 8 characters')
];

const loginRules = [
  body('email').isString().trim().toLowerCase().isEmail().withMessage('email must be an address'),
  body('password').isString().notEmpty().withMessage('password is required')
];

function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, config.jwtSecret, { expiresIn: '2h', audience: 'capstone' });
}

router.post('/register', registerRules, validateRequest, async (req, res) => {
  const { name, email, password } = matchedData(req);
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'email already registered' });
    throw err;
  }
});

router.post('/login', loginRules, validateRequest, async (req, res) => {
  const { email, password } = matchedData(req);
  const user = await User.findOne({ email });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!ok) return res.status(401).json({ error: 'wrong email or password' });
  res.json({ token: signToken(user), id: user._id, name: user.name, email: user.email });
});

router.get('/me', requireUser, async (req, res) => {
  const user = await User.findById(req.userId).select('name email');
  if (!user) return res.status(401).json({ error: 'bad token' });
  res.json({ id: user._id, name: user.name, email: user.email });
});

module.exports = { router };
```

`api/app.js` is the stack, in the order that is the program. It exports the app the way the hall did after Unit 7, so tests can import it without listening.

```js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const config = require('./config');
const { rejectOperators } = require('./middleware/validate');
const auth = require('./routes/auth');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.pageOrigin }));
app.use((req, res, next) => {
  console.log(req.method + ' ' + req.originalUrl);
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too many requests' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too many attempts, wait 15 minutes' }
});

app.use('/api', apiLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(rejectOperators);

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', auth.router);

app.use((req, res) => {
  res.status(404).json({ error: 'no such path' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'body too large' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'body is not JSON' });
  console.error(err.stack || err);
  res.status(500).json({ error: 'server error' });
});

module.exports = { app };
```

`api/server.js` connects and listens:

```js
const mongoose = require('mongoose');
const config = require('./config');
const { app } = require('./app');

mongoose
  .connect(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => {
      console.log('listening on ' + config.port);
    });
  })
  .catch((err) => {
    console.error('mongo connect failed: ' + err.message);
    process.exit(1);
  });
```

`api/.env` holds the four values. Generate the secret; do not type one.

```dotenv
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/<capstone-name>
JWT_SECRET=paste-the-output-of-openssl-rand-hex-32-here
PAGE_ORIGIN=http://localhost:5173
```

Copy it to `api/.env.example` with the values blanked. Then start it from `api/`: `node --env-file=.env server.js`. The line is `listening on 3000`. Start it once more with `JWT_SECRET` commented out, and the line is `FATAL: missing environment variable JWT_SECRET`, and the prompt comes back, because the process exited. That is the fail-fast evidence. Put the secret back.

Now the one worked example, the register boundary, with three curls. First the ordinary request with one extra key:

```bash
curl -i -H 'Content-Type: application/json' \
  -d '{"name":"Bran","email":"Bran@Example.com","password":"correct horse","role":"admin"}' \
  http://localhost:3000/api/register
```

The status is `201 Created`. The body has `id`, `name`, and `email`, with the email lowercased, and no `role`. The key was in the request and is absent from the document, and no line of code mentions `role`. That is `matchedData` doing the only thing it does.

Second, the operator:

```bash
curl -i -H 'Content-Type: application/json' \
  -d '{"email":{"$gt":""},"password":{"$gt":""}}' \
  http://localhost:3000/api/login
```

The status is `400 Bad Request` with `{"error":"invalid input"}`. `rejectOperators` answered before the chain ran, and the chain's `isString()` would have answered if it had not. The handler never saw the body.

Third, the headers. `curl -i http://localhost:3000/api/health` and read the top of the response: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, and `RateLimit-Limit: 100` beside `RateLimit-Remaining`. Then the loop, after one restart. `authLimiter` is a single instance mounted on both `/api/login` and `/api/register`, its count lives in the process's memory, and the register and login curls you just sent are already in it, so the eleventh line below would arrive early. Press Ctrl-C in the API terminal and start it again with `node --env-file=.env server.js`. The window is fresh and the count starts at zero.

```bash
for i in $(seq 1 11); do
  curl -s -o /dev/null -w '%{http_code}\n' -H 'Content-Type: application/json' \
    -d '{"email":"bran@example.com","password":"wrong"}' http://localhost:3000/api/login
done
```

Ten lines of `401`, then one `429`. The eleventh attempt in the window is refused before the database is asked anything. Wait fifteen minutes or restart the process to reset the counter; the counter is in memory, which is fine for one process and is a thing you will note in the threat model.

The client is the hall's login screen with the capstone's names. `client/src/api.js` keeps the token and builds every request:

```js
export const apiBase = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

const KEY = 'capstoneToken';

export function getToken() {
  return sessionStorage.getItem(KEY) || '';
}

export function setToken(token) {
  sessionStorage.setItem(KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(KEY);
}

export async function api(path, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  const token = getToken();
  if (token) headers.Authorization = 'Bearer ' + token;
  let body;
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }
  const response = await fetch(apiBase + path, { method: options.method || 'GET', headers, body });
  const data = await response.json().catch(function () { return {}; });
  return { ok: response.ok, status: response.status, data };
}
```

`client/src/App.jsx` registers, logs in, and shows `/api/me`:

```jsx
import { useEffect, useState } from 'react';
import { api, setToken, clearToken, getToken } from './api';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [me, setMe] = useState(null);
  const [note, setNote] = useState('');

  useEffect(function () {
    if (!getToken()) return;
    api('/api/me').then(function (r) { if (r.ok) setMe(r.data); else clearToken(); });
  }, []);

  async function register(event) {
    event.preventDefault();
    const r = await api('/api/register', { method: 'POST', body: { name, email, password } });
    setNote(r.ok ? 'Registered. Now log in.' : (r.data.error || 'failed'));
  }

  async function login(event) {
    event.preventDefault();
    const r = await api('/api/login', { method: 'POST', body: { email, password } });
    if (!r.ok) return setNote(r.data.error || 'failed');
    setToken(r.data.token);
    setMe({ id: r.data.id, name: r.data.name, email: r.data.email });
    setNote('');
  }

  if (me) {
    return (
      <main>
        <p>Signed in as {me.name} ({me.email})</p>
        <button type="button" onClick={function () { clearToken(); setMe(null); }}>Sign out</button>
      </main>
    );
  }

  return (
    <main>
      <form onSubmit={login}>
        <input value={name} onChange={function (e) { setName(e.target.value); }} aria-label="Name" placeholder="Name (register only)" />
        <input value={email} onChange={function (e) { setEmail(e.target.value); }} aria-label="Email" placeholder="Email" />
        <input type="password" value={password} onChange={function (e) { setPassword(e.target.value); }} aria-label="Password" placeholder="Password" />
        <button type="submit">Log in</button>
        <button type="button" onClick={register}>Register</button>
      </form>
      <p role="status">{note}</p>
    </main>
  );
}
```

`cd client && npm run dev` in a second terminal prints `http://localhost:5173`, the origin the API's `.env` allows. Log in with the Bran account you already created by curl (`bran@example.com`, password `correct horse`); the page says `Signed in as Bran`. Restarting the API did not erase the account, so registering that email again should return 409. To exercise the page's Register button, click Sign out and use a different email that is not yet in your database, then log in with that new account. Open the network panel: the request to `/api/me` carries `Authorization: Bearer` and the URL carries nothing.

Here is a small model you can run here. It models the trusted-shape step, the operator check, and the limiter's window. It proves those three rules can be stated and tested. It does not prove your API sends the headers or that your `.env` is ignored by git; those are the curls and the `git check-ignore` on your machine.

```js run=checkpoint-10-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const registerChains = {
  name: function (v) { return typeof v === 'string' && v.trim().length >= 1 ? v.trim() : null; },
  email: function (v) { return typeof v === 'string' && /^[^@\s]+@[^@\s]+$/.test(v.trim()) ? v.trim().toLowerCase() : null; },
  password: function (v) { return typeof v === 'string' && v.length >= 8 ? v : null; }
};

function matchedData(body, chains) {
  const shape = {};
  const errors = [];
  for (const field of Object.keys(chains)) {
    const value = chains[field](body[field]);
    if (value === null) errors.push(field);
    else shape[field] = value;
  }
  return { shape: shape, errors: errors };
}

const proposal = { name: ' Bran ', email: 'Bran@Example.com', password: 'correct horse', role: 'admin' };
const result = matchedData(proposal, registerChains);
check(result.errors.length === 0 && result.shape.name === 'Bran' && result.shape.email === 'bran@example.com', 'Allowed field normalized');
check(!Object.hasOwn(result.shape, 'role'), 'Privilege field excluded');

const short = matchedData({ name: 'Ivo', email: 'ivo@example.com', password: 'short' }, registerChains);
check(short.errors.length === 1 && short.errors[0] === 'password', 'a failing chain names the field');

function hasOperatorKey(value) {
  if (Array.isArray(value)) return value.some(hasOperatorKey);
  if (value && typeof value === 'object') {
    return Object.keys(value).some(function (key) {
      return key.startsWith('$') || key.includes('.') || hasOperatorKey(value[key]);
    });
  }
  return false;
}
check(hasOperatorKey({ email: { $gt: '' }, password: { $gt: '' } }) === true, 'an operator body is refused before the query');
check(hasOperatorKey({ email: 'bran@example.com', password: 'correct horse' }) === false, 'a string body passes the operator check');

function limiter(limit) {
  const hits = new Map();
  return function (key) {
    const count = (hits.get(key) || 0) + 1;
    hits.set(key, count);
    return count > limit ? 429 : 200;
  };
}
const login = limiter(10);
const statuses = [];
for (let i = 0; i < 11; i += 1) statuses.push(login('203.0.113.9'));
check(statuses[9] === 200 && statuses[10] === 429, 'the eleventh attempt in the window is 429');
check(login('198.51.100.4') === 200, 'another key has its own count');

console.log('ok: checkpoint-10-1');
```

## Where it breaks

![](diagram:session-10-1/fig2-diagnosis)

### Sanitization replaces authorization

You validated the string, you rejected the operator, and any logged-in user can still delete any record, because the route never checked who owns it. Sanitization changes what a value can do. Authorization decides who may do the operation. They fail in different ways and you need both. Log in as a second account, send a well-formed id that belongs to the first, and expect a refusal. If a clean payload from the wrong person succeeds, the chain did its job and the boundary you meant to protect is wide open. The fix is the filter the hall taught: `{ _id: req.params.id, owner: req.userId }`, so the query itself cannot find someone else's document.

### Secrets committed

A key landed in a commit. You removed it in the next commit and feel fine. Anyone who clones the repo has the first commit. Rotate the secret first, so the leaked value stops working: a new `JWT_SECRET` logs everyone out, a new provider key is one click in the provider's dashboard. Then clean the history or accept that the old value is public forever. Add the ignore rule that would have kept the file out, confirm it with `git check-ignore api/.env`, and search history once: `git log --all -p | grep -n 'JWT_SECRET='` should print nothing but the example file's empty value. A rotation you skipped because you deleted the file is the incident still in progress.

### Audit fix breaks behavior

`npm audit` named a package, you ran `npm audit fix`, and a route started rejecting a body it used to accept. The advisory was real and so is the break. Read the report before the fix: which package, which version range, whether the vulnerable path is one you call. Run `npm audit fix` without `--force`; the forced form will jump major versions on your behalf. Then run the tests from Unit 7, or if the capstone has none yet, the three curls from the demonstration, and commit the lockfile diff on its own so the change is one commit you can revert. An audit that goes green by applying every bump with no run afterwards has traded a reported risk for an unknown one.

## Your turn

Build the barrier in `~/projects/<capstone-name>`. Everything below is on your machine; Mongo is on 27017 and nothing else is on 3000.

1. Scaffold `api/` and `client/` with the commands from the demonstration. `npm init -y` in `api/` prints a `package.json` with no `"type"` line, which is CommonJS, the same as the hall. `git check-ignore api/.env` prints `api/.env` once the file exists.
2. Copy the four pieces from `hall-api` into `api/models/user.js`, `api/middleware/require-user.js`, and `api/routes/auth.js`. Rename the audience to `capstone`. Add `api/config.js` with the required-variables loop. Starting with a missing `JWT_SECRET` prints `FATAL: missing environment variable JWT_SECRET` and exits.
3. Write `api/app.js` in the order shown: Helmet, CORS, logger, the two limiters, `express.json({ limit: '10kb' })`, `rejectOperators`, routes, 404, error handler. `node --env-file=.env server.js` prints `listening on 3000`.
4. Register with an extra `role` key. The status is `201` and the body has no `role`. Register the same email again: `409`.
5. Send the `$gt` login body. The status is `400` and the body is `{"error":"invalid input"}`.
6. Read the headers on `/api/health`. `X-Content-Type-Options: nosniff` and `RateLimit-Remaining` are both there. Restart the API with Ctrl-C and `node --env-file=.env server.js` so the limiter's count is zero, then run the eleven-login loop. Ten `401` lines and one `429`.
7. Start the client, register and log in on the page, and confirm the network panel shows the bearer header on `/api/me` and no token in any URL.
8. Run `npm audit` in `api/` and in `client/`. Read the report. Fix what has a fix without `--force`, rerun the three curls, and commit the lockfiles separately.

If step 3 fails with `Cannot find module 'express-rate-limit'`, you ran the install in the wrong folder. The API's dependencies live in `api/package.json`, not the repo root.

## The quest

![](diagram:session-10-1/fig3-evidence)

Write `docs/threat-model.md` in the capstone repo. Copy this into the file and fill it in.

```markdown
# Threat model

## Assets
- (what the capstone must protect: records, hashes, secrets, later payment state)

## Boundaries
| Boundary | Ordinary request | Abuse request | Control | Evidence |
|---|---|---|---|---|
| POST /api/register body | | | | |
| POST /api/login body | | | | |
| Authorization header | | | | |

## Secrets
- Where each secret lives, who can read it, and what rotating it costs.

## Known gaps
- (controls that do not exist yet and the session that adds them)
```

A filled row looks like this:

```markdown
| POST /api/register body | name, email, password | extra role key, $gt operator | registerRules + matchedData, rejectOperators | 201 without role (curl, 2026-11-11); 400 on $gt |
```

The evidence column is the point. Each control points at a curl you ran, a header you read, or a command whose output you pasted. Commit `api/`, `client/`, `docs/threat-model.md`, and the two `.env.example` files. Leave both `.env` files out, and say in the Secrets section how you checked.

- `docs/threat-model.md` with every boundary row filled and dated.
- The four register and login statuses: 201, 409, 400, 401.
- The header dump from `/api/health`.
- The eleven-line loop output.
- The `FATAL` line from a start without `JWT_SECRET`.
- The `git check-ignore api/.env` output.

## Side quests

Broken access control is the diagnosis you cannot fix with a chain, injection is the one you just fixed with two, and the quick reference names the attacks you will meet in a code review before you meet them in a log.

## Before next session

Next session the capstone takes money, in test mode, through a checkout page Stripe hosts, and a webhook that your server must verify before it believes. Create a Stripe account at [dashboard.stripe.com/register](https://dashboard.stripe.com/register) before you sit down; it asks for an email and nothing else to use test mode. Read the first page of the [webhooks guide](https://docs.stripe.com/webhooks) and notice the phrase about the raw body. That phrase is the reason next session's first edit to `app.js` goes above `express.json`.

Nothing stays running between sessions. Stop the API and the Vite server with Ctrl-C. The capstone now has a barrier and a login, both committed, and `docs/threat-model.md` has a Known gaps section that says "webhook signature" and "paid feature" with next session's number beside them.
