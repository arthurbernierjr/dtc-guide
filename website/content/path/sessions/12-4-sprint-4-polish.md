---
editorial: true
title: Sprint 4 — Polish
subtitle: Final Touches and Presentation Prep
hook: "A polished release, timed demo script, and tested presentation fallback. Fix friction in the core user journey."
read: 60
artifact: "A polished release, timed demo script, and tested presentation fallback"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.w3.org/WAI/tutorials/forms/labels/
  - https://www.w3.org/WAI/tutorials/page-structure/
say:
  - "Polish: Fix friction in the core user journey."
  - "Rehearse: Tell the problem, show the product, explain the decision."
  - "Fallback: Prepare honest evidence for a network or service failure."
---

## The hook

Your app is deployed. It is tested. It is secured. Anyone on Earth can open a browser and use your product right now. Let that sink in. You built something real. You deployed it to the internet. You are already in the top 1% of people who say they want to build something.

Sprint 4 is your final build session. This is not about adding new features. This is about making what you have shine. Bug fixes. Edge cases. UI polish. Loading states. Favicon. Page titles. All the little details that separate "a project" from "a product." And then, in the second half, we shift gears entirely. We practice your demo. You are going to rehearse your 5-minute presentation, get feedback from a partner, adjust your flow, and record a Loom video that serves as both a backup for demo day and a portfolio artifact you can share forever.

Tomorrow is Coronation Day. The Final Boss fight. You did not come this far to only come this far. Let's make sure you are ready.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Apply professional presentation skills to deliver a compelling live product demonstration
**You will:**
- Structure a 5-minute live demo with a clear narrative arc covering problem, solution, features, tech stack, and call to action
- Rehearse the demo with peers, incorporate feedback, and develop contingency plans for technical failures
- Record a professional demo video as both a backup and a portfolio artifact
- Finalize a pitch deck and README documentation for presentation and review

**You will be able to:**
- Deliver a polished, confident 5-minute live product demo to an audience of peers
- Answer impromptu questions about product decisions, technical architecture, and future plans
- Recover gracefully from technical failures during a live demonstration
- Produce a portfolio-ready demo video, pitch deck, and comprehensive README

---

**Sprint Review: Show Your Deployed App**

**Key Points:**
- Open the deployed URL yourself, in a fresh window
- Quick round: "My app is live at [URL] and here is what it does"
- Identify any deployment issues (fix them FIRST before anything else)
- Celebrate: "You have a deployed product on the internet."

**Sprint 4 Planning**

**Key Points:**
- Today is about polish and presentation
- Two tracks: first half = fix and polish, second half = rehearse and record
- Identify your top 3 bugs or UI issues to fix
- Update your Kanban board one last time

**Bug Fix Priority Matrix:**
- Fix immediately: anything that crashes the app or blocks the core user flow
- Fix today: visual issues on the pages you will demo live
- Fix if time allows: edge cases that only happen with unusual input
- Skip for now: "nice to have" features that are not in MVP

---

![](diagram:session-12-4/fig1-model)

### Polish removes friction from the outcome

Walk through the core journey as a first-time visitor. Can you identify the product's purpose, find the primary action, understand a form, and recover from an error? Fix confusing labels, missing feedback, inconsistent spacing, and broken navigation in that order of impact. A new animation is less valuable than a clear save confirmation when the user currently cannot tell whether their work persisted.

Use realistic content and accessibility checks. Long titles should wrap, empty states should offer a next action, and errors should identify the relevant field. Test keyboard focus and narrow screens. Respect reduced-motion preferences. The polish sprint is a chance to improve the experience, but it should not be the first time you discover structural accessibility problems.

### Build the demo around one story

Introduce the user and the problem in a few sentences. Show the core workflow using a prepared synthetic account and known records. Explain the outcome before discussing the stack. The audience needs to understand why the product matters before it can appreciate an implementation choice. Choose one technical decision worth explaining and connect it to a visible benefit or risk.

Time the presentation aloud. A script that fits on a page can still take too long when you include loading, transitions, and audience reaction. Remove secondary features before rushing the main story. Keep a clear ending: what works, what you learned, and what comes next. Do not imply that a classroom prototype has operational guarantees you have not established.

### Prepare the environment deliberately

Reset the synthetic demo data and verify the account immediately before rehearsal. Confirm the deployed revision, network connection, and external-service mode. Close unrelated tabs and notifications that could reveal private information. Keep secrets out of the terminal and provider dashboard views you intend to show. A public demo should use purpose-made fixtures, not a real user's records.

Have a fallback that demonstrates the same outcome. A short recording, screenshots, or a local fixture mode can preserve the explanation during a network outage. Label it honestly when used. A recording is evidence of a prior run, not proof that the live service is currently available. Practice switching to the fallback so an interruption does not consume the entire presentation.

### Rehearse questions as well as clicks

Ask a peer to challenge the architecture, security boundary, and next milestone. Answer from the implementation and evidence. If you do not know, state the uncertainty and how you would investigate it. Avoid inventing scale numbers or claiming a model is always correct. The ability to explain limits is part of professional judgment.

Finish with a release checklist and a demo checklist kept separate. The release checklist concerns product behavior and operations. The demo checklist concerns fixtures, timing, narrative, and fallback. Passing one does not imply passing the other. The artifact includes the polished candidate, timed script, rehearsal notes, and fallback evidence, all tied to the same known revision.

## The demonstration

**Live Coding Walkthrough: Bug Fixing and UI Polish Patterns**

**Setup:** Open a deployed app in an incognito browser window. Have DevTools open.

**Steps:**
1. Walk through systematic bug hunting:
   - What happens with very long text input?
   - What happens if a user double-clicks a submit button?
   - What happens with special characters in input?
   - What happens on a slow connection?
   - What happens if the user is not logged in and tries to access a protected page?
2. Demonstrate UI polish techniques:
   - Adding a loading spinner for async operations
   - Adding an empty state message ("No items yet. Create your first one!")
   - Adding a success toast or confirmation after actions
   - Setting favicon and page title
   - Adding a custom 404 page
3. Show the 5-minute demo structure:
```
[0:00] "Hi, I'm [name], and I built [product name]."
[0:15] "The problem is [problem statement]."
[0:30] "Here's how [product name] solves it." [START SCREEN SHARE]
[0:45] [Show the core user flow - the ONE thing your app does best]
[1:30] [Feature 1 walkthrough]
[2:30] [Feature 2 walkthrough]
[3:30] "Under the hood, this is built with [tech stack - keep it brief]."
[4:00] "What's next: [future plans / call to action]."
[4:30] "You can try it right now at [URL]. Thanks!"
[5:00] [END - Q&A begins]
```

**Where you should be:** You understand the specific polish items to fix and the exact structure for their demo.

**Watch for this:**
- Ask someone else to use the app and report what broke. Fresh eyes catch what you have stopped seeing.
- Remember that the demo should show fewer features done well, not many features rushed. Less is more.
- Write the opening line and say it out loud before you touch the slides.

Take ten minutes.

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-12-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const demo = [{section: 'problem', seconds: 45}, {section: 'journey', seconds: 150}, {section: 'decision', seconds: 45}, {section: 'next', seconds: 30}];
const total = demo.reduce((sum, part) => sum + part.seconds, 0);
check(total === 270, 'Four-and-a-half minute rehearsal');
check(total <= 300, 'Leave room inside a five-minute slot');
console.log('ok: checkpoint-12-4');
```

## Where it breaks

![](diagram:session-12-4/fig2-diagnosis)

### Cosmetics hide core defects

The spacing is perfect and the save still fails when the title is empty. Polish on a broken path makes the broken path look intentional, so you stop noticing it. Fix the blocking behavior first: the error, the dead end, the wrong total. Then spend the time on type, spacing, and motion. A reviewer can forgive a plain screen that works. They cannot use a beautiful screen that loses the record. Decoration is what you do after the path survives its own edge cases.

### Demo relies on live randomness

The demo creates a brand-new record with a random name, the network stalls, and you are standing in front of a spinner you did not rehearse. Use a prepared scenario: a known account, a known record, a fixture you can reset. Randomness and a live third party are ways for the demo to invent a new bug at the worst minute. If you want to show a live call, show it after the scripted path has already landed, and have the backup ready before you start.

### Backup presented as live

The live call fails, you switch to the recording, and you keep narrating it as if it were happening now. Say what it is. A recording, a fixture, a staging environment. The audience can respect a fallback. They cannot un-hear a claim that the click they just saw was live. Label the evidence in the sentence before you press play. The recovery is the professional part. The mislabel is the part that undoes the trust.

## Your turn

**Guided Practice 1: The Bug Hunt**

**Prompt:** Find and fix at least 3 bugs or UI issues in your deployed app.

**Instructions:**
1. Open your deployed app in an incognito window
2. Go through every page and every feature as if you are a new user
3. Write down every issue you find (broken layout, missing validation, unclear text, etc.)
4. Fix the top 3 most impactful issues
5. Have a classmate verify the fixes

**Success Criteria:** At least 3 issues identified and fixed. Classmate confirms fixes work.
**Time:** 25 minutes

**Checkpoints:**
- At 10 minutes: issues list created with at least 3 items
- At 20 minutes: at least 2 fixes implemented
- At 25 minutes: fixes deployed and verified by a classmate

**Guided Practice 2: The Polish Pass**

**Prompt:** Add professional-level UI polish to your app.

**Instructions:**
1. Add a loading spinner or skeleton for at least one async operation
2. Add an empty state message for at least one list/collection view
3. Add a success toast or message after a create/update/delete operation
4. Add a custom 404 page
5. Set the favicon and page title

**Success Criteria:** App feels polished. No raw loading states or empty screens.
**Time:** 25 minutes

**Guided Practice 3: Documentation and README**

**Prompt:** Finalize your project documentation.

**Instructions:**
1. Update README.md with:
   - Project name and description
   - Screenshot or GIF of the app
   - Tech stack list
   - Setup instructions (how to run locally)
   - Environment variables needed
   - API documentation (if applicable)
   - Live demo link
   - Author information
2. Finalize your pitch deck from Unit 11
3. Make any last updates based on what you actually built (vs what you planned)

**Success Criteria:** README is comprehensive. Pitch deck reflects the actual product.
**Time:** 20 minutes

---

## The quest

**Independent Lab: The Dress Rehearsal**

**Objectives:**
- Structure and practice your 5-minute live demo
- Get feedback from a peer and refine your presentation
- Record a Loom demo video as a backup and portfolio artifact

**Requirements:**
1. Write your opening line and the one user flow you will demo live
2. Structure your demo using the 5-minute format:
   - 0:00-0:30: Who you are and what the problem is (the hook)
   - 0:30-1:30: Show the product (live demo of the core flow)
   - 1:30-3:30: Walk through key features (2-3 features max)
   - 3:30-4:30: Tech stack and architecture overview (brief)
   - 4:30-5:00: What is next / call to action
3. Pair up with a classmate and deliver your full 5-minute demo + 2-minute Q&A
4. Receive feedback:
   - Was the problem clear?
   - Did the demo flow smoothly?
   - Was anything confusing?
   - Did anything break?
5. Adjust your demo based on feedback
6. Record a Loom (or similar) video of your demo (under 5 minutes)
7. Share the Loom link in the class channel
8. Do one final run-through of your demo on the deployed version
9. Redeploy with all latest changes

**Hints:**
- Have a backup plan. Know what to do if something breaks during the live demo. ("Let me show you this other feature while that loads...")
- Speak slowly and clearly. Nervousness makes people speed up.
- Close all unnecessary tabs and notifications before recording.
- The Loom video serves triple duty: backup if live demo breaks, portfolio artifact, and practice run.

**Stretch Goals:**
- Add analytics (basic page view tracking)
- Create a landing page for your product (separate from the app itself)
- Write a blog post about what you built and what you learned
- Post about your project on social media (X/Twitter, LinkedIn)

**Submission:** Come to Session 12.5 ready to present. Loom video link shared.

**Final Deployment Check**
- Redeploy with all latest changes
- Verify the deployed version has all fixes and polish
- Do one final run-through of your demo on the deployed version
- Commit and push everything
- "Tomorrow is Coronation Day. You did not come this far to only come this far. See you at the arena."

### Review the artifact

Your deliverable is **A polished release, timed demo script, and tested presentation fallback**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-12-4/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Sessions 12.1-12.3 completed. App deployed and accessible via URL. Tests passing. Security measures implemented. Pitch deck draft from Unit 11 ready. Sprint 3 homework finished.
**Materials:** Deployed capstone app, pitch deck (Google Slides or PowerPoint), Loom account (or similar screen recording tool), timer for demo practice, notepad for feedback

**Assignment: Final Preparations**
- **Objective:** Be 100% ready for Coronation Day.
- **Tasks:**
  1. Do one final test of your deployed app (every feature, every page)
  2. Review your pitch deck one more time
  3. Practice your demo out loud at least twice (time yourself)
  4. Make sure your Loom video is recorded and the link works
  5. Get a good night's sleep
- **Submission:** Come to Session 12.5 ready to present
- **Time Estimate:** 1-2 hours
- **Due:** Before Session 12.5

**Stretch Goals (Optional):**
- Add analytics (basic page view tracking)
- Create a landing page for your product (separate from the app itself)
- Write a blog post about what you built and what you learned
- Post about your project on social media (X/Twitter, LinkedIn)

---

### Manual verification and further reading

- [Official reference 1](https://www.w3.org/WAI/tutorials/forms/labels/)
- [Official reference 2](https://www.w3.org/WAI/tutorials/page-structure/)
