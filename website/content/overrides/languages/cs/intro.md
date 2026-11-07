---
title: "C#: intro to the language"
lede: "C# 14 on .NET 10 (anything from .NET 8 up runs every block here): variables, input, conditionals, loops, lists, dictionaries and functions — each shown first in the JavaScript you know, then in C#."
updated_from: "the 2021 'Learning Your Second Language' lesson (C# 9 / .NET 5, Repl.it)"
verified: 2026-11-02
docs:
  - https://learn.microsoft.com/dotnet/csharp/tour-of-csharp/overview
  - https://learn.microsoft.com/dotnet/csharp/fundamentals/program-structure/top-level-statements
  - https://learn.microsoft.com/dotnet/core/sdk/file-based-apps
  - https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/nullable-reference-types
  - https://learn.microsoft.com/dotnet/csharp/language-reference/operators/collection-expressions
  - https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/local-functions
  - https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1
  - https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2
  - https://learn.microsoft.com/dotnet/api/system.console.readline
  - https://nodejs.org/api/readline.html#promises-api
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 (the readline example was fed stdin). The C# blocks were checked line by line against the .NET 10 / C# 14 docs listed above; there is no .NET SDK on the build machine, so none of them was compiled or executed."
changes:
  - "Getting Started points at the .NET 10 SDK download and `dotnet new console` / `dotnet run hello.cs` instead of a specific hosted editor (Repl.it)."
  - "Every C# block is written as top-level statements (C# 9+, the default in every .NET template since .NET 6), so the `class MainClass { public static void Main }` wrapper and the `using System;` line are gone."
  - "`ArrayList` and `Hashtable` (non-generic, pre-2005 collections) are replaced by `List<T>` and `Dictionary<TKey, TValue>`, created with C# 12 collection expressions and the index initializer."
  - "`Console.ReadLine()` is shown returning `string?`, which is what it does with nullable reference types on (the default in new projects)."
  - "The Node input example uses the promise-based `node:readline/promises` API that Node ≥17 ships, instead of the callback form."
  - "Bug fixes: the Conditionals block had no `using System;` yet called `Console`, and would not have compiled in a classic project; the 'divisble' typo is fixed; the list exercise block is fenced as C#, not Python."
  - "Resources now link the official C# tour and API docs rather than a third-party tutorial site and a YouTube playlist."
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

Install the current .NET SDK from [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download) (.NET 10 as of this writing, the long-term-support release; .NET 8 and up runs everything on this page). Then open a terminal and create a console project:

```bash
dotnet --version          # 10.0.x
dotnet new console -o hello
cd hello
dotnet run                # Hello, World!
```

`Program.cs` is a single line — `Console.WriteLine("Hello, World!");` — because modern C# lets you write **top-level statements**: no class, no `Main` method, just code. The template also turns on *implicit usings*, so `Console` and `List<T>` work without `using System;` at the top (add that line if a tool you paste into complains).

To try a snippet without a project, save it as `hello.cs` and run `dotnet run hello.cs`. For an editor: VS Code with the [C# Dev Kit](https://code.visualstudio.com/docs/csharp/get-started) extension.

## Creating Variables

How we did it in Javascript

```js
// We create constant variables with the const keyword
const myConstant = 5;
// We create re-assignable variables with the let keyword
let myVariable = "Hello World";

// We Printed Variables to the console using console.log
console.log(myConstant);
console.log(myVariable);
```

How we do this in C#

```cs
// Every variable has a type, written before its name
const int MyConstant = 5;
string myVariable = "Hello World";

// var lets the compiler work the type out from the right-hand side (still static)
var myNumber = 42;

// Console.WriteLine prints a line; $"..." interpolates like a JS template string
Console.WriteLine(MyConstant);
Console.WriteLine($"{myVariable} {myNumber}");
```

**WHY:** C# is statically typed — `myVariable = 5;` is a compile error because `myVariable` is a `string`. `const` is only for values known at compile time (numbers, strings, booleans).

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

How would we do that in C#?

```cs
// Console.Write prints without a newline, so the cursor waits on the same line
Console.Write("What is your name? ");

// ReadLine returns string? — null if the input stream is closed
string? input = Console.ReadLine();

Console.WriteLine($"Hey there {input}");
```

`ReadLine()` always gives you a string. If you want a number, convert it: `int.Parse(text)`, or `int.TryParse(text, out int age)`, which returns `false` instead of throwing on bad input. The `?` in `string?` is C#'s nullable marker: the value may be `null`, and the compiler warns if you treat it as though it can't be.

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

If statements in C#

```cs
int num = 5;

if (num > 3)
{
    Console.WriteLine("num is greater than 3");
}
else if (num > 1)
{
    Console.WriteLine("num is greater than 1");
}
else
{
    Console.WriteLine("num is 1 or less");
}
```

Same keywords, same operators: `==`, `!=`, `<`, `>=`, `&&`, `||`, `!`. Two differences: the condition must be a real `bool` (`if (num)` does not compile — no truthy/falsy), and there is no `===` because `==` never coerces types.

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

In C#

```cs
int counter = 0;

// this will loop 10 times
while (counter < 10)
{
    Console.WriteLine(counter);
    counter += 1;   // counter++ works too
}
```

C# also has the `for` loop you know from JavaScript, and `foreach` for walking a collection:

```cs
for (int i = 0; i < 10; i++)
{
    Console.WriteLine(i);
}

foreach (string word in new[] { "a", "b", "c" })
{
    Console.WriteLine(word);
}
```

## 10 Minute Exercise

Write the code to do the following:

- Loop 10 times starting the counter at 0
- On each loop if the counter is even print "it's even"
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

In C# we use `List<T>` and `Dictionary<TKey, TValue>` (the `<T>` says what type goes inside)

```cs
// Create a new list of ints with a collection expression
List<int> myList = [1, 2, 3];

// Add and remove elements
myList.Add(4);
myList.Remove(2);

Console.WriteLine(myList);                    // prints the type name, not the items
Console.WriteLine(string.Join(", ", myList)); // 1, 3, 4
Console.WriteLine(myList[0]);                 // printing an individual item
Console.WriteLine(myList.Count);              // 3

// Create a new dictionary: string keys, string values
Dictionary<string, string> myObject = new()
{
    ["cheese"] = "gouda",
    ["bread"] = "rye",
};

Console.WriteLine(myObject["cheese"]);          // one value; a missing key throws KeyNotFoundException
Console.WriteLine(myObject.ContainsKey("jam")); // False

// TryGetValue looks up without throwing
if (myObject.TryGetValue("bread", out string? bread))
{
    Console.WriteLine(bread);                   // rye
}
```

There is no dot access for dictionary keys (`myObject.cheese` is a compile error) — square brackets or `TryGetValue` only. Everything in a `List<int>` must be an `int`; mixed bags are what classes (tomorrow) are for. Plain arrays (`int[] nums = [1, 2, 3];`) are fixed-length, so `List<T>` is the everyday choice. `ArrayList` and `Hashtable`, which the 2021 version used, are the pre-generics collections and are not used in new code.

## 10 Minute Exercise

Look up the [`List<T>` methods](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1#methods) and apply them to the following list.

```cs
List<int> numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
```

- How to find a list's length (`Count`)
- How to loop over a list (`foreach (int n in numbers)`)
- How to add and remove items from a list (`Add`, `Insert`, `Remove`, `RemoveAt`)

## Functions

in Javascript

```js
const addNums = (x, y) => {
  return x + y;
};

console.log(addNums(5, 5));
```

In C#

```cs
// use the function
Console.WriteLine(AddNums(5, 5));

// A function declared at the top level is a local function: return type, name, typed parameters
int AddNums(int x, int y)
{
    return x + y;
}
```

The return type comes first (`void` if nothing is returned), every parameter has a type, and names are `PascalCase`. A local function can be declared before or after the line that calls it. One-expression functions can use the arrow form, and parameters can have defaults and be passed by name:

```cs
string Greet(string name, string greeting = "Hello") => $"{greeting}, {name}!";

Console.WriteLine(Greet("Arthur"));                      // Hello, Arthur!
Console.WriteLine(Greet("Arthur", greeting: "Welcome")); // Welcome, Arthur!
```

C#'s lambda `(a, b) => a * b` is the arrow function stored in a variable (type `Func<int, int, int>`). Inside a class (tomorrow) the same function is a **method** with an access modifier: `public static int AddNums(int x, int y)`.

## 10 minute exercise

Write the following functions

- `SubNums` that takes two arguments and returns their difference
- `SayHello` that takes a name as an argument and says hello to that name
- `SayHelloAdv` that takes a `Dictionary<string, string>` with a name and age key and prints "hello {name}, how does it feel to be {age} years old"
- `Looper` takes one list as an argument, loops over the list and prints each item individually

---

## Resources to Learn More

- [A tour of the C# language](https://learn.microsoft.com/dotnet/csharp/tour-of-csharp/overview) — the official overview; its tutorials cover everything on this page
- [Top-level statements](https://learn.microsoft.com/dotnet/csharp/fundamentals/program-structure/top-level-statements) — why there is no `Main` in `Program.cs`
- [Collections](https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/collections) — `List<T>`, `Dictionary<TKey, TValue>`, arrays
- [Nullable reference types](https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/nullable-reference-types) — what `string?` means

---
