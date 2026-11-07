---
editorial: true
title: Guild Operations
subtitle: Agile, SCRUM, Sprints, and Retros
hook: "A board on the wall does not clear dungeons. Today every Must story gets a size, the backlog becomes the four sprints Unit 12 actually runs, Sprint 1 gets a goal that fits, and you run your first retrospective on the work you already did in Unit 7."
read: 60
artifact: "docs/sprint-plan.md in the capstone repo: Fibonacci points on every Must and Should story calibrated against the guild hall, four sprints mapped to sessions 12.1–12.4 with capacity and slack, a Sprint 1 goal, a Definition of Done, the solo ceremonies, and a retrospective of Unit 7 with one experiment"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://scrumguides.org/scrum-guide.html
  - https://agilemanifesto.org/
  - https://www.atlassian.com/agile/project-management/estimation
  - https://www.atlassian.com/agile/scrum/sprint-planning
  - https://www.atlassian.com/agile/scrum/retrospectives
  - https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-text-and-number-fields
say:
  - "Points are relative. Login is a five because the unpaid list is a two."
  - "An XL has no number. Split it before it enters a sprint."
  - "Four sprints, four sessions. Slack is a line in the table, not a hope."
---

## The hook

Last session you pinned the quests to the board and ranked them. The board is honest, every card knows where it came from, and nothing is in the Sprint 1 column, because moving a card there is a promise and a promise needs a size. Today you put a number on every Must and Should story, and you do it without guessing hours, by comparing each story with something you have already built. The guild hall's login took you one session in 4.8 and again in 4.14. That is a five. A list page that fetches one resource is a two. Everything else is measured against those.

Then the backlog becomes a plan with the shape Unit 12 actually has: four sprints, one per session from 12.1 to 12.4, each with the session's hours plus the hours you will really give it before the next one, each with a capacity in points and a visible line for slack. Sprint 1 gets a goal in one sentence and a Definition of Done you can check with your eyes. And because a retrospective is a skill you practise, not a form you fill, you run one tonight on the Unit 7 test suite you finished last week and pick one experiment to carry into Unit 12.

> *A guild that spends six months planning the perfect raid arrives to find the dungeon patched. A guild that raids for a week, counts the loot, and adjusts clears it in two months.*

## The idea

### Plan a little, build a little, look

The old way treated software like a bridge: specify everything, build in sequence, test at the end, hope. Bridges do not change their minds halfway through. Software does, because users do, and because the first version teaches you things the specification could not know. The Agile Manifesto, written in 2001, is four preferences, and the things on the right still matter; when the two sides conflict, you lean left.

1. Individuals and interactions over processes and tools.
2. Working software over comprehensive documentation.
3. Customer collaboration over contract negotiation.
4. Responding to change over following a plan.

Agile is not "no planning". It is just enough planning, just in time: plan the next sprint in detail and the rest in outline, build, show it to someone, learn, and plan again with what you learned. The retro at the end of every sprint is where the learning gets written down, which is why skipping it is how a team repeats the same week forever.

### Scrum, sized for a party of one

Scrum is the most common frame for working that way. It is a framework, not a method: it gives you the structure and you fill in the details. The 2020 Scrum Guide, which is short and free and the one reference this session leans on, defines three accountabilities, the Sprint plus four events inside it, and three artifacts, each with a commitment.

| Accountability | Does what | On the capstone |
|---|---|---|
| Product Owner | Decides what and why; owns the backlog; speaks for the user | You, with `docs/research.md` open |
| Scrum Master | Protects the process; removes blockers; keeps the events honest | You, with a timer |
| Developers | Decide how and build it; own the Sprint Backlog | You, at the keyboard |

The Sprint is the container. A fixed length, scope does not change inside it, and a new Sprint starts the moment the last one ends. Inside it, four events:

- **Sprint Planning** at the start: pick stories from the backlog that serve one goal, within capacity. Output: the Sprint Backlog and a Sprint Goal in one sentence.
- **Daily Scrum**: fifteen minutes, every working day. What moved yesterday, what moves today, what is blocked. Solo, this is three lines in the plan file every day you work on the capstone.
- **Sprint Review** at the end: show the working increment to someone who cares. Working software, not slides. Solo, this is a two-minute screen recording of the real thing, which you watch back, and which you send to one interviewee if they offered to look.
- **Sprint Retrospective** after the review: what went well, what did not, what one thing changes next sprint. Solo, this is the template at the end of this page, filled honestly, with one experiment.

Three artifacts, three commitments: the Product Backlog commits to a Product Goal (your MVP sentence); the Sprint Backlog commits to a Sprint Goal; the Increment commits to a Definition of Done. Each artifact is a list, and each commitment is the sentence that says what the list is for.

On a large team these are three people and four meetings. On a capstone they are three hats and four habits, and the habits are the point. Pair programming is the fifth habit on real teams, driver and navigator swapping every twenty minutes; the solo version is explaining each chunk aloud to a rubber duck or to the AI chat from Unit 5, which exposes the gap between what you meant and what you wrote just as reliably.

### Relative size, calibrated on the hall

Developers are bad at hours, reliably off by a factor of two or three, and hours punish the honest estimator. People are good at comparing. Story points are relative sizes: a two is about twice a one, a five is bigger than a three by more than the numbers suggest, and the scale skips numbers on purpose so you cannot pretend to know the difference between a six and a seven.

T-shirt sizes are the beginner's scale and Fibonacci points are the one teams use; here is the one mapping this path uses, and the row that has no number is deliberate.

| Size | Points | Means | Guild hall reference |
|---|---|---|---|
| XS | 1 | Under an hour, no unknowns | A Mongoose field with validation; a label change |
| S | 2 | A few hours, one known shape | A list page that fetches one resource; an owner-scoped `PATCH` with a 404 for other owners |
| M | 3 | Most of a session | A create form with validation and an error state; a model, its seed, and its first route |
| L | 5 | A whole session, maybe spilling | Register and login with JWT, as in 4.8 and 4.14; a Supertest suite for the Must routes; deploying to Railway with variables and a domain |
| XL | none | Too big to estimate | "Build messaging", "add reminders by text" |

An 8 exists on the Fibonacci scale, and you may use it for an L that you know will spill; a 13 is a story that should already have been split; a 21 is a project. XL has no points at all. If you cannot estimate it, you do not understand it yet, and a story you do not understand does not enter a sprint. Split it until each piece has a number. The reminder text in the tutor ledger needs a text-message provider, a scheduler, and a consent flow, three things you have never built; it is XL, and it stays in Could until it is three stories or until Unit 10 changes what you know.

Planning poker is how a team estimates: everyone shows a card at once, and the disagreement between the two and the thirteen is the useful part, because it exposes a misunderstanding. Solo, you get the same effect by writing one sentence of reasoning next to every number, which is the rule for the sizes table in your file. If you cannot write the sentence, round up.

Velocity is the total of points finished in a sprint. After two sprints you know yours, and you use it to plan the third. It is a planning number, not a score, and the moment it becomes a target it stops measuring anything, because the only way to raise it is to inflate the estimates. Do not try to increase it. Try to predict it.

### Four sprints, because Unit 12 has four sessions

Unit 12 is not a week-long sprint with a Monday planning meeting. It is four build sessions, 12.1 Foundation, 12.2 Build, 12.3 Harden, and 12.4 Polish, on consecutive path days, with a demo in 12.5. A sprint on this path is one of those sessions plus the hours you give it before the next session begins. That is the shape the plan takes today, and the plan the learner in you writes has to fit the sprints the builder in you will run.

| Sprint | Session | What it is for | Hours (session + between) | Capacity, example |
|---|---|---|---|---|
| 1 | 12.1 Foundation | Models and seed, auth, one resource end to end, every other page stubbed | about 3 + 4 | 12 |
| 2 | 12.2 Build | The remaining Must stories and the pages that use them | about 3 + 6 | 13 |
| 3 | 12.3 Harden | Tests on the Must paths, the security pass from Unit 10, deploy on Railway | about 3 + 6 | 13 |
| 4 | 12.4 Polish | Should stories that fit, seed data for the demo, README, the demo script | about 3 + 3 | 8 |

The hours are yours to set, and setting them honestly is the whole exercise. Count the evenings you actually have between the sessions, not the ones you hope for. The capacity in points comes from the calibration: one session holds roughly the guild hall's login plus a list, a five and a two, so a session plus four evening hours holds something like ten to twelve points. Write the number, then plan under it, and leave the difference in the table as a row called slack. The slack is for the thing you did not predict, and there is always one.

Every Must story lands in Sprint 1 or Sprint 2. Sprint 3 is tests, security, and deploy, which Units 7, 10, and 6 taught and which take a full session whether or not you believe it. Sprint 4 is where Should stories go, if the first three left room, and where the demo gets its seed data and its script.

### The Sprint 1 goal and the Definition of Done

A sprint is not a calendar box with unrelated tickets in it. The goal is one sentence that names a capability a person will have at the end, and it is what you use to say no to a card halfway through. "A tutor can sign in, add a client, log a lesson, and see it in the unpaid list" is a goal. "Do stories 1, 2, 3" is a list. If capacity shrinks, you cut scope and keep the goal; the goal is what you renegotiate against.

The Definition of Done is the Increment's commitment, and it is a list of evidence, not a feeling. For the capstone, a card is Done when the acceptance examples pass by hand, the code is committed on a branch and merged to `main`, there is a Supertest or Playwright case for the path from Sprint 3 onward, the browser console is clean, and the card is in Done with a one-line note. Acceptance is not release: an increment can be Done and not yet deployed, and a deploy does not excuse a missing test.

### The board shows flow, the retro changes next week

Four columns: Backlog, Sprint 1, In Progress, Done. Only one or two cards live in In Progress at a time, because three half-finished stories are zero finished stories. A blocked card gets a reason and a next action written on it, not a red label. During a sprint, the daily three lines are about the board: which card moved, which one is stuck, what you do about it today.

A retrospective is three questions and one experiment. What went well, and keep doing it. What did not, and stop. What one thing changes next sprint, as a specific action with an owner, which is you. One experiment small enough to try before the next retro beats ten observations. At the next retro, check that one thing first.

The napkin version: size by comparing, not by clock. XL has no number. Four sprints, one per Unit 12 session, each with hours, capacity, and slack. A goal is a sentence about a person, not a list of cards. Done is evidence. One or two cards in progress. One experiment per retro.

![](diagram:session-8-3/fig1-model)

## The demonstration

The tutor ledger's backlog from last session, sized and shaped. The file is `docs/sprint-plan.md`. Copy the template into yours and fill it in; the filled example follows.

```markdown
# Sprint plan: <capstone-name>

## Shape
Four sprints, one per Unit 12 session, plus the hours between sessions.

| sprint | session | hours (session + between) | capacity | goal |
|---|---|---|---|---|
| 1 | 12.1 Foundation | | | |
| 2 | 12.2 Build | | | |
| 3 | 12.3 Harden | | | |
| 4 | 12.4 Polish | | | |

## Sizes
| # | story | size | points | why |
|---|---|---|---|---|

## Sprint 1
Goal: <one sentence about what a person can do at the end>

| # | story | points |
|---|---|---|
| | total | |
| | capacity | |
| | slack | |

## Sprints 2–4 (directional)
- Sprint 2:
- Sprint 3:
- Sprint 4:

## Definition of Done
- [ ] acceptance examples pass by hand
- [ ] committed on a branch and merged to main
- [ ] a Supertest or Playwright case for the path (from Sprint 3)
- [ ] no console errors
- [ ] card in Done with a one-line note

## Ceremonies, solo
- planning: first 30 minutes of each Unit 12 session, in this file
- daily: three lines under Daily log, every day I work on it
- review: a two-minute screen recording at the end of each sprint
- retro: the template below, one experiment

## Daily log
### <date>
- moved:
- today:
- blocked:

## Retro: <sprint or project>
### Went well
### Did not go well
### One experiment
- action:
- owner: me
- check at the next retro:
```

The sizes table, with the sentence that justifies every number. The story numbers are from `docs/user-stories.md`.

```markdown
## Sizes
| # | story | size | points | why |
|---|---|---|---|---|
| 1 | Sign up and log in | L | 5 | Did it in 4.8 and 4.14; still the most lines, two routes, a hash, a token, and a guard. |
| — | Client and Lesson models with a seed | S | 2 | Two models, one ref, a seed script; written four times in Unit 4. |
| 3 | Log a lesson | M | 3 | A form with a client select, a date, a fee, validation, and an error state. |
| 4 | Unpaid list | S | 2 | One query with paid = false and owner = me, sorted; a table and an empty state. |
| 5 | Mark paid | S | 2 | An owner-scoped PATCH and a button; the 404 for other owners is the only edge. |
| 2 | Add a client | XS | 1 | A name and a rate; it is the first screen of story 3. |
| 6 | Client page | M | 3 | A detail page with two lists and a total; new query shape. |
| 9 | Edit or delete a lesson | M | 3 | Two more owner-scoped routes and an edit form. |
| 8 | Monthly total | S | 2 | One aggregate over lessons I already have. |
| 7 | Statement link | L | 5 | A public route with a token I have not built before; a page with no login. |
| 10 | CSV export | S | 2 | One route that writes rows; no new model. |
| 11 | Reminder text | XL | — | Needs a text provider, a scheduler, and consent. Three unknowns. Split or leave in Could. |
```

Read the reasons. Login is a five not because it is hard but because it is the most lines and has the most places to go wrong, and you have the two earlier versions to measure against. The unpaid list is a two because it is a single query and a table you have built in every Unit 4 project. The statement link is a five because it is the one Should story with a shape you have never built. The reminder text has no number and the reason says why.

The sprint table with the hours filled for a learner who has two evenings between 12.1 and 12.2 and three between 12.2 and 12.3.

```markdown
## Shape
| sprint | session | hours (session + between) | capacity | goal |
|---|---|---|---|---|
| 1 | 12.1 Foundation | 3 + 4 | 12 | A tutor can sign in, add a client, log a lesson, and see it listed. |
| 2 | 12.2 Build | 3 + 6 | 13 | A tutor can see who owes what, mark it paid, and fix a mistake. |
| 3 | 12.3 Harden | 3 + 6 | 13 | The Must paths are tested, locked down, and live on Railway. |
| 4 | 12.4 Polish | 3 + 3 | 8 | A client can be sent a statement link; the demo has real-looking data. |
```

Sprint 1, selected within capacity, with the slack written down.

```markdown
## Sprint 1
Goal: A tutor can sign in, add a client, log a lesson, and see it listed.

| # | story | points |
|---|---|---|
| 1 | Sign up and log in | 5 |
| — | Client and Lesson models with a seed | 2 |
| 2 | Add a client | 1 |
| 3 | Log a lesson (and see it in a plain list) | 3 |
| | total | 11 |
| | capacity | 12 |
| | slack | 1 |

## Sprints 2–4 (directional)
- Sprint 2: #4 unpaid list (2), #5 mark paid (2), #6 client page (3), #9 edit/delete (3), #8 monthly total (2). Total 12 of 13.
- Sprint 3: Supertest for the Must routes (5), Unit 10 security pass (3), Railway deploy with a domain (3). Total 11 of 13.
- Sprint 4: #7 statement link (5), demo seed and README (2). Total 7 of 8.
```

Every Must is in Sprint 1 or 2. The two Could stories are not in any sprint, and the file says where they wait. If Sprint 1's slack turns out to be negative on the day, the goal says what to cut: the plain list in story 3 can wait for Sprint 2's unpaid list, and the goal still holds for sign in, add a client, log a lesson.

Now the board. Open the project from last session. Add a number field called Points: in the project's settings, Fields, New field, type Number, name `Points`; or from the terminal:

```bash
gh project field-create 1 --owner "@me" --name Points --data-type NUMBER
```

```text
Created field
```

On the Board view, type each card's points into the field, and drag the four Sprint 1 cards from Backlog into Sprint 1. Everything else stays in Backlog. The In Progress column is still empty, and it stays empty until 12.1, because a card in progress is a promise to today.

The retrospective. You have not run a capstone sprint yet, so the practice retro is on the Unit 7 test suite, which you finished in week 14. Here is the example filled; yours will have different rows.

```markdown
## Retro: Unit 7 test suite
Date: week 14

### Went well
1. Jest ran on the first try; no config fight.
2. Writing the Supertest cases found a real bug in the inbox route's 404.
3. Finished two evenings before 8.1 started.

### Did not go well
1. Three hours on one Playwright test that flaked on the login redirect.
2. Read the Playwright docs after getting stuck, not before.
3. One huge commit at the end instead of one per passing test.

### One experiment
- action: when stuck for thirty minutes, write the question down in full and
  put it to the AI chat before trying a fourth time; set a timer.
- owner: me
- check at the next retro: did the timer go off, and what happened next?
```

One experiment, not three. "Commit after every passing test" and "read the docs first" are real lessons, and they go in Went well and Did not go well as observations; the experiment is the one you will actually check in Sprint 1's retro.

Here is a small model you can run here. It proves that the size mapping gives an XL no number, that each of the four sprints fits its capacity with slack visible, that every Must story lands in Sprint 1 or 2, and that adding one more story to Sprint 1 is refused by the plan before the sprint starts. It does not prove your hours are honest or your fives are fives; the calibration against the hall is something only you can do.

```js run=checkpoint-8-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const SHIRT = { XS: 1, S: 2, M: 3, L: 5, XL: null };
function points(size) {
  if (!(size in SHIRT)) throw new Error('unknown size ' + size);
  return SHIRT[size];
}
check(points('L') === 5 && points('S') === 2, 'login is a five because a list is a two');
check(points('XL') === null, 'an XL has no number: split it before it enters a sprint');

const sprints = [
  { n: 1, session: '12.1', capacity: 12 },
  { n: 2, session: '12.2', capacity: 13 },
  { n: 3, session: '12.3', capacity: 13 },
  { n: 4, session: '12.4', capacity: 8 }
];
const backlog = [
  { id: 'login', size: 'L', moscow: 'Must', sprint: 1 },
  { id: 'models-seed', size: 'S', moscow: 'Must', sprint: 1 },
  { id: 'add-client', size: 'XS', moscow: 'Must', sprint: 1 },
  { id: 'log-lesson', size: 'M', moscow: 'Must', sprint: 1 },
  { id: 'unpaid-list', size: 'S', moscow: 'Must', sprint: 2 },
  { id: 'mark-paid', size: 'S', moscow: 'Must', sprint: 2 },
  { id: 'client-page', size: 'M', moscow: 'Should', sprint: 2 },
  { id: 'edit-delete', size: 'M', moscow: 'Should', sprint: 2 },
  { id: 'monthly-total', size: 'S', moscow: 'Should', sprint: 2 },
  { id: 'tests', size: 'L', moscow: 'Must', sprint: 3 },
  { id: 'security-pass', size: 'M', moscow: 'Must', sprint: 3 },
  { id: 'deploy', size: 'M', moscow: 'Must', sprint: 3 },
  { id: 'statement-link', size: 'L', moscow: 'Should', sprint: 4 },
  { id: 'demo-seed', size: 'S', moscow: 'Should', sprint: 4 },
  { id: 'reminder-text', size: 'XL', moscow: 'Could', sprint: null }
];

function plan(sprint, items) {
  const chosen = items.filter(function (s) { return s.sprint === sprint.n; });
  const total = chosen.reduce(function (sum, s) { return sum + points(s.size); }, 0);
  return { n: sprint.n, total: total, capacity: sprint.capacity, slack: sprint.capacity - total, fits: total <= sprint.capacity };
}

const plans = sprints.map(function (sp) { return plan(sp, backlog); });
check(plans.length === 4, 'four sprints, one per Unit 12 session');
check(plans.every(function (p) { return p.fits; }), 'every sprint fits its capacity');
check(plans.every(function (p) { return p.slack >= 1; }), 'unallocated capacity remains visible in every sprint');
check(plans[0].total === 11 && plans[0].slack === 1, 'Sprint 1 plans 11 of 12');

const musts = backlog.filter(function (s) { return s.moscow === 'Must' && s.size !== 'XL'; });
check(musts.every(function (s) { return s.sprint === 1 || s.sprint === 2 || s.sprint === 3; }), 'every Must lands in a sprint before Polish');
check(backlog.find(function (s) { return s.id === 'reminder-text'; }).sprint === null, 'the XL is in no sprint');

const overCommitted = plan(sprints[0], backlog.concat([{ id: 'client-page-too', size: 'M', moscow: 'Should', sprint: 1 }]));
check(overCommitted.fits === false && overCommitted.total === 14, 'one more card in Sprint 1 is refused before the sprint starts');

console.log('ok: checkpoint-8-3');
```

## Where it breaks

![](diagram:session-8-3/fig2-diagnosis)

### Ceremony without outcome

The symptom is a daily log full of entries and a board that has not moved in three days, or a planning half hour that ends with the same cards in the same columns. The cause is that the event ran because the calendar said so, not because a decision was waiting for it. The fix is to make every event produce something you can point at: an ordered Sprint column, a cut scope, a blocked card with a next action, a change you will try. If the daily three lines would have been the same as yesterday's, the real entry is "nothing moved, because X, so today I do Y". A retro that files no experiment and a planning session that reorders nothing were status updates, and status updates can be a sentence.

### Velocity used as a target

The symptom is estimates that creep upward sprint over sprint while the product does not, and a reluctance to pick the hard story because it will "hurt the number". The cause is treating velocity as a score instead of a forecast. The fix is to use it only in one direction: after Sprint 1, count what was Done, and use that count to decide how much Sprint 2 can hold. Never adjust an estimate to hit a number, and never compare your number with anyone else's; two people's threes are not the same three. The week velocity becomes a target, it stops measuring anything except the pressure to make the target.

### Retro produces no change

The symptom is a retro with six observations and a Sprint 2 that is identical to Sprint 1, including the three-hour flaky test. The cause is that observations were filed without an experiment, or with three experiments and no owner, so none of them happened. The fix is the template's last block: one action, small enough to try before the next retro, with a way to check whether it happened. At the next retro, review that one thing first, before any new observation. If it worked, keep it and pick the next one. If it did not, say why, and pick a smaller one. A retro that adds sticky notes and changes nothing has taught you that the meeting is optional.

## Your turn

The tutor ledger is sized and shaped. Now yours. The board from 8.2 is open in a tab and nothing is running on your machine.

1. Copy the template into `~/projects/<capstone-name>/docs/sprint-plan.md`. Fill the Sizes table for every Must and Should story from `docs/user-stories.md`, with a size, points, and one sentence of reasoning that names what you are comparing it with. Any story you cannot write the sentence for is XL: points `—`, and a note about how it splits.

2. Fill the Shape table. Count the real hours you have between 12.1 and 12.2, 12.2 and 12.3, 12.3 and 12.4, and 12.4 and 12.5, and write them down. Set each capacity from the calibration: one session is about a five plus a two. Write a goal sentence for every sprint that names what a person can do, not which cards are done.

3. Select Sprint 1. Login, the models and seed, and one resource end to end, under capacity, with the slack row filled. Check the sum by hand and check that every Must is in Sprint 1, 2, or 3. Write the Sprints 2–4 lines as story numbers with points and a "total of capacity".

4. Write the Definition of Done as the five checkboxes, adding any evidence your product needs, and the four solo ceremonies with the real time you will give each one.

5. Add the Points field to the board, in the project settings or with:

   ```bash
   gh project field-create <number> --owner "@me" --name Points --data-type NUMBER
   ```

   You should see `Created field`. Type each card's points in, then drag exactly the Sprint 1 cards into the Sprint 1 column. In Progress stays empty.

6. Run the practice retro on the Unit 7 test suite under `## Retro: Unit 7 test suite`, with at least two rows under Went well and Did not go well and exactly one experiment with a check.

7. Commit and push:

   ```bash
   git add docs/sprint-plan.md
   git commit -m "Sprint plan: sizes, four sprints, Sprint 1 goal, DoD, Unit 7 retro"
   git push
   ```

   You should see `main -> main`, and on the board, Sprint 1 holding only the cards whose points sum to at most its capacity.

If the sum in Sprint 1 is over capacity after step 3, do not raise the capacity. Cut the story that is furthest from the goal sentence and write it at the top of Sprint 2.

## The quest

![](diagram:session-8-3/fig3-evidence)

One deliverable: `docs/sprint-plan.md` in the capstone repo, pushed, with the board's Sprint 1 column matching its Sprint 1 table. It is complete when someone reading only that file could tell you what you will build on the first day of Unit 12, why those stories, and how you will know each one is done.

Evidence:

- A Sizes table with points and a reasoning sentence on every Must and Should story, and `—` on any XL with a note on how it splits.
- A Shape table with real hours, a capacity, and a goal sentence for each of the four sprints.
- A Sprint 1 table whose total is at or under capacity, with the slack row filled, and a Sprints 2–4 block that places every Must before Polish.
- A Definition of Done with at least five checkable lines, and the solo ceremonies with times.
- A screenshot of the board named `board-sprint-1.png` in `docs/`, showing Points on the cards and the Sprint 1 column matching the table.
- A Unit 7 retro with one experiment and a line saying how you will check it.
- The commit `Sprint plan: sizes, four sprints, Sprint 1 goal, DoD, Unit 7 retro` on GitHub.

## Side quests

Grit's training circle is plan, inspect, adapt told as a story, and the Open/Closed and Dependency Inversion rules on the SOLID page are what make a story Independent on the board: if finishing card four means reopening card two, that page names the coupling you have to cut before you estimate.

## Before next session

Finish the interviews. By 8.4 the log in `docs/research.md` needs P1, P2, and P3 written up, each within a day of its call; if one is still unbooked, message two more names tonight, because next session synthesises whatever is in the log and the spec is honest about how many that is. Nothing is running on your machine, and the board stays as you left it: Sprint 1 filled, In Progress empty. Next session starts with all three interviews open side by side, turns them into a combined empathy map and a set of insights, revises the backlog with a change log that names which row each change came from, and writes the product spec that Unit 12 opens on its first morning.
