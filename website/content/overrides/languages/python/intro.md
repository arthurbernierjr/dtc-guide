---
title: "Python: intro to the language"
lede: "Python 3.15 (any 3.10+ works): variables, input, conditionals, loops, lists, dictionaries and functions — each shown first in the JavaScript you know, then in Python."
updated_from: "the 2021 'Learning Your Second Language' lesson"
verified: 2026-11-02
docs:
  - https://docs.python.org/3/tutorial/introduction.html
  - https://docs.python.org/3/tutorial/controlflow.html
  - https://docs.python.org/3/tutorial/datastructures.html
  - https://docs.python.org/3/library/functions.html#input
  - https://peps.python.org/pep-0008/
  - https://nodejs.org/api/readline.html#promises-api
exec: ran
verified_note: "Every Python block ran under CPython 3.10.12 (the build machine's newest; nothing here uses syntax newer than 3.6 f-strings) and every JavaScript block under Node 24.13. Both input() examples were fed stdin."
changes:
  - "Getting Started points at python.org (current release 3.15) and the built-in REPL instead of a specific hosted editor."
  - "The Node input example uses the promise-based `node:readline/promises` API that Node ≥17 ships, instead of the callback form."
  - "Python conditionals and while loops are written without the JavaScript-style parentheses, matching PEP 8 and the tutorial."
  - "Resources now link the official Python tutorial and PEP 8 rather than third-party sites."
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

Install the current Python 3 from [python.org/downloads](https://www.python.org/downloads/) (3.15 as of this writing; anything from 3.10 up runs everything on this page). Then open a terminal and start the interactive shell:

```bash
python3 --version
python3
```

On Windows the command is usually `py` or `python`; on macOS and Linux it is `python3`. Type `exit()` (or Ctrl-D) to leave the REPL. To run a file: `python3 hello.py`.

If you'd rather not install anything yet, any browser-based Python runner works for today's exercises.

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

How we do this in Python

```python
# Constants don't exist in Python, but the convention is to name them in ALL_CAPS
MY_CONSTANT = 5
# Every variable is re-assignable; snake_case is the norm in Python
my_variable = "Hello World"

# We print variables to the console with the print function
print(MY_CONSTANT)
print(my_variable)
```

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

How would we do that in Python?

```python
# input() prints the prompt, waits for a line, and returns it as a string
user_input = input("Who are you? ")

# f-strings interpolate variables into text
print(f"Hey there {user_input}")
```

`input()` always returns a string. If you want a number, convert it: `age = int(input("Age? "))`.

## Conditionals

If statements in Javascript

```js
const num = 5

if (num > 3){
    console.log("num is greater than 3")
} else if (num > 1){
    console.log("num is greater than 1")
} else {
    console.log("num is 1 or less")
}
```

If statements in Python

```python
num = 5

# No parentheses or braces: the colon opens the block and the indentation *is* the block
if num > 3:
    print("num is greater than 3")
elif num > 1:
    print("num is greater than 1")
else:
    print("num is 1 or less")
```

Comparison and logic operators to know: `==`, `!=`, `<`, `>=` work as in JavaScript; `&&`, `||`, `!` are spelled `and`, `or`, `not`; and there is no `===` because `==` never coerces types in Python.

## While Loops

In Javascript

```js
let counter = 0

//This will loop 10 times
while(counter < 10){
    console.log(counter)
    counter += 1
}
```

In Python

```python
counter = 0

# this will loop 10 times (Python has no ++, use += 1)
while counter < 10:
    print(counter)
    counter += 1
```

Python's `for` loop is the one you'll use most. It walks any iterable; `range(10)` produces 0–9:

```python
for counter in range(10):
    print(counter)
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
const myArray = [1,2,3]

console.log(myArray) //logging the entire array
console.log(myArray[0]) // logging an individual item

const myObject = {
    cheese: "gouda",
    bread: "rye"
}

console.log(myObject) //logging the entire object
console.log(myObject.cheese) // logging a property using dot notation
console.log(myObject["bread"]) // logging a property using square bracket notation
```

In Python we have lists and dictionaries

```python
my_list = [1, 2, 3]
print(my_list)     # printing the whole list
print(my_list[0])  # printing an individual item
print(my_list[-1]) # negative indexes count from the end

my_dictionary = {"cheese": "gouda", "bread": "rye"}
print(my_dictionary)            # printing the whole dictionary
print(my_dictionary["cheese"])  # one value; a missing key raises KeyError
print(my_dictionary.get("jam", "none"))  # .get returns a default instead of raising
```

There is no dot access for dictionary keys (`my_dictionary.cheese` is an error) — square brackets or `.get()` only. Python also has tuples (immutable lists, `(1, 2, 3)`) and sets (`{1, 2, 3}`, unique values).

## 10 Minute Exercise

Look up Python's list methods in the [tutorial](https://docs.python.org/3/tutorial/datastructures.html#more-on-lists) and apply them to the following list.

```py
[1,2,3,4,5,6,7,8,9,10]
```

- How to find a list's length (`len`)
- How to loop over a list (`for item in my_list:`)
- How to add and remove items from a list (`append`, `insert`, `pop`, `remove`)

## Functions

in Javascript

```js
const addNums = (x, y) => {
    return x + y
}

console.log(addNums(5,5))
```

In Python

```python
def add_nums(x, y):
    return x + y

print(add_nums(5, 5))
```

Two things JavaScript doesn't give you for free: default values and keyword arguments.

```python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Arthur"))                      # Hello, Arthur!
print(greet("Arthur", greeting="Welcome"))  # Welcome, Arthur!
```

Python's `lambda x, y: x + y` is the equivalent of a one-expression arrow function, used mostly as an argument to `sorted`, `map` and friends.

## 10 minute exercise

Write the following functions

- `sub_nums` that takes two arguments and returns their difference
- `say_hello` that takes a name as an argument and says hello to that name
- `say_hello_adv` that takes a dictionary with a name and age property and prints "hello {name}, how does it feel to be {age} years old"
- `looper` takes one list as an argument, loops over the list and prints each item individually

---

## Resources to Learn More

- [The Python Tutorial](https://docs.python.org/3/tutorial/index.html) — the official walk-through; chapters 3–5 cover everything on this page
- [PEP 8 — Style Guide for Python Code](https://peps.python.org/pep-0008/) — why it's `snake_case` and four spaces
- [Built-in functions](https://docs.python.org/3/library/functions.html) — `print`, `input`, `len`, `range`, `int`, `str` and the rest

---
