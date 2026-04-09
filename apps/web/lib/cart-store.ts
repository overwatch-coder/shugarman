import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { CartItem, ProductCard, ProductDetail } from "./storefront-types"

export interface CartState {
  items: CartItem[]
  totalItems: number
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  addProductCard: (product: ProductCard) => void
  addProductDetail: (
    product: ProductDetail,
    options: { color?: string; storage?: string; quantity: number; image?: { src: string; alt: string } }
  ) => void
  updateQuantity: (slug: string, quantity: number) => void
  removeItem: (slug: string) => void
}

function computeTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      totalItems: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((entry) => entry.slug === item.slug)

          const nextItems = existing
            ? state.items.map((entry) =>
                entry.slug === item.slug
                  ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1), variant: item.variant }
                  : entry
              )
            : [
                ...state.items,
                {
                  slug: item.slug,
                  name: item.name,
                  variant: item.variant,
                  image: item.image,
                  imageAlt: item.imageAlt,
                  price: item.price,
                  currency: item.currency,
                  quantity: item.quantity ?? 1,
                },
              ]

          return { items: nextItems, totalItems: computeTotal(nextItems) }
        }),

      addProductCard: (product) =>
        set((state) => {
          const item: Omit<CartItem, "quantity"> & { quantity?: number } = {
            slug: product.slug,
            name: product.name,
            variant: product.subtitle,
            image: product.image,
            imageAlt: product.imageAlt,
            price: product.price,
            currency: product.currency,
            quantity: 1,
          }

          const existing = state.items.find((entry) => entry.slug === item.slug)
          const nextItems = existing
            ? state.items.map((entry) =>
                entry.slug === item.slug ? { ...entry, quantity: entry.quantity + 1 } : entry
              )
            : [...state.items, { ...item, quantity: 1 }]

          return { items: nextItems, totalItems: computeTotal(nextItems) }
        }),

      addProductDetail: (product, options) =>
        set((state) => {
          const variantParts = [options.color, options.storage].filter(Boolean)
          const item = {
            slug: product.slug,
            name: product.name,
            variant: variantParts.length > 0 ? variantParts.join(" / ") : product.name,
            image: options.image?.src ?? product.images[0]?.src ?? "",
            imageAlt: options.image?.alt ?? product.images[0]?.alt ?? product.name,
            price: product.price,
            currency: product.currency,
            quantity: options.quantity,
          }

          const existing = state.items.find((entry) => entry.slug === item.slug)
          const nextItems = existing
            ? state.items.map((entry) =>
                entry.slug === item.slug
                  ? { ...entry, quantity: entry.quantity + item.quantity, variant: item.variant }
                  : entry
              )
            : [...state.items, item]

          return { items: nextItems, totalItems: computeTotal(nextItems) }
        }),

      updateQuantity: (slug, quantity) =>
        set((state) => {
          const nextItems = state.items.map((item) =>
            item.slug === slug ? { ...item, quantity: Math.max(1, quantity) } : item
          )
          return { items: nextItems, totalItems: computeTotal(nextItems) }
        }),

      removeItem: (slug) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.slug !== slug)
          return { items: nextItems, totalItems: computeTotal(nextItems) }
        }),
    }),
    {
      name: "shugarman-cart",
    }
  )
)
