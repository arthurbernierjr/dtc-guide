---
editorial: true
title: Warding the Kingdom
subtitle: Add Payments and AI to Your Capstone
hook: "Today the capstone goes live. You write the security audit with a piece of evidence beside every line, put a second limiter and an off switch on the AI routes, and deploy the API, the page, and a database to Railway so that from next session on the capstone is a URL and not a folder."
read: 60
artifact: "docs/security-audit.md with evidence beside every Must, a rate-limited and switchable AI feature, and the capstone's first deploy at a live Railway URL with a production Stripe webhook"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://docs.railway.com/guides/cli
  - https://docs.railway.com/guides/variables
  - https://docs.railway.com/guides/public-networking
  - https://docs.stripe.com/webhooks
  - https://owasp.org/Top10/2025/
  - https://www.mongodb.com/docs/atlas/getting-started/
say:
  - "A tick is a claim. The evidence is the control."
  - "The paid feature is enforced where the work happens, not where the button is drawn."
  - "The assistant is a feature; the process is the product. One can be down while the other is up."
---

## The hook

Three sessions ago the capstone was a folder of documents. It now registers users through a validated chain, takes a test payment through a verified webhook, and summarizes a document through a budgeted call to a model. None of it is on the internet. Unit 11 starts with the sentence "open your capstone's live URL," so today ends with one.

Before the deploy comes the audit. Not a checklist of ticks, which is a list of claims, but a page where every line points at the curl, the log line, or the command output that proves it. The audit is also where you decide what blocks a release and what does not: an unsigned webhook that could mark orders paid blocks; a missing favicon does not. Then two small edits to the AI routes, a limiter per user and a switch you can flip without a deploy, because the provider will have a bad hour one day and the rest of your product should not share it. Then `railway init`, `railway up`, a database, variables, a domain, and a webhook endpoint in Stripe's dashboard that has its own signing secret. By the end of the session `curl -i https://YOUR-APP.up.railway.app/api/health` answers 200 with Helmet's headers, and a test card bought on the live page flips an order in a database you do not run.

> *A ward is not a wall you built once. It is a list of doors, and beside each door, the proof that you tried it.*

## The idea

### Inventory first

List what the capstone protects and every operation that touches it, with the actor who is allowed. User records: the owner. Password hashes: nobody, ever, in any response. The JWT secret, the Stripe keys, the provider key: the server process, read from the environment. Orders: the owner reads status, only the webhook writes it. The premium route: paid accounts. The AI routes: paid accounts, under budget, under the limiter, while the switch is on. That table is the inventory, and it is the first section of the audit. Every later line in the audit points back at a row of it.

Four actors are enough to exercise every row: an anonymous visitor with no token, a free account, a paid account, and a second account that is also paid but owns nothing of the first's. For each protected operation, write the status each actor should get before you send a single request. Then send the requests with curl, not with the page, so that a button the page hides cannot hide a missing check. The [quick reference](/security/web-vulns-quick-reference/) has the names for what you are looking for, and the [OWASP list](https://owasp.org/Top10/2025/) is the order to walk the rows in.

### Exercise the combinations

Each integration works alone. The failures live where they meet. A webhook retried after the account was deleted. A model timeout after the budget was reserved and before it was settled. A payment that completes while the AI switch is off. Draw those transitions and decide which part of the code owns the final state. For the capstone's three features the answers are short, and they are in the code you wrote: the webhook answers 200 and logs "no order" when it finds nothing; the reservation stays standing when the call does not settle; the switch answers 503 and the order flips regardless.

For payments, exercise the invalid signature, the duplicate, the unpaid completion, and the unknown order. For the AI, exercise the oversized input, the exhausted budget, the provider refusing connections, and the stream cut off halfway. For access, exercise every protected route as the anonymous visitor and as the second account. After each failure, look at the state after the visible error: is the event still retryable, is the reservation still there, was a partial record written. The evidence is what the database says, not what the page said.

### A switch is part of the boundary

The assistant is a feature. The process is the product. If the provider is slow, a request to the summary route should fail in twenty seconds with a clear line, and a request to the login route should not notice. You already have the timeout. Today you add two more controls on the AI router: a limiter keyed by `req.userId`, because an authenticated caller who is under the daily token budget can still make two hundred calls a minute, and an environment switch, `AI_ENABLED`, read at request time, so that turning the feature off is a variable change and a restart rather than a code change and a deploy. The [observability side quest](/system-design/concepts/observability/) is the reasoning for why the log line on every refusal carries the event id, the user id, or the reservation, and never the token.

### Blockers, and the rest

Write the go/no-go rule before the review, not during it. The capstone's blockers: a protected operation reachable by the wrong actor; a secret in the repository; an entitlement granted by anything other than a verified `paid` event; a paid provider call that is unbounded in size, count, or budget; a webhook accepted without a signature check. Any of those is a no. Everything else is a note in Known gaps with a reason and a session number. The point of writing the rule first is that you will be tired at the end of the session and tempted to lower it. The rule does not get tired.

### What deploy means for this app

The capstone is two folders and one database. In development that is three processes on your machine. In production it is one service on Railway that runs the API and serves the built page from the same origin, plus a MongoDB add-on Railway runs beside it. One origin means `PAGE_ORIGIN` is the service's own URL, the client's `apiBase` is empty so requests are same-origin, and Helmet's default Content-Security-Policy now governs the page, which is fine because the Vite build loads its scripts from `'self'`.

Three facts about running behind Railway's proxy. The port comes from the environment as `PORT`, which `config.js` already reads. Requests arrive with an `X-Forwarded-For` header, and the limiter from 10-1 keys on `req.ip`, so `app.set('trust proxy', 1)` is the line that makes `req.ip` the visitor and not the proxy; without it the limiter counts every visitor as one address and the library prints a warning about the header. And there is no `.env` file on the server; `node api/server.js` without `--env-file` reads the variables Railway injects, and `config.js` refuses to start until all of them are there, which is exactly the behaviour you want on the first deploy.

The webhook changes too. The `whsec_` in your `.env` belongs to the Stripe CLI's listener on your laptop. The deployed server needs an endpoint registered in the Stripe Dashboard at `https://YOUR-APP.up.railway.app/api/webhooks/stripe`, and that endpoint has its own signing secret, which goes into Railway's variables and nowhere else. Two endpoints, two secrets, one route.

The VPS from Unit 6 is the other path, and it still works: the hall's procedure in [the world gate](/path/6-4-opening-the-world-gate/), with the capstone's variables in the server's `.env` and `pm2` restarting `node api/server.js`. Railway is the path this session walks because it is the one the capstone's reference builds use, and because the first deploy of a new app should take an hour, not an evening.

The napkin: inventory the assets and the doors, exercise every door as every actor with curl, write the evidence beside the claim, decide the blockers before you are tired, put the switch and the limiter on the expensive door, and deploy the one service with its variables, its database, its domain, and its own webhook secret.

![](diagram:session-10-4/fig1-model)

## The demonstration

Stop any local server with Ctrl-C. The Railway CLI is installed from the link in last session's close and `railway login` has been run once.

The audit comes first, so that the deploy is the thing that turns its last lines green. Copy this into `docs/security-audit.md` and fill it in.

```markdown
# Security audit

Live URL: (filled in at the end of 10.4)
Last run: (date)

## Inventory
| Asset or operation | Allowed actor | Enforced by |
|---|---|---|
| user record read | owner | |
| password hash | nobody in any response | |
| order status write | webhook only | |
| GET /api/premium-feature | paid account | |
| POST /api/ai/* | paid, under budget, under limit, switch on | |

## Must (any FAIL blocks release)
| Control | Status | Evidence |
|---|---|---|
| secrets only in the environment; git history clean | | |
| every body validated; operator keys rejected | | |
| Helmet headers on every response | | |
| CORS origin is one value from the environment | | |
| login and register rate limited | | |
| webhook signature verified over the raw body | | |
| entitlement granted only by a verified paid event | | |
| duplicate event has no second effect | | |
| premium route refuses anonymous and unpaid callers | | |
| AI routes require auth, purchase, budget, and limit | | |
| model output rendered as text, never executed | | |
| provider key never leaves the server | | |

## Should
| Control | Status | Evidence |
|---|---|---|
| AI switch turns the feature off without a deploy | | |
| provider outage leaves the rest of the app working | | |
| npm audit read in api/ and client/, fixes applied without --force | | |
| error responses carry no stack traces | | |

## Known gaps
- (control, reason, the session that closes it)

## Release decision
- GO / NO-GO, date, and the Must row that decided it if NO-GO
```

A filled Must row looks like this:

```markdown
| webhook signature verified over the raw body | PASS | CLI shows 400 on a resent event after one character of STRIPE_WEBHOOK_SECRET was changed (10.2 step 8, 2026-11-15); router mounted above express.json in api/app.js |
```

Every Evidence cell names something you can re-run. "Checked" is not evidence. A date and a step number are.

Now the two edits to `api/routes/ai.js`. The limiter keys by user, so it goes after `requireUser` has set `req.userId`, and the switch goes first, so a turned-off feature costs nothing at all:

```js
// fragment: the edits to api/routes/ai.js
const { rateLimit } = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId,
  message: { error: 'too many AI requests, wait 15 minutes' }
});

function requireAiEnabled(req, res, next) {
  if (process.env.AI_ENABLED !== 'true') {
    return res.status(503).json({ error: 'the AI feature is switched off' });
  }
  next();
}

router.use(requireAiEnabled, requireUser, requirePaid, aiLimiter);
```

`AI_ENABLED=true` goes into `.env`. It is read from `process.env` on every request on purpose, rather than copied into `config.js` at startup, so that a later version of the switch could be flipped without a restart; today a restart is fine. Start the API with `AI_ENABLED=false`, send Bran's summarize request, and the status is `503` with `the AI feature is switched off`. Send the login request: `200`. That is the second diagnosis, exercised. Set it back to `true`.

The outage test is one variable too. The SDK reads `ANTHROPIC_BASE_URL` when it is set, so start the API once with `ANTHROPIC_BASE_URL=http://127.0.0.1:9` in the environment, a port that refuses connections, and send the summarize request. Within a moment: `502` and `summary unavailable`, and the API terminal says `ai summarize failed:` with a connection error. Then `/api/premium-feature` with the same token: `200`. The page, if you open it, shows `Access: paid`, the panel, and a status of `failed` after you press Summarize; nothing else on the page knows. `db.aiusages.find()` shows the reservation still standing, because the call did not settle, which is the honest number. Unset the variable and restart.

Now the production shape. Three files at the repo root. `package.json` makes the root a project Railway can build and start:

```json
{
  "name": "capstone",
  "private": true,
  "engines": { "node": ">=24" },
  "scripts": {
    "build": "npm ci --prefix api && npm ci --prefix client && npm run build --prefix client",
    "start": "node api/server.js"
  }
}
```

Run `npm install` once at the root so a `package-lock.json` exists beside it; there are no dependencies, and the file tells the builder which package manager you use. `railway.json` names the build and start commands and the health check, so none of it depends on a guess:

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

`client/.env.production` makes the built page talk to its own origin:

```dotenv
VITE_API_BASE=
```

An empty value is the string `''`, and `api.js` from 10-1 uses `??`, which keeps an empty string and only falls back to `localhost:3000` when the variable is absent, which it is in development. Then two edits to `api/app.js`: trust the proxy, and serve the built page when it exists, after the API routes and before the 404:

```js
// fragment: the edits to api/app.js
const path = require('node:path');
const fs = require('node:fs');

app.set('trust proxy', 1);

// ...every /api route...

const distDir = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: 'no such path' });
});
```

`/{*splat}` is Express 5's spelling of "any path." The guard sends API misses on to the JSON 404 and everything else to the page, so `/?checkout=success` on the live site loads the app. Check it locally once: `cd client && npm run build`, then start the API, and `http://localhost:3000/` serves the page from the same port as the API. Delete `client/dist` afterwards, or leave it; `.gitignore` already excludes it, and the server builds its own.

Commit all of it. Then, from the repo root, the deploy. The first command creates a project and links the folder to it:

```bash
cd ~/projects/<capstone-name>
railway init
```

It asks for a project name; use the folder name. Then the first deploy:

```bash
railway up
```

It uploads the folder, builds with the two commands from `railway.json`, and starts. The build log shows `npm ci` in `api/` and `client/`, then Vite's `✓ built in` line. The deploy log then shows `FATAL: missing environment variable MONGODB_URI` and the service restarts, and that is correct: it is `config.js` refusing to run without its secrets, in public, the same way it did on your laptop. Add the database and the domain:

```bash
railway add --database mongo --json
railway domain
```

The first prints the new database service's id and name. The second prints `https://<something>.up.railway.app`; copy it. Open the project in the browser with `railway open` and click the database service's Variables tab: the connection URL is named `MONGO_URL` and has no database name on the end. Now set every variable the API needs on the app service in one command. The `${{MongoDB.MONGO_URL}}` form is a reference to the other service's variable, resolved by Railway, so the password never passes through your shell history:

```bash
railway variable set \
  'MONGODB_URI=${{MongoDB.MONGO_URL}}/<capstone-name>' \
  JWT_SECRET=paste-a-new-openssl-rand-hex-32 \
  PAGE_ORIGIN=https://<something>.up.railway.app \
  STRIPE_SECRET_KEY=sk_test_paste-yours \
  STRIPE_WEBHOOK_SECRET=pending \
  STRIPE_PRICE_ID=price_paste-yours \
  ANTHROPIC_API_KEY=sk-ant-paste-yours \
  AI_MODEL=claude-haiku-5-5 \
  AI_DAILY_TOKEN_BUDGET=50000 \
  AI_ENABLED=true \
  NODE_ENV=production
```

A new `JWT_SECRET`, not the one from your laptop; the two environments do not share tokens. `STRIPE_WEBHOOK_SECRET=pending` is a placeholder that lets the process start; the real value comes in a minute. Changing variables triggers a redeploy. Watch it:

```bash
railway logs
```

The line you want is `listening on` followed by the port Railway chose. Then, from your laptop:

```bash
curl -i https://<something>.up.railway.app/api/health
```

`200`, `{"ok":true}`, and `X-Content-Type-Options: nosniff` in the headers. The barrier is on the internet.

If you would rather use MongoDB Atlas than Railway's add-on, the [getting started page](https://www.mongodb.com/docs/atlas/getting-started/) walks through a free cluster; its connection string starts `mongodb+srv://` and is the whole `MONGODB_URI`, with the database name in the path. Allow access from anywhere in Atlas's network list for a first deploy, because Railway's outbound addresses change, and write that choice into Known gaps.

The webhook is the last variable. In the Stripe Dashboard, in test mode, open Developers and then Webhooks, and add an endpoint; the Dashboard may call it a destination. The URL is `https://<something>.up.railway.app/api/webhooks/stripe`. Select the two events, `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Stripe shows the endpoint's signing secret once. Then:

```bash
railway variable set STRIPE_WEBHOOK_SECRET=whsec_paste-the-endpoint-secret
```

Another redeploy, another `listening on` line. Now the whole flow on the live site. Open the URL, register a new account, log in, press Buy access, pay with `4242 4242 4242 4242`, and come back to `/?checkout=success`. The page says `Access: paid`. `railway logs` shows `webhook evt_...: order ... paid=1`. In the Stripe Dashboard, the endpoint's page shows the delivery with a `200`. Paste a paragraph into the panel and press Stream. Words arrive. Fill in the live URL at the top of `docs/security-audit.md`, and the last two Must rows now have evidence from a server you do not run.

Here is a small model you can run here. It models the release gate: a list of Must controls, each with a status and an evidence string, and the rule that a tick without evidence is not a pass and that one failing Must blocks the release. It proves the rule can be stated. It does not prove any control; the audit's Evidence column and the live curl are where those are proven.

```js run=checkpoint-10-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function reviewRelease(musts) {
  const blockers = [];
  for (const row of musts) {
    const evidenced = typeof row.evidence === 'string' && row.evidence.trim().length > 0;
    if (row.status === 'PASS' && evidenced) continue;
    const reason = row.status !== 'PASS'
      ? row.control + ': ' + row.status
      : row.control + ': PASS with no evidence';
    blockers.push(reason);
  }
  return { go: blockers.length === 0, blockers: blockers };
}

const audit = [
  { control: 'ownership enforced on every protected route', status: 'PASS', evidence: 'curl as Sera on Bran order id: 403 (10.4 step 3, 2026-11-19)' },
  { control: 'webhook signature verified over the raw body', status: 'PASS', evidence: 'CLI 400 after one changed character (10.2 step 8)' },
  { control: 'duplicate event has no second effect', status: 'FAIL', evidence: 'countDocuments was 2 after resend' },
  { control: 'AI routes bounded by budget and limiter', status: 'PASS', evidence: '' }
];

const review = reviewRelease(audit);
check(review.go === false && review.blockers.some(function (b) { return b.indexOf('duplicate event') === 0; }), 'A critical integration gap blocks release');
check(review.blockers.length === 2 && review.blockers[1] === 'AI routes bounded by budget and limiter: PASS with no evidence', 'Explain the rejected or incomplete case');
check(review.blockers.indexOf('ownership enforced on every protected route: PASS') === -1, 'a pass with evidence is not a blocker');

const fixed = audit.map(function (row) {
  if (row.control.indexOf('duplicate') === 0) return { control: row.control, status: 'PASS', evidence: 'countDocuments 1 before and after restart (10.4 step 3)' };
  if (row.control.indexOf('AI routes') === 0) return { control: row.control, status: 'PASS', evidence: '429 with AI_DAILY_TOKEN_BUDGET=900; 429 on the 31st call' };
  return row;
});
check(reviewRelease(fixed).go === true, 'every Must passing with evidence is a go');

function actorMatrix(route, actor) {
  const table = {
    'GET /api/premium-feature': { anonymous: 401, free: 403, paid: 200, otherPaid: 200 },
    'GET /api/orders/:id': { anonymous: 401, free: 404, paid: 200, otherPaid: 404 }
  };
  return table[route][actor];
}
check(actorMatrix('GET /api/premium-feature', 'free') === 403 && actorMatrix('GET /api/orders/:id', 'otherPaid') === 404, 'the matrix states the expected status before the request is sent');

console.log('ok: checkpoint-10-4');
```

## Where it breaks

![](diagram:session-10-4/fig2-diagnosis)

### Paid feature bypassed

The page hides the panel for unpaid accounts, and `POST /api/ai/summarize` still answers Sera, because `requirePaid` was on the premium route and not on the AI router. The check lives where the work happens, next to the operation, not in the component that draws the button. Call every paid route with an unpaid token and a curl command, from the terminal, and expect 403 from each. A hidden button is invisible to curl, to a replayed request, and to the second client somebody writes against your API next year. They see the route.

The same shape with a different costume: an order marked paid by anything other than the webhook. If a success page, an admin shortcut, or a seed script can write `status: 'paid'`, the gate has a second key. Search the API for the string `'paid'` and confirm the only write is in `routes/webhooks.js`, after `constructEvent`.

### AI outage blocks core product

The provider timed out and the whole page went blank, or the login route hung behind the same failure. The assistant is a feature, not the process. Give the call a time limit, which `timeout: 20000` on the client is; catch its failure and answer a clear 502 on that route alone; keep the switch so the route can be turned off without a deploy. Test it by pointing the client at a port that refuses connections, `ANTHROPIC_BASE_URL=http://127.0.0.1:9`, not by hoping the provider stays up through the demo. Then look at state after the failure: the reservation is still standing, no partial summary was saved, and `/api/premium-feature` still answers 200.

### Checklist has no evidence

The audit is all PASS and no cell says how. A tick is a claim. Attach the evidence: the curl and its status, the log line, the `countDocuments` output, the date. A claim you cannot re-run is a memory, and memories are what you will trust during the next incident unless you wrote the command down. When you show the audit to anyone, open one piece of evidence rather than scrolling the table. The table is the contents page. The evidence is the control.

## Your turn

Ward the kingdom from `~/projects/<capstone-name>`. The Railway CLI is logged in; the Stripe Dashboard is in test mode; nothing local is running.

1. Write `docs/security-audit.md` from the template. Fill the Inventory from your routes and the Must rows from the evidence you already have in `docs/threat-model.md`, `docs/payments.md`, and `docs/ai-feature.md`. Leave the live URL blank.
2. Add `aiLimiter` and `requireAiEnabled` to `routes/ai.js` and `AI_ENABLED=true` to `.env`. With `AI_ENABLED=false`, summarize is `503` and login is `200`. With `true`, the thirty-first summarize call in fifteen minutes is `429`.
3. Start with `ANTHROPIC_BASE_URL=http://127.0.0.1:9`. Summarize is `502` within a moment; premium is `200`; the reservation row is still there.
4. Run the actor matrix: anonymous, Sera, Bran, and a second paid account against every `/api` route, with curl. Write the expected status before each call and the observed status beside it in the audit.
5. Add the root `package.json`, `railway.json`, `client/.env.production`, `trust proxy`, and the static block. Build the client locally once and confirm `http://localhost:3000/` serves the page. Commit.
6. `railway init`, then `railway up`. The deploy log shows `FATAL: missing environment variable MONGODB_URI`. `railway add --database mongo --json`, then `railway domain`.
7. `railway variable set` with every variable, a fresh `JWT_SECRET`, and `STRIPE_WEBHOOK_SECRET=pending`. `railway logs` shows `listening on`. `curl -i https://<your-domain>/api/health` is `200` with `X-Content-Type-Options: nosniff`.
8. Create the Stripe endpoint for `https://<your-domain>/api/webhooks/stripe`, set its secret, and buy access on the live site with the test card. `railway logs` shows `paid=1`; the page shows `Access: paid`; the panel streams.
9. Fill in the live URL, the last run date, and the release decision in the audit. Commit and push.

If step 7 shows `mongo connect failed`, open the database service's Variables tab and compare `MONGO_URL` with what you appended; the database name goes before any `?` in the URL. If step 8 shows `400` on the endpoint page in Stripe, the variable still says `pending` or holds the CLI's secret instead of the endpoint's.

## The quest

![](diagram:session-10-4/fig3-evidence)

The deliverable is `docs/security-audit.md`, complete, with the live URL at the top and a release decision at the bottom, committed and pushed. Every Must row has a status and an evidence cell that names a command, a step number, and a date. Known gaps lists what is not done with the session that does it: refunds and `async_payment_failed`, a limiter store shared across processes, Atlas's open network list if you chose Atlas, and the tests Unit 12 will add around the three features.

- The live URL, and the `curl -i` of `/api/health` against it showing `200` and Helmet's headers.
- The `railway logs` line `webhook evt_...: order ... paid=1` from a purchase on the live site.
- The Stripe endpoint page showing one delivery with `200`.
- The actor matrix for every `/api` route, expected and observed.
- The `503` from `AI_ENABLED=false` and the `502` from the refused port, each beside a `200` from login or premium in the same run.
- The release decision line, dated.

## Side quests

The quick reference is the glossary for the audit's rows, idempotency is the Must row about duplicates said properly, and observability is what turns `railway logs` from a scroll into a question you can ask.

## Before next session

Unit 11 is about money of a different kind: who funds the thing you just shipped, and on what terms. Next session opens with your capstone's live URL in a browser and the product spec beside it, and asks what milestone the next ninety days should reach and what it costs to get there. Reread `docs/product-spec.md` tonight with the live site open, and note every place the spec promises something the site does not do yet; that list is the start of the milestone.

One thing stays running between sessions, on purpose: the Railway deployment. It is a server now, and it stays up without your laptop. Stop the local API and client with Ctrl-C. The Stripe endpoint stays registered, in test mode; nothing goes live with real cards until you decide it does, and that decision is not in this unit.
