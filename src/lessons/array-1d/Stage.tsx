"use client";

import { gsap } from "@/lib/gsap";
import { highlightCode } from "@/components/highlight";
import { C, helpers, labTimeline, stepStarts, type Build } from "@/components/lesson/kit";
import Lab from "@/components/lesson/Lab";
import { CodePanel } from "@/components/lesson/parts";
import { ADDR, GARBAGE, L, LOOSE_ADDR, NAMES, PROGRAM, SCATTER, STEPS, STRANGERS, TOTAL_W, VALUES } from "./data";

const I_ODO = ["?", "0", "1", "2", "3", "4", "5"];
const COND_ODO = [0, 1, 2, 3, 4, 5];

const build: Build = (el) => {
  const all = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(s));
  const one = (s: string) => el.querySelector<HTMLElement>(s)!;
  const rect = (a: Element) => a.getBoundingClientRect();
  const center = (a: Element) => {
    const r = rect(a);
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  const ghost = one(".code__ghost");
  const ghostStrike = one(".code__ghost-strike");
  const zone = one(".mem");
  const slots = all(".slot");
  const cells = all(".cell");
  const names = all(".cell__name");
  const addrs = all(".cell__addr");
  const boxes = all(".cell__box");
  const garbs = all(".cell__garb");
  const vals = all(".cell__val");
  const ticks = all(".cell__bytes");
  const idxs = all(".cell__idx");
  const strangers = all(".stranger");
  const bracket = one(".mem__bracket");
  const dim = one(".mem__dim");
  const cursor = one(".cursor");
  const tagPoint = one(".cursor__tag--point");
  const tagWrite = one(".cursor__tag--write");
  const tagRead = one(".cursor__tag--read");
  const iReg = one(".reg--i");
  const iCol = one(".reg--i .odo__col");
  const cond = one(".reg--cond");
  const condCol = one(".reg--cond .odo__col");
  const sizeofReg = one(".reg--sizeof");
  const formula = all(".formula__t");
  const stdin = one(".stdin");
  const toks = all(".stdin__tok");
  const tokSlots = all(".stdin__slot");
  const outs = all(".term__out");
  const outSlots = all(".term__outslot");
  const stamp = one(".stamp");

  // ---------- measure the clean layout ----------
  const z = rect(zone);
  const scatter = slots.map((s, k) => {
    const r = rect(s);
    return {
      x: z.width * SCATTER[k].fx - (r.left - z.left),
      y: z.height * SCATTER[k].fy - (r.top - z.top),
      r: SCATTER[k].r,
    };
  });
  const slotX = slots.map((s) => s.offsetLeft - slots[0].offsetLeft);
  const tokFly = tokSlots.map((t, k) => {
    const a = center(t);
    const b = center(boxes[k]);
    return { x: b.x - a.x, y: b.y - a.y };
  });
  const outFly = outSlots.map((o, k) => {
    const a = center(o);
    const b = center(boxes[k]);
    return { x: b.x - a.x, y: b.y - a.y };
  });

  // ---------- initial state ----------
  gsap.set(ghost, { clipPath: "inset(0 100% 0 0)" });
  gsap.set(ghostStrike, { scaleX: 0 });
  cells.forEach((c, k) =>
    gsap.set(c, { x: scatter[k].x, y: scatter[k].y, rotation: scatter[k].r, autoAlpha: 0, scale: 0.6 }),
  );
  gsap.set(strangers, { autoAlpha: 0, scale: 0.8 });
  gsap.set(bracket, { scaleX: 0 });
  gsap.set(dim, { autoAlpha: 0, scaleX: 0.3 });
  gsap.set(ticks, { scaleY: 0 });
  gsap.set(vals, { autoAlpha: 0, y: 12 });
  gsap.set(idxs, { autoAlpha: 0, y: -10 });
  gsap.set(cursor, { autoAlpha: 0, x: slotX[3] });
  gsap.set([iReg, cond, sizeofReg], { autoAlpha: 0, y: 8 });
  gsap.set(formula, { autoAlpha: 0, y: 10 });
  gsap.set(stdin, { autoAlpha: 0 });
  gsap.set(toks, { autoAlpha: 0, y: 14 });
  gsap.set(outs, { autoAlpha: 0 });
  gsap.set([tagWrite, tagRead], { autoAlpha: 0 });
  gsap.set(stamp, { autoAlpha: 0, scale: 1.8, rotation: -2, xPercent: -50, yPercent: -50 });

  // ---------- master timeline, scrubbed by scroll ----------
  const S = stepStarts(STEPS);
  const tl = labTimeline();
  const stops: number[] = [];
  const { type, typeTerm, hl, hlOff, odo, flash } = helpers(tl, el, PROGRAM);
  const setI = (v: number, at: number) => odo(iCol, I_ODO.length, v + 1, at);
  const setCond = (v: number, at: number) => odo(condCol, COND_ODO.length, v, at);

  // 1 · scattered variables
  let t = S[0];
  tl.to(ghost, { clipPath: "inset(0 0% 0 0)", duration: 0.2, ease: "steps(22)" }, t + 0.05);
  tl.to(strangers, { autoAlpha: 1, scale: 1, stagger: 0.06, ease: "back.out(1.6)" }, t + 0.1);
  tl.to(cells, { autoAlpha: 1, scale: 1, stagger: 0.1, ease: "back.out(2)", duration: 0.3 }, t + 0.3);

  // 2 · pull them into one block
  t = S[1];
  tl.to(ghostStrike, { scaleX: 1, duration: 0.15, ease: "power1.inOut" }, t);
  tl.to(ghost, { autoAlpha: 0, y: -8, duration: 0.15 }, t + 0.25);
  tl.to(strangers, { autoAlpha: 0, x: (i) => (i % 2 ? 60 : -60), stagger: 0.03, duration: 0.25 }, t + 0.1);
  tl.to(names, { autoAlpha: 0, y: -6, duration: 0.12 }, t + 0.1);
  tl.to(cells, { x: 0, y: 0, rotation: 0, duration: 0.45, ease: "power3.inOut", stagger: 0.04 }, t + 0.18);
  addrs.forEach((a, k) =>
    tl.to(
      a,
      { scrambleText: { text: String(ADDR[k]), chars: "0123456789", speed: 0.6 }, duration: 0.3 },
      t + 0.5 + k * 0.04,
    ),
  );
  tl.to(bracket, { scaleX: 1, duration: 0.25, ease: "power2.inOut" }, t + 0.66);
  type([L.include, L.using, L.main, L.end], t + 0.45, 0.06);
  type([L.decl], t + 0.72);

  // 3 · int arr[5]; — bytes and garbage
  t = S[2];
  hl(L.decl, t);
  tl.to(ticks, { scaleY: 1, stagger: 0.04, duration: 0.15 }, t + 0.1);
  tl.to(dim, { autoAlpha: 1, scaleX: 1, duration: 0.2 }, t + 0.25);
  tl.to(sizeofReg, { autoAlpha: 1, y: 0, duration: 0.15 }, t + 0.25);
  garbs.forEach((g, k) =>
    tl.to(
      g,
      { scrambleText: { text: GARBAGE[k], chars: "0123456789-", speed: 0.8 }, duration: 0.3 },
      t + 0.35 + k * 0.05,
    ),
  );
  type([L.declI], t + 0.72);
  hl(L.declI, t + 0.8);
  tl.to(iReg, { autoAlpha: 1, y: 0, duration: 0.15 }, t + 0.84);

  // 4 · index and address arithmetic
  t = S[3];
  hl(L.decl, t);
  tl.to(dim, { autoAlpha: 0, duration: 0.1 }, t);
  tl.to(idxs, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.15, ease: "back.out(2)" }, t + 0.05);
  tl.to(formula, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.12 }, t + 0.35);
  tl.to(addrs[0], { color: C.signal, duration: 0.08 }, t + 0.49);
  tl.to(cursor, { autoAlpha: 1, duration: 0.1 }, t + 0.9);
  tl.to(addrs[3], { color: C.signal, duration: 0.08 }, t + 0.9);
  flash(boxes[3], t + 0.95);

  // 5 · input loop
  t = S[4];
  tl.to(formula, { autoAlpha: 0, y: -8, stagger: 0.02, duration: 0.1 }, t);
  tl.to(cursor, { autoAlpha: 0, duration: 0.08 }, t);
  tl.to([addrs[0], addrs[3]], { color: C.blue, duration: 0.08 }, t);
  type([L.prompt, L.forIn, L.read, L.closeIn], t + 0.05);
  typeTerm(0, t + 0.5);
  hl(L.prompt, t + 0.6);
  typeTerm(1, t + 0.66);
  tl.to(stdin, { autoAlpha: 1, duration: 0.1 }, t + 0.85);
  tl.to(toks, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.1 }, t + 0.88);
  typeTerm(2, t + 0.88);
  tl.to(cond, { autoAlpha: 1, y: 0, duration: 0.1 }, t + 1.15);
  tl.to(tagPoint, { autoAlpha: 0, duration: 0.01 }, t + 1.15);
  tl.to(tagWrite, { autoAlpha: 1, duration: 0.01 }, t + 1.15);

  stops.push(t + 1.15);
  let L0 = t + 1.2;
  let D = 0.34;
  VALUES.forEach((_, k) => {
    const a = L0 + k * D;
    hl(L.forIn, a);
    setI(k, a);
    setCond(k, a);
    hl(L.read, a + 0.1);
    tl.to(cursor, { x: slotX[k], autoAlpha: 1, duration: 0.08 }, a + 0.1);
    tl.to(toks[k], { x: tokFly[k].x, y: tokFly[k].y, scale: 0.9, duration: 0.14, ease: "power2.in" }, a + 0.12);
    tl.to(toks[k], { autoAlpha: 0, duration: 0.03 }, a + 0.26);
    tl.to(garbs[k], { autoAlpha: 0, y: -12, duration: 0.07 }, a + 0.24);
    tl.to(vals[k], { autoAlpha: 1, y: 0, duration: 0.08, ease: "back.out(3)" }, a + 0.25);
    flash(boxes[k], a + 0.25);
    stops.push(a + D);
  });
  let E = L0 + VALUES.length * D;
  hl(L.forIn, E);
  setI(5, E);
  setCond(5, E);
  hl(L.closeIn, E + 0.12);
  tl.to(cursor, { autoAlpha: 0, duration: 0.08 }, E + 0.15);
  tl.to(stdin, { autoAlpha: 0.35, duration: 0.1 }, E + 0.15);

  // 6 · output loop
  t = S[5];
  type([L.label, L.forOut, L.print, L.closeOut], t + 0.05);
  hl(L.label, t + 0.5);
  typeTerm(3, t + 0.55);
  tl.to(tagWrite, { autoAlpha: 0, duration: 0.01 }, t + 0.8);
  tl.to(tagRead, { autoAlpha: 1, duration: 0.01 }, t + 0.8);
  tl.to(cursor, { borderColor: C.blue, duration: 0.01 }, t + 0.8);
  stops.push(t + 0.8);
  L0 = t + 0.85;
  D = 0.4;
  VALUES.forEach((_, k) => {
    const a = L0 + k * D;
    hl(L.forOut, a);
    setI(k, a);
    setCond(k, a);
    hl(L.print, a + 0.12);
    tl.to(cursor, { x: slotX[k], autoAlpha: 1, duration: 0.08 }, a + 0.12);
    tl.to(boxes[k], { y: -8, duration: 0.06 }, a + 0.14).to(boxes[k], { y: 0, duration: 0.1 }, a + 0.22);
    tl.fromTo(
      outs[k],
      { x: outFly[k].x, y: outFly[k].y, autoAlpha: 0, scale: 1.5 },
      { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.2, ease: "power2.inOut", immediateRender: false },
      a + 0.16,
    );
    stops.push(a + D);
  });
  E = L0 + VALUES.length * D;
  hl(L.forOut, E);
  setI(5, E);
  setCond(5, E);
  hl(L.closeOut, E + 0.12);
  tl.to(cursor, { autoAlpha: 0, duration: 0.08 }, E + 0.15);

  // 7 · return 0 and the stamp
  t = S[6];
  type([L.ret], t + 0.05);
  hl(L.ret, t + 0.15);
  typeTerm(4, t + 0.3);
  hl(L.end, t + 0.42);
  hlOff(t + 0.55);
  tl.to(stamp, { autoAlpha: 1, scale: 1, rotation: -9, duration: 0.18, ease: "power4.in" }, t + 0.55);
  tl.to(zone, { x: 3, yoyo: true, repeat: 3, duration: 0.02, ease: "none" }, t + 0.73);

  tl.set({}, {}, TOTAL_W);

  return { tl, stops };
};

export default function Stage() {
  return (
    <Lab steps={STEPS} build={build}>
        <CodePanel file="array.cpp" program={PROGRAM}>
          <div className="code__ghost" aria-hidden>
            <span className="code__ghost-text">
              {highlightCode("int a, b, c, d, e;")}
              <span className="tk-com">{"  // one by one?"}</span>
            </span>
            <span className="code__ghost-strike" />
          </div>
        </CodePanel>

        <div className="viz">
          <div className="viz__head">
            <span className="viz__title">memory · main()</span>
            <div className="regs">
              <div className="reg reg--sizeof">
                <span className="reg__k">sizeof(int)</span>
                <span className="reg__v">4</span>
              </div>
              <div className="reg reg--i">
                <span className="reg__k">i</span>
                <span className="reg__v odo">
                  <span className="odo__col">
                    {I_ODO.map((v) => (
                      <span key={v}>{v}</span>
                    ))}
                  </span>
                </span>
              </div>
              <div className="reg reg--cond">
                <span className="reg__v odo">
                  <span className="odo__col">
                    {COND_ODO.map((v) => (
                      <span key={v} className={v < 5 ? "is-true" : "is-false"}>
                        {v} &lt; 5 <b>{v < 5 ? "true" : "false"}</b>
                      </span>
                    ))}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="mem">
            {STRANGERS.map((s) => (
              <div
                key={s.label}
                className="stranger"
                style={{ left: `${s.fx * 100}%`, top: `${s.fy * 100}%` }}
              >
                {s.label}
              </div>
            ))}
            <div className="mem__row">
              <div className="mem__bracket">
                <span>arr</span>
              </div>
              {VALUES.map((v, k) => (
                <div className="slot" key={k}>
                  <div className="cell">
                    <span className="cell__name">{NAMES[k]}</span>
                    <span className="cell__addr">{LOOSE_ADDR[k]}</span>
                    <div className="cell__box">
                      <span className="cell__garb" />
                      <span className="cell__val">{v}</span>
                      <span className="cell__bytes" aria-hidden>
                        <i />
                        <i />
                        <i />
                      </span>
                    </div>
                    <span className="cell__idx">[{k}]</span>
                  </div>
                </div>
              ))}
              <div className="cursor" aria-hidden>
                <span className="cursor__tag cursor__tag--point">arr[3]</span>
                <span className="cursor__tag cursor__tag--write">write · arr[i]</span>
                <span className="cursor__tag cursor__tag--read">read · arr[i]</span>
              </div>
              <div className="mem__dim" aria-hidden>
                <span>5 × 4 = 20 bytes</span>
              </div>
            </div>
            <div className="stamp" aria-hidden>
              <span>Solved</span>
              <small>O(n) time · O(n) space</small>
            </div>
          </div>

          <div className="formula" aria-hidden>
            {["&arr[3]", "=", "1000", "+", "3", "×", "4", "=", "1012"].map((f, i) => (
              <span key={i} className={`formula__t${i === 0 || i === 8 ? " is-key" : ""}`}>
                {f}
              </span>
            ))}
            <span className="formula__t formula__note">base + index × size</span>
          </div>

          <div className="stdin">
            <span className="stdin__k">stdin</span>
            {VALUES.map((v, k) => (
              <span className="stdin__slot" key={k}>
                <span className="stdin__tok">{v}</span>
              </span>
            ))}
          </div>

          <div className="term">
            <div className="term__line">
              <span className="term__ps">$</span> ./array
            </div>
            <div className="term__line">Enter 5 elements:</div>
            <div className="term__line term__in">{VALUES.join(" ")}</div>
            <div className="term__line">
              Array elements:{" "}
              {VALUES.map((v, k) => (
                <span className="term__outslot" key={k}>
                  <span className="term__out">{v}</span>{" "}
                </span>
              ))}
            </div>
            <div className="term__line term__dim">process exited with code 0</div>
          </div>
        </div>
    </Lab>
  );
}
