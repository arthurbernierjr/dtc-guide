// Markdown → HTML with Shiki code panels, heading ids, callouts, table wrappers,
// image / link rewriting and source-specific stripping (third-party logos, CodeSandbox badges, FM logo).
const { highlightToLines, escapeHtml } = require('../highlight');
const C = require('../render/components');
const { slugify } = require('../registry');

let markedPromise = null;
async function getMarked() {
  if (!markedPromise) markedPromise = import('marked').then((m) => m);
  return markedPromise;
}

function parseFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: md };
  const data = {};
  let currentKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const arr = line.match(/^\s+- (.+)$/);
    if (arr && currentKey) { (data[currentKey] = Array.isArray(data[currentKey]) ? data[currentKey] : []).push(arr[1].trim().replace(/^"|"$/g, '')); continue; }
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      let v = kv[2].trim();
      if (v === '') { data[currentKey] = []; continue; }
      if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
      else if (v === 'true') v = true;
      else if (v === 'false') v = false;
      else v = v.replace(/^"|"$/g, '');
      data[currentKey] = v;
    }
  }
  return { data, body: md.slice(m[0].length) };
}

// Third-party logos / badges that must never be reproduced, and image hosts that are dead.
const BRAND_IMAGE = /(General_Assembly_logo|generalassemb\.ly|ga-logo|GA_Logo|ga_cog)/i;
const DEAD_HOSTS = /(media\.git\.generalassemb\.ly|i\.imgur\.com|imgur\.com|dropbox\.com|dl\.dropboxusercontent\.com)/i;

const CALLOUT_H2 = [
  { re: /^(say this|say|what to say|in the interview|interview answer|how to say it out loud|how to say it)$/i, kind: 'say', label: 'SAY THIS' },
  { re: /^(watch out|gotchas?|common mistakes|don'?t|anti-?patterns?|pitfalls?)$/i, kind: 'dont', label: "WATCH OUT" },
];

/**
 * @param {string} md
 * @param {object} opts
 * @param {(src:string, alt:string)=>({src:string, alt?:string, caption?:string}|null)} [opts.resolveImage]
 * @param {(href:string)=>string|null} [opts.resolveLink]
 * @param {boolean} [opts.stripFrontmatter=true]
 * @param {number} [opts.headingShift=0]  shift heading levels (e.g. source uses # for title)
 * @param {boolean} [opts.dropH1=true]   drop the first H1 (the page template renders the title)
 * @param {Set<string>} [opts.dropHeadings] exact heading texts to remove with their sections (e.g. "Table of Contents")
 * @param {boolean} [opts.callouts=true] turn "Say this"/"In the interview" H2 sections into callouts
 * @param {string} [opts.idPrefix]
 * @param {(index:number, code:string, lang:string)=>object} [opts.codeExtra] extra code-panel options per fenced block
 * @param {boolean} [opts.storyQuotes] render single-italic-paragraph blockquotes as <blockquote class="story">
 * @param {boolean} [opts.rawHtml] pass raw HTML blocks through untouched (default behaviour; listed for clarity)
 */
async function renderMarkdown(md, opts = {}) {
  const { Marked, Renderer } = await getMarked();
  const o = { stripFrontmatter: true, dropH1: true, callouts: true, headingShift: 0, ...opts };
  let body = md;
  let frontmatter = {};
  if (o.stripFrontmatter) { const fm = parseFrontmatter(md); frontmatter = fm.data; body = fm.body; }
  body = body.replace(/\r\n/g, '\n');
  // Holt videos → local file, no autoplay, poster frame (done on the source so marked sees one html block)
  body = body.replace(/<video[^>]*>\s*<source src="https:\/\/btholt\.github\.io\/complete-intro-to-computer-science\/([^"]+)"[^>]*>\s*<\/video>/g, (m, file) => {
    const local = o.resolveVideo ? o.resolveVideo(file) : `/assets/content/holt/${file}`;
    return `\n\n<figure class="video"><video controls loop muted playsinline preload="metadata" poster="${local.replace(/\.webm$/, '.jpg')}"><source src="${local}" type="video/webm"></video></figure>\n\n`;
  });

  const headings = [];
  const usedIds = new Set();
  const codeBlocks = [];
  const images = [];
  const links = [];
  let h1 = null;
  let dropDepth = null; // when dropping a heading section

  const marked = new Marked({ gfm: true, breaks: false });
  const renderer = new Renderer();

  // Pre-highlight all code tokens.
  marked.use({
    async: true,
    async walkTokens(token) {
      if (token.type === 'code') {
        // Info string: "<lang> <meta…>" — only the first word is the language (e.g. "js run=hero").
        const lang = (token.lang || '').trim().split(/\s+/)[0] || '';
        token.__html = await highlightToLines(token.text + '\n', lang);
      }
    },
  });

  renderer.heading = function ({ tokens, depth, text }) {
    // A trailing colon on a heading ("## CRUD:") is a source-formatting habit, not part of the title.
    let inner = this.parser.parseInline(tokens).replace(/:\s*$/, '');
    const plain = text.replace(/<[^>]+>/g, '').replace(/[`*_]/g, '').replace(/:\s*$/, '').trim();
    let level = depth + o.headingShift;
    if (level < 1) level = 1;
    if (level > 6) level = 6;
    if (level === 1 && o.dropH1 && h1 === null) { h1 = plain; return ''; }
    if (o.dropHeadings && o.dropHeadings.has(plain)) { dropDepth = level; return `<!--drop-start:${level}-->`; }
    if (dropDepth !== null && level <= dropDepth) { dropDepth = null; }
    let id = (o.idPrefix || '') + (slugify(plain) || 'section');
    let base = id; let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    headings.push({ level, text: plain, id });
    let calloutAttr = '';
    if (o.callouts && level === 2) {
      const c = CALLOUT_H2.find((x) => x.re.test(plain));
      if (c) calloutAttr = ` data-callout="${c.kind}" data-callout-label="${c.label}"`;
    }
    return `<h${level} id="${id}"${calloutAttr}>${inner}<a class="h-anchor" href="#${id}" aria-label="Link to this section">#</a></h${level}>\n`;
  };

  renderer.code = function ({ text, lang, __html }) {
    const code = text;
    const info = (lang || '').trim();
    const [language, ...metaParts] = info.split(/\s+/);
    const meta = metaParts.join(' ');
    codeBlocks.push({ lang: language || '', code, meta });
    // codeExtra(index, code, lang, meta) → extra code-panel options (title, run) for the nth fenced block;
    // `after` is raw HTML placed directly under the panel (a session's live stage follows its html fence).
    const { after = '', ...extra } = o.codeExtra ? o.codeExtra(codeBlocks.length - 1, code, language || '', meta) || {} : {};
    return C.codePanel({ lang: language || '', html: __html || escapeHtml(code), code, ...extra }) + after + '\n';
  };

  renderer.codespan = function ({ text }) {
    // marked hands us the raw span text; escape it ourselves (`<iframe>` must render literally).
    const t = text;
    if (/^O\(.+\)$/.test(t)) return C.badgeComplexity(t);
    return `<code>${escapeHtml(t)}</code>`;
  };

  renderer.image = function ({ href, title, text }) {
    if (BRAND_IMAGE.test(href) || /FrontendMastersLogo|brian(-beer)?\.jpg|lunasit\.jpg|author\.jpg|logo\.svg$/i.test(href)) return '';
    let resolved = o.resolveImage ? o.resolveImage(href, text) : { src: href, alt: text };
    if (!resolved) {
      if (DEAD_HOSTS.test(href)) return '';
      return '';
    }
    if (resolved.html) { images.push(resolved.src || href); return resolved.html; } // pre-rendered figure (path diagrams)
    images.push(resolved.src);
    const cap = resolved.caption || title;
    return `<figure class="img"><img src="${escapeHtml(resolved.src)}" alt="${escapeHtml(resolved.alt || text || '')}" loading="lazy">${cap ? `<figcaption>${escapeHtml(cap)}</figcaption>` : ''}</figure>`;
  };

  renderer.link = function ({ href, title, tokens, text }) {
    const inner = this.parser.parseInline(tokens);
    // CodeSandbox badge: a link wrapping the play-codesandbox image → link row
    if (/codesandbox\.io\//.test(href) && (/play-codesandbox|codesandbox\.png/.test(text) || tokens.some((t) => t.type === 'image'))) {
      links.push(href);
      return `<a class="cs-link" href="${escapeHtml(href)}" target="_blank" rel="noopener">${C.icon('external')}Open exercise on CodeSandbox ↗</a>`;
    }
    let h = o.resolveLink ? o.resolveLink(href) : href;
    if (h === null) return inner;
    // Only http(s), mailto, site paths and fragments become links; anything with another scheme
    // (javascript:, data:, vbscript:, …) is rendered as its text.
    const scheme = (String(h).match(/^\s*([a-zA-Z][a-zA-Z0-9+.-]*):/) || [])[1];
    if (scheme && !/^(https?|mailto)$/i.test(scheme)) {
      console.warn(`warn: link with ${scheme}: scheme dropped — ${String(h).slice(0, 80)}`);
      return inner;
    }
    links.push(h);
    const external = /^https?:\/\//.test(h);
    const attrs = external ? ` target="_blank" rel="noopener"` : '';
    return `<a href="${escapeHtml(h)}"${title ? ` title="${escapeHtml(title)}"` : ''}${attrs}${external ? ' class="ext"' : ''}>${inner}</a>`;
  };

  renderer.table = function ({ header, rows }) {
    const cell = (c, tag) => {
      const inner = this.parser.parseInline(c.tokens);
      const align = c.align ? ` style="text-align:${c.align}"` : '';
      const badged = inner.replace(/O\((?:[^()<]|\([^()]*\))+\)/g, (m) => `<span class="bo ${C.complexityClass(m)}">${m}</span>`);
      return `<${tag}${align}>${badged}</${tag}>`;
    };
    const thead = `<thead><tr>${header.map((c) => cell(c, 'th')).join('')}</tr></thead>`;
    const tbody = `<tbody>${rows.map((r) => `<tr>${r.map((c) => cell(c, 'td')).join('')}</tr>`).join('')}</tbody>`;
    return `<div class="table-wrap"><table>${thead}${tbody}</table></div>\n`;
  };

  renderer.blockquote = function ({ tokens }) {
    const inner = this.parser.parse(tokens);
    // Storybook pull quote: a blockquote that is one italic paragraph (session pages, §R8).
    if (o.storyQuotes && /^\s*<p><em>[\s\S]*<\/em><\/p>\s*$/.test(inner)) return `<blockquote class="story">${inner}</blockquote>\n`;
    const m = inner.match(/^<p><strong>(Say|Say this|Don'?t|Do|Note|Tip|Warning|Watch out)[:：]?<\/strong>\s*/i);
    if (m) {
      const key = m[1].toLowerCase();
      const kind = /say/.test(key) ? 'say' : /don|warn|watch/.test(key) ? 'dont' : /^do$/.test(key) ? 'do' : 'note';
      const label = kind === 'say' ? 'SAY THIS' : kind === 'dont' ? "DON'T" : kind === 'do' ? 'DO' : 'NOTE';
      return C.callout(kind, label, inner.replace(m[0], '<p>'));
    }
    return C.callout('note', 'NOTE', inner);
  };

  renderer.html = function ({ text }) {
    let t = text;
    t = t.replace(/<img[^>]*(General_Assembly|generalassemb\.ly|FrontendMastersLogo)[^>]*>/gi, '');
    if (/<video/.test(t)) images.push('video');
    return t;
  };

  marked.use({ renderer });
  let html = await marked.parse(body);

  // Remove dropped heading sections (<!--drop-start:N--> … until next heading of level <= N)
  html = html.replace(/<!--drop-start:(\d)-->([\s\S]*?)(?=<h[1-6] |$)/g, (m, lvl, rest) => {
    // keep removing following headings deeper than lvl
    return '';
  });

  // Wrap callout sections: <h2 data-callout="say"> … until next <h2
  if (o.callouts) {
    html = html.replace(/<h2 id="([^"]+)" data-callout="(\w+)" data-callout-label="([^"]+)">([\s\S]*?)<\/h2>\n([\s\S]*?)(?=<h2 |$)/g, (m, id, kind, label, inner, section) => {
      return `<h2 id="${id}" class="h-callout">${inner}</h2>\n<aside class="callout ${kind}"><span class="callout-label">${label}</span><div class="callout-body">${section}</div></aside>\n`;
    });
  }

  // First real paragraph (used for ledes and meta descriptions): skip one-word label lines like
  // "Functional" and fall back to the first list item, then to whatever paragraph exists.
  const plainText = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
  const blocks = [...html.matchAll(/<(p|li)>([\s\S]*?)<\/\1>/g)].map((m) => plainText(m[2]));
  const firstParagraph = blocks.find((t) => t.length >= 40) || blocks[0] || '';
  const words = body.replace(/```[\s\S]*?```/g, '').split(/\s+/).filter(Boolean).length;
  return { html, headings, h1, frontmatter, codeBlocks, images, links, firstParagraph, words };
}

module.exports = { renderMarkdown, parseFrontmatter, getMarked };
