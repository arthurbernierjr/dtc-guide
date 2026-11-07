---
editorial: true
title: The Guild Hall
subtitle: Messages, inventory, and a small social world
hook: "The unit's project. Accounts you already know how to seal, an inbox between them, and a pack of potions, weapons, and armor. Not every link is many-to-many. You have to say which is which."
read: 70
artifact: "A guild hall: JWT accounts, an inbox of messages, and an inventory of catalog items with quantities"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://mongoosejs.com/docs/populate.html
  - https://mongoosejs.com/docs/subdocs.html
  - https://react.dev/learn
  - https://expressjs.com/en/guide/routing.html
  - https://github.com/auth0/node-jsonwebtoken#readme
say:
  - "A message has one sender and one recipient. That is one-to-many from each user, not many-to-many."
  - "An item in the catalog is shared. A holding joins a user to an item with a quantity. That join is the many-to-many."
  - "The inbox route checks that the token's user is the recipient. Anyone else's id in the URL is 403."
---

## The hook

The hall is the unit's project. Accounts you already know how to seal. An inbox between those accounts. A catalog of potions, weapons, and armor, and a pack that says how many of each an account carries. The work is not a new kind of program. It is the shapes you have, chosen on purpose, for links that do not all deserve the same schema.

A message has one sender and one recipient. That is one-to-many from each user, not many-to-many. Bran writes to Sera. The document points at Bran and at Sera. It does not point at a set of readers, and it does not need a membership row to exist. An item in the catalog is shared. Lamp oil is one definition, and every account may carry some. A holding joins a user to an item with a quantity. That join is the many-to-many. The quantity lives on the holding. It does not live on the catalog. If it did, Bran drinking a potion would change the definition Sera sees.

The inbox route checks that the token's user is the recipient. Anyone else's id in the URL is 403. A pack update that would step past zero does not write a negative number. By the end, Bran can send Sera a letter, Sera can read it, Ivo cannot, and the lamp oil Bran carries is a number on his holding while the catalog still says what lamp oil is. None of this is a deploy. The process listens on your machine. When you stop it, the hall is down.

> *A letter has one name on the front. A pack is the crowd, and the crowd is counted on the strap, not on the recipe.*

## The idea

Three rooms, and the first one is already built in your hands. Accounts are register and login. The password is hashed. The login compares and signs a token whose `sub` is the user id. The middleware reads `Authorization: Bearer` and verifies, or it answers 401. [node-jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) is the same library. Set `audience: 'guild'` on sign and on verify so a token from the spellbook does not open the hall just because the secret was reused. You have seen that bug. The hall is where it would actually hurt, because the hall holds other people's letters. Give the user a display `name` as well as an email. The name is what an inbox shows for the sender. The email stays unique. The hash stays off every response. `populate('sender', 'name')` is how a message query asks for the name and not the hash. If you populate `sender` with no field list, the user document rides along, hash included, into the JSON. The second argument is a selection. Use it.

The user schema is the slate's with one more field, and the register body carries it:

```js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
```

`POST /api/register` takes `{ "name": "Bran", "email": "bran@example.com", "password": "..." }`, hashes the password, and answers 201 with the name and the email. `POST /api/login` is unchanged: email and password in, token out.

The inbox is the room people will model wrong, because the last session's join is fresh and every link starts to look like a pair that needs a membership. Draw one message. It has a body, a sender id, and a recipient id. Bran has many messages he sent. That is one-to-many: the many side is the message, the ref is `sender`. Sera has many messages she received. That is another one-to-many, the ref is `recipient`. A given message is not a crowd of recipients. Many-to-many would be a message linked to a set of users, or a join collection of participants with a role on the pair. You do not have that feature. You have a letter. Store it as a letter.

```js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 }
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = { Message };
```

The indexes are on `recipient` and on `sender` because those are the fields the inbox and the outbox query every time. They are not a compound unique index. Bran may write Sera more than once. Uniqueness would be the wrong rule, carried over from memberships because the last file still had `schema.index` in your fingers. Two different indexes, one field each, are what this collection needs. [Schema types](https://mongoosejs.com/docs/schematypes.html) are the same ObjectId and `ref` you used for `owner`. The new decision is how many refs, and what a query is allowed to return.

`POST /api/messages` takes a recipient id and a body. The sender is `req.userId`. The client does not get to name the sender. Check that the recipient exists and is not the sender, unless you have a reason to allow a note to yourself. A missing recipient is 404. An empty body is 400. The created document is the letter.

`GET /api/inbox` is `Message.find({ recipient: req.userId })`, newest first, with the sender populated down to `name`. There is no `userId` query parameter. If you accept one, Bran can ask for Sera's inbox by putting her id in the URL, and the token did nothing but prove Bran is somebody. The recipient is the token.

`GET /api/outbox` is `Message.find({ sender: req.userId })`, with the recipient's name populated. This is how the sender sees the letter they wrote. It is a different route from reading by id.

`GET /api/messages/:id` loads the document. If the id matches nothing, 404. If the document exists and `String(message.recipient)` is not `String(req.userId)`, 403. That includes the sender. Bran does not get this route for a letter he sent. His copy is the outbox list. Ivo, who is neither, gets 403 when the id exists. The comparison has to be on strings, or it has to use `equals`, because an ObjectId and the string in `req.userId` are not `===`. A strict comparison that is always false 403s Sera out of her own letter. Cast both sides to strings and then compare. The contract is 403 for the wrong reader, not a quiet 404. A 404 would hide whether the id exists. This hall says forbidden, out loud, so a wrong reader can see the door and still cannot see the body. Build the check before you write the JSON. A handler that `res.json(message)` as soon as `findById` returns is the mail leak. The id was enough. The token was decoration.

The pack is the other room, and it is the join. The catalog is a collection of items. Each item has a name and a kind. The kind is an enum: `potion`, `weapon`, or `armor`. Nothing else. No quantity. The catalog answers "what is this thing." It is shared. One Lamp oil. One Short sword. One Leather coat. Seeding three documents is enough to prove the enum. A fourth kind, `scroll`, is a validation error. [Subdocuments](https://mongoosejs.com/docs/subdocs.html) would be the wrong place to put the catalog, nested inside one user, because then Sera's lamp oil and Bran's lamp oil would be two definitions. The definition is one document in `items`.

```js
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  kind: { type: String, required: true, enum: ['potion', 'weapon', 'armor'] }
});

const Item = mongoose.model('Item', itemSchema);
```

A holding is the membership shape with a number where the role was.

```js
const holdingSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  qty: { type: Number, required: true, min: 0 }
});

holdingSchema.index({ owner: 1, item: 1 }, { unique: true });

const Holding = mongoose.model('Holding', holdingSchema);
```

One user, one item, one row. The quantity is that row's `qty`. Bran carrying three lamp oils is a holding with `qty: 3`, not three holdings and not a `qty` on the item. A second give of lamp oil to Bran increments the same holding. The compound unique index makes the second insert fail, which is how you notice you should have incremented. Two holdings of the same item for the same user cannot exist. Listing Bran's pack is `Holding.find({ owner: branId }).populate('item')`. Populate fills the query result. The holding on disk still stores an item id. The JSON can say `item.name` and `item.kind` because you populated. The catalog row's fields do not include a count, so the screen cannot accidentally show a global stock unless you add one.

Giving and spending are updates to `qty`, and spending is where the pack goes negative if you do the arithmetic in JavaScript. The wrong transfer reads the holding, subtracts, and saves. Two requests can both read `1`. Both write `0`. You gave away two potions and kept the number at zero. Or a request reads `0`, subtracts `1`, and saves `-1`. The UI shows a debt. `min: 0` on the schema does not save you on that path if the update never runs validators. `findOneAndUpdate` skips them unless you pass `runValidators: true`, and a validator is still the wrong tool for a race, because the check and the write have to be the same operation. The filter is the check.

```js
async function spend(ownerId, itemId, amount) {
  if (!Number.isInteger(amount) || amount < 1) {
    const error = new Error('amount must be a positive integer');
    error.status = 400;
    throw error;
  }
  const updated = await Holding.findOneAndUpdate(
    { owner: ownerId, item: itemId, qty: { $gte: amount } },
    { $inc: { qty: -amount } },
    { new: true }
  );
  if (!updated) {
    const error = new Error('not enough');
    error.status = 409;
    throw error;
  }
  return updated;
}
```

`qty: { $gte: amount }` means the document is updated only when it already holds enough. One of two concurrent spends of the last potion matches. The other matches nothing and gets `null`. You answer 409. You never write `-1`. A transfer to another account is this debit, and then a credit on the recipient's holding, and the credit runs only if the debit returned a document. If the debit fails, the recipient's pack does not grow. If the debit succeeds and the credit throws, the quantity has left Bran and not reached Sera. That window is real. Name it. The bug this session requires you to kill is the negative number, and the conditional debit kills it. A transaction around the two holdings is the later tool for the lost-item window. Do not skip the conditional update because a transaction "would also work." The negative pack is the update that was not conditional.

The credit side is an increment with an upsert, so Sera gains a holding if she had none.

```js
async function credit(ownerId, itemId, amount) {
  return Holding.findOneAndUpdate(
    { owner: ownerId, item: itemId },
    { $inc: { qty: amount }, $setOnInsert: { owner: ownerId, item: itemId } },
    { new: true, upsert: true }
  );
}
```

`$inc` on a missing quantity starts from zero inside MongoDB. `$setOnInsert` writes the pair only when the row is created. The unique index still forbids two rows. A race of two upserts for a brand-new pair can make one of them lose with code `11000`. Retry the increment without `upsert` when you see that code. The retry finds the row the winner inserted.

The screen is the same client habits, on a wider tree. [react.dev/learn](https://react.dev/learn) is still the map. The parent holds the token. An effect loads the inbox when the token is present, with the bearer header, and it does not say the letter exists until the response is 2xx. A compose handler posts the body and the recipient id, and it keeps the draft if the status is not a 2xx. The pack effect loads holdings and reads `holding.item.name`, `holding.item.kind`, and `holding.qty`. The key on a holding row is the holding id. The key on a message row is the message id. A catalog list is a third effect, and it shows name and kind and no count. [The routing guide](https://expressjs.com/en/guide/routing.html) is how those paths are registered. None of them is a deploy script. `app.listen` on a local port is the hall being open.

A sketch of the whole hall, before the files: users with a hash and a name. Messages with one sender and one recipient, listed by the token, read by id only when the token is the recipient. Items with a kind enum and no quantity. Holdings with owner, item, and qty, unique on the pair, changed by a conditional decrement. Populate on the way out. The database stores ids.

![](diagram:session-4-14/fig1-model)

### The letter, and the door on it

```js
async function sendMessage(req, res) {
  const body = req.body && typeof req.body.body === 'string' ? req.body.body.trim() : '';
  const recipientId = req.body && req.body.recipient;
  if (body === '' || !recipientId) return res.status(400).json({ error: 'recipient and body are required' });
  if (String(recipientId) === String(req.userId)) {
    return res.status(400).json({ error: 'choose another account' });
  }
  const recipient = await User.findById(recipientId).select('name');
  if (!recipient) return res.status(404).json({ error: 'no such account' });
  const message = await Message.create({
    sender: req.userId,
    recipient: recipient._id,
    body: body
  });
  res.status(201).json(message);
}

async function inbox(req, res) {
  const rows = await Message.find({ recipient: req.userId })
    .sort({ createdAt: -1 })
    .populate('sender', 'name');
  res.json(rows);
}

async function outbox(req, res) {
  const rows = await Message.find({ sender: req.userId })
    .sort({ createdAt: -1 })
    .populate('recipient', 'name');
  res.json(rows);
}

async function readMessage(req, res) {
  const message = await Message.findById(req.params.id).populate('sender', 'name');
  if (!message) return res.status(404).json({ error: 'not found' });
  if (String(message.recipient) !== String(req.userId)) {
    return res.status(403).json({ error: 'forbidden' });
  }
  res.json(message);
}
```

Walk three accounts. Bran sends "The gate is shut." to Sera. The document's sender is Bran and its recipient is Sera. Bran's outbox request uses his token, the find filters `sender`, and the letter is in the array. Sera's inbox request uses her token, the find filters `recipient`, and the letter is in the array. Sera's `GET /api/messages/:id` compares her id to `recipient` and returns the document. Ivo's `GET` on that same id finds the document and then fails the comparison. 403. The body is not in Ivo's payload. Bran's `GET` on that id is also 403, because Bran is the sender, and this route is the recipient's door. Bran already saw the body in the outbox. If you widen the check to "sender or recipient," say so in the note and know you have changed the contract. This session's contract is the recipient.

The leak is a version of `readMessage` that returns the document whenever `findById` succeeds. Ivo, who can guess or harvest an id from a log, reads Sera's mail with his own valid token. The middleware did its job. It proved Ivo is Ivo. The route never asked whether Ivo was the recipient. Hiding the letter in Sera's React tree does nothing for Ivo's `fetch`. The check is on the server, on this handler, every time.

`populate` on the inbox is the [populate](https://mongoosejs.com/docs/populate.html) you just used for oaths. It replaces `sender` in the result by a separate query. The message collection still stores an id. Select `name` so the separate query does not hand you `passwordHash`. A message is not a join collection, and populating its sender does not make it one. Populate works on any ref. The shape question was answered when you chose two fields on one document instead of a membership of readers.

### The catalog, the holding, and the number

Seed the catalog once, through `POST /api/items/seed`, a route behind `requireUser` that inserts the three items when the collection is empty and otherwise returns what is already there. Three items are enough: Lamp oil as `potion`, Short sword as `weapon`, Leather coat as `armor`. The route uses the model, so a typo in the kind fails validation instead of landing in the collection. After seeding, `GET /api/items` returns the three, and the JSON has no `qty`. If you add `qty` to the item "so the shop can show stock," drinking a potion updates that field and every account's picture of lamp oil changes. That is the diagnosis named Quantity as a catalog field. Stock, if you ever have a shop that can run out for everyone, is a different number from the number in a pack. This hall does not have a shared stock. It has personal holdings. Delete `qty` from the item schema if it appears.

The pack routes. `GET /api/pack` lists the token user's holdings. `POST /api/pack/give` with `{ "item": "...", "amount": 2 }` credits the token user. `POST /api/pack/spend` with the same body debits through `spend`. `POST /api/pack/transfer` adds a `to` and does both.

```js
async function pack(req, res) {
  const rows = await Holding.find({ owner: req.userId }).populate('item');
  res.json(rows);
}

async function give(req, res) {
  const amount = req.body && req.body.amount;
  const itemId = req.body && req.body.item;
  if (!Number.isInteger(amount) || amount < 1) {
    return res.status(400).json({ error: 'amount must be a positive integer' });
  }
  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ error: 'unknown item' });
  try {
    const holding = await credit(req.userId, item._id, amount);
    res.status(201).json(holding);
  } catch (err) {
    if (err.code !== 11000) throw err;
    const holding = await Holding.findOneAndUpdate(
      { owner: req.userId, item: item._id },
      { $inc: { qty: amount } },
      { new: true }
    );
    if (!holding) return res.status(409).json({ error: 'retry the give' });
    res.status(201).json(holding);
  }
}
```

The `11000` branch does not call `credit` again. `credit` upserts, and a second upsert can collide again. The branch increments the row the winner already inserted, with no upsert. The index is there to keep one row. The increment is the behavior the person asked for. A give they have to retry themselves means the branch failed to find the row, which is rare and worth a 409 rather than a third guess.

`POST /api/pack/transfer` debits the token user with `spend`, and only then credits the account named in `to`. If `spend` throws 409, the JSON error handler you wrote for the slate answers 409 and the credit never runs.

```js
async function spendRoute(req, res) {
  const holding = await spend(req.userId, req.body && req.body.item, req.body && req.body.amount);
  res.json(holding);
}

async function transfer(req, res) {
  const amount = req.body && req.body.amount;
  const itemId = req.body && req.body.item;
  const recipient = await User.findById(req.body && req.body.to).select('name');
  if (!recipient) return res.status(404).json({ error: 'no such account' });
  if (String(recipient._id) === String(req.userId)) {
    return res.status(400).json({ error: 'choose another account' });
  }
  const debited = await spend(req.userId, itemId, amount);
  const credited = await credit(recipient._id, itemId, amount);
  res.json({ yours: debited, theirs: credited });
}

async function listItems(req, res) {
  res.json(await Item.find().sort({ name: 1 }));
}

async function seedItems(req, res) {
  const count = await Item.countDocuments();
  if (count > 0) return res.json(await Item.find().sort({ name: 1 }));
  const items = await Item.create([
    { name: 'Lamp oil', kind: 'potion' },
    { name: 'Short sword', kind: 'weapon' },
    { name: 'Leather coat', kind: 'armor' }
  ]);
  res.status(201).json(items);
}

app.post('/api/register', register);
app.post('/api/login', login);
app.post('/api/messages', requireUser, sendMessage);
app.get('/api/inbox', requireUser, inbox);
app.get('/api/outbox', requireUser, outbox);
app.get('/api/messages/:id', requireUser, readMessage);
app.post('/api/items/seed', requireUser, seedItems);
app.get('/api/items', requireUser, listItems);
app.get('/api/pack', requireUser, pack);
app.post('/api/pack/give', requireUser, give);
app.post('/api/pack/spend', requireUser, spendRoute);
app.post('/api/pack/transfer', requireUser, transfer);
```

Those twelve lines are the hall's whole surface. `register`, `login`, and `requireUser` are the slate's, written again with `name` on register and `audience: 'guild'` on sign and verify. The catalog document is not loaded for update. It is loaded, if at all, to confirm the item exists. Its fields after the transfer are the same fields as before. Bran's `qty` went from 2 to 1. Sera's `qty` went from 0 to 1, or her holding was created at 1. Lamp oil's kind is still `potion`.

On the client, the pack renders `holding.qty` next to `holding.item.name`. There is no subtraction in the component. If the component computes `catalog.qty - carried` you have invented a debt on the screen and a quantity on the catalog in the same expression. Display the holding's number. Disable or ignore a spend button when you want, and still expect the server to be the thing that refuses. A disabled button is not the conditional update.

## The demonstration

Stop the oaths server first, with Ctrl-C in its terminal. New projects, `~/projects/hall-api` (Express) and `~/projects/hall-client` (Vite), scaffolded the way the spellbook was: `npm init -y` and `npm install express mongoose bcrypt jsonwebtoken cors` in the API, `npm create vite@latest hall-client -- --template react` for the client. Do not rename the spellbook and start deleting spells. The hall has users, messages, items, and holdings. The spellbook's schema will not become those by a careful edit. Port `4100` keeps it off the spellbook and the slate. Database name `guildhall`, not `guild`: the guild door's database already has a `users` collection with a unique index on `name`, and the hall's accounts would trip over it. The API's `.env` is `MONGODB_URI=mongodb://127.0.0.1:27017/guildhall`, `JWT_SECRET`, `PAGE_ORIGIN=http://localhost:5173`, and `PORT=4100`, started with `node --env-file=.env server.js` (`unset MONGODB_URI` first if an older export is still in the shell). `audience: 'guild'` on sign and on verify; the audience is a claim inside the token, not the database name.

Register Bran, Sera, and Ivo with `POST /api/register`, each with a name, an email, and a password. Seed the three items with `POST /api/items/seed` and any one of the three tokens. Log each account in and keep the three tokens in three shells, or use the screen in two browsers and curl for Ivo.

Bran posts a message to Sera. `GET /api/outbox` with Bran's token includes it, and the populated recipient name is Sera. `GET /api/inbox` with Sera's token includes it, and the populated sender name is Bran. `GET /api/inbox` with Bran's token does not include it. He is not the recipient. `GET /api/messages/:id` with Sera's token returns 200 and the body. The same URL with Ivo's token returns 403. The same URL with Bran's token returns 403. A random id returns 404. Write those four statuses down. They are the inbox evidence.

Give Bran two lamp oils and one short sword with `POST /api/pack/give` and his token, `{ "item": "LAMP_OIL_ID", "amount": 2 }` and then the sword. `GET /api/pack` with his token shows two holdings, quantities 2 and 1, items populated with kinds `potion` and `weapon`. Give him lamp oil again. The pack still has one lamp-oil holding, and the quantity is 3. That is the count evidence. `GET /api/items` shows lamp oil once, with kind and name, and no quantity. Spend one lamp oil as Bran through `POST /api/pack/spend`. The holding quantity is 2. The item document is unchanged. Spend 50. The status is 409. The quantity is still 2. Transfer one to Sera through `POST /api/pack/transfer` with `{ "item": "LAMP_OIL_ID", "amount": 1, "to": "SERA_ID" }`. Bran's holding is 1, and Sera's pack has a lamp-oil holding at 1 that did not exist before. Force the negative bug once, on a branch you throw away: update with `$inc` and no `$gte` filter, from a quantity of 0, and watch `-1` land. Put the filter back. The pack must not be able to store a debt.

The client is a hall, not a component museum. Login. A compose box whose draft survives a failed post. An inbox list and an outbox list. A catalog list with no counts. A pack list with counts, and a spend control that waits for a 2xx before it changes the number on screen. If the spend returns 409, the number stays. Keys are ids. The token is in the header and in `sessionStorage`, and it is absent from every URL, including the message URL. The message URL has an id. It does not have a token.

CORS is the same constraint as the slate. The page origin and the API origin differ. Mount `cors({ origin })` with `PAGE_ORIGIN`, which is `http://localhost:5173`, the origin Vite prints when no other dev server is running. If Vite prints 5174, an older dev server is still up; stop it rather than chase the port. A silent API log and a browser CORS error means the preflight never reached `readMessage`, which is a different bug from a 403. A 403 means the request arrived and the recipient check ran. You want to see that 403 in the network panel with Ivo's token, so you know you are looking at the door and not at the browser's refusal to knock.

The checkpoint models the recipient door, the two shapes, the kind enum, the holding quantity, and the conditional spend. The running hall is the evidence. This page does not listen on a port.

```js run=checkpoint-4-14
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function readMessage(message, userId) {
  if (String(message.recipient) !== String(userId)) return { status: 403, body: null };
  return { status: 200, body: message.body };
}

var letter = { id: 'm1', sender: 'bran', recipient: 'sera', body: 'The gate is shut.' };
check(readMessage(letter, 'sera').status === 200, 'the recipient can read the message');
check(readMessage(letter, 'ivo').status === 403 && readMessage(letter, 'ivo').body === null, 'a third account is forbidden');
check(readMessage(letter, 'bran').status === 403, 'the sender uses the outbox, not this read');

function relation(kind) {
  if (kind === 'message') return 'one-to-many';
  if (kind === 'holding') return 'many-to-many';
  throw new Error('unknown relation');
}
check(relation('message') === 'one-to-many', 'one sender and one recipient is one-to-many');
check(relation('holding') === 'many-to-many', 'a holding joins an owner to a catalog item');

var kinds = ['potion', 'weapon', 'armor'];
function acceptKind(kind) {
  return kinds.indexOf(kind) !== -1;
}
check(acceptKind('potion') && acceptKind('weapon') && acceptKind('armor'), 'kind is potion, weapon, or armor');
check(acceptKind('scroll') === false, 'a kind outside the enum is rejected');

function give(holdings, owner, item, amount) {
  var key = owner + ':' + item;
  if (!holdings[key]) holdings[key] = { owner: owner, item: item, qty: 0 };
  holdings[key].qty += amount;
  return holdings[key];
}
var pack = {};
give(pack, 'bran', 'lamp-oil', 2);
var again = give(pack, 'bran', 'lamp-oil', 1);
check(Object.keys(pack).length === 1 && again.qty === 3, 'two gives of one item share one holding');

function spend(holding, amount) {
  if (holding.qty < amount) return { ok: false, qty: holding.qty };
  return { ok: true, qty: holding.qty - amount };
}
check(spend({ qty: 2 }, 1).qty === 1, 'a spend that fits decreases the holding');
var refused = spend({ qty: 0 }, 1);
check(refused.ok === false && refused.qty === 0, 'a spend past zero is refused and the quantity stays');

function catalogUntouched(item) {
  return item.kind === 'potion' && item.qty === undefined;
}
check(catalogUntouched({ name: 'Lamp oil', kind: 'potion' }) === true, 'quantity is not a catalog field');

console.log('ok: checkpoint-4-14');
```

## Where it breaks

![](diagram:session-4-14/fig2-diagnosis)

### Mail leak

`GET /api/messages/:id` returns the document whenever the id exists. The recipient was never compared to the token. Ivo is logged in, so the middleware is green, and the handler treats "a real id" as "you may read it." Sera's body shows up in Ivo's network panel. Your inbox screen still looks correct, because Sera's screen loads `GET /api/inbox`, which filters by her id. You tested the list. You did not test the door. The leak lives on the by-id route, which the list does not use.

Load the message, 404 when it is missing, and 403 when `String(message.recipient)` is not the token user. Do that before `res.json`. Then repeat the four calls: recipient, sender, stranger, unknown id. You want 200, 403, 403, 404. If the recipient gets 403, the comparison is failing open because the ObjectId and the string never match. String both sides. If Ivo gets 200, the comparison is not in the handler you are hitting. Search for other `findById` calls on `Message`. A debug route you added and forgot is this bug with a second path. Delete it.

The inbox has a cousin of the same hole. `GET /api/inbox?userId=` that uses the query value instead of `req.userId` is a list-shaped leak. Ignore every user id in the query string and the body for this route. The token is the recipient. An outbox that trusts a sender id from the client has the same shape. The sender is the token.

### Quantity as a catalog field

Buying a potion changed the catalog, so every user lost one. Or the shop screen shows a count, you spend, and Sera's catalog view drops even though her pack was empty. `qty` is on the item. The update in the spend handler targets `Item`. The holding collection is empty, or it is missing, and the pack UI reads `item.qty` because that was the field that existed.

Remove `qty` from the item schema. Put it on the holding. Change give and spend to update holdings, filtered by `owner` and `item`. Read the catalog route's JSON and confirm the field is gone. Read the pack route's JSON and confirm the number is on the holding, beside a populated item that has `name` and `kind`. Seed data that included a quantity needs to be re-seeded without it. An old document in MongoDB can still have the field even after you remove it from the schema, because MongoDB does not drop a field when the schema stops mentioning it. Delete the catalog documents and insert them again from the model. The enum still rejects `scroll`. That rejection is the kinds evidence, and it only means something if the documents were saved by the model and not hand-edited in the shell to sneak a fourth kind past validation.

A holding with a quantity, and a catalog without one, also keeps populate honest. You populate `item` to get the name and the kind. You read `qty` from the holding, which was never populated, because it was never a ref. If the screen reads `holding.item.qty`, it is looking for a number the catalog does not have, and it will render blank or zero and hide a real pack. The number is `holding.qty`.

### Negative pack

A transfer subtracted past zero because the update was not conditional. The holding went to `-1` and the UI showed a debt. The handler loaded the holding, did `qty - amount` in JavaScript, and saved. A second click raced the first. Or a single click on an empty pack wrote the negative because nothing in the update's filter required `qty` to be large enough. The schema's `min: 0` stayed quiet because the update path did not run validators, or because `$inc` never consulted it.

Put `qty: { $gte: amount }` in the same `findOneAndUpdate` as the `$inc` downward. If the call returns null, respond 409 and do not credit the other account. Refuse a non-integer and refuse an amount below 1, so a client cannot send `-3` and turn a decrement into an increment. After the fix, spend from zero and read the holding back. The quantity is still zero, or the holding is absent if you delete rows at zero. It is not negative. Reload the client. The number on the screen comes from that read, not from a local `qty - 1` you applied before the response. The saved-too-early habit would show the debt even when the server refused. Wait for the 2xx, then render the `qty` from the body.

If you delete holdings when the quantity hits zero, do it after the conditional update returns a document whose `qty` is 0. Deleting first, or deleting when the update fails, erases a pack you meant to leave alone. The 409 path deletes nothing.

## Your turn

Build the hall on your machine.

1. Users, with a name, a unique email, a password hash, register, login, and a bearer middleware. Audience `guild`. Secret from the environment.
2. Messages with `sender` and `recipient`. Inbox and outbox filter by the token. `GET /api/messages/:id` returns 403 when the token user is not the recipient, including when the token user is the sender. 404 when the id does not exist. 200 for the recipient, with the body.
3. Prove the inbox evidence with three accounts. Bran sends to Sera. Bran's outbox shows it. Sera's inbox shows it. Ivo's get-by-id is 403. Bran's get-by-id is 403.
4. Items with `kind` limited to `potion`, `weapon`, and `armor`. No quantity on that schema. Seed three items through `POST /api/items/seed`. A bad kind is rejected.
5. Holdings with `owner`, `item`, and `qty`, and a compound unique index on owner plus item. Give twice. One row, summed quantity. Populate `item` on the pack query.
6. `POST /api/pack/spend` and `POST /api/pack/transfer` go through the conditional update. A spend larger than `qty` is 409 and leaves the number unchanged. The catalog document is unchanged. The client shows the new quantity only after a 2xx.
7. Confirm a message URL does not contain the token, and a pack request does not either.

Keep the API and the client in folders you can run with two commands. Write down the ports: `4100` for the API and `5173` for the page. There is no third command that copies the process onto a machine in a data center. If a tutorial you are reading starts talking about a public IP, close it. That work is not this session.

## The quest

![](diagram:session-4-14/fig3-evidence)

Write `HALL.md` in the API project.

- Inbox. The three accounts, the body Bran sent, the outbox status, the inbox status, Ivo's status on the id, and Bran's status on the id. One sentence on why the sender is 403 on that route and still able to see the letter.
- Kinds. The three seeded items and their kinds, and the status from inserting a kind outside the enum.
- Count. The holding after two gives of the same item: one row, one quantity. The catalog JSON for that item, showing the absence of a quantity. The status and the quantity after a spend that does not fit.
- Shapes. Which link is one-to-many, and which link is the join. Where `qty` lives. Where `role` lived last session, and why a message does not have a role or a quantity.
- Disk. One populated inbox payload, and what `mongosh` still shows for `sender` on that message. Populate filled the result.

A finished guild hall to compare against after you build yours is at [github.com/arthurbernierjr/dtc-guild-hall](https://github.com/arthurbernierjr/dtc-guild-hall), running at [guild-hall-production.up.railway.app](https://guild-hall-production.up.railway.app/). It keeps this session's contract: the same twelve routes, `sender` and `recipient` on a message, the recipient-only read, `/api/pack/give`, `/api/pack/spend`, and `/api/pack/transfer`, the `guildhall` database, and the same `.env` names. Build yours first. Open it when a status disagrees with the list above, and notice that it is deployed, which your hall is not until Unit 6.

Commit the hall and the note. Leave secrets out of the commit. This is the last project of the unit. It is finished when the three evidence lines are true on your machine, with the process you started and the process you can stop.

## Side quests

Changing an id to read someone else's mail is the broken-access-control case, a pack of items is a composite if kits ever nest, and an index on the holding's owner is what keeps the pack from scanning every row, so read those three sheets with the hall in front of you.

## Before next session

The next unit is the cheat skill, prompting. You will aim a model at a hall like this one: a route, a schema, a screen. The model will write something that looks like `readMessage` and returns the document as soon as the id exists. You will only catch that if you can already say, without the model, that the recipient has to match the token. Prompting does not replace the checks you just built. It produces drafts of them, quickly, including the drafts that skip the check. The cloud, a VPS you rent and leave running, comes after that unit. This session does not put the hall on one. Nothing here copies the process off your machine, opens a public port, or keeps the API up after you stop it. `listen` on localhost is the whole deployment story for the guild hall. When a VPS shows up later, it will be a new problem, about a machine that stays on, and you will want the prompting unit between you and that machine so you can tell a generated config from a config you mean. Until then, shut the process down when you are done. The letters are in MongoDB. The server is a process. You already know the difference.
