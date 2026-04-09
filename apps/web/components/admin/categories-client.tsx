"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, X, Check } from "lucide-react"
import type { CategoryDoc } from "@/lib/schemas"
import { saveCategory, deleteCategory } from "@/lib/actions/categories"
import { ConfirmDialog } from "./confirm-dialog"

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

const EMPTY: CategoryDoc = { slug: "", name: "", order: 0 }

export function CategoriesClient({
  initialCategories,
}: {
  initialCategories: CategoryDoc[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<CategoryDoc>(EMPTY)
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function startAdd() {
    setForm(EMPTY)
    setEditingSlug(null)
    setShowAdd(true)
    setError(null)
  }

  function startEdit(cat: CategoryDoc) {
    setForm({ ...cat })
    setEditingSlug(cat.slug)
    setShowAdd(true)
    setError(null)
  }

  function cancelForm() {
    setShowAdd(false)
    setEditingSlug(null)
    setForm(EMPTY)
    setError(null)
  }

  function handleSave() {
    const slug = editingSlug ?? slugify(form.name)
    if (!slug || !form.name.trim()) {
      setError("Name is required.")
      return
    }
    startTransition(async () => {
      const result = await saveCategory({ ...form, slug })
      if (result.success) {
        cancelForm()
        router.refresh()
      } else {
        setError(result.error ?? "Save failed.")
      }
    })
  }

  function handleDeleteConfirm() {
    if (!deletingSlug) return
    startTransition(async () => {
      await deleteCategory(deletingSlug)
      setDeletingSlug(null)
      router.refresh()
    })
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Categories</h1>
          <p className="mt-1 text-sm text-content-secondary">
            {initialCategories.length} categories
          </p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Add Category
        </button>
      </div>

      {/* Add / Edit Form */}
      {showAdd && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-bold text-foreground">
            {editingSlug ? "Edit Category" : "New Category"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-content-secondary">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Smartphones"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-secondary">
                Display Order
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
              />
            </div>
          </div>
          {!editingSlug && form.name && (
            <p className="mt-2 text-xs text-content-secondary">
              Slug: <span className="font-mono text-content-secondary">{slugify(form.name)}</span>
            </p>
          )}
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Check className="size-3.5" />
              {editingSlug ? "Save Changes" : "Create Category"}
            </button>
            <button
              onClick={cancelForm}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="size-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {initialCategories.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-content-secondary">
            No categories yet. Add your first category.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialCategories.map((cat) => (
                <tr key={cat.slug} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">{cat.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-content-secondary">{cat.slug}</td>
                  <td className="px-5 py-3 text-content-secondary">{cat.order}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingSlug(cat.slug)}
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
        )}
      </div>

      <ConfirmDialog
        open={!!deletingSlug}
        onOpenChange={(open) => { if (!open) setDeletingSlug(null) }}
        title="Delete category?"
        description={`"${deletingSlug}" will be permanently deleted. Products using this category will keep their existing category value.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
