"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const MAX = 8;
// A 4 × 3 grid of heap spots, handed out in a zigzag so it looks scattered but stays readable.
const SPOTS = [4, 1, 6, 3, 11, 9, 8, 10, 0, 2, 5, 7];
const JITTER = [0, 3, -2, 4, -3, 2, -4, 1, 3, -2, 2, -1];
const spotXY = (s: number) => ({
  left: `${4 + (s % 4) * 24 + JITTER[s]}%`,
  top: `${6 + Math.floor(s / 4) * 31 + JITTER[(s + 5) % 12]}%`,
});
const hex = (n: number) => `0x${(0x300 + ((n * 0x1a8 + 0x40) % 0x900)).toString(16).toUpperCase()}`;

type Node = { v: number; spot: number; addr: string };

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const heapRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([
    { v: 7, spot: SPOTS[0], addr: hex(0) },
    { v: 19, spot: SPOTS[1], addr: hex(1) },
  ]);
  const [val, setVal] = useState("33");
  const [paths, setPaths] = useState<string[]>([]);
  const [walk, setWalk] = useState(0);
  const [msg, setMsg] = useState("");

  // Recompute arrows whenever the list or the layout changes.
  useLayoutEffect(() => {
    const heap = heapRef.current;
    if (!heap) return;
    const measure = () => {
      const h = heap.getBoundingClientRect();
      const rel = (b: Element) => {
        const r = b.getBoundingClientRect();
        return { x: r.left - h.left, y: r.top - h.top, w: r.width, h: r.height };
      };
      const boxes = Array.from(heap.querySelectorAll(".lnode__box")).map(rel);
      const nexts = Array.from(heap.querySelectorAll(".lnode__next")).map(rel);
      type Box = (typeof boxes)[number];
      const edge = (r: Box, from: { x: number; y: number }) => {
        const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
        const dx = from.x - c.x;
        const dy = from.y - c.y;
        const f = Math.min(r.w / 2 / Math.abs(dx || 1e-6), r.h / 2 / Math.abs(dy || 1e-6));
        return { x: c.x + dx * f, y: c.y + dy * f };
      };
      setPaths(
        boxes.slice(1).map((b, k) => {
          const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
          // Pointing left? Leave from the node's outer edge so the arrow doesn't cross its own data.
          const s = edge(c.x < nexts[k].x ? boxes[k] : nexts[k], c);
          const e = edge(b, s);
          return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
        }),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [nodes]);

  const append = () => {
    const v = Number(val);
    if (!Number.isInteger(v) || Math.abs(v) > 999) return setMsg("Type a whole number between -999 and 999.");
    if (nodes.length >= MAX) return setMsg(`This heap only has room for ${MAX} nodes here. Clear it and start again.`);
    const used = new Set(nodes.map((n) => n.spot));
    const spot = SPOTS.find((s) => !used.has(s))!;
    const addr = hex(nodes.length);
    setNodes([...nodes, { v, spot, addr }]);
    setMsg(
      nodes.length === 0
        ? `new Node at ${addr}. The list was empty, so head = ${addr}.`
        : `new Node at ${addr}. tail->next = ${addr}, then tail moves to it.`,
    );
    setVal(String(((v * 7 + 11) % 90) + 10));
  };

  // New node pops in; its incoming arrow draws.
  useGSAP(
    () => {
      const last = heapRef.current?.querySelector(".lnode:last-of-type");
      if (last) gsap.from(last, { scale: 0.5, autoAlpha: 0, duration: 0.35, ease: "back.out(2)" });
      const arrow = heapRef.current?.querySelector(".pll__arrow:last-of-type");
      if (arrow) gsap.fromTo(arrow, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.35, delay: 0.15 });
    },
    { scope: ref, dependencies: [nodes.length] },
  );

  // Traverse: the t badge hops along the arrows.
  useGSAP(
    () => {
      if (walk === 0) return;
      const heap = heapRef.current!;
      const badge = heap.querySelector<HTMLElement>(".lbadge--t")!;
      const out = ref.current!.querySelectorAll<HTMLElement>(".pll__out span");
      const boxes = Array.from(heap.querySelectorAll<HTMLElement>(".lnode__box"));
      const h = heap.getBoundingClientRect();
      const at = (b: HTMLElement) => {
        const r = b.getBoundingClientRect();
        return { left: r.left - h.left + 76, top: r.top - h.top + r.height + 4 };
      };
      const tl = gsap.timeline();
      tl.set(out, { autoAlpha: 0 });
      boxes.forEach((b, k) => {
        tl.set(badge, { ...at(b), autoAlpha: 1 }, k === 0 ? 0 : undefined)
          .to(b, { backgroundColor: "#f1cf3b", duration: 0.12 })
          .to(out[k], { autoAlpha: 1, duration: 0.1 }, "<")
          .to(b, { backgroundColor: "#f8f4ea", duration: 0.3 }, "+=0.2");
      });
      tl.to(out[out.length - 1], { autoAlpha: 1, duration: 0.1 }).to(badge, { autoAlpha: 0, duration: 0.2 }, "+=0.2");
    },
    { scope: ref, dependencies: [walk], revertOnUpdate: true },
  );

  return (
    <section className="block pg pll" ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>Grow a list on the heap</h2>
      </div>

      <div className="spg__bar">
        <div className="pg__controls pll__add">
          <label className="pg__label" htmlFor="pll-v">
            data
          </label>
          <input
            id="pll-v"
            className="pg__input"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && append()}
            inputMode="numeric"
          />
          <button className="btn" onClick={append}>
            Append
          </button>
        </div>
        <button className="btn btn--ghost" onClick={() => setWalk((w) => w + 1)} disabled={nodes.length === 0}>
          Traverse
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => {
            setNodes([]);
            setMsg("All nodes gone: head = NULL.");
          }}
        >
          Clear
        </button>
      </div>
      <p className="pg__err" aria-live="polite">
        {msg || "Each new node lands wherever the heap has room. Only the arrows keep the order."}
      </p>

      <div className="pll__stage">
        <div className="pll__head">
          <span>head</span>
          <b>{nodes[0]?.addr ?? "NULL"}</b>
        </div>
        <div className="pll__heap" ref={heapRef}>
          <svg className="larrows" aria-hidden>
            <defs>
              <marker id="pll-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#1b1915" />
              </marker>
            </defs>
            {paths.map((d, k) => (
              <path key={`${k}-${d}`} className="larrow pll__arrow" d={d} markerEnd="url(#pll-head)" />
            ))}
          </svg>
          {nodes.map((n, k) => (
            <div className="lnode" key={n.addr} style={spotXY(n.spot)}>
              <span className="lnode__addr">
                {n.addr}
                {k === 0 && <em className="pll__tag">head</em>}
                {k === nodes.length - 1 && <em className="pll__tag pll__tag--tail">tail</em>}
              </span>
              <div className="lnode__box">
                <span className="lnode__f lnode__data">{n.v}</span>
                <span className="lnode__f lnode__next">
                  {k < nodes.length - 1 ? <b className="lnode__to">{nodes[k + 1].addr}</b> : <em className="lnode__null">NULL</em>}
                </span>
              </div>
            </div>
          ))}
          <span className="lbadge lbadge--t" style={{ opacity: 0, visibility: "hidden" }}>
            t
          </span>
        </div>
        <p className="pll__out term">
          {nodes.map((n) => (
            <span key={n.addr}>{n.v} -&gt; </span>
          ))}
          <span>NULL</span>
        </p>
      </div>
    </section>
  );
}
