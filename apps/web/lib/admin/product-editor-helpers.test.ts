import test from "node:test"
import assert from "node:assert/strict"

import {
  buildRelatedProductOptions,
  getNextCreateSlugState,
  toggleRelatedSlug,
} from "./product-editor-helpers"

test("getNextCreateSlugState auto-generates a slug until the admin customizes it", () => {
  const initial = getNextCreateSlugState({
    nextName: "iPhone 16 Pro",
    currentSlug: "",
    slugWasEdited: false,
  })

  assert.equal(initial.slug, "iphone-16-pro")
  assert.equal(initial.slugWasEdited, false)

  const customized = getNextCreateSlugState({
    nextName: "iPhone 16 Pro Max",
    currentSlug: "iphone-16-vip",
    slugWasEdited: true,
  })

  assert.equal(customized.slug, "iphone-16-vip")
  assert.equal(customized.slugWasEdited, true)
})

test("buildRelatedProductOptions excludes the current product and sorts by product name", () => {
  const options = buildRelatedProductOptions(
    [
      { slug: "iphone-15", name: "iPhone 15" },
      { slug: "airpods-pro", name: "AirPods Pro" },
      { slug: "galaxy-s24", name: "Galaxy S24" },
    ],
    "iphone-15"
  )

  assert.deepEqual(options, [
    { slug: "airpods-pro", label: "AirPods Pro" },
    { slug: "galaxy-s24", label: "Galaxy S24" },
  ])
})

test("toggleRelatedSlug adds and removes unique related product slugs", () => {
  assert.deepEqual(toggleRelatedSlug([], "iphone-15"), ["iphone-15"])
  assert.deepEqual(toggleRelatedSlug(["iphone-15"], "iphone-15"), [])
  assert.deepEqual(toggleRelatedSlug(["iphone-15"], "galaxy-s24"), ["iphone-15", "galaxy-s24"])
})