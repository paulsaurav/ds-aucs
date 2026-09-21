"use client";

import { useRef, useState, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const BASE = 2000;
const TONES = ["var(--ink)", "var(--blue)", "var(--signal)", "#2f7d4f"];

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);
  const [built, setBuilt] = useState({ rows: 3, cols: 4, id: 0 });
  const [pick, setPick] = useState<{ i: number; j: number } | null>(null);

  const values = Array.from({ length: built.rows * built.cols }, (_, k) => ((k * 37 + 11) % 90) + 10);
  const k = pick ? pick.i * built.cols + pick.j : -1;

  const { contextSafe } = useGSAP(
    () => {
      if (built.id === 0) return;
      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .from(".mpg .g2__cell", { autoAlpha: 0, scale: 0.6, stagger: 0.035, duration: 0.25 })
        .from(".mpg .strip__slot", { autoAlpha: 0, y: -10, stagger: 0.035, duration: 0.25 }, 0);
    },
    { scope: ref, dependencies: [built.id], revertOnUpdate: true },
  );

  const choose = contextSafe((i: number, j: number) => {
    setPick({ i, j });
    requestAnimationFrame(() =>
      gsap.fromTo(".mpg__answer > *", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3 }),
    );
  });

  const stepper = (label: string, v: number, set: (n: number) => void, max: number) => (
    <div className="mpg__step">
      <span>{label}</span>
      <button className="btn btn--ghost" onClick={() => set(Math.max(1, v - 1))} aria-label={`fewer ${label}`}>
        −
      </button>
      <b>{v}</b>
      <button className="btn btn--ghost" onClick={() => set(Math.min(max, v + 1))} aria-label={`more ${label}`}>
        +
      </button>
    </div>
  );

  return (
    <section className="block pg mpg" ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>Find any element in memory</h2>
      </div>

      <div className="mpg__form">
        {stepper("rows", rows, setRows, 4)}
        {stepper("cols", cols, setCols, 6)}
        <button
          className="btn"
          onClick={() => {
            setPick(null);
            setBuilt((b) => ({ rows, cols, id: b.id + 1 }));
          }}
        >
          Build a[{rows}][{cols}]
        </button>
      </div>
      <p className="pg__err">Click any cell in the table to see where it sits in the strip, and why.</p>

      <div
        className="mpg__stage"
        style={{ "--mc": built.cols, "--gw": "56px", "--gh": "44px", "--sw": "40px" } as CSSProperties}
      >
        <div className="g2 mpg__grid" style={{ gridTemplateColumns: `34px repeat(${built.cols}, var(--gw))`, gridTemplateRows: `20px repeat(${built.rows}, var(--gh))` }}>
          <span className="g2__corner" />
          {Array.from({ length: built.cols }, (_, c) => (
            <span className="g2__head" key={`c${c}`}>
              [{c}]
            </span>
          ))}
          {Array.from({ length: built.rows }, (_, i) => [
            <span className="g2__head g2__head--row" key={`r${i}`} style={{ color: TONES[i] }}>
              [{i}]
            </span>,
            ...Array.from({ length: built.cols }, (_, j) => (
              <button
                key={`${built.id}-${i}-${j}`}
                className={`g2__cell mpg__cell${pick?.i === i && pick?.j === j ? " is-picked" : ""}`}
                onClick={() => choose(i, j)}
                aria-label={`a[${i}][${j}]`}
              >
                {values[i * built.cols + j]}
              </button>
            )),
          ])}
        </div>

        <div className="strip mpg__strip">
          <div className="strip__row">
            {values.map((v, n) => (
              <div className={`strip__slot${n === k ? " is-picked" : ""}${k >= 0 && n < k ? " is-skipped" : ""}`} key={`${built.id}-${n}`}>
                <span className="strip__addr">{BASE + n * 4}</span>
                <div className="strip__box" style={{ borderTopColor: TONES[Math.floor(n / built.cols)] }}>
                  {v}
                </div>
                <span className="mpg__n">{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mpg__answer" aria-live="polite">
          {pick ? (
            <>
              <code>
                a[{pick.i}][{pick.j}] is element {pick.i} × {built.cols} + {pick.j} = <b>{k}</b>
              </code>
              <code>
                address = {BASE} + {k} × 4 = <b>{BASE + k * 4}</b>
              </code>
              <span>
                {pick.i === 0
                  ? "Row 0 is first in memory, so nothing is skipped: just move along the row."
                  : `Skip ${pick.i} full row${pick.i > 1 ? "s" : ""} (${pick.i} × ${built.cols} = ${pick.i * built.cols} elements), then ${pick.j} more.`}
              </span>
            </>
          ) : (
            <span className="mpg__hint">No cell picked yet.</span>
          )}
        </div>
      </div>
    </section>
  );
}
