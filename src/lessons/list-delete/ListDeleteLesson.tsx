"use client";

import LessonShell from "@/components/lesson/LessonShell";
import type { Question } from "@/content/questions";
import Stage from "./Stage";
import Playground from "./Playground";
import { OUT1, OUT2, PROGRAM, STEPS } from "./data";

const CHECKS = [
  {
    q: "In deleteBegin, why must head = head->next come before delete p?",
    a: "Once p (the old head) is deleted, its memory no longer belongs to you, so reading head->next from it is undefined behaviour. Save the link first, then free the node.",
  },
  {
    q: "Why does deleteEnd loop on t->next->next != NULL instead of t->next != NULL?",
    a: "It has to stop at the second-last node, because that's the node whose next must become NULL. Stopping at the last node would leave no way to reach the node before it in a singly linked list.",
  },
  {
    q: "What happens if you forget t->next = NULL after delete t->next?",
    a: "The new last node still holds the address of freed memory: a dangling pointer. The next display would read freed memory, printing garbage or crashing.",
  },
  {
    q: "What's the difference between skipping a node (t->next = p->next) and deleting it (delete p)?",
    a: "Skipping removes it from the list: no arrow reaches it. delete gives its memory back to the heap. Skip without delete leaks memory; delete without skip leaves a dangling arrow. You need both, in that order.",
  },
];

export default function ListDeleteLesson({ q }: { q: Question }) {
  return (
    <LessonShell
      q={q}
      emphasis="deletion of an element"
      steps={STEPS}
      file="delete_list.cpp"
      program={PROGRAM}
      sample={[
        { prompt: true, text: "g++ delete_list.cpp -o delete_list" },
        { prompt: true, text: "./delete_list" },
        { text: OUT1 },
        { text: OUT2 },
      ]}
      facts={[
        { k: "Begin", v: "p = head; head = head->next; delete p;" },
        { k: "End", v: "walk to 2nd-last, delete, set NULL" },
        { k: "At pos", v: "t->next = p->next; delete p;" },
        { k: "Rule", v: "relink first, then delete" },
      ]}
      checks={CHECKS}
      playground={<Playground />}
    >
      <Stage />
    </LessonShell>
  );
}
