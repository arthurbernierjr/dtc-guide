// 03 — JavaScript changes state; CSS describes the appearance.
const nav = document.querySelector('.site-nav');
const menu = document.querySelector('#menu');
const menuButton = document.querySelector('#menu-button');
function updateNav() { nav.classList.toggle('scrolled', scrollY > 16); }
addEventListener('scroll', updateNav, { passive: true });
updateNav();
menuButton.addEventListener('click', () => {
  menu.showModal();
  menuButton.setAttribute('aria-expanded', 'true');
});
document.querySelector('#close-menu').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => menuButton.setAttribute('aria-expanded', 'false'));
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.close();
    document.querySelector(link.hash)?.focus({ preventScroll: true });
  });
});
matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches && menu.open) menu.close();
});
menuButton.hidden = false;
document.documentElement.classList.add('enhanced');

// 07 — Content is visible unless a working observer can reveal it.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const reveals = [...document.querySelectorAll('.reveal')];
let observer;
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });
  reveals.forEach(element => { element.classList.add('is-pending'); observer.observe(element); });
}
reducedMotion.addEventListener('change', event => {
  if (!event.matches) return;
  observer?.disconnect();
  reveals.forEach(element => element.classList.remove('is-pending'));
});
const pause = document.querySelector('#pause-motion');
pause.hidden = false;
pause.addEventListener('click', () => {
  const paused = document.body.classList.toggle('motion-paused');
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Resume marquee' : 'Pause marquee';
});

// 08a — Optional gate. The page is usable before this script runs.
const gate = document.querySelector('#gate');
const previewGate = document.querySelector('#preview-gate');
const enterGate = document.querySelector('#enter-gate');
previewGate.hidden = false;
previewGate.addEventListener('click', () => { gate.classList.remove('is-leaving'); gate.showModal(); });
enterGate.addEventListener('click', () => {
  enterGate.disabled = true;
  gate.classList.add('is-leaving');
  let finished = false;
  let timer;
  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    gate.removeEventListener('transitionend', onTransition);
    gate.removeEventListener('close', finish);
    if (gate.open) gate.close();
    enterGate.disabled = false;
  }
  function onTransition(event) {
    if (event.target === gate && event.propertyName === 'opacity') finish();
  }
  gate.addEventListener('transitionend', onTransition);
  gate.addEventListener('close', finish, { once: true });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
  else timer = setTimeout(finish, 550);
});

// 08b — Keep the normal pointer; this ring is decoration.
const cursorButton = document.querySelector('#cursor-button');
const dot = document.querySelector('.cursor-dot');
const finePointer = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
function syncCursor() {
  cursorButton.hidden = !finePointer.matches;
  if (!finePointer.matches) {
    document.body.classList.remove('cursor-on');
    cursorButton.setAttribute('aria-pressed', 'false');
  }
}
finePointer.addEventListener('change', syncCursor);
syncCursor();
cursorButton.addEventListener('click', () => {
  const enabled = document.body.classList.toggle('cursor-on');
  cursorButton.setAttribute('aria-pressed', String(enabled));
});
addEventListener('pointermove', event => {
  if (!document.body.classList.contains('cursor-on')) return;
  dot.style.translate = `${event.clientX}px ${event.clientY}px`;
});

// 08c — A local tone, started only by a click.
const audio = document.querySelector('#tone');
const soundButton = document.querySelector('#sound-button');
const soundStatus = document.querySelector('#sound-status');
soundButton.hidden = false;
function syncSound() {
  soundButton.setAttribute('aria-pressed', String(!audio.paused));
  soundButton.textContent = audio.paused ? 'Play sample tone' : 'Stop sample tone';
}
audio.addEventListener('play', syncSound);
audio.addEventListener('pause', syncSound);
audio.addEventListener('ended', syncSound);
soundButton.addEventListener('click', async () => {
  if (!audio.paused) { audio.pause(); return; }
  soundStatus.textContent = '';
  audio.currentTime = 0;
  try { await audio.play(); }
  catch { soundStatus.textContent = 'Audio could not play. The rest of the page still works.'; syncSound(); }
});
