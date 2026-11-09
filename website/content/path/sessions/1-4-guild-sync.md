---
editorial: true
title: Guild Sync
subtitle: GitHub, Remotes, Pull Requests, and Your Dotfiles
hook: "Everything you have built lives on one laptop. If the laptop dies, the work dies with it. Today the save system goes online: you prove who you are with a key, push your repositories to GitHub, open your first pull request, and ship the project every developer eventually builds, a dotfiles repo that can set up a new machine in one command."
read: 65
artifact: "A GitHub account with an SSH key that answers ssh -T git@github.com with your name; quest-log pushed and tracking origin/main; a pull request you opened, reviewed and merged on your own repository; and github.com/YOU/dotfiles, public, with a README, your shell config, your editor settings and a setup script, your first shipped artifact"
diagrams:
  - fig1-local-and-remote
  - fig2-ssh-handshake
  - fig3-push-pull-cycle
  - fig4-pull-request-flow
  - fig5-dotfiles-anatomy
docs:
  - https://github.com
  - https://docs.github.com
  - https://docs.github.com/en/authentication/connecting-to-github-with-ssh
  - https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests
  - https://cli.github.com/manual/
  - https://www.markdownguide.org
  - https://github.com/webpro/awesome-dotfiles
say:
  - "git is the tool on your machine; GitHub is one place to keep a copy. A remote is a name for a URL"
  - "the public key is the padlock you hand out; the private key stays home and never leaves ~/.ssh"
  - "commit locally, push to share, pull before you push; a rejected push means the remote is ahead, not that you are wrong"
  - "a pull request is a conversation about a branch that ends in a merge commit; on someone else's repo, fork first"
  - "your dotfiles are a repository now: clone, run setup, and a new machine is yours in ten minutes"
---

## The hook

So far, everything you have built lives on your laptop. The explorer's journal, the branch quest, the quest log with its two merged timelines; all of it is in one folder on one disk. If that disk dies tonight, Unit 1 dies with it. Last session gave you save points. This session puts the saves somewhere that survives the machine.

> *Every adventurer starts alone. Then there is a morning when they walk into the guild hall: a long room with a board full of quests, a ledger of members, and other people's maps pinned to the walls. The hero signs the ledger, hangs a copy of their own map beside the others, and from that moment they are not a solo traveller any more. Their work is part of something people can see, borrow from, and build on.*

GitHub is the guild hall. It is where developers keep copies of their repositories, read each other's code, propose changes to projects they do not own, and build the public record that will one day be the first thing an employer or a co-founder looks at. Almost every piece of software you use today has a copy of its history on GitHub. By the end of this session so will yours.

The agenda is heavy, and every item is a real thing you will do, not a thing you will read about. You will make an account. You will generate an SSH key pair and understand why it beats a password. You will push the quest log to a remote and watch it appear in a browser. You will clone a repository back down, pull changes, and meet the one message a remote ever sends that frightens people. You will open a pull request, read it the way a reviewer does, merge it, and learn the fork dance for repositories that are not yours. You will pick up two small tools, `stash` and `amend`, for messy moments. And then, for the final act, you build and ship your dotfiles repository: shell config, editor settings, a setup script and a proper README, public, on the internet, with your name on it. Not a tutorial. Not a toy. A real thing that works.

The box on this page can rehearse all of it. It has `git`, it has an SSH toolkit, and it has `gh`, GitHub's own command-line tool, talking to a small GitHub of its own, so that every click the real walkthrough asks you to make in a browser has a command here that does the same thing. Read the shell transcript, then do it for real, in your own terminal, on the real site.

## The idea

Let us separate two words that beginners glue together. **Git** is the program on your machine. It made the commits, it holds the branches, it can do everything it did last session with the network cable unplugged. **GitHub** is a website, run by a company, that hosts Git repositories: it keeps a copy of your `.git` on its servers and puts a web page in front of it. Other companies run the same kind of service (GitLab, Bitbucket, Codeberg). GitHub is the one almost everybody uses, so it is the one we use, but nothing in Git itself knows or cares that GitHub exists.

The thing that connects them is a **remote**. A remote is nothing more than a name for a URL, stored in your repository's configuration. When you tell Git "add a remote called `origin` at this address", you are writing one line into `.git/config`. From then on, `git push origin main` means "send my `main` to the repository at the address I called origin", and `git pull` means "bring down whatever is there and join it to mine". The name `origin` is only a convention, the default Git uses when you clone, and you could call it `guild` if you liked. Everybody calls it `origin`, so you should too, so that every tutorial and every colleague's instructions work on your machine without translation.

![](diagram:session-1-4/fig1-local-and-remote)

Look at the two sides of Fig 1 and notice what is not there. There is no arrow that says "save". Commits are made on your side, by you, exactly as they were last session, and they go nowhere until you push. GitHub never sees your working directory or your staging area; it sees commits, and only the ones you send. This is the single most useful fact about the whole model: **GitHub is not where you write code and it is not a live mirror of your folder.** It is where you put copies of finished saves. People who skip this sentence spend their first month editing files in the GitHub web interface, pulling them down, getting conflicts with their local edits, and concluding that Git hates them. Edit locally, commit locally, push when a save is worth sharing.

A second correction while we are here. Pushing to a *public* repository lets anyone *see* your code. It does not let anyone *change* it. Only the owner and the collaborators the owner adds can push to a repository; everybody else can read, copy, and propose. That proposal mechanism is the pull request, and we will get to it. For now, hold on to this: public means visible, not editable.

### Proving who you are without a password

Before GitHub accepts a push it needs to know the push is from you. The old way was a password, typed on every push, and it was bad for the reasons passwords are always bad: people reused them, people typed them into the wrong window, and anyone who stole one could push as you from anywhere. The professional way, and the way GitHub insists on now for command-line work, is an **SSH key pair**.

A key pair is two files that are mathematically linked. The **private key** is a secret that stays on your machine; it lives in `~/.ssh/id_ed25519`, its permissions let only you read it, and you never paste it, email it, commit it, or show it to anyone, including people who say they are from GitHub. The **public key** is its partner, one line of text in `~/.ssh/id_ed25519.pub`, and it is safe to show to the whole world. You paste that one line into GitHub's settings once. The metaphor that makes it stick: the public key is a padlock, and you can hand out as many copies of the padlock as you like; the private key is the only key that opens it, and there is exactly one.

![](diagram:session-1-4/fig2-ssh-handshake)

The handshake in Fig 2 is what happens, silently, every time you push. Your machine connects and offers the fingerprint of your public key. GitHub finds that fingerprint in your account and, instead of asking for a secret, sends back a random challenge. Your private key signs the challenge, the signature goes back, and GitHub checks the signature against the public key it already has. The private key itself never crosses the wire. Nothing is typed. If the signature matches, you are in; `ssh -T git@github.com` performs exactly this dance and then says hello with your username so you can see it work.

The practical consequences are worth stating plainly. If you lose a laptop, you go to GitHub, delete that laptop's public key from your account, and the laptop is locked out, without changing anything on any other machine. If you get a new laptop, you generate a new pair on it and add the new public key; you do not copy the private key around. And if you ever see your private key in a chat window, a repository, or a screenshot, treat it as burned: delete it from GitHub and make a new pair. The key type we use, `ed25519`, is the modern default, fast and short; you may see older guides using `rsa` with much longer keys, and those still work, but there is no reason to start there today.

### The README and the language it is written in

Every repository you push should have a file called `README.md` at its root. GitHub renders that file on the repository's front page, so it is the first thing anyone sees, including you in six months when you have forgotten what the project was. The `.md` is **Markdown**, a way of writing formatted text in plain text: you type a few punctuation marks and GitHub turns them into headings, lists, links and code. Every README on GitHub uses it, as do issue comments, pull request descriptions, most documentation sites, and the page you are reading now. You will write Markdown nearly every day for the rest of this programme, so learn the eight shapes that cover almost everything:

```markdown
# Heading 1
## Heading 2
### Heading 3

A paragraph is just a line of text. Leave a blank line between paragraphs.

**Bold text** and *italic text* and `inline code`.

- A bullet point
- Another bullet
  - A nested bullet, indented two spaces

1. A numbered list
2. Second item

[Link text](https://example.com)

![Image alt text](path/to/image.png)

> A blockquote, for a note or a quotation.

---
```

A horizontal rule is three dashes on a line of their own. A code block is three backticks on a line, optionally followed by a language name such as `bash` or `json`, then your code, then three backticks to close; GitHub colours the code by language, which is why the name matters. A table is rows of cells separated by `|` with a second row of `---` under the header. That is the whole language, or at least the ninety-five percent of it anyone uses. Markdown is forgiving: if you get something slightly wrong it shows up as the punctuation you typed rather than exploding, and GitHub's **Preview** tab shows you the result before you commit.

> **Note:** Five beliefs to leave behind before the demonstration. *GitHub is where you write code*: no, you write locally and push copies. *If I push, anyone can edit it*: no, they can read it; only collaborators can push, and strangers propose changes through pull requests. *SSH keys are like passwords*: no, they are a pair, and the secret half is never sent anywhere. *Pull requests are for teams*: no, solo developers use them to review their own work before it lands on `main`, and you will do that today. *GitHub costs money*: a free account includes unlimited public and private repositories, which is more than this entire programme needs.

## The demonstration

Seven terminals. The first four follow the live walkthrough: key, push, clone and fork, pull request. The fifth is the two small tools. The sixth, in the next section, is everything going wrong on purpose. The seventh, in Your turn, is the dotfiles build. Each box starts from a blank machine, so later scripts begin by rebuilding what the earlier ones made, compressed into one or two lines; those lines are nothing new, just last session's Git and this session's key setup, chained with `&&`.

**Creating the account** happens in a browser, not a terminal, so the box cannot show it. Go to [github.com](https://github.com), sign up for a free account, and choose your username with care: it becomes part of every URL you will ever share, so pick something you would be happy to see on a résumé. `adventurer-dev` is the one the box uses. Once you are in, come back to the terminal.

**Walkthrough 1: the key.** Check whether you already have keys, generate a pair, start the agent that holds the unlocked key for the session, add the key to it, and read your public key. Then, on the real site, go to **Settings → SSH and GPG keys → New SSH key**, give it a title that names the machine ("My Laptop"), paste the public key, save. In the box, `gh auth login` and `gh ssh-key add` do exactly that click from the command line, which is also how you will do it once you are comfortable. Finally `ssh -T git@github.com` to test. Watch what the test says *before* the key is on GitHub and *after*.

```bash term=ssh-setup
ls -la ~/.ssh
ssh-keygen -t ed25519 -C "arthur@newworld.dev"
ls -la ~/.ssh
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
# on your machine: GitHub → Settings → SSH and GPG keys → New SSH key → paste. In the box, the same click:
gh auth login
gh ssh-key add ~/.ssh/id_ed25519.pub --title "My Laptop"
gh ssh-key list
ssh -T git@github.com
```

Read it in order. The first `ls -la ~/.ssh` fails with *No such file or directory*, or on a machine that has connected to a server before it lists only `known_hosts`; either is what "I have no keys yet" looks like. `ssh-keygen` asks where to save (press Enter for the default) and for a passphrase; a passphrase is a password on the private key file itself, so that a stolen disk still cannot use it, and the agent means you type it once per login rather than once per push. The box leaves it empty for the transcript; on your machine, use one. The randomart picture is a visual fingerprint, there so humans can spot a changed key at a glance. After `ssh-keygen` the directory has two new files, and the permissions tell the story: `-rw-------` on the private key, readable by you alone; `-rw-r--r--` on the public one, readable by anyone. `cat` the `.pub` file and that one line, `ssh-ed25519 AAAA… your@email`, is what you paste into GitHub; the email at the end is only a comment so you can tell keys apart.

The first `ssh -T` is deliberately before the key is uploaded, and the first time you connect you will also be asked whether to trust `github.com`; say yes, and its fingerprint is written to `~/.ssh/known_hosts` so you are never asked again. Then: `Permission denied (publickey)`. That is the exact message you will see on your machine if you forget to paste the key, so learn its face now. After the key is added, the same command says *Hi adventurer-dev! You've successfully authenticated, but GitHub does not provide shell access.* The second half is not an error; GitHub is saying it knows who you are and that this door is for Git, not for a login shell. If you see your username, you are in. The guild recognises you.

**Walkthrough 2: the first push.** Last session's `quest-log` finally leaves the machine. On the site: the **+** in the top right, **New repository**, name it `quest-log`, keep it Public, and do **not** tick "Add a README", because you already have one and two READMEs would mean an immediate conflict. GitHub then shows you three commands under *push an existing repository from the command line*; they are the three in the middle of this box.

```bash term=first-push
# identity, key and login from the previous terminal, compressed (each box starts fresh)
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
ssh-keygen -t ed25519 -C "arthur@newworld.dev" -N "" -f ~/.ssh/id_ed25519 > /dev/null && gh auth login > /dev/null && gh ssh-key add ~/.ssh/id_ed25519.pub --title "My Laptop" > /dev/null
# last session's quest-log, rebuilt in two saves
cd ~ && mkdir quest-log && cd quest-log && git init -q
printf "# Quest Log\nTracking my adventures in the terminal world.\n" > README.md && mkdir quests && echo "Learn Git and GitHub" > quests/main-quest.txt && printf "*.log\ntemp/\n.DS_Store\n" > .gitignore
git add . && git commit -q -m "Initial commit: set up quest log"
echo "Build a dotfiles repo" > quests/side-quest-2.txt && git add . && git commit -q -m "Add the dotfiles side quest"
git log --oneline
git remote -v
# on your machine: github.com → New repository → quest-log, Public, no README. In the box, the same click is one command:
gh repo create quest-log --public
git remote add origin git@github.com:adventurer-dev/quest-log.git
git remote -v
git branch -M main
git push -u origin main
git status
echo "## Pushed to GitHub!" >> README.md
git add README.md
git commit -m "Update README: celebrate first push to GitHub"
git push
git log --oneline
gh repo view
```

The first `git remote -v` prints nothing: a fresh repository has no remotes. `git remote add origin <url>` writes one, and the second `-v` shows it twice, once for fetch and once for push, because Git allows them to differ (they almost never do). `git branch -M main` renames the current branch to `main` if it was not already; on your machine, with `init.defaultBranch` set last session, it is a no-op, but GitHub prints it for people with older defaults, so it does no harm. Then the line that matters: `git push -u origin main`. Read its output. Git counts objects, compresses them, writes them, and then prints `* [new branch] main -> main`: your `main` has created a `main` on origin. The `-u` (long form `--set-upstream`) records that your local `main` *tracks* `origin/main`, which is why the next `git status` can say *Your branch is up to date with 'origin/main'* and why, from now on, a bare `git push` and `git pull` know where to go without being told.

Refresh the GitHub page on your machine and your files are there, with the README rendered. Then the second loop: edit, add, commit, push. This time push prints `<old hash>..<new hash> main -> main`, the seven-character hash origin had followed by the one it has now, which is the shape of every ordinary push for the rest of your life. `git log --oneline` now decorates the top commit with both `HEAD -> main` and `origin/main`: your label and the remote's label on the same save, which is the picture of "in sync". `gh repo view` prints the README as GitHub would render its text. Look at that. Your code is on the internet.

> **Tip:** The remote name `origin/main` is a label Git keeps for you, updated only when you push or fetch. It is not live. If a teammate pushes, your `origin/main` does not move until you ask. That is why Fig 3's loop starts with `pull`: it is how you find out where origin really is.

![](diagram:session-1-4/fig3-push-pull-cycle)

Fig 3 is the loop you will run every working day from now until you retire: pull, edit, add, commit, push, and tomorrow pull again. It has one refusal built into it, the rejected push, which the Where-it-breaks box stages on purpose so that the first time it happens for real you recognise it. The next two walkthroughs fill in the verbs the loop needs that you have not met: clone and pull.

**Walkthrough 3: clone, pull, and the fork.** Clone is how you get a repository that already exists on GitHub onto your machine, whether it is someone else's project or your own from a second computer. It copies *everything*: all commits, all branches, the whole history, and it sets up `origin` and the tracking for you, so a cloned repository is ready to push and pull the moment it lands. Pull is how you bring down changes made elsewhere; for now treat it as one verb, and know that it is really two, `fetch` (download their commits, touch nothing of yours) followed by `merge` (join them into your branch). We will take `fetch` apart later in the programme.

The guild in the box has a repository called `newworld-guild/quest-board`. It exists only inside the box, on the page's pretend GitHub, so rehearse this walkthrough here rather than on your machine (the real github.com has no `newworld-guild`, and a clone would answer *Repository not found*). You are a member of the guild but not an owner of that repository, which is the normal situation for every open-source project you will ever meet. Watch what happens when you try to push to it, and then watch the right way.

```bash term=clone-and-fork
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
ssh-keygen -t ed25519 -C "arthur@newworld.dev" -N "" -f ~/.ssh/id_ed25519 > /dev/null && gh auth login > /dev/null && gh ssh-key add ~/.ssh/id_ed25519.pub --title "My Laptop" > /dev/null
cd ~/projects
git clone git@github.com:newworld-guild/quest-board.git
cd quest-board
ls
git log --oneline
git remote -v
git pull
echo "adventurer-dev" >> adventurers.txt
git commit -am "Add adventurer-dev to the guild roll"
git push
# not your guild hall: fork it, then clone your fork
cd ~/projects && rm -rf quest-board
gh repo fork newworld-guild/quest-board --clone
cd quest-board
git remote -v
git checkout -b add-adventurer
echo "adventurer-dev" >> adventurers.txt
git commit -am "Add adventurer-dev to the guild roll"
git push -u origin add-adventurer
gh pr create --title "Add adventurer-dev to the guild roll" --body "Joining the guild. Completed the welcome quest."
gh pr list
gh pr merge 1 --merge
```

The clone prints the same counting and compressing lines a push does, in the other direction, then `ls` shows the files and `git log --oneline` shows a history you did not write, with `origin/main` already decorating the top. `git pull` says *Already up to date*, which is the boring, correct answer when nobody has pushed since you cloned. Then the commit and the push, and the push is refused: `ERROR: Permission to newworld-guild/quest-board.git denied to adventurer-dev.` Read it carefully, because the next line, *Could not read from remote repository*, is Git's generic wrapper and sends people chasing the wrong problem. The first line is the truth: the key worked, GitHub knows exactly who you are, and you are not allowed to write here.

So you **fork**. A fork is a copy of someone else's repository made *on GitHub*, under your account: `newworld-guild/quest-board` becomes `adventurer-dev/quest-board`, with a "forked from" line under its name. On the site it is the **Fork** button at the top right of the repository page; in the box, `gh repo fork … --clone` presses it and clones the result in one move. Look at `git remote -v` afterwards: two remotes. `origin` is *your* fork, which you can push to, and `upstream` is the original, which you can only read from; that second remote is how you will later pull in the maintainers' new commits to keep your fork current. Branch, commit, push to origin as before, and then `gh pr create` opens a pull request *from your fork's branch into the original repository*; the output says so: `adventurer-dev:add-adventurer into main in newworld-guild/quest-board`. `gh pr list`, run inside the fork, shows the open request on the upstream. And `gh pr merge` fails, on purpose, with a permissions error, because merging into the guild's repository is the guild's decision. You proposed; they dispose. That is not a limitation of the box. It is how every open-source project on Earth accepts contributions, and when you fix a typo in someone's documentation six months from now, this is the dance you will do.

Fork versus clone, once more, because the words are a common stumble: **fork** copies on GitHub, from their account to yours; **clone** copies from GitHub down to your machine. To contribute to a project you do not own, you do both, in that order.

**Walkthrough 4: the pull request on your own repository.** The dance you just did against the guild is the same one you will use on your own work, with one difference: you are also the reviewer, so you get to press Merge. A pull request is a branch asking to join another, with a page around it where the change can be read, discussed, and approved. Even alone, it is worth the ceremony, because the **Files changed** tab shows you your own diff the way a stranger would see it, and you will catch things there that you never catch in the editor.

![](diagram:session-1-4/fig4-pull-request-flow)

```bash term=pull-request
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
ssh-keygen -t ed25519 -C "arthur@newworld.dev" -N "" -f ~/.ssh/id_ed25519 > /dev/null && gh auth login > /dev/null && gh ssh-key add ~/.ssh/id_ed25519.pub --title "My Laptop" > /dev/null
cd ~ && mkdir git-quest && cd git-quest && git init -q && echo "# Git Quest" > README.md && git add . && git commit -q -m "Initial commit: add README"
gh repo create git-quest --public --source=. --remote=origin --push
git checkout -b add-achievements
echo "# Achievements" > achievements.txt
echo "- [x] Set up dev environment" >> achievements.txt
echo "- [x] Learn terminal basics" >> achievements.txt
echo "- [x] Learn Git" >> achievements.txt
echo "- [x] Push to GitHub" >> achievements.txt
echo "- [ ] Create first PR" >> achievements.txt
git add achievements.txt
git commit -m "Add achievements tracker"
git push -u origin add-achievements
# on your machine: the yellow "Compare & pull request" banner, a title, a description, Create pull request. In the box:
gh pr create --title "Add achievements tracker" --body "This PR adds an achievements.txt file to track progress through the programme."
gh pr list
gh pr view 1
# on your machine: Files changed, Conversation, then the green Merge pull request → Confirm merge. In the box:
gh pr merge 1 --merge
git checkout main
git pull
ls
git log --oneline --graph
git branch -d add-achievements
git push origin --delete add-achievements
git branch -a
```

A new repository, created and pushed in one line this time with `gh repo create --source=. --push`, which is the command-line version of the New repository button plus the three push commands. Then a branch, `add-achievements`, a file, a commit, and `git push -u origin add-achievements`: a branch other than `main` going up, and GitHub replying `* [new branch]`. On the site, within a minute of that push, the repository page shows a yellow banner, *add-achievements had recent pushes*, with a **Compare & pull request** button. Click it. Write a title that says what the change is and a description that says why; both are Markdown, and both are what your reviewer reads first. **Create pull request**. In the box, `gh pr create` does the same and prints the request's URL.

Now read it like a reviewer. `gh pr view` shows what the web page shows at the top: the title, *Open*, who wants to merge how many commits from which branch into which, and the size of the change, `+6 -0`. On the site, open **Files changed**: every line added is green, every line removed is red, and you can click any line to leave a comment on it. **Conversation** is where those comments and the description live. When it is right, the green **Merge pull request** button, then **Confirm merge**; `gh pr merge 1 --merge` is that pair of clicks. GitHub makes the merge commit *on origin*, not on your machine, which is why the next three lines matter: `git checkout main`, `git pull`, and `ls` shows `achievements.txt` has arrived. `git log --oneline --graph` draws the shape: a merge commit at the top, *Merge pull request #1 from adventurer-dev/add-achievements*, with the `|\` and `|/` of last session's three-way merge under it. It is the same merge; the review is the new part.

The last three lines are hygiene. `git branch -d` deletes your local label; `git push origin --delete add-achievements` deletes the remote one (the site offers a **Delete branch** button right after the merge that does the same); `git branch -a` lists local and remote branches together and shows only `main` and `remotes/origin/main` left. Merged branches should disappear. A repository with forty stale branches tells everyone who opens it that nobody is minding the hall.

**Two tools for messy moments.** Before the dotfiles build, two small commands that will save you constantly. `git stash` takes every uncommitted change in your working directory and puts it in a pocket dimension, leaving the folder clean so you can switch branches, pull, or deal with an emergency; `git stash list` shows what is in the pocket; `git stash pop` brings the most recent one back. `git commit --amend` replaces your last commit with a corrected one: with `-m` to fix a typo in the message, or after a `git add` with `--no-edit` to include a file you forgot. Both are in the box.

```bash term=stash-and-amend
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
cd ~ && mkdir pocket && cd pocket && git init -q && echo "hp: 100" > hero.txt && git add . && git commit -q -m "Create hero"
git checkout -q -b potions
echo "potion: 3" >> hero.txt
git status --short
# an urgent fix is needed on main, and this half-finished line is not ready to be a commit
git stash
git status
git checkout main
echo "mp: 50" >> hero.txt && git commit -qam "Give the hero mana"
git checkout potions
git stash list
git stash pop
cat hero.txt
git commit -am "Carry potoins"
git log --oneline
git commit --amend -m "Carry potions"
git log --oneline
echo "gold: 10" > purse.txt
git add purse.txt
git commit --amend --no-edit
git show --stat HEAD
git log --oneline --all --graph
```

Follow the stash first. On `potions` with a half-written line, `git stash` reports *Saved working directory and index state WIP on potions*, and `git status` immediately says *nothing to commit, working tree clean*: the change is gone from the folder and safe in the pocket. Switch to `main`, make the urgent fix, commit, switch back. `git stash list` shows `stash@{0}` still waiting; `git stash pop` restores it and drops it from the list, and `cat hero.txt` shows the potion line back where you left it, with no sign of `main`'s mana line, because `potions` branched before that commit existed. Then the amend. The first commit's message has a typo. `git commit --amend -m "Carry potions"` *replaces* it: look at the two `git log --oneline` outputs and notice the hash at the top is different. That is not the same commit with a new message; it is a new commit, and the old one is unreferenced. Add a forgotten file and `--amend --no-edit`, and the hash changes again while the message stays, and `git show --stat HEAD` lists both files in the one save.

> **Note:** Amend rewrites history, and that is fine exactly as long as nobody else has the history you are rewriting. Only amend commits you have **not pushed**. If you amend a pushed commit, your `main` and `origin/main` now disagree about what the last commit is, your next push is rejected, and the "fix" people reach for, `git push --force`, overwrites the remote and destroys whatever anyone else pulled in between. The rule is short: amend before push, never after. (The same warning covers `git rebase`, which you will meet later; it is amend at scale.)

## Where it breaks

Everything in this box is wrong, in the order these things go wrong on a real first day with a remote. Read each message before reading the paragraph that explains it; the point of the exercise is to make the messages legible.

```bash term=broken may-fail
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
cd ~ && mkdir lost && cd lost && git init -q && echo "map" > map.txt && git add . && git commit -q -m "Draw the map"
ssh -T git@github.com
git push
ssh-keygen -t ed25519 -C "arthur@newworld.dev" -N "" -f ~/.ssh/id_ed25519 > /dev/null && gh auth login > /dev/null && gh ssh-key add ~/.ssh/id_ed25519.pub --title "My Laptop"
git push origin main
gh repo create lost --public > /dev/null
git remote add origin git@github.com:adventurer-dev/lost.git
git remote add origin git@github.com:adventurer-dev/lost.git
git push
git push -u origin main > /dev/null
git clone git@github.com:adventurer-dev/treasure.git
# a teammate (you, in a second clone) pushes first
cd ~ && git clone -q git@github.com:adventurer-dev/lost.git teammate && cd teammate
echo "x marks the spot" >> map.txt && git commit -qam "Mark the treasure" && git push -q
cd ~/lost
echo "here be dragons" >> map.txt && git commit -qam "Warn about dragons"
gti push
git push
git pull
git status
cat map.txt
echo "map" > map.txt && echo "x marks the spot" >> map.txt && echo "here be dragons" >> map.txt
git add map.txt && git commit -m "Merge origin/main: keep both notes on the map"
git push
git log --oneline --graph
```

**`Permission denied (publickey)`.** From `ssh -T` with no key on GitHub yet. GitHub is not refusing you; it has never heard of you. Either there is no key pair on this machine, or the public key was never pasted into Settings, or the agent is not holding the private key (`ssh-add -l` lists what it holds; an empty list after a reboot is common, and `ssh-add ~/.ssh/id_ed25519` fixes it). Nine times out of ten on a first day it is the paste that was skipped.

**`fatal: No configured push destination`.** You pushed from a repository that has no remotes. Git even prints the command you need. Add the remote, then push.

**`fatal: 'origin' does not appear to be a git repository`.** You named a remote that does not exist in this repository, perhaps because you cloned and renamed, perhaps because you are in a different repository than you think. `git remote -v` tells you what names exist here; the fix is to add the one you meant.

**`error: remote origin already exists`.** The opposite mistake: you ran `git remote add origin` twice, usually while following two tutorials at once. Harmless. If the existing one has the wrong URL, `git remote set-url origin <url>` changes it; if you want to start over, `git remote remove origin` and add again.

**`fatal: The current branch main has no upstream branch`.** The remote exists but your branch does not yet know which remote branch it tracks; this is what a first push without `-u` produces. Do what the message says, `git push --set-upstream origin main` (identical to `-u`), once, and thereafter bare `git push` works.

**`ERROR: Repository not found`** from a clone. The URL has a typo, the repository is private and your key is not on an account that can see it, or the owner renamed or deleted it. Copy the URL from the green **Code** button on the repository page rather than typing it.

**`gti: command not found`.** A typo. The shell did not find a program called `gti`. Remember this one from Session 1.2; it is included here because under stress people read *command not found* as a Git problem and start reinstalling things.

**`! [rejected] main -> main (fetch first)`.** The important one, and the one that is not a mistake at all. While you were working, someone pushed to `origin/main` (here the "someone" is you, in a second clone called `teammate`). Your `main` and theirs both grew from the same commit, so yours cannot simply replace theirs, and Git refuses to throw their work away. The hint says exactly what to do: `git pull` first. Here the pull produces a **conflict**, because both of you appended to the same line of `map.txt`, and the markers from Session 1.3 appear in the file, this time with a long hash after `>>>>>>>` instead of a branch name, because the other side came from a fetch rather than a local branch. Resolve it the same way, keeping both lines in the order you want, `git add`, `git commit`, and now `git push` succeeds. `git log --oneline --graph` shows the merge commit with two parents, one from each clone. Most pulls do not conflict; two people editing the same line within minutes of each other is unusual. The shape of the fix is the same whether they do or not.

Two more that the box cannot show. **Pushing the private key**, by running `git add .` in a folder that has a `.ssh` directory or a downloaded key file in it: the moment that commit is pushed, the key is public and must be treated as burned, even if you delete the file in the next commit, because the history keeps it. Keep keys out of repositories, keep `.env` in `.gitignore` from the first commit, and if it ever happens, rotate the key on GitHub before you do anything else. And **HTTPS versus SSH URLs**: a repository cloned with an `https://github.com/…` URL will ask for a username and a token on every push, because the key is not involved. `git remote set-url origin git@github.com:you/repo.git` switches it to SSH and the prompts stop.

## Your turn

First, the promise from last session, for real, on your machine: push `quest-log`. Create an empty `quest-log` repository on GitHub, no README, then in your terminal `cd ~/quest-log`, `git remote add origin git@github.com:YOU/quest-log.git`, `git branch -M main`, `git push -u origin main`, and refresh the page. Your two merged timelines are on the internet, with the graph visible under **Insights → Network** if you want to see GitHub draw it.

**Guided lab: Build your dotfiles repo (45 minutes).** This is the mini project, your first real shipped artefact. A dotfiles repository is the collection of configuration files, the ones whose names start with a dot, that make a machine *yours*: your shell aliases, your editor settings, the extensions you rely on, and a script that puts it all in place. Every experienced developer has one; search "dotfiles" on GitHub and you will find hundreds of thousands. Yours starts today and grows for the rest of your career. The box builds the whole thing; follow along in it, then do it on your machine with your own name in it.

![](diagram:session-1-4/fig5-dotfiles-anatomy)

```bash term=dotfiles
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
ssh-keygen -t ed25519 -C "arthur@newworld.dev" -N "" -f ~/.ssh/id_ed25519 > /dev/null && gh auth login > /dev/null && gh ssh-key add ~/.ssh/id_ed25519.pub --title "My Laptop" > /dev/null
cd ~ && mkdir dotfiles && cd dotfiles && git init
printf '# Arthur'"'"'s shell configuration\nalias ll="ls -la"\nalias la="ls -a"\nalias gs="git status"\nalias ga="git add"\nalias gc="git commit"\nalias gp="git push"\nalias gpl="git pull"\nalias gl="git log --oneline --graph"\nalias cls="clear"\nalias ..="cd .."\nalias ...="cd ../.."\nalias home="cd ~"\nalias projects="cd ~/projects"\nmkdir -p ~/projects\necho "Welcome back, $(whoami). Let'"'"'s build something."\n' > .zshrc
cat .zshrc
grep -c alias .zshrc
mkdir -p vscode
printf '{\n  "editor.fontSize": 16,\n  "editor.tabSize": 2,\n  "editor.wordWrap": "on",\n  "editor.formatOnSave": true,\n  "editor.minimap.enabled": false,\n  "files.autoSave": "onFocusChange",\n  "git.autofetch": true\n}\n' > vscode/settings.json
printf 'dbaeumer.vscode-eslint\nesbenp.prettier-vscode\nritwickdey.LiveServer\neamodio.gitlens\npkief.material-icon-theme\n' > vscode/extensions.txt
printf '.DS_Store\n*.log\n.env\n' > .gitignore
git add . && git commit -m "Initial commit: shell config, VS Code settings, and extensions list"
printf '#!/bin/bash\necho "=== Starting Dev Environment Setup ==="\nmkdir -p ~/projects\n[ -f ~/.zshrc ] && cp ~/.zshrc ~/.zshrc.backup\ncp .zshrc ~/.zshrc\necho "Shell config linked."\necho "=== Setup Complete ==="\n' > setup.sh
chmod +x setup.sh
./setup.sh
source ~/.zshrc
gs
printf '# Dotfiles\n\nMy development environment, built in Unit 1.\n\n## Quick start\n\n    git clone git@github.com:adventurer-dev/dotfiles.git ~/dotfiles\n    cd ~/dotfiles && chmod +x setup.sh && ./setup.sh\n\n## What is in here\n\n- .zshrc: aliases and a welcome line\n- vscode/: editor settings and extensions\n- setup.sh: one-command setup\n' > README.md
ga . && gc -m "Add setup script and README"
gh repo create dotfiles --public --source=. --remote=origin --push
gl
gh repo view
```

The box writes files with `printf` because it has no editor; on your machine, use `code .zshrc` and type or paste. Watch three moments in the transcript. `grep -c alias .zshrc` counts your aliases, thirteen here; the checkpoint is at least twelve. `./setup.sh` runs the script you just made executable, backs up any existing shell config, copies the new one into place, and `source ~/.zshrc` loads it into the running shell, which is why the welcome line prints and why `gs`, `ga`, `gc` and `gl` work as commands for the rest of the box. And `gh repo create dotfiles --public --source=. --remote=origin --push` creates the repository, adds the remote and pushes in one line; `gl` (your new alias for `git log --oneline --graph`) shows two commits with `origin/main` on top, and `gh repo view` prints the README. On your machine, do that last step as the three clicks and three commands from the first walkthrough, then open the page and read your README rendered. It should look like a project. It is one.

**Part 1: the structure (20 minutes).** `mkdir ~/dotfiles`, `cd` in, `git init`. Create `.zshrc` with this content, your name in the header:

```bash
# ================================
# Arthur's Shell Configuration (zsh)
# ================================

# Aliases: shortcuts for commands you use all the time
alias ll="ls -la"
alias la="ls -a"
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gpl="git pull"
alias gl="git log --oneline --graph"
alias cls="clear"
alias ..="cd .."
alias ...="cd ../.."
alias home="cd ~"
alias projects="cd ~/projects"

# Create a projects folder if it does not exist
mkdir -p ~/projects

# Custom prompt: the current folder (Session 1.5 adds the git branch)
PS1='%F{cyan}%~%f $ '

# Welcome message
echo "Welcome back, $(whoami). Let's build something."
```

Every machine has one shell, but your dotfiles will outlive this machine, so the repo ships **both** files: the `.zshrc` above for a Mac, and a `.bashrc` for WSL and Linux. The aliases, the `mkdir -p ~/projects` line and the welcome line are identical in the two files; only the prompt line changes, because the two shells describe a prompt differently. zsh wants `%~` for the folder and `%F{cyan}` for a colour. Bash wants `\w` for the folder and escape codes wrapped in `\[ \]` for the colours. So in `.bashrc`, replace the prompt line with this one:

```bash
# Custom prompt: the current folder (bash; Session 1.5 adds the git branch)
export PS1="\[\033[36m\]\w\[\033[00m\] $ "
```

Write the file for your own shell first (`echo $SHELL` tells you which) and copy it to the other name with the prompt line swapped. The prompt is deliberately plain today: it shows the folder and nothing else, so that every line in the file is one you can read. [Session 1.5](/path/1-5-the-scribes-hand/) adds a small function that puts the current branch next to it, which you will come to rely on. Then `mkdir -p vscode` and `vscode/settings.json`:

```json
{
  "editor.fontSize": 16,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.formatOnSave": true,
  "editor.minimap.enabled": false,
  "editor.bracketPairColorization.enabled": true,
  "terminal.integrated.fontSize": 14,
  "files.autoSave": "onFocusChange",
  "workbench.colorTheme": "Default Dark+",
  "explorer.confirmDelete": false,
  "git.confirmSync": false,
  "git.autofetch": true
}
```

Then `vscode/extensions.txt`, one extension id per line. An id is `publisher.name`, the string under the title on an extension's page in the VS Code marketplace, and `code --install-extension <id>` installs it from the terminal; these eight are the ones this path relies on, with what each does:

```text
dbaeumer.vscode-eslint
esbenp.prettier-vscode
ritwickdey.LiveServer
eamodio.gitlens
rangav.vscode-thunder-client
pkief.material-icon-theme
formulahendry.auto-rename-tag
formulahendry.auto-close-tag
```

- `dbaeumer.vscode-eslint`: ESLint, underlines JavaScript mistakes as you type (Unit 3 on).
- `esbenp.prettier-vscode`: Prettier, formats your code on save so indentation is never a debate.
- `ritwickdey.LiveServer`: Live Server, serves an HTML page and reloads it when you save (Session 2.1 puts it to work).
- `eamodio.gitlens`: GitLens, shows who changed each line and when, inside the editor.
- `rangav.vscode-thunder-client`: Thunder Client, a small tool for sending requests to an API (Unit 4).
- `pkief.material-icon-theme`: file-type icons in the explorer, so a `.css` and a `.js` look different at a glance.
- `formulahendry.auto-rename-tag` and `formulahendry.auto-close-tag`: when you type an HTML opening tag the closing tag appears, and renaming one renames the other.

Then a `.gitignore` with `.DS_Store`, `*.log` and `.env`; and the first commit, `Initial commit: shell config, VS Code settings, and extensions list`. Checkpoints: `cat .zshrc` (or `cat .bashrc`) shows at least twelve aliases; `ls -a` shows both rc files; `git log --oneline` shows one commit.

**Part 2: the script, the README, and the push (25 minutes).** Create `setup.sh` with exactly the seven lines the box wrote, `chmod +x setup.sh`, and `ls -la setup.sh` to confirm the `x` in the permissions:

```bash
#!/bin/bash
echo "=== Starting Dev Environment Setup ==="
mkdir -p ~/projects
[ -f ~/.zshrc ] && cp ~/.zshrc ~/.zshrc.backup
cp .zshrc ~/.zshrc
echo "Shell config linked."
echo "=== Setup Complete ==="
```

Read it before you run it; every line is Session 1.2's shell except one. The shebang names bash, `echo` reports, `mkdir -p ~/projects` makes the folder every project from Unit 2 on lives in, and `cp` puts your shell config where the shell looks for it. The one new line is the fourth: `[ -f ~/.zshrc ]` is a test that succeeds if that file exists, and `&&` runs the backup only when it does, so the first run on a fresh machine backs up nothing and a later run backs up whatever is there. On WSL or Linux, write `.bashrc` in both places on those two lines, since bash is the shell that machine runs. That is the whole script for today. The longer one, which picks the rc file by reading `$SHELL`, copies your editor settings and installs the extensions from your list in a loop, needs three shapes of shell sentence you have not met, and [Session 1.5](/path/1-5-the-scribes-hand/) teaches each one on its own before it hands you the file. Run `./setup.sh`, then `source ~/.zshrc` (or `source ~/.bashrc`) to load the new config into the terminal you are sitting in; from the next terminal on, it loads by itself, and `gs` answers as `git status`.

The extensions are installed by hand today, one line each: `code --install-extension dbaeumer.vscode-eslint`, and the same for the other seven ids in `vscode/extensions.txt`. Eight commands is the price of not yet knowing the loop; `code --list-extensions` afterwards lists all eight, and `ritwickdey.LiveServer` in that list is the one Session 2.1 checks for. Then `README.md`, in Markdown, with at least three sections; the model is the one the box wrote, expanded: a one-line description, **What is in here** as a bullet list of the files, **Quick start** as a fenced code block with the clone and setup commands, a **Shell aliases** table, **Built with**, and **Author**. Commit: `Add setup script and README`. Create `dotfiles` on GitHub, Public, no README; `git remote add origin git@github.com:YOU/dotfiles.git`, `git branch -M main`, `git push -u origin main`. Open the page. Read your README rendered. Share the link. You just shipped your first project.

**Independent lab: Polish and personalise (the rest of the session, and the days before Unit 2).** No step-by-step. Requirements: at least five more aliases that are useful to *you*, such as `alias weather="curl wttr.in"`, `alias myip="curl ifconfig.me"`, `alias c="code ."`, `alias h="history | tail -20"`; a `git/` folder holding a `.gitconfig` with your `[user]` name and email, `[init] defaultBranch = main`, `[core] editor = code --wait`, and an `[alias]` section (`s = status`, `l = log --oneline --graph --all`, `co = checkout`, `br = branch`, `ci = commit`); `setup.sh` updated to copy that `.gitconfig` to `~/.gitconfig`; at least two more README sections ("Customisation ideas", "What I would add next", "Resources that helped me"). Make each change on its own branch (`add-more-aliases`, `add-gitconfig`, `update-readme`), merge each into `main`, and push after each merge. And at least one of them must go through a pull request on the site: push the branch, open the PR, read **Files changed**, merge it there, then `git pull` locally. Check every alias works by running `source ~/.zshrc` (or `source ~/.bashrc`) and trying it. Stretch goals: a `Brewfile` or `packages.txt` of the tools you want installed, with `setup.sh` installing them; a custom terminal colour scheme; a prompt from `oh-my-zsh` or `starship` with its config in the repo; a `Makefile` with `make install`, `make backup`, `make update`; and an hour reading other people's dotfiles, starting from the [awesome-dotfiles](https://github.com/webpro/awesome-dotfiles) list, stealing anything you like.

## The quest

By the start of Session 1.5, have on GitHub:

- `ssh -T git@github.com` greeting you by name.
- `quest-log`, pushed, with `git status` on your machine saying *Your branch is up to date with 'origin/main'*.
- At least one pull request you opened, read under **Files changed**, and merged on a repository of your own, visible under the **Pull requests** tab with its **Closed** filter.
- `github.com/YOU/dotfiles`, public, with a README that renders cleanly and has at least three sections, both `.zshrc` and `.bashrc` with at least twelve aliases, `vscode/settings.json` and `vscode/extensions.txt`, and the seven-line `setup.sh`, executable, run once on your machine.

The independent lab is the stretch, not the gate: the extra aliases, the `git/.gitconfig` and the branch-per-change habit can land over the next few days, and every one of them is a pull request waiting to happen. Paste the dotfiles URL into your journal and into your résumé draft; it is the first line of your portfolio.

## Side quests

Three pages in the library look further down roads you walked today. They are written for later units, so read the opening and the first picture, not the code.

## Before next session

Run the loop. Every time you sit down to work: `git pull`; every time you stand up: `git push`. Make the dotfiles changes on branches and merge them. By the time Unit 2 starts, a bare `git push` with nothing to send should feel slightly disappointing, and your GitHub profile page should show a row of green squares on its contribution graph. That graph is public, it is what the industry glances at first, and from today every commit you push paints it.

Spend fifteen minutes on your profile. Add a photo and a one-line bio. Then look at three other people's dotfiles repositories from the awesome-dotfiles list and notice what their READMEs do that yours does not yet; notice, too, that their setup scripts have lines you cannot read yet, an `if` here, a `case` there, a loop, a function or two. Spend another fifteen on the [GitHub Docs page about pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests), which is the reference you will come back to when a PR does something you did not expect.

Here is what exists when the next session opens. `~/dotfiles` is a repository on GitHub with both rc files and a plain prompt, your editor settings, the extension list, a README, and the seven-line `setup.sh`, which has already created `~/projects` on your machine. [Session 1.5](/path/1-5-the-scribes-hand/), The Scribe's Hand, starts from exactly that folder. It teaches the shell as a language, one sentence shape at a time, with a prediction written down before every run, and it ends with the full setup script in this same repository, proven on a fresh clone, and the current branch in your prompt. Nothing is left running between sessions; there is no server yet to stop. The guild hall is open, and your map is on the wall.

> **Say:** "Git is the tool on your machine; GitHub is one place to keep a copy, and a remote is a name for a URL. The public key is the padlock you hand out; the private key stays home and never leaves ~/.ssh. Commit locally, push to share, pull before you push; a rejected push means the remote is ahead, not that you are wrong. A pull request is a conversation about a branch that ends in a merge commit; on someone else's repo, fork first. Your dotfiles are a repository now: clone, run setup, and a new machine is yours in ten minutes."

You have a project on the internet. A real project, with a README and a setup script and configuration you wrote and understand. You are not a future developer. You are a developer, with a public repository and a key that opens the guild hall door. Right now. Today.
