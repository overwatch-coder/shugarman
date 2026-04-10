import test from "node:test"
import assert from "node:assert/strict"

import {
  hasInstallmentPlan,
  isExternalImageSource,
} from "./storefront-product-helpers"

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