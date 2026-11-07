---
editorial: true
title: Casting on the World
subtitle: The DOM, Events, and Dynamic Interfaces
hook: "Your JavaScript leaves the training dungeon: select a corner of the page, change it, and make it answer when someone clicks."
read: 50
artifact: "quest-log.html + quest-log.js: a Quest class, a form that adds cards, event delegation on the list, a live counter and one-button Clear Completed"
diagrams:
  - fig1-file-and-tree
  - fig2-three-selectors
  - fig3-four-dials
  - fig4-event-delegation
  - fig5-null-and-reload
docs:
  - https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction
  - https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
  - https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events
  - https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script#defer
say:
  - "the DOM is the live tree, not the file"
  - "select, then check for null, then change"
  - "textContent for text, innerHTML only for markup you wrote"
  - "one listener on the parent hears every child, even the ones born later"
  - "preventDefault first, every time, in every submit handler"
---

## The hook

For three sessions your spells have gone off inside a training dungeon. You cast `calculateDamage` and a number came back. You built a `Boss` with three phases and watched it fight in a console. Powerful, controlled, and completely invisible to anyone who is not reading a terminal.

Today you walk out of the dungeon.

The web page in front of you is a world. Every heading, every button, every list item in it is an object your JavaScript can reach, read, and rewrite while someone is looking at it. Click a button and a title changes colour. Type a quest into a form and a card appears below it. Press a key and something moves. The page stops being a document and becomes an application, and the thing that makes the difference is about two dozen methods on one object called `document`.

> *You spent three sessions learning the spells. The DOM is the world. Today you cast them on something real.*

Two warnings before we start, because they are the two ways this session goes wrong. First: the DOM is **not your HTML file**. It is the browser's live copy, built from the file once, and your script edits the copy. Reload, and the copy is rebuilt from the file as if you had never touched it. Second: nearly every bug this week comes from one of two places: you asked for an element that was not there yet, or you let a form do what forms do by default, which is reload the page. Both show up as "my code does nothing". By the end of the session you will recognise both on sight.

One more thing about this page. Every demo below runs **live**: the HTML is rendered as a small stage under its code panel, and pressing **Run live** executes the script against that stage, right here, with the console under it. In your own project, `document` means the whole page. On this page, each stage is a fenced-off corner, and `document` inside a demo means that corner, so a demo cannot knock over the lesson around it. The code you see is the code you would write; only the corner is smaller.

## The idea

Five ideas today, in the order you use them: the tree, selecting from it, changing it, adding to it, and listening to it.

**The DOM is a tree, and `document` is the root.** When the browser loads your HTML it parses the text once and builds a tree of **nodes**: one object per element, nested the way the tags nest. That tree is the Document Object Model. Your script never sees the file. It sees the tree.

![](diagram:session-3-4/fig1-file-and-tree)

Hold the picture: the file on the left is text; the tree on the right is objects. `document` is the top of the tree and your way in. Everything you do today starts with `document.` and a method that walks down from there.

**Three selectors, and only one of them returns a list.** You have to find a node before you can change it.

![](diagram:session-3-4/fig2-three-selectors)

`document.getElementById("quest-list")` takes a bare id (no `#`) and returns one element, or `null`. `document.querySelector(".message")` takes any CSS selector and returns the **first** match, or `null`. `document.querySelectorAll(".message")` takes any CSS selector and returns **all** matches as a **NodeList**, which is array-like: it has `length`, you can index it, `forEach` works, but `map`, `filter` and `reduce` do not until you convert it with `Array.from(list)`. Two of the three can hand you `null`, so the habit is: select, check, then change.

**Four dials on every element.** Once you hold a node, you turn one of four dials.

![](diagram:session-3-4/fig3-four-dials)

`textContent` reads or replaces the text inside; whatever you put in is shown as text, tags and all, which makes it safe for anything a user typed. `innerHTML` parses what you give it as HTML; use it for markup you wrote yourself and never for user input, because that is exactly how a script tag gets injected into a page. `classList` has `add`, `remove`, `toggle` and `contains`; it changes which CSS rules apply, and lets the stylesheet do the styling. `style` writes one inline rule on one element, with camelCase names (`fontSize`, not `font-size`). Everything else, `disabled`, `href`, `src`, `data-*`, goes through `setAttribute` and `removeAttribute`.

**New nodes are made in memory, then placed.** `document.createElement("li")` makes an element that is not on the page yet. Set its text and classes, then `parent.appendChild(li)` puts it in the tree, and only then is it visible. `element.remove()` takes it out again. Building a card is just this several times: make a `div`, make an `h3` and a `p`, append them to the `div`, append the `div` to its container.

**Events are how the page talks back.** A click, a keypress, a form submit, typing in a box: each is an **event**, and `element.addEventListener("click", handler)` asks the browser to call your function when it happens. The handler receives an **event object**: `event.target` is the element it happened on, `event.key` is the key pressed, and `event.preventDefault()` cancels whatever the browser was going to do about it, which for a form submit is reload the page.

![](diagram:session-3-4/fig4-event-delegation)

Events **bubble**: a click on an `li` fires on the `li`, then its `ul`, then `body`, then `document`. That is why **delegation** works: one listener on the parent hears every child, including children that did not exist when the listener was attached. Listeners only know the elements that existed at attach time, so for anything you create later, delegate to the parent and ask `event.target.matches(".complete-btn")` which child it was.

> **Say:** "The DOM is the live tree, not the file. Select, then check for null, then change. textContent for text, innerHTML only for markup you wrote. One listener on the parent hears every child, even the ones born later. preventDefault first, every time, in every submit handler."

A word on where the script goes, because today is the first time a `.js` file is linked to a page. This is the whole skeleton of a page that uses one:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Quest Log</title>
    <link rel="stylesheet" href="style.css">
    <script src="app.js" defer></script>
  </head>
  <body>
    <h1>Quest Log</h1>
    <ul id="quest-list"></ul>
  </body>
</html>
```

The browser runs a `<script>` tag the moment it reaches it, so a script in `<head>` without `defer` runs before `<body>` has been parsed and every selector returns `null`. `defer` tells the browser to download the file now but run it only after the whole tree is built, which is exactly when your selectors start working. The older habit, a plain `<script src="app.js"></script>` as the last thing in `<body>`, works for the same reason; `defer` in `<head>` is the modern one, and the one this unit uses. Swap `app.js` for the file's real name: `character-creator.js` and `quest-log.js` today, `app.js` for the game in 3.5.

## The demonstration

Four stages. Each has its HTML (the markup of that corner), the script, and a **Run live** button. The console appears under the script and keeps logging while you click and type in the stage.

The stages share one small stylesheet, so you can see what each class does before you use it:

```css
/* stage.css: the classes every stage below can use */
.highlight { background: rgb(232 216 0 / .18); box-shadow: 0 0 0 1px rgb(232 216 0 / .4); }
.big       { font-size: 1.5em; }
.hidden    { display: none; }
.muted     { color: #8A8A94; }
.completed { text-decoration: line-through; opacity: .5; }
.card      { padding: 12px 16px; border-radius: 6px; border-left: 4px solid #55555E; }
.easy      { border-left-color: #00A868; }   .medium    { border-left-color: #E8D800; }
.hard      { border-left-color: #F03038; }   .legendary { border-left-color: #B16CFF; }
.row       { display: flex; gap: 8px; align-items: center; }
.tag       { font: 11px monospace; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; }
.counter   { font: 600 14px monospace; color: #E8D800; }
```

### 1. Select and change

The markup is the tree from fig. 1. The script turns every dial once.

```html stage=playground
<h3 id="main-title">DOM Playground</h3>
<p id="subtitle">Learning to manipulate the DOM</p>
<div id="container">
  <p class="message">First message</p>
  <p class="message">Second message</p>
</div>
<button id="change-btn">Click Me</button>
<ul id="quest-list">
  <li>Defeat the Goblin King</li>
  <li>Find the Lost Artifact</li>
  <li>Save the Village</li>
</ul>
```

```js live=playground
// === SELECTING ===
const title = document.getElementById("main-title");
const subtitle = document.querySelector("#subtitle");
const messages = document.querySelectorAll(".message");
console.log("title:", title, "| subtitle:", subtitle);
console.log("messages:", messages, "| is it an array?", Array.isArray(messages));
console.log("a selector that matches nothing:", document.querySelector(".no-such-class"));

// === DIAL 1: textContent (text in, text out, safe for anything) ===
title.textContent = "Welcome, Adventurer!";
// === DIAL 2: innerHTML (parses tags: only for markup YOU wrote) ===
subtitle.innerHTML = "Your quest <strong>begins now</strong>.";
// === DIAL 3: classList (let the stylesheet do the styling) ===
subtitle.classList.add("highlight");
subtitle.classList.add("big");
console.log("subtitle classes:", subtitle.className, "| has big?", subtitle.classList.contains("big"));
// === DIAL 4: style (one inline rule, camelCase) ===
title.style.color = "#E8D800";
title.style.letterSpacing = "0.04em";
// === ATTRIBUTES ===
const btn = document.getElementById("change-btn");
btn.setAttribute("disabled", "true");
console.log("button disabled attribute:", btn.getAttribute("disabled"));

// === MANY AT ONCE: a NodeList has forEach ===
messages.forEach((msg, index) => {
  msg.textContent = `Quest Log Entry #${index + 1}`;
  msg.style.color = index === 0 ? "#2FD48F" : "#E8D800";
});
// ...but not map. Array.from makes it a real array.
const texts = Array.from(document.querySelectorAll("#quest-list li")).map((li) => li.textContent);
console.log("quest texts via Array.from + map:", texts);
console.log("ok: playground");
```

Press **Run live** and look up at the stage before you read the console. The title changed, the subtitle grew and turned yellow, the button went grey, both messages were renamed. Now read the console: `title` prints as `<h3#main-title>`, because it *is* an element, not a string. `messages` is a `NodeList(2)`, and `Array.isArray` says `false`, which is the whole reason the last block converts it before calling `map`. And `.no-such-class` printed `null`, the honest answer for "nothing matched". Inspect the stage with DevTools if you like: the HTML of this page on disk has not changed. Only the tree did.

### 2. Make and place

Elements are created in memory and placed with `appendChild`; `remove()` takes them out. The cards here are built from scratch, each with its own delete button.

```html stage=builder
<ul id="build-list">
  <li>Defeat the Goblin King</li>
  <li>Find the Lost Artifact</li>
  <li>Save the Village</li>
</ul>
<div id="build-container"></div>
```

```js live=builder
const questList = document.getElementById("build-list");

// === ONE ELEMENT: create → configure → append ===
const newQuest = document.createElement("li");
newQuest.textContent = "Slay the Dragon";
newQuest.classList.add("highlight");
console.log("in memory, not on the page yet:", newQuest, "| parent:", newQuest.parentElement);
questList.appendChild(newQuest);
console.log("appended. parent now:", newQuest.parentElement);

// === MANY FROM AN ARRAY ===
const more = ["Explore the Dark Cave", "Collect 10 Herbs", "Escort the Merchant"];
more.forEach((text) => {
  const li = document.createElement("li");
  li.textContent = text;
  questList.appendChild(li);
});
console.log("list items now:", questList.children.length);

// === A COMPLEX ELEMENT: a card with children and its own button ===
const container = document.getElementById("build-container");
function createCard(title, description) {
  const card = document.createElement("div");
  card.classList.add("card");

  const h4 = document.createElement("h4");
  h4.textContent = title;
  const p = document.createElement("p");
  p.textContent = description;
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    card.remove(); // the closure remembers which card it belongs to
    console.log(`deleted "${title}" · cards left:`, container.children.length);
  });

  card.appendChild(h4);
  card.appendChild(p);
  card.appendChild(deleteBtn);
  container.appendChild(card);
  return card;
}
createCard("Side Quest", "Help the blacksmith repair his forge.");
createCard("Main Quest", "Defeat the Demon Lord and save the kingdom.");
console.log("cards:", container.children.length, "· press Delete on one of them");
console.log("ok: builder");
```

Two things to notice in the console. Before `appendChild`, `newQuest.parentElement` is `null`: the element existed, fully configured, and nothing on the page knew about it. After, its parent is `<ul#build-list>`. And the delete handler is a closure from Session 3.2 wearing a new hat: each button's arrow function closed over its own `card`, so `card.remove()` always removes the right one. Press Delete on a card and watch the count.

### 3. Listen

A click, the event object, a keypress, delegation on a list, and a form handled properly. Click inside the stage before you type, so the keypresses go to it.

```html stage=events
<h3 id="ev-title">Press things</h3>
<div class="row">
  <button id="ev-btn">Click Me</button>
  <span id="ev-key" class="tag">press a key</span>
</div>
<ul id="ev-list">
  <li>Defeat the Goblin King</li>
  <li>Find the Lost Artifact</li>
  <li>Save the Village</li>
</ul>
<form id="ev-form">
  <input type="text" id="ev-input" placeholder="Enter a new quest" required>
  <button type="submit">Add Quest</button>
</form>
```

```js live=events
const title = document.getElementById("ev-title");
const btn = document.getElementById("ev-btn");
const keyTag = document.getElementById("ev-key");
const list = document.getElementById("ev-list");
const form = document.getElementById("ev-form");
const input = document.getElementById("ev-input");

// === A CLICK ===
let clicks = 0;
btn.addEventListener("click", () => {
  clicks++;
  title.textContent = `Clicked ${clicks} time${clicks === 1 ? "" : "s"}`;
  title.style.color = clicks % 2 ? "#E8D800" : "#2FD48F";
});

// === THE EVENT OBJECT: keys ===
document.addEventListener("keydown", (event) => {
  keyTag.textContent = `key: ${event.key} · code: ${event.code}`;
  if (event.key === "Escape") console.log("Escape pressed: menu closed");
});

// === DELEGATION: one listener on the list hears every li, even new ones ===
list.addEventListener("click", (event) => {
  if (!event.target.matches("li")) return;   // a click on the ul's padding is ignored
  event.target.classList.toggle("highlight");
  console.log("toggled:", event.target.textContent, "| target:", event.target, "| listener on:", event.currentTarget);
});

// === THE FORM: preventDefault first, then read, validate, create, clear ===
form.addEventListener("submit", (event) => {
  event.preventDefault();                     // the browser's default is to reload the page
  const text = input.value.trim();
  if (!text) return;
  const li = document.createElement("li");
  li.textContent = text;                      // textContent: the user typed this
  list.appendChild(li);
  input.value = "";
  console.log(`added "${text}" · the list listener will hear it too`);
});

console.log("listeners attached:", 4, "· click the button, press keys, click list items, add a quest");
console.log("ok: events");
```

Run it, then: click the button a few times and watch the title; click inside the stage and press some keys (`Escape` prints a line); click any list item to highlight it; type a quest and press Enter. Now click the quest you just added. It highlights, and the console names it, even though it did not exist when the listener was attached. That is delegation. The line that prints `target` and `currentTarget` shows the two ends of the bubble: `target` is the `li` you clicked, `currentTarget` is the `ul` the listener lives on.

### 4. The whole loop: form → state → render

Everything above, assembled into the Interactive Quest Board: a form with a difficulty select, colour-coded cards, Complete buttons via delegation, and a counter that stays honest because it is derived from an array of quest objects, never from the screen.

```html stage=quest-board
<p class="counter" id="qb-count">0 quests</p>
<form id="qb-form">
  <input type="text" id="qb-name" placeholder="Quest name" required>
  <select id="qb-difficulty">
    <option value="easy">Easy</option>
    <option value="medium">Medium</option>
    <option value="hard">Hard</option>
    <option value="legendary">Legendary</option>
  </select>
  <button type="submit">Add Quest</button>
</form>
<div id="qb-board"></div>
```

```js live=quest-board
const form = document.getElementById("qb-form");
const nameInput = document.getElementById("qb-name");
const difficultySelect = document.getElementById("qb-difficulty");
const board = document.getElementById("qb-board");
const count = document.getElementById("qb-count");

// The state: one object per quest. The board is a picture of this array, never the other way round.
let quests = [];
let nextId = 1;

// One place that knows how a quest looks. Everything else calls it.
function createQuestCard(quest) {
  const card = document.createElement("div");
  card.classList.add("card", quest.difficulty);     // .easy / .medium / .hard / .legendary colour the border
  card.dataset.id = quest.id;                        // the bridge from the card back to its object

  const h4 = document.createElement("h4");
  h4.textContent = quest.name;                       // user text → textContent, never innerHTML
  const tag = document.createElement("span");
  tag.classList.add("tag");
  tag.textContent = quest.difficulty;
  const done = document.createElement("button");
  done.textContent = "Complete";
  done.classList.add("complete-btn");

  const row = document.createElement("div");
  row.classList.add("row");
  row.appendChild(tag);
  row.appendChild(done);
  card.appendChild(h4);
  card.appendChild(row);
  return card;
}

// The counter is derived from the array: never from a separate number, never from the screen.
function updateCounter() {
  const n = quests.length;
  count.textContent = `${n} quest${n === 1 ? "" : "s"}`;
}

// State first, then the DOM catches up.
function addQuest(name, difficulty) {
  const quest = { id: nextId++, name, difficulty };
  quests.push(quest);
  board.appendChild(createQuestCard(quest));
  updateCounter();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!name) return;
  addQuest(name, difficultySelect.value);
  nameInput.value = "";
  nameInput.focus();
  console.log(`added: ${name} (${difficultySelect.value}) · quests in state: ${quests.length}`);
});

// One listener for every Complete button that will ever exist on the board.
board.addEventListener("click", (event) => {
  if (!event.target.matches(".complete-btn")) return;
  const card = event.target.closest(".card");
  const id = Number(card.dataset.id);
  const quest = quests.find((q) => q.id === id);     // the card found its object
  quests = quests.filter((q) => q.id !== id);        // state first
  card.remove();                                     // then the DOM
  updateCounter();
  console.log(`completed: ${quest.name} · quests in state: ${quests.length}`);
});

// Seed two so the board is not empty on arrival.
addQuest("Defeat the Goblin King", "hard");
addQuest("Collect 10 Herbs", "easy");
console.log("ok: quest-board");
```

Add a quest of each difficulty, complete one, and watch the counter. Three design choices are doing the work. `createQuestCard` is the single place that knows what a card looks like, so the seed quests and the form use the same function. The `quests` array is the state and the board is a view of it: every handler changes the array first and then makes the DOM match, `updateCounter` reads `quests.length` and never counts cards on screen, and `data-id` on each card is the bridge back from a click to the object it belongs to. A number computed from the state cannot drift from the state; a number read off the screen can, and 3.5 shows what that looks like. And the Complete handler is one listener on the board using `event.target.closest(".card")` to find the card that owns the button, which is the delegation pattern you will use in the lab. Note what is *not* here: no `innerHTML`, because the quest name came from a person.

## Where it breaks

**Null, and the reload.**

Two failures account for most of this week's hours. Neither is a logic error. One is timing: you asked for an element before the tree had it. The other is a default you forgot to cancel: a form did what forms do.

![](diagram:session-3-4/fig5-null-and-reload)

```html stage=broken
<h3 id="br-title">Nothing happens</h3>
<form id="br-form">
  <input type="text" id="br-input" placeholder="type, then Add" required>
  <button type="submit">Add (no preventDefault)</button>
</form>
<ul id="br-list"></ul>
```

```js live=broken
// === FAILURE 1: null. A typo in the id, or a script that ran too early. ===
const title = document.getElementById("main-titel");   // the id is br-title; this is null
console.log("getElementById('main-titel') →", title);
try {
  title.textContent = "Welcome!";                      // null has no properties
} catch (error) {
  console.error(`${error.constructor.name}: ${error.message}`);
}
// The same error with the same message appears when the id is right but the script ran before the body was parsed.

// === THE GUARD ===
const realTitle = document.getElementById("br-title");
if (realTitle) {
  realTitle.textContent = "Found it. Now try the form.";
} else {
  console.error("br-title is missing: check the id, and check where the <script> tag is");
}

// === FAILURE 2: the reload. This handler forgot the first line. ===
const form = document.getElementById("br-form");
const input = document.getElementById("br-input");
const list = document.getElementById("br-list");
form.addEventListener("submit", () => {
  // event.preventDefault();  ← commented out on purpose
  const li = document.createElement("li");
  li.textContent = input.value.trim() || "(empty)";
  list.appendChild(li);
  console.log("handler ran and appended the li. Now watch the red line…");
});
console.log("type something and press Add");
console.log("ok: broken");
```

Run it, then type a word and press **Add**. The handler runs, the `li` is appended, and then a red line appears in the console: in your own page, that is the moment the browser reloads. The `li` you just added, every variable, every card, all gone, and the page looks exactly as it did when it loaded. This stage stops the reload and tells you instead, because reloading the lesson is the one thing a stage is not allowed to do; your own `quest-log.html` will not be so kind. Add `event.preventDefault()` as the first line of the handler and the list keeps what you typed.

The first failure is worth reading closely too. `getElementById("main-titel")` is `null`, and the error is not "no such element"; it is `TypeError: Cannot set properties of null (setting 'textContent')` (or `Cannot read properties of null` when you read instead of assign), which points at the line that *used* the null, not the line that *made* it. When you see that message, look one line up for the selector. The same message with a correct id means the script ran before the body was parsed: move the `<script>` to the end of `<body>` or add `defer`.

The two-line rule for the week:

- **Select, check, change.** If a selector can return `null`, your code must survive `null`, and the `<script>` tag must come after the markup it selects (or carry `defer`).
- **`event.preventDefault()` is the first line of every submit handler.** Not after validation, not inside the `if`. First.

> **Note:** Founder-brain shortcut: "my code does nothing" is almost never true. It ran, and then either it crashed on a `null` three lines later or the page reloaded and erased the evidence. Open the console before you touch the code.

## Your turn

Two builds. The first is a prediction exercise; the second is the Character Creator, where last session's classes meet today's DOM.

**1. DOM detective (10 minutes).** Predict what each of these prints or does, then verify in the DevTools console with this page open (the playground stage's markup is part of the page, so `document.getElementById("main-title")` finds its title) or in a scratch page of your own built from the skeleton in The idea. (a) `document.querySelectorAll(".message").map(m => m.textContent)`. (b) `document.getElementById("#main-title")`, with the `#`. (c) An `li` created with `createElement` and given text, but never appended: is it on the page? (d) A click listener added to each `li` in a loop, and then a new `li` appended: does clicking the new one fire it? (e) A submit handler that calls `preventDefault()` *after* an `if (!text) return;` line, when the input is empty. Four out of five is the bar. Every one of these has appeared on this page.

**2. The Character Creator (25 minutes).** In `character-creator.html` + `character-creator.js`: a form with a name input, a class select (Warrior, Mage, Healer, Thief) and a level number input (`min="1" max="50"`). On submit, build a `Character` with an ES6 class whose constructor sets `hp`, `mp` and `attack` from the chosen class (reuse the numbers from your `rpg-classes.js` if you like) and gives each character an `id` from a module-level counter (`let nextId = 1;` at the top of the file, `this.id = nextId++` in the constructor), then render it as a `.card` with every stat visible. Each card has an **Attack Dummy** button that shows a damage number on the card (random within a range based on `attack`) and a **Delete** button that removes the card. Keep every created character in an array as well as on the screen. Use delegation: one listener on the card container, `event.target.matches(".attack-btn")` / `.matches(".delete-btn")`, and `closest(".card")` to find the card. Success looks like: two characters of different classes on screen with correct stats, the Attack button writes a number into the right card, Delete removes only its own card, and the array's length matches the number of cards.

> **Tip:** Give each card a `data-id` attribute when you create it (`card.dataset.id = character.id`) so a click can find the matching object in your array with `find`. That is the bridge between the DOM and your state, and you will build it again in every framework.

## The quest

> *The Guild Master slams a thick, empty ledger onto the counter. "Our quest tracking system is down," she growls. "Adventurers are losing track of their assignments. I need a new system by tomorrow. It needs to track quest names, priority levels, completion status, and it needs to look good. Oh, and make it so I can clear out all the finished quests with one button. I am not scrolling through pages of completed jobs."*

**The To-Do Quest Log.** Create `quest-log.html` and `quest-log.js` and build the Guild's new system.

1. A form that adds quests: a name input and a priority select (Low, Medium, High, Urgent). `preventDefault()` first.
2. A `Quest` class with `id` (the same `nextId++` counter as the Character Creator), `name`, `priority`, `completed` (starts `false`) and `createdAt` (`new Date().toLocaleString()`), plus a `render()` method that builds and returns the card element. Keep every quest in an array.
3. Each quest is a `.card` showing name, priority and timestamp, with the border coloured by priority (your own `.low/.medium/.high/.urgent` classes in your stylesheet).
4. **Mark Complete** toggles `quest.completed`, adds the `completed` class to the card (strikethrough), and re-renders the counter. **Delete** removes the card and the object from the array.
5. A counter that reads "X active quests" and updates after every add, complete and delete. Derive it from your array (`quests.filter(q => !q.completed).length`), not from a separate number.
6. **Clear Completed** removes every completed quest at once: filter the array, then remove each matching card (`querySelectorAll(".completed")` + `forEach(card => card.remove())`).
7. **Event delegation** on the quest container for every button. Do not attach a listener to each card.

Hints that save an hour: write `render()` first and call it with a hard-coded quest so you see a card before you touch the form; give each card `data-id` so the delegated handler can find the right `Quest` in the array; and if a button click does nothing, log `event.target` and read what it actually is (often the text node's parent, which is why `closest(".card")` beats `parentElement.parentElement`).

Stretch goals, in order of difficulty: a search input that hides cards whose name does not include the search text (listen to the `input` event, toggle `.hidden`); a **Sort by priority** button that re-appends the cards in priority order (`appendChild` on an element already in the tree *moves* it); saving the array to `localStorage` as JSON on every change and rebuilding the cards from it on load; and drag-and-drop reordering with the HTML Drag and Drop API. Push to `js-fundamentals`, turn on GitHub Pages for it (Settings → Pages → Deploy from a branch → `main` → `/ (root)`, as in 2.5), and open `https://YOU.github.io/js-fundamentals/quest-log.html` in an incognito window. The repo has no `index.html`, so its root URL is a 404; the page lives at its own file name.

## Side quests

Four pages in the library go deeper than one session can. Read them in this order; each one is a short reference sheet with code that runs in the page.

## Before next session

Four things, and the fourth is the one that matters most.

First, finish the Quest Log if it did not get done in the session, and deploy it. A link you can send someone is the artifact.

Second, open DevTools on any site you use daily, pick an element with the inspector, and change its `textContent` from the console. Then reload and watch it come back. Do that once and "the DOM is not the file" is yours for good.

Third, read MDN's [Introduction to events](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events) through the section on event bubbling. You have the picture from fig. 4; the page gives you the vocabulary (`capture`, `stopPropagation`) you will meet in interviews.

Fourth, **plan your game**. Session 3.5 is the Unit 3 project: you build and deploy a browser game in one session, and the people who finish are the people who arrive with a plan. Pick one: Memory Card Game, Whack-a-Mole, Quiz Game, Simple RPG Battle, or your own idea at that size. Then write down, on paper or in a text file: the HTML elements you need; the CSS classes you will toggle; the JavaScript state (what variables describe the game at any moment); the events you will listen for; and the classes, if any. Half a page is enough. Have it open when you start 3.5.

> **Say:** "The DOM is the live tree, not the file. Select, then check for null, then change. textContent for text, innerHTML only for markup you wrote. Make it in memory, place it with appendChild. One listener on the parent hears every child, even the ones born later. preventDefault first, every time, in every submit handler."

Say it once more without reading it. If it comes out in your own words, you are ready for the Arena.
