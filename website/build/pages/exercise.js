// T-EXERCISE: AlgoCasts exercises (GPL-3.0, verbatim from the pinned fork).
const path = require('path');
const S = require('../sources.config');
const U = require('../util');
const { parseExercise } = require('../parsers/algocasts');
const { highlightToLines, escapeHtml } = require('../highlight');
const { renderDoc, sourceCard } = require('../render/doc');
const { chip, icon, codePanel } = require('../render/components');

function exerciseNameFromSource(source) {
  const m = source.match(/exercises\/([a-z0-9]+)\//);
  return m ? m[1] : null;
}

async function renderExercisePage(ctx, page) {
  const name = exerciseNameFromSource(page.source);
  const ex = parseExercise(name);
  const base = `/assets/src/algocasts/${name}`;
  U.copy(path.join(S.ALGOCASTS, 'exercises', name, 'index.js'), path.join(S.PUBLIC, 'assets', 'src', 'algocasts', name, 'index.js'));
  U.copy(path.join(S.ALGOCASTS, 'exercises', name, 'test.js'), path.join(S.PUBLIC, 'assets', 'src', 'algocasts', name, 'test.js'));
  U.copy(path.join(S.ALGOCASTS, 'completed_exercises', name, 'index.js'), path.join(S.PUBLIC, 'assets', 'src', 'algocasts', name, 'solution.js'));
  for (const h of ex.helpers) U.copy(path.join(S.ALGOCASTS, 'exercises', name, h.name), path.join(S.PUBLIC, 'assets', 'src', 'algocasts', name, h.name));

  const headings = [
    { level: 2, text: 'Directions', id: 'directions' },
  ];
  if (ex.examples.length) headings.push({ level: 2, text: 'Examples', id: 'examples' });
  headings.push({ level: 2, text: 'Try it first', id: 'try-it' });
  headings.push({ level: 2, text: 'Solution', id: 'solution' });

  // Directions are a comment block with hard wraps; reflow into paragraphs (blank line = paragraph break).
  const paras = [];
  let cur = [];
  for (const line of ex.directions) {
    if (!line.trim()) { if (cur.length) paras.push(cur.join(' ')); cur = []; } else cur.push(line.trim());
  }
  if (cur.length) paras.push(cur.join(' '));
  const directionsText = paras.join(' ');
  const directions = `<section id="directions"><h2 class="sr-only">Directions</h2><div class="directions"><span class="callout-label">Directions</span>${paras.map((p) => `<p>${escapeHtml(p).replace(/\s{2,}/g, ' ')}</p>`).join('')}</div></section>`;
  let examples = '';
  if (ex.examples.length) {
    const exHtml = await highlightToLines(ex.examples.join('\n') + '\n', 'js');
    examples = `<section id="examples"><h2>Examples<a class="h-anchor" href="#examples" aria-label="Link to this section">#</a></h2>${codePanel({ lang: 'js', html: exHtml, code: ex.examples.join('\n'), readonly: true })}</section>`;
  }
  const stubHtml = await highlightToLines(ex.stub + '\n', 'js');
  const stub = codePanel({ lang: 'js', html: stubHtml, code: ex.stub, title: `exercises/${name}/index.js` });

  const tabs = [];
  tabs.push({ label: 'Solution', lang: 'js', code: ex.solution, html: await highlightToLines(ex.solution + '\n', 'js') });
  for (let i = 0; i < ex.alternates.length; i++) {
    tabs.push({ label: ex.alternates.length > 1 ? `Alternate ${i + 1}` : 'Alternate', lang: 'js', code: ex.alternates[i], html: await highlightToLines(ex.alternates[i] + '\n', 'js') });
  }
  tabs.push({ label: 'Tests', lang: 'js', code: ex.testSrc, html: await highlightToLines(ex.testSrc + '\n', 'js') });
  for (const h of ex.helpers) tabs.push({ label: h.name, lang: 'js', code: h.code, html: await highlightToLines(h.code + '\n', 'js') });

  const gate = `<section class="gate" id="try-it" data-gate="${escapeHtml(page.url)}">
  <h2>Try it first<a class="h-anchor" href="#try-it" aria-label="Link to this section">#</a></h2>
  <p>Copy the stub, make the ${ex.tests} test${ex.tests === 1 ? '' : 's'} pass on your machine, then open the solution. The reveal is remembered per page in this browser.</p>
  ${stub}
  <div class="gate-actions"><button class="pill primary" type="button" data-reveal>${icon('check', 'pill-icon')}I tried it — show the solution</button><button class="skip" type="button" data-reveal>Just show me</button></div>
</section>
<section class="solution is-hidden" id="solution">
  <h2>Solution<a class="h-anchor" href="#solution" aria-label="Link to this section">#</a><button class="hide-again" type="button" data-hide>hide again</button></h2>
  ${codePanel({ tabs, title: `completed_exercises/${name}/index.js` })}
  <p class="code-note">${icon('info')} Verbatim from the repo at <code>${S.ALGOCASTS_SHA.slice(0, 8)}</code>. Alternate tabs are the commented-out solutions with the leading <code>// </code> removed and nothing else changed. Run the tests locally with <code>npx jest ${name}</code> inside the fork.</p>
</section>`;

  const chips = [chip(`${ex.tests} test${ex.tests === 1 ? '' : 's'}`), chip(page.group), `<a href="/licenses/gpl-3.0.txt">${chip('GPL-3.0', 'outline-red')}</a>`];
  if (ex.alternates.length) chips.push(chip(`${ex.alternates.length} alternate${ex.alternates.length === 1 ? '' : 's'}`, 'yellow'));
  const meta = [`exercise ${page.id.replace('PRAC-', '')} of 26`];

  const verified = ctx.verification[page.url];
  const source = sourceCard({
    attribution: `From Stephen Grider's AlgoCasts course exercises, via the <a href="${S.ALGOCASTS_REPO}" target="_blank" rel="noopener">arthurbernierjr/AlgoCasts</a> fork at <code>${S.ALGOCASTS_SHA.slice(0, 8)}</code>, reproduced verbatim under the <a href="/licenses/gpl-3.0.txt">GNU GPL-3.0</a>.`,
    from: [
      { label: `exercises/${name}/index.js`, href: ex.links.exercise },
      { label: `exercises/${name}/test.js`, href: ex.links.tests },
      { label: `completed_exercises/${name}/index.js`, href: ex.links.solution },
    ],
    license: 'GPL-3.0',
    licenseNote: 'verbatim',
    status: `verbatim · SHA ${S.ALGOCASTS_SHA}`,
    verified: verified ? { date: verified.date, docs: verified.docs, exec: verified.exec, note: verified.note } : null,
    raw: `${base}/solution.js`,
  });

  // Lede = whole sentences from the directions, up to ~180 chars.
  const sentences = directionsText.replace(/\s{2,}/g, ' ').match(/[^.!?]+[.!?]+(\s|$)/g) || [directionsText];
  let ledeText = '';
  for (const s of sentences) { if ((ledeText + s).length > 180 && ledeText) break; ledeText += s; }
  const lede = escapeHtml(ledeText.trim() || directionsText);
  const html = renderDoc(ctx, {
    page,
    eyebrow: `EXERCISE · ${page.group}`,
    lede,
    chips,
    meta,
    body: directions + examples + gate,
    headings,
    source,
    description: ex.directions.join(' '),
  });

  return {
    html,
    search: { headings: headings.map((h) => h.text), text: ex.directions.join(' ') },
    facts: { directionsFirstLine: ex.directions[0], testCount: ex.tests, alternateCount: ex.alternates.length, helperFiles: ex.helpers.map((h) => h.name) },
  };
}

module.exports = { renderExercisePage, exerciseNameFromSource };
