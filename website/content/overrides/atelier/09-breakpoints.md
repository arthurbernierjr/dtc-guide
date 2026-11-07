---
title: "Breakpoints"
lede: "Both stylesheets write the wide layout first in spirit and then say, at a measured width, what stacks, what hides, and what the grid becomes."
verified: 2026-11-07
exec: n/a
verified_note: "Breakpoint blocks were read from the mobile-menu and breakpoint sections of both stylesheets."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries
---

# Breakpoints

## Mobile first

The shell lesson used `160px` of section padding and a container gutter of `96px`. Those numbers are the desktop. xoxoshayla's breakpoint block, near the end of the file, cuts the gutter, the nav padding, and the section padding when the viewport is narrow. King Chrissy does it under "Mobile Responsive" and also in the small queries already attached to the nav and the hero. Write the comfortable layout, then add a `max-width` query that simplifies it. Or write the narrow layout and add `min-width` queries that add the row. Both gift sites use `min-width` for the moment the row appears (`768px`, `900px`) and `max-width` for the moment the desktop chrome has to shrink. Pick one direction per rule and do not restate the same property in both.

## The hero stacks

King Chrissy turns `.hero__split` into a row only at `min-width: 900px`. Below that the text and the portrait stack, and the title's clamp already handled the type size. You still reduce `padding-top` so the fixed nav plus a `160px` section does not push the name below the fold. The portrait gets `max-width` so it does not sit full-bleed and tiny under the type with huge empty sides. xoxoshayla's hero image does the same stack.

## The menu swaps

At the same threshold, `.nav__links` or `.nav-links` goes from `display: none` to `display: flex`, and the hamburger goes the other way. The full-screen menu is the navigation below the threshold. It is not an extra list that also shows on the desktop. If both show, you have two ways to the same place and one of them is wrong.

King Chrissy uses `768px` for the nav. The hero uses `900px`. They do not have to be the same number. The nav can fit its links sooner than the hero can fit a portrait. Write the number where the thing actually breaks, then round to a value you will reuse. Two or three widths for the whole site. Not one query per component with a random pixel.

## The grids collapse

The 3 by 3 colorways become one column or two. The comment in xoxoshayla's file says the 3 by 3 is explicit, so the breakpoint must set `grid-template-columns` again. Auto-fit galleries may not need a query at all if `minmax` is honest. A `repeat(4, 1fr)` gallery does. Stats that were a row become a column, or they stay a row with smaller type. The marquee can stay. It is already a single line.

Test the real widths. Drag until a card's title wraps to four lines or a button overflows. That width is your query. A query at `1200px` that changes nothing is noise.

## Where a query breaks

A `max-width: 768px` rule that comes before a `min-width: 700px` rule can lose, because both match a 600px screen and source order picks the winner. Keep the overrides after the base, and keep `max-width` blocks after the rules they replace. `!important` in a query means the base rule was too specific. A class on the element beats a query that targets the element type. And `hover` styles inside a query that also matches phones make sticky hovers. Put hover lifts in `@media (hover: hover)`.

## Write two queries

Take the page from the pictures lesson. Add one query where the hero stacks and the row of links becomes the button and the full-screen menu. Add another where the gallery goes from three columns to one and the section padding drops. Check a 390px width and a 1440px width. Nothing should scroll sideways. The name should still be the biggest type on the page.
