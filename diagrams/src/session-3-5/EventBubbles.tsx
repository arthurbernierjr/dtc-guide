import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #20 — a click bubbles up the tree; one listener on the parent hears every child, including children that do not exist yet. */
export const EventBubbles: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 23 : 21;

  const box = (label: string, color: string, children?: React.ReactNode, opts: { dashed?: boolean; listener?: string; pad?: string } = {}) => (
    <div
      style={{
        position: "relative",
        border: `2px ${opts.dashed ? "dashed" : "solid"} ${color}`,
        borderRadius: 16,
        padding: opts.pad || (wide ? "52px 18px 18px" : "46px 14px 14px"),
        display: "flex",
        flexDirection: "column",
        gap: wide ? 12 : 10,
        flex: 1,
        boxSizing: "border-box",
        background: opts.dashed ? "transparent" : `rgb(${color === T.green ? T.rgb.green : color === T.yellow ? T.rgb.yellow : color === T.red ? T.rgb.red : "255 255 255"} / .04)`,
      }}
    >
      <Label size={fs} color={color} style={{ position: "absolute", top: 14, left: 18, whiteSpace: "nowrap" }}>
        {label}
      </Label>
      {opts.listener ? (
        <span style={{ position: "absolute", top: 10, right: 16, fontFamily: F.mono, fontSize: fs - 3, color: T.ink, background: T.green, borderRadius: 999, padding: "5px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>{opts.listener}</span>
      ) : null}
      {children}
    </div>
  );

  const li = (text: string, hot = false, ghost = false) => (
    <div
      key={text}
      style={{
        fontFamily: F.mono,
        fontSize: fs - 1,
        color: ghost ? T.muted : hot ? T.ink : T.heading,
        background: hot ? T.yellow : T.card,
        border: `1.5px ${ghost ? "dashed" : "solid"} ${hot ? T.yellow : ghost ? T.yellow : T.border2}`,
        borderRadius: 10,
        padding: wide ? "9px 14px" : "8px 12px",
        whiteSpace: "nowrap",
        fontWeight: hot ? 600 : 400,
        display: "flex",
        justifyContent: "space-between",
        gap: 14,
      }}
    >
      <span>{text}</span>
      {hot ? <span>← click · event.target</span> : ghost ? <span>added later · still heard</span> : null}
    </div>
  );

  const tree = box(
    "document",
    T.muted,
    box(
      "body",
      T.muted,
      box("ul  #quest-list", T.green, <>{li("li  Defeat the Goblin King")}{li("li  Find the Lost Artifact", true)}{li("li  Save the Village")}{li("li  Slay the Dragon", false, true)}</>, {
        listener: 'addEventListener("click", …)  × 1',
      }),
    ),
  );

  const path = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, flex: wide ? "0 0 520px" : "0 0 auto" }}>
      <Label size={wide ? 26 : 23} color={T.yellow} style={{ letterSpacing: ".18em", textTransform: "uppercase" }}>the click bubbles up</Label>
      {[
        { at: "li", what: "where the click landed · event.target", color: T.yellow },
        { at: "ul  #quest-list", what: "the one listener fires here · event.currentTarget", color: T.green },
        { at: "body", what: "keeps rising", color: T.muted },
        { at: "document", what: "and out", color: T.muted },
      ].map((s, i, arr) => (
        <div key={s.at} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "2px 14px", padding: wide ? "9px 14px" : "8px 12px", background: T.card, border: `1.5px solid ${s.color === T.muted ? T.border2 : s.color}`, borderRadius: 12 }}>
            <Label size={fs} color={s.color === T.muted ? T.heading : s.color}>{s.at}</Label>
            <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.muted, whiteSpace: "nowrap", textAlign: "right" }}>{s.what}</span>
          </div>
          {i < arr.length - 1 ? <div style={{ alignSelf: "center", width: 2, height: wide ? 10 : 8, background: T.border2 }} /> : null}
        </div>
      ))}
      <div style={{ marginTop: wide ? 8 : 4, padding: wide ? "12px 14px" : "10px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 12, fontFamily: F.mono, fontSize: fs - 2, color: T.soft, lineHeight: 1.45, whiteSpace: "pre" }}>
        {'questList.addEventListener("click", (event) => {\n  if (event.target.matches("li")) {\n    event.target.classList.toggle("highlight");\n  }\n});'}
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 4 · Event delegation" title="Session 3.5 · Events">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 16 : 12, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 36 : 16, flex: 1, minHeight: 0 }}>
          {tree}
          {path}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 27 : 24, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          One listener on the parent instead of one per child. <span style={{ color: T.heading }}>A listener only knows the elements that existed when it was attached</span>, so the dashed item added later would be deaf with per-item listeners. The parent hears it anyway.
        </div>
      </div>
    </Frame>
  );
};
