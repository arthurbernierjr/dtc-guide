---
editorial: true
title: The Scribe's Hand
subtitle: The Shell as a Language, and the Setup Script You Can Read
hook: "Your dotfiles repo ships a seven-line setup script, and you can read every line of it. The full one has branches, a loop and a function, and you cannot read those yet. Today you learn the shell's sentence shapes one at a time, write down what each will print before you run it, and then assemble the script that sets up a new machine in one command."
read: 55
artifact: "The full setup.sh in github.com/YOU/dotfiles, assembled from six miniatures you ran first, executable, committed, pushed, and proven on a fresh clone; plus a git_branch function in both rc files that puts the current branch in your prompt"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.gnu.org/software/bash/manual/html_node/Shell-Parameters.html
  - https://www.gnu.org/software/bash/manual/html_node/Conditional-Constructs.html
  - https://www.gnu.org/software/bash/manual/html_node/Looping-Constructs.html
  - https://www.gnu.org/software/bash/manual/html_node/Shell-Functions.html
  - https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html
  - https://git-scm.com/docs/git-branch
say:
  - "a variable is a name for a string; the dollar sign reads it, and double quotes keep it in one piece"
  - "the opening bracket is a command, so it needs spaces around it, and its exit status is the whole point"
  - "predict, run, compare: a line you predicted wrong once is a line you understand now"
---

## The hook

[Last session](/path/1-4-guild-sync/) ended with a repository on the internet and a `setup.sh` inside it that is seven lines long. You can read all seven. There is a longer version of that script, the one that backs up the right rc file for the shell the machine actually uses, copies your editor settings to the right folder, and installs every extension in your list, and it is about fifty lines. If you had copied it last session you would have run something you could not read, which is the one habit this path refuses to teach. So the long script waited for today.

Today the shell stops being a list of commands and becomes a small language. It has variables, a way to ask a question and act on the answer, a way to choose between several answers, a way to repeat one action for every line of a file, and a way to name a few lines and call them later. That is five ideas, and six miniatures, because the question gets two scripts: one asks about a file and one asks about a command. Each miniature is three or four lines, you write down what it will print before you run it, you run it, and you compare. By the end, the fifty-line script is five of those miniatures stapled together, the sixth lives in your rc files, and you will have proven the script on a fresh clone of your own repository.

> *The scribe did not write the spell. The scribe wrote the instructions for casting it, one line at a time, in a hand so plain that a stranger could follow them in the dark. The adventurer watched the scribe test every line on a scrap before it went into the book. "Why not write it all at once?" "Because the book will be read by someone who cannot ask me what I meant."*

The box on this page is the same shell as Session 1.1's, with Session 1.4's pretend GitHub behind it, and it has a limit you need to know before you start: it reads one line at a time and does not know `if`, `case`, `while` or functions. It can run the variables, the bracket test, the short `&&` form, the files the loop reads, and the Git output the function wraps, and it can rehearse the fresh clone. The four sentence shapes themselves run on your machine, in your real terminal. That is not a gap in the lesson. It is the line between rehearsal and the real thing, drawn exactly where it falls, and every miniature below says which side of it you are on.

## The idea

A shell script is a text file of commands that the shell reads top to bottom, exactly as if you had typed them. Session 1.2 gave you the shebang, `chmod +x`, `$(...)`, the arrows, and `&&`. Everything today is one of five additions to that, and every one of them is something you already do in English when you give instructions: name a thing, check a condition, choose between cases, repeat for each item, and give a routine a name.

The method is the same for all six miniatures. Read the miniature. Write one line in a file called `predictions.txt` saying what you think it will print. Run it. Compare. A correct prediction means you can read the construct. A wrong one is better, because the difference between what you expected and what the shell did is the exact piece you were missing, and you find it in one minute instead of in a fifty-line script at midnight. The box runs the parts it can; the rest is three commands on your own machine, and the expected output is printed under each so you can check yourself.

![](diagram:session-1-5/fig1-model)

### Variables: a name for a string

`RC=.zshrc` stores the text `.zshrc` under the name `RC`. No spaces around the `=`; `RC = .zshrc` is a command called `RC` with two arguments, and the shell will tell you it cannot find it. `$RC` reads the value back, and `"$RC"` reads it back as one word even if the value contains spaces, which is why every path in the full script is wrapped in double quotes. Single quotes stop the dollar sign from working at all, so `'$RC'` is the four characters `$`, `R`, `C`, and nothing else.

Two variables are already set when any terminal opens. `$HOME` is your home folder, the thing `~` expands to. `$SHELL` is the path of your login shell: `/bin/zsh` on a Mac, `/bin/bash` on Ubuntu and WSL, `/bin/bash` in the box. Session 1.1 had you print it; today the script reads it to make a decision. Two more matter inside a running script. `$0` is the name the script was started as, `./setup.sh` or `../dotfiles/setup.sh`, whatever you typed. `dirname` strips the last part of a path, so `dirname "$0"` is the folder the script lives in, written the way you typed it. `$(cd "$(dirname "$0")" && pwd)` turns that into an absolute path, and the `cd` inside `$(...)` happens in a copy of the shell, so it does not move you. That line is how the full script finds its own files no matter which folder you run it from.

The first miniature, `m1.sh`, three lines under the shebang:

```bash
#!/bin/bash
RC=.zshrc
echo "Your shell is $SHELL"
echo "I would copy $RC to $HOME/$RC"
```

Write your prediction: two lines, with your own shell path and your own home folder in them. Then run it in the box, which writes the file with `printf` because it has no editor, and watch one more thing afterwards: `echo "[$RC]"` prints empty brackets, because a variable set inside a script lives and dies with that script.

```bash term=variables
echo $HOME
echo $SHELL
printf '#!/bin/bash\nRC=.zshrc\necho "Your shell is $SHELL"\necho "I would copy $RC to $HOME/$RC"\n' > m1.sh
cat m1.sh
chmod +x m1.sh
./m1.sh
echo "[$RC]"
RC=.bashrc
echo "$RC"
echo '$RC'
FILE=~/$RC
echo $FILE
```

On your Mac the two lines of `./m1.sh` read `Your shell is /bin/zsh` and `I would copy .zshrc to /Users/YOU/.zshrc`. On Ubuntu or WSL, `/bin/bash` and `/home/YOU/.zshrc`. If your prediction had the right shape and the wrong folder, that is a pass: the shape is the lesson.

### The question: `if`, the bracket, and the short form

The shell's question is a command whose exit status is the answer. Every command returns a number when it finishes, zero for success and anything else for failure; `echo $?` prints the last one. `[ -f ~/.zshrc ]` is a command, spelled with an opening bracket, whose only job is to return zero if that path is an existing file and one if it is not. `-d` asks the same about a folder. The bracket is a command name, which is why it needs a space after it and a space before the closing `]`; glue it to `-f` and the shell goes looking for a program called `[-f`. The box script from last session already used the short form:

```bash
[ -f ~/.zshrc ] && cp ~/.zshrc ~/.zshrc.backup
```

Read it as "if the file exists, then copy it". `&&` runs the right side only when the left side succeeded. `||` is its mirror: `[ -f ~/.zshrc ] || echo "no rc file"` runs the right side only when the left side failed. Chain both and you have a one-line either-or. The long form says the same sentence with room for more than one command on each side:

```bash
#!/bin/bash
if [ -f ~/.zshrc ]; then
  echo "found ~/.zshrc, would back it up"
else
  echo "no ~/.zshrc, nothing to back up"
fi
```

`if` runs the command after it, `then` begins what happens on zero, `else` begins what happens otherwise, and `fi` is `if` backwards, closing the block. The semicolon after `]` is only there because `then` is on the same line; put `then` on its own line and the semicolon goes away. That is `m2.sh`. Predict which of the two lines prints on your machine, then prove the short form in the box, where there is a `.bashrc` and no `.zshrc`:

```bash term=guard
ls -a ~ | grep rc
[ -f ~/.bashrc ] && echo "found .bashrc"
[ -f ~/.zshrc ] && echo "found .zshrc"
[ -f ~/.zshrc ] && echo "found .zshrc" || echo "no .zshrc"
[ -d ~/projects ] && echo "projects exists"
echo $?
[ -d ~/projects/nope ] || echo "no such folder"
[ -d ~/projects/nope ]
echo $?
```

The second line prints nothing, and that silence is correct: the test failed, so `&&` never ran the `echo`. The third line fills the silence with the `||` side. The two `echo $?` lines show the number underneath: `0` after a test that passed, `1` after one that failed. The long form on your machine prints exactly one of its two sentences, the first on a Mac that has a `.zshrc`, the second on a fresh Ubuntu. Write that down before you run it.

### The choice: `case` on `$SHELL`

When there are more than two answers, or when the answer is a pattern rather than a yes or no, the shell has `case`. It compares one string against a list of patterns, top to bottom, and runs the lines after the first pattern that matches.

```bash
#!/bin/bash
case "$SHELL" in
  */zsh) echo "zsh, so the rc file is .zshrc" ;;
  *)     echo "not zsh, so the rc file is .bashrc" ;;
esac
```

`case "$SHELL" in` names the string. Each branch is a pattern, a closing parenthesis, the commands, and `;;`, two semicolons, which end the branch. `*/zsh` matches anything that ends in `/zsh`, so `/bin/zsh` and `/usr/local/bin/zsh` both land there. `*` alone matches everything, so it is the catch-all, and it goes last because the first match wins. `esac` is `case` backwards. That is `m3.sh`; predict which branch your machine takes. The box has no `case`, but it has the one input the `case` reads:

```bash term=which-shell
echo $SHELL
echo "$SHELL" | grep zsh
echo $?
echo "$SHELL" | grep bash
echo $?
```

`grep` with a word prints the line if it contains that word and returns zero, or prints nothing and returns one, so those two pairs are the two branches of the `case` done by hand: the box is a bash machine and takes the second branch. In the full script the branch does not `echo`; it sets `RC`, and the rest of the script uses `$RC` without caring which shell picked it.

### The existence check: `command -v`

Before the script runs `code --install-extension` it asks whether `code` exists on this machine. `command -v code` prints the path of the `code` command and returns zero if there is one, or prints nothing and returns one. `which code` and `type code` answer the same question; `command -v` is the one that works in every shell, so it is the one scripts use. The script does not want the path printed, only the yes or no, so it throws the output away: `> /dev/null` sends normal output into the bit bucket you met in Session 1.2, and `2>&1` sends error output to the same place as normal output, which here means away. Read `command -v code > /dev/null 2>&1` as "is there a `code` command, quietly".

```bash
#!/bin/bash
if command -v code > /dev/null 2>&1; then
  echo "code is here: $(command -v code)"
else
  echo "no code command, install extensions by hand"
fi
```

That is `m4.sh`, and `if` is exactly the shape from `m2.sh` with a different question inside it. Predict the line; on a machine where Session 1.1's install worked it is the first one, with a path such as `/usr/local/bin/code` or `/usr/bin/code`. The box knows `which` and `type`:

```bash term=which-shell-code
which code
echo $?
which zsh
echo $?
type code
which code > /dev/null && echo "code is here"
which zsh > /dev/null || echo "no zsh on this machine"
```

`which zsh` prints nothing and returns one, because the box has no zsh, and the two one-liners at the end are the `if` and its `else` in the short form.

### The repeat: `while read` over a three-line file

The extension list is a file with one id per line. The script needs to run one command for each line. `while` repeats a block for as long as a command keeps succeeding, and `read` is the command: it takes one line from its input, stores it in a variable, and returns zero; at the end of the file it has nothing to read and returns one, and the loop stops.

```bash
#!/bin/bash
while IFS= read -r line; do
  echo "installing $line"
done < three.txt
```

Read it from the bottom. `< three.txt` feeds the file to the whole loop as its input, the same `<` arrow you met with `wc -l < file`. `read -r line` takes the next line into `$line`; `-r` keeps backslashes literal, and `IFS=` in front keeps leading and trailing spaces, both habits that cost nothing and save an afternoon one day. `do` begins the body, `done` ends it. That is `m5.sh`, and `three.txt` is three extension ids. Predict the three lines it prints, in order. The box can build the file and show what the loop will see:

```bash term=three-lines
printf 'ritwickdey.LiveServer\neamodio.gitlens\npkief.material-icon-theme\n' > three.txt
cat three.txt
wc -l < three.txt
cat < three.txt
```

`wc -l` counts lines, and `3` is the number of times the loop body will run. On your machine the output is `installing ritwickdey.LiveServer`, `installing eamodio.gitlens`, `installing pkief.material-icon-theme`, one per line. Swap the `echo` for `code --install-extension "$line" --force` and you have the script's loop; the quotes around `$line` are the variable rule from the first miniature.

### The name: a function for the prompt

A function is a few lines with a name. Define it once, and the name becomes a command in that shell. The one you want is the branch for your prompt. `git branch --show-current` prints the current branch's name and nothing else; outside a repository it prints an error to the error stream, and `2>/dev/null` hides that so the prompt stays clean in folders that are not repositories.

```bash
git_branch() {
  git branch --show-current 2>/dev/null
}
```

`git_branch()` is the name with empty parentheses, the braces hold the body, and from then on typing `git_branch` runs it. This does not go in `setup.sh`. It goes in `.zshrc` and `.bashrc`, where it runs every time a terminal opens, and the prompt calls it every time it is drawn. Last session's prompt was a plain one so that the rc file had nothing in it you could not read; today the three prompt lines grow into these, zsh first and bash second:

```bash
git_branch() {
  git branch --show-current 2>/dev/null
}
setopt PROMPT_SUBST
PS1='%F{cyan}%~%F{yellow} $(git_branch)%f $ '
```

```bash
git_branch() {
  git branch --show-current 2>/dev/null
}
export PS1="\[\033[36m\]\w\[\033[33m\] \$(git_branch)\[\033[00m\] $ "
```

`setopt PROMPT_SUBST` tells zsh to re-run the `$(git_branch)` every time the prompt is drawn; bash does that on its own, which is why its version escapes the dollar sign with a backslash so the substitution happens late instead of once. Predict what your prompt looks like inside `~/dotfiles` and inside `~` after you `source` the file. The box has no functions and no zsh, but it has the body:

```bash term=branch-name
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
cd ~ && mkdir lantern && cd lantern && git init -q && echo "lit" > wick.txt && git add . && git commit -q -m "Light the lantern"
git branch
git checkout -q -b trim-the-wick
git branch
cd ~/Documents
git branch
git branch 2>/dev/null
echo "[$(git branch 2>/dev/null)]"
cd ~/lantern
echo "[$(git branch 2>/dev/null)]"
```

Inside the repository `git branch` lists the branches with a star on the current one; the page's Git does not know `--show-current`, so the box shows the list and your machine shows the single name. Outside, `git branch` prints `fatal: not a git repository` and `2>/dev/null` swallows it, which is the empty pair of brackets. That silence is what the prompt shows in `~`, and the name is what it shows in `~/dotfiles`.

What you should be able to draw on a napkin: a script is lines, top to bottom. A variable is a name for a string and `$` reads it. A test is a command whose exit status is the answer, `if` acts on it, and `&&` is the one-line `if`. `case` picks the first matching pattern. `while read` runs the body once per line of a file. A function gives lines a name. Every one of those is a thing you predicted and ran before it went into the script.

## The demonstration

One script, the full `setup.sh`, assembled from five of the six miniatures and run on a fresh clone of your own dotfiles. The sixth, the function, went into your rc files, and the script copies those. The box rehearses the clone with the short script it already knows; the full script runs on your machine, and that run is the demonstration.

Here is the whole thing. It is the file Session 1.4 promised and held back: last session gave you the seven-line version, and this is the full one. Every line in it is one of the miniatures you just ran.

```bash
#!/bin/bash
# ================================
# Dev Environment Setup Script
# Arthur's Dotfiles
# ================================

echo "=== Starting Dev Environment Setup ==="
echo ""

echo "Creating projects directory..."
mkdir -p ~/projects

echo "Linking shell configuration..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Pick the rc file for the shell this machine uses: zsh on a Mac, bash on WSL and Linux
case "$SHELL" in
  */zsh) RC=.zshrc ;;
  *)     RC=.bashrc ;;
esac
if [ -f ~/$RC ]; then
  echo "Backing up existing $RC to $RC.backup"
  cp ~/$RC ~/$RC.backup
fi
cp "$SCRIPT_DIR/$RC" ~/$RC
echo "Shell config linked: ~/$RC"

echo "Copying VS Code settings..."
VSCODE_DIR="$HOME/Library/Application Support/Code/User"
[ -d "$HOME/.config/Code/User" ] && VSCODE_DIR="$HOME/.config/Code/User"
if [ -d "$VSCODE_DIR" ]; then
  cp "$SCRIPT_DIR/vscode/settings.json" "$VSCODE_DIR/settings.json"
  echo "VS Code settings updated."
else
  echo "VS Code settings directory not found. Skipping."
  echo "(On WSL, VS Code keeps settings on the Windows side: copy vscode/settings.json by hand via File > Preferences > Settings > Open Settings (JSON).)"
fi

echo "Installing VS Code extensions..."
if command -v code > /dev/null 2>&1; then
  while IFS= read -r extension; do
    code --install-extension "$extension" --force
  done < "$SCRIPT_DIR/vscode/extensions.txt"
  echo "Extensions installed."
else
  echo "VS Code CLI not found. Install extensions manually from vscode/extensions.txt"
fi

echo ""
echo "=== Setup Complete ==="
echo "Restart your terminal to apply changes."
echo "Welcome to the new world."
```

Read it with the miniatures beside it. The first block is Session 1.2: `echo` and `mkdir -p`, the same two lines the short script had. `SCRIPT_DIR` is the variables miniature's last idea: the folder the script lives in, absolute, so `"$SCRIPT_DIR/$RC"` is a real path whether you ran it from `~/dotfiles` or from `~`. The `case` is `m3.sh` with `RC=` where the `echo` was. The `if [ -f ~/$RC ]` is `m2.sh`: back up only if there is something to back up. The `cp` after it runs either way, and the `echo` under it uses `$RC` one more time, which is why the backup message and the linked message always name the same file.

The VS Code block is one short form and one long one. `VSCODE_DIR` starts as the Mac path. The `[ -d ... ] &&` line is the one-line `if`: on Linux and WSL the `.config` folder exists, so the variable is overwritten with that path. Then the long `if [ -d "$VSCODE_DIR" ]` copies the settings into whichever one won, or says it is skipping, and the quotes around the variable matter here because the Mac path has a space in `Application Support`. The last block is `m4.sh` wrapped around `m5.sh`: ask whether `code` exists quietly, and if it does, loop over the extension list, one `code --install-extension` per line. If it does not, say so and move on, because a script that stops halfway leaves a machine half set up.

Now the fresh clone. The point of a setup script is that it works on a machine that has nothing but Git and your repository, and the closest thing you have to that machine is a second clone in a folder you then delete. The box does it with the short script, because that is the one its shell can run:

```bash term=fresh-clone
git config --global user.name "Arthur the Adventurer" && git config --global user.email "arthur@newworld.dev" && git config --global init.defaultBranch main
ssh-keygen -t ed25519 -C "arthur@newworld.dev" -N "" -f ~/.ssh/id_ed25519 > /dev/null && gh auth login > /dev/null && gh ssh-key add ~/.ssh/id_ed25519.pub --title "My Laptop" > /dev/null
# last session's dotfiles, rebuilt in one save
cd ~ && mkdir dotfiles && cd dotfiles && git init -q
printf '# shell config\nalias gs="git status"\nalias gl="git log --oneline --graph"\nmkdir -p ~/projects\necho "Welcome back, $(whoami)."\n' > .zshrc
cp .zshrc .bashrc
mkdir -p vscode && printf 'ritwickdey.LiveServer\neamodio.gitlens\npkief.material-icon-theme\n' > vscode/extensions.txt
printf '#!/bin/bash\necho "=== Starting Dev Environment Setup ==="\nmkdir -p ~/projects\n[ -f ~/.zshrc ] && cp ~/.zshrc ~/.zshrc.backup\ncp .zshrc ~/.zshrc\necho "Shell config linked."\necho "=== Setup Complete ==="\n' > setup.sh
chmod +x setup.sh
printf '# Dotfiles\n' > README.md
git add . && git commit -q -m "Dotfiles with the short setup script"
gh repo create dotfiles --public --source=. --remote=origin --push
# the fresh clone: a second copy, as a new machine would get it
cd ~ && git clone git@github.com:adventurer-dev/dotfiles.git fresh-check
cd fresh-check
ls -la
ls -la ~ | grep rc
bash setup.sh
ls -la ~ | grep rc
source ~/.zshrc
gs
cd ~ && rm -rf fresh-check
```

Three things to watch. Before the script runs, `ls -la ~ | grep rc` shows only the box's own `.bashrc`; after it, there is a `.zshrc` too, copied out of the clone. `source ~/.zshrc` prints the welcome line and makes `gs` a command, and `gs` answers with *Your branch is up to date with 'origin/main'* because the clone set up its tracking on its own. And the clone is run with `bash setup.sh` rather than `./setup.sh`, because the page's pretend Git does not carry the executable bit through a clone; real Git does, and `ls -la setup.sh` in your own fresh clone shows `-rwxr-xr-x` without you touching it. That is one more line on your list of things only the real machine can prove.

On your machine the same demonstration is six commands, listed as steps 8 to 11 in Your turn. The script prints its own progress, and the line to watch is `Backing up existing .zshrc to .zshrc.backup`. The `if [ -f ~/$RC ]` backs up whenever an rc file is already there, and on your machine one is there before either run, because step 7 copied it into place, so the first run and the clone's run both print that line and both leave a fresh `.zshrc.backup` behind. The only machine that stays silent is one with no rc file at all, a brand-new install, which is the machine the script was written for. The box just showed you that silent branch: it had no `.zshrc`, so its short form skipped the copy and the clone's file went in fresh. Both branches run, one on the box and one on your machine, and the `if` chose correctly each time.

## Where it breaks

![](diagram:session-1-5/fig2-diagnosis)

Everything in this box is wrong on purpose. Read each message before the paragraph under it.

```bash term=broken may-fail
[-f ~/.bashrc ] && echo "found it"
[ -f ~/.bashrc] && echo "found it"
[ -f ~/.bashrc ] && echo "found it"
printf '#!/bin/bash\necho "running as a script"\n' > setup.sh
./setup.sh
ls -la setup.sh
chmod +x setup.sh
ls -la setup.sh
./setup.sh
sh setup.sh
```

### `[-f: command not found`, or `[: missing ']'`

The bracket is a command, and the shell splits commands on spaces. `[-f` is one word, so the shell looks for a program with that name and reports that there is none. `~/.bashrc]` is one word too, so the `[` command runs, never sees its closing bracket, and says so. Both are the same mistake from two sides. The fix is mechanical: a space after `[`, a space before `]`, every time. When a script fails on a line with a test in it, look at the brackets before you look at anything else; the third line in the box is the same test with the spaces in place, and it passes.

### `syntax error near unexpected token ')'`

You wrote a `case` and left the `;;` off the end of a branch. The shell reads the next branch's pattern, reaches its `)`, and has no idea why there is a closing parenthesis in the middle of a command. The message names the line of the branch after the one you broke, which sends people fixing the wrong line; the missing `;;` is on the line above the one the message names. The same shape of message with `fi` or `done` in it means an `if` or a `while` was never closed. Count the openers and the closers: every `if` has a `fi`, every `case` an `esac`, every `do` a `done`, every branch a `;;`. The box cannot stage this one, because its shell has no `case`; on your machine, delete one `;;` from `m3.sh`, run it, read the line number, and put it back.

### `Permission denied`, and the script that runs under the wrong shell

`./setup.sh` answered `bash: ./setup.sh: Permission denied`. The file exists and bash found it; it is not marked executable, so the operating system refuses to start it. `ls -la` shows `-rw-r--r--`, no `x` anywhere. `chmod +x setup.sh` adds it, `ls -la` shows `-rwxr-xr-x`, and the same command runs. Git stores that bit, so a `chmod +x` committed once survives every clone.

`sh setup.sh` is the quieter cousin. It runs, so nobody notices, but it ignores the shebang: you named the shell on the command line, and on Ubuntu and WSL `sh` is a different program called dash, not bash. This script survives it because every line in it is plain enough for both. Add one bash-only line and it stops surviving. The common one is `source ~/$RC` at the bottom, added so the aliases load; dash answers `setup.sh: 44: source: not found`, and under bash it runs and changes nothing in your terminal, because a script is a child shell and cannot reach into the one you are typing in. Keep `source` out of the script, run the script as `./setup.sh` so the shebang chooses bash, and `source` the rc file yourself afterwards. The miniature that shows the difference is one line: `echo "[$BASH_VERSION]"` in a script prints a version under `./` and empty brackets under `sh` on Ubuntu.

## Your turn

Everything from here is on your machine. Make a scratch folder inside the practice tree from Session 1.1, and keep a predictions file in it; every step writes a prediction with `>>` before it runs anything.

1. `mkdir -p ~/dev-environment-practice/shell && cd ~/dev-environment-practice/shell`, then `touch predictions.txt`. `pwd` prints `/Users/YOU/dev-environment-practice/shell` or `/home/YOU/dev-environment-practice/shell`.
2. `code m1.sh`, type the variables miniature, then `echo "m1: two lines, my shell path and my home folder" >> predictions.txt`. `chmod +x m1.sh && ./m1.sh` prints `Your shell is /bin/zsh` (or `/bin/bash`) and `I would copy .zshrc to /Users/YOU/.zshrc` (or `/home/YOU/.zshrc`). `echo "[$RC]"` prints `[]`.
3. `code m2.sh`, the `if` miniature. Write which sentence you expect into `predictions.txt`. `chmod +x m2.sh && ./m2.sh` prints `found ~/.zshrc, would back it up` on a Mac or on any machine where last session's short script already ran, and `no ~/.zshrc, nothing to back up` otherwise. Then the short form at the prompt: `[ -f ~/.zshrc ] && echo yes || echo no` prints the matching word.
4. `code m3.sh`, the `case` miniature. Predict the branch. `chmod +x m3.sh && ./m3.sh` prints `zsh, so the rc file is .zshrc` on a Mac and `not zsh, so the rc file is .bashrc` on Ubuntu and WSL. Delete one `;;`, run it, and read `syntax error near unexpected token ')'` with its line number; put the `;;` back.
5. `code m4.sh`, the `command -v` miniature. Predict. `chmod +x m4.sh && ./m4.sh` prints `code is here: /usr/local/bin/code` (the path varies; `/usr/bin/code` on Ubuntu). If it prints `no code command`, Session 1.1's `code` command is not on your PATH, and that is worth fixing now rather than in Unit 2.
6. `printf 'ritwickdey.LiveServer\neamodio.gitlens\npkief.material-icon-theme\n' > three.txt`, then `code m5.sh`, the loop. Predict three lines. `chmod +x m5.sh && ./m5.sh` prints `installing ritwickdey.LiveServer`, `installing eamodio.gitlens`, `installing pkief.material-icon-theme`.
7. `cd ~/dotfiles && git pull` prints `Already up to date.`. `code .zshrc` and `code .bashrc`: replace the plain prompt lines in each with the `git_branch` function and the prompt that calls it, zsh syntax in one file and bash syntax in the other. Write the sixth prediction, `echo "m6: main in the prompt inside ~/dotfiles, nothing in ~" >> ~/dev-environment-practice/shell/predictions.txt`. `source ~/.zshrc` (or `source ~/.bashrc`) after copying the file into place with `cp .zshrc ~/.zshrc` (or the bash pair), and the prompt reads `~/dotfiles main $`. `cd ~` and the branch disappears from it. Return to the repository with `cd ~/dotfiles`, then commit: `git commit -am "Add git_branch to the prompt"`. Stay here for the next step; this is the repository that owns `setup.sh`.
8. `code setup.sh` and replace the short script with the full one from the demonstration, read line by line. `chmod +x setup.sh` is already in Git's memory from last session; `ls -la setup.sh` shows `-rwxr-xr-x` to confirm.
9. `./setup.sh`. The output starts `=== Starting Dev Environment Setup ===`, includes `Backing up existing .zshrc to .zshrc.backup` (because step 7 put a file there), `Shell config linked: ~/.zshrc`, either `VS Code settings updated.` or the skipping line, then one `Installing extensions...` line from `code` per id in your list, and ends `Welcome to the new world.` On WSL the settings line is the skip, and the extensions still install.
10. `git add setup.sh && git commit -m "Add the full setup script" && git push` prints the `main -> main` line from last session.
11. The fresh clone: `cd ~ && git clone git@github.com:YOU/dotfiles.git fresh-check && cd fresh-check`, then `ls -la setup.sh` shows `-rwxr-xr-x` without a `chmod`, and `./setup.sh` prints the same transcript as step 9, backup line included. Then `cd ~ && rm -rf fresh-check`; the clone was a test, and `~/dotfiles` is still the one you work in.
12. `code --list-extensions | grep -i liveserver` prints `ritwickdey.LiveServer`. That one line is what Session 2.1 checks first.

Go back through `predictions.txt` and mark each line right or wrong. Wrong ones are the ones to reread above; right ones are the constructs you own.

## The quest

![](diagram:session-1-5/fig3-evidence)

One deliverable: the full `setup.sh` in `github.com/YOU/dotfiles`, committed and pushed, run once on a fresh clone, with the `git_branch` function and the branch-aware prompt in both rc files. Evidence:

- `git log --oneline` in `~/dotfiles` shows `Add the full setup script` and `Add git_branch to the prompt` above last session's commits, and `origin/main` on the top one.
- `ls -la setup.sh` shows `-rwxr-xr-x`, and the file on GitHub, opened in the browser, has the `case`, the three `if` blocks and the `while` loop.
- A screenshot, `prompt-with-branch.png`, of your terminal in `~/dotfiles` with `main` in the prompt and, below it, `cd ~` with no branch shown.
- `~/dev-environment-practice/shell/predictions.txt` with six lines, each marked right or wrong by hand.
- `ls -d ~/projects` prints the folder, and `code --list-extensions` lists every id in `vscode/extensions.txt`.

Paste the repository URL into your journal under the one from last session. It is the same repository, and the setup script in it is now one you can defend line by line.

## Side quests

Predict, run, compare is the smallest loop in this whole programme, and the two pages in the library for today are about why that loop is worth keeping and what a script that runs on every login must never contain.

## Before next session

Run the loop. `git pull` when you sit down, `git push` when you stand up, and open a terminal in a folder that is not a repository at least once just to watch the branch vanish from the prompt. If you still have the independent lab from last session open, the `git/.gitconfig` copy is one `cp` line in `setup.sh` now that you can read the file, and it belongs on its own branch with its own pull request.

Read the GNU manual's page on [conditional constructs](https://www.gnu.org/software/bash/manual/html_node/Conditional-Constructs.html) once, slowly, for ten minutes. You will meet `elif` and the double-bracket `[[` there; neither is in your script, and now you can tell why they are not needed yet. Then spend ten minutes in someone else's dotfiles from the awesome-dotfiles list, reading only the setup script, and count how many of its lines are the six shapes from today. Most of them will be.

Two facts carry into Unit 2. Your `setup.sh` created `~/projects`, and that folder is the home of every project from here on, one folder and one repository each, never nested inside another. [Session 2.1](/path/2-1-the-skeleton-frame/) opens by creating the first of them, `~/projects/html-css-foundations`, with `mkdir`, `git init` and `gh repo create`, so nothing else needs to exist there yet. And the Live Server extension your loop installed is the tool 2.1 picks up first; `code --list-extensions | grep -i liveserver` is its opening check.

Next time: Unit 2, The Skeleton Frame. HTML, the document every page starts with, and a repository under `~/projects` that holds every page of the unit. Nothing is left running between sessions; there is no server yet to stop. The scribe's book is written in a hand you can read.

> **Say:** "A variable is a name for a string; the dollar sign reads it, and double quotes keep it in one piece. The opening bracket is a command, so it needs spaces around it, and its exit status is the whole point. Predict, run, compare: a line you predicted wrong once is a line you understand now."

You wrote a script with a choice, a question, a loop and a function in it, and you knew what every line would do before it did it. That is the difference between copying a spell and writing one.
