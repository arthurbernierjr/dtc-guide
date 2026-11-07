# OOP in New Language

---

## What you will learn

- How to Create a Class
- How to Instantiate a Class
- Write a Constructor and Methods
- Create an Inherited Class
- Write Static Methods/Properties

---

Below you'll see Javascript examples of Object Oriented Patterns and their new language Counterparts.

## Creating and Instantiating a Class

In Javascript

```js
// Creating a Class
class Dog {}

// Instantiation
const Sparky = new Dog();
```

In PHP

```PHP
<?php

class Dog {}

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

```PHP
<?php

class Dog {

  // Dec
  public $name;
  public $age;

  // The constructor runs when we instantiate a new instance
  public function __construct($name, $age){
    $this->name = $name;
    $this->age = $age;
  }

  // A Method
  public function bark(){
    echo("$this->name barks");
  }
}

$sparky = new Dog("Sparky", 4);
$sparky->bark();
```

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

```PHP
<?php

class Dog {

  // Dec
  public $name;
  public $age;

  // The constructor runs when we instantiate a new instance
  public function __construct($name, $age){
    $this->name = $name;
    $this->age = $age;
  }

  // A Method
  public function bark(){
    echo("$this->name barks");
  }
}

class SmallDog extends Dog {

  public function __construct($name, $age){
    #call the constructor of the parent class
    parent::__construct($name, $age);
  }

  # This will override the version of the bark in the parent class
  public function bark(){
    echo("$this->name Yaps");
  }

}

$sparky = new SmallDog("Sparky", 4);
$sparky->bark();
```

## Static Methods and Properties

In Javascript

```js
// Static Properties/Methods belong to the class, not the instance
class Calculator {
  static lastResult = 0;

  static calculate(num1, num2, operator) {
    Calculator.lastResult = eval(`${num1} ${operator} ${num2}`);
    return Calculator.lastResult;
  }

  static showLastResult() {
    console.log(Calculator.lastResult);
  }
}

Calculator.calculate(2, 2, "+");
Calculator.showLastResult();
```

In Python

```php
<?php

// Static Properties/Methods belong to the class, not the instance
class Calculator{
    // Properties declared outside the constructor are class/static properties
    public static $lastResult = 0;

    // Defines this as static method
    public static function calculate($num1, $num2, $operator){
        self::$lastResult = eval("return $num1 $operator $num2;");
        return self::$lastResult;
    }
    // defines this as static method
    public static function showLastResult(){
         echo(self::$lastResult);
         }
}

//Double colons allow access to static methods/properties
Calculator::calculate(2, 2, "+");
Calculator::showLastResult();
```

---

## Resources to Learn More

---
