---
editorial: true
title: Sprint 2 — Build
subtitle: Should-haves, and a state machine for the core flow
hook: "The Must-haves agree with the plan. Sprint 2 builds the Should-haves that survived the cut and gives the core flow one status string that decides what every button does, so a double click, a failed save, and an empty list each do exactly one thing."
read: 55
artifact: "A feature-complete core journey with integration and recovery evidence"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://react.dev/learn/managing-state
  - https://react.dev/learn/reacting-to-input-with-state
  - https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
  - https://mongoosejs.com/docs/validation.html
say:
  - "One status string per flow: idle, pending, saved, error. Four booleans allow lies."
  - "A duplicate send while pending is ignored by the machine, not by the user's restraint."
  - "An adapter returns your shape; the provider's payload never reaches a component."
---

## The hook

Sprint 1 ended with a table that tells the truth and one slice that survives a reload. Sprint 2 is the only session in this unit that adds features. The Should-haves that survived the cut get built today, each one as a full slice, and nothing from the Could column comes anywhere near the editor. By the end of the session a stranger with the fixture account can walk from sign-in to the valuable outcome and back without you narrating, and every step on that walk has a visible answer for "what is happening right now."

That second half is the real work. In 4-10 you learned that loading, empty, error, and ready are one `status` string, not four booleans. Your capstone was written three units after that lesson, and some of its forms have a `loading` flag, an `error` string, a `success` toast, and a button that can be clicked twice while the first request is in flight. Today the core flow gets one small state machine: a pure function that says which event is allowed in which state, and a component that cannot do anything the function did not permit. The same discipline wraps the provider you already call, Stripe or the AI route, in an adapter with fixtures so the build keeps moving when the key is missing.

> *A bridge is finished when the far bank is reached, not when every plank is cut. Today you lay the planks that are left, in order, and you nail each one down before stepping on the next.*

## The idea

A feature is complete when the user can reach it, perform it, understand the result, and recover from the ordinary failure. Those are four separate checks. A route with no screen fails the first. A screen that saves locally and forgets on reload fails the second, which Sprint 1 already taught you to catch. A save that succeeds silently fails the third; the user clicks again because nothing changed. A save that fails and throws the draft away fails the fourth, and that one loses people's work. Sprint 2 runs every Should-have through all four before it is marked done.

The core flow is the path from the empathy map: the one journey your persona takes to get the outcome they came for. It has a shape that every other feature copies, so it is the flow that gets the state machine first. The machine is small. There are four states: `idle`, `pending`, `saved`, `error`. There are five events: `edit`, `send`, `success`, `failure`, `retry`. A pure function `transition(state, event)` returns the next state, and for a pair that is not allowed, it returns the same state. That last rule is the whole point. A second `send` while `pending` returns `pending`. The function ignores the duplicate; the user's self-control is not the mechanism.

Explicit states fix the data-loss bug too. The draft lives in its own `useState`, exactly as 4-10 put it. The machine's `failure` event moves to `error` and touches nothing else, so the draft is still in the field and the user reads the message and clicks retry. Optimistic UI is allowed, but the optimism has to be reconcilable: keep the previous server value, keep the draft, and if the server refuses, show the previous value and the error together. Confirm the row only when the response says the write landed.

Empty is not an error. A new account has no records and a working app, and the empty state says what to do next. A failed request is a different sentence with a retry. If the list shows "no entries yet" when the server actually returned 500, the user believes a lie, and so do your tests. One `status` for the list, separate from the form's machine: `loading`, `ready`, `error`, with `ready && items.length === 0` as the empty branch computed during render, never stored.

Integrations hide behind adapters. Your capstone already calls Stripe through `api/lib/stripe.js` from 10-2 and an AI provider through `api/lib/ai.js` from 10-3. Today each call moves behind a small module in `api/services/` that returns your application's shape, not the provider's payload, and that can be switched to fixtures with one environment variable. Four fixtures per adapter: normal, empty, malformed, unavailable. That lets you build and test the screen that shows an AI draft without a key in the environment, and it lets 12-3's tests exercise the error path without a provider outage on demand.

Napkin version: a pure `transition` function; one `status` per flow; the draft survives failure; empty and error are different sentences; every provider behind an adapter with four fixtures; the whole journey walked as the fixture account after every feature.

![](diagram:session-12-2/fig1-model)

### The machine as a function

```js
// client/src/lib/flow.js
export const FLOW = {
  idle: { edit: 'idle', send: 'pending' },
  pending: { success: 'saved', failure: 'error' },
  saved: { edit: 'idle' },
  error: { retry: 'pending', edit: 'idle' }
};

export function transition(state, event) {
  const next = FLOW[state] && FLOW[state][event];
  return next || state;
}
```

Read the table, not the function. `pending` accepts `success` and `failure` and nothing else, so a second `send` is `pending` again. `error` accepts `retry`, which goes back to `pending`, and `edit`, which goes back to `idle` because the user changed the draft and the old error no longer describes it. `saved` only accepts `edit`. There is no event that goes from `saved` to `pending` directly, so the user cannot resend a record they already saved by clicking the same button; they have to change something first.

The component keeps `status` in `useState('idle')` and calls `setStatus(transition(status, 'send'))` instead of `setStatus('pending')`. That one substitution is what makes the table enforceable. Grep the component for string literals of state names. If any remain outside the table, the machine has a back door.

### The component that obeys it

```jsx
import { useState } from 'react';
import { transition } from '../lib/flow';

export default function EntryForm(props) {
  const [draft, setDraft] = useState({ title: '', body: '' });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  function onEdit(field, value) {
    setDraft(function (current) { return Object.assign({}, current, { [field]: value }); });
    setStatus(function (current) { return transition(current, 'edit'); });
  }

  async function send() {
    const next = transition(status, 'send');
    if (next === status) return;
    setStatus(next);
    try {
      const saved = await props.onSave(draft);
      setStatus(function (current) { return transition(current, 'success'); });
      setMessage('Saved "' + saved.title + '"');
      setDraft({ title: '', body: '' });
    } catch (err) {
      setStatus(function (current) { return transition(current, 'failure'); });
      setMessage(err.message);
    }
  }

  function onFormSend(event) {
    event.preventDefault();
    if (status === 'error') {
      setStatus(function (current) { return transition(current, 'retry'); });
    }
    send();
  }

  return (
    <form onSubmit={onFormSend}>
      <input value={draft.title} onChange={function (e) { onEdit('title', e.target.value); }} aria-label="Title" />
      <textarea value={draft.body} onChange={function (e) { onEdit('body', e.target.value); }} aria-label="Body" />
      <button type="submit" disabled={status === 'pending'}>
        {status === 'pending' ? 'Saving' : 'Save'}
      </button>
      {status === 'error' ? <p role="alert">{message} Press Save to retry.</p> : null}
      {status === 'saved' ? <p role="status">{message}</p> : null}
    </form>
  );
}
```

`disabled` on the button is a courtesy. The `if (next === status) return;` line is the guarantee, and it holds even when the user presses Enter twice faster than React repaints. On `failure`, `draft` is untouched, so the paragraph of text the user typed is exactly where they left it. `props.onSave` is the parent's function, which calls the API and throws on a non-2xx, which is the next piece.

### The error body is a string

Every error body since 4-11 is `{ "error": "..." }`. The capstone's error handler stays in that shape, because the client reads `body.error` as a message and shows it.

```js
// api/app.js, mounted last
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = Number(err.status || err.statusCode) || 500;
  console.error(err.stack || err.message || err);
  res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message });
});
```

A 500 never leaks `err.message`, because a Mongoose cast error or a provider stack trace is not a sentence for a user. A 400 or 404 passes the message through, because you wrote it. The client wrapper throws with that string:

```js
// client/src/lib/api.js
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function request(path, options) {
  const token = sessionStorage.getItem('token');
  const res = await fetch(API + path, Object.assign({}, options, {
    headers: Object.assign(
      { 'Content-Type': 'application/json' },
      token ? { Authorization: 'Bearer ' + token } : {},
      (options && options.headers) || {}
    )
  }));
  if (res.status === 204) return null;
  const body = await res.json().catch(function () { return {}; });
  if (!res.ok) throw new Error(body.error || ('Request failed with ' + res.status));
  return body;
}
```

Keep the `sessionStorage` key your capstone already uses; the name here is illustrative. One wrapper, so a missing token and a 500 produce messages in the same place and the machine never sees a raw `TypeError`.

### An adapter with four fixtures

```js
// api/services/draft.js
const fs = require('node:fs');
const path = require('node:path');

async function fromFixture(name) {
  const file = path.join(__dirname, '..', 'fixtures', 'draft', name + '.json');
  if (name === 'unavailable') throw Object.assign(new Error('provider unavailable'), { status: 503 });
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function fromProvider(title) {
  const { callDraft } = require('./provider');
  return callDraft(title);
}

function normalize(raw) {
  if (!raw || typeof raw.summary !== 'string' || raw.summary.length === 0) {
    throw Object.assign(new Error('the assistant returned nothing usable'), { status: 502 });
  }
  return { summary: raw.summary.slice(0, 500) };
}

async function draftFor(title) {
  const mode = process.env.DRAFT_MODE || 'provider';
  const raw = mode === 'provider' ? await fromProvider(title) : await fromFixture(mode);
  return normalize(raw);
}

module.exports = { draftFor, normalize };
```

`fixtures/draft/normal.json` holds a real response you saved from 10-3. `empty.json` is `{ "summary": "" }`. `malformed.json` is `{ "text": 42 }`. `unavailable` is the thrown 503. `normalize` is the contract: whatever comes back, the route gets `{ summary }` or a thrown error with a status, and the component never learns the provider's field names. `DRAFT_MODE=normal` in `.env` lets you work on the screen with no key. The route calls `draftFor` and nothing else. The same shape wraps the Stripe session creation from 10-2 if you want it switchable; the webhook stays exactly as 10-2 built it, because its signature check is the thing being tested.

### Four widths, one layout

Open the dev tools device toolbar and walk the core flow at 375, 768, 1024, and 1440 pixels. Mobile first means the base rules are the 375 rules and each `@media (min-width: ...)` adds, never subtracts. Long titles wrap. Buttons stay reachable with a thumb. The navigation collapses under 768 if it has more than three links. The 1440 check is that nothing stretches to the window edge; a `max-width` on the main column with `margin: 0 auto` is enough. You learned the mechanism in 2-3; today you verify it on the screens the recording will show.

## The demonstration

One worked example, continuing the capstone from Sprint 1: the core flow is "create an entry and see it after reload," now with a Should-have, "ask the assistant for a draft summary," built as a full slice. Stop any other server with Ctrl-C first.

Start by walking the journey before changing anything, as the fixture account, on `localhost`, with the network panel open.

```bash
cd ~/projects/<capstone-name>/server
npm run seed
node --env-file=.env server.js
```

```text
seeded demo@example.com with 3 entries
listening on 3000
mongo connected
```

In a second terminal, the client:

```bash
cd ~/projects/<capstone-name>/client
npm run dev
```

```text
  VITE ready in 312 ms
  ➜  Local:   http://localhost:5173/
```

Sign in, create an entry, double-click the Save button on purpose. Two `POST /api/entries` rows in the network panel, two identical entries in the list. That is the bug the machine removes. Add `client/src/lib/flow.js` and rewrite the form as above. Repeat the double click: one request. Reload: one entry.

Now the failure path. Stop the server with Ctrl-C, type a title and body, press Save.

```text
Request failed with 0
```

That is `fetch` rejecting with a `TypeError` on a refused connection, which the wrapper turns into a message, which the machine turns into `error`. The draft is still in the fields. Start the server again, press Save, and the `retry` event moves through `pending` to `saved`. Write those three observations down; they are this session's evidence.

Then the adapter. Write `api/services/draft.js` and the four fixtures, mount the route, and run it by hand in each mode.

```bash
cd ~/projects/<capstone-name>/api
DRAFT_MODE=normal node --env-file=.env server.js
```

```bash
curl -s -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"title":"Scout the ridge"}' http://localhost:3000/api/entries/draft
```

```text
{"summary":"A short reconnaissance north of the camp, weather permitting."}
```

Restart with `DRAFT_MODE=malformed` and run the same curl:

```text
{"error":"the assistant returned nothing usable"}
```

And `DRAFT_MODE=unavailable`:

```text
{"error":"provider unavailable"}
```

Three modes, three bodies, one shape. The screen that calls this route shows the summary, or the error with a retry, and it was finished without the key being present. Set `DRAFT_MODE=provider` once at the end, with the key in `.env`, and run the normal curl one more time to prove the real path still works. That single manual check against the real provider is the one you keep; everything else is fixtures.

Here is a small model you can run here. It is the same `transition` table as `flow.js`, driven by sequences of events, plus the empty-versus-error rule for a list. It proves the table refuses a duplicate send and that failure always has a route back to pending. It does not click your button or hit your route; those are the two terminals you just used.

```js run=checkpoint-12-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const FLOW = {
  idle: { edit: 'idle', send: 'pending' },
  pending: { success: 'saved', failure: 'error' },
  saved: { edit: 'idle' },
  error: { retry: 'pending', edit: 'idle' }
};

function transition(state, event) {
  const next = FLOW[state] && FLOW[state][event];
  return next || state;
}

function run(events) {
  let state = 'idle';
  let requests = 0;
  events.forEach(function (event) {
    const next = transition(state, event);
    if (event === 'send' || event === 'retry') {
      if (next !== state) requests += 1;
    }
    state = next;
  });
  return { state: state, requests: requests };
}

const doubleClick = run(['edit', 'send', 'send', 'success']);
check(doubleClick.requests === 1, 'Duplicate submission does not start another transition');
check(doubleClick.state === 'saved', 'the first send still completes');

const recovered = run(['edit', 'send', 'failure', 'retry', 'success']);
check(recovered.requests === 2 && recovered.state === 'saved', 'Failure has a recovery route');

check(transition('saved', 'send') === 'saved', 'a saved record cannot be resent without an edit');
check(transition('error', 'edit') === 'idle', 'editing after an error clears the error state');

function listView(status, items) {
  if (status === 'loading') return 'loading';
  if (status === 'error') return 'error';
  return items.length === 0 ? 'empty' : 'list';
}
check(listView('ready', []) === 'empty' && listView('error', []) === 'error', 'empty and error are different screens');

const draft = { title: 'Scout', body: 'three hours' };
const afterFailure = Object.assign({}, draft);
check(afterFailure.title === draft.title && afterFailure.body === draft.body, 'the draft survives a failed save');

console.log('ok: checkpoint-12-2');
```

## Where it breaks

![](diagram:session-12-2/fig2-diagnosis)

### Features work only separately

Every screen works when you open it by URL, and the path from sign-in through the new Should-have breaks in the middle: the dashboard's button links to a route the new screen renamed, or the new screen expects a record the previous one no longer creates. The cause is testing parts and shipping a journey. After every feature, walk the whole path as the fixture account in a private window, from sign-in to the outcome, and write down the step that broke. A green test for the new route does not prove the previous page points at it. The journey is the test the user runs, so run it before you mark anything done.

### Optimistic UI loses data

The row appears, the request fails, and the paragraph the user typed is gone, because the component cleared the draft when it sent. The symptom is an angry user and a `500` in the server log with no corresponding record. The cause is updating the draft on `send` instead of on `success`. The fix is in the machine: `failure` touches `status` and `message` only. Clear the draft inside the `success` branch, after the response says the write landed, and never before. If you also showed the row optimistically, keep the previous list and restore it on failure, with the error visible beside the untouched draft.

### Provider dependency blocks progress

The AI key is not in this environment, or Stripe's test mode is having a bad hour, and the screen that depends on the response cannot be built or tested. The cause is a component that calls the provider's shape directly, so no provider means no screen. The fix is the adapter with its `_MODE` variable and four fixtures. Build the screen in `normal`, test the error branch in `unavailable`, test the validation in `malformed`, and keep one manual check against the real provider for when the key is present. A missing third party is a reason to stub that edge, not a reason to stop building the path the edge sits on.

## Your turn

In `~/projects/<capstone-name>`, with the server on 3000 and the client on 5173, nothing else running.

1. Walk the core flow as `demo@example.com` in a private window with the network panel open. Double-click the primary Save. Count the requests. If you see two, you have the bug the machine fixes; if you see one, write down what already prevents it.
2. Add `client/src/lib/flow.js` with the `FLOW` table and `transition`. Rewrite the core flow's form so every `setStatus` goes through `transition`. Grep the component for `'pending'` and `'saved'`; the only hits are inside comparisons, never inside a `setStatus` call.
3. Stop the server, press Save with a filled form, read the message, confirm the draft is still there. Start the server, press Save again, confirm `saved`. The two messages, in order, go in your notes.
4. Pick the Should-haves that survived the Sprint 1 cut. For each one, build the five parts of the slice and the four checks: reach, perform, understand, recover. Mark it done in `docs/sprint-plan.md` only after the private-window walk includes it.
5. Move your AI call, the one `api/lib/ai.js` makes for 10-3's route, and your Stripe session creation from `api/lib/stripe.js` if you want it switchable, behind `api/services/<name>.js` with `normalize` and a `<NAME>_MODE` variable. The `lib/` files stay as the clients; the service is what the route calls. Add `fixtures/<name>/normal.json`, `empty.json`, `malformed.json`. Run the route in all four modes with curl and paste the four bodies into your notes.
6. Make every list screen distinguish `loading`, `error`, and `ready` with an empty branch computed during render. The empty sentence says what to do next. The error sentence has a retry.
7. Open the device toolbar at 375, 768, 1024, and 1440 and walk the core flow at each width. Fix what wraps wrong or stretches. Screenshot the core screen at 375 and 1440.

If a `send` while `pending` still fires a request, the guard is after the `setStatus` instead of before it, or a second button outside the form calls the API directly. Find the second caller.

## The quest

![](diagram:session-12-2/fig3-evidence)

The deliverable is the Sprint 2 section of `docs/sprint-plan.md`: every surviving Should-have marked done with the step where you walked it, and a short "Recovery evidence" subsection that records the three observations from the failure walk and the four adapter bodies.

Evidence to keep:

- `client/src/lib/flow.js` and the rewritten core-flow form, with no `setStatus` outside the table.
- `api/services/<name>.js`, the three fixture files, and the four curl bodies pasted under "Recovery evidence" as a `text` block.
- `docs/evidence/12-2-375.png` and `docs/evidence/12-2-1440.png` of the core screen at both widths.
- `docs/evidence/12-2-failure.png` showing the error message beside the untouched draft.
- The Sprint 2 rows in `docs/sprint-plan.md`, each with the private-window walk noted.
- A commit per feature, named for the story: `sprint 2: S1 assistant draft behind adapter`.

If your capstone already uses React Router for its pages or a Context for the signed-in user, keep them; the machine lives inside the form component and does not care how the page was reached. If it uses neither, do not add them this week. The core flow does not need a router to be finished.

## Side quests

The adapter you wrote is the Adapter pattern with its name on, the `FLOW` table is the State pattern reduced to a lookup, and the REST-versus-GraphQL-versus-gRPC sheet is the longer answer to why your route returns `{ summary }` and not the provider's payload.

## Before next session

Sprint 3 does not add a feature. It freezes a commit, runs the whole test tree against that exact commit, tries to break the ownership rules with a second account, takes a backup and restores it somewhere disposable, and redeploys with the Railway path from 10-4, or the VPS from 6-4 if that is where yours lives. There is no test command to run before then: the capstone has no test runner yet, and 12-3's first hour installs Jest, Supertest, and Playwright the way [7-2](/path/7-2-dungeon-trials/) and [7-3](/path/7-3-the-gauntlet/) did for the hall. Reread those two sessions once so the files are familiar when you copy their shape. Install the MongoDB Database Tools from the [official installation page](https://www.mongodb.com/docs/database-tools/installation/installation/) for your operating system so `mongodump --version` prints a version; 12-3 uses it in the first hour.

Nothing stays running. Stop both terminals with Ctrl-C. The deployed URL is still the commit from 10-4, and that is fine until Saturday.
