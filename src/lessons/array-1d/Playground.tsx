"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { highlightCode } from "@/components/highlight";

const BASE = 2000;
const MAX = 8;

function parse(text: string): number[] | string {
  const parts = text.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) return "Type at least one number.";
  if (parts.length > MAX) return `Keep it to ${MAX} numbers so everything fits.`;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isInteger(n))) return "Whole numbers only — this is an int array.";
  if (nums.some((n) => Math.abs(n) > 99999)) return "Keep each number between -99999 and 99999.";
  return nums;
}

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const [text, setText] = useState("5 12 -3 40 7 21");
  const [vals, setVals] = useState<number[]>([5, 12, -3, 40, 7, 21]);
  const [run, setRun] = useState(0);
  const [err, setErr] = useState("");

  const onRun = () => {
    const r = parse(text);
    if (typeof r === "string") return setErr(r);
    setErr("");
    setVals(r);
    setRun((n) => n + 1);
  };

  useGSAP(
    () => {
      if (run === 0) return;
      const slots = gsap.utils.toArray<HTMLElement>(".pg__slot");
      const vs = gsap.utils.toArray<HTMLElement>(".pg__val");
      const outs = gsap.utils.toArray<HTMLElement>(".pg__out");
      const head = ".pg__head";
      const x = slots.map((s) => s.offsetLeft);

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".pg__decl", { autoAlpha: 0, y: 6, duration: 0.3 })
        .from(slots, { autoAlpha: 0, scaleY: 0, transformOrigin: "bottom", stagger: 0.05, duration: 0.3 }, "<0.1")
        .set(vs, { autoAlpha: 0, y: -24 })
        .set(outs, { autoAlpha: 0, y: 6 })
        .set(head, { x: x[0], autoAlpha: 0, borderColor: "#d8432a" })
        .to(head, { autoAlpha: 1, duration: 0.15 });

      vs.forEach((v, k) => {
        tl.to(head, { x: x[k], duration: 0.22 }).to(v, { autoAlpha: 1, y: 0, duration: 0.3, ease: "bounce.out" }, "<0.1");
      });

      tl.to(head, { borderColor: "#24479a", duration: 0.1 }, "+=0.3");
      outs.forEach((o, k) => {
        tl.to(head, { x: x[k], duration: 0.22 }).to(o, { autoAlpha: 1, y: 0, duration: 0.2 }, "<0.12");
      });
      tl.to(head, { autoAlpha: 0, duration: 0.2 }, "+=0.2");
    },
    { scope: ref, dependencies: [run], revertOnUpdate: true },
  );

  return (
    <section className={`block pg${run ? " has-run" : ""}`} ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>Put your own numbers in</h2>
      </div>

      <div className="pg__controls">
        <label className="pg__label" htmlFor="pg-input">
          stdin
        </label>
        <input
          id="pg-input"
          className="pg__input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onRun()}
          spellCheck={false}
          autoComplete="off"
        />
        <button className="btn" onClick={onRun}>
          Run
        </button>
      </div>
      <p className="pg__err" role="status">
        {err || `Up to ${MAX} whole numbers, separated by spaces.`}
      </p>

      <div className="pg__stage">
        <code className="pg__decl">{highlightCode(`int arr[${vals.length}];   // ${vals.length} × 4 = ${vals.length * 4} bytes`)}</code>
        <div className="pg__row">
          {vals.map((v, k) => (
            <div className="pg__slot" key={`${run}-${k}`}>
              <span className="pg__addr">{BASE + k * 4}</span>
              <span className="pg__box">
                <span className="pg__val">{v}</span>
              </span>
              <span className="pg__idx">[{k}]</span>
            </div>
          ))}
          <span className="pg__head" aria-hidden />
        </div>
        <div className="term pg__term">
          <div className="term__line">
            Array elements:{" "}
            {vals.map((v, k) => (
              <span className="pg__out" key={`${run}-${k}`}>
                {v}{" "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
