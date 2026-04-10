import type { ProductCard } from "@/lib/storefront-types"

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase()
}

export function matchesStorefrontQuery(product: ProductCard, query: string) {
  const normalizedQuery = normalizeSearchValue(query)
  if (!normalizedQuery) return true

  return [product.name, product.brand, product.subtitle, product.slug]
    .filter(Boolean)
    .some((value) => normalizeSearchValue(value).includes(normalizedQuery))
}

export function getSearchSuggestions(products: ProductCard[], query: string, limit = 5) {
  const normalizedQuery = normalizeSearchValue(query)
  if (!normalizedQuery) return []

  return products.filter((product) => matchesStorefrontQuery(product, normalizedQuery)).slice(0, limit)
}