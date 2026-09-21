"use client";

import { gsap } from "@/lib/gsap";
import { C, delta, helpers, labTimeline, stepStarts, totalWeight, type Build } from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel, Cond, Odo, Reg } from "@/components/lesson/parts";
import { AFTER, BEFORE, CAP, CHOICE, L, N, POS, PROGRAM, STEPS, WRONG, X } from "./data";

const I_ODO = ["?", "2", "3", "4", "5", "0", "1", "2", "3", "4", "5"];
const SHIFT_COND = [2, 3, 4, 5].map((i) => <Cond key={`s${i}`} text={`${i} < ${N - 1}`} ok={i < N - 1} />);
const PRINT_COND = [0, 1, 2, 3, 4, 5].map((i) => <Cond key={`p${i}`} text={`${i} < ${N - 1}`} ok={i < N - 1} />);
const SHIFT_EQ = ["arr[2] = arr[3]", "arr[3] = arr[4]", "arr[4] = arr[5]", "i = 5 = n − 1 · stop"];
const MOVES = [3, 4, 5]; // source index of each shift, front to back
const WRONG_MOVES = [5, 4, 3]; // right-to-left: each source already holds 71
const OUT = AFTER.slice(0, N - 1);

const build: Build = (el) => {
  const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const one = (s: string) => el.querySelector<HTMLElement>(s)!;

  const viz = one(".viz");
  const zone = one(".mem");
  const slots = all(".irow--main .islot");
  const boxes = all(".irow--main .ibox");
  const olds = all(".irow--main .ival--old");
  const news = new Map(all(".irow--main .ival--new").map((e) => [Number(e.dataset.k), e]));
  const flyers = new Map(all(".irow--main .iflyer").map((e) => [Number(e.dataset.k), e]));
  const spare = one(".irow--main .ihole");
  const idxs = all(".irow--main .iidx");
  const capbr = one(".capbr");
  const usedbr = one(".usedbr");
  const usedA = one(".usedbr__a");
  const usedB = one(".usedbr__b");
  const flagBegin = one(".flag--begin");
  const flagEnd = one(".flag--end");
  const range = one(".range");
  const posmark = one(".posmark");
  const badflag = one(".badflag");
  const cursor = one(".irow--main .cursor");
  const tagShift = one(".cursor__tag--shift");
  const tagRead = one(".cursor__tag--read");
  const stale = one(".stale");

  const ghostRow = one(".irow--ghost");
  const gSlots = all(".irow--ghost .islot");
  const gBoxes = all(".irow--ghost .ibox");
  const gOlds = all(".irow--ghost .ival--old");
  const gNews = new Map(all(".irow--ghost .ival--new").map((e) => [Number(e.dataset.k), e]));
  const gFlyers = new Map(all(".irow--ghost .iflyer").map((e) => [Number(e.dataset.k), e]));
  const gLost = one(".ghost__lost");

  const regN = one(".reg--n");
  const regChoice = one(".reg--choice");
  const regPos = one(".reg--pos");
  const regX = one(".reg--x");
  const regI = one(".reg--i");
  const regCond = one(".reg--cond");
  const col = (r: HTMLElement) => r.querySelector<HTMLElement>(".odo__col")!;

  const guard = one(".guard");
  const guardRows = all(".guard__row");
  const verdict = one(".guard__verdict");
  const shiftf = one(".shiftf");
  const shiftCol = one(".shiftf .odo__col");
  const chart = one(".chart");
  const bars = all(".chart__bar i");
  const barVals = all(".chart__bar b");
  const chartTags = all(".chart__tag");

  const stdin = one(".stdin");
  const toks = all(".stdin__tok");
  const tokSlots = all(".stdin__slot");
  const xchip = one(".xchip");
  const outs = all(".term__out");
  const outSlots = all(".term__outslot");
  const stamp = one(".stamp");

  // ---------- measure the clean layout ----------
  const slotX = slots.map((s) => s.offsetLeft);
  const cw = slots[0].offsetWidth;
  const step = slotX[1] - slotX[0];
  const usedW = (n: number) => slotX[n - 1] + cw;
  const regVal = (r: HTMLElement) => r.querySelector(".reg__v")!;
  const tokFly = [regChoice, regPos].map((r, k) => delta(tokSlots[k], regVal(r)));
  const outFly = outSlots.map((o, k) => delta(o, boxes[k]));
  const vr = viz.getBoundingClientRect();
  const br = boxes[POS].getBoundingClientRect();
  const xr = regVal(regX).getBoundingClientRect();
  const chipStart = { left: br.left - vr.left + br.width / 2, top: br.top - vr.top + br.height / 2 };
  const chipFly = {
    x: xr.left + xr.width / 2 - (br.left + br.width / 2),
    y: xr.top + xr.height / 2 - (br.top + br.height / 2),
  };

  // ---------- initial state ----------
  gsap.set(slots, { autoAlpha: 0, y: -18 });
  gsap.set([...news.values(), ...flyers.values(), spare, stale], { autoAlpha: 0 });
  gsap.set(capbr, { scaleX: 0 });
  gsap.set(usedbr, { autoAlpha: 0, width: usedW(N) });
  gsap.set(usedB, { autoAlpha: 0 });
  gsap.set(idxs, { autoAlpha: 0 });
  gsap.set(flagBegin, { autoAlpha: 0, y: -10, xPercent: -50, x: slotX[0] + cw / 2 });
  gsap.set(flagEnd, { autoAlpha: 0, y: -10, xPercent: -50, x: slotX[N - 1] + cw / 2 });
  gsap.set(range, { autoAlpha: 0, scaleX: 0, x: slotX[0], width: usedW(N) });
  gsap.set(posmark, { autoAlpha: 0, y: -12, xPercent: -50, x: slotX[POS] + cw / 2 });
  gsap.set(badflag, { autoAlpha: 0, y: -12, xPercent: -50, x: slotX[N] + cw / 2 });
  gsap.set(cursor, { autoAlpha: 0, x: slotX[POS] });
  gsap.set(tagRead, { autoAlpha: 0 });
  gsap.set(stale, { xPercent: -50, x: slotX[N - 1] + cw / 2 });

  gsap.set(ghostRow, { autoAlpha: 0 });
  gsap.set(gSlots, { autoAlpha: 0, y: 10 });
  gsap.set([...gNews.values(), ...gFlyers.values(), gLost], { autoAlpha: 0 });

  gsap.set([regN, regChoice, regPos, regX, regI, regCond], { autoAlpha: 0, y: 8 });
  gsap.set([guard, shiftf, chart], { autoAlpha: 0 });
  gsap.set(guardRows, { autoAlpha: 0, x: -10 });
  gsap.set(verdict, { autoAlpha: 0 });
  gsap.set(bars, { scaleY: 0 });
  gsap.set([...barVals, ...chartTags], { autoAlpha: 0 });

  gsap.set(stdin, { autoAlpha: 0 });
  gsap.set(toks, { autoAlpha: 0, y: 12 });
  gsap.set(xchip, { autoAlpha: 0, left: chipStart.left, top: chipStart.top, xPercent: -50, yPercent: -50 });
  gsap.set(outs, { autoAlpha: 0 });
  gsap.set(stamp, { autoAlpha: 0, scale: 1.8, rotation: -2, xPercent: -50, yPercent: -50 });

  // ---------- master timeline ----------
  const S = stepStarts(STEPS);
  const tl = labTimeline();
  const stops: number[] = [];
  const { type, typeTerm, hl, hlOff, odo, flash } = helpers(tl, el, PROGRAM);
  const setI = (idx: number, at: number) => odo(col(regI), I_ODO.length, idx, at);
  const setCond = (idx: number, at: number) => odo(col(regCond), SHIFT_COND.length + PRINT_COND.length, idx, at);
  const reveal = (t: gsap.TweenTarget, at: number) => tl.to(t, { autoAlpha: 1, y: 0, duration: 0.12 }, at);
  const hide = (t: gsap.TweenTarget, at: number, d = 0.1) => tl.to(t, { autoAlpha: 0, duration: d }, at);
  /** Copy the value in box `from` one box to the left, onto `target`. */
  const shiftCopy = (
    fly: HTMLElement,
    target: { old: HTMLElement; neu: HTMLElement; box: HTMLElement },
    at: number,
    color: string,
  ) => {
    tl.to(fly, { autoAlpha: 1, duration: 0.03 }, at);
    tl.to(fly, { x: -step, duration: 0.16, ease: "power2.inOut" }, at + 0.03);
    tl.to(target.old, { autoAlpha: 0, y: 14, duration: 0.06 }, at + 0.17);
    tl.to(target.neu, { autoAlpha: 1, duration: 0.03 }, at + 0.19);
    tl.to(fly, { autoAlpha: 0, duration: 0.03 }, at + 0.2);
    flash(target.box, at + 0.19, color);
  };

  // 1 · capacity vs used
  let t = S[0];
  type([L.include, L.using, L.main, L.end], t, 0.05);
  type([L.decl], t + 0.15);
  hl(L.decl, t + 0.3);
  tl.to(slots, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.2, ease: "back.out(2)" }, t + 0.3);
  tl.to(idxs, { autoAlpha: 1, stagger: 0.02, duration: 0.1 }, t + 0.45);
  tl.to(capbr, { scaleX: 1, duration: 0.2, ease: "power2.inOut" }, t + 0.55);
  type([L.vars], t + 0.7);
  hl(L.vars, t + 0.8);
  reveal(regN, t + 0.85);
  tl.to(usedbr, { autoAlpha: 1, duration: 0.15 }, t + 0.85);

  // 2 · three choices → one pos
  t = S[1];
  type([L.askChoice, L.readChoice], t, 0.06);
  typeTerm(0, t + 0.2);
  hl(L.askChoice, t + 0.28);
  typeTerm(1, t + 0.3);
  tl.to(stdin, { autoAlpha: 1, duration: 0.08 }, t + 0.3);
  tl.to(toks, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.08 }, t + 0.32);
  reveal([regChoice, regPos], t + 0.36);
  hl(L.readChoice, t + 0.44);
  tl.to(toks[0], { x: tokFly[0].x, y: tokFly[0].y, duration: 0.14, ease: "power2.in" }, t + 0.46);
  hide(toks[0], t + 0.6, 0.03);
  odo(col(regChoice), 2, 1, t + 0.6);
  stops.push(t + 0.64);
  type([L.if1, L.if2, L.else, L.askPos, L.readPos, L.closeElse], t + 0.66, 0.04);
  reveal([flagBegin, flagEnd], t + 0.86);
  tl.to(range, { autoAlpha: 1, scaleX: 1, duration: 0.15 }, t + 0.92);
  hl(L.if1, t + 1.04);
  tl.to(flagBegin, { opacity: 0.3, duration: 0.05 }, t + 1.1);
  hl(L.if2, t + 1.12);
  tl.to(flagEnd, { opacity: 0.3, duration: 0.05 }, t + 1.18);
  hl(L.askPos, t + 1.2);
  typeTerm(2, t + 1.22);
  hl(L.readPos, t + 1.3);
  tl.to(toks[1], { x: tokFly[1].x, y: tokFly[1].y, duration: 0.14, ease: "power2.in" }, t + 1.32);
  hide(toks[1], t + 1.46, 0.03);
  odo(col(regPos), 2, 1, t + 1.46);
  hide([range, flagBegin, flagEnd], t + 1.48, 0.08);
  tl.to(posmark, { autoAlpha: 1, y: 0, duration: 0.1, ease: "back.out(3)" }, t + 1.48);
  tl.to(stdin, { autoAlpha: 0.35, duration: 0.08 }, t + 1.52);

  // 3 · the guard
  t = S[2];
  type([L.guard, L.guard + 1, L.guard + 2, L.guard + 3], t, 0.05);
  hl(L.guard, t + 0.28);
  tl.to(guard, { autoAlpha: 1, duration: 0.08 }, t + 0.3);
  tl.to(guardRows, { autoAlpha: 1, x: 0, stagger: 0.1, duration: 0.1 }, t + 0.34);
  tl.to(verdict, { autoAlpha: 1, duration: 0.1 }, t + 0.68);
  stops.push(t + 0.78);
  tl.to(badflag, { autoAlpha: 1, y: 0, duration: 0.1, ease: "back.out(3)" }, t + 0.8);
  tl.to(spare, { autoAlpha: 1, duration: 0.08 }, t + 0.86);

  // 4 · save x before the shift destroys it
  t = S[3];
  hide([badflag, spare, guard], t);
  type([L.save], t + 0.05);
  hl(L.save, t + 0.2);
  reveal(regX, t + 0.25);
  tl.to(xchip, { autoAlpha: 1, scale: 1.15, duration: 0.06 }, t + 0.35);
  tl.to(xchip, { x: chipFly.x, y: chipFly.y, scale: 1, duration: 0.25, ease: "power2.inOut" }, t + 0.42);
  hide(xchip, t + 0.67, 0.04);
  odo(col(regX), 2, 1, t + 0.67);
  tl.to(regX, { backgroundColor: C.marker, duration: 0.05 }, t + 0.68).to(
    regX,
    { backgroundColor: C.cell, duration: 0.2 },
    t + 0.75,
  );

  // 5 · the trap: right-to-left shifting
  t = S[4];
  tl.to(ghostRow, { autoAlpha: 1, duration: 0.1 }, t);
  tl.to(gSlots, { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.12 }, t + 0.05);
  WRONG_MOVES.forEach((k, n) => {
    shiftCopy(gFlyers.get(k)!, { old: gOlds[k - 1], neu: gNews.get(k - 1)!, box: gBoxes[k - 1] }, t + 0.35 + n * 0.3, C.signal);
    stops.push(t + 0.35 + (n + 1) * 0.3);
  });
  tl.to(gLost, { autoAlpha: 1, duration: 0.1 }, t + 1.3);

  // 6 · shift from the front
  t = S[5];
  hide(ghostRow, t, 0.12);
  type([L.shiftFor, L.shiftBody], t + 0.05);
  hl(L.shiftFor, t + 0.2);
  reveal([regI, regCond], t + 0.2);
  tl.to(shiftf, { autoAlpha: 1, duration: 0.1 }, t + 0.2);
  stops.push(t + 0.32);
  MOVES.forEach((k, n) => {
    const a = t + 0.35 + n * 0.5;
    hl(L.shiftFor, a);
    setI(1 + n, a);
    setCond(n, a);
    hl(L.shiftBody, a + 0.12);
    odo(shiftCol, SHIFT_EQ.length, n, a + 0.12);
    tl.to(cursor, { x: slotX[k - 1], autoAlpha: 1, duration: 0.08 }, a + 0.12);
    shiftCopy(flyers.get(k)!, { old: olds[k - 1], neu: news.get(k - 1)!, box: boxes[k - 1] }, a + 0.18, C.marker);
    stops.push(a + 0.5);
  });
  let E = t + 0.35 + MOVES.length * 0.5;
  hl(L.shiftFor, E);
  setI(4, E);
  setCond(3, E);
  odo(shiftCol, SHIFT_EQ.length, 3, E);
  hide(cursor, E + 0.1, 0.08);

  // 7 · n-- and the stale copy
  t = S[6];
  hide([shiftf, posmark], t);
  type([L.shrink], t + 0.05);
  hl(L.shrink, t + 0.2);
  odo(col(regN), 2, 1, t + 0.3);
  tl.to(usedbr, { width: usedW(N - 1), duration: 0.2, ease: "power2.inOut" }, t + 0.3);
  tl.to(usedA, { autoAlpha: 0, duration: 0.04 }, t + 0.34);
  tl.to(usedB, { autoAlpha: 1, duration: 0.04 }, t + 0.36);
  stops.push(t + 0.52);
  tl.to(olds[N - 1], { color: C.pencil, opacity: 0.45, duration: 0.15 }, t + 0.6);
  tl.to(stale, { autoAlpha: 1, duration: 0.1 }, t + 0.7);

  // 8 · report x, then print
  t = S[7];
  type([L.report, L.label, L.printFor, L.printBody, L.ret], t, 0.07);
  hl(L.report, t + 0.4);
  tl.to(regX, { backgroundColor: C.marker, duration: 0.05 }, t + 0.42).to(
    regX,
    { backgroundColor: C.cell, duration: 0.2 },
    t + 0.5,
  );
  typeTerm(3, t + 0.44);
  hl(L.label, t + 0.6);
  typeTerm(4, t + 0.62, 0.14);
  tl.to(tagShift, { autoAlpha: 0, duration: 0.01 }, t + 0.74);
  tl.to(tagRead, { autoAlpha: 1, duration: 0.01 }, t + 0.74);
  tl.to(cursor, { borderColor: C.blue, duration: 0.01 }, t + 0.74);
  stops.push(t + 0.76);
  const D = 0.26;
  OUT.forEach((_, k) => {
    const a = t + 0.8 + k * D;
    hl(L.printFor, a);
    setI(5 + k, a);
    setCond(4 + k, a);
    hl(L.printBody, a + 0.08);
    tl.to(cursor, { x: slotX[k], autoAlpha: 1, duration: 0.06 }, a + 0.08);
    tl.fromTo(
      outs[k],
      { x: outFly[k].x, y: outFly[k].y, autoAlpha: 0, scale: 1.5 },
      { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.14, ease: "power2.inOut", immediateRender: false },
      a + 0.1,
    );
    stops.push(a + D);
  });
  E = t + 0.8 + OUT.length * D;
  hl(L.printFor, E);
  setI(10, E);
  setCond(9, E);
  hl(L.ret, E + 0.06);
  hide(cursor, E + 0.08, 0.06);

  // 9 · cost of each position
  t = S[8];
  hide(stale, t);
  hl(L.end, t);
  hlOff(t + 0.12);
  tl.to(chart, { autoAlpha: 1, duration: 0.1 }, t + 0.05);
  bars.forEach((b, k) =>
    tl.to(b, { scaleY: Math.max(0.04, (N - 1 - k) / (N - 1)), duration: 0.15, ease: "back.out(1.6)" }, t + 0.12 + k * 0.05),
  );
  tl.to(barVals, { autoAlpha: 1, stagger: 0.05, duration: 0.08 }, t + 0.2);
  tl.to(chartTags, { autoAlpha: 1, stagger: 0.08, duration: 0.1 }, t + 0.5);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.8);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.98);

  tl.set({}, {}, totalWeight(STEPS));
  return { tl, stops };
};

export default function Stage() {
  return (
    <Lab steps={STEPS} build={build} className="lab--dense">
      <CodePanel file="delete.cpp" program={PROGRAM} />

      <div className="viz">
        <div className="viz__head">
          <span className="viz__title">memory</span>
          <div className="regs">
            <Reg name="n" className="reg--n" items={[String(N), String(N - 1)]} />
            <Reg name="choice" className="reg--choice" items={["?", String(CHOICE)]} />
            <Reg name="pos" className="reg--pos" items={["?", String(POS)]} />
            <Reg name="x" className="reg--x" items={["?", String(X)]} />
            <Reg name="i" className="reg--i" items={I_ODO} />
            <Reg className="reg--cond" items={[...SHIFT_COND, ...PRINT_COND]} />
          </div>
        </div>

        <div className="mem mem--ins">
          <div className="rows">
            <div className="irow irow--main">
              <div className="capbr">
                <span>int arr[{CAP}] · capacity {CAP}</span>
              </div>
              <div className="flag flag--begin">
                <b>begin</b> pos = 0
              </div>
              <div className="flag flag--end">
                <b>end</b> pos = n − 1
              </div>
              <div className="range">
                <span>anywhere · pos 0 … n − 1</span>
              </div>
              <div className="posmark">pos = {POS}</div>
              <div className="badflag">pos = {N} ✗</div>

              {BEFORE.map((v, k) => (
                <div className="islot" key={k}>
                  <div className="ibox">
                    <span className={`ival ival--old${k >= N ? " is-zero" : ""}`}>{v}</span>
                    {AFTER[k] !== v && (
                      <span className="ival ival--new" data-k={k}>
                        {AFTER[k]}
                      </span>
                    )}
                    {MOVES.includes(k) && (
                      <span className="iflyer" data-k={k}>
                        {v}
                      </span>
                    )}
                    {k === N && <span className="ihole">spare</span>}
                  </div>
                  <span className="iidx">[{k}]</span>
                </div>
              ))}

              <div className="usedbr">
                <span className="usedbr__a">n = {N} in use</span>
                <span className="usedbr__b">n = {N - 1} in use</span>
              </div>
              <div className="cursor icursor" aria-hidden>
                <span className="cursor__tag cursor__tag--shift">arr[i] ← arr[i+1]</span>
                <span className="cursor__tag cursor__tag--read">read · arr[i]</span>
              </div>
              <div className="dup stale">stale copy · ignored</div>
            </div>

            <div className="irow irow--ghost">
              <div className="ghost__label">
                for (i = n − 2; i &gt;= pos; i--) arr[i] = arr[i+1]; <b>right to left</b>
              </div>
              {WRONG.map((v, k) => (
                <div className="islot" key={k}>
                  <div className="ibox">
                    <span className="ival ival--old">{BEFORE[k]}</span>
                    {v !== BEFORE[k] && (
                      <span className="ival ival--new ival--bad" data-k={k}>
                        {v}
                      </span>
                    )}
                    {WRONG_MOVES.includes(k) && (
                      <span className="iflyer iflyer--bad" data-k={k}>
                        71
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div className="ghost__lost">48 and 60 overwritten, lost</div>
            </div>
          </div>

          <div className="stamp" aria-hidden>
            <span>Deleted</span>
            <small>O(1) at end · O(n) at beginning</small>
          </div>
        </div>

        <div className="dock">
          <div className="guard">
            {[
              ["n == 0", `${N} == 0`],
              ["pos < 0", `${POS} < 0`],
              ["pos >= n", `${POS} >= ${N}`],
            ].map(([a, b]) => (
              <div className="guard__row" key={a}>
                <code>{a}</code>
                <code>{b}</code>
                <b>false</b>
              </div>
            ))}
            <div className="guard__verdict">all false → safe to delete</div>
          </div>

          <div className="shiftf">
            <code className="shiftf__rule">arr[i] = arr[i + 1]</code>
            <span className="shiftf__now">
              <Odo items={SHIFT_EQ} />
            </span>
          </div>

          <div className="chart">
            <span className="chart__title">elements moved for each pos (n = {N})</span>
            <div className="chart__bars">
              {Array.from({ length: N }, (_, k) => (
                <div className={`chart__bar${k === POS ? " is-ours" : ""}`} key={k}>
                  <b>{N - 1 - k}</b>
                  <i />
                  <span>pos {k}</span>
                </div>
              ))}
              <span className="chart__tag chart__tag--begin">begin · O(n)</span>
              <span className="chart__tag chart__tag--ours">this run · {N - 1 - POS}</span>
              <span className="chart__tag chart__tag--end">end · O(1)</span>
            </div>
          </div>
        </div>

        <div className="stdin">
          <span className="stdin__k">stdin</span>
          {[CHOICE, POS].map((v, k) => (
            <span className="stdin__slot" key={k}>
              <span className="stdin__tok">{v}</span>
            </span>
          ))}
        </div>

        <div className="term">
          <div className="term__line">
            <span className="term__ps">$</span> ./delete
          </div>
          <div className="term__line">
            1.Begin 2.End 3.Position: <span className="term__in">{CHOICE}</span>
          </div>
          <div className="term__line">
            Position (0-{N - 1}): <span className="term__in">{POS}</span>
          </div>
          <div className="term__line">Deleted {X}</div>
          <div className="term__line">
            After deletion:{" "}
            {OUT.map((v, k) => (
              <span className="term__outslot" key={k}>
                <span className="term__out">{v}</span>{" "}
              </span>
            ))}
          </div>
        </div>

        <span className="xchip" aria-hidden>
          {X}
        </span>
      </div>
    </Lab>
  );
}
