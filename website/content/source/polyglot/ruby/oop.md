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

In Ruby

```ruby
// Creating a Class
class Dog
end

// Instantiation
sparky = Dog.new
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

in Ruby

```ruby
# Creating a Class
class Dog

    # The constructor runs when we instantiate a new instance
    def initialize(name, age)
        @name = name
        @age = name
    end

    # A Method
    def bark
        p("#{@name} barks")
    end

end

# Instantiation
Sparky = Dog.new("Sparky", 4)
Sparky.bark()
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

in Ruby

```Ruby
# Creating a Class
class Dog

    # The constructor runs when we instantiate a new instance
    def initialize(name, age)
        @name = name
        @age = name
    end

    # A Method
    def bark
        p("#{@name} barks")
    end

end

class SmallDog < Dog

    def initialize (name, age)
        # Super calls the constructor of the parent class
        super(name, age)
    end

    #This will override the version of bark in the parent class
    def bark()
        p("#{@name} Yaps")
    end

  end

# Instantiation
Sparky = SmallDog.new("Sparky", 4)
Sparky.bark()
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

In Ruby

```Ruby
# Static Properties/Methods belong to the class, not the instance
class Calculator
    # Properties declared with @@ are class properties
    @@lastResult = 0

    #declaring methods by chaining off the class name makes the class/static methods
    def Calculator.calculate(num1, num2, operator)
        @@lastResult = eval("#{num1} #{operator} #{num2}")
        return @@lastResult
    end

    def Calculator.showLastResult()
         print(@@lastResult)
    end

  end

Calculator.calculate(2, 2, "+")
Calculator.showLastResult()
```

---

## Resources to Learn More

---
