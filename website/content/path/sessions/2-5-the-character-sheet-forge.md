---
editorial: true
title: The Character Sheet Forge
subtitle: Build and Deploy Your Landing Page
hook: "A responsive personal landing page, deployment URL, and accessibility review. Name the visitor and the action they should take."
read: 60
artifact: "A responsive personal landing page, deployment URL, and accessibility review"
diagrams:
  - fig1-model
  - fig2-diagnosis
  - fig3-evidence
docs:
  - https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
say:
  - "Content: Name the visitor and the action they should take."
  - "Layout: Use semantic sections and fluid components."
  - "Release: Publish and check the deployed URL on a phone."
---

## The hook

This is it. Everything you have learned in this unit comes together today. HTML structure from Session 2.1. CSS styling from 2.2. Layout with Flexbox and Grid from 2.3. Animations and BEM from 2.4. Today, you build a real thing. A personal landing page. Your page. Not a tutorial follow-along. Not a copy of someone else's design. Yours.

A landing page is the single most important page on any website. It is the first thing people see. It has one job: make the visitor care enough to keep going. In the professional world, landing pages convert visitors into customers, subscribers, users. For you, right now, this page introduces you to the world. Who you are, what you can do, how to reach you. And by the end of today, it will be live on the internet at a real URL that you can share with anyone.

We are going to walk through landing page design principles, build the structure together, then you will take over and make it your own. We will also cover deployment to GitHub Pages, accessibility checks, and performance basics. After today, you will have shipped a real product. Not a homework assignment. A product. Let us forge your character sheet.

### What the Run button does

The Run button on this page runs a small model in your browser. It does not install a language, open a database, start a server, charge a card, call an AI provider, or move money. The longer walkthroughs are files and commands for a project on your own machine. Install those tools yourself from the official docs linked on this page, keep secrets in your own environment, and use made-up data in the exercises.

A green checkpoint means this page's model behaved the way the checkpoint claims. It does not mean a service you have not started is working. If a tool is missing, keep designing, write down the result you expect, and mark that check as not run. A screenshot of a result you did not produce is not a result.

## The idea

### Create and Deploy a Professional Landing Page
You will design, build, and deploy a complete personal landing page that demonstrates HTML structure, CSS styling, responsive layout, and visual polish.

**You will:**
- Plan a landing page structure using wireframing and content hierarchy
- Build a multi-section landing page with semantic HTML and styled CSS
- Deploy a static website to GitHub Pages from a repository
- Validate accessibility and performance using browser tools and checklists

**You will be able to:**
- sketch a wireframe and translate it into semantic HTML sections
- build a complete landing page with hero, features, about, contact, and footer sections
- deploy a live website to GitHub Pages and verify it loads at the public URL
- run accessibility checks (alt text, color contrast, semantic structure) and fix identified issues

---

- **Concept 1: Landing Page Design Principles**

  A strong landing page follows a proven structure. You do not need to reinvent the wheel:

  1. **Hero Section** - The first thing visitors see. Big headline, supporting text, call-to-action button. Full viewport height or close to it. This section has 3-5 seconds to grab attention.
  2. **Features/Skills Section** - What do you offer? What can you do? Show 3-6 key items in a grid or card layout. Icons or images help.
  3. **About Section** - Personal context. A photo, a short bio, your story. People connect with people, not just skills.
  4. **Social Proof/Projects Section** - Evidence. Portfolio pieces, testimonials, logos, numbers. "Do not tell me you are good. Show me."
  5. **Contact/CTA Section** - How to reach you. A form, email link, social media links. Make it easy.
  6. **Footer** - Copyright, secondary links, social icons.

  **Design principles:**
  - Visual hierarchy: Most important content is biggest and highest on the page
  - Whitespace: Do not cram elements together. Spacing creates breathability and focus
  - Consistency: Use the same fonts, colors, and spacing patterns throughout
  - One primary CTA: Do not give visitors 10 things to click. Guide them to one action
  - Contrast: Important elements (buttons, headings) must stand out from their surroundings

- **Concept 2: GitHub Pages Deployment**

  GitHub Pages is a free hosting service that takes HTML, CSS, and JavaScript files from a GitHub repository and serves them as a live website.

  **How it works:**
  1. You push your code to a GitHub repository
  2. You enable GitHub Pages in the repository settings
  3. GitHub serves your files at `https://yourusername.github.io/repository-name/`

  **Steps to deploy:**
  ```bash
  # 1. Make sure your main HTML file is named index.html
  # 2. Push your code to GitHub
  git add .
  git commit -m "Ready for deployment"
  git push origin main

  # 3. Go to your repository on GitHub
  # 4. Click Settings > Pages
  # 5. Under "Source", select "Deploy from a branch"
  # 6. Select "main" branch and "/ (root)" folder
  # 7. Click Save
  # 8. Wait 1-2 minutes, then visit https://yourusername.github.io/repo-name/
  ```

  **Important:** The entry file MUST be named `index.html` and be in the root of your repository (or the folder you specify). GitHub Pages looks for `index.html` by default.

- **Concept 3: Accessibility Fundamentals**

  Accessibility (a11y) means making your website usable by everyone, including people who use screen readers, keyboard-only navigation, or have visual impairments.

  **Essential accessibility practices:**

  - **Semantic HTML:** Use `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`. Screen readers use these to navigate.
  - **Alt text on images:** Every `<img>` needs a descriptive `alt` attribute. Decorative images get `alt=""`.
  - **Color contrast:** Text must have sufficient contrast against its background. WCAG AA requires a ratio of at least 4.5:1 for normal text. Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify.
  - **Keyboard navigation:** Users must be able to Tab through all interactive elements (links, buttons, form fields). Never remove the `:focus` outline without replacing it with a visible alternative.
  - **ARIA labels:** When visual context is not enough, add `aria-label` attributes to describe elements for screen readers.

  ```html
  <!-- Good: Descriptive alt text -->
  <img src="profile.jpg" alt="Arthur standing at a whiteboard teaching a coding class">

  <!-- Good: ARIA label on an icon-only button -->
  <button aria-label="Open menu">
      <span class="icon-hamburger"></span>
  </button>

  <!-- Good: Skip to main content link for keyboard users -->
  <a href="#main-content" class="skip-link">Skip to main content</a>
  ```

  ```css
  /* Visible focus styles (never just remove outline) */
  a:focus,
  button:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
  }

  /* Skip link - hidden until focused */
  .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--color-primary);
      color: white;
      padding: 0.5rem 1rem;
      z-index: 100;
      transition: top 0.3s;
  }

  .skip-link:focus {
      top: 0;
  }
  ```

- **Concept 4: Performance Basics**

  Page speed matters. Users leave if a page takes more than 3 seconds to load.

  **Image optimization:**
  - Use [Squoosh](https://squoosh.app/) to compress images before adding them to your project
  - Use appropriate formats: JPEG for photos, PNG for graphics with transparency, WebP for both (modern browsers)
  - Set explicit `width` and `height` attributes on `<img>` to prevent layout shift
  - Use `loading="lazy"` on images below the fold

  ```html
  <img src="project.webp"
       alt="Screenshot of my project"
       width="800"
       height="450"
       loading="lazy">
  ```

  **CSS performance:**
  - Put critical CSS (above-the-fold styles) first in your stylesheet
  - Minimize unused CSS
  - Avoid `@import` in CSS (use `<link>` tags instead, they load in parallel)

  **Testing performance:**
  - Open Chrome DevTools > Lighthouse tab
  - Run a Lighthouse audit for Performance, Accessibility, Best Practices, and SEO
  - Aim for 90+ on all scores

  **Common Misconceptions:**

  | Wrong | Correct |
  |-------|---------|
  | "Accessibility is only for blind users" | Accessibility benefits keyboard users, motor-impaired users, colorblind users, and even users on slow connections. |
  | "I can deploy any HTML file to GitHub Pages" | The entry file must be named `index.html`. GitHub Pages looks for this by default. |
  | "Performance does not matter for a simple landing page" | Even simple pages can be slow if images are unoptimized. A 5MB photo will make your page crawl on mobile. |
  | "I will add accessibility later" | Build accessibility in from the start. Retrofitting is harder and more expensive. |
  | "A landing page needs lots of content" | Less is more. A focused page with clear hierarchy beats a cluttered one every time. |

![](diagram:session-2-5/fig1-model)

### A portfolio is a small product

A visitor arriving from a link has three questions: who is this person, what can they do, and how do I contact them? Arrange the page around those questions. A dramatic hero that takes an entire phone screen without identifying you makes the visitor work before they have a reason to care. Write the content before adjusting gradients. Your name, a concrete description of your work, one project with evidence, and a contact action form a usable first release. Additional sections earn their place by answering a visitor question.

Choose one primary action. If the goal is a project conversation, label the link with that outcome and point it to a working contact method. A button that says Submit beside no form is decoration. If you use an email link, explain that it opens the visitor's email application. If you build a contact form later, it needs a delivery service, validation, feedback, and privacy decisions. Static hosting alone cannot deliver a message. Do not display a fake success notification that discards what the visitor wrote.

### Design the awkward content first

Test a project title twice as long as the original. Replace your short biography with two paragraphs. Remove a project thumbnail. These changes reveal whether the layout is a reusable system or a screenshot that only works with one set of content. Cards should grow vertically instead of cropping important text. Images need useful alternative text when they carry meaning, and empty alternative text when they merely repeat adjacent text. Reserve their aspect ratio so the page does not jump while they load.

A useful responsive test matrix includes a narrow phone, a medium tablet, a wide desktop, and browser zoom. Check the page with the keyboard before using the mouse: the skip link should appear, navigation should follow a logical order, and every link should have a visible focus indicator. Hover is an enhancement because touch users cannot depend on it. Motion should respect reduced-motion preferences. A layout can look excellent in a screenshot and still fail these basic interactions.

### Prove the deployed version

A project site often lives below a repository prefix. An asset URL beginning with a slash starts at the domain root, which can bypass that prefix. Use appropriate relative paths for a plain static project, or configure the base path when introducing a bundler. File names on a deployed server may be case sensitive even when your local file system is forgiving. Photograph.JPG and photograph.jpg are different paths on many hosts.

After publishing, open the exact public URL in a fresh browser context. Follow every navigation and contact link. Reload a nested URL if your site has one. Inspect the network panel for missing images, fonts, and styles. A local preview is evidence about your working directory; the public check is evidence about what a visitor receives. Record the deployed revision so a later change does not make your review ambiguous.

### Peer review that changes the page

Ask a reviewer to find one project and explain what you contributed. Do not narrate the answer while they look. Record where they hesitate, then separate an observed problem from a suggested solution. “I cannot find a contact link” is evidence. “Make the footer purple” is a proposal. Fix the evidence first and rerun the task. Keep a short before-and-after note with the change and the result. That note is also a portfolio story: you can explain a design decision using user behavior instead of personal taste.

## The demonstration

**What you should see:**

- **Demo 1: Build a Complete Landing Page Structure from Wireframe**

  **Setup:** Draw a simple wireframe on the board or screen showing 5 sections stacked vertically: Hero, Features, About, Projects, Footer. Then translate it to HTML.

  Create `landing-page/index.html`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Name - Developer</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Fira+Code&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="style.css">
  </head>
  <body>
      <a href="#main" class="skip-link">Skip to main content</a>

      <header class="header">
          <nav class="header__nav">
              <a href="#" class="header__brand">YourName</a>
              <ul class="header__links">
                  <li><a href="#features" class="header__link">Skills</a></li>
                  <li><a href="#about" class="header__link">About</a></li>
                  <li><a href="#projects" class="header__link">Projects</a></li>
                  <li><a href="#contact" class="header__link">Contact</a></li>
              </ul>
          </nav>
      </header>

      <main id="main">
          <section class="hero">
              <h1 class="hero__title">Hi, I am <span class="hero__name">Your Name</span></h1>
              <p class="hero__subtitle">Full-stack developer building things that matter.</p>
              <a href="#projects" class="hero__cta">View My Work</a>
          </section>

          <section id="features" class="features">
              <h2 class="features__heading">What I Do</h2>
              <div class="features__grid">
                  <div class="feature-card">
                      <h3 class="feature-card__title">Frontend</h3>
                      <p class="feature-card__text">HTML, CSS, JavaScript. Responsive, accessible, fast.</p>
                  </div>
                  <div class="feature-card">
                      <h3 class="feature-card__title">Backend</h3>
                      <p class="feature-card__text">Node.js, Express, databases. APIs that scale.</p>
                  </div>
                  <div class="feature-card">
                      <h3 class="feature-card__title">Tools</h3>
                      <p class="feature-card__text">Git, GitHub, VS Code, terminal. The full toolkit.</p>
                  </div>
              </div>
          </section>

          <section id="about" class="about">
              <h2 class="about__heading">About Me</h2>
              <div class="about__content">
                  <img src="https://via.placeholder.com/300x300" alt="Your Name smiling at the camera" class="about__image">
                  <div class="about__text">
                      <p>Write 2-3 sentences about yourself here. Who are you? What drives you? What are you building toward?</p>
                      <p>This is the human section. Let people know there is a real person behind the code.</p>
                  </div>
              </div>
          </section>

          <section id="projects" class="projects">
              <h2 class="projects__heading">Projects</h2>
              <div class="projects__grid">
                  <article class="project-card">
                      <h3 class="project-card__title">Project One</h3>
                      <p class="project-card__description">A brief description of what you built and what you learned.</p>
                      <a href="#" class="project-card__link">View Project</a>
                  </article>
                  <article class="project-card">
                      <h3 class="project-card__title">Project Two</h3>
                      <p class="project-card__description">Another project with a description of technologies used.</p>
                      <a href="#" class="project-card__link">View Project</a>
                  </article>
              </div>
          </section>

          <section id="contact" class="contact">
              <h2 class="contact__heading">Get In Touch</h2>
              <p class="contact__text">Interested in working together? Reach out.</p>
              <a href="mailto:you@example.com" class="contact__cta">Email Me</a>
          </section>
      </main>

      <footer class="footer">
          <p class="footer__text">&copy; 2025 Your Name. Built with HTML & CSS.</p>
      </footer>
  </body>
  </html>
  ```

  **Outcome:** A complete, semantic HTML structure for a professional landing page with BEM naming, skip link, and section anchors.

  **Watch for this:**
  - Point out the skip link for accessibility.
  - Show how the nav links use `href="#features"` to jump to sections with matching `id` attributes.
  - All classes follow BEM. Every element is clearly named.

- **Demo 2: Style It Responsive with Everything Learned**

  Create `landing-page/style.css`:
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
      --color-surface: #1a1a2e;
      --color-primary: #e94560;
      --color-primary-dark: #c73650;
      --color-text: #e0e0e0;
      --color-text-muted: #888;
      --color-heading: #ffffff;
      --font-main: 'Inter', sans-serif;
      --font-code: 'Fira Code', monospace;
      --max-width: 1100px;
      --spacing-section: clamp(3rem, 8vw, 6rem);
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

  /* Skip link */
  .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: var(--color-primary);
      color: white;
      padding: 0.5rem 1rem;
      z-index: 1000;
      transition: top 0.3s;
  }
  .skip-link:focus { top: 0; }

  /* Header */
  .header {
      position: sticky;
      top: 0;
      z-index: 100;
      background-color: rgba(15, 15, 26, 0.95);
      backdrop-filter: blur(8px);
  }

  .header__nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 1rem 1.5rem;
  }

  .header__brand {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 700;
      font-size: 1.25rem;
  }

  .header__links {
      display: flex;
      list-style: none;
      gap: 1.5rem;
  }

  .header__link {
      color: var(--color-text-muted);
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.3s ease;
  }

  .header__link:hover { color: var(--color-primary); }

  /* Hero */
  .hero {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      min-height: 90vh;
      padding: 2rem 1.5rem;
  }

  .hero__title {
      font-size: clamp(2rem, 6vw, 3.5rem);
      color: var(--color-heading);
      margin-bottom: 1rem;
  }

  .hero__name { color: var(--color-primary); }

  .hero__subtitle {
      font-size: clamp(1rem, 2.5vw, 1.3rem);
      color: var(--color-text-muted);
      margin-bottom: 2rem;
      max-width: 600px;
  }

  .hero__cta {
      display: inline-block;
      background-color: var(--color-primary);
      color: white;
      padding: 0.9rem 2rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .hero__cta:hover {
      background-color: var(--color-primary-dark);
      transform: translateY(-2px);
  }

  /* Features */
  .features {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: var(--spacing-section) 1.5rem;
  }

  .features__heading {
      text-align: center;
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--color-heading);
      margin-bottom: 2rem;
  }

  .features__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
  }

  .feature-card {
      background-color: var(--color-surface);
      padding: 2rem;
      border-radius: 8px;
      border-top: 3px solid var(--color-primary);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(233, 69, 96, 0.15);
  }

  .feature-card__title {
      color: var(--color-primary);
      margin-bottom: 0.75rem;
  }

  /* About */
  .about {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: var(--spacing-section) 1.5rem;
  }

  .about__heading {
      text-align: center;
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--color-heading);
      margin-bottom: 2rem;
  }

  .about__content {
      display: flex;
      gap: 2rem;
      align-items: center;
  }

  .about__image {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--color-primary);
      flex-shrink: 0;
  }

  .about__text p + p { margin-top: 1rem; }

  /* Projects */
  .projects {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: var(--spacing-section) 1.5rem;
  }

  .projects__heading {
      text-align: center;
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--color-heading);
      margin-bottom: 2rem;
  }

  .projects__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

  .project-card:hover { transform: translateY(-4px); }

  .project-card__title { color: var(--color-heading); }

  .project-card__link {
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 600;
      margin-top: auto;
      transition: color 0.3s ease;
  }

  .project-card__link:hover { color: var(--color-primary-dark); }

  /* Contact */
  .contact {
      text-align: center;
      padding: var(--spacing-section) 1.5rem;
  }

  .contact__heading {
      font-size: clamp(1.5rem, 3vw, 2rem);
      color: var(--color-heading);
      margin-bottom: 1rem;
  }

  .contact__text { margin-bottom: 2rem; color: var(--color-text-muted); }

  .contact__cta {
      display: inline-block;
      background-color: var(--color-primary);
      color: white;
      padding: 0.9rem 2rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      transition: background-color 0.3s ease, transform 0.2s ease;
  }

  .contact__cta:hover {
      background-color: var(--color-primary-dark);
      transform: translateY(-2px);
  }

  /* Footer */
  .footer {
      text-align: center;
      padding: 2rem 1.5rem;
      background-color: var(--color-surface);
      color: var(--color-text-muted);
      font-size: 0.9rem;
  }

  /* Responsive */
  @media (max-width: 767px) {
      .header__nav {
          flex-direction: column;
          gap: 0.75rem;
      }
      .header__links { gap: 1rem; }
      .about__content {
          flex-direction: column;
          text-align: center;
      }
  }

  /* Focus styles */
  a:focus,
  button:focus {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
      }
  }
  ```

  **Outcome:** A fully styled, responsive, accessible landing page with sticky nav, smooth scrolling, hover effects, and BEM naming.

  **Watch for this:**
  - Walk through each section and connect it to a previous session: "Semantic HTML - that is Session 2.1. Custom properties and typography - Session 2.2. Grid and Flexbox layout - Session 2.3. Transitions and BEM - Session 2.4."
  - Show the `prefers-reduced-motion` query and explain that it respects user accessibility preferences.
  - Show `scroll-behavior: smooth` on the `html` element for smooth anchor scrolling.

- **Demo 3: Deploy to GitHub Pages Step by Step**

  **Steps:**

  ```bash
  # 1. Navigate to your project
  cd landing-page

  # 2. Initialize git (if not already)
  git init

  # 3. Add and commit
  git add .
  git commit -m "Initial landing page"

  # 4. Create GitHub repo (using gh CLI or GitHub website)
  gh repo create my-landing-page --public --source=. --push

  # 5. Enable GitHub Pages
  # Go to github.com > your repo > Settings > Pages
  # Source: Deploy from a branch
  # Branch: main, folder: / (root)
  # Save

  # 6. Wait ~60 seconds, then visit:
  # https://yourusername.github.io/my-landing-page/
  ```

  Show the live site loading in a browser. Open it on a phone (or phone emulator). It works. It is live. It is real.

  **Watch for this:**
  - Remember that this is a real website that anyone in the world can access.
  - Show how to check the deployment status in the Actions tab on GitHub.
  - If deployment takes more than 2 minutes, explain that GitHub Pages can occasionally be slow and to just wait.

### Runnable checkpoint: a small model

Predict the assertions before pressing Run. This model isolates one idea from the lesson; the manual walkthrough exercises the full environment. Change one input to violate the stated rule, observe the failure, then restore the valid case. Explain why the changed case should fail rather than editing the assertion to accept it.

```js run=checkpoint-2-5
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS:', message);
}
const links = ['#about', '#projects', '#contact'];
const sections = new Set(['about', 'projects', 'contact']);
const missing = links.filter(link => !sections.has(link.slice(1)));
check(missing.length === 0, 'Every navigation target exists');
check(!sections.has('missing'), 'A broken target is detected');
console.log('ok: checkpoint-2-5');
```

## Where it breaks

![](diagram:session-2-5/fig2-diagnosis)

### Blank deployed page

The repository is on GitHub and the Pages setting says it is published, and the URL is a white screen or a 404. Pages publishes one branch and one folder, and it looks for `index.html` at that root with that exact casing. A file named `Index.html`, a page that lives in `src/` while Pages is pointed at `/`, or a setting that still says "None" all produce the same empty result. Open the repository's Pages settings and read the branch, the folder, and the last deploy line before you touch the HTML. Then open the URL GitHub printed, not a URL you assembled by hand.

### Missing assets

The HTML arrives and the portrait, the stylesheet, or the font does not. In the browser network panel those requests are 404s, usually because the path was written from your laptop's point of view. A link that starts with `/` asks for the host root. A project site is served from `/your-name/`, so that slash skips the project and the file is not there. Write the path relative to the HTML file, or with the repository name in it, and reload with the cache disabled. The same break hits a stylesheet that itself points at a font with a root-absolute URL.

### Unusable navigation

The page looks finished at a wide desktop width and fails as soon as a person tries to use it. Tab through it. If the focus ring never appears, or the ring jumps into a control that is off the screen, the keyboard path is broken even though the mouse path works. Then narrow the window to a phone width. A nav that overflows sideways, a button that sits under a fixed bar, or text that runs off the card is the layout you shipped, not a browser quirk. Fix focus order and the narrow width before you call the deploy done.

## Your turn

**What you build:**

- **Exercise 1: Build and Style the Hero Section**

  **Prompt:** Build a hero section for YOUR landing page. Use your real name (or chosen name), a real tagline about yourself, and a call-to-action button. Center it with Flexbox. Make it full viewport height. Add a fade-in animation.

  **Starter Code:**
  ```html
  <section class="hero">
      <h1 class="hero__title">Hi, I am <span class="hero__name">[YOUR NAME]</span></h1>
      <p class="hero__subtitle">[Your one-line description]</p>
      <a href="#projects" class="hero__cta">[Your CTA text]</a>
  </section>
  ```

  ```css
  @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
  }

  /* TODO: Style the hero section (centered, full viewport, dark background) */
  /* TODO: Apply fadeInUp animation to .hero__title */
  /* TODO: Apply fadeInUp with delay to .hero__subtitle and .hero__cta */
  /* TODO: Style the CTA button with hover transition */
  ```

  **Success Criteria:**
  - [ ] Uses your real name and a genuine tagline
  - [ ] Centered horizontally and vertically with Flexbox
  - [ ] Full viewport height (`min-height: 100vh`)
  - [ ] Fade-in animation on title, subtitle, and CTA
  - [ ] CTA has hover effect with transition

  **Time:** 20 minutes

- **Exercise 2: Build the Features/Skills Section with Grid Layout**

  **Prompt:** Build a skills section with at least 3 skill cards in a responsive grid. Each card should have a title and description. Use CSS Grid with `auto-fit` and `minmax()`.

  **Starter Code:**
  ```html
  <section id="skills" class="skills">
      <h2 class="skills__heading">My Skills</h2>
      <div class="skills__grid">
          <!-- Add at least 3 skill cards here -->
          <!-- Each card: <div class="skill-card">
              <h3 class="skill-card__title">Skill Name</h3>
              <p class="skill-card__text">Description</p>
          </div> -->
      </div>
  </section>
  ```

  ```css
  /* TODO: Style .skills section with max-width and centered */
  /* TODO: Style .skills__grid with CSS Grid (auto-fit, minmax(250px, 1fr)) */
  /* TODO: Style each .skill-card with background, padding, border-radius */
  /* TODO: Add hover effect to skill cards */
  ```

  **Success Criteria:**
  - [ ] At least 3 skill cards with your real skills
  - [ ] Responsive grid using `auto-fit` and `minmax()`
  - [ ] Cards have hover effects
  - [ ] BEM naming used throughout
  - [ ] Section has a heading and is visually distinct

  **Time:** 20 minutes

## The quest

**Begin the Unit Project** (see below). Use the remaining class time to start building your personal landing page. The full requirements and rubric follow.

### Review the artifact

Your deliverable is **A responsive personal landing page, deployment URL, and accessibility review**. Keep the result, the evidence, and the limitations together so a reviewer can reproduce the important behavior. Start the review with the user outcome, then trace the three boundaries shown in the working-model diagram. Explain what enters each boundary, what leaves it, and which condition would stop progress.

Use the failure cases above as a rehearsal, not only as reading. Choose a valid fixture, change one relevant condition, and compare the result. Record expected and observed behavior separately. If they disagree, investigate the smallest boundary that could explain the difference. After correcting it, repeat the original valid case to check that the repair did not remove useful behavior.

Ask a peer to review the artifact without your narration. Give them the setup instructions and acceptance criteria, then note where they need additional information. Improve the artifact or its instructions at that point. A complete submission is understandable without the author's memory. Include unresolved questions as explicit follow-up work with a reason and a next action; do not hide them behind a general claim that everything works.

### Unit project: completion contract

> *The forges of the Guild are open. Every adventurer who joins this world must present themselves. A single page that tells the realm who you are, what you can do, and why any party should want you. This is not decoration. This is your battle standard. Your flag planted in the ground. In this world, the adventurers who ship are the ones who get noticed. The ones who wait for perfection are still waiting in the tavern.*
>
> *You have spent five sessions learning the foundational arts: HTML structure, CSS styling, responsive layout, animation, and deployment. Now it is time to combine them all into one cohesive artifact. You will build a personal landing page from scratch and deploy it to the Crystal Network (GitHub Pages) where anyone in the realm can view it. This page will be your first real portfolio piece. Not a tutorial project. Not a classroom exercise. A real page at a real URL.*
>
> *The forgemasters will judge your work on structure, style, responsiveness, polish, and craft. But remember: a shipped page that is good beats an unshipped page that is perfect. Forge it. Ship it. Improve it later. That is the way.*

### Technical Requirements

Your landing page must include ALL of the following:

- [ ] **Valid semantic HTML5** - Proper document structure, semantic sectioning elements (`header`, `nav`, `main`, `section`, `footer`), meaningful heading hierarchy
- [ ] **External CSS with custom properties** - All styles in an external stylesheet, at least 5 CSS custom properties for colors, fonts, and spacing
- [ ] **Responsive design** - Mobile-first approach, works well on at least 3 screen sizes (phone, tablet, desktop), no horizontal scrollbar at any width
- [ ] **Flexbox AND Grid** - Both layout systems used meaningfully (not just for demonstration). Example: Grid for a card section, Flexbox for the navigation
- [ ] **At least 2 CSS animations/transitions** - Hover effects, entrance animations, or interactive feedback. Must be purposeful, not decorative noise
- [ ] **BEM naming convention** - All CSS classes follow Block__Element--Modifier naming
- [ ] **Google Fonts** - At least one custom font loaded from Google Fonts
- [ ] **Deployed on GitHub Pages** - Live at a public URL that anyone can visit
- [ ] **Accessible** - All images have alt text, sufficient color contrast, visible focus styles, semantic structure for screen readers
- [ ] **README.md** - In the repository root, includes: your name, a screenshot of the page, a link to the live URL, technologies used, and one thing you learned

### Required Sections (minimum)

1. **Navigation** - Functional navigation bar with links to page sections
2. **Hero Section** - Headline, subtitle, call-to-action
3. **Skills/Features Section** - At least 3 items in a grid or card layout
4. **About Section** - Photo/avatar and bio text
5. **Projects or Portfolio Section** - At least 2 project cards (can be placeholder projects from this course)
6. **Contact Section** - At least an email link or contact form
7. **Footer** - Copyright and any secondary links

### Skill Points Rubric

### Boss Clear Criteria (70 pts) - Core Requirements

| Criterion | Points | Description |
|-----------|--------|-------------|
| Semantic HTML Structure | 15 | Proper document structure, semantic elements used correctly, meaningful heading hierarchy, valid HTML |
| CSS Fundamentals | 15 | External stylesheet linked, CSS custom properties used, consistent typography and color scheme, box model applied correctly |
| Responsive Design | 15 | Mobile-first approach, works on phone/tablet/desktop, media queries or fluid techniques used, no overflow issues |
| Layout Systems | 15 | Both Flexbox and Grid used meaningfully, appropriate system chosen for each layout task, proper alignment and spacing |
| Deployment | 10 | Live on GitHub Pages at a working URL, `index.html` in root, all assets loading correctly |

### Epic Loot (20 pts) - Quality and Polish

| Criterion | Points | Description |
|-----------|--------|-------------|
| Animations and Polish | 10 | At least 2 meaningful transitions/animations, smooth hover effects, visual feedback on interactive elements, page feels polished |
| Code Quality and BEM | 10 | BEM naming throughout, organized CSS (logical section order, comments), clean HTML (no unnecessary divs), no inline styles |

### Legendary Status (10 pts) - Above and Beyond

| Criterion | Points | Description |
|-----------|--------|-------------|
| Exceptional Craft | 10 | Professional-level design, creative use of CSS techniques, accessibility beyond the basics (skip link, `prefers-reduced-motion`, ARIA where needed), performance-optimized images, README with screenshot |

### Score Rating

| Score | Rating |
|-------|--------|
| 90-100 | Legendary (S-Rank) |
| 80-89 | Epic (A-Rank) |
| 70-79 | Boss Clear (B-Rank) |
| 60-69 | Approaching (C-Rank) |
| 0-59 | Needs Retry |

### Submission Requirements

1. Push your completed project to a GitHub repository
2. Deploy to GitHub Pages and verify the live URL works
3. Submit:
   - GitHub repository URL
   - Live GitHub Pages URL
   - A brief paragraph (3-5 sentences) reflecting on what you built, what was hardest, and what you would improve with more time

---

![](diagram:session-2-5/fig3-evidence)

## Side quests

Use these library pages to deepen the decisions in this lesson. Return to the main artifact and apply one idea rather than treating the references as a separate checklist.

## Before next session

**Duration:** 180 minutes
**Pre-work:**
- Complete Session 2.4 homework (BEM refactor, animations added to about-me.html)
- Read: [GitHub Pages Documentation](https://pages.github.com/)
- Read: [MDN - Accessibility Overview](https://developer.mozilla.org/en-US/docs/Learn/Accessibility)
- Have your `html-css-foundations` repo cloned and up to date
- Have a rough idea of what you want your personal landing page to look like (sketch it on paper or in your head)

**Materials:**
- VS Code with Live Server extension
- Chrome or Firefox with DevTools (Lighthouse tab for accessibility/performance audits)
- GitHub account with Pages enabled
- An image for your landing page (photo, avatar, or placeholder)
- [Squoosh](https://squoosh.app/) for image optimization

**Due before Unit 3:**
- [ ] Complete and deploy your Unit 2 Project (landing page on GitHub Pages)
- [ ] Submit the live URL and GitHub repo URL
- [ ] Ensure your page passes a basic Lighthouse accessibility audit (aim for 90+)
- [ ] Push all work to GitHub

**Estimated time:** 5-8 hours (this is the Unit Project)

---

### Manual verification and further reading

- [Official reference 1](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
