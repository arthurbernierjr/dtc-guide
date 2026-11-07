## The idea

Picture a hall monitor with a notebook. The job is to write who tried the wrong door, and to ring a bell when the same kid tries ten times in a minute. The combination of the lock stays out of the notebook. The pages are chained, so a page someone rewrote no longer matches the page before it. The notebook lives in the office. A student cannot carry it home and throw it out.

That picture, done badly, is Security Logging and Alerting Failures. The record is missing, full of secrets, easy to forge, or never read. Log security events as one JSON object per line, strip secrets, and store the lines where the app cannot quietly erase them. Turn newlines inside a field into spaces. Replace secret-shaped keys and secret-shaped text with a redaction mark. Cap the length. Put a request id and a UTC time on every line. Raise an alert when a count crosses a limit inside a window. Chain a hash from line to line so a rewrite is visible.

Failure looks like the notebook left on the bench. Failed logins never get a line. The line contains the password and the card. A name with a line break pretends to be a second event that says an admin succeeded. The files sit on the same box as the app and disappear with it. A huge burst of failures at three in the morning pages nobody. Clocks disagree, so the story of one visit cannot be sorted. One enormous field knocks the logging pipeline over.

## Why it matters

You learn about a break-in from the logs, or you learn about it from a stranger. This 2025 category covers the writing and the alerting. An empty notebook cannot say whether anyone spent the night on the door. A notebook full of secrets is another copy of the secrets. An alert that never rings means nobody reads the notebook.

Write one JSON object per line, and redact by key name and by pattern before you ship it. Copy one correlation id onto every line from that request. Send the lines to a central store, keep them long enough to investigate, stamp UTC, and sync the clocks. Alert on thresholds. Chain each line to the hash before it.

## A small example

```javascript
function cleanString(value) {
  return String(value).replace(/[\r\n]/g, ' ');
}

function redact(fields) {
  const secretKey = /^(password|token|authorization|cookie)$/i;
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    out[key] = secretKey.test(key) ? '[REDACTED]' : cleanString(value);
  }
  return out;
}

const entry = redact({
  username: 'alice',
  password: 'placeholder',
});
```

`entry.username` stays `alice`. `entry.password` becomes `[REDACTED]`. A line break inside a normal string value is replaced with a space, so that field cannot start a second record.

## What the code below is doing

Four sections: how a line is built, which events belong in the book, when the bell rings, and how a rewritten page gives itself away.

The logger is `SecurityLogger`, with `cleanString` and `redact` in front of it. Secret key names, including password, token, cookie, card, and a few spellings, become `[REDACTED]`. Patterns replace long digit runs, JWT-shaped text, bearer tokens, and a simple national-id shape. Strings stop at 512 characters. `event` writes one JSON line with a UTC time, the event name, and a request id. The asserts keep a line-break username inside a single failure record, redact nested secrets, scrub a free-text note, and shorten a huge field.

The catalog is two frozen lists. `SECURITY_EVENTS` is what you record, including login, `authz.denied`, admin actions, and rate-limit hits. `NEVER_LOG` keeps out passwords, session ids, tokens, full card numbers, extra personal details, and whole request bodies.

Alerting is `ThresholdAlert`. `record` returns true once the hits inside the window reach the limit. Ten failures from one address fire. Another address stays quiet. After the window slides, the first address is quiet again.

The chain is `chainHash`. Each line is hashed with the previous hash. Replaying the lines reproduces the head. Changing one word produces a different head. The closing note is retention, UTC, and synced clocks.

When you talk about it, say this: log the security events, leave the secrets out, keep every line one JSON object in a store that shows tampering, and ring an alert a person reads.
