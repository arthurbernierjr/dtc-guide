---
editorial: true
title: Save Points and Respawns
subtitle: Git Init, Commit, Branch, Merge
hook: "Three hours of work, one careless edit, everything gone. In a game that never happens, because you saved before the boss. Git is the save system for your code: snapshots you can return to, timelines you can try things in, and a merge that joins the best of both."
read: 60
artifact: "Three repositories on your machine: explorers-journal turned into a Git repo, branch-quest with a conflict you created and resolved yourself, and quest-log with two branches merged into main and a history you can read with git log --oneline --graph"
diagrams:
  - fig1-three-states
  - fig2-commit-chain
  - fig3-branch-timelines
  - fig4-two-merges
  - fig5-conflict-markers
docs:
  - https://git-scm.com/doc
  - https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F
  - https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository
  - https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging
  - https://learngitbranching.js.org
  - https://ohmygit.org
  - https://www.conventionalcommits.org
say:
  - "a commit is a save point: a snapshot of the whole folder, named by its hash"
  - "modified, staged, committed: add moves a file into the waiting room, commit locks it in"
  - "a branch is a label on a commit; checkout moves you and rewrites the folder to match"
  - "merge joins two timelines; a conflict is git asking which lines you want"
  - "nothing committed is ever lost; git status before and after everything"
---

## The hook

Here is the nightmare. You spend three hours on something. It works. You feel incredible. Then you make one small change and everything breaks, and when you try to undo it you cannot remember what you changed, so you undo a bit more, and now it is worse. The work is gone. Rage quit.

In a game that scenario does not exist. Why? Save points. You save before the boss fight. You die, you respawn at the save, you try again with what you learned. Nobody loses three hours in a game with a save system, and nobody should lose three hours of code.

> *The adventurer had learned this the hard way. One wrong turn in the catacombs, one trap, and a whole evening of mapping vanished with him. The second time he found a save crystal he pressed his palm to it before every door. He died just as often after that. It stopped mattering.*

Git is save points for your code. It is the most important tool in a developer's kit after the editor itself, and every company, every open-source project and every working developer on the planet uses it, every day, on everything. It is also, for most beginners, the first tool that feels genuinely alien: a vocabulary of commits and branches and heads, output that seems to shout at you, a conflict that looks like the file has been vandalised. By the end of this session all of it will be ordinary. You will have made a repository from nothing, saved into it a dozen times, split off a parallel timeline, merged it back, broken the merge on purpose and repaired it with your own hands.

We are covering a lot: initialising a repo, staging, committing, the log, ignoring files, branching, merging, and resolving a conflict. Every one of those maps onto something you already understand. A commit is a save. A branch is an alternate timeline. A merge is combining timelines. A conflict is the game asking which version you want to keep. Hold on to those four sentences and the rest is spelling.

One more thing before we start, because it is the most common confusion of the whole unit. Git is not GitHub. Git is a program on your machine; it works with no internet, no account, no website. GitHub is a website that hosts Git repositories so other people can see them. Today is Git only. Your work stays on your machine. Next session, the Guild Sync, we go online.

## The idea

**The problem Git solves** has a name you have already seen: `final_project_v2_FINAL_actually_final_v3.docx`. That is version control done by hand, and it fails in exactly the ways you expect. Which version is the one that worked? What changed between v2 and FINAL? Who changed it? Git answers all of those by tracking every change to every file over time, remembering who made it and why, and letting you go back to any point. Teams use it so five people can work on the same project without overwriting each other; solo developers use it because the five people are you on Monday, you on Tuesday and you at two in the morning.

A few words of vocabulary, and then the two pictures that make them real. A **repository**, repo for short, is a project folder that Git is watching. A **commit** is a snapshot, a save point: a record of what every file looked like at one moment, with your name, the time and a message. The **staging area** is a waiting room where you choose which changes go into the next save. A **branch** is an alternate timeline, a way to work on something without touching the main line. A **merge** joins two timelines back into one.

**Every file in a repository is in one of three states.** *Modified*: you changed it and Git has not been told. *Staged*: you told Git to include it in the next save. *Committed*: saved, locked in, safe. Two commands move a file between the rooms. `git add` takes it from modified to staged, into the waiting room. `git commit` takes everything in the waiting room and makes a save point of it. Nothing is saved until it has gone through both doors, and `git status` tells you at any moment which room every file is standing in.

![](diagram:session-1-3/fig1-three-states)

Why a waiting room at all? Because a save should mean something. If you fixed a bug and also half-finished a new feature, you want two saves, not one with a vague message. The staging area lets you pick the bug fix, commit it with a message that says so, and leave the rest for the next commit. Early on you will mostly `git add .` and stage everything, and that is fine. The room is there for when you need it.

This also kills the second-biggest misconception: Git is not automatic. It does not save when you press Ctrl+S. Nothing is tracked until you `add` it and nothing is saved until you `commit` it. The upside is that every save is deliberate and has a message; the downside is that you have to remember to save. Save often. Small saves, each one doing one thing, with a message that says what and why.

**What a commit actually is.** Not a diff, not a list of changes: a whole snapshot of every tracked file, plus a little header. The header holds your name and email, the date, your message, and the hash of the commit that came before it, its *parent*. The name of the commit is a forty-character hexadecimal **hash**, like `c0769461e5a3…`, computed from everything inside it. Change one byte of one file and the hash changes, which is why a save point cannot be quietly tampered with. Git shows you the first seven characters most of the time, `c076946`, and that is enough to point at it.

![](diagram:session-1-3/fig2-commit-chain)

Because every commit holds its parent's hash, commits form a chain, and the chain runs backwards: the newest commit knows the one before it, which knows the one before that, back to the very first, which has no parent and is marked `(root-commit)`. `git log` walks that chain and prints it newest first. A **branch** is nothing more than a label stuck on one commit, and **HEAD** is the label that says where you are standing. When you commit, the new save's parent is whatever HEAD pointed at, and the label you are on moves forward to the new save. That is all a branch is. Keep that picture; it makes everything in the second half of today obvious.

**Branches, then, are timelines.** You create one when you want to try something without risking the main line: a new feature, an experiment that might not work, a fix you are not sure about. The default branch is called `main`. `git branch` lists your branches with a star on the one you are on. `git branch name` creates one. `git checkout name` moves to it, and `git checkout -b name` creates and moves in one step. Newer Git also has `git switch name` and `git switch -c name`, which do the same jobs with a clearer name; both work, most tutorials still say `checkout`, use whichever you like. When you move to a branch Git rewrites your folder to match that branch's latest save, which is the part that surprises people the first time: files appear and disappear. Nothing is deleted. The folder is showing you a different timeline.

```text
main:     A --- B --- C
                       \
feature:                D --- E
```

Commits A, B and C are on `main`. You branched at C, made D and E on `feature`, and `main` has not moved. **Merging** brings a timeline back. If `main` has not moved since the fork, Git simply slides the `main` label forward to E; that is a *fast-forward*, no new commit needed. If both timelines moved, Git makes a *merge commit* with two parents that joins them. And if both timelines changed the same lines of the same file, Git stops, writes both versions into the file with markers around them, and asks you to choose. That is a *merge conflict*. It is not an error and nothing went wrong; it is the one decision a program cannot make for you.

Two more misconceptions to retire now. Deleting a branch after you merge it does not delete the commits: they are part of `main`'s history, and the branch was only a label. And you do not need to commit everything at once; you should not. Small, focused saves with clear messages are what make the log worth reading.

**Set up your identity, once.** Every commit carries a name and an email, so before your first save Git needs to know yours. You also tell it to call the first branch `main` instead of the older default `master`, so your repositories look like everyone else's. Three commands, run once per machine, kept in a file called `~/.gitconfig` that you can `cat` like any other:

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
git config --global init.defaultBranch main
```

> **Say:** "A commit is a save point: a snapshot of the whole folder, named by its hash. Modified, staged, committed: add moves a file into the waiting room, commit locks it in. A branch is a label on a commit; checkout moves you and rewrites the folder to match. Merge joins two timelines; a conflict is Git asking which lines you want. Nothing committed is ever lost."

## The demonstration

Six terminals. The `git` in them is the real thing in miniature: it keeps a repository inside the box, speaks with Git 2.47's own sentences, and resets when you press Run again. Each box starts from a clean home, so the later ones rebuild the previous save in a line or two before continuing. Run each, read every line of output, then redo the parts that surprised you at the prompt.

**Walkthrough 0: who are you.** Identity first, because the first commit will refuse without it. `--global` means "for every repository on this machine"; the settings land in `~/.gitconfig`.

```bash term=identity
git --version
git config --global user.name "Arthur the Adventurer"
git config --global user.email "arthur@newworld.dev"
git config --global init.defaultBranch main
git config --global --list
cat ~/.gitconfig
```

**Walkthrough 1: your first repo.** Make a folder, turn it into a repository, and watch two files travel through the three states one door at a time. Read every `git status` out loud; by the end of the box you should be able to predict each one before it prints.

```bash term=first-repo
# identity first (one line here; the identity terminal above shows the three commands)
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
cd ~
mkdir git-quest
cd git-quest
git init
ls -la
git status
echo "# Git Quest" > README.md
echo "My first Git project. I am learning version control." >> README.md
echo "wooden-sword" > inventory.txt
echo "cloth-shirt" >> inventory.txt
echo "health-potion x3" >> inventory.txt
git status
git add README.md
git status
git add inventory.txt
git status
git commit -m "Initial commit: add README and inventory"
git status
git log
```

Four things to take from that box. `git init` made exactly one thing, a hidden `.git` folder, and that folder *is* the repository: every save you ever make lives inside it, and deleting it turns the project back into a plain folder. The first `git status` after you create files says *Untracked*, meaning Git can see them but has never been asked to care. After `git add README.md` the status splits into two sections, *Changes to be committed* for the file in the waiting room and *Untracked* for the one still outside; that is the three-states picture in text. And after the commit, `git status` says *nothing to commit, working tree clean*, which is the sentence you want to see before you stop work for the night. `git log` shows the save: the full hash, `(HEAD -> main)` saying this is where you stand, your name, the date, and the message indented underneath.

**Walkthrough 2: more saves, and the diff.** Now change a file that is already tracked. Its state is *modified*, not untracked, and before you stage it you can ask Git exactly what changed. `git diff` compares your folder with the waiting room; `git diff --staged` compares the waiting room with the last save. After `git add`, the first goes quiet and the second lights up, because the change moved rooms.

```bash term=more-saves
# rebuild the save from the last terminal (each terminal on this page starts fresh)
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
mkdir ~/git-quest && cd ~/git-quest && git init
printf "# Git Quest\nMy first Git project. I am learning version control.\n" > README.md
printf "wooden-sword\ncloth-shirt\nhealth-potion x3\n" > inventory.txt
git add . && git commit -m "Initial commit: add README and inventory"
# now: change a tracked file and watch the three states
echo "iron-sword" >> inventory.txt
echo "leather-armor" >> inventory.txt
git status
git diff
git add inventory.txt
git diff
git diff --staged
git commit -m "Add iron sword and leather armor to inventory"
echo "Quest 1: Learn Git" > quests.txt
echo "Status: In Progress" >> quests.txt
git add quests.txt
git commit -m "Add quest tracker"
git log --oneline
git log
```

Read the diff slowly once. `--- a/inventory.txt` and `+++ b/inventory.txt` are the before and after. `@@ -1,3 +1,5 @@` says the old version had lines one to three here and the new has one to five. Lines starting with a space are unchanged context; lines starting with `+` were added; a `-` would mean removed. Every code review you ever do will be in this format. Then look at the two logs: `--oneline` gives one line per save, short hash and message, newest at the top, and is the form you will type fifty times a week. The full form adds author and date. Three commits, three save points, each one a whole snapshot you can go back to.

A word on messages, because yours will be read by other people and by future you. Say what the save does, in the present tense, as a short imperative: *Add quest tracker*, *Fix login redirect*, *Remove unused styles*. Not *stuff*, not *changes*, not *asdf*. If you find yourself writing *and* in a message, that may be two commits. There is a convention for this called [Conventional Commits](https://www.conventionalcommits.org) that teams adopt later; for now, clear and specific is the whole rule.

**Walkthrough 3: things that must never be saved.** Some files do not belong in a repository: secrets, passwords and API keys, because a repository gets shared; `node_modules` and other folders of downloaded libraries, because they are huge and can be re-downloaded; logs and scratch output, because they are noise. A file called `.gitignore` in the root of the repo lists patterns Git should pretend not to see. One name per line: an exact filename, a folder name with a trailing slash, or a wildcard like `*.log`.

```bash term=gitignore
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
mkdir ~/git-quest && cd ~/git-quest && git init
printf "wooden-sword\ncloth-shirt\n" > inventory.txt && echo "Quest 1: Learn Git" > quests.txt
git add . && git commit -m "Add quest tracker"
# files that must never be saved
echo "my-secret-password" > secrets.txt
mkdir node_modules
touch node_modules/big-library.js
echo "debug output" > debug.log
git status
echo "secrets.txt" > .gitignore
echo "node_modules/" >> .gitignore
echo "*.log" >> .gitignore
cat .gitignore
git status
git add .gitignore
git commit -m "Add .gitignore to exclude secrets, node_modules, and logs"
git log --oneline
git add secrets.txt
ls
```

Before the `.gitignore` exists, `git status` lists all three intruders as untracked, with the folder shown as `node_modules/` rather than every file inside it. After, they are gone from the list and only `.gitignore` itself shows up, and yes, you commit that: the ignore rules are part of the project, so everyone who gets the repo gets them. The last two lines are the proof. `git add secrets.txt` refuses and says the file is ignored (`git check-ignore -v secrets.txt` names the rule responsible), and `ls` shows the file is still right there on disk. Ignored is not deleted. Git is simply never going to put it in a save.

**Walkthrough 4: the side quest, a branch and a fast-forward.** A new timeline, a save on it, a look back at `main` to see that nothing there moved, and then the merge. Watch the folder change when you check out.

![](diagram:session-1-3/fig3-branch-timelines)

```bash term=branching
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
mkdir ~/git-quest && cd ~/git-quest && git init
echo "wooden-sword" > inventory.txt && printf "Quest 1: Learn Git\nStatus: In Progress\n" > quests.txt
git add . && git commit -m "Initial commit: add inventory and quest tracker"
git branch
git checkout -b side-quest
git branch
echo "Side Quest: Defeat the Goblin King" > side-quest.txt
echo "Reward: 500 gold" >> side-quest.txt
echo "magic-staff" >> inventory.txt
git add .
git commit -m "Add side quest and magic staff"
git log --oneline
git checkout main
ls
cat inventory.txt
git log --oneline
git merge side-quest
ls
cat inventory.txt
git log --oneline
git branch -d side-quest
git branch
```

Follow the labels. After `checkout -b side-quest` the star moves and you are on the new timeline. The commit lands there: `git log --oneline` shows it at the top with `(HEAD -> side-quest)` and the first commit below with `(main)`, so you can see that `main` is one save behind. Then `git checkout main`, and the folder changes: `ls` has no `side-quest.txt`, `cat inventory.txt` has no staff. Nothing was deleted. The folder is displaying `main`'s latest save, and the side quest's save is safe in `.git`. `git merge side-quest` brings it in, and because `main` had not moved since the fork, Git prints `Fast-forward`: it moved the `main` label up to the side quest's commit and no new commit was needed. The files are back. Both labels now sit on the same save, `(HEAD -> main, side-quest)`, so the branch has done its job and `git branch -d` removes the label, nothing else.

![](diagram:session-1-3/fig4-two-merges)

**Walkthrough 5: the conflict.** Now both timelines will change the same two lines of the same file, so Git cannot fast-forward and cannot combine them on its own. It will stop and ask. In the box, you answer by writing the file you actually want with `echo`; on your machine you would open `quests.txt` in VS Code, delete the marker lines and keep what you want, then save. The three Git moves after that are identical.

![](diagram:session-1-3/fig5-conflict-markers)

```bash term=conflict
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
mkdir ~/git-quest && cd ~/git-quest && git init
printf "wooden-sword\nmagic-staff\n" > inventory.txt && printf "Quest 1: Learn Git\nStatus: In Progress\n" > quests.txt
git add . && git commit -m "Add side quest and magic staff"
git checkout -b dragon-slayer
echo "Quest 1: Slay the Dragon" > quests.txt
echo "Status: Ready" >> quests.txt
git add quests.txt
git commit -m "Update quest to dragon slaying"
git checkout main
echo "Quest 1: Learn Git (COMPLETE)" > quests.txt
echo "Status: Done!" >> quests.txt
git add quests.txt
git commit -m "Mark git quest as complete"
git merge dragon-slayer
git status
cat quests.txt
# resolve: write the file you actually want (in VS Code you would delete the markers by hand)
echo "Quest 1: Learn Git (COMPLETE)" > quests.txt
echo "Quest 2: Slay the Dragon" >> quests.txt
echo "Status: In Progress" >> quests.txt
cat quests.txt
git add quests.txt
git status
git commit -m "Merge dragon-slayer: resolve quest conflict, add dragon quest"
git log --oneline --graph
git branch -d dragon-slayer
```

Read the conflict with the picture. `git merge` printed three lines: `Auto-merging quests.txt`, meaning it tried; `CONFLICT (content): Merge conflict in quests.txt`, naming the file; and `Automatic merge failed; fix conflicts and then commit the result.`, telling you exactly what to do next. `git status` lists the file under *Unmerged paths* as *both modified* and repeats the instructions. Then `cat quests.txt`: everything between `<<<<<<< HEAD` and `=======` is yours, the branch you are standing on, `main`; everything between `=======` and `>>>>>>> dragon-slayer` is theirs, the branch coming in. Git kept both and drew fences so you could decide.

You decided to keep the completed first quest, add the dragon as a second, and set a fresh status. Once the file holds only that, with no markers left anywhere, `git add quests.txt` tells Git the fight is over, `git status` confirms *All conflicts fixed but you are still merging*, and `git commit` makes the merge commit, the save with two parents. `git log --oneline --graph` draws the result: two lanes that split at the shared save and join again at the top. If you ever want out instead, `git merge --abort` puts everything back exactly as it was before you typed `git merge`. Nothing is lost either way, which is the whole point of the save system.

Merge conflicts look scary the first time. They are the computer saying "two people changed the same thing, which do you want?" You pick, you save, you move on. After today you have done it once; by the end of the programme you will have done it fifty times and stopped noticing.

> **Tip:** Run `git status` before and after everything while you build the habit. Before you add, before you commit, after you check out, after you merge. It is free, it is instant, and it tells you which room you are in. Most beginner Git trouble is nothing more than not knowing where you are standing.

## Where it breaks

Everything here happens to everyone. The box is tagged to expect a failing line or two; press Run, read each message, then cause the same thing in your own repository so the words are familiar when they come up for real.

```bash term=broken may-fail
cd ~ && mkdir broken-quest && cd broken-quest
git status
git init
echo "hp: 100" > hero.txt
git commit -m "first save"
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev"
git commit -m "first save"
git add hero.txt
git commit -m "first save"
git branch -m main
git log --oneline
gti status
git chekout -b potions
git checkout -b potions
echo "potion: 3" >> hero.txt
git commit -am "carry potions"
git checkout main
git branch -d potions
git merge potions
git branch -d potions
git log --oneline --graph --all
```

**`fatal: not a git repository`.** You ran a Git command in a folder that is not inside a repository. Either you are in the wrong folder, in which case `pwd` and `cd`, or you have not run `git init` yet. Git looks for a `.git` folder here and in every parent folder up to the root, so this message really does mean there is none anywhere above you.

**The `hint: Using 'master' as the name for the initial branch` wall.** Ten lines of advice because `init.defaultBranch` was never set on this machine. Harmless, but it means your first branch is called `master`, not `main`, and every tutorial will disagree with you. The fix for this repository is `git branch -m main`; the fix forever is the third config line from Walkthrough 0. You ran that line on your machine already, so your own `git init` will not print this wall; the box prints it because its config starts empty.

**`Author identity unknown` and `*** Please tell me who you are.`** The commit refused because there is no name and email. Git prints the two `git config --global` lines you need; run them, with your real details, and commit again. The box did exactly that.

**A commit that prints a status report instead of a save.** You committed with nothing in the waiting room. Git shows you the untracked or modified files and ends with *nothing added to commit*. You forgot `git add`. This one is daily, forever.

**`command not found` on `gti`, and `'chekout' is not a git command`.** Two different typos with two different messages. The first means the shell could not find a program called `gti`, so Git never ran. The second means Git ran and did not recognise the subcommand. Read which one you got; it tells you which word to fix. Real Git will sometimes add *The most similar command is checkout*, which is a kindness.

**`error: the branch 'potions' is not fully merged`.** You tried to delete a branch whose saves are not yet in `main`. Git is protecting you: deleting that label would make its commits very hard to find. Merge first, then delete; `git branch -D` forces it, and you should type that only when you are sure you want the work gone.

Two more that the box cannot show, because they are mistakes of place rather than of typing. **Committing to the wrong branch** happens when you forget to check out before you start; `git branch` before every commit is the habit, and if you catch it immediately, `git log --oneline` on the right branch will show the save is missing. And **nesting repositories**, running `git init` inside a folder that is already inside a repository, produces baffling behaviour later; `git status` in a new folder before you `init` tells you whether you are already inside one.

> **Note:** The single most important fact about Git for a beginner: once something is committed, it is almost impossible to lose. Wrong branch, bad merge, deleted file, panicked `reset`; if there was a commit, the save is in `.git` and can be found. Commit early and often, and nearly every disaster becomes a mild inconvenience.

## Your turn

First, keep last session's promise. On your own machine, in your real terminal, `cd ~/explorers-journal`, run `git status` and read the *not a git repository* message once more, then `git init`, `git status` to see every file untracked, `git add .`, and `git commit -m "Initial commit: explorer's journal from session 1.2"`. `git log` should show one save with your name on it. The journal now has a save point, and it will be the first thing you push to GitHub next session.

**Guided lab: The Branch Quest (30 minutes).** A fresh repository, a conflict you create yourself, and a resolution in your own editor. Rehearse in the box, which sets up the character sheet and stops at `git status`; do it for real on your machine, where `code character.txt` opens the conflict in VS Code.

```bash term=branch-quest
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
cd ~ && mkdir branch-quest && cd branch-quest && git init
printf "Name: Arthur\nClass: Beginner\nLevel: 1\nHP: 100\nWeapon: Wooden Sword\n" > character.txt
printf "*.log\ntemp/\n" > .gitignore
git status
# your move: add, commit, branch level-up, and finish the quest at this prompt
```

1. In `~/branch-quest`, create `character.txt` with your own name, `Class: Beginner`, `Level: 1`, `HP: 100`, `Weapon: Wooden Sword`, one per line, and a `.gitignore` that ignores `*.log` files and a folder called `temp/`.
2. Stage and commit everything with the message `Create character sheet and gitignore`. Checkpoint: `git log --oneline` shows exactly one commit.
3. `git checkout -b level-up`. On this branch change the class to `Warrior`, the level to `5`, HP to `250` and the weapon to `Steel Sword`; add a `skills.txt` with at least three skills (make them up, have fun). Commit: `Level up character to warrior level 5`. Checkpoint: two commits in the log.
4. `git checkout main`. Watch `skills.txt` vanish and `cat character.txt` go back to Beginner. On `main`, change the class to `Mage`, the level to `3` and the weapon to `Magic Staff`. Commit: `Reclass character to mage`.
5. `git merge level-up`. You will get a conflict in `character.txt`, because both timelines changed the same lines. `git status`, then `cat character.txt` and find the fences.
6. Open the file, decide on the character you want (keep one side, or build a Level 5 Battle-Mage with the staff; it is your sheet), delete every marker line, save. Then `git add character.txt` and `git commit -m "Resolve merge conflict: finalize character build"`.
7. `git log --oneline --graph`. Count your commits and find the merge. `git branch -d level-up`; `git branch` should show only `main`.

Success looks like: at least four commits, a conflict you created and resolved, `skills.txt` present on `main` (it came across in the merge with no conflict, because only one side touched it), and one branch left.

**Independent lab: The Quest Log.** No step-by-step. The box builds the first save for rehearsal; build the real one on your machine, because next session this exact repository is the one you push to GitHub.

```bash term=quest-log
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
cd ~ && mkdir quest-log && cd quest-log && git init
printf "# Quest Log\nTracking my adventures in the terminal world.\n" > README.md
mkdir quests
echo "Learn Git and GitHub" > quests/main-quest.txt
echo "Master the terminal" > quests/side-quest-1.txt
echo "Build a dotfiles repo" > quests/side-quest-2.txt
printf "*.log\ntemp/\n.DS_Store\n" > .gitignore
git status
git add . && git commit -m "Initial commit: set up quest log"
git log --oneline
# from here the lab is yours: add-inventory, add-journal, two merges, git log --oneline --graph
```

Requirements, in order. A folder `quest-log` in your home, initialised as a repository. A `README.md` with the heading `# Quest Log` and the line *Tracking my adventures in the terminal world.* A `quests/` folder holding `main-quest.txt` (*Learn Git and GitHub*), `side-quest-1.txt` (*Master the terminal*) and `side-quest-2.txt` (*Build a dotfiles repo*). A `.gitignore` for `*.log`, `temp/` and `.DS_Store`. Commit all of it: `Initial commit: set up quest log`.

Then two timelines. On a branch `add-inventory`, create `inventory.txt` with at least five items and commit `Add inventory system`. Back on `main`, make a second branch `add-journal`; on it create `journal/day-01.txt` with a short entry about today's session and `journal/day-02.txt` with what you are looking forward to, and commit `Add journal entries`. Back on `main`, merge `add-inventory`, then merge `add-journal`. The first merge is a fast-forward; think about why the second one is not, then check with `git log --oneline --graph`. Delete both branches. Make one final commit that adds anything you like to `README.md`.

Hints: `git status` before and after each operation; `git branch` to confirm where you are before you commit; and when the picture in your head stops matching, `git log --oneline --graph --all` shows every timeline at once. Stretch goals: make a third branch that edits the same file as one of the others and resolve the conflict on purpose; use `git diff` before each `add` so you see what you are about to stage; try `git log --stat` and `git show HEAD` and work out what each adds; and look up `git stash`, which parks half-finished work so you can switch branches cleanly (it is in the box if you want to try it: `git stash`, `git stash list`, `git stash pop`).

## The quest

By the start of Session 1.4, have on your machine:

- `explorers-journal` turned into a repository with one commit, your name in `git log`.
- `branch-quest` with at least four commits, a merge conflict you created and resolved, `skills.txt` on `main`, and only `main` left in `git branch`.
- `quest-log` built to the requirements: two branches merged into `main`, both deleted, a final README commit, and a `git log --oneline --graph` you can read aloud and explain, including why one merge fast-forwarded and the other made a merge commit.

Budget ninety minutes to two hours for the Quest Log if you did not finish it here. Next session you push it to GitHub, so it must exist, in your home directory, under that exact name.

## Side quests

Three pages in the library look further down roads you walked today. They are written for later units, so read the opening and the first picture, not the code.

## Before next session

Make the save a reflex. Every time you finish a piece of work, however small: `git status`, `git add .`, `git commit -m` with a message that says what you did. Then `git log --oneline` and look at the stack growing. By Session 1.4 you should have a dozen commits across your three repositories and the habit should feel slightly compulsive. That is correct.

Spend twenty minutes on [Learn Git Branching](https://learngitbranching.js.org), the first four levels of the introduction sequence. It draws the commit graph live as you type, and watching `main` and `HEAD` move will fix the picture from Fig 2 permanently. If you prefer a game, [Oh My Git!](https://ohmygit.org) covers the same ground as cards.

Next time: Guild Sync. Your repositories leave your machine. You will make a GitHub account, prove who you are with an SSH key, push `quest-log` to a remote, clone it back down, open your first pull request, and build the project every developer eventually builds: a dotfiles repository that can set up a new machine in one command. The save system goes online, and your code becomes something other people can see.

> **Say:** "A commit is a save point: a snapshot of the whole folder, named by its hash. Modified, staged, committed: add moves a file into the waiting room, commit locks it in. A branch is a label on a commit; checkout moves you and rewrites the folder to match. Merge joins two timelines; a conflict is Git asking which lines you want. Nothing committed is ever lost; git status before and after everything."

You now have a power most people in the world do not. You can track every change to every file, go back in time, try things in parallel and combine the best results. That is Git. You learned it in one session, and the save crystal is yours for the rest of the game.
