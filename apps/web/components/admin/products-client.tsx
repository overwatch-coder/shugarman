"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { ProductDoc } from "@/lib/schemas"
import { deleteProduct, updateProductPublished } from "@/lib/actions/products"
import { getPaginationItems } from "@/lib/admin/product-editor-helpers"
import { ConfirmDialog } from "./confirm-dialog"

const ITEMS_PER_PAGE = 20

type VisibilityFilter = "all" | "published" | "draft"
type StockFilter = "all" | "in-stock" | "out-of-stock"
type ConditionFilter = "all" | ProductDoc["condition"]

export function ProductsClient({
  initialProducts,
}: {
  initialProducts: ProductDoc[]
}) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>("all")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>("all")
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [visibilityProduct, setVisibilityProduct] = useState<ProductDoc | null>(null)
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    setPage(1)
  }, [conditionFilter, search, stockFilter, visibilityFilter])

  const filtered = products.filter((p) => {
    const normalizedSearch = search.toLowerCase()
    const matchesSearch =
      p.name.toLowerCase().includes(normalizedSearch) ||
      (p.brand ?? "").toLowerCase().includes(normalizedSearch) ||
      p.slug.toLowerCase().includes(normalizedSearch)
    const matchesVisibility =
      visibilityFilter === "all" ||
      (visibilityFilter === "published" ? p.published : !p.published)
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "in-stock" ? p.inStock : !p.inStock)
    const matchesCondition = conditionFilter === "all" || p.condition === conditionFilter

    return matchesSearch && matchesVisibility && matchesStock && matchesCondition
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginationItems = useMemo(
    () => getPaginationItems({ currentPage, totalPages }),
    [currentPage, totalPages]
  )
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const showPagination = filtered.length > ITEMS_PER_PAGE
  const hasActiveFilters =
    !!search || visibilityFilter !== "all" || stockFilter !== "all" || conditionFilter !== "all"

  function handleDeleteConfirm() {
    if (!deletingSlug) return
    startTransition(async () => {
      const result = await deleteProduct(deletingSlug)
      if (result.success) {
        toast.success("Product deleted.")
        setProducts((prev) => prev.filter((product) => product.slug !== deletingSlug))
        setDeletingSlug(null)
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to delete product.")
      }
    })
  }

  function updateVisibility(product: ProductDoc, nextPublished: boolean) {
    setUpdatingSlug(product.slug)
    startTransition(async () => {
      const result = await updateProductPublished(product.slug, nextPublished)
      if (result.success) {
        setProducts((prev) =>
          prev.map((entry) =>
            entry.slug === product.slug ? { ...entry, published: nextPublished } : entry
          )
        )
        toast.success(nextPublished ? "Product published." : "Product moved to draft.")
        setVisibilityProduct(null)
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to update product visibility.")
      }
      setUpdatingSlug(null)
    })
  }

  function handleVisibilityClick(product: ProductDoc) {
    if (product.published) {
      setVisibilityProduct(product)
      return
    }

    updateVisibility(product, true)
  }

  function handleDraftConfirm() {
    if (!visibilityProduct) return
    updateVisibility(visibilityProduct, false)
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Products</h1>
          <p className="mt-1 text-sm text-content-secondary">
            {products.length} products in catalog
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

      {/* Search and filters */}
      <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-secondary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
        />
      </div>
        <select
          value={visibilityFilter}
          onChange={(e) => setVisibilityFilter(e.target.value as VisibilityFilter)}
          className="min-w-40 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
          aria-label="Filter by publish status"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="min-w-40 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
          aria-label="Filter by stock status"
        >
          <option value="all">All stock</option>
          <option value="in-stock">In stock</option>
          <option value="out-of-stock">Out of stock</option>
        </select>
        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value as ConditionFilter)}
          className="min-w-40 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
          aria-label="Filter by condition"
        >
          <option value="all">All conditions</option>
          <option value="new">New</option>
          <option value="refurbished">Refurbished</option>
        </select>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-content-secondary">
            {hasActiveFilters ? "No products match your search or filters." : "No products yet. Add your first product."}
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-3 md:hidden">
              {paginatedProducts.map((product) => (
                <article key={product.slug} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.imageAlt}
                        className="size-16 rounded-xl bg-surface-high object-cover"
                      />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{product.name}</p>
                      <p className="mt-1 truncate text-xs text-content-secondary">{product.slug}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-content-secondary">
                        <span>{product.brand}</span>
                        <span>•</span>
                        <span>
                          {product.currency} {product.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          product.condition === "new"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {product.condition}
                      </span>
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          product.published
                            ? "bg-sky-500/10 text-sky-500"
                            : "bg-zinc-500/10 text-content-secondary"
                        }`}
                      >
                        {product.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleVisibilityClick(product)}
                        disabled={isPending || updatingSlug === product.slug}
                        className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
                        aria-label={product.published ? "Move product to draft" : "Publish product"}
                        title={product.published ? "Move to draft" : "Publish"}
                      >
                        {product.published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                      <Link
                        href={`/admin/products/${product.slug}/edit`}
                        className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeletingSlug(product.slug)}
                        disabled={isPending}
                        className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                  <th className="px-5 py-3 whitespace-nowrap">Product</th>
                  <th className="px-5 py-3 whitespace-nowrap">Brand</th>
                  <th className="px-5 py-3 whitespace-nowrap">Price</th>
                  <th className="px-5 py-3 whitespace-nowrap">Condition</th>
                  <th className="px-5 py-3 whitespace-nowrap">Status</th>
                  <th className="px-5 py-3 whitespace-nowrap">Stock</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr
                    key={product.slug}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.imageAlt}
                            className="size-10 rounded-lg bg-surface object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{product.name}</p>
                          <p className="truncate text-xs text-content-secondary">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-content-secondary">{product.brand}</td>
                    <td className="px-5 py-3 font-mono text-foreground">
                      {product.currency} {product.price.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          product.condition === "new"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        }`}
                      >
                        {product.condition}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          product.published
                            ? "bg-sky-500/10 text-sky-500"
                            : "bg-zinc-500/10 text-content-secondary"
                        }`}
                      >
                        {product.published ? "Published" : "Draft"}
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
                        <button
                          onClick={() => handleVisibilityClick(product)}
                          disabled={isPending || updatingSlug === product.slug}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                            product.published
                              ? "border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/15"
                              : "border-sky-500/20 bg-sky-500/10 text-sky-500 hover:bg-sky-500/15"
                          }`}
                          aria-label={product.published ? "Move product to draft" : "Publish product"}
                          title={product.published ? "Move to draft" : "Publish"}
                        >
                          {product.published ? "Move to draft" : "Publish"}
                        </button>
                        <Link
                          href={`/admin/products/${product.slug}/edit`}
                          className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeletingSlug(product.slug)}
                          disabled={isPending}
                          className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
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
            {showPagination && (
              <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-content-secondary">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-content-secondary transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  {paginationItems.map((item) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setPage(item)}
                        className={`inline-flex size-8 items-center justify-center rounded-lg border text-xs font-bold transition-colors ${
                          item === currentPage
                            ? "border-primary bg-primary text-white"
                            : "border-border text-content-secondary hover:bg-accent hover:text-foreground"
                        }`}
                        aria-current={item === currentPage ? "page" : undefined}
                      >
                        {item}
                      </button>
                    ) : (
                      <span
                        key={item}
                        className="inline-flex size-8 items-center justify-center text-xs font-bold text-content-muted"
                      >
                        ...
                      </span>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border text-content-secondary transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </>
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
      <ConfirmDialog
        open={!!visibilityProduct}
        onOpenChange={(open) => { if (!open) setVisibilityProduct(null) }}
        title="Move product to draft?"
        description={`"${visibilityProduct?.name ?? ""}" will be hidden from the storefront and remain visible only in admin products.`}
        confirmLabel="Move to Draft"
        onConfirm={handleDraftConfirm}
      />
    </div>
  )
}
