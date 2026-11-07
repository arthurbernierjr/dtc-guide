import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #51 — a form is wired, not drawn: label.for matches input.id, the type picks the keyboard and the check, fieldset groups them, and required is the browser refusing an empty submit. */
export const FormWiring: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 18;
  const row = (label: string, id: string, control: string, note: string) => (
    <div key={id} style={{ display: "grid", gridTemplateColumns: wide ? "150px 28px 1fr 1.2fr" : "1fr", gap: wide ? 10 : 2, alignItems: "center", padding: wide ? "8px 12px" : "8px 10px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10 }}>
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.yellow }}>{label}</span>
      {wide ? <span style={{ fontFamily: F.mono, fontSize: fs - 2, color: T.greenLight, textAlign: "center" }}>↔</span> : null}
      <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.greenLight }}>{control}</span>
      <span style={{ fontFamily: F.body, fontSize: fs - 5, color: T.muted, lineHeight: 1.25 }}>{note}</span>
    </div>
  );
  return (
    <Frame layout={layout} caption="Fig 5 · A form is a set of matching names" title="Session 2.1 · The demonstration">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 10 : 8, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: wide ? 8 : 6, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.green}`, borderRadius: 14, flexShrink: 0 }}>
          <Label size={fs - 4} color={T.green} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>the one rule · for and id are the same string</Label>
          {row('label for="email"', "email", '<input id="email" type="email">', "clicking the words focuses the box; a screen reader reads the words as the box's name")}
          {row('label for="class"', "class", '<select id="class">', "a dropdown is still a labelled control")}
          {row('label for="bio"', "bio", '<textarea id="bio">', "many lines, one name")}
          {row('label for="terms"', "terms", '<input id="terms" type="checkbox">', "the label sits after a checkbox, and the wiring is identical")}
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 12 : 8 }}>
          <div style={{ flex: 1, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.yellow}`, borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <Label size={fs - 4} color={T.yellow} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>type does two jobs</Label>
            <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.soft, lineHeight: 1.45, whiteSpace: "pre" }}>{"text      letters, any of them\nemail     must contain an @\ntel       a phone keyboard\nurl       must look like one\npassword  dots, not hidden from you\ndate      a calendar\nradio     one of a group, same name"}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3, marginTop: "auto" }}>The type picks the keyboard on a phone and the check the browser runs. You do not write that check.</span>
          </div>
          <div style={{ flex: 1, padding: wide ? "12px 14px" : "10px 12px", background: T.card, border: `1.5px solid ${T.red}`, borderRadius: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <Label size={fs - 4} color={T.red} style={{ letterSpacing: ".14em", textTransform: "uppercase" }}>required · the browser refuses</Label>
            <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: T.soft, whiteSpace: "pre", lineHeight: 1.45 }}>{"<input id=\"email\" type=\"email\"\n       required>"}</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 3, color: T.heading, lineHeight: 1.3 }}>Please fill out this field.</span>
            <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.muted, lineHeight: 1.3, marginTop: "auto" }}>An empty required field never leaves the browser. The message is the browser's, in the reader's language. placeholder is not a label, and it vanishes the moment they type.</span>
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 24 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          Wrap the groups in <span style={{ fontFamily: F.mono, color: T.greenLight }}>fieldset</span> with a <span style={{ fontFamily: F.mono, color: T.greenLight }}>legend</span>. <span style={{ color: T.heading }}>A form that a label-click does not focus has a for and an id that disagree</span>, and that is the bug to look for first.
        </div>
      </div>
    </Frame>
  );
};
