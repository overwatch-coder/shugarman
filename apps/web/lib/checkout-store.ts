import { create } from "zustand"

export type CheckoutStep = "information" | "shipping" | "payment" | "confirmation"

export const CHECKOUT_STEPS: CheckoutStep[] = ["information", "shipping", "payment", "confirmation"]

export interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  notes: string
}

export interface ShippingMethod {
  id: string
  label: string
  description: string
  price: number
  estimate: string
}

export interface PaymentMethod {
  type: "momo" | "cash" | "installment"
  momoProvider?: string
  momoNumber?: string
}

interface CheckoutState {
  step: CheckoutStep
  shippingAddress: ShippingAddress
  shippingMethod: ShippingMethod | null
  paymentMethod: PaymentMethod | null
  orderPlaced: boolean
  successModalOpen: boolean

  setStep: (step: CheckoutStep) => void
  setSuccessModalOpen: (open: boolean) => void
  goNext: () => void
  goBack: () => void
  setShippingAddress: (address: ShippingAddress) => void
  setShippingMethod: (method: ShippingMethod) => void
  setPaymentMethod: (method: PaymentMethod) => void
  placeOrder: () => void
  reset: () => void
}

const initialAddress: ShippingAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
  notes: "",
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  step: "information",
  shippingAddress: initialAddress,
  shippingMethod: null,
  paymentMethod: null,
  orderPlaced: false,
  successModalOpen: false,

  setStep: (step) => set({ step }),
  setSuccessModalOpen: (open) => set({ successModalOpen: open }),

  goNext: () =>
    set((state) => {
      const idx = CHECKOUT_STEPS.indexOf(state.step)
      const next = CHECKOUT_STEPS[idx + 1]
      return next ? { step: next } : {}
    }),

  goBack: () =>
    set((state) => {
      const idx = CHECKOUT_STEPS.indexOf(state.step)
      const prev = CHECKOUT_STEPS[idx - 1]
      return prev ? { step: prev } : {}
    }),

  setShippingAddress: (address) => set({ shippingAddress: address }),
  setShippingMethod: (method) => set({ shippingMethod: method }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  placeOrder: () => set({ orderPlaced: true, step: "confirmation", successModalOpen: true }),

  reset: () =>
    set({
      step: "information",
      shippingAddress: initialAddress,
      shippingMethod: null,
      paymentMethod: null,
      orderPlaced: false,
      successModalOpen: false,
    }),
}))

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    label: "Standard Delivery",
    description: "Kumasi metropolitan area",
    price: 0,
    estimate: "1-2 business days",
  },
  {
    id: "express",
    label: "Express Delivery",
    description: "Same-day within Kumasi",
    price: 25,
    estimate: "Same day",
  },
  {
    id: "pickup",
    label: "In-Store Pickup",
    description: "Asempa Pharmacy Building, Adum",
    price: 0,
    estimate: "Ready in 1 hour",
  },
]
