import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #34 — the plumbing: stdout flows to the screen, through a pipe into the next command, or into a file. */
export const PipesAndRedirects: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 21 : 17;

  const node = (text: string, color: string, sub?: string, mono = true) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: wide ? "10px 16px" : "8px 10px", border: `1.5px solid ${color}`, borderRadius: 12, background: T.code, minWidth: 0 }}>
      <span style={{ fontFamily: mono ? F.mono : F.body, fontSize: fs, color: T.heading, fontWeight: 600, whiteSpace: "nowrap" }}>{text}</span>
      {sub ? <span style={{ fontFamily: F.body, fontSize: fs - 6, color: T.muted, whiteSpace: "nowrap" }}>{sub}</span> : null}
    </div>
  );
  const arrow = (label: string, color: string) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: "0 0 auto", padding: "0 4px" }}>
      <span style={{ fontFamily: F.mono, fontSize: wide ? 30 : 24, color, fontWeight: 700, lineHeight: 1 }}>{label}</span>
      <span style={{ fontFamily: F.mono, fontSize: wide ? 22 : 18, color, lineHeight: 1 }}>→</span>
    </div>
  );

  const flow = (
    <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 6, padding: wide ? "14px 18px" : "10px 12px", background: T.card, border: `1.5px solid ${T.border2}`, borderRadius: 14 }}>
      <Label size={fs - 4} color={T.muted} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>one line · ls -la | grep ".txt" &gt; text-files.txt</Label>
      <div style={{ display: "flex", alignItems: "center", gap: wide ? 10 : 6, flexWrap: wide ? "nowrap" : "wrap", justifyContent: "flex-start" }}>
        {node("ls -la", T.heading, "prints a listing")}
        {arrow("|", T.green)}
        {node('grep ".txt"', T.heading, "keeps matching lines")}
        {arrow(">", T.yellow)}
        {node("text-files.txt", T.yellow, "a file, replaced")}
      </div>
      <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.soft, lineHeight: 1.3 }}>
        Every command has a <span style={{ color: T.heading }}>standard output</span>, the text it would print. By default it goes to the screen. <span style={{ fontFamily: F.mono, color: T.green }}>|</span> sends it into the next command's <span style={{ color: T.heading }}>standard input</span> instead; <span style={{ fontFamily: F.mono, color: T.yellow }}>&gt;</span> sends it into a file. Nothing is moved or copied on disk; the text streams through memory.
      </span>
    </div>
  );

  const card = (sym: string, color: string, title: string, lines: [string, string][]) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0, padding: wide ? "12px 14px" : "8px 10px", background: T.code, border: `1.5px solid ${color}`, borderRadius: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span style={{ fontFamily: F.mono, fontSize: wide ? 30 : 24, color, fontWeight: 700 }}>{sym}</span>
        <span style={{ fontFamily: F.body, fontSize: fs - 1, color: T.heading }}>{title}</span>
      </div>
      {lines.map(([c, n]) => (
        <div key={c} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.heading, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{c}</span>
          <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted }}>{n}</span>
        </div>
      ))}
    </div>
  );

  const cards = (
    <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 14 : 8, flex: 1, minHeight: 0 }}>
      {card("|", T.green, "pipe: output becomes the next input", [
        ["history | grep mkdir", "every mkdir you ever typed"],
        ["cat notes.txt | wc -l", "count the lines"],
        ["ls -la | grep \".txt\"", "only the text files"],
      ])}
      {card(">", T.yellow, "redirect: output replaces a file", [
        ["ls -la > file-list.txt", "save the listing"],
        ["echo \"=== Log ===\" > log.txt", "start a file (wipes it first)"],
        ["ls -lR quest > report.txt", "the whole tree, on disk"],
      ])}
      {card(">>", T.greenLight, "append: output joins the end of a file", [
        ["echo \"Date: $(date)\" >> log.txt", "one more line, nothing lost"],
        ["ls -la >> log.txt", "a listing, under what was there"],
        ["history | grep cd >> moves.txt", "pipe first, then append"],
      ])}
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · Pipes and redirection" title="Session 1.2 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 14 : 8, height: "100%" }}>
        {flow}
        {cards}
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Small commands that each do one thing, <span style={{ color: T.heading }}>chained like combo attacks</span>. Read a long line from left to right and ask at every symbol: where is the text going now?
        </div>
      </div>
    </Frame>
  );
};
