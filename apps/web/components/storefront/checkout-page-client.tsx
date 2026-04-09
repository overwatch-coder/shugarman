"use client"

import { motion } from "framer-motion"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, ChevronLeft, CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { useCart } from "./cart-provider"
import { MotionPage, MotionSection } from "./motion-primitives"
import { storeMetadata } from "@/lib/storefront-data"
import {
  CHECKOUT_STEPS,
  SHIPPING_METHODS,
  useCheckoutStore,
  type CheckoutStep,
  type PaymentMethod,
  type ShippingAddress,
} from "@/lib/checkout-store"

function formatPrice(value: number, currency: string) {
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const stepMeta: Record<CheckoutStep, { title: string; icon: typeof MapPin }> = {
  information: { title: "Information", icon: MapPin },
  shipping: { title: "Shipping", icon: Truck },
  payment: { title: "Payment", icon: CreditCard },
  confirmation: { title: "Confirmation", icon: CheckCircle2 },
}

export function CheckoutPageClient() {
  const { items, totalItems, clearCart } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    step,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    successModalOpen,
    setShippingAddress,
    setShippingMethod,
    setPaymentMethod,
    setSuccessModalOpen,
    goNext,
    goBack,
    placeOrder,
    reset,
    setStep,
  } = useCheckoutStore()

  // Sync step ↔ URL search param (?step=shipping)
  useEffect(() => {
    const urlStep = searchParams.get("step") as CheckoutStep | null
    const validSteps: CheckoutStep[] = ["information", "shipping", "payment", "confirmation"]
    if (urlStep && validSteps.includes(urlStep) && urlStep !== step) {
      setStep(urlStep)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("step", step)
    router.replace(`/checkout?${params.toString()}`, { scroll: false })
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  const [errors, setErrors] = useState<string[]>([])

  const summary = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = shippingMethod?.price ?? 0
    const tax = subtotal * 0.0842
    const total = subtotal + shipping + tax
    return { subtotal, shipping, tax, total }
  }, [items, shippingMethod])

  if (items.length === 0 && step !== "confirmation") {
    return (
      <MotionPage className="py-12">
        <MotionSection className="mx-auto max-w-2xl py-20 text-center">
          <h1 className="font-display text-6xl uppercase tracking-tight text-foreground">Checkout</h1>
          <p className="mt-4 text-content-secondary">Your cart is empty. Add a device before continuing.</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white sf-red-glow-box"
          >
            Explore the Shop
          </Link>
        </MotionSection>
      </MotionPage>
    )
  }

  function validateCurrentStep() {
    const nextErrors: string[] = []

    if (step === "information") {
      if (!shippingAddress.firstName.trim()) nextErrors.push("First name is required")
      if (!shippingAddress.lastName.trim()) nextErrors.push("Last name is required")
      if (!shippingAddress.email.trim()) nextErrors.push("Email is required")
      if (!shippingAddress.phone.trim()) nextErrors.push("Phone number is required")
      if (!shippingAddress.address.trim()) nextErrors.push("Address is required")
      if (!shippingAddress.city.trim()) nextErrors.push("City is required")
      if (!shippingAddress.region.trim()) nextErrors.push("Region is required")
    }

    if (step === "shipping" && !shippingMethod) {
      nextErrors.push("Choose a shipping method")
    }

    if (step === "payment") {
      if (!paymentMethod) {
        nextErrors.push("Select a payment method")
      } else if (paymentMethod.type === "momo" && (!paymentMethod.momoProvider || !paymentMethod.momoNumber)) {
        nextErrors.push("Enter your mobile money provider and number")
      }
    }

    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  function handleContinue() {
    if (!validateCurrentStep()) return
    if (step === "payment") {
      placeOrder()
      return
    }
    goNext()
  }

  function updateAddressField<Key extends keyof ShippingAddress>(key: Key, value: ShippingAddress[Key]) {
    setShippingAddress({
      ...shippingAddress,
      [key]: value,
    })
  }

  function renderStep() {
    if (step === "information") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">First Name</span>
            <input value={shippingAddress.firstName} onChange={(e) => updateAddressField("firstName", e.target.value)} className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Last Name</span>
            <input value={shippingAddress.lastName} onChange={(e) => updateAddressField("lastName", e.target.value)} className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Email</span>
            <input type="email" value={shippingAddress.email} onChange={(e) => updateAddressField("email", e.target.value)} className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Phone</span>
            <input value={shippingAddress.phone} onChange={(e) => updateAddressField("phone", e.target.value)} className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Address</span>
            <input value={shippingAddress.address} onChange={(e) => updateAddressField("address", e.target.value)} className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">City</span>
            <input value={shippingAddress.city} onChange={(e) => updateAddressField("city", e.target.value)} className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Region</span>
            <input value={shippingAddress.region} onChange={(e) => updateAddressField("region", e.target.value)} className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Delivery Notes</span>
            <textarea value={shippingAddress.notes} onChange={(e) => updateAddressField("notes", e.target.value)} rows={4} className="w-full resize-none bg-surface-high px-4 py-3 text-sm text-foreground outline-none" />
          </label>
        </div>
      )
    }

    if (step === "shipping") {
      return (
        <div className="space-y-4">
          {SHIPPING_METHODS.map((method) => {
            const active = shippingMethod?.id === method.id
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setShippingMethod(method)}
                className={active ? "w-full border border-primary bg-primary/10 p-5 text-left" : "w-full border border-white/10 bg-surface-high p-5 text-left transition-colors hover:border-white/20"}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">{method.label}</p>
                    <p className="mt-1 text-sm text-content-secondary">{method.description}</p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-content-muted">{method.estimate}</p>
                  </div>
                  <span className="font-mono text-sm text-primary">{method.price === 0 ? "Free" : formatPrice(method.price, "GHC")}</span>
                </div>
              </button>
            )
          })}
        </div>
      )
    }

    if (step === "payment") {
      const method = paymentMethod ?? { type: "momo" as const }
      return (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            {([
              ["momo", "Mobile Money"],
              ["cash", "Cash on Delivery"],
              ["installment", "Installments"],
            ] as const).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => setPaymentMethod({ type })}
                className={method.type === type ? "border border-primary bg-primary/10 px-4 py-4 text-left" : "border border-white/10 bg-surface-high px-4 py-4 text-left transition-colors hover:border-white/20"}
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">{label}</p>
              </button>
            ))}
          </div>

          {method.type === "momo" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Provider</span>
                <select
                  value={method.momoProvider ?? ""}
                  onChange={(e) => setPaymentMethod({ ...method, momoProvider: e.target.value })}
                  className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none [&>option]:bg-neutral-900 [&>option]:text-white"
                >
                  <option value="">Select provider</option>
                  <option value="MTN">MTN MoMo</option>
                  <option value="Telecel">Telecel Cash</option>
                  <option value="AirtelTigo">AirtelTigo Money</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">MoMo Number</span>
                <input
                  value={method.momoNumber ?? ""}
                  onChange={(e) => setPaymentMethod({ ...method, momoNumber: e.target.value })}
                  className="w-full bg-surface-high px-4 py-3 text-sm text-foreground outline-none"
                />
              </label>
            </div>
          ) : null}

          {method.type === "installment" ? (
            <div className="bg-surface-high p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">Sugar Man Credit</p>
              <p className="mt-2 text-sm leading-7 text-content-secondary">
                Start with 50% down payment and clear the remaining balance within 12 weeks.
                Our team will confirm eligibility and payment cadence after order placement.
              </p>
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <div>
          <h2 className="font-display text-4xl uppercase tracking-tight text-foreground">Order Received</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-content-secondary">
            Your order has been staged for verification. A Sugar Man iStore specialist will contact you via
            WhatsApp or phone to confirm payment and delivery details.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-surface-high p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Contact</p>
            <p className="mt-3 text-sm text-foreground">{shippingAddress.firstName} {shippingAddress.lastName}</p>
            <p className="mt-1 text-sm text-content-secondary">{shippingAddress.email}</p>
            <p className="mt-1 text-sm text-content-secondary">{shippingAddress.phone}</p>
          </div>
          <div className="bg-surface-high p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-content-secondary">Fulfillment</p>
            <p className="mt-3 text-sm text-foreground">{shippingMethod?.label ?? "Pending"}</p>
            <p className="mt-1 text-sm text-content-secondary">{paymentMethod?.type ?? "Pending"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/shop" className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white sf-red-glow-box">
            Continue Shopping
          </Link>
          <button type="button" onClick={() => { clearCart(); reset(); }} className="inline-flex items-center justify-center rounded-md border border-white/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-white/5">
            Start New Checkout
          </button>
        </div>
      </div>
    )
  }

  return (
    <MotionPage className="py-12">
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90dvh] !max-w-[540px] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1a1a] p-0 text-foreground shadow-2xl"
        >
          <div className="flex flex-col items-center px-10 pt-12 pb-10 text-center">
            {/* Green check icon with glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex size-24 items-center justify-center"
            >
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/15" />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-emerald-500/10"
              />
              {/* Inner badge */}
              <div className="relative flex size-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <CheckCircle2 className="size-9 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                </motion.div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.32 }}
            >
              <DialogTitle className="mt-8 font-display text-[2.5rem] font-black uppercase italic leading-none tracking-tight text-white">
                Order Locked In
              </DialogTitle>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.28 }}
            >
              <DialogDescription className="mt-4 max-w-xs text-base leading-relaxed text-neutral-400">
                Your order has been placed successfully. A {storeMetadata.name} specialist will reach out to confirm details shortly.
              </DialogDescription>
            </motion.div>

            {/* Info summary */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.28 }}
              className="mt-8 w-full grid gap-3 sm:grid-cols-2"
            >
              <div className="rounded-xl border border-white/8 bg-white/5 px-5 py-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Customer</p>
                <p className="mt-2 text-sm font-bold text-white">
                  {shippingAddress.firstName} {shippingAddress.lastName}
                </p>
                <p className="mt-0.5 text-sm text-neutral-400">{shippingAddress.phone}</p>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/5 px-5 py-4 text-left">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">Fulfillment</p>
                <p className="mt-2 text-sm font-bold text-white">
                  {shippingMethod?.label ?? "Pending"}
                </p>
                <p className="mt-0.5 text-sm capitalize text-neutral-400">
                  {paymentMethod?.type ?? "Pending"}
                </p>
              </div>
            </motion.div>

            {/* CTA Button — full width, bold, big padding like inspiration */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.28 }}
              className="mt-10 flex w-full flex-col gap-3"
            >
              <Button
                asChild
                className="w-full rounded-xl bg-emerald-500 py-7 text-lg font-black uppercase italic tracking-wide text-white shadow-lg hover:bg-emerald-600"
              >
                <Link href="/shop">Continue Shopping</Link>
              </Button>
              <button
                type="button"
                onClick={() => { clearCart(); reset(); }}
                className="w-full py-3 text-sm font-semibold uppercase tracking-wider text-neutral-500 transition-colors hover:text-white"
              >
                Start New Checkout
              </button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      <MotionSection className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">Secure checkout</p>
          <h1 className="font-display text-6xl uppercase tracking-tight text-foreground">Precision Checkout</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-content-secondary">
            Complete your order with Sugar Man iStore. Fast confirmation, local support, and protected delivery across Kumasi.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface-low px-5 py-4 text-sm text-content-secondary">
          <ShieldCheck className="size-4 text-primary" />
          {storeMetadata.city} / Verified secure ordering
        </div>
      </MotionSection>

      <div className="grid gap-10 lg:grid-cols-[1.35fr_0.75fr]">
        <div className="space-y-8">
          <div className="grid gap-3 md:grid-cols-4">
            {CHECKOUT_STEPS.map((entry, index) => {
              const meta = stepMeta[entry]
              const Icon = meta.icon
              const active = step === entry
              const reached = CHECKOUT_STEPS.indexOf(step) >= index

              return (
                <div key={entry} className={active ? "border border-primary bg-primary/10 p-4" : reached ? "border border-white/10 bg-surface-low p-4" : "border border-white/5 bg-surface p-4 opacity-60"}>
                  <div className="flex items-center gap-3">
                    <div className={active ? "flex size-9 items-center justify-center rounded-full bg-primary text-white" : "flex size-9 items-center justify-center rounded-full bg-surface-high text-content-secondary"}>
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-content-muted">Step {index + 1}</p>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">{meta.title}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <MotionSection className="bg-surface-low p-6 md:p-8">
            <div className="mb-6">
              <h2 className="font-display text-3xl uppercase tracking-tight text-foreground">{stepMeta[step].title}</h2>
              <p className="mt-2 text-sm text-content-secondary">
                {step === "information" && "Tell us where and how to reach you."}
                {step === "shipping" && "Choose how you want to receive your device."}
                {step === "payment" && "Select how you'd like to complete payment."}
                {step === "confirmation" && "Your order has been staged successfully."}
              </p>
            </div>

            {errors.length > 0 ? (
              <div className="mb-6 space-y-1 bg-primary/10 p-4 text-sm text-primary">
                {errors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            ) : null}

            {renderStep()}

            {step !== "confirmation" ? (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === "information"}
                  className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-content-secondary transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft className="size-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white sf-red-glow-box"
                >
                  {step === "payment" ? "Place Order" : "Continue"}
                </button>
              </div>
            ) : null}
          </MotionSection>
        </div>

        <MotionSection className="h-fit bg-surface-low p-6 lg:sticky lg:top-28" delay={0.04}>
          <div className="border-b border-white/5 pb-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Order summary</p>
            <h2 className="mt-2 font-display text-3xl uppercase tracking-tight text-foreground">{totalItems} Items Locked</h2>
            <p className="mt-2 text-sm text-content-secondary">{storeMetadata.name} / {storeMetadata.tagline}</p>
          </div>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div key={item.slug} className="flex items-center justify-between gap-4 bg-surface-high p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
                  <p className="mt-1 text-xs text-content-secondary">{item.variant} x {item.quantity}</p>
                </div>
                <span className="shrink-0 font-mono text-sm text-primary">{formatPrice(item.price * item.quantity, item.currency)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-4 border-t border-white/5 pt-6">
            <div className="flex items-center justify-between text-sm text-content-secondary">
              <span>Subtotal</span>
              <span className="font-mono text-foreground">{formatPrice(summary.subtotal, "GHC")}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-content-secondary">
              <span>Shipping</span>
              <span className="font-mono text-foreground">{summary.shipping === 0 ? "Free" : formatPrice(summary.shipping, "GHC")}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-content-secondary">
              <span>Tax</span>
              <span className="font-mono text-foreground">{formatPrice(summary.tax, "GHC")}</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-sm font-bold uppercase tracking-[0.16em] text-foreground">Total</span>
              <span className="font-mono text-2xl font-bold text-primary">{formatPrice(summary.total, "GHC")}</span>
            </div>
          </div>

          <div className="mt-6 bg-surface-high p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground">Brand Assurance</p>
            <p className="mt-2 text-sm leading-6 text-content-secondary">
              Verified devices, local after-sales support, and quick delivery coordination through {storeMetadata.phone} and WhatsApp.
            </p>
          </div>
        </MotionSection>
      </div>
    </MotionPage>
  )
}
