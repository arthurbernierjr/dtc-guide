// One place to rename the site. The name is the logo: the world had magic, the word is crossed out
// and AI is written over it (DESIGN-REFERENCE-RESPAWN.md §R2). `name` is the plain-text form used in
// <title> and Open Graph tags; `spoken` is the accessible name every lockup carries.
module.exports = {
  name: 'I Respawned As A Super Coder In A World With AI',
  spoken: 'I respawned as a super coder in a world with magic, crossed out, corrected to AI',
  titleSuffix: 'I Respawned As A Super Coder',
  shortName: 'Super Coder',
  guideLabel: 'The path & library',
  signature: '— the respawn guide, by Big Poppa Code',
  author: 'Arthur Bernier Jr (Big Poppa Code)',
  // Shown on every page that is original material (the Creator card) and on /credits/.
  // Facts come from bigpoppacode.io/about; keep the two in step.
  authorBio: 'Arthur Bernier Jr — Big Poppa Code — is a software engineer, educator and entrepreneur: a former CTO at VC-backed startups and engineering lead at a billion-dollar company, mentor to 800+ engineers, now Senior Director of AI, Computer Programming and Cloud Computing at Per Scholas, and the host of the Deeper Than Code podcast.',
  origin: 'https://codecomeup.thelinkfor.me',
  themeColor: '#08080A',
  verifiedMonth: 'Nov 2026',
  links: {
    podcast: 'https://bigpoppacode.io/podcast',
    newsletter: 'https://bigpoppacode.io/newsletter',
    instagram: 'https://instagram.com/bigpoppacode',
    home: 'https://bigpoppacode.io/',
  },
  marquee: ['RESPAWNED', 'SUPER CODER', 'IN A WORLD WITH AI', 'THE PATH', 'SIDE QUESTS', 'BIG POPPA CODE'],
  // The path is the spine of the site; it sits before the library tracks in the nav and footer.
  path: { id: 'path', num: '00', title: 'The Path', nav: 'Path', url: '/path/', icon: 'flag',
    blurb: 'Each session points at its side quests.' },
  sections: [
    { id: 'algorithms', num: '01', title: 'Algorithms', url: '/algorithms/', icon: 'hash',
      blurb: 'Big O, sorting, searching, recursion, and the interview patterns.' },
    { id: 'data-structures', num: '02', title: 'Data Structures', nav: 'Data Structures', short: 'Data', url: '/data-structures/', icon: 'layers',
      blurb: 'Lists, hash maps, trees, heaps, tries, and graphs.' },
    { id: 'practice', num: '03', title: 'Practice', url: '/practice/', icon: 'play',
      blurb: 'AlgoCasts exercises, a try-it-first gate, and two project skeletons.' },
    { id: 'languages', num: '04', title: 'Languages', url: '/languages/', icon: 'globe',
      blurb: 'JavaScript, then eight more languages on the same five-step path.' },
    { id: 'system-design', num: '05', title: 'System Design', nav: 'System Design', short: 'Systems', url: '/system-design/', icon: 'book',
      blurb: 'The 45-minute framework, the numbers, and the walkthroughs.' },
    { id: 'patterns', num: '06', title: 'Design Patterns', nav: 'Patterns', url: '/patterns/', icon: 'code',
      blurb: 'All 23 Gang of Four patterns as runnable JavaScript.' },
    { id: 'security', num: '07', title: 'Security', url: '/security/', icon: 'shield',
      blurb: 'OWASP Top 10:2025, with the vulnerable line and the fix.' },
    { id: 'mindset', num: '08', title: 'Mindset', url: '/mindset/', icon: 'brain',
      blurb: 'Grit, and the four moves that make a skill yours.' },
    { id: 'atelier', num: '09', title: 'Atelier', nav: 'Atelier', short: 'CSS', url: '/atelier/', icon: 'layers',
      blurb: 'Build a polished portfolio with CSS, visual walkthroughs, and working examples.' },
    { id: 'explained', num: '10', title: 'Explained', nav: 'Explained', short: 'Video', url: '/explained/', icon: 'play',
      blurb: 'The series, with a writeup under each video.' },
  ],
};
module.exports.allSections = [module.exports.path, ...module.exports.sections];
