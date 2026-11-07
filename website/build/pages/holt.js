// T-LESSON: Brian Holt's Complete Intro to Computer Science lessons (CC BY-NC 4.0, modified).
const path = require('path');
const { execFileSync } = require('child_process');
const S = require('../sources.config');
const U = require('../util');
const { renderMarkdown } = require('../parsers/markdown');
const { renderDoc, sourceCard } = require('../render/doc');
const { chip, icon } = require('../render/components');

const HOLT_REPO = 'https://github.com/btholt/complete-intro-to-computer-science';
const HOLT_SITE = 'https://btholt.github.io/complete-intro-to-computer-science';
const DROP_IMAGES = /(brian(-beer)?\.jpg|lunasit\.jpg|FrontendMastersLogo\.png|logo\.svg|codesandbox\.png|author\.jpg)$/i;

function holtSlugFromSource(source) {
  const m = source.match(/lessons\/([a-z0-9-]+)\.md/);
  return m ? m[1] : null;
}

/** Map Holt's internal lesson links (/binary-search/) to our registry pages. */
function buildHoltLinkMap(reg) {
  const map = {};
  for (const p of reg.pages) {
    const slug = p.template === 'T-LESSON' ? holtSlugFromSource(p.source) : null;
    if (slug) map[slug] = p.url;
  }
  return map;
}

function posterFor(webmAbs, jpgAbs) {
  if (U.exists(jpgAbs)) return true;
  try {
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', '0.5', '-i', webmAbs, '-frames:v', '1', '-q:v', '4', jpgAbs], { stdio: 'ignore' });
    return U.exists(jpgAbs);
  } catch (e) {
    return false;
  }
}

async function renderHoltPage(ctx, page) {
  const slug = holtSlugFromSource(page.source);
  const srcAbs = path.join(S.HOLT_LESSONS, slug + '.md');
  const md = U.read(srcAbs);
  const outDir = path.join(S.PUBLIC, 'assets', 'content', 'holt');
  const linkMap = ctx.holtLinks || (ctx.holtLinks = buildHoltLinkMap(ctx.reg));
  const copied = [];

  const r = await renderMarkdown(md, {
    resolveImage(href, alt) {
      const file = href.replace(/^\.\//, '').replace(/^images\//, '');
      if (DROP_IMAGES.test(file)) return null;
      if (/^https?:/.test(href)) return null;
      const abs = path.join(S.HOLT_LESSONS, 'images', file);
      if (!U.exists(abs)) return null;
      U.copy(abs, path.join(outDir, file));
      copied.push(file);
      return { src: `/assets/content/holt/${file}`, alt };
    },
    resolveVideo(file) {
      const abs = path.join(S.HOLT_STATIC, file);
      if (U.exists(abs)) {
        U.copy(abs, path.join(outDir, file));
        posterFor(abs, path.join(outDir, file.replace(/\.webm$/, '.jpg')));
        copied.push(file);
      }
      return `/assets/content/holt/${file}`;
    },
    resolveLink(href) {
      const m = href.match(/^\/?([a-z0-9-]+)\/?$/);
      if (m && linkMap[m[1]]) return linkMap[m[1]];
      if (/^\.\.?\//.test(href) || /^\//.test(href)) {
        const mm = href.match(/([a-z0-9-]+)\/?$/);
        if (mm && linkMap[mm[1]]) return linkMap[mm[1]];
        return null;
      }
      return href;
    },
  });

  // Personal asides: drop paragraphs that are about Brian personally (photos already dropped).
  let html = r.html.replace(/<p>\s*<\/p>/g, '');
  const csCount = (html.match(/class="cs-link"/g) || []).length;
  const videoCount = (html.match(/<video/g) || []).length;
  const fm = r.frontmatter || {};

  const chips = [chip('Lesson', 'green'), `<a href="/licenses/cc-by-nc-4.0.txt">${chip('CC BY-NC 4.0', 'yellow')}</a>`, chip('modified')];
  if (fm.section) chips.push(chip(fm.section));
  const meta = [];
  if (r.codeBlocks.length) meta.push(`${r.codeBlocks.length} code block${r.codeBlocks.length === 1 ? '' : 's'}`);
  if (csCount) meta.push(`${csCount} CodeSandbox exercise${csCount === 1 ? '' : 's'}`);
  meta.push(`${r.words} words`);

  const verified = ctx.verification[page.url];
  const source = sourceCard({
    attribution: `Adapted from Brian Holt's <a href="${HOLT_SITE}/" target="_blank" rel="noopener">Complete Intro to Computer Science</a> (Frontend Masters) · <a href="/licenses/cc-by-nc-4.0.txt">CC BY-NC 4.0</a> · modified. Author photos, the Frontend Masters logo and course housekeeping are not reproduced; media is served locally.`,
    from: [
      { label: `lessons/${slug}.md`, href: `${HOLT_REPO}/blob/main/lessons/${slug}.md` },
      { label: 'original page', href: `${HOLT_SITE}${fm.path || '/' + slug + '/'}` },
    ],
    license: 'CC BY-NC 4.0',
    licenseNote: 'content · code samples Apache-2.0 · modified',
    status: 'modified (layout, media paths, removed asides)',
    verified: verified ? { date: verified.date, docs: verified.docs, exec: verified.exec, note: verified.note } : null,
    raw: `/assets/src/holt/${slug}.md`,
  });
  U.copy(srcAbs, path.join(S.PUBLIC, 'assets', 'src', 'holt', slug + '.md'));

  const description = fm.description || r.firstParagraph;
  const lede = fm.description ? U.truncate(fm.description, 220) : '';

  const docHtml = renderDoc(ctx, {
    page,
    eyebrow: `LESSON · ${page.group}`,
    lede,
    chips,
    meta,
    body: html,
    headings: r.headings,
    source,
    description,
  });

  return {
    html: docHtml,
    search: { headings: r.headings.map((h) => h.text), text: r.firstParagraph },
    facts: { h2s: r.headings.filter((h) => h.level === 2).map((h) => h.text), codesandbox: csCount, images: copied.filter((f) => !/\.webm$/.test(f)), videos: videoCount, codeBlocks: r.codeBlocks.length },
    codeBlocks: r.codeBlocks,
  };
}

module.exports = { renderHoltPage, holtSlugFromSource };
