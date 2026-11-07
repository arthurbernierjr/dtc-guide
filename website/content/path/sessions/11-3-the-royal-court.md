---
editorial: true
title: The Royal Court
subtitle: Venture Capital, Pitch Decks, and the Raise
hook: "A venture fund's arithmetic decides what it can invest in before it ever sees your deck. Today you run that arithmetic, decide honestly whether your capstone fits, and start the twelve slides around the product you already deployed."
read: 60
artifact: "docs/pitch-deck.md and docs/financial-narrative.md in the capstone repo: a venture-fit paragraph with a non-venture alternative, a twelve-slide outline with slides 1 to 4 filled from the deployed capstone and a Google Slides link, bottom-up market arithmetic with sources, a one-page financial narrative, and a pipeline table and data-room index"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.ycombinator.com/library/4b-how-to-pitch-your-company
  - https://www.ycombinator.com/library/2u-how-to-build-your-seed-round-pitch-deck
  - https://support.google.com/docs/answer/2763168
  - https://www.ycombinator.com/safe
  - https://www.sec.gov/resources-small-businesses
say:
  - "A fund has to return its whole size several times over, so each winner has to return the fund. That is the filter, not the deck."
  - "Market size is a count you can defend times a price someone pays, with the source next to it."
  - "Users, dollars collected, pilots with dates, and signed letters are four different facts. Never add them up."
---

## The hook

The villagers bring small coins and the nobles bring their own gold. The court brings other people's money, a lot of it, and a rule about what it is allowed to buy. A venture fund has promised its backers a multiple of the whole fund, and almost every company it backs will return nothing, so the few that work have to return everything. That arithmetic is the filter. A profitable company earning $2M a year is a wonderful business and a bad venture investment, and nothing on a slide changes that. Today you run the numbers, decide whether your capstone is that kind of company, and build the deck either way, because the twelve slides are how you explain any business to anyone with money.

By the end of the session you have a Google Slides deck with twelve titled slides, the first four filled from your deployed capstone, a market-size calculation built from the bottom up with a source beside each input, and a one-page financial narrative that says how the product makes money and when it would pay for itself. All of it lives in `docs/` in the capstone repo. Next session you build the cash model that tests every number in it.

> *The herald reads the rule of the court before you speak: whatever you ask for, it must be able to return the treasury ten times over, or the court cannot hear you.*

You arrive with `docs/fundraising-research.md` ([11-1](/path/11-1-rallying-the-villagers/)) and `docs/cap-table.md` ([11-2](/path/11-2-the-noble-houses/)), the deployed capstone at its public URL, the empathy map and persona in `docs/research.md`, and the product spec in `docs/product-spec.md`. On the Village road you arrive with `docs/operating-budget.md` and `docs/ownership.md` in place of the cap table. You need a Google account to use Google Slides, the default slide tool for this unit; Keynote, PowerPoint, or Canva work the same way if you already use one. Every valuation, round size, and rate on this page is a made-up input or a rule of thumb, and it says which.

## The idea

A venture capital firm raises a pool of money, the fund, from institutions and wealthy families and invests it in startups on their behalf. The people running the firm charge a management fee on the fund and keep a share of the profits, the carry. They sit on boards. They answer to the people whose money it is. Everything a VC does in a meeting with you follows from that structure.

### The arithmetic that runs the court

Take a fictional $100M fund whose backers expect three times their money. The fund has to return $300M. It invests in twenty companies. Most fail; say fifteen return little or nothing. The other five have to return the whole $300M between them, so each winner has to send $60M back to the fund. Now the step most explanations skip: the fund does not own the winner, it owns a stake in it. If the fund invested $5M for 20 percent, then for its 20 percent to be worth $60M the company has to be worth $300M at exit. Not $60M. That is why a fund cannot invest in a company whose best case is a $20M sale, however good the business is. The company would have to be a winner and still would not move the fund.

| A fund can fund | A fund cannot fund |
|---|---|
| Software with a very large market | A local restaurant |
| Products that get stronger with each user | A consulting firm |
| Platforms other businesses build on | A lifestyle business |
| Deep technology with a moat | A nice-to-have tool |
| Something that could grow a hundredfold | Something that cannot |

Rounds have names, pre-seed, seed, Series A, B, C, and each name roughly maps to a stage: idea and early product, product and early traction, product-market fit and growth, scaling what works. The dollar sizes attached to those names move every year, and any figure printed here would be wrong by the time you read it. Carta and PitchBook publish current medians; the YC library articles linked above describe what each stage is for. Learn the stage, look up the number the month you need it.

Vocabulary you will hear: due diligence, the investigation before the money, including code review, financial review, customer calls, and background checks; lead investor, the one who sets terms and writes the largest check, with others following; syndicate, several investors pooling into one deal; portfolio, everything a fund has backed; exit, the sale or public listing where investors get money back.

### Does your capstone fit

Answer this before you write a slide. Could this product, in a market you can describe, become a company worth hundreds of millions? If yes, venture is a tool for you and the deck is a pitch. If no, the deck is still useful, because angels, banks, grant committees, and your own co-founder ask the same twelve questions, and the honest version of the fit paragraph says which route you would use instead. Separate your own goals from the financing story: how much control you want, how fast you want to grow, how much risk you can carry. A pitch that assumes every company must chase the same scale hides a bad fit, and investors can smell it.

### Evidence gives the story its weight

A pitch connects a problem, a user, a solution, a market, a business model, and a team that can execute. Every claim needs support appropriate to its stage. Interviews from `docs/research.md` support a problem; they do not prove revenue. A letter of intent is not a contract. A pilot is not recurring revenue. A user who signed up and never came back is not a user. Label each of these for what it is; an investor who finds one inflated number stops believing the rest.

Market size is a count times a price, built from the bottom. Start with a segment you can count, from a source with a date. Multiply by what one of them pays per year for your product. That is the serviceable market. The slice you can reach in two to three years with the channels you actually have is the obtainable market. A headline industry total is not your market, and "one percent of a $7B market" is the sentence that ends more pitches than any other. Show the arithmetic and the source beside each input, and show the sensitivity when an input is a guess.

### The ask connects money to milestones

State how much, what it funds, and which milestone it reaches. Separate hiring, marketing, infrastructure, and reserve. A runway number comes from net cash burn over time, not from a raise divided by an average, which is why next session builds a month-by-month model. Name the single assumption the milestone tests. An investor often judges your understanding of uncertainty more than the size of the opportunity.

The process behind the deck is a pipeline with records: a target list of firms and people who invest at your stage and in your category, built from their portfolios and public theses; an introduction path for each, since a warm introduction through a founder they backed works far more often than a cold message, as a rule of thumb rather than a measured rate; a first meeting, usually a short pitch and a longer conversation; a meeting with the whole firm; diligence over weeks; a term sheet; a close weeks after that. Keep a table with firm, person, introduction source, stage, next action, and date, and keep real contact details out of the public repo. Keep a data-room index ready: company basics, product evidence, financial assumptions, the cap table, legal documents. A polished deck is only useful when the facts behind it survive questions.

### The twelve slides

The deck is not a document. It is a visual aid for a story you tell. One message per slide, readable from across a room, with your voice carrying the rest. In the order investors expect: title, problem, solution, product, market, business model, traction, team, competition, projections, the ask, contact. Twelve is the ceiling, not the target.

What you should be able to draw on a napkin: a fund at the top with a multiple next to it, an arrow down to one company with a stake percentage, and the exit value that stake has to reach. Under it, twelve small boxes in a row, with the word "evidence" written under the problem, market, and traction boxes, because those are the three a listener checks.

![](diagram:session-11-3/fig1-model)

## The demonstration

One fictional company, TaskForge, an AI task planner for solo developers, with the shape of a capstone built on this path. Hypothetical numbers throughout, marked as draft; next session's model replaces the ones it disagrees with. For each slide, the weak version and the strong one, and what a listener would notice.

**Slide 1, title.** Name, a one-line description in ten words or fewer, your name and contact. "TaskForge. AI project management for solo developers." A bold claim is optional: "Solo devs ship more when something keeps the plan."

**Slide 2, problem.** Weak: "Project management is hard." Strong: a specific person from your empathy map and a number you can source. "P3 keeps four client projects in three apps and a notebook, and abandoned two side projects this year because the next task was never written down." If you have a sourced statistic, use it with the source; if you have interviews, use the interviews and say how many.

**Slide 3, solution.** One value proposition. Weak: "an AI-powered, cloud-native productivity platform." Strong: "TaskForge breaks any project into daily tasks and checks in when a day goes quiet." A screenshot does more than an adjective here.

**Slide 4, product.** Two screenshots of the deployed capstone, or a fifteen-second recording, with the moment that makes someone say "oh" highlighted. You built the thing; most people pitching do not have this slide.

**Slide 5, market.** Bottom-up, with sources.

```text
Count:   solo developers in the US who freelance or run side projects
         (hypothetical 2,000,000; replace with a sourced count and date)
Pay:     those who already pay for a project tool, hypothetical 15%
         = 300,000 accounts
Price:   $12 per month = $144 per year
SAM:     300,000 x $144 = $43,200,000 per year
SOM:     3,000 paying accounts in three years = $432,000 per year
```

Say the SOM out loud. Four hundred thousand dollars a year is a good business and not a venture outcome, and the market slide is where that becomes visible. The strong version of this slide says so and shows the adjacent segment, teams, that would change the count. The weak version says "the project management market is $7.1B."

**Slide 6, business model.** Free tier, one project. Pro at $12 a month, unlimited projects and the AI planner. Team at $29 per seat, planned. Current, hypothetical: 500 free users, 47 Pro subscribers, $564 MRR. Target: 3,000 Pro subscribers, $36K MRR, by month 18. Under it, the unit economics: CAC $40 through content and small ads, ARPU $12 a month, ten-month average retention, so LTV $120 (12 × 10) and a 3:1 ratio (120 ÷ 40). All hypothetical, all labeled.

**Slide 7, traction.** Numbers, not adjectives. Total users, active users, paying users, MRR, growth rate, each as its own line. 47 paying from 31 a month earlier is a 52 percent month-over-month jump on a very small base, and the slide says both halves of that sentence. If you are pre-revenue, show the waitlist, the pilots with dates, the letters of intent, separately.

**Slide 8, team.** Photo, name, role, one credential each. Solo is fine; the unfair advantage of a founder from this path is one sentence: you built the entire product and you understand the business.

**Slide 9, competition.** Never "there are no competitors." A table with three real alternatives and the dimensions that matter to the persona.

```text
                TaskForge   Todoist    Linear     Notion
AI task plan    yes         no         no         basic
Built for solo  yes         generic    teams      generic
Code-aware      yes         no         yes        no
Price           $12/mo      $5/mo      $8/seat    $10/mo
```

Your moat is what makes you hard to copy: data, community, a workflow nobody else owns. Say which one.

**Slide 10, projections.** Three years, one table, draft.

```text
Year 1:  $72K ARR    (500 Pro subscribers x $12 x 12)
Year 2:  $480K ARR   (3,000 Pro by month 18, Team plan from month 19)
Year 3:  $2.4M ARR   (10,000 Pro plus Team)
```

Check the multiplication on every line. 500 × 12 × 12 is $72,000; 600 would be $86,400, and a deck with that error on it tells the room you did not check. State the assumptions underneath: conversion, churn, channels. Next session's model replaces this table with whatever the cash model says, and the slide is labeled draft until then.

**Slide 11, the ask.** "Raising $500K. 40 percent engineering, one full-stack hire. 25 percent marketing. 20 percent operations, hosting, tools, legal. 15 percent reserve. This reaches 3,000 Pro subscribers and cash-flow break-even in 18 months." Specific amount, specific uses, one milestone. "Money to grow" is not an ask.

**Slide 12, contact.** Name, email, site, product URL, and the sentence "Thank you. Questions?" A QR code to the live product is a nice touch.

### The one-page financial narrative

A companion document that tells the money story in prose, one page when printed. Copy this into `docs/financial-narrative.md` and fill it in; the filled TaskForge version follows. Both roads fill it. On the Village road the raise line reads $0, and CAC and LTV stay: CAC is what the first ten users cost you, from `docs/operating-budget.md`, and LTV is the price times the months those users stay.

```markdown
# Financial narrative: <capstone-name>

Draft. Hypothetical unless a source and date follow the number.

## Revenue model
<Product> earns revenue through <pricing model>. The primary plan costs $<X> per
<period> and provides <value>. A second plan at $<Y> per <period> serves <segment>.

## Unit economics
- CAC: $<X> (through <channels>)
- ARPU: $<X> per month
- LTV: $<X> (based on <N> months average retention)
- LTV:CAC: <X>:1

## Current traction
As of <date>: <X> total users, <Y> paying customers, $<Z> MRR, <X>% month-over-month.

## Projections
- Year 1: $<X> ARR (<Y> customers; <assumptions>)
- Year 2: $<X> ARR (<Y> customers; <assumptions>)
- Year 3: $<X> ARR (<Y> customers; <assumptions>)

## Key assumptions
- Monthly churn: <X>%
- Free-to-paid conversion: <X>%
- Growth channels: <list>

## Use of funds
Raising $<X>, or $0 on the Village road, to reach <milestone>:
- <X>% <category>: <specific use>
- <X>% <category>: <specific use>
- <X>% <category>: <specific use>

## Path to profitability
Break-even at <N> paying customers, which covers monthly costs of $<Z>.
Expected by <month/year>, at the current growth rate.
```

Filled for TaskForge:

```markdown
# Financial narrative: TaskForge

Draft. Hypothetical unless a source and date follow the number.

## Revenue model
TaskForge earns revenue through subscriptions. Pro costs $12 per month and
provides unlimited projects and the AI planner. A Team plan at $29 per seat per
month, planned for month 19, serves small agencies.

## Unit economics
- CAC: $40 (content and small ads; hypothetical)
- ARPU: $12 per month
- LTV: $120 (based on 10 months average retention; hypothetical)
- LTV:CAC: 3:1

## Current traction
As of this month: 500 total users, 47 paying customers, $564 MRR, 52% month-over-month
on paying customers (47 from 31; one month, small base).

## Projections
- Year 1: $72K ARR (500 Pro; 500 x $12 x 12)
- Year 2: $480K ARR (3,000 Pro by month 18, Team plan from month 19)
- Year 3: $2.4M ARR (10,000 Pro plus Team)

## Key assumptions
- Monthly churn: 10%
- Free-to-paid conversion: 9.4% (47 of 500)
- Growth channels: content, developer communities, small paid ads

## Use of funds
Raising $500K to reach 3,000 Pro subscribers and cash-flow break-even in 18 months:
- 40% engineering: one full-stack hire
- 25% marketing: content, ads, community
- 20% operations: hosting, model credits, tools, legal and accounting
- 15% reserve

## Path to profitability
At the current cost base of $900 per month, break-even is 78 Pro customers
(900 / (12 x 0.97), rounded up; the processor keeps 3%). At a funded cost base of about
$26,000 per month (a rough guess at founder, engineer, hosting, legal and early
marketing, written before the model), it is 2,234 Pro customers
(26,000 / (12 x 0.97)). The cost base steps up as marketing
does, so next session recomputes break-even per step from the cash model, and
the month it happens comes from that model, not from this page.
```

Here is a small model you can run here. It proves the fund arithmetic, the ARR multiplication, and the bottom-up market shape. It does not prove that any of these inputs is true; the sources you attach in the file do that, or fail to.

```js run=checkpoint-11-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

// Fictional fund. The stake must return the fund; the company must be worth stake-return / stake.
const fund = { size: 100000000, multiple: 3, companies: 20, winners: 5, stake: 0.20 };
const mustReturn = fund.size * fund.multiple;
const perWinner = mustReturn / fund.winners;
const exitNeeded = perWinner / fund.stake;
check(mustReturn === 300000000, 'a $100M fund at 3x has to return $300M');
check(perWinner === 60000000, 'five winners each return $60M to the fund');
check(exitNeeded === 300000000, 'a 20% stake returning $60M means a $300M exit, not a $60M one');

// Projection slide arithmetic.
function arr(subscribers, monthlyPrice) {
  return subscribers * monthlyPrice * 12;
}
check(arr(500, 12) === 72000, '500 subscribers at $12 is $72K ARR');
check(arr(600, 12) === 86400, '600 subscribers at $12 is $86.4K, not $72K');
check(arr(3000, 12) === 432000, '3,000 Pro subscribers is $432K ARR before the Team plan');

// Bottom-up market: a count you can defend times a price someone pays.
const market = { count: 2000000, payingShare: 0.15, annualPrice: 144 };
const sam = market.count * market.payingShare * market.annualPrice;
const som = 3000 * market.annualPrice;
check(sam === 43200000, 'SAM: 300,000 paying accounts times $144');
check(som === 432000, 'SOM: 3,000 accounts in three years, a business and not a venture outcome');
check(som / sam === 0.01, 'the obtainable share here is one percent of the serviceable market');

console.log('exit needed for one winner: ' + exitNeeded);
console.log('SAM: ' + sam + '  SOM: ' + som);
console.log('ok: checkpoint-11-3');
```

Change `stake` to 0.10 and predict the exit before you run. Then change `winners` to 2. Both moves are things a fund does when it talks about "ownership targets" and "power law," and now you know what the words cost.

## Where it breaks

![](diagram:session-11-3/fig2-diagnosis)

### Funding mistaken for product success

The deck leads with the round and the product is slide nine. The cause is confusing two stories: who pays for the product and why they keep paying, and how much capital that plan needs. The fix is to keep them in order. Problem, solution, product, evidence first; the ask near the end, derived from the plan. A closed round is not traction, and a listener who sees you treat it as traction will assume the real traction slide is thin. A company can raise and still have nothing anyone wants.

### Market size invented

The slide says $7.1B because a report said so, and your product is a narrow tool inside one job. The cause is top-down sizing: a headline total with a percentage applied to it. The fix is the bottom-up calculation in slide 5, a count you can source, a price someone pays, the slice you can reach with the channels you have, and the source beside each input. If the honest number is $432K, say it, and show the adjacent segment that changes it. An investor who checks will ask for the inputs anyway; a number you built can survive that and a number you found cannot.

### Pitch overstates traction

"Users" on slide 7 includes signups who never returned, a pilot that was a favor, and revenue that is one pre-order. The cause is adding four different facts into one bigger number. The fix is four lines: users who did the core action, dollars collected, pilots with a start date, and letters that commit to something. A combined number feels stronger in the room and collapses on the first question. The question comes. Have the split ready.

## Your turn

Open a terminal in the capstone repo and a browser at slides.google.com, signed in to your Google account. If you prefer another slide tool, use it; the file names below do not change.

On the Village road, steps 1 to 3 are replaced by the four slides and `docs/stakeholder-brief.md` in The quest below, so the instruction in step 2 to fill slides 1 to 4 of the twelve is not yours. Steps 4 to 7 are shared, and in step 7 the first path on the git add line is `docs/stakeholder-brief.md` in place of `docs/pitch-deck.md`.

1. Create a new presentation named `<capstone-name> pitch` and add twelve slides with only their titles: Title, Problem, Solution, Product, Market, Business model, Traction, Team, Competition, Projections, The ask, Contact. Twelve titled slides, nothing else yet. Copy the share link with view access.

2. Fill slides 1 to 4 from the capstone now. Slide 1: name and the ten-word line. Slide 2: one person from the interview logs in `docs/research.md`, anonymised as P1, P2, and so on, and the specific thing they could not do. Slide 3: the one-sentence value proposition from `docs/product-spec.md`. Slide 4: two screenshots of the deployed capstone at its public URL, with the moment you want noticed circled.

3. Copy this into `docs/pitch-deck.md` and fill in the parts you have. This file is the outline and notes; the slides are the visual.

   ```markdown
   # Pitch deck: <capstone-name>

   Slides: <Google Slides share link, view access>
   Status: draft, slides 1-4 filled

   ## Venture fit
   One paragraph: could this become a company worth hundreds of millions, in what
   market, and why or why not. Then the route I would take if the answer is no.

   ## Slides
   1. Title: <ten-word line>
   2. Problem: <person, specific pain, source or interview count>
   3. Solution: <one value proposition>
   4. Product: <two screenshots, the moment to notice>
   5. Market: <count x price, sources; SAM; SOM>
   6. Business model: <plans, prices, current numbers, CAC, LTV>
   7. Traction: <users / active / paying / MRR / growth, as separate lines>
   8. Team: <name, role, credential, unfair advantage>
   9. Competition: <three alternatives, dimensions, moat>
   10. Projections: <three years, draft, assumptions>
   11. The ask: <amount, uses in %, one milestone>
   12. Contact: <name, email, site, product URL>

   ## Market arithmetic
   Count:   <segment> = <number> (<source>, <date>)
   Pay:     <share who already pay for something like this> = <number>
   Price:   $<X> per year
   SAM:     <count x price>
   SOM:     <reachable accounts in 3 years x price>

   ## Elevator pitch (60 seconds)
   Sentence 1, what I built:
   Sentence 2, who it is for:
   Sentence 3, why it matters:
   Sentence 4, why now:
   Sentence 5, the ask:

   ## Pipeline
   | Firm or person | Role | Intro source | Stage | Next action | Date |
   |---|---|---|---|---|---|
   | | | | | | |

   ## Data-room index
   - Company basics:
   - Product evidence:
   - Financial assumptions:
   - Cap table: docs/cap-table.md
   - Legal:

   ## Rehearsal log
   (filled in next session)
   ```

   The TaskForge elevator pitch, as an example of the five sentences: "I built TaskForge, an AI planner for solo developers. Solo devs juggling several projects abandon the ones where the next task is never written down. TaskForge breaks a project into daily tasks and checks in when a day goes quiet. It has 500 users and 47 paying subscribers after two months. I am raising $500K to reach 3,000 subscribers and break-even in 18 months."

4. Do the market arithmetic for your capstone with a real count. Search for the segment, write the source and the date next to it, and if you cannot find a count, write the count you would need and mark it hypothetical. Fill slide 5 from this section.

5. Copy the financial narrative template above into `docs/financial-narrative.md` and fill every section. Where you have no observed number, write the hypothetical one and say so. Check the ARR lines by multiplication.

6. Record the elevator pitch once on your phone, sixty seconds, no notes. Listen back and write down the sentence where you ran out of breath or out of facts. Fix that sentence in the file. Record it again.

7. Commit.

   ```bash
   git add docs/pitch-deck.md docs/financial-narrative.md
   git commit -m "docs: pitch deck outline, slides 1-4, market arithmetic, financial narrative draft"
   git push
   ```

   `wc -l docs/pitch-deck.md docs/financial-narrative.md` prints two numbers and a total; the total is over 100 if both files are filled rather than pasted.

## The quest

![](diagram:session-11-3/fig3-evidence)

Two roads, and `docs/financial-narrative.md` on both, because the one-page narrative is how anyone, investor or user, learns whether the product can pay for itself.

**The Noble Houses road.** One deliverable in two files: `docs/pitch-deck.md` with its Slides link and `docs/financial-narrative.md`, both committed. Evidence that it is done:

- The venture-fit paragraph gives a yes or a no with a reason, and a non-venture route if the answer is no.
- Slides 1 to 4 exist in the deck with content from the capstone, not placeholders; a reviewer opening the link can see two real screenshots.
- The market arithmetic has a source and a date on the count, and the SAM and SOM are products you can recompute from the lines above them.
- The financial narrative fits on one printed page, and `500 x $12 x 12` style arithmetic checks on every projection line.
- The elevator pitch was recorded twice; the sentence you changed between takes is marked in the file.
- The pipeline table has at least three rows of firms or people who invest at your stage, with the introduction source you would use and no private contact details.
- The data-room index lists where each item lives in the repo.

**The Village road.** One deliverable in two files: `docs/stakeholder-brief.md` with a link to a four-slide deck, and the same `docs/financial-narrative.md`. The four slides replace the twelve, and they are not the first four of the twelve. They are the four things a person who will use the product, host it, test it, or vouch for it needs to see: the problem, the evidence, what works today, and what you need from them. Steps 1 to 3 of Your turn become these four slides and this file; steps 4 to 7 are the same for everyone, with `docs/stakeholder-brief.md` in place of `docs/pitch-deck.md` in the commit. Copy this in:

```markdown
# Stakeholder brief: <capstone-name>

Slides: <share link, view access, four slides>
Status: draft, four slides
Route: the Village (see docs/funding-route.md)

## Slides
1. The problem: <one person's specific pain, in their words, from docs/research.md>
2. The evidence: <P1, P2, P3 and so on; what each said or did; how many of the interviews had this problem>
3. What works today: <two screenshots of the live URL; the flow a user can complete now; one line on what it does not do yet>
4. What I need: <testers and users: how many, by when, and the one thing I will measure. No dollar figure on this slide.>

## Market arithmetic
Count:   <segment> = <number> (<source>, <date>)
Pay:     <share who already pay for something like this> = <number>
Price:   $<X> per year, or $0 with the reason
SAM:     <count x price>
SOM:     <the people and channels I can actually reach in a year, listed, x price>

## Elevator pitch (60 seconds)
Sentence 1, what I built:
Sentence 2, who it is for:
Sentence 3, why it matters:
Sentence 4, why now:
Sentence 5, the ask (users, testers, a host, an introduction):

## Who gets this brief
| Person or group | Why them | How I reach them | Next action | Date |
|---|---|---|---|---|
| | | | | |

## Evidence index
- Problem and interviews: docs/research.md
- Product promise: docs/product-spec.md
- What it costs: docs/operating-budget.md
- Who owns it: docs/ownership.md

## Rehearsal log
(filled in next session)
```

The market arithmetic stays on this road, and the SOM is where it earns its keep. A Village SOM is not a percentage of anything. It is a list: the twelve people in the Discord, the two clubs whose organisers you have met, the mailing list with forty names, each times what they would pay, which may be zero. Ten reachable people at $0 is an honest SOM for a community tool, and writing it down is what stops slide 4 from asking for a thousand users you have no way to find. The ask on slide 4 is a number of people by a date and the one thing you will measure when they arrive: weekly return, a completed flow, a message you did not prompt. Evidence that it is done:

- Four slides exist in the deck with content from the capstone; slide 2 names participants by id and gives the count, and slide 3 has two real screenshots and one sentence about what the product does not do yet.
- Slide 4 asks for a number of testers or users by a date, says what will be measured, and contains no dollar figure.
- The market arithmetic has a source and a date on the count, and the SOM is a list of reachable people or channels times a price, not a percentage.
- The financial narrative fits on one printed page, with a $0 price written as $0 and the arithmetic checked on every line that has one.
- The elevator pitch was recorded twice; the sentence you changed between takes is marked in the file.
- "Who gets this brief" has at least three rows, with no private contact details.
- The evidence index points at files that exist in the repo.

Next session builds the month-by-month cash model. On the Noble Houses road, slides 10 and 11 change to whatever it says; on the Village road, slide 4 and the operating budget do.

## Side quests

Back-of-the-envelope numbers are the method behind the fund arithmetic and the bottom-up market, and the long-return mindset is what keeps you honest when the obtainable market comes out small.

## Before next session

Next session is [War Council](/path/11-4-war-council/): the cash model that tests every number in the deck, the reconciliation of slides 10 and 11 against it, and a recorded five-minute pitch you score yourself. Finish slides 5 to 12 in the deck before then, content first and design last; next session's first step assumes twelve filled slides. On the Village road, finish the four slides instead, and know that next session's recording is a three-minute stakeholder demo rather than the five-minute pitch. Make sure you can record your screen and your voice on your own machine: QuickTime on macOS, Game Bar on Windows, or OBS on anything, and test a ten-second recording so the first real take is not the test.

Nothing is running between sessions. The deployed capstone stays up on its own; the deck lives in Google Slides and its outline in `docs/`, as `pitch-deck.md` on the Noble Houses road or `stakeholder-brief.md` on the Village road, with `financial-narrative.md` beside it on both.
