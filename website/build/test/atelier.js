// Atelier teaches reproducible CSS. Check the visible lessons AND their actual examples.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const S = require('../sources.config');
const { parseRegistry } = require('../registry');
const L = require('./lib');
const g = L.gate('atelier');
const lessons = parseRegistry().pages.filter(p => /^ATELIER-\d+$/.test(p.id) && p.id !== 'ATELIER-00');
const demo = n => `/assets/atelier/${String(n).padStart(2, '0')}/index.html`;
const content = path.join(S.CONTENT, 'atelier');
const publicLab = path.join(S.PUBLIC, 'assets', 'atelier');
g.check(lessons.length === 10, 'the workshop must contain all ten lessons');
for (const [index, lesson] of lessons.entries()) {
  const num = String(index + 1).padStart(2, '0');
  const md = fs.readFileSync(path.join(S.WEBSITE, lesson.source), 'utf8');
  const html = fs.readFileSync(path.join(S.PUBLIC, lesson.url, 'index.html'), 'utf8');
  g.check(/!\[[^\]]+\]\(images\//.test(md), `${lesson.id}: no instructional screenshot`);
  g.check((md.match(/^```(?:css|html|js) /gm) || []).length >= 2, `${lesson.id}: missing code walkthrough`);
  g.check(html.includes(demo(index + 1)), `${lesson.id}: missing finished example link`);
  g.check(html.includes(`/assets/atelier/downloads/${num}.zip`), `${lesson.id}: missing starter/finish download`);
  g.check(!/gift[- ]sites?|How King Chrissy and/i.test(md), `${lesson.id}: unexplained old framing`);
  // Learners must be able to copy every labeled addition into the corresponding example.
  for (const block of md.matchAll(/^```(css|html|js) (styles\.css|index\.html|app\.js) · checkpoint [^\n]+\n([\s\S]*?)\n```/gm)) {
    const source = fs.readFileSync(path.join(content, num, block[2]), 'utf8');
    g.check(source.includes(block[3]), `${lesson.id}: displayed ${block[2]} addition differs from the working file`);
  }
  for (const name of fs.readdirSync(path.join(content, num))) {
    g.check(fs.readFileSync(path.join(content, num, name)).equals(fs.readFileSync(path.join(publicLab, num, name))), `${num}/${name}: published file differs from source`);
  }
  // These runnable assets are outside the normal page registry; keep its active-content boundary.
  const example = fs.readFileSync(path.join(publicLab, num, 'index.html'), 'utf8');
  g.check(!/<script\b(?![^>]*\bsrc=)|\son\w+\s*=|javascript:|<iframe\b/i.test(example), `${num}: unexpected inline or embedded active content`);
  for (const ref of example.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (ref[1].startsWith('#')) continue;
    g.check(!/^(?:https?:)?\/\//.test(ref[1]), `${num}: external dependency ${ref[1]}`);
    g.check(fs.existsSync(path.resolve(publicLab, num, ref[1])), `${num}: missing dependency ${ref[1]}`);
  }
}
async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer(); server.on('error', reject);
    server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)); });
  });
}
async function readyImages(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    return Promise.all([...document.images].map(async image => {
      image.loading = 'eager';
      try { await image.decode(); return image.naturalWidth > 0; } catch { return false; }
    }));
  });
}
(async () => {
  const port = await freePort(); const base = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, [path.join(S.WEBSITE, 'server.js')], { env: { ...process.env, PORT: String(port), NODE_ENV: 'test' }, stdio: 'ignore' });
  let browser;
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try { ready = (await fetch(base)).ok; } catch {}
      if (ready) break;
      await new Promise(r => setTimeout(r, 100));
    }
    if (!ready) throw new Error('server did not start');
    browser = await chromium.launch();
    const errors = [];
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error' && /Content Security Policy|Refused to/i.test(message.text())) errors.push(message.text()); });
      for (const url of ['/atelier/', ...lessons.map(p => p.url), ...lessons.map((_, i) => demo(i + 1))]) {
        const response = await page.goto(base + url, { waitUntil: 'load' });
        g.check(response.status() === 200, `${width} ${url}: HTTP ${response.status()}`);
        g.check((await readyImages(page)).every(Boolean), `${width} ${url}: image failed to decode`);
        g.check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} ${url}: horizontal overflow`);
      }
      if (width === 390) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.keyboard.press('Tab');
        g.check(await page.locator('.skip').evaluate(e => e === document.activeElement), 'skip link is first keyboard target');
        await page.keyboard.press('Enter');
        g.check(await page.locator('#main').evaluate(e => e === document.activeElement), 'skip link focuses main');
        await page.locator('#menu-button').focus(); await page.keyboard.press('Enter');
        g.check(await page.locator('#menu').evaluate(e => e.open), 'keyboard opens menu');
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => document.querySelector('#menu-button').getAttribute('aria-expanded') === 'false');
        g.check(await page.locator('#menu-button').evaluate(e => e === document.activeElement), 'Escape returns menu focus');
        await page.locator('#menu-button').click();
        await page.setViewportSize({ width: 1000, height: 900 });
        await page.waitForFunction(() => !document.querySelector('#menu').open);
        g.check(await page.locator('.nav-links').isVisible(), 'desktop resize restores links');
      }
      g.check(await page.locator('.marquee-track').evaluate(e => getComputedStyle(e).animationName === 'none'), 'reduced motion stops marquee');
      g.check(await page.locator('.reveal').evaluateAll(es => es.every(e => getComputedStyle(e).opacity === '1')), 'reduced motion keeps cards visible');
      await page.locator('#preview-gate').click(); await page.locator('#enter-gate').click();
      await page.waitForFunction(() => !document.querySelector('#gate').open);
      g.check(await page.locator('#preview-gate').evaluate(e => e === document.activeElement), 'reduced-motion gate closes and restores focus');
      await page.close();
    }
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base + demo(10)); await readyImages(page);
    g.check(await page.locator('#tone').evaluate(e => e.paused), 'sound does not autoplay');
    await page.locator('.card').first().scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.card').classList.contains('is-visible'));
    await page.locator('.card').first().hover();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.card')).translate === '0px -4px');
    g.check(await page.locator('.site-nav').evaluate(e => e.classList.contains('scrolled')), 'scroll applies frosted nav');
    const under = await page.locator('.nav-links a').first().evaluate(e => getComputedStyle(e, '::after').right);
    await page.locator('.nav-links a').first().focus();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.nav-links a'), '::after').right === '0px');
    g.check(under !== '0px', 'underline grows from collapsed to full width on keyboard focus');
    await page.locator('#pause-motion').click();
    g.check(await page.locator('.marquee-track').evaluate(e => getComputedStyle(e).animationPlayState === 'paused'), 'pause control stops animation');
    await page.locator('#pause-motion').click();
    g.check(await page.locator('.marquee-track').evaluate(e => getComputedStyle(e).animationPlayState === 'running'), 'resume continues animation');
    const groups = await page.locator('.marquee-group').evaluateAll(es => es.map(e => e.getBoundingClientRect().width));
    const trackWidth = await page.locator('.marquee-track').evaluate(e => e.getBoundingClientRect().width);
    g.check(Math.abs(groups[0] - groups[1]) < 1 && Math.abs(trackWidth / 2 - groups[0]) < 1, 'two equal groups exactly fill the moving track');
    await page.locator('#preview-gate').click(); await page.locator('#enter-gate').click();
    await page.waitForFunction(() => !document.querySelector('#gate').open);
    await page.locator('#preview-gate').click(); await page.locator('#enter-gate').click(); await page.keyboard.press('Escape');
    await page.locator('#preview-gate').click();
    await page.waitForTimeout(650);
    g.check(await page.locator('#gate').evaluate(e => e.open), 'an old fade timer cannot close a reopened gate');
    await page.keyboard.press('Escape');
    await page.locator('#cursor-button').click(); await page.mouse.move(300, 200);
    g.check(await page.locator('.cursor-dot').evaluate(e => getComputedStyle(e).translate === '300px 200px' && getComputedStyle(e).pointerEvents === 'none'), 'decorative cursor follows without intercepting clicks');
    await page.locator('#sound-button').click();
    await page.waitForFunction(() => !document.querySelector('#tone').paused && document.querySelector('#sound-button').getAttribute('aria-pressed') === 'true');
    g.check(await page.locator('#sound-button').getAttribute('aria-pressed') === 'true', 'sound control reflects actual playback');
    await page.waitForFunction(() => document.querySelector('#tone').ended);
    g.check(await page.locator('#sound-button').getAttribute('aria-pressed') === 'false', 'sound control resets after playback');
    await page.route('**/tone.wav*', route => route.abort());
    await page.evaluate(() => { const audio = document.querySelector('#tone'); audio.src = '../shared/tone.wav?missing-test'; audio.load(); });
    await page.locator('#sound-button').click();
    await page.waitForFunction(() => document.querySelector('#sound-status').textContent.length > 0);
    g.check(await page.locator('#sound-button').getAttribute('aria-pressed') === 'false', 'failed playback does not leave a false playing state');
    await page.close();
    // Every checkpoint also works directly from disk, without a local server or JavaScript.
    const offline = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
    for (let n = 1; n <= 10; n++) {
      await offline.goto('file://' + path.join(publicLab, String(n).padStart(2, '0'), 'index.html'));
      g.check((await readyImages(offline)).every(Boolean), `${n}: offline image failure`);
      g.check(await offline.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${n}: narrow offline overflow`);
      if (n >= 3) {
        g.check(await offline.locator('.nav-links').isVisible(), `${n}: navigation unavailable without JS`);
        g.check(!await offline.locator('#menu-button').isVisible(), `${n}: dead menu control without JS`);
      }
      if (n >= 7) g.check(await offline.locator('.reveal').evaluateAll(es => es.every(e => getComputedStyle(e).opacity === '1')), `${n}: invisible cards without JS`);
    }
    await offline.close();
    const local = await browser.newPage({ reducedMotion: 'reduce' });
    await local.goto('file://' + path.join(publicLab, '10', 'index.html'));
    g.check((await readyImages(local)).every(Boolean), 'complete example images work from disk');
    await local.locator('#preview-gate').click(); await local.locator('#enter-gate').click();
    await local.waitForFunction(() => !document.querySelector('#gate').open);
    g.check(await local.locator('#preview-gate').evaluate(e => e === document.activeElement), 'interactive example works directly from disk');
    await local.close();
    g.check(errors.length === 0, `browser or CSP errors: ${errors.join('; ')}`);
  } finally { if (browser) await browser.close(); server.kill(); }
  g.done('10 visual lessons; 10 working checkpoints; desktop, phone, offline, keyboard, motion, menu, gate, cursor, sound');
})().catch(error => { console.error(error); process.exitCode = 1; });
