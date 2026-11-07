---
editorial: true
title: Formation Magic
subtitle: Flexbox, CSS Grid, and Responsive Design
hook: "The armor is on, and everything is still one column. A navigation bar, a row of cards, a sidebar beside the story, a page that rearranges when the window gets narrow: that is layout. Flexbox handles one direction. Grid handles both. You write the small screen first, and each wider screen adds to it."
read: 65
artifact: "layout-demo.html with a flex navigation bar and a card grid that wraps by itself; holy-grail.html whose named areas restack at 768px and 1024px; and formation.html, a responsive quest portfolio with a hero, six cards, fluid type, and no horizontal scrollbar, committed and pushed"
diagrams:
  - fig1-flex-axes
  - fig2-grid-areas
  - fig3-auto-fit
  - fig4-mobile-first
  - fig5-grid-and-flex
docs:
  - https://css-tricks.com/snippets/css/a-guide-to-flexbox/
  - https://css-tricks.com/snippets/css/complete-guide-grid/
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Basic_concepts_of_grid_layout
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Auto-placement_in_grid_layout
  - https://cssgridgarden.com/
say:
  - "flex is one axis: justify-content moves along it, align-items moves across it, and direction decides which way is which"
  - "grid is both axes at once: name the areas, then point each element at its name"
  - "repeat(auto-fit, minmax(280px, 1fr)) wraps by itself; a media query is for when the layout actually changes shape"
  - "write the phone first; a min-width query adds a layout for that width and everything wider"
  - "grid places the regions; flex arranges what is inside a region"
---

## The hook

The pages you shipped last session have color, type, space, and a hover. They also have one shape. Everything stacks, top to bottom, as wide as the window. That is what a browser does with a document when nobody has told it otherwise. Open any site you actually use. The navigation is a row. The cards sit beside each other and drop to the next line when they run out of room. A sidebar keeps the main story company. Shrink the window and the row becomes a stack, on purpose, not by accident. That rearrangement is layout, and it is the difference between a styled document and a page.

> *The company had learned to stand in a line. Then the captain drew a shape in the dirt: a front, two flanks, a reserve behind. The same people. A different formation. When the ground got narrow, the flanks folded in behind the front and the company was a line again, and nobody had to be told twice, because the narrow shape had been the first one they practiced.*

Two systems do this work, and they are not rivals. **Flexbox** lays items out along one direction, a row or a column, and is how you build a bar, a centered hero, a card's insides. **Grid** lays items out along both directions at once, and is how you build the page: header, navigation, story, sidebar, footer, each in a named place. Before either existed, people stretched floats and tables into jobs they were not made for, and wrote articles about centering a box. Centering a box is three declarations now. You will measure them.

Then the window. Phones, tablets, laptops, and the occasional ultrawide. A page that only works at the width of your monitor is a page that works for you. The approach is **mobile-first**: the rules you write with no query are the small screen, and a query adds rules for a wider screen. The narrow formation is the one you practice first. By the end of today the potion shop's cards sit in a grid, the about page survives a phone, and you have a formation drill of your own.

The stages apply these declarations as inline styles, the same constraint as last session, and then they measure. A gap, a shared top edge, a header that spans its container. The numbers are the layout. The CSS you save is in the blocks.

## The idea

### One direction

Flexbox is for a single line of items. You turn it on at the parent.

```css
.navbar {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}
```

`display: flex` is the switch. The element becomes a flex container, and its **direct children** become flex items. Grandchildren are unaffected. Nothing visible happens until a second property, because the defaults are a row, packed at the start, stretched on the cross axis.

`flex-direction` names the **main axis**. `row`, the default, runs left to right. `column` runs top to bottom. `row-reverse` and `column-reverse` flip the direction without changing your HTML, which you will almost never want, because the visual order then disagrees with the order a screen reader walks.

`justify-content` distributes items along the main axis. `flex-start` packs them at the start. `flex-end` packs them at the end. `center` puts the group in the middle. `space-between` pins the first item to the start and the last to the end and shares the free space between the items. `space-around` puts equal space on both sides of each item, which means the outer ends get half of what the gaps get. `space-evenly` makes every gap, including the ends, the same. If you remember one, remember `space-between` for a bar with a name on the left and links on the right, and `center` for a group that should sit in the middle.

`align-items` does the same job on the **cross axis**, the one perpendicular to the main axis. `stretch` is the default, and it is why a row of cards becomes equal height when one of them has more text. `center` is the other one you will type constantly. `flex-start`, `flex-end`, and `baseline` are there when the stretch is wrong.

![](diagram:session-2-3/fig1-flex-axes)

Fig 1 is the whole memory trick. In a row, justify moves left and right and align moves up and down. In a column, those sentences swap. When a layout is wrong, say the axis out loud before you change a property. Most "align-items did nothing" bugs are a direction you forgot you set.

`flex-wrap: wrap` lets items drop to the next line when they do not fit. The default is `nowrap`, which is why a nav of eight links overflows the phone and grows a horizontal scrollbar. `gap` is space between items, and it does not collapse the way margin does. Prefer it. Margin on flex items is still useful for one trick: in a column, `margin-top: auto` on the last child eats all the free space above it and pins that child to the bottom. That is how a card's price sits on the same line across cards of different heights.

The children's properties are about size, not about the group. `flex-grow` is a share of leftover space. All of them at `1` means equal shares. One of them at `2` means that one gets twice the leftover the others get. `flex-shrink` is the same idea when there is not enough room; `0` means "do not get smaller than your basis." `flex-basis` is the size before growing or shrinking, a suggestion, not a promise. The shorthand is `flex: grow shrink basis`, and `flex: 1` is a common way to say "share the space, and start from nothing." `align-self` overrides the container's `align-items` for one child. `order` changes the visual order and not the source order. Leave it alone unless you have a reason a screen reader should hear a different sequence than a sighted reader sees. The source order is the real order.

The pattern that replaced a decade of hacks:

```css
.hero {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
}
```

Both axes centered. `min-height` gives the cross axis somewhere to center in. Without a height, a row is only as tall as its content, and centering on the cross axis has no free space to spend.

### Both directions

Grid is for rows and columns together. You turn it on the same way, on the parent.

```css
.page {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    gap: 1rem;
}
```

`grid-template-columns` is the list of column sizes. `200px` is fixed. `1fr` is a fraction of the **remaining** space, after the fixed tracks have taken theirs. `200px 1fr 200px` is a fixed flank, a flexible middle, a fixed flank. `1fr 2fr` gives the second column twice what the first gets of whatever is left. `fr` is not a length you can measure until the other tracks are placed. That is why a column of `1fr` next to a column of `300px` does not mean "equal," and why people who treat `fr` as a synonym for percent get a layout that will not add up.

Named areas are why grid is pleasant to read.

![](diagram:session-2-3/fig2-grid-areas)

```css
.page {
    display: grid;
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        "header header header"
        "nav    main   aside"
        "footer footer footer";
    min-height: 100vh;
    gap: 1rem;
}

.page-header { grid-area: header; }
.page-nav    { grid-area: nav; }
.page-main   { grid-area: main; }
.page-aside  { grid-area: aside; }
.page-footer { grid-area: footer; }
```

The string is the picture. Repeating `header` across the first row makes the header span three columns. `min-height: 100vh` gives the middle row somewhere to grow, so the footer sits at the bottom of the viewport even when the story is short. `100vh` is the viewport height. `100vw` is the width, and you will use it rarely, because a horizontal scrollbar plus `100vw` is a classic way to be 15 pixels too wide.

`repeat(3, 1fr)` is `1fr 1fr 1fr`. `minmax(280px, 1fr)` is "at least 280, and then a share of the rest." Put those together and you get the line that retires a pile of media queries:

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
    gap: 1.5rem;
}
```

![](diagram:session-2-3/fig3-auto-fit)

As many 280-pixel columns as will fit, each one growing to share the row, and the next card moving down when another 280 will not. Fig 3 draws the plain form, `minmax(280px, 1fr)`, and that is the one to say out loud. The `min(280px, 100%)` wrapped around the minimum is the guard for a phone: a plain 280 cannot shrink, so on a viewport narrower than 280 plus the container's padding the one column a phone gets is wider than the phone, and the page grows a horizontal scrollbar. `min()` takes the smaller of its two values, so the minimum is 280 where there is room for 280 and the full width of the container where there is not. `auto-fit` collapses tracks that have no card, so two cards on a wide screen grow to fill the row. `auto-fill` keeps the empty tracks, so two cards stay 280-ish and the rest of the row is blank columns. For a card grid you want `auto-fit`. You will feel the difference the first time a single card stretches the full width and you did not expect it; that is fit, doing what it was told.

Which one, then. A navigation bar, a centered hero, a cluster of badges in a row: flex. The skeleton of the page, equal columns that stay equal, a region that must sit in a particular cell: grid. A wrapping row of cards can be either; the `auto-fit` line is grid, and it is the one to reach for. The honest answer is both, on the same page. Grid decides where the regions are. Flex decides how the things inside a region line up. Fig 5, in the demonstration, is that sentence drawn.

### The narrow shape first

Responsive means the page is good at every width you can drag the window to, not tolerable. The way to get there is to write the narrow layout as the base, with no query, and to add wider layouts inside `@media (min-width: …)`.

The viewport line from Session 2.1 is what makes this true on a phone. Without `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, a phone pretends to be a desktop and shrinks the result, and your carefully stacked layout never gets a chance to run.

![](diagram:session-2-3/fig4-mobile-first)

```css
.page {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas:
        "header"
        "nav"
        "main"
        "aside"
        "footer";
}

@media (min-width: 768px) {
    .page {
        grid-template-columns: 200px 1fr;
        grid-template-areas:
            "header header"
            "nav    main"
            "nav    aside"
            "footer footer";
    }
}

@media (min-width: 1024px) {
    .page {
        grid-template-columns: 200px 1fr 200px;
        grid-template-areas:
            "header header header"
            "nav    main   aside"
            "footer footer footer";
    }
}
```

Read it from the top. Every screen gets the stack. A viewport at least 768 pixels wide also gets the two-column version, and keeps getting it as the window grows, until 1024, where the three-column version replaces the template. The query does not say "only tablets." `min-width: 768px` means "768 and up," and the next query overrides it when the window gets there. That is why the order of the queries matters. Write them smallest first.

`max-width` queries are the other direction, desktop rules undone for phones. They work, and you will see them, including in demos that stack a nav by overriding a row. Prefer `min-width`. A base that is already the phone does not need to be undone.

Breakpoints are where **your** layout breaks, not a catalog of devices. 768 and 1024 are useful defaults because that is where a 200-pixel sidebar starts to deserve its place. If your cards collide at 900, the query goes at 900.

`clamp(1.5rem, 4vw, 3rem)` is a font size that is 4 percent of the viewport width, never smaller than 1.5rem, never larger than 3rem. It scales without a query. Use it for headings. Keep body text in `rem`, so a reader who enlarged their default type still gets the enlargement. `vw` on body text ignores that preference, which is why the clamp for a paragraph should keep its minimum in `rem`.

> **Note:** Seven sentences the rest of the unit assumes you have dropped. *Flex and grid are two ways to do the same thing*: one direction, or both. *I need a query for every resize*: `auto-fit` and `clamp` already handle the smooth cases. *Mobile-first means a separate mobile stylesheet*: it means the base is the phone. *Use max-width queries*: use min-width, and let the wider rule win by coming later. *`1fr` is a fixed share of the page*: it is a share of what remains after the fixed tracks. *Flex items wrap when they need to*: they wrap when you set `flex-wrap`. *Grid replaced flex*: the page is a grid, and the bar inside the header is still a flex row.

## The demonstration

Three stages and the file you will actually save. Fig 5 is the target: a bar that is a flex row, and a grid of cards whose insides are flex columns.

![](diagram:session-2-3/fig5-grid-and-flex)

**Walkthrough 1: the bar.** Create `layout-demo.html` and `layout-demo.css` in `html-css-foundations`. The head is the boilerplate you know, plus the stylesheet link. The body starts here.

```html
<nav class="navbar">
    <a class="navbar-brand" href="#board">Quest Board</a>
    <ul class="navbar-links">
        <li><a href="#board">Home</a></li>
        <li><a href="#board">Quests</a></li>
        <li><a href="#board">Party</a></li>
        <li><a href="#board">Inventory</a></li>
        <li><a href="#board">Profile</a></li>
    </ul>
</nav>
<main id="board" class="main-content">
    <h1>Welcome to the Quest Board</h1>
    <p>Select a quest. The layout is the lesson; the quests can wait.</p>
</main>
```

The base of the stylesheet is last session's reset and tokens. Then the bar. Written mobile-first, the stack is the default and the row is the upgrade.

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}

:root {
    --color-bg: #08080a;
    --color-surface: #16161a;
    --color-accent: #00a868;
    --color-text: #f5f2ee;
    --color-muted: #8a8a94;
    --space: 1rem;
}

body {
    margin: 0;
    font-family: "Segoe UI", Tahoma, sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
}

.navbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space);
    padding: var(--space);
    background: var(--color-surface);
}

.navbar-brand {
    color: var(--color-accent);
    font-size: 1.5rem;
    font-weight: 700;
    text-decoration: none;
}

.navbar-links {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.navbar-links a {
    color: var(--color-muted);
    text-decoration: none;
}

.navbar-links a:hover {
    color: var(--color-accent);
}

@media (min-width: 768px) {
    .navbar {
        flex-direction: row;
        justify-content: space-between;
        padding: 1rem 2rem;
    }

    .navbar-links {
        flex-direction: row;
        gap: 1.5rem;
    }
}
```

Two flex containers, one inside the other. The `nav` places the brand and the list. The `ul` places the links. On a phone both are columns, centered. At 768 and up the nav becomes a row with the brand pinned left and the list pinned right, and the list itself becomes a row. Nested flex is the normal way a bar is built. Change `justify-content` in DevTools to `center`, then `flex-end`, then `space-around`, and watch only the main axis move.

The stage measures that difference. `space-between` opens a gap between the brand and the links. `center` closes it, because the two groups are now one centered cluster with nothing telling them to separate.

```html stage=navbar
<nav id="bar">
    <a class="brand" href="#board">Quest Board</a>
    <ul>
        <li><a href="#board">Home</a></li>
        <li><a href="#board">Quests</a></li>
        <li><a href="#board">Party</a></li>
    </ul>
</nav>
<main id="board"><p>The board sits under the bar.</p></main>
```

```js live=navbar
const bar = document.getElementById("bar");
const brand = bar.querySelector(".brand");
const list = bar.querySelector("ul");
bar.style.display = "flex";
bar.style.alignItems = "center";
bar.style.padding = "12px 16px";
bar.style.background = "#16161A";
brand.style.color = "#00A868";
brand.style.fontWeight = "700";
brand.style.textDecoration = "none";
list.style.display = "flex";
list.style.gap = "16px";
list.style.listStyle = "none";
list.style.margin = "0";
list.style.padding = "0";
function split() {
  return Math.round(list.getBoundingClientRect().left - brand.getBoundingClientRect().right);
}
bar.style.justifyContent = "space-between";
console.log("space-between, pixels between brand and links:", split());
bar.style.justifyContent = "center";
console.log("center, pixels between brand and links:", split());
console.log("ok: navbar");
```

**Walkthrough 2: the cards.** Under the main content, six quests. The grid line is the whole responsive story. Each card is a column, and the reward carries `margin-top: auto`.

```html
<section class="card-section">
    <h2>Available quests</h2>
    <div class="card-grid">
        <article class="card">
            <h3>Slay the Dragon</h3>
            <p class="card-difficulty">Legendary</p>
            <p>The northern village is done waiting.</p>
            <span class="card-reward">500 gold</span>
        </article>
        <article class="card">
            <h3>Gather Moonflowers</h3>
            <p class="card-difficulty">Easy</p>
            <p>Ten flowers, and only at night.</p>
            <span class="card-reward">50 gold</span>
        </article>
        <article class="card">
            <h3>Escort the Merchant</h3>
            <p class="card-difficulty">Medium</p>
            <p>Bandit Gorge, then the capital.</p>
            <span class="card-reward">150 gold</span>
        </article>
        <article class="card">
            <h3>Clear the Dungeon</h3>
            <p class="card-difficulty">Hard</p>
            <p>Five floors. Bring back the crystal.</p>
            <span class="card-reward">300 gold</span>
        </article>
        <article class="card">
            <h3>Decode the Runes</h3>
            <p class="card-difficulty">Medium</p>
            <p>The library grew writing overnight.</p>
            <span class="card-reward">200 gold</span>
        </article>
        <article class="card">
            <h3>Win the Tournament</h3>
            <p class="card-difficulty">Hard</p>
            <p>Three rounds. One title.</p>
            <span class="card-reward">400 gold</span>
        </article>
    </div>
</section>
```

```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
    gap: 1.5rem;
}

.card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.5rem;
    background: var(--color-surface);
    border-radius: 8px;
    border-left: 4px solid var(--color-accent);
}

.card-reward {
    margin-top: auto;
    color: #e8d800;
    font-weight: 700;
}

h1 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
}
```

Resize the window slowly. Columns appear and disappear with no query anywhere near `.card-grid`. Change `280px` to `150px` and watch the wrap happen later. Change `auto-fit` to `auto-fill` with only two cards in the grid and watch the empty tracks stay. Put the two cards back on `auto-fit` and watch them grow. That is the difference, and it is the reason the requirement later in this session says `auto-fit`.

The stage forces the widths so you can see the count without dragging the window.

```html stage=cards
<div id="quests">
    <article>Dragon</article>
    <article>Flowers</article>
    <article>Escort</article>
    <article>Mine</article>
    <article>Runes</article>
    <article>Tournament</article>
</div>
```

```js live=cards
const grid = document.getElementById("quests");
grid.style.display = "grid";
grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(140px, 1fr))";
grid.style.gap = "8px";
function columns() {
  const counts = {};
  grid.querySelectorAll("article").forEach((card) => {
    const top = Math.round(card.getBoundingClientRect().top);
    counts[top] = (counts[top] || 0) + 1;
  });
  return Math.max(...Object.values(counts));
}
grid.style.width = "640px";
console.log("container 640px, columns on the first row:", columns());
grid.style.width = "300px";
console.log("container 300px, columns on the first row:", columns());
console.log("ok: cards");
```

**Walkthrough 3: the holy grail, measured.** The file is `holy-grail.html`, and building it is Exercise 1; the stage here only proves the shape. Five regions, one parent, the areas from Fig 2, and the CSS is the named-areas block from the idea, the one with `.page-header { grid-area: header; }` and its four siblings. On your machine the parent is `min-height: 100vh` and each region has its own background so the shape is obvious. The stage is the same shape in a shorter frame, and the script checks the two facts that matter: the header is as wide as the page, and the nav's right edge meets the main's left edge.

```html stage=grail
<div id="page">
    <header>Guild</header>
    <nav>Nav</nav>
    <main>Main</main>
    <aside>News</aside>
    <footer>Footer</footer>
</div>
```

```js live=grail
const page = document.getElementById("page");
page.style.display = "grid";
page.style.gridTemplateColumns = "90px 1fr 90px";
page.style.gridTemplateRows = "auto 1fr auto";
page.style.gridTemplateAreas = '"header header header" "nav main aside" "footer footer footer"';
page.style.minHeight = "240px";
page.style.gap = "6px";
page.style.width = "100%";
["header", "nav", "main", "aside", "footer"].forEach((name) => {
  const el = page.querySelector(name);
  el.style.gridArea = name;
  el.style.padding = "8px";
  el.style.background = name === "main" ? "#16161A" : "#0D0D10";
});
const pageBox = page.getBoundingClientRect();
const headerBox = page.querySelector("header").getBoundingClientRect();
const navBox = page.querySelector("nav").getBoundingClientRect();
const mainBox = page.querySelector("main").getBoundingClientRect();
console.log("header width", Math.round(headerBox.width), "page width", Math.round(pageBox.width));
console.log("header spans the page:", Math.abs(headerBox.width - pageBox.width) < 8);
console.log("nav sits left of main:", navBox.right <= mainBox.left + 1);
console.log("ok: grail");
```

The responsive version of this file is Exercise 2. Do not start it from the desktop string. Start it from the single column, and let the queries add the flanks.

## Where it breaks

Layout fails by applying a property to the wrong element, or by declaring a track on an element that is not a grid. Both look like "flex does not work."

```html stage=broken
<ul id="row">
    <li>One</li>
    <li>Two</li>
    <li>Three</li>
</ul>
<div id="fake">
    <div>A</div>
    <div>B</div>
</div>
```

```js live=broken
function oneRow(parent) {
  const tops = [...parent.children].map((el) => Math.round(el.getBoundingClientRect().top));
  return new Set(tops).size === 1;
}
const row = document.getElementById("row");
row.querySelectorAll("li").forEach((li) => { li.style.display = "flex"; });
console.log("display:flex on each child, the items share a row:", oneRow(row));
row.style.display = "flex";
row.style.gap = "12px";
row.style.listStyle = "none";
row.style.padding = "0";
row.style.margin = "0";
console.log("display:flex on the parent, the items share a row:", oneRow(row));
const fake = document.getElementById("fake");
fake.style.width = "240px";
fake.style.gridTemplateColumns = "1fr 1fr";
console.log("columns declared, display still block, one row:", oneRow(fake));
fake.style.display = "grid";
console.log("display:grid added, one row:", oneRow(fake));
console.log("ok: broken");
```

**Flex on the children.** `display: flex` affects an element's children, not its siblings. Putting it on each `li` makes each item a flex container of its own text, and the items still stack, because their parent is an ordinary list. The first line of the panel is `false`. The second is `true`, after the property moves to the `ul`. When a row refuses to be a row, the parent is where you look.

**Tracks without a grid.** `grid-template-columns: 1fr 1fr` on a block does nothing you can see. The property is waiting for `display: grid`, the same way `justify-content` waits for `display: flex`. The third line is `false`. The fourth, after the switch, is `true`. Inspect the element. If the grid badge is missing in the Styles panel, you have not turned the system on.

**A scrollbar you did not mean.** `100vw` includes the width and then the vertical scrollbar takes some of it back, and the page grows sideways. A fixed `200px` sidebar plus a `1fr` column is safe. A row of nav links with `flex-wrap: nowrap` and no query is not, once the phone arrives. Drag the window to 320 pixels wide before you call a layout done. If it scrolls sideways, something has a width that cannot shrink: a long word, an image without `max-width: 100%`, a `min-width` larger than the screen, or a track whose minimum cannot shrink, which is what a bare `minmax(280px, 1fr)` is on a 320-pixel phone with padding on either side. `min(280px, 100%)` inside the `minmax` is the usual cure. So is letting the sidebar drop under the story, which is what the 768 query is for.

**`fr` of nothing.** A single column of `1fr` inside a parent whose width is the content, which is also `1fr`, can collapse to zero in some nestings. Give the page a width it can resolve: the body is already the viewport. If a grid collapses, the parent has no definite width. Set one, or stop nesting a fractional track inside an indefinite one.

**Source order and `order`.** Moving a card visually with `order` leaves it where it was for the keyboard and the screen reader. If the visual order is the real order, change the HTML. The property is a last resort, not a design tool.

## Your turn

`html-css-foundations`, Live Server on, the device toolbar open (Cmd+Shift+M on a Mac, Ctrl+Shift+M everywhere else, or the icon of a phone in the DevTools corner). Drag the width as you go. A layout you have not watched resize is a layout you have not finished.

**Exercise 1: the holy grail (20 minutes).** `holy-grail.html` and `holy-grail.css`. A parent with five children: header, nav, main, aside, footer. Desktop is Fig 2: `200px 1fr 200px`, three rows `auto 1fr auto`, the areas string from the idea, `min-height: 100vh`, a gap, and a distinct background on each region so you can see the cells. The nav holds a list of at least four links. The main holds a heading and two paragraphs. The aside holds a short list of news. Checkpoint: the footer sits at the bottom of the viewport when the main is only two lines, which is the `1fr` row doing its job.

**Exercise 2: the same page, three widths (20 minutes).** Replace the desktop-only template with the mobile-first stack from the idea. Under 768, one column, in the order header, nav, main, aside, footer. At 768, nav on the left spanning the main and the aside, header and footer across both columns. At 1024, the full grail. No horizontal scrollbar at 320, at 768, or at 1024. Text still readable. Checkpoint: drag slowly through 768 and 1024 and name, out loud, which query just started applying.

**The formation drill (the rest of the session).** `formation.html` and `formation.css`. A portfolio of quests you have actually finished in this path: the journal, the quest log, the dotfiles, the guild board, the about page, the potion shop. Six cards minimum.

1. A navigation bar in flex: the name on the left, the links on the right, from 768 up. Below that, both stack and center.
2. A hero, centered on both axes, `min-height: 50vh`, one sentence and your name.
3. A grid of at least six cards, `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`, so requirement 9 holds without a query.
4. Each card is a flex column. The title, one sentence, a reward or a status, and the status pinned to the bottom with `margin-top: auto`.
5. A footer with centered text.
6. At least two `min-width` queries. The nav stack can be one of them, written as the base rather than as an override.
7. Spacing in `rem`. One `clamp()` on the hero heading.
8. Custom properties for the colors and the font, from last session.
9. No horizontal scrollbar from 320 pixels up. Check it at 320, 768, and 1024.
10. An image anywhere on the page has `max-width: 100%` and an `alt`.

Stretch, in order. A row of skill badges that is itself a flex wrap. `position: sticky; top: 0` on the nav, so it stays put while the cards scroll; give it a background or the cards will show through. A hover on the cards that changes the border color, not the layout, so nothing jumps. Named areas for the page around the grid, so the hero, the grid, and the footer are cells. A "back to top" link in the footer pointing at the header's id.

Ship it.

```bash
git add .
git status
git commit -m "Add the flex bar, the holy grail, and the formation drill"
git push
```

## The quest

Before Session 2.4, on `html-css-foundations`:

- `layout-demo.html`, the bar and the wrapping card grid.
- `holy-grail.html`, correct at the three widths, footer at the bottom of a short page.
- `formation.html`, the ten requirements, checked at 320, 768, and 1024.
- `potion-shop.html`: the three cards in a `repeat(auto-fit, minmax(min(280px, 100%), 1fr))` grid instead of a stack, checked at 320. One rule on the container that holds the cards, and the cards sit next to each other.
- `about-me.html` responsive: a flex or a grid where a column used to be, and at least one `min-width` query. It has to look meant on a phone.

Play [Grid Garden](https://cssgridgarden.com/) through. The frogs were flex. The garden is grid, and the properties it drills are the ones in Fig 2. Then read the [transitions guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions) and the [BEM overview](https://css-tricks.com/bem-101/). Transitions are how a hover stops being a snap. BEM is how a stylesheet stays readable once more than one person, including you next month, has to find a rule. Both are the next session. Twenty-five minutes for the two readings.

Budget two to three hours if the drill did not get finished. Push before you stop.

## Side quests

Three pages in the library look further down roads you walked today. They are written for later units, so read the opening and the first picture, not the code.

## Before next session

Finish the garden. If a level asks for a line number and an area name, you already have both: Fig 2 is that level.

Spend ten minutes resizing a site you respect, with the device toolbar, from 320 to 1440. Watch the nav. Watch the cards. Decide whether they used a query or whether the columns simply stopped fitting. You can tell: a query changes the shape at a specific width, all at once, and `auto-fit` changes the count whenever another minimum fits.

Next time: Enchantments. Transitions, transforms, images that do not break the grid you just built, and a naming scheme so the stylesheet can grow. The formation stays. It learns to move.

> **Say:** "Flex is one axis: justify-content moves along it, align-items moves across it, and direction decides which way is which. Grid is both axes at once: name the areas, then point each element at its name. repeat(auto-fit, minmax(280px, 1fr)) wraps by itself; a media query is for when the layout actually changes shape. Write the phone first; a min-width query adds a layout for that width and everything wider. Grid places the regions; flex arranges what is inside a region."

Same company. A formation, and a narrower one they already knew. The ground can change width now. The line still holds.
