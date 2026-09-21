"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { C } from "@/components/lesson/kit";

const CAP = 10;
type Where = "begin" | "end" | "pos";
type Run = { before: number[]; pos: number };

function parseList(text: string): number[] | string {
  const parts = text.trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length > CAP) return `At most ${CAP} numbers: that's the array's capacity.`;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isInteger(n) || Math.abs(n) > 9999)) return "Whole numbers between -9999 and 9999 only.";
  return nums;
}

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const [list, setList] = useState("4 8 15 16 23 42");
  const [where, setWhere] = useState<Where>("pos");
  const [posText, setPosText] = useState("1");
  const [run, setRun] = useState<Run>({ before: [4, 8, 15, 16, 23, 42], pos: 1 });
  const [runId, setRunId] = useState(0);
  const [msg, setMsg] = useState("");

  const onRun = () => {
    const before = parseList(list);
    if (typeof before === "string") return setMsg(before);
    const n = before.length;
    if (n === 0) return setMsg("n == 0: the array is empty. Nothing to delete.");
    const pos = where === "begin" ? 0 : where === "end" ? n - 1 : Number(posText);
    if (!Number.isInteger(pos) || pos < 0 || pos >= n)
      return setMsg(`pos must be between 0 and n − 1 = ${n - 1}. Box ${pos} holds no element.`);
    const moves = n - 1 - pos;
    setMsg(`Deleting ${before[pos]} at pos = ${pos}. The loop will move ${moves} element${moves === 1 ? "" : "s"}.`);
    setRun({ before, pos });
    setRunId((r) => r + 1);
  };

  const { before, pos } = run;
  const n = before.length;
  const after = [...before.slice(0, pos), ...before.slice(pos + 1), before[n - 1]]; // last box keeps its stale copy

  useGSAP(
    () => {
      if (runId === 0) return;
      const slots = gsap.utils.toArray<HTMLElement>(".dpg .islot");
      const olds = gsap.utils.toArray<HTMLElement>(".dpg .ival--old");
      const news = new Map(gsap.utils.toArray<HTMLElement>(".dpg .ival--new").map((e) => [Number(e.dataset.k), e]));
      const flyers = gsap.utils.toArray<HTMLElement>(".dpg .iflyer");
      const boxes = gsap.utils.toArray<HTMLElement>(".dpg .ibox");
      const step = slots[1].offsetLeft - slots[0].offsetLeft;
      const usedW = (k: number) => (k === 0 ? 0 : slots[k - 1].offsetLeft + slots[k - 1].offsetWidth);

      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      tl.from(slots, { autoAlpha: 0, y: -12, stagger: 0.03, duration: 0.25 })
        // x = arr[pos] is a copy: the box keeps its value until the shift overwrites it
        .to(".dpg__x", { autoAlpha: 1, y: -52, duration: 0.4, ease: "back.out(2)" });
      // front to back: source pos+1 up to n-1
      for (let k = pos + 1; k < n; k++) {
        const fly = flyers.find((f) => Number(f.dataset.k) === k)!;
        tl.to(fly, { autoAlpha: 1, duration: 0.05 })
          .to(fly, { x: -step, duration: 0.3 })
          .to(olds[k - 1], { autoAlpha: 0, duration: 0.08 }, "<0.22")
          .to(news.get(k - 1)!, { autoAlpha: 1, duration: 0.05 })
          .to(fly, { autoAlpha: 0, duration: 0.05 }, "<")
          .to(boxes[k - 1], { backgroundColor: C.marker, duration: 0.08 }, "<")
          .to(boxes[k - 1], { backgroundColor: C.cell, duration: 0.25 });
      }
      tl.to(".dpg__used", { width: usedW(n - 1), duration: 0.35 }, "+=0.1")
        .to(olds[n - 1], { opacity: 0.35, duration: 0.3 }, "<")
        .to(".dpg__stale", { autoAlpha: 1, duration: 0.2 });
    },
    { scope: ref, dependencies: [runId], revertOnUpdate: true },
  );

  return (
    <section className="block pg ipg dpg" ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>Delete anything, from anywhere</h2>
      </div>

      <div className="ipg__form dpg__form">
        <label className="ipg__field">
          <span>array (up to 10)</span>
          <input value={list} onChange={(e) => setList(e.target.value)} spellCheck={false} />
        </label>
        <fieldset className="ipg__where">
          <legend>where</legend>
          {(["begin", "end", "pos"] as Where[]).map((w) => (
            <label key={w} className={where === w ? "is-on" : ""}>
              <input type="radio" name="dwhere" checked={where === w} onChange={() => setWhere(w)} />
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
          Delete
        </button>
      </div>
      <p className="pg__err" role="status">
        {msg || "Beginning = pos 0, end = pos n − 1. Try both and count the moves."}
      </p>

      <div className="ipg__stage">
        <div className="irow">
          <span className="ipg__x dpg__x" style={{ left: `calc(${pos} * (var(--icw) - 1.5px))` }}>
            x = {before[pos]}
          </span>
          {Array.from({ length: CAP }, (_, k) => (
            <div className="islot" key={`${runId}-${k}`}>
              <div className="ibox">
                <span className={`ival ival--old${k >= n ? " is-zero" : ""}`}>{k < n ? before[k] : 0}</span>
                {k >= pos && k < n - 1 && (
                  <span className="ival ival--new" data-k={k}>
                    {after[k]}
                  </span>
                )}
                {k > pos && k < n && (
                  <span className="iflyer" data-k={k}>
                    {before[k]}
                  </span>
                )}
              </div>
              <span className="iidx">[{k}]</span>
            </div>
          ))}
          <span className="ipg__used dpg__used" style={{ width: `calc(${n} * (var(--icw) - 1.5px) + 1.5px)` }} />
          <span
            className="dup dpg__stale"
            style={{ left: `calc(${n - 1} * (var(--icw) - 1.5px) + var(--icw) / 2)`, top: "90px", translate: "-50% 0" }}
          >
            stale copy
          </span>
        </div>
      </div>
    </section>
  );
}
