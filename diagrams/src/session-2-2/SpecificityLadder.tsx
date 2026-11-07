import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #53 — when several rules match one element, compare columns from the left: inline, then ids, then classes, then elements. Source order breaks a tie. !important is the trapdoor. */
export const SpecificityLadder: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 19 : 17;
  const row = (sel: string, cols: string, winner: boolean, note: string) => (
    <div style={{ display: "grid", gridTemplateColumns: wide ? "200px 120px 1fr" : "1fr", gap: wide ? 12 : 2, alignItems: "center", padding: wide ? "8px 12px" : "7px 10px", background: winner ? "rgb(0 168 104 / .12)" : T.code, border: `1px solid ${winner ? T.green : T.border2}`, borderRadius: 10 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: winner ? T.greenLight : T.soft }}>{sel}</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.yellow }}>{cols}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.25 }}>{note}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 2 · Which rule wins" title="Session 2.2 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, height: "100%" }}>
        <div style={{ display: "flex", gap: wide ? 18 : 8, alignItems: "baseline", flexShrink: 0 }}>
          <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>compare columns, left to right · do not add them</Label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: wide ? "200px 120px 1fr" : "1fr", gap: wide ? 12 : 0, padding: "0 12px" }}>
          {wide ? <span style={{ fontFamily: F.body, fontSize: fs - 6, color: T.muted, letterSpacing: ".12em" }}>SELECTOR</span> : null}
          {wide ? <span style={{ fontFamily: F.body, fontSize: fs - 6, color: T.muted, letterSpacing: ".12em" }}>ID, CLASS, EL</span> : null}
          {wide ? <span style={{ fontFamily: F.body, fontSize: fs - 6, color: T.muted, letterSpacing: ".12em" }}>FOR THIS PARAGRAPH</span> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {row("p", "(0, 0, 1)", false, "matches, and loses to anything with a class")}
          {row(".intro", "(0, 1, 0)", false, "one class beats any number of elements")}
          {row("#welcome", "(1, 0, 0)", true, "one id beats any number of classes. This paragraph is red.")}
          {row('style="…" on the tag', "inline", false, "an inline style beats the id. This is why Fig 1 called it the worst place.")}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 12 : 8 }}>
          <div style={{ flex: 1, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.soft}`, borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <Label size={fs - 4} color={T.soft} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>a tie · source order</Label>
            <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft, whiteSpace: "pre", lineHeight: 1.45 }}>{"p.intro { color: blue; }\np.intro { color: green; }"}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3 }}>Same columns. The one later in the file wins. DevTools draws a line through the earlier one.</span>
          </div>
          <div style={{ flex: 1, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.red}`, borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <Label size={fs - 4} color={T.red} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>the trapdoor · !important</Label>
            <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.red, whiteSpace: "pre", lineHeight: 1.45 }}>{"p { color: green !important; }"}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.muted, lineHeight: 1.3 }}>Beats the id, the class, and another normal rule. The next override needs another !important. Leave it for a library you cannot edit.</span>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Eleven elements do not beat one class. <span style={{ color: T.heading }}>The old 1, 10, 100 shortcut breaks at ten of a kind</span>, so compare the columns and stop adding.
        </div>
      </div>
    </Frame>
  );
};
