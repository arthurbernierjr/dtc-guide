// Home, credits, search and 404 pages.
const path = require('path');
const S = require('../sources.config');
const U = require('../util');
const site = require('../site.config');
const { parseFrontmatter, renderMarkdown } = require('../parsers/markdown');
const { renderHome } = require('../render/home');
const { renderCredits, renderSearch, render404 } = require('../render/landing');
const { parsePairs } = require('./article');
const { highlightToLines, escapeHtml } = require('../highlight');
const { LANGS } = require('../parsers/polyglot');

const PATTERN_FILE = [
  [/binary search on the answer/i, 'binary-search'],
  [/binary search/i, 'binary-search'],
  [/two pointers/i, 'two-pointers'],
  [/sliding window|monotonic deque/i, 'sliding-window'],
  [/prefix sum \+ hash map|Map insertion order|LRU/i, 'hash-maps'],
  [/heap/i, 'heaps'],
  [/monotonic stack|^stack$/i, 'stacks-queues'],
  [/BFS\/DFS with directions|multi-source BFS/i, 'matrices'],
  [/BFS|Dijkstra|Bellman|union-find|topological/i, 'graphs'],
  [/backtracking/i, 'backtracking'],
  [/dynamic programming/i, 'dynamic-programming'],
  [/greedy|sort by start|sort by end/i, 'intervals'],
  [/trie/i, 'tries'],
  [/fast & slow/i, 'linked-lists'],
  [/cyclic sort|Floyd cycle on indices|Boyer-Moore/i, 'arrays'],
  [/bit manipulation|bitmask/i, 'bit-manipulation'],
  [/KMP|hashing/i, 'strings'],
  [/stack/i, 'stacks-queues'],
];

function patternRows(ctx) {
  const md = U.read(path.join(S.PREP, 'algorithms', 'README.md'));
  const sec = md.match(/^## Which pattern when[^\n]*\n([\s\S]*?)(?=^## |(?![\s\S]))/m)[1];
  const rows = Array.from(sec.matchAll(/^\| (.+?) \| (.+?) \|$/gm)).map((m) => ({ tell: m[1].trim(), pattern: m[2].trim() })).filter((r) => r.tell !== 'Problem TELL' && !/^-+$/.test(r.tell));
  for (const r of rows) {
    const hit = PATTERN_FILE.find(([re]) => re.test(r.pattern));
    const file = hit ? hit[1] : null;
    const page = file ? ctx.reg.pages.find((p) => p.source.endsWith(`/algorithms/${file}.js`)) : null;
    r.file = page ? `${file}.js` : 'table';
    r.href = page ? page.url : '/algorithms/analysis/which-pattern-when/';
  }
  return rows;
}

async function renderHomePage(ctx, page) {
  const fm = parseFrontmatter(U.read(path.join(S.CONTENT, 'home.md'))).data;
  const reg = ctx.reg;
  const exercises = reg.pages.filter((p) => p.template === 'T-EXERCISE').length;
  const languages = LANGS.length;
  const patterns = (reg.bySection['Design Patterns'] || []).filter((p) => p.template !== 'T-LANDING').length;
  const stats = [
    { label: 'pages', value: reg.total },
    { label: 'sessions', value: ctx.path.sessions.length },
    { label: 'exercises', value: exercises },
    { label: 'languages', value: languages },
    { label: 'patterns', value: patterns },
  ];
  const rows = patternRows(ctx);
  const { pairs } = parsePairs(U.read(path.join(S.CONTENT, 'algorithms', 'naive-vs-optimal.md')));
  const p0 = pairs[0];
  const pair = {
    promptShort: p0.prompt,
    naive: { title: p0.naiveName, code: p0.naive, html: await highlightToLines(p0.naive + '\n', 'js'), cx: p0.naiveCx },
    optimal: { title: p0.optimalName, code: p0.optimal, html: await highlightToLines(p0.optimal + '\n', 'js'), cx: p0.optimalCx },
    why: p0.why,
  };
  const html = renderHome(ctx, { page, description: fm.description, stats, patternRows: rows, pair, quote: { text: fm.quote, cite: fm.quote_cite, href: fm.quote_href } });
  return { html, search: { headings: ['The path', 'Side quests', 'Which pattern when', 'Naive vs Optimal', 'Languages'], text: fm.description }, facts: { stats: Object.fromEntries(stats.map((s) => [s.label, s.value])), patternRows: rows.length, tiles: 13, routeCells: ctx.path.weeks.length, written: ctx.path.written.length } };
}

async function renderCreditsPage(ctx, page) {
  const { data, body } = parseFrontmatter(U.read(path.join(S.CONTENT, 'credits.md')));
  const [introMd, statementMd] = body.split(/^## Non-commercial statement\s*$/m);
  const intro = (await renderMarkdown(introMd, { stripFrontmatter: false, dropH1: false })).html;
  const statement = (await renderMarkdown(statementMd, { stripFrontmatter: false, dropH1: false })).html;
  const holtPages = ctx.reg.pages.filter((p) => p.template === 'T-LESSON').length;
  const prepPages = ctx.reg.pages.filter((p) => p.template === 'T-PREP').length;
  const ownPages = ctx.reg.pages.filter((p) => p.template !== 'T-LESSON' && p.template !== 'T-EXERCISE').length;
  const sources = [
    {
      title: 'Complete Intro to Computer Science', author: 'Brian Holt (Frontend Masters)', repo: 'https://github.com/btholt/complete-intro-to-computer-science',
      license: [{ name: 'CC BY-NC 4.0 (content)', href: '/licenses/cc-by-nc-4.0.txt' }, { name: 'Apache-2.0 (code)', href: '/licenses/apache-2.0.txt' }],
      used: `${holtPages} lessons: Big O, spatial complexity, trade-offs, the sorts, binary search, recursion, lists, Bloom filters, trees, traversals, graphs, pathfinding; their images, GIFs and the AVL/radix/linked-list videos.`,
      changed: 'Modified: re-laid out in this site\'s templates, media served locally, author photos / Frontend Masters logo / course housekeeping removed, CodeSandbox badges turned into link rows. The intro, exercises and wrap-up pages are not reproduced.',
      chip: 'modified', chipVariant: 'yellow',
    },
    {
      title: 'AlgoCasts exercises', author: 'Stephen Grider, via the arthurbernierjr fork', repo: S.ALGOCASTS_REPO, sha: S.ALGOCASTS_SHA,
      license: [{ name: 'GPL-3.0', href: '/licenses/gpl-3.0.txt' }],
      used: '26 exercises: directions, examples, stubs, tests, completed solutions and every commented-out alternate solution.',
      changed: 'Nothing. Files are reproduced verbatim from the pinned commit; alternates only have their leading comment markers removed for display. The `events` exercise is skipped (no solution in the repo).',
      chip: 'verbatim', chipVariant: 'green',
    },
    {
      // Everything that is not Holt or AlgoCasts is Arthur's: one entry, who he is, where to find him.
      title: 'Everything else — original material by the creator', author: S.AUTHOR_LINE, repo: null,
      site: site.links.home, bio: site.authorBio,
      license: [{ name: 'All rights reserved', href: null }],
      used: `The other ${ownPages} pages: ${prepPages} runnable JavaScript sheets (algorithms, JavaScript, design patterns, OWASP, post-mortems, project skeletons) and the reference sheets (complexity cheat-sheet, system design playbook, concepts, walkthroughs, web-vulnerability quick reference); the nine-language polyglot track, the four frontend walkthroughs and the React cheatsheet; the system design primer; the mindset articles; the naive/optimal pairs; every section intro, diagram and verification note — and the site itself.`,
      changed: 'Language and frontend pages were rewritten and re-verified against current official docs in 2026 (each page lists what changed). Everything else is published as written; dead hosted images were replaced by diagrams made for this site, and the naive/optimal demo was ported from the DOM to asserts so it runs in the browser worker.',
      chip: 'original', chipVariant: 'green',
    },
    {
      title: 'MiniSearch (client-side search)', author: 'Luca Ongaro', repo: 'https://github.com/lucaong/minisearch',
      license: [{ name: 'MIT', href: '/licenses/mit.txt' }],
      used: 'The in-browser full-text index behind ⌘K search (vendored UMD build).',
      changed: 'Unmodified.',
      chip: 'verbatim', chipVariant: 'green',
    },
  ];
  const fonts = [
    { name: 'Clash Display', license: 'Fontshare / Indian Type Foundry Free Font License', href: 'https://www.fontshare.com/licenses/itf-ffl', note: 'self-hosted woff2' },
    { name: 'DM Sans', license: 'SIL Open Font License 1.1', href: 'https://openfontlicense.org/', note: 'self-hosted' },
    { name: 'JetBrains Mono', license: 'SIL Open Font License 1.1', href: 'https://openfontlicense.org/', note: 'self-hosted' },
    { name: 'Fraunces (italic, variable)', license: 'SIL Open Font License 1.1', href: 'https://openfontlicense.org/', note: 'self-hosted; the struck word in the name' },
  ];
  const html = renderCredits(ctx, { page, intro, sources, fonts, statement, description: U.stripTags(intro).slice(0, 160) });
  return { html, search: { headings: sources.map((s) => s.title), text: U.stripTags(intro) }, facts: { sources: sources.length } };
}

async function renderSearchPage(ctx, page) {
  const html = renderSearch(ctx, { page, description: `Search all ${ctx.total} pages of ${site.name}: the path and the library.` });
  return { html, search: { headings: [], text: 'search' }, facts: {} };
}

async function render404Page(ctx, page) {
  const { body } = parseFrontmatter(U.read(path.join(S.CONTENT, '404.md')));
  const intro = (await renderMarkdown(body, { stripFrontmatter: false, dropH1: false })).html;
  const html = render404(ctx, { page, intro, description: `That page is not in the guide. Search all ${ctx.total} pages, start the path, or pick a library track.` });
  // G13: every registry page is present in the search index, including this one.
  return { html, search: { headings: [], text: 'page not found 404 missing moved' }, facts: {} };
}

module.exports = { renderHomePage, renderCreditsPage, renderSearchPage, render404Page, patternRows };
