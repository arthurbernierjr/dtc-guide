---
editorial: true
title: Ancient Runes
subtitle: TypeScript fundamentals and type safety
hook: "JavaScript lets a typo ride all the way to production. Today you add a compiler that refuses, build a parser that turns unknown JSON into a type you can trust, and learn the two ways Node 24 runs a .ts file."
read: 60
artifact: "A strict TypeScript project in ~/projects/typescript-practice with a parser that turns unknown input into a typed character and a test proving a malformed one is rejected"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
  - https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  - https://www.typescriptlang.org/docs/handbook/2/generics.html
  - https://www.typescriptlang.org/tsconfig/strict.html
  - https://nodejs.org/api/typescript.html
  - https://nodejs.org/api/test.html
say:
  - "A type is a claim the compiler checks before the program runs; it is gone by the time the program runs."
  - "External data is unknown until a check that actually executes narrows it."
  - "node runs a .ts file by stripping types; npx tsc runs the checks. You need both."
---

## The hook

Eight units of JavaScript, and every one of them had the same quiet failure: `hero.heatlh` is `undefined`, `calculateDamage({ str: 50 }, { def: 20 })` returns `NaN`, and nothing says a word until a user finds it. The language does what you typed, not what you meant. The guild hall from Unit 4 has that property in every handler. It works because you tested it, not because anything checked the shapes.

TypeScript is JavaScript with claims attached. You write what a value is supposed to be, a compiler checks the claims against each other, and then the claims are deleted and plain JavaScript runs. Today you set up `~/projects/typescript-practice`, learn the handful of type forms that cover most code, write a parser that turns unknown JSON into a value you can trust, and run the result both ways Node 24 allows: directly, with the types stripped, and through the compiler, with the types checked. By the end you can point at a line and say which mistakes the compiler would catch and which ones only a running check can.

> *A rune on the door does not stop the thief. It tells you who is allowed in, so the guard knows what to check.*

## The idea

A type is a claim about a value. `let level: number = 1` claims `level` holds a number. `function heal(target: Character, amount: number): Character` claims what goes in and what comes out. The compiler reads every claim in the project and checks that they agree with each other: you cannot pass a string where a number is claimed, you cannot read `.heatlh` from a value whose type has `health`, and you cannot call a function with two arguments when it claims three. That checking happens before the program runs, in your editor as you type and on the command line when you ask. Then the compiler emits JavaScript with every claim removed. The running program has no types. It has the code you wrote, checked.

That last sentence is the one to keep. Types do not exist at runtime. A type cannot inspect a JSON body, a database row, or an environment variable, because by the time those arrive the types are gone. Every value that enters the program from outside is unknown until a check that actually executes has looked at it. TypeScript gives that fact a name, the `unknown` type, and gives the check a name, narrowing. The shape of a safe program is three stages: unknown at the edge, a narrowing check that runs, typed functions inside. [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) is the vocabulary. [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) is the check. [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) is how a function keeps a relationship between its input type and its output type without naming either.

What you should be able to draw on a napkin: a JSON value arrives as `unknown`. One function checks its fields with `typeof`, `in`, and a list of allowed strings, and returns either a typed object or `null`. Everything after that function takes the typed object and never checks again. The compiler guarantees the inside. The parser guarantees the edge. Neither one does the other's job.

![](diagram:session-9-1/fig1-model)

### Annotate, infer, and the two kinds of nothing

You do not annotate everything. `const name = 'Bran'` already has the type `string`, because the compiler infers it from the value. Annotate function parameters always, because a parameter has no value to infer from. Annotate a return type when the function is part of a contract other code depends on, so a mistake inside the function is reported inside it and not three calls away. Annotate a variable when you declare it without a value. Otherwise let inference work and hover in VS Code to see what the compiler decided; TypeScript support is built into the editor, no extension needed.

Two types mean "I do not know," and they are opposites. `any` turns checking off for that value and everything derived from it. `const data: any = JSON.parse(text)` compiles, `data.hero.heatlh` compiles, and `data.hero` being `undefined` crashes at runtime exactly as it did in JavaScript. `any` is contagious: a function that returns `any` makes every caller's result `any`. `unknown` is the honest version. `const data: unknown = JSON.parse(text)` compiles, but `data.hero` does not, because you have not shown the compiler that `data` has a `hero`. You have to check. That refusal is the feature. `JSON.parse` is declared as returning `any` for historical reasons, so the first thing you do with its result is write it into a variable typed `unknown`.

`null` and `undefined` are also types, and under `strict` they are not members of any other type. A `string` is a string, not a string or `undefined`. If a value can be absent, say so: `string | null`, or an optional property `hero?: string`. The compiler then refuses to read `.length` from it until you have handled the absence. The non-null assertion `value!` tells the compiler to trust you. It is a lie you may tell when you can prove the value exists and the compiler cannot see the proof. Write the check instead whenever the check is cheap.

### Shapes: interface, type, and union

An `interface` describes an object's shape, property by property. A `type` alias gives any type a name, including unions and tuples that an interface cannot express. For an object shape, either works; use `interface` for objects and `type` for everything else, and do not spend an afternoon on the difference.

```ts
interface Quest {
  readonly id: string;
  title: string;
  status: QuestStatus;
  hero: string | null;
}

type QuestStatus = 'open' | 'done' | 'failed';
```

`QuestStatus` is a union of three string literals. A value of that type can be one of those three strings and nothing else. `'lost'` is a compile error. That is the same rule the Mongoose enum enforced in the guild door, now enforced before the program runs. A union of literals is the right tool for a closed set of states. TypeScript also has `enum`, which generates runtime code; this course does not use it, for a reason you will meet in a moment.

`readonly id` means no code may assign to `id` after the object is built. `hero: string | null` means the absence is explicit. An optional property `hero?: string` would also work, but then every reader has to remember that the key may be missing rather than present and null. Pick one convention per object. For data that comes from a database, `null` is usually the honest choice, because that is what the database stores.

A discriminated union is a union of object shapes that share one literal field, and it is the most useful pattern in the language.

```ts
type InventoryResult =
  | { ok: true; item: InventoryItem }
  | { ok: false; reason: 'full' | 'duplicate' };
```

Inside `if (result.ok)`, the compiler knows `result.item` exists. In the `else`, it knows `result.reason` exists and `result.item` does not. A function that returns this shape cannot forget to say why it failed, and a caller cannot read `item` from a failure. Four booleans could describe impossible states. One discriminator cannot.

### Narrowing is a check that runs

Narrowing is the compiler following your `if` statements. After `if (typeof value === 'string')`, `value` is a `string` inside the block. After `if ('blade' in weapon)`, `weapon` is the member of the union that has a `blade`. After `if (quest.status === 'done')`, `quest` is the `done` member. The check is ordinary JavaScript. It runs. The compiler's only contribution is to remember what the check proved and to refuse code that ignores it.

A type predicate is a function whose return type says what it proved:

```ts
const STATUSES: readonly QuestStatus[] = ['open', 'done', 'failed'];

function isQuestStatus(value: unknown): value is QuestStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}
```

`value is QuestStatus` is the claim. The body is the check. After `if (isQuestStatus(record.status))`, the field has the narrow type. This is the pattern for every boundary: a small function that takes `unknown`, runs a real check, and either returns the typed value or `null`. One parser per shape, next to the read. If three components each assert the shape on their own, the bug has three homes.

A type assertion, `value as Quest`, is not a check. It is you telling the compiler to stop looking. Assertions do nothing at runtime, so an object with the wrong fields sails through. The one assertion in the demonstration below is `value as Record<string, unknown>`, after `typeof value === 'object'` has already proved the value is an object. The assertion says only "this is an object with string keys and unknown values," which is weaker than the check already proved. That is the shape of an acceptable assertion: it never claims more than the checks before it established.

### Generics keep a relationship

`function first<T>(items: T[]): T` says: whatever the element type is, the result is that type. Call it with `number[]` and you get a `number`. Call it with `Quest[]` and you get a `Quest`. Without the type parameter you would have to choose between writing one function per element type or returning `any`, and `any` throws away exactly the information the caller needs. A generic class is the same idea for a container: `Chest<T>` holds items of one type and hands them back as that type.

A constraint narrows what `T` may be: `function label<T extends { name: string }>(entity: T)` accepts any object with a `name` and keeps the rest of its type. Inference usually supplies the type argument at the call site, so you write `new Chest<Quest>(2)` once and never spell `Quest` again for that chest. If you find yourself writing type arguments on every call, the signature is probably wrong.

TypeScript also ships generic utility types you will use constantly. `Partial<Quest>` makes every property optional, which is the shape of an update body. `Omit<Quest, 'id'>` is the shape of a create body, because the database assigns the id. `Pick<Quest, 'id' | 'title'>` is the shape of a list row. `Record<QuestStatus, number>` is an object with exactly those keys. The pattern is one source-of-truth interface and derived variations, instead of four hand-written interfaces that drift apart.

### Two ways to run a .ts file on Node 24

Node 24 runs TypeScript directly. `node src/quest.ts` strips the type annotations and executes what is left, with no compiler installed and no flag. The [Node TypeScript page](https://nodejs.org/api/typescript.html) calls this type stripping, and it has limits you need to know by name. Stripping does not check anything: a wrong type runs. It refuses syntax that would need generated code: `enum`, a `namespace` with values, parameter properties in a constructor, and `import x = require()`. It does not rewrite import paths, so a relative import names the file as it is on disk, `./quest.ts`, with the extension. It does not read `tsconfig.json` at all. The flag `--experimental-strip-types` from Node 22 is still accepted and does nothing extra on 24.

The compiler is the other half. `npx tsc` reads `tsconfig.json`, checks every file under `src`, and writes plain JavaScript into `dist`. `node dist/quest.js` then runs the checked program. `npx tsc --noEmit` checks without writing, which is the command you run before a commit. Two settings in the config below keep the two paths in step: `erasableSyntaxOnly` makes the compiler reject the same syntax Node refuses, so you find out at check time rather than at run time, and `rewriteRelativeImportExtensions` turns `./quest.ts` in your source into `./quest.js` in `dist`. The project is an ES module, `"type": "module"` in `package.json`, so both runtimes agree on `import` and `export`.

Do not install `ts-node`. It predates type stripping and adds a second, slower loader with its own configuration. The loop is `node src/file.ts` while you are exploring, `npx tsc --noEmit` before you trust it, and `npx tsc` plus `node dist/file.js` when you want to run what will actually ship.

## The demonstration

Make the project now, in the folder every TypeScript exercise in this unit shares. Node 24 and npm are from Unit 1; nothing else is installed yet.

```bash
mkdir -p ~/projects/typescript-practice
cd ~/projects/typescript-practice
npm init -y
npm install --save-dev typescript @types/node@24
npx tsc --init
npm pkg set type=module
git init
```

`npx tsc --init` prints `Created a new tsconfig.json`. Open it. It is long, commented, and tuned for a different project than this one: `module` is `nodenext`, `types` is an empty list, and `noUncheckedIndexedAccess` is on, which makes `items[0]` have the type `T | undefined` everywhere. Those are good settings for a library. For the exercises in this unit, which index arrays inside loops whose bounds you prove by hand, replace the whole file with this one and keep it short enough to read.

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "erasableSyntaxOnly": true,
    "rewriteRelativeImportExtensions": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src"]
}
```

`strict` turns on every strictness flag at once, including `strictNullChecks` and `noImplicitAny`; the [strict page](https://www.typescriptlang.org/tsconfig/strict.html) lists them. `rootDir` and `outDir` are the two folders. `types: ["node"]` is what makes `process`, `crypto`, and `node:test` known to the compiler; it is why `@types/node` is installed, and `@24` pins the type definitions to the Node you run. `verbatimModuleSyntax` makes you write `import type` for imports that are only types, so a stripped file never tries to import something that does not exist at runtime. Add `dist/` and `node_modules/` to `.gitignore`.

Now one worked example, start to finish. `src/quest.ts` holds a shape, a parser from `unknown`, a function that switches on the union, and a generic chest.

```ts
export type QuestStatus = 'open' | 'done' | 'failed';

export interface Quest {
  readonly id: string;
  title: string;
  status: QuestStatus;
  hero: string | null;
}

const STATUSES: readonly QuestStatus[] = ['open', 'done', 'failed'];

function isQuestStatus(value: unknown): value is QuestStatus {
  return typeof value === 'string' && (STATUSES as readonly string[]).includes(value);
}

export function parseQuest(value: unknown): Quest | null {
  if (typeof value !== 'object' || value === null) return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.title !== 'string') return null;
  if (!isQuestStatus(record.status)) return null;
  return {
    id: record.id,
    title: record.title,
    status: record.status,
    hero: typeof record.hero === 'string' ? record.hero : null
  };
}

export function describe(quest: Quest): string {
  switch (quest.status) {
    case 'open':
      return quest.title + ' is open' + (quest.hero ? ' and claimed by ' + quest.hero : '');
    case 'done':
      return quest.title + ' is done';
    case 'failed':
      return quest.title + ' failed';
  }
}

export class Chest<T> {
  private items: T[] = [];
  private readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  add(item: T): boolean {
    if (this.items.length >= this.capacity) return false;
    this.items.push(item);
    return true;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  get count(): number {
    return this.items.length;
  }
}

const raw = JSON.parse('[{"id":"q1","title":"Ring the bell","status":"open","hero":"Bran"},{"id":"q2","title":"Copy the map","status":"lost"}]') as unknown[];
const quests = raw.map(parseQuest);
console.log(quests.map((quest) => (quest ? describe(quest) : 'rejected')));

const chest = new Chest<Quest>(2);
for (const quest of quests) if (quest) chest.add(quest);
console.log(chest.count, chest.find((quest) => quest.status === 'open')?.id);
```

Read the parser as a sequence of checks that run. `typeof value !== 'object' || value === null` throws out strings, numbers, and `null`, which is an object to `typeof`. The assertion to `Record<string, unknown>` claims less than that check proved. Two `typeof` checks establish `id` and `title`. The predicate establishes `status`. The hero is read if it is a string and otherwise set to `null`. Only then is a `Quest` built, and it is built from the narrowed fields, not from the raw object, so a stray `qty` or `passwordHash` in the input never rides along.

`describe` has no `default` branch and still compiles, because the three cases cover the union. Add a fourth status to `QuestStatus` and the compiler reports that `describe` can now return `undefined`, which is the compiler telling you which functions a new state touches. That is what a closed set buys you.

Run it directly:

```bash
node src/quest.ts
```

```text
[ 'Ring the bell is open and claimed by Bran', 'rejected' ]
1 q1
```

The second quest had `"status": "lost"`. The parser returned `null`, the map printed `rejected`, and the chest holds one. Nothing checked a type to produce that result. A check ran. Now the compiler:

```bash
npx tsc
node dist/quest.js
```

`npx tsc` prints nothing when the project is clean, which is the convention: errors are output, silence is success. `dist/quest.js` is the same program with the annotations gone and `./quest.ts` imports rewritten to `.js`. The output is identical. Break it once on purpose. Change the chest to `constructor(private readonly capacity: number) {}`, a shorthand many tutorials use, and run `node src/quest.ts` again. Node stops with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX: TypeScript parameter property is not supported in strip-only mode`, and `npx tsc` says `TS1294: This syntax is not allowed when 'erasableSyntaxOnly' is enabled`. Same limit, two reporters. Put the explicit field back.

A test for the parser uses Node's own runner, from the [test page](https://nodejs.org/api/test.html), so nothing else is installed. `tests/quest.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseQuest } from '../src/quest.ts';

test('a well-formed object becomes a quest', () => {
  const quest = parseQuest({ id: 'q1', title: 'Ring the bell', status: 'open' });
  assert.ok(quest);
  assert.equal(quest.hero, null);
});

test('a status outside the union is rejected', () => {
  assert.equal(parseQuest({ id: 'q2', title: 'Copy the map', status: 'lost' }), null);
  assert.equal(parseQuest('q1'), null);
  assert.equal(parseQuest(null), null);
});
```

`node --test` with no arguments finds every file whose name ends in `.test.ts` and runs it with the types stripped. The summary ends with `ℹ pass 2` and `ℹ fail 0`. The `tests` folder is outside `rootDir` on purpose: tests are run, not compiled, and `npx tsc --noEmit` still type-checks them when you ask by path. Add `"test": "node --test"` to the scripts in `package.json` so `npm test` means the same thing here as it did in the dojo.

Here is a small model you can run here. It is the parser's shape in plain JavaScript, because the page cannot run a compiler. It proves that a rejected value is rejected by a check that executes, and that an assertion changes nothing. It does not prove your project compiles; `npx tsc --noEmit` in your terminal is that proof.

```js run=checkpoint-9-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const CLASSES = ['warrior', 'mage', 'rogue', 'healer'];

function parseCharacter(value) {
  if (typeof value !== 'object' || value === null) return null;
  if (typeof value.name !== 'string' || value.name.trim() === '') return null;
  if (!CLASSES.includes(value.class)) return null;
  return { name: value.name.trim(), class: value.class, level: 1 };
}

const bran = parseCharacter({ name: 'Bran', class: 'warrior' });
check(bran !== null && bran.class === 'warrior', 'Runtime validation succeeds');
check(parseCharacter({ name: 'Bran', class: 'bard' }) === null, 'Invalid union member rejected');
check(parseCharacter(null) === null && parseCharacter('Bran') === null, 'Unknown input handled');

function withAssertion(value) {
  return value;
}
const asserted = withAssertion({ nam: 'Sera', class: 'mage' });
check(asserted.name === undefined, 'an assertion changes nothing at runtime: the typo is still there');

console.log('ok: checkpoint-9-1');
```

## Where it breaks

![](diagram:session-9-1/fig2-diagnosis)

### Assertion hides bad data

A response arrives, you write `const quest = data as Quest`, and the compiler believes you. The field is missing at runtime and the crash lands in a template three files away, with a stack trace that points nowhere near the fetch. The symptom is a type error at runtime in a project with zero compile errors. The cause is an assertion standing where a check should be. `as` does not transform or validate; it only silences.

Find every `as` in the file. Each one should be preceded by checks that already proved what it claims, like the `Record<string, unknown>` after a `typeof` test. If an assertion claims a whole shape, replace it with a parser: `typeof` on each field, a predicate for each union, `null` when anything fails. Keep the parser next to the read. One parser per shape is cheap. A confident crash in the middle of the program is not.

### Any spreads silently

One `any` on a parsed response and every caller stops being checked, because a value derived from `any` is `any`. A misspelled property compiles. A function that expected a number accepts the whole object. The symptom is a project where the editor stops offering completions and errors stop appearing in files that used to have them. The cause is a single `any` upstream, often from `JSON.parse`, a library with no types, or a `catch (err)` whose error you read without narrowing.

Hover the value before you use it. If the tooltip says `any`, trace it back. Type the boundary as `unknown` and narrow. For a library whose types you cannot fix, wrap the call in one function with a typed return and keep the `any` inside it, named in a comment with the reason. `noImplicitAny`, part of `strict`, catches the ones you did not write; the explicit ones are on you.

### Compile success mistaken for runtime safety

`npx tsc --noEmit` exits silently and the program still throws on an empty array, a `null` from the database, or a rejected fetch. The symptom is confidence followed by a crash. The cause is a boundary the types never saw: I/O, JSON, environment variables, the DOM. The compiler checked that your claims agree with each other. It never ran the program, and it had no way to know what the network would send.

Keep a test on the behavior, especially on the branches the types made feel impossible. A test that feeds a malformed object to the parser and expects `null` is the smallest version. The browser checkpoint above is a model of that habit, not a substitute for it. When a crash arrives from outside the type system, the fix is a check, not a type.

## Your turn

The exercise converts the JavaScript character system below into TypeScript in the same project, then adds the parser the artifact is about.

1. Create the project if the demonstration did not already: `mkdir -p ~/projects/typescript-practice && cd ~/projects/typescript-practice && npm init -y && npm install --save-dev typescript @types/node@24 && npx tsc --init && npm pkg set type=module && git init`. The line you want is `Created a new tsconfig.json`. Replace the generated file with the twelve-line config from the demonstration, add `"test": "node --test"` to the scripts, and ignore `dist/` and `node_modules/`.
2. Create `src/runes.ts` and convert this JavaScript, keeping the names.

   ```js
   const CLASS_STATS = {
     warrior: { strength: 15, intelligence: 5, dexterity: 8, constitution: 14 },
     mage: { strength: 4, intelligence: 16, dexterity: 7, constitution: 6 },
     rogue: { strength: 8, intelligence: 8, dexterity: 16, constitution: 7 },
     healer: { strength: 5, intelligence: 14, dexterity: 6, constitution: 10 }
   };

   function createCharacter(name, characterClass) {
     const base = CLASS_STATS[characterClass];
     return {
       id: crypto.randomUUID(),
       name,
       class: characterClass,
       level: 1,
       stats: { ...base },
       health: base.constitution * 10,
       maxHealth: base.constitution * 10,
       inventory: [],
       guild: null
     };
   }

   function addToInventory(character, item) {
     if (character.inventory.length >= 20) return { ok: false, reason: 'full' };
     if (character.inventory.some((held) => held.id === item.id)) return { ok: false, reason: 'duplicate' };
     character.inventory.push(item);
     return { ok: true, item };
   }

   function takeDamage(character, amount) {
     const health = Math.max(0, character.health - amount);
     return { ...character, health };
   }
   ```

   Add a `CharacterClass` union of the four class names, a `Stats` interface, an `InventoryItem` interface with an `id`, a `name`, and a `kind` union of `'weapon' | 'armor' | 'potion'`, a `GameCharacter` interface with `readonly id` and `guild: string | null`, and an `InventoryResult` discriminated union on `ok`. Type `CLASS_STATS` as `Record<CharacterClass, Stats>`. Every parameter and every return type is annotated. No `any`. Export everything.
3. Add `parseCharacter(value: unknown): GameCharacter | null`. It accepts an object with a non-empty string `name` and a `class` that passes an `isCharacterClass` predicate, builds the character with `createCharacter`, copies `guild` if it is a string, and returns `null` for anything else.
4. Write `tests/runes.test.ts` with three tests: a well-formed object becomes a character with `health` of `140` for a warrior; `{ name: 'Bran', class: 'bard' }`, `{ class: 'mage' }`, `'Bran'`, and `null` all return `null`; adding the same item twice returns `{ ok: false, reason: 'duplicate' }`. Run `npm test` and read `ℹ pass 5` (your three plus the two quest tests) and `ℹ fail 0`.
5. Run `npx tsc --noEmit`. Silence is the pass. Then `npx tsc` and `ls dist`, and confirm `runes.js` and `quest.js` are there with no type annotations inside.
6. Break the parser once: delete the `isCharacterClass` check and return the field unchecked. The compiler reports that `record.class` is `unknown` and cannot be assigned to `CharacterClass`. Put the check back. Then break the runtime once: keep the check but call `parseCharacter({ name: 'Bran', class: 'bard' })` from a test expecting a character. The test fails; the compiler never objected, because the compiler cannot see the string. Restore the test. Those two failures are the two halves of the lesson.

If `node src/runes.ts` complains about an import, look at the extension. Node runs the file on disk and the file on disk is `.ts`; the compiler rewrites it to `.js` for `dist`, and never the other way around.

## The quest

![](diagram:session-9-1/fig3-evidence)

The deliverable is the `typescript-practice` project with `src/quest.ts`, `src/runes.ts`, their two test files, and a `README.md` of a few lines. The README states the two run loops, `node src/<file>.ts` and `npx tsc` followed by `node dist/<file>.js`, and the one sentence about what each proves. Push it to a GitHub repository called `typescript-practice` with `gh repo create typescript-practice --source=. --push`, the same way you created `quest-log` in Unit 1.

Evidence to keep in the README:

- The `ℹ pass` and `ℹ fail` lines from `npm test`.
- The sentence "npx tsc --noEmit printed nothing" on the date you ran it, or the error it printed and what you changed.
- The two breakages from step 6, each in one sentence: what you removed, which reporter noticed, and why the other one did not.
- One `as` you kept, and the checks above it that make the assertion weaker than what was already proved.

This folder is where the next two sessions live. The data structures and the algorithms are new files under the same `src`, tested by the same `npm test`, checked by the same `npx tsc --noEmit`.

## Side quests

The regex sheet is the next check your parser will need, when an id has to match a shape and not merely be a string, and the SOLID sheet gives names to what an interface already does for you: a contract a caller can depend on without reading the implementation.

## Before next session

Next session the types stay and the subject changes to cost: how long `includes` takes on a hundred thousand items, why `shift()` on an array is a trap, and how to build a stack, a queue, and a linked list whose claims about growth you can measure. Reread the section of Everyday Types on arrays and the narrowing page's section on type predicates, because every structure you build will be generic and every empty case will be a `T | undefined` you have to handle. Nothing is running between sessions; the project is files and a test command. You arrive with `~/projects/typescript-practice` compiling clean and `npm test` green, and the next session's first file goes beside the two you wrote today.
