## The idea

Picture a remote and a TV, designed as two pieces from the start. The remote has the buttons. The TV is the box that actually carries the action out. A fancy remote and a basic remote are one family. A living-room TV and a kitchen speaker are another family. You can hand either remote either box. You do not manufacture a separate gadget for every remote-and-box pair. Two remotes plus two boxes is four combinations from four pieces.

A bridge is that split. One hierarchy is the abstraction: what you mean. The other is the implementor: how a particular device carries it out. The abstraction holds an implementor and delegates. Refined abstractions change the meaning. Concrete implementors change the delivery. They vary on their own. The count is N plus M classes, not N times M fused subclasses.

In code the explosion is messages times channels. Urgent alerts and digests are kinds of notice. Email, SMS, and push are ways to deliver them. Subclassing the pairs gives you a class for every combination. Add a channel and you write it again for every kind of notice. Compose them and a new channel is one implementor. A new kind of notice is one abstraction. Two refined notices plus three transports are six combinations from five classes.

## Why it matters

The bug this pattern prevents is a class list that multiplies every time either side grows. Change the urgent prefix and you would edit every channel. Change the SMS length rule and you would edit every kind of notice. With the bridge, `UrgentAlert` only knows the uppercase text and the action-required subject. `SmsTransport` only knows it has no subject, so it glues subject and body into one short text. You can swap the transport on a live alert from email to push, and the alert class does not change.

You already use this without the textbook name. Winston and pino are a logger over pluggable transports. React's reconciler is the component model, and react-dom, react-native, and ink are host renderers. An ORM query API over dialect drivers is the same split. Expo and React Native modules put one JavaScript API over iOS and Android. Node's `http` and `https` share one request API over different sockets.

An adapter is bolted on later, so something you do not control can fit an interface you already have. A bridge is drawn up front, so both sides are allowed to grow. A strategy also sits behind an object and swaps behavior. A strategy swaps one algorithm. A bridge swaps a whole implementation hierarchy. The picture is similar, an outer object delegating to an inner one, and the reason is different.

## A small example

```javascript
function tv(action) {
  return { device: 'tv', action: action };
}
function speaker(action) {
  return { device: 'speaker', action: action };
}
function basicRemote(device) {
  return { power: () => device('power') };
}
function fancyRemote(device) {
  return {
    power: () => device('power'),
    mute: () => device('mute'),
  };
}
const livingRoom = fancyRemote(tv).mute();
const kitchen = basicRemote(speaker).power();
```

`livingRoom` is mute on the TV. `kitchen` is power on the speaker. No class was fused out of a remote plus a device.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. The implementor shape is `send(to, subject, body)`. There is no separate interface class. `EmailTransport`, `SmsTransport`, and `PushTransport` are the concrete implementors. Email records via, to, subject, and body. SMS has no subject, so it stores one `text`, subject plus body, cut at 160 characters. Push stores a title and a body. `Notification` is the abstraction. It holds a transport, and `notify` sends to `user.contact` with `subject()` and the text. The base subject is "Notification." `UrgentAlert` and `Digest` are the refined abstractions. They change what the notice means, not how it travels. Urgent sets the subject to "[URGENT] Action required" and uppercases the text. Digest takes the items, sets the subject from the count, and joins them with ` | `. The checks send Ada an urgent email, Bob an urgent text, and Ada a push digest of two items. The log shows the uppercase email body, the SMS text with the urgent subject glued on, and a push title of "Your 2 updates." Replacing that alert's transport with push makes the next notify report `via: 'push'`. Two refined abstractions times three transports is six combinations, from five classes.

The second shape is how you would write it on a normal day. `transports.email` and `transports.sms` are plain functions. `makeNotifier(send)` is the abstraction: `alert` and `digest` decide the words, then call the `send` you passed. An email alert uppercases the body to `LATE`. A text digest of two items reads `2 updates: a | b`. A function that returns `via: 'noop'` is a test-double implementor, and the alert still runs. `createLogger` is the same split for a logger. `info` and `error` are the buttons. The transport writes the line, so one of them records `INFO boot` and `ERROR oops`.

When you talk about it, say this: two hierarchies, composed and not multiplied. The abstraction holds an implementor. Refined abstractions and concrete implementors grow on their own, so you add N plus M classes instead of N times M.
