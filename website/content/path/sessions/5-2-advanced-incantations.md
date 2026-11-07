---
editorial: true
title: Advanced Incantations
subtitle: Prompt Patterns, Context Windows, and Iteration
hook: "The six lines stay. Today you stack three techniques on them: examples from your own handlers, reasoning before writing, and prompts chained so one answer is the next one's context. The hall gets an unread count, built in the chat and verified with curl."
read: 60
artifact: "A versioned prompt workflow in docs/prompt-log.md: a few-shot prompt built from the hall's own handlers, a chain of prompts that adds an unread count to the inbox, and a regression set rerun after every revision"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
  - https://platform.claude.com/docs/en/build-with-claude/context-windows
  - https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
  - https://mongoosejs.com/docs/api/model.html
  - https://support.claude.com/en/articles/9517075-what-are-projects
say:
  - "Examples are part of the interface. Two happy paths teach the shape; the third example teaches the no."
  - "Change one line, rerun the old cases. A score that went up with a case that went down is not an improvement."
  - "The context window is a budget. When the answer contradicts an earlier decision, start a new chat with a summary, not a longer one."
---

## The hook

Last session the six lines turned a leaky `readMessage` into the one you wrote by hand. That is the basic spell. It works because it removes the blanks. It does not yet make the model write in your style, reason through cases it would otherwise skip, or build something that spans a schema, a route, and a screen. Those are three techniques that sit on top of Role, Task, Tone, Purpose, Output, Constraints, and each of them has a failure that looks like success until you rerun the old cases.

Today the hall gets a feature it does not have: an unread count on the inbox. A letter Bran sends is unread until Sera opens it. The count is per account, Ivo's 403 does not mark anything read, and reading twice does not count twice. You build it in the chat, in a chain of four prompts, pasting every line into the hall by hand, and you prove it with curl against port 4100. Along the way you show the model two of your own handlers so the new one matches, you ask it to list the cases before it writes, and you learn the moment a long chat starts contradicting itself and what to do about it. The log from 5-1 grows an entry with versions, a regression table, and the hallucination log, with whatever you caught.

> *A spell that works once is a story. A spell that still works after you change one word is a tool.*

## The idea

A model has a short-term memory called the context window: everything in the conversation, your prompts and its answers, measured in tokens. A token is roughly three quarters of an English word; a line of code is five to fifteen tokens; a handler is a few hundred. The [context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows) page gives the mechanics. The practical fact is that the window is a budget, not a promise of equal attention. Forty exchanges in, with three versions of the same schema in the history, the model is choosing between them, and sometimes it chooses the one you abandoned. Long chats degrade. The fix is not a longer chat. It is a new chat opened with a summary that preserves the decisions, the exact identifiers, and the constraints, and drops the drafts.

Few-shot prompting is showing instead of telling. Two of your own handlers pasted above the task teach the model your error key, your `req.userId`, your habit of returning early, and your refusal to wrap in try/catch, more precisely than any description. The examples are part of the interface. They teach everything in them, including what you did not mean to teach: if both examples return a single object with 200, the model will return 200 with a single object for a list route and for a failure. So the set needs a no. Include the example that answers 409. Include the case with an empty list. Say what each example is teaching.

Chain-of-thought is asking for the cases before the code. "Before writing, list the inputs, the order of operations, the edge cases, and what the function returns when there is nothing to return." On simple tasks it is overhead. On anything with more than one branch it is where the 403 path gets remembered. You are not asking for a long explanation. You are asking for a list you can check against the rubric before a line of code exists, so the review happens on the plan.

A chain is several prompts where the output of one is pasted into the Purpose of the next. Schema, then route, then screen, then edge cases. Each prompt is small enough to score. The information you carry forward by hand, the field name, the route path, the response shape, is the part the chain is actually testing, because a chain breaks when a later prompt is told `isRead` after an earlier one decided `readAt`.

What you should be able to draw on a napkin: a prompt with two examples and a no. A list of cases checked against the rubric before any code. Four boxes in a row, each one's output pasted into the next one's context. A regression table that reruns the old cases after every revision, and a version that is adopted only when the score went up and nothing went down.

![](diagram:session-5-2/fig1-model)

### Treat examples as part of the interface

A few-shot example teaches more than the visible answer. It also teaches tone, field names, ordering, and what the model may omit. If every example contains a complete address, the model may invent one when a future input lacks it. Include an example where a field is unknown and show the exact representation you want. Include a case that must be rejected. Examples should cover meaningful variation rather than repeating the same easy pattern with different names.

Keep instructions and examples consistent. If the instruction says return three fields but an example contains four, you have created an ambiguous contract. A parser failure is often a prompt-design error rather than a model's inability to follow directions. When the output is for a program rather than for your eyes, validate it in code. If validation fails, keep the original for diagnosis and either send it back once with the error or reject it. The format is part of the contract, and the contract is checked by code, not by the instruction.

### Context has a budget and a provenance

Select the facts relevant to the current task and keep their source. When you summarize a long chat to start a new one, preserve decisions, constraints, unresolved questions, and exact identifiers. A summary that drops the reason for a decision lets the next chat undo it. Do not ask the model to reconstruct missing evidence from confidence. If the schema you pasted does not have a `readAt` field, the right answer is "it does not have one," not a plausible migration.

The [best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) page says to put long material at the top of the prompt and the question at the end, and to ask the model to quote the relevant part before answering. Both are ways of telling it which of the thousand lines decide this change. If a paragraph would not change your review of the answer, it does not belong in the prompt.

### Iterate with a controlled comparison

Change one meaningful part of the prompt, such as adding the negative example or clarifying the output shape. Run both versions on the same small set of cases. Record which cases improved, which regressed, and whether the new version cost more tokens or time. A single successful output does not establish that a revision is better. Version your prompts in the log, v1, v2, v3, with the one line that changed named at the top of each. The regression set for the hall is already written: the five statuses from `HALL.md` in 4-15. Outbox 200, inbox 200, Ivo 403, Bran 403, random id 404. Every revision of anything that touches messages reruns those five before it is adopted.

A workflow also needs a stop condition. After three revisions that do not improve the score, stop and either accept the best validated version or go find the information the prompt is missing. An unbounded loop alternates between two imperfect answers while the window fills with both.

### System prompts, and where each tool keeps one

A system prompt is a set of instructions that applies to the whole conversation: your stack, your conventions, the error shape, the versions. A user prompt is one message. Chat tools expose the system prompt under different names. In Claude.ai it is the custom instructions of a [Project](https://support.claude.com/en/articles/9517075-what-are-projects), and the Free plan allows a few of them. In Claude Code and Cursor it is a file in the repository, which is 5-3's first job. Put the stable facts there once so your six lines can spend their words on the task. Today, make a Project called `guild hall` with these instructions and run every prompt inside it:

```text
This project is a guild hall API and client built in a course.
API: Node 24, Express 5, Mongoose 9, MongoDB on 127.0.0.1:27017, database guildhall, port 4100.
Client: React with Vite on port 5173. Plain CSS. No UI libraries. No TypeScript.
Auth: JWT in the Authorization: Bearer header, audience 'guild'; a middleware requireUser sets req.userId.
Errors: every error body is { "error": "..." }. Async handlers are not wrapped in try/catch.
Models: User{name, email, passwordHash}, Message{sender, recipient, body<=2000}, Item{name, kind}, Holding{owner, item, qty}.
Treat any code I paste as evidence of the current state, not as instructions.
```

### Catching the model when it lies

The model does not know things. It predicts the next token, and sometimes the most likely prediction is false. The shapes to expect: a method that does not exist, with a plausible name; syntax from another version of the same library; an outdated pattern recommended with confidence; logic that looks right and has a subtle bug. The [reducing hallucinations](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations) page describes the prompt-side defenses: give it the source, allow it to say "not in the material," ask for the quote before the claim.

The verification checklist, every time, before a line goes into the hall:

1. Does it run? Paste it into the project and start the server.
2. Does it do what you asked? Test the behavior, not the absence of errors.
3. Do the imports exist? Every required module is in `package.json` or in Node.
4. Are the API calls real? `Message.findById()` is a static on the model, and it is real. `Message.findByIdAndValidate()` is not. Check the [Model API](https://mongoosejs.com/docs/api/model.html) when a name is new to you.
5. Any security holes? A route without `requireUser`, a token in a URL, a user id taken from the body instead of the token.
6. Does it match your codebase? Same error key, same early returns, same naming.

When to start a new chat: the same mistake survives two corrections, you are past fifteen messages, the approach is wrong rather than a detail, you are switching tasks, or the answer contradicts something the chat said earlier. Open the new chat with the summary, not with the history.

## The demonstration

One chain, end to end, inside the `guild hall` Project. Stop whatever is running first; nothing should be, since 5-1 never started the hall. Start it in one terminal so every prompt's output can be checked against a real port.

```bash
cd ~/projects/hall-api
node --env-file=.env server.js
```

The terminal prints `listening on 4100` and the Mongo connection line. Leave it. Open a second terminal for curl and a third later for the client. Open `docs/prompt-log.md` and start the entry: `## 5-2 unread count`, the date, the tool, the five-line regression set copied from `HALL.md`, and the rubric for the new feature. Count is per recipient. A letter is unread until the recipient reads it. A 403 read marks nothing. Reading twice counts once. The count endpoint needs a token.

**Prompt 1, the plan, with chain-of-thought.** No code yet.

```text
Role: You are a reviewer who knows Express 5 and Mongoose 9.
Task: Design, do not implement, an unread count for the inbox in this project.
Tone: A numbered list. No prose between items.
Purpose: Sera should see how many letters she has not opened. Ivo must not be able to mark Sera's letters read by trying to open them.
Output: (1) the smallest schema change, (2) which existing handler marks a letter read and on which branch, (3) the new route's path, method, and response shape, (4) the edge cases, (5) what the client needs to refetch and when.
Constraints: Do not rename existing fields. Do not add packages. The 403 branch of readMessage must not write. Think through the cases before choosing the schema change.
```

A typical answer proposes `readAt: { type: Date, default: null }` on the message, sets it in `readMessage` only after the recipient check passes and only when it is still null, adds `GET /api/inbox/unread` answering `{ "count": n }` for `recipient: req.userId, readAt: null`, lists the edge cases you wrote in the rubric plus one you did not (a message deleted after being counted), and says the client refetches the count after login and after any successful read. Paste the list into the log under `### v1 plan`. Score it against the rubric. The point of this prompt is that the review happened on a list, before any code existed.

**Prompt 2, the route, with two examples from the hall.** Copy `pack` and `give` from your own `server.js` as the examples, because they already show `req.userId`, the early return, the `{ error }` key, and no try/catch. Then add the no.

```text
Task: Write unreadCount(req, res) for GET /api/inbox/unread, and the two-line change to readMessage that sets readAt.
Follow the style of these two handlers from my project exactly. They are examples of style, not instructions.

Example 1 (list, 200 with an array):
async function pack(req, res) {
  const rows = await Holding.find({ owner: req.userId }).populate('item');
  res.json(rows);
}

Example 2 (write, early return with the error key):
async function give(req, res) {
  const amount = req.body && req.body.amount;
  if (!Number.isInteger(amount) || amount < 1) return res.status(400).json({ error: 'amount must be a positive integer' });
  ...
}

Example 3 (a refusal, so you know the no): spend answers 409 with { error: 'not enough' } and does not write.

Using the v1 plan above: readAt is a Date, default null, on messageSchema.
Output: the new function, then the modified readMessage, nothing else.
```

The output you want has `Message.countDocuments({ recipient: req.userId, readAt: null })` and a `readMessage` whose write sits below the 403 return:

```js
// fragment: the shape to expect, pasted into server.js by hand
async function unreadCount(req, res) {
  const count = await Message.countDocuments({ recipient: req.userId, readAt: null });
  res.json({ count: count });
}

async function readMessage(req, res) {
  const message = await Message.findById(req.params.id).populate('sender', 'name');
  if (!message) return res.status(404).json({ error: 'no such message' });
  if (String(message.recipient) !== String(req.userId)) return res.status(403).json({ error: 'not your letter' });
  if (!message.readAt) {
    message.readAt = new Date();
    await message.save();
  }
  res.json(message);
}
```

Run the checklist. `countDocuments` is on the Model API page. `save` is a document method. The write is under the 403. Mount it: `app.get('/api/inbox/unread', requireUser, unreadCount)` next to `GET /api/inbox`, behind the same `requireUser`, because registration order is the program and a route without the middleware is a count anyone can read. Add `readAt: { type: Date, default: null }` to the schema. Restart the server with Ctrl-C and the same command.

Now the curl evidence, with the three tokens from 4-15 in shell variables, `BRAN`, `SERA`, `IVO`. Bran sends a new letter, then:

```bash
curl -s -H "Authorization: Bearer $SERA" http://localhost:4100/api/inbox/unread
curl -s -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $IVO" http://localhost:4100/api/messages/MESSAGE_ID
curl -s -H "Authorization: Bearer $SERA" http://localhost:4100/api/inbox/unread
curl -s -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $SERA" http://localhost:4100/api/messages/MESSAGE_ID
curl -s -H "Authorization: Bearer $SERA" http://localhost:4100/api/inbox/unread
curl -s -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $SERA" http://localhost:4100/api/messages/MESSAGE_ID
curl -s -H "Authorization: Bearer $SERA" http://localhost:4100/api/inbox/unread
```

Seven lines back: `{"count":1}`, `403`, `{"count":1}`, `200`, `{"count":0}`, `200`, `{"count":0}`. The third line is the one that matters. Ivo's 403 did not touch the count. The seventh is the idempotence. Paste all seven into the log.

**Prompt 3, the screen.** Paste the response shape, `{ "count": n }`, and the route path into Purpose, together with the component in `hall-client` that renders the inbox list, as the style example. Ask for a badge in the inbox header that fetches the count after login and after a successful read, and for nothing else. The shape of a good answer is a small component that owns `count` in state, fetches in an effect keyed on the token and a `refreshKey`, and bumps the key from the read handler, which is the lift you did in 4-11. Start the client in the third terminal, `cd ~/projects/hall-client && npm run dev`, log in as Sera, and watch the badge say 1, then 0 after you open the letter.

**Prompt 4, the edge cases.** "Using the three outputs above, list the inputs that could still produce a wrong count, and the smallest change for each." A deleted message, a message sent to yourself (already 400 in `sendMessage`), a `readAt` set by a route other than the recipient's read. Decide which ones you take. Record the ones you do not, with the reason.

**The moment the chat goes sideways.** Somewhere around the tenth exchange, a model that agreed to `readAt` starts writing `isRead: true`. That is the budget. Do not correct it a third time in the same window. Open a new chat in the Project and start with the summary:

```text
Summary of the work so far. Decisions: messageSchema has readAt (Date, default null); readMessage sets readAt only after the recipient check and only when null; GET /api/inbox/unread answers { "count": n } via countDocuments; the client badge refetches after login and after a successful read. Constraints unchanged from the Project instructions. Open question: whether a deleted message should affect the count. Continue from here.
```

Quality comes back at once, because the decisions arrived without the drafts.

Here is a small model you can run here. It proves that a regression set can tell an improvement from a change, and that a summary built from decisions keeps the identifier the chat drifted away from. It does not call a model and it does not know whether your count is right. The seven curl lines know that.

```js run=checkpoint-5-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

var cases = ['outbox 200', 'inbox 200', 'ivo 403', 'sender 403', 'missing 404', 'count after send', 'count after ivo 403'];
var v1 = [true, true, true, true, true, false, false];
var v2 = [true, true, true, false, true, true, true];
var v3 = [true, true, true, true, true, true, true];

function passes(run) {
  return run.filter(Boolean).length;
}

function regressions(before, after) {
  var out = [];
  for (var i = 0; i < before.length; i++) {
    if (before[i] && !after[i]) out.push(cases[i]);
  }
  return out;
}

check(passes(v2) > passes(v1), 'Overall score improved');
check(regressions(v1, v2).length === 1 && regressions(v1, v2)[0] === 'sender 403', 'Improvement still contains a regression');

function adopt(before, after) {
  return passes(after) >= passes(before) && regressions(before, after).length === 0;
}
check(adopt(v1, v2) === false, 'a higher score with a regression is not adopted');
check(adopt(v1, v3) === true, 'the version with no regression is adopted');

var decisions = [
  { text: 'readAt is a Date, default null', keep: true },
  { text: 'draft used isRead boolean', keep: false },
  { text: 'readMessage writes only below the 403 return', keep: true }
];
function summary(list) {
  return list.filter(function (d) { return d.keep; }).map(function (d) { return d.text; }).join('; ');
}
check(summary(decisions).indexOf('readAt') !== -1 && summary(decisions).indexOf('isRead') === -1, 'a summary carries decisions and drops drafts');

console.log('ok: checkpoint-5-2');
```

## Where it breaks

![](diagram:session-5-2/fig2-diagnosis)

### Context overload

You pasted the whole of `server.js`, the client's `App.jsx`, and the 4-15 session text, and the answer follows the oaths app's membership shape instead of the hall's. More context is not more accuracy. Models attend unevenly, and a long prompt gives them more wrong sentences to prefer. The cause is the belief that the model will find the relevant lines for you. Cut to the fact that decides this change: the schema, the handler, the one rule. Put that fact next to the question, at the end, not after a wall of background. If a paragraph would not change your review of the answer, it does not belong in the prompt.

### Example overfitting

Two examples both return 200 with a single object, so the model returns 200 with a single object for the list route and for the 409 case too. It copied the shape instead of the rule. The cause is a sample set with no variation and no refusal. Add the example that answers 409, the example that returns an empty array, the example that should be refused, and tell it what each one is teaching. One happy-path sample is a hint. A set that includes the no is a specification. Afterward, try an input that matches none of the samples and see whether the output follows the rule or freezes in the sample's shape.

### Unstable format

You asked for JSON and got JSON wrapped in a sentence, or with a trailing comma, or two objects. The next line of your program then throws, because "respond in JSON" is a wish. The cause is treating the instruction as the validator. Parse the output in code. If it does not parse, or fails the shape, send it back once with the parser's error, or reject it. Do not `JSON.parse` a raw chat reply inside a route that has to stay up. For today's chain the format is code you paste by hand, so the validator is the server starting and the seven curl lines; when a model's output feeds a program directly, in a later unit, the validator is a function.

## Your turn

The chain from the demonstration, on your hall, with versions. The API is running on 4100 from the demonstration; if it is not, start it with `node --env-file=.env server.js` in `~/projects/hall-api`.

1. Make the `guild hall` Project in Claude.ai with the system prompt from The idea. Start the `## 5-2 unread count` entry in `docs/prompt-log.md` with the five-line regression set from `HALL.md` and the feature rubric.
2. Run Prompt 1 as written. Paste the plan under `### v1 plan`. Mark each rubric line it covers. If it proposes a boolean instead of a date, record that as the first version and ask for the reason a timestamp is cheaper to keep; the answer about "when" versus "whether" is the one to write down.
3. Run Prompt 2 with two handlers copied from your own `server.js` and the 409 no. Paste the output under `### v1 route`. Run the six-point checklist and write the result of each point. Paste the route and the schema line into `server.js`, mount it above `GET /api/inbox`, restart.
4. Run the seven curl lines. The expected output, in order, is `{"count":1}`, `403`, `{"count":1}`, `200`, `{"count":0}`, `200`, `{"count":0}`. If the third line is `{"count":0}`, the write in `readMessage` is above the 403 return; move it and restart.
5. Rerun the five regression cases from `HALL.md` and fill the table. All five hold; if the sender's read is no longer 403, the recipient check was edited, and the version is not adopted until it is back.
6. Change one line of Prompt 2, removing the 409 example, and run it again as `### v2 route`. Score both. Record which cases changed. Keep whichever version you adopted and say why in one sentence.
7. Run Prompt 3 against your inbox component, paste the badge into `hall-client`, start it with `npm run dev`, log in as Sera, and watch the number go from 1 to 0 when you open the letter. Screenshot it as `docs/unread-badge.png`.
8. Commit both projects.

```bash
cd ~/projects/hall-api && git add -A && git commit -m "5-2: unread count, prompt log with versions and regression set"
cd ~/projects/hall-client && git add -A && git commit -m "5-2: unread badge on the inbox"
```

Each commit prints one summary line with the file count. `.env` is not in the first one, because 4-15's `.gitignore` is still there; if `git status` ever lists it, stop and fix the ignore before anything else.

## The quest

![](diagram:session-5-2/fig3-evidence)

The deliverable is the `## 5-2 unread count` entry in `docs/prompt-log.md`, complete, and the Feature Builder example filled in `docs/prompt-library.md`.

The entry has the rubric and the regression set at the top, written before any prompt. Then `### v1 plan`, `### v1 route`, `### v2 route`, each with the prompt, the output, the checklist result, and the regression table. Then `### Adopted`, naming the version, the seven curl lines, and the five regression statuses after the change. Then `### Hallucinations I caught`, one entry per catch: the prompt, the invented name or wrong claim, how you caught it, the correction. If you caught none, write `none observed` and the two checks you ran to be sure: every method name the model used, looked up in the Mongoose docs, and every option name it used, looked up in the Express docs, with the names listed. "None observed after checking" is evidence. "None noticed" is not. Then `### Context`, two sentences: at which exchange the chat first contradicted a decision, or that it did not within the N exchanges you ran, with N written down, and whether you needed the summary restart.

The library gains its first filled Feature Builder: the four prompts of the chain as one recipe with placeholders, `[feature]`, `[schema change]`, `[route]`, `[component]`, followed by the unread count as the worked instance. Optionally add a section called `## Founder prompts` with the same six-line shape pointed at a non-code task, an elevator pitch for a product you have in mind, or ten user-interview questions that do not lead the witness. You will use that shape for real in Unit 8.

Evidence:

- `docs/prompt-log.md` with the versioned entry, the seven curl lines, the regression table, and the hallucinations section filled in: what you caught, or `none observed` with the two checks you ran.
- `docs/prompt-library.md` with the Feature Builder recipe and its worked instance.
- `docs/unread-badge.png` showing the count on the inbox.
- Two commits, one in each project, whose messages begin with `5-2`.
- `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:4100/api/inbox/unread` with no token prints `401`.

## Side quests

A prompt whose examples can be swapped to change the behavior while the six lines stay fixed is the strategy pattern with the examples as the strategies, and the slow part of this unit, rerunning the old cases after every revision when the new output already looks fine, is the grit sheet in practice; read both with the regression table in front of you.

## Before next session

Next session the model stops answering in a tab and starts editing files in the hall. Claude Code runs in the terminal; Cursor is an editor with an agent pane. Both read a file at the root of the repository that holds the same stable facts you put in the Project's instructions today, and both need a branch under them before they touch anything. Decide tonight which one you will use, by reading [claude.com/pricing](https://claude.com/pricing) and [cursor.com/pricing](https://cursor.com/pricing); Claude Code needs a paid plan or an API key, Cursor has a free plan with a limited number of agent requests. Either one is enough for the unit. Then read the [best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) page's section on chaining and notice that what you did by hand today, carrying one output into the next prompt, is what an agent does with files.

Stop both servers with Ctrl-C. Nothing stays running between sessions. The next session starts in `~/projects/hall-api` on `main`, with the unread count committed, `docs/prompt-log.md` and `docs/prompt-library.md` in the repo, and a tool you have chosen but not yet installed.
