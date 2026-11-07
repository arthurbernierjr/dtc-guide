## The idea

Picture a hall pass scribbled on a sticky note. You can photocopy it. Nothing on it says when it dies. Ask the office about a stranger and the answer changes: "no student by that name" for one, "wrong birthday" for another. That difference is how you learn who goes to the school. The pass was supposed to mean a person. It means a piece of paper.

That is an Authentication Failure. The program is weak at proving who someone is, or weak at the session after a yes. Count login tries for the account and the address, and grow the wait after a few free failures. Judge a password by length, and reject breached passwords. On login, throw the old session id away and mint a new one with `crypto.randomBytes`. End the session on idle time and again at an absolute deadline. Mark the cookie `HttpOnly`, `Secure`, and `SameSite`, under the `__Host-` prefix. Store a reset token as a hash of 32 random bytes, use it once, expire it quickly, and compare with `timingSafeEqual`. Show one sentence whether or not the account exists.

Failure looks like the sticky note. Guesses are unlimited, so a list of passwords from somewhere else can be replayed all night. The session id stays the same from the anonymous visit through login, and a planted id becomes the person's id. The token is the clock. Script on the page can read the cookie. The reset token sits in the database in the clear, works more than once, or still works next week. The error text tells a stranger which emails are registered.

## Why it matters

The front door draws scripts and careful tries. On the 2025 OWASP list the name is Authentication Failures. The damage is someone else's account, or a session that outlives the visit. Stuffing replays passwords from other breaches. Fixation reuses an id you forgot to rotate. A reset link that lives too long is a second password sitting in a mailbox.

Count failures, then back off. Check a breach list, and let length carry the password rule. Add a second factor when you can, and limit guesses of that code. Rotate the session at login and when privileges change. Set idle and absolute timeouts. Keep the cookie unreadable to script and limited to HTTPS. Hash reset tokens, mark them used, expire them in minutes, and compare in constant time. Use one sentence, and the same timing, for every reset response.

## A small example

```javascript
const crypto = require('node:crypto');

function issueReset(now, ttlMs) {
  const token = crypto.randomBytes(32).toString('base64url');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, record: { hash, exp: now + ttlMs, used: false } };
}

function matches(token, record, now) {
  if (record.used || now > record.exp) return false;
  const hash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const left = Buffer.from(hash);
  const right = Buffer.from(record.hash);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

const issued = issueReset(1000, 60000);
const ok = matches(issued.token, issued.record, 2000);
```

You would email `issued.token` and store `issued.record`. `ok` is true inside the window, before anyone marks the record used. The compare is on the hashes.

## What the code below is doing

Five sections. Identity first, then the session after a yes.

Lockout is `LoginGuard`. `check` allows the try until `lockedUntil`. Past `maxFree`, `fail` grows the lock as a power of two up to `capMs`. `success` clears the row. The asserts show a one-second lock, then a two-second lock. Key the guard on the account and the address.

Password policy is `passwordOk`: a string of length 12 to 128, absent from a tiny breached set. A long passphrase passes. `short` and `Password` fail. Length is the rule. The breach list sits beside it.

Sessions are `SessionStore`. Ids are 32 random bytes. `login` deletes the pre-login id and creates another, keeping harmless state such as the cart. `get` drops the session when idle time or absolute time is past. The asserts show the old id dead, idle expiry, and absolute expiry even when the session keeps getting touched.

Cookie flags are the frozen `sessionCookie`: name `__Host-sid`, `httpOnly`, `secure`, `sameSite` of `Lax`, path `/`, and a `maxAge` lined up with the idle window. Page script can read web storage. It cannot read this cookie.

Reset tokens are `issueReset` and `consumeReset`. The map key is the SHA-256 of the token. Consume compares with `timingSafeEqual`, refuses a used or expired row, then marks it used. A second try, a late try, and a wrong guess return null. Either way you say a message was sent if the account exists.

When you talk about it, say this: limit the tries, rotate the session when login succeeds, keep the cookie unreadable to script, and make reset tokens random, hashed, single-use, and short.
