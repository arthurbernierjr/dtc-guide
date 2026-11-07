// Doc page frame (DESIGN-REFERENCE §5, §7): sidebar tree · article · right rail, plus the tablet toolbar,
// the mobile bottom bar, the TOC sheet and the sidebar drawer.
const site = require('../site.config');
const { shell, docTitle } = require('./layout');
const { escapeHtml, icon, chip, badgeComplexity } = require('./components');
const { slugify } = require('../registry');

const LICENSE_IDS = {
  'CC BY-NC 4.0': { id: 'cc-by-nc-4.0', variant: 'yellow', label: 'CC BY-NC 4.0' },
  'Apache-2.0': { id: 'apache-2.0', variant: 'green', label: 'Apache-2.0' },
  'GPL-3.0': { id: 'gpl-3.0', variant: 'outline-red', label: 'GPL-3.0' },
  'MIT': { id: 'mit', variant: 'green', label: 'MIT' },
  'Yours': { id: null, variant: 'green', label: '© Arthur Bernier Jr' },
};

function licenseChip(lic) {
  const key = Object.keys(LICENSE_IDS).find((k) => lic.startsWith(k)) || 'Yours';
  const l = LICENSE_IDS[key];
  const inner = `<span class="chip ${l.variant}">${escapeHtml(l.label)}</span>`;
  return l.id ? `<a href="/licenses/${l.id}.txt">${inner}</a>` : inner;
}

function sectionMeta(sectionTitle) {
  return site.allSections.find((s) => s.title === sectionTitle);
}

/** §R9 — library pages that a written session lists as a side quest carry a banner above the eyebrow. */
function sideQuestBannerFor(ctx, page) {
  const P = ctx.path;
  if (!P || !P.backlinks[page.id]) return '';
  return require('./path').sideQuestBanner(P.backlinks[page.id]);
}

function tree(ctx, page) {
  const groups = ctx.reg.groupsBySection[page.section] || [];
  const sec = sectionMeta(page.section);
  const total = (ctx.reg.bySection[page.section] || []).length;
  const items = groups.map((g) => {
    const open = g.name === page.group;
    const pages = g.pages.map((p) => `<li><a href="${p.url}"${p.url === page.url ? ' class="is-current" aria-current="page"' : ''}>${escapeHtml(p.title)}</a></li>`).join('');
    return `<li class="tree-group${open ? ' open' : ''}" data-group="${escapeHtml(slugify(g.name))}"><button type="button" aria-expanded="${open}">${icon('chevron')}<span>${escapeHtml(g.name)}</span><span class="count">${g.pages.length}</span></button><ul>${pages}</ul></li>`;
  }).join('');
  return `<p class="tree-title"><a href="${sec ? sec.url : '/'}" style="color:inherit">${escapeHtml(page.section)}</a><span>${total} PAGES</span></p><ul class="tree" id="tree">${items}</ul>`;
}

function crumbs(ctx, page) {
  const sec = sectionMeta(page.section);
  const parts = [`<a href="/">Home</a>`];
  if (sec) parts.push(`<a href="${sec.url}">${escapeHtml(page.section)}</a>`);
  if (page.group && page.group !== '—') parts.push(`<a href="${sec.url}#${slugify(page.group)}">${escapeHtml(page.group)}</a>`);
  parts.push(`<span class="cur">${escapeHtml(page.title)}</span>`);
  const back = page.group && page.group !== '—' ? { href: `${sec.url}#${slugify(page.group)}`, label: page.group } : { href: sec ? sec.url : '/', label: page.section };
  return `<nav class="crumbs" aria-label="Breadcrumb"><span class="crumb-full">${parts.join('<span class="sep">/</span>')}</span><a class="crumb-back" href="${back.href}">${icon('arrow-left')}${escapeHtml(back.label)}</a></nav>`;
}

function tocList(headings, { steps = false, cls = '' } = {}) {
  const hs = headings.filter((h) => h.level === 2 || h.level === 3);
  if (!hs.length) return '';
  const items = hs.map((h, i) => {
    if (steps && h.level === 2) {
      const m = h.text.match(/^(\d+)[.)]\s*(.*)$/);
      if (m) return `<li class="l2"><a href="#${h.id}"><span class="n">${m[1]}</span><span>${escapeHtml(m[2])}</span></a></li>`;
    }
    return `<li class="l${h.level}"><a href="#${h.id}">${escapeHtml(h.text)}</a></li>`;
  }).join('');
  return `<ul class="toc${steps ? ' steps-rail' : ''}${hs.length <= 8 ? ' short' : ''} ${cls}">${items}</ul>`;
}

function pager(page, over = null) {
  const prev = over ? over.prev : page.prev;
  const next = over ? over.next : page.next;
  const card = (p, dir) => {
    if (!p) return `<span class="card empty"></span>`;
    const lbl = dir === 'prev' ? `${icon('arrow-left')}${p.label || 'Previous'}` : `${p.label || 'Next'}${icon('arrow-right')}`;
    return `<a class="card ${dir}" href="${p.url}" rel="${dir}"><span class="lbl">${lbl}</span><b>${escapeHtml(p.title)}</b><span>${escapeHtml(p.sub || (p.group === '—' ? p.section : p.group))}</span></a>`;
  };
  return `<nav class="pager" aria-label="Previous and next">${card(prev, 'prev')}${card(next, 'next')}</nav>`;
}

function seeAlso(ctx, page, related) {
  let list = related || [];
  if (!list.length) {
    const g = (ctx.reg.groupsBySection[page.section] || []).find((x) => x.name === page.group);
    if (g) {
      const idx = g.pages.indexOf(page);
      list = g.pages.filter((p, i) => p !== page && Math.abs(i - idx) <= 2).slice(0, 4);
    }
  }
  if (!list.length) return '';
  return `<section class="see-also"><p class="rail-title">See also</p><div class="chips">${list.map((p) => `<a class="chip" href="${p.url}">${escapeHtml(p.title)}</a>`).join('')}</div></section>`;
}

/** Source card rows: {attribution?, from:[{label, href}], license, status, verified:{date, docs[], exec}, raw} */
function sourceCard(o) {
  const rows = [];
  if (o.attribution) rows.push(`<p class="attrib">${o.attribution}</p>`);
  const dl = [];
  if (o.from) dl.push(`<div class="source-row"><dt>From</dt><dd>${o.from.map((f) => f.href ? `<a href="${escapeHtml(f.href)}"${/^https?:/.test(f.href) ? ' target="_blank" rel="noopener"' : ''}>${escapeHtml(f.label)}</a>` : escapeHtml(f.label)).join(' · ')}</dd></div>`);
  if (o.license) dl.push(`<div class="source-row"><dt>License</dt><dd>${licenseChip(o.license)}${o.licenseNote ? ` <span style="font-size:12px;color:var(--muted)">${escapeHtml(o.licenseNote)}</span>` : ''}</dd></div>`);
  if (o.status) dl.push(`<div class="source-row"><dt>Status</dt><dd>${escapeHtml(o.status)}</dd></div>`);
  if (o.verified) {
    const v = o.verified;
    const docs = (v.docs || []).map((d) => `<a href="${escapeHtml(d)}" target="_blank" rel="noopener">${escapeHtml(d.replace(/^https?:\/\//, '').replace(/\/$/, ''))}${icon('external')}</a>`).join('');
    dl.push(`<div class="source-row"><dt>Verified</dt><dd>Checked ${escapeHtml(v.date)}${docs ? ` against <span class="docs">${docs}</span>` : ''}${v.exec ? ` · exec: ${escapeHtml(v.exec)}` : ''}${v.note ? `<br><span style="font-size:13px;color:var(--muted)">${escapeHtml(v.note)}</span>` : ''}</dd></div>`);
  }
  if (o.raw) dl.push(`<div class="source-row"><dt>Raw</dt><dd><a href="${escapeHtml(o.raw)}">${escapeHtml(o.raw.split('/').pop())}</a></dd></div>`);
  return `<aside class="source card" id="source"><p class="rail-title">Source</p>${rows.join('')}<dl>${dl.join('')}</dl></aside>`;
}

/**
 * Creator card — every page that is Arthur's own material gets this instead of a Source card.
 * No repository paths or raw-file links: who wrote it, who he is, where to find him, the ©,
 * and the Verified line (date · docs · exec) when the ledger has one.
 */
function creatorCard(o = {}) {
  const verifiedRow = (() => {
    if (!o.verified) return '';
    const v = o.verified;
    const docs = (v.docs || []).map((d) => `<a href="${escapeHtml(d)}" target="_blank" rel="noopener">${escapeHtml(d.replace(/^https?:\/\//, '').replace(/\/$/, ''))}${icon('external')}</a>`).join('');
    return `<div class="source-row"><dt>Verified</dt><dd>Checked ${escapeHtml(v.date)}${docs ? ` against <span class="docs">${docs}</span>` : ''}${v.exec ? ` · exec: ${escapeHtml(v.exec)}` : ''}${v.note ? `<br><span style="font-size:13px;color:var(--muted)">${escapeHtml(v.note)}</span>` : ''}</dd></div>`;
  })();
  return `<aside class="source card creator" id="source"><p class="rail-title">Creator</p>
<p class="attrib"><strong>Written by ${escapeHtml(site.author)}.</strong> ${escapeHtml(site.authorBio)} Everything on this page is his original teaching material.</p>
<p class="attrib"><a class="creator-link" href="${escapeHtml(site.links.home)}" target="_blank" rel="noopener">bigpoppacode.io${icon('external')}</a></p>
<dl><div class="source-row"><dt>License</dt><dd>${licenseChip('Yours')} <span style="font-size:12px;color:var(--muted)">all rights reserved</span></dd></div>${verifiedRow}</dl></aside>`;
}

/** At-a-glance card from header keys [{key,value}] (+ optional complexity row for Holt lessons). */
/**
 * Split a SAY value into vocabulary chips. Returns null when the value reads as prose
 * (e.g. the design-pattern "Participants: …" lines), so the caller renders it as text.
 */
function sayParts(value) {
  const v = String(value).trim();
  // 1. quoted phrases: "prototype chain", "lexical this"
  const quoted = [...v.matchAll(/"([^"]{2,80})"/g)].map((m) => m[1].trim());
  if (quoted.length >= 2) return quoted;
  if (/^Participants:/i.test(v) || /\. [A-Z]/.test(v)) return null;
  // 2. delimiter-separated short items: CWE lists, "a · b · c", "a; b; c"
  const raw = v.split(/\s*[·;|]\s*|,\s+(?![^()]*\))/).map((s) => s.replace(/[.]$/, '').trim()).filter(Boolean);
  if (raw.length >= 2 && raw.every((s) => s.length <= 60 && s.split(/\s+/).length <= 8)) return raw;
  return null;
}

function glanceCard(keys, extra = null) {
  const rows = keys.map(({ key, value }) => {
    let v;
    if (key === 'SAY') {
      const parts = sayParts(value);
      v = parts
        ? `<span class="chips">${parts.map((p) => `<span class="chip yellow" style="text-transform:none;letter-spacing:0;height:auto;padding:3px 8px;white-space:normal;line-height:1.4;text-align:left">${escapeHtml(p)}</span>`).join('')}</span>`
        : `<span class="say-prose">${escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>')}</span>`;
    } else if (/BIG-?O|COMPLEXITY|COST/.test(key)) {
      v = badgeComplexity(value);
    } else {
      v = escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>');
    }
    return `<div class="glance-row"><dt>${escapeHtml(key)}</dt><dd>${v}</dd></div>`;
  }).join('');
  let extraHtml = '';
  if (extra) {
    extraHtml = `<div class="bo-row">${Object.entries(extra).map(([k, val]) => `<span class="k">${escapeHtml(k)}</span>${/^O\(/.test(val) ? badgeComplexity(val) : `<span class="bo">${escapeHtml(val)}</span>`}`).join('')}</div>`;
  }
  return `<div class="glance card"><p class="rail-title">At a glance</p>${extraHtml}<dl>${rows}</dl></div>`;
}

/**
 * Render a doc page.
 * model: {page, eyebrow, lede, chips[], meta[], glance, body, headings, stepsRail, source, related, wide, railActions, beforeBody}
 */
function renderDoc(ctx, model) {
  const page = model.page;
  const sec = sectionMeta(page.section);
  const hasToc = model.headings && model.headings.some((h) => h.level === 2 || h.level === 3);
  const toc = hasToc ? tocList(model.headings, { steps: !!model.stepsRail }) : '';
  const eyebrow = model.eyebrow || `${page.template.replace('T-', '')} · ${page.group}`;
  const chipsHtml = (model.chips || []).join('');
  const metaHtml = (model.meta || []).map((m) => `<span>${m}</span>`).join('');

  const treeHtml = model.tree || tree(ctx, page);
  const banner = model.banner !== undefined ? model.banner : sideQuestBannerFor(ctx, page);

  const article = `<main class="article${model.wide ? ' wide' : ''}" id="main">
  ${crumbs(ctx, page)}
  ${banner}
  ${model.opener || ''}
  <p class="eyebrow">${escapeHtml(eyebrow)}</p>
  <h1>${escapeHtml(page.title)}</h1>
  ${model.lede ? `<p class="lede">${model.lede}</p>` : ''}
  <div class="meta-row">${chipsHtml ? `<span class="chips">${chipsHtml}</span>` : ''}${metaHtml}</div>
  ${model.glance ? `<div class="glance-inline">${model.glance}</div>` : ''}
  ${model.beforeBody || ''}
  <div class="prose">${model.body}</div>
  ${model.afterBody || ''}
  ${model.source || ''}
  ${pager(page, model.pager)}
  ${seeAlso(ctx, page, model.related)}
</main>`;

  const rail = `<aside class="rail" aria-label="On this page">
  ${toc ? `<div><p class="rail-title">${model.stepsRail ? 'Steps' : 'On this page'}</p>${toc}</div>` : ''}
  ${model.glance || ''}
  ${model.railActions ? `<div class="rail-actions">${model.railActions}</div>` : ''}
</aside>`;

  const toolbar = `<div class="doc-toolbar">
  <button class="tool" type="button" data-open="side-drawer">${icon('menu')}Menu</button>
  ${crumbs(ctx, page)}
  ${toc ? `<div class="toc-dd"><button class="tool" type="button" data-toggle="toc-pop">On this page ${icon('chevron')}</button><div class="toc-pop" id="toc-pop">${toc}</div></div>` : ''}
</div>`;

  const bottomBar = `<div class="bottom-bar">
  <button type="button" data-open="nav-drawer">${icon('menu')}Menu</button>
  <button type="button" data-open="palette">${icon('search')}Search</button>
  <button type="button" data-open="toc-sheet"${toc ? '' : ' disabled'}>${icon('list')}On this page</button>
</div>
<div class="sheet" id="toc-sheet" hidden aria-label="On this page"><p class="rail-title">On this page</p>${toc || '<p style="color:var(--muted)">No sections on this page.</p>'}</div>`;

  const sideDrawer = `<aside class="drawer" id="side-drawer" aria-label="Section pages" hidden>
  <div class="drawer-head"><span class="eyebrow bare">${escapeHtml(page.section)}</span><button class="close" type="button" data-close aria-label="Close">${icon('close')}</button></div>
  ${treeHtml}
</aside>`;

  const body = `<div class="doc-wrap">
${toolbar}
<div class="doc">
  <nav class="sidebar" aria-label="${escapeHtml(page.section)} pages">${treeHtml}</nav>
  ${article}
  ${rail}
</div>
${bottomBar}
${sideDrawer}
</div>`;

  return shell(ctx, { page, docTitle: model.docTitle || docTitle(page.title, page.section), description: model.description }, body, { bodyClass: `doc-page tpl-${page.template.toLowerCase()} sec-${sec ? sec.id : 'global'}${model.bodyClass ? ' ' + model.bodyClass : ''}`, extraScripts: model.extraScripts || '' });
}

module.exports = { renderDoc, sourceCard, creatorCard, glanceCard, licenseChip, tocList, crumbs, pager, tree, sectionMeta, sideQuestBannerFor };
