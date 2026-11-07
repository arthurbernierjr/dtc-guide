---
title: "Svelte: consume the API"
framework: Svelte
version: "5"
lede: "Scaffold a SvelteKit app with `npx sv create`, load the todo list in a load function, and build list / show / create / edit / delete with Svelte 5 runes and file-based routes."
updated_from: "the 2021 Snowpack template + svelte-routing walkthrough"
verified: 2026-11-07
docs:
  - https://svelte.dev/docs/kit/creating-a-project
  - https://svelte.dev/docs/kit/routing
  - https://svelte.dev/docs/kit/load
  - https://svelte.dev/docs/kit/environment-variables
  - https://svelte.dev/docs/kit/$app-navigation
  - https://svelte.dev/docs/kit/adapter-static
  - https://svelte.dev/docs/kit/migrating-to-sveltekit-3
  - https://svelte.dev/docs/svelte/$state
  - https://svelte.dev/docs/svelte/$props
  - https://svelte.dev/docs/svelte/each
exec: ran
verified_note: "Scaffolded with sv 1.3.0 (`npx sv create --template minimal --types jsdoc --no-add-ons`), files on this page copied in verbatim, `npm run build` succeeded with svelte 5.57.3 + @sveltejs/kit 3.1.1 + @sveltejs/adapter-static 4.0.1 + vite 8.3.6 on Node 24.13.0. The static build is served by serve 14.2.7 on Railway at https://dtc-svelte-production.up.railway.app, pointed at the Rust / Axum Todos API (https://api-production-da990.up.railway.app); list, create, edit and delete were exercised in Chromium with Playwright against that API."
changes:
  - "Snowpack is discontinued (2022) and the `merced-spinup` template with it. The project is scaffolded with the official `npx sv create`, which gives you SvelteKit on Vite; the dev server is `npm run dev` on port 5173."
  - "`svelte-routing` is replaced by SvelteKit's file-based routing: `src/routes/+page.svelte`, `src/routes/post/[id]/+page.svelte`, `src/routes/new/+page.svelte`, `src/routes/edit/[id]/+page.svelte`. Navigation uses plain `<a href>` and `goto()` from `$app/navigation`."
  - "Svelte 5 runes replace the Svelte 3 syntax: `let { data } = $props()` instead of `export let`, `$state()` for local state, `$derived()` for computed values, `onclick={fn}` / `onsubmit={fn}` instead of `on:click` / `on:submit`, and `{#each todos as todo (todo.id)}` with a key."
  - "The list is fetched in a `load` function (`+page.js`) so the page renders with data instead of `undefined` on first paint; after a mutation the app navigates back with `refreshAll: true` so the list is reloaded."
  - "SvelteKit 3 specifics: the `$lib` alias is now `#lib`, and public environment variables are declared in `src/env.js` with `defineEnvVars` and imported from `$app/env/public`."
  - "The API contract is shared by all eight backend guides: the env var `VITE_API_URL` holds the API origin only (no path, no trailing slash), the code builds `${API}/todos` and `${API}/todos/${id}`, PUT sends `{ subject, details }`, and the Prerequisites list every live backend you can point it at."
  - "The app is built as a static site with `@sveltejs/adapter-static` (`fallback: \"index.html\"`, `ssr = false`) so it can be served by any static host; the finished example is deployed on Railway."
---

# Frontend - Svelte

## Prerequisites

- A deployed Todos API from one of the [backend guides](/languages/). Every backend serves the same contract (no trailing slashes):
  - `GET /health` → `{"ok":true}`
  - `GET /todos` → `[{id,subject,details}]` ordered by id
  - `GET /todos/:id` → object or 404 `{"error":"not found"}`
  - `POST /todos` `{subject,details}` → 201 object
  - `PUT /todos/:id` `{subject,details}` → 200 object
  - `DELETE /todos/:id` → 204
  - blank/missing fields → 400 `{"error":"…"}`
  - CORS allows any origin. Objects contain exactly `id` (integer), `subject`, `details`.
- Node.js 22.17 or newer (SvelteKit 3's minimum; Node 24 is the current LTS).

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

Every one serves the same contract, so the env var below can point at any of them. Each repo ships a `check.mjs` you can run against your own deploy: `node check.mjs https://your-api.up.railway.app`.

## Setup

**We use SvelteKit, the official application framework for Svelte.** It runs on Vite, gives you file-based routing and a `load` function per page, and is what `npx sv create` scaffolds today. (The 2021 version used Snowpack, which was discontinued in 2022.)

- Generate a new project and start the dev server:

```bash
npx sv create todofrontend
cd todofrontend
npm install
npm run dev
```

Pick the **minimal** template when asked, choose JavaScript with JSDoc comments (or TypeScript), and skip the add-ons. Open [http://localhost:5173](http://localhost:5173).

- Make the build a static site. The scaffold's `adapter-auto` targets a Node server; `@sveltejs/adapter-static` writes plain files to `build/` that any static host can serve. The `fallback` option makes every route (including `/post/3`) load the same `index.html`, and `ssr = false` in the root layout tells SvelteKit to render in the browser.

```bash
npm uninstall @sveltejs/adapter-auto
npm install -D @sveltejs/adapter-static
```

`vite.config.js`

```js
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },

      // Static output: every route is served by the same index.html and
      // rendered in the browser (see src/routes/+layout.js).
      adapter: adapter({ fallback: "index.html" }),
    }),
  ],
});
```

`src/routes/+layout.js`

```js
// Render everything in the browser: the build is a static site with no server.
export const ssr = false;
```

- Declare the API URL as a public environment variable. It holds the **origin only** (no path, no trailing slash); the code adds `/todos` itself. SvelteKit 3 reads `.env` files (Vite's `.env.production` is used by `npm run build`) and types the variables through `src/env.js`. `static: true` inlines the value at build time, which a static site needs, and the schema function supplies a local fallback when the variable is unset.

`.env.production` (the real URL of the backend you picked above; this one is the Rust / Axum API)

```env
VITE_API_URL=https://api-production-da990.up.railway.app
```

`src/env.js`

```js
import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  // The origin of the Todos API, with no path and no trailing slash.
  // public: true makes it importable in browser code; static: true inlines
  // the build-time value, which a static site needs.
  VITE_API_URL: {
    public: true,
    static: true,
    schema: (value) => value || "http://localhost:8080",
  },
});
```

- Add a tiny API module. `#lib` is SvelteKit's alias for `src/lib` (it was `$lib` before SvelteKit 3). The requests are built from the origin: `${API}/todos` and `${API}/todos/${id}`.

`src/lib/api.js`

```js
import { VITE_API_URL as API } from "$app/env/public";

const headers = { "Content-Type": "application/json" };

// `fetch` is passed in so load functions can use SvelteKit's fetch
export async function getTodos(fetch = globalThis.fetch) {
  const response = await fetch(`${API}/todos`);
  if (!response.ok) throw new Error(`GET ${API}/todos failed: ${response.status}`);
  return response.json();
}

export function createTodo(todo) {
  return fetch(`${API}/todos`, { method: "POST", headers, body: JSON.stringify(todo) });
}

export function updateTodo(id, todo) {
  return fetch(`${API}/todos/${id}`, { method: "PUT", headers, body: JSON.stringify(todo) });
}

export function deleteTodo(id) {
  return fetch(`${API}/todos/${id}`, { method: "DELETE" });
}
```

##### Create our routes

In SvelteKit a page is a folder under `src/routes` with a `+page.svelte` inside; `[id]` in a folder name is a dynamic segment. Create these files (empty for now):

```text
src/routes/
├─ +layout.js              ssr = false (from the step above)
├─ +layout.svelte          shared header and "new todo" button
├─ +page.js                loads the list
├─ +page.svelte            /            all posts
├─ post/[id]/+page.svelte  /post/:id    one post
├─ new/+page.svelte        /new         create form
└─ edit/[id]/+page.svelte  /edit/:id    edit form
```

#### The layout and loading the todos

The layout wraps every page. `{@render children()}` is where the current page renders (Svelte 5's replacement for `<slot />`).

`src/routes/+layout.svelte`

```svelte
<script>
  let { children } = $props();
</script>

<div class="app">
  <h1>Our Todos</h1>
  <a href="/new"><button>Make New Todo</button></a>
  <main>
    {@render children()}
  </main>
</div>

<style>
  .app {
    text-align: center;
  }
</style>
```

Instead of fetching in `onMount` and starting with `undefined`, the list page gets its data from a sibling `+page.js` `load` function. SvelteKit waits for it before rendering the page, and the result arrives in the page as the `data` prop. (With `ssr = false` it runs in the browser; with server rendering enabled it would run on the server for the first visit.)

`src/routes/+page.js`

```js
import { getTodos } from "#lib/api.js";

export async function load({ fetch }) {
  return { todos: await getTodos(fetch) };
}
```

Because `post/[id]` and `edit/[id]` need the same list, give them the same loader by re-exporting it:

`src/routes/post/[id]/+page.js` and `src/routes/edit/[id]/+page.js`

```js
export { load } from "../../+page.js";
```

#### AllPosts

Loop through the todos and link to each one. The `(todo.id)` after the each block is the key.

`src/routes/+page.svelte`

```svelte
<script>
  let { data } = $props(); // { todos } from +page.js
</script>

<div>
  {#each data.todos as todo (todo.id)}
    <article>
      <a href="/post/{todo.id}"><h1>{todo.subject}</h1></a>
      <h2>{todo.details}</h2>
    </article>
  {/each}
</div>
```

#### SinglePost

Find the post whose id matches the `[id]` segment. `page.params` comes from `$app/state`; `$derived` recomputes when either the params or the data change.

`src/routes/post/[id]/+page.svelte`

```svelte
<script>
  import { page } from "$app/state";

  let { data } = $props();
  const post = $derived(data.todos.find((p) => String(p.id) === page.params.id));
</script>

{#if post}
  <div>
    <h1>{post.subject}</h1>
    <h2>{post.details}</h2>
    <a href="/"><button>Back to Main</button></a>
  </div>
{:else}
  <p>Not found.</p>
{/if}
```

#### Form

One form component, used by both the `new` and `edit` pages. It takes the initial values, a label and a submit handler as props; `$state` holds the field values and `bind:value` keeps the inputs in sync.

`src/lib/TodoForm.svelte`

```svelte
<script>
  let { initial = { subject: "", details: "" }, buttonLabel = "Create Todo", onsave } = $props();

  let subject = $state(initial.subject);
  let details = $state(initial.details);

  async function handleSubmit(event) {
    event.preventDefault();
    await onsave({ subject, details });
  }
</script>

<form onsubmit={handleSubmit}>
  <input type="text" placeholder="subject" bind:value={subject} />
  <input type="text" placeholder="details" bind:value={details} />
  <input type="submit" value={buttonLabel} />
</form>
```

The **new** page creates and goes back to the list. `goto` is SvelteKit's programmatic navigation; `refreshAll: true` makes the list page's `load` run again on the way in (and discards any list SvelteKit preloaded while you hovered a link).

`src/routes/new/+page.svelte`

```svelte
<script>
  import { goto } from "$app/navigation";
  import { createTodo } from "#lib/api.js";
  import TodoForm from "#lib/TodoForm.svelte";

  async function save(todo) {
    await createTodo(todo);
    await goto("/", { refreshAll: true });
  }
</script>

<TodoForm onsave={save} />
```

The **edit** page pre-fills the form from the matching post and `PUT`s `{ subject, details }` to `/todos/:id` on submit.

`src/routes/edit/[id]/+page.svelte`

```svelte
<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { updateTodo } from "#lib/api.js";
  import TodoForm from "#lib/TodoForm.svelte";

  let { data } = $props();
  const post = $derived(data.todos.find((p) => String(p.id) === page.params.id));

  async function save(todo) {
    await updateTodo(post.id, todo);
    await goto("/", { refreshAll: true });
  }
</script>

{#if post}
  <TodoForm initial={post} buttonLabel="Edit Todo" onsave={save} />
{:else}
  <p>Not found.</p>
{/if}
```

Add the edit link to the single-post page:

```svelte
<a href="/edit/{post.id}"><button>Edit the Todo</button></a>
```

#### Last, a delete button in SinglePost

`src/routes/post/[id]/+page.svelte` (final version)

```svelte
<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { deleteTodo } from "#lib/api.js";

  let { data } = $props();
  const post = $derived(data.todos.find((p) => String(p.id) === page.params.id));

  async function remove() {
    await deleteTodo(post.id);
    await goto("/", { refreshAll: true });
  }
</script>

{#if post}
  <div>
    <h1>{post.subject}</h1>
    <h2>{post.details}</h2>
    <a href="/"><button>Back to Main</button></a>
    <a href="/edit/{post.id}"><button>Edit the Todo</button></a>
    <button onclick={remove}>Delete Todo</button>
  </div>
{:else}
  <p>Not found.</p>
{/if}
```

Done: full CRUD on the frontend. `npm run build` writes the static site to `build/`; serve that folder with any static file server that falls back to `index.html` (for example `npx serve -s build`).

### The finished example

- Repo: [github.com/arthurbernierjr/dtc-svelte](https://github.com/arthurbernierjr/dtc-svelte)
- Live app: [dtc-svelte-production.up.railway.app](https://dtc-svelte-production.up.railway.app)

It is pointed at the Rust / Axum API (`VITE_API_URL=https://api-production-da990.up.railway.app`); to point it at any other backend from the table above, change the value in `.env.production` and rebuild. On Railway the repo adds `serve` as a dependency with `"start": "serve -s build -l $PORT"`, so `npm run build` then `npm start` is the whole deploy.

## Resources to Learn More

- [Svelte 5 runes: `$state`](https://svelte.dev/docs/svelte/$state), [`$derived`](https://svelte.dev/docs/svelte/$derived), [`$props`](https://svelte.dev/docs/svelte/$props)
- [SvelteKit routing](https://svelte.dev/docs/kit/routing) and [loading data](https://svelte.dev/docs/kit/load)
- [SvelteKit environment variables](https://svelte.dev/docs/kit/environment-variables)
- [adapter-static](https://svelte.dev/docs/kit/adapter-static) (static sites and the `fallback` option)
- [Migrating to SvelteKit 3](https://svelte.dev/docs/kit/migrating-to-sveltekit-3) (what changed from the version most tutorials still show)
- The interactive [Svelte tutorial](https://svelte.dev/tutorial)
