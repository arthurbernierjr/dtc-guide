## The idea

Picture a group chat. Ada wants Bob and Cy to hear "deploy at 5?" She does not open Bob's phone, then Cy's phone, then check who already left. She talks to the room. The room knows who is still in it and drops the line in every other inbox.

That room is a mediator. The people are colleagues. Each one holds a single handle, the room, and nobody holds a handle to anybody else. A colleague reports what just happened. The room decides what else has to change.

A checkout form is the same chat with worse wiring if you skip the room. Country, region, zip, and the submit button all care about each other. Pick a country and the region list has to reset. Type a zip and it has to match that country. Submit stays dark until the rest is valid. If every widget stores the other three, you get a hairball. One new field means every old field grows a new wire, the way a group chat falls apart when everyone starts texting each other on the side.

Put one coordinator in the middle. A widget calls `notify` with itself and an event name. The coordinator is the only object that knows the rules: US regions are CA and NY, a US zip is five digits, submit turns on only when country, region, and zip are filled and the zip has no error.

The book names are Mediator, ConcreteMediator, and Colleague. The mediator's job is `notify(sender, event)`. The concrete mediator knows every colleague and owns the coordination rules. A colleague talks only to the mediator.

## Why it matters

The bug this pattern prevents is a rule that lives in two places and drifts. Country clears the zip. Zip also clears itself when it feels like it. Submit enables itself from a third copy of the same check. A year later those copies disagree, and a Canadian postal code gets judged with a US pattern. In the chat picture, that is three people forwarding the same news and one of them forwarding an old version.

You already sit in this shape. When you lift state up, the parent is the room and the children are the colleagues. They call back. They do not call across. A chat server is the same hub: clients never open a socket to each other. They send to the server, and the server fans the message out. A store that components dispatch into works the same way. The rules sit in one place, not in every button.

Observer is the pattern people reach for and then regret. An observer subject holds a list and says "I changed." The listeners are anonymous. The subject does not know that a country change should wipe a zip code. That decision is logic, and the logic belongs in the mediator. You can build a mediator out of observers, the way a chat room is built out of inboxes. The jobs stay different. Observer broadcasts a fact. Mediator coordinates peers. A facade is a different neighbor: one front door, one direction, hiding a subsystem behind a simpler call. A mediator is two-way. Events come in from colleagues, and changes go back out to other colleagues.

## A small example

```javascript
function createRoom() {
  const members = new Map();
  return {
    join(name) {
      const inbox = [];
      members.set(name, inbox);
      return {
        inbox,
        say(text) {
          for (const [n, box] of members) {
            if (n !== name) box.push(`${name}: ${text}`);
          }
        },
      };
    },
  };
}

const room = createRoom();
const ada = room.join('ada');
const bob = room.join('bob');
ada.say('hi');
```

Ada never touches Bob's inbox. The room does. After `ada.say('hi')`, Bob's inbox holds `"ada: hi"` and Ada's inbox stays empty, because the room skips the sender.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the names are visible. `Widget` is the colleague. It stores a mediator, and `changed` calls `notify`. `Select`, `TextInput`, and `Button` are the people in the room, and the room is a form. `CheckoutFormMediator` points every widget at itself and starts with region disabled. `notify` is the rulebook. A country select loads that country's regions, enables region when the list is not empty, and clears the zip. A zip input checks the postal pattern for the current country. A submit click, only if the button is enabled, records country, region, and zip. After every event, submit turns on only when all three are filled and the zip has no error.

The asserts walk one checkout. Region starts off. Selecting US sets the options to CA and NY. Zip `1234` errors and leaves submit off. `10001` clears the error and turns submit on. The click records one row. Switching to CA nulls the region, blanks the zip, and disables submit. A click on that disabled button does not count. Country never called region. They only talked to the room.

The second shape is the group chat as a function. `join` hands back an inbox, `say`, `dm`, and `leave`. `say` writes every inbox except the sender. `dm` throws if the name is gone. `leave` drops the member. Ada's line lands in Bob's inbox and Cy's, not her own. Bob's direct message lands only with Ada. After Cy leaves, later lines miss Cy, a direct message to Cy throws, and the room size is 2.

When you talk about it, say this: hub and spoke. Peers never reference each other. All the traffic goes through the coordinator.
