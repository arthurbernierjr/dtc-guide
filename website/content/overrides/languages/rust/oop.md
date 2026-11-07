---
title: "Rust: OOP in an OOP-less world"
lede: "Rust 1.99.1 (any 1.85+ works): structs instead of classes, impl blocks instead of methods-in-the-class, and traits instead of inheritance — the JavaScript version next to the Rust version."
updated_from: "the 2021 'OOP in New Language' lesson"
verified: 2026-11-02
docs:
  - https://doc.rust-lang.org/book/ch05-01-defining-structs.html
  - https://doc.rust-lang.org/book/ch05-03-method-syntax.html
  - https://doc.rust-lang.org/book/ch10-02-traits.html
  - https://doc.rust-lang.org/book/ch18-00-oop.html
  - https://doc.rust-lang.org/book/ch18-01-what-is-oo.html
  - https://doc.rust-lang.org/rust-by-example/trait.html
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 and printed what the comments say. The Rust blocks were checked line by line against the Rust Book chapters listed (structs, method syntax, traits, the OOP chapter); there is no rustc/cargo on the build machine, so no Rust was compiled."
changes:
  - "Bug fixed: `let alexmerced = Person{}` was missing its semicolon and did not compile."
  - "The claim that 'structs can only have properties, no methods' was wrong. Rust attaches methods to a struct with an `impl` block; the page now shows that first (including a `new` constructor), then uses a trait for behaviour shared across types, which is what traits are for."
  - "Added `#[derive(Debug)]` so the struct can be printed with `{:?}`, the way `console.log` prints the JavaScript object."
  - "Added a second type implementing the same trait and a function that accepts `&impl Teacher`, to make the composition point concrete."
  - "Example person renamed; third-party blog links replaced with the Rust Book's struct, trait and OOP chapters."
---

# OOP in New Language

---

## What you will learn

- How OOP is done in OOP-less languages like Go/Rust
- What are Structs
- How methods can be paired to structs

## OOP in an OOP-less world

In recent years a debate in the world of Object Oriented Programming has ensued, that is the debate over inheritance versus composition.

- **Inheritance** You use base classes and other classes will inherit their base functionality from those classes. (Pig inherits from Animal)

- **Composition** Instead you have several possible smaller non-hierarchical pieces of functionality (traits) that can be combined in an object as needed. (A pig is made of traits like CanMakeSound, IsMammal, CanWalk, etc.)

In languages like Go & Rust they made the decision to not include inheritance in the language in favor of composition, so OOP patterns end up looking quite different in these languages. The Rust Book has a whole chapter on this: Rust has encapsulation (private fields, `pub` to expose) and polymorphism (traits), but no inheritance — data lives in structs, behaviour lives in `impl` blocks and traits.

## Creating a New Object

- In javascript we define a class then we can instantiate the class

```js
class Person {}

const arthur = new Person();

console.log(arthur);
```

- In Rust we define a struct (think data structure), and create an instance of the struct. No `new` keyword: writing the struct's name with braces builds one.

```rust
#[derive(Debug)] // lets println!("{:?}") print the struct
struct Person {}

fn main() {
    let arthur = Person {};
    println!("{:?}", arthur);
}
```

**WHY the `#[derive(Debug)]`:** Rust won't guess how to print your type. `derive` asks the compiler to write the `Debug` implementation for you, which is what `{:?}` uses. You'll add it to almost every struct you write.

## Properties of the Object

- In Javascript we define properties in the constructor

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

const arthur = new Person("Arthur", 35);

console.log(arthur);
```

- In Rust the properties (fields) and their types are declared in the struct, and every field must be filled in when you create an instance. There is no constructor syntax; the convention is an *associated function* called `new` inside an `impl` block that returns `Self`.

```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

impl Person {
    // no `self` parameter, so this is called on the type: Person::new(...)
    fn new(name: &str, age: u32) -> Self {
        Self { name: String::from(name), age } // `age` is shorthand for `age: age`
    }
}

fn main() {
    // build one by hand: every field, in any order
    let arthur = Person { name: String::from("Arthur"), age: 35 };
    println!("{} {}", arthur.name, arthur.age);

    // or through the constructor
    let arthur2 = Person::new("Arthur", 35);
    println!("{:?}", arthur2);
}
```

Fields are private to the module they're declared in; put `pub` in front of a field (or the struct) to use it from another file. Fields are also immutable unless the whole binding is `let mut`.

## Adding Methods

- In Javascript you could just define methods within the class

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  teach() {
    console.log(`${this.name} teaches code`);
  }
}

const arthur = new Person("Arthur", 35);

arthur.teach();

console.log(arthur);
```

- In Rust methods go in the `impl` block. The first parameter is `&self` (a borrow of the instance — `this`), `&mut self` if the method changes it, or `self` if it consumes it.

```rust
#[derive(Debug)]
struct Person {
    name: String,
    age: u32,
}

impl Person {
    fn new(name: &str, age: u32) -> Self {
        Self { name: String::from(name), age }
    }

    // &self: read-only access to the instance (use &mut self when the method changes it)
    fn teach(&self) {
        println!("{} teaches code", self.name);
    }
}

fn main() {
    let arthur = Person::new("Arthur", 35);
    arthur.teach();
    println!("{:?}", arthur);
}
```

#### Sharing behaviour with traits

Without inheritance, how do two unrelated types share a method? A **trait** is a bundle of method signatures (think interface, or a JavaScript mixin with the compiler checking it) that any struct can implement. Anything implementing the trait can be passed to a function that asks for it: that's composition.

```rust
struct Person {
    name: String,
}

struct Robot {
    model: String,
}

// a trait is a bundle of method signatures: anything that implements Teacher can teach()
trait Teacher {
    fn teach(&self);
}

impl Teacher for Person {
    fn teach(&self) {
        println!("{} teaches!", self.name);
    }
}

impl Teacher for Robot {
    fn teach(&self) {
        println!("Unit {} teaches!", self.model);
    }
}

// accepts a reference to anything that implements Teacher
fn start_class(teacher: &impl Teacher) {
    teacher.teach();
}

fn main() {
    let arthur = Person { name: String::from("Arthur") };
    let bot = Robot { model: String::from("RX-7") };
    start_class(&arthur);
    start_class(&bot);
}
```

Forgetting `teach` in one of the `impl` blocks is a compile error. `Debug`, `Clone` and the `Serialize`/`Deserialize` you'll use for JSON in the next lessons are traits too — `#[derive(...)]` is the compiler implementing them for you.

Learn More:

- [Defining and Instantiating Structs](https://doc.rust-lang.org/book/ch05-01-defining-structs.html) and [Method Syntax](https://doc.rust-lang.org/book/ch05-03-method-syntax.html) — the Rust Book on structs and `impl`
- [Traits: Defining Shared Behavior](https://doc.rust-lang.org/book/ch10-02-traits.html) — required methods, default methods, `impl Trait` parameters
- [Object-Oriented Programming Features of Rust](https://doc.rust-lang.org/book/ch18-00-oop.html) — what Rust has instead of inheritance
