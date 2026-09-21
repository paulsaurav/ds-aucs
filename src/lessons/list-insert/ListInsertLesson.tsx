"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import Stage from "./Stage";
import Playground from "./Playground";
import { OUTPUT, PROGRAM, STEPS } from "./data";

const CHECKS = [
  {
    q: "Why do the insert functions take Node*& head and not just Node* head?",
    a: "insertBegin (and insertEnd on an empty list) must change main's head. With Node*& the parameter is main's head itself. With plain Node* it would be a copy, and main's list would never change.",
  },
  {
    q: "In insertBegin, what goes wrong if you write head = p; before p->next = head;?",
    a: "head already equals p, so p->next = head makes the new node point at itself. The rest of the list is lost.",
  },
  {
    q: "insertAt(head, x, 3) on the list 5 -> 8 -> 2 -> 9. Where does t stop, and what is the new list?",
    a: "t walks pos − 1 = 2 steps: 5 → 8 → 2, so t stops at 2. The new node goes after it: 5 -> 8 -> 2 -> x -> 9.",
  },
  {
    q: "Which insertion is O(1) for a linked list but O(n) for an array, and why?",
    a: "Inserting at the beginning. A list only rewires two pointers; an array must shift every element one box to the right.",
  },
];

export default function ListInsertLesson({ q }: { q: Question }) {
  return (
    <LessonShell
      q={q}
      emphasis="Insertion of elements"
      steps={STEPS}
      file="insert_list.cpp"
      program={PROGRAM}
      sample={[
        { prompt: true, text: "g++ insert_list.cpp -o insert_list" },
        { prompt: true, text: "./insert_list" },
        { text: OUTPUT },
      ]}
      facts={[
        { k: "Begin", v: "p->next = head; head = p;" },
        { k: "End", v: "walk to last, last->next = p" },
        { k: "At pos", v: "walk pos − 1, then 2 links" },
        { k: "Pass head as", v: "Node*& (it may change)" },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <Stage />
    </LessonShell>
  );
}
