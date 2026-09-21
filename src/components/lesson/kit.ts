"use client";

import { useEffect, useState } from "react";
import { gsap } from "@/lib/gsap";

export type Step = {
  w: number;
  kicker: string;
  title: string;
  body: string[];
  note: string;
};

/** What a lesson's stage hands to the player: its timeline and any extra stop points inside steps. */
export type Build = (root: HTMLElement) => { tl: gsap.core.Timeline; stops?: number[] };

// Literal colours: GSAP interpolates these, it cannot interpolate var(--x).
export const C = {
  marker: "#f1cf3b",
  cell: "#f8f4ea",
  signal: "#d8432a",
  blue: "#24479a",
  ink: "#1b1915",
  pencil: "#6d665a",
};

/** Start time of every step on the master timeline. */
export function stepStarts(steps: Step[]) {
  const S: number[] = [];
  steps.reduce((acc, s) => (S.push(acc), acc + s.w), 0);
  return S;
}

export const totalWeight = (steps: Step[]) => steps.reduce((s, x) => s + x.w, 0);

/** Rebuild the timeline when the width changes; positions are measured, not guessed. */
export function useLayoutKey() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    let w = window.innerWidth;
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (window.innerWidth !== w) {
          w = window.innerWidth;
          setKey((k) => k + 1);
        }
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return key;
}

/** The master timeline. It never plays by itself; the player moves it between stops. */
export function labTimeline() {
  return gsap.timeline({ paused: true, defaults: { duration: 0.3, ease: "power2.out" } });
}

/**
 * Maps timeline time to "play time" with the idle gaps squeezed to `gap` seconds,
 * so pressing Next never waits through dead time between animations.
 */
export function timeMap(tl: gsap.core.Timeline, gap = 0.06) {
  const spans = tl
    .getChildren(false, true, true)
    .map((c) => [c.startTime(), c.startTime() + c.totalDuration()] as const)
    .sort((a, b) => a[0] - b[0]);
  const knots: [number, number][] = [[0, 0]];
  let r = 0;
  let v = 0;
  for (const [s, e] of spans) {
    if (s > r) {
      v += Math.min(s - r, gap);
      r = s;
      knots.push([r, v]);
    }
    if (e > r) {
      v += e - r;
      r = e;
      knots.push([r, v]);
    }
  }
  const lerp = (t: number, from: 0 | 1) => {
    const to = from === 0 ? 1 : 0;
    if (t <= knots[0][from]) return knots[0][to];
    for (let i = 1; i < knots.length; i++) {
      const [a, b] = [knots[i - 1], knots[i]];
      if (t <= b[from]) {
        const span = b[from] - a[from];
        return span === 0 ? b[to] : a[to] + ((t - a[from]) / span) * (b[to] - a[to]);
      }
    }
    return knots[knots.length - 1][to];
  };
  return { toPlay: (t: number) => lerp(t, 0), toReal: (p: number) => lerp(p, 1) };
}

export const centerOf = (a: Element) => {
  const r = a.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/** Vector that moves `from`'s centre onto `to`'s centre. Measure before anything is transformed. */
export const delta = (from: Element, to: Element) => {
  const a = centerOf(from);
  const b = centerOf(to);
  return { x: b.x - a.x, y: b.y - a.y };
};

/** Tween helpers bound to one timeline and one code panel. */
export function helpers(tl: gsap.core.Timeline, root: HTMLElement, program: string[]) {
  const lines = Array.from(root.querySelectorAll<HTMLElement>(".stage .code__text"));
  const rows = Array.from(root.querySelectorAll<HTMLElement>(".stage .code__line"));
  const bar = root.querySelector<HTMLElement>(".stage .code__bar")!;
  const lineY = rows.map((r) => r.offsetTop);
  const term = Array.from(root.querySelectorAll<HTMLElement>(".stage .term__line"));
  // Long programs: the code scrolls so the highlighted line stays in view.
  const scroller = root.querySelector<HTMLElement>(".stage .code__scroll");
  const view = scroller?.parentElement;
  const overflow = scroller && view ? Math.max(0, scroller.offsetHeight - view.clientHeight) : 0;
  const scrollFor = (line: number) =>
    overflow ? -Math.min(overflow, Math.max(0, lineY[line] - view!.clientHeight * 0.4)) : 0;

  gsap.set([...lines, ...term], { clipPath: "inset(0 100% 0 0)" });
  gsap.set(bar, { autoAlpha: 0, y: lineY[0] });

  return {
    bar,
    /** Type code lines in, one after another. */
    type(idx: number[], at: number, each = 0.12) {
      idx.forEach((i, n) => {
        const len = Math.max(1, program[i].length);
        tl.to(
          lines[i],
          { clipPath: "inset(0 0% 0 0)", duration: Math.max(0.08, len * 0.008), ease: `steps(${len})` },
          at + n * each,
        );
      });
    },
    typeTerm(i: number, at: number, dur = 0.18) {
      tl.to(term[i], { clipPath: "inset(0 0% 0 0)", duration: dur, ease: "steps(18)" }, at);
    },
    /** Move the highlighter to a code line. */
    hl(line: number, at: number) {
      tl.to(bar, { y: lineY[line], autoAlpha: 1, duration: 0.08, ease: "power3.out" }, at);
      if (overflow) tl.to(scroller, { y: scrollFor(line), duration: 0.2, ease: "power2.inOut" }, at);
    },
    hlOff(at: number) {
      tl.to(bar, { autoAlpha: 0, duration: 0.1 }, at);
    },
    /** Roll an odometer column (`.odo__col` with `len` entries) to entry `idx`. */
    odo(col: HTMLElement, len: number, idx: number, at: number) {
      tl.to(col, { yPercent: (-100 * idx) / len, duration: 0.08, ease: "back.out(2)" }, at);
    },
    flash(box: gsap.TweenTarget, at: number, color = C.marker) {
      tl.to(box, { backgroundColor: color, duration: 0.04 }, at).to(
        box,
        { backgroundColor: C.cell, duration: 0.14 },
        at + 0.06,
      );
    },
  };
}

export type Rect = { x: number; y: number; w: number; h: number };
export type Pt = { x: number; y: number };

/** Element rectangle relative to a container (measure before transforming anything). */
export const relRect = (container: Element, el: Element): Rect => {
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
};

export const mid = (r: Rect): Pt => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** Where the line from `from` towards the centre of `r` crosses r's border. */
export const edgePoint = (r: Rect, from: Pt): Pt => {
  const c = mid(r);
  const dx = from.x - c.x;
  const dy = from.y - c.y;
  const s = Math.min(r.w / 2 / Math.abs(dx || 1e-6), r.h / 2 / Math.abs(dy || 1e-6));
  return { x: c.x + dx * s, y: c.y + dy * s };
};

/** Straight arrow path from the border of `a` to the border of `b`. */
export const linkPath = (a: Rect, b: Rect) => {
  const s = edgePoint(a, mid(b));
  const e = edgePoint(b, s);
  return `M ${s.x} ${s.y} L ${e.x} ${e.y}`;
};
