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

In Dart

```dart
class Dog {}

void main()
{

//instantiate a new instance of class
var sparky = Dog();

}
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

in Dart

```dart
//Defining a new class
class Dog {
  //declare class properties
  String name;
  int age;

  // constructor is a method named after the class
  Dog(String name, int age){
    this.name = name;
    this.age = age;
  }

  void bark(){
    print("$name barks!");
  }
}

void main()
{

//instantiate a new instance of class
var sparky = Dog("Sparky", 5);
//using a method
sparky.bark();

}
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

in Dart

```dart
//Defining a new class
class Dog {
  //declare class properties
  String name;
  int age;

  // constructor is a method named after the class
  Dog(String name, int age){
    this.name = name;
    this.age = age;
  }

  void bark(){
    print("$name barks!");
  }
}

class SmallDog extends Dog {

  // constructor that invokes parent constructor
  SmallDog(String name, int age):super(name, age);

  @override
  void bark(){
    print("$name yaps!");
  }

}


void main()
{

//instantiate a new instance of class
var sparky = SmallDog("Sparky", 5);
//using a method
sparky.bark();

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

In Dart

```dart
// defining a class
class Calculator {
  //declare a static property, dynamic so it can be int or double
  static dynamic lastResult = 0;

  //declare a static method, use switch since dart doesn't have an eval function
  static int calculate(int num1, int num2, op){
    switch(op){
      case "+":
        Calculator.lastResult = num1 + num2;
        break;

      case "-":
        Calculator.lastResult = num1 - num2;
        break;

      case "*":
        Calculator.lastResult = num1 * num2;
        break;

      case "/":
        Calculator.lastResult = num1 / num2;
        break;

      default:
        break;
    }
    return Calculator.lastResult;
  }

  static void showLastResult() {
    print(Calculator.lastResult);
  }
}


void main()
{

Calculator.calculate(2,2,"+");
Calculator.showLastResult();

}
```

---

## Resources to Learn More

---
