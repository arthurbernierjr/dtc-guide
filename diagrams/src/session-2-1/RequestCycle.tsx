import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

/** §R10 #47 — what happens between pressing Enter and seeing a page: name lookup, then one HTTP request, then one response that is an HTML file, then the browser fetches what that file points at and paints. */
export const RequestCycle: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const fs = wide ? 20 : 18;
  const steps: { n: string; who: string; color: string; title: string; text: string; eg: string }[] = [
    { n: "1", who: "you", color: T.green, title: "the address", text: "You type a URL. The host name is a name, not a place, so it has to be looked up.", eg: "adventurer.dev/index.html" },
    { n: "2", who: "dns", color: T.yellow, title: "the name becomes an address", text: "A resolver walks root, then the top-level domain, then the site's own nameserver, and comes back with an IP.", eg: "→ 203.0.113.10" },
    { n: "3", who: "browser", color: T.green, title: "the request", text: "A method, a path, the host, the language you read, and which formats you accept.", eg: "GET /index.html" },
    { n: "4", who: "server", color: T.yellow, title: "the response", text: "A status and headers, then the body: the HTML file. Nothing is drawn yet.", eg: "200 OK" },
    { n: "5", who: "browser", color: T.green, title: "the render", text: "Parse the file into a tree, fetch the CSS, images and scripts it names, and paint.", eg: "tree, then pixels" },
  ];
  return (
    <Frame layout={layout} caption="Fig 1 · The request, then the page" title="Session 2.1 · The idea">
      <div style={{ display: "flex", flexDirection: "column", gap: wide ? 12 : 10, height: "100%" }}>
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", gap: wide ? 10 : 8, flex: 1, minHeight: 0 }}>
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6, padding: wide ? "12px 12px" : "10px 12px", background: T.card, border: `1.5px solid ${s.color}`, borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.ink, background: s.color, borderRadius: 6, padding: "1px 8px", fontWeight: 700 }}>{s.n}</span>
                  <span style={{ fontFamily: F.body, fontSize: fs - 6, color: s.color, letterSpacing: ".12em", textTransform: "uppercase" }}>{s.who}</span>
                </div>
                <span style={{ fontFamily: F.mono, fontSize: wide ? fs - 2 : fs - 1, color: T.heading, lineHeight: 1.25 }}>{s.title}</span>
                <span style={{ fontFamily: F.mono, fontSize: fs - 3, color: s.color, fontWeight: 700 }}>{s.eg}</span>
                <span style={{ fontFamily: F.body, fontSize: fs - 4, color: T.soft, lineHeight: 1.3 }}>{s.text}</span>
              </div>
              {i < steps.length - 1 ? <span style={{ color: T.muted, fontSize: fs, alignSelf: "center", flexShrink: 0 }}>{wide ? "▶" : "▼"}</span> : null}
            </React.Fragment>
          ))}
        </div>
        <div style={{ padding: wide ? "10px 14px" : "8px 12px", background: T.code, border: `1px solid ${T.border2}`, borderRadius: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, fontSize: fs - 4, color: T.soft, whiteSpace: "pre", lineHeight: 1.4 }}>{"GET /index.html HTTP/1.1          →\nHost: adventurer.dev\n                                   ←  200 OK\n                                   ←  content-type: text/html\n                                   ←  <!DOCTYPE html> …"}</span>
        </div>
        <div style={{ fontFamily: F.body, fontSize: wide ? 24 : 21, lineHeight: 1.3, color: T.soft, flexShrink: 0 }}>
          A web page is not a place you visit. It is <span style={{ color: T.heading }}>a file a server sent because you asked</span>, and the browser is the program that turns that file into what you see.
        </div>
      </div>
    </Frame>
  );
};
