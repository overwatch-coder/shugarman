import type { ProductCard } from "./storefront-types"

export function getWishlistedProducts(products: ProductCard[], slugs: string[]) {
  if (!slugs.length) return []

  const bySlug = new Map(products.map((product) => [product.slug, product]))

  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((product): product is ProductCard => Boolean(product))
}