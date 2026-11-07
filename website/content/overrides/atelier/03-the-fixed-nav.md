---
title: "The fixed nav"
lede: "The nav is fixed, blurs when you scroll, and grows an underline. The menu is a second layer, not a second site."
verified: 2026-11-07
exec: n/a
verified_note: "Nav, underline, and mobile menu rules were read from both gift stylesheets."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/position
---

# The fixed nav

## Fixed and scrolled

xoxoshayla's nav is `position: fixed; top: 0; left: 0; right: 0; height: 82px; z-index: 100`, with a transparent bottom border. `.nav.scrolled` adds `background: rgb(8 8 10 / .88)`, `backdrop-filter: blur(24px)`, and a visible border. King Chrissy does the same job at a slightly different height. JavaScript adds the class when `scrollY` passes a few pixels. The stylesheet does not listen for scroll. If you paint the blur on the nav at rest, the hero never shows through it, and the scrolled state has nothing to do.

The brand sits on the left. The links sit on the right with `margin-left: auto` or a flex row with `justify-content: space-between`. The links are uppercase, about `12px`, letter-spaced, and muted until hover, when they take the accent.

## The growing underline

Both files draw the underline with a pseudo-element, not `text-decoration`. xoxoshayla:

```css
.nav-links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  right: 100%;
  height: 1px;
  background: var(--lilac);
  transition: right .25s var(--ease);
}
.nav-links a:hover::after { right: 0; }
```

`right: 100%` makes the line zero width. Hover sets `right: 0` and the line grows from the left. King Chrissy's `.nav__link::after` is the same move in gold. A `border-bottom` cannot grow from one side. The pseudo-element can.

## The hamburger

King Chrissy hides `.nav__links` until `768px` and shows `.nav__toggle`, two spans. `.nav__toggle.active span:first-child` rotates `45deg` and the last span rotates `-45deg`, so the two bars become an X. xoxoshayla's `.hamburger { display: none }` until the breakpoint section turns it on. The button is at least 44px square. A 16px icon with no padding fails a thumb.

## The full-screen menu

`.mobile-menu` is `position: fixed; inset: 0`, invisible until `.open`. The links start translated down and faded, and `.mobile-menu.open .mobile-menu__link` brings them to `opacity: 1` and `translateY(0)`, each with a longer `transition-delay`. That stagger is the only animation. The menu is not a second page with its own stylesheet. It is the same links, stacked, `flex-direction: column`, `gap: 40px`, centered.

## Where the nav breaks

`position: fixed` removes the nav from flow, so the hero slides under it unless the hero has `padding-top` equal to the nav height, or the first section does. A `z-index` of `1` loses to a later transformed hero. And `backdrop-filter` on a fully opaque background does nothing visible. The scrolled background has to be translucent or the blur is a lie.

## Write the nav

Build the fixed bar, the brand, four links, and the growing underline. Add a button that toggles `.open` on a full-screen menu with the same four links. Do not add a hero yet. Scroll the page and confirm the bar changes when the class is present. At a narrow width, the row of links hides and the button shows. You will write the query in the breakpoint lesson. For now, a `max-width` media block of a few lines is enough to see the swap.
