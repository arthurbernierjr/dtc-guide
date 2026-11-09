---
title: "Programming paradigms"
lede: "Programming paradigms offer different ways to organize responsibility. Comparing them on the same small problem makes their strengths easier to see."
youtube: xWr4IZmkiQE
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Programming paradigms

Take an inventory with three potions. A procedural approach can describe the steps for using one. An object-oriented approach can place behavior around an object that owns relevant state. A functional approach can calculate a new inventory from an old one without changing the original input.

All three can express useful software. Their differences appear in where state lives, how change happens, and what a reader must know to predict an operation's effect.

## Follow the state through one action

Suppose two parts of the program hold the same inventory object. A mutation in one place can surprise the other. Returning a new value can make that change easier to track, but copying large structures has costs and external effects still have to happen somewhere. Encapsulating a rule in an object can protect an invariant, but a sprawling inheritance hierarchy can make the rule harder to find.

The point of learning several paradigms is to gain choices. It is not to rename every function a method or force every interaction into a pure expression.

Write the same small “use one potion” operation in two styles and compare how you would test it. Ask where the invalid quantity is rejected and who is allowed to change the count. Those questions make the vocabulary operational, and prepare you for [Objects and Orcs](/path/3-4-objects-and-orcs/) without turning a programming style into an identity.

[Original episode on YouTube](https://www.youtube.com/watch?v=xWr4IZmkiQE).
