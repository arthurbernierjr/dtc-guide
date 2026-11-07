# Super Coder — the path & library

**I Respawned As A Super Coder In A World With AI**, by Arthur Bernier Jr (Big Poppa Code). A static programming guide served by Express, with a sequential curriculum, searchable reference library, runnable JavaScript, live browser demonstrations, and simulated terminals.

The current build contains **289 pages**: the original 226-page library/global site, the path index, and **all 62 published sessions across 12 units and 21 weeks**. Every scheduled lesson is complete, including Session 2.5 and Units 4–12. The new lessons include 123 teaching figures in two responsive crops, 41 runnable browser checkpoints, guided practice, independent work, side quests, and manual verification instructions.

## Run locally

Use Node 24 or later with the Node permission-model flags supported by the tests.

```bash
cd website
npm ci
npm run build
npm start
```

Open http://localhost:31803. `PORT` overrides the default. The existing local PM2 process is named `dtc-guide` and serves this directory. No Git repository is initialized in this checkout.

Builds also read the existing sibling directories `../../../../complete-intro-to-computer-science` and `../../../../_scratchbox/prep` relative to `website/build/`. The exact paths are in `website/build/sources.config.js`. Those sources are read-only. A runtime deployment only needs `website/public/`, `server.js`, `build/site.config.js`, the package files, and production dependencies; it does not need the source repositories or diagram tooling.

## Verification

```bash
cd website
npm test
npm run test:ui
npm run screenshots
npm audit --omit=dev
```

The full test command rebuilds the site and runs eleven gates: build, registry, links, prep, live, UI, code blocks, AlgoCasts, search, verification ledger, and asset budgets. Playwright Chromium must be installed (`npx playwright install chromium`). `DTC_DEV=1` and `DTC_SKIP=` are development aids; release checks use neither.

The UI gate checks 48 pages at 1440, 834, and 390 pixels, keyboard search, mobile-menu focus restoration, language-step scrolling, reduced-motion behavior, redirects, and real 404 responses. The live gate runs 25 browser stages twice and replays 29 terminal scripts containing 482 commands. AlgoCasts contributes 26 suites and 136 tests.

`website/content/verification.json` and `website/qa/VERIFICATION.md` record 279 content pages (search and 404 are exempt). A ledger entry is coverage, not proof that every language example ran. **28 backend-language pages remain marked `exec: not run`** (the intro, oop, routing and models pages of the Ruby, Go, Java, C#, PHP, Rust and Dart tracks). The eight api pages are `exec: ran`: each one's code is the example repo deployed on Railway and checked by `website/scripts/check-todos-api.mjs`. The Angular CLI finding (F-001) remains open in `website/qa/findings.md`.

After changing content, build, run the relevant execution gates, regenerate the ledger, then run the full suite:

```bash
npm run build
npm run test:prep
npm run test:live
TZ=America/New_York npm run verify:ledger -- --who='Your name · verification scope'
npm test
```

For a new page without a ledger entry, use `DTC_DEV=1 npm run build` once to create the manifest before verification. Do not use that flag for the final suite.

## Authoring and diagrams

- `SITEMAP-AND-USER-STORIES.md` is the page registry and acceptance contract.
- `DESIGN-REFERENCE-RESPAWN.md` extends and overrides the original design reference.
- `website/content/path/path.json` contains the schedule and side-quest mappings.
- `website/content/path/sessions/` contains published lessons with metadata, diagrams and runnable demos.
- `website/content/path/diagrams.json` contains diagram descriptions and captions.
- `website/build/` contains the generator, templates, clients and test gates. Edit these sources, then rebuild; `public/` is generated.
- `diagrams/` contains the Remotion compositions. `REMOTION_BROWSER` can override the existing local Chromium executable configured in `remotion.config.ts`.

```bash
cd diagrams
npm ci
npm run stills -- session-2-4
./node_modules/.bin/tsc --noEmit
cd ../website
npm run build
```

Stills generate wide and tall crops, plus an updated path map. New lessons need a registry table row and detailed block, accurate section totals, diagram ledger entries, rendered assets, side quests, and verification coverage in the same change.

## Completed integration — November 4, 2026

- Published Session 2.4, Enchantments: five responsive diagrams, four runnable browser stages, three linked side quests, and verification coverage.
- Loaded session card metadata before page rendering, fixing undefined diagram counts, default reading times and missing hooks on the home/path pages.
- Fixed tablet toolbar overflow and mobile language-step overflow; restored the specified three-plus-two mobile statistics layout.
- Added browser regression checks and reduced-motion support to the lift demonstration.
- Corrected discrete-transition and animation-fill-mode explanations using the linked MDN references; made the image-fit diagram demonstrate actual cover/contain behavior.
- Rebuilt generated output and retained the existing content-verification limitations explicitly.

## Completed curriculum — November 5, 2026

- Completed Session 2.5 and every session in Units 4–12, preserving the existing lessons.
- Added 123 authored figures with wide/tall crops and 41 executable browser checkpoints.
- Adapted the original local Full Stack Founder curriculum into the site’s eight-beat lesson structure, with current boundary checks and explicit manual integration steps.
- Extended browser coverage to every new lesson and made all 62 published sessions a regression requirement.
- Left language-toolchain installation and external account setup to the learner.

## Production launch

The configured canonical origin is `https://guide.bigpoppacode.io` in `website/build/site.config.js`. Confirm the destination before deploying; rebuild if the origin changes. No public deployment, DNS change, TLS setup or social-preview scrape was performed in this pass.

Run Express with `NODE_ENV=production` behind the deployment's TLS reverse proxy. HSTS belongs at that proxy. Page CSP, worker-scoped evaluation, source-file text responses, security headers, and real 404 handling are implemented in `server.js` and checked by the suite. Do not expose a development build or use a verification bypass for release.

## Example repos and the Todos contract

Every backend side quest builds the same API, and every frontend guide consumes it. The contract (no trailing slashes; objects exactly `{id, subject, details}`; `GET /health`; JSON `{"error"}` bodies on 400 and 404; `DELETE` answers 204; CORS open to any origin) is stated on each api page and checked by:

```bash
node website/scripts/check-todos-api.mjs https://your-api.up.railway.app
```

Example code lives in `github.com/arthurbernierjr/dtc-*`: eight backends (`dtc-python-api`, `dtc-ruby-api`, `dtc-go-api`, `dtc-java-api`, `dtc-cs-api`, `dtc-php-api`, `dtc-rust-api`, `dtc-dart-api`), four frontends (`dtc-react`, `dtc-vue`, `dtc-svelte`, `dtc-angular`), the Unit 4 guild hall (`dtc-guild-hall`), the Unit 2 landing page and Unit 3 game (`dtc-landing`), and the atelier page (`dtc-atelier`). Each is deployed on Railway from the owner's account; the live URLs are on the pages. Local clones sit in `~/code/dtc-apps/`. The deploy-and-verify loop for a backend is: edit, `railway up -p <project> -s api -e production --detach -y`, wait for SUCCESS, run `check.mjs` against the domain, then commit and push.

## Attribution

The site retains Brian Holt / Frontend Masters lessons (CC BY-NC 4.0 content; Apache-2.0 code), the pinned Stephen Grider AlgoCasts fork (GPL-3.0), and Arthur Bernier Jr's original lessons and reference material. Credits, license text, and per-page source attribution ship with the site. See `/credits/` and the original source information in the design and test documents.

## Manual toolchain setup

Language runtimes, compilers, databases, cloud accounts, Stripe, and AI-provider setup remain manual. This completion used the project’s existing packages and browser only. Browser checkpoints verify deterministic teaching models; they do not imply that external integrations or every local walkthrough were executed. Follow each lesson’s setup and verification steps when your environment is ready.
