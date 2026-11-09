---
title: "K-nearest neighbor"
lede: "K-nearest neighbor makes a prediction by comparing a new example with nearby labeled examples. The meaning of “nearby” does most of the intellectual work."
youtube: PW9j832dZiI
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# K-nearest neighbor

Imagine classifying fantasy creatures using height and weight. A new creature is placed among examples you already labeled, and its nearest neighbors vote on a class. The procedure sounds straightforward until you change the units: kilograms become grams, and one feature can suddenly dominate the distance calculation.

That is why preparing the data matters as much as choosing a value of `k`. Feature scales, irrelevant attributes, noisy labels, and uneven class representation can all change which neighbors appear closest.

## A boundary you can draw

With `k = 1`, a single unusual example can strongly affect a nearby prediction. A larger neighborhood smooths local irregularities, but can also blur a meaningful boundary. There is no universal setting that makes those tradeoffs disappear.

Draw two clusters on paper, add one mislabeled point, and classify a few new points with different neighborhood sizes. You can see the model's behavior without treating machine learning as an invisible oracle.

Then ask how you would judge it on examples it did not use as references. A model that looks convincing on familiar cases may still fail on the next creature. This episode provides a good bridge between ordinary data structures and machine learning: storing examples is easy; defining useful similarity and evaluating the resulting decisions is the real design problem.

[Original episode on YouTube](https://www.youtube.com/watch?v=PW9j832dZiI).
