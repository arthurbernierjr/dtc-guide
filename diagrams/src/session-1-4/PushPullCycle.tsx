import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #44 — the daily loop (pull, edit, add, commit, push) and the one time it refuses: someone pushed first, so the remote is ahead and git says "fetch first". */
export const PushPullCycle: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 23 : 18;

  const steps: { cmd: string; what: string; color: string }[] = [
    { cmd: "git pull", what: "start the day in sync with origin", color: T.yellow },
    { cmd: "edit", what: "do the work in the working directory", color: T.soft },
    { cmd: "git add", what: "choose what goes in the next save", color: T.green },
    { cmd: "git commit", what: "the save point, local only", color: T.green },
    { cmd: "git push", what: "send the new commits to origin", color: T.green },
  ];

  const chip = (s: { cmd: string; what: string; color: string }, i: number) => (
    <div key={s.cmd} style={{ display: "flex", alignItems: "center", gap: wide ? 10 : 8, flex: wide ? 1 : "0 0 auto", minWidth: 0 }}>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2, padding: wide ? "10px 12px" : "8px 10px", background: T.card, border: `1.5px solid ${s.color}`, borderRadius: 12 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: s.color, fontWeight: 700, whiteSpace: "nowrap" }}>{s.cmd}</span>
        <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.25 }}>{s.what}</span>
      </div>
      {i < steps.length - 1 ? <span style={{ color: T.muted, fontSize: fs + 2, flexShrink: 0 }}>{wide ? "▶" : "▼"}</span> : null}
    </div>
  );

  const out = (lines: { t: string; c?: string }[]) => (
    <div style={{ padding: wide ? "8px 12px" : "6px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10 }}>
      {lines.map((l, i) => <div key={i} style={{ fontFamily: F.mono, fontSize: fs - 5, color: l.c || T.soft, whiteSpace: "pre", lineHeight: 1.3 }}>{l.t}</div>)}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · The push and pull loop" title="Session 1.4 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 6 : 4, alignItems: wide ? "stretch" : "stretch", flexShrink: 0 }}>
          {steps.map(chip)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, paddingLeft: 6 }}>
          <span style={{ color: T.yellow, fontSize: fs + 2 }}>↺</span>
          <span style={{ fontFamily: F.body, fontSize: fs - 2, color: T.muted }}>…and tomorrow starts with <span style={{ fontFamily: F.mono, color: T.yellow }}>git pull</span> again. Pull is fetch (bring their commits down) plus merge (join them to yours).</span>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 8 }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.red}`, borderRadius: 14 }}>
            <Label size={fs - 4} color={T.red} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>the one refusal · a teammate pushed first</Label>
            {out([{ t: "$ git push" }, { t: " ! [rejected]        main -> main (fetch first)", c: T.red }, { t: "hint: Updates were rejected because the remote contains work", c: T.muted }, { t: "hint: that you do not have locally.", c: T.muted }])}
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.3 }}>origin/main moved while you worked. Git will not overwrite their commit with yours. It is not an error in your work; it is the remote being ahead.</span>
            {out([{ t: "origin/main   A ── B   (teammate: Mark the treasure)", c: T.yellow }, { t: "your main     A ── C   (you: Warn about dragons)", c: T.greenLight }, { t: "B is not an ancestor of C, so C cannot simply replace B", c: T.muted }])}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14 }}>
            <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>the fix · pull, resolve if asked, push again</Label>
            {out([{ t: "$ git pull" }, { t: "Auto-merging map.txt", c: T.greenLight }, { t: "$ git push" }, { t: "   e4973aa..7185545  main -> main", c: T.greenLight }])}
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.3 }}>Pull makes a merge commit joining both sides (Session 1.3's three-way merge). If you both touched the same lines, you resolve the markers, commit, then push.</span>
            {out([{ t: "after pull    A ── B ──┐", c: T.yellow }, { t: "              └─── C ──┴── M   (M has parents C and B)", c: T.greenLight }, { t: "after push    origin/main = M; everyone has everything", c: T.muted }])}
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          <span style={{ color: T.heading }}>Pull before you push; push before you stop.</span> The remote is where the team meets, so the loop always closes there.
        </div>
      </div>
    </Frame>
  );
};
