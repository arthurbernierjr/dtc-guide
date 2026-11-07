import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Step = { t: string; text: string; color?: string };

/** §R10 #21 — the two silent breakages of the week: a script that runs before the tree exists, and a form that reloads the page. */
export const NullAndReload: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 23 : 21;

  const timeline = (title: string, color: string, steps: Step[], fix: string[]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 10, flex: 1, minWidth: 0, padding: wide ? "16px 18px" : "12px 14px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 14 }}>
      <Label size={wide ? 26 : 23} color={color} style={{ letterSpacing: ".16em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{title}</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: wide ? "132px 1fr" : "112px 1fr", gap: 14, alignItems: "start", padding: wide ? "6px 0" : "5px 0", borderTop: i ? `1px solid ${T.border}` : "none" }}>
            <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.faint, letterSpacing: ".1em", textTransform: "uppercase", paddingTop: 3, whiteSpace: "nowrap" }}>{s.t}</span>
            <span style={{ fontFamily: s.text.startsWith("$") || s.text.includes("Error") ? F.mono : F.body, fontSize: s.text.includes("Error") ? fs - 2 : fs, color: s.color || T.soft, lineHeight: 1.3 }}>{s.text}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: wide ? "12px 14px" : "10px 12px", background: T.code, border: `1px solid ${T.green}`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.green, letterSpacing: ".14em", textTransform: "uppercase" }}>the fix</span>
        {fix.map((f) => (
          <span key={f} style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading, whiteSpace: "nowrap" }}>{f}</span>
        ))}
      </div>
    </div>
  );

  const early = timeline(
    "1 · the script ran too early",
    T.red,
    [
      { t: "0 ms", text: '<head> … <script src="app.js">' },
      { t: "1 ms", text: 'document.getElementById("main-title")', color: T.heading },
      { t: "", text: "→ null  (the <h3> has not been parsed yet)", color: T.red },
      { t: "1 ms", text: "TypeError: Cannot set properties of null (setting 'textContent')", color: T.red },
      { t: "40 ms", text: "<body> finishes parsing. Too late; the script already crashed." },
    ],
    ['<script src="app.js" defer></script>  in <head>', '// or: the <script> as the last child of <body>'],
  );

  const reload = timeline(
    "2 · the form reloaded the page",
    T.yellow,
    [
      { t: "click", text: "Add Quest  →  the browser's default: submit the form" },
      { t: "handler", text: "runs, creates the <li>, appends it", color: T.heading },
      { t: "default", text: "GET /quest-board.html?quest=Slay+the+Dragon", color: T.yellow },
      { t: "reload", text: "fresh tree from the file: every variable, every <li>, gone", color: T.red },
      { t: "", text: "it looks like your code did nothing. It did; the reload erased it." },
    ],
    ['form.addEventListener("submit", (event) => {', "  event.preventDefault();   // first line, every time", "  …", "});"],
  );

  return (
    <Frame layout={layout} caption="Fig 5 · Null and the reload" title="Session 3.4 · Where it breaks">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 16 : 12, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 24 : 12, flex: 1, minHeight: 0 }}>
          {early}
          {reload}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 27 : 24, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Neither one is a bug in your logic. One is <span style={{ color: T.heading }}>timing</span>: the tree did not exist yet. The other is a <span style={{ color: T.heading }}>default behaviour</span> you did not cancel. Both show up as "my code does nothing".
        </div>
      </div>
    </Frame>
  );
};
