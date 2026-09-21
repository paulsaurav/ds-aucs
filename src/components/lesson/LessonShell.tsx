"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { highlightCode } from "@/components/highlight";
import TopBar from "@/components/TopBar";
import { pad, questions, TOTAL_QUESTIONS, type Question } from "@/content/questions";
import type { Step } from "./kit";

export type TermLine = { text: string; prompt?: boolean; input?: string };
export type Fact = { k: string; v: string };
export type Check = { q: string; a: string };
export type Listing = { label: string; file: string; program: string[]; sample: TermLine[]; facts?: Fact[] };

type Props = {
  q: Question;
  /** Part of the prompt to highlight in the hero. */
  emphasis: string;
  steps: Step[];
  file: string;
  program: string[];
  sample: TermLine[];
  facts: Fact[];
  checks: Check[];
  /** Other versions of the answer, shown as tabs next to the main one. */
  alt?: Listing[];
  /** Tab label for the main version when alt is given. */
  label?: string;
  /** The lab (stage + player). */
  children: ReactNode;
  playground?: ReactNode;
};

export default function LessonShell(p: Props) {
  return (
    <>
      <TopBar label={`Q${pad(p.q.n)} · ${p.q.topic}`} />
      <main className="lesson">
        <Hero q={p.q} emphasis={p.emphasis} steps={p.steps} />
        {p.children}
        <FullProgram
          listings={[{ label: p.label ?? "", file: p.file, program: p.program, sample: p.sample, facts: p.facts }, ...(p.alt ?? [])]}
        />
        {p.playground}
        <SelfCheck checks={p.checks} />
        <Footer q={p.q} />
      </main>
    </>
  );
}

function Hero({ q, emphasis, steps }: { q: Question; emphasis: string; steps: Step[] }) {
  const ref = useRef<HTMLElement>(null);
  // Let long "a/b/c" runs wrap after each slash.
  const soft = (t: string) => t.replaceAll("/", "/​");
  const at = q.prompt.indexOf(emphasis);
  const [before, after] = at < 0 ? [q.prompt, ""] : [q.prompt.slice(0, at), q.prompt.slice(at + emphasis.length)];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".hero__q", { type: "lines", mask: "lines" });
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .from(".hero__num span", { yPercent: 105, duration: 1.2, stagger: 0.09 })
          .from(".hero__meta > *", { autoAlpha: 0, y: 10, stagger: 0.06, duration: 0.6 }, 0.2)
          .from(split.lines, { yPercent: 105, duration: 1, stagger: 0.09 }, 0.35)
          .to(".hero__q em", { backgroundSize: "100% 42%", duration: 0.7, ease: "power2.inOut" }, "-=0.3")
          .from(".hero__plan li", { autoAlpha: 0, x: -14, stagger: 0.05, duration: 0.5 }, "-=0.5")
          .from(".hero__arrow path", { drawSVG: 0, duration: 0.9, stagger: 0.2, ease: "power2.inOut" }, "-=0.6");

        gsap.to(".hero__num", {
          yPercent: -18,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".hero__q em", { backgroundSize: "100% 42%" });
      });
    },
    { scope: ref },
  );

  return (
    <header className="hero" ref={ref}>
      <div className="hero__meta">
        <span>DS Lab</span>
        <span>{q.topic}</span>
        <span>
          Question {pad(q.n)} of {TOTAL_QUESTIONS}
        </span>
        <span>Language: {q.lang}</span>
      </div>

      <div className="hero__grid">
        <div className="hero__num" aria-hidden>
          <span>{pad(q.n)[0]}</span>
          <span>{pad(q.n)[1]}</span>
        </div>
        <div>
          <h1 className="hero__q">
            {soft(before)}
            {at >= 0 && <em>{emphasis}</em>}
            {soft(after)}
          </h1>
          <ol className="hero__plan">
            {steps.map((s, i) => (
              <li key={i}>
                <span>{pad(i + 1)}</span>
                {s.title}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="hero__scroll">
        <svg className="hero__arrow" viewBox="0 0 60 120" aria-hidden>
          <path d="M30 4 C 22 30, 40 52, 28 78 S 30 104, 30 112" />
          <path d="M18 98 L30 114 L43 99" />
        </svg>
        <span>Scroll down to the lab, then press Next to run the solution one move at a time. Previous rewinds it.</span>
      </div>
    </header>
  );
}

function FullProgram({ listings }: { listings: Listing[] }) {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState(0);
  const { file, program, sample } = listings[tab];
  const facts = listings[tab].facts ?? listings[0].facts ?? [];

  useGSAP(
    () => {
      gsap.from(".listing .code__line", {
        autoAlpha: 0,
        x: -16,
        stagger: 0.03,
        duration: 0.5,
        ease: "power3.out",
        scrollTrigger: { trigger: ".listing", start: "top 75%" },
      });
      gsap.from(".sample .term__line", {
        autoAlpha: 0,
        y: 8,
        stagger: 0.15,
        duration: 0.4,
        scrollTrigger: { trigger: ".sample", start: "top 80%" },
      });
    },
    { scope: ref, dependencies: [tab], revertOnUpdate: true },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(program.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable: nothing to do */
    }
  };

  return (
    <section className="block program" ref={ref}>
      <div className="block__head">
        <span className="mono-k">answer</span>
        <h2>The complete program</h2>
      </div>
      {listings.length > 1 && (
        <div className="listing__tabs" role="tablist">
          {listings.map((l, i) => (
            <button key={l.label} role="tab" aria-selected={i === tab} className={i === tab ? "is-on" : ""} onClick={() => setTab(i)}>
              {l.label}
            </button>
          ))}
        </div>
      )}
      <div className="program__grid">
        <div className="panel code listing">
          <div className="panel__head">
            <span>{file}</span>
            <button className="btn-text" onClick={copy}>
              {copied ? "copied" : "copy"}
            </button>
          </div>
          <div className="code__body">
            {program.map((ln, i) => (
              <div className="code__line" key={i}>
                <span className="code__no">{i + 1}</span>
                <span className="code__text">{ln ? highlightCode(ln) : " "}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="program__side">
          <div className="term sample">
            {sample.map((l, i) => (
              <div className="term__line" key={i}>
                {l.prompt && <span className="term__ps">$ </span>}
                {l.text}
                {l.input && <span className="term__in">{l.input}</span>}
              </div>
            ))}
          </div>
          <dl className="facts">
            {facts.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function SelfCheck({ checks }: { checks: Check[] }) {
  return (
    <section className="block checks">
      <div className="block__head">
        <span className="mono-k">check yourself</span>
        <h2>Before you move on</h2>
      </div>
      <ol className="checks__list">
        {checks.map((c, i) => (
          <li key={i}>
            <details>
              <summary>
                <span className="checks__n">{pad(i + 1)}</span>
                <span className="checks__q">{c.q}</span>
                <span className="checks__hint">show</span>
              </summary>
              <p>{c.a}</p>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Footer({ q }: { q: Question }) {
  const next = questions.find((x) => x.n === q.n + 1);
  const prev = questions.find((x) => x.n === q.n - 1);
  return (
    <footer className="next">
      <div className="next__side">
        <Link href="/" className="next__back">
          ← all {TOTAL_QUESTIONS} questions
        </Link>
        {prev && (
          <Link href={`/q/${prev.slug}`} className="next__back">
            ← Q{pad(prev.n)}
          </Link>
        )}
      </div>
      {next ? (
        <Link href={`/q/${next.slug}`} className="next__up next__up--live">
          <span className="mono-k">next · Q{pad(next.n)}</span>
          <span className="next__q">{next.prompt}</span>
        </Link>
      ) : (
        <div className="next__up">
          <span className="mono-k">next</span>
          <span className="next__q">Q{pad(q.n + 1)} is being prepared</span>
        </div>
      )}
    </footer>
  );
}
