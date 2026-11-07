## The idea

Picture a vending machine. The same buttons stay on the front all day. What they do depends on the mode the machine is in. While it is idle, Coin is legal and Vend is not. After the coin, Vend is legal and Coin is a shrug. While it is already dropping a snack, both buttons are the wrong move. You do not want one giant function full of "if idle, else if paid, else if vending" copied into every button.

That mode is a state object. The machine is the context. It holds the current mode and forwards every button press to it. Each concrete state implements only the moves that are legal there, and that state picks the next mode. The idle object's coin swaps in the paid object. The paid object's vend swaps in the vending object. Asking a mode for a button it does not allow throws, so a bad press does not slide through as a quiet no-op you notice after the snack fails to fall.

An order is the same machine. Created, paid, shipped, delivered, and cancelled are modes. Pay, ship, deliver, and cancel are the buttons. The order does not switch on a status string inside every method. It delegates. The book line is a finite state machine where each state is an object. The machine looks like it changed class, because `ship` while created and `ship` while paid are not the same function. A different object is behind the panel.

## Why it matters

The bug this pattern prevents is a status string checked in four methods that slowly disagree. `pay` thinks a brand-new order can ship. `ship` thinks it cannot. `cancel` refunds money that was never inserted, because the refund line was copied from the paid mode into the idle mode. Every new mode means opening every button, and the button you forget becomes a bad transition. The machine takes the coin and also vends from empty.

You already live with machines like this. A promise is pending, then fulfilled or rejected, and then the buttons freeze. A socket has a ready state and ignores the wrong call. An upload widget moves idle, uploading, done, or error, and Start in the done mode must not begin a second upload by accident. Checkout steps and subscription lifecycles are the same front panel, whether you build the modes as classes or as a table of allowed presses.

Strategy wears the same jacket and means the opposite. In both patterns a context holds a swappable object and calls it. With strategy, you pick the chip from the outside, and the chips do not know each other. A flat-rate shipper does not decide, on its own, to become a weight-based shipper after lunch. With state, the mode itself triggers the next mode. Paid knows that the ship button leads to shipped. The client did not reach in and swap the object. The machine did, because someone pressed a legal button.

## A small example

```javascript
function vend() {
  const modes = {
    idle: { coin: 'paid' },
    paid: { vend: 'vending' },
    vending: {},
  };
  let mode = 'idle';
  return {
    get mode() { return mode; },
    press(event) {
      const next = modes[mode][event];
      if (!next) throw new Error(`cannot ${event} when ${mode}`);
      mode = next;
    },
  };
}

const machine = vend();
machine.press('coin');
machine.press('vend');
```

`press` looks at the row for the current mode. Coin from idle moves the machine to paid. Vend from paid moves it to vending. Vend from idle throws `cannot vend when idle`, because that button is not on the idle row. Same panel. Different mode.

## What the code below is doing

The sheet shows the same machine three ways.

The first shape uses classes so the names are visible. `OrderState` is the mode interface. `pay`, `ship`, `deliver`, and `cancel` all default to `illegal`, which throws `cannot ${event} when ${name}`. `CreatedState` is idle: pay and cancel are legal. Pay records the cents taken and swaps in `PaidState`. Cancel swaps in `CancelledState` and refunds nothing, because no coin went in. `PaidState` allows ship, which writes a tracking code and moves to `ShippedState`, and cancel, which records the refund before cancelling. `ShippedState` only allows deliver. There is no cancel on that panel, so the base class throws. `DeliveredState` and `CancelledState` add no buttons. They are terminal modes. `Order` is the machine. It starts on created, and each method is one line of delegation. No status `if` sits inside `pay` or `ship`.

The asserts follow two walks up to the same glass. Pay, ship, deliver ends at delivered, the history is created then paid then shipped then delivered, and cancel throws. Pay then cancel refunds the full amount: same cancel button, different mode, so it gives the money back. Cancel before pay refunds zero. Ship from created throws. Cancel after ship throws, because the shipped mode left that button off on purpose.

The second shape is that panel as a table. `documentMachine` maps draft, review, published, and archived to the presses each mode allows. `send` throws if the press is not on the current row. Review's entry runs every time you arrive, so submit, reject, submit, approve leaves the review count at 2 and the mode at published. Archived's row is empty: a terminal mode, written as data.

The third shape is a reducer keyed by status. Idle can start. Uploading can progress, finish, or fail. Done has no start key, so a late start leaves the machine sitting there. The snack already fell. Mashing the button does not vend twice.

When you talk about it, say this: a finite state machine where each state is an object.
