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

How we do this in PHP

```php
<?php
// The Define Functions Create constant variables, semi-colons MUST end statements
define("myConstant", 5);
// All normal variables must be pre-fixed with a $
$myVariable = "Hello World";

// Basic variables can be printed to console with echo, use var_dump for collections, dot notation can be used to concatenate strings
echo(myConstant."\n");
echo($myVariable."\n");
?>
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

How would we do that in PHP?

```php
<?php
// Input function asks the questions and returns input
$user_input = readline("Who are You?");

// We can interpolate the variable into this echo
echo("Hey there $user_input")
?>
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

If statements in PHP

```php
<?php
$num = 5

if ($num > 3){
    echo("num is greater than 3");
} else if ($num > 1){
    echo("num is greater than 1");
} else {
    echo("num is 1 or less");
}
?>
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

In PHP

```php
<?php
$counter = 0;

//This will loop 10 times
while($counter < 10){
    echo($counter."\n");
    $counter += 1;
}
?>
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

In PHP we have arrays and associative arrays

```php

<?php
$my_array = [1,2,3];
var_dump($my_array); // Printing the whole array
echo(my_array[0]."\n"); // Printing an individual item

$my_associative = ["cheese" => "gouda", "bread" => "rye"];
var_dump($my_associative); //Printing the whole dictionary
echo($my_associative["cheese"]."\n"); //accessing one value from the dictionary
?>

```

## 10 Minute Exercise

Google PHP array Methods/Functions and discover the following and apply them to the following list.

```php
[1,2,3,4,5,6,7,8,9,10]
```

- How to find a array length
- How to loop over an array
- How to add and remove items from a array

## Functions

in Javascript

```js
const addNums = (x, y) => {
  return x + y;
};

console.log(addNums(5, 5));
```

In PHP

```php

<?php

function add_nums($x,$y){
    return $x + $y;
}

echo(add_nums(5,5));
?>

```

## 10 minute exercise

Write the following functions

- sub_nums that takes two arguments and returns their difference
- say_hello that takes a name as an arguments and says hello to that name
- say_hello_adv that takes a associative array with a name and age property and prints "hello {name}, how does it feel to be {age} years old"
- looper takes one array as an argument, it loops over the array and prints each item individually

---

## Resources to Learn More

- [TutorialsPoint PHP Docs](https://www.tutorialspoint.com/php/index.htm)
- [devNursery PHP Playlist](https://www.youtube.com/watch?v=scsmssXd47U&list=PLY6oTPmKnKbbLnwRkrCDhOl94iaibHwBJ)

---
