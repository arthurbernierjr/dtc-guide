## The idea

Picture a school dance. A bouncer stands at the gym door with a flashlight and reads your wristband. The band says you belong at the dance. It also says which rooms you may enter: the gym, the snack table, the stage. The photo booth in the back is staff only. The bouncer reads the band again at the side door by the bleachers.

That second look is access control. Signing in tells the program who the person is. Broken Access Control is what you get when the program stops after that hello. The real control is a decision on the server, on the specific thing being touched, and the default answer is no. The owner id is part of the lookup. Each route names the roles that may call it, and a route with no rule stays shut. A file path has to land inside the folder you opened. A browser may call your API with cookies only from an origin you listed, character for character. A link the user asks your server to open has to be https and a host you already trust. Private, loopback, and link-local addresses stay off that list.

Failure looks like a bouncer who waves any wristband into any room. Change the number in the address and you are holding someone else's order. Being logged in is enough to run a staff delete. A download name walks out of the uploads folder. The site treats whatever origin the browser announces as a friend and sends the cookies along. A preview feature fetches an inside machine because the server trusted a URL it did not choose.

## Why it matters

This category sits at the top of the 2025 OWASP list because the bug hides in ordinary handlers. The button is missing on the screen. The route still answers. The database still returns the row. New programmers check the password at the door and then trust every later request. That first check is authentication. The room check is authorization. You need the room check every time, on the server, next to the data.

The harm is other people's records and other people's actions. One lookup that forgets the owner means every id is a door. One admin path that only asks whether someone is logged in means every account can act as staff. One fetch of a URL the user supplied turns your server into a tunnel toward machines that trusted the inside of the network. One loose cross-origin rule lets another website ride along with the user's session.

Deny when the user is missing, when the role list is missing, and when the route was never declared. When the mere existence of a record is sensitive, answer missing and forbidden the same way. The browser is a guest. The server keeps the list.

## A small example

```javascript
function getOrderForUser(order, sessionUserId) {
  if (!order || order.ownerId !== sessionUserId) {
    return null;
  }
  return order;
}

const order = { id: 123, ownerId: 'u1', total: 10 };
const mine = getOrderForUser(order, 'u1');
const hidden = getOrderForUser(order, 'u2');
```

`mine` is the order. `hidden` is `null`. The owner is part of the decision, so a different session receives an empty result.

## What the code below is doing

The page demonstrates the same idea five times.

Object-level authorization comes first. `getOrderForUser` returns the order only when `ownerId` matches the session user. A missing order and someone else's order both return `null`. You send that as not found, so the response does not advertise that the id exists.

Function-level authorization is next. `routePolicy` lists the roles for each route. `authorize` returns false when the route is unknown, the user is missing, or `roles` is absent from the overlap with the policy. A user role cannot call the admin delete. An admin role cannot call a route that was never written down.

Path handling is the third block. `safeJoin` resolves the root and the requested path, then returns the full path only when it is the root or a child of the root. A path that would land outside comes back `null`.

Cross-origin headers are the fourth. `corsHeaders` sets the allow-origin and allow-credentials headers only when the origin is an exact member of `allowedOrigins`. Every other origin, including a lookalike name, gets an empty object.

Server-side requests are the fifth. `isAllowedUrl` accepts `https` only, refuses a username or password embedded in the URL, refuses localhost, and refuses private, loopback, and link-local addresses. The host has to sit in `allowedHosts`. The note under the checks says a real fetch should refuse redirects.

When you talk about it, say this: login says who you are. The server, on each object, says what you may touch, and the default is no.
