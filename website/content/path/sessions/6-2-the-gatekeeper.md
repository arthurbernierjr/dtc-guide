---
editorial: true
title: The Gatekeeper
subtitle: Nginx, Reverse Proxies, and Process Management
hook: "An Nginx reverse proxy and process-management runbook. Nginx accepts public HTTP requests."
read: 60
artifact: "An Nginx reverse proxy and process-management runbook"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://nginx.org/en/docs/http/ngx_http_proxy_module.html
  - https://pm2.keymetrics.io/docs/usage/quick-start/
say:
  - "Edge: Nginx accepts public HTTP requests."
  - "Upstream: Forward API traffic to a loopback application port."
  - "Process: Restart deliberately and retain useful logs."
---

## The hook

"Last session, you spun up a server, locked it down, and installed Node.js. Your cloud territory exists, but it has no gatekeeper. Right now, if someone visits your IP address in a browser, they get nothing. Today we install the gatekeeper. Nginx is the bouncer at the door of your server. It decides who gets in and where they go. It serves static files at lightning speed, it proxies requests to your Node.js app, and it handles SSL termination. And PM2 is the enchantment that keeps your app alive forever, even if it crashes, even if the server reboots. By the end of today, you will have a web server running on the real internet."

---

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Configure Web Server and Process Management

Install and configure Nginx as both a static file server and a reverse proxy, and use PM2 to manage Node.js processes in a production environment.

**Enabling Objectives:**

- Install Nginx and verify it serves the default welcome page on port 80
- Create Nginx server blocks in sites-available, enable them with symlinks in sites-enabled, and validate configuration syntax
- Configure Nginx as a reverse proxy that forwards HTTP requests to a Node.js application running on a local port
- Install PM2 globally, start Node.js applications as managed processes, and configure auto-restart on crash and system boot
- Read and interpret Nginx access logs, error logs, and PM2 application logs for debugging

**You should be able to:**
- You will be able to configure Nginx to serve static content and proxy dynamic requests to a Node.js backend, with PM2 ensuring the backend survives crashes and server reboots.

---

**0:00 - 0:05 | Session Kickoff**

Quick recap: Last session, you spun up a server, locked it down, and installed Node.js. Today, we install the gatekeeper. Nginx is the bouncer at the door of your server. It decides who gets in and where they go.

**0:05 - 0:25 | What Is Nginx and Why Do You Need It?**

Nginx (pronounced "engine-x") is a web server and reverse proxy. It is used by Netflix, Airbnb, WordPress.com, and roughly 34% of all websites on the internet. It is insanely fast and rock solid.

**"But wait, Node.js can serve HTTP. Why do I need Nginx?"**

Great question. Here is why:

1. **Performance:** Nginx is built in C and optimized for serving static files (HTML, CSS, JS, images). It handles thousands of simultaneous connections with minimal memory. Node.js is good at many things, but serving static files at scale is not one of them.

2. **Security:** You do not want to expose your Node.js app directly to the internet. Nginx sits in front of it as a protective layer. It can handle SSL/TLS termination, rate limiting, and request filtering.

3. **Port management:** Your Node app runs on port 3000 (or 5000, or 8080). But web browsers expect port 80 (HTTP) and 443 (HTTPS). Nginx listens on port 80/443 and forwards requests to your app's port. This is called a **reverse proxy**.

4. **Multiple apps:** You might want to run multiple apps on the same server. Nginx can route `app1.yourdomain.com` to port 3000 and `app2.yourdomain.com` to port 4000.

**The reverse proxy concept:**

```
Browser (port 80) --> Nginx --> Node.js app (port 3000)
Browser (port 443) --> Nginx (SSL) --> Node.js app (port 3000)
```

Without Nginx:
```
Browser --> Node.js app (port 3000)
User has to type: http://164.92.105.23:3000
Ugly. No SSL. No bueno.
```

With Nginx:
```
Browser --> Nginx (port 80/443) --> Node.js app (port 3000)
User types: https://yourdomain.com
Clean. Secure. Professional.
```

**0:25 - 0:30 | Nginx Configuration Structure**

Nginx configuration lives in `/etc/nginx/`. Here is the structure:

```
/etc/nginx/
  nginx.conf              # Main config file (usually do not touch this)
  sites-available/        # Config files for each site/app
    default               # The default site config
  sites-enabled/          # Symlinks to active configs in sites-available
    default -> ../sites-available/default
  conf.d/                 # Additional config snippets
```

**The workflow:**
1. Create a config file in `sites-available/`
2. Create a symlink to it in `sites-enabled/`
3. Test the config with `sudo nginx -t`
4. Reload Nginx with `sudo systemctl reload nginx`

**0:30 - 0:45 | PM2: The Process Manager Problem and Solution**

Right now, if you run a Node.js app on your server, it runs in a terminal session. If you:
- Close the SSH connection: the app dies
- The app crashes: it stays dead
- The server reboots: the app does not start

This is obviously unacceptable for a production application. You need a **process manager** that:
- Keeps the app running in the background (daemonized)
- Automatically restarts it if it crashes
- Starts it on server boot
- Gives you logs, monitoring, and cluster mode

PM2 is the industry standard for this in the Node.js world. It is free, battle-tested, and has a beautiful CLI.

**Q&A (remaining time in block)**

---

![](diagram:session-6-2/fig1-model)

### Follow the two connections

A reverse proxy accepts a client connection and makes a separate connection to an upstream service. The browser may speak HTTPS to Nginx while Nginx speaks HTTP over loopback to Node. A 502 response often means the proxy could not obtain a valid upstream response; it does not by itself identify whether the application crashed, the port is wrong, or a timeout occurred. Check each connection independently.

First request the application directly on the server's loopback address. Then request the public route through Nginx. If the first succeeds and the second fails, focus on proxy configuration and routing. If both fail, investigate the process before editing Nginx. This two-step method is more reliable than restarting every service and hoping the symptom disappears.

### Paths and headers carry meaning

A proxy can preserve or rewrite a request path depending on its location and proxy_pass configuration. Write an example mapping beside the configuration: incoming /api/quests should reach exactly the route your Express app exposes. Test a collection route, a nested route, and an unknown route. A trailing slash can change the mapping, so copy configuration with an understanding of its behavior rather than treating it as boilerplate.

Forward host and client-protocol information deliberately. The application may need to know that the original request used HTTPS even though its immediate connection is HTTP. Trust proxy settings must match your actual proxy topology; blindly trusting every forwarded header allows direct clients to spoof information when the application is publicly reachable. Keep the upstream private and document which proxy is trusted.

### Process management is an operational contract

A process manager can restart a crashed application, retain logs, and restore configured processes after reboot. It does not fix a crash loop. If a process repeatedly exits, inspect the error, environment, working directory, and dependency installation. A restart counter is evidence of instability, not proof that recovery works. Use a readiness check that exercises the application's ability to serve its core function.

Document how environment changes reach the running process. Editing a file does not necessarily change an already-running process's environment. Restart or reload according to the tool's documented behavior and verify the effective result without printing secret values. Keep one process definition with the entry point, working directory, and non-secret configuration names so the deployment does not depend on a remembered terminal session.

### Change configuration with a rollback path

Save the previous configuration, validate syntax, reload, and immediately run a smoke check. A reload is usually preferable to an unnecessary stop-start when the service supports it, but validation still matters. Keep the previous application revision available as well. A proxy rollback cannot repair an incompatible database migration, so deployment planning must consider the entire release.

For the lab, deliberately point a temporary test location at an unused loopback port and observe the resulting error. Restore the correct port and record the difference in logs. Do this only in the isolated exercise environment. The goal is to recognize the signature of an upstream failure, then prove you can restore service without making unrelated changes.

## The demonstration

**0:45 - 0:55 | Demo: Installing Nginx and Serving a Static Page**

SSH into your server:

```bash
ssh deploy@YOUR_DROPLET_IP
```

Install Nginx:

```bash
sudo apt update
sudo apt install -y nginx
```

Check that it is running:

```bash
sudo systemctl status nginx
```

You should see `active (running)`. Now open your browser and go to:

```
http://YOUR_DROPLET_IP
```

You should see the default Nginx welcome page. That page is being served from `/var/www/html/index.nginx-debian.html`.

Congratulations. You have a web server.

**0:55 - 1:10 | Demo: Serving a Custom Static Site**

Let's create a simple site and serve it with Nginx:

```bash
# Create a directory for our site
sudo mkdir -p /var/www/mysite

# Create an index.html
sudo nano /var/www/mysite/index.html
```

Paste this into the file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Cloud Server</title>
    <style>
        body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            color: #fff;
        }
        .container {
            text-align: center;
            padding: 2rem;
        }
        h1 { font-size: 3rem; margin-bottom: 0.5rem; }
        p { font-size: 1.2rem; color: #aaa; }
        .status { color: #00ff88; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>I Bought Land in the Cloud</h1>
        <p>And nobody can stop me.</p>
        <p class="status">Server Status: ALIVE</p>
    </div>
</body>
</html>
```

Save and exit.

Now create an Nginx config for this site:

```bash
sudo nano /etc/nginx/sites-available/mysite
```

```nginx
server {
    listen 80;
    listen [::]:80;

    root /var/www/mysite;
    index index.html;

    server_name YOUR_DROPLET_IP;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

Replace `YOUR_DROPLET_IP` with your actual IP address.

Enable the site:

```bash
# Remove the default site (optional but clean)
sudo rm /etc/nginx/sites-enabled/default

# Create symlink to enable our site
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/

# Test the config for syntax errors
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

Now visit `http://YOUR_DROPLET_IP` in your browser. You should see your custom page.

Let's look at the default config to understand the key parts:

```nginx
server {
    listen 80 default_server;          # Listen on port 80
    listen [::]:80 default_server;     # Also listen on IPv6 port 80

    root /var/www/html;                # Where to find static files
    index index.html index.htm;        # Default file to serve

    server_name _;                     # Respond to any domain name

    location / {
        try_files $uri $uri/ =404;     # Try to find the file, or return 404
    }
}
```

**1:10 - 1:25 | Demo: Configuring the Reverse Proxy**

Let's create a tiny Express app on the server to test our reverse proxy:

```bash
mkdir -p ~/test-app
cd ~/test-app
npm init -y
npm install express
```

Create the app:

```bash
nano ~/test-app/server.js
```

```javascript
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from Node.js behind Nginx!',
    server: 'My Cloud VPS',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Start it:

```bash
node ~/test-app/server.js
```

The app is running on port 3000. But you cannot access it from a browser because our firewall only allows ports 22, 80, and 443. And that is correct. We do NOT want to expose port 3000 to the world. We want Nginx to proxy traffic to it.

Leave this running (or open a second SSH session).

Update the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/mysite
```

Replace the entire contents with:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name YOUR_DROPLET_IP;

    # Serve static files from /var/www/mysite for the root path
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Let's break down each `proxy_set_header`:

- `proxy_pass http://localhost:3000;` - Forward requests to port 3000
- `proxy_http_version 1.1;` - Use HTTP/1.1 for the proxy connection
- `Upgrade` and `Connection 'upgrade'` - Support WebSocket connections
- `Host $host` - Pass the original Host header to Node.js
- `X-Real-IP $remote_addr` - Pass the real client IP (otherwise Node sees `127.0.0.1`)
- `X-Forwarded-For` - Standard header for proxied requests
- `X-Forwarded-Proto $scheme` - Tell Node.js if the request was HTTP or HTTPS
- `proxy_cache_bypass $http_upgrade` - Do not cache WebSocket connections

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Now visit `http://YOUR_DROPLET_IP` in your browser. You should see the JSON response from your Node.js app. The browser thinks it is talking to Nginx on port 80, but Nginx is secretly forwarding everything to your Node app on port 3000.

This is the reverse proxy in action.

**1:25 - 1:30 | Demo: Installing and Using PM2 (5 min transition)**

First, stop your running Node app (Ctrl+C if it is still running in a terminal).

Install PM2 globally:

```bash
sudo npm install -g pm2
```

Start your app with PM2:

```bash
cd ~/test-app
pm2 start server.js --name "test-app"
```

You will see a nice table showing your app is running. Here are the essential PM2 commands:

```bash
# List all running processes
pm2 list

# View logs (real-time)
pm2 logs

# View logs for a specific app
pm2 logs test-app

# Stop an app
pm2 stop test-app

# Restart an app
pm2 restart test-app

# Delete an app from PM2
pm2 delete test-app

# Monitor all processes (CPU, memory, etc.)
pm2 monit
```

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-6-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function diagnose({direct, proxied}) {
  if (!direct) return 'inspect upstream process';
  if (!proxied) return 'inspect proxy routing';
  return 'request path works';
}
check(diagnose({direct: false, proxied: false}) === 'inspect upstream process', 'Upstream first');
check(diagnose({direct: true, proxied: false}) === 'inspect proxy routing', 'Proxy boundary isolated');
console.log('ok: checkpoint-6-2');
```

## Where it breaks

![](diagram:session-6-2/fig2-diagnosis)

### 502 gateway error

The public URL returns 502 and Nginx's error log says `connect() failed` or `upstream prematurely closed`. Nginx did its job and could not get a response from the process behind it. Check that the app is running, that it is listening on the address and port in `proxy_pass`, and that it is not bound only to a socket you did not configure. A 502 is not a DNS problem and it is not an application 500. Read the upstream log next to the Nginx log. The two of them together tell you whether the process is down, crashing, or listening in the wrong place.

### Wrong path

`/api/quests` returns 404 from Express while `curl` against the app's own port returns the JSON. The proxy is rewriting the path. A `proxy_pass` with a trailing slash replaces the matched location. One without a trailing slash appends the full URI. Those are different routes to your app. Log `req.originalUrl` in Express and compare it to the URL you requested from outside. Fix the slash so the path Express sees is the path you wrote the router for.

### Lost process after reboot

The server reboots for a maintenance window and the site stays down until you SSH in and start Node by hand. The process was a shell session, and the shell is gone. A process manager is what turns "I started it" into "it starts on boot." Enable the unit or the startup hook, reboot a test machine on purpose, and confirm the site comes back without you. Until you have done that reboot, the setup is not finished. It is a process that happens to be running.

## Your turn

> **Exercise 1: Your First Cloud-Hosted Page**
>
> 1. SSH into your server
> 2. Create the `/var/www/mysite` directory
> 3. Create an `index.html` file with custom content (make it yours, change the text, add your name)
> 4. Create an Nginx config in `sites-available`
> 5. Enable it with a symlink in `sites-enabled`
> 6. Test with `sudo nginx -t` and reload
> 7. Visit your IP in a browser and confirm you see your page
>
> **Deliverable:** Screenshot of your custom page loaded in a browser via your server's IP address.

> **Exercise 2: Proxy It**
>
> 1. Create the test Express app in `~/test-app/`
> 2. Start it on port 3000
> 3. Update your Nginx config to proxy requests to `localhost:3000`
> 4. Test with `sudo nginx -t` and reload
> 5. Visit your IP in a browser, confirm you see the JSON response from Express
> 6. Visit `http://YOUR_DROPLET_IP/health` and confirm that route also works
>
> **Deliverable:** Screenshot showing the JSON response from your Express app loaded through Nginx.

---

## The quest

> **Exercise 3: PM2 Survival Test**
>
> 1. Start your test-app with PM2:
>    ```bash
>    cd ~/test-app
>    pm2 start server.js --name "test-app"
>    ```
>
> 2. Configure PM2 startup (so it survives reboots):
>    ```bash
>    pm2 save
>    pm2 startup
>    ```
>    PM2 will print a command that looks like this:
>    ```
>    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
>    ```
>    Copy and paste that exact command (it will be different for your system). This tells the system to start PM2 (and all saved processes) when the server boots.
>
> 3. Save the PM2 process list
>
> 4. Reboot the server with `sudo reboot`
>
> 5. Wait 30 seconds, SSH back in:
>    ```bash
>    ssh deploy@YOUR_DROPLET_IP
>    pm2 list
>    ```
>
> 6. Confirm your app is running after the reboot
>
> 7. Visit your IP in a browser and confirm the app responds
>
> 8. Create an ecosystem file for your test-app:
>    ```bash
>    nano ~/test-app/ecosystem.config.js
>    ```
>    ```javascript
>    module.exports = {
>      apps: [{
>        name: 'test-app',
>        script: 'server.js',
>        instances: 1,
>        autorestart: true,
>        watch: false,
>        max_memory_restart: '200M',
>        env: {
>          NODE_ENV: 'production',
>          PORT: 3000
>        }
>      }]
>    };
>    ```
>    Then switch to using it:
>    ```bash
>    cd ~/test-app
>    pm2 delete test-app
>    pm2 start ecosystem.config.js
>    pm2 save
>    ```
>
> **Deliverable:** Screenshot of `pm2 list` after a reboot showing your app running.

**Logs, when something fails:**

When things go wrong on the server (and they will), logs are your best friend:

```bash
# PM2 logs (your app's console.log output)
pm2 logs
pm2 logs test-app --lines 50

# Nginx access log (every request that hits your server)
sudo tail -f /var/log/nginx/access.log

# Nginx error log (when Nginx itself has problems)
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx --since "1 hour ago"
```

The most common issue: You update your code, restart PM2, but the site still shows the old version. Check:
1. Did you actually restart? `pm2 restart test-app`
2. Is Nginx caching? `sudo systemctl reload nginx`
3. Is your browser caching? Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

**Wrap-Up (Last 5 min of Practice block)**

What you accomplished today:
- Installed Nginx and served a static page
- Configured Nginx as a reverse proxy to route traffic to a Node.js app
- Installed PM2 and learned to manage Node.js processes
- Set up PM2 to survive reboots and crashes
- Learned where to find logs for debugging

The architecture you built:

```
Internet --> Your Droplet IP (port 80)
              --> Nginx (reverse proxy)
                --> Node.js app (port 3000, managed by PM2)
```

Next session: DNS and SSL. You are getting a real domain name and HTTPS.

---

### Review the artifact

Your deliverable is **An Nginx reverse proxy and process-management runbook**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-6-2/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Confirm SSH access to your VPS as the `deploy` user. Verify Node.js is installed by running `node --version` on the server. Review what a web server does (accepts HTTP requests, returns responses).
**Materials:** SSH terminal, web browser, server IP address from Session 6.1

---

**HW 6.2: Nginx and PM2 Mastery**

1. **Create an ecosystem file** for your test-app with the following settings:
   - `autorestart: true`
   - `max_memory_restart: '200M'`
   - `env.NODE_ENV: 'production'`

2. **Serve static files alongside your proxy.** Update your Nginx config to serve static files from `/var/www/mysite` at the path `/static/`:
   ```nginx
   location /static/ {
       alias /var/www/mysite/;
   }
   ```
   Confirm you can visit `http://YOUR_IP/static/` and see your HTML page, while `http://YOUR_IP/` still shows the Node.js app.

3. **Explore PM2 logs.** Run `pm2 logs test-app --lines 100` and examine the output. Add a `console.log` to your Express app that logs every incoming request with a timestamp. Restart the app with PM2 and make several requests. Screenshot the logs.

4. **Research task:** Read about Nginx location blocks. What is the difference between `location /`, `location /api/`, and `location ~ \.php$`? Write a paragraph explanation.

**Submission:** Push all screenshots and your paragraph to your homework repo.

---

### Manual verification and further reading

- [Official reference 1](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [Official reference 2](https://pm2.keymetrics.io/docs/usage/quick-start/)
