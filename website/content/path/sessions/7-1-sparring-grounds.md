---
editorial: true
title: Sparring Grounds
subtitle: Jest, unit tests, and the red-green-refactor loop
hook: "The guild hall is live and you have clicked through every screen. Nothing proves it except your memory. Today you write the first test that can fail, watch it fail on purpose, and learn why that red run is the whole point."
read: 55
artifact: "A testing-dojo repo with Jest installed, a math module, a currency formatter built test-first, a matcher sheet, and one captured failing run"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://jestjs.io/docs/getting-started
  - https://jestjs.io/docs/using-matchers
  - https://jestjs.io/docs/expect
  - https://jestjs.io/docs/setup-teardown
  - https://jestjs.io/docs/mock-functions
  - https://jestjs.io/docs/configuration
say:
  - "A test is a claim about behavior with a witness that runs."
  - "toBe is ===; toEqual compares shape. Wrap a throw in a function or expect never sees it."
  - "A test that has never been red has never been proven connected to the code."
---

## The hook

The guild hall from Unit 4 is on a server now. You registered Bran, Sera, and Ivo, sent a letter, read it as the wrong person and got a 403, spent a potion past zero and got a 409. You wrote those statuses into `HALL.md` by hand. Then Unit 5 handed a model your routes and Unit 6 put the process behind Nginx. Every one of those steps could have broken the recipient check, and the only way you would know is to curl all twelve routes again, in order, and compare the numbers with the note. You did not do that after the deploy. Nobody does. That is the gap tests fill: a claim about behavior, written once, checked by a machine every time you ask.

Today is a sparring ground, not the hall. You make a small folder, `~/projects/testing-dojo`, install Jest, and write tests for functions that have no database and no network, so the only thing under examination is the habit. You learn the three words every test is made of, the matcher that compares values and the one that compares shapes, the one trap that makes a throwing function look like it passed, and the loop called red, green, refactor. By the end you have a currency formatter you built by writing the test first, and a terminal screenshot of the run where the test was red. That red run is the artifact. A test that has only ever been green has never been proven connected to anything.

> *A training dummy does not fight back. It just tells you, every time, exactly where you missed.*

## The idea

A test is a claim with an executable witness. The claim is a sentence: `formatCurrency(-5.5)` returns `-$5.50`. The witness is a function that calls the code with that input and compares the result with the sentence. If they agree, the test passes. If they disagree, the runner prints both values side by side and the file and line where the disagreement happened. That is all a test framework is: a way to write claims so a program can check them, and a reporter that says which claims were false.

The pyramid people draw has three layers. Unit tests at the base: one function, no database, no network, hundreds of them, each finishing in a millisecond. Integration tests in the middle: a real request through your real router into a disposable database, dozens of them. Browser tests at the top: a real browser clicking your real page, a handful of them, because each one costs seconds. This session is the base. The next two sessions are the other layers, against the hall. The shape of the pyramid is advice about where to spend effort, not a quota.

Jest is the runner this path uses for Node code. It bundles the runner, the assertion library, mocks, and coverage in one install, and it finds files named `*.test.js` or `*.spec.js` without configuration. It is the common choice for Express projects. Your Vite React client from 4-9 would normally use Vitest instead, which speaks the same `describe`, `it`, and `expect`, so what you learn today transfers; this unit tests the API, not the React tree.

![](diagram:session-7-1/fig1-model)

### describe, it, expect

A test file is organized with three functions Jest puts in scope for you. `describe(name, fn)` groups related claims under a heading. `it(name, fn)` is one claim; `test` is an alias and you pick one and stay with it. `expect(value)` returns an object with matchers on it, and a matcher is the comparison: `expect(add(2, 3)).toBe(5)`. Read it as a sentence. Describe the add function. It adds two positive numbers. I expect `add(2, 3)` to be 5.

The matcher you reach for first is `toBe`, and it is `===`. Use it for numbers, strings, and booleans. The matcher you reach for second is `toEqual`, and it walks the value recursively and compares the shape. Use it for objects and arrays. `expect({ hp: 100 }).toBe({ hp: 100 })` fails, every time, because the two literals are two different objects and `===` on objects compares identity. `expect({ hp: 100 }).toEqual({ hp: 100 })` passes. This is the first confusion every new test writer has, so make the mistake once on purpose in the demonstration and read the message Jest prints. It tells you to use `toEqual` when you meant structural equality.

The second trap is `toThrow`. `expect(divide(10, 0)).toThrow()` does not work, because JavaScript evaluates `divide(10, 0)` before `expect` is even called, the throw happens outside any matcher, and the test crashes instead of passing. Wrap the call in a function: `expect(() => divide(10, 0)).toThrow('Cannot divide by zero')`. Now `expect` receives a function, calls it itself, and catches what comes out.

### The matcher sheet

Keep this near you for the whole unit. Every line is a real assertion that passes.

```js
// Equality
expect(2 + 2).toBe(4);
expect({ name: 'Bran' }).toEqual({ name: 'Bran' });

// Nullish and truthiness
expect(null).toBeNull();
expect(undefined).toBeUndefined();
expect('hello').toBeDefined();
expect(1).toBeTruthy();
expect(0).toBeFalsy();

// Numbers
expect(10).toBeGreaterThan(5);
expect(10).toBeGreaterThanOrEqual(10);
expect(5).toBeLessThan(10);
expect(0.1 + 0.2).toBeCloseTo(0.3);

// Strings
expect('guild hall').toMatch(/hall/);
expect('lamp oil').toContain('oil');

// Arrays
expect(['Bran', 'Sera', 'Ivo']).toContain('Sera');
expect([1, 2, 3]).toHaveLength(3);

// Objects
expect({ name: 'Lamp oil', kind: 'potion' }).toHaveProperty('kind');
expect({ a: 1, b: 2 }).toMatchObject({ a: 1 });

// Exceptions: always wrap the call
expect(() => { throw new Error('boom'); }).toThrow();
expect(() => { throw new Error('boom'); }).toThrow('boom');

// Negation works on every matcher
expect(5).not.toBe(3);
expect([1, 2, 3]).not.toContain(4);
```

`toBeCloseTo` exists because `0.1 + 0.2` is `0.30000000000000004` in every JavaScript engine, and a `toBe(0.3)` on that sum is a test that fails for a reason that has nothing to do with your code. `toMatchObject` checks that the listed keys match and ignores the rest, which is what you want when a function returns a document with a generated id and a timestamp beside the fields you care about.

### Red proves the test is connected

The loop has three steps and a color for each. Red: write a test for behavior that does not exist yet, run it, and watch it fail. Green: write the smallest code that makes it pass. Refactor: clean the code up while the test stands guard. Then write the next test. The order matters more than it looks. A test written after the code tends to describe what the code does. A test written before the code describes what the code is for, and the first run proves the test can actually fail, which is the only proof you ever get that it is wired to the behavior.

For a function that already exists, you get the same proof a different way. Change the function so it is wrong in a way a person would notice, run the test, and watch it go red. Put the function back. If the test stayed green through the sabotage, it is asserting too little, calling the wrong function, or never reaching its assertion. That test is decoration. Do this once for every new test file before you trust it.

Read the failure output. A good test names the behavior in its `it` string and compares meaningful values, so the red line reads like a bug report: expected `-$5.50`, received `$-5.50`, in `currency.test.js` line 14. A generic assertion that a result is truthy can pass while every important field is wrong. Prefer the exact value, or `toMatchObject` with the fields that carry the contract. Do not over-specify incidental details such as key order or which internal helper got called. The test should survive a rewrite of the function's insides.

### Fixtures, hooks, and the clock

A test should not depend on another test having run first. Jest gives you four hooks for building fresh state. `beforeAll` and `afterAll` run once per file, before and after everything in it. `beforeEach` and `afterEach` run around every single test. A fixture built in `beforeEach` is new for every test, so a test that mutates it cannot leak that mutation into the next one. A fixture built once at the top of the file and shared is the classic order-dependent bug: the suite passes in one order and fails when you add a case in the middle.

Determinism is the same idea applied to inputs. A test that reads `Date.now()` can fail at midnight or in another time zone. A test that uses `Math.random()` passes most of the time, which is worse than failing, because you stop trusting red. Pass fixed dates in. For a shuffle, test the invariant, same length and same elements, not the order. Jest's fake timers can freeze the clock when you need to, and restoring real timers afterwards is part of cleanup.

Asynchronous tests must `await` the work they claim to check. Mark the test function `async` and `await` the promise. A test that starts a promise and returns without awaiting it can finish green before the assertion ever runs. The next session is built on that rule, because every request to the hall is a promise.

### Mocks: replace the edge, not the subject

`jest.fn()` makes a function that records how it was called. `jest.mock('./emailService')` replaces a whole module with recording stand-ins. You use these to cut off an edge you do not want a unit test to cross: a paid API, an email sender, the clock, the disk. You do not use them on the function you are testing, and you do not use them on everything around it either, because a test where every collaborator is a mock proves only that the function returns 200 when nothing real is in the room.

```js
const notify = jest.fn();
notify('Sera', 'A letter arrived');
notify('Ivo', 'A letter arrived');

expect(notify).toHaveBeenCalledTimes(2);
expect(notify).toHaveBeenCalledWith('Sera', 'A letter arrived');
expect(notify).toHaveBeenLastCalledWith('Ivo', 'A letter arrived');

const findUser = jest.fn();
findUser.mockReturnValue({ name: 'Bran' });
expect(findUser('any-id').name).toBe('Bran');
```

The second session of this unit keeps the database real on purpose. Mocks are a tool for the unit layer. The hall's bugs live at the boundaries, and a boundary you mocked is a boundary you did not test.

### Coverage asks questions

`jest --coverage` prints a table of which lines, branches, and functions ran during the suite. A covered line executed. It was not necessarily checked. Coverage is a map of what ran, not of what matters. Use it to find the `else` branch nobody wrote a case for, then write that case because the branch matters, not because the number was 78 and you wanted 80. A `coverageThreshold` in `jest.config.js` can fail the run when a module's number drops, which is a reasonable guard rail for a utility folder and a silly one for a file full of glue.

What you should be able to draw on a napkin: a test file is `describe` around `it` around `expect`. `toBe` is identity and `toEqual` is shape. A throw must be wrapped. Red first, then green, then refactor. Fresh fixtures per test. Mock the edge you do not own. Coverage is a question, not a grade.

One convention to settle now, because it changes next session. In the dojo, each test file sits beside the module it tests, `utils/math.js` and `utils/math.test.js`, which is the natural layout for a library of pure functions. In `hall-api` the tests go in a `tests/` folder, because they are about routes and the database rather than individual files, and because the folder name is what the config will point at. Both layouts are normal. Pick on purpose.

## The demonstration

A new folder, a new repo. Nothing from the hall is involved, and no server is running. If one is, stop it with Ctrl-C; this session never binds a port.

```bash
mkdir -p ~/projects/testing-dojo
cd ~/projects/testing-dojo
git init
npm init -y
npm install --save-dev jest
```

`npm install --save-dev jest` installs Jest 30 as a development dependency, which is what a tool that never runs in production should be. Open `package.json` and replace the scripts block.

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watchAll",
    "test:coverage": "jest --coverage"
  }
}
```

The project is CommonJS, which is Node's default when `package.json` has no `"type"` field, so `require` and `module.exports` are the import style throughout. Jest reads CommonJS without any transform. Add `node_modules/` and `coverage/` to `.gitignore` before the first commit.

The first module is arithmetic, because a function with no edges lets you look at the test file without anything else competing for attention.

```js
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

```js
// utils/math.test.js
const { add, subtract, multiply, divide } = require('./math');

describe('math utilities', () => {
  describe('add', () => {
    it('adds two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('adds negative numbers', () => {
      expect(add(-1, -1)).toBe(-2);
    });

    it('adds zero', () => {
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('subtract', () => {
    it('subtracts two numbers', () => {
      expect(subtract(10, 4)).toBe(6);
    });
  });

  describe('multiply', () => {
    it('multiplies two numbers', () => {
      expect(multiply(3, 4)).toBe(12);
    });

    it('returns zero when multiplied by zero', () => {
      expect(multiply(99, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    it('divides two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });

    it('throws when dividing by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });
});
```

Run `npm test`. Jest finds the one file by its name, runs eight claims, and prints a tree.

```text
PASS  utils/math.test.js
  math utilities
    add
      ✓ adds two positive numbers (1 ms)
      ✓ adds negative numbers
      ✓ adds zero
    subtract
      ✓ subtracts two numbers
    multiply
      ✓ multiplies two numbers
      ✓ returns zero when multiplied by zero
    divide
      ✓ divides two numbers
      ✓ throws when dividing by zero (2 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        0.4 s
```

Now make the two mistakes from the idea section, on purpose, so you have seen the messages. Change the last test to `expect(divide(10, 0)).toThrow()` without the arrow function and run again. The suite does not fail politely. It reports the test as failed with `Cannot divide by zero` thrown from inside the test body, because the throw happened before any matcher existed. Put the arrow back. Then add a temporary test, `expect({ hp: 100 }).toBe({ hp: 100 })`, and read the output: Jest says the values have the same structure but are not the same reference, and suggests `toEqual`. Delete the temporary test.

### Red, green, refactor, with money

The second module is built the other way round. Write the test first, for a function that does not exist.

```js
// utils/currency.test.js
const { formatCurrency } = require('./currency');

describe('formatCurrency', () => {
  it('formats a whole number as dollars', () => {
    expect(formatCurrency(10)).toBe('$10.00');
  });
});
```

Run `npm test`. The file fails before any `it` runs, because `require('./currency')` cannot find the module. That is red, and it is the correct kind of red: the test is connected to a thing that is missing. Now the smallest code that makes it pass.

```js
// utils/currency.js
function formatCurrency(amount) {
  return '$' + amount.toFixed(2);
}

module.exports = { formatCurrency };
```

Run again. Green. Now add four more claims, written before you touch the function.

```js
// fragment: add inside the describe block in utils/currency.test.js
it('formats a decimal', () => {
  expect(formatCurrency(9.99)).toBe('$9.99');
});

it('formats zero', () => {
  expect(formatCurrency(0)).toBe('$0.00');
});

it('puts the sign before the dollar on a negative amount', () => {
  expect(formatCurrency(-5.5)).toBe('-$5.50');
});

it('adds a thousands separator', () => {
  expect(formatCurrency(1000)).toBe('$1,000.00');
});
```

Run. Three of the five pass and two are red, and the red lines are the specification you have not met yet.

```text
  ● formatCurrency › puts the sign before the dollar on a negative amount

    expect(received).toBe(expected) // Object.is equality

    Expected: "-$5.50"
    Received: "$-5.50"

  ● formatCurrency › adds a thousands separator

    Expected: "$1,000.00"
    Received: "$1000.00"
```

Take a screenshot of that output. It is the captured failing run the quest asks for, and it is worth more than any green screenshot, because it proves the tests were checking something before the function could do it. Now the implementation that satisfies all five.

```js
// utils/currency.js
function formatCurrency(amount) {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return isNegative ? '-$' + formatted : '$' + formatted;
}

module.exports = { formatCurrency };
```

Five green. `toLocaleString('en-US', ...)` handles the grouping comma and the two decimals; the sign is handled by hand so it lands before the dollar. The refactor step here is small: the names are clear, nothing is duplicated, move on. On a bigger function this is where you would rename, extract, and simplify, running the file after every edit, with the tests as the net.

Now the sabotage check. Change `'-$'` to `'$-'` and run. One test red, the right one. Change it back. Green. That round trip is the habit: break it, watch it catch you, restore it.

### A small model you can run here

The page cannot run Jest in your browser, so here is a small model you can run here: a ten-line `it` and `expect` of its own, a discount function, and a deliberately broken copy of it. It proves that a test which passes against the right code goes red against the wrong code, which is the one property that makes a test worth keeping. It does not prove anything about your dojo folder; `npm test` in your terminal is that proof.

```js run=checkpoint-7-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

// A ten-line model of it() and expect(): run a claim, record red or green.
function makeRunner() {
  const results = [];
  function it(name, fn) {
    try { fn(); results.push({ name: name, status: 'green' }); }
    catch (err) { results.push({ name: name, status: 'red', reason: err.message }); }
  }
  function expect(received) {
    return {
      toBe: function (expected) {
        if (received !== expected) throw new Error('expected ' + expected + ', received ' + received);
      }
    };
  }
  return { it: it, expect: expect, results: results };
}

function totalAfterDiscount(cents, discount) {
  if (!Number.isInteger(cents) || cents < 0 || discount < 0 || discount > 1) throw new Error('invalid');
  return Math.round(cents * (1 - discount));
}

// The same claims, run against the real function.
const good = makeRunner();
good.it('Normal discount', () => good.expect(totalAfterDiscount(1000, 0.2)).toBe(800));
good.it('Zero boundary', () => good.expect(totalAfterDiscount(0, 1)).toBe(0));
check(good.results.every((r) => r.status === 'green'), 'Normal discount');
check(good.results[1].name === 'Zero boundary' && good.results[1].status === 'green', 'Zero boundary');

// Sabotage: a copy with the discount applied twice. The same claims must turn red.
function brokenTotal(cents, discount) {
  return Math.round(cents * (1 - discount) * (1 - discount));
}
const bad = makeRunner();
bad.it('Normal discount', () => bad.expect(brokenTotal(1000, 0.2)).toBe(800));
check(bad.results[0].status === 'red' && /received 640/.test(bad.results[0].reason), 'the same test is red against broken code');

// The throw trap: calling first, then asserting, means the error escapes before any matcher runs.
let escaped = false;
try { good.expect(totalAfterDiscount(-1, 0)).toBe(0); } catch (err) { escaped = err.message === 'invalid'; }
check(escaped, 'an unwrapped call throws before the matcher can see it');

console.log('ok: checkpoint-7-1');
```

Change `800` to `801` in the first claim and run the model again. The first check fails with the received value in the message. That is the shape of every red run you will read this unit: a name, an expected value, a received value.

## Where it breaks

![](diagram:session-7-1/fig2-diagnosis)

### Test mirrors implementation

The test fails the moment you rename a helper, and it stays green when the function returns the wrong total. It was written by reading the implementation and asserting each internal step, so it tests the shape of the code rather than the result. Assert the contract: given this input, this output, this error. You should be able to rewrite the function from scratch and keep the test file untouched. If a test has to change whenever an internal detail changes, it is a second copy of the code, and it will not catch a regression in the behavior.

The fix is to delete the assertions about how and keep the assertions about what. `expect(formatCurrency(1000)).toBe('$1,000.00')` is a contract. `expect(toLocaleString).toHaveBeenCalled()` is a diary entry.

### False green

The suite passes, including a test for a function you just broke on purpose. The assertion is too weak, the test never called the function, or it caught the error and continued. Break the behavior in a way a user would notice, run the one test, and watch it fail. Then put the behavior back and watch it pass. A test that cannot fail does not protect you. Do this once for every new test before you trust the file.

The usual culprits are `expect(result).toBeDefined()` on a function that always returns something, an `async` test that forgot `await`, and a `try` block around the call with the assertion inside the `try`, so a throw skips the assertion and the test ends green. The red run is the proof the test is connected to the behavior.

### Brittle setup

Tests pass alone and fail in the file, or fail only when the suite runs in a different order. They share a mutable object, a clock, or a row in a database, and one test's leftover becomes the next test's input. Build the fixture inside the test, or in a `beforeEach` that assigns a fresh value. Do not let tests delete from a shared array they all imported at the top of the file. Order dependence is a bug in the tests even when the production code is fine, and it will show up the day you add an unrelated case in the middle. Run one file with `npx jest utils/strings.test.js` and then the whole suite; if the counts differ, a fixture is shared.

## Your turn

Everything happens in `~/projects/testing-dojo`. Run `npm test` after every step; the number of passing tests should only go up.

1. Create `utils/strings.js` with `capitalize`, `reverseString`, `isPalindrome`, `truncate`, and `countWords`. Use this starter.

   ```js
   // utils/strings.js
   function capitalize(str) {
     if (typeof str !== 'string' || str === '') return '';
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
     return str.trim().split(/\s+/).filter((word) => word.length > 0).length;
   }

   module.exports = { capitalize, reverseString, isPalindrome, truncate, countWords };
   ```

2. Write `utils/strings.test.js` with at least two claims per function, one normal and one edge: the empty string, a single character, a string of spaces, a non-string passed to `capitalize`. Use at least five different matchers from the sheet. `npm test` should end with `Tests: 23 passed, 23 total` or higher, counting the eight math claims and the five currency claims.
3. Sabotage `isPalindrome` so it returns `true` unconditionally. Run. At least one strings test must be red. Restore it. If nothing went red, your palindrome cases only use palindromes; add `'guild hall'`.
4. Write `utils/validators.test.js` first, for `isValidEmail`, with these five claims and three of your own.

   ```js
   // utils/validators.test.js
   const { isValidEmail } = require('./validators');

   describe('isValidEmail', () => {
     it('accepts a plain address', () => {
       expect(isValidEmail('sera@example.com')).toBe(true);
     });

     it('rejects an address without @', () => {
       expect(isValidEmail('seraexample.com')).toBe(false);
     });

     it('rejects an address without a domain', () => {
       expect(isValidEmail('sera@')).toBe(false);
     });

     it('rejects the empty string', () => {
       expect(isValidEmail('')).toBe(false);
     });

     it('rejects null and undefined', () => {
       expect(isValidEmail(null)).toBe(false);
       expect(isValidEmail(undefined)).toBe(false);
     });
   });
   ```

   Run `npm test` and confirm the file is red with `Cannot find module './validators'`. Only then create `utils/validators.js` and make the claims pass one at a time.
5. Run `npm run test:coverage`. Read the table. Every file under `utils/` should show 100 in the `% Stmts` column, because every function has a test that calls it. If a line is uncovered, the table names the line number; write the case or decide the line should not exist.
6. Create `jest.config.js` so a drop in coverage fails the run.

   ```js
   // jest.config.js
   module.exports = {
     testEnvironment: 'node',
     collectCoverageFrom: ['utils/**/*.js'],
     coverageThreshold: {
       global: { statements: 90, branches: 80, functions: 90, lines: 90 }
     }
   };
   ```

   `npm run test:coverage` should still pass. Comment out one test and run again: Jest prints `Jest: "global" coverage threshold for statements (90%) not met` and exits non-zero. Put the test back.
7. Commit, then create the repo and push, the way you have since 1-4: `gh repo create testing-dojo --public --source=. --push`.

## The quest

![](diagram:session-7-1/fig3-evidence)

Build `utils/arrayHelpers.js` test-first, in `utils/arrayHelpers.test.js`, one function at a time: `unique(arr)`, `flatten(arr)` one level deep, `chunk(arr, size)`, `shuffle(arr)` returning a new array, and `intersection(a, b)`. Each function gets at least three claims: a normal case, an edge case, and the empty array. Start with `unique` because it is the simplest. For `shuffle` you cannot assert the order, so assert the length and that the result, sorted, equals the input, sorted, and that the input was not mutated. For `chunk`, cover a length that does not divide evenly. For each function, the test must be red once before it is green; the git log should show that, so commit the red test file before you commit the implementation.

Evidence to keep in the repo:

- `README.md` with the command to run the suite, the final `Tests:` line from `npm test`, and the coverage table pasted in a fenced block.
- `red-run.png`, the screenshot of the currency formatter failing on the negative and thousands cases, linked from the README.
- A commit history where at least one `*.test.js` file was committed before the module it tests.
- `jest.config.js` with a coverage threshold that passes.

The repo is small on purpose. It is the place you will come back to when you forget what `toMatchObject` does, and it is the proof that you know what red looks like before the hall's tests have anything to hide behind.

## Side quests

Every test is a trade-off between the confidence it buys and the time it costs, and a suite that has never been red is the kind of first attempt the long-return page is about, so read those two with the dojo open.

## Before next session

Next session the tests stop being about pure functions and start being about the hall. You will open `~/projects/hall-api`, split `server.js` into a file that builds the app and a file that listens, point Jest at a throwaway database called `guildhall_test`, and send real HTTP requests through the real router with Supertest. Before then, reread the first half of your `HALL.md` from 4-14, the inbox statuses: 200 for Sera, 403 for Ivo, 403 for Bran, 404 for a random id. Those four lines become four `it` blocks, and the fact that you already wrote them down by hand is why the next session goes quickly.

Nothing is left running after today. The dojo has no server. Make sure the hall is also stopped on your machine (the deployed copy from Unit 6 stays up on its own and is not touched by anything in this unit). Confirm `mongod` is still installed and starts, because next session's tests need it on `127.0.0.1:27017`. The next session starts in `~/projects/hall-api` on a new branch called `add-tests`.
