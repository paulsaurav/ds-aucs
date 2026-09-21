import type { Step } from "@/components/lesson/kit";

export const PROGRAM = [
  "#include <iostream>",
  "using namespace std;",
  "int main() {",
  "    int arr[10] = {12, 25, 37, 48, 60};",
  "    int n = 5, i, x, pos, choice;",
  "",
  "    cout << \"Element: \";",
  "    cin >> x;",
  "    cout << \"1.Begin 2.End 3.Position: \";",
  "    cin >> choice;",
  "",
  "    if (choice == 1) pos = 0;",
  "    else if (choice == 2) pos = n;",
  "    else {",
  "        cout << \"Position (0-\" << n << \"): \";",
  "        cin >> pos;",
  "    }",
  "",
  "    if (n == 10 || pos < 0 || pos > n) {",
  "        cout << \"Cannot insert\" << endl;",
  "        return 1;",
  "    }",
  "",
  "    for (i = n - 1; i >= pos; i--)",
  "        arr[i + 1] = arr[i];",
  "    arr[pos] = x;",
  "    n++;",
  "",
  "    cout << \"After insertion: \";",
  "    for (i = 0; i < n; i++)",
  "        cout << arr[i] << \" \";",
  "    return 0;",
  "}",
];

/** Line numbers (0-based) the stage refers to. */
export const L = {
  include: 0,
  using: 1,
  main: 2,
  decl: 3,
  vars: 4,
  askX: 6,
  readX: 7,
  askChoice: 8,
  readChoice: 9,
  if1: 11,
  if2: 12,
  else: 13,
  askPos: 14,
  readPos: 15,
  closeElse: 16,
  guard: 18,
  shiftFor: 23,
  shiftBody: 24,
  place: 25,
  grow: 26,
  label: 28,
  printFor: 29,
  printBody: 30,
  ret: 31,
  end: 32,
};

export const CAP = 10;
export const N = 5;
export const X = 99;
export const POS = 2;
export const CHOICE = 3;
export const BEFORE = [12, 25, 37, 48, 60, 0, 0, 0, 0, 0];
export const AFTER = [12, 25, 99, 37, 48, 60, 0, 0, 0, 0];
/** Left-to-right shifting, the wrong way: 48 and 60 are overwritten before they move. */
export const WRONG = [12, 25, 37, 37, 37, 37];

export const STEPS: Step[] = [
  {
    w: 1.1,
    kicker: "Lines 4 – 5",
    title: "An array can't grow",
    body: [
      "int arr[10] reserves 10 boxes, and that number is fixed when the program is compiled.",
      "So we keep spare room, and a second variable n that counts how many boxes are actually in use. Here 5 of the 10.",
    ],
    note: "The spare boxes hold 0 because a partial initialiser fills the rest of the array with zeros.",
  },
  {
    w: 2,
    kicker: "Lines 7 – 17",
    title: "Beginning, end, anywhere: one number",
    body: [
      "Beginning means index 0. End means index n, the first free box. Anywhere means any index from 0 to n.",
      "So all three choices just set pos, and after that the program is the same. In this run the user inserts 99 at position 2.",
    ],
    note: "End is pos = n, not n − 1. n − 1 is the last element; n is the free box after it.",
  },
  {
    w: 1.3,
    kicker: "Lines 19 – 22",
    title: "Check before you touch memory",
    body: [
      "If n == 10 there is no free box. If pos < 0 or pos > n, the position is outside the used part.",
      "pos = 7 would leave boxes 5 and 6 empty in the middle of the data. An array can't have holes.",
    ],
    note: "Validate first. Writing past the end of an array silently damages other variables.",
  },
  {
    w: 1.6,
    kicker: "A trap",
    title: "Shifting the wrong way",
    body: [
      "To open a gap at pos, everything from pos onwards moves one box right. Try it left to right:",
      "arr[3] = arr[2] copies 37 over 48. Then 37 over 60. 48 and 60 are gone before they could move.",
    ],
    note: "Moving right? Start from the right end.",
  },
  {
    w: 2.2,
    kicker: "Lines 24 – 25",
    title: "Shift from the back",
    body: [
      "Start with the last element: arr[5] = arr[4] moves 60 into the free box. Then 48, then 37.",
      "Each copy lands on a box whose value has already moved. For a moment 37 sits in two boxes; that's fine, the next line overwrites the old copy.",
    ],
    note: "i runs from n − 1 down to pos, so the loop body runs n − pos times.",
  },
  {
    w: 1.1,
    kicker: "Lines 26 – 27",
    title: "Drop it in, count it",
    body: [
      "arr[pos] = x writes 99 into the gap.",
      "n++ records that one more box is in use. Forget it and the print loop never shows the last element.",
    ],
    note: "Insertion is three moves, in this order: shift, write, n++.",
  },
  {
    w: 2.3,
    kicker: "Lines 29 – 31",
    title: "Print the new array",
    body: [
      "The same print loop as Question 1, now running up to the new n = 6.",
      "60 was never lost. It just lives one box further right.",
    ],
    note: "The loop limit is n, not 10. Boxes 6 to 9 are spare, not data.",
  },
  {
    w: 1.3,
    kicker: "Cost",
    title: "Beginning is slowest, end is instant",
    body: [
      "The shift loop runs n − pos times. At the beginning (pos = 0) every element moves: O(n). At the end (pos = n) nothing moves: O(1).",
      "That's why arrays are good at adding to the end and bad at adding to the front.",
    ],
    note: "Exam answer: best case O(1) at the end, worst case O(n) at the beginning.",
  },
];
