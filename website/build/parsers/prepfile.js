// Parses a _scratchbox/prep *.js reference file:
//   // ─────
//   // TITLE                       [optional bracket tag]
//   // ─────
//   // KEY    : value (may continue on indented // lines)
//   // ─────
//   'use strict'; const assert = require('node:assert/strict');
//   // ── 1. Title  —  idea  —  O(n) / O(1)
//   code…  asserts…
//   // ═══ TITLE ═══
//   console.log('ok: path');
const fs = require('fs');
const path = require('path');

const RULE = /^\/\/ ─{10,}\s*$/;
const SECTION = /^\/\/ (?:── |═══ )(.+?)\s*$/;
const WORKER_OK = new Set(['node:assert/strict', 'node:assert', 'assert', 'node:url', 'url', 'node:util', 'util', 'node:events', 'events']);

function parsePrepFile(absPath, relPath) {
  const src = fs.readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n');
  const lines = src.split('\n');

  // Header block: everything from line 0 until the first non-comment line.
  let i = 0;
  const headerLines = [];
  while (i < lines.length && (lines[i].startsWith('//') || lines[i].trim() === '')) { headerLines.push(lines[i]); i++; }
  const bodyStart = i;

  // Title = first non-rule comment line in the header
  let title = '';
  let tag = '';
  const titleIdx = headerLines.findIndex((l) => l.startsWith('//') && !RULE.test(l));
  if (titleIdx >= 0) {
    const t = headerLines[titleIdx].replace(/^\/\/\s*/, '');
    const m = t.match(/^(.*?)\s{2,}(?:\[(.+?)\]|\((.+?)\))\s*$/);
    if (m) { title = m[1].trim(); tag = (m[2] || m[3] || '').trim(); } else title = t.trim();
  }

  // Keys
  const keys = [];
  let cur = null;
  // A title line written as a key ("// POST-MORTEM: …   (provenance)") is also the first glance row.
  // Letters and hyphens only, so "A01:2025 …" (OWASP titles) stays a plain title.
  if (titleIdx >= 0) {
    const tm = headerLines[titleIdx].match(/^\/\/ ([A-Z][A-Z-]{3,}):\s+(.*)$/);
    if (tm) { cur = { key: tm[1], value: tm[2].replace(/\s{2,}/g, ' ').trim() }; keys.push(cur); }
  }
  for (let k = titleIdx + 1; k < headerLines.length; k++) {
    const l = headerLines[k];
    if (RULE.test(l)) { if (keys.length) { /* end of key block */ } continue; }
    const m = l.match(/^\/\/ ([A-Z][A-Z \-/0-9]*?)\s*:\s?(.*)$/);
    if (m) { cur = { key: m[1].trim(), value: m[2].trim() }; keys.push(cur); continue; }
    const cont = l.match(/^\/\/\s{2,}(.*)$/);
    if (cont && cur) { cur.value += (cur.value ? ' ' : '') + cont[1].trim(); continue; }
    if (l.trim() === '//' || l.trim() === '') { continue; }
    // any other comment line before first key = subtitle
    if (!keys.length && !cur) { cur = null; }
  }

  // Sections
  const sections = [];
  let current = null;
  const preamble = [];
  for (let k = bodyStart; k < lines.length; k++) {
    const l = lines[k];
    const sm = l.match(SECTION);
    if (sm) {
      let raw = sm[1].replace(/\s*═+\s*$/, '').trim();
      let [titlePart, ...rest] = raw.split(/\s+—\s+/);
      let number = null;
      const nm = titlePart.match(/^(\d+)\.\s+(.*)$/);
      if (nm) { number = Number(nm[1]); titlePart = nm[2]; }
      const idea = rest.length ? rest[0].trim() : '';
      const complexity = rest.length > 1 ? rest.slice(1).join(' — ').trim() : '';
      current = { number, title: titlePart.trim(), idea, complexity, code: [], line: k + 1 };
      sections.push(current);
      continue;
    }
    if (/^console\.log\('ok: /.test(l)) continue;
    if (current) current.code.push(l);
    else preamble.push(l);
  }
  for (const s of sections) {
    // trim blank edges
    while (s.code.length && s.code[0].trim() === '') s.code.shift();
    while (s.code.length && s.code[s.code.length - 1].trim() === '') s.code.pop();
    s.asserts = s.code.filter((l) => /^\s*assert\b/.test(l) || /^\s*await assert|assert\.(?:ok|equal|deepEqual|strictEqual|deepStrictEqual|throws|rejects|match|notEqual)/.test(l)).length;
    s.codeText = s.code.join('\n');
  }
  // Number sections that have no explicit number (templates etc.)
  sections.forEach((s, idx) => { s.index = idx + 1; if (s.number === null) s.number = idx + 1; });

  const okMatch = src.match(/console\.log\('ok: ([^']+)'\)/);
  // requires outside comments
  const codeOnly = lines.filter((l) => !/^\s*\/\//.test(l)).join('\n').replace(/\/\*[\s\S]*?\*\//g, '');
  const requires = Array.from(new Set(Array.from(codeOnly.matchAll(/require\(['"]([^'"]+)['"]\)/g)).map((m) => m[1])));
  const notShimmable = requires.filter((r) => !WORKER_OK.has(r));
  const usesAsync = /\bawait\b|setTimeout|setImmediate|process\.nextTick/.test(codeOnly);
  const usesProcess = /\bprocess\.(?:env|argv|exit|hrtime|memoryUsage|on)\b/.test(codeOnly);

  return {
    relPath,
    absPath,
    title: title.replace(/\s+/g, ' '),
    tag,
    keys,
    sections,
    preamble: preamble.join('\n').trim(),
    ok: okMatch ? okMatch[1] : null,
    requires,
    notShimmable,
    runMode: notShimmable.length || usesProcess ? 'node' : 'worker',
    runReason: notShimmable.length ? `uses ${notShimmable.join(', ')}` : usesProcess ? 'uses process.*' : '',
    source: src,
    lineCount: lines.length,
  };
}

function titleCase(s) {
  return s.toLowerCase().replace(/(^|[\s(/&-])([a-z])/g, (m, p, c) => p + c.toUpperCase()).replace(/\bBst\b/g, 'BST').replace(/\bDp\b/g, 'DP').replace(/\b(Ii|Iii)\b/g, (m) => m.toUpperCase());
}

module.exports = { parsePrepFile, titleCase };

if (require.main === module) {
  const S = require('../sources.config');
  const rel = process.argv[2] || 'algorithms/two-pointers.js';
  const r = parsePrepFile(path.join(S.PREP, rel), rel);
  console.log(r.title, '|', r.tag, '|', r.ok, '|', r.runMode, r.runReason);
  console.log(r.keys.map((k) => k.key + ' = ' + k.value.slice(0, 60)).join('\n'));
  console.log(r.sections.map((s) => `${s.number}. ${s.title} — ${s.idea} — ${s.complexity} [${s.asserts} asserts, ${s.code.length} lines]`).join('\n'));
  console.log('preamble:', JSON.stringify(r.preamble.slice(0, 120)));
}
