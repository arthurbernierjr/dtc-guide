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

- In Go we define a struct (think data structure), and create an instance of the struct. (structs unlike classes can only have properties, no methods)

```go

type Person struct {}

func main(){
  AlexMerced := Person{}
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

- In Go we define the properties in the struct and the properties must be defined at instantiation. If you want a constructor like function that may preset certain properties then you just create a normal function that returns a new instance of the struct.

```go
package main

import "fmt"

type Person struct {
  name string
  age int
}

func main(){
  AlexMerced := Person{name: "Alex Merced", age: 35}
  fmt.Println(AlexMerced)
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

- In Go you just create normal functions but can define structs as receivers so they can be used like methods.

```Go

package main

import "fmt"

type Person struct {
  name string
  age int
}

// define a function that receives a person
func (p Person) teach(){
  fmt.Println(p.name + " teaches!")
}

func main(){
  AlexMerced := Person{name: "Alex Merced", age: 35}
  fmt.Println(AlexMerced)
  AlexMerced.teach()
}

```

Learn More:

- [GeekForGeeks Go OOP](https://www.geeksforgeeks.org/object-oriented-programming-in-golang/)
- [OOP in Goglang](https://medium.com/technofunnel/golang-object-oriented-programming-f2e6448b8f24)
