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

How we do this in C#

```c#
using System;

class MainClass {

  public const int MY_CONSTANT = 1;

  public static void Main (string[] args) {
    string myVariable = "Hello World";
    Console.WriteLine(myVariable + " " + MY_CONSTANT);
  }

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

How would we do that in C#?

```C#
using System;

class MainClass {

  public static void Main (string[] args) {
    // Create Variable to hold input
    string input;
    //prompt for user for input
    Console.WriteLine("What is your name?");
    //Receive input
    input = Console.ReadLine();
    //print message
    Console.WriteLine("Hey there " + input);
  }

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

If statements in C#

```c#
class MainClass {

  public static void Main (string[] args) {
    int num = 5;

    if (num > 3){
      Console.WriteLine("num is greater than 3");
    } else if (num > 1) {
      Console.WriteLine("num is greater than 1");
    } else {
      Console.WriteLine("num is 1 or less");
    }
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

In C#

```c#
using System;

class MainClass {

  public static void Main (string[] args) {
    int counter = 0;

    //this will loop 10 times
    while(counter < 10){
      Console.WriteLine(counter);
      counter += 1;
    }
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

In C# we can use ArrayLists and Hashtables

```C#

using System;

// Import collections to use ArrayList and HashMap
using System.Collections;

class MainClass {

  public static void Main (string[] args) {

  //Create a new ArrayList
  ArrayList my_list = new ArrayList();

  //Add Elements to Array List
  my_list.Add(1);
  my_list.Add(2);
  my_list.Add(3);

  Console.WriteLine(my_list); // Printing the whole list, just shows the object type
  Console.WriteLine(my_list[0]); // Printing an individual item

  //Create a new Hashtable
  Hashtable my_hashtable = new Hashtable();

  //Add properties to Hashtable
  my_hashtable.Add("cheese", "gouda");
  my_hashtable.Add("bread", "rye");

  Console.WriteLine(my_hashtable); // Printing the whole hashtable
  Console.WriteLine(my_hashtable["cheese"]); //accessing one value from the hashtable
  Console.WriteLine(my_hashtable["bread"]); //accessing one value from the hashtable

  }

}

```

## 10 Minute Exercise

Google C# ArrayList Methods/Functions and discover the following and apply them to the following Array.

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

In C#

```c#
using System;

// Import collections to use ArrayList and HashMap
using System.Collections;

class MainClass {

  //define a static method of MainClass to use as function
  public static int addNums (int x, int y){
    return x + y;
  }

  public static void Main (string[] args) {

  //use the function
  Console.WriteLine(addNums(5,5));

  }

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

- [TutorialsPoint C# Docs](https://www.tutorialspoint.com/csharp/index.htm)
- [devNursery C# Playlist](https://www.youtube.com/playlist?list=PLY6oTPmKnKbaQfi5KyW7IexlIsIKD1Oqb)

---
