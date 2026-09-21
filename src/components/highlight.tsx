import type { ReactNode } from "react";

const TOKEN =
  /(\/\/.*$)|(#\s*\w+)|(<[\w.]+>)|("(?:\\.|[^"\\])*")|\b(int|return|for|if|else|while|char|float|double|bool|void|using|namespace|const|auto|true|false)\b|\b(cout|cin|endl|std|main)\b|\b(\d+)\b|(<<|>>)/g;

/** Tiny C++ highlighter: enough for classroom programs, no dependencies. */
export function highlightCode(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push(line.slice(last, i));
    const [t, com, pre, hdr, str, kw, lib, num, op] = m;
    const cls = com
      ? "tk-com"
      : pre
        ? "tk-pre"
        : hdr
          ? "tk-hdr"
          : str
            ? "tk-str"
            : kw
              ? "tk-kw"
              : lib
                ? "tk-fn"
                : num
                  ? "tk-num"
                  : op
                    ? "tk-op"
                    : "";
    out.push(
      <span key={k++} className={cls}>
        {t}
      </span>,
    );
    last = i + t.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}
