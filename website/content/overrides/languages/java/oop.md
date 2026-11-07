---
title: "Java: OOP"
lede: "Java 25 LTS (any 17+ works): classes, constructors, methods, inheritance and static members — the JavaScript version next to the Java version, plus the record and switch-expression syntax current Java code uses."
updated_from: "the 2021 'OOP in New Language' lesson (Java 11)"
verified: 2026-11-02
docs:
  - https://dev.java/learn/classes-objects/
  - https://docs.oracle.com/en/java/javase/25/language/records.html
  - https://docs.oracle.com/en/java/javase/21/language/switch-expressions-and-statements.html
  - https://docs.oracle.com/en/java/javase/25/language/local-variable-type-inference.html
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Override.html
  - https://openjdk.org/jeps/513
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 and printed what the comments say. The Java blocks were checked line by line against the dev.java classes tutorial, the JDK records and switch-expression guides and the java.base API docs; there is no JDK on the build machine, so no Java was compiled or executed."
changes:
  - "Bug fixed: the Java `calculate` was `void` while the JavaScript version returned the result; it now returns the `int` like its counterpart, and the `switch` statement with `break`s is a `switch` expression (Java 14+) with arrow labels, which cannot fall through."
  - "The JavaScript static-method example built an expression string and ran it through `eval()`. It now dispatches on a table of operator functions, which does the same job without executing arbitrary strings."
  - "Sparky is 4 in both languages (the Java blocks said 5). Fields are `private` with a `toString()` so printing a Dog shows its data instead of `Dog@1b6d3586`."
  - "Overridden methods carry `@Override`, so a typo in the method name is a compile error instead of a silent second method."
  - "Added the `record` pointer (Java 16+): one line replaces the constructor, accessors, `equals`, `hashCode` and `toString` for data-holding classes; the class-level constant (`static final`) is shown alongside the static method."
  - "Resources list dev.java and the JDK 25 language guides; the empty 2021 resources section is filled in."
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

Below you'll see JavaScript examples of object-oriented patterns and their Java counterparts. Java was built around classes from day one, so almost everything here will look familiar — the differences are types, access modifiers and the fact that every class lives in a file named after it.

## Creating and Instantiating a Class

In Javascript

```js
// Creating a Class
class Dog {}

// Instantiation
const Sparky = new Dog();
```

In Java

```java
class Main {
  public static void main(String[] args) {
    // instantiation: the variable's type is the class
    Dog sparky = new Dog();
  }
}

// define a new class (in a real project this goes in its own file, Dog.java)
class Dog {}
```

Convention: class names are `CapWords`, variables and methods are `camelCase` (so the instance is `sparky`, not `Sparky`). Only one class per file may be `public`, and the file must be named after it — which is why Java projects have many small files.

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

in Java

```java
class Main {
  public static void main(String[] args) {
    // instantiation
    Dog sparky = new Dog("Sparky", 4);
    // using the instance's bark method
    sparky.bark();
    System.out.println(sparky);  // calls toString()
  }
}

class Dog {

  // instance fields: declared with a type, private so only the class touches them
  private String name;
  private int age;

  // The constructor is a method with the class's name and no return type
  public Dog(String name, int age) {
    this.name = name;
    this.age = age;
  }

  // an instance method
  public void bark() {
    System.out.println(this.name + " barks");
  }

  // a getter: how the outside world reads a private field
  public String getName() {
    return this.name;
  }

  // what System.out.println and string concatenation use
  @Override
  public String toString() {
    return "Dog(name=" + name + ", age=" + age + ")";
  }
}
```

Where JavaScript fields are public by default, Java code marks them `private` and exposes **getters and setters** (`getName()`, `setAge(int)`). Frameworks like Spring and the JSON library it uses rely on that naming convention to read and write your objects, so it is worth the habit now.

Printing an object shows `Dog@1b6d3586` unless you override `toString()` (inherited from `Object`, the root of every Java class). `equals()` and `hashCode()` come from the same place.

For classes that are mostly data, Java 16+ has **records**: `record Dog(String name, int age) {}` generates the constructor, the accessors (`dog.name()`, `dog.age()`), `equals`, `hashCode` and `toString` in one line. The fields are final — a record is a value, not something you mutate.

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

in Java

```java
class Main {
  public static void main(String[] args) {
    // a SmallDog *is a* Dog, so it can be held in a Dog-typed variable
    Dog sparky = new SmallDog("Sparky", 4);
    // Java picks the most specific bark() at runtime: "Sparky yaps"
    sparky.bark();
    System.out.println(sparky instanceof SmallDog);  // true
  }
}

class Dog {

  // protected: visible to this class and its subclasses
  protected String name;
  protected int age;

  public Dog(String name, int age) {
    this.name = name;
    this.age = age;
  }

  public void bark() {
    System.out.println(this.name + " barks");
  }
}

// an inherited class
class SmallDog extends Dog {

  public SmallDog(String name, int age) {
    // super(...) calls the parent constructor (before Java 25 it had to be the first statement;
    // since 25 you may validate arguments above it, as long as you don't touch `this`)
    super(name, age);
  }

  // @Override asks the compiler to check that a parent method with this signature exists
  @Override
  public void bark() {
    System.out.println(this.name + " yaps");
  }
}
```

Three rules JavaScript doesn't enforce:

- A class extends exactly one parent. For "can do X" contracts shared across unrelated classes, Java uses `interface` (a class can implement many).
- If the subclass constructor doesn't call `super(...)`, Java inserts a call to the parent's no-argument constructor — and fails to compile if the parent doesn't have one.
- `private` fields are *not* visible in the subclass; that is why `Dog`'s fields are `protected` here. Mark a class `final` to forbid extending it.

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

In Java

```java
class Main {
  public static void main(String[] args) {
    Calculator.calculate(2, 2, "+");
    Calculator.showLastResult();          // 4
    System.out.println(Calculator.MAX);   // 1000000
  }
}

// Static properties/methods belong to the class, not the instance
class Calculator {

  // a static property: one copy, shared by every caller
  private static int lastResult = 0;

  // a class constant: static + final, ALL_CAPS by convention
  public static final int MAX = 1_000_000;

  // a static method. Java has no eval(), so dispatch on the operator with a switch
  // *expression* (Java 14+): arrow labels, no break, no fall-through, and it yields a value
  public static int calculate(int num1, int num2, String operator) {
    lastResult = switch (operator) {
      case "+" -> num1 + num2;
      case "-" -> num1 - num2;
      case "*" -> num1 * num2;
      case "/" -> num1 / num2;
      default -> throw new IllegalArgumentException("Unknown operator: " + operator);
    };
    return lastResult;
  }

  public static void showLastResult() {
    System.out.println(lastResult);
  }
}
```

`static` members are reached through the class name (`Calculator.calculate`), never through an instance, and a static method cannot touch instance fields or `this` — exactly as in JavaScript. `main` is static for that reason: it runs before any object exists.

Two Java-specific notes: `/` on two `int`s is integer division (`7 / 2` is `3`; make one operand a `double` for `3.5`), and a `switch` expression must cover every case, so the `default` branch is required here.

---

## Resources to Learn More

- [Classes and Objects on dev.java](https://dev.java/learn/classes-objects/) — constructors, methods, access control, nested classes, enums
- [Record Classes](https://docs.oracle.com/en/java/javase/25/language/records.html) — the JDK guide to records, compact constructors and when to use them
- [Switch Expressions](https://docs.oracle.com/en/java/javase/21/language/switch-expressions-and-statements.html) — arrow labels, `yield`, exhaustiveness
- [`java.lang.Object`](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html) — `toString`, `equals`, `hashCode`: the methods every class inherits

---
