"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { linkPath, mid, relRect, type Rect } from "@/components/lesson/kit";

const SPOTS = [4, 1, 6, 3, 11, 9, 8, 10, 0, 2, 5, 7];
const JITTER = [0, 3, -2, 4, -3, 2, -4, 1, 3, -2, 2, -1];
const spotXY = (s: number) => ({
  left: `${4 + (s % 4) * 24 + JITTER[s]}%`,
  top: `${6 + Math.floor(s / 4) * 31 + JITTER[(s + 5) % 12]}%`,
});
const hex = (n: number) => `0x${(0x300 + ((n * 0x1a8 + 0x40) % 0x900)).toString(16).toUpperCase()}`;

type Node = { id: number; v: number; spot: number; addr: string };
type Where = "begin" | "end" | "pos";

const fresh = (): Node[] => [15, 25, 35, 45, 55, 65].map((v, k) => ({ id: k, v, spot: SPOTS[k], addr: hex(k) }));

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const heapRef = useRef<HTMLDivElement>(null);
  const [list, setList] = useState<Node[]>(fresh);
  const [ghost, setGhost] = useState<Node | null>(null);
  const [paths, setPaths] = useState<{ key: string; d: string }[]>([]);
  const pending = useRef<{ links: string[] } | null>(null);
  const [where, setWhere] = useState<Where>("pos");
  const [posText, setPosText] = useState("2");
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

  const remove = () => {
    if (list.length === 0) return setMsg("head == NULL: the list is empty, nothing to delete.");
    const pos = where === "begin" ? 0 : where === "end" ? list.length - 1 : Number(posText);
    if (!Number.isInteger(pos) || pos < 0 || pos >= list.length)
      return setMsg(`Invalid position: t->next would be NULL. pos must be 0 … ${list.length - 1}.`);
    const victim = list[pos];
    const before = list[pos - 1];
    const after = list[pos + 1];
    setGhost(victim);
    setList(list.filter((_, k) => k !== pos));
    pending.current = { links: before && after ? [`${before.id}>${after.id}`] : [] };
    setMsg(
      pos === 0
        ? `deleteBegin: head = head->next${after ? ` (${after.addr})` : " (NULL)"}, then delete ${victim.addr}. Walked 0 nodes.`
        : !after
          ? `deleteEnd: t walked ${pos - 1} node${pos - 1 === 1 ? "" : "s"} to the second-last (${before.v}), delete t->next, t->next = NULL.`
          : `deleteAt(${pos}): t walked ${pos - 1} node${pos - 1 === 1 ? "" : "s"} to ${before.v}. t->next = p->next skips ${victim.v}, then delete p.`,
    );
  };

  // The freed node fades out; the new bypass arrow flashes.
  useGSAP(
    () => {
      const p = pending.current;
      if (!p) return;
      pending.current = null;
      gsap.fromTo(".dll__ghost", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6, delay: 0.9, onComplete: () => setGhost(null) });
      p.links.forEach((k) => {
        const el = ref.current?.querySelector(`[data-link="${k}"]`);
        if (el)
          gsap
            .timeline({ delay: 0.15 })
            .fromTo(el, { drawSVG: "0%", stroke: "#d8432a" }, { drawSVG: "100%", duration: 0.35 })
            .to(el, { stroke: "#1b1915", duration: 0.4 }, "+=1");
      });
    },
    { scope: ref, dependencies: [paths] },
  );

  return (
    <section className="block pg pll" ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>Delete anything, watch the arrows</h2>
      </div>

      <div className="ipg__form dpg__form lpg__form">
        <fieldset className="ipg__where">
          <legend>where</legend>
          {(["begin", "end", "pos"] as Where[]).map((w) => (
            <label key={w} className={where === w ? "is-on" : ""}>
              <input type="radio" name="dlwhere" checked={where === w} onChange={() => setWhere(w)} />
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
        <button className="btn" onClick={remove}>
          Delete
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => {
            setList(fresh());
            setMsg("Refilled: 15 -> 25 -> 35 -> 45 -> 55 -> 65.");
          }}
        >
          Refill
        </button>
      </div>
      <p className="pg__err" aria-live="polite">
        {msg || "Deleting the beginning never walks. The end walks to the second-last node."}
      </p>

      <div className="pll__stage">
        <div className="pll__head">
          <span>head</span>
          <b>{list[0]?.addr ?? "NULL"}</b>
        </div>
        <div className="pll__heap" ref={heapRef}>
          <svg className="larrows" aria-hidden>
            <defs>
              <marker id="dpg-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#1b1915" />
              </marker>
            </defs>
            {paths.map((p) => (
              <path key={p.key + p.d} data-link={p.key} className="larrow" d={p.d} markerEnd="url(#dpg-head)" />
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
          {ghost && (
            <div className="lnode dll__ghost" key={`g${ghost.id}`} style={spotXY(ghost.spot)}>
              <span className="lnode__addr">{ghost.addr}</span>
              <div className="lnode__box">
                <span className="lnode__f lnode__data">{ghost.v}</span>
                <span className="lnode__f lnode__next" />
                <span className="lnode__freed">freed</span>
              </div>
            </div>
          )}
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
