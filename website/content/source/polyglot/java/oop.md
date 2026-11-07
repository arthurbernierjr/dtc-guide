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

In Java

```java
class Main {
  public static void main(String[] args) {
    //instantiation
    Dog sparky = new Dog();
  }
}

//define new class
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

in java

```java
class Main {
  public static void main(String[] args) {
    //instantiation
    Dog sparky = new Dog("Sparky", 5);
    //using the instance's bark method
    sparky.bark();
  }
}

//define new class
class Dog {

  // class properties
  String name;
  int age;

  // The Constructor comes in the form a function of the same name of the class
  public Dog(String name, int age){
    this.name = name;
    this.age = age;
  }

  // a class method
  public void bark(){
    System.out.println(this.name + " barks");
  }
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

in Java

```java
class Main {
  public static void main(String[] args) {
    //instantiation
    Dog sparky = new SmallDog("Sparky", 5);
    //using the instance's bark method
    sparky.bark();
  }
}

//define new class
class Dog {

  // class properties
  String name;
  int age;

  // The Constructor comes in the form a function of the same name of the class
  public Dog(String name, int age){
    this.name = name;
    this.age = age;
  }

  // a class method
  public void bark(){
    System.out.println(this.name + " barks");
  }
}

//an Inherited class
class SmallDog extends Dog {

   // The constructor
   public SmallDog(String name, int age){
     //super calls the parent constructor
     super(name, age);
   }

   public void bark(){
     System.out.println(this.name + " yaps");
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

In Java

```java
class Main {
  public static void main(String[] args) {
    Calculator.calculate(2,2,"+");
    Calculator.showLastResult();
  }
}

// Static Properties/Methods belong to the class, not the instance

class Calculator {

  // Declare a static property
  private static int lastResult = 0;

  //declare a static method
  public static void calculate(int num1, int num2, String operator){
    // using a switch statement since Java doesn't have an eval function
    switch(operator){
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
    System.out.println(lastResult);
  }

}
```

---

## Resources to Learn More

---
