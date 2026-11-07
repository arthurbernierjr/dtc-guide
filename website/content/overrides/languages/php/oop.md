---
title: "PHP: OOP"
lede: "PHP 8.5 (any 8.3+ works): classes, constructors, methods, inheritance and static members — the JavaScript version next to the PHP version, with constructor promotion, readonly properties, match and enums."
updated_from: "the 2021 'OOP in New Language' lesson (PHP 8.0)"
verified: 2026-11-02
docs:
  - https://www.php.net/manual/en/language.oop5.basic.php
  - https://www.php.net/manual/en/language.oop5.properties.php
  - https://www.php.net/manual/en/language.oop5.decon.php
  - https://www.php.net/manual/en/language.oop5.visibility.php
  - https://www.php.net/manual/en/language.oop5.inheritance.php
  - https://www.php.net/manual/en/language.oop5.static.php
  - https://www.php.net/manual/en/control-structures.match.php
  - https://www.php.net/manual/en/language.enumerations.basics.php
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 and printed what the comments say. The PHP blocks were checked line by line against the PHP 8.5 manual chapters listed (basics, properties, constructors incl. promotion, visibility, inheritance, static, match, enumerations); no PHP interpreter on the build machine, so they were not executed."
changes:
  - "The static-method example built an expression string and ran it through `eval()` in both languages. The JavaScript version now dispatches on a table of operator functions and the PHP version on a `match` expression — same result, no arbitrary code execution."
  - "The last PHP block was labelled 'In Python'; it is 'In PHP' now, and the code fences use the lowercase `php` tag."
  - "Properties are typed (`public string $name`) and the constructor-and-methods section adds PHP 8's constructor property promotion and `readonly`, which is how current PHP and Laravel code declares them."
  - "Output lines end with a newline so the examples print one line each; `yaps`/`Yaps` capitalisation made consistent with the JavaScript; `#` comments replaced with `//`."
  - "Added the short notes current PHP code needs: single inheritance plus interfaces and traits, what `match` does with an unknown operator, and enums as the PHP 8.1 way to write a fixed set of values."
  - "Resources link the PHP manual's Classes and Objects chapter instead of being empty."
---

# OOP in New Language

---

## What you will learn

- How to Create a Class
- How to Instantiate a Class
- Write a Constructor and Methods
- Create an Inherited Class
- Write Static Methods/Properties

---

Below you'll see JavaScript examples of object-oriented patterns and their PHP counterparts.

## Creating and Instantiating a Class

In Javascript

```js
// Creating a Class
class Dog {}

// Instantiation
const Sparky = new Dog();
```

In PHP

```php
<?php

// Creating a class
class Dog {}

// Instantiation: same new keyword
$sparky = new Dog();
```

## The Constructor and Methods

In Javascript

```js
// Creating a Class
class Dog {
  // The constructor runs when we instantiate a new instance
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // A Method
  bark() {
    console.log(`${this.name} barks`);
  }
}

// Instantiation
const Sparky = new Dog("Sparky", 4);
Sparky.bark();
```

in PHP

```php
<?php

class Dog
{
    // Properties are declared up front, with a visibility and (since 7.4) a type
    public string $name;
    public int $age;

    // The constructor runs when we instantiate a new instance
    public function __construct(string $name, int $age)
    {
        $this->name = $name;
        $this->age = $age;
    }

    // A method; -> reaches into the object where JavaScript uses a dot
    public function bark(): void
    {
        echo "{$this->name} barks\n";
    }
}

// Instantiation
$sparky = new Dog("Sparky", 4);
$sparky->bark();
```

Where JavaScript creates `this.name` on first assignment, PHP wants the property declared (undeclared ones are deprecated since 8.2). Because "declare, take as parameter, assign" is so repetitive, PHP 8.0 added **constructor property promotion**: put the visibility on the parameter — `public function __construct(public string $name, public int $age) {}` — and all three happen at once. The inheritance example below uses it. Add `readonly` (PHP 8.1) when a property must never change after construction; `private` and `protected` do what JavaScript's `#private` fields do.

## Inheritance

In Javascript

```js
// Creating a Class
class Dog {
  // The constructor runs when we instantiate a new instance
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  // A Method
  bark() {
    console.log(`${this.name} barks`);
  }
}

class SmallDog extends Dog {
  constructor(name, age) {
    //Super calls the constructor of the parent class
    super(name, age);
  }

  //This will override the version of bark in the parent class
  bark() {
    console.log(`${this.name} yaps`);
  }
}

// Instantiation
const Sparky = new SmallDog("Sparky", 4);
Sparky.bark();
```

in PHP

```php
<?php

class Dog
{
    public function __construct(
        public string $name,
        public int $age,
    ) {}

    public function bark(): void
    {
        echo "{$this->name} barks\n";
    }
}

// Same extends keyword
class SmallDog extends Dog
{
    public function __construct(string $name, int $age)
    {
        // parent:: reaches the parent class; call its constructor explicitly
        parent::__construct($name, $age);
    }

    // This overrides the version of bark in the parent class
    public function bark(): void
    {
        echo "{$this->name} yaps\n";
    }
}

// Instantiation
$sparky = new SmallDog("Sparky", 4);
$sparky->bark();
```

If a child defines no `__construct`, the parent's runs automatically. A class extends one parent; beyond that PHP has `interface` (a contract to `implements`) and `trait` (methods to `use`).

## Static Methods and Properties

In Javascript

```js
// Static properties/methods belong to the class, not the instance
class Calculator {
  static lastResult = 0;

  // a table of operator functions instead of eval()
  static operations = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b,
  };

  static calculate(num1, num2, operator) {
    Calculator.lastResult = Calculator.operations[operator](num1, num2);
    return Calculator.lastResult;
  }

  static showLastResult() {
    console.log(Calculator.lastResult);
  }
}

Calculator.calculate(2, 2, "+");
Calculator.showLastResult();
```

In PHP

```php
<?php

// Static properties/methods belong to the class, not the instance
class Calculator
{
    // A property declared static is shared by the whole class
    public static float $lastResult = 0.0;

    // A static method: no $this inside, called on the class
    public static function calculate(float $num1, float $num2, string $operator): float
    {
        // match instead of eval(): compares with ===, returns a value, must be exhaustive
        self::$lastResult = match ($operator) {
            '+' => $num1 + $num2,
            '-' => $num1 - $num2,
            '*' => $num1 * $num2,
            '/' => $num1 / $num2,
        };

        return self::$lastResult;
    }

    public static function showLastResult(): void
    {
        echo self::$lastResult . "\n";
    }
}

// Double colons access static methods/properties
Calculator::calculate(2, 2, '+');
Calculator::showLastResult(); // 4
```

An operator missing from the `match` throws `UnhandledMatchError` rather than silently doing nothing; add a `default =>` arm for a fallback. When a set of named values is really a type, PHP 8.1 has an **enum**, and `match` pairs with it:

```php
<?php

enum Size
{
    case Small;
    case Large;
}

$size = Size::Small;
$text = match ($size) {
    Size::Small => 'fits in a bag',
    Size::Large => 'needs a yard',
};
echo $text . "\n"; // fits in a bag
```

`Size::Small` is a real type — a `Size $size` parameter rejects a plain string — and Laravel can cast a database column straight to it.

---

## Resources to Learn More

- [Classes and Objects](https://www.php.net/manual/en/language.oop5.php) — basics, properties, [constructors and promotion](https://www.php.net/manual/en/language.oop5.decon.php), visibility, inheritance, static, interfaces, traits
- [Enumerations](https://www.php.net/manual/en/language.enumerations.php) and [`match`](https://www.php.net/manual/en/control-structures.match.php)

---
