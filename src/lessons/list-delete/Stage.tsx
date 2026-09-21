"use client";

import { gsap } from "@/lib/gsap";
import { delta, helpers, labTimeline, linkPath, mid, relRect, stepStarts, totalWeight, type Build, type Rect } from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel, Cond, Odo, Reg } from "@/components/lesson/parts";
import { L, NODES, OUT1, PROGRAM, STEPS } from "./data";

const [A, B, Cc, D, E] = [0, 1, 2, 3, 4];
const ADDR = NODES.map((n) => n.addr);
/** Next-field contents over time (index = layer). */
const NEXTS = [
  ["NULL", ADDR[B]],
  ["NULL", ADDR[Cc], ADDR[D]],
  ["NULL", ADDR[D]],
  ["NULL", ADDR[E], "NULL"],
  ["NULL"],
];
const TITLES = ["insertEnd(head, v) ×5", "display(head)", "deleteBegin(head)", "deleteEnd(head)", "deleteAt(head, 1)", "display(head)"];
const ROWS: { id: string; items: string[] }[] = [
  { id: "head", items: ["&main.head", ADDR[A], ADDR[B]] },
  { id: "pos", items: ["—", "1"] },
  { id: "i", items: ["—", "1"] },
  { id: "p", items: ["—", ADDR[A], ADDR[Cc]] },
  {
    id: "t",
    items: ["—", ...ADDR, "NULL", ADDR[B], ADDR[Cc], ADDR[D], ADDR[B], ADDR[B], ADDR[D], "NULL"],
  },
];
const COND = [
  <span key="q">—</span>,
  ...ADDR.map((a) => <Cond key={`d1${a}`} text={`${a} != NULL`} ok />),
  <Cond key="d1n" text="NULL != NULL" ok={false} />,
  <Cond key="w1" text={`t->next->next: ${ADDR[D]}`} ok />,
  <Cond key="w2" text={`t->next->next: ${ADDR[E]}`} ok />,
  <Cond key="w3" text="t->next->next: NULL" ok={false} />,
  <Cond key="f" text="1 < 1" ok={false} />,
  <Cond key="d2b" text={`${ADDR[B]} != NULL`} ok />,
  <Cond key="d2d" text={`${ADDR[D]} != NULL`} ok />,
  <Cond key="d2n" text="NULL != NULL" ok={false} />,
];
/** One display hop: print, then move t. Long enough for t to land before the next hop. */
const HOP = 0.42;
const ARROWS = ["hA", "hB", "AB", "BC", "CD", "DE", "BD", "ref", "DX"];

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
  const nexts = (k: number) => Array.from(nodes[k].querySelectorAll<HTMLElement>(".lnode__n"));
  const freed = all(".lnode__freed");
  const flys = all(".lnode__fly");
  const path = (n: string) => one(`.larrow[data-ptr="${n}"]`);
  const badge = (k: string) => one(`.lbadge--${k}`);
  const dangling = one(".ll__dangling");
  const cost = one(".ll__cost");
  const condReg = one(".reg--cond");
  const condCol = one(".reg--cond .odo__col");
  const outs = all(".term__out");
  const outSlots = all(".term__outslot");
  const stamp = one(".stamp");

  // ---------- measure ----------
  const box = NODES.map((_, k) => relRect(zone, nodes[k].querySelector(".lnode__box")!));
  const nextBox = NODES.map((_, k) => relRect(zone, nodes[k].querySelector(".lnode__next")!));
  const link = (a: number, b: number) => {
    const from: Rect = mid(box[b]).x < nextBox[a].x ? box[a] : nextBox[a];
    return linkPath(from, box[b]);
  };
  const mh = relRect(zone, mainHead);
  path("hA").setAttribute("d", linkPath(mh, box[A]));
  path("hB").setAttribute("d", linkPath(mh, box[B]));
  path("AB").setAttribute("d", link(A, B));
  path("BC").setAttribute("d", link(B, Cc));
  path("CD").setAttribute("d", link(Cc, D));
  path("DE").setAttribute("d", link(D, E));
  path("DX").setAttribute("d", link(D, E)); // the same link, drawn dashed while it dangles
  path("BD").setAttribute("d", link(B, D));
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
  const nullAfter = (k: number) => ({ left: box[k].x - hr.x + box[k].w + 8, top: box[k].y - hr.y + 8 });
  const walk1 = [A, B, Cc, D, E];
  const walk2 = [B, D];
  const out1 = walk1.map((k, n) => delta(flys[k], outSlots[n]));
  const out2 = walk2.map((k, n) => delta(flys[k], outSlots[walk1.length + 1 + n]));

  // ---------- initial state ----------
  gsap.set(nodes, { autoAlpha: 0, scale: 0.6 });
  gsap.set([...flys, ...freed, ...all(".lnode__n")], { autoAlpha: 0 });
  all(".lnode").forEach((_, k) => gsap.set(nexts(k)[0], { autoAlpha: 1 }));
  gsap.set(all(".larrow:not(.larrow--dangle)"), { drawSVG: "0%", autoAlpha: 0 });
  gsap.set(path("DX"), { autoAlpha: 0 });
  gsap.set([fMain, fCall, dangling, cost, condReg], { autoAlpha: 0 });
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
  const draw = (n: string, at: number, d = 0.22) => {
    tl.set(path(n), { autoAlpha: 1 }, at);
    tl.to(path(n), { drawSVG: "100%", duration: d, ease: "power2.inOut" }, at);
  };
  const erase = (n: string, at: number) => tl.to(path(n), { drawSVG: "100% 100%", autoAlpha: 0, duration: 0.18 }, at);
  const moveBadge = (kind: "p" | "t", pos: { left: number; top: number }, at: number) =>
    tl.to(badge(kind), { ...pos, autoAlpha: 1, duration: 0.16, ease: "power2.inOut" }, at);
  const title = (idx: number, at: number) => {
    odo(titleCol, TITLES.length, idx, at);
    flash(fCall.querySelector(".frame__title")!, at);
  };
  /** delete p: the node is handed back; it stays drawn, faded and hatched. */
  const free = (k: number, at: number) => {
    tl.to(nodes[k].querySelector(".lnode__box"), { backgroundColor: "#f4b7a9", duration: 0.08 }, at);
    tl.to(nodes[k], { opacity: 0.4, duration: 0.2 }, at + 0.1);
    show(freed[k], at + 0.12, 0.1);
  };
  /** display(): t walks the given nodes and prints them into output line `line`. */
  const displayWalk = (walk: number[], flights: { x: number; y: number }[], outBase: number, tBase: number, condBase: number, at: number) => {
    walk.forEach((k, n) => {
      const a = at + n * HOP;
      hl(L.dispFor, a);
      setCond(condBase + n, a);
      hl(L.dispPrint, a + 0.05);
      tl.set(flys[k], { autoAlpha: 1, x: 0, y: 0 }, a + 0.07);
      tl.to(flys[k], { x: flights[n].x, y: flights[n].y, duration: 0.14, ease: "power2.inOut" }, a + 0.07);
      tl.set(flys[k], { autoAlpha: 0 }, a + 0.21);
      show(outs[outBase + n], a + 0.2, 0.04);
      hl(L.dispFor, a + 0.22);
      setRow("t", tBase + n + 1, a + 0.23);
      const nextK = walk[n + 1];
      moveBadge("t", nextK === undefined ? nullAfter(k) : badgeAt("t", nextK), a + 0.23);
      stops.push(a + HOP);
    });
    const e = at + walk.length * HOP;
    setCond(condBase + walk.length, e);
    hl(L.dispNull, e + 0.05);
    show(outs[outBase + walk.length], e + 0.07, 0.05);
    return e + 0.12;
  };

  // 1 · build 10 … 50 (fast)
  let t = S[0];
  type([L.include, L.include + 1, L.struct, L.struct + 1, L.struct + 2, L.structEnd], t, 0.02);
  type([L.ie, L.ie + 1, L.ie + 2, L.ie + 3, L.ie + 4, L.ie + 5, L.ieEnd], t + 0.1, 0.02);
  type([L.main, L.mHead, L.mLoop, L.mCall, L.end], t + 0.25, 0.03);
  show(fMain, t + 0.35);
  hl(L.mLoop, t + 0.4);
  tl.to(fCall, { autoAlpha: 1, y: 0, duration: 0.15 }, t + 0.42);
  draw("ref", t + 0.44);
  NODES.forEach((_, k) => {
    const a = t + 0.5 + k * 0.16;
    tl.to(nodes[k], { autoAlpha: 1, scale: 1, duration: 0.14, ease: "back.out(2)" }, a);
    if (k === 0) {
      setMainHead(1, a + 0.06);
      draw("hA", a + 0.08, 0.14);
    } else {
      setNext(k - 1, 0, 1, a + 0.04);
      draw(["AB", "BC", "CD", "DE"][k - 1], a + 0.06, 0.14);
    }
  });

  // 2 · display 10 … 50
  t = S[1];
  type([L.disp, L.dispFor, L.dispPrint, L.dispNull, L.dispEnd], t, 0.03);
  type([L.show1], t + 0.15);
  hl(L.show1, t + 0.22);
  title(1, t + 0.26);
  erase("ref", t + 0.26);
  setRow("head", 1, t + 0.28);
  typeTerm(0, t + 0.3);
  typeTerm(1, t + 0.32, 0.01);
  hl(L.disp, t + 0.3);
  setRow("t", 1, t + 0.36);
  moveBadge("t", badgeAt("t", A), t + 0.36);
  stops.push(t + 0.4);
  let e = displayWalk([A, B, Cc, D, E], out1, 0, 1, 1, t + 0.45);
  hide([badge("t"), condReg], e);

  // 3 · deleteBegin
  t = S[2];
  type([L.db, L.dbEmpty, L.dbP, L.dbHead, L.dbDelete, L.dbEnd], t, 0.03);
  type([L.delB], t + 0.2);
  hl(L.delB, t + 0.28);
  title(2, t + 0.32);
  setRow("head", 0, t + 0.32);
  setRow("t", 0, t + 0.32, false);
  draw("ref", t + 0.34);
  hl(L.db, t + 0.36);
  hl(L.dbEmpty, t + 0.42);
  hl(L.dbP, t + 0.5);
  setRow("p", 1, t + 0.52);
  moveBadge("p", badgeAt("p", A), t + 0.52);
  stops.push(t + 0.62);
  hl(L.dbHead, t + 0.66);
  setMainHead(2, t + 0.7);
  erase("hA", t + 0.7);
  draw("hB", t + 0.76);
  stops.push(t + 0.98);
  hl(L.dbDelete, t + 1.02);
  free(A, t + 1.05);
  erase("AB", t + 1.1);
  hide(badge("p"), t + 1.25);

  // 4 · deleteEnd
  t = S[3];
  type([L.de, L.deEmpty, L.deOne, L.deOne + 1, L.deOne + 2, L.deOne + 3, L.deOne + 4, L.deT, L.deWalk, L.deDelete, L.deNull, L.deEnd], t, 0.022);
  type([L.delE], t + 0.3);
  hl(L.delE, t + 0.36);
  title(3, t + 0.4);
  setRow("p", 0, t + 0.4, false);
  hl(L.de, t + 0.44);
  hl(L.deEmpty, t + 0.5);
  hl(L.deOne, t + 0.56);
  hl(L.deT, t + 0.64);
  setRow("t", 7, t + 0.66);
  moveBadge("t", badgeAt("t", B), t + 0.66);
  stops.push(t + 0.74);
  [B, Cc, D].forEach((k, n) => {
    const a = t + 0.78 + n * 0.3;
    hl(L.deWalk, a);
    setCond(7 + n, a);
    if (n < 2) {
      setRow("t", 8 + n, a + 0.12);
      moveBadge("t", badgeAt("t", [Cc, D][n]), a + 0.12);
    }
    stops.push(a + 0.3);
  });
  const a = t + 0.78 + 3 * 0.3;
  hl(L.deDelete, a);
  free(E, a + 0.03);
  hide(path("DE"), a + 0.1, 0.02);
  show(path("DX"), a + 0.1, 0.06);
  show(dangling, a + 0.15);
  stops.push(a + 0.35);
  hl(L.deNull, a + 0.4);
  setNext(D, 1, 2, a + 0.42);
  hide(path("DX"), a + 0.44, 0.12);
  hide([dangling, badge("t"), condReg], a + 0.5);

  // 5 · deleteAt(head, 1)
  t = S[4];
  type([L.da, L.daZero, L.daZero + 1, L.daZero + 2, L.daZero + 3, L.daT, L.daFor, L.daHop, L.daCheck, L.daCheck + 1, L.daCheck + 2, L.daCheck + 3, L.daP, L.daBypass, L.daDelete, L.daEnd], t, 0.02);
  type([L.delAt], t + 0.36);
  hl(L.delAt, t + 0.42);
  title(4, t + 0.46);
  setRow("pos", 1, t + 0.48);
  hl(L.da, t + 0.5);
  hl(L.daZero, t + 0.55);
  hl(L.daT, t + 0.62);
  setRow("t", 10, t + 0.64);
  moveBadge("t", badgeAt("t", B), t + 0.64);
  hl(L.daFor, t + 0.72);
  setRow("i", 1, t + 0.74);
  setCond(10, t + 0.74);
  hl(L.daCheck, t + 0.84);
  stops.push(t + 0.92);
  hl(L.daP, t + 0.96);
  setRow("p", 2, t + 0.98);
  moveBadge("p", badgeAt("p", Cc), t + 0.98);
  flash(nodes[Cc].querySelector(".lnode__box")!, t + 1.0, "#f4b7a9");
  stops.push(t + 1.1);
  hl(L.daBypass, t + 1.14);
  setNext(B, 1, 2, t + 1.16);
  erase("BC", t + 1.18);
  draw("BD", t + 1.24);
  stops.push(t + 1.45);
  hl(L.daDelete, t + 1.5);
  free(Cc, t + 1.52);
  erase("CD", t + 1.58);
  hide([badge("p"), badge("t"), condReg], t + 1.72);

  // 6 · display 20 → 40
  t = S[5];
  type([L.show2], t);
  hl(L.show2, t + 0.06);
  title(5, t + 0.1);
  erase("ref", t + 0.1);
  setRow("head", 2, t + 0.12);
  setRow("pos", 0, t + 0.12, false);
  setRow("i", 0, t + 0.12, false);
  setRow("p", 0, t + 0.12, false);
  typeTerm(2, t + 0.16, 0.01);
  hl(L.disp, t + 0.16);
  setRow("t", 11, t + 0.2);
  moveBadge("t", badgeAt("t", B), t + 0.2);
  stops.push(t + 0.26);
  e = displayWalk([B, D], out2, 6, 11, 11, t + 0.3);
  hide([badge("t"), condReg], e);

  // 7 · cost
  t = S[6];
  tl.to(fCall, { autoAlpha: 0, y: -12, duration: 0.18 }, t);
  type([L.mRet], t);
  hl(L.mRet, t + 0.05);
  hlOff(t + 0.2);
  show(cost, t + 0.2);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.55);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.73);

  tl.set({}, {}, totalWeight(STEPS));
  return { tl, stops };
};

export default function Stage() {
  return (
    <Lab steps={STEPS} build={build} className="lab--dense lab--ll">
      <CodePanel file="delete_list.cpp" program={PROGRAM} />

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
              <marker id="ld-head" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L10 5 L0 10 z" fill="#1b1915" />
              </marker>
            </defs>
            {ARROWS.map((n) => (
              <path
                key={n}
                className={`larrow${n.startsWith("h") ? " larrow--ptr" : ""}${n === "ref" ? " larrow--ref" : ""}${n === "DX" ? " larrow--dangle" : ""}`}
                data-ptr={n}
                markerEnd="url(#ld-head)"
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
                <Odo items={["NULL", ADDR[A], ADDR[B]]} />
              </div>
            </div>
          </div>

          <div className="heap">
            <span className="heap__k">heap</span>
            {NODES.map((n, k) => (
              <div className="lnode" key={n.addr} style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}>
                <span className="lnode__addr">{n.addr}</span>
                <div className="lnode__box">
                  <span className="lnode__f lnode__data">
                    <b>{n.v}</b>
                  </span>
                  <span className="lnode__f lnode__next">
                    {NEXTS[k].map((x, i) => (
                      <em className={`lnode__n${x === "NULL" ? " lnode__null" : " lnode__to"}`} key={i}>
                        {x}
                      </em>
                    ))}
                  </span>
                  <span className="lnode__freed">freed</span>
                </div>
                <span className="lnode__fly">{n.v}</span>
              </div>
            ))}
            <span className="lbadge lbadge--p">p</span>
            <span className="lbadge lbadge--t">t</span>
            <span className="ll__dangling">dangling: 0x7B8 → freed memory</span>
          </div>

          <div className="stamp" aria-hidden>
            <span>Deleted</span>
            <small>relink first, then delete</small>
          </div>
        </div>

        <div className="dock dock--ll">
          <div className="ll__cost">
            <div>
              <code>deleteBegin</code>
              <b>O(1)</b>
              <span>head moves one node</span>
            </div>
            <div>
              <code>deleteEnd</code>
              <b>O(n)</b>
              <span>walks to the second-last node</span>
            </div>
            <div>
              <code>deleteAt(pos)</code>
              <b>O(pos)</b>
              <span>walks pos − 1 nodes</span>
            </div>
          </div>
        </div>

        <div className="term">
          <div className="term__line">
            <span className="term__ps">$</span> ./delete_list
          </div>
          {[OUT1.split(" -> ").slice(0, -1), ["20", "40"]].map((vals, line) => (
            <div className="term__line" key={line}>
              {vals.map((v, n) => (
                <span className="term__outslot" key={n}>
                  <span className="term__out">{v} -&gt;</span>{" "}
                </span>
              ))}
              <span className="term__outslot">
                <span className="term__out">NULL</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Lab>
  );
}
