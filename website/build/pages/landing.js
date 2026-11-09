// T-LANDING: one per section. Editorial intro + group intros from content/sections/<id>.md, README fragments where the registry says so.
const path = require('path');
const S = require('../sources.config');
const U = require('../util');
const site = require('../site.config');
const { renderMarkdown, parseFrontmatter } = require('../parsers/markdown');
const { renderLanding } = require('../render/landing');
const { chip, icon } = require('../render/components');
const { escapeHtml } = require('../highlight');

function sectionId(title) { return site.sections.find((s) => s.title === title).id; }

function pickH2(md, title) {
  const esc = title.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const m = md.match(new RegExp(`^## ${esc}[^\n]*\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
  return m ? m[0] : '';
}

function loadSectionContent(id) {
  const raw = U.readIf(path.join(S.CONTENT, 'sections', `${id}.md`));
  if (!raw) throw new Error(`Missing content/sections/${id}.md`);
  const { data, body } = parseFrontmatter(raw);
  const [intro, ...groups] = body.split(/^## /m);
  const groupIntros = {};
  for (const g of groups) {
    const [name, ...rest] = g.split('\n');
    groupIntros[name.trim()] = rest.join('\n').trim();
  }
  return { frontmatter: data, intro: intro.trim(), groupIntros };
}

function chipFor(p) {
  switch (p.template) {
    case 'T-LESSON': return chip('Lesson', 'green');
    case 'T-PREP': return chip(`${p.sectionCount ?? '?'} section${p.sectionCount === 1 ? '' : 's'}`);
    case 'T-EXERCISE': return chip(`${p.testCount ?? '?'} test${p.testCount === 1 ? '' : 's'}`);
    case 'T-ARTICLE': return chip(p.section === 'Atelier' ? 'Workshop' : 'Article');
    case 'T-LANG': { const m = p.url.match(/\/(intro|oop|routing|models|api)\/$/); return m ? chip(`Step ${['intro', 'oop', 'routing', 'models', 'api'].indexOf(m[1]) + 1}`) : chip('Walkthrough', 'yellow'); }
    case 'T-LANG-INDEX': return p.url === '/languages/javascript/' ? chip('12 sheets', 'yellow') : p.url === '/languages/frontend/' ? chip('5 guides', 'yellow') : chip('5 steps', 'yellow');
    default: return '';
  }
}

async function md2html(md, opts = {}) {
  const r = await renderMarkdown(md, { stripFrontmatter: false, dropH1: false, callouts: false, ...opts });
  return r;
}

async function renderLandingPage(ctx, page) {
  const id = sectionId(page.section);
  const c = loadSectionContent(id);
  const introR = await md2html(c.intro);
  const intro = introR.html;
  if (U.words(introR.firstParagraph) > 120) throw new Error(`${page.id}: landing intro exceeds 120 words`);
  const groupIntros = {};
  for (const [g, text] of Object.entries(c.groupIntros)) {
    if (U.words(text) > 25) throw new Error(`${page.id}: group intro for "${g}" exceeds 25 words`);
    groupIntros[g] = `<p>${escapeHtml(text)}</p>`;
  }
  let context = '';
  let notice = '';
  let after = '';
  const rawLinks = [];
  if (page.id === 'ATELIER-00') {
    context = '<div class="prose atelier-preview"><p class="eyebrow">WHAT YOU WILL BUILD</p><figure class="img"><a href="/assets/atelier/10/index.html"><img src="/assets/content/atelier/10-result.jpg" alt="The finished portfolio: a dark split hero with green gradient typography, a cutout portrait, and a soft glow." loading="lazy"></a><figcaption>Start with a plain document. Build this composition, then the cards, gallery, and interactions below it. Open the preview to explore the complete page.</figcaption></figure></div>';
  }

  if (page.id === 'ALG-00') {
    const readme = U.read(path.join(S.PREP, 'algorithms', 'README.md'));
    const files = pickH2(readme, 'Files');
    const r = await md2html(files.replace(/^## Files[^\n]*\n/, ''));
    groupIntros.Patterns = (groupIntros.Patterns || '') + `<details class="readme-table"><summary>${icon('chevron')}Files table from algorithms/README.md</summary>${r.html}</details>`;
    rawLinks.push('/assets/src/prep/algorithms/README.md');
  }
  if (page.id === 'SYS-00') {
    const readme = U.read(path.join(S.PREP, 'system-design', 'README.md'));
    const r = await md2html(pickH2(readme, 'Vocabulary dump (the words that vanish mid-interview)'));
    after = `<section class="context" id="vocabulary-dump"><div class="prose">${r.html}</div></section>`;
    U.copy(path.join(S.PREP, 'system-design', 'README.md'), path.join(S.PUBLIC, 'assets', 'src', 'prep', 'system-design', 'README.md'));
  }
  if (page.id === 'PAT-00') {
    const readme = U.read(path.join(S.PREP, 'system-design', 'design-patterns', 'README.md'));
    const tables = { Creational: 'Creational — how objects get made', Structural: 'Structural — how objects are composed', Behavioral: 'Behavioral — how objects talk and divide responsibility' };
    for (const [g, h2] of Object.entries(tables)) {
      const r = await md2html(pickH2(readme, h2).replace(/^## [^\n]*\n/, ''), { resolveLink: (href) => { const m = href.match(/^(creational|structural|behavioral)\/([a-z-]+)\.js$/); return m ? `/patterns/${m[1]}/${m[2]}/` : href; } });
      groupIntros[g] = (groupIntros[g] || '') + `<details class="readme-table"><summary>${icon('chevron')}${escapeHtml(h2)} — intent and sightings</summary>${r.html}</details>`;
    }
    const conf = await md2html(pickH2(readme, 'Confusables'));
    const how = await md2html(pickH2(readme, 'How to answer "what design patterns have you used?"'));
    after = `<section class="context" id="confusables"><div class="prose">${conf.html}</div></section><section class="context" id="how-to-answer"><div class="prose">${how.html}</div></section>`;
    U.copy(path.join(S.PREP, 'system-design', 'design-patterns', 'README.md'), path.join(S.PUBLIC, 'assets', 'src', 'prep', 'system-design', 'design-patterns', 'README.md'));
  }
  if (page.id === 'SEC-00') {
    const readme = U.read(path.join(S.PREP, 'owasp', 'README.md'));
    const list = await md2html(pickH2(readme, 'The list (2025) and where it came from (2021)').replace(/^Files: .*$/m, ''), { resolveLink: () => null });
    const glossary = await md2html(pickH2(readme, 'Glossary'));
    const how = await md2html(pickH2(readme, 'How to talk about security in an interview (6 lines)'));
    context = `<div class="prose">${list.html}</div>`;
    after = `<section class="context" id="glossary"><div class="prose">${glossary.html}</div></section><section class="context" id="how-to-talk"><div class="prose">${how.html}</div></section>`;
    U.copy(path.join(S.PREP, 'owasp', 'README.md'), path.join(S.PUBLIC, 'assets', 'src', 'prep', 'owasp', 'README.md'));
  }
  if (page.id === 'PRAC-00') {
    notice = `The AlgoCasts exercises are reproduced verbatim from <a href="${S.ALGOCASTS_REPO}" target="_blank" rel="noopener">arthurbernierjr/AlgoCasts</a> at <code>${S.ALGOCASTS_SHA}</code> under the <a href="/licenses/gpl-3.0.txt">GNU GPL-3.0</a>. Nothing in them was changed.`;
  }
  if (page.id === 'LANG-00') {
    const { switcher } = require('./lang');
    after = `<section class="context" id="switcher"><p class="eyebrow" style="margin-bottom:16px">LANGUAGE SWITCHER</p>${switcher(null, null)}<p style="margin:12px 0 0;color:var(--muted);font-size:14px">Every language page carries this switcher and keeps you on the same step when you change language.</p></section>`;
  }

  const html = renderLanding(ctx, {
    page,
    intro,
    groupIntros,
    chipFor,
    context,
    notice,
    after,
    description: introR.firstParagraph,
  });
  return { html, search: { headings: Object.keys(groupIntros), text: introR.firstParagraph }, facts: { groups: (ctx.reg.groupsBySection[page.section] || []).map((g) => `${g.name} (${g.pages.length})`), children: (ctx.reg.bySection[page.section] || []).length - 1 } };
}

module.exports = { renderLandingPage, chipFor, pickH2, loadSectionContent };
