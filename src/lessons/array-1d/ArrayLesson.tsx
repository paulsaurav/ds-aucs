"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import Stage from "./Stage";
import Playground from "./Playground";
import { PROGRAM, STEPS, VALUES } from "./data";

const CHECKS = [
  {
    q: "int arr[5] = {1, 2, 3}; — what is stored in arr[4]?",
    a: "0. When you give some initial values, C fills the rest with 0. Only a declaration with no initialiser at all, like int arr[5];, leaves garbage.",
  },
  {
    q: "The base address of an int array is 2000. What is the address of arr[3]?",
    a: "2000 + 3 × 4 = 2012.",
  },
  {
    q: "What goes wrong with for (i = 0; i <= 5; i++) on int arr[5]?",
    a: "On the last round i is 5, so the loop touches arr[5]. That box is not part of the array. The behaviour is undefined: it may print junk, crash, or seem fine and break later.",
  },
];

export default function ArrayLesson({ q }: { q: Question }) {
  return (
    <LessonShell
      q={q}
      emphasis="1-D array"
      steps={STEPS}
      file="array.cpp"
      program={PROGRAM}
      sample={[
        { prompt: true, text: "g++ array.cpp -o array" },
        { prompt: true, text: "./array" },
        { text: "Enter 5 elements:" },
        { text: "", input: VALUES.join(" ") },
        { text: `Array elements: ${VALUES.join(" ")}` },
      ]}
      facts={[
        { k: "Declare", v: "line 5 · reserves 20 bytes" },
        { k: "Input loop", v: "lines 9 – 11 · runs 5 times" },
        { k: "Output loop", v: "lines 14 – 16 · runs 5 times" },
        { k: "Time / space", v: "O(n) / O(n)" },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <Stage />
    </LessonShell>
  );
}
