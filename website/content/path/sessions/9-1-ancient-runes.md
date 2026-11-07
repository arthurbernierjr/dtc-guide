---
editorial: true
title: Ancient Runes
subtitle: TypeScript Fundamentals and Type Safety
hook: "A strict TypeScript module with validated external input and explicit domain types. External data begins without trusted structure."
read: 60
artifact: "A strict TypeScript module with validated external input and explicit domain types"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.typescriptlang.org/docs/handbook/2/narrowing.html
  - https://www.typescriptlang.org/tsconfig/strict.html
say:
  - "Unknown: External data begins without trusted structure."
  - "Narrow: Runtime checks establish the required shape."
  - "Typed: Internal functions operate on a deliberate contract."
---

## The hook

Welcome to the ancient runes arc. For eight units you have been writing JavaScript. JavaScript is powerful. JavaScript is flexible. JavaScript also lets you pass a string where a number should go, misspell a property name, and call a function with the wrong arguments, and it will not say a single word about it until your app crashes in production at 2 AM. That is not a hypothetical. That is every JavaScript developer's life.

TypeScript changes everything. It is not a new language. It is JavaScript with a type system bolted on top. Think of it as enchantment runes inscribed on your code. The code still runs the same way, but now it has protective wards that catch mistakes before they ever reach a user. Every major framework has gone TypeScript-first. React, Next.js, Angular, Vue, Deno, Bun. Many teams use TypeScript to make contracts easier to review; the right choice still depends on the project. Today you learn to read and write the runes.

We are going to cover a lot of ground. Basic types. Interfaces. Generics. Type guards. By the end of this session, you will be converting JavaScript to TypeScript and feeling the power of a compiler that actually tells you when something is wrong before your users do.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Apply TypeScript's Type System to Build Safer Applications
You will apply TypeScript's type system, including primitive types, interfaces, type aliases, generics, union types, and type guards, to write code that catches errors at compile time rather than runtime.

**Enabling Objectives:**
- Configure a TypeScript project with tsconfig.json and explain the purpose of key compiler options (strict, target, outDir, rootDir)
- Annotate variables, function parameters, and return types using TypeScript's primitive types, arrays, and tuples
- Define object shapes using interfaces and type aliases, and explain when to use each
- Construct union types, intersection types, literal types, and enums to model domain-specific data
- Write generic functions and interfaces that preserve type information across different data types
- Implement type guards using typeof, instanceof, discriminated unions, and custom type guard functions to narrow types safely

**You should be able to:**
- Set up a TypeScript project from scratch with proper configuration
- Convert untyped JavaScript code to fully typed TypeScript
- Use generics to build reusable, type-safe data structures
- Narrow union types using type guards and discriminated unions

**The Problem TypeScript Solves**

Live demo of JavaScript pain points:

```javascript
// JavaScript: "This is fine." (It is not fine.)

function calculateDamage(attacker, defender) {
  return attacker.strength * 2 - defender.armor;
}

// Calling it with the wrong shape:
calculateDamage({ str: 50 }, { def: 20 });
// Returns NaN. No error. No warning. Just broken math in production.

// Typos are silent killers:
const hero = { name: "Arthur", health: 100, mana: 50 };
console.log(hero.heatlh); // undefined. No error. Misspelled property.

// Type coercion nightmares:
console.log("5" + 3);    // "53" (string concatenation)
console.log("5" - 3);    // 2 (numeric subtraction)
console.log([] + []);     // "" (empty string... why?)
console.log({} + []);     // "[object Object]"
```

TypeScript = JavaScript + static types. It compiles down to regular JavaScript. Every valid JavaScript file is (mostly) valid TypeScript. The types disappear at runtime. They exist only to protect you during development.

**Installing and Configuring TypeScript**

```bash
# Install globally (for the tsc command)
npm install --save-dev typescript

# Check version
tsc --version

# In a project, install as a dev dependency
npm install --save-dev typescript

# Initialize a TypeScript config file
tsc --init
```

The `tsconfig.json` file explained:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Key options explained:
- `target`: What version of JavaScript to compile down to
- `strict`: Enables all strict type checking. Always use this. ALWAYS.
- `outDir`: Where compiled `.js` files go
- `rootDir`: Where your `.ts` source files live
- `sourceMap`: Maps compiled JS back to TS for debugging

Compiling and running:

```bash
# Compile a single file
tsc src/index.ts

# Compile the whole project (uses tsconfig.json)
tsc

# Watch mode (recompile on save)
tsc --watch

# Using ts-node for development (run TS directly)
npm install --save-dev ts-node
npx ts-node src/index.ts
```

File extensions: `.ts` for TypeScript, `.tsx` for TypeScript + JSX (React).

**Basic Types and Type Annotations**

The core primitive types:

```typescript
// Explicit type annotations
let heroName: string = "Arthur";
let heroLevel: number = 42;
let isAlive: boolean = true;
let questLog: string[] = ["Defeat the Dragon", "Find the Lost Sword"];
let coordinates: [number, number] = [10, 25]; // Tuple

// Type inference: TypeScript figures it out
let villainName = "Daemon Lord";  // TypeScript infers: string
let villainHP = 9999;             // TypeScript infers: number
let isDefeated = false;           // TypeScript infers: boolean

// When to annotate vs. infer:
// - Infer when the type is obvious from the value
// - Annotate when declaring without initializing
// - Annotate function parameters ALWAYS
// - Annotate return types when they are not obvious

let currentQuest: string;  // Annotate: no initial value
currentQuest = "Explore the Dungeon";
```

Special types:

```typescript
// any: Escape hatch. Disables type checking. Avoid it.
let mystery: any = "could be anything";
mystery = 42;       // No error
mystery = true;     // No error
mystery.foo.bar;    // No error (but will crash at runtime!)
// "Using 'any' is like removing the wards from your armor.
//  It works until something hits you."

// unknown: The safe version of any
let safeMystery: unknown = "could be anything";
// safeMystery.toUpperCase(); // ERROR: Object is of type 'unknown'
if (typeof safeMystery === "string") {
  safeMystery.toUpperCase(); // OK: TypeScript knows it is a string now
}

// void: Function returns nothing
function logMessage(message: string): void {
  console.log(message);
}

// null and undefined
let emptyValue: null = null;
let notAssigned: undefined = undefined;

// never: Function never returns (throws or infinite loop)
function throwError(message: string): never {
  throw new Error(message);
}
```

Arrays and tuples:

```typescript
// Arrays: two syntaxes, same meaning
let inventory: string[] = ["Sword", "Shield", "Potion"];
let stats: Array<number> = [100, 50, 75, 30];

// Tuple: fixed-length array with specific types per position
let heroEntry: [string, number, boolean] = ["Arthur", 42, true];
// heroEntry[0] is string, heroEntry[1] is number, heroEntry[2] is boolean

// Tuple with labels (TypeScript 4.0+)
type CharacterStats = [name: string, level: number, hp: number, mp: number];
let warrior: CharacterStats = ["Garen", 30, 500, 100];

// Read-only tuple
let position: readonly [number, number] = [10, 20];
// position[0] = 5; // ERROR: Cannot assign to '0' because it is a read-only property
```

Union types:

```typescript
// A value that can be one of several types
let questReward: string | number = "Legendary Sword";
questReward = 5000; // Also valid: it is a number

// Function parameter with union type
function displayStatus(status: string | number): string {
  if (typeof status === "string") {
    return status.toUpperCase();
  }
  return `Code: ${status}`;
}

// Literal types: specific values
type Direction = "north" | "south" | "east" | "west";
let heading: Direction = "north";
// heading = "up"; // ERROR: Type '"up"' is not assignable to type 'Direction'

type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 4;
// roll = 7; // ERROR: Type '7' is not assignable to type 'DiceRoll'
```

Enums:

```typescript
// Numeric enums (auto-incrementing)
enum CharacterClass {
  Warrior,    // 0
  Mage,       // 1
  Rogue,      // 2
  Healer,     // 3
  Paladin     // 4
}

let myClass: CharacterClass = CharacterClass.Mage;
console.log(myClass); // 1

// String enums (explicit values, more readable)
enum QuestStatus {
  NotStarted = "NOT_STARTED",
  InProgress = "IN_PROGRESS",
  Completed = "COMPLETED",
  Failed = "FAILED"
}

let status: QuestStatus = QuestStatus.InProgress;
console.log(status); // "IN_PROGRESS"

// When to use enums vs. union literals:
// Enums: when you need reverse mapping or runtime values
// Union literals: when you just need type checking (lighter weight)
type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
// This is often preferred over an enum for simple cases
```

![](diagram:session-9-1/fig1-model)

### Types describe values; they do not inspect the network

A TypeScript interface disappears from ordinary emitted JavaScript. If a server returns a string where you expected a number, a type assertion does not transform or validate that value. Treat external JSON as unknown until runtime checks establish its shape. Then pass the validated value into typed internal functions. This boundary is where compile-time reasoning and runtime evidence meet.

For a quest response, check that the identifier and title are strings and the status is one of the allowed values. Decide whether unknown fields are ignored or rejected. Return a useful validation error rather than scattering assertions through components. A single parser at the boundary makes the rest of the application easier to reason about and gives tests a precise place to exercise malformed input.

### Model states that cannot be confused

A loading screen often starts with several booleans: loading, failed, and complete. Those booleans can describe impossible combinations, such as loading and complete at once. A discriminated union can express one state at a time: idle, loading, success with data, or error with a message. A switch on the discriminator makes required data available only in the appropriate branch.

Optional properties should represent genuinely optional facts, not uncertainty about the model. If a successful response always includes data, make data required in that branch. If a property can be absent, code must handle that absence. Strict null checks force the question into the editor before a user encounters an undefined value. Avoid using non-null assertions merely to silence the compiler; explain why the value exists or check it.

### Generics preserve relationships

A generic function says that some relationship holds across types. An identity function returns the same type it receives. A stack stores and returns one chosen element type. This is more useful than replacing everything with any, which discards the relationship. Start with a concrete function, identify the repeated structure, and introduce a type parameter only when the abstraction earns its complexity.

Constraints describe the capabilities a generic implementation needs. If a function reads an id property, its type parameter should require that property. Do not pretend it can accept every value. Inference often supplies the type argument at the call site, keeping the code readable. Inspect inferred types in the editor to learn what the compiler actually knows rather than adding annotations everywhere by habit.

### Migrate at a boundary you can verify

Choose one small module with tests and convert it before changing the whole application. Enable strict checking, fix real mismatches, and rerun behavior tests. A compiler error can reveal an existing bug, an inaccurate type, or an unclear contract. Investigate which one applies. Casting through unknown or any to force a green build removes the evidence you introduced TypeScript to obtain.

Keep frontend and backend configurations appropriate to their runtimes. A browser module and a Node process may need different module-resolution and library settings. Shared data types do not imply that all runtime code can be shared. Record manual setup commands for the TypeScript toolchain and run them yourself when ready; the lesson's browser checkpoint demonstrates the runtime validation concept without installing a compiler.

### Review the public surface

Export the smallest useful set of types and functions. A module's public contract should explain inputs, outputs, and failure behavior. Internal helper types can remain private. Check how a consumer would misuse the function and whether the compiler catches that misuse. Then test a malformed runtime value to demonstrate the separate validation boundary. The finished artifact includes both kinds of evidence and states clearly which compiler checks remain manual.

## The demonstration

Take ten minutes.
Step away from the rune table. Let the inscriptions settle in your mind. Stretch, hydrate, and prepare for the next level of enchantment.

**Interfaces, Type Aliases, and Object Shapes**

Interfaces define the shape of objects:

```typescript
// An interface is a contract: "any object with this shape is valid"
interface Character {
  name: string;
  level: number;
  health: number;
  mana: number;
  isAlive: boolean;
}

// Objects must match the shape exactly
const hero: Character = {
  name: "Arthur",
  level: 42,
  health: 100,
  mana: 50,
  isAlive: true
};

// Missing property causes an error:
// const badHero: Character = { name: "Bob", level: 1 };
// ERROR: Type '{ name: string; level: number; }' is missing properties:
//   health, mana, isAlive
```

Optional and readonly properties:

```typescript
interface QuestItem {
  readonly id: string;        // Cannot be changed after creation
  name: string;
  description: string;
  weight: number;
  value: number;
  enchantment?: string;       // Optional: might not have one
  durability?: number;        // Optional
}

const sword: QuestItem = {
  id: "item_001",
  name: "Flame Sword",
  description: "A blade wreathed in fire",
  weight: 5,
  value: 2500,
  enchantment: "Fire Damage +50"
  // durability is optional, so we can omit it
};

// sword.id = "item_002"; // ERROR: Cannot assign to 'id' because read-only
sword.name = "Frost Sword"; // OK: name is not readonly
```

Extending interfaces:

```typescript
// Base interface
interface Entity {
  id: string;
  name: string;
  position: { x: number; y: number };
}

// Extended interface: inherits all properties, adds new ones
interface Player extends Entity {
  level: number;
  experience: number;
  inventory: QuestItem[];
  guild?: string;
}

interface NPC extends Entity {
  dialogue: string[];
  questsAvailable: string[];
  isHostile: boolean;
}

interface Boss extends NPC {
  phase: number;
  maxPhases: number;
  lootTable: QuestItem[];
  specialAttack: string;
}

// Boss has: id, name, position (from Entity),
//           dialogue, questsAvailable, isHostile (from NPC),
//           phase, maxPhases, lootTable, specialAttack (own)
```

Type aliases:

```typescript
// Type aliases can represent any type, not just objects
type ID = string;
type Coordinate = [number, number];
type Callback = (data: string) => void;
type StringOrNumber = string | number;

// Type alias for object shapes (similar to interface)
type Weapon = {
  name: string;
  damage: number;
  type: "sword" | "bow" | "staff" | "dagger";
  enchantment?: string;
};

// Intersection types: combine multiple types
type Enchanted = {
  enchantment: string;
  enchantmentLevel: number;
};

type EnchantedWeapon = Weapon & Enchanted;

const magicSword: EnchantedWeapon = {
  name: "Excalibur",
  damage: 999,
  type: "sword",
  enchantment: "Holy Light",
  enchantmentLevel: 10
};
```

Interfaces vs. Type Aliases:

```typescript
// INTERFACE: Best for object shapes and class contracts
// - Can be extended with 'extends'
// - Can be merged (declaration merging)
// - Shows up better in error messages
// - Use for public API contracts

interface Animal {
  name: string;
}
interface Animal {
  legs: number;
}
// These merge! Animal now has both name and legs.

// TYPE ALIAS: Best for unions, primitives, tuples, complex types
// - Cannot be merged
// - Can represent ANY type (union, tuple, primitive, function)
// - More flexible

type Status = "active" | "inactive" | "banned"; // Cannot do this with interface
type Pair<T> = [T, T]; // Cannot do this with interface

// Rule of thumb:
// Use interfaces for object shapes. Use type aliases for everything else.
// If you are not sure, use interface. You will be fine.
```

Nested interfaces and index signatures:

```typescript
interface GameState {
  player: {
    name: string;
    stats: {
      strength: number;
      intelligence: number;
      dexterity: number;
      constitution: number;
    };
    inventory: QuestItem[];
  };
  currentMap: string;
  npcs: NPC[];
  flags: { [key: string]: boolean }; // Index signature
}

// Index signatures: objects with dynamic keys
interface SkillTree {
  [skillName: string]: {
    level: number;
    maxLevel: number;
    prerequisite?: string;
  };
}

const mageSkills: SkillTree = {
  fireball: { level: 3, maxLevel: 10 },
  iceShield: { level: 1, maxLevel: 5, prerequisite: "fireball" },
  thunderStorm: { level: 0, maxLevel: 8, prerequisite: "iceShield" }
};
```

**Functions, Generics, and Type Guards**

Typed functions:

```typescript
// Function with typed parameters and return type
function calculateDamage(
  attackPower: number,
  defense: number,
  critMultiplier: number = 1.0
): number {
  const baseDamage = Math.max(0, attackPower - defense);
  return Math.floor(baseDamage * critMultiplier);
}

// Arrow function with types
const healCharacter = (
  character: Character,
  amount: number
): Character => {
  return {
    ...character,
    health: Math.min(character.health + amount, 100)
  };
};

// Function type aliases
type DamageCalculator = (attack: number, defense: number) => number;

const simpleDamage: DamageCalculator = (attack, defense) => {
  return Math.max(0, attack - defense);
};

// Optional and rest parameters
function summonParty(
  leader: string,
  healer?: string,
  ...fighters: string[]
): string[] {
  const party = [leader];
  if (healer) party.push(healer);
  party.push(...fighters);
  return party;
}

summonParty("Arthur");                          // ["Arthur"]
summonParty("Arthur", "Elara");                 // ["Arthur", "Elara"]
summonParty("Arthur", "Elara", "Grom", "Kai");  // ["Arthur", "Elara", "Grom", "Kai"]
```

Function overloads:

```typescript
// Sometimes a function behaves differently based on input types
function processLoot(loot: string): string;
function processLoot(loot: string[]): string[];
function processLoot(loot: string | string[]): string | string[] {
  if (Array.isArray(loot)) {
    return loot.map(item => item.toUpperCase());
  }
  return loot.toUpperCase();
}

const single = processLoot("sword");       // TypeScript knows: string
const multiple = processLoot(["sword", "shield"]); // TypeScript knows: string[]
```

Generics:

```typescript
// The problem: we want a function that works with ANY type
// but preserves type information

// BAD: loses type info
function getFirstBad(arr: any[]): any {
  return arr[0];
}
const first = getFirstBad([1, 2, 3]); // type: any (useless)

// GOOD: generic preserves type info
function getFirst<T>(arr: T[]): T {
  return arr[0];
}
const firstNumber = getFirst([1, 2, 3]);       // type: number
const firstString = getFirst(["a", "b", "c"]); // type: string

// Generic with multiple type parameters
function createPair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}
const pair = createPair("health", 100); // type: [string, number]

// Generic interfaces
interface Chest<T> {
  contents: T[];
  capacity: number;
  addItem(item: T): void;
  removeItem(index: number): T;
}

// Using the generic interface with a specific type
const weaponChest: Chest<Weapon> = {
  contents: [],
  capacity: 10,
  addItem(item: Weapon) {
    if (this.contents.length < this.capacity) {
      this.contents.push(item);
    }
  },
  removeItem(index: number): Weapon {
    return this.contents.splice(index, 1)[0];
  }
};

// Generic constraints: limiting what T can be
interface HasName {
  name: string;
}

function greet<T extends HasName>(entity: T): string {
  return `Hello, ${entity.name}!`;
}

greet({ name: "Arthur", level: 42 });  // OK: has name property
// greet({ level: 42 });               // ERROR: missing name property

// Generic with keyof
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const heroNameVal = getProperty(hero, "name");   // type: string
const heroLevelVal = getProperty(hero, "level"); // type: number
// getProperty(hero, "wings");                   // ERROR: "wings" not in Character
```

Built-in utility types (generics TypeScript ships for free — you will use these constantly in real codebases):

```typescript
interface Character {
  id: string;
  name: string;
  level: number;
  guild: string;
}

// Partial<T>: every property becomes optional
// Perfect for update functions - callers send only the fields that changed
function updateCharacter(id: string, changes: Partial<Character>) { /* ... */ }
updateCharacter("abc", { level: 13 });            // OK - just one field

// Pick<T, Keys>: build a smaller type from selected properties
type CharacterPreview = Pick<Character, "name" | "level">;
// { name: string; level: number } - great for list views and API summaries

// Omit<T, Keys>: everything EXCEPT the listed properties
type NewCharacter = Omit<Character, "id">;
// The create-form type: the database assigns the id, so the form should not have it

// Record<Keys, Value>: an object type with known keys and uniform values
type ClassName = "mage" | "knight" | "ranger";
const baseHp: Record<ClassName, number> = { mage: 60, knight: 120, ranger: 90 };

// Readonly<T>: all properties locked after creation
const config: Readonly<Character> = { id: "1", name: "Aria", level: 12, guild: "Dawn" };
// config.level = 13;  // ERROR: cannot assign to readonly property
```

The pattern to notice: you define ONE source-of-truth interface (`Character`) and derive the variations (`Partial` for updates, `Omit` for creation, `Pick` for previews) instead of hand-writing four nearly identical interfaces that drift apart over time.

Type narrowing and type guards:

```typescript
// typeof guard
function processInput(input: string | number): string {
  if (typeof input === "string") {
    // TypeScript knows: input is string here
    return input.toUpperCase();
  }
  // TypeScript knows: input is number here
  return input.toFixed(2);
}

// instanceof guard
class WarriorClass {
  slash() { return "Slash attack!"; }
}
class MageClass {
  cast() { return "Fireball!"; }
}

function attack(character: WarriorClass | MageClass): string {
  if (character instanceof WarriorClass) {
    return character.slash(); // TypeScript knows: WarriorClass
  }
  return character.cast(); // TypeScript knows: MageClass
}

// "in" operator guard
interface SwordWeapon {
  blade: string;
  slash(): void;
}
interface StaffWeapon {
  element: string;
  cast(): void;
}

function useWeapon(weapon: SwordWeapon | StaffWeapon): void {
  if ("blade" in weapon) {
    weapon.slash(); // TypeScript knows: SwordWeapon
  } else {
    weapon.cast(); // TypeScript knows: StaffWeapon
  }
}

// Discriminated unions (the most powerful pattern)
interface AttackAction {
  type: "attack";
  target: string;
  damage: number;
}
interface HealAction {
  type: "heal";
  target: string;
  amount: number;
}
interface DefendAction {
  type: "defend";
  duration: number;
}

type GameAction = AttackAction | HealAction | DefendAction;

function executeAction(action: GameAction): string {
  switch (action.type) {
    case "attack":
      return `Dealt ${action.damage} damage to ${action.target}`;
    case "heal":
      return `Healed ${action.target} for ${action.amount} HP`;
    case "defend":
      return `Defending for ${action.duration} turns`;
  }
}
// TypeScript narrows the type in each case branch automatically!

// Custom type guard function
function isPlayer(entity: Player | NPC): entity is Player {
  return "level" in entity && "experience" in entity;
}

function interact(entity: Player | NPC): string {
  if (isPlayer(entity)) {
    return `Player ${entity.name} is level ${entity.level}`;
  }
  return `NPC says: ${entity.dialogue[0]}`;
}
```

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-9-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function parseQuest(value) {
  if (!value || typeof value !== 'object' || typeof value.title !== 'string' || !['open', 'done'].includes(value.status)) return null;
  return {title: value.title, status: value.status};
}
check(parseQuest({title: 'Learn', status: 'open'}).status === 'open', 'Runtime validation succeeds');
check(parseQuest({title: 'Learn', status: 'invented'}) === null, 'Invalid union member rejected');
check(parseQuest(null) === null, 'Unknown input handled');
console.log('ok: checkpoint-9-1');
```

## Where it breaks

![](diagram:session-9-1/fig2-diagnosis)

### Assertion hides bad data

A value arrives from JSON as `unknown`, you assert it is a `Quest`, and TypeScript believes you. The field is missing at runtime and blows up in a template three files away. An assertion is you overriding the compiler. Narrow the value with a check that runs: the field is a string, the id is present, the status is one of the three you handle. Then the type shrinks because the check happened. Assert only at a boundary you truly control, and keep the check next to the read. A lie at the edge becomes a confident crash in the middle.

### Any spreads silently

One `any` on a parsed response, and every caller stops being checked, because `any` is contagious. A typo in a property name compiles. A function that expected a number accepts the whole object. Prefer `unknown` at the boundary and a real type after you validate. When you are tempted by `any` to get through a library's types, isolate it in one function and type the return. Then look at the inferred type of the value you are about to use. If it is `any`, the compiler has left the chat.

### Compile success mistaken for runtime safety

`tsc` exits 0 and the app still throws on an empty list, a null from the database, or a rejected fetch. The compiler checked the types it could see. It did not run the program. The emitted JavaScript still has to handle the cases your types excluded by assumption. Keep a test or a checkpoint on the behavior, especially on the branches you think the types made impossible. Those are the branches that arrive from outside the type system: I/O, JSON, and the DOM.

## Your turn

Take ten minutes.
Your rune knowledge is expanding rapidly. Take a break, refill your mana, and prepare for the practical exercises. When we return, you will inscribe your own runes.

**Exercise 1: Type the Character System**

**Objective:** Convert an untyped JavaScript character creation system to fully typed TypeScript.

**Instructions:**
1. Create a new file called `character-system.ts`
2. Convert the following JavaScript code to TypeScript with full type annotations:

```javascript
// CONVERT THIS JAVASCRIPT TO TYPESCRIPT:

const CLASS_STATS = {
  warrior: { strength: 15, intelligence: 5, dexterity: 8, constitution: 14 },
  mage: { strength: 4, intelligence: 16, dexterity: 7, constitution: 6 },
  rogue: { strength: 8, intelligence: 8, dexterity: 16, constitution: 7 },
  healer: { strength: 5, intelligence: 14, dexterity: 6, constitution: 10 }
};

function createCharacter(name, characterClass) {
  const baseStats = CLASS_STATS[characterClass];
  return {
    id: Math.random().toString(36).substr(2, 9),
    name,
    class: characterClass,
    level: 1,
    experience: 0,
    stats: { ...baseStats },
    health: baseStats.constitution * 10,
    maxHealth: baseStats.constitution * 10,
    inventory: [],
    isAlive: true,
    guild: null
  };
}

function levelUp(character) {
  character.level += 1;
  character.stats.strength += 2;
  character.stats.intelligence += 2;
  character.stats.dexterity += 2;
  character.stats.constitution += 2;
  character.maxHealth = character.stats.constitution * 10;
  character.health = character.maxHealth;
  return character;
}

function addToInventory(character, item) {
  if (character.inventory.length >= 20) {
    return { success: false, message: "Inventory full" };
  }
  character.inventory.push(item);
  return { success: true, message: `Added ${item.name}` };
}

function takeDamage(character, amount) {
  character.health = Math.max(0, character.health - amount);
  if (character.health === 0) {
    character.isAlive = false;
  }
  return character;
}
```

3. Add the following types:
   - A `CharacterClass` type (union of the four classes)
   - A `Stats` interface
   - A `Character` interface
   - An `InventoryItem` interface
   - An `InventoryResult` type for the return value of `addToInventory`
4. Ensure the code compiles with `tsc --strict` and no errors

**Hints for the interfaces you need:**

```typescript
type CharacterClass = "warrior" | "mage" | "rogue" | "healer";

interface Stats {
  strength: number;
  intelligence: number;
  dexterity: number;
  constitution: number;
}

interface InventoryItem {
  id: string;
  name: string;
  type: "weapon" | "armor" | "potion" | "quest";
  value: number;
  weight: number;
}

interface GameCharacter {
  readonly id: string;
  name: string;
  class: CharacterClass;
  level: number;
  experience: number;
  stats: Stats;
  health: number;
  maxHealth: number;
  inventory: InventoryItem[];
  isAlive: boolean;
  guild: string | null;
}

type InventoryResult =
  | { success: true; message: string }
  | { success: false; message: string };

// Use Record<CharacterClass, Stats> for the CLASS_STATS object
// Then add type annotations to all function parameters and return types
// Example: function createCharacter(name: string, characterClass: CharacterClass): GameCharacter
```

**Success Criteria:**
- All four functions are fully typed (parameters AND return types)
- No use of `any`
- At least 3 interfaces defined
- At least 1 union type or literal type used
- Code compiles with `tsc --strict` without errors

**Time Estimate:** 25 minutes

**Exercise 2: Generic Inventory System**

**Objective:** Build a generic container class that works with any item type.

**Instructions:**
1. Create a generic class `Container<T>` that can hold items of any type
2. Implement the following methods:
   - `add(item: T): boolean` - adds item if under capacity
   - `remove(index: number): T | undefined` - removes and returns item
   - `getAll(): readonly T[]` - returns read-only array of all items
   - `find(predicate: (item: T) => boolean): T | undefined` - finds first match
   - `count(): number` - returns number of items
3. Test it with at least two different types (weapons and potions)

```typescript
// Starter code:
interface Weapon {
  name: string;
  damage: number;
  type: "sword" | "bow" | "staff";
}

interface Potion {
  name: string;
  effect: "heal" | "mana" | "strength";
  potency: number;
}

class Container<T> {
  private items: T[] = [];
  private capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  add(item: T): boolean {
    if (this.items.length >= this.capacity) return false;
    this.items.push(item);
    return true;
  }

  remove(index: number): T | undefined {
    if (index < 0 || index >= this.items.length) return undefined;
    return this.items.splice(index, 1)[0];
  }

  getAll(): readonly T[] {
    return this.items;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }

  count(): number {
    return this.items.length;
  }
}

// Test your container:
const armory = new Container<Weapon>(5);
armory.add({ name: "Iron Sword", damage: 25, type: "sword" });
armory.add({ name: "Oak Bow", damage: 18, type: "bow" });

const potionBag = new Container<Potion>(10);
potionBag.add({ name: "Health Potion", effect: "heal", potency: 50 });

const strongWeapon = armory.find(w => w.damage > 20);
console.log(strongWeapon); // { name: "Iron Sword", damage: 25, type: "sword" }
```

**Success Criteria:**
- Generic class compiles without errors
- Works with at least 2 different types
- `find` method uses generic predicate function
- No use of `any`

**Time Estimate:** 10 minutes

## The quest

**Independent Lab: TypeScript RPG Battle System**

Build a complete turn-based battle simulation in TypeScript. This is your chance to combine everything from today: types, interfaces, generics, type guards, and discriminated unions.

**Requirements:**
1. Define at least 4 interfaces (Character, Weapon, Spell, BattleResult)
2. Use an enum or union type for character classes
3. Use a discriminated union for different action types (attack, defend, cast spell, use item)
4. Create a generic `EventLog<T>` that records game events with timestamps
5. Implement a `simulateBattle(player: Character, enemy: Character): BattleResult` function
6. Use at least one type guard
7. All code must compile with `tsc --strict`

**Stretch Goals:**
- Add a `Party<T extends Character>` generic class that manages groups
- Implement function overloads for a `useAbility` function
- Add a `Readonly<Character>` frozen snapshot feature

**Time:** about 45 minutes. Finish it after the session if you need to.

### Review the artifact

Your deliverable is **A strict TypeScript module with validated external input and explicit domain types**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-9-1/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Review ES6+ features (destructuring, spread, arrow functions, classes). Manually add TypeScript to your project when ready: `npm install --save-dev typescript`. Have VS Code open with the TypeScript extension active.
**Materials:** TypeScript Playground (typescriptlang.org/play), starter repo with JavaScript files to convert, tsconfig.json reference sheet.

**Assignment: TypeScript Character Builder**
- **Objective:** Build a complete character creation and battle simulation system in TypeScript
- **Tasks:**
  1. Create a TypeScript project with a proper `tsconfig.json`
  2. Define interfaces for: `Character`, `Weapon`, `Armor`, `Spell`, `BattleResult`
  3. Create an `enum` for character classes and a union type for damage types
  4. Implement at least 5 functions with full type annotations:
     - `createCharacter(name, class): Character`
     - `equipWeapon(character, weapon): Character`
     - `castSpell(caster, target, spell): BattleResult`
     - `calculateDamage(attacker, defender): number`
     - `battleRound(player, enemy): BattleResult`
  5. Use at least one generic function or class
  6. Use at least one discriminated union
  7. All code must compile with `tsc --strict` and zero errors
- **Stretch Goals:**
  - Add a generic `EventEmitter<T>` class for game events
  - Implement type guards for different character classes
  - Add a `Party<T extends Character>` generic class
- **Submission:** Push to your GitHub repo in a folder called `typescript-practice/`
- **Due:** Before Session 9.2

---

### Manual verification and further reading

- [Official reference 1](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Official reference 2](https://www.typescriptlang.org/tsconfig/strict.html)
