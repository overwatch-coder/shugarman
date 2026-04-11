import test from "node:test"
import assert from "node:assert/strict"

import { buildCategoryDocs, buildProductDocs } from "@/scripts/lib/seed/mappers"

test("buildCategoryDocs returns the canonical storefront categories in order", () => {
  assert.deepEqual(buildCategoryDocs(), [
    { slug: "smartphones", name: "Smartphones", order: 1 },
    { slug: "tablets", name: "Tablets", order: 2 },
    { slug: "laptops", name: "Laptops", order: 3 },
    { slug: "wearables", name: "Wearables", order: 4 },
  ])
})

test("buildProductDocs preserves existing createdAt and uses detail data when present", () => {
  const nowIso = "2026-04-09T12:00:00.000Z"
  const docs = buildProductDocs(nowIso, new Map([["iphone-15", "2026-04-01T10:30:00.000Z"]]))
  const iphone15 = docs.find((doc) => doc.slug === "iphone-15")

  assert.ok(iphone15)
  assert.equal(iphone15.createdAt, "2026-04-01T10:30:00.000Z")
  assert.equal(iphone15.updatedAt, nowIso)
  assert.equal(iphone15.rating, 4.5)
  assert.equal(iphone15.reviewCount, 124)
  assert.equal(iphone15.featured, false)
  assert.equal(iphone15.category, "smartphones")
  assert.equal(iphone15.colors.length, 5)
  assert.equal(iphone15.storageOptions.length, 3)
  assert.equal(iphone15.relatedSlugs.length, 4)
  assert.equal(iphone15.installment?.weeks, 12)
})

test("buildProductDocs applies deterministic fallbacks for products without detail records", () => {
  const nowIso = "2026-04-09T12:00:00.000Z"
  const docs = buildProductDocs(nowIso, new Map())
  const sony = docs.find((doc) => doc.slug === "sony-wh1000xm5")

  assert.ok(sony)
  assert.equal(sony.createdAt, nowIso)
  assert.equal(sony.updatedAt, nowIso)
  assert.equal(sony.rating, 0)
  assert.equal(sony.reviewCount, 0)
  assert.deepEqual(sony.colors, [])
  assert.deepEqual(sony.storageOptions, [])
  assert.deepEqual(sony.specs, [])
  assert.equal(sony.installment, null)
  assert.deepEqual(sony.relatedSlugs, [])
  assert.equal(sony.category, "wearables")
  assert.equal(sony.featured, true)
  assert.equal(sony.images.length, 1)
  assert.equal(sony.images[0]?.src, sony.image)
  assert.equal(sony.images[0]?.alt, sony.imageAlt)
})

test("buildProductDocs omits optional badge when the source card has no badge", () => {
  const nowIso = "2026-04-09T12:00:00.000Z"
  const docs = buildProductDocs(nowIso, new Map())
  const sony = docs.find((doc) => doc.slug === "sony-wh1000xm5")

  assert.ok(sony)
  assert.equal("badge" in sony, false)
})