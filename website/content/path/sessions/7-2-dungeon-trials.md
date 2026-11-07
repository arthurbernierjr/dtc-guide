---
editorial: true
title: Dungeon Trials
subtitle: Supertest, API Testing, and Integration Tests
hook: "API integration tests with isolated data and authorization failures. Send real HTTP-shaped inputs through the app."
read: 60
artifact: "API integration tests with isolated data and authorization failures"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://github.com/ladjs/supertest
  - https://jestjs.io/docs/setup-teardown
say:
  - "Request: Send real HTTP-shaped inputs through the app."
  - "Boundary: Exercise routing, middleware, and persistence."
  - "Cleanup: Restore isolated fixtures after every test."
---

## The hook

Last session you sparred with training dummies. You tested isolated functions with no dependencies, no databases, no network calls. That was unit testing. Today, the dungeon trials begin. You are going to test your actual API, your real routes, your controllers talking to a real database, all working together.

Integration testing is where you find the bugs that unit tests miss. Your `add` function works fine in isolation, but does your POST route actually save the item to the database and return a 201? Does your auth middleware reject expired tokens? Does your validation return a 400 with a helpful error message? The only way to know is to test all the pieces working together.

Supertest is the weapon for this trial. It wraps your Express app and lets you make HTTP requests directly, no server required, no ports, no network calls. It is fast, reliable, and the industry standard for Express testing. By the end of today, you will have integration tests for every CRUD operation in your API, plus error case coverage that would make a QA engineer proud.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Apply integration testing techniques using Supertest to verify Express API endpoints and database interactions

**Enabling Objectives:**
- Separate an Express application into an exportable `app.js` and a standalone `server.js`
- Configure a test database with connection setup, per-test cleanup, and teardown
- Use Supertest to make HTTP requests against Express routes without starting a server
- Write assertions on HTTP status codes, response bodies, and database state
- Test authentication flows using JWT tokens in request headers

**You should be able to:**
- Write integration tests for all CRUD operations on at least one API resource
- Test at least 3 error scenarios (400 Bad Request, 401 Unauthorized, 404 Not Found)
- Verify that database state changes correctly after POST, PUT, and DELETE operations
- Use seed helpers and cleanup hooks to keep tests isolated and repeatable

- Concept 1: **What is integration testing?** Unit tests test ONE thing in isolation and mock everything else. Integration tests test how multiple components work TOGETHER. For a MERN app, integration tests typically mean sending an HTTP request to an Express route, letting it hit the controller, letting it talk to the database, and verifying the response. Integration tests are slower than unit tests but catch an entirely different category of bugs: wiring problems, middleware order issues, and database query errors.

- Concept 2: **Why Supertest?** Supertest wraps your Express app and makes HTTP requests directly to it without calling `app.listen()`. No ports, no network calls, no server startup. This means tests are fast and reliable. It is the industry standard for Express API testing. The key insight: your Express app must be exportable. Most beginners have `app.listen()` in the same file as their routes. For testing, you must separate them.

```javascript
// app.js (your Express app, NO app.listen here)
const express = require('express');
const mongoose = require('mongoose');
const itemRoutes = require('./routes/items');
const userRoutes = require('./routes/users');

const app = express();

app.use(express.json());
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);

module.exports = app;
```

```javascript
// server.js (starts the server, only for production)
const app = require('./app');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
```

- Concept 3: **Test database setup.** Never run tests against your production database. Create a separate test database and clean it between every test so tests do not interfere with each other.

```javascript
// tests/setup.js
const mongoose = require('mongoose');

const TEST_DB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/myapp_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  // Clean all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
```

Add to `jest.config.js`:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterSetup: ['./tests/setup.js'],
  testTimeout: 10000, // 10 seconds for async operations
};
```

- Concept 4: **Async testing patterns.** Jest handles async natively with `async/await`. Always make your test function `async` and `await` the Supertest request. If you forget the `await`, the test passes even when it should fail because Jest does not wait for the assertion to run.

```javascript
// CORRECT: async/await (preferred)
it('should fetch items', async () => {
  const res = await request(app).get('/api/items');
  expect(res.status).toBe(200);
});

// WRONG: forgetting async/await (test passes even if assertion fails!)
it('should fetch items', () => {
  request(app).get('/api/items').then(res => {
    expect(res.status).toBe(200); // This might not run!
  });
  // Test ends before the promise resolves
});
```

**Key Points:**
- Always use `async/await` in test functions that make HTTP requests or database calls. Forgetting `await` is the most dangerous async testing bug because the test appears to pass.
- Clean your database in `afterEach`, not `beforeEach`. This way, if a test fails, you can inspect the database to see what went wrong.
- Test both happy paths AND error cases. Your API's error handling code needs tests just as much as the success paths.

**Common Misconceptions:**
- Wrong: "I can test my API by importing my route handler functions directly." Correct: Supertest tests the full request-response cycle including middleware, parsing, and error handling. Calling the handler directly skips all of that.
- Wrong: "Tests that share database state are fine if I run them in order." Correct: Tests should never depend on each other. Each test should set up its own data and clean up after itself. Jest does not guarantee execution order.

![](diagram:session-7-2/fig1-model)

### Name the boundary your test crosses

A Supertest request can exercise Express routing, parsing, validation, authentication, and response serialization without opening a public port. Whether it also exercises a real database depends on your test setup. State that distinction in the test description. Replacing the database with a mock is useful for some cases, but it cannot prove a unique index or transaction behaves correctly.

Export the app separately from the server entry point. Tests import the app and control their own dependencies. The deployment entry point starts the listener. This prevents importing a module from unexpectedly binding a port and makes cleanup more predictable. If your integration test opens a database connection, close it after the suite. A test process that hangs is often revealing a resource lifecycle problem.

### Isolation is a safety property and a correctness property

Use a dedicated test database with a name and connection configuration that cannot silently fall back to production. Refuse to run destructive fixture cleanup unless the environment is explicitly a test environment and the database name matches the intended convention. Seed only the records needed for each case. Broad cleanup against an ambiguous connection is not acceptable even in a tutorial.

Fresh fixtures also make tests independent. A test should not depend on another test having created a particular user first. Setup helpers can create that user explicitly and return its identifier. Use unique values where parallel workers might collide. If you run tests in parallel, account for database isolation per worker or choose a deliberate serial integration suite until the setup supports concurrency.

### Test the contract at the HTTP boundary

For a create route, assert status, response shape, and persistence. For validation failure, assert the error status and that no record was written. For a missing resource, distinguish an invalid identifier from a valid identifier that does not exist. Avoid asserting an entire stack trace or an incidental database error string; those are implementation details that should not be public contracts.

Authentication tests need at least two identities. A valid token for Bo must not permit editing Ada's resource. Send the request directly rather than relying on whether the frontend displays a button. Test a missing token, expired or invalid token, and authorized owner. A security regression often survives a suite that checks only logged-in versus logged-out behavior.

### Choose mocks that preserve the question

Mock external payment, email, or AI calls when the test is about your route's response to a provider outcome. Use explicit fixtures for success, rejection, timeout, and malformed data. Keep a separate manual or sandbox integration check for the provider contract. A mock returning your ideal object cannot prove the provider actually returns that object.

Capture failures with enough context to reproduce them: route, fixture, expected status, and actual response. Redact credentials. The final artifact should show that a normal operation succeeds, an invalid operation leaves state unchanged, and an unauthorized operation cannot cross the ownership boundary. These are behavioral claims that remain useful even if you later refactor controllers and service modules.

## The demonstration

**Live Coding Walkthrough:**

**Demo 1: First Supertest Tests - GET and POST**
- Setup: Install Supertest, show the route being tested.
```bash
npm install --save-dev supertest
```
- The route being tested:
```javascript
// routes/items.js
const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET /api/items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/items
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const item = await Item.create({ name, description });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/items/:id
router.put('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```
- Write the test file:
```javascript
// tests/items.test.js
const request = require('supertest');
const app = require('../app');
const Item = require('../models/Item');

describe('Items API', () => {
  describe('GET /api/items', () => {
    it('should return an empty array when no items exist', async () => {
      const res = await request(app).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all items', async () => {
      // Seed the database
      await Item.create([
        { name: 'Sword of Testing', description: 'A mighty blade' },
        { name: 'Shield of Mocking', description: 'Blocks real calls' },
      ]);

      const res = await request(app).get('/api/items');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBe('Sword of Testing');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new item', async () => {
      const newItem = {
        name: 'Potion of Coverage',
        description: 'Increases code coverage by 10%',
      };

      const res = await request(app)
        .post('/api/items')
        .send(newItem);

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Potion of Coverage');
      expect(res.body._id).toBeDefined();

      // Verify it was actually saved to the database
      const dbItem = await Item.findById(res.body._id);
      expect(dbItem).not.toBeNull();
      expect(dbItem.name).toBe('Potion of Coverage');
    });

    it('should return 400 if name is missing', async () => {
      const res = await request(app)
        .post('/api/items')
        .send({ description: 'No name here' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Name is required');
    });
  });

  describe('GET /api/items/:id', () => {
    it('should return a single item by ID', async () => {
      const item = await Item.create({
        name: 'Scroll of Assertions',
        description: 'Contains ancient test wisdom',
      });

      const res = await request(app).get(`/api/items/${item._id}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Scroll of Assertions');
    });

    it('should return 404 for a non-existent item', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request(app).get(`/api/items/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Item not found');
    });
  });
});
```
- Explain: `request(app)` wraps your Express app. `.get()`, `.post()`, `.put()`, `.delete()` make HTTP requests. `.send()` attaches a request body. `.set()` sets headers (used for auth tokens). The `res` object has `status`, `body`, and `headers`.
- Outcome: You see the full pattern for testing GET and POST routes with Supertest.

**Demo 2: Testing PUT, DELETE, and Authenticated Routes**
- Continue the test file:
```javascript
  describe('PUT /api/items/:id', () => {
    it('should update an existing item', async () => {
      const item = await Item.create({
        name: 'Old Name',
        description: 'Old description',
      });

      const res = await request(app)
        .put(`/api/items/${item._id}`)
        .send({ name: 'New Name', description: 'New description' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name');
      expect(res.body.description).toBe('New description');
    });

    it('should return 404 when updating a non-existent item', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request(app)
        .put(`/api/items/${fakeId}`)
        .send({ name: 'Ghost Item' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('should delete an existing item', async () => {
      const item = await Item.create({
        name: 'Doomed Item',
        description: 'About to be deleted',
      });

      const res = await request(app).delete(`/api/items/${item._id}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Item deleted');

      // Verify it is gone from the database
      const dbItem = await Item.findById(item._id);
      expect(dbItem).toBeNull();
    });

    it('should return 404 when deleting a non-existent item', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const res = await request(app).delete(`/api/items/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });
```
- Show testing authenticated routes with JWT:
```javascript
// Testing authenticated routes
describe('Protected Routes', () => {
  let token;

  beforeEach(async () => {
    // Register a test user and get a token
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
      });
    token = res.body.token;
  });

  it('should access protected route with valid token', async () => {
    const res = await request(app)
      .get('/api/items/my-items')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should return 401 without a token', async () => {
    const res = await request(app)
      .get('/api/items/my-items');

    expect(res.status).toBe(401);
  });

  it('should return 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/api/items/my-items')
      .set('Authorization', 'Bearer totally.fake.token');

    expect(res.status).toBe(401);
  });
});
```
- Key pattern: Use `.set('Authorization', 'Bearer ${token}')` to attach the JWT header. Register a user in `beforeEach` so every test starts fresh.
- Outcome: You understand the complete integration testing pattern for CRUD + auth.

**Demo 3: Error Cases and Database Seeding**
- Show comprehensive error scenario testing:
```javascript
describe('Error Handling', () => {
  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({}); // empty body

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'not-an-email',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
  });

  it('should return 409 for duplicate email registration', async () => {
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'user1',
        email: 'duplicate@test.com',
        password: 'Password123!',
      });

    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'user2',
        email: 'duplicate@test.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
  });
});
```
- Show the database seeding pattern:
```javascript
// Seed helper function
async function seedItems(count = 3) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    items.push({ name: `Item ${i}`, description: `Description ${i}` });
  }
  return Item.insertMany(items);
}

// Use in tests
describe('GET /api/items', () => {
  it('should return paginated results', async () => {
    await seedItems(25); // Create 25 items

    const res = await request(app).get('/api/items?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(10);
    expect(res.body.totalPages).toBe(3);
  });
});
```
- Outcome: You see how to test error paths and use seed helpers.

**Watch for this:**
- Emphasize the `app.js` / `server.js` separation. This is the usual blocker when integration tests will not start. If `app.listen()` is in `app.js`, Supertest will throw `EADDRINUSE` errors.
- Show what happens when you forget `async/await` in a test. Write a test that should fail, remove the `await`, run it, and show that it falsely passes.
- Notice that `afterEach` cleanup is critical. Without it, data from one test leaks into the next and causes mysterious failures.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-7-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function update(actor, row, title) {
  if (!actor) return {status: 401, row};
  if (actor !== row.owner) return {status: 403, row};
  if (!title.trim()) return {status: 400, row};
  return {status: 200, row: {...row, title}};
}
const row = {owner: 'ada', title: 'Original'};
check(update('bo', row, 'Changed').row === row, 'Denied request writes nothing');
check(update('ada', row, '').status === 400, 'Validation is a distinct failure');
check(update('ada', row, 'Changed').row.title === 'Changed', 'Owner succeeds');
console.log('ok: checkpoint-7-2');
```

## Where it breaks

![](diagram:session-7-2/fig2-diagnosis)

### Production database used

The test run deletes rows, and the rows were the real ones, because `MONGODB_URI` in the environment points at production and the test file trusted it. A test suite needs an explicit disposable database, named in the test setup, refused if the name does not look like a test database. Print the host and the database name at startup. Require a second variable, not a fallback to the app's normal URI. The mistake is quiet. The suite "works." It works on the data you cannot replace.

### Server never exits

Jest reports the tests and then sits there until you kill it. The app called `listen` at import time, or it opened a database handle and nothing closes it, so the event loop never empties. Build the app in a function that does not listen. In the test, listen on an ephemeral port or use a request library against the app object, and close the server and the database in `afterAll`. A suite that does not exit will hang the next job in line. Hanging is a failure even when every assertion passed.

### Mock hides bug

The route test mocks the model, the auth check, and the validator, and then asserts that the handler returned 200. All it proved is that the handler returns 200 when everything it calls is replaced. Keep one boundary real. If you are testing the route, let the validator run. If you are testing the model, hit a disposable database. Mock the edge you do not own, such as a paid third party, and be suspicious of a test where every collaborator is a mock. That test can stay green through a broken query.

## Your turn

**Guided Practice:**

**Exercise 1: Quest - CRUD Test Gauntlet**
- Prompt: Write integration tests for a full CRUD resource in your own Project 2 (or the practice project).
- Steps:
  1. If you have not already, separate your Express app into `app.js` and `server.js`.
  2. Create `tests/setup.js` with database connection, cleanup in `afterEach`, and teardown in `afterAll`.
  3. Create `tests/items.test.js` (or whatever your main resource is).
  4. Write tests for: GET returns 200 and an array, GET returns seeded data, POST creates and returns 201, POST returns 400 with invalid data, GET by ID returns single item, GET by ID returns 404 for bad ID, PUT updates an item, DELETE deletes and confirms it is gone.
- Success criteria: At least 8 test cases. All pass. Tests use a test database that gets cleaned between tests.
- Time: 25 minutes

**Exercise 2: Quest - Error Case Safari**
- Prompt: Write tests specifically for error handling and edge cases in your API.
- Steps:
  1. Add a new `describe('Error Handling')` block to your test file.
  2. Write tests for at least 5 different error scenarios: empty body POST, missing required fields, malformed ID (not a valid ObjectId), non-existent resource (valid ObjectId format but not in database), accessing a protected route without authentication.
  3. Verify that each returns the correct status code AND a meaningful error message.
  4. BONUS: Write a test that verifies your API handles an extremely long string input (e.g., a 10,000 character name).
- Success criteria: At least 5 error case tests, all passing. Each test checks both status code and response body.
- Time: 20 minutes

**Checkpoints:**
- Checkpoint: `app.js` and `server.js` are split, and `tests/setup.js` exists
- Checkpoint: at least 4 CRUD tests pass
- Checkpoint: at least 2 error-case tests pass

## The quest

**Independent Work:**

**Lab: Quest - Full CRUD Integration Test Suite**
- Objective: Write a complete integration test suite for your Project 2 API.
- Requirements checklist:
  - [ ] Express app separated into `app.js` (exportable) and `server.js` (starts server)
  - [ ] `tests/setup.js` with test database connection, cleanup, and teardown
  - [ ] Integration tests for main resource's CRUD endpoints (at least 10 tests)
  - [ ] Integration tests for at least 3 error scenarios (400, 401, 404)
  - [ ] If your app has authentication, tests for register and login flows
  - [ ] All tests pass with `npm test`
  - [ ] Push to Project 2 repo on a new branch called `add-tests`
- Hints: If you are getting `EADDRINUSE`, make sure `app.js` does not call `app.listen()`. If tests pass individually but fail together, check your `afterEach` cleanup. If tests timeout, add `"testTimeout": 10000` to your Jest config.
- Stretch Goals:
  - Write tests for pagination (if your API supports it)
  - Write tests for search/filter query parameters
  - Add a seed script that populates test data and run it in `beforeEach`
- Submission: GitHub repo link, branch `add-tests`.

### Review the artifact

Your deliverable is **API integration tests with isolated data and authorization failures**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-7-2/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Separate your Project 2 Express app into `app.js` (exportable, no `app.listen()`) and `server.js` (starts the server). Read the [Supertest README](https://github.com/ladjs/supertest). Make sure your Project 2 has at least basic CRUD routes.
**Materials:** Project 2 codebase, MongoDB Atlas account or local MongoDB, [Supertest docs](https://github.com/ladjs/supertest), [Jest Async Testing docs](https://jestjs.io/docs/asynchronous)

**Due before next session:**
- Complete the Full CRUD Integration Test Suite lab if you did not finish it here (estimated time: 3-4 hours)
- Ensure at least 10 integration tests covering CRUD + 3 error scenarios
- Push to your Project 2 repo on the `add-tests` branch
- Install Playwright in your Project 2: run `npm init playwright@latest` and select the defaults
- Read the [Playwright Getting Started guide](https://playwright.dev/docs/intro) through "Writing Tests"

---

### Manual verification and further reading

- [Official reference 1](https://github.com/ladjs/supertest)
- [Official reference 2](https://jestjs.io/docs/setup-teardown)
