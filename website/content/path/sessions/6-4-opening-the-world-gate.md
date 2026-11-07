---
editorial: true
title: Opening the World Gate
subtitle: Deploy Your Full Stack App to the Internet
hook: "The server has a name, a lock, and a placeholder page. Today the guild hall moves in: a cloud database, a .env Node reads on the server, hall-api under pm2 on 4100, the Vite build behind Nginx, and a deploy script you can run again."
read: 70
artifact: "The guild hall live at https://YOUR-DOMAIN: hall-api under pm2 reading .env on port 4100, a MongoDB Atlas cluster, the hall-client build served by Nginx with /api/ proxied, a deploy.sh, and docs/release.md with smoke tests and rollback steps"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.mongodb.com/docs/atlas/getting-started/
  - https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/
  - https://nodejs.org/api/cli.html#--env-fileconfig
  - https://vite.dev/guide/env-and-mode
  - https://pm2.keymetrics.io/docs/usage/application-declaration/
  - https://docs.railway.com/quick-start
say:
  - "The four variable names from 4.14 plus NODE_ENV, in a file only the owner can read, loaded by Node itself."
  - "Behind Nginx the page and the API are one origin; the empty API base is the production setting."
  - "A code rollback is a redeploy; a data rollback is a restore. Decide which before you type."
---

## The hook

Three sessions of groundwork and the public page still says "under construction." The test app behind `/api/` has never heard of Bran or Sera. Today that changes in one sitting. The hall needs a database, and the droplet has none, because Unit 4 ran MongoDB on your laptop. The hall needs its five environment variables, and the server has no `.env`. The client needs to stop asking `localhost:4100`, because on a phone `localhost` is the phone. Each of those is a short change, and they only work together, so this session does them in order and checks each one before the next.

By the end of the session `https://YOUR-DOMAIN` shows the hall's login, a letter from Bran reaches Sera's inbox from a phone on mobile data, `pm2 list` shows `hall-api` online on 4100, `curl https://YOUR-DOMAIN/api/items` without a token answers 401 from Express through Nginx over TLS, and `./deploy.sh` pulls, builds, restarts, and smoke-tests the whole thing in one command. You will also have rolled the page back once, watched the letters survive it, and written down why. The last H3 of the demonstration shows the same two repos on Railway, where the owner's example hall lives, for the day you want the machine hidden.

> *The gate opens. Travelers you have never met walk through it and find the hall exactly as you built it, because you carried every stone across yourself.*

## The idea

A release is a set of inputs, not a folder you copied. The inputs are a source revision, a lockfile, a Node version, a build command, the names of the configuration the process reads, and the data the code expects to find. Change any one and you have a different release. Today you make every input explicit: the revision is a commit on `main` of each repo, the lockfile is `package-lock.json`, Node is the 24 from 6-1, the build is `npm run build` in `hall-client`, the configuration is five names in `.env`, and the data lives in a cluster you create in this session. The figure calls the three stages build, deploy, verify.

![](diagram:session-6-4/fig1-model)

### The database the droplet does not have

Unit 4 installed MongoDB Community Server on your laptop and the hall connected to `mongodb://127.0.0.1:27017/guildhall`. That address on the droplet means "this droplet," where nothing listens on 27017. Two honest options. Run MongoDB on the droplet itself, bound to loopback, which keeps the data on your machine and costs you a chunk of its 1 GB of memory. Or use MongoDB Atlas, the hosted service, whose free tier is enough for the hall and asks for nothing from the droplet except an outbound connection. This session takes Atlas as the one complete path and gives the droplet install as an aside, because a managed database with its own firewall and its own users is the right first database to run in public. One limit is visible at the point of choice. The free tier takes no scheduled backups. You take your own with `mongodump`, and 12-3 practises exactly that.

Atlas has three nouns, and the buttons move around them. A cluster is the server; you create a free one, called M0, in the region nearest your droplet. A database user is the account the hall logs in with; you create one named `hall` with a generated password and read-write access. The network access list is the firewall; you add your droplet's public IP and nothing else. "Allow access from anywhere" is a checkbox that exists for development on a laptop whose address changes, and it is the exact failure the diagnosis below calls Database exposed. If you rebuild the droplet, the IP changes and the list needs the new one; write that in the release notes.

The connection string Atlas shows under Connect, Drivers looks like `mongodb+srv://hall:<password>@cluster0.ab1cd.mongodb.net/?retryWrites=true&w=majority`. You replace `<password>` with the real one and insert the database name before the `?`: `/guildhall?`. The `+srv` form looks up the cluster's hosts through DNS, which is the same system you learned last session doing one more job. The string is a secret, because the password is in it. It goes in `.env` and nowhere else.

### The same five names, read by Node, owned by one user

The hall reads `MONGODB_URI`, `JWT_SECRET`, `PAGE_ORIGIN`, `PORT`, and the guard in `server.js` throws `JWT_SECRET is required` when the secret is missing. On your laptop those came from `.env` through `node --env-file=.env server.js`. On the server they come from the same kind of file, the same flag, and no library: there is no dotenv package anywhere in this path, and you should not add one now. The only new thing is who may read the file. `chmod 600 .env` makes it readable by `deploy` alone, so another account on the machine, or a stray web process, cannot cat it.

pm2 does not read `.env` either. It starts Node, and Node reads the file if you pass the flag. The ecosystem file has a field for exactly that, `node_args: '--env-file=.env'`, with `cwd` set to the repo so the relative path resolves. Without it, pm2 starts the process, the guard throws, pm2 restarts it, the guard throws again, and `pm2 list` shows a restart count climbing into the hundreds while the status flickers. That loop is the signature of a missing variable under a process manager, and it is the first thing to check when `pm2 logs` shows the same error repeating.

`PAGE_ORIGIN` on the server is `https://YOUR-DOMAIN`. Behind Nginx the page and the API share that origin, so the browser never sends a cross-origin request and the `cors` middleware from 4-11 never has to say yes. Setting the variable anyway costs nothing and makes the API honest if you ever put the page on a different host, which the Railway section does. A `PORT` of `4100` keeps the number the hall has always used; Nginx will be told to proxy to it.

### The one line in the client

`hall-client` asks for `http://localhost:4100` because the slate did, in a constant named `apiBase`, and that was correct with two dev servers on one laptop. In production the page is served from `https://YOUR-DOMAIN` and the API is at `https://YOUR-DOMAIN/api/`, the same origin, so the base should be empty and every fetch should start with `/api/`. The way to have both without editing the file per machine is Vite's build-time environment. `import.meta.env.VITE_API_URL` is replaced during `npm run build` with the value from the mode's env file; in development Vite reads `.env.development`, in a production build it reads `.env.production`, and a variable that exists in neither is `undefined`.

So the line becomes `const apiBase = import.meta.env.VITE_API_URL || '';` and `.env.development` holds `VITE_API_URL=http://localhost:4100`. That file is committed; it is not a secret, and anything prefixed `VITE_` ends up in the bundle anyway, which is why the JWT secret must never be given a `VITE_` name. On the server, `npm run build` runs with no `VITE_API_URL`, the base is the empty string, and the bundle fetches `/api/inbox` from its own origin. The checkpoint below models that resolution. Vite's output is `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css`, and `dist/vite.svg`; the hashes change every build, which is why the copy step uses `--delete`.

### Nginx: one origin, two kinds of request

The site file from 6-3 already has the shape. `root /var/www/hall-client` serves the build. `location /api/` proxies to `127.0.0.1:4100` now, instead of the test app's 3000. The one change in the static block is `try_files $uri $uri/ /index.html;`: a request for a path that is not a file gets `index.html`, so a direct reload of the page, or a bookmark, loads the app instead of a 404. The hall is a single screen without a router, so today that line only matters for the reload. Do not let it swallow the API: an unknown `/api/` path matches the proxy block first and reaches Express, whose answer is its own 404, never `index.html`. Test both.

### Verify across the real boundary, and know which rollback you mean

A health check proves a route answers. A smoke test proves the journey: open the public page in a browser that has never seen it, register, log in, send a letter, read it from the recipient's account, reload, spend from the pack. Do it from a phone on mobile data so a different network, resolver, and certificate store are in the loop. Then `pm2 restart hall-api` and do one of those again; a restart that loses the ability to log in means the secret changed between runs.

Rollback has two meanings and the figure separates them. Rolling the code back is a redeploy of an older revision, and `deploy.sh` makes it cheap by keeping the previous build beside the live one. Rolling the data back is a restore from a backup, and nothing in this session takes one automatically; Atlas's free tier does not include scheduled backups, and `mongodump` is the manual tool. A code rollback does not un-send Bran's letter. If a release changed the shape of the documents, the old code may not read the new rows. Decide which rollback you are doing before you type, and write both procedures down while the system is calm.

## The demonstration

Laptop first, then Atlas in a browser, then the server. Two SSH sessions as before, Terminal A and Terminal B. The example values use `203.0.113.10`, `YOUR-DOMAIN`, and `YOUR_GITHUB_USER`. Where you are at the start of today:

```text
laptop      ~/projects/hall-api and ~/projects/hall-client · nothing running · local hall-api on 4100 runs only while you test the client
server A    ssh deploy@YOUR_DROPLET_IP · /home/deploy/hall-api and hall-client cloned, no .env · Nginx on 80 and 443 · test-app on 3000 under pm2
server B    second ssh session, same user · used for curl against 127.0.0.1:4100
browser     Atlas dashboard · https://YOUR-DOMAIN still shows the heading
```

On the laptop, in `~/projects/hall-client`, the one line and its env file:

```diff
-const apiBase = 'http://localhost:4100';
+const apiBase = import.meta.env.VITE_API_URL || '';
```

```dotenv
VITE_API_URL=http://localhost:4100
```

Save the second as `.env.development`. Run `npm run dev` and confirm the hall still logs in against your local `hall-api`; the base is read from the file now, and the network panel still shows requests to `localhost:4100`. Then build once locally to see the shape:

```bash
# laptop, in ~/projects/hall-client
npm run build
ls dist dist/assets
```

```text
dist:
assets  index.html  vite.svg

dist/assets:
index-B7xk2P9q.css  index-Dq3m8cVZ.js
```

Commit and push: `git add -A && git commit -m "Read the API base from VITE_API_URL" && git push`. In `~/projects/hall-api`, add a start script to `package.json` so a platform that runs `npm start` can find the entry; the VPS path does not need it today, the Railway path does:

```json
{
  "scripts": {
    "dev": "node --env-file=.env server.js",
    "start": "node --env-file-if-exists=.env server.js"
  }
}
```

`--env-file-if-exists` is Node's own flag for a file that may be absent; it reads `.env` on your laptop and on the droplet and ignores the missing file on a platform that injects variables directly. Commit and push.

Atlas, in a browser. Create an account at the Atlas page in the docs list, then: create a cluster, choose the free M0 tier and the region nearest your droplet, and give it a minute. Under Database Access, add a user `hall`, let Atlas generate the password, copy it somewhere temporary, role read and write to any database. Under Network Access, add `203.0.113.10/32`, your droplet, with a comment. Under Connect, Drivers, copy the string. Assemble the final value with the password and the database name:

```text
mongodb+srv://hall:THE_GENERATED_PASSWORD@cluster0.ab1cd.mongodb.net/guildhall?retryWrites=true&w=majority
```

If the password contains characters such as `@` or `:`, regenerate it until it does not, or URL-encode it; a raw `@` in the password ends the credential early and the error says the host is unknown.

Terminal A, on the server:

```bash
# server, Terminal A
cd ~/hall-api
git pull --ff-only
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
nano .env
```

```dotenv
MONGODB_URI=mongodb+srv://hall:THE_GENERATED_PASSWORD@cluster0.ab1cd.mongodb.net/guildhall?retryWrites=true&w=majority
JWT_SECRET=paste-the-96-hex-characters-node-just-printed
PAGE_ORIGIN=https://YOUR-DOMAIN
PORT=4100
NODE_ENV=production
```

```bash
# server, Terminal A
chmod 600 .env
ls -l .env
node --env-file=.env server.js
```

```text
-rw------- 1 deploy deploy 263 Nov 21 15:10 .env
listening on 4100
```

`listening on 4100` with no `MongooseServerSelectionError` in the seconds after it is the first proof. A connection failure to Atlas does not stop the listen line; it arrives as a stack trace a few seconds later, and its usual cause is the network access list. Terminal B, prove the database by writing to it:

```bash
# server, Terminal B
curl -i -H 'Content-Type: application/json' \
  -d '{"name":"Bran","email":"bran@example.com","password":"a-long-passphrase"}' \
  http://127.0.0.1:4100/api/register
```

```text
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{"name":"Bran","email":"bran@example.com"}
```

A 201 means the document is in Atlas. Open the cluster's Collections tab if you like and see `guildhall.users` with one row. Ctrl-C the server in Terminal A. Now the process manager, in that same terminal:

```bash
# server, Terminal A
nano ~/hall-api/ecosystem.config.js
```

```js
module.exports = {
  apps: [{
    name: 'hall-api',
    script: 'server.js',
    cwd: '/home/deploy/hall-api',
    node_args: '--env-file=.env',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '300M'
  }]
};
```

```bash
# server, Terminal A
cd ~/hall-api
pm2 delete test-app
pm2 start ecosystem.config.js
pm2 save
pm2 logs hall-api --lines 3 --nostream
```

```text
[PM2] Applying action deleteProcessId on app [test-app](ids: [ 0 ])
[PM2] [test-app](0) ✓
┌────┬────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┐
│ id │ name       │ mode    │ ↺       │ status   │ cpu    │ mem  │ user      │
├────┼────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┤
│ 1  │ hall-api   │ fork    │ 0       │ online   │ 0%     │ 71mb │ deploy    │
└────┴────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┘
[PM2] Saving the process list to /home/deploy/.pm2/dump.pm2
1|hall-api | listening on 4100
```

Read the restart column: `0`. If it is climbing, the env file was not read; the Works only locally diagnosis has the fix. The test app is gone and its port with it. The startup unit from 6-2 is still installed, so the saved list is what survives the next reboot.

Commit the ecosystem file to the repo from the laptop later, or now from the server with `git add ecosystem.config.js && git commit -m "pm2 process definition" && git push` if you configured git's identity here. `.env` stays uncommitted; `git status` must never list it.

The client, in Terminal A:

```bash
# server, Terminal A
cd ~/hall-client
git pull --ff-only
npm install
npm run build
sudo install -d -o deploy -g www-data -m 0750 /var/www/hall-client.prev
rsync -a --delete /var/www/hall-client/ /var/www/hall-client.prev/
rsync -a --delete dist/ /var/www/hall-client/
chmod -R u=rwX,g=rX,o= /var/www/hall-client
ls /var/www/hall-client
```

```text
vite v7.1.4 building for production...
✓ 34 modules transformed.
dist/index.html                   0.46 kB │ gzip:  0.30 kB
dist/assets/index-B7xk2P9q.css    1.21 kB │ gzip:  0.62 kB
dist/assets/index-Dq3m8cVZ.js   188.73 kB │ gzip: 59.40 kB
✓ built in 1.92s
assets  index.html  vite.svg
```

No `sudo` on the copy, because 6-2 made `deploy` the owner of `/var/www/hall-client`. The `.prev` directory is created once and receives a copy of whatever was live before each release; that is the rollback target. If the build is killed on a 1 GB droplet, the alternative is to run `npm run build` on the laptop and `rsync -a --delete dist/ deploy@203.0.113.10:/var/www/hall-client/` from there; the result is the same directory.

Nginx, still in Terminal A, with `sudo nano /etc/nginx/sites-available/hall`. Two edits in the first block: the proxy port and the fallback:

```nginx
    location /api/ {
        proxy_pass http://127.0.0.1:4100;
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
        try_files $uri $uri/ /index.html;
    }
```

```bash
# server, Terminal A
sudo nginx -t && sudo systemctl reload nginx
```

The `listen 443 ssl` lines and the redirect block that certbot wrote stay exactly as they are. Now, from the laptop, the three curls that separate the layers:

```bash
# laptop
curl -sI https://YOUR-DOMAIN | head -n 3
curl -i https://YOUR-DOMAIN/api/items
curl -i https://YOUR-DOMAIN/api/nope
```

```text
HTTP/2 200
server: nginx/1.24.0 (Ubuntu)
content-type: text/html

HTTP/2 401
content-type: application/json; charset=utf-8
{"error":"missing token"}

HTTP/2 404
```

The first is the build, served by Nginx. The second is Express refusing an unauthenticated request, through the proxy, over TLS, with the JSON error shape from 4-11; the message text is whatever your `requireUser` says. The third proves the proxy block beats the fallback: an unknown API path gets Express's 404, not the page. If the third returns `200` and HTML, `/api/` is not reaching the proxy block.

The journey, in a browser on the laptop first. `https://YOUR-DOMAIN` shows the hall's login. Register Sera through the form or with the curl from earlier against `https://YOUR-DOMAIN/api/register`. Seed the catalog once with any token, the way 4-14 did, from the laptop:

```bash
# laptop
TOKEN=$(curl -s -H 'Content-Type: application/json' \
  -d '{"email":"bran@example.com","password":"a-long-passphrase"}' \
  https://YOUR-DOMAIN/api/login | sed 's/.*"token":"\([^"]*\)".*/\1/')
curl -s -X POST -H "Authorization: Bearer $TOKEN" https://YOUR-DOMAIN/api/items/seed
```

Three items come back with a 201. Log in as Bran in the browser, send Sera a letter, log out, log in as Sera, read it. Reload the tab on the inbox: the page comes back, because of `try_files`, and the inbox reloads, because the token is in `sessionStorage`. Give Bran two lamp oils, spend one, try to spend fifty and watch the 409 leave the number alone. Then the phone, Wi-Fi off: the same URL, the same login, the same letter. That is the public journey the figure asks for. `pm2 restart hall-api`, refresh, send one more letter. Still signed, same secret.

The script that does the next release. On the laptop, in `~/projects/hall-api`:

```bash
#!/usr/bin/env bash
set -euo pipefail

API=/home/deploy/hall-api
CLIENT=/home/deploy/hall-client
WEB=/var/www/hall-client
SITE=https://YOUR-DOMAIN

echo "== api"
cd "$API"
git pull --ff-only origin main
npm ci --omit=dev
pm2 restart hall-api --update-env

echo "== client"
cd "$CLIENT"
git pull --ff-only origin main
npm ci
npm run build
rsync -a --delete "$WEB/" "$WEB.prev/"
rsync -a --delete dist/ "$WEB/"
chmod -R u=rwX,g=rX,o= "$WEB"

echo "== smoke"
curl -fsS -o /dev/null -w "page %{http_code}\n" "$SITE/"
curl -sS -o /dev/null -w "api %{http_code}\n" "$SITE/api/items"
echo "api revision $(git -C "$API" rev-parse --short HEAD)"
echo "client revision $(git -C "$CLIENT" rev-parse --short HEAD)"
```

Save it as `deploy.sh`, `chmod +x deploy.sh`, commit, push. The file is written on the laptop and runs on the server. In Terminal A, `cd ~/hall-api && git pull --ff-only && ./deploy.sh`. The last four lines are `page 200`, `api 401`, and two short hashes. Those hashes are the release. Write them in `docs/release.md` with the date. `npm ci` installs exactly the lockfile, which is the reproducibility the idea section promised; `--omit=dev` keeps test tooling off the server once Unit 7 adds it.

The rollback drill, so it is rehearsed and not imagined. Change the hall's heading on the laptop, commit, push, run `./deploy.sh`, and see the new heading at the name. Now put the previous build back, in Terminal A:

```bash
# server, Terminal A
rsync -a --delete /var/www/hall-client.prev/ /var/www/hall-client/
```

Reload: the old heading. Log in as Sera: the letters are all there, including the one you sent after the heading changed. The page went back; the data did not, because the page and the data are different things. Run `./deploy.sh` again to return to the new heading. For the API, a code rollback is `git checkout <previous hash>` in `~/hall-api` followed by `npm ci --omit=dev && pm2 restart hall-api`, and the same sentence applies to the documents in Atlas.

### If you would rather run MongoDB on the droplet

The commands are real and they fit on one screen; the cost is memory and the responsibility for backups. On the server, following the Ubuntu install page in the docs list for the current major version, with 8.0 shown here:

```bash
# server, Terminal A
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod
grep bindIp /etc/mongod.conf
```

`bindIp: 127.0.0.1` is the shipped default; leave it. The daemon listens only on loopback, UFW never sees it, and `MONGODB_URI=mongodb://127.0.0.1:27017/guildhall` in `.env` is the laptop string again. Add a database user and `authorization: enabled` in `mongod.conf` before you trust it with real accounts; the Atlas path gave you both for free. Never run a container with `-p 27017:27017` on this machine: Docker publishes ports ahead of UFW, and that single flag puts an unauthenticated database on the public internet. On a laptop it is harmless; on a server it is the exposed database the diagnosis below describes.

### The same app on Railway

The reference hall at [guild-hall-production.up.railway.app](https://guild-hall-production.up.railway.app/) is not on a droplet. It runs on Railway, where the machine, Nginx, pm2, and certbot are the platform's problem and yours is the code and its variables. If the VPS was the lesson and not the destination, this is the path you keep. Install the CLI with `npm install -g @railway/cli`, then, on the laptop:

```bash
# laptop
railway login
cd ~/projects/hall-api
railway init
railway add --database mongo
railway up
railway variable set 'MONGODB_URI=${{MongoDB.MONGO_URL}}/guildhall'
railway variable set JWT_SECRET=paste-a-fresh-96-hex-secret
railway domain
```

`railway init` creates a project and links the folder. `railway add --database mongo` provisions a MongoDB service that publishes a `MONGO_URL` variable; the `${{MongoDB.MONGO_URL}}` form is a reference, so the API gets the real string without you ever pasting a password. `railway up` builds from the folder, runs `npm start`, which is why the `start` script exists, and injects `PORT`. `railway domain` generates a public `*.up.railway.app` name with TLS already in front of it. Set `PAGE_ORIGIN` after the client exists.

The client is a second service in the same project: `cd ~/projects/hall-client`, `railway link` to the project, `railway add --service hall-client`, `railway variable set VITE_API_URL=https://THE-API-DOMAIN.up.railway.app`, and `railway up`. Railway's builder runs `npm run build`; if the deploy log says it could not find a start command, `npm install serve` and set the start command to `npx serve -s dist -l $PORT`. Then `railway domain` for the client, and back in `hall-api`, `railway variable set PAGE_ORIGIN=https://THE-CLIENT-DOMAIN.up.railway.app`. On Railway the page and the API are different origins, so this time the `cors` middleware from 4-11 is doing real work, and a wrong `PAGE_ORIGIN` is a blocked preflight in the browser console. The reference hall avoids that by serving its built client from Express as static files in one service; both layouts are fine, and `railway logs` is where `listening on` appears. The variable names are the same five. The release is still a revision, a lockfile, and a set of names; only the machine moved out of view.

A small model you can run here. It does not build, connect, or deploy. It models how the API base resolves in each mode, what counts as release evidence, and the difference between rolling code back and rolling data back. It proves you can say those rules. The phone on mobile data and the `deploy.sh` output prove your hall.

```js run=checkpoint-6-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

function apiBase(env) {
  return env.VITE_API_URL || '';
}
function requestUrl(env, path) {
  return apiBase(env) + path;
}
check(requestUrl({ VITE_API_URL: 'http://localhost:4100' }, '/api/inbox') === 'http://localhost:4100/api/inbox', 'the development build asks the laptop API');
check(requestUrl({}, '/api/inbox') === '/api/inbox', 'the production build asks its own origin');

function route(path) {
  if (path.indexOf('/api/') === 0) return 'proxy';
  return 'static';
}
check(route('/api/nope') === 'proxy', 'an unknown /api/ path still reaches Express');
check(route('/inbox') === 'static', 'a page path falls through to index.html');

const release = { revision: 'a1b2c3d', build: true, smoke: false, rollback: true };
function ready(r) {
  return Boolean(r.revision && r.build && r.smoke && r.rollback);
}
check(!ready(release), 'Build alone does not prove deployment');
check(ready(Object.assign({}, release, { smoke: true })), 'Release evidence complete');

function rollbackCode(state) {
  return { page: state.previousPage, letters: state.letters };
}
const after = rollbackCode({ previousPage: 'old heading', letters: 3 });
check(after.page === 'old heading' && after.letters === 3, 'a code rollback changes the page and keeps the letters');

console.log('ok: checkpoint-6-4');
```

## Where it breaks

![](diagram:session-6-4/fig2-diagnosis)

### Works only locally

The page loads at the name and every button fails, or `pm2 list` shows `hall-api` restarting every second. The causes are boring and decisive. The client bundle still contains `http://localhost:4100`, because the `apiBase` line was not changed or the build happened before the pull; on the phone that address is the phone. Or the process has no environment, because `node_args` is missing from the ecosystem file, so Node never read `.env` and the guard throws on every start. Or the server's Node is not the laptop's, and a syntax the laptop accepts is rejected.

Open the network panel on the laptop: a request to `localhost:4100` from a page at `https://YOUR-DOMAIN` is the first cause, and the fix is the one line plus a rebuild and a `deploy.sh`. `pm2 logs hall-api --lines 20` showing `JWT_SECRET is required` on repeat is the second, and the fix is the `node_args` line, then `pm2 delete hall-api && pm2 start ecosystem.config.js && pm2 save`. `node --version` on both machines is the third. Never print a secret's value in a log; print whether it is set.

### Database exposed

The database accepts connections from the whole internet and the only thing in front of it is a password. On Atlas that is the "allow access from anywhere" entry in Network Access. On the droplet it is `bindIp: 0.0.0.0` in `mongod.conf`, or a container started with `-p 27017:27017`, which Docker publishes before UFW gets a say. Scanners find open 27017 ports in minutes, and an unauthenticated one is emptied and ransomed within hours.

Confirm from the laptop, which is not the server: `nc -vz 203.0.113.10 27017` must fail. In Atlas, the network list should contain exactly your droplet's address. On the droplet, `ss -ltnp | grep 27017` should show `127.0.0.1:27017` and nothing on `0.0.0.0`. If you ever need a GUI on the data, tunnel: `ssh -L 27017:127.0.0.1:27017 deploy@203.0.113.10` on the laptop makes the loopback port reachable through SSH, without a public listener.

### Rollback loses data

You rolled the code back to yesterday's revision because today's had a bug, and now the inbox is empty, or the old code throws on documents the new code wrote. Code and data moved on different tracks. The old page cannot un-send the letters, and if the new release added a field the old handler does not expect, the rows are still there and unreadable by the version now running.

Before a release that changes a schema, know how the previous revision behaves against the new documents, and take a backup you have restored once: `mongodump --uri "$MONGODB_URI"` on a machine allowed by the network list, and `mongorestore` to a scratch database to prove the dump is real. Rolling back the process is a deploy, done with `git checkout` and `pm2 restart`. Rolling back the data is a restore, done with `mongorestore`. The release notes should say which one each release might need.

## Your turn

Ship your hall. Each step has one line to see before the next.

1. On the laptop, in `~/projects/hall-client`: change the `apiBase` line to read `import.meta.env.VITE_API_URL || ''`, create `.env.development` with `VITE_API_URL=http://localhost:4100`, confirm `npm run dev` still logs in locally, commit, push. In `~/projects/hall-api`, add the `start` and `dev` scripts, commit, push.
2. In Atlas: create a free M0 cluster, a user `hall`, and a network entry for your droplet's IP only. Assemble the connection string with the password and `/guildhall`.
3. On the server, in `~/hall-api`: `git pull --ff-only`, write `.env` with the five names, `chmod 600 .env`. `ls -l .env` shows `-rw-------`.
4. `node --env-file=.env server.js` prints `listening on 4100`. In Terminal B, the register curl against `127.0.0.1:4100` prints `201 Created`. Ctrl-C the server.
5. Write `ecosystem.config.js` with `node_args: '--env-file=.env'`. `pm2 delete test-app`, `pm2 start ecosystem.config.js`, `pm2 save`. `pm2 list` shows `hall-api` online with `0` restarts.
6. In `~/hall-client`: `git pull --ff-only`, `npm install`, `npm run build`. Create `/var/www/hall-client.prev`, rsync the live directory into it, rsync `dist/` into the live directory, fix modes. `ls /var/www/hall-client` shows `assets index.html vite.svg`.
7. Edit the site file: `proxy_pass http://127.0.0.1:4100;` and `try_files $uri $uri/ /index.html;`. `sudo nginx -t` then reload.
8. From the laptop: `curl -sI https://YOUR-DOMAIN | head -n 1` prints `HTTP/2 200`; `curl -i https://YOUR-DOMAIN/api/items` prints `401` with a JSON body; `curl -i https://YOUR-DOMAIN/api/nope` prints `404` and no HTML.
9. In a browser: register Sera, seed the items with the token curl, send a letter from Bran to Sera, read it as Sera, reload, spend from the pack. On a phone with Wi-Fi off, open the name and read the same letter.
10. Commit `deploy.sh` to `hall-api`, push, pull on the server, `./deploy.sh`. The last four lines are `page 200`, `api 401`, and two hashes. Change the heading, deploy, roll the page back with the `.prev` rsync, confirm the letters survived, deploy again.

If step 4 prints the listen line and then a `MongooseServerSelectionError`, go back to step 2: the network list does not contain the droplet, or the password in the string is wrong.

## The quest

![](diagram:session-6-4/fig3-evidence)

Write `docs/release.md` in `~/projects/hall-api`, commit it beside `deploy.sh`, push. It is the handoff for the live hall: another developer with SSH access and this page could operate it tonight. No secrets, no connection strings.

- The public URL and the two short hashes `deploy.sh` printed, with the date.
- The five variable names in `.env` (the four from 4.14 plus `NODE_ENV`), with one phrase each on where their values come from, and the `ls -l` line showing the mode.
- The service name in pm2, the ecosystem path, and the `pm2 list` row.
- The Nginx site path, the `proxy_pass` port, and the `try_files` line.
- The three curl results from step 8, pasted.
- The smoke journey as a checklist with what you saw at each step, including the phone.
- Rollback, code: the `.prev` rsync for the page and the `git checkout` plus `pm2 restart` for the API. Rollback, data: the `mongodump` and `mongorestore` lines and a sentence saying the free tier has no scheduled backup.
- Known limits: a single droplet, a single process, the Atlas IP list that must change if the droplet is rebuilt.

Evidence: the committed `deploy.sh` and `docs/release.md`, a screenshot named `6-4-phone.png` of the hall's inbox on a phone at `https://YOUR-DOMAIN`, and a screenshot named `6-4-deploy.png` of the last four lines of `./deploy.sh`.

## Side quests

The three logs and the restart counter you now read are the observability the library sheet describes, the single droplet with a single process is where the availability sheet's arithmetic starts, and an "allow from anywhere" entry in the database firewall is the security misconfiguration sheet in one checkbox, so the three pages for this session are all about the machine you just shipped.

## Before next session

The hall is live and it stays live. The droplet carries Nginx on 80 and 443, pm2 holding `hall-api` on 4100, and a certificate that renews itself; Atlas holds the data. Nothing on the server changes unless you run `deploy.sh`. Close your SSH sessions. On the laptop nothing is running. State at close:

```text
laptop      ~/projects/hall-api and ~/projects/hall-client · deploy.sh and docs/release.md pushed · nothing running
server A    ssh deploy@YOUR_DROPLET_IP · Nginx on 80 and 443 · hall-api on 4100 under pm2 reading ~/hall-api/.env · test-app deleted · closed with exit
server B    closed with exit
browser     https://YOUR-DOMAIN · the hall's login · Atlas cluster holding guildhall
```

If you are stopping the course for a while, pause the bill on purpose instead of forgetting it. The 1 GB droplet from 6-1 is $6.00 a month at the time of writing, charged by the hour whether or not anyone visits, and the create page always shows the current number. A snapshot keeps the disk for $0.06 per GB per month at the time of writing, so you can destroy the droplet and bring the whole setup back later. The Atlas free cluster costs nothing, but Atlas pauses it after thirty days with no connections and emails you a week before; a paused cluster keeps its data and resumes with one click. The domain renews once a year at the renewal price you wrote in `docs/domain.md`, and a lapsed name goes back on the market.

- Pause: on the droplet's page, Power, turn it off. Snapshots, name it `hall-<date>`, Take Snapshot, wait for it to finish. Destroy, Destroy this Droplet. The IP goes back to the pool.
- Resume: Images, Snapshots, More, Create Droplet, same 1 GB size. The new droplet has a new IP, so update the A record at the registrar and the Atlas network access entry, and run `ssh-keygen -R OLD_IP` on the laptop. Then `ssh deploy@NEW_IP`, `pm2 list` shows `hall-api` online, and `sudo certbot renew --dry-run` still says `Congratulations`.
- Atlas: nothing to pay. If the cluster shows Paused, click Resume and wait a minute. Take a `mongodump` before a long pause anyway, the way 12-3 does.
- Domain: check the renewal date and that auto-renew is on in the registrar panel, with a card that will still be valid on that date.

Unit 7 is about proving the hall works instead of believing it: unit tests with Jest, request tests against the real routes with Supertest, a browser test with Playwright, and a GitHub Actions workflow that runs them on every push. Those tests will target `/api/register`, `/api/login`, `/api/messages`, `/api/inbox`, `/api/items`, and `/api/pack`, the twelve routes you just shipped, against a `guildhall_test` database on your laptop, never against Atlas. Read the Jest getting-started page from 7-1's docs list before you arrive. The next session starts on the laptop, in `~/projects/hall-api`, with the live hall untouched.
