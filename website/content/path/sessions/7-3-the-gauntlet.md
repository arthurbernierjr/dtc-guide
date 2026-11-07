---
editorial: true
title: The Gauntlet
subtitle: Playwright on the hall's own page, and a GitHub Actions workflow that runs every suite on push
hook: "Nobody uses the hall with curl. Sera uses the page. Today a browser you never touch logs in as Sera and reads Bran's letter, and then GitHub runs that same journey, and every Jest file, on a machine you will never see."
read: 60
artifact: "A Playwright journey through the hall's login and inbox, a config that starts hall-api on 4100 and hall-client on 5173, and a GitHub Actions workflow with a MongoDB service that runs Jest and Playwright on every push"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://playwright.dev/docs/intro
  - https://playwright.dev/docs/writing-tests
  - https://playwright.dev/docs/locators
  - https://playwright.dev/docs/test-webserver
  - https://playwright.dev/docs/best-practices
  - https://docs.github.com/en/actions/writing-workflows/quickstart
say:
  - "A browser test describes a journey a person would recognise: log in as Sera, see the letter from Bran."
  - "Find elements the way a person does, by role and label; wait for the evidence, never for a number of seconds."
  - "CI is the same command on a machine that has nothing of yours on it; the lockfile and the service container are what make it the same."
---

## The hook

The suite from last session proves the API's doors. It says nothing about the page. The login form could post to the wrong path, the inbox could render the sender's email instead of the name, a `useEffect` could fire before the token is stored, and every Supertest file would stay green, because none of them opens a browser. Sera does not send HTTP. She types into a field and clicks a button, and what she sees afterwards is the only thing she will judge the hall by.

Today a browser does that for her. Playwright drives a real Chromium against `hall-client` on 5173, which talks to `hall-api` on 4100, which writes to a disposable database. The test registers Bran and Sera through the API, has Bran send a letter the same way, and then logs in as Sera through the page and asserts the letter is on the screen with Bran's name beside it. Then you write a workflow file, and GitHub runs Jest and Playwright on a fresh Ubuntu machine every time you push. By the end, the Actions tab shows a green check next to your latest commit on `add-tests`, and you have read the logs of at least one red one.

> *The gauntlet is not a harder dummy. It is the whole corridor, with the doors you built, run by someone who does not know where they are.*

## The idea

An end-to-end test is a journey a person would recognise, performed by a browser you control from code. It is the top of the pyramid: the slowest and most expensive kind of test, and the only kind that proves the pieces work together through the surface a person actually uses. You write a few of them, for the journeys that would embarrass you if they broke: log in, read the inbox, send a letter. You do not write one for every button.

Playwright is the runner. It launches Chromium, Firefox, or WebKit, hands your test a `page` object, and every action on that page waits for the element to be ready before acting. `await page.getByRole('button', { name: 'Log in' }).click()` waits until a button with that accessible name exists, is visible, and is enabled, and then clicks it. `await expect(locator).toBeVisible()` retries until the element is visible or the timeout passes. There is no sleep in a well-written Playwright test, because the assertion itself is the wait.

![](diagram:session-7-3/fig1-model)

### Describe the journey in the user's words

Choose one complete action with a visible outcome. Sera logs in and sees the letter Bran sent her. That sentence names the actor, the action, and the evidence, and it is the `test` title. The test should cross as many screens as the journey needs and no more. One giant script that logs in, sends a letter, spends a potion, and transfers a sword tests nothing after the first failure, because Playwright stops at the first broken step and everything after it goes unobserved.

The arrangement is not part of the journey. Registering Bran and Sera and sending the letter are things the API can do in a few milliseconds, and Playwright's `request` fixture is a small HTTP client for exactly that. The browser part begins when Sera arrives at the page. Keeping the setup in the API and the journey in the browser makes the test fast, and it makes the failure meaningful: if it goes red, the page is what broke, because the API calls asserted their own statuses on the way in.

Sera's user id is inside her token. The hall signs `{ sub: userId }`, and the middle segment of a JWT is base64url-encoded JSON that anyone can read. Decoding it in the test is a legitimate way to get the recipient id for `POST /api/messages` without a database connection, and it is a reminder that a token is not a secret container; it is a signed, readable claim.

### Find elements the way a person does

Playwright's locators have an order of preference, and the order is about how a person finds things, not about what is easy for a script. `getByRole('button', { name: 'Log in' })` finds the button by what it is and what it says, the way a screen reader and a sighted person both do. `getByLabel('Email')` finds the input by its label or its `aria-label`, which is how your hall client's inputs are labelled since 4-12. `getByText('The gate is shut.')` finds the letter by its words. `getByTestId` is the fallback when an accessible name is honestly duplicated. A CSS selector such as `.form input:nth-child(2)` is the last resort, because it breaks when the markup changes for reasons that have nothing to do with the journey.

Locators are strict. If `getByRole('heading', { name: 'Inbox' })` matches two headings, the action fails with an error that lists both, rather than silently picking the first. That strictness is a feature. A page with two elements that a person could confuse is a page with a usability problem, and the test found it. When the match is legitimately plural, a list of letters for example, scope the locator with `.filter({ hasText: 'The gate is shut.' })` and assert on the one row.

A role-based locator also exposes what the page is missing. If the hall client has no heading that says Inbox, the test cannot find one, and the fix is to add `<h2>Inbox</h2>` to the client, not to reach for a CSS path. The test is asking the page to say what it is. That is a product improvement the browser test made you do.

### Wait for evidence, not for time

A fixed `waitForTimeout(2000)` assumes the page will be ready inside a guessed interval. On a slow CI runner it is too short and the test flakes. On your laptop it is too long and the suite is slow for no reason. Await a condition instead: the heading is visible, the row contains the text, the response to `/api/login` arrived with a status. Playwright's `expect` matchers retry until they pass or time out, so `await expect(page.getByText('The gate is shut.')).toBeVisible()` is both the assertion and the wait. For a negative journey, a wrong password, wait for the thing that proves the attempt happened, the 401 response, and then assert that the inbox heading has a count of zero. An assertion that something is absent passes trivially before the page has done anything, unless you first wait for the evidence that it tried.

### Two servers, started by the config

The journey needs two processes: `hall-api` on 4100 and `hall-client` on 5173. Playwright's `webServer` option takes an array, one entry per process, and starts each one before the tests and stops it after. Each entry has a `command`, a `port` to poll until it answers, a `cwd` relative to the config file, and an `env` block merged over your shell's environment. The API entry sets `MONGODB_URI` to `guildhall_e2e`, a second throwaway database, and `PAGE_ORIGIN` to the client's origin so the CORS middleware admits the browser. The client entry runs Vite with `--strictPort`, so a leftover dev server on 5173 makes the run fail loudly instead of quietly drifting to 5174, where `PAGE_ORIGIN` would not match.

`reuseExistingServer: !process.env.CI` means that locally, if something is already listening on the port, Playwright uses it; on a CI machine it refuses. That is why you stop your own hall before running the browser tests. A running hall on 4100 would be reused, and the test's throwaway accounts would land in your real `guildhall` database.

### CI is the same command on a machine that has nothing of yours on it

Continuous integration means a machine you do not own runs your test commands on every push and every pull request, and reports the result next to the commit. GitHub Actions is the version built into the site your repos already live on. A workflow is a YAML file under `.github/workflows/`. It names the events that trigger it, the jobs to run, and for each job a fresh virtual machine, the steps to check out the code, install Node, install dependencies, and run the tests. The machine starts empty. It has no `.env`, no `node_modules`, no MongoDB, and no idea what port your hall uses. Everything it needs has to be in the repository or in the workflow.

Three pieces make the run reproducible. `npm ci` installs exactly the versions in `package-lock.json`, and fails if the lockfile and `package.json` disagree, which is what you want from a machine whose job is to notice drift. A `services` block starts a MongoDB container next to the job, reachable at `127.0.0.1:27017`, the same address `.env.test` already names. And `working-directory` tells every `run` step which folder to work in, because `hall-api` and `hall-client` are two repositories and the job checks each one out into its own folder. Without that line, `npm ci` runs at the workspace root, finds no lockfile, and the whole job fails before a single test.

Pin the action versions, `actions/checkout@v5` and `actions/setup-node@v5` as of this writing, and the image, `mongo:8`, because a workflow that floats on `latest` can change under you on a day you changed nothing. When a step fails, the log is the evidence. Expand it, read from the first red line, and compare it with the same command on your machine. A difference between the two is the finding.

What you should be able to draw on a napkin: arrange through the API, act through the browser, assert on what a person sees. Roles and labels, never CSS paths. Await evidence, never seconds. Two servers from one config, on 4100 and 5173, against `guildhall_e2e`. A workflow that checks out, installs from the lockfile, starts MongoDB, runs `npm test`, installs a browser, runs `npx playwright test`, and keeps the report when it fails.

## The demonstration

In `~/projects/hall-api`, on `add-tests`, with Playwright installed from last session's prompt answers and the scaffold files deleted. `mongod` is running. The hall and the client are both stopped; the config starts its own copies.

Replace the generated `playwright.config.js` with this one.

```js
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

const API = 'http://localhost:4100';
const PAGE = 'http://localhost:5173';

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: PAGE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node server.js',
      port: 4100,
      reuseExistingServer: !process.env.CI,
      env: {
        MONGODB_URI: 'mongodb://127.0.0.1:27017/guildhall_e2e',
        JWT_SECRET: 'e2e-only-not-a-secret',
        PAGE_ORIGIN: PAGE,
        PORT: '4100'
      }
    },
    {
      command: 'npm run dev -- --strictPort',
      cwd: '../hall-client',
      port: 5173,
      reuseExistingServer: !process.env.CI
    }
  ]
});
```

`testDir` is `./e2e`, so Playwright never looks in `tests/`, and last session's `testPathIgnorePatterns` keeps Jest out of `e2e/`. The two runners share a repository and ignore each other's folders. One browser project keeps the run short; add Firefox and WebKit later if you want, and know that each one triples the time.

The journey file. The accessible names it uses are the ones the hall client has carried since 4-12: inputs labelled `Email` and `Password`, a button that says `Log in`, and a list of letters. If your client has no heading over the inbox, add `<h2>Inbox</h2>` now; the test is going to ask for it.

```js
// e2e/inbox.spec.js
const { test, expect } = require('@playwright/test');

const API = 'http://localhost:4100';
const PASSWORD = 'correct-horse-battery';

function idFromToken(token) {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
  return payload.sub;
}

async function signUp(request, name) {
  const email = name.toLowerCase() + '-' + Date.now() + '@example.com';
  const registered = await request.post(API + '/api/register', { data: { name, email, password: PASSWORD } });
  expect(registered.status()).toBe(201);
  const login = await request.post(API + '/api/login', { data: { email, password: PASSWORD } });
  expect(login.status()).toBe(200);
  const { token } = await login.json();
  return { name, email, token, id: idFromToken(token) };
}

test('Sera logs in and sees the letter Bran sent her', async ({ page, request }) => {
  const bran = await signUp(request, 'Bran');
  const sera = await signUp(request, 'Sera');
  const sent = await request.post(API + '/api/messages', {
    headers: { Authorization: 'Bearer ' + bran.token },
    data: { recipient: sera.id, body: 'The gate is shut.' }
  });
  expect(sent.status()).toBe(201);

  await page.goto('/');
  await page.getByLabel('Email').fill(sera.email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
  const letter = page.getByRole('listitem').filter({ hasText: 'The gate is shut.' });
  await expect(letter).toBeVisible();
  await expect(letter).toContainText('Bran');
});

test('a wrong password keeps the door shut', async ({ page, request }) => {
  const sera = await signUp(request, 'Sera');

  await page.goto('/');
  await page.getByLabel('Email').fill(sera.email);
  await page.getByLabel('Password').fill('not-the-password');
  const attempt = page.waitForResponse((res) => res.url().endsWith('/api/login'));
  await page.getByRole('button', { name: 'Log in' }).click();

  expect((await attempt).status()).toBe(401);
  await expect(page.getByRole('heading', { name: 'Inbox' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

test('a refresh keeps Sera signed in', async ({ page, request }) => {
  const sera = await signUp(request, 'Sera');

  await page.goto('/');
  await page.getByLabel('Email').fill(sera.email);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Inbox' })).toBeVisible();
});
```

The emails carry a timestamp so a second run does not collide with the first on the unique index; `guildhall_e2e` is never wiped by these tests, and that is fine, because nothing in them depends on the database being empty. The first test arranges everything through `request`, then the browser begins at `page.goto('/')`, which resolves against `baseURL`. The second test waits for the login response before asserting that the inbox did not appear, so the negative assertion cannot pass early. The third test is the `sessionStorage` rule from 4-12, checked by a machine.

```bash
npx playwright test
```

```text
Running 3 tests using 1 worker

  ✓  1 [chromium] › e2e/inbox.spec.js:21:1 › Sera logs in and sees the letter Bran sent her (2.4s)
  ✓  2 [chromium] › e2e/inbox.spec.js:40:1 › a wrong password keeps the door shut (1.1s)
  ✓  3 [chromium] › e2e/inbox.spec.js:55:1 › a refresh keeps Sera signed in (1.6s)

  3 passed (9.8s)
```

The nine seconds are mostly the two servers starting. Run it again with `npx playwright test --headed` and watch the window: the form fills itself, the button clicks itself, and the letter appears. `npx playwright test --ui` opens an inspector where you can step through each action and see the page at that moment. `npx playwright show-report` opens the HTML report from the last run, and when a test fails, the report has a trace: every action, every network request, and a screenshot at the moment of failure.

Now the sabotage round. In `hall-client`, change the inbox to render `message.sender.email` instead of `message.sender.name`. Run the suite. The first test fails on `toContainText('Bran')` with the row's actual text in the message, and the report has a screenshot of the wrong inbox. Put the name back. That is a bug the API suite cannot see, caught.

### The workflow

Start with the smallest file that runs the Jest suite on GitHub, and watch it go green before you add the browser job. It lives in `hall-api`, under `.github/workflows/test.yml`.

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, add-tests]
  pull_request:
    branches: [main]

defaults:
  run:
    working-directory: hall-api

jobs:
  api:
    runs-on: ubuntu-latest
    services:
      mongodb:
        image: mongo:8
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v5
        with:
          path: hall-api
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: hall-api/package-lock.json
      - run: npm ci
      - run: npm test
```

Read it top to bottom. It runs on a push to `main` or `add-tests` and on a pull request into `main`. Every `run` step works inside `hall-api`, because `checkout` was told to put the repository in a folder of that name, so the layout on the runner matches the layout under `~/projects` on your machine. The `services` block starts `mongo:8` and publishes 27017, which is the address in the committed `.env.test`. `setup-node` installs Node 24 and caches `node_modules` keyed on the lockfile. `npm ci` installs from the lockfile. `npm test` is the same command you type.

```bash
mkdir -p .github/workflows
git add .github/workflows/test.yml
git commit -m "Run the Jest suite on push"
git push
```

Open the repository on GitHub and click the Actions tab. A run is listed with your commit message. Click into it, then into the `api` job, and expand `npm test`. The output is the one you saw locally, ending in `Tests: 18 passed, 18 total`, with `tests connected to 127.0.0.1/guildhall_test` above it, printed by a machine in a data center that did not exist two minutes ago. Eighteen is the example suite's count: fourteen from the accounts and letters files of 7-2 and four from the pack file. If you wrote `tests/errors.test.js` for 7-2's quest, yours is 22, and it is higher again if you kept claims of your own. The check is zero failed, which Jest shows by leaving `failed` off the line. The three browser journeys from today run under `npx playwright test` and never appear in this count.

Then add the browser job. It needs both repositories, because the journey needs the client. The second `checkout` fetches `hall-client` into its own folder, so `cwd: '../hall-client'` in the Playwright config resolves the same way it does at home.

```yaml
# fragment: add under jobs: in .github/workflows/test.yml
  e2e:
    runs-on: ubuntu-latest
    needs: api
    services:
      mongodb:
        image: mongo:8
        ports:
          - 27017:27017
    steps:
      - uses: actions/checkout@v5
        with:
          path: hall-api
      - uses: actions/checkout@v5
        with:
          repository: ${{ github.repository_owner }}/hall-client
          path: hall-client
      - uses: actions/setup-node@v5
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: |
            hall-api/package-lock.json
            hall-client/package-lock.json
      - run: npm ci
      - run: npm ci
        working-directory: hall-client
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v5
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: hall-api/playwright-report/
          retention-days: 7
```

`needs: api` makes the browser job wait for the API job and skip when it is red, so a broken route does not also cost you a browser run. `playwright install --with-deps chromium` downloads the browser and the system libraries it needs on Ubuntu. GitHub sets `CI=true` on every runner, which is what flips `reuseExistingServer` off and `retries` to 1 in the config. The upload step runs even when the tests fail, because the report is most useful then; its `path` is relative to the workspace, not to `working-directory`, which only applies to `run` steps. If `hall-client` is a private repository, the second checkout needs a token with read access to it, passed as `token: ${{ secrets.HALL_CLIENT_TOKEN }}`; the GitHub docs on checking out a second repository show the exact form.

Push again. Two jobs this time, one after the other. When the second one finishes, the run's summary page lists `playwright-report` under Artifacts. Download it once, unzip it, and open `index.html` to see that it is the same report `show-report` opens locally.

### A small model you can run here

The page cannot launch a browser or a runner, so here is a small model you can run here: a trace of the journey as a list of observed events, in the order a browser test produces them, and a strict locator over a tiny page. It proves that the success assertion comes after the confirmation it depends on, that the action comes after readiness, that a missing event is visible in the trace rather than silently assumed, and that a locator matching two elements is refused. It does not prove anything about your hall or your workflow; `npx playwright test` and the Actions tab are that proof.

```js run=checkpoint-7-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

// The journey, as the events a browser test observes, in order.
const trace = ['page loaded', 'form visible', 'login clicked', 'login response 200', 'inbox heading visible', 'letter row visible'];
const index = (name) => trace.indexOf(name);

check(index('inbox heading visible') > index('login response 200'), 'Success follows confirmation');
check(index('login clicked') > index('form visible'), 'Action follows readiness');
check(index('letter row visible') > index('inbox heading visible'), 'the letter is asserted after the inbox exists');
check(index('waited 2000 ms') === -1, 'Missing evidence is visible');

// A strict locator over a tiny page: a match of two is an error, not a guess.
const nodes = [
  { role: 'heading', name: 'Inbox' },
  { role: 'button', name: 'Log in' },
  { role: 'listitem', text: 'The gate is shut. Bran' },
  { role: 'listitem', text: 'Lamp oil 3' }
];
function getByRole(role, options) {
  const matches = nodes.filter((n) => n.role === role && (!options || !options.name || n.name === options.name));
  if (matches.length !== 1) throw new Error('strict mode: ' + matches.length + ' elements match ' + role);
  return matches[0];
}
check(getByRole('button', { name: 'Log in' }).name === 'Log in', 'a unique role and name resolves to one element');
let strict = false;
try { getByRole('listitem'); } catch (err) { strict = /2 elements/.test(err.message); }
check(strict, 'a locator that matches two elements is refused');
const row = nodes.filter((n) => n.role === 'listitem' && n.text.includes('The gate is shut.'));
check(row.length === 1 && row[0].text.includes('Bran'), 'a filtered row carries the sender name');

console.log('ok: checkpoint-7-3');
```

Move `'login response 200'` to the end of the trace and run again. The first check fails: the heading was asserted before the response confirmed anything. That is the flaky test, written out as data.

## Where it breaks

![](diagram:session-7-3/fig2-diagnosis)

### Flaky timing

The journey fails once every several runs because it looked for the result on a timer. The runner was slow, the timer expired, and the assertion ran against the old page. Wait for the thing you mean: the heading, the row, the response. A fixed sleep is either too short on a bad day or a tax on every good day. If you cannot name an observable condition, the test does not know what success is yet. Write that condition down before you write a sleep, and then write the condition instead. `retries: 1` on CI is a bandage for infrastructure hiccups, not a cure; the first failure's trace still deserves a look, and if the same test retries every run, it is this bug.

### Selector breaks

The test clicks `.btn.btn-primary.css-1a2b3c`, and a styling change breaks the suite even though the button still works. Select by role and accessible name, the way a person finds it: the button named Log in. A stable test id is the fallback when the accessible name is legitimately duplicated. A generated class is neither. If the test breaks when you reword the button, that is a useful break, because the words are part of the journey. If it breaks when a CSS module hash changes, it was coupled to the wrong thing. When Playwright reports `strict mode violation` and lists two matches, do not add `.first()`; look at the page and decide which element should not be there, or scope the locator with a filter that says which one you mean.

### CI differs locally

The suite passes on your laptop and fails in the Actions tab, or the other way around. The difference is the environment: a lockfile that was not committed, a `.env.test` that `.gitignore` swallowed, a client repository the job never checked out, a port the config assumed, a browser that was never installed on the runner. Read the first red line of the failing step and run the same command on your machine. Not a cousin of it, the same one: `npm ci` rather than `npm install`, `npx playwright test` rather than `--headed`. Commit the lockfile, commit `.env.test`, name the second repository in the workflow, and pin the action and image versions. Passing locally is a claim about your machine until the command and the environment match.

## Your turn

In `~/projects/hall-api`, on `add-tests`. Stop any running hall or client first; the config starts its own.

1. Confirm the Playwright install from last session: `ls e2e` prints nothing or only your own files, `tests-examples` does not exist, and `npx playwright --version` prints `Version 1.65.0` or newer.
2. Write `playwright.config.js` as shown. Run `npx playwright test` with no spec yet; the output is `Error: No tests found`, and both servers started and stopped, which you can see because nothing is left on 4100 or 5173 afterwards.
3. Open `hall-client` and check the three accessible names the journey needs: an input with `aria-label="Email"`, one with `aria-label="Password"`, a button whose text is `Log in`, a heading that says `Inbox`, and letters rendered as `<li>` items that include the sender's name. Add what is missing. These are product changes, and they are small.
4. Write `e2e/inbox.spec.js` and run `npx playwright test`. The last line is `3 passed`. Run `npx playwright test --headed` once and watch it.
5. Make the client show the sender's email instead of the name, run, and confirm the first test fails on `toContainText('Bran')`. Run `npx playwright show-report`, open the failed test, and find the screenshot. Put the name back. Save the screenshot as `wrong-sender.png`.
6. Write the `api` job of `.github/workflows/test.yml`, commit, push, and open the Actions tab. The job is green and `npm test` ends in `Tests: 18 passed, 18 total`, or your own higher count with no `failed` on the line. If it is red, read the first failing step before you change anything.
7. Add the `e2e` job, push, and wait for both. Download `playwright-report` from the run summary and open it.
8. Break the workflow on purpose: change `cache-dependency-path` to `package-lock.json` without the folder, push, and read the error `setup-node` prints about not finding the lockfile. Fix it, push, green. That red run is the one you will recognise for the rest of your career.

## The quest

![](diagram:session-7-3/fig3-evidence)

The deliverable is a green run on `add-tests` that includes both jobs, and a browser test you can explain line by line. Add one more journey of your own to `e2e/`: Sera opens her pack and sees `Lamp oil` with a quantity, after the test gives it to her through `POST /api/items/seed` and `POST /api/pack/give` with the `request` fixture. Assert on the row, not on a URL, because the hall client has no router and the URL never changes.

Evidence to keep:

- `actions-green.png`, a screenshot of the Actions tab with both jobs passing on a commit from `add-tests`.
- `actions-red.png`, the screenshot from step 8, with the failing step expanded, and one sentence in `TESTING.md` naming the cause.
- `wrong-sender.png` from step 5, linked from `TESTING.md` under a heading that says what the API suite could not have seen.
- `.github/workflows/test.yml` with both jobs, and `playwright.config.js` with the two-entry `webServer` array, committed.
- The `playwright-report` artifact downloaded once and opened; a line in `TESTING.md` saying where to find it on a future run.

## Side quests

A trace with a screenshot at the moment of failure is observability for a test the way logs and spans are observability for a server, and the first red Actions run is the kind of return the long-return page is written for.

## Before next session

Next session is the last of the unit: you rank what could actually hurt a person using the hall, make sure each risk has a test at the cheapest layer that can catch it, run everything from a clean clone, open the pull request from `add-tests` to `main`, and write the evidence report that goes with it. Prepare the list now. Create `TESTPLAN.md` in `hall-api` with three headings, Unit, API, and Browser, and under each one list what is already tested and what you know is not. Be honest about the gaps; the next session is built on that list, and a list with no gaps is a list that was not read against the code.

Nothing is left running after today. The Actions workflow runs on GitHub's machines when you push, not on yours. The deployed hall from Unit 6 is untouched by any of this; the workflow tests a fresh copy of the code, never the live process. The next session starts in `~/projects/hall-api` on `add-tests` with `TESTPLAN.md` open.
