---
editorial: true
title: Sprint 2 — Build
subtitle: Feature Completion and Integration
hook: "A feature-complete core journey with integration and recovery evidence. Implement the prioritized user outcomes."
read: 60
artifact: "A feature-complete core journey with integration and recovery evidence"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://react.dev/learn/managing-state
  - https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
say:
  - "Build: Implement the prioritized user outcomes."
  - "Integrate: Connect real boundaries through explicit contracts."
  - "Recover: Handle empty, invalid, pending, and failed states."
---

## The hook

Sprint 1 is behind you. You went from nothing to a working app skeleton in one session. That is power. You have a repo, a database, a server, and a frontend that talks to each other. The foundation is laid. Now we build the house.

Sprint 2 is about feature completion and integration. Every feature in your Must Have list needs to work end to end by the time you leave today. Every form needs to submit. Every API call needs to return. Every page needs to render cleanly on mobile and desktop. This is the session where your product goes from "it kind of works" to "it actually works."

Here is the sprint philosophy for today: if it is not a Must Have feature, do not touch it. Your only job is to make the core product functional. Every CRUD operation, your third-party API integration, responsive design on your key pages, and graceful error handling when things go wrong. By the end of today, someone should be able to use your product and accomplish the core task it was designed for. Let's build.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Create a production-ready full stack web application through iterative sprint-based development
**You will:**
- Initialize a project repository with proper folder structure, environment configuration, version control, and development scripts
- Design and implement database schemas using MongoDB/Mongoose modeling patterns with relationships, indexes, and seed data
- Build an Express backend with routing architecture, middleware stack, authentication scaffolding, and CRUD operations
- Construct a React frontend with component architecture, routing, state management, responsive design, and API integration
- Integrate third-party APIs and external services including payment processing and/or LLM-powered features

**You will be able to:**
- Plan and execute four development sprints using a Kanban board and backlog prioritization
- Scaffold a complete MERN project from scratch with both client and server running concurrently
- Implement full CRUD operations across the entire stack with proper error handling
- Build responsive, polished user interfaces with loading states, empty states, and error feedback
- Integrate at least one external service (Stripe, OpenAI/Claude, Google Maps, etc.) securely

---

**Sprint Review: Show What You Built**

**Key Points:**
- Before you add anything, click through what Sprint 1 actually does
- 1-2 minutes per person, just screen share and show what is working
- Identify blockers: is anyone stuck? Quick troubleshooting.
- Celebrate progress: "You went from nothing to a working app skeleton in one session. That is POWER."

**Sprint 2 Planning**

**Key Points:**
- Review your Kanban board
- What features are left to build?
- Prioritize: what must be done TODAY for the product to be functional?
- Update your board with Sprint 2 tasks
- Set Sprint 2 goals: feature completion and integration

**Common Misconceptions:**
- "I should add more features." No. Finish the features you planned. A complete MVP beats a half-built feature list every time.
- "Responsive design can wait." It cannot. If your app does not work on mobile, your demo will suffer.
- "Error handling is optional." Every unhandled error is a blank white screen in front of your demo audience.

---

![](diagram:session-12-2/fig1-model)

### Feature complete means the user can finish

Review the must-have journey from Sprint 1. A feature is complete when the user can reach it, perform the action, understand the result, and recover from ordinary failure. A route that exists but has no usable interface is not complete for a browser user. A button that updates local state but loses the record on refresh is not complete for a persistence requirement. Use the acceptance criteria to decide what remains.

Work in small integrated slices. After adding an edit operation, run create, read, edit, and refresh together. After adding authentication, repeat those operations as the owner and another user. Integration can break earlier assumptions even when the new feature passes in isolation. Keep the core journey available as a quick smoke test throughout the sprint.

### Make state transitions explicit

For each form or remote action, identify idle, pending, success, and error states. Decide what remains editable while a request is pending and what happens if the user navigates away. Preserve drafts after recoverable errors. Avoid duplicate submissions or define their idempotent behavior. A spinner without a timeout or error transition is an unfinished state machine.

Empty data is not an error. A new account may have no records and still be working correctly. Explain the next action in the empty state. A failed request needs different language and a retry path. Keeping those states distinct helps users and makes tests more precise. It also prevents the interface from displaying an empty list when the server actually rejected the request.

### Integrations need adapters and limits

Keep provider-specific details behind a service boundary. The UI should depend on your application's response shape rather than a large third-party payload. Validate external responses and choose bounded timeouts. Use fixtures for normal, empty, malformed, and unavailable responses. This lets the team finish and test its own behavior even before a manual provider smoke test is available.

Do not let an integration introduce secrets into the client bundle. Review environment variables and network requests. If a provider operation costs money or changes external state, enforce permission and limits on the server. A browser flag is not sufficient. Clearly label sandbox behavior and avoid claiming that a fixture demonstrates a real payment or model call.

### Review the full journey on a narrow screen

Use realistic long titles, missing images, and several records. Test keyboard navigation, visible focus, labels, and error messages. A responsive layout should remain usable with content that differs from the original mockup. Do not postpone every accessibility issue to the polish sprint; some require changes to component structure and state ownership.

At the sprint review, demonstrate the journey without editing the database manually or explaining hidden steps. Keep a list of remaining defects with severity and reproduction steps. Defer optional features before compromising the core outcome. The submission should show that all required capabilities connect, while the next sprint can concentrate on reliability rather than discovering that the product still lacks its main path.

## The demonstration

**Live Coding Walkthrough: Complete CRUD and Error Handling Patterns**

**Setup:** Open a working Express/React project. Have browser DevTools open.

**Steps:**
1. Complete all Create, Read, Update, Delete operations for primary resource
2. Build forms for creating and editing data
3. Implement delete confirmation flows
4. Add comprehensive error handling:

**Backend error handler pattern:**
```javascript
// Express error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Something went wrong',
    }
  });
});
```

**Frontend fetch with error handling pattern:**
```javascript
const [error, setError] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await fetchResources();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

5. Show responsive design implementation:

**Responsive CSS pattern:**
```css
/* Mobile first - base styles for small screens */
.container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

**Where you should be:** You see the pattern for building complete CRUD flows with proper loading, error, and success states, plus responsive layouts.

**Watch for this:**
- Remember that EVERY async operation needs a try/catch or .catch() handler
- Show the difference between a raw error message and a user-friendly one
- Responsive means mobile first: start with the smallest screen, then add breakpoints

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-12-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function transition(state, event) {
  if (event === 'submit' && state === 'idle') return 'pending';
  if (event === 'failure' && state === 'pending') return 'error';
  if (event === 'retry' && state === 'error') return 'pending';
  if (event === 'success' && state === 'pending') return 'saved';
  return state;
}
check(transition('pending', 'submit') === 'pending', 'Duplicate submission does not start another transition');
check(transition(transition('pending', 'failure'), 'retry') === 'pending', 'Failure has a recovery route');
console.log('ok: checkpoint-12-2');
```

## Where it breaks

![](diagram:session-12-2/fig2-diagnosis)

### Features work only separately

Each screen works when you visit it directly, and the path from signup through the paid action fails in the middle. You tested the parts. The product is the journey. After every integration, run the whole path as a new user, in a fresh session, and write down the step that broke. A green unit test for the new route does not mean the button on the previous page points at it. The journey is the test the user will run, so run it first.

### Optimistic UI loses data

The interface shows the edit as saved, the request fails, and the typed paragraph is gone because you threw away the draft when you sent it. Optimism needs a reconciliation. Keep the previous server value, keep the draft, and if the server refuses, put the draft back and show the error. Confirm only when the response says the write landed. A UI that cannot survive its own failure will lose someone's work, which is a worse bug than a slow save.

### Provider dependency blocks progress

The payment or model provider is down, or you do not have a key in this environment, and the whole build stops. Hide the provider behind a small interface and ship a fixture that returns a recorded response. Keep one manual test that hits the real provider when you have the key. The rest of the product should keep moving. A missing third party is a reason to stub that edge. It is not a reason to stop building the path the edge sits on.

## Your turn

Take ten minutes.

**Guided Practice 1: The Full Loop**

**Prompt:** Verify that every CRUD operation works end to end for your primary resource.

**Instructions:**
1. Create a new item through the frontend form
2. Verify it appears in the list/display view
3. Edit the item and verify the changes persist
4. Delete the item and verify it is gone
5. Repeat for each resource type in your app

**Success Criteria:** All CRUD operations work. No console errors. Data persists across page refreshes.
**Time:** 30 minutes

**Checkpoints:**
- At 10 minutes: Create and Read operations work end to end
- At 20 minutes: Update operation works with a form
- At 30 minutes: Delete with confirmation works; all CRUD tested

**Watch for this:** The usual failure here is state that does not update after the API call. Call the setter from `useState`, and compare the response body to the shape you expected.

**Guided Practice 2: Third-Party API Integration**

When CRUD works end to end, move to a third-party API:

**Prompt:** Integrate your chosen external API or service.

**Instructions:**
1. Set up API keys securely (server-side only, never in frontend code)
2. Create a server-side route that calls the third-party API
3. Build the UI components that display API data
4. Add error handling for API failures (what happens when the API is down?)

**Examples:** OpenAI/Claude API, Google Maps, Stripe, SendGrid, Cloudinary, weather APIs

**Success Criteria:** External API data renders in your app. API keys are only on the server. Errors are handled gracefully.
**Time:** 30 minutes

---

## The quest

Take ten minutes.

**Independent Lab: The Responsive Gauntlet and Error Sweep**

**Objectives:**
- Complete frontend-backend integration for all features
- Make the app responsive on mobile, tablet, and desktop
- Handle all error states and edge cases

**Requirements:**
1. Every feature works end to end (create, view, edit, delete across all resources)
2. State management works: components update when data changes
3. Loading states: spinners or skeletons while data loads
4. Navigation works (React Router, protected routes if applicable)
5. Responsive design at four breakpoints:
   - 375px (iPhone SE) - fix any layout breaks
   - 768px (iPad) - adjust grid/flex layouts
   - 1024px (laptop) - ensure content uses space well
   - 1440px (desktop) - no content stretching to infinity
6. Navigation: hamburger menu or collapsible nav for mobile
7. Error handling sweep:
   - Submit a form with empty required fields (helpful message, not crash)
   - Navigate to a URL that does not exist (404 page)
   - Access a protected route without logging in (redirect)
   - Try/catch blocks on all async operations
   - User-friendly error messages (not raw error objects)
   - Empty states (what the user sees when there is no data)
   - Form validation on both frontend and backend

**Hints:**
- Test responsive design in Chrome DevTools device mode
- Priority pages for responsive: landing page, main feature page, forms
- Test by intentionally breaking things: disconnect database, send bad data, throttle to offline

**Stretch Goals:**
- Add search or filter functionality
- Implement pagination for list views
- Add a "dark mode" toggle
- Optimize images (compression, lazy loading)

**Submission:** GitHub repo link, plus a screenshot of your app on mobile and desktop

**End-of-Sprint Review**
- Quick status check: is your core product functional?
- If YES: great, Sprint 3 is about hardening and deploying
- If NO: tonight's homework is to get to functional. Ask for help if stuck.
- Commit and push to GitHub
- Preview Sprint 3: "Tomorrow we test, secure, and deploy. Your app goes live."

### Review the artifact

Your deliverable is **A feature-complete core journey with integration and recovery evidence**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-12-2/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Session 12.1 completed. Core project structure in place (repo, database, server, client). At least one working API endpoint connected to the frontend. Sprint 1 homework finished.
**Materials:** Working capstone repo, third-party API keys/accounts (OpenAI, Stripe, Google Maps, etc.), Chrome DevTools, design reference (mockups or inspiration sites)

**Assignment: Sprint 2 Continuation**
- **Objective:** Arrive at Sprint 3 with a fully functional product. Every feature works. The UI is responsive.
- **Tasks:**
  1. Complete any remaining features from your Must Have list
  2. Ensure responsive design works on mobile, tablet, and desktop
  3. Add loading states for all async operations
  4. Add empty states (what the user sees when there is no data)
  5. Push all work to GitHub
- **Submission:** GitHub repo link, plus a screenshot of your app on mobile and desktop
- **Time Estimate:** 3-4 hours
- **Due:** Before Session 12.3

**Stretch Goals (Optional):**
- Add search or filter functionality
- Implement pagination for list views
- Add a "dark mode" toggle
- Optimize images (compression, lazy loading)

---

### Manual verification and further reading

- [Official reference 1](https://react.dev/learn/managing-state)
- [Official reference 2](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
