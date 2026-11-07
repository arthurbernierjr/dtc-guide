// Parses one AlgoCasts exercise: exercises/<n>/index.js (directions + examples + stub),
// exercises/<n>/test.js, completed_exercises/<n>/index.js (solution + commented alternates), helper files.
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');

function readIf(p) { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') : null; }

function parseDirections(indexSrc) {
  const lines = indexSrc.split('\n');
  const directions = [];
  const examples = [];
  let mode = null;
  let i = 0;
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (!l.startsWith('//') && l.trim() !== '') break;
    if (/^\/\/ --- (Directions|Description)/.test(l)) { mode = 'd'; continue; }
    if (/^\/\/ --- Examples?/.test(l)) { mode = 'e'; continue; }
    const text = l.replace(/^\/\/ ?/, '');
    if (mode === 'd') directions.push(text);
    else if (mode === 'e') examples.push(text);
  }
  const stub = lines.slice(i).join('\n').trim();
  // trim trailing/leading empties
  const trim = (arr) => { while (arr.length && arr[0].trim() === '') arr.shift(); while (arr.length && arr[arr.length - 1].trim() === '') arr.pop(); return arr; };
  return { directions: trim(directions), examples: trim(examples).map((e) => e.replace(/^  /, '')), stub };
}

// The completed file = header comment + active solution + zero or more fully-commented alternate solutions.
function splitSolution(src) {
  const lines = src.split('\n');
  // The directions header ends at the first blank line.
  let i = 0;
  while (i < lines.length && lines[i].trim() !== '') i++;
  const body = lines.slice(i);
  // Runs of comment lines (blank lines allowed inside a run) delimited by code lines.
  const runs = []; // {kind:'code'|'comment', lines:[]}
  let cur = null;
  for (const l of body) {
    const isComment = /^\s*\/\//.test(l);
    const isBlank = l.trim() === '';
    if (isBlank) { if (cur) cur.lines.push(l); continue; }
    const kind = isComment ? 'comment' : 'code';
    if (!cur || cur.kind !== kind) { cur = { kind, lines: [] }; runs.push(cur); }
    cur.lines.push(l);
  }
  const active = [];
  const alternates = [];
  const DECL = /^(function|class)\b/;
  for (const r of runs) {
    if (r.kind === 'code') { active.push(...r.lines); continue; }
    const unc = r.lines.map((l) => l.replace(/^(\s*)\/\/ ?/, '$1'));
    const declares = unc.some((l) => DECL.test(l.trim()));
    if (!declares) { active.push(...r.lines); continue; }
    // Split the run into alternates: a new one starts at a top-level function/class declaration.
    let depth = 0; let alt = null;
    for (const l of unc) {
      const t = l.trim();
      if (depth === 0 && DECL.test(t)) { alt = []; alternates.push(alt); }
      if (alt) alt.push(l);
      for (const ch of t) { if (ch === '{') depth++; else if (ch === '}') depth = Math.max(0, depth - 1); }
    }
  }
  const tidy = (arr) => { const a = [...arr]; while (a.length && a[0].trim() === '') a.shift(); while (a.length && a[a.length - 1].trim() === '') a.pop(); return a.join('\n'); };
  return { active: tidy(active), alternates: alternates.map(tidy).filter(Boolean) };
}

function countTests(testSrc) {
  return (testSrc.match(/^\s*(?:test|it)\(/gm) || []).length;
}

function parseExercise(name) {
  const exDir = path.join(S.ALGOCASTS, 'exercises', name);
  const compDir = path.join(S.ALGOCASTS, 'completed_exercises', name);
  const indexSrc = readIf(path.join(exDir, 'index.js'));
  const testSrc = readIf(path.join(exDir, 'test.js'));
  const compSrc = readIf(path.join(compDir, 'index.js'));
  if (!indexSrc || !testSrc || !compSrc) throw new Error(`AlgoCasts ${name}: missing files`);
  const { directions, examples, stub } = parseDirections(indexSrc);
  const { active, alternates } = splitSolution(compSrc);
  const helpers = fs.readdirSync(exDir).filter((f) => !['index.js', 'test.js'].includes(f)).map((f) => ({ name: f, code: readIf(path.join(exDir, f)) }));
  const base = `${S.ALGOCASTS_REPO}/blob/${S.ALGOCASTS_SHA}`;
  return {
    name,
    directions,
    examples,
    stub,
    tests: countTests(testSrc),
    testSrc,
    solution: active,
    solutionFull: compSrc,
    alternates,
    helpers,
    links: {
      exercise: `${base}/exercises/${name}/index.js`,
      tests: `${base}/exercises/${name}/test.js`,
      solution: `${base}/completed_exercises/${name}/index.js`,
    },
  };
}

module.exports = { parseExercise };

if (require.main === module) {
  const n = process.argv[2] || 'reversestring';
  const r = parseExercise(n);
  console.log('directions:', r.directions.join(' / '));
  console.log('examples:', r.examples);
  console.log('tests', r.tests, 'alternates', r.alternates.length, 'helpers', r.helpers.map((h) => h.name));
  console.log('--- solution ---\n' + r.solution);
  r.alternates.forEach((a, i) => console.log(`--- alt ${i + 1} ---\n` + a));
}
