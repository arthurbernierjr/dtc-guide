---
editorial: true
title: Spell Crafting
subtitle: Functions, Scope, Closures, and Array Methods
hook: "Write the incantation once, name it, and cast it anywhere; then learn why some spells remember."
read: 45
artifact: "spellbook.js: ten spells, a closure-based mana pool, and the first two query functions built on filter"
diagrams:
  - fig1-three-spellings
  - fig2-scope-rings
  - fig3-backpack
  - fig4-combo-chain
  - fig5-missing-return
docs:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
say:
  - "a function is a named spell: write it once, cast it anywhere"
  - "lookups walk outward, never inward"
  - "a closure is a function carrying a backpack"
  - "filter fewer, map the same, reduce to one, and never touch the original"
  - "no return means undefined"
---

## The hook

Picture a wizard who has to recite the whole incantation from the first syllable every single time she wants a fireball.

That is you, right now. Last session you learned to hold values and choose between roads, and the NPC you wrote works. But look at the file. The reputation ladder is written out in full at the one place the receptionist uses it, and nothing else can use it. If you wanted a second NPC you would copy the ladder, and a bug in it would then live in two places. The wizard who recites everything from scratch does not get much done, and neither does the programmer who does.

A **function** is a named spell. You write the incantation once, you give it a name, and from then on you cast it with a single word and a pair of parentheses. That alone would be worth the session. But we are going further, because functions bring two companions that most beginners meet without being introduced.

The first is **scope**, the set of rules about where a variable lives and dies. The second is the **closure**, a function that remembers the place it was born and carries that place around with it after the place itself is gone. Closures sound exotic. They are not. You will write six of them today without trying.

> *Last session you learned to speak. Today you learn to write the spell down, so you never have to say the whole thing twice.*

And then the combo attacks. JavaScript arrays come with a family of methods that take a function as their argument and apply it to every element: `map`, `filter`, `reduce`. Chained together, they turn a list of orcs into a list of the dangerous ones, then into a list of their names, then into a single number, in four readable lines and without a single loop counter. By the end of this session that chain will be the most natural thing in the world, and you will have a mana pool that refuses to be overdrawn, built from a closure.

## The idea

Four ideas again, and this time they stack: each one is built from the one before it.

**A function is a named spell, and JavaScript spells it three ways.** The spell has a name, a list of **parameters** (the names it expects), a body, and a **return value** (what it hands back). When you cast it, the values you pass in are the **arguments**.

![](diagram:session-3-2/fig1-three-spellings)

A **function declaration** starts with the word `function` and is **hoisted**: the whole thing is registered in the first pass you met last session, so you can call it on a line above the one where it is written. A **function expression** stores a function in a variable, usually a `const`; it is not hoisted, because the variable is in the temporal dead zone until its line. An **arrow function** is the short modern spelling: `(a, b) => a + b`. If the body is a single expression, it is returned without the word `return`. Arrows also have no `this` of their own, which matters a great deal in Session 3.4 and not at all today.

Which to use? Declarations for the named, top-level spells in a file. Arrows for everything you pass to something else: callbacks, the little transformers inside `map` and `filter`. Expressions when you need a function in a variable and want the long spelling for some reason, which is rare. **Default parameters** (`name = "Adventurer"`) fill in missing arguments. And the distinction you will trip on this week: `calculateDamage(25, 10)` with parentheses *casts* the spell and gives you `15`; `calculateDamage` without them *refers to* the spell itself, the scroll rather than the fire. You hand scrolls to `map`. You cast fire everywhere else.

**Scope is a set of nested rings, and lookups walk outward.** A variable declared outside every function and block is **global**; it is visible everywhere, which is why you want as few of them as possible. A variable declared inside a function is **function-scoped**; it exists only while that function runs. A `let` or `const` inside braces is **block-scoped**; it exists only inside those braces.

![](diagram:session-3-2/fig2-scope-rings)

When code mentions a name, JavaScript looks in the current ring, then the ring around it, then the ring around that, out to the global ring. That outward walk is the **scope chain**. The walk only goes one way. Code inside the `if` block can read `dungeonLevel` from the function around it and `worldName` from the world around that; code after the block cannot read `boss`, because the block's ring has closed. The two `ReferenceError`s in the figure are the ones you will see most this week, and both have the same cause: trying to look *into* a ring from outside it.

**A closure is a function carrying a backpack.** Here is the sentence to memorise: *a function remembers the scope it was created in, even after that scope has finished.* That memory is the closure.

![](diagram:session-3-2/fig3-backpack)

`createCounter` runs, declares `count`, returns an inner function, and finishes. Its ring should be gone. But the inner function mentioned `count`, so when it left, it took `count` with it in a backpack. Every call to `hitCounter()` opens the backpack, adds one, and puts it back. Nothing outside can reach into that backpack; `count` is as private as a variable can be in JavaScript. And a second call to `createCounter()` packs a brand-new backpack with its own `count`, which is why `comboCounter` starts at one while `hitCounter`, on three in the figure, carries on to four when the run block calls it once more.

This is not an advanced feature you will use someday. It happens every time an inner function mentions an outer variable, which is to say constantly. Counters, private state, factories that produce configured functions (`createAttack(50)` gives you a `fireball` that always knows its base damage), the mana pool in today's lab. Closures are also the mechanism under event handlers and asynchronous code, so the backpack picture will keep paying you back for the rest of the course.

**Array methods are combo attacks: filter fewer, map the same, reduce to one.** An array is an ordered list, counted from zero. Some of its methods **mutate** it in place (`push`, `pop`, `shift`, `unshift`, `splice`, `sort`); others leave it alone: `slice` and `concat` hand back a new array, `includes` and `indexOf` an answer. Then there is the family that takes a function and applies it per element.

![](diagram:session-3-2/fig4-combo-chain)

`forEach` runs a function on each element and returns nothing; it is for side effects like printing. `map` runs a function on each element and returns a new array of the results, same length, new shape. `filter` runs a test on each element and returns a new array of only the ones that passed, fewer or equal, same shape. `reduce` runs a function that folds each element into an **accumulator** and returns the single final value: a sum, a count, an object of counts, a maximum. Because each of `filter`, `map` and `reduce` returns a new value, you can hand that value straight to the next one, and that hand-off is the chain in the figure. The original array is never touched.

> **Say:** "A function is a named spell: write it once, cast it anywhere. Lookups walk outward, never inward. A closure is a function carrying a backpack. Filter fewer, map the same, reduce to one, and never touch the original."

There is one more toolset that appears in every modern file you will read, the three dots that unpack an object or pack up leftover arguments, and it is deliberately not on this page. Four ideas is the right load for one session. The dots, the rules for copying an array without changing the original, and the counting pattern built on `reduce` get a page of their own in [Session 3.3](/path/3-3-the-proving-grounds/), where you also prove, on three small problems with no scaffolding, that today's four ideas are in your hands. One of them does appear once below, in the last Run block, and it is introduced the moment it shows up.

## The demonstration

Five files, in the order you would write them at the desk. Press **Run** on each and read the output against the code.

### 1. One spell, three spellings

Declarations, expressions and arrows, default parameters, call versus reference, and the first sighting of the missing `return`.

```js run=three-ways
'use strict';
// 1. Declaration: hoisted, so this call works a line above the definition.
console.log(calculateDamage(25, 10));
function calculateDamage(attack, defense) {
  return Math.max(0, attack - defense);
}

// 2. Expression: a function stored in a variable. Not hoisted.
const calculateHeal = function (baseHeal, level) {
  return baseHeal + level * 2;
};
console.log(calculateHeal(20, 5));

// 3. Arrow: short, and the one expression is returned without the word.
const calculateCrit = (damage, multiplier = 2) => damage * multiplier;
const double = (x) => x * 2;
const rollDice = () => Math.floor(Math.random() * 6) + 1;
console.log(calculateCrit(40), calculateCrit(40, 3), double(21));
const roll = rollDice();
console.log('rolled a number between 1 and 6:', roll >= 1 && roll <= 6);

// Parameters are the names in the definition; arguments are the values at the call.
function greetHero(name = 'Adventurer', title = 'Novice') {
  return `Hail, ${name} the ${title}!`;
}
console.log(greetHero());
console.log(greetHero('Guts', 'Berserker'));

// Calling versus referencing: the parentheses are the spell.
console.log(typeof calculateDamage, '|', calculateDamage.name, '|', calculateDamage(5, 1));

// Forgetting return: the most common bug of the week.
function oops(a, b) {
  a + b; // computed, then dropped on the floor
}
console.log('oops(2, 3) ->', oops(2, 3));

// An expression is not hoisted: it sits in the temporal dead zone until its line.
try {
  tooEarly();
} catch (e) {
  console.log('expression before its line:', e.constructor.name);
}
const tooEarly = () => 'never reached';
console.log('ok: three-ways');
```

The first line of output is the hoisting proof: `calculateDamage` is called before it is written and works. The `tooEarly` block is the same experiment with an arrow, and it throws, because an arrow in a `const` is a variable like any other. In between, `Math.max(0, attack - defense)` is a pattern you will reuse all week: a floor, so damage never goes negative. And `oops(2, 3)` is `undefined`. Hold on to that; it comes back in Where it breaks.

### 2. The rings, walked by the engine

Global, function and block scope; the outward walk; shadowing; and the `var` leak seen from the scope side.

```js run=scope
'use strict';
let worldName = 'Aincrad';              // global scope

function enterDungeon() {
  let dungeonLevel = 5;                 // function scope
  console.log('inside the function:', worldName, dungeonLevel);

  if (dungeonLevel > 3) {
    let boss = 'Dragon';                // block scope
    const loot = 'Legendary Sword';
    console.log('inside the block:', boss, loot, dungeonLevel, worldName);
  }

  console.log('after the block, boss is', typeof boss);  // "undefined": the ring closed
  return dungeonLevel;
}
enterDungeon();
console.log('outside the function, dungeonLevel is', typeof dungeonLevel);

// Lookups walk outward: an inner function can see and change an outer variable.
let kills = 0;
function slay() { kills++; }
slay(); slay();
console.log('kills seen from outside:', kills);

// Shadowing: an inner declaration with the same name hides the outer one.
let potion = 'minor';
{
  let potion = 'greater';
  console.log('inside:', potion);
}
console.log('outside:', potion);

// var ignores the block ring. This is the leak from Session 3.1, seen from the scope side.
function varProblem() {
  if (true) {
    var leaked = 'I escaped the block!';
  }
  return leaked;
}
console.log(varProblem());
console.log('ok: scope');
```

The demo uses `typeof` to probe for `boss` and `dungeonLevel` from outside their rings, because a bare `console.log(boss)` there would throw and stop the file; `typeof` on a name that does not exist is the one safe way to ask. In your own file, do it the loud way once: write `console.log(boss)` after the block, read the `ReferenceError`, and delete the line. The `slay` function is the outward walk doing useful work, and `potion` is **shadowing**: an inner declaration with the same name hides the outer one for the length of the block, which is legal, occasionally handy, and usually a sign to pick a different name.

### 3. Backpacks

The three closures from fig. 3, the loop bug that `let` was invented to fix, and the shape the lab's mana pool will take.

```js run=closures
'use strict';
// 1. A counter that remembers. `count` lives in the backpack, not in the outside world.
function createCounter() {
  let count = 0;
  return function () {
    count++;
    return count;
  };
}
const hitCounter = createCounter();
console.log(hitCounter(), hitCounter(), hitCounter());
const comboCounter = createCounter();          // a brand-new backpack
console.log('combo:', comboCounter(), '| hits still:', hitCounter());
console.log('count from outside:', typeof count);

// 2. A factory: the argument is captured, and each returned function keeps its own.
function createGreeter(greeting) {
  return (name) => `${greeting}, ${name}!`;
}
const sayHello = createGreeter('Hello');
const sayYo = createGreeter('Yo');
console.log(sayHello('Naruto'), '|', sayYo('Luffy'));

// 3. A damage multiplier: configure once, cast many times.
function createAttack(baseDamage) {
  return (multiplier) => baseDamage * multiplier;
}
const fireball = createAttack(50);
console.log(fireball(1), fireball(2.5));

// 4. The classic loop bug, and why let fixed it.
const withVar = [];
for (var i = 0; i < 3; i++) withVar.push(() => i);
const withLet = [];
for (let j = 0; j < 3; j++) withLet.push(() => j);
console.log('var:', withVar.map((f) => f()), '| let:', withLet.map((f) => f()));

// 5. The lab's shape: a closure that returns an object of methods sharing one secret.
function createManaPool(maxMana) {
  let currentMana = maxMana;
  return {
    cast(cost) {
      if (cost > currentMana) return 'not enough mana!';
      currentMana -= cost;
      return currentMana;
    },
    rest() { currentMana = maxMana; return currentMana; },
    getStatus() { return `${currentMana}/${maxMana} mana`; },
  };
}
const pool = createManaPool(100);
console.log(pool.cast(30), pool.cast(50), pool.cast(40), pool.getStatus());
console.log(pool.rest(), pool.getStatus(), '| currentMana from outside:', pool.currentMana);
console.log('ok: closures');
```

Part 4 is the most famous closure bug in the language, and it is worth a minute. The `for (let j = 0; j < 3; j++)` line is a counting loop: start `j` at 0, run the body while `j < 3`, add one after each pass; loops get their full introduction in 3.4, and this is the only one you need today. With `var`, there is one `i` for the whole loop, every arrow carries the same backpack, and by the time anyone opens it the loop has finished and `i` is `3`. With `let`, each pass through the loop gets its own `j`, so each arrow carries its own backpack with its own value. That is the actual reason `let` has the scoping rules it has. Part 5 is a closure wearing an object: three methods, one shared `currentMana`, and `pool.currentMana` from outside is `undefined` because the mana was never a property. That shape is the lab.

### 4. Arrays, mutating and not, and the combo chain

Everything from fig. 4: the mutating methods, the copying ones, and the four that take a function.

```js run=arrays
'use strict';
const party = ['Warrior', 'Mage', 'Healer', 'Thief'];
console.log(party[0], party[party.length - 1], party.at(-1), party.length);

// Mutating methods change the array you already have.
party.push('Ranger');
party.pop();
party.unshift('Tank');
party.shift();
party.splice(1, 1, 'Dark Mage');            // at index 1, remove 1, insert one
console.log('after mutation:', party);

// Non-mutating methods hand back something new and leave party alone.
const frontline = party.slice(0, 2);
const combined = party.concat(['Bard']);
console.log(frontline, combined, party.includes('Dark Mage'), party.indexOf('Healer'));
console.log('party unchanged:', party);

const heroes = [
  { name: 'Goku', power: 9001, class: 'Warrior' },
  { name: 'Naruto', power: 7500, class: 'Warrior' },
  { name: 'Sailor Moon', power: 8200, class: 'Mage' },
  { name: 'Deku', power: 6800, class: 'Warrior' },
  { name: 'Jotaro', power: 8500, class: 'Fighter' },
];

// forEach: do something per element. Returns undefined, so it ends a chain.
heroes.forEach((h) => console.log(`${h.name}: Power Level ${h.power}`));

// map: same length, new shape.
console.log(heroes.map((h) => h.name));
console.log(heroes.map((h) => `${h.name} (${h.power > 8000 ? 'OVER 8000!' : h.power})`));

// filter: fewer or equal, same shape.
console.log(heroes.filter((h) => h.power > 8000).map((h) => h.name));
console.log(heroes.filter((h) => h.class === 'Warrior').length, 'warriors');

// reduce: one value. Always give it the starting value.
const totalPower = heroes.reduce((sum, h) => sum + h.power, 0);
console.log('total power:', totalPower);

// Chaining: fig. 4, run by the engine.
const strongTotal = heroes
  .filter((h) => h.power > 8000)
  .map((h) => h.power)
  .reduce((sum, p) => sum + p, 0);
console.log('strong total:', strongTotal);

// Highest with reduce, and the honest check that nothing was mutated.
const strongest = heroes.reduce((best, h) => (h.power > best.power ? h : best));
console.log('strongest:', strongest.name, '| heroes still has', heroes.length);
console.log('ok: arrays');
```

Two patterns to take away. The chain in `strongTotal` is fig. 4 line for line: five objects in, three after `filter`, three numbers after `map`, one number after `reduce`. Read it top to bottom like a sentence. And the last `reduce`, `strongest`, is the comparison shape: the accumulator is not a running total but the best candidate so far, and each pass keeps either the candidate or the newcomer. Notice that it is the one `reduce` on the page without a starting value. It works here because `heroes` has five elements, so the first one becomes the starting candidate. On an empty array it would throw, which is costume five below. There is a third `reduce` shape, the one that counts how many of each kind there are, and it waits for Session 3.3 so that you can build it slowly with a prediction in front of you.

### 5. The hero roster, shaped

Not a run block. This is the shape the second exercise asks for, so you can see the whole file before you write it.

```js
const createHero = (name, level, cls, attack, isActive = true) => ({ name, level, class: cls, attack, isActive });

const roster = [
  createHero('Aria', 12, 'Mage', 35),
  createHero('Bron', 9, 'Warrior', 28, false),
  // ... at least eight
];

const getActiveHeroes = (r) => r.filter((h) => h.isActive);
const getHeroNames = (r) => r.map((h) => h.name);
const getTotalAttack = (r) => r.reduce((sum, h) => sum + h.attack, 0);
const findStrongest = (r) => r.reduce((best, h) => (h.attack > best.attack ? h : best));
```

Notice the parentheses around the object in `createHero`: `=> ({ ... })`. Without them, the braces would be read as a function body and the arrow would return `undefined`. That is costume three in the section below, and you have now seen it before it bit you.

## Where it breaks

**The missing `return`, in its three costumes.**

Every function hands something back. If you do not say what, it hands back `undefined`, silently, and the bug shows up three lines later as `NaN` in an addition or `[undefined, undefined, undefined]` out of a `map`. It is the most common bug of the week by a wide margin, and it wears three costumes.

![](diagram:session-3-2/fig5-missing-return)

```js run=missing-return
'use strict';
const heroes = [{ name: 'Goku' }, { name: 'Naruto' }, { name: 'Jotaro' }];

// Costume 1: the forgotten word.
function oops(a, b) { a + b; }
console.log('costume 1:', oops(2, 3));

// Costume 2: braces without return.
const doubleBroken = (x) => { x * 2; };
const doubleFixed = (x) => x * 2;
console.log('costume 2:', doubleBroken(4), '-> fixed:', doubleFixed(4));

// Costume 3: map with a block body and no return.
console.log('costume 3:', heroes.map((h) => { h.name; }));
console.log('fixed:', heroes.map((h) => h.name));
// An object literal in an arrow needs parentheses, or the braces read as a block.
console.log('object:', heroes.map((h) => ({ tag: h.name.toUpperCase() })));

// Costume 4: forEach returns undefined, however hard you ask.
const names = heroes.forEach((h) => h.name);
console.log('forEach gave back:', names);

// Costume 5: reduce with no starting value on an empty list.
try {
  [].reduce((sum, n) => sum + n);
} catch (e) {
  console.log('reduce with no start on []:', e.constructor.name);
}
console.log('with a start:', [].reduce((sum, n) => sum + n, 0));

// And the opposite mistake: mutating what you meant to copy.
const levels = [10, 25, 18, 22];
const sortedWrong = levels.sort((a, b) => a - b);
console.log('sort mutated the original:', levels, sortedWrong === levels);
const base = [10, 25, 18, 22];
const sortedRight = [...base].sort((a, b) => a - b);
console.log('copy first:', base, sortedRight);
console.log('ok: missing-return');
```

Costume one is the plain forgotten word. Costume two is an arrow with braces: the moment you add `{ }`, the body is a block of statements and the implicit return is gone, so either drop the braces or write `return`. Costume three is costume two inside `map`, which is where it does the most damage, because `map` dutifully collects the `undefined` from every call and hands you an array full of nothing. The object-literal case is its cousin: `h => { tag: ... }` is a block containing a label, not an object; wrap the object in parentheses.

Costumes four and five are relatives. `forEach` returns `undefined` by design, so assigning its result is always a mistake; if you want the results, you wanted `map`. `reduce` without a starting value uses the first element as the start, which works until the array is empty and then throws. Always pass the start.

The last block is the opposite mistake, and it belongs here because it is the same family: not knowing what a method hands back. `sort` sorts the array *in place* and returns the same array, so `sortedWrong === levels` is `true` and your "original" is gone. Copy first, then sort the copy. The copy on that line is made with `[...base]`, and those three dots are **spread**: they unpack every element of `base` into a brand-new array literal, so `sortedRight` is a different array that happens to start with the same values. That is the only job spread does on this page. `base.slice()` would make the same copy with a method you already know. Session 3.3 gives the dots their full treatment, including the one case where this kind of copy is not enough. The Sorting side quest covers the comparator function and the mutation trap in full.

That gives you the two-line rule for the week:

- **Every function path says `return`**, and an arrow with braces is a function path.
- **Know what it hands back.** `map` an array, `filter` an array, `reduce` one value, `forEach` nothing, `sort` the same mutated array.

> **Note:** Founder-brain shortcut: a function with no `return` is a vending machine that takes your coin, hums, and gives you nothing. The machine is not broken. You forgot to tell it what to dispense.

## Your turn

Two short builds before the quest, and the first one is a reading exercise.

**1. Scope detective (10 minutes).** Below are five situations. For each, write down what prints or whether it throws, *before* you run it in the console. Then run it. (a) A `let` declared inside an `if` block, read after the block. (b) A `var` declared inside an `if` block, read after the block. (c) An inner function that increments an outer `let`, called twice, then the outer variable read. (d) A `const` arrow function called on the line above its declaration. (e) A `for` loop with `var i` pushing arrows into an array, then every arrow called. Four out of five correct is the bar. Every one of the five has appeared in a Run block on this page, so if you miss one, scroll up and find it.

**2. The Hero Roster Manager (25 minutes).** In `hero-roster.js`, build an array of at least eight hero objects with `name`, `level`, `class`, `attack` and `isActive`. Write `getActiveHeroes` (filter), `getHeroNames` (map), `getTotalAttack` (reduce), `findStrongest` (reduce with a comparison), and a factory `createHero(name, level, cls, attack)` that defaults `isActive` to `true`. Use the factory to add two heroes, call every function, and log the results with labels. Demo 5 is the shape; fill it in and make it real. Success looks like: every function returns the right value, `findStrongest` names the hero with the highest attack, and `roster` is the same length after all your queries as before them, because none of them mutated it.

> **Tip:** After every array method, log the original array once. If it changed, you used a mutating method where you wanted a copying one.

## The quest

> *You descend into the Arcane Library, a vast underground chamber lined floor to ceiling with glowing tomes. Each spell is catalogued by element, mana cost and destructive potential. The Head Librarian hands you a quill. "Organise this mess, apprentice. And while you are at it, build me a mana pool tracker. I am tired of running out mid-battle."*

**The Spell Book, part one.** Create `spellbook.js` in `~/projects/js-fundamentals` and bring order to the Archives. The book is finished over two sessions. Today it gets its spells, its mana pool, and its first two queries; Session 3.3 adds the other four and pushes the finished file.

1. An array of at least ten spell objects with `name`, `element` (fire, ice, lightning, earth, dark, light), `manaCost`, `damage` and `level` (the level required to cast it). Give every spell all five properties, spelled exactly the same way each time; the queries next session depend on it.
2. The first two query functions, each one line if you can manage it: `getSpellsByElement(spells, element)` returns the spells of that element, and `getAffordableSpells(spells, currentMana)` returns the spells whose `manaCost` is at or below `currentMana`. Both use `filter`. Both hand back a new array and leave `spells` alone; log `spells.length` after calling them to prove it.
3. A closure, `createManaPool(maxMana)`, that returns an object with `cast(manaCost)` (spends mana and returns what is left, or `"not enough mana!"`), `rest()` (restores to max) and `getStatus()` (current and max as a string). `currentMana` must be a variable in the closure, never a property on the object.
4. Test the pool: cast three spells, check status, rest, check status again. Then prove the privacy: log `pool.currentMana` and show it is `undefined`.

Hints that save an hour: write the spells first and log them, so every function has real data to run on; a `filter` callback is a question with a yes-or-no answer, so `(s) => s.element === element` is the whole body; and if a query ever returns `[undefined, undefined, ...]`, you are wearing costume three.

Run it with `node spellbook.js` from inside `~/projects/js-fundamentals`. The last lines should be the pool's casts, its status, its status again after `rest()`, and `undefined` for `pool.currentMana`. Commit it (`git add spellbook.js` and `git commit -m "spellbook: spells, mana pool, two queries"`) but do not worry about the push yet; the file is pushed when it is finished next session.

Stretch goals, in order of difficulty: `castSpell(spellbook, spellName, manaPool)` that uses `getSpellsByElement` or a `filter` of its own to find the spell by name, checks the pool, and either casts it and returns the damage or explains why not; and a `levelUp` closure that tracks a character's level and reports which spells unlocked as it rises. Leave `map` and `reduce` queries for next session; they are the proving grounds.

## Side quests

Four pages in the library go deeper than one session can. Read them in this order; each one is a short reference sheet with code that runs in the page.

## Before next session

Three things, in this order.

First, finish part one of the Spell Book if it did not get done in the session: ten spells, the mana pool, and the two `filter` queries, committed in `~/projects/js-fundamentals`. It is the artifact for this session, and Session 3.3 opens that exact file and adds to it. Nothing is running between sessions; `node` exits when the file ends.

Second, write three arrow functions of your own in the console: one single-expression, one with braces and an explicit `return`, and one that returns an object literal in parentheses. Thirty seconds each, and costume two and three will never catch you again.

Third, read MDN's [Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) page, the whole thing. It is one of the best explanations on the web, and you now have the backpack picture to hang it on. When it reaches the loop example, you will recognise it.

Session 3.3 is called [The Proving Grounds](/path/3-3-the-proving-grounds/), and it is a different kind of session: fewer new ideas, more of your own hands. It teaches the three dots this page skipped, the honest rules for copying, and the counting `reduce`, each with a prediction you write before you press Run. Then it hands you three small problems on your own spellbook with no scaffolding, and a slower route back here if they do not go well. The four remaining queries, `map`, `reduce`, the comparison `reduce` and the counter, finish the book there. Objects, the `class` keyword and the word `this` wait for Session 3.4, and `createManaPool` is already the shape they will explain.

> **Say:** "A function is a named spell: write it once, cast it anywhere. Parentheses cast it; the bare name is the scroll. Lookups walk outward through the rings, never inward. A closure is a function carrying a backpack, and each call to the factory packs a new one. Filter fewer, map the same, reduce to one, and never touch the original. No `return` means `undefined`."

Say it once more without reading it. If it comes out in your own words, the Archives are in order.
