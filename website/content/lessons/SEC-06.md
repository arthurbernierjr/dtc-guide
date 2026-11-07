## The idea

Picture a board game that never says you have to move forward. The printing is sharp. The dice are fair. A player slides backward onto the bank space, collects, and does it until the box is empty. You followed the dice. The designer never wrote the rule that would have stopped it.

That is Insecure Design. The design itself permits the abuse. Implementing each step faithfully still does the wrong thing, because the wrong thing was allowed. An implementation bug means the rule was coded wrong. A design flaw means the rule was never made. The real control is an invariant the server enforces in one place. Quantity is a whole number from 1 to 99. The price comes from your catalog. A coupon is single-use. The total stays at zero or above. A balance change runs inside a lock, or as one conditional update, so two requests cannot both spend the same money. A short code such as a one-time password sits behind a token bucket: a few tries, then a slow refill. Before you build the feature you ask how it gets abused, and you write the answer as STRIDE: spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege.

Failure looks like the missing rule. A negative quantity turns a charge into a credit. A coupon applies on every order, and the total drops below zero. Two requests both read a balance of 100 and both write 0, so twice the money leaves. A six-digit code can be tried all afternoon because the design never counted attempts. The checks live in the page, and a client that skips the form skips the checks.

## Why it matters

Careful code inside a loose rule still ships the loose rule. A review that hunts for typos will approve it. On the 2025 OWASP list this is Insecure Design, and you settle it in the ticket, while the behavior is still a sentence.

The harm shows up in money, inventory, and accounts that do what the code says. Races appear when the feature gets popular. Unlimited tries appear when a script finds the route. Checks that live only in the browser disappear the moment a client skips the form.

Write the abuse case beside the story. The browser may send a sku and a quantity. Your server owns the price. Enforce that in the function that charges. Serialize the balance update per account. Put a token bucket on any route a script would hammer, and say the six STRIDE names while you design.

## A small example

```javascript
function lineTotal(unitPriceCents, qty) {
  if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
    throw new Error('invalid qty');
  }
  if (!Number.isInteger(unitPriceCents) || unitPriceCents < 0) {
    throw new Error('invalid price');
  }
  return unitPriceCents * qty;
}

const total = lineTotal(2500, 2);
```

`total` is `5000`. Quantity has to be a whole number from 1 to 99. The price is cents your server chose, and a negative price throws before any math.

## What the code below is doing

Four blocks. Three are rules a server can enforce. One is the vocabulary you use while designing.

The order flow is `checkout`. The cart is a non-empty array of at most 50 lines. Quantity is an integer from 1 to 99. The sku has to exist in `products`, and the cents come from that map. A coupon has to exist, stay under `maxUses`, and land in `usedBy` for that user. `Math.max` keeps the total at zero or above. A second use throws. The asserts cover a negative quantity, a fractional quantity, an unknown sku, a total clamped at zero, and a coupon the next caller finds exhausted.

The balance race is `withdraw` inside `withLock`. One withdrawal occupies the critical section for that user at a time. After a pause that stands in for a round trip, the code subtracts only when the balance still covers the amount. Three withdrawals of 100 against a balance of 100 produce one success and a final balance of 0. A non-positive amount returns false. The comment points at idempotency keys so a retry does not charge twice.

The limit is `TokenBucket`. `otpLimiter` stores five tokens and refills one per minute. Five takes succeed, the sixth fails, another key still succeeds, and the first key succeeds again after a minute. The comment says to bind the code to the session and expire it in a few minutes.

STRIDE is a frozen map of six threats to the property you are protecting: authentication, integrity, audit logging, confidentiality, availability, and authorization. An assert checks that all six names are present.

When you talk about it, say this: ask how you would abuse the feature, then write that answer as a rule the server enforces.
