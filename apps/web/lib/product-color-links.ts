type ColorWithImageIndex = {
  name: string
  hex: string
  imageIndices?: number[]
}

type ProductImageLike = {
  src: string
  alt: string
}

export function setColorImageIndex<T extends ColorWithImageIndex>(
  colors: T[],
  colorName: string,
  imageIndex: number | null
) {
  return colors.map((color) => {
    if (color.name !== colorName) return color

    if (imageIndex === null || imageIndex < 0) {
      return { ...color, imageIndices: [] }
    }

    return { ...color, imageIndices: [imageIndex] }
  })
}

export function getLinkedImageForColor(
  product: {
    colors: ColorWithImageIndex[]
    images: ProductImageLike[]
  },
  colorName: string
) {
  const selectedColor = product.colors.find((color) => color.name === colorName)
  const imageIndex = selectedColor?.imageIndices?.[0]

  if (typeof imageIndex !== "number") return null

  return product.images[imageIndex] ?? null
}