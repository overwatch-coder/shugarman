"use client"

import * as React from "react"

import { cartItems as initialCartItems } from "@/lib/storefront-data"
import type { CartItem, ProductCard, ProductDetail } from "@/lib/storefront-types"

interface AddCartItemInput {
  slug: string
  name: string
  variant: string
  image: string
  imageAlt: string
  price: number
  currency: string
  quantity?: number
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  addItem: (item: AddCartItemInput) => void
  addProductCard: (product: ProductCard) => void
  addProductDetail: (product: ProductDetail, options: { color?: string; storage?: string; quantity: number; image?: { src: string; alt: string } }) => void
  updateQuantity: (slug: string, quantity: number) => void
  removeItem: (slug: string) => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>(initialCartItems)

  const addItem = React.useCallback((item: AddCartItemInput) => {
    setItems((current) => {
      const existingItem = current.find((entry) => entry.slug === item.slug)

      if (existingItem) {
        return current.map((entry) =>
          entry.slug === item.slug
            ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1), variant: item.variant }
            : entry
        )
      }

      return [
        ...current,
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
    })
  }, [])

  const addProductCard = React.useCallback(
    (product: ProductCard) => {
      addItem({
        slug: product.slug,
        name: product.name,
        variant: product.subtitle,
        image: product.image,
        imageAlt: product.imageAlt,
        price: product.price,
        currency: product.currency,
        quantity: 1,
      })
    },
    [addItem]
  )

  const addProductDetail = React.useCallback(
    (
      product: ProductDetail,
      options: { color?: string; storage?: string; quantity: number; image?: { src: string; alt: string } }
    ) => {
      const variantParts = [options.color, options.storage].filter(Boolean)

      addItem({
        slug: product.slug,
        name: product.name,
        variant: variantParts.length > 0 ? variantParts.join(" / ") : product.name,
        image: options.image?.src ?? product.images[0]?.src ?? "",
        imageAlt: options.image?.alt ?? product.images[0]?.alt ?? product.name,
        price: product.price,
        currency: product.currency,
        quantity: options.quantity,
      })
    },
    [addItem]
  )

  const updateQuantity = React.useCallback((slug: string, quantity: number) => {
    setItems((current) =>
      current.map((item) => (item.slug === slug ? { ...item, quantity: Math.max(1, quantity) } : item))
    )
  }, [])

  const removeItem = React.useCallback((slug: string) => {
    setItems((current) => current.filter((item) => item.slug !== slug))
  }, [])

  const totalItems = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const value = React.useMemo(
    () => ({ items, totalItems, addItem, addProductCard, addProductDetail, updateQuantity, removeItem }),
    [items, totalItems, addItem, addProductCard, addProductDetail, updateQuantity, removeItem]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = React.useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }

  return context
}