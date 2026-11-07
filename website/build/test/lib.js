// Shared helpers for the npm test gates. Every gate is a standalone script that prints
// `PASS <name>` / `FAIL <name>` and exits non-zero on failure; run.js chains them.
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');

const DEV = process.env.DTC_DEV === '1';

// Every rendered page: [{ url, file }] for each index.html under public/ plus /404.html.
function listPages(root = S.PUBLIC) {
  const out = [];
  (function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (abs === path.join(root, 'assets') || abs === path.join(root, 'vendor') || abs === path.join(root, 'licenses')) continue;
        walk(abs);
      } else if (ent.name === 'index.html') {
        const rel = path.relative(root, dir).split(path.sep).filter(Boolean).join('/');
        out.push({ url: rel ? `/${rel}/` : '/', file: abs });
      } else if (ent.name === '404.html' && dir === root) {
        out.push({ url: '/404.html', file: abs });
      }
    }
  })(root);
  return out.sort((a, b) => a.url.localeCompare(b.url));
}

function decode(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&#x27;/g, "'").replace(/&#x3C;/gi, '<').replace(/&nbsp;/g, ' ');
}
function text(html) { return decode(String(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim(); }
function norm(s) { return text(s).replace(/#$/, '').replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, ' ').trim(); }

function titleOf(html) { const m = html.match(/<title>([^<]*)<\/title>/); return m ? decode(m[1]).trim() : ''; }
function h1Of(html) { const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/); return m ? norm(m[1]) : ''; }
function h2sOf(html) {
  // Only article-body H2s carry an anchor id; chrome (rail titles, footer) does not.
  return [...html.matchAll(/<h2[^>]*\bid="[^"]+"[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => norm(m[1]));
}
function chipsOf(html) { return [...html.matchAll(/<span class="chip[^"]*"[^>]*>([\s\S]*?)<\/span>/g)].map((m) => norm(m[1])); }

function manifest() {
  const p = path.join(S.WEBSITE, 'build', '.manifest.json');
  if (!fs.existsSync(p)) throw new Error('build/.manifest.json missing — run `npm run build` first');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** Minimal reporter. */
function gate(name) {
  const failures = [];
  const warnings = [];
  let checks = 0;
  return {
    check(ok, msg) { checks++; if (!ok) failures.push(msg); return ok; },
    warn(msg) { warnings.push(msg); },
    fail(msg) { checks++; failures.push(msg); },
    done(extra) {
      const cap = process.env.DTC_VERBOSE === '1' ? Infinity : 60;
      for (const w of warnings.slice(0, cap)) console.log(`  warn: ${w}`);
      if (warnings.length > cap) console.log(`  … ${warnings.length - cap} more warnings`);
      for (const f of failures.slice(0, cap)) console.log(`  ✗ ${f}`);
      if (failures.length > cap) console.log(`  … ${failures.length - cap} more failures (DTC_VERBOSE=1 to list all)`);
      const status = failures.length ? 'FAIL' : 'PASS';
      console.log(`${status} ${name} — ${checks} checks, ${failures.length} failures, ${warnings.length} warnings${extra ? ` · ${extra}` : ''}`);
      process.exit(failures.length ? 1 : 0);
    },
  };
}

module.exports = { DEV, listPages, decode, text, norm, titleOf, h1Of, h2sOf, chipsOf, manifest, gate };
