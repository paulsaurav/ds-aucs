"use client";

import { gsap } from "@/lib/gsap";
import { C, delta, helpers, labTimeline, stepStarts, totalWeight, type Build } from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel, Odo, Reg } from "@/components/lesson/parts";
import { FIRST, L, PROGRAM, SECOND, SHOWN, SIZE, STEPS, WALK } from "./data";

const FRONT_ODO = ["-1", "0", "1", "2"];
const REAR_ODO = ["-1", "0", "1", "2", "3", "4", "0", "1"];
const I_ODO = ["?", "2", "3", "4", "0", "1"];
const FORMULA = [
  "front = rear = -1 · empty",
  "rear = (-1 + 1) % 5 = 0",
  "rear = (0 + 1) % 5 = 1",
  "rear = (1 + 1) % 5 = 2",
  "rear = (2 + 1) % 5 = 3",
  "rear = (3 + 1) % 5 = 4",
  "(4 + 1) % 5 = 0 == front → full",
  "front = (0 + 1) % 5 = 1",
  "front = (1 + 1) % 5 = 2",
  "rear = (4 + 1) % 5 = 0 · wrapped",
  "rear = (0 + 1) % 5 = 1",
  "i = front = 2",
  "i = (2 + 1) % 5 = 3",
  "i = (3 + 1) % 5 = 4",
  "i = (4 + 1) % 5 = 0 · wrapped",
  "i = (0 + 1) % 5 = 1",
  "i == rear · break",
];
const STEP_DEG = 360 / SIZE;
const DIM = "#c9bfa9";

const build: Build = (el) => {
  const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const one = (s: string) => el.querySelector<HTMLElement>(s)!;

  const zone = one(".mem");
  const slots = all(".cq__slot");
  const boxes = all(".cq__box");
  const A = all(".cq__slot .cq__a");
  const B = new Map(all(".cq__slot .cq__b").map((e) => [Number(e.dataset.k), e]));
  const flys = all(".cq__fly");
  const handF = one(".hand--front");
  const handR = one(".hand--rear");
  const tagF = one(".hand--front .hand__tag");
  const tagR = one(".hand--rear .hand__tag");
  const center = one(".cq__center");
  const cur = one(".cqcur");
  const wrap = one(".cq__wrap");
  const wrapLabel = one(".cq__wraplabel");
  const reject = one(".cq__reject");
  const linF = one(".lintag--f");
  const linR = one(".lintag--r");
  const linMsg = one(".lin__msg");
  const mirror = one(".mirror");
  const mA = all(".mirror .cq__a");
  const mB = new Map(all(".mirror .cq__b").map((e) => [Number(e.dataset.k), e]));
  const mBoxes = all(".mirror__box");
  const stamp = one(".stamp");

  const regF = one(".reg--front");
  const regR = one(".reg--rear");
  const regI = one(".reg--i");
  const col = (r: HTMLElement) => r.querySelector<HTMLElement>(".odo__col")!;
  const rules = one(".cq__rules");
  const formula = one(".cqf");
  const fCol = one(".cqf .odo__col");
  const outs = all(".term__out");
  const outSlots = all(".term__outslot");

  // ---------- geometry: ring positions, then the straight line they start in ----------
  const W = zone.clientWidth;
  const H = zone.clientHeight;
  const cx = W * 0.4;
  const cy = H * 0.52;
  const r = Math.min(H * 0.33, 112);
  const ang = (k: number) => ((-90 + k * STEP_DEG) * Math.PI) / 180;
  const ring = FIRST.map((_, k) => ({ x: cx + r * Math.cos(ang(k)), y: cy + r * Math.sin(ang(k)) }));
  slots.forEach((s, k) => gsap.set(s, { left: ring[k].x, top: ring[k].y, xPercent: -50, yPercent: -50 }));
  const slotW = slots[0].offsetWidth - 1.5;
  const line = FIRST.map((_, k) => ({ x: W / 2 + (k - 2) * slotW, y: cy }));
  const lineOff = ring.map((p, k) => ({ x: line[k].x - p.x, y: line[k].y - p.y }));

  const handLen = { f: r * 0.3, r: r * 0.5 };
  gsap.set(handF, { left: cx - 1.5, top: cy - handLen.f, height: handLen.f, transformOrigin: "50% 100%" });
  gsap.set(handR, { left: cx - 1.5, top: cy - handLen.r, height: handLen.r, transformOrigin: "50% 100%" });
  gsap.set(center, { left: cx, top: cy, xPercent: -50, yPercent: -50 });

  // Wrap-around arc outside the ring, from box 4 to box 0.
  const R2 = r + 48;
  const p4 = { x: cx + R2 * Math.cos(ang(4)), y: cy + R2 * Math.sin(ang(4)) };
  const p0 = { x: cx + R2 * Math.cos(ang(-0.3)), y: cy + R2 * Math.sin(ang(-0.3)) };
  wrap.setAttribute("d", `M ${p4.x} ${p4.y} A ${R2} ${R2} 0 0 1 ${p0.x} ${p0.y}`);
  gsap.set(wrapLabel, { left: cx + (R2 + 8) * Math.cos(ang(4.55)), top: cy + (R2 + 8) * Math.sin(ang(4.55)), xPercent: -50, yPercent: -100 });
  gsap.set(reject, { left: cx + (r + 70) * Math.cos(ang(0.5)), top: cy + (r + 20) * Math.sin(ang(0.5)) - 20, xPercent: -50, yPercent: -50 });

  // Flights measured with the slots in ring position (before the line offsets are applied).
  const outFly = outSlots.map((o, n) => {
    const s = n < 2 ? n : WALK[n - 2];
    return delta(o, boxes[s]);
  });

  // ---------- initial state ----------
  slots.forEach((s, k) => gsap.set(s, { x: lineOff[k].x, y: lineOff[k].y, autoAlpha: 0 }));
  gsap.set([...A, ...B.values(), ...mA, ...mB.values()], { autoAlpha: 0, y: -12 });
  gsap.set(flys, { autoAlpha: 0 });
  gsap.set([handF, handR], { autoAlpha: 0, rotation: 0 });
  gsap.set(center, { autoAlpha: 0 });
  gsap.set(cur, { autoAlpha: 0, left: ring[2].x, top: ring[2].y, xPercent: -50, yPercent: -50 });
  gsap.set(wrap, { drawSVG: "0%", autoAlpha: 0 });
  gsap.set([wrapLabel, reject, linF, linR, linMsg, mirror], { autoAlpha: 0 });
  gsap.set(linF, { left: line[0].x, top: cy + 36, xPercent: -50 });
  gsap.set(linR, { left: line[0].x, top: cy + 56, xPercent: -50 });
  gsap.set(linMsg, { left: W / 2, top: cy - 70, xPercent: -50 });
  gsap.set([regF, regR, regI], { autoAlpha: 0, y: 8 });
  gsap.set([rules, formula], { autoAlpha: 0 });
  gsap.set(outs, { autoAlpha: 0 });
  gsap.set(stamp, { autoAlpha: 0, scale: 1.8, rotation: -2, xPercent: -50, yPercent: -50 });

  // ---------- master timeline ----------
  const S = stepStarts(STEPS);
  const tl = labTimeline();
  const stops: number[] = [];
  const { type, typeTerm, hl, hlOff, odo, flash } = helpers(tl, el, PROGRAM);
  const show = (t: gsap.TweenTarget, at: number, d = 0.12) => tl.to(t, { autoAlpha: 1, duration: d }, at);
  const hide = (t: gsap.TweenTarget, at: number, d = 0.1) => tl.to(t, { autoAlpha: 0, duration: d }, at);
  const drop = (t: gsap.TweenTarget, at: number) => tl.to(t, { autoAlpha: 1, y: 0, duration: 0.14, ease: "back.out(3)" }, at);
  const fx = (idx: number, at: number) => odo(fCol, FORMULA.length, idx, at);
  // Hands keep a running angle so they always turn clockwise.
  const turn = (hand: HTMLElement, tag: HTMLElement, deg: number, at: number) => {
    tl.to(hand, { rotation: deg, duration: 0.22, ease: "power2.inOut" }, at);
    tl.to(tag, { rotation: -deg, duration: 0.22, ease: "power2.inOut" }, at);
  };

  // 1 · a straight array with two markers
  let t = S[0];
  type([L.include, L.using, L.define, L.arr, L.ptrs], t, 0.05);
  hl(L.arr, t + 0.3);
  tl.to(slots, { autoAlpha: 1, stagger: 0.05, duration: 0.15 }, t + 0.32);
  hl(L.ptrs, t + 0.6);
  tl.to([regF, regR], { autoAlpha: 1, y: 0, duration: 0.12 }, t + 0.62);
  show(formula, t + 0.7);

  // 2 · the straight-line problem
  t = S[1];
  show([linF, linR], t);
  FIRST.forEach((_, k) => {
    drop(A[k], t + 0.08 + k * 0.08);
    tl.to(linR, { left: line[k].x, duration: 0.06 }, t + 0.08 + k * 0.08);
  });
  stops.push(t + 0.6);
  [0, 1].forEach((k) => {
    tl.to(A[k], { color: DIM, duration: 0.1 }, t + 0.7 + k * 0.2);
    tl.to(boxes[k], { backgroundColor: "#e4dccb", duration: 0.1 }, t + 0.7 + k * 0.2);
    tl.to(linF, { left: line[k + 1].x, duration: 0.1 }, t + 0.72 + k * 0.2);
  });
  stops.push(t + 1.15);
  show(linMsg, t + 1.2);
  tl.set(boxes.slice(0, 2), { outline: "2.5px solid #d8432a" }, t + 1.25);

  // 3 · bend the line into a ring
  t = S[2];
  hide([linMsg, linF, linR, ...A], t);
  tl.set(boxes, { outline: "0px solid transparent" }, t);
  tl.to(boxes, { backgroundColor: C.cell, duration: 0.1 }, t);
  tl.to(A.slice(0, 2), { color: C.ink, duration: 0.01 }, t + 0.1);
  tl.to(slots, { x: 0, y: 0, duration: 0.55, ease: "power3.inOut", stagger: 0.04 }, t + 0.15);
  tl.set(wrap, { autoAlpha: 1 }, t + 0.8);
  tl.to(wrap, { drawSVG: "100%", duration: 0.35, ease: "power2.inOut" }, t + 0.8);
  show(wrapLabel, t + 1.0);
  show([center, mirror], t + 1.05);

  // 4 · isFull / isEmpty
  t = S[3];
  type([L.isFull, L.isFullRet, L.isFull + 2, L.isEmpty, L.isEmptyRet, L.isEmpty + 2], t, 0.04);
  hide(formula, t);
  show(rules, t + 0.25);
  hl(L.isFullRet, t + 0.3);
  hl(L.isEmptyRet, t + 0.6);

  // 5 · enqueue 10 … 50
  t = S[4];
  type([L.enq, L.enqFull, L.enqFullMsg, L.enqFullRet, L.enqFull + 3, L.enqFirst, L.enqRear, L.enqStore, L.enqEnd], t, 0.035);
  type([L.main, L.loop, L.loopCall, L.end], t + 0.4, 0.04);
  hide(rules, t + 0.5);
  show(formula, t + 0.55);
  typeTerm(0, t + 0.55);
  stops.push(t + 0.6);
  FIRST.forEach((_, k) => {
    const a = t + 0.65 + k * 0.7;
    hl(L.loop, a);
    hl(L.loopCall, a + 0.06);
    hl(L.enq, a + 0.12);
    hl(L.enqFull, a + 0.18);
    if (k === 0) {
      hl(L.enqFirst, a + 0.26);
      odo(col(regF), FRONT_ODO.length, 1, a + 0.28);
      hide(center, a + 0.28);
      show([handF], a + 0.3);
    }
    hl(L.enqRear, a + 0.34);
    fx(k + 1, a + 0.36);
    odo(col(regR), REAR_ODO.length, k + 1, a + 0.36);
    if (k === 0) show(handR, a + 0.36);
    else turn(handR, tagR, k * STEP_DEG, a + 0.36);
    hl(L.enqStore, a + 0.48);
    drop([A[k], mA[k]], a + 0.5);
    flash([boxes[k], mBoxes[k]], a + 0.52);
    stops.push(a + 0.7);
  });

  // 6 · overflow
  t = S[5];
  type([L.full], t);
  hl(L.full, t + 0.1);
  hl(L.enq, t + 0.16);
  hl(L.enqFull, t + 0.22);
  fx(6, t + 0.26);
  show(reject, t + 0.3);
  tl.to(reject, { x: -6, yoyo: true, repeat: 5, duration: 0.03, ease: "none" }, t + 0.36);
  flash(boxes, t + 0.36, "#f4b7a9");
  hl(L.enqFullMsg, t + 0.52);
  typeTerm(1, t + 0.56);
  hl(L.enqFullRet, t + 0.72);
  hide(reject, t + 0.9);

  // 7 · dequeue twice
  t = S[6];
  type([L.deq, L.deqEmpty, L.deqEmpty + 1, L.deqEmpty + 2, L.deqEmpty + 3, L.deqTake, L.deqLast, L.deqFront, L.deqRet, L.deqEnd], t, 0.03);
  type([L.deq1, L.deq2], t + 0.35, 0.06);
  stops.push(t + 0.45);
  [0, 1].forEach((n) => {
    const a = t + 0.5 + n * 0.75;
    hl(L.deq1 + n, a);
    hl(L.deq, a + 0.06);
    hl(L.deqEmpty, a + 0.12);
    hl(L.deqTake, a + 0.2);
    typeTerm(2 + n, a + 0.22, 0.12);
    tl.set(flys[n], { autoAlpha: 1 }, a + 0.24);
    tl.to(flys[n], { x: -outFly[n].x, y: -outFly[n].y, duration: 0.22, ease: "power2.inOut" }, a + 0.24);
    tl.set(flys[n], { autoAlpha: 0 }, a + 0.46);
    show(outs[n], a + 0.44, 0.04);
    tl.to([A[n], mA[n]], { color: DIM, duration: 0.1 }, a + 0.3);
    hl(L.deqLast, a + 0.44);
    hl(L.deqFront, a + 0.5);
    fx(7 + n, a + 0.52);
    odo(col(regF), FRONT_ODO.length, 2 + n, a + 0.52);
    turn(handF, tagF, (n + 1) * STEP_DEG, a + 0.52);
    hl(L.deqRet, a + 0.64);
    stops.push(a + 0.75);
  });

  // 8 · wrap around
  t = S[7];
  type([L.enq60, L.enq70], t, 0.06);
  [0, 1].forEach((m) => {
    const a = t + 0.15 + m * 0.7;
    hl(L.enq60 + m, a);
    hl(L.enq, a + 0.06);
    hl(L.enqFull, a + 0.12);
    hl(L.enqRear, a + 0.22);
    fx(9 + m, a + 0.24);
    odo(col(regR), REAR_ODO.length, 6 + m, a + 0.24);
    turn(handR, tagR, (5 + m) * STEP_DEG, a + 0.24);
    if (m === 0) {
      tl.to(wrap, { stroke: C.signal, strokeWidth: 3.5, duration: 0.08 }, a + 0.24);
      tl.to(wrapLabel, { color: C.signal, scale: 1.15, duration: 0.08 }, a + 0.24);
      tl.to(wrap, { stroke: C.blue, strokeWidth: 2, duration: 0.2 }, a + 0.5);
      tl.to(wrapLabel, { color: C.blue, scale: 1, duration: 0.2 }, a + 0.5);
    }
    hl(L.enqStore, a + 0.4);
    tl.to([A[m], mA[m]], { autoAlpha: 0, y: 12, duration: 0.08 }, a + 0.42);
    drop([B.get(m)!, mB.get(m)!], a + 0.46);
    flash([boxes[m], mBoxes[m]], a + 0.48);
    stops.push(a + 0.7);
  });

  // 9 · display, front to rear
  t = S[8];
  type([L.disp, L.dispEmpty, L.dispI, L.dispWhile, L.dispPrint, L.dispIf, L.dispInc, L.dispClose, L.dispEndl, L.dispEnd], t, 0.03);
  type([L.show], t + 0.35);
  hl(L.show, t + 0.45);
  hl(L.disp, t + 0.5);
  hl(L.dispEmpty, t + 0.55);
  hl(L.dispI, t + 0.6);
  show(regI, t + 0.6);
  tl.to(regI, { y: 0, duration: 0.1 }, t + 0.6);
  odo(col(regI), I_ODO.length, 1, t + 0.62);
  fx(11, t + 0.62);
  show(cur, t + 0.64);
  typeTerm(4, t + 0.66, 0.01);
  stops.push(t + 0.7);
  WALK.forEach((s, n) => {
    const a = t + 0.75 + n * 0.34;
    hl(L.dispPrint, a);
    tl.fromTo(
      outs[2 + n],
      { x: outFly[2 + n].x, y: outFly[2 + n].y, autoAlpha: 0, scale: 1.5 },
      { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.16, ease: "power2.inOut", immediateRender: false },
      a + 0.02,
    );
    flash(boxes[s], a + 0.02);
    hl(L.dispIf, a + 0.14);
    if (n < WALK.length - 1) {
      hl(L.dispInc, a + 0.22);
      odo(col(regI), I_ODO.length, n + 2, a + 0.24);
      fx(12 + n, a + 0.24);
      tl.to(cur, { left: ring[WALK[n + 1]].x, top: ring[WALK[n + 1]].y, duration: 0.1 }, a + 0.24);
    } else {
      fx(16, a + 0.22);
      hl(L.dispEndl, a + 0.28);
    }
    stops.push(a + 0.34);
  });

  // 10 · done
  t = S[9];
  hide(cur, t);
  type([L.ret], t);
  hl(L.ret, t + 0.1);
  hl(L.end, t + 0.2);
  hlOff(t + 0.3);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.35);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.53);

  tl.set({}, {}, totalWeight(STEPS));
  return { tl, stops };
};

export default function Stage() {
  return (
    <Lab steps={STEPS} build={build} className="lab--dense">
      <CodePanel file="cqueue.cpp" program={PROGRAM} />

      <div className="viz">
        <div className="viz__head">
          <span className="viz__title">memory</span>
          <div className="regs">
            <Reg name="front" className="reg--front" items={FRONT_ODO} />
            <Reg name="rear" className="reg--rear" items={REAR_ODO} />
            <Reg name="i" className="reg--i" items={I_ODO} />
          </div>
        </div>

        <div className="mem mem--cq">
          <svg className="cq__svg" aria-hidden>
            <defs>
              <marker id="cq-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#24479a" />
              </marker>
            </defs>
            <path className="cq__wrap" markerEnd="url(#cq-arrow)" />
          </svg>
          <span className="cq__wraplabel">(4 + 1) % 5 = 0</span>

          {FIRST.map((v, k) => (
            <div className="cq__slot" key={k}>
              <span className="cq__idx">[{k}]</span>
              <div className="cq__box">
                <span className="cq__a">{v}</span>
                {SECOND[k] !== null && (
                  <span className="cq__b" data-k={k}>
                    {SECOND[k]}
                  </span>
                )}
                {k < 2 && <span className="cq__fly">{v}</span>}
              </div>
            </div>
          ))}

          <div className="hand hand--front">
            <span className="hand__tag">front</span>
          </div>
          <div className="hand hand--rear">
            <span className="hand__tag">rear</span>
          </div>
          <div className="cq__center">
            empty
            <small>front = rear = -1</small>
          </div>
          <div className="cqcur" aria-hidden />
          <span className="cq__reject">60 ✗</span>

          <span className="lintag lintag--f">front</span>
          <span className="lintag lintag--r">rear</span>
          <div className="lin__msg">
            rear + 1 == SIZE → &quot;full&quot; · but q[0] and q[1] are free
          </div>

          <div className="mirror">
            <span className="mirror__k">q[ ] in memory</span>
            {FIRST.map((v, k) => (
              <div className="mirror__row" key={k}>
                <i>[{k}]</i>
                <div className="mirror__box">
                  <span className="cq__a">{v}</span>
                  {SECOND[k] !== null && (
                    <span className="cq__b" data-k={k}>
                      {SECOND[k]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="stamp" aria-hidden>
            <span>Solved</span>
            <small>enqueue O(1) · dequeue O(1)</small>
          </div>
        </div>

        <div className="dock dock--cq">
          <div className="cq__rules">
            <code>
              isFull: <b>(rear + 1) % SIZE == front</b>
            </code>
            <code>
              isEmpty: <b>front == -1</b>
            </code>
          </div>
          <div className="cqf">
            <Odo items={FORMULA} />
          </div>
        </div>

        <div className="term">
          <div className="term__line">
            <span className="term__ps">$</span> ./cqueue
          </div>
          <div className="term__line">Queue is full</div>
          {FIRST.slice(0, 2).map((v, n) => (
            <div className="term__line" key={n}>
              Removed{" "}
              <span className="term__outslot">
                <span className="term__out">{v}</span>
              </span>
            </div>
          ))}
          <div className="term__line">
            {SHOWN.map((v, n) => (
              <span className="term__outslot" key={n}>
                <span className="term__out">{v}</span>{" "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Lab>
  );
}
