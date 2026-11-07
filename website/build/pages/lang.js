// T-LANG and T-LANG-INDEX: Arthur's polyglot guides (content/source/polyglot) with overrides, plus the JavaScript sheet index.
const path = require('path');
const S = require('../sources.config');
const U = require('../util');
const { renderMarkdown } = require('../parsers/markdown');
const { LANGS, SUBPAGES, FRONTEND, loadWithOverride, parseLanguageIndex } = require('../parsers/polyglot');
const { renderDoc, creatorCard } = require('../render/doc');
const { renderLangIndex } = require('../render/landing');
const { chip, icon, callout, codePanel } = require('../render/components');
const { highlightToLines, escapeHtml } = require('../highlight');

const SUB_TITLES = { intro: 'Intro', oop: 'OOP', routing: 'Routing', models: 'Models', api: 'API' };
const BACKEND = LANGS.filter((l) => l.code !== 'javascript');

function parseLangUrl(url) {
  const m = url.match(/^\/languages\/([a-z-]+)\/(?:([a-z-]+)\/)?$/);
  if (!m) return null;
  return { code: m[1], sub: m[2] || null };
}

function switcher(current, sub, { frontend = false } = {}) {
  let items;
  if (frontend) {
    items = FRONTEND.map((f) => ({ name: f.name, href: `/languages/frontend/${f.code}/`, cur: f.code === current }));
  } else {
    items = LANGS.map((l) => ({ name: l.name, href: l.code === 'javascript' ? '/languages/javascript/' : `/languages/${l.code}/${sub ? sub + '/' : ''}`, cur: l.code === current }));
  }
  return `<nav class="lang-switch" aria-label="Switch language">${items.map((i) => `<a href="${i.href}"${i.cur ? ' class="is-current" aria-current="page"' : ''}>${escapeHtml(i.name)}</a>`).join('')}</nav>`;
}

function stepRail(code, sub) {
  const idx = SUBPAGES.indexOf(sub);
  return `<nav class="step-rail" aria-label="Steps">${SUBPAGES.map((s, i) => `<a href="/languages/${code}/${s}/"${s === sub ? ' class="is-current" aria-current="step"' : i < idx ? ' class="done"' : ''}>${i + 1} ${SUB_TITLES[s]}</a>`).join('<span class="sep"></span>')}</nav>`;
}

function changesCallout(fm, override) {
  if (override && Array.isArray(fm.changes) && fm.changes.length) {
    return callout('changes editorial', 'What changed since the 2021 original', `<ul>${fm.changes.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`);
  }
  if (override) return callout('changes editorial', 'What changed since the 2021 original', '<p>Formatting and link fixes only; the text was checked against the docs listed in the Source card and left as written.</p>');
  return callout('editorial', 'Pending refresh', `<p>This page still shows the 2021 text as originally written. It is scheduled for the verification pass: every command and version will be checked against the official docs and the changes listed here.</p>`);
}

function resolveDocsImage(href) {
  if (/^https?:\/\//.test(href)) return null; // remote images are dropped (dead hosts / third-party logos)
  return null;
}

async function renderLangPage(ctx, page) {
  const { code, sub } = parseLangUrl(page.url);
  const isFrontend = code === 'frontend';
  let loaded;
  let sourceRel;
  if (isFrontend && sub === 'react-cheatsheet') {
    loaded = loadWithOverride(S.REACT_CHEATSHEET, path.join('languages', 'frontend', 'react-cheatsheet.md'));
    sourceRel = 'polyglot/frontend/react-cheatsheet.md';
  } else if (isFrontend) {
    loaded = loadWithOverride(path.join(S.POLYGLOT, 'frontend', sub + '.md'), path.join('languages', 'frontend', sub + '.md'));
    sourceRel = `polyglot/frontend/${sub}.md`;
  } else {
    loaded = loadWithOverride(path.join(S.POLYGLOT, code, sub + '.md'), path.join('languages', code, sub + '.md'));
    sourceRel = `polyglot/${code}/${sub}.md`;
  }
  const fm = loaded.frontmatter || {};
  const lang = LANGS.find((l) => l.code === code) || FRONTEND.find((f) => f.code === sub) || {};

  const r = await renderMarkdown(loaded.md, {
    stripFrontmatter: false,
    dropH1: true,
    dropHeadings: new Set(['Table of Contents']),
    resolveImage(href, alt) {
      if (/^https?:\/\//.test(href)) return null;
      const abs = path.resolve(path.dirname(loaded.overridePath || loaded.sourcePath), href);
      if (!U.exists(abs)) return null;
      const file = path.basename(abs);
      U.copy(abs, path.join(S.PUBLIC, 'assets', 'content', 'languages', code, file));
      return { src: `/assets/content/languages/${code}/${file}`, alt };
    },
    resolveLink(href) {
      const m = href.match(/^\/polyglot\/([a-z]+)\/([a-z-]+)\/?$/);
      if (m) return `/languages/${m[1]}/${m[2]}/`;
      const m2 = href.match(/^\/polyglot\/([a-z]+)\/?$/);
      if (m2) return `/languages/${m2[1]}/`;
      if (/^\.?\/?[a-z-]+\.md$/.test(href)) { const s = href.replace(/^\.?\//, '').replace(/\.md$/, ''); return isFrontend ? `/languages/frontend/${s}/` : `/languages/${code}/${s}/`; }
      return href;
    },
  });

  // Paired JS/X code blocks: two consecutive code panels where the first is js and the second is the target language.
  let html = r.html;
  if (!isFrontend) {
    html = html.replace(/(<figure class="code[^"]*"><div class="code-head"><span class="code-lang" data-lang="javascript">[\s\S]*?<\/figure>)\n(<figure class="code[^"]*"><div class="code-head"><span class="code-lang" data-lang="(?!javascript)[a-z#+-]+">[\s\S]*?<\/figure>)/g, (m, a, b) => `<div class="paired">${a}${b}</div><p class="paired-cap">LEFT: JAVASCRIPT · RIGHT: ${escapeHtml((lang.name || code).toUpperCase())}</p>`);
  }

  // The page's markdown is not published as a raw copy, and neither is the 2021 original: the
  // rendered page is the material; the Creator card says who wrote it. Second-wave reviewers diff
  // content/source/ against content/overrides/ in the repository (TEST-INSTRUCTIONS §4).

  const verified = ctx.verification[page.url] || (fm.verified ? { date: fm.verified, docs: fm.docs || [], exec: fm.exec, note: fm.verified_note } : null);
  const framework = fm.framework || page.framework || lang.fw || null;
  const chips = [];
  if (!isFrontend) chips.push(chip(`Step ${SUBPAGES.indexOf(sub) + 1} of 5`));
  if (framework) chips.push(chip(framework, 'green'));
  if (fm.version) chips.push(chip(`v${String(fm.version).replace(/^v/, '')}`, 'yellow'));
  chips.push(chip('© Arthur Bernier Jr', 'green'));
  chips.push(loaded.override ? chip('rewritten · verified', 'green') : chip('2021 original', 'yellow'));
  if (fm.editorial) chips.push(chip('editorial', 'editorial'));

  // Original material: Creator card (no repo paths). The "What changed" callout at the end of the
  // page and the Verified line carry the rewrite history.
  const source = creatorCard({
    verified: verified ? { date: verified.date, docs: verified.docs, exec: verified.exec, note: verified.note } : null,
  });

  const beforeBody = (isFrontend ? switcher(sub, null, { frontend: true }) : switcher(code, sub)) + (isFrontend ? '' : stepRail(code, sub));
  const afterBody = changesCallout(fm, loaded.override);
  const lede = fm.lede ? escapeHtml(fm.lede) : escapeHtml(U.truncate(r.firstParagraph, 200));
  const headings = r.headings;
  const railActions = `<a href="#source">${icon('info')}Creator &amp; verification</a>`;

  const docHtml = renderDoc(ctx, {
    page,
    eyebrow: isFrontend ? `FRONTEND · ${lang.name || sub}` : `${(lang.name || code).toUpperCase()} · STEP ${SUBPAGES.indexOf(sub) + 1} · ${SUB_TITLES[sub].toUpperCase()}`,
    lede,
    chips,
    meta: [`${r.codeBlocks.length} code blocks`, `${r.words} words`],
    body: html,
    headings,
    source,
    beforeBody,
    afterBody,
    railActions,
    wide: true,
    description: fm.lede || r.firstParagraph,
  });
  return {
    html: docHtml,
    search: { headings: headings.map((h) => h.text), text: fm.lede || r.firstParagraph },
    facts: { h2s: headings.filter((h) => h.level === 2).map((h) => h.text), codeBlocks: r.codeBlocks.length, override: loaded.override, framework, version: fm.version || null, editorial: !!fm.editorial },
    codeBlocks: r.codeBlocks,
  };
}

/* ---------- T-LANG-INDEX ---------- */

async function renderJsIndex(ctx, page) {
  const readme = U.read(path.join(S.PREP, 'javascript', 'README.md'));
  const rows = Array.from(readme.matchAll(/^\| `([a-z0-9-]+)\.js` \| (.+?) \|$/gm)).map((m) => ({ file: m[1], desc: m[2] }));
  const intro = readme.split('\n').filter((l) => !/^#|^\||^Run everything/.test(l) && l.trim()).slice(0, 2).join(' ');
  const steps = [];
  const children = ctx.reg.groupsBySection.Languages.find((g) => g.name === 'JavaScript').pages.filter((p) => p !== page);
  for (const row of rows) {
    const child = children.find((p) => p.source.endsWith(`/javascript/${row.file}.js`));
    const prac = ctx.reg.pages.find((p) => p.source.endsWith(`/javascript/${row.file}.js`) && p.section === 'Practice');
    const target = child || prac;
    if (!target) continue;
    steps.push({ num: String(steps.length + 1).padStart(2, '0'), title: target.title, url: target.url, blurb: escapeHtml(row.desc) + (prac && !child ? ' <span class="chip">in Practice</span>' : '') });
  }
  const html = renderLangIndex(ctx, {
    page,
    intro: `<p>${escapeHtml(intro)}</p>`,
    switcher: switcher('javascript', null),
    steps,
    lists: [],
    source: creatorCard({ verified: ctx.verification[page.url] || null }),
    description: intro,
  });
  return { html, search: { headings: steps.map((s) => s.title), text: intro }, facts: { cards: steps.length, rows: rows.length } };
}

async function renderBackendIndex(ctx, page, code) {
  const idx = parseLanguageIndex(code);
  const lang = LANGS.find((l) => l.code === code);
  const children = ctx.reg.groupsBySection.Languages.find((g) => g.name === page.group).pages.filter((p) => p !== page);
  const steps = SUBPAGES.map((s, i) => {
    const child = children.find((p) => p.url === `/languages/${code}/${s}/`);
    return { num: `STEP ${i + 1}`, title: SUB_TITLES[s], url: child ? child.url : `/languages/${code}/${s}/`, blurb: child ? escapeHtml(child.title.replace(/^[^·]+· /, '')) : '' };
  });
  const dsList = `<ul>${idx.dataStructures.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`;
  const chal = [];
  for (const c of idx.challenges) {
    const h = await highlightToLines(c.code + '\n', 'js');
    const prac = c.name ? ctx.reg.byUrl[`/practice/algocasts/${c.name}/`] : null;
    chal.push(`<div class="challenge">${codePanel({ lang: 'js', html: h, code: c.code, readonly: true, title: c.title })}${prac ? `<a class="pill ghost" href="${prac.url}" style="margin-top:10px;min-height:40px;padding:8px 18px;font-size:13px">Practice: ${escapeHtml(prac.title)} ${icon('arrow-right', 'pill-icon')}</a>` : ''}</div>`);
  }
  const intro = `<p>${escapeHtml(lang.name)} on the five-step path: the language itself, objects, then ${escapeHtml(lang.fw)} for routing, models and a deployed API. Each step was rewritten from Arthur's 2021 guide and checked against ${lang.docs.map((d) => d.replace(/^https?:\/\//, '').replace(/\/.*$/, '')).join(', ')}. Finish with the data structures and the five challenges below, written in ${escapeHtml(lang.name)}.</p>`;
  const html = renderLangIndex(ctx, {
    page,
    intro,
    switcher: switcher(code, null),
    steps,
    lists: [{ title: 'Data Structures To Attempt', html: dsList }, { title: 'Algo Challenges to Attempt', html: chal.join('') }],
    source: creatorCard({ verified: ctx.verification[page.url] || null }),
    description: U.stripTags(intro),
  });
  return { html, search: { headings: ['Data Structures To Attempt', 'Algo Challenges to Attempt'], text: U.stripTags(intro) }, facts: { subpages: steps.length, dataStructures: idx.dataStructures.length, challenges: idx.challenges.length } };
}

async function renderFrontendIndex(ctx, page) {
  const children = ctx.reg.groupsBySection.Languages.find((g) => g.name === 'Frontend').pages.filter((p) => p !== page);
  const steps = children.map((c, i) => {
    const v = ctx.verification[c.url];
    const ver = v && v.version ? `verified at v${String(v.version).replace(/^v/, '')}` : 'version pending verification';
    return { num: String(i + 1).padStart(2, '0'), title: c.title, url: c.url, blurb: `<span class="chip ${v && v.version ? 'green' : 'yellow'}">${escapeHtml(ver)}</span>` };
  });
  const intro = `<p>Four ways to consume the API you built in the language guides: the same list → show → create walkthrough in React, Vue, Angular and Svelte, each rewritten for the current major release and checked against the framework's own documentation, plus the React cheatsheet.</p>`;
  const html = renderLangIndex(ctx, {
    page,
    intro,
    switcher: switcher(null, null, { frontend: true }),
    steps,
    lists: [],
    source: creatorCard({ verified: ctx.verification[page.url] || null }),
    description: U.stripTags(intro),
  });
  return { html, search: { headings: steps.map((s) => s.title), text: U.stripTags(intro) }, facts: { cards: steps.length } };
}

async function renderLangIndexPage(ctx, page) {
  const { code } = parseLangUrl(page.url);
  if (code === 'javascript') return renderJsIndex(ctx, page);
  if (code === 'frontend') return renderFrontendIndex(ctx, page);
  return renderBackendIndex(ctx, page, code);
}

module.exports = { renderLangPage, renderLangIndexPage, parseLangUrl, switcher, BACKEND };
