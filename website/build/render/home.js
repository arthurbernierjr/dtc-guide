// Home page (DESIGN-REFERENCE §1–§4, DESIGN-REFERENCE-RESPAWN §R4–§R6):
// hero (cover lockup + save point) · 00 the path · 01 side quests · which-pattern-when · naive-vs-optimal · languages · quote · marquee.
const site = require('../site.config');
const { shell, SECTION_ICON } = require('./layout');
const { escapeHtml, icon, badgeComplexity, codePanel } = require('./components');
const { coverLockup } = require('./brand');
const { respawnCard, routeStrip } = require('./path');

const LANG_TILES = [
  { code: 'js', name: 'JavaScript', url: '/languages/javascript/', mono: 'JS', color: '#E8D800' },
  { code: 'py', name: 'Python', url: '/languages/python/', mono: 'Py', color: '#00A868' },
  { code: 'rb', name: 'Ruby', url: '/languages/ruby/', mono: 'Rb', color: '#F03038' },
  { code: 'go', name: 'Go', url: '/languages/go/', mono: 'Go', color: '#00A868' },
  { code: 'java', name: 'Java', url: '/languages/java/', mono: 'Jv', color: '#E8D800' },
  { code: 'cs', name: 'C#', url: '/languages/cs/', mono: 'C#', color: '#00A868' },
  { code: 'php', name: 'PHP', url: '/languages/php/', mono: 'PHP', color: '#E8D800' },
  { code: 'rs', name: 'Rust', url: '/languages/rust/', mono: 'Rs', color: '#F03038' },
  { code: 'dart', name: 'Dart', url: '/languages/dart/', mono: 'Dt', color: '#00A868' },
  { code: 'react', name: 'React', url: '/languages/frontend/react/', mono: 'Re', color: '#00A868', fe: true },
  { code: 'vue', name: 'Vue', url: '/languages/frontend/vue/', mono: 'Vue', color: '#00A868', fe: true },
  { code: 'angular', name: 'Angular', url: '/languages/frontend/angular/', mono: 'Ng', color: '#F03038', fe: true },
  { code: 'svelte', name: 'Svelte', url: '/languages/frontend/svelte/', mono: 'Sv', color: '#F03038', fe: true },
];

function monogram(t) {
  const fs = t.mono.length > 2 ? 15 : 20;
  return `<svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><rect x="2" y="2" width="44" height="44" rx="12" fill="#121216" stroke="${t.color}" stroke-width="2"/><text x="24" y="31" text-anchor="middle" font-family="Clash, DM, sans-serif" font-weight="700" font-size="${fs}" fill="${t.color}">${escapeHtml(t.mono)}</text></svg>`;
}

function hero(ctx, stats) {
  const P = ctx.path;
  const statHtml = stats.map((s, i) => `${i ? '<span class="stat-sep" aria-hidden="true"></span>' : ''}<div class="stat"><b>${s.value}</b><span>${escapeHtml(s.label)}</span></div>`).join('');
  const sideQuests = ctx.total - 1 - (ctx.reg.bySection['The Path'] || []).length;
  const tagline = `One path · ${P.sessions.length} sessions · ${sideQuests} side quests`;
  return `<header class="hero" id="top">
  <div class="hero-lift" aria-hidden="true"></div>
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">A FIELD GUIDE · VERIFIED ${escapeHtml(site.verifiedMonth.toUpperCase())}</p>
      ${coverLockup()}
      <p class="signature">${escapeHtml(site.signature)}</p>
      <p class="tagline">${escapeHtml(tagline)}</p>
      <div class="hero-ctas">
        <a class="pill primary" href="/path/">Start the path ${icon('arrow-right', 'pill-icon')}</a>
        <a class="pill ghost" href="#tracks">Browse the library</a>
      </div>
      <div class="stats">${statHtml}</div>
    </div>
    <div class="hero-side">${respawnCard(P)}</div>
  </div>
  <a class="scroll-hint" href="#path">SCROLL</a>
</header>`;
}

function pathBand(ctx) {
  const P = ctx.path;
  return `<section class="section band" id="path">
  <div class="container">
    <div class="section-head"><p class="eyebrow">00 / THE PATH</p><h2>${P.weeks.length} weeks. ${P.sessions.length} sessions. In order.</h2><p class="lede">${escapeHtml(site.path.blurb)}</p></div>
    ${routeStrip(P)}
  </div>
</section>`;
}

function tracks(ctx) {
  const cards = site.sections.map((s) => {
    const n = (ctx.reg.bySection[s.title] || []).length;
    const children = (ctx.reg.bySection[s.title] || []).filter((p) => p.template !== 'T-LANDING').slice(0, 2);
    const links = children.map((p) => `<a href="${p.url}">${escapeHtml(p.title)}</a>`).join('<span>·</span>');
    return `<article class="card track-card reveal" data-section="${s.id}">
  <span class="track-top">${icon(SECTION_ICON[s.title] || 'book')}<span class="chip">${n} pages</span></span>
  <h3><a href="${s.url}"><span class="eyebrow bare" style="display:block;margin-bottom:6px">${s.num}</span>${escapeHtml(s.title)}</a></h3>
  <p>${escapeHtml(s.blurb)}</p>
  <span class="track-links">${links}</span>
</article>`;
  }).join('');
  return `<section class="section" id="tracks">
  <div class="container">
    <div class="section-head"><p class="eyebrow">01 / SIDE QUESTS</p><h2>Nine tracks. ${ctx.total - 1 - (ctx.reg.bySection['The Path'] || []).length} side quests.</h2><p class="lede">The library the path points into.</p></div>
    <div class="tracks">${cards}</div>
  </div>
</section>`;
}

function patternStrip(ctx, rows) {
  const html = rows.map((r, i) => `<div class="strip-row${i >= 12 ? ' is-extra' : ''}"><span class="tell">${escapeHtml(r.tell)}</span><span class="pattern-cell">${r.pattern.split(/\s*\/\s*|\s+or\s+/).map((p) => `<span class="chip green">${escapeHtml(p)}</span>`).join('')}</span><a class="file" href="${r.href || '/algorithms/analysis/which-pattern-when/'}" title="Open the pattern file">${icon('code')}<span class="txt">${escapeHtml(r.file || 'table')}</span></a></div>`).join('');
  return `<section class="section band" id="patterns">
  <div class="container">
    <div class="section-head"><p class="eyebrow">02 / WHICH PATTERN WHEN</p><h2>Read the tell, name the pattern.</h2><p class="lede">${rows.length} tells. The strip filters as you type.</p></div>
    <div class="strip" id="pattern-strip">
      <div class="strip-top"><label class="filter">${icon('search')}<input type="search" id="pattern-filter" placeholder="Filter: sorted, subarray, shortest path…" autocomplete="off" aria-label="Filter patterns"></label><span class="strip-count" id="pattern-count">${rows.length} ROWS</span></div>
      <div class="strip-rows" id="pattern-rows">${html}</div>
      <p class="strip-row strip-empty" id="pattern-empty" hidden><span class="tell">No tell matches that word. Try a shorter one.</span></p>
      <div class="strip-more"><button class="pill ghost" type="button" id="pattern-more">Show all ${rows.length} rows</button><a class="pill ghost" href="/algorithms/analysis/which-pattern-when/" style="margin-left:12px">Full table ${icon('arrow-right', 'pill-icon')}</a></div>
    </div>
  </div>
</section>`;
}

function naiveTeaser(pair) {
  // pair: {promptShort, naive:{title,code,html,cx}, optimal:{title,code,html,cx}, why}
  const side = (s, lbl) => `<div class="pair-side">
  <div class="pair-head"><span>${lbl} · <b>${escapeHtml(s.title)}</b></span>${badgeComplexity(s.cx)}</div>
  ${codePanel({ lang: 'javascript', html: s.html, code: s.code, readonly: true })}
</div>`;
  return `<section class="section" id="naive">
  <div class="container">
    <div class="section-head"><p class="eyebrow">03 / NAIVE VS OPTIMAL</p><h2>Same tests. Two shapes.</h2><p class="lede">${escapeHtml(pair.promptShort)}</p></div>
    <div class="pair">${side(pair.naive, 'Naive')}${side(pair.optimal, 'Optimal')}</div>
    <div class="pair-foot"><p class="why"><b>Why it is faster:</b> ${escapeHtml(pair.why)}</p><a class="pill ghost" href="/algorithms/naive-vs-optimal/">All four pairs ${icon('arrow-right', 'pill-icon')}</a></div>
  </div>
</section>`;
}

function languages() {
  const tiles = LANG_TILES.map((t) => `<a class="card tile reveal" href="${t.url}">${monogram(t)}<span class="tile-name">${escapeHtml(t.name)}</span><span class="chip">${t.fe ? 'frontend' : 'backend'}</span></a>`).join('');
  return `<section class="section" id="languages">
  <div class="dotgrid bl" aria-hidden="true"></div>
  <div class="container">
    <div class="section-head"><p class="eyebrow">04 / LANGUAGES</p><h2>Nine languages. Four frameworks. One path.</h2><p class="lede">Five steps each, then four frontend guides.</p></div>
    <div class="tiles">${tiles}</div>
  </div>
</section>`;
}

function quote(q) {
  return `<section class="section" id="mindset">
  <div class="container">
    <blockquote class="quote reveal">
      <span class="star" aria-hidden="true">✦</span>
      <h2>${escapeHtml(q.text)}</h2>
      <p>— <a href="${q.href}">${escapeHtml(q.cite)}</a> · Mindset</p>
      <a class="pill ghost" href="${q.href}">Read the guide</a>
    </blockquote>
  </div>
</section>`;
}

function marquee() {
  const words = site.marquee.map((w) => `<span>${escapeHtml(w)}</span><span class="star">✦</span>`).join('');
  return `<div class="marquee" aria-hidden="true"><div class="marquee-track">${words}${words}</div></div>`;
}

/** model: {page, description, stats:[{label,value}], patternRows:[{tell,pattern,file,href}], pair, quote:{text,cite,href}} */
function renderHome(ctx, model) {
  const body = [
    hero(ctx, model.stats),
    pathBand(ctx),
    tracks(ctx),
    patternStrip(ctx, model.patternRows),
    naiveTeaser(model.pair),
    languages(),
    quote(model.quote),
    marquee(),
  ].join('\n');
  return shell(ctx, { page: model.page, docTitle: `${site.name} — the path & library`, description: model.description }, `<main id="main" class="home">${body}</main>`, { bodyClass: 'home-page' });
}

module.exports = { renderHome, LANG_TILES, monogram };
