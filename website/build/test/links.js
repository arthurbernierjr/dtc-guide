// Gate 2 — links. Every internal href/src on every page must resolve to a file in public/
// (or a registered group redirect); every in-page #anchor must exist; <img> must have alt.
// External links are counted, not fetched (no network in the gate).
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');
const L = require('./lib');

const g = L.gate('links');
const pages = L.listPages();
const redirects = JSON.parse(fs.readFileSync(path.join(S.PUBLIC, 'redirects.json'), 'utf8'));
const ext = new Set();
let internal = 0;

function resolves(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return true;
  if (redirects[clean]) return true;
  const rel = decodeURIComponent(clean).replace(/^\//, '');
  const abs = path.join(S.PUBLIC, rel);
  if (clean.endsWith('/')) return fs.existsSync(path.join(abs, 'index.html'));
  if (fs.existsSync(abs)) return true;
  // Extensionless path: accept a directory with index.html.
  return fs.existsSync(path.join(abs, 'index.html'));
}

for (const p of pages) {
  const html = fs.readFileSync(p.file, 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const urls = [...html.matchAll(/<(a|img|script|link|source|video|iframe|use)\b[^>]*?\b(?:href|src|data-src|poster)="([^"]*)"/g)];
  for (const [, tag, raw] of urls) {
    const u = L.decode(raw).trim();
    if (!u || u.startsWith('mailto:') || u.startsWith('tel:') || u.startsWith('data:') || u.startsWith('javascript:')) continue;
    if (/^https?:\/\//i.test(u)) { ext.add(u); continue; }
    if (u.startsWith('#')) {
      const id = u.slice(1);
      if (id) g.check(ids.has(id), `${p.url} anchor #${id} has no element`);
      continue;
    }
    if (u.startsWith('//')) { g.fail(`${p.url} protocol-relative url ${u}`); continue; }
    internal++;
    let target = u;
    if (!u.startsWith('/')) target = path.posix.join(p.url, u); // relative link
    g.check(resolves(target), `${p.url} → ${u} does not resolve`);
    if (target.includes('#') && target.split('#')[0].startsWith('/')) {
      const [tp, frag] = target.split('#');
      const tfile = tp.endsWith('/') ? path.join(S.PUBLIC, tp, 'index.html') : path.join(S.PUBLIC, tp);
      if (frag && fs.existsSync(tfile) && tfile.endsWith('.html')) {
        const th = fs.readFileSync(tfile, 'utf8');
        g.check(new RegExp(`\\bid="${frag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}"`).test(th), `${p.url} → ${target}: anchor missing on target`);
      }
    }
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) g.check(/\balt="/.test(m[0]), `${p.url} <img> without alt: ${m[0].slice(0, 80)}`);
  // Canonical + og:url must be this page.
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  g.check(canon && canon.endsWith(p.url === '/404.html' ? '/404.html' : p.url), `${p.url} canonical is ${canon}`);
}

// An existing SVG can still fail to render if its XML is not valid UTF-8.
const diagramDir = path.join(S.PUBLIC, 'assets', 'diagrams');
for (const file of fs.readdirSync(diagramDir).filter(file => file.endsWith('.svg'))) {
  try {
    const xml = new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(path.join(diagramDir, file)));
    g.check(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(xml), `diagram ${file} contains invalid XML control characters`);
  }
  catch { g.fail(`diagram ${file} contains invalid UTF-8`); continue; }
  g.check(true, `diagram ${file} is valid UTF-8`);
}

// Known-bad hosts never appear in an href.
const DEAD = /(media\.git\.generalassemb\.ly|repl\.it|herokuapp\.com)/i;
for (const u of ext) g.check(!DEAD.test(u), `external link to a dead/retired host: ${u}`);

g.done(`${pages.length} pages · ${internal} internal urls · ${ext.size} distinct external urls (not fetched)`);
