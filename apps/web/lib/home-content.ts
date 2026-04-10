import type { BentoCategoryDoc, HomeCategoriesHeadingDoc } from "@/lib/schemas"
import type { BentoCategory } from "@/lib/storefront-types"

export interface HomeCategoriesHeading {
  title: string
  accent: string
}

function pickString(value: string | undefined, fallback: string | undefined) {
  return value?.trim() ? value : (fallback ?? "")
}

export function normalizeHomeCategories(
  categories: BentoCategoryDoc[] | undefined,
  defaults: BentoCategory[]
): BentoCategory[] {
  if (!categories?.length) return defaults

  return defaults.map((defaultCategory, index) => {
    const configured = categories.find((category) => category.order === index)
    if (!configured) return defaultCategory

    return {
      ...defaultCategory,
      title: pickString(configured.title, defaultCategory.title),
      subtitle: pickString(configured.subtitle, defaultCategory.subtitle),
      href: pickString(configured.href, defaultCategory.href),
      image: pickString(configured.image, defaultCategory.image),
      imageAlt: pickString(configured.imageAlt, defaultCategory.imageAlt),
      icon: pickString(configured.icon, defaultCategory.icon),
      variant: defaultCategory.variant,
    }
  })
}

export function normalizeHomeCategoriesHeading(
  heading: HomeCategoriesHeadingDoc | undefined,
  defaults: HomeCategoriesHeading
): HomeCategoriesHeading {
  return {
    title: pickString(heading?.title, defaults.title),
    accent: pickString(heading?.accent, defaults.accent),
  }
}