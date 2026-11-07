---
editorial: true
title: The Noble Houses
subtitle: Angel Investors, SAFEs, and Term Sheets
hook: "A noble offers gold for a share of the treasure. Today you read the post-money SAFE, run four conversion scenarios until the arithmetic is yours, and find the red flags in a one-page term sheet before you ever see a real one."
read: 55
artifact: "docs/cap-table.md in the capstone repo: a three-stage fictional cap table (pre-investment, after a post-money SAFE, after a Series A) with share counts and percentages that sum to 100, four worked SAFE scenarios, and a term-sheet read with each red flag marked negotiate or walk away"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.ycombinator.com/safe
  - https://www.ycombinator.com/documents
  - https://www.sec.gov/resources-small-businesses
  - https://www.angellist.com/
say:
  - "A post-money SAFE converts to investment divided by cap, immediately before the priced round, then the new money dilutes it."
  - "Shares first, percentages second. If the column does not sum to 100, the table is wrong."
  - "Economics and control are different terms. A majority on paper can still lose the board."
---

## The hook

In every isekai there is a scene where a wealthy noble says, "I see potential in you. I will fund your quest, for a share of the treasure." That is an angel. They are not lending gold. They are buying a piece of a kingdom that does not exist yet, and the document that decides how big a piece is six pages long and written so that founders sign it without reading. Today you read it. You take the thesis paragraph from last session, the one that said what you would still own, and you turn that claim into share counts.

By the end of the session you can run a post-money SAFE conversion by hand and in a small model here, four times with four different inputs, and get the same answers as the page. You know why "the investor owns 10 percent" is true the day before a priced round and false the day after. And you have read a one-page fictional term sheet with five unusual terms in it, found the four that hurt you, named the one that is odd but harmless and said why, and decided for each harmful one whether you would negotiate or walk away. The cap table for your own capstone is the quest.

> *The noble smiles and slides the parchment across the table. The numbers are small. The definitions are on page four.*

You arrive with `docs/fundraising-research.md` from [last session](/path/11-1-rallying-the-villagers/), its thesis paragraph in particular, and the capstone repo. Nothing today needs a server. No document on this page is a real offer, and no number is a current market figure; every valuation and check size is a made-up input for arithmetic practice.

## The idea

An angel investor is an individual investing their own money in an early company in exchange for ownership, or a contractual right to ownership later. Their own money is the important part. It makes them faster than a fund, more personal, smaller in check size, and more likely to decide on the strength of the founder than on a spreadsheet. A venture fund invests other people's money and answers to them; that is [next session](/path/11-3-the-royal-court/).

### What angels look for, and where they are

At this stage, in roughly this order: the team (can these people build it, and will they keep going), the market (could this become a real business), traction (does anyone use it, pay for it, ask for it), and the product (does it work). You have the last one deployed. Most people who pitch angels do not.

Where they are: AngelList at angellist.com runs syndicates and rolling funds, where one lead invests and others follow into the same deal; Wellfound is the jobs site that was spun out of it, not an investing platform, so do not go there looking for a check. LinkedIn search for "angel investor" plus your industry, then look at who backed companies like yours. Accelerator demo days. Local founder meetups. Investors who post their thesis in public, where you can read what they want before you ask. The warm introduction through someone who knows both of you is the route that works; a cold message is the route that mostly does not, and the rule of thumb that an intro converts an order of magnitude better than a cold email is folklore with a lot of founders behind it, not a measured rate.

The meeting itself is short. The first minutes decide whether they like you. Then a pitch of problem, solution, demo, traction, ask. Then questions, which is where the deal is won. Bring the deck you build next session, the live product, and two answers you can say without looking down: how much, and what it buys.

### The SAFE

The old problem: an investor gives $100K, and now someone has to say what the company is worth to know what share $100K buys. A company with $47 in revenue and a dream cannot be valued honestly, and the argument kills deals. The SAFE, the Simple Agreement for Future Equity, was Y Combinator's 2013 answer. It is not a loan and it is not shares. It is a contract: money now, equity later, when a priced round happens, at a price set by the SAFE's terms. No interest, no maturity date, no monthly payment. The investor is betting that a priced round comes.

Read the actual document before you calculate anything. The YC documents page linked above hosts the current post-money SAFE forms, and the definitions in the form decide how every number below behaves. A social-media summary is not the instrument.

**Valuation cap.** A ceiling on the price the SAFE investor pays per share at conversion. A SAFE with a $5M cap converting into a round priced at $20M gets shares as if the company were worth $5M, so that investor gets four times the shares per dollar that the new investors get. The cap is the early investor's reward for believing first. It is not a valuation; nobody paid $5M for anything, and a cap does not promise that the next round clears at that number.

**Discount.** A percentage off the priced round's share price, typically in the 15 to 25 percent range in the forms you will see; read the form, because YC's current standard forms are cap-only and the discount is a separate variant. Where both exist, the investor gets whichever gives them the better price.

**Pre-money versus post-money.** The pre-money SAFE, the old form, set the cap before the SAFE money itself, so with several SAFEs stacked up nobody knew the dilution until the round. The post-money SAFE, YC's standard since 2018, includes the SAFE money in the cap. Under it, the holder's ownership is investment divided by cap, measured immediately before the priced round, and the form's definition of the company's capitalization counts existing options and the pool that existed before the round, but not the new or increased pool adopted as part of the round. Two consequences follow, and both go on your cap table: the SAFE holder is then diluted by the new money like everyone else, and the SAFE holder is also diluted by any option-pool increase done as part of that round. $500K on a $5M post-money cap is 10 percent the day before the round, and less the day after.

Three misconceptions to burn off. A SAFE is not free money; it is future equity sold today, and the investment can also be worth nothing. The cap is not the valuation; it only matters at conversion. SAFEs do not expire; a standard one sits on the cap table until a priced round converts it or an exit pays it out.

### The cap table

A cap table is the list of who owns what, in shares first and percentages second. The percentage is a derived column: shares divided by the total. Dilution means the total grew because new shares were issued to someone else; your share count did not move, your fraction did. Name every category: founders, existing investors, option pool, converting instruments, new investors. State the total you divided by. Check that the percentage column sums to 100 in every stage. A table that leaves a category out can look precise while allocating ownership that does not exist.

The golden rule of dilution is that your smaller slice after the round should be worth more than your bigger slice before it. If 60 percent of a company that can now hire is worth more than 80 percent of one that cannot, you raised well. If it is not, you should not have raised.

### The term sheet

A term sheet is the non-binding summary of a priced investment before lawyers write the long documents. Economics and control are separate families of terms. Read both.

| Term | What it means | What to watch for |
|---|---|---|
| Valuation | The agreed worth before the money goes in | Too low gives away too much; too high is hard to justify next round |
| Investment amount | What goes in | Does it cover 12 to 18 months of the plan |
| Equity percentage | The investor's share after the round | Do the arithmetic yourself; "it is standard" is not arithmetic |
| Board seats | Who votes on the company's big decisions | Two founders and one investor is normal early; losing the majority is not |
| Liquidation preference | Who is paid first when the company is sold | 1x non-participating is standard; 2x or more, or participating, is a flag |
| Anti-dilution | Protects the investor if a later round prices lower | Broad-based weighted average is normal; full ratchet is not |
| Pro rata rights | The investor's right to keep their percentage in later rounds | Standard, usually fine |
| Founder vesting | How your own shares are earned over time | Four years with a one-year cliff is normal; re-vesting shares you already earned is not |
| Information rights | What financials the investor sees and when | Quarterly updates are normal; monthly is normal for a board member |
| Protective provisions | Decisions that need the investor's consent | Read the list; a long one is control without a board seat |

The convertible note is the SAFE's older cousin: structured as a loan, with an interest rate and a maturity date, converting at the next priced round, and callable for repayment if no round comes before maturity. SAFEs are friendlier to founders; notes are friendlier to investors. Read which one is on the table.

The mistakes first-time founders make are not exotic. Raising too much too early at a valuation they have to grow into. Raising too little, so they are fundraising again in three months instead of building. Signing terms they did not understand; a 2x preference means the investor takes twice their money out before you see any. Taking money from the wrong person; a bad investor is worse than none, so ask other founders they backed what happened when things went wrong. Doing it without a startup lawyer; budget for one. Handshake deals; everything in writing, executed properly. Giving away 40 percent in the first round and having almost nothing after a Series A; the usual target is 10 to 20 percent per round, and your cap table will tell you why.

What you should be able to draw on a napkin: a row of boxes, one per holder, with a share count in each. A SAFE arrives as a box whose size is investment over cap. A priced round adds a box whose size is new money over post-money valuation, and every existing box shrinks by the same factor. Under the boxes, two words: economics, control. The second word is not on the napkin's arithmetic and matters as much.

![](diagram:session-11-2/fig1-model)

## The demonstration

Questboard again, with two founders. Everything in whole shares, rounded, with the percentage derived from the count.

Stage 1, before any investment. The founders issued themselves ten million shares.

```text
Holder          Shares       %
Founder (you)    8,000,000   80.00
Co-founder       2,000,000   20.00
Total           10,000,000  100.00
```

Stage 2, a $500K post-money SAFE with a $5M cap converts. The holder's fraction immediately before the priced round is $500,000 ÷ $5,000,000 = 10 percent. To give a new holder 10 percent of the total, issue shares equal to the existing total times 0.10 ÷ 0.90: 10,000,000 × 0.1111 = 1,111,111.

```text
Holder          Shares       %
Founder (you)    8,000,000   72.00
Co-founder       2,000,000   18.00
SAFE investor    1,111,111   10.00
Total           11,111,111  100.00
```

You went from 80 to 72, the co-founder from 20 to 18. Both were diluted by the same 10 percent. Your share count did not move.

Stage 3, a Series A of $2M at a $10M pre-money valuation, which is a $12M post-money. The new investor's fraction is $2,000,000 ÷ $12,000,000 = 16.67 percent. Shares to issue: 11,111,111 × (1/6) ÷ (5/6) = 2,222,222.

```text
Holder          Shares       %
Founder (you)    8,000,000   60.00
Co-founder       2,000,000   15.00
SAFE investor    1,111,111    8.33
Series A         2,222,222   16.67
Total           13,333,333  100.00
```

After two rounds, 80 became 60. Sixty percent of a $12M company is $7.2M on paper; eighty percent of a company that could not hire was worth whatever it was worth. Dilution is the price of growth, and the only question is whether what you bought with it was worth more than the slice.

Now the sentence most pages leave out. Suppose the Series A also requires a 10 percent option pool, measured after the round, created as part of it. Under the post-money SAFE form, that new pool is excluded from the capitalization the SAFE converts against, which in practice means the SAFE holder, the founders, and the co-founder all get diluted by the pool together. The Series A still owns 16.67 percent; the pool owns 10; the other 73.33 is shared by the three existing holders in their old ratio. The founder's 72 percent (8,000,000 of the 11,111,111 pre-round shares) of 73.33 is 52.8 percent, not 60. The pool cost you 7.2 points (60 minus 52.8, both percentages of the post-round total). That is why the pool is a negotiated term, not a footnote.

Here is the same arithmetic as a small model you can run here. It proves that a post-money SAFE converts to investment over cap before the round, that the priced round and a pool dilute everyone, and that the share counts add up. It does not prove anything about a real instrument; the definitions in the actual document decide the real number, and a lawyer reads those with you.

```js run=checkpoint-11-2
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

// Fictional cap table. Shares first, percentages derived. Not legal cap-table software.
function issueForFraction(existingTotal, fraction) {
  return Math.round(existingTotal * fraction / (1 - fraction));
}

function pct(shares, total) {
  return Math.round(shares / total * 10000) / 100;
}

const table = { founder: 8000000, cofounder: 2000000 };
let total = table.founder + table.cofounder;
check(total === 10000000, 'stage 1: ten million founder shares');

// Stage 2: $500K post-money SAFE, $5M cap -> 10% immediately before the priced round.
const safeFraction = 500000 / 5000000;
table.safe = issueForFraction(total, safeFraction);
total += table.safe;
check(table.safe === 1111111, 'stage 2: SAFE converts to investment over cap');
check(pct(table.founder, total) === 72, 'stage 2: founder 72 percent');

// Stage 3: $2M Series A at $10M pre-money -> 2/12 of the post-money company.
const seriesAFraction = 2000000 / 12000000;
table.seriesA = issueForFraction(total, seriesAFraction);
total += table.seriesA;
check(table.seriesA === 2222222, 'stage 3: new money over post-money valuation');
check(pct(table.founder, total) === 60, 'stage 3: founder 60 percent');
check(pct(table.safe, total) === 8.33, 'stage 3: the SAFE holder is diluted by the new money too');

let sum = 0;
for (const holder in table) sum += pct(table[holder], total);
check(Math.abs(sum - 100) < 0.02, 'percentages sum to 100');

// Sensitivity: the same Series A with a 10% post-round option pool created in the round.
const preRoundTotal = 11111111;
const pooledTotal = Math.round(preRoundTotal / (1 - seriesAFraction - 0.10));
check(pct(8000000, pooledTotal) === 52.8, 'a pool created in the round dilutes the founders and the SAFE holder');

// Scenario B from Your turn: $250K on a $5M cap, then $1M at $10M pre.
const b = { safe: 250000 / 5000000, a: 1000000 / 11000000 };
const founderB = (1 - b.safe) * (1 - b.a);
check(Math.round(founderB * 1000) / 10 === 86.4, 'scenario B: founder 86.4 percent');

for (const holder in table) console.log(holder + ': ' + table[holder] + ' shares, ' + pct(table[holder], total) + '%');
console.log('ok: checkpoint-11-2');
```

Change the cap to $2,000,000 and predict the founder's stage 2 number before you run. Then change the Series A pre-money to $20,000,000 and watch who is diluted least. Put the inputs back.

## Where it breaks

![](diagram:session-11-2/fig2-diagnosis)

### Cap treated as a guaranteed valuation

You tell someone the company is worth $5M because that is the cap. The cause is reading the cap as a price paid rather than a ceiling applied later; nobody bought shares at that number. The fix is to explain what the cap does on the day a priced round happens, and what the investor owns if that day never comes, which under a SAFE is a contractual right, not shares. If you use the cap as a valuation in conversation, you will have the same disagreement in writing with a lawyer in the room.

### Simple percentage treated as final ownership

You divide the check by the cap, announce 90 percent, and put it in the thesis paragraph. The cause is stopping at stage 2: the next round, the option pool, and any other SAFEs are not in that sentence, and the order of those events decides the answer. The fix is a stage 3 on the same cap table before you quote a number to a co-founder or an investor. In the demonstration, the two founders' combined 90 percent after the SAFE became 75 after the Series A and 66 with the pool; your own 80 became 72, then 60, then 52.8, without any term being unusual. Say which total a percentage is a share of, every time. A percentage that ignores the later events describes a different company from the one you will run.

### SAFE called ordinary debt

The deck says "Questboard borrowed $500K on a SAFE" or the narrative budgets interest payments. The cause is that "agreement" and "money in" sound like a loan. A standard SAFE has no interest, no maturity, and no repayment; a convertible note has all three. The fix is to open the form you are actually using, check its name and whether it is pre- or post-money, and describe those terms and no others. Loan instincts imported into a SAFE conversation produce promises the document does not contain, and an investor who notices will wonder what else you have not read.

## Your turn

Open a terminal in the capstone repo.

1. Run the four scenarios before you read the answers. Scenario A: $100K on a post-money SAFE with a $2M cap.

   ```bash
   node -e "console.log(100000 / 2000000)"
   ```

   Prints `0.05`. The investor owns 5 percent immediately before the priced round.

2. Scenario B: $250K on a $5M cap, then a $1M Series A at $10M pre-money, which is $11M post.

   ```bash
   node -e "const s = 250000 / 5000000, a = 1000000 / 11000000; console.log((1 - s) * (1 - a), s * (1 - a), a)"
   ```

   Prints `0.8636363636363635 0.045454545454545456 0.09090909090909091`. Founder about 86.4 percent, SAFE about 4.5, Series A about 9.1, and those sum to 100. The SAFE holder is diluted by the round as well.

3. Scenario C: $150K on a $1M cap against $150K on a $3M cap.

   ```bash
   node -e "console.log(150000 / 1000000, 150000 / 3000000)"
   ```

   Prints `0.15 0.05`. Same money, three times the dilution. The cap is the term.

4. Scenario D: solo founder, $500K on a $5M cap, then $2M at $10M pre.

   ```bash
   node -e "const s = 500000 / 5000000, a = 2000000 / 12000000; console.log((1 - s) * (1 - a))"
   ```

   Prints `0.75`. Ninety percent (the founder's share after the SAFE) of 83.33 percent (1 minus the Series A's 2 of the $12M post-money) is 75 percent.

5. Copy this into `docs/cap-table.md` and fill it in for your capstone with made-up but stated inputs. Pick your own cap and round size; the demonstration's numbers are the example, not the answer.

   ```markdown
   # Cap table: <capstone-name>

   Fictional. All values hypothetical. Shares first, percentages derived, each stage sums to 100.

   ## Inputs
   Founder shares:
   Co-founder shares (0 if solo):
   SAFE: $          on a $          post-money cap
   Series A: $          at $          pre-money ( $          post )
   Option pool created in the round (0 if none):      %

   ## Stage 1: before investment
   | Holder | Shares | % |
   |---|---|---|
   | Founder | | |
   | Co-founder | | |
   | Total | | 100 |

   ## Stage 2: after the SAFE converts
   SAFE fraction = investment / cap =
   Shares to issue = existing total x fraction / (1 - fraction) =
   | Holder | Shares | % |
   |---|---|---|
   | Founder | | |
   | Co-founder | | |
   | SAFE investor | | |
   | Total | | 100 |

   ## Stage 3: after the Series A
   Series A fraction = new money / post-money =
   Shares to issue =
   | Holder | Shares | % |
   |---|---|---|
   | Founder | | |
   | Co-founder | | |
   | SAFE investor | | |
   | Series A | | |
   | Option pool | | |
   | Total | | 100 |

   ## Four scenarios, my answers
   A:
   B:
   C:
   D:

   ## Fundraising plan
   One paragraph: how much at each stage, what it buys, what I own after both, and whether I am comfortable with that number.

   ## Term sheet read
   (filled in during the quest)
   ```

   A filled example of the two stages people get wrong, from the demonstration:

   ```markdown
   ## Stage 2: after the SAFE converts
   SAFE fraction = 500,000 / 5,000,000 = 0.10
   Shares to issue = 10,000,000 x 0.10 / 0.90 = 1,111,111
   | Holder | Shares | % |
   |---|---|---|
   | Founder | 8,000,000 | 72.00 |
   | Co-founder | 2,000,000 | 18.00 |
   | SAFE investor | 1,111,111 | 10.00 |
   | Total | 11,111,111 | 100 |

   ## Fundraising plan
   Questboard raises $500K on a $5M post-money SAFE to fund the pilot, one
   engineer for a year, and a year of hosting and model credits. If the pilot
   proves weekly retention, a $2M Series A at $10M pre funds the team plan and
   two more hires. After both rounds I own 60% with no pool, or 52.8% if the
   Series A requires a 10% pool. I am comfortable at 60. At 52.8 I would
   negotiate the pool down or ask for it to be sized to the actual hiring plan.
   ```

6. Fill stage 3 with the percentages derived from shares, not typed in, and confirm each stage's column sums to 100. If it does not, a holder is missing or a fraction was applied to the wrong total.

7. Commit.

   ```bash
   git add docs/cap-table.md
   git commit -m "docs: fictional cap table with SAFE and Series A stages"
   ```

## The quest

![](diagram:session-11-2/fig3-evidence)

One deliverable: `docs/cap-table.md`, complete, with the term-sheet read filled in. Here is the term sheet. It is fictional; the company, the investor, and every number are made up, and five of its terms are unusual. Four of them hurt you. One is odd and does you no harm. Read it cold before you look at the answer key further down, find the four, and decide which one is the harmless one.

```markdown
# TERM SHEET (non-binding, fictional)

Issuer:            Questboard, Inc., a Delaware corporation
Investor:          Greyhaven Capital Fund II (fictional)
Security:          Series Seed Preferred Stock
Amount:            $500,000
Pre-money valuation: $4,500,000 (post-money $5,000,000), fully diluted,
                   including an unallocated option pool of 10% post-closing
Price per share:   to be calculated from the capitalization at closing

Liquidation preference: 3x the original purchase price, participating,
                   payable before any distribution to common stock
Dividends:         8% non-cumulative, when and if declared
Anti-dilution:     full ratchet on any issuance below the Series Seed price
Conversion:        converts to common 1:1 at holder's option, automatically on a
                   qualified IPO

Board of directors: three seats. Two designated by the Investor, one by the
                   founders (the CEO)
Protective provisions: Investor consent required for any sale, new financing,
                   debt over $25,000, hiring or firing of any officer, and
                   annual budget approval
Information rights: monthly financial statements within 15 days of month end,
                   annual audited statements, inspection on request

Founder vesting:   all founder shares subject to a new 4-year vesting schedule
                   with a 1-year cliff, measured from the closing date
Pro rata rights:   none
Right of first refusal and co-sale: standard, on founder transfers
Exclusivity:       60 days from signature
Expenses:          company pays Investor's legal fees up to $40,000 at closing
Governing law:     Delaware
```

For each term you think is unusual, write one sentence in the "Term sheet read" section of `docs/cap-table.md`: what it does to you in a low-value sale, in the next round, and in a disagreement, and then one word, negotiate or walk. For the one you decide is harmless, write why instead of a decision. Find the four harmful terms before reading on.

### Answer key, read after

- **Harmful.** 3x participating liquidation preference. In a $6M sale the investor takes $1.5M first (3 × their $500,000), then takes their 10 percent (of the $5M post-money) of the remaining $4.5M as if they also held common. Standard is 1x non-participating: their money back or their percentage, not both. Negotiate to 1x non-participating; if they will not move, walk, because this term alone can leave founders with little in a modest exit.
- **Harmful.** Full ratchet anti-dilution. If any later round prices lower, their shares reprice to that lower price in full, and the founders absorb all of it. Standard is broad-based weighted average. Negotiate; it is commonly conceded.
- **Harmful.** Two of three board seats to the investor. You keep a majority of the shares and lose control of the company's decisions. Early boards are usually two founders and one investor, or two founders, one investor, one independent. Negotiate hard; a seed investor insisting on board control is a walk for most founders.
- **Harmful.** Re-vesting all founder shares from closing. The years you already worked are erased. Normal is to credit earned vesting and apply a schedule only to the unvested remainder. Negotiate; credit for time served is standard.
- **Benign.** No pro rata rights. This is the odd one. Pro rata is a right the investor usually asks for, so leaving it out is unusual, but it only means they are not promised a place in the next round. It costs you nothing. If you fought it you would be negotiating against yourself.

Four more terms are worth a sentence in your read, though none of them is one of the five.

- **Benign.** Monthly information rights. Normal for a board member; a monthly close is good discipline anyway.
- **Negotiable.** The protective provisions list is on the long side, and "hiring or firing of any officer" is control without a vote; ask for it to come out.
- **Negotiable.** The $40,000 expense cap is high for a round this size; $10,000 to $15,000 is more usual at seed, and the number moves when asked.
- **Negotiable.** The 10 percent pool inside the pre-money (10 percent of the $5M post-money total, carved out of the founders' side before the investor's price is set) is exactly the dilution the demonstration measured; ask for the pool to be sized to the hiring plan.

Evidence that the quest is done:

- Three stages in `docs/cap-table.md` with share counts, derived percentages, and a 100 at the bottom of each.
- The four scenario answers match the lines printed in Your turn.
- The fundraising plan paragraph names the ownership after both rounds and says whether you accept it.
- The four harmful terms found before the key, each with a negotiate-or-walk decision and a one-sentence reason, and the harmless one named with the reason it is harmless.
- Committed and pushed.

```bash
git add docs/cap-table.md
git commit -m "docs: term sheet read with negotiate or walk decisions"
git push
```

## Side quests

Back-of-the-envelope numbers are the cap table's whole discipline, shares first and percentages derived, and the long-return mindset is what lets you walk away from a term sheet that would fund the next six months and cost the next six years.

## Before next session

Next session is [The Royal Court](/path/11-3-the-royal-court/): how a venture fund's arithmetic decides what it can invest in, a twelve-slide deck built around your deployed capstone, bottom-up market sizing, and the one-page financial narrative. Read the YC "How to pitch your company" article linked from that session's docs once; you will build the deck in Google Slides, so make sure you have a Google account and can open slides.google.com before you sit down.

Nothing is running between sessions. The deployed capstone stays up on its own, and the two files in `docs/` are the only state this unit carries forward.
