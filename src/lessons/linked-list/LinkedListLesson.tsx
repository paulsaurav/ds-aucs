"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import StageA from "./StageA";
import StageB from "./StageB";
import Playground from "./Playground";
import { OUTPUT, PROGRAM_A, PROGRAM_B, STEPS_A, STEPS_B, VALUES } from "./data";

const CHECKS = [
  {
    q: "What is stored in the next field of a node?",
    a: "The address of the next node, not its value. The last node stores NULL, meaning 'no next node'.",
  },
  {
    q: "Why do we keep a tail pointer while creating the list?",
    a: "To add each new node in one step with tail->next = p. Without tail we'd have to walk from head to the end every time, which makes creation O(n²).",
  },
  {
    q: "In the display loop, why do we use t instead of moving head?",
    a: "head is the only way to find the list. If we moved head to NULL while printing, the nodes would still be in memory but we could never reach them again.",
  },
  {
    q: "create() ends and its local variables disappear. Why don't the nodes disappear too?",
    a: "The nodes were made with new, so they live on the heap, which isn't tied to any function call. Only the pointers in create's frame vanish, and that's why create returns head.",
  },
];

const sample = (exe: string) => [
  { prompt: true, text: `g++ ${exe}.cpp -o ${exe}` },
  { prompt: true, text: `./${exe}` },
  { text: "How many nodes? ", input: String(VALUES.length) },
  { text: "", input: VALUES.join(" ") },
  { text: OUTPUT },
];

export default function LinkedListLesson({ q }: { q: Question }) {
  return (
    <LessonShell
      q={q}
      emphasis="singly linked List"
      steps={[...STEPS_A, ...STEPS_B]}
      label="without functions"
      file="list.cpp"
      program={PROGRAM_A}
      sample={sample("list")}
      facts={[
        { k: "Node", v: "data + next (address)" },
        { k: "Start", v: "head = NULL" },
        { k: "Append", v: "tail->next = p; tail = p;" },
        { k: "Create / display", v: "O(n) / O(n)" },
      ]}
      alt={[
        {
          label: "with functions",
          file: "list2.cpp",
          program: PROGRAM_B,
          sample: sample("list2"),
          facts: [
            { k: "create(n)", v: "builds, returns Node*" },
            { k: "display(head)", v: "takes a copy of head" },
            { k: "Nodes live", v: "on the heap, after create returns" },
            { k: "Create / display", v: "O(n) / O(n)" },
          ],
        },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <StageA />
      <StageB />
    </LessonShell>
  );
}
