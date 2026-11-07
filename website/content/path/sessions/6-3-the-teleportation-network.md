---
editorial: true
title: The Teleportation Network
subtitle: DNS, Domains, and SSL Certificates
hook: "Nobody will type your IP address. Today you register a name, point it at the droplet with one A record, and let certbot fetch a certificate so the browser shows a lock instead of a warning."
read: 65
artifact: "A registered domain with A and CNAME records at the registrar, Nginx answering for that name over HTTPS with a Let's Encrypt certificate, a passing renewal dry run, and docs/domain.md"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://letsencrypt.org/how-it-works/
  - https://letsencrypt.org/docs/challenge-types/
  - https://eff-certbot.readthedocs.io/en/stable/using.html
  - https://nginx.org/en/docs/http/server_names.html
  - https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/
  - https://docs.digitalocean.com/products/networking/dns/
say:
  - "An A record maps a name to an address; nothing in DNS knows about paths."
  - "A certificate proves a name, so the name you type must be one of the names on it."
  - "A dry run that passes today is the only promise the certificate keeps in ninety days."
---

## The hook

`http://203.0.113.10/api/ping` works and nobody will ever type it. Numbers are what machines use to find each other; names are what people hand to each other. Today you buy one, write a single record that says "this name means that number," and watch resolvers around the world start agreeing with you. Then you fix the other thing a browser holds against an address: the plain `http://`. Let's Encrypt gives you a certificate for free, certbot installs it and rewrites the Nginx block for you, and a systemd timer renews it before it expires.

By the end of the session `dig +short YOUR-DOMAIN` on your laptop prints your droplet's address, `https://YOUR-DOMAIN` opens your page with a lock, `http://YOUR-DOMAIN` answers with a 301 to the https version, `curl https://YOUR_DROPLET_IP` fails with a name mismatch that you can explain, and `certbot renew --dry-run` ends with the words `Congratulations, all simulated renewals succeeded`. The hall is still not on it. The door now has a name and a lock, and that is a day's work.

> *The map now has a word where it used to have coordinates. Anyone who speaks the word arrives at your gate, and the gate checks its seal before it opens.*

## The idea

DNS is a distributed answering service for one question: what address goes with this name? Your browser does not ask the registrar. It asks the resolver your laptop is configured with, usually your ISP's or a public one such as `1.1.1.1`, and that resolver walks the hierarchy on your behalf. The root servers say who runs `.com`, or `.dev`, or `.xyz`. The top-level servers say which nameservers are authoritative for `YOUR-DOMAIN`. Those nameservers, which belong to whoever hosts your zone, answer with the record. The resolver caches that answer for the record's TTL and hands it to the browser, which opens a TCP connection to the number. Every step is milliseconds, and every step can cache.

The records you need today are two. An `A` record maps a name to an IPv4 address: `YOUR-DOMAIN` to `203.0.113.10`. A `CNAME` record makes one name an alias for another: `www.YOUR-DOMAIN` to `YOUR-DOMAIN`, so both spellings land on the same droplet and the address is written in exactly one place. `AAAA` is the IPv6 twin of `A`; your droplet has an IPv6 address if you enabled it, and if you publish an `AAAA` it must work, because a client with IPv6 will try it first. `MX`, `TXT`, and `NS` exist and are not today's work.

![](diagram:session-6-3/fig1-model)

### Buying a name and deciding who answers for it

A registrar sells you the right to a name for a year at a time. Pick one with a plain checkout: Namecheap, Porkbun, and Cloudflare Registrar are the common choices, and all three publish the renewal price beside the first-year price. Read the renewal price; promotional endings are cheap in year one and not in year two. Turn on the free WHOIS privacy option so your home address is not in the public record; Namecheap calls it Domain Privacy. Say no to the email, hosting, and SSL add-ons in the cart. You already have a server, and the certificate is free.

The registrar also hosts your zone by default, and that is the path this session takes: the A and CNAME records go in the registrar's DNS panel. The alternative is to change the domain's nameservers to DigitalOcean's three, `ns1`, `ns2`, and `ns3.digitalocean.com`, and manage the records under Networking in the droplet console. Either works; the only rule is that there is one authoritative place, and you edit records there and nowhere else. A record edited in a panel that is not authoritative changes nothing, and that is the first diagnosis below.

### TTL and the caches between you and the truth

Each record carries a TTL, a number of seconds a resolver may keep the answer. The registrar's default is often an hour, sometimes labeled Automatic. A new record spreads quickly because nobody has it cached yet. A changed record takes as long as the old TTL to fall out of every cache, which is why you lower a TTL before a planned change, not after. Your own laptop keeps a cache too, which `resolvectl flush-caches` clears on Ubuntu, `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` on macOS, and `ipconfig /flushdns` on Windows.

The tool for looking at DNS without the browser is `dig`. macOS has it. Ubuntu and WSL need `sudo apt install -y bind9-dnsutils`. Windows PowerShell has `Resolve-DnsName` instead. `dig +short YOUR-DOMAIN A` asks your resolver; `dig @1.1.1.1 +short YOUR-DOMAIN A` asks Cloudflare's, which bypasses your local cache. When the two disagree, you are looking at a cache, not a broken record, and the checkpoint below models exactly that lag.

### What a certificate proves

TLS does two things, and people remember only the first. It encrypts the connection, so the token in your `Authorization` header cannot be read on the coffee shop's Wi-Fi. It also identifies the server: the certificate names the hosts it is valid for, a certificate authority the browser trusts has signed it, and the signature is only meaningful if the name you typed is one of the names on the certificate. A valid certificate for `YOUR-DOMAIN` presented when you asked for `203.0.113.10` is a mismatch, and the browser is right to warn you. Encrypting a conversation with the wrong party is not security.

Let's Encrypt is the certificate authority that made this free and automated. The ACME protocol asks you to prove control of the name. The HTTP-01 challenge is the one certbot uses with Nginx: Let's Encrypt asks for a specific file at `http://YOUR-DOMAIN/.well-known/acme-challenge/<token>`, certbot places it, and if the answer comes back from your server the name is yours. That is why DNS must already point at the droplet and port 80 must be open before you run certbot. A redirect from 80 to 443 is fine; the validator follows it. A firewall that blocks 80 is not.

Certificates last ninety days. certbot installs a systemd timer, `certbot.timer`, that tries renewal twice a day and renews when fewer than thirty days remain. Let's Encrypt no longer sends expiry warning emails, so the timer and your dry run are the whole safety net. The pattern in the figure is DNS, TLS, renewal, and renewal is the part a launch-day screenshot never shows.

### What certbot does to your Nginx file

`certbot --nginx` reads `sites-enabled`, finds the `server` block whose `server_name` matches the names you asked for, obtains the certificate, and rewrites that block: it adds `listen 443 ssl` and the four `ssl_` lines pointing into `/etc/letsencrypt/live/YOUR-DOMAIN/`, and it creates a second block on port 80 whose only job is to `return 301` to the https version. Your `location` blocks are untouched, which is why the proxy from 6-2 keeps working the moment the lock appears. The hall's final block in 6-4 is this file plus a different `proxy_pass` port.

## The demonstration

One domain, start to finish. The laptop is where you buy, where you `dig`, and where you check the lock. The server is where `server_name` changes and certbot runs. The session writes the name as `YOUR-DOMAIN`; substitute yours everywhere, including in the `www` form. Where you are at the start of today:

```text
laptop      ~/projects/hall-api and ~/projects/hall-client · nothing running · dig installed today if missing
server A    ssh deploy@YOUR_DROPLET_IP · Nginx on 80 · /api/ proxied to test-app on 3000 under pm2
server B    not needed today · one server session is enough
browser     the registrar's search box, then its DNS panel · http://YOUR_DROPLET_IP still shows the heading
```

At the registrar: search for the name, add it, decline the add-ons, enable the free privacy option, pay. In the domain's DNS panel, which Namecheap calls Advanced DNS, delete any parking records the registrar created, then add two:

```text
Type   Host   Value             TTL
A      @      203.0.113.10      Automatic
CNAME  www    YOUR-DOMAIN       Automatic
```

`@` means the bare name. The CNAME value is the bare name, not the IP; if the panel insists on a trailing dot, `YOUR-DOMAIN.` is the same thing written fully. Save. On the laptop, within a few minutes:

```bash
# laptop
dig +short YOUR-DOMAIN A
dig +short www.YOUR-DOMAIN A
dig @1.1.1.1 +short YOUR-DOMAIN A
```

```text
203.0.113.10
YOUR-DOMAIN.
203.0.113.10
203.0.113.10
```

The first line is your droplet. The second query prints two lines because `www` is an alias: the name it points at, then the address that name resolves to. The third, asked of a public resolver, agrees. If the first is empty and the third is correct, your laptop's resolver cached the registrar's empty answer from before you saved; flush it or wait out the TTL. `curl -I http://YOUR-DOMAIN` already returns `200 OK` from Nginx, because the only `server` block on the machine answers for any name. A browser at `http://YOUR-DOMAIN` shows your under-construction page. Named, not yet locked.

On the server, name the block:

```bash
# server, Terminal A
sudo nano /etc/nginx/sites-available/hall
```

Change the one line:

```nginx
server_name YOUR-DOMAIN www.YOUR-DOMAIN;
```

```bash
# server, Terminal A
sudo nginx -t && sudo systemctl reload nginx
```

Install certbot and its Nginx plugin, and run it for both names, still on the server:

```bash
# server, Terminal A
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d YOUR-DOMAIN -d www.YOUR-DOMAIN
```

```text
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Enter email address (used for urgent renewal and security notices)
 (Enter 'c' to cancel): you@example.com
Please read the Terms of Service at ...
(Y)es/(N)o: Y
Would you be willing ... to share your email address with the EFF ...
(Y)es/(N)o: N
Account registered.
Requesting a certificate for YOUR-DOMAIN and www.YOUR-DOMAIN

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/YOUR-DOMAIN/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/YOUR-DOMAIN/privkey.pem
This certificate expires on 2027-02-12.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for YOUR-DOMAIN to /etc/nginx/sites-enabled/hall
Successfully deployed certificate for www.YOUR-DOMAIN to /etc/nginx/sites-enabled/hall
Congratulations! You have successfully enabled HTTPS on https://YOUR-DOMAIN and https://www.YOUR-DOMAIN
```

Read the file it changed:

```bash
# server, Terminal A
cat /etc/nginx/sites-available/hall
```

```nginx
server {
    server_name YOUR-DOMAIN www.YOUR-DOMAIN;

    root /var/www/hall-client;
    index index.html;

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

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/YOUR-DOMAIN/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/YOUR-DOMAIN/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.YOUR-DOMAIN) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = YOUR-DOMAIN) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    listen [::]:80;
    server_name YOUR-DOMAIN www.YOUR-DOMAIN;
    return 404; # managed by Certbot
}
```

Your `location` blocks are exactly where you left them. The first block now listens on 443 with the certificate; the second block is the 80-to-443 redirect, with a 404 for any host name it was not asked to serve. Now the checks, from the laptop:

```bash
# laptop
curl -I http://YOUR-DOMAIN
curl -sI https://YOUR-DOMAIN | head -n 1
curl -s https://YOUR-DOMAIN/api/ping
```

```text
HTTP/1.1 301 Moved Permanently
Location: https://YOUR-DOMAIN/

HTTP/2 200
{"pong":true,"path":"/api/ping","from":"198.51.100.23"}
```

The 301 is the second block. The `HTTP/2 200` is the first, over TLS. The JSON is the test app from 6-2, reached through the proxy, over HTTPS, without Express knowing anything about certificates. Read the certificate itself, still on the laptop:

```bash
# laptop
openssl s_client -connect YOUR-DOMAIN:443 -servername YOUR-DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
```

```text
subject=CN=YOUR-DOMAIN
issuer=C=US, O=Let's Encrypt, CN=R13
notBefore=Nov 14 15:40:12 2026 GMT
notAfter=Feb 12 15:40:11 2027 GMT
```

Ninety days between the two dates. The issuer name changes as Let's Encrypt rotates intermediates; `O=Let's Encrypt` is the part to read. Now the mismatch, on purpose, from the laptop:

```bash
# laptop
curl https://203.0.113.10
```

```text
curl: (60) SSL: no alternative certificate subject name matches target host name '203.0.113.10'
```

Same server, same certificate, wrong name. The certificate covers `YOUR-DOMAIN` and `www.YOUR-DOMAIN` and nothing else, and curl refuses, as a browser would with a full-page warning. Do not add `-k` to make it go away. The warning is the identity check working.

Last, renewal, on the server:

```bash
# server, Terminal A
sudo certbot renew --dry-run
systemctl list-timers certbot.timer --no-pager
```

```text
Simulating renewal of an existing certificate for YOUR-DOMAIN and www.YOUR-DOMAIN
Congratulations, all simulated renewals succeeded:
  /etc/letsencrypt/live/YOUR-DOMAIN/fullchain.pem (success)

NEXT                        LEFT     LAST  PASSED  UNIT          ACTIVATES
Sat 2026-11-14 22:17:00 UTC 6h left  -     -       certbot.timer certbot.service
```

The dry run exercises the whole challenge path against Let's Encrypt's staging environment and tells you today whether the renewal in late January will work. The timer line says the machine will try without you. Both lines go in the quest.

A small model you can run here. It does not resolve anything or talk to a certificate authority. It models the resolver cache that keeps an old answer until its TTL runs out, the name check a client performs against a certificate, and the way Nginx picks a server block by `server_name`. It proves you can state those three rules; `dig`, `openssl`, and the dry run prove your domain.

```js run=checkpoint-6-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const authoritative = '203.0.113.10';
const cached = { value: '198.51.100.7', storedAt: 100, ttl: 300 };
function resolve(now) {
  if (now < cached.storedAt + cached.ttl) return cached.value;
  return authoritative;
}
check(resolve(200) === cached.value, 'A cache may retain the old answer');
check(resolve(400) === authoritative, 'This simplified cache expires when its TTL runs out');

const certificate = { names: ['YOUR-DOMAIN', 'www.YOUR-DOMAIN'], notAfter: 1000 };
function trusts(cert, host, now) {
  return cert.names.indexOf(host) !== -1 && now < cert.notAfter;
}
check(trusts(certificate, 'www.YOUR-DOMAIN', 500) === true, 'a name on the certificate is accepted');
check(trusts(certificate, '203.0.113.10', 500) === false, 'the bare address is not a name on the certificate');
check(trusts(certificate, 'YOUR-DOMAIN', 1200) === false, 'an expired certificate fails even for the right name');

const blocks = [
  { names: ['YOUR-DOMAIN', 'www.YOUR-DOMAIN'], cert: 'YOUR-DOMAIN' },
  { names: ['_'], cert: null }
];
function pick(host) {
  const exact = blocks.filter(function (block) { return block.names.indexOf(host) !== -1; })[0];
  return exact || blocks[blocks.length - 1];
}
check(pick('YOUR-DOMAIN').cert === 'YOUR-DOMAIN', 'a matching server_name serves its own certificate');
check(pick('api.YOUR-DOMAIN').cert === null, 'a name no block claims falls to the default block');

console.log('ok: checkpoint-6-3');
```

## Where it breaks

![](diagram:session-6-3/fig2-diagnosis)

### Domain points elsewhere

The browser loads the registrar's parking page, or an old server, or nothing, and `dig` on your laptop disagrees with `dig @1.1.1.1`. Three different causes look identical from the address bar. A cache somewhere still holds the answer from before your edit, and will until the TTL expires. The record was edited in a panel that is not authoritative, because the nameservers point somewhere else. Or a parking `A` record the registrar created is still there beside yours, and resolvers are returning both.

Ask the authoritative servers directly: `dig +short YOUR-DOMAIN NS` names them, and `dig @ns1.example-registrar.com +short YOUR-DOMAIN A`, with one of those names, shows what is actually published. If that answer is right, you are waiting on caches; flush yours and give the rest the TTL. If that answer is wrong, the fix is in the zone, and no amount of flushing on your laptop changes the rest of the world. If the nameservers are not where you have been editing, you found the panel problem.

### Certificate mismatch

The browser says the certificate is not valid for this name, or curl prints `no alternative certificate subject name matches`. Two causes. The name you asked for is not on the certificate: you typed the bare address, or `api.YOUR-DOMAIN`, or you ran certbot for the bare name and forgot `-d www.YOUR-DOMAIN`. Or the name is on a certificate, but the `server` block that answered was a different one, because `server_name` did not match and Nginx fell to its default block, which presents whatever certificate it has.

Read what was presented with the `openssl` line from the demonstration, with `-servername` set to the name you typed. Compare the `subject` and the alternative names to the name in the address bar. Then read `server_name` in every file under `sites-enabled`. A certificate that covers the name and a block that matches the name are both required. Having the files on disk is not the same as serving them for this request.

### Renewal fails

The lock turns into a warning one morning in February because renewals have been failing for weeks and nothing was watching. The common cause is the challenge path: port 80 closed in UFW after someone decided HTTPS made it unnecessary, or `server_name` changed so the 80 block no longer matches the name Let's Encrypt is probing, or a `location /.well-known/` was added that answers something else. A redirect from 80 to 443 is not a cause; the validator follows it.

`sudo certbot renew --dry-run` reproduces the failure and names the challenge that failed. Open port 80, fix the block, run the dry run again until it says `Congratulations`. Then `systemctl list-timers certbot.timer` to confirm the timer is still scheduled. A certificate you renewed by hand once will expire on a Saturday; the dry run and the timer are the two things that make it not your problem.

## Your turn

Do it with your own name. Each step has one line you should see.

1. At the registrar, buy the name with the free privacy option on and no add-ons. In its DNS panel, remove parking records and add `A @ YOUR_DROPLET_IP` and `CNAME www YOUR-DOMAIN`.
2. On the laptop, `dig +short YOUR-DOMAIN A` prints your droplet's address. `dig @1.1.1.1 +short YOUR-DOMAIN A` prints the same. If the first is empty, flush the local cache and try again in five minutes.
3. `curl -I http://YOUR-DOMAIN` prints `HTTP/1.1 200 OK`. The browser shows your under-construction page at the name.
4. On the server, set `server_name YOUR-DOMAIN www.YOUR-DOMAIN;` in `/etc/nginx/sites-available/hall`, `sudo nginx -t`, reload.
5. `sudo apt install -y certbot python3-certbot-nginx`, then `sudo certbot --nginx -d YOUR-DOMAIN -d www.YOUR-DOMAIN`. The last line begins `Congratulations! You have successfully enabled HTTPS`.
6. From the laptop, `curl -I http://YOUR-DOMAIN` prints `301` with `Location: https://YOUR-DOMAIN/`. `curl -sI https://YOUR-DOMAIN | head -n 1` prints `HTTP/2 200`. `curl -s https://YOUR-DOMAIN/api/ping` prints the JSON from the test app.
7. The `openssl s_client` line prints a subject of `CN=YOUR-DOMAIN`, an issuer containing `Let's Encrypt`, and dates ninety days apart.
8. `curl https://YOUR_DROPLET_IP` prints `curl: (60) SSL: no alternative certificate subject name matches`. Write one sentence in your notes about why that is correct.
9. On the server, `sudo certbot renew --dry-run` ends with `all simulated renewals succeeded`, and `systemctl list-timers certbot.timer --no-pager` shows a NEXT time.
10. Open `https://YOUR-DOMAIN` on your phone with Wi-Fi off, so a different network and a different resolver confirm the name and the lock.

If step 5 fails with a challenge error, go back to step 2 and step 3: certbot can only prove a name that already reaches your port 80.

## The quest

![](diagram:session-6-3/fig3-evidence)

Write `docs/domain.md` in `~/projects/hall-api` on your laptop, commit, push. It records the name, who answers for it, and how you would diagnose it. No secrets.

- The registrar, the renewal date, the renewal price you read at checkout, and where the DNS panel is.
- The record table, exactly as you entered it, and the output of `dig +short YOUR-DOMAIN NS`.
- The three `dig` lines from step 2, pasted, with the date.
- The certbot summary lines: the `live` path, the expiry date, and the two `Successfully deployed` lines.
- The `openssl` output with subject, issuer, and dates.
- The `curl: (60)` line from the bare address, and your one-sentence explanation.
- The dry-run `Congratulations` line and the `certbot.timer` NEXT line.
- A four-step diagnostic sequence in your own words that starts with `dig` and ends with a `location` block, for the next time the name does not load.

Evidence: the committed `docs/domain.md`, a screenshot named `6-3-lock.png` of the browser's certificate panel at `https://YOUR-DOMAIN`, and a screenshot named `6-3-dry-run.png` of the dry-run output.

## Side quests

The resolver walk you traced is the library's DNS sheet in miniature, and a certificate served for the wrong name is one of the cryptographic failures the security sheet catalogs, so both pages read as commentary on what `dig` and `openssl` just printed.

## Before next session

Leave everything running. The droplet now answers `https://YOUR-DOMAIN` with a certificate that renews itself, Nginx proxies `/api/` to the test app on 3000, and pm2 holds that app across reboots. Close your SSH sessions. Nothing runs on the laptop. State at close:

```text
laptop      ~/projects/hall-api and ~/projects/hall-client · docs/domain.md pushed · nothing running
server A    ssh deploy@YOUR_DROPLET_IP · Nginx on 80 and 443 for YOUR-DOMAIN · /api/ proxied to test-app on 3000 under pm2 · closed with exit
server B    closed with exit
browser     https://YOUR-DOMAIN · the heading with a lock
```

Next session is the one the unit has been building toward: the guild hall goes live at that name. You create a MongoDB Atlas account and a free cluster inside the session, because Unit 4 used a MongoDB on your laptop and the droplet has no database at all. You write the hall's `.env` on the server, start `hall-api` under pm2 with Node reading that file, build `hall-client` with Vite, copy the build into `/var/www/hall-client`, and point `location /api/` at port 4100. Reread 4-14's `.env` paragraph before you arrive so the five variable names are fresh. The session starts on the laptop, in `~/projects/hall-client`, with one line of code to change.
