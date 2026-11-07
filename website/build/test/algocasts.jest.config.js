// Jest config for the algocasts gate. The AlgoCasts clone under vendor/ is pinned and read-only;
// its own package.json asks for jest 26 (2020) whose dependency tree carries dozens of known
// vulnerabilities. Running the suites with the website's current jest means that tree never
// has to be installed — `cd vendor/AlgoCasts && npm ci` is no longer part of setup.
const S = require('../sources.config');

module.exports = {
  rootDir: S.ALGOCASTS,
  // Only completed_exercises/ — exercises/ holds the unimplemented stubs learners fill in.
  roots: ['<rootDir>/completed_exercises'],
  testMatch: ['**/test.js'],
  // Resolved from the website's node_modules explicitly — a bare 'node' would be looked up from
  // rootDir and could pick up a stale copy under vendor/.
  testEnvironment: require.resolve('jest-environment-node'),
  // Nothing under the clone needs transforming; skip babel-jest entirely.
  transform: {},
};
