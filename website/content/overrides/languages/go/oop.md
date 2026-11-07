---
title: "Go: OOP in an OOP-less world"
lede: "Go 1.27 (any 1.18+ works): structs, struct literals, methods with receivers, constructor functions, embedding and interfaces — the JavaScript class next to the Go version."
updated_from: "the 2021 'OOP in New Language' lesson (Go 1.16)"
verified: 2026-11-02
docs:
  - https://go.dev/tour/moretypes/2
  - https://go.dev/tour/methods/1
  - https://go.dev/tour/methods/4
  - https://go.dev/tour/methods/9
  - https://go.dev/ref/spec#Struct_types
  - https://go.dev/ref/spec#Method_declarations
  - https://go.dev/ref/spec#Exported_identifiers
  - https://go.dev/doc/effective_go#embedding
  - https://pkg.go.dev/fmt
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13. The Go blocks were checked line by line against the Go 1.27 spec sections, A Tour of Go pages and Effective Go listed above; there is no Go toolchain on the build machine, so no Go was executed."
changes:
  - "Bug fixed: the first Go example declared `AlexMerced := Person{}` and never used it, which is a compile error in Go ('declared and not used'); every Go block is now a complete program that compiles as written."
  - "Struct fields are exported (`Name`, `Age`) and the uppercase-means-exported rule is explained, because it is what makes JSON encoding work in the chi lessons that follow."
  - "Added the constructor-function convention (`NewPerson`), pointer receivers for methods that change the struct, and a short section on embedding and interfaces — the two things Go actually uses instead of inheritance."
  - "Code fence `Go` normalised to `go`, Go code formatted the way `gofmt` would, and the resources link the Tour and Effective Go instead of third-party blog posts."
---

# OOP in New Language

---

## What you will learn

- How OOP is done in OOP-less languages like Go/Rust
- What are Structs
- How methods can be paired to structs

## OOP in an OOP-less world

In recent years a debate in the world of Object Oriented Programming has ensued, that is the debate over inheritance versus composition.

- **Inheritance** You use base classes and other classes inherit their base functionality from those classes. (Pig inherits from Animal)

- **Composition** Instead you have several possible smaller non-hierarchical pieces of functionality (traits) that can be assembled into an object as needed. (A pig is made of traits like CanMakeSound, IsMammal, CanWalk, etc.)

In languages like Go and Rust the designers decided not to include inheritance in the language in favor of composition, so OOP patterns end up looking quite different. Go has no `class`, no `extends` and no `this`; it has **structs** (data), **methods** (functions attached to a type), **embedding** (composition) and **interfaces** (behaviour contracts).

## Creating a New Object

- In javascript we define a class then we can instantiate the class

```js
class Person {}

const arthur = new Person()
console.log(arthur)
```

- In Go we define a struct (think data structure), and create an instance of it with a struct literal. A struct only holds fields; methods are declared separately (next section).

```go
package main

import "fmt"

type Person struct{}

func main() {
	arthur := Person{} // a struct literal; no new keyword needed
	fmt.Println(arthur)
}
```

**WHY:** Go refuses to compile a variable you declare and never use, so even the smallest example has to print or return what it creates. The compiler is doing a code review for you.

## Properties of the Object

- In Javascript we define properties in the constructor

```js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
}

const arthur = new Person("Arthur", 35)

console.log(arthur)
```

- In Go we define the fields, with their types, in the struct, and set them in the struct literal. Any field you leave out gets its **zero value** (`""` for strings, `0` for numbers, `false` for bools).

```go
package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

func main() {
	arthur := Person{Name: "Arthur", Age: 35}
	fmt.Printf("%+v\n", arthur) // {Name:Arthur Age:35}
	fmt.Println(arthur.Name)    // dot access, same as JS
}
```

The capital letters are not a style choice. In Go an identifier that starts with an uppercase letter is **exported** — visible outside its package. `Name` can be read by other packages (and by the JSON encoder you'll use in the chi lessons); `name` could not.

There is no constructor keyword. When you want one — to validate or preset fields — write a plain function that returns the struct, named `New` + the type by convention: `func NewPerson(name string, age int) Person { return Person{Name: name, Age: age} }`, called as `arthur := NewPerson("Arthur", 35)`.

## Adding Methods

- In Javascript you could just define methods within the class

```js
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  teach() {
    console.log(`${this.name} teaches code`)
  }
}

const arthur = new Person("Arthur", 35)

arthur.teach()

console.log(arthur)
```

- In Go you write normal functions and give them a **receiver** — the `(p Person)` before the name — which attaches the function to the type so it can be called like a method. Inside the method, `p` plays the role of `this`.

```go
package main

import "fmt"

type Person struct {
	Name string
	Age  int
}

// (p Person) is the receiver: Teach is now a method on Person
func (p Person) Teach() {
	fmt.Println(p.Name + " teaches code")
}

// a pointer receiver (*Person) lets the method change the original struct
func (p *Person) Birthday() {
	p.Age++
}

func main() {
	arthur := Person{Name: "Arthur", Age: 35}
	arthur.Teach()
	arthur.Birthday() // Go takes &arthur for you when the receiver is a pointer
	fmt.Println(arthur) // {Arthur 36}
}
```

A value receiver `(p Person)` gets a **copy** of the struct — fine for reading, useless for changing. A pointer receiver `(p *Person)` gets the original; the Tour's rule of thumb is that if one method needs a pointer receiver, give them all one.

#### Composition instead of inheritance

Where JavaScript reaches for `extends`, Go has **embedding** (put one struct inside another and its fields and methods are promoted, so `t.Teach()` works though `Teach` is declared on `Person`) and **interfaces** (a list of methods; any type that has them satisfies the interface automatically, no `implements` keyword).

```go
package main

import "fmt"

type Person struct {
	Name string
}

func (p Person) Teach() { fmt.Println(p.Name + " teaches") }

// Teacher embeds Person: it *has* a Person and borrows its methods
type Teacher struct {
	Person
	Subject string
}

type Educator interface { // anything with a Teach method
	Teach()
}

func main() {
	t := Teacher{Person: Person{Name: "Arthur"}, Subject: "Go"}
	t.Teach() // promoted from the embedded Person

	var e Educator = t // Teacher satisfies Educator because it has Teach()
	e.Teach()
}
```

Small interfaces like `Educator` are how Go stays flexible without a class hierarchy — the "traits" side of the debate at the top of this page, built into the language.

Learn More:

- [A Tour of Go — Methods and interfaces](https://go.dev/tour/methods/1) — receivers, pointer receivers, interfaces
- [Effective Go — Embedding](https://go.dev/doc/effective_go#embedding) and the spec on [Struct types](https://go.dev/ref/spec#Struct_types) and [Method declarations](https://go.dev/ref/spec#Method_declarations)
