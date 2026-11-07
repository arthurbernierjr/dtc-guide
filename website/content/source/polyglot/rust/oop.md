# OOP in New Language

---

## What you will learn

- How OOP is done in OOP-less languages like Go/Rust
- What are Structs
- How methods can be paired to structs

## OOP in an OOP-less world

In recent years a debate in the world of Object Oriented Programming has ensued, that is the debate over inheritance over composition.

- **Inheritance** You use base classes and other classes will inherit their base functionality from those classes. (Pig Inherits from Animal)

- **Composition** Instead you have several possible smaller non-hierarchal pieces of functionality (traits) that can be constructed in an object as needed. (A pig is made of traits like CanMakeSound, IsMammal, CanWalk, etc.)

In languages like Go & Rust they made the decision to not include inheritance in the language in favor of composition so OOP patterns end up looking quite different in these language.

## Creating a New Object

- In javascript we define a class then we can instantiate the class

```js
class Person {}

const AlexMerced = new Person();
```

- In Rust we define a struct (think data structure), and create an instance of the struct. (structs unlike classes can only have properties, no methods)

```rust

struct Person {}

fn main(){
  let alexmerced = Person{}
}

```

## Properties of the Object

- In Javascript we define properties in the constructor

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
}

const AlexMerced = new Person("Alex Merced", 35);

console.log(AlexMerced);
```

- In Rust we define the properties in the struct and the properties must be defined at instantiation. If you want a constructor like function that may preset certain properties then you just create a normal function that returns a new instance of the struct.

```rust
struct Person {
  name: String,
  age: u32
}

fn main(){
  let alexmerced = Person{name: String::from("Alex Merced"), age: 35};
  println!("{} {}", alexmerced.name, alexmerced.age);
}

```

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

const AlexMerced = new Person("Alex Merced", 35);

AlexMerced.teach();

console.log(AlexMerced);
```

- In Rust methods can be shared by many structs as traits that implemented on different structs.

```rust

// Define a New Struct
struct Person {
  name: String,
  age: u32
}

// Define a New Trait with a Bundle of Methods we Can implement
trait Teacher {
 //signature of function teach that returns nothing
 fn teach (&self);
}

//implement the SentientBeing trait for Person
impl Teacher for Person {
  //create Person version of teach function
  fn teach(&self){
    println!("{} Teaches!", self.name);
  }
}

fn main(){
  let alexmerced = Person{name: String::from("Alex Merced"), age: 35};
  println!("{} {}", alexmerced.name, alexmerced.age);
  alexmerced.teach();
}
```

Learn More:

- [Trait Documentation](https://doc.rust-lang.org/rust-by-example/trait.html)
- [OOP in Rust](https://stevedonovan.github.io/rust-gentle-intro/object-orientation.html)
- [OOP in Rust](https://medium.com/dev-genius/object-oriented-programming-in-rust-691baf4d2996)
