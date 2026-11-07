---
editorial: true
title: Sprint 4 — Polish
subtitle: Bug hunt, the small states, a README you can run from, and the rehearsal take
hook: "The candidate is live. Sprint 4 hunts bugs as a stranger, gives every screen its loading, empty, and success sentences, adds the 404 page, writes a README someone can run from, and records the five-minute demo for the first time so you can watch it back before it counts."
read: 55
artifact: "A polished release, timed demo script, and tested presentation fallback"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.w3.org/WAI/tutorials/forms/labels/
  - https://www.w3.org/WAI/tutorials/page-structure/
  - https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/404
  - https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
  - https://obsproject.com/
say:
  - "Fix the dead end before the font. A beautiful screen that loses the record is worse than a plain one that keeps it."
  - "The demo is a script with a known account and known records. Live randomness is a bug you scheduled."
  - "A recording is evidence of a past run. Say so when you play it."
---

## The hook

`rc-1` is live, tested, attacked, backed up, and rolled back once. Sprint 4 is the last day you change code, and the rule is the opposite of Sprint 2: nothing new, only better. You open the live URL as a person who has never seen it, on a laptop and on a phone, and you write down everything that made you pause. You fix the three that matter most, each with a before and after screenshot. Then every screen gets the sentences it is missing: what it says while loading, what it says when there is nothing, what it says when the save landed, and what it says when the URL is wrong.

The second half is a different kind of work. The five-minute demo that 12-5 collects gets written as a script with timestamps, rehearsed aloud against a timer, and recorded once today on the deployed URL with the fixture account. You watch it back. You will hear yourself say "um, let me just" at the exact moment the spinner was longer than you remembered, and that is why today's take is a rehearsal and not the one that counts. By the end the README runs from a fresh clone, the deck matches the product, `rc-2` is tagged and live, and `docs/demo-script.md` has a line for every thirty seconds.

> *Polish is not the shine. It is removing the burr that catches the hand.*

## The idea

Polish is ordered by what it costs the user, not by what it costs you. The order is: dead ends, then wrong answers, then missing feedback, then layout, then decoration. A dead end is a screen the user cannot leave or a button that does nothing. A wrong answer is a total, a count, or a label that lies. Missing feedback is a save with no confirmation or a list with no empty sentence. Layout is the wrap, the overflow, and the button under the thumb. Decoration is the font and the shadow. A sprint that starts at the bottom of that list and runs out of time has polished a dead end.

The bug hunt is done as a stranger, which means a private window, the fixture account, a screen you did not design on, and a list of deliberate abuses: a title of four hundred characters, a body with `<b>` and an emoji in it, a double click on every button that sends something, the back button after a save, a protected URL pasted into a window with no session, and the Wi-Fi switched off between typing and saving. Each one is thirty seconds. Each one is a thing a real person will do in the first week, usually by accident.

Every screen has four sentences, and they are not decorations. Loading: a short line or a skeleton, never a blank. Empty: what this screen will hold and the one action that puts something in it. Success: what just happened, in the past tense, with the thing's name in it. Error: what failed and what to press. The `status` string from 12-2 already decides which one shows; today is checking that every list and every form has all four written, in words a person would say.

Two things live outside the app's screens and still belong to it. The 404: a path nobody mounted. The API already answers `{ "error": "no such path" }` from the 404 middleware at the end of `api/app.js` from 10-1; the client needs a page for the same event, because a pasted URL with a typo lands in the browser, not in curl. And the README: the first screen a reviewer sees, and the one that decides whether they can run the thing. A README is tested by cloning the repository into a new folder and following it with no memory.

The demo is a script. It uses the fixture account, the three seeded records, and a path you have walked fifty times. It does not create a record with a random name, does not call the real provider for the first time on camera, and does not depend on the one list being empty. The timeline fits in four and a half minutes, so a slow load does not push the ending off the edge. The recording is evidence of a past run, and when you play it instead of clicking live, you say that.

Napkin version: hunt as a stranger, fix three dead ends with before and after, write the four sentences on every screen, add the 404 page and a favicon and titles, make the README run from a fresh clone, retake the deck's screenshots, write the script with timestamps, record it once, watch it, tag `rc-2`, deploy.

![](diagram:session-12-4/fig1-model)

### The hunt, as a list

Copy this into `docs/polish-log.md` and fill it in as you go:

```markdown
## Bug hunt — <date>, against rc-1 on https://YOUR-APP.up.railway.app

| # | Screen | What I did | What happened | Cost (dead end / wrong / feedback / layout / decoration) | Fix? |
|---|---|---|---|---|---|
| 1 | | | | | yes / later |

## Fixed this sprint

### Fix 1 — <one line>
Before: docs/evidence/12-4-fix1-before.png
After: docs/evidence/12-4-fix1-after.png
Change: <file and the one-sentence description>
```

A filled row:

```markdown
| 3 | Dashboard | Pasted /dashboard into a window with no session | Blank white page, console says cannot read properties of null | dead end | yes |
| 7 | Entry form | 400-character title | Title overflows the card on the phone, save works | layout | later |
```

Row 3 is a fix today. Row 7 is a fix if the three dead ends are done, otherwise it goes in Known issues. The log is the deliverable, not the fixes; a reviewer reading it learns what you found and what you chose, which is the judgment they are grading.

### The 404 page and the two kinds of not-found

The API's 404 is JSON because its clients are programs. The client's 404 is a page because its clients are people. If your capstone uses React Router, the page is the last `<Route path="*">`. If it does not, and you have kept to the 4-11 shape of one `App` switching on state, the page is the branch for a `window.location.pathname` that none of your screens claim. Either way it has three things: a sentence that says the page does not exist, a link to the dashboard, and the same header as every other screen, so the user still knows where they are.

```jsx
export default function NotFound() {
  return (
    <main>
      <h1>There is no page here</h1>
      <p>The address may be mistyped, or the entry it pointed at was removed.</p>
      <p><a href="/">Back to your entries</a></p>
    </main>
  );
}
```

On Railway, the fallback you added to `api/app.js` in 10-4, which serves the built `index.html` for any path that does not start with `/api/`, is what lets a deep link reach the client at all; on the VPS, Nginx's `try_files $uri /index.html` from 6-4 does the same. The test is pasting `https://YOUR-APP.up.railway.app/nothing-here` into a fresh window and seeing your page, not the host's.

### Titles, favicon, and the four sentences

`client/index.html` has a `<title>` that still says the Vite default on many capstones. Change it to the product's name. Add a favicon: a 32-pixel PNG in `client/public/`, linked with `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">`. These are two minutes and they are the first two pixels a reviewer sees in the tab bar.

The four sentences are a pass over every component that fetches or sends. For each one, find the `status` and read the branch for each value aloud. If a branch renders nothing, write the sentence. If a branch renders the raw error object, write the sentence. The success sentence after a save names the thing: `Saved "Scout the ridge"`. The empty sentence names the action: `No entries yet. Write your first one above.` The loading sentence is short and does not apologize. The error sentence ends with what to press.

### The README someone can run from

```markdown
# <Product name>

One sentence: who it is for and what they get.

Live: https://YOUR-APP.up.railway.app — sign in with demo@example.com / demo-pass-1 to try it.

## Run it locally

Requires Node 24 or newer and a local MongoDB on 27017.

    git clone git@github.com:YOU/<capstone-name>.git
    cd <capstone-name>/api
    cp .env.example .env     # fill in every value
    npm install
    npm run seed
    node --env-file=.env server.js

In a second terminal:

    cd <capstone-name>/client
    npm install
    npm run dev

## Test it

    cd api && npm test
    npx playwright test        # from the repository root

## Deploy it

See docs/release-candidate.md for the candidate, the backup drill, and the rollback.

## Environment variables

| Name | Used for |
|---|---|
| MONGODB_URI | the database |
| JWT_SECRET | signing tokens |
| ... | ... |

## What is not finished

Three bullets, honest, from docs/release-candidate.md's Known issues.
```

The test of the README is the clone. `git clone` into `~/projects/readme-check`, follow the file with no memory, and note every step where you had to know something the file did not say. Delete the folder afterwards. The README is done when the clone runs the seed and the journey without a question.

### The script and the take

The script has a line per thirty seconds and a total under four and a half minutes:

```text
0:00  Name, product name, one sentence of who it is for.
0:15  The problem, in the persona's words from the empathy map in docs/research.md.
0:30  Screen share begins on the live URL, signed in as the fixture account.
0:45  The core flow: create the record, show it, reload, it is still there.
1:30  Feature two: the Should-have that makes the core flow worth it.
2:30  Feature three, or the failure path: switch the Wi-Fi off, save, show the draft survive, switch it on, retry.
3:30  Under the hood: one sentence of stack, one decision you made and why.
4:00  What is next: the one experiment from docs/next-quest.md, or the next Should-have.
4:30  The URL, the fixture credentials, thank you. Stop.
```

The failure path at 2:30 is the strongest thing you can show, because every reviewer has seen a thousand happy paths and ten that recover. Rehearse it twice before recording, because the moment the Wi-Fi comes back is the moment the retry has to land.

Recording tools you already have: on macOS, QuickTime Player's File menu has New Screen Recording; on Windows, the Game Bar opens with the Windows key and G and records the active window; on Linux, and on either of the others if you want a cursor highlight, [OBS Studio](https://obsproject.com/) is free and records to a file. Loom is fine if you already have an account; check its plan page for the length cap before you depend on it. The file goes nowhere near the repository; it is large and it is not code. Upload it unlisted to a video host you already use, or keep it as a file for now, and put the link in the README under "Demo" once 12-5 has the final take.

## The demonstration

One worked example, on the capstone from the last three sprints, in order. Nothing is running at the start.

The hunt first, on the live URL, in a private window, with the phone beside the laptop. Twenty minutes, ten rows in the log. Three are dead ends: the blank page on a protected route with no session; the Save button on the draft screen doing nothing when the adapter returns an empty summary, because the component branches on `summary.length` and the empty fixture never set `summary`; and the entry page after a delete, which stays on a record that no longer exists until you click away.

Fix one: the protected screen checks for a token before it renders and shows the sign-in screen when there is none, which is the same `status` branch as everything else: `signedOut` is a state, not an exception.

Fix two: the draft route already throws a 502 on an empty summary because `normalize` from 12-2 does; the component was reading `data.summary.length` before checking `status === 'error'`. Reorder the branches so the error sentence renders first.

Fix three: after a 204 from the delete, the parent removes the record from the list and switches the view back to the list. Before and after screenshots of each, named as the log says, and three commits named for the fix.

Then the sentences. Four components had a loading branch that returned `null`. Each one now returns a one-line paragraph. The list's empty branch said `No data`, which is a database word; it now says what to do. Then `index.html`'s title and a favicon, which is a two-minute diff. Then the 404 page, tested with a pasted URL on the phone.

Then the README, tested with a clone:

```bash
cd ~/projects
git clone git@github.com:YOU/<capstone-name>.git readme-check
cd readme-check/api
cp .env.example .env
```

The first question the file did not answer: what goes in `JWT_SECRET`? Any long random string, and the README now says so, with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` as the way to make one. The second: `npm run seed` failed because `.env` had no `MONGODB_URI`; the README now shows the local value, `mongodb://127.0.0.1:27017/<capstone-name>`, the same one 10-1 put in `api/.env`. The third run of the clone had no questions. `rm -rf ~/projects/readme-check`.

Then the deck. Every slide with a screenshot was taken in Unit 11 against the 10-4 build; they are retaken from the polished live URL at 1440 wide, dropped into the Google Slides deck linked from `docs/pitch-deck.md` or `docs/stakeholder-brief.md` in place of the old ones, `docs/pitch-deck.pdf` or `docs/stakeholder-brief.pdf` is exported again, and the slide that promised a feature the cut removed in 12-1 now describes the Should-have you shipped instead. The deck tells the truth about the product behind it.

Then the script, written, then read aloud against a timer twice. The first read was five minutes and twenty seconds; feature three was cut to the failure path alone, and the second read was four minutes and ten. Then the take: `npm run seed` against the live database first so the three records are the known three, private window, signed in, recording on, script beside the screen. Four minutes and twenty-five seconds. Watched back once. Note from the watch: the reload at 0:45 took three seconds and the narration went quiet; next time, say what the reload proves while it happens.

Then the tag and the deploy, the same way as 12-3:

```bash
cd ~/projects/<capstone-name>
git status --short
git tag rc-2 && git push origin rc-2
```

`git checkout rc-2 && railway up`, the way [10-4](/path/10-4-warding-the-kingdom/) and 12-3 did; or over ssh on the VPS, `git fetch --tags && git checkout rc-2 && ./deploy.sh`. Journey in a private window, journey on the phone. `docs/release-candidate.md` gets a second section headed `rc-2` with the sha, and the Jest and Playwright runs against it, because three fixes touched components the browser test walks.

Here is a small model you can run here. It times the script the way the rehearsal did and triages a bug list the way the log does. It proves that the timeline leaves room inside five minutes and that dead ends sort ahead of decoration. It does not record anything or open your live URL; the timer and the private window are yours.

```js run=checkpoint-12-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const script = [
  { at: 0, section: 'problem', seconds: 45 },
  { at: 45, section: 'journey', seconds: 150 },
  { at: 195, section: 'decision', seconds: 45 },
  { at: 240, section: 'next', seconds: 30 }
];
const total = script.reduce(function (sum, part) { return sum + part.seconds; }, 0);
check(total === 270, 'Four-and-a-half minute rehearsal');
check(total <= 300, 'Leave room inside a five-minute slot');
check(script.every(function (part, i) {
  return i === 0 || part.at === script[i - 1].at + script[i - 1].seconds;
}), 'each section starts where the previous one ends');

const COST = { 'dead end': 0, wrong: 1, feedback: 2, layout: 3, decoration: 4 };
const found = [
  { id: 7, cost: 'layout' },
  { id: 3, cost: 'dead end' },
  { id: 9, cost: 'decoration' },
  { id: 5, cost: 'feedback' },
  { id: 4, cost: 'dead end' }
];
const ordered = found.slice().sort(function (a, b) { return COST[a.cost] - COST[b.cost]; });
check(ordered[0].cost === 'dead end' && ordered[1].cost === 'dead end', 'dead ends are fixed before anything else');
check(ordered[ordered.length - 1].cost === 'decoration', 'decoration is last');

const sentences = { loading: 'Loading your entries', empty: 'No entries yet. Write your first one above.', success: 'Saved "Scout the ridge"', error: 'Could not save. Press Save to retry.' };
check(Object.keys(sentences).length === 4 && Object.values(sentences).every(function (s) { return s.length > 0; }), 'every screen has four sentences');

function label(kind) { return kind === 'live' ? 'live' : 'recording of an earlier run'; }
check(label('recording') !== 'live', 'a fallback is labelled as a fallback');

console.log('ok: checkpoint-12-4');
```

## Where it breaks

![](diagram:session-12-4/fig2-diagnosis)

### Cosmetics hide core defects

The spacing is perfect, the font is right, and the save still fails on an empty title with a blank screen. Polish on a broken path makes the broken path look intentional, so you stop seeing it, and the reviewer sees it first. The cause is starting at the bottom of the cost list because decoration is pleasant and dead ends are not. The fix is the log's cost column and its order: no layout or decoration row is touched while a dead end or a wrong answer is open. A plain screen that keeps the record is forgivable. A beautiful one that loses it is not usable.

### Demo relies on live randomness

The demo creates a record with whatever name comes to mind, the adapter is in `provider` mode for the first time that day, and the recording has forty seconds of a spinner you did not rehearse. The cause is treating the demo as a use of the app instead of a script. The fix is the fixture account, the seed run before recording, a known record name, the provider shown only after the scripted path has landed, and the failure path rehearsed with the Wi-Fi toggle until the retry lands every time. Randomness is a bug you scheduled for the worst minute.

### Backup presented as live

The live call fails during the take, you switch to yesterday's recording of it working, and you narrate it as if it were happening now. The cause is embarrassment, and the fix is one sentence spoken before the switch: "this is a recording of the same step from earlier today." A reviewer can respect a fallback and will not forgive a claim the video cannot support. The label is the professional part. The recovery is the thing being demonstrated.

## Your turn

In `~/projects/<capstone-name>`, against the live `rc-1`, with a phone beside you.

1. Create `docs/polish-log.md` from the template. Hunt for twenty minutes in a private window and on the phone, with the abuse list from the idea section. At least ten rows, each with a cost.
2. Fix the three highest-cost rows. For each: before screenshot, change, after screenshot, commit named for the fix. Verify each fix in a fresh private window and on the phone before you call it done.
3. Walk every component that fetches or sends and write the four sentences. Grep for `return null` inside a `status` branch; each hit becomes a sentence.
4. Add the 404 page, set `<title>` to the product name, add a favicon. Paste `https://YOUR-APP.up.railway.app/nothing-here` on the phone after deploy and see your page.
5. Rewrite the README from the template. Clone into `~/projects/readme-check`, follow it with no memory, fix the file for every question, repeat until a clone has no questions. Delete the folder.
6. Retake every screenshot in the Google Slides deck from the polished live URL and export `docs/pitch-deck.pdf` again, or `docs/stakeholder-brief.pdf` on the Village road. Change any slide that describes a feature the cut removed.
7. Write `docs/demo-script.md` with a line per thirty seconds, under four and a half minutes. Read it aloud against a timer twice. Seed, record once, watch it back, write three notes at the bottom of the script.
8. `git tag rc-2`, push, deploy with your existing path, walk the journey in a private window and on the phone. Rerun Jest and Playwright and add an `rc-2` section to `docs/release-candidate.md`.

If the recording is over five minutes, cut feature three before you cut the failure path. The failure path is the part reviewers remember.

## The quest

![](diagram:session-12-4/fig3-evidence)

The deliverable is `docs/demo-script.md` with its timestamps, the three notes from watching the rehearsal take, and a line at the top naming the tag it was recorded against. Beside it, `docs/polish-log.md` with its ten rows and three fixed entries.

Evidence to keep:

- `docs/polish-log.md` with the hunt table and three "Fixed this sprint" entries, each with `docs/evidence/12-4-fixN-before.png` and `-after.png`.
- The 404 page component, the `<title>`, and the favicon in `client/public/`, in one commit.
- The README, with a sentence in the polish log saying how many clone runs it took to have no questions.
- Retaken screenshots in the Slides deck linked from `docs/pitch-deck.md` or `docs/stakeholder-brief.md`, and a fresh `docs/pitch-deck.pdf` or `docs/stakeholder-brief.pdf`.
- `docs/demo-script.md` with the timeline and the three notes.
- The rehearsal recording as a file or an unlisted link, referenced from the script, labelled as the rehearsal take.
- The tag `rc-2` live on the URL, with its section in `docs/release-candidate.md`.

## Side quests

The grit sheet is for the hour when you have watched yourself say "um" nine times and want to skip the second take, and the State sheet is the reason the four sentences were a lookup on `status` rather than four new booleans.

## Before next session

Coronation Day is Wednesday, and it is yours alone: the final take of the demo on the live `rc-2`, the written Q&A, the self-scored rubric, the handoff packet in `docs/demo-day.md`, and a README and a post that say exactly what you built and no more. Before then, read the three notes at the bottom of your script once a day and do one more timed read-through; do not re-record yet. Open your 8-1 `docs/research.md` and pick the one person among P0 through P3 who said the thing your product does; their words open the final take.

Nothing runs on your machine between now and then. The live URL runs `rc-2`. Do not deploy anything else before the take; the recording and the tag must agree.
