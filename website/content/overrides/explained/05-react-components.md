---
title: "React components"
lede: "Reusable components earn their place by giving one part of the interface a clear responsibility and a predictable way to receive data."
youtube: wzt0gwuSpQo
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# React components

A LEGO brick connects through a small, reliable interface. It does not need to know the shape of the entire castle. React components offer a similar advantage: a quest card can receive a title, reward, and acceptance handler without knowing how the application fetched the quest list.

The interesting design decision is where a fact belongs. If two panels show the same gold balance, two independent copies of that balance create an argument waiting to happen. Give the shared value one owner and pass the relevant information down. Then both panels describe the same world.

## Reuse the rule, not just the rectangle

Two cards that look alike may have different responsibilities. A display-only inventory card and an editable purchase form do not necessarily need one component with twelve flags. Extract the shared piece when its behavior and meaning are shared, not merely because two screenshots resemble each other.

State introduces time. Calling a state setter requests another render; it does not rewrite the values already captured by the current render's functions. React's [state-as-a-snapshot explanation](https://react.dev/learn/state-as-a-snapshot) walks through that distinction. It explains many “why is this still the old number?” moments and helps you avoid treating state like an ordinary mutable variable.

Try sketching a screen as a tree before writing JSX. Mark which component owns each changing fact and which children only need to display it. The [React API walkthrough](/languages/frontend/react/) then gives that tree a real source of data and a reason to handle loading and failure.

[Original episode on YouTube](https://www.youtube.com/watch?v=wzt0gwuSpQo).
