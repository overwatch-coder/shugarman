"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Lock, ShoppingBag, Trash2 } from "lucide-react"
import { useMemo } from "react"

import { useCart } from "./cart-provider"
import { MotionPage, MotionSection } from "./motion-primitives"
import { QuantityStepper } from "./quantity-stepper"

function formatPrice(value: number, currency: string) {
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CartPageClient() {
  const { items: cartItems, removeItem, updateQuantity } = useCart()
  const shouldReduceMotion = useReducedMotion()

  const summary = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.0842
    const total = subtotal + tax

    return { subtotal, tax, total }
  }, [cartItems])

  if (cartItems.length === 0) {
    return (
      <MotionPage className="py-12">
        <MotionSection className="mb-12">
          <h1 className="font-display text-6xl uppercase tracking-tight text-foreground">
            Your Workspace
          </h1>
        </MotionSection>
        <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
          <ShoppingBag className="size-16 text-content-muted" />
          <p className="font-display text-3xl uppercase text-content-secondary">Your cart is empty</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white sf-red-glow-box"
          >
            Explore the Shop
          </Link>
        </div>
      </MotionPage>
    )
  }

  return (
    <MotionPage className="py-12">
      <MotionSection className="mb-12">
        <h1 className="font-display text-6xl uppercase tracking-tight text-foreground">
          Your Workspace
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-content-secondary">
          <Lock className="size-3.5" />
          Secure checkout environment
        </p>
      </MotionSection>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          <AnimatePresence initial={false} mode="popLayout">
            {cartItems.map((item) => (
              <motion.div
                key={item.slug}
                layout
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? undefined
                    : {
                        opacity: 0,
                        y: -12,
                        scale: 0.98,
                        filter: "blur(4px)",
                      }
                }
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-4 border border-white/5 bg-surface-low px-5 py-4 transition-colors hover:bg-surface-bright sm:flex-row sm:items-center sm:gap-5"
              >
                {/* Image + name/variant — always on first row */}
                <div className="flex items-center gap-4 sm:contents">
                  <div className="size-[88px] shrink-0 overflow-hidden rounded-lg bg-surface-high">
                    <Image src={item.image} alt={item.imageAlt} width={160} height={160} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-bold text-foreground">{item.name}</h2>
                    <p className="mt-1 truncate text-xs text-content-secondary">{item.variant}</p>
                  </div>
                </div>

                {/* Quantity + price + delete — row on desktop, column on mobile */}
                <div className="flex items-center justify-between gap-4 sm:contents">
                  <div className="shrink-0">
                    <QuantityStepper value={item.quantity} onChange={(quantity) => updateQuantity(item.slug, quantity)} />
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-5">
                    <p className="w-auto shrink-0 font-mono text-sm font-medium text-foreground sm:w-32 sm:text-right">{formatPrice(item.price, item.currency)}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 text-content-muted transition-colors hover:text-primary"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="pt-4">
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-content-secondary transition-colors hover:text-foreground">
              <ArrowLeft className="size-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        <MotionSection className="bg-surface-low p-8 lg:col-span-4 lg:sticky lg:top-28 lg:self-start" delay={0.08}>
          <h2 className="font-display text-2xl uppercase tracking-tight text-foreground">Summary</h2>
          <div className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-content-secondary">Subtotal</span>
              <span className="font-mono text-sm text-foreground">{formatPrice(summary.subtotal, "GHC")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-content-secondary">Shipping</span>
              <span className="font-mono text-sm text-emerald-500">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-content-secondary">Tax</span>
              <span className="font-mono text-sm text-foreground">{formatPrice(summary.tax, "GHC")}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-white/5 pt-5">
              <span className="text-sm font-bold uppercase tracking-[0.15em] text-foreground">Total</span>
              <span className="font-mono text-2xl font-bold text-primary">{formatPrice(summary.total, "GHC")}</span>
            </div>
          </div>
          <div className="mt-6 flex items-start gap-3 bg-surface-high p-4">
            <ShoppingBag className="mt-0.5 size-4 shrink-0 text-primary" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">
                Flexible Financing
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-content-secondary">
                Pay GHC {(summary.total / 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo. for 12 months with Sugar Man Credit (0% APR).
              </p>
            </div>
          </div>
          <Link href="/checkout" className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white sf-red-glow-box">
            Proceed to Checkout
          </Link>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-content-muted">
            Secure SSL Encryption / Precision Guaranteed
          </p>
        </MotionSection>
      </div>
    </MotionPage>
  )
}
