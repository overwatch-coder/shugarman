"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Heart, ShoppingCart } from "lucide-react"

import type { ProductCard as ProductCardType } from "@/lib/storefront-types"
import { isExternalImageSource } from "@/lib/storefront-product-helpers"
import { useWishlistStore } from "@/lib/wishlist-store"
import { useCart } from "./cart-provider"

function formatPrice(value: number, currency: string) {
  return `${currency} ${value.toLocaleString()}`
}

export function ProductCard({
  product,
  showCartAction = true,
  showHoverCart = false,
}: {
  product: ProductCardType
  showCartAction?: boolean
  showHoverCart?: boolean
}) {
  const badgeLabel =
    product.badge ?? (product.condition === "new" ? "New" : "Refurbished")
  const shouldReduceMotion = useReducedMotion()
  const { addProductCard } = useCart()
  const { hasItem, toggleItem } = useWishlistStore()
  const useNativeImage = isExternalImageSource(product.image)
  const wishlisted = hasItem(product.slug)

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      className="group relative overflow-hidden bg-surface-low sf-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-high">
        <span className="absolute left-3 top-3 z-10 rounded bg-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-white">
          {badgeLabel}
        </span>
        <button
          type="button"
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          onClick={() => toggleItem(product.slug)}
          className={wishlisted ? "absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-primary text-white" : "absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full bg-black/35 text-white/85 backdrop-blur-md transition-colors hover:bg-black/55"}
        >
          <Heart className="size-4" fill={wishlisted ? "currentColor" : "none"} />
        </button>
        <Link href={`/shop/${product.slug}`} className="block h-full w-full">
          {useNativeImage ? (
            <img
              src={product.image}
              alt={product.imageAlt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <Image
              src={product.image}
              alt={product.imageAlt}
              width={420}
              height={420}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </Link>
        {showHoverCart ? (
          <button
            type="button"
            onClick={() => addProductCard(product)}
            className="absolute inset-x-[5%] bottom-3 z-20 flex translate-y-[120%] items-center justify-center rounded-md bg-primary px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          >
            Add to Cart
          </button>
        ) : null}
      </div>
      <div className="space-y-2 px-4 py-3">
        <div>
          <Link href={`/shop/${product.slug}`} className="block truncate text-sm font-semibold text-foreground">
            {product.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-content-secondary">{product.subtitle}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-bold text-primary">
            {formatPrice(product.price, product.currency)}
          </span>
          {showCartAction ? (
            <button
              type="button"
              onClick={() => addProductCard(product)}
              aria-label={`Add ${product.name} to cart`}
              className="inline-flex size-8 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-primary hover:text-white"
            >
              <ShoppingCart className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}
