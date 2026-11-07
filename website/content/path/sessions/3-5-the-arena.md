---
editorial: true
title: The Arena
subtitle: Build and Deploy Your Browser Game
hook: "Project day. Everything from Unit 3 becomes one playable, deployed game with a URL you can hand to anyone."
read: 55
artifact: "A browser game of your choice (Memory, Whack-a-Mole, Quiz, RPG Battle, or your own) in index.html + style.css + app.js, with a win, a lose, a restart, one real class, two event types, a README, and a live GitHub Pages URL"
diagrams:
  - fig1-game-loop
  - fig2-single-source-of-truth
  - fig3-skeleton-and-order
  - fig4-timer-leak
  - fig5-four-arenas
docs:
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/clearInterval
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  - https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  - https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events
say:
  - "state is the single source of truth; the DOM is a display"
  - "guard, update state, render: every handler, in that order"
  - "do not store what you can compute"
  - "whoever starts a timer owns its id and must clear it"
  - "an ugly working game beats a perfect plan with no code"
---

## The hook

This is it. Build day. Arena day. The training arc is over and the tournament arc begins now.

Over four sessions you learned to store data, write reusable functions, build object-oriented systems, manipulate the DOM and handle events. Each of those came with a lab and a quest, and each quest was a piece of a game pretending to be something else. The Monster Manual was a set of enemies. The Quest Log was a UI with state. Today you stop pretending and forge all of it into one thing: a real, playable, deployed game. Not a tutorial. Not a code-along. Your game, your rules, your code, with a live URL that anyone on the planet can open.

> *Word has spread across the realm. The Grand Arena is hosting its first-ever Builder's Championship, a tournament where adventurers prove their worth not with swords, but with code. Every competitor must enter the arena with a fully functional browser game, built from scratch using nothing but the three sacred arts: HTML, CSS, and JavaScript. No enchanted frameworks. No borrowed libraries. Just raw skill and three hours in the forge.*

Four sessions ago you did not know what a variable was. Today you ship a product. That is not normal progress; keep that in mind at the two-hour mark when the win check is wrong for the third time.

This session is shaped differently from the other four. The teaching part is short, about twenty minutes of reading, because the teaching is already done; what is new today is the **architecture** every browser game shares and the handful of utilities you have not met yet (timers, random numbers, shuffling, deployment). After that the session is three build sprints, a deploy, and playtesting. The page gives you a complete reference game you can read and run, a half-built one you finish, and a stage where the two bugs that eat project days are allowed to happen in front of you.

Every demo here runs live, as in 3.4: the HTML is a fenced-off corner of this page, **Run live** executes the script against it, and the console under the code keeps logging while you play. One new thing: games have timers, and a timer started by a stage keeps ticking until something stops it. On this page, pressing Run live again stops whatever the previous run left running and says so in the console. Your own page will not be so polite, which is the point of the last stage.

## The idea

**Every browser game is the same five parts.** Game state, a render function, event handlers, a win/lose checker and a reset. The state is an object or a set of variables that describes everything about the game at this moment: score, lives, timer, board, whose turn. `render()` reads that state and makes the DOM match it. Handlers respond to clicks and keys by changing state and then calling `render()`. The win/lose checker looks at state and decides whether the game is over. Reset puts state back to the start and renders. That is an **event-driven architecture**: user actions trigger events, events call handlers, handlers update state, state updates re-render the DOM.

![](diagram:session-3-5/fig1-game-loop)

Keep the picture. It answers the question that stalls most first games, "where does this code go?", every single time. A click happened: that is an event, so a handler. The handler needs to know if the game is over: that is a guard, reading state. Something changed: that is state. The screen needs to catch up: that is `render()`. If you find yourself writing DOM code inside a handler, stop and ask whether it belongs in `render()`. Almost always, it does.

**The rules of the arena.** These are the battle-tested practices that separate a game that works on Wednesday from one that still works when you add a feature on Friday.

![](diagram:session-3-5/fig2-single-source-of-truth)

*State is the single source of truth.* Never use the DOM to store game data. If you are reading a score out of an element's text to do maths on it, stop: the score lives in a variable, and the DOM merely displays it. When handling an event, ask "what **state** changes?" first; the DOM catches up when `render()` runs.

*Do not store what you can compute.* In tic-tac-toe you do not need a `moveCount` to detect a tie; the board array already knows. No winner and no `null` squares means tie. Redundant state drifts out of sync. Computed values never lie.

*Use constants for fixed values.* `if (numGuesses > MAX_GUESSES)` reads like English and changes in one place. `if (numGuesses > 5)` is a magic number waiting to become a bug.

*Group related state into objects.* Not `player1Name`, `player1Score`, `player2Name`, `player2Score`: a `players` object. Fewer variables, and features like "save game" become one `JSON.stringify`.

*Cache DOM elements you touch more than once.* Query once at the top, store in a variable, reuse. Your `render()` runs after every move; it should not be searching the tree each time.

*Every handler follows the same skeleton.* Guard clause first, then update state, then render last:

```js
function handleMove(evt) {
  if (winner) return;   // guard: ignore input when the game is over
  // ...update all affected state...
  render();             // always the last line
}
```

*Split big renders.* When `render()` grows, break it into `renderBoard()`, `renderScore()`, `renderMessage()` and have `render()` call all three.

**Three utilities you have not met.** `setInterval(callback, ms)` calls a function again and again at a fixed interval and returns an id; `clearInterval(id)` stops it. That is your countdown clock and, in Whack-a-Mole, your mole scheduler. `Math.random()` returns a float from 0 up to but not including 1, so `Math.floor(Math.random() * (max - min + 1)) + min` is a random integer from `min` to `max` inclusive; the `+ 1` is the part people forget, and without it the top value never appears. The **Fisher-Yates shuffle** randomises an array in place by walking from the end and swapping each element with a random earlier one; it is the right way to shuffle a deck or a question list, and `array.sort(() => Math.random() - 0.5)` is the wrong way, because it is biased: the comparator breaks `sort`'s rules, and the order it gives is visibly skewed.

**Deployment.** GitHub Pages serves static files straight from a repository. The main file must be `index.html`, in the root of the repo. Push, then in the repo's **Settings → Pages** set the source to *Deploy from a branch*, pick `main` and `/ (root)`, save, and the site is live at `https://USERNAME.github.io/REPO-NAME/` within a minute or two. Every push after that redeploys automatically.

> **Say:** "State is the single source of truth; the DOM is a display. Guard, update state, render: every handler, in that order. Do not store what you can compute. Whoever starts a timer owns its id and must clear it. An ugly working game beats a perfect plan with no code."

**The battle plan.** Staring at an empty file is where most projects die. Veterans do not start by coding; they start by planning, and the plan has a fixed order.

![](diagram:session-3-5/fig3-skeleton-and-order)

Write **user stories** first, one per feature, from the player's side: *"As a player, I want to see my remaining lives so that I know how close I am to losing."* Each story is a to-do item. **Wireframe** the screen on paper: boxes and labels. The wireframe tells you what HTML elements you need and, more importantly, what data the game must track. **Pseudocode** the tricky bits, the win check and the turn flow, in plain language before any JavaScript. **List your state**: everything the game must remember while running. Then **organise `app.js` into labelled sections**, always the same five, in this order: constants, state variables, cached DOM elements, event listeners, functions. Then **code in the proven order**: declare (but do not initialise) the state variables; write `init()`, which sets every state value and ends by calling `render()`; stub `render()`; call `init()` so there is a starting screen; register the listeners; write each handler as guard → update → `render()`; one user story at a time. **Commit at every milestone.** Board renders? Commit. Win check works? Commit. Your history should tell the story of the build.

## The demonstration

Four stages and one worker demo. The first stage is the architecture in miniature: a complete game in forty lines with the five labelled sections. The second is the same architecture written as a class, with a real timer. The third is a full reference game you can read top to bottom. The worker demo proves the utilities. The fourth stage is saved for *Where it breaks*.

The stage stylesheet gains a few classes today, for game pieces:

```css
/* additions to stage.css for boards */
.square     { width: 52px; height: 52px; justify-content: center; padding: 0; font: 600 22px/1 monospace; }
button.lit  { background: rgb(232 216 0 / .2); box-shadow: 0 0 0 1px #E8D800; color: #E8D800; }
button.win  { background: rgb(0 168 104 / .2); box-shadow: 0 0 0 1px #00A868; color: #3DD68C; }
.win        { color: #3DD68C; }   .lose { color: #F03038; }
.log        { max-height: 168px; overflow: auto; }
```

### 1. The skeleton, as a game

Guess the Rune: six buttons, one secret, three guesses. Small enough to read in one go, complete enough to have every one of the five parts. Read the comment headers first, then the functions in the order the plan says to write them.

```html stage=skeleton
<h3>Guess the Rune</h3>
<p id="gr-message" class="muted">One of these six runes opens the door. Three guesses.</p>
<div id="gr-board" class="row">
  <button data-idx="0">Fire</button>
  <button data-idx="1">Water</button>
  <button data-idx="2">Earth</button>
  <button data-idx="3">Air</button>
  <button data-idx="4">Light</button>
  <button data-idx="5">Void</button>
</div>
<div class="row">
  <span id="gr-guesses" class="counter">0 / 3 guesses</span>
  <button id="gr-reset">Reset</button>
</div>
```

```js live=skeleton
/*----- constants -----*/
const RUNES = ["Fire", "Water", "Earth", "Air", "Light", "Void"];
const MAX_GUESSES = 3;

/*----- state variables -----*/
let secret;    // index into RUNES
let guesses;   // indexes already tried
let outcome;   // null while playing, then "win" or "lose"

/*----- cached DOM elements -----*/
const boardEl = document.getElementById("gr-board");
const buttons = Array.from(boardEl.querySelectorAll("button[data-idx]"));
const messageEl = document.getElementById("gr-message");
const guessesEl = document.getElementById("gr-guesses");
const resetBtn = document.getElementById("gr-reset");

/*----- event listeners -----*/
boardEl.addEventListener("click", handleGuess);   // one listener for six buttons: delegation
resetBtn.addEventListener("click", init);          // reset is just init again

/*----- functions -----*/
init();

function init() {
  secret = Math.floor(Math.random() * RUNES.length);
  guesses = [];
  outcome = null;
  console.log(`init → the secret is RUNES[${secret}] = ${RUNES[secret]}. State knows; the screen shows only what render() decides.`);
  render();
}

function render() {
  renderBoard();
  renderMessage();
  renderCounter();
}

function renderBoard() {
  buttons.forEach((btn, idx) => {
    btn.classList.toggle("completed", guesses.includes(idx) && idx !== secret);
    btn.classList.toggle("win", outcome !== null && idx === secret);
    btn.disabled = outcome !== null;
  });
}

function renderMessage() {
  if (outcome === "win") messageEl.textContent = `${RUNES[secret]}! The door opens. Reset to play again.`;
  else if (outcome === "lose") messageEl.textContent = `Out of guesses. It was ${RUNES[secret]}. Reset to try again.`;
  else messageEl.textContent = guesses.length ? "Not that one. Guess again." : "One of these six runes opens the door. Three guesses.";
  messageEl.classList.toggle("win", outcome === "win");
  messageEl.classList.toggle("lose", outcome === "lose");
}

function renderCounter() {
  guessesEl.textContent = `${guesses.length} / ${MAX_GUESSES} guesses`;
}

function handleGuess(evt) {
  const btn = evt.target.closest("button[data-idx]");
  if (!btn) return;                    // guard: a click on the gap between buttons
  if (outcome !== null) return;        // guard: the game is over, ignore input
  const idx = Number(btn.dataset.idx);
  if (guesses.includes(idx)) return;   // guard: already tried that one
  guesses.push(idx);                   // update state
  if (idx === secret) outcome = "win";
  else if (guesses.length >= MAX_GUESSES) outcome = "lose";
  console.log(`guess ${RUNES[idx]} → state:`, { guesses: guesses.map((i) => RUNES[i]), outcome });
  render();                            // always the last line
}

console.log("ok: skeleton");
```

Play it once to a win and once to a loss, then read the console. The first line gives the secret away on purpose: the state knows the answer from the first millisecond, and the screen shows only what `render()` chooses to show. That gap, between what the game knows and what it displays, is the whole architecture. Notice that `handleGuess` never touches a class or a text node. It checks three guards, changes two variables, and calls `render()`. Notice that `init` is the reset: there is no separate reset function because resetting *is* initialising. And notice how little `renderBoard` has to think: it does not know which button was just clicked; it simply makes every button match the state, every time. That is slower than updating one button, and for nine or sixteen or a hundred elements it does not matter at all, while the simplicity matters enormously.

### 2. The class shape, with a timer

Stage 2 is the same architecture written as a class, the shape to copy for Option B or D. Dungeon Whacker: nine holes, a ten-second round, a mole that moves every second. This is the shape to copy for anything with a clock.

```html stage=arena-timer
<h3>Dungeon Whacker</h3>
<div class="row">
  <button id="wm-start">Start</button>
  <span id="wm-timer" class="counter">10 s</span>
  <span id="wm-score" class="counter">score 0</span>
  <span id="wm-best" class="muted">best 0</span>
</div>
<div id="wm-holes" class="row">
  <button class="square" data-hole="0">·</button>
  <button class="square" data-hole="1">·</button>
  <button class="square" data-hole="2">·</button>
  <button class="square" data-hole="3">·</button>
  <button class="square" data-hole="4">·</button>
  <button class="square" data-hole="5">·</button>
  <button class="square" data-hole="6">·</button>
  <button class="square" data-hole="7">·</button>
  <button class="square" data-hole="8">·</button>
</div>
<p id="wm-message" class="muted">Press Start. The mole lights one hole every second; hit it.</p>
```

```js live=arena-timer
/*----- constants -----*/
const HOLES = 9;
const ROUND_SECONDS = 10;

/*----- utilities -----*/
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;   // min … max, both inclusive
}

/*----- the game -----*/
class Game {
  constructor() {
    // state
    this.score = 0;
    this.best = 0;
    this.timeLeft = ROUND_SECONDS;
    this.activeHole = null;
    this.isPlaying = false;
    this.intervalId = null;              // the timer's id lives in state, so endGame() can find it
    // cached DOM elements
    this.startBtn = document.getElementById("wm-start");
    this.timerEl = document.getElementById("wm-timer");
    this.scoreEl = document.getElementById("wm-score");
    this.bestEl = document.getElementById("wm-best");
    this.holesEl = document.getElementById("wm-holes");
    this.holeEls = Array.from(this.holesEl.querySelectorAll("button[data-hole]"));
    this.messageEl = document.getElementById("wm-message");
    // event listeners (arrow functions keep `this` as the game, see 3.3)
    this.startBtn.addEventListener("click", () => this.start());
    this.holesEl.addEventListener("click", (evt) => this.handleWhack(evt));
    this.render();
  }

  start() {
    if (this.isPlaying) { console.warn("start() ignored: a round is already running"); return; }  // guard
    clearInterval(this.intervalId);     // never two timers, even if something went wrong before
    this.score = 0;
    this.timeLeft = ROUND_SECONDS;
    this.isPlaying = true;
    this.moveMole();
    this.intervalId = setInterval(() => this.tick(), 1000);
    console.log(`round started, interval id ${this.intervalId}`);
    this.render();
  }

  tick() {
    this.timeLeft -= 1;
    if (this.timeLeft <= 0) { this.endGame(); return; }
    this.moveMole();
    this.render();
  }

  moveMole() {
    let next;
    do { next = randomInt(0, HOLES - 1); } while (next === this.activeHole);   // always a different hole
    this.activeHole = next;
  }

  handleWhack(evt) {
    const hole = evt.target.closest("button[data-hole]");
    if (!hole || !this.isPlaying) return;                       // guard
    const idx = Number(hole.dataset.hole);
    if (idx === this.activeHole) {
      this.score += 1;                                          // update state
      this.moveMole();
      console.log(`hit! score ${this.score}`);
    } else {
      console.log(`miss: hole ${idx}, the mole is in ${this.activeHole}`);
    }
    this.render();                                              // last line
  }

  endGame() {
    clearInterval(this.intervalId);     // the line everyone forgets
    this.intervalId = null;
    this.isPlaying = false;
    this.activeHole = null;
    this.best = Math.max(this.best, this.score);
    console.log(`time's up: ${this.score} whacked, best ${this.best}`);
    this.render();
  }

  render() {
    this.timerEl.textContent = `${this.timeLeft} s`;
    this.scoreEl.textContent = `score ${this.score}`;
    this.bestEl.textContent = `best ${this.best}`;
    this.holeEls.forEach((el, idx) => {
      const up = this.isPlaying && idx === this.activeHole;
      el.textContent = up ? "M" : "·";
      el.classList.toggle("lit", up);
    });
    this.startBtn.textContent = this.isPlaying ? "Running…" : this.best > 0 ? "Play again" : "Start";
    if (this.isPlaying) this.messageEl.textContent = "Hit the lit hole.";
    else if (this.timeLeft === 0) this.messageEl.textContent = `Time's up. ${this.score} whacked. Best ${this.best}.`;
    else this.messageEl.textContent = "Press Start. The mole lights one hole every second; hit it.";
  }
}

const game = new Game();
console.log("ok: arena-timer");
```

Start a round and watch the console count hits and misses while the clock runs down. Then press **Start** again mid-round and read the warning: the guard refused. Three things in this class are worth stealing exactly as written. The interval's id is **state** (`this.intervalId`), so `endGame()` can find and clear it; a timer whose id you threw away cannot be stopped. `start()` calls `clearInterval` *before* `setInterval`, so even if a bug somewhere left a timer running, starting a round cannot create a second one. And the listeners use arrow functions, `() => this.start()`, because a method handed straight to `addEventListener` loses its `this`, which was Rule 2 of `this` in session 3.3; here is where it bites in practice.

### 3. The reference game: Tic-Tac-Toe

A whole game, in the labelled-sections style, that you can read in five minutes and that passes the architecture must-haves on the project checklist (state in JavaScript, DOM manipulation, win, lose, restart); your game must add a class, a second event type, a phone layout and a deploy. It is also where "do not store what you can compute" stops being a slogan: there is no `moveCount`, and the tie is a one-liner.

```html stage=tictactoe
<h3>Tic-Tac-Toe</h3>
<p id="ttt-message" class="counter">X's turn</p>
<div id="ttt-board">
  <div class="row">
    <button class="square muted" data-idx="0">·</button>
    <button class="square muted" data-idx="1">·</button>
    <button class="square muted" data-idx="2">·</button>
  </div>
  <div class="row">
    <button class="square muted" data-idx="3">·</button>
    <button class="square muted" data-idx="4">·</button>
    <button class="square muted" data-idx="5">·</button>
  </div>
  <div class="row">
    <button class="square muted" data-idx="6">·</button>
    <button class="square muted" data-idx="7">·</button>
    <button class="square muted" data-idx="8">·</button>
  </div>
</div>
<div class="row">
  <button id="ttt-replay">Play again</button>
  <span id="ttt-record" class="muted">X 0 · O 0 · ties 0</span>
</div>
```

```js live=tictactoe
/*----- constants -----*/
const MARKS = { 1: "X", "-1": "O" };
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],   // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8],   // columns
  [0, 4, 8], [2, 4, 6],              // diagonals
];

/*----- state variables -----*/
let board;    // 9 squares: 1 (X), -1 (O) or null
let turn;     // 1 or -1
let winner;   // null while playing; 1 or -1 for a win; "T" for a tie
let record;   // { "1": wins, "-1": wins, T: ties }, kept across games on purpose

/*----- cached DOM elements -----*/
const boardEl = document.getElementById("ttt-board");
const squareEls = Array.from(boardEl.querySelectorAll("button[data-idx]"));
const messageEl = document.getElementById("ttt-message");
const recordEl = document.getElementById("ttt-record");
const replayBtn = document.getElementById("ttt-replay");

/*----- event listeners -----*/
boardEl.addEventListener("click", handleMove);
replayBtn.addEventListener("click", init);

/*----- functions -----*/
record = { 1: 0, "-1": 0, T: 0 };
init();

function init() {
  board = Array(9).fill(null);
  turn = 1;
  winner = null;
  render();
}

function render() {
  renderBoard();
  renderMessage();
  renderRecord();
}

function renderBoard() {
  const line = winningLine();
  board.forEach((square, idx) => {
    const el = squareEls[idx];
    el.textContent = square === null ? "·" : MARKS[square];
    el.classList.toggle("muted", square === null);
    el.classList.toggle("win", line !== null && line.includes(idx));
  });
}

function renderMessage() {
  if (winner === "T") messageEl.textContent = "Tie game. Play again?";
  else if (winner) messageEl.textContent = `${MARKS[winner]} wins!`;
  else messageEl.textContent = `${MARKS[turn]}'s turn`;
}

function renderRecord() {
  recordEl.textContent = `X ${record[1]} · O ${record[-1]} · ties ${record.T}`;
}

function handleMove(evt) {
  const el = evt.target.closest("button[data-idx]");
  if (!el) return;                                       // guard: not a square
  const idx = Number(el.dataset.idx);
  if (winner !== null || board[idx] !== null) return;    // guard: game over, or square taken
  board[idx] = turn;                                     // update state
  winner = getWinner();
  if (winner !== null) record[winner] += 1;
  else turn *= -1;
  console.log(`${MARKS[board[idx]]} takes ${idx} →`, board.map((s) => (s === null ? "." : MARKS[s])).join(""), "winner:", winner);
  render();                                              // last line
}

function winningLine() {
  // A line of three X is 3; three O is -3. Empty squares count as 0.
  return WIN_LINES.find((line) => Math.abs(line.reduce((sum, i) => sum + (board[i] || 0), 0)) === 3) || null;
}

function getWinner() {
  if (winningLine()) return turn;                        // only the player who just moved can have won
  return board.includes(null) ? null : "T";              // the tie is computed, never stored
}

console.log("ok: tictactoe");
```

Play a game to a win and one to a tie, then read `getWinner`. There is no counter of moves anywhere in the file; "no winner and no `null` squares" is the tie, read straight from the board. Now look at `record`. It *is* stored, and that is correct: the record across games cannot be computed from the current board, so it has to be remembered. The rule is not "store nothing"; the rule is "store only what you cannot compute". Then look at how X and O are encoded: `1` and `-1`, so a winning line sums to `3` or `-3`. That trick turns eight `if` statements into one `reduce`, and it is the kind of representation choice that makes the rest of a game easy or hard; spend five minutes on it before you write the handlers for your own.

### 4. The utilities, proven

Random numbers and shuffles are easy to get almost right. This runs in the worker and checks the two classic mistakes.

```js run=utils
// Random integer between min and max, both inclusive.
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Fisher-Yates shuffle: copies the array, then swaps from the end down.
function shuffle(array) {
  const arr = [...array];                       // copy, so the caller's array is untouched
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));   // 0 … i, inclusive
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- randomInt: every value in range, nothing outside it ---
const seen = new Set();
for (let n = 0; n < 10000; n++) {
  const r = randomInt(1, 6);
  if (r < 1 || r > 6 || !Number.isInteger(r)) throw new Error(`randomInt left the range: ${r}`);
  seen.add(r);
}
console.log("10,000 dice rolls, values seen:", [...seen].sort().join(" "));
// The classic off-by-one: forget the +1 and the top value never appears.
const noSix = new Set();
for (let n = 0; n < 10000; n++) noSix.add(Math.floor(Math.random() * (6 - 1)) + 1);
console.log("without the +1, values seen:   ", [...noSix].sort().join(" "), "← 6 never comes up");

// --- shuffle: same cards, new order, original untouched ---
const deck = ["A", "A", "B", "B", "C", "C", "D", "D"];
const dealt = shuffle(deck);
console.log("deck: ", deck.join(" "));
console.log("dealt:", dealt.join(" "));
if (deck.join("") !== "AABBCCDD") throw new Error("shuffle mutated the original");
if ([...dealt].sort().join("") !== "AABBCCDD") throw new Error("shuffle lost or invented a card");
let moved = 0;
for (let n = 0; n < 1000; n++) if (shuffle(deck).join("") !== deck.join("")) moved++;
console.log(`shuffled 1,000 times: ${moved} orders differed from the original`);

// --- Math.random itself: 0 ≤ x < 1, never 1 ---
let max = 0;
for (let n = 0; n < 100000; n++) max = Math.max(max, Math.random());
console.log("largest of 100,000 Math.random() calls:", max.toFixed(6), "(always below 1)");

console.log("ok: utils");
```

The second line of output is the one to remember: drop the `+ 1` and a six-sided die never rolls six, and nothing crashes to tell you. The shuffle copies first (`[...array]`) so the original deck is untouched, which matters when you want to shuffle the same question list again for the next playthrough. If `shuffle` ever lost or duplicated a card, the `throw` would have ended the run before the ok line.

## Where it breaks

**The interval that never died, and the DOM as a database.**

Two bugs account for most of project day's lost hours, and neither is a logic error in the game rules. The first is a timer nobody cleared. The second is a number read out of the page.

![](diagram:session-3-5/fig4-timer-leak)

```html stage=broken
<h3>Two ways the arena breaks</h3>
<div class="row">
  <button id="lk-leaky">Start (leaky)</button>
  <button id="lk-guarded">Start (guarded)</button>
  <button id="lk-stop">Stop everything</button>
  <span id="lk-timer" class="counter">5 s</span>
</div>
<div id="lk-log" class="log">Press Start (leaky) twice, then watch.</div>
<div class="row">
  <span id="lk-score">Score: 0</span>
  <button id="lk-dom">+1 by reading the label</button>
  <button id="lk-state">+1 from state</button>
</div>
```

```js live=broken
/*----- state -----*/
const state = { timeLeft: 5, score: 0, intervalId: null, isPlaying: false };
const running = [];     // every interval id ever started, so Stop can find the leaked ones
let gameOvers = 0;

/*----- cached DOM elements -----*/
const timerEl = document.getElementById("lk-timer");
const logEl = document.getElementById("lk-log");
const scoreEl = document.getElementById("lk-score");

/*----- helpers -----*/
function log(text, cls) {
  const line = document.createElement("div");
  line.textContent = text;
  if (cls) line.classList.add(cls);
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}
function renderTimer() { timerEl.textContent = `${state.timeLeft} s`; }

/*----- FAILURE 1: the leak. No guard, no clearInterval. Press it twice. -----*/
document.getElementById("lk-leaky").addEventListener("click", () => {
  state.timeLeft = 5;
  const id = setInterval(() => leakyTick(id), 1000);
  running.push(id);
  log(`leaky start → interval #${id} is ticking (${running.length} running now)`, "muted");
});

function leakyTick(id) {
  state.timeLeft -= 1;
  renderTimer();
  if (state.timeLeft > 0) { log(`tick from #${id} → ${state.timeLeft} s`); return; }
  endGameLeaky(id);
}

function endGameLeaky(id) {
  log(`Game Over! (from #${id}) … and nothing cleared it`, "lose");
  gameOvers += 1;
  if (gameOvers >= 4) {
    stopAll();
    log("stopped by this demo after 4 Game Overs. Your own page would keep going until the tab closed.", "muted");
  }
}

/*----- THE FIX: a guard, and a clear on both ends -----*/
document.getElementById("lk-guarded").addEventListener("click", () => {
  if (state.isPlaying) { log("guarded start ignored: already playing", "muted"); return; }   // 1 guard
  stopAll();                                                                                 // 2 clear before set
  state.isPlaying = true;
  state.timeLeft = 5;
  renderTimer();
  state.intervalId = setInterval(() => {
    state.timeLeft -= 1;
    renderTimer();
    if (state.timeLeft > 0) { log(`guarded tick → ${state.timeLeft} s`); return; }
    clearInterval(state.intervalId);                                                         // 3 clear on end
    state.isPlaying = false;
    log("Game Over! (once, then silence)", "win");
  }, 1000);
  running.push(state.intervalId);
  log(`guarded start → interval #${state.intervalId}`, "muted");
});

function stopAll() {
  running.forEach((id) => clearInterval(id));
  running.length = 0;
  gameOvers = 0;
  state.isPlaying = false;
}
document.getElementById("lk-stop").addEventListener("click", () => {
  stopAll();
  log("every interval cleared", "muted");
});

/*----- FAILURE 2: the DOM as a database -----*/
document.getElementById("lk-dom").addEventListener("click", () => {
  const text = scoreEl.textContent;          // "Score: 0"
  const n = parseInt(text);                  // NaN: the string starts with a word, not a number
  scoreEl.textContent = `Score: ${n + 1}`;   // "Score: NaN", and it will stay that way
  console.error(`parseInt("${text}") → ${n}. The label is a sentence with a number in it, not a number.`);
});
document.getElementById("lk-state").addEventListener("click", () => {
  state.score += 1;                                // the number lives here
  scoreEl.textContent = `Score: ${state.score}`;   // the DOM only displays it, so it is instantly repaired
  console.log(`state.score = ${state.score}`);
});

renderTimer();
console.log("ok: broken");
```

Press **Start (leaky)** twice, quickly. The timer now loses two seconds per second, because two intervals are ticking, and the log shows `tick from #1` and `tick from #2` alternating. When it reaches zero, "Game Over!" prints, and then prints again, and again, because `endGameLeaky` never calls `clearInterval`. Your own game would keep shouting Game Over once a second until the tab closed; this stage gives up after four and tells you so. Now press **Stop everything**, then **Start (guarded)** twice. The second press is refused by the guard. The round runs once, ends once, and goes quiet, because the fix is three lines: a guard on `isPlaying`, `clearInterval` *before* `setInterval`, and `clearInterval` again when the game ends. The id returned by `setInterval` is the only handle you will ever have on that timer. Keep it in state. Whoever starts a timer owns its id and must clear it.

Then press **+1 by reading the label**. The label said `Score: 0`; `parseInt("Score: 0")` is `NaN`, because `parseInt` reads from the start of the string and the start is a word; `NaN + 1` is `NaN`; and the display now reads `Score: NaN`, which is what your players will screenshot. Press **+1 from state** and it is instantly correct again, because the number was never in the label; it was in `state.score`, and the label is a view of it. Every variation of this bug (reading the timer back out of the clock element, counting the cards on screen to decide whether the game is won, checking a class name to know whose turn it is) has the same cure: the state is the truth; the DOM is a display.

> **Note:** On this page, pressing **Run live** again stops any timer the previous run left ticking and tells you in a dim line. That is the lesson page protecting itself, not JavaScript. In your own `index.html`, a leaked interval survives everything except a reload, and "my timer runs twice as fast after I restart" is exactly what it looks like.

## Your turn

Project day is structured as three build sprints with checkpoints, and the sprints are the plan. Do them in order. Do not skip Sprint 1 because "the HTML is the easy part"; a game with no layout has nowhere to render, and you will write the JavaScript twice.

**Sprint 1: HTML + CSS foundation (25 minutes).** Make the folder and the repository first, so every checkpoint below can be a commit: `mkdir -p ~/projects/memory-game && cd ~/projects/memory-game && git init`. The examples on this page use `memory-game`; if you chose another arena, name the folder for that game and nothing else changes. Create `index.html`, `style.css` and `app.js`; link the CSS in `<head>` and the script with `<script src="app.js" defer></script>`, the skeleton from 3.4. A finished example of exactly this layout is the `game/` folder of https://github.com/arthurbernierjr/dtc-landing (`index.html`, `style.css`, `app.js`: a memory game with one `MemoryGame` class, click and keydown, a 45-second timer, a win, a loss and a restart). It is a finished example to read after you try, not a template: read its `index.html` for the script tag, then close it. Build the whole layout with no JavaScript at all: the board area, the score and timer displays, the message line, the start/restart button, and any form your game needs. Hard-code a few pieces (two cards face up, a mole in a hole, the first question) so you can style the states before they exist. Checkpoint: the game is visible, styled and responsive in the browser, and `app.js` is still empty.

**Sprint 2: core game logic (40 minutes).** Open `app.js` and write the five comment headers. Fill them in the proven order: declare state; write `init()` ending in `render()`; stub `render()` as a `console.log` of the state; call `init()`; add the listeners; then write the handlers one user story at a time, each one guard → update → `render()`. By the end of the sprint the game should respond to input and the score should change. Checkpoint: you can play, badly, and the console shows the state changing with every click. Commit.

**Sprint 3: win, lose and polish (30 minutes).** Add the win condition and the lose condition (timer, lives or wrong answers), and make sure both are *communicated* to the player: a message, a colour, a disabled board. Add restart without reloading the page: that is `init()` on a button, plus `clearInterval` on whatever was running. Then polish whatever time allows: feedback on every action, a transition on the cards, a difficulty select. Checkpoint: the game can be played to a win, to a loss, and restarted, and it feels like a game rather than an exercise. Commit.

Then **deploy (20 minutes)**. On GitHub, create an empty public repository called `memory-game` (no README, no `.gitignore`; the files already exist on your machine). Then, in the game folder:

```bash
cd ~/projects/memory-game
git add .
git commit -m "win, lose and restart"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/memory-game.git
git push -u origin main
# then on GitHub: Settings → Pages → Source: Deploy from a branch → main → / (root) → Save
# live in a minute or two at https://YOUR_USERNAME.github.io/memory-game/
```

The remote is the SSH form, `git@github.com:…`, because 1.4 set you up with a key; an `https://` remote would ask for a username and a token on every push. The GitHub step and the remote can also be one line, as in 1.4: `gh repo create memory-game --public --source=. --remote=origin --push`. Open the URL in an incognito window. If you see a 404, the file is not called `index.html` or it is not in the root of the repo; those two account for nearly every failed deploy. Then spend the rest of the time **playtesting**: send the URL to a friend or someone in your house and ask four questions. Does it work? Is it fun? Is anything confusing? Any bugs? Write down what they say before you argue with it.

> **Tip:** Test after every handler, not after every hundred lines. Save, refresh, click, read the console. The bug you introduced thirty seconds ago is easy to find; the one from forty minutes ago has friends.

## The quest

> *The crowd gathers. The guild masters watch from the royal box. The announcer reads your name. This is your moment. Build something the crowd will remember. Build something that works. Build something you are proud of. Then deploy it to the Crystal Network so the entire realm can play it. Win or lose, every competitor who ships a working game earns the title of Builder. But those who go above and beyond? They earn Legendary status.*

**The Arena Championship: Build Your Browser Game.** This is Project 1, the Unit 3 project. Pick one arena and build it from scratch; no frameworks, no jQuery, no libraries.

![](diagram:session-3-5/fig5-four-arenas)

- **Option A, Memory Card Game (The Matching Spell).** A grid of 12 to 20 face-down cards (6 to 10 pairs). Click two to flip them; after a short delay they stay up if they match and flip back if they do not. Track attempts and time. Win when every pair is matched. Suggested class: `Card` with `value`, `isFlipped`, `isMatched`, `element`. You will want `shuffle` and a `setTimeout` for the flip-back. A finished example to read after you try: the `game/` folder of https://github.com/arthurbernierjr/dtc-landing.
- **Option B, Whack-a-Mole (Dungeon Whacker).** 9 to 12 holes; moles appear at random for one to two seconds and come faster as time goes on; a 30 to 60 second limit; score and high score. Suggested class: `Mole` with `holeIndex`, `isVisible`, `speed`, `element`. You will want `setInterval`, `clearInterval` and `randomInt`, and you have the shape in stage 2.
- **Option C, Quiz Game (The Sage's Trial).** At least ten questions with four choices each, shuffled every playthrough; a correct answer gives +10 and green feedback; a wrong answer costs one of three lives and shows red. Win by finishing the questions, lose by running out of lives, then show the final score and a play-again. Suggested class: `Quiz` with `questions`, `currentIndex`, `score`, `lives`.
- **Option D, Simple RPG Battle (Arena Combat Simulator).** Create a character (name, class); fight three to five enemies in turns; each turn choose normal attack, special, defend or potion; enemies pick attacks at random; damage is attack minus defence (never below zero); potions are limited; a battle log shows every action. Win by defeating every enemy; lose when HP hits zero. Suggested classes: `Character` as the base, `Player` and `Enemy` extending it, and `Battle`. Your Monster Manual from 3.3 is most of this.
- **Option E, your own idea**, if something fires you up more than these; it only has to meet the technical requirements below at the same size.

**Must have** (required to pass): HTML, CSS and vanilla JavaScript only; at least one ES6 class used meaningfully; DOM manipulation that creates, modifies or removes elements; at least two different event types (click, submit, keydown…); game state tracked in JavaScript (score, turns, lives, timer or equivalent); a win condition **and** a lose condition; restart without refreshing; a responsive layout playable on a phone; deployed on GitHub Pages; clean, readable code with comments on the key logic. **Should have**: styled beyond browser defaults; feedback for every action; smooth play with no layout jumps; a README with title, description, how to play and the live link; no major bugs. **Could have**: sound, CSS animations, difficulty levels, a `localStorage` high score, a leaderboard, touch controls, an instruction screen, a dark-mode toggle.

**How to score yourself.** Before you call it done, score the game against this list. 70 points for the boss clear: loads and runs (10), win and lose conditions (10), restart without refresh (5), DOM manipulation (10), event handling with delegation where it fits (10), a meaningful class (10), state management (10), deployment (5). 20 points of epic loot: visual design, user feedback, code quality, README, five each. 10 points of legendary status: advanced features and professional polish, five each. 90 and up is Legendary (S-Rank); 80 to 89 Epic (A); 70 to 79 Boss Clear (B); 60 to 69 Approaching (C); below that, retry. Read the list before you start, not after: half of it is architecture you get for free by following the skeleton.

**Your evidence.** A public repo named for the game (`memory-game`, not `project1`); the GitHub Pages URL, verified in an incognito window; and a `README.md` with the game title, a one- or two-sentence description, a screenshot or GIF, the live link, the technologies used and how to play. Both URLs go in the README, which is the one place anyone, including you in six months, will look. Finish it before you start 4.1.

## Side quests

Four pages in the library go deeper than one session can. Read them in this order; each is a short reference sheet with code that runs in the page.

## Before next session

Before Unit 4 begins, in this order.

First, **fix what playtesting found.** Every note someone gave you is a bug report from a real user; that is the most valuable thing you will get this week.

Second, **add one feature you did not get to**: a difficulty selector, a high-score display with `localStorage`, a sound, an animation on the win. One, finished, beats three half-done.

Third, **make it playable on a phone.** Open the live URL on your own phone. Buttons under 44 pixels, text that needs zooming, a board that scrolls sideways: fix those. The rubric says responsive, and the person you send the link to will open it on a phone.

Fourth, **write the README**: title, description, how to play, technologies used, the live link, a screenshot or GIF. It is five points on the rubric and the first thing anyone, including a future employer, sees in the repo.

Fifth, **push, verify in an incognito window, and check that both URLs are in the README**.

Then rest for a day. Unit 4 is a new arc, and 4.1, The Runtime Beyond the Browser, is where you leave the browser for the first time and run JavaScript on a server with Node, npm and Express. Nothing to read ahead; arrive with a game you can show. Nothing will still be running: the game is static files on GitHub Pages, and there is no server to stop.

> **Say:** "State is the single source of truth; the DOM is a display. Guard, update state, render: every handler, in that order. Do not store what you can compute. Whoever starts a timer owns its id and must clear it. An ugly working game beats a perfect plan with no code."

You came into Unit 3 not knowing what a variable was. You leave it with a game on the internet. Builder.
