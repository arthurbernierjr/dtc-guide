/* It's Deeper Than Code — The Guide · client behaviour (DESIGN-REFERENCE §11).
   No framework, no build step. Everything degrades: pages are fully readable without this file.
   Sections: reveal · nav/progress/back-top · drawers, sheet, palette shell · sidebar tree ·
   TOC scroll-spy · code panels (tabs, copy, expand, run in worker) · try-it-first gate ·
   which-pattern-when strip · keyboard shortcuts. */
(function () {
  'use strict';
  const doc = document;
  const html = doc.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root) => (root || doc).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || doc).querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } },
  };

  /* ---------- reveal (CSS only hides .reveal once .has-reveal is on <html>) ---------- */
  html.classList.add('has-reveal');
  const revealEls = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) revealEls.forEach((el) => el.classList.add('in'));
  else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach((el, i) => { el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`; io.observe(el); });
    // Anything already above the fold on load.
    setTimeout(() => revealEls.forEach((el) => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); }), 120);
  }

  /* ---------- nav state, reading progress, back to top ---------- */
  const nav = $('.nav');
  const progress = $('#progress');
  const backTop = $('#back-top');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY || html.scrollTop;
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (progress) {
      const max = html.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? `${Math.min(100, (y / max) * 100).toFixed(2)}%` : '0';
    }
    if (backTop) backTop.classList.toggle('show', y > 720);
    ticking = false;
  }
  on(window, 'scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  on(backTop, 'click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

  /* ---------- overlays: drawers (.drawer), sheet (.sheet), palette (.palette-scrim) ---------- */
  const scrims = $$('.drawer-scrim');
  let openEl = null;
  let lastFocus = null;
  function show(el) {
    if (!el) return;
    if (openEl && openEl !== el) hide(openEl, true);
    lastFocus = doc.activeElement;
    el.hidden = false;
    // Next frame: the element is display:none until .show lands, so the transition runs and
    // focus() has something to focus.
    requestAnimationFrame(() => {
      el.classList.add('show');
      if (el.id === 'palette') { const input = $('#palette-input'); if (input) { input.focus(); input.select(); } }
      else { const focusable = el.querySelector('input, button:not([data-close]), a'); if (focusable) focusable.focus({ preventScroll: true }); }
    });
    if (el.classList.contains('drawer') || el.classList.contains('sheet')) scrims.forEach((s) => { s.hidden = false; s.classList.add('show'); });
    html.classList.add('no-scroll');
    openEl = el;
    doc.dispatchEvent(new CustomEvent('dtc:open', { detail: { id: el.id } }));
  }
  function hide(el, keepScrollLock) {
    if (!el) return;
    el.classList.remove('show');
    scrims.forEach((s) => s.classList.remove('show'));
    const finish = () => { el.hidden = true; scrims.forEach((s) => { if (!s.classList.contains('show')) s.hidden = true; }); };
    if (reduced) finish(); else setTimeout(finish, 260);
    if (!keepScrollLock) html.classList.remove('no-scroll');
    if (openEl === el) openEl = null;
    if (lastFocus && lastFocus.focus && !keepScrollLock) lastFocus.focus({ preventScroll: true });
  }
  function toggle(id) { const el = doc.getElementById(id); if (!el) return; if (openEl === el) hide(el); else show(el); }
  on(doc, 'click', (ev) => {
    const opener = ev.target.closest('[data-open]');
    if (opener) { ev.preventDefault(); toggle(opener.getAttribute('data-open')); return; }
    const closer = ev.target.closest('[data-close]');
    if (closer) { ev.preventDefault(); if (openEl) hide(openEl); return; }
    const tog = ev.target.closest('[data-toggle]');
    if (tog) {
      const el = doc.getElementById(tog.getAttribute('data-toggle'));
      if (el) { const open = el.classList.toggle('show'); tog.setAttribute('aria-expanded', String(open)); }
      return;
    }
    // Click outside the toc pop closes it.
    const pop = $('.toc-pop.show');
    if (pop && !pop.contains(ev.target)) { pop.classList.remove('show'); const b = $('[data-toggle="toc-pop"]'); if (b) b.setAttribute('aria-expanded', 'false'); }
    // Palette scrim click (outside the panel) closes.
    if (ev.target.classList.contains('palette-scrim')) hide(ev.target);
    // In-overlay navigation closes the overlay.
    if (openEl && ev.target.closest('a[href]') && openEl.contains(ev.target)) hide(openEl);
  });
  on(doc, 'keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (openEl) { ev.preventDefault(); hide(openEl); return; }
      const pop = $('.toc-pop.show'); if (pop) pop.classList.remove('show');
    }
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test((ev.target.tagName || '')) || ev.target.isContentEditable;
    if ((ev.key === 'k' || ev.key === 'K') && (ev.metaKey || ev.ctrlKey)) { ev.preventDefault(); toggle('palette'); return; }
    if (ev.key === '/' && !inField && !openEl && !ev.metaKey && !ev.ctrlKey && !ev.altKey) { ev.preventDefault(); show($('#palette')); }
  });
  // Expose for search.js
  window.DTC = Object.assign(window.DTC || {}, { show, hide, toggle, reduced, store });

  /* ---------- sidebar tree (collapsible groups; nav drawer gets a copy on doc pages) ---------- */
  on(doc, 'click', (ev) => {
    const btn = ev.target.closest('.tree-group > button');
    if (!btn) return;
    const li = btn.parentElement;
    const open = li.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  const sidebarTree = $('.sidebar .tree');
  const drawerTree = $('#nav-drawer .drawer-tree');
  if (sidebarTree && drawerTree && !drawerTree.children.length) {
    const title = $('.sidebar .tree-title');
    drawerTree.innerHTML = `<hr style="border:0;border-top:1px solid var(--border);margin:20px 0 12px">${title ? title.outerHTML : ''}${sidebarTree.outerHTML.replace(/ id="tree"/, '')}`;
  }
  // Keep the current page visible in the sidebar.
  const cur = $('.sidebar .tree a.is-current');
  if (cur && cur.scrollIntoView) { const side = $('.sidebar'); if (side && side.scrollHeight > side.clientHeight) cur.scrollIntoView({ block: 'center' }); }

  /* ---------- TOC scroll-spy (rail + pop + sheet share the same hrefs) ---------- */
  const tocLinks = $$('.toc a[href^="#"], .guide-tree a[href^="#"]');
  if (tocLinks.length) {
    const byId = new Map();
    for (const a of tocLinks) { const id = decodeURIComponent(a.getAttribute('href').slice(1)); if (!byId.has(id)) byId.set(id, []); byId.get(id).push(a); }
    const targets = Array.from(byId.keys()).map((id) => doc.getElementById(id)).filter(Boolean);
    let activeId = null;
    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      tocLinks.forEach((a) => {
        a.classList.remove('is-active');
        if (a.closest('.guide-tree')) a.removeAttribute('aria-current');
      });
      (byId.get(id) || []).forEach((a) => {
        a.classList.add('is-active');
        const guide = a.closest('.guide-tree');
        if (guide) {
          a.setAttribute('aria-current', 'location');
          const group = a.closest('.tree-group');
          if (group) { group.classList.add('open'); group.querySelector('button').setAttribute('aria-expanded', 'true'); }
        }
        const rail = guide ? a.closest('.sidebar, .drawer') : a.closest('.toc');
        if (rail && a.getClientRects().length && rail.scrollHeight > rail.clientHeight) {
          const r = a.getBoundingClientRect(), rr = rail.getBoundingClientRect();
          if (r.top < rr.top + 24 || r.bottom > rr.bottom - 24) rail.scrollTop += r.top - rr.top - rail.clientHeight / 2;
        }
      });
    }
    function spy() {
      const line = (parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 64) + 48;
      let current = targets[0] ? targets[0].id : null;
      for (const t of targets) { if (t.getBoundingClientRect().top <= line) current = t.id; else break; }
      // At the very bottom, light the last one.
      if (window.innerHeight + window.scrollY >= html.scrollHeight - 2 && targets.length) current = targets[targets.length - 1].id;
      setActive(current);
    }
    let spyTick = false;
    on(window, 'scroll', () => { if (!spyTick) { spyTick = true; requestAnimationFrame(() => { spy(); spyTick = false; }); } }, { passive: true });
    on(window, 'resize', spy);
    spy();
    // Smooth-scroll TOC clicks (respecting reduced motion) and close sheet/pop.
    on(doc, 'click', (ev) => {
      const a = ev.target.closest('.toc a[href^="#"], .guide-tree a[href^="#"], .h-anchor');
      if (!a) return;
      const id = decodeURIComponent(a.getAttribute('href').slice(1));
      const t = doc.getElementById(id);
      if (!t) return;
      ev.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 64) - 24;
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', `#${id}`);
      const pop = $('.toc-pop.show'); if (pop) pop.classList.remove('show');
    });
  }

  /* ---------- code panels ---------- */
  on(doc, 'click', (ev) => {
    const tab = ev.target.closest('.code-tab');
    if (tab) {
      const fig = tab.closest('.code');
      const i = tab.getAttribute('data-tab');
      $$('.code-tab', fig).forEach((t) => { const a = t === tab; t.classList.toggle('is-active', a); t.setAttribute('aria-selected', String(a)); });
      $$('.code-pane', fig).forEach((p) => p.classList.toggle('is-active', p.getAttribute('data-pane') === i));
      return;
    }
    const copy = ev.target.closest('.copy-btn');
    if (copy) { copyCode(copy.closest('.code'), copy); return; }
    const expand = ev.target.closest('.code-expand');
    if (expand) { const fig = expand.closest('.code'); fig.classList.add('is-expanded'); return; }
    const clear = ev.target.closest('.code-out-clear');
    if (clear) { const out = clear.closest('.code-out'); $('.code-out-body', out).textContent = ''; out.hidden = true; return; }
    const run = ev.target.closest('.run-btn[data-run]');
    if (run) { runInWorker(run); return; }
    const live = ev.target.closest('.run-btn[data-live]');
    if (live) { runLive(live); return; }
    const nodeBtn = ev.target.closest('.run-btn[data-node]');
    if (nodeBtn) {
      const src = nodeBtn.getAttribute('data-node');
      // Download to a file, then run it: the learner can open what they fetched before node
      // touches it, instead of piping an unseen download straight into the interpreter.
      const file = src.slice(src.lastIndexOf('/') + 1);
      const cmd = `curl -sLO ${location.origin}${src} && node ${file}`;
      writeClipboard(cmd).then(() => flash(nodeBtn, 'Copied', true), () => flash(nodeBtn, 'Copy failed', false));
    }
  });
  function activeRaw(fig) {
    const pane = $('.code-pane.is-active', fig) || $('.code-pane', fig);
    const ta = pane && $('.code-raw', pane);
    return ta ? ta.value : (pane ? pane.textContent : '');
  }
  function legacyCopy(text) {
    return new Promise((res, rej) => {
      const ta = doc.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      doc.body.appendChild(ta); ta.select();
      try { doc.execCommand('copy') ? res() : rej(new Error('execCommand')); } catch (e) { rej(e); } finally { ta.remove(); }
    });
  }
  function writeClipboard(text) {
    // Async API first; if it rejects (permission, no activation) try the selection-based path.
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
    return legacyCopy(text);
  }
  function flash(btn, text, ok) {
    const span = $('span:last-child', btn) || btn;
    const prev = span.textContent;
    const cls = ok ? 'is-copied' : 'is-failed';
    span.textContent = text; btn.classList.add(cls);
    setTimeout(() => { span.textContent = prev; btn.classList.remove(cls); }, 1600);
  }
  function copyCode(fig, btn) {
    if (!fig) return;
    writeClipboard(activeRaw(fig)).then(() => flash(btn, 'Copied', true), () => flash(btn, 'Copy failed', false));
  }

  /* ---------- run in worker ---------- */
  let worker = null;
  let runSeq = 0;
  const runs = new Map();
  function getWorker() {
    if (worker) return worker;
    worker = new Worker(`/worker.js${scriptVersion()}`);
    worker.onmessage = (ev) => {
      const m = ev.data; const r = runs.get(m.id); if (!r) return;
      if (m.type === 'log') appendOut(r, m.text, m.level);
      else {
        if (m.type === 'done') appendOut(r, `✓ finished in ${m.ms} ms${r.ok ? (r.sawOk ? '' : ` — expected "${r.ok}" was not printed`) : ''}`, r.ok && !r.sawOk ? 'err' : 'ok');
        else appendOut(r, m.text, 'err');
        finishRun(r);
      }
    };
    worker.onerror = (ev) => { for (const r of runs.values()) { appendOut(r, `Worker error: ${ev.message}`, 'err'); finishRun(r); } ev.preventDefault(); };
    return worker;
  }
  function scriptVersion() { const s = $('script[src^="/app.js"]'); const m = s && s.getAttribute('src').match(/\?v=[^&]+/); return m ? m[0] : ''; }
  function appendOut(r, text, level) {
    if (r.ok && text.includes(r.ok)) { r.sawOk = true; level = 'ok'; }
    const line = doc.createElement('div');
    if (level && level !== 'log') line.className = level === 'warn' ? 'dim' : level;
    line.textContent = text;
    r.body.appendChild(line);
    r.body.scrollTop = r.body.scrollHeight;
  }
  function finishRun(r) {
    clearTimeout(r.timer);
    r.btn.classList.remove('is-running');
    runs.delete(r.id);
  }
  function runInWorker(btn) {
    const fig = btn.closest('.code');
    const out = $('.code-out', fig);
    const body = $('.code-out-body', out);
    out.hidden = false; body.textContent = '';
    btn.classList.add('is-running');
    const id = ++runSeq;
    const r = { id, btn, body, ok: btn.getAttribute('data-ok') || '', sawOk: false };
    runs.set(id, r);
    appendOut(r, `$ node ${btn.getAttribute('data-run').replace(/^\/assets\/src\//, '')}`, 'dim');
    r.timer = setTimeout(() => {
      appendOut(r, 'Stopped after 15 s — the file did not finish. Run it locally with node to inspect.', 'err');
      finishRun(r);
      if (worker) { worker.terminate(); worker = null; }
    }, 15000);
    try { getWorker().postMessage({ id, src: btn.getAttribute('data-run') }); }
    catch (e) { appendOut(r, `Could not start the runner: ${e.message}`, 'err'); finishRun(r); }
  }

  /* ---------- live stages (session DOM demos run against a fenced corner of this page) ----------
     A `js live=<name>` file is loaded as a module script. Its first line asks for the stage:
     `const { document, console, setTimeout, setInterval, clearTimeout, clearInterval } =
     globalThis.__dtcStage(name)` — `document` is scoped to the stage root (selectors,
     createElement, events, body), `console` streams to the panel under the code, and the four
     timer functions are the real ones with their ids remembered per stage. Every Run swaps in a
     fresh root from the <template>, so old listeners and state go with it, stops any timer the
     previous run left ticking (and says so), and the module URL gets a new query so the browser
     evaluates the file again. */
  const stages = new Map();
  let liveSeq = 0;
  function fmtDom(v, depth) {
    depth = depth === undefined ? 2 : depth;
    if (v === null) return 'null';
    const t = typeof v;
    if (t === 'string') return v;
    if (t === 'undefined' || t === 'number' || t === 'boolean' || t === 'bigint' || t === 'symbol') return String(v);
    if (t === 'function') return `[Function${v.name ? ': ' + v.name : ''}]`;
    if (v instanceof Element) return `<${v.tagName.toLowerCase()}${v.id ? '#' + v.id : ''}${v.classList.length ? '.' + Array.from(v.classList).join('.') : ''}>`;
    if (v instanceof Text) return `#text "${v.data.length > 40 ? v.data.slice(0, 40) + '…' : v.data}"`;
    if (v instanceof NodeList || v instanceof HTMLCollection) return `${v.constructor.name}(${v.length}) [ ${Array.from(v).slice(0, 8).map((x) => fmtDom(x, depth - 1)).join(', ')}${v.length > 8 ? ', …' : ''} ]`;
    if (v instanceof Event) return `${v.constructor.name} { type: '${v.type}', target: ${fmtDom(v.target, 0)} }`;
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (v instanceof Date) return v.toISOString();
    if (depth < 0) return Array.isArray(v) ? '[Array]' : '[Object]';
    if (Array.isArray(v)) return `[ ${v.slice(0, 50).map((x) => (typeof x === 'string' ? `'${x}'` : fmtDom(x, depth - 1))).join(', ')}${v.length > 50 ? ', …' : ''} ]`;
    const keys = Object.keys(v);
    return `{ ${keys.slice(0, 30).map((k) => `${k}: ${typeof v[k] === 'string' ? `'${v[k]}'` : fmtDom(v[k], depth - 1)}`).join(', ')}${keys.length > 30 ? ', …' : ''} }`;
  }
  function stageConsole(st) {
    const out = (level) => function () { appendOut(st.run, Array.prototype.map.call(arguments, (a) => fmtDom(a)).join(' '), level); console[level === 'err' ? 'error' : level === 'dim' ? 'warn' : 'log'].apply(console, arguments); };
    return { log: out('log'), info: out('log'), warn: out('dim'), error: out('err'), debug: out('dim'), table: out('log'), dir: out('log'), group: out('log'), groupEnd() {}, clear() { st.run.body.textContent = ''; }, assert(c) { if (!c) out('err').apply(null, ['Assertion failed'].concat(Array.prototype.slice.call(arguments, 1))); }, count() {}, time() {}, timeEnd() {}, trace: out('dim') };
  }
  function stageDocument(st) {
    const root = () => st.root;
    return {
      getElementById(id) { return root().querySelector('#' + CSS.escape(String(id))); },
      querySelector(sel) { return root().querySelector(sel); },
      querySelectorAll(sel) { return root().querySelectorAll(sel); },
      getElementsByClassName(c) { return root().getElementsByClassName(c); },
      getElementsByTagName(t) { return root().getElementsByTagName(t); },
      createElement(tag, opts) { return doc.createElement(tag, opts); },
      createTextNode(t) { return doc.createTextNode(t); },
      createDocumentFragment() { return doc.createDocumentFragment(); },
      addEventListener(type, fn, opts) { root().addEventListener(type, fn, opts); },
      removeEventListener(type, fn, opts) { root().removeEventListener(type, fn, opts); },
      contains(n) { return root().contains(n); },
      get body() { return root(); },
      get documentElement() { return root(); },
      get activeElement() { return root().contains(doc.activeElement) ? doc.activeElement : root(); },
      get title() { return st.title; },
      set title(v) { st.title = String(v); st.state.textContent = `live · title "${st.title}"`; },
      get readyState() { return 'complete'; },
      get defaultView() { return window; },
    };
  }
  function stageTimers(st) {
    const track = (id) => { st.timers.add(id); return id; };
    const untrack = (id) => { st.timers.delete(id); };
    return {
      setTimeout(fn, ms) { const args = Array.prototype.slice.call(arguments, 2); const id = window.setTimeout(function () { untrack(id); fn.apply(null, args); }, ms); return track(id); },
      setInterval(fn, ms) { const args = Array.prototype.slice.call(arguments, 2); return track(window.setInterval(function () { fn.apply(null, args); }, ms)); },
      clearTimeout(id) { untrack(id); window.clearTimeout(id); },
      clearInterval(id) { untrack(id); window.clearInterval(id); },
    };
  }
  function stopTimers(st) {
    const n = st.timers.size;
    st.timers.forEach((id) => { window.clearInterval(id); window.clearTimeout(id); });
    st.timers.clear();
    return n;
  }
  function freshRoot(st) {
    const next = doc.createElement('div');
    next.className = 'stage-root';
    next.setAttribute('data-stage-root', '');
    next.setAttribute('tabindex', '0');
    next.setAttribute('aria-label', st.root.getAttribute('aria-label') || 'Live stage');
    next.appendChild(st.template.content.cloneNode(true));
    st.root.replaceWith(next);
    st.root = next;
  }
  function stageFor(name) {
    if (stages.has(name)) return stages.get(name);
    const box = $(`.stage[data-stage="${CSS.escape(name)}"]`);
    if (!box) return null;
    const st = { name, box, root: $('[data-stage-root]', box), template: $('[data-stage-template]', box), state: $('[data-stage-state]', box), title: '', run: null, timers: new Set() };
    st.api = Object.assign({ document: stageDocument(st), console: stageConsole(st) }, stageTimers(st));
    // A form that submits without preventDefault() would reload the lesson page. Catch it on the
    // box (after the stage's own listeners have run) and say so — that is the lesson, not a crash.
    on(box, 'submit', (ev) => {
      if (ev.defaultPrevented) return;
      ev.preventDefault();
      if (st.run) appendOut(st.run, 'The form submitted without event.preventDefault(): in your own page the browser would have reloaded here and thrown away every variable. Stopped it on this page.', 'err');
    });
    stages.set(name, st);
    return st;
  }
  window.__dtcStage = function (name) {
    const st = stageFor(name);
    if (!st) throw new Error(`no stage named "${name}" on this page`);
    return st.api;
  };
  function runLive(btn) {
    const name = btn.getAttribute('data-stage');
    const st = stageFor(name);
    if (!st) return;
    const fig = btn.closest('.code');
    const out = $('.code-out', fig);
    const body = $('.code-out-body', out);
    out.hidden = false; body.textContent = '';
    btn.classList.add('is-running');
    const leaked = stopTimers(st);
    freshRoot(st);
    st.title = '';
    st.state.textContent = 'loading…';
    st.run = { btn, body, ok: btn.getAttribute('data-ok') || '', sawOk: false };
    const src = btn.getAttribute('data-live');
    appendOut(st.run, `$ live ${src.slice(src.lastIndexOf('/') + 1)} → stage "${name}"`, 'dim');
    if (leaked) appendOut(st.run, `stopped ${leaked} timer${leaked === 1 ? '' : 's'} the previous run left ticking (your own page would not do this for you)`, 'dim');
    const sc = doc.createElement('script');
    sc.type = 'module';
    sc.src = `${src}?r=${++liveSeq}`;
    sc.setAttribute('data-live-stage', name);
    const finish = (ok, msg) => {
      btn.classList.remove('is-running');
      st.state.textContent = ok ? 'live · click, type, watch' : 'error';
      st.box.classList.toggle('is-live', ok);
      st.box.classList.toggle('is-failed', !ok);
      appendOut(st.run, msg, ok ? 'ok' : 'err');
      sc.remove();
      if (ok) st.root.focus({ preventScroll: true });
    };
    sc.addEventListener('load', () => {
      if (st.run.ok && !st.run.sawOk) finish(false, `✓ loaded, but "${st.run.ok}" was not printed`);
      else finish(true, '✓ the stage above is live: this panel keeps logging while you use it');
    });
    sc.addEventListener('error', () => finish(false, `Could not load ${src}`));
    doc.head.appendChild(sc);
  }
  // Uncaught errors in a live file (on load, or later inside one of its handlers) go to its panel.
  on(window, 'error', (ev) => {
    const file = ev.filename || '';
    if (!file.includes('/assets/live/')) return;
    const name = file.slice(file.lastIndexOf('/') + 1).replace(/\.js(\?.*)?$/, '');
    const st = stages.get(name);
    if (!st || !st.run) return;
    appendOut(st.run, `${ev.message}${ev.lineno ? ` (line ${Math.max(1, ev.lineno - 4)})` : ''}`, 'err');
    st.state.textContent = 'error';
    st.box.classList.add('is-failed');
  });

  /* ---------- try-it-first gate (remembered per page) ---------- */
  const gate = $('.gate[data-gate]');
  const solution = $('#solution');
  if (gate && solution) {
    const key = `dtc:gate:${gate.getAttribute('data-gate')}`;
    const reveal = (remember) => {
      solution.classList.remove('is-hidden');
      gate.classList.add('is-done');
      if (remember) store.set(key, '1');
    };
    const conceal = () => { solution.classList.add('is-hidden'); gate.classList.remove('is-done'); store.del(key); };
    if (store.get(key) === '1') reveal(false);
    on(gate, 'click', (ev) => {
      const b = ev.target.closest('[data-reveal]');
      if (!b) return;
      reveal(true);
      solution.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
    on(solution, 'click', (ev) => { if (ev.target.closest('[data-hide]')) { conceal(); gate.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); } });
  }

  /* ---------- which-pattern-when strip (home) ---------- */
  const strip = $('#pattern-strip');
  if (strip) {
    const input = $('#pattern-filter');
    const rows = $$('.strip-row:not(.strip-empty)', strip);
    const count = $('#pattern-count');
    const empty = $('#pattern-empty');
    const more = $('#pattern-more');
    const total = rows.length;
    // The filter key is the tell plus the pattern chips, read from the row itself (no duplicated data attribute).
    const tells = rows.map((r) => ({ row: r, tell: $('.tell', r), text: $('.tell', r).textContent, key: `${$('.tell', r).textContent} ${$$('.pattern-cell .chip', r).map((c) => c.textContent).join(' ')}`.toLowerCase() }));
    let expanded = false;
    function render() {
      const q = (input.value || '').trim().toLowerCase();
      let shown = 0;
      strip.classList.toggle('show-all', expanded || !!q);
      for (const t of tells) {
        const hit = !q || t.key.includes(q);
        t.row.hidden = !hit;
        if (hit) shown++;
        if (q && hit) {
          const i = t.text.toLowerCase().indexOf(q);
          t.tell.innerHTML = i >= 0 ? `${esc(t.text.slice(0, i))}<mark>${esc(t.text.slice(i, i + q.length))}</mark>${esc(t.text.slice(i + q.length))}` : esc(t.text);
        } else if (t.tell.innerHTML !== esc(t.text)) t.tell.textContent = t.text;
      }
      if (count) count.textContent = q ? `${shown} OF ${total} ROWS` : `${total} ROWS`;
      if (empty) empty.hidden = shown > 0;
      if (more) { more.hidden = !!q; more.textContent = expanded ? 'Show fewer' : `Show all ${total} rows`; }
    }
    on(input, 'input', render);
    on(input, 'keydown', (ev) => { if (ev.key === 'Escape') { input.value = ''; render(); input.blur(); } });
    on(more, 'click', () => { expanded = !expanded; render(); if (!expanded) strip.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); });
    render();
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }

  /* ---------- misc ---------- */
  // External links open in a new tab with rel noopener (content came from markdown).
  $$('main a[href^="http"]').forEach((a) => { if (a.host !== location.host) { a.target = '_blank'; a.rel = 'noopener'; } });
  // Lang switcher / tree: keep current in view horizontally on mobile.
  const curLang = $('.lang-switch a.is-current, .lang-switch a[aria-current]');
  if (curLang && curLang.scrollIntoView) curLang.scrollIntoView({ block: 'nearest', inline: 'center' });
  // Hash on load: offset for the fixed nav.
  if (location.hash) {
    const t = doc.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) setTimeout(() => window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(html).getPropertyValue('--nav-h')) || 64) - 24 }), 0);
  }
})();
