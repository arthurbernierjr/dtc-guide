---
editorial: true
title: Sprint 3 — Harden
subtitle: Freeze a candidate, test it, try to break it, back it up, ship it
hook: "No new features today. Sprint 3 freezes one commit, runs the whole test tree against exactly that commit, attacks the ownership rules with a second account, restores a backup somewhere disposable, and redeploys with the path you already own."
read: 55
artifact: "A tested release candidate with a security review and deployment recovery drill"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://owasp.org/Top10/2025/
  - https://playwright.dev/docs/best-practices
  - https://jestjs.io/docs/configuration
  - https://github.com/forwardemail/supertest#readme
  - https://www.mongodb.com/docs/database-tools/mongodump/
  - https://www.mongodb.com/docs/database-tools/mongorestore/
  - https://www.mongodb.com/docs/database-tools/installation/installation/
  - https://github.com/express-rate-limit/express-rate-limit
say:
  - "Evidence belongs to a commit. A green run with no sha is a rumor."
  - "Headers are configuration. A security review is a request you sent as the wrong user."
  - "A backup you have not restored is a file you hope is a backup."
---

## The hook

Sprint 2 ended with the journey walkable and the core flow obeying a table. Today you do not add anything. You pick one commit, give it a name, and spend the day trying to prove it is not good enough: a Jest and Supertest suite, installed in the first hour the way Unit 7 built the hall's, runs against it, a Playwright journey runs against it, a second account tries to read the first account's records, and the rate limiter and Helmet are checked with a request rather than by reading the file they were configured in. Whatever survives that is the release candidate.

Then the part no earlier unit made you do. You take a backup of the deployed database with `mongodump`, restore it into a disposable database on your own machine with `mongorestore`, and read a record back. Only after that do you redeploy, with `railway up` the way [10-4](/path/10-4-warding-the-kingdom/) first put the capstone on a URL, or the `deploy.sh` from 6-4 if yours lives on the VPS, and roll back once on purpose so the rollback is a thing you have done rather than a thing you assume. By the end the live URL runs the candidate, and `docs/release-candidate.md` names the sha every piece of evidence was collected against.

> *The armor is tested by the smith striking it, not by the knight admiring it.*

## The idea

A release candidate is a commit with a name. `git tag rc-1` on the commit you intend to ship gives you a fixed point that every test run, every curl, and every screenshot refers back to. The alternative is the thing most people do: test a working tree with uncommitted edits, deploy the branch an hour later with two more edits in it, and wonder next week which of those two trees the green run described. A report that does not name its revision is a rumor about some other tree. Today the sha is written at the top of the evidence file before any evidence is collected.

The second idea is that security is reviewed by operating the app wrongly on purpose. Helmet from 10-1 sets headers, and `curl -I` shows them in three seconds. That is a configuration check. A security review is a second account, created with the seed script, sending a direct request for the first account's record by id. Either the route answers 404 or 403, or it answers 200 and you have the most important bug of the week. You do the same with a field the client never sends, such as `owner` or `isPro` in a request body, and with an expired token. Headers are the easy screenshot. Ownership is the thing a reviewer will try first.

The third idea is recovery. Your capstone has a database with the fixture account and whatever real sign-ups you collected since 10-4. A backup is a copy of it that exists somewhere else. A restore is proof that the copy can be read. Those are different facts, and only the second one matters on the day you need it. The drill is to dump the live database, restore it into a database with a different name on your local MongoDB from 4-5, count the records, and time the whole thing. Then you know what a bad day costs: the age of the newest backup, plus the minutes the restore took.

The fourth idea is that deployment is already solved. The Railway project, database, domain, and variables from 10-4 exist, or the server, Nginx site, pm2 app, and certificate from 6-4 do if you took the VPS path. Redeploying is one command on either path. The thing you have not rehearsed is the step backwards: checking out the previous tag, deploying it, confirming the public journey still works, and coming forward again. A rollback you have performed once under no pressure is a procedure. One you have only read about is a hope.

Napkin version: tag the candidate; run every test against the tag and write the sha on the output; attack ownership and mass assignment with a second account; dump, restore elsewhere, count, time it; redeploy with the path you have; roll back once and come forward; put every result in one file with the sha at the top.

![](diagram:session-12-3/fig1-model)

### Freezing, and what counts as a fix

`git status --short` prints nothing, `git log --oneline -1` prints the commit, `git tag rc-1` names it, `git push origin rc-1` sends the name to GitHub. From here, a fix that is needed to pass a test goes in as a new commit and the tag moves: `git tag -f rc-1` and `git push -f origin rc-1`, and the sha at the top of the evidence file changes with it. Every check affected by the fix runs again. A fix that is not needed to pass a test waits until Sprint 4. The temptation is to "quickly also" rename a button while a test is running. The button rename does not change the sha the test already saw, which is exactly the problem.

### The test tree, installed today

Unit 7 taught the pattern on `hall-api`: [7-2](/path/7-2-dungeon-trials/) split the hall into `app.js` and `server.js`, pointed Jest at a database that must end in `_test`, and sent real requests through Supertest; [7-3](/path/7-3-the-gauntlet/) added a Playwright journey and a workflow. None of that reached the capstone. 10-1 scaffolded `api/` with the split already made, `app.js` exports `{ app }` and `server.js` listens, and 10-4's audit listed the missing tests as a Unit 12 gap. This is the hour that closes it. First the API suite, in `api/`:

```bash
cd ~/projects/<capstone-name>/api
npm install --save-dev jest supertest
mkdir -p tests
```

Add `"test": "node --env-file=.env.test node_modules/jest/bin/jest.js"` to the `scripts` in `api/package.json`, next to `seed`. Then `.env.test`, committed, with every name `api/.env.example` lists, because `config.js` refuses to start without them, and with both database names pointing at the throwaway database:

```dotenv
# api/.env.test (committed; nothing in here is a secret)
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/<capstone-name>_test
TEST_MONGODB_URI=mongodb://127.0.0.1:27017/<capstone-name>_test
JWT_SECRET=test-only-not-a-secret-but-at-least-thirty-two-characters
PAGE_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
STRIPE_PRICE_ID=price_placeholder
ANTHROPIC_API_KEY=placeholder
AI_MODEL=claude-haiku-5-5
AI_DAILY_TOKEN_BUDGET=50000
AI_ENABLED=true
NODE_ENV=test
```

The list must match `grep -r process.env api/` name for name: every name `config.js` requires is here with a dummy value, 12-1's `.env.example` is the same list, and the one name that can wait is `DRAFT_MODE`, because the adapter gives it a default and a failing test below asks for it.

`jest.config.js` and `tests/setup.js` are 7-2's files, copied in with one change: the setup requires the app with braces, `const { app } = require('../app')`, because 10-1 exported an object and the hall exported the app itself. The guard that refuses any database not ending in `_test` stays word for word. Then the first test files. `tests/auth.test.js` is 7-2's register-and-login pair against `/api/register` and `/api/login`. `tests/entries.test.js` is the two curls from 12-1 as assertions, create then list, as the fixture account and then as a stranger. `tests/draft.test.js` posts to the adapter route from 12-2 and expects `200` with a `summary` field. `npm test` with no files prints `No tests found, exiting with code 1`, which is correct; with the files in place it prints a `Tests:` line and exits on its own, and if it hangs, 7-2's `--detectOpenHandles` note applies here too.

The browser half lives at the repository root, where 7-3 put it in the hall. `npm init playwright@latest` there, with the same answers as before: JavaScript, `e2e` as the folder, no workflow, yes to browsers. Delete `e2e/example.spec.js` and `tests-examples/`. `playwright.config.js` is 7-3's, with the two `webServer` entries changed to this project: `node --env-file=.env.test server.js` with `cwd` of `api` on port 3000 and `MONGODB_URI` overridden to `<capstone-name>_e2e` in its `env` block, and `npx vite --strictPort` with `cwd` of `client` on 5173. A `.github/workflows/test.yml` is 7-3's with `hall-api` replaced by `api` in every `working-directory`; it is worth the ten minutes and the rubric in 12-5 has a line for it, but it is not a release blocker today. None of these files has run against the Sprint 2 code. Now they do, with the sha in the output.

```bash
cd ~/projects/<capstone-name>/api
git rev-parse --short HEAD
npm test 2>&1 | tee ../docs/evidence/12-3-jest.txt
```

```text
a9f3c1d
PASS tests/auth.test.js
PASS tests/entries.test.js
FAIL tests/draft.test.js
  ● POST /api/entries/draft › returns a summary
    expect(received).toBe(expected)
    Expected: 200
    Received: 502
Tests: 1 failed, 11 passed, 12 total
```

That failure is real and it is a good one. The test was written an hour ago against the route's contract, `200` with a `summary`; Sprint 2 put an adapter in front of the provider, and the test environment has no `DRAFT_MODE`, so the adapter went to the real provider with a placeholder key and answered 502. Set `DRAFT_MODE=normal` in `.env.test` next to `NODE_ENV=test`, and the fixture answers. That is a test-environment fix, so it is allowed, and it is a commit that moves the tag. A test that is simply wrong about the current contract is rewritten; a test that found a bug gets the bug fixed. Those are the only two outcomes. Deleting a failing test to get green is the third outcome, and it is the one that makes the whole file a rumor.

The browser test is the journey from 12-2 as the fixture account. Run it from the repository root, where `playwright.config.js` lives:

```bash
cd ~/projects/<capstone-name>
npx playwright test 2>&1 | tee docs/evidence/12-3-e2e.txt
```

```text
Running 3 tests using 1 worker
  ✓ e2e/core-flow.spec.js:5 sign in, create an entry, see it after reload (4.1s)
  ✓ e2e/core-flow.spec.js:21 a failed save keeps the draft (2.3s)
  ✓ e2e/auth.spec.js:4 wrong password shows an error (1.2s)
3 passed (9.5s)
```

`e2e/` is empty after the install, because 7-3's inbox spec belongs to `hall-api`, so write `e2e/core-flow.spec.js` now; the journey you walked by hand in 12-2 is the script, step for step. One browser test of the real path outranks ten that check a heading exists.

### The review that sends requests

Seed a second account and try the things a stranger would try. The seed script from 12-1 can take an email argument, or you can register through the route. With two tokens, `$A` for `demo@example.com` and `$B` for `other@example.com`:

```bash
ID=$(curl -s -H "Authorization: Bearer $A" http://localhost:3000/api/entries | node -p 'JSON.parse(require("fs").readFileSync(0))[0]._id')
curl -s -i -H "Authorization: Bearer $B" http://localhost:3000/api/entries/$ID | head -1
curl -s -i -X DELETE -H "Authorization: Bearer $B" http://localhost:3000/api/entries/$ID | head -1
```

```text
HTTP/1.1 404 Not Found
HTTP/1.1 404 Not Found
```

Two 404s is the correct answer: the route filters by `owner` as well as `_id`, so a record that is not yours does not exist as far as you are concerned. A 200 on the first line means the `findById` forgot the owner. A 204 on the second line means the delete did. Both are release blockers; both are one-line fixes that move the tag.

Mass assignment next. Send a field the form never sends:

```bash
curl -s -i -H "Authorization: Bearer $B" -H 'Content-Type: application/json' \
  -d '{"title":"Mine now","body":"x","owner":"'$OWNER_A'","isPro":true}' \
  http://localhost:3000/api/entries | head -1
```

Then read the created record back as `$B` and confirm `owner` is B's id and no `isPro` landed anywhere. The 12-1 route builds the document from named fields, so the extra keys are ignored. If your route does `Entry.create(req.body)`, this is where it stops doing that.

Then the two configuration checks, done as requests rather than by reading `app.js`:

```bash
curl -s -I https://YOUR-APP.up.railway.app/api/health | grep -i -E 'strict-transport|x-content-type|content-security|ratelimit'
```

```text
content-security-policy: default-src 'self';...
strict-transport-security: max-age=31536000; includeSubDomains
x-content-type-options: nosniff
ratelimit-policy: 100;w=900
ratelimit: limit=100, remaining=99, reset=899
```

The `ratelimit` headers come from `express-rate-limit`. Version 7 renamed `max` to `limit`; `max` still works with a deprecation note, and the standard header format is opt-in. If your 10-1 code still reads `max`, update it while you are here:

```js
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

app.use('/api', apiLimiter);
```

An expired token is the last request: take a token you saved two hours ago from a previous session, or sign one with a one-second expiry in a Node one-liner using your `JWT_SECRET`, and confirm `/api/me` answers 401 with `{ "error": "..." }` rather than 500 with a stack. Every request and its first line goes into the evidence file.

### The drill: dump, restore elsewhere, count, time

`mongodump` and `mongorestore` ship in the MongoDB Database Tools, a separate download from the server you installed in 4-5. The [installation page](https://www.mongodb.com/docs/database-tools/installation/installation/) has one section per operating system. `mongodump --version` printing a version is the check that it is installed.

The dump runs wherever the live database is reachable. On Railway, where 10-4 put it, the MongoDB service's connection string is in the service's variables, `railway variable list` prints it, and the tools connect from your laptop. On the VPS from 6-4, it is the server itself, as the `deploy` user, because the database listens on `127.0.0.1` only. Either way, `MONGODB_URI` is the same value the running app uses, with the database name in it, and the dump folder is named for the candidate:

```bash
mkdir -p backups
mongodump --uri="$MONGODB_URI" --out="backups/rc-1-$(date +%Y%m%d)"
```

```text
2026-11-07T10:12:01.883+0000  writing capstone.users to backups/rc-1-20261107/capstone/users.bson
2026-11-07T10:12:01.901+0000  done dumping capstone.users (4 documents)
2026-11-07T10:12:01.904+0000  writing capstone.entries to backups/rc-1-20261107/capstone/entries.bson
2026-11-07T10:12:01.918+0000  done dumping capstone.entries (23 documents)
```

Add `backups/` to `.gitignore` immediately. A dump holds password hashes and whatever your users typed; it never enters the repository. If the dump ran on the VPS, bring it down with `scp -r deploy@YOUR-DOMAIN:~/backups/rc-1-20261107 ./backups/`.

The restore goes into your local MongoDB from 4-5, into a database with a different name, so the live data is never touched by a rehearsal. `--nsFrom` and `--nsTo` do the renaming:

```bash
time mongorestore --nsFrom='capstone.*' --nsTo='capstone_restore.*' backups/rc-1-20261107
```

```text
2026-11-07T10:14:33.120+0000  restoring capstone_restore.users from backups/rc-1-20261107/capstone/users.bson
2026-11-07T10:14:33.188+0000  restoring capstone_restore.entries from backups/rc-1-20261107/capstone/entries.bson
2026-11-07T10:14:33.402+0000  27 document(s) restored successfully. 0 document(s) failed to restore.

real    0m0.41s
```

Without `--uri`, `mongorestore` talks to `localhost:27017`, which is the only database you want it talking to during a drill. Then the read-back, which is the actual evidence:

```bash
mongosh capstone_restore --quiet --eval 'db.users.countDocuments() + " users, " + db.entries.countDocuments() + " entries"'
```

```text
4 users, 23 entries
```

The counts match the dump. Open one entry and confirm the fields are the ones your model expects; a restore from a dump made by a newer tool against an older server fails here rather than at the count. Write down three numbers: when the dump was taken, how long the restore took, and how old the newest record in it is. That is your recovery policy in plain words: "if the database disappears, I lose at most N hours and I am back in M minutes." `mongosh capstone_restore --eval 'db.dropDatabase()'` when you are done, so the next drill starts clean.

### Redeploy with the path you have, then step back once

The capstone lives on Railway, where [10-4](/path/10-4-warding-the-kingdom/) put it, and the path is the one that session walked:

```bash
cd ~/projects/<capstone-name>
git checkout rc-1
railway up
railway logs
```

`railway up` uploads the tree you have checked out, builds it with the commands in `railway.json`, and starts it; `railway logs` shows the `listening on` line. The only change from 10-4 is checking out the tag instead of `main`, so the service runs the sha the evidence names. A project connected to the GitHub repository deploys on push instead; pushing the tag's commit to `main` is the same action.

If you took the VPS alternative from [6-4](/path/6-4-opening-the-world-gate/) instead, the script you wrote there is the path: `ssh deploy@YOUR-DOMAIN`, `cd ~/<capstone-name>`, `git fetch --tags`, `git checkout rc-1`, `./deploy.sh`, which pulls, installs, restarts the pm2 app, and rebuilds the client.

Either way, the smoke test is the journey on the public URL as the fixture account, in a private window, plus the phone: open the URL on your phone over mobile data, not your Wi-Fi, and walk the core flow once. That is the nearest thing to "someone else's network" you can produce alone, and it catches the CORS origin and the mixed-content error that `localhost` never shows.

Then the rollback. Check out the previous tag, or `rc-1~1` if this is the first one, deploy it the same way, reload the public URL, and confirm the journey still works on the older code. Come forward to `rc-1` and deploy again. The whole loop is ten minutes, and the sentence you can now write is "I have rolled this app back and forward on the live URL." If the candidate changed the schema, write down which fields the older code cannot read; that is the one case where a rollback is not free.

## The demonstration

One worked example, end to end, on the capstone from the last two sprints. Stop any other server first.

```bash
cd ~/projects/<capstone-name>
git status --short
git log --oneline -1
git tag rc-1 && git push origin rc-1
mkdir -p docs/evidence
printf '# Release candidate rc-1\n\nsha: %s\ndate: %s\n' "$(git rev-parse --short HEAD)" "$(date -I)" > docs/release-candidate.md
```

```text
a9f3c1d sprint 2: S1 assistant draft behind adapter
Total 0 (delta 0), reused 0 (delta 0)
To github.com:YOU/<capstone-name>.git
 * [new tag]         rc-1 -> rc-1
```

The install first: Jest and Supertest in `api/`, the four files, three test files, Playwright at the root, one commit named `sprint 3: test suite`, and the tag moved onto it. Then Jest, as above. The draft test fails on 502, `DRAFT_MODE=normal` goes into `.env.test`, the run goes green, and the fix is committed with `git tag -f rc-1 && git push -f origin rc-1`. The sha in `docs/release-candidate.md` is updated by hand, and Jest runs once more so the file holds the output from the new sha, not the old one.

Playwright next, from the root, three passes. The two outputs are already in `docs/evidence/` because of `tee`.

Then the review. Seed the second account, collect `$A` and `$B` the way 12-1 collected a token, send the four requests, paste first lines. On this capstone the delete came back 204 as the wrong user: the handler used `findByIdAndDelete(req.params.id)`. Changed to `findOneAndDelete({ _id: req.params.id, owner: req.userId })`, which returns `null` for someone else's record, and the handler answers 404 on `null`. Commit, move the tag, rerun `tests/entries.test.js`, add a test for the cross-account delete so this cannot come back.

Then the drill, exactly as above, with the three numbers written in the file: dump taken 10:12, restore 0.41 seconds, newest record 14 hours old. Then the deploy: `git checkout rc-1`, `railway up`, `railway logs`, journey in a private window, journey on the phone. Then the rollback to `rc-1~1` and back. Then `curl -I` against the public URL for the headers.

Here is a small model you can run here. It checks evidence the way the release file should be read: every required check must come from the candidate sha, a restore only counts when the counts match, and a cross-account read is only safe when the answer was not 200. It does not run your tests, dump your database, or touch your server; it models the rules you applied by hand.

```js run=checkpoint-12-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const candidate = 'a9f3c1d';
const required = ['unit', 'browser', 'ownership', 'restore'];

function qualifies(evidence, sha) {
  return required.every(function (name) {
    return evidence.some(function (e) { return e.sha === sha && e.check === name && e.passed; });
  });
}

const stale = [
  { sha: 'a9f3c1d', check: 'unit', passed: true },
  { sha: '7d02f1b', check: 'browser', passed: true },
  { sha: 'a9f3c1d', check: 'ownership', passed: true },
  { sha: 'a9f3c1d', check: 'restore', passed: true }
];
check(!qualifies(stale, candidate), 'Passing evidence from another revision does not qualify the candidate');

const fresh = stale.map(function (e) { return Object.assign({}, e, { sha: candidate }); });
check(qualifies(fresh, candidate), 'the same checks on the candidate sha qualify it');

function restoreOk(dumped, restored) {
  return Object.keys(dumped).every(function (name) { return restored[name] === dumped[name]; });
}
check(restoreOk({ users: 4, entries: 23 }, { users: 4, entries: 23 }), 'a restore counts when every collection matches');
check(!restoreOk({ users: 4, entries: 23 }, { users: 4, entries: 0 }), 'an empty collection after restore is a failed drill');

function ownershipSafe(statusAsOtherUser) {
  return statusAsOtherUser === 404 || statusAsOtherUser === 403;
}
check(ownershipSafe(404) && !ownershipSafe(200), 'a cross-account read must not answer 200');

function limiterConfig(opts) {
  return typeof opts.limit === 'number' && opts.legacyHeaders === false;
}
check(limiterConfig({ windowMs: 900000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }), 'the limiter uses limit, not max');

console.log('ok: checkpoint-12-3');
```

## Where it breaks

![](diagram:session-12-3/fig2-diagnosis)

### Tests target a different revision

The evidence file says green, the live URL fails on the second step of the journey, and the deploy log shows a sha that is not in the file. The cause is testing a working tree and deploying a branch, or moving the tag after a fix without rerunning what the fix touched. The fix is procedural: `git status --short` prints nothing before every run, the sha goes at the top of the file before the first command, and every `git tag -f` is followed by rerunning the checks that saw the changed files. If you cannot say which sha a line of output came from, that line is not evidence; delete it and run it again.

### Security review only checks headers

Helmet is on, the `curl -I` output is pasted, and any signed-in user can delete any record by id. The cause is reviewing configuration instead of behavior; headers are visible in one command, ownership takes two accounts and four requests. The fix is the request list in this session: read, delete, and update someone else's record by id as the other account; send `owner` and a privilege field in a body; use an expired token. Paste the first line of each response. A review without an attempted abuse is a screenshot of settings, and a reviewer will send the first request themselves.

### Backup assumed usable

There is a cron line or a dashboard toggle that says "backups: on," and nobody has ever restored one. The dump is empty because the URI pointed at the wrong database, or it was made by a tool version the server refuses, or the folder is on the same disk that just failed. The cause is confusing the existence of a file with the ability to read it. The fix is the drill, done today and written down: restore into a renamed database on another machine, count every collection, open one record, time it. Then the recovery policy is a sentence with numbers in it, and the next drill has something to compare against.

## Your turn

In `~/projects/<capstone-name>`, clean tree, nothing running except what each step starts.

1. `git status --short` prints nothing. `git tag rc-1 && git push origin rc-1`. Create `docs/release-candidate.md` with the sha and date on the first lines.
2. Install the suite, copying the [7-2](/path/7-2-dungeon-trials/) and [7-3](/path/7-3-the-gauntlet/) pattern with the capstone's own routes: `npm install --save-dev jest supertest` in `api/`, the `test` script, `api/.env.test`, `jest.config.js`, `tests/setup.js` requiring `{ app }`, and `tests/auth.test.js`, `tests/entries.test.js`, `tests/draft.test.js`. Then `npm init playwright@latest` at the repository root with `e2e/`, the scaffold files deleted, and `playwright.config.js` pointed at `api/` and `client/`. `npm test` in `api/` before the test files exist prints `No tests found, exiting with code 1`; `npx playwright test` before the spec exists prints `Error: No tests found`. Commit, `git tag -f rc-1`, update the sha.
3. Run `npm test` in `api/` with `tee` into `docs/evidence/12-3-jest.txt`. For each failure decide: test wrong about the contract, or bug found. Fix accordingly, commit, `git tag -f rc-1`, update the sha, rerun. Stop when the last line reads `Tests: 0 failed`.
4. Run `npx playwright test` from the root with `tee` into `docs/evidence/12-3-e2e.txt`. Write `e2e/core-flow.spec.js` from the 12-2 walk first. The last line reads `N passed`.
5. Seed a second account. Send the read, delete, and update for the first account's record as the second account; send a body with `owner` and a privilege field; send an expired token to `/api/me`. Paste each command's first response line into the file. Every cross-account answer is 404 or 403; the extra fields never land; the expired token gets 401 with a JSON body.
6. `curl -I` the public URL and paste the Helmet and `ratelimit` headers. If your limiter still says `max`, change it to `limit` with `standardHeaders: 'draft-7'` and `legacyHeaders: false`.
7. Install the Database Tools if `mongodump --version` fails. Dump the live database into `backups/rc-1-<date>`, add `backups/` to `.gitignore`, restore with `--nsFrom`/`--nsTo` into `<db>_restore` locally, count with `mongosh`, open one record. Write the three numbers in the file. Drop the restore database.
8. Redeploy the tag with `railway up` from the tag's checkout, or `./deploy.sh` over ssh on the VPS, and walk the journey in a private window and on your phone over mobile data. Roll back to the previous tag, walk it, come forward, walk it again. Write the three sentences.

If `mongorestore` says `0 document(s) restored`, the dump folder path is one level off: point it at the folder that contains the database folder, not at the database folder itself. If `npm test` dies on the first line with `FATAL: missing environment variable`, `.env.test` is missing a name that `config.js` requires; copy every name from `.env.example` and give it a placeholder.

## The quest

![](diagram:session-12-3/fig3-evidence)

The deliverable is `docs/release-candidate.md`: the sha at the top, and under it, in order, the Jest and Playwright outputs, the security requests with their first lines, the backup drill with its three numbers, the deploy and rollback sentences, and a "Known issues" list of anything you found and chose not to fix before Sprint 4, each with a severity and a reproduction.

Evidence to keep:

- `docs/release-candidate.md` with every section filled against one sha.
- `docs/evidence/12-3-jest.txt` and `docs/evidence/12-3-e2e.txt`, each from the final sha.
- `docs/evidence/12-3-headers.txt` from `curl -I` against the public URL.
- `docs/evidence/12-3-phone.png`, a screenshot from your phone on mobile data showing the core screen on the live URL.
- The tag `rc-1` on GitHub pointing at the sha in the file.
- A test added for every bug the review found, so each one has a line in the Jest output that proves it stays fixed.

The live URL now runs `rc-1`. Sprint 4 polishes on top of it and tags `rc-2`; demo day records against whichever tag is live then.

## Side quests

The vulnerability quick reference is the longer list behind the five requests you sent today, the observability sheet is what to read before deciding what "broken" will mean once the app is live without you watching it, and the availability sheet turns your three recovery numbers into the language reviewers use for them.

## Before next session

Sprint 4 is the last build session: a bug hunt in a private window and on the phone, a 404 page, loading and empty and success states on every screen that lacks them, a README someone can run from, and the recorded rehearsal of the five-minute demo. Before then, install nothing new and change nothing on `main`; write down, as you use the live URL over the next days, every rough edge you notice, with the screen it happened on. That list is Tuesday's first hour. Reread `docs/pitch-deck.md` or `docs/stakeholder-brief.md` from 11-4, whichever your road wrote, open the Google Slides deck it links, and mark every slide whose screenshot no longer matches the product.

Nothing stays running on your machine. The live URL runs `rc-1` and keeps running; that is what the drill was for.
