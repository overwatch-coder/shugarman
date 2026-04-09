"use client"

import { useState, useTransition, useRef } from "react"
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
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
import { getFirebaseStorage } from "@/lib/firebase"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

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
    <div className="rounded-xl border border-white/6 bg-[#141414] p-6">
      <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-neutral-400">
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
      <label className="block text-xs font-medium text-neutral-400">
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-600">{hint}</p>}
    </div>
  )
}

const inputCls =
  "w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"

// ─── Image uploader ───────────────────────────────────────────────────────────

interface ImageEntry {
  src: string
  alt: string
  uploading?: boolean
  progress?: number
}

function ImageGalleryEditor({
  images,
  onChange,
}: {
  images: ProductImage[]
  onChange: (imgs: ProductImage[]) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [entries, setEntries] = useState<ImageEntry[]>(
    images.map((img) => ({ src: img.src, alt: img.alt }))
  )

  function syncUp(next: ImageEntry[]) {
    setEntries(next)
    onChange(next.filter((e) => !e.uploading).map((e) => ({ src: e.src, alt: e.alt })))
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const storage = getFirebaseStorage()

    for (const file of Array.from(files)) {
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2)
      const placeholder: ImageEntry = {
        src: URL.createObjectURL(file),
        alt: file.name.replace(/\.[^.]+$/, ""),
        uploading: true,
        progress: 0,
      }
      setEntries((prev) => [...prev, placeholder])

      const storageRef = ref(storage, `products/${id}-${file.name}`)
      const task = uploadBytesResumable(storageRef, file)

      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
          setEntries((prev) =>
            prev.map((e) => (e.src === placeholder.src ? { ...e, progress: pct } : e))
          )
        },
        () => {
          // Upload failed — remove placeholder
          setEntries((prev) => {
            const next = prev.filter((e) => e.src !== placeholder.src)
            onChange(next.filter((e) => !e.uploading).map((e) => ({ src: e.src, alt: e.alt })))
            return next
          })
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          setEntries((prev) => {
            const next = prev.map((e) =>
              e.src === placeholder.src ? { src: url, alt: e.alt, uploading: false } : e
            )
            onChange(next.filter((e) => !e.uploading).map((e) => ({ src: e.src, alt: e.alt })))
            return next
          })
        }
      )
    }
  }

  function updateAlt(idx: number, alt: string) {
    const next = entries.map((e, i) => (i === idx ? { ...e, alt } : e))
    syncUp(next)
  }

  function remove(idx: number) {
    const next = entries.filter((_, i) => i !== idx)
    syncUp(next)
  }

  function addUrl(url: string) {
    if (!url.trim()) return
    const next = [...entries, { src: url, alt: "" }]
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
              className="group relative overflow-hidden rounded-xl border border-white/6 bg-white/3"
            >
              <div className="relative aspect-square">
                <img
                  src={entry.src}
                  alt={entry.alt}
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
              </div>
              <input
                value={entry.alt}
                onChange={(e) => updateAlt(idx, e.target.value)}
                placeholder="Alt text"
                className="w-full border-t border-white/6 bg-transparent px-2.5 py-1.5 text-[11px] text-neutral-300 outline-none placeholder:text-neutral-600 focus:border-primary/50"
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
              addUrl(urlInput)
              setUrlInput("")
            }
          }}
        />
        <button
          type="button"
          onClick={() => { addUrl(urlInput); setUrlInput("") }}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          Add URL
        </button>
      </div>

      {/* Upload from disk */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-white/15 px-4 py-2.5 text-sm text-neutral-400 transition-colors hover:border-primary/50 hover:text-white"
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

      <p className="text-[11px] text-neutral-600">
        First image is the primary card image. Upload or paste multiple images.
      </p>
    </div>
  )
}

// ─── Colours editor ───────────────────────────────────────────────────────────

function ColorEditor({
  colors,
  onChange,
}: {
  colors: ProductColor[]
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

  return (
    <div className="space-y-3">
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {colors.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-1.5"
            >
              <span
                className="inline-block size-3.5 rounded-full border border-white/20"
                style={{ background: c.hex }}
              />
              <span className="text-xs text-white">{c.name}</span>
              <button
                type="button"
                onClick={() => onChange(colors.filter((_, j) => j !== i))}
                className="text-neutral-500 hover:text-red-400"
              >
                <X className="size-3" />
              </button>
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
          className="h-10 w-12 cursor-pointer rounded-lg border border-white/8 bg-white/5 px-1"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-white/10 px-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Storage options editor ───────────────────────────────────────────────────

function StorageEditor({
  options,
  onChange,
}: {
  options: ProductStorage[]
  onChange: (o: ProductStorage[]) => void
}) {
  const [label, setLabel] = useState("")
  const [value, setValue] = useState("")

  function add() {
    if (!label.trim() || !value.trim()) return
    onChange([...options, { label, value }])
    setLabel("")
    setValue("")
  }

  return (
    <div className="space-y-3">
      {options.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {options.map((o, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/3 px-3 py-1.5"
            >
              <span className="text-xs text-white">{o.label}</span>
              <span className="text-[10px] text-neutral-500">{o.value}</span>
              <button
                type="button"
                onClick={() => onChange(options.filter((_, j) => j !== i))}
                className="text-neutral-500 hover:text-red-400"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. 256GB)"
          className={inputCls + " flex-1"}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value (e.g. 256)"
          className={inputCls + " w-28"}
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-white/10 px-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Specs editor ─────────────────────────────────────────────────────────────

function SpecsEditor({
  specs,
  onChange,
}: {
  specs: TechSpec[]
  onChange: (s: TechSpec[]) => void
}) {
  const [label, setLabel] = useState("")
  const [value, setValue] = useState("")

  function add() {
    if (!label.trim() || !value.trim()) return
    onChange([...specs, { label, value }])
    setLabel("")
    setValue("")
  }

  return (
    <div className="space-y-3">
      {specs.length > 0 && (
        <div className="space-y-1.5">
          {specs.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/3 px-3 py-2"
            >
              <GripVertical className="size-3.5 shrink-0 text-neutral-600" />
              <span className="w-32 shrink-0 text-xs font-medium text-neutral-300">{s.label}</span>
              <span className="flex-1 text-xs text-neutral-400">{s.value}</span>
              <button
                type="button"
                onClick={() => onChange(specs.filter((_, j) => j !== i))}
                className="text-neutral-500 hover:text-red-400"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (e.g. Display)"
          className={inputCls + " w-40"}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value (e.g. 6.7″ OLED)"
          className={inputCls + " flex-1"}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-white/10 px-3 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
        >
          <Plus className="size-4" />
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
}: {
  product: ProductDoc | null
  categories: { slug: string; name: string }[]
  brands: { slug: string; name: string }[]
}) {
  const isEdit = !!product
  const router = useRouter()
  const [form, setForm] = useState<ProductDoc>(product ?? EMPTY_PRODUCT)
  const [hasInstallment, setHasInstallment] = useState(!!product?.installment)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof ProductDoc>(key: K, value: ProductDoc[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "name" && !isEdit ? { slug: slugify(value as string) } : {}),
    }))
  }

  // Keep primary image in sync with first gallery image
  function handleGalleryChange(imgs: ProductImage[]) {
    update("images", imgs)
    if (imgs.length > 0 && !form.image) {
      update("image", imgs[0]!.src)
      update("imageAlt", imgs[0]!.alt)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!form.name.trim() || !form.slug.trim() || !form.brand.trim()) {
      setError("Name, slug, and brand are required.")
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

    startTransition(async () => {
      const result = await saveProduct(payload)
      if (result.success) {
        router.push("/admin/products")
        router.refresh()
      } else {
        setError(result.error ?? "Save failed")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {isEdit ? "Edit Product" : "New Product"}
            </h1>
            {isEdit && (
              <p className="mt-0.5 font-mono text-xs text-neutral-500">{product.slug}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
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
              onChange={(e) => update("name", e.target.value)}
              placeholder="iPhone 15 Pro Max"
              className={inputCls}
            />
          </Field>

          <Field label="Slug" hint={isEdit ? "Cannot be changed after creation" : "Auto-generated from name"}>
            <input
              value={form.slug}
              onChange={(e) => update("slug", e.target.value)}
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

          <Field label="Brand" required>
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

          <Field label="Category">
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
          <span className="text-sm text-neutral-300">Enable installment plan</span>
        </label>

        {hasInstallment && (
          <div className="mt-4 grid gap-4 rounded-lg border border-white/6 bg-white/3 p-4 sm:grid-cols-2 lg:grid-cols-3">
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
            <span className="text-sm text-neutral-300">In Stock</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            <span className="text-sm text-neutral-300">Featured</span>
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
        <ImageGalleryEditor images={form.images} onChange={handleGalleryChange} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 border-t border-white/6 pt-4">
          <Field label="Primary Image URL" hint="Overrides the first gallery image for card display">
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
        <ColorEditor colors={form.colors} onChange={(c) => update("colors", c)} />
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
        <Field label="Related slugs" hint="Comma-separated product slugs">
          <input
            value={form.relatedSlugs.join(", ")}
            onChange={(e) =>
              update(
                "relatedSlugs",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="iphone-14-pro, samsung-s24"
            className={inputCls}
          />
        </Field>
      </Section>

      {/* Bottom action bar */}
      <div className="flex items-center justify-end gap-2 border-t border-white/6 pt-4">
        <Link
          href="/admin/products"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          {isPending ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  )
}
