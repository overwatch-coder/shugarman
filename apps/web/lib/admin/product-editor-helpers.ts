function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getNextCreateSlugState({
  nextName,
  currentSlug,
  slugWasEdited,
}: {
  nextName: string
  currentSlug: string
  slugWasEdited: boolean
}) {
  if (slugWasEdited) {
    return {
      slug: currentSlug,
      slugWasEdited: true,
    }
  }

  return {
    slug: slugify(nextName),
    slugWasEdited: false,
  }
}

export function buildRelatedProductOptions(
  products: Array<{ slug: string; name: string }>,
  currentSlug?: string
) {
  return products
    .filter((product) => product.slug !== currentSlug)
    .map((product) => ({
      slug: product.slug,
      label: product.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

export function toggleRelatedSlug(selectedSlugs: string[], slug: string) {
  return selectedSlugs.includes(slug)
    ? selectedSlugs.filter((item) => item !== slug)
    : [...selectedSlugs, slug]
}

export { slugify }