"use client"

import { useMemo, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { MotionList, MotionPage, MotionSection } from "./motion-primitives"
import { ProductCard } from "./product-card"
import { products } from "@/lib/storefront-data"
import type { ProductCondition, SortOption } from "@/lib/storefront-types"

const categories = ["Smartphones", "Tablets", "Laptops", "Wearables"] as const
const brands = ["Apple", "Samsung"] as const
const swatches = [
  { hex: "#171717", label: "Black" },
  { hex: "#A3A3A3", label: "Silver" },
  { hex: "#1D4ED8", label: "Blue" },
  { hex: "#991B1B", label: "Red" },
]

const ITEMS_PER_PAGE = 16

export function ShopPageClient() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000])
  const [sort, setSort] = useState<SortOption>("featured")
  const [currentPage, setCurrentPage] = useState(1)

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
    setCurrentPage(1)
  }, [])

  const toggleCondition = useCallback((condition: ProductCondition) => {
    setSelectedCondition((prev) => (prev === condition ? null : condition))
    setCurrentPage(1)
  }, [])

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      const brandMatch = !selectedBrand || product.brand === selectedBrand
      const conditionMatch = !selectedCondition || product.condition === selectedCondition
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1]
      return brandMatch && conditionMatch && priceMatch
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
  }, [selectedBrand, selectedCondition, priceRange, sort])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const activeFilters: { label: string; onRemove: () => void }[] = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = []

    for (const cat of selectedCategories) {
      chips.push({ label: cat, onRemove: () => toggleCategory(cat) })
    }

    if (selectedBrand) {
      chips.push({ label: selectedBrand, onRemove: () => { setSelectedBrand(null); setCurrentPage(1) } })
    }

    if (selectedCondition) {
      chips.push({
        label: selectedCondition === "new" ? "New" : "Refurbished",
        onRemove: () => { setSelectedCondition(null); setCurrentPage(1) },
      })
    }

    if (selectedColor) {
      chips.push({ label: selectedColor, onRemove: () => setSelectedColor(null) })
    }

    return chips
  }, [selectedCategories, selectedBrand, selectedCondition, selectedColor, toggleCategory])

  function clearAll() {
    setSelectedCategories([])
    setSelectedBrand(null)
    setSelectedCondition(null)
    setSelectedColor(null)
    setPriceRange([0, 15000])
    setCurrentPage(1)
  }

  return (
    <MotionPage className="flex flex-col gap-12 py-12 md:flex-row">
      <aside className="w-full max-w-[260px] shrink-0 space-y-10">
        <div>
          <h2 className="font-display text-3xl uppercase tracking-tight text-foreground">
            Catalog Filters
          </h2>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Category
          </p>
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
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Brand
          </p>
          <div className="space-y-3 text-sm text-foreground">
            {brands.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-3">
                <input
                  type="radio"
                  name="brand"
                  checked={selectedBrand === brand}
                  onChange={() => { setSelectedBrand(brand); setCurrentPage(1) }}
                  className="accent-primary"
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Price Range
          </p>
          <div className="px-1">
            <input
              type="range"
              min={0}
              max={15000}
              step={100}
              value={priceRange[1]}
              onChange={(e) => {
                setPriceRange([priceRange[0], Number(e.target.value)])
                setCurrentPage(1)
              }}
              className="w-full accent-primary"
            />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-content-secondary">
              <span>GHC {priceRange[0].toLocaleString()}</span>
              <span>GHC {priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Condition
          </p>
          <div className="flex gap-2">
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
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Colorway
          </p>
          <div className="flex gap-3">
            {swatches.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                onClick={() => setSelectedColor(selectedColor === swatch.label ? null : swatch.label)}
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
      </aside>

      <section className="min-w-0 flex-1">
        <MotionSection className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-5xl uppercase tracking-tight text-foreground">
              Premium Inventory
            </h1>
            <p className="mt-2 text-sm text-content-secondary">
              Showing {paginatedProducts.length} of {filteredProducts.length} high-precision devices
            </p>
          </div>
          <div className="flex items-center rounded-lg bg-surface-low">
            <span className="pl-4 text-[10px] font-bold uppercase tracking-[0.15em] text-content-secondary">Sort by</span>
            <select
              value={sort}
              onChange={(event) => { setSort(event.target.value as SortOption); setCurrentPage(1) }}
              className="border-none bg-transparent px-3 py-2.5 text-xs font-bold text-foreground outline-none [&>option]:bg-neutral-900 [&>option]:text-white"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </MotionSection>

        {activeFilters.length > 0 ? (
          <MotionSection className="mb-8 flex flex-wrap items-center gap-2" delay={0.04}>
            {activeFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={filter.onRemove}
                className="inline-flex items-center gap-2 rounded-full bg-surface-high px-3 py-1.5 transition-colors hover:bg-surface-bright"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                  {filter.label}
                </span>
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

        <MotionList className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.slug} product={product} showHoverCart />
          ))}
        </MotionList>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-3xl uppercase text-content-secondary">No devices found</p>
            <p className="mt-2 text-sm text-content-muted">Try adjusting your filters</p>
          </div>
        ) : null}

        {totalPages > 1 ? (
          <MotionSection className="mt-16 flex items-center justify-center gap-2" delay={0.08}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="flex size-10 items-center justify-center bg-surface-low text-content-secondary disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={
                  page === currentPage
                    ? "flex size-10 items-center justify-center bg-primary text-xs font-bold text-white"
                    : "flex size-10 items-center justify-center bg-surface-low text-xs font-bold text-foreground hover:bg-surface-high"
                }
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
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
