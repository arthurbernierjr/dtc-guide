## The idea

Picture an assembly line for lunch trays. The first station counts trays and pulls one off when you have sent too many. The next station looks for a name and stops the tray if the name is missing. The last station bags the lunch. Any station can handle the tray, pass it on, or stop the line. The bagging station does not know the counter exists.

A chain of responsibility is that line. You do not couple the sender of a request to one receiver. You give more than one object a chance. You link them, and you pass the request along until one of them handles it, or until the line runs out. The handler interface is `setNext` and `handle`. A concrete handler either finishes the request or forwards it. The client builds the line and fires one request. Rate limiting, auth, validation, and logging belong in their own stations, not in one giant `if` inside the route.

## Why it matters

The bug this pattern prevents is a route that knows every policy. If the limit, the auth check, and the path check live in one function, every change risks the other checks. A station that only sees the request, the response, and the next station can be clipped in, pulled out, or reordered.

You already run lines like this. Express, Koa, and Fastify middleware take the request and a `next` function. Axios and `fetch` interceptors do the same around HTTP. Redux middleware is a chain around `dispatch`. DOM events bubble until something calls `stopPropagation`. A `try/catch` that does not catch lets the error walk up the stack. Webpack runs loaders in a chain. A logger filter is a station that drops quiet messages.

A decorator always forwards. It wraps extra behavior around a call that still happens. A link in this chain may stop the line, and often one station, or none, is the one that actually handles the request. A composite is a tree that fans out to many children. This chain is a straight line. A command is the request turned into an object you can store. This pattern is about who is allowed to process the request, not about boxing the request itself.

## A small example

```javascript
function station(check, next) {
  return function tray(item) {
    return check(item, next);
  };
}

function countTrays(limit) {
  let seen = 0;
  return function check(item, next) {
    seen += 1;
    if (seen > limit) return 'step off the line';
    return next(item);
  };
}

function bag(item) {
  return 'bagged ' + item.name;
}

const line = station(countTrays(2), bag);
const first = line({ name: 'book' });
const second = line({ name: 'apple' });
```

`first` is `bagged book`. `second` is `bagged apple`. A third tray would stop at the counter and never reach `bag`. The bagging function has no idea the counter is there.

## What the code below is doing

The sheet shows the same idea twice.

The first shape uses classes so the book names are visible. `Handler` forwards to `#next` when there is one, and otherwise returns the response unchanged. `setNext` stores the follower and returns it, so a chain reads left to right. `RateLimitHandler` counts by ip and, past the limit, returns status 429 with `too many requests`. `AuthHandler` wants a bearer token. Missing, it returns 401. Present, it copies the request, sets `user.id` to the token, and forwards. `ValidateHandler` demands a string `sku` on a POST and otherwise returns 400. `RouteHandler` is the end of the line. It returns 201 and a body that names the sku and the user id.

The line is rate limit 2, then auth, then validate, then the route. The first POST from `10.0.0.1` with token `u7` and sku `A1` comes back `order A1 for u7`. A second call from that ip with empty headers is 401. The limiter counted it, then auth stopped the line. A third call from that same ip, even one with an empty body, is 429. It never reaches validation, because the count is already 3 and the limit is 2. A new ip, `10.0.0.2`, with an empty body gets 400, `sku required`. A bare `Handler` with nobody clipped on returns the response you handed it.

The second shape is a middleware array with `next`, the way Express and Koa write the line. `compose` walks the array by index. Calling `next` twice from the same station throws. The logger records the path on the way in and the status on the way back, so it sees the final status even when a later station stopped the line. Auth writes the token onto the context or sets 401 and returns without calling `next`. The api station forwards only when the path starts with `/api`, and otherwise sets 404. The last station sets 200 and `hello` plus the user.

A call to `/api/me` with token `ada` finishes at 200 with body `hello ada`. The trace is the path on the way in and 200 on the way out. The same path with no token is 401, and the handler never ran, but the trace still shows 401 because the logger stayed on the line. `/nope` with a token is 404. A tiny line that calls `next` twice throws the multiple-call error.

When you talk about it, say this: a pipeline where each link decides to handle, pass along, or stop.
