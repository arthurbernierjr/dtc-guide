---
editorial: true
title: Awakening the Cheat Skill
subtitle: The RTTPOC Prompt Framework
hook: "An RTTPOC prompt packet with a baseline, revised output, and evaluation rubric. State role, task, and target audience."
read: 60
artifact: "An RTTPOC prompt packet with a baseline, revised output, and evaluation rubric"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
say:
  - "Intent: State role, task, and target audience."
  - "Contract: Specify process, output, and constraints."
  - "Evaluation: Compare results against observable criteria."
---

## The hook

Every isekai protagonist has that moment. They are getting destroyed by some mid-tier monster, their party is down, things look bad, and then they discover they have had an overpowered skill sitting in their inventory the whole time. Something that changes everything. You have been coding for seven weeks now. You have typed thousands of lines of JavaScript. You have battled CSS. You have survived callback hell. And the whole time, you had a cheat skill sitting right there. Today, we activate it.

This unit is about prompt engineering and agentic coding tools. Not the "ask ChatGPT to do my homework" version. The real version. The version where you learn a systematic framework called RTTPOC to write prompts that actually work, every time. Where you learn to use tools like Claude Code and Cursor to build features at 10x speed while still understanding every line of code. By the end of this unit, you will take a feature from your MERN app, rebuild it from scratch using AI tools, and prove that you can ship faster than anyone who does not have this skill.

Here is why this matters if you want to be a founder. Founding a company means you need to build fast, iterate faster, and ship yesterday. You do not have a team of fifty engineers. You might not even have one. Prompt engineering is the skill that lets a solo founder build what used to require a team. It is not about being lazy. It is about being strategic. The founders who understand AI tools AND understand the fundamentals are going to build circles around everyone else. That is you, after this unit. Four sessions. Session one, we learn the RTTPOC framework. Session two, advanced techniques: chain-of-thought, few-shot, context windows, and debugging AI hallucinations. Session three, we get our hands on Claude Code and Cursor and learn agentic workflows where the AI reads and writes your actual codebase. Session four, the trial. You pick a feature, rebuild it at 10x speed, document everything, and ship. Other bootcamps do not teach this. Most working developers do not know this. You are about to learn a skill that puts you ahead of people with ten years of experience who still copy-paste from Stack Overflow. Your cheat skill is awakening. Let us go.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Construct Structured Prompts Using the RTTPOC Framework
You will design complete, production-quality prompts by systematically applying all six RTTPOC components (Role, Task, Tone, Purpose, Output, Constraints) to any development task, producing consistent and reliable AI-generated outputs.

### Enabling Objectives
- Define each component of the RTTPOC framework and explain its function in shaping AI output
- Identify missing or weak components in poorly structured prompts
- Write Role statements with specific expertise levels and domain specializations
- Write Task statements with specific, actionable instructions
- Write Constraint statements that prevent off-target outputs (library restrictions, version compatibility, line limits)
- Compose complete RTTPOC prompts for debugging, code review, and feature building scenarios

### You will be able to
- Write a six-component RTTPOC prompt from scratch for any development task in under 5 minutes
- Diagnose and fix at least 3 problems in a poorly structured prompt
- Build a reusable prompt template library with placeholders for variable content
- Iterate on a prompt across 3-5 rounds, improving output quality with each refinement

---

**Welcome + The Cheat Skill Awakens**
- "Welcome to the session where everything changes. You have been grinding for four units. Today we discover the skill you have had all along."
- Quick poll: "Who here has used ChatGPT or Claude before? Who felt like the results were inconsistent, sometimes amazing, sometimes garbage?" (Most hands up.)
- The isekai moment: "The reason AI felt unreliable is not because it is bad. It is because you were casting spells without knowing the incantation. Today we learn the incantation."
- Overview of the session: RTTPOC framework, writing prompts, iterating, building templates
- Set expectations: "By the end of today, you will have a framework that makes every single AI interaction better. Not sometimes. Every time."

**What Prompt Engineering Actually Is**

Prompt engineering is the skill of communicating with AI models to get specific, reliable, useful outputs. It is not about "just asking it." Unstructured requests produce unstructured results.

- **Key Concepts:**
  - The input-output mental model: AI is a function. Your prompt is the argument. Better arguments, better returns.
  - Real-world analogy: ordering food. "I want food" vs "I want a medium-rare ribeye, 12 oz, with garlic butter, asparagus on the side, no mushrooms." Same restaurant, wildly different results.

- **Why this matters for founders:**
  - Speed: build features in minutes instead of hours
  - Leverage: one person doing the work of three
  - Quality: AI catches edge cases you miss (if you ask right)
  - Learning: AI explains code, teaches patterns, reviews your work

- **The trap to avoid:** generating code you do not understand. "If you cannot explain it, you do not own it. AI is a power tool, not a replacement for your brain."

- **Quick demo:** Show a bad prompt and its mediocre output, then a good prompt and its excellent output. Do not explain the framework yet, just show the difference.

**The RTTPOC Framework Deep Dive**

Introduce RTTPOC as a mnemonic: **R**ole, **T**ask, **T**one, **P**urpose, **O**utput, **C**onstraints

Break down each component with examples:

**Role** - Tell the AI who it is
- "You are a senior full-stack JavaScript developer with 10 years of experience in MERN stack applications."
- "You are a MongoDB schema design expert who specializes in data modeling for social media applications."
- Why it matters: sets the expertise level and domain. A "junior developer" role gives different output than a "senior architect" role.
- Pro tip: be specific about the specialization. "React developer" is good. "React developer who specializes in custom hooks and performance optimization" is better.

**Task** - What you want it to do
- "Write a React component that displays a paginated list of blog posts."
- "Debug this Express route that returns a 500 error when the user ID is not found."
- "Refactor this function to use async/await instead of .then() chains."
- Why it matters: vague tasks get vague results. "Help me with my code" is not a task. "Fix the null pointer exception on line 42 of UserController.js" is a task.

**Tone** - How it should communicate
- "Explain like I am a bootcamp student with four units of experience."
- "Be concise and technical. No analogies."
- "Use a friendly, encouraging tone with code comments explaining each step."
- Why it matters: controls the density and style of the response.

**Purpose** - Why you need this
- "I am building a SaaS app for freelancers to track invoices and I need this component for the dashboard."
- "I am debugging a production issue that is blocking user signups."
- "I am learning about authentication patterns for the first time."
- Why it matters: context shapes the response. An auth implementation for a learning exercise looks different than one for production. Purpose tells the AI what trade-offs to make.

**Output** - What format you want
- "Return only the code, no explanations."
- "Return a JSON object with the schema definition."
- "Return a markdown document with headers, code blocks, and a summary table."
- "Return a React component with TypeScript types, PropTypes, and JSDoc comments."
- Why it matters: without this, AI guesses the format. Sometimes it writes an essay when you wanted a code block.

**Constraints** - Rules and limitations
- "Do not use any external libraries. Only built-in React hooks."
- "Must work with MongoDB 6.0 and Mongoose 7.x."
- "Maximum 50 lines of code."
- "Do not include any CSS. Only the logic."
- "Must handle error cases: empty input, null values, network failures."
- Why it matters: constraints prevent the AI from going off the rails. Without them, you get answers that technically work but use libraries you do not have, patterns you do not know, or approaches that do not fit your stack.

- **Key Points:**
  - Every component independently improves output quality
  - Together, the six components virtually eliminate ambiguity
  - The framework works across all AI platforms (Claude, ChatGPT, Gemini, etc.)
  - RTTPOC is a skill, not a template; adapt it to each situation

- **Common Misconceptions:**
  - "I just need a good Task and I am fine." Without Role, Tone, and Constraints, the AI fills in the blanks with generic defaults.
  - "More text in the prompt means better output." Specificity matters more than length. A focused 5-line prompt beats a vague 20-line one.
  - "If the AI gives bad output, AI is bad." Investigate the prompt, missing context, model capability, tools, and evaluation criteria; any of these can explain a poor result.

![](diagram:session-5-1/fig1-model)

### A prompt is a specification you can test

A request to make an application better has no stable stopping point. A request to add a labeled email field, validate its format, preserve the draft after failure, and show a confirmation only after a successful server response has observable outcomes. RTTPOC helps you organize those outcomes. The value is not the acronym itself; it is the discipline of exposing assumptions before a model fills them in.

Role provides a perspective, not a guarantee of expertise. Task states the operation. Target audience determines vocabulary and depth. Process can ask for inspection before modification and for checks after modification. Output defines the artifact you expect. Constraints set boundaries such as preserving existing APIs, avoiding new dependencies, or using synthetic data. If two fields conflict, rewrite the prompt instead of expecting the model to infer which one matters more.

### Evaluate two prompts on the same task

Choose a small function with a known contract. Run a vague baseline prompt, save the result, then run your structured prompt against the same starting code and fixtures. Compare correctness, omissions, readability, and the amount of repair required. Do not compare a five-minute first attempt with a two-hour revised implementation and call the difference a prompt improvement. Keep the task, context, and evaluation criteria stable enough that the comparison means something.

A useful rubric includes at least one negative case. If the task is input validation, empty and malformed inputs matter. If the task is summarization, unsupported claims and missing caveats matter. If the task is code modification, unrelated changes matter. A polished answer can still fail the contract. Score the artifact using evidence rather than how confident or friendly the response sounds.

### Give context in layers

Start with the smallest context that explains the task: relevant files, current behavior, desired behavior, and constraints. Add logs or examples when they resolve a specific ambiguity. Dumping an entire repository into a prompt can hide the important boundary among irrelevant details. Conversely, asking for a precise fix without the error, calling code, or expected behavior forces guesses. The right amount of context is the amount that lets a reviewer explain why the proposed change fits.

Separate quoted data from instructions. A customer message, repository comment, or retrieved webpage can contain text that looks like a command. The task should identify those materials as evidence to analyze, not authority to change the assignment. This matters especially when a model can use tools. A helpful-looking instruction inside an untrusted document must not silently authorize deleting files or sending messages.

### Keep an experiment notebook

Save the prompt, model identifier, date, input fixture, output, and your score. Models and tool interfaces change, so a result without those details is difficult to reproduce. Avoid saving secrets or unnecessary personal data in the notebook. Record what you revised and why, including cases where the more detailed prompt performed worse. The goal is a repeatable way to improve results, not a collection of impressive screenshots.

## The demonstration

**Live Coding Walkthrough 1: Building a RTTPOC Prompt Incrementally**

**Setup:** Open an AI chat tool. Have a simple development task ready: "Write a login form component."

**Steps:**
1. Start with just a bare Task: "Write a login form."
   - Run the prompt and show the output: generic, no error handling, unknown styling approach, random libraries
2. Add Role: "You are a senior full-stack JavaScript developer with 10 years of experience in MERN stack applications."
   - Run again and show improvement: better code quality, more professional patterns
3. Add Tone: "Explain like I am a bootcamp student. Include code comments on every non-obvious line."
   - Run again: better explanations, more accessible
4. Add Purpose: "I am building a SaaS app for freelancers to track invoices. This login form is for the main entry point."
   - Run again: better architectural decisions, context-aware choices
5. Add Output: "Return a single React functional component file using hooks. No class components."
   - Run again: correct format, no guessing
6. Add Constraints: "Do not use any external UI libraries. Use only built-in React hooks and plain CSS. Must handle empty field validation and display error messages. Must include a loading state during form submission."
   - Run again: fits the actual project, handles edge cases

**Where you should be:** You see the output improve dramatically with each component added.

**Watch for this:**
- Pause after each addition to compare the outputs
- Before you run it, predict what will change before running the updated prompt
- Look for specific lines in the output that appeared only after adding certain components
- Remember that this incremental approach is also useful for debugging bad prompts: add one component at a time and observe which one fixes the issue

**Live Coding Walkthrough 2: The Iteration Loop**

**Setup:** Use a complete RTTPOC prompt for generating an Express route.

**Steps:**
1. Round 1: Generate a basic Express route for creating a blog post
2. Round 2: "That is close, but add error handling for missing fields and invalid ObjectIds"
3. Round 3: "Good, now add input validation using express-validator"
4. Round 4: "Add rate limiting and make it match the pattern in my existing routes" (provide an example route)

**Where you should be:** You see how iteration produces progressively more production-ready code.

**Watch for this:**
- Remember that 3-5 rounds of iteration is normal for important code
- Show the common iteration patterns:
  - Refinement: "That is close, but change X to Y"
  - Adding constraints: "The code works but does not handle the edge case where Z"
  - Changing approach: "Good logic, but rewrite using [specific pattern]"
  - Understanding check: "Explain line 14 to me before we continue"
- Notice that the iteration loop is the real cheat skill within the cheat skill

**Prompt Templates for Common Dev Tasks:**

Three templates you can copy:

**The Debugger Template:**
```
Role: You are a senior JavaScript debugger.
Task: Find and fix the bug in the following code. [paste code]
Tone: Be direct. Explain what went wrong in one sentence, then show the fix.
Purpose: This is blocking my feature from working. The expected behavior is [X] but the actual behavior is [Y].
Output: Show only the corrected code with a comment on the changed line(s).
Constraints: Do not change the overall structure. Only fix the bug.
```

**The Code Review Template:**
```
Role: You are a senior code reviewer at a top tech company.
Task: Review the following code for bugs, performance issues, security vulnerabilities, and style. [paste code]
Tone: Be constructive but honest. Rate severity as Critical, Warning, or Suggestion.
Purpose: This is going into production for a SaaS app. It handles user data.
Output: A numbered list of findings, each with severity, description, and suggested fix.
Constraints: Focus on JavaScript/Node.js best practices. Ignore formatting (Prettier handles that).
```

**The Feature Builder Template:**
```
Role: You are a full-stack MERN developer.
Task: Build [feature description] for my application.
Tone: Include code comments explaining the "why" behind non-obvious decisions.
Purpose: [Why this feature exists and what problem it solves for users]
Output: Complete implementation with separate code blocks for each file (model, route, component).
Constraints: Use Express for backend, React with hooks for frontend, Mongoose for data. No TypeScript. No external UI libraries.
```

- Mention 3-4 additional template categories without full content: the Explainer, the Refactorer, the Test Writer

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-5-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const required = ['role', 'task', 'target', 'process', 'output', 'constraints'];
const brief = Object.fromEntries(required.map(key => [key, 'specified']));
const missing = value => required.filter(key => typeof value[key] !== 'string' || !value[key].trim());
check(missing(brief).length === 0, 'Complete brief');
check(missing({...brief, constraints: ''}).includes('constraints'), 'Missing boundary detected');
console.log('ok: checkpoint-5-1');
```

## Where it breaks

![](diagram:session-5-1/fig2-diagnosis)

### Vague output

You asked for "a good login form" and got a generic component that picks a library you do not use, skips the empty-field case, and explains nothing. The model filled every unspecified choice itself. Replace the adjective with an example and a check: which file, which hooks, what the empty submit must do, what it must not import. Run the vague prompt and the specific one back to back and diff the output. The gap is the prompt, not the model's mood. If you cannot say how you would reject a bad answer, the prompt is not finished.

### Invented facts

The answer cites a method, a flag, or a pricing tier that does not exist, and it cites it with the same confidence as the lines that are real. A fluent paragraph is not a source. Paste the document, the error, or the schema you want it to use, and tell it to say when the answer is not in that material. Then check the names against the docs before you run the code. The dangerous output is the one that almost compiles, because the invented flag fails later, in a place that looks like your bug.

### Sensitive context

The prompt got better because you pasted the whole `.env`, a customer row, or a private key "for context." The provider now has it, the chat history has it, and a screenshot of the chat would leak it again. Take those values out before you send. Use fake keys and a made-up user. If a real secret did go out, rotate it. A prompt can be specific about shape, the table, the error text, without carrying a credential. Specific and sensitive are not the same thing.

## Your turn

**Guided Practice 1: Write Your First RTTPOC Prompts**

**Prompt:** "Choose three tasks from the list below (or create your own related to your Project 2). For each task, write a complete RTTPOC prompt with all six components. Run each prompt in your AI tool and evaluate the output."

**Task Options:**
- Write a React component that displays a user profile card with avatar, name, bio, and an "Edit" button
- Write an Express middleware that logs every request with timestamp, method, URL, and response time
- Write a Mongoose schema for a "Comment" model that belongs to a "Post" and a "User"
- Debug a buggy snippet you wrote on purpose, with one defect you can name
- Write a function that validates an email address without using regex libraries

**Starter Framework:**
```markdown
# prompt-lab-1.md

## Prompt 1: [Task Name]

**Role:**
[Your role statement here]

**Task:**
[Your task statement here]

**Tone:**
[Your tone statement here]

**Purpose:**
[Your purpose statement here]

**Output:**
[Your output specification here]

**Constraints:**
- [Constraint 1]
- [Constraint 2]
- [Constraint 3]

### Evaluation
- Did the output match what you expected?
- What was the best part of the output?
- What would you change in your prompt to improve the result?
- Rating (1-5): ___

## Prompt 2: [Task Name]
[Same structure]

## Prompt 3: [Task Name]
[Same structure]
```

**Success Criteria:**
- All three prompts include all six RTTPOC components
- Each component is specific (not generic filler)
- You can say why each component changed the output
- At least one prompt produces output rated 4 or higher
- Markdown file is well-organized and ready for review

**Time:** 30 minutes

**Checkpoints:**
- Checkpoint: at least one complete RTTPOC prompt is written
- At 20 minutes: At least two prompts should be executed with outputs evaluated
- At 30 minutes: All three prompts documented with evaluations

## The quest

**Independent Lab: Good Prompt vs. Bad Prompt Showdown**

*The Prompt Dueling Arena: prove that RTTPOC beats "just ask it" every time.*

**Objectives:**
- Demonstrate the measurable difference between unstructured and RTTPOC-structured prompts
- Practice critical evaluation of AI output quality
- Build confidence in the RTTPOC framework through side-by-side comparison

**Requirements:**
1. Pair up with a classmate
2. Together, choose ONE development task from this list:
   - Build a REST API endpoint for creating a new blog post with validation
   - Write a React component for a todo list with add, delete, and toggle-complete functionality
   - Create a MongoDB aggregation pipeline that returns the top 5 most commented posts
   - Write an authentication middleware that checks JWT tokens and attaches user data to the request
3. One partner writes the **bad prompt** (vague, no structure, 1-2 sentences, like how most people prompt):
   - Example: "Write me a login page"
4. The other partner writes the **RTTPOC prompt** (full framework, all six components, specific and detailed)
5. Both run their prompts in the SAME AI tool. Copy the full outputs into a shared document.
6. Compare the outputs side by side. Document:
   - Line count difference
   - Error handling: which one has it?
   - Code quality: which one follows best practices?
   - Usability: which one could you actually paste into your project?
   - Edge cases: which one handles unexpected inputs?
7. Swap roles and do it again with a different task from the list.

**Hints:**
- For the "bad prompt," think about how you actually used AI before this session. That is probably the bad prompt.
- For the RTTPOC prompt, use the templates from the demonstration as a starting point and customize.
- When comparing, do not just say "this one is better." Be specific about what is different and why.

**Stretch Goals:**
- Run the same bad prompt in two different AI tools and compare
- Take the bad prompt's output and write a follow-up RTTPOC prompt to fix only the issues
- Time how long it takes to make each output usable in your project

**Submission:** Push your comparison document to your Project 2 repo in a `/docs` folder. Be prepared to share one key finding with the class (30-second share).

### Review the artifact

Your deliverable is **An RTTPOC prompt packet with a baseline, revised output, and evaluation rubric**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-5-1/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Ensure a free account on at least one AI platform (Claude, ChatGPT, or similar). Have your Project 2 MERN app code available. Review any prior experience you have using AI chat tools and note what worked and what felt inconsistent.
**Materials:** AI chat tool access (Claude or ChatGPT), VS Code, Project 2 MERN app repo, browser for AI platform

**Assignment: Build Your RTTPOC Prompt Library v1**

**Due:** Before Session 5.2

**Tasks:**

1. **Create a file called `prompt-library.md` in your Project 2 repo** (in a `/docs` folder).

2. **Write 6 RTTPOC prompt templates**, one for each of these categories:
   - Debugging a backend error
   - Debugging a frontend rendering issue
   - Code review (paste code, get feedback)
   - Building a new React component
   - Building a new Express route with Mongoose
   - Explaining a concept you do not understand yet

3. **For each template:**
   - Write the complete RTTPOC prompt with placeholders marked in `[brackets]` for the parts that change each time
   - Include one real example where you fill in the brackets with something from your Project 2
   - Run the real example and include the AI output
   - Rate the output 1-5 and write one sentence about what you would iterate on

4. **Write a short reflection (3-5 sentences)** at the top of the file answering: "What changed about how I think about using AI tools after learning RTTPOC?"

**Submission:** Push to your Project 2 repo. Link in the class submission form.

**Stretch Goals:**
- Write 3 additional templates for tasks you find yourself doing often (writing tests, formatting data, writing comments/docs)
- Run one template through 4 rounds of iteration, showing how each round improved the output
- Try the same RTTPOC prompt in two different AI tools and compare the outputs

---

### Manual verification and further reading

- [Official reference 1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
