"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Trash2 } from "lucide-react"
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

  return (
    <MotionPage className="py-12">
      <MotionSection className="mb-12">
        <h1 className="font-display text-6xl uppercase tracking-tight text-foreground">
          Your Workspace
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-content-secondary">
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
                className="flex flex-col gap-6 bg-surface-low p-6 transition-colors hover:bg-surface-bright md:flex-row md:items-center"
              >
                <div className="w-28 shrink-0 overflow-hidden bg-surface-high">
                  <Image src={item.image} alt={item.imageAlt} width={160} height={160} className="aspect-square h-auto w-full object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{item.name}</h2>
                    <p className="mt-2 text-sm text-content-secondary">{item.variant}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <QuantityStepper value={item.quantity} onChange={(quantity) => updateQuantity(item.slug, quantity)} />
                    <p className="font-mono text-lg text-foreground">{formatPrice(item.price, item.currency)}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.slug)}
                      aria-label={`Remove ${item.name}`}
                      className="text-content-secondary transition-colors hover:text-primary"
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

        <MotionSection className="bg-surface p-8 lg:col-span-4 lg:sticky lg:top-28 lg:self-start" delay={0.08}>
          <h2 className="font-display text-4xl uppercase tracking-tight text-foreground">Summary</h2>
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.2em] text-content-secondary">Subtotal</span>
              <span className="font-mono text-foreground">{formatPrice(summary.subtotal, "GHC")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.2em] text-content-secondary">Shipping</span>
              <span className="font-mono text-emerald-500">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.2em] text-content-secondary">Tax</span>
              <span className="font-mono text-foreground">{formatPrice(summary.tax, "GHC")}</span>
            </div>
            <div className="flex items-end justify-between border-t border-white/5 pt-6">
              <span className="font-display text-3xl uppercase tracking-tight text-foreground">Total</span>
              <span className="font-mono text-4xl font-bold text-primary">{formatPrice(summary.total, "GHC")}</span>
            </div>
          </div>
          <div className="mt-8 bg-surface-high p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-foreground">
              Flexible Financing
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-content-secondary">
              Pay GHC 4,425.20/mo. for 12 months with Sugar Man Credit (0% APR).
            </p>
          </div>
          <button type="button" className="mt-8 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-5 text-sm font-black uppercase tracking-[0.2em] text-white sf-red-glow-box">
            Proceed to Checkout
          </button>
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-content-muted">
            Secure SSL Encryption / Precision Guaranteed
          </p>
        </MotionSection>
      </div>
    </MotionPage>
  )
}
