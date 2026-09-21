import type { ReactNode } from "react";
import { highlightCode } from "@/components/highlight";

/** Program listing with the moving highlighter bar. `children` renders over the code (ghost lines etc). */
export function CodePanel({ file, program, children }: { file: string; program: string[]; children?: ReactNode }) {
  return (
    <div className="panel code" aria-label="Program">
      <div className="panel__head">
        <span>{file}</span>
        <span className="panel__dim">C++ · g++</span>
      </div>
      <div className="code__body">
        <div className="code__scroll">
          <div className="code__bar" aria-hidden />
          {children}
          {program.map((ln, i) => (
            <div className="code__line" key={i}>
              <span className="code__no">{i + 1}</span>
              <span className="code__text">{ln ? highlightCode(ln) : " "}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Rolling value display. Entries stack vertically; the timeline scrolls the column. */
export function Odo({ items }: { items: ReactNode[] }) {
  return (
    <span className="reg__v odo">
      <span className="odo__col">
        {items.map((v, i) => (
          <span key={i}>{v}</span>
        ))}
      </span>
    </span>
  );
}

export function Reg({ name, className = "", items }: { name?: string; className?: string; items: ReactNode[] }) {
  return (
    <div className={`reg ${className}`}>
      {name && <span className="reg__k">{name}</span>}
      <Odo items={items} />
    </div>
  );
}

/** A loop-condition entry for an odometer: "3 >= 2 true". */
export function Cond({ text, ok }: { text: string; ok: boolean }) {
  return (
    <span className={ok ? "is-true" : "is-false"}>
      {text} <b>{ok ? "true" : "false"}</b>
    </span>
  );
}
