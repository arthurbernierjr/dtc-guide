// Shiki at build time only. The `dtc-dark` theme uses the brand tokens from DESIGN-REFERENCE §7.
let highlighterPromise = null;

const DTC_DARK = {
  name: 'dtc-dark',
  type: 'dark',
  colors: {
    'editor.background': '#0D0D10',
    'editor.foreground': '#EAE6E1',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6A6A74', fontStyle: 'italic' } },
    { scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], settings: { foreground: '#F5EC5A' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'constant.other'], settings: { foreground: '#F5A8AC' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression', 'variable.language'], settings: { foreground: '#2FD48F' } },
    { scope: ['keyword.operator'], settings: { foreground: '#C6BFC4' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function', 'variable.function'], settings: { foreground: '#F5F2EE' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type', 'entity.other.inherited-class', 'meta.type.annotation'], settings: { foreground: '#9FE3C8' } },
    { scope: ['variable', 'variable.other', 'variable.parameter', 'meta.object-literal.key'], settings: { foreground: '#EAE6E1' } },
    { scope: ['entity.name.tag', 'punctuation.definition.tag'], settings: { foreground: '#2FD48F' } },
    { scope: ['entity.other.attribute-name'], settings: { foreground: '#F5EC5A' } },
    { scope: ['support.type.property-name', 'entity.other.attribute-name.css', 'support.constant.property-value'], settings: { foreground: '#EAE6E1' } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: '#A3A3AC' } },
    { scope: ['markup.heading', 'markup.bold'], settings: { foreground: '#F5F2EE', fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
    { scope: ['invalid', 'invalid.illegal'], settings: { foreground: '#F03038' } },
    { scope: ['token.info-token'], settings: { foreground: '#2FD48F' } },
  ],
};

const LANG_ALIASES = {
  js: 'javascript', javascript: 'javascript', mjs: 'javascript', cjs: 'javascript', node: 'javascript',
  jsx: 'jsx', ts: 'typescript', typescript: 'typescript', tsx: 'tsx',
  py: 'python', python: 'python', python3: 'python',
  rb: 'ruby', ruby: 'ruby', erb: 'erb',
  go: 'go', golang: 'go',
  java: 'java', kotlin: 'kotlin',
  cs: 'csharp', csharp: 'csharp', 'c#': 'csharp',
  php: 'php', blade: 'blade',
  rs: 'rust', rust: 'rust',
  dart: 'dart',
  html: 'html', xml: 'xml', vue: 'vue', svelte: 'svelte', css: 'css', scss: 'scss',
  json: 'json', jsonc: 'jsonc', yaml: 'yaml', yml: 'yaml', toml: 'toml',
  sh: 'bash', bash: 'bash', shell: 'bash', zsh: 'bash', console: 'bash', shellsession: 'bash', cmd: 'bash', powershell: 'powershell',
  sql: 'sql', dockerfile: 'dockerfile', docker: 'dockerfile', nginx: 'nginx', ini: 'ini', env: 'dotenv', dotenv: 'dotenv',
  md: 'markdown', markdown: 'markdown', diff: 'diff', text: 'text', txt: 'text', plain: 'text', output: 'text', '': 'text',
  graphql: 'graphql', http: 'http', csv: 'text', makefile: 'makefile', groovy: 'groovy', gradle: 'groovy', properties: 'ini',
};

const LANG_LABELS = {
  javascript: 'JS', jsx: 'JSX', typescript: 'TS', tsx: 'TSX', python: 'PY', ruby: 'RB', erb: 'ERB', go: 'GO', java: 'JAVA', kotlin: 'KT',
  csharp: 'C#', php: 'PHP', blade: 'BLADE', rust: 'RS', dart: 'DART', html: 'HTML', xml: 'XML', vue: 'VUE', svelte: 'SVELTE', css: 'CSS', scss: 'SCSS',
  json: 'JSON', jsonc: 'JSON', yaml: 'YAML', toml: 'TOML', bash: 'SH', powershell: 'PS', sql: 'SQL', dockerfile: 'DOCKER', nginx: 'NGINX', ini: 'INI',
  dotenv: 'ENV', markdown: 'MD', diff: 'DIFF', text: 'TEXT', graphql: 'GQL', http: 'HTTP', makefile: 'MAKE', groovy: 'GROOVY',
};

function normalizeLang(lang) {
  const key = String(lang || '').trim().toLowerCase().split(/[\s{]/)[0];
  return LANG_ALIASES[key] || (LANG_LABELS[key] ? key : 'text');
}

function langLabel(lang) {
  return LANG_LABELS[normalizeLang(lang)] || String(lang || 'TEXT').toUpperCase();
}

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = (async () => {
      const { createHighlighter } = await import('shiki');
      const langs = Array.from(new Set(Object.values(LANG_ALIASES))).filter((l) => l !== 'text');
      const hl = await createHighlighter({ themes: [DTC_DARK], langs });
      return hl;
    })();
  }
  return highlighterPromise;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Returns the inner <code> HTML (lines wrapped in <span class="line">), without <pre>.
// Lines are display:block in CSS, so no "\n" separators (they would double-space the <pre>).
// Empty lines get a non-breaking space so they keep their height.
function plainLines(code) {
  return code.replace(/\n$/, '').split('\n').map((line) => `<span class="line">${line ? escapeHtml(line) : '&nbsp;'}</span>`).join('');
}
async function highlightToLines(code, lang) {
  const hl = await getHighlighter();
  const l = normalizeLang(lang);
  if (l === 'text') return plainLines(code);
  try {
    const html = hl.codeToHtml(code.replace(/\n$/, ''), { lang: l, theme: 'dtc-dark' });
    const m = html.match(/<code[^>]*>([\s\S]*)<\/code>/);
    if (!m) return plainLines(code);
    return m[1].replace(/<\/span>\n<span class="line">/g, '</span><span class="line">').replace(/<span class="line"><\/span>/g, '<span class="line">&nbsp;</span>');
  } catch (e) {
    return plainLines(code);
  }
}

module.exports = { getHighlighter, highlightToLines, normalizeLang, langLabel, escapeHtml, DTC_DARK };
