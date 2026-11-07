---
title: "Rust: intro to the language"
lede: "Rust 1.99.1 (any 1.85+ works): variables, input, conditionals, loops, vectors, hash maps and functions — each shown first in the JavaScript you know, then in Rust."
updated_from: "the 2021 'Learning Your Second Language' lesson"
verified: 2026-11-02
docs:
  - https://doc.rust-lang.org/book/ch01-01-installation.html
  - https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html
  - https://doc.rust-lang.org/book/ch03-05-control-flow.html
  - https://doc.rust-lang.org/book/ch03-03-how-functions-work.html
  - https://doc.rust-lang.org/book/ch02-00-guessing-game-tutorial.html
  - https://doc.rust-lang.org/book/ch08-01-vectors.html
  - https://doc.rust-lang.org/book/ch08-03-hash-maps.html
  - https://doc.rust-lang.org/std/io/struct.Stdin.html
  - https://doc.rust-lang.org/std/collections/struct.HashMap.html
  - https://nodejs.org/api/readline.html#promises-api
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 (the readline example was fed stdin). The Rust blocks were checked line by line against the Rust Book chapters and std docs listed; there is no rustc/cargo on the build machine, so no Rust was compiled or executed."
changes:
  - "Getting Started installs Rust 1.99.1 with rustup and uses `cargo new` / `cargo run` (plus the official Playground) instead of a hosted REPL."
  - "Bug fixed: the conditional example had `lse if`, which does not compile; it is `else if`."
  - "Bug fixed: `stdin().read_line(...)` ignored the `Result` it returns (a compiler warning) and printed the trailing newline; it now uses `.expect()` and `.trim()` as the Book does."
  - "The comment 'by default values are constant' was wrong: Rust variables are immutable by default and `const` is a separate thing. The variables section says so and shows both."
  - "Dropped the needless `.to_string()` inside every `println!` and used inline format arguments (`{name}`), available since Rust 1.58."
  - "The Node input example uses the promise-based `node:readline/promises` API that Node ≥17 ships, instead of the callback form."
  - "The exercise list was fenced as Python; it is a Rust `vec!` now. Resources link the Rust Book and std docs instead of third-party sites."
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

Install Rust with `rustup`, the official installer, from [rustup.rs](https://rustup.rs/). It gives you the compiler (`rustc`), the package manager and build tool (`cargo`) and keeps them updated. Current stable is 1.99.1; anything from 1.85 up runs everything on this page.

```bash
rustc --version
cargo new hello_rust
cd hello_rust
cargo run
```

`cargo new` makes a folder with a `Cargo.toml` (Rust's `package.json`) and a `src/main.rs` whose `fn main()` is the program's entry point. `cargo run` compiles and runs it. Unlike JavaScript, Rust is compiled: typos are reported before anything runs, which is a feature once you get used to it.

If you'd rather not install anything yet, the official [Rust Playground](https://play.rust-lang.org/) runs every block on this page in the browser.

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

How we do this in Rust

```rust
fn main() {
    // Variables are immutable by default; the type is inferred (i32 here)
    let my_constant = 5;
    // `mut` makes a variable re-assignable; String::from builds an owned, growable string
    let mut my_variable = String::from("Hello World");

    // println! is a macro (the !). {} is a placeholder, and you can name the variable inside the braces
    println!("{}", my_constant);
    println!("{my_variable}");

    my_variable = String::from("Hello Rust");
    println!("{my_variable}");
}
```

Two things that trip up JavaScript developers:

- `let x = 5` is **immutable** — `x = 6` later is a compile error. Add `mut` when you intend to change it. A real `const` also exists (`const MAX_TURTLES: u32 = 10;`) but needs a type and a value known at compile time.
- Every value has a type. Rust usually infers it, and you can state it: `let count: i32 = 5;` (`i32` = 32-bit integer, `u32` = unsigned, `f64` = float, `bool`, `&str` / `String` = text).

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

How would we do that in Rust?

```rust
use std::io;

fn main() {
    // A mutable, empty String to read the line into
    let mut input = String::new();

    println!("Who are you?");

    // read_line returns a Result; expect() stops the program with that message if reading fails
    io::stdin()
        .read_line(&mut input)
        .expect("failed to read line");

    // the newline the user typed is still in the string, so trim it off
    println!("Hey there {}!", input.trim());
}
```

`&mut input` lends the string to `read_line` so it can write into it: that `&` is a *reference*, and the borrowing rules around it are the big idea you'll meet in chapter 4 of the Book. Input is always text; `input.trim().parse::<u32>()` turns it into a number (and returns a `Result`, because the user may have typed "banana").

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

If statements in Rust

```rust
fn main() {
    let num = 5;

    // no parentheses around the condition; the braces are required
    if num > 3 {
        println!("num is greater than 3");
    } else if num > 1 {
        println!("num is greater than 1");
    } else {
        println!("num is 1 or less");
    }

    // if is an expression, so it can produce a value (the JavaScript ternary)
    let parity = if num % 2 == 0 { "even" } else { "odd" };
    println!("{num} is {parity}");
}
```

The condition must be a real `bool` — `if num {}` is a compile error, there is no truthy/falsy. Operators are the familiar `==`, `!=`, `<`, `>=`, `&&`, `||`, `!`; there is no `===` because `==` never converts types.

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

In Rust

```rust
fn main() {
    let mut counter = 0;

    // this will loop 10 times (Rust has no ++, use += 1)
    while counter < 10 {
        println!("{counter}");
        counter += 1;
    }
}
```

The loop you'll write most is `for` over a range or a collection. `0..10` is 0 through 9; `0..=10` includes 10. `loop {}` runs forever until you `break`.

```rust
fn main() {
    for counter in 0..10 {
        println!("{counter}");
    }
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

In Rust we have vectors and hashmaps

```rust
// HashMap is in the standard library but not in scope by default
use std::collections::HashMap;

fn main() {
    // vec! builds a Vec<i32>: a growable array where every item has the same type
    let my_vector = vec![1, 2, 3];
    println!("{:?}", my_vector); // {:?} is the "debug" format, which can print whole collections
    println!("{}", my_vector[0]); // one item by index

    // HashMap<&str, &str>: keys and values are text here
    let mut my_hashmap = HashMap::new();
    my_hashmap.insert("cheese", "gouda");
    my_hashmap.insert("bread", "rye");
    println!("{:?}", my_hashmap); // whole map (order is not guaranteed)

    // get returns an Option: Some(&value) if the key exists, None if it doesn't
    println!("{:?}", my_hashmap.get("cheese"));

    // match makes you handle both cases; forgetting one is a compile error
    match my_hashmap.get("bread") {
        Some(value) => println!("The value of the bread is {value}"),
        None => println!("no bread in this hashmap"),
    }
}
```

There is no `undefined` in Rust. Anything that might be missing comes back as an `Option` (`Some(x)` or `None`) and anything that might fail comes back as a `Result` (`Ok(x)` or `Err(e)`); `match` is how you take them apart. A `Vec` must hold one type, so the JavaScript habit of mixing numbers and strings in one array becomes a struct or an enum (next lesson).

## 10 Minute Exercise

Look up the methods on [`Vec`](https://doc.rust-lang.org/std/vec/struct.Vec.html) in the standard library docs and apply them to the following list.

```rust
let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
```

- How to find a list's length (`len`)
- How to loop over a list (`for n in &numbers`)
- How to add and remove items from a list (`push`, `pop`, `insert`, `remove`) — the vector will need to be `mut`

## Functions

in Javascript

```js
const addNums = (x, y) => {
  return x + y;
};

console.log(addNums(5, 5));
```

In Rust

```rust
// parameters and the return type are always written out; -> i32 is the return type
fn add_nums(x: i32, y: i32) -> i32 {
    // the last expression without a semicolon is the return value
    x + y
}

fn main() {
    println!("{}", add_nums(5, 5));
}
```

`return x + y;` works too, but Rust code leans on the implicit return of the final expression. Closures are the arrow functions: `let add = |x: i32, y: i32| x + y;` and they are what you hand to `map`, `filter` and friends on iterators.

Functions are `snake_case`, types are `CamelCase`, constants are `SCREAMING_CASE` — the compiler warns when you stray.

## 10 minute exercise

Write the following functions

- `sub_nums` that takes two arguments and returns their difference
- `say_hello` that takes a name as an argument and says hello to that name
- `say_hello_adv` that takes a `HashMap` with a name and age property and prints "hello {name}, how does it feel to be {age} years old"
- `looper` takes one vector as an argument, loops over the vector and prints each item individually

---

## Resources to Learn More

- [The Rust Programming Language](https://doc.rust-lang.org/book/) — the official book; chapters 3 (variables, control flow, functions), 4 (ownership) and 8 (collections) cover this page
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) — the same ground as runnable snippets
- [Standard library docs](https://doc.rust-lang.org/std/) — `Vec`, `HashMap`, `String`, `Option`, `Result` and `std::io`

---
