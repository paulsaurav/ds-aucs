import type { Step } from "@/components/lesson/kit";

export const PROGRAM = [
  "#include <iostream>",
  "using namespace std;",
  "int main() {",
  "    int arr[10] = {12, 25, 37, 48, 60, 71};",
  "    int n = 6, i, pos, choice;",
  "",
  '    cout << "1.Begin 2.End 3.Position: ";',
  "    cin >> choice;",
  "",
  "    if (choice == 1) pos = 0;",
  "    else if (choice == 2) pos = n - 1;",
  "    else {",
  '        cout << "Position (0-" << n - 1 << "): ";',
  "        cin >> pos;",
  "    }",
  "",
  "    if (n == 0 || pos < 0 || pos >= n) {",
  '        cout << "Cannot delete" << endl;',
  "        return 1;",
  "    }",
  "",
  "    int x = arr[pos];",
  "    for (i = pos; i < n - 1; i++)",
  "        arr[i] = arr[i + 1];",
  "    n--;",
  "",
  '    cout << "Deleted " << x << endl;',
  '    cout << "After deletion: ";',
  "    for (i = 0; i < n; i++)",
  '        cout << arr[i] << " ";',
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
  askChoice: 6,
  readChoice: 7,
  if1: 9,
  if2: 10,
  else: 11,
  askPos: 12,
  readPos: 13,
  closeElse: 14,
  guard: 16,
  save: 21,
  shiftFor: 22,
  shiftBody: 23,
  shrink: 24,
  report: 26,
  label: 27,
  printFor: 28,
  printBody: 29,
  ret: 30,
  end: 31,
};

export const CAP = 10;
export const N = 6;
export const POS = 2;
export const CHOICE = 3;
export const BEFORE = [12, 25, 37, 48, 60, 71, 0, 0, 0, 0];
/** After the shift. Box 5 still holds 71: n-- stops counting it, nothing erases it. */
export const AFTER = [12, 25, 48, 60, 71, 71, 0, 0, 0, 0];
export const X = BEFORE[POS];
/** Right-to-left shifting, the wrong way: 71 is copied over everything before 48 and 60 can move. */
export const WRONG = [12, 25, 71, 71, 71, 71];

export const STEPS: Step[] = [
  {
    w: 1.1,
    kicker: "Lines 4 – 5",
    title: "Six in use, four spare",
    body: [
      "The same setup as insertion: int arr[10] has room for 10, and n says how many boxes hold real data. Here n = 6.",
      "Deleting will never make the array smaller in memory. It will only change n.",
    ],
    note: "The size in the brackets is fixed forever. n is the only thing that grows and shrinks.",
  },
  {
    w: 1.6,
    kicker: "Lines 7 – 15",
    title: "Beginning, end, anywhere: one number",
    body: [
      "Beginning is index 0. End is index n − 1, the last element. Anywhere is any index from 0 to n − 1.",
      "As with insertion, the choice only sets pos. In this run the user deletes position 2.",
    ],
    note: "Insert's end was n, the free box. Delete's end is n − 1, the last real element. Don't mix them up.",
  },
  {
    w: 1.3,
    kicker: "Lines 17 – 20",
    title: "Is there anything to delete?",
    body: [
      "If n == 0 the array is empty. If pos < 0 or pos >= n, the position is not a real element.",
      "pos = 6 points at a spare box. There is nothing there to delete.",
    ],
    note: "The test is pos >= n here, but pos > n for insertion. Delete needs an existing element.",
  },
  {
    w: 1,
    kicker: "Line 22",
    title: "Save it before it's gone",
    body: [
      "int x = arr[pos]; copies 37 out of the array.",
      "The shift is about to write over box 2. If we want to tell the user what was deleted, we have to keep it now.",
    ],
    note: "Order matters: save first, shift second.",
  },
  {
    w: 1.6,
    kicker: "A trap",
    title: "Shifting the wrong way",
    body: [
      "To close the gap, everything after pos moves one box left. Try it from the right end:",
      "arr[4] = arr[5] copies 71 over 60. Then 71 over 48. 48 and 60 are gone before they could move.",
    ],
    note: "Moving left? Start from the left end. The opposite of insertion.",
  },
  {
    w: 2.2,
    kicker: "Lines 23 – 24",
    title: "Close the gap from the front",
    body: [
      "Start at pos: arr[2] = arr[3] moves 48 onto 37. Then 60, then 71.",
      "Each copy lands on a box whose value has already moved or been deleted. The loop stops at n − 1 because arr[i + 1] would otherwise read past the data.",
    ],
    note: "i runs from pos up to n − 2, so the body runs n − 1 − pos times.",
  },
  {
    w: 1.2,
    kicker: "Line 25",
    title: "n--, and the leftover",
    body: [
      "n-- says one fewer box is in use. The bracket shrinks to 5.",
      "Look at box 5: 71 is still there. Nothing is erased. The program simply stops looking past n.",
    ],
    note: "Deleting = shifting + n--. The old value in the last box is harmless garbage now.",
  },
  {
    w: 2.4,
    kicker: "Lines 27 – 30",
    title: "Report and print",
    body: [
      "First we print the saved x, the 37 that left. Then the usual loop, up to the new n = 5.",
      "The stale 71 in box 5 is never printed, because the loop stops at i < n.",
    ],
    note: "If the loop ran to 6 you'd see 71 twice. That's the classic forgot-to-n-- bug.",
  },
  {
    w: 1.3,
    kicker: "Cost",
    title: "Beginning is slowest, end is instant",
    body: [
      "The shift runs n − 1 − pos times. Deleting the first element moves everything else: O(n). Deleting the last element moves nothing: O(1).",
      "Same pattern as insertion. Arrays are cheap to change at the end and expensive at the front.",
    ],
    note: "Exam answer: best case O(1) at the end, worst case O(n) at the beginning.",
  },
];
