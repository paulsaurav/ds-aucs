import { gsap } from "@/lib/gsap";
import { ADDR, VALUES } from "./data";

/** Where each node sits in the heap area (fractions): a zigzag, to show nodes are not side by side. */
const POS = [
  { x: 0.02, y: 0.12 },
  { x: 0.5, y: 0.0 },
  { x: 0.1, y: 0.56 },
  { x: 0.56, y: 0.62 },
];
const STRANGERS = [
  { label: "float avg", x: 0.62, y: 0.33 },
  { label: "char name[8]", x: 0.26, y: 0.9 },
  { label: "int roll", x: 0.78, y: 0.9 },
];
export const BADGES = ["p", "tail", "t"] as const;
export type BadgeKind = (typeof BADGES)[number];

/** Heap area: scattered nodes, a NULL marker, and the pointer badges that sit under nodes. */
export function Heap() {
  return (
    <div className="heap">
      <span className="heap__k">heap · made by new</span>
      {STRANGERS.map((s) => (
        <span className="stranger heap__stranger" key={s.label} style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%` }}>
          {s.label}
        </span>
      ))}
      {VALUES.map((v, k) => (
        <div className="lnode" key={k} style={{ left: `${POS[k].x * 100}%`, top: `${POS[k].y * 100}%` }}>
          <span className="lnode__addr">{ADDR[k]}</span>
          <div className="lnode__box">
            <span className="lnode__f lnode__data">
              <i className="lnode__q">?</i>
              <b className="lnode__v">{v}</b>
            </span>
            <span className="lnode__f lnode__next">
              <i className="lnode__q">?</i>
              <em className="lnode__null">NULL</em>
              {k < VALUES.length - 1 && <b className="lnode__to">{ADDR[k + 1]}</b>}
            </span>
          </div>
          <span className="lnode__fly">{v}</span>
        </div>
      ))}
      <span className="lnull">NULL</span>
      {BADGES.map((b) => (
        <span className={`lbadge lbadge--${b}`} key={b}>
          {b}
        </span>
      ))}
    </div>
  );
}

/** Arrow layer covering the whole memory zone: node links plus any named pointer arrows. */
export function Arrows({ named }: { named: string[] }) {
  return (
    <svg className="larrows" aria-hidden>
      <defs>
        <marker id="ll-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#1b1915" />
        </marker>
      </defs>
      {VALUES.slice(1).map((_, k) => (
        <path className="larrow larrow--link" data-link={k} key={k} markerEnd="url(#ll-head)" />
      ))}
      {named.map((n) => (
        <path className="larrow larrow--ptr" data-ptr={n} key={n} markerEnd="url(#ll-head)" />
      ))}
    </svg>
  );
}

/** Measures the heap once (before anything is transformed) and returns arrow + badge geometry. */
export function heapGeometry(zone: HTMLElement) {
  const z = zone.getBoundingClientRect();
  const rel = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - z.left, y: r.top - z.top, w: r.width, h: r.height };
  };
  const nodes = Array.from(zone.querySelectorAll<HTMLElement>(".lnode"));
  const boxes = nodes.map((n) => rel(n.querySelector(".lnode__box")!));
  const nexts = nodes.map((n) => rel(n.querySelector(".lnode__next")!));
  const nullBox = rel(zone.querySelector(".lnull")!);
  const heap = rel(zone.querySelector(".heap")!);

  /** Where the line from `from` towards the centre of `r` crosses r's border. */
  const edge = (r: { x: number; y: number; w: number; h: number }, from: { x: number; y: number }) => {
    const c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    const dx = from.x - c.x;
    const dy = from.y - c.y;
    const s = Math.min(r.w / 2 / Math.abs(dx || 1e-6), r.h / 2 / Math.abs(dy || 1e-6));
    return { x: c.x + dx * s, y: c.y + dy * s };
  };
  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => `M ${a.x} ${a.y} L ${b.x} ${b.y}`;

  return {
    /** Link from node k's next field to node k+1. */
    link(k: number) {
      // Leave from the edge of the next field (not its middle) so the address stays readable.
      // Pointing left? Leave from the node's outer edge so the arrow doesn't cross its own data.
      const b = boxes[k + 1];
      const c = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      const s = edge(c.x < nexts[k].x ? boxes[k] : nexts[k], c);
      return line(s, edge(b, s));
    },
    /** Arrow from a pointer variable's box (right edge) to node k. */
    fromVar(el: Element, k: number) {
      const v = rel(el);
      const s = { x: v.x + v.w, y: v.y + v.h / 2 };
      return line(s, edge(boxes[k], s));
    },
    /** Badge position under node k (or beside the NULL marker for k = -1). */
    badge(kind: BadgeKind, k: number) {
      const off = BADGES.indexOf(kind) * 38;
      // Badges live inside .heap, so convert from zone to heap coordinates.
      if (k < 0) return { left: nullBox.x - heap.x, top: nullBox.y - heap.y + nullBox.h + 4 };
      return { left: boxes[k].x - heap.x + off, top: boxes[k].y - heap.y + boxes[k].h + 4 };
    },
  };
}

/** Initial state shared by both labs. */
export function hideHeap(zone: HTMLElement) {
  const q = (s: string) => Array.from(zone.querySelectorAll<HTMLElement>(s));
  gsap.set(q(".lnode"), { autoAlpha: 0, scale: 0.6 });
  gsap.set(q(".lnode__v, .lnode__null, .lnode__to, .lnode__fly"), { autoAlpha: 0 });
  gsap.set(q(".lbadge, .lnull"), { autoAlpha: 0 });
  gsap.set(q(".larrow"), { drawSVG: "0%", autoAlpha: 0 });
}
