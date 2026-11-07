---
editorial: true
title: The Runtime Beyond the Browser
subtitle: What Node.js is, and what Express is
hook: "JavaScript leaves the page. Node is the runtime that runs it on a machine, and Express is the small library that turns that machine into a server."
read: 45
artifact: "A one-file Express app that answers GET / with text, and a note of what Node is doing underneath"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://nodejs.org/en/learn/getting-started/introduction-to-nodejs
  - https://expressjs.com/en/starter/installing.html
  - https://expressjs.com/en/starter/hello-world.html
say:
  - "Node runs JavaScript outside the browser, on one thread with an event loop."
  - "Express is a layer on top of Node's http module, not a new language."
  - "A server is a process that listens on a port and writes a response."
---

## The hook

The browser has been the whole world so far. HTML, CSS, a game that runs because Chrome runs it. Close the tab and the program is gone. Node is the other place JavaScript runs: not in a tab, on the machine, as a process you start from the terminal. Express is not a second language and not a second runtime. It is a small library, installed with npm, that sits on Node's built-in HTTP server and lets you attach functions to methods and paths.

By the end of this session you can say what Node is, what it is not, and what Express adds. You will have a one-file server that answers `GET /`. The rest of Unit 4 is that process growing a router, a database, pages, a JSON API, passwords, and finally a React screen. None of that fits in a process that only exists inside a browser tab.

> *The page was a painting of a door. The server is a door that stays open after you look away.*

## The idea

Node's own introduction is the sentence to keep: Node.js is a JavaScript runtime. The language is still JavaScript. The runtime is the program that executes it. In the browser that program is the browser, and the famous engine inside Chrome is V8. Node took V8 out of the browser and gave it a standard library aimed at servers and command-line tools: files, processes, sockets, and a module system. There is no `window`, no `document`, and no DOM. A script that starts with `document.querySelector` is a browser script. A script that starts with `require('node:http')` or `import http from 'node:http'` is a Node script. They can share functions you wrote. They cannot share the host.

That split is why "it works on my page" is not evidence about a server, and why a tutorial that pastes browser code into a file named `server.js` fails in a way that looks like JavaScript is broken. JavaScript is fine. You asked a runtime for an object it does not have.

Node runs your JavaScript on a single thread. One call stack. When you write a loop that burns CPU, nothing else in that process moves, including other people's requests. The reason a Node server can still hold many connections is the same reason the browser stays responsive while an image downloads: the slow work is not done on the JavaScript thread. Reading a file, talking to a database, and waiting on a socket are handed to the operating system. When they finish, a callback is queued. The event loop pulls from that queue when the stack is empty. You already lived this in the browser, with clicks and timers as the events. On the server the events are I/O. The design is a gift for waiting and a trap for heavy computation. A checksum of a giant file, done in a tight loop in the request handler, stalls every other client. The fix is not "Node is fast." The fix is to keep the thread free, which is a later conversation. Today, know which work belongs on the thread and which work is a wait.

You can serve HTTP without Express. Node's `node:http` module creates a server. You pass a function, and that function is called with a request and a response for every connection. You write the status and the body yourself, and you end the response yourself. Express is a layer on top of that function. The Express install guide is three commands and a dependency. The hello-world guide is the whole idea in one file: create an application, register a route with a method and a path, and listen on a port. Express does not open a port by existing. `listen` does. Until `listen` succeeds, you have a description of a server, not a server. After it succeeds, the operating system delivers connections for that port to your process. Port 3000 is a habit, not a law. If another process already has it, Node raises `EADDRINUSE` and exits. Two servers do not share a port politely.

npm is how the dependency arrives. `npm init` writes `package.json`, the manifest of your project. `npm install express` adds Express to that manifest and extracts the files into `node_modules`. The lockfile records the exact tree you installed. Commit the manifest and the lockfile. Do not commit `node_modules`. The next machine installs from the lockfile. That is the difference between "it worked here" and "it can be built again."

A route handler is a function of `(req, res)`. `req` is the incoming request: method, path, headers, and later a body. `res` is how you answer. `res.send` writes a body and finishes the response. `res.json` does the same for a value it serializes, and sets the content type. If the function returns without sending, the connection stays open. The browser spinner is not a mystery. You never answered. Express will not invent a reply for you.

This unit uses Express 5. The behavior you will lean on next session is in the error-handling guide: an `async` route that throws, or returns a promise that rejects, is forwarded to the error handler. You do not wrap every handler in `try/catch` just to call `next(err)`. Older posts written for Express 4 will tell you that you must. Read the page that matches the version in your `package.json`, not the first result in a search.

What you should be able to draw on a napkin: a browser and Node share a language and not a platform. Node is one thread plus an event loop fed by I/O. Express is a router and a middleware stack on `node:http`. A server is a process that has successfully called `listen`. The response is your job.

![](diagram:session-4-1/fig1-model)

### The three objects, and nothing else

Keep the vocabulary small enough to say out loud.

**Node** is the runtime. You start it with the `node` command. `node -v` is the version you are actually running. Write it down. A later deploy that uses a different major version is a different program, even when the files match.

**http** is the built-in module. It speaks the protocol: a request line, headers, a body, and a response in the same shape. You rarely call it once Express is installed, but when a bug is underneath Express, this is the layer that owns the socket.

**Express** is the package. `express()` returns an application. `app.get`, `app.post`, and the other method helpers register a match. `app.listen` is what binds the port. The application object is a facade over the harder module. The facade is the point. You do not lose the right to drop down. You just should not start there.

### A request, in the order it actually happens

Someone, later it will be a browser and today it is curl, opens a TCP connection to your machine on the port you bound. Node accepts it. The HTTP parser inside `node:http` turns bytes into a request object: a method, a URL, headers, and eventually a body if there is one. Express walks the middleware and routes you registered, in the order you registered them, and calls the first match. Your function runs on the same thread as every other request's JavaScript. If you send a response, Express finishes the HTTP message and the socket can be reused. If you throw, Express 5's default path is the error handler, which you have not customized yet, so the client gets a 500 and, outside production, a stack trace. If you do neither, the socket sits there until the client gives up.

None of those steps is a framework concept you need a diagram to survive. They are the reason the log line, the curl, and the hung request are three different facts. "The server is running" only means `listen` returned. "The route works" means a client received the body you intended, with the status you intended. Get used to checking both. A green log line is not a response.

### What a module is, here

Node loads code from files. CommonJS is `require` and `module.exports`. ECMAScript modules are `import` and `export`, which you opt into with `"type": "module"` in `package.json` or by naming the file `.mjs`. The Express docs show both. Pick one for this unit and stay with it. Mixing them in the first file is how a working example becomes a syntax error that has nothing to do with servers. This lesson's samples use CommonJS, because a fresh `npm init` still speaks it unless you say otherwise.

`require('express')` looks in `node_modules`. `require('node:http')` is the built-in, and the `node:` prefix is how you say so on purpose. A file of your own is a relative path, `require('./quest')`. There is no magical global where your functions appear. If you did not import it, it is not there.

## The demonstration

One folder, one manifest, one file. The folder is `~/projects/guild-door`, and it is the project you keep through the rest of this half of the unit: every session up to the seals in 4-8 edits this same folder. From a terminal:

```bash
cd ~/projects
mkdir guild-door && cd guild-door
npm init -y
npm install express
```

`package.json` now lists `express` under dependencies. `node_modules/express` exists. The lockfile exists. Then `server.js`:

```js
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('The door is open.');
});

app.listen(port, () => {
  console.log('listening on ' + port);
});
```

`process.env.PORT` is how a host will tell you the port later. Locally it falls through to 3000. Start it with `node server.js`. The log line prints only if `listen` succeeded. In another terminal, `curl http://localhost:3000/` returns the sentence. `curl` is already installed on macOS, on WSL, and on Linux; `curl --version` proves it. It is the tool this path uses to knock on a server from outside the process, for the rest of the unit. `curl -i` shows the status line, `200`, and the headers Express set. Stop the process with Ctrl-C. `curl` then fails to connect. The program did not "keep the site up." The process was the site.

Change the handler to return without `res.send`, restart, and curl again. The request hangs. That is the lesson, not a broken install. Put the `send` back.

Start a second `node server.js` without stopping the first. You get `EADDRINUSE`. The port is taken. This is the error you will see again on a deploy, usually because a previous process is still alive, not because Express is cursed.

```js run=checkpoint-4-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function describeHost(name) {
  if (name === 'browser') return { document: true, httpModule: false, listen: false };
  if (name === 'node') return { document: false, httpModule: true, listen: true };
  throw new Error('unknown host');
}

const browser = describeHost('browser');
const node = describeHost('node');
check(browser.document === true && browser.httpModule === false, 'the browser has a document and no http module');
check(node.document === false && node.httpModule === true && node.listen === true, 'node has http and listen, and no document');

function answer(sent) {
  return sent ? { status: 200, hanging: false } : { status: null, hanging: true };
}
check(answer(true).hanging === false, 'sending a body finishes the response');
check(answer(false).hanging === true, 'returning without a body leaves the request hanging');
console.log('ok: checkpoint-4-1');
```

The checkpoint is a model of the distinction, not a running server. The Run button cannot bind a port inside this page. The server you start in your own terminal is the demonstration. The model only checks that you can say which host owns which object, and what happens when a handler forgets to answer.

## Where it breaks

![](diagram:session-4-1/fig2-diagnosis)

### Wrong runtime

You paste a handler that reads `document.body` into `server.js`, or you open `server.js` by double-clicking it so the browser downloads it and does nothing. `document` is not a Node global. The stack trace says so, immediately, if you actually ran `node server.js`. If you ran nothing, there is no stack trace, which is the more common version of this bug. The file is not a website. The process is.

### Port already taken

`EADDRINUSE` means the bind failed. Find the other process and stop it, or pick another port. Killing random terminals until the error goes away also works, and teaches you nothing. `lsof -i :3000` or your system's equivalent tells you the pid. A nodemon you forgot about is the usual culprit once you start using one. Today it is almost always a second `node server.js`.

### No response

The log says listening. The browser spins. The handler ran, logged `req.method`, and returned. `res.send` was in a branch the request did not take, or it was after a `return` you added while debugging. Every path out of the handler either sends or, later, calls `next`. A path that does neither is a hung request. Add a log at the top and at each branch. The branch that logs and then goes quiet is the hole.

## Your turn

Make the door yours. The folder is the one you just made, `~/projects/guild-door`. There is no separate sample and no second folder: this is the project, and sessions 4-2 through 4-8 all build in it.

1. `git init` in `~/projects/guild-door`, then `npm init` and install Express. Confirm `express` is in `dependencies` and that `node_modules` is not something you are about to commit. Add a `.gitignore` with `node_modules` on its own line before the first commit.
2. Answer `GET /` with your name and the Node version. `process.version` is the string. Send it in the body so you can see it from curl.
3. Add `GET /health` that sends the text `ok`. Two routes, same app, one listen.
4. Start the server, curl both paths, and write down the status line from `curl -i`.
5. Stop it. Curl again. Write down the error curl prints when nothing is listening. That error is what a monitor is looking for later. It is not a 500. Nothing accepted the connection.

If `npm install` fails, read the first error, not the last twenty lines of warnings. A warning about an old engine is not the failure. A missing network, a typo in the package name, or a `package.json` you edited into invalid JSON is the failure.

## The quest

![](diagram:session-4-1/fig3-evidence)

Write a one-page note, `RUNTIME.md`, in the same folder, in your own words. Six sentences, no more, covering:

- what Node is, and what it is not
- what Express adds that `node:http` does not hand you for free
- what `listen` does, and what `EADDRINUSE` means
- why a handler that returns without `res.send` hangs
- the version of Node you are on, and the version of Express in your lockfile
- where you would look if an old tutorial disagrees with your error-handling behavior

Then commit the manifest, the lockfile, `server.js`, `.gitignore`, and the note. Do not commit `node_modules`. Create an empty GitHub repository named `guild-door` and push, the way you did in 1-4; do not let GitHub add a README, since the folder already has files. This repository is the door. Every session through 4-8 builds in `~/projects/guild-door`.

## Side quests

Express is a small door in front of a larger machine. Two library pages name that shape.

## Before next session

Next session the door stops being a single route. You will mount middleware, split routes onto a router, and write the error handler Express calls when a function throws. Read the Express routing guide's opening and the error-handling page's section on asynchronous code before you sit down. You are not memorizing it. You are arriving knowing that `next` exists and that an async function's rejection is not your private problem.

One more distinction to carry in, because every later lesson leans on it. A module you import is not running a server. Importing Express creates nothing on the network. Calling `express()` creates an application object in memory. Only `listen` asks the operating system for a port. When a tutorial says "run the file" and you instead paste it into a browser console, you have skipped the only step that makes it a server. When a tutorial says "it is running" and you have not sent a request from outside the process, you have a log line and a guess. Curl, or a browser pointed at `http://localhost:3000`, is the other half of the demonstration. Keep both halves for the rest of the unit.

Stop the server with Ctrl-C before you close the terminal. Nothing needs to stay running between sessions, and the next one starts by replacing `server.js` in this same folder.
