"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import Stage from "./Stage";
import Playground from "./Playground";
import { PROGRAM, SHOWN, STEPS } from "./data";

const CHECKS = [
  {
    q: "SIZE = 6, rear = 5, front = 2. Where does the next enqueue put its value?",
    a: "rear = (5 + 1) % 6 = 0. Box 0, at the start of the array. It's free because front has already moved past it.",
  },
  {
    q: "Why is the full test (rear + 1) % SIZE == front, and not rear == SIZE − 1?",
    a: "rear == SIZE − 1 only means rear reached the last box. In a ring there may still be free boxes at the start. The queue is full only when the box after rear is front.",
  },
  {
    q: "What does dequeue do when front == rear?",
    a: "That box holds the only element left. After taking it, both front and rear are set to -1, so isEmpty() becomes true.",
  },
  {
    q: "In a straight (non-circular) array queue of 5, you add 5 and remove 3. How many more can you add?",
    a: "None. rear is stuck at the last index, so it reports full, even though 3 boxes at the start are free. That waste is exactly what the circular version fixes.",
  },
];

export default function CircularQueueLesson({ q }: { q: Question }) {
  return (
    <LessonShell
      q={q}
      emphasis="circular Queue"
      steps={STEPS}
      file="cqueue.cpp"
      program={PROGRAM}
      sample={[
        { prompt: true, text: "g++ cqueue.cpp -o cqueue" },
        { prompt: true, text: "./cqueue" },
        { text: "Queue is full" },
        { text: "Removed 10" },
        { text: "Removed 20" },
        { text: SHOWN.join(" ") },
      ]}
      facts={[
        { k: "Next index", v: "(i + 1) % SIZE" },
        { k: "Full", v: "(rear + 1) % SIZE == front" },
        { k: "Empty", v: "front == -1" },
        { k: "enqueue / dequeue", v: "O(1) / O(1)" },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <Stage />
    </LessonShell>
  );
}
