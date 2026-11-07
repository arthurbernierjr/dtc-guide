---
editorial: true
title: Rallying the Villagers
subtitle: Crowdfunding, Community Rounds, and Pre-Sales
hook: "Your capstone is live and takes test payments. Before anyone hands you money, you decide whether you need it at all, and you model what a pre-sale leaves in the bank after fees, delivery, and refunds."
read: 55
artifact: "docs/fundraising-research.md in the capstone repo: a routes comparison, a milestone budget, a pre-sale fulfillment model with three scenarios, three funding histories, one campaign read, and a one-paragraph fundraising thesis"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.sec.gov/resources-small-businesses/exempt-offerings/regulation-crowdfunding
  - https://www.sec.gov/resources-small-businesses/small-business-compliance-guides/regulation-crowdfunding-small-entity-compliance-guide-issuers
  - https://www.kickstarter.com/help/handbook
  - https://docs.stripe.com/payments/checkout
  - https://www.ycombinator.com/safe
say:
  - "Fundraising is a tool, not a milestone. Name the milestone first, then price it."
  - "A pledge is not cash. Fees, delivery, and refunds come out before you can spend it."
  - "A reward is a product you owe. A security is ownership you sold. Never mix the words."
---

## The hook

Your capstone is deployed, it has a persona, it takes a test-mode card, and it has an AI feature behind a rate limit. That is more than most people who ask strangers for money have ever shown. So the question of this unit is not "how do I raise money." It is "do I need other people's money at all, and if I do, what kind, and what do I owe them for it." Today you answer the first half of that for your own product, on paper, with arithmetic you can defend.

By the end of the session you have a file in the capstone repo, `docs/fundraising-research.md`, that compares five ways to fund the next milestone, puts a price on that milestone, models what a pre-sale actually leaves in the account after fees and delivery and refunds, and ends with one paragraph that says which route you would take and why. You can run the pre-sale model here in the browser, change one assumption, and watch a campaign that beat its goal lose money.

> *The villagers want to join the quest, and they are bringing gold. Count what each coin costs before you take it.*

You arrive with: your deployed capstone at its public URL ([10-4](/path/10-4-warding-the-kingdom/)), the interview logs, empathy map, and persona in `docs/research.md` ([8-1](/path/8-1-listening-at-the-tavern/)), the product spec in `docs/product-spec.md` ([8-4](/path/8-4-field-work/)), Stripe Checkout in test mode ([10-2](/path/10-2-sealed-gates/)), and the AI feature ([10-3](/path/10-3-binding-the-great-spirits/)). There is no Village file yet, because both roads start on this page: if you take the Village road, the file you write today is `docs/operating-budget.md`, and it waits in The quest below. Nothing in this unit needs a server running. Nothing in this unit sends a real invoice, opens a campaign, or offers a security. Every number you write is a made-up input until you attach a source and a date to it.

## The idea

The fundraising spectrum runs from zero outside dollars to rounds that make headlines. Where your product sits on it is the first decision you make as a founder, and most people make it backwards: they decide to raise, then look for a reason. Do it the other way. Name the next uncertainty the business has to resolve. A prototype that proves the AI feature is worth paying for. A paid pilot with three real users. A repeatable way to find the persona from `docs/research.md` without you personally messaging each one. Each of those is a milestone with a price. Write the price down. Only then ask which pile of money, if any, buys it.

### Why anyone raises, and why most should not

Companies take outside money for four honest reasons. Speed: hire before revenue can pay for the hire. Scale: infrastructure that has to exist before the customers who justify it. Survival: some models lose money before they make it, marketplaces and hardware especially. Credibility: the right investor opens doors you cannot knock on alone.

Companies should not raise when the product has not found a person who keeps coming back, when the business can be profitable soon without the money, when the founder does not want to share control, or because raising feels like what founders are supposed to do. That last one is the most common and the worst. Mailchimp, Basecamp, and Craigslist were built without venture money; the consulting-to-product pipeline, where services pay the bills while the product grows on the side, is older than the word "startup."

| Factor | Bootstrapping | Raising |
|---|---|---|
| Speed | Slower | Faster |
| Control | Yours | Shared |
| Equity | You keep it | You sell some |
| Pressure | Self-imposed | Someone else's expectations |
| Risk | Your money | Other people's money |
| Network | You build it | Investors open doors |

Ownership is the whole game underneath this table. History pays the people who own a piece of a system, not the people who merely work inside it. The writer who created a beloved show but does not own the rights can be removed from their own story. The creator whose audience lives on someone else's platform can lose it to one algorithm change. You spent ten units learning to build. This unit exists so that when capital enters the picture you know exactly what you are trading away and what you are keeping. Every word you learn this week, equity, dilution, cap, SAFE, is an instrument for one question: how much of what you built do you still own when the dust settles. Investors are not villains. The good ones are force multipliers. But they negotiate ownership for a living and, until this week, you did not.

### Two roads

This unit has two roads through it, and you pick one before the session ends. The first is **The Noble Houses**: you build the investor pipeline, the twelve-slide deck, and the five-minute pitch, and you learn the court's arithmetic by preparing to stand in front of it. The second is **The Village**: you fund the product from your own pocket, from its first paying users, or from the community it serves, and you prepare a short brief for the people who will use it instead of a pitch for the people who might fund it. Both roads read the same hook, the same idea, and the same demonstration in every session, because the literacy is shared. Crowdfunding maths, the SAFE and the cap table, fund maths and bottom-up sizing, the cash model and the reconciliation: a founder on either road who cannot do those is a founder someone else can take advantage of. What differs is the quest. Each session's quest has a Noble Houses deliverable and a Village deliverable, and you do the one for your road.

The Village is not the consolation road. Most of the software people rely on every day was never pitched to anyone. The package manager, the text editor, the calendar for the climbing gym, the roster tool for the volunteer fire company, the thing one person built for twelve people who needed it: nobody made a deck for those, and they ship, and they matter. A community tool with ten real users and a bill you can cover is a success by the only measure that counts in this unit, which is whether the thing exists and the people who need it can reach it. If your capstone's persona is twenty people you can name, the Village is probably the honest road. If the venture-fit question in 11-3 comes out as a real yes, the Noble Houses is. Neither answer is better. The wrong answer is picking the road that sounds impressive over the one your evidence supports.

You record the choice in `docs/funding-route.md`: one paragraph that says which road, why, and what would make you switch. You may switch once during the unit, and if you do, you say so in the file with the date and the reason. A reviewer reading that file in Unit 12 should see a decision, not a shrug.

### The five routes, and what each contributor receives

**Bootstrapping.** Revenue, savings, or services pay for the product. Nobody receives anything but the product. Your Stripe Checkout from 10-2, switched from test mode to live keys, is a bootstrapping tool.

**Pre-sales.** A customer pays before the thing is finished. They receive a delivery promise and, usually, a refund right. Dropbox validated demand with a demo video and a waitlist before the product worked. Tesla and game studios take deposits and pre-orders against a date. A pre-sale is a contract to deliver, and the money is not yours until you have delivered or the refund window has closed.

**Rewards crowdfunding.** Many people pay small amounts and receive a reward: the product, a tier above it, a name in the credits. Kickstarter is all-or-nothing; if the goal is not reached nobody is charged. Indiegogo offers flexible funding and a post-campaign store. A backer owns nothing of the company. What they own is your promise. Read the Creator Handbook linked above before you design a campaign; the platform's own rules decide what you may offer.

**Equity crowdfunding under Regulation Crowdfunding.** Many people pay small amounts and receive a security: shares, a SAFE, or a revenue-share note. In the United States this route has a specific legal frame. An eligible company can raise up to $5 million in a 12-month period, every transaction has to go through an SEC-registered funding portal or broker-dealer, and the issuer, which means you, files a Form C disclosure with the SEC before the offering and an annual Form C-AR afterwards. The portal hosts the offering and helps you prepare; it does not file for you. Financial statement requirements step up with the amount raised. Read the SEC's overview and the issuer compliance guide linked above for the current limits and tiers rather than trusting any number on a blog, including this page. Platforms such as Wefunder, Republic, and StartEngine publish their own fee schedules; read the current one on the platform's site, because fees change and are often part cash, part securities.

**Angels and venture capital.** One or a few people, or a fund, buy ownership or a right to future ownership. Those are the next two sessions.

A follower count is not evidence for any of these. Look for behavior: repeated use, an unprompted request for a paid version, a referral, a pilot someone showed up for. A pre-sale page should say what the product does, when it ships, what it does not do yet, and how a refund works. Trust is an asset a campaign spends as well as earns.

### Pledges are not cash

A campaign page shows gross pledges. What reaches your account is gross minus platform fee, minus payment processing, minus failed charges, minus refunds, and what you can spend is that minus the cost of delivering every reward. Separate one-time setup costs from per-unit costs. A campaign can beat its headline goal and still lose money if each additional reward costs more to deliver than it contributes after fees. Pad delivery estimates; underestimating fulfillment is the most common way a funded campaign ends in apology.

Model it as scenarios, not a single confident forecast. A base case, a lower-demand case, and a higher-cost case tell you which assumption matters. Label every number as hypothetical or sourced. The point is to practice reasoning about cash and commitments, not to predict what a real campaign will do.

### Campaign anatomy, if you ever run one

The video carries a rewards campaign: two to three minutes, the problem and the product in the first ten seconds, then solution, demo, who you are, and the ask. Phone footage is fine; bad audio is not. Reward tiers usually run from a small "thanks" tier through an early-bird price on the product, the product at campaign price, a premium bundle, and a limited high tier with something personal. Price the tier you expect most people to pick so that its price times a realistic backer count clears the goal. Build the email list before launch, because the first days decide most campaigns; Kickstarter publishes its own statistics, and the Creator Handbook describes what funded projects did before day one. Treat all of that as the platform's guidance, not as a law.

What you should be able to draw on a napkin: a milestone with a price at the top. Five arrows under it, one per route. On each arrow, two words: what the contributor gets, what you owe. At the bottom, one subtraction: gross, minus fees, minus delivery, minus refunds, equals the money you can plan with.

![](diagram:session-11-1/fig1-model)

## The demonstration

One fictional product, start to finish. Call it Questboard, a task tool for solo developers, the same shape as a capstone built on this path. Its owner's next milestone is a paid pilot: twenty people using the AI planner every week for a month. The milestone budget, written before any route is chosen:

```text
Milestone: 20 weekly-active paid pilot users for 30 days
One-time: landing page copy and a 90-second demo video   $0 (own time)
          model-provider credits for 20 users x 30 days    $300 (hypothetical)
          legal review of the pre-sale terms and refund policy  $600 (hypothetical)
Per unit: onboarding call, 30 minutes each                 $0 cash, 10 hours total
          hosting and AI cost per user per month           $6 (hypothetical)
Total cash needed before the pilot starts:                 ~$900 plus a buffer
```

Nine hundred dollars does not need an investor. It barely needs a pre-sale. That is the first finding, and it is the finding most capstones produce when the milestone is written honestly: the next step is cheaper than the fundraising it would take to pay for it. The routes comparison goes in the file anyway, because the one after that might not be.

Now the pre-sale model, in whole dollars. Questboard offers a founding-member plan: $50 once for a year of Pro, delivered when the pilot ends. Hypothetical inputs: payment processing 3 percent plus a platform fee that together round to 8 percent of gross; per-unit delivery cost $25 for the year (hosting, AI calls, support hours priced at nothing because it is the founder's time); a refund reserve of 10 percent of gross because the policy is "full refund before delivery, no questions"; one-time setup $2,000 for the landing page, legal review, and a month of ads.

```text
Base case: 200 founding members
gross           200 x $50          = $10,000
fees            8% of gross        =  -$800
delivery        200 x $25          = -$5,000
refund reserve  10% of gross       = -$1,000
one-time setup                     = -$2,000
available                          =  $1,200
```

The campaign page would show $10,000. The money you can plan with is $1,200. Now the two other cases. Lower demand: 120 members. Gross $6,000, fees $480, delivery $3,000, reserve $600, setup $2,000, available −$80. The campaign "succeeds" and loses money. Higher cost: delivery turns out to be $35 per member because the AI provider's price per call was a guess. Base demand, available −$800. Per unit, each member contributes $50 − $4 − $25 − $5 = $16 after fees, delivery, and reserve. The $2,000 setup needs $2,000 ÷ $16 = 125 members just to be paid back, so the break-even is 125 members, not the 100 you would guess if the campaign page set a $5,000 goal at $50 each.

Write those three cases into the file with the inputs above them and the word *hypothetical* on every line that is a guess. Then compare routes for the same milestone, in a table whose columns are what the contributor receives, what you owe, and what is left after obligations. For Questboard: bootstrap (nobody receives anything, you owe nobody, $900 from revenue or savings), pre-sale (members receive a delivery promise, you owe delivery and refunds, $1,200 in the base case), rewards campaign (backers receive the reward tier, you owe fulfillment and the platform's rules, similar arithmetic with a larger fee line), Reg CF (investors receive a security, you owe disclosure, Form C, the annual report, and a share of the company, far more than $900 of obligation), angel (a person receives future equity, next session).

Here is the same arithmetic as a small model you can run here. It proves that the subtraction is in the right order and that a per-unit margin decides the break-even. It does not prove anything about a real campaign, a real fee schedule, or a real refund rate; those are numbers you look up on the platform's page the week you need them.

```js run=checkpoint-11-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

// Hypothetical pre-sale, whole dollars. Not a fee quote from any provider.
function presale(input) {
  const gross = input.units * input.price;
  const fees = Math.round(gross * input.feeRate);
  const delivery = input.units * input.deliveryPerUnit;
  const reserve = Math.round(gross * input.refundRate);
  const available = gross - fees - delivery - reserve - input.setup;
  return { gross: gross, fees: fees, delivery: delivery, reserve: reserve, available: available };
}

function breakEvenUnits(input) {
  const perUnit = input.price - input.price * input.feeRate - input.deliveryPerUnit - input.price * input.refundRate;
  return Math.ceil(input.setup / perUnit);
}

const base = { units: 200, price: 50, feeRate: 0.08, deliveryPerUnit: 25, refundRate: 0.10, setup: 2000 };
const b = presale(base);
check(b.gross === 10000, 'gross is units times price');
check(b.available === 1200, 'available cash is gross minus fees, delivery, reserve, and setup');
check(b.available < b.gross, 'gross funding is not available cash');

const lowDemand = presale(Object.assign({}, base, { units: 120 }));
check(lowDemand.available === -80, 'a campaign can clear its goal and still lose money');

const highCost = presale(Object.assign({}, base, { deliveryPerUnit: 35 }));
check(highCost.available === -800, 'a $10 delivery miss per unit erases the margin');

check(breakEvenUnits(base) === 125, 'break-even comes from the per-unit margin, not the goal');

const lines = ['gross', 'fees', 'delivery', 'reserve', 'available'];
for (const line of lines) console.log(line + ': ' + b[line]);
console.log('ok: checkpoint-11-1');
```

Change `units` to 120 and `deliveryPerUnit` to 35 at the same time and predict the number before you run it. Then put the base case back. The file you write below has the same shape as this function: inputs at the top, subtraction in order, one line at the bottom you can plan with.

## Where it breaks

![](diagram:session-11-1/fig2-diagnosis)

### Pledges treated as profit

The campaign page shows $10,000 and the plan spends $10,000. The cause is that the subtraction was never written: platform fee, processing, failed charges, refunds, delivery, and tax all come out before the first dollar is yours, in an order the platform decides and on a date later than you think. The fix is the model above, in the file, before the plan. If the "available" line is smaller than the milestone budget, the route does not fund the milestone, and the campaign page's big number does not change that.

### Reward and security confused

The landing-page copy says "back us and own a piece of Questboard" under a $50 pre-order button. The cause is treating a reward and an investment as the same event because both are money coming in. A reward is a product you owe. A security is ownership you sold, with rules about who may be offered it, through which intermediary, and what you must disclose first. The fix is one sentence on every page and in every table: what does the contributor receive. If you cannot answer in one word, product or security, stop writing copy and read the SEC overview linked above. Mixing the words is how a small campaign picks up an obligation it never meant to sell.

### Audience assumed

The projection says two percent of "everyone who manages side projects" will buy, and you have not spoken to any of them. The cause is a percentage applied to a guessed population; a market is not demand. The fix is a small test with people you can name: the interviewees from `docs/research.md`, anonymised as P1, P2, and so on, a waitlist, a pre-order, a letter of intent. Build the projection from what those people did, not from a slice of a headline. If the test is quiet, the plan is what changes, not the headline font.

## Your turn

Everything happens in the capstone repo. Open a terminal there.

On the Village road, steps 1, 3, 4 and 6 are yours as written. In step 2 fill the milestone section and the routes table, and leave the pre-sale model, the three companies and the thesis paragraph to The quest, which makes the first two optional and replaces the third; step 5 is optional on your road for the same reason. Your own file, `docs/operating-budget.md`, is in The quest below.

1. Create the file and confirm the folder is the one Unit 8 made.

   ```bash
   cd ~/projects/<capstone-name>
   ls docs
   ```

   You should see `research.md`, `user-stories.md`, `sprint-plan.md`, `product-spec.md`, and `board-sprint-1.png`, plus `system-design.md` from Unit 9 and `threat-model.md`, `payments.md`, `ai-feature.md` and `security-audit.md` from Unit 10. If `docs/` is missing you are in the wrong folder; `ls ~/projects` and look again.

2. Copy this into `docs/fundraising-research.md` and fill it in. Keep the headings; the next three sessions read this file.

   ```markdown
   # Fundraising research: <capstone-name>

   All numbers are hypothetical unless a source and date follow them.

   ## The next milestone
   What it is:
   Why it is the next uncertainty to resolve:
   One-time costs:
   Per-unit costs:
   Cash needed before it starts:

   ## Fundraising fit
   1. Can the product earn revenue within 3 months without outside money? (yes/no, why)
   2. Do I need to hire before I can grow? (yes/no, why)
   3. Is the market winner-take-all? (yes/no, why)
   4. Do I want to keep 100% ownership? (yes/no, why)
   5. Is there a community of people who already use it? (yes/no, evidence)
   6. 12-month revenue without funding: $
   7. What $50K buys that I cannot do without it:
   8. What $500K buys:

   ## Routes for this milestone
   | Route | Contributor receives | I owe | Left after obligations |
   |---|---|---|---|
   | Bootstrap | | | |
   | Pre-sale | | | |
   | Rewards campaign | | | |
   | Reg CF | | | |
   | Angel | | | |

   ## Pre-sale model
   Inputs (price, fee rate, delivery per unit, refund rate, setup):
   Base case:
   Lower demand:
   Higher cost:
   Break-even units:

   ## Three companies and how they funded their early stage
   1.
   2.
   3.
   (where found: Crunchbase, press, founder interviews, podcasts; give the link and date)

   ## One campaign, read closely
   Platform, goal, outcome, video, tiers, what I would copy, what I would not:

   ## Landing-page copy
   Headline:
   Subheadline (who it is for, why):
   Three to five benefits in the buyer's words:
   Price:
   Call to action (pre-order, join waitlist, buy now):
   Delivery date and refund policy:

   ## Fundraising thesis
   One paragraph: which route, how much, what it buys, and what I would still own.

   ## Open questions
   -
   ```

   A filled example of the three sections people get wrong, using Questboard:

   ```markdown
   ## The next milestone
   What it is: 20 paid pilot users active every week for 30 days
   Why: the AI planner is the feature people say they want; nobody has paid for it yet
   One-time costs: $300 model credits (hypothetical), $600 legal review of terms (hypothetical)
   Per-unit costs: $6/user/month hosting and AI (hypothetical, from the 10-3 usage log)
   Cash needed before it starts: ~$900 plus a 20% buffer = about $1,100

   ## Pre-sale model
   Inputs: $50 once, 8% fees, $25 delivery per member, 10% refund reserve, $2,000 setup
   Base case: 200 members, available $1,200
   Lower demand: 120 members, available -$80
   Higher cost: $35 delivery, available -$800
   Break-even units: 125

   ## Fundraising thesis
   Questboard does not need outside money for its next milestone. The pilot costs
   about $1,100 and the founding-member pre-sale leaves $1,200 in the base case,
   so it covers the pilot with about $100 to spare and does not cover it at all
   in the lower-demand case, while leaving 100% ownership intact. I would run the pre-sale
   to 200 members, cap it there, and revisit an angel round only if the pilot
   shows weekly retention above 60% and a channel that finds the persona
   without my inbox.
   ```

3. Answer the eight fit questions honestly, then read the answers out loud to yourself once and mark the one you cannot defend. That answer is where your research goes first.

4. Write the landing-page copy in a buyer's words, not a developer's. Read it to one person you know who does not write code, or record yourself reading it and listen back. Note the first sentence they would not understand, and rewrite that sentence.

5. Run the pre-sale model with your own inputs by changing the numbers in the checkpoint above, and paste the five output lines under "Pre-sale model" in the file.

6. Commit.

   ```bash
   git add docs/fundraising-research.md
   git commit -m "docs: fundraising research for the next milestone"
   git push
   ```

   The output ends with a line like `main -> main`, and `wc -w docs/fundraising-research.md` prints a number over 600 if the file is filled in rather than copied.

## The quest

![](diagram:session-11-1/fig3-evidence)

Two roads, so two deliverables, and you do the one for your road. Both roads also write `docs/funding-route.md` today, because the choice is the first thing the rest of the unit depends on.

**The Noble Houses road.** One deliverable: `docs/fundraising-research.md`, complete, committed, and pushed. Evidence that it is done rather than copied:

- The milestone has a dollar figure with one-time and per-unit costs separated.
- The routes table has all five rows filled, and every "contributor receives" cell says either a product, a promise, or a security.
- The pre-sale model shows three cases and a break-even count, with the word *hypothetical* on every guessed input.
- Three companies, each with a link and the date you read it; one campaign read with its goal and outcome.
- The landing-page copy was read to one non-technical person or recorded and listened back, and the sentence you rewrote is marked.
- The thesis paragraph names a route, an amount, what it buys, and what you would still own, and "raise nothing right now" was considered as a real option.
- The commit is on GitHub.

**The Village road.** One deliverable: `docs/operating-budget.md`, which says what the deployed capstone costs to keep alive each month, today, with the numbers taken from the bills you can see and not from a guess. You still fill the milestone section and the routes table of `docs/fundraising-research.md`, because the Village has to know what it is turning down; the pre-sale model and the three company histories are optional on this road, and the thesis paragraph is replaced by the decision at the bottom of the budget file. Copy this in and fill it:

```markdown
# Operating budget: <capstone-name>

Every number is read off a bill or a dashboard, with the date. Guesses say so.

## What it costs today, per month
| Line | Amount | Where I read it | Date |
|---|---|---|---|
| Hosting (Railway usage page, or the 6-1 droplet) | $ | | |
| Database (Railway add-on usage, or the Atlas free cluster) | $ | | |
| Domain (renewal price from docs/domain.md, divided by twelve) | $ | | |
| Model credits (AI_DAILY_TOKEN_BUDGET x users x the pricing page x 30 days) | $ | | |
| Anything else with a card on file | $ | | |
| Total per month | $ | | |

## What the first ten paying users would change
Price per user per month:
Collected after the processor's cut (price x 0.97, rounded):
Ten users collect:
That covers the total above: yes / no, by $
What ten users cost me that zero users do not (support time, model credits):

## A pre-sale or community round
Yes / no:
Reasons:
If yes: how much, from whom, what they receive, what I owe:

## Raise nothing
This is a decision, not a default. Reasons:
What would make me revisit it (a number, not a feeling):
```

What goes in the hosting line depends on where you deployed in 10-4. On Railway the plan is usage-based and the number is on your project's usage page this month; the course prints no figure for it because the price list moves, and [9-5](/path/9-5-grand-architecture/) links the pricing page. On the Unit 6 droplet the figure is the one [6-4](/path/6-4-opening-the-world-gate/) states: $6.00 a month at the time of writing, with a snapshot at $0.06 per GB per month if you ever pause it. The Atlas free cluster is $0 and says so in its own row. The domain renews once a year at the price you wrote in `docs/domain.md` in Unit 6; divide it by twelve. Model credits are the daily token budget from 10-3 multiplied by the users you expect and the rate on the provider's pricing page, then by 30, because the budget is per day and every line in this table is per month. Do that once in this file and date it, not in code.

Evidence that the Village deliverable is done rather than copied:

- Every line in the cost table has a source and a date, and the total is a sum you can recompute.
- The ten-user section answers yes or no to "covers the bill" with the dollar gap either way.
- The pre-sale or community-round section has a yes or a no with reasons, and if yes, the four words from the routes table: receives, owe.
- "Raise nothing" is written as a decision with reasons and a number that would change it.
- The milestone and the routes table in `docs/fundraising-research.md` are filled.
- Both files are committed and pushed.

**Both roads.** `docs/funding-route.md`, one paragraph: which road, why, and what would make you switch. Commit it with today's deliverable.

```bash
git add docs/funding-route.md docs/fundraising-research.md
git commit -m "docs: funding route chosen"
git push
```

On the Village road, add `docs/operating-budget.md` to the first line. Do not add it on the Noble Houses road: `git add` refuses a path that does not exist and stages nothing at all, and the commit that follows has nothing in it.

Next session reads the thesis paragraph on the Noble Houses road and the "raise nothing" decision on the Village road, and asks what happens to the ownership number inside each.

## Side quests

Back-of-the-envelope numbers are the whole method of this session's model, and the long-return mindset is why "raise nothing now" is a legitimate answer rather than a failure.

## Before next session

Next session is [The Noble Houses](/path/11-2-the-noble-houses/): angel investors, the post-money SAFE, dilution arithmetic, and a fictional term sheet with red flags in it. Read the YC SAFE page linked above once, just the "how it works" part; you will read the actual document next time. Bring your thesis paragraph, because the first thing you do is put a number on the ownership it promises. On the Village road, bring the "raise nothing" decision instead, because next session puts a number on what a single founder owns and what a future collaborator would earn.

Nothing is running between sessions. The deployed capstone stays up at its public URL on its own; no local server was started today and none needs stopping. What carries forward is `docs/fundraising-research.md` and `docs/funding-route.md` on both roads, plus `docs/operating-budget.md` on the Village road.
