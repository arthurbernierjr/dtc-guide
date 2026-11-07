---
editorial: true
title: The Royal Court
subtitle: Venture Capital, Pitch Decks, and the Raise
hook: "A venture-fit assessment, evidence-backed pitch narrative, and fundraising process map. Compare the business model with investor return expectations."
read: 60
artifact: "A venture-fit assessment, evidence-backed pitch narrative, and fundraising process map"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.ycombinator.com/library/4b-how-to-pitch-your-company
say:
  - "Fit: Compare the business model with investor return expectations."
  - "Evidence: Support problem, traction, and market claims."
  - "Process: Track conversations, diligence, and decision criteria."
---

## The hook

We have covered the villagers and the noble houses. Today we enter the Royal Court: venture capital. The Royal Court is where the real power sits. The VCs are not investing their own gold. They are managing the treasury of an entire kingdom. Their job is to multiply that treasury 10x. If you want their money, you need to speak their language AND prove your quest is worth the kingdom's investment.

But here is the important caveat before we begin: most startups should NOT raise venture capital. VC is a specific tool for a specific type of company. The math of venture capital demands enormous outcomes. A profitable business that generates $2M a year is a wonderful business and a terrible VC investment. Today, you will learn what type of company fits the VC model and how the entire game works, so you can make an informed decision about whether it is your path.

The centerpiece of today is the pitch deck. Twelve slides. That is all you get to convince someone to write you a check for $500K or more. We are going to build those slides together, and by the time you leave today, you will have the skeleton of a deck built around your actual, deployed, working product. Most founders who pitch VCs do not have a working product. You do. That is your superpower.

---

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Construct a Professional Pitch Deck Using the Standard 10-12 Slide Format

Create a pitch deck that effectively communicates problem, solution, traction, market size, business model, and fundraising ask using real data from a deployed product.

**You will:**
- Calculate TAM, SAM, and SOM using bottom-up market sizing methodology with cited data sources
- Structure a pitch narrative using the standard 12-slide format covering all required investor-facing sections
- Present unit economics including customer acquisition cost (CAC), lifetime value (LTV), and average revenue per user (ARPU)
- Design slides that follow professional presentation best practices with visual hierarchy, minimal text, and clear messaging

**You should be able to:**
- You will be able to build a complete pitch deck with real product data, defensible market size numbers, and a specific fundraising ask
- You will be able to deliver a timed pitch and incorporate structured feedback to improve clarity and impact

---

**Concept 1: How Venture Capital Works**

*What is a VC firm?*
A company that raises a pool of money (a "fund") from wealthy people and institutions, then invests that money into startups. The VC firm is the middle layer between the money sources and the startups.

**VC Fund Structure:**
```
Limited Partners (LPs)         -->  The money sources
- Pension funds                     They invest in the VC fund
- University endowments             They expect returns
- Wealthy families
- Corporations

General Partners (GPs)         -->  The VC firm partners
- They manage the fund              They decide which startups to invest in
- They charge 2% management fee     They take 20% of profits ("carry")
- They sit on boards

Portfolio Companies            -->  The startups
- They receive the investment       They try to grow and return money
- 10-30 companies per fund
```

**The math that drives VC behavior:**
- A typical VC fund: $100M
- LPs expect 3x return: the fund needs to return $300M
- The fund invests in 20 companies
- Most startups fail. Maybe 15 out of 20 return $0 or very little.
- The remaining 5 need to return ALL $300M
- This means each winner needs to return $60M
- If the VC invested $5M in a winner, that startup needs to be worth $60M+ at exit
- **This is why VCs only fund companies that could be worth $100M+. Small, profitable businesses are great, but they do not fit the VC model.**

**What VCs fund (and do not fund):**

| VC Will Fund | VC Will NOT Fund |
|-------------|-----------------|
| Software with massive markets | A local restaurant |
| Network-effect businesses | A consulting firm |
| Platform plays | A lifestyle business |
| Deep tech with moat | A "nice to have" tool |
| Scalable tech products | Something that cannot 100x |

**VC funding stages:**
```
Pre-Seed:  $100K - $1M    (idea + early product)
Seed:      $1M - $5M      (product + early traction)
Series A:  $5M - $20M     (product-market fit + growth)
Series B:  $15M - $50M    (scaling what works)
Series C+: $50M+          (domination mode)
```

**Key VC terminology:**
- **Due Diligence:** The VC investigating your company before investing (code review, financials, customer calls, background checks)
- **Lead Investor:** The VC who sets the terms and writes the biggest check. Other investors follow the lead.
- **Syndicate:** A group of investors pooling money together
- **Portfolio:** All the companies a VC has invested in
- **Exit:** How investors get their money back (acquisition by a bigger company, or IPO)

**Concept 2: The VC Fundraising Process**

- **Step 1: Build a Target List (before you start pitching)**
  - Research VC firms that invest in your industry and stage
  - Tools: Crunchbase, PitchBook, VC firm websites, Twitter/X
  - Create a spreadsheet with: Firm name, Partner name, Fund size, Stage focus, Industry focus, Portfolio companies
  - Aim for 30-50 firms on your initial list
  - Narrow to 15-20 that are the best fit

- **Step 2: Get Warm Intros**
  - Cold emails to VCs have a less than 1% response rate
  - Warm intros through founders in their portfolio work 50%+ of the time
  - LinkedIn: find mutual connections to the partner you want to reach
  - The ask: "Hey [mutual connection], I am building [product]. I think [VC Partner] at [Firm] would be a great fit because they invested in [similar company]. Would you be willing to make an intro?"
  - If you absolutely must cold email: keep it to 3 sentences. Problem, traction, ask.

- **Step 3: First Meeting (30-45 minutes)**
  - Usually a video call or coffee
  - You pitch (10-15 minutes) then answer questions (20-30 minutes)
  - The VC is evaluating: Do I believe in this founder? Is this market big enough? Is there traction?
  - You should also be evaluating: Is this VC a good partner? Do they understand my market?

- **Step 4: Partner Meeting**
  - If the first meeting goes well, you present to the full partnership (2-5 partners)
  - This is a more formal pitch, usually at their office
  - They will ask harder questions. Prepare for pushback.

- **Step 5: Due Diligence (1-4 weeks)**
  - They review your code, financials, contracts, team backgrounds
  - They call your customers, advisors, and references
  - They check for legal issues, IP ownership, outstanding debts

- **Step 6: Term Sheet (the offer)**
  - If due diligence checks out, they send a term sheet
  - You have 1-2 weeks to review and negotiate
  - Get a lawyer. Seriously.

- **Step 7: Close (2-4 weeks after term sheet)**
  - Lawyers finalize documents
  - Money hits your bank account
  - You are now a funded startup with external investors and expectations

- **Total timeline: 2-6 months from first meeting to money in the bank**

---

![](diagram:session-11-3/fig1-model)

### Ask whether venture capital fits the business

Venture investors typically seek outcomes large enough to matter to their portfolios, which can favor businesses with substantial growth potential and particular risk profiles. That does not make other businesses inferior. A profitable service business or a focused software product may fit customer funding or another route better. Begin the assignment by explaining the business model and why outside equity would help reach a specific milestone.

Separate the founder's goals from the financing story. Desired control, growth pace, lifestyle, and risk tolerance matter. A pitch that assumes every company must pursue the same scale can hide a poor fit. Include a reasoned alternative to venture funding in the assessment. The objective is understanding incentives, not persuading every fictional founder to raise a round.

### Evidence gives the narrative its weight

A pitch connects a problem, a user, a solution, a market, a business model, and a team capable of executing. Each claim needs support appropriate to its stage. Interviews support a problem hypothesis; they do not prove revenue. A letter of intent is not the same as a paid contract. A pilot is not necessarily recurring revenue. Label these distinctions so the audience can assess the evidence honestly.

For market sizing, start with a countable customer segment and a plausible annual spend assumption. Show the arithmetic and the source or rationale for each input. A large industry total is not automatically the reachable market for a new product. Explain the initial segment and the path to adjacent segments. Use sensitivity analysis when the inputs are uncertain rather than presenting a precise-looking unsupported total.

### The ask connects money to milestones

State how much hypothetical capital is sought, what it funds, and which milestones it is expected to enable. Separate hiring, infrastructure, customer acquisition, and operating reserves. A runway calculation depends on net cash burn and timing, not only a monthly average. Include a lower-revenue or higher-cost case to reveal the plan's resilience. All workshop values should be clearly labeled as illustrative.

Avoid promising a return or implying that a funding outcome is assured. The narrative can be ambitious while remaining honest about risks and unknowns. Identify the most important assumption the next milestone will test. An investor conversation often examines the founder's understanding of uncertainty as much as the size of the opportunity.

### Treat fundraising as a process with records

A fictional pipeline can track fit, introduction source, stage, questions, next action, and decision date. Keep confidential materials and personal contact details out of public classroom artifacts. Do not send outreach as part of this lesson without a separate real-world decision and appropriate review. Practice with role-play conversations and sample diligence questions.

Prepare a concise data room index: company basics, product evidence, financial assumptions, cap table, and relevant legal documents. The exercise can use placeholders and fictional records. The final artifact should show a coherent story, a defensible ask, and a clear list of diligence gaps. A polished deck is useful only when the underlying facts can withstand questions.

## The demonstration

All companies, valuations, growth rates, fees, and financing amounts in the worked examples are hypothetical classroom inputs unless a source and date are explicitly attached. The examples are not current market benchmarks or individualized legal, tax, or investment advice. Do not offer securities, solicit investment, or send documents as part of this exercise.

**Demo 1: Pitch Deck Construction, Slide by Slide**

This is the most important demonstration of the unit. For each slide, put a weak version next to a strong one and say which difference a listener would actually notice.

**The pitch deck is NOT a document. It is a visual aid for a story you tell.**
- Do NOT put paragraphs of text on slides
- Each slide should have ONE key message
- If you can read the slide from the back of the room, it has the right amount of text
- The slides support YOUR voice. They do not replace it.

**Slide 1: Title / Hook**
- Company name and logo
- One-line description: what you do in 10 words or fewer
- Your name, title, contact info
- Example: "TaskForge ... AI-Powered Project Management for Solo Developers"
- Optional: a bold claim or hook. "We help solo devs ship 3x faster."

**Slide 2: Problem**
- What pain point exists in the world?
- Make it specific and relatable
- Use real numbers if you have them
- BAD: "Project management is hard."
- GOOD: "73% of solo developers abandon side projects within 3 months because they lose track of what to do next."
- Tip: tell a story. "Meet Sarah. She is a freelance developer with 4 active clients and no system..."

**Slide 3: Solution**
- How does your product solve the problem?
- Keep it simple. One core value proposition.
- BAD: "An AI-powered, blockchain-enabled, cloud-native synergy platform."
- GOOD: "TaskForge breaks any project into daily tasks and keeps you accountable with AI check-ins."
- Show, do not just tell. A screenshot or mockup is powerful here.

**Slide 4: Demo / Product**
- Screenshots of your actual working product (you have this, your capstone is live!)
- Or a short video demo (15-30 seconds, embedded or linked)
- Highlight the "wow" moment: the feature that makes people say "Oh, that is cool."
- This is your biggest advantage over non-technical founders. You BUILT the thing.

**Slide 5: Market Size (TAM, SAM, SOM)**
- **TAM (Total Addressable Market):** The total revenue opportunity if you captured 100% of the market
- **SAM (Serviceable Addressable Market):** The portion of TAM you can realistically reach with your current product and business model
- **SOM (Serviceable Obtainable Market):** The portion of SAM you can realistically capture in the next 2-3 years
- Example:
  ```
  TAM: Global project management software market = $7.1B
  SAM: Solo developer project management tools = $890M
  SOM: English-speaking solo devs who use AI tools = $120M
  ```
- Where to find market size data: Statista, IBISWorld, Grand View Research, Google "market size [your industry]"
- Investors want to see a SOM of at least $50M-$100M for VC-scale

**Slide 6: Business Model**
- How do you make money?
- Be specific about pricing
- Example:
  ```
  Free tier: 1 project, basic features
  Pro: $12/month - unlimited projects, AI features
  Team: $29/month per seat - collaboration, integrations

  Current: 500 free users, 47 Pro subscribers ($564 MRR)
  Target: 5,000 Pro subscribers ($60K MRR) by Month 18
  ```
- Show the unit economics if you can:
  - CAC (Customer Acquisition Cost): how much it costs to get one customer
  - LTV (Lifetime Value): how much revenue one customer generates over their lifetime
  - LTV > 3x CAC is the target

**Slide 7: Traction / Metrics**
- This is where you prove people actually want what you built
- Show numbers, not adjectives. "Growing fast" means nothing. "42% month-over-month growth" means everything.
- What to show (use whatever you have):
  - Users (total, active, growth rate)
  - Revenue (MRR, ARR, growth rate)
  - Engagement (DAU/MAU ratio, session length, retention)
  - Waitlist size
  - Pre-orders or LOIs
  - Social proof (press mentions, notable users, partnerships)
- If you are pre-revenue: show user growth, engagement, or waitlist
- A chart going up and to the right is the most powerful image in all of fundraising

**Slide 8: Team**
- Who are you and why are you the right person to build this?
- Photo, name, role, one-line credential for each team member
- Example:
  ```
  [Photo] Alex Chen - CEO/CTO
  Full stack developer. Built and shipped 3 products.
  Previously: Senior Engineer at Stripe (2 years)
  ```
- If you are a solo founder: that is fine. Highlight your skills and your unfair advantage.
- Your unfair advantage as a graduate of this program: "I am the rare founder who can build the entire product AND understand the business."

**Slide 9: Competition / Moat**
- Who else is solving this problem?
- Do NOT say "We have no competition." That either means the market does not exist or you did not look.
- Use a 2x2 matrix or comparison table:
  ```
  Feature      | TaskForge | Todoist  | Linear   | Notion
  -------------|-----------|----------|----------|--------
  AI Tasks     |    Yes    |    No    |    No    |  Basic
  Solo Dev     |  Built    |  Generic | Teams    | Generic
  Price        |  $12/mo   | $5/mo    | $8/seat  | $10/mo
  Code Aware   |    Yes    |    No    |    Yes   |   No
  ```
- Your "moat" is what makes you hard to copy: unique technology, data advantage, community, first-mover, brand, network effects

**Slide 10: Financial Projections**
- 3-year revenue projection
- Keep it simple: a table or line chart
- Example:
  ```
  Year 1: $72K ARR (600 subscribers x $12/mo x 12)
  Year 2: $480K ARR (growth to 3,000 subscribers + team plan)
  Year 3: $2.4M ARR (10,000 subscribers + enterprise deals)
  ```
- Be ambitious but defensible. If asked "How do you get to 10,000 subscribers?", you need an answer.
- Key assumptions to state: conversion rate, churn rate, growth channels

**Slide 11: The Ask**
- How much are you raising?
- What will you use it for?
- Example:
  ```
  Raising: $500K Seed Round

  Use of Funds:
  - 40% Engineering (hire 1 full-stack dev)
  - 25% Marketing (content, ads, partnerships)
  - 20% Operations (servers, tools, legal)
  - 15% Runway buffer

  This gets us to 3,000 subscribers and profitability in 18 months.
  ```
- Be specific. "We need money to grow" is not an answer. "We need $500K to hire one engineer and run Facebook ads targeting solo developers" is an answer.

**Slide 12: Contact / Thank You**
- Your name, email, phone, LinkedIn
- Website URL
- "Thank you. Questions?"
- Optional: QR code to your live product

---

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-11-3
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
// Hypothetical bottom-up annual market estimate.
const reachableAccounts = 2000, annualPrice = 600;
const market = reachableAccounts * annualPrice;
check(market === 1200000, 'Units: accounts times dollars per account per year');
check(market * 0.05 === 60000, 'A scenario is not a forecast');
console.log('ok: checkpoint-11-3');
```

## Where it breaks

![](diagram:session-11-3/fig2-diagnosis)

### Funding mistaken for product success

The deck leads with the round you want, and the product is a slide near the end. Raising money is not evidence that a customer has the problem. Keep the two stories apart. One is who pays you for the product and why they keep paying. The other is how much capital that plan needs, and what it buys. A reader who confuses them will treat a closed round as traction. You should not. A company can raise and still have nothing anyone wants.

### Market size invented

The slide says the market is $40 billion because a report said so, and your product is a narrow tool inside one job. A top-down number is not your market. Build the size from the bottom: how many buyers you can name a channel to, what they pay, how often. Cite the source of each input. A bottom-up number you can defend is more useful than a huge number you found in a headline, and an investor who checks will ask for the inputs anyway.

### Pitch overstates traction

"Users" on the slide includes signups who never returned, a pilot that was a favor, and revenue that is a single pre-order. Split them. A user who did the core action, a dollar that was collected, a pilot with a start date, and a letter that commits to something are four different facts. Label each one. A combined number feels stronger in the room and falls apart on the first question. The question will come. Have the split ready.

## Your turn

**Guided Exercise 1: Storytelling, Financial Narrative, and Market Size**

**Part A: Storytelling in pitches**

Use these storytelling principles on your own deck:

- Your pitch is a story with a beginning (problem), middle (solution + progress), and end (the future you are building)
- The emotional arc: "This is broken" (frustration) then "We fixed it" (hope) then "Here is the proof" (confidence) then "Here is what is next" (excitement)
- Start with a specific person's pain, not an abstract market trend
- Use "you" language: "Imagine you are a solo developer. You have 3 side projects and zero way to track your progress..."
- End with a vision: "In 5 years, every solo developer in the world will manage their projects with TaskForge."

**Common pitch mistakes to avoid:**
1. Starting with your bio instead of the problem (nobody cares who you are until they care what you are solving)
2. Too many slides (12 maximum for a pitch, fewer is better)
3. Reading from slides (the slides are scenery, YOU are the main character)
4. No demo (you are a technical founder with a live product, show it!)
5. Vague ask ("We need money" vs "We are raising $500K to hit 3,000 subscribers in 18 months")
6. No traction slide (if you have zero traction, why should they believe?)
7. Ignoring competition (pretending competitors do not exist destroys credibility)
8. Over-projecting revenue ("We will make $100M in year 2" ... no you will not)

**Part B: The one-page financial narrative**

This is a companion document to your pitch deck. It tells the money story in prose.

**Template:**
```
FINANCIAL NARRATIVE: [Company Name]

REVENUE MODEL
[Company] generates revenue through [pricing model]. Our [primary plan]
costs $[X]/month and provides [key value]. We also offer [secondary plan]
at $[Y]/month for [different segment].

UNIT ECONOMICS
- Customer Acquisition Cost (CAC): $[X] (via [channels])
- Average Revenue Per User (ARPU): $[X]/month
- Lifetime Value (LTV): $[X] (based on [Z] month average retention)
- LTV:CAC Ratio: [X]:1

CURRENT TRACTION
As of [date], we have [X] total users, [Y] paying customers, and
$[Z] in monthly recurring revenue. Our month-over-month growth rate
is [X]%.

PROJECTIONS (3-Year)
Year 1: $[X] ARR ([Y] customers, [assumptions])
Year 2: $[X] ARR ([Y] customers, [assumptions])
Year 3: $[X] ARR ([Y] customers, [assumptions])

KEY ASSUMPTIONS
- Monthly churn rate: [X]%
- Free-to-paid conversion: [X]%
- Primary growth channels: [list]

USE OF FUNDS
We are raising $[X] to achieve [specific milestones]. This capital
will be deployed as follows:
- [X]% [Category]: [Specific use]
- [X]% [Category]: [Specific use]
- [X]% [Category]: [Specific use]

PATH TO PROFITABILITY
We expect to reach profitability at [X] paying customers, which
requires $[Y] in monthly revenue to cover operating costs of
$[Z]/month. At our current growth rate, we project reaching
profitability by [month/year].
```

**Part C: Market Size Calculation (25 min guided exercise)**

Calculate TAM, SAM, and SOM for your capstone, and show the arithmetic:

1. Define your broadest market (TAM): "All people/companies who could possibly use a product like mine"
2. Find a market size number: Google "[your market] market size", check Statista, industry reports
3. Define your reachable market (SAM): narrow by geography, segment, price point
4. Define your realistic capture (SOM): what you can get in 2-3 years with your resources
5. Show your math. A bottom-up calculation ("There are 2 million solo developers in the US. If we capture 0.5% at $12/month, that is $1.44M ARR") is more credible than a top-down one ("The project management market is $7B. If we get 1%, that is $70M.")

Pressure-test the numbers. If you have a partner, trade sheets. If you do not, try to break your own arithmetic.

**Success Criteria:** Three defensible market size numbers with clear assumptions and bottom-up math.

---

## The quest

**Independent Exercise 2: Elevator Pitch Draft**

Write and practice a 60-second elevator pitch:
- Sentence 1: What you built (the product)
- Sentence 2: Who it is for (the customer)
- Sentence 3: Why it matters (the problem it solves)
- Sentence 4: Why now (traction or market timing)
- Sentence 5: The ask (what you need)

Example: "I built TaskForge, an AI-powered project manager for solo developers. Solo devs abandon 73% of their projects because they lose track of what to do next. TaskForge breaks any project into daily tasks and keeps you accountable. We have 500 users and 47 paying subscribers. I am raising $500K to get to 3,000 subscribers and profitability."

Deliver it out loud, note where you ran out of breath or out of facts, and revise.

**Success Criteria:** A clear, concise, compelling pitch deliverable in under 60 seconds.

---

### Review the artifact

Your deliverable is **A venture-fit assessment, evidence-backed pitch narrative, and fundraising process map**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

![](diagram:session-11-3/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:** Sessions 11.1 and 11.2 completed; cap table homework from 11.2; clear understanding of capstone product's value proposition; familiarity with target market (from Unit 8 user research)
**Materials:** VC fund structure diagram, pitch deck slide-by-slide template, TAM/SAM/SOM calculation worksheet, financial narrative template, example pitch decks (Airbnb, Uber, Buffer early decks), market size data sources list

---

**Assignment: Pitch Deck First Draft**
**Objective:** Create the first draft of your pitch deck using the 10-12 slide format
**Time Estimate:** 3-4 hours
**Due:** Before Session 11.4

**Tasks:**
1. Create a Google Slides or PowerPoint presentation with ALL 12 slides from the template from this session
2. Use real data from your capstone (screenshots, user numbers, revenue if any)
3. Calculate and include your TAM/SAM/SOM numbers
4. Write your "Ask" slide with a specific dollar amount and use of funds
5. Keep each slide to ONE key message. Minimal text. Visual where possible.
6. Do NOT worry about design or polish yet. Content first.

**Submission:** Share the Google Slides link or upload to your capstone repo under `/docs/pitch-deck-v1`

**Stretch Goals (Optional):**
- Write your one-page financial narrative using the template from class
- Record a 3-minute video of you pitching with the deck (phone camera, screen share, no editing)

---

### Manual verification and further reading

- [Official reference 1](https://www.ycombinator.com/library/4b-how-to-pitch-your-company)
