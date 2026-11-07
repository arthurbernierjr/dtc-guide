import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #65 — BEM: one block, its elements named with __, its variants named with --. Every selector is a single class, so specificity stays one column. */
export const BemCard: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 17 : 16;
  const tag = (name: string, kind: "block" | "element" | "modifier") => {
    const color = kind === "block" ? T.green : kind === "element" ? T.yellow : T.soft;
    return (
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color, fontWeight: 700 }}>{name}</span>
    );
  };
  return (
    <Frame layout={layout} caption="Fig 4 · Block, element, modifier" title="Session 2.4 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 10, flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1.15, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "14px 16px" : "12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {tag(".quest-card.quest-card--featured", "block")}
            </div>
            <div style={{ alignSelf: "flex-start", padding: "3px 8px", borderRadius: 999, background: T.yellow }}>
              <span style={{ fontFamily: F.mono, fontSize: fs - 5, color: T.ink, fontWeight: 700 }}>.quest-card__badge--legendary</span>
            </div>
            <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading }}>.quest-card__title</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.soft }}>.quest-card__description</span>
            <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {tag(".quest-card__reward", "element")}
              <span style={{ padding: "6px 10px", borderRadius: 8, background: T.green, fontFamily: F.mono, fontSize: fs - 4, color: T.ink, fontWeight: 700 }}>.quest-card__button</span>
            </div>
          </div>
          <div style={{ flex: 0.9, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            <div style={{ padding: "10px 12px", background: T.code, borderLeft: `3px solid ${T.green}`, borderRadius: 8 }}>
              <Label size={fs - 5} color={T.green} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>block</Label>
              <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.3 }}>.quest-card stands alone. The modifier .quest-card--featured is the same block, varied.</span>
            </div>
            <div style={{ padding: "10px 12px", background: T.code, borderLeft: `3px solid ${T.yellow}`, borderRadius: 8 }}>
              <Label size={fs - 5} color={T.yellow} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>element · __</Label>
              <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.3 }}>.quest-card__title belongs to the card. It is not a .title that any other block might already own.</span>
            </div>
            <div style={{ padding: "10px 12px", background: T.code, borderLeft: `3px solid ${T.soft}`, borderRadius: 8 }}>
              <Label size={fs - 5} color={T.soft} style={{ letterSpacing: ".12em", textTransform: "uppercase" }}>modifier · --</Label>
              <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.3 }}>A variant, not a new component. One class, so the specificity column stays at a single class.</span>
            </div>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 23 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Two underscores mean "part of." Two hyphens mean "a version of." <span style={{ color: T.heading }}>Nothing is nested, so nothing has to outrank a descendant.</span>
        </div>
      </div>
    </Frame>
  );
};
