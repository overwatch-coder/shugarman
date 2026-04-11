"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { matchesStorefrontQuery } from "@/lib/storefront-search"
import type {
  ProductCard as ProductCardData,
  ProductCondition,
  SortOption,
} from "@/lib/storefront-types"

import { MotionList, MotionPage, MotionSection } from "./motion-primitives"
import { ProductCard } from "./product-card"

const categories = ["Smartphones", "Tablets", "Laptops", "Wearables"] as const
const brands = ["Apple", "Samsung"] as const
const swatches = [
  { hex: "#171717", label: "Black" },
  { hex: "#A3A3A3", label: "Silver" },
  { hex: "#1D4ED8", label: "Blue" },
  { hex: "#991B1B", label: "Red" },
]

const ITEMS_PER_PAGE = 16

  const PRICE_ABSOLUTE_MAX = 50000

  function parseSearchParams(searchParams: URLSearchParams) {
    const selectedCategories = searchParams.getAll("category")
    const selectedBrand = searchParams.get("brand")
    const selectedCondition = searchParams.get("condition") as ProductCondition | null
    const selectedColor = searchParams.get("color")
    const minPriceParam = searchParams.get("minPrice")
    const maxPriceParam = searchParams.get("maxPrice")
    const sort = (searchParams.get("sort") ?? "featured") as SortOption
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
    const query = searchParams.get("q") ?? ""

    return {
      selectedCategories,
      selectedBrand,
      selectedCondition,
      selectedColor,
      priceRange: [
        minPriceParam ? Number(minPriceParam) : 0,
        maxPriceParam ? Number(maxPriceParam) : PRICE_ABSOLUTE_MAX,
      ] as [number, number],
      sort,
      currentPage: page,
      query,
    }
  }

  export function ShopPageClient({ products }: { products: ProductCardData[] }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    const {
      selectedCategories,
      selectedBrand,
      selectedCondition,
      selectedColor,
      priceRange,
      sort,
      currentPage,
      query,
    } = parseSearchParams(searchParams)

    // Compute actual price ceiling from products so the slider is useful
    const priceCeiling = useMemo(() => {
      const max = Math.max(0, ...products.map((p) => p.price))
      // Round up to the nearest 1000
      return Math.max(PRICE_ABSOLUTE_MAX, Math.ceil(max / 1000) * 1000)
    }, [products])

    // Local slider state — synced from URL, committed back on release/blur
    const [localMin, setLocalMin] = useState(priceRange[0])
    const [localMax, setLocalMax] = useState(priceRange[1] === PRICE_ABSOLUTE_MAX ? priceCeiling : priceRange[1])
    const [minInput, setMinInput] = useState(String(priceRange[0]))
    const [maxInput, setMaxInput] = useState(priceRange[1] === PRICE_ABSOLUTE_MAX ? "" : String(priceRange[1]))

    // Keep local state in sync when URL params change externally
    const prevPriceRange = useRef(priceRange)
    useEffect(() => {
      if (
        prevPriceRange.current[0] !== priceRange[0] ||
        prevPriceRange.current[1] !== priceRange[1]
      ) {
        prevPriceRange.current = priceRange
        setLocalMin(priceRange[0])
        setLocalMax(priceRange[1] === PRICE_ABSOLUTE_MAX ? priceCeiling : priceRange[1])
        setMinInput(priceRange[0] === 0 ? "" : String(priceRange[0]))
        setMaxInput(priceRange[1] === PRICE_ABSOLUTE_MAX ? "" : String(priceRange[1]))
      }
    }, [priceRange, priceCeiling])

    function commitPriceRange(min: number, max: number) {
      const clampedMin = Math.max(0, Math.min(min, max - 100))
      const clampedMax = Math.min(priceCeiling, Math.max(max, min + 100))
      updateParams({
        minPrice: clampedMin > 0 ? String(clampedMin) : null,
        maxPrice: clampedMax < priceCeiling ? String(clampedMax) : null,
      })
    }

    const updateParams = useCallback(
      (updates: Record<string, string | string[] | null>) => {
        const params = new URLSearchParams(searchParams.toString())

        for (const [key, value] of Object.entries(updates)) {
          params.delete(key)
          if (value === null) continue
          if (Array.isArray(value)) {
            for (const item of value) {
              params.append(key, item)
            }
          } else {
            params.set(key, value)
          }
        }

        if (!("page" in updates)) {
          params.delete("page")
        }

        const nextQuery = params.toString()
        router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
      },
      [pathname, router, searchParams]
    )

    const toggleCategory = useCallback(
      (category: string) => {
        const nextCategories = selectedCategories.includes(category)
          ? selectedCategories.filter((item) => item !== category)
          : [...selectedCategories, category]

        updateParams({ category: nextCategories.length > 0 ? nextCategories : null })
      },
      [selectedCategories, updateParams]
    )

    const toggleCondition = useCallback(
      (condition: ProductCondition) => {
        updateParams({ condition: selectedCondition === condition ? null : condition })
      },
      [selectedCondition, updateParams]
    )

    const filteredProducts = useMemo(() => {
      const nextProducts = products.filter((product) => {
        const searchMatch = !query.trim() || matchesStorefrontQuery(product, query)
        const brandMatch = !selectedBrand || product.brand === selectedBrand
        const conditionMatch = !selectedCondition || product.condition === selectedCondition
        const effectiveMax = priceRange[1] >= PRICE_ABSOLUTE_MAX ? Infinity : priceRange[1]
        const priceMatch = product.price >= priceRange[0] && product.price <= effectiveMax

        return searchMatch && brandMatch && conditionMatch && priceMatch
      })

      switch (sort) {
        case "price-asc":
          return [...nextProducts].sort((left, right) => left.price - right.price)
        case "price-desc":
          return [...nextProducts].sort((left, right) => right.price - left.price)
        case "newest":
          return [...nextProducts].reverse()
        default:
          return nextProducts
      }
    }, [priceRange, products, query, selectedBrand, selectedCondition, sort])

    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
    const safePage = Math.min(currentPage, totalPages)
    const paginatedProducts = filteredProducts.slice(
      (safePage - 1) * ITEMS_PER_PAGE,
      safePage * ITEMS_PER_PAGE
    )

    const activeFilters = useMemo(() => {
      const chips: Array<{ label: string; onRemove: () => void }> = []

      if (query.trim()) {
        chips.push({ label: `Search: ${query}`, onRemove: () => updateParams({ q: null }) })
      }

      for (const category of selectedCategories) {
        chips.push({ label: category, onRemove: () => toggleCategory(category) })
      }

      if (selectedBrand) {
        chips.push({ label: selectedBrand, onRemove: () => updateParams({ brand: null }) })
      }

      if (selectedCondition) {
        chips.push({
          label: selectedCondition === "new" ? "New" : "Refurbished",
          onRemove: () => updateParams({ condition: null }),
        })
      }

      if (selectedColor) {
        chips.push({ label: selectedColor, onRemove: () => updateParams({ color: null }) })
      }

      const hasMinPrice = priceRange[0] > 0
      const hasMaxPrice = priceRange[1] < PRICE_ABSOLUTE_MAX
      if (hasMinPrice || hasMaxPrice) {
        const label = hasMinPrice && hasMaxPrice
          ? `GHC ${priceRange[0].toLocaleString()} – ${priceRange[1].toLocaleString()}`
          : hasMinPrice
          ? `From GHC ${priceRange[0].toLocaleString()}`
          : `Up to GHC ${priceRange[1].toLocaleString()}`
        chips.push({
          label,
          onRemove: () => updateParams({ minPrice: null, maxPrice: null }),
        })
      }

      return chips
    }, [query, selectedBrand, selectedCategories, selectedColor, selectedCondition, toggleCategory, updateParams])

    const filterControls = (
      <>
        <div>
          <h2 className="font-display text-3xl uppercase tracking-tight text-foreground">Catalog Filters</h2>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">Category</p>
          <div className="space-y-3 text-sm text-foreground">
            {categories.map((category) => (
              <label key={category} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="accent-primary"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">Brand</p>
          <div className="space-y-3 text-sm text-foreground">
            {brands.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === brand}
                  onChange={() => updateParams({ brand })}
                  className="accent-primary"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">Price Range</p>

          {/* Dual range slider */}
          <div className="relative px-1">
            {/* Track fill */}
            <div className="relative h-1 rounded-full bg-surface-high">
              <div
                className="absolute h-1 rounded-full bg-primary"
                style={{
                  left: `${(localMin / priceCeiling) * 100}%`,
                  right: `${100 - (localMax / priceCeiling) * 100}%`,
                }}
              />
            </div>
            {/* Min thumb */}
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={100}
              value={localMin}
              onChange={(e) => {
                const v = Math.min(Number(e.target.value), localMax - 100)
                setLocalMin(v)
                setMinInput(v === 0 ? "" : String(v))
              }}
              onMouseUp={() => commitPriceRange(localMin, localMax)}
              onTouchEnd={() => commitPriceRange(localMin, localMax)}
              className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent accent-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary"
            />
            {/* Max thumb */}
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={100}
              value={localMax}
              onChange={(e) => {
                const v = Math.max(Number(e.target.value), localMin + 100)
                setLocalMax(v)
                setMaxInput(v >= priceCeiling ? "" : String(v))
              }}
              onMouseUp={() => commitPriceRange(localMin, localMax)}
              onTouchEnd={() => commitPriceRange(localMin, localMax)}
              className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent accent-primary [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary"
            />
          </div>

          {/* Custom input fields */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-content-muted">Min (GHC)</label>
              <input
                type="number"
                min={0}
                max={priceCeiling}
                step={100}
                value={minInput}
                placeholder="0"
                onChange={(e) => setMinInput(e.target.value)}
                onBlur={() => {
                  const v = minInput === "" ? 0 : Math.max(0, Math.min(Number(minInput), localMax - 100))
                  setLocalMin(v)
                  setMinInput(v === 0 ? "" : String(v))
                  commitPriceRange(v, localMax)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur()
                }}
                className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
              />
            </div>
            <span className="mt-4 text-content-muted">–</span>
            <div className="flex-1">
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-content-muted">Max (GHC)</label>
              <input
                type="number"
                min={0}
                max={priceCeiling}
                step={100}
                value={maxInput}
                placeholder="Any"
                onChange={(e) => setMaxInput(e.target.value)}
                onBlur={() => {
                  const raw = maxInput === "" ? priceCeiling : Number(maxInput)
                  const v = Math.min(priceCeiling, Math.max(raw, localMin + 100))
                  setLocalMax(v)
                  setMaxInput(v >= priceCeiling ? "" : String(v))
                  commitPriceRange(localMin, v)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur()
                }}
                className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">Condition</p>
          <div className="flex flex-wrap gap-2">
            {(["new", "refurbished"] as const).map((condition) => (
              <button
                key={condition}
                type="button"
                onClick={() => toggleCondition(condition)}
                className={
                  selectedCondition === condition
                    ? "rounded-sm bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white"
                    : "rounded-sm bg-surface-high px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-content-secondary"
                }
              >
                {condition === "new" ? "New" : "Refurbished"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">Colorway</p>
          <div className="flex gap-3">
            {swatches.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => updateParams({ color: selectedColor === swatch.label ? null : swatch.label })}
                aria-label={`Color ${swatch.label}`}
                className={
                  selectedColor === swatch.label
                    ? "size-6 rounded-full border-2 border-primary"
                    : "size-6 rounded-full border border-white/10"
                }
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
          </div>
        </div>
      </>
    )

    function clearAll() {
      router.push(pathname, { scroll: false })
    }

    return (
      <MotionPage className="flex flex-col gap-8 py-8 md:flex-row md:gap-12 md:py-12">
        <aside className="hidden w-full max-w-[260px] shrink-0 space-y-10 md:block">{filterControls}</aside>

        <section className="min-w-0 flex-1">
          <MotionSection className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center md:mb-10 md:gap-6">
            <div>
              <h1 className="font-display text-3xl uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
                Premium Inventory
              </h1>
              <p className="mt-2 text-sm text-content-secondary">
                Showing {paginatedProducts.length} of {filteredProducts.length} high-precision devices
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-surface-low px-4 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-foreground md:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filters
              </button>

              <div className="flex items-center rounded-lg bg-surface-low">
                <span className="pl-4 text-[10px] font-bold uppercase tracking-[0.15em] text-content-secondary">Sort by</span>
                <select
                  value={sort}
                  onChange={(event) => updateParams({ sort: event.target.value === "featured" ? null : event.target.value })}
                  className="border-none bg-transparent px-3 py-2.5 text-xs font-bold text-foreground outline-none [&>option]:bg-neutral-900 [&>option]:text-white"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low-High</option>
                  <option value="price-desc">Price: High-Low</option>
                  <option value="newest">Newest Arrivals</option>
                </select>
              </div>
            </div>
          </MotionSection>

          <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <DialogContent className="top-auto bottom-0 left-0 right-0 max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-3xl border border-border bg-background p-0 md:hidden">
              <DialogHeader className="border-b border-border px-5 py-4">
                <DialogTitle className="text-base font-black uppercase tracking-[0.16em] text-foreground">Filters</DialogTitle>
                <DialogDescription>
                  Refine the catalog for mobile screens without keeping the full filter rail open.
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-[75dvh] space-y-8 overflow-y-auto px-5 py-5">{filterControls}</div>
            </DialogContent>
          </Dialog>

          {activeFilters.length > 0 ? (
            <MotionSection className="mb-8 flex flex-wrap items-center gap-2" delay={0.04}>
              {activeFilters.map((filter) => (
                <button
                  key={filter.label}
                  type="button"
                  onClick={filter.onRemove}
                  className="inline-flex items-center gap-2 rounded-full bg-surface-high px-3 py-1.5 transition-colors hover:bg-surface-bright"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">{filter.label}</span>
                  <X className="size-3 text-content-secondary" />
                </button>
              ))}
              <button
                type="button"
                onClick={clearAll}
                className="ml-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary hover:underline"
              >
                Clear All
              </button>
            </MotionSection>
          ) : null}

          <MotionList className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.slug} product={product} showHoverCart />
            ))}
          </MotionList>

          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-display text-3xl uppercase text-content-secondary">No devices found</p>
              <p className="mt-2 text-sm text-content-muted">
                {query.trim() ? `Try a broader search than "${query}" or remove some filters.` : "Try adjusting your filters."}
              </p>
            </div>
          ) : null}

          {totalPages > 1 ? (
            <MotionSection className="mt-16 flex items-center justify-center gap-2" delay={0.08}>
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => updateParams({ page: String(safePage - 1) })}
                className="flex size-10 items-center justify-center bg-surface-low text-content-secondary disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => updateParams({ page: page === 1 ? null : String(page) })}
                  className={
                    page === safePage
                      ? "flex size-10 items-center justify-center bg-primary text-xs font-bold text-white"
                      : "flex size-10 items-center justify-center bg-surface-low text-xs font-bold text-foreground hover:bg-surface-high"
                  }
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => updateParams({ page: String(safePage + 1) })}
                className="flex size-10 items-center justify-center bg-surface-low text-content-secondary disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </MotionSection>
          ) : null}
        </section>
      </MotionPage>
    )
  }
