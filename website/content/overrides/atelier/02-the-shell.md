---
title: "The shell"
lede: "Before a hero exists, both sites reset the page, set a container, and name the pieces every section will reuse."
verified: 2026-11-07
exec: n/a
verified_note: "The reset, container, skip link, eyebrow, and pill were read from the two gift stylesheets."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model
---

# The shell

## The reset

King Chrissy zeroes margin and padding on `*`, sets `box-sizing: border-box`, and tells `img` to be `display: block` with `max-width: 100%`. Links inherit color and lose the underline: `a { color: inherit; text-decoration: none; }`. Buttons inherit the font and lose the browser border. xoxoshayla does the same job with a shorter reset and then adds the skip link. If you skip this, every later measurement is fighting the browser's default margin on `body` and `h1`.

## The container

xoxoshayla's container is one class: `width: calc(100% - 96px); max-width: 1200px; margin: auto`. King Chrissy uses `max-width: 1400px; margin: 0 auto` on the nav inner and the hero content. The number changes. The idea does not. The page has one measure, and sections sit inside it. A section that is `width: 100%` with padding of its own, and a child that is also `width: 100%` with padding, double-counts the gutter. Pick one place for the gutter.

## Section rhythm

xoxoshayla gives every band `.section { padding: 160px 0 }`. That is the breath between a hero and a grid. King Chrissy names the same idea under "Section Common." A page with `padding: 16px` on every section looks like a form. A page with `160px` looks like the gift sites. On a phone you will cut that number in the breakpoint lesson. You do not start there.

## The skip link

xoxoshayla's skip link is `position: fixed; top: -100px` and, on `:focus`, `top: 24px`. It is a pill: lilac background, dark text, `border-radius: 999px`. Keyboard users get it. Mouse users never see it. King Chrissy does not need a different pattern. If the link is in normal flow, it shoves the nav down for everyone.

## Eyebrows and pills

The eyebrow is the small uppercase line above a heading. xoxoshayla: `font: 600 13px/1.6 var(--font-display); letter-spacing: .2em; text-transform: uppercase; color: var(--lilac)`. A section head adds a 32px champagne rule with `::before`. The pill is the button: `min-height: 56px`, `padding: 14px 32px`, `border-radius: 999px`, `inline-flex`, centered. `.pill.primary` is the accent fill with dark text. `.pill.ghost` is a hairline and the body color. Hover lifts it: `translate: 0 -2px`. King Chrissy's buttons are the same job with the gold.

## Write the shell

Take the `:root` from the last lesson. Add the reset, one `.container`, one `.section`, a skip link, an eyebrow, and one primary pill. Put a heading and the pill inside a section, inside the container. Nothing else. The page should already feel like a gift site with no hero yet.
