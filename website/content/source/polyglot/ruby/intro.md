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

How we do this in Ruby

```ruby
# A variable is constant if at least the first letter is capitalized
MY_CONSTANT = 5
# All variable by default are re-assignable, snake case is the norm in python
my_variable = "Hello World"

# We print variables to the console with the puts function, or its abbreviated version p
puts(MY_CONSTANT)
p(my_variable)
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

How would we do that in Ruby?

```ruby
# Input function asks the questions and returns input
puts "Who are you?"
user_input = gets.chomp # gets receives input, chomp removes leading/trailing whitespace

# We can interpolate the variable into this print
puts("Hey there #{user_input}")
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

If statements in Ruby

```ruby
num = 5

# blocks of code are concluded with the word end
if num > 3
    puts "num is greater than 3"
elseif num > 1
    puts "num is greater than 1"
else
    puts "num is 1 or less"
end
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

In Ruby

```ruby
counter = 0

#this will loop 10 times
while counter < 10
    puts counter
    counter += 1
end
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

In Ruby you have arrays and hashes

```ruby

my_array = [1,2,3]
puts(my_array) # Printing the whole array
puts(my_array[0]) # Printing an individual item

my_hash = {cheese: "gouda", bread:"rye"}
puts(my_hash) #Printing the whole dictionary
puts(my_hash[:cheese]) #accessing one value from the dictionary

```

## 10 Minute Exercise

Google Ruby array Methods/Functions and discover the following and apply them to the following list.

```ruby
[1,2,3,4,5,6,7,8,9,10]
```

- How to find a arrays length
- How to loop over a array
- How to add and remove items from a array

## Functions

in Javascript

```js
const addNums = (x, y) => {
  return x + y;
};

console.log(addNums(5, 5));
```

In Ruby

```ruby

def add_nums (x,y)
    return x + y
end

puts(add_nums(5,5))

```

## 10 minute exercise

Write the following functions

- sub_nums that takes two arguments and returns their difference
- say_hello that takes a name as an arguments and says hello to that name
- say_hello_adv that takes a hash with a name and age property and prints "hello {name}, how does it feel to be {age} years old"
- looper takes one array as an argument, it loops over the array and prints each item individually

---

## Resources to Learn More

- [TutorialsPoint Ruby Docs](https://www.tutorialspoint.com/ruby/)
- [devNursery Ruby Playlist](https://www.youtube.com/playlist?list=PLY6oTPmKnKbZp8Kh6jS5A6j-6H2kGY12e)

---
