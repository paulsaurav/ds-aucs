"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import Stage from "./Stage";
import Playground from "./Playground";
import { FLAT, GRID, PROGRAM, STEPS } from "./data";

const CHECKS = [
  {
    q: "int a[4][5]; — how many elements, and how many bytes?",
    a: "4 × 5 = 20 elements. Each int is 4 bytes, so 80 bytes.",
  },
  {
    q: "Base address 2000, int a[3][4]. What is the address of a[2][1]?",
    a: "Element number 2 × 4 + 1 = 9, so 2000 + 9 × 4 = 2036.",
  },
  {
    q: "In the nested input loop, which index changes fastest?",
    a: "j, the inner one. It runs through all columns before i moves to the next row, which is exactly the row-major order the values are stored in.",
  },
  {
    q: "What happens to the output if you delete cout << endl;?",
    a: "All 12 numbers print on one line. The array is unchanged; the table shape only comes from where you break the lines.",
  },
];

export default function MatrixLesson({ q }: { q: Question }) {
  return (
    <LessonShell
      q={q}
      emphasis="2-D Array"
      steps={STEPS}
      file="matrix.cpp"
      program={PROGRAM}
      sample={[
        { prompt: true, text: "g++ matrix.cpp -o matrix" },
        { prompt: true, text: "./matrix" },
        { text: "Enter 12 elements:" },
        { text: "", input: FLAT.join(" ") },
        { text: "The matrix:" },
        ...GRID.map((row) => ({ text: row.join(" ") })),
      ]}
      facts={[
        { k: "Declare", v: "a[rows][cols] · 3 × 4 = 12 ints" },
        { k: "Storage", v: "row-major, one strip" },
        { k: "Address", v: "base + (i × cols + j) × 4" },
        { k: "Time / space", v: "O(r × c) / O(r × c)" },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <Stage />
    </LessonShell>
  );
}
