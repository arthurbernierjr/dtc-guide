import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #43 — an SSH key pair: the private key never leaves ~/.ssh, the public key is pasted into GitHub, and every push is a challenge the private key answers. */
export const SshHandshake: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 22 : 18;

  const keyCard = (title: string, color: string, file: string, lines: string[], rule: string) => (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: wide ? 8 : 6, padding: wide ? "14px 18px" : "10px 12px", background: T.card, border: `1.5px solid ${color}`, borderRadius: 16 }}>
      <Label size={fs - 3} color={color} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>{title}</Label>
      <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.heading }}>{file}</span>
      <div style={{ padding: wide ? "8px 12px" : "6px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10 }}>
        {lines.map((l, i) => <div key={i} style={{ fontFamily: F.mono, fontSize: fs - 6, color: T.muted, whiteSpace: "pre", lineHeight: 1.3 }}>{l}</div>)}
      </div>
      <span style={{ fontFamily: F.body, fontSize: wide ? fs - 3 : fs - 1, color: T.soft, lineHeight: 1.3 }}>{rule}</span>
    </div>
  );

  const step = (n: string, who: string, color: string, text: string) => (
    <div style={{ display: "flex", gap: wide ? 12 : 8, alignItems: "flex-start" }}>
      <span style={{ fontFamily: F.mono, fontSize: wide ? fs - 4 : fs - 1, color: T.ink, background: color, borderRadius: 6, padding: "1px 8px", fontWeight: 700, flexShrink: 0 }}>{n}</span>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>{who}</span>
        <span style={{ fontFamily: F.body, fontSize: wide ? fs - 2 : fs + 1, color: T.soft, lineHeight: 1.3 }}>{text}</span>
      </div>
    </div>
  );

  return (
    <Frame layout={layout} caption="Fig 2 · The SSH key pair" title="Session 1.4 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 16 : 8, flexShrink: 0 }}>
          {keyCard("private key · stays on your machine", T.red, "~/.ssh/id_ed25519", ["-----BEGIN OPENSSH PRIVATE KEY-----", "b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAAB…", "-----END OPENSSH PRIVATE KEY-----"], "Never pasted, never emailed, never committed. Permissions 600: only you can read it. It is the one key that opens the padlock.")}
          {keyCard("public key · goes to GitHub", T.green, "~/.ssh/id_ed25519.pub", ["ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIK…  arthur@newworld.dev"], "One line. Safe to show anyone. Paste it under Settings → SSH and GPG keys → New SSH key. It is the padlock you hand out.")}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: wide ? 10 : 6, padding: wide ? "12px 18px" : "10px 12px", background: T.card, border: `1px solid ${T.border2}`, borderRadius: 16 }}>
          <Label size={fs - 3} color={T.yellow} style={{ letterSpacing: ".16em", textTransform: "uppercase" }}>what happens on every git push (ssh -T git@github.com shows it)</Label>
          <div style={{ display: "grid", gridTemplateColumns: wide ? "1fr 1fr" : "1fr", gap: wide ? "10px 24px" : 6, flex: 1, alignContent: wide ? "start" : "space-evenly" }}>
            {step("1", "you", T.green, "ssh connects to github.com and offers the public key's fingerprint.")}
            {step("2", "github", T.yellow, "Looks the fingerprint up in your account. Found: sends a random challenge.")}
            {step("3", "you", T.green, "The private key signs the challenge. The key itself is never sent.")}
            {step("4", "github", T.yellow, "Checks the signature with the public key. “Hi adventurer-dev! You've successfully authenticated.”")}
          </div>
          <div style={{ padding: wide ? "8px 12px" : "6px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, marginTop: "auto" }}>
            <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.soft, whiteSpace: "pre", lineHeight: 1.35 }}>{"$ ssh -T git@github.com\nHi adventurer-dev! You've successfully authenticated, but GitHub does not provide shell access."}</span>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 25 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          No password is typed and no password crosses the wire. <span style={{ color: T.heading }}>Possession of the private key is the proof.</span> Lose the laptop, delete the key from GitHub, and that laptop is locked out.
        </div>
      </div>
    </Frame>
  );
};
