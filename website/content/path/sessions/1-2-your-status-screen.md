---
editorial: true
title: Your Status Screen
subtitle: Filesystem Navigation, Pipes, and Permissions
hook: "Yesterday you learned to talk. Today you learn to see: where you are in the tree, what is around you, how to chain commands into combos, and why a file sometimes refuses you."
read: 55
artifact: "The filesystem-quest folder with a grep-searched bestiary and an executable quest-start.sh, plus the explorers-journal: notes, a commands list, a discoveries file built with pipes, and two scripts you made runnable with chmod +x"
diagrams:
  - fig1-filesystem-tree
  - fig2-reading-ls-la
  - fig3-pipes-and-redirects
  - fig4-dungeon-moves
  - fig5-permissions
docs:
  - https://www.gnu.org/software/coreutils/manual/html_node/index.html
  - https://www.gnu.org/software/bash/manual/html_node/Redirections.html
  - https://www.gnu.org/software/bash/manual/html_node/Pipelines.html
  - https://www.gnu.org/software/grep/manual/grep.html
  - https://linuxcommand.org/tlcl.php
  - https://explainshell.com
say:
  - "the filesystem is one tree; absolute paths start at the root, relative paths start where you stand"
  - ".. is up, . is here, ~ is home, - is back"
  - "ls -la is the status screen"
  - "a pipe sends output into the next command; an arrow sends it into a file"
  - "permission denied on your own script means chmod +x"
---

## The hook

Last session you learned to talk to the machine. You made files and folders, wrote a journal entry with `echo`, and opened a project in VS Code without touching the mouse. That was your first foothold in the new world.

Today you learn to **see**.

> *Every adventurer who survives the first night learns to open the status screen. Stats, inventory, the map with a small dot that says* you are here. *Without it you walk in circles in the dark. With it, the dungeon is just rooms and doors.*

In the terminal the status screen is built from three commands you half-know already, `pwd`, `ls` and `cd`, plus the flags that make them tell the whole truth. After today you will never feel lost in a filesystem again. You will know where you are, what is around you, who owns it, how big it is, and how to get anywhere in one line.

Then we go further than navigation. You will chain commands together with **pipes**, so the output of one becomes the input of the next: `history | grep mkdir` to find every folder you ever made, `ls -la | grep ".txt"` to see only the text files. You will learn **redirection** properly, the `>` and `>>` from yesterday plus what they are actually doing. And you will meet **permissions**, the system that decides who may read, change and run every file on the machine, and `chmod`, the command that changes it, because the first time you write a script and the shell says *Permission denied* you need to know that it is not a bug, it is a lock, and you have the key.

These are the skills that separate someone who can use a terminal from someone who understands it. By the end you will navigate anywhere, search inside files, build command pipelines, and make scripts executable. Your status screen is about to get a lot more detailed.

As on day one, the page carries terminals. Each has a script you can replay with **Run in terminal**, then a prompt that is yours. Every box starts from the same clean home, `/home/adventurer`, with a few hidden files already in it, which matters today. Nothing you type here touches your machine. Make the mistakes here; then do everything again for real.

## The idea

**The filesystem is a tree.** One tree. At the very top is `/`, called the root, and everything on the machine hangs from it: `/bin` holds programs, `/etc` holds system configuration, `/tmp` is scratch space, `/usr` and `/var` hold more programs and the logs. Somewhere under the root is your home directory: `/home/yourname` on Linux and WSL, `/Users/yourname` on a Mac. The shortcut `~` always means your home, wherever you are.

![](diagram:session-1-2/fig1-filesystem-tree)

Every folder has exactly one parent and any number of children. That single fact is the whole of navigation. If you can see the tree, every path is just a route through it, and there are two ways to write a route.

An **absolute path** starts at the root. `/home/adventurer/Desktop/navigation-practice/dungeon/floor-2/boss-room` is a complete address: it works from anywhere, the way GPS coordinates work from anywhere. You can recognise one instantly: it begins with `/` (or with `~`, which the shell swaps for your home before it looks).

A **relative path** starts from wherever you are standing. From your home, `Desktop/navigation-practice` goes down two branches; from inside `floor-1`, `../floor-2/boss-room` goes up one and down two. Relative paths are shorter and are what you type most of the day, and they are also the source of most "No such file or directory" errors, because they only mean something from the right starting point.

Three tiny names do most of the work. `.` is the directory you are in. `..` is its parent, one step towards the root. `~` is home. And `-`, used only with `cd`, is wherever you were before your last move. The misconception to drop now: absolute and relative paths are not two systems that go to different places. They reach the same folders. One starts from the root, the other from you.

**`cd` is how you move.** `cd ~` or just `cd` goes home. `cd Desktop` goes down. `cd ..` goes up one; `cd ../..` up two. `cd /` goes to the root. `cd -` goes back. And `cd` followed by any path, absolute or relative, takes you there if it exists and tells you clearly if it does not.

**`ls` is how you look, and the flags are its superpowers.** Every command has options, also called flags, that change how it behaves; yesterday they were a footnote, today they are the lesson. `ls` on its own gives you names. `ls -l` gives the long format: permissions, owner, size, date. `ls -a` shows *all* files, including the hidden ones whose names start with a dot. `ls -la` does both and is the single most-typed command in this programme. `ls -lh` prints sizes a human can read (`4.0K` instead of `4096`). `ls -lt` sorts newest first, `ls -lS` biggest first, and `ls -R` walks into every subfolder, which you discovered on your own yesterday.

![](diagram:session-1-2/fig2-reading-ls-la)

A long-format line looks like noise the first time. Read it left to right, once, with the picture. The first character is the type: `d` for a directory, `-` for a plain file. The next nine are the permissions, which we take apart later today. Then a link count you can ignore for now, the owner, the group, the size in bytes, the last-modified date, and the name. That is all it ever is.

**Hidden files** are not secret and not dangerous. Any file whose name begins with a dot is skipped by plain `ls` to keep the listing tidy, because such files are almost always configuration: `.bashrc` and `.zshrc` set up your shell, `.gitignore` will matter next session, `.profile` runs when you log in. `ls -a` shows them. Count them in your own home today; there are more than you think.

**When a command confuses you, ask it.** `man ls` opens the manual page for `ls` (press `q` to leave). `ls --help` prints the short form on Linux and WSL; a Mac's `ls` does not understand `--help`, so there use `man ls`. And [explainshell.com](https://explainshell.com) labels every piece of any line you paste.

**Pipes.** This is where the terminal stops feeling like a list of tricks and starts feeling like a language. Every command has a *standard output*, the text it would print, which normally goes to your screen. The pipe character `|` sends that text somewhere else: into the *standard input* of the next command. `ls -la | grep ".txt"` runs `ls -la`, but instead of showing you the listing, hands it to `grep`, which keeps only the lines containing `.txt` and shows you those. `history | grep "mkdir"` finds every `mkdir` you have ever typed. `cat notes.txt | wc -l` counts the lines in a file.

![](diagram:session-1-2/fig3-pipes-and-redirects)

Nothing is moved or saved when you pipe. The text streams from one program to the next in memory and disappears unless you also send it to a file. Which brings back the arrows. `>` sends standard output into a file, replacing whatever was there. `>>` adds it to the end. They combine with pipes exactly as you would hope: `ls -la | grep ".txt" > text-files.txt` filters first, then saves.

`grep` deserves its own sentence because you will use it every day for the rest of your career. It searches text for a pattern and prints the matching lines. `grep "fire" goblin.txt` finds the lines in that file that mention fire. `grep -i` ignores case. `grep -r "TODO" .` searches every file under the current folder and tells you which file each hit came from. Its pattern is a *regular expression*, which for today means one thing: a dot matches any character, so `".txt"` also matches `my-txt-notes`. `"\.txt"` means a literal dot. You will see that bite in Where it breaks.

**A few more tools for the belt**, each one small. `head file` prints the first ten lines; `head -3` the first three. `tail` prints the last ten. `wc` counts lines, words and characters; `wc -l` just lines. `cp a b` copies; `mv a b` moves or renames, which are the same operation to the machine. `rm file` deletes. `rm -r folder` deletes a folder and everything in it.

> **Note:** The terminal has no recycle bin. When you `rm` something it is gone, immediately, with no confirmation and no undo. `rm -r` on the wrong folder is the one genuinely destructive mistake a beginner can make. Read the line twice before Enter. Type the path with Tab so you cannot misspell it. And never, ever paste an `rm -rf` line from the internet without knowing exactly what every character means.

> **Say:** "The filesystem is one tree; absolute paths start at the root, relative paths start where you stand. .. is up, . is here, ~ is home, - is back. ls -la is the status screen. A pipe sends output into the next command; an arrow sends it into a file. Permission denied on your own script means chmod +x."

## The demonstration

Three walkthroughs: moving, chaining, unlocking. Press Run on each, then redo the parts that surprised you at the prompt.

**Walkthrough 1: the navigation drill.** Build a small dungeon under your Desktop and walk it every way there is. Before each `pwd`, say out loud where you think you are. The picture is the map.

![](diagram:session-1-2/fig4-dungeon-moves)

```bash term=navigation-drill
cd ~
pwd
cd Desktop
pwd
mkdir navigation-practice
cd navigation-practice
mkdir -p dungeon/floor-1/room-a dungeon/floor-1/room-b dungeon/floor-2/boss-room
cd dungeon
ls
cd floor-1
ls
cd room-a
pwd
cd ..
pwd
cd ..
pwd
cd floor-2/boss-room
pwd
cd ~
pwd
cd ~/Desktop/navigation-practice/dungeon/floor-2/boss-room
pwd
cd -
cd
pwd
```

Watch the prompt as much as the output: it shows your current folder after every move, with `~` standing for home. Three things to take from the drill. `cd ..` twice from `room-a` lands in `dungeon`, because each `..` is exactly one step up. `cd floor-2/boss-room` from `dungeon` is a relative path that goes down two branches at once; the same two words would fail from anywhere else. And the long `cd ~/Desktop/...` line is an absolute path, so it works from home, from the root, from inside another dungeon entirely. `cd -` then takes you back to wherever you were, and a bare `cd` is the same as `cd ~`. See how `.` is here and `..` is up? That is the whole trick. Once you have it, you can navigate anywhere.

**Walkthrough 2: the `ls` superpowers and the small tools.** Start at home, look at it properly, then build the `filesystem-quest` folder you will search in a moment.

```bash term=ls-powers
cd ~
ls
ls -a
ls -la
mkdir -p filesystem-quest/maps filesystem-quest/loot filesystem-quest/enemies
touch filesystem-quest/maps/world-map.txt filesystem-quest/maps/dungeon-map.txt filesystem-quest/loot/gold.txt filesystem-quest/loot/sword.txt filesystem-quest/loot/shield.txt
echo "HP: 10, Attack: 2, Weakness: everything" > filesystem-quest/enemies/slime.txt
echo "HP: 30, Attack: 8, Weakness: fire" > filesystem-quest/enemies/goblin.txt
echo "HP: 500, Attack: 50, Weakness: none" > filesystem-quest/enemies/dragon.txt
ls -l filesystem-quest/enemies
ls -lh filesystem-quest/enemies
ls -lS filesystem-quest/enemies
ls -R filesystem-quest
head -1 filesystem-quest/enemies/dragon.txt
wc filesystem-quest/enemies/goblin.txt
wc -l filesystem-quest/enemies/*.txt
cp filesystem-quest/enemies/slime.txt filesystem-quest/enemies/blue-slime.txt
mv filesystem-quest/enemies/blue-slime.txt filesystem-quest/enemies/king-slime.txt
ls filesystem-quest/enemies
rm filesystem-quest/enemies/king-slime.txt
ls filesystem-quest/enemies
man ls
```

The first three `ls` lines are the lesson in miniature: plain `ls` shows five folders; `ls -a` adds `.`, `..` and three dot-files that were there all along; `ls -la` shows each with its type, permissions, owner, size and date. Then the enemy files: `ls -l` gives you three ordinary files of 34 to 40 bytes, `-lS` reorders them biggest first, and `-R` walks the whole quest. `wc` reports lines, words and characters, and `wc -l` with a glob counts every text file in the folder at once and totals them. `cp` makes a second slime, `mv` renames it, `rm` removes it; `ls` between each step confirms what happened. The `man ls` at the end is a shortened page; the real one is longer and leaves with `q`.

**Walkthrough 3: pipes and redirection.** Same folder, now searched and logged. Read each line as a sentence before the output arrives: *list everything, keep the text files; show my history, keep the mkdir lines; print the dragon file, count its lines.*

```bash term=pipes
cd ~
mkdir -p filesystem-quest/enemies filesystem-quest/maps
cd filesystem-quest
echo "HP: 10, Attack: 2, Weakness: everything" > enemies/slime.txt
echo "HP: 30, Attack: 8, Weakness: fire" > enemies/goblin.txt
echo "HP: 500, Attack: 50, Weakness: none" > enemies/dragon.txt
touch notes.md todo.txt
ls -la
ls -la | grep ".txt"
history | grep "mkdir"
cat enemies/dragon.txt | wc -l
grep "fire" enemies/goblin.txt
grep -i "weakness" enemies/slime.txt
grep -r "fire" enemies/
cat enemies/*.txt | grep "fire"
grep "fire" enemies/*.txt
ls -la > file-list.txt
ls -la | grep ".txt" > text-files.txt
cat text-files.txt
echo "=== Session Log ===" > session-log.txt
echo "Date: $(date)" >> session-log.txt
echo "User: $(whoami)" >> session-log.txt
echo "Location: $(pwd)" >> session-log.txt
echo "Files here:" >> session-log.txt
ls -la >> session-log.txt
cat session-log.txt
ls -lR . > maps/inventory-report.txt
head -4 maps/inventory-report.txt
```

Two moments to slow down on. First, the two ways of asking which enemy is weak to fire. `cat enemies/*.txt | grep "fire"` glues all three files into one stream and finds the line, but it cannot tell you which file the line came from, because by the time `grep` sees the text the filenames are gone. `grep -r "fire" enemies/`, or `grep "fire" enemies/*.txt`, hands `grep` the files themselves, so it prints `enemies/goblin.txt:` in front of the hit. When you want to know *where*, give `grep` the files; when you only want the lines, pipe.

Second, the session log. Six lines, one `>` and five `>>`, and three of them use `$(...)` to drop the output of `date`, `whoami` and `pwd` into the text. The last `>>` appends an entire `ls -la` listing. This is a shell script written one line at a time, and it is exactly how you will write real ones in Session 1.4. Pipes and redirection are where the terminal starts to feel like a superpower: small commands that each do one thing, chained together like combo attacks.

> **Tip:** When a long pipeline gives you nothing, cut it at the first pipe and run the left half alone. If that prints what you expected, add the next stage back. Debugging a pipeline is always the same move: find the stage where the text stopped looking like what you thought it was.

**Walkthrough 4: permissions and `chmod`.** Every file carries a small table of who may do what with it. Three *groups*: the **owner** (`u`), the file's **group** (`g`), and **others** (`o`), everyone else. Three *permissions* per group: **read** (`r`, see the contents), **write** (`w`, change it) and **execute** (`x`, run it as a program). That table is the nine characters after the type in `ls -l`.

![](diagram:session-1-2/fig5-permissions)

`-rw-r--r--` is the most common string you will see: a plain file the owner can read and write, that the group and everyone else can only read, and that nobody can run. A brand-new file always looks like this, including a script you just wrote, which is why the first run of any script fails. `chmod` changes the mode. `chmod +x script.sh` adds execute permission for everyone; `chmod u+x script.sh` adds it for the owner only. The numeric form you will meet in tutorials adds `r`=4, `w`=2, `x`=1 per group: `755` is `rwxr-xr-x`, the normal mode for scripts and folders; `644` is `rw-r--r--`, the normal mode for files; `700` is private. Learn `+x` today; the numbers can wait until a tutorial hands you one.

```bash term=permissions
cd ~
mkdir -p filesystem-quest/enemies
cd filesystem-quest
touch enemies/slime.txt enemies/goblin.txt enemies/dragon.txt
ls -la enemies/
touch quest-start.sh
echo '#!/bin/bash' > quest-start.sh
echo 'echo "=== QUEST LOG ==="' >> quest-start.sh
echo 'echo "Adventurer: $(whoami)"' >> quest-start.sh
echo 'echo "Location: $(pwd)"' >> quest-start.sh
echo 'echo "Date: $(date)"' >> quest-start.sh
echo 'echo "Enemies in area:"' >> quest-start.sh
echo 'ls enemies/' >> quest-start.sh
echo 'echo "=== END LOG ==="' >> quest-start.sh
cat quest-start.sh
./quest-start.sh
ls -la quest-start.sh
chmod +x quest-start.sh
ls -la quest-start.sh
./quest-start.sh
chmod 644 quest-start.sh
ls -l quest-start.sh
chmod 755 quest-start.sh
ls -l quest-start.sh
```

Read the story in order. The script is written with `echo` lines in *single* quotes, which matters: single quotes stop the shell from running `$(whoami)` now, so the words land in the file untouched and run later, when the script does. `cat` shows the file is exactly what you meant. `./quest-start.sh` (the `./` means "the one in this folder") fails with `Permission denied`, and `ls -la` shows why: `-rw-r--r--`, no `x` anywhere. `chmod +x` and the string becomes `-rwxr-xr-x`, three `x`, one per group. The same command now runs and prints a log with your name, your location, the date and the enemy list. The last four lines show the numeric form doing the same thing: `644` takes the `x` away, `755` puts it back.

The first line of the script, `#!/bin/bash`, is called the shebang. It tells the system which program should read the file. We go deep on scripts in Session 1.4; today the point is the lock and the key.

## Where it breaks

Five mistakes, each one made by everyone in their first week. The terminal makes them on purpose. Press Run and read every red line.

```bash term=broken may-fail
cd ~
mkdir -p filesystem-quest/enemies
echo "HP: 30, Attack: 8, Weakness: fire" > filesystem-quest/enemies/goblin.txt
cat enemies/goblin.txt
pwd
cd filesystem-quest
cat enemies/goblin.txt
cd enemies/goblin.txt
touch my-txt-notes report.txt
ls | grep ".txt"
ls | grep "\.txt"
grpe fire enemies/goblin.txt
cp enemies/goblin.txt enemies/goblin-backup.txt
rm enemies/goblin-backup.txt
ls enemies
cat enemies/goblin-backup.txt
rm enemies
cd ..
cd ..
cd ..
cd ..
pwd
cd
```

**The right path from the wrong place.** `cat enemies/goblin.txt` fails from home with `No such file or directory`, and the file absolutely exists. It exists at `filesystem-quest/enemies/goblin.txt` *relative to home*; `enemies/goblin.txt` is only true from inside `filesystem-quest`. `pwd` shows you are home; `cd filesystem-quest`; the same `cat` works. Nine times out of ten this error is not a missing file, it is a correct relative path typed from the wrong folder. `pwd` first, every time.

**`cd` into a file.** `cd enemies/goblin.txt` answers `Not a directory`. You can only stand inside folders. The error is precise about it, so believe it.

**The dot that means anything.** `touch my-txt-notes report.txt` and then `ls | grep ".txt"` lists *both*. In a `grep` pattern a dot matches any single character, so `.txt` fits `-txt` in `my-txt-notes` just as well as it fits the real `.txt` in `report.txt`. `grep "\.txt"` escapes the dot and keeps only the file that truly ends in `.txt`. You do not need regular expressions this week, only this: when `grep` finds more than you asked for, suspect the dot. Notice, too, that `ls` printed one name per line into the pipe, not the columns you see on the screen; programs know when they are talking to another program instead of to you.

**The typo.** `grpe fire enemies/goblin.txt` is `command not found`. Nothing ran. Up arrow, fix two letters, Enter. You have seen this one before and will see it a thousand more times; it never gets more dangerous than this.

**`rm` has no undo.** `cp` makes a backup, `rm` deletes it, `ls` confirms it is gone, and `cat` cannot bring it back: `No such file or directory`, permanently. There is no trash to fish it out of. Then `rm enemies` refuses with `Is a directory`, which is the shell doing you a favour: deleting a folder takes `-r`, on purpose, so that you have to mean it. And the four `cd ..` in a row: from `filesystem-quest` the first goes home, the second to `/home`, the third to `/`, and the fourth stays at `/` without complaint, because the root is its own parent. You cannot fall off the top of the tree. `cd` brings you home again.

> **Note:** Every one of these errors is the shell being accurate. *No such file or directory*, *Not a directory*, *Is a directory*, *command not found*, *Permission denied*: five sentences, five precise diagnoses. Learn to read them as answers instead of insults and most of your debugging this week takes ten seconds.

## Your turn

Two guided labs and an independent one. Rehearse in the boxes; do them for real in your own terminal, where the dot-files are yours and the folders stay.

**Lab 1: Filesystem Explorer (25 minutes).** Start at home with `cd ~`. Run `ls -la` and count the hidden files, the ones starting with a dot; write that number down. Go to the root with `cd /` and `ls` the top-level folders; look, do not touch. Come home again with an **absolute** path typed in full, not `cd ~` (on a Mac that is `cd /Users/yourname`; on Linux and WSL `cd /home/yourname`). Then build the quest:

```bash
mkdir -p filesystem-quest/maps filesystem-quest/loot filesystem-quest/enemies
touch filesystem-quest/maps/world-map.txt filesystem-quest/maps/dungeon-map.txt
touch filesystem-quest/loot/gold.txt filesystem-quest/loot/sword.txt filesystem-quest/loot/shield.txt
touch filesystem-quest/enemies/slime.txt filesystem-quest/enemies/goblin.txt filesystem-quest/enemies/dragon.txt
echo "HP: 10, Attack: 2, Weakness: everything" > filesystem-quest/enemies/slime.txt
echo "HP: 30, Attack: 8, Weakness: fire" > filesystem-quest/enemies/goblin.txt
echo "HP: 500, Attack: 50, Weakness: none" > filesystem-quest/enemies/dragon.txt
```

From home, write one `ls` command with flags that shows *all* files in the `loot` folder in long format. Find which enemy is weak to fire, first with `cat filesystem-quest/enemies/*.txt | grep "fire"`, and notice it does not tell you which file; then with `grep -r "fire" filesystem-quest/enemies/`, which does. Save a complete listing of the quest to a report, `ls -lR filesystem-quest > filesystem-quest/maps/inventory-report.txt`, and `cat` it. Checkpoints: the absolute path you used to get home; the dragon's HP from `cat filesystem-quest/enemies/dragon.txt`; and which `grep` told you both the filename and the matching line.

**Lab 2: Permission Playground (10 minutes).** `cd` into `filesystem-quest`. `ls -la enemies/` and read the permission string on each file out loud: type, owner, group, others. Build `quest-start.sh` exactly as in the demonstration, with `echo '#!/bin/bash' > quest-start.sh` first and `>>` for the seven lines after. Try `./quest-start.sh`; it must fail with *Permission denied*, and you should be able to say why. `ls -la quest-start.sh` and note the string. `chmod +x quest-start.sh`, `ls -la` again and find the three new `x`. Run it. If the log prints, you have the key.

**Independent lab: The Explorer's Journal.** No step-by-step. The box below is a clean home to rehearse in; build the real thing on your machine, because next session turns this folder into a Git repository.

```bash term=explorer
cd ~
pwd
ls -la
```

Create `explorers-journal` in your home directory with this inside it:

```text
explorers-journal/
  day-01/
    notes.txt
    commands.txt
  day-02/
    notes.txt
    commands.txt
    discoveries.txt
  scripts/
    greet.sh
    system-info.sh
```

`cd ~/explorers-journal` first; every path below is relative to it. In `day-02/notes.txt`, write at least five things you learned today with `echo` and `>>`. In `day-02/commands.txt`, list every new command from this session with a one-line description. In `day-02/discoveries.txt`, use pipes and redirection: save the output of `ls -la ~` into it, then append a line count of your home listing to the bottom with `ls -la ~ | wc -l >> day-02/discoveries.txt`. Write the two scripts with `echo` lines in single quotes:

```bash
#!/bin/bash
echo "Welcome back, $(whoami)!"
echo "Today is $(date)"
echo "You are in: $(pwd)"
echo "Keep going. You are doing great."
```

```bash
#!/bin/bash
echo "=== System Info ==="
echo "User: $(whoami)"
echo "Shell: $SHELL"
echo "Home: $HOME"
echo "Current Dir: $(pwd)"
echo "Date: $(date)"
echo "=== End ==="
```

Make both executable with `chmod +x`, run both, and check the output is what the script says. Finally, `grep` your `day-02/commands.txt` for the word `file` and save the results to `day-02/grep-results.txt`; if it finds nothing, check your spelling in the commands file.

Hints: `echo '#!/bin/bash' > scripts/greet.sh` writes the shebang line, then `>>` for the rest; single quotes keep `$(whoami)` from running too early; `chmod +x` before you try to run anything. Stretch goals: a third script `scripts/countdown.sh` that counts down from 5 using `sleep 1` between lines (the page terminal does not actually wait; your machine will); research `alias` and make a shortcut for a command you type a lot; and find out what the `$PATH` variable is and how the shell uses it to find `git` and `code` (the `which` command from Session 1.1 is the clue).

> **Tip:** Build the tree, then `ls -R explorers-journal` before you write a single file. Fixing a misplaced folder is one `mv`; fixing it after five files are inside is five.

## The quest

By the start of Session 1.3, have on your machine:

- `filesystem-quest`, with the three enemy files written, `maps/inventory-report.txt` generated by `ls -lR`, and an executable `quest-start.sh` that prints the quest log when you run it.
- `explorers-journal`, built to the tree, with notes, the commands list, a `discoveries.txt` made with pipes, `grep-results.txt`, and two scripts that run after `chmod +x`.
- One sentence in `day-02/notes.txt`, in your own words, explaining the difference between an absolute and a relative path. If you can write that sentence, you own today.

Next session opens `explorers-journal` and turns it into a Git repository, so it must exist, and it must be in your home directory under that exact name.

## Side quests

Two pages in the library look further down roads you walked today. They are written for later units, so read the opening and the first picture, not the code.

## Before next session

Finish the Explorer's Journal if you did not finish it here; budget ninety minutes to two hours. The folder must exist before Session 1.3.

Then make the status screen a reflex. Every time you open a terminal this week, before you do anything else: `pwd`, `ls -la`. Where am I, what is here. Ten seconds. After a week you will do it without deciding to.

Next time: Save Points and Respawns. Git. Every file you have made so far exists in exactly one place, and one careless `rm` or one broken edit loses it. Git gives you save points: snapshots of a whole folder you can go back to, branches you can experiment on without fear, and a way to merge the experiment back when it works. You will never lose your work again. This changes everything.

> **Say:** "The filesystem is one tree; absolute paths start at the root, relative paths start where you stand. .. is up, . is here, ~ is home, - is back. ls -la is the status screen. A pipe sends output into the next command; an arrow sends it into a file. Permission denied on your own script means chmod +x."

You now have a full status screen. You know where you are, what is around you, who owns it, and how to get anywhere. Two days ago you had a blinking cursor. That is a massive level up.
