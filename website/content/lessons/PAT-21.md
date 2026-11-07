## The idea

Picture one Attack button and a handful of chips you can plug into the controller. A sword chip. A bow chip. The button does not grow a switch statement. You plug in a chip, you press Attack, and the chip does the work. Tomorrow you plug in a different chip. Same button. Different hit.

That chip is a strategy. The controller is the context. It holds one strategy and delegates to it. The chips share a shape, here `calculate(order)`, and they do not call each other. Flat rate is the sword: it returns a fixed number of cents and ignores the package. Weight-based is the bow: it multiplies kilograms by a rate and will not go under a minimum. Free-over-a-threshold is a chip snapped on top of another chip. If the subtotal clears the line, shipping is zero. Otherwise it asks the fallback chip to take the swing.

You choose the chip at runtime. Checkout does not contain `if (method === 'flat')`. Adding overnight shipping means cutting a new chip, not opening every total in the program and teaching it a new case.

## Why it matters

The bug this pattern prevents is a copied switch. The shipping method is checked in the cart, again at tax, again on the receipt. The payment provider is checked in charge, again in refund. The day you add a method you miss one switch, and that screen still swings the old sword. A family of functions behind one call stays in one map. The button keeps working.

You already pass chips without the textbook name. `sort` takes a comparator. The array does not know whether you care about age or name. You plugged that in. Auth providers behind one `verify`, storage engines behind one save, and a hash function that might be one algorithm or another are the same slot. The caller picks the chip. The call stays `calculate`, `verify`, or `sort`.

State looks identical on a class diagram and means the opposite. Strategies are picked by you, from the outside, and they do not know each other. The sword chip does not decide it is time to become the bow. States switch themselves: a paid order decides that ship leads to shipped, the way a vending machine changes its own mode when you press a legal button. Same structure, a context delegating to a swappable object. Opposite intent. Template method is the other split. A template keeps the recipe and lets someone fill a blank step. Strategy throws out the whole swing and plugs in another chip. You compose it. You do not inherit it. Command is a third neighbor. A command is a request to do something, often with a way to undo it. A strategy is how to compute something. `calculate` returns cents. It is not "the user clicked ship."

## A small example

```javascript
function flatRate(cents) {
  return () => cents;
}

function byWeight(centsPerKg) {
  return (order) => Math.ceil(order.weightKg * centsPerKg);
}

function checkout(shipping) {
  return {
    total(order) {
      return order.subtotalCents + shipping(order);
    },
  };
}

const order = { subtotalCents: 8000, weightKg: 2 };
const flat = checkout(flatRate(599)).total(order);
const byKg = checkout(byWeight(300)).total(order);
```

`checkout` never asks which chip it is holding. It presses Attack. `flat` is 8000 plus 599. `byKg` is 8000 plus 600, because 2 kilograms at 300 cents is 600. Swap the function, keep the call.

## What the code below is doing

The sheet shows the same button in three everyday shapes.

The first shape uses classes so the names are visible. `FlatRateShipping`, `WeightBasedShipping`, and `FreeOverThreshold` are the chips. Each implements `calculate(order)`. The free-over chip holds another strategy as `fallback`, so you can stack a rule on a rule without either one knowing the checkout. `Checkout` is the controller. `total` adds the subtotal to whatever the plugged-in chip returns. `setShipping` swaps the chip at runtime and returns `this`, so a chain reads as "pull this chip, press Attack." On an 8000-cent order that weighs 2.5 kg, the flat chip at 599 yields 8599. The weight chip at 300 cents per kilogram yields 8750. A 0.5 kg order hits the 500 cent minimum, so the total is 8500. The promo chip, free over 5000 with the flat chip underneath, charges 8000 on the big order and 2599 when the subtotal drops to 2000 and the fallback has to swing.

The second shape drops the classes. `pricingStrategies` is a plain object of functions: standard, member, bulk, and coupon. `price` looks up the key and throws if you name a chip that is not in the controller. Bulk discounts only when the quantity is at least 10. Under that, it is a normal swing. Coupon subtracts a fixed amount and never goes below zero. Adding a strategy is adding a key. The call site does not grow a branch.

The third shape is auth, the chip you plug into a login button. Password, api key, and oauth each expose `verify` with the same call. `authenticate` returns false for an unknown kind, so a provider you have never cut a chip for is a denial, not a crash. The last fragment is the strategy you have already used. `sort` with a by-age chip and a by-name chip orders the same two people two ways, and reversing the comparator is composing a chip, not editing `sort`. Same button. Different plug.

When you talk about it, say this: plug in the algorithm. Same call, different implementation, chosen at runtime.
