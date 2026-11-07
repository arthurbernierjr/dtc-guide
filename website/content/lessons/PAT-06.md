## The idea

Picture a travel plug. The hotel wall has round holes. Your game has two flat prongs. The electricity is the same. The shape is wrong, and you do not own the wall or the game's plug, so you cannot reshape either one. You snap a small converter in between. The game still thinks it is plugged into a flat-prong outlet. The wall still thinks it received a round plug.

An adapter is that converter. The target is the interface your code already expects. The adaptee is the thing you have, with a shape you cannot change. The adapter implements the target by holding the adaptee and translating each call. That wrap is the object adapter: composition, not a subclass that pretends to be both. The client only talks to the target. Swap the converter and the client code stays still.

In code the mismatch is often a payment call. Your checkout says `charge` with cents, a currency, and a token, and it wants a promise of `{ ok, id }`. A legacy vendor SDK says `sale` with a dollars string like `"19.99"`, a nonce, and a callback. Cents have to become a two-decimal string. The callback has to become a promise. The vendor's transaction object has to become your small result. Neither side is yours to rewrite.

## Why it matters

The bug this pattern prevents is your business code learning a vendor's dialect. If checkout calls `sale` itself, every caller knows about dollar strings, nonces, and callbacks. The next vendor, one that already speaks `charge`, cannot drop in. With the adapter, checkout sums the cart and calls `charge`. A native gateway and a wrapped legacy SDK both honor that call. The asserts on the sheet show the same cart producing a Stripe-style id through one path and a Braintree-style id through the other.

You already use this without the textbook name. `util.promisify` and `util.callbackify` convert between callbacks and promises. Axios runs one request API over XHR, Node's http, or fetch by swapping adapters. `Readable.toWeb` and `Readable.fromWeb` convert between Node streams and WHATWG streams. Knex dialect drivers hide pg, mysql2, and sqlite behind one interface. Your own wrappers around Stripe, Twilio, or S3 are adapters with names like a payment gateway, a mailer, or a blob store. Mapping an API payload into your domain model is the same job, done on data instead of on methods.

A decorator is the neighbor that keeps the same interface and adds behavior, like a power strip with a switch on the plug you already had. An adapter changes the interface. A facade builds a new, simpler front for a whole subsystem. An adapter makes one existing object fit an API you already had. A proxy keeps the same interface and controls access: same prongs, and it decides whether the power is allowed to flow.

## A small example

```javascript
function euroBrick() {
  return {
    charge(volts, done) {
      done(null, { flowed: volts === 230 });
    },
  };
}

function usAdapter(brick) {
  return {
    plugIn(device) {
      return new Promise((resolve) => {
        brick.charge(230, (err, result) => {
          resolve({ device: device.name, on: !err && result.flowed });
        });
      });
    },
  };
}

const outlet = usAdapter(euroBrick());
const lamp = outlet.plugIn({ name: 'lamp' });
```

The lamp calls `plugIn`. The brick only knows `charge` plus a callback. The adapter speaks volts to the brick and turns the callback into a promise. `lamp` is that promise.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `LegacyBraintreeSdk` is the adaptee. `sale` wants a dollars string with two decimals, a nonce, and a callback. A bad amount errors. A good sale's transaction id is `bt_` plus the nonce. The target is `charge({ amountCents, currency, token })`, a promise of `{ ok, id }`. `StripeGateway` is a native target, not a wrapper. Its id is `ch_`, the token, and the cents. `BraintreeGatewayAdapter` is the adapter. It rejects a currency other than USD, turns cents into a two-decimal string, and wraps `sale` in a promise. Success becomes `{ ok, id }` from the vendor result. `checkout` is the client. It sums `cents * qty` and calls `charge`. It never mentions `sale`. The cart is one line, `1999` cents, quantity 2, token `nonce42`, so the charge is `3998` cents. Stripe returns `ch_nonce42_3998`. The adapter returns `bt_nonce42`. One cent in EUR rejects with the USD-only error.

The second shape is how you would write it on a normal day. `promisify` is the ready-made callback-to-promise adapter. `sale('10.00', 'n1')` resolves with `bt_n1`. `sale('10', 'n1')` rejects, because `"10"` is a bad amount. `adaptBraintree` promisifies `sale` and returns `charge`. It converts cents and maps the result. It does not repeat the currency check. Two hundred fifty cents and token `n2` come back as `bt_n2`. `toCustomer` is the data-shape adapter, the kind you write most often. `customer_id` becomes `id`, the name fields become one trimmed name, and a missing email becomes null. Ada maps to id `c1`, name `Ada L`, and her email. Bob, with no contact, maps to a null email.

When you talk about it, say this: a plug converter. Same electricity, new shape. The target is the interface you want, the adaptee is the thing you have, and the adapter implements the target by wrapping the adaptee. The client only sees the target.
