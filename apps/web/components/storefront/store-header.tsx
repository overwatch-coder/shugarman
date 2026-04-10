"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
import { getSearchSuggestions } from "@/lib/storefront-search"
import { navigationLinks } from "@/lib/storefront-data"
import type { ProductCard } from "@/lib/storefront-types"
import { useWishlistStore } from "@/lib/wishlist-store"
import { AnimatedCounter } from "./motion-primitives"
import { ThemeToggle } from "./theme-toggle"
import { useCart } from "./cart-provider"
import { AuthPanel } from "./auth-panel"

export function StoreHeader({ searchProducts }: { searchProducts: ProductCard[] }) {
  const pathname = usePathname()
  const router = useRouter()
  const { totalItems } = useCart()
  const { totalItems: totalWishlistItems } = useWishlistStore()
  const shouldReduceMotion = useReducedMotion()
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const suggestions = useMemo(
    () => getSearchSuggestions(searchProducts, searchTerm),
    [searchProducts, searchTerm]
  )

  function submitSearch() {
    const query = searchTerm.trim()
    if (!query) return

    setSearchOpen(false)
    router.push(`/shop?q=${encodeURIComponent(query)}`)
  }

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
            onClick={() => setSearchOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <Search className="size-4" />
          </button>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="relative inline-flex size-10 items-center justify-center rounded-full text-content-secondary transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <Heart className="size-4" />
            <AnimatePresence initial={false}>
              {totalWishlistItems > 0 && (
                <motion.span
                  key="wishlist-badge"
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-white"
                >
                  <AnimatedCounter value={totalWishlistItems} formatter={(value) => String(value)} />
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
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

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-20 max-w-2xl rounded-3xl border border-border bg-background p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle className="text-base font-black uppercase tracking-[0.16em] text-foreground">
              Search the Catalog
            </DialogTitle>
            <DialogDescription>
              Search products by name, brand, or product line, then jump to the shop or a matching device.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                submitSearch()
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search iPhone, Samsung, tablets, accessories..."
                className="min-h-12 flex-1 rounded-2xl border border-border bg-surface px-4 text-base text-foreground outline-none placeholder:text-content-muted focus:border-primary/60"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-primary px-5 text-sm font-black uppercase tracking-[0.16em] text-white"
              >
                Search Shop
              </button>
            </form>

            {searchTerm.trim() ? (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-content-secondary">
                    Suggestions
                  </p>
                  <button
                    type="button"
                    onClick={submitSearch}
                    className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary hover:underline"
                  >
                    View all results
                  </button>
                </div>

                {suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.map((product) => (
                      <button
                        key={product.slug}
                        type="button"
                        onClick={() => {
                          setSearchOpen(false)
                          router.push(`/shop/${product.slug}`)
                        }}
                        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                          <p className="mt-1 truncate text-xs text-content-secondary">
                            {product.brand} · {product.subtitle}
                          </p>
                        </div>
                        <p className="shrink-0 font-mono text-xs font-bold text-primary">
                          {product.currency} {product.price.toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-card px-4 py-5 text-sm text-content-secondary">
                    No instant matches yet. Submit the term to open the filtered shop view.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="top-auto bottom-0 left-0 right-0 max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-3xl border border-border bg-background p-0 sm:hidden">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="text-base font-black uppercase tracking-[0.16em] text-foreground">
              Menu
            </DialogTitle>
            <DialogDescription>
              Browse the storefront, search, open your wishlist or cart, or sign in.
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

          <div className="grid grid-cols-3 gap-3 border-t border-border px-5 py-5">
            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-low px-4 py-3 text-sm font-semibold text-foreground"
            >
              <Heart className="size-4" />
              Wishlist
            </Link>
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
