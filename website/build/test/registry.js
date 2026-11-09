// Gate 1 — the registry. SITEMAP-AND-USER-STORIES.md is the contract: public/ must contain
// exactly its pages (both directions), every page must carry the document's title/H1, and the
// machine-checkable Facts (header keys, section counts, test counts, H2s, framework, home stats)
// must match what was rendered. Also scans every byte under public/ for forbidden mentions.
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');
const { parseRegistry } = require('../registry');
const L = require('./lib');

const g = L.gate('registry');
const reg = parseRegistry();
const curriculum = require('../path').loadPath(reg);
g.check(curriculum.sessionsPerWeek === 3 && curriculum.sessions.length === 66 && curriculum.weeks.length === 22, 'self-paced route must preserve 66 sessions grouped three per suggested week');
g.check(curriculum.sessions.every((s, i) => s.position === i + 1 && !('day' in s) && !('dayName' in s)), 'sessions must have an ordered position without assigned weekdays');
g.check(curriculum.written.length === curriculum.sessions.length, `all ${curriculum.sessions.length} curriculum sessions must be published`);
const man = L.manifest();
const pages = L.listPages();

// The declared total in the sitemap header is the contract; it must equal the number of page blocks,
// and the per-section counts list must add up to it.
g.check(reg.declaredTotal !== null, 'sitemap header has no "**Total pages: N.**" line');
g.check(reg.declaredTotal === reg.total, `declared total ${reg.declaredTotal} ≠ ${reg.total} page blocks`);
{
  const md = fs.readFileSync(path.join(path.dirname(S.WEBSITE), 'SITEMAP-AND-USER-STORIES.md'), 'utf8');
  const counts = [...md.matchAll(/^- (?!\*\*Total)([A-Za-z ]+): (\d+)$/gm)];
  const sum = counts.reduce((a, m) => a + Number(m[2]), 0);
  g.check(sum === reg.total, `"Counts by section" sums to ${sum}, page blocks ${reg.total}`);
  for (const [, sec, n] of counts) g.check((reg.bySection[sec] || []).length === Number(n), `Counts by section says ${sec}: ${n}, blocks ${(reg.bySection[sec] || []).length}`);
}

// Both directions.
const regUrls = new Set(reg.pages.map((p) => p.url));
const pubUrls = new Set(pages.map((p) => p.url));
for (const u of regUrls) g.check(pubUrls.has(u), `missing from public/: ${u}`);
for (const u of pubUrls) g.check(regUrls.has(u), `extra page in public/ not in registry: ${u}`);
g.check(Object.keys(man.pages).length === reg.total, `manifest has ${Object.keys(man.pages).length} pages, expected ${reg.total}`);

function isSubsequence(small, big) {
  let j = 0;
  for (let i = 0; i < big.length && j < small.length; i++) if (big[i] === small[j]) j++;
  return j === small.length;
}
function fact(page, re) { for (const f of page.facts) { const m = f.match(re); if (m) return m; } return null; }
const site = require('../site.config');
const SITE = site.titleSuffix; // "I Respawned As A Super Coder" closes every <title>

for (const p of reg.pages) {
  const pub = pages.find((x) => x.url === p.url);
  if (!pub) continue;
  const html = fs.readFileSync(pub.file, 'utf8');
  const mf = (man.pages[p.url] && man.pages[p.url].facts) || {};
  const title = L.titleOf(html);
  const h1 = L.h1Of(html);
  const want = L.norm(p.title);

  g.check(title.includes(SITE), `${p.id} <title> lacks site name: "${title}"`);
  if (p.template === 'T-HOME') {
    // The H1 is the cover lockup: the visible text reads "I respawned as a / Super Coder / In a world with / Magic AI"
    // and its accessible name is the spoken sentence with the correction.
    g.check(/SUPER CODER/i.test(h1) && /Magic/.test(h1) && /AI/.test(h1), `${p.id} home H1 is not the cover lockup: "${h1}"`);
    g.check(html.includes(`<h1 class="lockup" aria-label="${site.spoken}`), `${p.id} home H1 lacks the spoken name as aria-label`);
  } else if (p.template === 'T-SESSION') {
    const sid = p.session ? p.session.id : '';
    g.check(title.startsWith(`${sid} ${want}`), `${p.id} <title> "${title}" does not start with "${sid} ${want}"`);
    g.check(h1 === want, `${p.id} H1 "${h1}" ≠ "${want}"`);
  } else {
    g.check(title.startsWith(want), `${p.id} <title> "${title}" does not start with "${want}"`);
    g.check(h1 === want, `${p.id} H1 "${h1}" ≠ "${want}"`);
  }
  g.check(html.includes(`<html`) && html.includes(`lang="en"`), `${p.id} missing <html lang="en">`);
  g.check(/<meta name="description" content="[^"]{20,}"/.test(html), `${p.id} missing a meta description (≥20 chars)`);

  const chips = L.chipsOf(html);
  const h2s = L.h2sOf(html);

  // Long-form article requirements count the actual published prose, excluding navigation.
  if (p.template === 'T-ARTICLE' && typeof p.minWords === 'number') {
    const prose = (html.match(/<div class="prose">([\s\S]*?)<\/div>/) || [,''])[1];
    const words = L.text(prose).split(/\s+/).filter(Boolean).length;
    g.check(words >= p.minWords, `${p.id} ${words} prose words, registry floor ${p.minWords}`);
  }

  if (p.template === 'T-PREP') {
    if (p.headerKeys) {
      // The glance card's <dl> holds exactly the header keys (the card is rendered twice: inline + rail).
      const glance = (html.match(/<div class="glance card">[\s\S]*?<dl>([\s\S]*?)<\/dl>/) || [, ''])[1];
      const dts = [...glance.matchAll(/<dt[^>]*>([^<]*)<\/dt>/g)].map((m) => L.norm(m[1]));
      g.check(JSON.stringify(dts) === JSON.stringify(p.headerKeys), `${p.id} glance keys ${JSON.stringify(dts)} ≠ ${JSON.stringify(p.headerKeys)}`);
    }
    if (typeof p.sectionCount === 'number') {
      g.check(mf.sectionCount === p.sectionCount, `${p.id} rendered ${mf.sectionCount} sections, registry says ${p.sectionCount}`);
      if (p.sectionCount > 0) g.check(chips.includes(`${p.sectionCount} section${p.sectionCount === 1 ? '' : 's'}`), `${p.id} missing "${p.sectionCount} sections" chip`);
      const blocks = (html.match(/<section class="block"/g) || []).length;
      g.check(blocks === p.sectionCount, `${p.id} ${blocks} section blocks in HTML, registry says ${p.sectionCount}`);
    }
    if (p.sectionTitles && mf.sectionTitles) {
      const a = p.sectionTitles.map(L.norm), b = mf.sectionTitles.map(L.norm);
      // The registry truncates long lists with "…"; compare the untruncated prefix.
      const n = a.findIndex((t) => t.endsWith('…')); const cmp = n === -1 ? a.length : n;
      g.check(JSON.stringify(a.slice(0, cmp)) === JSON.stringify(b.slice(0, cmp)), `${p.id} section titles differ: ${JSON.stringify(a.slice(0, cmp))} vs ${JSON.stringify(b.slice(0, cmp))}`);
    }
    if (p.okLine) g.check(mf.okLine === p.okLine, `${p.id} ok line "${mf.okLine}" ≠ "${p.okLine}"`);
  }

  if (p.template === 'T-EXERCISE') {
    if (typeof p.testCount === 'number') {
      g.check(mf.testCount === p.testCount, `${p.id} parsed ${mf.testCount} tests, registry says ${p.testCount}`);
      g.check(chips.includes(`${p.testCount} test${p.testCount === 1 ? '' : 's'}`), `${p.id} missing "${p.testCount} tests" chip`);
    }
    if (typeof p.alternateCount === 'number') {
      g.check(mf.alternateCount === p.alternateCount, `${p.id} ${mf.alternateCount} alternates, registry says ${p.alternateCount}`);
      if (p.alternateCount > 0) g.check(chips.includes(`${p.alternateCount} alternate${p.alternateCount === 1 ? '' : 's'}`), `${p.id} missing alternate chip`);
    }
    if (p.directionsFirstLine) {
      const body = L.text(html);
      g.check(body.includes(L.norm(p.directionsFirstLine)), `${p.id} directions first line not found: "${p.directionsFirstLine}"`);
    }
    if (p.helperFiles) g.check(JSON.stringify(mf.helperFiles || []) === JSON.stringify(p.helperFiles), `${p.id} helper files ${JSON.stringify(mf.helperFiles)} ≠ ${JSON.stringify(p.helperFiles)}`);
  }

  if (['T-LESSON', 'T-LANG', 'T-ARTICLE'].includes(p.template) && p.h2s && p.h2Count > 0 && !p.editorialNewPage) {
    // The document may declare that a source H2 is deliberately not rendered
    // ('"Files" H2 is NOT rendered here', 'TOC H2 dropped'); honour exactly those.
    const notes = p.facts.concat(p.accept || []).join('\n');
    const dropped = (h) => new RegExp(`"${h.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}" H2 is NOT rendered`).test(notes) || (h === 'Table of Contents' && /TOC H2 dropped/.test(notes));
    const want2 = p.h2s.map(L.norm).filter((t) => !t.endsWith('…') && !dropped(t));
    const ok = isSubsequence(want2, h2s);
    g.check(ok, `${p.id} H2s from the registry are not all present in order. Missing: ${JSON.stringify(want2.filter((t) => !h2s.includes(t)).slice(0, 4))}`);
    if (typeof p.h2Count === 'number' && mf.h2s) g.check(mf.h2s.length >= p.h2Count || p.template !== 'T-LESSON', `${p.id} rendered ${mf.h2s.length} H2s, registry says ${p.h2Count}`);
  }
  if (p.template === 'T-LESSON') {
    if (typeof p.videoCount === 'number') g.check(mf.videos === p.videoCount, `${p.id} ${mf.videos} videos, registry says ${p.videoCount}`);
    if (p.images) for (const img of p.images) g.check((mf.images || []).some((f) => f === img || f.startsWith(img.replace(/\.[a-z0-9]+$/i, ''))), `${p.id} image ${img} not copied`);
  }
  if (p.template === 'T-LANG') {
    if (p.framework) g.check(mf.framework === p.framework, `${p.id} framework "${mf.framework}" ≠ "${p.framework}"`);
    // Backend guides are a five-step path; the frontend guides and React cheatsheet are standalone.
    if (p.group !== 'Frontend') g.check(chips.some((c) => /^Step \d of \d$/.test(c)), `${p.id} missing "Step n of m" chip`);
    g.check(/class="lang-switch"/.test(html), `${p.id} missing language switcher`);
  }
  if (p.template === 'T-LANG-INDEX') {
    const sub = fact(p, /^Sub-pages: (\d+)/); const ds = fact(p, /^"Data Structures To Attempt": (\d+)/); const ch = fact(p, /^"Algo Challenges to Attempt": (\d+)/);
    if (sub) g.check(mf.subpages === Number(sub[1]), `${p.id} ${mf.subpages} sub-pages, registry says ${sub[1]}`);
    if (ds) g.check(mf.dataStructures === Number(ds[1]), `${p.id} ${mf.dataStructures} data-structure items, registry says ${ds[1]}`);
    if (ch) g.check(mf.challenges === Number(ch[1]), `${p.id} ${mf.challenges} challenges, registry says ${ch[1]}`);
  }
  if (p.template === 'T-PATH') {
    g.check(mf.weeks === p.weeks && mf.sessions === p.sessions, `${p.id} rendered ${mf.weeks} weeks / ${mf.sessions} sessions, registry says ${p.weeks} / ${p.sessions}`);
    const written = reg.pages.filter((x) => x.template === 'T-SESSION').length;
    g.check(mf.written === written, `${p.id} path index says ${mf.written} written, registry has ${written} T-SESSION pages`);
    const writtenCards = [...html.matchAll(/<article class="session-card card is-written"[\s\S]*?<\/article>/g)].map((m) => m[0]);
    for (const session of curriculum.written) {
      const card = writtenCards.find((c) => c.includes(`href="${session.url}"`)) || '';
      g.check(card.includes(`${session.read} min read`), `${session.id} card reading time differs from the session`);
      g.check(card.includes(`${session.page.diagramCount} diagrams`), `${session.id} card diagram count differs from the registry`);
      g.check(!card.includes('undefined'), `${session.id} card contains undefined metadata`);
    }
    const cards = (html.match(/class="session-card/g) || []).length;
    g.check(cards === p.sessions, `${p.id} renders ${cards} session cards, expected ${p.sessions} (one per session, written or empty)`);
    const empties = (html.match(/class="session-card is-empty"/g) || []).length;
    g.check(empties === p.sessions - written, `${p.id} ${empties} empty cards, expected ${p.sessions - written}`);
    for (let w = 1; w <= p.weeks; w++) g.check(html.includes(`id="week-${w}"`), `${p.id} missing week block #week-${w}`);
    g.check(/src="\/assets\/diagrams\/path\/path-map-wide\.png\?v=[a-f0-9]+"/.test(html) && /srcset="\/assets\/diagrams\/path\/path-map-tall\.png\?v=[a-f0-9]+"/.test(html), `${p.id} path map lacks the wide + tall crops`);
  }
  if (p.template === 'T-SESSION') {
    if (p.h2s) g.check(JSON.stringify(h2s.slice(0, p.h2s.length).map(L.norm)) === JSON.stringify(p.h2s.map(L.norm)), `${p.id} H2s ${JSON.stringify(h2s)} ≠ registry ${JSON.stringify(p.h2s)}`);
    if (typeof p.diagramCount === 'number') {
      g.check(mf.diagrams === p.diagramCount, `${p.id} rendered ${mf.diagrams} diagrams, registry says ${p.diagramCount}`);
      const figs = (html.match(/<figure class="diagram">/g) || []).length;
      g.check(figs === p.diagramCount, `${p.id} ${figs} figure.diagram in HTML, registry says ${p.diagramCount}`);
      const pics = (html.match(/<figure class="diagram"><picture><source media="\(max-width: 600px\)" srcset="\/assets\/diagrams\/[^"]+-tall\.png"[^>]*><img src="\/assets\/diagrams\/[^"]+-wide\.png" alt="[^"]{40,}"/g) || []).length;
      g.check(pics === p.diagramCount, `${p.id} every diagram needs wide + tall crops and an alt ≥ 40 chars (${pics}/${p.diagramCount})`);
      g.check(chips.includes(`${p.diagramCount} diagrams`), `${p.id} missing "${p.diagramCount} diagrams" chip`);
    }
    if (typeof p.sideQuestCount === 'number') {
      g.check(mf.sideQuests === p.sideQuestCount, `${p.id} ${mf.sideQuests} side quests, registry says ${p.sideQuestCount}`);
      const box = (html.match(/<section class="side-quests"[\s\S]*?<\/section>/) || [''])[0];
      const links = [...box.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
      g.check(links.length === p.sideQuestCount, `${p.id} side-quests box has ${links.length} links, expected ${p.sideQuestCount}`);
      for (const u of links) {
        g.check(regUrls.has(u), `${p.id} side quest ${u} is not a registry page`);
        const target = pages.find((x) => x.url === u);
        if (target) {
          const th = fs.readFileSync(target.file, 'utf8');
          g.check(new RegExp(`class="sq-banner"[\\s\\S]*?href="${p.url.replace(/[/]/g, '\\/')}#side-quests"`).test(th), `${u} lacks the side-quest banner back to ${p.url}`);
        }
      }
    }
    if (typeof p.minWords === 'number') g.check(mf.words >= p.minWords, `${p.id} ${mf.words} words, registry floor ${p.minWords}`);
    // Live stages: one stage box + one "Run live" button per stage; the stage markup is real DOM, so it
    // is also covered by the active-content scan below. The live gate executes them in a browser.
    const liveWant = typeof p.liveCount === 'number' ? p.liveCount : 0;
    g.check((mf.live || 0) === liveWant, `${p.id} rendered ${mf.live || 0} live stages, registry says ${liveWant}`);
    const stageBoxes = (html.match(/<div class="stage" data-stage="/g) || []).length;
    const liveBtns = (html.match(/class="run-btn is-live"/g) || []).length;
    g.check(stageBoxes === liveWant && liveBtns === liveWant, `${p.id} ${stageBoxes} stage boxes and ${liveBtns} Run live buttons, registry says ${liveWant}`);
    if (liveWant) g.check(chips.includes(`${liveWant} live stage${liveWant === 1 ? '' : 's'}`), `${p.id} missing "${liveWant} live stages" chip`);
    for (const m of html.matchAll(/data-live="([^"]+)"/g)) g.check(fs.existsSync(path.join(S.PUBLIC, m[1])), `${p.id} live script ${m[1]} is not in public/`);
    // Terminal stages: one terminal box + one "Run in terminal" button per `bash term=` fence; term.js is
    // loaded only on pages that have one. The live gate replays each in a browser.
    const termWant = typeof p.termCount === 'number' ? p.termCount : 0;
    g.check((mf.terminals || 0) === termWant, `${p.id} rendered ${mf.terminals || 0} terminals, registry says ${termWant}`);
    const termBoxes = (html.match(/<div class="term" data-term="/g) || []).length;
    const termBtns = (html.match(/class="run-btn is-term"/g) || []).length;
    g.check(termBoxes === termWant && termBtns === termWant, `${p.id} ${termBoxes} terminal boxes and ${termBtns} Run in terminal buttons, registry says ${termWant}`);
    if (termWant) g.check(chips.includes(`${termWant} terminal${termWant === 1 ? '' : 's'}`), `${p.id} missing "${termWant} terminals" chip`);
    g.check(html.includes('src="/term.js') === termWant > 0, `${p.id} term.js should be loaded exactly when the page has terminals`);
    g.check(html.includes('src="/git.js') === termWant > 0, `${p.id} git.js (the terminal's git) should be loaded exactly when the page has terminals`);
    if (p.session) g.check(html.includes(`THE PATH · SESSION ${curriculum.sessions.findIndex(s => s.id === p.session.id) + 1} OF ${curriculum.sessions.length} ·`) && html.includes(`UNIT ${p.session.unit} ·`), `${p.id} eyebrow lacks session position/unit`);
    g.check(/class="chapter-opener"/.test(html) && /class="mark mark-story"/.test(html), `${p.id} missing the chapter opener with the struck word`);
    g.check(/class="tree path-tree"/.test(html), `${p.id} sidebar is not the path tree`);
  }
  if (p.template === 'T-LANDING') {
    const inSection = reg.pages.filter((x) => x.section === p.section).length;
    if (typeof p.sectionPageCount === 'number') g.check(inSection === p.sectionPageCount, `${p.id} registry has ${inSection} pages in ${p.section}, fact says ${p.sectionPageCount}`);
    g.check(mf.children === inSection - 1, `${p.id} landing lists ${mf.children} children, section has ${inSection - 1}`);
  }
  // Every page links home and has the primary nav + a Source/credits path.
  g.check(/href="\/credits\/"/.test(html), `${p.id} has no link to /credits/`);
  g.check(/<nav[^>]*class="[^"]*primary/.test(html) || /aria-label="Sections"/.test(html), `${p.id} missing primary section nav`);
}

// Home stats are computed from the registry, never typed in.
const home = man.pages['/'] && man.pages['/'].facts && man.pages['/'].facts.stats;
if (home) {
  const exercises = reg.pages.filter((p) => p.template === 'T-EXERCISE').length;
  const languages = reg.pages.filter((p) => p.template === 'T-LANG-INDEX' && p.group !== 'Frontend').length;
  const patterns = reg.pages.filter((p) => p.section === 'Design Patterns' && p.template !== 'T-LANDING').length;
  g.check(home.pages === reg.total, `home stat pages=${home.pages}, registry ${reg.total}`);
  g.check(home.sessions === curriculum.sessions.length, `home stat sessions=${home.sessions}, the path has ${curriculum.sessions.length}`);
  g.check(home.exercises === exercises, `home stat exercises=${home.exercises}, registry ${exercises}`);
  g.check(home.languages === languages, `home stat languages=${home.languages}, registry ${languages}`);
  g.check(home.patterns === patterns, `home stat patterns=${home.patterns}, registry ${patterns}`);
  const homeHtml = fs.readFileSync(path.join(S.PUBLIC, 'index.html'), 'utf8');
  g.check(new RegExp(`>\\s*${reg.total}\\s*<`).test(homeHtml), `home HTML does not show the page total ${reg.total}`);
  // §R5 route strip: 18 week cells, one flag on the latest written session's week; §R4 save-point card.
  const cells = (homeHtml.match(/class="route-cell[ "]/g) || []).length;
  g.check(cells === curriculum.weeks.length, `home route strip has ${cells} week cells, expected ${curriculum.weeks.length}`);
  g.check((homeHtml.match(/class="ic rc-flag"/g) || []).length === 1, 'home route strip must carry exactly one flag');
  g.check(/class="respawn-card"/.test(homeHtml), 'home hero lacks the save-point card');
  g.check(/class="mark mark-cover"/.test(homeHtml) && /class="mark mark-nav"/.test(homeHtml), 'home lacks the cover / nav marks');
  // Every page: one nav link per section, Path first, and the PNG favicons.
  const navCount = site.allSections.length;
  for (const p of pages) {
    const h = fs.readFileSync(p.file, 'utf8');
    const navLinks = [...(h.match(/<nav class="nav-links"[^>]*>([\s\S]*?)<\/nav>/) || ['', ''])[1].matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
    if (navLinks.length !== navCount || navLinks[0] !== '/path/') { g.fail(`${p.url} nav has ${navLinks.length} links (first ${navLinks[0]}), expected ${navCount} starting with /path/`); break; }
    if (!/<link rel="icon" type="image\/png" sizes="32x32" href="\/favicon-32\.png">/.test(h)) { g.fail(`${p.url} lacks the 32px PNG favicon link`); break; }
    if (/sticker-mark|favicon\.svg/.test(h)) { g.fail(`${p.url} still references a retired brand asset`); break; }
  }
} else g.fail('home manifest has no stats');

// sitemap.xml lists every page except 404; redirects.json exists and only maps group segments.
const sm = fs.readFileSync(path.join(S.PUBLIC, 'sitemap.xml'), 'utf8');
const smCount = (sm.match(/<loc>/g) || []).length;
g.check(smCount === reg.total - 1, `sitemap.xml has ${smCount} urls, expected ${reg.total - 1}`);
const redirects = JSON.parse(fs.readFileSync(path.join(S.PUBLIC, 'redirects.json'), 'utf8'));
for (const [from, to] of Object.entries(redirects)) {
  g.check(!regUrls.has(from), `redirect source ${from} is also a page`);
  g.check(regUrls.has(to.split('#')[0]), `redirect ${from} → ${to} points at a non-page`);
}

// Forbidden mentions: the former course provider and the old class sites must not appear anywhere
// that ships — pages, raw source copies, search index, sitemap.
const FORBIDDEN = [/general\s*assembly/i, /generalassemb\.ly/i, /evelyn/i, /sfs-flex/i, /donna-frances/i, /\bSEIR?\b/];
let scanned = 0;
// The two files that define the patterns are the only places the words may appear.
const PATTERN_FILES = new Set([__filename, path.join(S.WEBSITE, 'build', 'index.js')]);
const SKIP_DIRS = new Set([path.join(S.PUBLIC, 'vendor'), path.join(S.WEBSITE, 'node_modules'), path.join(S.WEBSITE, 'vendor'), path.join(S.WEBSITE, 'public'), path.join(S.WEBSITE, '.git')]);
function scan(abs) {
  if (PATTERN_FILES.has(abs) || !/\.(html|md|js|json|xml|txt|svg|css|mjs|py)$/.test(abs)) return;
  const t = fs.readFileSync(abs, 'utf8'); scanned++;
  for (const re of FORBIDDEN) {
    const m = t.match(re);
    if (m) { const i = t.indexOf(m[0]); g.fail(`forbidden mention ${re} in ${path.relative(path.dirname(S.WEBSITE), abs)}: "${t.slice(Math.max(0, i - 50), i + 50).replace(/\s+/g, ' ')}"`); break; }
  }
}
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) { if (!SKIP_DIRS.has(abs)) walk(abs); continue; }
    scan(abs);
  }
}
walk(S.PUBLIC); // everything served
// …and everything a reader of the project sees: website/ (build, content, qa, scripts, server, package) + the project docs.
for (const d of ['build', 'content', 'qa', 'scripts']) if (fs.existsSync(path.join(S.WEBSITE, d))) walk(path.join(S.WEBSITE, d));
for (const f of fs.readdirSync(S.WEBSITE)) if (/\.(js|json|md)$/.test(f)) scan(path.join(S.WEBSITE, f));
for (const f of fs.readdirSync(path.dirname(S.WEBSITE))) if (/\.md$/.test(f)) scan(path.join(path.dirname(S.WEBSITE), f));

// Active content: Markdown is rendered with raw HTML passthrough (no sanitizer), so this is the
// line that keeps an unexpected tag out of a shipped page. The policy mirrors the CSP in
// server.js — exactly one inline script (the `js` class bootstrap, hash-listed there), scripts
// only from this origin, no inline event handlers, no javascript: URLs, no frames/embeds/<base>,
// no <style> elements (style-src is 'self'; put it in styles.css) and no forms posting off-site.
const serverSrc = fs.readFileSync(path.join(S.WEBSITE, 'server.js'), 'utf8');
const bootMatch = serverSrc.match(/const INLINE_BOOT = (["'])(.*?)\1;/);
g.check(!!bootMatch, 'server.js no longer defines INLINE_BOOT — the CSP hash and the page bootstrap must stay in step');
const INLINE_BOOT = bootMatch ? bootMatch[2] : '';
const YT = /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}$/;
const ACTIVE = [
  [/<(frame|object|embed|applet|base)\b/i, 'frame/embed/base element'],
  [/<style[\s>]/i, '<style> element (blocked by style-src; use styles.css)'],
  [/<[a-zA-Z][^>]*\s(on[a-z]+)\s*=/i, 'inline event handler'],
  [/\b(href|src|action|formaction|xlink:href)\s*=\s*["']?\s*(javascript\s*:|vbscript\s*:|data\s*:\s*text\/html)/i, 'javascript:/vbscript:/data:text/html URL'],
  [/\bsrcdoc\s*=/i, 'srcdoc attribute'],
  [/<meta[^>]+http-equiv/i, 'http-equiv meta'],
  [/<form\b[^>]*\baction\s*=\s*["']?(?:[a-z]+:)?\/\//i, 'form posting off-site'],
];
let activeChecked = 0;
function checkActive(file, label) {
  const html = fs.readFileSync(file, 'utf8');
  activeChecked++;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1]; const body = m[2].trim();
    const src = (attrs.match(/\bsrc\s*=\s*["']([^"']*)["']/i) || [])[1];
    if (src !== undefined) {
      g.check(/^\/(?!\/)/.test(src), `${label} loads a script from outside this origin: ${src}`);
      g.check(body === '', `${label} has a <script src> with an inline body`);
    } else {
      g.check(body === INLINE_BOOT, `${label} has an inline script that is not the hash-listed bootstrap: "${body.slice(0, 80)}"`);
    }
  }
  for (const m of html.matchAll(/<iframe\b[^>]*>/gi)) {
    const src = (m[0].match(/\bsrc="([^"]*)"/) || [])[1] || '';
    if (!YT.test(src)) g.fail(`${label} iframe is not a youtube-nocookie embed: "${src}"`);
  }
  for (const [re, what] of ACTIVE) {
    const hit = html.match(re);
    if (hit) { const i = html.indexOf(hit[0]); g.fail(`${label} contains ${what}: "${html.slice(Math.max(0, i - 40), i + 80).replace(/\s+/g, ' ')}"`); }
  }
}
for (const p of pages) checkActive(p.file, p.url);
checkActive(path.join(S.PUBLIC, '404.html'), '/404.html');

g.done(`${pages.length} pages · ${scanned} files scanned for forbidden mentions · ${activeChecked} documents checked for active content`);
