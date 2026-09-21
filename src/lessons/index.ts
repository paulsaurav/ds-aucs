import type { ComponentType } from "react";
import type { Question } from "@/content/questions";
import ArrayLesson from "./array-1d/ArrayLesson";
import InsertLesson from "./array-insert/InsertLesson";
import DeleteLesson from "./array-delete/DeleteLesson";
import MatrixLesson from "./array-2d/MatrixLesson";
import SparseLesson from "./sparse/SparseLesson";
import CircularQueueLesson from "./circular-queue/CircularQueueLesson";
import LinkedListLesson from "./linked-list/LinkedListLesson";
import ListInsertLesson from "./list-insert/ListInsertLesson";
import ListDeleteLesson from "./list-delete/ListDeleteLesson";

/** slug → lesson. Add one entry per question as it is built. */
export const lessons: Record<string, ComponentType<{ q: Question }>> = {
  "1d-array-display": ArrayLesson,
  "array-insert": InsertLesson,
  "array-delete": DeleteLesson,
  "array-2d-display": MatrixLesson,
  "sparse-array": SparseLesson,
  "circular-queue": CircularQueueLesson,
  "singly-linked-list": LinkedListLesson,
  "linked-list-insert": ListInsertLesson,
  "linked-list-delete": ListDeleteLesson,
};
