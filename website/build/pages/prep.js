// T-PREP: _scratchbox/prep reference files (header block + numbered sections + asserts + `ok:` line).
const path = require('path');
const S = require('../sources.config');
const U = require('../util');
const { parsePrepFile } = require('../parsers/prepfile');
const { prepSource } = require('../parsers/prepsource');
const { renderMarkdown } = require('../parsers/markdown');
const { highlightToLines, escapeHtml } = require('../highlight');
const { renderDoc, creatorCard, glanceCard } = require('../render/doc');
const { chip, icon, codePanel, badgeComplexity } = require('../render/components');

function prepRelFromSource(source) {
  const m = source.match(/_scratchbox\/prep\/([^\s`]+\.js)/);
  return m ? m[1] : null;
}

/** Split a section's lines into code and assert statements (multi-line aware). */
function splitAsserts(lines) {
  const code = [];
  const asserts = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (/^\s*(?:await\s+)?assert\b/.test(l)) {
      let depth = 0;
      let j = i;
      do {
        const s = lines[j].replace(/\/\/.*$/, '').replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g, '');
        for (const ch of s) { if (ch === '(' || ch === '[' || ch === '{') depth++; else if (ch === ')' || ch === ']' || ch === '}') depth--; }
        asserts.push(lines[j]);
        j++;
      } while (depth > 0 && j < lines.length);
      i = j;
      continue;
    }
    code.push(l);
    i++;
  }
  // trim blank runs in code
  const out = [];
  for (const l of code) { if (l.trim() === '' && out.length && out[out.length - 1].trim() === '') continue; out.push(l); }
  while (out.length && out[0].trim() === '') out.shift();
  while (out.length && out[out.length - 1].trim() === '') out.pop();
  return { code: out, asserts };
}

/** Teaching prose for a prep sheet lives in content/lessons/<page id>.md. The sheet's own code stays the demonstration. */
async function loadLesson(page) {
  const md = U.readIf(path.join(S.CONTENT, 'lessons', `${page.id}.md`));
  if (!md || !md.trim()) return null;
  return renderMarkdown(md, { idPrefix: 'lesson-' });
}

const DOCS_FOR = {
  algorithms: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://nodejs.org/docs/latest/api/'],
  javascript: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://nodejs.org/docs/latest/api/'],
  'post-mortems': ['https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://nodejs.org/docs/latest/api/'],
  owasp: ['https://owasp.org/Top10/', 'https://nodejs.org/docs/latest/api/crypto.html', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers'],
  'system-design': ['https://nodejs.org/docs/latest/api/', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://react.dev/'],
};

async function renderPrepPage(ctx, page) {
  const rel = prepRelFromSource(page.source);
  const { abs } = prepSource(rel);
  const f = parsePrepFile(abs, rel);
  const rawUrl = `/assets/src/prep/${rel}`;
  U.copy(abs, path.join(S.PUBLIC, 'assets', 'src', 'prep', rel));

  const headings = [];
  const blocks = [];
  let assertTotal = 0;
  for (const s of f.sections) {
    const id = `s-${s.index}`;
    const title = s.number !== null && s.number !== undefined ? `${s.number}. ${s.title}` : s.title;
    headings.push({ level: 2, text: title, id });
    const { code, asserts } = splitAsserts(s.code);
    assertTotal += asserts.length;
    const codeText = code.join('\n');
    const html = await highlightToLines(codeText + '\n', 'js');
    let foot = '';
    if (asserts.length) {
      const ah = await highlightToLines(asserts.join('\n') + '\n', 'js');
      const n = asserts.filter((l) => /^\s*(?:await\s+)?assert\b/.test(l)).length;
      foot = `<div class="block-foot"><details><summary>${icon('chevron')}Verified by ${n} assert${n === 1 ? '' : 's'}</summary>${codePanel({ lang: 'js', html: ah, code: asserts.join('\n'), readonly: true })}</details></div>`;
    }
    const cx = s.complexity ? `<span class="block-cx">${badgeComplexity(s.complexity)}</span>` : '';
    blocks.push(`<section class="block" id="${id}" data-section="${s.index}">
  <header class="block-head"><span class="block-num">${escapeHtml(String(s.number ?? s.index)).padStart(2, '0')}</span><div><h2 class="block-title" id="${id}-h">${escapeHtml(s.title)}<a class="h-anchor" href="#${id}" aria-label="Link to this section">#</a></h2>${s.idea ? `<p class="block-idea">${badgeComplexity(s.idea)}</p>` : ''}</div>${cx}</header>
  ${codeText.trim() ? codePanel({ lang: 'js', html, code: codeText }) : ''}
  ${foot}
</section>`);
  }

  // Run panel: the whole file runs; the panel shows the preamble (setup) so there is something to look at.
  const preamble = f.preamble || "'use strict';";
  const preHtml = await highlightToLines(preamble + '\n', 'js');
  const run = { src: rawUrl, ok: f.ok ? `ok: ${f.ok}` : '', mode: f.runMode, reason: f.runReason };
  const runPanel = `<div class="preamble">${codePanel({ lang: 'js', html: preHtml, code: preamble, title: `${rel} · setup`, run })}</div>`;

  const lesson = await loadLesson(page);
  let lessonHtml = '';
  if (lesson) {
    headings.unshift(...lesson.headings);
    lessonHtml = `<div class="lesson" id="lesson">${lesson.html}<p class="lesson-bridge">Everything below is the demonstration. Same idea, written as code you can run.</p></div>`;
  }

  const glance = glanceCard(f.keys);
  const chips = [chip(`${f.sections.length} section${f.sections.length === 1 ? '' : 's'}`), f.runMode === 'worker' ? chip('runs in browser', 'green') : chip('node only', 'yellow')];
  if (lesson) chips.unshift(chip('lesson', 'green'));
  if (f.tag) chips.push(chip(f.tag, 'editorial'));
  const meta = [`${assertTotal} asserts`, `${f.lineCount} lines`];

  const verified = ctx.verification[page.url];
  // Original material: the Creator card (who wrote it + bigpoppacode.io), no repo paths. The raw
  // file stays under /assets/src/ for the Run button and the copy-node command.
  const source = creatorCard({
    verified: verified ? { date: verified.date, docs: verified.docs, exec: verified.exec, note: verified.note } : null,
  });

  const whatKey = f.keys.find((k) => /^(WHAT|INTENT|POST-MORTEM)$/.test(k.key));
  const lede = whatKey ? U.truncate(whatKey.value, 220) : '';
  const body = lessonHtml + runPanel + blocks.join('\n');
  const railActions = `<a href="${rawUrl}" download>${icon('file')}Download ${path.basename(rel)}</a><a href="#source">${icon('info')}Creator &amp; license</a>`;

  const html = renderDoc(ctx, {
    page,
    eyebrow: `${lesson ? 'GUIDE' : 'REFERENCE SHEET'} · ${page.group}`,
    lede: escapeHtml(lede),
    chips,
    meta,
    glance,
    body,
    headings,
    source,
    railActions,
    description: lede || `${page.title}: ${f.sections.length} worked sections with asserts.`,
  });

  const sayKey = f.keys.find((k) => k.key === 'SAY');
  return {
    html,
    search: { headings: headings.map((h) => h.text), say: sayKey ? sayKey.value : '', text: lede },
    facts: { headerKeys: f.keys.map((k) => k.key), sectionCount: f.sections.length, sectionTitles: f.sections.map((s) => s.title), okLine: f.ok ? `ok: ${f.ok}` : null, runMode: f.runMode, lesson: !!lesson },
    runnable: { rel, mode: f.runMode, ok: f.ok, abs },
    codeBlocks: lesson ? lesson.codeBlocks : [],
  };
}

module.exports = { renderPrepPage, prepRelFromSource, splitAsserts };
