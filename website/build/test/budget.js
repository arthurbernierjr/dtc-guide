// Gate 7 — budgets and self-containment. The home page HTML is < 60 KB; no page loads a
// script, stylesheet, font, image, iframe or video from another origin (everything is
// self-hosted — the only external references allowed are plain <a href> links and the
// canonical/og URLs); styles.css and the fonts referenced by it exist.
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');
const L = require('./lib');

const g = L.gate('budget');
const pages = L.listPages();
const HOME_BUDGET = 60 * 1024;
const PAGE_SOFT = 300 * 1024;

const home = pages.find((p) => p.url === '/');
const homeBytes = fs.statSync(home.file).size;
g.check(homeBytes < HOME_BUDGET, `home HTML is ${(homeBytes / 1024).toFixed(1)} KB (budget 60 KB)`);

let largest = { url: '', bytes: 0 };
for (const p of pages) {
  const html = fs.readFileSync(p.file, 'utf8');
  const bytes = Buffer.byteLength(html);
  if (bytes > largest.bytes) largest = { url: p.url, bytes };
  if (bytes > PAGE_SOFT) g.warn(`${p.url} is ${(bytes / 1024).toFixed(0)} KB (soft limit 300 KB)`);
  // Resource-loading tags only; <a> is allowed to point anywhere.
  for (const m of html.matchAll(/<(script|link|img|iframe|video|audio|source|embed|object)\b[^>]*>/g)) {
    const tag = m[0];
    if (/^<link\b/.test(tag) && /rel="(canonical|alternate|license|me|author)"/.test(tag)) continue;
    const url = (tag.match(/\b(?:src|href|poster|data)="([^"]+)"/) || [])[1] || '';
    g.check(!/^(https?:)?\/\//i.test(url), `${p.url} loads an external resource: ${tag.slice(0, 120)}`);
  }
  for (const m of html.matchAll(/<meta property="og:image" content="([^"]+)"/g)) g.check(/^https?:\/\/[^/]+\/assets\//.test(m[1]) || m[1].startsWith('/assets/'), `${p.url} og:image is not a self-hosted asset: ${m[1]}`);
  for (const m of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) g.check(m[1].length <= 2048, `${p.url} has an inline script of ${m[1].length} bytes (max 2 KB)`);
}

// CSS: exists, self-hosted fonts referenced by it exist, no remote url().
const css = fs.readFileSync(path.join(S.PUBLIC, 'styles.css'), 'utf8');
for (const m of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
  const u = m[1];
  g.check(!/^(https?:)?\/\//i.test(u), `styles.css references a remote url(): ${u}`);
  if (u.startsWith('/')) g.check(fs.existsSync(path.join(S.PUBLIC, u.split('?')[0])), `styles.css url() target missing: ${u}`);
}
// DESIGN-REFERENCE §1: no pure white anywhere in the palette.
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
g.check(!/#fff\b|#ffffff\b|[:\s,(]white[\s;,)]/i.test(cssNoComments), 'styles.css uses pure white (#fff / white) as a colour; the palette tops out at --text');

g.done(`home ${(homeBytes / 1024).toFixed(1)} KB · largest page ${largest.url} ${(largest.bytes / 1024).toFixed(0)} KB · styles.css ${(Buffer.byteLength(css) / 1024).toFixed(0)} KB`);
