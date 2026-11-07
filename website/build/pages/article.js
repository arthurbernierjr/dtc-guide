// T-ARTICLE: prep markdown sheets, Arthur's own lecture decks (mindset, system design primer), the README-derived pages and the naive-vs-optimal pairs.
const path = require('path');
const fs = require('fs');
const { createHash } = require('crypto');
const { guideTree } = require('../render/guide-tree');
const S = require('../sources.config');
const U = require('../util');
const { renderMarkdown, parseFrontmatter } = require('../parsers/markdown');
const { loadWithOverride } = require('../parsers/polyglot');
const { renderDoc, creatorCard } = require('../render/doc');
const { chip, icon, callout, codePanel, badgeComplexity } = require('../render/components');
const { highlightToLines, escapeHtml } = require('../highlight');
const { slugify } = require('../registry');

// Dead external images (old hosted media, imgur, Dropbox) → site-made diagrams, by alt text / filename.
const DIAGRAM_FOR = [
  { re: /arthur_node_jsx|mern architecture|arthurGraphic/i, file: 'mern-architecture.svg', caption: 'MERN architecture (diagram made for this site)' },
  { re: /mvc/i, file: 'mvc.svg', caption: 'MVC (diagram made for this site)' },
  { re: /rest/i, file: 'rest.svg', caption: 'REST resources and verbs (diagram made for this site)' },
  { re: /components|TGZKfoI/i, file: 'components.svg', caption: 'Component tree (diagram made for this site)' },
  { re: /client|server/i, file: 'client-server.svg', caption: 'Client–server model (diagram made for this site)' },
];

function diagram(file, caption) {
  const bytes = fs.readFileSync(path.join(__dirname, '..', 'assets', 'diagrams', file));
  const version = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
  return { src: `/assets/diagrams/${file}?v=${version}`, alt: caption, caption };
}

function imageResolver(baseDir, outSub, { diagrams = true, mansion = false } = {}) {
  let mansionUsed = false;
  return function resolveImage(href, alt) {
    if (/^https?:\/\//.test(href)) {
      if (!diagrams) return null;
      if (mansion) { if (mansionUsed) return null; mansionUsed = true; return diagram('digital-mansion.svg', 'The eight parts of the digital mansion (diagram made for this site)'); }
      const d = DIAGRAM_FOR.find((x) => x.re.test(alt || '') || x.re.test(href));
      return d ? diagram(d.file, d.caption) : null;
    }
    if (href.startsWith('/assets/diagrams/')) {
      const d = DIAGRAM_FOR.find((x) => href.endsWith('/' + x.file));
      return d ? diagram(d.file, d.caption) : { src: href, alt, caption: alt };
    }
    let abs = null;
    if (href.startsWith('/images/')) abs = path.join(S.OWN_IMAGES, href.replace(/^\/images\//, ''));
    else abs = path.resolve(baseDir, href);
    if (!abs || !U.exists(abs)) return null;
    const file = path.basename(abs);
    U.copy(abs, path.join(S.PUBLIC, 'assets', 'content', outSub, file));
    return { src: `/assets/content/${outSub}/${file}`, alt };
  };
}

function wrapH3Cards(html) {
  // Each <h3 …>…</h3> and the content until the next <h3/<h2 becomes an anchored card.
  const parts = html.split(/(?=<h3 )/);
  return parts.map((p) => {
    if (!p.startsWith('<h3 ')) return p;
    const idm = p.match(/^<h3 id="([^"]+)"/);
    const [head, ...rest] = p.split(/(?=<h2 )/);
    return `<article class="card vuln-card" data-anchor="${idm ? idm[1] : ''}">${head}</article>${rest.join('')}`;
  }).join('');
}

/**
 * When the lede was lifted verbatim from the opening paragraph (short enough not to be
 * truncated), remove that paragraph from the body so it is not printed twice.
 */
function dropLeadParagraph(html, firstParagraph) {
  if (!firstParagraph || firstParagraph.length > 220) return html;
  const m = html.match(/^\s*<p>([\s\S]*?)<\/p>\s*/);
  if (!m) return html;
  const text = U.stripTags(m[1]).replace(/\s+/g, ' ').trim();
  if (text !== firstParagraph.replace(/\s+/g, ' ').trim()) return html;
  return html.slice(m[0].length);
}

async function renderPrepMarkdown(ctx, page, rel) {
  const abs = path.join(S.PREP, rel);
  const md = U.read(abs);
  const r = await renderMarkdown(md, {
    resolveImage: imageResolver(path.dirname(abs), 'prep', { diagrams: false }),
    resolveLink(href) {
      const m = href.match(/^(?:\.\.\/|\.\/)?((?:concepts|walkthroughs|design-patterns|algorithms|system-design|owasp)\/)?([a-z0-9-]+)\.(md|js)$/);
      if (m) {
        const hit = ctx.reg.pages.find((p) => p.source.endsWith(`/${(m[1] || '') + m[2]}.${m[3]}`) || p.source.endsWith(`/${m[2]}.${m[3]}`));
        return hit ? hit.url : null;
      }
      return href;
    },
  });
  let html = r.html;
  if (page.id === 'SEC-11') html = wrapH3Cards(html);
  const numbered = r.headings.filter((h) => h.level === 2 && /^\d+[.)]\s/.test(h.text));
  const stepsRail = numbered.length >= 4 && numbered.length === r.headings.filter((h) => h.level === 2).length;
  const verified = ctx.verification[page.url];
  const fm = r.frontmatter || {};
  const lede = fm.description ? U.truncate(fm.description, 220) : U.truncate(r.firstParagraph, 220);
  if (!fm.description) html = dropLeadParagraph(html, r.firstParagraph);
  return {
    html: renderDoc(ctx, {
      page,
      eyebrow: `${page.group === 'Concepts' ? 'CONCEPT SHEET' : page.group === 'Walkthroughs' ? 'WALKTHROUGH' : 'ARTICLE'} · ${page.group}`,
      lede: escapeHtml(lede),
      chips: [chip('Article'), chip(page.group), chip('© Arthur Bernier Jr', 'green')].concat(stepsRail ? [chip(`${numbered.length} steps`, 'yellow')] : []),
      meta: [`${r.words} words`].concat(r.codeBlocks.length ? [`${r.codeBlocks.length} code block${r.codeBlocks.length === 1 ? '' : 's'}`] : []),
      body: html,
      headings: r.headings,
      stepsRail,
      source: creatorCard({ verified: verified || null }),
      description: lede,
    }),
    search: { headings: r.headings.map((h) => h.text), text: r.firstParagraph },
    facts: { h2s: r.headings.filter((h) => h.level === 2).map((h) => h.text), codeBlocks: r.codeBlocks.length, cards: (html.match(/class="card vuln-card"/g) || []).length },
    codeBlocks: r.codeBlocks,
  };
}

async function renderWhichPatternWhen(ctx, page) {
  const abs = path.join(S.PREP, 'algorithms', 'README.md');
  const md = U.read(abs);
  // (?![\s\S]) = end of input; JS has no \Z, which silently dropped the last section before.
  const pick = (title) => { const m = md.match(new RegExp(`^## ${title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}[^\n]*\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm')); if (!m) throw new Error(`which-pattern-when: section "${title}" not found in algorithms/README.md`); return `## ${title}\n${m[1]}`; };
  const body = `${pick('Which pattern when')}\n${pick('Constraint -> acceptable complexity')}`;
  const r = await renderMarkdown(body, { stripFrontmatter: false, dropH1: false });
  // Link each pattern cell to its page where one exists.
  let html = r.html;
  const intro = `<p>Two tables from the algorithms prep notes, verbatim: the problem "tell" that points at a pattern, and the input size that tells you which complexity will pass. The home page carries the first table as a live filter.</p>`;
  return {
    html: renderDoc(ctx, {
      page,
      eyebrow: `ARTICLE · ${page.group}`,
      lede: 'Read the tell, name the pattern; read n, name the complexity.',
      chips: [chip('Article'), chip('2 tables'), chip('© Arthur Bernier Jr', 'green')],
      meta: [`${(html.match(/<tr>/g) || []).length - 2} rows`],
      body: `<div class="editorial-intro" data-editorial="true">${intro}</div>${html}`,
      headings: r.headings,
      source: creatorCard({ verified: ctx.verification[page.url] || null }),
      description: 'Which pattern when: the problem tells and the constraint-to-complexity table from the algorithms prep notes.',
    }),
    search: { headings: r.headings.map((h) => h.text), text: 'which pattern when constraint acceptable complexity' },
    facts: { h2s: r.headings.filter((h) => h.level === 2).map((h) => h.text), rows: (html.match(/<tbody>[\s\S]*?<\/tbody>/g) || []).map((t) => (t.match(/<tr>/g) || []).length) },
  };
}

/** Parse content/algorithms/naive-vs-optimal.md into pairs. */
function parsePairs(md) {
  const { data, body } = parseFrontmatter(md);
  const intro = body.split(/^## /m)[0].trim();
  const blocks = body.split(/^## /m).slice(1);
  const pairs = blocks.map((b) => {
    const lines = b.split('\n');
    const title = lines[0].trim();
    const prompt = (b.match(/^> (.+)$/m) || [, ''])[1].trim();
    const sec = (name) => { const m = b.match(new RegExp(`^### ${name}[^\n]*\n+\`\`\`js\n([\\s\\S]*?)\`\`\``, 'm')); return m ? m[1].replace(/\n$/, '') : ''; };
    const cx = (name) => { const m = b.match(new RegExp(`^### ${name} · (O\\([^\n]+\\))`, 'm')); return m ? m[1].trim() : ''; };
    const why = (b.match(/\*\*Why it is faster:\*\*\s*([\s\S]*?)(?:\n\n|$)/) || [, ''])[1].trim();
    const [naiveName, optimalName] = title.split(' — ')[0].split(' / ').map((s) => s.trim());
    const pattern = (title.split(' — ')[1] || '').trim();
    return { title, naiveName, optimalName, pattern, prompt, naive: sec('Naive'), optimal: sec('Optimal'), naiveCx: cx('Naive'), optimalCx: cx('Optimal'), tests: sec('Tests'), why };
  });
  return { frontmatter: data, intro, pairs };
}

function runnableFromPairs(pairs) {
  const parts = ["'use strict';", "const assert = require('node:assert/strict');", ''];
  for (const p of pairs) {
    parts.push(`// ── ${p.title}`, p.naive, '', p.optimal, '');
    for (const t of p.tests.split('\n').filter((l) => l.trim())) {
      const m = t.match(/^(.*?)\s*===\s*(.+)$/);
      if (m) parts.push(`assert.equal(${m[1]}, ${m[2]});`);
    }
    // the optimal twin must pass the same cases
    for (const t of p.tests.split('\n').filter((l) => l.trim())) {
      const m = t.match(/^(.*?)\s*===\s*(.+)$/);
      if (m) parts.push(`assert.equal(${m[1].replace(new RegExp('\\b' + p.naiveName + '\\(', 'g'), p.optimalName + '(')}, ${m[2]});`);
    }
    parts.push('');
  }
  parts.push("console.log('ok: algorithms/naive-vs-optimal.js');", '');
  return parts.join('\n');
}

async function renderNaiveVsOptimal(ctx, page) {
  const abs = path.join(S.CONTENT, 'algorithms', 'naive-vs-optimal.md');
  const { frontmatter, intro, pairs } = parsePairs(U.read(abs));
  const runnable = runnableFromPairs(pairs);
  const rawUrl = '/assets/src/algorithms/naive-vs-optimal.js';
  U.write(path.join(S.PUBLIC, 'assets', 'src', 'algorithms', 'naive-vs-optimal.js'), runnable);
  const headings = [];
  const blocks = [];
  for (const p of pairs) {
    const id = slugify(p.naiveName);
    headings.push({ level: 2, text: `${p.naiveName} / ${p.optimalName} — ${p.pattern}`, id });
    const nh = await highlightToLines(p.naive + '\n', 'js');
    const oh = await highlightToLines(p.optimal + '\n', 'js');
    const th = await highlightToLines(p.tests + '\n', 'js');
    blocks.push(`<section class="pair-block" id="${id}">
  <h2>${escapeHtml(p.naiveName)} / ${escapeHtml(p.optimalName)} <span class="chip green">${escapeHtml(p.pattern)}</span><a class="h-anchor" href="#${id}" aria-label="Link to this section">#</a></h2>
  <blockquote class="prompt">${escapeHtml(p.prompt)}</blockquote>
  <div class="pair">
    <div class="pair-side"><div class="pair-head"><span>Naive · <b>${escapeHtml(p.naiveName)}</b></span>${badgeComplexity(p.naiveCx)}</div>${codePanel({ lang: 'js', html: nh, code: p.naive, readonly: true })}</div>
    <div class="pair-side"><div class="pair-head"><span>Optimal · <b>${escapeHtml(p.optimalName)}</b></span>${badgeComplexity(p.optimalCx)}</div>${codePanel({ lang: 'js', html: oh, code: p.optimal, readonly: true })}</div>
  </div>
  <div class="pair-foot"><p class="why"><b>Why it is faster:</b> ${escapeHtml(p.why)}</p></div>
  <details class="pair-tests"><summary>${icon('chevron')}Original test cases (both versions must pass)</summary>${codePanel({ lang: 'js', html: th, code: p.tests, readonly: true, run: { src: rawUrl, ok: 'ok: algorithms/naive-vs-optimal.js', mode: 'worker' } })}</details>
</section>`);
  }
  const introR = await renderMarkdown(intro, { stripFrontmatter: false, dropH1: false });
  const html = renderDoc(ctx, {
    page,
    eyebrow: `ARTICLE · ${page.group}`,
    lede: 'Same tests, two shapes: frequency counter, multiple pointers, sliding window, binary search.',
    chips: [chip(`${pairs.length} pairs`), chip('runs in browser', 'green'), chip('© Arthur Bernier Jr', 'green'), chip('editorial', 'editorial')],
    meta: ['ported from the original browser demo'],
    body: `<div data-editorial="true">${introR.html}</div><div class="pairs">${blocks.join('\n')}</div>`,
    headings,
    wide: true,
    source: creatorCard({ verified: ctx.verification[page.url] || null }),
    description: 'Four classic problems solved naively and optimally with the same tests: same/goodSame, sumZero/goodSumZero, maxSubarraySum/goodMaxSubarraySum, search/goodSearch.',
  });
  return { html, search: { headings: headings.map((h) => h.text), text: 'naive vs optimal frequency counter multiple pointers sliding window binary search' }, facts: { pairs: pairs.length, pairNames: pairs.map((p) => `${p.naiveName}/${p.optimalName}`) }, runnable: { rel: 'algorithms/naive-vs-optimal.js', mode: 'worker', ok: 'algorithms/naive-vs-optimal.js', abs: path.join(S.PUBLIC, 'assets', 'src', 'algorithms', 'naive-vs-optimal.js') } };
}

async function renderDigitalMansion(ctx, page) {
  const abs = S.DIGITAL_MANSION;
  let md = U.read(abs);
  // The deck opens with a bold title line and an italic lede; the template renders the title.
  md = md.replace(/^\*\*System Design Primer[^\n]*\*\*\n+/, '');
  const r = await renderMarkdown(md, { stripFrontmatter: false, dropH1: false, resolveImage: imageResolver(path.dirname(abs), 'system-design', { mansion: true }) });
  const html = dropLeadParagraph(r.html, r.firstParagraph) + callout('note editorial', 'Go deeper', `<p>The same house, explained concept by concept: <a href="/mindset/knowing-what-you-are-talking-about/#build-twitter">"Build Twitter" in the imposter-syndrome guide</a>, then the <a href="/system-design/interview-framework/">45-minute framework</a>.</p>`);
  const h3Steps = r.headings.filter((h) => h.level === 3 && /^\d+\./.test(h.text));
  return {
    html: renderDoc(ctx, {
      page,
      eyebrow: `PRIMER · ${page.group}`,
      lede: escapeHtml(U.truncate(r.firstParagraph, 220)),
      chips: [chip('Article'), chip(`${h3Steps.length} steps`, 'yellow'), chip('© Arthur Bernier Jr', 'green')],
      meta: [`${r.words} words`],
      body: html,
      headings: r.headings,
      source: creatorCard({ verified: ctx.verification[page.url] || null }),
      description: r.firstParagraph,
    }),
    search: { headings: r.headings.map((h) => h.text), text: r.firstParagraph },
    facts: { h2s: r.headings.filter((h) => h.level === 2).map((h) => h.text), h3Steps: h3Steps.map((h) => h.text) },
  };
}

/** Arthur's own mindset articles (original lecture material, optionally refreshed via content/overrides/). */
async function renderOwnArticle(ctx, page, { sourceAbs, overrideRel, outSub, preprocess, afterHtml, original }) {
  const loaded = loadWithOverride(sourceAbs, overrideRel);
  let md = loaded.md;
  if (preprocess) md = preprocess(md);
  const fm = loaded.frontmatter || {};
  const isGrit = page.id === 'MIND-02';
  const connected = isGrit && ctx.path ? ctx.path.backlinks[page.id] || [] : [];
  const r = await renderMarkdown(md, {
    stripFrontmatter: false,
    dropH1: true,
    storyQuotes: isGrit,
    resolveImage: imageResolver(path.dirname(loaded.overridePath || sourceAbs), outSub),
    resolveLink(href) {
      if (/^\/teams\/week-26\/day-3\/?$/.test(href)) return '/mindset/knowing-what-you-are-talking-about/';
      if (/^\/polyglot\//.test(href)) { const m = href.match(/^\/polyglot\/([a-z]+)\/?([a-z-]+)?\/?$/); if (m) return m[2] ? `/languages/${m[1]}/${m[2]}/` : `/languages/${m[1]}/`; }
      if (/^\//.test(href)) {
        // Overrides link to pages on this site; anything else absolute is an old course-site path with no page here.
        const pathOnly = href.replace(/[#?].*$/, '');
        if (ctx.reg.pages.some((p) => p.url === pathOnly)) return href;
        if (loaded.override) console.warn(`warn: ${page.id} override links to ${href}, which is not a registry URL — link dropped`);
        return null;
      }
      if (/generalassemb\.ly/.test(href)) return null; // never link to the former course provider
      return href;
    },
  });
  // Any stray extra H1s become H2-less separators: drop them (the template owns the title).
  let html = r.html.replace(/<h1[^>]*>[\s\S]*?<\/h1>\n?/g, '');
  if (!fm.lede) html = dropLeadParagraph(html, r.firstParagraph);
  if (afterHtml) html += afterHtml(fm, loaded.override);
  // Neither the page markdown nor the 2021 original is published as a raw copy (see lang.js).
  const verified = ctx.verification[page.url] || (fm.verified ? { date: fm.verified, docs: fm.docs || [], exec: fm.exec, note: fm.verified_note } : null);
  return {
    html: renderDoc(ctx, {
      page,
      eyebrow: isGrit ? 'A MINDSET SIDE QUEST' : `ARTICLE · ${page.group}`,
      bodyClass: isGrit ? 'grit-story' : '',
      tree: page.id === 'MIND-01' ? guideTree(r.headings) : undefined,
      banner: isGrit ? `<aside class="sq-banner" aria-label="Part of the path"><details class="grit-path-links"><summary>Connected lessons · ${connected.length}</summary><ul>${connected.map((s) => `<li><a href="${escapeHtml(s.url)}#side-quests">${escapeHtml(s.id)} · ${escapeHtml(s.title)}</a></li>`).join('')}</ul></details><a class="pill ghost" href="/path/">Back to the path ${icon('arrow-left')}</a></aside>` : undefined,
      lede: escapeHtml(fm.lede || U.truncate(r.firstParagraph, 220)),
      chips: [chip(isGrit ? 'Isekai story' : 'Article'), chip('© Arthur Bernier Jr', 'green'), original ? chip('original', 'green') : loaded.override ? chip('refreshed · verified', 'green') : chip('2021 original', 'yellow')],
      meta: isGrit ? [`${r.words.toLocaleString('en-US')} words`, `${Math.ceil(r.words / 220)} min read`] : [`${r.words} words`, `${r.headings.filter((h) => h.level === 2).length} sections`],
      beforeBody: isGrit ? `<aside class="grit-quest" aria-label="Quest briefing"><p class="eyebrow">QUEST ACCEPTED · THE LONG RETURN</p><p class="grit-quest-line">Your level has stopped moving.<br>The story hasn't.</p><dl><div><dt>Class</dt><dd>Runewright</dd></div><div><dt>Trial</dt><dd>The plateau</dd></div><div><dt>Bring</dt><dd>A willingness to begin again</dd></div></dl></aside>` : '',
      body: html,
      headings: r.headings,
      source: creatorCard({ verified }),
      description: fm.lede || r.firstParagraph,
    }),
    search: { headings: r.headings.map((h) => h.text), text: fm.lede || r.firstParagraph },
    facts: { words: r.words, h2s: r.headings.filter((h) => h.level === 2).map((h) => h.text), h3s: r.headings.filter((h) => h.level === 3).map((h) => h.text), override: loaded.override },
  };
}

function changesNote(fm, override) {
  if (override && Array.isArray(fm.changes) && fm.changes.length) return callout('changes editorial', 'What changed', `<ul>${fm.changes.map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`);
  if (!override) return callout('editorial', 'Pending refresh', '<p>This page still shows the original cohort text; the verification pass will refresh tool and version names and list every change here.</p>');
  return '';
}

async function renderArticlePage(ctx, page) {
  if (page.id === 'ALG-05') return renderWhichPatternWhen(ctx, page);
  if (page.id === 'ALG-27') return renderNaiveVsOptimal(ctx, page);
  if (page.id === 'SYS-04') return renderDigitalMansion(ctx, page);
  if (page.id === 'MIND-01') return renderOwnArticle(ctx, page, {
    sourceAbs: S.IMPOSTER_GUIDE, overrideRel: path.join('mindset', 'knowing-what-you-are-talking-about.md'), outSub: 'mindset',
    sourceRel: 'mindset/knowing-what-you-are-talking-about.md',
    preprocess: (md) => md.replace(/<\/?center>/g, ''),
    afterHtml: changesNote,
  });
  if (page.id === 'MIND-02') return renderOwnArticle(ctx, page, {
    sourceAbs: path.join(S.OVERRIDES, 'mindset', 'grit.md'),
    overrideRel: path.join('mindset', 'grit.md'),
    outSub: 'mindset',
    original: true,
    afterHtml: () => '',
  });
  if (page.id.startsWith('ATELIER-') && page.id !== 'ATELIER-00') {
    const file = page.source.replace(/^content\/overrides\//, '');
    return renderOwnArticle(ctx, page, {
      sourceAbs: path.join(S.OVERRIDES, file),
      overrideRel: file,
      outSub: 'atelier',
      original: true,
      afterHtml: () => '',
    });
  }
  const m = page.source.match(/_scratchbox\/prep\/([^\s`()]+\.md)/);
  if (m) return renderPrepMarkdown(ctx, page, m[1]);
  throw new Error(`No article renderer for ${page.id} (${page.source})`);
}

module.exports = { renderArticlePage, parsePairs, runnableFromPairs };
