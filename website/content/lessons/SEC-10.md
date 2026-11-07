## The idea

Picture a vending machine whose coin reader jams. A sensible machine stops and lights the lamp that says to try again. If the spiral sticks halfway, it lets go of the bag. Tomorrow the machine still has snacks and a working reader.

That careful stop is how you handle exceptional conditions. Mishandling of Exceptional Conditions is the other ending: an error, a timeout, or a missing value turns a control off. The system fails open, tells the visitor too much, hangs, or leaves a mess. Design the failure with the same care as the success. If the policy lookup throws, or the value is the wrong shape, deny. One handler chooses the words a client may see, and the log keeps the detail with a request id. Return anything you borrowed inside `finally`. Time out calls to other machines. Retry a few times, with backoff and jitter, and only for errors you marked retryable. Log an unhandled rejection and shut the process down.

Failure looks like the machine emptying the rack because it got confused. The catch returns allowed when policy is down, so an outage makes every caller an admin. An empty catch hides the error and continues. The client receives a stack or a filesystem path. A connection returns to the pool only on success, so errors drain it. A fetch with no deadline waits forever. A retry with no ceiling hammers the next service. A missing permission list becomes allow.

## Why it matters

A bug on the happy path annoys one person. A bug on the exceptional path changes a security decision, draws a map for the client, or takes the service down. The 2025 name is Mishandling of Exceptional Conditions, and the incidents live in the catch.

Fail-open turns a broken check into a yes. A leaky error teaches hostnames and queries to anyone who can trigger it. A connection that never returns becomes an outage once the pool hits zero. A retry with no ceiling supplies the traffic that knocks the next service over.

Put the deny in the catch, and check that the user and the action are present. Build one response: a status, a safe sentence, a request id. Log the stack on the server. Release every borrow in `finally`. Abort a stalled call. Retry a handful of times with backoff and jitter, and skip the retry when the error is the caller's fault. Leave the runtime's crash on an unhandled rejection in place.

## A small example

```javascript
async function authorize(user, action, lookup) {
  try {
    if (!user || typeof action !== 'string') return false;
    const perms = await lookup(user);
    if (!Array.isArray(perms)) return false;
    return perms.includes(action);
  } catch {
    return false;
  }
}

async function demo() {
  const allowed = await authorize({ id: 1 }, 'read', async () => ['read']);
  const denied = await authorize({ id: 1 }, 'read', async () => {
    throw new Error('policy down');
  });
  return { allowed, denied };
}

demo();
```

When the lookup returns `['read']`, the answer is true. When the lookup throws, the catch answers false. A missing user, a bad action, or a policy value that is not a list takes the same deny.

## What the code below is doing

Six sections, then a driver that runs them.

Fail closed is `authorize`. A missing user, a non-string action, a thrown lookup, or a value that is not an array returns false. A real list is tested with `includes`. The driver expects true only for a granted read.

Safe responses are `AppError` and `toResponse`. An `AppError` may show its own message. Every other error becomes status 500 and "Internal Server Error." The logger keeps the request id and the stack. A connection address stays in the log and stays out of the JSON. A 404 returns "Order not found."

Cleanup is `withConn`. It acquires, runs your function, and releases in `finally`. After a success and a throw, `pool.inUse` is 0.

Timeouts are `withTimeout`. An `AbortController` rejects when the timer fires, and `finally` clears the timer. A fast promise resolves. A promise that never settles rejects.

Retries are `withRetry`. The loop stops at `attempts`, and sooner when `isRetryable` says no. The pause grows, with jitter, under a cap. The driver shows a flaky call that succeeds on the third try, a failure that stops at the cap, and a client error that runs once.

The process note is for the entrypoint: log an unhandled rejection or uncaught exception and shut down. Keep the crash-on-unhandled-rejection behavior. Set request and header timeouts. Put a circuit breaker in front of a dependency that is already failing.

When you talk about it, say this: on the error path, deny, clean up, cap the retries, time out, and tell the client nothing useful.
