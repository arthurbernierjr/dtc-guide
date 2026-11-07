## The idea

Think of a class as the pattern for a backpack. The pattern names the pockets. `new` packs one real backpack for one person. Ada's bag and Bo's bag follow the same pattern, and they do not share the coins in the secret pocket.

That secret pocket is a private field, `#balance`. Nothing outside the class can touch it. A getter is a little window: you can read `balance`. In strict mode, `acct.balance = 999` throws a TypeError, because the window has no setter. A public field like `history` is the outside pocket. A static field belongs to the pattern itself, the way a counter at the factory counts how many bags were sewn.

`this` is which backpack you are holding. JavaScript picks it from the call, not from where the function was written. `acct.deposit(50)` holds Ada's bag. `new Account(...)` holds the brand-new bag. A plain call holds nothing, so in strict mode `this` is `undefined` and the method throws. An arrow keeps the backpack from the surrounding function. That is lexical `this`. `.call` and `.apply` name the bag and run now. `.bind` hands you a function that will keep holding it.

Methods usually live on the shared pattern, `Account.prototype`. Every object has an internal link, `[[Prototype]]`. A missing property walks the bag, the pattern, the parent pattern, `Object.prototype`, then null. That walk is the prototype chain. `extends` adds a parent. `super(...)` packs the parent first. An override answers with the child bag's version. That is polymorphism. `instanceof` asks whether a pattern sits on the chain. A class is still a function. `typeof Account` is `'function'`.

## Why it matters

The bug you will hit is a lost backpack. Pass `counter.inc` into a callback, or use a regular function inside `map`, and the call is no longer `counter.inc()`. The method runs while holding nothing. An arrow callback keeps the outer bag. `fn.bind(obj)` pins it. An arrow field, `handler = () => this.label`, is born already holding the instance.

Private fields keep a balance honest. Use `extends` when a savings account really is an account. When you are clipping on logging, retries, or JSON, a mixin attaches one capability to any bag. That is composition. If you only care that something has an `area` method, check for the method. That is duck typing. There is no `interface` keyword.

Say prototype chain, lexical this, method borrowing, composition over inheritance, encapsulation via `#private`, polymorphism via override, mixin, and duck typing.

## A small example

```javascript
'use strict';

class Pocket {
  #coins = 0;
  constructor(owner) {
    this.owner = owner;
  }
  get coins() {
    return this.#coins;
  }
  add(n) {
    this.#coins += n;
    return this;
  }
}

const mine = new Pocket('ada').add(5);
const pinned = mine.add.bind(mine);
pinned(1);
```

`new` packs Ada's pocket. `add` returns the same pocket, so the call can chain. `pinned` keeps holding `mine`, so a later call still drops a coin in her secret pocket. `mine.coins` reads the window. It does not open the zipper.

## What the code below is doing

The sheet packs one `Account`. The constructor stores `owner`, deposits a truthy opening amount, and bumps a static private `#count`. `#balance` stays private. `history` is public. `balance` is a getter only. The trap: assigning it throws a TypeError in strict mode, and that write would silently do nothing in sloppy mode. `nickname` trims in a setter. `deposit` throws a RangeError unless the amount is greater than zero, records history, and returns `this`. `withdraw` returns `false` when the pocket is short. Static `count` and `from` sit on the factory. `toString`, `toJSON`, and `[Symbol.iterator]` make `String`, `JSON.stringify`, and `for...of` work.

`Savings` extends `Account`. `super(owner)` runs first, then `rate` is stored. `addInterest` deposits `balance * rate`. `toString` wraps `super.toString()`. `instanceof` is true for both classes. The links run from the instance to `Savings.prototype` to `Account.prototype`.

The `this` section is the four rules on a counter. `counter.inc()` holds the counter. Arrows inside `map` keep it. A regular function inside `map` sees `undefined` in strict mode. A detached `inc` throws. `bind` pins the counter. `call` and `apply` borrow the method for a stand-in object. `apply` takes an arguments array. An arrow field on `Btn` still returns `'ok'` after you pull `handler` off.

Without `class`, `Dog` is a constructor and `speak` lives on `Dog.prototype`, so it is not an own property. `Object.create` sets the link directly. `new` creates an object, sets `[[Prototype]]`, calls the function with that `this`, and returns it unless the function returns another object.

`canLog` and `canRetry` return a copy with one more behavior. The log reads the original object's `id`. `Serializable` is a class mixin: pass a base, get a subclass with `ser`. Static `Id.gen` needs no instance. A class expression can be anonymous. `#s in o` is a brand check, and a plain object fails it.

`Shape` throws when `new.target` is `Shape` itself, and `area` throws until `Sq` overrides it with `s ** 2`. `implementsIface` checks that every requested name is a function.
