// Parses SITEMAP-AND-USER-STORIES.md into the page registry.
// The document is the contract: the build renders exactly these pages and the
// test gate compares public/ against them in both directions.
const fs = require('fs');
const S = require('./sources.config');

const SECTION_ORDER = ['Global', 'The Path', 'Algorithms', 'Data Structures', 'Practice', 'Languages', 'System Design', 'Design Patterns', 'Security', 'Mindset', 'Atelier', 'Explained'];
const SECTION_SLUG = {
  'Global': '', 'The Path': 'path', 'Algorithms': 'algorithms', 'Data Structures': 'data-structures', 'Practice': 'practice', 'Languages': 'languages',
  'System Design': 'system-design', 'Design Patterns': 'patterns', 'Security': 'security', 'Mindset': 'mindset', 'Atelier': 'atelier', 'Explained': 'explained',
};

function parseRegistry(file = S.REGISTRY) {
  const md = fs.readFileSync(file, 'utf8');
  const totalMatch = md.match(/\*\*Total pages: (\d+)\.\*\*/);
  const declaredTotal = totalMatch ? Number(totalMatch[1]) : null;

  const blocks = md.split(/^#### /m).slice(1);
  const pages = [];
  for (const raw of blocks) {
    const lines = raw.split('\n');
    const head = lines[0];
    const hm = head.match(/^([A-Z]+(?:-[A-Z0-9]+)+) · `([^`]+)` — (.+)$/);
    if (!hm) throw new Error('Registry: cannot parse block head: ' + head);
    const [, id, rawUrl, title] = hm;
    const url = rawUrl.replace(/ \(served for any unknown path\)$/, '');
    const metaLine = lines.find((l) => l.startsWith('- **Template:**')) || '';
    const get = (key) => {
      const m = metaLine.match(new RegExp('\\*\\*' + key + ':\\*\\* (?:`([^`]*)`|([^·]+?))(?: ·|$)'));
      return m ? (m[1] !== undefined ? m[1] : m[2]).trim() : null;
    };
    const template = get('Template');
    const section = get('Section');
    const group = get('Group');
    const source = get('Source');
    const license = get('License');
    const storyLine = lines.find((l) => l.startsWith('- **Story:**')) || '';
    const story = storyLine.replace('- **Story:** ', '').trim();
    const facts = [];
    const accept = [];
    let mode = null;
    for (const l of lines) {
      if (l.startsWith('- **Facts the build must reproduce:**')) { mode = 'facts'; continue; }
      if (l.startsWith('- **Acceptance:**')) { mode = 'accept'; continue; }
      if (/^  - /.test(l)) {
        const item = l.replace(/^  - (\[ \] )?/, '').trim();
        if (mode === 'facts') facts.push(item);
        else if (mode === 'accept') accept.push(item);
      } else if (l.trim() === '' || l.startsWith('#')) {
        if (mode && l.startsWith('#')) break;
      }
    }
    const page = { id, url, title: title.trim(), template, section, group, source, license, story, facts, accept };
    Object.assign(page, deriveFacts(page));
    pages.push(page);
  }

  // Order: the document's own order, which is section order then page order.
  pages.forEach((p, i) => { p.order = i; });

  const bySection = {};
  for (const p of pages) (bySection[p.section] = bySection[p.section] || []).push(p);
  for (const s of Object.keys(bySection)) {
    const list = bySection[s];
    list.forEach((p, i) => {
      p.prev = i > 0 ? list[i - 1] : null;
      p.next = i < list.length - 1 ? list[i + 1] : null;
    });
  }
  const groupsBySection = {};
  for (const s of SECTION_ORDER) {
    const list = bySection[s] || [];
    const groups = [];
    for (const p of list) {
      if (p.group === '—') continue;
      let g = groups.find((x) => x.name === p.group);
      if (!g) { g = { name: p.group, slug: slugify(p.group), pages: [] }; groups.push(g); }
      g.pages.push(p);
    }
    groupsBySection[s] = groups;
  }
  const byUrl = Object.fromEntries(pages.map((p) => [p.url, p]));
  const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
  const urls = pages.map((p) => p.url);
  const dup = urls.filter((u, i) => urls.indexOf(u) !== i);
  if (dup.length) throw new Error('Registry: duplicate urls ' + dup.join(', '));
  if (declaredTotal !== null && declaredTotal !== pages.length) {
    throw new Error(`Registry: declared total ${declaredTotal} but found ${pages.length} page blocks`);
  }
  return { pages, bySection, groupsBySection, byUrl, byId, total: pages.length, declaredTotal, SECTION_ORDER, SECTION_SLUG };
}

// Pull the machine-checkable facts out of the prose facts list.
function deriveFacts(page) {
  const out = {};
  for (const f of page.facts) {
    let m;
    if ((m = f.match(/^Header keys: (.+)$/))) out.headerKeys = m[1].split(' · ').map((s) => s.trim());
    if ((m = f.match(/^Sections \((\d+)\): (.+)$/))) {
      out.sectionCount = Number(m[1]);
      out.sectionTitles = m[2].split(' · ').map((s) => s.replace(/^\d+\. /, '').trim());
    }
    if (/^Sections: none/.test(f)) out.sectionCount = 0;
    if ((m = f.match(/^Run output: `ok: ([^`]+)`$/))) out.okLine = 'ok: ' + m[1];
    if ((m = f.match(/^Tests in test\.js: (\d+)$/))) out.testCount = Number(m[1]);
    if ((m = f.match(/^Alternate \(commented\) solutions: (\d+)$/))) out.alternateCount = Number(m[1]);
    if ((m = f.match(/^Helper files: (.+)$/))) out.helperFiles = m[1] === 'none' ? [] : m[1].split(', ').map((s) => s.trim());
    if ((m = f.match(/^Directions first line: "(.*)"$/))) out.directionsFirstLine = m[1];
    if ((m = f.match(/^(?:Source )?H2s \((\d+)\): (.+)$/))) { out.h2Count = Number(m[1]); out.h2s = m[2].split(' · ').map((s) => s.trim()); }
    if ((m = f.match(/^H2s: none/))) out.h2Count = 0;
    if ((m = f.match(/^CodeSandbox exercise links: (\d+)$/))) out.codesandboxCount = Number(m[1]);
    if ((m = f.match(/^Local images: (.+)$/))) out.images = m[1] === 'none' ? [] : m[1].split(', ').map((s) => s.trim());
    if ((m = f.match(/^Videos: (\d+)$/))) out.videoCount = Number(m[1]);
    if ((m = f.match(/^Pages in section: (\d+)$/))) out.sectionPageCount = Number(m[1]);
    if ((m = f.match(/^Framework: (.+)$/))) out.framework = m[1].trim();
    // The path (T-PATH / T-SESSION)
    if ((m = f.match(/^Weeks: (\d+) · Sessions: (\d+)$/))) { out.weeks = Number(m[1]); out.sessions = Number(m[2]); }
    if ((m = f.match(/^Diagrams: (\d+)$/))) out.diagramCount = Number(m[1]);
    if ((m = f.match(/^Side quests: (\d+)$/))) out.sideQuestCount = Number(m[1]);
    if ((m = f.match(/^Live stages: (\d+)$/))) out.liveCount = Number(m[1]);
    if ((m = f.match(/^Terminals: (\d+)$/))) out.termCount = Number(m[1]);
    if ((m = f.match(/^Words: ≥ ?(\d+)$/))) out.minWords = Number(m[1]);
    if ((m = f.match(/^Session: ([\d.]+) · Week (\d+) · Unit (\d+)$/))) out.session = { id: m[1], week: Number(m[2]), unit: Number(m[3]) };
    if (/SOURCE IS A 79-WORD STUB/.test(f)) out.editorialNewPage = true;
  }
  return out;
}

// Group segment redirects: /algorithms/sorting/ → /algorithms/#sorting
function groupRedirects(reg) {
  const red = {};
  for (const p of reg.pages) {
    const parts = p.url.split('/').filter(Boolean);
    if (parts.length >= 3) {
      const seg = '/' + parts.slice(0, 2).join('/') + '/';
      const landing = '/' + parts[0] + '/';
      if (!reg.byUrl[seg] && reg.byUrl[landing]) {
        red[seg] = landing + '#' + slugify(p.group);
      }
    }
  }
  return red;
}

function slugify(s) {
  return String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

module.exports = { parseRegistry, groupRedirects, slugify, SECTION_ORDER, SECTION_SLUG };

if (require.main === module) {
  const reg = parseRegistry();
  console.log('pages', reg.total, 'declared', reg.declaredTotal);
  for (const s of SECTION_ORDER) console.log(' ', s, (reg.bySection[s] || []).length, 'groups:', reg.groupsBySection[s].map((g) => `${g.name}(${g.pages.length})`).join(' '));
  console.log('redirects', Object.keys(groupRedirects(reg)).length);
  const sample = reg.byId['ALG-21'];
  console.log(JSON.stringify({ ...sample, prev: sample.prev && sample.prev.id, next: sample.next && sample.next.id, facts: undefined, accept: undefined }, null, 1));
}
