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

