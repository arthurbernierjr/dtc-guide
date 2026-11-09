---
title: "Terraform"
lede: "Infrastructure as code gives a team a reviewable description of its environment, along with a process for changing that environment deliberately."
youtube: 7yOT6j-izBY
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Terraform

A digital city has roads, buildings, and boundaries: networks, machines, storage, and access rules. Clicking them into existence can work, but the resulting city is difficult to explain when nobody remembers which choices were made in which order.

Terraform puts a description of infrastructure into files. Its plan compares the desired configuration with its understanding of the managed resources and shows proposed changes. That makes an infrastructure change something another person can read before it happens.

## Read the verbs in the plan

“Create,” “update,” and “replace” have different consequences. Replacing a disposable application instance may be routine. Replacing the wrong data resource can interrupt service or destroy something valuable. A successful plan is an explanation of proposed work, not automatic evidence that the work is wise.

State also matters. Terraform uses state to associate configuration with real resources. Treating that record carelessly can make an otherwise clear configuration difficult to manage, and state can contain sensitive information.

A useful learning exercise is to describe one small environment in plain English before automating it: what exists, what depends on what, and what should survive a rebuild. Then compare the plan with that description. The reward is not fewer clicks alone. It is being able to answer “what will change?” before the environment becomes the experiment.

[Original episode on YouTube](https://www.youtube.com/watch?v=7yOT6j-izBY).
