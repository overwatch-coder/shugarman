"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ShoppingCart } from "lucide-react"

import type { ProductCard as ProductCardType } from "@/lib/storefront-types"
import { useCart } from "./cart-provider"

function formatPrice(value: number, currency: string) {
  return `${currency} ${value.toLocaleString()}`
}

export function ProductCard({
  product,
  showCartAction = true,
}: {
  product: ProductCardType
  showCartAction?: boolean
}) {
  const badgeLabel =
    product.badge ?? (product.condition === "new" ? "New" : "Refurbished")
  const shouldReduceMotion = useReducedMotion()
  const { addProductCard } = useCart()

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={shouldReduceMotion ? undefined : { y: -4 }}
      className="group overflow-hidden rounded-xl bg-surface-low sf-card-hover"
    >
      <div className="relative aspect-square overflow-hidden p-4">
        <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-tight text-white">
          {badgeLabel}
        </span>
        <Link href={`/shop/${product.slug}`} className="flex h-full items-center justify-center">
          <Image
            src={product.image}
            alt={product.imageAlt}
            width={420}
            height={420}
            className="h-auto w-4/5 transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
      </div>
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <Link href={`/shop/${product.slug}`} className="text-lg font-semibold text-foreground">
              {product.name}
            </Link>
            <p className="mt-1 text-xs text-content-secondary">{product.subtitle}</p>
          </div>
          <span className="font-mono text-lg font-bold text-primary">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
        {showCartAction ? (
          <button
            type="button"
            onClick={() => addProductCard(product)}
            className="inline-flex size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-primary hover:text-white"
          >
            <ShoppingCart className="size-4" />
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}
