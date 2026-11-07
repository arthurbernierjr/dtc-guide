## The idea

Picture a permission slip for a field trip. The words say yes. You trust the slip because of the signature on the line, and you hold that signature up to the one the office keeps on file. A slip with a blank line, or a signature that belongs to different words, stays in the tray. The class goes on the trip when the signature matches.

That is a Software or Data Integrity Failure when the match never happens. Code or data crossed a boundary, and something trusted it with no check that it was still the same bytes. Verify before you trust. Skip `__proto__`, `constructor`, and `prototype` when you merge outside JSON, and copy out only the fields you named. Keep prices and roles on the server. The client sends a sku. Sign a cookie with HMAC and compare with `timingSafeEqual` before you read it. Give a third-party script an integrity hash. Install an update, and accept a webhook, only after the signature checks.

Failure looks like a slip accepted because the paper felt official. A merge copies a dangerous key and changes objects across the process. Text from the client is evaluated as a program. A hidden price is the amount you charge. A cookie that is only base64 is decoded, and the role inside is obeyed. A script tag points at a shared host and has no hash, so a swapped file runs for every visitor. An update arrives with nothing to verify. A webhook is parsed, and the signature is somebody else's problem.

## Why it matters

Integrity asks whether this is still what you agreed to. A private message can still be edited in transit. A public file can still announce that its bytes changed. This 2025 category is that second promise breaking. The damage is a price, a role, or a program that changed after you last looked, while the system treated the new bytes as the original.

Check at the boundary. The browser's copy stays untrusted until the signature matches the key you hold. A merge stays untrusted until every key is one you meant to copy. Code you run comes from a template or a signed artifact. `JSON.parse` hands you data. The signature check tells you who produced it. An algorithm allowlist, passed into verify, is the decision.

## A small example

```javascript
const crypto = require('node:crypto');

function sign(body, key) {
  const mac = crypto.createHmac('sha256', key).update(body).digest('base64url');
  return body + '.' + mac;
}

function readSigned(token, key) {
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const mac = Buffer.from(token.slice(dot + 1));
  const want = Buffer.from(
    crypto.createHmac('sha256', key).update(body).digest('base64url')
  );
  if (mac.length !== want.length) return null;
  if (!crypto.timingSafeEqual(mac, want)) return null;
  return body;
}

const key = crypto.randomBytes(32);
const token = sign('uid=1', key);
const body = readSigned(token, key);
```

`body` is `uid=1` because the MAC matches this key. A token with no dot, or a MAC that fails the compare, comes back `null`. You read the fields after that check returns the body.

## What the code below is doing

Six sections. Each one withholds trust until a check passes.

Merging is `safeMerge` and `safeParse`. Both skip `__proto__`, `constructor`, and `prototype`. `safeMerge` copies own keys, recurses only into plain objects, and builds children with `Object.create(null)`. The asserts show `Object.prototype` still clean and the ordinary field `ok.deep` kept. `safeParse` drops those keys in a `JSON.parse` reviver.

Orders are `parseOrder`. After `safeParse`, `sku` must be a string and `qty` an integer of at least 1. The return value has only those two fields. A quantity that arrived as a string throws.

Prices are `priceOrder` over a `catalog` map. The unit price comes from the map. A `price` property in the JSON never reaches the math, because `parseOrder` did not copy it.

Cookies are `signCookie` and `readCookie`. The body is base64url JSON, the tail is HMAC-SHA256, and the compare is `timingSafeEqual`. A rewritten body under the old MAC returns null. The comment gives a JWT the same treatment: `verify`, with an algorithm allowlist.

Script tags are `sriTag`. It hashes the file with sha384 and writes `integrity` plus `crossorigin="anonymous"`. The browser recomputes the hash and refuses the script when the bytes differ.

The last block is a checklist: signed updates, protected branches, secrets kept off untrusted fork builds, hashed artifacts, deploys of what the pipeline built, and webhook signatures checked with `timingSafeEqual` on the raw body before any parse.

When you talk about it, say this: sign what crosses a boundary, and check the signature before you trust what is inside.
