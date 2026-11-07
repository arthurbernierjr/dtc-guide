---
editorial: true
title: Advanced Incantations
subtitle: Prompt Patterns, Context Windows, and Iteration
hook: "A versioned prompt workflow with examples, context selection, and regression cases. Select evidence relevant to the decision."
read: 60
artifact: "A versioned prompt workflow with examples, context selection, and regression cases"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview
say:
  - "Context: Select evidence relevant to the decision."
  - "Iteration: Change one instruction and compare outputs."
  - "Regression: Retest old cases before adopting a revision."
---

## The hook

Last session you learned the basic spell system. RTTPOC. Six components. Every time. Today we learn the advanced incantations, the techniques that separate apprentice wizards from archmages.

You are going to learn four things that will level up your prompting dramatically. First, context windows and token limits, the invisible constraint that determines when your AI conversations start going sideways. Second, chain-of-thought prompting, the technique that forces the AI to think before it codes, producing dramatically better output on complex problems. Third, few-shot prompting, where you show the AI exactly what you want by giving it examples from your own codebase. And fourth, the most important meta-skill of all: catching the AI when it lies to you.

By the end of today, you will be able to hand the AI a complex problem and guide it through solving it step by step, verify the output, chain multiple prompts together to build entire features, and know exactly when to start a fresh conversation because the current one has gone off the rails. These are not beginner techniques. These are what professional developers who actually use AI effectively do every single day.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Apply Advanced Prompting Techniques to Complex Development Problems
You will use chain-of-thought prompting, few-shot prompting, prompt chaining, and context window management to solve multi-step development problems that require structured reasoning and consistent code style.

### Enabling Objectives
- Explain what context windows and token limits are and how they affect prompt quality over long conversations
- Write chain-of-thought prompts that force step-by-step reasoning before code generation
- Write few-shot prompts that provide 2-3 examples to enforce consistent output patterns
- Decompose a complex feature into a sequence of 4-6 prompts where each builds on the previous output
- Identify the point at which a long conversation degrades and apply the fresh-start strategy

### You will be able to
- Write a chain-of-thought prompt that produces more robust code than a direct prompt for the same task
- Write a few-shot prompt using real code from their own project to enforce style consistency
- Break a full-stack feature into a sequential prompt chain of at least 4 prompts
- Recognize context window degradation and apply summarization or fresh-start techniques

---

**Welcome + Level Up Moment**
- Quick review: "Someone tell me the six RTTPOC components without looking at your notes." (Cold call, let them struggle, then celebrate when they get it.)
- Preview: "Today we cover four advanced techniques: chain-of-thought, few-shot, context windows, and prompt debugging. Plus the most important meta-skill of all: knowing when the AI is lying to you."
- "By the end of today, you will be able to hand the AI a complex problem and guide it through solving it step by step, verify the output, and know exactly when to start a fresh conversation."

**Context Windows and Token Limits**

A context window is the AI's short-term memory. Everything in the conversation, your prompts AND the AI's responses, takes up space in this memory.

- **Token basics:** a token is roughly 3/4 of a word. "Basically" is one token. A line of code is usually 5-15 tokens. A full React component might be 200-500 tokens.

- **Model-specific limits:** verify the selected model’s current input and output limits in its official documentation. Tokenization depends on the model, language, and content; use a provider-supported count when a hard bound matters. A rough word conversion is only a planning estimate.

- **Why this matters practically:**
  - Long conversations degrade quality. The AI "forgets" things from early in the conversation.
  - Pasting huge codebases eats up your context. Be strategic about what you include.
  - At some point, starting a new conversation is better than continuing a long one.

- **The "goldilocks zone":** include enough context for the AI to understand your problem, but not so much that you are wasting tokens on irrelevant code.

- **Practical strategies:**
  - Paste only the relevant files, not your entire codebase
  - Summarize earlier parts of the conversation when it gets long: "To recap, we have built X, Y, and Z so far. Now I need help with W."
  - Start fresh when you switch to a new task
  - Use system prompts (if available) for persistent context that should carry through the whole conversation

**Chain-of-Thought and Few-Shot Prompting**

**Chain-of-Thought Prompting:**

Instead of asking for the final answer, ask the AI to think through the problem step by step. This forces the model to show its reasoning, which makes the final output more accurate and catches logical errors early.

The magic phrase: "Think through this step by step before writing any code."

- When to use chain-of-thought: complex logic, multi-step calculations, architectural decisions, debugging tricky bugs
- When NOT to use it: simple, well-defined tasks where you just need the output

**Few-Shot Prompting:**

Give the AI examples of what you want, and it will pattern-match to produce similar outputs. Examples are worth a thousand words of description. Showing is more precise than telling.

- The 2-3 example sweet spot: one example is often enough, two-three is usually perfect, more than five is diminishing returns
- When to use few-shot: consistent formatting, matching existing code style, generating repetitive structures (test cases, API docs, data transformations)

**System Prompts vs User Prompts:**
- System prompt: persistent instructions that apply to the entire conversation. "You are a senior React developer. Always use functional components with hooks. Never use class components."
- User prompt: individual messages in the conversation.
- Not all tools expose system prompts (ChatGPT does in custom instructions, Claude does in projects, Cursor does in rules files).
- Pro tip: put your tech stack, coding standards, and project context in system prompts so you do not have to repeat them every time.

- **Key Points:**
  - Context windows are finite; manage them strategically
  - Chain-of-thought produces dramatically better output on complex problems
  - Few-shot examples enforce consistency better than descriptions alone
  - System prompts eliminate repetitive context-setting across messages

- **Common Misconceptions:**
  - "Bigger context window means I can paste my whole project." You can, but quality degrades when the AI has to find the needle in a haystack. Be surgical about what you include.
  - "Chain-of-thought is always better." For simple tasks, it is unnecessary overhead. Use it for complex multi-step problems.
  - "One example is enough for few-shot." One is the minimum. Two to three examples define a clearer pattern and reduce ambiguity.

![](diagram:session-5-2/fig1-model)

### Treat examples as part of the interface

A few-shot example teaches more than the visible answer. It also teaches tone, field names, ordering, and what the model may omit. If every example contains a complete address, the model may invent one when a future input lacks it. Include an example where a field is unknown and show the exact representation you want. Include a case that must be rejected or escalated. Examples should cover meaningful variation rather than repeating the same easy pattern with different names.

Keep instructions and examples consistent. If the instruction says return three fields but an example contains four, you have created an ambiguous contract. A parser failure may be a prompt-design error rather than a model's inability to follow directions. Write a validator for machine-consumed output. If validation fails, preserve the original result for diagnosis and use a bounded repair attempt or a clear error path.

### Context has a budget and a provenance

A large context window is a capacity limit, not a promise that every detail receives equal attention. Select the facts relevant to the current task and retain their source. When summarizing a long project history, preserve decisions, constraints, unresolved questions, and exact identifiers. A summary that drops the reason for a decision can cause the next iteration to undo useful work.

Do not ask the model to reconstruct missing evidence from confidence. If a document does not contain a deadline, the answer should say that the deadline is unknown. When retrieval is involved, require references to the retrieved material and check that they actually support the claim. A plausible citation label is not evidence. Your evaluation should include an input where the requested fact is absent.

### Iterate with a controlled comparison

Change one meaningful part of the prompt, such as adding a negative example or clarifying an output schema. Run both versions on the same small evaluation set. Record which cases improved, which regressed, and whether the new version costs more tokens or time. A single successful output does not establish that a revision is better. Repeated samples can reveal variability, especially when the task has several acceptable answers.

Ask for concise reasoning summaries or explicit checks when they help review the result. Do not equate a long explanation with correct reasoning. For code, execution and review provide stronger evidence. For writing, a rubric and source comparison do. For classification, a labeled evaluation set exposes false positives and false negatives. The evaluator should match the task rather than rewarding verbosity.

### Design a graceful limit

A workflow needs a stop condition. After a bounded number of revisions, return the best validated result or ask for the missing information. An unbounded self-correction loop can consume time and money while alternating between two imperfect answers. Save enough state to explain the failure without retaining sensitive input unnecessarily. The finished artifact includes the prompt versions, evaluation cases, scores, and one documented case the workflow still cannot resolve reliably.

## The demonstration

**Live Coding Walkthrough 1: Context Window Degradation**

**Setup:** Open an AI chat tool. Start a conversation about a MERN app feature.

**Steps:**
1. Start with a good RTTPOC prompt and get excellent output
2. Continue the conversation for 5 exchanges, adding small tasks
3. By exchange 8-10, show how the AI starts contradicting earlier decisions or forgetting constraints
4. Start a fresh conversation with a good summary: "I have a MERN app with X, Y, Z. We already built A, B, C. Now I need help with D."
5. Show how quality jumps back up immediately

**Where you should be:** You understand that conversations have an expiration point and learn the fresh-start technique.

**Live Coding Walkthrough 2: Chain-of-Thought Comparison**

**Setup:** Prepare two versions of the same prompt for a complex task.

**Steps:**
1. **Without chain-of-thought:**
   ```
   Role: You are a senior backend developer.
   Task: Write a function that calculates the total revenue for a user,
   including discounts, refunds, and tax.
   Output: JavaScript function.
   ```
   Show the output: often misses edge cases or gets the math wrong.

2. **With chain-of-thought:**
   ```
   Role: You are a senior backend developer.
   Task: Write a function that calculates the total revenue for a user,
   including discounts, refunds, and tax.
   Before writing any code, think through:
   1. What inputs does this function need?
   2. What is the correct order of operations (apply discount first or tax first)?
   3. What edge cases could cause incorrect results?
   4. What should the function return if there are no transactions?
   Then write the function with error handling for each edge case you identified.
   Output: JavaScript function with comments explaining each step.
   ```
   Show the output: much more robust, well-reasoned code.

**Where you should be:** You see the measurable quality difference from adding step-by-step reasoning.

**Live Coding Walkthrough 3: Few-Shot for Code Style**

**Setup:** Prepare a JSDoc commenting task.

**Steps:**
1. **Without few-shot:**
   ```
   Task: Write JSDoc comments for my Express route handlers.
   ```
   Show the output: AI guesses the JSDoc style, often wrong or inconsistent.

2. **With few-shot:**
   ```
   Task: Write JSDoc comments for my Express route handlers.
   Follow this exact format I use in my codebase:

   Example 1:
   /**
    * @route   GET /api/posts
    * @desc    Retrieve all posts, sorted by creation date (newest first)
    * @access  Public
    * @returns {Array<Post>} 200 - Array of post objects
    * @returns {Error} 500 - Server error
    */

   Example 2:
   /**
    * @route   POST /api/posts
    * @desc    Create a new post (requires authentication)
    * @access  Private
    * @param   {string} req.body.title - Post title (required, max 200 chars)
    * @param   {string} req.body.content - Post content (required)
    * @returns {Post} 201 - Created post object
    * @returns {Error} 400 - Validation error
    * @returns {Error} 401 - Not authenticated
    */

   Now write JSDoc comments for these route handlers:
   [paste your route handlers]
   ```
   Show the output: AI matches the exact style perfectly.

**Where you should be:** You see how providing 2 real examples produces perfectly style-matched output.

**Watch for this:**
- Before you compare the two prompts, write down which one you think will do better, and why
- For the few-shot demo, show both outputs side by side for easy comparison
- Remember that these techniques stack: you can combine chain-of-thought AND few-shot in the same RTTPOC prompt

**Live Coding Walkthrough 4: Prompt Debugging and Verification**

**Setup:** Prompt the AI to write something moderately complex and walk through the verification checklist.

**AI Hallucinations: What They Are and Why They Happen**

The AI does not "know" things. It predicts the most likely next token. Sometimes the most likely prediction is wrong.

Common hallucination types:
- **Fake APIs:** inventing methods or libraries that do not exist ("Use mongoose.bulkValidate()" - that is not a real method)
- **Wrong syntax:** mixing up syntax from different languages or framework versions
- **Confident nonsense:** stating incorrect information with total confidence
- **Outdated information:** recommending patterns from old versions of libraries
- **Plausible-but-wrong logic:** code that looks correct but has a subtle bug

**The Verification Checklist (use this EVERY time):**
1. **Does it run?** Paste it into your project. Does it execute without errors?
2. **Does it do what you asked?** Test the actual functionality, not just "no errors."
3. **Do the imports exist?** Check that every imported module, function, or method actually exists in your project or the library documentation.
4. **Are the API calls correct?** Verify method signatures against official docs. `mongoose.findById()` is real. `mongoose.findByIdAndValidate()` is not.
5. **Are there security holes?** SQL injection, XSS, exposed secrets, missing auth checks.
6. **Does it match your codebase?** Same patterns, same naming conventions, same error handling approach.

**Steps:**
1. Prompt the AI for a moderately complex Express route with Mongoose queries
2. Walk through each checklist item and write down the one you cannot check yet
3. Find the hallucination (there will almost always be one)
4. Show how to prompt the AI to fix it: "The method `X` does not exist in Mongoose 7. What is the correct method to achieve the same result?"

**When to start a fresh conversation:**
- The AI keeps making the same mistake after 2-3 correction attempts
- You have been going back and forth for 15+ messages
- You realize the fundamental approach is wrong (not just a detail)
- You are switching to a completely different task
- The AI starts contradicting things it said earlier

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-5-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const baseline = [true, false, true, false];
const revised = [true, true, false, true];
const regressions = revised.flatMap((pass, i) => baseline[i] && !pass ? [i] : []);
check(revised.filter(Boolean).length > baseline.filter(Boolean).length, 'Overall score improved');
check(regressions.length === 1 && regressions[0] === 2, 'Improvement still contains a regression');
console.log('ok: checkpoint-5-2');
```

## Where it breaks

![](diagram:session-5-2/fig2-diagnosis)

### Context overload

You pasted three READMEs, an old issue, and the whole file, and the answer follows the stale README. More context is not more accuracy. Models attend unevenly, and a long prompt gives them more wrong sentences to prefer. Cut to the fact that decides this change: the function, the error, the one rule. Put that fact next to the question, not after a wall of background. If a paragraph would not change your review of the answer, it does not belong in the prompt.

### Example overfitting

Two examples both return a 201 with a single object, so the model returns a 201 for the list endpoint and for the error case too. It copied the shape instead of the rule. Add an example of the failure, an example with an empty list, and an example that should be refused. Tell it what those examples are teaching. One happy-path sample is a hint. A set that includes the no is a specification. Afterward, try an input that matches none of the samples and see whether it follows the rule or freezes in the sample's shape.

### Unstable format

You asked for JSON and got JSON wrapped in a paragraph, or JSON with a trailing comma, or two objects. The next line of your program then throws, because a request to "respond in JSON" is a wish. Parse the output. If it does not parse, or it fails the schema, send it back once with the parser error, or reject it. Do not `JSON.parse` a raw chat reply in a route that has to stay up. The format is part of the contract, and the contract is checked by code, not by the instruction.

## Your turn

**Guided Practice 1: Chain-of-Thought and Few-Shot Practice**

**Prompt:** "Practice chain-of-thought and few-shot prompting with real tasks from your Project 2. Write at least one of each, run them, and verify the outputs."

**Part A: Chain-of-Thought Prompt**
- Pick a piece of logic from your Project 2 that involves multiple steps (form validation, data transformation, or a multi-condition filter)
- Write a RTTPOC prompt that includes chain-of-thought instructions: "Before writing code, think through [specific questions about the problem]"
- Run the prompt and compare the output to what you originally wrote manually
- Document: Did the chain-of-thought version catch any edge cases your original code missed?

**Part B: Few-Shot Prompt**
- Find a pattern that repeats in your Project 2 (route handlers, React components, Mongoose queries)
- Copy 2 existing examples from your codebase
- Write a RTTPOC prompt that uses those examples as few-shot context, then asks the AI to generate a new instance following the same pattern
- Run the prompt and check if the output matches your code style

**Part C: Verification**
- Pick either output and run through the Verification Checklist
- Document at least one thing you verified and one thing you caught (or would have caught in a real scenario)

**Starter Code / Template:**
```markdown
# Advanced Prompting Lab

## Chain-of-Thought Prompt

**Task from my project:** [describe the logic you are targeting]

**My RTTPOC Prompt:**
Role: ...
Task: Before writing any code, think through:
1. [Question about inputs]
2. [Question about edge cases]
3. [Question about order of operations]
Then implement the solution.
...

**Output Evaluation:**
- Edge cases caught by CoT that my original code missed: ___
- Quality comparison to my manual version: ___

## Few-Shot Prompt

**Pattern I am replicating:** [describe the repeating pattern]

**Example 1 from my codebase:**
[paste real code]

**Example 2 from my codebase:**
[paste real code]

**My RTTPOC Prompt:**
...

**Output Evaluation:**
- Does the output match my code style? ___
- Differences I noticed: ___

## Verification Findings
- What I verified: ___
- What I caught (or would have caught): ___
```

**Success Criteria:**
- Chain-of-thought prompt includes at least 3 thinking steps
- The few-shot prompt includes at least 2 real examples from your own codebase
- Both outputs are evaluated and documented
- At least one verification finding is documented

**Time:** 35 minutes

**Checkpoints:**
- At 10 minutes: Chain-of-thought prompt written and ready to run
- At 20 minutes: Few-shot prompt written with real examples pasted
- At 30 minutes: Both outputs evaluated, verification started
- At 35 minutes: Documentation complete

## The quest

**Independent Lab: Prompt Chain Architecture**

*The Chain Caster's Workshop: build an entire feature through a sequence of linked prompts.*

**Objectives:**
- Decompose a complex feature into a sequence of prompts where each builds on the previous output
- Practice feeding output from one prompt as context for the next
- Experience the full workflow of prompt-chained feature development

**Requirements:**
1. Choose a feature from your Project 2 (or one you wish you had built). Examples:
   - A search feature with filters
   - A notification system
   - A user settings page with form validation
   - A data dashboard with charts

2. Break the feature into 4-6 sequential prompts. The chain should follow this pattern:
   - Prompt 1: Design the data model / schema
   - Prompt 2: Build the backend route(s) using the schema from Prompt 1
   - Prompt 3: Build the frontend component(s) that call the routes from Prompt 2
   - Prompt 4: Add error handling and edge cases to everything above
   - Prompt 5 (optional): Write tests for the feature
   - Prompt 6 (optional): Optimize and refactor

3. Write each prompt using RTTPOC. In the Purpose/Context section of prompts 2+, include relevant output from the previous prompt.

4. Execute at least the first 3 prompts in the chain. Document the output of each.

5. At the bottom of your document, answer: "What was the hardest part of chaining prompts? What information did you have to carry forward manually?"

**Hints:**
- Copy the schema output from Prompt 1 directly into the Purpose section of Prompt 2
- Be explicit about which parts of the previous output to use: "Using the Post schema defined above, build routes that..."
- If a prompt's output is too long to paste entirely, summarize the key parts (field names, route signatures, component props)
- Start fresh conversations for each prompt if the chain gets long

**Stretch Goals:**
- Complete all 6 prompts in the chain
- Generate a full working feature and test it in your actual project
- Write a recipe card that someone else could follow to build the same feature

**Submission:** Push your prompt chain document to your Project 2 repo in `/docs`. Include outputs for at least the first 3 prompts.

### Review the artifact

Your deliverable is **A versioned prompt workflow with examples, context selection, and regression cases**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-5-2/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Complete Homework 5.1 (prompt library v1). Review your prompt library and identify which templates produced the best and worst outputs. Have your Project 2 MERN app code available for reference tasks.
**Materials:** AI chat tool access (Claude or ChatGPT), VS Code, Project 2 MERN app repo, completed prompt-library.md from Homework 5.1

**Assignment: Advanced Prompt Techniques Practice**

**Due:** Before Session 5.3

**Tasks:**

1. **Expand your prompt library** (`prompt-library.md`): Add 3 new templates that use advanced techniques:
   - One chain-of-thought template for debugging complex issues
   - One few-shot template for generating code that matches your project's style
   - One prompt chain template (sequence of 3+ prompts for building a feature end-to-end)

2. **Hallucination Journal:** Create a section in your prompt library called "Hallucinations I Caught." Add at least 2 entries where the AI generated something incorrect. For each entry, document:
   - The prompt you used
   - The incorrect output
   - How you caught the error
   - The corrected version (either from the AI after feedback, or your own fix)

3. **Context Window Experiment:** Take one of your longer conversations with an AI and identify the point where quality started degrading. Document:
   - How many exchanges deep were you?
   - What symptoms of degradation did you notice?
   - Did starting a fresh conversation help?

**Submission:** Push to your Project 2 repo in `/docs/prompt-library.md`. Link in the class submission form.

**Stretch Goals:**
- Write a system prompt for your Project 2 that includes your tech stack, coding standards, and project context. Test it across 3 different tasks.
- Create a "prompt chain recipe" for building a full CRUD feature from scratch (schema to component, 6+ prompts)
- Find a task where chain-of-thought HURT the output (made it worse or slower). Document why.

---

**Side Quest (Optional): The Founder's Other Toolbelt**

Everything you learned today generalizes beyond code. The same template-with-placeholders discipline that powers your prompt library works for the business half of your founder journey. The pattern: write the prompt once with `[bracketed variables]`, then reuse it forever by filling in the blanks. Three examples to seed a "founder prompts" section of your library:

```markdown
## Elevator Pitch Generator
Act as a startup pitch coach. My product is [product], targeting [audience],
solving [pain point]. Our unfair advantage is [differentiator].
Write 3 versions of a 30-second elevator pitch: one leading with the problem,
one leading with traction, one leading with the vision. Keep each under 80 words.

## Competitive Positioning
Compare [my product] against [competitor A] and [competitor B] from the
perspective of [target customer]. Produce a table of: pricing, core features,
onboarding friction, and switching costs. Then identify the single strongest
differentiator I should emphasize, and explain why in 3 sentences.

## User Interview Question Bank
I am building [product] for [audience]. Generate 10 open-ended user interview
questions that probe [specific behavior or pain point] WITHOUT leading the
witness. No yes/no questions. No questions that mention my product.
```

Notice these are RTTPOC in disguise: Role, Task, Output format, Constraints. You will use prompts like these for real in Unit 8 (user research) and Unit 11 (pitch decks). Add 1-2 of your own business templates to your library if you have capstone ideas brewing.

---

### Manual verification and further reading

- [Official reference 1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
