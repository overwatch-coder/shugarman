import test from "node:test"
import assert from "node:assert/strict"

import {
  hasInstallmentPlan,
  isExternalImageSource,
  isPublicStorefrontProduct,
} from "@/lib/storefront-product-helpers"
import { normalizeProductDoc } from "@/lib/product-doc-normalizer"

test("hasInstallmentPlan returns false when installment data is missing", () => {
  assert.equal(hasInstallmentPlan(null), false)
  assert.equal(hasInstallmentPlan(undefined), false)
})

test("hasInstallmentPlan returns true for a complete installment plan", () => {
  assert.equal(
    hasInstallmentPlan({
      downPaymentPercent: 30,
      downPayment: 1200,
      weeklyRate: 250,
      weeks: 12,
      totalPrice: 4200,
      interestNote: "0% interest",
    }),
    true
  )
})

test("isExternalImageSource detects absolute remote image urls", () => {
  assert.equal(isExternalImageSource("https://www.apple.com/example.jpg"), true)
  assert.equal(isExternalImageSource("http://cdn.example.com/example.jpg"), true)
  assert.equal(isExternalImageSource("/images/example.jpg"), false)
  assert.equal(isExternalImageSource(""), false)
})

test("isPublicStorefrontProduct includes older in-stock products without an explicit published field", () => {
  const product = normalizeProductDoc("iphone-15", {
    name: "iPhone 15",
    price: 12000,
    inStock: true,
  })

  assert.equal(isPublicStorefrontProduct(product), true)
})

test("isPublicStorefrontProduct excludes explicit drafts and out-of-stock products", () => {
  const draft = normalizeProductDoc("iphone-15", {
    name: "iPhone 15",
    price: 12000,
    inStock: true,
    published: false,
  })
  const outOfStock = normalizeProductDoc("iphone-16", {
    name: "iPhone 16",
    price: 14000,
    inStock: false,
    published: true,
  })

  assert.equal(isPublicStorefrontProduct(draft), false)
  assert.equal(isPublicStorefrontProduct(outOfStock), false)
})
