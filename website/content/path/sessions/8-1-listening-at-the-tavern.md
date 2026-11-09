---
editorial: true
title: Listening at the Tavern
subtitle: User Research, Interviews, and Empathy Maps
hook: "The guild hall is built. Nobody asked for it. Today you pick the capstone idea in one afternoon, open its repo, write seven questions that cannot be answered with a polite lie, and book the people who will answer them."
read: 60
artifact: "The capstone repo with docs/research.md: a seven-question interview script that passes the Mom Test, one practice interview logged as P0, an empathy map built from it, and three to five real interviews booked for this week"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://www.gov.uk/service-manual/user-research/using-in-depth-interviews
  - https://www.gov.uk/service-manual/user-research/getting-users-consent-for-research
  - https://www.gov.uk/service-manual/user-research/find-user-research-participants
  - https://momtestbook.com/
  - https://cli.github.com/manual/gh_repo_create
say:
  - "Ask about the last time it happened, not whether they would use it."
  - "A quote is an observation. What I think it means is an interpretation, on its own row."
  - "The shared log says P1, P2, P3. The names live outside the repo."
---

## The hook

For seven units somebody else chose what you built. The quest list, the slate, the spellbook, the guild hall: each one arrived with its models and routes already decided, and your job was to make them work. The guild hall is deployed and tested, and it has one honest flaw. Nobody asked for it. It was a lesson, not a product. The capstone is different. It will be a product for a specific person who does a specific task today and finds it annoying, and the only way to know what that person needs is to ask them, carefully, without telling them your idea first.

By the end of this session the capstone exists as a folder, a repo, and a single file. The folder is `~/projects/<capstone-name>`, with a name you pick this afternoon by a method short enough to finish before dinner. The file is `docs/research.md`. It holds a seven-question interview script in which every question asks about something that already happened, one practice interview you run on a friend and log as P0, an empathy map built from that practice, and a schedule with three to five real people booked for twenty-minute calls before Session 8.4. You will also learn the one rule that makes the rest of the unit honest: the shared file says P1, P2, P3. The names stay on your phone.

> *The tavern is loud, and everyone in it will tell you your quest sounds wonderful. The adventurers who actually paid for the last one are sitting in the corner, and they will tell you what went wrong if you ask about Tuesday instead of about your plan.*

## The idea

### Pick the idea in one afternoon

You do not need a startup. You need one person and one task. Here is the method. Set a timer for ninety minutes and do the steps in order; the timer is there so you stop when it rings, not so you work faster.

First, list ten tasks. Each one is something you, or somebody you can message today, did in the last month using a spreadsheet, a group chat, a paper notebook, or a tool they complained about. Write the person and the task, nothing else: "independent tutors, keeping track of who has paid", "a friend who runs a climbing club, collecting dues", "my cousin, planning meals for a shared flat". Do not write solutions. If a line contains the word "app", cross it out and write the task again.

Second, cross out any line where you cannot name three real people who do that task and whom you could message this week. Not a demographic. Three names. The interviews in 8.4 are not optional, and a task with no reachable people is a task you cannot research.

Third, cross out any line where the smallest useful version needs something you have not built. Accounts, a list, a form, a detail page, a relationship between two models, and one thing that is specific to the task: that is the shape of the guild hall, and that is the shape Unit 12 can finish in four sprints. Payments and AI arrive in Unit 10 and can join later. A capstone that is "like Uber" cannot.

Fourth, of what is left, pick the line where you have heard a specific complaint, from a specific person, on a specific day. "She said she texted the same client twice about the same invoice and felt awkward both times." That memory is worth more than a market.

Fifth, write the idea as one sentence with no solution in it: a person, a task they do today, the tool they use, and what goes wrong. Three examples of the sentence, so you can hear the shape:

- "Independent tutors keep track of which clients have paid in a spreadsheet, and they lose track of who still owes them after the second missed lesson."
- "A community garden coordinator assigns plots and watering turns over a group chat, and the schedule is wrong by the second week."
- "A small bakery takes pre-orders for weekend cakes over Instagram messages, and twice a month they bake the wrong number."

That sentence is the capstone idea. The solution is not in it on purpose. You will write a solution in 8.2, after you have a backlog, and you will revise it in 8.4, after real people have talked to you. Pick a folder name now, short and lower-case with hyphens, the way every project since Unit 2 has been named: `tutor-ledger`, `plot-rota`, `cake-orders`. That is `<capstone-name>` for the rest of the path.

### Why you ask about last Tuesday, not next year

The Mom Test is a short book by Rob Fitzpatrick, and its premise is that people lie to you to be nice, most of all the people who love you. The title is the test: a question is a good question if your mother could not answer it with a kind lie. "Would you use an app that tracks who has paid?" fails. She would. "When did a client last pay you late, and what did you do about it?" passes. She either has a story or she does not, and either answer is evidence.

The four rules are short enough to keep on a sticky note.

1. Talk about their life, not your idea.
2. Ask about specifics in the past, not hypotheticals about the future.
3. Talk less, listen more.
4. Push for commitment and advancement, not compliments.

The same rules as a table of questions you will be tempted to ask, and the question to ask instead.

| Bad question (fails the test) | Why it fails | Good question (passes) |
|---|---|---|
| "Would you use an app that does X?" | Hypothetical future, invites a polite yes | "How do you currently handle X?" |
| "Do you think this is a good idea?" | Begs for a compliment | "What have you tried to solve this?" |
| "Would you pay ten dollars a month for this?" | Imaginary money costs nothing | "What do you spend on this today, in money or hours?" |
| "Do you have this problem?" | Leading; yes is free | "Tell me about the last time you dealt with X." |
| "What features would you want?" | Users design bad products | "Walk me through what you did the last time you did X." |

Three kinds of bad data come out of conversations, and you will hear all three this week. Compliments: "That sounds awesome." Fluff: "I would definitely use that." Ideas: "You should add a feature that..." A compliment is worth nothing. Fluff is a hypothetical dressed as a promise. An idea is a clue about a problem, and your job is to ask what happened the last time that problem showed up, not to write the feature down.

The difference, in one exchange. Bad: "I am building a meal planning app. Do you think that is useful?" "Oh yeah, totally." Good: "When did you last plan meals for the week? Walk me through what happened." "Honestly, I tried once three months ago and gave up by Wednesday because I forgot to buy half the ingredients." The second answer told you the problem is not planning. It is the shopping list. Nobody would have said that to the first question.

### Research starts with a decision

Write the product decision the interviews should inform before you write a question. "Learn about tutors" is too broad to guide twenty minutes. "Understand how independent tutors notice that a lesson is unpaid, and what they do next" names a context, a behavior, and an uncertainty. From that sentence the questions fall out: the most recent unpaid lesson, the tools they opened, the moment it went wrong, the workaround.

Separate the research question from the interview question. You want to know whether reminders would be valuable. You do not ask "Would reminders help?", because the answer is yes and it means nothing. You ask how they notice an overdue payment now, what happens next, and what the delay costs them. The participant supplies the story. You interpret its implications afterward, in the file, with the interpretation on its own row.

### The script has a shape

A twenty-minute interview has five parts, and you write all five down even though you will not read them aloud word for word.

1. **Warm-up.** Who you are, what the broad area is (never your idea), how long it takes, how the notes will be used, and a separate question asking if it is fine to take notes.
2. **Context.** Two questions about their world: what they do, how often the situation comes up.
3. **Problem exploration.** Three questions about the pain, each with follow-ups. "Tell me about the last time." "What was the hardest part?" "What happened next?"
4. **Current solutions.** Two questions about what they do today: the tools, how they found them, what is missing, what they tried and stopped using.
5. **Wrap-up.** Anything you did not ask about, and whether they know one or two other people who deal with the same thing. That second question is how your list of three becomes five.

Seven numbered questions, each with at least one follow-up. Seven is the number everywhere in this unit. The follow-ups matter more than the questions. "Tell me more about that" and "What happened next?" are the two most useful sentences you will say all week. Silence is fine. Let them think. Write during the conversation, in shorthand, and write the full notes within a day while the voice is still in your head.

### Consent and the anonymised log

Before the first question, say what the research is for, how long it will take, and what happens to the notes. Ask separately before recording; a person can say yes to notes and no to a recording, and they can skip any question. Collect the minimum. You need the workflow, not their employer, their health, or a screenshot of their bank app.

The log you push to GitHub uses participant ids: P0 for the practice interview, then P1, P2, P3 in the order the real interviews happen. The mapping from id to name lives in one place that is not the repo: a note on your phone, or a file in your home folder such as `~/participants-private.md`. Never a gitignored file inside the capstone; someone un-ignores it in a year. When the write-up is done and the spec is written in 8.4, delete the raw notes you no longer need.

Recruit for behavior, not convenience. The friend you interview today is practice. Their desire to encourage you distorts the evidence, which is why the practice interview is labelled P0 and its empathy map says "practice" at the top. The real interviews are with people who did the task in the last month and can describe a specific afternoon when it went badly. Five conversations can reveal a pattern. They cannot give you a percentage, and the file should never pretend otherwise.

### The empathy map and the gap

An empathy map is four boxes you fill from the notes after the conversation.

**Says** holds direct quotes, in their exact words, including the sigh. **Thinks** holds what they probably believe but did not say, inferred from context, and it is labelled as inference. **Does** holds observable actions: what they opened, what they typed, who they asked, how many apps it took. **Feels** holds emotional states you heard or saw: frustration, relief, guilt, anxiety.

The valuable row is the gap between Says and Does. "I always chase late payers the same day" in Says, next to "has not sent a reminder in six weeks" in Does, tells you the intention is real and the execution barrier is real, which is where a product lives. Empty cells are allowed. An honest map with a blank Feels box is more useful than a full map padded with guesses.

From the map you write three kinds of insight: pain points (where the frustration is, where they give up), unmet needs (what they are working around, the hacks), and opportunities (where you could remove a step, automate a chore, or make a status visible). Each insight points back at the quote or action it came from.

The napkin version: pick a person and a task. Write a decision the interviews should inform. Ask seven questions about the past. Separate what they said from what you think it means. Store the ids in the repo and the names outside it. Map says, thinks, does, feels, and look for the gap.

![](diagram:session-8-1/fig1-model)

### Ask the model to be the skeptic

The prompt habit from [5.2](/path/5-2-advanced-incantations/) has a real job here. Paste the four rules and your seven questions into the AI chat you set up in Unit 5 and ask it to grade each question as "asks about a concrete past event", "asks about a hypothetical future", or "contains my solution", and to rewrite the failing ones. Then decide yourself. The model is good at spotting "would you" and bad at knowing your tutor. Keep the rewrites that still sound like something you would say to a person at a kitchen table.

## The demonstration

One worked example, start to finish, for the idea sentence "Independent tutors keep track of which clients have paid in a spreadsheet, and they lose track of who still owes them after the second missed lesson." The folder is `tutor-ledger`. Yours will have a different name and the same steps.

Make the folder and the repo first, so the research has somewhere to live. Nothing is running from Unit 7; this unit starts no servers.

```bash
mkdir -p ~/projects/tutor-ledger/docs
cd ~/projects/tutor-ledger
git init
```

```text
Initialized empty Git repository in /home/you/projects/tutor-ledger/.git/
```

A README with the idea sentence is the first commit. The sentence is the one thing about the capstone that should not change this week.

```bash
printf '# tutor-ledger\n\nIndependent tutors keep track of which clients have paid in a spreadsheet, and they lose track of who still owes them after the second missed lesson.\n' > README.md
git add README.md
git commit -m "Capstone idea"
gh repo create tutor-ledger --public --source=. --push
```

```text
✓ Created repository you/tutor-ledger on GitHub
✓ Added remote https://github.com/you/tutor-ledger.git
✓ Pushed commits to https://github.com/you/tutor-ledger.git
```

Now the research file. Copy this into `docs/research.md` and fill it in. The example that follows the template is the same file filled for the tutor ledger.

```markdown
# Research: <capstone-name>

## Idea sentence
<person> does <task> today with <tool>, and <what goes wrong>.

## Decision this research informs
<one sentence naming a context, a behavior, and an uncertainty>

## Interview script (20 minutes)

### Warm-up
"Thanks for making time. I am looking into how <broad area, not the idea>
works for people like you. It takes about twenty minutes, there are no
right answers, and I will use anonymised notes for a project. Is it okay
if I take notes?"

### Context
1. <question>
   - Follow-up: <question>
2. <question>
   - Follow-up: <question>

### Problem exploration
3. "Tell me about the last time <the task went wrong>. Walk me through it."
   - Follow-up: "What was the hardest part?"
   - Follow-up: "What happened next?"
4. <question>
   - Follow-up: <question>
5. <question>
   - Follow-up: <question>

### Current solutions
6. <question>
   - Follow-up: <question>
7. <question>
   - Follow-up: <question>

### Wrap-up
"Is there anything about <area> I should have asked about? And do you know
one or two other people who deal with this that I could talk to?"

## Schedule
| id | who (role only) | date | format | booked |
|---|---|---|---|---|
| P1 | | | | no |
| P2 | | | | no |
| P3 | | | | no |

## Interview log

### P0 (practice; not evidence)
- date:
- role:
- consent: notes yes / recording no

| kind | text |
|---|---|
| observation | |
| interpretation | |

## Empathy map (P0, practice)
| Says | Thinks (inferred) |
|---|---|
| | |

| Does | Feels |
|---|---|
| | |

## Insights
- Pain point:
- Unmet need:
- Opportunity:

## Reflection
<three to five sentences: which question worked, which one you would change>
```

The filled example. Only the parts that change are shown; the headings are the template's.

```markdown
## Idea sentence
Independent tutors keep track of which clients have paid in a spreadsheet,
and they lose track of who still owes them after the second missed lesson.

## Decision this research informs
Understand how independent tutors notice that a lesson is unpaid, and what
they do in the hour after they notice.

### Context
1. "Tell me about your tutoring at the moment: how many clients, how often,
   how you get paid."
   - Follow-up: "How long has it worked that way?"
2. "How often does a lesson go unpaid for more than a week?"
   - Follow-up: "When was the most recent one?"

### Problem exploration
3. "Tell me about the last time a client was late paying. Walk me through
   it from the moment you noticed."
   - Follow-up: "What was the hardest part?"
   - Follow-up: "What happened next?"
4. "What did you have to open or check to work out who still owed you?"
   - Follow-up: "How long did that take?"
5. "Has a payment ever slipped through completely? What happened?"
   - Follow-up: "How did you find out?"

### Current solutions
6. "What do you use right now to keep track of lessons and payments?"
   - Follow-up: "How did you end up with that setup?"
   - Follow-up: "What is missing from it?"
7. "Have you tried anything else and stopped? What happened?"
   - Follow-up: "At what point did you stop?"
```

Grade the seven against the table. None contains "would you". None mentions a ledger, an app, a reminder, or a dashboard. Four of them start with "the last time" or "right now". Question 2 asks for a frequency, which is a number the person can actually know, not a prediction. That is a script that passes.

Then the practice interview. The friend in this example tutors maths on weekends, which makes her a fair practice subject and a biased one; she is P0, and the file says so. Twenty minutes, phone call, notes only. The log is two columns and every row is tagged.

```markdown
### P0 (practice; not evidence)
- date: 2026-11-04
- role: part-time maths tutor, four clients
- consent: notes yes / recording no

| kind | text |
|---|---|
| observation | "I have a Google Sheet with a column called Paid? and I fill it in when I remember." |
| observation | Opened the bank app first, then the sheet, then the WhatsApp chat with the parent, to answer "who owes me". |
| observation | "I texted her twice about the same lesson and felt awkward both times." |
| interpretation | The awkwardness, not the spreadsheet, is what delays the second reminder. |
| observation | "I once just let it go. It was thirty pounds and I could not face asking a third time." |
| interpretation | A visible, neutral status might replace the personal text; worth asking real tutors. |
```

The empathy map comes from those rows and nowhere else.

```markdown
## Empathy map (P0, practice)
| Says | Thinks (inferred) |
|---|---|
| "I fill it in when I remember." | "I should be more organised than this." |
| "I felt awkward both times." | "Asking a third time makes me look petty." |

| Does | Feels |
|---|---|
| Checks three apps to answer one question. | Awkward when chasing. |
| Let a thirty-pound lesson go unpaid rather than ask again. | Relieved when a parent pays without being asked. |

## Insights
- Pain point: answering "who owes me" takes three apps and a memory.
- Unmet need: a way to chase that does not feel personal.
- Opportunity: a status a tutor can see in one place, before any reminder is sent.
```

Notice what the map does not contain: her name, her clients' names, the amount beyond a round figure she volunteered, and any feature. The opportunity row is a direction, not a story. Stories come in 8.2.

The schedule is the last block you fill before you push. In the example, five people were messaged on the Wednesday evening with one sentence each ("I am doing a small research project on how tutors keep track of payments; could I have twenty minutes on a call this week?") and three said yes by Friday.

```markdown
## Schedule
| id | who (role only) | date | format | booked |
|---|---|---|---|---|
| P1 | full-time tutor, 12 clients | 2026-11-07 | video | yes |
| P2 | tutor via an agency and privately | 2026-11-08 | phone | yes |
| P3 | music teacher, pays per term | 2026-11-10 | video | yes |
| P4 | tutor from P1's referral | | | asked |
| P5 | | | | no |
```

Three of the five booked before 8.4. The names and numbers are in `~/participants-private.md`, which is not in the repo and never will be.

Here is a small model you can run here. It proves three things about the file you are about to write: that a question containing a hypothetical is flagged and a question about a recent event is not, that interpretations in the log are kept but not counted as evidence, and that a shared log built from a name list contains ids and no names. It does not prove your questions are good, that your friend told you the truth, or that three people will turn up. Those you verify by doing them.

```js run=checkpoint-8-1
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const hypothetical = [/\bwould you\b/i, /\bdo you think\b/i, /\bgood idea\b/i, /\bwhat features\b/i, /\bmy app\b/i, /\bdo you have this problem\b/i];
const concrete = [/\blast time\b/i, /\bwalk me through\b/i, /\bcurrently\b/i, /\bright now\b/i, /\bwhat did you\b/i, /\bhow do you\b/i, /\bwhat happened\b/i, /\bhow often\b/i];

function momTest(question) {
  if (hypothetical.some(function (re) { return re.test(question); })) return 'fails';
  if (concrete.some(function (re) { return re.test(question); })) return 'passes';
  return 'unclear';
}

const script = [
  'Would you use an app that tracks which clients have paid?',
  'Walk me through the last time a client paid you late.',
  'How do you currently keep track of who owes you money?',
  'Do you think a reminder feature is a good idea?',
  'What did you do the last time you noticed a lesson was unpaid?'
];
const graded = script.map(momTest);
check(graded.filter(function (g) { return g === 'fails'; }).length === 2, 'two of the five questions fail the Mom Test');
check(graded[1] === 'passes' && graded[2] === 'passes' && graded[4] === 'passes', 'questions about a recent concrete experience pass');

const log = [
  { kind: 'observation', text: 'Opened the bank app, then the sheet, then the chat' },
  { kind: 'interpretation', text: 'Awkwardness delays the second reminder' },
  { kind: 'observation', text: '"I texted her twice and felt awkward both times"' },
  { kind: 'observation', text: 'Let a thirty-pound lesson go rather than ask again' }
];
const evidence = log.filter(function (n) { return n.kind === 'observation'; });
check(evidence.length === 3, 'interpretations are not counted as observations');
check(log.length - evidence.length === 1, 'the interpretation stays in the log on its own row');

function anonymise(entries, people) {
  const ids = new Map(people.map(function (name, i) { return [name, 'P' + (i + 1)]; }));
  return entries.map(function (e) { return { who: ids.get(e.who) || e.who, text: e.text }; });
}
const shared = anonymise(
  [{ who: 'Maya', text: 'texted twice' }, { who: 'Theo', text: 'bank app first' }],
  ['Maya', 'Theo']
);
check(shared.every(function (e) { return /^P\d+$/.test(e.who); }), 'every entry in the shared log carries a participant id');
check(JSON.stringify(shared).indexOf('Maya') === -1, 'no name survives into the shared file');

console.log('ok: checkpoint-8-1');
```

## Where it breaks

![](diagram:session-8-1/fig2-diagnosis)

### Leading question

The symptom is a log full of yes. Every participant agreed, nobody told a story, and the empathy map has a Says column of compliments and an empty Does column. The cause is that you handed them the answer: "Would you use an app that tracks who has paid?" contains your solution and a hypothetical, and a kind person says yes to both. The fix is to go back to the script and cross out every question that contains your idea or the word "would". Replace each one with the last time the problem happened: what they opened, what they typed, where it got annoying, what they did instead. Their verbs are the evidence. If they bring up a solution themselves, write it down as an observation, and still ask what they do today.

### Friends flatter the idea

The symptom is three enthusiastic interviews and nothing in the Does column that resembles the task. The cause is recruitment: you interviewed people who like you instead of people who did the task last month, and encouraging a friend is a different activity from describing a bad afternoon. The fix is in the schedule table. P0 is practice and is labelled practice. P1 to P5 are people who can name a specific day the task went wrong, found through the wrap-up question, a community the task lives in, or a message to someone two hops away. If you cannot find anyone who has the problem, write that down as the finding of the week. Do not replace them with a more supportive audience.

### Private detail retained

The symptom is a pushed file that contains a first name, an employer, a client's name, a health detail, or a screenshot of a spreadsheet with amounts next to names. The cause is that you captured everything in the moment and never separated the shared log from the private note. The fix has three parts. Say what you are collecting before you start, and collect the minimum. Keep the id-to-name mapping outside the repo and refer to P1 in every file that goes to GitHub. When a detail has already been pushed, remove it, commit, and treat the history as public from that moment; a research habit that leaks is a product risk you built before you had a product.

## Your turn

The example above was the tutor ledger. Now do it for the idea you chose this afternoon. Every step has a command or a file and the line you should see.

1. Pick the idea with the ninety-minute method, write the one sentence, and choose `<capstone-name>`. Then create the folder and the repo:

   ```bash
   mkdir -p ~/projects/<capstone-name>/docs
   cd ~/projects/<capstone-name>
   git init
   ```

   You should see `Initialized empty Git repository in /home/you/projects/<capstone-name>/.git/` (on macOS the path starts with `/Users/`).

2. Write `README.md` with the idea sentence, commit it, and publish the repo with `gh repo create <capstone-name> --public --source=. --push`. You should see `✓ Pushed commits to https://github.com/YOU/<capstone-name>.git`.

3. Copy the template into `docs/research.md`. Fill the idea sentence, the decision, and the seven questions with at least one follow-up each. Read the questions aloud. If one sounds like a form, rewrite it as something you would say across a table.

4. Grade each question against the bad/good table. Cross out any that contain "would", "do you think", or your solution, and replace them with "the last time" questions. Then paste the four rules and the script into the AI chat from Unit 5 and ask for a grading; keep only the rewrites you would actually say. Count: seven questions, zero hypotheticals.

5. Run the practice interview with one friend who is near the task. Twenty minutes, notes only, consent asked before you start. Log it under `### P0 (practice; not evidence)` with every row tagged `observation` or `interpretation`. You should have at least five observation rows and at least one interpretation row.

6. Build the P0 empathy map from the log and nothing else, with at least two entries in Says and Does, and write one pain point, one unmet need, and one opportunity, each pointing at a row. Write the reflection: which question worked, which you would change.

7. Fill the schedule. Message five people tonight with one sentence each, asking for twenty minutes before Session 8.4. Book every yes with a date and a format. Put the names in `~/participants-private.md` or your phone, and only the role in the table. By the time you start 8.2 the table should show at least three rows with `booked: yes`.

8. Commit and push:

   ```bash
   git add docs/research.md
   git commit -m "Research: script, P0 practice interview, schedule"
   git push
   ```

   You should see `main -> main` in the push output, and `docs/research.md` on GitHub with ids and no names.

If nobody has answered by the time you push, that is normal just after your first outreach. Send the messages anyway; the booking is the quest's evidence, and it has until 8.4.

## The quest

![](diagram:session-8-1/fig3-evidence)

One deliverable: `docs/research.md` in `~/projects/<capstone-name>`, pushed, version zero. It is complete when a stranger could run your interview from it and could not learn who you talked to.

Evidence:

- `README.md` with the one idea sentence and no solution in it.
- Seven numbered questions, each with a follow-up, none containing "would you", "do you think", or your idea.
- A P0 log labelled practice, every row tagged observation or interpretation, at least five observations.
- A P0 empathy map with the Says and Does columns filled from the log, and three insights that point at rows.
- A schedule table with at least three rows booked, roles only, and a private name list that is not in the repo.
- The commit `Research: script, P0 practice interview, schedule` visible at `https://github.com/YOU/<capstone-name>`.

## Side quests

The one-breath definitions page is how you describe what you build when an interviewee asks, without turning the warm-up into a pitch, and the grit story is for the evening when the third message goes unanswered.

## Before next session

Run the interviews as they land this week; each one goes into the log as P1, P2, P3 in the order it happens, observations and interpretations on separate rows, within a day of the call. Nothing is running on your machine, and nothing needs to be: this unit is files and conversations. Next session starts with the idea sentence and the P0 map open, and turns them into a backlog of user stories, each one honestly tagged as evidence or assumption, with a board to pin them on. Read the first chapter of The Mom Test if you have it; it is short, and the second interview will go better than the first either way.
