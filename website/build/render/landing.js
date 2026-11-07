// Section landing (T-LANDING), language index (T-LANG-INDEX), credits, search and 404 shells.
const site = require('../site.config');
const { shell, SECTION_ICON, docTitle } = require('./layout');
const { escapeHtml, icon } = require('./components');
const { slugify } = require('../registry');
const { pager, sectionMeta, sideQuestBannerFor } = require('./doc');

function groupCard(g, chipFor, introHtml) {
  const items = g.pages.map((p) => {
    const c = chipFor ? chipFor(p) : '';
    return `<li><a href="${p.url}">${escapeHtml(p.title)}</a>${c ? `<span class="chips">${c}</span>` : ''}</li>`;
  }).join('');
  return `<article class="group-card card" id="${escapeHtml(g.slug || slugify(g.name))}">
  <div class="group-head"><h2>${escapeHtml(g.name)}</h2><span class="chip">${g.pages.length} pages</span></div>
  ${introHtml ? `<div class="group-intro">${introHtml}</div>` : ''}
  <ol>${items}</ol>
</article>`;
}

/**
 * model: {page, description, intro (html, editorial), groupIntros:{[groupName]: html}, chipFor(page)=>html, context (html rendered in a band between header and groups), notice (html), after (html)}
 */
function renderLanding(ctx, model) {
  const page = model.page;
  const sec = sectionMeta(page.section);
  const groups = (ctx.reg.groupsBySection[page.section] || []);
  const children = (ctx.reg.bySection[page.section] || []).filter((p) => p !== page);
  const first = children[0];
  const cards = groups.map((g) => groupCard(g, model.chipFor, model.groupIntros && model.groupIntros[g.name])).join('');
  const body = `<main id="main" class="landing">
  <header class="landing-head">
    <div class="dotgrid tr" aria-hidden="true"></div>
    <div class="container">
      ${sideQuestBannerFor(ctx, page)}
      <p class="eyebrow">${sec.num} / ${escapeHtml(page.section.toUpperCase())}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <div class="intro" data-editorial="true">${model.intro}</div>
      <div class="landing-ctas">
        ${first ? `<a class="pill primary" href="${first.url}">Start here ${icon('arrow-right', 'pill-icon')}</a>` : ''}
        <span class="chip" style="height:52px;padding:0 18px;border-radius:999px">${children.length} pages · ${groups.length} groups</span>
      </div>
    </div>
  </header>
  ${model.context ? `<section class="context"><div class="container">${model.context}</div></section>` : ''}
  <div class="container">
    <div class="groups">${model.notice ? `<div class="notice">${icon('info')}<div>${model.notice}</div></div>` : ''}${cards}</div>
    ${model.after || ''}
    ${pager(page)}
    <div style="height:96px"></div>
  </div>
</main>`;
  return shell(ctx, { page, docTitle: docTitle(page.title), description: model.description }, body, { bodyClass: `landing-page sec-${sec.id}` });
}

/**
 * Language index (T-LANG-INDEX). model: {page, description, intro, switcher (html), steps:[{num,title,url,blurb,chip}], lists:[{title, html}], source, extra}
 */
function renderLangIndex(ctx, model) {
  const page = model.page;
  const sec = sectionMeta(page.section);
  const steps = model.steps.map((s) => `<a class="step-card card" href="${s.url}"><span class="num">${escapeHtml(s.num)}</span><b>${escapeHtml(s.title)}</b>${s.blurb ? `<span>${s.blurb}</span>` : ''}</a>`).join('');
  const lists = model.lists && model.lists.length ? `<div class="lists-2">${model.lists.map((l) => `<section class="card"><h2 id="${slugify(l.title)}">${escapeHtml(l.title)}</h2>${l.html}</section>`).join('')}</div>` : '';
  const body = `<main id="main" class="landing lang-index">
  <header class="landing-head">
    <div class="dotgrid tr" aria-hidden="true"></div>
    <div class="container">
      ${sideQuestBannerFor(ctx, page)}
      <p class="eyebrow">${sec.num} / LANGUAGES · ${escapeHtml(page.group.toUpperCase())}</p>
      <h1>${escapeHtml(page.title)}</h1>
      <div class="intro" data-editorial="true">${model.intro}</div>
      <div class="landing-ctas">
        <a class="pill primary" href="${model.steps[0].url}">Start with ${escapeHtml(model.steps[0].title)} ${icon('arrow-right', 'pill-icon')}</a>
      </div>
    </div>
  </header>
  <div class="container">
    ${model.switcher || ''}
    <div class="steps">${steps}</div>
    ${model.extra || ''}
    ${lists}
    ${model.source || ''}
    ${pager(page)}
    <div style="height:96px"></div>
  </div>
</main>`;
  return shell(ctx, { page, docTitle: docTitle(page.title, page.section), description: model.description }, body, { bodyClass: `landing-page lang-index-page sec-${sec.id}` });
}

function sectionCards(ctx) {
  return `<div class="tracks">${site.sections.map((s) => `<article class="card track-card"><span class="track-top">${icon(SECTION_ICON[s.title] || 'book')}<span class="chip">${(ctx.reg.bySection[s.title] || []).length} pages</span></span><h3><a href="${s.url}">${escapeHtml(s.title)}</a></h3><p>${escapeHtml(s.blurb)}</p><span class="track-links"><span>${s.num}</span></span></article>`).join('')}</div>`;
}

function renderSearch(ctx, model) {
  const page = model.page;
  const body = `<main id="main" class="landing search-page-main">
  <header class="landing-head">
    <div class="container">
      <p class="eyebrow">SEARCH</p>
      <h1>${escapeHtml(page.title)}</h1>
      <form class="inline-search" action="/search/" method="get" role="search">
        ${icon('search')}<input type="search" name="q" id="search-q" placeholder="Search ${ctx.total} pages… try “two pointers”, “observer”, “Django”" autocomplete="off" aria-label="Search the guide">
        <button class="pill primary" type="submit" style="min-height:40px;padding:8px 18px">Search</button>
      </form>
      <p class="intro" id="search-status" style="font-size:15px;margin-top:16px">Searches titles, headings and the SAY terms from the prep notes. Press <kbd class="kbd">⌘K</kbd> anywhere for the palette.</p>
    </div>
  </header>
  <div class="container">
    <div class="results" id="search-results" aria-live="polite"></div>
    <section class="section-cards" id="search-empty"><p class="eyebrow" style="margin-bottom:24px">OR BROWSE A SECTION</p>${sectionCards(ctx)}</section>
  </div>
</main>`;
  return shell(ctx, { page, docTitle: docTitle('Search'), description: model.description }, body, { bodyClass: 'search-page' });
}

function render404(ctx, model) {
  const page = model.page;
  const body = `<main id="main" class="landing notfound">
  <header class="landing-head">
    <div class="dotgrid tr" aria-hidden="true"></div>
    <div class="container">
      <p class="eyebrow">404</p>
      <h1>${escapeHtml(page.title)}</h1>
      <div class="intro" data-editorial="true">${model.intro}</div>
      <form class="inline-search" action="/search/" method="get" role="search">
        ${icon('search')}<input type="search" name="q" placeholder="Search the guide…" autocomplete="off" aria-label="Search the guide">
        <button class="pill primary" type="submit" style="min-height:40px;padding:8px 18px">Search</button>
      </form>
    </div>
  </header>
  <div class="container">
    <section class="section-cards"><p class="eyebrow" style="margin-bottom:24px">OR PICK A SECTION</p>${sectionCards(ctx)}</section>
  </div>
</main>`;
  return shell(ctx, { page, docTitle: docTitle('Page not found'), description: model.description }, body, { bodyClass: 'notfound-page' });
}

/** model: {page, description, intro, sources:[{title, author, repo, sha, license:[{name,href}], used, changed, extra}], fonts:[{name,license,href,note}], statement} */
function renderCredits(ctx, model) {
  const page = model.page;
  const cards = model.sources.map((s) => `<article class="card group-card credit-card" id="${slugify(s.title)}">
  <div class="group-head"><h2>${escapeHtml(s.title)}</h2>${s.chip ? `<span class="chip ${s.chipVariant || ''}">${escapeHtml(s.chip)}</span>` : ''}</div>
  ${s.bio ? `<p class="attrib" style="margin:0 0 14px">${escapeHtml(s.bio)}</p>` : ''}
  <dl class="source" style="margin:0;padding:0;box-shadow:none;background:none">
    <div class="source-row"><dt>Author</dt><dd>${escapeHtml(s.author)}</dd></div>
    ${s.site ? `<div class="source-row"><dt>Website</dt><dd><a class="creator-link" href="${escapeHtml(s.site)}" target="_blank" rel="noopener">${escapeHtml(s.site.replace(/^https?:\/\//, '').replace(/\/$/, ''))}${icon('external')}</a></dd></div>` : ''}
    ${s.repo ? `<div class="source-row"><dt>Repo</dt><dd><a href="${escapeHtml(s.repo)}" target="_blank" rel="noopener">${escapeHtml(s.repo.replace(/^https?:\/\//, ''))}</a>${s.sha ? `<br><code style="font-size:12px">${escapeHtml(s.sha)}</code>` : ''}</dd></div>` : ''}
    <div class="source-row"><dt>License</dt><dd>${s.license.map((l) => l.href ? `<a href="${escapeHtml(l.href)}">${escapeHtml(l.name)}</a>` : escapeHtml(l.name)).join(' · ')}</dd></div>
    <div class="source-row"><dt>Used</dt><dd>${s.used}</dd></div>
    <div class="source-row"><dt>Changed</dt><dd>${s.changed}</dd></div>
    ${s.extra ? `<div class="source-row"><dt>Note</dt><dd>${s.extra}</dd></div>` : ''}
  </dl>
</article>`).join('');
  const fonts = `<article class="card group-card credit-card" id="fonts"><div class="group-head"><h2>Fonts</h2><span class="chip">self-hosted</span></div><dl class="source" style="margin:0;padding:0;box-shadow:none;background:none">${model.fonts.map((f) => `<div class="source-row"><dt>${escapeHtml(f.name)}</dt><dd>${f.href ? `<a href="${escapeHtml(f.href)}" target="_blank" rel="noopener">${escapeHtml(f.license)}</a>` : escapeHtml(f.license)}${f.note ? ` · ${escapeHtml(f.note)}` : ''}</dd></div>`).join('')}</dl></article>`;
  const body = `<main id="main" class="landing credits">
  <header class="landing-head">
    <div class="dotgrid tr" aria-hidden="true"></div>
    <div class="container">
      <p class="eyebrow">CREDITS</p>
      <h1>${escapeHtml(page.title)}</h1>
      <div class="intro" data-editorial="true">${model.intro}</div>
    </div>
  </header>
  <div class="container">
    <div class="groups" style="padding-bottom:24px">${cards}${fonts}</div>
    <section class="card group-card" id="non-commercial" style="margin-bottom:96px"><div class="group-head"><h2>Non-commercial statement</h2></div><div class="prose">${model.statement}</div></section>
  </div>
</main>`;
  return shell(ctx, { page, docTitle: docTitle(page.title), description: model.description }, body, { bodyClass: 'credits-page' });
}

module.exports = { renderLanding, renderLangIndex, renderSearch, render404, renderCredits, sectionCards, groupCard };
