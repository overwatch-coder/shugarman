import test from "node:test"
import assert from "node:assert/strict"

import type { ProductCard } from "./storefront-types"
import { getWishlistedProducts } from "./wishlist-products"

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

test("getWishlistedProducts returns products matching saved wishlist slugs in saved order", () => {
  const result = getWishlistedProducts(products, ["galaxy-s24", "iphone-15-pro"])

  assert.deepEqual(result.map((product) => product.slug), ["galaxy-s24", "iphone-15-pro"])
})

test("getWishlistedProducts ignores slugs that are no longer in the storefront catalog", () => {
  const result = getWishlistedProducts(products, ["missing", "iphone-15-pro"])

  assert.deepEqual(result.map((product) => product.slug), ["iphone-15-pro"])
})