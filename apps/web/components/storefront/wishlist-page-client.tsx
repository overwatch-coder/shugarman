"use client"

import Link from "next/link"

import { getWishlistedProducts } from "@/lib/wishlist-products"
import type { ProductCard as ProductCardData } from "@/lib/storefront-types"
import { useWishlistStore } from "@/lib/wishlist-store"
import { MotionList, MotionPage, MotionSection } from "./motion-primitives"
import { ProductCard } from "./product-card"

export function WishlistPageClient({ products }: { products: ProductCardData[] }) {
  const { slugs, clearWishlist } = useWishlistStore()
  const wishlistedProducts = getWishlistedProducts(products, slugs)

  return (
    <MotionPage className="py-8 md:py-12">
      <MotionSection className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Saved For Later</p>
          <h1 className="mt-2 font-display text-4xl uppercase tracking-tight text-foreground sm:text-5xl">
            Wishlist
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-content-secondary">
            Devices you have bookmarked locally on this browser. Move them to cart whenever you are ready.
          </p>
        </div>

        {wishlistedProducts.length > 0 ? (
          <button
            type="button"
            onClick={clearWishlist}
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-content-secondary transition-colors hover:bg-surface-low hover:text-foreground"
          >
            Clear Wishlist
          </button>
        ) : null}
      </MotionSection>

      {wishlistedProducts.length > 0 ? (
        <MotionList className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </MotionList>
      ) : (
        <MotionSection className="mt-12 rounded-2xl bg-surface p-8 text-center sm:p-12" delay={0.04}>
          <h2 className="font-display text-3xl uppercase tracking-tight text-foreground">
            No saved devices yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-content-secondary">
            Browse the catalog and tap the heart icon on any product card or product page to add it here.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-white"
          >
            Explore Shop
          </Link>
        </MotionSection>
      )}
    </MotionPage>
  )
}