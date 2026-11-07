---
editorial: true
title: Listening at the Tavern
subtitle: User Research, Interviews, and Empathy Maps
hook: "An interview guide, anonymized notes, and an evidence-based empathy map. Ask about a recent concrete experience."
read: 60
artifact: "An interview guide, anonymized notes, and an evidence-based empathy map"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.gov.uk/service-manual/user-research/using-in-depth-interviews
say:
  - "Observe: Ask about a recent concrete experience."
  - "Separate: Keep quotations distinct from interpretations."
  - "Synthesize: Find patterns without erasing contradictory evidence."
---

## The hook

You know that moment in every isekai when the protagonist gets put in charge of something? Like, they have been soloing the whole time, maxing out their stats, and then suddenly they are running a guild, or a kingdom, or a whole adventurer party? And they realize... oh no, I actually have to plan things now? I cannot just swing my sword at every problem? Yeah. That is this unit. Welcome to the guild leader arc.

Here is the uncomfortable truth about startups. Most of them fail because they build something nobody wants. Not because the code was bad. Not because the team was lazy. They just built the wrong thing. The Mom Test, the book we are going to reference a lot this unit, opens with a brutal stat: almost every failed startup had a product that nobody asked for. User research is the cheat code that keeps you from wasting months of your life. And Agile, sprints, all that process stuff? That is how you ship fast enough to learn before you run out of money. Or motivation. Or both.

By the end of this unit, you will have a real product spec for your capstone. Not a vague idea. Not "I want to build an app." A researched, validated, prioritized plan with user stories, an empathy map, and your first sprint laid out. This is the document that turns your idea into a product. Four sessions. Session 1: we learn to listen, really listen, to users. Session 2: we turn what we hear into user stories and a backlog. Session 3: we learn Agile and SCRUM so we can actually execute. Session 4: you go do real interviews, build your real backlog, and plan Sprint 1 of your capstone. You have been leveling up your technical skills for seven units. Now you level up the skill that separates builders from founders. Let us go.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Apply user research methodologies to gather and synthesize qualitative user data

**You will:**
- Distinguish between generative and evaluative research and identify when each is appropriate
- Apply The Mom Test principles to construct interview questions that elicit honest, actionable responses
- Conduct a structured user interview using active listening, follow-up questions, and note-taking techniques
- Construct an empathy map from interview data, populating the Says, Thinks, Does, and Feels quadrants
- Synthesize findings from multiple interviews into user personas and actionable insight summaries

**You will be able to:**
- Write a 7-question interview script that passes Mom Test criteria and focuses on past behavior rather than hypothetical futures
- Conduct a 20-30 minute user interview and capture direct quotes, observed behaviors, and inferred emotions
- Build a combined empathy map from 3 or more interviews, identifying patterns, pain points, and opportunities

**Welcome and The Most Expensive Mistake in Tech**

"Welcome to the guild leader arc. You have been grinding code for 7 units. Now we learn the skill that determines whether your code matters."

Story time: failed startups that built things nobody wanted:
- Juicero ($120M raised, built a $400 juice bag squeezer, nobody needed it)
- Google Wave (brilliant engineering, zero user demand)
- Quibi ($1.75 billion raised, shut down in 6 months)

The pattern: they all skipped real user research or ignored what users told them.

"Building without user research is like fighting a boss with your eyes closed. You might land a hit, but you are probably going to get wrecked."

**Why User Research Matters**

The build trap: when teams measure success by features shipped instead of problems solved.

Types of user research:
- **Generative research** (discovery): "What problems exist?" Done before you build.
- **Evaluative research** (validation): "Does this solution work?" Done after you build.
- **Quantitative** (surveys, analytics, numbers): tells you WHAT is happening.
- **Qualitative** (interviews, observation, conversations): tells you WHY.

When to do research:
- Before you write a single line of code (most important, most skipped)
- After you have a prototype (usability testing)
- Continuously (feedback loops, analytics)

The founder advantage: you are small, you are fast, you can literally DM your users.

"Big companies spend $50K on focus groups. You are going to spend $0 and get better data by buying someone a coffee and asking good questions."

**The Mom Test**

The book "The Mom Test" by Rob Fitzpatrick is the single best book on user interviews, period.

The core problem: people lie to you. Not because they are bad people, but because they want to be nice.

**The Mom Test rules:**
1. Talk about their life, not your idea
2. Ask about specifics in the past, not hypotheticals about the future
3. Talk less, listen more
4. Push for commitment and advancement, not compliments

**Bad questions vs. good questions:**

| Bad Question (Breaks the Mom Test) | Why It Is Bad | Good Question (Passes the Mom Test) |
|---|---|---|
| "Would you use an app that does X?" | Hypothetical future, invites polite lies | "How do you currently handle X?" |
| "Do you think this is a good idea?" | Begging for compliments | "What have you tried to solve this problem?" |
| "Would you pay $10/month for this?" | Hypothetical spending is meaningless | "What do you currently spend on solving this?" |
| "Do you have this problem?" | Leading question, easy to say yes | "Tell me about the last time you dealt with X." |
| "What features would you want?" | Users design bad products | "Walk me through your process when you do X." |

The three types of bad data from conversations:
1. **Compliments**: "That sounds awesome!" (meaningless)
2. **Fluff**: "I would definitely use that." (hypothetical, also meaningless)
3. **Ideas**: "You should add a feature that..." (their job is the problem, your job is the solution)

Real example walkthrough:
- Bad interview: "I am building a meal planning app. Do you think that is useful?" "Oh yeah, totally!"
- Good interview: "When was the last time you planned meals for the week? Walk me through what happened." "Honestly, I tried once three months ago and gave up by Wednesday because I forgot to buy half the ingredients."
- The good version gave you a real insight: the problem is not planning, it is the grocery list integration

Discussion prompt: "Think about your capstone idea. What question would your mom say yes to that does not actually prove anything?"

**Key Points:**
- User research is the difference between building something people need and building something people ignore
- Generative research (before building) is the most important and most skipped type
- The Mom Test provides four rules for questions that produce honest answers instead of polite lies
- The gap between what users say and what users do is where the most valuable insights live

**Common Misconceptions:**

| Wrong | Correct |
|---|---|
| "User research means asking people if they like my idea" | User research means understanding people's problems, behaviors, and needs before presenting any solution |
| "If people say they would use my app, that validates it" | Hypothetical interest is meaningless. Only past behavior and current spending patterns validate demand |
| "I can skip research because I AM my target user" | Even if you experience the problem, you are one data point. Other users have different contexts, workarounds, and priorities |

![](diagram:session-8-1/fig1-model)

### Research starts with a decision

Write the product decision the interviews should inform. “Learn about users” is too broad to guide a short session. “Understand how independent tutors track unpaid invoices” identifies a context, behavior, and uncertainty. You can then ask about the most recent invoice, the tools used, the moment something went wrong, and the workaround. These questions produce evidence about existing behavior rather than polite predictions about a product that does not exist.

Separate a research question from an interview question. You may want to know whether reminders would be valuable, but asking “Would reminders help?” encourages agreement. Ask how the participant notices an overdue payment now, what happens next, and what the delay costs them. The participant supplies the story; you interpret its implications afterward. Do not sell your solution while trying to understand the problem.

### Consent makes the session legible

Explain the purpose, expected duration, and how notes will be used. Ask separately before recording. A person can participate without agreeing to a recording, and they can decline a question. Use anonymized participant identifiers in the shared artifact. Remove account numbers, contact details, and unrelated personal information. A realistic research repository does not need to become a repository of unnecessary private data.

Recruit participants based on relevant behavior rather than convenience alone. Friends can be useful practice interviewees, but their desire to encourage you can distort product evidence. Keep a simple recruitment criterion and document the sample's limits. Five conversations can reveal useful patterns; they do not establish a population-wide percentage. Describe findings at the scale your evidence supports.

### Preserve the chain from observation to decision

Use separate columns for what the participant said, what you observed, your interpretation, and a possible product response. A quotation is not the same as a universal requirement. If one person says they hate reminders, investigate when and why rather than deleting reminders from the roadmap immediately. Contradictory evidence can reveal different contexts or user groups.

An empathy map organizes observations but should not invent inner thoughts. Mark inferred feelings as interpretations and connect them to evidence. Empty cells are acceptable when the interview did not address them. A complete-looking diagram filled with assumptions is less useful than an honest map showing what remains unknown. Research artifacts should make uncertainty visible.

### Close the loop with a small experiment

Choose one insight that could change the product and write a testable hypothesis. For example, participants who currently maintain a manual overdue list may benefit from a clear status view before they need automated messaging. A paper sketch or clickable prototype can test whether that view helps them find the next action. This is cheaper than building a notification system before understanding the workflow.

Submit the guide, recruitment rationale, anonymized notes, synthesis, and decision. Include one finding that challenged your original idea. The lesson is successful when evidence changes what you plan to build, even if that means reducing scope or abandoning a favorite feature.

## The demonstration

**BREAK**

**Live Walkthrough: Writing an Interview Script**

**Setup:** Open a blank document. Walk through building an interview script from scratch for a sample capstone idea (freelancer budgeting app).

**Steps:**

1. Define the broad problem space (NOT the solution): "How freelancers manage their money"
2. Write the warm-up section: build rapport, explain purpose, get consent
3. Write context questions (2 questions): understand their world
4. Write problem exploration questions (3 questions with follow-ups): dig into the pain
5. Write current solutions questions (2 questions with follow-ups): what they do now
6. Write the wrap-up: anything else to add, ask for referrals (snowball recruiting)

**Structure of a user interview script:**
1. **Warm-up**: build rapport, explain the purpose, get consent
2. **Context questions**: understand their world
3. **Problem exploration** (10-15 min): dig into the pain
4. **Current solutions** (5-10 min): what they do now
5. **Wrap-up**: anything else, ask for referrals

**Interview Script Template:**

```
INTERVIEW SCRIPT - [Your Product Area]
Date: ___________
Interviewee: ___________ (first name only is fine)
Duration target: 25-30 minutes

WARM-UP (2 minutes)
"Thanks for taking the time to chat with me. I am working on
a project related to [broad area, NOT your specific idea], and
I am trying to understand how people currently deal with
[problem space]. There are no right or wrong answers. I am
genuinely curious about your experience. Is it okay if I
take notes?"

CONTEXT (5 minutes)
1. "Tell me a bit about your role / daily routine as it
   relates to [area]."
2. "How often do you encounter [situation related to
   problem space]?"

PROBLEM EXPLORATION (10-15 minutes)
3. "Tell me about the last time you [activity related to
   the problem]. Walk me through what happened."
   - Follow-up: "What was the hardest part about that?"
   - Follow-up: "What happened next?"
4. "What is the most frustrating thing about [process]?"
   - Follow-up: "Can you give me a specific example?"
5. "If you could wave a magic wand and fix one thing about
   [area], what would it be?"
   - Follow-up: "Why that one thing specifically?"

CURRENT SOLUTIONS (5-10 minutes)
6. "What tools or methods do you currently use to handle
   [problem]?"
   - Follow-up: "How did you find that solution?"
   - Follow-up: "What do you like about it? What is missing?"
7. "Have you ever tried other solutions? What happened?"
   - Follow-up: "Why did you switch / stop using it?"

WRAP-UP (3 minutes)
"This has been incredibly helpful. Two last things:
- Is there anything about [area] that I did not ask about
  that you think is important?
- Do you know 1-2 other people who deal with [problem] that
  I could talk to?" (snowball recruiting)
```

**Where you should be:** an interview script you can take to your own project.

**Example Completed Script (Freelancer Budgeting):**

```
CAPSTONE IDEA: A budgeting app for freelancers
(DO NOT MENTION THIS IN THE INTERVIEW)

BROAD PROBLEM SPACE: How freelancers manage their money

WARM-UP:
"Hey, thanks for chatting with me. I am doing some research
on how freelancers handle their finances. No right or wrong
answers, just genuinely curious about your experience."

QUESTIONS:

1. "Tell me about how you currently track your income and
    expenses as a freelancer."
   Follow-up: "How long have you been doing it that way?"

2. "Walk me through the last time you had to figure out
    how much money you could actually spend this month."
   Follow-up: "How long did that take you?"
   Follow-up: "How confident were you in the number?"

3. "Tell me about a time when you were surprised by your
    finances, positively or negatively."
   Follow-up: "What did you do after that?"

4. "What tools or systems do you use for money management
    right now?"
   Follow-up: "How did you find those tools?"
   Follow-up: "What do you wish they did differently?"

5. "When tax season comes around, what does that process
    look like for you?"
   Follow-up: "What is the most painful part?"

6. "Have you ever tried a budgeting app or system and
    stopped using it? What happened?"
   Follow-up: "At what point did you stop?"

7. "If you could snap your fingers and fix one thing about
    how you handle money as a freelancer, what would it be?"
   Follow-up: "Why that one thing?"

WRAP-UP:
"This was really helpful. Is there anything about managing
money as a freelancer that I did not ask about? And do you
know any other freelancers who might chat with me for
20 minutes?"
```

**Tips for the script:**
- Print it or have it on a second screen. Do not read from it robotically.
- The follow-up questions matter more than the main questions.
- "Tell me more about that" is the most powerful phrase in interviewing.
- Silence is okay. Let people think. Do not fill every pause.
- Take notes during, but write up full notes within 24 hours while it is fresh.

**Live Walkthrough: Empathy Mapping**

**Setup:** Show the four-quadrant empathy map template. Walk through filling it in with sample interview data.

**Steps:**

1. Explain the four quadrants and what goes in each one
2. Fill in the SAYS quadrant with direct quotes from sample data
3. Fill in the THINKS quadrant with inferred thoughts (read between the lines)
4. Fill in the DOES quadrant with observable actions and behaviors
5. Fill in the FEELS quadrant with emotional states
6. Identify the gap between SAYS and DOES (where the gold is)
7. Extract pain points, unmet needs, and opportunities

**The four quadrants:**

```
+---------------------------+---------------------------+
|          SAYS             |          THINKS           |
|                           |                           |
| Direct quotes from        | What they are probably    |
| interviews. Use their     | thinking but did not say  |
| exact words.              | out loud. Inferred from   |
|                           | context and body language.|
| "I just Google it and     | "I should be better at    |
|  hope for the best"       |  this by now"             |
| "I do not have time for   | "There is probably a      |
|  that"                    |  better way but I cannot  |
| "It is fine, I guess"     |  justify the time to      |
|  (said with a sigh)       |  find it"                 |
+---------------------------+---------------------------+
|          DOES             |          FEELS            |
|                           |                           |
| Observable actions and    | Emotional states.         |
| behaviors. What you saw   | Frustrations, anxieties,  |
| them do or what they      | desires, motivations.     |
| described doing.          |                           |
|                           |                           |
| Uses 3 different apps     | Frustrated by complexity  |
| to track one thing        |                           |
| Gives up after 5 minutes  | Guilty about              |
| Asks a friend instead     | procrastinating           |
| of searching themselves   | Relieved when it works    |
|                           | Anxious about missing     |
|                           | something important       |
+---------------------------+---------------------------+
```

How to fill it in:
- Go through your interview notes
- Pull direct quotes for SAYS
- Infer thoughts for THINKS (what is between the lines?)
- List actions for DOES (what did they actually do, not what they said they do?)
- Identify emotions for FEELS (look for frustration, relief, anxiety, excitement)

The gap between SAYS and DOES is where the gold is:
- "I always meal prep on Sundays" (SAYS) vs. "Has not meal prepped in 3 months" (DOES)
- That gap tells you: the intention is there but the execution barrier is real

From empathy map to insights:
- **Pain points**: where is the frustration? Where do they give up?
- **Unmet needs**: what are they working around? What hacks do they use?
- **Opportunities**: where can you reduce friction, automate pain, or create delight?

**Creating a user persona from empathy map data:**

```
PERSONA: [Name]
Photo: [Stock photo or illustration, not a real person]
Age: [Range]
Occupation: [Role]
Tech comfort: [Low / Medium / High]

Quote: "[A real quote from your interviews that captures
their attitude]"

Goals:
- [What they are trying to achieve]
- [What success looks like for them]

Frustrations:
- [Specific pain point 1]
- [Specific pain point 2]
- [Specific pain point 3]

Behaviors:
- [How they currently solve the problem]
- [Tools they use]
- [Workarounds they have created]

Needs:
- [What they need but do not have]
- [What would make their life easier]
```

"A persona is not a demographic profile. It is a story about a real person's struggle. If your persona could be replaced by a bullet point list, you did it wrong."

**Where you should be:** You understand how to transform raw interview data into structured empathy maps and personas.

**Watch for this:**
- Remember that THINKS is NOT a copy of SAYS. It requires inference and reading between the lines.
- The SAYS-DOES gap is the highest-value insight. Spend extra time on this concept.
- Personas should feel like someone you could have a conversation with, not a demographic checkbox.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-8-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const notes = [{kind: 'observation', text: 'Used a spreadsheet'}, {kind: 'interpretation', text: 'May need a status view'}, {kind: 'observation', text: 'Checked two tools'}];
const evidence = notes.filter(n => n.kind === 'observation');
check(evidence.length === 2, 'Interpretations are not counted as observations');
console.log('ok: checkpoint-8-1');
```

## Where it breaks

![](diagram:session-8-1/fig2-diagnosis)

### Leading question

You ask "Would you use an app that tracks party loot?" and the person says yes, because you handed them the answer. You learned that they are polite. Ask what they did the last time the problem happened: what they opened, what they typed, where it got annoying, what they did instead. Their verbs are evidence. Your idea, offered first, is not. Write the question down before the conversation and cross out any question that contains your solution. If they bring the solution up themselves, write that down too, and still ask what they do today.

### Friends flatter the idea

Your friends tell you the idea is great, and none of them have the problem. They are encouraging you, which is a different activity from discovering a need. Talk to people who did the task in the last month and can describe a specific afternoon when it went badly. Three of those conversations will contradict a room full of supportive opinions. If you cannot find anyone who has the problem, that is the finding. Write it down. Do not replace them with a more supportive audience.

### Private detail retained

The notes include a name, an employer, a health detail, or a screenshot of their tool, and you did not agree on any of that. You needed the workflow, not their identity. Say what you are collecting before you start, collect the minimum, and store it somewhere you would be willing to show them. When the write-up is done, delete the raw notes you no longer need. A research habit that leaks is a product risk you built before you had a product.

## Your turn

**Guided Practice Exercise 1: Write Your Interview Script**

**Prompt:** Create a 7-question interview script for your capstone idea using Mom Test principles.

**Starter Materials:** Interview script template (provided in Demonstration section above).

**Steps:**
1. Write down your capstone idea in one sentence (do NOT show this to your interviewee later)
2. Identify the broad problem space your idea addresses (NOT the solution)
3. Write 5-7 open-ended questions following The Mom Test rules
4. For each question, write at least one follow-up question
5. Include warm-up and wrap-up sections
6. Trade scripts with a partner and check each question against the Mom Test: does it ask about specifics in the past? Does it avoid leading the witness?

**Success Criteria:**
- At least 5 questions that pass the Mom Test
- Questions focus on the problem, not your solution
- At least 3 questions ask about past behavior ("Tell me about the last time...")
- Follow-up questions dig deeper, not wider
- Warm-up and wrap-up included

**Time:** 30 minutes (20 min writing, 10 min peer review)

**Checkpoints:**
- Checkpoint: you have named the problem, not your solution, and written at least 3 questions
- At 20 minutes: Check that all questions pass the Mom Test and follow-ups are included
- At 25 minutes: Partner review should be underway with active feedback

**BREAK**

**Guided Practice Exercise 2: Mock Interview + Empathy Map**

**Prompt:** Practice interviewing a classmate and build an empathy map from the conversation.

**Starter Materials:** Empathy map template (below).

**Steps:**
1. Pair up with a classmate (or, if working solo, call a friend or family member)
2. Person A interviews Person B for 10 minutes about a topic Person A is researching (use the script from Exercise 1, adapted if needed)
3. Person A takes notes during the interview (shorthand is fine, capture quotes)
4. After the interview, Person A spends 10 minutes filling out an empathy map based on the conversation
5. Swap roles and repeat
6. Share your empathy map with your partner and ask "Does this capture your experience?"

**Empathy Map Template:**

```
EMPATHY MAP
Interviewee: ___________ (first name)
Topic: ___________
Date: ___________

+--------------------------+--------------------------+
|         SAYS             |         THINKS           |
| (direct quotes)          | (inferred thoughts)      |
|                          |                          |
| 1.                       | 1.                       |
| 2.                       | 2.                       |
| 3.                       | 3.                       |
+--------------------------+--------------------------+
|         DOES             |         FEELS            |
| (observable behaviors)   | (emotions)               |
|                          |                          |
| 1.                       | 1.                       |
| 2.                       | 2.                       |
| 3.                       | 3.                       |
+--------------------------+--------------------------+

KEY INSIGHTS:
- Pain point 1:
- Pain point 2:
- Opportunity:
```

**Success Criteria:**
- At least 3 entries in each quadrant
- SAYS quadrant uses actual quotes (not paraphrases)
- THINKS quadrant shows inference, not just repetition of SAYS
- At least 2 pain points and 1 opportunity identified

**Time:** 25 minutes (10 min interview, 10 min empathy map, 5 min share-back)

**Checkpoints:**
- At 10 minutes: First interview should be wrapping up with notes captured
- At 20 minutes: Empathy map should be mostly filled in with entries in all four quadrants
- At 25 minutes: Share-back conversation should validate that the empathy map captures the interviewee's experience

## The quest

**Independent Lab: Interview Script Refinement and Extended Practice**

**Objectives:**
- Finalize your interview script based on in-class feedback
- Conduct an additional practice interview if time permits
- Begin identifying interview subjects for Session 8.4

**Requirements:**
- Finalized interview script with 7 questions, all passing the Mom Test
- Each question has at least one follow-up
- Warm-up and wrap-up sections are polished and natural
- Begin a list of 5-7 people you could interview for your capstone research

**Hints:**
- Read your questions out loud. If they sound robotic, rewrite them in a more conversational tone.
- The best follow-up question is almost always "Tell me more about that" or "What happened next?"
- Your warm-up should make the interviewee feel like they are helping you, not being tested.

**Stretch Goals:**
- Conduct a second practice interview with a different classmate or friend
- Create a second empathy map and compare patterns across both interviews
- Start reading "The Mom Test" by Rob Fitzpatrick (first 3 chapters)

**Submission:** Save your finalized interview script and empathy map. These will feed into the Session 8.4 field work and the unit project.

### Review the artifact

Your deliverable is **An interview guide, anonymized notes, and an evidence-based empathy map**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-8-1/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Units 1-7 (full stack app development, deployment, and testing). Have a rough idea for your capstone project. Be willing to talk to actual human beings (yes, this is required).
**Materials:** Interview script template (provided below), empathy map template (provided below), "The Mom Test" by Rob Fitzpatrick (optional but strongly recommended), note-taking tools (paper/pen or digital)

**Due before Session 8.2:**

1. Finalize your interview script based on in-class feedback (7 questions, Mom Test approved)
2. Identify 5-7 people you could interview for your capstone research (friends, family, social media contacts, Discord community members, anyone who fits your target user profile)
3. Conduct ONE practice interview (15-25 minutes) with someone from your list
4. Write up notes from the practice interview
5. Create an empathy map from the practice interview
6. Write a 3-5 sentence reflection: what question worked best? What would you change for next time?

**Submission:** Google Doc, Notion page, or markdown file in your capstone repo. Must include:
- Finalized interview script
- Practice interview notes (with timestamps and direct quotes)
- Empathy map
- Reflection paragraph

**Estimated Time:** 2-3 hours (1 hour script refinement + recruiting, 30 min interview, 1 hour write-up)

**Stretch Goals (Optional):**
- Read the first 3 chapters of "The Mom Test" by Rob Fitzpatrick (it is short, cheap, and worth every penny)
- Run a second practice interview and compare the empathy maps

---

### Manual verification and further reading

- [Official reference 1](https://www.gov.uk/service-manual/user-research/using-in-depth-interviews)
