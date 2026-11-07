// Gate 5 — search-index.json: exactly one entry per registry page (226), every entry has a
// non-empty title, section, url that resolves, and a template; T-PREP entries carry SAY terms
// (G13). The index must also build in MiniSearch and answer a few known queries.
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');
const { parseRegistry } = require('../registry');
const L = require('./lib');

const g = L.gate('search');
const reg = parseRegistry();
const idx = JSON.parse(fs.readFileSync(path.join(S.PUBLIC, 'search-index.json'), 'utf8'));

g.check(idx.length === reg.total, `index has ${idx.length} entries, registry ${reg.total}`);
const seen = new Set();
for (const e of idx) {
  g.check(typeof e.title === 'string' && e.title.trim().length > 0, `${e.url}: empty title`);
  g.check(typeof e.section === 'string' && e.section.length > 0, `${e.url}: empty section`);
  g.check(!!reg.byUrl[e.url], `${e.url}: not a registry page`);
  g.check(!seen.has(e.url), `${e.url}: duplicate entry`); seen.add(e.url);
  g.check(Array.isArray(e.headings), `${e.url}: headings missing`);
  const p = reg.byUrl[e.url];
  if (p && p.template === 'T-PREP' && p.headerKeys && p.headerKeys.includes('SAY')) g.check(typeof e.say === 'string' && e.say.length > 0, `${e.url}: T-PREP entry has no SAY terms`);
  g.check(typeof e.text === 'string' && e.text.length <= 320, `${e.url}: text snippet missing or > 320 chars`);
}
for (const p of reg.pages) g.check(seen.has(p.url), `${p.url} (${p.id}) missing from the index`);

// Build the index with the vendored MiniSearch (same file the browser loads) and probe it.
const miniPath = path.join(S.PUBLIC, 'vendor', 'minisearch.min.js');
g.check(fs.existsSync(miniPath), 'public/vendor/minisearch.min.js missing');
if (fs.existsSync(miniPath)) {
  const MiniSearch = require(miniPath);
  const ms = new MiniSearch({ fields: ['title', 'headings', 'say', 'text', 'section'], storeFields: ['title', 'url', 'section'], idField: 'url', searchOptions: { boost: { title: 4, say: 3, headings: 2 }, prefix: true, fuzzy: 0.2 } });
  ms.addAll(idx.map((e) => ({ ...e, headings: (e.headings || []).join(' ') })));
  const probes = [
    ['big o', '/algorithms/analysis/big-o/'],
    ['palindrome', '/practice/algocasts/palindrome/'],
    ['django routing', '/languages/python/routing/'],
    ['sliding window', '/algorithms/patterns/sliding-window/'],
    ['imposter', '/mindset/knowing-what-you-are-talking-about/'],
    ['injection', '/security/'],
  ];
  for (const [q, want] of probes) {
    const hits = ms.search(q).slice(0, 5).map((h) => h.url);
    g.check(hits.some((u) => u.startsWith(want)), `query "${q}" top-5 ${JSON.stringify(hits)} does not include ${want}`);
  }
}
g.done(`${idx.length} entries · ${Math.round(fs.statSync(path.join(S.PUBLIC, 'search-index.json')).size / 1024)} KB`);
