const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 31803;
const PUBLIC = path.join(__dirname, 'public');
const RAW_SRC = path.join(PUBLIC, 'assets', 'src') + path.sep;

// Group segments are not pages: they 301 to the section landing anchor.
// (See SITEMAP-AND-USER-STORIES.md › Counting rules.)
let groupRedirects = {};
try {
  groupRedirects = JSON.parse(fs.readFileSync(path.join(PUBLIC, 'redirects.json'), 'utf8'));
} catch (e) {
  groupRedirects = {};
}

app.disable('x-powered-by');

// ── Security headers ──────────────────────────────────────────────────────────
// The one inline script every page carries (build/render/layout.js) — hashed so the page
// policy can say script-src 'self' without 'unsafe-inline'. The registry gate fails the
// build if any other inline script, iframe, event-handler attribute or javascript: URL
// appears in public/, so this hash is the complete allow-list.
const INLINE_BOOT = "document.documentElement.classList.add('js')";
const INLINE_BOOT_HASH = `'sha256-${crypto.createHash('sha256').update(INLINE_BOOT).digest('base64')}'`;
const PAGE_CSP = [
  "default-src 'self'",
  `script-src 'self' ${INLINE_BOOT_HASH}`,
  // Shiki paints tokens with style="color:…" attributes, and app.js builds the drawer tree
  // with one inline style. Elements (<style>) stay locked to self-hosted stylesheets.
  "style-src 'self'",
  "style-src-attr 'unsafe-inline'",
  "img-src 'self' data:",   // data: for the film-grain SVG in styles.css
  "font-src 'self'",
  "connect-src 'self'",     // search index + runner sources
  "worker-src 'self'",      // /worker.js
  "frame-src 'self' https://www.youtube-nocookie.com", // Technology Explained players only
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');
// A dedicated worker takes its policy from its own response, not from the page. The runner
// compiles learner files with `new AsyncFunction`, which is the only reason 'unsafe-eval'
// appears anywhere — and it is scoped to this one file.
const WORKER_CSP = "default-src 'none'; script-src 'unsafe-eval'; connect-src 'none'";

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', req.path === '/worker.js' ? WORKER_CSP : req.path.startsWith('/explained/') ? PAGE_CSP : PAGE_CSP.replace(' https://www.youtube-nocookie.com', ''));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  // Strict-Transport-Security is deliberately not set here: it belongs on the TLS terminator
  // in front of this port, once the hostname is served over HTTPS.
  next();
});

// A response-level sandbox also applies when this URL is opened directly. No
// allow-same-origin: the frame and its blob worker have an opaque origin.
app.get('/sandbox/runner', (req, res) => {
  const runtime = fs.readFileSync(path.join(PUBLIC, 'sandbox-runtime.js'), 'utf8');
  const css = fs.readFileSync(path.join(PUBLIC, 'sandbox.css'), 'utf8');
  const hash = text => "'sha256-" + crypto.createHash('sha256').update(text).digest('base64') + "'";
  res.setHeader('Content-Security-Policy', [
    "default-src 'none'", `script-src ${hash(runtime)} blob: 'unsafe-eval'`,
    `style-src ${hash(css)}`, "style-src-attr 'unsafe-inline'", "img-src data:",
    "connect-src 'none'", "worker-src blob:", "frame-src 'none'",
    "object-src 'none'", "base-uri 'none'", "form-action 'none'",
    "frame-ancestors 'self'", "sandbox allow-scripts"
  ].join('; '));
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), clipboard-read=(), clipboard-write=()');
  res.setHeader('Cache-Control', 'no-store');
  res.type('html').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Isolated lesson example</title><style>${css}</style></head><body><script>${runtime}</script></body></html>`);
});

// ── Request log (production only) ─────────────────────────────────────────────
// Morgan, with the query string left off. The search box puts the learner's words in ?q=,
// and the stock formats log req.originalUrl. pm2 writes stdout to ~/.pm2/logs.
morgan.token('pathonly', (req) => String(req.path || '/').slice(0, 300));
morgan.token('ua', (req) => String(req.headers['user-agent'] || '-').replace(/[\r\n"]/g, '').slice(0, 120));
if (process.env.NODE_ENV === 'production') {
  app.use(morgan(':date[iso] :method :pathonly :status :response-time ms ":ua"'));
}

app.use((req, res, next) => {
  const clean = req.path.length > 1 && req.path.endsWith('/') ? req.path : req.path + '/';
  if (groupRedirects[clean]) return res.redirect(301, groupRedirects[clean]);
  next();
});

// Pages are directories with index.html, so clean URLs need no extension fallback —
// and with one, /404 would serve 404.html with a 200.
app.use(express.static(PUBLIC, {
  maxAge: '1h',
  setHeaders(res, filePath) {
    if (/\.(png|jpe?g|webp|svg|mp4|ttf|woff2|gif)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    if (/\.(html)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
    if (/\.txt$/i.test(filePath)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
    // /assets/src/ holds verbatim source copies for "view raw" links, the in-browser runner
    // and the copy-node command. They are text to read, never documents to render — served
    // as plain text (with nosniff above) so a .html or .svg copy cannot execute anything.
    if (filePath.startsWith(RAW_SRC) || filePath === path.join(PUBLIC, 'worker.js')) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    }
  }
}));

// Clean URL without trailing slash → canonical trailing-slash form
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (path.extname(req.path)) return next();
  if (req.path.endsWith('/')) return next();
  const candidate = path.join(PUBLIC, req.path, 'index.html');
  if (fs.existsSync(candidate)) return res.redirect(301, req.path + '/' + (req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''));
  next();
});

// 404: same design, real status code
app.use((req, res) => {
  res.status(404);
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') return res.end();
  res.sendFile(path.join(PUBLIC, '404.html'));
});

// Last resort: Express's default handler would render its own HTML (with a stack trace unless
// NODE_ENV=production). Log it server-side and answer with the site's page and a 500.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`${new Date().toISOString()} error on ${req.method} ${req.path}:`, err && err.stack || err);
  if (res.headersSent) return res.end();
  res.status(err && err.status >= 400 && err.status < 600 ? err.status : 500);
  res.sendFile(path.join(PUBLIC, '404.html'), (e) => { if (e) res.end(); });
});

app.listen(PORT, () => {
  console.log(`${require('./build/site.config').name} running on http://localhost:${PORT}`);
});
