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

type GalleryImage = {
  src: string
  alt: string
}

type GalleryColor = {
  name: string
  hex: string
  imageIndices?: number[]
}

export function selectPrimaryGalleryImage<TImage extends GalleryImage, TColor extends GalleryColor>({
  images,
  colors,
  selectedIndex,
}: {
  images: TImage[]
  colors: TColor[]
  selectedIndex: number
}) {
  if (selectedIndex < 0 || selectedIndex >= images.length) {
    return {
      images,
      colors,
      image: images[0]?.src ?? "",
      imageAlt: images[0]?.alt ?? "",
    }
  }

  const selectedImage = images[selectedIndex]
  if (!selectedImage) {
    return {
      images,
      colors,
      image: images[0]?.src ?? "",
      imageAlt: images[0]?.alt ?? "",
    }
  }

  const nextImages = [selectedImage, ...images.filter((_, index) => index !== selectedIndex)]
  const nextIndexByPreviousIndex = new Map<number, number>([[selectedIndex, 0]])

  let nextImageIndex = 1
  for (let index = 0; index < images.length; index += 1) {
    if (index === selectedIndex) continue
    nextIndexByPreviousIndex.set(index, nextImageIndex)
    nextImageIndex += 1
  }

  const nextColors = colors.map((color) => ({
    ...color,
    imageIndices: color.imageIndices
      ?.map((index) => nextIndexByPreviousIndex.get(index))
      .filter((index): index is number => typeof index === "number"),
  }))

  return {
    images: nextImages,
    colors: nextColors,
    image: selectedImage.src,
    imageAlt: selectedImage.alt,
  }
}

export { slugify }