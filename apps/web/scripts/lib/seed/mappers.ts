import { productDetails, products } from "../../../lib/storefront-data"
import type { CategoryDoc, ProductDoc, ProductImage } from "../../../lib/schemas"

function validateRequiredCardFields(card: { slug: string; name: string }): void {
  if (!card.slug.trim()) {
    throw new Error("Invalid product source: missing slug")
  }

  if (!card.name.trim()) {
    throw new Error(`Invalid product source: missing name for ${card.slug}`)
  }
}

function isValidIsoTimestamp(value: string | undefined): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value))
}

const CATEGORY_SEEDS: CategoryDoc[] = [
  { slug: "smartphones", name: "Smartphones", order: 1 },
  { slug: "tablets", name: "Tablets", order: 2 },
  { slug: "laptops", name: "Laptops", order: 3 },
  { slug: "wearables", name: "Wearables", order: 4 },
]

export function buildCategoryDocs(): CategoryDoc[] {
  return CATEGORY_SEEDS.map((category) => ({ ...category }))
}

function inferCategory(card: { name: string; subtitle: string }): string {
  const haystack = `${card.name} ${card.subtitle}`.toLowerCase()

  if (haystack.includes("headphone") || haystack.includes("audio") || haystack.includes("earbud")) {
    return "wearables"
  }

  return "smartphones"
}

function buildFallbackImages(card: { image: string; imageAlt: string }): ProductImage[] {
  return [{ src: card.image, alt: card.imageAlt }]
}

function mapRelatedSlugs(detail: { relatedProducts: Array<{ slug: string }> }): string[] {
  return detail.relatedProducts.map((product) => product.slug)
}

function isFeaturedProduct(index: number): boolean {
  return index < 4
}

export function buildProductDocs(nowIso: string, existingCreatedAtBySlug: Map<string, string>): ProductDoc[] {
  return products.map((card, index) => {
    validateRequiredCardFields(card)

    const detail = productDetails[card.slug]
    const createdAt = isValidIsoTimestamp(existingCreatedAtBySlug.get(card.slug))
      ? existingCreatedAtBySlug.get(card.slug)!
      : nowIso

    return {
      slug: card.slug,
      name: card.name,
      brand: card.brand,
      price: card.price,
      currency: card.currency,
      condition: card.condition,
      subtitle: card.subtitle,
      category: inferCategory(card),
      image: card.image,
      imageAlt: card.imageAlt,
      ...(card.badge ? { badge: card.badge } : {}),
      inStock: detail?.inStock ?? true,
      featured: isFeaturedProduct(index),
      rating: detail?.rating ?? 0,
      reviewCount: detail?.reviewCount ?? 0,
      colors: detail?.colors ?? [],
      storageOptions: detail?.storageOptions ?? [],
      images: detail?.images ?? buildFallbackImages(card),
      specs: detail?.specs ?? [],
      installment: detail?.installment ?? null,
      relatedSlugs: detail ? mapRelatedSlugs(detail) : [],
      createdAt,
      updatedAt: nowIso,
    }
  })
}