// ─────────────────────────────────────────────────────────────────────────────
// A04:2025  CRYPTOGRAPHIC FAILURES                        (2021: A02 same name, down from #2)
// ─────────────────────────────────────────────────────────────────────────────
// WHAT    : Sensitive data exposed because crypto is missing, weak, or misused
//           — in transit, at rest, or in how secrets/keys are handled.
// HAPPENS : plaintext passwords; MD5/SHA1 (fast hash) for passwords; no salt;
//           hardcoded keys in repo; AES-ECB (pattern leakage); static/predictable
//           IV; Math.random() for tokens; HTTP instead of TLS / TLS 1.0;
//           JWT `alg: none` or HS256 verified with the RSA public key; custom
//           crypto; non-constant-time compare; secrets in logs/URLs.
// SPOT    : createHash('md5'|'sha1') near 'password'; Math.random() near
//           'token'|'reset'|'session'; createCipheriv with fixed iv or 'ecb';
//           `===` on HMACs/tokens; `jwt.decode` without `verify`; KEY = '...'
//           literal; http:// URLs for APIs.
// FIX     : passwords: argon2id / bcrypt / scrypt (slow, salted, memory-hard);
//           tokens: crypto.randomBytes / randomUUID; compare: timingSafeEqual;
//           symmetric: AES-256-GCM with fresh random 12-byte IV + auth tag;
//           integrity: HMAC-SHA256; keys from KMS/env, rotated; TLS 1.2+ with
//           HSTS; JWT: pin algorithm allowlist, verify before trust.
// SAY     : CWE-327 Broken/Risky Crypto Algorithm, CWE-328 Reversible One-Way
//           Hash, CWE-330 Insufficiently Random Values, CWE-798 Hardcoded
//           Credentials, CWE-319 Cleartext Transmission, CWE-208 Timing
//           Discrepancy. AEAD, KDF, nonce/IV, salt, pepper, key rotation.
//           Pitch: "Don't roll your own; use AEAD, a real KDF, CSPRNG,
//           constant-time compares, and keep keys out of code."
// ─────────────────────────────────────────────────────────────────────────────
'use strict';
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

// ── 0. Three jobs, three tools
// If you came from Session 1.4: three different questions get called "crypto". Pick the job first,
// then the tool. Each row below runs once in code right after the table.
//
//   Job                        Tool                       Input              Output
//   hide data                  AES-256-GCM (encryption)   plaintext + key    ciphertext; the same key reverses it
//   check it was not altered   HMAC-SHA256                message + key      a short tag you compare; change one
//                                                                            byte of the message and the tag changes
//   store a password           slow salted hash           password           a hash you can only check, never
//                              (scrypt here, argon2id                        reverse; the password is not in it
//                              in production)
//
// The SSH key pair from 1.4 does the middle job with two keys instead of one: your private key makes the
// tag, the public key checks it, so the public key proves who you are. That is the signature job.
const jobKey = crypto.randomBytes(32);                                   // one 256-bit secret for the demos below

// hide data: encrypt, then decrypt with the same key and get the exact text back
const jobIv = crypto.randomBytes(12);
const hider = crypto.createCipheriv('aes-256-gcm', jobKey, jobIv);
const hidden = Buffer.concat([hider.update('meet at the north gate', 'utf8'), hider.final()]);
const hiddenTag = hider.getAuthTag();
assert.equal(hidden.toString('utf8').includes('north gate'), false);    // ciphertext does not contain the words
const opener = crypto.createDecipheriv('aes-256-gcm', jobKey, jobIv);
opener.setAuthTag(hiddenTag);
assert.equal(Buffer.concat([opener.update(hidden), opener.final()]).toString('utf8'), 'meet at the north gate');  // reversible

// check it was not altered: same message + same key = same tag; one byte changed = different tag
const tagFor = (message) => crypto.createHmac('sha256', jobKey).update(message).digest('hex');
assert.equal(tagFor('pay 100 gold'), tagFor('pay 100 gold'));
assert.notEqual(tagFor('pay 100 gold'), tagFor('pay 900 gold'));        // '1' became '9': the tag no longer matches

// store a password: the hash verifies the password, contains no trace of it, and cannot be turned back into it
const jobSalt = crypto.randomBytes(16);
const pwHash = crypto.scryptSync('open sesame', jobSalt, 32);
assert.equal(pwHash.includes(Buffer.from('open sesame')), false);        // the password is not inside the hash
assert.equal(crypto.timingSafeEqual(crypto.scryptSync('open sesame', jobSalt, 32), pwHash), true);   // right password checks out
assert.equal(crypto.timingSafeEqual(crypto.scryptSync('open sesamE', jobSalt, 32), pwHash), false);  // one letter off fails

// ── 1. Password storage: slow salted KDF (scrypt built-in; argon2id / bcrypt via libs)
// VULNERABLE:
//   db.users.insert({ email, password });                                  // plaintext
//   db.users.insert({ email, password: md5(password) });                   // rainbow tables, GPU 10^10/s
//   db.users.insert({ email, password: sha256(password) });                // still fast, unsalted
// FIXED:
const SCRYPT = { N: 2 ** 14, r: 8, p: 1, keylen: 64 };
function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, SCRYPT.keylen, SCRYPT);
  return `scrypt$${SCRYPT.N}$${salt.toString('base64')}$${hash.toString('base64')}`;
}
function verifyPassword(password, stored) {
  const [algo, n, saltB64, hashB64] = stored.split('$');
  if (algo !== 'scrypt') return false;
  const expected = Buffer.from(hashB64, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length, { ...SCRYPT, N: Number(n) });
  return crypto.timingSafeEqual(actual, expected);   // constant-time, not ===
}
const stored = hashPassword('correct horse battery staple');
assert.equal(verifyPassword('correct horse battery staple', stored), true);
assert.equal(verifyPassword('wrong', stored), false);
assert.notEqual(hashPassword('same'), hashPassword('same'));   // unique salt per user
assert.equal(stored.includes('correct horse'), false);

// ── 2. Random tokens: CSPRNG, never Math.random()
// VULNERABLE:
//   const resetToken = Math.random().toString(36).slice(2);   // predictable PRNG, ~50 bits, seedable
//   const sessionId = Date.now() + userId;                    // guessable
// FIXED:
function newToken(bytes = 32) { return crypto.randomBytes(bytes).toString('base64url'); }
const t1 = newToken();
assert.equal(Buffer.from(t1, 'base64url').length, 32);        // 256 bits of entropy
assert.notEqual(t1, newToken());
assert.match(crypto.randomUUID(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

// ── 3. Constant-time comparison
// VULNERABLE:
//   if (providedToken === storedToken) ...   // early-exit on first mismatched byte => timing oracle
// FIXED:
function safeEqual(a, b) {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;                   // length leak acceptable; use HMAC of both to hide
  return crypto.timingSafeEqual(ab, bb);
}
assert.equal(safeEqual('abc123', 'abc123'), true);
assert.equal(safeEqual('abc123', 'abc124'), false);
assert.equal(safeEqual('abc', 'abcd'), false);

// ── 4. Symmetric encryption: AES-256-GCM, random IV, auth tag (AEAD)
// VULNERABLE:
//   crypto.createCipheriv('aes-256-ecb', key, null)              // ECB: identical blocks => identical ciphertext
//   crypto.createCipheriv('aes-256-cbc', key, Buffer.alloc(16))  // fixed IV; no integrity => padding oracle
//   const KEY = 'supersecretkey1234567890abcdef12';              // hardcoded in repo
// FIXED:
const key = crypto.randomBytes(32);   // from KMS / env in real life, never a literal
function encrypt(plaintext, k, aad = '') {
  const iv = crypto.randomBytes(12);                             // 96-bit nonce, unique per message
  const cipher = crypto.createCipheriv('aes-256-gcm', k, iv);
  cipher.setAAD(Buffer.from(aad));
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return { iv: iv.toString('base64'), ct: ct.toString('base64'), tag: cipher.getAuthTag().toString('base64') };
}
function decrypt({ iv, ct, tag }, k, aad = '') {
  const decipher = crypto.createDecipheriv('aes-256-gcm', k, Buffer.from(iv, 'base64'));
  decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ct, 'base64')), decipher.final()]).toString('utf8');
}
const msg = 'card=4111111111111111';
const box = encrypt(msg, key, 'user:42');
assert.equal(decrypt(box, key, 'user:42'), msg);
assert.notEqual(encrypt(msg, key).ct, encrypt(msg, key).ct);   // random IV => no pattern leakage
const tampered = { ...box, ct: Buffer.from(Buffer.from(box.ct, 'base64').map((b, i) => (i === 0 ? b ^ 1 : b))).toString('base64') };
assert.throws(() => decrypt(tampered, key, 'user:42'), /auth|Unsupported state/i);   // tag detects bit-flip
assert.throws(() => decrypt(box, key, 'user:43'));                                   // AAD mismatch
assert.throws(() => decrypt(box, crypto.randomBytes(32), 'user:42'));                // wrong key

// ── 5. HMAC for integrity (signed cookies, webhooks, tokens)
// VULNERABLE: cookie = base64(JSON({ uid: 1, role: 'admin' }))   // client edits role
// FIXED:
const hmacKey = crypto.randomBytes(32);
function sign(payload, k) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', k).update(body).digest('base64url');
  return `${body}.${mac}`;
}
function verify(token, k) {
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = crypto.createHmac('sha256', k).update(body).digest('base64url');
  if (!safeEqual(mac, expected)) return null;
  return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
}
const tok = sign({ uid: 1, role: 'user' }, hmacKey);
assert.deepEqual(verify(tok, hmacKey), { uid: 1, role: 'user' });
const forgedBody = Buffer.from(JSON.stringify({ uid: 1, role: 'admin' })).toString('base64url');
assert.equal(verify(`${forgedBody}.${tok.split('.')[1]}`, hmacKey), null);
assert.equal(verify(tok, crypto.randomBytes(32)), null);

// ── 6. JWT `alg: none` / algorithm confusion (shape of the check; use jose/jsonwebtoken in real code)
// VULNERABLE: jwt.verify(token, publicKey)  with no { algorithms: [...] }  -> attacker sets alg=HS256, signs with public key
// FIXED: const payload = jwt.verify(token, key, { algorithms: ['RS256'] });   // allowlist; never trust header.alg
function headerAlgAllowed(token, allowed) {
  const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString('utf8'));
  return allowed.includes(header.alg);
}
const noneTok = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url') + '.e30.';
assert.equal(headerAlgAllowed(noneTok, ['RS256']), false);

console.log('ok: owasp/a04-cryptographic-failures.js');
