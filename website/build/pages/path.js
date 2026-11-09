// T-PATH (the path index) and T-SESSION (one session), DESIGN-REFERENCE-RESPAWN.md §R7–§R8.
// Session content lives in content/path/sessions/<slug>.md; path.json is the schedule; diagrams.json is the ledger.
const path = require('path');
const S = require('../sources.config');
const U = require('../util');
const site = require('../site.config');
const { renderMarkdown } = require('../parsers/markdown');
const { shell, docTitle } = require('../render/layout');
const { renderDoc, creatorCard, glanceCard } = require('../render/doc');
const { escapeHtml, icon, chip, callout } = require('../render/components');
const { mark, stamp } = require('../render/brand');
const { weekBlocks, pathTree, diagramFigure, sideQuestsBox, saveControls, stageBox, termBox, unitVars } = require('../render/path');

const H2_ORDER = ['The hook', 'The idea', 'The demonstration', 'Where it breaks', 'Your turn', 'The quest', 'Side quests', 'Before next session'];

/* ---------- T-PATH ---------- */
async function renderPathIndexPage(ctx, page) {
  const P = ctx.path;
  const first = P.written[0];
  const unitsList = P.units.map((u) => `<li><span class="u-num" style="--unit:var(--${P.actOf(u.n).color})">U${u.n}</span><div><b>${escapeHtml(u.title)}</b><span>${escapeHtml(u.topics)}</span></div><span class="u-art">${escapeHtml(u.artifact)}</span></li>`).join('');
  const body = `<main id="main" class="landing path-index">
  <header class="landing-head">
    <div class="dotgrid tr" aria-hidden="true"></div>
    <div class="container">
      <p class="eyebrow">00 / THE PATH</p>
      <h1>${escapeHtml(page.title)}</h1>
      <div class="intro" data-editorial="true"><p>${escapeHtml(site.path.blurb)} Three acts, twelve units, ${P.sessions.length} self-paced sessions. Choose any three days a week for a suggested ${P.weeks.length}-week journey, or one session a day for ${P.sessions.length} consecutive days. If you want to include every side quest, you could plan a roughly 100-day expedition and adjust as you go: side quests vary in size, and some projects or interviews need extra time. Week numbers group the route; they are not deadlines. Every session is written as a studio script: a hook, one idea, a demonstration you can run, the place it breaks, your turn, a quest, and the side quests in the library that go deeper.</p></div>
      <div class="landing-ctas">
        ${first ? `<a class="pill primary" href="${first.url}">Start with Session ${escapeHtml(first.id)} ${icon('arrow-right', 'pill-icon')}</a>` : ''}
        <span class="chip" style="height:52px;padding:0 18px;border-radius:999px">Self-paced · ${P.sessions.length} sessions · ${P.written.length} written</span>
      </div>
    </div>
  </header>
  <section class="context path-map-band"><div class="container">
    ${diagramFigure(P, 'path/path-map', { eager: true, number: false })}
    <div class="legend legend-wide">${P.acts.map((a) => `<span class="legend-item"><i style="background:var(--${a.color})"></i>Act ${a.id} · ${escapeHtml(a.name)} · weeks ${escapeHtml(a.weeks)}</span>`).join('')}${P.written.length < P.sessions.length ? '<span class="legend-item"><i class="empty"></i>Not yet written</span>' : ''}</div>
  </div></section>
  <div class="container">
    <section class="units" id="units"><h2>Twelve units</h2><ol class="unit-list">${unitsList}</ol></section>
    <div class="weeks">${weekBlocks(P)}</div>
    <nav class="pager" aria-label="Previous and next"><span class="card empty"></span>${first ? `<a class="card next" href="${first.url}" rel="next"><span class="lbl">First written session${icon('arrow-right')}</span><b>${escapeHtml(first.title)}</b><span>Session ${escapeHtml(first.id)} · Week ${first.week}</span></a>` : '<span class="card empty"></span>'}</nav>
    <div style="height:96px"></div>
  </div>
</main>`;
  const html = shell(ctx, { page, docTitle: docTitle(page.title), description: `${P.sessions.length} self-paced sessions; ${P.weeks.length} weeks at three sessions per week: ${site.path.blurb}` }, body, { bodyClass: 'landing-page path-page sec-path' });
  return {
    html,
    search: { headings: P.weeks.map((w) => `Week ${w.n}`), text: `${site.path.blurb} ${P.sessions.map((s) => `${s.id} ${s.title}`).join(' · ')}` },
    facts: { weeks: P.weeks.length, sessions: P.sessions.length, written: P.written.length, emptyCards: P.sessions.length - P.written.length },
  };
}

/* ---------- T-SESSION ---------- */
function parseDiagramRef(href) {
  const m = href.match(/^diagram:([a-z0-9-]+\/[a-z0-9-]+)$/);
  return m ? m[1] : null;
}

async function renderSessionPage(ctx, page) {
  const P = ctx.path;
  const s = P.sessions.find((x) => x.url === page.url);
  if (!s) throw new Error(`no path.json session for ${page.url}`);
  const md = U.read(s.file);
  const usedDiagrams = [];
  const runFiles = [];
  const srcDir = path.join(S.PUBLIC, 'assets', 'src', 'path', s.slug);
  // Live stages: ```html stage=<name>``` renders as real DOM under its panel; ```js live=<name>``` is served
  // from /assets/live/ (a script, not a text/plain source copy) and runs against that stage in the page.
  const stages = new Map();
  const liveFiles = [];
  // Terminal stages: ```bash term=<name>``` is a shell script replayed in the lesson terminal (term.js) under its panel.
  const terms = [];
  const liveDir = path.join(S.PUBLIC, 'assets', 'live', 'path', s.slug);
  U.rmrf(liveDir);

  const r = await renderMarkdown(md, {
    dropH1: true,
    callouts: true,
    storyQuotes: true,
    resolveImage(href) {
      const key = parseDiagramRef(href);
      if (!key) throw new Error(`session ${s.id}: image "${href}" is not a diagram: reference`);
      const first = usedDiagrams.length === 0;
      usedDiagrams.push(key);
      return { html: diagramFigure(P, key, { eager: first }), src: `/assets/diagrams/${key}-wide.png` };
    },
    resolveLink(href) { return href; },
    // ```js run=<name>``` → the block is written to /assets/src/path/<slug>/<name>.js, gets a Run button, and must
    // print `ok: <name>` (the prep gate executes it under node and looks for that line; the page's Run button too).
    codeExtra(index, code, lang, meta) {
      if (!meta) return null;
      const stage = meta.match(/\bstage=([a-z0-9-]+)/);
      if (stage) {
        const name = stage[1];
        if (lang !== 'html') throw new Error(`session ${s.id}: stage= is only for html fences (block ${index + 1})`);
        if (stages.has(name)) throw new Error(`session ${s.id}: stage "${name}" is declared twice`);
        // The fence is injected into the page as markup, so it is held to the page's own CSP rules.
        if (/<script\b|\bon[a-z]+\s*=|javascript:|<style\b|<iframe\b|<h1\b/i.test(code)) throw new Error(`session ${s.id}: stage "${name}" markup may not contain scripts, inline handlers, <style>, frames or an <h1>`);
        stages.set(name, code);
        return { title: `${name}.html`, readonly: true, after: stageBox(name, code) };
      }
      const term = meta.match(/\bterm=([a-z0-9-]+)/);
      if (term) {
        const name = term[1];
        if (!['bash', 'sh', 'shell', 'zsh', 'console'].includes(lang)) throw new Error(`session ${s.id}: term= is only for bash fences (block ${index + 1})`);
        if (terms.some((t) => t.name === name)) throw new Error(`session ${s.id}: terminal "${name}" is declared twice`);
        const lines = code.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
        if (!lines.length) throw new Error(`session ${s.id}: terminal "${name}" has no commands`);
        if (lines.some((l) => /^\s*\$ /.test(l))) throw new Error(`session ${s.id}: terminal "${name}": write the commands without a leading "$ " (the terminal shows the prompt)`);
        // `may-fail` marks a Where-it-breaks terminal whose script deliberately includes a typo or a wrong path.
        terms.push({ name, lines: lines.length, mayFail: /\bmay-fail\b/.test(meta) });
        return { title: 'you type', run: { mode: 'term', name }, after: termBox(name, code) };
      }
      const live = meta.match(/\blive=([a-z0-9-]+)/);
      if (live) {
        const name = live[1];
        if (lang !== 'js' && lang !== 'javascript') throw new Error(`session ${s.id}: live= is only for js fences (block ${index + 1})`);
        if (!stages.has(name)) throw new Error(`session ${s.id}: live=${name} has no html stage=${name} fence above it`);
        if (liveFiles.some((f) => f.name === name)) throw new Error(`session ${s.id}: live=${name} is declared twice`);
        const okLine = `ok: ${name}`;
        if (!code.includes(okLine)) throw new Error(`session ${s.id}: live=${name} block must print "${okLine}"`);
        const file = `${name}.js`;
        const abs = path.join(liveDir, file);
        // Module scope: `document` becomes the stage's corner of the page and `console` its output panel.
        const header = `// ${file} — live demo from /path/${s.slug}/. On the lesson page \`document\` is the stage named\n// "${name}" and \`console\` is the panel under the code; in your own project this first line is not needed.\nconst { document, console, setTimeout, setInterval, clearTimeout, clearInterval } = globalThis.__dtcStage(${JSON.stringify(name)});\n\n`;
        U.write(abs, header + (code.endsWith('\n') ? code : code + '\n'));
        const src = `/assets/live/path/${s.slug}/${file}`;
        liveFiles.push({ name, src, abs, ok: name, stage: `#stage-${name}` });
        return { title: file, run: { src, ok: okLine, mode: 'live', stage: name } };
      }
      const run = meta.match(/\brun=([a-z0-9-]+)/);
      if (!run) return null;
      if (lang !== 'js' && lang !== 'javascript') throw new Error(`session ${s.id}: run= is only for js fences (block ${index + 1})`);
      const name = run[1];
      const okLine = `ok: ${name}`;
      if (!code.includes(okLine)) throw new Error(`session ${s.id}: run=${name} block must print "${okLine}"`);
      const file = `${name}.js`;
      const abs = path.join(srcDir, file);
      U.write(abs, code.endsWith('\n') ? code : code + '\n');
      runFiles.push({ rel: `path/${s.slug}/${file}`, abs, ok: name, file });
      return { title: file, run: { src: `/assets/src/path/${s.slug}/${file}`, ok: okLine, mode: 'worker' } };
    },
  });
  const fm = r.frontmatter || {};
  if (!fm.title || !fm.subtitle || !fm.hook || !Array.isArray(fm.diagrams)) throw new Error(`session ${s.id}: frontmatter needs title, subtitle, hook, diagrams[]`);
  if (fm.title !== page.title) throw new Error(`session ${s.id}: frontmatter title "${fm.title}" ≠ sitemap title "${page.title}"`);

  // Structure checks (§R8): the eight H2s in order; declared diagrams all used, in order; words within the band.
  const h2s = r.headings.filter((h) => h.level === 2).map((h) => h.text);
  if (JSON.stringify(h2s) !== JSON.stringify(H2_ORDER)) throw new Error(`session ${s.id}: H2 order is [${h2s.join(' · ')}], expected [${H2_ORDER.join(' · ')}]`);
  const declared = fm.diagrams.map((d) => `session-${s.id.replace('.', '-')}/${d}`);
  if (JSON.stringify(usedDiagrams) !== JSON.stringify(declared)) throw new Error(`session ${s.id}: frontmatter diagrams [${fm.diagrams.join(', ')}] ≠ figures used in order [${usedDiagrams.join(', ')}]`);
  if (page.diagramCount !== undefined && page.diagramCount !== usedDiagrams.length) throw new Error(`session ${s.id}: sitemap says Diagrams: ${page.diagramCount}, page uses ${usedDiagrams.length}`);
  if (page.sideQuestCount !== undefined && page.sideQuestCount !== s.sideQuestPages.length) throw new Error(`session ${s.id}: sitemap says Side quests: ${page.sideQuestCount}, path.json lists ${s.sideQuestPages.length}`);
  const minWords = page.minWords || 2400;
  if (r.words < minWords) throw new Error(`session ${s.id}: ${r.words} words, the studio-script floor is ${minWords}`);
  for (const name of stages.keys()) if (!liveFiles.some((f) => f.name === name)) throw new Error(`session ${s.id}: stage "${name}" has no js live=${name} block`);
  if (page.liveCount !== undefined && page.liveCount !== liveFiles.length) throw new Error(`session ${s.id}: sitemap says Live stages: ${page.liveCount}, page has ${liveFiles.length}`);
  if (page.liveCount === undefined && liveFiles.length) throw new Error(`session ${s.id}: page has ${liveFiles.length} live stage(s) but the sitemap row has no "Live stages: n" fact`);
  if (page.termCount !== undefined && page.termCount !== terms.length) throw new Error(`session ${s.id}: sitemap says Terminals: ${page.termCount}, page has ${terms.length}`);
  if (page.termCount === undefined && terms.length) throw new Error(`session ${s.id}: page has ${terms.length} terminal(s) but the sitemap row has no "Terminals: n" fact`);
  const readMin = fm.read || Math.max(20, Math.round(r.words / 170 + usedDiagrams.length * 1.5 + r.codeBlocks.length * 1.2));
  // Card metadata is loaded by loadPath before any page is rendered.

  // Side-quests box replaces the "## Side quests" section body (the markdown keeps a one-line intro).
  let body = r.html.replace(/(<h2 id="side-quests"[^>]*>[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2 |$)/, (m, h, rest) => `${h}${rest}${sideQuestsBox(s)}`);
  // "Where it breaks" and "Your turn" bodies get their callout frame (the H2 stays as the anchor).
  body = body.replace(/(<h2 id="where-it-breaks"[^>]*>[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2 |$)/, (m, h, rest) => `${h}${callout('dont', 'Where it breaks', rest)}`);
  body = body.replace(/(<h2 id="your-turn"[^>]*>[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2 |$)/, (m, h, rest) => `${h}${callout('turn', 'Your turn', rest)}`);

  const { before, after } = P.neighbours(s);
  const glance = glanceCard([
    { key: 'PACE', value: `Session ${s.position} of ${P.sessions.length} · suggested week ${s.week}. Continue when you are ready.` },
    { key: 'UNIT', value: `Unit ${s.unit} · ${s.unitInfo.title}` },
    { key: 'ACT', value: `Act ${s.act.id} · ${s.act.name}` },
    { key: 'BEFORE', value: before ? `${before.id} ${before.title}` : 'Nothing. This is the first session.' },
    { key: 'AFTER', value: after ? `${after.id} ${after.title}` : 'Nothing. This is the last session.' },
    { key: 'ARTIFACT', value: fm.artifact || s.unitInfo.artifact },
    { key: 'READ', value: `${readMin} min · ${usedDiagrams.length} diagrams · ${r.codeBlocks.length} code blocks` },
  ]);
  const opener = `<p class="chapter-opener" aria-label="In a world with magic, crossed out, corrected to AI. Chapter ${escapeHtml(s.id)}.">${stamp(s, 'lg')}<span class="opener-text">In a world with ${mark('mark-story')}, chapter <b>${escapeHtml(s.id)}</b>.</span></p>`;
  const prevW = P.prevWritten(s);
  const nextW = P.nextWritten(s);
  const pager = {
    prev: prevW ? { url: prevW.url, title: prevW.title, sub: `Session ${prevW.id} · Week ${prevW.week}` } : { url: '/path/', title: 'The path', sub: `All ${P.sessions.length} sessions`, label: 'Back to' },
    next: nextW ? { url: nextW.url, title: nextW.title, sub: `Session ${nextW.id} · Week ${nextW.week}` } : { url: `/path/#week-${s.week}`, title: 'Back to the path', sub: after ? `Next up: ${after.id} ${after.title}, not yet written` : 'The end of the path', label: 'Respawn' },
  };
  const chips = [chip(`${readMin} min read`), chip(`${usedDiagrams.length} diagrams`), chip(`${s.sideQuestPages.length} side quests`, 'green')];
  if (runFiles.length || (!liveFiles.length && !terms.length)) chips.push(chip(`${runFiles.length} runnable`, runFiles.length ? 'yellow' : ''));
  if (liveFiles.length) chips.push(chip(`${liveFiles.length} live stage${liveFiles.length === 1 ? '' : 's'}`, 'yellow'));
  if (terms.length) chips.push(chip(`${terms.length} terminal${terms.length === 1 ? '' : 's'}`, 'yellow'));
  const html = renderDoc(ctx, {
    page,
    eyebrow: `THE PATH · SESSION ${s.position} OF ${P.sessions.length} · UNIT ${s.unit} · ACT ${s.act.id}`,
    lede: escapeHtml(fm.subtitle),
    chips,
    meta: [`${r.words.toLocaleString()} words`, `${r.codeBlocks.length} code blocks`],
    glance,
    body,
    headings: r.headings,
    tree: pathTree(P, page),
    banner: '',
    opener,
    pager,
    bodyClass: 'session-page',
    beforeBody: saveControls(s.id),
    source: creatorCard({ verified: ctx.verification[page.url] || null }),
    railActions: `<a href="/path/#week-${s.week}">${icon('flag')}Week ${s.week} on the path</a><a href="#side-quests">${icon('sword')}Side quests</a><a href="#source">${icon('info')}Creator &amp; license</a>`,
    description: fm.hook,
    docTitle: docTitle(`${s.id} ${page.title}`, 'The Path'),
    extraScripts: terms.length ? `<script src="/term.js?v=${ctx.buildId}" defer></script><script src="/git.js?v=${ctx.buildId}" defer></script>` : '',
  });
  return {
    html,
    search: { headings: h2s, text: `${fm.subtitle} ${fm.hook}`, say: (fm.say || []).join(' · ') },
    facts: { session: s.id, week: s.week, unit: s.unit, h2s, diagrams: usedDiagrams.length, sideQuests: s.sideQuestPages.length, words: r.words, codeBlocks: r.codeBlocks.length, runnable: runFiles.length, live: liveFiles.length, terminals: terms.length },
    codeBlocks: r.codeBlocks.map((cb, i) => ({ index: i, lang: cb.lang, code: cb.code })),
    runnables: runFiles.map((f) => ({ rel: f.rel, abs: f.abs, ok: f.ok })),
    lives: liveFiles.map((f) => ({ name: f.name, src: f.src, abs: f.abs, ok: f.ok, stage: f.stage })),
    terms: terms.map((t) => ({ name: t.name, lines: t.lines, mayFail: t.mayFail })),
  };
}

module.exports = { renderPathIndexPage, renderSessionPage, H2_ORDER };
