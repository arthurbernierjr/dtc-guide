---
editorial: true
title: Coronation Day
subtitle: The final take, the written Q&A, the self-scored rubric, and the handoff to yourself
hook: "Twenty weeks after the blinking cursor, you record the demo that counts on the live URL, answer the five questions a reviewer would ask, score your own capstone against a hundred points, and hand the product to the person who will run it next: you."
read: 55
artifact: "A final capstone handoff, demo retrospective, and measurable next-step plan"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.gov.uk/service-manual/agile-delivery/running-your-service-in-live
  - https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes
  - https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
  - https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile
  - https://keepachangelog.com/en/1.1.0/
say:
  - "Show the outcome, name the limit, link the evidence. That is the whole demo."
  - "A handoff is done when a stranger can run, test, back up, and roll back the app from the file alone."
  - "The portfolio describes what you did and verified. It is not a second pitch the code cannot support."
---

## The hook

Week 21, Wednesday. Twenty weeks ago the terminal was a dark window with a blinking rectangle in it. Today `rc-2` is live, tested against its own sha, attacked by a second account, backed up and restored, rolled back and forward, polished, and rehearsed once on camera. There is no audience in a room. There is a recording you make today that counts, a page of questions you answer in writing, a rubric you score honestly against yourself, and a handoff packet that lets the next person operate the app. The next person is you, next month, with the details already fading.

That is the shape of the day. Seed the fixture account on the live database, record the final take from the script you wrote on Tuesday, and watch it once. Write five questions a reviewer would ask and answer them from the implementation, with file names. Score the hundred points and write the number down with the evidence for each line. Put the release sha, the URL, the environment variable names, the run and test commands, the backup and restore commands, the known issues, and who watches it into `docs/demo-day.md`. Then send the recording and the deck or stakeholder brief to one person outside the build, write down their three comments, and rank them. The last thing you write is a README and a post that claim exactly what the repository can prove.

> *The crown is not the moment the sword touches the shoulder. It is the morning after, when the kingdom still has to be run.*

## The idea

A demonstration shows an outcome, names its limits, and links the evidence. The outcome is the core flow on the live URL. The limits are the things you know are not finished, said out loud: a sandbox checkout is not revenue, a fixture-backed AI draft is not a model guarantee, four interviews are not a market. The evidence is `docs/release-candidate.md` and the tag it names. A demo that does those three things in five minutes is stronger than one that hides the limits and gets caught on the first question, because the person watching will find the limits anyway and will then wonder what else was hidden.

The written Q&A is the two-minute question slot from a demo day, done on paper. You can answer better in writing than out loud, and the answers are more useful afterwards, because they become the top of the README's "Decisions" section. The questions are the ones every reviewer asks: why this user, why this stack, where is the data and who owns it, what happens when the provider is down, what would you build next and how would you know it worked. Each answer points at a file or a line in the repository. An answer that cannot point at anything is a thing you believe rather than a thing you built.

A handoff is a document another developer can operate from with no conversation. Launch is the beginning of operating a thing, not the end of building it; the running-your-service page in the docs list is a government manual for exactly this and says it plainly. The packet names the release, the URL, every environment variable by name and purpose with no values, the commands to run and test, the backup and restore commands from 12-3 with the three recovery numbers, the known issues with severity, and a line that says who notices when it breaks. If the product stays live, that line names a person. If it is a demonstration, it says what gets turned off and when, so the provider bills stop.

Self-scoring is honest only if every line has evidence. The rubric below is a hundred points in three bands. For each line you write the number and the file or screenshot that supports it. A line with a number and no evidence is scored zero on the second pass, by you, because that is what a reviewer would do. The total is not the point; the lines you could not support are, because they are next week's list.

The portfolio story is proportional. It describes your role, the problem, the constraints, the decisions, and the results, and it credits what you did not make: the stack, the AI assistance you used in Unit 5's way and reviewed, the pattern sheets. It links the deploy, the test command, and the tag. A precise account of a small real thing survives a reviewer with the repository open. An overclaim does not, and they will have the repository open.

Napkin version: seed, record, watch; five questions answered with file names; a hundred points with evidence per line; the packet in `docs/demo-day.md`; one outside reviewer and their three comments, ranked; a README and a post that claim what the repository proves; one experiment in `docs/next-quest.md`.

![](diagram:session-12-5/fig1-model)

### The final take

Nothing about the take is new. The script is Tuesday's, with the three notes applied. The account is `demo@example.com`, seeded against the live database five minutes before recording so the three records are the three you expect. The window is private. The tag is `rc-2`, and the first line of the script says so. If the provider is down when you get to feature two, the adapter's `unavailable` path is itself a feature, and you show it: the error sentence, the retry, and the sentence "the assistant is unavailable right now; here is a recording of the same step from this morning," followed by the clip. Say the word recording before you play it.

Watch the take once, all the way through, and write three sentences under the script: one thing that landed, one thing you would change, and the timestamp where the energy dropped. Then stop. A second take is allowed if the first one broke; a fourth take is a sign you are polishing the recording instead of the product.

### The five questions

Copy this into `docs/demo-day.md` under a heading `## Q&A` and answer each one in four to six sentences with at least one file name:

```markdown
## Q&A

**1. Who is this for, and how do you know they want it?**
(persona from the empathy map in docs/research.md; the P-number, P0 to P3, whose words you used; what they said)

**2. Why this stack, and what would you change if you started again?**
(one honest sentence per layer; the thing you would not build the same way)

**3. Where does the data live, who can read it, and how do you know?**
(the model's owner field; the two 404s from docs/release-candidate.md; the backup numbers)

**4. What happens when the provider you depend on is down, and when did you last test it?**
(api/services/<name>.js, the unavailable fixture, the date of the last real-provider check)

**5. What is the next thing you would build, and how would you know it worked?**
(docs/next-quest.md: the hypothesis, the number you would watch, the decision rule)
```

A filled answer to question three:

```markdown
**3.** Every record has an `owner` set from the token, never from the body (api/routes/entries.js). On 12-3 a second account tried to read and delete the fixture account's entry by id and got 404 both times; the delete had been a 204 before that review, which is why there is now a test for it (tests/entries.test.js, "another user cannot delete"). The database is the one the app writes to; it was dumped on 12-3, restored locally in 0.41 seconds, and the newest record was 14 hours old, so the current recovery policy is "lose at most a day, back in a minute" and the backup is manual.
```

### The rubric, scored by you

```markdown
## Rubric — scored <date> against rc-2

### Boss clear — 70
| Line | Max | Score | Evidence |
|---|---|---|---|
| Core flow works on the live URL as the fixture account | 15 | | recording timestamp, docs/evidence/12-1-refresh.png |
| Code is organised and the README runs from a clone | 10 | | docs/polish-log.md clone count |
| Tests run against the live sha and pass | 10 | | docs/evidence/12-3-jest.txt, 12-3-e2e.txt |
| Ownership, validation, secrets, headers verified by request | 10 | | release-candidate.md security section |
| Deployed over HTTPS, rolled back and forward once | 10 | | release-candidate.md deploy section |
| Loading, empty, success, error on every screen; works at 375 and 1440 | 10 | | docs/evidence/12-2-375.png, 12-2-1440.png |
| Five-minute recording with the limits said aloud | 5 | | the take, with its timestamp of the limits |

### Epic loot — 20
| Line | Max | Score | Evidence |
|---|---|---|---|
| Stripe test checkout and the AI feature both work on the live URL | 5 | | |
| Ten or more tests, and the workflow runs them on push | 5 | | .github/workflows/test.yml, Actions run link |
| Backup restored and timed; custom domain; process manager or platform restart verified | 5 | | release-candidate.md drill section |
| README, deck or stakeholder brief, and recording agree with each other and with the product | 5 | | |

### Legendary — 10
| Line | Max | Score | Evidence |
|---|---|---|---|
| The recording would convince a stranger, and every claim in it is in the repo | 5 | | |
| An outside reviewer completed the core flow without help | 5 | | docs/demo-day.md feedback section |

Total: /100
```

The Stripe line sits in the second band only because a capstone with no paid feature can still clear the first; if yours has one, it was a Must since 10-4 and the line is yours to claim. Seventy is the bar; it means the product works, is tested, is protected, is deployed, and was shown. The lines you scored low go into `docs/next-quest.md` before anything else does.

### The packet

```markdown
## Handoff

- Release: rc-2, sha <short sha>, deployed <date> via <railway up | deploy.sh on the VPS>
- URL: https://YOUR-APP.up.railway.app
- Fixture account: demo@example.com (password in README's development section)
- Environment variables (names only; values live in the Railway service's variables, or in api/.env on the VPS host):
  PORT, MONGODB_URI, JWT_SECRET, PAGE_ORIGIN, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_ID, ANTHROPIC_API_KEY, AI_MODEL, AI_DAILY_TOKEN_BUDGET, AI_ENABLED, DRAFT_MODE, NODE_ENV
- Run: see README "Run it locally"
- Test: cd api && npm test; npx playwright test from the root
- Deploy: git fetch --tags, git checkout <tag>, railway up (10-4); on the VPS instead: ssh deploy@YOUR-DOMAIN, cd ~/<capstone-name>, git fetch --tags, git checkout <tag>, ./deploy.sh
- Roll back: the same with the previous tag; last rehearsed <date>
- Backup: mongodump --uri="$MONGODB_URI" --out=backups/<tag>-<date>, run where the database is reachable
- Restore drill: mongorestore --nsFrom='<db>.*' --nsTo='<db>_restore.*' backups/<folder>; last run <date>, <seconds>, newest record <hours> old
- Known issues: copied from docs/release-candidate.md, with severity
- Who watches it: <you>, checking the live URL <how often>; or "demonstration only, Stripe and provider keys revoked on <date>, host paused on <date>"
```

Every line is a fact you can check against the repository or the host. The "who watches it" line is the one most people leave out, and it is the one that decides whether a sign-up next month gets answered.

### The outside reviewer and the ranked list

Send the recording link and the deck or stakeholder brief to one person who was not in the build. A friend who uses software is enough; one of P0 through P3 from 8-1 is better, because they have the problem. Ask for three comments, any kind. Write them down in their words under `## Feedback` in `docs/demo-day.md`, then sort each one into one of three bins: a defect, which is the path doing something wrong; a need, which is something they could not do; a suggestion, which is a taste. Defects and blocked needs outrank suggestions. Pick the top one and say why. A list you do not rank is a way to feel busy while the broken step stays broken.

### One experiment, not a roadmap

`docs/next-quest.md` holds one experiment, in four lines: the hypothesis, the method, the number you will watch, the decision rule. "If I add the export feature, at least two of the five interviewees will use it within a week; I will build it behind the adapter pattern in two evenings, watch the count of exports in the server log, and keep it if the count is two or more by the following Wednesday." A plan with a number in it can fail, which is what makes it a plan. "Keep improving the app" cannot fail and is therefore not one.

## The demonstration

One worked example, the whole day in order, on the capstone from the four sprints. Nothing is running on your machine at the start, and nothing needs to be: the live URL is the thing being demonstrated.

Seed the live database first, with the fixture account and the three records, the same way as every recording:

```bash
cd ~/projects/<capstone-name>/api
MONGODB_URI='<the live connection string, pasted for this command only>' node scripts/seed.js
```

```text
seeded demo@example.com with 3 entries
```

The pasted URI never goes into a file on your laptop; the command's history line is the only trace, and `history -d` removes it if you want it gone. Then the take: private window, signed in, script beside the screen, recording on. Four minutes and thirty-one seconds. At 2:30 the Wi-Fi came off, the save failed, the draft stayed, the Wi-Fi came back, the retry landed, and the narration said what the machine did while it did it. At 3:30 the limit sentence: "the checkout is Stripe's test mode and the assistant's draft is one model's output; neither is a promise." Watched once. Three sentences under the script.

Then `docs/demo-day.md`, section by section. The Q&A took forty minutes, because question two was honest: the second service in the 9-5 record came out in Sprint 1, and the answer says so and says why. The rubric took twenty, and the first pass gave 84; the second pass, checking every evidence cell, took the ten-test line back to zero because the Actions run on `rc-2` was never opened, and the `rc-2` run link went into the cell after it was found. Final: 79. The packet took fifteen, with every line copied from a file rather than from memory, which is how a mismatch in the environment variable list was found: `DRAFT_MODE` was in `.env.example` and not in the packet, and now it is in both.

Then the reviewer. P2 from 8-1 got the recording and the deck, or the stakeholder brief on the Village road, at noon and sent three comments by four. "I could not find where to change my password" is a blocked need. "The green is hard to read on my phone" is a defect in the layout sense. "It should have a dark mode" is a suggestion. The password one is first, with its reason, and it is the hypothesis in `docs/next-quest.md`.

Then the README's top section, rewritten so that every claim has a link: the live URL, the tag, the test command, the backup drill, the three things that are not finished. And the post, which is the README's first paragraph with the URL and nothing the README cannot support:

```text
Twenty weeks ago I opened a terminal for the first time. Today <Product> is live at https://YOUR-APP.up.railway.app: sign in, create an entry, and it is still there after you reload. It has a test checkout, an assistant draft behind an adapter that survives the provider going down, twelve tests that run on every push, and a backup I have actually restored. Three things are not finished, and the README says which. Source and the full evidence trail: https://github.com/YOU/<capstone-name>
```

Then the tag's release on GitHub, so the sha, the recording link, and the known issues sit together where a stranger looks first:

```bash
cd ~/projects/<capstone-name>
gh release create rc-2 --title "rc-2: demo day" --notes-file docs/release-candidate.md
```

```text
https://github.com/YOU/<capstone-name>/releases/tag/rc-2
```

And the repository pinned on your profile, which is a setting on github.com rather than a command; the docs link is in the list above.

Here is a small model you can run here. It checks a handoff packet for the fields a stranger needs, totals a rubric and refuses lines that have no evidence, sorts feedback into its three bins, and tests that an experiment can fail. It proves the rules are mechanical. It does not read your `docs/demo-day.md`; that honesty is the part only you can do.

```js run=checkpoint-12-5
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const REQUIRED = ['release', 'url', 'envNames', 'run', 'test', 'deploy', 'rollback', 'backup', 'restoreDrill', 'knownIssues', 'watcher', 'nextExperiment'];
const packet = {
  release: 'rc-2 a9f3c1d', url: 'https://example.test', envNames: ['MONGODB_URI', 'JWT_SECRET'],
  run: 'README', test: 'npm test', deploy: 'railway up', rollback: 'rc-1', backup: 'mongodump',
  restoreDrill: '0.41s, 14h', knownIssues: ['long titles overflow on phone'], watcher: 'me, weekly',
  nextExperiment: ''
};
const missing = REQUIRED.filter(function (key) {
  const v = packet[key];
  return v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
});
check(missing.length === 1 && missing[0] === 'nextExperiment', 'Continuation is a deliberate deliverable');

const rubric = [
  { line: 'core flow live', max: 15, score: 15, evidence: 'recording 0:45' },
  { line: 'tests on the sha', max: 10, score: 10, evidence: '12-3-jest.txt' },
  { line: 'ten tests in CI', max: 5, score: 5, evidence: '' },
  { line: 'outside reviewer', max: 5, score: 4, evidence: 'demo-day.md feedback' }
];
function total(lines) {
  return lines.reduce(function (sum, l) { return sum + (l.evidence ? Math.min(l.score, l.max) : 0); }, 0);
}
check(total(rubric) === 29, 'a line without evidence scores zero');
check(rubric.reduce(function (s, l) { return s + l.max; }, 0) === 35, 'the maxima add up as declared');

const BIN = { defect: 0, need: 1, suggestion: 2 };
const feedback = [
  { text: 'should have dark mode', bin: 'suggestion' },
  { text: 'could not find password change', bin: 'need' },
  { text: 'green unreadable on phone', bin: 'defect' }
];
const ranked = feedback.slice().sort(function (a, b) { return BIN[a.bin] - BIN[b.bin]; });
check(ranked[0].bin === 'defect' && ranked[2].bin === 'suggestion', 'defects and needs outrank suggestions');

function canFail(experiment) {
  return typeof experiment.threshold === 'number' && typeof experiment.by === 'string' && experiment.metric.length > 0;
}
check(canFail({ metric: 'exports in a week', threshold: 2, by: 'next Wednesday' }), 'an experiment with a number can fail');
check(!canFail({ metric: 'keep improving', threshold: null, by: '' }), 'a plan without a number is not an experiment');

console.log('ok: checkpoint-12-5');
```

## Where it breaks

![](diagram:session-12-5/fig2-diagnosis)

### Launch treated as the end

The take is recorded, the post is up, the laptop closes, and three weeks later a dependency advisory lands, the certificate renewal fails, and a real person signs up and gets a 500 nobody sees. The cause is a handoff with no "who watches it" line, which means nobody. The fix is the line, with a frequency, and a decision: either the product stays live and you check it on a schedule you can keep, or it is a demonstration and the packet says which keys are revoked and when the host is paused. A product without a watcher is a demo that happens to have a URL. The coronation is the handoff to yourself, not the last commit.

### Feedback becomes an unranked wish list

You asked three people instead of one, you have eleven comments, and the loudest one, a dark mode, is what you start building. The cause is skipping the bins. The fix is sorting every comment into defect, need, or suggestion before deciding anything, and then taking the top defect or the top blocked need. Suggestions are not wrong; they are later. The ranked list stays in `docs/demo-day.md` so the decision is visible to the next person who reads it, including you in a month when the dark mode starts to seem urgent again.

### Portfolio overclaims

The README says you designed, built, and shipped a platform with payments and AI, and the repository shows a test-mode checkout, one adapter, and twelve tests. The cause is writing the pitch instead of the report. The fix is the proportion rule: every sentence in the README's top section links to the thing that proves it, and the three unfinished items are in the same section as the three finished ones. Credit the tools, the patterns, and the AI assistance you reviewed. A reviewer with the repository open can disprove an overclaim in five minutes, and then every true claim next to it is doubted too.

## Your turn

In `~/projects/<capstone-name>`, against the live `rc-2`, with nothing to deploy today.

1. Seed the fixture account against the live database with the connection string pasted into that one command. The line reads `seeded demo@example.com with 3 entries`.
2. Record the final take from `docs/demo-script.md` in a private window on the live URL. Say the tag in the first ten seconds and the limits at 3:30. Watch it once. Write three sentences under the script.
3. Create `docs/demo-day.md`. Answer the five questions, each with at least one file name. Answer question two honestly, including the thing you would not build the same way.
4. Score the rubric. Then score it again, and zero every line whose evidence cell you cannot open right now. Write both totals and keep the second.
5. Write the handoff section from files, not memory: `.env.example` for the names, `docs/release-candidate.md` for the drill numbers and known issues, the README for the commands. Write the "who watches it" line last and mean it.
6. Send the recording and the deck or stakeholder brief to one outside person. Record their three comments in their words, bin them, rank them, pick one with a reason.
7. Write `docs/next-quest.md` as one experiment with a number and a date. The low rubric lines come first if any scored under half.
8. Rewrite the README's top section so every claim links to its evidence and the three unfinished things sit beside the finished ones. Write the post from that paragraph. Create the GitHub release for `rc-2` with `gh release create` and pin the repository on your profile.

If the second rubric pass drops you under seventy, that is information, not a verdict: the lines you lost are the top of `docs/next-quest.md`, and the path does not take the crown back.

## The quest

![](diagram:session-12-5/fig3-evidence)

The deliverable is `docs/demo-day.md`, with its five sections in order: the take, with its link and the three sentences; the Q&A; the rubric with evidence in every scored cell and the second-pass total; the handoff; the feedback, binned and ranked. Beside it, `docs/next-quest.md` with one experiment, and a README whose first screen a stranger can act on.

Evidence to keep:

- The final take as an unlisted link or a file, labelled as the final take and named with the tag, linked from `docs/demo-day.md` and the README.
- `docs/demo-day.md` complete, with the second-pass rubric total.
- `docs/next-quest.md` with a hypothesis, a method, a number, and a date.
- The README's top section with a link for every claim and the three unfinished items.
- The GitHub release for `rc-2` carrying the release-candidate notes, and the repository pinned on your profile.
- The post, as text in `docs/demo-day.md` under `## Post`, and the link to wherever you put it.
- `docs/retrospective.md`: a short page in your own words on where you were twenty weeks ago, the hardest thing on the path, the thing you are proudest of, and what you will build next. This one is for you, and it goes in the repository only if you want it there.

## Side quests

The sheet on knowing what you are talking about is the standard the five written answers are held to, the grit sheet is for the week after the crown when nobody is watching the streak, and the observability sheet is what "who watches it" grows into if the product stays live.

## Before next session

There is no next session. This is where the path ends and the thing it was for begins, so this section is what comes after.

The product has a watcher now, and the watcher has a schedule. Keep it. Run the experiment in `docs/next-quest.md` and write the result at the bottom of the file on the date you set, whichever way it went. Then write the next one. One experiment at a time, each with a number, is how the capstone becomes something other than a capstone.

Keep the habit the whole path was built on: something committed most days, however small, in this repository or the next one. The contribution graph is not the point; the thing it measures is. When the repository is quiet for a week, the backup drill from 12-3 is a good thing to run again, because it is the one skill on the path that decays into a hope if it is not exercised.

When you build the next thing, start it the way 8-1 started this one: with people, anonymised, saying what they need, before a folder exists. Then the plan, then the slice, then the table that says what is really done. You have the whole sequence in `docs/` of this repository, with the evidence beside it. That is the artifact. The crown is the fact that you can do it again.

Nothing is running on your machine. The live URL runs `rc-2`, and you know how to put it back if it ever does not.
