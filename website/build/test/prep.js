// Gate 3 — every runnable file (66 _scratchbox prep files + the naive/optimal pairs) executes
// under the local node and prints its `ok: <rel>` line. Runs 8 at a time, 30 s each.
const path = require('path');
const { spawn } = require('child_process');
const S = require('../sources.config');
const L = require('./lib');

const g = L.gate('prep');
const man = L.manifest();
const runnables = man.runnables || [];
g.check(runnables.length >= 67, `expected ≥ 67 runnable files (66 prep + naive/optimal), manifest lists ${runnables.length}`);

function run(r) {
  const abs = r.abs || path.join(S.PREP, r.rel);
  return new Promise((resolve) => {
    const t0 = Date.now();
    // Node's permission model: each file may read its own directory and nothing else — no writes,
    // child processes, worker threads or addons — and sees a scrubbed environment.
    const child = spawn(process.execPath, ['--permission', `--allow-fs-read=${path.dirname(abs)}`, abs], {
      cwd: path.dirname(abs), stdio: ['ignore', 'pipe', 'pipe'], env: { PATH: process.env.PATH || '', NODE_NO_WARNINGS: '1' },
    });
    let out = '', err = '';
    const timer = setTimeout(() => { child.kill('SIGKILL'); err += '\n[timeout 30s]'; }, 30000);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { err += d; });
    child.on('close', (code) => { clearTimeout(timer); resolve({ r, code, out, err, ms: Date.now() - t0 }); });
  });
}

(async () => {
  const queue = runnables.slice();
  const results = [];
  async function worker() { while (queue.length) results.push(await run(queue.shift())); }
  await Promise.all(Array.from({ length: 8 }, worker));
  let slow = 0;
  for (const { r, code, out, err, ms } of results) {
    const want = `ok: ${r.ok}`;
    const ok = code === 0 && out.includes(want);
    g.check(ok, `${r.rel} (${r.url}) exit ${code}, "${want}" ${out.includes(want) ? 'printed' : 'NOT printed'}${err.trim() ? ` — ${err.trim().split('\n').slice(-2).join(' | ').slice(0, 200)}` : ''}`);
    if (ms > 5000) { slow++; g.warn(`${r.rel} took ${(ms / 1000).toFixed(1)}s`); }
  }
  g.done(`${results.length} files run${slow ? ` · ${slow} slow (>5s)` : ''}`);
})();
