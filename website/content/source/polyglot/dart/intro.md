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

How we do this in Dart

```dart
void main() {

// Declaring a constant
const myConstant = 5;
// declaring an inferred typed variable, type can't change after
var myVariable = "Hello World";
// declaring an implicitly typed variable
String myVariable2 = "Goodbye World";
// variable with a dynamic type whose type can change
dynamic myVariable3 = false;

  print(myVariable);

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

How would we do that in Dart?

```dart
// importing dart:io library
import 'dart:io';

void main()
{
    print("Who are you?");
    // Receiving some input and assigning to a variable
    String name = stdin.readLineSync();

    // Printing the name
    print("Hey There, $name!");
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

If statements in Dart

```dart
void main()
{
  var num = 5;

  if (num > 3){
  print("num is greater than 3");
  } else if (num > 1){
  print("num is greater that 1");
  } else {
  print("num is 1 or less");
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

In Dart

```dart
void main()
{

// initializing an integer for counting
int counter = 0;

// this will loop 10 times
while (counter < 10) {
  print(counter);
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

In Dart we have lists and maps

```dart

void main()
{

const myList = [1, 2, 3];

print(myList); //logging the entire list
print(myList[0]); // logging an individual item

const myMap = {
  "cheese": "gouda",
  "bread": "rye",
};

print(myMap); //logging the entire object
print(myMap["cheese"]); // logging a property
print(myMap["bread"]); // logging a property

}

```

## 10 Minute Exercise

Google Dart List Methods/Functions and discover the following and apply them to the following list.

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

In python

```dart

//Defining a new function
int addNums(int x, int y){
  return x + y;
}

void main()
{

//printing the functions return value
print(addNums(5,5));

}

```

## 10 minute exercise

Write the following functions

- sub_nums that takes two arguments and returns their difference
- say_hello that takes a name as an arguments and says hello to that name
- say_hello_adv that takes a map with a name and age property and prints "hello {name}, how does it feel to be {age} years old"
- looper takes one array as an argument, it loops over the array and prints each item individually

---

## Resources to Learn More

- [Dart Docs](https://dart.dev/samples)
- [devNursery Dart Playlist](https://www.youtube.com/playlist?list=PLY6oTPmKnKbZaOObALdHSgGTZhne6Q-yJ)

---
