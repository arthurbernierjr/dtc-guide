---
editorial: true
title: Sealed Gates
subtitle: Stripe, Paid APIs, Webhooks, and Rate Limits
hook: "The capstone takes its first payment today, in test mode, on a checkout page Stripe hosts. Your server picks the price, Stripe sends a signed event, and an order flips from pending to paid exactly once, no matter how many times the same event arrives."
read: 60
artifact: "A Stripe Checkout flow with a verified, idempotent webhook, an Order and PaymentEvent model, and one route behind requireUser and requirePaid"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://docs.stripe.com/checkout/quickstart
  - https://docs.stripe.com/webhooks
  - https://docs.stripe.com/checkout/fulfillment
  - https://docs.stripe.com/stripe-cli
  - https://docs.stripe.com/testing
  - https://expressjs.com/en/5x/api.html#express.raw
say:
  - "The server chooses the price and the account; the browser only asks."
  - "A success URL is a receipt screen, not proof of payment. The signed event is the proof."
  - "Claim the event id first, then flip the order; a duplicate finds the claim and does nothing."
---

## The hook

The capstone has a login and a barrier. Today it has a gate with a price on it. A button on your page asks your API for a checkout, your API creates one at Stripe with a price you chose on the server, and the browser goes to a page Stripe hosts to type a card number you never see. When Stripe is done it does two things: it sends the browser back to your success URL, and it sends your server a signed event. Only one of those is evidence, and it is not the one the user watches.

By the end of the session the capstone has an `Order` that starts `pending` and becomes `paid`, a `PaymentEvent` keyed by Stripe's event id so the same delivery cannot flip anything twice, a webhook route mounted above `express.json` so the signature can be checked over the original bytes, and one route, `GET /api/premium-feature`, that answers 403 until the order is paid and 200 after. You will prove it with the Stripe CLI forwarding events to port 3000, a test card, and a replayed event that changes nothing.

> *The receipt screen is the customer saying "I paid." The signed event is the bank saying it.*

## The idea

Hosted Checkout is the shape to learn first, before subscriptions, portals, or saved cards. The browser sends one request to your API: "I want to buy the thing." Your API creates a Checkout Session with Stripe's SDK, naming the price id from the environment and attaching your own order id, and gets back a URL. The browser goes to that URL. Stripe's page collects the card. Stripe redirects the browser to your `success_url` or `cancel_url`. Separately, Stripe posts an event to your webhook route. The [quickstart](https://docs.stripe.com/checkout/quickstart) is that flow with the same four moving parts.

Three facts fall out of the shape. The browser never names a price or an amount; it would be the easiest field in the world to edit. The browser never names an account; the account is `req.userId` from the token. And card numbers never touch your server, which is why you can build this at all without the compliance work a card-handling server needs. What you still own is everything else: the account, the fulfilment, refunds, disputes, and the question of whether a paid order means the feature is on. Fees and pricing are on Stripe's site and change by region and method; read them there, not here.

### A redirect is a receipt screen

The success URL is a page anyone can open by typing it. A visitor who closes the tab before the redirect still paid. A visitor who opens `/?checkout=success` with no payment did not. So the success page asks your API, `GET /api/payments/status`, and shows `pending` or `paid` from the order your server holds. It does not read a query parameter and announce the feature is unlocked.

The event is the proof, and the [webhooks guide](https://docs.stripe.com/webhooks) spells out the two conditions. First, the signature header is computed over the request body bytes exactly as Stripe sent them, so the route that verifies it must see the raw body, not a parsed object. In Express that means `express.raw({ type: 'application/json' })` on that one route, mounted before the application-wide `express.json()`. If `express.json` runs first, the body is an object, `constructEvent` gets a re-serialised string that differs by a space, and every event is rejected as unsigned. Second, Stripe retries any event you do not answer with a 2xx, and may deliver an event more than once even when you did. Your handler has to be safe to run twice.

### Idempotency belongs with the state change

Here is the design without a transaction, because your MongoDB from 4-5 is a standalone server and transactions need a replica set. Two collections. `orders` holds `userId`, `priceId`, `checkoutSessionId`, and `status`, which is `pending` or `paid`. `paymentevents` holds one document per Stripe event, with `_id` set to Stripe's event id, which looks like `evt_...`.

The webhook does three writes in a fixed order. First it claims the event: `PaymentEvent.findOneAndUpdate({ _id: event.id }, { $setOnInsert: {...} }, { upsert: true })`. With the default options that call returns the document as it was before the update, which means it returns `null` when this call inserted the claim and returns the existing document when some earlier delivery already claimed it. One round trip tells you whether you are first. Second, if the claim is new or was never finished, it flips the order with a filter that can only match once: `Order.updateOne({ _id: orderId, checkoutSessionId: session.id, status: 'pending' }, { $set: { status: 'paid' } })`. A second run of that update matches nothing, because the status is no longer `pending`. Third, it marks the claim finished with `processedAt`.

Now walk the failure the transaction would have hidden. The process dies after the claim and before the order update. Stripe retries. The claim exists but has no `processedAt`, so the handler runs the order update again, which is safe because its filter is conditional, then marks the claim. Nothing was lost, nothing was doubled. The same idea as the hall's `qty: { $gte: amount }` in 4-15: the filter is the check, and the write only happens when the filter is still true. The [side quest on idempotency](/system-design/concepts/idempotency/) is this pattern with its proper name.

### What the event says and what it does not

`checkout.session.completed` arrives when the Checkout page finishes. For a card, `payment_status` on that session is already `paid`. For delayed methods it can be `unpaid`, and a later `checkout.session.async_payment_succeeded` carries the `paid`. The [fulfilment guide](https://docs.stripe.com/checkout/fulfillment) names both. The handler accepts both event types and then checks `payment_status === 'paid'` before it touches the order, which means a completed-but-unpaid session answers 200 and changes nothing. That is the middle state the third diagnosis is about: completed is not paid.

The session carries `client_reference_id`, which you set to your order's id when you created it. That is how an event finds its order. A test event fired from the CLI with `stripe trigger` has no such id, because your server did not create that session, so the handler answers 200 and logs "no order" for it. The signature was valid; there was nothing to fulfil. Keep that distinction in your notes, because it is the difference between a routing test and a fulfilment test.

### Keys, and the limiter you already have

Stripe gives you a secret key for test mode, starting `sk_test_`, and a separate one for live mode. The test key lives in `api/.env` as `STRIPE_SECRET_KEY` and nowhere else. The webhook signing secret, `whsec_...`, is a second secret, and it is different for every endpoint: the Stripe CLI prints one when it starts forwarding, and the endpoint you create in the Dashboard for the deployed server in 10-4 has its own. The price id, `price_...`, is configuration, not a secret, but it still comes from the environment so that test and live prices are a variable away. Add all three to the required list in `config.js`, so the process will not start with a half-configured gate.

The general limiter from last session already covers `/api/payments`. The checkout route makes a network call to Stripe and writes an order every time; if you want a tighter number on it, reuse the `rateLimit` call with a smaller `limit`. The [rate-limiting side quest](/system-design/concepts/rate-limiting/) is the reasoning about what the key should be when the API has more than one process, which the deployed capstone does not yet.

The napkin: the browser asks, the server chooses the price and the account, Stripe hosts the card page, the signed event over the raw body is the proof, the claim-then-flip order is what makes a retry harmless, and the feature route asks the order, not the URL.

![](diagram:session-10-2/fig1-model)

## The demonstration

Stop last session's API with Ctrl-C. In the Stripe Dashboard, switch to test mode, open Products, and add one product with a one-time price. Any amount. Copy the price id, which starts `price_`. Open Developers, then API keys, and copy the test secret key, which starts `sk_test_`. Install the Stripe CLI from [docs.stripe.com/stripe-cli](https://docs.stripe.com/stripe-cli) for your operating system and run `stripe login`; it opens the browser once and pairs the CLI with your account.

In `~/projects/<capstone-name>/api`: `npm install stripe`. Then the environment. The webhook secret stays empty until the CLI prints it.

```dotenv
STRIPE_SECRET_KEY=sk_test_paste-yours
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=price_paste-yours
```

Add the three names to `required` in `api/config.js` and export them:

```js
// fragment: the edit to api/config.js
const required = ['MONGODB_URI', 'JWT_SECRET', 'PAGE_ORIGIN', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PRICE_ID'];

module.exports = {
  // ...the five fields from last session, then:
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceId: process.env.STRIPE_PRICE_ID
};
```

`api/models/order.js` holds both collections:

```js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    priceId: { type: String, required: true },
    checkoutSessionId: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['pending', 'paid'], default: 'pending' }
  },
  { timestamps: true }
);

const paymentEventSchema = new mongoose.Schema(
  {
    _id: { type: String },
    type: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    processedAt: { type: Date }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
const PaymentEvent = mongoose.model('PaymentEvent', paymentEventSchema);

module.exports = { Order, PaymentEvent };
```

`checkoutSessionId` is `unique` and `sparse`, so two orders cannot point at one Stripe session, and orders that have not reached Stripe yet do not collide on a missing value. `_id` on the event is a string because Stripe's id is the identity; the second claim of the same id is the duplicate.

`api/lib/stripe.js` is one line that fails loudly:

```js
const Stripe = require('stripe');
const config = require('../config');

const stripe = new Stripe(config.stripeSecretKey);

module.exports = { stripe };
```

`api/routes/payments.js` creates the checkout, reports status, and exports the gate:

```js
const express = require('express');
const { stripe } = require('../lib/stripe');
const { Order } = require('../models/order');
const { requireUser } = require('../middleware/require-user');
const config = require('../config');

const router = express.Router();

router.post('/create-checkout-session', requireUser, async (req, res) => {
  const order = await Order.create({ userId: req.userId, priceId: config.stripePriceId });
  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      line_items: [{ price: order.priceId, quantity: 1 }],
      client_reference_id: String(order._id),
      success_url: config.pageOrigin + '/?checkout=success',
      cancel_url: config.pageOrigin + '/?checkout=cancel'
    },
    { idempotencyKey: 'order:' + String(order._id) }
  );
  order.checkoutSessionId = session.id;
  await order.save();
  res.status(201).json({ url: session.url });
});

router.get('/status', requireUser, async (req, res) => {
  const paid = await Order.exists({ userId: req.userId, status: 'paid' });
  res.json({ paid: Boolean(paid) });
});

async function requirePaid(req, res, next) {
  const paid = await Order.exists({ userId: req.userId, status: 'paid' });
  if (!paid) return res.status(403).json({ error: 'a confirmed purchase is required' });
  next();
}

module.exports = { router, requirePaid };
```

Read the create route as a story. The order exists before Stripe hears about it, so an event can find it later. The price is `config.stripePriceId`; the body of the request is not read at all. `client_reference_id` carries the order id out and back. The idempotency key is the order id, so if your process retries the Stripe call for the same order it gets the same session instead of a second one. The response is 201 with the URL; the browser goes there.

`api/routes/webhooks.js` is the raw-body route:

```js
const express = require('express');
const mongoose = require('mongoose');
const { stripe } = require('../lib/stripe');
const { Order, PaymentEvent } = require('../models/order');
const config = require('../config');

const router = express.Router();

const PAID_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];

router.post('/stripe', express.raw({ type: 'application/json', limit: '1mb' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.get('stripe-signature'), config.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).json({ error: 'invalid signature' });
  }

  if (!PAID_EVENTS.includes(event.type)) return res.json({ received: true });

  const session = event.data.object;
  if (session.mode !== 'payment' || session.payment_status !== 'paid') {
    return res.json({ received: true });
  }

  const orderId = session.client_reference_id;
  if (!mongoose.isValidObjectId(orderId)) {
    console.log('webhook ' + event.id + ': no order on this session');
    return res.json({ received: true });
  }

  const claim = await PaymentEvent.findOneAndUpdate(
    { _id: event.id },
    { $setOnInsert: { _id: event.id, type: event.type, orderId: orderId } },
    { upsert: true }
  );
  if (claim && claim.processedAt) {
    console.log('webhook ' + event.id + ': duplicate, already processed');
    return res.json({ received: true });
  }

  const flipped = await Order.updateOne(
    { _id: orderId, checkoutSessionId: session.id, status: 'pending' },
    { $set: { status: 'paid' } }
  );
  await PaymentEvent.updateOne({ _id: event.id }, { $set: { processedAt: new Date() } });
  console.log('webhook ' + event.id + ': order ' + orderId + ' paid=' + flipped.modifiedCount);
  res.json({ received: true });
});

module.exports = { router };
```

Every branch answers. A bad signature is 400, which Stripe will retry and which will keep failing until the secret is right, which is what you want to see in the CLI. An irrelevant type is 200. A completed-but-unpaid session is 200 with no change. A valid event with no order is 200 and a log line. A thrown error, say Mongo is down, reaches the error handler from last session and becomes 500, and Stripe retries later; that is the correct outcome for a database outage.

Now the one edit to `api/app.js` that the whole session depends on. The webhook router mounts above `express.json`:

```js
// fragment: the edits to api/app.js
const webhooks = require('./routes/webhooks');
const payments = require('./routes/payments');

// ...helmet, cors, logger, the limiters...

app.use('/api/webhooks', webhooks.router);

app.use(express.json({ limit: '10kb' }));
app.use(rejectOperators);

// ...health, auth...
app.use('/api/payments', payments.router);
app.get('/api/premium-feature', requireUser, payments.requirePaid, (req, res) => {
  res.json({ message: 'the gate is open' });
});
```

Two middlewares on the feature route, in that order. `requireUser` sets `req.userId`; `requirePaid` reads it. Swap them and `requirePaid` reads `undefined`, finds no paid order for nobody, and answers 403 to everyone including the paying customer.

Start the API: `node --env-file=.env server.js`. The line is `FATAL: missing environment variable STRIPE_WEBHOOK_SECRET`, because the value is still empty. Good. In a second terminal:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

It prints `Ready! Your webhook signing secret is whsec_...`. Paste that value into `api/.env`, start the API again, and this time the line is `listening on 3000`. Leave the CLI running. It is the tunnel from Stripe to your laptop for the rest of the session.

The button goes in `client/src/App.jsx`, inside the signed-in branch. The success banner reads the query string once and then asks the server.

```jsx
// fragment: inside the signed-in branch of App.jsx
const checkout = new URLSearchParams(window.location.search).get('checkout');
const [paid, setPaid] = useState(null);

useEffect(function () {
  api('/api/payments/status').then(function (r) { if (r.ok) setPaid(r.data.paid); });
}, []);

async function upgrade() {
  const r = await api('/api/payments/create-checkout-session', { method: 'POST' });
  if (r.ok && r.data.url) window.location.assign(r.data.url);
  else setNote(r.data.error || 'checkout could not start');
}

return (
  <main>
    <p>Signed in as {me.name} ({me.email})</p>
    {checkout === 'success' ? <p role="status">Thanks. Checking the order with the server.</p> : null}
    <p>Access: {paid === null ? 'checking' : paid ? 'paid' : 'not yet paid'}</p>
    {paid ? null : <button type="button" onClick={upgrade}>Buy access</button>}
  </main>
);
```

Hooks have to run on every render, so `useState` and `useEffect` for `paid` sit at the top of `App` with the others, not inside the `if (me)` branch; the fragment shows where the values are used. Run the client, log in as Bran, and click Buy access. The network panel shows `POST /api/payments/create-checkout-session` returning 201 with a URL, and the tab goes to `checkout.stripe.com`. Pay with the test card `4242 4242 4242 4242`, any future expiry, any three digits, any postcode; the full list is on the [testing page](https://docs.stripe.com/testing). The browser comes back to `/?checkout=success`. The page says `Thanks` and then, a moment later, `Access: paid`, because the status request found the order the webhook flipped.

Sometimes the page asks before the event has landed. The redirect and the event travel on different paths, and the event can arrive a few seconds after the browser does. The order is still `pending`, `GET /api/payments/status` answers `{"paid":false}`, the page says `Access: not yet paid`, and the button is still there. That is correct, not a bug. Wait a moment and reload, or add a button beside the status line that calls `/api/payments/status` again. Do not have the page read `checkout=success` and say paid to cover the gap. The webhook is the only thing that flips the order, and the status route is the only thing the page trusts.

Read the two terminals. The CLI printed `checkout.session.completed` with a `200` beside it. The API printed `webhook evt_... : order ... paid=1`. Now the evidence that matters. In the CLI's output, find that event id and replay it:

```bash
stripe events resend evt_paste-the-id
```

The API prints `webhook evt_...: duplicate, already processed`. In `mongosh`, `use <capstone-name>` then `db.orders.find({}, { status: 1 })` shows one order, `paid`, and `db.paymentevents.countDocuments()` is `1`. Stop the API, start it again, resend once more. Same two lines, same counts. The claim lives in the database, not in the process.

Then one more. `curl -i http://localhost:3000/api/premium-feature` with no header is 401. With Bran's token it is 200 and `the gate is open`. Register Sera, log her in, and send her token: 403 and `a confirmed purchase is required`. Sera can open `/?checkout=success` in her browser all day. The page will say `not yet paid`, because the page asks the server and the server asks the order.

Here is a small model you can run here. It models the claim-then-flip order with two maps standing in for the two collections, and the three outcomes: a paid event flips the order once, a duplicate finds the claim, an unpaid completion changes nothing. It does not verify a signature and it does not talk to Stripe; the CLI terminal and the resend are where those are proven.

```js run=checkpoint-10-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function store() {
  const orders = new Map();
  const events = new Map();
  return {
    createOrder: function (id, sessionId) { orders.set(id, { sessionId: sessionId, status: 'pending' }); },
    order: function (id) { return orders.get(id); },
    eventCount: function () { return events.size; },
    handle: function (event) {
      if (event.type !== 'checkout.session.completed') return 'ignored';
      if (event.paymentStatus !== 'paid') return 'not paid yet';
      const claim = events.get(event.id);
      if (claim && claim.processedAt) return 'duplicate';
      if (!claim) events.set(event.id, { orderId: event.orderId, processedAt: null });
      const order = orders.get(event.orderId);
      let flipped = 0;
      if (order && order.sessionId === event.sessionId && order.status === 'pending') {
        order.status = 'paid';
        flipped = 1;
      }
      events.get(event.id).processedAt = Date.now();
      return 'paid=' + flipped;
    }
  };
}

const db = store();
db.createOrder('o1', 'cs_1');
const paidEvent = { id: 'evt_1', type: 'checkout.session.completed', paymentStatus: 'paid', orderId: 'o1', sessionId: 'cs_1' };

check(db.handle(paidEvent) === 'paid=1' && db.order('o1').status === 'paid', 'Paid event grants modeled entitlement');
check(db.handle(paidEvent) === 'duplicate' && db.eventCount() === 1, 'Duplicate has no second effect');

db.createOrder('o2', 'cs_2');
const unpaid = { id: 'evt_2', type: 'checkout.session.completed', paymentStatus: 'unpaid', orderId: 'o2', sessionId: 'cs_2' };
check(db.handle(unpaid) === 'not paid yet' && db.order('o2').status === 'pending', 'a completed but unpaid session does not open the gate');

const wrongSession = { id: 'evt_3', type: 'checkout.session.completed', paymentStatus: 'paid', orderId: 'o2', sessionId: 'cs_other' };
check(db.handle(wrongSession) === 'paid=0' && db.order('o2').status === 'pending', 'an event whose session does not match the order flips nothing');

function requirePaid(orderStatus) { return orderStatus === 'paid' ? 200 : 403; }
check(requirePaid(db.order('o1').status) === 200 && requirePaid(db.order('o2').status) === 403, 'the feature route asks the order, not the URL');

console.log('ok: checkpoint-10-2');
```

## Where it breaks

![](diagram:session-10-2/fig2-diagnosis)

### Success URL unlocks access

The success page says thank you, and a line in your code marks the account paid because the browser arrived there, or because `?checkout=success` was in the URL. Anyone can type that URL. Payment is confirmed when your server receives Stripe's signed event and the event says `paid`, not when a redirect happens. Treat the success page as a receipt screen that asks `GET /api/payments/status`. Open the success URL in a fresh session that never paid and confirm the page says `not yet paid` and `/api/premium-feature` says 403. If either says otherwise, search the client and the API for `checkout=success`; the only place it should appear is the success URL you hand to Stripe and the banner that says thanks.

### Duplicate event repeats work

Stripe delivered the same event twice, which it is allowed to do, and your handler sent the welcome email twice or incremented a credit balance twice. The handler was not idempotent. The claim on the event id is the fix, and the order of writes is the rest of the fix: claim, then the conditional update, then `processedAt`. If you wrote the order update first and the claim second, a crash between them makes the retry do the work again. If you check a `Set` in memory instead of a document, a restart forgets every claim. Replay the event with `stripe events resend`, restart, replay again, and read `db.paymentevents.countDocuments()`. One. Returning an error on the duplicate is also wrong: Stripe reads a non-2xx as "try again later."

### Delayed payment grants early access

A delayed payment method completes the Checkout page with `payment_status: 'unpaid'`, your handler saw `checkout.session.completed` and flipped the order, and the payment failed a day later. The person has the feature and you do not have the money. Branch on `payment_status`, not on the event type. Accept `checkout.session.async_payment_succeeded` as the event that carries the later `paid`, and read the [fulfilment guide](https://docs.stripe.com/checkout/fulfillment) for `async_payment_failed`, which is the event you handle when you decide what an unpaid order looks like on the page. Completed is a stage. Paid is the state. The middle is not access.

## Your turn

Seal the gate in `~/projects/<capstone-name>/api`. Last session's API is stopped; Mongo is up; the Stripe CLI is installed and logged in.

1. In the Dashboard, in test mode, create one product with a one-time price. Copy `price_...` and `sk_test_...` into `api/.env` as `STRIPE_PRICE_ID` and `STRIPE_SECRET_KEY`. Add `STRIPE_WEBHOOK_SECRET=` with no value for now.
2. `npm install stripe`. Add the three names to `required` in `config.js`. Start the API: the line is `FATAL: missing environment variable STRIPE_WEBHOOK_SECRET`.
3. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. Copy the `whsec_...` it prints into `.env`. Start the API: `listening on 3000`.
4. Write `models/order.js`, `lib/stripe.js`, `routes/payments.js`, and `routes/webhooks.js`. Mount `/api/webhooks` above `express.json` in `app.js`, and `/api/payments` plus `/api/premium-feature` below it.
5. Add the Buy access button and the status line to the client. Log in as Bran, buy with `4242 4242 4242 4242`, and come back. The API prints `paid=1`; the page says `Access: paid`.
6. `stripe events resend evt_...` with the id from the CLI. The API prints `duplicate, already processed`. Stop the API, start it, resend again. Same line. `db.paymentevents.countDocuments()` is `1`.
7. `curl -i http://localhost:3000/api/premium-feature` with no header: 401. With Bran's token: 200. With Sera's token: 403.
8. Change one character of `STRIPE_WEBHOOK_SECRET`, restart, and resend. The CLI shows `400` and the API logs nothing about an order. Put the secret back.

If the CLI shows `400` on the very first real checkout, read the mount order in `app.js` before you touch the secret. A webhook router below `express.json` fails the signature on every event, with the right secret.

## The quest

![](diagram:session-10-2/fig3-evidence)

Write `docs/payments.md` in the capstone repo. One page.

- The flow, in your words, as six lines: button, create route, Stripe page, redirect, event, order flip. Say which of the six is the evidence of payment and why the redirect is not.
- The two collections and the three writes, in order. Say what a retry does after a crash between the first and second write.
- The replay evidence: the event id, the two API log lines, the `countDocuments` output before and after a restart.
- The three statuses on `/api/premium-feature`: no token, Bran, Sera.
- The bad-secret evidence: the CLI's `400` line.
- Known gaps: refunds, disputes, and `async_payment_failed` are not handled yet, and the limiter's counter is per process.

Then update `docs/threat-model.md`: a new boundary row for the webhook body, with the signature check as its control and the `400` as its evidence, and move "paid feature" out of Known gaps into a row with `requirePaid` and Sera's 403 beside it. Commit the API, the client, and both docs. `api/.env` stays out.

## Side quests

Idempotency is the name for claim-then-flip, rate limiting is the reasoning about what key a limiter should count once there is more than one process, and software and data integrity failures is the OWASP category an unsigned webhook belongs to.

## Before next session

Next session the capstone gets its one AI feature, behind `requireUser` and `requirePaid`, with the provider key on the server and a token budget per user per day. Create an account at [platform.claude.com](https://platform.claude.com/) before you sit down, add a small amount of credit, and create an API key named after the capstone; the key is shown once, so paste it straight into `api/.env` as `ANTHROPIC_API_KEY` and nowhere else. Read the [models overview](https://platform.claude.com/docs/en/about-claude/models/overview) once so the two model names next session are not new.

Stop the API, the client, and the Stripe CLI with Ctrl-C. Nothing stays running. The order in your database stays `paid`, and Bran's token, if it has not expired, still opens the gate when you start the API next time.
