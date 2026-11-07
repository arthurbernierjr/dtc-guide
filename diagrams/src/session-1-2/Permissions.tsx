import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #36 — -rw-r--r-- taken apart: three triads, chmod +x, and the number system. */
export const Permissions: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 21 : 17;

  const triad = (who: string, bits: string, color: string, meaning: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: wide ? "10px 16px" : "8px 10px", border: `1.5px solid ${color}`, borderRadius: 12, background: T.code, flex: 1, minWidth: 0 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 7, color, letterSpacing: ".16em", textTransform: "uppercase" }}>{who}</span>
      <span style={{ fontFamily: F.mono, fontSize: wide ? 40 : 30, color: T.heading, fontWeight: 700, letterSpacing: ".08em" }}>{bits}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, textAlign: "center" }}>{meaning}</span>
    </div>
  );

  const stringBox = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 6, padding: wide ? "14px 18px" : "10px 12px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>the permission string · -rw-r--r-- · one type character, then three groups of three</Label>
      <div style={{ display: "flex", gap: wide ? 12 : 6, alignItems: "stretch" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: wide ? "10px 14px" : "8px 8px", border: `1.5px solid ${T.yellow}`, borderRadius: 12, background: T.code, flex: "0 0 auto" }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 7, color: T.yellow, letterSpacing: ".16em", textTransform: "uppercase" }}>type</span>
          <span style={{ fontFamily: F.mono, fontSize: wide ? 40 : 30, color: T.heading, fontWeight: 700 }}>-</span>
          <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>- file · d dir</span>
        </div>
        {triad("owner · u", "rw-", T.green, "read and write, cannot run")}
        {triad("group · g", "r--", T.greenLight, "read only")}
        {triad("others · o", "r--", T.heading, "read only")}
      </div>
      <div style={{ display: "flex", gap: wide ? 24 : 12, flexWrap: "wrap" }}>
        {[["r", "read · see the contents"], ["w", "write · change it"], ["x", "execute · run it as a program"], ["-", "not allowed"]].map(([k, v]) => (
          <span key={k} style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft }}><span style={{ fontFamily: F.mono, color: T.heading, fontWeight: 700 }}>{k}</span> {v}</span>
        ))}
      </div>
    </div>
  );

  const before = "-rw-r--r--", after = "-rwxr-xr-x";
  const chmodBox = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 16px" : "8px 12px", background: T.code, border: `1.5px solid ${T.green}`, borderRadius: 12, flex: 1, minWidth: 0 }}>
      <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>chmod +x · the one you need this week</Label>
      <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading }}><span style={{ color: T.greenLight }}>$</span> ./quest-start.sh</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.red }}>bash: ./quest-start.sh: Permission denied</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading }}><span style={{ color: T.greenLight }}>$</span> chmod +x quest-start.sh</span>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: F.mono, fontSize: fs + 2, color: T.muted }}>{before}</span>
        <span style={{ fontFamily: F.mono, fontSize: fs + 2, color: T.green }}>→</span>
        <span style={{ fontFamily: F.mono, fontSize: fs + 2, color: T.heading }}>{after.split("").map((ch, i) => <span key={i} style={{ color: ch === "x" ? T.greenLight : T.heading, fontWeight: ch === "x" ? 700 : 400 }}>{ch}</span>)}</span>
      </div>
      <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.heading }}><span style={{ color: T.greenLight }}>$</span> ./quest-start.sh</span>
      <span style={{ fontFamily: F.mono, fontSize: fs - 1, color: T.soft }}>=== QUEST LOG ===</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3 }}>Three <span style={{ fontFamily: F.mono, color: T.greenLight }}>x</span> appeared, one per group: <span style={{ fontFamily: F.mono }}>+x</span> with no letter in front means everyone. <span style={{ fontFamily: F.mono }}>u+x</span> would give it to the owner only.</span>
    </div>
  );

  const numbers = (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: wide ? "12px 16px" : "8px 12px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 12, flex: wide ? "0 0 560px" : "0 0 auto", minWidth: 0 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>the number system · r=4 w=2 x=1, added up per group</Label>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: wide ? "6px 16px" : "4px 10px", alignItems: "baseline" }}>
        {[["rwx", "7", "4+2+1"], ["rw-", "6", "4+2"], ["r-x", "5", "4+1"], ["r--", "4", "4"]].map(([b, n, s]) => (
          <React.Fragment key={b}>
            <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading }}>{b}</span>
            <span style={{ fontFamily: F.mono, fontSize: fs, color: T.yellow, fontWeight: 700 }}>{n}</span>
            <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.muted }}>{s}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ height: 1, background: T.border2 }} />
      <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: wide ? "6px 16px" : "4px 10px", alignItems: "baseline" }}>
        {[["755", "rwxr-xr-x", "scripts and folders"], ["644", "rw-r--r--", "ordinary files"], ["700", "rwx------", "private: owner only"]].map(([n, b, s]) => (
          <React.Fragment key={n}>
            <span style={{ fontFamily: F.mono, fontSize: fs, color: T.yellow, fontWeight: 700 }}>{n}</span>
            <span style={{ fontFamily: F.mono, fontSize: fs, color: T.heading }}>{b}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted }}>{s}</span>
          </React.Fragment>
        ))}
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3 }}><span style={{ fontFamily: F.mono, color: T.heading }}>chmod 755 script.sh</span> and <span style={{ fontFamily: F.mono, color: T.heading }}>chmod +x script.sh</span> usually land in the same place. Learn <span style={{ fontFamily: F.mono }}>+x</span> first; the numbers come when you meet them in a tutorial.</span>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 5 · Who may read, write, run" title="Session 1.2 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 8, height: "100%" }}>
        {stringBox}
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 18 : 8, flex: 1, minHeight: 0 }}>
          {chmodBox}
          {numbers}
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A new file is never executable. <span style={{ color: T.heading }}>Permission denied on a script you just wrote means one thing: you have not run <span style={{ fontFamily: F.mono }}>chmod +x</span> yet.</span>
        </div>
      </div>
    </Frame>
  );
};
