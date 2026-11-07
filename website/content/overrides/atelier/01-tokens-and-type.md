---
title: "Tokens and type"
lede: "Both gift sites decide color and type once, on :root, before a single section is painted."
verified: 2026-11-07
exec: n/a
verified_note: "Selectors were read from the King Chrissy and xoxoshayla stylesheets. Nothing was copied wholesale."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties
  - https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
---

# Tokens and type

## The two palettes

King Chrissy opens `styles.css` with a comment and then `:root`. The background is `#08080A`, the card is `#16161A`, the text is `#E8E8EC`, the muted line is `#8A8A94`, and the accent is a gold, `--gold: #C8A97E`. xoxoshayla uses the same near-black and the same muted gray, and swaps the accent for a lilac with a champagne for the small rules. The course examples use the guide's green, `#00A868`, in that same seat. One accent. The rest of the page is ink, card, and hairline.

A hairline is not a new color. Both files write it as `rgba(255, 255, 255, 0.06)` and name it `--border`. A second, slightly stronger line is `0.12` or `0.14`. If you invent a blue for a border, the page stops belonging to the system.

## Custom properties

The properties live on `:root`, so every rule can read them with `var(--bg)`. King Chrissy also stores the easing curves and the radii there: `--ease-out`, `--radius-lg: 24px`, `--radius-full: 9999px`. xoxoshayla stores the lilac as a channel too, `--lilac-rgb`, so a glow can be `rgb(var(--lilac-rgb) / .22)` without a second hex. When a value is used twice, it is a token. When it is used once, it can stay in the rule.

## Self-hosted type

xoxoshayla does not call a font host. The file starts with `@font-face` blocks that point at files in the project, with `font-display: swap`. King Chrissy names `'Clash Display'` and `'DM Sans'` and gives each a fallback stack that ends in `sans-serif`. The guide uses the same two families, plus Fraunces for one italic voice and JetBrains Mono for the small uppercase labels. Fraunces is not the body. Mono is not the headline. If every line is the display face, nothing is a headline.

## One accent

Buttons, the hovered link, and one word in the hero use the accent. Body copy does not. King Chrissy's selection color is the gold on the dark background: `::selection { background: var(--gold); color: var(--bg); }`. That is the whole rule. A second accent, used "just for this section," is how the page starts looking like a template.

## Where a token breaks

A custom property that is misspelled is not an error. `var(--gold)` when the token is `--gold-light` makes the property invalid at computed-value time, and the declaration is dropped. The element keeps whatever it had. DevTools shows the dropped line struck through. The other failure is a token used as a length where a color was stored, or the reverse. `gap: var(--gold)` does nothing useful.

## Write the root

Make a file with only `:root` and `body`. Put the background, the card, the text, the muted text, the hairline, and one accent on `:root`. Set `body` to the background and the text color, the body font, `18px`, and a line-height around `1.7`. Load one display face and one body face with `@font-face`, or name them with a real fallback stack. Do not style a section yet. If the page is only a heading and a paragraph and they already look like the gift sites, the tokens are doing their job.
