---
editorial: true
title: Opening the World Gate
subtitle: Deploy Your Full Stack App to the Internet
hook: "A reproducible full-stack deployment with smoke tests and rollback instructions. Create a reproducible release from a known revision."
read: 60
artifact: "A reproducible full-stack deployment with smoke tests and rollback instructions"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://nginx.org/en/docs/
  - https://www.mongodb.com/docs/manual/security/
say:
  - "Build: Create a reproducible release from a known revision."
  - "Deploy: Apply configuration and start the intended services."
  - "Verify: Exercise the public journey and preserve rollback."
---

## The hook

"This is it. The session where your MERN app goes live on the real internet. Not a test app. Not a placeholder HTML page. Your actual Project 2 from Unit 4, running on your server, behind Nginx, with a real domain and HTTPS. By the end of today, anyone in the world can visit your URL and use your application. You will clone the code, configure environment variables, build the frontend, set up PM2 for the backend, wire up Nginx to serve everything, and test it end to end. This is the final boss of Unit 6, and you are about to beat it."

---

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Deploy a Full Stack Application to Production

Deploy a complete MERN stack application to a VPS with database connectivity, environment variable management, Nginx routing, and end-to-end verification.

**Enabling Objectives:**

- Clone a project repository to the server and install all backend and frontend dependencies
- Create and secure a production .env file with database connection strings, JWT secrets, and application configuration
- Build a React frontend into static assets and configure Nginx to serve them while proxying API requests to Express
- Start the Express backend with PM2 using an ecosystem configuration file and verify database connectivity
- Execute end-to-end verification testing CRUD operations, authentication flows, HTTPS, and crash recovery

**You should be able to:**
- You will be able to deploy a full MERN stack application to a VPS with a custom domain, HTTPS, Nginx reverse proxy, PM2 process management, and verified end-to-end functionality.

---

**0:00 - 0:10 | Session Kickoff: The Deployment Plan**

This is it. The session where your MERN app goes live on the real internet. By the end of today, anyone in the world can visit your URL and use your application. Not localhost. Not a demo. The real thing.

Here is the deployment plan:

```
1. Set up the database (MongoDB Atlas or local MongoDB)
2. Clone and configure the backend
3. Build and deploy the frontend
4. Configure Nginx to serve both
5. Set up PM2 for the backend
6. Connect the domain and HTTPS
7. Test everything
8. Celebrate
```

**0:10 - 0:25 | MongoDB Options for Production**

**There are two approaches for MongoDB:**

**Option A: MongoDB Atlas (Recommended for this unit)**
- Cloud-hosted MongoDB (free tier available)
- No maintenance, automatic backups
- You already set this up in Unit 4
- Just use your existing connection string

**Option B: MongoDB on the VPS**
- Full control, data on your machine
- More setup work, you handle backups
- Uses RAM on your $6/mo droplet (tight squeeze with 1 GB)

We will primarily cover **Option A** (Atlas) because it is simpler, and you already used it in Unit 4. But here is how Option B works for reference:

```bash
# MANUAL PREREQUISITE: install MongoDB using the official instructions
# for your actual operating system and supported MongoDB release.
# Do not add a repository for a different distribution or release.
# After manual setup, verify the service and use a private connection:
sudo systemctl status mongod
mongosh --eval 'db.runCommand({ ping: 1 })'
```

Your connection string for local MongoDB is:
```
mongodb://localhost:27017/your-db-name
```

**Securing local MongoDB (important if using Option B):**

By default, MongoDB has no authentication. For a production server, you MUST add a user:

```bash
mongosh
```

```text
use admin
db.createUser({
  user: "appuser",
  pwd: "a-strong-password-here",
  roles: [{ role: "readWrite", db: "your-db-name" }]
})
exit
```

Then enable authentication in the MongoDB config:

```bash
sudo nano /etc/mongod.conf
```

Add under `security:`:

```yaml
security:
  authorization: enabled
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

Your connection string is now:
```
mongodb://appuser:a-strong-password-here@localhost:27017/your-db-name?authSource=admin
```

**0:25 - 0:35 | Environment Variables in Production**

Your app uses environment variables for secrets (database URLs, JWT secrets, API keys). You NEVER commit these to Git. On the server, you create a `.env` file.

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/your-db-name?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
# Add any other env vars your app needs
```

Generate a random JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Important security notes:**
- The `.env` file should be in `.gitignore` (it should already be from Unit 4)
- Set proper permissions: `chmod 600 .env` (only the owner can read/write)
- Never use the same secrets in development and production

**0:35 - 0:45 | Frontend Build Strategy**

Your React app needs to be built into static files before deployment. In development, you use `npm start` or `npm run dev` which starts a development server with hot reloading. In production, you build the React code into optimized static HTML, CSS, and JS files that Nginx serves directly.

**Before building, check your API URLs:**

In development, your React app probably calls the API at `http://localhost:3000/api/...`. In production, the API will be at `https://yourdomain.com/api/...`.

Option 1: Use relative URLs in your React code (recommended):
```javascript
// Instead of:
fetch('http://localhost:3000/api/users')

// Use:
fetch('/api/users')
```

This works because Nginx serves both the frontend and proxies the API, so relative URLs automatically go to the right place.

Option 2: Use an environment variable:
```javascript
const API_URL = process.env.REACT_APP_API_URL || '';
fetch(`${API_URL}/api/users`)
```

If you need to change API URLs, do it now before building.

---

![](diagram:session-6-4/fig1-model)

### Define a release as a set of inputs

A release is more than the latest files copied to a server. It includes a source revision, dependency lockfile, runtime version, build command, configuration names, and any data migration. Record those inputs so you can reproduce the same artifact. Installing whatever dependency versions happen to be current creates a different release even when your application code has not changed.

Separate secrets from the artifact. A frontend bundle is public, while the backend environment may contain private credentials. Verify that only intended public configuration enters the client build. Keep a redacted environment example in the repository and provide secret values through the deployment environment. A missing required variable should cause a clear startup failure rather than a partially working application.

### Deploy in an order that preserves compatibility

If a schema change is needed, prefer an additive transition that old and new application versions can both tolerate. Removing a field before the old process stops using it makes rollback difficult. For a beginner deployment, avoid destructive migrations and document any manual data operation separately. A code rollback is not a database restore, and conflating them can overwrite legitimate new records.

Build the frontend in a controlled environment and serve only its output directory. Ensure the server can read those files without making the entire home directory world-readable. Place deployment artifacts in a dedicated location with deliberate ownership and permissions. Broad recursive chmod commands may appear to fix a 403 while exposing unrelated files. Diagnose the exact path traversal or read permission that failed.

### Smoke tests should cross the real boundary

A health endpoint proves that one route responds. A release smoke test should also complete a representative user journey: open the public site, log in with a synthetic account, create a record, refresh, edit it, and remove the fixture. Check both the browser result and server logs. If email, payments, or AI are outside this unit, do not claim their behavior from the core smoke test.

Test a fresh browser session and a direct reload of a client-side route. The latter catches missing single-page application fallback configuration. Test an unknown API route too; it should not receive index.html. Review network requests for localhost addresses or mixed HTTP content. These errors often remain hidden when the developer only visits the homepage through an already-authenticated browser.

### Make rollback a rehearsed procedure

Keep the previous known-good release and write the exact steps to restore it. In a disposable environment, deploy a harmless visible marker, verify it, roll back, and verify the previous marker. This proves the release-selection mechanism without introducing a real incident. Record what happens to the process, static assets, and database during the rollback.

A deployment handoff should include the public URL, revision, service names, log locations, restart procedure, backup location, and unresolved limitations. Do not include passwords or tokens. If a manual prerequisite is pending, mark it clearly and preserve the command and expected output for the operator. An honest handoff lets another person operate the application without guessing which terminal session made it work.

## The demonstration

The frontend from Unit 4 uses Vite, whose default production output is client/dist. This deployment serves a dedicated /var/www/quest-client directory rather than granting Nginx access through the deployment account's home directory. After each frontend build, copy the new output into that directory using the scoped ownership and permission steps below, then smoke-test the public route. If your project customizes its output directory, use the actual configured path consistently. Keep the previous release for rollback; the simple copy procedure is a learning deployment, not an atomic release system.

**0:45 - 1:00 | Demo: Cloning and Configuring the Backend**

SSH into your server:

```bash
ssh deploy@YOUR_DROPLET_IP
```

Clone your MERN project:

```bash
cd /home/deploy
git clone https://github.com/YOUR_USERNAME/your-mern-project.git
cd your-mern-project
```

If your project is a monorepo (frontend and backend in one repo):
```
your-mern-project/
  client/        # React frontend
  server/        # Express backend
  package.json   # Root package.json (maybe)
```

If your project is in separate repos, clone both:
```bash
git clone https://github.com/YOUR_USERNAME/your-mern-backend.git
git clone https://github.com/YOUR_USERNAME/your-mern-frontend.git
```

Create and secure the `.env` file:

```bash
cd /home/deploy/your-mern-project/server  # Or wherever your backend is
nano .env
```

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/your-db-name?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
# Add any other env vars your app needs
```

Set permissions:
```bash
chmod 600 .env
```

If using MongoDB Atlas, make sure your VPS IP is whitelisted:
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Click "Network Access" in the left sidebar
4. Click "Add IP Address"
5. Enter your droplet's IP address (or click "Allow Access from Anywhere" for development)

Install dependencies and test:

```bash
cd /home/deploy/your-mern-project/server
npm install

# Try running the backend
node server.js
```

If everything is set up correctly, your backend should start and connect to MongoDB. You should see something like:
```
Server running on port 3000
Connected to MongoDB
```

Press Ctrl+C to stop it. We will use PM2 to run it properly in a moment.

**Common errors at this stage:**

1. **"Cannot find module 'xxx'"** - Run `npm install` again
2. **"MongoNetworkError"** - Your Atlas IP whitelist does not include your VPS IP, or your connection string is wrong
3. **"EADDRINUSE"** - Port 3000 is already in use. Kill the other process: `sudo lsof -i :3000` then `kill -9 PID`
4. **Missing environment variables** - Check your `.env` file has all required vars

**1:00 - 1:15 | Demo: Building the React Frontend**

```bash
cd /home/deploy/your-mern-project/client  # Or wherever your React app is
npm install
npm run build
```

This creates a `build/` (or `dist/`) directory with optimized static files:

```
build/
  index.html
  static/
    css/
      main.xxxxx.css
    js/
      main.xxxxx.js
  favicon.ico
  manifest.json
```

**1:15 - 1:30 | Demo: Full Nginx Configuration for MERN**

Now we configure Nginx to:
1. Serve the React frontend (static files) at the root path
2. Proxy API requests to the Express backend
3. Handle client-side routing (React Router)

```bash
sudo nano /etc/nginx/sites-available/mysite
```

Replace the entire contents with:

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    # React frontend - serve static build files
    root /var/www/quest-client;
    index index.html;

    # API requests - proxy to Express backend
    location /api/ {
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

    # React Router - serve index.html for all non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$host$request_uri;
}
```

**Key parts explained:**

- `root /var/www/quest-client;` - Nginx serves React's built files directly. No Node.js involved for the frontend.
- `location /api/ { proxy_pass ... }` - Any request starting with `/api/` gets forwarded to Express. Everything else is handled as a static file.
- `try_files $uri $uri/ /index.html;` - This is crucial for React Router. If someone visits `https://yourdomain.com/dashboard`, Nginx will not find a file called `dashboard`. The `try_files` directive says: "Try to find the file. If you cannot find it, serve `index.html` instead and let React Router handle the routing."

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**File permissions note:** Nginx runs as the `www-data` user and needs read access to the build directory. If you get 403 Forbidden errors:

```bash
# Make sure Nginx can read the files
# Run from the repository root after the Vite build; replace deploy if needed.
sudo install -d -o deploy -g www-data -m 0750 /var/www/quest-client
sudo cp -R client/dist/. /var/www/quest-client/
sudo chown -R deploy:www-data /var/www/quest-client
sudo chmod -R u=rwX,g=rX,o= /var/www/quest-client
```

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-6-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const release = {revision: 'abc123', build: true, smoke: false, rollback: true};
const ready = r => Boolean(r.revision && r.build && r.smoke && r.rollback);
check(!ready(release), 'Build alone does not prove deployment');
check(ready({...release, smoke: true}), 'Release evidence complete');
console.log('ok: checkpoint-6-4');
```

## Where it breaks

![](diagram:session-6-4/fig2-diagnosis)

### Works only locally

The app runs on your laptop and fails the moment it is deployed. The usual differences are boring and decisive: another Node version, `NODE_ENV=production` skipping the dev dependencies you imported, a build step you ran by hand and forgot in the start command, or an environment variable that exists in `.env` and not in the host. Compare `node -v`, the start command, and the env names. Log the fact that a variable is present, never its value. "Works on my machine" means the machine is part of the program. The deploy has to include that part.

### Database exposed

The database accepts connections from the public internet, and the only thing standing in front of it is a password. Bind it to a private address, or to the machine that runs the app, and restrict the security group so only that app can open the port. Confirm from a laptop that is not the server: the port should refuse you. A database GUI on your laptop can reach it through an SSH tunnel when you need to look. It does not need a public listener to do that.

### Rollback loses data

You roll the code back to yesterday's release, and the new release had already migrated the database. The old code cannot read the new shape, or the rollback script drops a column the new rows needed. Code and data move on different tracks. Before you migrate, know how the previous release behaves against the new schema, and take a backup you have restored once. Rolling back the process is a deploy. Rolling back the data is a restore. Decide which one you are doing before you run the command.

## Your turn

> **Exercise 1: Get Your Backend Running on the Server**
>
> 1. SSH into your server
> 2. Clone your MERN project from GitHub
> 3. Create a `.env` file with all required environment variables
> 4. Install dependencies with `npm install`
> 5. Test the backend with `node server.js` (or whatever your start command is)
> 6. Verify it connects to MongoDB successfully
> 7. Stop it with Ctrl+C
>
> **Deliverable:** Screenshot of your backend running successfully on the server (showing the console output with "Server running" and "Connected to MongoDB" or equivalent messages).

> **Exercise 2: Wire Up the Full Stack**
>
> 1. Build your React frontend: `npm run build`
> 2. Update your Nginx config to:
>    - Serve the React build at the root
>    - Proxy `/api/` requests to your Express backend
>    - Handle React Router with `try_files`
> 3. Fix any file permission issues
> 4. Test with `sudo nginx -t` and reload
> 5. Visit `https://yourdomain.com` and confirm the frontend loads
>
> **Deliverable:** Screenshot of your React frontend loading at your custom domain with HTTPS.

---

## The quest

> **Exercise 3: PM2, Final Testing, and the Grand Verification**
>
> **Part A: Start Backend with PM2**
>
> ```bash
> cd /home/deploy/your-mern-project/server
> ```
>
> Create an ecosystem file:
>
> ```bash
> nano ecosystem.config.js
> ```
>
> ```javascript
> module.exports = {
>   apps: [{
>     name: 'mern-backend',
>     script: 'server.js',
>     cwd: '/home/deploy/your-mern-project/server',
>     instances: 1,
>     autorestart: true,
>     watch: false,
>     max_memory_restart: '300M',
>     env: {
>       NODE_ENV: 'production',
>       PORT: 3000
>     }
>   }]
> };
> ```
>
> Note: The `.env` file will still be loaded by `dotenv` in your Express app (you are using `require('dotenv').config()`, right?). The `env` block in the ecosystem file is for additional overrides.
>
> ```bash
> # Delete the old test-app if it is still running
> pm2 delete test-app 2>/dev/null
>
> # Start your MERN backend
> pm2 start ecosystem.config.js
>
> # Check it is running
> pm2 list
>
> # Check logs for errors
> pm2 logs mern-backend --lines 20
>
> # Save and set up startup
> pm2 save
> pm2 startup
> # Copy and run the command it outputs
> ```
>
> **Part B: The Grand Verification**
>
> Complete ALL of the following checks and document each one:
>
> 1. Visit `https://yourdomain.com` and verify the frontend loads
> 2. Test the full CRUD flow (create, read, update, delete)
> 3. Test authentication (register, login, protected routes)
> 4. Run `pm2 list` and screenshot the process table
> 5. Run `pm2 restart mern-backend`, wait 3 seconds, refresh the browser. App still works?
> 6. Share the URL with a classmate and have them verify it works on their device
> 7. Test on your phone
> 8. Check [ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/) for your SSL grade
>
> **Deliverable:** A document (or series of screenshots) showing all 8 checks passing.

**Common Deployment Bugs (covered during Practice block):**

1. **Frontend loads but API calls fail (CORS errors):**
   Your Express app might have CORS configured for `localhost`. Update it:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
     credentials: true
   }));
   ```
   Or, since Nginx proxies the API, you might not need CORS at all (the browser sees everything on the same origin).

2. **"502 Bad Gateway":**
   Nginx cannot reach your backend. Check:
   - Is PM2 running? `pm2 list`
   - Is the backend on the right port? `pm2 logs mern-backend`
   - Is the proxy_pass URL correct in Nginx?

3. **"404 Not Found" on page refresh (React Router):**
   The `try_files $uri $uri/ /index.html;` directive is missing or misconfigured.

4. **Images or uploads not working:**
   If your app handles file uploads, make sure the upload directory exists and has write permissions:
   ```bash
   mkdir -p /home/deploy/your-mern-project/server/uploads
   chmod 755 /home/deploy/your-mern-project/server/uploads
   ```

**The Deployment Workflow Going Forward (covered during wrap-up):**

Now that your app is deployed, here is how you update it when you push new code:

```bash
# SSH into the server
ssh deploy@YOUR_DROPLET_IP

# Pull the latest code
cd /home/deploy/your-mern-project
git pull origin main

# If backend changed:
cd server
npm install            # In case dependencies changed
pm2 restart mern-backend

# If frontend changed:
cd ../client
npm install            # In case dependencies changed
npm run build          # Rebuild the static files

# If Nginx config changed:
sudo nginx -t
sudo systemctl reload nginx
```

You can also create a deployment script:

```bash
nano /home/deploy/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "Starting deployment..."

cd /home/deploy/your-mern-project
echo "Pulling latest code..."
git pull origin main

echo "Installing backend dependencies..."
cd server
npm install

echo "Restarting backend..."
pm2 restart mern-backend

echo "Installing frontend dependencies..."
cd ../client
npm install

echo "Building frontend..."
npm run build

echo "Deployment complete!"
echo "Visit https://yourdomain.com to verify."
```

Make it executable:

```bash
chmod +x /home/deploy/deploy.sh
```

Now you can deploy with a single command:

```bash
/home/deploy/deploy.sh
```

**Celebration and Wrap-Up (Last 5 min)**

Look at what you just did.

You took a MERN app that only ran on your laptop and deployed it to a real server in a real data center. You bought a domain name. You set up DNS. You configured Nginx as a reverse proxy. You got a free SSL certificate. You set up PM2 to keep everything alive. You tested it end to end.

Your app is LIVE on the internet. Right now. Anyone can use it.

In five units, you went from "what is a terminal" to "I deployed a full stack application to my own cloud server with a custom domain and HTTPS."

Take a moment to appreciate that. Screenshot your deployed app with the padlock icon. Share it in Discord. Text the URL to a friend. Show it to someone who does not code and watch their face when you say "I built that."

You are not a student. You are a deployer. You are a builder. You bought land in the cloud, and nobody can stop you.

---

### Review the artifact

Your deliverable is **A reproducible full-stack deployment with smoke tests and rollback instructions**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

### Unit project: completion contract

---

### The World Gate Deployment Quest: Ship Project 2 to the Internet

### Quest Arc

You have spent the entire unit learning the arts of cloud infrastructure. You claimed territory by spinning up a VPS. You installed a gatekeeper (Nginx) and bound a guardian spirit (PM2) to keep your application alive. You joined the teleportation network by purchasing a domain and weaving DNS records. You warded your gates with SSL encryption. Now it is time for the final trial: open the World Gate and let the entire internet see what you have built.

This is not a practice deployment. This is not a tutorial exercise. You are taking your actual MERN application from Unit 4, the one you built with your own hands, and shipping it to production. When you are done, you will have a real URL that anyone on the planet can visit. Your friends. Your family. Future employers. Future investors. The internet.

This is the quest that separates people who "know how to code" from people who "have shipped software." Complete it, and you earn the title of Deployer.

### Technical Requirements

**Must Have (Boss Clear Tier - Required for Passing)**

1. **VPS Setup**
   - A running VPS (DigitalOcean, Linode, Vultr, or equivalent)
   - Non-root user with sudo privileges
   - SSH key authentication (password auth disabled)
   - UFW firewall configured (ports 22, 80, 443 only)
   - Node.js installed

2. **Domain and DNS**
   - A purchased domain name pointing to the VPS
   - A record configured for the root domain (`@`)
   - CNAME or A record configured for `www`
   - DNS fully propagated (domain resolves to VPS IP)

3. **HTTPS/SSL**
   - Valid SSL certificate from Let's Encrypt
   - Certbot installed with automatic renewal configured
   - HTTP-to-HTTPS redirect working
   - SSL Labs grade of A or better

4. **Nginx Configuration**
   - Nginx installed and running
   - Serves React frontend static files
   - Proxies API requests to Express backend
   - Handles React Router with `try_files`
   - Both HTTP and HTTPS server blocks configured

5. **Backend Deployment**
   - Express backend running via PM2
   - Environment variables configured in `.env` (not committed to Git)
   - Connected to MongoDB (Atlas or local)
   - PM2 configured for auto-restart on crash
   - PM2 configured for startup on boot (`pm2 startup` and `pm2 save`)

6. **Frontend Deployment**
   - React app built with `npm run build`
   - Static files served by Nginx
   - API calls work in production (no localhost URLs)
   - No mixed content warnings

7. **Functionality**
   - Full CRUD operations work
   - Authentication works (register, login, protected routes)
   - Data persists across page refreshes and server restarts

**Nice to Have (Epic Loot and Legendary Tiers)**

- Custom deployment script (`deploy.sh`)
- Health check endpoint (`/api/health`)
- Custom Nginx access/error logs
- API subdomain (`api.yourdomain.com`)
- PM2 ecosystem file
- Monitoring dashboard (PM2 monit output)
- Deployment journal documenting all steps and issues

### Skill Points Rubric

### Boss Clear (70 pts) - Core Deployment

| Category | Points | Criteria |
|----------|--------|----------|
| Server Setup | 10 | VPS running, non-root user, SSH keys, firewall, Node.js |
| Domain and DNS | 10 | Domain purchased, A record + CNAME configured, resolves correctly |
| HTTPS/SSL | 10 | Valid cert, auto-renewal, HTTP-to-HTTPS redirect, A grade on SSL Labs |
| Nginx Configuration | 15 | Serves frontend, proxies API, handles React Router, clean config |
| Backend Deployment | 10 | PM2 running, env vars configured, MongoDB connected, survives reboot |
| Frontend Deployment | 8 | Built and served, no mixed content, API calls work |
| End-to-End Functionality | 7 | CRUD works, auth works, data persists |

### Epic Loot (20 pts) - Production Polish

| Category | Points | Criteria |
|----------|--------|----------|
| Deployment Script | 5 | Working `deploy.sh` that pulls, installs, builds, and restarts |
| Health Check Endpoint | 5 | `/api/health` returns status, environment, uptime, timestamp |
| Custom Nginx Logs | 3 | Separate access and error logs for your domain |
| PM2 Ecosystem File | 2 | Proper ecosystem.config.js with production env settings |
| Server Monitoring | 5 | Screenshots of 24-hour uptime, disk, memory, PM2 status |

### Legendary (10 pts) - Above and Beyond

| Category | Points | Criteria |
|----------|--------|----------|
| API Subdomain | 5 | `api.yourdomain.com` with separate Nginx config and SSL |
| Deployment Journal | 5 | Detailed documentation of every step, error, and fix |

**Total Possible: 100 points**

### Submission

Submit the following:

1. **The URL of your deployed app** (e.g., `https://mycoolapp.com`)
   - This is the most important submission item. We will visit it and test it.

2. **GitHub repository link** with all code (make sure it is public or share access)

3. **Screenshots document** containing:
   - The app running in a browser at your domain with the HTTPS padlock
   - `pm2 list` output on the server
   - `sudo ufw status verbose` output
   - SSL Labs test result (grade A or better)
   - Output of `curl https://yourdomain.com/api/health` (if implemented)

4. **Nginx config file** (`/etc/nginx/sites-available/mysite` or equivalent)
   - Copy the contents and include in your submission

5. **Deployment journal** (optional for Boss Clear, required for Legendary)
   - Document every step, every error, and how you fixed it

**How to Submit:**

1. Create a new directory in your homework repo: `unit6-deployment/`
2. Add your screenshots, Nginx config copy, and deployment journal
3. Include a `README.md` with:
   - Your deployed URL
   - Your GitHub repo link
   - Any notes about your deployment
4. Push to your homework repo
5. Post your live URL in the Discord `#deployments` channel

**Due Date:** This project is due at the end of Unit 6. You have one full week after Session 6.4 to polish and submit.

---

![](diagram:session-6-4/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Confirm your VPS has Nginx running with your domain and SSL certificate. Test your MERN app locally to make sure it works on localhost. Push all latest code to GitHub. Have your MongoDB Atlas connection string ready (or your local MongoDB credentials if using Option B from Session 6.1).
**Materials:** SSH terminal, web browser, GitHub repository, MongoDB Atlas dashboard, MERN project code

---

**HW 6.4: Deployment Polish**

1. **Create the deployment script** (`deploy.sh`) as shown in the demo. Test it by making a small code change, pushing to GitHub, and running the script.

2. **Set up Nginx logging.** Add a custom access log to your Nginx config:
   ```nginx
   access_log /var/log/nginx/yourdomain-access.log;
   error_log /var/log/nginx/yourdomain-error.log;
   ```
   Make a few requests and view the logs with `sudo tail -f /var/log/nginx/yourdomain-access.log`.

3. **Add a health check endpoint** to your Express backend (if you do not have one):
   ```javascript
   app.get('/api/health', (req, res) => {
     res.json({
       status: 'ok',
       environment: process.env.NODE_ENV,
       uptime: process.uptime(),
       timestamp: new Date().toISOString()
     });
   });
   ```
   Deploy it and verify it works at `https://yourdomain.com/api/health`.

4. **Monitor your server.** Leave your server running for 24 hours. Then check:
   ```bash
   pm2 list               # Is the app still running?
   pm2 logs --lines 50    # Any errors in the last 24 hours?
   df -h                  # Disk space okay?
   free -m                # Memory okay?
   uptime                 # How long has the server been up?
   ```
   Screenshot the output.

5. **Set up external uptime monitoring.** Your health check endpoint is only useful if something watches it. Sign up for a free uptime monitor (UptimeRobot, Better Stack, and similar services have free tiers), point it at `https://yourdomain.com/api/health`, and configure an email alert if the site goes down. Internal monitoring (`pm2 list`) tells you what your server thinks; external monitoring tells you what the world sees. You need both — if your entire VPS goes offline, PM2 cannot send the distress signal.

6. **Prevent log bloat.** PM2 logs grow forever by default, and a full disk will take down your app in the strangest ways. Install the log rotation module once and forget about it:
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M      # Rotate when a log hits 10MB
   pm2 set pm2-logrotate:retain 7          # Keep 7 rotated files
   ```

7. **Write a deployment journal.** Document every step you took to deploy your app, including any errors you hit and how you solved them. This will be invaluable when you deploy future projects.

**Submission:** Push the deployment script, health check code, monitoring screenshots, and deployment journal to your homework repo.

---

**Side Quest (Optional): What About Docker?**

You will hear the word "Docker" constantly, so here is the honest founder's briefing:

- **What it is:** Docker packages your app plus its entire environment (Node version, system libraries, config) into a **container** — a sealed, portable box that runs identically on your laptop, your VPS, and any cloud. The famous "works on my machine" problem dies because you ship the machine.
- **The core ideas:** a `Dockerfile` is the recipe ("start from Node 24, copy my code, run npm install, start the server"), an **image** is the baked result, and a **container** is a running instance of that image. `docker compose` runs multi-container setups (your app + MongoDB) with one command.
- **When you actually need it:** teams with many services, apps that must run on many environments, or platforms that only accept containers. Kubernetes, microservices, most CI systems — all built on containers.
- **When you do not:** a single MERN app on a single VPS, which is exactly what you have. PM2 plus Nginx is simpler to operate and easier to debug at your stage. Do not add Docker because it sounds professional; add it when the pain it solves shows up.
- **Try it in 10 minutes someday:** install Docker, run `docker run -d -p 27017:27017 mongo`, and you have a disposable MongoDB with zero installation. Throwaway databases for testing are the gateway drug.

We flag this now because job postings and dev conversations assume you know what a container is. Now you do. Deeper container work is a post-program quest.

---

### Manual verification and further reading

- [Official reference 1](https://nginx.org/en/docs/)
- [Official reference 2](https://www.mongodb.com/docs/manual/security/)
