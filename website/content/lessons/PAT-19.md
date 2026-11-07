## The idea

Picture a package you subscribed to. You did not ask the warehouse to learn your name, your email job, and your inventory job. You put your name on a list for that one box. When the box moves from "paid" to "shipped", everyone still on the list gets the update. Drop off the list and the box keeps moving without you. The box does not contain your job. It only contains the list.

That box is the subject. The people on the list are observers. The subject has `attach`, `detach`, and `notify`. A concrete subject holds the state that changes, here an order status, and calls `notify` when it changes. A concrete observer implements `update` and decides what it cares about. Email writes a line only when the next status is shipped. Inventory counts a decrement only when the next status is paid. Audit writes down every transition, because that subscriber asked for all of them.

The order must not import the emailer, the warehouse, or the analytics job. Those subscribers come and go. The order only knows "I have a list." When the status changes, it pushes the event to whoever is attached right now.

## Why it matters

The bug this pattern prevents is a package that grows a new phone number inside itself every time a new person wants news. Ship the order, then call email, then decrement stock, then ping analytics, then the fraud job someone added on a Friday. Now you cannot move a test box without those modules, and removing one subscriber means editing the box. A list keeps the order closed and the reactions open. Attach what you need. Unsubscribe when you do not.

You already do this whenever you subscribe. A store's `subscribe` runs your listener after each change and hands you a function that takes you off the list. Event emitters, `once`, and `off` are that list with extra manners. Streams, servers, and sockets speak this way too: one thing changes, many listeners hear it, and the thing that changed does not grow a method per listener.

Pub/sub is the pattern that sounds identical and is not. A broker sits between the publisher and the subscribers. They never hold each other. The channel might live in another process, and the news might arrive later. Observer is direct. The subject holds the list in memory and calls `update` itself, the way the package texts the people who wrote their names on its clipboard. Mediator is the other mix-up. A mediator contains the rules between peers: this field clears that field. An observer does not coordinate the list. It says "I changed" and lets each subscriber react on its own.

## A small example

```javascript
function createOrder(id) {
  let status = 'created';
  const listeners = new Set();
  return {
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    setStatus(next) {
      const prev = status;
      status = next;
      listeners.forEach((fn) => fn({ id, prev, next }));
    },
  };
}

const order = createOrder('o-1');
const sent = [];
const unsubscribe = order.subscribe((event) => {
  if (event.next === 'shipped') sent.push(event.id);
});
order.setStatus('shipped');
unsubscribe();
```

The order never mentions email. The subscriber decides that only `shipped` is worth recording. After `setStatus('shipped')`, `sent` is `['o-1']`. After `unsubscribe()`, a later status still updates the box and does not call this listener.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the names are visible. `Subject` keeps observers in a `Set`. `attach` adds one and returns a function that takes it off the list. `notify` copies the set before looping, so a subscriber can detach itself in the middle of a delivery without skipping someone or getting called twice. `Order` is the concrete subject, the package. `setStatus` remembers the previous status, writes the next one, and notifies with the previous and the next. `EmailNotifier`, `InventoryUpdater`, and `AuditLog` are the concrete observers. Email pushes a line only for shipped. Inventory counts only paid. Audit records every arrow from old status to new.

Three attaches, then paid, then shipped: inventory moved once, email sent one shipped line, and audit has both lines. Unsubscribing audit and detaching inventory means a later "delivered" changes nothing for them, and one subscriber is left on the list. Attaching email a second time does not double the set, so the next shipped event adds one more email, not two. A one-shot subscriber removes itself inside `update`, hears "returned", and stays silent for "refunded".

The second shape is the version you actually write. An event emitter is a subject keyed by event name. `on` stays on the list, `once` drops off after the first emit, `off` removes a listener, and `emit` returns false when nobody is listening. The pay event fires, the lasting listener and the one-shot listener both record the first id, and only the lasting listener records the second. Then a small store: `getState`, `setState`, `subscribe`. Two cart updates push `1` and `2` to the subscriber. Unsubscribe. The third update still changes the cart to `3` and does not push another render. That store is the list under the state libraries you already use. Same package. Different names on the clipboard.

When you talk about it, say this: subscribe to a subject. It pushes changes to everyone listening. Unsubscribe to stop.
