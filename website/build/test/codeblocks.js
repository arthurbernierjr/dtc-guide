// Gate 4 — every JavaScript code block on every page parses (`node --check` semantics via
// vm.Script, with an ES-module fallback). Blocks are collected by the build into the manifest.
// Fragments the author marked with a leading `// fragment` comment or that are visibly elided
// (`...`, `…`) are skipped and counted.
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');
const L = require('./lib');

const g = L.gate('codeblocks');
const man = L.manifest();
const JS = new Set(['js', 'javascript', 'mjs', 'cjs', 'node']);
const blocks = (man.codeBlocks || []).filter((b) => JS.has(String(b.lang || '').toLowerCase()));

function isFragment(code) {
  const t = code.trim();
  if (!t) return true;
  if (/^\/\/\s*fragment/i.test(t)) return true;
  if (/^\s*(\.\.\.|…)\s*$/m.test(t)) return true; // a line that is only an ellipsis
  if (/\{\s*\.\.\.\s*\}/.test(t)) return true; // `{...}` body elision
  if (/\.\.\.\s*$/m.test(t) && !/\.\.\.\w|\.\.\.\[|\.\.\.\(/.test(t)) return true; // trailing ellipsis, not spread
  if (/^\s*\/\/.*\.\.\.\s*$/m.test(t) && t.split('\n').length <= 3) return true;
  return false;
}
// JSX / HTML templates fenced as `js` (the 2021 frontend guides do this). They are not plain
// JavaScript and are counted separately; the freshness pass relabels them jsx/html.
function looksLikeJsx(code) {
  return /^\s*<[A-Za-z!/]/m.test(code) // a line that starts with a tag
    || /(return|=>|\()\s*\n?\s*<[A-Za-z]/.test(code) // tag as an expression
    || /<\/[A-Za-z][\w.]*>/.test(code) // closing tag
    || /<[A-Z][\w.]*(\s[^>]*)?\/>/.test(code); // self-closing component <Post … />
}
function parses(code) {
  try { new vm.Script(code, { filename: 'block.js' }); return { ok: true }; } catch (e) {
    const msg = String(e.message);
    if (/import|export|await is only valid|Cannot use import/.test(msg) || /^\s*(import|export)\b/m.test(code)) {
      const tmp = path.join(os.tmpdir(), `dtc-block-${process.pid}-${Math.random().toString(36).slice(2)}.mjs`);
      fs.writeFileSync(tmp, code);
      const r = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
      fs.unlinkSync(tmp);
      if (r.status === 0) return { ok: true };
      return { ok: false, msg: (r.stderr || '').split('\n').find((l) => /Error/.test(l)) || 'module check failed' };
    }
    return { ok: false, msg };
  }
}

let fragments = 0;
let jsx = 0;
let checked = 0;
const jsxPages = new Set();
for (const b of blocks) {
  if (isFragment(b.code)) { fragments++; continue; }
  // Parse first: a DOM demo that puts "<strong>…</strong>" in a string is plain JavaScript and
  // must be checked. Only a block that fails to parse *and* looks like JSX/HTML is set aside.
  const r = parses(b.code);
  if (!r.ok && looksLikeJsx(b.code)) { jsx++; jsxPages.add(b.url); continue; }
  checked++;
  g.check(r.ok, `${b.url} block #${b.index ?? '?'} (${b.lang}): ${r.msg} — "${b.code.trim().split('\n')[0].slice(0, 70)}"`);
}
for (const u of jsxPages) g.warn(`${u}: JSX/HTML fenced as js (not parsed) — relabel in the override`);
const langs = {};
for (const b of man.codeBlocks || []) langs[b.lang || '(none)'] = (langs[b.lang || '(none)'] || 0) + 1;
g.done(`${checked} JS blocks parsed · ${fragments} fragments · ${jsx} jsx-as-js skipped · ${(man.codeBlocks || []).length} blocks total (${Object.keys(langs).length} langs)`);
