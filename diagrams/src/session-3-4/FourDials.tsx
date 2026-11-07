import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Dial = { name: string; color: string; code: string[]; before: string; after: string; note: string; warn?: boolean };

const DIALS: Dial[] = [
  {
    name: "textContent",
    color: T.green,
    code: ['title.textContent = "Welcome, Adventurer!"'],
    before: "<h3>DOM Playground</h3>",
    after: "<h3>Welcome, Adventurer!</h3>",
    note: "plain text in, plain text out · safe for anything a user typed",
  },
  {
    name: "innerHTML",
    color: T.red,
    code: ['sub.innerHTML = "Quest <strong>begins</strong>"'],
    before: "<p>Learning the DOM</p>",
    after: "<p>Quest <strong>begins</strong></p>",
    note: "parses tags · never with user input (that is how scripts get injected)",
    warn: true,
  },
  {
    name: "classList",
    color: T.yellow,
    code: ['sub.classList.add("highlight")', 'sub.classList.toggle("big")'],
    before: '<p class="">…</p>',
    after: '<p class="highlight big">…</p>',
    note: "add · remove · toggle · contains · the CSS does the styling",
  },
  {
    name: "style",
    color: T.green,
    code: ['title.style.fontSize = "3rem"', 'title.style.textAlign = "center"'],
    before: "<h3>…</h3>",
    after: '<h3 style="font-size:3rem; …">…</h3>',
    note: "camelCase in JS, kebab-case in CSS · one element, inline",
  },
];

/** §R10 #19 — four dials on every element: text, HTML, classes, inline style; plus setAttribute for everything else. */
export const FourDials: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 23 : 21;

  const dial = (d: Dial) => (
    <div key={d.name} style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, padding: wide ? "16px 18px" : "12px 14px", background: T.card, border: `1.5px solid ${d.color}`, borderRadius: 14, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Label size={wide ? 27 : 24} color={d.color} style={{ fontWeight: 600 }}>.{d.name}</Label>
        {d.warn ? <span style={{ fontFamily: F.mono, fontSize: wide ? 18 : 16, color: T.red, border: `1px solid ${T.red}`, borderRadius: 999, padding: "3px 10px", letterSpacing: ".12em", textTransform: "uppercase" }}>careful</span> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {d.code.map((c) => (
          <span key={c} style={{ fontFamily: F.mono, fontSize: fs, color: T.heading, whiteSpace: "nowrap" }}>{c}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", padding: wide ? "10px 12px" : "8px 10px", background: T.code, borderRadius: 10, border: `1px solid ${T.border2}` }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.faint, letterSpacing: ".12em", textTransform: "uppercase" }}>before</span>
        <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.before}</span>
        <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: d.color, letterSpacing: ".12em", textTransform: "uppercase" }}>after</span>
        <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.soft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.after}</span>
      </div>
      <span style={{ fontFamily: F.body, fontSize: wide ? 22 : 20, color: T.muted, lineHeight: 1.25 }}>{d.note}</span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · Four dials on every element" title="Session 3.4 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 16 : 12, height: "100%" }}>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gridAutoRows: wide ? "1fr" : "auto", gap: wide ? 16 : 10, flex: 1, minHeight: 0 }}>{DIALS.map(dial)}</div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 26 : 23, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Everything else is an attribute: <span style={{ fontFamily: F.mono, color: T.heading }}>el.setAttribute("disabled", "true")</span> · <span style={{ fontFamily: F.mono, color: T.heading }}>el.removeAttribute("disabled")</span>. Reach for <span style={{ fontFamily: F.mono, color: T.green }}>textContent</span> first, <span style={{ fontFamily: F.mono, color: T.yellow }}>classList</span> second, and let the stylesheet do the styling.
        </div>
      </div>
    </Frame>
  );
};
