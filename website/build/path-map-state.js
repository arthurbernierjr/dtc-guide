// Only map-relevant curriculum data belongs in the rendered-image fingerprint.
const { createHash } = require('node:crypto');
function pathMapSignature(data, written) {
  const state = {
    weeks: Array.isArray(data.weeks) ? data.weeks.length : data.weeks,
    acts: data.acts.map(a => ({ id: a.id, name: a.name, color: a.color, units: a.units })),
    sessions: data.sessions.map(s => ({ id: s.id, week: s.week, unit: s.unit, written: written.includes(s.id) })),
  };
  return createHash('sha256').update(JSON.stringify(state)).digest('hex');
}
module.exports = { pathMapSignature };
