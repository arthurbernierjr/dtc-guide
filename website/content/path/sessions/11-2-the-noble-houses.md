---
editorial: true
title: The Noble Houses
subtitle: Angel Investors, SAFEs, and Term Sheets
hook: "A fictional cap table, SAFE scenario analysis, and term-sheet questions. Read the actual rights and conversion terms."
read: 60
artifact: "A fictional cap table, SAFE scenario analysis, and term-sheet questions"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.ycombinator.com/safe
say:
  - "Instrument: Read the actual rights and conversion terms."
  - "Scenario: Calculate ownership under explicit assumptions."
  - "Review: Identify dilution, control, and unresolved legal questions."
---

## The hook

In every isekai, there is a moment where a wealthy noble says, "I see potential in you, young adventurer. I will fund your quest... for a share of the treasure." That is an angel investor. They are not lending you gold. They are buying a piece of your future kingdom. And if you do not understand the deal they are offering, you could hand over the keys to your castle without even realizing it.

Today we enter the noble houses. We are going to learn the mechanics of angel investing so well that you could explain it to your parents at dinner. We will dissect SAFE agreements, the most founder-friendly investment instrument ever created, and we will do the dilution math that determines how much of your company you keep after someone else's money comes in. This is the math that most founders fumble, and it costs them dearly.

By the end of today, you will have built a cap table, spotted red flags in a term sheet, and calculated exactly how much of your kingdom you give away when you accept a noble's gold. The numbers do not lie, and once you understand them, nobody can take advantage of you.

---

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Interpret Early-Stage Investment Instruments and Model Ownership Dilution

Analyze SAFE notes, convertible notes, and term sheets to calculate founder dilution and build cap tables that model multi-round fundraising scenarios.

**You will:**
- Explain how SAFE notes work, including valuation caps, discounts, and the distinction between pre-money and post-money SAFEs
- Calculate investor ownership percentages using post-money SAFE conversion formulas
- Build a multi-round cap table showing ownership changes through angel and Series A rounds
- Identify red flags in term sheets, including unfavorable liquidation preferences, anti-dilution provisions, and board control terms

**You should be able to:**
- You will be able to calculate dilution across multiple funding rounds using cap table models
- You will be able to read a term sheet and identify terms that are unfavorable to founders
- You will be able to explain the mechanics of a SAFE note to a non-technical audience

---

**Concept 1: What Angel Investors Are and How to Find Them**

An angel investor is a wealthy individual who invests their own personal money into early-stage startups in exchange for equity (ownership).

**Typical angel check sizes:** $5,000 to $250,000 (average around $25K-$50K)

**Angels vs VCs:**
- Angels: their own money, faster decisions, smaller checks, more personal
- VCs: other people's money (from a fund), slower process, bigger checks, more structured

**What angels look for (in order of importance at the early stage):**
1. **Team:** Are the founders capable, passionate, and coachable? Can they actually build this?
2. **Market:** Is the market big enough that this could be a real business?
3. **Traction:** Do you have users, revenue, waitlist signups, or any proof that people want this?
4. **Product:** Does the product work? Is it solving a real problem? (You have this. Your capstone is live!)

**Where to find angel investors:**
- **AngelList (now Wellfound):** The LinkedIn of startup investing. Create a profile, browse investors.
- **LinkedIn:** Search for "angel investor" + your industry. Look at who invested in companies similar to yours.
- **Warm Intros (the gold standard):** Get introduced through mutual connections. A warm intro converts 10x better than a cold email.
- **Demo Days:** Accelerator programs (Y Combinator, Techstars, etc.) end with demo days where founders pitch to rooms full of angels.
- **Local Meetups:** Startup Grind, 1 Million Cups, local founder/investor meetups
- **Twitter/X:** Many active angels share investment theses publicly. Engage with their content before pitching.

**The pitch meeting:**
- Typically 30-60 minutes
- First 5 minutes: they are deciding if they like you as a person
- Next 10 minutes: your pitch (problem, solution, demo, traction, ask)
- Remaining time: Q&A (this is where deals are won or lost)
- What to bring: your pitch deck (we build this in 11.3), a working demo, and clear answers to "How much are you raising?" and "What will you do with it?"

**Concept 2: SAFE Notes Introduction**

The old way: you want $100K, an investor gives you $100K, and you figure out what percentage of the company they own. But wait... what IS the company worth? How do you value a startup that has $47 in revenue and a dream?

**The problem:** early-stage valuation is basically guessing. Arguments over valuation kill deals.

**The solution:** the SAFE (Simple Agreement for Future Equity)
- Created by Y Combinator in 2013
- Not a loan. Not equity. It is a contract that says: "I am giving you money now, and I will get equity LATER, when you raise a priced round."
- No interest rate. No maturity date (usually). No monthly payments.
- The investor is betting that you will raise a bigger round later, and their SAFE will convert into shares at that point.

**Key SAFE terms:**

*Valuation Cap:*
- A ceiling on the price the investor pays per share
- Example: SAFE with a $5M cap. If your Series A values you at $20M, the angel's shares are priced as if the company were worth $5M. They get 4x more shares than the Series A investors per dollar invested.
- The cap protects the early investor: "I believed in you when you were worth nothing, so I should get a better price than people who invest when you are clearly winning."

*Discount:*
- A percentage discount on the Series A price
- Example: SAFE with a 20% discount. If Series A shares cost $1.00 each, the SAFE investor pays $0.80 per share.
- Typical discount: 15-25%

*Cap vs Discount:*
- Most SAFEs have a cap, a discount, or both (whichever gives the investor a better deal)
- At the very early stage, a cap-only SAFE is most common

*Pre-Money vs Post-Money SAFEs:*
- **Pre-Money SAFE (old style):** The cap does NOT include the money from SAFEs. This means founders do not know their exact dilution until the priced round happens. Multiple SAFEs stack up and dilution is unpredictable.
- **Post-Money SAFE (Y Combinator's current standard):** The cap INCLUDES all SAFE money. Founders know exactly how much dilution each SAFE causes.
- Example: Post-money SAFE, $5M cap, $500K invested = the investor will own an illustrative 10% before new-money dilution, subject to the sample post-money instrument definitions ($500K / $5M)
- This is cleaner math. Most modern SAFEs are post-money.

**Common misconceptions:**
- "A SAFE is free money." No. You are selling future equity. Conversion and dilution depend on the contractual events and terms; an investment can also lose value.
- "Valuation cap = valuation." The cap is a ceiling, not a floor. It only matters at conversion.
- "SAFEs expire." Standard SAFEs have no maturity date. They sit on your cap table until a priced round triggers conversion.

---

![](diagram:session-11-2/fig1-model)

### Read the instrument before calculating

A SAFE is a security that provides contractual rights to future equity under specified events. It is not an ordinary loan, and the standard YC form does not have interest or a maturity date. Different forms and jurisdictions can have different terms. Use the actual sample document and its definitions rather than relying on a social-media summary. [YC SAFE documents](https://www.ycombinator.com/safe).

A valuation cap affects conversion pricing; it is not a guarantee of what the company is worth or what an investor will receive in every outcome. A discount and a cap may interact differently depending on the instrument. Read which mechanism applies and whether the sample form actually includes both. Do not add terms from one template to another without noticing the change.

### Make a simplified scenario explicitly simplified

For a fictional post-money capped SAFE, dividing investment by the post-money cap can illustrate an ownership relationship before new money in a later priced round, subject to the instrument's definitions and conversion mechanics. It does not establish final ownership after that round, option-pool changes, other securities, or unusual terms. Write those assumptions above the arithmetic so the example cannot be mistaken for a complete legal calculation.

Build a cap table with named categories: founders, existing investors, employee pool, converting instruments, and new investors. State the denominator used for each percentage. Check that the final percentages sum to 100 percent in the modeled scenario. A table that omits a category can look precise while allocating ownership incorrectly. Keep units and share counts visible alongside percentages.

### Separate economics from control

Ownership percentage is only one part of a financing. Board composition, protective provisions, information rights, pro rata rights, liquidation preferences, and other terms can affect outcomes. A founder can retain a numerical majority while accepting meaningful constraints. Conversely, a minority investor may have specific negotiated rights. The exercise should identify these categories and generate questions, not reduce every deal to a single valuation number.

Use a fictional term sheet to practice spotting ambiguity and unfavorable interactions. Ask what happens in a low-value sale, a future financing, or a disagreement about company actions. Read definitions and cross-references. A term that looks harmless in isolation may behave differently when combined with another provision. Record the question you would take to counsel instead of inventing certainty.

### Model more than the optimistic exit

Run a lower valuation, a higher valuation, and a follow-on financing scenario. Include an option-pool change if it is relevant to the sample terms. Observe which stakeholders are diluted and when. Do not assume all instruments convert identically or that every investor exercises every right. The model's value is making assumptions inspectable.

This is an educational exercise using fictional values, not a recommendation to sign, offer, or purchase securities. The submission consists of the sample terms, assumptions, calculations, sensitivity cases, and unresolved questions. A strong result explains where the simplified math stops and where professional review of the actual documents begins.

## The demonstration

All companies, valuations, growth rates, fees, and financing amounts in the worked examples are hypothetical classroom inputs unless a source and date are explicitly attached. The examples are not current market benchmarks or individualized legal, tax, or investment advice. Do not offer securities, solicit investment, or send documents as part of this exercise.

**Demo 1: SAFE Mechanics and Worked Examples**

**How a SAFE works, step by step:**
1. Investor gives you $100K via SAFE
2. You use the money to grow
3. Later, you raise a Series A at a $10M valuation
4. The SAFE converts: the investor gets shares based on the terms of the SAFE

**How much to raise on a SAFE:**
- Rule of thumb: raise 12-18 months of runway
- Calculate your monthly burn (rent, servers, tools, food, etc.)
- Multiply by 12-18
- Example: $8K/month burn x 18 months = $144K. Round up to $150K.
- Do not raise $2M on a SAFE unless you have serious traction. That cap table gets ugly fast.

**Worked example, on paper:**
```
Scenario: You raise $200K on a post-money SAFE with a $2M cap

Investor ownership in this simplified pre-round illustration: $200K / $2M = 10%
Founder ownership after SAFE converts: 90%

If you then raise a Series A at $10M pre-money:
- Series A investors get shares at $10M valuation
- SAFE investors get shares at $2M valuation (the cap)
- SAFE investor paid 5x less per share than Series A investors
```

**Demo 2: Term Sheets and Dilution Math**

A term sheet is a non-binding document that outlines the key terms of an investment. Think of it as a "deal summary" before the lawyers write the final contracts.

**Key sections of a term sheet (walk through each one):**

| Term | What It Means | What to Watch For |
|------|--------------|-------------------|
| Valuation | What the company is "worth" pre-investment | Too low = you give away too much. Too high = hard to justify in next round. |
| Investment Amount | How much money the investor is putting in | Make sure it covers 12-18 months of runway |
| Equity Percentage | What % of the company the investor gets | Do the math yourself. Do not trust "it is standard." |
| Board Seats | Who sits on the board of directors | Keep board control early on. 2 founders + 1 investor is fine. |
| Liquidation Preference | Who gets paid first if the company is sold | 1x is standard. 2x or higher is a red flag. |
| Anti-Dilution | Protects investors if future rounds are at a lower valuation | "Broad-based weighted average" is founder-friendly. "Full ratchet" is not. |
| Pro Rata Rights | Investor's right to invest in future rounds to maintain their percentage | Standard and usually fine to give |
| Vesting | Schedule for founder shares to "vest" (you earn them over time) | 4-year vest with 1-year cliff is standard. Make sure you are not re-vesting all shares. |
| Information Rights | Investor's right to see your financials | Quarterly updates are normal. Monthly board decks are normal for board members. |

**Dilution Math (live cap table construction):**

*What is dilution?*
Your ownership percentage decreases when new shares are created for investors. You still own the same number of shares, but there are more total shares, so your percentage drops.

*Cap Table Basics:*
A cap table (capitalization table) is a spreadsheet that shows who owns what.

**Example 1: Pre-investment cap table**
```
Shareholder       | Shares    | Ownership %
------------------|-----------|------------
Founder (You)     | 8,000,000 | 80%
Co-Founder        | 2,000,000 | 20%
------------------|-----------|------------
TOTAL              | 10,000,000| 100%
```

**Example 2: After a $500K angel round on a $5M post-money valuation**
```
Investor ownership: $500K / $5M = 10%

Shareholder       | Shares      | Ownership %
------------------|-------------|------------
Founder (You)     | 8,000,000   | 72%
Co-Founder        | 2,000,000   | 18%
Angel Investor    | 1,111,111   | 10%
------------------|-------------|------------
TOTAL              | 11,111,111  | 100%
```
Notice: You went from 80% to 72%. Your co-founder went from 20% to 18%. You both got diluted by 10%.

**Example 3: After a Series A ($2M at $10M pre-money, $12M post-money)**
```
Series A ownership: $2M / $12M = 16.67%

Shareholder       | Shares      | Ownership %
------------------|-------------|------------
Founder (You)     | 8,000,000   | 60%
Co-Founder        | 2,000,000   | 15%
Angel Investor    | 1,111,111   | 8.33%
Series A VC       | 2,222,222   | 16.67%
------------------|-------------|------------
TOTAL              | 13,333,333  | 100%
```
After two rounds, you went from 80% to 60%. But here is the thing: 60% of a $12M company is $7.2M. 80% of a $0 company is $0. Dilution is not loss. It is the price of growth.

**The Golden Rule of Dilution:**
The value of your smaller slice should always be worth more than the value of your bigger slice before the investment. If it is not, you should not have raised.

**Convertible Notes (brief comparison):**
- Like a SAFE, but structured as a loan
- Has an interest rate (typically 2-8%) and a maturity date (typically 18-24 months)
- Converts to equity at the next priced round, just like a SAFE
- If the company does not raise another round before maturity, the note can be called (investor can demand repayment)
- SAFEs are more founder-friendly. Convertible notes are more investor-friendly.
- Most early-stage deals in 2024+ use SAFEs

**Demo 3: Common Mistakes First-Time Founders Make**

Walk through each mistake with real-world examples:

- **Mistake 1: Raising too much too early.** You set a high valuation, take a lot of money, and now you have to grow into those expectations. If your next round is at a lower valuation (a "down round"), everyone is unhappy.
- **Mistake 2: Raising too little.** You take $50K, it runs out in 3 months, and now you are fundraising again instead of building. Always raise for 12-18 months of runway.
- **Mistake 3: Not understanding the terms.** You signed a SAFE with a $1M cap and a 2x liquidation preference and you did not know what that meant. Now the investor gets paid 2x their money before you see a dime in an exit. READ EVERYTHING.
- **Mistake 4: Taking money from the wrong people.** A toxic investor is worse than no investor. Check references. Talk to other founders they have invested in. Ask: "What happens when things go wrong?"
- **Mistake 5: Not having a lawyer.** Startup law is specialized. A general practice attorney does not know SAFEs from sandwiches. Budget $2K-$5K for a startup lawyer. Clerky, Stripe Atlas, and LegalZoom can help with basics.
- **Mistake 6: Handshake deals.** Everything in writing. EVERYTHING. "We agreed on 10% for $100K" can create serious ambiguity; obtain qualified advice and properly executed documents.
- **Mistake 7: Giving away too much equity too early.** If you give away 40% in your angel round, you will have almost nothing left after a Series A. Target giving away 10-20% per round.

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-11-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
// Simplified post-money illustration before new-money dilution; not legal cap-table software.
const investment = 500000, cap = 5000000, newMoneyFraction = 0.2;
const beforeRound = investment / cap;
const afterRound = beforeRound * (1 - newMoneyFraction);
check(Math.abs(beforeRound - 0.1) < 1e-9, 'Illustrative pre-round fraction');
check(Math.abs(afterRound - 0.08) < 1e-9, 'New-money dilution changes ownership');
console.log('ok: checkpoint-11-2');
```

## Where it breaks

![](diagram:session-11-2/fig2-diagnosis)

### Cap treated as a guaranteed valuation

You tell someone the company is worth the cap. The cap is a term in the conversion, a ceiling used later when the SAFE turns into shares. It is not a price the investor paid for a share today, and it is not a promise that the next round will clear at that number. Explain what the cap does on the day a priced round happens, and what the investor owns if that day is far away. Using it as a valuation in a conversation creates a disagreement you will have in writing later.

### Simple percentage treated as final ownership

You divide the check by the cap and announce that the founder still owns 90 percent. The next round, the option pool, and the conversion of the other SAFEs are not in that sentence. Ownership is what remains after those events, and the order of the events matters. Put the later round and the pool on the same cap table before you quote a percentage to a cofounder or an investor. A percentage that ignores them is a different company from the one you will be running.

### SAFE called ordinary debt

You describe the SAFE as a loan with interest, because "agreement" and "money in" sound like debt. A standard SAFE is not a loan. It does not have a maturity date you must repay, and it does not behave like one if you call it that in a deck. Read the instrument you are actually using, including whether it is pre-money or post-money, and describe those terms. Importing loan instincts into a SAFE conversation produces promises the document does not contain.

## Your turn

**Guided Exercise 1: SAFE Math Challenge**

Work through 4 scenarios on paper or in a spreadsheet. Do the first one slowly, writing every step:

**Scenario A:** You raise $100K on a post-money SAFE with a $2M cap. What percentage will the investor own at conversion?

**Scenario B:** You raise $250K on a post-money SAFE with a $5M cap. Then you raise a Series A of $1M at a $10M pre-money valuation. Build the full cap table showing founder, SAFE investor, and Series A investor ownership.

**Scenario C:** An investor offers you $150K on a SAFE with a $1M cap. Another investor offers $150K on a SAFE with a $3M cap. Same amount of money. What is the difference in dilution?

**Scenario D:** You are a solo founder. You raise $500K on a post-money SAFE with a $5M cap. Then you raise a $2M Series A at $10M pre-money. How much of the company do you own after both rounds?

**Answer Key:**
- Scenario A: $100K / $2M = 5%
- Scenario B: SAFE investor owns 5% ($250K/$5M). Series A: $1M / $11M post-money = 9.09%. After both: Founder ~85.9%, SAFE ~4.55%, Series A ~9.09% (dilution from Series A affects SAFE holder too)
- Scenario C: $1M cap = 15% dilution. $3M cap = 5% dilution. Same money, 3x the dilution difference. The cap matters enormously.
- Scenario D: After SAFE: 90%. After Series A ($2M at $10M pre, $12M post): Series A gets 16.67%. You own ~75% of remaining 83.33% = ~75%

Solutions reviewed together as a class.

---

## The quest

**Independent Exercise 2: Term Sheet Red Flag Review**

Take this fictional term sheet. Several red flags are hidden in it:
- 3x liquidation preference (red flag, standard is 1x)
- Full ratchet anti-dilution (red flag, should be broad-based weighted average)
- Investor gets 2 of 3 board seats (red flag, founders should control the board early)
- Founder shares re-vest on a 4-year schedule from the investment date (red flag, existing vesting should be credited)
- No pro rata rights (unusual but not necessarily a red flag)

**Instructions:**
1. Read the provided fictional term sheet
2. Circle or highlight every term that seems unusual or unfavorable
3. For each red flag, write one sentence explaining why it is problematic
4. Discuss with the class

**Success Criteria:** Identify at least 3 of the 4 red flags and explain why they matter.

Name the red flags and why each one is a problem. Then decide which you would negotiate and which would end the deal.

**Recap and Homework Launch**

Recap: SAFEs are the most founder-friendly way to raise early-stage money. Understand valuation caps, dilution, and cap tables before you sign anything.

Next session: "We are going to the Royal Court. Venture capital, pitch decks, and the art of the raise."

---

### Review the artifact

Your deliverable is **A fictional cap table, SAFE scenario analysis, and term-sheet questions**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-11-2/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Session 11.1 completed; fundraising research brief submitted; basic math skills (percentages, fractions); capstone product deployed and functional
**Materials:** SAFE template (Y Combinator post-money SAFE), fictional term sheet with red flags, cap table spreadsheet template, dilution calculation worksheet, scenario cards for SAFE math challenge

---

**Assignment: Your Cap Table Model**
**Objective:** Build a cap table for your own capstone product, modeling a realistic fundraising path
**Time Estimate:** 2-3 hours
**Due:** Before Session 11.3

**Tasks:**
1. Create a spreadsheet (Google Sheets is fine) with three tabs:
   - Tab 1: "Pre-Investment" ... Just you (and co-founder if applicable). 10,000,000 shares total.
   - Tab 2: "After Angel Round" ... Model raising $100K-$300K on a post-money SAFE. Pick a valuation cap. Calculate dilution.
   - Tab 3: "After Series A" ... Model raising $1M-$3M at a pre-money valuation. Calculate everyone's ownership.
2. Write a 1-paragraph "fundraising plan" below the spreadsheet: How much would you raise at each stage? What would you spend it on?
3. Answer: "After both rounds, what percentage do I own? Am I comfortable with that?"

**Submission:** Share the Google Sheet link (view access) or screenshot in your capstone repo under `/docs/cap-table.md`

**Stretch Goals (Optional):**
- Research 3 real SAFE deals from AngelList or Crunchbase. What were the cap sizes and amounts raised?
- Read Y Combinator's SAFE Primer: https://www.ycombinator.com/documents

---

### Manual verification and further reading

- [Official reference 1](https://www.ycombinator.com/safe)
