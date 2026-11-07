---
editorial: true
title: Sealed Gates
subtitle: Stripe, Paid APIs, Webhooks, and Rate Limits
hook: "A sandbox checkout and verified, durable payment-event processing design. Server chooses the approved price and account."
read: 60
artifact: "A sandbox checkout and verified, durable payment-event processing design"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://docs.stripe.com/webhooks
  - https://docs.stripe.com/checkout/fulfillment
say:
  - "Checkout: Server chooses the approved price and account."
  - "Event: Verify the signature over the original body."
  - "Entitlement: Apply a durable, idempotent state transition."
---

## The hook

Today your app stops being a project and starts being a product. The moment you can charge money is the moment you have a business. We are going to integrate Stripe, the payment platform that powers everything from startups to Fortune 500 companies, and by the end of this session, you will be able to exercise a complete sandbox purchase with synthetic data.

Think of this as sealing the gates to your kingdom. Not everyone gets in for free anymore. Payment is the gatekeeper that turns your free dungeon into a premium dungeon. Hosted Checkout keeps card entry on the provider page. Your business still owns its account security, fulfillment, refund, privacy, and applicable compliance responsibilities. Fees depend on the current product, region, and payment method.

We are also going to learn about webhooks, the server-to-server communication pattern that is a reliable asynchronous mechanism for payment confirmation, alongside authenticated server-side reconciliation. And we are going to build retry logic with exponential backoff for when APIs rate-limit you. By the end of today, your app will have a complete payment flow: button click to checkout to confirmation to feature unlock. That is revenue. That is a business.

---

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Implement a complete payment processing flow using Stripe Checkout and webhooks
You will integrate Stripe into a full-stack application, creating checkout sessions on the backend, handling redirects on the frontend, processing webhook events for reliable payment confirmation, and gating premium features behind subscription status.

**You will:**
- Configure Stripe API keys and create products/prices in test mode
- Build a Stripe Checkout Session endpoint that creates payment flows with proper metadata
- Implement a webhook handler with signature verification that processes payment events reliably
- Create middleware that gates features based on subscription status

**You will be able to:**
- Set up a Stripe test environment with products, prices, and API key management
- Build a complete checkout flow from frontend button to backend session creation to Stripe redirect
- Write a webhook endpoint using express.raw() that verifies signatures and updates the database on payment events
- Implement a requirePro middleware and handle subscription lifecycle events (created, renewed, cancelled, failed)

**Why Payments Change Everything**
- The moment you can charge money is the moment you have a business
- Why Stripe: developer-friendly, battle-tested, reduces direct card-data handling while leaving merchant responsibilities
- Review current provider pricing for your region; no fee is assumed by this exercise.
- Show a live demo: click a button, enter test card info, see money appear in the Stripe dashboard
- Test mode vs live mode: test mode uses fake money, sandbox credentials and synthetic transactions; protect keys and account access even in testing

**How Stripe Works - Architecture Overview**
- Stripe's core flow:
  1. Your frontend sends a request to YOUR backend ("I want to buy the Pro plan")
  2. Your backend creates a Stripe Checkout Session with the price and redirect URLs
  3. Your backend returns the session URL to the frontend
  4. The frontend redirects the user to Stripe's hosted checkout page
  5. The user enters their payment info on Stripe's page (you never touch card numbers)
  6. Stripe processes the payment and redirects the user to your success URL
  7. Stripe sends a webhook to your server confirming the payment
  8. Your server updates the user's account (mark as paid, unlock features, etc.)
- Why you never handle card data directly: PCI compliance is a nightmare. Stripe handles it.

**Why Webhooks Matter**
- The success redirect is NOT reliable confirmation. Users can close the browser. The redirect can fail.
- Webhooks are server-to-server. Stripe tells YOUR server directly: "Payment succeeded."
- Use verified events and authenticated server-side reconciliation; never trust a browser redirect.
- Think of it like this: the redirect is the customer saying "I paid." The webhook is the bank saying "They paid."
- Webhook signature verification: proves the webhook came from Stripe, not an attacker

**Common Misconceptions:**
- "The success redirect URL means payment succeeded." No, it means the user was redirected. Always verify via webhook.
- "I need to collect and store card numbers." Never. Stripe Checkout handles card data so you never touch it.
- "Webhooks are optional." They are the source of truth for payment confirmation. Use them for asynchronous updates and reconcile provider state when necessary.
- "Test mode and live mode use different code." The integration pattern is similar, but keys, objects, webhook endpoints, signing secrets, and account configuration must be set for the intended environment.

---

![](diagram:session-10-2/fig1-model)

### Use a sandbox and keep the business rule on the server

This lesson uses test credentials and synthetic accounts. It does not charge real customers. The client asks to buy an approved product; the server selects the price identifier and associates the checkout with the authenticated account. Never accept an arbitrary amount or owner identifier from a browser and treat it as authoritative. Payment state is a server-side business fact.

Hosted Checkout reduces the amount of card data your application handles, but it does not remove your obligations around account security, fulfillment, refunds, taxes, privacy, or applicable compliance. Fees vary by product, region, and payment method, so the classroom arithmetic is not a current pricing quote. Review the provider's current terms before a real launch. Keep this exercise focused on a single one-time sandbox purchase before attempting subscription lifecycle logic.

### A redirect is a receipt screen, not proof of payment

A visitor can open a success URL manually or close the browser before returning. The page should fetch the authenticated account's server-side order state and display pending, paid, or failed accordingly. Do not announce that premium access is unlocked merely because a query parameter exists. A server-verified webhook or authenticated provider reconciliation establishes payment state.

Stripe requires the original request body for signature verification. Register the raw-body webhook route before the general JSON parser. Verify the signature with the endpoint's signing secret and reject invalid events. Expect duplicates, retries, and events arriving out of order. Acknowledge only after the event has been durably accepted for processing or its business update has committed. [Stripe webhook documentation](https://docs.stripe.com/webhooks).

### Idempotency belongs with the state transition

An in-memory Set can demonstrate duplicate detection, but it disappears on restart and is not shared across processes. A real implementation needs durable event identity, a unique constraint, and a transaction or equivalent atomic design connecting deduplication to fulfillment. If you mark an event processed before updating the order and then crash, a retry may be ignored forever. If you update first and crash before recording the event, a retry may repeat the side effect.

Model orders explicitly. Store the account, approved product, checkout identifier, payment state, and fulfillment state. Verify that the event refers to an expected order and appropriate payment mode. For delayed payment methods, checkout completion alone may not mean payment is paid. Handle the later success or failure event and reconcile against provider state when ordering is uncertain. [Checkout fulfillment guidance](https://docs.stripe.com/checkout/fulfillment).

### Bound retries and distinguish transport from business failure

Retrying a read after a transient failure differs from retrying a charge-creating operation. Use the provider's idempotency key mechanism for supported write operations and keep the key tied to one intended business action. Respect Retry-After when supplied, account for both seconds and date forms, and cap total elapsed time. Add jitter to backoff when many clients could retry together.

A rate limiter also needs an identity and storage model. Per-process memory may be enough to illustrate the idea, but multiple instances require shared enforcement if the limit must hold globally. Payment and AI limits should not rely solely on the browser because callers can bypass it. Keep operational logs free of secret keys and card data.

### Exercise the difficult outcomes

Test a valid payment, a decline, an invalid signature, duplicate delivery, delayed success, and an event for an unknown order. Restart the handler between duplicate deliveries in the manual integration test to prove persistence. Simulate a database failure and confirm the event is retried or remains durably queued. The submission includes the state model, event-processing design, sandbox evidence, and a list of lifecycle cases still outside the exercise. Subscription cancellation, refunds, disputes, and entitlement expiry must be implemented before claiming a complete subscription product.

## The demonstration

### Scope and manual prerequisites

Build one **one-time sandbox purchase** that unlocks one feature. Subscription renewals, cancellations, refunds, disputes, tax handling, and expiring access are separate lifecycle work; do not present this exercise as a complete subscription service. Use your own manually configured Node.js runtime, MongoDB replica set or Atlas development database, Stripe sandbox, and Stripe CLI. MongoDB transactions require a replica set or supported sharded deployment. A standalone database cannot run the transaction below.

The files below use ES modules. Set the project's module convention consistently. The auth middleware is the Unit 4 bearer-token middleware, exported from `middleware/auth.cjs` if you kept that CommonJS implementation. It must verify the token and set `req.user.userId`. Do not rename its identity field silently. The application mounts this router at `/api/payments`, so the browser URLs and server paths agree.

Create one sandbox product with a one-time price in the provider dashboard. Save its identifier as STRIPE_PRICE_ID on the server. The browser never chooses an arbitrary price or owner. Keep STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET server-only. FRONTEND_URL is the exact allowed application origin. Record the SDK version in the lockfile and verify its API-version behavior in your sandbox before upgrading. No historical API version is assumed by this walkthrough.

```dotenv
STRIPE_SECRET_KEY=your_sandbox_secret_key
STRIPE_WEBHOOK_SECRET=your_endpoint_signing_secret
STRIPE_PRICE_ID=your_one_time_sandbox_price_id
FRONTEND_URL=http://localhost:5173
MONGODB_URI=your_private_development_replica_set_uri
JWT_SECRET=your_strong_local_secret
```

### Persist an order before starting checkout

The order connects the authenticated account, approved price, and provider session. Its identifier is also the idempotency key for creating that session. A retry for the same order can retrieve the same provider operation; a new intended purchase gets a new order. In a fuller product, the create-order API itself should accept a validated client action identifier with a unique account-scoped constraint to avoid duplicate orders from repeated requests.

```javascript
// models/payment.js
import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  userId: {type: mongoose.Schema.Types.ObjectId, required: true, index: true},
  priceId: {type: String, required: true},
  checkoutSessionId: {type: String, unique: true, sparse: true},
  status: {type: String, enum: ['pending', 'paid'], default: 'pending'}
}, {timestamps: true});
const eventSchema = new mongoose.Schema({
  _id: String,
  orderId: {type: mongoose.Schema.Types.ObjectId, required: true},
  processedAt: {type: Date, default: Date.now}
});
export const Order = mongoose.model('Order', orderSchema);
export const PaymentEvent = mongoose.model('PaymentEvent', eventSchema);
```

```javascript
// config/stripe.js
import Stripe from 'stripe';
for (const name of ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'STRIPE_PRICE_ID', 'FRONTEND_URL']) {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
}
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
```

```javascript
// routes/payments.js
import express from 'express';
import auth from '../middleware/auth.cjs';
import {Order} from '../models/payment.js';
import {stripe} from '../config/stripe.js';
const router = express.Router();
router.post('/create-checkout-session', auth, async (req, res, next) => {
  try {
    const order = await Order.create({userId: req.user.userId, priceId: process.env.STRIPE_PRICE_ID});
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{price: order.priceId, quantity: 1}],
      client_reference_id: String(order._id),
      metadata: {orderId: String(order._id)},
      success_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
    }, {idempotencyKey: `order:${order._id}`});
    order.checkoutSessionId = checkout.id;
    await order.save();
    res.status(201).json({url: checkout.url});
  } catch (error) { next(error); }
});
router.get('/status', auth, async (req, res, next) => {
  try {
    const paid = await Order.exists({userId: req.user.userId, status: 'paid'});
    res.json({paid: Boolean(paid)});
  } catch (error) { next(error); }
});
export async function requirePaid(req, res, next) {
  try {
    const paid = await Order.exists({userId: req.user.userId, status: 'paid'});
    if (!paid) return res.status(403).json({error: 'A confirmed purchase is required'});
    next();
  } catch (error) { next(error); }
}
export default router;
```

Protect the paid operation with both auth and requirePaid in that order. The status endpoint supplies the success page's display state; it does not grant permission. A user who opens the success URL manually still receives unpaid status and cannot call the protected feature. For a product with multiple entitlements, include the product identity in the authorization query instead of treating any purchase as universal access.

### Verify and apply the event atomically

The route verifies the signature against the original bytes. It accepts only relevant one-time paid sessions. It then checks the stored order/session association and commits the event identifier and order update in one database transaction. The unique event identifier makes a duplicate recognizable across restarts and multiple processes. A database failure returns a retryable response. A duplicate that already committed returns success without repeating the update.

```javascript
// routes/webhooks.js
import express from 'express';
import mongoose from 'mongoose';
import {stripe} from '../config/stripe.js';
import {Order, PaymentEvent} from '../models/payment.js';
const router = express.Router();
router.post('/stripe', express.raw({type: 'application/json', limit: '1mb'}), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({error: 'Invalid signature'});
  }
  if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type)) {
    return res.json({received: true});
  }
  const checkout = event.data.object;
  if (checkout.mode !== 'payment' || checkout.payment_status !== 'paid') return res.json({received: true});
  const orderId = checkout.client_reference_id;
  if (!mongoose.isValidObjectId(orderId)) return res.status(400).json({error: 'Unknown order reference'});
  const transaction = await mongoose.startSession();
  try {
    await transaction.withTransaction(async () => {
      const existing = await PaymentEvent.findById(event.id).session(transaction);
      if (existing) return;
      const order = await Order.findOne({_id: orderId, checkoutSessionId: checkout.id}).session(transaction);
      if (!order) throw new Error('Order association not available');
      await PaymentEvent.create([{_id: event.id, orderId: order._id}], {session: transaction});
      order.status = 'paid';
      await order.save({session: transaction});
    });
    return res.json({received: true});
  } catch (error) {
    // A concurrent transaction may have committed the same event first.
    if (error.code === 11000) {
      try {
        if (await PaymentEvent.exists({_id: event.id})) return res.json({received: true});
      } catch { /* Preserve retry behavior if the database is unavailable. */ }
    }
    console.error('Payment event processing failed', {eventId: event.id});
    return res.status(503).json({error: 'Event processing unavailable; retry required'});
  } finally {
    await transaction.endSession();
  }
});
export default router;
```

```javascript
// app.js — app construction; your server entry point connects MongoDB before listening.
import express from 'express';
import auth from './middleware/auth.cjs';
import webhooks from './routes/webhooks.js';
import payments, {requirePaid} from './routes/payments.js';
const app = express();
app.use('/api/webhooks', webhooks); // Original bytes reach signature verification.
app.use(express.json({limit: '32kb'}));
app.use('/api/payments', payments);
app.get('/api/premium-feature', auth, requirePaid, (req, res) => res.json({message: 'Purchased feature available'}));
app.use((error, req, res, next) => {
  console.error('Request failed', {path: req.path});
  res.status(500).json({error: 'Request failed'});
});
export default app;
```

### Connect the browser without inventing payment state

Reuse the in-memory token module from Session 4.5. The button calls your authenticated server and follows the returned provider URL. A failed request leaves the button available for retry. The success screen asks the server for status and can show a pending message while the event is still processing. A bounded refresh action is preferable to claiming immediate fulfillment. Never put a secret key or webhook signing secret in this component.

```jsx
// src/components/UpgradeButton.jsx
import {useState} from 'react';
import {getToken} from '../services/tokenStore';
export default function UpgradeButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function upgrade() {
    setPending(true); setError('');
    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST', headers: {Authorization: `Bearer ${getToken()}`}
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error('Checkout could not start');
      window.location.assign(data.url);
    } catch (failure) { setError(failure.message); setPending(false); }
  }
  return <div><button disabled={pending} onClick={upgrade}>{pending ? 'Opening checkout…' : 'Purchase access'}</button><p role="status">{error}</p></div>;
}
```

### Run the manual sandbox sequence

After manually installing and configuring the Stripe CLI, forward events to the raw-body route. Use the signing secret from that listener for the local endpoint. Complete a real sandbox Checkout created by your application so the event references an existing synthetic order. A generic CLI trigger is useful for signature and routing tests but will not automatically know your database's order identifier.

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Verify that the order changes from pending to paid, the event is recorded once, and the protected feature becomes available only to the owning account. Replay the event, restart the application, and replay again. The count and entitlement must remain unchanged. Then simulate a database failure in the isolated test environment and confirm the event remains retryable. Record these as manual integration results; the browser checkpoint below verifies only the pure transition model.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-10-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
// Pure transition model only; production deduplication must be durable and atomic.
function apply(state, event) {
  if (state.events.includes(event.id)) return state;
  if (event.orderId !== state.orderId || event.paymentStatus !== 'paid') return state;
  return {...state, paid: true, events: [...state.events, event.id]};
}
const initial = {orderId: 'o1', paid: false, events: []};
const event = {id: 'e1', orderId: 'o1', paymentStatus: 'paid'};
const paid = apply(initial, event);
check(paid.paid, 'Paid event grants modeled entitlement');
check(apply(paid, event) === paid, 'Duplicate has no second effect');
check(apply(initial, {...event, paymentStatus: 'unpaid'}) === initial, 'Pending payment does not grant access');
console.log('ok: checkpoint-10-2');
```

## Where it breaks

![](diagram:session-10-2/fig2-diagnosis)

### Success URL unlocks access

The success page says "Thank you" and your server marks the account paid because the browser arrived there. Anyone can open that URL. Payment is confirmed when your server receives the provider's signed event and the event says paid, not when a redirect happens. Treat the success page as a receipt screen. Grant the feature from the webhook path. Visit the success URL in a fresh session with no payment and confirm you are still unpaid.

### Duplicate event repeats work

The provider delivers the same event twice, which it is allowed to do, and you send the book twice or extend the subscription twice. The handler is not idempotent. Store the event id, and write the business change in the same transaction as the record of "this event is done." The second delivery should find the id and return success without doing the work again. Returning an error on the duplicate invites another retry. Doing the work again is the bug.

### Delayed payment grants early access

A delayed payment method fires a "processing" event, and you unlock the feature on that event. The payment later fails. The person has the feature and you do not have the money. Unlock on the event that means paid, and handle the later failure: revoke, or leave a clearly unpaid state. Read the state you stored, not the fact that some event arrived. Asynchronous payments have a middle that is neither success nor failure. The middle is not access.

## Your turn

**Exercise 1: Build a Payment Flow**
- **Objective:** Implement a complete Stripe Checkout flow in your application
- **Instructions:**
  1. Install the `stripe` npm package
  2. Add your Stripe test keys to .env
  3. Create a `POST /api/payments/create-checkout-session` endpoint
  4. Create a frontend button that calls your endpoint and redirects to Stripe
  5. Create success and cancel pages
  6. Test with the `4242 4242 4242 4242` test card
  7. Verify the payment appears in your Stripe Dashboard (test mode)
- **Success Criteria:**
  - Clicking "Upgrade" redirects to Stripe's checkout page
  - Entering the test card completes payment
  - User is redirected to the success page
  - Payment visible in Stripe Dashboard

Take ten minutes.

**Exercise 2: Webhook Handler (included in guided practice)**
- **Objective:** Build a webhook endpoint that processes Stripe events
- **Instructions:**
  1. Create a `POST /api/webhooks/stripe` endpoint
  2. Use `express.raw()` middleware for this route (before `express.json()`)
  3. Verify the webhook signature using `stripe.webhooks.constructEvent()`
  4. Handle paid one-time Checkout sessions: transactionally update the matching order and event record
  5. Install the Stripe CLI and test with `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  6. Trigger a test event with `stripe trigger checkout.session.completed`
  7. Use a real sandbox Checkout tied to a synthetic order, then verify the database; a generic CLI fixture has no matching application order
- **Success Criteria:**
  - Webhook endpoint returns 200 for valid signatures
  - Webhook endpoint returns 400 for invalid signatures
  - A paid event updates its order once, while duplicates and unpaid events cannot grant access
  - Console logs show which events were processed

---

## The quest

**Working with Paid/Gated APIs and Rate Limit Handling**

Work independently on integrating the following patterns into their applications:

**API key management principles:**
- Never expose API keys on the frontend. Always proxy through your backend.
- Use different keys for development and production.
- Rotate keys if they are ever exposed (check your git history).

**Rate limit handling with exponential backoff:**
```javascript
// utils/apiClient.js — GET only; write retries need operation-specific idempotency.
export async function fetchWithRetry(url, maxAttempts = 3) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 5) throw new Error('Invalid attempt count');
  let lastError = new Error('Request failed');
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let delay = Math.min(4000, 500 * 2 ** attempt) + Math.random() * 200;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.status !== 429 && response.status < 500) return response;
      lastError = new Error(`Retryable HTTP ${response.status}`);
      const header = response.headers.get('retry-after');
      if (header) {
        const seconds = Number(header);
        const requested = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now();
        if (Number.isFinite(requested) && requested > 10000) throw new RangeError('Retry later; server delay exceeds this request budget');
        if (Number.isFinite(requested)) delay = Math.max(delay, requested);
      }
    } catch (error) {
      if (error instanceof RangeError) throw error;
      lastError = error;
    }
    if (attempt + 1 < maxAttempts) await new Promise(resolve => setTimeout(resolve, delay));
  }
  throw lastError;
}
```

**Cost tracking and budget alerts:**
```javascript
// utils/costTracker.js — accounting illustration only, not a spending guard.
export function recordUsage(totalCents, actualCents) {
  if (!Number.isFinite(actualCents) || actualCents < 0) throw new Error('Invalid usage');
  return totalCents + actualCents;
}
// Session 10.3 adds pre-call reservations and explains durable shared enforcement.
```

**Stripe test cards quick reference:**
```
4242 4242 4242 4242  - Succeeds
4000 0000 0000 0002  - Declined (generic)
4000 0000 0000 9995  - Declined (insufficient funds)
4000 0000 0000 3220  - Requires 3D Secure authentication
Any future expiry date, any 3-digit CVC, any ZIP code
```

**Recap + Homework Launch**
- You just integrated payments. Your app can make money now.
- Webhooks are how Stripe talks to your server. Always verify signatures.
- Never handle card data directly. Let Stripe's checkout page do it.
- Next session: we bind an LLM to your app. Get your Anthropic API key ready at https://console.anthropic.com/
- Homework: get Stripe working in your capstone

---

### Review the artifact

Your deliverable is **A sandbox checkout and verified, durable payment-event processing design**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-10-2/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Completed Session 10.1 with security fundamentals in place. A free Stripe account registered at https://dashboard.stripe.com/register. Working Express backend with a React frontend.
**Materials:** stripe npm package, Stripe CLI, Stripe Dashboard access with test API keys, test card numbers reference.

---

**Assignment: Add Stripe to Your Capstone**
- **Objective:** Integrate a payment flow into your capstone project
- **Tasks:**
  1. Create a Stripe account and get test API keys
  2. Create at least one product and price in the Stripe Dashboard
  3. Implement a checkout flow (backend endpoint + frontend button)
  4. Build a webhook handler for `checkout.session.completed`
  5. Derive access from a paid order for the authenticated account
  6. Create middleware that checks paid orders on the server before granting the one-time feature
  7. Protect at least one route behind the `requirePro` middleware
  8. Test the entire flow with Stripe test cards
  9. Add a pricing page to your frontend showing free vs pro features
- **Submission:** Push updated capstone with Stripe integration
- **Time Estimate:** 3-4 hours
- **Due:** Before Session 10.3

**Stretch Goals (Optional):**
- Implement subscription management (cancel, upgrade, downgrade)
- Add a customer portal link using `stripe.billingPortal.sessions.create()`
- Handle failed payments gracefully (email notification, grace period)
- Track revenue metrics and display them in an admin dashboard

---

### Manual verification and further reading

- [Official reference 1](https://docs.stripe.com/webhooks)
- [Official reference 2](https://docs.stripe.com/checkout/fulfillment)
