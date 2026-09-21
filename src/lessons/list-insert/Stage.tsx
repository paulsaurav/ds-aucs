"use client";

import { gsap } from "@/lib/gsap";
import {
  delta,
  helpers,
  labTimeline,
  linkPath,
  mid,
  relRect,
  stepStarts,
  totalWeight,
  type Build,
  type Rect,
} from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel, Cond, Odo, Reg } from "@/components/lesson/parts";
import { A, B, C, D, L, NODES, ORDER, PROGRAM, STEPS } from "./data";

const ADDR = NODES.map((n) => n.addr);
/** What each node's next field holds over time (index = layer). */
const NEXTS = [
  ["NULL", ADDR[B], ADDR[D]], // A: NULL → 40 → 30
  ["NULL"], // B
  ["NULL", ADDR[A]], // C
  ["NULL", ADDR[B], ADDR[D]], // D: NULL → 40 → itself (trap only)
];
const TITLES = ["insertEnd(head, 20)", "insertEnd(head, 40)", "insertBegin(head, 10)", "insertAt(head, 30, 2)", "display(head)"];
const ROWS: { id: string; items: string[] }[] = [
  { id: "head", items: ["&main.head", ADDR[C]] },
  { id: "x", items: ["—", "20", "40", "10", "30", "—"] },
  { id: "pos", items: ["—", "2"] },
  { id: "i", items: ["—", "1", "2"] },
  { id: "p", items: ["—", ...ADDR] },
  { id: "t", items: ["—", ADDR[A], ADDR[C], ADDR[A], ADDR[C], ADDR[A], ADDR[D], ADDR[B], "NULL"] },
];
const COND = [
  <span key="q">—</span>,
  <Cond key="w" text="NULL != NULL" ok={false} />,
  <Cond key="f1" text="1 < 2 && t" ok />,
  <Cond key="f2" text="2 < 2" ok={false} />,
  ...ORDER.map((k) => <Cond key={`d${k}`} text={`${ADDR[k]} != NULL`} ok />),
  <Cond key="end" text="NULL != NULL" ok={false} />,
];
const ARROWS = ["hA", "hC", "AB", "CA", "AD", "DB", "DD", "ref"];

const build: Build = (el) => {
  const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const one = (s: string) => el.querySelector<HTMLElement>(s)!;

  const zone = one(".mem");
  const heap = one(".heap");
  const fMain = one(".frame--main");
  const fCall = one(".frame--call");
  const titleCol = one(".frame--call .frame__title .odo__col");
  const mainHead = one(".svar--mhead");
  const row = Object.fromEntries(ROWS.map((r) => [r.id, one(`.svar--${r.id}`)]));
  const nodes = all(".lnode");
  const boxOf = (k: number) => nodes[k].querySelector(".lnode__box")!;
  const vals = all(".lnode__v");
  const qs = (k: number) => Array.from(nodes[k].querySelectorAll<HTMLElement>(".lnode__q"));
  const nexts = (k: number) => Array.from(nodes[k].querySelectorAll<HTMLElement>(".lnode__n"));
  const flys = all(".lnode__fly");
  const path = (n: string) => one(`.larrow[data-ptr="${n}"]`);
  const badge = (k: string) => one(`.lbadge--${k}`);
  const lost = one(".ll__lost");
  const trap = one(".ll__trap");
  const cost = one(".ll__cost");
  const condReg = one(".reg--cond");
  const condCol = one(".reg--cond .odo__col");
  const outs = all(".term__out");
  const outSlots = all(".term__outslot");
  const stamp = one(".stamp");

  // ---------- measure the clean layout, draw every arrow's path ----------
  const box = NODES.map((_, k) => relRect(zone, boxOf(k)));
  const nextBox = NODES.map((_, k) => relRect(zone, nodes[k].querySelector(".lnode__next")!));
  const link = (a: number, b: number) => {
    // Leave from the next field, or from the node's edge when pointing back left.
    const from: Rect = mid(box[b]).x < nextBox[a].x ? box[a] : nextBox[a];
    return linkPath(from, box[b]);
  };
  const mh = relRect(zone, mainHead);
  path("hA").setAttribute("d", linkPath(mh, box[A]));
  path("hC").setAttribute("d", linkPath(mh, box[C]));
  path("AB").setAttribute("d", link(A, B));
  path("CA").setAttribute("d", link(C, A));
  path("AD").setAttribute("d", link(A, D));
  path("DB").setAttribute("d", link(D, B));
  {
    const n = nextBox[D];
    const b = box[D];
    const s = { x: n.x + n.w, y: n.y + n.h / 2 };
    path("DD").setAttribute("d", `M ${s.x} ${s.y} C ${s.x + 46} ${s.y}, ${s.x + 30} ${b.y - 44}, ${b.x + b.w * 0.25} ${b.y - 2}`);
  }
  {
    const h = relRect(zone, row.head);
    const s = { x: h.x, y: h.y + h.h / 2 };
    const e = { x: mh.x, y: mh.y + mh.h / 2 };
    path("ref").setAttribute("d", `M ${s.x} ${s.y} C ${s.x - 26} ${s.y}, ${e.x - 26} ${e.y}, ${e.x - 2} ${e.y}`);
  }
  const hr = relRect(zone, heap);
  const badgeAt = (kind: "p" | "t", k: number) => ({
    left: box[k].x - hr.x + (kind === "p" ? 0 : 38),
    top: box[k].y - hr.y + box[k].h + 4,
  });
  const nullAt = { left: box[B].x - hr.x + box[B].w + 8, top: box[B].y - hr.y + 8 };
  const outFly = ORDER.map((k, n) => delta(flys[k], outSlots[n]));

  // ---------- initial state ----------
  gsap.set(nodes, { autoAlpha: 0, scale: 0.6 });
  gsap.set([...vals, ...flys, ...all(".lnode__n")], { autoAlpha: 0 });
  gsap.set(all(".larrow"), { drawSVG: "0%", autoAlpha: 0 });
  gsap.set([fMain, fCall, lost, trap, cost, condReg], { autoAlpha: 0 });
  gsap.set(fCall, { y: -12 });
  gsap.set(badge("p"), { autoAlpha: 0, ...badgeAt("p", A) });
  gsap.set(badge("t"), { autoAlpha: 0, ...badgeAt("t", A) });
  gsap.set(outs, { autoAlpha: 0 });
  gsap.set(stamp, { autoAlpha: 0, scale: 1.8, rotation: -2, xPercent: -50, yPercent: -50 });

  // ---------- master timeline ----------
  const S = stepStarts(STEPS);
  const tl = labTimeline();
  const stops: number[] = [];
  const { type, typeTerm, hl, hlOff, odo, flash } = helpers(tl, el, PROGRAM);
  const show = (t: gsap.TweenTarget, at: number, d = 0.12) => tl.to(t, { autoAlpha: 1, duration: d }, at);
  const hide = (t: gsap.TweenTarget, at: number, d = 0.1) => tl.to(t, { autoAlpha: 0, duration: d }, at);
  const setRow = (id: string, idx: number, at: number, blink = true) => {
    odo(row[id].querySelector<HTMLElement>(".odo__col")!, ROWS.find((r) => r.id === id)!.items.length, idx, at);
    if (blink) flash(row[id], at);
  };
  const setMainHead = (idx: number, at: number) => {
    odo(mainHead.querySelector<HTMLElement>(".odo__col")!, 3, idx, at);
    flash(mainHead, at);
  };
  const setCond = (idx: number, at: number) => {
    show(condReg, at, 0.05);
    odo(condCol, COND.length, idx, at);
  };
  const setNext = (k: number, from: number, to: number, at: number) => {
    const layers = nexts(k);
    tl.to(layers[from], { autoAlpha: 0, duration: 0.05 }, at);
    tl.to(layers[to], { autoAlpha: 1, duration: 0.05 }, at + 0.04);
    flash(nodes[k].querySelector(".lnode__next")!, at + 0.04);
  };
  const draw = (n: string, at: number) => {
    tl.set(path(n), { autoAlpha: 1 }, at);
    tl.to(path(n), { drawSVG: "100%", duration: 0.22, ease: "power2.inOut" }, at);
  };
  const erase = (n: string, at: number) => tl.to(path(n), { drawSVG: "100% 100%", autoAlpha: 0, duration: 0.18 }, at);
  const moveBadge = (kind: "p" | "t", k: number | null, at: number) =>
    tl.to(badge(kind), { ...(k === null ? nullAt : badgeAt(kind, k)), autoAlpha: 1, duration: 0.16, ease: "power2.inOut" }, at);
  const title = (idx: number, at: number) => {
    odo(titleCol, TITLES.length, idx, at);
    flash(fCall.querySelector(".frame__title")!, at);
  };
  /** Inside a caller: newNode(x) runs and node k appears. */
  const create = (k: number, callerLine: number, at: number) => {
    hl(callerLine, at);
    hl(L.nn, at + 0.06);
    hl(L.nnAlloc, at + 0.1);
    tl.to(nodes[k], { autoAlpha: 1, scale: 1, duration: 0.16, ease: "back.out(2)" }, at + 0.12);
    setRow("p", k + 1, at + 0.16);
    moveBadge("p", k, at + 0.16);
    hl(L.nnData, at + 0.22);
    hide(qs(k)[0], at + 0.24, 0.03);
    show(vals[k], at + 0.25, 0.05);
    hl(L.nnNull, at + 0.3);
    hide(qs(k)[1], at + 0.32, 0.03);
    show(nexts(k)[0], at + 0.33, 0.05);
    hl(L.nnRet, at + 0.36);
  };

  // 1 · helper + empty list
  let t = S[0];
  type([L.include, L.include + 1, L.struct, L.struct + 1, L.struct + 2, L.structEnd], t, 0.03);
  type([L.nn, L.nnAlloc, L.nnData, L.nnNull, L.nnRet, L.nnEnd], t + 0.2, 0.035);
  type([L.main, L.mHead, L.end], t + 0.45, 0.05);
  hl(L.mHead, t + 0.6);
  show(fMain, t + 0.62);
  hl(L.nn, t + 0.85);

  // 2 · insertEnd(head, 20) on an empty list
  t = S[1];
  type([L.ie, L.ieNew, L.ieEmpty, L.ieT, L.ieWalk, L.ieLink, L.ieEnd], t, 0.03);
  type([L.call1], t + 0.25);
  hl(L.call1, t + 0.32);
  tl.to(fCall, { autoAlpha: 1, y: 0, duration: 0.18, ease: "back.out(1.6)" }, t + 0.36);
  setRow("x", 1, t + 0.4);
  draw("ref", t + 0.42);
  hl(L.ie, t + 0.44);
  create(A, L.ieNew, t + 0.5);
  stops.push(t + 0.9);
  hl(L.ieEmpty, t + 0.95);
  setMainHead(1, t + 1.02);
  draw("hA", t + 1.05);
  stops.push(t + 1.3);
  hide(badge("p"), t + 1.35);

  // 3 · insertEnd(head, 40): walk to the last node
  t = S[2];
  type([L.call2], t);
  hl(L.call2, t + 0.05);
  title(1, t + 0.1);
  setRow("x", 2, t + 0.1);
  setRow("p", 0, t + 0.1, false);
  hl(L.ie, t + 0.15);
  create(B, L.ieNew, t + 0.2);
  stops.push(t + 0.6);
  hl(L.ieEmpty, t + 0.65);
  hl(L.ieT, t + 0.72);
  setRow("t", 1, t + 0.74);
  moveBadge("t", A, t + 0.74);
  hl(L.ieWalk, t + 0.84);
  setCond(1, t + 0.86);
  hl(L.ieLink, t + 0.98);
  setNext(A, 0, 1, t + 1.0);
  draw("AB", t + 1.04);
  stops.push(t + 1.2);
  hide([badge("p"), badge("t"), condReg], t + 1.25);

  // 4 · insertBegin(head, 10)
  t = S[3];
  type([L.ib, L.ibNew, L.ibLink, L.ibHead, L.ibEnd], t, 0.03);
  type([L.call3], t + 0.15);
  hl(L.call3, t + 0.22);
  title(2, t + 0.26);
  setRow("x", 3, t + 0.26);
  setRow("t", 0, t + 0.26, false);
  setRow("p", 0, t + 0.26, false);
  hl(L.ib, t + 0.3);
  create(C, L.ibNew, t + 0.35);
  stops.push(t + 0.75);
  hl(L.ibLink, t + 0.8);
  setNext(C, 0, 1, t + 0.82);
  draw("CA", t + 0.86);
  stops.push(t + 1.05);
  hl(L.ibHead, t + 1.08);
  setMainHead(2, t + 1.1);
  erase("hA", t + 1.1);
  draw("hC", t + 1.16);
  hide(badge("p"), t + 1.32);

  // 5 · insertAt(head, 30, 2)
  t = S[4];
  type([L.ia, L.ia + 1, L.ia + 2, L.ia + 3, L.ia + 4, L.iaT, L.iaFor, L.iaHop, L.iaNull, L.iaNull + 1, L.iaNull + 2, L.iaNull + 3, L.iaNew, L.iaLink1, L.iaLink2, L.iaEnd], t, 0.022);
  type([L.call4], t + 0.4);
  hl(L.call4, t + 0.48);
  title(3, t + 0.52);
  setRow("x", 4, t + 0.52);
  setRow("pos", 1, t + 0.54);
  setRow("p", 0, t + 0.54, false);
  hl(L.ia, t + 0.56);
  hl(L.iaZero, t + 0.62);
  hl(L.iaT, t + 0.7);
  setRow("t", 2, t + 0.72);
  moveBadge("t", C, t + 0.72);
  stops.push(t + 0.8);
  hl(L.iaFor, t + 0.85);
  setRow("i", 1, t + 0.86);
  setCond(2, t + 0.86);
  hl(L.iaHop, t + 0.96);
  setRow("t", 3, t + 0.98);
  moveBadge("t", A, t + 0.98);
  hl(L.iaFor, t + 1.1);
  setRow("i", 2, t + 1.11);
  setCond(3, t + 1.11);
  stops.push(t + 1.2);
  hl(L.iaNull, t + 1.24);
  create(D, L.iaNew, t + 1.3);
  stops.push(t + 1.72);
  hl(L.iaLink1, t + 1.78);
  setNext(D, 0, 1, t + 1.8);
  draw("DB", t + 1.84);
  stops.push(t + 2.02);
  hl(L.iaLink2, t + 2.06);
  setNext(A, 1, 2, t + 2.08);
  erase("AB", t + 2.08);
  draw("AD", t + 2.14);
  stops.push(t + 2.32);

  // 6 · the trap: the two lines swapped
  t = S[5];
  hide([badge("p"), badge("t"), condReg], t);
  show(trap, t + 0.05);
  tl.to(path("DB"), { autoAlpha: 0, duration: 0.1 }, t + 0.2);
  setNext(D, 1, 2, t + 0.2);
  draw("DD", t + 0.26);
  tl.to(nodes[B], { opacity: 0.3, duration: 0.2 }, t + 0.45);
  show(lost, t + 0.5);

  // 7 · display, after putting the correct links back
  t = S[6];
  hide([trap, lost, path("DD")], t);
  tl.to(nodes[B], { opacity: 1, duration: 0.15 }, t);
  setNext(D, 2, 1, t);
  tl.to(path("DB"), { autoAlpha: 1, duration: 0.1 }, t + 0.05);
  type([L.disp, L.dispFor, L.dispPrint, L.dispNull, L.dispEnd], t + 0.1, 0.035);
  type([L.call5], t + 0.3);
  hl(L.call5, t + 0.38);
  title(4, t + 0.42);
  erase("ref", t + 0.42);
  setRow("head", 1, t + 0.44);
  setRow("x", 5, t + 0.44, false);
  setRow("pos", 0, t + 0.44, false);
  setRow("i", 0, t + 0.44, false);
  setRow("p", 0, t + 0.44, false);
  typeTerm(0, t + 0.5);
  typeTerm(1, t + 0.55, 0.01);
  hl(L.disp, t + 0.5);
  hl(L.dispFor, t + 0.6);
  setRow("t", 4, t + 0.62);
  moveBadge("t", C, t + 0.62);
  stops.push(t + 0.66);
  ORDER.forEach((k, n) => {
    const a = t + 0.7 + n * 0.35;
    hl(L.dispFor, a);
    setCond(4 + n, a);
    hl(L.dispPrint, a + 0.06);
    tl.set(flys[k], { autoAlpha: 1 }, a + 0.08);
    tl.to(flys[k], { x: outFly[n].x, y: outFly[n].y, duration: 0.15, ease: "power2.inOut" }, a + 0.08);
    tl.set(flys[k], { autoAlpha: 0 }, a + 0.23);
    show(outs[n], a + 0.22, 0.04);
    hl(L.dispFor, a + 0.24);
    setRow("t", 5 + n, a + 0.26);
    moveBadge("t", n === ORDER.length - 1 ? null : ORDER[n + 1], a + 0.26);
    stops.push(a + 0.35);
  });
  const E = t + 0.7 + ORDER.length * 0.35;
  setCond(COND.length - 1, E);
  hl(L.dispNull, E + 0.06);
  show(outs[ORDER.length], E + 0.08, 0.05);

  // 8 · cost
  t = S[7];
  hide([badge("t"), condReg], t);
  tl.to(fCall, { autoAlpha: 0, y: -12, duration: 0.18 }, t);
  type([L.mRet], t);
  hl(L.mRet, t + 0.05);
  hlOff(t + 0.2);
  show(cost, t + 0.2);
  tl.from(cost.children, { autoAlpha: 0, x: -10, stagger: 0.1, duration: 0.15, immediateRender: false }, t + 0.25);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.65);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.83);

  tl.set({}, {}, totalWeight(STEPS));
  return { tl, stops };
};

export default function Stage() {
  return (
    <Lab steps={STEPS} build={build} className="lab--dense lab--ll">
      <CodePanel file="insert_list.cpp" program={PROGRAM} />

      <div className="viz">
        <div className="viz__head">
          <span className="viz__title">memory</span>
          <div className="regs">
            <Reg className="reg--cond" items={COND} />
          </div>
        </div>

        <div className="mem mem--ll">
          <svg className="larrows" aria-hidden>
            <defs>
              <marker id="li-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#1b1915" />
              </marker>
            </defs>
            {ARROWS.map((n) => (
              <path
                key={n}
                className={`larrow${n.startsWith("h") ? " larrow--ptr" : ""}${n === "DD" ? " larrow--bad" : ""}${n === "ref" ? " larrow--ref" : ""}`}
                data-ptr={n}
                markerEnd="url(#li-head)"
              />
            ))}
          </svg>

          <div className="stack">
            <span className="stack__k">stack</span>
            <div className="stack__top">
              <div className="frame frame--call">
                <span className="frame__k frame__title">
                  <Odo items={TITLES} />
                </span>
                {ROWS.map((r) => (
                  <div className={`svar svar--${r.id}`} key={r.id}>
                    <span className="svar__k">{r.id}</span>
                    <Odo items={r.items} />
                  </div>
                ))}
              </div>
            </div>
            <div className="frame frame--main">
              <span className="frame__k">main()</span>
              <div className="svar svar--mhead">
                <span className="svar__k">head</span>
                <Odo items={["NULL", NODES[A].addr, NODES[C].addr]} />
              </div>
            </div>
          </div>

          <div className="heap">
            <span className="heap__k">heap</span>
            {NODES.map((n, k) => (
              <div className="lnode" key={n.key} style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}>
                <span className="lnode__addr">{n.addr}</span>
                <div className="lnode__box">
                  <span className="lnode__f lnode__data">
                    <i className="lnode__q">?</i>
                    <b className="lnode__v">{n.v}</b>
                  </span>
                  <span className="lnode__f lnode__next">
                    <i className="lnode__q">?</i>
                    {NEXTS[k].map((x, i) => (
                      <em className={`lnode__n${x === "NULL" ? " lnode__null" : " lnode__to"}`} key={i}>
                        {x}
                      </em>
                    ))}
                  </span>
                </div>
                <span className="lnode__fly">{n.v}</span>
              </div>
            ))}
            <span className="lbadge lbadge--p">p</span>
            <span className="lbadge lbadge--t">t</span>
            <span className="ll__lost">40 is unreachable</span>
          </div>

          <div className="ll__trap">
            <code>t-&gt;next = p;</code>
            <code>p-&gt;next = t-&gt;next; // = p itself</code>
          </div>

          <div className="stamp" aria-hidden>
            <span>Inserted</span>
            <small>begin O(1) · end O(n) · at pos O(pos)</small>
          </div>
        </div>

        <div className="dock dock--ll">
          <div className="ll__cost">
            <div>
              <code>insertBegin</code>
              <b>O(1)</b>
              <span>two pointers change</span>
            </div>
            <div>
              <code>insertEnd</code>
              <b>O(n)</b>
              <span>walks to the last node</span>
            </div>
            <div>
              <code>insertAt(pos)</code>
              <b>O(pos)</b>
              <span>walks pos − 1 nodes</span>
            </div>
          </div>
        </div>

        <div className="term">
          <div className="term__line">
            <span className="term__ps">$</span> ./insert_list
          </div>
          <div className="term__line">
            {ORDER.map((k, n) => (
              <span className="term__outslot" key={n}>
                <span className="term__out">{NODES[k].v} -&gt;</span>{" "}
              </span>
            ))}
            <span className="term__outslot">
              <span className="term__out">NULL</span>
            </span>
          </div>
        </div>
      </div>
    </Lab>
  );
}
