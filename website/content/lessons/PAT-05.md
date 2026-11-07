## The idea

Picture the pencil sharpener bolted to the classroom wall. Every kid walks to that one sharpener. The shavings pile up in one tray. If you bolted a second sharpener to the same wall, you would have two trays, two blades, and nobody would know which one was the real sharpener. You do not build a sharpener when you need a point on your pencil. You go to the one the room already has.

A singleton is that sharpener. The class is allowed one instance, and there is one way to ask for it. In the textbook shape that way is a static `getInstance`, and the constructor is not for outside code to call. The first request builds the object. Every later request returns that same object. Arguments on the later requests do not rebuild it and do not retune it. The first call wins.

In JavaScript you often get this without a class. A module runs its top level once per process. Export an object from that module, and every `require` of that file hands back the same object. The module cache is the bolt in the wall. A closure can do the lazy version: nothing is built until the first call, and the built count stays at one.

## Why it matters

The bug this pattern prevents is two of something the program can only survive one of. A connection pool, a logger, a config, a clock, a cache. Two pools means a split view of the database. Two caches means one part of the app stored a value the other part will never see. Sharing one instance means `acquire` through one handle shows up on the other, because they are the same object.

You already use this without the textbook name. Node's module cache is the usual one: `module.exports = new Logger()` runs once, and every require returns it. The `process` object is a singleton the runtime gives you. A Redux store is one store for the app. Mongoose's default connection and a Prisma client kept at module scope are the same idea. Angular's `providedIn: 'root'` services are one instance for the application.

A flyweight is the neighbor that sounds similar and is not. A flyweight is one instance per key, many keys, many instances. A singleton is exactly one. A static bag of functions, or a namespace object, can be just as global, and it has no instance and no lifecycle. You did not construct it, and you cannot tell when it started. A class singleton and a module singleton want the same thing. The module version is the everyday one, and it is easier to reset when a test needs a clean wall.

## A small example

```javascript
function mountSharpener() {
  let only = null;
  return function getSharpener() {
    if (!only) only = { shavings: 0 };
    return only;
  };
}

const getSharpener = mountSharpener();
const morning = getSharpener();
const afternoon = getSharpener();
morning.shavings += 1;
const oneSharpener = morning === afternoon && afternoon.shavings === 1;
```

Morning and afternoon walked to the same wall. One tray of shavings. `oneSharpener` is true.

## What the code below is doing

The sheet shows the class shape, then the module shape you would actually ship, then a lazy closure, and it ends on why a bolted sharpener gets in the way of tests.

The first shape uses a class so the book name is visible. `ConnectionPool` is the singleton. `getInstance` is the access point. A private flag records the one instance. Another private flag, `constructing`, is the key in the case. The constructor throws "Use ConnectionPool.getInstance()" unless that flag is set. `getInstance` sets the flag, constructs once with the url, clears the flag, and stores the instance. A later `getInstance('postgres://other/ignored')` returns the original object, still on `postgres://localhost/app`. `acquire` bumps `connections` and returns an id plus the url. Calling `acquire` through one variable makes the other variable report `1`, because they are the same object. `new ConnectionPool('x')` throws.

The second shape is how you would write it on a normal day. A tiny `moduleCache` map stands in for Node's require cache, so the file can stay self-contained. `fakeRequire` runs the factory only when the name is missing, then returns the cached object. Two requires of `./logger` are the same logger. `log('boot')` through the first shows up in the second's `lines`. Under that, `getClient` is the lazy closure you use for an expensive client. The first call builds `{ id: 'redis' }` and increments `built`. The second call returns the same client. `built` stays `1`.

The note under the code is part of the lesson. A hard singleton is hidden global state. Tests cannot substitute it, state leaks between tests, and import order starts to matter. Prefer a factory you inject, or a reset hook. A module singleton clears when the module registry resets, or when that file's `require.cache` entry is deleted. "One" means one per process. Anything that must be unique across processes belongs in Redis or a database, not in one process's memory.

When you talk about it, say this: one instance, one access point. The singleton exposes `getInstance` and keeps construction to itself. In JavaScript the module cache already gives you that for free.
