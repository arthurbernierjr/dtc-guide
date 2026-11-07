---
title: "PHP: intro to the language"
lede: "PHP 8.5 (any 8.3+ works): variables, input, conditionals, loops, arrays, associative arrays and functions — each shown first in the JavaScript you know, then in PHP."
updated_from: "the 2021 'Learning Your Second Language' lesson (PHP 8.0)"
verified: 2026-11-02
docs:
  - https://www.php.net/manual/en/language.types.php
  - https://www.php.net/manual/en/language.constants.syntax.php
  - https://www.php.net/manual/en/language.control-structures.php
  - https://www.php.net/manual/en/control-structures.match.php
  - https://www.php.net/manual/en/language.functions.php
  - https://www.php.net/manual/en/function.readline.php
  - https://www.php.net/manual/en/features.commandline.interactive.php
  - https://www.php.net/supported-versions.php
  - https://nodejs.org/api/readline.html#promises-api
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 (the readline example was fed stdin). The PHP blocks were checked line by line against the PHP 8.5 manual pages listed (types, constants, control structures, match, functions, readline); there is no PHP interpreter on the build machine, so none of them were executed."
changes:
  - "Getting Started points at php.net (current release 8.5.12; Laravel 13 needs 8.3+) and PHP's built-in `php -a` shell instead of a hosted editor."
  - "Three bugs fixed in the original PHP: a missing semicolon after `$num = 5` (parse error), a missing semicolon after the input echo, and `my_array[0]` without the `$` (an undefined-constant Error in PHP 8)."
  - "Constants use the `const` keyword in ALL_CAPS; closing `?>` tags are dropped from pure-PHP files, as PSR-12 and the manual recommend; `else if` is written `elseif`."
  - "The Node input example uses the promise-based `node:readline/promises` API that Node ≥17 ships, instead of the callback form."
  - "Added the things current PHP code actually uses: `foreach`, `??`, typed parameters and return types, default and named arguments, arrow functions (`fn`), with a pointer to `match`."
  - "Resources now link the official PHP manual rather than third-party sites and video playlists."
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

Install PHP from [php.net/downloads](https://www.php.net/downloads.php) — 8.5 is current; 8.3+ runs this page and Laravel 13 — or, on macOS and Windows, [Laravel Herd](https://herd.laravel.com/), which bundles PHP, Composer and the Laravel installer. Then start PHP's interactive shell:

```bash
php --version
php -a
```

Type PHP at the `php >` prompt, `exit` to leave; `php hello.php` runs a file. A PHP file starts with `<?php`; in a file that is only PHP you leave the closing `?>` off.

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

How we do this in PHP

```php
<?php
// const creates a constant; the convention is ALL_CAPS and no $ (define() also works)
const MY_CONSTANT = 5;
// Every variable starts with a $ and is re-assignable; statements MUST end with a semicolon
$myVariable = "Hello World";

// echo prints; "\n" (or PHP_EOL) adds the line break; dot . concatenates strings
echo MY_CONSTANT . "\n";
echo $myVariable . "\n";
```

`echo` is a language construct, not a function, so parentheses around it are optional; `print_r()` and `var_dump()` print arrays and objects.

### Receiving Input

In the browser, input comes from forms or `prompt`. In Node, it comes from the `readline` module:

```js
// Node: ask a question in the terminal and wait for the answer
import readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"

const rl = readline.createInterface({ input, output })
const name = await rl.question("Who are you? ")
console.log(`Hey there ${name}!`)
rl.close()
```

How would we do that in PHP?

```php
<?php
// readline() prints the prompt, waits for a line and returns it as a string
$userInput = readline("Who are you? ");

// Variables interpolate inside double-quoted strings (not single-quoted ones)
echo "Hey there $userInput\n";
```

`readline()` always returns a string; cast when you need a number: `(int) readline("Age? ")`.

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

If statements in PHP

```php
<?php
$num = 5;

// Same shape as JavaScript; elseif is one word in PHP (else if also parses)
if ($num > 3) {
    echo "num is greater than 3\n";
} elseif ($num > 1) {
    echo "num is greater than 1\n";
} else {
    echo "num is 1 or less\n";
}
```

The operators carry over (`==`, `===`, `!=`, `!==`, `&&`, `||`, `!`), and as in JavaScript `==` coerces, so prefer `===`. PHP 8 also has [`match`](https://www.php.net/manual/en/control-structures.match.php), a `switch` that compares with `===` and returns a value — the OOP page uses it.

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

In PHP

```php
<?php
$counter = 0;

// This will loop 10 times (++ and += both exist)
while ($counter < 10) {
    echo $counter . "\n";
    $counter += 1;
}
```

PHP's `for` loop is JavaScript's (`for ($i = 0; $i < 10; $i++)`); the one you'll use most, `foreach`, is in Collections below.

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

In PHP we have arrays and associative arrays

```php
<?php
$myArray = [1, 2, 3];
print_r($myArray);         // printing the whole array
echo $myArray[0] . "\n";   // printing an individual item (don't forget the $)

$myAssociative = ["cheese" => "gouda", "bread" => "rye"];
print_r($myAssociative);               // printing the whole associative array
echo $myAssociative["cheese"] . "\n";  // one value (?? supplies a default for a missing key)

// foreach walks values, or keys and values
foreach ($myArray as $item) {
    echo $item . "\n";
}
foreach ($myAssociative as $key => $value) {
    echo "$key: $value\n";
}
```

One type does both jobs: a PHP array is an ordered map with integer or string keys, and there is no dot access — square brackets only.

## 10 Minute Exercise

Look up PHP's [array functions](https://www.php.net/manual/en/ref.array.php) and apply them to the following list.

```php
[1,2,3,4,5,6,7,8,9,10]
```

- How to find an array's length (`count`)
- How to loop over an array (`foreach`, `array_map`)
- How to add and remove items from an array (`$arr[] = 11`, `array_push`, `array_pop`, `unset`)

## Functions

in Javascript

```js
const addNums = (x, y) => {
    return x + y
}

console.log(addNums(5,5))
```

In PHP

```php
<?php
// snake_case or camelCase both appear in the wild; Laravel code uses camelCase
function addNums(int $x, int $y): int
{
    return $x + $y;
}

echo addNums(5, 5) . "\n";
```

Types are optional but current PHP code writes them. Defaults work as in JavaScript, named arguments are a bonus, and `fn` is the arrow function:

```php
<?php
function greet(string $name, string $greeting = "Hello"): string
{
    return "$greeting, $name!";
}

echo greet("Arthur") . "\n";                      // Hello, Arthur!
echo greet("Arthur", greeting: "Welcome") . "\n"; // Welcome, Arthur!

// Arrow functions: one expression, and they can see the variables around them
$double = fn(int $n): int => $n * 2;
echo $double(21) . "\n"; // 42
```

## 10 minute exercise

Write the following functions

- `subNums` that takes two arguments and returns their difference
- `sayHello` that takes a name as an argument and says hello to that name
- `sayHelloAdv` that takes an associative array with a name and age key and prints "hello {name}, how does it feel to be {age} years old"
- `looper` takes one array as an argument, loops over the array and prints each item individually

---

## Resources to Learn More

- [PHP Manual — Language Reference](https://www.php.net/manual/en/langref.php) — types, operators, control structures, functions, [arrays](https://www.php.net/manual/en/language.types.array.php)
- [`match`](https://www.php.net/manual/en/control-structures.match.php) and [arrow functions](https://www.php.net/manual/en/functions.arrow.php) — the PHP 8 features you'll see most in Laravel code
- [PSR-12 coding style](https://www.php-fig.org/psr/psr-12/) — why the braces and spacing look the way they do

---
