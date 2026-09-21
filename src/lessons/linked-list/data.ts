import type { Step } from "@/components/lesson/kit";

export const VALUES = [12, 25, 37, 48];
/** Heap addresses: wherever the allocator found room, deliberately out of order. */
export const ADDR = ["0x5A0", "0x6C8", "0x4E0", "0x7B8"];
export const OUTPUT = `${VALUES.join(" -> ")} -> NULL`;

// ------------------------------------------------------------------
// Version A: everything in main()
// ------------------------------------------------------------------
export const PROGRAM_A = [
  "#include <iostream>",
  "using namespace std;",
  "",
  "struct Node {",
  "    int data;",
  "    Node* next;",
  "};",
  "",
  "int main() {",
  "    Node* head = NULL;",
  "    Node* tail = NULL;",
  "    int n, x;",
  '    cout << "How many nodes? ";',
  "    cin >> n;",
  "    for (int i = 0; i < n; i++) {",
  "        cin >> x;",
  "        Node* p = new Node;",
  "        p->data = x;",
  "        p->next = NULL;",
  "        if (head == NULL) head = p;",
  "        else tail->next = p;",
  "        tail = p;",
  "    }",
  "    Node* t = head;",
  "    while (t != NULL) {",
  '        cout << t->data << " -> ";',
  "        t = t->next;",
  "    }",
  '    cout << "NULL" << endl;',
  "    return 0;",
  "}",
];

export const LA = {
  include: 0,
  using: 1,
  struct: 3,
  data: 4,
  next: 5,
  structEnd: 6,
  main: 8,
  head: 9,
  tail: 10,
  vars: 11,
  ask: 12,
  readN: 13,
  loop: 14,
  readX: 15,
  alloc: 16,
  setData: 17,
  setNull: 18,
  ifHead: 19,
  link: 20,
  moveTail: 21,
  loopEnd: 22,
  tInit: 23,
  while: 24,
  print: 25,
  hop: 26,
  whileEnd: 27,
  printNull: 28,
  ret: 29,
  end: 30,
};

export const STEPS_A: Step[] = [
  {
    w: 1.2,
    kicker: "Lines 4 – 7",
    title: "A node: a value and an address",
    body: [
      "A linked list is a chain of nodes. Each node is a struct with two fields: data holds the value, next holds the address of the next node.",
      "The last node's next is NULL, an address that points nowhere. That's how we know the chain has ended.",
    ],
    note: "Node* means 'the address of a Node'. That's all a pointer is.",
  },
  {
    w: 1.1,
    kicker: "Lines 10 – 14",
    title: "An empty list: head = NULL",
    body: [
      "head will hold the address of the first node and tail the last one. Both start as NULL because there are no nodes yet.",
      "Then we read n = 4, the number of nodes to create.",
    ],
    note: "Lose head and you lose the whole list. Nothing else knows where it starts.",
  },
  {
    w: 1.4,
    kicker: "Lines 15 – 23 · node 1",
    title: "new Node: memory from the heap",
    body: [
      "new asks the heap for room for one Node and gives back its address, 0x5A0, which we keep in p.",
      "We fill in data, set next to NULL, and since the list is empty, head = p. tail = p as well: it's also the last node.",
    ],
    note: "Unlike an array element, a node lands wherever the heap has room. Its address isn't predictable.",
  },
  {
    w: 3.2,
    kicker: "Lines 15 – 23 · nodes 2 – 4",
    title: "Hook each new node onto the tail",
    body: [
      "Later nodes are made the same way, but head is no longer NULL, so we take the else: tail->next = p.",
      "That writes the new node's address into the old last node, which is the arrow you see. Then tail moves to the new node.",
    ],
    note: "tail saves us from walking the whole list every time we add to the end.",
  },
  {
    w: 2.45,
    kicker: "Lines 24 – 29",
    title: "Display: follow the arrows",
    body: [
      "t starts at head. Print t->data, then t = t->next jumps to whatever address is stored in the node.",
      "When t becomes NULL there's nowhere left to go, and the loop ends.",
    ],
    note: "Don't move head itself to walk the list. Use a copy like t, or you lose the start.",
  },
  {
    w: 1,
    kicker: "Why lists",
    title: "Solved",
    body: [
      "Each new node is added in O(1) thanks to tail, so building the list is O(n). Display visits every node once: O(n).",
      "There's no index. To reach the third node you walk from head. That's the price of scattered memory.",
    ],
    note: "Array: one block, jump anywhere. List: many small blocks, easy to grow, walk to reach.",
  },
];

// ------------------------------------------------------------------
// Version B: create() and display()
// ------------------------------------------------------------------
export const PROGRAM_B = [
  "#include <iostream>",
  "using namespace std;",
  "",
  "struct Node {",
  "    int data;",
  "    Node* next;",
  "};",
  "",
  "Node* create(int n) {",
  "    Node *head = NULL, *tail = NULL;",
  "    for (int i = 0; i < n; i++) {",
  "        Node* p = new Node;",
  "        cin >> p->data;",
  "        p->next = NULL;",
  "        if (head == NULL) head = p;",
  "        else tail->next = p;",
  "        tail = p;",
  "    }",
  "    return head;",
  "}",
  "",
  "void display(Node* head) {",
  "    for (Node* t = head; t != NULL; t = t->next)",
  '        cout << t->data << " -> ";',
  '    cout << "NULL" << endl;',
  "}",
  "",
  "int main() {",
  "    int n;",
  '    cout << "How many nodes? ";',
  "    cin >> n;",
  "    Node* head = create(n);",
  "    display(head);",
  "    return 0;",
  "}",
];

export const LB = {
  include: 0,
  using: 1,
  struct: 3,
  structEnd: 6,
  create: 8,
  locals: 9,
  loop: 10,
  alloc: 11,
  read: 12,
  setNull: 13,
  ifHead: 14,
  link: 15,
  moveTail: 16,
  loopEnd: 17,
  ret: 18,
  createEnd: 19,
  display: 21,
  dloop: 22,
  dprint: 23,
  dnull: 24,
  displayEnd: 25,
  main: 27,
  n: 28,
  ask: 29,
  readN: 30,
  call: 31,
  show: 32,
  mret: 33,
  end: 34,
};

export const STEPS_B: Step[] = [
  {
    w: 1.1,
    kicker: "Lines 28 – 31",
    title: "main only asks for n",
    body: [
      "In this version main does very little. It reads n and hands the real work to two functions.",
      "The struct Node is exactly the same as before.",
    ],
    note: "Split the work by job: create builds the list, display prints it.",
  },
  {
    w: 1.2,
    kicker: "Line 32 → line 9",
    title: "A call gets its own stack frame",
    body: [
      "Calling create(n) sets up a new box on the stack for that call: its parameter n (a copy of main's n) and its locals head, tail, i and p.",
      "main's variables are still there underneath, waiting.",
    ],
    note: "A frame exists only while its function runs.",
  },
  {
    w: 3.25,
    kicker: "Lines 10 – 18",
    title: "create builds the chain",
    body: [
      "It's the same loop as the version without functions, now inside create. cin >> p->data reads straight into the new node.",
      "The nodes come from new, so they live on the heap, outside any stack frame.",
    ],
    note: "The frame holds only pointers to the nodes, not the nodes themselves.",
  },
  {
    w: 1.2,
    kicker: "Line 19 → line 32",
    title: "return head, and the frame vanishes",
    body: [
      "create returns the address of the first node, and main stores it in its own head.",
      "Then create's frame is wiped: its head, tail, i and p are gone. The nodes survive, because heap memory stays until you delete it.",
    ],
    note: "That's why create has to return head. Otherwise main could never find the list.",
  },
  {
    w: 2.5,
    kicker: "Lines 22 – 26",
    title: "display(head) gets a copy of the address",
    body: [
      "display receives a copy of main's head. A copy of the address is all it needs to reach every node.",
      "It walks with t, exactly as before, and prints 12 -> 25 -> 37 -> 48 -> NULL.",
    ],
    note: "display can move its own copy freely. main's head is never touched.",
  },
  {
    w: 1,
    kicker: "Compare",
    title: "Same list, tidier program",
    body: [
      "Without functions, one long main does everything. With functions, each job has a name and can be reused, for example calling display after every change.",
      "The price is passing the head pointer around: out of create, into display.",
    ],
    note: "Exam tip: write both versions and point out that create returns Node* and display takes Node*.",
  },
];
