---
title: "Python: OOP"
lede: "Python 3.15 (any 3.10+ works): classes, constructors, methods, inheritance and class-level members — the JavaScript version next to the Python version."
updated_from: "the 2021 'OOP in New Language' lesson"
verified: 2026-11-02
docs:
  - https://docs.python.org/3/tutorial/classes.html
  - https://docs.python.org/3/reference/datamodel.html#object.__init__
  - https://docs.python.org/3/library/functions.html#classmethod
  - https://docs.python.org/3/library/functions.html#staticmethod
  - https://docs.python.org/3/library/functions.html#super
  - https://docs.python.org/3/library/operator.html
exec: ran
verified_note: "Every Python block ran under CPython 3.10.12 and every JavaScript block under Node 24.13; outputs matched the comments."
changes:
  - "The Python blocks used JavaScript `//` comments, which are a syntax error in Python; they are `#` now."
  - "Bug fixed: the constructor assigned `self.age = name`, so every dog's age was its name. It is `self.age = age`."
  - "The static-method example built an expression string and ran it through `eval()`. Both versions now dispatch on a table of operator functions, which does the same job without executing arbitrary strings."
  - "Added the one-line `__repr__`/`str` note and the `dataclass` pointer, since that is what current Python code uses for plain data classes."
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

Below you'll see JavaScript examples of object-oriented patterns and their Python counterparts.

## Creating and Instantiating a Class

In Javascript

```js
// Creating a Class
class Dog {}

// Instantiation
const Sparky = new Dog();
```

In Python

```python
# Creating a class (pass = "nothing here yet")
class Dog:
    pass

# Instantiation: no `new` keyword, just call the class
sparky = Dog()
```

Convention: class names are `CapWords`, instances and everything else are `snake_case`.

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

in Python

```py
# Creating a class
class Dog:

    # __init__ runs when we instantiate a new instance
    def __init__(self, name, age):
        self.name = name
        self.age = age

    # A method: `self` is the instance, passed in automatically
    def bark(self):
        print(f"{self.name} barks")

# Instantiation
sparky = Dog("Sparky", 4)
sparky.bark()
```

Where JavaScript has an implicit `this`, every Python method names the instance explicitly as its first parameter — by convention `self`. `sparky.bark()` is sugar for `Dog.bark(sparky)`.

Printing an object shows `<__main__.Dog object at 0x…>` unless you define `__repr__`:

```py
class Dog:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __repr__(self):
        return f"Dog(name={self.name!r}, age={self.age})"

print(Dog("Sparky", 4))  # Dog(name='Sparky', age=4)
```

For classes that are mostly data, `@dataclass` from the standard library writes `__init__`, `__repr__` and `__eq__` for you.

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

in Python

```py
# Creating a class
class Dog:

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def bark(self):
        print(f"{self.name} barks")

# The parent class goes in parentheses
class SmallDog(Dog):

    def __init__(self, name, age):
        # super() reaches the parent class; call its __init__ explicitly
        super().__init__(name, age)

    # This overrides the parent's bark
    def bark(self):
        print(f"{self.name} yaps")

# Instantiation
sparky = SmallDog("Sparky", 4)
sparky.bark()
print(isinstance(sparky, Dog))  # True
```

If a subclass doesn't define `__init__`, the parent's runs automatically — so `SmallDog`'s constructor above could be deleted with no change in behaviour. Python also allows multiple parents (`class A(B, C):`); the method resolution order is left to right.

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

In Python

```py
import operator

# Class attributes and class/static methods belong to the class, not the instance
class Calculator:
    # Attributes declared in the class body (outside __init__) are class attributes
    last_result = 0

    # the standard library already has the operator functions
    operations = {
        "+": operator.add,
        "-": operator.sub,
        "*": operator.mul,
        "/": operator.truediv,
    }

    @classmethod  # receives the class (cls) instead of an instance (self)
    def calculate(cls, num1, num2, op):
        cls.last_result = cls.operations[op](num1, num2)
        return cls.last_result

    @staticmethod  # receives neither self nor cls: a plain function living in the class namespace
    def show_last_result():
        print(Calculator.last_result)

Calculator.calculate(2, 2, "+")
Calculator.show_last_result()
```

Two decorators where JavaScript has one keyword: `@classmethod` when the method needs the class (alternate constructors, shared counters), `@staticmethod` when it needs nothing from the class at all. Reading a class attribute through an instance works (`Calculator().last_result`), but assigning through an instance creates a new instance attribute that shadows it — which is why the class method writes `cls.last_result`.

---

## Resources to Learn More

- [The Python Tutorial — Classes](https://docs.python.org/3/tutorial/classes.html)
- [`@dataclass`](https://docs.python.org/3/library/dataclasses.html) — generated constructors for data-holding classes
- [Special method names](https://docs.python.org/3/reference/datamodel.html#special-method-names) — `__init__`, `__repr__`, `__eq__`, `__len__` and the rest of the "dunder" protocol

---
