---
title: "Cards and the link grid"
lede: "After the hero, both sites repeat one card: a dark surface, a hairline, a lift on hover, and a grid of them."
verified: 2026-11-07
exec: n/a
verified_note: "Link grid, card, and hover rules were read from the explore, about, and connect sections of both stylesheets."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout
---

# Cards and the link grid

## The link grid

King Chrissy's explore section is a grid of destinations: icon, label, and a short line, each cell a link. xoxoshayla's "01 EXPLORE" is the same pattern. The grid is `display: grid` with a gap around `16px` to `24px`, and the columns come from `repeat(auto-fit, minmax(240px, 1fr))` or an explicit count you will collapse later. Auto-fit means you do not write a media query to go from four cards to two. The minimum track width does it.

Each cell is a block link, not a heading with a tiny "click here" under it. The whole card is the hit target. Padding lives on the card, at least `22px`. The label is the display face. The description is the muted body color.

## The hover lift

xoxoshayla's pill already lifts with `translate: 0 -2px`. Cards lift a little more and change the border. A typical rule:

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: translate .25s var(--ease), border-color .25s;
}
.card:hover {
  translate: 0 -4px;
  border-color: rgb(var(--accent-rgb) / .45);
}
```

King Chrissy uses `transform: translateY(-2px)` on buttons in the build notes. `translate` as a property and `transform` do the same paint. Do not animate `top` or `margin`. Those move layout. Translate moves paint.

The section heading above the grid is centered on xoxoshayla (`.section-head { text-align: center }`) except the founder block, which is left-aligned on purpose. One centered header, then the grid. Two competing headers in one band is noise.

## About stats

King Chrissy's about block is a short paragraph and a row of numbers. The number is the display face, large. The label under it is mono or the body face, small, uppercase, muted. Flexbox with `justify-content: space-between` or a three-column grid. The numbers are not a table. They are a flex row that wraps.

## Where a card breaks

A grid with `1fr 1fr 1fr` and no `minmax` overflows when the card's content has a long unbreakable word. `minmax(0, 1fr)` or `overflow-wrap: anywhere` on the title fixes it. A hover that changes `height` or `padding` makes the cards below jump. Lift with translate, which does not affect the siblings. And a card that is also a link needs `text-decoration: none` and a visible `:focus-visible` outline, or keyboard users lose the only affordance the mouse got from the lift.

## Write the grid

Under the hero, add one section. Centered eyebrow and heading. A grid of six cards. Each card is a link with a title and one sentence. Hover lifts and recolors the border. Under that, a row of three stats. Use the tokens. Do not invent a new radius.
