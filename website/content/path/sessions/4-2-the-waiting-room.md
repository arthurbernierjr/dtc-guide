---
editorial: true
title: The Waiting Room
subtitle: Promises, await, and the three ways a request ends
hook: "A request leaves your process and nothing comes back for a while. Today you learn what a promise is, how await waits on one, and how to tell a server that said no from a server that never answered."
read: 50
artifact: "A client.js in guild-door that calls the server with fetch and prints one answer, one refusal, and one silence, with the three transcripts kept in NOTES.md"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  - https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  - https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
  - https://nodejs.org/api/globals.html#fetch
say:
  - "A promise is pending until it settles, and it settles once: fulfilled or rejected."
  - "await means wait here for this promise, then continue with its value or throw its reason."
  - "A 404 is a response that said no. A rejected fetch is no response at all."
---

## The hook

[Last session](/path/4-1-the-runtime-beyond-the-browser/) you started a process that listens on port 3000 and answers `GET /` with a sentence. You knocked on it with curl. Curl is a separate program, so the waiting happened outside your code. Today the knock comes from JavaScript. A second file in the same folder, `client.js`, asks the server for `/` with `fetch`, and between the asking and the answer there is a gap your program has to live through. The thing that fills that gap is a promise. The keyword that lets you wait on it without your whole program going blind is `await`.

By the end of the session you can watch one request end three different ways, in order, in your own terminal. The server answers 200 and you print the body. The server answers 404 and you print that it said no. The server is stopped and `fetch` throws, and you catch it and print that nothing came back. Those are not three bugs. They are the three endings every request you write for the rest of this unit can have, and one short pattern handles all three. The database calls in [the vault](/path/4-5-the-vault/), the routes in [the listening door](/path/4-3-the-listening-door/), and the form in [the quest slate](/path/4-12-the-quest-slate/) all reuse it.

> *You hand the courier a letter and the courier leaves. You hold a ticket with nothing written on it yet. The ticket is the promise.*

## The idea

Node runs your JavaScript on one thread. You met that sentence last session. A network request takes milliseconds, sometimes seconds, and your thread cannot stand still for it, so the request is handed to the operating system and your function keeps going. The question is what your function holds in its hand while the answer is in transit. The answer is a promise. [The Promise reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) calls it an object that represents the eventual completion or failure of an asynchronous operation and its resulting value. Read that as a receipt. The work is not done. The receipt is real now, and it will be stamped later.

A promise is in one of three states. It starts **pending**. Later it **settles**, and settling goes one of two ways: **fulfilled** with a value, or **rejected** with a reason. The reason is usually an `Error`. A promise settles once. It cannot be fulfilled and then rejected, and it cannot be fulfilled twice. Once it has settled, anyone who asks it later gets the same answer. This is the part people skip, and it is the part that makes the rest make sense. You are not polling. You are not re-running the request. You are holding one object that will change state exactly one time.

`fetch(url)` returns a promise immediately. Nothing has gone over the network when that line finishes. If you print the return value you see `Promise { <pending> }`, and that print is correct, not broken. The promise is fulfilled when the server's status line and headers have arrived. It is fulfilled with a `Response` object. It is rejected only when no response could be obtained at all: the connection was refused, the host name did not resolve, the network dropped. [Using Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) says this in one sentence that is worth copying by hand: the promise does not reject on HTTP errors. A 404 is an HTTP error. It is a complete, well-formed answer whose status happens to be 404. The promise is fulfilled. Whether the server said yes is a second question, and the `Response` answers it through [`response.ok`](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok), which is `true` for any status from 200 through 299 and `false` otherwise.

### `await`, and the function it lives in

`await` is how you read the receipt without writing a callback. [The await reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) describes it as pausing the function until the promise settles. Say it the way you would say it to a friend: wait here, then continue. If the promise is fulfilled, `await` gives you the value, and the next line runs with it. If the promise is rejected, `await` throws the reason at that line, as if you had written `throw` yourself. That is why `try` and `catch` work on an awaited promise. The `catch` is catching a throw that `await` performed on your behalf.

The pause is local. While your function is paused at an `await`, the thread is free. Other callbacks run. A server keeps answering other clients. When the promise settles, your function is queued to continue from the line after the `await`, with the value in hand. The event loop from last session is doing the delivery. You did not write a callback, but a callback is what the runtime registered for you.

You can only write `await` inside a function marked `async`. [The async function reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) gives the other half of the contract: an `async` function always returns a promise. `return 'saved'` from an async function hands the caller a promise that is fulfilled with `'saved'`. A `throw` inside it, or a rejected `await` you did not catch, hands the caller a promise that is rejected. The caller then has the same choice you had: `await` it inside another async function, attach `.then` and `.catch`, or ignore it. Ignoring a promise that rejects is the crash you will meet in Where it breaks. A promise is not an exception you can leave on the floor.

`.then` is the older spelling of the same wait. `fetch(url).then(function (response) { ... })` registers a function to run when the promise fulfills. `.catch(function (err) { ... })` registers one for the rejection. You will see that spelling in the React session's effect, because an effect's body cannot be `async`. The meaning is identical. `await` is `.then` with the continuation written on the next line instead of inside a function. Pick `await` wherever you are allowed to, because the `try/catch` reads like the rest of your code.

### Two failures that look the same from the chair

Here is the distinction the rest of the unit depends on, and it is the one most tutorials blur. When a request goes wrong, there are two completely different shapes.

The first shape: a response arrived, and it says no. The status is 404 because the path does not exist, or 400 because the body was wrong, or 500 because the server threw. The promise from `fetch` is **fulfilled**. `await fetch(url)` returns normally. Your `catch` does not run, because nothing was thrown. The signal is `response.ok === false`. You check it with an `if`. The server is alive, reachable, and disagreeing with you. That is useful information, and it comes with a status code that tells you which kind of disagreement.

The second shape: no response at all. The server process is stopped, or you typed the port wrong, or the machine is off the network. There is no status, because there is no status line. The promise from `fetch` is **rejected**, with a `TypeError` whose message in Node is `fetch failed`. `await fetch(url)` throws. Your `catch` runs. `response` is still `undefined`, because the assignment on the right of `await` never completed. If you reach for `response.ok` here you get a second error on top of the first.

The two shapes need two different tools. `try/catch` handles the second. An `if` on `response.ok` handles the first. A `try/catch` around the whole thing does not make the `if` unnecessary, and the `if` does not make the `try` unnecessary. The handling that covers both looks like this, and you will write it by hand before the session ends.

```js
// fragment
let response;
try {
  response = await fetch(url);
} catch (err) {
  // no response: the server is stopped or the address is wrong
  return 'not saved (no response)';
}
if (!response.ok) {
  // a response arrived and said no
  return 'not saved (' + response.status + ')';
}
return 'saved';
```

The `return` inside the `catch` is not decoration. It is what keeps the `if` from reading `.ok` off `undefined`. If you prefer not to return early, set `response` to a stand-in object inside the `catch` instead. Either way, the line after the `catch` must be safe to run whether or not the `catch` ran.

What you should be able to draw on a napkin: `fetch` returns a promise at once, in the pending state. The promise settles once. Fulfilled means a `Response` arrived, and `response.ok` says whether it was a yes. Rejected means nothing arrived, and `await` throws it into your `catch`. `await` only lives inside `async`, and an `async` function hands its caller a promise of its own.

![](diagram:session-4-2/fig1-model)

### Why this comes before the router

Next session every route handler you write is `async`, and Express forwards a rejected handler to the error handler for you. That sentence is only useful if you can see the promise it is talking about. The session after that, `await client.connect()` is the first line that can hang your startup. Later, a React form waits for a 2xx before it tells the person the row is saved. All of those are the same pattern with different nouns: one `try`, one `if`, one `return`. Today the noun is a request to your own door, and the server is a thing you can stop with Ctrl-C so the third ending is one keystroke away. You will never again have a failure this easy to produce on purpose, so produce it on purpose now.

## The demonstration

One folder, the one from last session, `~/projects/guild-door`. `server.js` is unchanged. You add one file beside it. Node 24 ships `fetch` as a global, documented on the [Node globals page](https://nodejs.org/api/globals.html#fetch), so there is nothing to install.

Write `client.js`:

```js
const url = process.argv[2] || 'http://localhost:3000/';

async function load(url) {
  console.log('pending: ' + url);
  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    console.log('no response: ' + err.message);
    return 'no response';
  }
  if (!response.ok) {
    console.log('said no: ' + response.status);
    return 'said no (' + response.status + ')';
  }
  const body = await response.text();
  console.log('answered: ' + response.status + ' ' + body);
  return 'ok';
}

load(url).then(function (result) {
  console.log('result: ' + result);
});
```

Read it top to bottom before you run it. `process.argv[2]` is the first word after the file name on the command line, so you can point the client at a different path without editing the file. `load` is `async`, which is what lets the `await` on line seven exist. The first `console.log` runs before anything leaves the machine. That line is your pending marker. The `try` wraps only the `await fetch`, because that is the only line that can throw for the no-response case. `response.text()` is a second promise, because the body can arrive after the headers, so it has its own `await`. The last three lines are the caller. `load` returns a promise, and `.then` is how a plain script, which is not an `async` function, reads it.

Three runs. Write your prediction down before each one, in `NOTES.md` in the same folder, as one line. Then run, and put the real lines under the prediction.

**Run one: the server answers.** Prediction first. Which line prints first, `pending` or `answered`? What status do you expect, and what body? Start the server in one terminal:

```bash
cd ~/projects/guild-door
node server.js
```

It prints `listening on 3000`. In a second terminal:

```bash
cd ~/projects/guild-door
node client.js
```

You see three lines, in this order:

```text
pending: http://localhost:3000/
answered: 200 The door is open.
result: ok
```

`pending` printed first because it ran before the `await`. `answered` printed when the promise fulfilled and the body promise fulfilled after it. `result: ok` printed last, from the `.then`, after `load` returned. If your `GET /` sends your name and Node version from last session's quest, the body is that string instead of the sentence. Fine. The status is still 200.

**Run two: the server says no.** Prediction: the server is still running. You ask for a path it does not have. Does `catch` run? What is `response.ok`? Which line prints, `said no` or `no response`? Leave the server running and, in the second terminal:

```bash
node client.js http://localhost:3000/nope
```

```text
pending: http://localhost:3000/nope
said no: 404
result: said no (404)
```

The promise was fulfilled. The `catch` did not run. The `Response` has status 404 and `ok` is `false`, so the `if` took over. Look at the server's terminal. Express logged nothing, because last session's server has no logger yet, but it did answer: 404 is Express's built-in reply when no route matches. You can confirm with `curl -i http://localhost:3000/nope` and read the status line. The server is alive and disagreeing with you.

**Run three: no server.** Prediction: you stop the server. Does `pending` still print? Does `said no` print? What does `err.message` say? In the first terminal, press Ctrl-C. The prompt comes back. In the second terminal:

```bash
node client.js
```

```text
pending: http://localhost:3000/
no response: fetch failed
result: no response
```

`pending` still printed, because the request had not been attempted yet. Then `fetch` tried to connect, the operating system refused, and the promise rejected with a `TypeError` whose message is `fetch failed`. `await` threw it. The `catch` ran. The `if` never ran, because the function returned from inside the `catch`. There is no status. There was never a status line to read. If you want the underlying reason, `err.cause` carries it, and its `code` is `ECONNREFUSED`, which reads as connection refused. Compare it with the curl line you wrote down in 4.1 step 5. Curl spells the same refusal as `Failed to connect to localhost port 3000 ... Connection refused`, or `Couldn't connect to server` on newer curl. Same refusal, two spellings: curl never prints the token `ECONNREFUSED`, and Node never prints curl's sentence.

### The timeline, side by side

| Run | What you typed | First line | Second line | Third line | How the promise settled |
|---|---|---|---|---|---|
| One | `node client.js` with the server up | `pending: http://localhost:3000/` | `answered: 200 The door is open.` | `result: ok` | fulfilled, `ok` true |
| Two | `node client.js http://localhost:3000/nope` | `pending: http://localhost:3000/nope` | `said no: 404` | `result: said no (404)` | fulfilled, `ok` false |
| Three | `node client.js` after Ctrl-C on the server | `pending: http://localhost:3000/` | `no response: fetch failed` | `result: no response` | rejected, `catch` ran |

Three things to notice across the rows. The first line is identical in shape every time, because the pending state does not know how the story ends. The second line is the only one that differs, and it comes from two different places: the `if` in rows one and two, the `catch` in row three. The third line is always last, because `.then` cannot run until `load` has returned, and `load` cannot return until its `await` has settled. If you ever see `result:` above the second line, the function did not wait, and that is the first diagnosis below.

### A small model you can run here

The page cannot start your server or reach your port, so the checkpoint below replaces `fetch` with three fake versions: one that resolves to `{ ok: true, status: 200 }`, one that resolves to `{ ok: false, status: 404 }`, and one that rejects with `TypeError('fetch failed')`. It runs the same handling against each, with the words the form in 4.12 will put on its notice, and it checks the order of a pending and settled log.

```js run=checkpoint-4-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const log = [];

async function load(fetchLike) {
  log.push('pending');
  let response;
  try {
    response = await fetchLike();
  } catch (err) {
    log.push('settled: rejected ' + err.message);
    return 'not saved (no response)';
  }
  log.push('settled: fulfilled ' + response.status);
  if (!response.ok) {
    return 'not saved (' + response.status + ')';
  }
  return 'saved';
}

function answers(status) {
  return function () {
    return Promise.resolve({ ok: status >= 200 && status < 300, status: status });
  };
}

function noServer() {
  return Promise.reject(new TypeError('fetch failed'));
}

const yes = await load(answers(200));
check(yes === 'saved', 'a 200 response is saved');

const no = await load(answers(404));
check(no === 'not saved (404)', 'a 404 arrived, said no, and was not a rejection');

const silence = await load(noServer);
check(silence === 'not saved (no response)', 'a rejected fetch is caught as no response');

check(log.length === 6, 'each call logged once pending and once settled');
check(log[0] === 'pending' && log[1] === 'settled: fulfilled 200', 'pending is logged before the promise settles');
check(log[3] === 'settled: fulfilled 404', 'the 404 settled as fulfilled, not rejected');
check(log[5] === 'settled: rejected fetch failed', 'the no-response case settled as rejected with the TypeError message');

const held = load(answers(200));
check(held instanceof Promise, 'calling an async function without await hands you a promise');
check(log.length === 7 && log[6] === 'pending', 'the pending line already ran, the settled line has not');
await held;
check(log.length === 8, 'after await, the settled line has run');

console.log('ok: checkpoint-4-2');
```

What it proves: the shape of the handling. One `try` for the rejection, one `if` for the refusal, one `return` on the far side for the yes, and the pending line always ahead of the settled line. It also proves that an async function called without `await` gives you a promise and not a result. What it does not prove: that your server is running, that port 3000 is the right port, or that `fetch` in your Node behaves the way the fake does. The three runs in your terminal are the demonstration. The model only checks that you can say what each run showed. One more thing to notice: the block uses `await` at its top level, outside any function. That works because the run box wraps the block in an `async` function before it runs it, and it would also work in a Node 24 ES module. In a plain CommonJS script like `client.js` the same line is the third diagnosis below, which is why `client.js` reads its result with `.then` instead.

## Where it breaks

![](diagram:session-4-2/fig2-diagnosis)

### Forgot the `await`

The symptom is `Promise { <pending> }` printed where a status or a body should be, or `undefined` read off a value that looks right in the editor. The cause is a line like `const response = fetch(url)` with no `await`, so `response` is the receipt, not the `Response`. `response.ok` on a promise is `undefined`, `!undefined` is `true`, and your code reports every request as a refusal while the server is answering 200. The second version of the same bug is calling `load(url)` from the bottom of a file and printing its return value, which is also a promise, because `load` is `async`.

Put `await` in front of the call that returns a promise, inside an `async` function. At the bottom of a plain script, where there is no enclosing `async` function, use `.then` the way `client.js` does, or wrap the call in an `async function main()` and call `main()`. A quick test: print the value and read the first word. If it says `Promise`, you are holding the receipt.

### An unhandled rejection

The symptom is a stack trace that begins `TypeError: fetch failed`, a `[cause]` block mentioning `ECONNREFUSED`, and then `Node.js v24` and your prompt. The process exited with code 1. The cause is a promise that rejected with nobody listening: an `await fetch` with no `try` around it inside a function nobody caught, or a `load(url)` called without `.catch` and without `await`. Node treats an unhandled rejection as fatal. It does not print a warning and carry on. It prints the error and exits.

Catch it where you can say what to do about it. In `client.js` that is the `try/catch` around the `await fetch`, which turns a dead process into a `no response` line and a normal exit. Next session Express catches the rejection from an `async` route for you and hands it to your error handler. The rule does not change: somebody has to be holding the promise when it rejects. If you are testing this on purpose, delete the `try` and `catch` lines from `client.js`, stop the server, run the client, and read the whole trace once. Then put them back.

### `await` outside `async`

The symptom is `SyntaxError: await is only valid in async functions and the top level bodies of modules`, printed before a single line of your program runs, with a caret under the word `await`. The cause is a function that contains `await` but is not declared `async`, usually because you copied the body of an `async` function into a plain one, or you wrote `await` at the top of a CommonJS file. Nothing executed. The parser refused the file.

Add `async` before `function` on the function that contains the `await`. If the `await` is at the top level of a file that uses `require`, move it into an `async function main()` and call `main()`, or put the continuation in a `.then`. Do not reach for `"type": "module"` just to make a top-level `await` compile today. Last session chose CommonJS for this unit, and a mixed module system is a different afternoon of errors.

## Your turn

Make the three endings yours, in `~/projects/guild-door`. The server is last session's `server.js`, unchanged. Write every prediction before its run.

1. Create `client.js` with the file from the demonstration. Run `node --check client.js`. It prints nothing. A syntax error here prints the third diagnosis with a caret; fix it before you start a server.
2. Start the server in terminal one with `node server.js` and confirm the line `listening on 3000`.
3. In terminal two, write your prediction for run one in `NOTES.md`, then run `node client.js`. The second line is `answered: 200` followed by your `GET /` body. The third line is `result: ok`.
4. Write your prediction for run two, then run `node client.js http://localhost:3000/nope`. The second line is `said no: 404`. The third line is `result: said no (404)`. Confirm with `curl -i http://localhost:3000/nope` that the status line is `HTTP/1.1 404 Not Found`.
5. Watch the same `if` take the other branch. 4.1 step 3 already added `GET /health` to `server.js`, so `node client.js http://localhost:3000/health` prints `answered: 200 ok` on the second line, where `/nope` printed `said no: 404`. Now turn a 404 into a 200 yourself. Run `node client.js http://localhost:3000/ping` and read `said no: 404`. Add `app.get('/ping', (req, res) => { res.send('pong'); });` to `server.js`, restart the server with Ctrl-C and `node server.js`, run the same command again, and watch the second line change to `answered: 200 pong`. Same client, same `if`, different answer.
6. Write your prediction for run three. Press Ctrl-C in terminal one. In terminal two run `node client.js`. The second line is `no response: fetch failed`. The third line is `result: no response`.
7. Break it once on purpose. Delete the `try`, the `catch` block, and the braces around the `await`, so the line reads `response = await fetch(url);` on its own. With the server still stopped, run `node client.js`. The output is a stack trace beginning `TypeError: fetch failed` and ending `Node.js v24`, and `echo $?` prints `1`. Put the `try/catch` back. Run again and confirm `result: no response` and `echo $?` printing `0`.
8. Break it a second way. Remove `async` from `function load`. Run `node --check client.js`. Read the `SyntaxError` and the caret. Put `async` back.
9. Break it a third way. Change `response = await fetch(url);` to `response = fetch(url);`, start the server, and run `node client.js`. The second line is `said no: undefined`, because `response.ok` on a promise is `undefined`. Put the `await` back and stop the server.

If `node client.js` prints nothing at all and returns to the prompt, the `.then` at the bottom is missing or `load` is never called. If it prints `pending` and hangs for a long time, the address points at a machine that drops packets instead of refusing them; check the host and port in the URL.

## The quest

![](diagram:session-4-2/fig3-evidence)

The deliverable is `client.js` committed in `~/projects/guild-door` beside `server.js`, with `NOTES.md` in the same folder holding the evidence. `NOTES.md` is one page, in this order:

- The three transcripts, each one your prediction line followed by the three real lines, pasted exactly, headed `Run one: answered`, `Run two: said no`, `Run three: no response`.
- The pattern from The idea, the `try`, the `if`, and the `return`, written by hand from memory, not pasted. Write it out and then compare it with the fragment in The idea.
- Under the pattern, two sentences in your own words: which of the two failures the `try` is for, and which the `if` is for.
- One line naming the three outcomes a request can have and the state of the promise in each: fulfilled with `ok` true, fulfilled with `ok` false, rejected.
- The exact first line of the stack trace from step seven, and the exact `SyntaxError` line from step eight.

Commit `client.js` and `NOTES.md`. `node_modules` stays out, the same `.gitignore` as before. Push to the `guild-door` repository you created last session. If you kept `RUNTIME.md` from 4.1, leave it. `NOTES.md` is the ledger for this session and the next ones; 4.3 adds `STACK.md` beside it.

## Side quests

The promise sheet is the full set of combinators and traps behind today's one pattern, and the grit essay is for the evening you run the client a fourth time and it still says `fetch failed`, because the server you forgot to start is the most common bug in this unit and it is not a sign of anything.

## Before next session

[Next session](/path/4-3-the-listening-door/) replaces `server.js` with a stack: a logger, `express.json()`, a router mounted at `/quests`, a 404 middleware, and a four-argument error handler. One of its routes is an `async` function that throws on purpose, and Express forwards that rejection to the error handler for you. You now know what that sentence means. The route returns a promise because it is `async`. The promise rejects because the function threw. Express is the one holding the promise, so Express is the one whose `catch` runs. The route you write by hand with `Promise.reject` and no `return` is the unhandled rejection from today's second diagnosis, moved inside a server. Read the asynchronous section of [the Express error-handling guide](https://expressjs.com/en/guide/error-handling.html) once before you sit down, with today's three transcripts beside it.

Stop the server with Ctrl-C if it is still up. Nothing stays running between sessions. `~/projects/guild-door` now holds `server.js`, `client.js`, `NOTES.md`, the manifest, and the lockfile. 4.3 starts by replacing `server.js` in that same folder; `client.js` stays where it is and still works against the new stack, because `GET /` still answers and `/nope` is still a 404, and the third run is still one Ctrl-C away.
