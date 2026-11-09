// `npm test` — build, then run every gate in order and summarise. Exit code is non-zero if any
// gate fails. Environment:
//   DTC_DEV=1      build continues past verification gaps and the verification gate only warns
//   DTC_VERBOSE=1  gates list every failure instead of the first 60
//   DTC_SKIP=a,b   skip named gates (e.g. DTC_SKIP=prep while iterating on a single page)
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const S = require('../sources.config');

const skip = new Set((process.env.DTC_SKIP || '').split(',').map((s) => s.trim()).filter(Boolean));
const JEST = path.join(S.WEBSITE, 'node_modules', 'jest', 'bin', 'jest.js');
const GATES = [
  { name: 'build', cmd: process.execPath, args: [path.join(S.WEBSITE, 'build', 'index.js')], cwd: S.WEBSITE },
  { name: 'deepmerge-security', cmd: process.execPath, args: [path.join(__dirname, 'deepmerge-security.js')] },
  { name: 'registry', cmd: process.execPath, args: [path.join(__dirname, 'registry.js')] },
  { name: 'links', cmd: process.execPath, args: [path.join(__dirname, 'links.js')] },
  { name: 'prep', cmd: process.execPath, args: [path.join(__dirname, 'prep.js')] },
  // Live stages need the Playwright Chromium (same one as `npm run screenshots`); the gate says so if it is missing.
  { name: 'live', cmd: process.execPath, args: [path.join(__dirname, 'live.js')] },
  { name: 'save-points', cmd: process.execPath, args: [path.join(__dirname, 'save-points.js')] },
  { name: 'security', cmd: process.execPath, args: [path.join(__dirname, 'security.js')] },
  { name: 'atelier', cmd: process.execPath, args: [path.join(__dirname, 'atelier.js')] },
  { name: 'ui', cmd: process.execPath, args: [path.join(__dirname, 'ui.js')] },
  { name: 'codeblocks', cmd: process.execPath, args: [path.join(__dirname, 'codeblocks.js')] },
  // The website's own jest runs the vendored suites (config: algocasts.jest.config.js), so the
  // clone's 2020 toolchain is never installed.
  { name: 'algocasts', cmd: process.execPath, args: [JEST, '--config', path.join(__dirname, 'algocasts.jest.config.js'), '--silent'], cwd: S.WEBSITE, requires: JEST },
  { name: 'search', cmd: process.execPath, args: [path.join(__dirname, 'search.js')] },
  { name: 'verification', cmd: process.execPath, args: [path.join(__dirname, 'verification.js')] },
  { name: 'budget', cmd: process.execPath, args: [path.join(__dirname, 'budget.js')] },
];

const results = [];
const t0 = Date.now();
for (const gte of GATES) {
  if (skip.has(gte.name)) { results.push({ name: gte.name, status: 'SKIP', ms: 0 }); console.log(`\n── ${gte.name}: skipped (DTC_SKIP)`); continue; }
  if (gte.requires && !fs.existsSync(gte.requires)) {
    results.push({ name: gte.name, status: 'FAIL', ms: 0, note: `missing ${path.relative(S.WEBSITE, gte.requires)} — run \`npm ci\` in website/` });
    console.log(`\n── ${gte.name}: FAIL — ${path.relative(S.WEBSITE, gte.requires)} missing. Run: npm ci`);
    continue;
  }
  console.log(`\n── ${gte.name}`);
  const t = Date.now();
  const r = spawnSync(gte.cmd, gte.args, { cwd: gte.cwd || S.WEBSITE, stdio: 'inherit', env: process.env, shell: process.platform === 'win32' });
  const ms = Date.now() - t;
  const status = r.status === 0 ? 'PASS' : 'FAIL';
  results.push({ name: gte.name, status, ms });
  if (gte.name === 'build' && status === 'FAIL') { console.log('\nbuild failed; the remaining gates need public/ and were not run.'); break; }
}

console.log('\n══ npm test summary');
for (const r of results) console.log(`  ${r.status.padEnd(4)} ${r.name.padEnd(13)} ${r.ms ? `${(r.ms / 1000).toFixed(1)}s` : ''}${r.note ? `  ${r.note}` : ''}`);
const failed = results.filter((r) => r.status === 'FAIL');
const notRun = GATES.length - results.length;
console.log(`  ${failed.length ? `${failed.length} gate(s) failed` : 'all gates green'}${notRun ? ` · ${notRun} not run` : ''} · ${((Date.now() - t0) / 1000).toFixed(1)}s total`);
process.exit(failed.length || notRun ? 1 : 0);
