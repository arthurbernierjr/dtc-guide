---
editorial: true
title: Sprint 1 — Foundation
subtitle: Core Features and Architecture
hook: "A capstone foundation with one complete vertical slice and an architecture record. Choose one user and one valuable journey."
read: 60
artifact: "A capstone foundation with one complete vertical slice and an architecture record"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.typescriptlang.org/docs/handbook/
  - https://react.dev/learn/thinking-in-react
say:
  - "Scope: Choose one user and one valuable journey."
  - "Foundation: Connect client, server, and persistence."
  - "Proof: Demonstrate the slice with a reproducible fixture."
---

## The hook

This is it. The final arc. The last five sessions of your 18-week isekai journey from "what is a terminal?" to "here is my deployed, tested, secured, revenue-ready product and here is the pitch deck to fund it." Everything you have learned, every skill you have leveled up, every late night debugging session, every moment you wanted to quit but did not. It all converges here.

You know that moment in every great anime when the protagonist walks into the final arena? The music swells. The crowd goes quiet. Every ally they have made along the way is watching. Every technique they have learned is about to be tested in one climactic battle. Naruto vs. Pain. Deku vs. Shigaraki. Goku vs. Frieza. Luffy vs. Kaido. This is YOUR version of that moment. You are walking into the arena. And the Final Boss? It is a live demo in front of real people. But unlike those anime characters, you are not fighting alone, and you already have every weapon you need.

Unit 12 is not a lecture unit. It is a build unit. Four sprint sessions where you construct your capstone product from the ground up, using every single tool in your arsenal. Then one final session, the Coronation, where you stand up in front of your peers and show the world what you built. A live demo. A real pitch. A launched product. You came into this program as a civilian. You leave as a builder, a founder, and someone who can ship software. Let's go build something legendary. Let's finish this.

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

**Capstone Kickoff: This Is Real**

Welcome to the final unit. This is the culmination.

**Key Points:**
- Review the capstone requirements: deployed, tested, secured, presented
- Set expectations: four build sprints, then demo day
- Announce the demo day format: 5-minute demo + 2-minute Q&A
- Say what you are building, in one sentence, before you open the editor
- Isekai moment: "You have spent the whole series leveling up. Now you walk into the final dungeon. The difference? You are ready."

**Sprint Planning: Review Your Product Spec**

**Key Points:**
- Pull up your product spec from Unit 8
- Identify your MVP features (Must Have vs Should Have vs Could Have)
- Create a sprint backlog for Sprint 1 (what MUST be done today)
- Set up a simple Kanban board (GitHub Projects, Trello, or even sticky notes)
- Prioritize ruthlessly: what is the smallest version of this product that works?

**Sprint Planning Tips:**
- Start with your Unit 8 product spec. Do NOT redesign your product now.
- Focus on Must Have features only during Sprint 1 and 2. Should Have comes in Sprint 3/4.
- If a feature takes more than 2 hours and is not core, cut it. Ship the MVP.
- Use AI tools for boilerplate, not for architecture decisions. You decide what to build, AI helps you build it faster.

**Two planning artifacts before you write code (30 minutes, not 3 days):**
- **Wireframes:** Rough sketches of your main screens — boxes and labels on paper or in a free tool like Excalidraw. Wireframes force decisions ("wait, where does the user see their history?") while changes still cost seconds instead of hours. One sketch per major page is enough.
- **An Entity-Relationship Diagram (ERD):** A boxes-and-arrows sketch of your data models and how they relate: `User —owns→ Project —contains→ Task`. Every arrow becomes a Mongoose reference or embedded document, and drawing it now surfaces the awkward questions ("can a task belong to two projects?") before they become schema rewrites. Ten minutes on an ERD saves days of refactoring.
- Keep both in your repo (a `/docs` folder or photos in the README). They double as demo-day assets: planning artifacts signal professionalism to interviewers and investors alike.
- Organize your Kanban board into three lists at minimum: **Icebox** (someday ideas — banished so they stop tempting you), **Current/MVP** (this sprint), **Completed** (your growing trophy shelf).

**Common Misconceptions:**
- "I need to build every feature I planned." No. You need to build the MVP. Cut scope ruthlessly.
- "I should redesign my product spec now that I know more." Resist this urge. Build what you planned. Iterate after launch.
- "Using AI tools is cheating." Using AI to scaffold boilerplate is strategic. Use it for setup, not for architecture decisions you do not understand.

---

![](diagram:session-12-1/fig1-model)

### Define the smallest capstone that still delivers value

Write one sentence naming the user, problem, and outcome. Then describe the shortest journey that produces that outcome. A capstone is not stronger because it includes every technology from the course. It is stronger when its decisions fit the problem and the core journey works reliably. Choose a scope you can build, test, deploy, and explain within the remaining sessions.

Divide features into required for the core journey, useful after the core works, and deliberately deferred. Keep the first category small. Authentication, payments, or AI may be important for your chosen product, but do not add them only to decorate the architecture. If a course requirement calls for an integration, choose one that serves a real part of the journey and document its failure behavior.

### Establish the repository as the shared memory

Create a clear README with the product goal, manual prerequisites, environment variable names, run commands, and test commands. Commit an example configuration without secret values. Record the runtime versions you choose after manual installation. A future reviewer should not need your terminal history to start the project. Keep setup instructions accurate as the implementation changes.

Use a small architecture record to explain the client, server, database, and external boundaries. Name the source of truth for each important piece of data. Choose a schema that supports the first slice, and avoid speculative abstractions for features you may never build. A simple module boundary with a clear contract is easier to extend than an elaborate framework whose purpose is unclear.

### Deliver one vertical slice before expanding

A foundation slice should accept a user action, validate it, persist the result, and display the saved state after refresh. Use a synthetic account and fixture. Observe each boundary with the browser network panel and application logs. The slice proves that the components cooperate; separate Hello World screens do not. Record the exact behavior as acceptance criteria.

Include one failure path in the slice. If saving fails, preserve the draft and explain the error. If validation rejects the input, leave stored data unchanged. If the user is not authorized, deny the operation on the server. These early boundaries establish patterns the rest of the capstone will copy. Fix them now before duplication makes the mistake expensive.

### Make the next sprint easier to review

End with a small backlog ordered by dependencies and value. Each item should have a visible outcome and a test idea. Identify the largest uncertainty and a short experiment to resolve it. If an external provider is needed, create a fixture-based adapter so progress does not depend entirely on live credentials or availability.

The foundation review asks four questions: can someone start the project from the README, can the core slice be demonstrated, can the architecture be explained, and are the next steps small enough to finish? Attach evidence rather than answering only yes. The artifact is a working base with an honest plan, not a promise that all future complexity has already been solved.

## The demonstration

**Live Coding Walkthrough: Repository and Project Setup**

**Setup:** Open terminal and VS Code. Have MongoDB Atlas dashboard ready.

**Steps:**
1. Initialize Git repository with proper .gitignore
2. Set up folder structure:
```
capstone/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
├── server/          # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```
3. Configure environment variables (.env files with .env.example template)
4. Set up development scripts (npm run dev for both client and server)
5. Install core dependencies

**Quick Reference - Express Server Setup:**
```javascript
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/resources', require('./routes/resources'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Quick Reference - React API Service:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchResources = async () => {
  const response = await fetch(`${API_URL}/resources`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};
```

**Outcome:** Both client and server start without errors. README exists. .env.example is committed (but .env is gitignored).

**Watch for this:**
- Confirm the setup yourself before the next step. Everything else sits on it.
- Common pitfall: forgetting to add .env to .gitignore before the first commit.
- If you are using Vite, environment variables the frontend can read must start with `VITE_`.

Take ten minutes.

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-12-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const slice = {form: true, route: true, validation: true, persistence: true, refresh: false};
const incomplete = Object.keys(slice).filter(key => !slice[key]);
check(incomplete.length === 1 && incomplete[0] === 'refresh', 'A visual save is not yet a complete slice');
console.log('ok: checkpoint-12-1');
```

## Where it breaks

![](diagram:session-12-1/fig2-diagnosis)

### Skeleton mistaken for progress

The repo has folders for components, routes, models, and tests, and no user can do anything yet. The skeleton feels like a start. It is a filing system. Finish one action end to end, however ugly: create an account, save one record, see it after a reload. That slice will force the real decisions the folders were hiding, including auth, the shape of the data, and the error the form shows. A complete narrow path is progress. A complete directory tree is a promise.

### Too many must-haves

Every idea from the last eleven units is on the sprint list, and the week can hold two of them. You start five and finish zero, and the demo is a tour of half-wired screens. Pick one coherent minimum a person can finish, and write the rest down as not this sprint. Coherent means the kept pieces belong to the same path. A login with no app behind it, plus a payment button with no checkout, is two fragments. One finished path is the sprint.

### Architecture copied without need

The app has a queue, a cache, and a microservice because a diagram you admired had them. You cannot say what breaks if you delete each one, which means you do not know what it is for. Start without it. Add a piece when you can name the pressure it relieves and the failure it adds. Each dependency is a thing you will debug at one in the morning. Justify it in a sentence next to the decision, or leave it out of this version.

## Your turn

**Guided Practice 1: The Schema Forge**

**Prompt:** Design and implement your database models using Unit 4 patterns.

**Instructions:**
1. Identify all data entities your app needs (users, products, posts, etc.)
2. Write Mongoose schemas with proper types, required fields, and defaults
3. Add at least one relationship (reference or embed)
4. Create a seed data script that populates the database with test data
5. Run the seed script and verify data in MongoDB Compass or Atlas

**Success Criteria:** Models are created. Seed script runs. Data appears in the database.
**Time:** 30 minutes

**Checkpoints:**
- Checkpoint: at least one schema file exists, with its fields defined
- At 20 minutes: relationships between models should be established (embedded documents or ObjectId references)
- At 30 minutes: seed script has run and data is visible in MongoDB

**Watch for this:** Common pitfall is over-engineering the schema. Start simple and iterate later. Two to three models is enough for Sprint 1.

**Guided Practice 2: Core Backend**

**Prompt:** Build the Express server with routing architecture, middleware, and basic CRUD endpoints.

**Instructions:**
1. Express server with middleware stack (cors, body-parser, morgan)
2. At least 2 route files connected
3. Basic CRUD endpoints for primary resource
4. Error handling middleware
5. Connect to MongoDB (Atlas or local)
6. Test endpoints with Thunder Client or curl

**Success Criteria:** Server starts. At least one route returns data from MongoDB. Error handling middleware catches errors.
**Time:** 30 minutes

**Checkpoints:**
- At 10 minutes: Express server starts with middleware configured
- At 20 minutes: at least one GET endpoint returns data from the database
- At 30 minutes: basic CRUD (Create and Read minimum) working and tested

**Watch for this:** Use RTTPOC prompts to generate boilerplate routes if helpful, but you have to be able to explain what each line does.

Take ten minutes.

---

## The quest

**Independent Lab: The First Connection**

**Objectives:**
- Get the React frontend running with routing and component architecture
- Connect the frontend to the backend and verify the full data loop
- Set up authentication scaffolding (if applicable)

**Requirements:**
1. React app with React Router and at least 3 page components stubbed out
2. Navigation component with working links
3. Basic layout structure with consistent styling
4. Connect to backend API and successfully fetch and display data
5. Set up state management (Context API or similar)
6. If your app requires auth: set up JWT or session-based auth with registration and login endpoints, protected route middleware, and frontend auth context
7. If your app does NOT require auth: use auth time on additional core features
8. Commit and push everything to GitHub

**Hints:**
- Use AI tools to scaffold component files if it saves time, but understand the structure
- Test the full loop: React fetches from Express, Express queries MongoDB, data returns to React and renders
- Add a proxy setting or use full URLs to avoid CORS issues during development

**Stretch Goals:**
- Set up environment-based configuration (development vs production)
- Add input validation to your API endpoints using Joi or express-validator
- Write your first test file (even if it just tests that the server starts)

**Submission:** GitHub repo link with updated README. Both client and server should start without errors.

**End-of-Sprint Review**
- Quick standup: what did you get done? What is blocked?
- Commit and push everything to GitHub
- Update your Kanban board
- Preview Sprint 2 goals: "Tomorrow we finish features and integrate everything"
- Homework reminder: keep building tonight

### Review the artifact

Your deliverable is **A capstone foundation with one complete vertical slice and an architecture record**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-12-1/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** All of Units 1-11 completed. Product spec and sprint plan from Unit 8 finalized. Pitch deck draft from Unit 11 ready. Development environment fully configured (Node.js, MongoDB, VS Code, Git, deployment tools). Domain name purchased if using custom domain.
**Materials:** Product spec from Unit 8, pitch deck from Unit 11, GitHub account, MongoDB Atlas account, VS Code, terminal, Kanban board tool (GitHub Projects, Trello, or sticky notes)

**Assignment: Sprint 1 Continuation**
- **Objective:** Continue building your capstone. You should arrive at Sprint 2 with core architecture complete.
- **Tasks:**
  1. Complete all database models and seed data
  2. Finish core backend routes (all CRUD operations for at least one resource)
  3. Complete authentication flow (if applicable)
  4. Stub out all major React components and pages
  5. Push all work to GitHub with meaningful commit messages
- **Submission:** GitHub repo link with updated README
- **Time Estimate:** 3-4 hours
- **Due:** Before Session 12.2

**Stretch Goals (Optional):**
- Set up environment-based configuration (development vs production)
- Add input validation to your API endpoints using Joi or express-validator
- Write your first test file (even if it just tests that the server starts)

---

### Manual verification and further reading

- [Official reference 1](https://www.typescriptlang.org/docs/handbook/)
- [Official reference 2](https://react.dev/learn/thinking-in-react)
