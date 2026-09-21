"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { linkPath, mid, relRect, type Rect } from "@/components/lesson/kit";

const MAX = 8;
const SPOTS = [4, 1, 6, 3, 11, 9, 8, 10, 0, 2, 5, 7];
const JITTER = [0, 3, -2, 4, -3, 2, -4, 1, 3, -2, 2, -1];
const spotXY = (s: number) => ({
  left: `${4 + (s % 4) * 24 + JITTER[s]}%`,
  top: `${6 + Math.floor(s / 4) * 31 + JITTER[(s + 5) % 12]}%`,
});
const hex = (n: number) => `0x${(0x300 + ((n * 0x1a8 + 0x40) % 0x900)).toString(16).toUpperCase()}`;

type Node = { id: number; v: number; spot: number; addr: string };
type Where = "begin" | "end" | "pos";

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const heapRef = useRef<HTMLDivElement>(null);
  const made = useRef(2);
  const [list, setList] = useState<Node[]>([
    { id: 0, v: 20, spot: SPOTS[0], addr: hex(0) },
    { id: 1, v: 40, spot: SPOTS[1], addr: hex(1) },
  ]);
  const [paths, setPaths] = useState<{ key: string; d: string }[]>([]);
  // What the last insert added; animated once the new arrows have been measured.
  const pending = useRef<{ node: number; links: string[] } | null>(null);
  const [val, setVal] = useState("10");
  const [where, setWhere] = useState<Where>("begin");
  const [posText, setPosText] = useState("1");
  const [msg, setMsg] = useState("");

  useLayoutEffect(() => {
    const heap = heapRef.current;
    if (!heap) return;
    const measure = () => {
      const boxes = list.map((n) => relRect(heap, heap.querySelector(`[data-id="${n.id}"] .lnode__box`)!));
      const nexts = list.map((n) => relRect(heap, heap.querySelector(`[data-id="${n.id}"] .lnode__next`)!));
      setPaths(
        list.slice(1).map((n, k) => {
          const from: Rect = mid(boxes[k + 1]).x < nexts[k].x ? boxes[k] : nexts[k];
          return { key: `${list[k].id}>${n.id}`, d: linkPath(from, boxes[k + 1]) };
        }),
      );
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [list]);

  const insert = () => {
    const v = Number(val);
    if (!Number.isInteger(v) || Math.abs(v) > 999) return setMsg("Type a whole number between -999 and 999.");
    if (list.length >= MAX) return setMsg(`Room for ${MAX} nodes in this heap. Clear it to start again.`);
    const pos = where === "begin" ? 0 : where === "end" ? list.length : Number(posText);
    if (!Number.isInteger(pos) || pos < 0 || pos > list.length)
      return setMsg(`Invalid position: t runs off the end. pos must be 0 … ${list.length}.`);
    const used = new Set(list.map((n) => n.spot));
    const id = made.current++;
    const node = { id, v, spot: SPOTS.find((s) => !used.has(s))!, addr: hex(id) };
    const next = [...list.slice(0, pos), node, ...list.slice(pos)];
    const before = list[pos - 1];
    const after = list[pos];
    const links = [before && `${before.id}>${id}`, after && `${id}>${after.id}`].filter(Boolean) as string[];
    setList(next);
    pending.current = { node: id, links };
    setMsg(
      pos === 0
        ? `insertBegin: p->next = head${after ? ` (${after.addr})` : " (NULL)"}, head = ${node.addr}. Walked 0 nodes.`
        : pos === list.length
          ? `insertEnd: walked ${list.length - 1} node${list.length - 1 === 1 ? "" : "s"} to reach the last one, then last->next = ${node.addr}.`
          : `insertAt(${pos}): t walked ${pos - 1} node${pos - 1 === 1 ? "" : "s"} to ${before.v}. p->next = t->next, then t->next = p.`,
    );
    setVal(String(((v * 7 + 13) % 90) + 10));
  };

  useGSAP(
    () => {
      const fresh = pending.current;
      if (!fresh) return;
      pending.current = null;
      gsap.from(`[data-id="${fresh.node}"]`, { scale: 0.5, autoAlpha: 0, duration: 0.35, ease: "back.out(2)" });
      fresh.links.forEach((k, i) => {
        const p = ref.current?.querySelector(`[data-link="${k}"]`);
        if (p)
          gsap
            .timeline({ delay: 0.2 + i * 0.25 })
            .fromTo(p, { drawSVG: "0%", stroke: "#d8432a" }, { drawSVG: "100%", duration: 0.35 })
            .to(p, { stroke: "#1b1915", duration: 0.4 }, "+=1");
      });
    },
    { scope: ref, dependencies: [paths] },
  );

  return (
    <section className="block pg pll" ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>Insert anywhere, count the walk</h2>
      </div>

      <div className="ipg__form dpg__form lpg__form">
        <label className="ipg__field ipg__field--s">
          <span>data</span>
          <input value={val} onChange={(e) => setVal(e.target.value)} inputMode="numeric" />
        </label>
        <fieldset className="ipg__where">
          <legend>where</legend>
          {(["begin", "end", "pos"] as Where[]).map((w) => (
            <label key={w} className={where === w ? "is-on" : ""}>
              <input type="radio" name="lwhere" checked={where === w} onChange={() => setWhere(w)} />
              {w === "begin" ? "beginning" : w === "end" ? "end" : "position"}
            </label>
          ))}
          <input
            className="ipg__pos"
            value={posText}
            onChange={(e) => setPosText(e.target.value)}
            disabled={where !== "pos"}
            inputMode="numeric"
            aria-label="position"
          />
        </fieldset>
        <button className="btn" onClick={insert}>
          Insert
        </button>
      </div>
      <p className="pg__err" aria-live="polite">
        {msg || "New arrows flash red. Beginning never walks; end walks the whole list."}
      </p>

      <div className="pll__stage">
        <div className="pll__head">
          <span>head</span>
          <b>{list[0]?.addr ?? "NULL"}</b>
        </div>
        <div className="pll__heap" ref={heapRef}>
          <svg className="larrows" aria-hidden>
            <defs>
              <marker id="lpg-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#1b1915" />
              </marker>
            </defs>
            {paths.map((p) => (
              <path key={p.key + p.d} data-link={p.key} className="larrow" d={p.d} markerEnd="url(#lpg-head)" />
            ))}
          </svg>
          {list.map((n, k) => (
            <div className="lnode" key={n.id} data-id={n.id} style={spotXY(n.spot)}>
              <span className="lnode__addr">
                {n.addr}
                {k === 0 && <em className="pll__tag">head</em>}
                <em className="pll__tag pll__tag--idx">[{k}]</em>
              </span>
              <div className="lnode__box">
                <span className="lnode__f lnode__data">{n.v}</span>
                <span className="lnode__f lnode__next">
                  {k < list.length - 1 ? <b className="lnode__to">{list[k + 1].addr}</b> : <em className="lnode__null">NULL</em>}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="pll__out term">
          {list.map((n) => (
            <span key={n.id}>{n.v} -&gt; </span>
          ))}
          <span>NULL</span>
        </p>
      </div>
    </section>
  );
}
