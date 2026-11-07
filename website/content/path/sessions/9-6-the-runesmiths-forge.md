---
editorial: true
title: The Runesmith's Forge
subtitle: TypeScript conversion and design doc
hook: "The guild hall works and has tests. Today you convert it to TypeScript in place, one boundary at a time, with the Unit 7 suite as the proof that nothing changed, and you record why the capstone will not get the same treatment."
read: 60
artifact: "hall-api converted to TypeScript on a merged branch, with src/ compiled to dist/, the Unit 7 tests passing, and ADR-2 in the capstone's docs/system-design.md"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html
  - https://www.typescriptlang.org/tsconfig/module.html
  - https://www.typescriptlang.org/docs/handbook/declaration-merging.html
  - https://mongoosejs.com/docs/typescript.html
  - https://expressjs.com/en/guide/error-handling.html
  - https://nodejs.org/api/cli.html#--env-file-if-existsconfig
say:
  - "Freeze the behavior first: the tests from Unit 7 are the baseline."
  - "Rename, then type one boundary at a time; a rename commit has no behavior in it."
  - "Every any that survives has a name and a reason, or it is not finished."
---

## The hook

The hall's `app.js` is a few hundred lines you wrote in Unit 4 and tested in Unit 7. It knows what a message looks like, what a holding is, and that `req.userId` exists after `requireUser`, but it knows those things the way you do, by memory. Today the compiler learns them too. You convert `hall-api` to TypeScript in place: a `tsconfig.json` built for CommonJS, `server.js` and `app.js` moved into `src/`, types on the models, the routes, and the middleware, and a `dist/` folder that `node` runs exactly as it ran the old files.

The rule for the whole session is that behavior does not change. The Unit 7 suite ran green before the branch and runs green after it, against the same routes and the same test database. A migration that changes a status code has smuggled a product change under a wall of renamed files. The forge turns the same metal into a stronger shape; it does not forge a different sword. At the end you add a second decision record to the capstone's design document explaining the choice you are about to make for Unit 10: the capstone is written in JavaScript, and TypeScript stays optional there.

> *The smith does not test the new blade on a stranger. He tests it on the cut he already knows.*

## The idea

A migration has three stages. Baseline: freeze the working behavior and list the public contracts, which for the hall are the twelve routes from Unit 4 plus the unread count from [5.2](/path/5-2-advanced-incantations/), their status codes, and their JSON bodies, already written down in `HALL.md` and enforced by `tests/`. Migrate: rename and then type one boundary at a time with strict checking on, fixing what the compiler finds and investigating each finding rather than silencing it. Explain: connect the result to an architecture decision, so the next person knows why the server is typed and the capstone is not. The [migration guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html) describes the same stages in the compiler's words.

The compiler's findings are evidence, not obstacles. Under `strict`, a reported "possibly undefined" means one of three things: the absence is real and the code must handle it, the absence is impossible and a check upstream should say so where the compiler can see it, or the type is wrong. Each one is a decision. A non-null assertion or an `any` skips the decision and keeps the risk. The forge is finished when the holes that remain are named, not when `tsc` exits quietly.

What you should be able to draw on a napkin: tests green on `main`; a branch; `git mv` into `src/`; a tsconfig for CommonJS with `rootDir` and `outDir`; types from the inside out, models, then middleware, then handlers, then the two files that export and listen; `npm run build` to `dist/`; tests pointed at `dist/`; green again; merge; one decision record.

![](diagram:session-9-6/fig1-model)

### Why this tsconfig differs from the practice project

`typescript-practice` is an ES module project that Node can run without compiling. The hall is a CommonJS project, `require` and `module.exports`, started with `node --env-file=.env server.js`, deployed in Unit 6 the same way, and tested by Jest through `require('../app')`. Keeping it CommonJS keeps every one of those contracts. The [module page](https://www.typescriptlang.org/tsconfig/module.html) explains the setting: `"module": "commonjs"` makes the compiler emit `require` calls from `import` statements, and `esModuleInterop` makes `import express from 'express'` work with a package that exports a function the CommonJS way.

That choice has a consequence for how the hall runs. Node's type stripping does not turn `import` into `require`, so a CommonJS `.ts` file written with `import` cannot be run with `node src/server.ts`. The hall always compiles: `npm run build` runs `tsc`, `dist/server.js` is what `node` starts, and `dist/app.js` is what the tests require. A build step is a small price for keeping Unit 6 and Unit 7 untouched, and it is the same build step Railway runs when it sees a `build` script.

`rootDir` is `src` and `outDir` is `dist`, so `src/app.ts` becomes `dist/app.js`, and the first move of the migration is `git mv` of the two files into `src/`. The test files stay in `tests/` as JavaScript. They are the baseline, and the baseline does not get edited beyond one path.

### Types from the inside out

Models first, because their types flow everywhere. Mongoose's [TypeScript page](https://mongoosejs.com/docs/typescript.html) recommends a plain interface for the document's fields and `new Schema<User>(...)`, not an interface that extends `Document`. References are `Types.ObjectId`. A literal union for `kind` matches the schema's `enum` and lets the compiler refuse `'scroll'` before Mongoose does. `mongoose.model<User>('User', userSchema)` returns a typed model, so `UserModel.findOne({ email })` resolves to a hydrated document with `name`, `email`, and `passwordHash` known.

Middleware next. `requireUser` sets `req.userId`, and Express's `Request` type has no such field. Adding it is declaration merging, from the [declaration merging page](https://www.typescriptlang.org/docs/handbook/declaration-merging.html): a file `src/express.d.ts` declares `namespace Express { interface Request { userId?: string } }` inside `declare global`, and every `Request` in the project gains the optional field. It is optional because it is absent until the middleware runs. Handlers mounted behind `requireUser` read it through a tiny helper that throws a 401 if it is missing, which is a check the compiler can see, instead of `req.userId!`, which is a promise it cannot.

`jwt.verify` returns `string | JwtPayload`, and `payload.sub` is `string | undefined`. That is the library telling you the truth: a token's subject is not guaranteed. The middleware narrows both before it trusts the id. `req.body` is typed `any` by Express, which is also the truth: the parser gives you whatever the client sent. The handlers keep the `typeof` checks they already had, pulled into two helpers, `readString` and `readAmount`, so `any` stops at the first line of each handler.

Errors last. The hall's handlers threw `Error` objects with a `status` stuck on; `Error` has no `status` in the type, so the fix is a small `HttpError` class with a numeric `status`. The error handler takes `err: unknown`, because anything can be thrown, and narrows with `instanceof`. The [Express error-handling guide](https://expressjs.com/en/guide/error-handling.html) still applies: four parameters, mounted last, and Express 5 forwards a rejected promise on its own.

### The seam that stays JavaScript

The decision for Unit 10 is made here, in the open. The capstone is scaffolded in [10-1](/path/10-1-barrier-magic/) as CommonJS JavaScript, the same shape as `hall-api` before today, with the user model, register, login, and `requireUser` copied from the hall as the pattern. TypeScript stays optional in the capstone. The reasons go into ADR-2: four sessions of Unit 10 add Stripe, an AI feature, hardening, and a deploy, and every one of those has JavaScript examples in its official docs that you can paste and run without a build; the conversion you do today proves you can type a working server later, on your own, when the capstone is stable; and a build step on the capstone is a decision the capstone's design document should record when its owner wants it, not inherit by accident. If you want the capstone in TypeScript anyway, the recipe is this session, applied in Unit 12 after the tests exist.

## The demonstration

Everything happens in `~/projects/hall-api`, with `mongod` running on `127.0.0.1:27017` and no hall process running. Baseline first.

```bash
cd ~/projects/hall-api
git switch main
git status
npm test
```

The working tree is clean and Jest prints its `Tests:` line with every test passing. Write that line down; it is the number you must see again. Then the branch and the tools.

```bash
git switch -c typescript
npm install --save-dev typescript @types/node@24 @types/express @types/cors @types/bcrypt @types/jsonwebtoken
```

Mongoose ships its own types, so there is no `@types/mongoose`; the package by that name is a frozen stub from years ago, and installing it breaks the real types. Now the config, written by hand rather than from `tsc --init`, because the generated file targets a different kind of project:

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

The rename, with no behavior in it:

```bash
mkdir src
git mv app.js src/app.ts
git mv server.js src/server.ts
printf 'dist/\n' >> .gitignore
git commit -am "Move app and server into src as TypeScript (no behavior change)"
```

`npx tsc --noEmit` now prints a page of errors. That page is the work list, and it is shorter than it looks: the same three fixes repeat. Here is each kind once. First the augmentation, `src/express.d.ts`:

```ts
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};
```

The `export {}` makes the file a module so `declare global` is allowed. Then the top of `src/app.ts`: `require` lines become imports, and the schemas get interfaces.

```ts
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Schema, Types } from 'mongoose';

const app = express();
const pageOrigin = process.env.PAGE_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: pageOrigin }));
app.use(express.json());

interface User {
  name: string;
  email: string;
  passwordHash: string;
}

interface Message {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  body: string;
  readAt: Date | null;
}

type ItemKind = 'potion' | 'weapon' | 'armor';

interface Item {
  name: string;
  kind: ItemKind;
}

interface Holding {
  owner: Types.ObjectId;
  item: Types.ObjectId;
  qty: number;
}

const userSchema = new Schema<User>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
});

const UserModel = mongoose.model<User>('User', userSchema);
```

The other three schemas take `Schema<Message>`, `Schema<Item>`, and `Schema<Holding>` the same way, with their fields unchanged, and `holdingSchema.index({ owner: 1, item: 1 }, { unique: true })` stays exactly as it was. Unchanged includes `readAt`, the `{ type: Date, default: null }` field that 5.2 added to `messageSchema` for the unread count. The interface says `readAt: Date | null` so the compiler knows the field starts empty, and the `countDocuments({ recipient: currentUser(req), readAt: null })` filter inside `unreadCount` types against it. If your `Message` interface has no `readAt`, the compiler rejects that filter and the write in `readMessage` below, which is the migration finding a field you forgot, not a reason to add `any`. The models are renamed `UserModel`, `MessageModel`, `ItemModel`, `HoldingModel` so the interface and the model do not fight over one name; the registered Mongoose name, `'User'`, does not change, which matters because `tests/helpers.js` looks it up by that string.

Next the helpers that stop `any` and name the errors, placed above the middleware:

```ts
class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function currentUser(req: Request): string {
  if (!req.userId) throw new HttpError(401, 'missing token');
  return req.userId;
}

function isDuplicateKey(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code?: unknown }).code === 11000;
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is required');
  return secret;
}

function readString(body: unknown, key: string): string {
  if (typeof body !== 'object' || body === null) return '';
  const value = (body as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

function readAmount(body: unknown): number | null {
  if (typeof body !== 'object' || body === null) return null;
  const amount = (body as Record<string, unknown>).amount;
  return typeof amount === 'number' && Number.isInteger(amount) && amount >= 1 ? amount : null;
}
```

`readString(req.body, 'email')` replaces the `req.body && typeof req.body.email === 'string' ? ... : ''` that every handler repeated. Same check, same result, one place. Now the middleware, which is where the token's truth gets narrowed:

```ts
function requireUser(req: Request, res: Response, next: NextFunction): void {
  const header = req.get('authorization') || '';
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer' || parts[1] === '') {
    res.status(401).json({ error: 'missing token' });
    return;
  }
  try {
    const payload = jwt.verify(parts[1], jwtSecret(), { audience: 'guild' });
    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      res.status(401).json({ error: 'bad token' });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'bad token' });
  }
}
```

The JavaScript version wrote `return res.status(401).json(...)`. A handler typed as returning `void` cannot return the response object, so the pattern becomes two lines: send, then `return`. Same bytes on the wire. Every handler goes through that change, and it is the most common edit of the day. One full handler, `register`, with the duplicate-key branch narrowed:

```ts
async function register(req: Request, res: Response): Promise<void> {
  const name = readString(req.body, 'name').trim();
  const email = readString(req.body, 'email').trim().toLowerCase();
  const password = readString(req.body, 'password');
  if (name === '' || email === '' || password.length < 8) {
    res.status(400).json({ error: 'name, email and a password of 8 or more characters' });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await UserModel.create({ name, email, passwordHash });
    res.status(201).json({ id: String(user._id), name: user.name, email: user.email });
  } catch (err) {
    if (isDuplicateKey(err)) {
      res.status(409).json({ error: 'email already registered' });
      return;
    }
    throw err;
  }
}
```

And one handler with a route parameter, `readMessage`, where `Request<{ id: string }>` types `req.params.id`. The `readAt` write from 5.2 stays where 5.2 put it, below the 403, because the migration moves nothing and the regression case "the sender's read is still 403" still has to hold:

```ts
async function readMessage(req: Request<{ id: string }>, res: Response): Promise<void> {
  const message = await MessageModel.findById(req.params.id).populate('sender', 'name');
  if (!message) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  if (String(message.recipient) !== String(req.userId)) {
    res.status(403).json({ error: 'forbidden' });
    return;
  }
  if (!message.readAt) {
    message.readAt = new Date();
    await message.save();
  }
  res.json(message);
}
```

The pack's `spend` and `credit` keep their conditional update and their upsert unchanged; their signatures become `spend(ownerId: string, itemId: string, amount: number | null)`, throwing `new HttpError(400, ...)` for a bad amount and `new HttpError(409, 'not enough')` when the filter matches nothing, and `credit(ownerId: Types.ObjectId, itemId: Types.ObjectId, amount: number)`. The `give` handler builds `new Types.ObjectId(currentUser(req))` once and passes `item._id`, which is already an `ObjectId`, so the compiler stops you from mixing a string id into an update that wants the real type. `transfer` loads the item before it debits, the way `give` already did, and then passes `item._id` to `credit`. The error handler at the bottom and the export:

```ts
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) return next(err);
  const status = err instanceof HttpError ? err.status : err instanceof Error && err.name === 'CastError' ? 400 : 500;
  const message = err instanceof Error ? err.message : 'server error';
  res.status(status).json({ error: status === 500 ? 'server error' : message });
});

export = app;
```

`export = app` is the TypeScript spelling of `module.exports = app`, and it is the line that keeps `require('../dist/app')` in the tests returning the app itself. `src/server.ts` imports it with `esModuleInterop` and reads the environment with the checks the compiler now insists on:

```ts
import mongoose from 'mongoose';
import app from './app';

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  if (!uri) throw new Error('MONGODB_URI is required');
  await mongoose.connect(uri);
  const port = Number(process.env.PORT || 4100);
  app.listen(port, () => {
    console.log('guild hall on ' + port);
  });
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
```

`npx tsc --noEmit` is now silent. The scripts in `package.json` gain a build, a start that points at `dist/`, and a `pretest` so `npm test` always tests what was just compiled; your existing `test` line stays as it is.

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node --env-file-if-exists=.env dist/server.js",
    "pretest": "npm run build",
    "test": "node --env-file=.env.test node_modules/jest/bin/jest.js"
  }
}
```

`--env-file-if-exists`, from the [Node CLI reference](https://nodejs.org/api/cli.html#--env-file-if-existsconfig), reads `.env` on your machine and does nothing on Railway, where the variables are injected and the file does not exist. Inside an npm script, `tsc` resolves to the local install, so `npm run build` needs no `npx`. The last edit is the one path in the tests: in every file under `tests/`, `require('../app')` becomes `require('../dist/app')`. VS Code's search and replace across the folder does it in one pass. The helpers, the setup, and the assertions do not change.

```bash
npm test
```

The build runs first, prints nothing, and Jest prints the same `Tests:` line you wrote down on `main`. That is the baseline holding. Start the hall once and prove the surface from outside:

```bash
npm start
```

In a second terminal, `curl -i http://localhost:4100/api/inbox` answers `401` with `{"error":"missing token"}`, which is `requireUser` in `dist/app.js` doing what `app.js` did. Stop it with Ctrl-C. Commit in slices, so the history reads as a migration: the config and install, the rename, the types, the scripts and test path.

```bash
git add -A
git commit -m "Type models, middleware and handlers; build to dist; tests on dist"
git switch main
git merge typescript
git push
```

If the hall is deployed from Unit 6, two more lines: on Railway, the builder runs `npm run build` when the script exists and then `npm start`, so the next deploy picks up the change with no settings edit, and the deploy log shows `tsc` running; on the VPS, `deploy.sh` runs `npm run build` after `npm ci`, and the pm2 script path becomes `dist/server.js`.

Here is a small model you can run here. It is the boundary ledger in plain JavaScript: four places outside data enters the hall, which of them the types cover, and the one a type cannot check. It proves that a typed boundary still needs a check that runs, and that a rename changes a path and nothing else. It does not compile anything; `npm test` in `hall-api` is the proof the migration kept its behavior.

```js run=checkpoint-9-6
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const boundaries = [
  { name: 'register body', typed: true, validated: true },
  { name: 'token payload', typed: true, validated: true },
  { name: 'Mongo document', typed: true, validated: true },
  { name: 'PORT from the environment', typed: true, validated: false }
];

const unsafe = boundaries.filter((b) => !b.validated);
check(unsafe.length === 1 && unsafe[0].name === 'PORT from the environment', 'Types alone do not validate runtime input');

function readPort(env) {
  const raw = env.PORT;
  if (raw === undefined) return 4100;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535, got ' + JSON.stringify(raw));
  }
  return port;
}

check(readPort({}) === 4100 && readPort({ PORT: '4100' }) === 4100, 'a checked boundary accepts the good value');
let message = '';
try { readPort({ PORT: 'forty-one hundred' }); } catch (err) { message = err.message; }
check(message.startsWith('PORT must be'), 'Explain the rejected or incomplete case');

const renamed = ['app.js', 'server.js'].map((f) => f.replace(/\.js$/, '.ts'));
check(renamed.join(',') === 'app.ts,server.ts', 'a rename is a path change, not a behavior change');

console.log('ok: checkpoint-9-6');
```

## Where it breaks

![](diagram:session-9-6/fig2-diagnosis)

### Mass rename hides defects

One commit renames the files, reformats them, converts every handler, and changes a status code in the middle. The symptom is a review that cannot find the behavior change in four hundred green lines, and a test that went red for a reason nobody can locate. The cause is mixing a rename with a rewrite.

Split the work. One commit for the move into `src/`, with no edits inside the files, so the diff is paths. One commit per boundary after that: models, middleware, handlers, scripts. Run `npm test` after each. When a test goes red, the slice that made it red is small enough to read, and the fix is usually a `return` that went missing when `return res.status(...)` became two lines.

### Any used as an escape hatch

The migration is "done" and `any` is scattered through the files that were annoying, so the compiler is quiet for the wrong reason. The symptom is `npx tsc --noEmit` silent and a handler that still crashes on a body with the wrong shape. The cause is a hole you opted into to make an error go away.

Search the project for `: any` and ` as `. Each one gets a reason in a comment next to it or gets replaced with `unknown` and a check. `req.body` is the one `any` you did not write, and the two `read` helpers are what fence it off. A count of `any` that only goes up is not a migration. It is the old JavaScript with extra syntax.

### Design diverges from code

`docs/system-design.md` shows a queue between the API and the mailer, and the code calls the mailer in the route. The symptom is two artifacts that describe two different systems, and an incident where you trust the wrong one. The cause is a document written once and never walked.

Pick one request. Trace it through section 4 of the design, then through `src/app.ts`, naming every hop. Where they disagree, change one of them today, and add the date to the Changes line. A design that matches the branch is a tool. One that does not is fiction, and it is the fiction you will reach for at the worst time.

## Your turn

The conversion of your own `hall-api`, in the same order as the demonstration. Run `npm test` after the steps that say so, and expect the same `Tests:` line every time.

1. `cd ~/projects/hall-api && git switch main && npm test`. Write down the `Tests:` line. Then `git switch -c typescript` and install `typescript`, `@types/node@24`, `@types/express`, `@types/cors`, `@types/bcrypt`, and `@types/jsonwebtoken` as development dependencies.
2. Write the eleven-line `tsconfig.json` from the demonstration. `git mv app.js src/app.ts` and `git mv server.js src/server.ts`, add `dist/` to `.gitignore`, and commit with the message that says no behavior changed. `npx tsc --noEmit` prints a list of errors; count them and write the number down.
3. Add `src/express.d.ts`. Convert the `require` lines to imports, write the four interfaces, and type the four schemas and models. Run `npx tsc --noEmit` and read a shorter list.
4. Add `HttpError`, `currentUser`, `isDuplicateKey`, `jwtSecret`, `readString`, and `readAmount`. Convert `requireUser`, then every handler, turning each `return res.status(...)` into a send and a bare `return`. `npx tsc --noEmit` is silent when this step is done.
5. End `src/app.ts` with `export = app`, write `src/server.ts`, add the `build`, `start`, and `pretest` scripts, and change `require('../app')` to `require('../dist/app')` in every file under `tests/`. Run `npm test`; the `Tests:` line matches step 1.
6. `npm start`, then `curl -i http://localhost:4100/api/inbox` in another terminal and read `401` and `{"error":"missing token"}`. Ctrl-C. Commit the remaining slices, merge into `main`, push.
7. Break it twice: in `requireUser`, delete only the `typeof payload.sub !== 'string'` half of the check. It still compiles, because `userId` is optional and `sub` is `string | undefined`; the compiler let the uncertainty through, and `currentUser` is now the only thing standing between a token with no subject and a handler, answering 401 at runtime. Then delete the `typeof payload === 'string'` half as well. Now `npx tsc --noEmit` refuses, because `payload` may be a plain string and a string has no `sub`. Put both halves back. Then grep for `: any` and ` as ` and write the list for the quest.

If `npm test` fails with `Cannot find module '../dist/app'`, the build did not run: check that the script is named `pretest` exactly, and run `npm run build` by hand once to see the compiler's output.

## The quest

![](diagram:session-9-6/fig3-evidence)

The deliverable is two things. The merged `typescript` branch in `hall-api`, with `src/`, `dist/` ignored, the three scripts, the tests on `dist/`, and a short "TypeScript" section in the README stating the build and start commands and the one path change in the tests. And ADR-2 in `~/projects/<capstone-name>/docs/system-design.md`, as section 11 under the numbering from last session, titled "ADR-2: the capstone is JavaScript; TypeScript stays optional", with the context, the options, the decision, the consequences, and a revisit condition, written in your words from the idea section. Add a dated line to the Changes list and bump the version to 1.1.

Evidence to keep:

- The `Tests:` line from `main` before the branch and from `main` after the merge, identical.
- The count of compiler errors after the rename and the sentence "npx tsc --noEmit is silent" with the date.
- The commit list of the branch, in slices, with the rename commit containing no edits inside the files.
- The list of every `any` and every `as` left in `src/`, each with its reason, or the sentence "none beyond req.body".
- The `401` curl line against `dist/`, and ADR-2's revisit condition.

The hall is now the reference for a typed Express server you own end to end. The capstone will be JavaScript, by a decision you wrote down, and when the day comes to type it, this page is the recipe.

## Side quests

The SOLID sheet names what the interfaces and the `read` helpers did for the handlers today, the digital-mansion primer is the long form of the design document you have now written twice, and the trade-offs sheet is the vocabulary for ADR-2's consequences section.

## Before next session

Next session starts Unit 10 at [10-1](/path/10-1-barrier-magic/): the capstone's code begins in `~/projects/<capstone-name>`, as CommonJS JavaScript with Express, Mongoose, and a Vite client, with the hall's user model, register, login, and `requireUser` copied in as the pattern, then hardened with input validation and secrets handling. Reread your `requireUser` in `src/app.ts` once, because the first thing 10-1 does is copy the JavaScript version of it. Stop the hall if it is running; nothing stays up between sessions. You arrive with `hall-api` typed and green on `main`, `docs/system-design.md` at version 1.1 with two decision records, and the capstone repository holding only `docs/`, which is exactly what 10-1 expects.
