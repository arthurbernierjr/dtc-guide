---
title: "Assembly"
lede: "One page, in the order the stylesheets are written. This is the file the other nine lessons were building."
verified: 2026-11-07
exec: n/a
verified_note: "The order matches the section comments in the King Chrissy and xoxoshayla stylesheets. The worked example is the Surge page linked from this lesson."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS
---

# Assembly

## The order

King Chrissy's file is not alphabetical. It is the order you meet the page: tokens, loader, mute, cursor, nav, mobile menu, hero, buttons, sections, links, about, gallery, image break, shop, connect, marquee, footer, reveal, then the mobile overrides. xoxoshayla is the same story with a gate instead of a loader and a colorway grid instead of a shop. You write in that order because each piece assumes the one above it. A hero that names `var(--gold)` before `:root` exists is a hero that is invisible.

The worked page for this lesson is [dtc-atelier.surge.sh](https://dtc-atelier.surge.sh/). The course's own landing page, arena, and guild hall use the same order and the guide's green instead of gold or lilac.

## Tokens through shell

Start with `:root`: background `#08080A`, card `#16161A`, text, muted, hairline, one accent, two fonts, one radius scale, one easing curve. Then the reset, the container, the section padding, the skip link, the eyebrow, and the pill. Stop and look. A heading and a button on that ground should already feel like the gift sites. If they do not, do not go on to the hero. Fix the tokens.

## Nav and hero

Fixed nav, brand, links, the underline that grows, the scrolled blur class. Then the hero: split, clamp title, one accent line, muted lede, the pill, grain at low opacity. Top padding clears the nav. Under `900px` the split stacks. The links hide and the menu button shows.

## One grid and one break

One section of cards, auto-fit or an explicit count, whole card is the link, hover lifts. Then one full-bleed image, `object-fit: cover`, a scrim, a short line of type. You do not need a shop and a gallery and a colorway grid on the first assembled page. You need one grid and one break so you have practiced both. The gift sites have more sections. They are the same two ideas repeated.

## Marquee, footer, motion

A footer with the name and a year. A marquee of a few words, duplicated, translated by half. A reveal class the script adds when a section enters, and a reduced-motion query that turns the marquee and the lift off. A gate is optional on this page. If you include it, it is the first thing in the body and the last thing the visitor sees, and it leaves.

## The file you ship

One HTML file, one CSS file, the font files, and the images. No framework. The CSS file's comments follow the order above, the way both gift stylesheets comment their sections. Open it at 390px and at 1440px. Tab through it. The skip link appears. The pill lifts. Nothing scrolls sideways. The accent appears on the button, the underline, and one line of the title, and nowhere else.

That is the whole craft. The later pages of this guide are the same shell with different copy.
