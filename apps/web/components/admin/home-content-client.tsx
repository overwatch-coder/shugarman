"use client"

import { useRef, useState, useTransition } from "react"
import { Check, ImagePlus, Loader2, Save, Upload } from "lucide-react"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { toast } from "sonner"

import { getFirebaseStorage } from "@/lib/firebase"
import { importHomeCategoryImageFromUrl, saveHomeContent } from "@/lib/actions/home-content"
import type { BentoCategoryDoc, HomeCategoriesHeadingDoc } from "@/lib/schemas"
import type { BentoCategory } from "@/lib/storefront-types"

interface EditableHomeCard extends BentoCategoryDoc {
  readonlyPreviewVariant: BentoCategory["variant"]
  readonlyPreviewIcon?: string
}

const inputCls =
  "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"

export function HomeContentClient({
  initialHeading,
  initialCategories,
}: {
  initialHeading: HomeCategoriesHeadingDoc
  initialCategories: EditableHomeCard[]
}) {
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [heading, setHeading] = useState<HomeCategoriesHeadingDoc>(initialHeading)
  const [categories, setCategories] = useState<EditableHomeCard[]>(initialCategories)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number | null>>({})
  const [importingIndex, setImportingIndex] = useState<number | null>(null)

  function updateHeading(key: keyof HomeCategoriesHeadingDoc, value: string) {
    setHeading((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function updateCategory(index: number, key: keyof EditableHomeCard, value: string) {
    setCategories((prev) =>
      prev.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, [key]: value } : category
      )
    )
    setSaved(false)
  }

  async function handleUpload(index: number, files: FileList | null) {
    const file = files?.[0]
    if (!file) return

    try {
      const storage = getFirebaseStorage()
      const storageRef = ref(storage, `storefront/home-categories/${Date.now()}-${file.name}`)
      const task = uploadBytesResumable(storageRef, file)

      setUploadProgress((prev) => ({ ...prev, [index]: 0 }))

      task.on(
        "state_changed",
        (snap) => {
          setUploadProgress((prev) => ({
            ...prev,
            [index]: Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
          }))
        },
        () => {
          setUploadProgress((prev) => ({ ...prev, [index]: null }))
          toast.error("Failed to upload category image.")
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          setUploadProgress((prev) => ({ ...prev, [index]: null }))
          updateCategory(index, "image", url)
          if (!categories[index]?.imageAlt?.trim()) {
            updateCategory(index, "imageAlt", file.name.replace(/\.[^.]+$/, ""))
          }
          toast.success("Category image uploaded.")
        }
      )
    } finally {
      const fileRef = fileRefs.current[index]
      if (fileRef) fileRef.value = ""
    }
  }

  function importFromUrl(index: number) {
    const imageUrl = categories[index]?.image?.trim()
    if (!imageUrl) return

    setImportingIndex(index)
    startTransition(async () => {
      const result = await importHomeCategoryImageFromUrl(imageUrl)
      setImportingIndex(null)

      if (!result.success || !result.url) {
        toast.error(result.error ?? "Failed to import category image.")
        return
      }

      updateCategory(index, "image", result.url)
      toast.success("Category image imported into Firebase storage.")
    })
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const payload = {
        categoriesHeading: {
          title: heading.title.trim(),
          accent: heading.accent.trim(),
        },
        categories: categories.map((category, index) => ({
          title: category.title.trim(),
          subtitle: category.subtitle?.trim() || "",
          href: category.href.trim(),
          image: category.image?.trim() || "",
          imageAlt: category.imageAlt?.trim() || "",
          icon: category.readonlyPreviewIcon || "",
          variant: category.readonlyPreviewVariant,
          order: index,
        })),
      }

      const result = await saveHomeContent(payload)
      if (!result.success) {
        toast.error(result.error ?? "Failed to save home content.")
        return
      }

      setSaved(true)
      setHeading(payload.categoriesHeading)
      setCategories((prev) =>
        prev.map((category, index) => ({
          ...category,
          ...payload.categories[index],
        }))
      )
      toast.success("Home content saved.")
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-foreground">Home Content</h1>
      <p className="mt-1 text-sm text-content-secondary">
        Manage the storefront ecosystem section heading and card content.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
            Section Heading
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">Leading Text</span>
              <input value={heading.title} onChange={(e) => updateHeading("title", e.target.value)} className={inputCls} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">Accent Text</span>
              <input value={heading.accent} onChange={(e) => updateHeading("accent", e.target.value)} className={inputCls} />
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
            Ecosystem Cards
          </h2>
          <div className="mt-4 space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="rounded-xl border border-border bg-card p-5">
                <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
                  <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.imageAlt || category.title}
                        className="aspect-[4/3] h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-surface-high px-4 text-center text-sm text-content-secondary">
                        No image set. Card keeps its default {category.readonlyPreviewIcon ? "icon-led" : "visual"} style.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-content-secondary">
                      <span className="rounded-full border border-border px-2 py-1">Card {index + 1}</span>
                      <span className="rounded-full border border-border px-2 py-1">Variant: {category.readonlyPreviewVariant}</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-1.5 sm:col-span-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">Title</span>
                        <input value={category.title} onChange={(e) => updateCategory(index, "title", e.target.value)} className={inputCls} />
                      </label>
                      <label className="space-y-1.5 sm:col-span-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">Destination Link</span>
                        <input value={category.href} onChange={(e) => updateCategory(index, "href", e.target.value)} className={inputCls} />
                      </label>
                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">Subtitle</span>
                        <input value={category.subtitle ?? ""} onChange={(e) => updateCategory(index, "subtitle", e.target.value)} className={inputCls} />
                      </label>
                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">Image Alt Text</span>
                        <input value={category.imageAlt ?? ""} onChange={(e) => updateCategory(index, "imageAlt", e.target.value)} className={inputCls} />
                      </label>
                      <label className="space-y-1.5 sm:col-span-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">Image URL</span>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input value={category.image ?? ""} onChange={(e) => updateCategory(index, "image", e.target.value)} className={inputCls + " flex-1"} />
                          <button
                            type="button"
                            onClick={() => importFromUrl(index)}
                            disabled={isPending || importingIndex === index || !category.image?.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                          >
                            {importingIndex === index ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                            Import URL
                          </button>
                        </div>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileRefs.current[index]?.click()}
                        className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-medium text-content-secondary transition-colors hover:border-primary/50 hover:text-foreground"
                      >
                        <Upload className="size-4" />
                        Upload image
                      </button>
                      <input
                        ref={(node) => {
                          fileRefs.current[index] = node
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(index, e.target.files)}
                      />
                      {uploadProgress[index] != null ? (
                        <p className="text-sm text-content-secondary">Uploading… {uploadProgress[index]}%</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {isPending ? "Saving…" : saved ? "Saved!" : "Save Home Content"}
          </button>
        </div>
      </form>
    </div>
  )
}