## The idea

Picture a diary written in pencil and shut with a toy lock from a party favor. The pages hold real secrets. The pencil erases. The toy lock pops if you have seen one before. The protection was pretend.

That is a Cryptographic Failure. Sensitive data is exposed because protection is missing, weak, or used in the wrong shape: on the wire, on disk, or in the way you create and compare secrets. The controls are boring on purpose, and that is the point. Passwords go through a slow salted key derivation function. This page uses scrypt, a fresh salt every time, and a constant-time compare of the result. Tokens and session ids come from `crypto.randomBytes` or `crypto.randomUUID`. Encryption of data uses AES-256-GCM, a fresh 12-byte IV for every message, and an auth tag that fails the open when the ciphertext or the associated data changes. A cookie or a webhook you must believe is HMAC-SHA256. Keys come from the environment or a key manager. A JWT is accepted only after verification, and only for an algorithm on your allowlist.

Failure looks like the pencil diary. Passwords sit in the clear, or they run through a fast hash such as MD5 or SHA-1 with no salt. A reset token is the clock plus a user id. A compare with `===` finishes early on the first wrong byte and turns time into a hint. A fixed IV, a key pasted into the source, or a mode with no integrity lets someone rewrite or predict the secret. A token is trusted from a decode that skipped the signature, including a header whose algorithm is `none`.

## Why it matters

A crypto failure turns a backup, a log line, or a copied cookie into the thing you meant to protect. A fast password hash is an easy puzzle. A predictable token is a guess. Ciphertext with no auth tag can be altered and still come back as data your program accepts. A skipped signature is a diary page someone else rewrote.

Call the library the platform already reviewed. Salt each password so two identical phrases do not share a stored value, and slow the hash so guessing costs time and memory. Draw 32-byte tokens from the operating system's random source. Compare secrets with `timingSafeEqual`. Encrypt with an authenticated mode and a new IV per message. Sign anything the client will hand back, verify before you read it, and keep the key out of the repository.

## A small example

```javascript
const crypto = require('node:crypto');

function newToken() {
  return crypto.randomBytes(32).toString('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

const issued = newToken();
const match = safeEqual(issued, issued);
const mismatch = safeEqual(issued, newToken());
```

`issued` is 32 random bytes, encoded for a header or a link. `match` is true. `mismatch` is false. Equal-length compares go through `timingSafeEqual`.

## What the code below is doing

Six demonstrations. Each one is a weak habit and the library call that replaces it.

Password storage is `hashPassword` and `verifyPassword`. The hash is scrypt. The stored string holds the algorithm name, the cost, the salt, and the hash. Verify splits that string, recomputes scrypt, and compares with `timingSafeEqual`. Two hashes of the same password differ because the salt is new each time. The password text is absent from the stored string.

Random tokens are `newToken`. It reads `crypto.randomBytes` and renders them as base64url. An assert checks that `crypto.randomUUID` matches the version-4 shape.

Constant-time compare is `safeEqual`. Matching bytes return true. A difference returns false. Different lengths return false up front, because `timingSafeEqual` requires equal lengths.

Symmetric encryption is `encrypt` and `decrypt` with AES-256-GCM. The IV is 12 random bytes, the auth tag rides with the ciphertext, and associated data is bound in. A flipped byte, the wrong associated data, or the wrong key throws. Two encryptions of the same text differ because the IV is fresh. The key on the page is random bytes, a stand-in for a key from the environment or a key manager.

HMAC integrity is `sign` and `verify`. The body is base64url JSON. The MAC is HMAC-SHA256. Verify returns the object only when `safeEqual` accepts the MAC. A body swapped to a different role, still wearing the old MAC, returns null. The wrong key returns null.

The JWT check is `headerAlgAllowed`. It reads the header and returns true only when `alg` is on the allowlist you passed. A header of `none` fails a list that contains `RS256`. The comment says production code should call a real verify function with that same allowlist.

When you talk about it, say this: slow salted password hashes, random bytes for tokens, constant-time compares, authenticated encryption, and keys that live outside the source.
