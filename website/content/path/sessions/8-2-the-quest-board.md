---
editorial: true
title: The Quest Board
subtitle: User Stories, Backlogs, and Prioritization
hook: "A prioritized backlog with user stories and testable acceptance criteria. Connect a user problem to evidence."
read: 60
artifact: "A prioritized backlog with user stories and testable acceptance criteria"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.scrumguides.org/scrum-guide.html
say:
  - "Need: Connect a user problem to evidence."
  - "Slice: Define a small observable outcome."
  - "Prioritize: Order work by value, uncertainty, and dependency."
---

## The hook

Last session we learned to listen. We learned how to ask questions that get honest answers, how to map what users say and feel, and how to spot the gap between what people claim they do and what they actually do. That is the intelligence-gathering phase. Now comes the planning phase.

Think of it this way: in every RPG, there is a board in the guild hall with quests pinned to it. Some are urgent, some are high reward, some are side quests that nobody ever takes. Your product backlog is that quest board. Today you become the person who decides which quests your party takes, in what order, and why. That is not a technical skill. That is a leadership skill. And it is the skill that separates someone who can build things from someone who builds the right things.

We are going to cover the Software Development Life Cycle so you understand where all of this fits. Then we will write user stories, the building blocks of every modern product. Then we will learn two prioritization frameworks and define your MVP. By the end of today, you will have a prioritized backlog for your capstone. Let us build that quest board.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Create user stories with acceptance criteria and organize them into a prioritized product backlog

**You will:**
- Describe the phases of the Software Development Life Cycle and identify where planning, analysis, and design activities occur
- Write user stories in the standard format (As a [user], I want [action], so that [benefit]) that satisfy INVEST criteria
- Define testable acceptance criteria for each user story
- Apply MoSCoW and RICE prioritization frameworks to rank features
- Define a Minimum Viable Product scope that is both minimal and viable

**You will be able to:**
- Produce a backlog of 15 or more user stories in correct format with acceptance criteria for all Must Have items
- Categorize all stories using MoSCoW with justifications and calculate RICE scores for the top 10
- Write a clear 2-3 sentence MVP definition that specifies what the product does and does not include

**Welcome and The Quest Board Metaphor**

Recap Session 8.1: "We learned to listen. Now we learn to plan."

The quest board metaphor: in every RPG, there is a board in the guild hall with quests pinned to it. Some are urgent, some are high reward, some are side quests. Your product backlog is that board.

"Today you become the person who decides which quests your party takes, in what order, and why."

Show a real product backlog (Trello or Linear screenshot) to make it tangible.

**The Software Development Life Cycle**

The SDLC is just a fancy name for "how software gets made, from idea to launch."

The phases (keep it practical, not academic):
1. **Planning**: What are we building and why? (User research, product vision)
2. **Analysis**: What exactly does it need to do? (Requirements, user stories)
3. **Design**: How should it work and look? (Architecture, wireframes, UX)
4. **Implementation**: Write the code (Development, the part you already know)
5. **Testing**: Does it actually work? (Unit 7, you already learned this)
6. **Deployment**: Ship it to real users (Unit 6, you already learned this)
7. **Maintenance**: Keep it running, fix bugs, add features (the never-ending quest)

"Notice how coding is only ONE phase? Most beginners think software development IS coding. Founders know coding is maybe 30% of the job."

Where we are in the SDLC for the capstone:
- Planning: Session 8.1 (user research) - DONE
- Analysis: Session 8.2 (today, user stories) - DOING
- Design: Session 8.2-8.3 (backlog, sprint plan) - DOING
- Implementation: Unit 12 (capstone sprints) - COMING
- Testing: Unit 12 (capstone sprints) - COMING
- Deployment: Unit 12 (capstone sprints) - COMING

**User Stories and Acceptance Criteria**

A user story is a short description of a feature from the user's perspective.

The format:

```
As a [type of user],
I want [some goal or action],
so that [some reason or benefit].
```

Why this format works:
- It forces you to think about WHO wants this (not just "the app should...")
- It forces you to think about WHY (the benefit, not just the feature)
- It is small enough to build in a sprint (if it is not, break it down)

**Good user stories vs. bad user stories:**

| Bad Story | Why It Is Bad | Good Story |
|---|---|---|
| "Build login page" | No user, no reason | "As a returning user, I want to log in with my email and password, so that I can access my saved data." |
| "Make the app fast" | Too vague, not measurable | "As a user on a mobile connection, I want the dashboard to load in under 3 seconds, so that I do not give up and close the app." |
| "Add all the social features" | Way too big (this is an epic, not a story) | "As a user, I want to share my workout with friends via a link, so that I can get accountability." |
| "Implement the database" | Technical task, not user-facing | "As a user, I want my meal plans to be saved when I close the app, so that I do not have to recreate them every time." |

**Acceptance criteria**: how you know the story is DONE. Written as a checklist of specific, testable conditions.

Example:

```
USER STORY:
As a freelancer, I want to log my expenses by category,
so that I can see where my money goes each month.

ACCEPTANCE CRITERIA:
- [ ] User can create a new expense with amount, category,
      date, and optional note
- [ ] Categories include: Business, Food, Transport,
      Software, Other
- [ ] User can add custom categories
- [ ] Expenses appear in a list sorted by date (newest first)
- [ ] User can edit or delete an expense
- [ ] Monthly total displays at the top of the expense list
```

The INVEST criteria for good user stories:
- **I**ndependent: can be built without depending on other stories
- **N**egotiable: details can be discussed, it is not a contract
- **V**aluable: delivers value to the user (not just to the developer)
- **E**stimable: you can roughly guess how long it will take
- **S**mall: can be completed in one sprint
- **T**estable: you can write acceptance criteria for it

**Key Points:**
- The SDLC has 7 phases, and coding is only one of them
- User stories follow the format "As a [user], I want [action], so that [benefit]"
- Acceptance criteria are specific, testable conditions that define "done"
- INVEST criteria ensure stories are well-formed and buildable

**Common Misconceptions:**

| Wrong | Correct |
|---|---|
| "A user story is just a feature description" | A user story specifies the user type, action, AND benefit. Without the "so that" clause, you do not know why you are building it |
| "Acceptance criteria are optional nice-to-haves" | Acceptance criteria define what "done" means. Without them, you never know when to stop building a feature |
| "An epic is just a big user story" | An epic must be broken down into stories small enough to complete in a single sprint. If you cannot build it in a week, split it |

![](diagram:session-8-2/fig1-model)

### A story is a conversation about an outcome

The familiar “As a user, I want…” sentence is a starting point, not a complete specification. A useful story identifies a particular user in a particular situation and explains the benefit. “As a tutor, I want to see overdue invoices so I can decide whom to contact” is more informative than “As a user, I want a dashboard.” The first suggests a decision the interface must support; the second names a container.

Attach evidence when possible. A short link to an interview note or observed support problem explains why the story matters. Separate that evidence from your proposed solution. Several interface designs could help a tutor find overdue invoices. The backlog item should preserve room to choose among them while making the outcome testable.

### Acceptance criteria are examples of done

Write normal, boundary, and failure examples. Given an invoice past its due date and not paid, it appears in the overdue list. Given a paid invoice, it does not. Given no overdue invoices, the screen explains the empty state. Given a failed request, the previous data is not silently replaced by a success message. These examples guide implementation and later testing without prescribing every internal function.

Avoid vague criteria such as fast, intuitive, or secure without a context and observation. If performance matters, name the interaction and a realistic measurement environment. If authorization matters, name the actor and forbidden action. A criterion should let two reviewers reach the same conclusion from the same evidence. When they cannot, refine the story before investing in code.

### Slice vertically enough to learn

Splitting a feature into database, backend, and frontend tasks may help assign work, but none of those tasks alone demonstrates user value. Look for a small end-to-end slice: show a read-only overdue list for one account before adding filters, exports, and reminders. That slice tests the data model and interaction with less risk. Technical subtasks can sit beneath the story without replacing its outcome.

Dependencies should be visible. If a payment-status story requires an event-processing foundation, identify that dependency and its acceptance condition. Do not mark a user story complete because the database table exists. Conversely, do not force an infrastructure improvement into a misleading user-story sentence. A clear technical task with a stated risk reduction is better than artificial wording.

### Prioritization is a decision under constraints

Use a simple scoring method to structure discussion, then inspect its assumptions. Estimated reach, impact, confidence, and effort are uncertain values, not precise measurements. A small change in a guessed score should not dictate the entire roadmap. Compare the ranking with dependencies, deadlines, and the cost of delaying learning. Record why you chose the first few items.

Keep the backlog smaller than a wish list. Remove or archive ideas with no evidence, owner, or plausible next step. For the workshop, select a sprint-sized set and explicitly defer the rest. The final artifact includes story cards, acceptance criteria, ordering rationale, and a visible cut line. A reviewer should understand both what you intend to build and why other attractive work is waiting.

## The demonstration

**BREAK**

**Live Walkthrough: Product Backlogs and Prioritization**

**Setup:** Show a sample product backlog for a freelancer budgeting app. Walk through building and prioritizing it live.

**Steps:**

1. Explain what a product backlog is: a prioritized list of everything you want to build. A living document. Things get added, removed, and reordered constantly.
2. Demonstrate MoSCoW prioritization
3. Demonstrate RICE scoring
4. Define the MVP
5. Discuss scope creep and how to fight it

**MoSCoW Method:**
- **Must Have**: The product literally does not work without these. If you launch without them, users cannot accomplish the core task.
- **Should Have**: Important but not critical for launch. You will add them in Sprint 2 or 3.
- **Could Have**: Nice to have. If you have time, great. If not, nobody notices.
- **Won't Have (this time)**: Explicitly out of scope. Not "never," just "not now." Writing these down is how you fight scope creep.

Example for a freelancer budgeting app:

```
MUST HAVE:
- Log expenses with amount and category
- View monthly expense summary
- User authentication (sign up / log in)

SHOULD HAVE:
- Income tracking
- Export data as CSV
- Dashboard with charts

COULD HAVE:
- Receipt photo upload
- Recurring expense auto-entry
- Dark mode

WON'T HAVE (THIS TIME):
- Tax filing integration
- Multi-currency support
- Mobile app (web only for MVP)
- Team/shared accounts
```

**RICE Scoring:**
- Used when you need to compare stories against each other with numbers
- **R**each: How many users does this affect? (number of users per month)
- **I**mpact: How much does it help those users? (3 = massive, 2 = high, 1 = medium, 0.5 = low, 0.25 = minimal)
- **C**onfidence: How sure are you about these estimates? (100% = high, 80% = medium, 50% = low)
- **E**ffort: How many person-weeks to build? (smaller = better)
- Formula: RICE Score = (Reach x Impact x Confidence) / Effort

```
RICE EXAMPLE:

Feature: Expense categorization
Reach: 100 (all users)
Impact: 3 (massive, core feature)
Confidence: 90%
Effort: 1 week
Score: (100 x 3 x 0.9) / 1 = 270

Feature: Receipt photo upload
Reach: 40 (some users want this)
Impact: 1 (medium, nice to have)
Confidence: 60%
Effort: 3 weeks
Score: (40 x 1 x 0.6) / 3 = 8

Winner: Expense categorization, by a landslide.
```

"RICE is not magic. The numbers are guesses. But it forces you to THINK about reach, impact, and effort instead of just building whatever sounds fun."

**ICE Scoring (simpler alternative):**
- **I**mpact (1-10), **C**onfidence (1-10), **E**ase (1-10)
- Score = Impact x Confidence x Ease
- Good for quick decisions when you do not have user data for Reach

**MVP: Minimum VIABLE Product:**
- "Minimum" means the smallest version. "Viable" means it actually works and provides value.
- An MVP is NOT:
  - A broken prototype ("we will fix it later")
  - A feature-complete product with bad design
  - A landing page with a "coming soon" sign
- An MVP IS:
  - The smallest thing you can ship that solves the core problem well enough that someone would use it
  - Small enough to build in 2-4 weeks
  - Good enough that a real user can accomplish their core task

"Think of it this way: if your app is a ramen shop, the MVP is not 'ramen without noodles.' The MVP is one really good bowl of shoyu ramen. No appetizers, no dessert menu, no fancy decor. Just one excellent bowl."

**Scope creep** and how to fight it:
- Scope creep is when features keep getting added and the project never ships
- How to fight it:
  - Write down the Won't Have list (makes it official)
  - Set a launch date and work backward
  - Ask "Does this help the user accomplish the core task?" If no, it is a Won't Have.
  - Every new idea goes to the backlog, not into the current sprint

**Where you should be:** You understand backlog structure, two prioritization frameworks, MVP definition, and scope creep prevention.

**Live Walkthrough: Tools for Managing Backlogs**

**Setup:** Quick tour of free backlog management tools.

Free tools that actually work:
- **GitHub Projects**: Built into GitHub, kanban board, free. You already have a GitHub account.
- **Trello**: Classic kanban, free tier is generous. Drag and drop cards.
- **Linear**: Beautiful, fast, free for small teams. More opinionated than Trello.
- **Notion**: All-in-one workspace, free for personal use. Can build custom backlog views.

For a solo founder, any of these works. Pick one and commit.

Quick demo: setting up a GitHub Projects board with columns: Backlog, Sprint 1, In Progress, Done.

"Do not spend 3 hours picking a project management tool. That is procrastination cosplaying as productivity. Pick one, use it, move on."

**Where you should be:** You can set up a project board and begin adding stories.

**Watch for this:**
- This is where you say "no" to a good idea. Be ruthless.
- RICE scoring is about forcing structured thinking, not about mathematical precision. The numbers are guesses.
- The MVP is the piece people make too big. If you cannot build it in two weeks, it is not this MVP.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-8-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const stories = [{id: 'list', value: 5, effort: 2}, {id: 'export', value: 2, effort: 3}];
const ranked = [...stories].sort((a, b) => b.value / b.effort - a.value / a.effort);
check(ranked[0].id === 'list', 'Illustrative ranking');
check(stories[0].id === 'list', 'Source backlog preserved');
console.log('Scores support discussion; they do not replace evidence or dependencies.');
console.log('ok: checkpoint-8-2');
```

## Where it breaks

![](diagram:session-8-2/fig2-diagnosis)

### Technical task masquerades as value

The card says "Add Redis." Nobody can tell when it is done in a way a user would notice, and the board fills with tasks that feel like progress because they are busy. Write the user outcome the cache is supposed to unlock, and put the technical work under it. If you cannot name the outcome, the card is not ready. "Set up the repo" is legitimate only as a step toward a first path a person can walk. A board of tools is a shopping list. A board of outcomes is a plan.

### Story too large

The card says "Build messaging" and it sits in progress for two weeks. It crosses design, storage, notifications, and permissions, so it cannot finish, and it cannot be reviewed. Split it by a slice of the workflow a person can complete, not by layer. "Send a message to one existing member, with no notifications" can ship and teach you whether the model is right. "Finish the API, then the UI, then the emails" cannot. If a card does not fit in a few days, it is still a project.

### Ambiguous done

Two people read "user can manage quests" and build different things. One includes delete. One includes only a title. Both mark the card done. Done needs an example: given this user and this state, this action produces this result, and this other action is refused. Write that on the card before you start. A demo that surprises the person who wrote the card means the card was a slogan. The example is the requirement. The slogan is the title.

## Your turn

**Guided Practice Exercise 1: Write 10 User Stories**

**Prompt:** Create 10 user stories with acceptance criteria for your capstone idea.

**Starter Materials:** User story format template (provided in Explanation section).

**Steps:**
1. Based on your user research and empathy maps from Session 8.1, identify the core problem your capstone solves
2. Write 10 user stories in the "As a [user], I want [feature], so that [benefit]" format
3. For your top 3 most important stories, write full acceptance criteria (3-5 checkboxes each)
4. Check each story against INVEST criteria
5. Swap with a partner and review: Are the stories too big? Too vague? Missing the "so that" clause?

**Success Criteria:**
- 10 user stories in correct format
- Each story has a clear user type, action, and benefit
- Top 3 stories have testable acceptance criteria
- No story is an "epic" (too big to build in a week)
- Stories come from research, not assumptions

**Time:** 30 minutes (20 min writing, 10 min peer review)

**Checkpoints:**
- Checkpoint: at least 5 stories are drafted
- At 20 minutes: All 10 stories should be complete with top 3 having acceptance criteria
- At 25 minutes: Partner review should be identifying stories that are too big or missing the "so that" clause

**Guided Practice Exercise 2: Prioritize Your Backlog with MoSCoW**

**Prompt:** Take your 10 user stories and categorize them using MoSCoW.

**Starter Materials:** MoSCoW template (below).

**Steps:**
1. Write each of your 10 user stories on a separate sticky note (physical or digital)
2. Sort them into four categories: Must Have, Should Have, Could Have, Won't Have
3. Your Must Have list should contain 3-5 stories MAX. If everything is a Must Have, nothing is.
4. For each Must Have, write a one-sentence justification: "This is a Must Have because..."
5. Define your MVP: it is your Must Have list, and nothing more.
6. Share with a partner: do they agree with your Must/Should split? Challenge each other.

**MoSCoW Template:**

```
PROJECT: [Capstone Name]
MVP DEFINITION: [One sentence: what is the core thing?]

MUST HAVE (MVP - Sprint 1-2):
1. [Story] - Because: [justification]
2. [Story] - Because: [justification]
3. [Story] - Because: [justification]

SHOULD HAVE (Sprint 3-4):
1. [Story]
2. [Story]

COULD HAVE (Post-launch):
1. [Story]
2. [Story]

WON'T HAVE (Not this version):
1. [Story]
2. [Story]
```

**Success Criteria:**
- All 10 stories categorized
- Must Have contains 3-5 stories (not more)
- Each Must Have has a justification
- MVP is clearly defined in one sentence
- At least 1 item is in Won't Have (if everything made the cut, you are lying to yourself)

**Time:** 25 minutes (15 min sorting, 10 min partner discussion)

**Checkpoints:**
- At 10 minutes: Stories should be sorted into categories
- At 15 minutes: Justifications should be written for Must Have items
- At 20 minutes: Partner discussion should be challenging categorization decisions

## The quest

**Independent Lab: Build Your Capstone Product Backlog**

**Objectives:**
- Expand your user stories from 10 to 15-20
- Apply RICE or ICE scoring to your top 10 stories
- Set up a project board and add your stories

**Requirements:**
- 15-20 user stories in correct format
- Acceptance criteria for top 5 Must Have stories
- MoSCoW categorization for all stories
- RICE or ICE scores calculated for top 10 stories
- MVP definition in 2-3 sentences
- Project board created (GitHub Projects, Trello, Linear, or Notion) with Must Have and Should Have stories added as cards

**Hints:**
- Look at your empathy map for story ideas. Each pain point and opportunity should map to at least one user story.
- If you are stuck on RICE scoring, use ICE instead. It is simpler and works fine for solo projects.
- Your Won't Have list is a feature, not a failure. It proves you made real tradeoffs.

**Stretch Goals:**
- Write acceptance criteria for ALL stories, not just the top 5
- Create a simple wireframe sketch (pen and paper is fine) for each Must Have story
- Research 2-3 competitors and list which user stories they cover

**Submission:** Link to your project board + a markdown file with your MoSCoW breakdown and MVP definition, pushed to your capstone repo.

### Review the artifact

Your deliverable is **A prioritized backlog with user stories and testable acceptance criteria**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-8-2/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Session 8.1 and homework (practice interview completed, empathy map created). Have your capstone idea ready, even if still evolving.
**Materials:** Product backlog template (provided below), MoSCoW template (provided below), RICE scoring template (provided below), project board tool of choice (GitHub Projects, Trello, Linear, or Notion)

**Due before Session 8.3:**

1. Review your user research notes and empathy map from Session 8.1
2. Write 15-20 user stories for your capstone (expand the 10 from class)
3. Write acceptance criteria for your top 5 Must Have stories
4. Prioritize all stories using MoSCoW
5. Score your top 10 stories using RICE or ICE
6. Write your MVP definition in 2-3 sentences
7. Set up a project board (GitHub Projects, Trello, Linear, or Notion) and add your Must Have and Should Have stories as cards

**Submission:** Link to your project board + a markdown file with your MoSCoW breakdown and MVP definition, pushed to your capstone repo.

**Estimated Time:** 3-4 hours

**Stretch Goals (Optional):**
- Write acceptance criteria for ALL stories, not just the top 5
- Create a simple wireframe sketch (pen and paper is fine) for each Must Have story
- Research 2-3 competitors and list which user stories they cover

---

### Manual verification and further reading

- [Official reference 1](https://www.scrumguides.org/scrum-guide.html)
