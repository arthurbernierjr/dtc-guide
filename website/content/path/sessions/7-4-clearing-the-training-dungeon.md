---
editorial: true
title: Clearing the Training Dungeon
subtitle: Rank the risks, close the gaps, run from a clean clone, merge the pull request, write the report
hook: "Green is not the same as safe. Today you list what would actually hurt a person using the hall, give each risk a test at the cheapest layer that can catch it, prove the suite from a clean clone, merge add-tests into main through a pull request, and write a report that says exactly what was and was not checked."
read: 60
artifact: "A risk-ranked TESTPLAN.md, schema tests for the hall's real rules, a coverage reading, a clean-clone run, a merged pull request with green checks, and a TESTING.md that separates automated evidence from manual checks"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://jestjs.io/docs/cli
  - https://jestjs.io/docs/configuration#collectcoveragefrom-array
  - https://playwright.dev/docs/test-reporters
  - https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
  - https://cli.github.com/manual/gh_pr_create
  - https://www.artillery.io/docs
say:
  - "Start from the failure that would hurt someone, not from the file that is easiest to cover."
  - "A schema rule, a route, and a screen are three layers; put each risk at the cheapest one that can catch it."
  - "The report says what ran, against what, and what was only checked by hand; a green badge says none of that."
---

## The hook

You have three suites now. Jest in the dojo, Supertest against the hall's routes, Playwright through the hall's page, and a workflow that runs the last two on every push. The Actions tab is green. It would also be green if the suite never touched the transfer route, if `scroll` could be saved as an item kind, if a letter could be two megabytes, or if a password hash rode along in a populated sender. Green means every claim you wrote held. It says nothing about the claims you did not write.

Today you work from the other end. You list the promises the hall makes to Bran, Sera, and Ivo, rank them by how much a broken one would hurt, and check each one against the suite. Where a promise has no test, you write one at the cheapest layer that can catch it: a schema rule in a model test, a status in a Supertest file, a screen in a browser test. You break the hall once on purpose and name the test that caught it. You clone the repository into a fresh folder and run everything from nothing. Then you open the pull request from `add-tests` to `main`, watch the checks go green on the PR itself, merge it, and write `TESTING.md` so that someone who was not there, including you in a month, knows what the green actually covers.

> *The dungeon is cleared when you can say which rooms you checked, which you did not, and why, and nobody has to take your word for the first part.*

## The idea

A test suite is a portfolio of evidence about specific risks, not a percentage. The first question is never "what can I cover" but "what would hurt someone if it broke." For the hall, the list is short and concrete. A letter is readable by someone other than its recipient. A pack goes negative, or a transfer takes from Bran and never reaches Sera. A password hash reaches a browser. A registration with a taken email overwrites the first account. The login form stops working after a deploy. Each of those is a sentence a person could say about their own experience, and each one has a different cost. A mail leak is a reason to shut the hall down. A misspelt heading is a reason to fix it on Tuesday.

![](diagram:session-7-4/fig1-model)

### Start with failure impact

Write the promises down before you open a test file. For each one, say who is hurt and how, and give it one of three ranks: a blocker, which means the hall should not be live while it is broken; a defect, which means it should be fixed before the next feature; and a blemish. The ranking is about consequences for a person, not about how hard the test is to write. A route you find boring can hold a blocker.

Then assign each promise to the cheapest layer that can observe it. A rule that lives in the schema, such as the kind enum or the 2000-character ceiling on a letter, is observed by a model test: build the document, save it, catch the validation error. A rule that lives in a route, such as the recipient check or the conditional spend, is observed by a Supertest request, because the rule is in the handler and the handler is only reachable through HTTP. A rule that lives on the screen, such as the inbox showing the sender's name, is observed only by a browser. Pushing a schema rule up to a browser test costs seconds per run and tells you less when it fails; pushing a screen rule down to Supertest cannot be done at all.

Some promises cannot be checked by any of the three. That the deployed hall on `https://YOUR-DOMAIN` is serving the merged code, that the TLS certificate renews, that the server's MongoDB is the one with the real letters in it: those are checked by a person, by hand, after a deploy, and the report says so in a separate list. A suite that claims to cover them is overclaiming.

### Model tests are database tests

The hall's schema rules are worth four tests of their own, and they are not unit tests. They `save` to `guildhall_test` through the same `tests/setup.js` as the route tests, because a validation rule is a promise about what MongoDB will accept, and the only way to observe a unique index is to insert twice. Call them model tests. The pyramid's base is the dojo's pure functions; these sit in the middle with the routes.

The four rules worth testing are the ones a route relies on without re-checking. `kind` must be `potion`, `weapon`, or `armor`, so a seed with `scroll` must throw a `ValidationError` with `errors.kind` set. A letter body above 2000 characters must be refused by the schema, because the route only trims and checks for empty. A holding with a negative quantity must fail `save`, which is the `min: 0` promise, even though the conditional update in `spend` is what protects the live path. And a second holding for the same owner and item must fail with code `11000`, which is the compound unique index. That last one only works because `tests/setup.js` calls `syncIndexes` after connecting; without it, a fresh database can accept the duplicate before the index exists, and the test flickers between red and green on first runs.

The user's unique email is already covered from the outside by the 409 in `auth.test.js`, and the hash never leaving the server is covered by the register test's regular expression. Those stay where they are. There is no `comparePassword` method on the hall's user model and no pre-save hook, because hashing happens in the register route; a model test for hashing would be testing code that does not exist.

### Remove redundant confidence

Several tests can all exercise the same happy path while an important branch goes untouched. Review the assertions, not the test names. If four tests confirm that `POST /api/messages` returns 201, and none confirms that an empty body writes nothing, the fourth 201 is adding a number, not evidence. If every pack test uses Bran, add Sera, because the ownership filter on holdings is only observed when a second owner exists. The goal is distinct evidence about distinct risks, and the plan is where you see the duplicates, because the plan has one row per promise.

Coverage is the tool for finding the branch you forgot, used after the plan rather than instead of it. `npm test -- --coverage` prints a table for `app.js` with the uncovered line numbers in the last column. Open those lines. Most of them are branches you can name: the `11000` retry in `give`, the `headersSent` guard in the error handler, the transfer's 404 when the recipient is unknown. Decide for each one whether a person is hurt if it is wrong. The retry branch is a defect if it is wrong; the `headersSent` guard is a blemish. Write the test for the first and leave a sentence in the plan for the second. A threshold in `jest.config.js` is a reasonable guard against the number sliding backwards once you are happy with it. Raising a threshold to force tests into existence produces tests that execute lines and assert nothing.

### Rehearse a regression

A suite you have never seen go red against a real bug is a suite you are trusting on faith. Pick one promise ranked as a blocker, remove the code that keeps it, and run. For the hall, the two obvious rehearsals are the recipient comparison in `readMessage` and the `$gte` filter in `spend`; you did both in 7-2. Today do a third, one you have not done: in `inbox`, replace `{ recipient: req.userId }` with `{}` so every account sees every letter. The inbox test fails on `toHaveLength(0)` for Bran's inbox. Put it back. Note which test caught it in the plan. Do not leave the mutation in a commit, and do not weaken the assertion to accept it.

### Run from a clean clone

A test command that works only with your uncommitted files, your local `node_modules`, or rows left in `guildhall_test` from last week is not reproducible, and CI is one clean clone among many. Clone the repository into a fresh sibling folder, install with `npm ci`, run `npm test`, run `npx playwright test`, and delete the folder. If anything fails there and passes in `~/projects/hall-api`, the difference is a file you forgot to commit, and the clean run just found it before the reviewer did.

### Write a release-quality report

`TESTING.md` is the document the pull request points at. It names the revision, the exact commands, the results, and the known gaps, in that order. It says whether a real database was used, whether anything was mocked, and whether the deployed hall was checked by hand and when. It links the captured failures from this unit, because a screenshot of a red run is evidence that the suite is connected to the code in a way no green screenshot can be. It ends with a maintenance paragraph: which test breaks first when a route changes, and what a flaky browser test should be investigated for before anyone adds a retry.

What you should be able to draw on a napkin: a table with one row per promise, a rank, a layer, and a test name. Model tests for the schema, Supertest for the routes, Playwright for the screens, a hand check for the deploy. Coverage finds forgotten branches. A rehearsed regression proves the suite bites. A clean clone proves the suite travels. The report says what the green means and what it does not.

## The demonstration

In `~/projects/hall-api`, on `add-tests`, with `mongod` running and nothing else. Start by turning last session's `TESTPLAN.md` into the table. Copy this into `TESTPLAN.md` and fill it in, one row per promise.

```markdown
# Test plan: the guild hall

| Promise | If it broke, who is hurt and how | Rank | Layer | Test |
|---|---|---|---|---|
| | | blocker / defect / blemish | model / api / browser / hand | file and `it` string |

## Not covered by any suite, and why

-

## Rehearsed regressions

- date · what was removed · which test went red
```

A filled version for the hall looks like this. Yours will have the same first six rows and different ones after that, depending on what you added to the hall in Unit 5.

```markdown
# Test plan: the guild hall

| Promise | If it broke, who is hurt and how | Rank | Layer | Test |
|---|---|---|---|---|
| Only the recipient can read a letter by id | Ivo reads Sera's mail | blocker | api | messages.test.js · is 403 for a stranger |
| The inbox lists only the token user's letters | Everyone sees everything | blocker | api | messages.test.js · lists the letter in the recipient inbox and not in the sender inbox |
| A pack never goes negative | Bran gives away potions he does not have | blocker | api | pack.test.js · spend of 50 answers 409 and the holding still reads 3 |
| A password hash never leaves the server | Every account is crackable offline | blocker | api | auth.test.js · registers an account and never returns the hash |
| An item kind outside the enum is refused | The catalog fills with junk nothing can render | defect | model | models.test.js · refuses a kind outside potion, weapon, armor |
| Sera sees the sender's name on a letter | She cannot tell who wrote to her | defect | browser | inbox.spec.js · Sera logs in and sees the letter Bran sent her |
| A letter longer than 2000 characters is refused | One letter fills the inbox screen | defect | model | models.test.js · refuses a letter longer than 2000 characters |
| The deployed hall serves the merged code | Tests pass, the live site is a week old | blocker | hand | after each deploy: log in on https://YOUR-DOMAIN, send one letter |

## Not covered by any suite, and why

- The transfer's second write failing after the first succeeded (the lost-item window from 4-15): needs a transaction before it can be observed; listed as a known gap.
- The TLS certificate renewing: checked by hand each month; certbot's timer, not the suite.

## Rehearsed regressions

- 7-2 · removed the recipient comparison in readMessage · messages.test.js, two tests red (stranger, sender)
- 7-2 · removed the $gte filter in spend · pack.test.js, 409 test red with a negative holding
- 7-4 · replaced the inbox filter with {} · messages.test.js, Bran's inbox had 1, expected 0
```

Two rows in the table name `models.test.js`, which does not exist yet. Write it.

```js
// tests/models.test.js
const mongoose = require('mongoose');
require('../app');

const Item = mongoose.model('Item');
const Message = mongoose.model('Message');
const Holding = mongoose.model('Holding');

async function rejection(promise) {
  try {
    await promise;
  } catch (err) {
    return err;
  }
  return null;
}

describe('schema rules the routes rely on', () => {
  it('refuses a kind outside potion, weapon, armor', async () => {
    const err = await rejection(Item.create({ name: 'Scroll of fire', kind: 'scroll' }));
    expect(err).not.toBeNull();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.kind).toBeDefined();
  });

  it('refuses a letter longer than 2000 characters', async () => {
    const err = await rejection(Message.create({
      sender: new mongoose.Types.ObjectId(),
      recipient: new mongoose.Types.ObjectId(),
      body: 'x'.repeat(2001)
    }));
    expect(err).not.toBeNull();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.body).toBeDefined();
  });

  it('refuses a negative quantity on save', async () => {
    const err = await rejection(Holding.create({
      owner: new mongoose.Types.ObjectId(),
      item: new mongoose.Types.ObjectId(),
      qty: -1
    }));
    expect(err).not.toBeNull();
    expect(err.name).toBe('ValidationError');
    expect(err.errors.qty).toBeDefined();
  });

  it('keeps one holding per owner and item', async () => {
    const owner = new mongoose.Types.ObjectId();
    const item = new mongoose.Types.ObjectId();
    await Holding.create({ owner, item, qty: 1 });
    const err = await rejection(Holding.create({ owner, item, qty: 1 }));
    expect(err).not.toBeNull();
    expect(err.code).toBe(11000);
  });
});
```

`rejection` turns a promise that should fail into a value you can assert on, and returns `null` when it did not fail, so the first assertion in each test is the one that catches a rule that silently stopped existing. The three fake ids are real `ObjectId`s, because the schema requires the field and the rule under test is elsewhere. Run `npm test`. The count goes up by four, and the last file in the list is the new one.

```text
PASS tests/auth.test.js
PASS tests/messages.test.js
PASS tests/pack.test.js
PASS tests/errors.test.js
PASS tests/models.test.js

Test Suites: 5 passed, 5 total
Tests:       26 passed, 26 total
```

Twenty-six is the example suite's count, and the ledger is this: fourteen from the accounts and letters files of 7-2, four from the pack file in 7-2's steps, four from `tests/errors.test.js` in 7-2's quest, and four from today's models file. If you kept claims of your own, yours is higher. The check is zero failed, which Jest shows by leaving `failed` off the line. The three Playwright journeys from 7-3 run under their own command and are not in this count, and the dojo from 7-1 is a separate repository that never was.

If the last test fails with `Received: undefined` for the code, the unique index did not exist when the second insert ran; confirm `await mongoose.syncIndexes()` is in `tests/setup.js` and that the holding schema still declares the compound index.

### Reading coverage

```bash
npm test -- --coverage
```

```text
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   91.4  |   84.2   |   95.0  |   91.4  |
 app.js   |   91.4  |   84.2   |   95.0  |   91.4  | 188-193,241,262
----------|---------|----------|---------|---------|-------------------
```

Your numbers differ. The column that matters is the last one. Open `app.js` at those lines. In this run, 188 to 193 are the `11000` retry inside `give`, 241 is the transfer's `choose another account` branch, and 262 is the `headersSent` guard. The retry branch is a defect if it is wrong: a race between two gives would lose one. Add a row to the plan and a test to `pack.test.js` that calls `give` for the same item from two concurrent requests with `Promise.all` and asserts one holding with the summed quantity. The transfer-to-self branch is a defect too, and it is one request. The `headersSent` guard is a blemish; write the sentence in the plan and move on. `coverage/` is in `.gitignore`; the table goes into the report as text and the screenshot goes into the pull request.

### The rehearsal, the clean clone, the pull request

Open `app.js`, find `inbox`, and replace the filter with `{}`. Run `npm test`. One test red: Bran's inbox has one letter, expected zero. Restore the filter, run, green, and add the line under Rehearsed regressions in the plan. Commit the plan and the model tests.

Now the clean clone, as a sibling folder, never inside the repository.

```bash
cd ~/projects
git clone git@github.com:YOU/hall-api.git hall-api-clean
cd hall-api-clean
git switch add-tests
npm ci
npm test
npx playwright install chromium
npx playwright test
cd ~/projects
rm -rf hall-api-clean
```

`npm ci` installs from the lockfile and nothing else. If `npm test` fails here and passes in `hall-api`, read the first line of the failure: a missing `.env.test` means `.gitignore` swallowed it; a `Cannot find module` means a file was never added; a `buffering timed out` means `jest.config.js` was never committed. Fix it in `hall-api`, commit, push, and clone again. When both commands pass in the clean folder, delete it. Your machine should have one copy of the hall.

The pull request is where the suite becomes a gate instead of a habit. Push the branch and open the PR from the terminal, with the report as its body.

```bash
cd ~/projects/hall-api
git push
gh pr create --base main --head add-tests --title "Add the test suite" --body-file TESTING.md
gh pr checks --watch
```

`gh pr checks --watch` sits in the terminal until the `api` and `e2e` jobs finish and prints their status; the same two checks appear on the PR page under the conversation. When both are green, merge from the page or with `gh pr merge --merge`, then `git switch main` and `git pull`. The workflow runs once more on `main`, because the push event fires for it too. If the hall is deployed on Railway from the GitHub repository, that merge also triggers a redeploy; on the VPS from Unit 6, you pull on the server and restart the process as in 6-4. Either way, the hand check in the plan's last row happens after that, not before.

### A small model you can run here

The page cannot run your suite or merge a branch, so here is a small model you can run here: the plan's table as data, with a rank and a result on each row, and the two decisions the report has to make from it. It proves that the release decision depends only on the rows ranked as blockers, and that a failing row that is not a blocker is still named rather than dropped. It does not prove anything about your hall; `gh pr checks` and `TESTING.md` are that proof.

```js run=checkpoint-7-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const plan = [
  { promise: 'only the recipient reads a letter', rank: 'blocker', layer: 'api', passed: true },
  { promise: 'a pack never goes negative', rank: 'blocker', layer: 'api', passed: false },
  { promise: 'the inbox shows the sender name', rank: 'defect', layer: 'browser', passed: false },
  { promise: 'a kind outside the enum is refused', rank: 'defect', layer: 'model', passed: true },
  { promise: 'the deployed hall serves the merged code', rank: 'blocker', layer: 'hand', passed: null }
];

// The release decision reads only the blockers.
const blockers = plan.filter((row) => row.rank === 'blocker' && row.passed === false);
check(blockers.length === 1 && blockers[0].promise === 'a pack never goes negative', 'Release decision follows critical risks');

// Everything that did not pass is named, even when it does not block.
const incomplete = plan.filter((row) => row.passed !== true);
check(incomplete.length === 3 && incomplete.some((row) => row.rank === 'defect'), 'Explain the rejected or incomplete case');

// A hand check is reported separately from the suites, never counted as green.
const byHand = plan.filter((row) => row.layer === 'hand');
check(byHand.length === 1 && byHand[0].passed === null, 'manual checks are listed, not assumed');

// The cheapest layer that can observe a rule is the one assigned to it.
const cheapest = { 'schema rule': 'model', 'route status': 'api', 'screen text': 'browser', 'live site': 'hand' };
check(cheapest['schema rule'] === 'model' && cheapest['screen text'] === 'browser', 'each risk sits at the cheapest layer that can catch it');

console.log('ok: checkpoint-7-4');
```

Flip the pack row to `passed: true` and run again. The first check fails, because the model expects a blocker to be open; that is the shape of a plan that says the hall may ship. Flip it back and change the browser row's rank to `blemish`: the second check still passes, because a failing row is named regardless of rank. Both results are the report's two rules.

## Where it breaks

![](diagram:session-7-4/fig2-diagnosis)

### Coverage target replaces judgment

Coverage hits the number you set, and the transfer path, the recipient check, and the empty-body case are still untested. The tool counted lines that ran, including lines a trivial test happened to touch on its way somewhere else. Coverage is a map of what ran. It is not a map of what matters. List the risks you actually care about, write a test for each, and then look at coverage to find a branch you lied to yourself about. Raising the threshold without that list produces tests that execute lines and assert nothing, and a table that looks better while the plan has the same holes.

### Everything mocked

Every boundary is replaced, the report is green, and a real request against a real database fails on the first query. Mocks are for the edges you do not want to call in a unit test. They are not a substitute for one test that crosses the boundary you ship. The hall's suites keep the router, the validator, and the database real on purpose, and the only thing between the tests and your real data is the `_test` guard. If a future test starts mocking `mongoose.model` to make a case easier, ask what the case is observing. If the answer is a status that depends on the database, the mock removed the evidence.

### Green report overclaims

The README says the hall is fully tested, and the report never started a browser, never ran the transfer under two concurrent requests, and never checked the deploy. Say what the suite covers and what it does not. A model suite, an API suite, a browser suite, and a hand check of the live site are four different sentences. Collapsing them into "tested" is how a reviewer, including you in a month, trusts a hole. List the external and manual checks next to the commands that produce the green runs, with the date each hand check was last done.

## Your turn

In `~/projects/hall-api`, on `add-tests`, with `mongod` running and nothing else.

1. Fill `TESTPLAN.md` from the template with at least eight rows. Every blocker row names a test file and an `it` string that exists. Rows without a test get a test today or a sentence under Not covered.
2. Write `tests/models.test.js`. `npm test` ends with four more passing tests than it did at the end of 7.3; the last line names the new file.
3. Run `npm test -- --coverage`. Open every line number in the last column and give each one a rank in the plan. Write at least one new test for a defect-ranked branch. Screenshot the table as `coverage.png`; the folder stays ignored.
4. Replace the inbox filter with `{}`, run, confirm one test goes red with `Expected length: 0, Received length: 1`, restore it, and add the line to Rehearsed regressions.
5. Commit. Clone into `~/projects/hall-api-clean`, `npm ci`, `npm test`, `npx playwright test`. Both end in their passing lines. Delete the folder.
6. Write `TESTING.md` from the template in the quest. Commit and push.
7. `gh pr create --base main --head add-tests --title "Add the test suite" --body-file TESTING.md`, then `gh pr checks --watch` until both checks print as passing.
8. Merge the pull request, `git switch main`, `git pull`, and watch the Actions tab run once more on `main`. Then do the hand check from the plan's last row against the deployed hall and write the date into `TESTING.md` on `main`.

## The quest

![](diagram:session-7-4/fig3-evidence)

The deliverable is a merged pull request with green checks and a `TESTING.md` that a stranger could follow. Copy this into `TESTING.md` and fill it in.

```markdown
# Testing report: hall-api

Revision: <short commit hash on main after the merge>
Commands: `npm test` · `npx playwright test`
Results: Jest <n> passed · Playwright <n> passed · Actions run <link>
Database: real, `guildhall_test` for Jest and `guildhall_e2e` for Playwright, both on 127.0.0.1; nothing mocked
Deployed hall: checked by hand on <date>: log in, send one letter, read it as the recipient, on https://YOUR-DOMAIN

## Captured failures
- leak-caught.png · readMessage without the recipient comparison
- negative-caught.png · spend without the $gte filter
- wrong-sender.png · inbox rendering the email instead of the name
- actions-red.png · a workflow with the wrong lockfile path

## Known gaps
-

## Maintenance
- When a route's status changes, <file> goes red first.
- A flaky browser test is investigated for an unawaited assertion before anyone adds a retry.
```

Evidence to keep:

- The PR link, merged, with both checks green on its last commit.
- `TESTPLAN.md` and `TESTING.md` on `main`, with the hand-check date filled in after the deploy.
- `coverage.png`, with the uncovered lines each accounted for in the plan.
- The clean-clone run's last lines pasted into `TESTING.md`, under a heading that says the folder was deleted afterwards.

### A side exercise: how many people can the hall hold

Your suites prove the hall works for one person at a time. A different question, answered by a different tool, is what happens when a hundred adventurers arrive at once. Artillery sends waves of virtual users at the API and reports how long requests took at the 95th percentile. It is optional, it is short, and the number it gives you is one you will want to know before Unit 12.

Start the hall against a fourth throwaway database so the load leaves no trace in your real one. Create `.env.load` with `MONGODB_URI=mongodb://127.0.0.1:27017/guildhall_load`, `JWT_SECRET=load-only`, `PAGE_ORIGIN=http://localhost:5173`, and `PORT=4100`, start it with `node --env-file=.env.load server.js`, register Bran and Sera with curl, and keep Sera's id, which is the `sub` in her token.

```bash
npm install --save-dev artillery
```

```yaml
# load-test.yml
config:
  target: "http://localhost:4100"
  phases:
    - duration: 30
      arrivalRate: 5
      name: warm up
    - duration: 60
      arrivalRate: 20
      name: peak

scenarios:
  - name: log in, read the catalog, send a letter
    flow:
      - post:
          url: "/api/login"
          json:
            email: "bran@example.com"
            password: "correct-horse-battery"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/items"
          headers:
            Authorization: "Bearer {{ token }}"
      - post:
          url: "/api/messages"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            recipient: "SERA_ID"
            body: "a letter from the load test"
```

```bash
npx artillery run load-test.yml
```

Read three numbers in the summary. `http.response_time.p95` is the time 95 percent of requests finished within; it is the number to watch, not the mean, because averages hide the slow tail that people actually feel. Under 200 milliseconds on a laptop is healthy for this API. `http.codes.200` and `http.codes.201` should account for nearly every response; a pile of 500s under load usually means the database connection pool is exhausted or a handler is doing work it should not. `vusers.failed` should be zero. If p95 is poor, the usual suspects are a missing index on a field you query every request, which the `recipient` index on messages was there to prevent, and logging on a hot path. Stop the hall, drop `guildhall_load` in `mongosh`, and write the p95 into `TESTING.md` under a heading that says it was measured on your machine, not on the server.

## Side quests

The vulnerability names on the quick-reference sheet are the first column of a risk table like yours, and a report that says what was observed and what was not is the same discipline the observability page applies to a running service.

## Before next session

This is the last session of the unit, and the hall is finished: built in Unit 4, drafted with a model in Unit 5, deployed in Unit 6, and now guarded by a suite that runs on every push to `main`. The next unit begins the capstone, which is yours to choose, and it begins with people rather than code. In 8-1 you write an interview script and go find three to five people who have the problem you want to solve. Spend the time before then thinking about who those people are and what you could ask them without leading the answer. Do not pick a technology. Pick a person who is frustrated.

Nothing is left running after today. The hall's workflow runs on GitHub when `main` changes, and the deployed hall stays up on its own. Leave `~/projects/hall-api` on `main`, with `add-tests` merged and deleted on GitHub if you like. The capstone gets a new folder, `~/projects/<capstone-name>`, in 8-1, and the suite you just built is the pattern its tests will copy: `app.js` and `server.js`, a `_test` database that refuses to be anything else, and a plan with one row per promise.
