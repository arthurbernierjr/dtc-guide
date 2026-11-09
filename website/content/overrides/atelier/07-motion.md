---
title: "Motion"
lede: "Build a seamless moving strip and a scroll reveal, then add controls so motion remains a choice rather than a barrier."
verified: 2026-11-07
exec: ran
verified_note: "Working HTML, CSS, and JavaScript checkpoints exercised in Chromium; desktop, phone, keyboard, reduced motion, and no-JavaScript behavior checked."
docs:
  - https://developer.mozilla.org/en-US/docs/Web/CSS
  - https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal
---

# Motion

Motion can show continuity and give an interaction a sense of response. It can also make a page harder to read. We will build two effects with clear resting states: a repeating text strip and cards that appear as they approach the viewport. You will be able to pause the strip and use the whole page without animation.

## See two moments of the same animation

![The moving strip begins with Build, Observe, Refine, and Repeat distributed across the width.](images/07-frame-a.jpg "The marquee at the beginning of its cycle.")

![The same strip five seconds later has shifted left, bringing the next copy of the words into view.](images/07-frame-b.jpg "The same animation at five seconds, captured in the browser.")

**Your working files:** [Open the finished example](/assets/atelier/07/index.html) · [Download starter + finished files](/assets/atelier/downloads/07.zip) · [Read the complete CSS](/assets/atelier/07/styles.css) · [Read the complete JavaScript](/assets/atelier/07/app.js).

Open the finished example to see the movement; these screenshots let you compare positions without needing to watch a loop while reading. Begin your own work from checkpoint 6. The navigation script remains in `app.js`. We will append a second, separate piece of behavior to that file.

## Trace the original moving strip

The fashion landing page used as one of our references, ELEVEN28 by Shayla, contains this marquee:

**Source excerpt:** ELEVEN28 by Shayla · fashion landing page, lines 328–331. [Read the complete source stylesheet](/assets/atelier/reference/shayla.css). Whitespace is expanded for readability; declarations are unchanged.

```css shayla.css
.marquee {
  padding:65px 0;
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  overflow:hidden
}
.marquee-track {
  display:flex;
  width:max-content;
  font:700 48px/1.1 var(--font-display);
  white-space:nowrap;
  color:var(--heading);
  animation:marquee 40s linear infinite
}
.marquee-track b {
  color:var(--champagne);
  font-weight:400;
  margin:0 42px
}
@keyframes marquee {
  to {
    transform:translateX(-50%)
  }
}
```

The track is a flex row whose width follows its content. The animation moves it left by half its own width. That percentage is relative to the moving track, not half the viewport. A seamless loop requires that the point halfway across the track be visually equivalent to its beginning.

Our reconstruction makes that requirement visible in the markup: there are two identical groups. When the first group has moved out, the second is in exactly the position the first occupied at the start. Restarting the animation is then visually continuous. The illusion comes from repetition and geometry, not from an infinitely long text string.

## Make two equal groups and one viewport

Replace the section with `id="motion"` using this entire block, including the strip after it:

```html index.html · checkpoint 07 addition
<section class="section container stack" id="motion" tabindex="-1">
  <p class="eyebrow">03 / A rhythm</p><h2>Build. Observe. Refine.</h2>
  <p class="muted">The strip below moves continuously. You control whether it keeps moving.</p>
  <div class="motion-controls"><button class="pill ghost" id="pause-motion" type="button" aria-pressed="false" hidden>Pause marquee</button></div>
</section>
<div class="marquee" aria-hidden="true">
  <div class="marquee-track">
    <div class="marquee-group"><span>BUILD</span><span>OBSERVE</span><span>REFINE</span><span>REPEAT</span></div>
    <div class="marquee-group"><span>BUILD</span><span>OBSERVE</span><span>REFINE</span><span>REPEAT</span></div>
  </div>
</div>
```

The wrapper clips the overflow. The track moves inside it. Each group contains the same words in the same order. Each also owns its internal gap and side padding. We avoid a separate gap between the two groups because that extra space would change the relationship between half the track and one full group.

The moving words are decorative; the heading and paragraph above already communicate the idea. The strip is therefore hidden from assistive technology so someone does not have to hear both copies. Do not hide essential information this way. A moving list of actual announcements would need a readable, non-duplicated equivalent.

Append these styles:

```css styles.css · checkpoint 07 addition
/* 07 — MOTION WITH A STOP BUTTON */
.marquee { overflow: hidden; border-block: 1px solid var(--border); padding-block: 24px; }
.marquee-track { display: flex; width: max-content; animation: march 20s linear infinite; }
.marquee-group { flex: 0 0 auto; display: flex; justify-content: space-around; min-width: 100vw; gap: 40px; padding-inline: 20px; font: 600 32px/1.2 var(--display); color: var(--accent); }
@keyframes march { to { transform: translateX(-50%); } }
.motion-paused .marquee-track { animation-play-state: paused; }
.reveal.is-pending { opacity: 0; transform: translateY(24px); }
.reveal { transition: opacity .6s var(--ease), transform .6s var(--ease); }
.reveal.is-visible { opacity: 1; transform: none; }
.motion-controls { padding-block: 24px; }
@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
  .marquee-group { flex-wrap: wrap; white-space: normal; min-width: 0; width: 100vw; }
  .marquee-group + .marquee-group { display: none; }
  .reveal, .reveal.is-pending { opacity: 1; transform: none; transition: none; }
}
```

`linear` keeps the speed constant. An ease-in-and-out curve would slow down at every loop boundary, drawing attention to the repetition. `infinite` repeats the cycle. The pause class changes `animation-play-state`, which preserves the current position instead of jumping back to the beginning.

## Let the browser reveal cards when they arrive

The cards from lesson 5 already carry the class `reveal`, but that class alone does not hide them. This is deliberate. A failed or disabled script should not turn useful links into invisible boxes.

Append this code to `app.js`, after the navigation code:

```js app.js · checkpoint 07 addition
// 07 — Content is visible unless a working observer can reveal it.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const reveals = [...document.querySelectorAll('.reveal')];
let observer;
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });
  reveals.forEach(element => { element.classList.add('is-pending'); observer.observe(element); });
}
reducedMotion.addEventListener('change', event => {
  if (!event.matches) return;
  observer?.disconnect();
  reveals.forEach(element => element.classList.remove('is-pending'));
});
const pause = document.querySelector('#pause-motion');
pause.hidden = false;
pause.addEventListener('click', () => {
  const paused = document.body.classList.toggle('motion-paused');
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Resume marquee' : 'Pause marquee';
});
```

An `IntersectionObserver` asks the browser to report when a card crosses a visibility threshold. Here the threshold is `.12`: roughly twelve percent of the target's area must intersect the observer's viewport. Each intersecting card receives `is-visible`, then is no longer observed because this entrance should happen once.

The script adds `is-pending` only when the observer is available and reduced motion is not requested. The pending class supplies the starting opacity and downward translation. The visible class supplies the destination. The CSS transition interpolates between them. JavaScript decides **when**; CSS describes **what the states look like**.

If your observer never runs, check the console and the script path before changing animation duration. If a card flashes and disappears, inspect the order in which pending and visible classes are applied. If a card stays invisible, temporarily remove `is-pending` to recover the content while diagnosing the trigger.

## Pause the strip and respect the reader

Scroll to the motion section and press Pause marquee. **Expected:** the words stop at their current position, and the button becomes Resume marquee. Press it again. The strip continues from that position. `aria-pressed` communicates the toggle state in addition to the visible label.

Now enable your browser's reduced-motion emulation or your operating system's reduced-motion setting. **Expected:** the marquee becomes a static, wrapping row; the duplicate group disappears; the cards remain fully visible. If you change this preference while the page is open, the listener removes pending states and disconnects the observer.

Reduced motion is not achieved by making a 20-second animation take 200 seconds. It means providing a version that does not depend on the unwanted movement. The content and links still have their jobs in the static version.

## Break the loop deliberately, then repair it

Change the second group's final word to a much longer sentence. **Expected:** the two groups may now have different widths, and the halfway reset can reveal a jump. Restore the identical content. Next change the animation duration from 20 seconds to 8 seconds. **Expected:** the path stays the same, but the words travel faster. Restore 20 seconds after comparing.

For the reveal, change `translateY(24px)` to `translateY(80px)`. Reload and scroll down. **Expected:** the cards travel farther, making the entrance more conspicuous. Compare whether that extra motion actually helps you read the links. Restore 24 pixels. Bigger is a change you can observe; better requires a reason.

A decorative loading screen would add another animation, but this local page has no asynchronous application setup to wait for. We will not invent a fake loading percentage. In [Gate, cursor, and sound](/atelier/gate-cursor-sound/), you will instead build an optional entrance whose open and closed states correspond to a real user action.
