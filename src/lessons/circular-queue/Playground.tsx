"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const SIZE = 6;
const R = 108;
const BOX = 300;
const DEG = 360 / SIZE;

type Q = { arr: (number | null)[]; front: number; rear: number; next: number; msg: string; ver: number; last: number };

const pos = (k: number) => {
  const a = ((-90 + k * DEG) * Math.PI) / 180;
  return { left: BOX / 2 + R * Math.cos(a), top: BOX / 2 + R * Math.sin(a) };
};
const inQueue = (k: number, f: number, r: number) => f !== -1 && (f <= r ? k >= f && k <= r : k >= f || k <= r);

export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const angles = useRef({ f: 0, r: 0 });
  const [q, setQ] = useState<Q>({ arr: Array(SIZE).fill(null), front: -1, rear: -1, next: 10, msg: "", ver: 0, last: -1 });

  const enqueue = () =>
    setQ((s) => {
      if ((s.rear + 1) % SIZE === s.front)
        return { ...s, msg: `Overflow: (${s.rear} + 1) % ${SIZE} = ${(s.rear + 1) % SIZE} == front.`, ver: s.ver + 1, last: -1 };
      const front = s.front === -1 ? 0 : s.front;
      const rear = (s.rear + 1) % SIZE;
      const arr = [...s.arr];
      arr[rear] = s.next;
      const wrapped = s.rear === SIZE - 1;
      return {
        arr,
        front,
        rear,
        next: s.next + 10,
        msg: `rear = (${s.rear} + 1) % ${SIZE} = ${rear}${wrapped ? "  · wrapped round!" : ""}. Stored ${s.next}.`,
        ver: s.ver + 1,
        last: rear,
      };
    });

  const dequeue = () =>
    setQ((s) => {
      if (s.front === -1) return { ...s, msg: "Underflow: the queue is empty (front == -1).", ver: s.ver + 1, last: -1 };
      const x = s.arr[s.front];
      if (s.front === s.rear) return { ...s, front: -1, rear: -1, msg: `Removed ${x}. That was the last one: front = rear = -1.`, ver: s.ver + 1, last: -1 };
      const front = (s.front + 1) % SIZE;
      return { ...s, front, msg: `Removed ${x}. front = (${s.front} + 1) % ${SIZE} = ${front}.`, ver: s.ver + 1, last: -1 };
    });

  useGSAP(
    () => {
      // Turn each hand clockwise by however many boxes it moved.
      const moves = (angle: number, to: number) => {
        const at = ((Math.round(angle / DEG) % SIZE) + SIZE) % SIZE;
        return (((to - at) % SIZE) + SIZE) % SIZE;
      };
      if (q.front !== -1) angles.current.f += moves(angles.current.f, q.front) * DEG;
      if (q.rear !== -1) angles.current.r += moves(angles.current.r, q.rear) * DEG;
      gsap.to(".cpg__hand--f", { rotation: angles.current.f, autoAlpha: q.front === -1 ? 0 : 1, duration: 0.45, ease: "back.out(1.4)" });
      gsap.to(".cpg__hand--r", { rotation: angles.current.r, autoAlpha: q.rear === -1 ? 0 : 1, duration: 0.45, ease: "back.out(1.4)" });
      gsap.to(".cpg__hand--f .hand__tag", { rotation: -angles.current.f, duration: 0.45 });
      gsap.to(".cpg__hand--r .hand__tag", { rotation: -angles.current.r, duration: 0.45 });
      if (q.last >= 0) gsap.from(`.cpg__slot[data-k="${q.last}"] .cq__box`, { scale: 1.3, backgroundColor: "#f1cf3b", duration: 0.5, clearProps: "scale,backgroundColor" });
      if (q.msg) gsap.fromTo(".cpg__msg", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.3 });
    },
    { scope: ref, dependencies: [q.ver] },
  );

  const count = q.front === -1 ? 0 : ((q.rear - q.front + SIZE) % SIZE) + 1;

  return (
    <section className="block pg cpg" ref={ref}>
      <div className="block__head">
        <span className="mono-k">your turn</span>
        <h2>Drive the ring yourself</h2>
      </div>

      <div className="spg__bar">
        <button className="btn" onClick={enqueue}>
          enqueue({q.next})
        </button>
        <button className="btn btn--ghost" onClick={dequeue}>
          dequeue()
        </button>
        <button
          className="btn btn--ghost"
          onClick={() => {
            angles.current = { f: 0, r: 0 };
            setQ({ arr: Array(SIZE).fill(null), front: -1, rear: -1, next: 10, msg: "", ver: q.ver + 1, last: -1 });
          }}
        >
          Reset
        </button>
      </div>
      <p className="pg__err">Try: fill it, remove two, then add again and watch rear wrap from {SIZE - 1} to 0.</p>

      <div className="cpg__stage">
        <div className="cpg__ring" style={{ width: BOX, height: BOX }}>
          {q.arr.map((v, k) => (
            <div className="cpg__slot cq__slot" key={k} data-k={k} style={{ ...pos(k), translate: "-50% -50%" }}>
              <span className="cq__idx">[{k}]</span>
              <div className={`cq__box${inQueue(k, q.front, q.rear) ? "" : " is-out"}`}>{v ?? ""}</div>
            </div>
          ))}
          <div className="hand hand--front cpg__hand--f" style={{ left: BOX / 2 - 1.5, top: BOX / 2 - R * 0.34, height: R * 0.34, transformOrigin: "50% 100%", opacity: 0, visibility: "hidden" }}>
            <span className="hand__tag">front</span>
          </div>
          <div className="hand hand--rear cpg__hand--r" style={{ left: BOX / 2 - 1.5, top: BOX / 2 - R * 0.56, height: R * 0.56, transformOrigin: "50% 100%", opacity: 0, visibility: "hidden" }}>
            <span className="hand__tag">rear</span>
          </div>
          {q.front === -1 && <span className="cpg__empty">empty</span>}
        </div>

        <div className="cpg__side">
          <dl className="facts">
            <div>
              <dt>front</dt>
              <dd>{q.front}</dd>
            </div>
            <div>
              <dt>rear</dt>
              <dd>{q.rear}</dd>
            </div>
            <div>
              <dt>in queue</dt>
              <dd>
                {count} / {SIZE}
              </dd>
            </div>
          </dl>
          <p className="cpg__msg" aria-live="polite">
            {q.msg || "Nothing yet."}
          </p>
        </div>
      </div>
    </section>
  );
}
