import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #50 — the three shapes an element takes (a pair of tags, a void tag, attributes on the opening tag) and the heading outline rule: one h1, then no skipped levels. */
export const ElementShapes: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 18;
  const card = (kicker: string, color: string, code: string, note: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={color} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>{kicker}</Label>
      <div style={{ padding: wide ? "8px 12px" : "8px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, flex: 1 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft, whiteSpace: "pre", lineHeight: 1.45 }}>{code}</span>
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3 }}>{note}</span>
    </div>
  );
  const rung = (tag: string, label: string, color: string, indent: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: indent }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color, fontWeight: 700, width: wide ? 46 : 40 }}>{tag}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.soft }}>{label}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 4 · Three shapes, and an outline" title="Session 2.1 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 12 : 8, flexShrink: 0 }}>
          {card("a pair", T.green, "<p>  Hello.  </p>\n└─ open   content   close ┘", "Most elements. The close tag repeats the name with a slash. Forget it and the browser guesses where you meant it, and guesses wrong.")}
          {card("void · no close tag", T.yellow, "<img src=\"…\" alt=\"…\">\n<br>   <hr>   <meta>   <input>", "Nothing can go inside, so there is nothing to close. Writing </img> or </br> is a tell that the shape has not sunk in yet.")}
          {card("attributes", T.soft, '<a href=\"/quests\"\n   target=\"_blank\">\n  Quests\n</a>', "Name, then =, then a quoted value, and only on the opening tag. href is where it goes. The words between the tags are what the reader clicks.")}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 8, padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 14 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: wide ? 8 : 6, justifyContent: "center" }}>
            <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>the outline · do not skip a level</Label>
            {rung("h1", "the page, once: Arthur's Adventure Log", T.green, 0)}
            {rung("h2", "a section: About, Quests, Contact", T.greenLight, wide ? 28 : 16)}
            {rung("h3", "a piece inside it: one quest's title", T.yellow, wide ? 56 : 32)}
            {rung("h4", "only if an h3 needs splitting", T.muted, wide ? 84 : 48)}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
            <Label size={fs - 4} color={T.red} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>not a size knob</Label>
            <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.soft, lineHeight: 1.35 }}>h1 then h3 then h5 is a hole in the outline. Headings are the table of contents a screen reader builds, and the size they render at is the stylesheet's job, which is next session. Pick the level the structure wants, then style it.</span>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 24 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          An element is a name, optional attributes, and either content or nothing. <span style={{ color: T.heading }}>The name says what the content is</span>, and the heading levels say how it nests.
        </div>
      </div>
    </Frame>
  );
};
