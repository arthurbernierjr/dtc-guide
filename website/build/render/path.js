// Path components (DESIGN-REFERENCE-RESPAWN.md §R4–§R9): the save-point card, the route strip,
// session cards (written and empty), the path tree, the side-quest banner and the diagram figure.
const site = require('../site.config');
const { escapeHtml, icon, chip } = require('./components');
const { stamp } = require('./brand');

const sectionMeta = (title) => site.allSections.find((s) => s.title === title);
const unitVars = (s) => `--unit:var(--${s.color});--unit-rgb:var(--${s.color}-rgb)`;

/** §R4 — the hero's save-point card for the latest written session. */
function respawnCard(P) {
  const s = P.latest;
  if (!s) return '';
  return `<aside class="respawn-card" style="${unitVars(s)}" aria-label="Latest session on the path">
  <div class="dotgrid" aria-hidden="true"></div>
  <div class="rc-top"><span class="rc-label">Save point</span><span class="chip unit">Unit ${s.unit} · Act ${s.act.id}</span></div>
  <div class="rc-mid">${stamp(s, 'lg')}<div class="rc-when"><span>Week ${s.week} · ${escapeHtml(s.dayName)}</span><span class="faint">180-minute session · ${s.read || 45}-minute read</span></div></div>
  <h2 class="rc-title"><a href="${s.url}">${escapeHtml(s.title)}</a></h2>
  <p class="rc-hook">${escapeHtml(s.hook || s.subtitle)}</p>
  <div class="rc-foot"><a class="pill primary" href="${s.url}">Continue ${icon('arrow-right', 'pill-icon')}</a><span class="rc-count">${P.written.length} of ${P.sessions.length} written</span></div>
</aside>`;
}

/** §R5 — the route strip: 18 week cells. */
function routeStrip(P) {
  // Kept terse on purpose: the home page has a 60 KB budget. Colour comes from a class on the cell
  // (`u-green` …), a second bar only when the week straddles two acts.
  const cells = P.weeks.map((w) => {
    const colors = [...new Set(w.sessions.map((s) => s.color))];
    const dots = w.sessions.map((s) => `<i${s.written ? ' class="on"' : ''}></i>`).join('');
    const bars = colors.length > 1 ? `<span class="route-bar">${colors.map((c) => `<b class="u-${c}"></b>`).join('')}</span>` : '';
    const flag = P.latest && P.latest.week === w.n ? icon('flag', 'rc-flag') : '';
    const written = w.sessions.filter((s) => s.written).length;
    return `<a class="route-cell u-${colors[0]}" href="/path/#week-${w.n}" aria-label="Week ${w.n}, unit ${w.units.join(' and ')}, ${written} of ${w.sessions.length} written">${bars}<span class="route-week">W${String(w.n).padStart(2, '0')}</span>${flag}<span class="route-dots">${dots}</span><span class="route-unit">U${w.units.join('·')}</span></a>`;
  }).join('');
  const legend = P.acts.map((a) => `<span class="legend-item"><i style="background:var(--${a.color})"></i>Act ${a.id} · ${escapeHtml(a.name)}</span>`).join('');
  const latest = P.latest ? `<a class="pill ghost" href="${P.latest.url}">Latest: ${escapeHtml(P.latest.id)} ${escapeHtml(P.latest.title)} ${icon('arrow-right', 'pill-icon')}</a>` : `<a class="pill ghost" href="/path/">Open the path ${icon('arrow-right', 'pill-icon')}</a>`;
  return `<div class="route">${cells}</div><div class="route-foot">${latest}<div class="legend">${legend}</div></div>`;
}

/** §R7 — a session card on the path index; written or the designed empty state. */
function sessionCard(s) {
  const day = `<span class="sc-day">${escapeHtml(s.dayName)}</span>`;
  if (s.written) {
    const chips = [chip(`${s.read || 45} min read`), chip(`${s.diagramCount} diagram${s.diagramCount === 1 ? '' : 's'}`), chip(`${s.sideQuestPages.length} side quest${s.sideQuestPages.length === 1 ? '' : 's'}`)].join('');
    return `<article class="session-card card is-written" style="${unitVars(s)}">
  <div class="sc-top">${stamp(s, 'md')}<div>${day}<h3><a href="${s.url}">${escapeHtml(s.title)}</a></h3></div></div>
  <p class="sc-hook">${escapeHtml(s.hook || s.subtitle)}</p>
  <div class="sc-foot"><span class="chips">${chips}</span>${icon('arrow-right', 'sc-arrow')}</div>
</article>`;
  }
  const quests = s.sideQuestPages.length
    ? `<p class="sc-quests">Side quests that cover this ground today:</p><span class="chips">${s.sideQuestPages.slice(0, 3).map((p) => `<a class="chip outline-green" href="${p.url}">${escapeHtml(p.title)}</a>`).join('')}</span>`
    : `<p class="sc-quests">No side quests yet.</p>`;
  return `<article class="session-card is-empty" style="${unitVars(s)}">
  <div class="sc-top">${stamp(s, 'md')}<div>${day}<h3>${escapeHtml(s.title)}</h3></div></div>
  <p class="sc-empty">Not yet written · respawns here</p>
  ${quests}
</article>`;
}

/** §R7 — act divider + week blocks. */
function weekBlocks(P) {
  let currentAct = null;
  const out = [];
  for (const w of P.weeks) {
    if (w.act.id !== currentAct) {
      currentAct = w.act.id;
      out.push(`<p class="act-head" style="--unit:var(--${w.act.color})"><span>Act ${w.act.id} · ${escapeHtml(w.act.name)} · Weeks ${escapeHtml(w.act.weeks)}</span></p>`);
    }
    const unitTitle = w.unitInfos.map((u) => `Unit ${u.n} · ${escapeHtml(u.title)}`).join(' → ');
    out.push(`<section class="week" id="week-${w.n}">
  <div class="week-head"><h2>Week ${w.n}</h2><span class="week-unit">${unitTitle}</span></div>
  <div class="week-cards">${w.sessions.map(sessionCard).join('')}</div>
</section>`);
  }
  return out.join('\n');
}

/** §R8 — the sidebar tree on a session page: every week, every session, unwritten ones unlinked. */
function pathTree(P, page) {
  const items = P.weeks.map((w) => {
    const open = w.sessions.some((s) => s.url === page.url);
    const rows = w.sessions.map((s) => {
      const label = `${stamp(s, 'sm')}<span>${escapeHtml(s.title)}</span>`;
      return s.written
        ? `<li><a href="${s.url}"${s.url === page.url ? ' class="is-current" aria-current="page"' : ''}>${label}</a></li>`
        : `<li><span class="tree-empty">${label}</span></li>`;
    }).join('');
    const written = w.sessions.filter((s) => s.written).length;
    return `<li class="tree-group${open ? ' open' : ''}" data-group="week-${w.n}"><button type="button" aria-expanded="${open}">${icon('chevron')}<span>Week ${w.n} · Unit ${w.units.join('·')}</span><span class="count">${written}/${w.sessions.length}</span></button><ul>${rows}</ul></li>`;
  }).join('');
  return `<p class="tree-title"><a href="/path/" style="color:inherit">The Path</a><span>${P.written.length}/${P.sessions.length} WRITTEN</span></p><ul class="tree path-tree" id="tree">${items}</ul>`;
}

/** §R9 — the side-quest banner on a library page. */
function sideQuestBanner(sessions) {
  if (!sessions || !sessions.length) return '';
  const first = sessions[0];
  // Each session name links back to the box the reader came from, so a page shared by two sessions can return to either.
  const names = sessions.map((s) => `<a href="${s.url}#side-quests">${escapeHtml(s.title)}</a>`);
  const sentence = sessions.length === 1
    ? `Side quest from Session ${escapeHtml(first.id)}, ${names[0]}`
    : `Side quest from Sessions ${sessions.map((s, i) => `${escapeHtml(s.id)} (${names[i]})`).join(' and ')}`;
  return `<aside class="sq-banner" style="${unitVars(first)}" aria-label="Part of the path">${stamp(first, 'sm')}<p>${sentence}</p><a class="pill ghost sq-back" href="${first.url}#side-quests" aria-label="Back to the path, session ${escapeHtml(first.id)}"><span>Back to the path</span>${icon('arrow-left', 'pill-icon')}</a></aside>`;
}

/** §R8 — a diagram figure with both crops. key = "<set>/<file>" in content/path/diagrams.json. */
function diagramFigure(P, key, { eager = false, number = true } = {}) {
  const d = P.diagrams[key];
  if (!d || !d.alt) throw new Error(`diagram ${key} has no ledger entry / alt text in content/path/diagrams.json`);
  const base = `/assets/diagrams/${key}`;
  const figNo = number && d.fig ? `<span class="fig-no">Fig ${d.fig} ·</span> ` : '';
  return `<figure class="diagram"><picture><source media="(max-width: 600px)" srcset="${base}-tall.png" width="900" height="1200"><img src="${base}-wide.png" alt="${escapeHtml(d.alt)}" width="1600" height="900"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></picture>${d.caption ? `<figcaption>${figNo}${escapeHtml(d.caption)}</figcaption>` : ''}</figure>`;
}

/** §R8 — the side-quests box inside a session. */
function sideQuestsBox(s) {
  const rows = s.sideQuestPages.map((p, i) => {
    const sec = sectionMeta(p.section);
    const why = (s.sideQuestWhy && s.sideQuestWhy[i]) || '';
    return `<li><span class="sq-ic">${icon(sec ? sec.icon : 'book')}</span><div><a href="${p.url}">${escapeHtml(p.title)}</a>${why ? `<span class="sq-why">${escapeHtml(why)}</span>` : ''}</div><span class="sq-sec">${escapeHtml(p.section)}</span></li>`;
  }).join('');
  return `<section class="side-quests" style="${unitVars(s)}"><p class="rail-title">Side quests from this session</p><ul>${rows}</ul></section>`;
}

/** §R8 — a live stage: the html fence rendered as real DOM, fenced off from the rest of the page.
 *  The `live=<name>` script sees this element as `document` (app.js scopes it); the template keeps the
 *  original markup so every Run starts from a clean stage. */
function stageBox(name, html) {
  const inner = html.trim();
  return `<div class="stage" data-stage="${escapeHtml(name)}" id="stage-${escapeHtml(name)}"><div class="stage-head"><span class="stage-lbl">${icon('play')}Stage</span><span class="stage-file">${escapeHtml(name)}.html, rendered</span><span class="stage-state" data-stage-state>not run yet</span></div><div class="stage-root" data-stage-root tabindex="0" aria-label="Live stage: ${escapeHtml(name)}">${inner}</div><template data-stage-template>${inner}</template></div>`;
}

/** The lesson terminal under a `bash term=<name>` fence (§R8 Terminal stages). The script lives in a
 *  <template> so term.js can replay it; the reader's own commands go through the prompt form. */
function termBox(name, script) {
  return `<div class="term" data-term="${escapeHtml(name)}" id="term-${escapeHtml(name)}"><div class="term-head"><span class="term-lbl">${icon('play')}Terminal</span><span class="term-host">adventurer@newworld · bash</span><span class="term-state" data-term-state>not run yet</span></div><div class="term-screen" data-term-screen role="log" aria-live="polite" aria-label="Terminal output: ${escapeHtml(name)}"></div><form class="term-line" data-term-form autocomplete="off"><span class="term-ps1" data-term-prompt>adventurer@newworld:~$</span><input class="term-input" data-term-input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type a command and press Enter" placeholder="type a command, press Enter"></form><template data-term-script>${escapeHtml(script.trim())}</template></div>`;
}

module.exports = { respawnCard, routeStrip, sessionCard, weekBlocks, pathTree, sideQuestBanner, diagramFigure, sideQuestsBox, stageBox, termBox, unitVars };
