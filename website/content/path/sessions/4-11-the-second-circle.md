---
editorial: true
title: The Second Circle
subtitle: Effects, forms, and shared state
hook: "State inside one component is not enough. Today the data lives above the children that need it, and effects are reserved for synchronizing with something outside React."
read: 55
artifact: "A quest list with the state lifted, a controlled form, and one effect that loads a fixture"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://react.dev/learn/sharing-state-between-components
  - https://react.dev/learn/reacting-to-input-with-state
  - https://react.dev/learn/synchronizing-with-effects
  - https://react.dev/learn/you-might-not-need-an-effect
  - https://react.dev/reference/react/useEffect
say:
  - "Lift state to the closest parent that needs it. Pass data down and callbacks down."
  - "An effect synchronizes with an external system. Deriving a value during render is not an effect."
  - "The dependency list is the list of values the effect reads. A new object every render is a new dependency."
---

## The hook

The primer put the quest array in `App`, where the composer and the rows could share it. Now the screen grows: a tally in the header, a list in the middle, a form off to the side. The array stays in their closest shared parent. Today you give those regions their own components and trace how one change reaches all of them. If a child keeps a private copy, the others have to guess. Children receive the items and the callbacks. They do not keep a second copy.

An effect is the other new tool, and it is the one you will be tempted to use for everything. An effect synchronizes with an external system. A fixture file on the dev server is an external system. A timer is an external system. A subscription is an external system. A total you could compute from the array you already have is not an external system. Deriving a value during render is not an effect. The dependency list is the list of values the effect reads. A new object every render is a new dependency, and a new dependency means the effect runs again.

By the end of the session the screen has one array, two children painting it, a controlled form that adds to it, a filter that is a `const`, and one effect that loads a fixture after paint. A second effect, a ticking watch, exists so you can see the cleanup run when the watch leaves the screen. If you can point at the parent and say "the list lives here," and point at an effect and say what outside thing it is attached to, you have the session.

> *A note kept in one room cannot be read from the next. Put the book in the hall those rooms share.*

## The idea

[Sharing State Between Components](https://react.dev/learn/sharing-state-between-components) is the page to read with the primer still open. State inside `QuestRow` was the right place for a note that only that row displays. State inside `App` was the right place for the array, because the composer and the list both needed it. The rule is the same at every size. Find the components that need the data. Find the closest parent that contains all of them. Hold the state there. Pass the data down as props. Pass functions down so a child can ask for a change. The parent performs the change, the state updates, the parent renders, and every child receives the next props together. That is one source. Two children show the same quests because they read the same state.

The mistake is a copy in each child. The list component does `useState` from the fixture, and the header component does `useState` from the same fixture, and the form calls a setter that only the list can see. You add "Scout the ridge" and the list shows it and the header still says two quests. Nothing is out of sync in React's terms. You built two memories. Lifting is how you refuse the second memory. Do not lift higher than the shared parent out of a sense of tidiness. A note that one row displays can stay in the row. A draft the form displays can stay in the form until submit. Lift the value whose next version must be visible in more than one place.

[Reacting to Input with State](https://react.dev/learn/reacting-to-input-with-state) is the form half. The input's `value` is state. Submit reads that state. It does not walk the DOM looking for `input.value` after the fact, and it does not need a ref to "get the current text." The current text is already `draft`, because every keystroke set it. `event.preventDefault()` in the submit handler is what stops the browser from navigating to a new page and throwing the JavaScript memory away. After a successful add, set the draft back to an empty string so the field clears. If the title trims to nothing, return without calling the parent. The empty quest is a data decision, made before the parent ever hears about it.

The form does not own the quest array. It owns the draft. On submit it calls `onAdd(title)`, which the parent passed in. The parent appends to the array with a functional update. Both the list and the header render from that array on the next pass. You can watch the header count change in the same paint as the new row. That simultaneity is the evidence that there is one source. If the count updates a beat later, you have stored the count separately and you are about to meet the third diagnosis.

[Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) and the [useEffect reference](https://react.dev/reference/react/useEffect) describe the escape hatch. Rendering calculates the tree from props and state. It should not start a timer, open a socket, or fetch. Those are synchronization with something outside the tree. You declare that work in an effect. React runs the effect after the commit, when the DOM for that render is on the screen. The effect can set state when the outside world answers. That set state causes another render. The shape is deliberate: paint what you know, then catch up to the outside system.

The fixture load is that shape. The quests start as an empty array, or as `null` if you want to tell "not loaded" from "loaded and empty." After paint, the effect fetches `/quests.json`. When the response arrives, you set state to the parsed array. The list renders the rows. You did not fetch during render. You did not put the fetch in the submit handler, because nobody submitted anything. The load is tied to the component being on the screen, which is what an effect is for.

[You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) is the page that keeps the hatch from eating the program. The page's rule, in its own words, is that effects let you step outside React to synchronize with an external system, and that if no external system is involved you should not have an effect. Transforming data for rendering is the case it opens with. A filtered list is the array filtered by the query string. Compute it while rendering and store it in a `const`. An effect that does `setVisible(filter(quests, query))` schedules a second render, paints a frame where the list and the filter disagree, and can loop if the dependency is careless. A total is the same kind of value. `quests.reduce` during render is the total. A state variable named `total`, updated from an effect, is a cache you now have to invalidate by hand. You do not need the cache.

User events are the page's second case. Adding a quest is a response to submit. The handler knows which button was clicked and what the draft was. An effect that watches a `pendingAdd` flag and then adds the quest has thrown away that knowledge. By the time the effect runs, you are inferring what the user did from leftover state. Put the append in `onSubmit`. Put the fetch of the fixture in the effect. The split is the whole session.

The dependency list is the contract for when the effect re-synchronizes. The reference says the effect re-runs when one of those values changes, compared with `Object.is`. Numbers, strings, and booleans compare by value. Objects and arrays compare by identity. This literal is a new object every time the component function runs:

```jsx
const options = { ridge: ridge };
```

If `options` is in the dependency list, the effect sees a new dependency on every render. If the effect then sets state, the component renders again, builds another `options`, and the effect runs again. That is the infinite effect. The fix is to depend on `ridge`, the string, which is the value you actually read. Building the object inside the effect, from that string, is fine. The object never becomes a dependency, because the effect created it and the outside world does not care about its identity.

React runs the cleanup you return from an effect before re-running the effect, and again when the component unmounts. The [useEffect](https://react.dev/reference/react/useEffect) page describes that order. A timer without a cleanup keeps firing after the watch has left the screen. The log continues. The interval still calls a setter on an unmounted component, or on a component that has moved on to a different quest. Return `function () { clearInterval(id); }` and the log stops when you hide the watch. The same return is how a fetch ignores a stale response. Set a flag in the cleanup. When the response arrives, if the flag is set, do not call the setter. The fixture effect in the demonstration does this even though the dependency list is empty, because a fast navigation away should still ignore a late response. The flag is cheap. The surprise of a row appearing on a screen that already moved on is not.

A sketch you can redraw without the docs: the parent holds the array. The list and the header receive it. The form holds the draft and calls `onAdd`. The filter is a `const` beside the `return`. One effect loads the fixture after paint and returns a cleanup that ignores a late response. One effect starts a timer and returns a cleanup that clears it. Anything else you are about to wrap in `useEffect` has to name the external system. If you cannot name one, it is render logic or an event handler.

![](diagram:session-4-11/fig1-model)

### Where the array has to live

Picture three components. `App` renders `Tally`, `QuestForm`, and `QuestList`. `Tally` shows how many quests are open. `QuestList` shows the rows. `QuestForm` submits a title. All three are concerned with the same records. `App` is the closest parent. The array is `useState` in `App`.

`Tally` receives `quests` and computes the open count itself, or receives `openCount` already computed by the parent. Either way the number is not a second piece of state. `QuestList` receives `quests` and `onToggle`. `QuestForm` receives `onAdd` and nothing else about the array. The form cannot get out of date about the list because it does not store the list. After `onAdd`, `App` updates, and `Tally` and `QuestList` receive the next array in the same render. That is the evidence named One source.

If a fourth component, buried in a settings panel that is not mounted, also needs the quests, you still do not invent a global store today. When that panel mounts, it can receive the array from `App` too, or `App` can pass it through the parent that contains the panel. A store becomes worth it when the prop drilling is the problem you actually have. You do not have it in a three-component screen. Prop drilling is a name for passing a prop through a component that does not use it. One extra hop is not a design emergency.

There is a mirror bug when a child copies a prop into state "so I can edit it." The list receives `quests` and does `useState(quests)` so it can sort locally. The parent's append never arrives, because the child's state already initialized. If the local sort is real UI state, store the sort key, `'title'` or `'status'`, and sort the prop during render. The rows stay the parent's rows. The order is derived. You will be tempted to sync the copy with an effect that does `setLocal(quests)` whenever `quests` changes. That effect is the derived-state bug from last session, wearing a new hook. Delete the copy.

### The form reads its own draft

The form's state is the draft, the school of the input, not the school of the list. A single text field is one `useState('')`. Submit trims it. Here is the whole conversation with the parent.

```jsx
function QuestForm(props) {
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
        aria-label="New quest"
      />
      <button type="submit">Add</button>
    </form>
  );
}
```

The parent appends. The id is minted once, in the parent, at the moment of the add. The form does not invent ids, because two forms would invent them differently and the key rule from last session would slip.

```jsx
function addQuest(title) {
  const id = nextId;
  setNextId(id + 1);
  setQuests(function (current) {
    return current.concat([{ id: id, title: title, done: false }]);
  });
}
```

`nextId` and the functional update are from the same click. The id used inside the updater is the local `const id`, not a second read of state, so a double click still gets two different ids as long as each click runs `addQuest` once and each run sees the `nextId` from its own render. Two adds in a single event would need the functional form for the counter too. One submit is one event. The simple form is enough. The functional form on `setQuests` is still the right habit, because the next array depends on the current array.

`type="submit"` on the button is what you want inside this form. `type="button"` is what you want on Done and Remove, which must not submit. Last session met that default. It still bites if a row's Remove sits inside the form by accident. Keep the form's element tree small. The list is a sibling, not a descendant, of the form.

A search box is another controlled input, and it is not a second form in the moral sense. `query` lives in `App` if both the field and the list need it, which they do. The field sets `query`. The list receives `visible`, or receives `quests` and `query` and filters. Filtering in the list is fine. Filtering in `App` and passing `visible` is fine. Storing `visible` is not fine.

### The effect that loads, and the effect that ticks

Put the fixture in `public/quests.json`. Vite serves files in `public` at the root of the dev server. `/quests.json` is that file. It is not an Express route. The port in the browser's address bar is the Vite port. This matters next session, when a second port appears and you have to say which fetch is aimed where.

```json
[
  { "id": "r1", "title": "Scout the ridge", "done": false },
  { "id": "r2", "title": "Copy the map", "done": true },
  { "id": "r3", "title": "Relieve Ivo", "done": false }
]
```

The load effect has an empty dependency list because it reads no props and no state. It synchronizes "this screen is mounted" with "the fixture has been requested."

```jsx
useEffect(function () {
  let ignore = false;
  fetch('/quests.json')
    .then(function (response) {
      if (!response.ok) throw new Error('fixture ' + response.status);
      return response.json();
    })
    .then(function (data) {
      if (!ignore) setQuests(data);
    })
    .catch(function (error) {
      if (!ignore) setLoadError(error.message);
    });
  return function () {
    ignore = true;
  };
}, []);
```

Empty list means "run after the first commit, and clean up on unmount." It does not mean "I am ignoring the linter." If you later read `ridge` inside this effect, the list is no longer empty, and the lint rule `react-hooks/exhaustive-deps` will say so. Add `ridge`. Do not delete the comment the lint wants by disabling the rule. The rule is the dependency list, enforced. A fresh object in that list is how the infinite loop starts, so when the lint asks you to add `options`, stop and ask why `options` is a new object. Depend on the string inside it instead.

The watch is a separate component so its cleanup is obvious. Showing and hiding it is a state boolean in the parent. When the boolean goes false, React unmounts `Watch`, and the cleanup runs.

```jsx
function Watch() {
  const [ticks, setTicks] = useState(0);

  useEffect(function () {
    console.log('watch started');
    const id = setInterval(function () {
      console.log('tick');
      setTicks(function (current) { return current + 1; });
    }, 1000);
    return function () {
      clearInterval(id);
      console.log('watch stopped');
    };
  }, []);

  return <p>Watch {ticks}</p>;
}
```

Leave the screen, or toggle the watch off. `watch stopped` prints. `tick` does not print again. That is the evidence named Cleanup. If you delete the `return` and toggle the watch off and on, the old interval is still alive. You will see two `tick` lines per second, then three. The component on screen looks fine. The abandoned intervals are the bug. They are also why a cleanup exists for a subscription you have not written yet. The function you return is the detach. The side quest names that shape. Today you can see it in a timer, which is easier to observe than a socket.

`console.log` inside the interval is for the exercise, so the stop is visible. A log inside the effect body also runs twice in development under StrictMode: React mounts, cleans up, and mounts again, on purpose, to surface a missing cleanup. If `watch started` prints twice and `watch stopped` prints between them, your cleanup is real and StrictMode just rehearsed it. If `watch started` prints twice and `watch stopped` never prints, there is no cleanup, and StrictMode did you the favor of proving it. Production does not rehearse. The bug would have waited for a route change.

### The values that are just render

```jsx
const visible = quests.filter(function (quest) {
  const haystack = quest.title.toLowerCase();
  return haystack.indexOf(query.trim().toLowerCase()) !== -1;
});
const openCount = quests.filter(function (quest) { return !quest.done; }).length;
```

Both lines sit in the component body, above `return`. They run every render. They cannot be stale relative to `quests` and `query`, because they are computed from those values and then thrown away. The next render computes them again. There is no setter to forget.

The loading flag is different, because "the fixture has not arrived" is not implied by an empty array. An empty fixture is a real file with `[]`. Use a status if you need the distinction.

```jsx
const [status, setStatus] = useState('loading');
```

The effect sets `'ready'` or `'error'`. The screen branches on `status`. Empty is `status === 'ready' && quests.length === 0`. You do not need `isEmpty` in state. You do not need an effect to set it. The branch is render logic. Loading, empty, error, and ready are the states of the screen. They can be one string. They should not be four booleans, because four booleans allow `loading` and `error` at the same time. One status cannot be two of those at once. That is a small design, and it is the one to keep until the screen grows a reason to be more specific.

## The demonstration

Start from `~/projects/primer`. You already have Vite, a list, a controlled field, and id keys. Today you are rearranging memory, not scaffolding a toolchain. If the primer folder is a mess, scaffold again the same way you did last session and bring the lessons forward by hand. Do not import the primer file and wrap it. The lift has to happen in the code you can read top to bottom.

`public/quests.json` holds the three records from the idea section. `src/App.jsx` becomes the parent.

```jsx
import { useEffect, useState } from 'react';

function Tally(props) {
  const openCount = props.quests.filter(function (quest) { return !quest.done; }).length;
  return <p>Open on the board: {openCount}</p>;
}

function QuestForm(props) {
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
        aria-label="New quest"
      />
      <button type="submit">Add</button>
    </form>
  );
}

function QuestList(props) {
  if (props.quests.length === 0) return <p>No quests match.</p>;
  return (
    <ul>
      {props.quests.map(function (quest) {
        return (
          <li key={quest.id}>
            <label>
              <input
                type="checkbox"
                checked={quest.done}
                onChange={function () { props.onToggle(quest.id); }}
              />
              {quest.title}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function Watch() {
  const [ticks, setTicks] = useState(0);
  useEffect(function () {
    console.log('watch started');
    const id = setInterval(function () {
      console.log('tick');
      setTicks(function (current) { return current + 1; });
    }, 1000);
    return function () {
      clearInterval(id);
      console.log('watch stopped');
    };
  }, []);
  return <p>Watch {ticks}</p>;
}

export default function App() {
  const [quests, setQuests] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [nextId, setNextId] = useState(1);
  const [showWatch, setShowWatch] = useState(true);

  useEffect(function () {
    let ignore = false;
    fetch('/quests.json')
      .then(function (response) {
        if (!response.ok) throw new Error('fixture ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (ignore) return;
        setQuests(data);
        const maxId = data.reduce(function (max, quest) {
          const numeric = Number(String(quest.id).replace(/\D/g, '')) || 0;
          return numeric > max ? numeric : max;
        }, 0);
        setNextId(maxId + 1);
        setStatus('ready');
      })
      .catch(function (error) {
        if (!ignore) {
          setLoadError(error.message);
          setStatus('error');
        }
      });
    return function () { ignore = true; };
  }, []);

  function addQuest(title) {
    const id = 'local-' + nextId;
    setNextId(nextId + 1);
    setQuests(function (current) {
      return current.concat([{ id: id, title: title, done: false }]);
    });
  }

  function toggleQuest(id) {
    setQuests(function (current) {
      return current.map(function (quest) {
        if (quest.id !== id) return quest;
        return { id: quest.id, title: quest.title, done: !quest.done };
      });
    });
  }

  const visible = quests.filter(function (quest) {
    return quest.title.toLowerCase().indexOf(query.trim().toLowerCase()) !== -1;
  });

  if (status === 'loading') return <p>Loading the board</p>;
  if (status === 'error') return <p>Could not load the fixture: {loadError}</p>;

  return (
    <main>
      <Tally quests={quests} />
      <QuestForm onAdd={addQuest} />
      <input
        value={query}
        onChange={function (event) { setQuery(event.target.value); }}
        aria-label="Filter"
      />
      <QuestList quests={visible} onToggle={toggleQuest} />
      <button type="button" onClick={function () { setShowWatch(function (current) { return !current; }); }}>
        {showWatch ? 'Hide watch' : 'Show watch'}
      </button>
      {showWatch ? <Watch /> : null}
    </main>
  );
}
```

`Tally` receives `quests`, the full list, so the open count does not shrink when you filter. `QuestList` receives `visible`. Those are two props on purpose. If the tally and the list ever disagree about a toggle, they are not reading the same array. A toggle goes through `onToggle` to the parent, so the full list and the filtered list update together. Type into the filter. The tally stays. The list shrinks. Clear the filter. The toggles you made are still there, because you never filtered by copying into state.

Hide the watch. Confirm `watch stopped` in the console and the absence of further `tick` lines. Show it again. A new interval starts at zero. That is a new effect, after a new mount.

Then break the filter on purpose. Replace `visible` with a `useState` and an effect that sets it from `quests` and `query`. Watch the extra render, and watch what happens if the effect's dependency is `visible` by mistake. Put the `const` back. The broken version is the third diagnosis, and you want to have seen it once.

The checkpoint models the lift, the dependency identity, the cleanup, and the derived total. It does not start a real interval, so the page you are reading stays idle. The watch in Vite is where the log actually stops.

```js run=checkpoint-4-11
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function renderPair(quests) {
  const tally = quests.filter(function (quest) { return !quest.done; }).length;
  const titles = quests.map(function (quest) { return quest.title; });
  return { tally: tally, titles: titles };
}

const shared = [
  { id: 'r1', title: 'Scout the ridge', done: false },
  { id: 'r2', title: 'Copy the map', done: true }
];
const painted = renderPair(shared);
check(painted.tally === 1 && painted.titles.length === 2, 'tally and list read one array');

function copiesDiverge() {
  let list = shared.slice();
  let headerCount = shared.filter(function (quest) { return !quest.done; }).length;
  list = list.concat([{ id: 'r3', title: 'Relieve Ivo', done: false }]);
  return { listLength: list.length, headerCount: headerCount };
}
const diverged = copiesDiverge();
check(diverged.listLength === 3 && diverged.headerCount === 1, 'a private copy in the header misses the add');

function effectRuns(makeDep) {
  let runs = 0;
  let last = null;
  for (let i = 0; i < 3; i += 1) {
    const dep = makeDep();
    if (!Object.is(dep, last)) {
      runs += 1;
      last = dep;
    }
  }
  return runs;
}
check(effectRuns(function () { return { ridge: 'north' }; }) === 3, 'a fresh object dependency retriggers the effect');
const stableRidge = 'north';
check(effectRuns(function () { return stableRidge; }) === 1, 'a stable string dependency runs once');

function mountWatch() {
  const log = [];
  let active = true;
  log.push('started');
  function cleanup() {
    active = false;
    log.push('stopped');
  }
  function tick() {
    if (active) log.push('tick');
  }
  cleanup();
  tick();
  return log;
}
const watchLog = mountWatch();
check(watchLog.indexOf('stopped') !== -1 && watchLog.indexOf('tick') === -1, 'cleanup runs and the later tick is ignored');

function openCount(quests) {
  return quests.filter(function (quest) { return !quest.done; }).length;
}
check(openCount(shared) === 1, 'the open count is computed during render');

console.log('ok: checkpoint-4-11');
```

## Where it breaks

![](diagram:session-4-11/fig2-diagnosis)

### Infinite effect

The effect set state that was also a dependency, or the dependency was a fresh object each render. The symptom is a frozen tab, a console flooded with fetches, or a React warning that the maximum update depth was exceeded. The network panel shows `/quests.json` requested without a user doing anything. You did not write a loop. The dependency comparison wrote one for you.

Look at the array at the end of `useEffect`. For each name in it, find where the value is created. If it is created in the component body as an object, array, or inline function, it is a new identity every render. Move the creation inside the effect, or depend on the primitive you built it from. `ridge` is a string. `{ ridge: ridge }` is not a stable name for the same fact.

The other loop is `useEffect(function () { setQuests(quests.concat([])); }, [quests])`, or any "normalize the array" effect that allocates a new array every time. The new array fails `Object.is` against the old one, so the effect runs again. If you meant to load once, the dependency list should not include the state the effect overwrites. If you meant to recompute a filtered copy, delete the effect and the state, and compute the copy during render.

A fetch in the effect that is correct still needs the ignore flag once the dependencies are real. Change `ridge`, the effect cleans up, the old request's flag flips, the new request starts. Without the flag, a slow response for `north` can arrive after the response for `south` and overwrite the ridge you are looking at. That bug feels like a loop and is not one. The tab is fine. The data is from the previous query. The cleanup is the fix for that race, and the dependency list is what makes the effect notice the new ridge at all.

### Forgotten cleanup

A subscription or a timer from the previous quest is still running after the component left the screen. You hid the watch and the console still prints `tick`. Or you changed the quest id that the effect depends on, and the old interval is alive beside the new one. React only cleans up what you return. If the effect returns nothing, the previous run has no detach.

Put the `clearInterval`, the `removeEventListener`, or the ignore flag in the function you return. Then do the thing that should detach: hide the component, or change the dependency. Read the console. The stop has to happen before you trust the start. A demo that only shows the timer running has not tested the cleanup. The evidence is the log stopping.

StrictMode's double mount in development will call that cleanup immediately once, on the rehearsal. Do not "fix" a double-started timer by deleting StrictMode. The rehearsal is how you noticed. If a subscription is not safe to run twice, the cleanup is what makes the second run safe. Sockets, listeners, and intervals all fall in that bucket. A fetch that only sets state is safe to ignore on the stale run, which is what the flag does. You do not need to abort the request for this fixture. Ignoring the result is enough. Aborting is a sharper tool when the request is expensive. You can add `AbortController` later. The flag teaches the same order: cleanup marks this run as dead, the completion handler checks the mark.

### Effect for math

A total was stored in state and updated in an effect. It should have been computed while rendering. The screen shows the old total for a frame, then the new total. A test that looks at the component right after `setQuests` sees the stale total. You will also, eventually, update the quests from a second place and forget to update the total, and then the frame is not a flicker. It is a lie that persists.

Delete `useState` for the total. Delete the effect. Write the `reduce` or the `filter` next to the other `const` values in the component. The heading reads that number. The filtered list is that array. The evidence named No extra state is this `const`. If you can find a `setVisible` or a `setTotal` in the file, the evidence is not met yet.

The same section covers copying props into state to "react" to them. A child that stores `props.quests` and refreshes the store from an effect is synchronizing React with React. There is no external system. Render `props.quests`, or derive from it. The adjusting-state-during-render pattern on the "you might not need an effect" page is the rare case where a child keeps local state and must reset it when an id prop changes. Read that section before you write it. A filter box does not qualify. The filtered rows are not local state.

## Your turn

Reshape the primer into the shared board.

1. Add `public/quests.json` with at least three quests, each with a stable `id`, a `title`, and a `done` boolean. Load it from an effect whose dependency list is empty. Start from a loading status, not from a pretend list.
2. Hold the loaded array in the parent. Render a tally and a list as two children. Both have to change when you toggle a row. The toggle handler lives in the parent.
3. Keep the composer's draft in the composer. Submit adds through a callback. The new row's id is assigned in the parent. The field clears only after that callback returns.
4. Add a controlled filter. The visible list is a `const` computed during render. The tally uses the full list, so filtering does not change the open count.
5. Mount a watch with a one-second interval and a cleanup that logs when it clears. Hide the watch with a button. The tick log stops. Show it again. A single interval is running, not two.
6. Temporarily put a fresh object in a dependency list and set state from that effect. Confirm the loop. Remove the object. Write one sentence in your notes about which value was actually changing.

If the fixture 404s, look at the request URL in the browser's network panel. `/quests.json` must match a file in `public`, and the dev server must be the origin in the address bar. A request to port 3000 is next session's bug, arriving early.

## The quest

![](diagram:session-4-11/fig3-evidence)

Write `LIFT.md` next to `src`. Keep it short enough to reread before the next session.

- One source. Name the state variable, the file it lives in, and the two children that receive it. Describe the toggle you clicked and what both children did.
- Cleanup. Paste the three log lines in order: started, stopped, and the fact that tick did not continue. Note what you clicked to make the stop happen.
- No extra state. Paste the filter `const` and the open-count expression. State, in a sentence, that there is no setter for either result.
- Name one piece of logic you almost put in an effect and the external system it did not have.

Commit the component file, the fixture, and `LIFT.md`. This board still has no account and no database. The fixture is a stand-in for the response you will fetch from your own API next session. The shape you want to keep is the one you can already see: load in an effect, change in a handler, derive on the way to the return.

## Side quests

Loading, empty, error, and ready are the State pattern once the branches pile up, and the function you return from an effect is the observer detaching, so read both sheets before the subscriptions outnumber the handlers.

## Before next session

Next session the fixture is replaced by a small new API built the same way as the courier, a todo list instead of a quest board, and the screen learns to log in. The effect that loads todos will send a token. The handler that adds a todo will wait for a 2xx before it says the row is saved. Read [Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) once more, with the fetch in your file under your finger, and skim the `useEffect` reference section on cleanup so the ignore flag is a choice you remember rather than a snippet you pasted. You are arriving with one array, living in the parent, and with a clear line between a render calculation and an effect. The next session puts a real server on the other side of that line. The line stays.
