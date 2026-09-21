import type { Step } from "@/components/lesson/kit";

export const PROGRAM = [
  "#include <iostream>",
  "using namespace std;",
  "",
  "int main() {",
  "    int a[4][5] = {",
  "        {0, 0, 7, 0, 0},",
  "        {0, 0, 0, 0, 0},",
  "        {3, 0, 0, 0, 9},",
  "        {0, 5, 0, 0, 0}",
  "    };",
  "    int i, j, count = 0;",
  "",
  '    cout << "Row\\tCol\\tValue" << endl;',
  "    for (i = 0; i < 4; i++)",
  "        for (j = 0; j < 5; j++)",
  "            if (a[i][j] != 0) {",
  '                cout << i << "\\t" << j << "\\t";',
  "                cout << a[i][j] << endl;",
  "                count++;",
  "            }",
  "",
  '    cout << "Non-zero: " << count << endl;',
  "    return 0;",
  "}",
];

/** Line numbers (0-based) the stage refers to. */
export const L = {
  include: 0,
  using: 1,
  main: 3,
  decl: 4,
  row0: 5,
  declEnd: 9,
  vars: 10,
  header: 12,
  forI: 13,
  forJ: 14,
  test: 15,
  printIJ: 16,
  printV: 17,
  inc: 18,
  close: 19,
  total: 21,
  ret: 22,
  end: 23,
};

export const ROWS = 4;
export const COLS = 5;
export const GRID = [
  [0, 0, 7, 0, 0],
  [0, 0, 0, 0, 0],
  [3, 0, 0, 0, 9],
  [0, 5, 0, 0, 0],
];
export const FLAT = GRID.flat();
export const TRIPLETS = FLAT.flatMap((v, k) => (v ? [{ i: Math.floor(k / COLS), j: k % COLS, v, k }] : []));
export const NZ = TRIPLETS.length;
export const ZEROS = FLAT.length - NZ;

export const STEPS: Step[] = [
  {
    w: 1.4,
    kicker: "Lines 5 – 10",
    title: "Mostly zeros",
    body: [
      "This 4 × 5 array has 20 elements, and 16 of them are zero. Only 4 carry real information.",
      "An array where most elements are zero is called sparse. Road maps, friend networks and exam timetables all look like this.",
    ],
    note: "There's no exact cut-off, but if more than about two-thirds are zero, call it sparse.",
  },
  {
    w: 1.2,
    kicker: "Why care",
    title: "Storing nothing, expensively",
    body: [
      "In memory every zero still takes 4 bytes. This array stores 80 bytes to keep 16 bytes of real data.",
      "Scale it up: a 1000 × 1000 array with 1000 non-zeros stores 999 000 zeros, almost 4 MB of nothing.",
    ],
    note: "So we usually only care about the non-zeros, and where they are.",
  },
  {
    w: 6.2,
    kicker: "Lines 14 – 20",
    title: "Visit every cell, keep the non-zeros",
    body: [
      "The same nested loops as Question 4 visit all 20 cells, row by row.",
      "Inside, one if decides: a zero is skipped. A non-zero is printed with its row and column, and count goes up by 1.",
      "Row 1 is all zeros: the loop still has to check all 5 cells to know that.",
    ],
    note: "!= means 'not equal to'. a[i][j] != 0 is true only for the non-zeros.",
  },
  {
    w: 1,
    kicker: "Line 22",
    title: "How many?",
    body: ["After the loops, count holds the number of non-zeros found: 4.", "4 out of 20 is 20% full, 80% empty."],
    note: "count must start at 0 (line 11). An uninitialised counter starts with garbage.",
  },
  {
    w: 1.6,
    kicker: "Triplet form",
    title: "The output is a smaller array",
    body: [
      "Look at what we printed: a table of (row, col, value). Add one header row saying 4 rows, 5 columns, 4 non-zeros, and the whole matrix can be rebuilt from it.",
      "That's the triplet (or 3-tuple) representation: (count + 1) × 3 ints instead of rows × cols.",
    ],
    note: "Here 15 ints vs 20. For the 1000 × 1000 example: 3 003 ints vs 1 000 000.",
  },
  {
    w: 1,
    kicker: "Line 23",
    title: "Solved",
    body: [
      "We must look at every cell once to find the non-zeros, so the time is O(rows × cols), whatever the count.",
      "Storing the answer in triplet form takes only O(count) space.",
    ],
    note: "Exam tip: draw the triplet table with the header row (rows, cols, count) first. Examiners look for it.",
  },
];
