"use client"

import type * as React from "react"

import { useCartStore, type CartState } from "@/lib/cart-store"

/**
 * Thin wrapper over the Zustand cart store.
 * Keeps the same public API so all consumers continue to work unchanged.
 */
export function useCart(): CartState {
  return useCartStore()
}

/**
 * CartProvider is now a pass-through — Zustand manages its own state
 * internally with localStorage persistence. Kept for layout compatibility.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}