---
editorial: true
title: Field Work
subtitle: Real User Interviews and Sprint Planning
hook: "A research-to-backlog handoff and a realistic first sprint plan. Synthesize real interviews without inventing certainty."
read: 60
artifact: "A research-to-backlog handoff and a realistic first sprint plan"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.gov.uk/service-manual/user-research/analyse-a-research-session
say:
  - "Evidence: Synthesize real interviews without inventing certainty."
  - "Decision: Choose a problem and document alternatives."
  - "Plan: Commit to a small testable product increment."
---

## The hook

Today is different. Today is not lecture day. Today is DO day. Everything you have learned in this unit, the Mom Test, empathy mapping, user stories, backlogs, sprint planning, all of it comes together right now. You are going to conduct real interviews with real humans, synthesize real data, and make real decisions about what to build.

This is the session where you stop theorizing and start operating like a founder. You are going to hear things that surprise you. You are going to discover that some of your assumptions were wrong. That is not failure. That is the whole point. The founders who win are the ones who find out they are wrong BEFORE they spend months building the wrong thing. The founders who lose are the ones who never asked.

By the end of today, you will have a validated understanding of your target user, a research-backed backlog, and a Sprint 1 plan ready to execute. You will present your findings to the group and get feedback that makes your plan stronger. This is the bridge between "I have an idea" and "I have a plan." Let us cross it.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Create a comprehensive product spec document grounded in validated user research

**You will:**
- Integrate user research, empathy maps, personas, backlog, prioritization, and sprint planning into a single product spec document
- Demonstrate research-driven decision making by showing how interview findings changed backlog priorities
- Present research findings and sprint plan to peers and incorporate feedback

**You will be able to:**
- Produce a complete product spec document containing user research summary, persona, prioritized backlog, MVP definition, and Sprint 1 plan
- Identify at least one validated and one invalidated assumption from their user research
- Deliver a 2-3 minute presentation of their product spec and incorporate peer feedback

---

**Welcome and Field Work Briefing**

"Today is different. Today is not lecture day. Today is DO day."

This session structure:
- Block 1: Conduct interviews (or review pre-recorded interviews if done before class)
- Block 2: Synthesize findings
- Block 3: Build backlog and plan Sprint 1
- Block 4: Present to the group

Ground rules for interviews:
- Be genuinely curious, not performative
- Record (with permission) or take aggressive notes
- Do NOT mention your solution. Focus on the problem.
- It is okay if the interview goes off-script. Follow the interesting threads.
- Thank them sincerely. They are giving you their time.

If you already conducted interviews before this session (recommended), you will use this time to review, synthesize, and plan.

Quick logistics: remote interviews via Zoom/Google Meet are fine. Phone calls work too. In-person is ideal but not required.

**Key Points:**
- This is a working session, not a lecture. The majority of time is spent doing, not listening.
- Real user interviews are the foundation of everything that follows.
- Interview data should change your backlog. If nothing changes, you were not listening.

**Common Misconceptions:**

| Wrong | Correct |
|---|---|
| "I already know what my users want because I interviewed classmates" | Classmates giving hypothetical answers are not the same as real target users describing real experiences |
| "If my research does not change anything, I was right all along" | If research does not change at least one priority or assumption, you were probably asking leading questions or not listening carefully |
| "Sprint 1 should include all my Must Have stories" | Sprint 1 should be the foundation: auth plus one core feature, maximum. Spread Must Have items across multiple sprints |

![](diagram:session-8-4/fig1-model)

### Move from stories people tell to work you can test

Begin with the anonymized notes rather than the feature list you hoped to build. Highlight repeated behaviors, workarounds, costs, and contradictions. Group related observations and give each group a descriptive name. Keep links back to the original notes so another reviewer can check the interpretation. Do not turn every quotation into a requirement or count a small convenience sample as a market survey.

Select one problem statement that identifies a user, context, obstacle, and consequence. “Tutors lose track of which invoices need follow-up after checking several tools” suggests a workflow problem. “Tutors need our dashboard” already assumes the solution. Write at least two possible responses, including a smaller non-automated option. Comparing alternatives exposes whether the proposed software is proportionate to the problem.

### Make the first sprint a learning instrument

Choose a sprint goal that produces both usable behavior and evidence. A read-only overdue list may be enough to test whether the information helps users decide whom to contact. Automated reminders, payment collection, and analytics can wait until the core view proves useful. This is not lowering quality; it is reducing scope while preserving a complete interaction.

Create stories with concrete acceptance examples. Include empty data, invalid data, and unavailable service behavior. Identify dependencies and make the order visible. Estimate capacity using the actual time available to the team. If the plan requires every optimistic estimate to be correct, it has no room for ordinary uncertainty. Cut optional work before the sprint begins rather than silently carrying unfinished items afterward.

### Run a review before building

Have a peer play the role of a skeptical stakeholder. Ask them to trace one proposed story back to evidence and one acceptance criterion forward to a test. If either connection is missing, refine the artifact. A story can be valuable but poorly supported; label it as a hypothesis rather than pretending it came directly from research. That distinction makes future learning possible.

Also review recruitment gaps. If every participant uses the same workaround, you may have learned about one segment rather than the whole market. Document who was not represented and how that limits the decision. The next research round can target that gap. Avoid replacing uncertainty with a polished persona that appears more precise than the interviews justify.

### Define the end-of-sprint conversation now

Write the task you will ask a participant to perform on the increment. Decide what you will observe: successful identification, hesitation, errors, or time to a decision. Do not coach them through the interface while measuring usability. Keep the task neutral and use synthetic records. Record whether the result supports, weakens, or changes your original hypothesis.

The submission includes the synthesis, problem statement, alternatives, prioritized backlog, sprint goal, and review plan. Finish with a short decision log explaining what you deliberately deferred. A complete product plan is not the largest possible feature set. It is a reasoned next step with a way to learn whether that step helped.

## The demonstration

**Block 1: Conduct Interviews**

**Option A: Live Interviews (recommended)**

Conduct 2 or 3 interviews, about 20 minutes each.
- Use your finalized interview script
- Take notes during. Star the most interesting quotes.
- Between interviews: jot down your top 3 takeaways while it is fresh

**Option B: Review Pre-Conducted Interviews**

If you already conducted 3-5 interviews before this session, use this time to:
- Re-read all your notes
- Highlight patterns across interviews
- Identify contradictions (interviewee 2 said X, interviewee 4 said the opposite)
- List the top 5 most surprising things you heard

**Interview Tracking Sheet:**

```
INTERVIEW LOG

Interview 1:
- Name (first only): ___________
- Date/Time: ___________
- Duration: ___________
- Format: [In-person / Video / Phone]
- Top 3 takeaways:
  1.
  2.
  3.
- Best quote: "___________"
- Surprising finding:

Interview 2:
[Same format]

Interview 3:
[Same format]

Interview 4 (if completed):
[Same format]

Interview 5 (if completed):
[Same format]
```

**BREAK**

**Block 2: Synthesize Findings**

**Step 1: Build Your Empathy Map**
- Pull together all interview notes
- Create one COMBINED empathy map representing your target user (not one per interviewee)

```
COMBINED EMPATHY MAP - [Target User Description]
Based on [X] interviews conducted [dates]

+--------------------------+--------------------------+
|         SAYS             |         THINKS           |
| (direct quotes, pick     | (inferred thoughts)      |
|  the 5 best)             |                          |
|                          |                          |
| 1.                       | 1.                       |
| 2.                       | 2.                       |
| 3.                       | 3.                       |
| 4.                       | 4.                       |
| 5.                       | 5.                       |
+--------------------------+--------------------------+
|         DOES             |         FEELS            |
| (observed/described      | (emotions identified)    |
|  behaviors)              |                          |
|                          |                          |
| 1.                       | 1.                       |
| 2.                       | 2.                       |
| 3.                       | 3.                       |
| 4.                       | 4.                       |
| 5.                       | 5.                       |
+--------------------------+--------------------------+
```

**Step 2: Extract Key Insights**

```
KEY INSIGHTS FROM RESEARCH

Patterns (things multiple people said/did):
1.
2.
3.

Pain Points (biggest frustrations):
1.
2.
3.

Surprises (things you did not expect):
1.
2.

Opportunities (where you can help):
1.
2.
3.

Validated Assumptions (things you assumed that
turned out to be true):
1.

Invalidated Assumptions (things you assumed that
turned out to be wrong):
1.
```

**Step 3: Create or Update Your Persona**

```
USER PERSONA

Name: [Give them a name]
Age: [Based on interview demographics]
Role: [Job/situation]
Tech Comfort: [Low / Medium / High]

Quote: "[Best quote from your interviews]"

Story: [2-3 sentences describing their situation
and struggle, based on real interview data]

Goals:
-
-

Frustrations:
-
-
-

Current Solutions:
- [What they use now]
- [Workarounds they have created]

Needs:
- [What would actually help them]
- [What they cannot find in existing solutions]
```

**Where you should be:** You have a synthesized empathy map, key insight document, and refined persona based on real interview data.

**Watch for this:**
- During the interviews, do not pitch. If you hear yourself describing your app, stop and ask what they did last time.
- In the synthesis, name at least one assumption the interviews broke. If everything matched, you are not done looking.
- The persona should be specific enough to feel like a real person. "25-year-old professional who likes technology" is not a persona.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-8-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const evidence = new Set(['interview-1', 'interview-2']);
const stories = [{id: 'overdue-list', evidence: ['interview-1']}, {id: 'gamification', evidence: []}];
const unsupported = stories.filter(s => !s.evidence.length || s.evidence.some(id => !evidence.has(id)));
check(unsupported.length === 1 && unsupported[0].id === 'gamification', 'Unproven idea remains a hypothesis');
console.log('ok: checkpoint-8-4');
```

## Where it breaks

![](diagram:session-8-4/fig2-diagnosis)

### Interview notes become feature votes

One person asked for a dark mode, so it jumps the queue, ahead of the task that three people described struggling with. A sentence in an interview is a clue, not a ballot. Ask how often it happens and what they do today. Cluster the notes. Build the thing several people trip over, and write down the requests you are not building so the decision is visible. Treating every comment as a feature is how a small tool becomes a drawer of unrelated switches.

### Scope ignores capacity

The plan contains six workflows and the time contains one. You start all six, finish none, and the field test has nothing a person can complete. Cut to one path from the first screen to a saved result. Say out loud what you are not building this round. A thin path you can watch someone use will teach you more than a wide sketch nobody can finish. Capacity is a requirement. A plan that ignores it is fiction.

### No learning criterion

You ship the slice and then argue about whether the test "went well," because you never said what result would change your mind. Before you watch anyone use it, write the criterion: four of five people complete the save without help, or they don't, and if they don't you will change the form rather than add a tour. Afterward, compare the notes to that sentence. A test with no criterion can be narrated as a success no matter what happened.

## Your turn

**Guided Practice Exercise 1: Interview Synthesis Workshop (Block 2 activities, integrated above)**

**Prompt:** Synthesize data from multiple interviews into a single empathy map and insight document.

**Steps:**
1. Gather all interview notes (from pre-class interviews or live interviews conducted today)
2. Read through all notes and use colored highlights or markers:
   - Yellow = direct quotes (SAYS)
   - Blue = behaviors observed (DOES)
   - Pink = emotions detected (FEELS)
   - Green = surprising insights
3. Build the combined empathy map (template in Block 2 above)
4. Extract key insights (patterns, pain points, surprises, opportunities)
5. Create or refine your user persona

**Success Criteria:**
- Empathy map has 3-5 entries per quadrant
- Insights are based on interview data, not assumptions
- At least one "invalidated assumption" identified (if everything matched your assumptions, you were not listening hard enough)
- Persona feels like a real person, not a demographic checkbox

**Time:** 35 minutes (Block 2)

**Checkpoints:**
- At 15 minutes: Combined empathy map should be filled with entries from all interviews
- At 25 minutes: Key insights should be extracted with patterns and pain points identified
- At 35 minutes: Persona should be refined based on research data

**BREAK**

**Guided Practice Exercise 2: Backlog Refinement and Sprint Planning**

**Prompt:** Update your backlog with research-driven changes and plan Sprint 1.

**Step 1: Update Your Backlog Based on Research**

Compare your existing user stories to your research findings. Add new stories based on pain points you discovered. Remove or deprioritize stories that your research did not support. Update your MoSCoW priorities based on what users actually care about (not what you assumed).

```
BACKLOG UPDATE LOG

Stories ADDED based on research:
- [New story]: because interviewees said [finding]
- [New story]: because interviewees said [finding]

Stories REMOVED or deprioritized:
- [Story]: moved from Must to Could because no one
  mentioned this need
- [Story]: removed entirely because research showed
  this is not a real problem

Stories that STAYED as Must Have (validated):
- [Story]: confirmed by [X] out of [Y] interviewees
```

**Step 2: Plan Sprint 1**

```
SPRINT 1 PLAN

Sprint Goal: "[What will be true after Sprint 1?]"

Sprint Duration: [1 week / 2 weeks]

Selected Stories:
| # | Story | Points | Acceptance Criteria Summary |
|---|-------|--------|---------------------------|
| 1 |       |        |                           |
| 2 |       |        |                           |
| 3 |       |        |                           |
| 4 |       |        |                           |
| 5 |       |        |                           |
| TOTAL |  |  [X] pts |                          |

Sprint Schedule:
- Day 1: [What you will work on]
- Day 2: [What you will work on]
- Day 3: [What you will work on]
- Day 4: [What you will work on]
- Day 5: [Review and retro]

Definition of Done (for each story):
- [ ] Feature works as described in acceptance criteria
- [ ] Code is committed and pushed to GitHub
- [ ] Basic tests written (at minimum, manual testing)
- [ ] No console errors or crashes
```

**Success Criteria:**
- Backlog reflects research findings (not just pre-interview assumptions)
- At least 2 new stories added based on interview insights
- At least 1 story removed or deprioritized because research did not validate it
- Sprint 1 has a clear, achievable goal
- Total story points do not exceed capacity
- Day-by-day schedule is realistic

**Time:** 30 minutes (15 min backlog update, 15 min sprint plan)

**Checkpoints:**
- At 10 minutes: Backlog update log should show specific changes driven by research
- At 20 minutes: Sprint 1 stories should be selected within capacity
- At 30 minutes: Sprint plan should be complete with goal, schedule, and Definition of Done

## The quest

**Block 4: Presentations and Peer Feedback**

Present this, in two or three minutes:
1. Who is your target user? (Show your persona)
2. What is the biggest pain point you discovered? (Show your empathy map)
3. What is your MVP? (Show your Must Have list)
4. What is your Sprint 1 goal? (Show your sprint plan)

Peer feedback: after each presentation, 1-2 classmates give feedback:
- "Your Must Have list looks solid because..."
- "Have you considered..."
- "I am curious how you will handle..."

"This is not a pitch. This is a sanity check. We are helping each other make sure we are building the right thing."

**Unit Wrap-Up**

"You came into this unit as a developer. You are leaving as a product thinker."

What you now have:
- A researched, validated understanding of your target user
- An empathy map and persona based on real data
- A prioritized product backlog with user stories and acceptance criteria
- A Sprint 1 plan with a clear goal
- A project management board set up and ready to go

"In Unit 9, you will learn TypeScript and algorithms. In Unit 12, you will use everything from this unit to actually build your capstone in sprints. The plan is ready. When the time comes, you will execute."

"You are not guessing anymore. You have data. You have a plan. That is what separates founders from people with ideas. Let us go."

**Independent Lab: Complete Your Product Spec Document**

**Objectives:**
- Finalize all sections of the product spec document
- Ensure every section is backed by real research data
- Prepare the document for submission

**Requirements:**
- All 6 required sections complete (User Research Summary, User Persona, Product Backlog, MoSCoW Prioritization, MVP Definition, Sprint 1 Plan)
- Research summary includes data from at least 3 interviews
- Backlog shows evidence of research-driven changes
- Sprint plan is realistic and within capacity

**Hints:**
- Use the product spec template provided in the Unit Project section below
- Your best quotes and insights should be front and center. They prove you did the work.
- If you are missing interviews, schedule them immediately. Complete them before Unit 12.

**Stretch Goals:**
- Conduct 2 additional interviews (aim for 5 total)
- Create a simple wireframe for each Must Have story (pen and paper or Figma)
- Write a competitive analysis: 3 existing solutions, what they do well, what they miss
- Record a 2-minute Loom video walking through your product spec

**Submission:**
- Product spec document (markdown) pushed to capstone repo
- Project board link
- Loom video link (optional)

### Review the artifact

Your deliverable is **A research-to-backlog handoff and a realistic first sprint plan**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

### Unit project: completion contract

### "The Guild Charter: Forging Your Capstone Blueprint"

### Quest Arc

You have been grinding solo dungeons for seven units. You have slain syntax errors, conquered deployment bosses, and tamed the wild beasts of testing. But now the guild hall has recognized your strength, and they have done something you did not expect: they put you in charge. You are the Guild Leader now. And guild leaders do not just swing swords. They plan raids. They talk to the townspeople. They figure out which quests actually matter and which ones are distractions disguised as glory.

Your first task as Guild Leader? Forge the Guild Charter. This is the sacred document that tells your party what you are fighting for, who you are fighting for, and how you plan to win. You will venture into the taverns (user interviews), listen to the common folk (your target users), map their struggles and desires (empathy mapping), post the quests on the guild board (product backlog), and plan your first raid (Sprint 1).

The ancient guilds that failed? They charged into dungeons without reconnaissance. They built legendary weapons for enemies that did not exist. They planned six-month campaigns and watched the dungeon meta shift in week two. Your guild will be different. Your guild has data. Your guild has a plan. Your guild runs sprints. Your Guild Charter will be the proof that you are not just a warrior. You are a leader.

Forge the charter. Plan the raid. The capstone dungeon awaits.

### Technical Requirements

**Must Have (required for full credit):**

1. **User Research Summary**
   - [ ] Empathy map (combined from all interviews)
   - [ ] At least 3 completed interviews documented (5 recommended)
   - [ ] For each interview: date, duration, format, top 3 takeaways, best quote
   - [ ] Key insights section: patterns (3+), pain points (3+), surprises (1+), opportunities (2+)
   - [ ] At least 1 validated assumption and 1 invalidated assumption

2. **User Persona**
   - [ ] Name, age range, role, tech comfort level
   - [ ] Representative quote from interviews
   - [ ] 2-3 sentence story describing their situation
   - [ ] Goals (2+)
   - [ ] Frustrations (3+)
   - [ ] Current solutions and workarounds
   - [ ] Unmet needs

3. **Product Backlog**
   - [ ] Minimum 15 user stories in correct format ("As a..., I want..., so that...")
   - [ ] Acceptance criteria for all Must Have stories (3-5 criteria each)
   - [ ] All stories estimated with Fibonacci story points

4. **MoSCoW Prioritization**
   - [ ] Stories categorized into Must Have, Should Have, Could Have, Won't Have
   - [ ] Must Have contains 3-5 stories maximum
   - [ ] Each Must Have has a one-sentence justification
   - [ ] Won't Have contains at least 2 items (proves you made real tradeoffs)

5. **MVP Definition**
   - [ ] 2-3 sentence description of the minimum viable product
   - [ ] Clear statement of what the MVP does and does not include

6. **Sprint 1 Plan**
   - [ ] Sprint goal (one sentence)
   - [ ] Sprint duration specified
   - [ ] Selected stories with point estimates
   - [ ] Day-by-day schedule
   - [ ] Definition of Done checklist

**Should Have (recommended):**

7. **Competitive Analysis**
   - [ ] 2-3 existing solutions analyzed
   - [ ] What they do well, what they miss
   - [ ] How your product differs

8. **Wireframes or Sketches**
   - [ ] Low-fidelity wireframe for each Must Have story
   - [ ] Can be hand-drawn and photographed, does not need to be Figma

9. **Sprint 2-3 Rough Plan**
   - [ ] Which stories you plan to tackle in Sprint 2 and Sprint 3
   - [ ] Not detailed, just directional

**Could Have (stretch goals):**

10. **Video Walkthrough**
    - [ ] 2-3 minute Loom recording walking through the spec
    - [ ] Explain your research, persona, and plan like you are pitching to a co-founder

11. **Additional Research**
    - [ ] Survey data (if you ran a survey in addition to interviews)
    - [ ] Competitor user reviews analyzed for pain points

### Product Spec Template

Use this markdown template as the skeleton for your product spec:

```markdown
# Product Spec: [Your Capstone Name]
## [One-Line Description of What It Does]

**Author:** [Your Name]
**Date:** [Date]
**Version:** 1.0

---

## 1. User Research Summary

### Interviews Conducted

| # | Name | Date | Duration | Format |
|---|------|------|----------|--------|
| 1 |      |      |          |        |
| 2 |      |      |          |        |
| 3 |      |      |          |        |

### Interview Details

**Interview 1: [Name]**
- Top takeaways:
  1.
  2.
  3.
- Best quote: ""
- Surprising finding:

[Repeat for each interview]

### Combined Empathy Map

| SAYS | THINKS |
|------|--------|
| 1.   | 1.     |
| 2.   | 2.     |
| 3.   | 3.     |

| DOES | FEELS |
|------|-------|
| 1.   | 1.    |
| 2.   | 2.    |
| 3.   | 3.    |

### Key Insights

**Patterns:**
1.
2.
3.

**Pain Points:**
1.
2.
3.

**Surprises:**
1.

**Opportunities:**
1.
2.

**Validated Assumptions:**
1.

**Invalidated Assumptions:**
1.

---

## 2. User Persona

**Name:**
**Age:**
**Role:**
**Tech Comfort:** [Low / Medium / High]

**Quote:** ""

**Story:** [2-3 sentences]

**Goals:**
-
-

**Frustrations:**
-
-
-

**Current Solutions:**
-

**Unmet Needs:**
-
-

---

## 3. Product Backlog

| # | User Story | Points | MoSCoW |
|---|-----------|--------|--------|
| 1 | As a..., I want..., so that... | | Must |
| 2 | | | Must |
| 3 | | | Must |
| 4 | | | Should |
| 5 | | | Should |
| ... | | | |

### Acceptance Criteria (Must Have Stories)

**Story 1: [Short Name]**
- [ ]
- [ ]
- [ ]

**Story 2: [Short Name]**
- [ ]
- [ ]
- [ ]

[Continue for all Must Have stories]

---

## 4. MoSCoW Prioritization

### Must Have
1. [Story] - Because:
2. [Story] - Because:
3. [Story] - Because:

### Should Have
1.
2.

### Could Have
1.
2.

### Won't Have (This Version)
1.
2.

---

## 5. MVP Definition

[2-3 sentences: What does the MVP do? What does it
NOT do? Who is it for?]

---

## 6. Sprint 1 Plan

**Sprint Goal:** ""

**Sprint Duration:** [1 week / 2 weeks]

**Selected Stories:**

| # | Story | Points |
|---|-------|--------|
| 1 |       |        |
| 2 |       |        |
| 3 |       |        |
| TOTAL | | [X] pts |

**Day-by-Day Schedule:**
- Day 1:
- Day 2:
- Day 3:
- Day 4:
- Day 5:

**Definition of Done:**
- [ ] Feature works per acceptance criteria
- [ ] Code committed and pushed
- [ ] Basic tests written
- [ ] No console errors

---

## 7. Competitive Analysis (Optional)

| Competitor | What They Do Well | What They Miss |
|-----------|------------------|----------------|
| 1.        |                  |                |
| 2.        |                  |                |

---

## 8. Sprint 2-3 Rough Plan (Optional)

**Sprint 2 Focus:**
**Sprint 3 Focus:**
```

### Skill Points Rubric

**Boss Clear (70 pts) - Meets Expectations:**

| Criteria | Points | Requirements |
|----------|--------|-------------|
| User Research | 10 | 3 interviews documented with takeaways, quotes, and insights |
| Empathy Map | 10 | All 4 quadrants filled with research-backed data, 3+ entries each |
| User Persona | 10 | Specific persona with quote, story, goals, frustrations, and needs from research |
| User Stories | 10 | 15+ stories in correct format, Must Have stories have acceptance criteria |
| Prioritization | 10 | MoSCoW applied, Must Have is 3-5 items, Won't Have has 2+ items |
| MVP Definition | 10 | Clear 2-3 sentence MVP that defines scope and target user |
| Sprint Plan | 10 | Sprint goal, selected stories with estimates, day-by-day schedule |

**Epic Loot (20 pts) - Exceeds Expectations:**

| Criteria | Points | Requirements |
|----------|--------|-------------|
| Research Depth | 5 | 5+ interviews, deep synthesis, clear validated/invalidated assumptions |
| Empathy Map Quality | 3 | Rich detail, strong quotes, clear gap between SAYS and DOES identified |
| Persona Quality | 2 | Persona feels like a real person you know, with specific behavioral details |
| Story Quality | 3 | 20+ stories, all with acceptance criteria, INVEST criteria met |
| Prioritization Quality | 3 | RICE/ICE scores calculated, clear justifications for all priorities |
| MVP Specificity | 2 | MVP is specific, achievable in 2-4 weeks, and directly addresses top pain point |
| Sprint Plan Completeness | 2 | Sprint plan includes Definition of Done, realistic capacity, and contingency |

**Legendary (10 pts) - Outstanding Work:**

| Criteria | Points | Requirements |
|----------|--------|-------------|
| Overall Quality | 5 | Publication-quality spec that could be shared with a co-founder or investor |
| Competitive Analysis | 3 | 2-3 competitors analyzed with clear differentiation strategy |
| Video Walkthrough | 2 | 2-3 minute Loom that clearly communicates research, persona, and plan |

**Total: __ / 100 points**

### Submission Requirements

- **GitHub:** Push the product spec markdown file to your capstone repo (suggested path: `docs/PRODUCT_SPEC.md`)
- **Project Board:** Share the public link to your GitHub Projects, Trello, Linear, or Notion board with stories added
- **Video (recommended):** Record a 2-3 minute Loom walking through your product spec
- **Deadline:** Before Session 9.1

---

![](diagram:session-8-4/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Sessions 8.1-8.3 and all homework. Finalize your interview script. Have your product backlog with 15-20 user stories. Set up your sprint board. CRITICAL: Have 3-5 interview subjects identified and scheduled (you MUST have people lined up).
**Materials:** Finalized interview script, empathy map template, interview tracking sheet (provided below), backlog update log (provided below), sprint planning template, recording tools (phone for audio with permission, or note-taking tools), Zoom/Google Meet for remote interviews

**Due before Session 9.1:**

1. Finalize your product spec document (see Unit Project spec below for full requirements)
2. Push the document to your capstone repo
3. Share the project board link. It has to be readable by the person reviewing it.
4. Schedule your remaining interviews if you have not hit 3-5 yet (complete them before Unit 12)
5. Record a 2-minute Loom video walking through your product spec (this is your "pitch" for the spec)

**Submission:**
- Product spec document (markdown) pushed to capstone repo
- Project board link
- Loom video link

**Estimated Time:** 4-6 hours (this is the unit project, give it the time it deserves)

**Stretch Goals (Optional):**
- Conduct 2 additional interviews (aim for 5 total)
- Create a simple wireframe for each Must Have story (pen and paper or Figma)
- Write a competitive analysis: 3 existing solutions, what they do well, what they miss

---

### Manual verification and further reading

- [Official reference 1](https://www.gov.uk/service-manual/user-research/analyse-a-research-session)
