// Where the source material lives. Sibling repos (Holt, prep) are read-only; nothing here is ever edited by the build.
const path = require('path');

const OBELISK = path.resolve(__dirname, '..', '..', '..', '..');
const WEBSITE = path.resolve(__dirname, '..');

module.exports = {
  OBELISK,
  WEBSITE,
  PUBLIC: path.join(WEBSITE, 'public'),
  CONTENT: path.join(WEBSITE, 'content'),
  OVERRIDES: path.join(WEBSITE, 'content', 'overrides'),
  QA: path.join(WEBSITE, 'qa'),
  REGISTRY: path.resolve(WEBSITE, '..', 'SITEMAP-AND-USER-STORIES.md'),

  HOLT: path.join(OBELISK, 'complete-intro-to-computer-science'),
  HOLT_LESSONS: path.join(OBELISK, 'complete-intro-to-computer-science', 'lessons'),
  HOLT_STATIC: path.join(OBELISK, 'complete-intro-to-computer-science', 'static'),

  PREP: path.join(OBELISK, '_scratchbox', 'prep'),

  ALGOCASTS: path.join(WEBSITE, 'vendor', 'AlgoCasts'),
  ALGOCASTS_SHA: '30cf7634cb96bdd09b552f929e8450dccc1d5e96',
  ALGOCASTS_REPO: 'https://github.com/arthurbernierjr/AlgoCasts',

  // Arthur Bernier Jr's own teaching material (polyglot guides, mindset articles, the system design
  // primer, the React cheatsheet). Vendored into content/source/ so the site is self-contained.
  OWN: path.join(WEBSITE, 'content', 'source'),
  OWN_IMAGES: path.join(WEBSITE, 'content', 'source', 'mindset', 'images'),
  POLYGLOT: path.join(WEBSITE, 'content', 'source', 'polyglot'),
  DIGITAL_MANSION: path.join(WEBSITE, 'content', 'source', 'system-design', 'digital-mansion.md'),
  IMPOSTER_GUIDE: path.join(WEBSITE, 'content', 'source', 'mindset', 'knowing-what-you-are-talking-about.md'),
  REACT_CHEATSHEET: path.join(WEBSITE, 'content', 'source', 'polyglot', 'frontend', 'react-cheatsheet.md'),
  AUTHOR: 'Arthur Bernier Jr',
  AUTHOR_LINE: 'Arthur Bernier Jr (Big Poppa Code)',
};
