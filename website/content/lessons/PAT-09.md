## The idea

Picture a kid getting dressed for the rain. Hoodie first. A jacket over the hoodie. A raincoat over the jacket. Each layer does one extra job: warmth, pockets, staying dry. The kid is still a kid walking out the door. School does not invent a new greeting because a third jacket went on.

A decorator is that extra jacket on an object. You attach a new responsibility while the program is running by wrapping the object in another object that speaks the same methods. The wrapper does its small job, then calls the one inside. You can wrap the wrapper. Logging around retry around caching around a real client that fetches a url. Every layer still has `get(url)`. The caller cannot count the jackets.

The inside object is the concrete component. The wrap that only forwards is the decorator. A concrete decorator adds behavior before it delegates, after it delegates, or both. It holds exactly one wrappee. You choose the stack when you build the object, which means you can change the order tomorrow without a new subclass for every mix.

## Why it matters

The mess this pattern prevents is a class for every combination. You want logging, retry, and caching in any mix and any order. Bake them into subclasses and you invent a logging-retrying-caching client, then a caching-logging client, then another class each time someone swaps the order. Three features is eight combinations. Four is sixteen. The wrappers stay separate.

You already wrap functions this way. `memoize`, `debounce`, `throttle`, `once`, and a retry helper take a function and hand back a function with the same arguments. Node can wrap a function so the first call prints a deprecation warning. React's connect helper, a router wrapper, and `React.memo` each take a component and give you a component. An Express wrapper can catch a rejected promise from an async route. Nest and MobX hang extra behavior on a class with a decorator annotation. `withAuth(withTimeout(fetch))` is the same idea written as nested calls.

An adapter changes the interface so an existing caller can use an object that did not fit. A decorator keeps the interface. Drop `get` and you have built an adapter, and the callers break. A proxy controls access. It might build the real object late, refuse a caller, or reuse an answer, and it is usually one layer that owns the real object's life. A decorator adds behavior and stacks as deep as you like. A composite holds many children. A decorator holds one.

## A small example

```javascript
function plainGet(url) {
  return { status: 200, body: url };
}

function withLog(log, inner) {
  return function get(url) {
    log.push('in ' + url);
    const res = inner(url);
    log.push('out ' + res.status);
    return res;
  };
}

function withPrefix(prefix, inner) {
  return function get(url) {
    return inner(prefix + url);
  };
}

const notes = [];
const get = withLog(notes, withPrefix('/api', plainGet));
const page = get('/orders');
```

`get` still takes a url and returns a status and a body. The prefix jacket sits under the log jacket. `page.body` is `/api/orders`, and `notes` watched the trip. There is no class named for that exact pair of jackets.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `FakeHttpClient` is the concrete component. You hand it a list of scripted responses. `get` counts the call, takes the next response, and throws when that response is an `Error`. `HttpDecorator` stores `inner` and forwards `get`. `LoggingClient`, `RetryClient`, and `CachingClient` are concrete decorators. Logging records the url on the way in and the status on the way out. Retry tries up to a fixed number of times and rethrows the last error. Caching keeps a private map and calls inward only when that url is missing. A thrown call is not stored, because the map is written after the inner call finishes.

The running stack puts caching outside logging, logging outside retry, and retry outside a fake that fails once and then returns a 200 with the body `orders`. The first `get('/orders')` spends the error, retries, and returns that body. The fake's call count is 2. The log has one pair of lines, because logging sits outside retry and only sees the success. Put logging inside retry and you would see every attempt. The second `get('/orders')` returns the same object, the call count stays 2, and the log stays two lines long. The outer cache ate the second trip. A separate retry wrapper fed three errors rejects with the third message.

The second shape is how you write it on a normal day. `withLogging`, `withRetry`, and `withCache` are functions that return functions that return functions. `compose` applies them from right to left, so cache is on the outside, then logging, then two retries, then a price function that throws on its first hit. The first call for sku `A1` throws, retries, and returns a price of 999. The hit counter is 2. The log says the call started and the call finished, once each. The second call comes from the cache, so the counter stays 2 and the log stays quiet. The wrapped function's length is 1. Callers still hold an ordinary function.

When you talk about it, say this: same interface, wrapped. Stack as many layers as you like.
