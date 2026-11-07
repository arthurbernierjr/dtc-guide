---
editorial: true
title: Sprint 1 — Foundation
subtitle: Reconcile the plan with the app that already runs
hook: "Your capstone already exists, already runs, and is already deployed. Sprint 1 is the day you stop guessing which Must-haves are finished and prove it, one slice at a time, against the plan you wrote in Unit 8."
read: 55
artifact: "A capstone foundation with one complete vertical slice and an architecture record"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://react.dev/learn/thinking-in-react
  - https://mongoosejs.com/docs/guide.html
  - https://nodejs.org/api/cli.html#--env-fileconfig
  - https://expressjs.com/en/guide/error-handling.html
  - https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
say:
  - "A Must-have is done when it works on the deployed URL, not when the route exists."
  - "A slice is form, route, validation, persistence, and the refresh that agrees."
  - "The fixture account is the one the demo will use, so seed it on purpose."
---

## The hook

Week 20. Twenty-one weeks ago you opened a terminal for the first time. Today you open `~/projects/<capstone-name>`, and it is not empty. It has the research with its empathy map, the user stories, the sprint plan, and the product spec from Unit 8 in `docs/`, and a GitHub Projects board whose Sprint 1 column has never been emptied. It has the architecture record from 9-4. It has sign-in, a Stripe test checkout from 10-2, an AI feature from 10-3, Helmet and a rate limiter and validators from 10-1, tests shaped the way Unit 7 taught them, and it has been live on a real URL since 10-4. The final unit does not start from scratch. It finishes.

That sentence hides the real problem. You have been adding to this app for twelve weeks, and the honest answer to "which Must-haves are done?" is a shrug. Some of them work on the deployed URL. Some work on your laptop and nowhere else. Some have a route and no screen. Some have a screen that saves and then forgets on refresh. Sprint 1 turns the shrug into a table, picks the Must-have that is furthest from done, and finishes it as one complete slice: a form, a route, validation, a saved record, and the refresh that shows it. By the end of the session the plan and the app agree, and you have written down, once, what demo day actually asks of you.

> *You already crossed the river. Sprint 1 is turning around and counting the stones you stepped on.*

## The idea

Unit 8 left you with four files in `docs/`: `research.md` with the interview logs for P0 through P3 and the combined empathy map, `user-stories.md`, `sprint-plan.md`, and `product-spec.md` at v1.1, revised before this session. The spec sorts your stories into Must, Should, Could, and Won't. The sprint plan slices them into four sprints mapped to the four sessions of this unit, each with hours, capacity, and slack, and its Sprint 1 scope reads "models and seed, auth, one resource end to end, pages stubbed." Most of that happened in Units 9 and 10, which is why today is a reconciliation rather than a build. The plan was a prediction. Twelve weeks later the app is the fact. Sprint 1 is reconciliation: for every Must-have, you find out which of four states it is in, and you write that state down next to the story. Deployed and working. Working locally only. Partly built. Not started. Nothing else counts as a status. "Mostly done" is not one of the four, because a reviewer cannot click on "mostly."

The second idea is the vertical slice. A feature is complete when one user action travels the whole way: a form the user can reach, a route that receives it, validation that rejects the bad case, a record that lands in MongoDB, and a reload that shows the saved record. Five parts. If any one is missing, the slice is not finished, however good the other four look. The most common missing part is the last one. The form sends, the UI updates, you move on, and nobody refreshes the page. On refresh the record is gone, because the client updated its own state and the route returned 500 behind it.

The third idea is that a sprint is a list you can finish. Unit 8 taught capacity. The number of sessions in this unit is four, and each one is a sprint of one working day plus whatever evenings you give it. A Must-have list that needs ten of those days does not fit. Sprint 1 is where you cut, and the rule for cutting is coherence: the kept pieces must belong to one path a person can walk from sign-in to the valuable outcome your empathy map named. A sign-in with no feature behind it plus a checkout with no product in front of it is two fragments, not an MVP.

Napkin version: open the spec, grade every Must-have into one of four states, pick the worst one, finish it as a five-part slice with a seeded account, and update the plan so it describes the app. Then write the demo-day contract.

![](diagram:session-12-1/fig1-model)

### The four states, and how to find them without lying

You grade a Must-have by using it, not by reading the code. Open the deployed URL in a private window with no session. Walk the story the way the user story is written: "As a signed-in member, I can create a listing and see it on my dashboard." If you can do that on the live URL, it is **deployed**. If the live URL fails and `localhost` succeeds, it is **local**. If a route exists but the screen does not, or the screen exists but the route 404s, it is **partial**. If nothing exists, it is **missing**.

The private window matters. Your normal browser has a token in `sessionStorage` from 10-4 and a cached bundle. A fresh window is the first-time user, and the first-time user is the one the demo video will show.

Write the result into `docs/sprint-plan.md` under a new heading. Copy this into the file and fill it in:

```markdown
## Sprint 1 — status on <date>, deployed commit <short sha>

| Story (Must) | State | Evidence | Missing part |
|---|---|---|---|
| | deployed / local / partial / missing | what you clicked and what happened | form / route / validation / persistence / refresh |
```

A filled row looks like this:

```markdown
| M1 Sign in with email and password | deployed | logged in as demo@example.com on https://YOUR-DOMAIN, /api/me returned my id | none |
| M2 Create an entry and see it after reload | partial | POST /api/entries returns 201 locally; dashboard shows it until refresh, then empty | refresh |
| M3 Upgrade with test checkout | local | Stripe test card works on localhost; live URL returns 500 (webhook secret missing) | persistence |
```

The last column is the one that makes the table useful. "Partial" tells you nothing. "Partial, missing refresh" tells you where the bug is: the client is painting its own state and the server is not returning what it saved.

### What a slice has to prove

Walk the five parts for one story and keep a finger on each.

The **form** is a controlled component in `client/src`, the shape you built in 4-10. It holds a draft, it has a button, and it calls a function in the parent when it has a trimmed, non-empty value. The **route** is an Express handler mounted under `/api`, behind the bearer-token middleware from 4-8 and 10-1, in `server/`. **Validation** runs on the server with the `express-validator` chains from 10-1, and it answers 400 with `{ "error": "..." }`, the body shape every route has used since 4-11. **Persistence** is a Mongoose `create` or `save` on a model that has an `owner` field set from `req.user`, never from the body. The **refresh** is `GET /api/<resource>` filtered by `owner`, called from an effect on mount, so a reload paints what the database holds and not what the client remembers.

The failure path is the sixth thing, and it is part of the slice. If the save fails, the draft stays in the field and the error is visible. If validation rejects the input, nothing is written. If the user is signed out, the route answers 401 before it touches the database. You built each of these once in Unit 4 and again in Unit 10. Today you check that your capstone's most important story has all of them, on the deployed URL, not on a diagram.

### Folders, ports, and the two halves

For this unit, `server/` is the Express half and `client/` is the Vite React half of `~/projects/<capstone-name>`, which is the layout 6-4's deploy script expects. If your capstone keeps the API at the repository root, drop the `cd server` from the commands and nothing else changes. The API listens on port 3000, the port it has used since 10-1. The Vite dev server is 5173. The hall-api on 4100 is a different project, and only one server runs at a time: stop anything else with Ctrl-C in its terminal before you start the capstone.

Secrets live in `server/.env`, read by `node --env-file=.env server.js`, the way 4-5 taught, or through `dotenv` if you took the library option in 10-1. Either way, the names in `.env` are the names the deploy needs, and the deploy has no way to read your laptop. That is why this sprint commits `server/.env.example`: the same keys, empty values, so the README can say "copy this and fill it in" and mean it.

### The fixture account is a product decision

Every demo, every test, and every screenshot in this unit uses one account you create on purpose. Pick `demo@example.com` with a password you write in the README's development section, because this account never exists in a real user's hands. Seed it with a script, not by hand, so a fresh database on a fresh machine gets the same account and the same three or four records. `scripts/seed.js` connects with the same `MONGODB_URI` the server uses, deletes the fixture account's records, and re-creates them. It never touches other accounts. Re-running it is how you reset before a recording.

### The demo-day contract, written once

Demo day in this path is a solo event, and here is what it asks of you, so every later sprint is aimed at the same target. In 12-5 you deliver four things: a recorded five-minute demo of the deployed URL using the fixture account; a written Q&A, five questions a reviewer would ask, answered from your implementation; a self-scored 100-point rubric; and a handoff packet in `docs/demo-day.md` another developer could operate from. The pitch deck from 11-4 and the financial narrative sit next to those, updated to the product you actually shipped. Nothing on that list requires an audience in a room. All of it requires the app to work on the live URL.

## The demonstration

One worked example, on a capstone whose Must-have M2 is "a signed-in member creates an entry and sees it after reload." Your resource has a different name. The shape of the work is the same.

Start in the repository and look at what is actually there before touching anything.

```bash
cd ~/projects/<capstone-name>
git status --short
git log --oneline -5
ls docs
```

```text
 M client/src/App.jsx
a41c9e2 deploy: production webhook url
7d02f1b ai: timeout fallback
...
board-sprint-1.png  pitch-deck  product-spec.md  research.md  sprint-plan.md  user-stories.md
```

A modified file you do not remember is the first finding. Read the diff, then commit it or `git checkout -- client/src/App.jsx`. Sprint 1 starts from a clean tree, because the deployed commit is the thing you are grading against, and a dirty tree is a tree nobody deployed.

Open the private window and grade. For M2 on the live URL: sign in as `demo@example.com`, create an entry, watch it appear, press reload. It is gone. Now the same on `localhost`. Stop any other server with Ctrl-C, then:

```bash
cd ~/projects/<capstone-name>/server
node --env-file=.env server.js
```

```text
listening on 3000
mongo connected
```

In a second terminal, the route by hand, with a token from the login route.

```bash
TOKEN=$(curl -s -H 'Content-Type: application/json' \
  -d '{"email":"demo@example.com","password":"demo-pass-1"}' \
  http://localhost:3000/api/login | node -p 'JSON.parse(require("fs").readFileSync(0)).token')
curl -s -i -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"First entry","body":"It works on my machine"}' \
  http://localhost:3000/api/entries
```

```text
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"_id":"6726...","title":"First entry","body":"It works on my machine","owner":"6701..."}
```

Then the read-back that the refresh depends on:

```bash
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/entries
```

```text
[]
```

There it is. The create works and the list is empty. That is a partial slice with the persistence or refresh part missing, and the grade in the table is `partial`. Open the router. The `GET` handler filters by `owner: req.user.id`, and the `POST` handler saved `owner: req.user.userId`. Two names for the same claim, one from the 4-8 middleware and one from the 10-2 rename warning you read and did not apply everywhere. The list filter never matches. Pick one name, `req.user.userId` if that is what your middleware sets, and use it in both handlers.

```js
// server/routes/entries.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Entry = require('../models/entry');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const entries = await Entry.find({ owner: req.user.userId }).sort({ createdAt: -1 });
  res.json(entries);
});

router.post(
  '/',
  auth,
  body('title').trim().isLength({ min: 1, max: 120 }),
  body('body').trim().isLength({ max: 5000 }),
  async (req, res) => {
    const problems = validationResult(req);
    if (!problems.isEmpty()) {
      res.status(400).json({ error: problems.array()[0].msg || 'invalid entry' });
      return;
    }
    const entry = await Entry.create({
      title: req.body.title,
      body: req.body.body,
      owner: req.user.userId
    });
    res.status(201).json(entry);
  }
);

module.exports = router;
```

If your capstone uses `import` and `export` because you followed 10-2's ES module files, the lines are the same with that syntax. Restart, run the two curls again, and the second one returns an array with one entry. Now the browser: reload the dashboard and the entry is there. The refresh agrees. The slice is complete, and the table row changes from `partial` to `local`.

It becomes `deployed` only after the fix is live, and that is 12-3's job, not today's. Today you commit it and note it. The seed script comes next, because the fix is useless without an account to demonstrate it with.

```js
// server/scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Entry = require('../models/entry');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const email = 'demo@example.com';
  await User.deleteOne({ email: email });
  const user = await User.create({
    email: email,
    passwordHash: await bcrypt.hash('demo-pass-1', 10)
  });
  await Entry.deleteMany({ owner: user._id });
  await Entry.create([
    { title: 'Scout the ridge', body: 'Three hours, clear sky.', owner: user._id },
    { title: 'Copy the map', body: 'The west edge is torn.', owner: user._id },
    { title: 'Relieve Ivo', body: 'He has been on the wall since dawn.', owner: user._id }
  ]);
  console.log('seeded ' + email + ' with 3 entries');
  await mongoose.disconnect();
}

main().catch(function (err) {
  console.error(err.message);
  process.exit(1);
});
```

```bash
cd ~/projects/<capstone-name>/server
node --env-file=.env scripts/seed.js
```

```text
seeded demo@example.com with 3 entries
```

Add `"seed": "node --env-file=.env scripts/seed.js"` to the `scripts` in `server/package.json` so the README can say `npm run seed`. Then the example env file:

```dotenv
# server/.env.example — copy to server/.env and fill in every value
PORT=3000
MONGODB_URI=
JWT_SECRET=
PAGE_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ANTHROPIC_API_KEY=
```

Only the keys your server actually reads. Grep for `process.env.` in `server/` and make the list match. A key the README promises and the code never reads is a lie that costs a reviewer twenty minutes.

Here is a small model you can run here. It grades a status table the way the session does and checks a slice the way the demonstration did. It proves that the grading rules are mechanical and that a save without a refresh is not a finished slice. It does not open your repository, hit your deploy, or know your stories, so the real table is still yours to fill.

```js run=checkpoint-12-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const STATES = ['deployed', 'local', 'partial', 'missing'];

function grade(row) {
  if (row.live) return 'deployed';
  if (row.localOk) return 'local';
  if (row.route || row.screen) return 'partial';
  return 'missing';
}

const stories = [
  { id: 'M1', title: 'sign in', live: true, localOk: true, route: true, screen: true },
  { id: 'M2', title: 'create entry, see after reload', live: false, localOk: false, route: true, screen: true },
  { id: 'M3', title: 'upgrade with test checkout', live: false, localOk: true, route: true, screen: true },
  { id: 'M4', title: 'export ledger', live: false, localOk: false, route: false, screen: false }
];

const graded = stories.map(function (s) { return { id: s.id, state: grade(s) }; });
check(graded.every(function (g) { return STATES.indexOf(g.state) !== -1; }), 'every story lands in one of four states');
check(graded[0].state === 'deployed' && graded[3].state === 'missing', 'live wins over local, nothing built is missing');

const order = { missing: 0, partial: 1, local: 2, deployed: 3 };
const worst = graded.slice().sort(function (a, b) { return order[a.state] - order[b.state]; })[0];
check(worst.id === 'M4', 'the sprint starts with the Must-have furthest from done');

const slice = { form: true, route: true, validation: true, persistence: true, refresh: false };
const incomplete = Object.keys(slice).filter(function (key) { return !slice[key]; });
check(incomplete.length === 1 && incomplete[0] === 'refresh', 'A visual save is not yet a complete slice');

const fixed = Object.assign({}, slice, { refresh: true });
check(Object.keys(fixed).every(function (key) { return fixed[key]; }), 'a slice with the refresh is complete');

const owners = { post: 'userId', get: 'userId' };
check(owners.post === owners.get, 'the create and the list read the same claim');

console.log('ok: checkpoint-12-1');
```

## Where it breaks

![](diagram:session-12-1/fig2-diagnosis)

### Skeleton mistaken for progress

The repository has `controllers/`, `services/`, `hooks/`, and `context/`, and the status table has four rows of `partial`. Folders feel like work because they took an afternoon. They are a filing system, and a filing system does not answer a user story. The cause is building horizontally: a route for every resource, then a model for every resource, then a screen for every resource, with no story finished at any point. The fix is vertical. Pick one Must-have and carry it through all five parts before you touch a second one. The ugliest complete slice outranks the cleanest set of stubs, because the slice is what the demo shows and the stubs are what the demo cannot.

### Too many must-haves

The spec has nine Musts and three sprints left. You grade honestly and five rows say `partial`. The cause is that Unit 8's MoSCoW was written before you knew how long anything takes, and it was never revised. The fix is a cut, made on paper, today. Keep the Musts that belong to the one path from sign-in to the outcome in your empathy map. Move the rest to Should and write the reason in the sprint plan. Coherent is the test: if a kept Must cannot be reached from another kept Must by a user clicking, one of them is a fragment and should move. A fragment finished is less valuable than a path finished.

### Architecture copied without need

The 9-4 record has a queue, a cache, and a second service, and you cannot say what fails if each one is deleted. The cause is a diagram admired in a side quest and reproduced without a pressure to relieve. The fix is a sentence per box: what it is for, what breaks without it, what it costs to run. A box without a sentence comes out of the record and out of the code before the sprint ends. The architecture record is supposed to explain the app that exists. It is not a wish list, and demo day will ask you to defend every box on it.

## Your turn

Work in `~/projects/<capstone-name>`. Stop any other server first.

1. Clean the tree. Run `git status --short`. If anything prints, read the diff and commit it or discard it. `git log --oneline -1` is your current commit; write the short sha at the top of the status table.
2. Grade every Must-have in a private window on the live URL, then on `localhost`. Add the Sprint 1 status table to `docs/sprint-plan.md` with one row per Must. Every row has one of the four states and, if not `deployed`, the missing part by name.
3. Cut. If more than three rows are `partial` or `missing`, move Musts to Should until one coherent path remains. Record each move in the sprint plan with one sentence of reason, and move the matching cards on the GitHub Projects board from 8-2: `deployed` rows go to Done, the row you are about to finish goes to In Progress, everything else waits in Backlog or Sprint 1.
4. Pick the row furthest from done and finish its slice. Run the two curls from the demonstration against your own route, with your own resource name. The read-back after the create must list the record. In the browser, create one and reload. It must still be there.
5. Write `server/scripts/seed.js` for `demo@example.com` and at least three records. Add `npm run seed`. Run it twice. The second run prints the same line and the database does not grow.
6. Commit `server/.env.example` with every key your server reads and nothing it does not. Confirm `.env` is in `.gitignore` with `git check-ignore server/.env`, which prints the path if it is ignored and nothing if it is not.
7. Open your 9-4 architecture record. For every box, add one sentence of what it is for. Delete boxes that get no sentence.

If a `GET` after a `POST` comes back empty, you are in the demonstration's bug. Print `req.user` in both handlers and compare the key names before you touch the model.

## The quest

![](diagram:session-12-1/fig3-evidence)

The deliverable is the Sprint 1 section of `docs/sprint-plan.md`, with the status table filled from the live URL and the sprint's one finished slice recorded under it. Under the table, write the demo-day contract in your own words: the four things 12-5 collects and the URL and account the demo will use.

Evidence to keep in the repository:

- `docs/sprint-plan.md` with the Sprint 1 status table, the commit sha it was graded against, and every cut explained.
- The two curl commands and their output for the finished slice, pasted under the table as a `text` block.
- A screenshot named `docs/evidence/12-1-refresh.png` of the dashboard after a reload, showing the record you created.
- `server/scripts/seed.js`, `npm run seed` in `server/package.json`, and `server/.env.example`.
- The updated architecture record with one sentence per box.
- One commit with a message that names the story: `sprint 1: finish M2 create-and-reload slice`.

## Side quests

SOLID is the vocabulary for the "what breaks if I delete this" question you just asked of every box, and the system-design primer is where the client, server, and persistence boundaries you reconciled today were first drawn.

## Before next session

Sprint 2 builds the Should-haves that survived the cut, and it gives the core flow an explicit state machine so a double click, a failed save, and an empty list each do one predictable thing. Before then, finish the rows that were `local` and not `deployed` if the fix is small, and leave the deploy itself for 12-3. Read [Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state) once more with your form open; next session the `status` string from 4-10 grows into the thing that decides what the button does.

Nothing stays running between sessions. Stop the server with Ctrl-C. Your deployed URL stays up on its own, which is the point of having one.
