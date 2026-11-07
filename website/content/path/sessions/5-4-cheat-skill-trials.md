---
editorial: true
title: Cheat Skill Trials
subtitle: Rebuild a Feature at 10x Speed
hook: "The trial. Pick one feature of the hall you built by hand, write its acceptance cases down, delete it on a branch, and have the agent rebuild it to the same contract while a clock runs. The number you get is the number you get; the log is the evidence, and main gets the merge."
read: 60
artifact: "One hall feature rebuilt on branch ai-feature-<name> and merged to main, with a timed before-and-after in docs/prompt-log.md: the contract, the baseline and where it came from, every prompt, the regression rerun, and a retrospective written without the assistant open"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://code.claude.com/docs/en/common-workflows
  - https://code.claude.com/docs/en/checkpointing
  - https://code.claude.com/docs/en/memory
  - https://cursor.com/docs/agent/overview
  - https://git-scm.com/docs/git-restore
  - https://mongoosejs.com/docs/api/model.html
say:
  - "Hold the scope still. Same cases, same starting commit, same definition of done, then compare."
  - "The number includes review and repair. A twenty-minute patch with an hour of cleanup is an eighty-minute patch."
  - "The trial is over when the old breaks stay fixed, not when the scripted click succeeds."
---

## The hook

Every isekai has the trial: the tournament, the dungeon, the moment the hero proves the skill is real. This is yours. You know the six lines, you know how to show the model your own code and make it list the cases before it writes, and you have an agent installed that edits files on a branch you control. What you do not have is a number. "10x" is the subtitle of this session, and it is the claim made about tools like these on every landing page. Today you measure it on your own hall, with the scope held still, and you write down whatever comes out.

The feature is one you built by hand in 4-15. The demonstration uses the spend flow: `POST /api/pack/spend` with its conditional update, the 409 that leaves the quantity alone, and the control on the pack screen that waits for a 2xx before the number changes. You write the acceptance cases from `HALL.md` before anything else, you delete the feature on a branch named `ai-feature-spend`, and the agent rebuilds it to the same contract while you time five categories, including the review and the repair. When the old cases pass again, the branch is merged into `main`, because Unit 6 deploys `main` and this unit ends with the hall in a state that can be deployed. The retrospective is written with the assistant closed.

> *Any fool can claim a power. The guild wants the spellbook with the timings in the margin.*

## The idea

A comparison is only as honest as its two ends. The assisted end is easy to measure: a clock and five categories. The unassisted end is the problem, because you built spend three sessions ago and did not time it. There are two honest sources. If you committed as you went in 4-15, `git log --format='%ci %s'` gives timestamps for the commits that touched the pack, and the gap between the first and the last is a baseline with a source. If you did not, you estimate, and you label the estimate as one, with how you arrived at it. An unlabeled guess sitting next to a measured number is how a 1.8x becomes a 10x in the retelling.

Then hold everything else still. Same acceptance cases, written before the clock starts. Same starting commit, which is why the feature is deleted on a branch rather than rebuilt beside itself. Same definition of done: the cases pass, the diff is read, the explanation is yours, the old breaks were rerun. If the rebuilt version has fewer cases than the original, it is not the same feature and the number means nothing. If the agent reused a design you handed it, say so; a brief that contains the conditional update is a head start the 4-15 version did not have.

Measure elapsed time in five categories: preparation, implementation, review, testing, and repair. Waiting for the agent counts. Reading its diff counts. The follow-up that fixed the 400 it wrote where a 409 belonged counts. The number people quote is the implementation column alone, and that column is the one that makes the tool look like magic. The whole row is the number you keep.

Last, the maintenance cost. Read the rebuilt code with the chat closed. Can you point at the entry, the validation, the one database call, and the error boundary? If understanding requires reconstructing a conversation, the feature is not done, and you either rewrite that part yourself or ask for comments that explain decisions rather than narrate assignments. You remain responsible for the behavior you accept. That sentence is the whole unit.

What you should be able to draw on a napkin: a contract written first. A baseline with its source named. A branch where the feature is gone. Five timed columns in a row, summed. The same contract rerun on the rebuild. A merge into `main` only when every line of the contract holds. A retrospective that names one prompt improvement, one verification improvement, and one task where the assistant was slower.

![](diagram:session-5-4/fig1-model)

### Define the experiment before the timer starts

Choose a feature you have already implemented and can verify without help. Write the behavior contract before touching anything: the normal path, an invalid input, an empty result, a failure state, and a case about who is allowed. For spend, from `HALL.md`: a spend that fits decreases the holding and answers 200 with the new quantity; a spend larger than `qty` answers 409 and the quantity is unchanged afterward; the catalog document is unchanged by any spend; an `amount` that is missing, zero, negative, or not an integer answers 400; no token answers 401; the pack screen shows the new number only after a 2xx and keeps the old one on a 409. Seven lines. Those are the trial.

Freeze the start. Commit anything pending on `main`, make the branch, remove the feature in one commit so the diff of the rebuild is the rebuild and nothing else. The experiment is about the workflow, not about proving a predetermined speedup. "10x" is the theme, not a required conclusion, and a slower result is a finding.

### Build an evidence table

For each contract line, record the baseline behavior on `main`, the rebuilt behavior on the branch, and the evidence you used to judge it. A screenshot shows the number on the screen; it cannot show that the quantity in Mongo stayed at 2 after the 409. A curl shows a status; it cannot show the screen waited for the 2xx. Match the evidence to the claim. Where you cannot run something today, write the command you would run and the result you expect, and mark it not run. Include one adversarial question that fits the feature. What happens if two spends for the whole quantity arrive at the same moment? The conditional update is the answer, and the agent's first draft often does not have it.

### Plan the chain before prompting

Say the feature in one sentence. List the functions it touches: the `spend` helper, the `spendRoute` handler, and the route line in `hall-api`, the pack component's spend control in `hall-client`. `transfer` is not on the list. It calls `spend`, so it is a caller you re-run, not a function you rebuild. Map the prompts: plan first with the cases listed, then the route, then the control, then the edge cases, each one's output carried into the next, the way 5-2 did by hand and 5-3 did with files. Planning before prompting is faster than discovering what you need on the fly, and the plan is the first entry in the log, timed under preparation.

### Turn the result into a practice

The retrospective names one prompt improvement, one verification improvement, and one task type where assistance was slower or worse. A slower result can still teach a boundary: the feature was too small for the setup, the facts file was missing a convention, the contract changed halfway. Preserve those facts instead of rewriting the story into a victory. The strongest demonstration is someone else reproducing your result from the log. That is a repeatable process, not a lucky chat.

## The demonstration

One trial, timed, with the spend flow. Both servers are stopped from last session; both repos are on `main` with the 5-3 merge. Keep a stopwatch, or write the clock time at each category boundary; `date` in the terminal is enough.

**Preparation.** Start the log entry.

```markdown
## 5-4 trial: spend

Baseline: 4-15 commits touching the pack ran from 14:05 to 15:40 by git log, about 95 minutes, including the negative-pack bug I forced on purpose. Source: git log --format='%ci %s' on main.

Contract (written before the clock):
1. POST /api/pack/spend with amount that fits: 200, body has the new qty.
2. amount larger than qty: 409, and GET /api/pack shows qty unchanged.
3. GET /api/items shows the item unchanged after any spend.
4. amount missing, 0, negative, or not an integer: 400.
5. No token: 401.
6. Screen: number changes only after a 2xx; stays on 409.
7. Two spends for the full qty at once: at most one succeeds (conditional update).

Scope: spend(ownerId, itemId, amount), spendRoute, and the route line in hall-api/server.js; the spend control in the pack component in hall-client. transfer is untouched and re-run, because it calls spend.
Clock: prepare ___ implement ___ review ___ test ___ repair ___
```

Then the branch and the removal, in the API first.

```bash
cd ~/projects/hall-api
git switch -c ai-feature-spend
```

Delete the `spend` helper, the `spendRoute` handler, and the `app.post('/api/pack/spend', ...)` line in `server.js`, nothing else. `transfer` stays exactly as 4-15 left it. It still names `spend`, and Node does not mind until a transfer runs, which none will until the rebuild lands. Start the server and prove the absence:

```bash
node --env-file=.env server.js
```

and in the second terminal, with Bran's token in `$BRAN` and a lamp-oil id in `LAMP_OIL_ID`:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4100/api/pack/spend -H "Authorization: Bearer $BRAN" -H 'Content-Type: application/json' -d '{"item":"LAMP_OIL_ID","amount":1}'
```

`404`, from the 404 middleware you mounted in 4-3. Commit: `git commit -am "5-4: remove spend for the trial"`. Do the same in `hall-client`, same branch name, deleting the spend control from the pack component and committing. Write the preparation minutes. Expect eight to ten.

**Implementation.** Ctrl-C the server. Start the agent in `hall-api`. The brief carries the contract, because the contract is the specification and the agent should be judged against it, not against what it guesses `spend` means.

```text
Task: Rebuild POST /api/pack/spend. First list the cases you will satisfy, then write the helper spend(ownerId, itemId, amount), the handler spendRoute(req, res), and the route line, then stop.
Purpose: The pack screen debits a holding. Two spends for the whole quantity can arrive together; the quantity must never go below zero.
Output: a diff to server.js only, then the curl commands for cases 1, 2, 4, and 5 below with their expected statuses.
Constraints: Holding has owner, item, qty with min 0 and a unique index on owner plus item. Mount behind requireUser. Error bodies are { "error": "..." }. transfer already calls spend(ownerId, itemId, amount) and expects it to return the updated holding or throw an Error with a status of 400 or 409; keep that signature and that behavior, and let the existing error handler turn the throw into the JSON body. Do not add packages, do not change schemas, do not touch give, transfer, pack, or any message handler.
Contract:
1. amount that fits: 200 with the updated holding.
2. amount larger than qty: 409 { "error": "not enough" }, quantity unchanged.
4. amount missing, 0, negative, or non-integer: 400.
5. no token: 401.
7. concurrent spends: one database operation decides, not a read followed by a save.
```

Watch for the plan: it should name a single `findOneAndUpdate` with `qty: { $gte: amount }` in the filter and `$inc: { qty: -amount }` in the update, returning the new document, with `null` meaning 409. If the plan says "find the holding, check the quantity, subtract, save," stop it before it writes and point at line 7. That intervention is implementation time. The shape to expect:

```js
// fragment: the shape to expect from the rebuild, reviewed before accepting
async function spend(ownerId, itemId, amount) {
  if (!itemId || !Number.isInteger(amount) || amount < 1) {
    const error = new Error('item and a positive integer amount are required');
    error.status = 400;
    throw error;
  }
  const holding = await Holding.findOneAndUpdate(
    { owner: ownerId, item: itemId, qty: { $gte: amount } },
    { $inc: { qty: -amount } },
    { new: true }
  ).populate('item');
  if (!holding) {
    const error = new Error('not enough');
    error.status = 409;
    throw error;
  }
  return holding;
}

async function spendRoute(req, res) {
  res.json(await spend(req.userId, req.body && req.body.item, req.body && req.body.amount));
}

app.post('/api/pack/spend', requireUser, spendRoute);
```

The helper keeps the signature `transfer` calls, and it throws instead of answering, because `transfer` has no `res` to hand it. The route handler is thin on purpose. If the draft folds the two into one `spend(req, res)`, `transfer` breaks the moment it runs, and the constraint said not to touch it. Send the draft back.

Then the client, in its own repo and its own agent session, with the response shape pasted into Purpose: "`POST /api/pack/spend` answers 200 with the updated holding, 409 with `{ error }` when it does not fit; the number on screen changes only after a 2xx." Scope: the pack component only. Write the implementation minutes when the second diff exists. Expect ten to fifteen, including the time you spent reading the plan.

**Review.** Outside the agent, in each repo, `git diff --stat` and then `git diff`. The API diff is two functions and one route line, and `transfer` does not appear in it. The client diff is one handler and the markup around it. Anything else is rejected with `git restore <file>` before testing starts. Read the function with the diagnosis named Lost understanding in mind: can you say why the filter has `$gte` and why `new: true` is there? Review minutes. Expect ten to fifteen for a diff you read properly; a review that takes two minutes was a skim.

**Testing.** Start the server. Run the contract.

```bash
curl -s -X POST http://localhost:4100/api/pack/spend -H "Authorization: Bearer $BRAN" -H 'Content-Type: application/json' -d '{"item":"LAMP_OIL_ID","amount":1}'
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4100/api/pack/spend -H "Authorization: Bearer $BRAN" -H 'Content-Type: application/json' -d '{"item":"LAMP_OIL_ID","amount":50}'
curl -s -H "Authorization: Bearer $BRAN" http://localhost:4100/api/pack
curl -s http://localhost:4100/api/items
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4100/api/pack/spend -H "Authorization: Bearer $BRAN" -H 'Content-Type: application/json' -d '{"item":"LAMP_OIL_ID","amount":0}'
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:4100/api/pack/spend -H 'Content-Type: application/json' -d '{"item":"LAMP_OIL_ID","amount":1}'
```

Line one is the holding JSON with `"qty":1` if Bran had 2. Line two is `409`. Line three shows the lamp-oil holding still at `"qty":1`. Line four shows lamp oil with `name` and `kind` and no `qty`. Line five is `400`. Line six is `401`. For line 7 of the contract, fire two spends for the full quantity in one shell line with `&` between them and `wait`; one is 200 and one is 409, and the pack shows 0, never a negative. Then the screen: `npm run dev` in the client, log in as Bran, spend one, watch the number wait for the response, spend fifty, watch it stay. Then the regression set: one transfer from Bran to Sera through `POST /api/pack/transfer`, because `transfer` was not touched and calls the rebuilt `spend`, so a 200 with `yours` and `theirs` is the proof that the helper came back with the same signature; and the five message statuses from `HALL.md`, because the agent was told not to touch messages and the way to know it listened is to look. Testing minutes.

**Repair.** The usual miss is case 4: the draft accepts `amount: "1"` because a string that parses is not an integer and the check was `amount < 1`. One follow-up, one more diff, rerun lines one through six. Repair minutes. Then the table:

```markdown
Clock: prepare 9, implement 13, review 14, test 11, repair 6. Total 53.
Baseline 95 (git log). Ratio 1.8x. Implement column alone would claim 7.3x; that column is not the number.
```

**Explain it with the chat closed.** Close the agent. In the log, three sentences in your own words: what used to happen on a spend that did not fit, what happens now, and which line decides it. If you cannot write them, the feature is not yours yet. Read the diff again until it is.

**Merge.** Every contract line holds, every regression line holds, the explanation is written. In each repo:

```bash
git switch main && git merge ai-feature-spend && git log --oneline -3
```

`Fast-forward`, then three lines whose top two are the removal and the rebuild. `main` now has the rebuilt spend, the 5-3 change, the unread count, and `CLAUDE.md`. That is the state Unit 6 deploys.

Here is a small model you can run here. It proves that a ratio changes depending on which columns you count, and that a comparison with a different contract or a different starting commit is not a comparison. It does not time anything and it does not know whether your spend is right. The seven lines and the merge know that.

```js run=checkpoint-5-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

var baselineMinutes = 90;
var assisted = { prepare: 8, implement: 12, review: 15, test: 10, repair: 5 };

function total(row) {
  return Object.keys(row).reduce(function (sum, key) { return sum + row[key]; }, 0);
}

function ratio(baseline, minutes) {
  return Math.round((baseline / minutes) * 10) / 10;
}

check(total(assisted) === 50, 'Include the entire workflow');
check(ratio(baselineMinutes, total(assisted)) === 1.8, 'Measured speedup is 1.8x, not a promised 10x');
check(ratio(baselineMinutes, assisted.implement) === 7.5, 'counting only the implement column inflates the number');

var contract = ['fit 200', 'over 409', 'qty unchanged', 'catalog unchanged', 'bad amount 400', 'no token 401', 'screen waits for 2xx'];
var original = { start: 'a1b2c3', cases: contract, passed: contract.length };
var rebuilt = { start: 'a1b2c3', cases: contract, passed: contract.length };
var shrunk = { start: 'a1b2c3', cases: contract.slice(0, 4), passed: 4 };

function fair(a, b) {
  return a.start === b.start && a.cases.join('|') === b.cases.join('|');
}

check(fair(original, rebuilt) === true && rebuilt.passed === contract.length, 'the scope held: the same cases pass after the rebuild');
check(fair(original, shrunk) === false, 'fewer cases is a different feature, not a faster one');

function mergeable(run, regressions) {
  return run.passed === run.cases.length && regressions.every(Boolean);
}
check(mergeable(rebuilt, [true, true, true, true, true]) === true, 'every contract line and every regression line holds before the merge');
check(mergeable(rebuilt, [true, true, false, true, true]) === false, 'one regression keeps the branch off main');

console.log('ok: checkpoint-5-4');
```

## Where it breaks

![](diagram:session-5-4/fig2-diagnosis)

### Unfair speed comparison

The assisted attempt finishes in twenty minutes and the unassisted number is a guess about a larger task, so the ratio proves nothing. The cause is scope that moved: fewer cases, a brief that contained the design, a baseline with no source, or an implement column quoted as the total. Hold the scope still. Same acceptance lines, same starting commit, same definition of done including the read-through you can explain. Name the baseline's source. Then compare whole rows. Speed without the same finish line is a story about typing.

### Lost understanding

The feature works and you cannot say why the filter has `$gte`. The cause is accepting a diff you skimmed because the curls passed. Close the assistant and explain the change: what used to happen, what happens now, which line owns it, what you would delete if the rule reversed. If you cannot, you do not have the change yet; you have a demo. Read the diff until the explanation is yours, or rewrite that function by hand on the same branch. The point of the trial is that you remain the person who can maintain the hall.

### Demo-only success

The happy path clicks through on your machine and the cases that failed in 4-15 were never run again. A demo is one input. The cause is treating the scripted click as the finish line. Rerun the original failure, the spend of fifty, the missing amount, the request with no token, the transfer that calls the rebuilt helper, and the five message statuses the agent was told not to touch. Write down which of those you actually ran. The branch goes into `main` when the old breaks stay fixed, not when the scripted click succeeds.

## Your turn

Your trial, on your hall, with the tool from 5-3. Pick one of three features from 4-15, each with a route and a screen: the spend flow from the demonstration, the inbox read with its recipient door plus the inbox list, or the transfer between two accounts plus whatever control you built for it. Pick the one you understand best, because you are the verifier.

1. Write the `## 5-4 trial: <feature>` entry: the baseline with its source (`git log --format='%ci %s'` on `main`, or an estimate labeled as one), the contract as numbered lines taken from `HALL.md`, the scope as function names in each repo, and an empty clock line.
2. In `hall-api`: `git switch -c ai-feature-<feature>`, delete the handler and its route line, start the server, curl the route, read `404`. Commit the removal. Same in `hall-client` for the control. Write the preparation minutes.
3. Give the brief with the contract inside it, plan first. Stop the agent if the plan contradicts a contract line. Accept the diff. Repeat in the client with the response shape in Purpose. Write the implementation minutes.
4. `git diff --stat` in each repo names only the files in scope. Read both diffs in full. Reject anything else with `git restore <file>`. Write the review minutes.
5. Run every contract line with curl and on the screen, then the five regression statuses. Paste the outputs under the contract, one per line. Write the testing minutes.
6. Fix what failed with one follow-up per failure, rerun, write the repair minutes. Fill the clock line and compute the ratio for the whole row and, separately, for the implement column, so you can see the gap.
7. Close the agent and write the three-sentence explanation. Merge in both repos: `git switch main && git merge ai-feature-<feature>` prints `Fast-forward`. `git log --oneline -1` on `main` shows the rebuild commit.
8. Start both servers one last time, `node --env-file=.env server.js` on 4100 and `npm run dev` on 5173, log in, and walk the feature once on `main`. Stop both.

If a contract line fails after two repairs, keep the branch, do not merge it, write `not merged` and the failing line at the top of the entry, and `git switch main`. The hall on `main` still has the hand-built feature. That is also a result.

## The quest

![](diagram:session-5-4/fig3-evidence)

The deliverable is the rebuilt feature on `main` and the `## 5-4 trial` entry in `docs/prompt-log.md` that lets someone else reproduce the trial.

- Contract and baseline. The numbered lines, written before the clock, and the baseline with its source.
- Prompts. Every brief and every follow-up, at least four, with the tool and model at the top of the entry. Mark which contract lines each prompt was aimed at.
- Evidence table. One row per contract line: behavior on `main` before, behavior on the branch after, and the evidence, pasted. The regression set below it. The concurrent-spend line, or your feature's equivalent, with the two statuses.
- Clock. Five columns, the total, the whole-row ratio, the implement-only ratio, and one sentence about the difference.
- Rejects. Files or hunks refused and why. If none, which sentence of the brief you credit.
- Explanation. The three sentences written with the assistant closed.
- Retrospective, written alone. One prompt improvement. One verification improvement. One task where the assistant was slower or worse, with the reason. Three things it was good at today, with the evidence line that shows it. Whether you could have run this trial in Unit 1, in two sentences. How you will use these tools in the capstone, in two sentences.
- Merge. `git log --oneline -3` from `main` in each repo.

Finish `docs/prompt-library.md` with a `## Lessons learned` section: the prompts from the trial that worked, with the contract line they satisfied, and the ones that did not, with what was missing. Ten templates across the four sessions is the number to aim for; the four you have plus the chain recipe plus the trial's briefs get you there.

Evidence: `main` in both repos containing the merge, or the branch and the `not merged` line; the log entry with all eight parts; the library with its lessons section; `CLAUDE.md` still at the root of `hall-api`; both servers start on 4100 and 5173 and the feature works on `main`.

## Side quests

Reading a diff you could have accepted in a keystroke, then rerunning seven cases you already believe pass, is the grit sheet with a stopwatch on it, and a handler with one database operation that decides the outcome is the single-responsibility idea from the SOLID sheet applied to a route; read both before Unit 6 asks you to trust this code on a machine you cannot see.

## Before next session

This unit ends with the hall in a known state, and the next one deploys it. Check the state before you close the terminal: `main` in `hall-api` has `CLAUDE.md`, `docs/prompt-library.md`, `docs/prompt-log.md`, the unread count from 5-2, the 2000-character check from 5-3, and today's rebuild; `main` in `hall-client` has the badge, the remaining count, and today's control; `.env` is still ignored and still has `MONGODB_URI`, `JWT_SECRET`, `PAGE_ORIGIN`, and `PORT`; `node --env-file=.env server.js` listens on 4100 and `npm run dev` on 5173. If any of those is not true, fix it now, with or without the agent, because Unit 6 starts by renting a Linux machine and copying `main` onto it, and the first question on that machine is which commit you are deploying.

Read the [common workflows](https://code.claude.com/docs/en/common-workflows) page once, so the moves you made today have names you can look up, and keep the log. Every later unit adds entries to it, including the ones where the assistant writes an Nginx config you have to be able to read without it. Nothing is running. Both servers are stopped, both repos are on `main`, and the next session starts with a browser tab on a cloud provider and your SSH key from 1-4.
