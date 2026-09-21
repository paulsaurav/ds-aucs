"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import Stage from "./Stage";
import Playground from "./Playground";
import { AFTER, N, PROGRAM, STEPS } from "./data";

const CHECKS = [
  {
    q: "n = 7 and you insert at the beginning. How many elements move?",
    a: "All 7. The loop runs from i = 6 down to i = 0, which is n − pos = 7 − 0 = 7 moves.",
  },
  {
    q: "Inserting at the end (pos = n): how many times does the shift loop run?",
    a: "Zero. It starts at i = n − 1, and n − 1 >= n is false straight away. The element goes directly into arr[n].",
  },
  {
    q: "Why must the shift loop go from n − 1 down to pos, not upwards?",
    a: "Going upwards copies arr[pos] into arr[pos + 1] first, which destroys the value there before it has moved. Every later box ends up holding the same value.",
  },
  {
    q: "What happens if you forget n++ after arr[pos] = x?",
    a: "The data is in memory, but the program still thinks there are n elements. The print loop stops one early and the last element is never shown, and the next insertion overwrites it.",
  },
];

export default function InsertLesson({ q }: { q: Question }) {
  const out = AFTER.slice(0, N + 1).join(" ");
  return (
    <LessonShell
      q={q}
      emphasis="insert an element"
      steps={STEPS}
      file="insert.cpp"
      program={PROGRAM}
      sample={[
        { prompt: true, text: "g++ insert.cpp -o insert" },
        { prompt: true, text: "./insert" },
        { text: "Element: ", input: "99" },
        { text: "1.Begin 2.End 3.Position: ", input: "3" },
        { text: "Position (0-5): ", input: "2" },
        { text: `After insertion: ${out}` },
      ]}
      facts={[
        { k: "Choose pos", v: "begin 0 · end n · else read" },
        { k: "Guard", v: "n < size and 0 ≤ pos ≤ n" },
        { k: "Shift", v: "n − 1 down to pos" },
        { k: "Best / worst", v: "O(1) end / O(n) beginning" },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <Stage />
    </LessonShell>
  );
}
