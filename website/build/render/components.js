// Shared HTML fragments. Class names match DESIGN-REFERENCE §7.
const { escapeHtml, langLabel, normalizeLang } = require('../highlight');

function icon(name, cls = '') {
  return `<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
}

// Complexity badge scale: O(1)/O(log n) green · O(n), O(n+m), O(V+E) neutral · O(n log n) yellow · O(n²)+ red
function complexityClass(expr) {
  const e = expr.replace(/\s+/g, '').toLowerCase();
  if (/^o\(1\)$/.test(e) || /^o\(logn\)$/.test(e) || /^o\(log\(n\)\)$/.test(e) || /^o\(α\(n\)\)$/.test(e) || /^o\(a\(n\)\)$/.test(e) || /^o\(logk\)$/.test(e)) return 'bo-green';
  if (/^o\(nlogn\)$/.test(e) || /^o\(nlogk\)$/.test(e) || /^o\(klogn\)$/.test(e) || /^o\(\(n\+m\)logn\)$/.test(e) || /^o\(elogv\)$/.test(e) || /^o\(nlog\(n\)\)$/.test(e) || /logn\)$/.test(e)) return 'bo-yellow';
  if (/n\^?2|n²|n\^?3|n³|2\^n|2ⁿ|n!|n\*m\*|m\*n|n\*k|nk\)|\^n|n\*\*2|n×n|n\*n|mn\)|nm\)|v\^2|v²/.test(e)) return 'bo-red';
  return 'bo-neutral';
}

const COMPLEXITY_RE = /O\((?:[^()]|\([^()]*\))+\)/g;

function badgeComplexity(text, { escape = true } = {}) {
  const src = escape ? escapeHtml(text) : text;
  return src.replace(COMPLEXITY_RE, (m) => `<span class="bo ${complexityClass(m)}">${m}</span>`);
}

function chip(text, variant = '') {
  return `<span class="chip ${variant}">${escapeHtml(text)}</span>`;
}

function callout(kind, label, innerHtml) {
  return `<aside class="callout ${kind}"><span class="callout-label">${escapeHtml(label)}</span><div class="callout-body">${innerHtml}</div></aside>`;
}

function withLineNumbers(linesHtml) {
  return linesHtml;
}

/**
 * Code panel.
 * @param {object} o
 * @param {string} o.lang       raw language tag
 * @param {string} o.html       highlighted lines html (from highlightToLines)
 * @param {string} o.code       raw code (for copy)
 * @param {string} [o.title]    optional title shown in the header
 * @param {Array}  [o.tabs]     [{label, html, code, lang}] – when present, body is tabbed
 * @param {object} [o.run]      {src:'/assets/src/...', ok:'ok: ...', mode:'worker'|'node', reason}
 * @param {boolean} [o.readonly]
 */
function codePanel(o) {
  const tabs = o.tabs && o.tabs.length ? o.tabs : null;
  const lang = tabs ? tabs[0].lang : o.lang;
  const label = o.label || langLabel(lang);
  const lineCount = (tabs ? tabs[0].code : o.code || '').split('\n').length;
  const tall = lineCount > 32;
  let header = `<div class="code-head">`;
  header += `<span class="code-lang" data-lang="${escapeHtml(normalizeLang(lang))}">${escapeHtml(label)}</span>`;
  if (o.title) header += `<span class="code-title">${escapeHtml(o.title)}</span>`;
  if (tabs) {
    header += `<div class="code-tabs" role="tablist">` + tabs.map((t, i) => `<button class="code-tab${i === 0 ? ' is-active' : ''}" role="tab" aria-selected="${i === 0}" data-tab="${i}">${escapeHtml(t.label)}</button>`).join('') + `</div>`;
  }
  header += `<span class="code-actions">`;
  if (o.run) {
    if (o.run.mode === 'worker') header += `<button class="run-btn" type="button" data-run="${escapeHtml(o.run.src)}" data-ok="${escapeHtml(o.run.ok || '')}">${icon('play')}<span>Run</span></button>`;
    // live: a DOM demo — app.js loads the file as a module script against the page's stage of the same name.
    else if (o.run.mode === 'live') header += `<button class="run-btn is-live" type="button" data-live="${escapeHtml(o.run.src)}" data-stage="${escapeHtml(o.run.stage)}" data-ok="${escapeHtml(o.run.ok || '')}">${icon('play')}<span>Run live</span></button>`;
    // term: a shell script replayed line by line in the lesson terminal under the panel (term.js).
    else if (o.run.mode === 'term') header += `<button class="run-btn is-term" type="button" data-term="${escapeHtml(o.run.name)}">${icon('play')}<span>Run in terminal</span></button>`;
    else header += `<button class="run-btn is-node" type="button" data-node="${escapeHtml(o.run.src)}" title="${escapeHtml(o.run.reason || 'needs Node')}">${icon('copy')}<span>Copy node command</span></button>`;
  }
  header += `<button class="copy-btn" type="button" aria-label="Copy code">${icon('copy')}<span class="copy-text">Copy</span></button>`;
  header += `</span></div>`;
  let body = '';
  const pane = (t, i) => `<div class="code-pane${i === 0 ? ' is-active' : ''}" data-pane="${i}" data-lang="${escapeHtml(normalizeLang(t.lang))}"><pre class="shiki"${tall ? ' data-tall' : ''}><code>${t.html}</code></pre><textarea class="code-raw" hidden readonly>${escapeHtml(t.code)}</textarea></div>`;
  if (tabs) body = tabs.map(pane).join('');
  else body = pane({ html: o.html, code: o.code, lang }, 0);
  let out = `<figure class="code${tabs ? ' has-tabs' : ''}${o.readonly ? ' is-readonly' : ''}${o.cls ? ' ' + o.cls : ''}">${header}<div class="code-body">${body}</div>`;
  if (tall) out += `<button class="code-expand" type="button">Expand ${lineCount} lines</button>`;
  if (o.run && o.run.mode !== 'term') out += `<div class="code-out" hidden><div class="code-out-head"><span>Output</span><button class="code-out-clear" type="button">Clear</button></div><pre class="code-out-body"></pre></div>`;
  if (o.run && o.run.mode === 'node') out += `<p class="code-note">${icon('info')} Not run in the browser: ${escapeHtml(o.run.reason || 'this file needs Node built-ins')}. Copy the <code>node</code> command and run it locally.</p>`;
  out += `</figure>`;
  return out;
}

function pill(text, href, variant = 'primary', extra = '') {
  return `<a class="pill ${variant}" href="${escapeHtml(href)}" ${extra}>${escapeHtml(text)}${variant === 'primary' ? icon('arrow-right', 'pill-icon') : ''}</a>`;
}

module.exports = { icon, chip, callout, codePanel, pill, badgeComplexity, complexityClass, escapeHtml, withLineNumbers };
