---
editorial: true
title: Field Work
subtitle: Real User Interviews and Sprint Planning
hook: "Three real people have talked to you. Today their words become a combined empathy map, a set of insights with counts instead of adjectives, a backlog revised line by line with a reason for every change, and the product spec that Unit 12 opens on its first morning."
read: 60
artifact: "docs/product-spec.md v1.0 in the capstone repo: research summary from P1–P3, combined empathy map and insights with validated and invalidated assumptions, the revised backlog with a change log, the four-sprint plan with a Sprint 1 goal and a learning criterion, and a recorded two-minute walkthrough"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.gov.uk/service-manual/user-research/analyse-a-research-session
  - https://www.gov.uk/service-manual/user-research/using-in-depth-interviews
  - https://www.gov.uk/service-manual/user-research/getting-users-consent-for-research
  - https://scrumguides.org/scrum-guide.html
  - https://docs.github.com/en/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects
say:
  - "Three of three said it. One of three asked for it. Those are different rows."
  - "A story is evidence when it cites a participant who exists in the log. Otherwise it is a hypothesis, and it says so."
  - "Write what result would change the plan before you watch anyone use it."
---

## The hook

This is the session the unit was built for. In 8.1 you wrote questions that could not be answered with a kind lie and booked the people who would answer them. In 8.2 you wrote the backlog anyway, tagging every row as evidence or assumption so that today could happen. In 8.3 you sized it and shaped it into four sprints. Now the log in `docs/research.md` has P1, P2, and P3 in it, and some of what they said agrees with your idea, and some of it does not. The part that does not is the valuable part. A founder who finds out they were wrong in week 15 is cheap. One who finds out in week 21 has built the wrong thing.

By the end of today, the three logs become one combined empathy map and a page of insights where every pattern carries a count, the backlog has a change log with a participant id next to every promotion, demotion, addition, and deletion, the four-sprint plan has been re-checked against the new backlog and still fits, and all of it is written into `docs/product-spec.md` as version 1.0 with a two-minute recorded walkthrough. That file is what 12.1 opens. It is also honest about its own limits: how many people, who was not represented, and what result from the first increment would change the plan.

> *The guild leader comes back from the taverns with a notebook. Not with a plan. The plan is what you write after you read the notebook twice.*

## The idea

### From notes to themes, with the links intact

Start with the anonymised notes, not with the feature list you hoped for. Read all three logs twice. On the second pass, mark the observation rows that repeat across participants, the workarounds, the costs in time or money, and the places where two people contradict each other. Group related observations and give each group a short name: "chasing is personal", "paid in blocks", "three apps to answer one question". Keep the link to the row each observation came from, so that another reader, or you in Unit 12, can check whether the theme is really in the notes.

Frequency is the number that matters, and it is small. "Three of three described checking more than one app to answer who owes them" is a pattern. "One of three asked for reminders by text" is a request. Both go in the file, in different rows, and the second one does not get to vote. Three interviews cannot give you a percentage, so do not write one. Write "two of three" and let the reader see the sample.

### The combined map and the insight page

The empathy map from 8.1, filled from all three logs at once, with the participant id after each entry. Says is quotes. Thinks is inference and says so. Does is actions with a count. Feels is what you heard or saw. Then the insight page in six blocks: patterns, each with a count; pain points, each pointing at a row; surprises, the things you did not expect; opportunities, where a step could be removed or a status made visible; validated assumptions, with the rows that validated them; and invalidated assumptions, with the rows that broke them. The last block is rarely empty, because an idea written before the interviews is rarely entirely right, so read the logs once more for the row that disagrees with you before you decide it is. An empty invalidated block is allowed when it is honest. Then it carries one line: which assumption you are least sure of, what evidence would overturn it, and the next question you will ask to find out. An empty block with no such line is the dishonest case, because it says you checked nothing.

### One problem statement and two alternatives

Choose one problem statement in four parts: a user, a context, an obstacle, and a consequence. "Independent tutors who are paid per lesson or per block lose track of who owes them after a missed lesson, and chasing feels personal enough that they sometimes write the money off" is a problem. "Tutors need a ledger app" is a solution wearing a problem's coat. Then write at least two responses to the problem, one of which is not software: a shared spreadsheet template with a calendar reminder, for instance. Comparing the capstone with the cheaper alternative tells you whether the software is proportionate, and it gives you the sentence a sceptical reader will ask for.

### Tag every story, then change the backlog in the open

Go through `docs/user-stories.md` row by row with the insight page beside it. For each story, the source column gets one of three values: `evidence: P1, P3` when participants who exist in the log support it, `hypothesis` when nobody did, or a strike-through when the evidence argues against it. A story may be valuable and unsupported; label it a hypothesis rather than pretend it came from research. That label is what makes the first increment a test instead of a guess.

Then the change log: every row that moved buckets, every row added, every row deleted, with the participant ids that caused it. "#8 monthly total: Should to Could, because zero of three think in months; P2 and P3 charge per term." "#6 client page: Should to Must, because three of three answer 'what do you owe me' per client, not per lesson." A reader should be able to trace each change back to a row in the log, and forward to a card on the board.

### Re-check the plan, do not inflate it

A promoted story has a size from 8.3, and the four-sprint table has capacities. Put the promoted stories where they go and read the slack rows again. Evidence adds stories; it does not add hours. If Sprint 2 would go over capacity, something leaves it, and the thing that leaves is the one furthest from the sprint's goal sentence. A new story that fits only if everything goes perfectly is written as "first pull if slack survives", not as a line in the total. The plan the learner wrote in 8.3 was a hypothesis about capacity; today's version is the same plan corrected by evidence about the product, and still honest about time.

### Sprint 1 is a learning instrument

The first increment exists to produce usable behavior and evidence at the same time. A read-only list for one tutor may be enough to find out whether the information helps anyone decide whom to chase. Reminders, payments, and charts wait until that core view proves useful. This is not lowering quality; it is reducing scope while keeping a complete interaction a person can finish.

Write the end-of-sprint conversation now, before any code exists. Which participant will try the increment, what task you will ask them to do with synthetic records, what you will watch for, and what result would change the plan. "P1 tries to find which client owes the most using seeded data; pass if she finds it in under a minute without help; if two of three testers fail, change the list, not add a tour." A test with no criterion written in advance can be narrated as a success no matter what happened. The criterion goes in the spec, in a block of its own.

### Trace one story back and one criterion forward

A review you can run alone: pick one Must story and trace it backward to the log rows that justify it; if you cannot find them, its tag is hypothesis. Then pick one acceptance criterion and trace it forward to the Supertest or Playwright case that will check it in Sprint 3; if you cannot describe that test in a sentence, the criterion is not testable yet. Write both traces in the spec's decision log. That is the solo version of a sceptical stakeholder, and it catches the same two faults.

Review the sample, too. If every participant uses the same workaround, you have learned about one segment. Write down who was not represented and how that limits the decision, so the next research round knows where to look. Do not replace that uncertainty with a persona that looks more precise than three conversations can justify. A persona built from the map is useful as a name you can say in a sentence; it is still three people.

### The spec is the handoff

The product spec is one file, `docs/product-spec.md`, and it exists so that 12.1 can start without reopening the argument. It carries the problem statement, the research summary with the combined map and insights, the persona if you built one, the MVP, the revised backlog with the Must stories and their acceptance criteria, the MoSCoW buckets, the four-sprint plan with Sprint 1 in full, the Definition of Done, the learning criterion, the alternatives you considered, the decision log, and the sample's limits. Version 1.0 is written today with however many interviews are in the log, and the spec says the number. If an interview is still outstanding, it is logged as it lands, and version 1.1, with every booked interview in it and the backlog re-tagged, is pushed before 12.1. The version line at the top makes that visible.

The napkin version: read the logs twice. Count patterns; do not vote on requests. Map and insights, with ids. One problem statement, two alternatives. Tag every story evidence or hypothesis. Change the backlog in the open, with ids. Re-check the four sprints without adding hours. Write the learning criterion before the code. Trace one story back and one criterion forward. Spec v1.0 today, v1.1 before 12.1.

![](diagram:session-8-4/fig1-model)

## The demonstration

The tutor ledger, with three real interviews in the log. The names are on the learner's phone; the file has ids. Here is enough of the log to see the work, then every artifact built from it.

```markdown
### P1
- date: 2026-11-07
- role: full-time tutor, 12 clients, paid per lesson
- consent: notes yes / recording no

| kind | text |
|---|---|
| observation | Keeps a spreadsheet with one row per lesson and a column "paid?"; updates it "on Sunday, if I remember". |
| observation | To answer "who owes me", opened the bank app, the spreadsheet, and two chats. "About ten minutes, and I was not sure at the end." |
| observation | "Asking twice is fine. Asking a third time, I would rather lose the money." |
| observation | Two parents pay a block of ten lessons in advance and she tracks the count on paper. |
| interpretation | The spreadsheet is the record; the chats are the chasing; nothing joins them. |

### P2
- role: tutors through an agency and privately, paid per term privately
- observation | Private clients pay per term; "I only find out someone has not paid when the term is half over." |
- observation | "I would never send an automatic text. It would feel like a utility company." |
- observation | Keeps a notes-app list per client with lessons and a running total. |

### P3
- role: music teacher, paid per term or per block of eight
- observation | Uses a paper diary; adds up what a client owes "by flipping back pages". |
- observation | "If I could just send them a page that says here is what you have had and here is what is owed, I would do that tonight." |
- observation | Has written off two blocks in a year rather than chase. |
```

The combined map, with ids on every entry.

```markdown
## Combined empathy map (P1, P2, P3)
| Says | Thinks (inferred) |
|---|---|
| "About ten minutes, and I was not sure at the end." (P1) | "I should have a system by now." (P1, P3) |
| "Asking a third time, I would rather lose the money." (P1) | "Chasing makes me look petty." (P1, P3) |
| "It would feel like a utility company." (P2) | "A page is neutral; a text is me." (P2, P3) |
| "I would do that tonight." (P3) | |

| Does | Feels |
|---|---|
| Opens two or more tools to answer who owes them (3 of 3). | Awkward when chasing (3 of 3). |
| Tracks blocks or terms, not only lessons (P1, P2, P3). | Resigned about written-off money (P1, P3). |
| Updates the record on a schedule, not at the lesson (P1). | Relieved when a client pays unprompted (P1). |
| Has written money off rather than ask again (P1, P3). | |
```

The insight page. Counts, not adjectives.

```markdown
## Insights
### Patterns
1. Answering "who owes me" means opening more than one tool. 3 of 3.
2. Chasing is personal, and a third ask is where people give up. 3 of 3 (P1 row 3, P2 row 2, P3 row 3).
3. Money is tracked per block or per term as often as per lesson. 3 of 3.

### Pain points
- Ten minutes and no confidence to answer one question (P1 row 2).
- Finding out mid-term that a term is unpaid (P2 row 1).
- Written-off money: two blocks in a year (P3 row 3), "rather lose it" (P1 row 3).

### Surprises
- Nobody wants automatic texts; two of three said a neutral page they could send would be different (P2 row 2, P3 row 2).
- Blocks and terms, not lessons, are the unit two of three think in.

### Opportunities
- One place that answers "who owes what" per client, without a text.
- A statement page per client that the tutor sends by hand.
- Blocks as a first-class thing a lesson draws down from.

### Validated assumptions
- Tutors lose track after a missed lesson (idea sentence): P1 row 2, P2 row 1.
- The awkwardness, not the spreadsheet, delays the chase (P0 interpretation, now evidence): P1 row 3, P3 row 3.

### Invalidated assumptions
- "Tutors track per lesson" (Lesson model, story 3): two of three charge per term or block; a lesson-only model misses the unit they think in.
- "A reminder text would help" (story 11): zero of three want it; two said it would feel robotic.
```

The problem statement, and the two alternatives, including the one that is not software.

```markdown
## Problem
Independent tutors who are paid per lesson, per block, or per term lose
track of who owes them after a missed lesson or mid-term, and chasing
feels personal enough that two of three have written money off.

## Alternatives considered
1. A spreadsheet template with a "paid?" column and a monthly calendar
   reminder to update it. Cheap; already what P1 does; does not solve the
   chasing, and the update happens "if I remember".
2. A notes-app list per client with a running total (P2's method). Answers
   one client at a time; nothing across clients; nothing to send.
3. The capstone: one place per tutor that answers who owes what, with a
   statement page per client the tutor sends by hand. Proportionate because
   the chasing, not the arithmetic, is the problem, and a neutral page is
   what two of three asked for unprompted.
```

The backlog change log, every line with an id.

```markdown
## Backlog changes (8.4)
- #6 client page: Should → Must. 3 of 3 answer "what do you owe me" per
  client, not per lesson (P1 row 2, P2 row 3, P3 row 1).
- #7 statement link: source assumption → evidence: P2, P3. Stays Should
  because it is a five; first card of Sprint 4.
- #8 monthly total: Should → Could. 0 of 3 think in months; P2 and P3
  charge per term.
- #11 reminder text: Could → Won't. 0 of 3 want it; P2 row 2, P3 row 2
  argue against it.
- NEW #14 "As a tutor, I want to record a block of prepaid lessons for a
  client, so that each lesson draws down from it and the owed amount is
  right." Should, evidence: P1 row 4, P3 role line. Size M, 3. First pull
  into Sprint 2 if Sprint 1 ends on time.
- #1 login, #3 log a lesson, #4 unpaid list, #5 mark paid: unchanged,
  source now evidence: P1, P2, P3.
- #13 dark mode: unchanged, hypothesis, Won't.
```

The re-checked sprint table. Sprint 1 is unchanged. Sprint 2 lost the monthly total and gained the client page as a Must; it is at 10 of 13 with the block story named as the first pull.

```markdown
## Sprint 2 (re-checked 8.4)
Goal: A tutor can see who owes what per client, mark it paid, and fix a mistake.
| # | story | points |
|---|---|---|
| 4 | Unpaid list | 2 |
| 5 | Mark paid | 2 |
| 6 | Client page (now Must) | 3 |
| 9 | Edit or delete a lesson | 3 |
| | total | 10 |
| | capacity | 13 |
| | slack | 3 |
First pull if slack survives: #14 prepaid block (3).
```

The learning criterion, written before a line of code.

```markdown
## Learning criterion (end of Sprint 2)
- who: P1 and P3, who both offered; synthetic records seeded for the test.
- task: "Find which client owes you the most, and mark one lesson paid."
- watch for: time to the answer, hesitation, whether they open anything else.
- pass: both find the right client in under a minute without help.
- if it fails: change the list (ordering, totals per client), not add a tour.
- also note: whether either asks for the statement page unprompted (#7).
```

The spec itself. Copy this into `docs/product-spec.md` and fill it in; most blocks are the ones you just wrote, moved into one file so that 12.1 has one thing to open.

```markdown
# Product spec: <capstone-name>
One line: <what it does, for whom>

- Version: 1.0 (<date>), written with <n> of <booked> interviews in the log.
- Next: 1.1 before 12.1, with all booked interviews and the backlog re-tagged.
- Author: <your GitHub handle>

## 1. Problem
<user, context, obstacle, consequence>

## 2. Research summary
| id | role | date | format |
|---|---|---|---|
| P1 | | | |

### Combined empathy map
<the four boxes, ids on every entry>

### Insights
<patterns with counts, pain points, surprises, opportunities,
validated assumptions, invalidated assumptions>

### Sample limits
<who was not represented, and what that means for the decision>

## 3. Persona (optional, built only from the map)
<a name you invented, a role, one real quote, goals, frustrations,
current workaround, unmet need>

## 4. MVP
<one sentence: who, what it does, what it does not do>

## 5. Backlog
| # | story | points | MoSCoW | source |
|---|---|---|---|---|

### Acceptance criteria (Must stories)
### MoSCoW with reasons
### Backlog changes (8.4)

## 6. Plan
| sprint | session | hours | capacity | goal |
|---|---|---|---|---|

### Sprint 1 in full
### Definition of Done
### Learning criterion

## 7. Alternatives considered
## 8. Decision log
- <date>: <decision>, because <evidence>; deferred <what>.
- Trace back: story #<n> ← P<i> row <r>, P<j> row <s>.
- Trace forward: criterion "<text>" → <the Supertest or Playwright case that checks it>.

## 9. Links
- Research: docs/research.md
- Stories: docs/user-stories.md
- Sprint plan: docs/sprint-plan.md
- Board: <url>
- Walkthrough: <url or docs/walkthrough.mp4>
```

The filled decision log for the ledger, which is the part people skip and the part a reader in week 20 will thank you for.

```markdown
## 8. Decision log
- 2026-11-11: Client page becomes a Must, because 3 of 3 answer the money
  question per client; deferred the monthly total to Could.
- 2026-11-11: Reminder text moves to Won't, because 0 of 3 want it and two
  argued against it; the statement link carries the "neutral chase" need.
- 2026-11-11: Lesson model gains an optional block, as story #14, Should,
  not in a sprint total; pulled first if Sprint 2 has slack.
- Trace back: story #4 unpaid list ← P1 row 2, P2 row 1, P3 row 1.
- Trace forward: "Given a lesson owned by another tutor, the request is
  refused with 404" → a Supertest case that logs in as tutor B and PATCHes
  tutor A's lesson, expecting 404 and an unchanged document.
- Sample limits: all three teach one-to-one; nobody who runs group classes
  or uses an agency's billing was interviewed; the block story may look
  different for them.
```

The walkthrough is two to three minutes of screen recording, any recorder you like, with the spec open, answering four questions in order: who it is for, the biggest pain point you found and its count, the MVP, and the Sprint 1 goal. Watch it back once. If you hear yourself describing a feature nobody in the log asked for, the spec has a hypothesis row that is not labelled. Put the link, or the file, under Links.

Here is a small model you can run here. It proves that a story is evidence only when it cites participants who exist in the log, that a citation to a participant who is not in the log is demoted to hypothesis, that patterns are ranked by how many participants support them rather than by who asked loudest, that an insight page is honest when every assumption points at rows or carries the unresolved line with a next question, that an all-validated page with no such line is refused, and that a learning criterion decides pass or fail from results rather than from mood. It does not prove your three people were the right three; the sample-limits block is where you say that.

```js run=checkpoint-8-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const log = new Set(['P1', 'P2', 'P3']);
const stories = [
  { id: 'unpaid-list', cites: ['P1', 'P2', 'P3'] },
  { id: 'client-page', cites: ['P1', 'P2', 'P3'] },
  { id: 'statement-link', cites: ['P2', 'P3'] },
  { id: 'reminder-text', cites: ['P4'] },
  { id: 'dark-mode', cites: [] },
  { id: 'login', cites: [] }
];

function audit(story) {
  const real = story.cites.filter(function (id) { return log.has(id); });
  return { id: story.id, support: real.length, tag: real.length ? 'evidence' : 'hypothesis' };
}
const audited = stories.map(audit);
const byId = Object.fromEntries(audited.map(function (s) { return [s.id, s]; }));
check(byId['unpaid-list'].tag === 'evidence' && byId['unpaid-list'].support === 3, 'a story cited by three participants is evidence with support 3');
check(byId['reminder-text'].tag === 'hypothesis', 'a citation to a participant who is not in the log does not count');
check(byId['dark-mode'].tag === 'hypothesis' && byId['login'].tag === 'hypothesis', 'unproven ideas remain hypotheses, including the dependency');

const ranked = audited.slice().sort(function (a, b) { return b.support - a.support; });
check(ranked[0].support === 3 && ranked.indexOf(byId['statement-link']) < ranked.indexOf(byId['reminder-text']), 'patterns rank by how many said it, not by who asked loudest');

const assumptions = [
  { text: 'tutors lose track after a missed lesson', verdict: 'validated', rows: ['P1:2', 'P2:1'] },
  { text: 'tutors track per lesson', verdict: 'invalidated', rows: ['P2:1', 'P3:role'] },
  { text: 'a reminder text would help', verdict: 'invalidated', rows: ['P2:2', 'P3:2'] }
];
function hasNextQuestion(a) {
  return a.verdict === 'unresolved' && typeof a.next === 'string' && a.next.trim().length > 0;
}
function insightPageIsHonest(list) {
  const cited = list.every(function (a) { return hasNextQuestion(a) || a.rows.length > 0; });
  const challenged = list.some(function (a) { return a.verdict === 'invalidated' || hasNextQuestion(a); });
  return cited && challenged;
}
check(insightPageIsHonest(assumptions), 'at least one assumption was broken, and every verdict points at rows');
const validatedOnly = assumptions.filter(function (a) { return a.verdict === 'validated'; });
check(!insightPageIsHonest(validatedOnly), 'an all-validated page with no unresolved line is refused');
const unresolved = { text: 'tutors would pay for this', verdict: 'unresolved', rows: [], next: 'What do you pay for today that does this job badly?' };
check(insightPageIsHonest(validatedOnly.concat(unresolved)), 'an all-validated page with an unresolved line and a next question passes');
check(!insightPageIsHonest(validatedOnly.concat(Object.assign({}, unresolved, { next: '' }))), 'an unresolved line without a next question does not count');

const criterion = { needed: 2, of: 2, passIf: function (r) { return r.foundInUnder60s && !r.needHelp; } };
function decide(results) {
  const passes = results.filter(criterion.passIf).length;
  return passes >= criterion.needed ? 'keep the list' : 'change the list, not add a tour';
}
check(decide([{ foundInUnder60s: true, needHelp: false }, { foundInUnder60s: true, needHelp: false }]) === 'keep the list', 'two clean finds pass the criterion');
check(decide([{ foundInUnder60s: true, needHelp: true }, { foundInUnder60s: false, needHelp: false }]) === 'change the list, not add a tour', 'a failed test changes the plan the way the criterion said it would');

console.log('ok: checkpoint-8-4');
```

## Where it breaks

![](diagram:session-8-4/fig2-diagnosis)

### Interview notes become feature votes

The symptom is a backlog where one participant's request jumped to Must ahead of the task three people described struggling with, and a change log that reads "P2 asked for X, so X". The cause is treating a sentence in an interview as a ballot instead of a clue. The fix is the count. Cluster the notes, write "n of 3" next to every pattern, and ask of every request how often the underlying problem happens and what they do today. Build the thing several people trip over. Write the requests you are not building into Won't with the id attached, so the decision is visible and reversible. One voice is a reason to ask the next person, not a reason to build.

### Scope ignores capacity

The symptom is a re-checked Sprint 2 that contains six stories because the evidence was so good, with the slack row quietly deleted. The cause is that evidence changed the product and you let it change the hours too, which it cannot. The fix is the table from 8.3: a promoted story takes its points with it, the total stays under capacity, the story that leaves is the one furthest from the sprint goal, and the new story is written as "first pull if slack survives". Capacity is a requirement. A plan that ignores it is fiction, and the demo in 12.5 is where the fiction gets found out.

### No learning criterion

The symptom is a Sprint 2 review that ends with "I think it went well" and no change to anything. The cause is that nobody wrote down, before the test, what result would change the plan, so every result can be narrated as fine. The fix is the criterion block in the spec: who tries it, what task, what you watch for, what counts as a pass, and what you do if it fails, written before the code exists. After the test, compare the notes to that block, line by line. If it failed, do what the block said you would do. If it passed, say what you watched for and did not see.

## Your turn

The ledger is done. Now yours, with whatever is in your log; if it is two interviews rather than three, the spec says two, and the third goes in when it lands.

1. Read your P1 to P3 logs twice. On the second pass, in `docs/research.md`, add `## Combined empathy map` with a participant id after every entry; a box with fewer than three entries says in one line why, for example that nobody said anything about feelings. Then `## Insights` with the six blocks: patterns with counts, pain points with rows, surprises, opportunities, validated assumptions with rows, invalidated assumptions with rows. The last block has at least one invalidated assumption, or the unresolved line described above.

2. Write the problem statement in four parts and two alternatives, one of them not software, at the top of `docs/product-spec.md`, which you create now from the template.

3. Open `docs/user-stories.md` and re-tag the source column of every story: `evidence: P1, P3` with ids that exist in your log, or `hypothesis`. Then write `## Backlog changes (8.4)` with every bucket move, addition, and deletion, each with its ids. Expect at least two changes; if you have none, go back to the invalidated assumptions, or to the unresolved line, and ask what story they break.

4. Open `docs/sprint-plan.md`, move the promoted and demoted stories, and re-check every total against its capacity. Keep the slack rows. Write any new story that does not fit as "first pull if slack survives". Update the board to match: cards relabelled, Sprint 1 unchanged unless a Must left it.

5. Write the learning criterion block for the end of Sprint 2: who, task, watch for, pass, if it fails.

6. Fill the rest of the spec: research summary with the interview table by id, the map and insights, sample limits, the MVP, the backlog table with points and sources, acceptance criteria for the Musts, MoSCoW with reasons, the four-sprint table with Sprint 1 in full, the Definition of Done, and the decision log with one trace back and one trace forward. Version line: `1.0`, today's date, and the count of interviews.

7. Record the walkthrough, two to three minutes, four questions in order. Put the link under Links, or the file at `docs/walkthrough.mp4` if it is under a few megabytes; otherwise a link.

8. Commit and push:

   ```bash
   cd ~/projects/<capstone-name>
   git add docs/
   git commit -m "Product spec v1.0: research, revised backlog, four-sprint plan"
   git push
   ```

   You should see `main -> main`, and the four files plus the spec on GitHub, with ids and no names anywhere in `docs/`.

Before you push, search the folder once: `grep -ril "<a participant's first name>" docs/` should print nothing. If it prints a file, fix it, commit, and treat the previous push as public.

## The quest

![](diagram:session-8-4/fig3-evidence)

One deliverable: `docs/product-spec.md` version 1.0 in the capstone repo, pushed, with the walkthrough linked. It is complete when a stranger could read it and tell you who the product is for, what three people said, what you will build on the first day of Unit 12, and what result would make you change your mind.

Evidence:

- A combined empathy map with ids on every entry and an insight page where every pattern has a count and at least one assumption is marked invalidated with rows, or the unresolved line stands in its place.
- A problem statement with a user, a context, an obstacle, and a consequence, and two alternatives, one of them not software.
- A re-tagged `docs/user-stories.md` where every source is `evidence: P…` with ids that exist in the log, or `hypothesis`, and a change log with ids on every line.
- A re-checked `docs/sprint-plan.md` where every sprint is at or under capacity with slack visible, and the board matching it.
- A learning criterion with who, task, watch for, pass, and if-it-fails.
- A decision log with at least three dated decisions, one trace back to rows, one trace forward to a test, and a sample-limits paragraph.
- The walkthrough link under Links, two to three minutes, four questions.
- The commit `Product spec v1.0: research, revised backlog, four-sprint plan` on GitHub.

Self-check before you call it done, one line each, honestly:

| Check | Pass looks like |
|---|---|
| Research | Three interviews by id, map and insights with counts and rows |
| Backlog | Fifteen or more stories, every one tagged, Musts with acceptance examples |
| Prioritisation | Three to five Musts with reasons, two or more Won'ts, RICE on ten |
| Plan | Four sprints with hours, capacity, slack, and goals; Sprint 1 in full |
| Learning | A criterion written before any code, with an if-it-fails |
| Honesty | An invalidated assumption or the unresolved line, and a sample-limits paragraph |
| Privacy | `grep -ril` for any name in `docs/` prints nothing |

## Side quests

Three interviews that disagree with your idea are the plateau the grit story is about, and the Interface Segregation rule on the SOLID page is the Sprint 1 goal in code form: the first increment exposes one thin path a tester can walk, not every method the finished product will have.

## Before next session

Next session, 9.1, starts a different kind of unit: TypeScript, with the guild hall's code as the thing you annotate, so put the capstone down for now. Two things carry forward. Any interview still outstanding goes into the log when it happens, and version 1.1 of the spec, with every booked interview in it and the backlog re-tagged, is pushed before 12.1; put a reminder somewhere you will see it in week 19. Nothing is running on your machine, and the board stays with Sprint 1 filled and In Progress empty until the morning of 12.1, when the spec is the first file you open.
