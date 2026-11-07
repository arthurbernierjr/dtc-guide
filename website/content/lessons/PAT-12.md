## The idea

Picture a coat check. You hand over a blue coat and you get a ticket with your name. When you want the coat, you talk to the attendant. You do not walk into the rack. The attendant reads the ticket, refuses the wrong person, and goes to the hook the first time you are allowed to ask. The second time, they can hand you the coat they already pulled. You still say "my coat." The words did not change. The attendant stands in front and decides.

A proxy is that attendant. It has the same interface as the real object. It holds the real object, or it creates it, and it decides when and whether to forward the call. The real report service might be expensive to build, living on another machine, closed to some users, or worth caching. Callers should not care which of those is true. They call `getReport`.

The shared interface is the subject. The object that does the work is the real subject. The proxy is the stand-in. The client holds the proxy.

## Why it matters

The bug this pattern prevents is every caller inventing its own guard. One screen forgets the role check and builds the expensive service anyway. Another caches in a place the rest of the app cannot see. A third reaches across the network with a raw client. Put the decision in the attendant and the callers stay boring.

You already stand in front of objects this way. The language's `Proxy` is how Vue 3, MobX, and Immer watch reads and writes. A promise is a placeholder for a value that is not here yet. An ORM that loads `user.posts` on first touch is a virtual proxy. A dynamic import is a virtual proxy for a module. A CDN or a service worker that reuses a response is a caching proxy. A generated client for a remote API is a remote proxy. Middleware that forwards HTTP is the same job at the network edge.

A decorator adds behavior and stacks freely. Each jacket assumes the call will go through, and it does a little extra around that call. A proxy controls access: lazy, guard, cache, or remote. It usually manages the real object's life itself, and you typically want one attendant, not a pile of them. An adapter changes the interface. A proxy keeps it. If the attendant invented a new method name, callers would know they were not holding the coat.

## A small example

```javascript
function coatCheck(owner) {
  let coat = null;
  let pulls = 0;
  return {
    claim(name) {
      if (name !== owner) throw new Error('wrong ticket ' + name);
      if (coat === null) {
        pulls += 1;
        coat = 'blue coat on hook 4';
      }
      return coat;
    },
    pulls() {
      return pulls;
    },
  };
}

const desk = coatCheck('ada');
const first = desk.claim('ada');
const again = desk.claim('ada');
```

`first` and `again` are the same coat. `desk.pulls()` is 1. The hook is visited on the first allowed claim. A wrong name throws before any pull.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `ReportService` is the real subject. Constructing it increments a counter. `getReport` increments a call counter and returns the account id plus a row pair: the length of the id, and the constant 42. `ReportServiceProxy` is the attendant. It keeps a private real service and a private cache, both starting empty. `getReport` refuses anyone whose roles do not include `analyst`, and it throws before it builds anything. On an allowed call it returns the cached report when it has one. Otherwise it creates the real service on first use, calls it, stores the report, and returns it.

A viewer named bob asks for `acct-1` and is refused. The real-instance counter is still 0. The refusal was free. An analyst named ada asks for `acct-1`. One real service now exists. The report's rows are 6 and 42, because `acct-1` has six characters. The same ask again returns that same object, and the real call counter is still 1. A different account, `acct-2`, makes a second real call. The instance counter stays 1. One attendant, one real service, many reports.

The second shape is the built-in `Proxy`, three times. Traps are the points where you intercept. The first wraps a config object. Setting `port` only forwards when the value is an integer from 1 to 65535. Setting `8080` lands on the real object. Setting `70000` throws a `RangeError` and leaves the port alone. Deleting any key throws. The second is a virtual proxy around a user. Reading `name` does nothing extra. Reading `orders` the first time records a load and stores one order with a total of 999. Reading `orders` again does not load again. The third records every property read. Adding `a` and `c` yields 4, and the read set is `a` then `c`. Nobody touched `b`. That is how a reactive library learns which fields a computation depends on.

When you talk about it, say this: same interface as the real thing. It stands in front and controls access.
