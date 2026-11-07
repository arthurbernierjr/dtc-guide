---
title: "Dart: intro to the language"
lede: "Dart 3.13 (any 3.0+ works): variables, input, conditionals, loops, lists, maps and functions — each shown first in the JavaScript you know, then in null-safe Dart."
updated_from: "the 2021 'Learning Your Second Language' lesson (Dart 2.12)"
verified: 2026-11-02
docs:
  - https://dart.dev/get-dart
  - https://dart.dev/language/variables
  - https://dart.dev/null-safety
  - https://dart.dev/language/branches
  - https://dart.dev/language/loops
  - https://dart.dev/language/collections
  - https://dart.dev/language/functions
  - https://api.dart.dev/dart-io/Stdin/readLineSync.html
  - https://nodejs.org/api/readline.html#promises-api
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 (the readline example was fed stdin). The Dart blocks were checked line by line against the Dart 3.13 language pages listed above for syntax and null safety; there is no Dart SDK on the build machine, so none of them was executed."
changes:
  - "Dart 3 enforces sound null safety: `String name = stdin.readLineSync();` no longer compiles because `readLineSync()` returns `String?`. The input example uses `?? 'stranger'` and the collections example explains why `myMap['cheese']` is a `String?`."
  - "Variables section corrected: `String myVariable2` is explicitly (not 'implicitly') typed, and `final` — the Dart keyword closest to JavaScript's `const` — was missing; it is explained next to `var`, `const` and `dynamic`."
  - "The variable named `num` shadowed Dart's built-in `num` type; renamed `number`. Typo 'greater that 1' fixed. The Functions section was labelled 'In python'; it is 'In Dart'."
  - "The Node input example uses the promise-based `node:readline/promises` API that Node ≥17 ships, instead of the callback form."
  - "Added the `for` and `for-in` loops, `.length`/`add`/`remove` on lists, `??` defaults on maps, arrow functions and `required` named parameters — the Dart features you reach for first after this page."
  - "Getting Started points at the official SDK installer and DartPad instead of a hosted REPL; exercise names use Dart's lowerCamelCase; the exercise list block is fenced as `dart`, not `py`; the third-party video playlist was replaced by the official language tour."
---

# Learning Your Second Language

---

## What you will learn

- Creating Variables in a New Language
- Conditionals in a New Language
- Looping in a New Language
- Collections in a New Language
- Writing Functions in a New Language

---

## Getting Started

Install the Dart SDK from [dart.dev/get-dart](https://dart.dev/get-dart) (3.13 as of this writing; everything on this page works on any Dart 3). If you already have Flutter installed, you already have Dart — it ships inside the Flutter SDK. Check it from a terminal:

```bash
dart --version
```

To run a single file: `dart run hello.dart`. To start a real project with a `pubspec.yaml`: `dart create my_first_dart && cd my_first_dart && dart run`.

If you'd rather not install anything yet, [DartPad](https://dartpad.dev) runs Dart in the browser — everything below works there except the "Receiving Input" example, because DartPad has no terminal (`dart:io`).

**WHY:** Dart is statically typed and null-safe. The compiler knows the type of every variable and whether it can hold `null`, and it refuses to build code that could blow up on a missing value. You'll get more red squiggles than in JavaScript, and far fewer runtime surprises.

## Creating Variables

How we did it in Javascript

```js
// We create constant variables with the const keyword
const myConstant = 5;
// We create re-assignable variables with the let keyword
let myVariable = "Hello World";

// We print variables to the console using console.log
console.log(myConstant);
console.log(myVariable);
```

How we do this in Dart

```dart
void main() {
  // const: a compile-time constant, can never change
  const myConstant = 5;
  // var: the type is inferred (String here) and fixed, but the value can be reassigned
  var myVariable = 'Hello World';
  myVariable = 'Hello again'; // fine
  // myVariable = 42;         // error: an int is not a String
  // the same thing with the type written out explicitly
  String myVariable2 = 'Goodbye World';
  // final: set once at runtime, then read-only (the closest thing to JS const)
  final myFinal = myVariable.toUpperCase();
  // dynamic opts out of static typing; the type can change (use sparingly)
  dynamic anything = false;
  anything = 'now a string';

  // print() is console.log; $name interpolates into a string
  print(myConstant);
  print(myVariable);
  print('$myVariable2 and $myFinal');
  print(anything);
}
```

Every Dart program starts in `main()`. Semicolons are required, single and double quotes both work (single is the style-guide default), and the naming convention is `lowerCamelCase` for variables and functions, `UpperCamelCase` for types.

### Receiving Input

In JavaScript in the browser, input comes from forms or `prompt`. In Node, reading from the terminal goes through the `readline` module; the promise-based version reads cleanly with `await`:

```js
// Node: ask a question in the terminal and wait for the answer
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });
const name = await rl.question("Who are you? ");
console.log(`Hey there ${name}!`);
rl.close();
```

How would we do that in Dart?

```dart
// dart:io gives us stdin and stdout (terminal only, not DartPad or the web)
import 'dart:io';

void main() {
  stdout.write('Who are you? ');
  // readLineSync() returns String? — null if the input ends before a line arrives.
  // ?? supplies a fallback, so `name` is a plain String and safe to use.
  final name = stdin.readLineSync() ?? 'stranger';

  print('Hey there, $name!');
}
```

`String?` (with the question mark) means "a String or null". The compiler will not let you use a `String?` where a `String` is needed until you handle the null case — `??` for a default, `if (name != null)` to check, or `name!` to promise it isn't null (and crash if you're wrong).

## Conditionals

If statements in Javascript

```js
const num = 5;

if (num > 3) {
  console.log("num is greater than 3");
} else if (num > 1) {
  console.log("num is greater than 1");
} else {
  console.log("num is 1 or less");
}
```

If statements in Dart

```dart
void main() {
  var number = 5;

  if (number > 3) {
    print('number is greater than 3');
  } else if (number > 1) {
    print('number is greater than 1');
  } else {
    print('number is 1 or less');
  }
}
```

Same shape as JavaScript, with two differences: the condition must be a real `bool` (no truthy/falsy — `if (number)` is a compile error), and there is no `===` because `==` never coerces types in Dart. `&&`, `||` and `!` are the same. Dart 3 also has `switch` *expressions* (`var size = switch (n) { < 10 => 'small', _ => 'big' };`), which you'll meet in the OOP lesson.

## While Loops

In Javascript

```js
let counter = 0;

//This will loop 10 times
while (counter < 10) {
  console.log(counter);
  counter += 1;
}
```

In Dart

```dart
void main() {
  // an int for counting (inferred from the 0)
  var counter = 0;

  // this will loop 10 times
  while (counter < 10) {
    print(counter);
    counter += 1; // counter++ works too
  }
}
```

Dart also has the classic `for` loop and `for-in`, which walks any `Iterable` (lists, sets, map keys…):

```dart
void main() {
  for (var i = 0; i < 10; i++) {
    print(i);
  }

  for (final letter in ['a', 'b', 'c']) {
    print(letter);
  }
}
```

## 10 Minute Exercise

Write the code to do the following:

- Loop 10 times starting the counter at 0
- On each loop if the counter is even print "it's even" (`counter.isEven` exists, so does `%`)
- If odd, print "meow" if the number is divisible by 3
- Otherwise print nothing

## Collections

In Javascript we have arrays and objects

```js
const myArray = [1, 2, 3];

console.log(myArray); //logging the entire array
console.log(myArray[0]); // logging an individual item

const myObject = {
  cheese: "gouda",
  bread: "rye",
};

console.log(myObject); //logging the entire object
console.log(myObject.cheese); // logging a property using dot notation
console.log(myObject["bread"]); // logging a property using square bracket notation
```

In Dart we have lists and maps

```dart
void main() {
  // a List<int> — Dart infers the element type from the contents
  var myList = [1, 2, 3];

  print(myList); // the entire list
  print(myList[0]); // an individual item
  print(myList.length); // 3
  myList.add(4); // lists grow like JS arrays
  myList.remove(1); // removes the first 1, by value

  // a Map<String, String>. Keys are quoted (they're values, not identifiers).
  const myMap = {
    'cheese': 'gouda',
    'bread': 'rye',
  };

  print(myMap); // the entire map
  print(myMap['cheese']); // one value — its type is String?, because the key might be missing
  print(myMap['bread']);
  print(myMap['jam'] ?? 'none'); // a missing key gives null; ?? supplies a default
}
```

There is no dot access for map keys (`myMap.cheese` is an error) — square brackets only. `const` in front of a list or map makes it deeply immutable (`myMap['jam'] = 'x'` throws); `var`/`final` lists can be changed. Dart also has `Set` (`{1, 2, 3}`, unique values) and records (`(1, 'a')`, fixed-size tuples) in the standard library.

## 10 Minute Exercise

Look up Dart's `List` methods in the [collections tour](https://dart.dev/language/collections) and the [`List` API](https://api.dart.dev/dart-core/List-class.html) and apply them to the following list.

```dart
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

- How to find a list's length (`.length`)
- How to loop over a list (`for (final item in list)`, `.forEach`, `.map`)
- How to add and remove items from a list (`add`, `insert`, `removeAt`, `remove`, `removeLast`)

## Functions

in Javascript

```js
const addNums = (x, y) => {
  return x + y;
};

console.log(addNums(5, 5));
```

In Dart

```dart
// return type, then name, then typed parameters
int addNums(int x, int y) {
  return x + y;
}

// the same thing with arrow syntax (single-expression bodies only)
int addNumsShort(int x, int y) => x + y;

void main() {
  print(addNums(5, 5));
  print(addNumsShort(5, 5));

  // anonymous functions look like JS arrows and can be stored in variables
  final twice = (int x) => x * 2;
  print(twice(21));
}
```

Two things JavaScript doesn't give you: typed parameters and named parameters. Named parameters go in `{}`; they're optional unless marked `required`, and can have defaults:

```dart
String greet({required String name, String greeting = 'Hello'}) {
  return '$greeting, $name!';
}

void main() {
  print(greet(name: 'Arthur')); // Hello, Arthur!
  print(greet(name: 'Arthur', greeting: 'Welcome')); // Welcome, Arthur!
}
```

An optional named parameter without a default must be nullable (`String? nickname`), because its value is `null` when the caller leaves it out — null safety again.

## 10 minute exercise

Write the following functions

- `subNums` that takes two arguments and returns their difference
- `sayHello` that takes a name as an argument and says hello to that name
- `sayHelloAdv` that takes a map with a `name` and `age` key and prints "hello {name}, how does it feel to be {age} years old"
- `looper` takes one list as an argument, loops over the list and prints each item individually

---

## Resources to Learn More

- [Dart language tour](https://dart.dev/language) — the official walk-through; the Variables, Branches, Loops, Collections and Functions pages cover everything here
- [Sound null safety](https://dart.dev/null-safety) — why `?`, `??` and `!` exist and how the compiler uses them
- [Effective Dart: Style](https://dart.dev/effective-dart/style) — why it's `lowerCamelCase`, two-space indents and single quotes
- [`dart:core` library](https://api.dart.dev/dart-core/) — `print`, `String`, `int`, `List`, `Map` and the rest

---
