"use client"

import { motion } from "framer-motion"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, ChevronLeft, CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { useCart } from "./cart-provider"
import { MotionPage, MotionSection } from "./motion-primitives"
import { createOrder } from "@/lib/actions/orders"
import {
  CHECKOUT_STEPS,
  SHIPPING_METHODS,
  useCheckoutStore,
  type CheckoutStep,
  type PaymentMethod,
  type ShippingAddress,
} from "@/lib/checkout-store"
import type { StoreMetadata } from "@/lib/storefront-types"

function formatPrice(value: number, currency: string) {
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const stepMeta: Record<CheckoutStep, { title: string; icon: typeof MapPin }> = {
  information: { title: "Information", icon: MapPin },
  shipping: { title: "Shipping", icon: Truck },
  payment: { title: "Payment", icon: CreditCard },
  confirmation: { title: "Confirmation", icon: CheckCircle2 },
}

export function CheckoutPageClient({
  storeMetadata,
}: {
  storeMetadata: StoreMetadata
}) {
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
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

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

  async function handleConfirmOrder() {
    setPlacingOrder(true)
    const result = await createOrder({
        customer: shippingAddress,
        shipping: shippingMethod!,
        payment: paymentMethod!,
        items: items.map((item) => ({
          slug: item.slug,
          name: item.name,
          variant: item.variant,
          image: item.image,
          price: item.price,
          currency: item.currency,
          quantity: item.quantity,
        })),
        subtotal: summary.subtotal,
        shippingCost: summary.shipping,
        tax: summary.tax,
        total: summary.total,
        currency: "GHC",
        notes: shippingAddress.notes,
      })

    setPlacingOrder(false)
    if (!result.success) {
      const message = result.error ?? "We couldn't save your order. Please try again."
      setErrors([message])
      toast.error(message)
      setPaymentConfirmOpen(false)
      return
    }

    setPaymentConfirmOpen(false)
    clearCart()
    placeOrder()
  }

  async function handleContinue() {
    if (!validateCurrentStep()) return
    if (step === "payment") {
      setPaymentConfirmOpen(true)
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

      const paymentOptions = [
        {
          type: "momo" as const,
          label: "Mobile Money",
          sublabel: "MTN · Telecel · AirtelTigo",
          illustration: (
            <svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto">
              {/* Phone body */}
              <rect x="22" y="2" width="26" height="44" rx="4" fill="#1a1a1a" stroke="#444" strokeWidth="1.2" />
              <rect x="25" y="8" width="20" height="28" rx="1.5" fill="#111" />
              {/* Screen glow - yellow/gold for MTN MoMo */}
              <rect x="25" y="8" width="20" height="28" rx="1.5" fill="url(#momoGrad)" opacity="0.9" />
              {/* Signal waves */}
              <path d="M50 14 C54 14 57 17 57 21" stroke="#FFCC00" strokeWidth="2" strokeLinecap="round" />
              <path d="M50 18 C52.5 18 54.5 20 54.5 22.5" stroke="#FFCC00" strokeWidth="1.5" strokeLinecap="round" />
              {/* Coin */}
              <circle cx="58" cy="36" r="10" fill="#FFCC00" />
              <circle cx="58" cy="36" r="7.5" fill="#F5B800" />
              <text x="55" y="40" fontSize="9" fontWeight="bold" fill="#7A5800" fontFamily="sans-serif">₵</text>
              {/* Home button */}
              <circle cx="35" cy="42" r="2" fill="#333" />
              <defs>
                <linearGradient id="momoGrad" x1="25" y1="8" x2="45" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FFCC00" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#FF6B00" stopOpacity="0.15" />
                </linearGradient>
              </defs>
            </svg>
          ),
        },
        {
          type: "cash" as const,
          label: "Cash on Delivery",
          sublabel: "Pay when you receive",
          illustration: (
            <svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto">
              {/* Delivery bag */}
              <rect x="8" y="22" width="38" height="28" rx="3" fill="#2a2a2a" stroke="#555" strokeWidth="1.2" />
              <path d="M16 22 C16 14 38 14 38 22" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              {/* Banknote */}
              <rect x="28" y="18" width="40" height="24" rx="3" fill="#16a34a" />
              <rect x="31" y="21" width="34" height="18" rx="2" fill="#15803d" />
              {/* Note details */}
              <ellipse cx="48" cy="30" rx="6" ry="6" fill="#22c55e" opacity="0.5" />
              <text x="45" y="33.5" fontSize="8" fontWeight="bold" fill="#dcfce7" fontFamily="sans-serif">₵</text>
              <rect x="32" y="22" width="8" height="2" rx="1" fill="#4ade80" opacity="0.5" />
              <rect x="60" y="34" width="8" height="2" rx="1" fill="#4ade80" opacity="0.5" />
              {/* Bag handle dot */}
              <circle cx="27" cy="34" r="2.5" fill="#444" />
            </svg>
          ),
        },
        {
          type: "installment" as const,
          label: "Installments",
          sublabel: "50% now · rest in 12 weeks",
          illustration: (
            <svg viewBox="0 0 80 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto">
              {/* Calendar */}
              <rect x="8" y="10" width="40" height="38" rx="3" fill="#1e1e2e" stroke="#444" strokeWidth="1.2" />
              <rect x="8" y="10" width="40" height="10" rx="3" fill="#e8182c" />
              <rect x="8" y="16" width="40" height="4" fill="#e8182c" />
              {/* Calendar tabs */}
              <rect x="16" y="7" width="3" height="7" rx="1.5" fill="#888" />
              <rect x="37" y="7" width="3" height="7" rx="1.5" fill="#888" />
              {/* Calendar dots - weeks */}
              {[0,1,2,3,4,5,6].map((col) => [0,1,2,3].map((row) => (
                <circle key={`${col}-${row}`} cx={13 + col * 5} cy={26 + row * 6} r="1.8"
                  fill={row === 0 && col < 3 ? "#e8182c" : row === 0 && col === 3 ? "#e8182c" : "#555"} />
              )))}
              {/* Checkmarks on first row */}
              <path d="M11 26.5 l1.5 1.5 l2.5-2.5" stroke="#e8182c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Progress bar */}
              <rect x="52" y="12" width="16" height="34" rx="3" fill="#1a1a2e" stroke="#333" strokeWidth="1" />
              <rect x="52" y="34" width="16" height="12" rx="3" fill="#e8182c" />
              <text x="56" y="44" fontSize="6" fontWeight="bold" fill="white" fontFamily="sans-serif">50%</text>
            </svg>
          ),
        },
      ] as const

      return (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            {paymentOptions.map(({ type, label, sublabel, illustration }) => (
              <button
                key={type}
                type="button"
                onClick={() => setPaymentMethod({ type })}
                className={method.type === type ? "flex flex-col items-start gap-3 border border-primary bg-primary/10 px-4 py-4 text-left" : "flex flex-col items-start gap-3 border border-white/10 bg-surface-high px-4 py-4 text-left transition-colors hover:border-white/20"}
              >
                {illustration}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">{label}</p>
                  <p className="mt-0.5 text-[11px] text-content-muted">{sublabel}</p>
                </div>
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
            Your order has been staged for verification. A SHUGARMAN iSTORE specialist will contact you via
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
      {/* ── Payment Confirmation Modal ─────────────────────────────────── */}
      <Dialog open={paymentConfirmOpen} onOpenChange={(open) => { if (!placingOrder) setPaymentConfirmOpen(open) }}>
        <DialogContent className="max-h-[90dvh] !max-w-[500px] overflow-y-auto rounded-2xl border border-white/10 bg-[#16102a] p-0 text-foreground shadow-2xl">
          <div className="space-y-6 p-8">
            {/* Header */}
            <div>
              <div className="inline-flex size-12 items-center justify-center rounded-full bg-violet-500/20">
                <CreditCard className="size-5 text-violet-400" />
              </div>
              <DialogTitle className="mt-4 font-display text-3xl uppercase tracking-tight text-white">
                Confirm Payment
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-neutral-400">
                Review the payment arrangement before your order is placed.
              </DialogDescription>
            </div>

            {/* Payment method block */}
            {paymentMethod?.type === "momo" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Your Mobile Money</p>
                  <p className="mt-3 text-base font-bold text-white">{paymentMethod.momoProvider ?? "—"} MoMo</p>
                  <p className="mt-1 font-mono text-sm text-neutral-300">{paymentMethod.momoNumber ?? "—"}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {shippingAddress.firstName} {shippingAddress.lastName}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Send Payment To</p>
                  <p className="mt-3 text-base font-bold text-white">{storeMetadata.name}</p>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">MTN MoMo</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {storeMetadata.whatsapp.replace(/^233/, "0")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Contact</span>
                      <span className="font-mono text-sm text-neutral-300">{storeMetadata.phone}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                    Send the full order amount to the number above, then tap &ldquo;Confirm — I Have Paid&rdquo; to place your order.
                    Our team will verify within 30 minutes.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod?.type === "cash" && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Cash on Delivery</p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300">
                  You agree to pay in full cash when your order is delivered. Our delivery agent will collect
                  the exact amount of <span className="font-mono font-bold text-white">{formatPrice(summary.total, "GHC")}</span> at
                  the time of handover.
                </p>
                <p className="mt-2 text-[11px] text-neutral-500">
                  Contact us at {storeMetadata.phone} if you have questions before delivery.
                </p>
              </div>
            )}

            {paymentMethod?.type === "installment" && (
              <div className="space-y-3">
                <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Down Payment Due Now</p>
                  <p className="mt-2 font-mono text-2xl font-black text-white">
                    {formatPrice(summary.total * 0.5, "GHC")}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">50% of order total · {formatPrice(summary.total, "GHC")}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Send Down Payment To</p>
                  <p className="mt-3 text-base font-bold text-white">{storeMetadata.name}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">MTN MoMo</span>
                    <span className="font-mono text-sm font-bold text-white">
                      {storeMetadata.whatsapp.replace(/^233/, "0")}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                    Remaining balance of {formatPrice(summary.total * 0.5, "GHC")} is cleared within 12 weeks.
                    Our team will confirm your schedule after order placement.
                  </p>
                </div>
              </div>
            )}

            {/* Order total summary */}
            <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Order Total</span>
                <span className="font-mono text-lg font-black text-white">{formatPrice(summary.total, "GHC")}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-500">Shipping</span>
                <span className="font-mono text-xs text-neutral-400">
                  {summary.shipping === 0 ? "Free" : formatPrice(summary.shipping, "GHC")}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleConfirmOrder}
                disabled={placingOrder}
                className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
              >
                {placingOrder ? "Placing Order…" : paymentMethod?.type === "cash" ? "Confirm & Place Order" : "Confirm — I Have Paid"}
              </button>
              <button
                type="button"
                onClick={() => setPaymentConfirmOpen(false)}
                disabled={placingOrder}
                className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-400 transition-colors hover:text-white disabled:opacity-60"
              >
                Go Back
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Order Success Modal ────────────────────────────────────────── */}
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
            Complete your order with SHUGARMAN iSTORE. Fast confirmation, local support, and protected delivery across Kumasi.
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
