// Gate 6 — the verification ledger. Every page except T-SEARCH/T-404 needs an entry in
// content/verification.json ({ url: { date, who, docs[], exec, changes[] | note } }) and a
// matching row in qa/VERIFICATION.md. With DTC_DEV=1 the gaps are warnings so the suite is
// usable while the verification pass is in progress; without it they fail.
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');
const { parseRegistry } = require('../registry');
const L = require('./lib');

const g = L.gate('verification');
const reg = parseRegistry();
const file = path.join(S.CONTENT, 'verification.json');
const ledgerFile = path.join(S.QA, 'VERIFICATION.md');
const ver = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
const ledger = fs.existsSync(ledgerFile) ? fs.readFileSync(ledgerFile, 'utf8') : '';
const need = reg.pages.filter((p) => !['T-SEARCH', 'T-404'].includes(p.template));
const missing = [];

for (const p of need) {
  const v = ver[p.url];
  if (!v) { missing.push(p.url); continue; }
  g.check(/^\d{4}-\d{2}-\d{2}$/.test(v.date || ''), `${p.url}: verification date must be YYYY-MM-DD`);
  g.check(typeof v.who === 'string' && v.who.length > 0, `${p.url}: verification "who" missing`);
  g.check(Array.isArray(v.docs) && v.docs.every((d) => /^https?:\/\//.test(d)), `${p.url}: docs[] must be absolute URLs`);
  g.check(['ran', 'not run', 'n/a'].includes(v.exec), `${p.url}: exec must be "ran" | "not run" | "n/a" (got ${JSON.stringify(v.exec)})`);
  g.check(ledger.includes(p.url), `${p.url}: no row in qa/VERIFICATION.md`);
}
for (const u of Object.keys(ver)) g.check(!!reg.byUrl[u], `verification.json has an entry for a non-page: ${u}`);

if (missing.length) {
  const msg = `${missing.length}/${need.length} pages have no verification entry (first: ${missing.slice(0, 4).join(', ')})`;
  if (L.DEV) g.warn(msg + ' — allowed under DTC_DEV=1'); else g.fail(msg);
}
g.done(`${need.length - missing.length}/${need.length} pages verified`);
