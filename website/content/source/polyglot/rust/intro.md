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

How we do this in Rust

```rust
fn main() {

  // By default values are constant, this variable typed as 32 bit integer
  let my_constant:i32 = 5;
  // use the mut keyword to declare a mutable variable, use String object to create strings
  let mut my_variable = String::from("Hello World");

  // You must use interpolations to inject variables, variable is inject in place of {}
  println!("{}", my_constant.to_string());
  println!("{}", my_variable);

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

How would we do that in Rust?

```rust
// Import the Standard Input Library
use std::io::stdin;

fn main() {
	//Declare a mutable input string to hold input when received
  let mut input_string = String::new();

  println!("Who are you?: ");

  // Read Input
  stdin().read_line(&mut input_string);

  println!("Hello there {}", input_string);
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

If statements in Rust

```rust
fn main() {

  let num = 5;

  if num > 3{
    println!("num is greater than 3")
  }
  lse if num > 1{
    println!("num is greater than 1")
  }
  else{
    println!("num is 1 or less")
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

In Rust

```rust
fn main() {

  let mut counter = 0;

//this will loop 10 times
  while counter < 10{
      println!("{}", counter.to_string());
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

In Rust we have vectors and hashmaps

```rust
// Import HashMaps from Standard Library
use std::collections::HashMap;

fn main() {

// Create a new Vector using the vec! macro
let my_vector = vec![1,2,3];
println!("{:?}", my_vector); // Printing the whole list, :? allows printing of the whole collection
println!("{}", my_vector[0].to_string()); // Printing an individual item

// Create a new HashMap and add Properties
let mut my_hashmap = HashMap::new();
my_hashmap.insert("cheese", "gouda");
my_hashmap.insert("bread", "rye");
println!("{:?}", my_hashmap); //Printing the whole hashmap
println!("{:?}", my_hashmap.get("cheese")); // get will return a reference to the value
// Using Pattern Matching to get the actual value
match my_hashmap.get("bread"){
  // Match loops through each hashmap propery looks for a value match
  // If the value in the reference matches, run this code
  Some(value) => {
    println!("The value of the bread is {}", value);
  }
  // If there is no matches, run this code
  None => {
    println!("none of the properties matched");
}
}
```

## 10 Minute Exercise

Google Rust Vector Methods/Functions and discover the following and apply them to the following list.

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

In Rust

```rust

// Define a function, type parameters and return value
fn add_nums(x:i32, y:i32) -> i32{
  return x + y
}

fn main() {

println!("{}", add_nums(5,5).to_string())

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

- [TutorialsPoint Rust Docs](https://www.tutorialspoint.com/rust/index.htm)
- [devNursery Rust Playlist](https://www.youtube.com/playlist?list=PLY6oTPmKnKbYPkf2AhsPbq_YGh3q7p4Aj)

---
