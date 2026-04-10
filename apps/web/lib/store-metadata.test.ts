import test from "node:test"
import assert from "node:assert/strict"

import type { StoreMetadata } from "./storefront-types"
import { mergeStoreMetadataWithDefaults } from "./store-metadata"

const defaults: StoreMetadata = {
  name: "SHUGARMAN iSTORE",
  tagline: "Every Phone. Every Price. Every Person.",
  description: "Default store description",
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