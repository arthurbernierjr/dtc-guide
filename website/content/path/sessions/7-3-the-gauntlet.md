---
editorial: true
title: The Gauntlet
subtitle: Playwright, E2E Testing, and CI Basics
hook: "A browser test for a core journey and a CI workflow that retains failure evidence. Describe the user-visible goal."
read: 60
artifact: "A browser test for a core journey and a CI workflow that retains failure evidence"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://playwright.dev/docs/best-practices
  - https://docs.github.com/en/actions
say:
  - "Journey: Describe the user-visible goal."
  - "Browser: Use accessible locators and awaited assertions."
  - "Pipeline: Run reproducibly and retain diagnostic artifacts."
---

## The hook

Unit tests check individual functions. Integration tests check API routes. But nobody uses your API directly. Users use your UI. They click buttons, fill out forms, navigate between pages. If your button does not actually submit the form, or your login page does not actually redirect to the dashboard, or your delete button does not actually remove the item from the list, your users will find out before you do.

End-to-end tests simulate a REAL user in a REAL browser. They are the closest thing to hiring someone to manually test your app, except they run in seconds and never get tired. Today you learn Playwright, Microsoft's modern browser automation framework, and then you set up a CI pipeline with GitHub Actions so that every single push to GitHub automatically runs all your tests.

Think of it this way. Unit tests are like checking that each ingredient is fresh. Integration tests are like checking that the recipe steps work. E2E tests are like actually tasting the food. And CI is like having a quality inspector who tastes every batch before it leaves the kitchen. By the end of today, you have the full stack of testing confidence.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Create end-to-end tests using Playwright that simulate real user interactions in a browser

**Enabling Objectives:**
- Install and configure Playwright with a project configuration file and browser binaries
- Write tests that navigate pages, fill forms, click buttons, and assert on page content and URLs
- Use Playwright's recommended selector strategies (role, text, label, test ID) for resilient tests
- Use Playwright debugging tools (headed mode, inspector, codegen, screenshots) to diagnose failures

**You should be able to:**
- Write at least 2 E2E tests covering authentication and CRUD flows
- Use at least 3 different user interaction methods (goto, fill, click, etc.)
- Generate test scaffolding using `npx playwright codegen`
- Debug failing E2E tests using headed mode and the Playwright inspector

- Concept 1: **What is E2E testing?** End-to-end testing simulates a real user interacting with your application in a real browser. E2E tests navigate to pages, click buttons, fill out forms, and verify that the right things appear. They test the entire system from frontend to backend to database. They are the slowest and most expensive tests, so you write fewer of them, but they provide the highest confidence that your app actually works for real users.

- Concept 2: **Why Playwright?** Playwright is a modern browser automation framework made by Microsoft. It supports Chromium, Firefox, and WebKit (the Safari engine). It has a modern async API, auto-waits for elements to be ready (no manual sleep/wait calls), and includes built-in screenshot, video, and trace recording for debugging. Alternatives include Cypress (only Chromium), Selenium (clunky API, brittle tests), and Puppeteer (Chrome only). Playwright is the modern successor with the best developer experience.

- Concept 3: **Playwright setup and configuration.**

```bash
# Install Playwright
npm init playwright@latest
# This installs @playwright/test, creates playwright.config.js,
# creates an example test, and downloads browser binaries

# Or manually:
npm install --save-dev @playwright/test
npx playwright install
```

```javascript
// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
  },
});
```

Key config options: `testDir` is where your E2E tests live (keep separate from unit/integration tests), `baseURL` is your app's URL during testing, `headless: true` runs the browser without a visible window (faster for CI), and `webServer` tells Playwright to start your dev server automatically.

- Concept 4: **Playwright selectors (best to worst).** Role selectors are best: `page.getByRole('button', { name: 'Submit' })`. Text selectors are good: `page.getByText('Welcome back')`. Label selectors work well for forms: `page.getByLabel('Email')`. Test ID selectors require adding `data-testid` attributes: `page.getByTestId('login-form')`. CSS selectors are the last resort: `page.locator('.login-form input[type="email"]')`. Prefer semantic selectors because they are more resilient to CSS class name changes.

- Concept 5: **What is CI (Continuous Integration)?** CI is the practice of automatically building and testing your code every time you push to a repository. Instead of "I pushed code, let's hope it works," CI means "I pushed code, and a robot is going to run all my tests and tell me if anything broke." GitHub Actions is GitHub's built-in CI/CD service. You create a YAML file in `.github/workflows/`, GitHub watches for events (push, pull request), spins up a fresh virtual machine, runs your commands, and reports green (pass) or red (fail).

**Key Points:**
- E2E tests should cover your most critical user flows: login, signup, the primary CRUD operation. You do not need E2E tests for every feature.
- Playwright auto-waits for elements. You rarely need manual `waitForTimeout` calls. If you find yourself adding sleeps, your selectors are probably wrong.
- The `webServer` config in Playwright is essential. It starts your dev server before tests and stops it after, so you do not have to manage the server manually.
- `npm ci` is the CI version of `npm install`. It is faster, stricter, and removes `node_modules` before installing. Always use it in CI pipelines.

**Common Misconceptions:**
- Wrong: "E2E tests should replace unit and integration tests." Correct: E2E tests are the top of the pyramid. They complement, not replace, the faster tests at the base.
- Wrong: "CI is only for big teams." Correct: Even a solo developer benefits from CI. It catches bugs you introduce accidentally and proves your tests actually run outside your local machine.

![](diagram:session-7-3/fig1-model)

### Write a journey in the user's vocabulary

Choose one complete action such as creating a quest and finding it after refresh. Use accessible roles and labels to locate controls when possible. A locator tied to a long generated CSS class reflects styling rather than intent and can break during harmless visual changes. A role-based locator also exposes missing labels and ambiguous controls that affect real users.

Keep each test focused on one outcome. It can cross several pages when the journey requires them, but it should not become a single script that tests the entire application. If login fails at the beginning of a giant script, every later feature remains unobserved. Use a documented setup strategy for authentication and keep at least one test that exercises the actual login flow.

### Wait for evidence, not an arbitrary duration

A fixed sleep assumes the application will finish within a guessed interval. It can be too short on CI and unnecessarily slow locally. Await a visible state, a response, or an assertion that retries until its condition is met. The condition should represent readiness for the next action. A page load event alone may not mean asynchronously fetched data has arrived.

Avoid hiding flakiness with unlimited retries. A retry can help distinguish intermittent infrastructure problems, but the first failure still deserves diagnosis. Inspect the trace, screenshot, console output, and network activity. Determine whether the cause is shared test data, an unstable locator, an unawaited operation, or an actual product race. Record the fix at the correct layer.

### Browser state must be deliberate

A fresh context isolates cookies and storage. Reusing state can speed up tests, but it can also hide expired-session behavior or couple tests together. Create synthetic accounts and clean fixtures through a controlled test interface or setup routine. Do not use a real person's account or depend on their existing browser session. Keep credentials in the CI secret mechanism when a test environment needs them.

Test a narrow viewport and keyboard interaction for the core journey. A desktop click test cannot prove a mobile menu is usable. Check visible focus, form labels, and error feedback. Automated accessibility checks can help, but a short manual keyboard pass still catches interactions that a static rule scan may miss. Label each type of evidence honestly.

### CI turns a local habit into a shared gate

The workflow should install locked application dependencies, start required test services, run the relevant checks, and retain artifacts when something fails. Document the runtime and browser requirements for manual setup. Do not install language toolchains on the learner's behalf. In the repository, use the project's chosen CI actions and pin versions according to its maintenance policy.

Make failure output useful to someone who was not present. A trace with the failing step and fixture is more actionable than “test failed.” Keep secrets out of recordings and logs. The finished artifact includes the browser test, CI configuration, one intentionally captured failure, and a successful run after correction. This demonstrates diagnosis as well as automation.

## The demonstration

**Live Coding Walkthrough:**

**Demo 1: Your First Playwright Test**
- Write a homepage test:
```javascript
// e2e/home.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test('should display the app title', async ({ page }) => {
    await page.goto('/');

    // Check that the title or heading is visible
    await expect(page.locator('h1')).toContainText('My Awesome App');
  });

  test('should have a navigation bar with links', async ({ page }) => {
    await page.goto('/');

    // Check that nav links exist
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  test('should navigate to login page when clicking login link', async ({ page }) => {
    await page.goto('/');

    // Click the login link
    await page.click('a[href="/login"]');

    // Verify we are on the login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1, h2')).toContainText('Login');
  });
});
```
- Run it:
```bash
# Run all E2E tests
npx playwright test

# Run with visible browser (headed mode, great for debugging)
npx playwright test --headed

# Run a specific test file
npx playwright test e2e/home.spec.js

# Show the HTML test report
npx playwright show-report
```
- Explain key concepts: `page` is a browser page (like a tab), `page.goto(url)` navigates, `page.locator(selector)` finds elements, `page.click(selector)` clicks, `page.fill(selector, value)` types, `expect(locator)` has special async matchers like `toBeVisible()`, `toContainText()`, `toHaveURL()`.
- Outcome: You see a Playwright test run in a real browser and understand the API.

**Demo 2: Testing a Full User Flow**
- Test the signup, login, and CRUD flow:
```javascript
// e2e/auth.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  const testUser = {
    username: 'testplayer',
    email: `testplayer_${Date.now()}@example.com`, // Unique email each run
    password: 'SecurePass123!',
  };

  test('should register a new user', async ({ page }) => {
    await page.goto('/register');

    // Fill out the registration form
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    // Click the register button
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard or homepage
    await expect(page).toHaveURL(/.*dashboard|.*home/);

    // Verify the user is logged in
    await expect(page.locator('text=testplayer')).toBeVisible();
  });

  test('should login with existing credentials', async ({ page }) => {
    // First register
    await page.goto('/register');
    await page.fill('input[name="username"]', testUser.username);
    await page.fill('input[name="email"]', `login_${Date.now()}@example.com`);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard|.*home/);

    // Now logout
    await page.click('text=Logout');
    await expect(page).toHaveURL(/.*login|.*\//);

    // Now login
    await page.goto('/login');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard|.*home/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should stay on login page and show an error
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('.error, [role="alert"]')).toBeVisible();
  });
});
```
- Test creating and deleting an item:
```javascript
// e2e/items.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Items CRUD Flow', () => {
  // Log in before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard|.*home/);
  });

  test('should create a new item', async ({ page }) => {
    await page.click('text=New Item');
    await expect(page).toHaveURL(/.*new|.*create/);

    await page.fill('input[name="name"]', 'Playwright Potion');
    await page.fill('textarea[name="description"]', 'Created by an automated test');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Playwright Potion')).toBeVisible();
  });

  test('should delete an item', async ({ page }) => {
    // Create an item to delete
    await page.click('text=New Item');
    await page.fill('input[name="name"]', 'Doomed Item');
    await page.fill('textarea[name="description"]', 'This will be deleted');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Doomed Item')).toBeVisible();

    // Click the delete button
    await page.locator('text=Doomed Item').locator('..').locator('button.delete, button:has-text("Delete")').click();

    // Verify the item is gone
    await expect(page.locator('text=Doomed Item')).not.toBeVisible();
  });
});
```
- Show debugging tools:
```bash
# Run with browser visible
npx playwright test --headed

# Run with Playwright Inspector (step through tests interactively)
npx playwright test --debug

# Generate tests by recording your actions in a browser
npx playwright codegen http://localhost:3000
```
- Show screenshots and video:
```javascript
test('should take a screenshot on failure', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'screenshots/homepage.png' });
  await page.screenshot({ path: 'screenshots/full-page.png', fullPage: true });
});
```
- Outcome: You see complete E2E test patterns for auth and CRUD flows and know how to debug them.

**Demo 3: GitHub Actions CI Pipeline**
- Walk through creating a CI pipeline:
```yaml
# .github/workflows/test.yml
name: Run Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [22.x, 24.x]

    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit and integration tests
        run: npm test
        env:
          TEST_MONGODB_URI: mongodb://localhost:27017/myapp_test
          JWT_SECRET: test-secret-key-for-ci
          NODE_ENV: test

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test
        env:
          TEST_MONGODB_URI: mongodb://localhost:27017/myapp_test
          JWT_SECRET: test-secret-key-for-ci
          NODE_ENV: test

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results-${{ matrix.node-version }}
          path: |
            test-results/
            playwright-report/
          retention-days: 7
```
- Walk through each section: `on:` defines WHEN (on push or PR), `runs-on:` picks the VM, `strategy.matrix` runs with multiple Node versions, `services:` starts MongoDB, `steps:` defines the commands, `env:` sets environment variables, `actions/upload-artifact` saves test results for download.
- Show the simpler "minimum viable CI" version:
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '24.x'
          cache: 'npm'

      - run: npm ci
      - run: npm test
```
- Show how to set it up:
```bash
mkdir -p .github/workflows
# Create .github/workflows/test.yml with the YAML above
git add .github/workflows/test.yml
git commit -m "Add CI pipeline with GitHub Actions"
git push
```
- Explain GitHub Secrets for sensitive values (MONGODB_URI, JWT_SECRET): Settings > Secrets and variables > Actions > New repository secret. Reference in YAML with `${{ secrets.SECRET_NAME }}`.
- Outcome: You understand how to create a CI pipeline and what each part of the YAML does.

**Watch for this:**
- Demonstrate `npx playwright codegen` live. Open a browser, click around the app, and show how Playwright generates test code automatically. Run it once. Watching it write the test is the point.
- When showing CI, open a real GitHub Actions tab and walk through a real run's logs. Seeing it in context makes the YAML less abstract.
- Remember that CI machines are slower than laptops. Tests that pass locally might timeout in CI. Show how to increase timeouts.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-7-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const trace = ['page loaded', 'form visible', 'save clicked', 'request complete', 'saved visible'];
const index = name => trace.indexOf(name);
check(index('saved visible') > index('request complete'), 'Success follows confirmation');
check(index('save clicked') > index('form visible'), 'Action follows readiness');
check(index('not observed') === -1, 'Missing evidence is visible');
console.log('ok: checkpoint-7-3');
```

## Where it breaks

![](diagram:session-7-3/fig2-diagnosis)

### Flaky timing

The click test fails once every several runs because it looked for the result on a timer. The machine was slow, the timer expired, and the assertion ran against the old page. Wait for the thing you mean: the heading, the row, the URL. A fixed sleep is either too short on a bad day or a tax on every good day. If you cannot name an observable condition, the test does not know what success is yet. Write that down before you write the sleep.

### Selector breaks

The test clicks `.btn.btn-primary.css-1a2b3c`, and a styling change breaks the suite even though the button still works. Select by role and accessible name, the way a person finds it: the button named "Save". A stable test id is the fallback when the accessible name is legitimately duplicated. A generated class is neither. If the test breaks when you reword the button, that is a useful break. If it breaks when the CSS module hash changes, it was coupled to the wrong thing.

### CI differs locally

The suite passes on your laptop and fails in CI, or the other way around. The difference is the environment: another browser build, a missing system library, a timezone, a test that depends on a file you never committed, a lockfile that CI ignored. Pin the dependency versions, commit the lockfile, and write down the browser and the timezone the test assumes. Then run the same command CI runs, not a cousin of it. "Passes locally" is a claim about your machine until the command and the environment match.

## Your turn

**Guided Practice:**

**Exercise 1: Quest - E2E Test for Your App's Core Flow**
- Prompt: Write an E2E test that covers a complete user flow in your Project 2 app.
- Steps:
  1. Configure `playwright.config.js` with your app's base URL and `webServer` settings.
  2. Create `e2e/core-flow.spec.js` and write a test that navigates to your homepage, clicks to a login or registration page, fills out a form, submits the form, and verifies the result (redirect, new content, success message).
  3. Run `npx playwright test --headed` to watch it in action.
  4. BONUS: Use `npx playwright codegen http://localhost:3000` to record a test, then refine the generated code.
- Success criteria: At least one E2E test that passes, covering a meaningful user flow with at least 3 user interactions (click, fill, submit) and at least 2 assertions.
- Time: 25 minutes

**Exercise 2: Quest - Create Your GitHub Actions Workflow**
- Prompt: Create a GitHub Actions CI pipeline for your project.
- Steps:
  1. Create the `.github/workflows/` directory in your project.
  2. Create `test.yml` with the simple version of the CI config (start with just unit tests).
  3. Commit and push to GitHub.
  4. Go to the Actions tab on your GitHub repo and verify the workflow runs.
  5. If tests fail in CI, check the logs, fix the issue, push again.
- Success criteria: The GitHub Actions workflow runs when you push. You can see the results in the Actions tab.
- Time: 20 minutes

**Checkpoints:**
- Checkpoint: Playwright is configured and one test file exists
- Checkpoint: one end-to-end test passes, and you have watched it with `--headed`
- Checkpoint: `.github/workflows/test.yml` is committed

## The quest

**Independent Work:**

**Lab: Quest - E2E Tests and CI Pipeline**
- Objective: Add Playwright E2E tests and a GitHub Actions CI pipeline to your Project 2 repo.
- Requirements checklist:
  - [ ] Playwright installed and configured in Project 2 repo
  - [ ] At least 2 E2E tests: (1) a visitor can view the homepage and navigate to login, (2) a user can log in and see their dashboard
  - [ ] `.github/workflows/test.yml` that runs on push and pull requests, installs dependencies, runs `npm test`, installs Playwright browsers, and runs `npx playwright test`
  - [ ] Push everything to `add-tests` branch on GitHub
  - [ ] Verify the Actions tab shows your workflow running (take a screenshot)
  - [ ] If the workflow fails, debug and fix it
- Hints: If you get `net::ERR_CONNECTION_REFUSED`, your dev server is not running. Add the `webServer` block to `playwright.config.js`. If an element times out, use `npx playwright test --debug` to inspect selectors. If GitHub Actions says "No tests found," check that your test files match the expected pattern.
- Stretch Goals:
  - Write an E2E test for a full CRUD flow (create, verify it appears, delete, verify it is gone)
  - Add Playwright's HTML report as an artifact in your GitHub Actions workflow
  - Set up a CI status badge in your README
- Submission: GitHub repo link, branch `add-tests`. Screenshot of passing GitHub Actions run.

### Review the artifact

Your deliverable is **A browser test for a core journey and a CI workflow that retains failure evidence**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-7-3/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Install Playwright in your Project 2 repo (`npm init playwright@latest`). Read the [Playwright Getting Started guide](https://playwright.dev/docs/intro). Ensure your Project 2 frontend runs with `npm run dev` and is accessible at `http://localhost:3000` (or your configured port).
**Materials:** Project 2 codebase with Playwright installed, GitHub account with Project 2 repo, [Playwright docs](https://playwright.dev/), [GitHub Actions docs](https://docs.github.com/en/actions)

**Due before next session:**
- Complete the E2E Tests and CI Pipeline lab if you did not finish it here (estimated time: 3-4 hours)
- Ensure at least 2 E2E tests passing locally
- Ensure GitHub Actions workflow runs (even if some tests fail in CI, the setup is the learning)
- Debug any CI failures by reading workflow logs
- Review your entire Project 2 codebase and make a list of: (1) utility functions that need unit tests, (2) API routes that need integration tests, (3) user flows that need E2E tests. Bring this list to next session.

---

### Manual verification and further reading

- [Official reference 1](https://playwright.dev/docs/best-practices)
- [Official reference 2](https://docs.github.com/en/actions)
