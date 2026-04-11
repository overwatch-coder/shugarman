import test from "node:test"
import assert from "node:assert/strict"

import type { BentoCategory } from "@/lib/storefront-types"
import type { BentoCategoryDoc } from "@/lib/schemas"
import {
  normalizeHomeCategories,
  normalizeHomeCategoriesHeading,
} from "@/lib/home-content"

const defaultCategories: BentoCategory[] = [
  {
    title: "New Phones",
    subtitle: "The latest flagships, sealed and ready.",
    href: "/shop?condition=new",
    image: "https://example.com/default-1.jpg",
    imageAlt: "Default new phones image",
    variant: "large",
  },
  {
    title: "Refurbished",
    subtitle: "Restored devices with verified quality.",
    href: "/shop?condition=refurbished",
    image: "https://example.com/default-2.jpg",
    imageAlt: "Default refurbished image",
    variant: "medium",
  },
  {
    title: "Repairs",
    href: "/repairs",
    icon: "wrench",
    variant: "medium",
  },
]

test("normalizeHomeCategories falls back to default cards when content is missing", () => {
  const categories = normalizeHomeCategories([], defaultCategories)

  assert.deepEqual(categories, defaultCategories)
})

test("normalizeHomeCategories preserves editable text and image fields while keeping layout defaults", () => {
  const categories = normalizeHomeCategories(
    [
      {
        title: "Latest Deals",
        subtitle: "Fresh arrivals every week.",
        href: "/shop?sort=newest",
        image: "https://firebasestorage.googleapis.com/v0/b/example/o/home%2Fcard-1.jpg?alt=media",
        imageAlt: "Uploaded arrivals card image",
        variant: "accent",
        order: 0,
      },
    ] satisfies BentoCategoryDoc[],
    defaultCategories
  )

  assert.equal(categories[0]?.title, "Latest Deals")
  assert.equal(categories[0]?.subtitle, "Fresh arrivals every week.")
  assert.equal(categories[0]?.href, "/shop?sort=newest")
  assert.equal(categories[0]?.imageAlt, "Uploaded arrivals card image")
  assert.equal(categories[0]?.variant, "large")
})

test("normalizeHomeCategoriesHeading falls back to defaults when fields are blank", () => {
  const heading = normalizeHomeCategoriesHeading(
    { title: "", accent: "" },
    { title: "Explore the", accent: "Ecosystem" }
  )

  assert.deepEqual(heading, { title: "Explore the", accent: "Ecosystem" })
})

test("normalizeHomeCategoriesHeading preserves configured title and accent", () => {
  const heading = normalizeHomeCategoriesHeading(
    { title: "Browse the", accent: "Collection" },
    { title: "Explore the", accent: "Ecosystem" }
  )

  assert.deepEqual(heading, { title: "Browse the", accent: "Collection" })
})