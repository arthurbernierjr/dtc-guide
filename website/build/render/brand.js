// The name as a logo (DESIGN-REFERENCE-RESPAWN.md §R2): the struck word, the correction, the lockups and
// the session stamp. Every lockup is HTML text plus one inline SVG stroke; the pixel exports live in
// public/ and come from the Remotion project.
const site = require('../site.config');
const { escapeHtml } = require('./components');

/** The correction mark: <s>Magic</s> with the drawn strike, and <ins>AI</ins> over its corner. */
function mark(cls = '') {
  return `<span class="mark${cls ? ' ' + cls : ''}" aria-hidden="true"><s>Magic<svg viewBox="0 0 100 20" preserveAspectRatio="none" focusable="false"><path d="M3 12 C 25 9, 55 7, 97 9"/></svg></s><ins>AI</ins></span>`;
}

/** Nav / footer lockup (§R2.2). */
function brandLockup() {
  return `<a class="brand" href="/" aria-label="${escapeHtml(site.spoken)} — home">${mark('mark-nav')}<span class="brand-name" aria-hidden="true">${escapeHtml(site.shortName)}</span><span class="brand-sep" aria-hidden="true">/</span><span class="brand-guide" aria-hidden="true">${escapeHtml(site.guideLabel)}</span></a>`;
}

/** Cover lockup (§R2.1): the home H1. */
function coverLockup() {
  return `<h1 class="lockup" aria-label="${escapeHtml(site.spoken)}"><span class="lk-small" aria-hidden="true">I respawned as a</span><span class="lk-main" aria-hidden="true">Super Coder</span><span class="lk-small" aria-hidden="true">In a world with</span>${mark('mark-cover')}</h1>`;
}

/**
 * Session stamp (§R2.4). size: 'lg' 120 · 'md' 72 · 'sm' 28. state: written | empty.
 * The colour is the unit's act colour, set as a CSS variable on the element.
 */
function stamp(session, size = 'md') {
  const empty = !session.written;
  return `<span class="stamp stamp-${size}${empty ? ' is-empty' : ''}" style="--unit:var(--${session.color});--unit-rgb:var(--${session.color}-rgb)" aria-hidden="true">${size === 'sm' ? '' : '<span class="stamp-word">Session</span>'}<span class="stamp-num">${escapeHtml(session.id)}</span></span>`;
}

module.exports = { mark, brandLockup, coverLockup, stamp };
