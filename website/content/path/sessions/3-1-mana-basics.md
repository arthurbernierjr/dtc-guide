---
editorial: true
title: Mana Basics
subtitle: Variables, Data Types, Operators, and Control Flow
hook: "Your first mana bar: where values live, the seven kinds they come in, and how a program picks a road."
read: 45
artifact: "npc-dialogue.js: eight player variables, a reputation ladder, a class switch, three ternaries and nothing but template literals"
diagrams:
  - fig1-three-containers
  - fig2-seven-primitives
  - fig3-two-passes
  - fig4-branching-road
  - fig5-two-equals-signs
docs:
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
  - https://developer.mozilla.org/en-US/docs/Glossary/Hoisting
say:
  - "a variable is a named container; const by default, let when it must change, never var"
  - "seven primitives, everything else is an object"
  - "declarations are registered first, then the lines run"
  - "only the first true test is taken"
  - "three equals signs, always"
---

## The hook

Everything you have built so far stands still.

That is not an insult. Your HTML gives a page its bones and your CSS gives it a face, and some of those faces were good. But nothing on those pages *reacts*. Click a button and the button does not know it was clicked. Type a name and the page does not know you are there. The page cannot count, cannot decide, cannot remember. It is a painting of a door.

JavaScript is the language that turns the painting into a door. It is the most widely used programming language on the planet, it runs in every browser ever shipped, and the same language runs servers, phones, games, robots, and the AI tools you have been hearing about. Learning it is as close to a cheat code as this world offers: one language, and the whole internet opens.

Before the cheat code, though, the mana bar. Every spell you cast from here on draws on four things: a place to keep a value, a sense of what kind of value it is, a way to combine values, and a way to choose between roads. Variables, types, operators, control flow. Fill those four and the next three sessions, functions, objects and the page itself, have something to run on.

> *You respawned in a world where the walls can think. Today you learn the first four words of the language they think in.*

Open Chrome, press the key combination that opens DevTools (Cmd + Option + I on a Mac, F12 everywhere else), and click the **Console** tab. That blinking cursor is a JavaScript interpreter waiting for you. Type `alert("I am a wizard now")`, press Enter, and watch the browser obey. That is the whole session in miniature: you say something in the language, and the machine does it. Everything below with a **Run** button runs in this page, in the same engine, with the same results you would see in that console.

## The idea

There are four ideas today, and each one is small on its own. The skill is holding all four at once, so let us line them up.

**A variable is a named container for a value.** You write a name, you put something in it, and from then on you use the name. JavaScript gives you three words to declare one, and the choice between them is the first habit worth building.

![](diagram:session-3-1/fig1-three-containers)

`let` is a jar with a lid. You can open it and change what is inside: `let hp = 100` and later `hp = 75`. `const` is a sealed flask. Once filled, the binding cannot be pointed at anything else; try `maxHp = 200` and JavaScript throws a `TypeError` at you, which is exactly what you want when a value was never meant to change. Both `let` and `const` are **block-scoped**: they live inside the nearest pair of curly braces and vanish when the block ends.

`var` is the cracked cauldron. It is the original 1995 keyword, it is **function-scoped** rather than block-scoped, so a `var` declared inside an `if` leaks out into the surrounding function, and it is hoisted in a way that reads as `undefined` instead of failing loudly. You will see it in older code and in older tutorials. Recognise it. Do not write it.

The rule, then: **default to `const`, reach for `let` when the value must change, and never write `var`.** Reading your own code back, every `let` is a flag that says "this one moves", which is useful information. One subtlety that trips people up: `const` seals the *binding*, not the *contents*. A `const party = []` can still have members pushed into it; what you cannot do is point `party` at a different array.

**Values come in seven primitive kinds, and everything else is an object.** The seven are the atoms of the language.

![](diagram:session-3-1/fig2-seven-primitives)

A **string** is text in quotes or backticks. A **number** is any number, integer or decimal, in one type; there is no separate "int" and "float" to keep straight. A **boolean** is `true` or `false`, the two answers a question can have. **undefined** means a variable was declared and never given a value; it is what the language hands you for "nothing here yet". **null** means *intentionally* empty; it is what you hand the language when you mean "nothing here, on purpose". **symbol** makes a guaranteed-unique key, and **bigint** holds integers past the point where ordinary numbers lose precision. You will use the first five constantly and the last two rarely, but you should be able to name all seven.

The `typeof` operator tells you which kind a value is, and it is honest about six of them. For `null` it answers `"object"`. That is a mistake in the original 1995 implementation; by the time anyone proposed fixing it, enough of the web depended on the wrong answer that fixing it would have broken more than it repaired. So it stays. Test for null with `x === null`, and when `typeof` says `"object"`, remember it might mean "nothing".

**Hoisting is two passes, not a move.** Before JavaScript runs a single line of your file, it reads the whole thing once and registers every declaration it finds. Then it runs the lines top to bottom. People describe this as "declarations get moved to the top", and the picture is wrong in a way that will confuse you later. Nothing moves. There are two passes.

![](diagram:session-3-1/fig3-two-passes)

In pass one, a `var ghost` is registered *and* filled with `undefined`, so reading `ghost` before its line silently gives you `undefined`. A `let hero` or `const hero` is registered but locked, in what the specification calls the **temporal dead zone**: touch it before its line and JavaScript throws a `ReferenceError` instead of quietly handing you nothing. A `function cast() {}` declaration is registered whole, body and all, which is why you can call a function above the place you wrote it. The practical rule is simply "declare before you use", and if you follow it, hoisting never bites. But when someone asks you what hoisting is, you now have a true answer: declarations are processed before execution; `var` reads as `undefined` early; `let` and `const` throw; function declarations are ready.

The loud error is the feature. The whole reason `let` and `const` exist is that silent `undefined` was a bug factory for twenty years.

**Control flow is a road with gates.** A program reads top to bottom unless you give it a reason to branch, and the reasons are `if`, `else if`, `else`, `switch`, and the one-line `? :`. At every gate, JavaScript asks one question of the value in front of it: *does this count as true?* Six values do not: `false`, `0`, `""`, `null`, `undefined` and `NaN`. These are the **falsy** six. Everything else counts as true, including some things that surprise people: the string `"0"`, an empty array `[]`, an empty object `{}`. Memorise the six and the surprises stop.

> **Say:** "A variable is a named container: const by default, let when it must change, never var. Seven primitives, everything else is an object. Declarations are registered first, then the lines run. At every gate the question is: does this count as true?"

## The demonstration

Five files, in the order you would type them at the desk. Press **Run** on each and read the output against the code.

### 1. Containers, kinds, and the backtick

Every primitive declared, checked with `typeof`, and used in a template literal.

```js run=mana
'use strict';
// Variables: your mana containers.
let playerName = 'Kirito';   // string, can change later
const maxHP = 100;           // number, should never change
let isAlive = true;          // boolean
let inventory = null;        // null: intentionally empty
let questLog;                // undefined: declared, never given a value

console.log(typeof playerName, typeof maxHP, typeof isAlive);
console.log(typeof inventory, '<- the 1995 bug: null reports as "object"');
console.log(typeof questLog);
console.log(typeof 10n, typeof Symbol('id'));

// let allows reassignment. const refuses, loudly.
playerName = 'Asuna';
try {
  maxHP = 200;
} catch (e) {
  console.log('const refused:', e.constructor.name, '-', e.message);
}

// const seals the binding, not the contents of an object.
const party = ['Asuna'];
party.push('Klein');
console.log(party);

// Template literals: backticks, ${} for any expression, newlines allowed.
const damage = 25;
console.log('Hello, ' + playerName + '! You have ' + maxHP + ' HP.'); // the old way
console.log(`Hello, ${playerName}! You have ${maxHP} HP.`);          // the new way
console.log(`${playerName} took ${damage} damage! HP: ${maxHP - damage}`);
console.log(`
  Name:   ${playerName}
  HP:     ${maxHP}
  Status: ${isAlive ? 'Alive' : 'Dead'}`);
console.log('ok: mana');
```

Three things to notice. The two greetings print the same text, and the second is the one you will write from now on: a **template literal** uses backticks, drops any expression into `${}`, and can span lines without escape characters. The `const refused` line is the sealed flask doing its job; read the message once so you recognise it later. And `party.push('Klein')` succeeded on a `const`, because the flask holds a reference to the array, and the array itself is open.

### 2. Two passes, watched live

The same file as fig. 3, so you can see the registration pass leave its fingerprints.

```js run=hoisting
'use strict';
// Pass 1 registered every declaration below before Pass 2 ran a single line.
console.log('ghost before its line:', ghost);   // undefined, silently
var ghost = 'boo';

try {
  console.log(hero);                            // the temporal dead zone
} catch (e) {
  console.log('hero before its line:', e.constructor.name, '-', e.message);
}
let hero = 'Aria';

console.log(cast(), '<- declared below, works anyway');
function cast() { return 'fireball'; }

// A block makes a new scope for let and const, not for var.
if (true) {
  let potion = 'minor healing';
  var gold = 50;
}
console.log(typeof potion, '<- potion stayed inside the block');
console.log(gold, '<- gold leaked out: var is function-scoped');
console.log('ok: hoisting');
```

`ghost` reads as `undefined` with no complaint. `hero` throws, and the message says precisely what happened: "cannot access before initialization". `cast()` runs a line before the function is written. Then the block: `potion` is gone the moment the braces close, and `gold` is still there, because `var` never respected the braces in the first place. That last pair of lines is the whole case against `var` in four lines of output.

### 3. Operators, and what they hand back

Arithmetic, the assignment shortcuts, comparison, and the logical operators. Predict each line before you run it.

```js run=operators
'use strict';
let hp = 100;
const damage = 30;
console.log('remaining', hp - damage);     // 70
console.log('critical', damage * 2);       // 60
console.log('even?', hp % 2 === 0);        // true
console.log('squared', damage ** 2);       // 900
console.log('7 / 2 =', 7 / 2, '| 7 % 2 =', 7 % 2, '| 0.1 + 0.2 =', 0.1 + 0.2);

let gold = 50;
gold += 10;   // 60
gold -= 5;    // 55
gold *= 2;    // 110
console.log('gold', gold);

// Comparison. Strict means "same type AND same value".
console.log(5 === 5, 5 === '5', 5 !== '5');
console.log(3 > 2, 2 >= 2, 'b' > 'a');

// Logical operators, and what they really hand back.
const hasKey = true;
const doorOpen = false;
console.log(hasKey && doorOpen, hasKey || doorOpen, !doorOpen);
console.log('potion' || 'nothing', 0 || 'fallback', '' && 'never reached');
console.log(null ?? 'default', 0 ?? 'default');
console.log('ok: operators');
```

Two lines deserve a pause. `0.1 + 0.2` is not `0.3`; it is `0.30000000000000004`, because numbers are stored in binary and some decimals do not fit. Every language with floating-point numbers does this; it is not a JavaScript quirk, and the Numbers side quest shows you how to round and compare safely. And look at what `||` and `&&` return: not `true` or `false`, but one of their operands. `0 || 'fallback'` gives `'fallback'`. That is why `||` is used for defaults, and why `??`, which only steps in for `null` and `undefined`, is the safer default when `0` or `""` are legitimate values.

### 4. The road, and the three ways to build a gate

`if / else if / else`, truthy and falsy at the gate, `switch` with and without `break`, the ternary, and then all three in one function.

![](diagram:session-3-1/fig4-branching-road)

```js run=quest
'use strict';
// 1. if / else if / else: tests run in order, the first true one wins.
function hpReport(playerHP) {
  if (playerHP > 50) return 'You are healthy!';
  else if (playerHP > 20) return 'You are wounded. Find a potion!';
  else if (playerHP > 0) return 'CRITICAL HP! Run away!';
  else return 'Game Over.';
}
for (const hp of [75, 40, 5, 0]) console.log(hp, '->', hpReport(hp));

// 2. Truthy and falsy: if() asks "does this count as true?"
const username = '';
if (username) console.log(`Welcome, ${username}!`);
else console.log('Please enter a username.  ("" is falsy)');
const samples = [['0', 0], ['"0"', '0'], ['""', ''], ['[]', []], ['null', null], ['NaN', NaN]];
for (const [label, v] of samples) console.log(label.padEnd(5), 'counts as', Boolean(v));

// 3. switch: one value, many cases. break or you fall through.
function weaponBonus(weapon) {
  switch (weapon) {
    case 'sword': return 'Attack +10';
    case 'bow': return 'Attack +7, Range +5';
    case 'staff': return 'Attack +3, Magic +15';
    default: return 'No weapon equipped.';
  }
}
console.log(weaponBonus('sword'), '|', weaponBonus('staff'), '|', weaponBonus('spoon'));

// The fall-through trap, on purpose this time: no break between cases.
function rarityLabel(stars) {
  let label = '';
  switch (stars) {
    case 3: label += 'LEGENDARY ';
    case 2: label += 'RARE ';
    case 1: label += 'COMMON';
      break;
    default: label = 'junk';
  }
  return label;
}
console.log('3 stars ->', rarityLabel(3), '| 1 star ->', rarityLabel(1));

// 4. Ternary: a one-line if/else that produces a value.
const level = 25;
const rank = level >= 50 ? 'Elite' : 'Novice';
const currentHP = 0;
console.log(rank, `| Player is ${currentHP > 0 ? 'alive' : 'dead'}`);

// 5. The class selector, all three tools together.
function describeClass(playerClass, level) {
  const tier = level >= 30 ? 'veteran' : level >= 10 ? 'journeyman' : 'rookie';
  let stats;
  switch (playerClass) {
    case 'warrior': stats = { hp: 150, atk: 20, mp: 0 }; break;
    case 'mage': stats = { hp: 80, atk: 35, mp: 100 }; break;
    case 'healer': stats = { hp: 90, atk: 15, mp: 120 }; break;
    default: return `Unknown class "${playerClass}". Pick warrior, mage or healer.`;
  }
  return `${tier} ${playerClass}: HP ${stats.hp} · ATK ${stats.atk}${stats.mp ? ` · MP ${stats.mp}` : ''}`;
}
console.log(describeClass('mage', 35));
console.log(describeClass('warrior', 3));
console.log(describeClass('bard', 12));
console.log('ok: quest');
```

Read the `hpReport` output against fig. 4. Seventy-five enters at the top, the first gate is true, and the other three gates are never consulted. That is why order matters: if you wrote the `> 0` test first, a player with 75 HP would be told to run away. The `for (const hp of [75, 40, 5, 0])` line that feeds it is a loop: it runs the statement after it once for each value in the list, with `hp` holding that value. Read `for ... of` as "for each of these" for now; loops get their proper introduction in 3.4. The `samples` loop is the falsy six and their look-alikes printed by the engine; `"0"` is a string with a character in it, so it counts as true, and that one bites people in form handling for years.

The `rarityLabel` function is the `switch` trap shown on purpose. With no `break` after a matching case, execution falls through into the next case and the next, which is why three stars collects all three words. Occasionally that is what you want. Usually it is a bug, and the fix is a `break` on every case. Finally, `describeClass` is the three tools together: a ternary for the tier because it produces a value, a `switch` for the class because it matches one value against several, and an early `return` in `default` so the bad input never reaches the template.

> **Note:** A ternary that nests more than once, like `tier` above, is at the edge of readable. Two levels is the limit; past that, write an `if` chain and let it breathe.

### 5. A character sheet, written the clean way

Not a run block, because you are about to write this one yourself. This is the shape the first exercise asks for: declare everything, calculate, then print once with a template literal.

```js
const name = 'Kirito';
const level = 12;
const baseAttack = 40;
const baseDefense = 25;
const weapon = 'Elucidator';
const weaponBonus = 15;

const totalAttack = baseAttack + weaponBonus;
const powerLevel = (totalAttack + baseDefense) * level;
const isEvenLevel = level % 2 === 0;

console.log(`
=== CHARACTER SHEET ===
Name:         ${name}
Level:        ${level} (${isEvenLevel ? 'even' : 'odd'})
Weapon:       ${weapon} (+${weaponBonus})
Total Attack: ${totalAttack}
Defense:      ${baseDefense}
Power Level:  ${powerLevel}
=======================`);
```

Every variable is a `const`, because nothing on a character sheet changes while you print it. The maths happens once, into named variables, so the template reads like a form instead of a formula. That habit, name the value then use the name, is worth more than any individual operator.

## Where it breaks

**Two equals signs lie.**

Everything above compared values with `===`, and you may have wondered why three. JavaScript has two equality operators. The loose one, `==`, converts both sides to a common type *before* comparing, following a page of rules nobody has memorised. The strict one, `===`, compares type and value and never converts anything. The loose one is the source of a whole genre of bugs, and this is the week you meet it so that you never write it.

![](diagram:session-3-1/fig5-two-equals-signs)

```js run=coercion
'use strict';
// == converts first, then compares. Predict each line before you run it.
console.log('5 == "5"          ', 5 == '5');
console.log('"" == false       ', '' == false);
console.log('0 == "0"          ', 0 == '0');
console.log('null == undefined ', null == undefined);
console.log('[] == false       ', [] == false);
console.log('"0" == false      ', '0' == false, ' but "0" is truthy:', Boolean('0'));

// === never converts. Every one of those is now false.
console.log(5 === '5', '' === false, 0 === '0', null === undefined, [] === false);

// + and - disagree about strings.
console.log('"5" + 3 =', '5' + 3, '| "5" - 3 =', '5' - 3);
console.log('true + 1 =', true + 1, '| false + 1 =', false + 1);
console.log('"5" * "2" =', '5' * '2', '| "five" * 2 =', 'five' * 2);

// The bug this causes, in one line: a number read from a form is a string.
const goldFromInput = '50';
console.log('wrong total:', goldFromInput + 10);
console.log('right total:', Number(goldFromInput) + 10);

// Convert on purpose, and check the result.
console.log(Number('42'), Number(''), Number('abc'), Number.isNaN(Number('abc')));
console.log(String(42), Boolean(''), Boolean('0'), parseInt('42px', 10));
console.log('ok: coercion');
```

Look at the first six lines. Five different pairs of values that are plainly not the same thing, and `==` says they are. Then look at the row of `false` under `===`: the strict operator gets every one right by refusing to guess. There is one place `==` is sometimes defended, `x == null` as a shorthand for "null or undefined", and even there, `x === null || x === undefined` costs you eleven characters and saves the next reader from wondering whether you knew what you were doing.

The second half is the same disease in the arithmetic operators. `+` has two jobs, adding numbers and joining strings, and if either side is a string it picks joining. `-`, `*` and `/` have one job, so they convert the string to a number and carry on. That asymmetry is why `"5" + 3` is `"53"` and `"5" - 3` is `2`, and it is why the `goldFromInput` line prints `5010`. Every value that comes from a form field, a URL, or a text file arrives as a string. The fix is never to hope; the fix is to convert on purpose, with `Number()`, and then check for `NaN`, which is what `Number` hands back when the conversion fails.

That gives you the two-line rule for the week:

- **Three equals signs, always.** `===` and `!==`, with no exceptions you need yet.
- **Convert on purpose.** `Number(x)`, `String(x)`, `Boolean(x)`, and check `Number.isNaN` after a `Number()` you did not control.

> **Note:** Founder-brain shortcut: `==` is a stranger who agrees with everything you say. `===` is the friend who tells you when you are wrong. Hire the friend.

## Your turn

Two short builds before the quest. Keep the Run output open beside you; every operator you need is in it.

**First, the folder (5 minutes).** Every file in this unit lives in one repository, `~/projects/js-fundamentals`. Make it now, before the first file, so every exercise and quest from here to 3.5 has a home and a remote:

```bash
mkdir -p ~/projects/js-fundamentals
cd ~/projects/js-fundamentals
git init
gh repo create js-fundamentals --public --source=. --remote=origin
```

`git init` prints `Initialized empty Git repository in …/js-fundamentals/.git/`, and `gh repo create` answers `✓ Created repository YOU/js-fundamentals on GitHub` and adds the `origin` remote, the way 1.4 did it. Open the folder with `code .`, write every file below inside it, and commit after each exercise runs clean.

**1. The Adventurer's Calculator (15 minutes).** In `calculator.js`, declare a character: `name`, `level`, `baseAttack`, `baseDefense`, `weapon` (a string), `weaponBonus` (a number). Calculate `totalAttack = baseAttack + weaponBonus` and `powerLevel = (totalAttack + baseDefense) * level`. Use the modulo operator to decide whether the level is even or odd. Then print one character sheet with a single multi-line template literal, the way demo 5 does. Run it with `node calculator.js`. Success looks like: a printed sheet with every stat, a correct power level, and the even/odd line. If the power level prints as a long string of digits glued together, you have a `+` joining strings somewhere; check that every number is a number.

**2. The Quest Decision Engine (20 minutes).** In `quest.js`, declare `playerLevel` (number), `hasGuildCard` (boolean), `questRank` (one of `"S"`, `"A"`, `"B"`, `"C"`, `"D"`) and `playerGold` (number). Write an `if / else if / else` chain that sets `canAccept`: S rank needs level 50 and a guild card; A rank needs level 30 and a guild card; B needs level 15; C needs level 5; D is open to anyone. Then a `switch` on `questRank` that prints the quest description, a ternary that decides whether they can afford the 100-gold fee, and a final template literal that reports all three answers. Change the inputs and run it at least three times; you should be able to produce an accepted quest, a refused quest, and a quest they qualify for but cannot afford.

> **Tip:** Write the `else` branch first and make it print something. Then add the `if`s above it one at a time, running after each. A chain you build in that order never has a hole in it.

## The quest

> *The guild receptionist eyes you warily as you approach the counter. "State your name, class, and business," she says, pulling out a thick ledger. Depending on who you are and what you have done, this conversation could go very differently.*

**The NPC Dialogue System.** Create `npc-dialogue.js` and give the receptionist a mind.

1. Declare at least eight variables for the player: `name`, `level`, `playerClass`, `gold`, `hp`, `maxHP`, `reputation`, `hasMagic`. Pick `const` or `let` deliberately for each one.
2. Build the reputation ladder. At 80 or above, she is friendly and offers a discount. From 40 to 79, she is neutral and businesslike. Below 40, she is hostile and charges double. If the player has no gold at all, she says something funny, whatever the reputation.
3. Add a `switch` on `playerClass` that changes how she reacts: a mage gets offered scrolls, a warrior gets pointed at the bounty board, and so on, with a `default` for classes she has never heard of.
4. Use at least three ternaries somewhere in the dialogue, for example the health remark (`hp < maxHP / 2 ? 'You look terrible.' : 'You look well.'`).
5. Every string the receptionist says is a template literal. No `+` between strings anywhere in the file.
6. Leave at least three comments that explain a decision, not a line: *why* the ladder is ordered the way it is, not *what* an `if` does.

Hints that save an hour: declare every variable at the top before you write a single line of dialogue; build one branch, run it, change a value, run it again; and if a branch never fires no matter what you type, check whether an earlier test in the chain is catching it first, the way fig. 4 showed.

Stretch goals, in order of difficulty: a bartering rule using modulo (gold divisible by 7 earns a lucky discount); a second NPC with entirely different logic; a `timeOfDay` variable that changes her mood (cheerful in the morning, suspicious at night). Commit `npc-dialogue.js` and push it: `git add -A`, `git commit -m "npc dialogue"`, `git push -u origin main`. The `js-fundamentals` repo collects the whole unit's work.

## Side quests

Four pages in the library go deeper than one session can. Read them in this order; each one is a short reference sheet with code that runs in the page.

## Before next session

Three things, in this order.

First, finish the NPC Dialogue System if it did not get done in the session. It is the artifact for this session, and Session 3.2 assumes you can write a branching chain without looking one up.

Second, read the "What is JavaScript?" and "Variables" sections of MDN's [JavaScript first steps](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting). You know enough now that it will read like review, which is the point: the second pass is where it sticks.

Third, open the DevTools console and try five type-coercion experiments of your own. Write the prediction down *before* you press Enter. `"3" * "4"`, `[] + []`, `[] + {}`, `"b" + "a" + +"a" + "a"`, and whatever else occurs to you. When a prediction is wrong, find out why; that is the whole exercise.

Session 3.2 is called Spell Crafting. You will take the branches and calculations you wrote today and wrap them in functions, so that you write them once and cast them anywhere, and you will meet the array methods that turn a list of orcs into a list of the ones over level ten in a single line. The `const`s you chose today are about to become the arguments of tomorrow.

> **Say:** "A variable is a named container: const by default, let when it must change, never var. Seven primitives, and everything else is an object. Declarations are registered first, then the lines run. At every gate the question is whether the value counts as true, and six values do not. Three equals signs, always, and convert on purpose."

Say it once more without reading it. If it comes out in your own words, your mana bar is full.
