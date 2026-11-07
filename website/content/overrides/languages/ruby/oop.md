---
title: "Ruby: OOP"
lede: "Ruby 4.0 (any 3.2+ works): classes, `initialize`, instance methods, inheritance with `super`, and class-level methods and state — the JavaScript version next to the Ruby version."
updated_from: "the 2021 'OOP in New Language' lesson"
verified: 2026-11-02
docs:
  - https://docs.ruby-lang.org/en/4.0/syntax/modules_and_classes_rdoc.html
  - https://docs.ruby-lang.org/en/4.0/syntax/methods_rdoc.html
  - https://docs.ruby-lang.org/en/4.0/syntax/assignment_rdoc.html
  - https://docs.ruby-lang.org/en/4.0/Module.html
  - https://docs.ruby-lang.org/en/4.0/Object.html
  - https://docs.ruby-lang.org/en/4.0/Data.html
exec: not run
verified_note: "Every JavaScript block ran under Node 24.13 and printed what the comments say. The Ruby blocks were checked line by line against the Ruby 4.0 docs on classes, methods and variables listed; there is no Ruby toolchain on the build machine, so none of them were executed."
changes:
  - "The Ruby blocks used JavaScript `//` comments, which Ruby parses as a method call and fails on; they are `#` now."
  - "Bug fixed: the constructor assigned `@age = name`, so every dog's age was its name. It is `@age = age`."
  - "Instances were stored in `Sparky`, which Ruby treats as a constant (capital letter) and warns about when reassigned; they are `sparky` now."
  - "The static-method example built an expression string and ran it through `eval`. Both versions now dispatch on a table of operator functions, which does the same job without executing arbitrary strings."
  - "Class methods are defined with `def self.calculate` (the form the Ruby docs use) instead of `def Calculator.calculate`, and class state uses snake_case. The `@@` class variable is kept as the direct analogue of `static`, with a note on why many Rubyists avoid it."
  - "Added `attr_reader`/`attr_accessor` (instance variables are private in Ruby, unlike JS properties), what `p` prints for an object, and the `Data.define` pointer; resources now link the official Ruby docs."
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

Below you'll see JavaScript examples of object-oriented patterns and their Ruby counterparts.

## Creating and Instantiating a Class

In Javascript

```js
// Creating a Class
class Dog {}

// Instantiation
const Sparky = new Dog();
```

In Ruby

```ruby
# Creating a class: `class` ... `end`, nothing else required
class Dog
end

# Instantiation: no `new` keyword in front, `.new` is a method you call on the class
sparky = Dog.new
```

Class names are `CamelCase` and must start with a capital (a capitalised name is a constant in Ruby); variables, methods and files are `snake_case`.

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

in Ruby

```ruby
# Creating a class
class Dog
  # initialize runs when we call Dog.new; its arguments are whatever you passed to new
  def initialize(name, age)
    # @name is an instance variable: one per object, visible to every method in the class
    @name = name
    @age = age
  end

  # A method
  def bark
    puts "#{@name} barks"
  end
end

# Instantiation
sparky = Dog.new("Sparky", 4)
sparky.bark
```

Where JavaScript has `this.name`, Ruby has `@name`. The big difference: **instance variables are private**. `sparky.name` is a `NoMethodError` until you write a reader method, and the shorthand for that is `attr_reader` (or `attr_accessor` for read and write):

```ruby
class Dog
  attr_reader :name       # defines a `name` method that returns @name
  attr_accessor :age      # defines `age` and `age=`
  # ... initialize as above
end

sparky = Dog.new("Sparky", 4)
puts sparky.name   # Sparky
sparky.age = 5     # calls the age= method
p sparky           # #<Dog:0x... @name="Sparky", @age=5>
```

`p` on an object shows its class and instance variables; define `inspect` to change that, and `to_s` to control what `puts` prints.

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

in Ruby

```ruby
# Creating a class
class Dog
  def initialize(name, age)
    @name = name
    @age = age
  end

  def bark
    puts "#{@name} barks"
  end
end

# `<` is Ruby's `extends`
class SmallDog < Dog
  def initialize(name, age)
    # super calls the same method on the parent class, here Dog#initialize
    super(name, age)
  end

  # This overrides the parent's bark
  def bark
    puts "#{@name} yaps"
  end
end

# Instantiation
sparky = SmallDog.new("Sparky", 4)
sparky.bark
puts sparky.is_a?(Dog)   # true
```

If a subclass doesn't define `initialize`, the parent's runs automatically — `SmallDog`'s constructor above could be deleted with no change in behaviour. A bare `super` (no parentheses) forwards the exact arguments the method received. Ruby classes have one parent only; behaviour shared across unrelated classes goes in a **module** that you `include` (a mix-in).

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

In Ruby

```ruby
# Class-level state and class methods belong to the class, not the instance
class Calculator
  # @@ makes a class variable: one value shared by the class, its subclasses and every instance
  @@last_result = 0

  # a constant holding a table of lambdas (Ruby's anonymous functions) instead of eval
  OPERATIONS = {
    "+" => ->(a, b) { a + b },
    "-" => ->(a, b) { a - b },
    "*" => ->(a, b) { a * b },
    "/" => ->(a, b) { a.to_f / b }
  }

  # `def self.name` defines a class method: called as Calculator.calculate, never on an instance
  def self.calculate(num1, num2, operator)
    @@last_result = OPERATIONS.fetch(operator).call(num1, num2)
  end

  def self.show_last_result
    puts @@last_result
  end
end

Calculator.calculate(2, 2, "+")
Calculator.show_last_result   # 4
```

`def self.calculate` defines a method on the class object itself (classes are objects too), which is exactly what `static` means in JavaScript; `def Calculator.calculate` is the same thing in older code. `@@last_result` is the direct analogue of `static lastResult`, with one catch the docs spell out: a class variable is shared with every subclass, so a `ScientificCalculator < Calculator` would overwrite the same value — which is why many Rubyists keep class-level state in a plain `@variable` inside the `self.` methods instead. The `a.to_f` in the division lambda is there because `2 / 3` is integer division in Ruby.

Two more things you'll meet in Rails code: `private` above a group of methods hides them from callers outside the object, and `Data.define(:name, :age)` (Ruby 3.2+) writes `initialize`, readers, `==` and `inspect` for you when a class is mostly data.

---

## Resources to Learn More

- [Modules and classes](https://docs.ruby-lang.org/en/4.0/syntax/modules_and_classes_rdoc.html) — class definition, inheritance, `super`, visibility and mix-ins, from the official syntax reference
- [Assignment](https://docs.ruby-lang.org/en/4.0/syntax/assignment_rdoc.html) — local, instance (`@`), class (`@@`) and constant names
- [Module](https://docs.ruby-lang.org/en/4.0/Module.html) — `attr_reader`, `attr_accessor`, `include`, `private`
- [Data](https://docs.ruby-lang.org/en/4.0/Data.html) — `Data.define`, the modern way to declare a value object

---
