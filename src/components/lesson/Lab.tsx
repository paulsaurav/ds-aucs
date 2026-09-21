"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { stepStarts, timeMap, useLayoutKey, type Build, type Step } from "./kit";

const FORWARD = 0.85; // play-seconds per second when going forward
const BACKWARD = 2.6; // rewinding is quicker

type Player = {
  tl: gsap.core.Timeline;
  stops: number[];
  map: ReturnType<typeof timeMap>;
  tween?: gsap.core.Tween;
};

/**
 * Frame-by-frame player for a lesson stage. Next plays the next frame's animation in full;
 * Previous plays it backwards. Frames are the step ends plus any stops the stage adds.
 */
export default function Lab({
  steps,
  build,
  className = "",
  children,
}: {
  steps: Step[];
  build: Build;
  className?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const player = useRef<Player | null>(null);
  const idxRef = useRef(0);
  const [idx, setIdx] = useState(0);
  const [stops, setStops] = useState<number[]>([0]);
  const layoutKey = useLayoutKey();

  const S = stepStarts(steps);
  const stepOf = (t: number) => (t <= 0 ? -1 : S.findLastIndex((s) => s < t - 1e-6));

  const { contextSafe } = useGSAP(
    () => {
      const { tl, stops: extra = [] } = build(root.current!);
      const ends = steps.map((s, k) => S[k] + s.w);
      const all = [...new Set([0, ...extra, ...ends].map((t) => Math.round(t * 1000) / 1000))].sort((a, b) => a - b);
      player.current = { tl, stops: all, map: timeMap(tl) };
      setStops(all);
      // After a rebuild (resize), land on the frame we were on.
      const i = Math.min(idxRef.current, all.length - 1);
      tl.time(all[i], false);
    },
    { scope: root, dependencies: [layoutKey], revertOnUpdate: true },
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      contextSafe(() => {
        const p = player.current;
        if (!p) return;
        const next = Math.max(0, Math.min(p.stops.length - 1, idxRef.current + dir));
        if (next === idxRef.current) return;
        idxRef.current = next;
        setIdx(next);
        p.tween?.kill();
        const from = p.map.toPlay(p.tl.time());
        const to = p.map.toPlay(p.stops[next]);
        const proxy = { v: from };
        p.tween = gsap.to(proxy, {
          v: to,
          duration: Math.abs(to - from) / (dir > 0 ? FORWARD : BACKWARD),
          ease: "none",
          onUpdate: () => p.tl.time(p.map.toReal(proxy.v), false),
          onComplete: () => p.tl.time(p.stops[next], false),
        });
      })();
    },
    [contextSafe],
  );

  // ← → keys while the lab fills the middle of the screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = root.current?.getBoundingClientRect();
      if (!r || r.top > innerHeight / 2 || r.bottom < innerHeight / 2) return;
      e.preventDefault();
      go(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const t = stops[idx] ?? 0;
  const step = stepOf(t);
  const inStep = step < 0 ? [] : stops.filter((s) => stepOf(s) === step);
  const frame = inStep.indexOf(t) + 1;
  const atEnd = idx === stops.length - 1;
  const s = step >= 0 ? steps[step] : null;

  // Mirror the step into the top bar and animate the caption in.
  useGSAP(
    () => {
      const label = document.querySelector<HTMLElement>("[data-step-label]");
      if (label) {
        label.dataset.fallback ??= label.textContent ?? "";
        label.textContent = s
          ? `${String(step + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")} · ${s.title}`
          : label.dataset.fallback;
      }
      gsap.from(".lab__cap > *", { autoAlpha: 0, y: 14, stagger: 0.05, duration: 0.4, ease: "power3.out" });
    },
    { scope: root, dependencies: [step] },
  );

  return (
    <section className={`lab ${className}`} ref={root}>
      <aside className="lab__panel">
        <div className="lab__cap" key={step}>
          {s ? (
            <>
              <div className="cap__kicker">
                <span className="cap__n">{String(step + 1).padStart(2, "0")}</span>
                {s.kicker}
              </div>
              <h2 className="cap__title">{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <aside className="cap__note">{s.note}</aside>
            </>
          ) : (
            <>
              <div className="cap__kicker">
                <span className="cap__n">00</span>ready
              </div>
              <h2 className="cap__title">Run it one move at a time</h2>
              <p>
                {steps.length} steps. Each Next plays one move of the program, the code and the memory together.
                Previous plays it backwards.
              </p>
              <aside className="cap__note">Keyboard: → next, ← previous.</aside>
            </>
          )}
        </div>

        <div className="lab__ctrl">
          <div className="lab__ticks" aria-hidden>
            {steps.map((_, k) => (
              <i key={k} className={k < step ? "is-done" : k === step ? "is-now" : ""} />
            ))}
          </div>
          <div className="lab__meta" aria-live="polite">
            {s ? (
              <>
                step {String(step + 1).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
                {inStep.length > 1 && (
                  <span>
                    {" "}
                    · frame {frame} of {inStep.length}
                  </span>
                )}
              </>
            ) : (
              "not started"
            )}
          </div>
          <div className="lab__btns">
            <button className="btn btn--ghost" onClick={() => go(-1)} disabled={idx === 0}>
              ← Previous
            </button>
            <button className="btn" onClick={() => go(1)} disabled={atEnd}>
              {atEnd ? "Done" : idx === 0 ? "Start →" : "Next →"}
            </button>
          </div>
        </div>
      </aside>
      <div className="stage">{children}</div>
    </section>
  );
}
