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

Head over to Repl.it and create a new REPL to practice today's New Language!

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

How we do this in Golang

```go
package main

//import fmt library for fmt.Println for printing to console
import "fmt"

// Create constant variables with const keyword
const MY_CONST = 5
// variables declared with var keyword, require type declarations
var my_variable string = "Hello World"

func main(){
    fmt.Println(MY_CONST)
    fmt.Println(my_variable)
}
```

### Receiving Input

In Javascript we could either use forms, prompt to receive input from the user on the frontend. In node, getting input from the console is a bit more complicated, let's see how we would do that in nodeJS.

```js
// Import Readline Node Library and Create Interface to Read Input
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask questions, receive input, run callback in response
readline.question("Who are you?", (name) => {
  console.log(`Hey there ${name}!`);
  readline.close();
});
```

How would we do that in Golang?

```go
// Golang program to show how
// to take input from the user
package main

import "fmt"

// main function
func main() {

    // Println function is used to
    // display output in the next line
    fmt.Println("Who are you: ")

    // var then variable name then variable type
    var name string

    // Taking input from user
    fmt.Scanln(&name)

    // Use Results
    fmt.Print("Hey there... " + name)
}
```

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

If statements in Golang

```go
// Golang program to show how
// to take input from the user
package main

import "fmt"

// main function
func main() {
num := 5 // Type is implied when using := operator to create variables

if num > 3 {
  fmt.Println("num is greater than 3")
} else if num > 1 {
  fmt.Println("num is greater than 1")
} else {
  fmt.Println("num is 1 or less")
}
}
```

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

In Golang

```go
package main

import "fmt"

// main function
func main() {
counter := 0

//This will loop 10 times
// No While loops in go, but can get same effect by not including the first and third part of the for
for ;counter < 10; {
  fmt.Println(counter);
  counter += 1;
}
}
```

## 10 Minute Exercise

Write the code to do the following:

- Loop 10 times starting the counter at 0
- On each loop if the counter is even print "it's even"
- If odd, print "meow" if the number is divisble by 3
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

In Golang we will use slices and maps

```golang

package main

import "fmt"

// main function
func main() {
mySlice := []int{1,2,3}; // This dynamic array like structure is called a slice

fmt.Println(mySlice); //logging the entire slice
fmt.Println(mySlice[0]); // logging an individual item

myMap := map[string]string{
  "cheese": "gouda",
  "bread": "rye",
} // Creating a map, the key and values must be typed

fmt.Println(myMap); //logging the entire object
fmt.Println(myMap["cheese"]); //accessing map properties
fmt.Println(myMap["bread"]);
}

```

## 10 Minute Exercise

Google Golang Slice Methods/Functions and discover the following and apply them to the following list.

```py
[1,2,3,4,5,6,7,8,9,10]
```

- How to find a lists length
- How to loop over a list
- How to add and remove items from a list

## Functions

in Javascript

```js
const addNums = (x, y) => {
  return x + y;
};

console.log(addNums(5, 5));
```

In Golang

```go

package main

import "fmt"

// Define function, parameters and return values must be typed
func addNums (x int,y int) int {
  return x + y
}

// main function
func main() {

// Print return value of function
fmt.Println(addNums(5,5))

}

```

## 10 minute exercise

Write the following functions

- sub_nums that takes two arguments and returns their difference
- say_hello that takes a name as an arguments and says hello to that name
- say_hello_adv that takes a dictionary with a name and age property and prints "hello {name}, how does it feel to be {age} years old"
- looper takes one array as an argument, it loops over the array and prints each item individually

---

## Resources to Learn More

- [TutorialsPoint Go Docs](https://www.tutorialspoint.com/go/)
- [devNursery Go Playlist](https://www.youtube.com/playlist?list=PLY6oTPmKnKbZbFOW6r6YulR1_9SCrdyOZ)

---
