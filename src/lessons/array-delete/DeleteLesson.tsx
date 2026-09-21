"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import Stage from "./Stage";
import Playground from "./Playground";
import { AFTER, N, PROGRAM, STEPS, X } from "./data";

const CHECKS = [
  {
    q: "n = 8. How many elements move when you delete the first one? The last one?",
    a: "First: 7. The loop runs from i = 0 to i = 6, n − 1 − pos = 8 − 1 − 0 = 7 moves. Last: 0. With pos = 7 the test 7 < 7 is false straight away; only n-- happens.",
  },
  {
    q: "Why is the guard pos >= n here, when insertion used pos > n?",
    a: "Insertion may write into box n, the first free box, so pos = n is allowed. Deletion must remove an existing element, and the last one is at n − 1, so pos = n is already out of range.",
  },
  {
    q: "After deleting, the old last value is still in memory. Is that a bug?",
    a: "No. Everything the program reads is limited by n, and n just went down by one, so that box is never looked at. The next insertion will overwrite it.",
  },
  {
    q: "What goes wrong if the loop is for (i = pos; i < n; i++)?",
    a: "On the last round i = n − 1 and the body reads arr[i + 1] = arr[n]. That box is not part of the data (and if n equals the capacity it is outside the array). Stop at n − 1.",
  },
];

export default function DeleteLesson({ q }: { q: Question }) {
  const out = AFTER.slice(0, N - 1).join(" ");
  return (
    <LessonShell
      q={q}
      emphasis="Delete an element"
      steps={STEPS}
      file="delete.cpp"
      program={PROGRAM}
      sample={[
        { prompt: true, text: "g++ delete.cpp -o delete" },
        { prompt: true, text: "./delete" },
        { text: "1.Begin 2.End 3.Position: ", input: "3" },
        { text: `Position (0-${N - 1}): `, input: "2" },
        { text: `Deleted ${X}` },
        { text: `After deletion: ${out}` },
      ]}
      facts={[
        { k: "Choose pos", v: "begin 0 · end n − 1 · else read" },
        { k: "Guard", v: "n > 0 and 0 ≤ pos < n" },
        { k: "Shift", v: "pos up to n − 2, leftwards" },
        { k: "Best / worst", v: "O(1) end / O(n) beginning" },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <Stage />
    </LessonShell>
  );
}
