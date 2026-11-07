## The idea

Picture two gumball machines by the gym. The crank works the same way on both. You turn it, a candy drops, you hand that candy to a kid. The red machine's hatch drops a red gumball. The blue machine's hatch drops a blue one. You do not open the case and grab the candy yourself, and you do not write the color into the crank. The hatch is the only part that changes.

A factory method is that hatch. A base type owns the steps, and one method inside those steps is allowed to say `new`. Subclasses override that method and pick the class. The rest of the steps stay put. Callers use the crank. They do not name the concrete candy.

In code this shows up when one algorithm must create a product and should not know the concrete class. Sending a notification is the same job every time: make the notice, render it, return the channel and the payload. The only line that should vary is which notice gets constructed. An email notice renders as mail, with a subject. A text notice renders as a short message and cuts the body off at 160 characters. If the base `send` said `new EmailNotification` itself, every new channel would mean editing the shared steps. The hatch keeps that `new` in the subclass.

## Why it matters

The bug this pattern prevents is a shared procedure welded to one concrete class. The day you add texts, you either copy the whole send path or you sprinkle `if (channel === 'sms')` through steps that were never about picking a class. The factory method leaves one hook. The base service throws if a subclass forgets to fill that hook in, so you cannot turn the crank on the empty machine.

You already use this without the textbook name, usually as a function rather than a subclass. `document.createElement` takes a tag and returns the node. `http.createServer`, `net.createServer`, and `crypto.createHash` each hide a `new`. React's `createElement` and `createContext` do the same. `Array.from`, `Buffer.from`, and `Promise.resolve` are static factories: you call `from` or `resolve` and you get a product without deciding the construction details at the call site. ORM models expose `create` and `build`. `express.Router()` hands you a router. The subclass-override form is the textbook shape. Day to day, a keyed function is what you actually write.

An abstract factory is the bigger neighbor. One factory object hands you a whole family of products that belong together. A factory method makes one product, from one overridable method. A builder is the slow neighbor: one complex product, many steps, then a final build. Here the product comes back from the single hook, and the algorithm around that hook is the reason the hook exists.

## A small example

```javascript
function machine(drop) {
  return {
    turn(kid) {
      const gumball = drop(kid);
      return { kid: kid, color: gumball.color };
    },
  };
}

function redDrop(kid) {
  return { color: 'red', for: kid };
}

function blueDrop(kid) {
  return { color: 'blue', for: kid };
}

const red = machine(redDrop);
const blue = machine(blueDrop);
const fromRed = red.turn('Sam');
const fromBlue = blue.turn('Sam');
```

`turn` is the crank. `drop` is the hatch. Sam can use either machine, and the shared steps never mention red or blue.

## What the code below is doing

The sheet shows the same idea twice, and the second pass includes the everyday static form.

The first shape uses classes so the book names are visible. `Notification` is the product. It stores a recipient and a body, and `render` throws because the base notice does not know how to print itself. `EmailNotification` and `SmsNotification` are the concrete products. Mail includes a subject. A text slices the body to 160 characters. `NotificationService` is the creator. `send` is the algorithm: it calls `createNotification`, then returns the channel and the rendered payload. `createNotification` throws until a subclass implements it, so `send` on the bare service fails. `EmailService` and `SmsService` are the concrete creators. Each one sets its channel and is the only place that says `new` for its product. The checks show an email payload that starts as mail to the right address, a text payload that starts as SMS to the right number, and a 200-character body that is cut down on the text path only. Same `send`. Different hatch.

The second shape is how you would write it on a normal day. `createNotification` takes a channel name and looks it up in a map of makers. Email, sms, and push each return a small object with that channel and a `render`. An unknown channel, such as fax, throws. Push did not need a new subclass. The key picked the maker. Under that, `Money.from` is the static version people mean in ordinary speech. A string is read as dollars and stored as cents, so `"12.34"` becomes `1234`. A number is already cents, so `500` stays `500`. Both paths return a `Money`. The caller did not choose the branch. `from` did.

When you talk about it, say this: the `new` is the hook. A creator declares the factory method, a concrete creator overrides it, and that override picks the concrete product. A keyed function can pick the class the same way.
