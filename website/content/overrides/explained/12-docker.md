---
title: "Docker"
lede: "A container packages a process's environment. It helps you reproduce how the application starts, while leaving important operational decisions in your hands."
youtube: -eBsUajsHSs
verified: 2026-11-07
exec: n/a
verified_note: "Original writeup for a Technology Explained episode on the Big Poppa Code channel. The player is that episode."
---

# Docker

“It works on my machine” often means the machine contributed something the project forgot to describe: a library, an environment setting, a directory, or a particular runtime. Docker gives you a way to make more of those assumptions explicit in an image.

Think of the image as a prepared kit and the container as a running use of that kit. You can start two containers from one image without making them the same process. They have separate lifetimes and can fail independently.

## Decide what must survive replacement

A character's saved inventory should not disappear because you replaced the application container. That is why persistent data needs an intentional home, such as a database or an appropriate volume. Files written only into a container's disposable layer are a poor place for irreplaceable state.

Configuration deserves the same attention. An image should not become a distribution mechanism for private credentials. Supply the necessary configuration when it runs, and distinguish it from the files that belong in the application.

Before adding more tooling, describe one replacement: stop the old container, start a new one, and identify which data and connections must still exist. If that story has gaps, a larger orchestration system will inherit them. The next episode on [Kubernetes](/explained/kubernetes/) becomes easier once you understand what one container can and cannot promise.

[Original episode on YouTube](https://www.youtube.com/watch?v=-eBsUajsHSs).
