## The idea

Picture two kids who cannot share food. One lunch is a pizza kit: pizza crust, pizza sauce, pizza cheese. The other is a taco kit: taco shell, salsa, taco cheese. If you put pizza sauce on a taco shell, you didn't pack two lunches. You packed a mess.

An abstract factory is the person who hands you the whole kit. You don't pick the sauce yourself. You say "pizza kit" or "taco kit", and every piece you get belongs together.

In code the kit is a family of objects that only work as a set. A Stripe charger, a Stripe refunder, and a Stripe signature checker. Or the PayPal versions of those three. The factory is one object with methods like `createCharger()`, `createRefunder()`, and `createVerifier()`. You hold one factory. Everything you create comes from that one family.

## Why it matters

The bug this pattern prevents is mixing families. A Stripe charge id looks like `ch_1999`. A PayPal refund looks for an id that starts with `PAYID-`. Charge with Stripe and refund with PayPal, and the refund quietly does the wrong thing. Plain JavaScript will not catch that for you. The factory does, because the code that checks out never reaches into two kits at once.

You already use this without the textbook name. A database client doesn't hand you a Postgres query compiler and a MySQL schema compiler. One client builds the whole set for one database. Swap the client, swap the kit. A cross-platform UI kit works the same way: one factory, and the button, the input, and the dialog all look like they belong on the same phone.

Factory Method is the smaller cousin. It makes one product, and a subclass decides which one. Abstract Factory makes the lunchbox: several products, and the factory object you are holding decides the family. A factory usually does that with factory methods. They stack. They are not rivals.

## A small example

```javascript
function pizzaKit() {
  return {
    crust: () => 'pizza-crust',
    sauce: () => 'pizza-sauce',
  };
}

function tacoKit() {
  return {
    crust: () => 'taco-shell',
    sauce: () => 'salsa',
  };
}

function makeLunch(kit) {
  return { base: kit.crust(), topping: kit.sauce() };
}

const lunch = makeLunch(pizzaKit());
```

`makeLunch` only ever sees one kit. You never write `pizzaKit().crust()` next to `tacoKit().sauce()`.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `PaymentFactory` is the abstract factory. Its methods throw, because the base kit doesn't know how to make a real product. `StripeFactory` and `PayPalFactory` are the concrete factories. `StripeCharger`, `StripeRefunder`, and `StripeVerifier` (and the PayPal twins) are the products. `checkoutFlow` is the client. It asks the factory for a charger and a refunder, charges, then refunds with the matching refunder. The asserts show a Stripe charge refunds on Stripe and does not refund on PayPal. Calling `createCharger` on the bare `PaymentFactory` throws.

The second shape is how you would write it in JavaScript on a normal day: a plain object per family, chosen once from config. `providers.stripe` and `providers.paypal` each carry a charger, a refunder, and a verifier. Same rule. Less ceremony.

When you talk about it, say this: one factory object hands you a whole consistent kit. Swap the factory, swap the kit.
