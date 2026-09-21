"use client";

import { gsap } from "@/lib/gsap";
import { delta, helpers, labTimeline, stepStarts, totalWeight, type Build } from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel, Cond, Odo, Reg } from "@/components/lesson/parts";
import { ADDR, LB as L, PROGRAM_B, STEPS_B, VALUES } from "./data";
import { Arrows, Heap, heapGeometry, hideHeap, type BadgeKind } from "./heap";

const N = VALUES.length;
type Var = { id: string; name: string; items: string[] };
const MAIN: Var[] = [
  { id: "m-n", name: "n", items: ["?", String(N)] },
  { id: "m-head", name: "head", items: ["?", ADDR[0]] },
];
const CREATE: Var[] = [
  { id: "c-n", name: "n", items: ["?", String(N)] },
  { id: "c-head", name: "head", items: ["NULL", ADDR[0]] },
  { id: "c-tail", name: "tail", items: ["NULL", ...ADDR] },
  { id: "c-i", name: "i", items: ["?", ...Array.from({ length: N + 1 }, (_, k) => String(k))] },
  { id: "c-p", name: "p", items: ["?", ...ADDR] },
];
const DISPLAY: Var[] = [
  { id: "d-head", name: "head", items: ["?", ADDR[0]] },
  { id: "d-t", name: "t", items: ["?", ...ADDR, "NULL"] },
];
const ALL = [...MAIN, ...CREATE, ...DISPLAY];
const COND = [
  <span key="q">—</span>,
  ...Array.from({ length: N + 1 }, (_, k) => <Cond key={`i${k}`} text={`${k} < ${N}`} ok={k < N} />),
  ...ADDR.map((a) => <Cond key={a} text={`${a} != NULL`} ok />),
  <Cond key="null" text="NULL != NULL" ok={false} />,
];

function Frame({ fn, vars, cls }: { fn: string; vars: Var[]; cls: string }) {
  return (
    <div className={`frame ${cls}`}>
      <span className="frame__k">{fn}</span>
      {vars.map((v) => (
        <div className={`svar svar--${v.id}`} key={v.id}>
          <span className="svar__k">{v.name}</span>
          <Odo items={v.items} />
        </div>
      ))}
    </div>
  );
}

const build: Build = (el) => {
  const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const one = (s: string) => el.querySelector<HTMLElement>(s)!;

  const zone = one(".mem");
  const fMain = one(".frame--main");
  const fCreate = one(".frame--create");
  const fDisplay = one(".frame--display");
  const v = Object.fromEntries(ALL.map((x) => [x.id, one(`.svar--${x.id}`)]));
  const nodes = all(".lnode");
  const vals = all(".lnode__v");
  const qs = all(".lnode__q");
  const nulls = all(".lnode__null");
  const tos = all(".lnode__to");
  const flys = all(".lnode__fly");
  const links = all(".larrow--link");
  const arrow = (n: string) => one(`.larrow[data-ptr="${n}"]`);
  const badge = (k: BadgeKind) => one(`.lbadge--${k}`);
  const lnull = one(".lnull");
  const survive = one(".heap__survive");
  const chips = all(".ll__chip");
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
  arrow("mhead").setAttribute("d", g.fromVar(v["m-head"], 0));
  arrow("chead").setAttribute("d", g.fromVar(v["c-head"], 0));
  arrow("dhead").setAttribute("d", g.fromVar(v["d-head"], 0));
  const tokToN = delta(toks[0], v["m-n"]);
  const tokToNode = toks.slice(1).map((t, k) => delta(t, nodes[k].querySelector(".lnode__data")!));
  const outFly = outSlots.slice(0, N).map((o, k) => delta(flys[k], o));
  const zr = zone.getBoundingClientRect();
  const center = (e: Element) => {
    const r = e.getBoundingClientRect();
    return { left: r.left - zr.left + r.width - 30, top: r.top - zr.top + r.height / 2 };
  };
  const chipAt = { mn: center(v["m-n"]), cn: center(v["c-n"]), ch: center(v["c-head"]), mh: center(v["m-head"]), dh: center(v["d-head"]) };

  hideHeap(zone);
  gsap.set([fMain, fCreate, fDisplay], { autoAlpha: 0 });
  gsap.set([fCreate, fDisplay], { y: -16 });
  gsap.set([survive, ...chips, condReg, stdin], { autoAlpha: 0 });
  gsap.set(chips, { xPercent: -50, yPercent: -50 });
  gsap.set(toks, { autoAlpha: 0, y: 10 });
  gsap.set(outs, { autoAlpha: 0 });
  gsap.set(stamp, { autoAlpha: 0, scale: 1.8, rotation: -2, xPercent: -50, yPercent: -50 });
  (["p", "tail", "t"] as BadgeKind[]).forEach((k) => gsap.set(badge(k), g.badge(k, 0)));

  // ---------- master timeline ----------
  const S = stepStarts(STEPS_B);
  const tl = labTimeline();
  const stops: number[] = [];
  const { type, typeTerm, hl, hlOff, odo, flash } = helpers(tl, el, PROGRAM_B);
  const setVar = (id: string, idx: number, at: number) => {
    odo(v[id].querySelector<HTMLElement>(".odo__col")!, ALL.find((x) => x.id === id)!.items.length, idx, at);
    flash(v[id], at);
  };
  const setCond = (idx: number, at: number) => odo(condCol, COND.length, idx, at);
  const show = (t: gsap.TweenTarget, at: number, d = 0.12) => tl.to(t, { autoAlpha: 1, duration: d }, at);
  const hide = (t: gsap.TweenTarget, at: number, d = 0.1) => tl.to(t, { autoAlpha: 0, duration: d }, at);
  const moveBadge = (kind: BadgeKind, k: number, at: number) =>
    tl.to(badge(kind), { ...g.badge(kind, k), autoAlpha: 1, duration: 0.16, ease: "power2.inOut" }, at);
  const draw = (path: HTMLElement, at: number) => {
    tl.set(path, { autoAlpha: 1 }, at);
    tl.to(path, { drawSVG: "100%", duration: 0.2, ease: "power2.inOut" }, at);
  };
  /** A value chip copies from one variable box to another. */
  const copy = (n: number, from: { left: number; top: number }, to: { left: number; top: number }, at: number) => {
    gsap.set(chips[n], from);
    tl.to(chips[n], { autoAlpha: 1, duration: 0.04 }, at);
    tl.to(chips[n], { ...to, duration: 0.22, ease: "power2.inOut" }, at + 0.04);
    tl.to(chips[n], { autoAlpha: 0, duration: 0.04 }, at + 0.26);
  };

  // 1 · main asks for n
  let t = S[0];
  type([L.include, L.using, L.struct, L.struct + 1, L.struct + 2, L.structEnd], t, 0.03);
  type([L.main, L.n, L.ask, L.readN, L.end], t + 0.2, 0.04);
  show(fMain, t + 0.4);
  hl(L.n, t + 0.45);
  typeTerm(0, t + 0.5);
  hl(L.ask, t + 0.55);
  typeTerm(1, t + 0.57);
  tl.to(stdin, { autoAlpha: 1, duration: 0.08 }, t + 0.62);
  tl.to(toks, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.08 }, t + 0.64);
  typeTerm(2, t + 0.66);
  hl(L.readN, t + 0.72);
  tl.to(toks[0], { x: tokToN.x, y: tokToN.y, duration: 0.12, ease: "power2.in" }, t + 0.74);
  hide(toks[0], t + 0.86, 0.02);
  setVar("m-n", 1, t + 0.86);

  // 2 · call create(n): new frame
  t = S[1];
  type([L.call], t);
  hl(L.call, t + 0.1);
  type([L.create, L.locals, L.loop, L.alloc, L.read, L.setNull, L.ifHead, L.link, L.moveTail, L.loopEnd, L.ret, L.createEnd], t + 0.15, 0.025);
  hl(L.create, t + 0.5);
  tl.to(fCreate, { autoAlpha: 1, y: 0, duration: 0.2, ease: "back.out(1.6)" }, t + 0.5);
  copy(0, chipAt.mn, chipAt.cn, t + 0.6);
  setVar("c-n", 1, t + 0.86);
  hl(L.locals, t + 0.95);

  // 3 · create builds the chain
  t = S[2];
  for (let k = 0; k < N; k++) {
    const a = t + 0.05 + k * 0.75;
    hl(L.loop, a);
    setVar("c-i", k + 1, a);
    show(condReg, a, 0.06);
    setCond(k + 1, a);
    hl(L.alloc, a + 0.08);
    tl.to(nodes[k], { autoAlpha: 1, scale: 1, duration: 0.16, ease: "back.out(2)" }, a + 0.1);
    setVar("c-p", k + 1, a + 0.14);
    moveBadge("p", k, a + 0.14);
    hl(L.read, a + 0.22);
    tl.to(toks[k + 1], { x: tokToNode[k].x, y: tokToNode[k].y, duration: 0.12, ease: "power2.in" }, a + 0.24);
    hide([toks[k + 1], qs[k * 2]], a + 0.36, 0.02);
    tl.to(vals[k], { autoAlpha: 1, duration: 0.06 }, a + 0.36);
    hl(L.setNull, a + 0.4);
    hide(qs[k * 2 + 1], a + 0.42, 0.03);
    tl.to(nulls[k], { autoAlpha: 1, duration: 0.06 }, a + 0.44);
    hl(L.ifHead, a + 0.48);
    if (k === 0) {
      setVar("c-head", 1, a + 0.52);
      draw(arrow("chead"), a + 0.54);
    } else {
      hl(L.link, a + 0.52);
      hide(nulls[k - 1], a + 0.54, 0.04);
      tl.to(tos[k - 1], { autoAlpha: 1, duration: 0.05 }, a + 0.56);
      draw(links[k - 1], a + 0.56);
    }
    hl(L.moveTail, a + 0.62);
    setVar("c-tail", k + 1, a + 0.64);
    moveBadge("tail", k, a + 0.64);
    stops.push(a + 0.75);
  }
  const E = t + 0.05 + N * 0.75;
  hl(L.loop, E);
  setVar("c-i", N + 1, E);
  setCond(N + 1, E);

  // 4 · return head; the frame is wiped, the heap survives
  t = S[3];
  hl(L.ret, t);
  copy(1, chipAt.ch, chipAt.mh, t + 0.08);
  hl(L.call, t + 0.36);
  setVar("m-head", 1, t + 0.36);
  draw(arrow("mhead"), t + 0.4);
  stops.push(t + 0.6);
  tl.to(fCreate, { autoAlpha: 0, y: -16, duration: 0.25, ease: "power2.in" }, t + 0.65);
  hide([arrow("chead"), badge("p"), badge("tail"), condReg], t + 0.65, 0.2);
  show(survive, t + 0.9, 0.15);
  flash(nodes.map((n) => n.querySelector(".lnode__box")!), t + 0.9);

  // 5 · display(head)
  t = S[4];
  hide(survive, t);
  type([L.display, L.dloop, L.dprint, L.dnull, L.displayEnd], t, 0.04);
  type([L.show], t + 0.2);
  hl(L.show, t + 0.3);
  tl.to(fDisplay, { autoAlpha: 1, y: 0, duration: 0.2, ease: "back.out(1.6)" }, t + 0.35);
  copy(2, chipAt.mh, chipAt.dh, t + 0.4);
  setVar("d-head", 1, t + 0.66);
  draw(arrow("dhead"), t + 0.66);
  hl(L.display, t + 0.66);
  hl(L.dloop, t + 0.72);
  setVar("d-t", 1, t + 0.74);
  moveBadge("t", 0, t + 0.74);
  typeTerm(3, t + 0.76, 0.01);
  stops.push(t + 0.8);
  for (let k = 0; k < N; k++) {
    const a = t + 0.85 + k * 0.38;
    hl(L.dloop, a);
    show(condReg, a, 0.05);
    setCond(N + 2 + k, a);
    hl(L.dprint, a + 0.06);
    tl.set(flys[k], { autoAlpha: 1 }, a + 0.08);
    tl.to(flys[k], { x: outFly[k].x, y: outFly[k].y, duration: 0.16, ease: "power2.inOut" }, a + 0.08);
    tl.set(flys[k], { autoAlpha: 0 }, a + 0.24);
    show(outs[k], a + 0.23, 0.04);
    hl(L.dloop, a + 0.26);
    setVar("d-t", k + 2, a + 0.28);
    if (k === N - 1) show(lnull, a + 0.26, 0.06);
    moveBadge("t", k === N - 1 ? -1 : k + 1, a + 0.28);
    stops.push(a + 0.38);
  }
  const D = t + 0.85 + N * 0.38;
  setCond(COND.length - 1, D);
  hl(L.dnull, D + 0.06);
  show(outs[N], D + 0.08, 0.06);
  tl.to(fDisplay, { autoAlpha: 0, y: -16, duration: 0.2, ease: "power2.in" }, D + 0.2);
  hide([arrow("dhead"), badge("t"), condReg], D + 0.2, 0.15);

  // 6 · done
  t = S[5];
  type([L.mret], t);
  hl(L.mret, t + 0.05);
  hl(L.end, t + 0.15);
  hlOff(t + 0.25);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.3);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.48);

  tl.set({}, {}, totalWeight(STEPS_B));
  return { tl, stops };
};

export default function StageB() {
  return (
    <Lab steps={STEPS_B} build={build} className="lab--dense lab--ll">
      <CodePanel file="list2.cpp" program={PROGRAM_B} />

      <div className="viz">
        <div className="viz__head">
          <span className="viz__title">memory · with functions</span>
          <div className="regs">
            <Reg className="reg--cond" items={COND} />
          </div>
        </div>

        <div className="mem mem--ll">
          <Arrows named={["mhead", "chead", "dhead"]} />
          <div className="stack">
            <span className="stack__k">stack</span>
            <div className="stack__top">
              <Frame fn="create(n)" vars={CREATE} cls="frame--create" />
              <Frame fn="display(head)" vars={DISPLAY} cls="frame--display" />
            </div>
            <Frame fn="main()" vars={MAIN} cls="frame--main" />
          </div>
          <Heap />
          <span className="heap__survive">create() has returned, but its nodes are still on the heap</span>
          {[String(N), ADDR[0], ADDR[0]].map((c, k) => (
            <span className="ll__chip" key={k} aria-hidden>
              {c}
            </span>
          ))}
          <div className="stamp" aria-hidden>
            <span>Solved</span>
            <small>create() returns Node* · display() takes Node*</small>
          </div>
        </div>

        <div className="stdin">
          <span className="stdin__k">stdin</span>
          {[N, ...VALUES].map((x, k) => (
            <span className="stdin__slot" key={k}>
              <span className="stdin__tok">{x}</span>
            </span>
          ))}
        </div>

        <div className="term">
          <div className="term__line">
            <span className="term__ps">$</span> ./list2
          </div>
          <div className="term__line">
            How many nodes? <span className="term__in">{N}</span>
          </div>
          <div className="term__line term__in">{VALUES.join(" ")}</div>
          <div className="term__line">
            {VALUES.map((x, k) => (
              <span className="term__outslot" key={k}>
                <span className="term__out">{x} -&gt;</span>{" "}
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
