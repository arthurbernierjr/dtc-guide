---
title: "Ruby: intro to the language"
lede: "Ruby 4.0 (any 3.2+ works): variables, input, conditionals, loops, arrays, hashes and methods — each shown first in the JavaScript you know, then in Ruby."
updated_from: "the 2021 'Learning Your Second Language' lesson"
verified: 2026-11-02
docs:
  - https://www.ruby-lang.org/en/downloads/
  - https://docs.ruby-lang.org/en/4.0/syntax/assignment_rdoc.html
  - https://docs.ruby-lang.org/en/4.0/syntax/control_expressions_rdoc.html
  - https://docs.ruby-lang.org/en/4.0/syntax/methods_rdoc.html
  - https://docs.ruby-lang.org/en/4.0/Kernel.html
  - https://docs.ruby-lang.org/en/4.0/String.html
  - https://docs.ruby-lang.org/en/4.0/Array.html
  - https://docs.ruby-lang.org/en/4.0/Hash.html
  - https://nodejs.org/api/readline.html#promises-api
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 (the input example was fed stdin). The Ruby blocks were checked line by line against the Ruby 4.0 syntax reference and the Kernel, String, Array and Hash docs listed; there is no Ruby toolchain on the build machine, so none of them were executed."
changes:
  - "Bug fixed: the conditional used `elseif`, which Ruby reads as an undefined method and fails on. The keyword is `elsif`."
  - "The `gets.chomp` comment claimed chomp 'removes leading/trailing whitespace'; it removes the trailing newline (`strip` is the whitespace one). `puts` and `p` are explained as two different things instead of calling `p` an abbreviation."
  - "Constants are described as what they are in Ruby: a capitalised name that Ruby warns you about reassigning, not a frozen value. The Ruby comment that said 'the norm in python' is gone."
  - "Getting Started points at ruby-lang.org (current release 4.0; Rails 8.1 needs 3.2 or newer) and the built-in `irb` REPL instead of a specific hosted editor."
  - "The Node input example uses the promise-based `node:readline/promises` API that Node ≥17 ships, instead of the callback form."
  - "Added the idiomatic `times`/`each` loops, the symbol-vs-string hash key gotcha, implicit return and keyword arguments; resources now link docs.ruby-lang.org instead of third-party sites."
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

Install the current Ruby from [ruby-lang.org/en/downloads](https://www.ruby-lang.org/en/downloads/) (4.0 as of this writing; anything from 3.2 up runs everything on this page and is what Rails 8.1 requires). Most people install it through a version manager — the [Install Ruby on Rails guide](https://guides.rubyonrails.org/install_ruby_on_rails.html) walks through that on macOS, Ubuntu and Windows (WSL). Then open a terminal:

```bash
ruby --version
irb
```

`irb` is Ruby's REPL: type an expression, press Enter, see the result; `exit` leaves. To run a file: `ruby hello.rb`.

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

How we do this in Ruby

```ruby
# A name that starts with a capital letter is a constant. Ruby warns you if you reassign it
# (it does not stop you); the convention for values is SCREAMING_SNAKE_CASE
MY_CONSTANT = 5
# Everything else is a plain variable and re-assignable; snake_case is the norm
my_variable = "Hello World"

# puts prints a value followed by a newline; parentheses are optional, puts(MY_CONSTANT) is the same call
puts MY_CONSTANT
# p prints the value's "inspect" form (strings keep their quotes) and returns it; handy for debugging
p my_variable
```

### Receiving Input

In the browser, input comes from forms or `prompt`. In Node, reading from the terminal goes through the `readline` module:

```js
// Node: ask a question in the terminal and wait for the answer
import readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

const rl = readline.createInterface({ input, output })
const name = await rl.question("Who are you? ")
console.log(`Hey there ${name}!`)
rl.close()
```

How would we do that in Ruby?

```ruby
# puts prints the question; gets reads one line from the terminal, including the newline the Enter key adds
puts "Who are you?"
user_input = gets.chomp # chomp removes that trailing newline

# #{} interpolates any Ruby expression into a double-quoted string
puts "Hey there #{user_input}!"
```

`gets` always returns a string (`gets.chomp.to_i` for a number), and interpolation only works inside double quotes.

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

If statements in Ruby

```ruby
num = 5

# No parentheses or braces: the condition ends the line, and one `end` closes the whole if
if num > 3
  puts "num is greater than 3"
elsif num > 1
  puts "num is greater than 1"
else
  puts "num is 1 or less"
end
```

Things to know: the middle branch is spelled `elsif`; `&&`, `||`, `!` work as in JavaScript; `==` never coerces types, so there is no `===` to reach for; and **only `nil` and `false` are falsy** — `0` and `""` are truthy. You'll also see `unless` (an inverted `if`) and the one-line form `puts "big" if num > 3`.

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

In Ruby

```ruby
counter = 0

# this will loop 10 times (Ruby has no ++, use += 1)
while counter < 10
  puts counter
  counter += 1
end
```

`while` is rare in day-to-day Ruby. You will mostly loop by handing a **block** (`{ }` or `do ... end`) to a method, which calls it once per item:

```ruby
10.times { |counter| puts counter }   # 0 to 9
[1, 2, 3].each { |item| puts item }
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

In Ruby you have arrays and hashes

```ruby
my_array = [1, 2, 3]
puts my_array       # puts prints each element on its own line
p my_array          # p shows the array the way you would type it: [1, 2, 3]
p my_array[0]       # an individual item
p my_array[-1]      # negative indexes count from the end

my_hash = { cheese: "gouda", bread: "rye" }
p my_hash           # {cheese: "gouda", bread: "rye"}
p my_hash[:cheese]  # one value, looked up by its key
p my_hash[:jam]     # a missing key gives nil, not an error
```

`:cheese` is a **symbol** — a lightweight, immutable name Ruby uses for identifiers; `cheese:` inside `{ }` is shorthand for `:cheese =>`. The classic gotcha: `my_hash["cheese"]` is a *different* key from `my_hash[:cheese]` and returns `nil`. There is no dot access for hash keys.

## 10 Minute Exercise

Look up Ruby's [Array methods](https://docs.ruby-lang.org/en/4.0/Array.html) and apply them to the following list.

```ruby
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

- How to find an array's length (`length` / `size`)
- How to loop over an array (`each`, `each_with_index`, `map`)
- How to add and remove items from an array (`push` or `<<`, `pop`, `unshift`, `shift`, `delete`, `delete_at`)

## Functions

in Javascript

```js
const addNums = (x, y) => {
    return x + y
}

console.log(addNums(5,5))
```

In Ruby

```ruby
# def ... end defines a method; the value of the last expression is returned automatically
def add_nums(x, y)
  x + y
end

puts add_nums(5, 5)
```

`return` exists, but Ruby only writes it to leave a method early; the last line is the return value. Keyword arguments with defaults are built in:

```ruby
def greet(name, greeting: "Hello")
  "#{greeting}, #{name}!"
end

puts greet("Arthur")                      # Hello, Arthur!
puts greet("Arthur", greeting: "Welcome") # Welcome, Arthur!
```

The closest thing to an arrow function is a lambda, `add = ->(x, y) { x + y }`, called with `add.call(5, 5)`; mostly you'll meet anonymous functions as the blocks passed to `each`, `map` and `select`.

## 10 minute exercise

Write the following functions

- `sub_nums` that takes two arguments and returns their difference
- `say_hello` that takes a name as an argument and says hello to that name
- `say_hello_adv` that takes a hash with `name` and `age` keys and prints "hello {name}, how does it feel to be {age} years old"
- `looper` takes one array as an argument, loops over the array and prints each item individually

---

## Resources to Learn More

- [Control expressions](https://docs.ruby-lang.org/en/4.0/syntax/control_expressions_rdoc.html) — `if`/`elsif`/`unless`, `while`, `case` and the modifier forms, from the official syntax reference
- [Methods](https://docs.ruby-lang.org/en/4.0/syntax/methods_rdoc.html) — `def`, default values, keyword arguments, blocks
- [Kernel](https://docs.ruby-lang.org/en/4.0/Kernel.html) — `puts`, `p`, `print`, `gets` and the other methods available everywhere
- [Array](https://docs.ruby-lang.org/en/4.0/Array.html) and [Hash](https://docs.ruby-lang.org/en/4.0/Hash.html) — the methods the exercises ask you to find
- [Official Ruby documentation](https://www.ruby-lang.org/en/documentation/) — the index of everything above, plus Ruby's own tutorials

---
