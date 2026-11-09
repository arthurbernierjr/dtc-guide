#!/usr/bin/env node
// Build: SITEMAP-AND-USER-STORIES.md (the registry) → public/. Every page in the registry is rendered; nothing else is.
const path = require('path');
const fs = require('fs');
const S = require('./sources.config');
const U = require('./util');
const site = require('./site.config');
const { parseRegistry, groupRedirects } = require('./registry');
const { renderHoltPage } = require('./pages/holt');
const { renderPrepPage } = require('./pages/prep');
const { renderExercisePage } = require('./pages/exercise');
const { renderLangPage, renderLangIndexPage } = require('./pages/lang');
const { renderArticlePage } = require('./pages/article');
const { renderLandingPage } = require('./pages/landing');
const { renderHomePage, renderCreditsPage, renderSearchPage, render404Page } = require('./pages/global');
const { renderPathIndexPage, renderSessionPage } = require('./pages/path');
const { loadPath } = require('./path');

const DEV = process.env.DTC_DEV === '1';

const RENDERERS = {
  'T-HOME': renderHomePage,
  'T-LANDING': renderLandingPage,
  'T-LESSON': renderHoltPage,
  'T-PREP': renderPrepPage,
  'T-EXERCISE': renderExercisePage,
  'T-LANG': renderLangPage,
  'T-LANG-INDEX': renderLangIndexPage,
  'T-ARTICLE': renderArticlePage,
  'T-CREDITS': renderCreditsPage,
  'T-PRIVACY': require('./pages/privacy'),
  'T-SEARCH': renderSearchPage,
  'T-404': render404Page,
  'T-PATH': renderPathIndexPage,
  'T-SESSION': renderSessionPage,
};

function outPathFor(url) {
  if (url === '/404.html') return path.join(S.PUBLIC, '404.html');
  return path.join(S.PUBLIC, url.replace(/^\//, ''), 'index.html');
}

function loadVerification() {
  const p = path.join(S.CONTENT, 'verification.json');
  if (!U.exists(p)) return {};
  return JSON.parse(U.read(p));
}

function cleanPublic() {
  // public/ is generated except: assets/fonts, assets/brand, assets/og-image.jpg, licenses, the favicons and apple-touch-icon.png
  const keep = new Set(['assets', 'licenses', 'favicon-32.png', 'favicon-16.png', 'apple-touch-icon.png']);
  if (U.exists(S.PUBLIC)) {
    for (const e of fs.readdirSync(S.PUBLIC)) if (!keep.has(e)) U.rmrf(path.join(S.PUBLIC, e));
    const assets = path.join(S.PUBLIC, 'assets');
    if (U.exists(assets)) for (const e of fs.readdirSync(assets)) if (!['fonts', 'brand', 'og-image.jpg'].includes(e)) U.rmrf(path.join(assets, e));
  }
  U.ensureDir(S.PUBLIC);
}

function copyClient(buildId) {
  const client = path.join(__dirname, 'client');
  for (const f of fs.readdirSync(client)) {
    const src = path.join(client, f);
    if (fs.statSync(src).isFile()) U.copy(src, path.join(S.PUBLIC, f));
  }
  const mini = path.join(S.WEBSITE, 'node_modules', 'minisearch', 'dist', 'umd', 'index.js');
  if (U.exists(mini)) U.copy(mini, path.join(S.PUBLIC, 'vendor', 'minisearch.min.js'));
  else console.warn('warn: minisearch UMD not found; run npm install');
  // Diagrams: flat files (hand-drawn SVGs) and one subdirectory per set from the Remotion project.
  const diagrams = path.join(__dirname, 'assets', 'diagrams');
  const copyTree = (from, to) => {
    for (const f of fs.readdirSync(from)) {
      const src = path.join(from, f);
      if (fs.statSync(src).isDirectory()) copyTree(src, path.join(to, f));
      else U.copy(src, path.join(to, f));
    }
  };
  copyTree(diagrams, path.join(S.PUBLIC, 'assets', 'diagrams'));
  copyTree(path.join(S.CONTENT, 'video-posters'), path.join(S.PUBLIC, 'assets', 'video-posters'));
  copyTree(path.join(S.CONTENT, 'atelier'), path.join(S.PUBLIC, 'assets', 'atelier'));
}

// The language guides, mindset articles and system design primer are Arthur Bernier Jr's own
// pre-course material. Nothing on the site may name or link the former course provider or the
// old class sites. The build fails hard if any rendered page does.
const FORBIDDEN_MENTIONS = [
  /general\s*assembly/i,
  /generalassemb\.ly/i,
  /evelyn/i,
  /sfs-flex/i,
  /donna-frances/i,
  /\bSEIR?\b/,
];
function assertNoForbiddenMentions(page, html) {
  for (const re of FORBIDDEN_MENTIONS) {
    const m = html.match(re);
    if (m) {
      const i = html.indexOf(m[0]);
      throw new Error(`${page.id} ${page.url}: forbidden mention ${re} near "${html.slice(Math.max(0, i - 60), i + 60).replace(/\s+/g, ' ')}"`);
    }
  }
}

function sitemapXml(reg) {
  const origin = site.origin.replace(/\/$/, '');
  const urls = reg.pages.filter((p) => p.url !== '/404.html').map((p) => `  <url><loc>${origin}${p.url}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  const t0 = Date.now();
  const reg = parseRegistry();
  const verification = loadVerification();
  const buildId = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
  const ctx = { reg, total: reg.total, buildId, verification, dev: DEV };
  ctx.path = loadPath(reg);

  cleanPublic();
  copyClient(buildId);

  const searchIndex = [];
  const manifest = {};
  const missingVerification = [];
  const codeBlocks = [];
  const runnables = [];
  const lives = [];
  const terms = [];
  let n = 0;
  for (const page of reg.pages) {
    const render = RENDERERS[page.template];
    if (!render) throw new Error(`No renderer for template ${page.template} (${page.id})`);
    let out;
    try {
      out = await render(ctx, page);
    } catch (e) {
      e.message = `${page.id} ${page.url}: ${e.message}`;
      throw e;
    }
    assertNoForbiddenMentions(page, out.html);
    U.write(outPathFor(page.url), out.html);
    manifest[page.url] = { id: page.id, template: page.template, section: page.section, group: page.group, title: page.title, facts: out.facts || {} };
    if (out.search !== null) {
      searchIndex.push({
        id: page.id,
        url: page.url,
        title: page.title,
        section: page.section,
        group: page.group,
        template: page.template,
        headings: (out.search && out.search.headings) || [],
        say: (out.search && out.search.say) || '',
        text: U.truncate((out.search && out.search.text) || '', 300),
      });
    }
    if (out.codeBlocks) for (const cb of out.codeBlocks) codeBlocks.push({ url: page.url, ...cb });
    if (out.runnable) runnables.push({ url: page.url, ...out.runnable });
    if (out.runnables) for (const r of out.runnables) runnables.push({ url: page.url, ...r });
    if (out.lives) for (const l of out.lives) lives.push({ url: page.url, ...l });
    if (out.terms) for (const t of out.terms) terms.push({ url: page.url, ...t });
    if (!verification[page.url] && !['T-SEARCH', 'T-404'].includes(page.template)) missingVerification.push(page.url);
    n++;
    if (n % 25 === 0) process.stdout.write(`  …${n}/${reg.total}\n`);
  }

  // The 404 page is also written as /404/index.html? No: Express serves 404.html for unknown paths only.
  U.write(path.join(S.PUBLIC, 'save-lessons.json'), JSON.stringify(ctx.path.written.map(s => ({id:s.id,url:s.url,title:s.title,unit:s.unit,act:s.act.id,color:s.color,week:s.week,position:s.position,read:s.read || 45,hook:s.hook || s.subtitle || ''}))));
  U.write(path.join(S.PUBLIC, 'runner-sources.json'), JSON.stringify(Object.fromEntries([...runnables.filter(r => r.mode !== 'node').map(r => ['/assets/src/' + r.rel, 'worker']), ...lives.map(r => [r.src, 'live'])])));
  U.write(path.join(S.PUBLIC, 'search-index.json'), JSON.stringify(searchIndex));
  U.write(path.join(S.PUBLIC, 'sitemap.xml'), sitemapXml(reg));
  U.write(path.join(S.PUBLIC, 'redirects.json'), JSON.stringify(groupRedirects(reg), null, 2));
  U.write(path.join(S.PUBLIC, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.origin.replace(/\/$/, '')}/sitemap.xml\n`);
  U.write(path.join(S.WEBSITE, 'build', '.manifest.json'), JSON.stringify({ buildId, total: reg.total, pages: manifest, codeBlocks, runnables, lives, terms }, null, 1));

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`built ${n}/${reg.total} pages in ${secs}s → public/ (build ${buildId})`);
  if (missingVerification.length) {
    const msg = `${missingVerification.length} page(s) have no entry in content/verification.json`;
    if (DEV) console.warn(`warn: ${msg} (DTC_DEV=1, continuing). First: ${missingVerification.slice(0, 5).join(', ')}`);
    else {
      console.error(`error: ${msg}. Add entries (see qa/VERIFICATION.md) or build with DTC_DEV=1 while the verification pass is in progress.`);
      console.error(missingVerification.join('\n'));
      process.exit(2);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
