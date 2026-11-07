---
title: "The hero"
lede: "The hero is a split: type on one side, a portrait or a card on the other, with the type size written as clamp()."
verified: 2026-11-07
exec: n/a
verified_note: "Hero split, clamp titles, grain, and gradient text were read from both gift stylesheets."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
---

# The hero

## The split

King Chrissy's `.hero` is `position: relative` and at least a viewport tall. `.hero__bg` is `position: absolute; inset: 0`. The content sits above it with `z-index: 1` and the same `max-width: 1400px` as the nav. `.hero__split` becomes a row at `900px`: text in a column with `max-width: 700px`, the portrait on the other side. Below that width it stacks. xoxoshayla's hero is the same split, named `.hero-copy` and `.hero-image`. The portrait uses `object-fit: cover` and a fixed aspect ratio so a tall photo cannot blow the row open.

The title is not one line. King Chrissy uses `.hero__line` as stacked blocks, and `.hero__line--accent` paints the second line in gold. The tagline under it is muted, letter-spaced, and smaller than the title by a lot. If the tagline is the same size as the name, you do not have a title.

## Clamp titles

Both sites size the name with `clamp`. xoxoshayla's gate title uses `clamp(56px, 7.8vw, 112px)` on the big line and a smaller clamp on the line above it. King Chrissy's hero title is `clamp(48px, 8vw, 96px)` in the build notes, with `line-height` near `1` and `letter-spacing` slightly negative. `clamp(min, preferred, max)` means the phone gets a size you can read and the desktop gets a size that fills the column, without a media query for the type. A fixed `72px` title either overflows a phone or looks timid on a desktop.

## Grain and orbs

King Chrissy puts three `.hero__orb` blobs behind the type, each a radial gradient, absolutely placed, animated with `@keyframes orbFloat` so they drift. A `.hero__grain` layer covers the hero with a noise image at very low opacity. xoxoshayla uses the same noise as an SVG filter in a data URL, at `opacity: .03`, on the gate and as a fixed overlay. The grain is not a background image of a photograph. It is a texture on top of the flat `#08080A`, so the black is not a void. If the opacity goes past about `0.08`, the page looks dirty.

## Gradient text

xoxoshayla paints one line with a gradient and clips it to the glyphs:

```css
background: linear-gradient(105deg, var(--lilac-dark), var(--lilac-light));
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

King Chrissy does not need this for the gold line. A solid accent is enough. Use the gradient once, on the word that should feel lit. If every heading is a gradient, none of them is.

## Where the hero breaks

`100vh` includes the mobile browser chrome, so the hero can scroll a little on a phone. `100svh` is the small viewport and stays put. An absolute portrait with no height collapses. A `z-index` on the content without `position` does nothing, so the orbs paint on top of the type. And `color: transparent` without `background-clip: text` makes the heading disappear.

## Write the hero

Inside the container, make a grid or a flex row: a copy column and a portrait column. The copy has an eyebrow, a two-line title with one accent line, a muted lede, and the pill from the shell lesson. Size the title with `clamp`. Put a grain overlay on the hero. Stack the columns under `900px`. The nav from the last lesson stays fixed above it, and the hero's top padding clears that nav.
