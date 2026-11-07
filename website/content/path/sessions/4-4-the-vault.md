---
editorial: true
title: The Vault
subtitle: MongoDB and databases in general
hook: "A variable dies when the process dies. A database is the other kind of memory: documents on disk, queried by fields, shared by every request."
read: 50
artifact: "A written model of a quest collection: documents, a unique field, and the difference between a find and a scan"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.mongodb.com/docs/manual/introduction/
  - https://www.mongodb.com/docs/manual/core/document/
  - https://www.mongodb.com/docs/manual/core/databases-and-collections/
  - https://www.mongodb.com/docs/manual/installation/
  - https://www.mongodb.com/docs/mongodb-shell/install/
say:
  - "A database outlives the process. A variable does not."
  - "MongoDB stores documents, which are JSON-like objects, in collections."
  - "An index is how a find stays fast. A unique index is also a rule."
---

## The hook

Restart the process from last session and curl `GET /quests`. The array is empty. The creates you watched return 201 lived in the memory of that one process, and the operating system took the memory back when the process exited. Nothing in Express saves your objects. A database is the other kind of memory: a separate program whose job is to keep documents after your server stops, to let every request see the same documents, and to refuse a write that breaks a rule you declared. MongoDB keeps those documents in collections. An index is how a find stays a find. A unique index is also a rule.

By the end of the session you can describe a quest collection on paper: the fields a document needs, which field is unique, what `_id` is for, and why a find on an unindexed field becomes a scan. You can say, without a metaphor doing the work, why a variable is not a database.

> *The process remembers until it dies. The vault remembers after the process is gone.*

## The idea

A database is a program that stores data outside the address space of your server. You talk to it over a connection. The Node process holds the connection, the credentials, and the query it is about to send. It does not hold the collection. When the driver acknowledges an insert, the document is the database's responsibility. Kill `node` and start it again. The connection is new. The document is still there, because it was never a property of the Node heap. That survival is durability. The array in `quests-model.js` has the opposite property. It is durable only for as long as that process stays up, which is a polite way of saying it is not durable.

MongoDB's unit of storage is a document. A document is a set of fields. The values can be strings, numbers, booleans, dates, arrays, or nested documents. You can look at one and recognize JSON. On disk the database stores BSON, a binary encoding that adds types JSON does not have, including the type of `_id`. You type JSON-like objects in the shell. The database keeps documents. The word for a group of documents is a collection. Quests live in one collection. Users will live in another. A database, in MongoDB's sense, is a named group of collections. One process of yours might use a database called `guild`, with collections `quests` and, later, `users`. Keep those words. A tutorial that borrows the vocabulary of another kind of database is talking about a different system, or it is being careless with this one.

Collections do not make every document wear the same fields. You can insert `{ title: "Ring the bell" }` and then insert `{ title: "Fetch the water", status: "open", hero: "Ada" }`. Both land. That freedom is useful when a document genuinely has optional detail, and it is also how bad data gets in. Nothing in the storage engine checks that a quest has a title unless you add something that checks. Next session Mongoose will check in the application. Today, notice that the database will store whatever document you hand it, and the only structural guarantees you get for free are the ones you create on purpose: `_id`, and any indexes you build.

`_id` is the identity field. If you insert a document and do not supply `_id`, MongoDB assigns one. An ObjectId is 12 bytes. In the shell and in JSON it usually appears as 24 hexadecimal characters. Two inserts do not share an `_id`. You do not invent identity by taking `array.length + 1` in the server, which is what the last session's model did, and which resets, or collides, the moment two processes run. The database assigns `_id` once, and the value survives restart. When a later route says `/quests/:id`, that segment will be this value, not a count you kept in a process variable.

An index is a second structure, maintained beside the collection, that maps a field's value to the documents that hold it. The collection already has an index on `_id`. A find by `_id` uses that index. A find by `title`, or by `hero`, reads documents until it has answered the query, unless you built an index on that field. Reading the documents one after another is a collection scan. At twenty documents you will not feel it. At two million documents it is a different program: every unindexed find walks the collection, and every extra field you filter in application code after the fact means you already paid to read more than you needed. The index costs something on the write, because an insert or an update has to update the index too. You pay that cost so the read does not scan. The side quest on indexes is that trade, read on purpose before the collection is large enough to make the lesson expensive.

A unique index is the same structure plus a rule. `createIndex({ hero: 1 }, { unique: true })` tells the database that two documents may not store the same `hero` value. The second insert fails with a duplicate key error. The database allowed the duplicate yesterday because you never forbade it. Unique is not a comment in your README. It is a structure MongoDB enforces when the write arrives. If the index does not exist yet, the second write succeeds, and you now have two documents and a false belief.

The Express process's job narrows. It opens a connection when it starts, it sends queries, it turns the result into the HTTP response you already know how to write. It is not the vault. Two requests handled by the same process see the same documents because both queries go to the same database, not because they share a module-level array. Two Node processes, behind a later deploy, can do the same, which an array can never do. You are not deploying two processes today. You are drawing the boundary so you do not paint yourself into the array.

What you should be able to draw on a napkin: Node holds a connection. A database holds collections. A collection holds documents. A document has fields and an `_id`. An index avoids a scan. A unique index is a rule. Restarting Node does not empty the collection. Restarting Node does empty the array.

![](diagram:session-4-4/fig1-model)

### Documents, in the shape a quest actually has

Sit with one document and name every field before you insert fifty of them.

A quest needs a `title`. It needs a `status`, and you already decided the default is `open` when the client omits it. It may name a `hero`. It does not need a copy of the whole hero's biography stuffed inside it if a hero is about to become its own collection. Nesting is for data that belongs to this quest and is read with it: a list of steps, each step a small document with a `label` and a `done` flag, is a fair nested array. A nested copy of a user, duplicated into every quest they touch, will go stale the first time the user changes name. The document model lets you embed. It does not tell you when embedding is a copy you will regret. For this session the quest stays flat: `title`, `status`, `hero`, and the `_id` you do not invent.

```js
const quest = {
  title: 'Ring the bell',
  status: 'open',
  hero: 'Ada'
};
```

That object is what you would send to an insert. After the database accepts it, the stored document also has `_id`. Your in-memory model used `id` as a string you incremented. The stored field is `_id`. The HTTP layer can still present it as `id` later, in the representation, if you want the client to see a friendlier name. The collection itself uses `_id`. Write the difference down. Mixing them is how a route looks up `id`, finds nothing, and returns 404 for a document that is sitting right there.

Field types are part of the shape even when the collection will not enforce them. `status` is a string from a small set: `open`, `done`, `failed`. `title` is a string and it is required in your rules, even though a bare insert will accept a document without it. `hero` is a string, and it is the field you will make unique if one hero can hold one active quest in this exercise. Write "required" and "unique" on the paper model as intentions. Next session those intentions become a schema and an index. Today they are still intentions unless you create the index yourself in the shell. The evidence line is that you can say which fields a quest must have before Mongoose enforces them.

Different documents may omit `hero`. That is a legal use of flexible fields. A document that omits `title` is not a different kind of quest. It is a broken one. Flexibility does not mean you stop having a shape. It means the shape is your rule, living in the application and in the indexes, rather than a rigid form the storage engine fills with empty columns.

### The shell, so you can see durability without Express

Nothing so far has installed a database. Do that now, once, from the official pages, and nowhere else. You want MongoDB Community Server running locally on port 27017, and the shell, `mongosh`, beside it. Follow the installation page for your machine: macOS at https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/ (Homebrew: `brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community`, which installs `mongosh` with it), Ubuntu on WSL or on its own at https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/ (the `mongodb-org` package includes `mongosh`; start the server the way that page's "Run MongoDB Community Edition" section shows), and any other Linux from the index at https://www.mongodb.com/docs/manual/installation/. If your install did not bring the shell, https://www.mongodb.com/docs/mongodb-shell/install/ is the shell's own page. Then confirm both halves from a terminal:

```bash
mongosh --version
mongosh --quiet --eval 'db.runCommand({ ping: 1 })'
```

The first line prints a version. The second prints `{ ok: 1 }`, which means a server is listening on 27017 and the shell can reach it. If it prints a connection error instead, the server is installed and not started. Start it the way your platform's page says, and run the ping again before you go on. A hosted cluster is not part of this unit; the vault lives on your machine.

MongoDB's shell is `mongosh`. The connection string you will use from Node later looks like `mongodb://127.0.0.1:27017/guild`. The shell can open the same database. You are not learning a second language. You are looking at the vault without the HTTP door in front of it.

```bash
mongosh "mongodb://127.0.0.1:27017/guild"
```

Then, in the shell, the collection is `db.quests`. Insert one document, then find it.

```javascript
db.quests.insertOne({ title: 'Ring the bell', status: 'open', hero: 'Ada' })
db.quests.find()
```

`find` with no filter prints the collection. You will see `_id` on the document even though you did not pass one. Copy that value. Find by it.

```javascript
db.quests.find({ title: 'Ring the bell' })
```

Quit the shell. If a `node` server is running, stop it too, with Ctrl-C. Start `mongosh` again, `use` the same database if you are not already in it via the connection string, and `db.quests.find()` again. The document is there. That is the durability evidence. Do the contrasting experiment with the array model from last session: create a quest, stop `node`, start `node`, `GET /quests`. The body is `[]`. The write never left memory. Both experiments belong in your notes. One of them is a database. The other is a variable that happened to live inside a server.

Insert a second document with the same `hero` and no unique index. `find` shows two. Then build the index and try a third.

```javascript
db.quests.createIndex({ hero: 1 }, { unique: true })
db.quests.insertOne({ title: 'Fetch the water', status: 'open', hero: 'Ada' })
```

The third insert fails with a duplicate key error. The number you will see again is `11000`. The first two documents that already share `hero` will also stop the index from building. A unique index cannot be created on data that already violates it. Clean the duplicates, then create the index, then watch the next duplicate fail. "We will check in the route" is not this test. Two clients can pass a route-level check at the same time. The index is the check that still runs when the application forgets.

### Finds, scans, and what an index is buying

A filter is not an index. `{ title: 'Ring the bell' }` says which documents qualify. It does not say how the database should locate them. With no index on `title`, the plan is a collection scan: examine documents, keep the ones whose `title` matches. With an index on `title`, the plan can look up the value and jump to the matches. `_id` is already indexed, so a find by the document's identity does not scan. That is why "look up the quest we just inserted" feels instant, and why a search box on an unindexed field feels the same until the collection grows.

You can ask the database what it did. `explain` is the tool.

```javascript
db.quests.find({ title: 'Ring the bell' }).explain('executionStats')
```

You are looking for one token in the plan, not for a benchmark. Under `queryPlanner.winningPlan`, and again under `executionStats.executionStages`, the `stage` field is either `COLLSCAN` or `IXSCAN`. `COLLSCAN` is a collection scan: the find walked documents. `IXSCAN` is an index scan: it used an index, and the plan names which one. `totalDocsExamined` tells you how many documents the operation actually touched. On a tiny collection the numbers are boring, and that boredom is the trap. The plan kind is the fact to write down. If the field you will search by shows a collection scan, the index is still missing, even if the curl returned in milliseconds.

The order of fields inside a compound index matters when you get there. A single-field index is enough for this session: one index on `hero` if hero is how you look quests up, and the unique flag if the rule is one quest per hero. Do not index every field because the list was short. Each index is more work on insert and on update. The read you actually do, by id or by the field on the map, is the one that earns an index. The side quest is the cost of having them and the cost of not having them. Read it while creating an index is still a one-line command.

`find` returns a cursor. In the shell it prints documents. In the driver it is something you iterate or turn into an array. A find that matches nothing returns no documents. It does not throw. Absence and failure are different, which matches the HTTP lesson: an empty result for a collection is an empty list, and a lookup of one id that matches nothing is a missing resource. The database is not angry. It is empty-handed.

### What the Node process still owns

Draw the process and the database as two boxes with a line between them. On the process side: the Express stack, the model functions, a connection object, and whatever variables you have not moved yet. On the database side: the `guild` database, the `quests` collection, the documents, the `_id` index, and the unique index on `hero`.

The connection string belongs in the environment, `process.env.MONGODB_URI`, not in a commit. The string contains the host, the port, and the database name. A local development string points at your machine. A hosted database points somewhere else. The code should not care which, beyond the value of that variable. You are not required to finish the driver wiring today if the session's artifact is the written model. You are required to stop adding features to the array as if it were the vault.

If the database is down, the connection fails and the process should say so and refuse to listen. A server that listens and then throws on the first request is a hung or 500-shaped outage you could have caught at startup. Last session's error handler will turn a failed query into a 500 once you are querying per request. Startup is the place where "I cannot see the vault" is a fatal line in the terminal, not a stack trace in a client's body.

Shared data is the other consequence. Two curls hit two request handlers. Both call the model. If the model queries the collection, both see the insert that happened in between. If the model reads a module-level array, both see it only until one of the processes restarts, and a second process sees a different array. The HTTP map did not change. `POST /quests` is still 201. The owner of the bytes moved out of the process.

### Bad data, named in advance

Write the failures on the model so next session's schema is a translation, not a discovery.

A quest with no `title` must not be stored. A `status` outside `open`, `done`, and `failed` must not be stored. Two documents must not claim the same `hero` once you have decided hero is unique. `_id` is assigned by the database and is not a field the client sends on create. A find by `_id` uses the identity index. A find by `title` scans until you index `title`. Documents may include extra fields today, because the collection will not stop them, and that is the hole a schema is for.

If you cannot say those sentences about your own collection, you do not have a model yet. You have a sample insert. The artifact is the sentences.

## The demonstration

Run the shell experiment against a local MongoDB. Then run the memory experiment against the server you already have. Write down both results. The point is the difference, observed, not a new framework.

If you want the driver visible in Node without Mongoose, the official driver is `mongodb`. This unit's next session uses Mongoose on top of that world, so do not build a second style of application today. A short script is enough to see an insert survive a restart of Node. Save it as `vault-check.js` in `~/projects/guild-door`, run `npm install mongodb` once so the `require` resolves, and run it with `node vault-check.js`. Delete the file before you commit. Mongoose brings its own copy of this driver next session, and the server should not carry a second way of talking to the vault. You can also skip the script entirely; the shell experiment above is the evidence that matters.

```js
const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/guild';
  const client = new MongoClient(uri);
  await client.connect();
  const quests = client.db('guild').collection('quests');
  const result = await quests.insertOne({
    title: 'Ring the bell',
    status: 'open',
    hero: 'Ada'
  });
  console.log('inserted', result.insertedId);
  const found = await quests.findOne({ _id: result.insertedId });
  console.log('found', found && found.title);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

Run it twice. You get two documents and two different `insertedId` values. Stop the process. The documents remain. Query them in `mongosh` with `db.quests.find()`. That is the evidence named in this session: a document inserted before the restart is still there after it, and `_id` does not collide with the next insert.

Then create the unique index in the shell, run the script again with the same `hero`, and watch the duplicate key error. The Node process did not decide that. The database did. If the script's `catch` only prints the message, read it. `11000` is the code you will handle on purpose when the model layer is Mongoose.

For the scan, stay in the shell. `explain` a find on `title` before you index `title`, and again after `db.quests.createIndex({ title: 1 })`. Write down which plan scanned and which plan used the index. You do not need a million documents to see the plan change. You need the plan, so the later slowness has a name.

```js run=checkpoint-4-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function memoryStore() {
  let rows = [];
  return {
    insert: function (doc) {
      rows.push(doc);
    },
    all: function () {
      return rows.slice();
    },
    restart: function () {
      rows = [];
    }
  };
}

function diskStore() {
  const rows = [];
  let seq = 0;
  return {
    insert: function (doc) {
      const copy = {};
      Object.keys(doc).forEach(function (key) {
        copy[key] = doc[key];
      });
      seq += 1;
      copy._id = 'id-' + seq;
      rows.push(copy);
      return copy;
    },
    all: function () {
      return rows.slice();
    },
    restartProcess: function () {
      return rows.length;
    }
  };
}

const memory = memoryStore();
memory.insert({ title: 'Ring the bell' });
memory.restart();
check(memory.all().length === 0, 'a variable dies when the process restarts');

const disk = diskStore();
const saved = disk.insert({ title: 'Ring the bell', hero: 'Ada' });
check(disk.restartProcess() === 1, 'a document inserted before restart is still there after it');
const second = disk.insert({ title: 'Fetch the water', hero: 'Grace' });
check(saved._id !== second._id, 'each insert receives its own _id');
check(typeof saved._id === 'string' && saved._id.length > 0, 'identity is assigned by the store');

function insertHero(docs, hero, unique) {
  if (unique) {
    for (let i = 0; i < docs.length; i += 1) {
      if (docs[i].hero === hero) return { ok: false, code: 11000 };
    }
  }
  docs.push({ hero: hero });
  return { ok: true };
}

const openVault = [];
check(insertHero(openVault, 'Ada', false).ok === true, 'the first write lands');
check(insertHero(openVault, 'Ada', false).ok === true, 'without a unique rule the duplicate lands too');

const guarded = [];
check(insertHero(guarded, 'Ada', true).ok === true, 'the first hero is stored under a unique index');
const duplicate = insertHero(guarded, 'Ada', true);
check(duplicate.ok === false && duplicate.code === 11000, 'a unique index rejects the second hero');

function examineCount(indexed, documentsInCollection) {
  if (indexed) return 1;
  return documentsInCollection;
}
check(examineCount(false, 2000000) === 2000000, 'an unindexed find reads the collection');
check(examineCount(true, 2000000) === 1, 'an index keeps the find off the full scan');

function requiredFields(doc) {
  const missing = [];
  if (!doc.title) missing.push('title');
  if (!doc.status) missing.push('status');
  return missing;
}
check(requiredFields({ title: 'Ring the bell', status: 'open' }).length === 0, 'a quest shape can be stated before a schema enforces it');
check(requiredFields({ status: 'open' }).indexOf('title') !== -1, 'a document without a title is already the wrong shape');

console.log('ok: checkpoint-4-4');
```

The checkpoint models the vault. It does not open a socket and it does not prove your local MongoDB is running. The shell session does that. If `mongosh` cannot connect, the database is not running, or the URI is wrong. That failure is about the connection box on your napkin, not about Express.

## Where it breaks

![](diagram:session-4-4/fig2-diagnosis)

### Data in a variable

Restart the process and the array is empty. The write never left memory. The 201 you returned was honest about the HTTP request and silent about durability. The client thinks the quest exists. The next process has never heard of it.

The fix is to insert into the collection and to treat the driver's acknowledgement as the moment you may send 201. A push onto an array, followed by `res.status(201)`, is the bug, even if the handler is split into a beautiful model module. The module is still the process. Look at where the object lives after the handler returns. If the only copy is in a `let` or a module-level array, you are in this diagnosis. Prove the repair the way the evidence line says: insert, stop the process, start it, read the document back from the database.

A close cousin is trusting a fixture you typed into the file. The fixture looks like data. It is source code. It vanishes the moment you deploy a different file, and it is shared by no one. Seed scripts that insert documents are fine. Arrays that pretend to be the seed are the variable again.

### No unique rule

Two documents claim the same hero, or the same email when you get to users. The database allowed it because you never forbade it. The route even checked `find` first and then inserted, and two requests passed the `find` before either insert landed. That race is why the check belongs in a unique index and not only in an `if`.

Create the index. If creation fails, the collection already contains duplicates. Find them, decide which document wins, remove or change the other, then create the index again. After it exists, the second insert errors with code `11000`. Handle that in the application when the model layer exists. Until then, you should at least see the error in the shell and recognize it. A unique: true comment in a note, with no index in `getIndexes()`, is the same bug as no rule at all.

### Scan

A find on an unindexed field reads the collection. Fine at twenty documents. A different program at two million. The symptom is a request that used to be quick and now spends its time in the database while the Node thread waits on the socket. Adding CPU to Express does not build an index.

Run `explain` on the filter you actually send. If you see a collection scan on `title` or `hero`, build the index for the field the read uses, or stop filtering that way. Do not paper over it by loading the collection into an array and filtering in JavaScript. That is a scan you moved into the process, plus a copy of the vault in the variable you just swore to abandon. The index is the smaller structure that answers the find. The collection stays on the database side of the line.

## Your turn

1. Write the quest document on paper. Fields, types, which are required, which is unique, and the fact that `_id` is assigned by the database.
2. Start MongoDB locally and open `mongosh` on the `guild` database. Insert a quest. Copy its `_id`. Find it by that `_id` and by its title.
3. Stop every Node process. Open the shell again. Confirm the document is still there. Then restart your Express process and confirm the in-memory list is empty. Write both observations in complete sentences.
4. Insert a second quest with the same `hero`. Then create a unique index on `hero`. If the index refuses to build, remove the duplicate and create it again. Insert one more duplicate and copy the error, including `11000`.
5. `explain` a find on `title` before and after an index on `title`. Write down whether each plan scanned the collection or used the index.
6. Sketch the two boxes, process and database, and put the connection string on the line between them. The string in your notes can be the local URI. Do not paste a password into the note if you add one later.

If `mongosh` is missing, or the ping in the install step did not print `{ ok: 1 }`, go back to that step and finish it before you continue. The lesson is the documents you can still see after the process is gone.

## The quest

![](diagram:session-4-4/fig3-evidence)

Write `VAULT.md`. It is the model of the quest collection, in your words, and it has to include:

- The database name and the collection name, and a statement that these are documents in a collection.
- One sample document, including an `_id` you actually received from an insert, with the fields you require.
- The unique field, the index command you ran, and the duplicate-key result you got when you violated it.
- The difference, from your own restarts, between the array and the collection.
- Which find used the `_id` index, and which find scanned until you added an index.
- A sentence on what the Express process holds instead of the data: the connection, not the documents.

Six short sections are enough. Commit `VAULT.md`. Do not commit a dump of the database, and do not commit a URI that contains a password. The paper model is the artifact. The documents stay in the vault.

## Side quests

MongoDB is one answer in the SQL-versus-NoSQL trade-off, and the unique field plus the find-by-id you will write next are indexes, with a cost on the write and a cost if you skip them.

## Before next session

Next session puts a keeper at the door of this collection. Mongoose is a schema, a model, and validators that run when you save, and the queries it gives you return promises. The collection is still the collection. Read the Mongoose guide's opening, the validation page, and the section of the queries page that shows `await` on a find. Arrive knowing that `unique` is an index helper and not a validator that runs in JavaScript, because the validation page says so and the duplicate you just produced is the proof.

Bring `VAULT.md`. The schema you write should be a translation of that page, not a new invention with a different set of fields. Leave MongoDB running; it is a service now, and it stays up between sessions. Stop any `node` process with Ctrl-C.
