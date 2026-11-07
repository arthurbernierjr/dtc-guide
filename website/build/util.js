const fs = require('fs');
const path = require('path');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function read(p) { return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'); }
function readIf(p) { return fs.existsSync(p) ? read(p) : null; }
function write(p, s) { ensureDir(path.dirname(p)); fs.writeFileSync(p, s); }
function copy(src, dst) { ensureDir(path.dirname(dst)); fs.copyFileSync(src, dst); }
function exists(p) { return fs.existsSync(p); }
function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function listFiles(dir, filter = () => true) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (filter(p)) out.push(p);
    }
  })(dir);
  return out;
}
function words(s) { return String(s).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length; }
function stripTags(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim(); }
function truncate(s, n) { s = String(s).trim(); if (s.length <= n) return s; const cut = s.slice(0, n - 1); return cut.slice(0, Math.max(cut.lastIndexOf(' '), 40)) + '…'; }

module.exports = { ensureDir, read, readIf, write, copy, exists, rmrf, listFiles, words, stripTags, truncate };
