---
editorial: true
title: Summoned Familiars
subtitle: Claude Code, Cursor, and Agentic Workflows
hook: "An agent task brief, reviewed patch, and reproducible verification log. Read repository rules and identify the affected behavior."
read: 60
artifact: "An agent task brief, reviewed patch, and reproducible verification log"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://code.claude.com/docs/en/overview
  - https://docs.cursor.com/
say:
  - "Inspect: Read repository rules and identify the affected behavior."
  - "Edit: Make a scoped change with explicit boundaries."
  - "Verify: Review the diff and run relevant checks."
---

## The hook

In every good isekai, the protagonist gets companions. Summoned creatures that fight alongside them. Today we summon ours.

Up until now, we have been chatting with AI in a browser window, copying and pasting code back and forth. That works, but it is like texting your party members instructions during a boss fight instead of having them right there next to you. Today, the AI joins the party. We are moving from chat-based prompting to agentic workflows, where the AI can read your files, understand your project structure, make edits across multiple files, run commands, and execute multi-step tasks. It is not just answering questions anymore. It is doing work.

Two tools. Claude Code runs in your terminal. It is like pair programming with an AI that can see your entire project. Cursor is an IDE with AI built in. It feels like VS Code but with superpowers: chat, multi-file editing, and inline code transforms. Both can read and write your codebase directly. Both require you to review everything they do. The crucial skill today is not getting the AI to write code. It is learning to review, verify, and direct the AI like a professional. Safety first: we are working on Git branches. Every change the AI makes can be reviewed in a diff. If it messes up, we revert. This is why you learned Git in Unit 1.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Evaluate AI-Generated Code Using a Systematic Verification Process
You will critically assess every piece of AI-generated code using a structured verification checklist, identifying hallucinations, fake APIs, security vulnerabilities, and style mismatches before accepting any output into their codebase.

### Enabling Objectives
- List the common types of AI hallucinations (fake APIs, wrong syntax, confident nonsense, outdated patterns)
- Apply the six-point verification checklist to any AI-generated output
- Verify that all imports, methods, and API calls reference real modules and functions
- Identify when to abandon a conversation and start fresh based on repeated errors or degradation
- Prompt the AI to self-correct by providing specific error descriptions and expected behavior

### You will be able to
- Catch at least one hallucination in AI-generated code and document the error and correction
- Verify every import, method call, and API reference against official documentation
- Explain every line of AI-generated code in their own words before accepting it
- Document a verification process that another developer could follow

---

**Welcome + The Familiar Summoning**
- What "agentic" means: the AI can read your files, understand your project structure, make edits across multiple files, run commands, and execute multi-step workflows. It is not just answering questions. It is doing work.
- Overview: Claude Code (terminal-based agent), Cursor (IDE-based agent), when to use which, and the crucial skill of reviewing AI-generated changes.
- Safety first: "We are working on a Git branch. Every change the AI makes can be reviewed in a diff. If it messes up, we revert. This is why you learned Git in Unit 1."

**Claude Code: What It Is and How It Works**

Claude Code is a terminal-based agentic coding tool from Anthropic. It runs in your terminal, reads your project files, understands your codebase, and can make edits. It is like pair programming with an AI that can see your entire project. It uses the RTTPOC principles you already know, but applied to a tool that can take action.

- **Setup:**
  ```bash
  # Install Claude Code
  npm install -g @anthropic-ai/claude-code

  # Navigate to your project
  cd ~/projects/your-mern-app

  # Start Claude Code
  claude
  ```
  - First run: it asks permission to read your project files. Say yes.
  - The interface: a terminal-based chat where the AI has context of your entire codebase

- **Writing effective Claude Code instructions:**
  - Your RTTPOC skills translate directly here
  - The Role is already set (Claude Code knows it is a coding assistant)
  - Focus on Task, Purpose, Output, and Constraints
  - Example instruction:
    ```
    Add a "last login" timestamp to the User model. Update the login
    route to set this timestamp whenever a user successfully authenticates.
    Update the user profile component to display the last login time
    in a human-readable format. Do not change any existing fields
    in the User schema. Use dayjs for date formatting since it is
    already in my package.json.
    ```

- **Key Claude Code workflows:**
  - **Explore:** "Explain how authentication works in this project. Walk me through the flow from login form to JWT verification."
  - **Build:** "Add [feature]. Here is what it should do: [description]. Follow the patterns used in [existing similar feature]."
  - **Debug:** "The /api/posts/:id route returns a 500 when the post ID does not exist. Find the bug and fix it."
  - **Refactor:** "The PostCard component is 200 lines. Break it into smaller components following the pattern used in UserCard."
  - **Review:** "Review my latest changes. Focus on security issues and missing error handling."

**Cursor IDE: What It Is and How It Works**

Cursor is an AI-powered IDE based on VS Code. Three main AI features: Chat, Composer, and Inline Editing. It reads your project files and understands your codebase. Key difference from Claude Code: visual, IDE-based, you see changes in real time in the editor.

- **Setup:**
  - Download Cursor from cursor.com
  - Open your Project 2 in Cursor
  - Settings: configure your AI model preferences

- **The `.cursorrules` file:** your project-specific system prompt
  ```
  # .cursorrules

  This is a MERN stack application.
  - Backend: Node.js, Express, MongoDB with Mongoose
  - Frontend: React with hooks (no class components)
  - Auth: JWT stored in httpOnly cookies
  - Styling: SCSS modules
  - Testing: Jest and React Testing Library

  Code conventions:
  - Use async/await, never .then() chains
  - Error responses use the format: { error: "message" }
  - All routes include input validation
  - Component files use PascalCase, utility files use camelCase
  ```

- **Cursor Chat (Cmd/Ctrl + L):**
  - Ask questions about your codebase: "How does the auth middleware work?"
  - Generate code: "Write a React hook for fetching paginated data"
  - Debug: "Why does this component re-render on every keystroke?"
  - Tag files with @filename to add them as context

- **Cursor Composer (Cmd/Ctrl + I):**
  - Multi-file editing mode
  - Describe a feature and Composer creates/modifies files across your project
  - Watch Composer create files, show the diffs, accept or reject per file

- **Cursor Inline Edit (Cmd/Ctrl + K):**
  - Select code, press Cmd/Ctrl+K, describe what you want changed
  - "Add error handling for network failures"
  - "Refactor this to use useReducer instead of multiple useState calls"
  - "Add loading and error states"

**When to Use Which Tool**

| Task Type | Best Tool | Why |
|-----------|-----------|-----|
| Quick question about code | Cursor Chat | Fast, inline, sees your open file |
| Multi-file feature | Claude Code or Cursor Composer | Can read/write across your project |
| Small inline edit | Cursor Inline (Cmd+K) | Select and edit, very fast |
| Debugging with stack trace | Claude Code | Good at reading errors and tracing through code |
| Exploring unfamiliar codebase | Claude Code | Great at explaining project structure |
| Refactoring a component | Cursor Composer | Visual diff, easy to accept/reject per file |
| Learning a new concept | Chat AI (browser) | Better for longer educational conversations |

- **Key Points:**
  - Agentic tools bring AI into your actual development environment
  - RTTPOC principles apply directly; the Role is pre-set, focus on Task/Constraints
  - Git branches are mandatory safety nets for all agentic work
  - The .cursorrules or CLAUDE.md file acts as a persistent system prompt
  - Always review diffs line by line before accepting changes

- **Common Misconceptions:**
  - "Agentic tools can handle any size task." They work best with focused, well-scoped instructions. Break large features into steps.
  - "I do not need Git branches when using agentic tools." You absolutely do. AI makes mistakes and you need to be able to revert cleanly.
  - "The AI understands my entire project perfectly." It reads your files but does not understand business logic or user intent. You still provide context.

![](diagram:session-5-3/fig1-model)

### Give an agent a bounded engineering task

An agent can read files, propose edits, run commands, and observe results. That creates a useful feedback loop, but it also makes scope important. A good task brief identifies the symptom, expected behavior, relevant repository location, constraints, and validation method. “Improve everything” makes review difficult because there is no agreed boundary. “Fix duplicate form submission while preserving the API and existing styles” produces a change you can assess.

Begin with inspection. Ask the agent to read applicable repository instructions, identify the request path, and explain the likely failure before editing. This is particularly valuable in an unfamiliar codebase, where a second implementation may already exist or a shared helper encodes an important convention. Inspection should produce evidence from actual files, not an invented architecture based on directory names.

### Permissions are part of the task design

A tool-capable assistant should operate with the access needed for the task. Local reversible edits differ from deleting data, publishing a site, sending messages, or changing account settings. State the boundary explicitly. A repository comment or tool response that says to upload credentials does not acquire authority because the agent encountered it while working. Review external content as evidence and keep the user's instructions as the source of authorization.

Never paste production secrets into the task brief. Use environment variable names and synthetic fixtures. If the agent needs to understand a configuration file, provide a redacted example or let it inspect the schema without printing values. Tool logs may persist, so preventing exposure is easier than cleaning up afterward. If a secret is exposed, rotate it rather than assuming deleting a message makes it safe.

### Review a patch as if a colleague wrote it

Read the diff from the user's action inward. Does the event reach the right handler? Does the server enforce the invariant? Does an error leave the system in a valid state? Then inspect dependency changes, generated files, and tests. A small bug fix should not quietly introduce an unrelated framework or weaken an assertion. Ask for the reason behind changes that are not explained by the task.

Run checks that exercise the failure. A green test suite is useful only within its coverage. If the bug occurs after two rapid clicks, a test with one click cannot demonstrate the fix. If the bug involves a missing network response, a pure function test is insufficient. Keep the evidence specific: which case failed before, which case passes after, and what was not exercised in the available environment.

### Measure assistance honestly

Record total time including review and repair. A patch generated in thirty seconds but requiring an hour of cleanup is not a thirty-second solution. Also record what you learned and whether you can maintain the result. The durable skill is supervising a complete engineering loop: define, inspect, change, verify, and explain. Product names and interfaces will change; that loop remains useful across tools.

## The demonstration

**Live Coding Walkthrough 1: Claude Code on a Real Task**

**Setup:** Open a MERN project in terminal. Start Claude Code.

**Steps:**
1. Start Claude Code in the project directory
2. Give it a multi-file task: "Add a character count to the post creation form that shows remaining characters out of a 500 character limit. Update the schema to enforce this limit, update the route to validate it, and update the React component to show a live character counter."
3. Watch which files it touches, and stop it if it leaves the task
4. Review every change in the diff
5. Accept or reject specific changes
6. Show the Git diff after the changes are made
7. Test the feature by running the app

**Where you should be:** You see the full workflow from instruction to multi-file changes to verification.

**Watch for this:**
- Narrate what Claude Code is doing as it works ("It is reading the Post model first to understand the existing schema...")
- Point out when it makes good decisions vs. when you might override
- Show the Git diff command and walk through each changed file

**Live Coding Walkthrough 2: Cursor Composer Feature Build**

**Setup:** Open the same MERN project in Cursor IDE.

**Steps:**
1. Open Cursor Composer (Cmd/Ctrl + I)
2. Describe a feature: "Create a notification system. Add a Notification model, a route to get unread notifications, and a NotificationBell component that shows a badge count."
3. Watch Composer create files and show the diffs
4. Walk through each file's diff: accept or reject per file
5. Show Cursor Inline Edit: select a function, press Cmd/Ctrl+K, "Add error handling for network failures"

**Where you should be:** You see the visual, IDE-based approach to agentic editing.

**Live Coding Walkthrough 3: Agentic Workflows and AI Code Review**

**Setup:** Use either tool on a multi-step workflow.

**Agentic Workflows: Multi-Step Tasks**

The power of agentic tools is giving multi-step instructions:
```
1. Read the current Post schema and all routes in /routes/posts.js
2. Add a "tags" field to the Post schema (array of strings, max 5 tags)
3. Update the POST /api/posts route to accept and validate tags
4. Update the GET /api/posts route to support filtering by tag (?tag=javascript)
5. Update the PostForm component to include a tag input
6. Update the PostList component to show tags and make them clickable for filtering
```

**Steps:**
1. Give the multi-step instruction
2. Review each step before moving to the next
3. Show the pair programming workflow: "What do you think about using a custom hook here?" "Is there a more efficient way to do this query?"
4. Use AI to review its own code: "Review these changes I made. Focus on: bugs, security issues, performance problems, and readability."

**Where you should be:** You see how to direct an AI through a complex, multi-step workflow.

**When NOT to Use AI (Critical Teaching Moment):**
- **Learning new concepts for the first time.** If you do not understand promises, do not ask AI to write async code for you. Learn promises first, then use AI to write async code faster.
- **Security-critical code.** AI can help, but a human must verify auth, encryption, and access control line by line.
- **When you cannot verify the output.** If you do not know enough to check if the code is correct, you are not ready to use AI for that task yet.
- **Architecture decisions without understanding trade-offs.** AI can suggest architectures, but you need to understand why you are choosing one over another.
- The rule: "If you cannot explain what the code does to a friend, do not ship it. Even if AI wrote it."

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-5-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const allowed = ['src/form.js', 'test/form.test.js'];
const review = files => files.filter(file => !allowed.includes(file));
check(review(['src/form.js']).length === 0, 'Scoped patch');
check(review(['src/form.js', 'billing/config.js']).length === 1, 'Unrelated change requires review');
console.log('ok: checkpoint-5-3');
```

## Where it breaks

![](diagram:session-5-3/fig2-diagnosis)

### Agent changes unrelated files

You asked for a validation line and the diff also reformats the router, renames a helper, and edits a test you did not mention. The extra edits may even be improvements. They are still unreviewed behavior in a change you cannot explain. Narrow the ask to the file and the function. Read the whole diff before you accept it. Revert anything that is not the task. A clean diff you understand is worth more than a large diff that happens to pass.

### Passing tests hide a regression

The suite is green and the bug is still there, because no test describes the behavior that broke. The agent added a test for the path it implemented, which is a restatement of the code, not a check on it. Write the missing case yourself, the one that failed in your hands, and watch it fail on the current code. Then let the fix make that case pass. A green suite that never saw the bug is not evidence the bug is gone.

### Tool output gives new instructions

A file, a web page, or a test fixture contains a line that tells the agent to ignore the task and do something else, and the agent starts doing it. Tool output is data. It is not a new set of orders, unless you decide it is. Keep the task in your own words, and treat instructions that arrive from the repository or the network as text to inspect. This is the same boundary as a prompt injection in an app: untrusted text does not get to widen what the tool is allowed to change.

## Your turn

**Guided Practice 1: Setup and First Agentic Task**

**Prompt:** "Get an agentic coding tool running on your project and execute your first AI-assisted code change. Review the diff. Accept or reject."

**Part A: Choose your tool and set up**

- **Option A: Claude Code**
  - Install: `npm install -g @anthropic-ai/claude-code`
  - Navigate to your Project 2 directory
  - Run `claude` to start
- **Option B: Cursor**
  - Download from cursor.com if not already installed
  - Open your Project 2 in Cursor
  - Create a `.cursorrules` file with your project conventions

**Part B: Create a safety branch**
```bash
git checkout -b ai-experiments
```

**Part C: Execute your first agentic task**

Choose one:
- "Add input validation to [one of your POST routes] that checks for required fields and returns helpful error messages"
- "Add a loading spinner component that shows while API requests are in progress in [one of your pages]"
- "Refactor [one of your larger components] into two smaller components"

**Part D: Review the changes**
- Run `git diff` to see every change the AI made
- Read every modified line
- Does it work? Run your app and test
- Does it match your code style?
- Any hallucinated imports or non-existent methods?
- Commit if good, revert if not: `git checkout .` to undo

**Success Criteria:**
- Tool is installed and running against Project 2
- At least one agentic task was executed
- You reviewed the git diff and can describe what changed
- Changes were tested (app runs without errors)
- You committed or reverted, and you can say why

**Time:** 35 minutes

**Checkpoints:**
- At 10 minutes: Tool installed and running
- At 15 minutes: Safety branch created, first task given to the AI
- At 25 minutes: AI changes reviewed in diff
- At 35 minutes: Changes committed or reverted, with documentation of decision

## The quest

**Independent Lab: AI Pair Programming Session**

*Summoning Your First Familiar: build a real feature with your AI companion at your side.*

**Objectives:**
- Practice the pair programming workflow with an agentic tool
- Build a real feature for your project using AI as navigator
- Document the full interaction loop

**Requirements:**
1. **Pick a feature or improvement** for your Project 2. Ideas:
   - A "delete with confirmation" modal for any of your existing delete buttons
   - A search bar that filters a list in real time
   - Dark mode toggle (CSS variables + a toggle component)
   - An "empty state" component that shows when a list has no items
   - Sorting options for any list in your app

2. **Use the pair programming workflow:**
   - Describe the feature to your AI tool in 2-3 sentences
   - Let it propose an approach
   - If you agree with the approach, let it implement
   - If you disagree, explain why and ask for an alternative
   - Review the first implementation
   - Ask for at least one improvement: "Also add [X]" or "Handle the case where [Y]"
   - Review the final implementation

3. **Document the interaction** in a file called `pair-programming-log.md`:
   - What you asked for
   - What the AI proposed
   - What you changed or iterated on
   - Final result (did it work? what is the quality?)
   - Total time from start to working feature

**Hints:**
- Start with a clear 2-3 sentence description. Do not dump a wall of text.
- When reviewing, focus on the Git diff, not just the final file. The diff shows exactly what changed.
- If the AI goes off track, do not try to fix it in the same conversation. Start fresh with a clearer prompt.
- Talk to the AI like a human pair programmer: "What do you think about..." "Can you explain why you chose..."

**Stretch Goals:**
- Build the feature using both Claude Code AND Cursor. Compare which was better for which parts.
- Ask the AI to review its own generated code. Document what it found.
- Time your total feature build and estimate how long it would have taken manually.

**Submission:** Push `pair-programming-log.md` and all code changes to your ai-experiments branch.

### Review the artifact

Your deliverable is **An agent task brief, reviewed patch, and reproducible verification log**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-5-3/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Homework 5.2 (advanced prompt techniques). Install Node.js 18+ if not already installed. Create a clean Git branch on your Project 2 repo (`git checkout -b ai-experiments`). Review Cursor from cursor.com and decide which tool you want to try first.
**Materials:** Terminal, VS Code or Cursor IDE, Project 2 MERN app in a Git repo, Node.js 18+, npm, internet access for tool installation

**Assignment: Build a Feature with Your Familiar**

**Due:** Before Session 5.4

**Tasks:**

1. **Pick a feature you want to add** to your Project 2. It should be something you have NOT built before. Ideas:
   - User profile editing page
   - Bookmark/favorite functionality
   - Comment system on posts
   - Email-style notification inbox
   - Data export (download your data as CSV or JSON)

2. **Build it entirely using agentic tools** (Claude Code, Cursor, or both). Do not write code manually except for minor tweaks.

3. **Document your entire process** in a file called `docs/agentic-build-log.md`:
   - What feature you chose and why
   - Every prompt/instruction you gave the AI (the full text)
   - Every iteration and correction
   - How you verified the output (what you checked, what you tested)
   - Total time spent
   - What worked well and what was frustrating

4. **The feature must work.** It does not need to be perfect, but it needs to be functional. If the AI generated something broken, document how you fixed it.

5. **Commit your changes** on a branch called `ai-feature-[feature-name]`. Push to GitHub.

**Submission:** Push to your Project 2 repo. Share the branch link and the build log in the submission form.

**Stretch Goals:**
- Use both Claude Code AND Cursor on the same feature. Document which tool was better for which parts.
- Ask the AI to review its own generated code. Document what it found.
- Create a `.cursorrules` or `CLAUDE.md` file that includes your full project conventions and test whether it improves output quality.

---

### Manual verification and further reading

- [Official reference 1](https://code.claude.com/docs/en/overview)
- [Official reference 2](https://docs.cursor.com/)
