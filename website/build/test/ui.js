// Browser regressions for responsive layout, keyboard navigation and motion preferences.
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const { chromium } = require('playwright');
const S = require('../sources.config');
const g = require('./lib').gate('ui');
const curriculum = require('../path').loadPath(require('../registry').parseRegistry());
const added = curriculum.sessions.filter(s => s.id === '2.5' || s.unit >= 4);
const targets = [...new Set(['/', '/path/', '/path/2-4-enchantments/', '/path/1-1-welcome-to-the-new-world/', '/practice/algocasts/reversestring/', '/languages/python/api/', '/search/?q=enchantments', '/mindset/knowing-what-you-are-talking-about/', ...added.map(s => s.url)])];
async function freePort() {
  return new Promise((resolve, reject) => {
    const socket = net.createServer();
    socket.on('error', reject);
    socket.listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(() => resolve(port)); });
  });
}
(async () => {
  const port = await freePort();
  const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [path.join(S.WEBSITE, 'server.js')], { env: { ...process.env, PORT: String(port), NODE_ENV: 'test' }, stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { ready = (await fetch(base)).ok; } catch { /* starting */ }
      if (ready) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    if (!ready) throw new Error('server did not start');
    browser = await chromium.launch();
    for (const width of [1440, 834, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && /Content Security Policy|Refused to/i.test(m.text())) errors.push(m.text()); });
      for (const url of targets) {
        const response = await page.goto(base + url, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        g.check(response.status() === 200, `${width} ${url}: HTTP ${response.status()}`);
        g.check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} ${url}: document overflows horizontally`);
        const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.src));
        g.check(!broken.length, `${width} ${url}: broken images ${broken.join(', ')}`);
        if (url === '/mindset/knowing-what-you-are-talking-about/') {
          const decoded = await page.locator('.prose img').evaluateAll(async images => {
            return Promise.all(images.map(async image => {
              image.loading = 'eager';
              try { await image.decode(); return { src: image.src, ok: image.naturalWidth > 0 }; }
              catch { return { src: image.src, ok: false }; }
            }));
          });
          g.check(decoded.every(image => image.ok), `${width}: guide images decode: ${JSON.stringify(decoded.filter(image => !image.ok))}`);
          for (const file of ['mvc.svg', 'mern-architecture.svg']) g.check(decoded.some(image => image.src.includes(file) && image.ok), `${width}: ${file} renders`);
          const outline = page.locator('.sidebar .guide-tree');
          g.check(await outline.locator('.tree-group').count() === 10, `${width}: guide has ten chapters`);
          g.check(await outline.locator('a[href^="#"]').count() === await page.locator('.prose h2, .prose h3').count(), `${width}: guide outline includes every heading`);
          g.check(await outline.locator('.guide-subtopics a').count() === 19, `${width}: guide nests nineteen subtopics`);
          let nav = page.locator('.sidebar');
          if (width === 834) { await page.locator('[data-open="side-drawer"]').click(); nav = page.locator('#side-drawer'); }
          if (width === 390) { await page.locator('.hamburger').click(); nav = page.locator('#nav-drawer'); }
          const group = nav.locator('.guide-tree .tree-group').filter({ has: page.locator('button', { hasText: 'JavaScript interviews' }) });
          const toggle = group.locator('button');
          if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
          await group.locator('a[href="#closure"]').click();
          await page.waitForFunction(() => location.hash === '#closure');
          await page.waitForFunction(() => document.querySelector('.sidebar .guide-tree a[href="#closure"]').getAttribute('aria-current') === 'location');
          g.check(true, `${width}: nested guide navigation and scroll tracking work`);
        }
        if (width === 390 && added.some(s => s.url === url)) {
          const run = page.locator('.run-btn').first();
          await run.click();
          await page.waitForFunction(() => [...document.querySelectorAll('.code-out:not([hidden]) .code-out-body')].some(el => el.textContent.includes('ok: checkpoint-')), undefined, { timeout: 10000 });
          g.check(true, `${url}: new curriculum checkpoint executes in the browser`);
        }
      }
      await page.goto(base + '/');
      await page.keyboard.press('Control+k');
      await page.locator('#palette-input').fill('Enchantments');
      await page.locator('#palette-results a[href="/path/2-4-enchantments/"]').waitFor();
      await page.keyboard.press('Enter');
      await page.waitForURL(base + '/path/2-4-enchantments/');
      g.check(true, `${width}: keyboard search navigates to the lesson`);
      await page.keyboard.press('Control+k');
      await page.locator('#palette-input').waitFor({ state: 'visible' });
      await page.keyboard.press('Escape');
      g.check(await page.locator('#palette').isHidden(), `${width}: Escape closes search`);
      if (width === 390) {
        await page.locator('.hamburger').click();
        g.check(await page.locator('#nav-drawer').isVisible(), 'mobile menu opens');
        await page.keyboard.press('Escape');
        g.check(await page.locator('#nav-drawer').isHidden(), 'Escape closes mobile menu');
        g.check(await page.locator('.hamburger').evaluate((e) => e === document.activeElement), 'mobile menu restores focus');
        const lastStep = page.locator('.step-rail a').last();
        await page.goto(base + '/languages/python/api/');
        await lastStep.scrollIntoViewIfNeeded();
        g.check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'language steps scroll within their rail');
      }
      g.check(!errors.length, `${width}: browser errors: ${errors.join(' | ')}`);
      await context.close();
    }
    for (const reducedMotion of ['reduce', 'no-preference']) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await page.goto(base + '/path/2-4-enchantments/');
      for (const name of ['lift', 'spin']) {
        await page.locator(`.run-btn[data-stage="${name}"]`).click();
        await page.locator(`.stage[data-stage="${name}"].is-live`).waitFor();
      }
      await page.waitForTimeout(450);
      const spins = await page.locator('.stage[data-stage="spin"] #ring').evaluate((e) => e.getAnimations().length);
      g.check(reducedMotion === 'reduce' ? spins === 0 : spins === 1, `${reducedMotion}: spinner respects motion preference`);
      if (reducedMotion === 'reduce') {
        const lift = await page.locator('.stage[data-stage="lift"] #card').evaluate((e) => ({ property: getComputedStyle(e).transitionProperty, animations: e.getAnimations().length }));
        g.check(lift.property === 'none' && lift.animations === 0, 'reduced motion disables lift transitions');
      }
      await context.close();
    }
    const missing = await fetch(base + '/does-not-exist/');
    g.check(missing.status === 404, 'unknown routes return HTTP 404');
    const redirect = await fetch(base + '/algorithms/sorting/', { redirect: 'manual' });
    g.check(redirect.status === 301 && redirect.headers.get('location') === '/algorithms/#sorting', 'group URL redirects to its section');
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
  g.done(`${targets.length * 3} page/viewport checks · ${added.length} curriculum checkpoints · keyboard search · mobile menu · motion preferences · HTTP routes`);
})().catch((e) => { g.fail(e.stack || e.message); g.done('crashed'); });
