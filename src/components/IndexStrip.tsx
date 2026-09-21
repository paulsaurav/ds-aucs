"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, useGSAP } from "@/lib/gsap";
import { pad, type Question } from "@/content/questions";

/** The syllabus drawn as what it is: an array of lessons. */
export default function IndexStrip({ total, questions }: { total: number; questions: Question[] }) {
  const ref = useRef<HTMLElement>(null);
  const byN = new Map(questions.map((q) => [q.n, q]));

  useGSAP(
    () => {
      gsap.from(".ix__cell", {
        autoAlpha: 0,
        y: -18,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: { each: 0.025, from: "start" },
      });
      gsap.from(".ix__list li", { autoAlpha: 0, x: -20, duration: 0.6, delay: 0.5, stagger: 0.08 });
    },
    { scope: ref },
  );

  return (
    <section className="ix" ref={ref}>
      <div className="ix__caption">
        <code>
          <span className="tk-kw">lesson</span> syllabus[{total}];
        </code>
        <span>
          {questions.length} of {total} filled in. The rest still hold garbage.
        </span>
      </div>

      <div className="ix__strip">
        {Array.from({ length: total }, (_, i) => {
          const q = byN.get(i + 1);
          return q ? (
            <Link key={i} href={`/q/${q.slug}`} className="ix__cell is-ready" title={q.prompt}>
              <b>{pad(q.n)}</b>
              <small>{q.topic}</small>
              <i>[{i}]</i>
            </Link>
          ) : (
            <span key={i} className="ix__cell" aria-hidden>
              <b>{pad(i + 1)}</b>
              <small>????</small>
              <i>[{i}]</i>
            </span>
          );
        })}
      </div>

      <ol className="ix__list">
        {questions.map((q) => (
          <li key={q.slug}>
            <Link href={`/q/${q.slug}`}>
              <span className="ix__n">{pad(q.n)}</span>
              <span className="ix__prompt">{q.prompt}</span>
              <span className="ix__meta">
                {q.topic} · {q.lang}
              </span>
              <span className="ix__go">open →</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
