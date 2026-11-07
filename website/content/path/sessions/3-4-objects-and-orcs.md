---
editorial: true
title: Objects and Orcs
subtitle: Object-Oriented Programming in JavaScript
hook: "One blueprint, five hundred knights, and the word that keeps losing its character."
read: 45
artifact: "monster-manual.js: a Monster class, five subclasses, a three-phase Boss and a battle loop"
diagrams:
  - fig1-hand-copied
  - fig2-blueprint
  - fig3-prototype-chain
  - fig4-this-loses-character
docs:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
say:
  - "an object is state plus behaviour"
  - "a class is a blueprint, an instance is a thing built from it"
  - "methods live once, on the prototype"
  - "this is decided by how the function is called"
  - "extends adds one more link to the chain"
---

## The hook

Pause the game for a second and look at what is in your bag.

After three sessions you have variables, branches, functions that take functions, closures that remember, the array methods that turn a list into another list, and a finished spellbook that proved it. (Loops have appeared twice without an introduction; they get one below, before this session leans on them.) That is a real toolkit. If I handed you a spreadsheet of orc names and asked for the ones over level ten, sorted, you would be done before I finished the sentence.

Now I hand you something different. Not a list of names. A *character*. She has a name, a class, hit points, a maximum, an attack stat, a bag of skills, and a flag that says whether she is still standing. She can take damage. She can heal. She can tell you how she is doing. Where does all of that live?

Your first instinct, and it is a good one, is five variables: `ariaName`, `ariaHp`, `ariaMaxHp`, `ariaAttack`, `ariaSkills`. Fine for one hero. Now the dungeon master says there are five hundred players logged in. Five hundred times five variables, and a `takeDamage` function for every one of them, because each copy needs to know which `hp` it is subtracting from.

Look at the picture of that for a moment, because the whole session is a reaction to it.

> *You respawned with a sword and a notebook. Today you learn why every serious player carries blueprints instead.*

In every RPG ever made there are character classes. Warrior, Mage, Healer, Assassin. Each class has the same *shape* (a name, HP, a set of moves) and different *values* and different *abilities*. That is, almost word for word, what object-oriented programming is. You describe the shape once. You stamp out as many characters as you need. Each one carries its own numbers and shares the moves.

By the end of this session you will have warriors hitting mages, healers patching up the wounded, and a boss that gets angrier as its health drops. On the way you will meet the single most misunderstood word in JavaScript, watch it break in front of you, and learn the four rules that make it predictable. Keep your terminal open. Every code block below with a **Run** button runs right here in the page.

## The idea

There is one idea in this session and three ways of saying it.

**An object is state plus behaviour, kept together.** State is the data: `hp: 200`. Behaviour is what the thing can do: `takeDamage(50)`. Before today you kept those apart: data in variables, behaviour in functions that took the data as arguments. An object glues them so that `hero.takeDamage(50)` reads like a sentence and the function already knows whose `hp` to touch.

That is the whole idea. Everything else is about how to make *many* of them without copying.

![](diagram:session-3-4/fig1-hand-copied)

Look at the card grid. Five hundred players, and on every single card there is a copy of the same `attack()` function. It works. It is also a trap, and here is the trap in one sentence: **a bug in `attack()` is now five hundred bugs.** You fix card 017 and card 018 is still wrong. Memory is the small cost; the big cost is that nobody can say what "the attack function" is any more, because there are five hundred of them.

So the second way of saying the idea is: **a class is a blueprint, an instance is a thing built from it.**

![](diagram:session-3-4/fig2-blueprint)

The yellow sheet is the blueprint. It says: every `Character` has a name, hp, and an attack value, and every `Character` can `takeDamage`, `heal`, and `attackTarget`. The three cards on the right are instances, built from the sheet with the `new` keyword. Notice what is on the cards and what is not. Each card has its *own* name and its *own* numbers. Not one of them carries a copy of `takeDamage`. The methods are written once, on the blueprint, and every card can reach them.

How can a card reach a method it does not have? That is the third way of saying the idea, and it is the one that makes JavaScript different from Java or C#. **JavaScript does not have real classes. It has objects linked to other objects.**

![](diagram:session-3-4/fig3-prototype-chain)

Every object carries a hidden link to another object called its prototype. When you ask `conan.berserk()`, JavaScript looks on `conan` first. Not there. It follows the hidden link to `Warrior.prototype`. There it is: one hop, done. When you ask `conan.toString()`, the walk is longer: `conan`, no; `Warrior.prototype`, no; `Character.prototype`, no; `Object.prototype`, yes. That is where the "free" methods every object seems to have come from. They are not free, they are at the top of the chain. The chain ends at `null`, and if the walk gets there, you get `undefined`.

When you write `class Warrior extends Character`, you are adding one link to that chain. Inheritance *is* the chain. The `class` keyword, which arrived in 2015, is a cleaner way to write what JavaScript was already doing with constructor functions and `.prototype`. You will see the old spelling in older code; recognise it, and write the new one.

> **Say:** "An object is state plus behaviour. A class is the blueprint, an instance is the thing built from it. Methods live once, on the prototype, and instances reach them through the chain."

One more tool before we build, because you will reach for it in the lab. A **factory function** is a plain function that builds and returns an object. No `class`, no `new`, no `this`. Combined with a closure from Session 3.2, a factory gives you something classes cannot give you as easily: state that is truly private, because it lives in the closure and nothing outside can touch it. The trade is that every object gets its own copy of each method (the card grid again, on purpose this time) and `instanceof` does not work. Use classes when you want many instances or inheritance; use a factory when you want a small object with a secret.

And one tool the last three sessions used without naming it: the **loop**. A loop runs a block more than once, and JavaScript has three you will write constantly. The counting `for` runs a fixed number of times with a counter you control, `for (let i = 0; i < 3; i++)`, which you met in 3.2's closure bug. `for ... of` walks a list and hands you one element per pass with no counter at all, `for (const orc of orcs)`, which is what the `hpReport` demo in 3.1 used. `while` repeats as long as a condition holds and does not know in advance how many times that will be, which makes it the loop for a battle: `while (hero.isAlive && !monster.isDefeated)`. The one rule of `while` is that something inside the body must move the condition toward `false`, or the loop never ends and the tab freezes. The array methods from 3.2, which you finished proving on the spellbook in 3.3, replace most `for ... of` loops over a list; reach for a loop when you need a counter, an early `break`, or a condition that is not about an array.

```js run=loops
'use strict';
// A counting for: the counter is yours. i goes 0, 1, 2.
for (let i = 0; i < 3; i++) console.log('round', i + 1);

// for...of: one element per pass, no counter.
const orcs = ['Grunt', 'Brute', 'Chieftain'];
for (const orc of orcs) console.log(orc, 'charges!');

// while: repeat until the condition fails. The body must move it toward false.
let hp = 100;
let turns = 0;
while (hp > 0) {
  hp -= 35;
  turns++;
}
console.log(`the training dummy fell after ${turns} hits (hp ${hp})`);

// break leaves a loop early; continue skips to the next pass.
for (const orc of orcs) {
  if (orc === 'Brute') continue;
  if (orc === 'Chieftain') break;
  console.log('still fighting', orc);
}
console.log('ok: loops');
```

Three passes, three orcs, three hits, and then a `continue` that skips the Brute and a `break` that stops before the Chieftain. That is the whole vocabulary; the quest's battle is the `while` with the hero and the monster in the condition.

## The demonstration

Four files, in the order you would write them at the desk. Run each one.

### 1. A single hero, as an object literal

An object literal is key-value pairs wrapped in braces. A value can be anything, including a function, and a function that lives on an object is called a method.

```js run=hero
'use strict';
const hero = {
  name: 'Guts',
  role: 'Berserker',
  level: 45,
  hp: 200,
  maxHp: 200,
  attack: 85,
  skills: ['Slash', 'Rage', 'Berserk Mode'],
  isAlive: true,

  // A method: a function stored on the object. `this` is the object before the dot.
  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.isAlive = false;
    return `${this.name} took ${amount} damage! HP: ${this.hp}/${this.maxHp}`;
  },
  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return `${this.name} healed ${amount} HP! HP: ${this.hp}/${this.maxHp}`;
  },
  getStatus() {
    return `${this.name} [${this.role}] Lv.${this.level} - HP: ${this.hp}/${this.maxHp}`;
  },
};

// Dot notation: the everyday way.
console.log(hero.name);
console.log(hero.skills);

// Bracket notation: the only way when the key is in a variable.
const stat = 'attack';
console.log(hero[stat]);

console.log(hero.getStatus());
console.log(hero.takeDamage(50));
console.log(hero.heal(20));

// Objects are open: add a property, add a method, delete a property.
hero.weapon = 'Dragon Slayer';
hero.defend = function () { return `${this.name} raises their shield!`; };
delete hero.isAlive;
console.log(hero.defend(), '| alive flag:', hero.isAlive);
console.log('ok: hero');
```

Two things to say out loud while this runs. First, `hero.takeDamage(50)` never mentions which hero. It does not have to; `this` is the object before the dot. Second, bracket notation is not a style choice. `hero[stat]` works because `stat` is a variable holding the string `'attack'`; `hero.stat` would look for a property literally called `stat` and find nothing.

### 2. An inventory, where the keys are data

The inventory is the moment bracket notation stops being optional. Item names arrive at runtime; you cannot write `items.HealthPotion` for something a player typed.

```js run=inventory
'use strict';
const inventory = {
  items: {},

  add(itemName, quantity = 1) {
    if (this.items[itemName]) this.items[itemName] += quantity;
    else this.items[itemName] = quantity;
    return `Added ${quantity}x ${itemName}. Total: ${this.items[itemName]}`;
  },
  remove(itemName, quantity = 1) {
    if (!this.items[itemName]) return `You don't have any ${itemName}!`;
    this.items[itemName] -= quantity;
    if (this.items[itemName] <= 0) {
      delete this.items[itemName];
      return `${itemName} removed from inventory.`;
    }
    return `Removed ${quantity}x ${itemName}. Remaining: ${this.items[itemName]}`;
  },
  has(itemName) {
    return itemName in this.items;
  },
  list() {
    const entries = Object.entries(this.items);
    if (entries.length === 0) return 'Inventory is empty.';
    return entries.map(([name, qty]) => `${name} x${qty}`).join(', ');
  },
};

console.log(inventory.add('Health Potion', 5));
console.log(inventory.add('Sword'));
console.log(inventory.add('Health Potion', 3));
console.log(inventory.list());
console.log(inventory.remove('Health Potion', 2));
console.log(inventory.has('Sword'), inventory.has('Shield'));
console.log('ok: inventory');
```

`Object.entries` turns the inner object into an array of `[name, qty]` pairs, and from there it is `map` from 3.2 and `join`. That is the pattern you will use for the rest of your life: objects hold the state, arrays carry it through a transformation.

### 3. The blueprint, and three classes built on it

Now the five hundred knights. We write the shape once as a class, then stamp out instances with `new`.

```js run=characters
'use strict';
class Character {
  constructor(name, hp, attack, defense = 0) {
    this.name = name;
    this.hp = hp;
    this.maxHp = hp;
    this.attack = attack;
    this.defense = defense;
    this.isAlive = true;
    this.level = 1;
    this.xp = 0;
  }
  takeDamage(amount) {
    const actual = Math.max(1, amount - this.defense);
    this.hp = Math.max(0, this.hp - actual);
    if (this.hp === 0) this.isAlive = false;
    return `${this.name} took ${actual} damage! HP: ${this.hp}/${this.maxHp}`;
  }
  heal(amount) {
    if (!this.isAlive) return `${this.name} is down and cannot heal!`;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return `${this.name} healed! HP: ${this.hp}/${this.maxHp}`;
  }
  attackTarget(target) {
    return target.takeDamage(this.attack);
  }
  gainXP(amount) {
    this.xp += amount;
    if (this.xp >= this.level * 100) {
      this.level++; this.xp = 0;
      this.maxHp += 10; this.hp = this.maxHp; this.attack += 2;
      return `${this.name} LEVELED UP to ${this.level}!`;
    }
    return `${this.name} gained ${amount} XP. (${this.xp}/${this.level * 100})`;
  }
  getStatus() {
    return `${this.name} [Lv.${this.level}] HP: ${this.hp}/${this.maxHp} ATK: ${this.attack} DEF: ${this.defense}`;
  }
}

// extends = one more link in the chain. super() = run the parent constructor first.
class Warrior extends Character {
  constructor(name) {
    super(name, 150, 20, 25);
    this.rage = 0;
  }
  attackTarget(target) {                     // override: same name, new behaviour
    this.rage = Math.min(100, this.rage + 20);
    return target.takeDamage(this.attack) + ` (Rage: ${this.rage}/100)`;
  }
  berserk(target) {
    if (this.rage < 100) return `${this.name} needs full rage to go berserk!`;
    this.rage = 0;
    return target.takeDamage(this.attack * 3) + ' BERSERK ATTACK!';
  }
}

class Mage extends Character {
  constructor(name) {
    super(name, 80, 35, 5);
    this.mana = 100; this.maxMana = 100;
  }
  castFireball(target) {
    if (this.mana < 30) return `${this.name} is out of mana!`;
    this.mana -= 30;
    return target.takeDamage(this.attack * 2) + ` (Mana: ${this.mana}/${this.maxMana})`;
  }
  meditate() {
    this.mana = Math.min(this.maxMana, this.mana + 40);
    return `${this.name} meditates. Mana: ${this.mana}/${this.maxMana}`;
  }
  getStatus() {
    return super.getStatus() + ` MANA: ${this.mana}/${this.maxMana}`;   // extend, don't replace
  }
}

class Healer extends Character {
  constructor(name) {
    super(name, 90, 15, 10);
    this.mana = 120; this.maxMana = 120;
  }
  healAlly(target) {
    if (this.mana < 25) return `${this.name} is out of mana!`;
    this.mana -= 25;
    return target.heal ? target.heal(40) : `Cannot heal ${target.name}`;
  }
}

const conan = new Warrior('Conan');
const merlin = new Mage('Merlin');
const elara = new Healer('Elara');

console.log(conan.getStatus());
console.log(merlin.getStatus());
console.log(conan.attackTarget(merlin));
console.log(merlin.castFireball(conan));
console.log(elara.healAlly(merlin));
console.log(conan.gainXP(120));

// The chain, made visible. Methods are not on the instance; they are one hop (or more) up.
console.log(Object.hasOwn(conan, 'hp'), Object.hasOwn(conan, 'berserk'));
console.log(Object.getPrototypeOf(conan) === Warrior.prototype);
console.log(Object.getPrototypeOf(Warrior.prototype) === Character.prototype);
console.log(Object.getPrototypeOf(Character.prototype) === Object.prototype);
console.log(Object.getPrototypeOf(Object.prototype));
console.log(conan instanceof Warrior, conan instanceof Character, merlin instanceof Warrior);
console.log('ok: characters');
```

Read the last block of output slowly, because it is fig. 3 printed by the engine itself. `hp` is *own* data on `conan`; `berserk` is not, it is on `Warrior.prototype`. Each `getPrototypeOf` is one hop up the chain, and the final one prints `null`. `instanceof` is just asking "is this prototype anywhere in the chain?"

Three rules of the `class` syntax you will trip on in the lab:

- `super(...)` must run before you touch `this` in a child constructor. The parent builds the object; you decorate it. Reversing the order throws a `ReferenceError`.
- An override is a method with the same name. If you want the parent's behaviour *plus* something, call `super.method()` inside it, the way `Mage.getStatus` does.
- `new` is not optional. `Warrior('Conan')` without it throws, because class constructors refuse to run as plain functions.

While we are on `new`: it does four things, in order, every time. It creates a fresh empty object. It points that object's hidden prototype link at `Warrior.prototype`. It runs the constructor with `this` set to the new object. Then it hands the object back to you. Nothing in that list is magic; it is the same four steps the engine ran before 2015, when the blueprint had to be spelled by hand:

```js
'use strict';
// The old spelling. You will meet it in libraries and in code written before 2015.
function Knight(name, hp) {
  this.name = name;
  this.hp = hp;
}
Knight.prototype.attack = function (target) {
  return `${this.name} swings at ${target.name}`;
};

const lancelot = new Knight('Lancelot', 120);
console.log(lancelot.attack({ name: 'a training dummy' }));
console.log(Object.getPrototypeOf(lancelot) === Knight.prototype);   // true, same chain as a class
```

A constructor function is a plain function that expects `new`, and methods are hung on its `.prototype` property by hand. `class Knight { attack() {} }` produces the exact same object graph with the method already on the prototype and a guard that refuses to run without `new`. Recognise the old spelling when you see it; write the new one.

One design note before the lab, because the lab invites you to overuse the tool you just learned. `extends` is for a true *is-a*: a Warrior is a Character, a Boss is a Monster. When the relationship is *has-a*, compose instead. A character has an inventory, so give it `this.inventory = createInventory()` rather than writing `class Character extends Inventory`. A deep inheritance tree is one of the easiest ways to make a codebase nobody can change; a few small objects that hold other objects is one of the easiest ways to keep it flexible.

### 4. A factory with a secret

Same idea without the ceremony, and with something a class cannot easily offer: a value that nothing outside can read.

```js run=factory
'use strict';
function createHero(name, level) {
  let secretWeakness = 'spiders';          // private: lives in the closure, not on the object
  return {
    name,
    level,
    revealWeakness(password) {
      return password === 'guildmaster' ? secretWeakness : 'Nice try.';
    },
  };
}

const kai = createHero('Kai', 12);
console.log(kai.secretWeakness);          // undefined — it was never a property
console.log(kai.revealWeakness('wrong')); // "Nice try."
console.log(kai.revealWeakness('guildmaster'));
console.log('ok: factory');
```

And, for the record, the same `Player` written twice, once with state and once as a pure function, so you can see that neither is "the right way":

```js
class Player {
  constructor(name) { this.name = name; this.score = 0; }
  addPoints(n) { this.score += n; }
}

function addPoints(player, n) {
  return { ...player, score: player.score + n };
}
let player = { name: 'Mario', score: 0 };
player = addPoints(player, 10);
```

Objects with state and behaviour (characters, users, UI widgets) want classes. Pipelines that turn data into other data want plain functions. Most real codebases use both, in the same file, without apology.

## Where it breaks

**The word that keeps losing its character.**

Everything above leaned on one little word: `this`. It is the most misunderstood word in JavaScript, and the reason is simple once you hear it: **`this` is decided by how a function is called, not by where it is written.** Four rules cover almost every case, and rule two is the bug you will hit this week.

![](diagram:session-3-4/fig4-this-loses-character)

```js run=this-rules
'use strict';
const hero = {
  name: 'Aria',
  introduce() { return `I am ${this.name}`; },
};

// Rule 1 — method call. `this` is the object before the dot.
console.log(hero.introduce());

// Rule 2 — plain call. The method was pulled off its object; `this` is undefined in strict mode.
const loose = hero.introduce;
try {
  console.log(loose());
} catch (e) {
  console.log('Rule 2 broke:', e.constructor.name, '-', e.message);
}

// Rule 3 — explicit binding. bind / call / apply set `this` by hand.
const bound = hero.introduce.bind(hero);
console.log(bound());
console.log(hero.introduce.call({ name: 'an impostor' }));

// Rule 4 — `new`. `this` is the freshly created object.
class Knight {
  constructor(name) { this.name = name; }
}
console.log(new Knight('Brienne').name);

// Where it bites in real code: a method handed to a callback.
class Party {
  constructor() { this.members = ['Conan', 'Merlin']; this.shout = 'For the realm!'; }
  rallyBroken() {
    return this.members.map(function (m) { return `${m}: ${this && this.shout}`; });
  }
  rallyFixed() {
    return this.members.map((m) => `${m}: ${this.shout}`);   // arrow: no `this` of its own, borrows Party's
  }
}
const party = new Party();
console.log(party.rallyBroken());
console.log(party.rallyFixed());
console.log('ok: this-rules');
```

Watch the output. Rule 1 works. Rule 2 throws, because `loose` is the same function but nothing is standing before the dot, so `this` is `undefined` and `undefined.name` is a `TypeError`. The method lost its character. Rule 3 ties it back on with `bind`. Rule 4 is what `new` has been doing for you all session.

Then the real-world version. `rallyBroken` passes a plain `function` to `map`. `map` calls it the plain way, rule two, and `this` inside is `undefined`, so every member shouts `undefined`. `rallyFixed` uses an arrow function, and arrow functions are the exception to all four rules: **they have no `this` of their own and borrow the one from the surrounding scope.** Inside a method, that scope is the method, and the method's `this` is the party.

That gives you the two-line rule for the week:

- Object and class **methods**: write them as normal methods (`introduce() {}`), never as arrows, because an arrow would borrow `this` from outside the object and that is almost never what you meant.
- **Callbacks inside methods** (`map`, `forEach`, `setTimeout`, event handlers): write them as arrows, so they keep the method's `this`.

> **Note:** Founder-brain shortcut: `this` is the word "here". Its meaning depends entirely on where you are standing when you say it, and a function that has been picked up and carried somewhere else is standing somewhere else.

## Your turn

Two short builds before the quest. Keep the Run output from the demos open beside you.

**1. The pet (15 minutes).** In `pet.js`, write a `pet` object literal with `name`, `species`, `hunger`, `happiness` and `energy`, each stat between 0 and 100. Give it four methods. `feed()` lowers hunger and raises energy. `play()` raises happiness, raises hunger, lowers energy. `sleep()` raises energy and lowers happiness a little. `getStatus()` returns one readable line. Clamp every stat with `Math.max` / `Math.min` so nothing goes below 0 or above 100. Call each method a few times and watch the numbers move. If a method ever prints `NaN`, you reached for a property that is not there; check your spelling against the literal.

**2. The RPG class system (35 minutes).** In `rpg-classes.js`, write a base `Character` with `name`, `hp`, `maxHp`, `attack`, `defense`, `level`, `isAlive` and the three methods `takeDamage`, `heal`, `getStatus`. Then at least three subclasses from this list: Warrior, Mage, Archer, Healer, Assassin, Paladin, Necromancer. Every subclass must call `super()` with stats that fit the role, add at least one unique property (rage, mana, arrows, stealth), add at least one unique method (berserk, fireball, snipe, backstab), and override at least one parent method. Build one of each and run a three-round battle (a counting `for` over the rounds), printing every character's status after each round.

Success looks like: the battle runs with no errors, the three classes behave visibly differently, and you can point at one line and say "that is the override."

> **Tip:** Print `Object.getPrototypeOf(yourInstance) === YourClass.prototype` once. Seeing `true` with your own class names in it makes fig. 3 permanent.

## The quest

> *Deep in the Forbidden Archives you find an ancient bestiary, its pages blank. "The monsters have escaped," the Archivist says. "Catalogue them. All of them. And be warned: the Boss on the final page has three phases, each more dangerous than the last."*

**The Monster Manual.** Create `monster-manual.js` and build the bestiary.

1. A base `Monster` class with `name`, `type`, `hp`, `attack`, `defense`, `speed`, `loot` (an array of strings) and `isDefeated`.
2. Methods: `takeDamage(amount)`, `attackTarget(target)`, `dropLoot()` (returns one random item from `loot` once the monster is defeated) and `getStatus()`.
3. At least five subclasses, for example Slime, Wolf, Skeleton, Dragon, DarkKnight. Each one gets a special attack with its own damage formula.
4. A `Boss` subclass with a `phase` property. Below 50% HP it enters phase 2; below 25% it enters phase 3; later phases hit harder. Check the threshold inside `takeDamage`, right after the HP changes, because that is the one place every hit passes through.
5. Simulate a battle: one hero against three monsters, then the boss. Print the whole play-by-play.

Hints that save an hour: `Math.floor(Math.random() * this.loot.length)` picks the loot index; a `while (hero.isAlive && !monster.isDefeated)` loop runs the fight; and if the boss never changes phase, you probably wrote the check *before* subtracting HP.

Stretch goals, in order of difficulty: an `Encounter` class that owns the loop and orders turns by `speed`; XP and level-ups for the hero; elemental weaknesses (fire takes double from ice). Push to your `js-fundamentals` repo when it runs clean.

## Side quests

Five pages in the library go deeper than one session can. Read them in this order; each one is a short reference sheet with code that runs in the page.

## Before next session

Three things, in this order, and the last one is the fun one.

First, finish the Monster Manual if it did not get done in the session. It is the artifact for this session, and Session 3.5 assumes you can write a class with an override without looking it up.

Second, read the MDN page on [Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes). Focus on `constructor`, `extends` and `super`, and skim the rest; you now know enough to recognise what you are skimming.

Third, start thinking about your browser game. Session 3.6 is build day, and Session 3.5 ("Casting on the World") is where your classes meet the page: the DOM is an object, every element is an object, and every click calls a method on one. The characters you built today are the ones that will be moving on screen. Give them names you will be happy to see in a URL.

> **Say:** "An object is state plus behaviour. A class is a blueprint; `new` stamps out an instance. Methods live once on the prototype and instances reach them through the chain. `extends` adds a link. And `this` is decided by how the function is called: method, plain, bound, or `new`, with arrows borrowing from outside."

Say it once more without reading it. If it comes out in your own words, you are ready for the orcs.
