"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Save, Check, Plus, Trash2, Loader2, Upload, ImagePlus } from "lucide-react"
import { toast } from "sonner"
import type { StoreSettingsDoc, SocialLink } from "@/lib/schemas"
import { importStoreHeroImageFromUrl, saveStoreSettings } from "@/lib/actions/settings"
import { buildSocialUrl, normalizeSocialLink } from "@/lib/admin/settings-helpers"
import { BRAND_NAME } from "@/lib/brand"
import { getFirebaseStorage } from "@/lib/firebase"
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"

const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram",
  "Twitter / X",
  "TikTok",
  "YouTube",
  "WhatsApp",
  "LinkedIn",
  "Snapchat",
  "Pinterest",
  "Threads",
]

export function SettingsClient({
  initialSettings,
}: {
  initialSettings: StoreSettingsDoc | null
}) {
  const heroFileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [heroUrlInput, setHeroUrlInput] = useState("")
  const [heroUploadProgress, setHeroUploadProgress] = useState<number | null>(null)
  const [isImportingHeroUrl, startHeroUrlImport] = useTransition()
  const [form, setForm] = useState<StoreSettingsDoc>(
    initialSettings ?? {
      name: BRAND_NAME,
      tagline: "",
      description: "",
      heroImage: "",
      heroImageAlt: "",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      city: "",
      region: "",
      country: "Ghana",
      hours: [],
      social: [],
    }
  )

  function update<K extends keyof StoreSettingsDoc>(key: K, value: StoreSettingsDoc[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function updateSocial(index: number, key: keyof SocialLink, value: string) {
    setForm((prev) => ({
      ...prev,
      social: prev.social.map((socialLink, socialIndex) => {
        if (socialIndex !== index) return socialLink

        const nextLink = { ...socialLink, [key]: value }
        const previousGeneratedUrl = buildSocialUrl(socialLink.platform, socialLink.handle)
        const nextGeneratedUrl = buildSocialUrl(nextLink.platform, nextLink.handle)

        if (key === "handle" || key === "platform") {
          const shouldAutoFillUrl = !socialLink.url.trim() || socialLink.url.trim() === previousGeneratedUrl
          if (shouldAutoFillUrl) {
            nextLink.url = nextGeneratedUrl
          }
        }

        return nextLink
      }),
    }))
    setSaved(false)
  }

  function addSocialLink() {
    setForm((prev) => ({
      ...prev,
      social: [...prev.social, { platform: "", handle: "", url: "" }],
    }))
    setSaved(false)
  }

  function removeSocialLink(index: number) {
    setForm((prev) => ({
      ...prev,
      social: prev.social.filter((_, i) => i !== index),
    }))
    setSaved(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const payload = {
        ...form,
        social: form.social
          .map((link) => normalizeSocialLink(link))
          .filter((link) => link.platform || link.handle || link.url),
      }

      const result = await saveStoreSettings(payload)

      if (result.success) {
        setForm(payload)
        setSaved(true)
        toast.success("Store settings saved.")
        router.refresh()
      } else {
        toast.error(result.error ?? "Failed to save settings.")
      }
    })
  }

  async function handleHeroUpload(files: FileList | null) {
    const file = files?.[0]
    if (!file) return

    try {
      const storage = getFirebaseStorage()
      const storageRef = ref(storage, `storefront/hero/${Date.now()}-${file.name}`)
      const task = uploadBytesResumable(storageRef, file)

      setHeroUploadProgress(0)

      task.on(
        "state_changed",
        (snap) => {
          setHeroUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100))
        },
        () => {
          setHeroUploadProgress(null)
          toast.error("Failed to upload hero image.")
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          setHeroUploadProgress(null)
          setForm((prev) => ({
            ...prev,
            heroImage: url,
            heroImageAlt: prev.heroImageAlt || file.name.replace(/\.[^.]+$/, ""),
          }))
          setSaved(false)
          toast.success("Hero image uploaded.")
        }
      )
    } finally {
      if (heroFileRef.current) {
        heroFileRef.current.value = ""
      }
    }
  }

  function handleHeroUrlImport() {
    startHeroUrlImport(async () => {
      const result = await importStoreHeroImageFromUrl(heroUrlInput)

      if (!result.success || !result.url) {
        toast.error(result.error ?? "Failed to import hero image.")
        return
      }

      setForm((prev) => ({ ...prev, heroImage: result.url ?? prev.heroImage }))
      setSaved(false)
      setHeroUrlInput("")
      toast.success("Hero image imported into Firebase storage.")
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-black tracking-tight text-foreground">Store Settings</h1>
      <p className="mt-1 text-sm text-content-secondary">
        Manage your store information and metadata
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* General */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
            General
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Store Name" value={form.name} onChange={(v) => update("name", v)} />
            <Field label="Tagline" value={form.tagline ?? ""} onChange={(v) => update("tagline", v)} />
            <Field
              label="Description"
              value={form.description ?? ""}
              onChange={(v) => update("description", v)}
              full
              textarea
            />
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
            Storefront Hero Image
          </h2>
          <div className="mt-4 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                {form.heroImage ? (
                  <img
                    src={form.heroImage}
                    alt={form.heroImageAlt || "Storefront hero preview"}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-surface-high text-sm text-content-secondary">
                    No hero image yet
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Field
                  label="Hero image alt text"
                  value={form.heroImageAlt ?? ""}
                  onChange={(v) => update("heroImageAlt", v)}
                  full
                />

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary">
                    Import from URL
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={heroUrlInput}
                      onChange={(e) => setHeroUrlInput(e.target.value)}
                      placeholder="https://example.com/hero-image.jpg"
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
                    />
                    <button
                      type="button"
                      onClick={handleHeroUrlImport}
                      disabled={isImportingHeroUrl || !heroUrlInput.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                    >
                      {isImportingHeroUrl ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                      Import URL
                    </button>
                  </div>
                  <p className="text-[11px] text-content-muted">
                    External image links are copied into Firebase Storage and saved back as Firebase-hosted URLs.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-content-secondary">
                    Upload from device
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => heroFileRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm font-medium text-content-secondary transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      <Upload className="size-4" />
                      Upload image
                    </button>
                    {heroUploadProgress !== null ? (
                      <p className="text-sm text-content-secondary">Uploading… {heroUploadProgress}%</p>
                    ) : null}
                    {form.heroImage ? (
                      <button
                        type="button"
                        onClick={() => {
                          update("heroImage", "")
                          setSaved(false)
                        }}
                        className="text-sm font-medium text-red-500 hover:underline"
                      >
                        Remove image
                      </button>
                    ) : null}
                  </div>
                  <input
                    ref={heroFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleHeroUpload(e.target.files)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
            Contact
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Email" value={form.email ?? ""} onChange={(v) => update("email", v)} type="email" />
            <Field label="Phone" value={form.phone ?? ""} onChange={(v) => update("phone", v)} type="tel" />
            <Field label="WhatsApp" value={form.whatsapp ?? ""} onChange={(v) => update("whatsapp", v)} type="tel" />
            <Field label="Address" value={form.address ?? ""} onChange={(v) => update("address", v)} />
            <Field label="City" value={form.city ?? ""} onChange={(v) => update("city", v)} />
            <Field label="Region" value={form.region ?? ""} onChange={(v) => update("region", v)} />
            <Field label="Country" value={form.country ?? ""} onChange={(v) => update("country", v)} />
          </div>
        </section>

        {/* Social */}
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-content-secondary">
              Social Links
            </h2>
            <button
              type="button"
              onClick={addSocialLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-content-secondary transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="size-3" />
              Add Link
            </button>
          </div>

          {form.social.length === 0 ? (
            <p className="mt-4 text-sm text-content-secondary">
              No social links yet. Click "Add Link" to add one.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {form.social.map((s, i) => (
                <div
                  key={i}
                  className="grid items-end gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_2fr_auto]"
                >
                  {/* Platform select */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                      Platform
                    </label>
                    <select
                      value={s.platform}
                      onChange={(e) => updateSocial(i, "platform", e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
                    >
                      <option value="">Select…</option>
                      {SOCIAL_PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Handle */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                      Handle
                    </label>
                    <input
                      value={s.handle}
                      onChange={(e) => updateSocial(i, "handle", e.target.value)}
                      placeholder="@sugarman"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
                    />
                  </div>

                  {/* URL */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-content-secondary">
                      URL
                    </label>
                    <input
                      value={s.url}
                      onChange={(e) => updateSocial(i, "url", e.target.value)}
                      placeholder="https://…"
                      type="url"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
                    />
                    {!s.url && s.handle && s.platform && (
                      <p className="text-[11px] text-content-secondary">
                        Auto URL: {buildSocialUrl(s.platform, s.handle) || "Unavailable for this platform"}
                      </p>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeSocialLink(i)}
                    className="rounded-lg p-2.5 text-content-secondary transition-colors hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {isPending ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  full = false,
  textarea = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  full?: boolean
  textarea?: boolean
}) {
  const cls =
    "w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/50"
  return (
    <label className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
        {label}
      </span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={cls + " resize-none"} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
      )}
    </label>
  )
}
