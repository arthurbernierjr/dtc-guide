---
editorial: true
title: War Council
subtitle: Pitch Deck and Financial Narrative Workshop
hook: "No new theory. You build the month-by-month cash model, let it overrule the slides it disagrees with, record the five-minute pitch against your live product, and score it yourself with the questions an investor would ask."
read: 60
artifact: "The unit deliverable in the capstone repo: a reconciled twelve-slide deck (Google Slides link and docs/pitch-deck.pdf), docs/financial-narrative.md with an assumptions sheet and three scenarios, docs/runway.js and its printed runway check, and a rehearsal log with a recorded pitch, three self-scored GROWs, and the five questions you expect with sourced answers"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.ycombinator.com/library/4b-how-to-pitch-your-company
  - https://support.apple.com/guide/quicktime-player/record-your-screen-qtp97b08e666/mac
  - https://obsproject.com/
  - https://www.loom.com/pricing
  - https://www.sec.gov/resources-small-businesses
say:
  - "The model is the source of truth. Slides are rendered from it, never the other way round."
  - "Runway is months until cash goes below zero, computed month by month, not a raise divided by an average."
  - "Record, watch, score, rewrite. The question you cannot answer on the recording is the one you will be asked."
---

## The hook

Before the final battle the hero spreads the maps on the table, and the allies say the things nobody wanted to hear: the supply line is twelve weeks and the plan assumes eighteen, the right flank is a guess, the hero reads from notes. Today you are every seat at that table. You have twelve filled slides, a financial narrative, a cap table, and a live product. What you do not have yet is a month-by-month cash model, and until it exists every number on slides 10 and 11 is a hope.

By the end of the session the model exists as a small script in `docs/`, it prints a runway check you can paste, and the deck says what the model says. You have recorded the full five-minute pitch with the deployed capstone on screen, watched it back as if you were the investor, scored it against seven questions, written three specific things to fix, and written the five questions you expect in the room with the answer and the source for each. That bundle is the unit's deliverable. It is also what you carry into Unit 12 and, if the venture-fit paragraph said yes, into the first real meeting.

> *The council does not vote. It asks what happens if the supply line is late. You answer from the ledger, or you do not answer.*

You arrive with the deck from [last session](/path/11-3-the-royal-court/), all twelve slides filled, `docs/pitch-deck.md`, `docs/financial-narrative.md`, `docs/cap-table.md`, and the capstone deployed at its public URL. You need a way to record your screen and voice: QuickTime Player on macOS, Game Bar on Windows, or OBS on anything, all linked above. Loom works too; its free plan has a per-recording length cap, so check the pricing page before you rely on it. Test a ten-second recording before the real take.

## The idea

A financial narrative that was written before the model is a story. A model that was built before the narrative is a spreadsheet nobody can read. You want both, in that order: plan, then costs and timing, then the model, then the slides rendered from the model, then the story told over the slides.

### Build the model from the operating plan

Start with what the company intends to do over the next period, in plain sentences. Hire one engineer in month 2. Spend on marketing in three steps as the channel proves out. Launch the Team plan in month 19. Translate each sentence into money and a date. Salaries, contractors, hosting, model credits, customer acquisition, legal and accounting, and one-time setup each behave differently; separate recurring from one-time. A single monthly burn number is a fine summary, as long as every dollar in it can be traced to a line underneath.

Distinguish revenue, cash collected, and profit. A subscription is collected monthly minus the processor's cut. An annual contract may be collected up front, or not. A pre-sale collects now and owes delivery later. Fees and refunds reduce what lands. The model should show enough timing to explain runway, which is the number of months before cash goes below zero, computed month by month. Dividing the raise by an average burn skips the month the engineer starts and the month marketing doubles, and those are the months that decide the answer.

### The assumptions sheet comes first

List every input with units: starting cash, starting customers, price, processor fee, churn, acquisition cost, each cost line with its start month. Mark each one observed, estimated, or hypothetical. Observed means you read it off the Stripe dashboard or the database. Estimated means a source and a date. Hypothetical means you made it up and said so. A reviewer should be able to change one input and see the effect without hunting through hidden formulas, which is why the model is a short script with the inputs at the top and no magic numbers below them.

Then run three cases. The base case is the working plan. The downside tests slower adoption or higher costs, one input at a time. The upside tests whether the plan could even absorb stronger demand. Do not change every input at once; you learn nothing from a scenario you cannot explain. The inputs that move the result most are the ones to measure first, and they go in the "key assumptions" section of the narrative by name.

### Reconcile every slide with the model

The ask slide, the runway statement, the hiring plan, the projections, and the milestone date must agree with each other because they all come from the same script. If slide 11 says eighteen months of runway and the model runs out of cash in twelve, the slide changes. If slide 10 says 500 subscribers at year end and the model says 1,450, the slide changes. If the model says 2,559 subscribers at month 18 and the ask says 3,000, the ask changes or the assumptions change, and if the assumptions change the narrative says what new evidence justified it. A polished chart cannot repair incompatible numbers. Keep the model as the source of numerical truth and update the slides from it, every time.

Charts get labels: the period, the unit, and whether each point is actual or projected. Never blend actual and forecast revenue into one unmarked line. Never truncate an axis to make growth look steeper. A reviewer should understand the claim from the chart alone, without a verbal explanation that changes what the chart appears to show. Financial communication is part of the product's credibility.

### Rehearse the questions, not the script

You are alone, so the council has to be you, and that works better than it sounds, because a recording does not flatter. Record the full pitch. Watch it back as the investor, not the founder. Ask the model's questions out loud: what if the price is wrong, what if acquisition costs half again as much, what happens to the hire if growth is slow, why this route and not customer funding. Answer each from the assumptions sheet or say "not measured yet; this is the experiment that measures it," which is a better answer than an invented number. Keep a question log and revise the model or the narrative when a question exposes a gap. A memorized deck breaks on the first interruption, and interruptions are the meeting.

A short design pass, after the numbers are right and never before: one font family, two colors plus black and white, left-aligned text, 24-point minimum and larger for headlines, one image or chart per slide, and white space you leave alone. If a slide needs more than a sentence to make its point, it is two slides or a cut.

What you should be able to draw on a napkin: a box labeled assumptions at the top, an arrow into a box labeled model, and three arrows out of the model into slide 10, slide 11, and the narrative. No arrow runs the other way. Beside it, a loop: record, watch, score, rewrite.

![](diagram:session-11-4/fig1-model)

## The demonstration

TaskForge, with last session's draft numbers, tested. First the assumptions sheet, which goes at the top of `docs/financial-narrative.md`.

```markdown
## Assumptions
| Input | Value | Status | Source |
|---|---|---|---|
| Starting cash | $500,000 | hypothetical | the ask, after close |
| Starting Pro subscribers | 47 | observed | Stripe dashboard, this month |
| Price | $12/month | observed | pricing page |
| Processor fee | 3% | placeholder | read the processor's pricing page |
| Monthly churn | 10% | hypothetical | 10-month average retention |
| CAC | $40 | hypothetical | content plus small ads |
| Founder pay | $5,000/month | hypothetical | |
| Hosting, model credits, tools | $1,200/month | estimated | 10-3 usage log x 5 |
| Legal and accounting | $800/month | hypothetical | |
| Engineer | $11,000/month from month 2 | estimated | local salary data, this year |
| Marketing | $6K months 1-6, $10K months 7-12, $16K months 13-18 | hypothetical | |
| New subscribers per month | marketing / CAC | hypothetical | the channel is unproven |
```

Break-even is a moving target in this plan, because the cost base steps up three times. Work it out per step before you read the model's output, so you know what each row has to clear. Each subscriber collects $12 × 0.97 = $11.64 a month after the processor's cut.

```markdown
| Months | Monthly cost base | Break-even Pro subscribers (cost / (12 x 0.97), rounded up) |
|---|---|---|
| 1 | $13,000 (founder, hosting, legal, $6K marketing; no engineer yet) | 1,117 |
| 2-6 | $24,000 (the engineer starts) | 2,062 |
| 7-12 | $28,000 (marketing steps to $10K) | 2,406 |
| 13-18 | $34,000 (marketing steps to $16K) | 2,921 |
```

Then the model, as a file at `docs/runway.js`. Inputs at the top; nothing below them is a number you would have to hunt for.

```js
// docs/runway.js: fictional TaskForge cash model. Every input is an assumption.
const assumptions = {
  startingCash: 500000,
  startingSubscribers: 47,
  price: 12,
  processorFee: 0.03,
  monthlyChurn: 0.10,
  cac: 40,
  fixedCosts: { founder: 5000, hosting: 1200, legalAccounting: 800 },
  engineer: { salary: 11000, startsMonth: 2 },
  marketing: (m) => (m <= 6 ? 6000 : m <= 12 ? 10000 : 16000),
  months: 18
};

function model(a) {
  let cash = a.startingCash;
  let subs = a.startingSubscribers;
  const rows = [];
  for (let m = 1; m <= a.months; m++) {
    const mrr = subs * a.price;
    const collected = Math.round(mrr * (1 - a.processorFee));
    const fixed = a.fixedCosts.founder + a.fixedCosts.hosting + a.fixedCosts.legalAccounting;
    const payroll = m >= a.engineer.startsMonth ? a.engineer.salary : 0;
    const expenses = fixed + payroll + a.marketing(m);
    const net = collected - expenses;
    cash += net;
    rows.push({ month: m, subs: subs, mrr: mrr, collected: collected, expenses: expenses, net: net, cash: cash });
    subs = Math.round(subs * (1 - a.monthlyChurn) + a.marketing(m) / a.cac);
  }
  return rows;
}

const rows = model(assumptions);
console.log('month\tsubs\tmrr\tcollected\texpenses\tnet\tcash');
for (const r of rows) {
  if (r.month % 3 === 0 || r.month === 1) console.log([r.month, r.subs, r.mrr, r.collected, r.expenses, r.net, r.cash].join('\t'));
}
const lowest = rows.reduce((a, r) => (r.cash < a.cash ? r : a));
const funded = rows.filter((r) => r.cash >= 0).length;
const positive = rows.find((r) => r.net >= 0);
console.log('lowest cash: ' + lowest.cash + ' (month ' + lowest.month + ')');
console.log('months funded: ' + funded + ' of ' + rows.length);
console.log('first cash-positive month: ' + (positive ? positive.month : 'none'));
console.log('subscribers at month ' + rows.length + ': ' + rows[rows.length - 1].subs);
```

Run it from the capstone folder.

```bash
node docs/runway.js
```

```text
month	subs	mrr	collected	expenses	net	cash
1	47	564	547	13000	-12453	487547
3	323	3876	3760	24000	-20240	445542
6	642	7704	7473	24000	-16527	392515
9	1065	12780	12397	28000	-15603	339920
12	1454	17448	16925	28000	-11075	302492
15	2023	24276	23548	34000	-10452	263174
18	2559	30708	29787	34000	-4213	244737
lowest cash: 244737 (month 18)
months funded: 18 of 18
first cash-positive month: none
subscribers at month 18: 2559
```

Now read it against the deck. Slide 11 said "$500K reaches 3,000 Pro subscribers and cash-flow break-even in 18 months." The model says 2,559 subscribers at month 18 and a net of −$4,213 that month: close, not there, and still burning. Slide 10 said 500 subscribers at the end of year 1; the model says 1,454 at month 12, because the marketing budget on the assumptions sheet buys 150 to 250 new subscribers a month at a $40 CAC ($6,000 ÷ 40 through month 6, $10,000 ÷ 40 through month 12), and the slide was written before anyone did that multiplication. The narrative's path-to-profitability line said break-even at 2,234 subscribers. The model does not agree, and the reason is the denominator. That 2,234 was $26,000 divided by $11.64, and the model never has a $26,000 cost base after month 12; from month 13 the base is $34,000 (founder $5,000, hosting $1,200, legal $800, engineer $11,000, marketing $16,000), so break-even in that step is 2,921 subscribers, the last row of the table above. At 2,559 the model is 362 short, which is the −$4,213. The narrative's number was computed from a base the plan had already left behind, and that line changes along with the slide.

Three honest ways to reconcile, and the one a listener respects is whichever you can defend. Change the slides to match the model: "roughly 2,500 Pro subscribers by month 18, cash-flow break-even in month 21, with over $240K of the raise still in the bank." (Run the model to 24 months to see it: the first month with a positive net is 21, at 2,950 subscribers against the $34,000 base.) Change an assumption with evidence: if the content channel measured a $30 CAC last month, put $30 on the sheet with the source and rerun. Or change the plan: start the $16K marketing step at month 10 and rerun, and accept the lower minimum cash. What you may not do is leave 3,000 on the slide and 2,559 in the model.

Then the downside, one input at a time. CAC $60 instead of $40: subscribers at month 18 fall to about 1,700, lowest cash about $163K, still funded for all 18 months. Churn 15 percent instead of 10: about 2,050 subscribers, lowest cash about $205K. Both go in the narrative as scenarios, and the sentence under them is the one that matters: "The plan survives either miss with more than $160K in reserve; it does not survive both at once without cutting the month-13 marketing step." That sentence is what an investor is actually asking for when they ask about runway.

Here is the same model as a small model you can run here. It proves the runway arithmetic and that the base case and the deck disagree the way described. It does not prove any TaskForge input, and it says nothing about your capstone until you put your own assumptions sheet into `docs/runway.js` and run it on your machine.

```js run=checkpoint-11-4
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

// Fictional cash model. Inputs are assumptions; the arithmetic is the lesson.
function model(a) {
  let cash = a.startingCash;
  let subs = a.startingSubscribers;
  const rows = [];
  for (let m = 1; m <= a.months; m++) {
    const collected = Math.round(subs * a.price * (1 - a.processorFee));
    const payroll = m >= a.engineer.startsMonth ? a.engineer.salary : 0;
    const expenses = a.fixed + payroll + a.marketing(m);
    const net = collected - expenses;
    cash += net;
    rows.push({ month: m, subs: subs, net: net, cash: cash });
    subs = Math.round(subs * (1 - a.monthlyChurn) + a.marketing(m) / a.cac);
  }
  return rows;
}

function summary(rows) {
  const lowest = rows.reduce((a, r) => (r.cash < a.cash ? r : a));
  const positive = rows.find((r) => r.net >= 0);
  return {
    monthsFunded: rows.filter((r) => r.cash >= 0).length,
    lowestCash: lowest.cash,
    firstPositive: positive ? positive.month : null,
    subsAtEnd: rows[rows.length - 1].subs
  };
}

const base = {
  startingCash: 500000, startingSubscribers: 47, price: 12, processorFee: 0.03,
  monthlyChurn: 0.10, cac: 40, fixed: 7000,
  engineer: { salary: 11000, startsMonth: 2 },
  marketing: function (m) { return m <= 6 ? 6000 : m <= 12 ? 10000 : 16000; },
  months: 18
};

const b = summary(model(base));
check(b.monthsFunded === 18, 'base case: cash never goes below zero in 18 months');
check(b.lowestCash === 244737, 'base case: lowest cash is 244737, in month 18');
check(b.firstPositive === null, 'base case: no cash-positive month yet, so the slide cannot say break-even at 18');
check(b.subsAtEnd === 2559, 'base case: 2559 subscribers at month 18, not the 3000 on the draft slide');

const tiny = summary(model(Object.assign({}, base, { startingCash: 100000 })));
check(tiny.monthsFunded === 5, 'with $100K the same plan is funded for five months, not eighteen');

const dearer = summary(model(Object.assign({}, base, { cac: 60 })));
check(dearer.monthsFunded === 18 && dearer.lowestCash > 160000, 'downside CAC $60: still funded, lowest cash above $160K');

const leakier = summary(model(Object.assign({}, base, { monthlyChurn: 0.15 })));
check(leakier.subsAtEnd < b.subsAtEnd, 'downside churn 15%: fewer subscribers at month 18');

console.log('base: funded ' + b.monthsFunded + '/18, lowest cash ' + b.lowestCash + ', subscribers ' + b.subsAtEnd);
console.log('ok: checkpoint-11-4');
```

Change `startingCash` to 300000 and predict the months funded before you run. Then put it back and change the marketing function so the third step starts at month 10. The slide you would have to rewrite after each change is the whole point of having the model.

## Where it breaks

![](diagram:session-11-4/fig2-diagnosis)

### Deck and model disagree

The deck says 3,000 subscribers and break-even at month 18; the script says 2,559 and no positive month. The cause is that the slide was written from a guess and the model from assumptions, and nobody rendered one from the other. The fix is a rule: the slide is a view of the model. Change the assumption, rerun, update the slide, every time, and before you record, read slides 10 and 11 out loud next to the script's last four lines. "The deck is roughly right" is not an answer in a room where someone has the spreadsheet open.

### Gross revenue treated as available cash

The plan spends the month's MRR in the month it is booked. The cause is confusing revenue with cash: the processor takes its cut first, an annual plan is collected once, a refund reverses a line you already spent. The fix is the `collected` column, separate from `mrr`, with timing and fees applied, and a `cash` column that is the only one runway is read from. A profitable year that runs out of cash in June is a common way this ends, and the script already contains it if you read the cash row instead of the revenue row.

### Rehearsal becomes memorization

You can recite twelve slides and cannot answer "what if the price is wrong" without going back to slide six. The cause is rehearsing the script instead of the model. The fix is the question log: record, watch, write the five questions the recording would make an investor ask, answer each from the assumptions sheet with the source beside it, and practice the sentence you say when the answer is "not measured yet." The goal is to stay with the model when the script is gone.

## Your turn

Open a terminal in the capstone repo and the deck in Google Slides.

1. Write the assumptions sheet at the top of `docs/financial-narrative.md`, in the table shape from the demonstration, with every row marked observed, estimated, or hypothetical and a source where one exists. Read the 47-style numbers off your own Stripe test dashboard and database; if a number is test-mode, say so.

2. Create `docs/runway.js` from the demonstration and replace every input in `assumptions` with your sheet. Then run it.

   ```bash
   node docs/runway.js
   ```

   The last four lines are your runway check: `lowest cash:`, `months funded:`, `first cash-positive month:`, and `subscribers at month 18:`. Paste them into the narrative under a heading "Runway check" with the date.

3. Run two downside cases by changing one input each, acquisition cost and churn, and paste their last four lines under "Scenarios." Write the one sentence that says what the plan survives.

4. Reconcile. Open slides 10 and 11 beside the script output. Rewrite the projection table from the model's month 12 and month 18 rows, rewrite the ask's milestone to what the model reaches, and change the status line in `docs/pitch-deck.md` from draft to reconciled with the date. If you changed an assumption instead of a slide, write what evidence justified it.

5. Do the design pass, numbers first and design last: one font, two colors, left-aligned, 24-point minimum, one image or chart per slide, every chart labeled with period, unit, and actual versus projected.

6. Record the pitch: screen recording of the deck, your voice, your face in a corner if your tool allows it, and a thirty-second switch to the deployed capstone at its public URL for the product slide. Five minutes or less, all twelve slides. Start a timer you can see.

   ```bash
   mkdir -p docs/pitch
   ls docs/pitch
   ```

   Put the recording in `docs/pitch/` or upload it unlisted and put the link in `docs/pitch-deck.md`; a file over 100 MB does not belong in Git, so prefer the link.

7. Watch it back as the investor and score it in the rehearsal log section of `docs/pitch-deck.md`, copying this in:

   ```markdown
   ## Rehearsal log
   Recording: <link or docs/pitch/take-1.mp4>, <length m:ss>, <date>

   | Question | 0-2 | Note |
   |---|---|---|
   | Clarity: could a stranger say what the product does by 0:30? | | |
   | Problem: specific person, specific pain, evidence? | | |
   | Demo: did the live product look real and work? | | |
   | Numbers: were market, traction, and projections credible and sourced? | | |
   | Ask: amount, uses, one milestone, matching the model? | | |
   | Delivery: no reading, steady pace, eye on the camera? | | |
   | Timing: under 5:00 with all twelve slides? | | |

   GLOW (one thing that worked and why):
   GROW 1:
   GROW 2:
   GROW 3:

   ## Expected questions
   | Question | Answer | Source |
   |---|---|---|
   | | | |
   ```

   A filled example, TaskForge, after a first take:

   ```markdown
   ## Rehearsal log
   Recording: https://youtu.be/<unlisted>, 5:41, this week

   | Question | 0-2 | Note |
   |---|---|---|
   | Clarity | 2 | the ten-word line landed at 0:12 |
   | Problem | 1 | said "developers struggle"; P3's story was on the slide and not in my mouth |
   | Demo | 2 | live site, planner generated a day in 6 seconds |
   | Numbers | 1 | slide 10 still showed the draft table; model says 1,454 at month 12 |
   | Ask | 1 | said 3,000; model says ~2,500 |
   | Delivery | 1 | read slide 9 word for word |
   | Timing | 0 | 5:41; slides 5 and 9 ran long |

   GLOW: the switch to the live product at 1:50 was the most convincing forty seconds.
   GROW 1: tell P3's story on slide 2 instead of the adjective.
   GROW 2: render slide 10 and 11 from runway.js before take 2.
   GROW 3: cut slide 9 to three rows and say the moat in one sentence.

   ## Expected questions
   | Question | Answer | Source |
   |---|---|---|
   | What is your CAC really? | $40 is hypothetical; the measured figure arrives after the month-1 ad test | assumptions sheet |
   | Why not customer-fund this? | the pre-sale covers the pilot; the hire is what needs the raise | fundraising-research.md |
   | What if churn is 15%? | ~2,050 subscribers at month 18, lowest cash ~$205K, plan survives | runway.js scenario 2 |
   | Who else does this? | Todoist, Linear, Notion; none plan tasks from code context | slide 9 |
   | What do you own after this round? | 60% with no pool, 52.8% with a 10% pool | cap-table.md |
   ```

8. Fix the three GROWs and record take 2. Score it the same way. The second table is the one that goes in the log, with the first kept above it so the change is visible.

9. Export the deck as PDF to `docs/pitch-deck.pdf` and commit everything.

   ```bash
   git add docs/runway.js docs/financial-narrative.md docs/pitch-deck.md docs/pitch-deck.pdf
   git commit -m "docs: cash model, reconciled deck and narrative, rehearsal log"
   git push
   ```

## The quest

![](diagram:session-11-4/fig3-evidence)

One deliverable, the unit's: the reconciled deck and narrative with the runway check, in the capstone repo. Concretely, `docs/pitch-deck.md` with the Slides link, the rehearsal log, and the expected questions; `docs/pitch-deck.pdf`; `docs/financial-narrative.md` with the assumptions sheet, the runway check, and two scenarios; `docs/runway.js`; and the recording, linked or in `docs/pitch/`. Score yourself honestly on this before you call it done.

| Area | Points | Done means |
|---|---|---|
| Problem and solution (slides 2, 3) | 12 | A named person's specific pain with evidence; one value proposition in plain words |
| Product (slide 4 and the live switch) | 10 | Two real screenshots and a working live demo in the recording |
| Market (slide 5) | 10 | Count times price, sources and dates beside the inputs, SOM said out loud |
| Business model and traction (slides 6, 7) | 12 | Prices, CAC and LTV labeled by status; users, paying, MRR, and growth as separate lines |
| Team and competition (slides 8, 9) | 8 | One credential, one unfair advantage; three real alternatives and a one-sentence moat |
| Projections and ask (slides 10, 11) | 14 | Rendered from runway.js; the milestone on slide 11 matches the model's month-18 row |
| Financial narrative | 12 | One printed page; assumptions sheet, runway check, two scenarios, survival sentence |
| Recording and rehearsal log | 12 | Two takes, both scored; three GROWs fixed between them; under 5:00 on take 2 |
| Expected questions | 10 | Five questions with an answer and a source each; at least one answered "not measured yet" |

Evidence that it is done:

- `node docs/runway.js` prints the four check lines, and the same four lines appear under "Runway check" in the narrative with a date.
- Slides 10 and 11 contain numbers that appear in that output, and `docs/pitch-deck.md` says reconciled with a date.
- The rehearsal log has two scored tables and three GROWs that changed between them.
- The expected-questions table has five rows with sources that are files in `docs/`.
- `docs/pitch-deck.pdf` exists and the Slides link opens with view access.
- Everything is committed and pushed.

If the venture-fit paragraph from last session said no, the deliverable is the same. The deck pitches angels, grant committees, a bank, or a co-founder with the same twelve questions, and the model is the first thing any of them will ask to see.

## Side quests

Back-of-the-envelope numbers are the whole method behind `runway.js`, and the long-return mindset is why a second take scored honestly beats a first take described generously.

## Before next session

Unit 12 begins with [Sprint 1: Foundation](/path/12-1-sprint-1-foundation/). It does not start a new app. It takes the capstone you have been deploying since 10-4 and runs four sprints to finish, harden, and polish it, then a recorded demo day. Reread `docs/product-spec.md` and `docs/sprint-plan.md` from Unit 8 before then, and write down the three features the pitch promised that the product does not fully do yet; those become the first sprint's backlog.

Nothing is running between sessions. The deployed capstone stays up at its public URL on its own, and the deck, the narrative, the model, and the recording live in `docs/` and in Google Slides.
