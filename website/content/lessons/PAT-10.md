## The idea

Picture a messy building with a stockroom, a cash box, a mail slot, and a note on the fridge. You do not get a map of the hallways. You get one front door. You say what you want. Somebody inside visits those rooms in the right order and comes back with a yes or a no.

A facade is that door. It is one higher-level object in front of a set of objects that each do real work. Those inner objects do not know the door exists. They do not call each other. The client, a controller or a script or a timer, calls one method. The method knows the sequence, including what to undo when a later step fails.

Placing an order is the messy building. Inventory has to have the item. Payment has to take the money. Shipping has to print a label. Email has to tell the customer. Do it in that order. If the card is declined, put the stock back. Three controllers that each copy that dance will drift apart the first time the dance changes.

## Why it matters

The bug this pattern prevents is a copied script. One controller forgets to release the reservation. Another sends the email before the charge. A third checks stock with a slightly different rule. The building still has four rooms. The door is the only place that knows the tour. Fix the tour once.

You already walk through doors like this. `fs.readFile` opens, stats, reads, and closes behind one call. `fetch` and axios sit on top of sockets, redirects, and turning a body into text. Calling `express()` hides `http.createServer`, the router, and the parsers. jQuery's ajax call and its selector function hide a pile of browser details. `execSync` hides a spawned process. A backend `placeOrder` function is this pattern with a business name. A payments SDK that creates a checkout session hides auth, retries, and serialization. You call one method. The rooms stay on the other side of the door.

An adapter converts one interface so it matches an interface you already have. A facade invents a new, simpler interface over several objects. A mediator sits in the middle of peers that call back into it. A facade is one-way. The stockroom does not know it was called from an order. You can still walk into the stockroom yourself when you need a single room. The door is a shortcut, not a lock.

## A small example

```javascript
function stockroom(sku, qty) {
  return qty > 0 ? sku + ' reserved' : 'missing';
}

function cashBox(cents) {
  return 'paid ' + cents;
}

function mailSlot(address) {
  return 'label for ' + address;
}

function placeOrder(order) {
  const reserved = stockroom(order.sku, order.qty);
  if (reserved === 'missing') return { ok: false, reason: 'out of stock' };
  const paid = cashBox(order.qty * order.cents);
  const label = mailSlot(order.address);
  return { ok: true, reserved, paid, label };
}

const tray = placeOrder({ sku: 'muffin', qty: 2, cents: 300, address: '1 Main' });
```

`placeOrder` is the only function the caller needs. The stockroom, the cash box, and the mail slot stay ordinary functions. They never mention an order.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `InventoryService`, `PaymentService`, `ShippingService`, and `EmailService` are the subsystem classes. Inventory starts with five of `SKU-1` and zero of `SKU-2`. It can check, reserve, and release. Payment pushes a charge and returns an id, and it throws `card declined` for one hard-coded customer. Shipping stores a label. Email stores a message. None of them imports the others.

`OrderFacade` is the door. `placeOrder` checks stock and returns `out_of_stock` before it touches anything else. On a hit it reserves, then charges `qty * unitCents`. If the charge throws, it releases the reservation and returns the error message. That undo lives in this one method. On success it creates a label, sends "Order confirmed" with the charge id, and returns `ok` with both ids.

The happy order buys two of `SKU-1` at 1500 cents. Stock falls from 5 to 3. The charge is 3000 cents. The email names charge `ch_1`. The label is `lbl_1`. An order for `SKU-2` comes back out of stock, and the label list stays at one. A declined card for three more units comes back `card declined`, stock is still 3, and no second email goes out. After all of that, calling `charge` on the payment object directly still works and returns `ch_2`. The rooms did not become private.

The second shape is a single function in front of a few built-ins. A `sha256` helper feeds a string into the streaming hash API and returns the hex digest. The digest of `abc` is the well-known SHA-256 value. `parseEnv` is a door in front of split, trim, filter, and a search for `=`. Blank lines and lines that start with `#` drop out. Quotes around a value come off. A tiny env blob becomes `DB_URL` and `PORT`. `isSameOrigin` asks the URL parser for two origins. `https://x.io/a` and `https://x.io:443/b` match, because 443 is already the https port. `https` and `http` on the same host do not.

When you talk about it, say this: one door in front of a messy building.
