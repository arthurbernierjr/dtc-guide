import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #45 — a pull request end to end on your own repo (branch, push, open, review, merge, pull main) and the fork variant for a repo you cannot push to. */
export const PullRequestFlow: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 17;

  const stage = (n: number, where: "terminal" | "github", cmd: string, what: string) => {
    const color = where === "terminal" ? T.green : T.yellow;
    return (
      <div key={n} style={{ display: "flex", gap: wide ? 10 : 8, alignItems: "flex-start", flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.ink, background: color, borderRadius: 6, padding: "1px 7px", fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{n}</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ fontFamily: F.body, fontSize: fs - 6, color, letterSpacing: ".12em", textTransform: "uppercase" }}>{where}</span>
          <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading, lineHeight: 1.25 }}>{cmd}</span>
          <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.25 }}>{what}</span>
        </div>
      </div>
    );
  };

  const graph = (
    <div style={{ padding: wide ? "8px 12px" : "6px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10 }}>
      {[
        { t: "*   cba34f8 (HEAD -> main, origin/main) Merge pull request #1 from adventurer-dev/add-achievements", c: T.greenLight },
        { t: "|\\", c: T.muted },
        { t: "| * df710b0 Add achievements tracker", c: T.yellow },
        { t: "|/", c: T.muted },
        { t: "* 0df70ce Initial commit: add README", c: T.soft },
      ].map((l, i) => <div key={i} style={{ fontFamily: F.mono, fontSize: fs - 5, color: l.c, whiteSpace: "pre", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis" }}>{l.t}</div>)}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 4 · A pull request, end to end" title="Session 1.4 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14, flexShrink: 0 }}>
          <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>your own repository · a branch asks to join main</Label>
          <div style={{ display: "grid", gridTemplateColumns: wide ? "repeat(3, 1fr)" : "1fr", gap: wide ? "12px 20px" : 8 }}>
            {stage(1, "terminal", "git checkout -b add-achievements", "work on a branch, commit as usual")}
            {stage(2, "terminal", "git push -u origin add-achievements", "the branch appears on GitHub")}
            {stage(3, "github", "Compare & pull request", "title, description: what and why")}
            {stage(4, "github", "Files changed · Conversation", "the review: the diff, line comments, approval")}
            {stage(5, "github", "Merge pull request → Confirm", "GitHub makes the merge commit on origin/main")}
            {stage(6, "terminal", "git checkout main && git pull", "bring the merge down; delete the branch")}
          </div>
          {graph}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: wide ? 8 : 6, padding: wide ? "12px 16px" : "10px 12px", background: T.card, border: `1.5px solid ${T.yellow}`, borderRadius: 14 }}>
          <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>someone else's repository · fork first, then the same flow</Label>
          <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 8 : 6, alignItems: wide ? "center" : "stretch", flex: 1, justifyContent: wide ? "flex-start" : "space-evenly" }}>
            {[
              ["newworld-guild/quest-board", "theirs: git push is denied", T.red],
              ["Fork → adventurer-dev/quest-board", "yours: a copy under your name", T.yellow],
              ["clone · branch · push · open PR", "the PR targets the original (upstream)", T.green],
              ["maintainers review and merge", "you cannot press Merge there, and that is the point", T.soft],
            ].map(([k, v, c], i, arr) => (
              <React.Fragment key={k}>
                <div style={{ flex: wide ? 1 : "0 0 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 2, padding: wide ? "10px 12px" : "10px 12px", background: T.code, border: `1px solid ${c}`, borderRadius: 10 }}>
                  <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: c, fontWeight: 700, lineHeight: 1.25 }}>{k}</span>
                  <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.25 }}>{v}</span>
                </div>
                {i < arr.length - 1 ? <span style={{ color: T.muted, fontSize: fs, flexShrink: 0, alignSelf: "center" }}>{wide ? "▶" : "▼"}</span> : null}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 24 : 20, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A pull request is <span style={{ color: T.heading }}>a conversation about a branch</span>, held on GitHub, that ends in a merge commit. The git underneath is Session 1.3's merge; the review is the new part.
        </div>
      </div>
    </Frame>
  );
};
