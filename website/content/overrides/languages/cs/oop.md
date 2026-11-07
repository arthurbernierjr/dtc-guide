---
title: "C#: OOP"
lede: "C# 14 on .NET 10 (anything from .NET 8 up works): classes, constructors, properties, methods, inheritance and static members — the JavaScript version next to the C# version."
updated_from: "the 2021 'OOP in New Language' lesson (C# 9 / .NET 5)"
verified: 2026-11-02
docs:
  - https://learn.microsoft.com/dotnet/csharp/fundamentals/object-oriented/
  - https://learn.microsoft.com/dotnet/csharp/fundamentals/types/classes
  - https://learn.microsoft.com/dotnet/csharp/fundamentals/object-oriented/inheritance
  - https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/constructors
  - https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/properties
  - https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members
  - https://learn.microsoft.com/dotnet/csharp/language-reference/operators/switch-expression
  - https://learn.microsoft.com/dotnet/csharp/fundamentals/types/records
  - https://learn.microsoft.com/dotnet/csharp/fundamentals/program-structure/top-level-statements
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 and printed what the comments say. The C# blocks were checked line by line against the C# 14 / .NET 10 docs listed above; there is no .NET SDK on the build machine, so none of them was compiled or executed."
changes:
  - "The `class MainClass { public static void Main }` wrapper is gone: every example is top-level statements with the class declarations after them, which is how `dotnet new console` lays a file out today."
  - "Fields `name`/`age` became auto-properties `Name`/`Age`, and methods are `PascalCase` (`Bark`, `Calculate`) per the .NET naming conventions — lowercase `bark()` reads as a JavaScript habit to a C# reviewer."
  - "The second C# block under 'The Constructor and Methods' was an unlabelled inheritance example; it now has its own 'Inheritance' section with a matching JavaScript block, as the lesson's 'What you will learn' promised."
  - "Bug fixed: `Calculator.calculate` was declared `void`, so unlike the JavaScript version it never returned the result. It returns the value now, and works in `double` so `5 / 2` is `2.5` rather than the truncated `2` integer division gives."
  - "The static-method example built an expression string and ran it through `eval()`. Both versions now dispatch on a table of operator functions (and the C# page shows the `switch` *expression* as the alternative), which does the same job without executing arbitrary strings."
  - "Added `ToString()` and the one-line `record` declaration, since that is what current C# uses for plain data classes."
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

Below you'll see JavaScript examples of object-oriented patterns and their C# counterparts. Each C# block is a complete `Program.cs`: the statements at the top run; the classes they use are declared underneath (top-level statements must come first).

## Creating and Instantiating a Class

In Javascript

```js
// Creating a Class
class Dog {}

// Instantiation
const Sparky = new Dog();
```

In C#

```cs
// Instantiating the class: the type on the left, new on the right
Dog sparky = new Dog();

// Creating a new class (declared after the statements that use it)
class Dog { }
```

Convention: classes, properties and methods are `PascalCase`; locals and parameters `camelCase`. The parentheses after `new Dog` are required even with nothing to pass.

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

in C#

```cs
// Instantiating the class
Dog sparky = new Dog("Sparky", 4);
// Using the instance Bark method
sparky.Bark();

// Creating a new class
class Dog
{
    // Properties: typed, PascalCase. { get; set; } makes them readable and writable from outside
    public string Name { get; set; }
    public int Age { get; set; }

    // The constructor is a method bearing the class's name, with no return type
    public Dog(string name, int age)
    {
        Name = name;   // `this.Name` works too; it is only needed when names clash
        Age = age;
    }

    // A method: access modifier, return type, PascalCase name
    public void Bark()
    {
        Console.WriteLine($"{Name} barks");
    }
}
```

**WHY** `public`: C# members are `private` unless you say otherwise — the opposite of JavaScript. Properties with `{ get; set; }` are the normal way to expose data; `{ get; }` alone makes one read-only after the constructor. Plain fields (`string name;`, what the 2021 original used) are for private state, usually named `_name`.

Printing an object shows its type name (`Dog`) unless you override `ToString()`:

```cs
public override string ToString() => $"Dog(Name={Name}, Age={Age})";
```

For classes that are mostly data, a **record** writes the constructor, properties, `ToString()` and value equality in one line: `public record Dog(string Name, int Age);`.

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
    console.log(`${this.name} yaps!`);
  }
}

// Instantiation
const Sparky = new SmallDog("Sparky", 4);
Sparky.bark();
```

in C#

```cs
// A SmallDog is a Dog, so it fits in a Dog-typed variable; the override still runs
Dog sparky = new SmallDog("Sparky", 4);
sparky.Bark(); // Sparky yaps!

// Creating a new class
class Dog
{
    public string Name { get; set; }
    public int Age { get; set; }

    public Dog(string name, int age)
    {
        Name = name;
        Age = age;
    }

    // virtual: subclasses are allowed to replace this method
    public virtual void Bark()
    {
        Console.WriteLine($"{Name} barks");
    }
}

// The colon is C#'s `extends`; base(...) calls the parent constructor
class SmallDog : Dog
{
    public SmallDog(string name, int age) : base(name, age) { }

    // override: replaces the parent's version
    public override void Bark()
    {
        Console.WriteLine($"{Name} yaps!");
    }
}
```

Two keywords JavaScript doesn't make you write: the parent marks a method `virtual` (may be replaced) and the child marks it `override` (is replacing it); leave either out and the compiler tells you. `protected` members are visible to the class and its subclasses only — the 2021 version needed it for the fields; public properties don't. A class inherits from exactly one parent; for more contracts, use interfaces (`class SmallDog : Dog, IComparable`).

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

In C#

```cs
Calculator.Calculate(2, 2, "+");
Calculator.ShowLastResult();                        // 4
Console.WriteLine(Calculator.Calculate(5, 2, "/")); // 2.5

// Static members belong to the class, not to the instance; a static class cannot be instantiated
static class Calculator
{
    // a static property; private set means only this class can change it
    public static double LastResult { get; private set; } = 0;

    // a table of operator functions instead of eval(); Func<double, double, double> = "takes two doubles, returns one"
    private static readonly Dictionary<string, Func<double, double, double>> Operations = new()
    {
        ["+"] = (a, b) => a + b,
        ["-"] = (a, b) => a - b,
        ["*"] = (a, b) => a * b,
        ["/"] = (a, b) => a / b,
    };

    public static double Calculate(double num1, double num2, string op)
    {
        LastResult = Operations[op](num1, num2);
        return LastResult;
    }

    public static void ShowLastResult()
    {
        Console.WriteLine(LastResult);
    }
}
```

C# has no `eval` (a good thing), but it has the `switch` **expression**, cousin of the `switch` statement the 2021 version used and the usual shape for a fixed set of cases:

```cs
public static double Calculate(double num1, double num2, string op) => op switch
{
    "+" => num1 + num2,
    "-" => num1 - num2,
    "*" => num1 * num2,
    "/" => num1 / num2,
    _ => throw new ArgumentException($"Unknown operator: {op}"),
};
```

**WHY** `double`: with `int` parameters `5 / 2` is `2` — integer division truncates in C#. (The original also declared `calculate` as `void`, so it stored the result but never returned it; the JavaScript version always did.)

---

## Resources to Learn More

- [Classes, structs and records](https://learn.microsoft.com/dotnet/csharp/fundamentals/object-oriented/) — the official overview; [C# classes](https://learn.microsoft.com/dotnet/csharp/fundamentals/types/classes) covers constructors, primary constructors and object initializers
- [Inheritance](https://learn.microsoft.com/dotnet/csharp/fundamentals/object-oriented/inheritance) — `virtual`, `override`, `abstract`, `sealed`, `base`
- [Properties](https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/properties) — auto-properties, `init`, `required`, computed getters
- [Records](https://learn.microsoft.com/dotnet/csharp/fundamentals/types/records) — one-line data classes with value equality
- [Static classes and members](https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members)

---
