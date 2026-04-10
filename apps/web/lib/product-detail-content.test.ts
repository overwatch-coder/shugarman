import test from "node:test"
import assert from "node:assert/strict"

import {
  getDisplayableColors,
  getDisplayableSpecs,
  getDisplayableStorageOptions,
} from "./product-detail-content"

test("getDisplayableColors removes empty color entries", () => {
  const colors = getDisplayableColors([
    { name: "Blue", hex: "#0000ff" },
    { name: "", hex: "#111111" },
    { name: "Silver", hex: "" },
  ])

  assert.deepEqual(colors, [{ name: "Blue", hex: "#0000ff" }])
})

test("getDisplayableStorageOptions removes empty storage entries", () => {
  const storageOptions = getDisplayableStorageOptions([
    { label: "128GB", value: "128" },
    { label: "", value: "256" },
  ])

  assert.deepEqual(storageOptions, [{ label: "128GB", value: "128" }])
})

test("getDisplayableSpecs removes specs with empty labels or values", () => {
  const specs = getDisplayableSpecs([
    { label: "Display", value: "6.1 inch" },
    { label: "Battery", value: "" },
    { label: "", value: "A17 Pro" },
  ])

  assert.deepEqual(specs, [{ label: "Display", value: "6.1 inch" }])
})