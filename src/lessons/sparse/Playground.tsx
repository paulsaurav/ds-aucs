"use client";

import { useRef, useState, type CSSProperties } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { C } from "@/components/lesson/kit";

const R = 5;
const K = 6;
const START = [
  [0, 0, 0, 4, 0, 0],
  [0, 8, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 2],
  [0, 0, 0, 0, 0, 0],
  [6, 0, 0, 0, 1, 0],
];

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const [grid, setGrid] = useState(START);
  const [scanId, setScanId] = useState(0);

  const flat = grid.flat();
  const trips = flat.flatMap((v, k) => (v ? [{ i: Math.floor(k / K), j: k % K, v }] : []));
  const full = R * K;
  const triplet = (trips.length + 1) * 3;

  const toggle = (i: number, j: number) =>
    setGrid((g) => g.map((row, r) => row.map((v, c) => (r === i && c === j ? (v ? 0 : 1 + ((i * 7 + j * 3) % 9)) : v))));

  useGSAP(
    () => {
      if (scanId === 0) return;
      const cells = gsap.utils.toArray<HTMLElement>(".spg .g2__cell");
      const rows = gsap.utils.toArray<HTMLElement>(".spg .trip__row--data");
      const cur = ".spg .g2cur";
      gsap.set(rows, { autoAlpha: 0, x: -8 });
      const tl = gsap.timeline();
      tl.set(cur, { autoAlpha: 1 });
      let n = 0;
      cells.forEach((cell, k) => {
        tl.to(cur, { x: cell.offsetLeft, y: cell.offsetTop, duration: 0.07, ease: "power2.out" });
        if (flat[k]) {
          tl.to(cell, { backgroundColor: C.marker, duration: 0.06 })
            .to(rows[n++], { autoAlpha: 1, x: 0, duration: 0.18 }, "<")
            .to(cell, { backgroundColor: C.cell, duration: 0.3 }, "+=0.12");
        }
      });
      tl.to(cur, { autoAlpha: 0, duration: 0.2 });
    },
    { scope: ref, dependencies: [scanId], revertOnUpdate: true },
  );

  return (
    <section className="block pg spg" ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>When does triplet form win?</h2>
      </div>

      <div className="spg__bar">
        <button className="btn" onClick={() => setScanId((s) => s + 1)}>
          Scan
        </button>
        <button className="btn btn--ghost" onClick={() => setGrid(START.map(() => Array(K).fill(0)))}>
          All zero
        </button>
        <button className="btn btn--ghost" onClick={() => setGrid(START)}>
          Reset
        </button>
      </div>
      <p className="pg__err">Click a cell to switch it between zero and a value. Watch the two sizes.</p>

      <div className="spg__stage" style={{ "--gw": "52px", "--gh": "42px" } as CSSProperties}>
        <div className="g2 spg__grid" style={{ gridTemplateColumns: `30px repeat(${K}, var(--gw))`, gridTemplateRows: `20px repeat(${R}, var(--gh))` }}>
          <span className="g2__corner" />
          {Array.from({ length: K }, (_, c) => (
            <span className="g2__head" key={`c${c}`}>
              [{c}]
            </span>
          ))}
          {grid.map((row, i) => [
            <span className="g2__head g2__head--row" key={`r${i}`}>
              [{i}]
            </span>,
            ...row.map((v, j) => (
              <button
                key={`${i}-${j}`}
                className={`g2__cell spg__cell${v ? " is-nz" : ""}`}
                onClick={() => toggle(i, j)}
                aria-label={`a[${i}][${j}] = ${v}`}
              >
                {v}
              </button>
            )),
          ])}
          <div className="g2cur" aria-hidden style={{ opacity: 0, visibility: "hidden" }} />
        </div>

        <div className="trip spg__trip">
          <div className="trip__row trip__head">
            <i />
            <span>row</span>
            <span>col</span>
            <span>value</span>
          </div>
          <div className="trip__row trip__row--0">
            <i>t[0]</i>
            <span>{R}</span>
            <span>{K}</span>
            <span>{trips.length}</span>
          </div>
          {trips.map((t, n) => (
            <div className="trip__row trip__row--data" key={`${t.i}-${t.j}`}>
              <i>t[{n + 1}]</i>
              <span>{t.i}</span>
              <span>{t.j}</span>
              <span>{t.v}</span>
            </div>
          ))}
        </div>

        <div className="spg__sizes">
          <div className="cmp__row">
            <span>full a[{R}][{K}]</span>
            <span className="cmp__bar">
              <i style={{ width: "100%" }} />
            </span>
            <b>{full} ints</b>
          </div>
          <div className="cmp__row">
            <span>triplet t[{trips.length + 1}][3]</span>
            <span className={`cmp__bar${triplet < full ? " cmp__bar--win" : ""}`}>
              <i style={{ width: `${Math.min(100, (triplet / full) * 100)}%` }} />
            </span>
            <b>{triplet} ints</b>
          </div>
          <p className={`spg__verdict${triplet < full ? " is-win" : ""}`}>
            {triplet < full
              ? `Triplet form saves ${full - triplet} ints (${Math.round((1 - triplet / full) * 100)}%).`
              : `Triplet form is ${triplet === full ? "no smaller" : `${triplet - full} ints bigger`}. Too many non-zeros: this array isn't sparse any more.`}
          </p>
          <p className="spg__rule">
            Break-even: (count + 1) × 3 &lt; {full} ⇔ count &lt; {Math.ceil(full / 3) - 1}
          </p>
        </div>
      </div>
    </section>
  );
}
