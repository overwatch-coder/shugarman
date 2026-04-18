"use client"

import { useState, useTransition } from "react"
import { X } from "lucide-react"
import type { ProductDoc, ProductCondition } from "@/lib/schemas"
import { saveProduct } from "@/lib/actions/products"

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

const EMPTY_PRODUCT: ProductDoc = {
  slug: "",
  name: "",
  brand: "",
  price: 0,
  currency: "GHC",
  condition: "new",
  subtitle: "",
  category: "smartphones",
  image: "",
  imageAlt: "",
  badge: "",
  inStock: true,
  featured: false,
  rating: 0,
  reviewCount: 0,
  colors: [],
  storageOptions: [],
  images: [],
  specs: [],
  installment: null,
  relatedSlugs: [],
  createdAt: "",
  updatedAt: "",
}

export function ProductFormModal({
  product,
  onClose,
}: {
  product: ProductDoc | null
  onClose: () => void
}) {
  const isEdit = !!product
  const [form, setForm] = useState<ProductDoc>(product ?? EMPTY_PRODUCT)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof ProductDoc>(key: K, value: ProductDoc[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      // Auto-generate slug from name when creating
      ...(key === "name" && !isEdit ? { slug: slugify(value as string) } : {}),
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.name.trim() || !form.slug.trim() || !form.category.trim()) {
      setError("Name, slug, and category are required.")
      return
    }
    if (form.price <= 0) {
      setError("Price must be greater than zero.")
      return
    }

    startTransition(async () => {
      const result = await saveProduct(form)
      if (result.success) {
        onClose()
      } else {
        setError(result.error ?? "Save failed")
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-[5vh]">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl rounded-2xl border border-white/8 bg-[#141414] p-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <h2 className="text-lg font-bold text-white">
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Name */}
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Product Name *
            </span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="iPhone 15 Pro Max"
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Slug */}
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Slug *
            </span>
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
              disabled={isEdit}
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none disabled:opacity-50 placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Brand */}
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Brand
            </span>
            <input
              value={form.brand}
              onChange={(e) => update("brand", e.target.value)}
              placeholder="Apple"
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Price */}
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Price (GHC) *
            </span>
            <input
              type="number"
              value={form.price || ""}
              onChange={(e) => update("price", Number(e.target.value))}
              min={0}
              step={0.01}
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Subtitle */}
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Subtitle
            </span>
            <input
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="Brand New / Unlocked"
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Condition */}
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Condition
            </span>
            <select
              value={form.condition}
              onChange={(e) => update("condition", e.target.value as ProductCondition)}
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50"
            >
              <option value="new">New</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </label>

          {/* Category */}
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Category *
            </span>
            <input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="smartphones"
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Image URL */}
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Image URL
            </span>
            <input
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Image Alt */}
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Image Alt Text
            </span>
            <input
              value={form.imageAlt}
              onChange={(e) => update("imageAlt", e.target.value)}
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Badge */}
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Badge
            </span>
            <input
              value={form.badge ?? ""}
              onChange={(e) => update("badge", e.target.value || undefined)}
              placeholder="New, -15%, Hot"
              className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
            />
          </label>

          {/* Toggles */}
          <div className="flex items-center gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => update("inStock", e.target.checked)}
                className="size-4 rounded border-white/20 bg-white/5 accent-primary"
              />
              <span className="text-sm text-neutral-300">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
                className="size-4 rounded border-white/20 bg-white/5 accent-primary"
              />
              <span className="text-sm text-neutral-300">Featured</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  )
}
