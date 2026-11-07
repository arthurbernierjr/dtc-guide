---
editorial: true
title: The Gatekeeper
subtitle: Nginx, Reverse Proxies, and Process Management
hook: "Your server has an address and nothing answering it. Today Nginx takes the public door, a Node process waits behind it on a loopback port, and pm2 brings that process back after a crash and after a reboot."
read: 65
artifact: "Nginx serving /var/www/hall-client on port 80 and proxying /api/ to a pm2-managed Node process on a loopback port, with a reboot-tested startup hook and docs/runbook.md"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://nginx.org/en/docs/beginners_guide.html
  - https://nginx.org/en/docs/http/ngx_http_core_module.html#location
  - https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass
  - https://pm2.keymetrics.io/docs/usage/quick-start/
  - https://pm2.keymetrics.io/docs/usage/startup/
  - https://pm2.keymetrics.io/docs/usage/application-declaration/
say:
  - "Nginx owns 80 and 443; the app owns a loopback port nobody else can reach."
  - "proxy_pass with a path replaces the matched prefix; without one it forwards the path untouched."
  - "pm2 startup, paste the printed command, then pm2 save, then reboot to prove it."
---

## The hook

Last session ended with a hardened machine and a Node that refused to start for want of a secret. Open `http://YOUR_DROPLET_IP` in a browser right now and the tab spins and gives up, because port 80 is allowed through the firewall and nothing on the server is listening there. Today something listens. Nginx takes the public ports, serves a page from a directory, and forwards everything under `/api/` to a Node process that only the server itself can reach. Then pm2 takes custody of that process so it survives you closing the terminal, survives a crash, and survives `sudo reboot`.

By the end of the session a browser anywhere opens `http://YOUR_DROPLET_IP` and sees a page you wrote, `curl http://YOUR_DROPLET_IP/api/ping` returns JSON from Express, `curl http://YOUR_DROPLET_IP:3000/health` times out because the firewall is doing its job, and `pm2 list` after a reboot shows the process `online` with nobody having started it. You will also have made a 502 on purpose, read the exact line Nginx writes about it, and put it back.

> *The land has a wall now and a gate in the wall. Behind the gate, a clerk who never sleeps hands each visitor to the right room.*

## The idea

Nginx is a web server and a reverse proxy. The first job is the one GitHub Pages did for you: given a directory and a path, send the file. The second job is the one this unit needs: accept a connection from the public internet, open a second connection to a process on the same machine, forward the request, and relay the answer. The browser never learns that a Node process exists. It talked to Nginx on port 80 and got a response.

Why not let Express listen on 80 itself? Three reasons that matter at your scale. Ports below 1024 belong to root, and you do not want the hall running as root. Nginx serves static files faster than Express will and does TLS termination next session so Express never touches a certificate. And one Nginx can front several apps on several ports under one address, which is how a second project lands on this same droplet without a second droplet. The pattern is edge, upstream, process, and the figure draws it in that order.

![](diagram:session-6-2/fig1-model)

### Server blocks and the two directories

Nginx configuration lives in `/etc/nginx/`. `nginx.conf` is the main file, and you leave it alone. `sites-available/` holds one file per site; `sites-enabled/` holds symlinks to the ones that are live. The package ships a site called `default` that serves the welcome page. The workflow for every change is the same four commands: edit the file in `sites-available`, make sure the link exists in `sites-enabled`, `sudo nginx -t` to check syntax, `sudo systemctl reload nginx` to apply it without dropping connections. A reload after a failed test applies nothing, which is why the test comes first.

A `server` block answers for a `listen` port and a `server_name`. Inside it, `location` blocks match the request path by prefix, and the longest matching prefix wins. `root` names the directory, and `try_files $uri $uri/ =404` means: look for a file at that path, then a directory, then answer 404. Next session `server_name` becomes your domain; today it is the IP, and `_` would also work as "whatever the client asked for".

### What `proxy_pass` does to the path

A `location /api/` block with `proxy_pass http://127.0.0.1:4100;` forwards the request path untouched: `/api/items` arrives at Express as `/api/items`. The same block with `proxy_pass http://127.0.0.1:4100/;`, one trailing slash more, replaces the matched prefix with that slash: `/api/items` arrives as `/items`. The nginx reference states the rule as "if proxy_pass is specified with a URI, the part of the request URI matching the location is replaced by that URI." Both forms are useful. Only one of them matches the hall, whose routes are written with `/api/` in them, `app.get('/api/inbox', ...)`, so the form without a trailing slash is the one you want. Write the mapping beside the block when you edit it: incoming `/api/inbox` must reach Express as `/api/inbox`.

Use `127.0.0.1`, not `localhost`, in `proxy_pass`. Nginx resolves `localhost` from `/etc/hosts` when it starts, and on Ubuntu that name has both an IPv6 and an IPv4 entry. A Node process bound to IPv4 only then gets intermittent 502s as Nginx tries `[::1]` first. The numeric address removes the ambiguity, and it matches what "loopback port" in the figure means: an address only this machine can dial.

The `proxy_set_header` lines matter because the upstream connection is a new connection. Without `Host $host`, Express sees `127.0.0.1:4100` as the host. Without `X-Forwarded-For`, every request appears to come from `127.0.0.1`, which is Nginx. Without `X-Forwarded-Proto`, Express cannot tell that the original request was HTTPS. The `Upgrade` and `Connection` pair exist so a WebSocket handshake can pass through later; they cost nothing now.

### Why a terminal is not a process manager

`node server.js` runs as a child of your shell. Close the SSH session and the shell gets a hangup, and the child goes with it. If the process throws and exits, it stays exited. If the machine reboots, nothing knows to start it. A process manager is a daemon that owns your process instead of the shell: it restarts on exit, keeps the stdout and stderr in files you can tail, and registers itself with systemd so that the whole list comes back on boot. pm2 is the one the Node world uses, and it is an npm package installed globally.

The boot part has a precise sequence that old notes always get backwards. `pm2 startup` does not install anything; it prints a command, with the path to the pm2 binary and your username in it, that must be run with `sudo`. You paste and run that printed command. Then `pm2 save` writes the current process list to `~/.pm2/dump.pm2`, which is what the systemd unit resurrects at boot. Save before startup saves a list nobody will read. Startup without save registers a unit that starts an empty list. Then you reboot, on purpose, because an untested boot hook is a guess.

An ecosystem file turns the command line you typed into a file in the repo. `pm2 start ecosystem.config.js` reads the name, the script, the working directory, the restart policy, and any environment the process should see. Next session's hall will use one more field, `node_args`, to pass `--env-file=.env` so Node reads the secrets file on the server the same way it does on your laptop. The test app today uses the `env` field instead, so you can see that an ecosystem `PORT` reaches `process.env.PORT`.

### Two connections, two checks

A 502 from Nginx means "I accepted the client's connection and could not get a good answer from the upstream." It does not say whether the process is dead, listening on another port, or crashing on every request. So the diagnosis is two curls, in this order. First, on the server, hit the upstream directly: `curl http://127.0.0.1:3000/health`. If that fails, the problem is the process, and Nginx is innocent. If that succeeds, hit the public path through Nginx: `curl http://YOUR_DROPLET_IP/api/ping`. If that fails, the problem is the proxy block. The checkpoint below models exactly that decision, because it is the one you will make at two in the morning.

## The demonstration

Two SSH sessions to the droplet, both as `deploy`; call them Terminal A and Terminal B. The laptop terminal is a third window. Everything today happens on the server except the curls marked laptop. Where you are at the start of today:

```text
laptop      ~/projects/hall-api and ~/projects/hall-client · nothing running
server A    ssh deploy@YOUR_DROPLET_IP · /home/deploy/hall-api and hall-client cloned · only sshd listening
server B    second ssh session, same user · used for curl and logs
browser     http://YOUR_DROPLET_IP · spins and gives up, nothing on port 80 yet
```

Install and look, in Terminal A:

```bash
# server, Terminal A
sudo apt update
sudo apt install -y nginx
systemctl status nginx --no-pager
```

```text
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Sat 2026-11-14 15:02:11 UTC; 3s ago
```

`active (running)` and `enabled` are the two words to read. From the laptop, `curl -I http://203.0.113.10` prints `HTTP/1.1 200 OK` and a `Server: nginx/1.24.0 (Ubuntu)` header, and a browser shows the welcome page. Port 80 went from a spinner to a page because a process now listens on it.

The directory the hall will eventually live in, with ownership that lets you write and Nginx read, still in Terminal A:

```bash
# server, Terminal A
sudo install -d -o deploy -g www-data -m 0750 /var/www/hall-client
nano /var/www/hall-client/index.html
```

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Guild hall</title>
</head>
<body>
  <h1>The hall is under construction.</h1>
  <p>Nginx is serving this file from /var/www/hall-client.</p>
</body>
</html>
```

`install -d` makes the directory owned by `deploy` with group `www-data`, which is the user Nginx runs as. Mode `0750` lets the group read and traverse, and keeps everyone else out. You write the file as yourself, no `sudo`. The site file:

```bash
# server, Terminal A
sudo nano /etc/nginx/sites-available/hall
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 203.0.113.10;

    root /var/www/hall-client;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Enable it and retire the default:

```bash
# server, Terminal A
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/hall /etc/nginx/sites-enabled/hall
sudo nginx -t
sudo systemctl reload nginx
```

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Reload the browser tab: your heading. Nginx is serving a directory you own. That is the static half of the final shape, and in 6-4 the Vite build lands in that same directory.

Now a process to stand behind it. Not the hall yet, because the hall needs a database; a forty-line Express app whose only purpose is to be an upstream, in Terminal A:

```bash
# server, Terminal A
mkdir -p ~/test-app && cd ~/test-app
npm init -y
npm install express
nano server.js
```

```js
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Node behind Nginx', host: req.get('host') });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
});

app.get('/api/ping', (req, res) => {
  res.json({ pong: true, path: req.originalUrl, from: req.get('x-forwarded-for') || 'direct' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'no route for ' + req.originalUrl });
});

app.listen(port, () => {
  console.log('listening on ' + port);
});
```

`port` reads `process.env.PORT` so an ecosystem file can set it later. The 404 handler echoes the path Express saw, which is the instrument for the trailing-slash lesson. Start it in Terminal A, and it holds that terminal:

```bash
# server, Terminal A
node server.js
```

```text
listening on 3000
```

In Terminal B, prove the upstream on its own, then prove the firewall from the laptop:

```bash
# server, Terminal B
curl -s http://127.0.0.1:3000/health
```

```text
{"status":"ok","uptime":12}
```

From the laptop, `curl -m 5 http://203.0.113.10:3000/health` prints `curl: (28) Connection timed out after 5001 milliseconds`. Port 3000 is not in the UFW list, so the outside cannot reach the process, and that is the design. Now the proxy, in Terminal B:

```bash
# server, Terminal B
sudo nano /etc/nginx/sites-available/hall
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 203.0.113.10;

    root /var/www/hall-client;
    index index.html;

    # /api/ping must reach Express as /api/ping: no trailing slash on proxy_pass
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

```bash
# server, Terminal B
sudo nginx -t && sudo systemctl reload nginx
```

From the laptop:

```bash
# laptop
curl -i http://203.0.113.10/api/ping
```

```text
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Content-Type: application/json; charset=utf-8

{"pong":true,"path":"/api/ping","from":"198.51.100.23"}
```

Read the three facts in that response. `Server` is Nginx, because Nginx answered the laptop. The body is from Express, because Nginx forwarded. `from` is your laptop's public address, because `X-Forwarded-For` carried it; without that header Express would have printed `direct`. Now `curl http://203.0.113.10/` still returns the HTML page, because `/` matched the static block and `/api/` matched the proxy block. Longest prefix wins.

Break the path on purpose. Change `proxy_pass` to `http://127.0.0.1:3000/;` with the trailing slash, test, reload, and curl `/api/ping` again:

```text
HTTP/1.1 404 Not Found

{"error":"no route for /ping"}
```

Express told you what it received: `/ping`. The `/api/` prefix was replaced by `/`. Put the slash back, test, reload, and the 200 returns. That is the Wrong path diagnosis, seen once with your own instrument.

Now the process manager. In Terminal A, Ctrl-C the running app; the laptop curl now returns `502 Bad Gateway`, and `sudo tail -n 2 /var/log/nginx/error.log` shows `connect() failed (111: Connection refused) while connecting to upstream`. Remember that line. Then, in Terminal A:

```bash
# server, Terminal A
sudo npm install -g pm2
cd ~/test-app
pm2 start server.js --name test-app
pm2 list
```

```text
┌────┬────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name       │ mode    │ ↺       │ status   │ cpu    │ mem  │ user      │
├────┼────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 0  │ test-app   │ fork    │ 0       │ online   │ 0%     │ 48mb │ deploy    │
└────┴────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
```

The laptop curl is 200 again, and Terminal A is free, because pm2 owns the process now. `pm2 logs test-app --lines 5` shows the `listening on 3000` line in the out log. Close Terminal A entirely and curl again: still 200. The shell is gone and the process is not.

Boot, in the correct order, in Terminal B, the session you still have:

```bash
# server, Terminal B
pm2 startup
```

```text
[PM2] Init System found: systemd
[PM2] To setup the Startup Script, copy/paste the following command:
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
```

Copy the printed line, yours, not this one, and run it. It writes a systemd unit called `pm2-deploy`. Then:

```bash
# server, Terminal B
pm2 save
sudo reboot
```

`pm2 save` prints `[PM2] Saving the process list to /home/deploy/.pm2/dump.pm2`. The reboot drops your sessions. Wait thirty seconds, `ssh deploy@203.0.113.10` from the laptop, call that session Terminal A again, and:

```bash
# server, Terminal A, a fresh session after the reboot
pm2 list
uptime
```

`test-app` is `online` with uptime measured in seconds, and nobody typed `pm2 start`. Curl from the laptop returns 200. That reboot is the evidence the figure calls Process.

Finally, the process definition as a file, so the next person does not need to remember a command line:

```bash
# server, Terminal A
nano ~/test-app/ecosystem.config.js
```

```js
module.exports = {
  apps: [{
    name: 'test-app',
    script: 'server.js',
    cwd: '/home/deploy/test-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

```bash
# server, Terminal A
cd ~/test-app
pm2 delete test-app
pm2 start ecosystem.config.js
pm2 save
```

Change `PORT` to `3001` in that file, `pm2 restart ecosystem.config.js --update-env`, and the laptop curl is a 502 while `curl http://127.0.0.1:3001/health` on the server is fine: the ecosystem `env` reached the process, and Nginx is still pointed at 3000. Put it back to 3000, restart, save. You have now seen a 502 from both sides, process down and port moved.

A small model you can run here. It does not start Nginx or pm2. It models the `proxy_pass` path rule, the two-curl diagnosis, and the save-before-boot rule, and it proves you can state them. The reboot on your droplet is the proof that counts.

```js run=checkpoint-6-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function upstreamPath(location, proxyPass, requestPath) {
  const match = proxyPass.match(/^https?:\/\/[^/]+(\/.*)?$/);
  const uri = match && match[1];
  if (!uri) return requestPath;
  return uri + requestPath.slice(location.length);
}
check(upstreamPath('/api/', 'http://127.0.0.1:4100', '/api/inbox') === '/api/inbox', 'no URI on proxy_pass forwards the path untouched');
check(upstreamPath('/api/', 'http://127.0.0.1:4100/', '/api/inbox') === '/inbox', 'a trailing slash replaces the matched prefix');

function diagnose(result) {
  if (!result.direct) return 'inspect the upstream process';
  if (!result.proxied) return 'inspect the proxy block';
  return 'request path works';
}
check(diagnose({ direct: false, proxied: false }) === 'inspect the upstream process', 'Upstream first');
check(diagnose({ direct: true, proxied: false }) === 'inspect the proxy block', 'Proxy boundary isolated');
check(diagnose({ direct: true, proxied: true }) === 'request path works', 'both connections answer');

function boot(steps) {
  let saved = null;
  let unit = false;
  const running = ['test-app'];
  steps.forEach(function (step) {
    if (step === 'startup') unit = true;
    if (step === 'save') saved = running.slice();
  });
  return unit && saved ? saved : [];
}
check(boot(['startup', 'save']).length === 1, 'startup, then save, then the list survives a reboot');
check(boot(['startup']).length === 0, 'startup without save boots an empty list');
check(boot(['save']).length === 0, 'save without the startup unit boots nothing');

console.log('ok: checkpoint-6-2');
```

## Where it breaks

![](diagram:session-6-2/fig2-diagnosis)

### 502 gateway error

The public URL returns `502 Bad Gateway` with Nginx's own error page, and `/var/log/nginx/error.log` has a line ending `while connecting to upstream, client: ..., upstream: "http://127.0.0.1:3000/..."`. Nginx accepted the request and could not get an answer from the port in `proxy_pass`. Two causes dominate: the process is not running, or it is running on a different port than the block names. A third is a process that is up but crashes on the first request, which pm2 shows as a climbing restart count.

Run the two curls in order. `curl http://127.0.0.1:3000/health` on the server: refused means the process is down or elsewhere, so `pm2 list` and `pm2 logs` are next, not the Nginx file. Answered means Nginx is pointed at the wrong place, so compare the port in the ecosystem file to the port in the site file. Do not restart everything and hope. The log line names the upstream address it tried; believe it.

### Wrong path

`/api/ping` is 200 when you curl port 3000 directly and 404 through Nginx, and the 404 body says `no route for /ping`. The proxy rewrote the path. A `proxy_pass` with a URI part, even just `/`, replaces the matched `location` prefix with that URI. The hall's routes carry `/api/` in them, so the prefix must survive.

Remove the trailing slash from `proxy_pass`, test, reload, curl again. If you ever do want the prefix stripped, because an upstream expects `/inbox` and not `/api/inbox`, keep the slash and write the mapping as a comment above the block, because the next reader will not guess. Express's `req.originalUrl` is the instrument: log it, or echo it in the 404 as the test app does, and compare it to what you typed.

### Lost process after reboot

The droplet rebooted for a kernel update, or you ran `sudo reboot`, and the site is a 502 until you SSH in and start the app by hand. Either the startup unit was never installed, or `pm2 save` ran before `pm2 start`, so the saved list was empty, or `pm2 startup` printed its command and you did not paste it.

`systemctl status pm2-deploy` tells you whether the unit exists and ran. `cat ~/.pm2/dump.pm2` shows what was saved; an empty array is the second cause. Fix the order: start the app, `pm2 startup`, paste the printed `sudo env ...` line, `pm2 save`, reboot again. Until the reboot has happened and `pm2 list` showed `online` afterwards, the setup is a process that happens to be running.

## Your turn

Repeat the demonstration on your droplet and write down the line each step prints.

1. `sudo apt install -y nginx`, then `systemctl status nginx --no-pager`. You see `active (running)`. From the laptop, `curl -I http://YOUR_DROPLET_IP` prints `HTTP/1.1 200 OK`.
2. `sudo install -d -o deploy -g www-data -m 0750 /var/www/hall-client` and write `index.html` there with your own heading. Create `/etc/nginx/sites-available/hall` with the static block, remove the `default` link, add the `hall` link, `sudo nginx -t` prints `test is successful`, reload. The browser shows your heading at `http://YOUR_DROPLET_IP`.
3. Create `~/test-app` with the Express file above and `node server.js` in Terminal A. In Terminal B, `curl -s http://127.0.0.1:3000/health` prints `{"status":"ok",...}`. From the laptop, `curl -m 5 http://YOUR_DROPLET_IP:3000/health` times out.
4. Add the `location /api/` proxy block with `proxy_pass http://127.0.0.1:3000;`, test, reload. From the laptop, `curl -i http://YOUR_DROPLET_IP/api/ping` prints `200` and a body with `"path":"/api/ping"`.
5. Add a trailing slash to `proxy_pass`, reload, curl again. You see `404` and `"no route for /ping"`. Remove the slash, reload, confirm `200`.
6. Ctrl-C the app in Terminal A. The laptop curl prints `502 Bad Gateway`. `sudo tail -n 2 /var/log/nginx/error.log` shows `connect() failed (111: Connection refused)`.
7. `sudo npm install -g pm2`, `pm2 start server.js --name test-app`, `pm2 list` shows `online`. Close Terminal A. The laptop curl is `200` again.
8. `pm2 startup`, paste the printed `sudo env PATH=...` command, `pm2 save`, `sudo reboot`. After thirty seconds, SSH back in and `pm2 list` shows `test-app` `online`.
9. Write `ecosystem.config.js` as above, `pm2 delete test-app`, `pm2 start ecosystem.config.js`, `pm2 save`. Change `PORT` to `3001`, `pm2 restart ecosystem.config.js --update-env`, and confirm the laptop curl is `502` while `curl http://127.0.0.1:3001/health` on the server is `200`. Restore `3000`, restart, save.

If step 4 is a 502 before you have touched anything, go back to step 3: is the app still running in Terminal A?

## The quest

![](diagram:session-6-2/fig3-evidence)

Write `docs/runbook.md` in `~/projects/hall-api` on your laptop, next to `docs/server.md`, commit, push. It is the page you would read at two in the morning. No secrets.

- The four-command Nginx change workflow, with the exact file paths on your server.
- The pm2 commands you actually use: start from the ecosystem file, `list`, `logs --lines 50`, `restart`, `delete`, `save`, and where the dump file lives.
- The path mapping sentence for `/api/`, and what the 404 body looked like when the slash was wrong.
- The two-curl diagnosis for a 502, with the two commands and what each outcome means.
- The reboot result: the `pm2 list` table after `sudo reboot`, pasted, with the uptime column.
- Where the three logs are: pm2 out and error, Nginx access, Nginx error, and the `journalctl -u nginx` form.
- One line on the port change experiment: what moved, what did not, and which curl told you.

Evidence: the committed `docs/runbook.md`, a screenshot named `6-2-after-reboot.png` of `pm2 list` with a fresh uptime, and a screenshot named `6-2-502.png` of the Nginx error log line.

## Side quests

The block you wrote is a reverse proxy in the narrowest sense, and the three log files you located are the beginning of observability, so the two library sheets for this session name what you just built.

## Before next session

Leave everything running. The droplet now carries Nginx on port 80 and pm2 holding `test-app` on 3000, and both come back after a reboot. Close your SSH sessions with `exit`. Nothing runs on the laptop. State at close:

```text
laptop      ~/projects/hall-api and ~/projects/hall-client · docs/runbook.md pushed · nothing running
server A    ssh deploy@YOUR_DROPLET_IP · Nginx on 80 serving /var/www/hall-client · test-app on 3000 under pm2 · closed with exit
server B    closed with exit
browser     http://YOUR_DROPLET_IP · your under-construction heading
```

Next session the IP gets a name. You register a domain, point an A record at `YOUR_DROPLET_IP`, change `server_name` to that name, and let certbot fetch a Let's Encrypt certificate so the address bar shows `https://`. Have a payment method ready for the registrar; prices vary by ending, and the session teaches you where to read the renewal price before you buy. Read the Let's Encrypt "how it works" page from next session's docs list once, just enough to know what a challenge is. The session starts on the laptop, at a registrar's search box.
