---
editorial: true
title: The Character Sheet Forge
subtitle: Build and Deploy Your Landing Page
hook: "Five sessions of skeleton, armor, formation and motion become one page with your name on it, and today it goes on the internet at a URL you can send to anyone. Then you prove the page a visitor gets is the page you built: on a phone, from the keyboard, with every path resolving under the prefix GitHub gives you."
read: 55
artifact: "~/projects/landing-page: a personal landing page in semantic HTML and one stylesheet, BEM throughout, Flexbox for the bar and Grid for the cards, mobile-first, a skip link, visible focus, reduced motion respected; a public repository called landing-page with a README; live on GitHub Pages at https://USER.github.io/landing-page/ and checked on a phone"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
  - https://docs.github.com/en/pages/getting-started-with-github-pages/about-github-pages
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility
  - https://webaim.org/resources/contrastchecker/
  - https://developer.chrome.com/docs/lighthouse/overview
  - https://squoosh.app/
say:
  - "the page answers three questions: who you are, what you can do, how to reach you"
  - "Pages serves one branch and one folder, and it looks for index.html at that root"
  - "a path that starts with a slash starts at the host, not at your project"
---

## The hook

Everything in this unit was practice on pages nobody else will open. The adventure log, the potion shop, the holy grail, the enchantments workshop: real files, real commits, and an audience of one. Today the audience changes. You build one page that says who you are, what you can do, and how to reach you, and then you put it on the internet at an address that works from any phone in the world. It is a small page. It is also the first thing you have made that a stranger can find.

By the end of the session there is a new folder, `~/projects/landing-page`, with `index.html`, `style.css`, a `README.md`, and an image. There is a public repository with the same name. There is a URL, `https://YOU.github.io/landing-page/`, that you have opened in a private window, tabbed through with the keyboard, and checked at a phone width. And there is one sentence in the README that says what the page does not do yet, because a page you can describe honestly is worth more than one you have to apologise for.

> *The forge is lit. Every adventurer who walks into the guild hall carries a sheet: a name, a class, a short list of what they can do, and a way to send for them. Yours gets written today, and then it gets pinned to the board outside, where anyone can read it.*

## The idea

A landing page is a page with one job. A visitor arrives from a link, usually on a phone, usually with ten seconds of patience, and wants three answers: who is this, what can they do, how do I reach them. Everything on the page either answers one of those questions or gets in the way. That rule decides the section order before you write a line of CSS, and it decides what the one button on the page says.

The build is an assembly, not a new lesson. The skeleton is [2.1](/path/2-1-the-skeleton-frame/): `header`, `nav`, `main`, `section`, `footer`, one `h1`, an `img` with an `alt` that describes it. The armor is [2.2](/path/2-2-armor-and-cosmetics/): a border-box reset, custom properties on `:root`, a font from Google Fonts. The formation is [2.3](/path/2-3-formation-magic/): a nav that is a column on a phone and a row from 768 pixels up, a grid of cards that fits as many as the width allows. The enchantments are [2.4](/path/2-4-enchantments/): one entrance, one hover, BEM names, reduced motion respected. What is new today is the last step, release, and the three ways a released page differs from the one on your screen.

![](diagram:session-2-5/fig1-model)

### Content before layout

Write the words first. Your name, as you want it read. One sentence that says what you build, in plain words, with a noun in it: "I build small web apps and write down how they work" says more than "passionate developer". Three skills, each with a title and one line. Two or three sentences about you. Two projects, which at this point in the path are the adventure log and the potion shop, and that is fine; a project card that links to a real page you made beats a card that says "coming soon". One contact action.

Choose that action before you style it. If you want email, the link is `mailto:you@example.com` and the button says what happens: "Email me". If you want conversations on another platform, link there and name it. A button that says "Send" next to no form is decoration, and a form on a static site has nowhere to send its message. Pages serves files. It does not run a program that receives anything. The contact form arrives in Unit 4, with a server behind it. Today the contact section is a link, and the page says so.

Then design for the awkward version of the content. Make one project title twice as long and watch the card grow instead of cropping. Replace the two sentences about you with two paragraphs. Take the portrait out and see whether the about section still reads. A layout that only works with the exact words you wrote is a screenshot, not a system.

### What GitHub Pages actually is

GitHub Pages takes the files in one branch of one repository and serves them over HTTPS, unchanged, at a fixed address. For a project repository the address is `https://USER.github.io/REPO/`, where `USER` is your GitHub username and `REPO` is the repository name. You push, GitHub copies the branch to its web servers, and a minute later the files are live. There is no build step for plain HTML and CSS. There is no server of yours. If it is in the branch, it is on the internet; if it is not in the branch, it is not.

Three facts follow from that, and all three of today's failures come from forgetting one of them.

Pages publishes one branch and one folder. You pick them in the repository settings: `main` and `/ (root)` for this project. Files on another branch, files you never committed, and files that exist only on your disk are not published.

Pages looks for `index.html` at that root. The address ends in a slash, and the file that answers a slash is `index.html`, spelled exactly like that. `Index.html` is a different file on the web server, even though your laptop may treat the two names as the same.

Pages serves a project under a prefix. Your page is not at the root of a domain. It is at `/landing-page/` on `USER.github.io`. A link written `href="/style.css"` means "the stylesheet at the root of the host", which is `https://USER.github.io/style.css`, which does not exist. A link written `href="style.css"` means "the stylesheet next to this HTML file", which is under the prefix, which is right. Every path in this project is relative for that reason.

### Accessibility is a list you already started

You have been doing pieces of this since the first session: the `alt` text in 2.1, the labels that focus their fields, the reduced-motion query in 2.4. The [accessibility overview](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility) is the list those pieces belong to. For a landing page the list is short.

Semantic sectioning. `header`, `nav`, `main`, `section`, `footer` are landmarks a screen reader can jump between. One `h1`, then `h2` for each section, then `h3` inside cards. The heading outline is a table of contents whether or not you draw one.

Alt text on every image. The portrait describes the person. A decorative flourish gets `alt=""`. An image with no `alt` attribute at all is unfinished.

Contrast. Normal text needs a ratio of at least 4.6 to 1 against its background, and the [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/) will tell you the number for any two colours. This matters today because the obvious choice is wrong. White text on the green this page uses, `#00A868`, is 3.09 to 1, which fails. The near-black ink on the same green is 6.21 to 1, which passes. The muted grey `#8A8A94` on the page background `#0f0f1a` is 5.57 to 1, which passes, and it would fail if you made it a little greyer. Check the pairs you are tempted to eyeball.

Keyboard. Every link and button must be reachable with Tab and must show where focus is. Browsers draw a focus ring by default; a stylesheet that sets `outline: none` to make a mockup look clean has removed the only sign a keyboard user has. Replace it, never remove it. `:focus-visible` draws the ring only for keyboard focus, which is the behaviour people usually wanted when they reached for `none`.

A skip link. The first focusable thing on the page is a link to `#main`, hidden until it receives focus. A keyboard user presses Tab once, sees "Skip to content", presses Enter, and lands past the navigation. It is three lines of CSS and the first thing a reviewer checks.

Reduced motion. The query from 2.4, complete this time: durations near zero, iteration count forced to one so an infinite pulse does not loop at a thousand frames a second, and smooth scrolling switched off, because a page that glides to its anchors is motion too.

### Performance is mostly the image

A landing page with one stylesheet and no script is fast unless the image is enormous. A photograph straight from a phone is four thousand pixels wide and several megabytes, and it will be the only slow thing on the page. Run it through [Squoosh](https://squoosh.app/) before it goes in the folder: resize to the largest size the page will display, which for a 200 pixel portrait is 400 pixels to stay sharp on a dense screen, and export as WebP or JPEG. A portrait under 50 kilobytes is normal.

Give the `img` its `width` and `height` attributes, in pixels, matching the file. The browser then reserves the space before the bytes arrive, and the text below does not jump when the picture lands. CSS still decides the displayed size; the attributes only set the ratio. Add `loading="lazy"` to images below the first screen so the browser fetches them when they are about to be needed.

Then measure instead of guessing. Chrome DevTools has a Lighthouse panel. Run it against the live URL with the Accessibility and Performance categories ticked, read the failures, and fix the ones that name your file. A score is not the point. The list under it is.

> **Note:** Napkin version. Write the content, lay it out with the parts you already own, release it. Pages serves one branch and one folder, looks for `index.html` at that root, and puts the whole project under `/landing-page/`, so every path is relative. Before you call it done: keyboard, phone width, contrast numbers, one honest sentence in the README.

## The demonstration

One new folder, one new repository, four files, one URL. The folder is a sibling of `html-css-foundations`, never inside it; a repository inside a repository is the first trap of the day, and `git status` would show you a folder instead of files. Stop Live Server if it is still serving the enchantments page, with the Port line in the VS Code status bar, so it serves the new folder when you start it again.

```bash
mkdir -p ~/projects/landing-page
cd ~/projects/landing-page
git init
gh repo create landing-page --public --source=. --remote=origin
mkdir images
cp ~/projects/html-css-foundations/portrait.png images/portrait.png
code .
```

`git init` answers `Initialized empty Git repository in /home/you/projects/landing-page/.git/`. `gh repo create` answers `✓ Created repository YOU/landing-page on GitHub` and `✓ Added remote git@github.com:YOU/landing-page.git`, the same two lines it printed in 2.1. The `cp` line reuses the portrait from the adventure log so the page has an image on the first save; replace it with the picture you chose after 2.4 whenever you like, resized in Squoosh, and keep the name or change the `src` to match. `file images/portrait.png` prints the pixel size, which you will need for the `width` and `height` attributes.

The finished example is [dtc-landing](https://github.com/arthurbernierjr/dtc-landing). Read it after you have built yours, not before, so you compare two answers instead of copying one. Two things about it to know in advance: it names its stylesheet `styles.css` where this session says `style.css`, and it carries a tiny `server.js` and `package.json` because it is also deployed on Railway, which is a Unit 6 topic. Ignore the `game/` folder until Unit 3. The page itself is the same assembly you are about to do.

### The skeleton

`index.html`. Every class is BEM. Every path is relative. The year in the footer is the year you publish.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Name · Developer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <a href="#main" class="skip-link">Skip to content</a>

    <header class="header">
        <nav class="header__nav" aria-label="Page">
            <a href="#main" class="header__brand">Your Name</a>
            <ul class="header__links">
                <li><a href="#skills" class="header__link">Skills</a></li>
                <li><a href="#about" class="header__link">About</a></li>
                <li><a href="#projects" class="header__link">Projects</a></li>
                <li><a href="#contact" class="header__link">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main id="main">
        <section class="hero">
            <h1 class="hero__title">Hi, I am <span class="hero__name">Your Name</span></h1>
            <p class="hero__subtitle">I build small web apps and write down how they work.</p>
            <a href="#projects" class="hero__cta">See my work</a>
        </section>

        <section id="skills" class="skills">
            <h2 class="skills__heading">What I can do</h2>
            <ul class="skills__grid">
                <li class="skill-card">
                    <h3 class="skill-card__title">Interfaces</h3>
                    <p class="skill-card__text">Semantic HTML, Flexbox, Grid, and motion that respects a reduced-motion setting.</p>
                </li>
                <li class="skill-card">
                    <h3 class="skill-card__title">Tools</h3>
                    <p class="skill-card__text">Git, GitHub, VS Code, and a terminal I am no longer afraid of.</p>
                </li>
                <li class="skill-card">
                    <h3 class="skill-card__title">Next</h3>
                    <p class="skill-card__text">JavaScript starts next week. This card gets rewritten when it lands.</p>
                </li>
            </ul>
        </section>

        <section id="about" class="about">
            <h2 class="about__heading">About</h2>
            <div class="about__content">
                <img src="images/portrait.png" alt="Your Name, in the portrait from the adventure log" width="320" height="160" class="about__image">
                <div class="about__text">
                    <p>Two or three sentences. Who you are, what pulled you toward building things, what you are building toward.</p>
                    <p>This is the section a visitor reads to decide whether to send the email. Write it for that person.</p>
                </div>
            </div>
        </section>

        <section id="projects" class="projects">
            <h2 class="projects__heading">Projects</h2>
            <div class="projects__grid">
                <article class="project-card">
                    <h3 class="project-card__title">The adventure log</h3>
                    <p class="project-card__description">The first page of the path: semantic sections, a portrait with real alt text, and a list that became a table.</p>
                    <a href="https://github.com/YOU/html-css-foundations" class="project-card__link">Read the code</a>
                </article>
                <article class="project-card">
                    <h3 class="project-card__title">The potion shop</h3>
                    <p class="project-card__description">Three product cards in a grid, renamed to BEM, with a hover that lifts and a price pinned to the bottom of each card.</p>
                    <a href="https://github.com/YOU/html-css-foundations" class="project-card__link">Read the code</a>
                </article>
            </div>
        </section>

        <section id="contact" class="contact">
            <h2 class="contact__heading">Get in touch</h2>
            <p class="contact__text">The link below opens your email app with my address filled in.</p>
            <a href="mailto:you@example.com" class="contact__cta">Email me</a>
        </section>
    </main>

    <footer class="footer">
        <p class="footer__text">&copy; 2026 Your Name. Built with HTML and CSS.</p>
    </footer>
</body>
</html>
```

Read it as a visitor. The first Tab lands on the skip link. The nav links point at `#skills`, `#about`, `#projects`, `#contact`, and each one has a section with that `id` below. The hero names you and says what you do in one sentence, and its one button goes to the projects. The skills are a `ul`, because they are a list, and the grid is drawn on the list. The portrait has `width` and `height` from `file images/portrait.png`; change them if your file is a different size. The project links go to a real repository. The contact section says what the link will do before the visitor clicks it.

### The armor, the formation, the enchantments

`style.css`. The base rules are the phone. One query at 768 pixels adds the wide layout. The palette lives on `:root`, and the contrast numbers from The idea are the reason the button text is dark.

```css
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

:root {
    --color-bg: #0f0f1a;
    --color-surface: #16161A;
    --color-accent: #00A868;
    --color-accent-light: #2FD48F;
    --color-ink: #07110C;
    --color-text: #EAE6E1;
    --color-muted: #8A8A94;
    --color-heading: #ffffff;
    --font-main: 'Inter', system-ui, sans-serif;
    --max-width: 1100px;
    --space-section: clamp(3rem, 8vw, 6rem);
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-main);
    background-color: var(--color-bg);
    color: var(--color-text);
    line-height: 1.6;
}

/* Skip link: off screen until it has focus */
.skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--color-accent);
    color: var(--color-ink);
    padding: 0.5rem 1rem;
    z-index: 1000;
    transition: top 0.2s ease;
}

.skip-link:focus {
    top: 0;
}

/* Focus: replaced, never removed */
:focus-visible {
    outline: 2px solid var(--color-accent-light);
    outline-offset: 3px;
}

/* Header: a column on the phone, a row from 768 up */
.header {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: rgba(15, 15, 26, 0.95);
    backdrop-filter: blur(8px);
}

.header__nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 1rem 1.5rem;
}

.header__brand {
    color: var(--color-accent-light);
    text-decoration: none;
    font-weight: 700;
    font-size: 1.25rem;
}

.header__links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    list-style: none;
}

.header__link {
    color: var(--color-muted);
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s ease;
}

.header__link:hover {
    color: var(--color-accent-light);
}

/* Hero: the entrance from 2.4 */
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(16px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.hero {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    min-height: 80vh;
    padding: 2rem 1.5rem;
}

.hero__title {
    font-size: clamp(2rem, 6vw, 3.6rem);
    color: var(--color-heading);
    margin-bottom: 1rem;
    animation: fade-in-up 0.8s ease forwards;
}

.hero__name {
    color: var(--color-accent-light);
}

.hero__subtitle {
    font-size: clamp(1rem, 2.5vw, 1.3rem);
    color: var(--color-muted);
    margin-bottom: 2rem;
    max-width: 600px;
    opacity: 0;
    animation: fade-in-up 0.8s ease 0.3s forwards;
}

.hero__cta,
.contact__cta {
    display: inline-block;
    background-color: var(--color-accent);
    color: var(--color-ink);
    padding: 0.9rem 2rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.2s ease, transform 0.2s ease;
}

.hero__cta:hover,
.contact__cta:hover {
    background-color: var(--color-accent-light);
    transform: translateY(-2px);
}

/* Sections share one width and one rhythm */
.skills,
.about,
.projects,
.contact {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: var(--space-section) 1.5rem;
}

.skills__heading,
.about__heading,
.projects__heading,
.contact__heading {
    text-align: center;
    font-size: clamp(1.5rem, 3vw, 2rem);
    color: var(--color-heading);
    margin-bottom: 2rem;
}

/* Skills: a grid that fits as many cards as the width allows */
.skills__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    list-style: none;
}

.skill-card {
    background-color: var(--color-surface);
    padding: 2rem;
    border-radius: 8px;
    border-top: 3px solid var(--color-accent);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.skill-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 168, 104, 0.15);
}

.skill-card__title {
    color: var(--color-accent-light);
    margin-bottom: 0.75rem;
}

/* About: stacked on the phone, side by side from 768 up */
.about__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 2rem;
}

.about__image {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--color-accent);
    flex-shrink: 0;
}

.about__text p + p {
    margin-top: 1rem;
}

/* Projects */
.projects__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.project-card {
    background-color: var(--color-surface);
    padding: 2rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    transition: transform 0.3s ease;
}

.project-card:hover {
    transform: translateY(-4px);
}

.project-card__title {
    color: var(--color-heading);
}

.project-card__link {
    color: var(--color-accent-light);
    text-decoration: none;
    font-weight: 600;
    margin-top: auto;
    transition: color 0.2s ease;
}

.project-card__link:hover {
    color: var(--color-heading);
}

/* Contact */
.contact {
    text-align: center;
}

.contact__text {
    margin-bottom: 2rem;
    color: var(--color-muted);
}

/* Footer */
.footer {
    text-align: center;
    padding: 2rem 1.5rem;
    background-color: var(--color-surface);
    color: var(--color-muted);
    font-size: 0.9rem;
}

/* The wide layout, added on top of the phone */
@media (min-width: 768px) {
    .header__nav {
        flex-direction: row;
        justify-content: space-between;
    }

    .header__links {
        gap: 1.5rem;
    }

    .about__content {
        flex-direction: row;
        align-items: center;
        text-align: left;
    }
}

/* Reduced motion: complete, so nothing loops and nothing glides */
@media (prefers-reduced-motion: reduce) {
    html {
        scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

Start Live Server on the folder and read the page at a phone width first, with the device toolbar from 2.3. The nav is a column of centred links. The about section is a portrait above two paragraphs. The skills are one column. Drag the width past 768 and the bar becomes brand-left, links-right, the about section becomes a row, and the grids fill in as soon as two 250 pixel columns fit. Nothing scrolls sideways at 320. Turn on reduced motion in the Rendering panel of DevTools and reload: the hero appears without rising, the cards do not lift, and a click on a nav link jumps instead of gliding.

Then Tab from the address bar. The first press reveals the skip link at the top left. Enter lands focus past the navigation. Keep pressing and the ring moves through the nav, the hero button, the two project links and the email link, in the order they appear in the HTML. If the ring is ever missing, a rule somewhere set `outline: none`, and this file does not have one.

### The release

Commit, push, and tell Pages which branch and folder to serve.

```bash
cd ~/projects/landing-page
git add .
git status
git commit -m "Landing page: first release"
git push -u origin main
```

`git status` lists four things to be saved: `index.html`, `style.css`, `images/portrait.png`, and nothing else, because there is no README yet. The push answers `* [new branch] main -> main`, and from then on a bare `git push` is enough.

Now the setting. The stable way is the repository's settings page, which `gh browse --settings` opens in your browser. Choose **Pages** in the left column. Under **Build and deployment**, set **Source** to **Deploy from a branch**, choose the `main` branch and the `/ (root)` folder, and press **Save**. The page now shows the address, and within a minute or two it shows a line saying the site is live. The exact wording of that page changes; the [creating a site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) guide is the current version of the screenshots.

The same setting can be made from the terminal, with the API call `gh` wraps. It is one line, and it is the version you can put in your notes and repeat without a screenshot.

```bash
gh api -X POST repos/{owner}/{repo}/pages -f 'source[branch]=main' -f 'source[path]=/'
gh api repos/{owner}/{repo}/pages --jq '.html_url + " " + .status'
```

`gh` fills `{owner}` and `{repo}` from the folder you are standing in. The first call answers with a block of JSON that includes `"html_url": "https://YOU.github.io/landing-page/"`. The second prints that address and a status word; run it again until the word is `built`. If you already enabled Pages in the browser, the first call answers `409 Conflict`, because the site exists, and that is not an error you need to fix.

Open the address in a private window, so a cached copy of nothing can fool you. The page is there, in the same font, with the portrait. Open DevTools, choose the Network panel, and reload. Every row is a 200 or a 304. If `style.css` or `portrait.png` is a 404, the path is wrong, and the second diagnosis below tells you how. Open the same address on your phone. The column nav, the stacked about section, the one-column grid: the base rules, served to the device they were written for.

### A small model you can run here

Three rules from today can be written down as code: a relative path stays under the project prefix and a root-absolute one leaves it, `index.html` is one specific spelling, and every nav target needs a section with that `id`. The checkpoint below models them. It proves that you can state the rules. It does not prove your repository is published, that your file names are right, or that your page works on a phone. Those three are checked on your machine and at your URL, and nothing on this page can do them for you.

```js run=checkpoint-2-5
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}

const base = 'https://you.github.io/landing-page/';

function resolve(href) {
  return new URL(href, base).href;
}

check(resolve('style.css') === base + 'style.css', 'a relative path stays under the project prefix');
check(resolve('images/portrait.png') === base + 'images/portrait.png', 'a relative folder path stays under the project prefix');
check(resolve('/style.css') === 'https://you.github.io/style.css', 'a path that starts with a slash leaves the project');

const published = ['index.html', 'style.css', 'README.md', 'images/portrait.png'];
check(published.includes('index.html'), 'index.html is at the root with that exact spelling');
check(!published.includes('Index.html'), 'Index.html is a different file to the server');

const links = ['#skills', '#about', '#projects', '#contact'];
const sections = new Set(['main', 'skills', 'about', 'projects', 'contact']);
const missing = links.filter((link) => !sections.has(link.slice(1)));
check(missing.length === 0, 'Every navigation target exists');

const broken = ['#skills', '#blog'].filter((link) => !sections.has(link.slice(1)));
check(broken.length === 1 && broken[0] === '#blog', 'A broken target is detected');

console.log('ok: checkpoint-2-5');
```

Change `'style.css'` in the first check to `'/style.css'` and run it again. The check fails with the message it was guarding, which is the failure you would otherwise meet as a 404 in the Network panel. Put it back.

## Where it breaks

![](diagram:session-2-5/fig2-diagnosis)

### Blank deployed page

The repository is on GitHub, the settings page says Pages is on, and the address is a white screen or a GitHub 404 page. Pages publishes one branch and one folder, and it looks for `index.html` at that root with that exact spelling. A file named `Index.html`, a page that lives in a `src/` folder while Pages is pointed at `/`, a Source that still says **None**, or a push that went to a branch other than `main` all give the same empty result. Open the Pages settings and read the branch, the folder, and the deployment line before you touch the HTML. Then open the address GitHub printed, not one you assembled by hand. `gh api repos/{owner}/{repo}/pages --jq .status` says `building` or `built`; if it is still `building`, wait a minute and nothing is wrong yet.

### Missing assets

The HTML arrives and the stylesheet, the portrait, or the font does not. In the Network panel those rows are 404s, usually because the path was written from your laptop's point of view. A path that starts with `/` asks for the root of the host, and a project site is served from `/landing-page/`, so that slash skips the project. Write the path relative to the HTML file, `style.css` and `images/portrait.png`, and reload with the cache disabled. The same break hides inside the stylesheet: a `url("/images/…")` in CSS is resolved the same way. Casing is the other cause. `portrait.PNG` on disk and `portrait.png` in the `src` are the same file to many laptops and two different files to the web server. Match the name exactly.

### Unusable navigation

The page looks finished at a wide window and fails the moment a person tries to use it. Tab through it. If the focus ring never appears, a rule set `outline: none` and replaced it with nothing. If the ring jumps into a control that is off screen, the order of the HTML does not match the order of the layout. Then narrow the window to a phone width. A nav that overflows sideways, a button hidden under the sticky bar, text running off a card: that is the layout you shipped, not a browser quirk. Fix the focus order and the narrow width before you call the release done, and check both at the live address, because the live address is the one people get.

## Your turn

`~/projects/landing-page`, Live Server on, the device toolbar open. The files in the demonstration are the reference; this page is yours, so change the words, the colours, and the order of sections, and keep the rules.

1. Make the folder and the repository as a sibling of `html-css-foundations`, with `mkdir -p ~/projects/landing-page`, `cd ~/projects/landing-page`, `git init`, and `gh repo create landing-page --public --source=. --remote=origin`. The last command prints `✓ Created repository YOU/landing-page on GitHub`. Run `git status` and confirm it says `No commits yet`, not a line about a parent repository.
2. Put the image in place: `mkdir images` and either `cp ~/projects/html-css-foundations/portrait.png images/portrait.png` or your own picture after Squoosh. `file images/portrait.png` prints its size; those are the `width` and `height` for the `img`.
3. Write `index.html` with your name, your one sentence, three skills, two or three sentences about you, two projects that link to real pages, and one contact action whose text says what it does. Every nav `href` matches a section `id`. Open it in Live Server and press Tab once: the skip link appears.
4. Write `style.css`, mobile-first. At 320 pixels in the device toolbar nothing scrolls sideways. At 768 the nav and the about section become rows. Check your button text against its background in the WebAIM checker and write the ratio in a comment next to the rule; it must be 4.6 or more.
5. Turn on reduced motion in the Rendering panel and reload. The hero does not rise and a nav click does not glide. Turn it off and confirm both come back.
6. Commit and push: `git add .`, `git status`, `git commit -m "Landing page: first release"`, `git push -u origin main`. The push answers `* [new branch] main -> main`.
7. Enable Pages, in the browser from `gh browse --settings` or with the `gh api` line from the demonstration. Then run `gh api repos/{owner}/{repo}/pages --jq '.html_url + " " + .status'` until it prints `https://YOU.github.io/landing-page/ built`.
8. Open that address in a private window. The Network panel shows no 404. Open it on your phone. Tab through it from the keyboard. Those three checks are the release; a page you have only seen in Live Server is not released.

![](diagram:session-2-5/fig3-evidence)

If step 7 prints the address and `building` for more than a few minutes, open the repository's **Actions** tab; a workflow named `pages build and deployment` runs on every push, and its log says what it was doing when it stopped.

## The quest

One deliverable: the landing page, live, with a README that tells the truth about it. The README is the file a stranger reads on the repository page before they open the site, and it is where the review lives.

Copy this into `README.md` and fill it in.

```markdown
# Your Name · landing page

Live: https://YOU.github.io/landing-page/

![The landing page at a phone width and at a desktop width](images/screenshot.png)

## Built with

HTML, CSS, GitHub Pages. No framework, no script.

## Checked

- Keyboard: Tab reaches the skip link, four nav links, the hero button, two project links and the email link, in that order, with a visible ring.
- Contrast: button text on the button is 6.21 to 1; muted text on the background is 5.57 to 1.
- Phone: no sideways scroll at 320 pixels; the nav and the about section stack.
- Reduced motion: the hero does not rise and anchors jump instead of gliding.
- Lighthouse accessibility: 100, run against the live URL on <date>.

## Not yet

The contact section is a mailto link; a form needs a server, which arrives in Unit 4.

## One thing I learned

<one sentence>
```

A filled example, from a page whose button text was white until the contrast check: "Contrast: white on the green was 3.09 to 1 and failed, so the button text is now the near-black ink at 6.21 to 1." That sentence is the kind of thing a reviewer wants to read, because it shows the check was run and the page was changed by it.

Then the solo review that replaces having someone look over your shoulder. Open the live address in a private window, put the mouse out of reach, and give yourself one task with a clock running: from the top of the page, find one project and reach the contact link using only the keyboard. Write down where you hesitated. If you had to Tab past twelve links to reach the one you wanted, that is the skip link's job and it is not doing it. If anyone is nearby, hand them your phone with the page open and ask them to find how to contact you; say nothing while they look. Separate what you saw from what you want to change. "I could not tell the Projects heading was a section" is evidence. "Make it bigger" is a proposal. Fix the evidence, repeat the task, and put the before and after in the README under Checked.

Evidence, all in the repository:

- `index.html`, `style.css`, `images/portrait.png`, `README.md`, pushed to `main`.
- `images/screenshot.png`: the live page, captured in the device toolbar at a phone width and at a desktop width, side by side or one above the other.
- The live URL in the README, opened once in a private window with a clean Network panel.
- The Checked list with real numbers, the Not yet paragraph, and the one sentence you learned.

After it is live, read [dtc-landing](https://github.com/arthurbernierjr/dtc-landing) next to your own `index.html`. Same section order, same BEM habit, a different voice. Notice what it does that yours does not, and the other way round; the differences are the design decisions you made, and now you can name them.

## Side quests

Four sheets in the library stand near this page: two patterns that describe a page as a tree of parts and a base thing with one behaviour added, and two atelier pages on the widths where this page simplifies and on assembling a shipped page from two stylesheets.

## Before next session

Before you close the laptop, the README is pushed and the live address is in it. Send the address to one person. That is not a formality; a page that one other human has opened on their phone has been tested in a way no checklist matches, and you will fix something within the hour.

Nothing stays running on your machine. Stop Live Server from the status bar, close the folder, and the page keeps being served anyway, because GitHub's servers are doing the serving now, from the branch you pushed. That is what a deploy is: the work continues without you.

Next session is [3.1, Mana Basics](/path/3-1-mana-basics/), and the path changes language. JavaScript starts in a new repository, `~/projects/js-fundamentals`, made the way you made `html-css-foundations` and `landing-page`; the first step of that session creates it, so there is nothing to make tonight. What 3.1 opens first is the Console in Chrome DevTools, the panel next to the Elements and Styles panels you have been living in all unit. Open it once now, type `2 + 2`, press Enter, and read the answer. That is the whole of the preparation.

> **Say:** "The page answers three questions: who you are, what you can do, how to reach you. Pages serves one branch and one folder, and it looks for index.html at that root. A path that starts with a slash starts at the host, not at your project."

The sheet is pinned to the board. Next week you learn to make it do something.
