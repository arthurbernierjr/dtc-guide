/* It's Deeper Than Code — search (DESIGN-REFERENCE §7).
   One MiniSearch index over search-index.json (title · headings · SAY terms · snippet),
   loaded lazily the first time the ⌘K palette opens, or immediately on /search/.
   Renders grouped by section; ↑↓ to move, ↵ to open, ⌘↵ for a new tab, esc to close. */
(function () {
  'use strict';
  const doc = document;
  const $ = (sel, root) => (root || doc).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || doc).querySelectorAll(sel));
  const SECTION_ORDER = ['Algorithms', 'Data Structures', 'Practice', 'Languages', 'System Design', 'Design Patterns', 'Security', 'Mindset', 'Global'];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const version = (() => { const s = $('script[src^="/search.js"]'); const m = s && s.getAttribute('src').match(/\?v=[^&]+/); return m ? m[0] : ''; })();

  let indexPromise = null;
  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = (async () => {
      if (!window.MiniSearch) {
        await new Promise((res, rej) => { const s = doc.createElement('script'); s.src = `/vendor/minisearch.min.js${version}`; s.onload = res; s.onerror = () => rej(new Error('minisearch failed to load')); doc.head.appendChild(s); });
      }
      const res = await fetch(`/search-index.json${version}`, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`search-index.json ${res.status}`);
      const docs = await res.json();
      const ms = new window.MiniSearch({
        fields: ['title', 'headings', 'say', 'text', 'section', 'group'],
        storeFields: ['title', 'url', 'section', 'group', 'template', 'headings', 'say', 'text'],
        idField: 'url',
        searchOptions: { boost: { title: 4, say: 3, headings: 2, group: 1.5 }, prefix: true, fuzzy: 0.2, combineWith: 'AND' },
      });
      ms.addAll(docs.map((d) => ({ ...d, headings: (d.headings || []).join(' · ') })));
      return { ms, docs };
    })();
    indexPromise.catch(() => { indexPromise = null; });
    return indexPromise;
  }

  function search(ms, q, limit) {
    let hits = ms.search(q);
    if (!hits.length) hits = ms.search(q, { combineWith: 'OR' });
    return hits.slice(0, limit || 40);
  }
  function snippetFor(hit, q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const mark = (s) => { let out = esc(s); for (const t of terms) { if (t.length < 2) continue; out = out.replace(new RegExp(`(${t.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>'); } return out; };
    const pool = [hit.say, hit.headings, hit.text].filter(Boolean);
    let best = '';
    for (const p of pool) { const low = p.toLowerCase(); if (terms.some((t) => low.includes(t))) { best = p; break; } }
    if (!best) best = hit.headings || hit.text || '';
    if (best.length > 110) {
      const low = best.toLowerCase(); let i = -1;
      for (const t of terms) { i = low.indexOf(t); if (i >= 0) break; }
      const start = Math.max(0, i - 40);
      best = (start > 0 ? '…' : '') + best.slice(start, start + 110) + (start + 110 < best.length ? '…' : '');
    }
    const crumb = hit.group && hit.group !== '—' ? `${hit.section} · ${hit.group}` : hit.section;
    return `${esc(crumb)}${best ? ` — ${mark(best)}` : ''}`;
  }
  function renderGroups(hits, q, opts) {
    const groups = new Map();
    for (const h of hits) { if (!groups.has(h.section)) groups.set(h.section, []); groups.get(h.section).push(h); }
    const ordered = Array.from(groups.entries()).sort((a, b) => SECTION_ORDER.indexOf(a[0]) - SECTION_ORDER.indexOf(b[0]));
    let i = 0;
    return ordered.map(([sec, list]) => `<div class="palette-group">${esc(sec)} · ${list.length}</div>` + list.map((h) => {
      const idx = i++;
      return `<a class="palette-item${idx === 0 && opts.activateFirst ? ' is-active' : ''}" href="${esc(h.url)}" data-i="${idx}" role="option" aria-selected="${idx === 0 && opts.activateFirst}"><b>${esc(h.title)}</b><small>${snippetFor(h, q)}</small></a>`;
    }).join('')).join('');
  }

  /* ---------- palette ---------- */
  const palette = $('#palette');
  const input = $('#palette-input');
  const results = $('#palette-results');
  if (palette && input && results) {
    const emptyHtml = results.innerHTML;
    let active = 0;
    let items = [];
    let lastQ = '';
    const setActive = (n) => {
      if (!items.length) return;
      active = (n + items.length) % items.length;
      items.forEach((el, i) => { const a = i === active; el.classList.toggle('is-active', a); el.setAttribute('aria-selected', String(a)); });
      items[active].scrollIntoView({ block: 'nearest' });
    };
    const run = async () => {
      const q = input.value.trim();
      if (q === lastQ) return; lastQ = q;
      if (!q) { results.innerHTML = emptyHtml; items = []; return; }
      try {
        const { ms } = await loadIndex();
        if (input.value.trim() !== q) return; // stale
        const hits = search(ms, q, 30);
        results.innerHTML = hits.length ? renderGroups(hits, q, { activateFirst: true }) : `<div class="palette-empty"><span>No page matches “${esc(q)}”.</span><a class="chip" href="/search/?q=${encodeURIComponent(q)}">Open full search</a></div>`;
        items = $$('.palette-item', results); active = 0;
      } catch (e) {
        results.innerHTML = `<div class="palette-empty"><span>Search is unavailable (${esc(e.message)}). <a href="/search/?q=${encodeURIComponent(q)}">Open the search page</a>.</span></div>`;
      }
    };
    let t = null;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(run, 60); });
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); setActive(active + 1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); setActive(active - 1); }
      else if (ev.key === 'Enter') {
        const el = items[active];
        if (!el) { if (input.value.trim()) location.href = `/search/?q=${encodeURIComponent(input.value.trim())}`; return; }
        ev.preventDefault();
        if (ev.metaKey || ev.ctrlKey) window.open(el.href, '_blank', 'noopener'); else location.href = el.href;
      } else if (ev.key === 'Home' && items.length) { ev.preventDefault(); setActive(0); }
      else if (ev.key === 'End' && items.length) { ev.preventDefault(); setActive(items.length - 1); }
    });
    results.addEventListener('mousemove', (ev) => { const el = ev.target.closest('.palette-item'); if (el) { const i = Number(el.getAttribute('data-i')); if (i !== active) setActive(i); } });
    // Warm the index as soon as the palette opens (before the first keystroke).
    doc.addEventListener('dtc:open', (ev) => { if (ev.detail && ev.detail.id === 'palette') { loadIndex().catch(() => {}); if (input.value) { lastQ = ''; run(); } } });
    // Pre-warm on idle for fast first search; cheap (one JSON fetch, cached).
    if ('requestIdleCallback' in window) requestIdleCallback(() => loadIndex().catch(() => {}), { timeout: 4000 });
  }

  /* ---------- /search/ page ---------- */
  const pageInput = $('#search-q');
  const pageResults = $('#search-results');
  if (pageInput && pageResults) {
    const status = $('#search-status');
    const emptyState = $('#search-empty');
    const form = pageInput.closest('form');
    const defaultStatus = status ? status.innerHTML : '';
    async function runPage(q, push) {
      q = (q || '').trim();
      if (push) history.replaceState(null, '', q ? `/search/?q=${encodeURIComponent(q)}` : '/search/');
      if (!q) { pageResults.innerHTML = ''; if (emptyState) emptyState.hidden = false; if (status) status.innerHTML = defaultStatus; return; }
      if (status) status.textContent = 'Searching…';
      try {
        const { ms } = await loadIndex();
        const hits = search(ms, q, 60);
        pageResults.innerHTML = hits.length ? renderGroups(hits, q, { activateFirst: false }) : `<p class="intro">No page matches “${esc(q)}”. Try a shorter word, or a SAY term like “two pointers”.</p>`;
        if (emptyState) emptyState.hidden = hits.length > 0;
        if (status) status.textContent = `${hits.length} result${hits.length === 1 ? '' : 's'} for “${q}”`;
        doc.title = `${q} · Search · It's Deeper Than Code`;
      } catch (e) {
        pageResults.innerHTML = `<p class="intro">Search is unavailable: ${esc(e.message)}.</p>`;
        if (status) status.textContent = '';
      }
    }
    const initial = new URLSearchParams(location.search).get('q') || '';
    if (initial) { pageInput.value = initial; runPage(initial, false); } else pageInput.focus();
    let t = null;
    pageInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => runPage(pageInput.value, true), 120); });
    if (form) form.addEventListener('submit', (ev) => { ev.preventDefault(); runPage(pageInput.value, true); });
    window.addEventListener('popstate', () => { const q = new URLSearchParams(location.search).get('q') || ''; pageInput.value = q; runPage(q, false); });
  }
})();
