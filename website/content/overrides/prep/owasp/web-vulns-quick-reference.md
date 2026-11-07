# Web vulnerability quick reference (bounty / interview names)

First visit from Session 7.4: read each card title and its **what** line only; those names are the first column of your risk table. Stop there. The **find** and **fix** lines are for Unit 10.

Format per block: **what** · **find** · **fix** · **OWASP 2025**.

---

### Reflected XSS
- **what**: Attacker-controlled input from the request (query/param/header) echoed into the HTML response without encoding; victim clicks a crafted link.
- **find**: Inject `"><svg onload=alert(1)>` / `'-alert(1)-'` into every reflected param; check response context (HTML body, attribute, JS string, URL). Burp Repeater; search for `req.query` → `res.send(` templates.
- **fix**: Contextual output encoding (HTML entity, attribute, JS, URL); templating engines with auto-escape; CSP without `unsafe-inline`; `X-Content-Type-Options: nosniff`.
- **OWASP**: A05 Injection (CWE-79).

### Stored XSS
- **what**: Payload persisted (comment, profile name, filename, support ticket) and rendered to other users later — including admins.
- **find**: Put payloads in every writable field, then view every place it renders (other pages, emails, admin panels, exports, PDFs). Check Markdown/rich-text sanitizers, SVG uploads, `Content-Type` of uploads.
- **fix**: Encode on output (not just on input); sanitize rich text with DOMPurify (allowlist); serve uploads from a separate origin; CSP.
- **OWASP**: A05 Injection (CWE-79).

### DOM XSS
- **what**: Client-side JS reads a source (`location.hash`, `document.referrer`, `postMessage`, `localStorage`) and writes to a sink (`innerHTML`, `document.write`, `eval`, `location.href`, `setTimeout(string)`, jQuery `.html()`). Server never sees the payload.
- **find**: Grep bundles for sinks; trace sources (DOM Invader in Burp; browser devtools breakpoints). `#<img src=x onerror=alert(1)>`; `javascript:` in a redirect param; unvalidated `postMessage` origin.
- **fix**: `textContent`/`setAttribute` instead of `innerHTML`; Trusted Types; validate `event.origin`; URL allowlist for navigation (`http:`/`https:` only); DOMPurify.
- **OWASP**: A05 Injection (CWE-79).

### CSRF (Cross-Site Request Forgery)
- **what**: Victim's browser is tricked into sending a state-changing request to a site where it's authenticated; cookies ride along automatically.
- **find**: State-changing endpoint with no anti-CSRF token, cookie `SameSite=None` or missing, accepts `Content-Type: text/plain` or form-encoded, no Origin/Referer check. Build a PoC HTML form.
- **fix**: `SameSite=Lax`/`Strict` cookies; synchronizer or double-submit CSRF token; verify `Origin`/`Referer`; require custom header (`X-Requested-With`) + JSON content type; re-auth for sensitive actions.
- **OWASP**: A01 Broken Access Control (CWE-352).

### IDOR / BOLA (Insecure Direct Object Reference / Broken Object Level Authorization)
- **what**: Endpoint takes an object id and returns/modifies it without checking the caller owns it. `/api/orders/124`, `?user_id=`, `invoiceId` in body.
- **find**: Two accounts; swap ids across them (numeric, UUID, base64'd). Check every verb (GET, PUT, DELETE), GraphQL node ids, export endpoints, websockets. Autorize/AuthMatrix Burp extensions.
- **fix**: Ownership in the query (`WHERE id=$1 AND owner_id=$2`); centralized authZ middleware; return 404 not 403; unguessable ids help but are not the control.
- **OWASP**: A01 Broken Access Control (CWE-639, CWE-862).

### SSRF (Server-Side Request Forgery)
- **what**: Server fetches a URL the user controls → reach cloud metadata (`169.254.169.254`), internal admin panels, localhost services, `file://`.
- **find**: Any param that is a URL or hostname (webhooks, image fetch, PDF generators, import-from-URL, OAuth redirect fetch). Try internal IPs, decimal/octal IP encodings, DNS rebinding, `@` tricks, redirects from your own host, `gopher://`/`dict://`.
- **fix**: Scheme + host allowlist; block private/link-local/loopback after DNS resolution; disable redirects; IMDSv2 (session-token metadata); egress firewall; network segmentation.
- **OWASP**: A01 Broken Access Control (CWE-918). (Was its own A10 in 2021.)

### Open redirect
- **what**: `?next=`/`?returnUrl=` sends the user to an attacker domain after login — phishing, OAuth token theft via redirect chains.
- **find**: Redirect params; bypasses: `//evil.com`, `/\evil.com`, `https://trusted.com.evil.com`, `https://trusted.com@evil.com`, `javascript:` for DOM redirects.
- **fix**: Allow only relative paths or exact allowlisted origins; parse with `new URL(v, base)` and compare `origin`; map named routes instead of raw URLs.
- **OWASP**: A01 Broken Access Control (CWE-601).

### Path traversal (directory traversal)
- **what**: `../` in a filename param escapes the intended directory → read `/etc/passwd`, app source, `.env`; sometimes write.
- **find**: File params (download, image, template, lang). `..%2f`, `..%252f`, `....//`, null bytes in older stacks, absolute paths, Windows `..\`.
- **fix**: `path.resolve(root, input)` then assert `startsWith(root + sep)`; map ids → files instead of accepting names; `express.static` with `dotfiles: 'deny'`; chroot/containers.
- **OWASP**: A01 Broken Access Control (CWE-22).

### SQL injection (SQLi)
- **what**: Input concatenated into SQL changes the query — auth bypass (`' OR 1=1--`), data exfil (UNION), blind (boolean/time-based), stacked queries, out-of-band.
- **find**: `'`, `"`, `)` cause errors or behavior change; `' AND 1=1--` vs `' AND 1=2--`; `SLEEP(5)`/`pg_sleep(5)`; sqlmap. Review for template strings near `query(`, `raw(`, `$queryRaw`, ORDER BY params.
- **fix**: Parameterized queries / prepared statements everywhere (including ORDER BY via allowlist); ORM query builders; least-privilege DB user; no stacked queries.
- **OWASP**: A05 Injection (CWE-89).

### NoSQL injection (NoSQLi)
- **what**: JSON body passed into a Mongo query so `{ "password": { "$gt": "" } }` matches any value; `$where`/`$regex` for blind extraction; operator injection via query strings (`?user[$ne]=x`).
- **find**: Send objects where strings expected; `[$ne]`, `[$regex]` in query params (qs parsing); error messages mentioning BSON/operators.
- **fix**: Schema validation that enforces primitive types (zod/joi); strip `$`-prefixed keys (`mongo-sanitize`); never `$where`; parameterized query builders.
- **OWASP**: A05 Injection (CWE-943).

### Command injection
- **what**: User input in a shell command (`exec('convert ' + file)`) → `; curl evil | sh`, `$(...)`, backticks, `|`, `&&`.
- **find**: Features that shell out (image/PDF/video processing, ping/traceroute tools, git ops, zip). Time-based: `; sleep 5`. Review for `exec(`, `execSync(`, `spawn(..., { shell: true })`, `child_process` with string concat.
- **fix**: `execFile`/`spawn` with argv array and no shell; allowlist-validate args; use native libraries instead of CLIs; sandbox/least privilege.
- **OWASP**: A05 Injection (CWE-78).

### SSTI (Server-Side Template Injection)
- **what**: User input becomes part of the *template*, not the data → expression evaluation → often RCE (`{{7*7}}` → 49; Pug/EJS/Handlebars/Nunjucks escapes to `process`).
- **find**: Inject `{{7*7}}`, `${7*7}`, `<%= 7*7 %>`, `#{7*7}` in fields that end up in emails, PDFs, customizable messages. Polyglot: `${{<%[%'"}}%\`.
- **fix**: Templates are static files from the repo; user input only as data; logic-less templates; sandboxed engines where unavoidable.
- **OWASP**: A05 Injection (CWE-1336).

### Prototype pollution
- **what**: JS-specific. Attacker-controlled keys `__proto__`, `constructor.prototype` in a deep merge / `_.set` / query-string parser pollute `Object.prototype` → every object gains properties → authZ bypass (`isAdmin`), DoS, or RCE via gadgets (EJS, child_process options).
- **find**: JSON body `{"__proto__":{"polluted":1}}` then check behavior / `({}).polluted`; client-side: `?__proto__[x]=1` in URL parsers (DOM Invader). Review merge/extend/clone/set helpers, `qs` usage, older lodash.
- **fix**: Deny `__proto__`/`constructor`/`prototype` keys; `Object.create(null)` / `Map` for user-keyed data; `Object.freeze(Object.prototype)`; `--disable-proto=delete`; update libs; JSON schema validation.
- **OWASP**: A08 Software or Data Integrity Failures (CWE-1321).

### ReDoS (Regular expression Denial of Service)
- **what**: Regex with nested/overlapping quantifiers (`(a+)+$`, `(\w+\s?)*$`) backtracks exponentially on crafted input → CPU pinned, event loop blocked (Node is single-threaded — one request kills the server).
- **find**: Review regexes on user input (email, URL, markdown parsers); tools: `safe-regex`, `recheck`, `regexploit`; test with `'a'.repeat(30) + '!'`.
- **fix**: Rewrite without ambiguity; use RE2 (linear-time) for user-facing patterns; bound input length first; timeouts/worker threads for heavy parsing.
- **OWASP**: A10 Mishandling of Exceptional Conditions (CWE-1333) — resource exhaustion; historically A05/A06.

### JWT attacks
- **what**: (1) `alg: none` — library accepts unsigned token. (2) Key confusion — RS256 token re-signed as HS256 using the public key as the HMAC secret. (3) Weak secret — HS256 secret brute-forced offline (`hashcat -m 16500`). Also: `kid`/`jku` injection, no `exp`, accepting expired, not validating `aud`/`iss`.
- **find**: Decode on jwt.io; flip `alg`; try `none`/`None`/`nOnE`; crack with rockyou; check whether changing payload breaks things; look for `jwt.decode()` used instead of `verify()`.
- **fix**: Pin `algorithms: ['RS256']` (or EdDSA) in verify; use `jose`; 256-bit random secrets for HMAC; validate `exp`, `aud`, `iss`; short TTL + refresh rotation; key ids from a fixed JWKS, never from a URL in the token.
- **OWASP**: A04 Cryptographic Failures (CWE-347) / A07 Authentication Failures / A08 Integrity.

### Clickjacking (UI redress)
- **what**: Attacker frames your page in an invisible iframe over a decoy so clicks land on your buttons (change email, approve payment, enable camera).
- **find**: Load the target in an `<iframe>` from another origin; no `X-Frame-Options` and no CSP `frame-ancestors`. Check sensitive one-click actions.
- **fix**: `Content-Security-Policy: frame-ancestors 'none'` (or specific origins); `X-Frame-Options: DENY` for legacy; `SameSite` cookies reduce impact; confirmation steps.
- **OWASP**: A02 Security Misconfiguration (CWE-1021).

### CORS misconfiguration
- **what**: `Access-Control-Allow-Origin` reflects the request `Origin` (or allows `null`, or regex-matches `evil-example.com`) together with `Access-Control-Allow-Credentials: true` → any site can read authenticated API responses.
- **find**: Send `Origin: https://evil.com`, `Origin: null`, `Origin: https://target.com.evil.com`, `Origin: https://eviltarget.com`; inspect ACAO/ACAC in response. Pre-flight bypass with "simple" requests.
- **fix**: Exact-match allowlist; never reflect; never `*` with credentials; `Vary: Origin`; don't allow `null`.
- **OWASP**: A01 Broken Access Control (CWE-942) / A02 Misconfiguration.

### Subdomain takeover
- **what**: DNS record (CNAME) points at a deprovisioned external service (Heroku, S3, GitHub Pages, Azure) — attacker claims the resource and now serves content on `app.target.com`: cookie theft (parent-domain cookies), CORS/CSP bypass, phishing.
- **find**: Enumerate subdomains (subfinder, amass, crt.sh); resolve; look for provider "not found" fingerprints (can-i-take-over-xyz list); `dig CNAME`.
- **fix**: Delete DNS records when decommissioning; DNS as code with ownership checks; monitor for dangling records; service-side domain verification.
- **OWASP**: A02 Security Misconfiguration (CWE-284 / CWE-1104).

### Race conditions
- **what**: Concurrent requests exploit a check-then-act gap (TOCTOU): redeem a coupon N times, withdraw beyond balance, bypass one-time-use tokens, exceed rate limits, duplicate signups.
- **find**: Burp Turbo Intruder / Repeater "send group in parallel" (single-packet attack); 20 identical requests at once against any limited action; watch for >1 success.
- **fix**: Atomic DB operations (`UPDATE ... WHERE balance >= $1`, unique constraints); transactions with proper isolation / `SELECT ... FOR UPDATE`; idempotency keys; per-key locks/queues.
- **OWASP**: A06 Insecure Design (CWE-362, CWE-367) / A10 Mishandling of Exceptional Conditions.

### Mass assignment
- **what**: Framework binds request body straight onto a model, so extra fields are accepted: `{"email":"x","role":"admin","isVerified":true,"balance":9999}`.
- **find**: Add plausible fields from API responses/docs to create/update requests; check GraphQL mutations; look for `Object.assign(user, req.body)`, `Model.create(req.body)`, `new User(req.body)`.
- **fix**: Explicit DTO / allowlist of writable fields per endpoint; schema validation with `additionalProperties: false`; separate admin-only fields into different endpoints.
- **OWASP**: A01 Broken Access Control (CWE-915) / A06 Insecure Design.

### Insecure deserialization
- **what**: Untrusted serialized data reconstructed into objects → gadget chains → RCE (Java `ObjectInputStream`, PHP `unserialize`, Python `pickle`, Node `node-serialize`, `eval`-based parsers, YAML `!!js/function`).
- **find**: Base64 blobs in cookies/params that decode to serialized structures (`rO0AB`, `O:8:`, `_$$ND_FUNC$$_`); `eval(`, `new Function(`, `vm.runIn*` on input; YAML `load` without safe schema.
- **fix**: JSON.parse + schema validation only; never eval; safe loaders (`yaml.load` with `JSON_SCHEMA`); sign serialized blobs (HMAC) if they must round-trip; type allowlists.
- **OWASP**: A08 Software or Data Integrity Failures (CWE-502).

### XXE (XML External Entity)
- **what**: XML parser resolves external entities → read local files (`<!ENTITY xxe SYSTEM "file:///etc/passwd">`), SSRF, DoS (billion laughs), out-of-band exfil.
- **find**: Any XML input (SOAP, SAML, RSS, SVG upload, DOCX/XLSX, sitemap import). Inject a DOCTYPE with an external entity; use Burp Collaborator for blind.
- **fix**: Disable DTDs / external entities in the parser (`libxmljs`: `noent: false`, `dtdload: false`; Java: `disallow-doctype-decl`); prefer JSON; validate uploads; SAML libs kept current.
- **OWASP**: A02 Security Misconfiguration (CWE-611) / A05 Injection.

### HTTP request smuggling
- **what**: Front-end proxy and back-end server disagree on request boundaries (`Content-Length` vs `Transfer-Encoding`, or HTTP/2 downgrade) → attacker's prefix attaches to the next user's request: cache poisoning, auth bypass, response queue poisoning, steal other users' requests.
- **find**: CL.TE / TE.CL / TE.TE timing probes; Burp HTTP Request Smuggler extension; H2.CL / H2.TE with HTTP/2 front-ends.
- **fix**: Same HTTP parser/normalization front and back; HTTP/2 end-to-end; reject ambiguous requests (both CL and TE); keep proxies patched; disable connection reuse to back-end if needed.
- **OWASP**: A02 Security Misconfiguration / A05 Injection (CWE-444).

### Business logic flaws
- **what**: App works as coded but the rules can be abused: negative quantities, price in request, skipping payment step, coupon stacking, referral self-loops, changing currency mid-checkout, trial reset by email alias.
- **find**: Map the flow end-to-end; tamper every value and step order; think "what did the PM not consider?"; replay steps; use two accounts.
- **fix**: Server-side invariants in one place (totals ≥ 0, qty bounds, state machine for flows); server as source of truth for prices; idempotency; threat model + abuse cases before build.
- **OWASP**: A06 Insecure Design (CWE-840).

### Secrets in client bundles / repos
- **what**: API keys, JWT secrets, cloud creds, internal URLs shipped in JS bundles, source maps, `.env` in repo, git history, Docker layers, mobile apps.
- **find**: `curl` the bundle and grep `AKIA`, `sk_live`, `xox[bp]-`, `-----BEGIN`; source maps (`.map`); TruffleHog/gitleaks on repo + history; `/.env`, `/.git/config` exposed; `NEXT_PUBLIC_`/`VITE_` prefixed vars that shouldn't be public.
- **fix**: Secrets only server-side via env/KMS; pre-commit + CI secret scanning; rotate on leak (history is forever); backend-for-frontend proxies for third-party APIs; strip source maps in prod or restrict access.
- **OWASP**: A04 Cryptographic Failures (CWE-798) / A02 Security Misconfiguration.

### Rate-limit bypass
- **what**: Limiter keyed on something attacker controls — `X-Forwarded-For`, email case/`+alias`, trailing dot/space, Unicode normalization, different endpoint for same action (REST vs GraphQL, v1 vs v2), path `/login/` vs `/login`, HTTP method switch, IPv6 rotation.
- **find**: Hit the limit, then vary headers/path/case/encoding/verb; try the mobile API; use many IPs (cloud); check if the limit is per-session rather than per-account.
- **fix**: Key on authenticated identity + normalized input + real client IP (trust only your proxy's header); limit at the gateway AND the service; apply to every route variant; lockout + CAPTCHA/step-up escalation; monitor for distributed patterns.
- **OWASP**: A07 Authentication Failures (CWE-307) / A06 Insecure Design (CWE-799).
