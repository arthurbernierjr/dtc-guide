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

