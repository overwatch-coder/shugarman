"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

import { MotionList, MotionPage, MotionSection } from "./motion-primitives"
import { ProductCard } from "./product-card"
import { products } from "@/lib/storefront-data"
import type { ProductCondition, SortOption } from "@/lib/storefront-types"

const categories = ["Smartphones", "Tablets", "Laptops", "Wearables"]
const brands = ["Apple", "Samsung"]
const swatches = ["#171717", "#A3A3A3", "#1D4ED8", "#991B1B"]

export function ShopPageClient() {
  const [selectedBrand, setSelectedBrand] = useState<string>("Apple")
  const [selectedCondition, setSelectedCondition] = useState<ProductCondition>("new")
  const [sort, setSort] = useState<SortOption>("featured")

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      const brandMatch = !selectedBrand || product.brand === selectedBrand
      const conditionMatch = !selectedCondition || product.condition === selectedCondition

      return brandMatch && conditionMatch
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
  }, [selectedBrand, selectedCondition, sort])

  const activeFilters = ["Smartphones", selectedBrand, selectedCondition === "new" ? "New" : "Refurbished"]

  return (
    <MotionPage className="flex flex-col gap-12 py-12 md:flex-row">
      <aside className="w-full max-w-[290px] shrink-0 space-y-10">
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
            {categories.map((category, index) => (
              <label key={category} className="flex cursor-pointer items-center gap-3">
                <input type="checkbox" defaultChecked={index === 0} className="accent-primary" />
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
                  onChange={() => setSelectedBrand(brand)}
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
            <input type="range" defaultValue={40} className="w-full accent-primary" />
            <div className="mt-2 flex justify-between font-mono text-[10px] text-content-secondary">
              <span>GHC 0</span>
              <span>GHC 25,000</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Condition
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSelectedCondition("new")}
              className={selectedCondition === "new" ? "rounded-sm bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white" : "rounded-sm bg-surface-high px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-content-secondary"}
            >
              New
            </button>
            <button
              type="button"
              onClick={() => setSelectedCondition("refurbished")}
              className={selectedCondition === "refurbished" ? "rounded-sm bg-primary px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white" : "rounded-sm bg-surface-high px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-content-secondary"}
            >
              Refurbished
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <p className="font-label text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Colorway
          </p>
          <div className="flex gap-3">
            {swatches.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-label={`Color ${swatch}`}
                className="size-6 rounded-full border border-white/10"
                style={{ backgroundColor: swatch }}
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
              Showing {filteredProducts.length} of {products.length} high-precision devices
            </p>
          </div>
          <div className="rounded-lg bg-surface-low p-1.5">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="border-none bg-transparent px-3 py-2 text-xs font-bold text-foreground outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low-High</option>
              <option value="price-desc">Price: High-Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </MotionSection>

        <MotionSection className="mb-8 flex flex-wrap items-center gap-2" delay={0.04}>
          {activeFilters.map((filter) => (
            <div
              key={filter}
              className="inline-flex items-center gap-2 rounded-full bg-surface-high px-3 py-1.5"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
                {filter}
              </span>
              <X className="size-3 text-content-secondary" />
            </div>
          ))}
          <button type="button" className="ml-2 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
            Clear All
          </button>
        </MotionSection>

        <MotionList className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} showCartAction={false} />
          ))}
        </MotionList>

        <MotionSection className="mt-16 flex items-center justify-center gap-3" delay={0.08}>
          <button type="button" className="flex size-10 items-center justify-center bg-surface-low text-content-secondary">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" className="flex size-10 items-center justify-center bg-primary text-xs font-bold text-white">
            1
          </button>
          <button type="button" className="flex size-10 items-center justify-center bg-surface-low text-xs font-bold text-foreground">
            2
          </button>
          <button type="button" className="flex size-10 items-center justify-center bg-surface-low text-xs font-bold text-foreground">
            3
          </button>
          <button type="button" className="flex size-10 items-center justify-center bg-surface-low text-content-secondary">
            <ChevronRight className="size-4" />
          </button>
        </MotionSection>
      </section>
    </MotionPage>
  )
}
