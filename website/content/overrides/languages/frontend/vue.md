---
title: "Vue: consume the API"
framework: Vue
version: "3.5"
lede: "Scaffold a Vue 3 app with create-vue, add Vue Router, fetch the todo list from your deployed API and build list / show / create / edit / delete with the Composition API and <script setup>."
updated_from: "the 2021 Vue CLI + Options-style setup() walkthrough"
verified: 2026-11-07
docs:
  - https://vuejs.org/guide/quick-start.html
  - https://vuejs.org/api/sfc-script-setup.html
  - https://vuejs.org/guide/essentials/lifecycle.html
  - https://router.vuejs.org/guide/
  - https://router.vuejs.org/guide/essentials/dynamic-matching.html
  - https://router.vuejs.org/guide/advanced/composition-api.html
  - https://github.com/vuejs/router/releases/tag/v5.0.0
exec: ran
verified_note: "Scaffolded with create-vue 3.24.0 (`npm create vue@latest -- --router --bare`), the files below copied in verbatim, `npm run build` succeeded with vue 3.5.45 + vue-router 5.4.0 + vite 8.3.6 on Node 24.13. The result is deployed at https://dtc-vue-production.up.railway.app (repo github.com/arthurbernierjr/dtc-vue) pointed at the Go / chi API at https://api-production-a3ab.up.railway.app, and the list / create / edit / delete flow was exercised in a browser against it."
changes:
  - "Vue CLI (`vue create`) is in maintenance mode; the project is scaffolded with create-vue (`npm create vue@latest`), which is Vite-based. The dev server is `npm run dev` on port 5173, not `npm run serve` on 8080."
  - "Components use `<script setup>` (Vue 3.2+) with `defineProps`, instead of `export default { setup() { ... return {...} } }` and the `$attrs` trick. Props are passed to the routed component explicitly through `<RouterView v-slot>`."
  - "Vue Router is on v5 (Jan 2026). The API used here (`createRouter`, `createWebHistory`, `useRoute`, `useRouter`, `RouterLink`, `RouterView`) is unchanged from v4; v5 only folded file-based routing into the core package."
  - "Lists are keyed by `post.id`, not the array index, and routes link by `id` rather than by position so edit/delete target the right record."
  - "Routes that the form depends on (`post`, `edit`) are named; the original referenced `route.name === 'edit'` without ever naming the route."
  - "`milligram` was dropped; the API URL comes from `VITE_API_URL` instead of a hard-coded Heroku host; HTTP methods are upper-case and the single-post view handles the moment before the list has loaded."
  - "The API base URL is now the origin only (`VITE_API_URL=https://api-production-a3ab.up.railway.app`, no path, no trailing slash) and the code builds `${API}/todos` and `${API}/todos/${id}` itself, matching the shared Todos contract every backend guide serves. The prop passed to the routed components is `api` rather than `url`. The 2021 version hard-coded a `/todos/` base with trailing slashes."
---

# Frontend - Vue

## Prerequisites

- A deployed Todos API from one of the [backend guides](/languages/). Every backend guide serves the same contract (no trailing slashes):

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
- Node.js 22.18+ or 24.12+ (create-vue's current minimum). Node 24 is the current LTS.
- Nothing installed globally. The old `npm install -g @vue/cli` step is gone: `npm create vue@latest` downloads the scaffolder on demand.

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

- Scaffold the project. Pass `--router` to have Vue Router installed and wired up, and `--bare` to skip the example components:

```bash
npm create vue@latest todofrontend -- --router --bare
cd todofrontend
npm install
```

(Run `npm create vue@latest -- --help` to see every flag; without flags you get interactive prompts. Answer **Yes** to "Add Vue Router".)

- Point the app at your API. Vite exposes any `VITE_`-prefixed variable to the browser through `import.meta.env`. The value is the API's **origin only**: no `/todos` path and no trailing slash, because the code builds `${API}/todos` and `${API}/todos/${id}` itself. `.env.local` is for the dev server; `.env.production` is what `npm run build` reads and it is safe to commit (the URL is public, not a secret):

```env
# .env.local (and .env.production)
VITE_API_URL=https://api-production-a3ab.up.railway.app
```

  Leave it unset and the app falls back to `http://localhost:8080`, which is where every backend guide runs locally.

- Start the dev server with `npm run dev` and open [http://localhost:5173](http://localhost:5173).

## Setting Up Vue Router

create-vue already generated `src/router/index.js`. Replace its contents with our four routes. Two of them are **named** so the form and the single-post view can link to them by name and pass the `id` param.

`src/router/index.js`

```js
import { createRouter, createWebHistory } from "vue-router";

/////////////////////////
// Component imports
/////////////////////////
import AllPosts from "../pages/AllPosts.vue";
import SinglePost from "../pages/SinglePost.vue";
import Form from "../pages/Form.vue";

/////////////////////////
// Routes
/////////////////////////
const routes = [
  // main page that shows all todos
  { path: "/", component: AllPosts },
  // page for one todo
  { path: "/post/:id", component: SinglePost, name: "post" },
  // create a new todo
  { path: "/new", component: Form, name: "new" },
  // edit an existing todo
  { path: "/edit/:id", component: Form, name: "edit" },
];

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
```

`src/main.js` is what create-vue generated and it already installs the router. It should look like this:

```js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

// register the router plugin, then mount
app.use(router);
app.mount("#app");
```

#### Scoping our components

- Create `src/pages` and add three single-file components. With `<script setup>` there is no `export default` boilerplate: whatever you declare at the top level is available in the template.

`src/pages/AllPosts.vue`

```vue
<script setup>
</script>

<template>
  <h1>AllPosts</h1>
</template>
```

`src/pages/SinglePost.vue`

```vue
<script setup>
</script>

<template>
  <h1>SinglePost</h1>
</template>
```

`src/pages/Form.vue`

```vue
<script setup>
</script>

<template>
  <h1>Form</h1>
</template>
```

#### Setting up the App component

`App.vue` holds the list of todos and the function that reloads it, and renders the current route. `RouterView` exposes the matched component through a slot, so we can pass the shared state down as props explicitly.

`src/App.vue`

```vue
<script setup>
import { ref, onMounted } from "vue";
import { RouterLink, RouterView } from "vue-router";

// API origin (see .env.local); the paths are built below
const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// reactive array holding every todo
const posts = ref([]);

// fetch the list from the API
async function getPosts() {
  const response = await fetch(`${API}/todos`);
  if (!response.ok) throw new Error(`GET ${API}/todos failed: ${response.status}`);
  posts.value = await response.json();
}

// load once when the app mounts
onMounted(getPosts);
</script>

<template>
  <div class="app">
    <h1>Our Todos</h1>
    <RouterLink to="/new"><button>New Todo</button></RouterLink>
    <RouterView v-slot="{ Component }">
      <component :is="Component" :posts="posts" :api="API" :getPosts="getPosts" />
    </RouterView>
  </div>
</template>

<style>
.app {
  text-align: center;
}
</style>
```

#### Getting our todos

That is already done above: `getPosts` runs in `onMounted` and `posts` is a `ref`, so every component that receives it re-renders when it changes. Now render the list.

`src/pages/AllPosts.vue`

```vue
<script setup>
import { RouterLink } from "vue-router";

defineProps({ posts: { type: Array, default: () => [] } });
</script>

<template>
  <div>
    <div class="post" v-for="post in posts" :key="post.id">
      <RouterLink :to="{ name: 'post', params: { id: post.id } }">
        <h1>{{ post.subject }}</h1>
      </RouterLink>
      <h2>{{ post.details }}</h2>
    </div>
  </div>
</template>

<style scoped>
.post {
  text-align: center;
  border: 3px solid green;
  margin: 10px auto;
  width: 80%;
}
</style>
```

#### Showing a single post

Read the `id` from the route with `useRoute`, find the post with `computed` so it updates when the list arrives, and guard the template for the moment before it does.

`src/pages/SinglePost.vue`

```vue
<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const props = defineProps({ posts: { type: Array, default: () => [] } });

const route = useRoute(); // current route, including params
const post = computed(() => props.posts.find((p) => String(p.id) === route.params.id));
</script>

<template>
  <div class="post" v-if="post">
    <h1>{{ post.subject }}</h1>
    <h2>{{ post.details }}</h2>
    <RouterLink to="/"><button>Back to Main</button></RouterLink>
  </div>
  <p v-else>Loading…</p>
</template>

<style scoped>
button {
  margin: 10px;
}
</style>
```

#### Setting up our form

One form for both `/new` and `/edit/:id`. If the route is named `edit`, prefill the fields from the matching post and `PUT`; otherwise `POST`. `v-model` binds each input to a `ref`.

`src/pages/Form.vue`

```vue
<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps({
  posts: { type: Array, default: () => [] },
  api: { type: String, required: true },
  getPosts: { type: Function, required: true },
});

const route = useRoute();
const router = useRouter();

const subject = ref("");
const details = ref("");

const editing = route.name === "edit";
const buttonLabel = editing ? "edit todo" : "create todo";

// When editing, fill the form as soon as the matching post is available
watch(
  () => props.posts,
  (posts) => {
    if (!editing) return;
    const post = posts.find((p) => String(p.id) === route.params.id);
    if (post) {
      subject.value = post.subject;
      details.value = post.details;
    }
  },
  { immediate: true }
);

async function handleSubmit() {
  const body = JSON.stringify({ subject: subject.value, details: details.value });
  const headers = { "Content-Type": "application/json" };

  if (editing) {
    await fetch(`${props.api}/todos/${route.params.id}`, { method: "PUT", headers, body });
  } else {
    await fetch(`${props.api}/todos`, { method: "POST", headers, body });
  }

  await props.getPosts(); // refresh the list
  router.push("/"); // back to the main page
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input type="text" placeholder="subject" v-model="subject" />
    <input type="text" placeholder="details" v-model="details" />
    <input type="submit" :value="buttonLabel" />
  </form>
</template>
```

`@submit.prevent` is the shorthand for `v-on:submit` with `event.preventDefault()`.

#### Edit button

Add an edit link to the single-post view, next to the back button:

```vue
<RouterLink :to="{ name: 'edit', params: { id: post.id } }">
  <button>Edit Todo</button>
</RouterLink>
```

#### Deleting our todos

Final version of `SinglePost.vue`: it now also receives `api` and `getPosts`, and gets a `deletePost` function.

`src/pages/SinglePost.vue`

```vue
<script setup>
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

const props = defineProps({
  posts: { type: Array, default: () => [] },
  api: { type: String, required: true },
  getPosts: { type: Function, required: true },
});

const route = useRoute();
const router = useRouter();
const post = computed(() => props.posts.find((p) => String(p.id) === route.params.id));

async function deletePost() {
  await fetch(`${props.api}/todos/${post.value.id}`, { method: "DELETE" });
  await props.getPosts();
  router.push("/");
}
</script>

<template>
  <div class="post" v-if="post">
    <h1>{{ post.subject }}</h1>
    <h2>{{ post.details }}</h2>
    <RouterLink to="/"><button>Back to Main</button></RouterLink>
    <RouterLink :to="{ name: 'edit', params: { id: post.id } }">
      <button>Edit Todo</button>
    </RouterLink>
    <button @click="deletePost">Delete Todo</button>
  </div>
  <p v-else>Loading…</p>
</template>

<style scoped>
button {
  margin: 10px;
}
</style>
```

Done. `npm run build` produces a static `dist/` folder.

### The finished example

The code on this page, built exactly as written, lives at [github.com/arthurbernierjr/dtc-vue](https://github.com/arthurbernierjr/dtc-vue) and runs at [dtc-vue-production.up.railway.app](https://dtc-vue-production.up.railway.app). It is pointed at the Go / chi API (`https://api-production-a3ab.up.railway.app`); to point it at any other backend from the table above, change `VITE_API_URL` in `.env.production` and rebuild.

## What you will learn

- How a Vite-based Vue project is laid out (`src/main.js`, `src/App.vue`, `src/router/index.js`) and how `app.use(router)` registers a plugin.
- The Composition API in its current form: `<script setup>`, `ref`, `computed`, `watch`, `onMounted`, `defineProps`.
- Vue Router essentials: `createRouter` + `createWebHistory`, dynamic segments (`/post/:id`), named routes, `RouterLink`, `RouterView` with a slot, and the `useRoute` / `useRouter` composables.
- The fetch-list / show-one / create / edit / delete flow against a JSON API, with the same four screens as the React, Angular and Svelte versions.

## Resources to Learn More

- [Vue Quick Start](https://vuejs.org/guide/quick-start.html) and the [Essentials guide](https://vuejs.org/guide/essentials/application.html)
- [`<script setup>` reference](https://vuejs.org/api/sfc-script-setup.html)
- [Vue Router guide](https://router.vuejs.org/guide/) and [Composition API usage](https://router.vuejs.org/guide/advanced/composition-api.html)
- [Vite guide](https://vite.dev/guide/)
