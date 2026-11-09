# Browser example security

Examples are approved at build time in runner-sources.json. The parent fetches only those source files and transfers code through a private MessageChannel to an iframe with sandbox="allow-scripts". The /sandbox/runner response independently applies CSP sandbox without allow-same-origin, including for direct navigation. Live modules and worker blobs run with opaque origins, no parent DOM/storage access, and CSP denying connections, external scripts, frames, forms and objects. Only bounded output and height messages are accepted by the parent. Regular JavaScript runs terminate after 12 seconds; live stages expire after five minutes or rerun.

This is for published, reviewed examples. Do not add arbitrary uploads or a public code-sharing service without a separate threat assessment. CSP blocks fetch/WebSocket/beacon and external resource loads; it is not an OS network firewall. A frame can still attempt navigation to URLs allowed by the parent frame-src policy (same-site, and YouTube only on Explained pages). Keep the sandbox route free of sensitive state and do not add authenticated actions to example endpoints. Browser sandboxes are not OS process/memory quotas; an infinite main-thread loop in a compromised live example can still hang its renderer. Browser/extension defects and compromised publishing infrastructure remain outside these controls.

The shell is an interpreter, not an eval wrapper. Commands, nesting, work, virtual files, filesystem size, output, history, patterns, seq ranges and Git diff matrices have limits. It rejects unsupported complex regular expressions instead of risking runaway backtracking.

## Development dependency advisory

The installed deepmerge 4.3.1 used by Jest is affected by GHSA-gcqx-w48m-w2h4. No patched registry release was listed at review time. scripts/patch-deepmerge.js applies a pinned, hash-checked mitigation to the CJS entry used by Jest: all three destination property assignments become own data-property definitions. It runs after installation, is idempotent, and fails on unknown upstream bytes. build/test/deepmerge-security.js tests hostile own __proto__ keys and normal behavior. npm audit still reports the original package version; the advisory is mitigated locally, not falsely marked absent. Production-only installs omit this development package. Revisit the patch when an upstream fix is released. Do not use --ignore-scripts for development installs without running the patch manually.

## Video privacy

Preview JPEGs are hosted locally. No YouTube iframe exists until that player's Load YouTube player button is activated. Permission is per player/page visit, is not persisted, and Disconnect player removes the iframe. External embeds may use storage and receive connection metadata after loading; removing the iframe cannot erase provider-owned data. /privacy/ discloses localStorage solution-reveal flags and production application logs, and clears only dtc:gate:* preferences. Hosting retention and jurisdiction-specific legal obligations need operator review; the page does not invent them.

Verification: npm run test:security, npm run test:live, npm run test:ui, node build/test/deepmerge-security.js, npm run test:algocasts, and the build/registry/link/verification/budget gates. No language toolchains are installed by these changes.
