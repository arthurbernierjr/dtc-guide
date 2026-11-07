---
title: "Pictures"
lede: "Galleries, the 3 by 3 colorways, and the full-bleed image break are three ways to put a photograph in the system."
verified: 2026-11-07
exec: n/a
verified_note: "Gallery, object-fit, colorway grid, and image-break rules were read from both stylesheets."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit
---

# Pictures

## The gallery

King Chrissy's gallery is a grid of photographs, six to eight, with a small gap and a radius on each image. The image is `width: 100%; height: 100%; object-fit: cover`. The cell has a fixed aspect ratio, often `aspect-ratio: 1` or `4 / 5`, and `overflow: hidden` so the radius clips the photo. Without the aspect ratio, a portrait and a landscape make a ragged row. Cover crops. Contain letterboxes. Gift sites use cover.

## Object fit

`object-fit` does nothing if the image has no height of its own. The cell must have a height, or an aspect ratio, and the image must fill that box (`width` and `height` both `100%`). `object-position` aims the crop. xoxoshayla's gate video uses `object-position: 50% 15%` so the face stays in frame when the box is wide. A hero portrait that crops off the head is an `object-position` bug, not a bad photograph.

## The colorway grid

xoxoshayla's colorways are an explicit 3 by 3, not auto-fit. The comment in the file says so. Each cell is a swatch: a background color, a name, sometimes a product still on top. Explicit columns mean the design is nine cells, and the breakpoint lesson will change that count on purpose. Auto-fit would reflow to seven and look like an accident. Use auto-fit for a list that can grow. Use an explicit count for a composition you designed.

## The image break

Both sites interrupt the container with a full-bleed photograph. The section is `width: 100%`, outside the container's max-width, with a fixed height (`min-height: 60vh` or a pixel height) and the image `object-fit: cover` filling it. A caption, if there is one, sits on a scrim: a gradient from transparent to the page background, so the type stays readable. King Chrissy calls this the full-bleed image break. xoxoshayla has the same block between the colorways and the collection. It is one image, not a gallery. Its job is to reset the eye.

## Where pictures break

A grid image without `display: block` keeps a gap under it, the inline baseline. An `img` with only `max-width: 100%` and no height ignores `object-fit`. A full-bleed section inside the container can never be full bleed. The break has to be a sibling of the container, or the container has to be allowed to go edge to edge for that one section. And a missing `alt` is a content bug the stylesheet cannot fix.

## Write the gallery

Add a gallery of six images in a grid with a shared aspect ratio and `object-fit: cover`. Then one full-bleed break after it, one photograph, edge to edge, with a short caption on a scrim. Use pictures you have the right to use. The crop should keep the subject. Check a portrait and a landscape in the same grid and confirm the rows still align.
