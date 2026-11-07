---
editorial: true
title: Sprint 3 — Harden
subtitle: Testing, Security, and Deployment
hook: "A tested release candidate with a security review and deployment recovery drill. Freeze a known revision for review."
read: 60
artifact: "A tested release candidate with a security review and deployment recovery drill"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://owasp.org/Top10/2025/
  - https://playwright.dev/docs/best-practices
say:
  - "Candidate: Freeze a known revision for review."
  - "Harden: Exercise risks and fix reproducible failures."
  - "Recover: Verify deployment, backups, and rollback."
---

## The hook

Your product works. Every feature, every flow, every page. You have a functional full stack application. Now the question is: how do you make it bulletproof? How do you take it from "it works on my machine" to "it works on the internet for anyone, securely, reliably, under load"?

Sprint 3 is about three things: test it, secure it, deploy it. You are going to write tests that prove your app works the way you think it does. You are going to harden it against the OWASP Top 10 vulnerabilities you learned about in Unit 10. And you are going to push it to a real server with HTTPS so that anyone on the planet can type a URL and use your product. This is the session where your app becomes real. Not "localhost real." Internet real.

Think of this as forging armor. Your product is the weapon you have been crafting across four sprints. The tests are the chain mail that catches bugs before they reach your users. The security measures are the ward spells that keep attackers out. And deployment is planting your flag on the mountaintop so the whole world can see what you built. Let's forge the armor.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Evaluate and harden an application through testing, security review, and production deployment
**You will:**
- Write meaningful unit, integration, and end-to-end tests using Jest, Supertest, and Playwright
- Conduct a security audit implementing input validation, rate limiting, security headers, CORS configuration, and secrets management
- Deploy the application to a production environment with HTTPS, process management, and environment variable configuration
- Identify and fix bugs, edge cases, and UI inconsistencies through systematic quality assurance

**You will be able to:**
- Write and run a test suite with at least 5 passing tests covering critical user flows
- Apply Helmet.js, express-rate-limit, and input validation to protect against OWASP Top 10 vulnerabilities
- Deploy a full stack application to a VPS, Vercel, or Railway with HTTPS and a custom domain
- Perform a systematic bug hunt and polish pass to bring the application to presentation quality

---

**Sprint Review: Demo Your Functional App**

**Key Points:**
- Click the whole path on the deployed URL before you change anything
- Focus on: does the core flow work? Can a user actually USE this product?
- Celebrate: "You have a working full stack app. Most people never get here."
- Sprint 3 is about making it bulletproof and putting it on the internet

**Sprint 3 Planning**

**Key Points:**
- Today's three missions: Test it. Secure it. Deploy it.
- Review your Sprint 3 backlog
- Prioritize: deployment is the minimum. Tests and security are what separate a toy from a product.

**Common Misconceptions:**
- "I do not have time to write tests." You do not have time NOT to write tests. Even 5 passing tests give you confidence and demonstrate professionalism.
- "Security is for big companies." Attackers scan every public URL. Your app will be probed within hours of deployment.
- "I will deploy later." Deployment is non-negotiable for demo day. If it is not on the internet, it is not a product.

---

![](diagram:session-12-3/fig1-model)

### Freeze the candidate before judging it

Identify the revision under review and stop adding optional features to it. A moving target makes test evidence ambiguous: a passing run from yesterday may not describe today's code. Keep necessary fixes small and rerun the checks affected by each fix. Record the final candidate identifier in the release packet so reviewers can connect code, build, and evidence.

Use the risk-based test plan from Unit 7. Cover the core calculation or transformation with unit tests, route validation and ownership with integration tests, and the main user journey with a browser test. Add manual checks where automation does not answer the question. Do not inflate the report by counting many assertions that all exercise the same behavior.

### Investigate failures at the correct layer

A timeout in a browser test may reveal a slow dependency, an unstable locator, an unawaited transition, or an actual application bug. Preserve the trace and diagnose before adding a longer sleep. A database failure may reveal configuration, connection lifecycle, or invalid data. A reproducible defect report names the environment, fixture, steps, expected result, and observed result.

Prioritize defects by their effect on the user and system. Data loss, unauthorized access, exposed secrets, and broken core actions are release blockers. A minor visual inconsistency can be tracked without pretending it has the same severity. Make the release decision explicit and keep unresolved issues visible. A deadline does not change the behavior of a vulnerability.

### Review security through operations

Use two accounts to test ownership. Attempt to set fields the client normally hides. Verify that invalid tokens and expired sessions fail predictably. Inspect public assets for secrets and confirm server logs do not print credentials. Check that paid or privileged operations enforce their rules on the server. Headers and dependency scans help, but they do not replace these business-logic checks.

Review deployment configuration with secrets redacted. Confirm internal services are not unnecessarily exposed, required environment variables are present, and the application runs with appropriate permissions. Verify HTTPS and certificate renewal separately from local tests. A secure local configuration does not prove the deployed host has the same boundaries.

### Rehearse recovery with disposable data

Restore a backup into a separate disposable database and check representative records. Do not overwrite the active application database as a rehearsal. Record the backup's age and the amount of data that could be lost under the chosen recovery policy. A backup file existing on disk is not the same as a successful restore.

Exercise a code rollback using a harmless revision change and confirm the public journey afterward. Explain how schema changes affect rollback. If a migration cannot be reversed safely, document the forward recovery plan. The final packet includes test results, security findings, deployment smoke evidence, and recovery instructions. Any unavailable toolchain or external-service check remains explicitly pending for manual execution.

## The demonstration

**Live Coding Walkthrough 1: Writing Tests**

**Setup:** Open a working Express app with models and routes. Have Jest and Supertest installed.

**Steps:**
1. Set up test directory structure:
```
tests/
├── unit/
│   └── models/
│       └── user.test.js
├── integration/
│   └── routes/
│       └── resources.test.js
└── e2e/
    └── userFlow.spec.js
```
2. Write 2 unit tests for a model method or utility function (Jest)
3. Write 2 integration tests for API endpoints (Supertest)
4. Write 1 E2E test for a critical user flow (Playwright)
5. Run all tests and confirm they pass

**Where you should be:** You see the full test setup process and understand the difference between unit, integration, and E2E tests in the context of their own apps.

**Live Coding Walkthrough 2: Security Review and Deployment**

**Setup:** Show security packages being installed and configured.

**Steps:**
1. Install and configure Helmet:
```javascript
const helmet = require('helmet');
app.use(helmet());
```
2. Add rate limiting:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
```
3. Quick review of the security checklist: input validation, secrets management, CORS, XSS prevention, NoSQL injection prevention

**Where you should be:** You understand the minimal security configuration required for production.

**Watch for this:**
- If the tests will not start, fix the setup before you write another assertion. That is the usual blocker.
- Follow the official deploy guide for the platform you actually chose.
- Deployment is where most problems happen. Be prepared to troubleshoot environment variables, build scripts, and database connections.

Take ten minutes. *(overlap with walkthrough end; adjust as needed)*

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-12-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const evidence = [{revision: 'r2', check: 'unit', passed: true}, {revision: 'r1', check: 'browser', passed: true}];
const required = ['unit', 'browser'];
const complete = required.every(name => evidence.some(e => e.revision === 'r2' && e.check === name && e.passed));
check(!complete, 'Passing evidence from another revision does not qualify the candidate');
console.log('ok: checkpoint-12-3');
```

## Where it breaks

![](diagram:session-12-3/fig2-diagnosis)

### Tests target a different revision

The report is green and the deploy is a newer commit, or an older one, than the report. You tested a working tree with local changes and deployed what was on the branch. Record the commit id in the test output and deploy that id. A report that does not name its revision is a rumor about some other tree. When a later failure shows up, you need to know whether the test ever saw the code that is running.

### Security review only checks headers

Helmet is on, the headers look right, and any logged-in user can still read another user's record. Headers matter and they are the easy part to screenshot. The review has to try the business rules: a second account, a direct request, a missing owner check, an id in the URL that is not yours. Write down one request you sent and the status you got back. A header dump with no attempted abuse is a configuration check, not a security review.

### Backup assumed usable

You have a backup job and you have never restored it. The dump is empty, or it is from a version you cannot read, or the restore instructions skip a step that lived in your head. Restore into a disposable database and read a row back. Time the restore. Write the command down. A backup you have not restored is a file you hope is a backup. The day you need it is a bad day to learn the command.

## Your turn

**Guided Practice 1: The Test Forge**

**Prompt:** Write a meaningful test suite for your capstone.

**Instructions:**
1. Create the test directory structure (unit, integration, e2e)
2. Write 2 unit tests for a model method or utility function
3. Write 2 integration tests for API endpoints using Supertest
4. Write 1 E2E test for your most important user flow using Playwright
5. Run all tests and make sure they pass

**Success Criteria:** `npm test` runs without failures. At least 5 tests pass.
**Time:** 30 minutes

**Checkpoints:**
- At 10 minutes: test directory structure created and at least one test file exists
- At 20 minutes: unit tests and at least one integration test passing
- At 30 minutes: all 5 tests passing when running `npm test`

**Guided Practice 2: The Security Audit**

**Prompt:** Harden your application against common attacks.

**Instructions:**
1. Install and configure Helmet.js
2. Add rate limiting to your API routes
3. Review every form and API endpoint for input validation
4. Verify that no secrets are committed to GitHub (check .env, check git log)
5. Set CORS to only allow your frontend domain in production

**Success Criteria:** Helmet headers visible in browser DevTools. Rate limiting active. No secrets in git history.
**Time:** 25 minutes

**Checkpoints:**
- At 10 minutes: Helmet and rate-limit packages installed and configured
- At 20 minutes: input validation added to at least one critical endpoint
- At 25 minutes: CORS configured and secrets verified clean

**Guided Practice 3: The Launch**

**Prompt:** Deploy your app and verify it works in production.

**Instructions:**

Option A: Deploy to VPS (using Unit 6 skills)
1. SSH into your server
2. Pull latest code from GitHub
3. Install dependencies
4. Set up environment variables on the server
5. Configure Nginx reverse proxy
6. Set up PM2 for process management
7. Configure SSL with Let's Encrypt

Option B: Deploy to Vercel/Railway (for simpler apps)
1. Connect GitHub repository
2. Configure environment variables
3. Deploy with one click
4. Set up custom domain

**After deployment:**
1. Open the deployed URL in a browser
2. Run through the complete user flow on the live version
3. Share the URL with a classmate and have them test it

**Success Criteria:** App is live at a real URL. All features work in production. Someone else can use it.
**Time:** 35 minutes

**Checkpoints:**
- At 15 minutes: deployment initiated and environment variables set
- At 25 minutes: app accessible at deployment URL
- At 35 minutes: core user flow tested and verified in production

Take ten minutes.

---

## The quest

**Independent Lab: Stripe, LLM, Domain, and Final Integration**

**Objectives:**
- Integrate Stripe payments and/or LLM features (if applicable)
- Configure custom domain with HTTPS
- Complete any remaining testing or security tasks

**Requirements:**
1. If your app has payments: integrate Stripe (Unit 10 patterns)
   - Stripe Checkout or Payment Intents
   - Test with Stripe test mode keys
   - Webhook for payment confirmation (if needed)
2. If your app has AI features: integrate LLM API (Unit 10 patterns)
   - Server-side API calls only (never expose API keys to frontend)
   - Cost control (set max tokens, rate limit AI endpoints)
   - Graceful fallback if API is unavailable
3. If neither applies: use this time on additional features or polish
4. Point your custom domain to your deployed app (if applicable)
5. Verify HTTPS is working (green lock in browser)
6. Test the full URL: does yourapp.com load your product?

**Hints:**
- For Stripe, use test mode keys during development. Never use live keys until you are certain the flow works.
- For LLM integration, set sensible max_tokens limits to avoid runaway costs.
- If no custom domain, ensure the deployment URL works perfectly.

**Stretch Goals:**
- Set up a CI/CD pipeline (GitHub Actions) to run tests on every push
- Add monitoring or logging (basic error tracking)
- Set up a staging environment separate from production
- Add database backups

**Submission:** Deployed URL, plus screenshot of passing tests

**End-of-Sprint Review**
- Status check: Is your app deployed? Can you share a URL?
- If YES: you have a live product on the internet. Let that sink in.
- If NO: tonight's homework is to get deployed. This is non-negotiable for demo day.
- Commit and push everything
- Preview Sprint 4: "Tomorrow we polish, rehearse, and prepare to present. Demo day is next session."

### Review the artifact

Your deliverable is **A tested release candidate with a security review and deployment recovery drill**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-12-3/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Sessions 12.1 and 12.2 completed. Core product is functional (all features working end to end). Deployment environment ready (VPS from Unit 6, or Vercel/Railway account). Sprint 2 homework finished.
**Materials:** Working capstone repo, Jest/Supertest/Playwright installed (or ready to install), Helmet.js and express-rate-limit packages, deployment platform credentials, SSL certificate tools, custom domain DNS access

**Assignment: Sprint 3 Continuation**
- **Objective:** Your app should be deployed, tested, and secured by the start of Sprint 4.
- **Tasks:**
  1. Ensure deployment is stable (app stays up, no crashes)
  2. Add any remaining tests
  3. Fix any security issues identified during the audit
  4. Complete Stripe/LLM integration if applicable
  5. Push all changes to GitHub and redeploy
- **Submission:** Deployed URL, plus screenshot of passing tests
- **Time Estimate:** 3-4 hours
- **Due:** Before Session 12.4

**Stretch Goals (Optional):**
- Set up a CI/CD pipeline (GitHub Actions) to run tests on every push
- Add monitoring or logging (basic error tracking)
- Set up a staging environment separate from production
- Add database backups

---

### Manual verification and further reading

- [Official reference 1](https://owasp.org/Top10/2025/)
- [Official reference 2](https://playwright.dev/docs/best-practices)
