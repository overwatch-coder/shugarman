import type { ProductColor, ProductStorage, TechSpec } from "@/lib/storefront-types"

export function getDisplayableColors(colors: ProductColor[]) {
  return colors.filter((color) => color.name.trim() && color.hex.trim())
}

export function getDisplayableStorageOptions(storageOptions: ProductStorage[]) {
  return storageOptions.filter((storage) => storage.label.trim() && storage.value.trim())
}

export function getDisplayableSpecs(specs: TechSpec[]) {
  return specs.filter((spec) => spec.label.trim() && spec.value.trim())
}