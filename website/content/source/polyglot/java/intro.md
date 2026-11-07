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

How we do this in Java

```java
class Main {

  // Constants are defined as private static members of Main class
  private static final int MY_CONSTANT = 1;

  public static void main(String[] args) {
    // Normal Variables are declared like so
    String myVariable = "Hello World";
    System.out.println(myVariable + " " + MY_CONSTANT);
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

How would we do that in Java?

```java
import java.util.Scanner;  // Import the Scanner class

class Main {
  public static void main(String[] args) {
    Scanner myObj = new Scanner(System.in);  // Create a Scanner object
    System.out.println("Who are you?");

    String userName = myObj.nextLine();  // Read user input
    System.out.println("Hey there " + userName);  // Output user input
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

If statements in Java

```java
class Main {
  public static void main(String[] args) {
    int num = 5;

if (num > 3){
  System.out.println("num is greater than 3");
} else if (num > 1){
  System.out.println("num is greater than 1");
} else{
  System.out.println("num is 1 or less");
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

In Java

```Java
class Main {
  public static void main(String[] args) {
    int counter = 0;

    //this will loop 10 times
    while (counter < 10){
      System.out.println(counter);
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

In Java we can use ArrayLists and HashMaps

```java

import java.util.ArrayList; //Import ArrayLists which are more flexible array types
import java.util.HashMap; // Import HashMaps which allow for key/value pairs

class Main {
  public static void main(String[] args) {

  //Create a new ArrayList
  ArrayList<Integer> my_list = new ArrayList<Integer>();

  //Add Elements to Array List
  my_list.add(1);
  my_list.add(2);
  my_list.add(3);

  System.out.println(my_list); // Printing the whole list
  System.out.println(my_list.get(0)); // Printing an individual item

  //Create a new HashMap
  HashMap<String, String> my_hashmap = new HashMap<String, String>();

  //Add properties to HashMap
  my_hashmap.put("cheese", "gouda");
  my_hashmap.put("bread", "rye");

  System.out.println(my_hashmap); // Printing the whole HashMap
  System.out.println(my_hashmap.get("cheese")); //accessing one value from the HashMap
  System.out.println(my_hashmap.get("bread")); //accessing one value from the HashMap

  }
}

```

## 10 Minute Exercise

Google Java ArrayList Methods/Functions and discover the following and apply them to the following Array.

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

In Java

```Java

class Main {

  // Define a function as a static method of main class
  public static int addNums (int x, int y){
    return x + y;
  }

  public static void main(String[] args) {

    //Using the function
    System.out.println(addNums(5,5));

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

- [TutorialsPoint Java Docs](https://www.tutorialspoint.com/java/)
- [devNursery Java Playlist](https://www.youtube.com/playlist?list=PLY6oTPmKnKbZtl3gTxPisijUGR3AnKw6D)

---
