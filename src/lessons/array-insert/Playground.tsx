"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { C } from "@/components/lesson/kit";

const CAP = 10;
type Where = "begin" | "end" | "pos";
type Run = { before: number[]; x: number; pos: number };

function parseList(text: string): number[] | string {
  const parts = text.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length === 0) return "Type at least one number for the array.";
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isInteger(n) || Math.abs(n) > 9999)) return "Whole numbers between -9999 and 9999 only.";
  return nums;
}

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const [list, setList] = useState("4 8 15 16 23");
  const [xText, setXText] = useState("42");
  const [where, setWhere] = useState<Where>("pos");
  const [posText, setPosText] = useState("1");
  const [run, setRun] = useState<Run>({ before: [4, 8, 15, 16, 23], x: 42, pos: 1 });
  const [runId, setRunId] = useState(0);
  const [msg, setMsg] = useState("");

  const onRun = () => {
    const before = parseList(list);
    if (typeof before === "string") return setMsg(before);
    const x = Number(xText);
    if (!Number.isInteger(x) || Math.abs(x) > 9999) return setMsg("The element must be a whole number.");
    const n = before.length;
    if (n >= CAP) return setMsg(`n == ${CAP}: the array is full. Cannot insert.`);
    const pos = where === "begin" ? 0 : where === "end" ? n : Number(posText);
    if (!Number.isInteger(pos) || pos < 0 || pos > n)
      return setMsg(`pos must be between 0 and n = ${n}. ${pos} would leave a hole or go out of bounds.`);
    setMsg(`pos = ${pos}. The loop will move ${n - pos} element${n - pos === 1 ? "" : "s"}.`);
    setRun({ before, x, pos });
    setRunId((r) => r + 1);
  };

  const { before, x, pos } = run;
  const n = before.length;
  const after = [...before.slice(0, pos), x, ...before.slice(pos)];

  useGSAP(
    () => {
      if (runId === 0) return;
      const slots = gsap.utils.toArray<HTMLElement>(".ipg .islot");
      const olds = gsap.utils.toArray<HTMLElement>(".ipg .ival--old");
      const news = gsap.utils.toArray<HTMLElement>(".ipg .ival--new");
      const flyers = gsap.utils.toArray<HTMLElement>(".ipg .iflyer");
      const boxes = gsap.utils.toArray<HTMLElement>(".ipg .ibox");
      const step = slots[1].offsetLeft - slots[0].offsetLeft;

      gsap.set([...news, ...flyers], { autoAlpha: 0 });
      gsap.set(".ipg__x", { autoAlpha: 0, y: -40 });

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      tl.from(slots, { autoAlpha: 0, y: -12, stagger: 0.03, duration: 0.25 });
      // back to front: source n-1 down to pos
      for (let k = n - 1; k >= pos; k--) {
        const fly = flyers.find((f) => Number(f.dataset.k) === k)!;
        tl.to(fly, { autoAlpha: 1, duration: 0.05 })
          .to(fly, { x: step, duration: 0.3 })
          .to(olds[k + 1], { autoAlpha: 0, duration: 0.08 }, "<0.22")
          .to(news[k + 1], { autoAlpha: 1, duration: 0.05 })
          .to(fly, { autoAlpha: 0, duration: 0.05 }, "<")
          .to(boxes[k + 1], { backgroundColor: C.marker, duration: 0.08 }, "<")
          .to(boxes[k + 1], { backgroundColor: C.cell, duration: 0.25 });
      }
      tl.to(".ipg__x", { autoAlpha: 1, y: 0, duration: 0.35, ease: "bounce.out" }, "+=0.1")
        .to(olds[pos], { autoAlpha: 0, duration: 0.08 }, "-=0.1")
        .to(news[pos], { autoAlpha: 1, duration: 0.05 })
        .to(".ipg__x", { autoAlpha: 0, duration: 0.1 }, "<")
        .to(boxes[pos], { backgroundColor: C.signal, duration: 0.08 }, "<")
        .to(boxes[pos], { backgroundColor: C.cell, duration: 0.4 })
        .to(".ipg__used", { width: slots[n].offsetLeft + slots[n].offsetWidth, duration: 0.3 }, "<");
    },
    { scope: ref, dependencies: [runId], revertOnUpdate: true },
  );

  return (
    <section className="block pg ipg" ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>Insert anything, anywhere</h2>
      </div>

      <div className="ipg__form">
        <label className="ipg__field">
          <span>array (up to 9)</span>
          <input value={list} onChange={(e) => setList(e.target.value)} spellCheck={false} />
        </label>
        <label className="ipg__field ipg__field--s">
          <span>element x</span>
          <input value={xText} onChange={(e) => setXText(e.target.value)} inputMode="numeric" />
        </label>
        <fieldset className="ipg__where">
          <legend>where</legend>
          {(["begin", "end", "pos"] as Where[]).map((w) => (
            <label key={w} className={where === w ? "is-on" : ""}>
              <input type="radio" name="where" checked={where === w} onChange={() => setWhere(w)} />
              {w === "begin" ? "beginning" : w === "end" ? "end" : "position"}
            </label>
          ))}
          <input
            className="ipg__pos"
            value={posText}
            onChange={(e) => setPosText(e.target.value)}
            disabled={where !== "pos"}
            inputMode="numeric"
            aria-label="position"
          />
        </fieldset>
        <button className="btn" onClick={onRun}>
          Insert
        </button>
      </div>
      <p className="pg__err" role="status">
        {msg || "Beginning = pos 0, end = pos n. Try both and count the moves."}
      </p>

      <div className="ipg__stage">
        <div className="irow">
          <span className="ipg__x" style={{ left: `calc(${pos} * (var(--icw) - 1.5px))` }}>
            {x}
          </span>
          {Array.from({ length: CAP }, (_, k) => (
            <div className="islot" key={`${runId}-${k}`}>
              <div className="ibox">
                <span className={`ival ival--old${k >= n ? " is-zero" : ""}`}>{k < n ? before[k] : 0}</span>
                <span className="ival ival--new">{k <= n ? after[k] : 0}</span>
                {k >= pos && k < n && (
                  <span className="iflyer" data-k={k}>
                    {before[k]}
                  </span>
                )}
              </div>
              <span className="iidx">[{k}]</span>
            </div>
          ))}
          <span className="ipg__used" style={{ width: `calc(${n} * (var(--icw) - 1.5px) + 1.5px)` }} />
        </div>
      </div>
    </section>
  );
}
