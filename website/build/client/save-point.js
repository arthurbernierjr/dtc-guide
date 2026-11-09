/* One explicitly chosen bookmark, stored on this browser. Never a completion record. */
(() => {
  'use strict';
  const KEY = 'dtc:save-point:v1';
  const card = document.querySelector('[data-save-card]');
  const buttons = [...document.querySelectorAll('[data-save-lesson]')];
  const clearButtons = [...document.querySelectorAll('[data-clear-save]')];
  const statuses = [...document.querySelectorAll('[data-save-status]')];
  if (!card && !buttons.length && !clearButtons.length) return;
  const say = message => statuses.forEach(el => { el.textContent = message; });
  let lessons = [];
  let ready = false;
  function readSave() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try {
      const value = JSON.parse(raw);
      if (value && value.version === 1 && typeof value.lessonId === 'string' && typeof value.savedAt === 'string' && Number.isFinite(Date.parse(value.savedAt)) && lessons.some(s => s.id === value.lessonId)) return value;
    } catch { /* Invalid or obsolete data is not a navigation destination. */ }
    return null;
  }
  function update() {
    let saved;
    try { saved = readSave(); }
    catch { say('Browser storage is unavailable. You can still read every lesson.'); return; }
    const lesson = saved && lessons.find(s => s.id === saved.lessonId);
    if (card && lessons.length) {
      const current = lesson || lessons[0];
      card.style.setProperty('--unit',`var(--${current.color})`);
      card.style.setProperty('--unit-rgb',`var(--${current.color}-rgb)`);
      card.querySelector('.stamp').style.setProperty('--unit',`var(--${current.color})`);
      card.querySelector('.stamp').style.setProperty('--unit-rgb',`var(--${current.color}-rgb)`);
      card.querySelector('.stamp-num').textContent = current.id;
      card.querySelector('.rc-label').textContent = lesson ? 'Your save point' : 'Your adventure begins';
      card.querySelector('.chip.unit').textContent = `Unit ${current.unit} · Act ${current.act}`;
      card.querySelector('.rc-when').textContent = `Session ${current.position} of ${lessons.length} · ${current.read} min read`;
      const title = card.querySelector('.rc-title a'); title.textContent = current.title; title.href = current.url;
      card.querySelector('.rc-hook').textContent = lesson ? current.hook : 'Start at lesson 1.1. When you pause, choose Save my place on a lesson to return here later.';
      const link = card.querySelector('[data-resume]'); link.href = current.url; link.textContent = lesson ? 'Resume lesson →' : 'Begin lesson →';
      say(lesson ? `Saved ${new Date(saved.savedAt).toLocaleDateString()} · this browser only` : 'No save point yet · this browser only');
    } else say(lesson ? `Saved: ${lesson.id} · ${lesson.title}. This browser only.` : 'No save point yet. Saving replaces your previous bookmark.');
    for (const btn of buttons) btn.textContent = lesson && btn.dataset.saveLesson === lesson.id ? 'Update save point' : 'Save my place';
  }
  document.addEventListener('click', event => {
    const save = event.target.closest('[data-save-lesson]');
    const clear = event.target.closest('[data-clear-save]');
    if (!save && !clear) return;
    if (!ready && save) { say('The lesson list is still loading. Try again in a moment.'); return; }
    try {
      if (clear) {
        localStorage.removeItem(KEY);
        update(); say('Save point cleared. Your lesson preferences are unchanged.');
      } else {
        const lesson = lessons.find(s => s.id === save.dataset.saveLesson);
        if (!lesson) { say('This lesson cannot be saved.'); return; }
        localStorage.setItem(KEY, JSON.stringify({version:1,lessonId:lesson.id,savedAt:new Date().toISOString()}));
        update(); say(`Saved ${lesson.id} · ${lesson.title}. Return from the homepage on this browser.`);
      }
    } catch {
      say(clear ? 'Could not clear your save point. Check browser storage permissions.' : 'Could not save your place. Browser storage may be blocked or full.');
    }
  });
  window.addEventListener('storage', event => { if (event.key === KEY || event.key === null) update(); });
  window.addEventListener('pageshow', () => { if (ready) update(); });
  const script = document.querySelector('script[src^="/save-point.js"]');
  const version = script ? new URL(script.src).search : '';
  fetch('/save-lessons.json' + version, {credentials:'omit'}).then(response => {
    if (!response.ok) throw new Error('Lesson list unavailable');
    return response.json();
  }).then(data => {
    if (!Array.isArray(data) || !data.length) throw new Error('Invalid lesson list');
    lessons = data.filter(s => typeof s.id === 'string' && typeof s.title === 'string' && /^\/path\/[a-z0-9-]+\/$/.test(s.url) && ['green','yellow','red'].includes(s.color));
    if (!lessons.length) throw new Error('Invalid lesson list');
    ready = true;
    [...buttons,...clearButtons].forEach(button => { button.hidden = false; });
    update();
  }).catch(() => { clearButtons.forEach(button=>{button.hidden=false;});say('Save points could not load. Reload to try again; lessons are still available.'); });
})();
