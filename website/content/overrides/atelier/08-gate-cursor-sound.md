---
title: "Gate, cursor, and sound"
lede: "The welcome gate, the custom cursor, and the mute button are the pieces that feel like a site and break first if you mix up CSS and script."
verified: 2026-11-07
exec: n/a
verified_note: "Gate, cursor, and mute rules were read from both gift stylesheets. The cursor is limited to fine pointers."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
---

# Gate, cursor, and sound

## The welcome gate

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

Build the fixed gate: poster, scrim, eyebrow, title, one enter pill. Clicking enter adds `.is-leaving` and then hides the gate. Do not add a custom cursor unless you also add the fine-pointer query and `pointer-events: none`. A mute button can be a second step. Sound stays off until that click.
