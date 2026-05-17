import test from "node:test"
import assert from "node:assert/strict"

import { normalizeProductDoc } from "@/lib/product-doc-normalizer"

test("normalizeProductDoc restores missing array fields for partial product docs", () => {
  const product = normalizeProductDoc("iphone-15", {
    name: "iPhone 15",
    brand: "Apple",
    price: 12000,
  })

  assert.deepEqual(product.storageOptions, [])
  assert.deepEqual(product.specs, [])
  assert.deepEqual(product.images, [])
  assert.deepEqual(product.colors, [])
  assert.deepEqual(product.relatedSlugs, [])
  assert.equal(product.installment, null)
})

test("normalizeProductDoc treats older products as published by default", () => {
  const product = normalizeProductDoc("iphone-15", {
    name: "iPhone 15",
    brand: "Apple",
    price: 12000,
  })

  assert.equal(product.published, true)
})

test("normalizeProductDoc preserves explicit draft products", () => {
  const product = normalizeProductDoc("iphone-15", {
    name: "iPhone 15",
    brand: "Apple",
    price: 12000,
    published: false,
  })

  assert.equal(product.published, false)
})

test("normalizeProductDoc preserves storage options and specs when they exist", () => {
  const product = normalizeProductDoc("iphone-15", {
    name: "iPhone 15",
    brand: "Apple",
    price: 12000,
    storageOptions: [{ label: "256GB", value: "256" }],
    specs: [{ label: "Display", value: "6.1 inch OLED" }],
  })

  assert.deepEqual(product.storageOptions, [{ label: "256GB", value: "256" }])
  assert.deepEqual(product.specs, [{ label: "Display", value: "6.1 inch OLED" }])
})
