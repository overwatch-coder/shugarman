"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Save, Check } from "lucide-react"
import type { StoreSettingsDoc } from "@/lib/schemas"
import { saveStoreSettings } from "@/lib/actions/settings"

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

  function updateSocial(index: number, key: keyof StoreSettingsDoc["social"][0], value: string) {
    setForm((prev) => ({
      ...prev,
      social: prev.social.map((s, i) =>
        i === index ? { ...s, [key]: value } : s
      ),
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
      <h1 className="text-2xl font-black tracking-tight text-white">Store Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage your store information and metadata
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* General */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
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
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Social Links
          </h2>
          {form.social.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No social links configured.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {form.social.map((s, i) => (
                <div key={i} className="grid gap-3 sm:grid-cols-3">
                  <Field label="Platform" value={s.platform} onChange={(v) => updateSocial(i, "platform", v)} />
                  <Field label="Handle" value={s.handle} onChange={(v) => updateSocial(i, "handle", v)} />
                  <Field label="URL" value={s.url} onChange={(v) => updateSocial(i, "url", v)} />
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
    "w-full rounded-lg border border-white/8 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-primary/50"
  return (
    <label className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
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
