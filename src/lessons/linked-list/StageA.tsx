"use client";

import { gsap } from "@/lib/gsap";
import { delta, helpers, labTimeline, stepStarts, totalWeight, type Build } from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel, Cond, Odo, Reg } from "@/components/lesson/parts";
import { ADDR, LA as L, PROGRAM_A, STEPS_A, VALUES } from "./data";
import { Arrows, Heap, heapGeometry, hideHeap, type BadgeKind } from "./heap";

const N = VALUES.length;
const VARS: { name: string; items: string[] }[] = [
  { name: "n", items: ["?", String(N)] },
  { name: "x", items: ["?", ...VALUES.map(String)] },
  { name: "i", items: ["?", ...Array.from({ length: N + 1 }, (_, k) => String(k))] },
  { name: "head", items: ["NULL", ADDR[0]] },
  { name: "tail", items: ["NULL", ...ADDR] },
  { name: "p", items: ["?", ...ADDR] },
  { name: "t", items: ["?", ...ADDR, "NULL"] },
];
const COND = [
  <span key="q">—</span>,
  ...Array.from({ length: N + 1 }, (_, k) => <Cond key={`i${k}`} text={`${k} < ${N}`} ok={k < N} />),
  ...ADDR.map((a) => <Cond key={a} text={`${a} != NULL`} ok />),
  <Cond key="null" text="NULL != NULL" ok={false} />,
];

const build: Build = (el) => {
  const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const one = (s: string) => el.querySelector<HTMLElement>(s)!;

  const zone = one(".mem");
  const frame = one(".frame--main");
  const vars = Object.fromEntries(VARS.map((v) => [v.name, one(`.svar--${v.name}`)]));
  const col = (name: string) => vars[name].querySelector<HTMLElement>(".odo__col")!;
  const nodes = all(".lnode");
  const vals = all(".lnode__v");
  const qs = all(".lnode__q");
  const nulls = all(".lnode__null");
  const tos = all(".lnode__to");
  const flys = all(".lnode__fly");
  const links = all(".larrow--link");
  const headArrow = one('.larrow[data-ptr="head"]');
  const badge = (k: BadgeKind) => one(`.lbadge--${k}`);
  const lnull = one(".lnull");
  const anat = one(".anat");
  const condReg = one(".reg--cond");
  const condCol = one(".reg--cond .odo__col");
  const stdin = one(".stdin");
  const toks = all(".stdin__tok");
  const outs = all(".term__out");
  const outSlots = all(".term__outslot");
  const stamp = one(".stamp");

  // ---------- measure, then hide ----------
  const g = heapGeometry(zone);
  links.forEach((p, k) => p.setAttribute("d", g.link(k)));
  headArrow.setAttribute("d", g.fromVar(vars.head, 0));
  const tokFly = toks.map((t, k) => delta(t, k === 0 ? vars.n : vars.x));
  const outFly = outSlots.slice(0, N).map((o, k) => delta(flys[k], o));

  hideHeap(zone);
  gsap.set(frame, { autoAlpha: 0 });
  gsap.set(Object.values(vars), { autoAlpha: 0, x: -8 });
  gsap.set(anat, { autoAlpha: 0, scale: 0.9 });
  gsap.set([condReg, stdin], { autoAlpha: 0 });
  gsap.set(toks, { autoAlpha: 0, y: 10 });
  gsap.set(outs, { autoAlpha: 0 });
  gsap.set(stamp, { autoAlpha: 0, scale: 1.8, rotation: -2, xPercent: -50, yPercent: -50 });

  // ---------- master timeline ----------
  const S = stepStarts(STEPS_A);
  const tl = labTimeline();
  const stops: number[] = [];
  const { type, typeTerm, hl, hlOff, odo, flash } = helpers(tl, el, PROGRAM_A);
  const setVar = (name: string, idx: number, at: number) => {
    odo(col(name), VARS.find((v) => v.name === name)!.items.length, idx, at);
    flash(vars[name], at);
  };
  const setCond = (idx: number, at: number) => odo(condCol, COND.length, idx, at);
  const show = (t: gsap.TweenTarget, at: number, d = 0.12) => tl.to(t, { autoAlpha: 1, duration: d }, at);
  const hide = (t: gsap.TweenTarget, at: number, d = 0.1) => tl.to(t, { autoAlpha: 0, duration: d }, at);
  const moveBadge = (kind: BadgeKind, k: number, at: number) =>
    tl.to(badge(kind), { ...g.badge(kind, k), autoAlpha: 1, duration: 0.18, ease: "power2.inOut" }, at);
  const draw = (path: HTMLElement, at: number) => {
    tl.set(path, { autoAlpha: 1 }, at);
    tl.to(path, { drawSVG: "100%", duration: 0.22, ease: "power2.inOut" }, at);
  };

  // badges start where they will first appear
  (["p", "tail", "t"] as BadgeKind[]).forEach((k) => gsap.set(badge(k), g.badge(k, 0)));

  // 1 · anatomy of a node
  let t = S[0];
  type([L.include, L.using, L.struct, L.data, L.next, L.structEnd], t, 0.05);
  hl(L.struct, t + 0.35);
  tl.to(anat, { autoAlpha: 1, scale: 1, duration: 0.2, ease: "back.out(2)" }, t + 0.4);
  hl(L.data, t + 0.6);
  flash(one(".anat__data"), t + 0.62);
  hl(L.next, t + 0.8);
  flash(one(".anat__next"), t + 0.82);

  // 2 · empty list
  t = S[1];
  hide(anat, t);
  type([L.main, L.head, L.tail, L.vars, L.ask, L.readN, L.end], t, 0.04);
  show(frame, t + 0.25);
  hl(L.head, t + 0.3);
  tl.to(vars.head, { autoAlpha: 1, x: 0, duration: 0.1 }, t + 0.32);
  hl(L.tail, t + 0.4);
  tl.to(vars.tail, { autoAlpha: 1, x: 0, duration: 0.1 }, t + 0.42);
  hl(L.vars, t + 0.5);
  tl.to([vars.n, vars.x], { autoAlpha: 1, x: 0, duration: 0.1 }, t + 0.52);
  typeTerm(0, t + 0.55);
  hl(L.ask, t + 0.62);
  typeTerm(1, t + 0.64);
  tl.to(stdin, { autoAlpha: 1, duration: 0.08 }, t + 0.7);
  tl.to(toks, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.08 }, t + 0.72);
  typeTerm(2, t + 0.74);
  hl(L.readN, t + 0.8);
  tl.to(toks[0], { x: tokFly[0].x, y: tokFly[0].y, duration: 0.12, ease: "power2.in" }, t + 0.82);
  hide(toks[0], t + 0.94, 0.02);
  setVar("n", 1, t + 0.94);

  // 3 & 4 · the creation loop, one node at a time
  const nodeAt = (k: number, a: number) => {
    hl(L.loop, a);
    if (k === 0) tl.to([vars.i, vars.p], { autoAlpha: 1, x: 0, duration: 0.1 }, a);
    setVar("i", k + 1, a);
    show(condReg, a, 0.08);
    setCond(k + 1, a);
    hl(L.readX, a + 0.08);
    tl.to(toks[k + 1], { x: tokFly[k + 1].x, y: tokFly[k + 1].y, duration: 0.12, ease: "power2.in" }, a + 0.1);
    hide(toks[k + 1], a + 0.22, 0.02);
    setVar("x", k + 1, a + 0.22);
    hl(L.alloc, a + 0.26);
    tl.to(nodes[k], { autoAlpha: 1, scale: 1, duration: 0.18, ease: "back.out(2)" }, a + 0.28);
    setVar("p", k + 1, a + 0.34);
    moveBadge("p", k, a + 0.34);
    hl(L.setData, a + 0.42);
    hide(qs[k * 2], a + 0.44, 0.04);
    tl.to(vals[k], { autoAlpha: 1, duration: 0.08 }, a + 0.46);
    flash(nodes[k].querySelector(".lnode__data")!, a + 0.46);
    hl(L.setNull, a + 0.52);
    hide(qs[k * 2 + 1], a + 0.54, 0.04);
    tl.to(nulls[k], { autoAlpha: 1, duration: 0.08 }, a + 0.56);
    stops.push(a + 0.6);
    hl(L.ifHead, a + 0.64);
    if (k === 0) {
      setVar("head", 1, a + 0.7);
      draw(headArrow, a + 0.72);
    } else {
      hl(L.link, a + 0.72);
      hide(nulls[k - 1], a + 0.74, 0.05);
      tl.to(tos[k - 1], { autoAlpha: 1, duration: 0.06 }, a + 0.78);
      flash(nodes[k - 1].querySelector(".lnode__next")!, a + 0.78);
      draw(links[k - 1], a + 0.78);
    }
    hl(L.moveTail, a + 0.86);
    setVar("tail", k + 1, a + 0.88);
    moveBadge("tail", k, a + 0.88);
    stops.push(a + 1.0);
  };
  t = S[2];
  type([L.loop, L.readX, L.alloc, L.setData, L.setNull, L.ifHead, L.link, L.moveTail, L.loopEnd], t, 0.03);
  nodeAt(0, t + 0.3);
  t = S[3];
  for (let k = 1; k < N; k++) nodeAt(k, t + 0.05 + (k - 1) * 1.0);
  const E = t + 0.05 + (N - 1) * 1.0;
  hl(L.loop, E);
  setVar("i", N + 1, E);
  setCond(N + 1, E);
  hide(badge("p"), E + 0.08);
  tl.to(vars.p, { opacity: 0.35, duration: 0.1 }, E + 0.08);

  // 5 · display: follow the arrows
  t = S[4];
  type([L.tInit, L.while, L.print, L.hop, L.whileEnd, L.printNull], t, 0.04);
  hide(badge("tail"), t + 0.25);
  hl(L.tInit, t + 0.3);
  tl.to(vars.t, { autoAlpha: 1, x: 0, duration: 0.1 }, t + 0.3);
  setVar("t", 1, t + 0.32);
  moveBadge("t", 0, t + 0.32);
  typeTerm(3, t + 0.36, 0.01);
  stops.push(t + 0.4);
  for (let k = 0; k < N; k++) {
    const a = t + 0.45 + k * 0.45;
    hl(L.while, a);
    setCond(N + 2 + k, a);
    hl(L.print, a + 0.08);
    tl.set(flys[k], { autoAlpha: 1 }, a + 0.1);
    tl.to(flys[k], { x: outFly[k].x, y: outFly[k].y, duration: 0.18, ease: "power2.inOut" }, a + 0.1);
    tl.set(flys[k], { autoAlpha: 0 }, a + 0.28);
    show(outs[k], a + 0.27, 0.04);
    hl(L.hop, a + 0.3);
    setVar("t", k + 2, a + 0.32);
    if (k === N - 1) show(lnull, a + 0.3, 0.08);
    moveBadge("t", k === N - 1 ? -1 : k + 1, a + 0.32);
    stops.push(a + 0.45);
  }
  const D = t + 0.45 + N * 0.45;
  hl(L.while, D);
  setCond(COND.length - 1, D);
  hl(L.printNull, D + 0.08);
  show(outs[N], D + 0.1, 0.06);

  // 6 · done
  t = S[5];
  hide([badge("t"), condReg], t);
  hl(L.ret, t + 0.05);
  hl(L.end, t + 0.15);
  hlOff(t + 0.25);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.3);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.48);

  tl.set({}, {}, totalWeight(STEPS_A));
  return { tl, stops };
};

export default function StageA() {
  return (
    <Lab steps={STEPS_A} build={build} className="lab--dense lab--ll">
      <CodePanel file="list.cpp" program={PROGRAM_A} />

      <div className="viz">
        <div className="viz__head">
          <span className="viz__title">memory · without functions</span>
          <div className="regs">
            <Reg className="reg--cond" items={COND} />
          </div>
        </div>

        <div className="mem mem--ll">
          <Arrows named={["head"]} />
          <div className="stack">
            <span className="stack__k">stack</span>
            <div className="frame frame--main">
              <span className="frame__k">main()</span>
              {VARS.map((v) => (
                <div className={`svar svar--${v.name}`} key={v.name}>
                  <span className="svar__k">{v.name}</span>
                  <Odo items={v.items} />
                </div>
              ))}
            </div>
          </div>
          <Heap />
          <div className="anat" aria-hidden>
            <span className="anat__title">struct Node</span>
            <div className="anat__box">
              <span className="anat__data">
                data
                <small>int · the value</small>
              </span>
              <span className="anat__next">
                next
                <small>Node* · address of the next node</small>
              </span>
            </div>
          </div>
          <div className="stamp" aria-hidden>
            <span>Solved</span>
            <small>create O(n) · display O(n)</small>
          </div>
        </div>

        <div className="stdin">
          <span className="stdin__k">stdin</span>
          {[N, ...VALUES].map((v, k) => (
            <span className="stdin__slot" key={k}>
              <span className="stdin__tok">{v}</span>
            </span>
          ))}
        </div>

        <div className="term">
          <div className="term__line">
            <span className="term__ps">$</span> ./list
          </div>
          <div className="term__line">
            How many nodes? <span className="term__in">{N}</span>
          </div>
          <div className="term__line term__in">{VALUES.join(" ")}</div>
          <div className="term__line">
            {VALUES.map((v, k) => (
              <span className="term__outslot" key={k}>
                <span className="term__out">{v} -&gt;</span>{" "}
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
