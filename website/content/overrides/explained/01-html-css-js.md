---
title: "HTML, CSS, and JavaScript"
lede: "A quest board needs meaning, shape, and behavior. Building those layers separately makes the whole thing easier to understand."
youtube: cjSufxqiAxQ
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# HTML, CSS, and JavaScript

A guild noticeboard is a useful way to meet the web's three languages. Someone needs to read the quest, recognize its reward, and accept it. Those are related jobs, but each asks something different of the page.

HTML supplies the actual notice: a heading, a description, a reward, and a button. CSS gives the reward room to breathe and makes the button recognizable. JavaScript responds when the player accepts the quest. The episode's love-story metaphor works because the languages cooperate; the practical skill is knowing which partner to ask for help.

## Build the notice before enchanting it

Start with a real button whose words explain its action. It already has keyboard behavior that a clickable rectangle would need you to recreate. Then style it. Finally, connect the action and decide what the player sees while it waits, succeeds, or fails.

That order gives you a way to investigate problems. Missing heading? Inspect the document. Reward outside the card? Inspect the styles. Button looks right but does nothing? Follow the event handler. You have three smaller questions instead of one enormous “my website is broken.”

A useful first experiment is to turn off the styles and check whether the page still makes sense. Then restore the styles and imagine the request failing. A thoughtful interface has something intelligible to say in both cases. The [character-sheet project](/path/2-5-the-character-sheet-forge/) gives these layers a place to become one finished page.

[Original episode on YouTube](https://www.youtube.com/watch?v=cjSufxqiAxQ).
