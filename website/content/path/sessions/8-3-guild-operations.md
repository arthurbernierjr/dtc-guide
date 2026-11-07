---
editorial: true
title: Guild Operations
subtitle: Agile, SCRUM, Sprints, and Retros
hook: "A sprint goal, working board, review agenda, and retrospective action. Choose a coherent goal within actual capacity."
read: 60
artifact: "A sprint goal, working board, review agenda, and retrospective action"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://scrumguides.org/scrum-guide.html
say:
  - "Plan: Choose a coherent goal within actual capacity."
  - "Inspect: Review working outcomes and impediments."
  - "Adapt: Change the next plan using observed results."
---

## The hook

Last session we built the quest board. We pinned every quest to the wall, ranked them by importance, and figured out which ones to tackle first. But a quest board on the wall does not clear dungeons. You need an operating system for actually doing the work. That is what Agile and SCRUM give you.

Here is the thing about building software: the old way of doing it, the Waterfall way, treated software like a bridge. You plan everything upfront, you build it in sequence, and you hope it works at the end. But software is not a bridge. Software changes. Users change. Markets change. The new way, the Agile way, says: plan a little, build a little, ship a little, learn, repeat. SCRUM is the most popular framework for doing this. It gives you sprints, standups, reviews, and retrospectives. It works for teams of 50 and it works for teams of 1.

Today you learn how real software teams work. And more importantly, you learn how to work as a team of one. Because as a solo founder, you are the product owner, the scrum master, AND the development team. That is both a curse and a superpower. Let us figure out how to use it.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Analyze Agile and SCRUM frameworks and apply them to plan and manage iterative development

**You will:**
- Compare Waterfall and Agile methodologies, explaining why Agile is the industry standard for software
- Describe SCRUM roles (Product Owner, Scrum Master, Development Team), events (Sprint Planning, Daily Standup, Sprint Review, Retrospective), and artifacts (Product Backlog, Sprint Backlog, Increment)
- Estimate user stories using relative sizing with T-shirt sizes and Fibonacci story points
- Conduct sprint planning by selecting stories, setting capacity, and writing a sprint goal
- Facilitate a sprint retrospective that produces specific, actionable improvement items

**You will be able to:**
- Run a sprint planning session that produces a sprint backlog within capacity and a one-sentence sprint goal
- Estimate all stories using Fibonacci points and explain relative sizing decisions
- Complete a retrospective template with specific action items and owners

**Welcome and The Two Ways to Run a Guild**

"Last session we built the quest board. Today we learn how to actually run the guild. How do you decide what to do each week? How do you track progress? How do you course correct when things go sideways?"

Two stories:
- **Guild A (Waterfall):** Spends 6 months planning the perfect dungeon raid. Writes a 200-page strategy document. By the time they are ready to execute, the dungeon has been patched and everything changed. Total wipe.
- **Guild B (Agile):** Plans for 1 week, raids for 1 week, reviews what worked, adjusts. Repeat. Clears the dungeon in 2 months.

"Which guild do you want to lead?"

**Waterfall vs. Agile**

**Waterfall** (the old way):
- Sequential phases: Requirements -> Design -> Build -> Test -> Deploy
- You finish each phase completely before starting the next
- All planning happens upfront, all testing happens at the end
- Works for: building a bridge, launching a rocket, things where you cannot iterate
- Fails for: software, because requirements change, users change, markets change
- The problem: you do not find out if you built the wrong thing until the very end

```
WATERFALL FLOW:
Requirements --> Design --> Build --> Test --> Deploy
    (Month 1)    (Month 2)  (Month 3-5)  (Month 6)  (Month 7)

Problem discovered at testing?
Too bad. Go back to the beginning. Lose months.
```

**Agile** (the current standard):
- Iterative cycles (sprints) of 1-4 weeks
- Plan a little, build a little, test a little, ship a little, learn, repeat
- Embrace change instead of fighting it
- Working software is the primary measure of progress (not documents, not plans)
- The Agile Manifesto (2001), four values:
  1. Individuals and interactions OVER processes and tools
  2. Working software OVER comprehensive documentation
  3. Customer collaboration OVER contract negotiation
  4. Responding to change OVER following a plan
- "The stuff on the right still matters. But when there is a conflict, lean left."

```
AGILE FLOW:
[Sprint 1: Plan -> Build -> Test -> Ship -> Learn]
[Sprint 2: Plan -> Build -> Test -> Ship -> Learn]
[Sprint 3: Plan -> Build -> Test -> Ship -> Learn]
...keep going until done

Problem discovered in Sprint 2?
Fix it in Sprint 3. Lose days, not months.
```

Why Agile won:
- Software changes too fast for 6-month plans
- Users do not know what they want until they see it
- Small, frequent releases reduce risk
- You get feedback early and often
- It is more fun (shipping beats planning)

"Agile is not 'no planning.' It is 'just enough planning, just in time.' You plan what you need for the next 1-2 weeks, not the next 6 months."

**The SCRUM Framework**

SCRUM is the most popular implementation of Agile. It is a framework, not a methodology. Meaning: it gives you structure, but you fill in the details.

**SCRUM Roles:**

| Role | Responsibility | In a startup |
|---|---|---|
| **Product Owner** | Decides WHAT to build and WHY. Owns the backlog. Represents the user. | You (the founder). |
| **Scrum Master** | Protects the process. Removes blockers. Facilitates events. | Also you. Or nobody, honestly. |
| **Development Team** | Decides HOW to build it and DOES the building. Self-organizing. | Also you. You are the whole party. |

"In a big company, these are three different people. As a solo founder, you are all three. That is both a curse and a superpower. No meetings needed. But also no one to blame."

**SCRUM Events (Ceremonies):**

1. **Sprint Planning** (start of sprint)
   - How long: 1-2 hours for a 2-week sprint (scale down for solo)
   - What happens: pick stories from the backlog, estimate them, commit to a sprint goal
   - Output: Sprint backlog (the stories you will build this sprint) + sprint goal (one sentence)

2. **Daily Standup** (every day during sprint)
   - How long: 15 minutes MAX
   - Three questions:
     - What did I do yesterday?
     - What am I doing today?
     - Am I blocked on anything?
   - "As a solo founder, this is your morning journaling. Seriously. Write three sentences in your notes app every morning. It keeps you accountable."

3. **Sprint Review / Demo** (end of sprint)
   - How long: 30-60 minutes
   - What happens: show what you built to stakeholders (users, friends, your Discord community)
   - Key: demo WORKING software, not slides. Not mockups. Working. Software.
   - "If you cannot demo it, you did not ship it."

4. **Sprint Retrospective** (after review, before next sprint)
   - How long: 30-45 minutes
   - Three questions:
     - What went well? (Keep doing this)
     - What did not go well? (Stop doing this)
     - What will we change next sprint? (Specific action items)
   - "The retro is the most underrated ceremony. It is where you actually get better. Skip it and you make the same mistakes forever."

**SCRUM Artifacts:**
1. **Product Backlog**: The master list of everything to build (you made this last session)
2. **Sprint Backlog**: The subset of stories picked for this sprint
3. **Increment**: The working software at the end of the sprint (potentially shippable)

**The Sprint cycle visualized:**

```
SPRINT CYCLE (2 weeks):

Day 1: Sprint Planning
  |
  v
Days 2-9: Build (daily standups each morning)
  |
  v
Day 10: Sprint Review (demo what you built)
  |
  v
Day 10 (after review): Sprint Retrospective
  |
  v
Day 1 of next sprint: Sprint Planning again
```

**Working Practice: Pair Programming (the two-adventurer party)**

Ceremonies structure your weeks; pair programming structures your hours. It is two people, one problem, one screen, and it is how a huge share of professional code gets written.

The two roles:
- **Driver:** hands on the keyboard. Types the code, focuses on the tactical level — syntax, the current line, the current function.
- **Navigator:** hands OFF the keyboard. Watches the strategic level — is this the right approach? What edge case are we missing? What comes after this?

The rules that make it work:
- **Swap roles every 15-30 minutes.** The swap is not optional. Staying driver forever is just coding with an audience; staying navigator forever turns into backseat driving.
- **The navigator does not dictate keystrokes.** Say "what if we extract that into a helper?" not "type function, space, formatDate, open paren."
- **Talk constantly.** The driver narrates intent ("okay, now I'm going to guard against the empty array case"), the navigator thinks out loud. Silence means someone disengaged.
- **Disagree at the whiteboard, not the keyboard.** If you hit an approach dispute, pause, sketch both options for two minutes, pick one, move on.

Why founders should care: pairing is the fastest knowledge-transfer mechanism in software. When you hire your first engineer, pairing with them for a week beats a month of documentation. When you get stuck, thirty minutes of pairing with anyone — even someone junior — dislodges bugs that hours of solo staring cannot, because explaining your code out loud forces you to actually read it. And in this program, pairing on homework with a study partner is encouraged: you will learn more from navigating someone else's code than from writing your own.

Solo variant while you have no partner: **rubber-duck programming.** Explain each chunk of code, out loud, to an inanimate object (or an AI chat). Same mechanism — verbalizing exposes the gap between what you meant and what you wrote.

**Key Points:**
- Waterfall is sequential and works for fixed-scope projects; Agile is iterative and works for software
- SCRUM defines three roles, four events, and three artifacts
- The Agile Manifesto prioritizes people, working software, collaboration, and responsiveness to change
- Sprints are fixed time periods (1-4 weeks) where scope does not change mid-sprint

**Common Misconceptions:**

| Wrong | Correct |
|---|---|
| "Agile means no planning or documentation" | Agile means just enough planning, just in time. You still plan, but in short cycles rather than upfront for 6 months |
| "SCRUM does not work for solo developers" | SCRUM scales down effectively. Solo founders use 1-week sprints, self-standups, and journal retros |
| "Velocity should increase every sprint" | Velocity is a measurement, not a goal. Trying to increase it just inflates estimates |

![](diagram:session-8-3/fig1-model)

### A sprint goal gives the work coherence

A sprint is not simply a calendar box containing unrelated tickets. A useful goal describes a capability or learning outcome the team intends to achieve. “Tutors can identify overdue invoices” gives a reason to select particular stories and reject distractions. If capacity changes, the team can renegotiate scope while preserving the goal. Without that goal, every ticket appears equally urgent.

Estimate available capacity honestly. Account for support work, reviews, meetings, and absences. Story points are a relative planning tool within a team, not a universal unit of productivity. Comparing individuals or teams by points encourages inflation and hides the actual outcome. A forecast should help the team make decisions; it should not become a promise that discourages surfacing problems.

### A board should reveal flow

Columns represent meaningful states such as ready, in progress, review, and done. Define what qualifies for each transition. If review is required, a ticket is not done merely because the author finished typing. Limit simultaneous work so partially finished items do not accumulate. A blocked item needs a reason and a next action, not only a red label.

Use daily inspection to coordinate toward the sprint goal. A status recital to a manager can consume time without changing anyone's plan. Ask what changed, what is blocked, and which collaboration would move the goal forward. If a detailed technical discussion is needed, continue it with the relevant people after the brief coordination step. The format serves the work, not the reverse.

### Review working behavior with stakeholders

A sprint review examines the increment and gathers feedback. Show the actual workflow using a realistic fixture. Slides can provide context but should not replace the product evidence. Invite stakeholders to respond to the outcome and its implications. A new request is input to future prioritization, not an automatic commitment that bypasses the backlog.

Distinguish acceptance from release. An increment can meet the definition of done while a business decision controls when it is exposed. Conversely, a deployment does not excuse missing quality checks. Write the definition of done in terms of evidence your team can produce: reviewed code, relevant tests, usable error states, and updated operational notes where needed. Keep it achievable and meaningful.

### Retrospectives need a feedback loop

Discuss the team's process without turning incidents into personal blame. Use specific observations: reviews waited two days, fixtures were inconsistent, or the sprint goal changed repeatedly. Choose one improvement small enough to try in the next sprint. Assign an owner and a way to observe whether it helped. Ten vague action items are less useful than one completed experiment.

For the workshop, simulate a mid-sprint interruption and decide what changes. Do you reduce scope, pair on a blocker, or renegotiate the goal? Document the reasoning. The finished artifact should show planning, inspection, and adaptation as connected activities. A calendar full of ceremonies is not the outcome; a team that can respond intelligently to evidence is.

## The demonstration

**BREAK**

**Live Walkthrough: Story Points and Estimation**

**Setup:** Using the sample freelancer budgeting app backlog from Session 8.2, walk through estimating every story.

**Steps:**

1. Explain why story points use relative sizing instead of hours
2. Introduce T-shirt sizing (beginner-friendly)
3. Introduce Fibonacci story points (industry standard)
4. Walk through estimating 5-6 sample stories
5. Explain velocity and how to use it for sprint planning

**Why not hours?**
- Developers are terrible at estimating hours (off by 2-3x, consistently)
- Hours punish slow workers and reward fast ones (not fair, not useful)
- Relative comparison is something humans are actually good at

**The T-shirt sizing method (beginner-friendly):**

| Size | Meaning | Example |
|---|---|---|
| XS | Trivial, do it in 30 minutes | Change a button label |
| S | Simple, few hours | Add form validation to one field |
| M | Moderate, a day or two | Build a new CRUD page |
| L | Large, most of a sprint | Build authentication flow |
| XL | Too big, break it down | "Build the social features" |

**Fibonacci story points (industry standard):**
- 1, 2, 3, 5, 8, 13, 21
- Why Fibonacci? The gaps get bigger as the numbers get bigger, which reflects the increasing uncertainty of larger tasks
- A 1-point story is trivial (change a color, fix a typo)
- A 3-point story is a standard feature (add a form, create an API endpoint)
- An 8-point story is complex (build a full CRUD feature with validation)
- A 13-point story is nearly too big (break it down if possible)
- A 21-point story IS too big (definitely break it down)
- "If you cannot estimate it, you do not understand it well enough. Break it down further."

**Planning Poker (how teams estimate):**
- Everyone picks a card with their estimate simultaneously
- If estimates differ wildly (one person says 2, another says 13), discuss why
- The disagreement IS the value. It surfaces misunderstandings.
- As a solo founder, estimate your stories honestly. If you are unsure, round up.

**Velocity:**
- Velocity = total story points completed per sprint
- After 2-3 sprints, you know your velocity
- Use velocity to plan future sprints: "I complete about 15 points per sprint, so I should pick 15 points of stories"
- Do NOT try to increase velocity. It is a measurement, not a goal. Increasing it just means you inflate your estimates.

**Where you should be:** You can estimate any user story with Fibonacci points and understand velocity.

**Live Walkthrough: Kanban and Running a One-Person Sprint**

**Setup:** Show a Kanban board alongside a SCRUM sprint board. Compare and contrast.

**Kanban** (alternative to SCRUM):
- No fixed sprints. Work flows continuously.
- Visualize work on a board with columns: Backlog -> To Do -> In Progress -> Done
- Limit Work In Progress (WIP): only 1-2 items in "In Progress" at a time
- Pull new work when current work is done (do not push)
- Good for: maintenance work, support teams, solo founders who hate timeboxing

```
KANBAN BOARD:

| Backlog     | To Do       | In Progress | Done        |
|             |             | (WIP: 2)    |             |
|-------------|-------------|-------------|-------------|
| Story 7     | Story 4     | Story 2     | Story 1     |
| Story 8     | Story 5     |             | Story 3     |
| Story 9     | Story 6     |             |             |
| Story 10    |             |             |             |
```

**SCRUM vs Kanban:**

| Aspect | SCRUM | Kanban |
|---|---|---|
| Work periods | Fixed sprints (1-4 weeks) | Continuous flow |
| Planning | Sprint planning event | Continuous replenishment |
| Roles | Product Owner, Scrum Master, Team | No prescribed roles |
| Changes | No changes during sprint | Change anytime |
| Best for | Product development, new features | Maintenance, ops, solo work |

**Running a one-person sprint (founder mode):**
- Use 1-week sprints (2 weeks feels too long when you are solo)
- Monday morning: sprint planning (30 minutes, pick 3-5 stories)
- Every morning: 5-minute self-standup (write it in your notes)
- Friday afternoon: sprint review (demo to yourself or record a Loom)
- Friday evening: retro (10 minutes, 3 questions, write it down)
- Weekends: rest, recharge, or do optional stretch work

```
SOLO FOUNDER SPRINT (1 WEEK):

Monday:
  AM: Sprint planning (30 min)
  PM: Start building

Tuesday-Thursday:
  AM: 5-min standup (notes app)
  All day: Build, test, ship

Friday:
  AM: Finish current work
  PM: Sprint review (demo or Loom recording)
  PM: Retro (10 min journal entry)

Saturday/Sunday:
  Rest. Or stretch goals. Your call.
```

"You do not need a team to run a sprint. You need discipline and a board. That is it."

**Where you should be:** You understand Kanban as an alternative, and have a concrete plan for running solo sprints.

**Watch for this:**
- Story points trip people up. Emphasize relative sizing by using physical analogies: "Is this story more like carrying a backpack or more like moving a couch?"
- Write the solo sprint schedule down. It is the part you will need on a Tuesday when nobody is setting the agenda.
- Velocity should NOT be introduced as a performance metric. It is a planning tool.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-8-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const capacity = 12;
const selected = [{id: 'list', estimate: 5}, {id: 'empty-state', estimate: 3}, {id: 'review', estimate: 2}];
const planned = selected.reduce((sum, item) => sum + item.estimate, 0);
check(planned <= capacity, 'Plan fits illustrative capacity');
check(capacity - planned === 2, 'Unallocated capacity remains visible');
console.log('ok: checkpoint-8-3');
```

## Where it breaks

![](diagram:session-8-3/fig2-diagnosis)

### Ceremony without outcome

You hold the standup, the planning, and the retro, and no decision comes out of any of them. The calendar is full and the board does not change. A meeting earns its slot by producing something you can point at: an ordered list, a cut scope, a named owner, a change you will try. If the same conversation could have been a sentence in the issue, let it be a sentence. Keep the ritual only where it changes the work. A retro that files no change, and a planning meeting that does not reorder the board, were status updates.

### Velocity used as a target

The number goes up because people inflate the estimates, and the number goes down the week you did the hardest useful work, so you start avoiding it. Velocity is a planning aid for a stable team. It is not a score, and it is not a way to compare people. Use it to notice that the next three cards are more than the last three weeks could hold. The week the number becomes a target, it stops measuring anything except the pressure to make the number.

### Retro produces no change

The board fills with observations and the next week is identical. An observation without an experiment is a diary entry. Pick one change small enough to try before the next retro: a checklist on the deploy card, a rule that a bug gets a failing test, a shorter meeting. Name who will notice whether it happened. At the next retro, review that one thing first. A retro that adds three more sticky notes and changes nothing has taught the team that the meeting is optional.

## Your turn

**Guided Practice Exercise 1: Sprint Planning Simulation**

**Prompt:** Run a mock sprint planning session using your capstone backlog.

**Starter Materials:** Sprint planning template (below).

**Steps:**
1. Pull out your product backlog from Session 8.2 homework (or use the one you built in that session)
2. Estimate each of your Must Have stories using T-shirt sizing (XS, S, M, L, XL)
3. Convert T-shirt sizes to Fibonacci points: XS=1, S=2, M=3, L=5, XL=8 (or break XL down)
4. Set your sprint capacity: for a 1-week solo sprint, assume 10-15 story points
5. Pick stories from the top of your backlog until you hit your capacity
6. Write a sprint goal: one sentence that describes what you will accomplish

**Sprint Planning Template:**

```
SPRINT 1 PLANNING
Sprint Duration: 1 week
Sprint Goal: "[One sentence: what will be true at the
end of this sprint?]"
Sprint Capacity: 12 points (example)

SELECTED STORIES:
| # | User Story (short) | Points | Priority |
|---|-------------------|--------|----------|
| 1 | User sign-up/login | 5      | Must     |
| 2 | Create expense entry | 3    | Must     |
| 3 | View expense list   | 2     | Must     |
| 4 | Monthly total       | 2     | Must     |
|   | TOTAL              | 12     |          |

NOT SELECTED (Next Sprint):
| # | User Story (short) | Points | Priority |
|---|-------------------|--------|----------|
| 5 | Edit/delete expense | 3     | Must     |
| 6 | Expense categories  | 3     | Should   |
```

**Success Criteria:**
- All Must Have stories have point estimates
- Sprint does not exceed your capacity (do not over-commit)
- Sprint goal is a clear, one-sentence statement
- You can explain WHY you picked these stories and not others

**Time:** 30 minutes (15 min estimating, 10 min selecting, 5 min sprint goal)

**Checkpoints:**
- At 10 minutes: All Must Have stories should have point estimates
- At 20 minutes: Sprint backlog should be selected within capacity
- At 25 minutes: Sprint goal should be written and sprint plan complete

**BREAK**

**Guided Practice Exercise 2: Sprint Retrospective Practice**

**Prompt:** Practice running a retro using a past experience (not your capstone, since you have not started yet).

**Starter Materials:** Retrospective template (below).

**Steps:**
1. Think about a project you worked on recently (could be a class project, a homework assignment, even something non-technical like planning an event)
2. Fill out the retro template below
3. Share one item from each category with a partner or the group
4. For each "What to change," write a SPECIFIC action item, not a vague intention

**Retrospective Template:**

```
SPRINT RETROSPECTIVE
Project/Sprint: ___________
Date: ___________

WHAT WENT WELL (keep doing these):
1.
2.
3.

WHAT DID NOT GO WELL (stop doing these):
1.
2.
3.

WHAT TO CHANGE NEXT TIME (specific actions):
1.
   Action: [specific, measurable change]
   Owner: [who will do it, probably you]
2.
   Action:
   Owner:

SHOUTOUTS (celebrate wins):
-
```

**Example filled out:**

```
SPRINT RETROSPECTIVE
Project: Unit 7 Test Suite Homework
Date: Week 11

WHAT WENT WELL:
1. Got Jest set up on the first try (no config issues)
2. Writing tests actually helped me find a bug in my API
3. Finished 2 days before the deadline

WHAT DID NOT GO WELL:
1. Spent 3 hours on one Playwright test that kept flaking
2. Did not read the Playwright docs carefully enough
3. Forgot to commit until the very end (huge messy commit)

WHAT TO CHANGE NEXT TIME:
1. When stuck for more than 30 minutes, step away or
   ask for help
   Action: Set a 30-minute timer when debugging
   Owner: Me
2. Read docs BEFORE writing code, not after getting stuck
   Action: Spend first 15 min of any new tool reading
   the "Getting Started" guide
   Owner: Me
3. Commit after each working feature, not at the end
   Action: Follow the "commit early, commit often" rule
   from Unit 1
   Owner: Me
```

**Success Criteria:**
- At least 2 items in each category
- "What to change" items are specific actions, not vague wishes
- Each action has an owner (even if it is just "me")

**Time:** 15 minutes (10 min writing, 5 min sharing)

**Checkpoints:**
- Checkpoint: at least two of the three categories have something in them
- At 10 minutes: "What to change" items should have specific action items and owners

## The quest

**Independent Lab: Set Up Your Sprint Board and Plan Sprint 1**

**Objectives:**
- Create your project management board with proper column structure
- Add all user stories as cards with estimates
- Finalize your Sprint 1 plan
- Set up your one-person sprint schedule

**Requirements:**
- Board created with columns: Backlog, Sprint 1, In Progress, Done
- All user stories added as cards (at least 15 stories from 8.2 homework)
- All stories estimated with Fibonacci points
- Sprint 1 stories moved into the Sprint 1 column
- Sprint 1 goal written
- One-person sprint schedule documented (when you will do planning, standups, review, retro)
- Brief reflection: what are you most excited to build? What scares you?

**Hints:**
- Pick GitHub Projects if you want everything in one place with your code.
- Pick Trello if you like drag-and-drop simplicity.
- Pick Linear if you want something that feels professional and fast.
- Your sprint schedule should be realistic. If you know you cannot work Wednesdays, plan around it.

**Stretch Goals:**
- Read the Scrum Guide (free, 13 pages) at https://scrumguides.org/
- Watch a real sprint planning session on YouTube (search "sprint planning meeting example")
- Set up GitHub Issues with labels for your user stories (Must, Should, Could, Won't)

**Submission:** Screenshot of your sprint board + markdown file with sprint goal and schedule, pushed to your capstone repo.

### Review the artifact

Your deliverable is **A sprint goal, working board, review agenda, and retrospective action**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-8-3/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Session 8.2 and homework (product backlog with 15-20 user stories created, MoSCoW prioritization applied, project board set up). Have your capstone MVP defined.
**Materials:** Sprint planning template (provided below), retrospective template (provided below), The Scrum Guide (free, 13 pages, https://scrumguides.org/), project board tool of choice

**Due before Session 8.4:**

1. Choose a tool: GitHub Projects, Trello, Linear, or Notion
2. Create a board with columns: Backlog, Sprint 1, In Progress, Done
3. Add all your user stories as cards (at least 15 stories from 8.2 homework)
4. Estimate all stories with Fibonacci points
5. Move your Sprint 1 stories into the Sprint 1 column
6. Write your Sprint 1 goal
7. Set up your one-person sprint schedule (when you will do planning, standups, review, retro)
8. Write a brief reflection: what are you most excited to build? What scares you?

**Submission:** Screenshot of your sprint board + markdown file with sprint goal and schedule, pushed to your capstone repo.

**Estimated Time:** 2-3 hours

**Stretch Goals (Optional):**
- Read the Scrum Guide (free, 13 pages) at https://scrumguides.org/
- Watch a real sprint planning session on YouTube (search "sprint planning meeting example")
- Set up GitHub Issues with labels for your user stories (Must, Should, Could, Won't)

---

### Manual verification and further reading

- [Official reference 1](https://scrumguides.org/scrum-guide.html)
