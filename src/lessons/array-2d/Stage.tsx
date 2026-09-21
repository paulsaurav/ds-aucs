"use client";

import { gsap } from "@/lib/gsap";
import { C, delta, helpers, labTimeline, stepStarts, totalWeight, type Build } from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel, Cond, Reg } from "@/components/lesson/parts";
import { BASE, COLS, FLAT, GARBAGE, GRID, L, PICK, PROGRAM, ROWS, STEPS } from "./data";

const I_ODO = ["?", "0", "1", "2", "3", "0", "1", "2", "3"];
const J_ODO = ["?", "0", "1", "2", "3", "4"];
const I_COND = [0, 1, 2, 3].map((i) => <Cond key={i} text={`i ${i} < ${ROWS}`} ok={i < ROWS} />);
const J_COND = [0, 1, 2, 3, 4].map((j) => <Cond key={j} text={`j ${j} < ${COLS}`} ok={j < COLS} />);
const ROW_TONE = ["var(--ink)", "var(--blue)", "var(--signal)"];
const PICK_K = PICK.i * COLS + PICK.j;

const build: Build = (el) => {
  const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const one = (s: string) => el.querySelector<HTMLElement>(s)!;

  const zone = one(".mem");
  const heads = all(".g2__head");
  const cells = all(".g2__cell");
  const gGarb = all(".g2__cell .g2__garb");
  const gVal = all(".g2__cell .g2__val");
  const gFly = all(".g2__cell .g2__fly");
  const dims = all(".g2__dim");
  const size = one(".g2__size");
  const gcur = one(".g2cur");

  const strip = one(".strip");
  const sSlots = all(".strip__slot");
  const sBoxes = all(".strip__box");
  const sGarb = all(".strip__box .g2__garb");
  const sVal = all(".strip__box .g2__val");
  const sAddr = all(".strip__addr");
  const bands = all(".strip__band");
  const skip = one(".strip__skip");
  const scur = one(".scur");

  const regI = one(".reg--i");
  const regJ = one(".reg--j");
  const condI = one(".reg--ci");
  const condJ = one(".reg--cj");
  const col = (r: HTMLElement) => r.querySelector<HTMLElement>(".odo__col")!;

  const formula = all(".formula__t");
  const stdin = one(".stdin");
  const toks = all(".stdin__tok");
  const tokSlots = all(".stdin__slot");
  const outs = all(".term__out");
  const outSlots = all(".term__outslot");
  const ends = all(".term__endl");
  const stamp = one(".stamp");

  // ---------- measure the clean layout ----------
  const cellPos = cells.map((c) => ({ x: c.offsetLeft, y: c.offsetTop }));
  const slotX = sSlots.map((s) => s.offsetLeft);
  const tokFly = tokSlots.map((t, k) => delta(t, cells[k]));
  const toStrip = cells.map((c, k) => delta(c, sBoxes[k]));
  const outFly = outSlots.map((o, k) => delta(o, cells[k]));
  const skipW = slotX[COLS - 1] + sSlots[0].offsetWidth - slotX[0];

  // ---------- initial state ----------
  gsap.set(heads, { autoAlpha: 0, y: -6 });
  gsap.set(cells, { autoAlpha: 0, scale: 0.7 });
  gsap.set([...gVal, ...sVal], { autoAlpha: 0, y: 10 });
  gsap.set(gFly, { autoAlpha: 0 });
  gsap.set([...dims, size], { autoAlpha: 0 });
  gsap.set(gcur, { autoAlpha: 0, x: cellPos[PICK_K].x, y: cellPos[PICK_K].y });
  gsap.set(strip, { autoAlpha: 0 });
  gsap.set(sBoxes, { autoAlpha: 0.25 });
  gsap.set(bands, { autoAlpha: 0 });
  gsap.set(skip, { autoAlpha: 0, scaleX: 0, width: skipW });
  gsap.set(scur, { autoAlpha: 0, x: slotX[PICK_K] });
  gsap.set([regI, regJ, condI, condJ], { autoAlpha: 0, y: 8 });
  gsap.set(formula, { autoAlpha: 0, y: 10 });
  gsap.set(stdin, { autoAlpha: 0 });
  gsap.set(toks, { autoAlpha: 0, y: 10 });
  gsap.set([...outs, ...ends], { autoAlpha: 0 });
  gsap.set(stamp, { autoAlpha: 0, scale: 1.8, rotation: -2, xPercent: -50, yPercent: -50 });

  // ---------- master timeline ----------
  const S = stepStarts(STEPS);
  const tl = labTimeline();
  const stops: number[] = [];
  const { type, typeTerm, hl, hlOff, odo, flash } = helpers(tl, el, PROGRAM);
  const setI = (idx: number, at: number) => odo(col(regI), I_ODO.length, idx, at);
  const setJ = (j: number, at: number) => odo(col(regJ), J_ODO.length, j + 1, at);
  const setCI = (i: number, at: number) => odo(col(condI), I_COND.length, i, at);
  const setCJ = (j: number, at: number) => odo(col(condJ), J_COND.length, j, at);
  const reveal = (t: gsap.TweenTarget, at: number) => tl.to(t, { autoAlpha: 1, y: 0, duration: 0.12 }, at);
  const hide = (t: gsap.TweenTarget, at: number, d = 0.1) => tl.to(t, { autoAlpha: 0, duration: d }, at);
  const moveCursors = (k: number, at: number) => {
    tl.to(gcur, { x: cellPos[k].x, y: cellPos[k].y, autoAlpha: 1, duration: 0.06 }, at);
    tl.to(scur, { x: slotX[k], autoAlpha: 1, duration: 0.06 }, at);
  };

  // 1 · a table
  let t = S[0];
  type([L.include, L.using, L.main, L.end], t, 0.05);
  tl.to(heads, { autoAlpha: 1, y: 0, stagger: 0.04, duration: 0.12 }, t + 0.2);
  tl.to(cells, { autoAlpha: 1, scale: 1, stagger: { each: 0.03, grid: [ROWS, COLS], from: "start" }, duration: 0.18, ease: "back.out(2)" }, t + 0.35);
  tl.to(dims, { autoAlpha: 1, stagger: 0.1, duration: 0.15 }, t + 0.75);

  // 2 · int a[3][4];
  t = S[1];
  type([L.decl], t);
  hl(L.decl, t + 0.12);
  tl.to(size, { autoAlpha: 1, duration: 0.12 }, t + 0.2);
  gGarb.forEach((g, k) =>
    tl.to(g, { scrambleText: { text: GARBAGE[k], chars: "0123456789-", speed: 0.8 }, duration: 0.25 }, t + 0.3 + k * 0.025),
  );
  type([L.vars], t + 0.75);
  hl(L.vars, t + 0.85);
  reveal([regI, regJ], t + 0.9);

  // 3 · the strip underneath, filled row by row
  t = S[2];
  hide(dims, t);
  tl.to(strip, { autoAlpha: 1, duration: 0.15 }, t + 0.05);
  for (let r = 0; r < ROWS; r++) {
    const a = t + 0.3 + r * 0.38;
    for (let c = 0; c < COLS; c++) {
      const k = r * COLS + c;
      const at = a + c * 0.04;
      tl.set(gFly[k], { autoAlpha: 1 }, at);
      tl.to(gFly[k], { x: toStrip[k].x, y: toStrip[k].y, duration: 0.2, ease: "power2.inOut" }, at);
      tl.to(gFly[k], { autoAlpha: 0, duration: 0.03 }, at + 0.2);
      tl.to(sBoxes[k], { autoAlpha: 1, duration: 0.04 }, at + 0.19);
      tl.to(sGarb[k], { scrambleText: { text: GARBAGE[k], chars: "0123456789-" }, duration: 0.08 }, at + 0.19);
    }
    tl.to(bands[r], { autoAlpha: 1, duration: 0.1 }, a + 0.3);
    stops.push(a + 0.38);
  }

  // 4 · address of a[1][2]
  t = S[3];
  tl.to(gcur, { autoAlpha: 1, duration: 0.08 }, t + 0.05);
  tl.to(formula, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.1 }, t + 0.15);
  tl.to(sAddr[0], { color: C.signal, duration: 0.06 }, t + 0.27);
  tl.to(skip, { autoAlpha: 1, scaleX: 1, duration: 0.2, ease: "power2.inOut" }, t + 0.4);
  stops.push(t + 0.62);
  tl.to(scur, { autoAlpha: 1, duration: 0.08 }, t + 0.7);
  tl.to(sAddr[PICK_K], { color: C.signal, duration: 0.06 }, t + 0.72);
  flash(sBoxes[PICK_K], t + 0.74);
  flash(cells[PICK_K], t + 0.74);

  // 5 · nested input loop
  t = S[4];
  hide([...formula, skip, gcur, scur], t);
  tl.to([sAddr[0], sAddr[PICK_K]], { color: C.blue, duration: 0.06 }, t);
  type([L.prompt, L.forI, L.forJ, L.read], t + 0.05);
  typeTerm(0, t + 0.35);
  hl(L.prompt, t + 0.45);
  typeTerm(1, t + 0.5);
  tl.to(stdin, { autoAlpha: 1, duration: 0.08 }, t + 0.6);
  tl.to(toks, { autoAlpha: 1, y: 0, stagger: 0.02, duration: 0.08 }, t + 0.62);
  typeTerm(2, t + 0.65);
  reveal([condI, condJ], t + 0.8);
  stops.push(t + 0.85);

  const JD = 0.22;
  const RW = COLS * JD + 0.3;
  for (let r = 0; r < ROWS; r++) {
    const R = t + 0.9 + r * RW;
    hl(L.forI, R);
    setI(1 + r, R);
    setCI(r, R);
    for (let c = 0; c < COLS; c++) {
      const k = r * COLS + c;
      const a = R + 0.08 + c * JD;
      hl(L.forJ, a);
      setJ(c, a);
      setCJ(c, a);
      hl(L.read, a + 0.06);
      moveCursors(k, a + 0.06);
      tl.to(toks[k], { x: tokFly[k].x, y: tokFly[k].y, duration: 0.1, ease: "power2.in" }, a + 0.07);
      hide(toks[k], a + 0.17, 0.02);
      tl.to([gGarb[k], sGarb[k]], { autoAlpha: 0, y: -10, duration: 0.05 }, a + 0.16);
      tl.to([gVal[k], sVal[k]], { autoAlpha: 1, y: 0, duration: 0.06, ease: "back.out(3)" }, a + 0.17);
      flash(cells[k], a + 0.17);
      flash(sBoxes[k], a + 0.18);
    }
    const x = R + 0.08 + COLS * JD;
    hl(L.forJ, x);
    setJ(COLS, x);
    setCJ(COLS, x);
    stops.push(R + RW);
  }
  let E = t + 0.9 + ROWS * RW;
  hl(L.forI, E);
  setI(4, E);
  setCI(ROWS, E);
  hide([gcur, scur], E + 0.1, 0.06);
  tl.to(stdin, { autoAlpha: 0.35, duration: 0.08 }, E + 0.1);

  // 6 · nested print loop
  t = S[5];
  type([L.label, L.pforI, L.pforJ, L.pbody, L.endl, L.close, L.ret], t, 0.06);
  hl(L.label, t + 0.45);
  typeTerm(3, t + 0.5);
  tl.to([gcur, scur], { borderColor: C.blue, duration: 0.01 }, t + 0.52);
  stops.push(t + 0.55);

  const PD = 0.2;
  const PW = COLS * PD + 0.35;
  for (let r = 0; r < ROWS; r++) {
    const R = t + 0.6 + r * PW;
    hl(L.pforI, R);
    setI(5 + r, R);
    setCI(r, R);
    typeTerm(4 + r, R, 0.01);
    for (let c = 0; c < COLS; c++) {
      const k = r * COLS + c;
      const a = R + 0.08 + c * PD;
      hl(L.pforJ, a);
      setJ(c, a);
      setCJ(c, a);
      hl(L.pbody, a + 0.06);
      moveCursors(k, a + 0.06);
      tl.fromTo(
        outs[k],
        { x: outFly[k].x, y: outFly[k].y, autoAlpha: 0, scale: 1.4 },
        { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.12, ease: "power2.inOut", immediateRender: false },
        a + 0.07,
      );
    }
    const x = R + 0.08 + COLS * PD;
    hl(L.pforJ, x);
    setJ(COLS, x);
    setCJ(COLS, x);
    hl(L.endl, x + 0.08);
    tl.to(ends[r], { autoAlpha: 1, duration: 0.1 }, x + 0.1);
    stops.push(R + PW);
  }
  E = t + 0.6 + ROWS * PW;
  hl(L.pforI, E);
  setI(8, E);
  setCI(ROWS, E);
  hl(L.ret, E + 0.08);
  hide([gcur, scur], E + 0.1, 0.06);

  // 7 · done
  t = S[6];
  hl(L.end, t);
  hlOff(t + 0.12);
  tl.to(bands, { color: C.pencil, duration: 0.1 }, t + 0.1);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.3);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.48);

  tl.set({}, {}, totalWeight(STEPS));
  return { tl, stops };
};

export default function Stage() {
  const pickAddr = BASE + PICK_K * 4;
  return (
    <Lab steps={STEPS} build={build} className="lab--dense">
      <CodePanel file="matrix.cpp" program={PROGRAM} />

      <div className="viz">
        <div className="viz__head">
          <span className="viz__title">memory</span>
          <div className="regs">
            <Reg name="i" className="reg--i" items={I_ODO} />
            <Reg name="j" className="reg--j" items={J_ODO} />
            <Reg className="reg--ci" items={I_COND} />
            <Reg className="reg--cj" items={J_COND} />
          </div>
        </div>

        <div className="mem mem--2d">
          <div className="m2">
            <div className="g2">
              <span className="g2__corner" />
              {Array.from({ length: COLS }, (_, c) => (
                <span className="g2__head g2__head--col" key={`c${c}`}>
                  [{c}]
                </span>
              ))}
              {GRID.map((row, r) => [
                <span className="g2__head g2__head--row" key={`r${r}`} style={{ color: ROW_TONE[r] }}>
                  [{r}]
                </span>,
                ...row.map((v, c) => (
                  <div className="g2__cell" key={`${r}-${c}`} style={{ borderLeftColor: c === 0 ? ROW_TONE[r] : undefined }}>
                    <span className="g2__garb" />
                    <span className="g2__val">{v}</span>
                    <span className="g2__fly">{GARBAGE[r * COLS + c]}</span>
                  </div>
                )),
              ])}
              <span className="g2__dim g2__dim--rows">3 rows ↓</span>
              <span className="g2__dim g2__dim--cols">4 columns →</span>
              <span className="g2__size">3 × 4 = 12 ints · 48 bytes</span>
              <div className="g2cur" aria-hidden />
            </div>

            <div className="strip">
              <div className="strip__skip">
                <span>skip row 0 · 1 × 4 ints</span>
              </div>
              <div className="strip__row">
                {FLAT.map((v, k) => (
                  <div className="strip__slot" key={k}>
                    <span className="strip__addr">{BASE + k * 4}</span>
                    <div className="strip__box" style={{ borderTopColor: ROW_TONE[Math.floor(k / COLS)] }}>
                      <span className="g2__garb" />
                      <span className="g2__val">{v}</span>
                    </div>
                  </div>
                ))}
                <div className="scur" aria-hidden />
              </div>
              <div className="strip__bands">
                {GRID.map((_, r) => (
                  <span className="strip__band" key={r} style={{ color: ROW_TONE[r] }}>
                    row {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="stamp" aria-hidden>
            <span>Solved</span>
            <small>O(rows × cols) time and space</small>
          </div>
        </div>

        <div className="formula" aria-hidden>
          {[
            `&a[${PICK.i}][${PICK.j}]`,
            "=",
            String(BASE),
            "+",
            `(${PICK.i} × ${COLS} + ${PICK.j})`,
            "× 4",
            "=",
            String(pickAddr),
          ].map((f, i, arr) => (
            <span key={i} className={`formula__t${i === 0 || i === arr.length - 1 ? " is-key" : ""}`}>
              {f}
            </span>
          ))}
          <span className="formula__t formula__note">base + (i × cols + j) × size</span>
        </div>

        <div className="stdin stdin--wide">
          <span className="stdin__k">stdin</span>
          {FLAT.map((v, k) => (
            <span className="stdin__slot" key={k}>
              <span className="stdin__tok">{v}</span>
            </span>
          ))}
        </div>

        <div className="term">
          <div className="term__line">
            <span className="term__ps">$</span> ./matrix
          </div>
          <div className="term__line">Enter 12 elements:</div>
          <div className="term__line term__in">{FLAT.join(" ")}</div>
          <div className="term__line">The matrix:</div>
          {GRID.map((row, r) => (
            <div className="term__line" key={r}>
              {row.map((v, c) => (
                <span className="term__outslot" key={c}>
                  <span className="term__out">{v}</span>{" "}
                </span>
              ))}
              <span className="term__endl">↵ endl</span>
            </div>
          ))}
        </div>
      </div>
    </Lab>
  );
}
