---
title: "React: consume the API"
framework: React
version: "19.3"
lede: "Scaffold a React app with Vite, wire up React Router, fetch the todo list from your deployed API and build the list / show / create / edit / delete flow with hooks."
updated_from: "the 2021 Create React App + react-router-dom walkthrough"
verified: 2026-11-07
docs:
  - https://react.dev/learn
  - https://react.dev/reference/react/useEffect
  - https://react.dev/reference/react-dom/client/createRoot
  - https://reactrouter.com/start/declarative/installation
  - https://reactrouter.com/start/declarative/routing
  - https://reactrouter.com/changelog
  - https://vite.dev/guide/
exec: ran
verified_note: "Scaffolded with `npm create vite@latest` (create-vite 9.3.4, react template), the files below copied in verbatim, `npm run build` succeeded with react 19.3.1 + react-router 8.5.1 + vite 8.3.6 on Node 24.13. The result is deployed at https://dtc-react-production.up.railway.app (repo github.com/arthurbernierjr/dtc-react) pointed at the Python / Django REST framework API at https://api-production-02380.up.railway.app, and the list / create / edit / delete flow was exercised in a browser against it."
changes:
  - "Create React App is gone (the React team stopped recommending it in 2025); the project is scaffolded with Vite (`npm create vite@latest`). The dev server is `npm run dev` on port 5173, not `npm start` on 3000."
  - "`react-router-dom` no longer exists as of React Router 8 (June 2026). Everything is imported from `react-router`."
  - "`ReactDOM.render` was removed in React 18; the entry file uses `createRoot` from `react-dom/client`, and the file is `src/main.jsx` rather than `index.js`."
  - "Files that contain JSX use the `.jsx` extension (Vite only transforms JSX in `.jsx`/`.tsx` files)."
  - "The data-fetching effect uses the `ignore` flag pattern from react.dev so Strict Mode's double-invocation in development cannot write a stale response into state."
  - "The edit screen is its own route, `/edit/:id`, instead of a `targetTodo` held in App state, so a page refresh on the edit screen still works."
  - "`milligram` and `reportWebVitals` were dropped; the API URL comes from an environment variable (`VITE_API_URL`) instead of a hard-coded Heroku host (Heroku's free tier ended in 2022)."
  - "HTTP methods are upper-case (`POST`, `PUT`, `DELETE`) and responses are checked with `response.ok` before parsing."
  - "The API base URL is now the origin only (`VITE_API_URL=https://api-production-02380.up.railway.app`, no path, no trailing slash) and the code builds `${API}/todos` and `${API}/todos/${id}` itself, matching the shared Todos contract every backend guide serves. The 2021 version hard-coded a `/todos/` base with trailing slashes."
---

# Frontend - React

## Prerequisites

- A deployed Todos API from one of the [backend guides](/languages/). Every backend guide serves the same contract, below.
- Node.js 22.22 or newer (React Router 8's minimum; Node 24 is the current LTS).
- A terminal and an editor. Nothing else is installed globally: `npm create` downloads the scaffolder on demand.

### The Todos contract

What every backend serves; no trailing slashes:

| Request | Response |
|---|---|
| `GET /health` | `{"ok":true}` |
| `GET /todos` | `[{id,subject,details}]` ordered by id |
| `GET /todos/:id` | object or 404 `{"error":"not found"}` |
| `POST /todos` `{subject,details}` | 201 object |
| `PUT /todos/:id` `{subject,details}` | 200 object |
| `DELETE /todos/:id` | 204 |
| blank/missing fields | 400 `{"error":"…"}` |

Objects contain exactly `id` (integer), `subject`, `details`. CORS allows any origin.

### Pick any backend

All eight are live and interchangeable:

| Language | Framework | Repo | Live API |
|---|---|---|---|
| Python | Django REST framework | https://github.com/arthurbernierjr/dtc-python-api | https://api-production-02380.up.railway.app |
| Ruby | Rails | https://github.com/arthurbernierjr/dtc-ruby-api | https://api-production-0197.up.railway.app |
| Go | chi | https://github.com/arthurbernierjr/dtc-go-api | https://api-production-a3ab.up.railway.app |
| Java | Spring Boot | https://github.com/arthurbernierjr/dtc-java-api | https://api-production-c419.up.railway.app |
| C# | ASP.NET Core | https://github.com/arthurbernierjr/dtc-cs-api | https://api-production-efe3.up.railway.app |
| PHP | Laravel | https://github.com/arthurbernierjr/dtc-php-api | https://api-production-2278d.up.railway.app |
| Rust | Axum | https://github.com/arthurbernierjr/dtc-rust-api | https://api-production-da990.up.railway.app |
| Dart | shelf | https://github.com/arthurbernierjr/dtc-dart-api | https://api-production-5f5ac.up.railway.app |

Every one serves the same contract, so the `VITE_API_URL` variable below can point at any of them. Each repo ships a `check.mjs` you can run against your own deploy: `node check.mjs https://your-api.up.railway.app`.

## Setup

- Scaffold the project with Vite's React template and move into it:

```bash
npm create vite@latest todofront -- --template react
cd todofront
npm install
```

- Install the router:

```bash
npm install react-router
```

- Tell the app where the API lives. Vite exposes any variable prefixed with `VITE_` to the browser through `import.meta.env`. The value is the API's origin only: no path, no trailing slash. The code adds `/todos` itself.

```env
# .env.local  (git-ignored by the Vite template)
VITE_API_URL=https://api-production-02380.up.railway.app
```

  For a deployed build, put the same line in a committed `.env.production` instead; Vite reads it during `npm run build`, and the URL is public, not a secret.

- Start the dev server with `npm run dev` and open [http://localhost:5173](http://localhost:5173). You should see the Vite + React starter page.

> What is different from 2021: `create-react-app` is no longer maintained or recommended. Vite is the scaffolder the React docs point to for a client-only app, and it transforms JSX only in files ending in `.jsx` or `.tsx`, so every component file below uses `.jsx`.

## Setting Up React Router

React Router has three modes (declarative, data and framework). This walkthrough uses **declarative mode**: `<BrowserRouter>`, `<Routes>`, `<Route>`, `<Link>` and the hooks `useParams` / `useNavigate`. It is the smallest API surface and it is what the 2021 version used.

Everything is imported from the single `react-router` package. The old `react-router-dom` package was removed in v8.

Wrap the app in the router in the entry file, `src/main.jsx`:

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Wrap App so it and every child can use the router */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

## Setting Up Our Files

- In `src` create a `components` folder for small pieces of UI and a `pages` folder for components that act as routes.

#### Create the following components

`src/components/Post.jsx`

```jsx
export default function Post() {
  return <h1>Post</h1>;
}
```

`src/pages/AllPosts.jsx`

```jsx
export default function AllPosts() {
  return <h1>All posts</h1>;
}
```

`src/pages/SinglePost.jsx`

```jsx
export default function SinglePost() {
  return <h1>Post</h1>;
}
```

`src/pages/Form.jsx`

```jsx
export default function Form() {
  return <h1>Form</h1>;
}
```

#### Importing our components

Bring the pages into `App.jsx` and set up four client-side routes:

- `/` renders every todo in `AllPosts`
- `/post/:id` renders one todo in `SinglePost`
- `/new` renders `Form` to create a todo
- `/edit/:id` renders `Form` to edit a todo

`src/App.jsx`

```jsx
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router";

import AllPosts from "./pages/AllPosts.jsx";
import SinglePost from "./pages/SinglePost.jsx";
import Form from "./pages/Form.jsx";

// Read the API origin from .env.local (see Setup); fall back to a local server.
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function App() {
  ////////////////////
  // Style objects
  ////////////////////
  const h1 = { textAlign: "center", margin: "10px" };

  ///////////////
  // State
  ///////////////
  const [posts, setPosts] = useState([]);

  //////////////
  // Functions
  //////////////

  //////////////
  // Effects
  //////////////

  //////////////////////////
  // Returned JSX
  //////////////////////////
  return (
    <div className="App">
      <h1 style={h1}>My Todo List</h1>
      <Routes>
        <Route path="/" element={<AllPosts posts={posts} />} />
        <Route path="/post/:id" element={<SinglePost posts={posts} />} />
        <Route path="/new" element={<Form />} />
        <Route path="/edit/:id" element={<Form />} />
      </Routes>
    </div>
  );
}
```

#### Getting our todos

Write a `getTodos` function that fetches the list from the API, then call it from an effect that runs once after the first render.

Two details the React docs insist on: check `response.ok` before parsing, and use an `ignore` flag so that if the component unmounts (or Strict Mode runs the effect twice in development) a late response cannot overwrite newer state.

`src/App.jsx` — fragment: the Functions and Effects sections inside `App()`

```jsx
// fragment: goes inside App(), replacing the empty Functions and Effects sections
//////////////
// Functions
//////////////

// Fetch the list of todos from the API
async function getTodos() {
  const response = await fetch(`${API}/todos`);
  if (!response.ok) throw new Error(`GET ${API}/todos failed: ${response.status}`);
  const data = await response.json();
  setPosts(data);
}

//////////////
// Effects
//////////////

// Load the list once when the app mounts
useEffect(() => {
  let ignore = false;
  fetch(`${API}/todos`)
    .then((response) => response.json())
    .then((data) => {
      if (!ignore) setPosts(data);
    });
  return () => {
    ignore = true;
  };
}, []);
```

#### Rendering our todos

`App` already passes `posts` to `AllPosts`, so render them.

`src/pages/AllPosts.jsx`

```jsx
import Post from "../components/Post.jsx";

export default function AllPosts({ posts }) {
  // One Post component per todo; the id is the stable key
  return posts.map((post) => <Post post={post} key={post.id} />);
}
```

Define what one post looks like.

`src/components/Post.jsx`

```jsx
import { Link } from "react-router";

export default function Post({ post }) {
  const div = {
    textAlign: "center",
    border: "3px solid",
    margin: "10px auto",
    width: "80%",
  };
  return (
    <div style={div}>
      <Link to={`/post/${post.id}`}>
        <h1>{post.subject}</h1>
      </Link>
      <h2>{post.details}</h2>
    </div>
  );
}
```

#### SinglePost component

Read the `id` from the URL with `useParams`, find the matching todo, and handle the moment before the list has loaded.

`src/pages/SinglePost.jsx`

```jsx
import { Link, useParams } from "react-router";

export default function SinglePost({ posts }) {
  const { id } = useParams(); // URL params are strings
  const post = posts.find((p) => String(p.id) === id);

  const div = {
    textAlign: "center",
    border: "3px solid green",
    width: "80%",
    margin: "30px auto",
  };

  // The list is fetched after the first render, so there is a moment with no post yet
  if (!post) return <p style={{ textAlign: "center" }}>Loading…</p>;

  return (
    <div style={div}>
      <h1>{post.subject}</h1>
      <h2>{post.details}</h2>
      <Link to="/">
        <button>Go Back</button>
      </Link>
    </div>
  );
}
```

You can now click through to a single todo.

#### Setting up our form

One benefit of React is reusability. The same form serves `/new` and `/edit/:id`. It takes three props:

- `initialTodo`: the object that seeds the form state
- `handleSubmit`: called with the form data on submit
- `buttonLabel`: the text on the submit button

`src/pages/Form.jsx`

```jsx
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Form({ initialTodo, handleSubmit, buttonLabel }) {
  const navigate = useNavigate();

  // Seed the form with the initial todo
  const [formData, setFormData] = useState(initialTodo);

  // Standard controlled-input change handler
  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function onSubmit(event) {
    event.preventDefault(); // no full-page form post
    await handleSubmit(formData);
    navigate("/"); // back to the list
  }

  return (
    <form onSubmit={onSubmit}>
      <input type="text" name="subject" value={formData.subject} onChange={handleChange} />
      <input type="text" name="details" value={formData.details} onChange={handleChange} />
      <input type="submit" value={buttonLabel} />
    </form>
  );
}
```

#### Creating a todo

Back in `App.jsx`: add a function that POSTs the new todo, an empty todo object, the props on the `/new` route, and a button that links to the form. (These are fragments; the finished `App.jsx` is at the bottom of the page.)

```jsx
// fragment: inside App()
// State & other variables
const nullTodo = { subject: "", details: "" };

// Functions
async function addTodo(newTodo) {
  await fetch(`${API}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  });
  await getTodos(); // refresh the list
}
```

```jsx
<Route
  path="/new"
  element={<Form initialTodo={nullTodo} handleSubmit={addTodo} buttonLabel="create todo" />}
/>
```

```jsx
const button = { backgroundColor: "navy", color: "whitesmoke", display: "block", margin: "auto" };
```

```jsx
<h1 style={h1}>My Todo List</h1>
<Link to="/new">
  <button style={button}>Create New Todo</button>
</Link>
```

#### Editing todos

The edit screen is the route `/edit/:id`. A small wrapper reads the id, finds the todo, and renders the same `Form` with the update function. Because the id lives in the URL, refreshing the edit page still works.

`src/App.jsx` — fragment

```jsx
// fragment: inside App(), with the other functions
async function updateTodo(todo) {
  await fetch(`${API}/todos/${todo.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  await getTodos();
}
```

```jsx
<Route
  path="/edit/:id"
  element={<EditForm posts={posts} handleSubmit={updateTodo} />}
/>
```

`src/pages/EditForm.jsx`

```jsx
import { useParams } from "react-router";
import Form from "./Form.jsx";

export default function EditForm({ posts, handleSubmit }) {
  const { id } = useParams();
  const todo = posts.find((p) => String(p.id) === id);
  if (!todo) return <p style={{ textAlign: "center" }}>Loading…</p>;
  // key forces a fresh Form (and fresh state) when the id changes
  return <Form key={todo.id} initialTodo={todo} handleSubmit={handleSubmit} buttonLabel="update todo" />;
}
```

Add an edit link to the single-post view.

`src/pages/SinglePost.jsx` — fragment: the JSX inside the `div`

```jsx
<h1>{post.subject}</h1>
<h2>{post.details}</h2>
<Link to={`/edit/${post.id}`}>
  <button>Edit</button>
</Link>
<Link to="/">
  <button>Go Back</button>
</Link>
```

#### Deleting a todo

Last piece: a delete function in `App`, passed to `SinglePost`, wired to a button.

`src/App.jsx` — fragment

```jsx
// fragment: inside App()
const navigate = useNavigate(); // at the top of App, with the other hooks

async function deleteTodo(todo) {
  await fetch(`${API}/todos/${todo.id}`, { method: "DELETE" });
  await getTodos();
  navigate("/");
}
```

```jsx
<Route path="/post/:id" element={<SinglePost posts={posts} deleteTodo={deleteTodo} />} />
```

`src/pages/SinglePost.jsx` (final version)

```jsx
import { Link, useParams } from "react-router";

export default function SinglePost({ posts, deleteTodo }) {
  const { id } = useParams();
  const post = posts.find((p) => String(p.id) === id);

  const div = {
    textAlign: "center",
    border: "3px solid green",
    width: "80%",
    margin: "30px auto",
  };

  if (!post) return <p style={{ textAlign: "center" }}>Loading…</p>;

  return (
    <div style={div}>
      <h1>{post.subject}</h1>
      <h2>{post.details}</h2>
      <Link to={`/edit/${post.id}`}>
        <button>Edit</button>
      </Link>
      <button onClick={() => deleteTodo(post)}>Delete</button>
      <Link to="/">
        <button>Go Back</button>
      </Link>
    </div>
  );
}
```

#### The finished App.jsx

All the fragments above, in place:

`src/App.jsx` (final version)

```jsx
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router";

import AllPosts from "./pages/AllPosts.jsx";
import SinglePost from "./pages/SinglePost.jsx";
import Form from "./pages/Form.jsx";
import EditForm from "./pages/EditForm.jsx";

// Read the API origin from .env.local (see Setup); fall back to a local server.
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export default function App() {
  ////////////////////
  // Style objects
  ////////////////////
  const h1 = { textAlign: "center", margin: "10px" };
  const button = { backgroundColor: "navy", color: "whitesmoke", display: "block", margin: "auto" };

  ///////////////
  // State & other variables
  ///////////////
  const [posts, setPosts] = useState([]);
  const nullTodo = { subject: "", details: "" };
  const navigate = useNavigate();

  //////////////
  // Functions
  //////////////
  async function getTodos() {
    const response = await fetch(`${API}/todos`);
    if (!response.ok) throw new Error(`GET ${API}/todos failed: ${response.status}`);
    const data = await response.json();
    setPosts(data);
  }

  async function addTodo(newTodo) {
    await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });
    await getTodos();
  }

  async function updateTodo(todo) {
    await fetch(`${API}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });
    await getTodos();
  }

  async function deleteTodo(todo) {
    await fetch(`${API}/todos/${todo.id}`, { method: "DELETE" });
    await getTodos();
    navigate("/");
  }

  //////////////
  // Effects
  //////////////
  useEffect(() => {
    let ignore = false;
    fetch(`${API}/todos`)
      .then((response) => response.json())
      .then((data) => {
        if (!ignore) setPosts(data);
      });
    return () => {
      ignore = true;
    };
  }, []);

  //////////////////////////
  // Returned JSX
  //////////////////////////
  return (
    <div className="App">
      <h1 style={h1}>My Todo List</h1>
      <Link to="/new">
        <button style={button}>Create New Todo</button>
      </Link>
      <Routes>
        <Route path="/" element={<AllPosts posts={posts} />} />
        <Route path="/post/:id" element={<SinglePost posts={posts} deleteTodo={deleteTodo} />} />
        <Route
          path="/new"
          element={<Form initialTodo={nullTodo} handleSubmit={addTodo} buttonLabel="create todo" />}
        />
        <Route path="/edit/:id" element={<EditForm posts={posts} handleSubmit={updateTodo} />} />
      </Routes>
    </div>
  );
}
```

Full CRUD against your API, in React. Run `npm run build` and Vite writes a static `dist/` folder you can deploy anywhere.

### The finished example

The code on this page, built exactly as written, lives at [github.com/arthurbernierjr/dtc-react](https://github.com/arthurbernierjr/dtc-react) and runs at [dtc-react-production.up.railway.app](https://dtc-react-production.up.railway.app). It is pointed at the Python / Django REST framework API (`https://api-production-02380.up.railway.app`); to point it at any other backend from the table above, change `VITE_API_URL` in `.env.production` and rebuild.

> Going further: React Router's **data mode** moves fetching into route `loader` and `action` functions so the list is loaded before the page renders and there is no "Loading…" moment. The declarative version above is the right first step; the [data mode guide](https://reactrouter.com/start/data/installation) is the next.
