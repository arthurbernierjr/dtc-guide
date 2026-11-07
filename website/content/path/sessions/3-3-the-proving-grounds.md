---
editorial: true
title: The Proving Grounds
subtitle: Destructuring, copying, counting, and three problems without a net
hook: "You can follow an example. Today you find out whether you can work without one: three dots, honest copies, the counting reduce, and three small problems on your own spellbook with no scaffolding and a worked answer only after you have tried."
read: 45
artifact: "spellbook.js finished with all six queries and pushed to js-fundamentals, plus PROVING.md with your three worked answers"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
say:
  - "Braces on the left unpack; three dots on the right spread; three dots in a parameter list gather."
  - "A copy made with spread or slice is one level deep. Share a nested object and you share its changes."
  - "The counter is reduce with an empty object and one line: counts[key] = (counts[key] || 0) + 1."
---

## The hook

Last session you wrote `spellbook.js`: ten spells, a mana pool that refuses to be overdrawn, and two `filter` queries. Every one of those was written with an example open beside you. That is how a skill starts. It is not how you find out whether the skill is yours. The difference between following a Run block and writing a query from a one-sentence description is the gap most people fall into between Unit 3 and everything after it, and today's session exists to close it on purpose, before the Monster Manual asks you to build a class with nothing to copy.

Today has two halves. The first half adds three small tools with a prediction in front of every Run: destructuring, which pulls values out of an object by name; spread and rest, which copy and gather with the same three dots; and the frequency counter, the `reduce` that counts how many of each kind there are. The second half is the proving grounds: three tiny problems on your own spellbook, set with no scaffolding, with a clear line that says stop and try, and the worked answers only after that line. If they go well, you finish the book's four remaining queries and push it. If they do not, there is a slower route, named in full, that takes you back to the exact section of 3.2 to reread and the exact miniature to redo, and then back here.

> *Every guild has a yard behind the hall where the new recruit swings alone. Nobody corrects the first ten swings. They watch the eleventh.*

## The idea

Three ideas, and each one is smaller than anything in 3.2. That is deliberate. The load today is not in the ideas. It is in the fact that you will write a prediction before every Run and check it after, and then write three answers with no example in sight.

### Unpack: destructuring pulls values out by name

An object is a bag of named values. Reading them one at a time, `hero.name`, `hero.level`, works and is tedious, and when a function needs four properties from one object the first four lines of the function are all the same shape. **Destructuring** does the reading in one line. `const { name, level } = hero` creates two constants, `name` and `level`, and fills each one from the property with the same name. The braces on the left of `=` are not an object literal. They are a pattern that says which names to pull out.

The pattern has three extras you will meet in real code. A rename, `{ class: heroClass }`, pulls the `class` property into a variable called `heroClass`, which you need because `class` is a reserved word and cannot be a variable name. A default, `{ guild = 'Unaffiliated' }`, fills in a value when the property is missing. And the pattern can sit directly in a parameter list, `({ name, level }) => ...`, so the function names what it needs on its first line and never mentions the whole object.

Arrays destructure by position instead of by name: `const [first, second] = loot`. An empty slot skips a position, `[, , third]`. The rule to keep is simple. Braces match an object by name. Square brackets match an array by position. Either pattern can be nested, but today you do not need that.

### Pack and unpack: spread and rest are the same dots

**Spread** is three dots in front of an array or an object inside a literal: `[...oldParty, 'Cass']` or `{ ...baseStats, mp: 80 }`. It unpacks every element or property into the new literal, so the result is a new array or a new object that starts as a copy and can then be extended. Properties written after the spread win, which is how `{ ...baseStats, mp: 80 }` keeps `hp` and replaces `mp`. The original is never touched. That is the whole reason spread is the standard way to copy in modern files: it reads as "a new thing, like that one, plus these changes."

**Rest** is the same three dots in the other position: on the left of `=` in a destructuring pattern, or as the last name in a parameter list. There it gathers. `function partyUp(leader, ...members)` takes the first argument as `leader` and packs every remaining argument into an array called `members`. `const [mvp, ...bench] = party` takes the first element and packs the rest. Position decides which job the dots do. In a literal they spread. In a pattern or a parameter list they gather.

Here is the first miniature. It is the block you may have seen at the end of 3.2's demonstration, now in the place where it belongs. Before you press Run, write down three predictions on paper: what the first `console.log` prints, what `benchwarmers` holds, and whether `oldParty` has two or three elements after `newParty` is built. Then run it and check each one.

```js run=unpack
'use strict';
// Destructuring: pull values out into named variables, in one line.
const hero = { name: 'Aria', level: 12, class: 'Mage' };
const { name, level } = hero;
const { class: heroClass } = hero;          // rename: class is a reserved word
const { guild = 'Unaffiliated' } = hero;    // default when the property is missing
console.log(name, level, heroClass, guild);

const loot = ['sword', 'shield', 'potion'];
const [firstItem, secondItem] = loot;
const [, , thirdItem] = loot;               // skip with empty slots
console.log(firstItem, secondItem, thirdItem);

// Destructuring in a parameter list: the function names what it needs.
const describe = ({ name, level }) => `${name} (Lv.${level})`;
console.log(describe(hero));

// Spread unpacks: copy and combine without touching the original.
const baseStats = { hp: 100, mp: 50 };
const buffedStats = { ...baseStats, mp: 80 };
const oldParty = ['Aria', 'Bron'];
const newParty = [...oldParty, 'Cass'];
console.log(baseStats, buffedStats);
console.log(oldParty, newParty);

// Rest packs: same three dots, opposite direction. Position decides.
function partyUp(leader, ...members) {
  return `${leader} leads a party of ${members.length}`;
}
console.log(partyUp('Aria', 'Bron', 'Cass', 'Dev'));
const [mvp, ...benchwarmers] = ['Aria', 'Bron', 'Cass'];
console.log(mvp, benchwarmers);
console.log('ok: unpack');
```

Check your three predictions. The first line is `Aria 12 Mage Unaffiliated`, and the last word is the default stepping in because `hero` has no `guild`. `benchwarmers` is `[ 'Bron', 'Cass' ]`, an array, even though you wrote it as a bare name with dots in front. And `oldParty` still has two elements, because spread read from it and wrote into a new literal. If any of the three surprised you, change one value in the block, predict again, and run again. The prediction is the exercise. The output is only the answer key.

### Copy: one level deep, and the alias that is not a copy

This is the idea that costs people the most time this week, and it is small enough to fit on a card. `const squad = party` does not copy anything. Both names now point at the same array. Push through `squad` and `party` grows, because there is only one array and two names for it. That second name is an **alias**. Every method that mutates, `push`, `pop`, `splice`, `sort`, changes the one array that both names share.

A real copy is made with `slice()`, with `[...party]`, or with `Array.from(party)`. Each of those builds a new array and fills it with the same elements. Push into the copy and the original is unchanged. Sort the copy and the original keeps its order. That is what 3.2's last Run block meant by "copy first, then sort the copy."

The copy is one level deep. If the elements are objects, the new array holds the same objects, not copies of them. `const copy = { ...original }` has the same limit for objects: the top-level properties are copied, and a nested object such as `original.gear` is shared between the two. Change `copy.gear.weapon` and `original.gear.weapon` changes too. That is what **shallow** means. When you need every level copied, `structuredClone(original)` walks the whole structure and builds a fresh one. You will not need it often. You need to know it exists so that the day a nested object changes behind your back, you reach for it instead of staring at the screen.

Second miniature. Before you run it, write down two predictions: the length of `party` after the `push` through `squad`, and what `original.gear.weapon` is on the output line that starts with `Aria |`.

```js run=copy
'use strict';
const party = ['Aria', 'Bron', 'Cass'];

// An alias is a second name for the same array. Not a copy.
const squad = party;
squad.push('Dev');
console.log('party after push through squad:', party.length, squad === party);

// Three real copies. Each one is a new array with the same elements.
const bySlice = party.slice();
const bySpread = [...party];
const byFrom = Array.from(party);
bySlice.push('Eve');
bySpread.pop();
byFrom.sort();
console.log('party still:', party);
console.log(bySlice.length, bySpread.length, byFrom);

// One level deep: the elements themselves are shared.
const spells = [{ name: 'Ember', manaCost: 10 }];
const spellsCopy = [...spells];
spellsCopy[0].manaCost = 99;
console.log('the spell inside the original now costs', spells[0].manaCost);

// The same limit with objects, and the tool that goes all the way down.
const original = { name: 'Aria', gear: { weapon: 'staff' } };
const copy = { ...original };
copy.name = 'Bron';
copy.gear.weapon = 'axe';
console.log(original.name, '| but original.gear.weapon is now', original.gear.weapon);
const deep = structuredClone(original);
deep.gear.weapon = 'bow';
console.log('after structuredClone, original keeps', original.gear.weapon);
console.log('ok: copy');
```

`party` has four elements after the push, because `squad` was never a second array. `original.gear.weapon` is `axe`, because spread copied the top level and `gear` was shared. The `structuredClone` line is the fix for that case and only that case. A spell array where every query uses `filter`, `map` and `reduce` never needs it, because those three never mutate anything. The trouble starts when a method that mutates meets a name that was an alias all along, and that is the first diagnosis below.

### Count: the frequency counter

The third `reduce` shape, after the running total and the best-so-far comparison from 3.2, is the one you will write most for the rest of your life. It answers the question "how many of each?" The accumulator is an object that starts empty. Each pass reads one key from the element, looks up the current count for that key, adds one, and stores it back. The lookup is the only line with any subtlety: the first time a key appears, `counts[key]` is `undefined`, which is falsy, so `|| 0` from 3.1 steps in and the count starts at zero before the one is added.

Build it by hand first. Third miniature, and the prediction this time is the value of `counts` after the three manual lines, written as an object literal on paper.

```js run=frequency
'use strict';
// By hand: three elements counted one line at a time.
const counts = {};
counts['fire'] = (counts['fire'] || 0) + 1;
counts['ice'] = (counts['ice'] || 0) + 1;
counts['fire'] = (counts['fire'] || 0) + 1;
console.log('by hand:', counts);

// The same thing as a reduce. The empty object is the starting value.
const elements = ['fire', 'ice', 'fire', 'earth', 'fire'];
const tally = elements.reduce((acc, element) => {
  acc[element] = (acc[element] || 0) + 1;
  return acc;
}, {});
console.log('reduce:', tally);

// Counting a property of objects: the key comes from the element.
const roster = [
  { name: 'Aria', role: 'Mage' },
  { name: 'Bron', role: 'Warrior' },
  { name: 'Cass', role: 'Mage' },
];
const byRole = roster.reduce((acc, hero) => {
  acc[hero.role] = (acc[hero.role] || 0) + 1;
  return acc;
}, {});
console.log('by role:', byRole);

// The same counter counts letters, because a string splits into an array.
const letters = 'mississippi'.split('').reduce((acc, ch) => {
  acc[ch] = (acc[ch] || 0) + 1;
  return acc;
}, {});
console.log('letters:', letters);
console.log('ok: frequency');
```

The by-hand object is `{ fire: 2, ice: 1 }`, and the `reduce` version is the same three lines wrapped in a callback and run once per element. The `return acc` at the end of the callback is not optional. Without it the callback hands back `undefined`, the next pass receives `undefined` as `acc`, and `acc[element]` throws. That is 3.2's costume three wearing a different hat. The letters example is there to show that the counter does not care what it counts. Anything you can turn into an array with a key per element, this one shape counts.

What you should be able to draw on a napkin: braces on the left unpack by name, brackets by position. Three dots in a literal spread a copy; three dots in a pattern gather the rest. A copy is one level deep, an alias is no copy at all, and `structuredClone` goes all the way down. A counter is `reduce` with `{}` as the start and one line per pass.

![](diagram:session-3-3/fig1-model)

## The demonstration

One file, `spellbook.js` in `~/projects/js-fundamentals`, continuing exactly where Session 3.2 left it. Open it in VS Code with `code ~/projects/js-fundamentals` and run it once with `node spellbook.js` to see that the pool and the two `filter` queries still print what they printed when you committed them. Nothing is running between sessions, so nothing needs stopping. This section finishes the four remaining queries with a worked example, then sets the three proving problems.

The page cannot read your file, so every Run block below works on a proving set of six spells with the same five properties as yours. The numbers are chosen so that every answer can be checked by hand on paper. When you move a function into your own file, your output will differ, because your ten spells differ. The shape of each function does not.

### The four remaining queries, worked

Your book already has `getSpellsByElement` and `getAffordableSpells`. The next four are `getSpellNames` with `map`, `getTotalManaCost` with `reduce` and a running total, `getMostExpensiveSpell` with `reduce` and a comparison, and `getElementBreakdown` with the counter you just built. Before you press Run, predict the total mana cost of the proving set by adding the six costs on paper, and predict which spell is the most expensive.

```js run=queries
'use strict';
const spells = [
  { name: 'Ember', element: 'fire', manaCost: 10, damage: 25, level: 1 },
  { name: 'Frost Bite', element: 'ice', manaCost: 15, damage: 30, level: 2 },
  { name: 'Spark', element: 'lightning', manaCost: 8, damage: 18, level: 1 },
  { name: 'Inferno', element: 'fire', manaCost: 40, damage: 80, level: 6 },
  { name: 'Stone Skin', element: 'earth', manaCost: 20, damage: 0, level: 3 },
  { name: 'Flame Wall', element: 'fire', manaCost: 25, damage: 45, level: 4 },
];

// From 3.2: the two filter queries.
const getSpellsByElement = (list, element) => list.filter((s) => s.element === element);
const getAffordableSpells = (list, currentMana) => list.filter((s) => s.manaCost <= currentMana);

// map: same length, new shape. Six spells in, six strings out.
const getSpellNames = (list) => list.map((s) => s.name);
console.log('names:', getSpellNames(spells));

// reduce, running total. The 0 is the starting value and it is not optional.
const getTotalManaCost = (list) => list.reduce((sum, s) => sum + s.manaCost, 0);
console.log('total mana:', getTotalManaCost(spells));

// reduce, best so far. Guard the empty case before reduce sees it.
const getMostExpensiveSpell = (list) => {
  if (list.length === 0) return null;
  return list.reduce((best, s) => (s.manaCost > best.manaCost ? s : best));
};
console.log('most expensive:', getMostExpensiveSpell(spells).name);
console.log('most expensive of none:', getMostExpensiveSpell([]));

// reduce, the counter. The key is the element of each spell.
const getElementBreakdown = (list) => list.reduce((acc, s) => {
  acc[s.element] = (acc[s.element] || 0) + 1;
  return acc;
}, {});
console.log('breakdown:', getElementBreakdown(spells));

// The queries compose, because each one returns a new value and touches nothing.
console.log('fire names:', getSpellNames(getSpellsByElement(spells, 'fire')));
console.log('affordable at 25:', getSpellNames(getAffordableSpells(spells, 25)));
console.log('spells still has', spells.length, 'entries');
console.log('ok: queries');
```

The total is `118`, and if your paper says something else, add again; the arithmetic is the trace. The most expensive spell is Inferno at 40. The breakdown is `{ fire: 3, ice: 1, lightning: 1, earth: 1 }`, and the keys appear in the order the elements were first seen, which is why `fire` is first. The last three lines are the point of the whole unit: every query hands back a new value, so queries can be handed to each other, and the original array still has six entries at the end.

Notice the one guard. `getMostExpensiveSpell` checks for an empty list before calling `reduce`, because a `reduce` with no starting value has nothing to start from on an empty array and throws. `getTotalManaCost` does not need the guard, because it has a starting value, `0`, and `0` is the right answer for the cost of no spells. Each of the four queries is one of the shapes from 3.2 and from the idea section above. Put all four into your `spellbook.js` now, under the two you already have, and call each one on your own spells with a label. Then come back for the proving grounds.

### The proving grounds

Three problems. They are set on the proving set of six spells above, so that the answers can be checked exactly, and then you repeat each one on your own ten spells. Do them in order, on paper for the first and in your file for the other two, with the Run blocks above scrolled out of view. Write your answers before you read past the line that says stop.

**Problem one, a trace.** On paper, trace `getElementBreakdown(getAffordableSpells(spells, 25))` on the proving set. Write one row per pass of the inner `filter`, saying which spells survive. Then one row per pass of the `reduce`, showing the accumulator after each spell. Finish by writing the exact object the call returns.

**Problem two, a new query from one sentence.** Write `getAverageDamage(spells, element)`: it returns the average `damage` of the spells of that element, and `0` when there are none. Write down what it returns for `'fire'` and for `'dark'` on the proving set before you run it.

**Problem three, a changed rule.** A spell is castable only when the caster can afford it and is at least the spell's `level`. Change `getAffordableSpells` so that it takes a third argument, `casterLevel`, and keeps only the spells that pass both tests. A call with two arguments must still work exactly as before. Write down the names it returns for mana `25` and caster level `2`.

**Stop here and try. Do not read on until your three answers are written down.**

Here are the worked answers, after the line, in the same order.

Problem one. `getAffordableSpells(spells, 25)` keeps a spell when `manaCost <= 25`. Ember 10, yes. Frost Bite 15, yes. Spark 8, yes. Inferno 40, no. Stone Skin 20, yes. Flame Wall 25, yes, because the test is at-or-below. Five spells survive, in their original order. Then the counter: start with `{}`. After Ember, `{ fire: 1 }`. After Frost Bite, `{ fire: 1, ice: 1 }`. After Spark, `{ fire: 1, ice: 1, lightning: 1 }`. After Stone Skin, `{ fire: 1, ice: 1, lightning: 1, earth: 1 }`. After Flame Wall, `{ fire: 2, ice: 1, lightning: 1, earth: 1 }`. That last object is the answer. If your paper has `fire: 3`, you let Inferno through; check the comparison. If your keys are in a different order, that is fine on paper and wrong on the screen, because objects keep the order keys were first added.

Problem two. Filter to the element, map to the damage, reduce to a sum, divide by the count, and guard the empty case before the division, because `0 / 0` is `NaN`, not `0`.

```js
const getAverageDamage = (list, element) => {
  const chosen = list.filter((s) => s.element === element);
  if (chosen.length === 0) return 0;
  const total = chosen.map((s) => s.damage).reduce((sum, d) => sum + d, 0);
  return total / chosen.length;
};
```

For `'fire'` the chosen spells are Ember 25, Inferno 80 and Flame Wall 45, the total is 150, and the average is `50`. For `'dark'` nothing is chosen and the guard returns `0`. A version without the guard returns `NaN` for `'dark'`, and `NaN` is the third diagnosis below arriving early.

Problem three. The changed rule is one more condition in the same callback, and the default parameter from 3.2 is what keeps the two-argument call working: `Infinity` is higher than every level, so with no third argument the level test always passes.

```js
const getAffordableSpells = (list, currentMana, casterLevel = Infinity) =>
  list.filter((s) => s.manaCost <= currentMana && s.level <= casterLevel);
```

For mana 25 and level 2: Ember 10 and level 1, yes. Frost Bite 15 and level 2, yes. Spark 8 and level 1, yes. Inferno fails on mana. Stone Skin 20 but level 3, no. Flame Wall 25 but level 4, no. The answer is `[ 'Ember', 'Frost Bite', 'Spark' ]`, three names where problem one had five. The two that dropped out are the ones the level rule caught.

Here are all three answers together as a block you can run. It is a small model, not a proof: it checks the three functions against the proving set in the page's worker. It cannot see your file. The lines it prints are what `node spellbook.js` should print for the same six spells, and your own ten spells are the real test.

```js run=proving
'use strict';
function check(condition, message) {
  if (!condition) throw new Error('FAIL: ' + message);
  console.log('PASS:', message);
}

const spells = [
  { name: 'Ember', element: 'fire', manaCost: 10, damage: 25, level: 1 },
  { name: 'Frost Bite', element: 'ice', manaCost: 15, damage: 30, level: 2 },
  { name: 'Spark', element: 'lightning', manaCost: 8, damage: 18, level: 1 },
  { name: 'Inferno', element: 'fire', manaCost: 40, damage: 80, level: 6 },
  { name: 'Stone Skin', element: 'earth', manaCost: 20, damage: 0, level: 3 },
  { name: 'Flame Wall', element: 'fire', manaCost: 25, damage: 45, level: 4 },
];

const getSpellNames = (list) => list.map((s) => s.name);
const getAffordableSpells = (list, currentMana, casterLevel = Infinity) =>
  list.filter((s) => s.manaCost <= currentMana && s.level <= casterLevel);
const getElementBreakdown = (list) => list.reduce((acc, s) => {
  acc[s.element] = (acc[s.element] || 0) + 1;
  return acc;
}, {});
const getAverageDamage = (list, element) => {
  const chosen = list.filter((s) => s.element === element);
  if (chosen.length === 0) return 0;
  const total = chosen.map((s) => s.damage).reduce((sum, d) => sum + d, 0);
  return total / chosen.length;
};

// Problem one: the trace.
const traced = getElementBreakdown(getAffordableSpells(spells, 25));
console.log('problem one:', traced);
check(JSON.stringify(traced) === '{"fire":2,"ice":1,"lightning":1,"earth":1}', 'the trace ends at fire 2, ice 1, lightning 1, earth 1');

// Problem two: the new query.
console.log('problem two:', getAverageDamage(spells, 'fire'), getAverageDamage(spells, 'dark'));
check(getAverageDamage(spells, 'fire') === 50, 'fire averages 50');
check(getAverageDamage(spells, 'dark') === 0, 'an element with no spells averages 0, not NaN');

// Problem three: the changed rule, and the old call still works.
const castable = getSpellNames(getAffordableSpells(spells, 25, 2));
console.log('problem three:', castable);
check(castable.join(',') === 'Ember,Frost Bite,Spark', 'mana 25 and level 2 keeps three spells');
check(getAffordableSpells(spells, 25).length === 5, 'the two-argument call still keeps five');
check(spells.length === 6, 'no query touched the original');
console.log('ok: proving');
```

### The slower route

If one of the three did not come out, that is information, not a verdict. Here is the route, and it is short. For problem one, reread the "Array methods are combo attacks" paragraph in [Session 3.2](/path/3-2-spell-crafting/) and run its `arrays` block again with your finger on the `filter` line, then redo the `frequency` miniature above and write the by-hand object on paper before you press Run. For problem two, reread the paragraph under 3.2's `arrays` block about the chain, the one that reads "five objects in, three after filter", then write the chain for average damage one method per line with a `console.log` after each line so you can see the shape change. For problem three, reread "One spell, three spellings" in 3.2, especially the default-parameter sentence, and run its `three-ways` block once more; then redo the `unpack` miniature here, because a default in a pattern and a default in a parameter list are the same idea.

Then come back and do the three problems again, on your own ten spells this time, with the answers above scrolled out of view. The second attempt is the one that counts. Only when the three come out on your own spells should you move on to Your turn. The Monster Manual in [Session 3.4](/path/3-4-objects-and-orcs/) assumes these three moves, and it is kinder to spend twenty minutes here than two hours there.

## Where it breaks

![](diagram:session-3-3/fig2-diagnosis)

Three failures, each one real, each one quiet. None of them throws on the line that caused it. Run them together, then read the three diagnoses.

```js run=breaks
'use strict';
// 1. Mutating a shared array through an alias.
const spells = [
  { name: 'Inferno', manaCost: 40 },
  { name: 'Ember', manaCost: 10 },
  { name: 'Spark', manaCost: 8 },
];
const cheapestFirst = spells;                       // meant to be a copy
cheapestFirst.sort((a, b) => a.manaCost - b.manaCost);
console.log('spells[0] is now', spells[0].name, '| same array:', cheapestFirst === spells);
const fixedOrder = [...spells].sort((a, b) => b.manaCost - a.manaCost);
console.log('copy sorted the other way:', fixedOrder[0].name, '| original still starts with', spells[0].name);

// 2. Destructuring a missing key gives undefined, and undefined does arithmetic badly.
const spell = { name: 'Ember', manaCost: 10 };
const { mana } = spell;                             // the key is manaCost, not mana
console.log('mana is', mana, '| 100 - mana is', 100 - mana);
const { manaCost = 0 } = spell;
console.log('manaCost is', manaCost, '| 100 - manaCost is', 100 - manaCost);
const { cooldown = 0 } = spell;                     // a default covers a key that may be absent
console.log('cooldown defaults to', cooldown);

// 3. reduce without a starting value on an empty array throws.
try {
  [].reduce((best, s) => (s.manaCost > best.manaCost ? s : best));
} catch (e) {
  console.log('reduce on [] with no start:', e.constructor.name);
}
console.log('with a start, the empty sum is', [].reduce((sum, s) => sum + s.manaCost, 0));
const safest = (list) => (list.length === 0 ? null : list.reduce((best, s) => (s.manaCost > best.manaCost ? s : best)));
console.log('guarded best of none:', safest([]));
console.log('ok: breaks');
```

### Mutating a shared array through an alias

The symptom is an array that changes when you did not touch it. You sorted `cheapestFirst` and `spells` came out sorted too, or you pushed into a party list inside a function and the caller's list grew. The cause is that `const cheapestFirst = spells` made a second name, not a second array, and `sort` mutates the one array both names share. `const` did not protect it. `const` stops the name from being reassigned. It says nothing about the contents.

The fix is to copy before you mutate: `[...spells].sort(...)`, or `spells.slice().sort(...)`. Then the sort lands on the copy and the original keeps its order. If the elements are objects and you change a property on one of them, the copy does not help, because both arrays hold the same objects. Then you either build a new object with spread, `{ ...s, manaCost: 5 }`, inside a `map`, or you reach for `structuredClone` when the nesting is deep. The habit that catches this early is the one 3.2 gave you: after every array method, log the original once.

### Destructuring a missing key as undefined

The symptom is `NaN` three lines after a destructuring, or `undefined` printed where a name or a number should be, with no error anywhere. The cause is that a pattern asking for a property the object does not have does not throw. It assigns `undefined`. `const { mana } = spell` is legal when the property is called `manaCost`, and `mana` is simply `undefined`. Then `100 - mana` is `NaN`, and `NaN` goes on being `NaN` through every calculation after it, so the number you finally see is three steps away from the typo.

The fix is to read the object's real keys. `console.log(Object.keys(spell))` prints them, and `Object.keys` is a method you will use again in 3.4. Match the name in the pattern to the name in the object exactly, including case. When a property is genuinely optional, give the pattern a default, `{ cooldown = 0 }`, so the absence becomes a value you chose instead of `undefined`. A default is for a key that may be missing on purpose. It is not a way to paper over a typo, because then `manaCost` would be silently `0` for every spell and the total would be wrong without ever looking wrong.

### reduce without an initial value on an empty array

The symptom is `TypeError: Reduce of empty array with no initial value`, usually from a query that worked fine all session and then met a list that happened to be empty: the affordable spells when the pool is drained, the spells of an element you do not have. The cause is that `reduce` with one argument uses the first element as the starting accumulator, and an empty array has no first element to use. You met this as costume five in 3.2. Here it is in the wild, inside a function that worked on every test you tried.

There are two fixes and they are for two different shapes. For a running total, pass the starting value: `reduce((sum, s) => sum + s.manaCost, 0)` returns `0` on an empty list, which is the honest cost of no spells. For a best-so-far comparison, there is no sensible starting value, because the best of nothing is not a spell, so guard before the call: `if (list.length === 0) return null`. Decide what the empty answer is, write it down in the function, and test the function on `[]` once before you call it done. Every query in your book should survive an empty array without throwing.

## Your turn

Finish the book. Every step runs from inside `~/projects/js-fundamentals`, and the file is the `spellbook.js` you committed in 3.2.

1. Open the folder and prove the starting state: `code ~/projects/js-fundamentals`, then `node spellbook.js`. The last line is `undefined`, from the `pool.currentMana` check at the end of part one. If the file is not there, go back to 3.2's quest and build part one first; this session adds to it and does not replace it.
2. Add `getSpellNames` under the two `filter` queries and log it: `console.log('names:', getSpellNames(spells))`. Run `node spellbook.js` and read a line that starts with `names: [` and lists your ten names in the order you wrote them.
3. Add `getTotalManaCost` with `0` as the starting value and log it. Before you run, add your ten costs on paper. The line `total mana: ` followed by your number should match the paper. If it does not, one spell has a `manaCost` spelled differently or stored as a string.
4. Add `getMostExpensiveSpell` with the empty guard, and log both `getMostExpensiveSpell(spells).name` and `getMostExpensiveSpell([])`. The second prints `null`, not an error.
5. Add `getElementBreakdown` and log it. The line shows one key per element you used, and the counts add up to ten. If a count is missing, one spell's `element` is spelled differently from the others.
6. Add `getAverageDamage` and the three-argument `getAffordableSpells` from the proving grounds, and log each one on your own spells, including a call for an element you did not use. The average for that element is `0`, not `NaN`.
7. Log `spells.length` as the last line before the pool tests. It is `10`, or however many spells you wrote, because no query mutated the array.
8. Commit and push: `git add spellbook.js`, `git commit -m "spellbook: all six queries, average damage, castable rule"`, `git push`. The last line of the push ends with `main -> main`.

If `node` prints a `SyntaxError` after one of the additions, the line number points at the function you just added, and the usual cause is an arrow with braces and no `return`, which is 3.2's costume two.

## The quest

![](diagram:session-3-3/fig3-evidence)

**PROVING.md.** Write it in `~/projects/js-fundamentals` beside `spellbook.js`, and keep it to one page. It holds the three proving answers, done on your own ten spells, in your own words.

- Problem one: the trace. Which spells survived the `filter` at mana 25 on your book, one per line, then the accumulator after each pass of the counter, then the final object. Paste the line `node` printed for the same call under your trace and say in one sentence whether they match.
- Problem two: the new query. Paste your `getAverageDamage`, the value it returns for your most common element, and the value for an element you did not use. Say in one sentence why the guard comes before the division.
- Problem three: the changed rule. Paste the three-argument `getAffordableSpells`, the names it returns for mana 25 and level 2 on your book, and the names the two-argument call returns. Say which spells the level rule removed.
- One line naming which of the three, if any, you had to take the slower route for, and which 3.2 section you reread.

Commit `PROVING.md` with `spellbook.js` and push. The evidence that the book is finished is three things you can point at: `node spellbook.js` ends with `undefined` for `pool.currentMana` and no `TypeError` anywhere above it; the GitHub page for `js-fundamentals` shows both files; and `PROVING.md` has a trace whose final object matches the line `node` printed.

## Side quests

The arrays sheet is the full table of mutating versus copying methods behind the alias diagnosis, and the objects and destructuring sheet is the copy table in full, including the one case where `structuredClone` is the right tool.

## Before next session

Three things, in this order.

First, finish the Spell Book if it did not get done in the session. It is the artifact for this session, and Session 3.4 assumes `filter`, `map` and `reduce` are in your hands, not just in your notes. Nothing stays running between sessions; `node` exits when the file ends, and the push is the last thing that happens.

Second, do the three proving problems once more, tomorrow, on paper, without opening this page. Ten minutes. If the trace comes out and the two functions come out, you have the move. If one of them does not, take the slower route again. The Monster Manual gives you nothing to copy, and that is the point of it.

Third, read MDN's [Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring) page down to the end of the object section. You have now written every pattern on it at least once, so it will read like a list of things you did.

Session 3.4 is called [Objects and Orcs](/path/3-4-objects-and-orcs/). The `createManaPool` you wrote in 3.2 is already an object with methods and private state; next session you meet the `class` keyword, which is the other way to build that, and the word `this`, which is why arrow functions were careful not to have one. The spells you catalogued are about to become characters that cast them.

> **Say:** "Braces on the left unpack by name, brackets by position. Three dots in a literal spread a copy; three dots in a pattern gather the rest. A copy is one level deep and an alias is no copy at all. The counter is reduce with an empty object and one line per pass. Every query hands back something new and leaves the spells alone."

Say it once more without reading it. If it comes out in your own words, you have passed the yard.
