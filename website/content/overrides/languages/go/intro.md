---
title: "Go: intro to the language"
lede: "Go 1.27 (any 1.22+ works): variables, input, conditionals, loops, slices, maps and functions — each shown first in the JavaScript you know, then in Go."
updated_from: "the 2021 'Learning Your Second Language' lesson (Go 1.16, Repl.it)"
verified: 2026-11-02
docs:
  - https://go.dev/dl/
  - https://go.dev/doc/install
  - https://go.dev/doc/tutorial/getting-started
  - https://go.dev/tour/basics/8
  - https://go.dev/tour/flowcontrol/3
  - https://go.dev/ref/spec#For_statements
  - https://go.dev/ref/spec#Slice_types
  - https://go.dev/ref/spec#Map_types
  - https://go.dev/doc/effective_go
  - https://pkg.go.dev/bufio
  - https://nodejs.org/api/readline.html#promises-api
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 (the input example was fed stdin). The Go blocks were checked line by line against the Go 1.27 language spec, A Tour of Go and the fmt/bufio package docs listed above; there is no Go toolchain on the build machine, so no Go was executed."
changes:
  - "Getting Started points at go.dev (current release 1.27.3) with `go mod init` + `go run .`, and at the official Go Playground, instead of Repl.it."
  - "Variables use Go's MixedCaps naming (`myConstant`, not `MY_CONST`) and show the `:=` short declaration next to `var`; the note that an unused variable is a compile error is new."
  - "The input example reads a whole line with `bufio.Scanner`; the original's `fmt.Scanln` stops at the first space, so 'Arthur Bernier' came back as 'Arthur'. The Node side uses the promise-based `node:readline/promises` API."
  - "The while loop is written as Go's `for counter < 10 { … }` instead of the odd `for ;counter < 10; {` form, and `for range 10` (Go 1.22+) is introduced."
  - "Collections add the things a JS developer trips on: `len`/`append`, `for … range`, and the fact that a missing map key returns the zero value instead of `undefined`."
  - "Code fences normalised (`golang` → `go`), Go code formatted the way `gofmt` would, and the resources now link go.dev rather than third-party tutorials."
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

Install the current Go from [go.dev/dl](https://go.dev/dl/) (1.27.3 as of this writing; anything from 1.22 up runs everything on this page), then confirm it in a terminal:

```bash
go version
```

Go programs live in a **module**. Make a folder, initialise a module in it, and run the code:

```bash
mkdir hello && cd hello
go mod init example/hello
go run .
```

`go run .` compiles and runs every `.go` file in the folder; `go build` produces a single binary you can copy anywhere. If you'd rather not install anything yet, the official [Go Playground](https://go.dev/play/) runs today's examples in the browser.

**WHY:** Go is compiled and statically typed. Mistakes JavaScript would only show you at runtime (a typo in a variable name, calling a function with the wrong number of arguments) stop the compile instead. It feels strict on day one and saves you hours by week two.

## Creating Variables

How we did it in Javascript

```js
// We create constant variables with the const keyword
const myConstant = 5
// We create re-assignable variables with the let keyword
let myVariable = "Hello World"

// We print variables to the console using console.log
console.log(myConstant)
console.log(myVariable)
```

How we do this in Go

```go
package main

import "fmt" // fmt has Println for printing to the console

// Constants use the const keyword; Go style is mixedCaps, not ALL_CAPS
const myConstant = 5

// Variables use the var keyword. The type can be written out...
var myVariable string = "Hello World"

func main() {
	// ...or inferred with := (the short declaration, only allowed inside functions)
	myOther := "inferred as a string"

	fmt.Println(myConstant)
	fmt.Println(myVariable)
	fmt.Println(myOther)
}
```

Every Go file starts with a `package` line, imports what it uses, and the `main` function of package `main` is where the program starts. Two rules that will bite you early: an **unused variable or import is a compile error**, and a variable's type never changes after it is declared (`myVariable = 5` will not compile).

### Receiving Input

In JavaScript in the browser, input comes from forms or `prompt`. In Node, reading from the terminal goes through the `readline` module; the promise-based version reads cleanly with `await`:

```js
// Node: ask a question in the terminal and wait for the answer
import readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

const rl = readline.createInterface({ input, output })
const name = await rl.question("Who are you? ")
console.log(`Hey there ${name}!`)
rl.close()
```

How would we do that in Go?

```go
package main

import (
	"bufio"
	"fmt"
	"os"
)

func main() {
	fmt.Print("Who are you? ")

	// a Scanner reads os.Stdin one line at a time
	scanner := bufio.NewScanner(os.Stdin)
	scanner.Scan()         // blocks until the user presses Enter
	name := scanner.Text() // the line that was typed, without the newline

	fmt.Println("Hey there " + name + "!")
}
```

You will also see `fmt.Scanln(&name)` in older tutorials. It works, but it stops at the first space, so "Arthur Bernier" comes back as "Arthur". `bufio.Scanner` reads the whole line. Either way the result is a string; convert with `strconv.Atoi(text)` when you need a number.

## Conditionals

If statements in Javascript

```js
const num = 5

if (num > 3) {
  console.log("num is greater than 3")
} else if (num > 1) {
  console.log("num is greater than 1")
} else {
  console.log("num is 1 or less")
}
```

If statements in Go

```go
package main

import "fmt"

func main() {
	num := 5 // type is inferred as int

	// no parentheses around the condition; the braces are required
	if num > 3 {
		fmt.Println("num is greater than 3")
	} else if num > 1 {
		fmt.Println("num is greater than 1")
	} else {
		fmt.Println("num is 1 or less")
	}
}
```

Three differences from JavaScript: no parentheses, braces are never optional, and `else` must sit on the same line as the closing `}` (a line break there is a syntax error because Go inserts semicolons at line ends). `&&`, `||` and `!` are the same; there is only `==` because Go never coerces types.

## While Loops

In Javascript

```js
let counter = 0

// This will loop 10 times
while (counter < 10) {
  console.log(counter)
  counter += 1
}
```

In Go

```go
package main

import "fmt"

func main() {
	counter := 0

	// Go has no while keyword: a for loop with only a condition is the while loop
	for counter < 10 {
		fmt.Println(counter)
		counter++
	}
}
```

`for` is Go's only loop. The three-clause form is the one you know from JavaScript, and since Go 1.22 you can range over a number directly:

```go
for i := 0; i < 10; i++ {
	fmt.Println(i)
}

for i := range 10 { // 0 through 9
	fmt.Println(i)
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
const myArray = [1, 2, 3]

console.log(myArray) // logging the entire array
console.log(myArray[0]) // logging an individual item

const myObject = {
  cheese: "gouda",
  bread: "rye",
}

console.log(myObject) // logging the entire object
console.log(myObject.cheese) // logging a property using dot notation
console.log(myObject["bread"]) // logging a property using square bracket notation
```

In Go we use slices and maps

```go
package main

import "fmt"

func main() {
	mySlice := []int{1, 2, 3} // a slice: a growable list where every item has the same type

	fmt.Println(mySlice)      // [1 2 3]
	fmt.Println(mySlice[0])   // 1
	fmt.Println(len(mySlice)) // 3

	mySlice = append(mySlice, 4) // append returns the grown slice; keep the result

	// range gives you the index and the value; _ throws the index away
	for _, item := range mySlice {
		fmt.Println(item)
	}

	// a map: keys and values are typed (string keys, string values here)
	myMap := map[string]string{
		"cheese": "gouda",
		"bread":  "rye",
	}

	fmt.Println(myMap)           // map[bread:rye cheese:gouda]
	fmt.Println(myMap["cheese"]) // gouda — square brackets only, there is no dot access
	fmt.Println(myMap["jam"])    // "" — a missing key returns the zero value, not undefined
}
```

Go also has arrays (`[3]int`, fixed length, rarely used directly) — a slice is a window onto one. For "is this key present?" use the two-value form: `value, ok := myMap["jam"]`.

## 10 Minute Exercise

Look up slices in [A Tour of Go](https://go.dev/tour/moretypes/7) and the `slices` package on [pkg.go.dev](https://pkg.go.dev/slices), and apply what you find to the following list.

```go
[]int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
```

- How to find a list's length (`len`)
- How to loop over a list (`for i, v := range list`)
- How to add and remove items from a list (`append`, `slices.Delete`, or re-slicing with `list[1:]`)

## Functions

in Javascript

```js
const addNums = (x, y) => {
  return x + y
}

console.log(addNums(5, 5))
```

In Go

```go
package main

import "fmt"

// parameters and the return value are typed; x, y int means both are ints
func addNums(x, y int) int {
	return x + y
}

func main() {
	fmt.Println(addNums(5, 5))
}
```

The pattern you'll see everywhere in Go code is a function that returns **two values**, the result and an error, and a caller that checks the error before using the result:

```go
package main

import (
	"fmt"
	"strconv"
)

func main() {
	n, err := strconv.Atoi("42") // (int, error)
	if err != nil {
		fmt.Println("not a number:", err)
		return
	}
	fmt.Println(n + 1)
}
```

There are no exceptions to catch; errors are ordinary values you return and check. Anonymous functions exist too (`func(x, y int) int { return x + y }`) and can be assigned to variables or passed as arguments, like arrow functions.

## 10 minute exercise

Write the following functions

- `subNums` that takes two arguments and returns their difference
- `sayHello` that takes a name as an argument and says hello to that name
- `sayHelloAdv` that takes a map with a name and age key and prints "hello {name}, how does it feel to be {age} years old" (`fmt.Printf` with `%s` and `%d` helps here)
- `looper` takes one slice as an argument, loops over the slice and prints each item individually

---

## Resources to Learn More

- [A Tour of Go](https://go.dev/tour/) — the official interactive walk-through; Basics, Flow control and More types cover everything on this page
- [Tutorial: Get started with Go](https://go.dev/doc/tutorial/getting-started) — modules, `go run`, and importing a package
- [Effective Go](https://go.dev/doc/effective_go) — why Go code looks the way it does (naming, errors, slices)
- [Package fmt](https://pkg.go.dev/fmt) — `Println`, `Printf` and the `%v` / `%s` / `%d` verbs

---
