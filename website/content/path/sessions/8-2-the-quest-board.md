---
editorial: true
title: The Quest Board
subtitle: User Stories, Backlogs, and Prioritization
hook: "An idea sentence and one practice interview become a backlog: fifteen to twenty user stories, each tagged evidence or assumption, acceptance examples for the top five, a MoSCoW cut, RICE scores, and a board with four columns where the capstone will be built."
read: 60
artifact: "docs/user-stories.md in the capstone repo: 15–20 stories tagged evidence or assumption, acceptance criteria for the top five, a MoSCoW sort with an MVP sentence, RICE scores for the top ten, and a GitHub Projects board with Backlog / Sprint 1 / In Progress / Done"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.atlassian.com/agile/project-management/user-stories
  - https://www.agilealliance.org/glossary/invest/
  - https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/
  - https://docs.github.com/en/issues/planning-and-tracking-with-projects/creating-projects/creating-a-project
  - https://docs.github.com/en/issues/planning-and-tracking-with-projects/understanding-fields/about-single-select-fields
  - https://cli.github.com/manual/gh_issue_create
say:
  - "As a who, I want what, so that why. No why, no story."
  - "Done is an example: given this state, this action, this result, and this refusal."
  - "A low RICE score does not demote a dependency. Login is a Must because the list needs an owner."
---

## The hook

Last session you learned to listen, and you have one practice conversation logged as P0 and three real ones booked. That is the intelligence phase. Today is the planning phase, and it starts with an uncomfortable fact: you do not have evidence yet. You have an idea sentence, one practice map, and a head full of assumptions. The honest move is not to wait. It is to write the backlog now and tag every story with where it came from, so that when P1, P2, and P3 have talked to you, 8.4 can go through the file and promote, demote, or delete each line with a reason.

In every guild hall there is a board with quests pinned to it. Some are urgent, some are lucrative, some are side quests nobody takes, and the guild leader decides which ones the party takes and in what order. By the end of this session `docs/user-stories.md` is that board on paper: fifteen to twenty stories in the "as a, I want, so that" shape, acceptance examples for the top five, a MoSCoW cut with a one-sentence MVP, RICE scores for the top ten, and a Won't list that proves you made a decision. The same stories go onto a real board, GitHub Projects by default, with four columns that Unit 12 will use exactly as you name them today: Backlog, Sprint 1, In Progress, Done.

> *The board is not a wish list. Every card on it is a promise to a person in the log, or a guess you have labelled as a guess.*

## The idea

### Where this sits in the life of the software

Software is made in phases, and coding is one of them. Planning asks what to build and why; that was 8.1. Analysis asks what exactly it must do; that is today, in the form of stories. Design asks how it should work and look; that is the end of today and 8.3, as a backlog and a sprint plan. Implementation, testing, and deployment are Unit 12, in four sprints, with the tools from Units 6, 7, 9, 10, and 11 in your pack by then. Maintenance is the quest that never ends. Most people who start out think software development is the coding phase. Founders know it is the phase in the middle.

The phases are not a waterfall, because 8.4 sends you back to analysis with real evidence, and Unit 12 sends you back to the backlog every sprint. The point of naming them is that you know which one you are in. Today you are not designing screens or choosing a database. You are writing down, in testable sentences, what a tutor can do with the product and why they would want to.

### A story is a sentence with a why

A user story is a short description of one capability from the user's side.

```text
As a <type of user>,
I want <some goal or action>,
so that <some reason or benefit>.
```

The shape forces three things that a feature list lets you skip. Who wants this, not "the app should". Why they want it, which is the benefit, not the feature. And a size small enough to build in a sprint, because a story that needs the paragraph to describe it is an epic wearing a story's clothes.

| Bad story | Why it fails | Good story |
|---|---|---|
| "Build login page" | No user, no reason | "As a returning tutor, I want to log in with my email and password, so that my clients and lessons are mine alone." |
| "Make the app fast" | Not measurable | "As a tutor on a phone, I want the unpaid list to load in under three seconds, so that I can check it between lessons." |
| "Add all the sharing features" | An epic, not a story | "As a tutor, I want a statement link for one client, so that chasing is a link rather than a personal text." |
| "Implement the database" | A task, not a capability | "As a tutor, I want my lessons saved when I close the tab, so that I never type the same lesson twice." |

INVEST is the checklist for a story that is ready to build. **I**ndependent: it can be built without waiting for another story. **N**egotiable: the details are a conversation, not a contract. **V**aluable: to the user, not only to you. **E**stimable: you could put a size on it, which 8.3 does. **S**mall: it fits in one sprint. **T**estable: you can write examples of done for it.

The familiar sentence is the start of a story, not the whole of it. "As a tutor, I want to see every unpaid lesson in one list, so that I know who owes me without opening three apps" names a decision the screen must support. "As a user, I want a dashboard" names a container. When a story could be satisfied by several different screens, that is fine; the acceptance examples pin the outcome and leave the design open.

### Evidence or assumption

Every story in today's file carries a `source` column, and the only two values are `evidence` with a participant id, or `assumption`. P0 is practice, so even stories drawn from P0 are honest only as "evidence: P0 (practice)". Most of today's rows will say assumption. That is not a failure of the backlog. It is the truth about a backlog written before the interviews, and it is what makes 8.4 possible: a file where every row knows its own provenance can be revised; a file of confident sentences cannot.

Attach the evidence, when there is any, as a pointer into `docs/research.md`: "P0, observation row 2". Separate the evidence from the proposed solution. Several designs could help a tutor find who owes them; the story preserves room to choose among them.

### Acceptance criteria are examples of done

Acceptance criteria are how you know a story is finished, written as a short list of conditions a person could check. The useful habit is to write three kinds of example: the normal case, a boundary, and a failure.

```text
Story: As a tutor, I want to see every unpaid lesson in one list,
so that I know who owes me without opening three apps.

- Given two lessons with paid = false and one with paid = true,
  the list shows the two, oldest first.
- Given no unpaid lessons, the list shows "Nothing owed" and no table.
- Given a lesson that belongs to another tutor, it does not appear.
- Given the request fails, the previous list stays on screen with an
  error line; it is not replaced by an empty "Nothing owed".
```

Avoid criteria like fast, intuitive, or secure without a context and an observation. If speed matters, name the interaction and a number. If authorization matters, name the actor and the forbidden action. A criterion is good when two people reading it would reach the same verdict from the same evidence. The examples above will become Supertest and Playwright cases in Unit 12, almost line for line, because you learned to write both in Unit 7.

### Slice vertically, not by layer

Splitting a feature into "database", "API", and "page" produces three cards that each feel like progress and none of which a tutor can use. Slice the other way: the smallest path a person can walk end to end. A read-only unpaid list for one tutor, with no filters, no export, and no reminders, is a complete slice. It exercises the model, the route, and the page, and it tests whether the information helps anyone decide whom to chase. Filters and exports are their own stories later.

Dependencies stay visible. The unpaid list needs lessons, lessons need clients, and all of them need an owner, which is why login is a Must even though no tutor ever asked for a login. Write that reason on the card. A technical task with a stated reason is better than a fake story about wanting to authenticate.

### MoSCoW: the cut line

MoSCoW is four buckets, and the point of it is the last one.

- **Must have.** The product does not do its one job without these. If you launched without one of them, a tutor could not answer "who owes me".
- **Should have.** Important, not critical for the first version. Sprint 3 and 4 material.
- **Could have.** Nice. If there is time, fine; if not, nobody notices.
- **Won't have, this time.** Explicitly out. Not never, not now. Writing these down is how you stop scope creep, because every tempting idea has a place to go that is not the current sprint.

Must has three to five stories, no more. If everything is a Must, nothing is. Each Must carries a one-sentence "because". The MVP is the Must list and nothing else, said as a sentence: who it is for, what it does, what it does not do. Minimum means smallest; viable means a real tutor could use it for a real week. A ramen shop's MVP is one excellent bowl of shoyu, not ramen without noodles and not a twelve-page menu.

### RICE and ICE: numbers that force the argument

RICE is a score for comparing stories when the buckets are not enough. **R**each: how many of your users this touches in a period; for a capstone, the honest unit is "of ten tutors, how many". **I**mpact: 3 massive, 2 high, 1 medium, 0.5 low, 0.25 minimal. **C**onfidence: 100% when you have evidence, 80% when you have a strong hunch, 50% when you are guessing. **E**ffort: how many sprints, or fractions of one.

```text
RICE = (Reach × Impact × Confidence) / Effort
```

Two examples with the numbers in them:

```text
Mark a lesson paid:   (10 × 2 × 1.0) / 0.5 = 40
Reminder text:        (6 × 2 × 0.5) / 3   = 2
```

ICE is the simpler cousin for when Reach is unknowable: Impact, Confidence, and Ease, each one to ten, multiplied. Use it if RICE feels like fiction.

The numbers are guesses, and the output is a conversation, not a verdict. A small change in a guessed Confidence should not reorder your roadmap. Compare the ranking with the dependencies and with what you want to learn first. Login scores 5 and is a Must; a 40 does not make "mark paid" buildable before an owner exists. Record why you chose the first few items. That paragraph is worth more than the table.

The napkin version: a story is who, what, why. Tag it evidence or assumption. Write done as examples: normal, boundary, failure. Slice end to end, not by layer. Sort into Must, Should, Could, Won't, with three to five Musts and a sentence for the MVP. Score the top ten with RICE, then argue with the score.

![](diagram:session-8-2/fig1-model)

### The board is a real place

A backlog in a file is the source of truth, because it is versioned with the code. A board is where you move cards during a sprint, and Unit 12 assumes one exists with exactly four columns: Backlog, Sprint 1, In Progress, Done. GitHub Projects is the default on this path, because it lives next to the repo, the cards can be the repo's issues, and `gh` can create most of it from the terminal. Trello and Notion are fine alternatives if you already live in one; make the same four columns and put the board's URL in the file. Do not spend an hour choosing. That is procrastination dressed as productivity.

In GitHub Projects a board's columns are the options of a single-select field called Status. A new board starts with Todo, In Progress, and Done. You rename Todo to Backlog and add Sprint 1 between it and In Progress, and from then on dragging a card is setting that field.

## The demonstration

The tutor ledger from last session, continued. The idea sentence is in the README, `docs/research.md` has P0, and three interviews are booked. Here is the backlog file written from that, with its honesty intact.

Copy this into `docs/user-stories.md` and fill it in. The filled example follows.

```markdown
# User stories: <capstone-name>

## Problem
<the idea sentence from README.md>

## MVP
<one sentence: who it is for, what it does, what it does not do>

## Stories
| # | story | source | MoSCoW |
|---|---|---|---|
| 1 | As a <who>, I want <what>, so that <why>. | assumption | Must |

## Acceptance criteria (top five)
### 1. <short name>
- Given <state>, <action> produces <result>.
- Given <boundary>, ...
- Given <failure>, ...

## MoSCoW
### Must (3–5)
1. <story #> because <one sentence>.
### Should
### Could
### Won't (this time)

## RICE (top ten)
| # | reach /10 | impact | confidence | effort (sprints) | score |
|---|---|---|---|---|---|

## Board
<URL of the project board>
```

The filled stories table. Twenty rows in the real file; the first thirteen are enough to see the shape.

```markdown
## Problem
Independent tutors keep track of which clients have paid in a spreadsheet,
and they lose track of who still owes them after the second missed lesson.

## MVP
For one independent tutor: log each lesson against a client, see every
unpaid lesson in one list, and mark lessons paid. No reminders, no
payments, no sharing in the first version.

## Stories
| # | story | source | MoSCoW |
|---|---|---|---|
| 1 | As a tutor, I want to sign up and log in, so that my clients and lessons are mine alone. | assumption (dependency) | Must |
| 2 | As a tutor, I want to add a client with a name and an hourly rate, so that every lesson I log is attached to the person who pays. | evidence: P0 (practice), row 1 | Must |
| 3 | As a tutor, I want to log a lesson with a client, a date, and a fee, so that every lesson I taught is written down once. | evidence: P0 (practice), row 1 | Must |
| 4 | As a tutor, I want to see every unpaid lesson in one list, so that I know who owes me without opening three apps. | evidence: P0 (practice), row 2 | Must |
| 5 | As a tutor, I want to mark a lesson paid, so that the unpaid list stays true. | evidence: P0 (practice), row 1 | Must |
| 6 | As a tutor, I want a page per client showing paid and unpaid lessons, so that I can answer "what do you owe me" before a call. | assumption | Should |
| 7 | As a tutor, I want a statement link for one client, so that chasing is a link rather than a personal text. | assumption (from P0 interpretation, row 6) | Should |
| 8 | As a tutor, I want a monthly total of paid and unpaid, so that I know what the month was worth. | assumption | Should |
| 9 | As a tutor, I want to edit or delete a lesson, so that a typo does not become a false debt. | assumption | Should |
| 10 | As a tutor, I want to export lessons as CSV, so that my accountant can have them. | assumption | Could |
| 11 | As a tutor, I want a reminder text sent after seven days unpaid, so that I do not have to write it myself. | assumption | Could |
| 12 | As a tutor, I want to take card payments in the app, so that paying is one tap. | assumption | Won't |
| 13 | As a tutor, I want a dark mode, so that the app is easier at night. | assumption | Won't |
```

Read the source column. Four rows point at P0 and say "practice" out loud. Row 7 is an assumption that grew from an interpretation, and it says so. Row 1 is a dependency with no user behind it, and it says so. Nothing in the file pretends.

Acceptance criteria for story 4 are the example from The idea. Here is story 5, because "mark paid" is where an ambiguous done hides.

```markdown
### 5. Mark a lesson paid
- Given an unpaid lesson, pressing Paid sets paid = true and the lesson
  leaves the unpaid list on the next render.
- Given a lesson already paid, Paid is not shown; Unpay is, and it reverses.
- Given a lesson owned by another tutor, the request is refused with 404
  and nothing changes.
- Given the request fails, the row stays unpaid and shows an error line.
```

The MoSCoW block with its reasons.

```markdown
### Must (3–5)
1. #1 login, because every other story needs an owner.
2. #3 log a lesson, because without lessons there is nothing to be unpaid.
3. #4 unpaid list, because it is the one question P0 opened three apps to answer.
4. #5 mark paid, because a list that cannot change is a spreadsheet.
### Should
#2 add a client is a Must in practice and is folded into #3's first screen;
#6, #7, #8, #9.
### Could
#10, #11.
### Won't (this time)
#12 payments (Unit 10 may change this), #13 dark mode, a mobile app,
multiple tutors sharing one ledger.
```

RICE for the top ten, with the effort in sprints. Reach is out of ten tutors.

```markdown
| # | reach /10 | impact | confidence | effort (sprints) | score |
|---|---|---|---|---|---|
| 5 | 10 | 2 | 1.0 | 0.5 | 40 |
| 3 | 10 | 3 | 0.8 | 1 | 24 |
| 4 | 10 | 3 | 0.8 | 1 | 24 |
| 2 | 10 | 2 | 0.8 | 0.5 | 32 |
| 9 | 8 | 1 | 0.8 | 0.5 | 12.8 |
| 6 | 7 | 2 | 0.5 | 1 | 7 |
| 1 | 10 | 1 | 1.0 | 2 | 5 |
| 8 | 6 | 1 | 0.5 | 0.5 | 6 |
| 7 | 6 | 2 | 0.5 | 1.5 | 4 |
| 11 | 6 | 2 | 0.5 | 3 | 2 |
```

The table says "mark paid" first and "login" seventh, and the plan will build login first anyway, because of the dependency. That is the score doing its job: it makes you say the reason out loud. The score also demotes the reminder text, which felt urgent after P0's awkward-text story, to a 2, because confidence is a guess and effort is three sprints. Write that sentence under the table.

Now the board. Stories become issues, so a card and a story are the same thing. Labels first, then the Must and Should rows as issues.

```bash
cd ~/projects/tutor-ledger
gh label create must --color d73a4a --description "MoSCoW: must have"
gh label create should --color fbca04 --description "MoSCoW: should have"
gh label create could --color 0e8a16 --description "MoSCoW: could have"
gh issue create --title "Unpaid list" --label must --body "As a tutor, I want to see every unpaid lesson in one list, so that I know who owes me without opening three apps. Source: P0 (practice), row 2."
```

```text
✓ Label "must" created in you/tutor-ledger
✓ Label "should" created in you/tutor-ledger
✓ Label "could" created in you/tutor-ledger

Creating issue in you/tutor-ledger

https://github.com/you/tutor-ledger/issues/1
```

One issue per Must and Should story, nine commands, the same shape. Then the project. `gh` needs the `project` scope, which the Unit 1 login did not ask for; refresh once, and the browser opens to approve it.

```bash
gh auth refresh -s project
gh project create --owner "@me" --title "tutor-ledger"
```

```text
✓ Authentication complete.
https://github.com/users/you/projects/1
```

That number, `1` here, is the project number. Link it to the repo and add the first issue as a card.

```bash
gh project link 1 --owner "@me" --repo you/tutor-ledger
gh project item-add 1 --owner "@me" --url https://github.com/you/tutor-ledger/issues/1
```

```text
Linked 'tutor-ledger' to repo 'you/tutor-ledger'
Added item
```

The columns are the one part done in the browser, because they are options of the Status field. Open the project URL. Switch the view to Board if it is not already. Open the project's settings from the menu at the top right, choose Fields, choose Status, rename `Todo` to `Backlog`, and add an option `Sprint 1` after it, leaving `In Progress` and `Done` as they are. Back on the board, every card you added sits in Backlog. Drag nothing yet. Sprint 1 is 8.3's decision. Paste the project URL under `## Board` in the file, commit, and push.

Here is a small model you can run here. It proves that a story sentence without a "so that" is rejected, that RICE ranks the example the way the table does, that a low score does not demote a dependency, that the Must bucket stays at five or fewer, and that scoring does not reorder the source file. It does not prove your stories are the right ones. Only P1, P2, and P3 can do that, and they do it in 8.4.

```js run=checkpoint-8-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function isStory(text) {
  return /^As an? [^,]+, I want [^,]+, so that .+\.$/.test(text);
}
check(isStory('As a tutor, I want to mark a lesson paid, so that the unpaid list stays true.'), 'who, what, why is a story');
check(!isStory('Add Redis.'), 'a task with no user and no why is not a story');
check(!isStory('As a tutor, I want a dashboard.'), 'a story without a so-that is not finished');

const stories = [
  { id: 'login', moscow: 'Must', source: 'assumption', reach: 10, impact: 1, confidence: 1.0, effort: 2, dependency: true },
  { id: 'log-lesson', moscow: 'Must', source: 'evidence:P0', reach: 10, impact: 3, confidence: 0.8, effort: 1 },
  { id: 'unpaid-list', moscow: 'Must', source: 'evidence:P0', reach: 10, impact: 3, confidence: 0.8, effort: 1 },
  { id: 'mark-paid', moscow: 'Must', source: 'evidence:P0', reach: 10, impact: 2, confidence: 1.0, effort: 0.5 },
  { id: 'reminder-text', moscow: 'Could', source: 'assumption', reach: 6, impact: 2, confidence: 0.5, effort: 3 },
  { id: 'dark-mode', moscow: 'Wont', source: 'assumption', reach: 2, impact: 0.25, confidence: 0.5, effort: 1 }
];

function rice(s) { return (s.reach * s.impact * s.confidence) / s.effort; }
const ranked = stories.slice().sort(function (a, b) { return rice(b) - rice(a); });
check(ranked[0].id === 'mark-paid' && rice(ranked[0]) === 40, 'RICE puts mark-paid first at 40');
check(ranked[ranked.length - 1].id === 'dark-mode', 'RICE puts dark mode last');
check(stories[0].id === 'login', 'scoring did not reorder the source backlog');

const login = ranked.find(function (s) { return s.id === 'login'; });
check(ranked.indexOf(login) >= 3 && login.moscow === 'Must', 'a low score does not demote a dependency out of Must');

const musts = stories.filter(function (s) { return s.moscow === 'Must'; });
check(musts.length >= 3 && musts.length <= 5, 'Must holds three to five stories');
check(stories.every(function (s) { return s.source === 'assumption' || /^evidence:P\d+$/.test(s.source); }), 'every story is tagged evidence or assumption');
check(stories.some(function (s) { return s.moscow === 'Wont'; }), 'at least one story is explicitly not this time');

console.log('ok: checkpoint-8-2');
```

## Where it breaks

![](diagram:session-8-2/fig2-diagnosis)

### Technical task masquerades as value

The symptom is a board full of cards like "Add Redis", "Set up the repo", "Implement the database", and no card a tutor would recognise. They feel like progress because they keep you busy. The cause is slicing by layer: you wrote down the work you know how to do instead of the outcome it is for. The fix is to write the user outcome the task unlocks and put the task underneath it. "Set up the repo" is legitimate as the first step toward "a tutor can log a lesson", and only as that. If you cannot name the outcome, the card is not ready. A board of tools is a shopping list. A board of outcomes is a plan.

### Story too large

The symptom is a card that sits in In Progress for two sprints: "Build the client section", or "Build messaging". The cause is that it crosses design, storage, permissions, and a page, so it cannot finish and cannot be reviewed, and the review in 8.3 has nothing to show. The fix is to split by a slice of the workflow a person can complete, not by layer. "See the unpaid list, read-only, for one tutor" ships and teaches you whether the model is right. "Finish the API, then the page, then the emails" does not. If a card would not fit in one of Unit 12's sprints, it is still a project, and INVEST's S is the letter it fails.

### Ambiguous done

The symptom is two readings of "a tutor can manage lessons" that both get marked done, one with delete and one without, and a demo in 8.3 that surprises the person who wrote the card. The cause is that the card was a slogan and never had an example. The fix is the three examples: given this state, this action produces this result, and this other action is refused. Write them before you start, and write the failure case too, because "the request fails and the list silently empties" is a bug you can only catch if you said in advance what should happen. The example is the requirement. The slogan is the title.

## Your turn

The example was the tutor ledger with its P0. Yours has its own idea sentence and its own P0. Nothing runs during this session; it is a file, nine `gh` commands, and one browser tab.

1. Open `~/projects/<capstone-name>/docs/research.md` and, with the P0 map beside you, copy the template into `docs/user-stories.md`. Write the problem line from the README and leave the MVP line empty until step 4.

2. Write fifteen to twenty stories in the table, every one in the who, what, why shape with a full stop, and fill the source column honestly: `evidence: P0 (practice), row N` or `assumption`. Run each row through INVEST and the bad/good table on your own; for every story you reject, write one line under the table saying why. Expect most rows to say assumption.

3. Write acceptance criteria for the five stories you expect to be Must: at least a normal case, a boundary, and a failure case each. Read each criterion and ask whether a Supertest case from Unit 7 could check it. If not, rewrite it until one could.

4. Sort into MoSCoW. Three to five Musts, each with a "because". At least two rows in Won't. Then write the MVP as one sentence: who, what it does, what it does not do. Check that the MVP is the Must list and nothing else.

5. Score the top ten with RICE, reach out of ten users, effort in sprints, and write one sentence under the table about any place where the ranking and the plan disagree and why the plan wins.

6. Create the labels and one issue per Must and Should story:

   ```bash
   cd ~/projects/<capstone-name>
   gh label create must --color d73a4a --description "MoSCoW: must have"
   gh issue create --title "<short name>" --label must --body "<the story sentence>. Source: <evidence or assumption>."
   ```

   You should see `✓ Label "must" created in YOU/<capstone-name>` once, and an issue URL ending in `/issues/N` for each story.

7. Create the board and add the Must and Should issues as cards:

   ```bash
   gh auth refresh -s project
   gh project create --owner "@me" --title "<capstone-name>"
   gh project link <number> --owner "@me" --repo YOU/<capstone-name>
   gh project item-add <number> --owner "@me" --url https://github.com/YOU/<capstone-name>/issues/1
   ```

   You should see a project URL of the form `https://github.com/users/YOU/projects/<number>` and then `Added item` once per issue.

8. In the browser, open the project, switch to the Board view, and edit the Status field: rename `Todo` to `Backlog`, add `Sprint 1` after it, keep `In Progress` and `Done`. Every card should be in Backlog. If you chose Trello or Notion instead, make the same four columns and one card per Must and Should story.

9. Paste the board URL under `## Board`, then commit and push:

   ```bash
   git add docs/user-stories.md
   git commit -m "Backlog: stories, acceptance criteria, MoSCoW, RICE, board"
   git push
   ```

   You should see `main -> main` in the output, and the file rendered on GitHub with the tables intact.

If a `gh project` command answers with a permissions error, the refresh in step 7 did not finish; run it again and approve the `project` scope in the browser.

## The quest

![](diagram:session-8-2/fig3-evidence)

One deliverable: `docs/user-stories.md` in the capstone repo, pushed, with the board live and linked. It is complete when every card on the board can be traced to a row in the file, and every row knows whether it is evidence or a guess.

Evidence:

- Fifteen to twenty stories, every one with a who, a what, and a so-that, and a `source` column that says `evidence: P0 (practice), row N` or `assumption`.
- Acceptance criteria for five stories, each with a normal, a boundary, and a failure example.
- A MoSCoW block with three to five Musts, each with a because, at least two Won'ts, and a one-sentence MVP.
- A RICE table for ten stories with one sentence explaining where the plan overrides the score.
- A board URL under `## Board` whose columns read Backlog, Sprint 1, In Progress, Done, with every Must and Should story as a card in Backlog.
- The commit `Backlog: stories, acceptance criteria, MoSCoW, RICE, board` on GitHub.

## Side quests

Single Responsibility is INVEST's "small" said about code, and the Strategy pattern is the shape of swapping RICE for ICE behind one `score(story)` call, which is what the model on this page quietly does.

## Before next session

Keep the interviews moving: by 8.3 at least one of P1, P2, P3 should be in the log, written up within a day of the call, and if someone cancelled, message the next name on the list tonight. Nothing is running on your machine; the board stays where it is, with everything in Backlog, because moving cards into Sprint 1 is a decision that needs sizes. Next session starts with the Must stories open and puts a number on each one, then shapes the backlog into the four sprints that Unit 12 actually runs.
