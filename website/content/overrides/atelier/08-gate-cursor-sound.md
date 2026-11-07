---
title: "Gate, cursor, and sound"
lede: "The welcome gate, the custom cursor, and the mute button are the pieces that feel like a site and break first if you mix up CSS and script."
verified: 2026-11-07
exec: n/a
verified_note: "Gate, cursor, and mute rules were read from both gift stylesheets. The cursor is limited to fine pointers."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
changes:
  - "2026-11-07: a Read this first paragraph marks the gate, cursor and sound as optional polish on the Unit 2 deliverable, and a four-row dependency list names the CSS you can write now, the JavaScript event each effect needs, and the session (3.5 or 3.6) that teaches it."
  - "2026-11-07: Write the gate shell gains a numbered keyboard-only walkthrough with the expected focus ring after each step, the tabindex of -1 and .focus() hand-off to the first heading, Escape doing nothing, and what a screen reader announces."
  - "2026-11-07: Write the gate shell is split into a Now, from 2.4 half (the shell, the classes, the hidden state, the fade tested by adding .is-leaving in DevTools) and an After Session 3.5 half that holds the click handler as one labelled code block to paste later; the keyboard walkthrough says which steps work before the handler exists."
---

# Gate, cursor, and sound

## The welcome gate

**Read this first.** The page without any of these effects is already the deliverable of Unit 2: the character sheet from [2.5](/path/2-5-the-character-sheet-forge/) ships with no gate, no custom cursor and no sound, and loses nothing. The gate, the cursor and the mute button are optional polish, and each one is two halves. The CSS half, the classes and the stylesheet rules on this page, is this unit's and you can write it now. The JavaScript half, the click that adds the class, the `transitionend` that hides the gate, the line that moves focus, and the `play()` that may only run after a user gesture, is unlocked in [3.5](/path/3-5-casting-on-the-world/) (Casting on the World) and [3.6](/path/3-6-the-arena/) (The Arena). Until then, write the classes and leave the page ungated.

| Effect | CSS you can write now | JavaScript event it needs | Session that teaches it |
|---|---|---|---|
| The gate opens on Enter | `.gate`, the ring, `.gate.is-leaving` fading and scaling | a `click` listener that does `classList.add("is-leaving")` | 3.5, events and `classList` |
| The gate is removed after the fade | the `opacity` and `transform` transition on `.gate` | `transitionend`, then set `hidden` (the moment 2.4 said could wait) | 3.5, the event object |
| Focus lands inside the page | a visible `:focus-visible` ring on the first heading | `heading.focus()` on an element with `tabindex="-1"` | 3.5, `.focus()` after a submit |
| Sound starts, and the mute button toggles it | `.mute-btn`, `.active`, `.muted` | `audio.play()` inside the same click handler, never on load | 3.6, one click driving a run of state changes |

The cursor is the fifth piece and the one to leave for last: its CSS is the two elements and the fine-pointer query below, and its script is a `mousemove` listener, the same `addEventListener` from 3.5 with a different event name.

xoxoshayla's `.gate` is `position: fixed; inset: 0; z-index: 2000`, a grid that centers its content. A video or poster sits behind it, `object-fit: cover`, darkened with `filter: brightness(.4)`. A scrim gradient sits above the video and under the type. The enter control is a pill with a ring: `::before` is a larger rounded border, animated with `gate-ring` so it breathes. `.gate.is-leaving` fades and scales to `1.02`, then the script sets `hidden`. `.gated .nav` is invisible until the gate is gone, so the nav does not flash behind it.

King Chrissy's loader is the smaller version of this idea. The gate is the version with a choice: enter, or enter silent. The silent control is a text button, not a second pill. Two pills of equal weight means no decision.

The gate is not a cookie banner. It is the front door. It leaves. It does not come back on the next scroll.

## The cursor

King Chrissy hides `.cursor` and `.cursor-follower` by default and shows them only inside `@media (hover: hover) and (pointer: fine)`. A phone has no hover and no fine pointer. A custom cursor there eats taps. On a mouse, the dot follows the pointer and the ring lags. The script writes `transform: translate` to the two elements. The stylesheet sizes them, colors them with the accent, and sets `pointer-events: none` so they do not steal clicks. Hiding the real cursor with `cursor: none` on `body` belongs inside that same media query. Outside it, people cannot see where they are tapping.

## The mute button

King Chrissy's `.mute-btn` is fixed, round, and hidden until `.active`. Hover scales it and rotates it a few degrees. `.muted` drops the gold and the pulse. xoxoshayla's note calls this the Chrissy-pattern music control: one button, the song only. The audio element is in the HTML with no `autoplay` you cannot explain. The button is the only way the sound starts, after the gate, because browsers block sound a page starts by itself. The stylesheet does not call `play()`. The script does, on the click that also adds the class.

## Class versus stylesheet

If you are writing `element.style.opacity` in a loop, the motion belongs in a class. If you are reading `scrollY` or a click, that belongs in script, and the script's only job is `classList.add`. The gate's leaving state, the mute state, and the cursor's expanded state on a link are all classes. The coordinates of the cursor are the exception: they are a position, and a class cannot hold a coordinate.

## Where it breaks

A gate at `z-index: 2` loses to a nav at `z-index: 100`, so the door never covers the bar. A cursor with `pointer-events: auto` blocks the button under it. A mute button that is only an icon with no accessible name is invisible to a screen reader. Give it an `aria-label` that changes with the state.

## Write the gate shell

**Now, from 2.4 (CSS only).** Build the fixed gate: poster, scrim, eyebrow, title, one enter pill. Write the three states as classes and nothing else: `.gate` as it looks on load, `.gate.is-leaving` with the `opacity` and `transform` transition, and `.gate[hidden] { display: none }` for the state after it has gone. Add `.gated .nav { visibility: hidden }` so the nav is not reachable behind the door. No script yet, so nothing adds those classes: test the fade by selecting `.gate` in the DevTools Elements panel and typing `is-leaving` into its class list, then ticking `hidden` in the attributes. If the fade runs and the gate disappears, the CSS half is done and the page ships ungated until Unit 3. Do not add a custom cursor unless you also add the fine-pointer query and `pointer-events: none`. A mute button can be a second step. Sound stays off until the click that does not exist yet.

**After Session 3.5.** This is the JavaScript half, in one block. Do not paste it before 3.5 has shown you `addEventListener`, the event object and `.focus()`; until then the words in it are not yours yet. When it is time, it goes at the bottom of the page's script.

```js
// after Session 3.5: the click that opens the gate
const gate = document.querySelector(".gate");
const enter = gate.querySelector("button");
enter.addEventListener("click", () => {
  gate.classList.add("is-leaving");                       // the fade the CSS half already describes
  gate.addEventListener("transitionend", () => {
    gate.hidden = true;                                   // the moment 2.4 said could wait
    document.body.classList.remove("gated");              // the nav comes back
    document.querySelector("h1").focus();                 // needs tabindex="-1" on the h1
  }, { once: true });
});
```

Then test the gate with the mouse unplugged. Each step says where the focus ring should be when the step ends. Steps 1, 2 and 5 work today with the CSS half alone; steps 3, 4 and 6 need the block above, so run them again after 3.5.

1. Load the page. Nothing is focused yet; the ring is nowhere. The gate covers the nav, so there is nothing else to reach.
2. Press Tab. The ring is on the Enter pill, because it is a `<button>` and the only focusable thing inside the gate. If the ring lands on a nav link instead, the nav is reachable behind the door: put `visibility: hidden` on `.gated .nav`, not only `opacity: 0`, because opacity leaves links in the tab order.
3. Press Enter. The click handler adds `.is-leaving`, the fade runs, and `transitionend` sets `hidden`. The ring vanishes with the button; a removed button cannot hold focus, and if the script does nothing more, focus falls back to the body and the next Tab starts from the top of the document.
4. So the `transitionend` step of that handler ends with `document.querySelector("h1").focus()`, on an `h1` that carries `tabindex="-1"`. The ring is now on the page's first heading. Minus one means scriptable but not in the Tab order, so the heading is never a tab stop on its own; it only receives focus when the gate hands it over.
5. Press Escape before entering, on a fresh load. Nothing happens and the ring stays on the Enter pill. The gate is a front door, not a dialog, and there is no close.
6. Press Tab once more after entering. The ring moves from the heading to the first link in the nav, which is now visible. That is the whole proof: Tab, Enter, heading, nav, in that order, with a ring you can see at every stop.

With a screen reader on, step 2 announces "Enter, button" (give the pill real text, not an icon alone); step 4 announces the heading's text and "heading level 1", which tells the listener the door is open and where they are; the mute button, when it exists, announces its `aria-label`, "Mute music" or "Play music", and must change that label with the state.
