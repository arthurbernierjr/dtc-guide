---
title: "The CSS box model"
lede: "That stubborn horizontal scrollbar often begins with a simple accounting mistake: the width you declared is only one part of the box."
youtube: Mx-XMgLEFfQ
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# The CSS box model

Give a card a width of 300 pixels, 20 pixels of padding on each side, and a 2-pixel border. With the default content-box sizing, the visible box is 344 pixels wide. Your arithmetic was correct; you were measuring a different thing from the browser.

## Account for the whole card

The content is where the words or image live. Padding creates space inside the border. The border surrounds that padded area. Margin separates the box from its neighbors. With `box-sizing: border-box`, the declared 300 pixels includes the padding and border, leaving 256 pixels for content. Margins still sit outside that width.

This distinction matters on a phone. A card that fits until you add comfortable padding can suddenly push the entire page sideways. Changing random margins may hide the symptom at one screen size while preserving the mistaken model.

Open the browser's box-model diagram for one awkward element. Change its padding, then its margin, and watch which boundary moves. That small experiment is more useful than memorizing four definitions because it connects each word to a visible consequence.

There is one further wrinkle: vertical margins between ordinary block elements can collapse rather than add. Flex and grid layouts follow different rules. When spacing surprises you, identify the layout context before reaching for another negative margin. Continue with [Formation Magic](/path/2-3-formation-magic/) when you are ready to arrange several boxes together.

[Original episode on YouTube](https://www.youtube.com/watch?v=Mx-XMgLEFfQ).
