---
editorial: true
title: Sparring Grounds
subtitle: Jest, Unit Testing, and the TDD Mindset
hook: "A focused unit-test suite with boundary cases and a demonstrated failing test. Choose inputs that expose a behavior."
read: 60
artifact: "A focused unit-test suite with boundary cases and a demonstrated failing test"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://jestjs.io/docs/getting-started
  - https://jestjs.io/docs/expect
say:
  - "Arrange: Choose inputs that expose a behavior."
  - "Act: Call the smallest relevant unit."
  - "Assert: Check the observable contract, then prove failure."
---

## The hook

Alright, listen up. You know that trope in every anime training arc where the hero walks into a sparring ground thinking they are already strong enough, and then the training dummy starts throwing edge cases at them? That is today. You built your MERN app. You deployed it. It works. At least, you think it works. But have you actually proven it? Have you thrown bad data at it? Have you tried to break it on purpose?

Testing is the difference between "I think it works" and "I know it works." Every serious tech company tests their code. Every serious open source project has tests. When you join a team or hire developers for your startup, tests are how you prevent new code from breaking old code. Tests are how you refactor with confidence instead of fear. Tests are how you know your app still works at 3 AM when you are asleep and your servers are handling requests.

Today we learn Jest, the most popular JavaScript testing framework. We learn matchers, the TDD workflow, and mocking. By the end of this session, you will have written your first real test suite. The sparring grounds are open. Let's train.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Create automated unit tests using Jest to verify individual functions, model validations, and isolated logic

**Enabling Objectives:**
- Install and configure Jest in a Node.js project with appropriate scripts and configuration
- Structure test files using `describe`, `it`/`test`, and `expect` blocks
- Select and apply appropriate Jest matchers for different data types and assertion scenarios
- Implement the Red-Green-Refactor TDD workflow to build functions from test specifications
- Use `jest.fn()` and `jest.mock()` to isolate units of code from external dependencies
- Apply setup and teardown hooks (`beforeAll`, `afterAll`, `beforeEach`, `afterEach`) to manage test state

**You should be able to:**
- Write at least 10 unit tests covering utility functions and Mongoose model validations
- Build a new function from scratch using the Red-Green-Refactor workflow
- Use mocks to isolate code that depends on external services (APIs, databases, email)
- Achieve 80%+ code coverage on utility modules using `jest --coverage`

- Concept 1: **The Testing Pyramid.** Software tests come in three tiers. Unit tests form the base: they are fast, cheap, and focused on a single function or method. You will have hundreds of these. Integration tests sit in the middle: they test how multiple components work together (your route, controller, and database). You will have dozens. End-to-end tests sit at the top: they simulate a real user in a real browser. They are slow, expensive, and you will have just a handful. The pyramid shape tells you where to invest your testing effort.

```
        /\
       /  \
      / E2E \        <-- Few (slow, expensive, high confidence)
     /--------\
    /Integration\    <-- Some (medium speed, medium confidence)
   /--------------\
  /   Unit Tests    \ <-- Many (fast, cheap, focused)
 /___________________\
```

- Concept 2: **Why test at all?** Four reasons. Confidence: change code without fear, refactor that ugly function, and tests will tell you if you broke something. Collaboration: when someone else touches your code, tests prove their changes did not destroy yours. Documentation: tests describe what your code is supposed to do; they are living documentation. Speed: manual testing is slow and error-prone; automated testing runs hundreds of checks in seconds.

- Concept 3: **What is Jest?** Jest is a JavaScript testing framework created by Meta (Facebook). It comes with everything bundled: a test runner, an assertion library, mocking utilities, and code coverage reporting. It is the most popular JS testing framework and the default for React projects. Zero configuration is needed to get started. Jest discovers test files automatically by looking for files that end in `.test.js` or `.spec.js`.

- Concept 4: **Jest structure - describe, it, expect.** A test file is organized with `describe` blocks (groups of related tests, like chapter titles), `it` or `test` blocks (individual test cases, each testing one specific behavior), and `expect` statements (assertions that verify a value meets your expectation). The pattern reads like English: "Describe the add function. It should add two positive numbers. I expect add(2,3) to be 5."

- Concept 5: **Core matchers.** Jest provides matchers for every situation:
  - `toBe(value)` for strict equality (`===`), good for primitives
  - `toEqual(value)` for deep equality, required for objects and arrays
  - `toBeTruthy()` / `toBeFalsy()` for truthiness checks
  - `toBeNull()` / `toBeUndefined()` / `toBeDefined()` for nullish checks
  - `toBeGreaterThan()` / `toBeLessThan()` / `toBeCloseTo()` for numbers
  - `toMatch(/regex/)` / `toContain(item)` for strings and arrays
  - `toHaveLength(n)` / `toHaveProperty('key')` for structure checks
  - `toThrow()` for exception testing
  - `not` prefix for negation (e.g., `expect(5).not.toBe(3)`)

**Key Points:**
- `toBe` uses `===` (reference equality). Use it for numbers, strings, and booleans. `toEqual` performs deep equality. Use it for objects and arrays. This is the number one source of confusion for beginners.
- A unit test should test ONE thing in isolation. If your test needs a database connection, it is probably an integration test, not a unit test.
- Jest looks for files matching `*.test.js` or `*.spec.js` by default. Place your test file next to the source file it tests.

**Common Misconceptions:**
- Wrong: "I only need to test happy paths." Correct: Edge cases and error paths are where most bugs hide. Always test what happens with empty input, null, undefined, and unexpected types.
- Wrong: "`toBe` and `toEqual` are interchangeable." Correct: `expect({ hp: 100 }).toBe({ hp: 100 })` FAILS because they are different object references. Use `toEqual` for objects and arrays.
- Wrong: "`expect(myFunction()).toThrow()`" will catch the error. Correct: You must wrap the call in a function: `expect(() => myFunction()).toThrow()`. Otherwise the error is thrown before `expect` can catch it.

![](diagram:session-7-1/fig1-model)

### A test is a claim with an executable witness

Suppose a discount function should never produce a negative total. A test that repeats the same arithmetic as the implementation may reproduce the same mistake. Instead choose an input and an expected result derived from the business rule. Test zero, a normal value, and a boundary near the limit. Explain why each case exists. The test's value comes from the independent claim it makes, not from increasing the number of green dots.

Keep the unit small enough that a failure points somewhere useful. A pure calculation is a good first target because it has explicit inputs and outputs. A function that reads the clock, contacts a service, and writes a database contains several boundaries. You can still test it, but first identify which dependencies should be injected or replaced by controlled fixtures. Do not mock the function you are trying to verify.

### Red proves the test is connected

Write a failing case before implementing a new behavior when that helps clarify the contract. Alternatively, for an existing function, temporarily introduce a deliberate defect and confirm that the test detects it. Restore the correct code immediately. A test that passes both implementations may be asserting too little, calling the wrong function, or never reaching its assertion.

Read the failure output. A useful test names the behavior and compares meaningful values. A generic assertion that an object is truthy can pass while every important field is wrong. Prefer an expected shape or a specific property when that expresses the contract. Do not over-specify incidental details such as object key order or internal helper calls unless those details are actually required.

### Determinism makes failures explainable

Use fixed dates, seeded inputs, and isolated fixtures. A test that depends on the current time can fail at midnight or across time zones. A test that shares a mutable array can fail only when run after another test. Reset state deliberately or construct fresh data per case. If randomness is the behavior under test, control the random source or test an invariant across reproducible samples.

Asynchronous tests must await the work they claim to verify. Starting a promise and returning from the test can produce a false pass before the assertion runs. Test rejected promises explicitly and make sure the error path is reached. Timers can be controlled with the test framework's clock tools, but restoring real timers is part of cleanup. The suite should finish without dangling handles.

### Coverage guides questions rather than declaring quality

A covered line has executed; it has not necessarily been checked correctly. Branch coverage can reveal an untested error path, but a numerical target cannot replace a review of important behavior. Use coverage to ask what remains unobserved. Add tests where a failure would matter, especially around validation, money, permissions, and transformations that feed external systems.

The submission should contain the contract, the tests, one captured expected failure, and the final passing result. Include the command another developer can run after manually setting up the required runtime. A small suite with clear behavioral claims is more useful than a large suite that merely reproduces the current implementation.

## The demonstration

**Live Coding Walkthrough:**

**Demo 1: Jest Setup and Your First Test File**
- Setup: Create a fresh practice project.
```bash
mkdir testing-dojo && cd testing-dojo
npm init -y
npm install --save-dev jest
```
- Update `package.json` scripts:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll",
    "test:coverage": "jest --coverage"
  }
}
```
- Create a simple utility file:
```javascript
// utils/math.js

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

module.exports = { add, subtract, multiply, divide };
```
- Write the test file:
```javascript
// utils/math.test.js

const { add, subtract, multiply, divide } = require('./math');

describe('Math Utilities', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should add negative numbers', () => {
      expect(add(-1, -1)).toBe(-2);
    });

    it('should add zero', () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('should subtract two numbers', () => {
      expect(subtract(10, 4)).toBe(6);
    });
  });

  describe('multiply', () => {
    it('should multiply two numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('should return zero when multiplied by zero', () => {
      expect(multiply(99, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    it('should divide two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('should throw when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });
});
```
- Run `npm test`, walk through the output, celebrate the green checkmarks.
- Outcome: You see a complete test file with `describe`, `it`, and `expect` in action. They understand the test output format.

**Demo 2: Matchers Deep Dive**
- Show the full range of matchers with live examples:
```javascript
// Exact equality
expect(2 + 2).toBe(4);                    // === comparison
expect({ name: 'Goku' }).toEqual({ name: 'Goku' }); // deep equality for objects

// Truthiness
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect('hello').toBeDefined();
expect(1).toBeTruthy();
expect(0).toBeFalsy();

// Numbers
expect(10).toBeGreaterThan(5);
expect(10).toBeGreaterThanOrEqual(10);
expect(5).toBeLessThan(10);
expect(0.1 + 0.2).toBeCloseTo(0.3);       // floating point!

// Strings
expect('team rocket').toMatch(/rocket/);
expect('hello world').toContain('world');

// Arrays
expect(['Naruto', 'Sasuke', 'Sakura']).toContain('Sasuke');
expect([1, 2, 3]).toHaveLength(3);

// Objects
expect({ name: 'Luffy', crew: 'Straw Hats' }).toHaveProperty('crew');
expect({ a: 1, b: 2 }).toMatchObject({ a: 1 }); // partial match

// Exceptions
expect(() => { throw new Error('boom'); }).toThrow();
expect(() => { throw new Error('boom'); }).toThrow('boom');

// Negation (works with any matcher)
expect(5).not.toBe(3);
expect([1, 2, 3]).not.toContain(4);
```
- Demonstrate the `toBe` vs `toEqual` trap live:
```javascript
// This FAILS:
expect({ hp: 100 }).toBe({ hp: 100 });  // Different object references!

// This PASSES:
expect({ hp: 100 }).toEqual({ hp: 100 }); // Same structure and values!
```
- Outcome: You have a reference for which matcher to use in every scenario.

**Demo 3: TDD Workflow - Red, Green, Refactor**
- Explain the three-step loop: RED (write a test for a feature that does not exist, watch it fail), GREEN (write the minimum code to make it pass), REFACTOR (clean up the code while tests protect you).
- Build a `formatCurrency` function using TDD.
- Step 1 (RED): Write the test first.
```javascript
// utils/currency.test.js

const { formatCurrency } = require('./currency');

describe('formatCurrency', () => {
  it('should format a whole number as USD', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });
});
```
- Run `npm test`. It fails. Good. RED.
- Step 2 (GREEN): Write the minimum code.
```javascript
// utils/currency.js

function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

module.exports = { formatCurrency };
```
- Run `npm test`. It passes. GREEN.
- Step 3 (RED again): Add more tests.
```javascript
  it('should format a decimal number', () => {
    expect(formatCurrency(9.99)).toBe('$9.99');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-5.5)).toBe('-$5.50');
  });

  it('should add commas for thousands', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
  });
```
- Some fail. GREEN them up with a better implementation:
```javascript
// utils/currency.js

function formatCurrency(amount) {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-$${formatted}` : `$${formatted}`;
}

module.exports = { formatCurrency };
```
- REFACTOR: Code is clean. Move on.
- Outcome: You experience the full Red-Green-Refactor cycle and understand why writing tests first leads to better-designed code.

**Demo 4: Setup/Teardown Hooks and Mocking**
- Show setup and teardown hooks:
```javascript
describe('User tests', () => {
  let testUser;

  beforeAll(() => {
    // Runs ONCE before all tests in this describe block
    console.log('Setting up test database connection');
  });

  afterAll(() => {
    // Runs ONCE after all tests in this describe block
    console.log('Closing test database connection');
  });

  beforeEach(() => {
    // Runs before EACH test
    testUser = { name: 'Goku', powerLevel: 9001 };
  });

  afterEach(() => {
    // Runs after EACH test
    testUser = null;
  });

  it('should have a name', () => {
    expect(testUser.name).toBe('Goku');
  });

  it('should have a power level over 9000', () => {
    expect(testUser.powerLevel).toBeGreaterThan(9000);
    testUser.powerLevel = 1; // This change won't affect the next test!
  });

  it('should still have original power level', () => {
    // beforeEach resets testUser before this runs
    expect(testUser.powerLevel).toBe(9001);
  });
});
```
- Show mocking basics:
```javascript
// Simple mock function
const mockCallback = jest.fn();
mockCallback('hello');
mockCallback('world');

expect(mockCallback).toHaveBeenCalledTimes(2);
expect(mockCallback).toHaveBeenCalledWith('hello');
expect(mockCallback).toHaveBeenLastCalledWith('world');
```
```javascript
// Mock return values
const mockGetUser = jest.fn();
mockGetUser.mockReturnValue({ name: 'Vegeta', powerLevel: 8000 });

const user = mockGetUser();
expect(user.name).toBe('Vegeta');
```
```javascript
// Mocking a module
jest.mock('./emailService');
const { sendEmail } = require('./emailService');

// Now sendEmail is automatically a mock function
sendEmail.mockResolvedValue({ success: true });

// Your function that USES sendEmail can be tested
// without actually sending emails
```
- Explain when to mock (external APIs, databases for unit tests, email services, file system, anything slow or unpredictable) and when NOT to mock (the thing you are testing, simple utility functions with no side effects).
- Outcome: You understand how to manage test state and isolate dependencies.

**Watch for this:**
- Show what happens when you run `expect(myFunction()).toThrow()` without wrapping in a function. The error is thrown immediately and the test crashes instead of being caught by `expect`.
- Demonstrate the difference between `toBe` and `toEqual` with objects live. Let the test fail first, then fix it.
- Remember that `beforeEach` creates fresh data for every test. Tests should never depend on each other.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-7-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function totalAfterDiscount(cents, discount) {
  if (!Number.isInteger(cents) || cents < 0 || discount < 0 || discount > 1) throw new Error('invalid');
  return Math.round(cents * (1 - discount));
}
check(totalAfterDiscount(1000, 0.2) === 800, 'Normal discount');
check(totalAfterDiscount(0, 1) === 0, 'Zero boundary');
let rejected = false;
try { totalAfterDiscount(-1, 0); } catch { rejected = true; }
check(rejected, 'Invalid amount rejected');
console.log('ok: checkpoint-7-1');
```

## Where it breaks

![](diagram:session-7-1/fig2-diagnosis)

### Test mirrors implementation

The test fails the moment you rename a helper, and it stays green when the function returns the wrong total. It was written by reading the implementation and asserting each internal call, so it tests the shape of the code rather than the result. Assert the contract: given this input, this output, this error. You should be able to rewrite the function and keep the test. If a test has to change whenever an internal detail changes, it is a second copy of the code, and it will not catch a regression in the behavior.

### False green

The suite passes, including a test for a function you just broke on purpose. The assertion is too weak, the test never called the function, or it caught the error and continued. Break the behavior in a way a user would notice, run the one test, and watch it fail. Then put the behavior back and watch it pass. A test that cannot fail does not protect you. Do this once for every new test before you trust the file. The red run is the proof the test is connected to the behavior.

### Brittle setup

Tests pass alone and fail in the file, or fail only when the suite runs in a different order. They share a mutable object, a clock, or a row in a database, and one test's leftover becomes the next test's input. Build the fixture inside the test, or in a `beforeEach` that returns a fresh value. Do not let tests delete from a shared list they all imported. Order dependence is a bug in the tests even when the production code is fine, and it will show up on the day you add an unrelated case.

## Your turn

**Guided Practice:**

**Exercise 1: Quest - The Matcher Gauntlet**
- Prompt: Create a string utility module and write comprehensive tests using at least 5 different matchers for every function.
- Starter code:
```javascript
// utils/strings.js

function capitalize(str) {
  if (typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function reverseString(str) {
  return str.split('').reverse().join('');
}

function isPalindrome(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleaned === cleaned.split('').reverse().join('');
}

function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

function countWords(str) {
  return str.trim().split(/\s+/).filter(word => word.length > 0).length;
}

module.exports = { capitalize, reverseString, isPalindrome, truncate, countWords };
```
- Create `utils/strings.test.js` and write tests for ALL five functions.
- Requirements: at least 2 test cases per function (happy path + edge case), use at least 5 different matchers, test edge cases (empty strings, single characters, strings with spaces).
- Success criteria: All tests pass. At least 10 test cases total. At least 5 different matchers used.
- Time: 20 minutes

**Exercise 2: Quest - TDD Challenge: Build a Validator**
- Prompt: Use the Red-Green-Refactor workflow to build an `isValidEmail` function from scratch. Write all tests FIRST, then implement.
- Starter code (tests only, no implementation):
```javascript
// utils/validators.test.js

const { isValidEmail } = require('./validators');

describe('isValidEmail', () => {
  it('should return true for a valid email', () => {
    expect(isValidEmail('goku@capsulecorp.com')).toBe(true);
  });

  it('should return false for an email without @', () => {
    expect(isValidEmail('gokucapsulecorp.com')).toBe(false);
  });

  it('should return false for an email without a domain', () => {
    expect(isValidEmail('goku@')).toBe(false);
  });

  it('should return false for an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('should return false for null or undefined', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });

  // Add at least 3 more test cases!
});
```
- Steps: Run `npm test` and watch everything fail (RED). Create `utils/validators.js` and implement `isValidEmail` one test at a time (GREEN). After all tests pass, refactor if needed. BONUS: Add `isValidPassword` using TDD (minimum 8 chars, at least one uppercase, at least one number).
- Success criteria: All tests pass. Function was written AFTER the tests. At least 8 test cases total.
- Time: 25 minutes

**Checkpoints:**
- Checkpoint: at least 5 string utility tests are passing
- Checkpoint: the validator test file exists, and the new tests fail for the right reason
- Checkpoint: `isValidEmail` passes, and you saw it fail first

## The quest

**Independent Work:**

**Lab: Quest - The Testing Dojo**
- Objective: Build a utility module from scratch using pure TDD and achieve real code coverage.
- Requirements checklist:
  - [ ] Create `utils/arrayHelpers.js` with 5 functions: `unique(arr)` (removes duplicates), `flatten(arr)` (flattens one level of nesting), `chunk(arr, size)` (splits array into chunks of given size), `shuffle(arr)` (randomly shuffles, returns new array), `intersection(arr1, arr2)` (returns elements in both arrays)
  - [ ] Use TDD for every function. Write tests FIRST in `utils/arrayHelpers.test.js`, then implement
  - [ ] Each function needs at least 3 test cases (happy path, edge case, empty array)
  - [ ] Run `npm run test:coverage` and screenshot the output
  - [ ] Aim for 90%+ coverage on utility files
  - [ ] Push to a GitHub repo called `testing-dojo`
- Hints: Start with `unique` because it is the simplest. For `shuffle`, you cannot test the exact output (it is random), but you can test that the output has the same length and the same elements. For `chunk`, test what happens when the array length is not evenly divisible by the chunk size.
- Stretch Goals:
  - Add `isValidPassword(password)` validator using TDD with rules: minimum 8 chars, at least one uppercase, at least one lowercase, at least one number, at least one special character
  - Add a `jest.config.js` file that sets the coverage threshold to 80% so the test command fails if coverage drops below that
- Submission: GitHub repo link with tests and coverage screenshot in the README.

### Review the artifact

Your deliverable is **A focused unit-test suite with boundary cases and a demonstrated failing test**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-7-1/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Review your Project 2 utility functions and model files. Identify at least 3 pure functions and 2 Mongoose model validations that could be tested. Read the [Jest Getting Started guide](https://jestjs.io/docs/getting-started) through "Using Matchers."
**Materials:** Node.js and npm installed, a code editor, terminal access, [Jest Docs](https://jestjs.io/docs/getting-started), [Jest Expect API reference](https://jestjs.io/docs/expect)

**Due before next session:**
- Complete the Testing Dojo lab if you did not finish it here (estimated time: 2-3 hours)
- Push all work to a GitHub repo called `testing-dojo`
- Run `npm run test:coverage` and include a screenshot of the coverage output in your README
- Review the [Supertest GitHub README](https://github.com/ladjs/supertest) to prepare for next session
- Look at your Project 2 Express app and identify which routes you want to test (list them out)

---

### Manual verification and further reading

- [Official reference 1](https://jestjs.io/docs/getting-started)
- [Official reference 2](https://jestjs.io/docs/expect)
