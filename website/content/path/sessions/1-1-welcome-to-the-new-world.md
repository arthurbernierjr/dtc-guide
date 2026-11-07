---
editorial: true
title: Welcome to the New World
subtitle: Terminal, Shell, and Your Dev Environment
hook: "Day one. You wake up in front of a blinking cursor, learn to talk to the machine, and build your first folders and files without touching the mouse."
read: 50
artifact: "A working developer environment (terminal, Git, Node.js, VS Code with the code command) verified from the command line, plus two folder trees built entirely by typing: isekai-camp and dev-environment-practice"
diagrams:
  - fig1-terminal-shell-conversation
  - fig2-command-anatomy
  - fig3-camp-tree
  - fig4-overwrite-vs-append
  - fig5-keyboard-map
docs:
  - https://www.gnu.org/software/bash/manual/bash.html
  - https://www.gnu.org/software/coreutils/manual/html_node/index.html
  - https://explainshell.com
  - https://code.visualstudio.com/docs/configure/command-line
  - https://nodejs.org/en/download
  - https://git-scm.com
  - https://brew.sh
  - https://learn.microsoft.com/en-us/windows/wsl/install
say:
  - "the terminal is a conversation: you type, it answers"
  - "command, options, arguments: what, how, to what"
  - "pwd before you build, ls after"
  - "one arrow replaces, two arrows add"
  - "typos make errors, not disasters"
---

## The hook

Welcome to the New World. You are here because you chose to be here, and that already makes you different from most people.

In every isekai story the main character gets pulled into another world and has to work out the rules from nothing. No tutorial. No map. A strange place, a few starter items, and the choice to either stand there or start walking. Today you are that character. The terminal is the new world. The blinking cursor is the spot where you spawned. By the end of this session you will have your first skills unlocked, a working developer environment on your machine, and two folder trees you built by typing, not clicking.

> *You open your eyes. There is no sky, only a dark window with a short line of text and a small blinking rectangle. Nothing happens. The rectangle keeps blinking. It is, you slowly realise, waiting for you.*

Here is the plan. First we set up a professional development environment on your computer: the same tools working developers open every morning, nothing watered down. Then we learn to talk to the machine. You type a line, the computer answers. That is genuinely all the terminal is: a conversation. You will learn the shape every command has, your first six commands, and how to make folders and files from the command line and open them in VS Code. Then you build. A camp, a base, a journal entry written one line at a time.

I do not care if you have never opened a terminal before. I do not care if you have decided this is not for you. That is old-world thinking. In this world the only stat that matters is whether you show up and do the work. Day one. Right now.

One thing about this page before we start. Shell sessions cannot run in the little JavaScript boxes the later units use, so this page carries something new: **a terminal of its own**. Under some code panels you will find a dark screen with a prompt. Press **Run in terminal** and the page types the commands for you, one by one, and shows exactly what a real shell would answer. Then the prompt is yours: type anything, press Enter, and it answers you too. It is a faithful imitation of Bash with a small pretend filesystem (your home there is `/home/adventurer`), and nothing you type in it can touch your actual computer, which makes it the perfect place to make mistakes. It is not a substitute for the real thing. Do everything here, then do it again in the real terminal on your machine. The versions and dates it prints are the page's, not yours.

## The idea

**What the terminal is.** A text-based way to talk to your computer. Instead of clicking icons and dragging folders, you type commands and read answers. The graphical desktop is the passenger seat: comfortable, limited, built so you cannot reach the controls. The terminal is the cockpit.

![](diagram:session-1-1/fig1-terminal-shell-conversation)

Three words get used for this, and people lose a week worrying about the difference. The **terminal** is the window, the app you open: Terminal.app or iTerm2 on a Mac, Windows Terminal or Git Bash on Windows, GNOME Terminal or Konsole on Linux. The **shell** is the language spoken inside that window, the program that reads what you type and does it: Bash on most Linux machines and in Git Bash, Zsh on every Mac since 2019. The **console** is just another word people use for the same experience. For everything you will do in this programme, you interact with the window and the shell at the same time and never need to tell them apart. The terminal is the window; the shell is the interpreter inside it. Done.

**Why developers live here.** Four reasons, and the fourth is the real one.

*Speed.* Once you know the words, typing is faster than clicking. The classic day-one demo: make a folder, put ten files in it, open the whole thing in your editor. About five seconds. Now do it with the mouse: right-click, New Folder, type the name, double-click into it, right-click, New File, type the name, ten times, then find the editor and drag the folder onto it. Try it here.

```bash term=five-seconds
mkdir speed-demo
touch speed-demo/01.txt speed-demo/02.txt speed-demo/03.txt speed-demo/04.txt speed-demo/05.txt speed-demo/06.txt speed-demo/07.txt speed-demo/08.txt speed-demo/09.txt speed-demo/10.txt
ls speed-demo
code speed-demo
```

*Power.* Some things can only be done from the terminal. Connecting to a server, running a build, installing packages, most of Git: either terminal-only or so much faster there that nobody does it any other way.

*Automation.* Anything you can type, you can save in a file and run again. The boring work you did by hand on Monday is a script by Friday.

*Servers.* Every server in the world runs on the command line. There is no desktop on the machine that serves your bank's website, no icons, no mouse. When you deploy something to a server of your own in Unit 6, this is the only interface that will exist. Every developer job posting assumes you can do this, because every developer does.

**The anatomy of a command.** This is the single most useful idea on the page, so slow down for it. Every line you will ever type into a shell has the same shape:

![](diagram:session-1-1/fig2-command-anatomy)

`command [options] [arguments]`. The **command** is the first word: what to do. `ls`, `mkdir`, `echo`. **Options**, also called flags, say how to do it and start with a dash: `-p`, `-la`, `--version`. **Arguments** say what to do it to: a file name, a folder name, a piece of text. Square brackets mean optional. Spaces separate the pieces, which is the first thing that will bite you: a folder called `my website` is, to the shell, two arguments called `my` and `website`. Hold that thought; it comes back in Where it breaks.

Once you can name the three slots, an unfamiliar command stops being a spell and becomes a sentence. `mkdir -p projects/isekai/unit-01` reads: make a directory, with parents, at this path. And when the options confuse you, the manual is one command away: `man ls` opens the page for `ls`, `ls --help` prints the short version, and [explainshell.com](https://explainshell.com) will take any line you paste and label every piece.

**Your first six commands.** Not flashy. Essential. Like learning to walk before you can run.

- `echo` makes the terminal say something back. `echo "Hello World"` prints `Hello World`. It sounds useless until you learn, in about twenty minutes, that it is also how you write text into files.
- `pwd` is **p**rint **w**orking **d**irectory: "where am I right now?" You are always somewhere; the shell always has a current folder, and `pwd` names it. On a Mac that is `/Users/yourname`; on Linux and WSL it is `/home/yourname`.
- `whoami` answers "who am I logged in as?" with your username. Combined with `echo` and `$(...)`, which runs a command and pastes its answer into the line, you get your first bit of real shell: `echo "My name is $(whoami) and I am a developer now"`.
- `date` prints the date and time.
- `clear` wipes the screen. The text is gone from view, not from history. `Ctrl+L` does the same.
- `history` prints everything you have typed, numbered. Your own breadcrumb trail.

```bash term=starter-skills
echo "Hello World"
echo "My name is $(whoami) and I am a developer now"
pwd
whoami
date
echo $SHELL
history
clear
echo "Level 1 complete"
```

Press Run, watch, then type at the prompt yourself. Press the up arrow: your last command comes back, ready to run again or edit. `echo $SHELL` is a bonus: `SHELL` is a variable the system set for you, the dollar sign reads it, and the answer tells you which shell you are talking to. On this page it is Bash. On your Mac it will say `/bin/zsh`, and everything in this session works identically in both.

> **Say:** "The terminal is a conversation: you type, it answers. Command, options, arguments: what, how, to what. pwd before you build, ls after. One arrow replaces, two arrows add. Typos make errors, not disasters."

**The things people believe on day one that are not true.** "The terminal is only for hackers and Linux people": every professional developer on every operating system uses it daily; it is the standard tool, not the fringe one. "Terminal, shell and console are three things to learn separately": one experience, covered above. "The desktop can do everything the terminal can": connecting to servers, build scripts, Git, package management, are terminal-only or dramatically faster there. And the one that actually stops people: **"if I type the wrong command I will break my computer."** You will not. Most commands are safe. The genuinely dangerous ones, `rm -rf` and anything with `sudo`, require intent, and we will treat them with respect when they arrive. A typo produces an error message, not a disaster. You will see that happen on purpose further down.

## The demonstration

Two walkthroughs. The first sets up your machine. The second builds something with the commands you just met.

**Walkthrough 1: setting up your dev environment.** You need three tools: **Git** (version control, Session 1.3), **Node.js** (JavaScript outside the browser, Unit 4), and **VS Code** (the editor you will write everything in). The installs differ by operating system; the verification at the end is the same for everyone. These commands run on *your* computer, in your real terminal, so they are shown here as plain code, not as a page terminal.

*macOS.* Open Terminal (Applications › Utilities › Terminal, or press `Cmd+Space` and type "terminal"). Install Homebrew, the package manager that installs everything else, by pasting the one line from [brew.sh](https://brew.sh); it looks like this and asks for your password once:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install Git and confirm your shell:

```bash
brew install git
echo $SHELL
```

For Node, go to [nodejs.org/en/download](https://nodejs.org/en/download), choose the **LTS** release (24 or newer), download the macOS installer and run it. Node is the one tool that moves fast enough that you want the official current build, not whatever a package manager happens to have cached.

Download VS Code from [code.visualstudio.com](https://code.visualstudio.com), open it, press `Cmd+Shift+P`, type **Shell Command: Install 'code' command in PATH**, and run it. That one step is what lets you type `code .` in a terminal and have the editor open on that folder.

*Windows.* Open PowerShell as Administrator and run `wsl --install`, then restart. That gives you WSL2, a real Ubuntu Linux inside Windows, which is where the rest of this programme happens. Pick a username and password when Ubuntu first opens. Install Windows Terminal from the Microsoft Store if it is not already there. Then, inside the Ubuntu terminal, update the system and install Git:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git -y
```

Do **not** install Node with `apt`; Ubuntu's copy is years out of date and Unit 4 needs a current one. Install it the way [nodejs.org/en/download](https://nodejs.org/en/download) shows for Linux, with `nvm`, the Node version manager. Two lines, then close and reopen the terminal before the third:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

```bash
nvm install --lts
node --version
```

The first line downloads and installs `nvm`; the second installs the current LTS release of Node (24 or newer) and makes it the default. Install VS Code from the same site, and in VS Code install the **WSL** extension so the editor opens your Linux files directly.

*Linux.* Open your terminal (`Ctrl+Alt+T` on most distributions) and run the same `apt` lines for Git and the same two `nvm` lines for Node. For VS Code, download the `.deb` from the website and `sudo dpkg -i code_*.deb`.

> **Note:** Installs are the one part of day one that goes wrong for reasons that have nothing to do with you: a slow network, a permissions prompt, an older macOS. If something fails, read the last few lines of the error out loud, search the exact sentence, and keep going. WSL2 in particular takes a while and wants a restart. Nobody gets left behind over an installer.

*Everyone: verify.* Three commands, one per tool. Each prints a version number if the tool is installed and `command not found` if it is not. Run them on your machine; here they are on the page's machine.

```bash term=verify
git --version
node --version
code --version
which git node code
echo $SHELL
```

Your numbers will differ from these and that is fine; what matters is that a number comes back at all, and that `node --version` starts with `v24` or higher (if it says `v12` or `v18`, Node came from `apt`; go back to the `nvm` lines). `which` is the fourth command here and it answers "where does this program live?": the shell found `git` in `/usr/local/bin`, which is how it knew what to run when you typed the word. If `code --version` says command not found on a Mac, you skipped the Shell Command step above.

Take a ten-minute break here if you are following along in real time. In isekai anime even the hero rests at the inn.

**Walkthrough 2: files and folders from the command line.** Five new commands and two symbols. Press Run and read each answer as it appears.

`mkdir` makes a directory, which is the old and correct name for a folder. `mkdir -p` makes a nested path in one go, creating every parent that is missing. `touch` creates an empty file, or several if you give it several names. `ls` lists what is in a folder: on its own, the current one; with an argument, that one. `cat` prints a file's contents to the screen. And `echo` with a `>` sends its text into a file instead of onto the screen.

```bash term=my-website
mkdir -p my-website/css my-website/js my-website/images
touch my-website/index.html my-website/css/style.css my-website/js/app.js my-website/README.md
ls my-website
ls my-website/css
cat my-website/README.md
echo "# My Website" > my-website/README.md
echo "This is my first project." >> my-website/README.md
cat my-website/README.md
tree my-website
code my-website
```

Read what happened. One `mkdir -p` built four folders, because `my-website` did not exist and `-p` made it on the way to `css`. One `touch` made four files in three different folders. The first `cat` printed nothing, because `README.md` was empty, and printing nothing is the correct answer, not a failure. Then the two arrows: `>` wrote the heading into the file, `>>` added a second line under it, and the second `cat` shows both. `tree` draws the result; it is not installed everywhere, so if your machine says command not found, `ls -R` (recursive) shows the same information as a list. Finally `code my-website` opens the folder in VS Code. On this page that is as far as it goes; on your machine the editor appears with the file explorer showing exactly the tree you just built. Put the terminal and VS Code side by side and look at them together once. The folders in the explorer are the folders you typed. There is no magic between them.

> **Tip:** Keep both open all day: terminal on one side, VS Code on the other. Every time you make something in one, look for it in the other. By the end of the week the two views feel like one place seen from two angles, which is exactly what they are.

**The camp.** Here is the same set of commands used to build something bigger, which you will rebuild yourself in a moment. Read the picture first: the commands on the left produce the tree on the right, and each slash in a path is one branch.

![](diagram:session-1-1/fig3-camp-tree)

```bash term=camp
cd ~
mkdir -p isekai-camp/inventory/weapons isekai-camp/inventory/armor isekai-camp/inventory/potions
mkdir -p isekai-camp/quests/main-story isekai-camp/quests/side-quests
mkdir isekai-camp/journal
ls isekai-camp
touch isekai-camp/inventory/weapons/wooden-sword.txt isekai-camp/inventory/armor/cloth-shirt.txt isekai-camp/inventory/potions/health-potion.txt
touch isekai-camp/quests/main-story/learn-the-terminal.txt isekai-camp/journal/day-01.txt
echo "Day 1: I woke up in a terminal." > isekai-camp/journal/day-01.txt
echo "I learned echo, pwd, whoami, mkdir, and touch." >> isekai-camp/journal/day-01.txt
echo "I am starting to think I might actually be able to do this." >> isekai-camp/journal/day-01.txt
cat isekai-camp/journal/day-01.txt
ls -R isekai-camp
code isekai-camp
```

Three things to notice. `cd ~` first: `cd` changes directory (the whole of next session is about moving around), and `~` is shorthand for your home folder, so the line means "go home before you build", which is a habit worth keeping. The journal is written with one `>` and two `>>`: the first line creates the file, the next two add to it. And `ls -R` at the end walks the whole tree and prints every folder with its contents, which is how you check your work without opening anything. Eight directories, five files, and one journal entry that is already true.

## Where it breaks

Four mistakes, all of them made by every beginner, none of them dangerous. The terminal below makes them on purpose so you can see what each one looks like. Press Run and read the red lines; they are the lesson.

```bash term=broken may-fail
mkdir my website
ls
rmdir my website
mkdir "my website"
ls
rmdir "my website"
echo "line one" > notes.txt
echo "line two" > notes.txt
cat notes.txt
mkidr notes
touch notes/today.txt
mkdir notes
touch notes/today.txt
ls notes
cat nots.txt
```

**The space.** `mkdir my website` made two folders, `my` and `website`, because the shell splits arguments on spaces. Look at the `ls`: both are there. Quotes fix it, `mkdir "my website"`, and the second `ls` shows one folder with a space in its name. Fix it and then never do it again: developers name things `my-website` or `my_website` precisely so they never have to quote them. Every path you type for the rest of this path is easier with no spaces in it.

**The single arrow.** `echo "line one" > notes.txt` then `echo "line two" > notes.txt`, and `cat` shows only line two. The first line is gone. There was no warning, no confirmation, no undo. A single `>` empties the file before it writes. This is the one that costs people their journal entry in the lab below, so look at the picture until it is boring.

![](diagram:session-1-1/fig4-overwrite-vs-append)

The rule for the week: first line with `>`, every line after it with `>>`, then `cat` to check. When in doubt, `>>` is the safe one; the worst it can do is add a duplicate line, which you can see and fix.

**The typo.** `mkidr notes` gets `bash: mkidr: command not found`. That is the shell telling you, politely, that there is no program by that name. Nothing happened. Nothing broke. The error names the word it did not recognise, so read it, find the typo, press the up arrow, fix the line, press Enter. This is what "typos make errors, not disasters" looks like in practice.

**The missing parent.** Because `mkidr` did nothing, `notes` does not exist, so `touch notes/today.txt` fails with `cannot touch 'notes/today.txt': No such file or directory`. The shell will not invent a folder for you just because you named a file inside it. The error is accurate: the directory is what is missing, not the file. `mkdir notes` and the same `touch` then succeeds. (`mkdir -p` would also have saved you here: it creates the parents.) The last line is the same error from `cat` with a misspelt filename: `No such file or directory` nearly always means a typo in the path or the wrong current folder. `pwd` and `ls` answer both questions.

> **Note:** Every red line on that screen is the shell being helpful. It tells you which command complained (`touch:`, `cat:`), what it was trying to use, and why it could not. Beginners see red and stop reading; developers see red and read more carefully. Make that switch today and you are ahead of most of the people who started with you.

## Your turn

Two labs, then an independent build. Do all three in your real terminal. The page terminals above are for rehearsing; each one keeps whatever you type until you press Run again, so you can practise a step in the box, then do it for real.

**Pro tips: the keyboard.** The mouse does not work on the command line, which feels like a loss for about a day and then becomes the reason the terminal is fast. These are the keys. Three of them today, the rest when a long line annoys you enough.

![](diagram:session-1-1/fig5-keyboard-map)

Learn `↑` (bring back the last command), `Tab` (finish a file or folder name; press it twice to see every option) and `Ctrl+C` (stop whatever is running, or throw away the line you are typing) right now. Tab in particular is the difference between typing `isekai-camp/inventory/weapons/wooden-sword.txt` and typing `is`, Tab, `in`, Tab, `w`, Tab, `w`, Tab. Then, as you need them: `Ctrl+A` and `Ctrl+E` jump to the start and end of the line; `Ctrl+U` erases everything before the cursor and `Ctrl+K` everything after it, and `Ctrl+Y` pastes back whatever either one erased; `Ctrl+W` deletes just the last word, which is the fastest way to fix a typo at the end of a long path; `Ctrl+R` searches your history as you type, so a command you ran an hour ago is three letters away; `Ctrl+L` clears the screen. The page terminals support `↑`, `↓`, `Tab`, `Ctrl+L` and `Ctrl+C`, so try them there first.

**Lab 1: First Contact (20 minutes).** The goal is comfort: typing commands and reading output until the window stops feeling hostile. Follow each step exactly and look at every answer.

1. Open your terminal.
2. Run `whoami` and note your username.
3. Run `pwd` and note where you are. That is your home directory, and it is where every session starts.
4. Run `echo "I am [your name] and I just entered the new world"`, with your actual name.
5. Run `date`.
6. Run `echo $SHELL` and note whether you are on Bash or Zsh.
7. Run `history` and read your own trail.
8. Press the up arrow three times and watch your previous commands come back; press Enter on one of them.
9. Run `clear`.
10. Run `echo "Level 1 complete"`.

You are done when all ten ran without errors, you can say what `pwd` stands for and does, and you have used the up arrow to recall a command. If you see `Level 1 complete` on your own screen, that is the thumbs-up moment.

**Lab 2: Build Your Adventurer's Camp (25 minutes).** Now build the camp from the demonstration yourself, from scratch, without pressing Run. Go home with `cd ~`. Create the structure with `mkdir` and `mkdir -p`:

```text
isekai-camp/
  inventory/
    weapons/
    armor/
    potions/
  quests/
    main-story/
    side-quests/
  journal/
```

Create the five files with `touch`: `inventory/weapons/wooden-sword.txt`, `inventory/armor/cloth-shirt.txt`, `inventory/potions/health-potion.txt`, `quests/main-story/learn-the-terminal.txt`, and `journal/day-01.txt`, all inside `isekai-camp`. Write the three journal lines into `day-01.txt` with `echo`, using `>` for the first and `>>` for the next two. `cat` the file and read it out loud to yourself. `ls` each folder, or `ls -R isekai-camp` once, and check that everything is where the tree says. Finish with `code isekai-camp` and look at your work in the editor.

Checkpoints: after the folders, `ls isekai-camp` must show `inventory`, `journal` and `quests`. After the journal, `cat isekai-camp/journal/day-01.txt` must show three lines, in order. If it shows one line, you used `>` three times; rewrite it. Only after you have tried it yourself, press Run on the `camp` terminal above and compare, line by line, with what you typed.

**Independent lab: Your First Base Camp.** No step-by-step this time; you have the commands. Start from a clean home in the box below (the three lines just prove where you are), then build the structure in it, and then again on your machine.

```bash term=base-camp
cd ~
pwd
ls
```

Create `dev-environment-practice` in your home directory with this inside it:

```text
dev-environment-practice/
  notes/
    session-01.txt
    commands-learned.txt
  practice/
    hello-world/
      index.html
      style.css
      script.js
    about-me/
      index.html
      style.css
  screenshots/
```

In `notes/session-01.txt`, use `echo` and `>>` to write at least five things you learned today, one per line. In `notes/commands-learned.txt`, list every command from this session with a one-line description, in the form `command - what it does`; there are at least twelve. In `practice/hello-world/index.html`, write a real HTML skeleton with `echo`, one line at a time, single quotes around each line because the lines contain double quotes and angle brackets:

```bash
echo '<!DOCTYPE html>' > practice/hello-world/index.html
echo '<html>' >> practice/hello-world/index.html
echo '<head><title>Hello World</title></head>' >> practice/hello-world/index.html
echo '<body><h1>Hello from the terminal!</h1></body>' >> practice/hello-world/index.html
echo '</html>' >> practice/hello-world/index.html
```

Those five lines assume you have moved into `dev-environment-practice` with `cd`; if you have not, put the folder name in front of each path. When the tree is built, run `ls -R dev-environment-practice` from your home directory. We have not taught the `-R` flag; try it and see what happens, then work out from the output what it does. Then run it once more with the arrow, `ls -R dev-environment-practice > dev-environment-practice/screenshots/tree.txt`, so the `screenshots/` folder holds a text snapshot of the whole tree, and `cat` that file to check it.

Hints: `mkdir -p` builds nested folders in one command. `>` replaces, `>>` adds. If you forget a command, `history` has everything you have typed, and the `commands-learned.txt` you are writing is your own cheat sheet. Stretch goals, if you have time: write in your notes what `ls -R` does; try three commands we did not cover (`cal`, `uptime`, `df -h`) and add them to your list; search "customize zsh prompt" or "customize bash prompt" and give your prompt a colour.

> **Tip:** Check after every command, not after every ten. `ls` costs nothing. The mistake you made thirty seconds ago is obvious; the one from ten commands ago is hidden under nine correct ones.

## The quest

By the start of Session 1.2, have on your machine:

- A verified environment: `git --version`, `node --version` and `code --version` all print a number in your real terminal.
- `isekai-camp` built to the tree, with a three-line `day-01.txt` you have read with `cat`.
- `dev-environment-practice` built to the requirements, with `session-01.txt`, `commands-learned.txt` and the HTML skeleton written entirely with `echo`, and `screenshots/tree.txt` holding the `ls -R` output.
- One honest sentence added to the bottom of `day-01.txt`, with `>>`, about how the first day felt.

Next session starts from the same home directory and builds new folders beside these two, so leave `isekai-camp` and `dev-environment-practice` exactly where they are.

## Side quests

Two pages in the library frame the week around today. Read them in this order; they are short, and they are about you rather than the shell.

## Before next session

Finish the independent lab if you did not finish it here; the folder must be on your machine, fully built, before Session 1.2. Budget one to two hours.

Then open a terminal once a day for no reason. `pwd`, `ls`, `cd` into something, `ls` again, `cat` a file you made. Five minutes. The point is not to learn anything new; it is to stop noticing the window. After a week it is just a place you go.

Next time: Your Status Screen. We learn to move around the whole filesystem: absolute and relative paths, `cd` in every direction, the flags that make `ls` tell the truth, pipes that chain commands together, and permissions, which is why a file sometimes refuses you. Your status screen is about to get a lot more detailed. Nothing to read ahead. Start the next session with the base camp built.

> **Say:** "The terminal is a conversation: you type, it answers. Command, options, arguments: what, how, to what. pwd before you build, ls after. One arrow replaces, two arrows add. Typos make errors, not disasters."

You just completed your first day in the new world. You have a working environment. You can talk to the machine. You can create things with it. That is not nothing. That is everything.
