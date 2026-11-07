// Resolve a _scratchbox/prep source with override precedence: content/overrides/prep/<rel> wins when present,
// the same rule the polyglot, mindset and atelier pages already follow. The sibling prep folder is never edited.
const fs = require('fs');
const path = require('path');
const S = require('../sources.config');

function prepSource(rel) {
  const ov = path.join(S.OVERRIDES, 'prep', rel);
  if (fs.existsSync(ov)) return { abs: ov, override: true };
  return { abs: path.join(S.PREP, rel), override: false };
}

module.exports = { prepSource };
