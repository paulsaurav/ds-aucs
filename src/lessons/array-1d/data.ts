import type { Step } from "@/components/lesson/kit";

export const PROGRAM = [
  "#include <iostream>",
  "using namespace std;",
  "",
  "int main() {",
  "    int arr[5];",
  "    int i;",
  "",
  "    cout << \"Enter 5 elements:\" << endl;",
  "    for (i = 0; i < 5; i++) {",
  "        cin >> arr[i];",
  "    }",
  "",
  "    cout << \"Array elements: \";",
  "    for (i = 0; i < 5; i++) {",
  "        cout << arr[i] << \" \";",
  "    }",
  "",
  "    return 0;",
  "}",
];

/** Line numbers (0-based) the stage refers to. */
export const L = {
  include: 0,
  using: 1,
  main: 3,
  decl: 4,
  declI: 5,
  prompt: 7,
  forIn: 8,
  read: 9,
  closeIn: 10,
  label: 12,
  forOut: 13,
  print: 14,
  closeOut: 15,
  ret: 17,
  end: 18,
};

export const VALUES = [78, 91, 64, 85, 70];
export const GARBAGE = ["-8472", "32764", "0", "1970", "-1"];
export const LOOSE_ADDR = ["2048", "1532", "3196", "1180", "2764"];
export const BASE = 1000;
export const ADDR = VALUES.map((_, i) => BASE + i * 4);
export const NAMES = ["a", "b", "c", "d", "e"];

/** Where each variable lands when the compiler places them one by one (fraction of the memory zone). */
export const SCATTER = [
  { fx: 0.6, fy: 0.02, r: -6 },
  { fx: 0.04, fy: 0.5, r: 4 },
  { fx: 0.8, fy: 0.46, r: -3 },
  { fx: 0.3, fy: 0.08, r: 7 },
  { fx: 0.44, fy: 0.56, r: -5 },
];

/** Unrelated data already living in memory. */
export const STRANGERS = [
  { label: "float avg", fx: 0.08, fy: 0.08 },
  { label: "char grade", fx: 0.8, fy: 0.1 },
  { label: "int roll", fx: 0.26, fy: 0.62 },
  { label: "double fee", fx: 0.62, fy: 0.36 },
];

export const STEPS: Step[] = [
  {
    w: 1,
    kicker: "Before arrays",
    title: "Five marks, five strangers",
    body: [
      "Say you need the marks of 5 students. Without arrays you write int a, b, c, d, e; — five separate variables.",
      "The compiler drops each one wherever it finds room. Look at their addresses: no order, no pattern. Now imagine 500 students.",
    ],
    note: "500 students = 500 names and 500 cin lines. Nobody writes that.",
  },
  {
    w: 1,
    kicker: "The idea",
    title: "One name, one block",
    body: [
      "An array asks for one continuous block of memory and gives the whole block a single name.",
      "The boxes line up side by side. The addresses now go up by exactly 4, because each int takes 4 bytes.",
    ],
    note: "Contiguous = next to each other, no gaps. That one word is why arrays are fast.",
  },
  {
    w: 1.1,
    kicker: "Line 5",
    title: "int arr[5];",
    body: [
      "Read it as type · name · size. It reserves 5 × 4 = 20 bytes and calls them arr.",
      "It does not clean those bytes. Whatever an earlier program left behind is still there. That leftover is called a garbage value.",
    ],
    note: "Never print an array before you have stored something in it.",
  },
  {
    w: 1.3,
    kicker: "Indexing",
    title: "Jump straight to any box",
    body: [
      "Every box gets an index, starting at 0. With 5 boxes the last index is 5 − 1 = 4.",
      "The computer never searches for arr[3]. It calculates the address: base + index × size. Here that is 1000 + 3 × 4 = 1012.",
    ],
    note: "arr[5] does not exist. Reading it is going out of bounds.",
  },
  {
    w: 3.2,
    kicker: "Lines 9 – 11",
    title: "Filling it with one loop",
    body: [
      "One for loop, one cin, works for any size. i walks 0, 1, 2, 3, 4.",
      "In each round, cin >> arr[i] takes the next number from the input and stores it in box i. Watch each number leave the input buffer and land in its box.",
      "When i becomes 5, the test i < 5 is false and the loop stops.",
    ],
    note: "cin >> reads in, cout << writes out. The arrows point the way the data flows.",
  },
  {
    w: 3.2,
    kicker: "Lines 14 – 16",
    title: "Displaying it",
    body: [
      "Same loop shape, different job. This time we read arr[i] and send it to cout with <<.",
      "The value is copied to the screen. The array still has it; printing does not remove anything.",
    ],
    note: "The << \" \" keeps the numbers from running together: 7891648570.",
  },
  {
    w: 1,
    kicker: "Line 18",
    title: "Solved",
    body: [
      "return 0; tells the operating system that everything went fine.",
      "Two loops of n steps each, so the time grows in step with n: O(n). The array uses n × 4 bytes of memory: O(n).",
    ],
    note: "In the exam, write three clear blocks: declare, input loop, output loop.",
  },
];

export const TOTAL_W = STEPS.reduce((s, x) => s + x.w, 0);
