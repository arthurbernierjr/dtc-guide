## The idea

A Promise is the ticket they hand you at a restaurant. You do not hold the food yet. The ticket is pending. Eventually the kitchen resolves it with your plate, or rejects it with a sorry-we're-out. `then` is what you do when the plate arrives. `catch` is what you do with the sorry. `finally` buses the table either way.

An `async` function always hands you a ticket, even when the body returns a plain number. `await` means you stand at this table until this ticket settles, then keep going inside this function. The rest of the program keeps seating other tables. `await` pauses the function, not the whole kitchen.

JavaScript is one cook, plus a board of tickets. Synchronous code is the sentence the cook is already saying. It finishes first. Then come the sticky notes, the microtask queue. In Node, `process.nextTick` runs, then promise reactions and `queueMicrotask`. Then one macrotask, such as a `setTimeout`. The sheet records sync, nextTick, micro, timeout.

Combinators wait on a group of tickets. `Promise.all` holds the table until every plate is up, and one rejection sends the whole order back. That is fail-fast. A non-promise in the list passes through as itself. `Promise.allSettled` never rejects the group. Each ticket comes back `fulfilled` or `rejected`, with a value or a reason. `Promise.race` settles with whichever ticket finishes first, food or sorry. `Promise.any` wants the first success. If every ticket rejects, you get an AggregateError.

## Why it matters

The trap is waiting in the wrong place. `await` inside a `for...of` is one course after another. Three 10ms tickets take about 30ms. `Promise.all` on a `map` fires them together, about 10ms. `arr.forEach(async x => await f(x))` does not wait. The loop ends, the calls run as fire-and-forget, and the next line has already moved on. Use `for...of` for a sequence. Use `Promise.all` when the work may overlap.

A concurrency limit is a stove with N burners. `mapLimit` starts that many workers. Each one grabs the next index, awaits, and grabs another. The sheet's peak in-flight count stays at 2.

`try/catch` catches a rejection you `await`ed. The same `try` around a bare call does not, and that rejection goes unhandled. Forgetting `return` inside a `.then` hands the next ticket `undefined`. Returning a promise unwraps it. Retry asks the kitchen again, waiting `baseMs * factor ** attempt` times a random half-to-one factor so a crowd does not retry on the same instant. That factor is jitter. A timeout is a second ticket that rejects, raced against the real one. `AbortController` cancels with the reason you passed to `abort`.

Say microtask queue, fail-fast, sequential versus concurrent, a concurrency pool, backoff with jitter, an idempotent retry, and AbortController.

## A small example

```javascript
const ticket = (value, ms) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });

async function lunch() {
  const first = await ticket('soup', 5);
  const both = await Promise.all([
    ticket('soup', 5),
    ticket('bread', 5),
  ]);
  return [first, both[0], both[1]];
}

const order = lunch();
```

`order` is a ticket for `['soup', 'soup', 'bread']`. `first` is one course, waited on alone. `both` is two tickets fired together. The function still returns a Promise, not the array itself.

## What the code below is doing

`tick` and `fail` are tickets that settle on a timer. The body is one async function so the checks can `await`.

Event-loop order schedules a timeout, a promise `then`, and `process.nextTick`, pushes `'sync'` immediately, then waits. The list is sync, nextTick, micro, timeout.

`Promise.all` accepts a plain `3`. One failing ticket rejects the whole `all`. `allSettled` reports fulfilled then rejected, and the reason message is `'x'`. `race` returns `'fast'`. `any` returns `'ok'` when one side fails, and rejects with AggregateError when both fail.

Three awaits in a loop take longer than one `Promise.all` of the same three delays. The comment names the `forEach(async ...)` trap: it does not wait.

`mapLimit` runs five doubling jobs with a limit of 2. The output is `[2, 4, 6, 8, 10]`, and the peak in flight is 2.

`mayThrow` returns `'fine'` or throws `'nope'`. `await` inside `try` catches it. `.catch` on the call turns it into `'caught nope'`. A `.then` with a second function takes the rejection path. `finally` still runs after a fulfilled tick. The other trap is in the comment: `try { mayThrow(true) }` without `await` does not catch.

Retry loops up to `attempts`. Each failure waits a jittered backoff, then the last error is thrown if nothing succeeded. A flaky function works on the third try. An always-throwing one still rejects.

`withTimeout` races the real ticket against a rejecting timer and clears that timer in `finally`. The fast value wins. The slow one loses to `'timeout'`. An `AbortController` listener clears its timer and rejects with the abort reason. `fetch` and `AbortSignal.timeout` use that same signal.

A callback API is wrapped so an error rejects and a value resolves. A deferred is `{ promise, resolve }`. Node 22 and later has `Promise.withResolvers`. The sheet falls back to building the pair by hand, resolves `7`, and awaits it.

A `.then` that computes `v + 1` and does not return it yields `undefined`. A `.then` that returns a promise flattens to `2`. An async function that returns `1` is still a Promise.

An async generator yields pages 1, 2, and 3. `for await` collects `[1, 2, 3]`.
