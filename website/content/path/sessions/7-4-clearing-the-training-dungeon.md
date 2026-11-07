---
editorial: true
title: Clearing the Training Dungeon
subtitle: Build a Real Test Suite
hook: "A risk-based test suite and release-quality evidence report. Identify failures that would harm the user."
read: 60
artifact: "A risk-based test suite and release-quality evidence report"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://jestjs.io/docs/cli
  - https://playwright.dev/docs/test-reporters
say:
  - "Risk: Identify failures that would harm the user."
  - "Coverage: Assign unit, integration, and browser checks."
  - "Decision: Report remaining gaps before release."
---

## The hook

This is the boss room. Everything you have learned in this unit, you are using today. Session 7.1 gave you Jest, unit testing, and TDD. Session 7.2 gave you Supertest and integration testing. Session 7.3 gave you Playwright and CI. Today you put it all together and build a real test suite for your Project 2 app.

By the end of this session, your Project 2 repo will have a `tests/` folder with unit and integration tests, an `e2e/` folder with end-to-end tests, and a `.github/workflows/test.yml` file that runs everything automatically. You will push to GitHub and see that green checkmark. That checkmark means something. It means your app works. Not "I think it works." Not "It worked when I tested it manually last Tuesday." It means a robot verified it. On a clean machine. With a fresh database. Automatically.

This is the kind of infrastructure that separates hobby projects from professional software. The training dungeon is full of edge cases, and today you clear every single one of them.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Evaluate and implement a CI pipeline using GitHub Actions to automate test execution on every push

**Enabling Objectives:**
- Explain what continuous integration is and why it matters for professional software development
- Write a GitHub Actions workflow YAML file that triggers on push and pull request events
- Configure CI jobs with Node.js setup, dependency installation, and test execution steps
- Add service containers (MongoDB) and environment variables to CI workflows
- Debug CI failures by reading workflow logs and comparing local vs. CI environments

**You should be able to:**
- Create a `.github/workflows/test.yml` that runs unit, integration, and E2E tests
- Configure a MongoDB service container for integration tests in CI
- Achieve a green checkmark on GitHub Actions for their Project 2 repository
- Upload test artifacts (Playwright reports, coverage reports) from CI runs

---

- Concept 1: **Planning a test suite.** Before writing tests, decide what to test and what to skip. Test critical business logic (functions that calculate prices, validate data, format output). Test API routes that handle money, auth, or user data. Test the most common user flows (login, signup, primary CRUD). Skip testing third-party library internals (React rendering, Express routing), pure CSS styling, and every possible edge case in the universe. Aim for meaningful coverage, not 100%.

- Concept 2: **Test file organization.** Keep your test files organized by type and purpose:

```
project-root/
  src/
    utils/
      math.js
      validators.js
    models/
      User.js
      Item.js
    routes/
      users.js
      items.js
  tests/
    setup.js              # Database connection and cleanup
    utils/
      math.test.js        # Unit tests for math utilities
      validators.test.js  # Unit tests for validators
    models/
      User.test.js        # Unit tests for User model
    routes/
      users.test.js       # Integration tests for user routes
      items.test.js       # Integration tests for item routes
  e2e/
    auth.spec.js          # E2E tests for auth flow
    items.spec.js         # E2E tests for item CRUD flow
  .github/
    workflows/
      test.yml            # CI pipeline
  jest.config.js
  playwright.config.js
```

- Concept 3: **Testing Mongoose models.** You can unit test your Mongoose models to verify validation rules, default values, and instance methods. This catches schema configuration bugs early.

```javascript
// tests/models/Item.test.js
const mongoose = require('mongoose');
const Item = require('../../models/Item');

describe('Item Model', () => {
  it('should create an item with valid fields', async () => {
    const itemData = {
      name: 'Test Item',
      description: 'A test item for our test suite',
      price: 9.99,
      createdBy: new mongoose.Types.ObjectId(),
    };

    const item = new Item(itemData);
    const savedItem = await item.save();

    expect(savedItem._id).toBeDefined();
    expect(savedItem.name).toBe('Test Item');
    expect(savedItem.price).toBe(9.99);
    expect(savedItem.createdAt).toBeDefined();
  });

  it('should require a name', async () => {
    const item = new Item({
      description: 'No name provided',
    });

    let error;
    try {
      await item.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('should not allow a negative price', async () => {
    const item = new Item({
      name: 'Bad Price Item',
      price: -5,
    });

    let error;
    try {
      await item.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.price).toBeDefined();
  });

  it('should default status to "active"', async () => {
    const item = new Item({
      name: 'Default Status Item',
      createdBy: new mongoose.Types.ObjectId(),
    });

    const savedItem = await item.save();
    expect(savedItem.status).toBe('active');
  });

  it('should trim whitespace from name', async () => {
    const item = new Item({
      name: '  Spacey Item  ',
      createdBy: new mongoose.Types.ObjectId(),
    });

    const savedItem = await item.save();
    expect(savedItem.name).toBe('Spacey Item');
  });
});
```

- Concept 4: **Testing User model with password hashing.**

```javascript
// tests/models/User.test.js
const User = require('../../models/User');

describe('User Model', () => {
  it('should hash the password before saving', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'plaintext123',
    });

    const savedUser = await user.save();

    // Password should NOT be stored as plain text
    expect(savedUser.password).not.toBe('plaintext123');
    expect(savedUser.password.length).toBeGreaterThan(20); // bcrypt hashes are long
  });

  it('should validate correct password', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'correctpassword',
    });

    const isMatch = await user.comparePassword('correctpassword');
    expect(isMatch).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'correctpassword',
    });

    const isMatch = await user.comparePassword('wrongpassword');
    expect(isMatch).toBe(false);
  });

  it('should require a unique email', async () => {
    await User.create({
      username: 'user1',
      email: 'duplicate@example.com',
      password: 'password123',
    });

    let error;
    try {
      await User.create({
        username: 'user2',
        email: 'duplicate@example.com',
        password: 'password123',
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error
  });
});
```

**Key Points:**
- Test behavior, not implementation. Test what your code DOES, not how it does it. If you refactor internals, your tests should still pass.
- Error cases are as important as happy paths. The happy path works because you built it that way. The error cases are where bugs hide.
- Coverage is a guide, not a goal. 100% coverage does not mean your app is bug-free. 0% coverage means you are flying blind. Aim for 70-80% on utility functions and routes.

**Common Misconceptions:**
- Wrong: "If my tests pass locally, they will pass in CI." Correct: CI runs on a clean Linux machine with no `.env` file and potentially a different Node.js version. Always check environment variables and OS-specific behavior.
- Wrong: "I need 100% code coverage." Correct: Chasing 100% often leads to meaningless tests that verify trivial code. Focus on testing critical paths and edge cases that actually matter.

![](diagram:session-7-4/fig1-model)

### Start with failure impact

List the application's important promises. Users can save their work, cannot edit someone else's data, can recover from invalid input, and can complete the core journey after a deployment. Rank failures by their impact and likelihood in your actual application. A typo in secondary copy and a lost payment entitlement do not deserve the same release priority. The test plan should reflect those differences.

Assign each promise to the cheapest useful evidence. A pure calculation belongs in a unit test. Route validation and ownership belong in an integration test. A user journey involving forms and navigation belongs in a browser test. Some checks remain manual, such as reviewing a real provider dashboard or judging presentation clarity. This is a portfolio of evidence, not a competition to force every question into one test framework.

### Remove redundant confidence

Several tests can all exercise the same happy path while leaving an important branch untouched. Review the assertions, not only test names. If five tests confirm that a successful create returns an object, add a case proving invalid input writes nothing. If every authorization test uses the owner, add a second identity. The goal is distinct evidence about distinct risks.

Refactor test helpers when they clarify intent, but keep important inputs visible in the test. A helper named setupEverything can hide a surprising amount of state. Prefer helpers that return named fixtures and document their side effects. Keep cleanup close to resource ownership so database connections, servers, and browser contexts do not leak across the suite.

### Rehearse a release regression

Introduce one controlled defect on a temporary branch, such as removing a validation condition or changing an expected response field. Run the suite and identify which test catches it. Restore the implementation and confirm the suite passes. This exercise reveals whether your tests are connected to the promises you think they protect. Do not leave the mutation in the submission or weaken the assertion to accept it.

Next, run the suite from a clean checkout or equivalent clean dependency state using the documented setup. A test command that works only with your uncommitted files or local database history is not reproducible. Record any manual prerequisites and keep unavailable toolchains pending rather than installing them automatically or claiming their checks passed.

### Write a release-quality report

Summarize the revision, test commands, results, and known gaps. State whether external services were mocked, whether a real database was used, and whether a deployed environment was checked. A passing local suite cannot establish that production secrets, DNS, or provider configuration are correct. Those require separate evidence at their own boundaries.

End the workshop with a short maintenance plan. Identify who updates fixtures when the API changes, how flaky tests are investigated, and which critical regression would block release. A useful suite grows with observed failures. It is not finished forever; it is a reliable starting point for the next feature and the next person who changes the code.

## The demonstration

**Live Coding Walkthrough:**

**Demo 1: Writing Model Tests for a Real Project**
- Show how to identify testable model behaviors (required fields, defaults, custom methods, unique constraints)
- Write tests live for the Item and User models (code shown above in Explanation section)
- Run the tests, explain the output, and debug any failures
- Outcome: You see the pattern for testing Mongoose models

**Demo 2: Building the Integration Test Suite**
- Show the checklist approach to building integration tests:
```
[ ] app.js separated from server.js (app is exportable)
[ ] tests/setup.js created with test database connection
[ ] Tests for GET route (returns correct data)
[ ] Tests for POST route (creates resource, returns 201)
[ ] Tests for POST route with invalid data (returns 400)
[ ] Tests for GET by ID (returns single resource)
[ ] Tests for GET by ID with non-existent ID (returns 404)
[ ] Tests for PUT route (updates resource)
[ ] Tests for DELETE route (removes resource)
[ ] Tests for auth-protected route without token (returns 401)
[ ] All tests pass
```
- Walk through writing 2-3 tests from the checklist live, emphasizing the pattern
- Outcome: You have a clear checklist to follow during their build time

**Demo 3: Full CI Pipeline with Separate Jobs**
- Show a production-quality CI pipeline with separate jobs for unit/integration and E2E:
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, add-tests]
  pull_request:
    branches: [main]

jobs:
  unit-and-integration:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
        env:
          TEST_MONGODB_URI: mongodb://localhost:27017/myapp_test
          JWT_SECRET: ci-test-secret
          NODE_ENV: test

  e2e:
    runs-on: ubuntu-latest
    needs: unit-and-integration

    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test
        env:
          TEST_MONGODB_URI: mongodb://localhost:27017/myapp_test
          JWT_SECRET: ci-test-secret
          NODE_ENV: test

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```
- Show how to commit and push, then watch the Actions tab
- Explain common CI debugging issues: missing environment variables, database connection failures, Playwright browser not installed, tests passing locally but failing in CI due to Node version or OS differences
- Outcome: You have a production-quality CI config they can copy and customize

**Watch for this:**
- The failures worth expecting: a database connection, a bad import path, an async test that does not await, and a file laid out so the runner cannot see it. `--verbose` shows which test is which.
- When the integration tests are green, write the end-to-end test
- Remember that getting CI to green is the ultimate goal. Even a partially failing CI run is a learning moment

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-7-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const risks = [{name: 'ownership', critical: true, passed: true}, {name: 'save', critical: true, passed: false}, {name: 'spacing', critical: false, passed: false}];
const blockers = risks.filter(r => r.critical && !r.passed);
check(blockers.length === 1 && blockers[0].name === 'save', 'Release decision follows critical risks');
console.log('ok: checkpoint-7-4');
```

## Where it breaks

![](diagram:session-7-4/fig2-diagnosis)

### Coverage target replaces judgment

Coverage hits the number you set, and the payment path, the auth check, and the empty cart are still untested. The tool counted lines that ran, including lines a trivial test happened to touch. Coverage is a map of what ran. It is not a map of what matters. List the risks you actually care about, write a test for each, and then look at coverage to find a branch you lied to yourself about. Raising the target without that list produces tests that execute lines and assert nothing.

### Everything mocked

Every boundary is replaced, the report is green, and a real request against a real database fails on the first query. Mocks are for the edges you do not want to call in a unit test. They are not a substitute for one test that crosses the boundary you ship. Keep a small number of checks that hit a real router, a real validator, or a disposable database. If those are slow, run them separately. Do not delete them because the mocked suite already said green.

### Green report overclaims

The README says the app is fully tested, and the report never started a browser, never ran the payment provider's test mode, and never checked the deploy. Say what the suite covers and what it does not. A unit suite, an API suite, and a manual check of the deploy are three different sentences. Collapsing them into "tested" is how a reviewer, including you in a month, trusts a hole. List the external and manual checks next to the command that produces the green report.

## Your turn

**Guided Practice:**

**Exercise 1: Quest - Model Validation Tests**
- Prompt: Write unit tests for at least one Mongoose model in your Project 2 app.
- Steps:
  1. Pick your most important model (probably your main resource or User model)
  2. Create `tests/models/[ModelName].test.js`
  3. Write at least 5 tests: creating a valid document succeeds, missing a required field fails, invalid data (wrong type, out of range) fails, default values are applied correctly, any custom methods work as expected
  4. Run `npm test` and verify they pass
- Success criteria: At least 5 model tests passing.
- Time: 15 minutes

**Exercise 2: Quest - Integration and E2E Build Sprint**
- Prompt: Complete as much of the test suite as possible during class time.
- Steps:
  1. Follow the workshop checklist to write integration tests for your CRUD routes
  2. Write at least one E2E test for your most important user flow
  3. Set up `.github/workflows/test.yml` and push to GitHub
  4. Verify the CI pipeline runs (even if it fails, the setup is the learning moment)
- Success criteria: At least 5 integration tests passing locally. At least 1 E2E test passing locally. CI workflow file pushed to GitHub.
- Time: 30 minutes

**Checkpoints:**
- Checkpoint: at least 3 model tests pass
- Checkpoint: at least 5 integration tests pass
- Checkpoint: one end-to-end test exists, and the CI workflow file is in the repo

## The quest

**Independent Work:**

**Lab: Quest - Clearing the Training Dungeon**
- Finish any test you did not complete, get CI passing, and read the suite once more for a case you skipped.
- Requirements checklist:
  - [ ] At least 5 unit tests (utility functions or model validations)
  - [ ] At least 8 integration tests covering main API resource
  - [ ] At least 1 E2E test covering login and one CRUD operation
  - [ ] `.github/workflows/test.yml` runs on push and all tests pass (green checkmark)
  - [ ] Run `npm run test:coverage` and include coverage output in repo (add `coverage/` to `.gitignore` but screenshot terminal output)
  - [ ] Push all work to `add-tests` branch and open a Pull Request to `main`
  - [ ] In the PR description, list how many tests you wrote and what they cover
- Hints: If tests pass locally but fail in CI, check environment variables first. CI does not have your `.env` file. If Playwright tests timeout in CI, increase the timeout in `playwright.config.js` since CI machines are slower than your laptop. If you get `E11000 duplicate key error`, your `afterEach` cleanup is not running.
- Stretch Goals:
  - Achieve 80%+ code coverage on utility functions and routes
  - Add a coverage badge to your README
  - Write an E2E test for the full CRUD flow (create, read, update, delete)
  - Add a second GitHub Actions job that runs `npm audit` for security vulnerabilities
  - Complete the load testing side quest below and include your Artillery report in the PR
- Submission: GitHub PR link (from `add-tests` to `main`) with passing CI checks.

---

**Side Quest (Optional): Load Testing with Artillery**

Your test suite proves your app works for ONE user. But what happens when a hundred adventurers storm the gates at once? That is a different question, answered by a different kind of test: the **load test**. Correctness testing asks "does it work?" Load testing asks "does it survive success?" For a founder, this is the test that matters the day your product gets traction.

[Artillery](https://www.artillery.io/) is a load-testing tool that simulates waves of virtual users hitting your API:

```bash
npm install --save-dev artillery
```

Create `load-test.yml` in your project root:

```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 30        # Warm-up: 30 seconds
      arrivalRate: 5      # 5 new virtual users per second
      name: "Warm up"
    - duration: 60        # Sustained load: 1 minute
      arrivalRate: 20     # 20 new virtual users per second
      name: "Peak traffic"

scenarios:
  - name: "Browse and create items"
    flow:
      - get:
          url: "/api/items"
      - post:
          url: "/api/items"
          json:
            name: "Load Test Item"
            description: "Created by a virtual adventurer"
            price: 1.99
```

Run it against your locally running API (use your test database, not production data):

```bash
npx artillery run load-test.yml
```

How to read the report:
- **http.response_time p95** — 95% of requests finished faster than this. This is the number to watch, not the average. Averages hide pain; percentiles reveal it. A p95 under 200ms is healthy for a simple CRUD API on a laptop.
- **http.codes.200 / 201** — should be nearly all of your responses. A pile of 500s under load means something is breaking (often the database connection pool).
- **vusers.failed** — virtual users whose scenario errored out. Should be zero or close.

If the numbers look bad, the usual suspects in a MERN app: missing database indexes (every query scans the whole collection), doing heavy work inside request handlers, or `console.log` flooding in hot paths. Add an index, re-run, and watch p95 drop — that experience will teach you more about performance than any lecture.

### Review the artifact

Your deliverable is **A risk-based test suite and release-quality evidence report**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

### Unit project: completion contract

### Capstone: Edge Case Extermination - Comprehensive Test Suite for Project 2

### Quest Arc

You have been training in the testing dungeon for four sessions. You have learned to spar with Jest, fight through dungeon trials with Supertest, survived the Playwright gauntlet, and automated your defenses with a CI pipeline. Now, the dungeon boss appears: your own Project 2 application, fully deployed and supposedly working but harboring an unknown number of edge cases, unhandled errors, and untested code paths.

Your quest is to clear the dungeon completely. Write a comprehensive test suite that covers your application at every level. Unit tests for your utility functions and model logic. Integration tests for your API routes, covering every CRUD operation and every error scenario you can think of. End-to-end tests that simulate real users navigating your app in a real browser. And a CI pipeline that runs everything automatically on every push, standing guard so that no future code change can break what you have built.

When the green checkmark appears on your GitHub repository, the training dungeon is cleared. You have proven that your app works. Not because you clicked around and it seemed fine. Because a robot verified it. On a clean machine. With a fresh database. Automatically. Every single time.

The edge cases never stood a chance.

### Technical Requirements

**Must Have (core functionality):**
- [ ] At least 5 unit tests covering utility functions and/or model validations
- [ ] At least 8 integration tests covering main API resource CRUD operations (GET, POST, PUT, DELETE) plus at least 3 error cases (400, 401, 404)
- [ ] At least 1 E2E test covering a critical user flow (login + one CRUD action)
- [ ] A `tests/setup.js` file that connects to a test database and cleans up between tests
- [ ] A `.github/workflows/test.yml` file that runs all tests on push
- [ ] All tests pass locally and in CI

**Should Have (production quality):**
- [ ] Test file organization: `tests/utils/`, `tests/models/`, `tests/routes/`, `e2e/`
- [ ] At least 2 E2E tests (one for auth flow, one for CRUD flow)
- [ ] Code coverage report generated by `jest --coverage`
- [ ] CI pipeline that includes both Jest and Playwright tests
- [ ] Express app properly separated into `app.js` and `server.js`

**Could Have (stretch goals):**
- [ ] 80%+ code coverage on utility functions and route handlers
- [ ] CI status badge in README
- [ ] Playwright HTML report uploaded as a CI artifact
- [ ] Tests for pagination, search, or filter functionality
- [ ] A second CI job that runs `npm audit`
- [ ] TDD evidence: tests written before implementation for at least one function

### Skill Points Rubric

**Boss Clear Criteria (Must Have) - 70 points**

| Skill | Points | Requirement |
|-------|--------|-------------|
| Unit Tests | 15 | 5+ unit tests covering utility functions and/or model validations. Tests use appropriate matchers and cover both happy paths and edge cases. |
| Integration Tests | 20 | 8+ integration tests for CRUD endpoints. Test database with proper setup and cleanup. At least 3 error case tests (400, 401, 404). |
| E2E Tests | 15 | At least 1 E2E test covering a real user flow with form interaction, navigation, and content assertions. |
| CI Pipeline | 10 | `.github/workflows/test.yml` exists, triggers on push, and runs tests. Workflow runs successfully in GitHub Actions. |
| Code Quality | 10 | Tests are organized in folders by type. Setup/teardown is clean. No hardcoded IDs that break between runs. Tests do not depend on each other. |

**Epic Loot (Nice to Have) - 20 points**

| Skill | Points | Requirement |
|-------|--------|-------------|
| Comprehensive E2E | 5 | 2+ E2E tests covering both auth and CRUD flows. Good use of selectors (role, text, label). Assertions on both page content and URL. |
| Coverage Report | 5 | Code coverage report generated and committed. Coverage above 70% on tested files. |
| Full CI Pipeline | 5 | CI runs all test types (unit, integration, E2E). Includes MongoDB service container. Passes with a green checkmark. Artifacts uploaded. |
| Test Architecture | 5 | Helper functions for seeding. Excellent file organization. README documents how to run tests. |

**Legendary Status (Wow Factor) - 10 points**

| Skill | Points | Requirement |
|-------|--------|-------------|
| 80%+ Coverage | 3 | Code coverage above 80% on utility functions and route handlers. Coverage badge in README. |
| TDD Evidence | 4 | At least one function demonstrably built with TDD (test file committed before or alongside implementation). |
| Advanced CI | 3 | Multiple CI jobs (unit/integration separate from E2E). Security audit job. Matrix testing with multiple Node versions. |

**Total: __ / 100 Skill Points**

### Submission Requirements

- **Live URL:** Not applicable for this project (tests run locally and in CI, not deployed)
- **Repo:** Push to your Project 2 repo on the `add-tests` branch. Open a Pull Request to `main`.
- **PR Description must include:**
  - Total number of tests by type (X unit, Y integration, Z E2E)
  - A screenshot of your local test output (all passing)
  - A screenshot of your GitHub Actions run (passing or with notes on what failed and why)
  - A screenshot of your code coverage output
- **Demo Video (Optional but recommended):** A 2-3 minute Loom recording showing you running the tests locally and walking through one test file explaining what it does and why.
- **Reflection:** In the PR description, answer: "What was the most surprising bug you found while writing tests?" and "How will testing change the way you write code going forward?"

---

![](diagram:session-7-4/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Bring your list of testable utility functions, API routes, and user flows from Session 7.3 homework. Ensure Jest, Supertest, and Playwright are all installed in your Project 2 repo. Have your GitHub repo ready. Review any tests that are currently failing and note the error messages.
**Materials:** Project 2 codebase with all testing tools installed, GitHub account, [Jest Coverage docs](https://jestjs.io/docs/configuration#collectcoverage-boolean), [Playwright Best Practices](https://playwright.dev/docs/best-practices)

**Due before next unit:**
- Complete and polish the test suite (estimated time: 3-4 hours)
- Ensure at least 5 unit tests, 8 integration tests, and 1 E2E test all pass
- Get GitHub Actions CI to green (or document why it is failing and what you tried)
- Run `npm run test:coverage` and screenshot the output
- Open a PR from `add-tests` to `main` with a description listing: total tests by type, screenshot of local test output, screenshot of GitHub Actions run, screenshot of coverage output
- Optional: Record a 2-3 minute Loom demo showing you running tests locally and walking through one test file explaining what it does and why

---

### Manual verification and further reading

- [Official reference 1](https://jestjs.io/docs/cli)
- [Official reference 2](https://playwright.dev/docs/test-reporters)
