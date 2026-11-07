---
title: "Svelte: consume the API"
framework: Svelte
version: "5"
lede: "Scaffold a SvelteKit app with `npx sv create`, load the todo list in a load function, and build list / show / create / edit / delete with Svelte 5 runes and file-based routes."
updated_from: "the 2021 Snowpack template + svelte-routing walkthrough"
verified: 2026-11-02
docs:
  - https://svelte.dev/docs/kit/creating-a-project
  - https://svelte.dev/docs/kit/routing
  - https://svelte.dev/docs/kit/load
  - https://svelte.dev/docs/kit/environment-variables
  - https://svelte.dev/docs/kit/$app-navigation
  - https://svelte.dev/docs/kit/migrating-to-sveltekit-3
  - https://svelte.dev/docs/svelte/$state
  - https://svelte.dev/docs/svelte/$props
  - https://svelte.dev/docs/svelte/each
exec: ran
verified_note: "Scaffolded with sv 1.2 (`npx sv create --template minimal --types jsdoc --no-add-ons`), files copied in verbatim, `npm run build` succeeded with svelte 5.57.3 + @sveltejs/kit 3.1.1 + vite 8.3.5 on Node 24.13."
changes:
  - "Snowpack is discontinued (2022) and the `merced-spinup` template with it. The project is scaffolded with the official `npx sv create`, which gives you SvelteKit on Vite; the dev server is `npm run dev` on port 5173."
  - "`svelte-routing` is replaced by SvelteKit's file-based routing: `src/routes/+page.svelte`, `src/routes/post/[id]/+page.svelte`, `src/routes/new/+page.svelte`, `src/routes/edit/[id]/+page.svelte`. Navigation uses plain `<a href>` and `goto()` from `$app/navigation`."
  - "Svelte 5 runes replace the Svelte 3 syntax: `let { data } = $props()` instead of `export let`, `$state()` for local state, `$derived()` for computed values, `onclick={fn}` / `onsubmit={fn}` instead of `on:click` / `on:submit`, and `{#each todos as todo (todo.id)}` with a key."
  - "The list is fetched in a `load` function (`+page.js`) so the page renders with data instead of `undefined` on first paint; after a mutation the app navigates back and the list is reloaded."
  - "SvelteKit 3 specifics: the `$lib` alias is now `#lib`, and public environment variables are declared in `src/env.js` with `defineEnvVars` and imported from `$app/env/public`."
  - "The API URL comes from an environment variable instead of a hard-coded Heroku host; HTTP methods are upper-case; the edit form keys off the `[id]` route param rather than an optional prop."
---

# Frontend - Svelte

## Prerequisites

- A deployed Todos API from one of the [backend guides](/languages/): `GET /todos/` returns `[{ id, subject, details }]`; `POST /todos/`, `PUT /todos/:id/` and `DELETE /todos/:id/` are accepted.
- Node.js 22.17 or newer (SvelteKit 3's minimum; Node 24 is the current LTS).

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

- Declare the API URL as a public environment variable. SvelteKit 3 reads variables from `.env` files and types them through `src/env.js`:

`.env`

```env
API_URL=https://your-api.up.railway.app/todos/
```

`src/env.js`

```js
import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
  // public: true makes it importable in browser code
  API_URL: { public: true },
});
```

- Add a tiny API module. `#lib` is SvelteKit's alias for `src/lib` (it was `$lib` before SvelteKit 3).

`src/lib/api.js`

```js
import { API_URL } from "$app/env/public";

const headers = { "Content-Type": "application/json" };

// `fetch` is passed in so load functions can use SvelteKit's fetch on the server
export async function getTodos(fetch = globalThis.fetch) {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`GET ${API_URL} failed: ${response.status}`);
  return response.json();
}

export function createTodo(todo) {
  return fetch(API_URL, { method: "POST", headers, body: JSON.stringify(todo) });
}

export function updateTodo(id, todo) {
  return fetch(`${API_URL}${id}/`, { method: "PUT", headers, body: JSON.stringify(todo) });
}

export function deleteTodo(id) {
  return fetch(`${API_URL}${id}/`, { method: "DELETE" });
}
```

##### Create our routes

In SvelteKit a page is a folder under `src/routes` with a `+page.svelte` inside; `[id]` in a folder name is a dynamic segment. Create these files (empty for now):

```text
src/routes/
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

Instead of fetching in `onMount` and starting with `undefined`, the list page gets its data from a sibling `+page.js` `load` function. It runs on the server for the first visit and in the browser afterwards, and the result arrives in the page as the `data` prop.

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

The **new** page creates and goes back to the list. `goto` is SvelteKit's programmatic navigation; the list page's `load` runs again on the way in.

`src/routes/new/+page.svelte`

```svelte
<script>
  import { goto } from "$app/navigation";
  import { createTodo } from "#lib/api.js";
  import TodoForm from "#lib/TodoForm.svelte";

  async function save(todo) {
    await createTodo(todo);
    await goto("/");
  }
</script>

<TodoForm onsave={save} />
```

The **edit** page pre-fills the form from the matching post and `PUT`s on submit.

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
    await updateTodo(page.params.id, { id: post.id, ...todo });
    await goto("/");
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
    await goto("/");
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

Done: full CRUD on the frontend. `npm run build` produces the production app; with the default adapter it runs as a Node server, or install `@sveltejs/adapter-static` for a static site.

## Resources to Learn More

- [Svelte 5 runes: `$state`](https://svelte.dev/docs/svelte/$state), [`$derived`](https://svelte.dev/docs/svelte/$derived), [`$props`](https://svelte.dev/docs/svelte/$props)
- [SvelteKit routing](https://svelte.dev/docs/kit/routing) and [loading data](https://svelte.dev/docs/kit/load)
- [SvelteKit environment variables](https://svelte.dev/docs/kit/environment-variables)
- [Migrating to SvelteKit 3](https://svelte.dev/docs/kit/migrating-to-sveltekit-3) (what changed from the version most tutorials still show)
- The interactive [Svelte tutorial](https://svelte.dev/tutorial)
