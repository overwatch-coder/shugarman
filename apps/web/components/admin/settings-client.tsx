"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Save, Check, Plus, Trash2 } from "lucide-react"
import type { StoreSettingsDoc, SocialLink } from "@/lib/schemas"
import { saveStoreSettings } from "@/lib/actions/settings"

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
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<StoreSettingsDoc>(
    initialSettings ?? {
      name: "Sugar Man iStore",
      tagline: "",
      description: "",
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
      social: prev.social.map((s, i) =>
        i === index ? { ...s, [key]: value } : s
      ),
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
      await saveStoreSettings(form)
      setSaved(true)
      router.refresh()
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
