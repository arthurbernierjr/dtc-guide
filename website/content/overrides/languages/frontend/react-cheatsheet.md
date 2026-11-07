---
title: "React cheatsheet"
framework: React
version: "19.3"
lede: "Components, JSX rules, props, hooks, forms, state management, routing, styling, conditional rendering and the tips that come up every week — one page, checked against react.dev and reactrouter.com."
updated_from: "the 2020 cheatsheet (class-era React Router, ReactDOM.render, axios)"
verified: 2026-11-02
docs:
  - https://react.dev/learn/your-first-component
  - https://react.dev/learn/writing-markup-with-jsx
  - https://react.dev/learn/rendering-lists
  - https://react.dev/learn/keeping-components-pure
  - https://react.dev/reference/react/useState
  - https://react.dev/learn/updating-objects-in-state
  - https://react.dev/reference/react/useEffect
  - https://react.dev/learn/synchronizing-with-effects
  - https://react.dev/learn/you-might-not-need-an-effect
  - https://react.dev/reference/react/useRef
  - https://react.dev/reference/react-dom/components/form
  - https://react.dev/reference/react/useActionState
  - https://react.dev/learn/sharing-state-between-components
  - https://react.dev/learn/passing-data-deeply-with-context
  - https://react.dev/reference/react/useReducer
  - https://react.dev/reference/react/use
  - https://react.dev/reference/react-dom/createPortal
  - https://react.dev/reference/react/useMemo
  - https://react.dev/learn/react-compiler
  - https://react.dev/blog/2024/12/05/react-19
  - https://reactrouter.com/start/declarative/routing
  - https://reactrouter.com/start/declarative/navigating
  - https://reactrouter.com/changelog
exec: ran
verified_note: "All 48 jsx/js blocks on this page were transformed with esbuild (jsx loader) and parse; every named import (`useActionState`, `memo`, `createPortal`, `Outlet`, `NavLink`, `useSearchParams`, …) was checked against the exports of the installed react 19.3.1, react-dom 19.3.1, react-router 8.5.1 and styled-components 6.6.0."
changes:
  - "`ReactDOM.render` is gone (removed in React 18): apps start with `createRoot(...).render(...)` from `react-dom/client`, which Vite's template already writes in `main.jsx`."
  - "React Router section rewritten for v8: install `react-router` (the `react-router-dom` package was removed in v8), `Routes`/`Route element={}` replace `Switch` and the `component`/`render` props, and `useParams`/`useNavigate`/`Outlet` are shown."
  - "Hooks guidance follows react.dev: updater functions for state that depends on previous state, the `ignore` flag and cleanup for effects that fetch, Strict Mode double-invocation in development, and the 'you might not need an effect' rule."
  - "React 19 additions noted where they matter: `ref` is an ordinary prop (no `forwardRef`), `<Context value>` renders a provider directly, `use(Context)`, form `action` functions with `useActionState`, and the React Compiler (1.0) for automatic memoization."
  - "Bugs in the original fixed: `createPortal` imported from `react-dom` not `react`, `BrowserRouter` spelling, `subtract` action type, `return:` syntax error in the switch example, missing `key` on list items, a prop setter called during render."
  - "Third-party library lists refreshed (TanStack Query, React Hook Form, Zustand, Redux Toolkit, MUI, shadcn/ui; Next.js, Expo, Astro, TanStack Start) and `axios` replaced with `fetch`. Styled Components kept as an optional section."
---

# React Cheatsheet

## Writing React Functional Components

A component is a function that returns JSX. Any way you can write a function works; the name must start with a capital letter so React can tell `<Component1 />` from a plain `<div>`.

```jsx
// Function declaration
function Component1(props) {
  return <h1>Hello World</h1>;
}

// Function expression
const Component2 = function (props) {
  return <h1>Hello World</h1>;
};

// Arrow function
const Component3 = (props) => {
  return <h1>Hello World</h1>;
};

// Using them
export default function App() {
  return (
    <div>
      <Component1 />
      <Component2 />
      <Component3 />
    </div>
  );
}
```

Components must be **pure**: given the same props they return the same JSX, and they don't change variables that existed before the call. Side effects (fetching, timers, DOM writes) go in event handlers or effects, never in the function body.

A modern project starts with Vite (`npm create vite@latest my-app -- --template react`) and mounts the tree once in `src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

## Rules of JSX

JSX is the HTML-like syntax inside components. It compiles to function calls, which is why it has rules HTML doesn't.

### 1. Only one top-level element

##### Good

```jsx
<div>
  <h1>Hello World</h1>
  <p>lorem ipsum</p>
</div>
```

##### Bad

Two siblings at the top level is a syntax error.

```jsx
// fragment: does not compile
<h1>Hello World</h1>
<p>lorem ipsum</p>
```

##### Also good

If you don't want an extra `div` in the DOM, wrap in a **Fragment**: `<>…</>` (or `<Fragment key={…}>` when you need a key).

```jsx
<>
  <h1>Hello World</h1>
  <p>lorem ipsum</p>
</>
```

### 2. Attributes are camelCase

HTML attributes become camelCase properties; a few are renamed because they clash with JavaScript keywords.

- `onclick` becomes `onClick`, `onchange` becomes `onChange`, `onsubmit` becomes `onSubmit`
- `class` becomes `className`, `for` becomes `htmlFor`
- `tabindex` becomes `tabIndex`, `readonly` becomes `readOnly`
- `aria-*` and `data-*` attributes stay hyphenated

### 3. Inline styles in JSX

In HTML an inline style is a string:

```html
<div style="display: flex; background-color: blue;">content</div>
```

In JSX `style` takes an **object**, because you are setting properties on the DOM node's style object. Property names are camelCase; numbers are treated as pixels.

```jsx
<div style={{ display: "flex", backgroundColor: "blue", padding: 8 }}>content</div>
```

### 4. Arrays work

A component can return an array of elements — but each element in an array needs a `key`.

```jsx
return [<h1 key="a">Hello</h1>, <h1 key="b">World</h1>];
```

The same output with a Fragment needs no keys:

```jsx
return (
  <>
    <h1>Hello</h1>
    <h1>World</h1>
  </>
);
```

### 5. Injecting JavaScript expressions

Curly braces switch from markup to JavaScript. Any **expression** works (not statements like `if` or `for`).

```jsx
const name = "Arthur";
return <h1>{name} is {30 + 5} years old</h1>;
```

`false`, `null`, `undefined` and `true` render nothing, which is what makes the conditional patterns later on this page work.

## Props

Props are how a parent passes data to a child. They are read-only in the child.

- Data flows down: parent to child.
- If a parent needs something from a child, pass the child a **function** as a prop and let the child call it (from an event handler, not during render).
- Anything can be a prop: strings, numbers, objects, functions, other JSX.

```jsx
// The child calls the function it was given when something happens
function Child({ stuff, onPick }) {
  return <button onClick={() => onPick(8)}>{stuff}</button>;
}

// The parent owns the data and decides what to do with it
function Parent() {
  function handlePick(value) {
    console.log("child picked", value);
  }

  return <Child stuff="hello world" onPick={handlePick} />;
}
```

Since React 19 `ref` is an ordinary prop too: a function component can accept `ref` and attach it to a DOM node without `forwardRef`.

## Using Arrays in React

To render many items from an array, `map` it to an array of JSX. Each item needs a stable `key` — an id from your data, not the array index, so React can match items across renders.

```jsx
function Dogs() {
  const dogs = [
    { id: 1, name: "Sparky", age: 5 },
    { id: 2, name: "Spot", age: 3 },
    { id: 3, name: "Ralph", age: 7 },
  ];

  const dogJSX = dogs.map((dog) => (
    <div key={dog.id}>
      <h1>{dog.name}</h1>
      <h2>{dog.age}</h2>
    </div>
  ));

  return <div>{dogJSX}</div>;
}
```

Filter before you map when you need a subset: `dogs.filter((d) => d.age > 4).map(...)`.

## Iterating Over an Object in React

Objects aren't iterable, so turn them into arrays first. `Object.entries` gives `[key, value]` pairs; the key doubles as the React key.

```jsx
function Profile() {
  const arthur = {
    name: "Arthur Bernier Jr",
    role: "engineer",
    site: "deeperthancode.com",
  };

  return (
    <dl>
      {Object.entries(arthur).map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

## The useState Hook

`useState` gives a component a value that survives re-renders and a setter that schedules a re-render when the value changes.

```jsx
import { useState } from "react";
```

Call it at the top level of the component. The convention is `[thing, setThing]`.

```jsx
// counter starts at 0; setCounter updates it
const [counter, setCounter] = useState(0);
```

A complete counter:

```jsx
import { useState } from "react";

function Counter() {
  const [counter, setCounter] = useState(0);

  function addOne() {
    // the updater form reads the latest value, even if several updates are queued
    setCounter((c) => c + 1);
  }

  return (
    <div>
      <h1>{counter}</h1>
      <button onClick={addOne}>Click me to add one</button>
    </div>
  );
}
```

What happens on click:

- `setCounter` queues an update. The `counter` variable in the running function does **not** change — state behaves like a snapshot for the rest of that render.
- React re-renders the component (and its children) with the new value. If the new value is identical by `Object.is`, React skips the re-render.
- React compares the new output to what it rendered last time and only touches the parts of the DOM that changed.

**Objects and arrays in state are treated as immutable.** Mutating them in place keeps the same reference, so `Object.is` says nothing changed and nothing re-renders. Create a new one instead.

Don't do this:

```jsx
// mutates the existing array, then sets the same reference: no update
items[0] = 6;
setItems(items);
```

Do this:

```jsx
// copy, change the copy, set the copy
const next = [...items];
next[0] = 6;
setItems(next);
```

For objects: `setForm({ ...form, name: "new" })`. For nested data, copy each level you change, or use a library like Immer.

Rules for every hook: call them at the top level of a component or custom hook — not inside loops, conditions or nested functions — and only from React functions.

## The useEffect Hook

Effects let a component synchronize with something **outside** React: a network request, a subscription, a timer, a browser API. If you can compute something from props and state during render, you don't need an effect.

Here is the counter with a second piece of state and a log:

```jsx
import { useState } from "react";

function Counter() {
  const [counter, setCounter] = useState(0);
  const [evenCounter, setEvenCounter] = useState(0);

  console.log("I run on every render");

  function addOne() {
    if (counter % 2 === 0) setEvenCounter((e) => e + 1);
    setCounter((c) => c + 1);
  }

  return (
    <div>
      <h1>{counter}</h1>
      <h1>{evenCounter}</h1>
      <button onClick={addOne}>Click me to add one</button>
    </div>
  );
}
```

The whole function body runs on every render, so that log fires on every click. To run code only when `evenCounter` changes, move it into an effect with a dependency array:

```jsx
import { useState, useEffect } from "react";

function Counter() {
  const [counter, setCounter] = useState(0);
  const [evenCounter, setEvenCounter] = useState(0);

  useEffect(() => {
    console.log("evenCounter is now", evenCounter);
  }, [evenCounter]);

  function addOne() {
    if (counter % 2 === 0) setEvenCounter((e) => e + 1);
    setCounter((c) => c + 1);
  }

  return (
    <div>
      <h1>{counter}</h1>
      <h1>{evenCounter}</h1>
      <button onClick={addOne}>Click me to add one</button>
    </div>
  );
}
```

`useEffect(setup, dependencies)`:

- `setup` runs after the component is added to the DOM, and again after any render where a dependency changed.
- `[]` means "after the first render only" (in development, Strict Mode runs setup → cleanup → setup once to surface bugs; that is expected).
- No array at all means "after every render" — rarely what you want.
- Every reactive value the setup reads must be in the array. The `react-hooks/exhaustive-deps` lint rule (included in Vite's template) enforces this.

The common use is loading data. Return a **cleanup** function and use an `ignore` flag so a stale response can't overwrite newer state:

```jsx
useEffect(() => {
  let ignore = false;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!ignore) setPosts(data);
    });

  return () => {
    ignore = true; // runs before the next setup and on unmount
  };
}, [url]);
```

Cleanup is also where you remove event listeners, clear intervals and close subscriptions. For anything bigger than a demo, a data library such as TanStack Query (or React Router's loaders) handles caching, retries and race conditions for you.

## The useRef hook

`useRef` returns an object with one property, `current`, that React preserves between renders and that does **not** trigger a re-render when it changes. Two uses: holding a DOM node, and holding any mutable value you don't want to render (a timer id, the previous value of something).

```jsx
import { useRef } from "react";

function Focuser() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus(); // the DOM node
    console.log(inputRef.current.value);
  }

  return (
    <div>
      <input type="text" ref={inputRef} />
      <button onClick={handleClick}>Focus the input</button>
    </div>
  );
}
```

Read or write `ref.current` in event handlers and effects, not during render (it isn't part of the render output, so React can't react to it).

## Form Handling

Two classic approaches, plus the React 19 one.

- **Controlled forms:** the input's `value` is state, so state and the screen are always in sync, and you can validate on every keystroke.
- **Uncontrolled forms:** the DOM owns the value; you read it with a ref (or `FormData`) when you need it.
- **Form actions (React 19):** pass a function to `<form action>`; React calls it with the `FormData`, resets the form on success and tracks pending state with `useActionState` / `useFormStatus`.

### Example of a Controlled Form

Parts: an object in state, one `handleChange` for every input (keyed by the input's `name`), and a `handleSubmit`.

```jsx
import { useState } from "react";

function Form() {
  const [form, setForm] = useState({ name: "", age: "" });

  function handleChange(event) {
    // computed key: whichever input fired, update that field
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault(); // stop the page reload
    console.log(form); // input values are always strings
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={form.name} onChange={handleChange} name="name" placeholder="write name here" />
      <input type="number" value={form.age} onChange={handleChange} name="age" placeholder="write age here" />
      <button type="submit">Submit form</button>
    </form>
  );
}
```

### Example of an Uncontrolled Form

One ref per input, or skip refs entirely and read `new FormData(event.target)`.

```jsx
import { useRef } from "react";

function Form() {
  const nameInput = useRef(null);
  const ageInput = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    console.log({ name: nameInput.current.value, age: ageInput.current.value });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" ref={nameInput} placeholder="write name here" />
      <input type="number" ref={ageInput} placeholder="write age here" />
      <button type="submit">Submit form</button>
    </form>
  );
}
```

The React 19 form action, with pending state and a returned message:

```jsx
import { useActionState } from "react";

async function save(previousState, formData) {
  const response = await fetch("/api/people", { method: "POST", body: formData });
  return response.ok ? "Saved" : "Something went wrong";
}

function Form() {
  const [message, formAction, isPending] = useActionState(save, null);

  return (
    <form action={formAction}>
      <input name="name" placeholder="write name here" />
      <input name="age" type="number" placeholder="write age here" />
      <button type="submit" disabled={isPending}>{isPending ? "Saving…" : "Submit form"}</button>
      {message && <p>{message}</p>}
    </form>
  );
}
```

For large forms, React Hook Form is the most used library; it is uncontrolled under the hood, which is why it stays fast.

## State Management

State is the reason the UI is reactive. As an app grows the question becomes *where* each piece of state should live.

**How many components use this piece of state?**

- 0–1: keep it in the component that uses it.
- 2–5: put it in the closest common parent and pass it down ("lift state up").
- Many, across distant branches: Context, or a small store (Zustand, Redux Toolkit).

Also ask whether it is state at all: anything you can compute from existing props or state (a filtered list, a total) should be computed during render, not stored.

#### Lifting State

Siblings can't talk to each other; their shared parent holds the state, gives one child the state and the other a function to change it.

```jsx
import { useState } from "react";

// receives a function that updates the parent's state
function SenderChild({ onUpdate }) {
  return <button onClick={() => onUpdate("Goodbye")}>Click me</button>;
}

// receives the parent's state
function ReceiverChild({ value }) {
  return <h1>{value}</h1>;
}

function Parent() {
  const [greeting, setGreeting] = useState("Hello");

  return (
    <div>
      <ReceiverChild value={greeting} />
      <SenderChild onUpdate={setGreeting} />
    </div>
  );
}
```

#### Prop Drilling

When the tree is several levels deep, a value can end up threaded through components that don't use it:

```jsx
const GrandChild = ({ data }) => <h1>{data}</h1>;

const Child = ({ cheese }) => <GrandChild data={cheese} />;

const Parent = () => <Child cheese="gouda" />;
```

`Child` exists only to forward `cheese`. Two or three levels is fine and explicit. Beyond that, the fixes are:

- **Composition first:** pass the finished JSX down as `children` so intermediate components don't need to know about the data.
- **Context** for data many components read (theme, current user, locale).
- **`useReducer`** when the update logic itself gets complicated, often combined with Context.
- A store library (Zustand, Redux Toolkit, Jotai) when state is shared app-wide and changes often.

### Context

Context lets a parent make a value available to any component below it without passing props through the levels in between. Props are the stairs; Context is the elevator.

```jsx
import { createContext, useContext } from "react";

// 1. create it (the argument is the default when no provider is above)
const CheeseContext = createContext(null);

function GrandChild() {
  // 3. read it anywhere below the provider
  const cheese = useContext(CheeseContext);
  return <h1>{cheese}</h1>;
}

// no props pass through Child
function Child() {
  return <GrandChild />;
}

function Parent() {
  // 2. provide it — in React 19 the Context itself is the provider
  return (
    <CheeseContext value="cheese">
      <Child />
    </CheeseContext>
  );
}
```

Notes: `<CheeseContext.Provider>` still works (it's deprecated in favour of `<CheeseContext>`). `use(CheeseContext)` can replace `useContext` and, unlike other hooks, may be called inside conditions. Every component that reads a context re-renders when its value changes, so split rarely-changing and frequently-changing values into separate contexts.

### The useReducer Hook

A reducer collects all the ways a piece of state can change into one function: `(state, action) => newState`. Components describe *what happened* by dispatching an action (`{ type, payload }`); the reducer decides how state changes. This is the Redux idea, built into React.

```jsx
import { createContext, useContext, useReducer } from "react";

const CounterContext = createContext(null);

// all the stateful logic, in one pure function
function reducer(state, action) {
  switch (action.type) {
    case "add":
      return state + action.payload;
    case "subtract":
      return state - action.payload;
    default:
      return state;
  }
}

function GrandChild() {
  const { state, dispatch } = useContext(CounterContext);
  return (
    <>
      <h1>{state}</h1>
      <button onClick={() => dispatch({ type: "add", payload: 1 })}>Add</button>
      <button onClick={() => dispatch({ type: "subtract", payload: 1 })}>Subtract</button>
    </>
  );
}

function Child() {
  return <GrandChild />;
}

function Parent() {
  const [state, dispatch] = useReducer(reducer, 0);

  return (
    <CounterContext value={{ state, dispatch }}>
      <Child />
    </CounterContext>
  );
}
```

Reducers must be pure and must return new objects/arrays rather than mutating `state`, for the same `Object.is` reason as `useState`.

## React Router

React Router is the standard client-side router. Since v7 it has three modes; the **declarative** mode below is the one to learn first. Since v8 there is one package:

```bash
npm install react-router
```

(`react-router-dom` no longer exists as of v8 — import everything from `react-router`.)

#### BrowserRouter

Wraps the app once, watches the URL and gives every router component below it access to it. Put it in `main.jsx`.

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

#### Routes and Route

`Routes` picks the single best match among its `Route` children (what `Switch` used to do) and renders that route's `element`. You pass your component as JSX, so you can give it any props.

```jsx
import { Routes, Route } from "react-router";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About user="Arthur" />} />
      <Route path="/projects/:id" element={<Project />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

`:id` is a **dynamic segment**; `*` catches everything else. Nested routes render into an `<Outlet />` in the parent:

```jsx
import { Routes, Route, Outlet } from "react-router";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Outlet /> {/* the matching child renders here */}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<Overview />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
```

#### Reading the URL and navigating in code

```jsx
import { useParams, useNavigate, useLocation, useSearchParams } from "react-router";

function Project() {
  const { id } = useParams(); // "/projects/42" → { id: "42" } (always a string)
  const navigate = useNavigate();
  const location = useLocation(); // pathname, search, hash, state
  const [searchParams, setSearchParams] = useSearchParams(); // ?sort=asc

  return <button onClick={() => navigate("/projects")}>Back to all projects</button>;
}
```

#### Link and NavLink

Use `Link` instead of `<a>` so navigation happens without a page load. `NavLink` also knows when it is active, for nav styling.

```jsx
import { Link, NavLink } from "react-router";

function Navigation() {
  return (
    <nav>
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
        Home
      </NavLink>
      <Link to="/about">About</Link>
      <Link to="/projects">Projects</Link>
    </nav>
  );
}
```

When you want data loaded before a page renders (`loader`), form submissions handled by the router (`action`), or server rendering, move to **data mode** (`createBrowserRouter`) or **framework mode** — same components, more features.

## Styled Components

*Optional.* Styled Components is a third-party library that attaches real CSS to a component. It is still maintained (6.x on npm, with a v7 in development) but it is one choice among several: Vite ships CSS Modules with zero setup (`Button.module.css` → `import styles from "./Button.module.css"`), and Tailwind is the other common pick.

```bash
npm install styled-components
```

```jsx
import styled from "styled-components";

const Container = styled.div`
  width: 80%;
  margin: auto;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3em;
  color: ${(props) => (props.$danger ? "red" : "inherit")};
`;

function Component() {
  return (
    <Container>
      <Title $danger>Hello World</Title>
    </Container>
  );
}
```

Props used only for styling are prefixed with `$` ("transient props") so they are not forwarded to the DOM element.

## Conditional Rendering

Vue, Angular and Svelte have template directives for "show this only if…". React uses plain JavaScript, so strong JavaScript pays off here. Below, an `IsEven` component rendered several ways.

#### Return statement within an if block

```jsx
function IsEven({ number }) {
  if (number % 2 === 0) {
    return <h1>It is even</h1>;
  } else {
    return <h1>It is odd</h1>;
  }
}
```

#### Single return, if assigns a variable

```jsx
function IsEven({ number }) {
  let result;

  if (number % 2 === 0) {
    result = <h1>It is even</h1>;
  } else {
    result = <h1>It is odd</h1>;
  }

  return result;
}
```

#### Returning a ternary

```jsx
function IsEven({ number }) {
  return number % 2 === 0 ? <h1>It is even</h1> : <h1>It is odd</h1>;
}
```

#### Logical AND for "render or nothing"

```jsx
function Badge({ count }) {
  return <div>{count > 0 && <span>{count} new</span>}</div>;
}
```

Careful: `{count && <span/>}` renders a literal `0` when `count` is `0`, because `0` is falsy but not nothing. Compare explicitly (`count > 0 &&`) or use a ternary with `null`.

#### Returning null

A component that returns `null` renders nothing.

```jsx
function Warning({ show }) {
  if (!show) return null;
  return <p className="warning">Careful!</p>;
}
```

#### Conditional classes

```jsx
const Modal = ({ visible, children }) => (
  <div className={visible ? "modal active" : "modal"}>{children}</div>
);
```

#### Conditional styles

```jsx
const Modal = ({ visible, children }) => (
  <div style={{ display: visible ? "block" : "none" }}>{children}</div>
);
```

#### Using object keys to pick JSX

```jsx
function Verdict({ kind }) {
  const result = {
    good: <h1>Good</h1>,
    bad: <h1>Bad</h1>,
    ugly: <h1>Ugly</h1>,
  };

  return result[kind] ?? null;
}
```

#### Using a switch statement

```jsx
function Hello({ language }) {
  switch (language) {
    case "eng":
      return <h1>Hello</h1>;
    case "esp":
      return <h1>Hola</h1>;
    default:
      return <h1>No language detected</h1>;
  }
}
```

## Quick Tips

#### Destructuring Props

If you know the prop names, destructure them in the parameter list (and give defaults there).

```jsx
const Component = ({ name, age = 0 }) => (
  <div>
    <h1>{name}</h1>
    <h2>{age}</h2>
  </div>
);
```

#### Spreading Props

Many props inline get messy; bundle them in an object and spread it.

```jsx
<Component name="Arthur Bernier Jr" age={35} website="deeperthancode.com" />
```

```jsx
const props = {
  name: "Arthur Bernier Jr",
  age: 35,
  website: "deeperthancode.com",
};

return <Component {...props} />;
```

Spreading is also how wrapper components forward everything they don't use: `function Button({ children, ...rest }) { return <button {...rest}>{children}</button>; }`.

#### props.children

Whatever sits between a component's opening and closing tags arrives as the `children` prop. That is how layout components wrap content they know nothing about.

```jsx
function Container({ children }) {
  const style = {
    width: "90%",
    margin: "auto",
    border: "1px solid green",
  };
  return <div style={style}>{children}</div>;
}

function App() {
  return (
    <Container>
      <h1>Hello World</h1>
    </Container>
  );
}
```

#### Portals

`createPortal` (from `react-dom`) renders children into a different DOM node while keeping them in the same React tree — events still bubble to React parents, context still flows. Modals, tooltips and toasts use it.

```jsx
import { createPortal } from "react-dom";

function Modal({ children }) {
  return createPortal(
    <div className="modal">{children}</div>,
    document.body // or a dedicated #modal-root element
  );
}

function App() {
  return (
    <div className="app">
      <Modal>
        <h1>This renders at the end of body</h1>
      </Modal>
    </div>
  );
}
```

#### Popular React Libraries

- **react-router** — client-side routing (and, in framework mode, a full-stack framework)
- **TanStack Query** — server state: fetching, caching, refetching
- **React Hook Form** — performant forms and validation (pairs with Zod)
- **Zustand** and **Redux Toolkit** — app-wide client state
- **MUI**, **shadcn/ui** (Radix primitives + Tailwind), **Chakra UI** — component libraries
- **Tailwind CSS**, **styled-components**, CSS Modules — styling
- **Vitest** + **React Testing Library** — tests

#### Other Popular Parts of the React Ecosystem

- **Next.js** — server rendering, static generation and React Server Components
- **React Router framework mode** (formerly Remix) and **TanStack Start** — full-stack React on standard web APIs
- **Astro** — content sites that use React components as islands
- **React Native** / **Expo** — iOS, Android and web from one codebase
- **React Compiler** — build-time automatic memoization (see below)

#### Other Frontend Frameworks (Competitors)

- **Angular** — batteries-included, TypeScript, signals
- **Vue** — single-file components, reactivity via `ref`/`reactive`
- **Svelte** — compiler-first, runes (`$state`) for reactivity
- **SolidJS** — JSX with fine-grained signals, no virtual DOM
- **Preact** — 3 kB React-compatible alternative
- **Lit** — web components
- **Qwik**, **HTMX** — resumability / hypermedia approaches

## useMemo and useCallback

These are performance tools, not correctness tools. Reach for them after measuring.

- `useMemo(fn, deps)` caches the **result** of an expensive calculation between renders until a dependency changes.
- `useCallback(fn, deps)` caches the **function itself**, so a child wrapped in `memo` (or an effect that lists the function as a dependency) doesn't see a new function every render.

```jsx
import { useMemo, useCallback, memo } from "react";

const Row = memo(function Row({ item, onSelect }) {
  return <li onClick={() => onSelect(item.id)}>{item.name}</li>;
});

function List({ items, filter }) {
  // recomputed only when items or filter change
  const visible = useMemo(() => items.filter((i) => i.name.includes(filter)), [items, filter]);

  // same function identity between renders, so memo(Row) can skip
  const handleSelect = useCallback((id) => console.log("selected", id), []);

  return (
    <ul>
      {visible.map((item) => (
        <Row key={item.id} item={item} onSelect={handleSelect} />
      ))}
    </ul>
  );
}
```

The **React Compiler** (1.0, `babel-plugin-react-compiler`) does this memoization automatically at build time for components that follow the Rules of React. New projects can enable it in the Vite React plugin; with it on, hand-written `useMemo`/`useCallback` become the exception.

## Learning More About React

- [react.dev — Learn React](https://react.dev/learn): the official tutorial-style docs, read top to bottom once
- [react.dev — API reference](https://react.dev/reference/react): every hook and API
- [Thinking in React](https://react.dev/learn/thinking-in-react): the component / state design process
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect): the article that fixes most effect bugs
- [React Router docs](https://reactrouter.com/): declarative, data and framework modes
- [React Compiler](https://react.dev/learn/react-compiler): what it does and how to enable it
- [TypeScript with React](https://react.dev/learn/typescript): typing props, hooks and events
- [Testing Library — React](https://testing-library.com/docs/react-testing-library/intro/): tests that use components the way users do
