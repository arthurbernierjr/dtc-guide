import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #48 — the document every page shares: doctype, html, a head the reader never sees, a body they do, and the two meta lines that belong in every head. */
export const DocumentAnatomy: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 18;
  const line = (code: string, note: string, color: string) => (
    <div key={code} style={{ display: "grid", gridTemplateColumns: wide ? "340px 1fr" : "1fr", gap: wide ? 14 : 2, alignItems: "baseline", padding: wide ? "7px 0" : "6px 0", borderBottom: `1px solid ${T.border}` }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color }}>{code}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3 }}>{note}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 2 · One document, two audiences" title="Session 2.1 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1.3, minWidth: 0, display: "flex", flexDirection: "column", padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 14 }}>
            <Label size={fs - 4} color={T.soft} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>every page, the same skeleton</Label>
            {line("<!DOCTYPE html>", "line one, always: this is HTML5", T.muted)}
            {line('<html lang="en">', "the root; lang tells a screen reader the language", T.heading)}
            {line("<head> … </head>", "for the browser: title, charset, viewport, the CSS file", T.yellow)}
            {line("<body> … </body>", "for the reader: everything that gets painted", T.green)}
            {line("</html>", "the document ends when the root closes", T.heading)}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: wide ? 10 : 8 }}>
            <div style={{ flex: 1, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.yellow}`, borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>head · invisible</Label>
              <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.soft, lineHeight: 1.45, whiteSpace: "pre" }}>{"<title>Adventure Log</title>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\"\n  content=\"width=device-width,\n  initial-scale=1.0\">"}</span>
              <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3, marginTop: "auto" }}>The tab title, every character of every language, and a promise to size the page to the phone. None of it is painted.</span>
            </div>
            <div style={{ flex: 1, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
              <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>body · visible</Label>
              <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.heading, lineHeight: 1.3 }}>Arthur's Adventure Log</span>
              <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.3 }}>About · Quests · Contact</span>
              <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3, marginTop: "auto" }}>If a reader can see it, it lives here. The head is not a header, and the two words are not interchangeable.</span>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 24 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Learn this shape until you can type it from memory. <span style={{ color: T.heading }}>Every page you will ever ship starts with these lines</span>, and the editor's shortcut is only safe once you know what it just inserted.
        </div>
      </div>
    </Frame>
  );
};
