import test from "node:test"
import assert from "node:assert/strict"

import type { StoreMetadata } from "./storefront-types"
import { mergeStoreMetadataWithDefaults } from "./store-metadata"

const defaults: StoreMetadata = {
  name: "SHUGARMAN iSTORE",
  tagline: "Every Phone. Every Price. Every Person.",
  description: "Default store description",
  heroImage: "https://firebasestorage.googleapis.com/v0/b/example/o/default-hero.png?alt=media",
  heroImageAlt: "Default storefront hero phone render",
  phone: "0558694853",
  whatsapp: "233558694853",
  email: "store@example.com",
  address: "Asempa Pharmacy Building",
  city: "Kumasi, Adum",
  region: "Ashanti Region",
  country: "Ghana",
  hours: [
    { day: "Mon", open: "8:00 AM", close: "5:00 PM", status: "open" },
    { day: "Sun", open: "-", close: "-", status: "closed" },
  ],
  social: [{ platform: "WhatsApp", handle: "0558694853", url: "https://wa.me/233558694853" }],
}

test("mergeStoreMetadataWithDefaults falls back to default hours when settings hours are empty", () => {
  const merged = mergeStoreMetadataWithDefaults(
    {
      name: "Custom Store",
      hours: [],
      social: [],
    },
    defaults
  )

  assert.equal(merged.name, "Custom Store")
  assert.deepEqual(merged.hours, defaults.hours)
  assert.deepEqual(merged.social, defaults.social)
})

test("mergeStoreMetadataWithDefaults preserves configured hours when present", () => {
  const customHours: StoreMetadata["hours"] = [
    { day: "Mon", open: "9:00 AM", close: "6:00 PM", status: "open" },
  ]

  const merged = mergeStoreMetadataWithDefaults(
    {
      hours: customHours,
      social: defaults.social,
    },
    defaults
  )

  assert.deepEqual(merged.hours, customHours)
})

test("mergeStoreMetadataWithDefaults falls back to default hero image when settings hero is empty", () => {
  const merged = mergeStoreMetadataWithDefaults(
    {
      heroImage: "",
      heroImageAlt: "",
    },
    defaults
  )

  assert.equal(merged.heroImage, defaults.heroImage)
  assert.equal(merged.heroImageAlt, defaults.heroImageAlt)
})

test("mergeStoreMetadataWithDefaults preserves configured hero image and alt text", () => {
  const merged = mergeStoreMetadataWithDefaults(
    {
      heroImage: "https://firebasestorage.googleapis.com/v0/b/example/o/hero.png?alt=media",
      heroImageAlt: "A refreshed storefront campaign device image",
    },
    defaults
  )

  assert.equal(merged.heroImage, "https://firebasestorage.googleapis.com/v0/b/example/o/hero.png?alt=media")
  assert.equal(merged.heroImageAlt, "A refreshed storefront campaign device image")
})