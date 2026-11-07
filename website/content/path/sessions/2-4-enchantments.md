---
editorial: true
title: Enchantments
subtitle: Animations, Transforms, Images, and BEM
hook: "The page is structured, colored, and arranged, and it is still a still picture. A hover that eases, a card that lifts, a spinner that turns, a photograph that fits its frame: motion and fit are how a page tells you it can be touched. The names have to stay readable while you add them, which is what BEM is for."
read: 60
artifact: "enchantments.html, a small workshop of four components in BEM: buttons that lift, a card that lifts and recolors its title, a spinner built from keyframes, and a navigation underline that grows with scaleX; one image in a fixed frame with object-fit; prefers-reduced-motion respected; committed and pushed"
diagrams:
  - fig1-transition
  - fig2-transform
  - fig3-keyframes
  - fig4-bem
  - fig5-image-frame
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transforms/Using_CSS_transforms
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/object-fit
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-fill-mode
  - https://css-tricks.com/bem-101/
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility
say:
  - "a transition is the trip between two values of one property; name the property, the duration, and the curve"
  - "a transform paints the element somewhere else and leaves its layout box where it was"
  - "keyframes are a list of stops that can run on their own; forwards means stay on the last stop"
  - "cover fills the frame and crops; contain keeps every pixel and leaves bars"
  - "two underscores mean part of, two hyphens mean a version of, and every selector stays one class"
---

## The hook

The skeleton is named, the armor is on, and the formation holds when the window changes width. What you have is a page a person can read. What you do not have yet is a page that answers. A button that changes color between one frame and the next feels broken, even when the color is the right one. A card that lifts by a few pixels, on a curve, over a fifth of a second, feels like it was finished. The difference is not decoration. It is a signal: this can be touched, and the interface noticed.

> *The enchanter did not add a new bone. She put a breath in the ones already there. The clasp rose a finger's width when a hand came near, and settled when the hand left. A lantern at the gate turned, not because anyone wound it, but because turning was what it had been told to do, stop after stop, and then again. The people who preferred the room still got the room still. The enchantment knew when to be quiet.*

Today is that breath. **Transitions** move one value to another when something changes, usually a hover. **Transforms** move, turn, and scale the paint without shoving the layout. **Keyframe animations** are a list of stops that can run on their own: a spinner, a fade-in, a pulse. Then two pieces of craft that keep the motion from becoming a mess. **Images** have to fit the frames the grid made, on purpose, with `object-fit` and `aspect-ratio`. **BEM** is a way of naming classes so a card's title cannot collide with a nav's title, and so every selector stays a single class. Last session you learned that specificity fights are optional. BEM is how you decline them.

You will also learn when not to move. Some people get sick from motion. A query, `prefers-reduced-motion`, is how the page agrees to be still for them. It is not optional polish. It is part of the enchantment being polite.

The stages on this page cannot hold a `<style>` block, so a transition is started by setting the property from the script, and a spinner is run with the same frames the CSS would use. The blocks above each stage are the file you save. The stage is the proof that the browser will interpolate, and that a transform does not push its neighbor.

## The idea

### The trip between two values

A transition is a smooth change from the value a property has to the value it is about to have. Without one, hover snaps. With one, hover travels.

```css
.btn {
    background-color: #00a868;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn:hover {
    background-color: #007838;
    transform: translateY(-2px);
}
```

The hover rule is only the destination. The transition, written on the resting rule, is the journey. Put it on the resting rule so the trip runs in both directions: into the hover, and back out of it. A transition that lives only on `:hover` animates in and snaps back.

![](diagram:session-2-4/fig1-transition)

Four knobs, usually written as one shorthand: property, duration, timing function, delay.

`transition-property` is what is allowed to travel. Name the properties. `all` is a convenience that also animates things you did not mean to, including a width change from a stylesheet you forgot. List them.

`transition-duration` is how long. A tenth to a third of a second is the range that feels like a response. Two seconds is a demonstration, useful once, so you can see the curve, and then you put it back. Anything under about a tenth of a second reads as a snap. Anything over half a second on a hover reads as the interface lagging behind the hand.

`transition-timing-function` is the curve. `ease` starts and ends slowly, which is what a lift wants. `linear` moves at one speed, which is what a spinner wants and a hover usually does not. `ease-in` starts slow and arrives fast. `ease-out` starts fast and settles, which is the one to try when ease feels sluggish. `ease-in-out` does both. They are the same trip with a different pace. You are choosing a pace, not a different animation.

`transition-delay` waits before starting. Zero, unless you are staggering a row of things on purpose.

Not every property can travel. Color, background, opacity, transform, shadow, border color: yes, they are numbers or colors, and numbers can be halfway. `display` cannot be halfway between `none` and `block`. With the default transition behavior it switches immediately. Modern CSS can coordinate that switch with a fade using [`transition-behavior: allow-discrete`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transition-behavior), but it still does not invent a halfway display value. For this workshop, transition opacity and transform and leave display alone.

One more rule, the performance one. `transform` and `opacity` are cheap. The browser can hand them to the compositor and not redo layout. `width`, `height`, `margin`, `top`, and `padding` are expensive, because every frame asks the page to remeasure. A card that grows on hover should `scale`, not change its width. A card that rises should `translateY`, not a negative margin. The picture is the same. The cost is not.

### The paint and the box

A transform changes where an element is painted, how big it is painted, or how it is turned. It does not change the rectangle layout reserved for it. The neighbors stay. The gap stays. Hover a card with `translateY(-8px)` and the card below does not drop. That is the feature. If you wanted the card below to drop, you wanted margin, and you will also get the expensive reflow.

![](diagram:session-2-4/fig2-transform)

```css
.translate { transform: translateY(-8px); }
.rotate    { transform: rotate(8deg); }
.scale     { transform: scale(1.03); }
.combo     { transform: translateY(-8px) rotate(-2deg); }
```

Several functions go in a single `transform`. Writing a second `transform` declaration replaces the first. It does not add. The order inside the one declaration is the order they apply: translate, then rotate, is not the same picture as rotate, then translate, because rotation happens around the origin and then the translation moves the result, or the other way around. For a hover lift you need one function and the order does not matter. For a stamp that spins out from a corner, it does.

`transform-origin` is the pivot. The default is the center. `top left` spins around the corner. It is not a movement of its own.

`scale(1.03)` on a card is about as much growth as still looks intentional. `scale(1.2)` is a lunge. `translateY(-2px)` is a button. `translateY(-8px)` is a card. Past that you are juggling, and the shadow has to grow with the lift or the card looks like it left its light behind. A shadow is `box-shadow`, and it transitions cleanly: from `none` or a tight shadow at rest, to a wider, softer one on hover.

`:active` is the pressed state. A button that rose on hover should come back down while the mouse is down, `translateY(0)`, so the press has a bottom. Release, and the hover lifts it again, if the pointer is still there. Three states. Rest, hover, pressed. Each one is a rule. The transition between them is one declaration.

### A list of stops

A transition has two stops and needs a trigger. A keyframe animation has as many stops as you write, and it can start by itself, loop, and stay finished.

![](diagram:session-2-4/fig3-keyframes)

```css
@keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

@keyframes fade-in-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}

.spinner {
    animation: spin 0.8s linear infinite;
}

.hero__title {
    animation: fade-in-up 0.8s ease forwards;
}
```

The shorthand is name, duration, timing function, delay, iteration count, direction, fill mode. You will not need all of them every time. You will need `forwards` whenever the animation's job is to arrive somewhere and stay. Without it, the element plays the last stop and then snaps back to the rule it had before the animation. A title that fades in and then vanishes was missing `animation-fill-mode: forwards`. The other value people meet is `both`, which also applies the first stop during the delay, so a delayed fade stays invisible while it waits instead of flashing the finished state and then disappearing. If the subtitle waits 0.3 seconds, set its opacity to 0 in the resting rule as well, and use `forwards` or `both`. Otherwise the delay shows the subtitle at full opacity, then the animation starts from invisible. That blink is the bug.

`infinite` loops. A count of `3` plays three times and, without `forwards`, ends at the start. `alternate` plays forward, then backward. A spinner wants `linear` and `infinite`. A pulse wants `ease-in-out` and `infinite`. An entrance wants `ease` and `forwards` and exactly one play.

`animation-delay` staggers. Three dots that bounce, with delays of `-0.32s`, `-0.16s`, and `0s`, are the same animation started at different points in its cycle. A negative delay begins partway through, which is how they avoid stepping in unison. The negative number does not mean "wait negative time." It means "pretend this much of the animation already happened."

### Names that say where they live

BEM is not a tool. Nothing to install. It is three rules for class names.

A **block** is a component that means something alone: `.quest-card`, `.navbar`, `.btn`. An **element** is a part of that block, written with two underscores: `.quest-card__title`, `.navbar__link`. A **modifier** is a version, written with two hyphens: `.quest-card--featured`, `.btn--danger`, `.quest-card__badge--legendary`.

![](diagram:session-2-4/fig4-bem)

The element name repeats the block. That looks long the first afternoon and saves you the first time two components both want a class called `.title`. `.quest-card__title` cannot collide with `.navbar__title` because they are different strings. You do not write `.quest-card .title` anymore. The descendant was only doing the job the longer name does in the open, and the descendant was two elements of specificity, which is how last session's fights started. A BEM class is one class. The column stays at one. A modifier is a second class on the same element, still one column, and source order or the order you wrote the two rules decides the rest. You already know how to referee that.

The HTML carries both the block and the modifier: `class="quest-card quest-card--featured"`. The modifier does not replace the block. It adds. The element does not include the modifier of the block in its own name unless the element itself varies: `.quest-card__title` is the title of every card, featured or not. `.quest-card__badge--legendary` is a badge that has a legendary version.

### The frame and the picture

The grid from last session made boxes. Photographs do not arrive in the shape of those boxes. A card image at `height: 200px` and `width: 100%` will stretch a portrait into a pancake unless you say how the pixels meet the frame.

![](diagram:session-2-4/fig5-image-frame)

`object-fit: cover` fills the frame and crops whatever does not fit. That is the one for cards and heroes, where an even row matters more than seeing the corner of the photo. `object-fit: contain` keeps every pixel and leaves bars. That is the one for a diagram, a logo, or a product shot that must not lose an edge. `fill`, the old default when you set both width and height, stretches. You almost never want `fill`. Say `cover` or `contain` out loud when you set the height, so the choice was a choice.

`aspect-ratio: 16 / 9` holds the frame to a ratio so the height follows the width and a missing image does not collapse the card. Pair it with `object-fit` and `width: 100%`. `display: block` on the image removes the gap that inline images leave under themselves, a few pixels of line-height that read as a mysterious margin.

`max-width: 100%` and `height: auto` is still the rule for an image in a column of text, where there is no fixed frame. The fixed frame is for when the layout, not the file, decides the shape.

Two files for two screens is `srcset` and `sizes`, or a `<picture>` with a `<source>` per range. The browser picks. You still write one `img` with an `alt`, because the source that matches is what gets shown and the `img` is the fallback and the accessible name. Do not ship a card image with an empty alt unless it is decorative, and a quest banner is not decorative. This page cannot fetch a set of hero files, so the stage uses a drawing packed into the address. On your machine, use real files, and run them through something that compresses them before they go in the repository. A four-megabyte photograph in a 300-pixel card is a slow page with a small picture.

> **Note:** Six sentences to drop before the file. *Transitions and animations are the same*: a transition is two values and a trigger, an animation is a list of stops that can run alone. *Motion needs JavaScript*: the stylesheet does the UI. Script is for when the motion depends on data. *Animate everything*: motion is a signal, and a page of signals is noise, and some of your readers need none. *Transform changes where the element sits in the layout*: it changes where it is painted. *BEM is a library*: it is a spelling rule. *The names are too long*: `.quest-card__title` is findable. `.ct` is a puzzle you will lose.

## The demonstration

The file is `enchantments-demo.html` and `enchantments-demo.css`. The head is the boilerplate, the viewport, and the stylesheet link. Skip the Google Fonts line unless you want it. The body is a workshop: a row of buttons, a spinner, a card. BEM from the first class.

**The buttons.** Rest, hover, pressed. The transition lives on `.btn`. The destinations live on `:hover` and `:active`. Modifiers only change color.

```css
.btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid transparent;
    border-radius: 6px;
    font: 600 1rem/1 "Segoe UI", sans-serif;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease,
                transform 0.2s ease, box-shadow 0.3s ease,
                border-color 0.3s ease;
}

.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.3);
}

.btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 4px rgb(0 0 0 / 0.2);
}

.btn--primary {
    background: #00a868;
    color: #07110c;
}

.btn--primary:hover { background: #007838; }

.btn--danger {
    background: transparent;
    color: #f03038;
    border-color: #f03038;
}

.btn--danger:hover {
    background: #f03038;
    color: #07110c;
}
```

Set the duration to `2s` once, hover, and watch the curve. Then put it back. `ease`, `linear`, and `ease-out` on that slow one are the three paces. The stage runs the lift as a real CSS transition and asks the browser how many animations that transition became. Then it settles, so you can hover the card yourself. The listeners are only here. In the file, `:hover` is the whole mechanism.

```html stage=lift
<article id="card">
    <h3 id="title">Slay the dragon</h3>
    <p>A short quest, so the lift is the point.</p>
    <button type="button">Accept</button>
</article>
```

```js live=lift
const card = document.getElementById("card");
card.style.padding = "16px";
card.style.background = "#16161A";
card.style.borderRadius = "8px";
card.style.borderLeft = "4px solid #00A868";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
card.style.transition = reduced ? "none" : "transform 400ms linear, box-shadow 400ms linear";
card.style.transform = "translateY(0px)";
card.addEventListener("mouseover", () => {
  card.style.transform = reduced ? "none" : "translateY(-8px)";
  card.style.boxShadow = "0 12px 24px rgb(0 168 104 / 0.35)";
});
card.addEventListener("mouseout", () => {
  card.style.transform = "translateY(0px)";
  card.style.boxShadow = "none";
});
if (!reduced) requestAnimationFrame(() => {
  card.style.transform = "translateY(-12px)";
  requestAnimationFrame(() => {
    console.log("transition started, animations running:", card.getAnimations().length);
  });
});
if (!reduced) setTimeout(() => { card.style.transform = "translateY(0px)"; }, 700);
console.log("ok: lift");
```

**The spinner.** Two stops, linear, forever. The dots are one animation and three delays. This is also where BEM shows up in the names: `.spinner-dots` is the block, `.spinner-dots__dot` is the element.

```css
@keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgb(255 255 255 / 0.2);
    border-top-color: #00a868;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
    .spinner { animation: none; }
}
```

The query is the polite part. A reader who has asked the operating system for less motion gets a still ring. The information was never in the spinning. The stage does the same check: if reduced motion is on, it does not leave the ring turning.

```html stage=spin
<div id="ring"></div>
```

```js live=spin
const ring = document.getElementById("ring");
ring.style.width = "40px";
ring.style.height = "40px";
ring.style.border = "4px solid rgb(255 255 255 / 0.2)";
ring.style.borderTopColor = "#00A868";
ring.style.borderRadius = "50%";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduced) {
  console.log("reduced motion is on, so the ring stays still");
} else {
  const anim = ring.animate(
    [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
    { duration: 800, iterations: Infinity, easing: "linear" }
  );
  console.log("spinner state:", anim.playState);
}
console.log("ok: spin");
```

On your machine the same motion is the `@keyframes` rule, not a script. The stage uses the Web Animations API because this page is not allowed to insert a stylesheet. The frames are the ones in the CSS above.

**The names.** Take a card written with nested selectors and flatten it. Before: `.card .title` and `.card.featured`. After: `.quest-card__title` and `.quest-card--featured`. The stage is the after, and the script reads every class and says which kind it is. A name with `__` is an element. A name with `--` is a modifier. A name with neither, on this card, is the block. Anything that does not start with `quest-card` does not belong on it.

```html stage=bem
<article id="card" class="quest-card quest-card--featured">
    <p class="quest-card__badge quest-card__badge--legendary">Legendary</p>
    <h3 class="quest-card__title">Slay the dragon</h3>
    <p class="quest-card__description">A short quest with a long name, on purpose.</p>
    <p class="quest-card__reward">500 gold</p>
</article>
```

```js live=bem
const card = document.getElementById("card");
const names = new Set();
card.querySelectorAll("*").forEach((el) => el.classList.forEach((name) => names.add(name)));
card.classList.forEach((name) => names.add(name));
names.forEach((name) => {
  const kind = name.includes("__") ? (name.includes("--") ? "element modifier" : "element")
    : name.includes("--") ? "block modifier" : "block";
  console.log(kind.padEnd(18), name);
});
console.log("classes:", names.size, "· each one is a single class, specificity (0, 1, 0)");
console.log("ok: bem");
```

The underline on a nav link, for the lab, is the one place a pseudo-element earns its keep. `.navbar__link` is `position: relative`. Its `::after` is an empty bar, `position: absolute`, a height of 2 pixels, full width, `transform: scaleX(0)`, origin on the left. The hover sets `scaleX(1)`. The transition is on `transform`. The bar grows from the left. No extra element in the HTML. No width being animated.

## Where it breaks

Three failures that look like the enchantment is broken, and one that is the enchantment being rude.

```html stage=broken
<div id="mover">This one is painted lower.</div>
<div id="next">This one should not move.</div>
<div id="pop">This one is about to be display: none.</div>
```

```js live=broken
const mover = document.getElementById("mover");
const next = document.getElementById("next");
const before = Math.round(next.getBoundingClientRect().top);
mover.style.transform = "translateY(40px)";
const after = Math.round(next.getBoundingClientRect().top);
console.log("neighbor's top before the translate:", before);
console.log("neighbor's top after a 40px translate:", after);
console.log("layout box stayed put:", before === after);
const pop = document.getElementById("pop");
pop.style.transition = "display 1s linear";
pop.style.display = "none";
console.log("display was asked to take 1s. It is already:", pop.style.display);
console.log("ok: broken");
```

**The neighbor did not move.** Forty pixels of `translateY` and the next element's top is the same number. The painted box went down. The layout box stayed. If your hover is shoving the card under it, you used margin or top. Switch to a transform. If you needed the flow to change, the transform was the wrong tool, and you should accept the reflow on purpose.

**`display` does not take a second.** The panel says it is already `none`. There is no halfway display. If you want something to leave smoothly, transition `opacity` to 0 and, when the transition ends, set `display`. That ending is one of the few moments a transition needs a line of script, `transitionend`, and it can wait until you have a reason. For a hover, opacity is enough and the element can stay in the layout, invisible.

**The fade that snaps back.** `animation-fill-mode` left at `none`. The last keyframe plays and the element returns to its resting rule, which for a fade-in is often `opacity: 0` if you set that so the delay would not flash. The title appears and vanishes. Add `forwards`.

**Motion for someone who asked for less.** A spinner, a pulse, and a card that travels eight pixels are three different sizes of ask. The query turns the first two off. The lift can stay or go. Put the query at the bottom of the file so it wins:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

This is the rare `!important` that is earning its place: it has to beat durations you wrote on purpose, in a file you control, because the user's request outranks the flourish. Do not copy the habit into colors.

**A tall image in a short frame, stretched.** Both width and height set, no `object-fit`. The face is wide. Add `object-fit: cover` or stop setting the height and let the ratio hold the frame. And an image with no `alt` is still unfinished, motion or not.

## Your turn

`html-css-foundations`. Live Server. Hover with the mouse, and then turn on reduced motion in the rendering panel of DevTools and hover again.

**Exercise 1: one card (20 minutes).** `animated-card.html`. A `.quest-card` centered with flex, `max-width: 350px`. Transition `transform` and `box-shadow` over `0.3s ease`. Hover lifts it `translateY(-8px)` and adds a green-tinted shadow. The title transitions its color, and `.quest-card:hover .quest-card__title` is the rule that changes it, so the color moves when the card is hovered, not only when the title is. The button has its own hover. Every class is BEM. Badge, description, footer, reward. Checkpoint: the card under it, if you add a second, does not jump.

**Exercise 2: the hero (20 minutes).** `animated-hero.html`. A section, `min-height: 100vh`, centered on both axes. `@keyframes fade-in-up` from opacity 0 and `translateY(16px)` to opacity 1 and no translation. The title plays it once, `0.8s`, `forwards`. The subtitle plays it with `animation-delay: 0.3s`. Its base `opacity: 0` keeps it hidden during the delay; `forwards` keeps the final visible state after the animation. [`both`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-fill-mode) can instead apply the first keyframe during the delay and keep the last one afterward. The call to action pulses, `scale(1)` to `scale(1.05)` and back, `2s`, `ease-in-out`, `infinite`, and also changes background on hover. BEM: `.hero__title`, `.hero__subtitle`, `.hero__cta`. The link's `href` can be `#top` if the section has `id="top"`.

**The workshop (the rest of the session).** `enchantments.html` and `enchantments.css`. A style guide of four components, each in its own section.

1. At least three buttons: primary, secondary, outline. Hover changes color, shadow, and transform. Active presses back down. Durations between `0.15s` and `0.4s`.
2. A card with the lift from exercise 1, BEM all the way through.
3. A spinner made only of CSS. A ring, or three dots with staggered negative delays. `@keyframes` with more than two stops somewhere on the page, the pulse counts.
4. A navigation whose underlines grow with `::after` and `scaleX`, from 0 to 1, origin on the left.
5. One image in a frame: `aspect-ratio: 16 / 9`, `object-fit: cover`, `width: 100%`, an `alt` that describes that image.
6. `prefers-reduced-motion` at the bottom, so the spinner and the pulse stop.
7. The page still works at 320 pixels. The button row wraps. Nothing scrolls sideways.
8. No class outside BEM. If you cannot say the block a class belongs to, it is not named yet.

Stretch, in this order. A tooltip that fades in, positioned, not a title attribute. A card that turns over with `rotateY(180deg)` and `backface-visibility: hidden`, which is fiddlier than it looks and a good hour. The reduced-motion query you already have, checked in DevTools rather than assumed. An accordion is optional and is the one place a `max-height` transition is the usual hack. Know that it is a hack.

Ship it, and if the potion shop from 2.2 is still in generic class names, rename it in the same commit or the next one. The homework is that rename plus two motions on `about-me.html`.

```bash
git add .
git status
git commit -m "Add the enchantments workshop and rename the shop to BEM"
git push
```

## The quest

Before Session 2.5, pushed:

- `enchantments.html` meeting the eight requirements, including reduced motion and one covered image.
- `animated-card.html` and `animated-hero.html`, the hover and the entrance.
- The potion shop's classes rewritten as BEM, still the same page when you look at it.
- `about-me.html` with two motions: a hover and an entrance is a good pair. Not five.

Read the [GitHub Pages](https://pages.github.com/) overview, ten minutes. The next session puts a page on the internet at a URL, and the reading is how that URL gets made. Read the [accessibility overview](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility), the opening only. You have been doing pieces of it since the alt text and the labels. The overview is the list those pieces belong to.

A short preview, because Unit 4 will hand it to you whether or not you go looking. SCSS is CSS with a compiler in front of it. Variables written `$primary`, selectors nested inside selectors, and mixins, which are reusable blocks that take arguments. Browsers never see SCSS. A compiler emits the CSS. Everything you wrote this unit is already valid SCSS, so a file can be renamed and adopted one component at a time. Nesting feels like the descendant selectors BEM just got you out of. Keep it to two or three levels, or the emitted CSS comes back more specific than you wanted. Native custom properties already cover the variables. Mixins are the part CSS still does not have. You do not need this for the workshop. You will recognize it when a codebase hands it to you.

## Side quests

Three pages in the library look further down roads you walked today. They are written for later units, so read the opening and the first picture, not the code.

## Before next session

Turn reduced motion on, reload the workshop, and confirm the spinner is still. Turn it off and confirm the lift is back. That is the whole test, and it takes a minute.

Then open a site you think is polished and hover one button slowly enough to see the duration. Guess it. Check in the Styles panel. You will usually be within a tenth of a second, and that calibration is the skill. The rest is knowing which property is allowed to travel.

Next time: the character sheet. One landing page that uses the skeleton, the armor, the formation, and a little of today's motion, and then it goes on the internet with GitHub Pages. Bring a picture of yourself or a mark you are willing to publish, and a sentence about what you are building. The enchantments stay small. The page is the point.

> **Say:** "A transition is the trip between two values of one property. Name the property, the duration, and the curve. A transform paints the element somewhere else and leaves its layout box where it was. Keyframes are a list of stops that can run on their own, and forwards means stay on the last stop. Cover fills the frame and crops. Contain keeps every pixel and leaves bars. Two underscores mean part of. Two hyphens mean a version of. Every selector stays one class."

The bones did not change. They learned a breath, and they learned when to hold it.
