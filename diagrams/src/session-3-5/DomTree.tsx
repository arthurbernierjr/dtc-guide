import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

type Node = { tag: string; note?: string; kids?: Node[]; hot?: boolean; inline?: boolean };

// Siblings with the same shape sit on one row (inline) so the tree stays as short as the file.
const TREE: Node = {
  tag: "document",
  hot: true,
  kids: [
    {
      tag: "html",
      kids: [
        { tag: "head", inline: true, kids: [{ tag: "title", note: '"DOM Playground"' }] },
        {
          tag: "body",
          kids: [
            { tag: "h3", note: "#main-title" },
            { tag: "div", note: "#container", inline: true, kids: [{ tag: "p", note: ".message" }, { tag: "p", note: ".message" }] },
            { tag: "button", note: "#change-btn" },
            { tag: "ul", note: "#quest-list", inline: true, kids: [{ tag: "li" }, { tag: "li" }, { tag: "li" }] },
          ],
        },
      ],
    },
  ],
};

const SOURCE = [
  "<html>",
  "<head><title>DOM Playground</title></head>",
  "<body>",
  '  <h3 id="main-title">DOM Playground</h3>',
  '  <div id="container">',
  '    <p class="message">First</p>',
  '    <p class="message">Second</p>',
  "  </div>",
  '  <button id="change-btn">Click Me</button>',
  '  <ul id="quest-list">',
  "    <li>Defeat the Goblin King</li>",
  "    <li>Find the Lost Artifact</li>",
  "    <li>Save the Village</li>",
  "  </ul>",
  '  <script src="app.js"></script>',
  "</body>",
  "</html>",
];

/** §R10 #17 — the file on disk and the tree in memory: JavaScript changes the tree, never the file. */
export const DomTree: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 23 : 19;
  const gap = wide ? 6 : 4;

  const chip = (n: Node) => (
    <span
      key={n.tag + (n.note || "")}
      style={{ display: "inline-flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
    >
      <span
        style={{
          fontFamily: F.mono,
          fontSize: fs,
          lineHeight: 1,
          color: n.hot ? T.ink : T.heading,
          background: n.hot ? T.green : T.card,
          border: `1.5px solid ${n.hot ? T.green : T.border2}`,
          borderRadius: 8,
          padding: wide ? "6px 10px" : "4px 8px",
          fontWeight: n.hot ? 600 : 400,
        }}
      >
        {n.tag}
      </span>
      {n.note ? <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: n.note.startsWith("#") ? T.yellow : n.note.startsWith(".") ? T.greenLight : T.muted }}>{n.note}</span> : null}
    </span>
  );

  const node = (n: Node, depth: number): React.ReactNode => (
    <div key={n.tag + (n.note || "") + depth} style={{ display: "flex", flexDirection: "column", gap }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap" }}>
        {depth > 0 ? <span style={{ width: 18, height: 1.5, background: T.border2, display: "inline-block", flex: "0 0 auto" }} /> : null}
        {chip(n)}
        {n.inline && n.kids ? (
          <>
            <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.faint }}>›</span>
            <span style={{ display: "inline-flex", gap: 10, padding: "4px 8px", border: `1.5px dashed ${T.border2}`, borderRadius: 10 }}>{n.kids.map(chip)}</span>
          </>
        ) : null}
      </div>
      {n.kids && !n.inline ? (
        <div style={{ display: "flex", flexDirection: "column", gap, marginLeft: wide ? 24 : 18, paddingLeft: 12, borderLeft: `1.5px solid ${T.border2}` }}>{n.kids.map((k) => node(k, depth + 1))}</div>
      ) : null}
    </div>
  );

  const file = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: wide ? "0 0 620px" : "0 0 auto", minWidth: 0 }}>
      <Label size={wide ? 25 : 23} color={T.muted} style={{ letterSpacing: ".18em", textTransform: "uppercase" }}>index.html · the file on disk</Label>
      <div style={{ background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14, padding: wide ? "14px 18px" : "10px 14px", fontFamily: F.mono, fontSize: wide ? 20 : 17, lineHeight: 1.32, color: T.soft, whiteSpace: "pre" }}>
        {SOURCE.map((l, i) => (
          <div key={i} style={{ color: l.includes("<script") ? T.yellow : T.soft }}>{l}</div>
        ))}
      </div>
      <span style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, color: T.muted, lineHeight: 1.3 }}>parsed once when the page loads · your script never changes it</span>
    </div>
  );

  const tree = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0 }}>
      <Label size={wide ? 25 : 23} color={T.green} style={{ letterSpacing: ".18em", textTransform: "uppercase" }}>the DOM · the live tree in memory</Label>
      <div style={{ background: T.code, border: `1.5px solid ${T.border2}`, borderRadius: 14, padding: wide ? "14px 18px" : "10px 14px", flex: wide ? 1 : "0 0 auto" }}>{node(TREE, 0)}</div>
      <span style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, color: T.muted, lineHeight: 1.3 }}>
        every tag became an object · <span style={{ fontFamily: F.mono, color: T.green }}>document</span> is the root and your way in
      </span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 1 · The file and the tree" title="Session 3.5 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 16 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 36 : 10, flex: 1, minHeight: 0 }}>
          {file}
          {wide ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
              <svg width={56} height={56} viewBox="0 0 60 60">
                <path d="M6 30 H48 M34 16 L50 30 L34 44" stroke={T.green} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : null}
          {tree}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 27 : 23, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          The browser reads the file once and builds the tree. <span style={{ color: T.heading }}>JavaScript changes the tree, never the file.</span> Reload, and the tree is rebuilt from the file as if nothing happened.
        </div>
      </div>
    </Frame>
  );
};
