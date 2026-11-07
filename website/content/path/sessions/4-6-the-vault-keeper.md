---
editorial: true
title: The Vault Keeper
subtitle: Mongoose and ODMs
hook: "MongoDB will store whatever you hand it. Mongoose is the keeper at the door: a schema, a model, validators, and queries that return promises."
read: 55
artifact: "A Mongoose model for quests with required fields, an enum, a unique index, and create, find, update, and delete"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://mongoosejs.com/docs/index.html
  - https://mongoosejs.com/docs/guide.html
  - https://mongoosejs.com/docs/validation.html
  - https://mongoosejs.com/docs/queries.html
  - https://mongoosejs.com/docs/models.html
  - https://nodejs.org/api/cli.html#--env-fileconfig
say:
  - "A schema describes the shape. A model is the object you call to talk to one collection."
  - "Validators run on save. A unique index is a database rule, not a Mongoose courtesy."
  - "Queries are thenable. await Quest.find() gives you documents, or it throws."
---

## The hook

The collection will store whatever document you insert. You watched it happen. A quest with no title sits beside a real one, and two heroes can share a name until an index exists. Mongoose is the keeper at that door. You describe the shape once, as a schema. You get a model, which is the object you call to talk to one collection. Validators run when you save. Queries are thenable: you `await` them, and you either receive documents or a rejection. A unique field still ends as an index in MongoDB, and a duplicate still fails with code `11000`, which is not a Mongoose validation error even though you declared `unique` on the schema.

By the end of the session the quest model can create, find, update, and delete, with `title` required, `status` limited to an enum and defaulting to `open`, and `hero` unique. A bad id becomes a 400. A duplicate hero becomes a 409. An update either keeps the rules or you can point at the option that skipped them.

> *The vault will accept any document. The keeper is the one who refuses.*

## The idea

Mongoose is an object-document mapper. It sits in your Node process and talks to MongoDB. It is not a second database. The documents are still documents, in the collection you named last session. What Mongoose adds is a place to write the shape down so that every `save` goes through it, and a set of functions so you are not assembling driver calls by hand in every route.

A schema is the description. You build one with `new mongoose.Schema({ ... })`. Each path has a type. Strings, numbers, booleans, dates, and ObjectIds are the types you will use. On a path you can set `required: true`, `enum` for a list of allowed strings, `default` for the value to use when the path is missing, and `trim` so a string loses its surrounding whitespace before validation. The validation guide is explicit about when this runs: validation is registered as middleware on `save`. `Quest.create` and `doc.save()` run it. A document that fails never reaches the collection. The error's `name` is `ValidationError`, and `error.errors` is an object keyed by path, each value carrying a message. That is a client mistake. Your error handler should answer 400, not 500.

`unique: true` looks like it belongs next to `required`. The validation page tells you to refuse that reading. The `unique` option is not a validator. It is a helper that builds a unique index in MongoDB. A document can pass `validate()` and still fail when the write hits a duplicate key. The rejection is a duplicate key error. `error.code` is `11000`. `error.errors` is not filled in the way a `ValidationError` fills it. You answer 409, because the document conflicted with one that already exists. If the index is not built yet, the database cannot enforce the rule. Mongoose builds indexes from the schema when it connects, which is the behavior you want in this unit. The validation guide also shows why a test that drops the database and writes immediately can win the race against index creation: call `await Quest.init()` when you need to wait until the indexes are ready. In the running server, a duplicate hero fails with `11000` once that index exists. You already saw the same code in the shell. The keeper did not invent a new kind of failure. It asked MongoDB for the index.

A model is the object bound to one collection. `mongoose.model('Quest', questSchema)` compiles the schema and returns the model. Mongoose pluralizes the model name to choose the collection, so `Quest` talks to `quests`. Use one model per collection. Calling `mongoose.model('Quest', schema)` twice with two different schemas throws. Require the file that creates the model from the routes, and do not call `model()` again in the route file.

The calls you need are small. `Quest.create(input)` saves a new document and resolves to it. `Quest.find(filter)` resolves to an array. An empty array means nothing matched, not that the query failed. `Quest.findById(id)` resolves to the document or to `null`. `null` is a missing quest, which your controller already knows as 404. `Quest.findByIdAndUpdate(id, update, options)` updates one document. `Quest.findByIdAndDelete(id)` removes it and resolves to the document that was removed, or `null`. Each of these gives you a thenable. `await` it inside an `async` route. The queries guide is the page that shows this. If you forget `await`, you do not have documents. You have a query object that has not run, or a promise you never read, and `res.json` of that value is not the board.

When an id string is not 24 hex characters, Mongoose refuses to cast it to an ObjectId. `findById` rejects with a `CastError` before a sensible find can run. That rejection is the client's bad URL. Map `err.name === 'CastError'` to 400. A well-formed id that matches no document is `null`, and that stays 404. The two failures take different branches. Collapsing both into 500, or both into 404, hides which mistake happened.

Updates are the sharp edge. `findByIdAndUpdate` does not run validators unless you pass `runValidators: true`. The validation page states that update validators are off by default. Skip the option and a `status` of `nope` is written even though the enum would have rejected it on `save`. The other way to break an update is to treat the body as a replacement of the whole document. `findOneAndReplace` and `replaceOne` store the body as the new document. The model API tells you to use `replaceOne` when you want to overwrite a document instead of sending `$set`. Fields the client did not send are dropped. A replacement that contains only `{ status: 'done' }` removes `title`. The keeper cannot enforce a required title that is no longer there if you threw the rest of the document away. The default for `findByIdAndUpdate`, when you pass a plain object, is to treat those keys as `$set`. The API page shows the rewrite: a top-level key that is not an update operator is sent as `$set`. Omitted fields stay. That is the update you want for a form that edits a title. You still list the fields you are willing to set. Passing `req.body` through untouched means the client picks the paths, including any path you added for your own bookkeeping.

Two details from the validation page keep the update honest. Update validators run on the paths present in the update, not on the whole document. A `required` path fails an update when you `$unset` it, not merely because you left it out of a `$set`. So `runValidators: true` is necessary and not magical. It will reject `status: 'nope'`. It will not pretend a partial update is a full `save`. And `new: true` in the options tells Mongoose to resolve to the document after the update. Without it, the promise resolves to the document from before the update, and a client that displays the result will show the old title and call your route a liar.

Defaults apply when a new document is missing a path. `status` defaults to `open` on create. `findById` of that document returns the status you stored, including the default. Defaults are not reapplied on every update. If an update sets `status` to a legal value, the stored value changes. If the update does not mention `status`, the stored value remains.

`populate` belongs in this vocabulary even though a quest's `hero` in this session is a string you index, not a second collection. When a path is an ObjectId with `ref` set to another model name, the database stores the id. `.populate('path')` on a query asks Mongoose to replace that id with the referenced document in the result you get back. The collection is unchanged. You still stored an id. Forgetting `populate` is how a client receives an id and tries to read `.name` on it. You are not building that second model today. You are learning the word so a later join does not feel like a different database.

What you should be able to draw on a napkin: schema describes, model talks to one collection, `await` the query, validators on `save`, `runValidators` on update, `unique` means an index and `11000`, a bad id is a `CastError` and a 400.

![](diagram:session-4-6/fig1-model)

### The schema you translate from the vault note

Open `VAULT.md` and write the schema so it matches the fields you already defended. Do not add a second title-like field because a tutorial used `name`. First, in `~/projects/guild-door`, install the package: `npm install mongoose`. Then put the schema and the model in a new file, `quest-model.js`. It replaces `quests-model.js` from the resource session: the array and its functions go, and the file exports the compiled model and nothing else, so the router calls `Quest.create` and `Quest.find` itself.

```js
const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['open', 'done', 'failed'],
    default: 'open'
  },
  hero: { type: String, unique: true, sparse: true }
});

module.exports = mongoose.model('Quest', questSchema);
```

`required: true` on `title` means a missing title fails validation on `save`. `trim` runs before that, so a title of three spaces becomes empty and then fails required, instead of storing a blank-looking quest. `enum` rejects any `status` outside the three strings, and the message on the `ValidationError` names the path. `default: 'open'` fills `status` when the create input omits it. You should see that default on the document `findById` returns.

`hero` is `unique: true`. I also set `sparse: true` so that documents with no hero are allowed to omit the field. A unique index in MongoDB treats `null` as a value, and a pile of quests with no hero would collide on `null` if the path were stored as null on every one of them. Sparse means the index only includes documents that actually have the field. If your rule is stronger, every quest must name a hero, drop `sparse` and add `required: true` on `hero`. Pick the rule you wrote in `VAULT.md` and make the schema match it. Do not copy `sparse` as decoration.

Connect once, at startup, from the URI in the environment. Do not call `mongoose.connect` inside a route. Every request would open work you already did, and a missing URI would surface as a per-request 500 instead of a process that refuses to listen.

```js
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is missing');
    process.exit(1);
  }
  await mongoose.connect(uri);
  app.listen(port, () => {
    console.log('listening on ' + port);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

`listen` stays behind a successful connect. If the vault is unreachable, the process exits and the port stays closed. That is a failed start, which is what you want.

`process.env.MONGODB_URI` has to come from somewhere, and the somewhere is a file named `.env` in `~/projects/guild-door`, one variable per line:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/guild
```

Node reads that file itself when you ask it to. No package is needed. Start the server with the flag from now on:

```bash
node --env-file=.env server.js
```

Add `.env` to `.gitignore`, on its own line under `node_modules`, before you commit anything else. The local URI has no password in it today; the habit is for the day it does. Run `git status` once and confirm `.env` is not listed. If you start the server without the flag, `MONGODB_URI is missing` is the line you see, and that is the startup check doing its job.

### Create, find, and the difference between null and a throw

The create route from the resource map now awaits the model. At the top of `quests-router.js`, `const Quest = require('./quest-model');` replaces the old `model` require.

```js
quests.post('/', async (req, res) => {
  const title = req.body && typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title) {
    res.status(400).json({ message: 'title required' });
    return;
  }
  const hero = req.body && typeof req.body.hero === 'string' ? req.body.hero.trim() : undefined;
  const quest = await Quest.create({ title: title, hero: hero });
  res.status(201).json(quest);
});
```

`Quest.create` runs validators, applies the default `status`, and inserts. The document you send back includes `_id` and `status: 'open'` even though the client sent neither. That is the round trip on the evidence list. A missing title never reaches the collection, because you rejected it before `create`, and because `required` would have rejected it again if you had forgotten the `if`. Prefer the explicit 400 with your own message for the empty title, and let `ValidationError` catch the cases you did not pre-check, such as a bad enum.

```js
quests.get('/', async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const questsFound = await Quest.find(filter);
  res.status(200).json(questsFound);
});

quests.get('/:id', async (req, res) => {
  const quest = await Quest.findById(req.params.id);
  if (!quest) {
    res.status(404).json({ message: 'quest not found' });
    return;
  }
  res.status(200).json(quest);
});
```

`find` always hands you an array after `await`. `findById` hands you one document or `null`. Do not check `if (!questsFound)` on the list route: it never fires, because an empty array is truthy in JavaScript. The missing-item test is `quest === null`, on the item route.

Delete is the same shape as the item read.

```js
quests.delete('/:id', async (req, res) => {
  const quest = await Quest.findByIdAndDelete(req.params.id);
  if (!quest) {
    res.status(404).json({ message: 'quest not found' });
    return;
  }
  res.status(200).json(quest);
});
```

Because these handlers are `async`, a `CastError` or a duplicate key rejection leaves the function as a rejected promise. Express 5 forwards that rejection to your error middleware. You do not need a `try/catch` in every route unless you want to translate one error in place. Translating in the error handler keeps the routes short. Do it in one place.

```js
app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  if (err.name === 'CastError') {
    res.status(400).json({ message: 'bad id' });
    return;
  }
  if (err.code === 11000) {
    res.status(409).json({ message: 'that hero already has a quest' });
    return;
  }
  if (err.name === 'ValidationError') {
    res.status(400).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});
```

Four parameters, mounted last, the same rule as last time. The new branches are the keeper's errors, named by `name` and by `code`, not by a substring search of `err.message` if you can avoid it. `11000` is the code MongoDB documents for a duplicate key. A `ValidationError` is Mongoose. A `CastError` is Mongoose refusing the id. Everything else stays 500.

### Updates that keep the fields and the rules

Build the update from the fields you allow. Do not pass `req.body` through.

```js
quests.patch('/:id', async (req, res) => {
  const update = {};
  if (typeof req.body.title === 'string') update.title = req.body.title.trim();
  if (typeof req.body.status === 'string') update.status = req.body.status;
  if (typeof req.body.hero === 'string') update.hero = req.body.hero.trim();
  const quest = await Quest.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true
  });
  if (!quest) {
    res.status(404).json({ message: 'quest not found' });
    return;
  }
  res.status(200).json(quest);
});
```

`runValidators: true` makes `status: 'nope'` fail. `new: true` returns the document after the write, so the JSON you send is the stored quest, including a title the client did not resend. The same choice is also spelled `returnDocument: 'after'` on the model API page. A replacement is a different method, `findOneAndReplace`, and it is the bug in the third diagnosis when the body is only part of the quest.

If you need a full replace, say so in the method. `PUT` can call `findOneAndReplace`, and the body you pass must be a complete quest: title, status, and hero if hero is required. Validators on replace are a different path from the `$set` update. For this unit, prefer the patch above for partial edits, and if you implement `PUT`, construct a full object yourself and reject 400 when `title` is missing before you replace. A `PUT` that quietly drops `title` because the form only posted `status` is the strip bug.

There is a second way people strip fields. They load the document, then assign every key from the body onto it, including keys that overwrite `_id`, or they replace the object's contents with the body and call `save`. `save` will run validators, which is good, and it will also persist whatever paths you just deleted in memory. Loading a document does not protect fields you then overwrite with `undefined`. Set the paths you mean to change. Call `save` if you want document middleware and full validation. Use `findByIdAndUpdate` with the options above if you want a single query. Either can be correct. Mixing them, by passing the raw body as a replacement and also forgetting `runValidators`, drops fields and skips the enum in one request.

### What a query is, when you forget await

`Quest.find()` does not return an array. It returns a query, and the query is thenable. Execution happens when you `await` it, when you call `.then`, or when you call `.exec()`. `.exec()` is how you get a real promise back if you need one. The queries page is where this is spelled out. The failure mode is a handler that does this:

```js
quests.get('/', async (req, res) => {
  const pending = Quest.find();
  res.json(pending);
});
```

`res.json` will serialize whatever it can see on that object. You will not get the board. The function is `async` and still wrong, because `await` is the keyword that turns the thenable into documents. Put `await` in front of every `Quest.find`, `findById`, `create`, `findByIdAndUpdate`, and `findByIdAndDelete`. If a query rejects, the `await` throws inside the async function, and Express forwards it. A `.then` you do not return is the forgotten-promise crash from the listening-door session, now aimed at the database.

`populate` is a method on that same query, chained before you await.

```js
async function loadQuest(id) {
  const quest = await Quest.findById(id).populate('postedBy');
  return quest;
}
```

That line only makes sense when `postedBy` is a path of type ObjectId with `ref` pointing at a model you have compiled. The result's `postedBy` is then a document, in memory, for this response. The stored quest still holds the id. If you skip `populate`, `postedBy` is the id, and `postedBy.name` is `undefined`. That is not a missing user. It is a query you did not ask to join.

### Errors you should cause once, on purpose

Create a quest with a title and a hero. Read it back by the `_id` string from the JSON. The status is `open`. Create another with the same hero. The status is 409 and the body is your duplicate message, and the collection still has one document for that hero. Request `GET /quests/not-an-id`. The status is 400 and the process stays up. Request `GET /quests/` plus 24 hex characters that you invented and never inserted. The status is 404. Patch `status` to `nope` and get a validation 400. Patch `status` to `done` and read the quest back. The title is still there. Then, in a scratch route you delete, call `findOneAndReplace` with a body of `{ status: 'done' }`. Read the document. The title is gone. That last result is why replace and update are different methods. Put the route back to `findByIdAndUpdate` before you commit.

## The demonstration

`npm install mongoose` in `~/projects/guild-door` if you have not already. Wire `quest-model.js`, the connect-then-listen startup, the `.env` file, the router's create and find, and the error handler branches. Use the stack you already trust: logger, `express.json()`, the quests router, the 404 middleware, the error handler last. Stop the old server with Ctrl-C and start this one with `node --env-file=.env server.js`.

Curl a create.

```bash
curl -i -H 'Content-Type: application/json' \
  -d '{"title":"Ring the bell","hero":"Ada"}' \
  http://localhost:3000/quests
```

The response is 201. The JSON includes `_id`, `title`, `hero`, and `"status":"open"`. Copy `_id`. Fetch it.

```bash
curl -i http://localhost:3000/quests/PASTE_THE_ID
```

200, and the same default status. Repeat the create with `"hero":"Ada"`. 409. Curl `/quests/nope`. 400. In `mongosh`, `db.quests.find()` shows one Ada, not two, and no document whose title is missing.

If the duplicate instead returns 500, the error handler did not branch on `11000`. If the bad id returns 500, it did not branch on `CastError`. If the second Ada returns 201, the unique index is not there. Check the schema for `unique: true`, restart so Mongoose can build indexes, and look at `db.quests.getIndexes()` in the shell. An index you meant to create and an index that exists are the same lesson as last session.

```js run=checkpoint-4-6
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function castId(id) {
  const hex = /^[a-fA-F0-9]{24}$/;
  if (typeof id !== 'string' || !hex.test(id)) {
    return { name: 'CastError', status: 400 };
  }
  return { name: null, status: 200 };
}

check(castId('nope').status === 400 && castId('nope').name === 'CastError', 'a bad id is a cast error and a 400');
check(castId('507f1f77bcf86cd799439011').name === null, 'twenty-four hex characters pass the cast');

function validateQuest(input) {
  const errors = [];
  if (!input.title || String(input.title).trim() === '') errors.push('title');
  const status = input.status === undefined ? 'open' : input.status;
  if (['open', 'done', 'failed'].indexOf(status) === -1) errors.push('status');
  if (errors.length) return { ok: false, name: 'ValidationError', errors: errors };
  return { ok: true, doc: { title: String(input.title).trim(), status: status, hero: input.hero } };
}

check(validateQuest({}).ok === false, 'a quest with no title never reaches the collection');
const created = validateQuest({ title: 'Ring the bell', hero: 'Ada' });
check(created.ok === true && created.doc.status === 'open', 'the default status is applied on create');
check(validateQuest({ title: 'Ring the bell', status: 'nope' }).ok === false, 'the enum rejects an unknown status');

function saveUnique(heroes, hero) {
  if (heroes.indexOf(hero) !== -1) return { ok: false, code: 11000, name: 'MongoServerError' };
  heroes.push(hero);
  return { ok: true, code: null };
}

const heroes = [];
check(saveUnique(heroes, 'Ada').ok === true, 'the first hero is stored');
const dup = saveUnique(heroes, 'Ada');
check(dup.code === 11000 && dup.name !== 'ValidationError', 'a duplicate unique hero is code 11000, not a validation error');

function applyUpdate(existing, body, options) {
  if (options.replace) {
    return { title: body.title, status: body.status, hero: body.hero };
  }
  const next = { title: existing.title, status: existing.status, hero: existing.hero };
  if (body.title !== undefined) next.title = body.title;
  if (body.status !== undefined) next.status = body.status;
  if (body.hero !== undefined) next.hero = body.hero;
  if (options.runValidators) {
    if (!next.title) return { error: 'ValidationError' };
    if (['open', 'done', 'failed'].indexOf(next.status) === -1) return { error: 'ValidationError' };
  }
  return next;
}

const current = { title: 'Ring the bell', status: 'open', hero: 'Ada' };
const stripped = applyUpdate(current, { status: 'done' }, { replace: true, runValidators: false });
check(stripped.title === undefined, 'a replacement drops fields the body did not send');
const skipped = applyUpdate(current, { status: 'nope' }, { replace: false, runValidators: false });
check(skipped.status === 'nope', 'without runValidators the enum is skipped');
const kept = applyUpdate(current, { status: 'done' }, { replace: false, runValidators: true });
check(kept.title === 'Ring the bell' && kept.status === 'done', 'a validated set keeps the other fields');

function httpFor(err) {
  if (err.name === 'CastError') return 400;
  if (err.code === 11000) return 409;
  if (err.name === 'ValidationError') return 400;
  return 500;
}
check(httpFor({ name: 'CastError' }) === 400, 'cast maps to 400');
check(httpFor({ code: 11000 }) === 409, 'duplicate key maps to 409');
check(httpFor({ name: 'ValidationError' }) === 400, 'validation maps to 400');

console.log('ok: checkpoint-4-6');
```

The checkpoint is the keeper's rules as data: cast, enum, default, duplicate key, replacement versus a validated set. The curls against MongoDB are what prove the index actually exists. Both have to agree.

## Where it breaks

![](diagram:session-4-6/fig2-diagnosis)

### Cast error

An id that is not 24 hex characters throws before the find. `GET /quests/new` will do this the moment you add an HTML form at that path, and `GET /quests/nope` does it today. The stack names `CastError` and the path `_id`. If your error handler treats every throw as 500, the client sees a server failure for a typo in the URL.

Branch on `err.name === 'CastError'` and send 400. Do not catch it by converting every exception into 404. A down database is not a missing quest. Also do not "fix" it by skipping `findById` whenever the string looks short and then falling off the end of the handler without a response. That is a hang. Send the 400.

A separate bug wears the same name. You stored ids as strings you invented, and you are querying `_id` with them, or you are querying a field called `id` that is not stored. The cast succeeds only when the string is 24 hex characters. Your old `1`, `2`, `3` identifiers will cast-fail, correctly, because they are not ObjectIds. Use the `_id` the database assigned.

### Duplicate key

`E11000`, which you read as `error.code === 11000`, is a conflict. The second hero with the same name failed because `hero` is unique. It is a 409, not an explosion, and not a `ValidationError`. If you only handle `ValidationError`, this one falls through to 500 and the log looks like MongoDB is broken. MongoDB did the thing you asked: it refused the write.

If the second insert succeeds, the index is missing. `unique: true` in the schema file does not rewrite documents already stored, and it does nothing until the index build runs. Restart the process so the model connects and builds indexes, or create the index in the shell the way you did last session. If the build fails, duplicates are already in the collection. Remove them, then let the index exist, then retry the write.

Do not catch `11000` and then `create` again with the same hero. The second try fails the same way. Answer 409 and stop.

### Update strips fields

Passing `req.body` as the replacement, or skipping `runValidators`, drops fields or skips the rules. You can see the drop in the shell: after a replace, `title` is gone and `status` is whatever the body contained. You can see the skip when `status` is `nope` and the document saved anyway, because update validators never ran.

Stop passing the raw body. Copy the allowed paths into a new object. Call `findByIdAndUpdate` with `{ new: true, runValidators: true }`. If a form sends only the title, the status must still be on the document afterward. Curl the `GET` and look. If you truly meant to replace, require every field and reject the request before the write when one is missing. An update that returns the pre-image because you forgot `new: true` is a cousin: the database may be right while the response is the old document. Read the document back with `findById` when you are unsure which of the two you returned.

## Your turn

1. `npm install mongoose`. Put the schema and model in `quest-model.js`; it replaces `quests-model.js`, and it exports the Mongoose model and nothing else. Delete the array and its functions. Write `.env` with `MONGODB_URI`, add `.env` to `.gitignore`, and connect from `process.env.MONGODB_URI` before `listen`, started with `node --env-file=.env server.js`.
2. In `quests-router.js`, require `./quest-model` as `Quest` and call `Quest.create`, `Quest.find`, `Quest.findById`, `Quest.findByIdAndUpdate`, and `Quest.findByIdAndDelete` from the handlers. Every call is awaited.
3. Teach the error handler the three names: `CastError` to 400, code `11000` to 409, `ValidationError` to 400.
4. Create a quest with no `status` in the body. Read it back. The stored status is `open`.
5. Create a second quest with the same hero. Confirm 409, then confirm the collection has one such document.
6. Curl a non-hex id and confirm 400. Curl a hex id you never inserted and confirm 404.
7. Patch `status` to `done` and confirm `title` remains. Patch `status` to `nope` and confirm 400 and that the stored status did not change.
8. In a branch you do not commit, try `findOneAndReplace` with a partial body once, observe the dropped title, and revert.

If validation never runs, you are calling an update without `runValidators`, or you are writing with the driver and bypassing the model. Stay on the model methods above until you can say which line rejected the bad status.

## The quest

![](diagram:session-4-6/fig3-evidence)

Write `KEEPER.md` beside `quest-model.js`. Include the schema, in a fence, and then the evidence from your own curls:

- The request that omitted `title`, the status code, and a `mongosh` find that shows nothing new was inserted.
- The `_id` you created, the `GET` that returned it, and the `status` value that defaulted to `open`.
- The second create with the same hero, the `409`, and the `code` you branched on.
- The bad id that returned 400, and the well-formed missing id that returned 404.
- The update options you passed, and a sentence that says what `findOneAndReplace` did to the fields you left out.

The file should let a reader see that validators and the unique index are different mechanisms. One never reaches the collection. The other reaches MongoDB and comes back as `11000`. Commit the model, the router, the error handler, and `KEEPER.md`.

## Side quests

The unique index you just asked MongoDB to build has a write cost worth reading about while the collection is small, and an ODM is not a different database: the documents are still documents once the calls start looking like objects.

## Before next session

Next session the server sends HTML. Seven routes, one resource, the name of the seven is INDUCES. The model you just wrote stays. The controller will render pages and redirect after a successful `POST`, because a browser form is not a JSON client. Read the routing guide's note about route order, and the method-override page, especially the part where a string getter reads the query and the part where a body field is only visible after `express.urlencoded`. Arrive knowing that `/quests/new` must be registered before `/quests/:id`, or the word `new` will be handed to `findById` and you will get the `CastError` you just learned, on a page that should have been a form. Stop the server with Ctrl-C when you are done. MongoDB stays up on its own.
