---
editorial: true
title: The Illusionist's Primer
subtitle: React, the basics
hook: "The page stops being a string you send once. React is a description of the UI from state. Change the state, and React updates the DOM."
read: 55
artifact: "A small React app: components, props, useState, a list with keys, and a controlled input"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://react.dev/learn
  - https://react.dev/learn/describing-the-ui
  - https://react.dev/learn/passing-props-to-a-component
  - https://react.dev/learn/state-a-components-memory
  - https://react.dev/learn/responding-to-events
  - https://react.dev/learn/rendering-lists
say:
  - "A component is a function that returns UI. Props are its arguments."
  - "State is memory that triggers a new render when you set it. Do not edit the old value."
  - "A list needs a stable key. The index is not stable if the list can reorder."
---

## The hook

The quest board you rendered from Express was finished before it left the server. The browser received a string of HTML, painted it, and sat there. Change a title and the honest version of that design builds a new string and replaces the page. That works. It is a poor fit for a board you sort, filter, and type into, because every keystroke would be a round trip and a full repaint you did not ask for. React lives in the browser for this other kind of program. It does not replace Node, and it does not listen on a port. It is a library that keeps a description of the interface and updates the DOM when that description changes.

A component is a function that returns UI. Props are its arguments. You pass a quest in, and the function returns a description of one row. You do not call `document.createElement` yourself. State is memory that triggers a new render when you set it. Do not edit the old value. `useState` gives you the current value and a setter. The setter schedules another pass through your function. During that pass the function runs from the top, sees the new value, and returns the next tree. React then updates the DOM to match. If you mutate the old object and skip the setter, the screen stays where it was, because nothing asked React to look again.

By the end of this session you have a small client on your machine: a parent that holds a list, a child that receives a title and a callback, a controlled input, and a key on every row that is the record's id. There is no login and no database. The artifact is the loop. State in, UI out, an event, new state. You should be able to say what the next render shows before you click.

> *The board Express sent was a painting of one moment. React is a rule for painting the next one.*

## The idea

React's own starting point, [react.dev/learn](https://react.dev/learn), is the map for this session. The page you want open beside the editor is [Describing the UI](https://react.dev/learn/describing-the-ui). A component is a JavaScript function whose name starts with a capital letter. It returns a description of elements. JSX is the syntax that makes that description look a little like HTML. It is still JavaScript. `<QuestRow title={quest.title} />` compiles to a call that records the component type and the props. The capital letter is how React tells your function apart from a DOM tag. `questRow` in lowercase is treated as an unknown HTML element. The function never runs, and the row is blank in a way that looks like your data is empty.

[Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) is the second page. Props are the arguments. The parent writes them as attributes. The child receives one object. `function QuestRow(props)` and then `props.title`, or `function QuestRow({ title, onComplete })` if you destructure. The child reads props. It does not assign to them. If the row needs to tell the parent that someone clicked Done, the parent passes a function, and the child calls that function. Data down, a callback down. The child does not reach up and edit the parent's variables. It cannot see them.

[State: A Component's Memory](https://react.dev/learn/state-a-components-memory) is the third page, and it is the one that changes how you write the rest of the unit. A local variable inside the function dies at the end of the render. The next time React calls your function, the variable is created again from the initializer. That is why a `let count = 0` followed by `count = count + 1` inside a click handler, if you wrote the increment into the function body instead of the handler, either resets forever or increments during render and confuses you. State is the memory that survives. `const [count, setCount] = useState(0)` returns the value from this render and a setter. Calling the setter asks React to render this component again with the next value. The call does not change `count` in the current render. Until the function runs again, `count` is still the old number. That single fact explains most of the "I added one and nothing happened" hours.

Rendering and committing are two steps, and [Render and Commit](https://react.dev/learn/render-and-commit) names them. A setter is the trigger. React then calls your component functions and builds the next tree in memory. That is the render. Nothing on the screen has changed yet. Then React compares that tree with the previous one and updates the DOM nodes that actually differ. That is the commit. You do not search the document for a node and set `textContent`. If you do, the next render will overwrite your edit, or your edit will sit there while React's idea of the UI says something else. One of those two stories is true, and both of them are bugs. The DOM is React's output. Your output is the tree you return.

[Responding to Events](https://react.dev/learn/responding-to-events) is how the tree grows a behavior. You pass a function, you do not call it. `onClick={addQuest}` waits. `onClick={addQuest()}` calls `addQuest` while rendering, which in the best case adds a row on every render and in the usual case blows up because you are setting state during render without meaning to. The handler receives an event object. For a click you often ignore it. For an input, `event.target.value` is the string currently in the field. Naming the prop `onClick` is React's convention on a DOM element. Your own component can take `onComplete` or `onAdd`. Those names are yours. They are still just props that happen to be functions.

A controlled input is the same idea with the value living in state. The field's `value` is the state variable. The field's `onChange` calls the setter with `event.target.value`. The screen shows state. Typing is an event that sets state. If you leave `value` off and only read the DOM inside the submit handler, the input is uncontrolled, and you have a second copy of the text that React is not tracking. The primer uses the controlled form because the next session's form, and the todo form after that, need the draft to be data you can keep when a request fails. Start with the draft as state now. [State as a snapshot](https://react.dev/learn/state-as-a-snapshot) is the page that makes the handler honest: the handler closes over the state from the render that created it. Two calls to `setCount(count + 1)` in that handler both see the same `count`. You wanted two increments. You get one. The fix is the functional updater, `setCount(function (current) { return current + 1; })`, which receives the latest queued value. [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) shows the pair side by side. Read it when the click "eats" an update. That is the stale increment, and it is ordinary, not a broken build.

Lists are [Rendering Lists](https://react.dev/learn/rendering-lists). `quests.map` returns an array of elements. Each element needs a `key` that is stable and unique among its siblings. The key is how React matches the previous row to the next row when the array is reordered, inserted into, or spliced. The database id, or the id you assigned when the row was created, is the key. The index in the array is what React falls back to if you omit `key`, and the rendering-lists page tells you why that fallback goes wrong: the index changes when the list changes, so React thinks the item at position 1 is the same component as the previous item at position 1. Local state inside that component stays with the position. Delete the middle row and the component that used to hold the middle draft is reused for the row that slid up. The draft you typed on the last row unmounts with the key that disappeared. `key={index}` is the bug with a prop attached. `key={Math.random()}` is a worse bug: every render every row looks new, inputs lose focus, and state inside the row is thrown away. Keys are not passed into the component as a prop. If the row needs its id, pass `id` as its own prop. The key is a hint to React, and the child never sees it.

Derived values are computed while rendering. The number of open quests is `quests.filter(function (quest) { return !quest.done; }).length`. That number does not need `useState`. If you copy it into state, you now have two sources, and they will disagree the moment you update one and forget the other. The same trap shows up with props. A child that does `useState(props.title)` captures the title from the first render. The parent later passes a new title. The child still shows the captured one. The state is a copy, and nothing in the setter pipeline knows the prop changed. Render `props.title`. If you need a value that is fully determined by props and state you already have, compute it into a `const` during render. The page for the longer version of this rule is next session. Today the rule is enough to stop you storing a mirror.

Older posts will show you `class Quest extends React.Component` and `this.setState`. Those are the previous API. The pages linked above use functions, and so does this session. A post that starts with `npx create-react-app` is also describing a toolchain that is no longer the one you want. The client in this unit is bundled with Vite. Vite's dev server compiles JSX, serves the page, and rebuilds when you save. It is not your API server. Express is still the API server, later. Today Vite is only there so the browser can run the components.

If you can only keep one sketch: `useState` holds the list and the draft. An event calls a setter with the next value, and it does not mutate the old array. React renders by calling your functions, then commits the difference to the DOM. A child gets props and calls callbacks. Each row's key is the id you stored on the record when it was created.

![](diagram:session-4-10/fig1-model)

### A function, its arguments, and the tree

Put the smallest component in a file and read it as a function call.

```jsx
function QuestRow(props) {
  return (
    <li>
      <span>{props.title}</span>
      <button type="button" onClick={props.onComplete}>
        Done
      </button>
    </li>
  );
}
```

`QuestRow` returns one `li`. The title is not fetched from anywhere. It is `props.title`, which means the parent had to pass it. The button's click calls `props.onComplete`, which means the parent had to pass a function. `type="button"` matters once this row sits inside a `form`. A button without a type defaults to submit, and the form will navigate. You will lose an hour to that default in the next session if you meet it there first. Meet it here.

The parent decides the data.

```jsx
function Board() {
  const [quests, setQuests] = useState([
    { id: 'q1', title: 'Mend the gate', done: false },
    { id: 'q2', title: 'Fetch lamp oil', done: false }
  ]);

  function completeQuest(id) {
    setQuests(function (current) {
      return current.map(function (quest) {
        if (quest.id !== id) return quest;
        return { id: quest.id, title: quest.title, done: true };
      });
    });
  }

  return (
    <ul>
      {quests.map(function (quest) {
        return (
          <QuestRow
            key={quest.id}
            title={quest.title}
            onComplete={function () { completeQuest(quest.id); }}
          />
        );
      })}
    </ul>
  );
}
```

Walk one click. The render that painted the screen closed over `quests` with two objects, both `done: false`. You click Done on `q1`. `completeQuest('q1')` runs. The updater receives the current array and returns a new array. The first object is a new object with `done: true`. The second object is the same reference as before, which is fine, because it did not change. `setQuests` is called with that new array. React renders `Board` again. `quests` is now the new array. `map` runs again. `QuestRow` for `q1` receives `title` still equal to `Mend the gate`. Nothing in this particular child displays `done`, so the DOM text may not change, and that is all right. Add `{quest.done ? 'done' : 'open'}` to the row and the commit updates that text. The point of the walk is the identity of the data. The old array was not edited. The new array is the next state. `current.map` and the object spread you may prefer, `{ ...quest, done: true }`, both allocate the next value. `current.find(...).done = true` edits the old value. If you then `setQuests(current)`, you handed React the same reference it already had. React is allowed to skip the render. The screen stays stale, and the mutation is waiting inside the array for some later render to accidentally reveal it.

That is the whole contract of the primer. Functions return UI. Props carry the title and the callback. State is replaced by the setter. The list carries ids, and the ids are the keys.

### What a render is allowed to do

A render should be pure. Given the same props and state, the function returns the same tree, and it does not change anything else while doing it. Logging a value is a harmless side observation. Adding a quest during render is not harmless. Fetching during render is not harmless. Starting a timer during render is not harmless. Those belong in an event or, next session, in an effect. The symptom of work done during render is a loop, or a row that appears twice in development. Vite's React template wraps the tree in `StrictMode`. In development, StrictMode renders twice so that a render which secretly changes something is easier to see. The extra pass goes away in the production build. If a log prints twice and the screen is correct, you are looking at that check, not at two quests.

`useState` initializers run on the first render of that component instance. `useState(0)` uses `0`. `useState(function () { return readAnExpensiveThing(); })` uses the function form so the expensive call happens on mount and not on every render. You do not need the function form for a constant. You do need to know it exists so you do not put a function in state by accident: `useState(someFunction)` treats `someFunction` as an initializer and stores its return value. To store a function you would use the nested form. You will not store functions this session. You will pass them as props.

When the next state depends on the previous state, use the updater function. When it does not, a direct value is fine. `setDraft(event.target.value)` does not need the previous draft. The event already has the whole next string. `setQuests(quests.concat(row))` needs the previous list, and it will be wrong if two updates in the same event both read `quests` from the render. Prefer `setQuests(function (current) { return current.concat([row]); })` any time you are building the next array from the old one. The habit is cheap. The bug is not.

Objects are replaced, not merged. If you later keep one state object `{ draft: '', quests: [] }` and you call `setState({ draft: 'x' })`, the next state is `{ draft: 'x' }` and the list is gone. Class components used to merge. Function components do not. Separate `useState` calls are the simple way to keep the draft and the list from trampling each other. One object is fine when you always copy the fields you intend to keep.

### The input that shows state

A controlled field is a loop you can draw.

```jsx
function Composer(props) {
  const [draft, setDraft] = useState('');

  function onSubmit(event) {
    event.preventDefault();
    const title = draft.trim();
    if (title === '') return;
    props.onAdd(title);
    setDraft('');
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={draft}
        onChange={function (event) { setDraft(event.target.value); }}
        placeholder="Quest title"
      />
      <button type="submit">Add</button>
    </form>
  );
}
```

The `value` prop is `draft`. If `draft` is `''`, the field is empty. You type the letter `M`. `onChange` runs. `setDraft('M')` schedules a render. The next render passes `value="M"`. The field shows `M` because state says `M`, not because the browser was allowed to keep a private copy. Submit calls `preventDefault` so the browser does not load a new page. The parent receives the trimmed title through `onAdd`. Then `setDraft('')` clears the field on the following render. If you clear the field by reaching into `event.target.form` and setting a DOM value, you have stepped outside the loop, and the next keystroke will fight you.

This is the evidence named Input. The field shows state, and typing calls the setter. If you remove `value` and the field still accepts typing, you have an uncontrolled input. Put `value` back. An input with `value` and no `onChange` is frozen. React will warn you. The warning is the bug report. Wire the setter.

### Identity in a list

Create three rows and delete the middle one, slowly, on paper.

The state before the click:

1. id `a`, title Mend the gate, and a child component whose local draft says "hinges"
2. id `b`, title Fetch lamp oil, and a child whose local draft says "two bottles"
3. id `c`, title Copy the roster, and a child whose local draft says "ask Ivo"

The local draft here means state inside the row, a note the parent does not hold. The parent holds the titles. The row holds the half-typed note. That split is realistic, because you will put a small input in a row before the week is over.

Delete id `b`. The next array is `a`, then `c`.

If the key is `quest.id`, React sees that `a` is still there and `c` is still there and `b` is gone. The component that belongs to `c` stays mounted. Its note still says "ask Ivo". The component that belonged to `b` unmounts, and "two bottles" goes with it. That is the behavior you want.

If the key is the index, React sees a component at index 0 and a component at index 1, same as it would if the data had only changed inside those positions. Index 0 is still `a`, and "hinges" stays, correctly, by luck. Index 1 used to be `b` and is now `c`. The component instance at key `1` stays mounted, so it still holds "two bottles", and it now renders the title Copy the roster. The note "ask Ivo" lived on key `2`, and key `2` no longer exists, so that note is gone. You deleted the lamp-oil row and the roster row inherited the lamp-oil note. The rendering-lists page describes this as the index failing when items are inserted, deleted, or reordered. Sorting the array is the same bug without a deletion. The component stays at the position. The record moves. The note does not move with the record.

The fix is not to stop using local state. The fix is a key that moves with the record. Store the id on the object at creation. Use it as `key`. Pass it as a normal prop if the child needs to hand it back. Do not derive the key from the title. Two quests can share a title. Do not derive it from the position. The position is what just changed.

## The demonstration

Scaffold the client with Vite. Stop the guild door's server with Ctrl-C in its terminal if it is still running; nothing today listens on a port except Vite. From `~/projects`, not inside the guild door, run `npm create vite@latest primer -- --template react`, and choose React with JavaScript if the prompts ask. The exact flag spelling has drifted across Vite majors, so trust the prompts in front of you rather than a blog post's one-liner. The project is `~/projects/primer`, and that exact name is the one the next two sessions use. Then `cd primer`, `npm install`, and `npm run dev`. The terminal prints a local URL. Open it. The starter page is Vite proving that JSX compiles. Replace the starter with the board below.

You do not need a second framework that also wants to own routing and data loading. Express will be the server again two sessions from now. This folder is only the client. `npm run dev` is the development server. `npm run build` later emits static files. Neither of those commands is a deploy, and neither of them talks to MongoDB.

`src/main.jsx` is the mount. A fresh Vite React template already contains the equivalent of this.

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const rootElement = document.getElementById('root');
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`index.html` has `<div id="root"></div>`. `createRoot` is the current mount API. If a tutorial tells you `ReactDOM.render`, it is old. Use the template's mount and move on. The template imports `App` as a default export, so every `App.jsx` in this unit is written `export default function App` to match it. A named export here is a blank page with a console message about a missing default.

`src/App.jsx` is the primer.

```jsx
import { useState } from 'react';

function QuestRow(props) {
  const [note, setNote] = useState('');
  return (
    <li>
      <strong>{props.title}</strong>
      <span>{props.done ? ' done' : ' open'}</span>
      <input
        value={note}
        onChange={function (event) { setNote(event.target.value); }}
        placeholder="note"
      />
      <button type="button" onClick={function () { props.onComplete(props.id); }}>
        Done
      </button>
      <button type="button" onClick={function () { props.onRemove(props.id); }}>
        Remove
      </button>
    </li>
  );
}

function Composer(props) {
  const [draft, setDraft] = useState('');

  function onSubmit(event) {
    event.preventDefault();
    const title = draft.trim();
    if (title === '') return;
    props.onAdd(title);
    setDraft('');
  }

  return (
    <form onSubmit={onSubmit}>
      <input
        value={draft}
        onChange={function (event) { setDraft(event.target.value); }}
        aria-label="Quest title"
      />
      <button type="submit">Add</button>
    </form>
  );
}

export default function App() {
  const [quests, setQuests] = useState([
    { id: 1, title: 'Mend the gate', done: false },
    { id: 2, title: 'Fetch lamp oil', done: false }
  ]);
  const [nextId, setNextId] = useState(3);
  const openCount = quests.filter(function (quest) { return !quest.done; }).length;

  function addQuest(title) {
    const id = nextId;
    setNextId(id + 1);
    setQuests(function (current) {
      return current.concat([{ id: id, title: title, done: false }]);
    });
  }

  function completeQuest(id) {
    setQuests(function (current) {
      return current.map(function (quest) {
        if (quest.id !== id) return quest;
        return { id: quest.id, title: quest.title, done: true };
      });
    });
  }

  function removeQuest(id) {
    setQuests(function (current) {
      return current.filter(function (quest) { return quest.id !== id; });
    });
  }

  return (
    <main>
      <h1>Open quests: {openCount}</h1>
      <Composer onAdd={addQuest} />
      <ul>
        {quests.map(function (quest) {
          return (
            <QuestRow
              key={quest.id}
              id={quest.id}
              title={quest.title}
              done={quest.done}
              onComplete={completeQuest}
              onRemove={removeQuest}
            />
          );
        })}
      </ul>
    </main>
  );
}
```

`openCount` is derived. There is no `useState` for it and no effect. Change `done` and the heading changes because `App` rendered again and recomputed the filter. `QuestRow` holds `note` so you can watch keys. Type a different note into each row. Remove the first row. The remaining note stays with the remaining title. Then, once, change `key={quest.id}` to `key={index}` and add `index` as the second argument of `map`. Type notes, remove the first row, and watch the note stick to the position. Put the id key back. That five-minute breakage is the lesson. Leaving the index key in because "it still renders" is how the bug ships.

The checkpoint is a model of those three rules. It does not mount React. The Run button on this page cannot compile JSX. The Vite app on your machine is the demonstration. The model checks the decisions the app is making.

```js run=checkpoint-4-10
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function applyClicks(count, times, functional) {
  if (!functional) {
    let scheduled = count;
    for (let i = 0; i < times; i += 1) scheduled = count + 1;
    return scheduled;
  }
  let value = count;
  for (let i = 0; i < times; i += 1) value = value + 1;
  return value;
}

check(applyClicks(0, 2, false) === 1, 'two stale increments from one render land on 1');
check(applyClicks(0, 2, true) === 2, 'two functional increments land on 2');

function reconcile(prevRows, nextRows, keyMode) {
  const drafts = new Map();
  prevRows.forEach(function (row, index) {
    const key = keyMode === 'index' ? index : row.id;
    drafts.set(key, row.draft);
  });
  return nextRows.map(function (row, index) {
    const key = keyMode === 'index' ? index : row.id;
    if (drafts.has(key)) return { id: row.id, draft: drafts.get(key) };
    return { id: row.id, draft: row.draft };
  });
}

const before = [
  { id: 'a', draft: 'hinges' },
  { id: 'b', draft: 'two bottles' },
  { id: 'c', draft: 'ask Ivo' }
];
const after = [before[0], before[2]];
const byIndex = reconcile(before, after, 'index');
const byId = reconcile(before, after, 'id');
check(byIndex[1].id === 'c' && byIndex[1].draft === 'two bottles', 'an index key keeps the deleted row draft on the shifted row');
check(byId[1].id === 'c' && byId[1].draft === 'ask Ivo', 'an id key keeps the roster note on the roster row');

function shownTitle(propTitle, copiedTitle) {
  if (copiedTitle !== null) return copiedTitle;
  return propTitle;
}
check(shownTitle('Mend the gate', 'Old title') === 'Old title', 'a copied prop stays on the first value');
check(shownTitle('Mend the gate', null) === 'Mend the gate', 'rendering the prop shows the current title');

const quests = [
  { id: 'a', done: true },
  { id: 'b', done: false }
];
const openCount = quests.filter(function (quest) { return !quest.done; }).length;
check(openCount === 1, 'the open count is derived from the list');

console.log('ok: checkpoint-4-10');
```

## Where it breaks

![](diagram:session-4-10/fig2-diagnosis)

### Stale increment

Two clicks, or two setter calls inside one click, computed `count + 1` from the same render. You had 0 on the screen. You expected 2. You still have 1. The handler closed over `count`. Both calls scheduled the value `1`, and the second schedule replaced the first. Nothing in the browser is broken. The queue did what you asked.

The updater form reads the queued value, not the render's value. `setCount(function (current) { return current + 1; })` twice from 0 yields 2. Use that form when the next value is a function of the previous one: increment, toggle, append, remove. Use the direct form when the next value is complete by itself, which is the usual case for an input's `onChange`. If a counter button sometimes misses clicks only when you click fast, you are in this section. Open the queueing page and look at the pair of examples. Then search your handler for `setX(x +` or `setQuests(quests.` and change the ones that build on previous state.

A cousin of this bug is the mutated array. You `quests.push(row)` and then `setQuests(quests)`. The push already edited the array React is holding. The setter receives the same reference. The screen does not update, or it updates later when some other setter forces a render and suddenly the sneaked row appears. Allocate the next array. `concat`, `filter`, `map`, and object copy all do that. `push`, `splice`, and assigning a field do not.

### Index key

Deleting the second row leaves the wrong note on the row that slid into its place. Sometimes the symptom is smaller. An input keeps focus on the wrong record. A checkbox stays checked after a sort. You will not see it at all if the row has no local state and every pixel comes from props, because props update even when the instance is reused. The bug is still there, waiting for the first piece of state you add inside the row.

Look at the `map`. If the key expression mentions the loop index, or if there is no key and React is warning, this is the section you are in. The warning text is "Each child in a list should have a unique key prop." A missing warning does not clear you. An index is a unique key among siblings for a single render, so React is satisfied and still wrong across renders. Put the id in the data. If you are generating rows in the client before any database exists, assign the id once, with a counter or `crypto.randomUUID()`, and store it on the object. Recomputing a fresh random id inside `map` is the random-key bug. The id is created when the record is created, and then it is stable for the life of that record.

After you switch to id keys, type a note, delete a different row, and confirm the note stayed with its title. That is the evidence named Key. Each row's key is the record id.

### Derived state copied

A prop was copied into state and then went stale. The parent passes `title="Mend the gate"`. The child initializes `useState(props.title)` and renders that state. Later the parent renames the quest to "Mend the postern". The child function runs again because the parent rendered again, but `useState` does not re-run the initializer. The state still says "Mend the gate". You now have two titles, and the one on screen is the one nobody asked for.

The same shape appears without props. You store `openCount` in state and try to remember to `setOpenCount` every place you change `quests`. You will miss one place. The heading drifts from the list. Delete the extra state. Compute `openCount` while rendering, next to the `return`. It cannot drift, because it does not have a life of its own.

There is a documented escape when a child truly must reset local state because a prop identity changed, and it is not an effect. Next session's reading, [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect), shows adjusting state during render when the incoming id differs from a stored id. You do not need that pattern for a title you can render directly. If you reach for `useEffect` to copy `props.title` into state, stop. You are building the bug with extra steps. Render the prop, or derive the value. The evidence named Props is the child rendering the title it was given and calling the callback it was given. If the child has its own copy of the title, the evidence is already failing.

## Your turn

Build the primer in a Vite React project of your own. The sample above is a starting point, not a file to drop in unexamined.

1. Scaffold `~/projects/primer` with Vite's React JavaScript template. Run the dev server. Confirm the page loads from the URL the terminal prints.
2. Replace the starter `App` with a list of quests held in `useState`. Each quest has an id, a title, and a done flag. The id is not the array index.
3. Render a child component that receives the title, the id, the done flag, and two callbacks. The child does not own the quest array.
4. Add a controlled composer. The input's `value` is state. Submit prevents the browser navigation, trims the title, refuses an empty title, and calls the parent's add function. The field clears because the draft state goes back to an empty string.
5. Show the count of open quests as a `const` computed during render. Do not store the count.
6. Give each row a local note input, keyed by quest id. Type distinct notes. Delete the middle row. Confirm the surviving notes stay with their titles. Switch the key to the index once, repeat the delete, see the note jump, and switch the key back.
7. Add a `const [count, setCount] = useState(0)` to `App` and show the number. Then add a button that calls the functional updater twice in one click, and a button that calls `setCount(count + 1)` twice. Click each. Write down both results. They should be 2 and 1 if you started from 0.

If the page is white, open the browser console before you touch the logic. A syntax error in JSX, a component whose name starts with a lowercase letter, or a missing default export will blank the page with a message. Read the first message.

## The quest

![](diagram:session-4-10/fig3-evidence)

Write `PRIMER.md` in the Vite project. One page, in your own words, tied to the code you actually ran.

- Props. Name the child, the title prop it renders, and the callback it calls. Quote the JSX where the parent passes both.
- Input. Say where the draft state lives, what `onChange` writes, and what you see in the field after one keystroke. Mention `preventDefault` and what the browser does without it.
- Key. Record the id expression you used. Describe the delete you performed with id keys, and the delete you performed with index keys, including which note ended up on which title.
- Stale update. Record the two buttons and the two resulting numbers.
- Derived count. Point at the `const` and confirm there is no setter for that number.

Run `git init` in `~/projects/primer` if you have not already; the scaffolded folder is not a repository until you do, and the template's `.gitignore` already lists `node_modules` and `dist`. Commit the source and `PRIMER.md`. This folder is the client. The server you built earlier stays a different project until the session that joins them. Do not paste Express into this one to make it feel finished. The finish line today is a screen whose next frame you can predict from the state.

## Side quests

A screen of components that contain components is the composite pattern, and an onClick is the observer pattern with React notifying your handler, so read those two sheets while the tree still fits on a page.

## Before next session

Next session the list stops being private to one component. Two children will need the same quests, which means the state moves up to the parent that contains them, and a form will be the way a new quest gets in. An effect will show up for the first time, and the hard part is noticing the work that is not an effect. Read [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) and the opening of [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) before you sit down. You are arriving able to say what a prop, a setter, and a key are. The next hour spends those three on a slightly larger tree, and then it spends its care on the question of when you are allowed to step outside React at all.
