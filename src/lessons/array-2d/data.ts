import type { Step } from "@/components/lesson/kit";

export const PROGRAM = [
  "#include <iostream>",
  "using namespace std;",
  "",
  "int main() {",
  "    int a[3][4];",
  "    int i, j;",
  "",
  '    cout << "Enter 12 elements:" << endl;',
  "    for (i = 0; i < 3; i++)",
  "        for (j = 0; j < 4; j++)",
  "            cin >> a[i][j];",
  "",
  '    cout << "The matrix:" << endl;',
  "    for (i = 0; i < 3; i++) {",
  "        for (j = 0; j < 4; j++)",
  '            cout << a[i][j] << " ";',
  "        cout << endl;",
  "    }",
  "    return 0;",
  "}",
];

/** Line numbers (0-based) the stage refers to. */
export const L = {
  include: 0,
  using: 1,
  main: 3,
  decl: 4,
  vars: 5,
  prompt: 7,
  forI: 8,
  forJ: 9,
  read: 10,
  label: 12,
  pforI: 13,
  pforJ: 14,
  pbody: 15,
  endl: 16,
  close: 17,
  ret: 18,
  end: 19,
};

export const ROWS = 3;
export const COLS = 4;
export const BASE = 1000;
export const GRID = [
  [14, 27, 9, 33],
  [8, 51, 22, 16],
  [40, 3, 29, 12],
];
export const FLAT = GRID.flat();
export const GARBAGE = ["-8472", "32764", "0", "1970", "-1", "4199", "0", "-213", "77", "0", "6553", "-9"];
/** The cell used to explain address arithmetic. */
export const PICK = { i: 1, j: 2 };

export const STEPS: Step[] = [
  {
    w: 1,
    kicker: "Why 2-D",
    title: "Some data is a table",
    body: [
      "Marks of 3 students in 4 subjects form a table: one row per student, one column per subject.",
      "A 2-D array stores exactly that shape. Every element is reached with two indexes: which row, then which column.",
    ],
    note: "a[i][j] means row i, column j. Row first, always.",
  },
  {
    w: 1.1,
    kicker: "Lines 5 – 6",
    title: "int a[3][4];",
    body: [
      "The first number is the rows, the second is the columns. 3 × 4 = 12 ints, 48 bytes.",
      "Just like a 1-D array, nothing is cleaned. Every box starts with garbage.",
    ],
    note: "Rows and columns both start at 0. The last element is a[2][3], not a[3][4].",
  },
  {
    w: 1.6,
    kicker: "Row-major",
    title: "Memory is still a line",
    body: [
      "RAM has no rows and columns. It is one long strip of bytes.",
      "So C++ lays the table out row by row: all of row 0, then all of row 1, then row 2. This is called row-major order.",
    ],
    note: "The grid is how we picture it. The strip is how it really is.",
  },
  {
    w: 1.4,
    kicker: "Indexing",
    title: "Where is a[1][2]?",
    body: [
      "To reach row 1, skip all of row 0: that's 1 × 4 = 4 elements. Then move 2 more along the row.",
      "So a[1][2] is element number 1 × 4 + 2 = 6 in the strip, at address 1000 + 6 × 4 = 1024.",
    ],
    note: "address of a[i][j] = base + (i × cols + j) × size. Only the column count matters.",
  },
  {
    w: 4.6,
    kicker: "Lines 9 – 11",
    title: "A loop inside a loop",
    body: [
      "The outer loop picks a row (i). For each row, the inner loop walks across the columns (j = 0, 1, 2, 3).",
      "So j changes fastest. The inner loop runs 4 times for every single step of the outer loop: 3 × 4 = 12 reads.",
      "Watch the strip: it fills left to right, in exactly the order it's stored.",
    ],
    note: "When j hits 4 the inner loop ends, i goes up by 1, and j starts again from 0.",
  },
  {
    w: 4.5,
    kicker: "Lines 13 – 18",
    title: "Printing it as a table",
    body: [
      "Same nested loops. The inner one prints the 4 values of row i on one line.",
      "After each row, cout << endl moves to a new line. That line break is what turns 12 numbers into a table.",
    ],
    note: "Put the braces around the outer loop body: the endl belongs to the row, not to every element.",
  },
  {
    w: 1,
    kicker: "Line 19",
    title: "Solved",
    body: [
      "Each element is read once and printed once. For r rows and c columns that's r × c steps: O(r × c).",
      "The memory used is also r × c ints.",
    ],
    note: "In the exam, write both loops with i for rows and j for columns. Mixing them up is the most common mistake.",
  },
];
