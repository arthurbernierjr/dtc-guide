---
title: "Dart: OOP"
lede: "Dart 3.13 (any 3.0+ works): classes, constructors, methods, inheritance, mixins and static members — the JavaScript version next to the null-safe Dart version."
updated_from: "the 2021 'OOP in New Language' lesson (Dart 2.12)"
verified: 2026-11-02
docs:
  - https://dart.dev/language/classes
  - https://dart.dev/language/constructors
  - https://dart.dev/language/extend
  - https://dart.dev/language/mixins
  - https://dart.dev/language/branches
  - https://dart.dev/language/primary-constructors
  - https://dart.dev/null-safety
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 and printed what the comments say. The Dart blocks were checked line by line against the Dart 3.13 pages on classes, constructors, extending classes, mixins and switch expressions; there is no Dart SDK on the build machine, so none of them was executed."
changes:
  - "Null safety fix: `String name; int age;` followed by assignments in the constructor body does not compile in Dart 3 (non-nullable fields must be initialized before the body runs). Both Dog classes now use initializing formals — `Dog(this.name, this.age);` — which is also the idiomatic form."
  - "Inheritance uses Dart 2.17+ super parameters: `SmallDog(super.name, super.age);` replaces `SmallDog(String name, int age) : super(name, age);` (the long form is still shown for comparison)."
  - "Bug fixed in the Calculator: `lastResult` was `dynamic`, `calculate` returned `int`, and the `/` case produced a `double`, so `calculate(4, 2, '/')` would have thrown at runtime. Everything is typed `num` now, and the `switch` statement with `break`s is a Dart 3 `switch` expression."
  - "The JavaScript Calculator no longer runs student input through `eval()`; both versions dispatch on an operator table/switch, which does the same job without executing arbitrary strings."
  - "Added `@override toString()`, a short mixin example (Dart's answer to multiple inheritance) and a pointer to Dart 3.13's primary constructors (`class Dog(var String name, var int age);`)."
  - "Resources now link the official class, constructor and mixin pages (the 2021 page had none)."
---

# OOP in New Language

---

## What you will learn

- How to Create a Class
- How to Instantiate a Class
- Write a Constructor and Methods
- Create an Inherited Class
- Write Static Methods/Properties

---

Below you'll see JavaScript examples of object-oriented patterns and their Dart counterparts. Dart is a class-based language through and through — every value, including numbers and functions, is an object — so most of this will feel familiar.

## Creating and Instantiating a Class

In Javascript

```js
// Creating a Class
class Dog {}

// Instantiation
const Sparky = new Dog();
```

In Dart

```dart
// Creating a class
class Dog {}

void main() {
  // Instantiation: `new` is optional in Dart and left out by convention
  var sparky = Dog();
  print(sparky); // Instance of 'Dog'
}
```

Convention: class names are `UpperCamelCase`, instances and members `lowerCamelCase`. There is no `export` keyword — everything in a file is public unless its name starts with `_`, which makes it private to that file (library).

## The Constructor and Methods

In Javascript

```js
// Creating a Class
class Dog {
  // The constructor runs when we instantiate a new instance
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // A Method
  bark() {
    console.log(`${this.name} barks`);
  }
}

// Instantiation
const Sparky = new Dog("Sparky", 4);
Sparky.bark();
```

in Dart

```dart
class Dog {
  // instance fields are declared with their types. With null safety they must be
  // initialized — the constructor below does that before its body ever runs.
  String name;
  int age;

  // the constructor is named after the class. `this.name` is an "initializing
  // formal": it assigns the parameter straight to the field. No body needed.
  Dog(this.name, this.age);

  // a method. $name interpolates the field into the string.
  void bark() {
    print('$name barks!');
  }

  // what print(dog) shows instead of "Instance of 'Dog'"
  @override
  String toString() => 'Dog(name: $name, age: $age)';
}

void main() {
  var sparky = Dog('Sparky', 4);
  sparky.bark(); // Sparky barks!
  print(sparky); // Dog(name: Sparky, age: 4)
}
```

**WHY the short constructor:** the 2021 version wrote `Dog(String name, int age) { this.name = name; this.age = age; }`. Dart 3 rejects that — `name` and `age` are non-nullable and would be unset while the constructor body runs. `Dog(this.name, this.age);` initializes them *before* the body, which is why it's the idiomatic form. Inside methods, `this.` is only needed when a local variable shadows a field.

Dart 3.13 adds **primary constructors**, which declare the fields and the constructor in the class header: `class Dog(var String name, var int age) { void bark() => print('$name barks!'); }`. The longer form above is what you'll see in most code today; both mean the same thing.

## Inheritance

In Javascript

```js
// Creating a Class
class Dog {
  // The constructor runs when we instantiate a new instance
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // A Method
  bark() {
    console.log(`${this.name} barks`);
  }
}

class SmallDog extends Dog {
  constructor(name, age) {
    //Super calls the constructor of the parent class
    super(name, age);
  }

  //This will override the version of bark in the parent class
  bark() {
    console.log(`${this.name} yaps`);
  }
}

// Instantiation
const Sparky = new SmallDog("Sparky", 4);
Sparky.bark();
```

in Dart

```dart
class Dog {
  String name;
  int age;

  Dog(this.name, this.age);

  void bark() {
    print('$name barks!');
  }
}

// extends works like JavaScript: one parent, members inherited
class SmallDog extends Dog {
  // super parameters forward straight to the parent constructor.
  // Long form, same meaning: SmallDog(String name, int age) : super(name, age);
  SmallDog(super.name, super.age);

  // @override is optional, but the analyzer uses it to catch typos in the name
  @override
  void bark() {
    print('$name yaps!');
  }
}

void main() {
  var sparky = SmallDog('Sparky', 4);
  sparky.bark(); // Sparky yaps!
  print(sparky is Dog); // true — `is` is instanceof
}
```

Constructors are *not* inherited: `SmallDog` has to declare one that reaches `Dog`'s. Call the parent's version of an overridden method with `super.bark()`.

Dart allows only one `extends`, but a class can mix in any number of **mixins** — reusable bundles of methods and fields:

```dart
// Dog as defined above
mixin Fetcher {
  int ballsFetched = 0;

  void fetch() {
    ballsFetched++;
    print('fetched ball number $ballsFetched');
  }
}

class Retriever extends Dog with Fetcher {
  Retriever(super.name, super.age);
}

void main() {
  var goldie = Retriever('Goldie', 3);
  goldie.bark(); // from Dog
  goldie.fetch(); // from Fetcher
}
```

A mixin can't have a constructor and can't be instantiated on its own; `with` is how Dart gets the reuse of multiple inheritance without its ambiguity.

## Static Methods and Properties

In Javascript

```js
// Static properties/methods belong to the class, not the instance
class Calculator {
  static lastResult = 0;

  // a table of operator functions instead of eval()
  static operations = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
  };

  static calculate(num1, num2, operator) {
    Calculator.lastResult = Calculator.operations[operator](num1, num2);
    return Calculator.lastResult;
  }

  static showLastResult() {
    console.log(Calculator.lastResult);
  }
}

Calculator.calculate(2, 2, "+");
Calculator.showLastResult();
```

In Dart

```dart
class Calculator {
  // a static property belongs to the class, not to instances.
  // num is the parent type of int and double, so 4 / 2 (a double in Dart) fits too.
  static num lastResult = 0;

  // a static method. Dart has no eval; a switch *expression* picks the operation
  // and evaluates to a value. `_` is the default case.
  static num calculate(num a, num b, String op) {
    lastResult = switch (op) {
      '+' => a + b,
      '-' => a - b,
      '*' => a * b,
      '/' => a / b,
      _ => throw ArgumentError('Unknown operator: $op'),
    };
    return lastResult;
  }

  static void showLastResult() {
    print(lastResult);
  }
}

void main() {
  Calculator.calculate(2, 2, '+');
  Calculator.showLastResult(); // 4
  Calculator.calculate(9, 2, '/');
  Calculator.showLastResult(); // 4.5
}
```

Static members are reached through the class (`Calculator.lastResult`), never through an instance, and static methods have no `this`. Inside the class you can drop the prefix, as `calculate` does. For class-wide constants use `static const` (`static const maxDigits = 12;`). If a "static method" needs nothing from the class at all, Dart style prefers a plain top-level function.

---

## Resources to Learn More

- [Classes](https://dart.dev/language/classes) — instance variables, getters/setters, static members
- [Constructors](https://dart.dev/language/constructors) — initializing formals, named and `const` constructors, super parameters
- [Extend a class](https://dart.dev/language/extend) and [Mixins](https://dart.dev/language/mixins) — `extends`, `@override`, `super`, `with`
- [Primary constructors](https://dart.dev/language/primary-constructors) — the Dart 3.13 shorthand for fields + constructor

---
