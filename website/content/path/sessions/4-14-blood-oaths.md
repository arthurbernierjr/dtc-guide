---
editorial: true
title: Blood Oaths
subtitle: Many-to-many relationships with Express and Mongoose
hook: "A spell has one owner. A party has many members, and a member stands in many parties. That second sentence is a different shape, and Mongoose will not invent it for you."
read: 55
artifact: "Parties and adventurers as a many-to-many, with a join collection and populate"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://mongoosejs.com/docs/populate.html
  - https://mongoosejs.com/docs/subdocs.html
  - https://mongoosejs.com/docs/schematypes.html
say:
  - "One-to-many is a ref on the many side. Many-to-many needs a join, or two arrays you must keep honest."
  - "populate replaces an id with the document it points at, in the query result, not in the database."
  - "A unique compound index on the pair stops the same member from joining the same party twice."
---

## The hook

A spell has one owner. You stored that fact as an id on the spell, and you listed Sera's spells by asking the spells collection for that id. One side holds the ref. The other side does not keep a second list. That shape has a name: one-to-many, seen from the user, or many-to-one, seen from the spell. A party does not fit it. A party has many members, and a member stands in many parties. Mara can be scout of the Night Watch and healer of the River Company in the same week. The Watch has Mara and Ivo and whoever takes the gate tomorrow. That second sentence is a different shape, and Mongoose will not invent it for you.

One-to-many is a ref on the many side. Many-to-many needs a join, or two arrays you must keep honest. The join this session is a membership: one document with a party, a member, and a role. The role is the reason a pair of arrays cannot be patched into honesty later. Scout is not a fact about Mara alone, and it is not a fact about the Watch alone. It is a fact about Mara in the Watch. The document that stores the pair is the document that can store the role.

`populate` replaces an id with the document it points at, in the query result, not in the database. A unique compound index on the pair stops the same member from joining the same party twice. By the end you can list a party's members and list an adventurer's parties, get the same story from both questions, and watch a second insert of the same pair fail with a duplicate-key error. The collections still contain ids. The JSON you send to the screen contains names, because you asked Mongoose to fill the result.

> *An oath that is written in two pockets will, sooner or later, be found in only one of them.*

## The idea

Start from the shape you already trust. `Spell.owner` is an ObjectId. The [SchemaTypes](https://mongoosejs.com/docs/schematypes.html) page is where ObjectId is defined as a type, and `ref` is the option that tells Mongoose which model that id belongs to. Nothing in the user document lists spell ids. When you want Sera's spells you query the many side: `Spell.find({ owner: seraId })`. One write created the relationship. There is no second write to forget. If you also pushed the spell id onto `user.spells` "so the profile is easy to load," you created a second copy of the truth. Delete the spell and forget the pull, and the profile still boasts a spell the collection does not have. You did not do that for spells. Do not start doing it for parties.

Many-to-many is the case where each side genuinely has many of the other, and you want to ask the question from both directions. Parties have many adventurers. Adventurers have many parties. A single ref cannot point at many documents. An array of refs on the party, `members: [{ type: ObjectId, ref: 'Adventurer' }]`, can. Populate can even expand that array. The trouble is the other direction. To list Mara's parties without scanning every party, you also store `parties: [{ type: ObjectId, ref: 'Party' }]` on the adventurer. Now the relationship is written twice. Those two arrays drift.

Walk the drift with ids, because the bug is boring and mechanical. The Night Watch is `p1`. Mara is `a1`. The join handler does two updates:

```js
await Party.updateOne({ _id: p1 }, { $push: { members: a1 } });
await Adventurer.updateOne({ _id: a1 }, { $push: { parties: p1 } });
```

The process dies after the first `updateOne`. The Watch's `members` array contains `a1`. Mara's `parties` array is still empty. The party page shows Mara. Mara's page shows no party. Nothing in MongoDB is inconsistent with itself. Each document is valid. The relationship, which you invented as two fields, is not valid. A later request that "leaves" the party pulls `a1` out of the Watch and throws before it pulls `p1` out of Mara, if she ever got the id at all. Now she lists a party that does not list her, or the party lists her and she lists nothing. Two arrays were updated in two requests, and one failed. That is the whole diagnosis. `$addToSet` stops duplicates inside one array. It does not make the second write happen. A transaction can make the two writes succeed or fail together, and you may use one later. A transaction around two caches of the same fact is a lot of machinery for a fact that could have been one document.

There is a second failure even when both writes succeed. Mara is scout in the Watch and leader in the River Company. The role has nowhere to live. On Mara, one `role` field would have to be both. On the party, one `role` field would be the role of every member. You can stuff `{ member, role }` into the party's array and `{ party, role }` into Mara's array. Then you have two copies of the role, and they drift too. Ivo edits her role on the party page. The profile page still says scout. You have doubled every bug.

The join is one document. Call the collection `memberships`. Each document is one oath.

```js
const mongoose = require('mongoose');

const adventurerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }
});

const partySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  banner: { type: String, default: '' }
});

const membershipSchema = new mongoose.Schema({
  party: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Adventurer', required: true },
  role: {
    type: String,
    required: true,
    enum: ['leader', 'scout', 'healer', 'warden']
  }
});

membershipSchema.index({ party: 1, member: 1 }, { unique: true });

const Adventurer = mongoose.model('Adventurer', adventurerSchema);
const Party = mongoose.model('Party', partySchema);
const Membership = mongoose.model('Membership', membershipSchema);

module.exports = { Adventurer, Party, Membership };
```

Creating an oath is one `Membership.create`. Either the document is there or it is not. Listing the Watch's members is `Membership.find({ party: p1 })`. Listing Mara's parties is `Membership.find({ member: a1 })`. Both queries read the same collection. They cannot disagree about whether the oath exists. The role is a field on that document, so changing it is one update. There is no second array to schedule.

The [subdocuments](https://mongoosejs.com/docs/subdocs.html) page is the alternative you should be able to refuse out loud. A subdocument lives inside the parent document. It does not have its own collection. If a member had no life outside one party, embedding `members` inside the party would be the right shape, and you would not need a join. Adventurers in this world have names, and they show up in more than one party, and you look them up on their own. Embedding copies Mara into the Watch document and copies her again into the River Company document. Rename her, and you must find every copy. A subdocument also cannot be the target of a ref from somewhere else without you inventing yet another id scheme. Refs and a join keep one Mara.

The compound index is the rule that the pair is unique. `membershipSchema.index({ party: 1, member: 1 }, { unique: true })` asks MongoDB for one index on the two fields together. The same party with the same member cannot be inserted twice. The same member with a different party can. The same party with a different member can. That is what "many" means. `unique: true` written on `party` alone is a different index. It means a party id may appear in the collection once, so a party can have only one membership, which is a one-member party forever. `unique: true` on `member` alone means an adventurer can swear only one oath in the whole collection. Two separate unique flags are two one-to-one rules. They are not a compound index you forgot to spell in one line.

`unique` on a nested path is a third, quieter miss. People embed `{ party, role }` inside the adventurer and mark the nested `party` unique, and they believe they have declared "this pair, once." Mongoose's `unique` option is not a validator that runs in JavaScript. It is a helper that builds an index, and an index on a nested path is not the compound `{ party: 1, member: 1 }` you would have declared on a join collection. The duplicate oath still inserts, or the index forbids something broader than the pair. The diagnosis is exact: the same pair was inserted twice because the unique index was never created. Confirm the index in the shell with the collection's `getIndexes()`. In development Mongoose builds indexes from the schema on startup because `autoIndex` defaults to on. An index added after duplicate pairs already exist will fail to build until you remove the duplicates. The error on a second insert, once the index exists, is the duplicate-key error, code `11000`. You already map that code to a conflict on the user email. Map it here too. The pair is taken. 409 is an honest status.

What you should be able to redraw tomorrow: three collections. Adventurers and parties stand alone. Memberships point at one of each and store a role. The index is on the pair. Queries for "who is in this party" and "which parties is this person in" are both finds on memberships. Populate is a read-time step on top of those finds, and it is next.

![](diagram:session-4-14/fig1-model)

### What populate changes, and what it leaves on disk

The page to read with the shell open is [mongoosejs.com/docs/populate.html](https://mongoosejs.com/docs/populate.html). The first sentence defines the tool: population is the process of automatically replacing the specified paths in the document with documents from other collections. You may populate one document, many documents, or the documents a query returns. The page then shows a story and an author. The story stores `author` as an ObjectId. After `populate('author')`, `story.author.name` is the person's name. The sentence to keep, from that same page, is this: populated paths are no longer set to their original `_id`; their value is replaced with the mongoose document returned from the database by performing a separate query before returning the results.

Read the last clause slowly. A separate query. Before returning the results. Populate does not write the join back into MongoDB. It fills the query result. The membership document on disk still holds `party` and `member` as ObjectIds. You wrote those ids when you created the membership. Populate, later, loads the adventurer in another query and swaps the id for that adventurer in the object about to be sent to you. Open the collection in `mongosh` and `member` is still an id. Hit the route that populates, and the JSON contains `member.name`. Same stored document. Two views. If you skip `populate` and still write `membership.member.name` in the client, `name` is missing, because you sent the foreign key and called it the object.

```js
async function membersOf(req, res) {
  const rows = await Membership.find({ party: req.params.partyId }).populate('member');
  res.json(rows);
}

async function partiesOf(req, res) {
  const rows = await Membership.find({ member: req.params.adventurerId }).populate('party');
  res.json(rows);
}
```

Those two handlers are the evidence named Both ways. They tell the same story because they read the same collection. `populate('member')` on the first replaces the member id. `populate('party')` on the second replaces the party id. You can populate both on either query when the screen needs both names. Chain `populate` on the query. The page notes that `Document#populate()` does not chain the same way; call it the way the query examples call it, on the query, before you await.

```js
const rows = await Membership.find({ party: partyId }).populate('member').populate('party');
```

The stored join did not gain a copy of Mara. If you `JSON.stringify` the result and also print the value of `rows[0].member` before populate, you can see the swap in one process. After populate, `rows[0].member` is a document with `name`. The id is still available. The populate page points out that you can read `story.author._id` whether or not the path is populated, because Mongoose gives ObjectIds an `_id` getter. Use that when you need the id for a link. Use `populated('member')` when you need to know which view you are holding.

A missing adventurer does not throw inside populate. The page says Mongoose populate does not behave like a conventional SQL join: when there is no document, the path is `null`. That is the case where someone deleted Mara and left the oath behind. `row.member.name` then throws, because `null` has no `name`. Guard it, or delete the memberships when you delete the adventurer. The guard is a render problem. The orphan oath is a data problem. Populate will not clean it up for you, which is consistent with populate not writing anything.

Saving is a separate act, and the populate page says so in the section on saving refs. You assign the `_id`. `Membership.create({ party: partyId, member: adventurerId, role: 'scout' })` is the write. If you later take a populated document and save a parent, do not expect MongoDB to store the whole adventurer inside the membership. The relationship column is an id. The expanded object was a result. Treating populate as a save is how a route that "joins" two people never creates a membership at all: the handler loads a party, populates an empty `members` array, pushes a name in memory, and responds 200. The collection is unchanged. Create the membership. Then populate on the read.

### The routes around one oath

```js
async function swear(req, res) {
  const partyId = req.body && req.body.party;
  const memberId = req.body && req.body.member;
  const role = req.body && req.body.role;
  const allowed = ['leader', 'scout', 'healer', 'warden'];
  if (!partyId || !memberId || allowed.indexOf(role) === -1) {
    return res.status(400).json({ error: 'party, member, and role are required' });
  }
  const party = await Party.findById(partyId);
  const member = await Adventurer.findById(memberId);
  if (!party || !member) return res.status(404).json({ error: 'party or member missing' });
  try {
    const oath = await Membership.create({ party: party._id, member: member._id, role: role });
    const filled = await oath.populate('member');
    res.status(201).json(filled);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'already sworn' });
    throw err;
  }
}
```

The two creates are one `create` each, and the five routes are mounted on `app` after `express.json()`, with the parameter names the handlers above read:

```js
async function createParty(req, res) {
  const name = req.body && typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (name === '') return res.status(400).json({ error: 'name required' });
  const banner = req.body && typeof req.body.banner === 'string' ? req.body.banner : '';
  const party = await Party.create({ name: name, banner: banner });
  res.status(201).json(party);
}

async function createAdventurer(req, res) {
  const name = req.body && typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (name === '') return res.status(400).json({ error: 'name required' });
  const adventurer = await Adventurer.create({ name: name });
  res.status(201).json(adventurer);
}

app.post('/api/parties', createParty);
app.post('/api/adventurers', createAdventurer);
app.post('/api/memberships', swear);
app.get('/api/parties/:partyId/members', membersOf);
app.get('/api/adventurers/:adventurerId/parties', partiesOf);
```

`oath.populate('member')` in `swear` fills the document you just created, in memory, for the response. The insert already wrote ids. The 201 body can include Mara's name so the screen does not immediately refetch. Look at the collection afterward if you want the proof in both places. The id is what got stored.

Changing a role is `findOneAndUpdate` on the pair, or on the membership id, setting `role`. It is not a rewrite of two arrays. Leaving the party is `findOneAndDelete` on the pair. One delete. The party document and the adventurer document do not change, because they never stored the relationship.

The screen is a list. A party page fetches `GET /api/parties/:partyId/members` and renders `row.member.name` and `row.role`. The key is the membership `_id`, not the index, and not the member id alone if you ever showed a list that could contain the same person twice. Your index forbids that duplicate, so the member id would also be unique inside one party's list. The membership id is still the honest key, because the row is the oath. An adventurer page fetches the other route and renders `row.party.name` and `row.role`. Same component habits as the spell list. Different document.

If these routes sit on the app you already protect with a token, mount them behind the middleware. The relationship lesson does not replace the owner lesson. A party might be visible to every account, while only a leader can swear someone in. That is an authorization rule on the route. It is not a reason to encode the membership as two arrays. Get the document shape right first. The token check is the one you already know how to write.

## The demonstration

Stop the spellbook first, in both terminals, so nothing is listening when you start this one. Three models, from the schema block. A small Express app in a new folder, `~/projects/oaths` (`mkdir oaths && cd oaths && npm init -y && npm install express mongoose`), that can create an adventurer, create a party, create a membership, and list both directions with populate. No accounts and no token today; the relationship is the whole lesson. Its `.env` has one line, `MONGODB_URI=mongodb://127.0.0.1:27017/oaths`, so this experiment cannot be confused with the spellbook (`unset MONGODB_URI` if the shell still exports an older one), and `node --env-file=.env server.js` listens on `3000`. You do not need a second React app unless you want the names on a screen. A screen is worth it for ten minutes, because `member.name` being undefined is easier to see in a row than in a terminal. The curl checks below are enough if you would rather stay in the shell.

Create the Watch and the River Company. Create Mara and Ivo.

```bash
curl -s -H 'Content-Type: application/json' -d '{"name":"Night Watch","banner":"black"}' http://localhost:3000/api/parties
curl -s -H 'Content-Type: application/json' -d '{"name":"River Company","banner":"blue"}' http://localhost:3000/api/parties
curl -s -H 'Content-Type: application/json' -d '{"name":"Mara"}' http://localhost:3000/api/adventurers
curl -s -H 'Content-Type: application/json' -d '{"name":"Ivo"}' http://localhost:3000/api/adventurers
```

Swear Mara into the Watch as scout with `POST /api/memberships`, using the ids the creates returned:

```bash
curl -s -H 'Content-Type: application/json' -d '{"party":"WATCH_ID","member":"MARA_ID","role":"scout"}' http://localhost:3000/api/memberships
```

Swear her into the River Company as healer. Swear Ivo into the Watch as warden. Then swear Mara into the Watch again. The second Watch oath is the 409. The River Company oath still exists. That is the compound index, not a ban on Mara.

List the Watch with `GET /api/parties/:partyId/members`. The JSON members are Mara and Ivo, with roles, and each `member` is an object with `name`. List Mara with `GET /api/adventurers/:adventurerId/parties`. The JSON parties are the Watch and the River Company. If either list shows a raw id where you expected a name, the route forgot `populate`. If the two lists disagree about whether the Watch oath exists, you are not reading memberships for both. You have a leftover array.

In `mongosh`, find one membership. `party` and `member` are ObjectIds. That is the evidence that populate filled the query result and did not rewrite the join. The HTTP response and the shell document are supposed to look different. If the shell document contains Mara's name inside `member`, something wrote an embedded object. The schema's ObjectId type should have rejected that on the way in, or cast it. An embedded name means the write path bypassed the model. Fix the write. Do not "fix" the read by embedding on purpose. You already decided these people are not subdocuments.

The checkpoint models the drift, the single join, the populate swap, and the pair index. It keeps those as plain objects so this page can run the model without a database. The curls are the demonstration that has a database.

```js run=checkpoint-4-14
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function joinWithArrays(party, member) {
  var partyMembers = party.members.slice();
  partyMembers.push(member.id);
  return {
    partyListsMember: partyMembers.indexOf(member.id) !== -1,
    memberListsParty: member.parties.indexOf(party.id) !== -1
  };
}

var drifted = joinWithArrays(
  { id: 'p1', members: [] },
  { id: 'a1', parties: [] }
);
check(drifted.partyListsMember === true && drifted.memberListsParty === false, 'a failed second write leaves the arrays in disagreement');

function swearJoin(store, oath) {
  var key = oath.party + ':' + oath.member;
  if (store[key]) return { ok: false, code: 11000 };
  store[key] = { party: oath.party, member: oath.member, role: oath.role };
  return { ok: true, oath: store[key] };
}

var oaths = {};
var first = swearJoin(oaths, { party: 'p1', member: 'a1', role: 'scout' });
check(first.ok === true && first.oath.role === 'scout', 'one membership stores the pair and the role');
check(swearJoin(oaths, { party: 'p1', member: 'a1', role: 'leader' }).code === 11000, 'the same pair is rejected');
check(swearJoin(oaths, { party: 'p2', member: 'a1', role: 'healer' }).ok === true, 'the same member can join a different party');

function populateResult(stored, adventurers) {
  return {
    storedMember: stored.member,
    resultMember: adventurers[stored.member]
  };
}

var stored = { party: 'p1', member: 'a1', role: 'scout' };
var view = populateResult(stored, { a1: { id: 'a1', name: 'Mara' } });
check(view.storedMember === 'a1', 'the stored join keeps the id');
check(view.resultMember.name === 'Mara', 'populate fills the query result');

function partiesOf(store, memberId) {
  var found = [];
  Object.keys(store).forEach(function (key) {
    if (store[key].member === memberId) found.push(store[key].party);
  });
  return found;
}
function membersOf(store, partyId) {
  var found = [];
  Object.keys(store).forEach(function (key) {
    if (store[key].party === partyId) found.push(store[key].member);
  });
  return found;
}
check(partiesOf(oaths, 'a1').length === 2, 'listing an adventurer reads the same oaths');
check(membersOf(oaths, 'p1').indexOf('a1') !== -1, 'listing a party reads the same oaths');

console.log('ok: checkpoint-4-14');
```

## Where it breaks

![](diagram:session-4-14/fig2-diagnosis)

### Array drift

The party lists the member and the member does not list the party. Or the member lists the party and the party page is blank. You updated two documents, and one of the updates did not stick. Sometimes both stuck and then a third request, a leave or a rename of a role, touched only one side. The screens diverge. Refreshing does not help, because both screens are telling the truth about the document they loaded. The documents disagree with each other.

Stop writing the relationship in two places. Create a membership. Delete a membership. Change `role` on a membership. If you already have arrays full of ids, treat them as a migration problem: for each id in `party.members`, insert a membership if the pair is not there, then stop reading the arrays. Do not keep the arrays "just in case the join is slow." A second cache is how the drift comes back. If a page needs both names, populate. If a page is slow, that is an index conversation, and the compound index you declared is already the index a pair lookup uses. It is not a reason to denormalize on the first afternoon.

A transaction is the grown-up version of the two-array write, and it is the wrong first answer here. You would be paying for atomicity on a design that does not need two writes. Use the join. Leave transactions for a transfer that really is two facts, which the next session's pack will tempt you with. Even there, the conditional update is usually the smaller tool.

### Populate missed

The client received ids and tried to read `member.name`. The row renders blank, or the render throws because the id string has no `name`. The network response shows `"member": "64f..."` or an object that looks like an ObjectId, not `"member": { "name": "Mara" }`. You sent the foreign key and called it the object. The React component is fine. The query never called `populate`.

Add `populate('member')` or `populate('party')` on the query that feeds that screen. Restart the API. Reload. The name appears, and `mongosh` still shows the id. If the name does not appear and the response is still an id, the `ref` on the schema does not match the model name. `ref: 'Adventurer'` must be the same string you passed to `mongoose.model`. A typo there makes populate look at a model that has no such id, and the path becomes `null`, which is the missing-document behavior from the docs. Fix the `ref`. Do not embed the name to make the component happy.

The other direction of this bug is populating and then believing the database now stores the nest. You inspect the result in the Node log, see Mara's name, and skip the `mongosh` check. Later a different route forgets populate and the name is gone, and you think the write disappeared. The write of the name never happened. Put both checks in your notes once: the JSON shape, and the stored shape. They are supposed to differ.

### Duplicate oath

The same pair was inserted twice because the unique index was never created. The party page shows Mara twice, as scout and as scout, or as scout and as leader. `getIndexes()` on `memberships` shows `_id` and does not show the compound key on `party` and `member`. Mongoose never saw `schema.index`, or the index build failed because duplicates were already there, or you set `unique: true` on a nested path and got an index that does not mean what you think.

Declare the compound index on the membership schema. Remove the duplicate documents. Restart the process so the index can build, or create the index once you know the collection is clean. Insert the pair again and expect code `11000`. Map that code to 409 in the route so the client can say "already sworn" instead of painting a stack trace. A unique flag on `party` by itself is not a partial success. Drop that index if you created it. It forbids a second member. The compound index is the one that forbids only the repeated pair.

If the second insert succeeds and `getIndexes` shows the compound index, you are inserting a different pair than you think. Cast the ids to strings and compare. ObjectIds that print alike can still be different values if you copied them by eye and dropped a character. Log both ids from the document that got inserted. The index is not wrong. The pair is not the pair you named.

## Your turn

Build the three collections and the two directions.

1. Models for adventurers, parties, and memberships. The membership has `party`, `member`, and `role`. The compound unique index is declared with `schema.index`, not with `unique: true` on each field.
2. `POST /api/parties`, `POST /api/adventurers`, and `POST /api/memberships`. The membership create checks that both targets exist, and it turns code `11000` into 409.
3. `GET /api/parties/:partyId/members` lists memberships for one party and populates `member`. `GET /api/adventurers/:adventurerId/parties` lists memberships for one adventurer and populates `party`.
4. Swear one person into two parties with two roles. Swear a second person into the first party. List both directions and write down the names you see.
5. Insert the first pair again. Record the status and the index name from `getIndexes`.
6. In `mongosh`, show that `member` on a stored membership is still an id after a populated request returned a name.
7. Optional, and worth it: a page with two lists, keyed by membership id, reading `member.name` or `party.name`. Break the page once by removing `populate`, see the missing name, and put `populate` back.

If you feel the urge to add `members` onto the party "for convenience," write the drift story in a comment you then delete, and do not add the array. The convenience is the bug.

## The quest

![](diagram:session-4-14/fig3-evidence)

Write `OATHS.md` beside the models.

- Pair. One membership you created: the party id, the member id, and the role. The 201 body, and a note that the role lives on the membership.
- Both ways. The names on the party list and the names on the adventurer list, and the sentence that says they came from one collection.
- Reject. The status and error code from the second insert of the same pair, and the index you saw in `getIndexes`.
- Disk versus result. What `mongosh` shows for `member`, and what the populated JSON shows for `member`. Quote the populate doc's claim that the path is replaced in the results by a separate query: [populate](https://mongoosejs.com/docs/populate.html).
- The array design you did not ship, in two sentences: which write would have been the one that failed, and where the role would have had to be copied.

Commit the models, the routes, and the note. This join is the one the hall's pack will imitate. The hall's letters will not. You want the difference in your hands before the project asks you to pick, under time, for every link on the screen.

## Side quests

The compound unique index on party plus member has a write cost the indexing sheet explains, and a join collection is the document version of a join table the SQL-versus-NoSQL sheet will help you defend.

## Before next session

Next session is the guild hall, the unit's project. Accounts you already know how to seal. An inbox between them. A catalog of potions, weapons, and armor, and a pack that says how many of each you carry. One of those links is the join you just built. One of them is not. A message has one sender and one recipient. That is one-to-many from each user, and it does not need a membership. A holding joins a person to a catalog item and stores a quantity. That is the many-to-many. Come in able to point at a feature and say which shape it is before you create a schema. The hall is mostly that choice, plus the rule that you may not read someone else's letter just because you know its id.
