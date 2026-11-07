---
title: "Angular: consume the API"
framework: Angular
version: "22"
lede: "Generate an Angular app with the CLI, put the API calls in an injected service built on signals and HttpClient, and wire four standalone components to the router for list / show / create / edit / delete."
updated_from: "the 2021 NgModule + constructor-injection walkthrough"
verified: 2026-11-07
docs:
  - https://angular.dev/tools/cli/setup-local
  - https://angular.dev/essentials/components
  - https://angular.dev/essentials/dependency-injection
  - https://angular.dev/guide/signals
  - https://angular.dev/guide/templates/control-flow
  - https://angular.dev/guide/http/setup
  - https://angular.dev/guide/http/making-requests
  - https://angular.dev/guide/routing/define-routes
  - https://angular.dev/style-guide
exec: ran
verified_note: "Built the example for real this time: `npx @angular/cli@22 new todofront` (CLI 22.2.6, @angular/core 22.2.5, TypeScript 6.0.3), then `ng generate environments`, `ng generate service todo-service` and the three `ng generate component` commands, with every file on this page pasted in verbatim; `ng build` produced dist/todofront/browser. The CLI refuses Node 24.13 (it wants ^22.22.3 || ^24.15.0 || >=26.0.0), so the local run used a Node 24.22.2 binary unpacked into a scratch directory (no global install); Railway built it independently with Node 24 from `.nvmrc`. Repo github.com/arthurbernierjr/dtc-angular, live at https://web-production-3237b.up.railway.app, pointed at the Java / Spring Boot API https://api-production-c419.up.railway.app; list, create, edit and delete were driven in headless Chromium with Playwright against that backend."
changes:
  - "No NgModules. `ng new` generates standalone components by default (since v19) and routes live in `src/app/app.routes.ts`, registered with `provideRouter(routes)` in `app.config.ts`; the `app-routing.module.ts` file no longer exists."
  - "File names follow the current style guide (v20+): `all-posts.ts` / `all-posts.html` / `all-posts.css` with class `AllPosts`, not `all-posts.component.ts` with `AllPostsComponent`. `styleUrls` became `styleUrl`."
  - "Services are declared with `@Service()` (the decorator Angular 22 documents for services; `@Injectable()` still works) and consumed with the `inject()` function instead of constructor parameters."
  - "State is held in signals (`signal`, `computed`, `input`) and templates use the built-in control flow (`@for`, `@if`) instead of `*ngFor`/`*ngIf`; `@for` requires a `track` expression."
  - "Requests go through `HttpClient`, which is injectable by default in v21+ and uses `fetch` under the hood; the 2021 version called `fetch` directly from the service."
  - "Route params are read as a signal input via `withComponentInputBinding()` instead of subscribing to `ActivatedRoute.params`."
  - "The API URL comes from `src/environments/environment.ts` instead of a hard-coded Heroku host; HTTP methods are upper-case."
  - "The API now follows the shared Todos contract: `apiUrl` is the origin only (no path, no trailing slash) and the service builds `${apiUrl}/todos` and `${apiUrl}/todos/${id}`; the old `/todos/` base and trailing-slash routes are gone. `environment.development.ts` falls back to http://localhost:8080 for `ng serve`."
---

# Frontend - Angular

## Prerequisites

- A deployed Todos API from one of the [backend guides](/languages/). Every backend serves the same contract, with no trailing slashes:
  - `GET /health` → `{"ok":true}`
  - `GET /todos` → `[{id,subject,details}]` ordered by id
  - `GET /todos/:id` → the object, or 404 `{"error":"not found"}`
  - `POST /todos` with `{subject,details}` → 201 and the object
  - `PUT /todos/:id` with `{subject,details}` → 200 and the object
  - `DELETE /todos/:id` → 204
  - blank or missing fields → 400 `{"error":"…"}`
  - CORS allows any origin. Objects contain exactly `id` (integer), `subject` and `details`.
- Node.js that satisfies the Angular CLI's `engines` field. CLI 22.2 requires `^22.22.3 || ^24.15.0 || >=26.0.0`. Node 24.13 is not enough, and `ng new` will refuse it. Check `node -v` before you install the CLI; the latest Node 24 LTS works.
- The Angular CLI, installed globally as the docs recommend:

```bash
npm install -g @angular/cli
```

### Pick any backend

All eight are live and interchangeable. Every one serves the contract above, so the `apiUrl` below can point at any of them, and each repo ships a `check.mjs` you can run against your own deploy (`node check.mjs https://your-api.up.railway.app`).

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

## Setup

- Generate a new project. The CLI asks a few questions; accept the defaults (CSS, no server-side rendering). Routing is always included now, so there is no "would you like to add routing?" prompt.

```bash
ng new todofront
cd todofront
```

- Start the dev server and open [http://localhost:4200](http://localhost:4200):

```bash
ng serve
```

- Record the API URL once, in the environment files. `ng new` no longer creates them, so generate them:

```bash
ng generate environments
```

This creates `src/environments/environment.ts` and `src/environments/environment.development.ts`, and adds a `fileReplacements` entry to `angular.json` so `ng serve` (the development configuration) swaps the second in for the first. `apiUrl` is the **origin only**: no `/todos`, no trailing slash. The service appends the paths. The example below points at the Java API from the table; swap in any other row, or your own deploy.

`src/environments/environment.ts`

```ts
export const environment = {
  // origin only, no path: the service appends /todos and /todos/:id
  apiUrl: "https://api-production-c419.up.railway.app",
};
```

`src/environments/environment.development.ts`

```ts
export const environment = {
  // ng serve swaps this file in: point at a backend running locally
  apiUrl: "http://localhost:8080",
};
```

## Creating Our TodoService

Fetching, creating, updating and deleting todos lives in one **service**. Angular creates a single instance of it and injects that same instance into every component that asks for it.

- Generate the service:

```bash
ng generate service todo-service
```

The CLI names files after the argument you pass and no longer adds a `.service` suffix, so this creates `src/app/todo-service.ts` (class `TodoService`) plus a spec file.

- Create `src/app/types.ts` with the shape of a todo:

```ts
// Todo type
export type Todo = {
  id?: number;
  subject: string;
  details: string;
};
```

- Fill in `src/app/todo-service.ts`. The list is a **signal**, so any template that reads `todos()` re-renders when it changes. `HttpClient` is available for injection out of the box in Angular 21+ and uses `fetch` under the hood. Each method returns an Observable; `firstValueFrom` turns it into a promise so we can `await` it.

`src/app/todo-service.ts`

```ts
import { Service, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../environments/environment";
import { Todo } from "./types";

@Service()
export class TodoService {
  private http = inject(HttpClient);

  // origin of the API, e.g. https://api-production-c419.up.railway.app
  readonly apiUrl = environment.apiUrl;

  // the list of todos, as a signal
  readonly todos = signal<Todo[]>([]);

  constructor() {
    // load the list when the service is first created
    this.getTodos();
  }

  async getTodos() {
    const data = await firstValueFrom(this.http.get<Todo[]>(`${this.apiUrl}/todos`));
    this.todos.set(data);
    return data;
  }

  async createTodo(todo: Todo) {
    await firstValueFrom(this.http.post<Todo>(`${this.apiUrl}/todos`, todo));
    return this.getTodos();
  }

  async updateTodo(todo: Todo) {
    await firstValueFrom(this.http.put<Todo>(`${this.apiUrl}/todos/${todo.id}`, todo));
    return this.getTodos();
  }

  async deleteTodo(todo: Todo) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/todos/${todo.id}`));
    return this.getTodos();
  }
}
```

The paths are `/todos` and `/todos/:id` with no trailing slash, exactly what every backend in the table serves. `POST` answers 201 with the created object and `DELETE` answers 204 with no body; the service ignores both bodies and simply reloads the list.

> `@Service()` is the decorator Angular 22 documents for services; `@Injectable({ providedIn: 'root' })` from older tutorials still works and means the same thing.

#### Generate our components

```bash
ng generate component all-posts
ng generate component single-post
ng generate component form
```

Each command creates a folder with `name.ts`, `name.html`, `name.css` and a spec. The class names are `AllPosts`, `SinglePost` and `Form`; the selectors are `app-all-posts`, `app-single-post` and `app-form`.

#### Setup our routes

Routes are a plain array in `src/app/app.routes.ts`. The generated `app.config.ts` already registers it with `provideRouter(routes)` (next to `provideBrowserGlobalErrorListeners()`); add `withComponentInputBinding()` so a route param like `:id` can be read as a component input.

`src/app/app.routes.ts`

```ts
import { Routes } from "@angular/router";
import { AllPosts } from "./all-posts/all-posts";
import { SinglePost } from "./single-post/single-post";
import { Form } from "./form/form";

export const routes: Routes = [
  { path: "post/:id", component: SinglePost },
  { path: "new", component: Form },
  { path: "edit/:id", component: Form },
  { path: "", component: AllPosts },
];
```

`src/app/app.config.ts`

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
```

#### Showing all our todos

Inject the service and read its `todos` signal in the template. `@for` is Angular's built-in loop; `track todo.id` tells it how to identify rows.

`src/app/all-posts/all-posts.ts`

```ts
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TodoService } from "../todo-service";

@Component({
  selector: "app-all-posts",
  imports: [RouterLink],
  templateUrl: "./all-posts.html",
  styleUrl: "./all-posts.css",
})
export class AllPosts {
  // the shared service instance
  protected tdsrv = inject(TodoService);
}
```

`src/app/all-posts/all-posts.html`

```html
@for (todo of tdsrv.todos(); track todo.id) {
  <div>
    <a [routerLink]="['/post', todo.id]"><h1>{{ todo.subject }}</h1></a>
    <h2>{{ todo.details }}</h2>
  </div>
}
```

#### Show a single todo

With `withComponentInputBinding()` the `:id` segment arrives as an input signal named `id`. A `computed` finds the matching todo and updates when the list loads.

`src/app/single-post/single-post.ts`

```ts
import { Component, computed, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TodoService } from "../todo-service";

@Component({
  selector: "app-single-post",
  imports: [RouterLink],
  templateUrl: "./single-post.html",
  styleUrl: "./single-post.css",
})
export class SinglePost {
  protected tdsrv = inject(TodoService);

  // the :id route param, bound by the router (always a string)
  readonly id = input.required<string>();

  // the selected todo, recomputed when the list or the id changes
  protected post = computed(() => this.tdsrv.todos().find((p) => String(p.id) === this.id()));
}
```

`src/app/single-post/single-post.html`

```html
@if (post(); as todo) {
  <div>
    <h1>{{ todo.subject }}</h1>
    <h2>{{ todo.details }}</h2>
    <a routerLink="/"><button>Go Back</button></a>
  </div>
} @else {
  <p>Loading…</p>
}
```

#### Edit and create todo with our form

The same component serves `/new` and `/edit/:id`. If an `id` input is present and matches a todo, the fields are pre-filled and the submit updates; otherwise it creates. `[(ngModel)]` needs `FormsModule` in the component's `imports`.

`src/app/form/form.ts`

```ts
import { Component, effect, inject, input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TodoService } from "../todo-service";

@Component({
  selector: "app-form",
  imports: [FormsModule],
  templateUrl: "./form.html",
  styleUrl: "./form.css",
})
export class Form {
  protected tdsrv = inject(TodoService);
  private router = inject(Router);

  // present on /edit/:id, undefined on /new
  readonly id = input<string>();

  protected subject = "";
  protected details = "";
  protected editingId: number | undefined;
  protected buttonLabel = "create todo";

  constructor() {
    // pre-fill the form once the matching todo is available
    effect(() => {
      const post = this.tdsrv.todos().find((p) => String(p.id) === this.id());
      if (post) {
        this.subject = post.subject;
        this.details = post.details;
        this.editingId = post.id;
        this.buttonLabel = "edit todo";
      }
    });
  }

  async saveTodo() {
    if (this.editingId !== undefined) {
      await this.tdsrv.updateTodo({ id: this.editingId, subject: this.subject, details: this.details });
    } else {
      await this.tdsrv.createTodo({ subject: this.subject, details: this.details });
    }
    this.router.navigate(["/"]);
  }
}
```

`src/app/form/form.html`

```html
<input type="text" placeholder="subject" [(ngModel)]="subject" />
<input type="text" placeholder="details" [(ngModel)]="details" />
<button (click)="saveTodo()">{{ buttonLabel }}</button>
```

Add a create button to the root component. `App` needs `RouterLink` and `RouterOutlet` in its `imports` (the generated `app.ts` already imports `RouterOutlet`).

`src/app/app.html`

```html
<h1>Our Todo List</h1>
<a routerLink="/new"><button>Create a New Todo</button></a>

<router-outlet />
```

`src/app/app.ts`

```ts
import { Component } from "@angular/core";
import { RouterLink, RouterOutlet } from "@angular/router";

@Component({
  selector: "app-root",
  imports: [RouterLink, RouterOutlet],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {}
```

And an edit button in the single-post template:

```html
<a [routerLink]="['/edit', todo.id]"><button>Edit Todo</button></a>
```

#### Deleting our todos

In `SinglePost`: inject the `Router`, add a `deleteTodo` method, attach it to a button.

`src/app/single-post/single-post.ts`

```ts
import { Component, computed, inject, input } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { TodoService } from "../todo-service";

@Component({
  selector: "app-single-post",
  imports: [RouterLink],
  templateUrl: "./single-post.html",
  styleUrl: "./single-post.css",
})
export class SinglePost {
  protected tdsrv = inject(TodoService);
  private router = inject(Router);

  readonly id = input.required<string>();
  protected post = computed(() => this.tdsrv.todos().find((p) => String(p.id) === this.id()));

  async deleteTodo() {
    const todo = this.post();
    if (!todo) return;
    await this.tdsrv.deleteTodo(todo);
    this.router.navigate(["/"]);
  }
}
```

`src/app/single-post/single-post.html`

```html
@if (post(); as todo) {
  <div>
    <h1>{{ todo.subject }}</h1>
    <h2>{{ todo.details }}</h2>
    <a routerLink="/"><button>Go Back</button></a>
    <a [routerLink]="['/edit', todo.id]"><button>Edit Todo</button></a>
    <button (click)="deleteTodo()">Delete Todo</button>
  </div>
} @else {
  <p>Loading…</p>
}
```

CRUD functionality achieved. `ng build` writes the production bundle to `dist/todofront/browser`.

### The finished example

- Repo: [github.com/arthurbernierjr/dtc-angular](https://github.com/arthurbernierjr/dtc-angular), every file above pasted in as is
- Live: [web-production-3237b.up.railway.app](https://web-production-3237b.up.railway.app)

It is pointed at the Java / Spring Boot API (https://api-production-c419.up.railway.app). To point it at another backend, change `apiUrl` in `src/environments/environment.ts` to that backend's origin and rebuild. On Railway the repo adds `serve` as a dependency, sets `"start": "serve -s dist/todofront/browser -l $PORT"` in `package.json`, and pins Node with a `.nvmrc` of `24`; Railpack runs `npm ci`, `npm run build` and then `npm start`.

> Going further: for read-only data Angular 20+ offers `httpResource(() => url)`, which exposes `value()`, `isLoading()` and `error()` as signals and re-fetches when the URL's signals change. The service above keeps one explicit `getTodos()` so the create/update/delete flow is easy to follow.

## Resources to Learn More

- [Angular essentials](https://angular.dev/essentials) and the [signals guide](https://angular.dev/guide/signals)
- [Built-in control flow (`@for`, `@if`)](https://angular.dev/guide/templates/control-flow)
- [HttpClient: setup](https://angular.dev/guide/http/setup) and [making requests](https://angular.dev/guide/http/making-requests)
- [Routing: define routes](https://angular.dev/guide/routing/define-routes)
- [Angular style guide](https://angular.dev/style-guide)
