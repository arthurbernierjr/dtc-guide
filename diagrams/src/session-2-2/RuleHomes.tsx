import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #52 — a CSS rule is a selector plus declarations, and it can live in three places. Only the external file is the one we keep. */
export const RuleHomes: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 18;
  const home = (title: string, color: string, code: string, verdict: string, bad: boolean) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={color} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>{title}</Label>
      <div style={{ padding: "8px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, flex: 1 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.soft, whiteSpace: "pre", lineHeight: 1.45 }}>{code}</span>
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: bad ? T.red : T.greenLight, lineHeight: 1.3 }}>{verdict}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 1 · A rule, and the three places it can live" title="Session 2.2 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14, flexShrink: 0 }}>
          <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>one rule · who, then what</Label>
          <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 28 : 8, marginTop: 8 }}>
            <span style={{ fontFamily: F.mono, fontSize: fs, color: T.yellow, whiteSpace: "pre", lineHeight: 1.4 }}>{"h1 {\n    color: #F5F2EE;\n    font-size: 2.5rem;\n}"}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, justifyContent: "center" }}>
              <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.soft }}><span style={{ fontFamily: F.mono, color: T.yellow }}>h1</span> is the selector. It names the elements.</span>
              <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.soft }}><span style={{ fontFamily: F.mono, color: T.greenLight }}>color</span> and <span style={{ fontFamily: F.mono, color: T.greenLight }}>font-size</span> are properties. The words after the colon are the values.</span>
              <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.muted }}>One declaration per line. A semicolon ends it. The braces hold the list.</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 12 : 8, flex: 1, minHeight: 0 }}>
          {home("inline · on the element", T.red, '<h1 style="color:\n  #F5F2EE">', "Worst. It beats every stylesheet, and it cannot be reused.", true)}
          {home("internal · a style tag", T.yellow, "<head>\n  <style>\n    h1 { color: #F5F2EE; }\n  </style>\n</head>", "Fine for a ten-minute test. Dies when the second page needs the same look.", true)}
          {home("external · a file", T.green, '<link rel="stylesheet"\n  href="style.css">\n\n/* style.css */\nh1 { color: #F5F2EE; }', "The one we keep. One file, every page, and the HTML stays a skeleton.", false)}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 24 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          CSS describes how the skeleton looks. <span style={{ color: T.heading }}>It is a separate file, linked once from the head</span>, and from here on that is the only place new rules go.
        </div>
      </div>
    </Frame>
  );
};
