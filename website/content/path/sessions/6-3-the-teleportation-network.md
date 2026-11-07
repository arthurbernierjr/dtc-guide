---
editorial: true
title: The Teleportation Network
subtitle: DNS, Domains, and SSL Certificates
hook: "A DNS and HTTPS configuration with renewal and troubleshooting evidence. Resolve a hostname to the intended endpoint."
read: 60
artifact: "A DNS and HTTPS configuration with renewal and troubleshooting evidence"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://letsencrypt.org/docs/challenge-types/
  - https://eff-certbot.readthedocs.io/en/stable/using.html
say:
  - "DNS: Resolve a hostname to the intended endpoint."
  - "TLS: Verify identity and encrypt the connection."
  - "Renewal: Maintain certificates before they expire."
---

## The hook

"You have a server with Nginx and PM2. You can visit it at http://164.92.105.23 or whatever your IP is. But nobody is going to remember that number. Today, you buy a name for your server. A real domain name. And then you are going to add HTTPS so the browser shows the padlock. This is the session where your project goes from 'student homework' to 'real website.' DNS is the teleportation network of the internet. It turns human-readable names into machine-readable IP addresses. And SSL certificates are the wards of protection that encrypt everything in transit. By the end of today, you will have both."

---

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Configure DNS and SSL/TLS for Production

Purchase a domain name, configure DNS records to point to a VPS, and obtain and install SSL/TLS certificates for HTTPS.

**Enabling Objectives:**

- Trace the DNS resolution process from browser request through root nameservers, TLD servers, and authoritative nameservers to IP address
- Purchase a domain name and configure A and CNAME records to point to a VPS IP address
- Update Nginx server_name directives to respond to domain-based requests
- Install Certbot, obtain a free SSL certificate from Let's Encrypt, and verify automatic HTTPS configuration in Nginx
- Verify HTTP-to-HTTPS redirect, certificate auto-renewal, and SSL Labs grade

**You should be able to:**
- You will be able to purchase a domain, configure DNS records, and set up HTTPS with automatic certificate renewal so that their application is accessible via a secure custom URL.

---

**0:00 - 0:05 | Session Kickoff**

Quick recap: You have a server with Nginx and PM2. You can visit it at `http://164.92.105.23` or whatever your IP is. But nobody is going to remember that number. Today, you buy a name for your server. A real domain name. And then you are going to add HTTPS so the browser shows the padlock.

This is the session where the project becomes a website someone else can open.

**0:05 - 0:30 | DNS Deep Dive**

DNS (Domain Name System) is the phone book of the internet. When you type `google.com` into a browser, your computer does not know where Google is. It knows the domain name, but it needs an IP address to actually connect.

**The DNS resolution process:**

1. You type `mycoolapp.com` in your browser
2. Your browser checks its local cache. "Have I looked this up recently?" If yes, use the cached IP.
3. If not cached, your computer asks its **DNS resolver** (usually your ISP's DNS server, or Cloudflare's `1.1.1.1`, or Google's `8.8.8.8`)
4. The resolver asks the **root nameservers**: "Who is responsible for `.com`?"
5. The root nameservers say: "Go ask the `.com` TLD (Top Level Domain) nameservers"
6. The resolver asks the `.com` TLD nameservers: "Who is responsible for `mycoolapp.com`?"
7. The TLD nameservers say: "Go ask Namecheap's nameservers (or whoever the domain registrar is)"
8. The resolver asks the registrar's nameservers: "What is the IP address for `mycoolapp.com`?"
9. The nameservers respond: "The A record for `mycoolapp.com` is `164.92.105.23`"
10. The resolver returns the IP to your browser
11. Your browser connects to `164.92.105.23` and loads the page

All of this happens in milliseconds. Usually under 100ms. It is one of the most elegant systems ever built.

**DNS Record Types:**

| Record | Purpose | Example |
|--------|---------|---------|
| **A** | Maps a domain to an IPv4 address | `mycoolapp.com -> 164.92.105.23` |
| **AAAA** | Maps a domain to an IPv6 address | `mycoolapp.com -> 2604:a880::1` |
| **CNAME** | Alias, points one domain to another | `www.mycoolapp.com -> mycoolapp.com` |
| **MX** | Mail server records | `mycoolapp.com -> mail.mycoolapp.com` |
| **TXT** | Text records (used for verification, SPF, etc.) | `mycoolapp.com -> "v=spf1 include:..."` |
| **NS** | Nameserver records (who manages DNS for this domain) | `mycoolapp.com -> ns1.digitalocean.com` |

**The ones you care about right now:**
- **A record:** Points your domain to your server's IP. This is the big one.
- **CNAME record:** Makes `www.mycoolapp.com` point to `mycoolapp.com` (so both work).

**0:30 - 0:40 | Choosing and Buying a Domain**

**Compare registrars before buying:**

Check initial and renewal prices separately, supported domain endings, DNS features, account recovery, transfer rules, privacy options, and support. Promotional first-year pricing can hide a much higher renewal cost. The registry and registrar may impose additional requirements for a particular domain ending. Use the provider's current documentation and checkout quote rather than a historical price table.

A domain is optional for the first local exercises. When you choose one for a real deployment, register it in an account you control, protect the account, and record the renewal date. Keep administrative contact details current. Decide whether DNS will be hosted with the registrar or another provider, because the authoritative nameservers determine where changes must be made. Do not buy extra products merely because the checkout flow suggests them.

**0:40 - 0:45 | SSL/TLS Overview**

When you visit a website over HTTP, the data between your browser and the server is sent in plain text. Anyone on the network (your ISP, the coffee shop Wi-Fi, a hacker on the same network) can read it. Passwords, credit card numbers, everything. In the open.

HTTPS fixes this with encryption. SSL (Secure Sockets Layer) and its successor TLS (Transport Layer Security) encrypt the connection so only your browser and the server can read the data.

**What happens with HTTPS:**

1. Your browser connects to the server
2. The server sends its SSL certificate (which contains a public key)
3. Your browser verifies the certificate is legit (signed by a trusted Certificate Authority)
4. Your browser and the server negotiate an encrypted session
5. All data is encrypted from this point forward

**Why HTTPS matters:**

- **Security:** Encrypted data in transit. Nobody can snoop.
- **Trust:** The browser shows a padlock icon. Users trust it.
- **SEO:** Google ranks HTTPS sites higher than HTTP sites.
- **Required for modern features:** Service Workers, HTTP/2, Geolocation API, and many other browser features require HTTPS.
- **It is free:** Let's Encrypt provides free SSL certificates. There is zero reason not to use HTTPS.

**What is Let's Encrypt?**

Let's Encrypt is a nonprofit Certificate Authority (CA) that provides free SSL certificates. Before Let's Encrypt (founded 2014), SSL certificates cost $50-$300/year. Let's Encrypt made HTTPS accessible to everyone.

Certbot is the tool that automates getting and renewing Let's Encrypt certificates. It talks to Let's Encrypt, proves you own the domain, and installs the certificate.

---

![](diagram:session-6-3/fig1-model)

### DNS is a distributed answer, not a redirect

An A record maps a name to an IPv4 address; an AAAA record maps to IPv6. A CNAME aliases one name to another subject to DNS rules. None of these records tells the browser which application route to visit. Once the browser reaches the address, the HTTP host and path still determine the response. Keep DNS diagnosis separate from application routing diagnosis.

A changed record can coexist with cached old answers until their relevant cache lifetimes expire. Query the authoritative nameserver to confirm what is published, then compare recursive resolvers and the local machine. Repeatedly editing a correct record because one cache is stale can create a longer and more confusing incident. Record the previous value, new value, and change time before modifying production DNS.

### IPv6 can explain an intermittent failure

A domain may have a correct A record and a stale AAAA record. Clients with working IPv6 can reach the wrong server while others succeed over IPv4. Inspect both record types when behavior differs across networks. Do not remove IPv6 reflexively; either configure the intended endpoint correctly or remove a record that you cannot serve. The important point is that every published address should lead to a functioning service.

Test the bare domain and any www or application subdomain separately. They are distinct names even when you intend them to show the same site. Choose a canonical hostname and configure deliberate redirects. Avoid redirect loops caused by conflicting rules at the CDN, proxy, and application layers. A request trace showing each status and Location header makes such loops easier to understand.

### A certificate proves a specific name

A valid certificate must cover the hostname the visitor requested, chain to a trusted authority, and be within its validity period. Encrypting a connection is not enough if the identity check fails. Do not teach users to bypass certificate warnings as a normal deployment step. In the lab, inspect the certificate details and match the names to your intended hostname before calling HTTPS complete.

Certificate issuance requires proving control of the name through a supported challenge. An HTTP challenge depends on reachability of the challenge path; a DNS challenge depends on the required DNS record. Choose the method that fits your hosting topology and automation access. Keep DNS API credentials narrowly scoped if you use them for renewal. [Let's Encrypt challenge documentation](https://letsencrypt.org/docs/challenge-types/).

### Renewal is part of the feature

A certificate that works today can expire later. Verify the renewal timer or scheduled task and run the tool's supported dry-run procedure. Record where failures are logged and who would notice them. A browser screenshot taken on launch day does not prove the renewal path. Treat renewal as an operational test with an expected result and a recovery action.

Finish by checking HTTP-to-HTTPS redirection, the canonical hostname, mixed-content requests, and a fresh session from another network if available. Keep application cookies configured for the final HTTPS environment. The artifact should include the DNS record plan, certificate coverage, renewal evidence, and a short diagnostic sequence that starts with resolution and ends with application routing.

## The demonstration

**0:45 - 1:00 | Demo: Buying a Domain on Namecheap**

Step-by-step walkthrough:

1. Go to [namecheap.com](https://www.namecheap.com)
2. Search for a domain name (e.g., `yourname-project.xyz`)
3. Add it to cart
4. At checkout, make sure "WhoisGuard" is enabled (free privacy protection)
5. Complete the purchase

After purchase, you need to configure DNS. You have two options:

**Option A: Use Namecheap's DNS (simpler)**
- Go to your domain's management page
- Click "Advanced DNS"
- Add your records there

**Option B: Use DigitalOcean's DNS (recommended)**
- In Namecheap, go to Domain > Nameservers
- Change from "Namecheap BasicDNS" to "Custom DNS"
- Enter DigitalOcean's nameservers:
  - `ns1.digitalocean.com`
  - `ns2.digitalocean.com`
  - `ns3.digitalocean.com`
- In DigitalOcean, go to Networking > Domains
- Add your domain and point it to your droplet

We will use **Option B** because managing DNS in DigitalOcean keeps everything in one place.

**1:00 - 1:15 | Demo: Setting Up DNS Records**

**If using DigitalOcean DNS:**

1. Go to DigitalOcean dashboard > Networking > Domains
2. Enter your domain name and click "Add Domain"
3. Add these records:

**Recommended setup:**

| Type | Hostname | Value | TTL |
|------|----------|-------|-----|
| A | @ | YOUR_DROPLET_IP | 3600 |
| CNAME | www | @ | 3600 |

The `@` symbol means the root domain (e.g., `mycoolapp.com`).

CNAME is slightly more flexible because if you change your server IP later, you only need to update one A record.

**If using Namecheap DNS directly:**

1. Go to Domain List > your domain > Advanced DNS
2. Delete any existing records
3. Add:
   - A Record: Host `@`, Value `YOUR_DROPLET_IP`, TTL Automatic
   - CNAME Record: Host `www`, Value `yourdomain.com.`, TTL Automatic

**DNS Propagation:**

After changing DNS records, the changes need to propagate across the internet. This means all the DNS servers around the world need to update their caches with your new records.

- New records: Usually 5-30 minutes
- Changed records: Can take up to 48 hours (but usually much faster)
- TTL (Time To Live): This is how long DNS servers cache the record. A TTL of 3600 means "cache this for 1 hour."

How to check if DNS has propagated:

```bash
# From your local machine (not the server)
nslookup yourdomain.com
dig yourdomain.com
ping yourdomain.com

# Online tools
# whatsmydns.net - Shows DNS propagation worldwide
# dnschecker.org - Similar tool
```

You want the response to show your droplet's IP address.

**1:15 - 1:30 | Demo: Setting Up HTTPS with Certbot**

**Step 1: Update Nginx server_name**

First, update your Nginx config to use your domain name:

```bash
sudo nano /etc/nginx/sites-available/mysite
```

Change `server_name` from your IP to your domain:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

**Step 2: Install Certbot**

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

The `python3-certbot-nginx` plugin lets Certbot automatically configure Nginx for HTTPS. It is magic.

**Step 3: Verify DNS points to your server**

Before running Certbot, your domain MUST resolve to your server's IP. Certbot verifies domain ownership by making an HTTP request to your server. If DNS has not propagated, this will fail.

```bash
# Run this on your LOCAL machine
nslookup yourdomain.com
```

It should return your droplet's IP.

**Step 4: Run Certbot**

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will:
1. Ask for your email address (for renewal notifications)
2. Ask you to agree to the terms of service
3. Ask if you want to share your email with the EFF (say yes or no, your choice)
4. Automatically verify domain ownership
5. Obtain the SSL certificate
6. Automatically modify your Nginx config to use HTTPS
7. Set up automatic HTTP-to-HTTPS redirect

After Certbot finishes, look at your Nginx config:

```bash
cat /etc/nginx/sites-available/mysite
```

Certbot will have added SSL configuration. It will look something like this:

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

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

    listen [::]:443 ssl;
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = www.yourdomain.com) {
        return 301 https://$host$request_uri;
    }

    if ($host = yourdomain.com) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    listen [::]:80;

    server_name yourdomain.com www.yourdomain.com;
    return 404;
}
```

Look at that. Certbot:
- Added SSL certificate paths
- Set up the HTTPS server block (port 443)
- Created a separate server block that redirects HTTP (port 80) to HTTPS (port 443)

**Step 5: Verify auto-renewal**

Let's Encrypt certificates expire every 90 days. Certbot sets up automatic renewal, but let's verify:

```bash
# Test the renewal process (dry run, does not actually renew)
sudo certbot renew --dry-run
```

If the dry run succeeds, you are good. Certbot will automatically renew before expiration.

You can also check the systemd timer:

```bash
sudo systemctl status certbot.timer
```

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-6-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const record = {oldValue: '192.0.2.1', newValue: '192.0.2.2', cachedAt: 100, ttl: 300};
const cachedAnswer = now => now < record.cachedAt + record.ttl ? record.oldValue : record.newValue;
check(cachedAnswer(200) === record.oldValue, 'A cache may retain the old answer');
check(cachedAnswer(400) === record.newValue, 'This simplified cache expires at its deadline');
console.log('ok: checkpoint-6-3');
```

## Where it breaks

![](diagram:session-6-3/fig2-diagnosis)

### Domain points elsewhere

The name loads an old server, or it loads nothing, depending on who asks. DNS answers are cached, and an authoritative answer and a cached answer can disagree for as long as the TTL. Query the authoritative server directly and compare it to a public resolver. If only the cache is wrong, you wait or lower the TTL next time, before the change. If the authoritative record is wrong, no amount of local cache clearing on your laptop will fix the rest of the world. Also check that you edited the zone that is actually delegated, not a lookalike zone in another account.

### Certificate mismatch

The browser warns that the certificate is not valid for this host. The cert is for `example.com` and you asked for `www`, or the virtual host that answered is the default server because this name did not match a `server_name`. TLS presents the certificate of the server block that handled the handshake. Read the certificate the browser actually received, then read the server blocks. A cert that covers the name and a server block that matches the name are both required. Having the file on disk is not the same as serving it for this request.

### Renewal fails

The certificate expires because renewal has been failing for weeks and nothing was watching. HTTP-01 needs the challenge path to reach the verifier on port 80, and a rewrite that sends all traffic to HTTPS, or a firewall that blocks 80, makes the challenge 404. DNS-01 fails when the credentials that edit the zone have expired. Run a renewal dry run, read which challenge failed, and fix that path. Then confirm the timer or cron is installed. A cert you renewed by hand once will expire on a Saturday.

## Your turn

> **Exercise 1: Claim Your Domain**
>
> 1. Buy a domain name from Namecheap, Cloudflare, or Porkbun (cheapest you can find)
>    - Suggestion: `yourname-project.xyz` or similar (`.xyz` domains are often $1-$2)
> 2. Configure DNS:
>    - Set up an A record pointing `@` to your droplet's IP
>    - Set up a CNAME record pointing `www` to `@`
> 3. Update your Nginx config to use your domain name:
>    ```bash
>    sudo nano /etc/nginx/sites-available/mysite
>    ```
>    Change `server_name` from your IP to your domain:
>    ```nginx
>    server_name yourdomain.com www.yourdomain.com;
>    ```
> 4. Test and reload Nginx:
>    ```bash
>    sudo nginx -t
>    sudo systemctl reload nginx
>    ```
> 5. Wait for DNS propagation and test:
>    ```bash
>    nslookup yourdomain.com
>    ```
> 6. Visit `http://yourdomain.com` in your browser
>
> **Deliverable:** Screenshot of your app loaded at your custom domain (HTTP is fine for now).

> **Exercise 2: Lock It Down with HTTPS**
>
> 1. Install Certbot:
>    ```bash
>    sudo apt install -y certbot python3-certbot-nginx
>    ```
> 2. Make sure your Nginx config has the correct `server_name`
> 3. Run Certbot:
>    ```bash
>    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
>    ```
> 4. Visit `https://yourdomain.com` in your browser
> 5. Click the padlock icon and verify the certificate details
> 6. Test auto-renewal:
>    ```bash
>    sudo certbot renew --dry-run
>    ```
>
> **Deliverable:** Screenshot of your site with the padlock icon visible and `https://` in the URL bar.

---

## The quest

> **Exercise 3: DNS Detective Work**
>
> Use the following tools to investigate DNS for a few well-known websites:
>
> ```bash
> # Check Google's DNS records
> dig google.com A +short
> dig google.com MX +short
> dig google.com TXT +short
>
> # Check your own domain
> dig yourdomain.com A +short
> dig yourdomain.com NS +short
>
> # Trace the full DNS resolution path
> dig +trace yourdomain.com
>
> # Check SSL certificate details from the command line
> openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
> ```
>
> **Deliverable:** Screenshot of the `dig +trace` output for your domain, plus the SSL certificate details.

**When the name or the certificate fails:**

DNS and SSL issues are some of the most frustrating things in web development because the feedback loop is slow. Here are the most common problems and fixes:

**Problem 1: "DNS is not resolving to my IP"**

```bash
# Check what IP your domain resolves to
dig yourdomain.com +short
nslookup yourdomain.com

# Check with a specific DNS server (bypass your local cache)
dig @8.8.8.8 yourdomain.com +short

# Use an online tool
# Visit: whatsmydns.net
```

Fixes:
- Wait longer (propagation can take up to 48 hours)
- Double-check your A record in the registrar's DNS panel
- Make sure nameservers are set correctly
- Flush your local DNS cache:
  - macOS: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
  - Linux: `sudo systemd-resolve --flush-caches`
  - Windows: `ipconfig /flushdns`

**Problem 2: "Certbot says it cannot verify domain ownership"**

This means Certbot tried to reach your server at `http://yourdomain.com/.well-known/acme-challenge/...` and failed.

Fixes:
- Make sure DNS is pointing to your server (check with `dig`)
- Make sure Nginx is running: `sudo systemctl status nginx`
- Make sure port 80 is open in the firewall: `sudo ufw status`
- Make sure `server_name` in Nginx matches the domain exactly

**Problem 3: "Mixed content warnings"**

Your site loads over HTTPS but some resources (images, scripts, API calls) are loaded over HTTP. The browser blocks them.

Fix: Make sure all URLs in your code use HTTPS or relative URLs (start with `/` instead of `http://...`).

**Problem 4: "Certificate expired"**

If auto-renewal failed:

```bash
sudo certbot renew
sudo systemctl reload nginx
```

**Wrap-Up (Last 5 min of Practice block)**

What you accomplished today:
- Learned how DNS works (domain name to IP address)
- Bought a domain name and configured DNS records
- Pointed your domain to your VPS
- Installed Certbot and obtained a free SSL certificate from Let's Encrypt
- Configured Nginx for HTTPS with automatic HTTP-to-HTTPS redirect
- Learned DNS troubleshooting techniques

Your architecture is now:

```
Browser types: https://yourdomain.com
  --> DNS resolves to YOUR_DROPLET_IP
    --> Nginx (port 443, SSL termination)
      --> Node.js app (port 3000, managed by PM2)
```

Next session: You deploy your actual MERN app. The real one. With MongoDB, environment variables, and everything.

---

### Review the artifact

Your deliverable is **A DNS and HTTPS configuration with renewal and troubleshooting evidence**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-6-3/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Confirm your VPS has Nginx running and serving content at your IP address. Have a credit/debit card or PayPal ready for domain purchase (domains cost $1-$12/year). Write down your server's IP address.
**Materials:** SSH terminal, web browser, domain registrar account (Namecheap, Cloudflare, or Porkbun)

---

**HW 6.3: DNS and SSL Mastery**

1. **Verify everything is working.** Visit your domain in:
   - Chrome
   - Firefox (or another browser)
   - Your phone's browser
   - An incognito/private window

   Take a screenshot from each showing the padlock and HTTPS.

2. **Test the HTTP-to-HTTPS redirect.** Type `http://yourdomain.com` (no S) in your browser. It should automatically redirect to `https://yourdomain.com`. Confirm this works.

3. **Check your SSL grade.** Go to [ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/) and enter your domain. You should get an A or A+ grade. Screenshot the result.

4. **Add a subdomain (stretch goal).** Create a new A record for `api.yourdomain.com` pointing to your server IP. Create a new Nginx server block for it. This is preparation for Session 6.4 where you might serve your API on a subdomain.

5. **Research task:** What is the difference between SSL and TLS? Why do people still say "SSL" when they usually mean TLS? Write 2-3 sentences.

**Submission:** Push screenshots (all browsers, SSL Labs grade, redirect test) and your research answer to your homework repo.

---

### Manual verification and further reading

- [Official reference 1](https://letsencrypt.org/docs/challenge-types/)
- [Official reference 2](https://eff-certbot.readthedocs.io/en/stable/using.html)
