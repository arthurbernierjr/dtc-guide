---
editorial: true
title: The Skeleton Frame
subtitle: Semantic HTML and How the Web Works
hook: "Everything you have built so far is a black screen and white text. Today the work becomes something a person can see. A web page is a file a server sends because a browser asked, and HTML is the language that file is written in: a skeleton of named regions, not a programming language, and not a pile of boxes."
read: 60
artifact: "A repository called html-css-foundations with seven real pages: index.html, the adventure log; elements.html, every text element you will use this unit; form-demo.html, a contact form whose labels focus their fields; blog-post.html and registration.html; guild.html, the Adventurer's Guild board, with quests, a members list, a join form and a table; and about-me.html, the plain page the next session dresses, committed and pushed"
diagrams:
  - fig1-request-cycle
  - fig2-document-anatomy
  - fig3-semantic-skeleton
  - fig4-element-shapes
  - fig5-form-wiring
docs:
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/form
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Solve_HTML_problems
  - https://html.spec.whatwg.org/multipage/
  - https://validator.w3.org/
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics
say:
  - "a page is a response: the browser asks, a server sends a file, the browser builds a tree and paints it"
  - "HTML is markup, not a programming language: it names structure, it does not decide anything"
  - "head is for the browser and header is for the reader; a page has exactly one main"
  - "use the element that names the content; div and span are what you use when nothing semantic fits"
  - "a label's for and an input's id are the same string, or the form fails the people who need it most"
---

## The hook

You survived the terminal. You can talk to your machine, move through the filesystem, and push a repository to GitHub. You are no longer a stranger here. But everything you have built so far lives on a black screen: a journal, a quest log, a dotfiles repo. Functional, and invisible. Nobody scrolling past can see it, and nothing about it looks like the web you actually use.

> *The skeleton had been in the ground a long time before anyone hung a lantern on it. Ribs, spine, a skull with the jaw still hinged. The adventurer stood over it and understood, for the first time, that a body is not the clothes. The clothes come later. First there is a frame that says where the head goes, where the hands go, and which way is up. Get the frame wrong and no amount of armor hides it.*

This unit is the visual layer, the part of the web people see, read, and touch. Every site you have ever used is two technologies at its core. **HTML** is the skeleton: the structure and the words. **CSS**, next session, is everything hung on that skeleton, the skin and the armor and the glow. By the end of the unit you will have built a personal landing page and put it on the internet, where anyone can open it. Today is only the skeleton, and the skeleton is the part people skip, and the part that makes the rest of the unit easy or miserable.

The agenda is concrete. You will learn what actually happens when you type an address and press Enter, because a page is not a place, it is a file sent in answer to a question. You will learn the document every page in the world starts with, and type it until you do not need the editor to invent it for you. You will learn semantic elements, the ones whose names say what a region *is*, and why a page made entirely of `div` is a page that cannot be read by anyone who cannot see it. You will write a real page, then a reference page of every text element you will need, then a form whose labels, types and required fields behave. And you will build a guild board of your own and push it, the same way you pushed the dotfiles.

The stages on this page are the browser. Each one is the markup, mounted as a real document, and the script under it does not decorate anything. It walks the tree the browser built and prints it, which is the whole lesson: you write text, the browser builds a tree, and the tree is what every later tool, including CSS and JavaScript, actually works on.

## The idea

### A page is a response

When you type `https://adventurer.dev/index.html` and press Enter, a sequence of small, ordinary things happens, fast enough that it feels like one. None of them is magic, and all of them have names.

The part before the first slash is a **host name**, a word. Computers do not visit words; they visit numeric addresses. So the first move is a lookup. Your browser asks a **resolver** (your machine's, then usually your provider's or a public one) for the address of that name. The resolver may already know. If it does not, it walks a chain: the root of the naming system, then the registry for `.dev`, then the server that is authoritative for `adventurer.dev`, which answers with an IP address and a number of seconds that answer may be cached. That system is **DNS**, and it is the reason a name you typed becomes a machine somewhere. You do not operate it today. You only need to know it is step two, and that a "server not found" message failed here, before any page was involved.

Then the browser opens a connection to that address and speaks **HTTP**, the HyperText Transfer Protocol, which is a plain-text conversation with a strict shape. The browser sends a **request**: a method, almost always `GET` when you are just looking; a path, `/index.html`; the host; and a handful of headers, including which languages you read and which formats you accept. The **server**, a program on that machine whose job is to answer these, sends a **response**: a status code, headers of its own, and a body. `200` means here it is. `404` means there is no such file. `301` means it moved and here is the new address. The body, for a page, is an HTML file. Nothing has been drawn yet. Drawing is the browser's job, and it happens after the file arrives: the browser reads the file into a tree, notices the stylesheet and the images and the scripts the file points at, fetches each of those with its own request, and only then paints.

![](diagram:session-2-1/fig1-request-cycle)

Hold Fig 1 against the restaurant story and then throw the story away. You are the client, the browser. The server is the kitchen. The request is the order, the response is the plate. The metaphor is fine for one sitting and useless after that, because a real page is ten requests, not one: the HTML, then everything the HTML names. When a page feels slow, it is usually those follow-up requests, or the lookup, not the HTML itself. And the thing you are about to learn to write is exactly the body of response number one. Everything else this unit is about is a file that first response points at.

Two words that fall out of this, which you will use for the rest of the path. A **URL** is the whole address: scheme (`https`), host, path, and sometimes a query string after a `?`. A **client** is whoever asked. The server does not know or care that a human is sitting there. It answered a request.

### The document

Every HTML file on the web is the same shape. Not approximately. The same, and short enough to memorise.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
```

![](diagram:session-2-1/fig2-document-anatomy)

Line by line, because you are going to type this by hand today and the editor's shortcut is a trap until you can.

`<!DOCTYPE html>` is not an element. It is a declaration, and it is line one with no exceptions. It tells the browser to use the modern rules. Leave it out and the browser falls back to compatibility behaviour from twenty years ago, and your page will do strange things you will blame on CSS.

`<html lang="en">` is the root. Everything else is inside it, and the `lang` attribute is the language of the page. A screen reader chooses a voice from it. A search engine reads it. Set it to the language you actually wrote, and change it when you change languages.

`<head>` is for the browser. The reader never sees it. Inside it, today, three things. `<title>` is the name of the tab and the name a search result shows; write it as if it is the only thing someone reads, because often it is. `<meta charset="UTF-8">` says the file is Unicode, so a name with an accent or a CJK character survives. `<meta name="viewport" content="width=device-width, initial-scale=1.0">` tells a phone to lay the page out at the phone's width instead of pretending to be a desktop and shrinking. You will care about this deeply in Session 2.3. Put it in every file from now, including the ones that are not pretty yet.

`<body>` is for the reader. If it can be seen, it goes here. This is the entire rule, and it is the one people break by confusing two words. **`head` is metadata. `header` is a visible region at the top of the page.** They are different elements, in different places, for different audiences. You will write both today, and you will keep them straight because Fig 2 drew them in different colours.

The editor will offer to type all of this for you: in VS Code, `!` and then Tab. Use that from tomorrow. Today, type it, so that when the shortcut inserts something you did not expect, you can see which line is wrong.

### Naming the regions

HTML is a **markup language**. Markup means the text of the document plus marks that say what each part is. It has no variables, no loops, no conditions, no memory. It cannot decide anything. That is not a shortcoming you will grow out of; it is the division of labour. HTML says what the content is. CSS, next session, says how it looks. JavaScript, Unit 3, says what it does. People who call HTML a programming language are usually about to be confused that it will not compute, and people who apologise for it not being one are about to hide their structure in a pile of anonymous boxes.

An element is written with an opening tag, the content, and a closing tag: `<p>Hello.</p>`. The closing tag repeats the name with a slash. Some elements hold nothing, so they have no closing tag and no interior: `<img>`, `<br>`, `<hr>`, `<input>`, `<meta>`, `<link>`. Those are **void** elements. Writing `</img>` does not make you careful. It makes the parser do extra work to throw your close tag away. Attributes sit on the opening tag only, as `name="value"`: `<a href="https://developer.mozilla.org">MDN</a>`. The `href` is where the link goes. The words between the tags are what a person clicks, and they must say where it goes, because "click here" says nothing to someone who is hearing the links read out as a list.

Elements nest, and they nest into a tree. A heading contains text. A list contains list items. A list item contains text, or another list. The browser's whole model of your page is that tree, and CSS and JavaScript both speak it. When you picture a page, picture the tree, not the pixels. The pixels are a decision the browser makes later, from the tree plus a stylesheet.

Now the part that separates a page someone can maintain from a page that merely appears. **Semantic** elements name what the content is. A `header` is the introductory region. A `nav` is the navigation. A `main` is the reason the page exists, and there is exactly one of them. A `section` is a thematic group, and it has a heading. An `article` is a piece that would still make sense copied out and read alone: a post, a quest, a comment. An `aside` is related but not required. A `footer` closes the page or the article. None of these says anything about colour or position. A `footer` can be styled to sit anywhere. The name is the job, not the coordinates.

![](diagram:session-2-1/fig3-semantic-skeleton)

The left side of Fig 3 is what you get from the advice "just use divs and classes". It renders. It can be made beautiful. And it is illegible to everything that is not a sighted person looking at the painted result. A screen reader builds its shortcuts from the element names: jump to navigation, jump to main, list the headings. `div class="nav"` does not appear in that machinery, because a class is a hook for your stylesheet, not a meaning. Search engines weight a page they can section over a page they have to guess about. And you, reading your own file in March, will not remember what `div.box` was. The right side is the same page with the names telling the truth. It is not more work. It is the same work, done with the correct words.

The rule you apply while writing, every time: is there an element whose name is what this region is? Use it. Reach for `div` only when the answer is no, a wrapper a stylesheet needs and no reader ever perceives. Reach for `span` on the same terms, for a run of text inside a line. Those two are real and necessary. They are not the default.

> **Note:** Three sentences to retire before you type anything. *HTML is a programming language*: it is markup, it describes, it does not run. *Use a div for everything and put the meaning in the class*: the class is invisible to the tools a reader depends on; the element name is not. *The head and the header are the same thing*: the head is the browser's metadata and is never painted, the header is a visible region, and you will write both in the next ten minutes.

## The demonstration

Three walkthrough stages, one per file: `index.html`, `elements.html`, `form-demo.html`. Each stage is the body of the file, rendered, and the script under it prints the tree. The files themselves are the blocks above each stage: those are what you save, complete with the doctype and the head. The stages omit one thing on purpose. This lesson page already has its single `h1`, so where your file says `h1` the stage says `h2`. On your machine, the page title is `h1`. That is the only difference, and the scripts say so when they run.

Before the first file, the four shapes in Fig 4, because every line you are about to type is one of them.

![](diagram:session-2-1/fig4-element-shapes)

A pair, a void element, or an opening tag carrying attributes. Plus the outline rule, which Fig 4 puts under them because it is the rule people violate while thinking about font sizes. You have one `h1`, the page. Sections are `h2`. Things inside a section are `h3`. You do not skip from `h2` to `h4` because you wanted the `h3` size to be smaller; size is the stylesheet's decision, and it is the entire subject of the next session. Today the level means the depth, and the browser's default sizes are good enough to see the depth while you work.

Before the first file, the place it lives. Nothing earlier on the path made this folder, so make it now, in the terminal, the way Session 1.4 made `quest-log`. Every project from here on sits under `~/projects`, one repository per folder, never one inside another.

```bash
mkdir -p ~/projects
cd ~/projects
mkdir html-css-foundations
cd html-css-foundations
git init
gh repo create html-css-foundations --public --source=. --remote=origin
```

`git init` prints `Initialized empty Git repository in /home/you/projects/html-css-foundations/.git/`, and `gh repo create` answers with two ticks: `Created repository YOU/html-css-foundations on GitHub` and `Added remote git@github.com:YOU/html-css-foundations.git`. There is nothing to push yet; the first push comes at the end of Your turn, and because the repository is new it is `git push -u origin main` once, and a bare `git push` after that. Open the folder in VS Code with `code .`.

One tool to install, and this is the session that installs it. Open the Extensions panel in VS Code (Ctrl+Shift+X, or Cmd+Shift+X on a Mac), search for **Live Server**, pick the one whose identifier is `ritwickdey.LiveServer`, and press Install. It serves whichever folder is open at `http://127.0.0.1:5500/` and reloads the browser every time you save, which is how you will watch every page in this unit.

**Walkthrough 1: the adventure log.** In `html-css-foundations`, create `index.html` and type this. Do not paste it over a file the editor generated until you have typed the boilerplate once yourself.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Arthur's Adventure Log</title>
</head>
<body>
    <header>
        <h1>Arthur's Adventure Log</h1>
        <nav>
            <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#quests">Quests</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="about">
            <h2>About Me</h2>
            <p>I am a developer in training. I woke up in a terminal and decided to build things.</p>
            <img src="portrait.png" alt="A portrait of the adventurer, standing in for a photo still to be taken">
        </section>

        <section id="quests">
            <h2>Current Quests</h2>
            <article>
                <h3>Learn HTML</h3>
                <p>Master the skeleton of every web page. Status: <strong>In Progress</strong></p>
            </article>
            <article>
                <h3>Learn CSS</h3>
                <p>Make things look good. Status: <em>Coming Soon</em></p>
            </article>
        </section>

        <section id="contact">
            <h2>Contact the Adventurer</h2>
            <p>The form arrives later in this session. This section is the place it will land.</p>
        </section>
    </main>

    <footer>
        <p>Built by Arthur the Adventurer in 2026. Currently leveling up.</p>
    </footer>
</body>
</html>
```

Read the tree before you read the pixels. `header` holds the name and the `nav`. The navigation is a list, because it is a list: three places to go, in an order. Each link's `href` is `#about`, `#quests`, `#contact`, and each section has the matching `id`. That is an anchor. Clicking it scrolls to the element with that id, on the same page, with no request at all. `main` wraps the three sections and nothing else; the header and the footer are outside it, because they are not the unique content of this page. Each quest is an `article` with an `h3`, one level under the section's `h2`. `<strong>` is importance, and a screen reader can emphasise it. `<b>` is only a visual bold, with no importance attached, and you will almost never want it. `<em>` is stress, the word you would say louder. `<i>` is only italic, for a taxonomical name or a thought, and it is not emphasis.

The image is the one line people ship wrong. `src` is the address of the file, relative to this HTML file, so `portrait.png` means "the png sitting next to index.html". `alt` is the text that stands in for the image when it cannot be seen: a reader with images off, a screen reader, a failed request. It describes the picture, it does not repeat the caption, and it is empty (`alt=""`) only when the image carries no information at all, a decoration. An image with no `alt` attribute at all is unfinished. On your machine, use a real file: copy any image you own into the folder and name it `portrait.png`, or change `src` to the name of the file you have. If you have no picture you want to use yet, make one: any image editor, a canvas of about 320 by 160, filled with one solid colour, saved as `portrait.png`. A placeholder you made is a real file, it loads, and it is yours to replace later. The stage cannot request one from another site, so it carries a small drawing inside the address itself, which is a fine trick and not how you will normally do it.

```html stage=adventure-log
<header>
    <h2>Arthur's Adventure Log</h2>
    <nav>
        <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#quests">Quests</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>
</header>
<main>
    <section id="about">
        <h2>About Me</h2>
        <p>I am a developer in training. I woke up in a terminal and decided to build things.</p>
        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='160'%3E%3Crect width='320' height='160' fill='%2316161A'/%3E%3Crect x='8' y='8' width='304' height='144' fill='none' stroke='%2300A868' stroke-width='3'/%3E%3Ctext x='160' y='88' fill='%23E8D800' font-size='18' text-anchor='middle' font-family='sans-serif'%3Eportrait%3C/text%3E%3C/svg%3E" alt="A portrait of the adventurer, standing in for a photo still to be taken">
    </section>
    <section id="quests">
        <h2>Current Quests</h2>
        <article>
            <h3>Learn HTML</h3>
            <p>Master the skeleton of every web page. Status: <strong>In Progress</strong></p>
        </article>
        <article>
            <h3>Learn CSS</h3>
            <p>Make things look good. Status: <em>Coming Soon</em></p>
        </article>
    </section>
    <section id="contact">
        <h2>Contact the Adventurer</h2>
        <p>The form arrives later in this session. This section is the place it will land.</p>
    </section>
</main>
<footer>
    <p>Built by Arthur the Adventurer in 2026. Currently leveling up.</p>
</footer>
```

```js live=adventure-log
// Walk the tree the browser built from the markup above. Indentation is depth.
function walk(node, depth, lines) {
  for (const el of node.children) {
    const id = el.id ? "#" + el.id : "";
    lines.push("  ".repeat(depth) + el.tagName.toLowerCase() + id);
    walk(el, depth + 1, lines);
  }
  return lines;
}
const lines = walk(document.body, 0, []);
console.log(lines.join("\n"));
console.log("main elements:", document.querySelectorAll("main").length, "(a page gets exactly one)");
console.log("img alt:", document.querySelector("img").getAttribute("alt"));
console.log("top heading is an h2 here, because this lesson page already has its one h1. In index.html it is an h1.");
console.log("ok: adventure-log");
```

Press **Run live** and read the console against the file. `header`, then `h2`, then `nav`, then a `ul` of three `li`, each holding an `a`. Then `main`, three `section`s, the quests section holding two `article`s. Then `footer`. That printout is the document outline, and it is the same one a screen reader's heading list builds. Count the `main` elements. There is one. Read the alt text, which is present, which is the whole test.

On your machine, save the file and open it. The fastest way, with the Live Server extension you just installed, is to right-click the file and choose **Open with Live Server**. It serves the folder and reloads the browser when you save. Opening the file directly, by double-clicking it, also works for a page with no server logic, and the address will start with `file://`. Either way you should see the heading, the three links, and the links should jump. Then right-click the page and choose **View Page Source**. That is the file the browser received, exactly what you typed. Keep that gesture. Every site you admire is readable this way, and reading real source is how this skeleton stops being theory.

**Walkthrough 2: one of everything.** `elements.html` is your reference sheet. Build it, keep it, and add to it when you meet a new element. The file's head is the boilerplate you now know, with the title `HTML Elements Reference`. The body is this.

```html stage=elements
<main id="top">
    <h2>HTML Elements Showcase</h2>
    <section>
        <h2>Headings</h2>
        <h2>Heading 2, a section</h2>
        <h3>Heading 3, a subsection</h3>
        <h4>Heading 4, only when an h3 needs splitting</h4>
        <h5>Heading 5, rare</h5>
        <h6>Heading 6, the floor</h6>
        <p>Do not skip levels. The size is not yours to pick today.</p>
    </section>
    <section>
        <h2>Text</h2>
        <p>A <strong>paragraph</strong> with <em>emphasized</em> words and <code>code</code> inline.</p>
        <p>A <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements">link to the element reference</a>, in the same tab.</p>
        <blockquote>
            <p>The only way to learn to write a page is to write a page.</p>
        </blockquote>
        <hr>
        <p>The rule above is an hr, a real break between topics.<br>The break before this sentence is a br, and it is rarely the right tool.</p>
    </section>
    <section>
        <h2>Lists</h2>
        <h3>Unordered</h3>
        <ul>
            <li>HTML, structure</li>
            <li>CSS, presentation</li>
            <li>JavaScript, behaviour</li>
        </ul>
        <h3>Ordered</h3>
        <ol>
            <li>Learn HTML first</li>
            <li>Then CSS</li>
            <li>Then JavaScript</li>
        </ol>
        <h3>Nested</h3>
        <ul>
            <li>Frontend
                <ul>
                    <li>HTML</li>
                    <li>CSS</li>
                    <li>JavaScript</li>
                </ul>
            </li>
            <li>Backend
                <ul>
                    <li>A server that answers requests</li>
                    <li>A database</li>
                </ul>
            </li>
        </ul>
    </section>
    <section>
        <h2>Links</h2>
        <p><a href="https://developer.mozilla.org/">Same tab</a></p>
        <p><a href="https://developer.mozilla.org/" target="_blank" rel="noopener noreferrer">New tab, and rel says the new page does not get a handle back to this one</a></p>
        <p><a href="#top">An anchor, to an id on this page</a></p>
        <p><a href="mailto:hello@example.com">An email link</a></p>
    </section>
    <section>
        <h2>A figure</h2>
        <figure>
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='120'%3E%3Crect width='320' height='120' fill='%2316161A'/%3E%3Crect x='8' y='8' width='304' height='104' fill='none' stroke='%23E8D800' stroke-width='3'/%3E%3Ctext x='160' y='68' fill='%23F5F2EE' font-size='16' text-anchor='middle' font-family='sans-serif'%3Ea figure%3C/text%3E%3C/svg%3E" alt="A yellow frame standing in for a diagram">
            <figcaption>A figure is the image plus its caption, so they stay together when the page reflows.</figcaption>
        </figure>
    </section>
    <section>
        <h2>A table</h2>
        <table>
            <caption>Quest rewards</caption>
            <thead>
                <tr><th>Quest</th><th>Difficulty</th><th>Reward</th></tr>
            </thead>
            <tbody>
                <tr><td>Learn HTML</td><td>Apprentice</td><td>A page that reads itself</td></tr>
                <tr><td>Learn CSS</td><td>Journeyman</td><td>A page that looks meant</td></tr>
            </tbody>
        </table>
    </section>
    <section>
        <h2>A disclosure</h2>
        <details>
            <summary>What is a void element?</summary>
            <p>One that holds nothing, so it has no closing tag: img, br, hr, input, meta, link.</p>
        </details>
    </section>
</main>
```

```js live=elements
const headings = document.querySelectorAll("h2, h3, h4, h5, h6");
headings.forEach((h) => console.log(h.tagName.toLowerCase() + "  " + h.textContent.trim()));
console.log("list items:", document.querySelectorAll("li").length);
console.log("links:", document.querySelectorAll("a").length);
document.querySelectorAll("img").forEach((img) => console.log("alt:", img.getAttribute("alt")));
console.log("rows:", document.querySelectorAll("tbody tr").length);
console.log("ok: elements");
```

Run it and read the heading list straight down. That column is the outline, and any surprise in it is a heading at the wrong level. Then the counts: list items include the nested ones, links include the mailto and the anchor, every image reports an alt, the table reports two body rows.

A few decisions hiding in the markup. The blockquote contains a paragraph, because a quotation is a block of text and a paragraph is how a block of text is marked. The `hr` is a thematic break, a real change of subject, not a line you draw because you wanted a line; a line is CSS. The `br` is a line break inside a phrase, and the moment you want vertical space, you have left its territory. `target="_blank"` opens a new tab, and without `rel="noopener noreferrer"` the new page gets a handle back to yours, which is a small door you have no reason to leave open. The nested list is a `ul` *inside* an `li`, not between them; putting a list between list items is one of the repairs the next section exists to show you. The table has a `caption`, a `thead` of `th` cells, and a `tbody` of `td` cells. Tables are for data with rows and columns. They are not for laying a page out, a job they were abused for, for years, and which flexbox and grid now do honestly. And `details` with `summary` is a disclosure that works with no script at all: click the summary, the rest appears. Use it when the content is genuinely optional.

**Walkthrough 3: the form.** A form is the first HTML that faces the other direction. Everything so far is the server talking to the reader. A form is the reader talking back, and it talks in the shape from Fig 1: pressing the button builds a request, and the `name` of each control becomes a field in it.

![](diagram:session-2-1/fig5-form-wiring)

Save this as `form-demo.html`. The stage under it is the same form, and its script checks the wiring instead of submitting anything.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact the Adventurer</title>
</head>
<body>
    <main>
        <h1>Contact the Adventurer</h1>
        <form action="#" method="get">
            <fieldset>
                <legend>Your information</legend>
                <div>
                    <label for="name">Full name</label>
                    <input type="text" id="name" name="name" placeholder="Arthur" required>
                </div>
                <div>
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="you@example.com" required>
                </div>
                <div>
                    <label for="phone">Phone, optional</label>
                    <input type="tel" id="phone" name="phone">
                </div>
                <div>
                    <label for="website">Website, optional</label>
                    <input type="url" id="website" name="website" placeholder="https://">
                </div>
            </fieldset>
            <fieldset>
                <legend>Your message</legend>
                <div>
                    <label for="subject">Subject</label>
                    <select id="subject" name="subject">
                        <option value="">Choose a subject</option>
                        <option value="collab">Collaboration</option>
                        <option value="feedback">Feedback</option>
                        <option value="hello">Just saying hello</option>
                    </select>
                </div>
                <div>
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                <div>
                    <input type="checkbox" id="newsletter" name="newsletter">
                    <label for="newsletter">Send me the occasional dispatch</label>
                </div>
            </fieldset>
            <button type="submit">Send message</button>
            <button type="reset">Clear form</button>
        </form>
    </main>
</body>
</html>
```

```html stage=contact-form
<h2>Contact the Adventurer</h2>
<form action="#" method="get">
    <fieldset>
        <legend>Your information</legend>
        <div>
            <label for="name">Full name</label>
            <input type="text" id="name" name="name" placeholder="Arthur" required>
        </div>
        <div>
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="you@example.com" required>
        </div>
        <div>
            <label for="phone">Phone, optional</label>
            <input type="tel" id="phone" name="phone">
        </div>
        <div>
            <label for="website">Website, optional</label>
            <input type="url" id="website" name="website" placeholder="https://">
        </div>
    </fieldset>
    <fieldset>
        <legend>Your message</legend>
        <div>
            <label for="subject">Subject</label>
            <select id="subject" name="subject">
                <option value="">Choose a subject</option>
                <option value="collab">Collaboration</option>
                <option value="feedback">Feedback</option>
                <option value="hello">Just saying hello</option>
            </select>
        </div>
        <div>
            <label for="message">Message</label>
            <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        <div>
            <input type="checkbox" id="newsletter" name="newsletter">
            <label for="newsletter">Send me the occasional dispatch</label>
        </div>
    </fieldset>
    <button type="submit">Send message</button>
    <button type="reset">Clear form</button>
</form>
```

```js live=contact-form
document.querySelectorAll("label[for]").forEach((label) => {
  const id = label.getAttribute("for");
  const field = document.getElementById(id);
  const kind = field ? field.tagName.toLowerCase() + (field.getAttribute("type") ? "[type=" + field.getAttribute("type") + "]" : "") : "NOTHING";
  console.log(JSON.stringify(label.textContent.trim()) + "  for=" + id + "  →  " + kind);
});
console.log("required:", document.querySelectorAll("[required]").length);
console.log("groups:", document.querySelectorAll("fieldset").length);
console.log("ok: contact-form");
```

Run it. Seven labels, seven matches, none of them `NOTHING`. Three required controls. Two groups. Then use the form with your hands. Click the words "Full name", not the box: the cursor lands in the box, because `for` and `id` agree. Press **Send message** with the name empty. The browser refuses, in its own words, and the request is never sent. That message is not yours to write and not yours to style today. Fill it badly, an email with no `@`, and it refuses again, because `type="email"` is a check as well as a keyboard. Fill it properly and press send. On your own file the address bar becomes the request: `form-demo.html?name=Arthur&email=you%40example.com&...`, each `name` attribute turned into a field. On this lesson page the reload is stopped, and the panel tells you it was stopped, because navigating away would throw the lesson out. The `method` here is `get` so you can see that query string. A form that creates or changes something uses `post`, and the place it sends to is a server you have not built yet. The `action` is that place. `#` means "right here", which is the right target for a form whose only job today is to prove the wiring.

The rest of the vocabulary, once, so it is in your hands. `placeholder` is a hint that disappears as soon as someone types, so it is not a label; a label stays. `fieldset` and `legend` group controls and give the group a name, which a screen reader announces on entry. `select` and `option` are the dropdown, and the `value` of an option is what gets sent, which can differ from the words shown. `textarea` is many lines. `type="checkbox"` is on or off, and its text is a label *after* it, wired the same way. `type="radio"` is a choice of one within a group, and the group is every radio that shares a `name`. `type="reset"` restores the form to how it was when the page loaded, and it is the button you put second, in a quieter colour, once you have colours. `required` is the attribute that arms the browser's refusal. The `div` around each pair is the case div is for: a hook so the label and the control can stack, with no meaning of its own.

> **Tip:** The test for a form takes ten seconds and requires no tool. Click every label. Each one should land the cursor in exactly one control. Any label that does nothing has a `for` and an `id` that are not the same string, including a difference of one capital letter, which counts.

## Where it breaks

HTML is famously forgiving, and the forgiveness is the bug. When you write something the grammar does not allow, the browser does not show an error. It repairs the file into some tree and paints that, and the tree it chose may not be the tree you think you have. CSS will then style the repaired tree, and you will spend an hour wondering why a rule does not apply to an element that, in your file, is clearly inside the element you targeted. It is not inside it. The repair moved it.

This stage is four mistakes at once. Run it and read what the browser actually built before you read the explanation.

```html stage=broken
<p>This paragraph tries to hold a <div>block</div> and then more text.</p>
<ul>
    <li>First item
    <li>Second item, never closed
</ul>
<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='48'%3E%3Crect width='120' height='48' fill='%23F03038'/%3E%3C/svg%3E" alt="">
<label for="hero">Hero name</label>
<input id="her0" type="text" value="the id says her0">
```

```js live=broken
const block = document.querySelector("div");
console.log("the div's parent is the stage, not the paragraph:", block.parentElement === document.body);
console.log("the paragraph's text is:", JSON.stringify(document.querySelector("p").textContent));
console.log("paragraphs in the tree now, one of them empty, left behind by the stray close tag:", document.querySelectorAll("p").length);
console.log("list items the browser closed for you:", document.querySelectorAll("li").length);
console.log("img alt:", JSON.stringify(document.querySelector("img").getAttribute("alt")), "(empty claims the image is decorative; this red block is not)");
const label = document.querySelector("label");
console.log("label for=" + label.getAttribute("for") + " matches:", document.getElementById(label.getAttribute("for")));
console.log("ok: broken");
```

**A paragraph cannot contain a div.** The first line prints `true`: the div's parent is the stage, not the paragraph. The paragraph's text stops at "hold a ". The parser saw a `div` begin while a `p` was open, closed the `p` on the spot, and let the div and the trailing words be siblings of it. Your closing `</p>` then matched nothing useful and left an empty paragraph behind, which is why the paragraph count is 2. The indentation in your file is a story you told yourself. The tree is the other story, and the tree wins. The same thing happens, quieter, with a list: a `ul` placed between two `li` elements gets moved, and your nested list is not nested. Put the inner list *inside* the item, as the elements stage does.

**Unclosed list items** are the gentle case. The browser closed both, and the count is 2. It works. Close them anyway. The repair is only reliable for the cases the grammar explicitly allows, and leaning on it means the next mistake, the one it does not allow, hides in the noise.

**An image whose alt tells a lie.** The printout is `""`. An empty alt means "this image is decoration, skip it." The red block is not decoration; it stands in for a diagram, and a screen reader will now skip it entirely. That is the finished-looking version of the bug. The unfinished version is no `alt` attribute at all, and `getAttribute("alt")` then prints `null` rather than `""`: null means you forgot, empty means you decided. The painted result looks identical either way, and a screen reader has to guess, usually by reading the file name, which is worse than silence. Write the description, or write `alt=""` on purpose. Do not leave the decision to the file name.

**A label wired to nothing.** `for="hero"` and `id="her0"` differ by a letter that looks like a letter. The match prints `null`. Clicking that label focuses nothing. This is the single most common form bug, and it is invisible if you only ever click the inputs themselves, which is why the test is to click the labels.

Four more that this box cannot perform, because they are habits rather than parses. **Skipping heading levels**, `h1` then `h3` then `h5`, because the defaults looked too big. The outline grows a hole, and next session you will set the size you actually want on the correct level. **More than one `h1`**, usually a logo and a title both claiming to be the page. One page, one `h1`. The logo can be a `p` inside the `header`, or the `h1` can be the logo on the home page and the title everywhere else; pick one rule and keep it. **Placeholder as label**, so the field becomes a blank rectangle the moment someone types, and they cannot check what it was asking. The label is the label. **Div soup written on purpose**, with a plan to "add the real elements later". Later does not come. The semantic elements are not a polish step. They are the writing.

When a page misbehaves, look at the tree you have rather than the text you typed. View Page Source shows the file. **Inspect**, from the same right-click, shows the tree, after repair, and it is the tree your CSS will see. When you want a verdict rather than a guess, paste the file into the [W3C validator](https://validator.w3.org/). It reports the repairs as errors, which the browser never will.

## Your turn

Work in `~/projects/html-css-foundations`, the repository you made before Walkthrough 1. Live Server on, browser next to the editor, and save constantly. The stages above are the reference; these files are yours.

**Exercise 1: a blog post (20 minutes).** Create `blog-post.html`. It needs a `header` with the site name as the `h1` and a `nav` of at least three links, built as a list. A `main` containing one `article`. Inside the article: an `h2` title, a paragraph naming the author and the date, at least two paragraphs of real content, an image with an `alt` that describes it, and a list. An `aside` with an `h2` of "Related posts" and a list of three links. A `footer` with a copyright line. Use the boilerplate from Fig 2, including the viewport. Checkpoint: open View Page Source and point at each of those elements out loud. If you cannot find one, it is not there, whatever the painted page suggests.

**Exercise 2: a registration form (20 minutes).** Create `registration.html` with an `h1` of "Create your account" and a form, `method="get"` so you can see it work. Three groups, each a `fieldset` with a `legend`. Personal information: first name, last name, and a `type="date"` for the date of birth. Account: `type="email"` and `type="password"`. Additional: a `select` labelled "How did you hear about us?" with at least three options, and a checkbox for agreeing to the terms. Every control has a `label`, and clicking the label focuses the control. The names, the email, the password and the checkbox are `required`. Submit empty and read the browser's refusal. Submit filled and read the query string. The password will be visible in that query string, which is precisely why a real registration uses `post` and a server, and why you never put a secret in a `get` form outside a lesson.

**The guild board (the rest of the session).** `guild.html`, from scratch, no starter. This is the page you will be proud of, and it is allowed to be funny. The requirements:

1. The boilerplate, with a title that is the guild's name.
2. A `header` with the guild name as the `h1` and a `nav` of at least four links, as a list, pointing at sections on the page.
3. A `main` with at least three `section`s, each with a heading.
4. Available quests: at least three `article`s. Each has a title, a difficulty, a reward, and a description of a sentence or two.
5. Guild members: a list of at least five, each with a name and a role.
6. Join the guild: a form with name, email, a `select` for the role, radio buttons for experience (one `name` shared by all of them, so only one can be chosen), a `textarea` for a short bio, and a submit button. Labels wired. Required where it matters.
7. At least two images, each with an `alt` that describes that image and not the other one.
8. An `aside` with one announcement or one piece of advice.
9. A `footer` with a copyright and at least two links.
10. One `table`, used for data. A rewards table earns its place:

```html
<table>
    <caption>Posted rewards</caption>
    <thead>
        <tr><th>Quest</th><th>Difficulty</th><th>Reward</th><th>Status</th></tr>
    </thead>
    <tbody>
        <tr><td>Map the catacombs</td><td>Apprentice</td><td>40 coins</td><td>Open</td></tr>
        <tr><td>Escort the archivist</td><td>Journeyman</td><td>120 coins</td><td>Open</td></tr>
    </tbody>
</table>
```

Hints, if you stall. Emmet, which you have now earned: type `section>h2+p` and press Tab, and type `ul>li*5` and press Tab. Look at the elements stage whenever you are unsure of a shape. Validate at [validator.w3.org](https://validator.w3.org/) once, and fix what it names. Stretch goals, in order: a second page, `quests.html`, linked from the nav; a `details` element hiding a quest's full write-up behind its summary; the table filled with your real quests rather than mine.

When it holds together, ship it the way Session 1.4 taught you.

```bash
git add .
git status
git commit -m "Add the guild board and the session 2.1 pages"
git push -u origin main
```

`git status` before the commit, always, so you see the files you are about to save and not a stray portrait you did not mean to include. The message says what the save adds. The `-u origin main` is for this first push only, because the repository is new and Git does not yet know where `main` goes; Git answers `* [new branch] main -> main`, and from then on a bare `git push` is enough.

## The quest

Before Session 2.2, have all of this pushed to `html-css-foundations`:

- `index.html`, the adventure log, with the three sections and a portrait whose `alt` describes it.
- `elements.html`, your reference, committed so you can diff it later when you add to it.
- `blog-post.html` and `registration.html`, meeting the checkpoints, including a query string you have actually seen in the address bar.
- `guild.html`, meeting all ten requirements, validated, with the table and the form working.
- `about-me.html`, the page the next session dresses: a header with your name, a nav of placeholder links, a section of at least two paragraphs about you, a section listing five skills or interests as a list, one image, a footer. Semantic elements throughout. No CSS yet. The plainness is the point. You are about to learn exactly how much of what you see on the web is not HTML.

Budget two to three hours if the guild board did not get finished in the sitting. Push before you stop, so the work is not living on one machine again.

## Side quests

Three pages in the library look further down roads you walked today. They are written for later units, so read the opening and the first picture, not the code.

## Before next session

Read the [CSS first steps guide](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics) once, slowly, twenty minutes. You are not learning CSS from it. You are arriving next session already knowing that a stylesheet is a separate file, that it selects elements and sets properties, and that the same HTML can wear completely different presentations. That last fact is why today was worth it. If the skeleton is right, the armor bolts on. If the skeleton is divs, the armor has nothing honest to attach to.

Spend ten minutes on a site you respect. Right-click, View Page Source, and find the `header`, the `nav`, the `main`. Then Inspect, and watch the tree. You will see semantic elements doing the jobs you used today, and you will see divs, and with a little practice you can tell which divs are earning their place.

Check that Live Server still opens a page when you right-click it; if the extension did not stick, install it again from the Extensions panel. And type the boilerplate from memory, once, into an empty file, before you open the next session. If you stall, it is Fig 2, and it is short.

Next time: Armor and Cosmetics. Selectors, the cascade, specificity, the box model, colour and type. The guild board is going to look like you meant it. Keep the HTML as it is; next session restyles it without changing the structure. The structure is done.

> **Say:** "A page is a response: the browser asks, a server sends a file, the browser builds a tree and paints it. HTML is markup, not a programming language: it names structure, it does not decide anything. Head is for the browser and header is for the reader; a page has exactly one main. Use the element that names the content; div and span are what you use when nothing semantic fits. A label's for and an input's id are the same string, or the form fails the people who need it most."

The frame is up. It does not gleam yet. It does not need to. You can see where the head goes, where the hands go, and which way is up, and so can anyone who reads the file, including the people who will never see the paint.
