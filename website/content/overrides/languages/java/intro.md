---
title: "Java: intro to the language"
lede: "Java 25 LTS (any 17+ works): variables, input, conditionals, loops, ArrayLists, HashMaps and methods — each shown first in the JavaScript you know, then in Java."
updated_from: "the 2021 'Learning Your Second Language' lesson (Java 11 on Repl.it)"
verified: 2026-11-02
docs:
  - https://dev.java/learn/language-basics/
  - https://docs.oracle.com/en/java/javase/25/language/local-variable-type-inference.html
  - https://docs.oracle.com/en/java/javase/25/language/records.html
  - https://docs.oracle.com/en/java/javase/25/jshell/introduction-jshell.html
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Scanner.html
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html
  - https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/HashMap.html
  - https://openjdk.org/jeps/512
  - https://www.oracle.com/java/technologies/java-se-support-roadmap.html
  - https://nodejs.org/api/readline.html#promises-api
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 (the input example was fed stdin). The Java blocks were checked line by line against the JDK 25 language guide and API docs listed; there is no JDK on the build machine, so no Java was compiled or executed."
changes:
  - "Getting Started points at a current JDK (Java 25 LTS; 17 and 21 also work) with `java -version`, the `jshell` REPL and `java Main.java` single-file launch instead of a specific hosted editor."
  - "Bug fixed: the constant example set MY_CONSTANT to 1 while the JavaScript version used 5; the two now match. Local constants are shown with `final`, and `var` (Java 10+) is introduced for local variables."
  - "The Node input example uses the promise-based `node:readline/promises` API that Node ≥17 ships instead of the callback form; the Java Scanner example uses the current `nextLine()`/`Integer.parseInt` pattern."
  - "The conditionals block had broken indentation that hid the method body; re-indented, and the `==` vs `.equals()` trap for Strings is called out."
  - "Collections use the diamond operator (`new ArrayList<>()`), interface types (`List`, `Map`), camelCase names (`myList`, not `my_list`) and mention `List.of`/`Map.of`; the `Java` fence tags are lowercase `java`."
  - "Exercise function names follow Java's camelCase convention (`subNums`, `sayHello`); the dictionary exercise takes a `Map`. Resources now link dev.java and the JDK 25 docs rather than third-party sites and playlists."
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

Install a current JDK (Java Development Kit). Java 25 is the current long-term-support release (September 2025; the next LTS is 29 in 2027) and everything on this page also runs on Java 17 or 21. Download it from [oracle.com/java](https://www.oracle.com/java/technologies/downloads/) or the open-source builds at [jdk.java.net](https://jdk.java.net/), then confirm in a terminal:

```bash
java -version
```

Three ways to run Java today, from quickest to most "real":

- `jshell` — the REPL that ships with the JDK since Java 9. Type `int x = 5;` and `x * 2`, see the answers immediately, `/exit` to leave.
- `java Main.java` — since Java 11 the `java` launcher compiles and runs a single source file in one step. Perfect for today.
- `javac Main.java && java Main` — compile to a `.class` file, then run it. This is what build tools (Maven, Gradle) do for you in a Spring Boot project.

**WHY:** Java is compiled and statically typed. The compiler catches a large class of mistakes (wrong type, missing method, misspelled variable) before the program runs — the trade for the extra ceremony you'll notice compared with JavaScript.

If you'd rather not install anything yet, any browser-based Java runner works for today's exercises.

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

How we do this in Java

```java
class Main {

  // Class-wide constants are static final fields, named in ALL_CAPS by convention
  private static final int MY_CONSTANT = 5;

  public static void main(String[] args) {
    // Every variable has a type, written before the name
    String myVariable = "Hello World";
    // final makes a local variable single-assignment, like const
    final int answer = 42;

    System.out.println(MY_CONSTANT);
    System.out.println(myVariable + " " + answer);
  }
}
```

A few things to notice:

- Every Java program needs at least one class, and the entry point is `public static void main(String[] args)`. Save this as `Main.java` — the file name must match the public class.
- Since Java 10 you can write `var myVariable = "Hello World";` for local variables and let the compiler infer the type from the right-hand side. The type is still fixed; `var` only saves typing.
- Primitive types (`int`, `double`, `boolean`, `char`, `long`) hold values; everything else (`String`, your classes, collections) is an object reference. Java's `String` is immutable, like JavaScript's.
- Semicolons are required.

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

How would we do that in Java?

```java
import java.util.Scanner;  // Import the Scanner class from java.util

class Main {
  public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);  // wraps standard input
    System.out.print("Who are you? ");

    String userName = scanner.nextLine();  // read one line as a String
    System.out.println("Hey there " + userName + "!");

    System.out.print("How old are you? ");
    int age = Integer.parseInt(scanner.nextLine());  // convert text to a number
    System.out.println("Next year you'll be " + (age + 1));

    scanner.close();
  }
}
```

`nextLine()` always returns a `String`; convert with `Integer.parseInt` or `Double.parseDouble` when you need a number. (`Scanner` also has `nextInt()`, but it leaves the newline in the buffer, which trips up the next `nextLine()` — reading whole lines and parsing is the pattern that doesn't bite.)

Java 25 also finalized a shorter form for small programs: a file containing just `void main() { IO.println("Hello"); }` runs with `java Hello.java`, no class or `static` required. We keep the classic form on these pages because it is what Spring Boot projects use.

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

If statements in Java

```java
class Main {
  public static void main(String[] args) {
    int num = 5;

    // Same shape as JavaScript: parentheses around the condition, braces around the block
    if (num > 3) {
      System.out.println("num is greater than 3");
    } else if (num > 1) {
      System.out.println("num is greater than 1");
    } else {
      System.out.println("num is 1 or less");
    }
  }
}
```

The syntax is nearly identical, with two differences that matter:

- The condition must be a real `boolean`. `if (num)` is a compile error in Java — there is no truthy/falsy.
- `==` compares primitives by value but objects by identity. Compare Strings with `.equals()`: `name.equals("Arthur")`, never `name == "Arthur"`.

`&&`, `||`, `!`, `!=`, `<=`, `>=` and the ternary `a ? b : c` all work as in JavaScript. There is no `===` because `==` never coerces types.

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

In Java

```java
class Main {
  public static void main(String[] args) {
    int counter = 0;

    // this will loop 10 times
    while (counter < 10) {
      System.out.println(counter);
      counter += 1;  // counter++ also works
    }
  }
}
```

The classic `for` loop is identical to JavaScript's, and the enhanced `for` (Java's `for…of`) walks any array or collection:

```java
for (int i = 0; i < 10; i++) {
  System.out.println(i);
}

int[] scores = {90, 85, 72};
for (int score : scores) {
  System.out.println(score);
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

In Java we can use ArrayLists and HashMaps

```java
import java.util.ArrayList; // a resizable list, the everyday replacement for a JS array
import java.util.HashMap;   // key/value pairs, the everyday replacement for a JS object
import java.util.List;
import java.util.Map;

class Main {
  public static void main(String[] args) {

    // Declare with the interface type (List), construct the implementation (ArrayList).
    // The <> "diamond" infers the element type from the left-hand side.
    List<Integer> myList = new ArrayList<>();

    // Add elements to the list
    myList.add(1);
    myList.add(2);
    myList.add(3);

    System.out.println(myList);        // printing the whole list: [1, 2, 3]
    System.out.println(myList.get(0)); // printing an individual item
    System.out.println(myList.size()); // length

    // A map from String keys to String values
    Map<String, String> myMap = new HashMap<>();

    // Add entries to the map
    myMap.put("cheese", "gouda");
    myMap.put("bread", "rye");

    System.out.println(myMap);               // printing the whole map
    System.out.println(myMap.get("cheese")); // one value; a missing key returns null
    System.out.println(myMap.containsKey("jam")); // false
  }
}
```

Collections hold objects, not primitives, so the element type is `Integer` (the wrapper class), not `int`; Java boxes and unboxes for you when you `add(1)` or `get(0)`. There is no dot access for map keys (`myMap.cheese` is a compile error) — `get` and `put` only.

Plain arrays exist too (`int[] nums = {1, 2, 3};`) but they are fixed-length. For a quick immutable list or map use `List.of(1, 2, 3)` and `Map.of("cheese", "gouda")` (Java 9+).

## 10 Minute Exercise

Look up the [ArrayList methods](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html) and apply them to the following list.

```java
List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10));
```

- How to find a list's length (`size()`)
- How to loop over a list (`for (int n : numbers)`)
- How to add and remove items from a list (`add`, `add(index, item)`, `remove(index)`, `remove(Integer.valueOf(7))`)

## Functions

in Javascript

```js
const addNums = (x, y) => {
  return x + y;
};

console.log(addNums(5, 5));
```

In Java

```java
class Main {

  // A function is a method on a class; static means it belongs to the class, not an instance.
  // The return type (int) comes before the name, and every parameter has a type.
  public static int addNums(int x, int y) {
    return x + y;
  }

  // void = returns nothing
  public static void sayHello(String name) {
    System.out.println("Hello " + name);
  }

  public static void main(String[] args) {
    // Using the methods
    System.out.println(addNums(5, 5));
    sayHello("Arthur");
  }
}
```

There are no standalone functions in Java — every method lives in a class — and no default parameter values. Instead Java lets you **overload**: define `addNums(int, int)` and `addNums(double, double)` side by side and the compiler picks by argument types. Java's arrow functions are lambdas, `(x, y) -> x + y`, used mostly as arguments to collection methods such as `forEach`, `sort` and `stream().map`.

## 10 minute exercise

Write the following methods (Java names are camelCase):

- `subNums` that takes two arguments and returns their difference
- `sayHello` that takes a name as an argument and says hello to that name
- `sayHelloAdv` that takes a `Map<String, String>` with a `name` and `age` key and prints "hello {name}, how does it feel to be {age} years old"
- `looper` takes one `List<Integer>` as an argument, loops over the list and prints each item individually

---

## Resources to Learn More

- [Java Language Basics on dev.java](https://dev.java/learn/language-basics/) — Oracle's current tutorial: variables, `var`, operators, control flow, switch expressions
- [Java Language Updates (JDK 25)](https://docs.oracle.com/en/java/javase/25/language/local-variable-type-inference.html) — `var`, records, text blocks, switch expressions and pattern matching since Java 9
- [Java SE 25 API documentation](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html) — `ArrayList`, `HashMap`, `Scanner`, `String` and the rest of `java.base`
- [JShell user guide](https://docs.oracle.com/en/java/javase/25/jshell/introduction-jshell.html) — the REPL

---
