---
editorial: true
title: Armor and Cosmetics
subtitle: CSS Fundamentals, the Cascade, and Specificity
hook: "The skeleton from last session is sound, and it looks like a form from 1997. CSS is the armor: a separate file of rules that says which elements look like what. The work today is the system underneath the paint, because a rule that does not apply is almost never a mystery. It lost a fight you can learn to referee."
read: 60
artifact: "style.css linked from about-me.html, with a border-box reset, a dark header, card sections, hover states and custom properties for the colors and the type; css-playground.html proving element, class and descendant selectors; and potion-shop.html with potion-shop.css, three product cards, no inline styles, committed and pushed"
diagrams:
  - fig1-rule-homes
  - fig2-specificity-ladder
  - fig3-box-model
  - fig4-selector-map
  - fig5-custom-properties
docs:
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/What_is_CSS
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Specificity
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors
  - https://css-tricks.com/snippets/css/a-guide-to-flexbox/
  - https://flexboxfroggy.com/
say:
  - "a rule is a selector and a list of declarations, and it lives in a file the head links to"
  - "when two rules disagree, compare the columns from the left: inline, then id, then class, then element"
  - "a tie goes to whichever rule comes later in the file; !important is how you stop being able to fix it"
  - "padding is inside the box and gets painted; margin is outside and does not; width includes both once border-box is on"
  - "style with classes; an id is for a link target and for a script, not for a color"
---

## The hook

The skeleton is up. Headers, sections, articles, a form, a footer, all named, all in the tree. And if you opened `about-me.html` this morning you already know the problem. White page, black type, blue underlined links, the browser's own clothes, which it has been wearing since the nineties. Structurally it is a page. Visually it is a government form. Nobody stops scrolling for a government form.

> *The armorer did not touch the bones. She walked around the frame with a tape and called out numbers, and an apprentice wrote them on a slate: this plate on the chest, this green on the clasp, this much air between the ribs and the steel. When she changed one number, the clasp and the trim and the banner all changed with it, because they had been cut from the same note. The skeleton underneath was the one from yesterday. It did not notice it had been dressed.*

CSS, Cascading Style Sheets, is that slate. It is a separate language from HTML. HTML says what a region is. CSS says how it looks: color, type, space, a line around a card, what a link does when a pointer rests on it. Every site you have ever admired is a skeleton with a careful stylesheet on top, and the careful part is not a talent. It is a small system. A rule names its targets and lists its orders. When two orders disagree, the cascade picks a winner by a procedure you can do on paper. Once that procedure is boring, you can style anything, because a style that "does not work" has stopped being a haunting and become one of three checks.

By the end of today the about page from last session's quest wears real armor: a dark header, cards, type you chose, colors that live in one place so changing one changes all of them. You will also have a potion shop, built from nothing, with the same system. The stages on this page cannot contain a `<style>` tag, because this lesson's own rules forbid one, so the scripts apply the same declarations as inline styles and then measure what the browser actually did. That is a worse way to write CSS, and the page will show you why, and then you will not write it that way in the file.

## The idea

### A rule, and where it lives

A CSS rule has two parts. The **selector** names the elements. The **declaration block**, inside the braces, is a list of orders, each a property, a colon, a value, and a semicolon.

```css
h1 {
    color: #1a1a2e;
    font-size: 2.5rem;
}
```

`h1` is the selector. `color` and `font-size` are properties. `#1a1a2e` and `2.5rem` are values. Forget the semicolon and the next line gets swallowed into this one, and both declarations fail, quietly. One declaration per line, while you are learning, so the failure has an address.

`2.5rem` is worth a sentence now. A `rem` is the root font size, which is 16px unless someone changed it. `2.5rem` is 40px at that default, and it grows if a reader has asked their browser for larger type. A `px` does not. Use `rem` for type and for the space that should travel with type. Use `px` for a hairline border, where growing would look like a mistake. `65ch` is the width of about sixty-five zeros, which is as long as a line of text wants to be. You will put it on paragraphs.

There are three places a rule can live, and two of them are traps.

![](diagram:session-2-2/fig1-rule-homes)

**Inline**, on the element: `<h1 style="color: #1a1a2e">`. It works, it cannot be shared with the next page, and it beats every rule in every stylesheet. You will watch it win in the second stage, and then you will stop using it.

**Internal**, a `<style>` block in the head. Legitimate for a ten-minute experiment in a file nobody else will open. The moment a second page wants the same header, you are copying, and the copies will drift.

**External**, a file called `style.css`, pulled in by one line in the head:

```html
<link rel="stylesheet" href="style.css">
```

The `href` is relative, same as an image. The file sits next to the HTML. The browser asks for it as one of the follow-up requests from last session, after the HTML arrives. From this session on, new rules go in that file. The HTML stays a skeleton. One stylesheet can dress every page in the repository, which is the whole economy of the thing.

### Who wins

The C in CSS is the cascade, and it is the part people skip, and then they spend a year adding `!important` because their perfectly correct rule keeps losing. It is losing to a procedure. The procedure, in order:

1. **Importance.** A declaration marked `!important` is pulled out of the normal fight and beats one that is not. Two of them then fight each other by the rules below.
2. **Specificity.** The more pointed selector wins.
3. **Source order.** Same specificity, the one later in the file wins. The earlier one is struck through in DevTools, still visible, not applied.

Specificity is four columns, compared from the left, and it is not a sum. The columns are: inline style, then ids, then classes (and attribute selectors, and pseudo-classes like `:hover`), then elements (and pseudo-elements).

```css
p                /* (0, 0, 1)  one element */
.intro           /* (0, 1, 0)  one class */
p.intro          /* (0, 1, 1)  a class and an element */
#welcome         /* (1, 0, 0)  one id */
#welcome .title  /* (1, 1, 0)  an id and a class */
```

Fig 2 writes those three columns: ids, then classes, then elements. The inline column sits to their left, and for a normal rule it is empty. It is full only for a declaration written in a `style` attribute, which is why that attribute beats an id.

A column to the left dominates any number in the columns to its right. One class beats a hundred elements. One id beats a hundred classes. An inline style beats an id. This is why the shortcut you will see in old posts, "id is 100, class is 10, element is 1, add them up," is a trap past nine. Eleven elements would add to 11 and appear to beat a class. They do not. Compare the columns. Do not add.

![](diagram:session-2-2/fig2-specificity-ladder)

The practical consequence is a habit. **Style with classes.** They are reusable, and they sit in the weak column, so a later class can still be overridden by another class without a war. An id is unique on the page, which makes it a good anchor for a link and a good hook for a script, and a bad hook for a color, because the color then takes an id to override. Keep the id column empty in your stylesheets and you will rarely need `!important`.

`!important` is the trapdoor in Fig 2. It wins, and the next person who needs to win against it, often you, next week, reaches for a second one. The file fills up with them and source order stops meaning anything. The legitimate use is a library you cannot edit, whose selector is stronger than anything you are willing to write. Your own code is not that library. If a rule is losing, the fix is a selector that honestly outranks the winner, or moving the winner. DevTools will show you the winner. Right-click the element, Inspect, and read the Styles panel. Struck through means it matched and lost. Not listed means the selector never matched, which is a typo or a file that is not linked.

### The box

Every element is a rectangle. A circle is a rectangle with rounded corners. The rectangle has four layers, and the arguments people have about spacing are arguments about which layer they meant.

![](diagram:session-2-2/fig3-box-model)

**Content** is the words or the image. **Padding** is air between the content and the border, inside the box, and the background paints it. **Border** is the line, which you can set to zero and still have, invisibly. **Margin** is air outside the border, between this box and its neighbors, and the background does not paint it. That last sentence is the whole difference between margin and padding. If you want the green to extend past the words, it is padding. If you want the green to stop and then empty space, it is margin.

```css
.card {
    width: 300px;
    padding: 20px;                 /* all four sides */
    padding: 10px 24px;            /* top and bottom, then left and right */
    padding: 8px 16px 24px 16px;   /* top, right, bottom, left, clockwise from noon */
    border: 2px solid #1a1a2e;
    border-radius: 8px;
    margin: 24px auto;             /* 24 above and below, auto on the sides */
}
```

`margin: 24px auto` only centers a block that has a width. Auto eats the leftover horizontal space in equal shares. A block with no width is already as wide as its container, so there is no leftover, and auto does nothing you can see.

Then the number that bites. By default, `width: 300px` is the content only. Padding and border are added. Twenty pixels of padding on each side and a three-pixel border make the box 346 pixels wide on the page, and the layout overflows by 46, and you blame the parent. `box-sizing: border-box` changes the contract: the 300 includes the padding and the border, and the content shrinks to fit. Every stylesheet you write for the rest of this path starts with this, before any other rule:

```css
*,
*::before,
*::after {
    box-sizing: border-box;
}
```

The star is the universal selector. It matches everything, including the `::before` and `::after` boxes you have not met yet, which is why they are named. Put it at the top so you never have to think about the other contract again.

Two more words, because they explain why a `span` will not take a width. **Block** elements (`p`, the headings, `section`, `header`, `div`) stretch to fill the line and start on a new one. **Inline** elements (`span`, `a`, `strong`, `em`) sit in the line and ignore `width`, `height`, and vertical margin. **Inline-block** sits in the line and accepts a width. `display: none` removes the element from the layout entirely, as if it were not in the tree. You will measure inline and inline-block in the box stage, so the definitions have numbers under them.

> **Note:** Three sentences to retire before the file. *Margin and padding are the same kind of space*: padding is inside and painted, margin is outside and empty. *If it does not apply, add !important*: it lost on specificity or it never matched, and DevTools will say which. *An id and a class are interchangeable ways to style*: an id is ten classes strong and can exist only once, so a color hung on an id is a color you will have to fight.

## The demonstration

Three stages, matching the three fights: painting a page, refereeing a conflict, and measuring a box. The CSS you save is in the blocks. The stages apply those declarations as inline styles, on purpose, so you can see an inline style beat the lesson page's own rules for the stage. That victory is the inline column, the one you are not going to use in `style.css`.

**Walkthrough 1: dress the about page.** In `html-css-foundations`, next to `about-me.html`, create `style.css`. In the head of the HTML, after the viewport line, add the link. Then this is the file. It is the curriculum's page, with the colors pulled forward into custom properties so the second exercise is a change and not a rewrite. Read it once before you type it, against Fig 4: every selector is aimed at a region you already built.

![](diagram:session-2-2/fig4-selector-map)

```css
/* style.css — the armor for about-me.html */

*,
*::before,
*::after {
    box-sizing: border-box;
}

:root {
    --color-primary: #1a1a2e;
    --color-accent: #00A868;
    --color-bg: #f5f5f5;
    --color-surface: #ffffff;
    --color-text: #333333;
    --font-body: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    --space-md: 16px;
    --space-lg: 32px;
}

body {
    margin: 0;
    font-family: var(--font-body);
    font-size: 16px;
    line-height: 1.6;
    color: var(--color-text);
    background-color: var(--color-bg);
}

h1, h2, h3 {
    font-size: 2rem;
    color: var(--color-primary);
    margin: 0 0 0.5em;
}

p {
    margin: 0 0 1em;
    max-width: 65ch;
}

a {
    color: var(--color-accent);
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

header {
    background-color: var(--color-primary);
    color: white;
    padding: 20px 40px;
}

header h1 {
    color: white;
}

nav ul {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
}

nav li {
    display: inline-block;
    margin-right: 20px;
}

nav a {
    color: var(--color-accent);
    font-weight: 700;
}

nav a:hover {
    color: white;
}

main {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-lg) 20px;
}

section {
    background-color: var(--color-surface);
    padding: var(--space-lg);
    margin-bottom: var(--space-lg);
    border-radius: 8px;
    border: 1px solid #dddddd;
}

img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

footer {
    background-color: var(--color-primary);
    color: white;
    text-align: center;
    padding: 20px;
}

footer a {
    color: var(--color-accent);
}
```

A few lines that do more work than they look. `header h1` is a descendant selector, and it exists because the grouped `h1, h2, h3` rule already paints headings in the dark primary. A heading inside the dark header would be dark on dark. Two elements, `(0, 0, 2)`, beat one element, `(0, 0, 1)`, so the white wins, and only for a heading inside the header. The other headings stay dark. That is the cascade doing a small, correct thing.

`max-width: 65ch` on `p` keeps a line readable. `max-width: 800px` and `margin: 0 auto` on `main` centers the column once the window is wider than 800. `nav li { display: inline-block }` is how a list becomes a row without flexbox, which is next session; today this is enough, and it is also the moment an inline element learns to take horizontal margin. `:hover` is a pseudo-class. It adds a class-column point, so `a:hover` beats `a`, and `nav a:hover` beats `nav a`. The underline comes back only while the pointer is there.

`img { max-width: 100%; height: auto }` stops a portrait from blowing out the card. The height follows the width, so the picture does not stretch.

The stage is that page's body. Press **Run live** and watch the defaults get replaced. Then read the two lines about the heading: before the script paints it, the heading keeps this lesson page's own heading color rather than taking one from the header, because a rule that names the heading directly beats anything it would inherit, and the two numbers differ even if both look pale on a dark panel. `header h1` in the file is that same repair, with white.

```html stage=armor
<header>
    <h2>Arthur the Adventurer</h2>
    <nav>
        <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#skills">Skills</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
</header>
<main>
    <section id="about">
        <h3>About</h3>
        <p class="intro">I woke up in a terminal and decided to build things worth looking at.</p>
    </section>
    <section id="skills">
        <h3>Skills</h3>
        <ul>
            <li>The terminal</li>
            <li>Git and GitHub</li>
            <li>Semantic HTML</li>
        </ul>
    </section>
    <section id="contact">
        <h3>Contact</h3>
        <p>The form from last session still works. This section is where the link lands.</p>
    </section>
</main>
<footer>
    <p>Built in Unit 2. The armor is CSS.</p>
</footer>
```

```js live=armor
const heading = document.querySelector("header h2");
console.log("heading color before any inline style:", getComputedStyle(heading).color);
document.body.style.background = "#f5f5f5";
document.body.style.color = "#333333";
document.body.style.fontFamily = "Segoe UI, Tahoma, sans-serif";
document.body.style.lineHeight = "1.6";
const header = document.querySelector("header");
header.style.background = "#1a1a2e";
header.style.color = "#ffffff";
header.style.padding = "20px 28px";
heading.style.color = "#ffffff";
heading.style.margin = "0";
const list = document.querySelector("nav ul");
list.style.listStyle = "none";
list.style.padding = "0";
list.style.margin = "10px 0 0";
document.querySelectorAll("nav li").forEach((li) => {
  li.style.display = "inline-block";
  li.style.marginRight = "18px";
});
document.querySelectorAll("nav a").forEach((a) => {
  a.style.color = "#00A868";
  a.style.fontWeight = "700";
  a.style.textDecoration = "none";
  a.addEventListener("mouseover", () => { a.style.color = "#ffffff"; });
  a.addEventListener("mouseout", () => { a.style.color = "#00A868"; });
});
const main = document.querySelector("main");
main.style.maxWidth = "720px";
main.style.margin = "0 auto";
main.style.padding = "28px 16px";
document.querySelectorAll("section").forEach((section) => {
  section.style.background = "#ffffff";
  section.style.color = "#333333";
  section.style.padding = "24px";
  section.style.borderRadius = "8px";
  section.style.border = "1px solid #dddddd";
});
document.querySelectorAll("section h3").forEach((h) => { h.style.color = "#1a1a2e"; });
document.querySelector(".intro").style.maxWidth = "65ch";
const footer = document.querySelector("footer");
footer.style.background = "#1a1a2e";
footer.style.color = "#ffffff";
footer.style.textAlign = "center";
footer.style.padding = "16px";
footer.querySelector("p").style.color = "#ffffff";
console.log("heading color after the inline style:", getComputedStyle(heading).color);
console.log("ok: armor");
```

On your machine, save the CSS and let Live Server reload. You should see the same transformation, and the hover will be a real `:hover` rather than the two listeners the stage needed, because an inline style has no way to say "only while the pointer is here." That inability is another reason the inline style is the wrong home.

**Walkthrough 2: a fight, with a winner you can name.** Add this paragraph somewhere in the about page, and add the three rules at the bottom of `style.css`. Then delete them. They are a demonstration, not a design.

```html
<p class="intro-text" id="welcome-message">What color am I?</p>
```

```css
p { color: green; }                 /* (0, 0, 1) */
.intro-text { color: blue; }        /* (0, 1, 0) beats the element */
#welcome-message { color: red; }    /* (1, 0, 0) beats the class */
```

Open DevTools, inspect the paragraph, and read the Styles panel from top to bottom. The id is applied. The class and the element are struck through. Take the id off the element and the class wins. Take the class off and the element wins. Put `!important` on the green, watch it beat the id, and then delete it and feel relieved.

The stage runs the same fight against this page's real stylesheet. `.muted` and `.lose` are both single classes, so they tie, and `.lose` comes later in this page's own stylesheet, so the line is red. The third line carries `.win` and `.lose`, and `.lose` is later than `.win` too, so it is red as well: same column, source order, no mystery. Then an inline style beats the class. Then `!important` beats the inline style. Then the script takes the inline style away and the class returns, which is the cascade being reversible, as long as you did not paint yourself into `!important`.

```html stage=specificity
<p class="muted">A class, and nothing stronger.</p>
<p id="welcome-message" class="muted lose">What color am I?</p>
<p class="lose win">Two classes. Same column. Later in the file wins.</p>
```

```js live=specificity
function paint(el) {
  return getComputedStyle(el).color;
}
const lone = document.querySelector("p.muted");
console.log("one class, .muted:", paint(lone));
const fight = document.getElementById("welcome-message");
console.log(".muted and .lose, and .lose is later in the file:", paint(fight));
const tied = document.querySelector(".lose.win");
console.log(".win and .lose, and .lose is later in this page's stylesheet:", paint(tied));
fight.style.color = "#E8D800";
console.log("after an inline style, which beats both classes:", paint(fight));
fight.style.setProperty("color", "#2FD48F", "important");
console.log("after !important, the trapdoor:", paint(fight));
fight.style.removeProperty("color");
console.log("inline removed, the class is back:", paint(fight));
console.log("ok: specificity");
```

**Walkthrough 3: measure the box.** Add a card, inspect it, and watch the box-model diagram in DevTools light up padding, then border, then margin as you hover the diagram. Then toggle `box-sizing` in the Styles panel, live, without saving, and watch the width jump. The stage does the arithmetic in public.

```css
.demo-card {
    width: 300px;
    padding: 20px;
    border: 3px solid #00A868;
    margin: 30px auto;
    background-color: #ffffff;
}
```

```html stage=boxes
<div id="card">
    <h3>Box model demo</h3>
    <p>The numbers in the panel are measured off this card.</p>
</div>
<p>
    <span id="chip">inline</span>
    <span id="blockish">was inline, then inline-block</span>
</p>
```

```js live=boxes
const card = document.getElementById("card");
card.style.width = "300px";
card.style.padding = "20px";
card.style.border = "3px solid #00A868";
card.style.margin = "16px auto";
card.style.background = "#16161A";
card.style.boxSizing = "content-box";
console.log("content-box offsetWidth:", card.offsetWidth, "(300 content + 40 padding + 6 border)");
card.style.boxSizing = "border-box";
console.log("border-box offsetWidth:", card.offsetWidth, "(the 300 now includes padding and border)");
const chip = document.getElementById("chip");
chip.style.display = "inline";
chip.style.width = "280px";
chip.style.background = "#F03038";
console.log("inline, told to be 280px wide, actually:", chip.offsetWidth);
const blockish = document.getElementById("blockish");
blockish.style.display = "inline-block";
blockish.style.width = "220px";
blockish.style.background = "#E8D800";
blockish.style.color = "#07110C";
console.log("inline-block, told to be 220px wide, actually:", blockish.offsetWidth);
console.log("ok: boxes");
```

Background on the card fills the padding and stops at the border. The margin is the gap around it, unpainted. The inline chip ignores its width. The inline-block one keeps it. Those two numbers are the display model from the idea, no longer a definition.

![](diagram:session-2-2/fig5-custom-properties)

**The variables, since the file already uses them.** Fig 5 is the move that makes a palette a decision instead of a scavenger hunt. A custom property is a name you invent, stored on an element, visible to that element and everything inside it. Put the palette on `:root`, which is the document itself, and every rule can see it. `var(--color-accent)` is the call. Change the value in `:root` and every caller moves, which you should prove: set `--color-accent` to `#E8D800` in DevTools, on the `:root` rule, and watch the links. Nothing else was edited. That is the success criterion of the second exercise, and you can feel it in thirty seconds.

The fonts come from somewhere else. Google Fonts gives you three `<link>` lines to paste in the head, above your stylesheet so the font is requested early. Pick one family for headings and one for body. This lesson page is not allowed to load them, its rules only load files from itself, so the stage cannot show Poppins. Your page can. After they load, DevTools' computed `font-family` on a heading names the one you chose, not the fallback. If it names the fallback, the link is wrong or the family name in CSS does not match the family name in the URL, character for character.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
```

```css
:root {
    --font-heading: "Poppins", sans-serif;
    --font-body: "Inter", sans-serif;
}

body { font-family: var(--font-body); }

h1, h2, h3 { font-family: var(--font-heading); }
```

The name in quotes is the family. The name after it, `sans-serif`, is the fallback for the moment before the file arrives, and for the reader whose browser refused the request. Always leave a fallback. A page that specifies only a remote font renders in an invisible type until the font shows up, or in a broken one if it never does.

## Where it breaks

CSS fails quietly. A bad property is dropped. A selector that matches nothing matches nothing. The page looks like you wrote no rule at all, which is why the first instinct is to write the rule again, louder. These four are the loud mistakes, and the stage measures two of them.

```html stage=broken
<p class="one">First paragraph, with a big margin underneath.</p>
<p class="two">Second paragraph, with a big margin on top.</p>
<span id="wide">I am inline, and someone set my width.</span>
<p id="spelling">The property on me is spelled the way a person spells it, not the way CSS spells it.</p>
```

```js live=broken
const first = document.querySelector(".one");
const second = document.querySelector(".two");
first.style.margin = "0";
second.style.margin = "0";
first.style.marginBottom = "40px";
second.style.marginTop = "40px";
const gap = second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
console.log("40px margin below the first and 40px above the second, the gap is:", Math.round(gap));
console.log("(if the margins had been added, that number would be 80. Vertical margins collapse to the larger one.)");
const wide = document.getElementById("wide");
wide.style.display = "inline";
wide.style.width = "800px";
wide.style.background = "#F03038";
console.log("inline width: 800px requested, offsetWidth is", wide.offsetWidth);
const spelling = document.getElementById("spelling");
const before = getComputedStyle(spelling).color;
spelling.style.setProperty("colour", "#E8D800");
console.log("colour (with a u) was dropped. color before:", before, "color after:", getComputedStyle(spelling).color);
console.log("ok: broken");
```

**Vertical margins collapse.** Forty plus forty is forty. The gap between those two paragraphs is the larger of the two margins, not the sum. This is the spec, and it is the reason "I added more margin and nothing happened" is usually true: the neighbor already had a margin at least that big. Horizontal margins do not collapse. Padding never collapses. If you want forty pixels of painted space, use padding. If you want a reliable gap inside a column of cards, padding on the parent, or a single margin on one side of each child, will do what you meant. Collapse is also why the first and last child's margins can escape the parent and appear outside it, when the parent has no padding and no border of its own. A single pixel of padding on the parent stops the escape. You will hit this the first time a heading's margin shows up above the card it lives in.

**Inline elements ignore width.** The red chip was asked for 800 pixels and came back about as wide as its sentence. The request did not apply. `inline-block` or `block` is the fix, and the box stage already showed the number changing when the display changed: the short word "inline" stayed near 40 pixels when told to be 280, and the same words as an inline-block kept the 220 they were given. Setting a width on a `span` or an `a` and wondering why the layout ignored you is this.

**A property the language does not have is dropped, with no error.** `colour` is not `color`. `font-color` is not a property. `background` is, `back-ground` is not. The declaration vanishes, the rest of the rule stands, and the computed value stays whatever it was. DevTools does not list the dropped declaration under Styles. The console of the browser will sometimes underline it in the source. Read the property name against a reference the first few dozen times. The spelling is American, and it is not going to meet you halfway.

**The three checks, in this order, whenever a rule seems to do nothing.** One: is the file linked? View Source and look for the `<link>`. A `href` with a typo, or a stylesheet saved in the wrong folder, means zero of your rules exist, and no amount of specificity will save a rule that was never loaded. Two: does the selector match? Inspect the element. If your rule is not in the Styles panel at all, the selector is wrong: a misspelled class, a descendant written in the wrong order (`a nav` is an anchor that contains a nav, which never happens), an id that is not on this element. Three: did it match and lose? It is in the panel and struck through. Read the rule above it that is not struck through. That is the winner. Beat it honestly, or remove it.

Two habits that are not in the stage because they are choices rather than parses. **Styling with an id**, then needing a variant, then reaching for `!important` because nothing else can beat the id. Start with the class and the fight never begins. **Copying a color in six places** instead of a custom property. The day you change the accent, you will find five of them. `:root` is the note the armorer kept on the slate.

## Your turn

Work in `html-css-foundations`, Live Server on, DevTools open. The stylesheet is the work. The HTML is the skeleton you already know how to write.

**Exercise 1: a playground (20 minutes).** `css-playground.html` linked to `playground.css`. At least six different elements: headings, paragraphs, a link, a list, an image, a blockquote. At least one element selector, at least three class selectors, at least one descendant selector. Each of those elements carries at least three properties. The universal border-box reset is the first rule in the file. The page should be obviously not the browser's defaults: if a stranger can tell you wrote CSS, it passes. Checkpoint: inspect one element and point at your rule in the Styles panel. If it is not there, it is check one or check two.

**Exercise 2: fonts and variables (20 minutes).** On `about-me.html`, add the Google Fonts links, then add `--font-heading` and `--font-body` to the `:root` you already have in `style.css`, and switch `body` and the headings to them. At least five custom properties, used with `var()` everywhere a color or a font or a spacing step repeats. Headings in one family, body in the other. Checkpoint: in DevTools, change `--color-accent` and watch every use of it move, without editing another line. Then look at a heading's computed font and read your family name, not the fallback.

**The potion shop (the rest of the session).** `potion-shop.html` and `potion-shop.css`. HTML first, all of it, then CSS. The requirements:

1. The stylesheet is external, linked from the head. No `style` attributes anywhere in the HTML. None.
2. The border-box reset is the first rule.
3. Custom properties for at least two colors, one font family, and two spacing values, used rather than repeated.
4. A header with the shop's name and a navigation list. Dark background, light text, the links in a row.
5. At least three product cards. Each has a name, a one-sentence description, a price, and the words "Add to cart" (text, not a working cart; the cart is a later unit). Each card has a background, padding, a border, a radius, and space between it and the next card.
6. A heading font and a body font, both actually loading.
7. At least one of each: an element selector, a class, an id, and a descendant. The id should be doing a job an id is for, a skip link or a named section, not a color you will want to reuse.
8. Hover on the navigation links and on the cards. A color, an underline, or a background. Something a person can see change.
9. A footer with its own background and centered text.
10. `main` held to a `max-width` and centered with `margin: 0 auto`.

Stretch, in order. A sale badge: one card also has a class that changes its border color, so you feel a second class win and lose nothing. A dark theme: duplicate the custom properties inside `body.dark` and toggle the class on `body` in DevTools; the page inverts because the rules call `var()`, not a hex. A table of ingredients with `tr:nth-child(even)` giving the even rows a different surface, which is a pseudo-class you have not needed until the data asked for it. `:focus` on any field, so a keyboard user can see where they are; the outline is theirs, do not remove it without replacing it.

When a card's margin escapes the section, you now know why. One pixel of padding on the section, or padding you already wanted, and it stays inside.

Ship it the way you shipped the guild board.

```bash
git add .
git status
git commit -m "Add the about-page armor and the potion shop"
git push
```

`git status` before you commit, so a font file you downloaded by accident, or a screenshot, does not ride along. The stylesheet and the HTML are the save.

## The quest

Before Session 2.3, pushed to `html-css-foundations`:

- `about-me.html` restyled: external stylesheet, custom properties, two fonts, box-model spacing, hover. A page you would send someone.
- `css-playground.html` meeting the selector counts.
- `potion-shop.html` and `potion-shop.css` meeting the ten requirements, with no inline styles, validated by the three checks rather than by hope.

Read the [Flexbox guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) once, twenty minutes, and bookmark it. Read the [Grid guide](https://css-tricks.com/snippets/css/complete-guide-grid/) the same way. Then play [Flexbox Froggy](https://flexboxfroggy.com/) through the first fifteen levels. You are not learning a new language there. You are building the reflex for the property that puts things in a row, which is the entire next session. The frogs are on the list because the columns you have now, cards stacked down the page, are about to stop being enough.

Budget two to three hours if the shop did not get finished. Push before you close the laptop.

## Side quests

Three pages in the library look further down roads you walked today. They are written for later units, so read the opening and the first picture, not the code.

## Before next session

Finish the frogs. If a level stalls you, say the sentence out loud: which axis, and which way. That sentence is most of flexbox, and Session 2.3 starts from it.

Spend ten minutes in DevTools on a site you think looks expensive. Inspect the header. Find the rule that sets its background, and notice whether it is a class, and how many of the rules under it are struck through. You are reading a cascade someone else is winning. Then change one padding, live, and reload to watch it snap back, because DevTools does not write your file. The file is still the only place a decision survives.

Next time: Formation Magic. Flexbox for a row or a column, grid for both at once, and the page rearranging itself when the window gets narrow. The armor you made today does not get replaced. It gets arranged. Keep the potion shop open next session; its cards are about to sit next to each other.

> **Say:** "A rule is a selector and a list of declarations, and it lives in a file the head links to. When two rules disagree, compare the columns from the left: inline, then id, then class, then element. A tie goes to whichever rule comes later in the file. !important is how you stop being able to fix it. Padding is inside the box and gets painted; margin is outside and does not; width includes both once border-box is on. Style with classes. An id is for a link target and for a script, not for a color."

The frame did not change. The numbers on the slate did. That is the whole of CSS, and you can referee it now.
