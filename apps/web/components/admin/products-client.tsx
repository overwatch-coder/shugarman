"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Search, Trash2, Pencil } from "lucide-react"
import type { ProductDoc } from "@/lib/schemas"
import { deleteProduct } from "@/lib/actions/products"
import { ConfirmDialog } from "./confirm-dialog"

export function ProductsClient({
  initialProducts,
}: {
  initialProducts: ProductDoc[]
}) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = initialProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  )

  function handleDeleteConfirm() {
    if (!deletingSlug) return
    startTransition(async () => {
      await deleteProduct(deletingSlug)
      setDeletingSlug(null)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Products</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {initialProducts.length} products in catalog
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-white/8 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
        />
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-white/6 bg-[#141414]">
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-neutral-500">
            {search ? "No products match your search." : "No products yet. Add your first product."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/6 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Brand</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Condition</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr
                    key={product.slug}
                    className="border-b border-white/4 last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.imageAlt}
                            className="size-10 rounded-lg bg-white/5 object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white">{product.name}</p>
                          <p className="truncate text-xs text-neutral-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-neutral-400">{product.brand}</td>
                    <td className="px-5 py-3 font-mono text-white">
                      {product.currency} {product.price.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          product.condition === "new"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {product.condition}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex size-2 rounded-full ${
                          product.inStock ? "bg-emerald-400" : "bg-red-400"
                        }`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/${product.slug}/edit`}
                          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeletingSlug(product.slug)}
                          disabled={isPending}
                          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deletingSlug}
        onOpenChange={(open) => { if (!open) setDeletingSlug(null) }}
        title="Delete product?"
        description={`"${deletingSlug}" will be permanently removed from the catalog. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
