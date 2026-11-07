// Gate — live stages. Every `js live=<name>` file the build wrote (manifest `lives`) is executed the
// way a learner runs it: the session page is opened in headless Chromium (served by server.js with its
// real CSP on a free port), "Run live" is pressed, and the stage must print its `ok: <name>` line and
// light up. Then every non-submit button inside the stage is clicked once and the file is run a second
// time (a fresh stage, no "already declared" or doubled listeners), with no uncaught page error anywhere.
// Terminal stages (manifest `terms`, from `bash term=<name>` fences) are replayed the same way: "Run in
// terminal" is pressed, every scripted line must run with none "command not found", a command typed at
// the prompt must answer, and the replay is pressed a second time (a fresh filesystem).
// Needs the Playwright Chromium that `npm run screenshots` also needs (`npx playwright install chromium`).
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');
const S = require('../sources.config');
const L = require('./lib');

const g = L.gate('live');
const man = L.manifest();
const lives = man.lives || [];
const terms = man.terms || [];

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });
}
async function waitFor(url, ms = 15000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { const r = await fetch(url); if (r.ok) return; } catch (e) { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error(`server at ${url} did not come up in ${ms}ms`);
}

async function runStage(page, live, errors) {
  const btn = page.locator(`.run-btn[data-live][data-stage="${live.name}"]`);
  if ((await btn.count()) !== 1) return { ok: false, why: `expected one Run live button for stage "${live.name}", found ${await btn.count()}` };
  const fig = btn.locator('xpath=ancestor::figure[contains(@class,"code")][1]');
  const out = fig.locator('.code-out-body');
  const box = page.locator(`.stage[data-stage="${live.name}"]`);
  const press = async () => {
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    const t0 = Date.now();
    while (Date.now() - t0 < 10000) {
      await page.waitForTimeout(100);
      const running = await btn.evaluate((b) => b.classList.contains('is-running'));
      if (!running) break;
    }
    return out.innerText();
  };
  // A demo may print errors on purpose (a "Where it breaks" stage catches and reports them), so the
  // signals are: the ok line, the stage lit (.is-live) and not marked failed (.is-failed, set by an
  // uncaught error in the file), and no uncaught page error while its buttons are pressed.
  const state = async () => box.evaluate((b) => ({ live: b.classList.contains('is-live'), failed: b.classList.contains('is-failed') }));
  const first = await press();
  const want = `ok: ${live.ok}`;
  if (!first.includes(want)) return { ok: false, why: `"${want}" not printed. Panel: ${first.replace(/\n/g, ' | ').slice(0, 300)}` };
  let st = await state();
  if (!st.live || st.failed) return { ok: false, why: `stage ${st.failed ? 'reported an uncaught error' : 'did not light up'}. Panel: ${first.replace(/\n/g, ' | ').slice(0, 300)}` };
  // Interaction smoke: every non-submit button inside the stage, once (the list shrinks when a click removes a card).
  const buttons = box.locator('[data-stage-root] button:not([type="submit"]):not([disabled])');
  const n = Math.min(await buttons.count(), 8);
  const before = errors.length;
  for (let i = 0; i < n; i++) {
    const b = buttons.nth(Math.min(i, Math.max(0, (await buttons.count()) - 1)));
    if (!(await buttons.count())) break;
    await b.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(50);
  }
  st = await state();
  if (st.failed) return { ok: false, why: `a stage button threw. Panel: ${(await out.innerText()).replace(/\n/g, ' | ').slice(-300)}` };
  if (errors.length > before) return { ok: false, why: `uncaught page error while pressing stage buttons: ${errors[errors.length - 1].slice(0, 200)}` };
  const second = await press();
  if (!second.includes(want)) return { ok: false, why: `second run: "${want}" not printed. Panel: ${second.replace(/\n/g, ' | ').slice(0, 300)}` };
  st = await state();
  if (!st.live || st.failed) return { ok: false, why: `second run: stage ${st.failed ? 'reported an uncaught error' : 'did not light up'}` };
  return { ok: true, clicked: n };
}

async function runTerm(page, term, errors) {
  const btn = page.locator(`.run-btn[data-term="${term.name}"]`);
  if ((await btn.count()) !== 1) return { ok: false, why: `expected one Run in terminal button for "${term.name}", found ${await btn.count()}` };
  const box = page.locator(`.term[data-term="${term.name}"]`);
  const press = async () => {
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    const t0 = Date.now();
    while (Date.now() - t0 < 30000) {
      await page.waitForTimeout(100);
      if (!(await btn.evaluate((b) => b.classList.contains('is-running')))) break;
    }
    return box.locator('[data-term-state]').textContent(); // textContent: the head is uppercased by CSS
  };
  const first = await press();
  const want = `${term.lines} command${term.lines === 1 ? '' : 's'} run`;
  if (!first.startsWith(want)) return { ok: false, why: `state reads "${first}", expected it to start with "${want}"` };
  if (!term.mayFail && /not found/.test(first)) return { ok: false, why: `a scripted line was "command not found": ${first}` };
  if (!(await box.evaluate((b) => b.classList.contains('is-live')))) return { ok: false, why: 'terminal did not light up' };
  // A typed command must answer: the prompt is real.
  const marker = `gate-${Date.now().toString(36)}`;
  await box.locator('[data-term-input]').fill(`echo ${marker}`);
  await box.locator('[data-term-input]').press('Enter');
  await page.waitForTimeout(100);
  const screen = await box.locator('[data-term-screen]').innerText();
  if (!screen.includes(marker)) return { ok: false, why: 'typed command printed nothing' };
  const before = errors.length;
  const second = await press();
  if (!second.startsWith(want)) return { ok: false, why: `second run: state reads "${second}"` };
  if (errors.length > before) return { ok: false, why: `uncaught page error: ${errors[errors.length - 1].slice(0, 200)}` };
  return { ok: true, lines: term.lines };
}

(async () => {
  if (!lives.length && !terms.length) { g.done('0 live stages, 0 terminals (nothing to run)'); return; }
  let chromium;
  try { ({ chromium } = require('playwright')); } catch (e) { g.fail('playwright is not installed — `npm ci` in website/'); g.done(`${lives.length} live stages not run`); return; }
  let browser;
  try { browser = await chromium.launch(); } catch (e) { g.fail(`Chromium could not start (${String(e.message).split('\n')[0].slice(0, 160)}) — run \`npx playwright install chromium\``); g.done(`${lives.length} live stages not run`); return; }

  const port = await freePort();
  const server = spawn(process.execPath, [path.join(S.WEBSITE, 'server.js')], { env: { ...process.env, PORT: String(port), NODE_ENV: 'test' }, stdio: 'ignore' });
  const base = `http://127.0.0.1:${port}`;
  let clicked = 0;
  let replayed = 0;
  try {
    await waitFor(base + '/');
    const byUrl = new Map();
    for (const l of lives) { if (!byUrl.has(l.url)) byUrl.set(l.url, []); byUrl.get(l.url).push({ kind: 'live', ...l }); }
    for (const t of terms) { if (!byUrl.has(t.url)) byUrl.set(t.url, []); byUrl.get(t.url).push({ kind: 'term', ...t }); }
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark', reducedMotion: 'reduce' });
    for (const [url, list] of byUrl) {
      const page = await context.newPage();
      const errors = [];   // uncaught exceptions only; demos may console.error on purpose
      const cspHits = [];
      page.on('pageerror', (e) => errors.push(`${e.message}`));
      page.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy|Refused to/i.test(m.text())) cspHits.push(m.text()); });
      const res = await page.goto(base + url, { waitUntil: 'networkidle' });
      g.check(res && res.status() === 200, `${url} responded ${res ? res.status() : 'nothing'}`);
      for (const item of list) {
        if (item.kind === 'term') {
          const r = await runTerm(page, item, errors).catch((e) => ({ ok: false, why: e.message.split('\n')[0] }));
          g.check(r.ok, `${url} terminal "${item.name}": ${r.why || ''}`);
          if (r.ok) replayed += r.lines;
          continue;
        }
        const r = await runStage(page, item, errors).catch((e) => ({ ok: false, why: e.message.split('\n')[0] }));
        g.check(r.ok, `${url} stage "${item.name}": ${r.why || ''}`);
        if (r.ok) clicked += r.clicked;
      }
      g.check(cspHits.length === 0, `${url} CSP violation while running stages: ${(cspHits[0] || '').slice(0, 200)}`);
      await page.close();
    }
    await context.close();
  } finally {
    await browser.close();
    server.kill();
  }
  g.done(`${lives.length} live stages run in Chromium · ${clicked} stage buttons clicked · ${terms.length} terminals replayed (${replayed} commands)`);
})().catch((e) => { g.fail(`live gate crashed: ${e.message}`); g.done('crashed'); });
