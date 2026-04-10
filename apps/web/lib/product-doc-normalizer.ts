import type { ProductDoc } from "@/lib/schemas"

export function normalizeProductDoc(
  slug: string,
  data: Partial<ProductDoc> | null | undefined
): ProductDoc {
  return {
    slug,
    name: data?.name ?? "",
    brand: data?.brand ?? "",
    price: data?.price ?? 0,
    currency: data?.currency ?? "GHC",
    condition: data?.condition ?? "new",
    subtitle: data?.subtitle ?? "",
    category: data?.category ?? "smartphones",
    image: data?.image ?? "",
    imageAlt: data?.imageAlt ?? "",
    badge: data?.badge,
    inStock: data?.inStock ?? true,
    featured: data?.featured ?? false,
    rating: data?.rating ?? 0,
    reviewCount: data?.reviewCount ?? 0,
    colors: data?.colors ?? [],
    storageOptions: data?.storageOptions ?? [],
    images: data?.images ?? [],
    specs: data?.specs ?? [],
    installment: data?.installment ?? null,
    relatedSlugs: data?.relatedSlugs ?? [],
    createdAt: data?.createdAt ?? "",
    updatedAt: data?.updatedAt ?? "",
  }
}