import React from "react";
import { Frame, Label } from "../components/Frame";
import { F, Layout, T } from "../tokens";

const BOXES = [
  { title: ["conan", ""], kind: "instance", members: ['name "Conan"', "hp 150", "rage 20"] },
  { title: ["Warrior", ".prototype"], kind: "proto", members: ["berserk()", "attackTarget()"] },
  { title: ["Character", ".prototype"], kind: "proto", members: ["takeDamage()", "heal()", "getStatus()"] },
  { title: ["Object", ".prototype"], kind: "proto", members: ["toString()", "hasOwnProperty()"] },
];

type P = { x: number; y: number };

/** §R10 #5 — the prototype chain with two lookups walking it. */
export const OoPrototypeChain: React.FC<{ layout: Layout }> = ({ layout }) => {
  const wide = layout === "wide";
  const W = wide ? 1488 : 812;
  const H = wide ? 688 : 1012;
  const boxW = wide ? 318 : 560;
  const boxH = wide ? 300 : 150;
  const gap = wide ? 46 : 30;
  const nullR = wide ? 40 : 30;
  const startX = wide ? 0 : (W - boxW) / 2;
  const startY = wide ? 170 : 120;

  const pos: P[] = BOXES.map((_, i) => (wide ? { x: startX + i * (boxW + gap), y: startY } : { x: startX, y: startY + i * (boxH + gap) }));
  const nullPos: P = wide ? { x: pos[3].x + boxW + gap + nullR, y: startY + boxH / 2 } : { x: startX + boxW / 2, y: pos[3].y + boxH + gap + nullR };

  // Anchor points for the lookup arcs
  const topMid = (i: number): P => (wide ? { x: pos[i].x + boxW / 2, y: pos[i].y } : { x: pos[i].x, y: pos[i].y + boxH / 2 });
  const botMid = (i: number): P => (wide ? { x: pos[i].x + boxW / 2, y: pos[i].y + boxH } : { x: pos[i].x + boxW, y: pos[i].y + boxH / 2 });
  const arcUp = (a: P, b: P, lift: number) => (wide ? `M${a.x} ${a.y} C ${a.x} ${a.y - lift}, ${b.x} ${b.y - lift}, ${b.x} ${b.y}` : `M${a.x} ${a.y} C ${a.x - lift} ${a.y}, ${b.x - lift} ${b.y}, ${b.x} ${b.y}`);
  const arcDown = (a: P, b: P, lift: number) => (wide ? `M${a.x} ${a.y} C ${a.x} ${a.y + lift}, ${b.x} ${b.y + lift}, ${b.x} ${b.y}` : `M${a.x} ${a.y} C ${a.x + lift} ${a.y}, ${b.x + lift} ${b.y}, ${b.x} ${b.y}`);

  const greenPath = arcUp(topMid(0), topMid(1), wide ? 120 : 110);
  const yellowPath = arcDown(botMid(0), botMid(3), wide ? 130 : 120);

  const link = (from: P, to: P, key: React.Key) => (
    <g key={key}>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={T.soft} strokeWidth={4} strokeLinecap="round" />
      {wide ? (
        <path d={`M${to.x - 16} ${to.y - 12} L${to.x} ${to.y} L${to.x - 16} ${to.y + 12}`} stroke={T.soft} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d={`M${to.x - 12} ${to.y - 16} L${to.x} ${to.y} L${to.x + 12} ${to.y - 16}`} stroke={T.soft} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </g>
  );

  return (
    <Frame layout={layout} caption="Fig 3 · The prototype chain" title="Session 3.3 · Under the hood">
      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {pos.slice(1).map((p, i) => {
            const a = pos[i];
            const from = wide ? { x: a.x + boxW, y: a.y + boxH / 2 } : { x: a.x + boxW / 2, y: a.y + boxH };
            const to = wide ? { x: p.x, y: p.y + boxH / 2 } : { x: p.x + boxW / 2, y: p.y };
            return link(from, to, i);
          })}
          {(() => {
            const a = pos[3];
            const from = wide ? { x: a.x + boxW, y: a.y + boxH / 2 } : { x: a.x + boxW / 2, y: a.y + boxH };
            const to = wide ? { x: nullPos.x - nullR, y: nullPos.y } : { x: nullPos.x, y: nullPos.y - nullR };
            return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={T.soft} strokeWidth={4} strokeLinecap="round" />;
          })()}
          <circle cx={nullPos.x} cy={nullPos.y} r={nullR} fill={T.card} stroke={T.red} strokeWidth={3} />
          <path d={`M${nullPos.x - 12} ${nullPos.y - 12} l24 24 M${nullPos.x + 12} ${nullPos.y - 12} l-24 24`} stroke={T.red} strokeWidth={5} strokeLinecap="round" />
          <path d={greenPath} stroke={T.green} strokeWidth={5} fill="none" strokeDasharray="14 12" strokeLinecap="round" />
          <path d={yellowPath} stroke={T.yellow} strokeWidth={5} fill="none" strokeDasharray="14 12" strokeLinecap="round" />
        </svg>

        {BOXES.map((b, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: pos[i].x,
              top: pos[i].y,
              width: boxW,
              height: boxH,
              background: T.card,
              border: `2px solid ${b.kind === "instance" ? T.green : T.border2}`,
              borderRadius: 14,
              padding: wide ? "20px 22px" : "14px 22px",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: wide ? "column" : "row",
              gap: wide ? 10 : 28,
              alignItems: wide ? "stretch" : "center",
            }}
          >
            <div style={{ fontFamily: F.display, fontWeight: 600, fontSize: wide ? 40 : 36, lineHeight: 1.05, color: T.heading, minWidth: wide ? undefined : 210 }}>
              {b.title[0]}
              {b.title[1] ? <div style={{ color: T.muted, fontSize: wide ? 34 : 28 }}>{b.title[1]}</div> : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: wide ? 4 : 2, marginTop: wide ? 8 : 0 }}>
              {b.members.map((m) => (
                <Label key={m} size={wide ? 34 : 30} color={T.soft}>{m}</Label>
              ))}
            </div>
          </div>
        ))}

        {/* null label */}
        <Label size={wide ? 34 : 30} color={T.red} style={{ position: "absolute", left: wide ? nullPos.x - 60 : nullPos.x + nullR + 18, top: wide ? nullPos.y + nullR + 16 : nullPos.y - 18, whiteSpace: "nowrap" }}>
          {wide ? "null · the chain ends" : "null"}
        </Label>

        {/* lookup labels */}
        <div style={{ position: "absolute", left: wide ? pos[0].x + boxW / 2 + 20 : 0, top: wide ? pos[0].y - 150 : 0, display: "flex", flexDirection: "column", gap: 4 }}>
          <Label size={wide ? 36 : 32} color={T.green}>conan.berserk()</Label>
          <Label size={wide ? 32 : 28} color={T.soft}>found one hop up ✓</Label>
        </div>
        <div style={{ position: "absolute", left: wide ? pos[1].x + boxW / 2 : undefined, right: wide ? undefined : 0, top: wide ? pos[0].y + boxH + 96 : 0, display: "flex", flexDirection: "column", gap: 4, alignItems: wide ? "flex-start" : "flex-end" }}>
          <Label size={wide ? 36 : 32} color={T.yellow}>conan.toString()</Label>
          <Label size={wide ? 32 : 28} color={T.soft}>walks to the top, found ✓</Label>
        </div>

        <Label size={wide ? 30 : 26} color={T.muted} style={{ position: "absolute", right: wide ? 0 : undefined, left: wide ? undefined : 0, top: wide ? 0 : undefined, bottom: wide ? undefined : 0, textAlign: wide ? "right" : "left", whiteSpace: "nowrap" }}>
          every grey arrow is the hidden [[Prototype]] link{wide ? "" : " · the chain ends at null"}
        </Label>
      </div>
    </Frame>
  );
};
