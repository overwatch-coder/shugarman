import test from "node:test"
import assert from "node:assert/strict"

import { getPaginationItems } from "@/lib/pagination"

test("getPaginationItems returns every page for short ranges", () => {
  assert.deepEqual(getPaginationItems({ currentPage: 2, totalPages: 5 }), [1, 2, 3, 4, 5])
})

test("getPaginationItems returns compact ellipsis pagination for long ranges", () => {
  assert.deepEqual(getPaginationItems({ currentPage: 6, totalPages: 12 }), [
    1,
    "ellipsis-start",
    5,
    6,
    7,
    "ellipsis-end",
    12,
  ])
})
