---
title: "Motion"
lede: "The loader, the marquee, and the scroll reveal are CSS. JavaScript only adds or removes a class."
verified: 2026-11-07
exec: n/a
verified_note: "Loader, marquee, reveal, and reduced-motion rules were read from both stylesheets."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
---

# Motion

## The loader

King Chrissy's `.loader` covers the viewport until `.loader.hidden` sets `opacity: 0`, `visibility: hidden`, and `pointer-events: none`. The crown pulses with `loaderPulse`. A bar fills with `loaderFill`, from `width: 0` to `width: 100%`. `body.loading { overflow: hidden }` stops the page scrolling behind it. The script removes the loading class when the font or the first image is ready, or after a short timeout. The stylesheet does not know about load events. If you leave the loader in the document with no way to add `.hidden`, the site never appears.

## The marquee

Both footers have a moving strip of words. The track is a flex row, the words duplicated so the loop has no gap, and the animation translates the track by `-50%` because the second copy is identical to the first. Linear, infinite. King Chrissy names it under "Marquee." xoxoshayla groups it with the footer. A marquee that is one copy jumps when the animation repeats. Two copies, translated halfway, do not.

Pause it when the pointer is over it if the words are links. Otherwise a click is a guess.

## Scroll reveal

xoxoshayla's `.entry-reveal` starts at `opacity: 0` and `translateY(18px)`, and `.is-revealed` brings it back. The class is added by an `IntersectionObserver` after the gate has opened. The comment in the file says the class is added by script so a page with no JavaScript still shows the content. That order matters. If the hidden state is in the HTML from the start and the script never runs, the sections are invisible. King Chrissy's reveal block is the same contract: the motion is a class, and the content exists without it.

## Entry choreography

After the gate, xoxoshayla plays three delays: `.site-entered .hero-copy` at once, `.hero-image` at `.1s`, `.stats` at `.25s`, all using `entry-reveal` keyframes from `translateY(22px)` to rest. One keyframe, three delays. You do not write three animations.

## Reduced motion

xoxoshayla ends the file with a reduced-motion block. King Chrissy owes the same. Inside `@media (prefers-reduced-motion: reduce)` you set `animation: none` and `transition: none` on the marquee, the orbs, the loader pulse, and the hover lift. You do not remove the content. A user who asked for less motion still gets the page. They just get it still.

## Write one reveal

Add a loader you can dismiss, or skip it and add the reveal. Three sections start without the hidden class. A few lines of script add `.entry-reveal` and then `.is-revealed` when each section crosses the viewport. Then write the reduced-motion query that flattens the animation. Check it with the browser's reduced-motion emulation. The sections stay visible.
