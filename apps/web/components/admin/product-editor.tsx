"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  GripVertical,
  Check,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { AdminPageTitle } from "@/components/admin/admin-shell"
import { importAdminImageFromUrl } from "@/lib/actions/media"
import { uploadAdminImage } from "@/lib/admin-upload-client"
import type {
  ProductDoc,
  ProductCondition,
  ProductColor,
  ProductStorage,
  ProductImage,
  TechSpec,
  InstallmentPlan,
} from "@/lib/schemas"
import { saveProduct } from "@/lib/actions/products"
import {
  buildRelatedProductOptions,
  getNextCreateSlugState,
  selectPrimaryGalleryImage,
  slugify,
  toggleRelatedSlug,
} from "@/lib/admin/product-editor-helpers"
import { setColorImageIndex } from "@/lib/product-color-links"
import { queueSuccessToast } from "@/lib/toast-flash"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMPTY_INSTALLMENT: InstallmentPlan = {
  downPaymentPercent: 30,
  downPayment: 0,
  weeklyRate: 0,
  weeks: 12,
  totalPrice: 0,
  interestNote: "",
}

const EMPTY_PRODUCT: ProductDoc = {
  slug: "",
  name: "",
  brand: "",
  price: 0,
  currency: "GHC",
  condition: "new",
  subtitle: "",
  category: "",
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

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-content-secondary">
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-content-secondary">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-content-muted">{hint}</p>}
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"

// ─── Image uploader ───────────────────────────────────────────────────────────

interface ImageEntry {
  src: string
  alt: string
  previewSrc?: string
  uploading?: boolean
  progress?: number
}

function ImageGalleryEditor({
  images,
  onChange,
  onSetPrimary,
}: {
  images: ProductImage[]
  onChange: (imgs: ProductImage[]) => void
  onSetPrimary: (index: number) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [entries, setEntries] = useState<ImageEntry[]>(
    images.map((img) => ({ src: img.src, alt: img.alt }))
  )

  useEffect(() => {
    setEntries((prev) => {
      if (prev.some((entry) => entry.uploading)) {
        return prev
      }

      return images.map((img) => ({ src: img.src, alt: img.alt }))
    })
  }, [images])

  function syncUp(next: ImageEntry[]) {
    setEntries(next)
    onChange(next.filter((e) => !e.uploading).map((e) => ({ src: e.src, alt: e.alt })))
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const selectedFiles = Array.from(files)
    const placeholders = selectedFiles.map((file) => ({
      storageId: Date.now().toString(36) + Math.random().toString(36).slice(2),
      file,
      previewSrc: URL.createObjectURL(file),
      alt: file.name.replace(/\.[^.]+$/, ""),
    }))

    setEntries((prev) => [
      ...prev,
      ...placeholders.map((placeholder) => ({
        src: "",
        previewSrc: placeholder.previewSrc,
        alt: placeholder.alt,
        uploading: true,
        progress: 0,
      })),
    ])

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    for (const placeholder of placeholders) {
      try {
        const url = await uploadAdminImage(placeholder.file, "products")
        setEntries((prev) => {
          URL.revokeObjectURL(placeholder.previewSrc)
          const next = prev.map((entry) =>
            entry.previewSrc === placeholder.previewSrc
              ? { src: url, alt: entry.alt, uploading: false, progress: 100 }
              : entry
          )
          onChange(next.filter((e) => !e.uploading).map((e) => ({ src: e.src, alt: e.alt })))
          return next
        })
      } catch (err) {
        setEntries((prev) => {
          URL.revokeObjectURL(placeholder.previewSrc)
          const next = prev.filter((entry) => entry.previewSrc !== placeholder.previewSrc)
          onChange(next.filter((e) => !e.uploading).map((e) => ({ src: e.src, alt: e.alt })))
          return next
        })
        toast.error(err instanceof Error ? err.message : `Failed to upload ${placeholder.file.name}.`)
      }
    }

    if (fileRef.current) {
      fileRef.current.value = ""
    }
  }

  function updateAlt(idx: number, alt: string) {
    const next = entries.map((e, i) => (i === idx ? { ...e, alt } : e))
    syncUp(next)
  }

  function remove(idx: number) {
    const removedEntry = entries[idx]
    if (removedEntry?.previewSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(removedEntry.previewSrc)
    }
    const next = entries.filter((_, i) => i !== idx)
    syncUp(next)
  }

  async function addUrl(url: string) {
    const trimmedUrl = url.trim()
    if (!trimmedUrl) return

    const result = await importAdminImageFromUrl(trimmedUrl, "products")
    if (!result.success || !result.url) {
      toast.error(result.error ?? "Failed to import image URL.")
      return
    }

    const next = [...entries, { src: result.url, alt: "" }]
    syncUp(next)
  }

  const [urlInput, setUrlInput] = useState("")

  return (
    <div className="space-y-3">
      {/* Gallery grid */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface"
            >
              <div className="relative aspect-square">
                <img
                  src={entry.previewSrc ?? entry.src}
                  alt={entry.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain p-2"
                />
                {entry.uploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60">
                    <Loader2 className="size-5 animate-spin text-white" />
                    <span className="text-[10px] text-white">{entry.progress ?? 0}%</span>
                  </div>
                )}
                {!entry.uploading && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="absolute right-2 top-2 hidden rounded-md bg-black/80 p-1 text-white group-hover:flex"
                  >
                    <X className="size-3" />
                  </button>
                )}
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    Primary
                  </span>
                )}
                {!entry.uploading && idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(idx)}
                    className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary"
                  >
                    Set as primary
                  </button>
                )}
              </div>
              <input
                value={entry.alt}
                onChange={(e) => updateAlt(idx, e.target.value)}
                placeholder="Alt text"
                className="w-full border-t border-border bg-transparent px-2.5 py-1.5 text-[11px] text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
              />
            </div>
          ))}
        </div>
      )}

      {/* Add by URL */}
      <div className="flex gap-2">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Paste image URL…"
          className={inputCls + " flex-1"}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              void (async () => {
                await addUrl(urlInput)
                setUrlInput("")
              })()
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            void (async () => {
              await addUrl(urlInput)
              setUrlInput("")
            })()
          }}
          className="rounded-lg border border-border px-3 py-2 text-sm text-content-secondary hover:bg-accent hover:text-foreground"
        >
          Import URL
        </button>
      </div>

      {/* Upload from disk */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-content-secondary transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <Upload className="size-4" />
        Upload from device
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-[11px] text-content-muted">
        First image is the primary gallery image. Upload from device or import by URL, then promote any uploaded image to the first slot.
      </p>
    </div>
  )
}

// ─── Colours editor ───────────────────────────────────────────────────────────

function ColorEditor({
  colors,
  images,
  onChange,
}: {
  colors: ProductColor[]
  images: ProductImage[]
  onChange: (c: ProductColor[]) => void
}) {
  const [name, setName] = useState("")
  const [hex, setHex] = useState("#000000")

  function add() {
    if (!name.trim()) return
    onChange([...colors, { name, hex }])
    setName("")
    setHex("#000000")
  }

  function updateLinkedImage(colorName: string, value: string) {
    onChange(setColorImageIndex(colors, colorName, value === "" ? null : Number(value)))
  }

  return (
    <div className="space-y-3">
      {colors.length > 0 && (
        <div className="space-y-3">
          {colors.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-3.5 rounded-full border border-white/20"
                    style={{ background: c.hex }}
                  />
                  <div>
                    <span className="block text-xs text-foreground">{c.name}</span>
                    <span className="text-[10px] font-mono uppercase text-content-secondary">{c.hex}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(colors.filter((_, j) => j !== i))}
                  className="text-neutral-500 hover:text-red-400"
                >
                  <X className="size-3" />
                </button>
              </div>

              <div className="mt-3">
                <label className="mb-1.5 block text-[11px] font-medium text-content-secondary">
                  Linked storefront image
                </label>
                <select
                  value={typeof c.imageIndices?.[0] === "number" ? String(c.imageIndices[0]) : ""}
                  onChange={(e) => updateLinkedImage(c.name, e.target.value)}
                  className={inputCls}
                >
                  <option value="">No linked image</option>
                  {images.map((image, imageIndex) => (
                    <option key={`${image.src}-${imageIndex}`} value={String(imageIndex)}>
                      {`Image ${imageIndex + 1}${image.alt ? ` - ${image.alt}` : ""}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Colour name"
          className={inputCls + " flex-1"}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-surface px-1"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-border px-3 text-sm text-content-secondary hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Storage options editor ───────────────────────────────────────────────────

function StorageEditor({
  options = [],
  onChange,
}: {
  options?: ProductStorage[]
  onChange: (o: ProductStorage[]) => void
}) {
  const [label, setLabel] = useState("")
  const [value, setValue] = useState("")
  // Track whether the user has manually edited the value field
  const [valueEdited, setValueEdited] = useState(false)

  function handleLabelChange(next: string) {
    setLabel(next)
    // Keep value in sync with label until the user edits it manually
    if (!valueEdited) {
      setValue(next)
    }
  }

  function handleValueChange(next: string) {
    setValue(next)
    setValueEdited(true)
  }

  function add() {
    if (!label.trim()) return
    const resolvedValue = value.trim() || label.trim()
    onChange([...options, { label: label.trim(), value: resolvedValue }])
    setLabel("")
    setValue("")
    setValueEdited(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-content-secondary">
        Add the storage sizes available for this product. Each option appears as a selectable button on the product page.
      </p>

      {/* Existing options */}
      {options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((o, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
            >
              <div>
                <span className="block text-xs font-semibold text-foreground">{o.label}</span>
                {o.value !== o.label && (
                  <span className="block text-[10px] font-mono text-content-muted">{o.value}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => onChange(options.filter((_, j) => j !== i))}
                className="ml-1 text-content-muted hover:text-red-400"
                aria-label="Remove"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new option */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content-secondary">Add Storage Option</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">
              Display Label <span className="text-red-400">*</span>
            </label>
            <input
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="e.g. 256 GB"
              className={inputCls}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
            />
            <p className="mt-1 text-[11px] text-content-muted">What customers will see on the product page</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">
              Internal Value <span className="text-content-muted">(optional — edit to customise)</span>
            </label>
            <input
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="e.g. 256"
              className={inputCls}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
            />
            <p className="mt-1 text-[11px] text-content-muted">Auto-filled from the label — edit if you need a shorter identifier for filtering</p>
          </div>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!label.trim()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-3.5" />
          Add Storage Option
        </button>
      </div>
    </div>
  )
}

// ─── Specs editor ─────────────────────────────────────────────────────────────

function SpecsEditor({
  specs = [],
  onChange,
}: {
  specs?: TechSpec[]
  onChange: (s: TechSpec[]) => void
}) {
  const [label, setLabel] = useState("")
  const [value, setValue] = useState("")
  const [specError, setSpecError] = useState("")

  function add() {
    if (!label.trim() || !value.trim()) {
      setSpecError("Both the spec name and its value are required.")
      return
    }
    setSpecError("")
    onChange([...specs, { label: label.trim(), value: value.trim() }])
    setLabel("")
    setValue("")
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-content-secondary">
        List the technical details of this product (e.g. Display, Processor, Battery). These appear in the specs table on the product page.
      </p>

      {/* Existing specs */}
      {specs.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-content-secondary w-40 whitespace-nowrap">Spec Name</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-content-secondary whitespace-nowrap">Value</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {specs.map((s, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{s.label}</td>
                  <td className="px-4 py-2.5 text-xs text-content-secondary">{s.value}</td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onChange(specs.filter((_, j) => j !== i))}
                      className="text-content-muted hover:text-red-400"
                      aria-label="Remove"
                    >
                      <X className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Add new spec */}
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-content-secondary">Add Spec</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">
              Spec Name <span className="text-red-400">*</span>
            </label>
            <input
              value={label}
              onChange={(e) => { setLabel(e.target.value); setSpecError("") }}
              placeholder="e.g. Display"
              className={inputCls}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
            />
            <p className="mt-1 text-[11px] text-content-muted">The spec category — Battery, Processor, RAM…</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-content-secondary">
              Value <span className="text-red-400">*</span>
            </label>
            <input
              value={value}
              onChange={(e) => { setValue(e.target.value); setSpecError("") }}
              placeholder="e.g. 6.7″ Super Retina OLED"
              className={inputCls}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
            />
            <p className="mt-1 text-[11px] text-content-muted">The spec detail — 5000 mAh, A17 Pro, 8 GB…</p>
          </div>
        </div>
        {specError && <p className="mt-2 text-xs text-red-400">{specError}</p>}
        <button
          type="button"
          onClick={add}
          disabled={!label.trim() || !value.trim()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="size-3.5" />
          Add Spec
        </button>
      </div>
    </div>
  )
}

// ─── Main editor ──────────────────────────────────────────────────────────────

export function ProductEditor({
  product,
  categories,
  brands,
  allProducts,
}: {
  product: ProductDoc | null
  categories: { slug: string; name: string }[]
  brands: { slug: string; name: string }[]
  allProducts: { slug: string; name: string }[]
}) {
  const isEdit = !!product
  const router = useRouter()
  const [form, setForm] = useState<ProductDoc>(product ?? EMPTY_PRODUCT)
  const [hasInstallment, setHasInstallment] = useState(!!product?.installment)
  const [slugWasEdited, setSlugWasEdited] = useState(false)
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const relatedProductOptions = buildRelatedProductOptions(allProducts, product?.slug)

  function update<K extends keyof ProductDoc>(key: K, value: ProductDoc[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function handleNameChange(name: string) {
    setForm((prev) => {
      if (isEdit) {
        return { ...prev, name }
      }

      const nextSlugState = getNextCreateSlugState({
        nextName: name,
        currentSlug: prev.slug,
        slugWasEdited,
      })

      return {
        ...prev,
        name,
        slug: nextSlugState.slug,
      }
    })
  }

  function handleSlugChange(slug: string) {
    setSlugWasEdited(slug !== "" && slug !== slugify(form.name))
    update("slug", slug)
  }

  function handleRelatedProductToggle(slug: string) {
    update("relatedSlugs", toggleRelatedSlug(form.relatedSlugs, slug))
  }

  function handleGalleryChange(imgs: ProductImage[]) {
    setForm((prev) => {
      const nextPrimaryImage = imgs[0]
      const currentImageCameFromGallery = prev.images.some((image) => image.src === prev.image)

      return {
        ...prev,
        images: imgs,
        image: !prev.image || currentImageCameFromGallery ? (nextPrimaryImage?.src ?? "") : prev.image,
        imageAlt:
          !prev.image || currentImageCameFromGallery ? (nextPrimaryImage?.alt ?? "") : prev.imageAlt,
      }
    })
  }

  function handleSetPrimaryGalleryImage(selectedIndex: number) {
    setForm((prev) => ({
      ...prev,
      ...selectPrimaryGalleryImage({
        images: prev.images,
        colors: prev.colors,
        selectedIndex,
      }),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isSaving) return

    setError("")

    if (!form.name.trim() || !form.slug.trim() || !form.category.trim()) {
      setError("Name, slug, and category are required.")
      return
    }
    if (form.price <= 0) {
      setError("Price must be greater than zero.")
      return
    }

    const payload: ProductDoc = {
      ...form,
      // Sync primary image from gallery if not explicit
      image: form.image || (form.images[0]?.src ?? ""),
      imageAlt: form.imageAlt || (form.images[0]?.alt ?? ""),
      installment: hasInstallment ? (form.installment ?? EMPTY_INSTALLMENT) : null,
    }

    setIsSaving(true)

    try {
      const result = await saveProduct(payload)
      if (result.success) {
        queueSuccessToast(isEdit ? "Product updated." : "Product created.")
        router.replace("/admin/products")
      } else {
        setError(result.error ?? "Save failed")
        toast.error(result.error ?? "Save failed")
        setIsSaving(false)
      }
    } catch {
      const message = "Save failed"
      setError(message)
      toast.error(message)
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminPageTitle title={isEdit ? form.name || "Edit Product" : "New Product"} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg p-2 text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {isEdit ? "Edit Product" : "New Product"}
            </h1>
            {isEdit && (
              <p className="mt-0.5 font-mono text-xs text-content-secondary">{product.slug}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Basics */}
      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Product Name" required>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="iPhone 15 Pro Max"
              className={inputCls}
            />
          </Field>

          <Field label="Slug" hint={isEdit ? "Cannot be changed after creation" : "Auto-generated from name. You can still customize it."}>
            <input
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              disabled={isEdit}
              className={inputCls + (isEdit ? " opacity-50" : "")}
            />
          </Field>

          <Field label="Subtitle">
            <input
              value={form.subtitle}
              onChange={(e) => update("subtitle", e.target.value)}
              placeholder="Brand New / Unlocked"
              className={inputCls}
            />
          </Field>

          <Field label="Badge">
            <input
              value={form.badge ?? ""}
              onChange={(e) => update("badge", e.target.value || undefined)}
              placeholder="New, Hot, -15%"
              className={inputCls}
            />
          </Field>

          <Field label="Brand">
            {brands.length > 0 ? (
              <select
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                className={inputCls}
              >
                <option value="">Select brand…</option>
                {brands.map((b) => (
                  <option key={b.slug} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                placeholder="Apple"
                className={inputCls}
              />
            )}
          </Field>

          <Field label="Category" required>
            {categories.length > 0 ? (
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className={inputCls}
              >
                <option value="">Select category…</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="smartphones"
                className={inputCls}
              />
            )}
          </Field>

          <Field label="Condition">
            <select
              value={form.condition}
              onChange={(e) => update("condition", e.target.value as ProductCondition)}
              className={inputCls}
            >
              <option value="new">New</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price" required>
            <input
              type="number"
              value={form.price || ""}
              onChange={(e) => update("price", Number(e.target.value))}
              min={0}
              step={0.01}
              className={inputCls}
            />
          </Field>
          <Field label="Currency">
            <input
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Installment plan toggle */}
        <label className="mt-4 flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={hasInstallment}
            onChange={(e) => {
              setHasInstallment(e.target.checked)
              if (e.target.checked && !form.installment) {
                update("installment", EMPTY_INSTALLMENT)
              }
            }}
            className="size-4 rounded accent-primary"
          />
          <span className="text-sm text-foreground">Enable installment plan</span>
        </label>

        {hasInstallment && (
          <div className="mt-4 grid gap-4 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                { key: "downPaymentPercent", label: "Down Payment %" },
                { key: "downPayment", label: "Down Payment (GHC)" },
                { key: "weeklyRate", label: "Weekly Rate (GHC)" },
                { key: "weeks", label: "Weeks" },
                { key: "totalPrice", label: "Total Price (GHC)" },
              ] as const
            ).map(({ key, label }) => (
              <Field key={key} label={label}>
                <input
                  type="number"
                  value={(form.installment as InstallmentPlan)?.[key] ?? 0}
                  onChange={(e) =>
                    update("installment", {
                      ...(form.installment ?? EMPTY_INSTALLMENT),
                      [key]: Number(e.target.value),
                    })
                  }
                  className={inputCls}
                />
              </Field>
            ))}
            <Field label="Interest Note" >
              <input
                value={(form.installment as InstallmentPlan)?.interestNote ?? ""}
                onChange={(e) =>
                  update("installment", {
                    ...(form.installment ?? EMPTY_INSTALLMENT),
                    interestNote: e.target.value,
                  })
                }
                placeholder="0% interest"
                className={inputCls}
              />
            </Field>
          </div>
        )}
      </Section>

      {/* Inventory */}
      <Section title="Inventory">
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => update("inStock", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            <span className="text-sm text-foreground">In Stock</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            <span className="text-sm text-foreground">Featured</span>
          </label>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Rating (0–5)">
            <input
              type="number"
              value={form.rating}
              onChange={(e) => update("rating", Number(e.target.value))}
              min={0}
              max={5}
              step={0.1}
              className={inputCls}
            />
          </Field>
          <Field label="Review Count">
            <input
              type="number"
              value={form.reviewCount}
              onChange={(e) => update("reviewCount", Number(e.target.value))}
              min={0}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Media */}
      <Section title="Images">
        <ImageGalleryEditor
          images={form.images}
          onChange={handleGalleryChange}
          onSetPrimary={handleSetPrimaryGalleryImage}
        />
        <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <Field label="Primary Image URL" hint="Optional override for an external image. Leave empty to use the selected gallery primary image.">
            <input
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
          <Field label="Primary Image Alt">
            <input
              value={form.imageAlt}
              onChange={(e) => update("imageAlt", e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Colours */}
      <Section title="Colour Variants">
        <ColorEditor colors={form.colors} images={form.images} onChange={(c) => update("colors", c)} />
      </Section>

      {/* Storage options */}
      <Section title="Storage Options">
        <StorageEditor options={form.storageOptions} onChange={(o) => update("storageOptions", o)} />
      </Section>

      {/* Specs */}
      <Section title="Technical Specs">
        <SpecsEditor specs={form.specs} onChange={(s) => update("specs", s)} />
      </Section>

      {/* Related products */}
      <Section title="Related Products">
        <Field
          label="Choose related products"
          hint="Admins see product names here. The saved values remain the selected product slugs internally."
        >
          {relatedProductOptions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-4 text-sm text-content-secondary">
              No other products are available yet.
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-border bg-surface p-3">
              {relatedProductOptions.map((option) => {
                const checked = form.relatedSlugs.includes(option.slug)

                return (
                  <label
                    key={option.slug}
                    className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleRelatedProductToggle(option.slug)}
                      className="mt-0.5 size-4 rounded accent-primary"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">{option.label}</span>
                      <span className="block text-xs text-content-secondary">{option.slug}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          )}
        </Field>
      </Section>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Link
          href="/admin/products"
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {isSaving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  )
}
