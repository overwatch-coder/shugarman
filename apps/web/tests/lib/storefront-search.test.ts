import test from "node:test"
import assert from "node:assert/strict"

import type { ProductCard } from "@/lib/storefront-types"
import { getSearchSuggestions, matchesStorefrontQuery } from "@/lib/storefront-search"

const products: ProductCard[] = [
  {
    slug: "iphone-15-pro",
    name: "iPhone 15 Pro",
    brand: "Apple",
    price: 12000,
    currency: "GHC",
    condition: "new",
    subtitle: "Titanium flagship",
    image: "/iphone.jpg",
    imageAlt: "iPhone 15 Pro",
  },
  {
    slug: "galaxy-s24",
    name: "Galaxy S24",
    brand: "Samsung",
    price: 9800,
    currency: "GHC",
    condition: "new",
    subtitle: "AI camera phone",
    image: "/s24.jpg",
    imageAlt: "Galaxy S24",
  },
]

test("matchesStorefrontQuery matches against product fields", () => {
  assert.equal(matchesStorefrontQuery(products[0]!, "apple"), true)
  assert.equal(matchesStorefrontQuery(products[0]!, "titanium"), true)
  assert.equal(matchesStorefrontQuery(products[1]!, "iphone"), false)
})

test("getSearchSuggestions returns up to the requested number of matches", () => {
  const suggestions = getSearchSuggestions(products, "galaxy", 1)

  assert.equal(suggestions.length, 1)
  assert.equal(suggestions[0]?.slug, "galaxy-s24")
})