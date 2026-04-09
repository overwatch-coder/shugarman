"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Expand, Heart, MessageCircle, ShoppingBag, Star } from "lucide-react"
import { useState } from "react"

import type { ProductDetail } from "@/lib/storefront-types"
import { MotionList, MotionPage, MotionSection } from "./motion-primitives"
import { useCart } from "./cart-provider"
import { QuantityStepper } from "./quantity-stepper"
import { ProductCard } from "./product-card"

function formatPrice(value: number, currency: string) {
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ProductDetailPageClient({ product }: { product: ProductDetail }) {
  const [activeImage, setActiveImage] = useState(product.images[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "")
  const [selectedStorage, setSelectedStorage] = useState(product.storageOptions[0]?.value ?? "")
  const [quantity, setQuantity] = useState(1)
  const currentImage = activeImage ?? product.images[0]
  const shouldReduceMotion = useReducedMotion()
  const { addProductDetail } = useCart()

  if (!currentImage) {
    return null
  }

  return (
    <MotionPage className="py-12">
      <nav className="mb-8 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-content-secondary">
        <Link href="/shop" className="hover:text-primary">
          Shop
        </Link>
        <span>/</span>
        <span>{product.brand}</span>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <div className="flex flex-col gap-6 md:flex-row-reverse">
            <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-xl bg-surface-low">
              <button
                type="button"
                aria-label="Expand image"
                className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <Expand className="size-4" />
              </button>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentImage.src}
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.985 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.01 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full"
                >
                  <Image
                    src={currentImage.src}
                    alt={currentImage.alt}
                    width={900}
                    height={1100}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-4 overflow-x-auto md:flex-col">
              {product.images.map((image) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  className={image.src === currentImage.src ? "w-20 shrink-0 overflow-hidden rounded-lg border-2 border-primary md:w-24" : "w-20 shrink-0 overflow-hidden rounded-lg border-2 border-transparent bg-surface-high md:w-24"}
                >
                  <Image src={image.src} alt={image.alt} width={160} height={160} className="aspect-square h-auto w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 lg:col-span-5">
          <div>
            <p
              className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-primary"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {product.brand}
            </p>
            <h1 className="font-display text-6xl leading-none tracking-tight text-foreground md:text-7xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4" fill={index < 4 ? "currentColor" : "none"} />
                ))}
              </div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-content-secondary">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="font-mono text-4xl font-bold text-primary">
              {formatPrice(product.price, product.currency)}
            </div>
            <div className="rounded-xl bg-surface-low p-6">
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-foreground">
                Flexible Payment Plan
              </p>
              <p className="text-sm leading-7 text-content-secondary">
                Pay <span className="font-semibold text-foreground">{formatPrice(product.installment.downPayment, product.currency)}</span> now, then spread the balance over <span className="font-semibold text-foreground">{product.installment.weeks} weeks</span>. {product.installment.interestNote}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p
                className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-content-secondary"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Select Color
              </p>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    aria-label={color.name}
                    className={selectedColor === color.name ? "rounded-full border-2 border-primary p-0.5" : "rounded-full border-2 border-transparent p-0.5"}
                  >
                    <span className="block size-9 rounded-full border border-black/10" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p
                className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-content-secondary"
                style={{ fontFamily: "var(--font-label)" }}
              >
                Select Storage
              </p>
              <div className="flex flex-wrap gap-3">
                {product.storageOptions.map((storage) => (
                  <button
                    key={storage.value}
                    type="button"
                    onClick={() => setSelectedStorage(storage.value)}
                    className={selectedStorage === storage.value ? "rounded-md bg-primary px-6 py-3 text-xs font-bold text-white" : "rounded-md bg-surface-high px-6 py-3 text-xs font-bold text-content-secondary"}
                  >
                    {storage.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <QuantityStepper value={quantity} onChange={setQuantity} />
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                <span className="size-2 rounded-full bg-emerald-500" />
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() =>
                addProductDetail(product, {
                  color: selectedColor,
                  storage:
                    product.storageOptions.find((storage) => storage.value === selectedStorage)?.label ?? selectedStorage,
                  quantity,
                  image: currentImage,
                })
              }
              className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-primary px-6 py-5 text-sm font-black uppercase tracking-[0.2em] text-white sf-red-glow-box"
            >
              <ShoppingBag className="size-4" />
              Add to Cart
            </button>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-md bg-surface-high px-4 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
                <Heart className="size-4" />
                Wishlist
              </button>
              <Link href={`https://wa.me/233${"558694853"}`} className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                <MessageCircle className="size-4" />
                WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>

      <MotionSection className="mt-24 max-w-5xl space-y-4" delay={0.04}>
        <div className="bg-surface p-6">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-foreground">
            Technical Specifications
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex items-center justify-between border-b border-white/5 py-3 text-sm">
                <span className="uppercase text-content-secondary">{spec.label}</span>
                <span className="text-foreground">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface p-6">
          <h2 className="font-display text-3xl uppercase tracking-[0.08em] text-foreground">
            Payment Plan Details
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-content-secondary">
            Secure your device today with a {product.installment.downPaymentPercent}% upfront payment. The remaining balance is split into {product.installment.weeks} weekly payments of {formatPrice(product.installment.weeklyRate, product.currency)}.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="bg-surface-high p-4">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Due Today</p>
              <p className="font-mono text-xl text-foreground">{formatPrice(product.installment.downPayment, product.currency)}</p>
            </div>
            <div className="bg-surface-high p-4">
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">Weekly Rate</p>
              <p className="font-mono text-xl text-foreground">{formatPrice(product.installment.weeklyRate, product.currency)}</p>
            </div>
          </div>
        </div>
      </MotionSection>

      <MotionSection className="mt-28" delay={0.08}>
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p
              className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-primary"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Curated Pairings
            </p>
            <h2 className="font-display text-5xl uppercase tracking-tight text-foreground">
              Compliment Your Gear
            </h2>
          </div>
        </div>
        <MotionList className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {product.relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.slug} product={relatedProduct} showCartAction={false} />
          ))}
        </MotionList>
      </MotionSection>
    </MotionPage>
  )
}
