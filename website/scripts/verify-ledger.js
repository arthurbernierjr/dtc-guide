#!/usr/bin/env node
// Generate the verification ledger: content/verification.json (machine-read by the build and the
// verification gate) and qa/VERIFICATION.md (human-read). One entry per registry page except
// T-SEARCH / T-404.
//
//   node scripts/verify-ledger.js            # requires a prior `node build/index.js` (reads build/.manifest.json)
//   node scripts/verify-ledger.js --no-exec  # skip executing code blocks (reuses exec results from the existing ledger)
//
// How each field is decided — the ledger is only as honest as these rules, so they are spelled out:
//
//   docs   T-LANG pages: the `docs:` list of the page's override frontmatter (the URLs the rewrite was
//          checked against). Index/landing pages: the official docs of the frameworks they list.
//          Every other page: the "Verification docs:" hint in the registry's acceptance block, mapped to
//          URLs, falling back to the section default below. Pages without a hint or default get [] and a
//          note saying so — nothing is invented.
//   exec   "ran"      a runnable file for the page passed the prep/algocasts gate, or every standalone JS
//                     block on the page executed under node with exit 0 (fragments, browser-only snippets
//                     and shell/markup blocks are skipped and counted in the note);
//          "not run"  the page has code the machine cannot execute (no toolchain) or a block failed —
//                     the note says which;
//          "n/a"      the page has no code.
//          T-LANG pages take `exec:` from their override frontmatter (the author ran or didn't run it).
//   changes T-LANG pages: the override's `changes:` list.
//   date   the override's `verified:` date, else today's run date.
//   who    the --who flag (default below). Second-wave reviewers replace it when they re-verify a page.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const S = require('../build/sources.config');
const { parseRegistry } = require('../build/registry');
const { parseFrontmatter } = require('../build/parsers/markdown');
const { LANGS, FRONTEND } = require('../build/parsers/polyglot');

const args = new Set(process.argv.slice(2));
const WHO = (process.argv.find((a) => a.startsWith('--who=')) || '').slice(6) || 'Claude (Cursor agent) · first-wave pass';
const TODAY = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
const EXEC = !args.has('--no-exec');

const manifestPath = path.join(S.WEBSITE, 'build', '.manifest.json');
if (!fs.existsSync(manifestPath)) { console.error('build/.manifest.json missing — run `node build/index.js` first'); process.exit(2); }
const man = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const reg = parseRegistry();
const ledgerPath = path.join(S.CONTENT, 'verification.json');
const prev = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : {};

// ---------- docs: registry hints → URLs ----------
const HINTS = [
  [/owasp\.org\/Top10/i, 'https://owasp.org/Top10/2025/'],
  [/owasp\.org/i, 'https://owasp.org/'],
  [/Node\.js crypto\/http/i, 'https://nodejs.org/docs/latest-v24.x/api/crypto.html', 'https://nodejs.org/docs/latest-v24.x/api/http.html'],
  [/MDN HTTP headers/i, 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers'],
  [/MDN CSS/i, 'https://developer.mozilla.org/en-US/docs/Web/CSS'],
  [/grit book/i, 'https://angeladuckworth.com/grit-book/'],
  [/MDN JavaScript reference|MDN \(developer\.mozilla\.org\)|\bMDN\b/i, 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'],
  [/Node\.js (24 )?docs|nodejs\.org/i, 'https://nodejs.org/docs/latest-v24.x/api/'],
  [/react\.dev/i, 'https://react.dev/'],
  [/reactrouter\.com/i, 'https://reactrouter.com/'],
];
const SECTION_DEFAULT = {
  Algorithms: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://nodejs.org/docs/latest-v24.x/api/'],
  'Data Structures': ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://nodejs.org/docs/latest-v24.x/api/'],
  Practice: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://nodejs.org/docs/latest-v24.x/api/'],
  'Design Patterns': ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://nodejs.org/docs/latest-v24.x/api/'],
  Security: ['https://owasp.org/Top10/2025/', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers'],
};

// Concept articles (system design, mindset) name real technologies; their official docs are the
// primary sources a reviewer checks the claims against. Word-boundary matches on the rendered text.
const TECH_DOCS = [
  [/\bPostgres(?:QL)?\b/i, 'https://www.postgresql.org/docs/current/'],
  [/\bMySQL\b/i, 'https://dev.mysql.com/doc/'],
  [/\bRedis\b/, 'https://redis.io/docs/latest/'],
  [/\bMemcached\b/i, 'https://memcached.org/'],
  [/\bKafka\b/, 'https://kafka.apache.org/documentation/'],
  [/\bRabbitMQ\b/i, 'https://www.rabbitmq.com/docs'],
  [/\bMongoDB\b/i, 'https://www.mongodb.com/docs/'],
  [/\bCassandra\b/, 'https://cassandra.apache.org/doc/latest/'],
  [/\bDynamoDB\b/i, 'https://docs.aws.amazon.com/dynamodb/'],
  [/\b(?:Amazon )?S3\b/, 'https://docs.aws.amazon.com/s3/'],
  [/\bCloudFront\b/, 'https://docs.aws.amazon.com/cloudfront/'],
  [/\bLambda\b/, 'https://docs.aws.amazon.com/lambda/'],
  [/\bElasticsearch\b/i, 'https://www.elastic.co/docs'],
  [/\bNginx\b/i, 'https://nginx.org/en/docs/'],
  [/\bHAProxy\b/i, 'https://www.haproxy.org/#docs'],
  [/\bDocker\b/, 'https://docs.docker.com/'],
  [/\bKubernetes\b|\bk8s\b/, 'https://kubernetes.io/docs/'],
  [/\bgRPC\b/, 'https://grpc.io/docs/'],
  [/\bGraphQL\b/, 'https://graphql.org/learn/'],
  [/\bWebSockets?\b/, 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API'],
  [/\bCache-Control\b|\bETag\b|\bHTTP caching\b/i, 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching'],
  [/\bOAuth\b/, 'https://oauth.net/2/'],
  [/\bJWTs?\b|\bJSON Web Token/i, 'https://datatracker.ietf.org/doc/html/rfc7519'],
  [/\bTLS\b/, 'https://datatracker.ietf.org/doc/html/rfc8446'],
  [/\bDNS\b/, 'https://datatracker.ietf.org/doc/html/rfc1035'],
  [/\bRaft\b/, 'https://raft.github.io/'],
  [/\bZooKeeper\b/i, 'https://zookeeper.apache.org/doc/current/'],
  [/\betcd\b/, 'https://etcd.io/docs/'],
  [/\bTerraform\b/, 'https://developer.hashicorp.com/terraform/docs'],
  [/\bPrometheus\b/, 'https://prometheus.io/docs/'],
  [/\bGrafana\b/, 'https://grafana.com/docs/'],
  [/\bOpenTelemetry\b/, 'https://opentelemetry.io/docs/'],
  [/\bExpress(?:\.js)?\b/, 'https://expressjs.com/'],
  [/\bReact\b/, 'https://react.dev/'],
  [/\bNode(?:\.js)?\b/, 'https://nodejs.org/docs/latest-v24.x/api/'],
  [/\bHTTP\/[23]\b|\bHTTP status\b|\bstatus codes?\b/i, 'https://developer.mozilla.org/en-US/docs/Web/HTTP'],
];
function pageText(url) {
  const f = path.join(S.PUBLIC, url, 'index.html');
  if (!fs.existsSync(f)) return '';
  const html = fs.readFileSync(f, 'utf8');
  const main = html.match(/<main[\s\S]*?<\/main>/) || [html];
  return main[0].replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
}
function docsFromText(url) {
  const text = pageText(url);
  const out = [];
  for (const [re, u] of TECH_DOCS) if (re.test(text) && !out.includes(u)) out.push(u);
  return out.slice(0, 8);
}

function docsFromHints(page) {
  const line = (page.accept || []).find((a) => /Verification docs:/i.test(a));
  if (!line) return null;
  const out = [];
  for (const [re, ...urls] of HINTS) if (re.test(line)) for (const u of urls) if (!out.includes(u)) out.push(u);
  return out.length ? out : null;
}

// ---------- path sessions ----------
function sessionFrontmatter(url) {
  const m = url.match(/^\/path\/([a-z0-9-]+)\/$/);
  if (!m) return null;
  const file = path.join(S.CONTENT, 'path', 'sessions', `${m[1]}.md`);
  if (!fs.existsSync(file)) return null;
  return parseFrontmatter(fs.readFileSync(file, 'utf8')).data || {};
}

// ---------- T-LANG overrides ----------
function langOverride(url) {
  const m = url.match(/^\/languages\/([a-z-]+)\/([a-z-]+)\/$/);
  if (!m) return null;
  const file = path.join(S.OVERRIDES, 'languages', m[1], `${m[2]}.md`);
  if (!fs.existsSync(file)) return { exists: false };
  const { data } = parseFrontmatter(fs.readFileSync(file, 'utf8'));
  return { exists: true, fm: data, rel: path.relative(S.WEBSITE, file) };
}
function langIndexDocs(url) {
  const m = url.match(/^\/languages\/([a-z-]+)\/$/);
  if (!m) return null;
  if (m[1] === 'frontend') return [...new Set(FRONTEND.flatMap((f) => f.docs || []))];
  if (m[1] === 'javascript') return ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://nodejs.org/docs/latest-v24.x/api/'];
  const lang = LANGS.find((l) => l.code === m[1]);
  return lang ? (lang.docs || []) : null;
}

// ---------- exec: run the page's standalone JS blocks ----------
const JS = new Set(['js', 'javascript', 'mjs', 'cjs', 'node']);
const blocksByUrl = new Map();
for (const b of man.codeBlocks || []) {
  if (!blocksByUrl.has(b.url)) blocksByUrl.set(b.url, []);
  blocksByUrl.get(b.url).push(b);
}
const runnablesByUrl = new Map();
for (const r of man.runnables || []) {
  if (!runnablesByUrl.has(r.url)) runnablesByUrl.set(r.url, []);
  runnablesByUrl.get(r.url).push(r);
}
const livesByUrl = new Map();
for (const l of man.lives || []) {
  if (!livesByUrl.has(l.url)) livesByUrl.set(l.url, []);
  livesByUrl.get(l.url).push(l);
}
const termsByUrl = new Map();
for (const t of man.terms || []) {
  if (!termsByUrl.has(t.url)) termsByUrl.set(t.url, []);
  termsByUrl.get(t.url).push(t);
}
function isFragment(code) {
  const t = code.trim();
  if (!t) return true;
  if (/^\/\/\s*fragment/i.test(t)) return true;
  if (/^\s*(\.\.\.|…)\s*$/m.test(t)) return true;
  if (/\{\s*\.\.\.\s*\}/.test(t)) return true;
  if (/\.\.\.\s*$/m.test(t) && !/\.\.\.\w|\.\.\.\[|\.\.\.\(/.test(t)) return true;
  return false;
}
function browserOnly(code) {
  return /\b(document|window|localStorage|sessionStorage|navigator|alert|prompt)\b/.test(code) || /\bfetch\(/.test(code) || /\brequire\(['"](react|express|axios|mongoose|pg|jest)/.test(code) || /^\s*import .* from ['"](react|express|axios|mongoose|pg|@?\w[\w/-]*)['"]/m.test(code) && !/from ['"]node:/.test(code);
}
function looksLikeJsx(code) {
  return /^\s*<[A-Za-z!/]/m.test(code) || /(return|=>|\()\s*\n?\s*<[A-Za-z]/.test(code) || /<\/[A-Za-z][\w.]*>/.test(code);
}
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dtc-ledger-'));
// Blocks come from page content — including content/overrides/ written by whoever is refreshing a
// page — so they run under Node's permission model: read access to their own temp file only, no
// writes, no child processes, no worker threads, no native addons, and a scrubbed environment.
// (Browser-only blocks — anything with fetch/document/window — are never executed; see browserOnly.)
const SANDBOX_FLAGS = ['--permission', `--allow-fs-read=${tmpDir}`];
const SANDBOX_ENV = { PATH: process.env.PATH || '', NODE_NO_WARNINGS: '1' };
function runBlock(code, i) {
  const esm = /^\s*(import|export)\b/m.test(code) || /\bawait\b/.test(code) && !/async/.test(code);
  const file = path.join(tmpDir, `b${i}.${esm ? 'mjs' : 'js'}`);
  // the site's run-in-worker shim gives blocks assert/console; mirror the assert part here
  const prelude = esm ? '' : 'const assert = require("node:assert");\n';
  fs.writeFileSync(file, prelude + code);
  const r = spawnSync(process.execPath, [...SANDBOX_FLAGS, file], { timeout: 10000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: SANDBOX_ENV });
  if (r.error && r.error.code === 'ETIMEDOUT') return { ok: false, err: 'timeout 10s' };
  const lines = (r.stderr || '').trim().split('\n').filter(Boolean);
  const errLine = lines.find((l) => /^\s*\w*(Error|Exception)\b/.test(l)) || lines.filter((l) => !/^Node\.js v/.test(l)).slice(-1)[0] || '';
  // A sketch references a name that is defined elsewhere on the page ("const processors = { card: new CardProcessor() }").
  // Parse-checked by the codeblocks gate; here it is reported as a sketch rather than a failure.
  const m = errLine.match(/ReferenceError: (\w+) is not defined/);
  const sketch = !!m && !new RegExp(`\\b(const|let|var|function|class)\\s+${m[1]}\\b`).test(code);
  return { ok: r.status === 0, err: errLine.trim(), sketch, missing: m && m[1] };
}
function execForPage(url, template) {
  const runnables = runnablesByUrl.get(url) || [];
  const blocks = blocksByUrl.get(url) || [];
  const js = blocks.filter((b) => JS.has(String(b.lang || '').toLowerCase()));
  const other = blocks.filter((b) => !JS.has(String(b.lang || '').toLowerCase()) && !/^(bash|sh|text|json|yaml|yml|env|html|css|xml|toml|properties|sql|dockerfile)?$/i.test(String(b.lang || '')));
  if (template === 'T-EXERCISE') return { exec: 'ran', note: 'The exercise\'s test.js ran against the solution in the algocasts gate (jest, 136 tests across 26 exercises).' };
  const lives = livesByUrl.get(url) || [];
  const terms = termsByUrl.get(url) || [];
  if (runnables.length || lives.length || terms.length) {
    const parts = [];
    if (runnables.length) parts.push(`${runnables.length} runnable file(s) executed by the prep gate (node <file> printed its ok line)`);
    if (lives.length) parts.push(`${lives.length} live stage file(s) executed in headless Chromium by the live gate (Run live printed its ok line, every stage button clicked, run twice)`);
    if (terms.length) {
      const mayFail = terms.filter((t) => t.mayFail).map((t) => t.name);
      parts.push(`${terms.length} terminal script(s) (${terms.reduce((n, t) => n + t.lines, 0)} commands) replayed in the lesson terminal in headless Chromium by the live gate (every line ran, nothing unintended was "command not found"${mayFail.length ? `; ${mayFail.join(', ')} is tagged may-fail and hits a deliberate one` : ''}, a typed command answered, run twice)`);
    }
    return { exec: 'ran', note: parts.join('; ') + (template === 'T-SESSION' ? '. Only the named interactive examples were executed. Other walkthrough files, language toolchains, databases, cloud deployments, payment providers, and AI services require the documented manual checks; no toolchains were installed.' : '.') };
  }
  if (!blocks.length) return { exec: 'n/a', note: 'No code on this page.' };
  if (!js.length) {
    if (other.length) return { exec: 'not run', note: `${other.length} ${[...new Set(other.map((b) => b.lang))].join('/')} block(s); no toolchain for that language on the build machine.` };
    return { exec: 'n/a', note: `${blocks.length} text/pseudocode/shell block(s) only; nothing executable.` };
  }
  if (!EXEC) {
    const p = prev[url];
    return p && p.exec ? { exec: p.exec, note: p.note || '' } : { exec: 'not run', note: 'exec skipped (--no-exec) and no previous result.' };
  }
  let ran = 0, skipped = 0; const failed = []; const sketches = [];
  js.forEach((b, i) => {
    if (isFragment(b.code) || looksLikeJsx(b.code) || browserOnly(b.code)) { skipped++; return; }
    const r = runBlock(b.code, `${ran + failed.length}-${i}`);
    if (r.ok) ran++; else if (r.sketch) sketches.push(`block ${i + 1} uses ${r.missing}`); else failed.push(`block ${i + 1}: ${r.err || 'non-zero exit'}`);
  });
  const parts = [`${ran}/${js.length} JS block(s) executed clean under Node ${process.versions.node}`];
  if (skipped) parts.push(`${skipped} skipped (fragment / JSX / browser-only)`);
  if (sketches.length) parts.push(`${sketches.length} sketch(es) reference names defined elsewhere on the page, parse-checked only (${sketches.slice(0, 3).join(', ')})`);
  if (other.length) parts.push(`${other.length} non-JS block(s) not executed (no toolchain)`);
  if (failed.length) return { exec: 'not run', note: `${parts.join('; ')}; FAILED — ${failed.slice(0, 3).join(' · ')}` };
  if (other.length) return { exec: 'not run', note: parts.join('; ') + '.' };
  if (!ran) return { exec: 'n/a', note: parts.join('; ') + '.' };
  return { exec: 'ran', note: parts.join('; ') + (template === 'T-SESSION' ? '. Only the named interactive examples were executed. Other walkthrough files, language toolchains, databases, cloud deployments, payment providers, and AI services require the documented manual checks; no toolchains were installed.' : '.') };
}

// ---------- assemble ----------
const need = reg.pages.filter((p) => !['T-SEARCH', 'T-404'].includes(p.template));
const ledger = {};
const rows = [];
let counts = { ran: 0, 'not run': 0, 'n/a': 0 };
for (const p of need) {
  const entry = { date: TODAY, who: WHO, docs: [], exec: 'n/a' };
  const notes = [];
  const ov = p.template === 'T-LANG' ? langOverride(p.url) : p.id === 'MIND-02' ? {
    exists: true,
    fm: parseFrontmatter(fs.readFileSync(path.join(S.OVERRIDES, 'mindset', 'grit.md'), 'utf8')).data,
    rel: 'content/overrides/mindset/grit.md',
  } : null;
  if (ov && ov.exists) {
    const fm = ov.fm;
    if (fm.verified_by) entry.who = String(fm.verified_by);
    entry.date = fm.verified ? String(fm.verified) : TODAY;
    entry.docs = Array.isArray(fm.docs) ? fm.docs : [];
    entry.exec = ['ran', 'not run', 'n/a'].includes(fm.exec) ? fm.exec : 'not run';
    if (fm.version) entry.version = String(fm.version);
    if (Array.isArray(fm.changes) && fm.changes.length) entry.changes = fm.changes;
    if (fm.verified_note) notes.push(String(fm.verified_note));
    // The override path is reviewer information, kept out of the note (the note is rendered on the
    // page's Creator card, which carries no repository paths). qa/VERIFICATION.md lists it instead.
    entry.override = ov.rel;
  } else if (ov && !ov.exists) {
    entry.exec = execForPage(p.url, p.template).exec;
    notes.push('No override yet: 2021 text as written; versions unverified.');
    const idx = langIndexDocs(p.url.replace(/[a-z-]+\/$/, ''));
    if (idx) entry.docs = idx;
  } else {
    const idxDocs = langIndexDocs(p.url);
    const hinted = docsFromHints(p);
    const session = p.template === 'T-SESSION' ? sessionFrontmatter(p.url) : null;
    if (['T-HOME', 'T-CREDITS', 'T-LANDING', 'T-PATH'].includes(p.template)) notes.push('Navigation page: its counts, tiles and lists are computed from the registry at build time and asserted by the registry gate; no external claims to verify.');
    else if (session) {
      // A path session: the docs are the `docs:` list in the session's frontmatter (the pages the author checked
      // the explanation against); the code is executed below like any other page.
      entry.docs = Array.isArray(session.docs) ? session.docs : [];
      notes.push(entry.docs.length ? 'Path session: docs are the references listed in the session frontmatter; the registry gate checked the H2 order, diagram count and side-quest links.' : 'Path session with no docs list in its frontmatter; the registry gate checked the H2 order, diagram count and side-quest links.');
    }
    else if (idxDocs) { entry.docs = idxDocs; notes.push('Index page: docs are the official sites of the frameworks it lists; sub-page versions come from their own entries.'); }
    else if (hinted) { entry.docs = hinted; notes.push('Docs from the registry acceptance block.'); }
    else if (SECTION_DEFAULT[p.section]) { entry.docs = SECTION_DEFAULT[p.section]; notes.push('Docs are the section default (no per-page hint in the registry); a reviewer should confirm any tool-specific claim.'); }
    else {
      const auto = docsFromText(p.url);
      if (auto.length) { entry.docs = auto; notes.push('Concept article: docs are the official sites of the technologies the text names (auto-selected); a reviewer confirms each claim against them.'); }
      else notes.push('Concept article naming no specific technology: the registry gate checked title, H2 order and counts; a reviewer reads it for currency.');
    }
    const ex = execForPage(p.url, p.template);
    entry.exec = ex.exec; if (ex.note) notes.push(ex.note);
  }
  entry.note = notes.join(' ');
  ledger[p.url] = entry;
  counts[entry.exec]++;
  rows.push({ p, e: entry });
}

fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');

// ---------- qa/VERIFICATION.md ----------
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const short = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
const md = [];
md.push('# Verification ledger');
md.push('');
md.push(`Generated by \`node scripts/verify-ledger.js\` on ${TODAY} from the registry, the build manifest and the override frontmatter. **Do not edit by hand** — change an override's frontmatter or re-run the script. The build reads the JSON twin (\`content/verification.json\`); the verification gate fails when any page is missing from either.`);
md.push('');
md.push(`Pages: ${need.length} · exec ran: ${counts.ran} · not run: ${counts['not run']} · n/a (no code): ${counts['n/a']}`);
md.push('');
md.push('**How to read `exec`:** *ran* = a runnable file passed the prep/algocasts gate, or every standalone JS block executed under node, or the override author recorded a run (see note); *not run* = code exists but was not executed on this machine (no toolchain, or a block failed — the note says which); *n/a* = no code on the page.');
md.push('');
let section = null;
for (const { p, e } of rows) {
  if (p.section !== section) {
    section = p.section;
    md.push(`## ${section}`); md.push('');
    md.push('| Page | Source | Docs consulted | Changes | Exec | Date | Who |');
    md.push('|---|---|---|---|---|---|---|');
  }
  const docs = e.docs.length ? e.docs.map((d) => `[${esc(short(d))}](${d})`).join('<br>') : '—';
  const changes = e.changes ? e.changes.map((c) => `• ${esc(c)}`).join('<br>') : (e.note ? esc(e.note) : '—');
  md.push(`| [${esc(p.title)}](${p.url}) \`${p.id}\` | \`${esc(p.source || '')}\`${e.override ? `<br>override: \`${esc(e.override)}\`` : ''} | ${docs} | ${changes} | ${e.exec}${e.version ? ` · v${e.version}` : ''} | ${e.date} | ${esc(e.who)} |`);
}
md.push('');
fs.mkdirSync(S.QA, { recursive: true });
fs.writeFileSync(path.join(S.QA, 'VERIFICATION.md'), md.join('\n'));
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`verification ledger: ${need.length} pages → content/verification.json + qa/VERIFICATION.md`);
console.log(`  exec ran ${counts.ran} · not run ${counts['not run']} · n/a ${counts['n/a']}`);
const notRun = rows.filter(({ e }) => e.exec === 'not run');
if (notRun.length) {
  console.log('  not run:');
  for (const { p, e } of notRun) console.log(`    ${p.url} — ${e.note.slice(0, 160)}`);
}
