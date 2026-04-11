import test from "node:test"
import assert from "node:assert/strict"

import {
  buildRelatedProductOptions,
  getNextCreateSlugState,
  selectPrimaryGalleryImage,
  toggleRelatedSlug,
} from "@/lib/admin/product-editor-helpers"

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

test("selectPrimaryGalleryImage moves the selected upload first and remaps linked colors", () => {
  const result = selectPrimaryGalleryImage({
    images: [
      { src: "/black-front.jpg", alt: "Black front" },
      { src: "/blue-front.jpg", alt: "Blue front" },
      { src: "/green-front.jpg", alt: "Green front" },
    ],
    colors: [
      { name: "Black", hex: "#111111", imageIndices: [0] },
      { name: "Blue", hex: "#3366ff", imageIndices: [1] },
      { name: "Green", hex: "#00aa66", imageIndices: [2] },
    ],
    selectedIndex: 2,
  })

  assert.deepEqual(result.images, [
    { src: "/green-front.jpg", alt: "Green front" },
    { src: "/black-front.jpg", alt: "Black front" },
    { src: "/blue-front.jpg", alt: "Blue front" },
  ])
  assert.equal(result.image, "/green-front.jpg")
  assert.equal(result.imageAlt, "Green front")
  assert.deepEqual(result.colors, [
    { name: "Black", hex: "#111111", imageIndices: [1] },
    { name: "Blue", hex: "#3366ff", imageIndices: [2] },
    { name: "Green", hex: "#00aa66", imageIndices: [0] },
  ])
})