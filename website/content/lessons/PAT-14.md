## The idea

Picture a restaurant ticket. The waiter does not shout "burger, no onion" and hope the kitchen heard. They write it on a slip. The slip is a thing. You can stack slips, hand the stack to the kitchen, void the top slip when somebody changes their mind, and send a voided slip back out if they change it again. The kitchen cooks. The pad remembers what was sent, and in what order.

A command is that slip. You encapsulate a request as an object. Then you can pass different requests around, queue them, log them, and undo them. The command interface is `execute` and `undo`. A concrete command binds a receiver and the arguments: which buffer, where, and what text. The receiver does the actual work. The invoker triggers commands and keeps history. It does not touch the text itself. The client is whoever writes the slip.

Undo, redo, a job queue, a macro, and an audit log all need "the thing to do" as a value you can store, replay, and reverse.

## Why it matters

The bug this pattern prevents is history you cannot rewind. A text box that inserts by calling the buffer directly has nothing to undo unless it also keeps a secret copy of every old string. The slip already knows how to reverse itself. An insert removes the same span. A delete remembers the characters it took, because "delete 6" is not enough to put those characters back.

You already pass slips around. A Redux action, `{ type, payload }`, is a command. The reducer is the receiver. `dispatch` is the invoker. A BullMQ job or an SQS message is a slip sitting in a queue. Event sourcing stores the slips and rebuilds state by replaying them. Editor undo stacks, ProseMirror transactions, and Monaco edit ops are this pattern with a cursor. A database migration has `up` and `down`. CLI frameworks turn each verb into a command object. A function you hand to `setTimeout` or `queueMicrotask` is a command too. In JavaScript the slip can be a function.

A strategy is how to do one job. You swap the algorithm, and you do not keep a history of the swaps. A command is what to do: the request plus its arguments, often undoable and queueable. A memento stores state so you can restore a snapshot. A command stores the operation and knows how to reverse that operation.

## A small example

```javascript
function makePad() {
  const done = [];
  return {
    write(ticket) {
      ticket.do();
      done.push(ticket);
    },
    voidLast() {
      const ticket = done.pop();
      if (ticket) ticket.undo();
      return ticket;
    },
  };
}

const plate = { text: '' };
const pad = makePad();
pad.write({
  do() { plate.text = 'burger'; },
  undo() { plate.text = ''; },
});
pad.voidLast();
```

After `write`, the plate says `burger` and the pad holds one ticket. After `voidLast`, the plate is empty. The kitchen never stored the history. The ticket did.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `TextBuffer` is the receiver. `insert` splices a string in at a position. `remove` cuts a span and returns the cut text. `InsertCommand` binds the buffer, the position, and the string. `execute` inserts. `undo` removes that many characters at that position. `DeleteCommand` also stores `removed`. `execute` fills it from the buffer. `undo` inserts those exact characters back. `Editor` is the invoker. It has an undo stack and a redo stack. `run` executes, pushes the command, and clears redo. `undo` pops, undoes, and pushes onto redo. `redo` does the reverse. Both return false when their stack is empty.

The buffer starts empty. Insert `Hello World` at 0. Delete 6 characters at position 5, which is the space and `World`. Insert `, Ada` at position 5. The text is `Hello, Ada`. One undo drops the insert and leaves `Hello`. The next undo reverses the delete using the remembered ` World`, so the text is `Hello World` again. Redo runs that delete once more and leaves `Hello`. Depth is 2 undoable and 1 redoable. A new insert of `!` at position 5 clears the redo stack, depth becomes 3 and 0, and `redo` returns false. Draining `undo` walks the buffer back to an empty string.

The second shape is a plain `{ do, undo }` object plus a history, and then serializable actions. `makeHistory` is the pad: `exec`, `undo`, and `redo`. A cart is a `Map`. `addItem` returns a ticket that adds a quantity and, on undo, subtracts it, deleting the key when the count hits zero. Two of `A`, one of `B`, and one more `A` leave `A` at 3 and `B` at 1. Two undos leave only `A` at 2. One redo puts `B` back.

The Redux picture treats the action as the command, the reducer as the receiver, and dispatch as the invoker. Because the actions are plain data, a log of deposit 500, withdraw 120, and deposit 20 replays to 400 cents. A JSON round trip of that log still replays to 400, so the slips can sit in a queue or a database. Replaying only the first two leaves 380.

When you talk about it, say this: turn a method call into an object so you can store it, queue it, undo it, and replay it.
