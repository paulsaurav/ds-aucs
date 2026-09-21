"use client";

import { gsap } from "@/lib/gsap";
import { C, delta, helpers, labTimeline, stepStarts, totalWeight, type Build } from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel, Cond, Reg } from "@/components/lesson/parts";
import { COLS, FLAT, GRID, L, NZ, PROGRAM, ROWS, STEPS, TRIPLETS, ZEROS } from "./data";

const I_ODO = ["?", "0", "1", "2", "3", "4"];
const J_ODO = ["?", "0", "1", "2", "3", "4", "5"];
const COUNT_ODO = ["0", "1", "2", "3", "4"];
const TEST = [<span key="q">a[i][j] != 0 ?</span>, ...FLAT.map((v, k) => <Cond key={k} text={`${v} != 0`} ok={v !== 0} />)];
const DIM = "#c9bfa9";
const GREY = "#e0d8c6";
const tab = (...xs: (string | number)[]) => xs.map((x) => String(x).padEnd(8)).join("");

const build: Build = (el) => {
  const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const one = (s: string) => el.querySelector<HTMLElement>(s)!;

  const zone = one(".mem");
  const heads = all(".g2__head");
  const cells = all(".g2__cell");
  const vals = all(".g2__cell .g2__val");
  const flys = new Map(all(".g2__cell .sp__fly").map((e) => [Number(e.dataset.k), e]));
  const gcur = one(".g2cur");
  const zeroChip = one(".sp__zeros");

  const strip = one(".sp__strip");
  const sSlots = all(".sp__strip .strip__slot");
  const sBoxes = all(".sp__strip .strip__box");
  const waste = one(".sp__waste");

  const trip = one(".trip");
  const tHead = one(".trip__head");
  const tZero = one(".trip__row--0");
  const tRows = all(".trip__row--data");
  const tVals = all(".trip__row--data .trip__v");
  const tLabels = one(".trip__labels");

  const regI = one(".reg--i");
  const regJ = one(".reg--j");
  const regCount = one(".reg--count");
  const regTest = one(".reg--test");
  const col = (r: HTMLElement) => r.querySelector<HTMLElement>(".odo__col")!;

  const cmp = one(".cmp");
  const cmpBars = all(".cmp__bar i");
  const cmpBig = one(".cmp__big");
  const stamp = one(".stamp");

  // ---------- measure the clean layout ----------
  const cellPos = cells.map((c) => ({ x: c.offsetLeft, y: c.offsetTop }));
  const chipFly = TRIPLETS.map((t, n) => delta(cells[t.k], tVals[n]));

  // ---------- initial state ----------
  gsap.set(heads, { autoAlpha: 0 });
  gsap.set(cells, { autoAlpha: 0, y: -8 });
  gsap.set([...flys.values()], { autoAlpha: 0 });
  gsap.set(gcur, { autoAlpha: 0, x: cellPos[0].x, y: cellPos[0].y });
  gsap.set(zeroChip, { autoAlpha: 0 });
  gsap.set(strip, { autoAlpha: 0 });
  gsap.set(sSlots, { autoAlpha: 0, y: -6 });
  gsap.set(waste, { autoAlpha: 0 });
  gsap.set(trip, { autoAlpha: 0 });
  gsap.set([tZero, ...tRows], { autoAlpha: 0, x: -10 });
  gsap.set(tLabels, { autoAlpha: 0 });
  gsap.set([regI, regJ, regCount, regTest], { autoAlpha: 0, y: 8 });
  gsap.set(cmp, { autoAlpha: 0 });
  gsap.set(cmpBars, { scaleX: 0 });
  gsap.set(cmpBig, { autoAlpha: 0 });
  gsap.set(stamp, { autoAlpha: 0, scale: 1.8, rotation: -2, xPercent: -50, yPercent: -50 });

  // ---------- master timeline ----------
  const S = stepStarts(STEPS);
  const tl = labTimeline();
  const stops: number[] = [];
  const { type, typeTerm, hl, hlOff, odo, flash } = helpers(tl, el, PROGRAM);
  const reveal = (t: gsap.TweenTarget, at: number) => tl.to(t, { autoAlpha: 1, y: 0, x: 0, duration: 0.12 }, at);
  const hide = (t: gsap.TweenTarget, at: number, d = 0.1) => tl.to(t, { autoAlpha: 0, duration: d }, at);

  // 1 · the array, row by row, then dim the zeros
  let t = S[0];
  type([L.include, L.using, L.main, L.end], t, 0.04);
  type([L.decl], t + 0.15);
  hl(L.decl, t + 0.25);
  tl.to(heads, { autoAlpha: 1, stagger: 0.02, duration: 0.1 }, t + 0.3);
  for (let r = 0; r < ROWS; r++) {
    type([L.row0 + r], t + 0.36 + r * 0.18);
    hl(L.row0 + r, t + 0.4 + r * 0.18);
    tl.to(cells.slice(r * COLS, r * COLS + COLS), { autoAlpha: 1, y: 0, stagger: 0.03, duration: 0.12 }, t + 0.42 + r * 0.18);
  }
  type([L.declEnd], t + 1.1);
  tl.to(
    vals.filter((_, k) => FLAT[k] === 0),
    { color: DIM, duration: 0.2, stagger: 0.01 },
    t + 1.15,
  );
  flash(cells.filter((_, k) => FLAT[k] !== 0), t + 1.2);
  tl.to(zeroChip, { autoAlpha: 1, duration: 0.12 }, t + 1.3);

  // 2 · wasted memory
  t = S[1];
  hl(L.decl, t);
  tl.to(strip, { autoAlpha: 1, duration: 0.1 }, t + 0.05);
  tl.to(sSlots, { autoAlpha: 1, y: 0, stagger: 0.02, duration: 0.1 }, t + 0.1);
  tl.to(waste, { autoAlpha: 1, duration: 0.15 }, t + 0.65);
  tl.to(
    sBoxes.filter((_, k) => FLAT[k] !== 0),
    { backgroundColor: C.marker, duration: 0.1, stagger: 0.05 },
    t + 0.75,
  );

  // 3 · scan every cell
  t = S[2];
  hide([strip, waste], t);
  type([L.vars], t);
  hl(L.vars, t + 0.1);
  reveal([regI, regJ, regCount, regTest], t + 0.12);
  type([L.header, L.forI, L.forJ, L.test, L.printIJ, L.printV, L.inc, L.close], t + 0.2, 0.05);
  typeTerm(0, t + 0.55);
  hl(L.header, t + 0.62);
  typeTerm(1, t + 0.66);
  tl.to(trip, { autoAlpha: 1, duration: 0.12 }, t + 0.7);
  stops.push(t + 0.8);

  let a = t + 0.85;
  let found = 0;
  for (let r = 0; r < ROWS; r++) {
    hl(L.forI, a);
    odo(col(regI), I_ODO.length, r + 1, a);
    a += 0.06;
    for (let c = 0; c < COLS; c++) {
      const k = r * COLS + c;
      hl(L.forJ, a);
      odo(col(regJ), J_ODO.length, c + 1, a);
      hl(L.test, a + 0.05);
      odo(col(regTest), TEST.length, k + 1, a + 0.05);
      tl.to(gcur, { x: cellPos[k].x, y: cellPos[k].y, autoAlpha: 1, duration: 0.05 }, a + 0.05);
      if (FLAT[k] === 0) {
        flash(cells[k], a + 0.08, GREY);
        a += 0.17;
      } else {
        const n = found++;
        flash(cells[k], a + 0.1);
        hl(L.printIJ, a + 0.12);
        const fly = flys.get(k)!;
        tl.set(fly, { autoAlpha: 1 }, a + 0.12);
        tl.to(fly, { x: chipFly[n].x, y: chipFly[n].y, duration: 0.16, ease: "power2.inOut" }, a + 0.12);
        hide(fly, a + 0.28, 0.03);
        reveal(tRows[n], a + 0.28);
        typeTerm(2 + n, a + 0.2, 0.1);
        hl(L.printV, a + 0.26);
        hl(L.inc, a + 0.34);
        odo(col(regCount), COUNT_ODO.length, n + 1, a + 0.36);
        a += 0.48;
      }
    }
    hl(L.forJ, a);
    odo(col(regJ), J_ODO.length, COLS + 1, a);
    a += 0.1;
    stops.push(a);
  }
  hl(L.forI, a);
  odo(col(regI), I_ODO.length, ROWS + 1, a);
  hide(gcur, a + 0.05, 0.06);

  // 4 · count
  t = S[3];
  type([L.total, L.ret], t, 0.06);
  hl(L.total, t + 0.15);
  typeTerm(2 + NZ, t + 0.25);
  tl.to(regCount, { backgroundColor: C.marker, duration: 0.05 }, t + 0.25).to(regCount, { backgroundColor: C.cell, duration: 0.25 }, t + 0.32);

  // 5 · triplet form
  t = S[4];
  hl(L.ret, t);
  reveal(tZero, t + 0.1);
  tl.to(tLabels, { autoAlpha: 1, duration: 0.12 }, t + 0.3);
  tl.to(tHead, { color: C.signal, duration: 0.1 }, t + 0.3);
  tl.to(cmp, { autoAlpha: 1, duration: 0.1 }, t + 0.5);
  tl.to(cmpBars.slice(0, 2), { scaleX: 1, stagger: 0.12, duration: 0.25, ease: "power2.out" }, t + 0.55);
  stops.push(t + 0.95);
  tl.to(cmpBig, { autoAlpha: 1, duration: 0.1 }, t + 1.0);
  tl.to(cmpBars.slice(2), { scaleX: 1, stagger: 0.12, duration: 0.25, ease: "power2.out" }, t + 1.05);

  // 6 · done
  t = S[5];
  hl(L.end, t);
  hlOff(t + 0.12);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.3);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.48);

  tl.set({}, {}, totalWeight(STEPS));
  return { tl, stops };
};

export default function Stage() {
  return (
    <Lab steps={STEPS} build={build} className="lab--dense">
      <CodePanel file="sparse.cpp" program={PROGRAM} />

      <div className="viz">
        <div className="viz__head">
          <span className="viz__title">memory</span>
          <div className="regs">
            <Reg name="i" className="reg--i" items={I_ODO} />
            <Reg name="j" className="reg--j" items={J_ODO} />
            <Reg name="count" className="reg--count" items={COUNT_ODO} />
            <Reg className="reg--test" items={TEST} />
          </div>
        </div>

        <div className="mem mem--sp">
          <div className="sp">
            <div className="sp__left">
              <div className="g2 sp__grid">
                <span className="g2__corner" />
                {Array.from({ length: COLS }, (_, c) => (
                  <span className="g2__head" key={`c${c}`}>
                    [{c}]
                  </span>
                ))}
                {GRID.map((row, r) => [
                  <span className="g2__head g2__head--row" key={`r${r}`}>
                    [{r}]
                  </span>,
                  ...row.map((v, c) => {
                    const k = r * COLS + c;
                    return (
                      <div className={`g2__cell${v ? " is-nz" : ""}`} key={k}>
                        <span className="g2__val">{v}</span>
                        {v !== 0 && (
                          <span className="sp__fly" data-k={k}>
                            {r} {c} {v}
                          </span>
                        )}
                      </div>
                    );
                  }),
                ])}
                <div className="g2cur" aria-hidden />
              </div>
              <span className="sp__zeros">
                {ZEROS} of {FLAT.length} are zero · {Math.round((ZEROS / FLAT.length) * 100)}%
              </span>
            </div>

            <div className="trip">
              <div className="trip__row trip__head">
                <i />
                <span>row</span>
                <span>col</span>
                <span>value</span>
              </div>
              <div className="trip__row trip__row--0">
                <i>t[0]</i>
                <span>{ROWS}</span>
                <span>{COLS}</span>
                <span>{NZ}</span>
              </div>
              {TRIPLETS.map((t, n) => (
                <div className="trip__row trip__row--data" key={n}>
                  <i>t[{n + 1}]</i>
                  <span>{t.i}</span>
                  <span>{t.j}</span>
                  <span className="trip__v">{t.v}</span>
                </div>
              ))}
              <div className="trip__labels">t[0] = rows, cols, count</div>
            </div>
          </div>

          <div className="sp__strip strip">
            <div className="strip__row">
              {FLAT.map((v, k) => (
                <div className="strip__slot" key={k}>
                  <div className={`strip__box${v ? "" : " is-zero"}`}>{v}</div>
                </div>
              ))}
            </div>
            <span className="sp__waste">
              {FLAT.length} × 4 = {FLAT.length * 4} bytes stored · {NZ} × 4 = {NZ * 4} bytes of real data
            </span>
          </div>

          <div className="stamp" aria-hidden>
            <span>Solved</span>
            <small>O(rows × cols) to scan · O(count) to store</small>
          </div>
        </div>

        <div className="dock">
          <div className="cmp">
            <div className="cmp__row">
              <span>a[4][5]</span>
              <span className="cmp__bar">
                <i style={{ width: "100%" }} />
              </span>
              <b>20 ints</b>
            </div>
            <div className="cmp__row">
              <span>t[5][3]</span>
              <span className="cmp__bar cmp__bar--win">
                <i style={{ width: "75%" }} />
              </span>
              <b>15 ints</b>
            </div>
            <div className="cmp__big">
              <div className="cmp__row">
                <span>1000 × 1000</span>
                <span className="cmp__bar">
                  <i style={{ width: "100%" }} />
                </span>
                <b>1 000 000</b>
              </div>
              <div className="cmp__row">
                <span>1000 triplets</span>
                <span className="cmp__bar cmp__bar--win">
                  <i style={{ width: "0.6%" }} />
                </span>
                <b>3 003</b>
              </div>
            </div>
          </div>
        </div>

        <div className="term">
          <div className="term__line">
            <span className="term__ps">$</span> ./sparse
          </div>
          <div className="term__line">{tab("Row", "Col", "Value")}</div>
          {TRIPLETS.map((t, n) => (
            <div className="term__line term__in" key={n}>
              {tab(t.i, t.j, t.v)}
            </div>
          ))}
          <div className="term__line">Non-zero: {NZ}</div>
        </div>
      </div>
    </Lab>
  );
}
