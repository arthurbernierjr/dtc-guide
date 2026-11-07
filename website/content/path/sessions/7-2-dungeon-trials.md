---
editorial: true
title: Dungeon Trials
subtitle: Supertest, a throwaway database, and the hall's real routes under test
hook: "You proved the inbox by hand in 4-14 and wrote four statuses in a note. Today those four lines become four tests that send real requests through the real router into a database that exists only to be wiped."
read: 60
artifact: "hall-api split into app.js and server.js, a guildhall_test database that refuses to be anything else, and a Supertest suite for accounts, letters, and the pack on the add-tests branch"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://github.com/forwardemail/supertest#readme
  - https://jestjs.io/docs/configuration
  - https://jestjs.io/docs/setup-teardown
  - https://jestjs.io/docs/asynchronous
  - https://mongoosejs.com/docs/connections.html
  - https://nodejs.org/api/cli.html#--env-fileconfig
say:
  - "Supertest listens on a port of its own and sends real HTTP; what you skip is your own listen call, not the network."
  - "The test database is named in a second variable, ends in _test, and is wiped before every test."
  - "Register, then log in, then send the token; a 403 for Ivo is the test, a 200 for Sera is the control."
---

## The hook

In 4-14 you proved the inbox with three accounts and a list of statuses: 200 for Sera, 403 for Ivo, 403 for Bran, 404 for an id that matches nothing. You typed the curls, read the numbers, and wrote them into `HALL.md`. Then Unit 5 let a model rewrite parts of the hall and Unit 6 moved the process onto a server. You have not re-run those curls since. If the recipient check went missing during either unit, the hall is leaking mail right now and the note still says 403.

Today the note becomes a file that checks itself. You split `server.js` in `~/projects/hall-api` into an `app.js` that builds the Express application and a `server.js` that connects and listens, so a test can import the app without binding port 4100. You point Jest at a database called `guildhall_test` that exists to be emptied. You install Supertest and send real HTTP requests, with real bearer tokens, through the real router. By the end, `npm test` in `hall-api` registers Bran, Sera, and Ivo, sends a letter, and asserts those four statuses in under two seconds, on a branch called `add-tests`.

> *The dummy in the sparring ground never hit back. The dungeon has doors, and some of them are supposed to stay shut.*

## The idea

A unit test calls one function. An integration test sends a request through everything the function lives inside: the JSON parser, the CORS middleware, the bearer check, the route, the Mongoose model, the database, the JSON error handler, and back out as a status and a body. That whole path is where the hall's real bugs live. A route handler that works perfectly in isolation is still a mail leak if `requireUser` was never mounted in front of it, and no unit test can see that, because the mounting is not inside any function.

Supertest is the tool that sends those requests. You hand it the Express app object, and `request(app).get('/api/inbox')` starts the app on an ephemeral port that the operating system picks, sends a real HTTP request over loopback, and resolves with the response. What you skip is your own `app.listen(4100)`, not the network. The request is real HTTP, which means `express.json()` really parses, headers are really headers, and a 403 is a 403 the way curl would see it.

![](diagram:session-7-2/fig1-model)

### The split: app.js builds, server.js listens

Your `server.js` today does four things in one file: builds the app and mounts the routes, defines the models, connects to MongoDB, and listens. A test needs the first two and must not do the last two. If `require('./server')` called `app.listen`, every test file would try to take port 4100, and Jest would either fail with `EADDRINUSE` or sit forever after the tests finish because a server is still open. So the file splits along that line.

`app.js` is everything up to, but not including, the connection and the listen. It ends with `module.exports = app;`. The models stay registered inside it, because the routes need them.

```js
// fragment: the end of app.js; everything above it is the hall you already wrote
app.use(function (err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = err.name === 'CastError' ? 400 : err.status || 500;
  res.status(status).json({ error: status === 500 ? 'server error' : err.message });
});

module.exports = app;
```

`server.js` becomes short. It is the only file that reads `MONGODB_URI` and the only file that listens.

```js
// server.js
const mongoose = require('mongoose');
const app = require('./app');

async function main() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await mongoose.connect(process.env.MONGODB_URI);
  const port = process.env.PORT || 4100;
  app.listen(port, function () {
    console.log('guild hall on ' + port);
  });
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
```

`node --env-file=.env server.js` starts the hall exactly as before. The deployed copy from Unit 6 is started the same way, so nothing about the deploy changes; only the file boundary moved. Start it once after the split and curl `/api/items` with a token to prove the twelve routes still answer, then stop it with Ctrl-C. Tests never need it running.

### A database that can only be the test database

Tests delete rows. They delete every row, before every test, so that each test starts from nothing. That is correct behavior against `guildhall_test` and a catastrophe against `guildhall`. The protection is not care. It is a rule in code: the test setup reads a second variable, `TEST_MONGODB_URI`, never `MONGODB_URI`, and it refuses to connect unless the database name ends in `_test`. There is no fallback. If the variable is missing, the suite throws before any test runs, with a sentence that says what to set.

Use `127.0.0.1` rather than `localhost`, as you have since 4-5. On some machines `localhost` resolves to the IPv6 address first while `mongod` listens on the IPv4 one, and the resulting error, a connection refused after a long pause, has nothing to do with your tests.

The setup file wipes every collection in `beforeEach`, not `afterEach`. The reason is practical. A hook that cleans after a test also cleans after a failing test, so by the time you open `mongosh` to look at what the route actually wrote, the rows are gone. Cleaning before each test leaves the last test's rows in place for inspection and still guarantees every test begins empty. The connection closes in `afterAll` so the Jest process can exit.

Two more lines in the same file matter later. `await mongoose.syncIndexes()` after connecting makes sure the unique index on `email` and the compound index on holdings exist before the first test runs; Mongoose builds indexes in the background after connect, and a duplicate-email test on a fresh database can race the index and pass a duplicate through. And `maxWorkers: 1` in the Jest config runs test files one after another. Jest normally runs files in parallel workers, and two files wiping one shared database at the same time produce failures that come and go: a 404 for a user the other file just deleted, an E11000 from a row the other file just inserted. Within one file, tests run in the order you wrote them. Across files, with workers, there is no order, and that is why the files must not share a live database at the same moment.

### Every request is a promise

Mark every test `async` and `await` every request. A test that calls `request(app).get(...)` and forgets the `await` returns before the response arrives, and Jest reports it green with zero assertions checked. This is the most dangerous bug in a test file because it does not look like a bug. The sabotage check from 7-1 is the defence: break the route, run, and make sure red appears.

```js
// fragment: the shape of every integration test in this unit
it('answers 401 without a token', async () => {
  const res = await request(app).get('/api/inbox');
  expect(res.status).toBe(401);
  expect(res.body).toHaveProperty('error');
});
```

`res.status` is the status code. `res.body` is the parsed JSON. `.send(obj)` attaches a JSON body and sets the content type. `.set('Authorization', 'Bearer ' + token)` attaches a header. `.expect(201)` is Supertest's own shortcut for asserting the status inline, useful inside helpers where a failure should stop the setup early.

### Reading a red run

A failing integration test prints more than a unit test does, and the extra lines are the ones that matter. The first block is Jest's: the `it` string, the matcher, `Expected` and `Received`. For a status assertion that is one line, `Expected: 403, Received: 200`, and it tells you which door is open. The second block is whatever your app logged during that test, because `console.log` and `console.error` from inside a route are captured and printed under the test that triggered them. A 500 that you did not expect usually has its stack right there, three lines below the assertion, with the file and line in `app.js`. Read upward from the assertion, not downward from the top of the output.

Two failures look alike and are not. `Received: 401` on a test that expected 200 means the token was missing or wrong before the route ever ran: the helper got `undefined` from the wrong response, the secret in `.env.test` does not match the one the app signs with, or `Authorization` was spelled `Authorisation`. `Received: 403` on the same test means the route ran and the recipient comparison refused you, which is a different file and a different cause. The status is the first word of the diagnosis. Make the `it` string say the status you expect so the two lines of a failure read as a sentence: is 403 for a stranger, received 200.

### Authentication needs two identities

A test that checks "logged in gets 200, logged out gets 401" has not tested authorization. The hall's rule is about which logged-in person, so every letter test needs at least Bran and Sera, and the 403 cases need Ivo. The helper that creates an account does what a person does: it registers, then it logs in, because the hall's register route answers 201 with the name and the email and does not hand out a token. The token comes from `/api/login`. A helper that reads `res.body.token` from the register response gets `undefined`, sends `Bearer undefined`, and every protected test becomes a 401 that looks like a broken middleware.

Models are reachable by name once `app.js` has been required. `mongoose.model('User')` returns the model registered under that name, wherever its file lives in your project. The helper uses that to look up the new account's `_id`, because a recipient id is what `POST /api/messages` takes. If your register route already returns the id, you can skip the lookup; the test should not care which way.

### Test the contract at the HTTP boundary

For a create route, assert the status, the shape of the body, and the persistence: the document exists afterwards, with the sender taken from the token and not from the body. For a validation failure, assert the 400 and that nothing was written. For a missing resource, distinguish a well-formed id that matches nothing, a 404, from a malformed id, which the hall's error handler turns into a 400 through the `CastError` branch. Do not assert on a stack trace or a Mongoose error string. Those are implementation details that will change when a library updates.

Keep the database real. The point of this layer is to exercise routing, middleware, and persistence together. A test that mocks the model proves only that the handler returns 201 when `create` is replaced by a function that always succeeds. You own the model and the database is on your machine; there is nothing to protect by mocking it. The edge to mock, when you reach one, is a paid third party, and the hall has none.

What you should be able to draw on a napkin: `app.js` exports, `server.js` listens. `TEST_MONGODB_URI` ends in `_test` or the suite refuses. Wipe before each test, close after all. Register, log in, send the token. Status, body, and what is on disk. Ivo's 403 is the test; Sera's 200 is the control that proves the door can open at all.

## The demonstration

Everything happens in `~/projects/hall-api`, on a branch, with `mongod` running on `127.0.0.1:27017` and no hall process running. Stop the hall with Ctrl-C if it is up.

```bash
cd ~/projects/hall-api
git switch -c add-tests
npm install --save-dev jest supertest
```

That is Jest 30 and Supertest 7 as development dependencies of the hall itself. The dojo's install does not carry over; each project has its own `node_modules`. Add the scripts and the config.

```json
{
  "scripts": {
    "start": "node --env-file=.env server.js",
    "test": "node --env-file=.env.test node_modules/jest/bin/jest.js"
  }
}
```

The test script uses the same `--env-file` flag you have used since 4-5, pointed at a second file. `.env.test` is committed, because it contains nothing secret: a localhost database that ends in `_test`, a throwaway signing secret, and the page origin the CORS middleware expects. `.env` stays ignored. If your `.gitignore` says `.env*` rather than `.env`, add a line `!.env.test` under it, or the file never reaches GitHub and next session's CI run fails on the first line of `tests/setup.js`.

```dotenv
# .env.test (committed; nothing in here is a secret)
TEST_MONGODB_URI=mongodb://127.0.0.1:27017/guildhall_test
JWT_SECRET=test-only-not-a-secret
PAGE_ORIGIN=http://localhost:5173
NODE_ENV=test
```

```js
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
  maxWorkers: 1,
  testTimeout: 10000
};
```

The option is `setupFilesAfterEnv`, spelled exactly like that. Jest validates its config and prints a warning for an unknown key, then ignores it, so a typo here means the setup file never runs, Mongoose never connects, and every database test fails ten seconds later with `buffering timed out`. The `testPathIgnorePatterns` entry for `e2e/` is for next session: Playwright's files are also named `*.spec.js`, and without this line Jest would try to run them and fail every one with a message about being invoked through `npx playwright test`.

```js
// tests/setup.js
const mongoose = require('mongoose');
require('../app'); // registers the models

const uri = process.env.TEST_MONGODB_URI;
if (!uri) {
  throw new Error('TEST_MONGODB_URI is not set; refusing to run tests against an unknown database');
}
const dbName = new URL(uri).pathname.slice(1);
if (!dbName.endsWith('_test')) {
  throw new Error('TEST_MONGODB_URI must name a database ending in _test, got ' + dbName);
}

beforeAll(async () => {
  await mongoose.connect(uri);
  await mongoose.syncIndexes();
  console.log('tests connected to ' + mongoose.connection.host + '/' + mongoose.connection.name);
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    await collections[name].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

Now the helper every letter test uses, and the first two test files.

```js
// tests/helpers.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

async function signUp(name) {
  const email = name.toLowerCase() + '@example.com';
  const password = 'correct-horse-battery';
  await request(app).post('/api/register').send({ name, email, password }).expect(201);
  const login = await request(app).post('/api/login').send({ email, password }).expect(200);
  const user = await mongoose.model('User').findOne({ email });
  return { id: String(user._id), token: login.body.token, name, email, password };
}

function bearer(token) {
  return { Authorization: 'Bearer ' + token };
}

module.exports = { signUp, bearer };
```

`helpers.js` is not picked up as a test because its name does not end in `.test.js`. The accounts file does not need the helper; it is the helper's own contract, written out.

```js
// tests/auth.test.js
const request = require('supertest');
const app = require('../app');

describe('accounts', () => {
  const bran = { name: 'Bran', email: 'bran@example.com', password: 'correct-horse-battery' };

  it('registers an account and never returns the hash', async () => {
    const res = await request(app).post('/api/register').send(bran);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Bran', email: 'bran@example.com' });
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });

  it('rejects a short password with 400', async () => {
    const res = await request(app).post('/api/register').send({ ...bran, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('answers 409 for a second registration with the same email', async () => {
    await request(app).post('/api/register').send(bran).expect(201);
    const res = await request(app).post('/api/register').send(bran);
    expect(res.status).toBe(409);
  });

  it('logs in and returns a token', async () => {
    await request(app).post('/api/register').send(bran).expect(201);
    const res = await request(app).post('/api/login').send({ email: bran.email, password: bran.password });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  it('answers 401 for a wrong password', async () => {
    await request(app).post('/api/register').send(bran).expect(201);
    const res = await request(app).post('/api/login').send({ email: bran.email, password: 'wrong-wrong-wrong' });
    expect(res.status).toBe(401);
  });

  it('answers 401 on a protected route without a token', async () => {
    const res = await request(app).get('/api/inbox');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
```

```js
// tests/messages.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { signUp, bearer } = require('./helpers');

describe('letters', () => {
  let bran;
  let sera;
  let ivo;

  beforeEach(async () => {
    bran = await signUp('Bran');
    sera = await signUp('Sera');
    ivo = await signUp('Ivo');
  });

  it('creates a letter with 201 and takes the sender from the token', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set(bearer(bran.token))
      .send({ recipient: sera.id, body: 'The gate is shut.' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ sender: bran.id, recipient: sera.id, body: 'The gate is shut.' });
    const saved = await mongoose.model('Message').findById(res.body._id);
    expect(String(saved.sender)).toBe(bran.id);
  });

  it('answers 400 for an empty body and writes nothing', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set(bearer(bran.token))
      .send({ recipient: sera.id, body: '   ' });
    expect(res.status).toBe(400);
    expect(await mongoose.model('Message').countDocuments()).toBe(0);
  });

  it('answers 404 for a recipient that does not exist', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set(bearer(bran.token))
      .send({ recipient: '507f1f77bcf86cd799439011', body: 'Anyone there?' });
    expect(res.status).toBe(404);
  });

  describe('reading one letter by id', () => {
    let letterId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/messages')
        .set(bearer(bran.token))
        .send({ recipient: sera.id, body: 'The gate is shut.' });
      letterId = res.body._id;
    });

    it('is 200 for the recipient', async () => {
      const res = await request(app).get('/api/messages/' + letterId).set(bearer(sera.token));
      expect(res.status).toBe(200);
      expect(res.body.body).toBe('The gate is shut.');
    });

    it('is 403 for a stranger, and the body stays private', async () => {
      const res = await request(app).get('/api/messages/' + letterId).set(bearer(ivo.token));
      expect(res.status).toBe(403);
      expect(res.body.body).toBeUndefined();
    });

    it('is 403 for the sender', async () => {
      const res = await request(app).get('/api/messages/' + letterId).set(bearer(bran.token));
      expect(res.status).toBe(403);
    });

    it('is 404 for an id that matches nothing', async () => {
      const res = await request(app).get('/api/messages/507f1f77bcf86cd799439011').set(bearer(sera.token));
      expect(res.status).toBe(404);
    });
  });

  it('lists the letter in the recipient inbox and not in the sender inbox', async () => {
    await request(app)
      .post('/api/messages')
      .set(bearer(bran.token))
      .send({ recipient: sera.id, body: 'The gate is shut.' })
      .expect(201);
    const seraInbox = await request(app).get('/api/inbox').set(bearer(sera.token));
    const branInbox = await request(app).get('/api/inbox').set(bearer(bran.token));
    expect(seraInbox.status).toBe(200);
    expect(seraInbox.body).toHaveLength(1);
    expect(seraInbox.body[0].sender).toMatchObject({ name: 'Bran' });
    expect(branInbox.body).toHaveLength(0);
  });
});
```

Run `npm test`.

```text
  console.log
    tests connected to 127.0.0.1/guildhall_test

PASS tests/auth.test.js
PASS tests/messages.test.js

Test Suites: 2 passed, 2 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        1.9 s
```

Read the four statuses inside `reading one letter by id`. They are the four lines from `HALL.md`, and now they run every time you type one command. The last test's `sender` assertion uses `toMatchObject` because the inbox populates the sender down to a name; if your inbox populates differently, the test is the place to notice, not the place to hide it.

Now the sabotage round, which is the whole reason the suite exists. Open `app.js`, find `readMessage`, and comment out the recipient comparison, the `if` that answers 403. Run `npm test`. Two tests go red, the stranger and the sender, with `Expected: 403, Received: 200`. That is the mail leak, caught in under two seconds, by a file. Put the comparison back. Green. Commit.

### A small model you can run here

The page cannot start MongoDB, so here is a small model you can run here: a function that plays the role of the whole request path for a letter, with the same four exits the suite checks, plus the one guard from `tests/setup.js`. It proves that the denied exits leave the store unchanged and that a validation failure is a different status from a permission failure. It does not prove anything about your hall; `npm test` in `hall-api` is that proof.

```js run=checkpoint-7-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

// The request path for POST /api/messages, as one function: token, then validation, then the write.
function sendLetter(store, token, body) {
  if (!token) return { status: 401, store: store };
  const text = typeof body.body === 'string' ? body.body.trim() : '';
  if (text === '') return { status: 400, store: store };
  if (!store.users.includes(body.recipient)) return { status: 404, store: store };
  const letter = { sender: token.sub, recipient: body.recipient, body: text };
  return { status: 201, store: { users: store.users, letters: store.letters.concat([letter]) } };
}

const empty = { users: ['bran', 'sera', 'ivo'], letters: [] };
const noToken = sendLetter(empty, null, { recipient: 'sera', body: 'The gate is shut.' });
check(noToken.status === 401 && noToken.store === empty, 'Denied request writes nothing');

const blank = sendLetter(empty, { sub: 'bran' }, { recipient: 'sera', body: '   ' });
check(blank.status === 400 && blank.store.letters.length === 0, 'Validation is a distinct failure');

const sent = sendLetter(empty, { sub: 'bran' }, { recipient: 'sera', body: 'The gate is shut.' });
check(sent.status === 201 && sent.store.letters[0].sender === 'bran', 'the sender comes from the token, not the body');

// The read door: recipient only.
function readLetter(letter, userId) {
  if (String(letter.recipient) !== String(userId)) return 403;
  return 200;
}
check(readLetter(sent.store.letters[0], 'sera') === 200 && readLetter(sent.store.letters[0], 'ivo') === 403, 'the recipient reads, the stranger is refused');

// The guard from tests/setup.js: only a database that ends in _test may be wiped.
function allowedTestDb(uri) {
  const name = uri.slice(uri.lastIndexOf('/') + 1);
  return name.endsWith('_test');
}
check(allowedTestDb('mongodb://127.0.0.1:27017/guildhall_test') === true, 'guildhall_test is allowed');
check(allowedTestDb('mongodb://127.0.0.1:27017/guildhall') === false, 'the real database is refused');

console.log('ok: checkpoint-7-2');
```

Change the guard to accept any name and run again. Nothing breaks in the model, which is exactly the problem: the guard is the only thing standing between `deleteMany({})` and your real `guildhall`. Put it back.

## Where it breaks

![](diagram:session-7-2/fig2-diagnosis)

### Production database used

The test run deletes rows, and the rows were the real ones, because the setup file read `MONGODB_URI` from the environment, or fell back to it when the test variable was missing, and that variable pointed at the hall's database. A test suite needs an explicit disposable database, named in a second variable, refused if the name does not end in `_test`. Print the host and the database name at startup so the first line of every run says where the wipes are going. The mistake is quiet. The suite "works." It works on the data you cannot replace.

If you are reading this after it happened: the deployed hall's data on the Unit 6 server is a different database on a different machine and was not touched by a local run. The local `guildhall` can be rebuilt by registering the three accounts again and seeding the catalog. Then write the guard before you write another test.

### Server never exits

Jest reports the tests and then sits there, or prints `Jest did not exit one second after the test run has completed`. The app called `listen` at import time, or the database connection was never closed, so the event loop never empties. If two files import a listening `server.js`, the second one fails with `EADDRINUSE` instead. Build the app in a module that does not listen, import that module in tests, and close the connection in `afterAll`. If it still hangs, run `npx jest --detectOpenHandles` and it names the handle. A suite that does not exit will hang the CI job in line behind it next session. Hanging is a failure even when every assertion passed.

### Mock hides bug

The route test mocks the model, the auth check, and the validator, and then asserts that the handler returned 200. All it proved is that the handler returns 200 when everything it calls is replaced. Keep one boundary real. If you are testing the route, let the validator run. If you are testing persistence, hit the disposable database. Mock the edge you do not own, such as a paid third party, and be suspicious of a test where every collaborator is a mock. That test can stay green through a broken query, a missing index, and a middleware that was never mounted.

## Your turn

In `~/projects/hall-api`, on `add-tests`, with `mongod` running and the hall stopped.

1. Split `server.js` into `app.js` and `server.js` as shown. Start the hall once with `npm start` and confirm the terminal prints `guild hall on 4100`. Curl `/api/items` with a token to see the twelve routes still answer. Stop it with Ctrl-C.
2. `npm install --save-dev jest supertest`, then add the `test` script, `.env.test`, `jest.config.js`, and `tests/setup.js`. Run `npm test` with no test files yet; Jest prints `No tests found, exiting with code 1`, which is correct.
3. Temporarily set `TEST_MONGODB_URI` in `.env.test` to the real `guildhall` name and run `npm test` with any one test file in place. The run must stop with `TEST_MONGODB_URI must name a database ending in _test, got guildhall`. Put `guildhall_test` back. That refusal is the evidence the guard works.
4. Add `tests/helpers.js`, `tests/auth.test.js`, and `tests/messages.test.js`. `npm test` ends with `Tests: 14 passed, 14 total`.
5. Comment out the recipient check in `readMessage`, run, and confirm exactly two tests fail with `Expected: 403` and `Received: 200`. Restore it. Screenshot that red run as `leak-caught.png`.
6. Write `tests/pack.test.js` from the count evidence in `HALL.md`. One `beforeEach` signs Bran up and seeds the catalog through `POST /api/items/seed` with his token. Then: `GET /api/items` returns three items and no item has a `qty` property; `POST /api/pack/give` twice for lamp oil, amounts 2 and 1, leaves one holding with `qty` 3 in `GET /api/pack`, with `item.kind` equal to `potion`; `POST /api/pack/spend` with amount 50 answers 409 and the holding still reads 3; `POST /api/pack/give` with amount 0 answers 400. The suite should end at `Tests: 18 passed, 18 total`.
7. Sabotage the spend: remove `qty: { $gte: amount }` from the filter in `spend`. Run. The 409 test goes red and the holding reads a negative number in the failure output. Restore it.
8. Commit on `add-tests` and push: `git push -u origin add-tests`.

## The quest

![](diagram:session-7-2/fig3-evidence)

The deliverable is the `add-tests` branch of `hall-api` with a suite that proves the three evidence lines from 4-14 without a human reading a status: the inbox door, the kinds, and the count. Add one more file, `tests/errors.test.js`, for the failures the hall must answer on purpose: a malformed id on `GET /api/messages/not-an-id` is 400 through the `CastError` branch, a `POST /api/messages` with no body at all is 400, `GET /api/pack` with `Bearer totally.fake.token` is 401, and a token signed with a different secret is 401.

Evidence to keep:

- `npm test` output pasted into `TESTING.md` in the repo, with the `Tests:` line and the `tests connected to 127.0.0.1/guildhall_test` line.
- `leak-caught.png`, the red run from step 5, and `negative-caught.png` from step 7, both linked from `TESTING.md`.
- The guard refusal line from step 3, pasted in `TESTING.md` under a heading that says what you tried.
- `app.js` exporting the app and `server.js` listening, both committed, with the hall still startable by `npm start`.

Open `HALL.md` beside `TESTING.md`. Every status in the old note should now have a test whose `it` string says the same thing. Where it does not, write the test, not the sentence.

## Side quests

The suite is the executable version of the API contract that the API-design sheet argues about, and the 403 for Ivo is the broken-access-control case from the OWASP page, now checked by a machine instead of remembered by you.

## Before next session

Next session a real browser logs in as Sera and reads Bran's letter on the hall's own page, and GitHub runs the same suite on a machine you never see. Install Playwright now so the browser download happens before the session, not during it. In `~/projects/hall-api`, run `npm init playwright@latest` and answer the prompts carefully: JavaScript, not TypeScript; `e2e` as the folder for the tests, not the default `tests`, because `tests/` is Jest's; no to adding a GitHub Actions workflow, because you write that by hand next session; yes to installing browsers. Then delete the two scaffold files it leaves behind, `e2e/example.spec.js` and the whole `tests-examples/` folder, and run `npm test` once more to confirm Jest still reports 18 and did not try to run anything under `e2e/`. Commit that on `add-tests`.

Check `~/projects/hall-client` starts with `npm run dev` and prints `http://localhost:5173/`, then stop it. Nothing is left running after today: no hall, no client, no test process. The next session starts in `~/projects/hall-api` with `playwright.config.js` open.
