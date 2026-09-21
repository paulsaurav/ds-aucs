export type Question = {
  n: number;
  slug: string;
  prompt: string;
  topic: string;
  lang: "C++";
};

export const TOTAL_QUESTIONS = 32;

export const questions: Question[] = [
  {
    n: 1,
    slug: "1d-array-display",
    prompt: "Write a program to create a 1-D array and display the elements of the array.",
    topic: "Arrays",
    lang: "C++",
  },
  {
    n: 2,
    slug: "array-insert",
    prompt: "Write a program to insert an element at the beginning/end/anywhere in a 1-D array.",
    topic: "Arrays",
    lang: "C++",
  },
  {
    n: 3,
    slug: "array-delete",
    prompt: "Write a program to Delete an element from beginning/end/anywhere in a 1-D array.",
    topic: "Arrays",
    lang: "C++",
  },
  {
    n: 4,
    slug: "array-2d-display",
    prompt: "Write a program to create a 2-D Array and display the elements of the array.",
    topic: "Arrays",
    lang: "C++",
  },
  {
    n: 5,
    slug: "sparse-array",
    prompt: "Write a program to display the non-zero elements of the sparse array.",
    topic: "Arrays",
    lang: "C++",
  },
  {
    n: 6,
    slug: "circular-queue",
    prompt: "Write a program using functions for implementation of circular Queue.",
    topic: "Queues",
    lang: "C++",
  },
  {
    n: 7,
    slug: "singly-linked-list",
    prompt: "Write a program that uses functions and without function to perform the following operations on singly linked List (i) Creation (ii) Displays the element.",
    topic: "Linked lists",
    lang: "C++",
  },
  {
    n: 8,
    slug: "linked-list-insert",
    prompt: "Write a program that uses functions to perform the following operations on singly linked List for Insertion of elements at the beginning/end/ anywhere.",
    topic: "Linked lists",
    lang: "C++",
  },
];

export function getQuestion(slug: string) {
  return questions.find((q) => q.slug === slug);
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}
