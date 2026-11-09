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

  /* Examples execute in an opaque-origin frame, never in the lesson document.
     Only build-approved sources are fetched; communication uses a private MessagePort. */
  const activeExamples = new Map();
  let approvedSources;
  function scriptVersion() { const s = $('script[src^="/app.js"]'); const m = s && s.getAttribute('src').match(/\?v=[^&]+/); return m ? m[0] : ''; }
  function appendOut(r, text, level) {
    if (typeof text !== 'string') return;
    text = text.slice(0, 8000);
    if (r.ok && text.includes(r.ok)) { r.sawOk = true; level = 'ok'; }
    if (r.body.childElementCount >= 250) r.body.firstElementChild.remove();
    const line = doc.createElement('div');
    if (level && level !== 'log') line.className = level === 'warn' ? 'dim' : level === 'ok' ? 'ok' : 'err';
    line.textContent = text;
    r.body.appendChild(line); r.body.scrollTop = r.body.scrollHeight;
  }
  async function approvedSource(src, mode) {
    const target = new URL(src, location.href);
    if (target.origin !== location.origin || target.search || target.hash) throw new Error('This example source is not approved.');
    if (!approvedSources) approvedSources = fetch('/runner-sources.json' + scriptVersion(), {credentials:'omit'}).then(r => { if (!r.ok) throw new Error('Could not load example list.'); return r.json(); }).catch(e => { approvedSources = null; throw e; });
    const approved = await approvedSources;
    if (!Object.hasOwn(approved, target.pathname) || approved[target.pathname] !== mode) throw new Error('This example source is not approved.');
    const response = await fetch(target.pathname, {credentials:'omit'});
    if (!response.ok) throw new Error('Could not load the example.');
    const code = await response.text();
    if (code.length > 500000) throw new Error('Example exceeds the size limit.');
    return code;
  }
  function runInWorker(btn) { launchExample(btn, 'worker'); }
  function runLive(btn) { launchExample(btn, 'live'); }
  async function launchExample(btn, mode) {
    if (btn.classList.contains('is-running')) return;
    const fig = btn.closest('.code'); const out = $('.code-out', fig); const body = $('.code-out-body', out);
    const name = btn.getAttribute('data-stage');
    const box = mode === 'live' ? $(`.stage[data-stage="${CSS.escape(name)}"]`) : null;
    if (mode === 'live' && !box) return;
    const src = btn.getAttribute(mode === 'live' ? 'data-live' : 'data-run');
    const previous = activeExamples.get(btn); if (previous) previous();
    const r = {btn, body, ok:btn.getAttribute('data-ok') || '', sawOk:false};
    body.textContent = ''; out.hidden = false; btn.classList.add('is-running');
    if (box) { box.classList.remove('is-live','is-failed'); $('[data-stage-state]',box).textContent = 'loading isolated example…'; }
    let frame, port, timeout, expiry, disposed = false;
    const cleanup = () => { disposed = true; clearTimeout(timeout); clearTimeout(expiry); window.removeEventListener('message',ready); if (port) port.close(); if (frame) frame.remove(); if (box) $('[data-stage-root]',box).hidden = false; btn.classList.remove('is-running'); if (activeExamples.get(btn) === cleanup) activeExamples.delete(btn); };
    const fail = text => { appendOut(r,text,'err'); if (box) { box.classList.add('is-failed'); box.classList.remove('is-live'); $('[data-stage-state]',box).textContent = 'stopped · run again to reset'; } cleanup(); };
    let payload;
    const ready = ev => {
      if (disposed || !frame || ev.source !== frame.contentWindow || ev.origin !== 'null' || !ev.data || ev.data.type !== 'runner-ready') return;
      window.removeEventListener('message',ready);
      const channel = new MessageChannel(); port = channel.port1;
      let received = 0;
      port.onmessage = event => {
        const m = event.data;
        if (disposed || !m || typeof m !== 'object') return;
        if (++received > 2500) { fail('Stopped: this example exceeded its message limit.'); return; }
        if (m.type === 'log' && typeof m.text === 'string') appendOut(r,m.text,m.level);
        if (m.type === 'size' && box && Number.isFinite(m.height)) frame.style.height = Math.min(1400,Math.max(100,m.height)) + 'px';
        if (m.type === 'error') fail(typeof m.text === 'string' ? m.text : 'The example stopped.');
        if (m.type === 'done') {
          clearTimeout(timeout); btn.classList.remove('is-running');
          if (r.ok && !r.sawOk) { fail('The example did not print its expected result.'); return; }
          appendOut(r,mode === 'live' ? '✓ isolated example is live · click, type, watch' : '✓ finished in the isolated runner','ok');
          if (box) { box.classList.add('is-live'); $('[data-stage-state]',box).textContent = 'isolated · click, type, watch'; }
          else cleanup();
        }
      };
      frame.contentWindow.postMessage({type:'runner-start',...payload},'*',[channel.port2]);
    };
    activeExamples.set(btn,cleanup);
    timeout = setTimeout(() => fail('Stopped after 15 seconds. Run again to reset the example.'),15000);
    try {
      const code = await approvedSource(src,mode);
      const engine = mode === 'worker' ? await fetch('/worker.js' + scriptVersion(),{credentials:'omit'}).then(r=>{if(!r.ok)throw new Error('Runner unavailable.');return r.text();}) : '';
      if (disposed) return;
      payload = {mode,code,engine,src,name,html:box ? $('[data-stage-template]',box).innerHTML : ''};
      frame = doc.createElement('iframe'); frame.className = 'example-sandbox'; frame.title = mode === 'live' ? `Interactive example: ${name}` : 'Isolated code runner';
      frame.setAttribute('sandbox','allow-scripts'); frame.setAttribute('referrerpolicy','no-referrer');
      frame.setAttribute('allow',"camera 'none'; microphone 'none'; geolocation 'none'; clipboard-read 'none'; clipboard-write 'none'; payment 'none'; usb 'none'");
      frame.src = '/sandbox/runner';
      window.addEventListener('message',ready);
      if (box) { const current = $('[data-stage-root]',box); current.hidden = true; current.after(frame); }
      else { frame.hidden = true; fig.appendChild(frame); }
      appendOut(r,`Running ${src.split('/').pop()} in an isolated example…`,'dim');
      if (box) expiry = setTimeout(() => fail('Example paused after five minutes. Run again to start fresh.'),300000);
    } catch (e) { if (!disposed) fail(e.message); }
  }
  window.addEventListener('pagehide',()=>{for(const stop of [...activeExamples.values()])stop();});

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

  /* Video permission is per player and per page visit; it is never remembered. */
  doc.addEventListener('click', event => {
    const load = event.target.closest('[data-video-load]');
    const unload = event.target.closest('[data-video-unload]');
    if (load || unload) {
      const card = (load || unload).closest('[data-video]');
      const preview = $('.video-preview',card);
      const disconnect = $('[data-video-unload]',card);
      if (unload) { const frame = $('iframe',card); if(frame)frame.remove(); preview.hidden = false; disconnect.hidden = true; $('[data-video-load]',card).focus(); return; }
      const id = card.getAttribute('data-video');
      if (!/^[A-Za-z0-9_-]{11}$/.test(id) || $('iframe',card)) return;
      const frame = doc.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${id}`;
      frame.title = $('h2',card).textContent;
      frame.setAttribute('allow','encrypted-media; picture-in-picture; fullscreen');
      frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-presentation');
      frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
      frame.setAttribute('allowfullscreen','');
      preview.hidden = true; preview.after(frame); disconnect.hidden = false;
      frame.focus();
    }
    const reset = event.target.closest('[data-clear-preferences]');
    if (reset) {
      try {
        const keys = Object.keys(localStorage).filter(k=>k.startsWith('dtc:gate:'));
        keys.forEach(k=>localStorage.removeItem(k));
        $('[data-privacy-status]').textContent = 'Saved solution-reveal preferences cleared on this browser. YouTube data is managed separately in your browser settings.';
      } catch { $('[data-privacy-status]').textContent = 'Browser storage is unavailable. No preferences were changed.'; }
    }
  });
})();
