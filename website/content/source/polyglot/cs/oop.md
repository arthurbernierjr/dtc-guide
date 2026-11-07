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

In C#

```C#
using System;

class MainClass {
  public static void Main (string[] args) {
    // Instantiating the class
    Dog sparky = new Dog();
  }
}

// Creating a new class
class Dog {}
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

in c#

```c#
using System;

class MainClass {
  public static void Main (string[] args) {
    // Instantiating the class
    Dog sparky = new Dog("Sparky", 5);
    // Using the instance bark method
    sparky.bark();
  }
}

// Creating a new class
class Dog {
  //class properties
  string name;
  int age;

  // The Constructor comes in the form of a method bearing the classes name
  public Dog(string name, int age){
    this.name = name;
    this.age = age;
  }

  // a class method
  public void bark(){
    Console.WriteLine(this.name + " barks");
  }
}
```

in C#

```c#
using System;

class MainClass {
  public static void Main (string[] args) {
    // Instantiating the class
    Dog sparky = new SmallDog("Sparky", 5);
    // Using the instance bark method
    sparky.bark();
  }
}

// Creating a new class
class Dog {
  //class properties, protected so they can be used in child class
  protected string name;
  protected int age;

  // The Constructor comes in the form of a method bearing the classes name
  public Dog(string name, int age){
    this.name = name;
    this.age = age;
  }

  // a class method, declared as virtual so it can be overridden
  public virtual void bark(){
    Console.WriteLine(this.name + " barks");
  }
}

class SmallDog: Dog {
  //The Constructor, the base keyword calls the parent constructor
  public SmallDog(string name, int age): base(name, age){}

  //overriding the original bark method
  public override void bark(){
    Console.WriteLine(this.name + " yaps!");
  }
}
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

In C#

```c#
using System;

class MainClass {
  public static void Main (string[] args) {
    Calculator.calculate(2,2,"+");
    Calculator.showLastResult();
  }
}

// Static Methods and Properties belong to the class not to the instance
class Calculator {
  // declare a static property
  private static int lastResult = 0;

  // declare a static method
  public static void calculate(int num1, int num2, string op){
    // using a switch statement since C# doesn't have an eval function
    switch(op){
      case "+":
        lastResult = num1 + num2;
        break;

      case "-":
        lastResult = num1 - num2;
        break;

      case "/":
        lastResult = num1 / num2;
        break;

      case "*":
        lastResult = num1 * num2;
        break;

      default:
        break;
    }
  }

  public static void showLastResult(){
    Console.WriteLine(lastResult);
  }

}
```

---

## Resources to Learn More

---
