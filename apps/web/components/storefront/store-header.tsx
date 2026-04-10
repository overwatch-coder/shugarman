"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Heart, Menu, Search, ShoppingCart, UserRound } from "lucide-react"

import { cn } from "@workspace/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { BrandMark } from "@/components/shared/brand-mark"
import { navigationLinks } from "@/lib/storefront-data"
import { AnimatedCounter } from "./motion-primitives"
import { ThemeToggle } from "./theme-toggle"
import { useCart } from "./cart-provider"
import { AuthPanel } from "./auth-panel"

export function StoreHeader() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const shouldReduceMotion = useReducedMotion()
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 sf-glass">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-foreground">
          <BrandMark textClassName="hidden text-base text-foreground sm:inline sm:text-lg" iconClassName="size-9 rounded-lg" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigationLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : !link.href.startsWith("#") && pathname.startsWith(link.href)

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "border-b-2 pb-1 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-content-secondary hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-white/10 hover:text-foreground md:hidden"
          >
            <Menu className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Search"
            className="inline-flex size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <Search className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Wishlist"
            className="inline-flex sr-only size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <Heart className="size-4" />
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative inline-flex size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <ShoppingCart className="size-4" />
            <AnimatePresence initial={false}>
              {totalItems > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-white"
                >
                  <AnimatedCounter value={totalItems} formatter={(value) => String(value)} />
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            aria-label="Account"
            onClick={() => setAuthOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <UserRound className="size-4" />
          </button>
          <ThemeToggle />
        </div>
      </div>
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="top-auto bottom-0 left-0 right-0 max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-3xl border border-border bg-background p-0 sm:hidden">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="text-base font-black uppercase tracking-[0.16em] text-foreground">
              Menu
            </DialogTitle>
            <DialogDescription>
              Browse the storefront, open your cart, or sign in.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 px-5 py-5">
            {navigationLinks.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : !link.href.startsWith("#") && pathname.startsWith(link.href)

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "bg-surface-low text-foreground hover:bg-surface-high"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-border px-5 py-5">
            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-low px-4 py-3 text-sm font-semibold text-foreground"
            >
              <ShoppingCart className="size-4" />
              Cart
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false)
                setAuthOpen(true)
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              <UserRound className="size-4" />
              Account
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <AuthPanel open={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  )
}
