#!/usr/bin/env node
// Screenshot the built site at the three reference viewports (1440 / 834 / 390) into ../screenshots/.
//
//   npm run screenshots                 # serves public/ on a free port, shoots, exits
//   BASE_URL=http://localhost:31803 npm run screenshots   # shoot a running server instead
//   npm run screenshots -- --only=home,lesson   # subset by key
//   npm run screenshots -- --full               # full-page captures instead of the first viewport
//
// One page of every template is captured (see PAGES). File names: <key>-<width>.png, so a second run
// can be diffed against the committed baseline with any image-diff tool (or `git diff --stat screenshots/`).
// Needs a Playwright Chromium: `npx playwright install chromium` (set PLAYWRIGHT_BROWSERS_PATH if you keep
// browsers somewhere other than ~/.cache/ms-playwright).

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const net = require('net');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(ROOT, '..', 'screenshots');
const PUBLIC = path.join(ROOT, 'public');
const { parseRegistry } = require(path.join(ROOT, 'build/registry.js'));

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 834, height: 1112 },
  { width: 390, height: 844 },
];

// key → { url | template, note }. `template` picks the first registry page of that template.
const PAGES = [
  { key: 'home', url: '/' },
  { key: 'path', url: '/path/' },
  { key: 'session', template: 'T-SESSION' },
  { key: 'enchantments', url: '/path/2-4-enchantments/' },
  { key: 'landing', url: '/algorithms/' },
  { key: 'lesson', template: 'T-LESSON' },
  { key: 'article', url: '/system-design/digital-mansion-primer/' },
  { key: 'prep', template: 'T-PREP' },
  { key: 'exercise', template: 'T-EXERCISE' },
  { key: 'lang-index', url: '/languages/python/' },
  { key: 'lang', url: '/languages/python/api/' },
  { key: 'frontend', url: '/languages/frontend/react/' },
  { key: 'mindset', url: '/mindset/knowing-what-you-are-talking-about/' },
  { key: 'search', url: '/search/?q=binary' },
  { key: 'credits', url: '/credits/' },
  { key: '404', url: '/this-page-does-not-exist/' },
];

const args = process.argv.slice(2);
const only = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '').split(',').filter(Boolean);
const fullPage = args.includes('--full');

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

async function main() {
  if (!fs.existsSync(path.join(PUBLIC, 'index.html'))) {
    console.error('public/index.html missing — run `npm run build` first.');
    process.exit(1);
  }
  let chromium;
  try { ({ chromium } = require('playwright')); } catch (e) {
    console.error('playwright is not installed — `npm ci` then `npx playwright install chromium`.');
    process.exit(1);
  }

  const reg = parseRegistry();
  const targets = PAGES.filter((p) => !only.length || only.includes(p.key)).map((p) => {
    if (p.url) return p;
    const page = reg.pages.find((x) => x.template === p.template);
    if (!page) throw new Error(`no registry page with template ${p.template}`);
    return { ...p, url: page.url };
  });

  let base = process.env.BASE_URL;
  let child = null;
  if (!base) {
    const port = await freePort();
    child = spawn(process.execPath, [path.join(ROOT, 'server.js')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
    base = `http://127.0.0.1:${port}`;
    await waitFor(base + '/');
  }

  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const manifest = [];
  try {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'no-preference', colorScheme: 'dark' });
      const page = await context.newPage();
      for (const t of targets) {
        const res = await page.goto(base + t.url, { waitUntil: 'networkidle' });
        // Fonts are self-hosted; make sure they are applied before the capture.
        await page.evaluate(() => document.fonts && document.fonts.ready);
        await page.waitForTimeout(250);
        const file = `${t.key}-${vp.width}.png`;
        await page.screenshot({ path: path.join(OUT, file), fullPage });
        manifest.push({ file, url: t.url, viewport: `${vp.width}x${vp.height}`, status: res ? res.status() : null });
        process.stdout.write(`  ${file.padEnd(22)} ${String(res ? res.status() : '-').padEnd(4)} ${t.url}\n`);
      }
      await context.close();
    }
  } finally {
    await browser.close();
    if (child) child.kill();
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ takenAt: new Date().toISOString(), base, fullPage, shots: manifest }, null, 2) + '\n');
  console.log(`\n${manifest.length} screenshots → ${path.relative(process.cwd(), OUT)}/ (manifest.json lists url · viewport · status)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
