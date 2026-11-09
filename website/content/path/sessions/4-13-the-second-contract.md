---
editorial: true
title: The Second Contract
subtitle: Another CRUD app with the same JWT auth
hook: "You have built this shape once, with the notes open. Today you build it again, a spellbook instead of a todo list, and the notes stay closed until something actually breaks."
read: 50
artifact: "A second authenticated CRUD app, a spellbook, built from the same contract without copying the todo files"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://mongoosejs.com/docs/models.html
  - https://expressjs.com/en/guide/routing.html
  - https://react.dev/learn/thinking-in-react
say:
  - "Same contract, new noun. If you can only build a todo, you memorized a todo."
  - "Copying the files and renaming strings hides whether you understand the boundary."
  - "When it breaks, open the docs for the layer that broke, not the whole stack."
---

## The hook

You have built this shape once, with the notes open. A screen, a token, a JSON API, an owner on every row. Today the noun changes and the notes stay closed until something actually breaks. The noun is a spell. It has a name, a school, and a level. It does not have a title, and it does not have a done flag. If the only app you can build is a todo, you memorized a todo. Same contract, new noun.

Copying the files and renaming strings hides whether you understand the boundary. A folder produced by search-and-replace still has the holes of the folder you copied, including the early-saved state from the slate if you never fixed it, and it is missing every field you did not remember to add. The spellbook is a second project. New directory, new `package.json`, new model, new routes, new components, typed while the slate repository is closed. When something breaks, you open the document for the layer that broke. You do not open the whole stack, and you do not open the slate repository to transplant a file.

By the end you can draw a spell request on paper before you touch either project: method, path, header, body, success status, and the query that keeps one account's spells off another account's list. A spell without a school is rejected. A request to a todo path on this process does not hit a todo route, because this process does not have one. Each app only lists its own user's records.

> *A second door, cut to the same measure, proves the measure. A copied door proves the copy.*

## The idea

[Thinking in React](https://react.dev/learn/thinking-in-react) is the page for the screen, and it asks you to start from the picture rather than from the files you already have. The picture is a login, a list of spells, and a form with three controls: name, school, and level. The component split falls out of the picture. `LoginForm` talks to `/api/login`. `SpellForm` holds the three drafts and calls `onCreate`. `SpellList` receives the array and renders a `SpellRow` per spell. `App` holds the token and decides which of those trees is on screen. The minimal state is the token, the spell array, and the three drafts. A count of spells in one school is derived during render from the array and a filter value. It is not another `useState`, and it is not an effect. You already know why. The new fact is that you can name that state list before any component file exists. If your list of state includes `title` or `done`, you are still holding the previous noun.

The model page is [Mongoose models](https://mongoosejs.com/docs/models.html). A model is the object you call to talk to one collection. `Spell` talks to spells. It is not `Todo` with a different variable name. The schema is the whole noun.

```js
const mongoose = require('mongoose');

const schools = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation'
];

const spellSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    school: { type: String, required: true, enum: schools },
    level: { type: Number, required: true, min: 0, max: 9 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  { timestamps: true }
);

const Spell = mongoose.model('Spell', spellSchema);
module.exports = { Spell, schools };
```

`enum` means a school outside that list never reaches the collection. `min` and `max` mean a level of 10 never reaches it either. `owner` is required because a spell without an account is a spell you cannot authorize. The unique email still lives on the user schema, in this project, written again. You are allowed to remember that email is unique and that the password is stored as `passwordHash`. You are not allowed to paste the user file. Typing the ten lines is how you find out whether you remember which field is unique.

[The routing guide](https://expressjs.com/en/guide/routing.html) is the contract's skeleton, and it does not mention spells. You do. The routes this process mounts are:

- `POST /api/register` creates a user and returns 201, or 409 when the email is taken.
- `POST /api/login` compares the password and returns a token, or 401.
- `GET /api/spells` returns the array of spells whose `owner` is the token's `sub`.
- `POST /api/spells` validates name, school, and level, creates the document with `owner` set from the token, and returns 201 with the document.
- `PATCH /api/spells/:id` updates fields you allow, only when `_id` and `owner` both match, and returns the new document or 404.
- `DELETE /api/spells/:id` deletes under the same pair of conditions and returns 204, or 404.

`GET /api/todos` is not on this list. If that path answers with a todo array, you are still running the slate, or you mounted the slate's router inside the spellbook. The evidence is a different shape and a process that does not know the old noun. Use a different port, `4000`, so a slate you forgot to stop cannot answer on `3000` and convince you the new client works. Point the spellbook's `fetch` base at `4000`. A client that still says `localhost:3000` is a renamed client, whatever the button text says.

The header is the same sentence as the slate, and the server still verifies it. `Authorization: Bearer` plus the token. The middleware reads `sub` into `req.userId`. Create assigns `owner` from that id and ignores any owner in the body. List filters on it. Update and delete filter on `_id` together with it. Show saved only after a 2xx. Keep the three drafts if the request fails. The token stays out of the URL and out of the console. None of those sentences is a new idea. The session is whether you can implement them without a file open beside you.

What you may not soften: the password still goes through bcrypt with the cost factor you already chose. A shorter password rule, or a password stored in clear so the demo is easier to reset, is the failure mode the authentication sheet is about. The second app is where that shortcut feels harmless, because you have done the careful version once and you are tired. The careful version is the contract. Eight characters was the floor on the slate. Keep a floor. Keep the hash. If login accepts the password you typed and the database shows that same password, this project failed even if the list renders.

A paper contract, written before the editor, fits on one page.

- Noun: name, school, level, owner.
- Identity: register and login, hash, token, `sub`.
- Header: `Authorization: Bearer`.
- Collection routes under `/api/spells`, each with its method and its success status.
- Owner in every query. Owner never taken from the client.
- Saved only after `response.ok`. Drafts kept otherwise.
- This process has no todo route. This client has no todo component.

Tape that page to the side of the screen. Implement from it. When a test disagrees with the page, the test wins and you fix the page too, so the page stays true. The page is how the evidence named Closed notes is met: you can draw the request before you open the slate repository.

![](diagram:session-4-13/fig1-model)

### A create path that only accepts a spell

The handler is short because the schema is doing real work. You still check the types before you call `create`, so a wrong JSON shape becomes a 400 you wrote, with a message you recognize, rather than a validation error you have to decode under pressure.

```js
const { Spell, schools } = require('./spell');

async function createSpell(req, res) {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const school = typeof body.school === 'string' ? body.school : '';
  const level = body.level;
  if (name === '') return res.status(400).json({ error: 'name required' });
  if (schools.indexOf(school) === -1) return res.status(400).json({ error: 'unknown school' });
  if (typeof level !== 'number' || level < 0 || level > 9) {
    return res.status(400).json({ error: 'level must be a number from 0 to 9' });
  }
  const spell = await Spell.create({
    name: name,
    school: school,
    level: level,
    owner: req.userId
  });
  res.status(201).json(spell);
}
```

Send `{ "name": "Mage Armor", "school": "abjuration", "level": 1 }` and expect 201. Send `{ "name": "Mage Armor", "level": 1 }` and expect 400. Send `{ "title": "Oil the hinges", "done": false }` and expect 400, because `name` and `school` are missing and `level` is not a number. That third body is the renamed-todo test. A handler that reads `req.body.title` and stores a spell-shaped document with an empty name will fail it. A handler that was copied and still inserts into the todos collection will fail it in a worse way: the request "succeeds" and the spellbook's list, which reads the spells collection, stays empty. Success against the wrong collection is the bug a rename produces when you only look at the status line.

Mount the handler on a router that does not know any other noun.

```js
const express = require('express');
const spells = express.Router();

spells.use(requireUser);
spells.get('/', listSpells);
spells.post('/', createSpell);
spells.patch('/:id', updateSpell);
spells.delete('/:id', deleteSpell);

app.use('/api/spells', spells);
```

`requireUser` on the router means you cannot forget it on one of the four lines. Login and register stay on `app`, above this mount, because they are how you get a token. A `GET /api/spells` without a token is 401. A `GET /api/todos` falls through to a JSON 404, which you should mount at the end on purpose so a stray client sees `{ "error": "not found" }` and not an HTML stack.

### The audience, so a token has a home

`jwt.sign` and `jwt.verify` accept an `audience` option. The readme for `jsonwebtoken` documents it next to `expiresIn`. Sign the spellbook token with `audience: 'spellbook'`. Verify with the same audience. A token whose audience is `slate`, or a token that has no audience because the slate signed it that way, fails `verify` on this process.

```js
function signSpellbookToken(userId, secret) {
  return jwt.sign({ sub: userId }, secret, { expiresIn: '2h', audience: 'spellbook' });
}

function readSpellbookToken(token, secret) {
  return jwt.verify(token, secret, { audience: 'spellbook' });
}
```

Here is the bug the diagnosis names. Both projects read `JWT_SECRET` from the environment. In a hurry you export one secret and launch both servers from the same shell. `verify` checks the signature and the expiry. If you never set an audience, a token minted by the slate verifies on the spellbook, and a token minted by the spellbook verifies on the slate. The `sub` is a user id. If the two apps share a database and a users collection, that id is the same person, and logging into the spellbook has just authorized the todo API. If the databases are separate, the id might not exist on the other side, or it might collide with a different person who received the same ObjectId by chance in a tiny database you reset a lot. You will not notice. The request returns 200 and a list. The list might even be empty, which looks like privacy and is only an empty query.

It is acceptable, for a single afternoon on your own machine, to know that you reused a secret. It is not acceptable to reuse it and be unable to say so. The fatal version is the one you discover when a second application is public and a token from the smaller one still opens the larger one. Set the audience now, in both apps if you are willing to touch the slate for two lines, so that a slate token presented to the spellbook is a 401 you have seen with your eyes. Record that 401 in the notes. That is the shared-token bug, understood, rather than the shared-token bug, shipped.

The owner filter is still required after the audience check. Audience answers "which application minted this token." Owner answers "which rows may this `sub` see." A spellbook token for Sera must not list Bran's spells. Audience does not do that. `find({ owner: req.userId })` does. Both lines stay.

### The screen, built from the picture

The form's drafts are strings until submit. The level control is a select or a number input whose value is a string, because DOM inputs yield strings. The handler converts it at the edge.

```jsx
function SpellForm(props) {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('abjuration');
  const [level, setLevel] = useState('1');
  const [notice, setNotice] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    setNotice('');
    const parsedLevel = Number(level);
    const response = await fetch(props.apiBase + '/api/spells', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + props.token
      },
      body: JSON.stringify({ name: name, school: school, level: parsedLevel })
    });
    if (!response.ok) {
      setNotice('not saved');
      return;
    }
    const saved = await response.json();
    props.onCreated(saved);
    setName('');
    setNotice('saved');
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={name} onChange={function (event) { setName(event.target.value); }} aria-label="Spell name" />
      <select value={school} onChange={function (event) { setSchool(event.target.value); }} aria-label="School">
        {props.schools.map(function (item) {
          return <option key={item} value={item}>{item}</option>;
        })}
      </select>
      <input value={level} onChange={function (event) { setLevel(event.target.value); }} aria-label="Level" />
      <button type="submit">Inscribe</button>
      <p>{notice}</p>
    </form>
  );
}
```

`props.schools` is a constant array in the client, duplicated from the server's enum. That duplication is honest. The client needs the list to render options. It does not import the Mongoose schema to get it. If the two lists drift, the server remains the authority: an option the server does not know becomes a 400, and the notice stays on "not saved." The facade is the JSON contract. The schema stays in the server project. A client that reaches into validation error internals and displays Mongoose path names is starting to know too much, but a client that displays "unknown school" from your 400 body is using the contract you wrote. Prefer the body you wrote.

`onCreated` receives the server document and the parent appends it. The form does not append. The form does not know the owner's id. The row's key is `spell._id`. School and level render from the document, so a successful create shows the school you sent, not a hardcoded "abjuration" left over from the todo row you used as a visual template.

Logout, load-on-token, and `sessionStorage` are the same decisions as the slate. Implement them from the paper. If the load effect fetches `/api/todos`, you copied the effect and changed the heading. The network panel is the judge. The path on the request is `/api/spells`.

## The demonstration

Stop the slate first, in both terminals: Ctrl-C on the API and Ctrl-C on its Vite dev server, so nothing answers on 3000 and the spellbook's own Vite prints 5173 again. Then close the slate. Put it in another editor window only if you enjoy losing the session, and then the session is already lost. Create `~/projects/spellbook-api` and `~/projects/spellbook-client` as new directories. `npm init -y` and install `express`, `mongoose`, `bcrypt`, `jsonwebtoken`, and `cors` in the API. Scaffold the client with Vite's React template the way you did for the primer. You are allowed to remember those commands. You are not allowed to `cp -R` the slate and then run a rename.

Write the schema from the block above. Write register and login again, with `audience: 'spellbook'` on `sign` and on `verify`. Write the four spell routes on a router mounted at `/api/spells`. Write a final 404 that returns JSON. Listen on port `4000`. Mount `cors({ origin })` with the origin read from `PAGE_ORIGIN`, the way the slate did; that origin is `http://localhost:5173`, which is what Vite prints once the slate's dev server is stopped. Write the API's `.env` the same way too: `MONGODB_URI=mongodb://127.0.0.1:27017/spellbook`, `JWT_SECRET`, and `PAGE_ORIGIN=http://localhost:5173`, started with `node --env-file=.env server.js`. The database name is `spellbook`, not `slate`, so a careless find cannot show you the slate's todos and look like success. A `MONGODB_URI` still exported in the shell wins over the file, so `unset MONGODB_URI` first.

In the client, hard-code the API base as `http://localhost:4000`. Build login, the list, and the form. The list effect depends on the token and requests `/api/spells`. The form is the one in the idea section, or yours, as long as the body has `name`, `school`, and `level`, and the saved notice waits for `response.ok`.

Then run the four checks that tell a rebuild from a copy.

First, the shape. `POST /api/spells` with no school returns 400 and the collection is unchanged. `POST` with Mage Armor, abjuration, level 1 returns 201. The document in MongoDB has those three fields and an `owner`. It does not have `title`.

Second, the other noun. `GET http://localhost:4000/api/todos` with a valid spellbook token returns 404. If it returns an array, a todo router is mounted or the client is pointed at the wrong port.

Third, the other account. Register Sera and Bran. Inscribe a spell as Sera. Log in as Bran. The list is empty. Call `DELETE` on Sera's spell id with Bran's token. Expect 404. Sera's list still shows the spell after she logs in again.

Fourth, the audience, if the slate is still around to mint a token. Present a slate token to `GET /api/spells`. Expect 401 from `verify`. If you get 200, the audience option is missing on one side or both, and you are living in the shared-token bug. Fix the spellbook first. Note whether the slate still accepts a spellbook token. That note is the diagnosis, written down while the fact is in front of you.

The checkpoint is a model of the shape test, the audience test, and the owner test. It does not connect to MongoDB. Your two terminals do.

```js run=checkpoint-4-13
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

var schools = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation'
];

function validateSpell(body) {
  if (!body || typeof body.name !== 'string' || body.name.trim() === '') return 400;
  if (typeof body.school !== 'string' || schools.indexOf(body.school) === -1) return 400;
  if (typeof body.level !== 'number' || body.level < 0 || body.level > 9) return 400;
  return 201;
}

check(validateSpell({ name: 'Mage Armor', school: 'abjuration', level: 1 }) === 201, 'a spell with name, school, and level is accepted');
check(validateSpell({ name: 'Mage Armor', level: 1 }) === 400, 'a spell without a school is rejected');
check(validateSpell({ title: 'Oil the hinges', done: false }) === 400, 'a todo body is not a spell');

function audienceAllows(tokenAudience, routeAudience) {
  return tokenAudience === routeAudience;
}
check(audienceAllows('spellbook', 'spellbook') === true, 'a spellbook token matches the spellbook audience');
check(audienceAllows('slate', 'spellbook') === false, 'a slate token does not match the spellbook audience');
check(audienceAllows('', 'spellbook') === false, 'a token with no audience does not match a route that requires one');

function routeExists(method, path) {
  var routes = {
    'GET /api/spells': true,
    'POST /api/spells': true,
    'GET /api/todos': false
  };
  return routes[method + ' ' + path] === true;
}
check(routeExists('GET', '/api/spells') === true, 'the spell list route exists');
check(routeExists('GET', '/api/todos') === false, 'this process has no todo route');

function listedFor(spells, userId) {
  return spells.filter(function (spell) { return spell.owner === userId; });
}
var book = [
  { name: 'Mage Armor', owner: 'sera' },
  { name: 'Silent Image', owner: 'bran' }
];
var seraSees = listedFor(book, 'sera');
check(seraSees.length === 1 && seraSees[0].name === 'Mage Armor', 'each account sees only its own spells');

console.log('ok: checkpoint-4-13');
```

## Where it breaks

![](diagram:session-4-13/fig2-diagnosis)

### Renamed todo

The files are the slate with the word spell pasted over todo. A field the spell needs was never added. The form still has one text input. The schema still requires `title`. Or the schema was edited and the handler still reads `req.body.title`, so every create is a 400 you blame on Mongoose. Or the path was edited in the client and not on the server, so the network panel shows `POST /api/spells` and the server log shows no such route. Or both still say `/api/todos` and the heading on the page is the only thing that changed.

Open the network panel and read the request body, not the component's filename. The JSON has to contain `name`, `school`, and `level`. Open the schema and read the paths. The paths have to be those three plus `owner`. Search the server project for the string `todos`. A hit on a route is this diagnosis. A hit inside `node_modules` is not. Search the client for `title` as a state variable. A draft named `title` is a leftover. The fix is to delete the copied project and type the contract from the paper. Patching a renamed tree hides the next missing field. You are practicing the ability to produce the tree, and a patch does not practice it.

A quieter version of the same bug is a correct spell schema and a client whose `apiBase` still points at the slate's port. Creates succeed. They succeed in the other database. The spellbook list stays empty and you debug Mongoose for an hour. Read the host and the port on the request before you read the schema. `4000` and `spellbook` are part of the contract you wrote on the paper. Use them.

### Shared token bug

Logging into the spellbook authorizes the slate, or the other way around, because they share a secret and neither `verify` call checks which app issued the token. The symptom is a 200 you did not expect when you paste the other app's token into the `Authorization` header. The list may be empty. Empty is not proof. Proof is `verify` throwing when the audience does not match, which your middleware turns into 401.

Read the `sign` call and the `verify` call side by side. The audience string has to be identical, including case. `Spellbook` and `spellbook` do not match. If `sign` sets the audience and `verify` does not pass the option, `jsonwebtoken` still accepts the token, because you did not ask it to check. Both sides have to care. If you would rather not reopen the slate, mint a spellbook token and call the slate with it. A 200 from the slate means the slate will accept any token signed with the shared secret. Write that down, set the spellbook's checks anyway, and treat the slate's open door as known debt. Unknown debt is the fatal version. Known debt is the diagnosis, which is what this section is for.

Do not "fix" this by putting the app name in the password hash or in the URL. The audience claim is the tool the library already has.

### Copied bug

The early-saved state from the slate is in this app too. Repetition copied the defect. The form sets the notice to saved, or appends a spell-shaped object, and then awaits `fetch`. You stop the API and the screen still says saved. You refresh and the spell is gone. The slate taught this once. Copying the component brought the order with it. A from-scratch form can grow the same bug if you celebrate in the handler before you read the status. The order is the contract: send, then branch on `response.ok`, then append the parsed document, then clear the name draft, then set the notice.

Search the submit function for `setNotice` and for the append. If either appears above the `ok` check, move it. Force the failure by pointing `apiBase` at a closed port for one submit. The drafts, all three, remain. The notice does not say saved. Restore the port and submit. The row that appears shows the school and the level from the response. If the row shows them from the drafts you closed over, you are still displaying hope. Display `saved.school` and `saved.level`.

There is a second copied bug worth hunting while you are in the file. An index key on the spell list. A `useEffect` that copies `spells` into `visibleSpells`. A `console.log` of the token. They rode along in the paste, or your hands typed them because the last project still had them. The paper does not ask for them. Delete them when you find them. The session is the contract, kept, not the previous file, preserved.

## Your turn

Build the spellbook with the slate closed.

1. Write the one-page contract on paper or in `CONTRACT.md` before you create the routes. Include the noun, the six routes, the header, the owner rule, and the port.
2. Create a new API project and a new client project. Do not copy files. Install the dependencies by name.
3. Schema: `name`, `school` as the enum, `level` from 0 to 9, `owner`. Database name `spellbook`. Port `4000`. CORS origin `http://localhost:5173`.
4. Sign and verify with `audience: 'spellbook'`. Register, login, list, create, update, delete. Every spell query includes the owner. `GET /api/todos` on this port is a 404.
5. Client: login, list, form with the three fields. `response.ok` gates the saved notice. Keys are spell ids. The token is in the header and in `sessionStorage`, and it is not in the URL.
6. Prove two accounts do not see each other's spells. Prove a body with no school is a 400. Prove a slate token, if you still have the slate, is a 401 against the spellbook. If you no longer have the slate, prove that a token you sign without an audience is a 401 against a verifier that requires one. A tiny node script is enough for that last proof, and then delete it or keep it out of the client.

When you are stuck, name the layer in a sentence before you open a tab. "Mongoose rejected the level" opens the validation docs. "The browser blocked the request" opens the CORS setup you already used, retyped. "The list did not update" opens the react page on state. A search for the slate's filename is the move this session is here to retire.

## The quest

![](diagram:session-4-13/fig3-evidence)

`CONTRACT.md` is the drawing, written first. `SPELLBOOK.md` is the record of what the running process did, written after.

- Different shape. The 400 body for a spell with no school, and the 404 for `GET /api/todos` on port 4000. Quote the status lines.
- Closed notes. State the time you wrote the contract relative to the first route, and one place where the running app disagreed with the paper. What you changed.
- Both apps, or this app's two users if the slate is gone. Who created which spell, and what the other account's list contained. The status when the other token hit `DELETE`.
- Audience. The status a token from the other audience received, or the status a token signed without an audience received.
- One defect you noticed because you were not looking at the old file, and the line you wrote instead.

Commit the new projects and both notes. Leave the slate's history untouched. The spellbook should read like a sibling, not like a branch of a rename. The next session adds a relationship the spellbook does not have. You will want the habit of choosing a shape on purpose, which is all this hour was.

## Side quests

The spellbook client should meet a facade over Mongoose rather than the schema, and loosening the password rules to make the second demo easier is the authentication-failures page you should read before you touch the hash.

## Before next session

Next session a spell's single owner is no longer the interesting relationship. A party has many members, and a member stands in many parties. That is a different shape from a ref on one side. Read the opening of [Mongoose populate](https://mongoosejs.com/docs/populate.html) and notice what it claims to replace: paths in the documents you got back, by a separate query, before the results return. Come in able to say what your spell's `owner` field stores when you look at it in the database. It stores an id. Populate is not how that id got there. You are about to need a place to store a fact that belongs to the pair, not to either person, and an array on each side will not be that place.
