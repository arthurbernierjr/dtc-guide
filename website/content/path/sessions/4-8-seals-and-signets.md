---
editorial: true
title: Seals and Signets
subtitle: bcrypt, JWT, and authentication with curl
hook: "No React yet. A password becomes a hash, a login returns a signed token, and the next request carries that token in a header. The server is the only thing that believes it."
read: 60
artifact: "Register, login, and a protected route, exercised with curl and a Bearer token"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://github.com/kelektiv/node.bcrypt.js#readme
  - https://github.com/auth0/node-jsonwebtoken#readme
  - https://expressjs.com/en/guide/writing-middleware.html
  - https://mongoosejs.com/docs/validation.html
  - https://www.postman.com/downloads/
say:
  - "bcrypt.hash stores a hash, never the password. bcrypt.compare checks a guess against it."
  - "jwt.sign makes a token. jwt.verify checks the signature and the expiry. The secret stays on the server."
  - "A hidden button is not security. The route checks the token."
---

## The hook

The courier will hand a quest to anyone who can reach the port. That was the right shape while you were proving status codes. It is not a seal. This session adds three pieces, and none of them is React. A password is hashed with bcrypt before it is stored. A login compares the guess to that hash and, on a match, returns a token from `jwt.sign`. The next request carries the token in `Authorization: Bearer`, and `jwt.verify` is the only thing that makes the server believe it. You will exercise all of this with curl, the way you have driven every door in this unit. A button you hide in HTML is not part of the design. The route checks the token, or the route is open.

By the end you can register a user, log in, call a protected route with the token, and watch that route answer 401 when the token is missing, edited, or expired. The database shows a hash. It does not show the password you typed.

> *The seal is the hash. The signet is the token. The wax does not care what the page pretends.*

## The idea

Authentication is the question "who is this?" Authorization is the later question "what may they do?" This session answers the first one. A token that merely exists is not yet a rule about which quests they own. That second question is how a later bug will smuggle itself in: the route checks that some user is logged in, and then it loads whatever id was in the URL. You will leave a note about that and not pretend the token solved it. Today the protected route is `GET /api/me`. It returns the user the token names. It does not return a password, and it does not return the hash.

bcrypt stores a hash, never the password. `bcrypt.hash(password, cost)` returns a promise of a string. The second argument is the cost factor, also called the salt rounds. The library's own examples pass `10`. Each step up does more work on purpose, so a stolen collection of hashes is slower to guess. You are not decrypting anything later. `bcrypt.compare(guess, hash)` returns a promise of a boolean. The hash string contains the salt and the cost. You do not store a salt in another field, and you do not compare the guess to the hash with `===`. The compare function is the check. If `compare` is false, the guess was wrong. If it is true, the guess matches the password that was hashed. The stored string is not the password. A bcrypt hash begins with `$2`. When you look at the user document in the shell, that prefix is the evidence, and the characters after it must not be the letters you typed into the curl body.

Call the async functions, `hash` and `compare`, inside the route. The sync twins will block the single JavaScript thread for the whole cost of the hash, which means every other request waits on one login. You already know why that thread has to stay free. Await the promise. Let a rejection reach the error handler.

The schema has `name` and `passwordHash`. It does not have `password`.

```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
```

If a document in the shell has a `password` field and the value is the word you typed, the hash step never ran, or you stored `password` instead of `passwordHash`. That is the first diagnosis. Fix the write. Delete the bad documents. Hashes of the old passwords cannot be recovered from a field you never created, and you should not try. Those users register again.

`name` is unique, so a second registration with the same name fails with code `11000`. That is a 409, the same duplicate-key branch you already wrote. That branch currently answers `that hero already has a quest`, which is the wrong sentence for a user. Make it name the field instead. MongoDB puts the colliding field on the error as `keyValue`, so the branch reads it:

```js
// fragment: the 409 branch inside the four-argument error handler
if (err.code === 11000) {
  const field = Object.keys(err.keyValue || {})[0] || 'value';
  res.status(409).json({ message: field + ' is already taken' });
  return;
}
```

A duplicate hero now answers `hero is already taken` and a duplicate user answers `name is already taken`, from one branch. Do not catch the error and store the user anyway.

`jwt.sign` builds the token. `jwt.verify` checks it. The call this session uses is a shared secret, which stays on the server, read from `process.env.JWT_SECRET`.

```js
const token = jwt.sign(
  { sub: String(user._id) },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

`sub` is the subject. Put the user id there, and nothing else you would be ashamed to show someone. A JWT is signed, not encrypted. The token is three segments separated by dots. The middle segment is the payload, and anyone who holds the token can decode that segment and read `sub` and `exp`. The signature is the third segment. It is what stops them from changing `sub` to someone else's id and still having a token you will accept. `verify` checks the signature against the secret and checks the expiry. `jwt.decode` does not. If a middleware decodes and then trusts the payload, an edited token works, and an expired token works. The diagnosis is exactly that: verify was skipped, or `expiresIn` was never set, so there is no `exp` to fail.

If the secret is a string literal in a file you commit, anyone with the repository can mint tokens that your server will accept. Read it from the environment. Refuse to listen when it is missing. If it has already been committed, change the value. Old tokens then fail `verify`, which is what you want. The new value goes in the environment on each machine, not in the next commit. The `.env` file from the keeper session is where it goes, as a second line under `MONGODB_URI`, and `.env` is already in `.gitignore`. The name `JWT_SECRET` in the code is not the secret. The value is.

The client sends the token in one header: `Authorization: Bearer` followed by a space and the token. The protected middleware reads that header, checks the scheme, calls `jwt.verify`, and either attaches the user id and calls `next`, or answers 401 and returns. There is no third outcome where the handler runs "just to see." A missing header is 401. A bad signature is 401. An expired token is 401. Login's failure is also 401, with the same message for an unknown name and a wrong password, so the body does not tell a stranger which names are registered.

curl is the client. You will send JSON bodies for register and login, copy the token from the login body, and send the protected request with an `Authorization` header. You will also send the protected request with no header, and again with one character of the token changed. Those three results, 200, 401, 401, are the evidence. A hidden button on a page you have not even built would not change any of them.

What you should be able to draw on a napkin: hash on the way in, compare on login, sign a token whose subject is the user id, verify the Bearer token on the way back, secret in the environment, 401 when verify fails.

![](diagram:session-4-8/fig1-model)

### Register, then look at the document

Two packages first, in `~/projects/guild-door`: `npm install bcrypt jsonwebtoken`. bcrypt is a native module and compiles on install; if that step fails on your Node version, `npm install bcryptjs` is a pure JavaScript package with the same `hash` and `compare` calls, and `require('bcryptjs')` is the only line that changes. The register route is a JSON route. `express.json()` is already mounted in front, from the courier session. These three routes live in `server.js`, below the two router mounts and above the 404. The body is `{ "name": "Ada", "password": "correct horse" }`. Reject a missing name, a password that is not a string, and a password shorter than 8 characters with 400. That length is the rule for this project, a floor so you do not hash an empty string and call it a seal. The cost factor does not add characters the person did not choose.

```js
const bcrypt = require('bcrypt');
const User = require('./user-model');

const COST = 10;

app.post('/api/register', async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!name || password.length < 8) {
    res.status(400).json({ message: 'name and a password of at least 8 characters are required' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, COST);
  const user = await User.create({ name: name, passwordHash: passwordHash });
  res.status(201).json({ id: String(user._id), name: user.name });
});
```

The response is 201 and one body. The body has the id and the name. It does not have `password`, and it does not have `passwordHash`. Sending the hash to the client publishes the thing you are about to protect. The client already knows the password. They typed it. They do not need the hash, and no later request should send the hash back as a credential. The credential from here on is the token.

Do not `console.log(req.body)` on this route. The body contains the password, and a log file is a second database you forgot to seal. Log the name if you must log something. Log the status. Leave the password in the argument to `bcrypt.hash` and nowhere else.

After a successful register, open the shell.

```javascript
db.users.find({}, { name: 1, passwordHash: 1 })
```

You see `passwordHash` starting with `$2`, and you do not see a field whose value is `correct horse`. If you do, stop and fix the create before you build login. A login that compares against a plaintext field with `===` will "work" from curl and fail the moment the lesson is about a stolen copy of the collection. The collection is the thing you are practicing to lose safely.

`COST` is a named constant so the number is not an unlabeled argument. `10` matches the examples in the bcrypt documentation. If a login feels slow on your machine, you do not drop the cost to `1` to make the demo pleasant. You wait. A cost you lower for convenience is the weak hash the authentication-failure notes are about.

### Login, compare, sign

Unknown name and wrong password share one response. Compute the compare in both cases so the two failures do similar work. You can hash a throwaway string once at startup and compare against it when there is no user. The boolean from that compare is ignored.

```js
const jwt = require('jsonwebtoken');

let dummyHash;

async function prepareDummyHash() {
  dummyHash = await bcrypt.hash('not-a-user', COST);
}

app.post('/api/login', async (req, res) => {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const user = name ? await User.findOne({ name: name }) : null;
  const hash = user ? user.passwordHash : dummyHash;
  const match = await bcrypt.compare(password, hash);
  if (!user || !match) {
    res.status(401).json({ message: 'invalid name or password' });
    return;
  }
  const token = jwt.sign(
    { sub: String(user._id) },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.status(200).json({ token: token });
});
```

`prepareDummyHash` runs before `listen`, next to `mongoose.connect`. If `dummyHash` is still unset, a login for a missing user will throw inside `compare`, and you will see a 500 for one failure and a 401 for the other. That split is a bug. Both failures are 401.

The token's payload is `{ sub: id }`. Do not put the password, the hash, or the secret in the payload. Do not put the user's name in the token if a renamed user should be read from the database on each request. `sub` is enough. The protected route loads the user by that id and returns the current name. If the user has been deleted, the token still verifies and the route answers 401, because a signature does not prove the document still exists. Check the document.

`expiresIn: '1h'` is an option jsonwebtoken accepts on `sign`. It sets `exp`. Without that option the token does not expire, and a token you leaked from a log or a screenshot works until you rotate the secret. Set the option. When you want to see the failure, temporarily use `'1s'`, wait two seconds, and send the protected request again. The status is 401. Put `'1h'` back when the experiment is done. A test that leaves one-second tokens in the app you keep will look like a broken login.

`jwt.sign` with a string secret returns the token as a string. You do not need to await it. `jwt.verify` throws when the signature is wrong or the token is expired. In the login route you are only signing. Verification belongs in the middleware, where the token comes back.

### The middleware that actually closes the door

```js
function requireUser(req, res, next) {
  const header = req.get('Authorization') || '';
  const space = header.indexOf(' ');
  const scheme = space === -1 ? '' : header.slice(0, space);
  const token = space === -1 ? '' : header.slice(space + 1).trim();
  if (scheme.toLowerCase() !== 'bearer' || !token) {
    res.status(401).json({ message: 'missing token' });
    return;
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'token expired' : 'invalid token';
    res.status(401).json({ message: message });
    return;
  }
  if (!payload || !payload.sub) {
    res.status(401).json({ message: 'invalid token' });
    return;
  }
  req.userId = payload.sub;
  next();
}

app.get('/api/me', requireUser, async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    res.status(401).json({ message: 'invalid token' });
    return;
  }
  res.status(200).json({ id: String(user._id), name: user.name });
});
```

`requireUser` is ordinary middleware: three parameters, mounted on the route, before the handler. It either sends 401 or calls `next`. The handler trusts `req.userId` because the middleware ran. The handler does not read the header again and does not call `verify` again, unless you enjoy two sources of truth. `.select('-passwordHash')` tells Mongoose to leave the hash off the document it returns. Even then, the JSON you send is a new object with `id` and `name`, so a future field you add to the schema does not leak into `/api/me` by default.

Scheme comparison is case-insensitive. The token itself is not. Changing a character in the token fails `verify`. Extra words in the header, or a token pasted into a query string, are not this design. The URL is logged in more places than the authorization header. Keep the token out of the path and out of the query.

Startup is where the secret is required. This is the `main()` you wrote in the keeper session, with two lines added: the check for the secret before anything connects, and `await prepareDummyHash()` before `listen`.

```js
async function main() {
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is missing');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  await prepareDummyHash();
  app.listen(port, () => {
    console.log('listening on ' + port);
  });
}
```

A process that listens without a secret will throw inside `sign` on the first login, and the stack may include paths you did not mean to show. Exit first. The environment is how you pass the value, and the mechanism is the one from the keeper session: a line in `.env`, read by `node --env-file=.env server.js`. Generate the value instead of inventing it:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Paste the output into `.env` as the second line, so the file reads:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/guild
JWT_SECRET=paste-the-64-hex-characters-here
```

Then `node --env-file=.env server.js`, as before. Confirm once more that `git status` does not list `.env`. The placeholder in the lesson text is not a secret to copy. Generate your own, long and random, and do not reuse it in another project.

### The requests, one curl each

The server is the one you started with `node --env-file=.env server.js`. curl does not start it. Every request below is the same shape as the courier's: `-i` for the status line, `-H` for a header, `-d` for a JSON body.

Register.

```bash
curl -i -H 'Content-Type: application/json' \
  -d '{"name":"Ada","password":"correct horse"}' \
  http://localhost:3000/api/register
```

Status 201. The body has `id` and `name`. Send it again. Status 409, because `name` is unique, and the message says `name is already taken`.

Login.

```bash
curl -i -H 'Content-Type: application/json' \
  -d '{"name":"Ada","password":"correct horse"}' \
  http://localhost:3000/api/login
```

Status 200. The body is an object with a `token` field, and the token string contains two dots. Copy the token value, not the quotes and not the word `token`. Login with the wrong password. Status 401 and `{ "message": "invalid name or password" }`. Login with a name you never registered. The same status and the same message.

Protected. The header is `Authorization`, the scheme is `Bearer`, and then one space and the token you copied.

```bash
curl -i -H 'Authorization: Bearer PASTE_THE_TOKEN' http://localhost:3000/api/me
```

Status 200. The body is the id and the name. The hash is not in it.

Drop the header and send again: `curl -i http://localhost:3000/api/me`. Status 401, missing token. Put the header back, change one character in the middle of the token, and send. Status 401, invalid token. Put the expiry experiment on a branch you do not keep: set `expiresIn` to `'1s'`, restart, log in, wait two seconds, send `/api/me`. Status 401, token expired. Set `'1h'` again and restart.

If you prefer a GUI, Postman does the same four requests: https://www.postman.com/downloads/. Body type raw, format JSON, so it sends `Content-Type: application/json`; in the authorization tab, Bearer Token, paste the token. It is optional. Nothing in this path needs it, and the evidence is the status lines, which curl prints first.

None of those calls used a browser page. None of them depended on a button being visible. If you add a page later that hides the account link until login, leave `requireUser` on the route. Curl without a header must still get 401. That is the sentence to write in your notes: a hidden button is not security. The route checks the token.

While the terminal is open, look at the login request and confirm you are not also logging it on the server. Then look at the shell one more time. The hash is still a hash. Your shell history holding the password in a curl line is the client remembering what the human typed. The vault should not be a copy of it.

### What the token is not

The token is not a session you can edit on the server and instantly revoke, unless you add a revocation list, which this session does not. Until it expires, a stolen token works. That is why it expires, why you do not put it in a URL, and why you do not print it. Rotating `JWT_SECRET` invalidates every token at once. That is the hammer for a leaked secret, and it logs everybody out. Use it when the secret leaked. Do not use it as the ordinary way to log one person out.

The token is not authorization. `requireUser` answers "this request has a valid token for this id." It does not answer "this id may delete that quest." When you attach the middleware to a quest route, the handler still has to decide what that user may touch. Checking only that the header was present is the bug the access-control notes describe, and it will not show up if you only ever call the route as yourself. Call it once with Ada's token asking for someone else's resource, when you have two users. Today, with `/api/me`, the resource is the subject. There is nothing to mix up except a handler that returns `req.params.id` instead of the id from the token. Do not add a `/:id` to `/api/me` that trusts the path. The path is the client's word. The token, after `verify`, is the server's.

A wrong secret between two apps is the quiet version of the same issue. If the quest API and another API share `JWT_SECRET`, a token from one verifies on the other. Fine for a single process in this unit. Fatal if you did it without noticing. One secret per deployment you intend to keep separate, when that day comes. Today, one secret, from the environment, used by this process.

## The demonstration

`npm install bcrypt jsonwebtoken` in `~/projects/guild-door`. Wire register, login, and `GET /api/me` in `server.js`, on the same app as the JSON quests. Reuse the JSON error handler, with the 409 branch reading `keyValue`. Add a branch only if a new error name appears. `TokenExpiredError` is handled inside `requireUser`, so it never becomes a 500 and it never becomes HTML.

Add `JWT_SECRET` to `.env`, stop the old server with Ctrl-C, and start it again with `node --env-file=.env server.js`. Register Ada. Confirm the shell document. Log in. Call `/api/me` with the Bearer header. Then do the three failures: no header, edited token, expired token. Write down the four statuses: 200, 401, 401, 401.

If login returns 500, the secret was missing at sign time, or `dummyHash` was unset, or MongoDB was down. If login returns 200 and `/api/me` returns 401 for the token you just received, the secret used to sign and the secret used to verify are not the same value. One process, one `process.env.JWT_SECRET`, read in both places. A fallback string in one file and the environment in the other will do this, and the fallback string is also the committed-secret bug.

If the hash in the shell equals the password, `bcrypt.hash` is not on the path that saves. Search the register handler for `User.create` and look at the object. The keys should be `name` and `passwordHash`. There should not be a key `password`.

```js run=checkpoint-4-8
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function signature(body, secret) {
  let total = 0;
  const text = body + '|' + secret;
  for (let i = 0; i < text.length; i += 1) {
    total = (total + text.charCodeAt(i) * (i + 1)) % 1000003;
  }
  return String(total);
}

function hashPassword(password, cost) {
  if (cost < 10) throw new Error('cost too small for this project');
  const salt = 'salted';
  let folded = 0;
  const material = password + ':' + salt + ':' + cost;
  for (let i = 0; i < material.length; i += 1) {
    folded = (folded + material.charCodeAt(i) * (i + 1)) % 1000003;
  }
  return '$2b$' + cost + '$' + salt + '$' + String(folded);
}

function looksHashed(stored, password) {
  return stored !== password && stored.indexOf('$2') === 0;
}

function comparePassword(guess, stored) {
  const parts = stored.split('$');
  const cost = Number(parts[2]);
  const salt = parts[3];
  let folded = 0;
  const material = guess + ':' + salt + ':' + cost;
  for (let i = 0; i < material.length; i += 1) {
    folded = (folded + material.charCodeAt(i) * (i + 1)) % 1000003;
  }
  return parts[4] === String(folded);
}

const stored = hashPassword('correct horse', 10);
check(stored !== 'correct horse', 'the database does not keep the raw password');
check(looksHashed(stored, 'correct horse') === true, 'the stored string starts like a bcrypt hash');
check(comparePassword('correct horse', stored) === true, 'the right guess matches the hash');
check(comparePassword('wrong horse', stored) === false, 'the wrong guess does not match');

function sign(payload, secret, expiresInSeconds, now) {
  const body = JSON.stringify({ sub: payload.sub, exp: now + expiresInSeconds });
  return body + '.' + signature(body, secret);
}

function verify(token, secret, now) {
  const dot = token.lastIndexOf('.');
  if (dot === -1) return { ok: false, status: 401 };
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (sig !== signature(body, secret)) return { ok: false, status: 401, reason: 'signature' };
  let data;
  try {
    data = JSON.parse(body);
  } catch (err) {
    return { ok: false, status: 401, reason: 'signature' };
  }
  if (!data.exp || data.exp <= now) return { ok: false, status: 401, reason: 'expired' };
  return { ok: true, sub: data.sub };
}

const secret = 'from-the-environment';
const token = sign({ sub: 'user-1' }, secret, 60, 1000);
check(verify(token, secret, 1030).ok === true, 'a fresh token verifies');
check(verify(token, 'other-secret', 1030).status === 401, 'a different secret is 401');
check(verify(token, secret, 2000).reason === 'expired', 'an expired token is 401');
const edited = token.replace('user-1', 'user-2');
check(verify(edited, secret, 1030).ok === false, 'an edited token fails verify');

function protect(header, tokenSecret, now) {
  if (!header) return { status: 401, reason: 'missing' };
  const space = header.indexOf(' ');
  const scheme = space === -1 ? '' : header.slice(0, space);
  const raw = space === -1 ? '' : header.slice(space + 1).trim();
  if (scheme.toLowerCase() !== 'bearer' || !raw) return { status: 401, reason: 'missing' };
  const result = verify(raw, tokenSecret, now);
  if (!result.ok) return { status: 401, reason: result.reason };
  return { status: 200, userId: result.sub };
}

check(protect('', secret, 1030).status === 401, 'no token is 401');
check(protect('Bearer ' + token, secret, 1030).status === 200, 'a Bearer token is 200');
check(protect('Bearer ' + token, secret, 1030).userId === 'user-1', 'the subject is the user id');
check(protect('Bearer ' + edited, secret, 1030).status === 401, 'a Bearer token that was edited is 401');

function door(header) {
  const uiHidesButton = true;
  if (uiHidesButton && !header) return { status: 401, secureBecauseHidden: false };
  return { status: protect(header, secret, 1030).status, secureBecauseHidden: false };
}
check(door('').secureBecauseHidden === false && door('').status === 401, 'a hidden button is not security');
check(secret !== 'hardcoded-in-the-repo', 'the signing secret is not a string you commit');

console.log('ok: checkpoint-4-8');
```

The checkpoint models the seal and the signet. It does not call bcrypt or jsonwebtoken, because those packages are not part of this page. Your curls are the demonstration that the real libraries agree with the model. If the checkpoint passes and the shell shows the plaintext password, believe the shell.

## Where it breaks

![](diagram:session-4-8/fig2-diagnosis)

### Plain password

The database shows the password you typed. The hash step never ran, or you stored `password` instead of `passwordHash`. Open the document. If you can read the password, so can anyone who can read the collection, including a backup you copied onto a laptop. Comparing that field to `req.body.password` with `===` makes login succeed and does not make the storage a hash.

Hash first, then create, and create only `{ name, passwordHash }`. Delete the documents that contain the raw password. Those passwords are burned. Do not leave them while you "also add" a hash field. Two fields, one of them plaintext, is still plaintext. Confirm the new document starts with `$2` and that the register response does not echo the hash.

A cousin of this bug is logging. The database is clean and the terminal shows the password because you logged `req.body`. Stop logging the body. The diagnosis is about where the secret value is copied. The collection and the logs both count.

### Secret in the repo

The signing key is in a commit. Anyone can mint tokens your server will accept. Search the code for the value, not for the variable name. `process.env.JWT_SECRET` is fine. A quoted string passed to `jwt.sign` or `jwt.verify` is the bug. A `.env` that git is tracking is the same bug. `.gitignore` does not remove a file that is already tracked. If `git status` shows `.env`, do not commit it.

Rotate the secret: pick a new value, put it in the environment where the process runs, restart, and confirm an old token now receives 401. Treat the old value as public. Do not move it into a private note in the repository. The next login issues tokens with the new secret. You do not need to edit the users. Their hashes are independent of the signing key. The tokens are not.

If sign and verify read different sources, one of them will be the hardcoded fallback you added when the environment was unset. Delete the fallback. Exit on startup when the variable is missing. A server that cannot sign should not listen.

### Expired token still works

`verify` was skipped, or the expiry was never set. A 401 is the correct failure. If `/api/me` returns 200 for a token whose `exp` is in the past, the middleware is not calling `jwt.verify`. `jwt.decode` will happily show you an expired payload. It does not check the signature either, so the edited-token test will also fail to fail. Replace `decode` with `verify`. Keep the `try/catch`. Send 401 on `TokenExpiredError` and on a bad signature.

If `verify` is in place and old tokens still work, look at the object you passed to `sign`. `expiresIn` has to be there. A token minted before you added the option does not gain an `exp` retroactively. Log in again after the change, and test the new token. Use `'1s'` only as a temporary experiment. A clock on your laptop that is wildly wrong will also confuse `exp`. If the 401 arrives immediately on a fresh token, the machine's time or the expiry value is the thing to look at, not the hash.

Do not "fix" an expired token by catching the error and calling `next()`. That is the bug again, with extra steps. The catch block sends 401 and returns.

## Your turn

1. `npm install bcrypt jsonwebtoken`. Add the user model in `user-model.js` with `name` and `passwordHash`. `name` is unique. There is no `password` path.
2. `POST /api/register` hashes with cost `10` and returns 201 with id and name. Confirm the shell shows a `$2` hash. Repeat the name and confirm 409.
3. `POST /api/login` compares, and on success returns `{ token }` from `jwt.sign` with `sub` and `expiresIn`. Unknown name and wrong password both return the same 401 message.
4. `GET /api/me` uses `requireUser`. Bearer token returns 200. No header returns 401. An edited token returns 401.
5. Put `JWT_SECRET` in `.env` and nowhere else. Start the process once without `--env-file` and confirm it exits. Confirm `git status` does not list `.env`.
6. Shorten the expiry, watch curl receive 401, and put the expiry back.
7. Write the sentence about the hidden button next to the route, so a later page cannot talk you out of `requireUser`.

If curl shows 401 on a token you just issued, compare the secrets used to sign and to verify before you change bcrypt. The hash is not involved in `/api/me` once login has returned.

## The quest

![](diagram:session-4-8/fig3-evidence)

Write `SEALS.md`. It should prove the three evidence lines with your own requests.

- Hash: the stored field name, the prefix you saw, and a statement that the password you typed is not the stored value. Redact the hash if you paste it. Do not paste the password.
- Token: the login status, the fact that the JSON has a token, and the three `/api/me` results: Bearer 200, missing header 401, edited token 401. You may paste a token you are about to throw away by rotating the secret. Do not paste a token you will keep using, and do not paste the secret.
- Requests: the four curl lines you ran, with the token and the password replaced by placeholders, and the expiry experiment's 401.

Add where `JWT_SECRET` comes from, and the startup behavior when it is missing. Commit the user model, the routes, the middleware, `.gitignore` if you changed it, and `SEALS.md`. Do not commit `.env`.

## Side quests

Authentication is who you are and authorization is what you may do, the notes on authentication failures cover weak hashes, missing expiry, and tokens in logs beside the code you just wrote, and broken access control is the next bug, which stays invisible if you only call the route as yourself.

## Before next session

The seal you can prove with curl is the one the next screen will carry. React is the page as a description of UI from state, and it is the next session's whole subject. You do not need it to believe the hash or the token. When a component later hides a button, the route you just wrote is still the door. Read the React learn page's opening only if you want a preview. Arrive able to say, without looking, what `bcrypt.hash` stores, what `jwt.verify` checks, and which header the client has to send. Stop the server with Ctrl-C. Next session starts a different project, `primer`, and nothing in `guild-door` needs to be running for it.
