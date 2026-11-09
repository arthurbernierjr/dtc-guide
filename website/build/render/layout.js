// Page shell: head, nav, sprite, footer, palette, drawers. DESIGN-REFERENCE §0, §11, §7 (palette).
const site = require('../site.config');
const { escapeHtml, icon } = require('./components');

const SPRITE = `<svg hidden xmlns="http://www.w3.org/2000/svg">
<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>
<symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
<symbol id="i-close" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>
<symbol id="i-arrow-up" viewBox="0 0 24 24"><path d="M12 19V5m-7 7 7-7 7 7"/></symbol>
<symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></symbol>
<symbol id="i-arrow-left" viewBox="0 0 24 24"><path d="M19 12H5m7 7-7-7 7-7"/></symbol>
<symbol id="i-external" viewBox="0 0 24 24"><path d="M14 5h5v5M19 5l-9 9M18 13v6H5V6h6"/></symbol>
<symbol id="i-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></symbol>
<symbol id="i-play" viewBox="0 0 24 24"><path d="M7 5v14l12-7z"/></symbol>
<symbol id="i-chevron" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></symbol>
<symbol id="i-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></symbol>
<symbol id="i-book" viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h14"/></symbol>
<symbol id="i-code" viewBox="0 0 24 24"><path d="m8 8-4 4 4 4m8-8 4 4-4 4M14 4l-4 16"/></symbol>
<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></symbol>
<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="i-layers" viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17 9 5 9-5"/></symbol>
<symbol id="i-brain" viewBox="0 0 24 24"><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3 3 3 0 0 0 2 3v1a3 3 0 0 0 3 3h1a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3 3 3 0 0 1-2 3v1a3 3 0 0 1-3 3h-1a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></symbol>
<symbol id="i-hash" viewBox="0 0 24 24"><path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/></symbol>
<symbol id="i-info" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></symbol>
<symbol id="i-file" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></symbol>
<symbol id="i-flag" viewBox="0 0 24 24"><path d="M5 21V4"/><path d="M5 4h12l-3 4 3 4H5"/></symbol>
<symbol id="i-sword" viewBox="0 0 24 24"><path d="m4 20 10-10"/><path d="m13 6 5 5 3-8z"/><path d="m3 17 4 4"/><path d="m6 14 4 4"/></symbol>
</svg>`;

const { thankYouButton } = require('./thank-you');

const SECTION_ICON = Object.fromEntries(site.allSections.map((s) => [s.title, s.icon]));
const { brandLockup } = require('./brand');

function nav(ctx, page) {
  const links = site.allSections.map((s) => {
    const cur = page && page.section === s.title ? ' class="is-current" aria-current="true"' : '';
    const label = escapeHtml(s.nav || s.title);
    // Short label below 1200 px; the aria-label keeps the full name whichever span is shown.
    const inner = s.short ? `<span class="nl-long" aria-hidden="true">${label}</span><span class="nl-short" aria-hidden="true">${escapeHtml(s.short)}</span>` : `<span>${label}</span>`;
    return `<a href="${s.url}"${cur}${s.short ? ` aria-label="${label}"` : ''}>${inner}</a>`;
  }).join('');
  return `<header class="nav" id="nav">
  <button class="hamburger" type="button" aria-label="Open menu" data-open="nav-drawer"><span></span><span></span></button>
  ${brandLockup()}
  <nav class="nav-links" aria-label="Sections">${links}</nav>
  <button class="search-pill" type="button" data-open="palette" aria-label="Search the guide">${icon('search')}<span class="label">Search the guide</span><span class="kbd">⌘K</span></button>
  <button class="nav-icon" type="button" data-open="palette" aria-label="Search">${icon('search')}</button>
</header>`;
}

function footer(ctx) {
  const sectionLinks = site.allSections.map((s) => `<a href="${s.url}">${escapeHtml(s.title)}</a>`).join('');
  return `<footer class="footer" id="footer">
  <div class="container">
    <div class="footer-top">
      ${brandLockup()}
      <nav class="footer-sections" aria-label="Sections">${sectionLinks}</nav>
      <details class="footer-disclosure"><summary>Sections ▾</summary><nav class="footer-sections" aria-label="Sections">${sectionLinks}</nav></details>
      <div class="footer-links">${thankYouButton()}
        <a href="${site.links.podcast}" target="_blank" rel="noopener">Podcast ${icon('external')}</a>
        <a href="${site.links.newsletter}" target="_blank" rel="noopener">Newsletter</a><a href="/support/">Support &amp; work with me</a>
        <a href="${site.links.instagram}" target="_blank" rel="noopener">Instagram</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span>Built by <b>Big Poppa Code</b> · ${escapeHtml(site.signature.replace(/^— /, ''))}</span>
      <span>Content from Brian Holt (CC BY-NC 4.0), AlgoCasts (GPL-3.0) and Arthur Bernier Jr. · <a href="/credits/">Sources &amp; licenses</a> · <a href="/privacy/">Privacy &amp; storage</a></span>
      <span>Free curriculum. Optional support and personal services. YouTube players may show ads.</span>
    </div>
  </div>
</footer>`.replace(/>\s+</g, '><');
}

function palette(ctx) {
  const chips = site.allSections.map((s) => `<a class="chip" href="${s.url}">${escapeHtml(s.title)}</a>`).join('');
  return `<div class="palette-scrim" id="palette" role="dialog" aria-modal="true" aria-label="Search" hidden>
  <div class="palette">
    <div class="palette-input">${icon('search')}<span class="scope" hidden></span><input type="search" id="palette-input" placeholder="Search ${ctx.total} pages" autocomplete="off" spellcheck="false"><span class="kbd">esc</span></div>
    <div class="palette-results" id="palette-results"><div class="palette-empty"><span>Type to search ${ctx.total} pages</span><div class="chips">${chips}</div></div></div>
    <div class="palette-foot"><span>↑↓ navigate</span><span>↵ open</span><span>⌘↵ new tab</span><span>esc close</span></div>
  </div>
</div>`;
}

function navDrawer(ctx, page) {
  const items = site.allSections.map((s) => {
    const count = (ctx.reg.bySection[s.title] || []).length;
    return `<li><a href="${s.url}"${page && page.section === s.title ? ' class="is-current"' : ''}>${escapeHtml(s.title)}<span class="count">${count}</span></a></li>`;
  }).join('');
  return `<div class="drawer-scrim" data-close></div>
<aside class="drawer" id="nav-drawer" aria-label="Menu" hidden>
  <div class="drawer-head">${brandLockup()}<button class="close" type="button" data-close aria-label="Close">${icon('close')}</button></div>
  <button class="search-pill" type="button" data-open="palette">${icon('search')}<span class="label">Search the guide</span></button>
  <ul class="sections" style="margin-top:16px">${items}</ul>
  <div class="drawer-tree"></div>
</aside>`;
}

function head(ctx, model) {
  const title = model.docTitle;
  const desc = (model.description || site.name).replace(/\s+/g, ' ').slice(0, 160);
  const url = site.origin.replace(/\/$/, '') + model.page.url;
  const og = site.origin.replace(/\/$/, '') + '/assets/og-image.jpg';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${escapeHtml(url)}">
<meta name="theme-color" content="${site.themeColor}">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="${model.page.url === '/' ? 'website' : 'article'}">
<meta property="og:site_name" content="${escapeHtml(site.name)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${og}">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/clash-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/clash-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/fraunces-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v=${ctx.buildId}">
<script>document.documentElement.classList.add('js')</script>
</head>`;
}

/** `<title>` for any page: "<parts> · I Respawned As A Super Coder" (G2). */
function docTitle(...parts) { return [...parts.filter(Boolean), site.titleSuffix].join(' · '); }

function shell(ctx, model, bodyHtml, { bodyClass = '', extraScripts = '' } = {}) {
  const page = model.page;
  return `${head(ctx, model)}
<body class="${bodyClass}" data-url="${escapeHtml(page.url)}" data-section="${escapeHtml(page.section)}">
<a class="skip-link" href="#main">Skip to content</a>
${SPRITE}
${nav(ctx, page)}
<div class="progress" id="progress" aria-hidden="true"></div>
${bodyHtml}
${footer(ctx)}
<button class="back-top" id="back-top" type="button" aria-label="Back to top">${icon('arrow-up')}</button>
${palette(ctx)}
${navDrawer(ctx, page)}
<div class="film-grain" aria-hidden="true"></div>
<script src="/app.js?v=${ctx.buildId}" defer></script>
<script src="/search.js?v=${ctx.buildId}" defer></script>
<script src="/save-point.js?v=${ctx.buildId}" defer></script>
<script src="/console-art.js?v=${ctx.buildId}" defer></script>
${extraScripts}
</body>
</html>`;
}

module.exports = { shell, SECTION_ICON, brandLockup, icon, docTitle };
