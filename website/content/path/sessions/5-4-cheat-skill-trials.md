---
editorial: true
title: Cheat Skill Trials
subtitle: Rebuild a Feature at 10x Speed
hook: "A before-and-after feature rebuild with timing, tests, and a retrospective. Measure a known feature and its acceptance cases."
read: 60
artifact: "A before-and-after feature rebuild with timing, tests, and a retrospective"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://code.claude.com/docs/en/overview
say:
  - "Baseline: Measure a known feature and its acceptance cases."
  - "Rebuild: Use a bounded agent workflow on a separate branch."
  - "Compare: Include review, repairs, and regressions in the result."
---

## The hook

In every isekai, there is a moment where the hero has to prove their power. A trial, a tournament, a boss fight. Today is yours.

You have learned the RTTPOC framework. You have learned advanced prompting techniques. You have set up your agentic tools. Now we find out if the cheat skill is real. The challenge: pick a feature from your Project 2 that you built manually. Rebuild it from scratch using AI tools. Document every prompt. Compare the two versions. This is not about proving AI is better than you. It is about proving that you WITH AI are better than you alone. That is the founder's edge.

You have 90 minutes for the rebuild. Then we compare, reflect, and build your final prompt library. Everything you have learned in this unit comes together right now. RTTPOC. Chain-of-thought. Few-shot. Agentic workflows. Verification discipline. All of it. The clock is ticking. Let us see what your cheat skill can do.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Create Features Using Agentic AI Tools in a Professional Workflow
You will use Claude Code and/or Cursor to execute multi-file, multi-step development tasks on their own codebase, following a pair-programming workflow with proper Git branching, diff review, and iterative refinement.

### Enabling Objectives
- Install and configure Claude Code or Cursor on a real project
- Write effective multi-step instructions for agentic tools that specify task, constraints, and file scope
- Create a Git safety branch before executing any agentic changes
- Review a Git diff line by line, accepting or rejecting individual changes
- Execute an agentic workflow that spans at least 3 files (model, route, component)
- Compare when to use agentic tools, chat-based AI, and manual coding for different task types

### You will be able to
- Set up Claude Code or Cursor and execute a multi-file task on their MERN project
- Build a complete feature using agentic tools with every change reviewed via Git diff
- Document the entire agentic build process including prompts, iterations, and verification
- Articulate when AI tools are appropriate and when manual coding is the better choice

---

**Welcome + The Trial Begins**
- "You have learned the RTTPOC framework. You have learned advanced prompting techniques. You have set up your agentic tools. Now we find out if the cheat skill is real."
- The challenge: pick a feature from your Project 2 that you built manually. Rebuild it from scratch using AI tools. Document every prompt. Compare the two versions.
- "This is not about proving AI is better than you. It is about proving that you WITH AI are better than you alone. That is the founder's edge."
- Set expectations: "You have 90 minutes for the rebuild. Then we compare, reflect, and build your final prompt library."

**How to Plan an AI-Assisted Build**

Before you start prompting, plan:
- What feature are you rebuilding?
- What files does it touch? (Model, routes, components, styles)
- What is the expected behavior? (Be specific. Write it down.)
- What are the edge cases? (List at least 3.)
- What is your prompt chain? (Map out the sequence of prompts before you start.)

**The Feature Selection Criteria:**
- Pick something substantial (not a single function, but a full feature with backend + frontend)
- Pick something you understand deeply (you need to verify the AI's output)
- Pick something that took you meaningful time to build originally
- Good choices: auth flow, CRUD for a specific resource, a form with validation, a dashboard page, a search feature

**Live planning demo:**
- Choose a feature (e.g., "Post creation with validation, tagging, and the creation form")
- Map out the files involved: `Post.js` (model), `posts.js` (routes), `PostForm.jsx` (component), `PostList.jsx` (display)
- Write the expected behavior: "User fills out title, content, and tags. Validation prevents submission if title is empty or content exceeds 5000 characters. Tags are limited to 5. On success, redirect to the post detail page."
- Map the prompt chain:
  1. Schema + model
  2. Backend routes with validation
  3. Frontend form component
  4. Frontend display component
  5. Error handling and edge cases
  6. Integration test of the flow
- "See how planning BEFORE prompting makes the whole thing smoother? You are not discovering what you need on the fly. You know exactly what to ask for."

**Quality tracking template:**
For each prompt in your chain, record:
- The RTTPOC prompt (full text)
- The output (or summary of the output)
- Iterations needed (how many rounds to get it right)
- Verification results (what you checked, what you caught)
- Time spent on this prompt (stopwatch it)

**Feature Selection and Planning**

Pick the feature and write out:
- The feature description (2-3 sentences)
- The files it touches
- The prompt chain plan (sequence of prompts they will use)
- The expected behavior checklist (what "done" looks like)

Say the feature out loud in one sentence before you start.

- **Key Points:**
  - Planning before prompting produces faster, higher-quality results
  - Feature selection matters: choose something with enough scope to demonstrate the full workflow
  - A prompt chain map eliminates the "what do I ask next?" problem
  - Time tracking provides real data for the speed comparison

- **Common Misconceptions:**
  - "I should just start prompting and figure it out as I go." Planning the prompt chain in advance is significantly faster than improvising.
  - "The simplest feature will be the best demo." Too simple and you will not learn anything. Pick something with real complexity.
  - "AI will handle the edge cases automatically." You need to explicitly plan for edge cases in your prompts and verification.

![](diagram:session-5-4/fig1-model)

### Define the experiment before the timer starts

Choose a feature you have already implemented, such as filtering quests or editing a profile. Write the behavior contract before rebuilding it. Include the normal path, an invalid input, an empty result, and a failure state. Freeze the starting revision and use a separate branch or working copy so the baseline remains available. The experiment is about the workflow, not about proving a predetermined speedup.

Measure elapsed time in categories: preparation, implementation, review, testing, and repair. Keep waiting time visible. If you reuse an existing design or test suite, disclose that advantage. If the rebuilt version has fewer features, do not compare it as though the scope were identical. “10x” is the theme of the trial, not a guaranteed outcome or a required conclusion.

### Build an evidence table

For each acceptance case, record baseline behavior, rebuilt behavior, and the evidence used to judge it. A screenshot can demonstrate layout but cannot prove server authorization. A passing unit test can demonstrate a calculation but cannot prove a deployed route exists. Match evidence to the claim. Where the environment lacks a service or toolchain, write the manual command and expected result and mark the check pending.

Include at least one adversarial review question. What happens if the request resolves after the component unmounts? What happens if the same action runs twice? What happens when a field is absent? Choose questions that fit your feature rather than a generic security checklist. The purpose is to expose assumptions that a polished happy path can hide.

### Review the maintenance cost

Read the rebuilt implementation without the chat history. Can you identify the entry point, data transformation, side effect, and error boundary? If understanding requires reconstructing a long conversation, improve the code or its local documentation. Comments should explain decisions and constraints, not narrate every assignment. Remove dead code and speculative abstractions that the feature does not use.

Ask the assistant to explain a difficult section, then verify that explanation against the code. An incorrect explanation is useful evidence: it reveals where your review must be stronger. You remain responsible for the behavior you accept. Keep a short decision log showing which suggestions you accepted, rejected, or changed and why.

### Turn the result into a reusable practice

The retrospective should identify one prompt improvement, one verification improvement, and one task type where assistance was less effective. A slower result can still teach a valuable boundary. Perhaps the feature was too small for setup overhead, or the repository context was incomplete, or the acceptance criteria changed halfway through. Preserve those facts rather than rewriting the story into a victory narrative.

Submit both revisions, the task brief, the evaluation table, and the final diff. The strongest demonstration is a reviewer reproducing your result from the recorded steps. That shows a repeatable engineering process rather than a lucky interaction with a model.

## The demonstration

The demonstration is the trial. Run the prompt chain on a clock, and keep the log.

**THE TRIAL: Part 1 - Schema and Backend**

Run the first half of your prompt chain: schema, model, routes.
- Use your own tools
- If the tool output is wrong, fix the prompt before you accept the file
- Write every prompt and every output into the prompt chain log
- **Timer.** This is a timed trial.
- "Remember: verify at each step. Run the server, test the routes, check the schema. Do not move to the frontend until the backend is solid."

**Prompt Chain Log Template:**
```markdown
## Prompt [number]
**Time started:** [timestamp]
**Tool used:** [Claude Code / Cursor / Chat]

**RTTPOC Prompt:**
[Full text of your prompt]

**Output summary:**
[What the AI generated, key files changed]

**Iterations needed:** [number]
**Iteration notes:** [What you had to fix or re-prompt]

**Verification:**
- [ ] Runs without errors
- [ ] Does what I asked
- [ ] Imports are real
- [ ] Methods exist
- [ ] No security issues
- [ ] Matches my code style

**Time completed:** [timestamp]
```

**Quick check-in at the break:** "Hands up if your backend is working. Hands up if you caught a hallucination. Hands up if you had to iterate more than 3 times on a prompt."

**THE TRIAL: Part 2 - Frontend and Integration**

Run the second half: frontend components, the connection to the backend, and error handling.
- Continue documenting every prompt
- Test the full feature: does the form submit? Does data appear? Do errors display correctly?
- People who finish early: add edge case handling, improve UX, or write tests
- "You are not done when it works. You are done when it works AND you have verified every line AND you have documented every prompt."

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-5-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const baselineMinutes = 90;
const assisted = {prepare: 8, implement: 12, review: 15, test: 10, repair: 5};
const total = Object.values(assisted).reduce((sum, n) => sum + n, 0);
check(total === 50, 'Include the entire workflow');
check(baselineMinutes / total === 1.8, 'Measured speedup is 1.8x, not a promised 10x');
console.log('ok: checkpoint-5-4');
```

## Where it breaks

![](diagram:session-5-4/fig2-diagnosis)

### Unfair speed comparison

The assisted attempt finishes in twenty minutes and the unassisted one was a different, larger task, so the comparison proves nothing. Hold the scope still. Same acceptance criteria, same starting repo, same definition of done, including tests and a read-through you can explain. Then compare. Speed without the same finish line is a story about typing. The number you want is how long it took to reach an outcome you would actually ship.

### Lost understanding

The feature works and you cannot say why the boundary moved. Close the assistant and explain the change: what used to happen, what happens now, which function owns it, what you would delete if the requirement reversed. If you cannot, you do not have the change yet. You have a demo. Read the diff until the explanation is yours, or rewrite that part yourself. The point of the trial is that you remain the person who can maintain it.

### Demo-only success

The happy path clicks through on your machine, and the cases that failed this morning were never run again. A demo is one input. Re-run the original failure, the empty input, the unauthorized user, and the step you claimed would survive a deploy. Write down which of those you actually did. "It worked when I presented it" is the weakest evidence in this unit. The trial is over when the old breaks stay fixed, not when the scripted click succeeds.

## Your turn

**Guided Practice: Comparison and Reflection**

**Individual Reflection:**

Answer these in the prompt chain doc:
1. How long did the rebuild take? How long did the original take?
2. What was the speed multiplier? (e.g., 3x faster, 10x faster, same speed)
3. Is the AI-assisted version higher or lower quality than the original? Why?
4. What was the AI great at? (List at least 3 things)
5. What did the AI struggle with? (List at least 3 things)
6. What would you do differently next time?
7. Could you have done this in Unit 1, before you understood the fundamentals? Why or why not?

**Comparison Document Template:**
```markdown
## Comparison
**Original build time:** [estimate from when you first built it]
**AI-assisted rebuild time:** [actual time today]
**Speed multiplier:** [X times faster/slower]
**Quality comparison:** [higher/lower/same, with explanation]
**Best AI moment:** [describe]
**Worst AI moment:** [describe]
```

**Group Discussion:**
- Share speed multipliers. What was the fastest? The slowest?
- What were the most common AI struggles?
- What were the most common verification catches?
- Key question: "Does this change how you think about learning fundamentals?"
- Expected answer: "No. The fundamentals are what make the AI useful. Without them, you cannot verify, you cannot iterate, and you cannot debug."

**Success Criteria:**
- Feature is rebuilt and functional (or clearly close)
- At least 4 prompts are documented with full RTTPOC format
- At least one iteration/correction is documented
- Verification checklist is filled out for each prompt
- Comparison section is completed with honest assessment
- All code changes are committed on the trial branch

**Time:** 30 minutes (20 min reflection + 10 min group discussion)

**Checkpoints:**
- At 5 minutes: Individual reflection started
- At 15 minutes: Comparison document filled out
- At 20 minutes: Group discussion begins
- At 30 minutes: Key insights shared

## The quest

**Independent Lab: Personal Prompt Library v2**

*The Spellbook Mastery Trial: compile your ultimate collection of tested, battle-proven prompt templates.*

**Objectives:**
- Build a comprehensive, organized, tested prompt library from everything learned this unit
- Include the best prompts from the trial as proven templates
- Create a resource that is genuinely useful going forward

**Requirements:**
1. Create or update `docs/prompt-library-v2.md` in your Project 2 repo.

2. Organize your prompt library into these sections:
   ```markdown
   # My Prompt Library

   ## Debugging Templates
   [At least 2 templates]

   ## Code Generation Templates
   [At least 2 templates]

   ## Code Review Templates
   [At least 1 template]

   ## Refactoring Templates
   [At least 1 template]

   ## Learning/Explanation Templates
   [At least 1 template]

   ## Prompt Chain Recipes
   [At least 1 multi-prompt recipe]

   ## My Best Prompts From the Trial
   [At least 2 prompts that worked exceptionally well today]

   ## Lessons Learned
   [What works, what does not, personal notes]
   ```

3. Each template must include:
   - Full RTTPOC structure with `[placeholder]` brackets
   - One real example (filled in)
   - Notes on when to use this template
   - Any tips or warnings based on your experience

4. Include at least 10 templates total across all sections.

**Hints:**
- Start by copying your best templates from prompt-library.md (v1) and upgrading them
- Look through your trial prompt chain log for the prompts that worked best
- Include "anti-patterns" in your Lessons Learned section: prompts that did NOT work and why
- Organize by workflow stage: discovery, building, debugging, reviewing, refactoring

**Stretch Goals:**
- Include 15+ templates with advanced techniques (chain-of-thought, few-shot, prompt chaining)
- Write a "Quick Start Guide" section at the top for someone who has never seen your library
- Include screenshots of especially good or bad AI outputs
- Share your library with a classmate and get feedback

**Submission:** Push `docs/prompt-library-v2.md` to your Project 2 repo. This will be included in the mini project submission.

### Review the artifact

Your deliverable is **A before-and-after feature rebuild with timing, tests, and a retrospective**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

### Unit project: completion contract

### "The Cheat Skill Certification Trial" -- Ship a Feature End-to-End Using Agentic Tools

### Quest Arc

The Adventurer's Guild has heard rumors of your newly awakened cheat skill. Any fool can claim to have power. The Guild requires proof. Your trial: select a feature from your existing MERN fortress, tear it down to the foundation, and rebuild it using your summoned familiars and enchanted prompt chains. But the Guild does not just want a working feature. They want the spellbook. Every incantation documented. Every iteration recorded. Every hallucination caught and corrected. Only those who can demonstrate mastery of the craft, not just the tools, earn the Cheat Skill Certification.

You will build (or rebuild) a complete feature for your Project 2 MERN app using AI-assisted development tools. The deliverable is two things: the shipped feature AND a detailed prompt log documenting your entire process. This is not just about making something work. It is about demonstrating mastery of the RTTPOC framework, agentic workflows, and the verification discipline you learned this unit.

### Technical Requirements

**Must Have (Required for passing)**

1. **A working feature** added to or rebuilt in your Project 2 app:
   - Must include both backend (model/route) and frontend (component) changes
   - Must include input validation (at least on the backend)
   - Must include error handling (user sees a helpful error, not a crash)
   - Must be deployed to your existing deployment or runnable locally with clear instructions

2. **A prompt chain log** (`docs/mini-project-prompt-log.md`):
   - At least 6 documented RTTPOC prompts
   - Each prompt includes the full RTTPOC text, the output summary, iterations needed, and verification results
   - Includes a "Comparison" section: AI-assisted time vs. estimated manual time
   - Includes a "Reflection" section (see required reflection questions below)

3. **A working prompt library** (`docs/prompt-library-v2.md`):
   - At least 10 organized, tested prompt templates
   - Templates use RTTPOC structure with placeholders
   - Each template has at least one real example

4. **Git history** showing the AI-assisted workflow:
   - Work done on a feature branch
   - Meaningful commit messages
   - Clean, reviewable diff

**Should Have (Expected for strong submissions)**

5. At least one hallucination or error caught and documented in the prompt log, showing what went wrong and how you fixed it

6. At least one chain-of-thought or few-shot prompt used in the prompt chain

7. A `.cursorrules` or `CLAUDE.md` file in your project root with your project conventions

8. The feature is tested manually (at minimum) with notes on what you tested

**Could Have (Stretch goals for outstanding submissions)**

9. Automated tests for the feature (unit or integration) written with AI assistance

10. Comparison of two AI tools on the same task (e.g., Claude Code vs. Cursor), with notes on which was better and why

11. A video walkthrough (3-5 min) showing your feature and explaining your prompt chain

12. The prompt library includes a "Prompt Chain Recipe" someone else could follow to build a similar feature

### Required Reflection Questions

Answer these in your `docs/mini-project-prompt-log.md` under a "Reflection" heading:

1. What was the total time to build this feature with AI tools? How long do you estimate it would have taken manually?
2. What was the single best prompt you wrote during this project? Why did it work so well?
3. What was the single worst AI output you received? What went wrong, and how did you fix it?
4. Name three things AI is genuinely great at for your workflow.
5. Name three things where you are better off coding manually.
6. Could you have done this project in Week 1, before learning the fundamentals? Explain your answer in 2-3 sentences.
7. How will you use AI tools going forward in this program? What is your personal strategy?

### Submission Instructions

1. Push all code changes to a feature branch on your Project 2 GitHub repo
2. Ensure the following files are in your repo:
   - `docs/mini-project-prompt-log.md` (prompt chain log)
   - `docs/prompt-library-v2.md` (prompt library)
   - `.cursorrules` or `CLAUDE.md` (project conventions file)
3. Submit via the class submission form:
   - Link to your GitHub branch
   - Link to the prompt log file specifically
   - One sentence: "The feature I built was [X]"
4. Be prepared to walk through your prompt chain in the next session's review

### Skill Points Rubric

**Boss Clear Criteria (70 pts)**

| Criteria | Points | Requirements |
|----------|--------|--------------|
| Working Feature | 15 | Feature functions correctly with backend + frontend, includes validation and error handling |
| Prompt Chain Log | 15 | At least 6 documented RTTPOC prompts with output summaries, iterations, and verification results |
| RTTPOC Usage | 10 | Every prompt uses all 6 components with specific, tailored content |
| Verification Discipline | 10 | Every output verified with checklist, at least one hallucination catch documented |
| Prompt Library | 10 | At least 10 organized templates with RTTPOC structure, real examples, and usage notes |
| Code Quality | 5 | Clean, well-structured, follows project conventions, no leftover AI artifacts |
| Git Workflow | 5 | Feature branch, meaningful commits, reviewable history |

**Epic Loot (20 pts)**

| Criteria | Points | Requirements |
|----------|--------|--------------|
| Reflection Quality | 8 | Deep, specific insights about AI strengths/weaknesses with evidence from the build |
| Advanced Techniques | 6 | At least one chain-of-thought or few-shot prompt used effectively |
| Project Config | 3 | `.cursorrules` or `CLAUDE.md` file present with project conventions |
| Manual Testing | 3 | Feature tested with documented test scenarios and results |

**Legendary Status (10 pts)**

| Criteria | Points | Requirements |
|----------|--------|--------------|
| Automated Tests | 3 | Unit or integration tests written with AI assistance |
| Tool Comparison | 3 | Documented comparison of two AI tools on the same task |
| Prompt Chain Recipe | 2 | Reusable recipe someone else could follow |
| Video Walkthrough | 2 | 3-5 min video explaining the feature and prompt chain |

**Grading Scale:**
- 90-100: Legendary (Outstanding)
- 75-89: Epic (Strong)
- 60-74: Boss Clear (Adequate)
- Below 60: Needs revision and resubmission

---

![](diagram:session-5-4/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Homework 5.3 (build a feature with agentic tools). Have your Project 2 MERN app ready with at least one agentic tool configured. Identify a feature you originally built manually that you want to rebuild with AI. Have your prompt library from previous homework available.
**Materials:** Terminal with Claude Code and/or Cursor installed, Project 2 MERN app in Git repo, prompt library from previous assignments, stopwatch or timer

**Assignment: Complete the Unit 5 Mini Project (see Unit Project below)**

**Due:** Before Session 6.1

**Tasks:** See the Unit Project specification below. This is the primary homework for Session 5.4.

**Additional task:** Finalize your prompt library and push it to your Project 2 repo. This is a living document you will use for the rest of the program.

---

### Manual verification and further reading

- [Official reference 1](https://code.claude.com/docs/en/overview)
