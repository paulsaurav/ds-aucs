"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import Stage from "./Stage";
import Playground from "./Playground";
import { NZ, PROGRAM, STEPS, TRIPLETS } from "./data";

const CHECKS = [
  {
    q: "A 6 × 6 matrix has 5 non-zero elements. How many ints does the triplet form need?",
    a: "(5 + 1) × 3 = 18 ints: one header row (6, 6, 5) plus one row per non-zero. The full matrix needs 36.",
  },
  {
    q: "Why does the loop still visit every cell of row 1, which is all zeros?",
    a: "The program can't know a row is empty without looking at every element in it. Finding the non-zeros always costs rows × cols checks.",
  },
  {
    q: "What does the header row t[0] hold, and why is it needed?",
    a: "The number of rows, the number of columns and the count of non-zeros. Without it you couldn't rebuild the full matrix or know how many triplet rows follow.",
  },
  {
    q: "A 4 × 4 matrix has 10 non-zeros. Is triplet form a good idea?",
    a: "No. It needs (10 + 1) × 3 = 33 ints against 16 for the plain array. Triplets only pay off when non-zeros are rare.",
  },
];

export default function SparseLesson({ q }: { q: Question }) {
  const pad = (...xs: (string | number)[]) => xs.map((x) => String(x).padEnd(8)).join("");
  return (
    <LessonShell
      q={q}
      emphasis="non-zero elements"
      steps={STEPS}
      file="sparse.cpp"
      program={PROGRAM}
      sample={[
        { prompt: true, text: "g++ sparse.cpp -o sparse" },
        { prompt: true, text: "./sparse" },
        { text: pad("Row", "Col", "Value") },
        ...TRIPLETS.map((t) => ({ text: "", input: pad(t.i, t.j, t.v) })),
        { text: `Non-zero: ${NZ}` },
      ]}
      facts={[
        { k: "Sparse", v: "mostly zeros" },
        { k: "Scan", v: "nested loops + if (a[i][j] != 0)" },
        { k: "Triplet form", v: "(count + 1) × 3 ints" },
        { k: "Time / space", v: "O(r × c) / O(count)" },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <Stage />
    </LessonShell>
  );
}
