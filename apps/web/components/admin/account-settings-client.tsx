"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Mail, Save, ShieldCheck, User } from "lucide-react"
import { toast } from "sonner"

import { updateAdminDisplayName, updateAdminEmail, updateAdminPassword } from "@/lib/actions/account"

interface Props {
  displayName: string
  email: string
  role: string
}

function inputCls(error?: string) {
  return `w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-content-muted focus:border-primary/60 ${
    error ? "border-red-500/60" : "border-border"
  }`
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-xs text-content-secondary">{description}</p>
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

export function AccountSettingsClient({ displayName, email, role }: Props) {
  const router = useRouter()

  // — Display name —
  const [name, setName] = useState(displayName)
  const [nameError, setNameError] = useState("")
  const [namePending, startNamePending] = useTransition()

  function handleNameSave() {
    setNameError("")
    startNamePending(async () => {
      const res = await updateAdminDisplayName(name)
      if (res.success) {
        toast.success("Display name updated.")
        router.refresh()
      } else {
        setNameError(res.error ?? "Failed to update.")
        toast.error(res.error ?? "Failed to update.")
      }
    })
  }

  // — Email —
  const [emailForm, setEmailForm] = useState({ currentPassword: "", newEmail: email })
  const [emailErrors, setEmailErrors] = useState<Record<string, string>>({})
  const [emailPending, startEmailPending] = useTransition()

  function handleEmailSave() {
    const errors: Record<string, string> = {}
    if (!emailForm.currentPassword) errors.currentPassword = "Required"
    if (!emailForm.newEmail.includes("@")) errors.newEmail = "Enter a valid email"
    if (Object.keys(errors).length) { setEmailErrors(errors); return }
    setEmailErrors({})
    startEmailPending(async () => {
      const res = await updateAdminEmail(emailForm.currentPassword, emailForm.newEmail)
      if (res.success) {
        toast.success("Email updated. You may need to log in again.")
        setEmailForm((f) => ({ ...f, currentPassword: "" }))
        router.refresh()
      } else {
        setEmailErrors({ form: res.error ?? "Failed to update." })
        toast.error(res.error ?? "Failed to update.")
      }
    })
  }

  // — Password —
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})
  const [pwPending, startPwPending] = useTransition()

  function handlePasswordSave() {
    const errors: Record<string, string> = {}
    if (!pwForm.currentPassword) errors.currentPassword = "Required"
    if (pwForm.newPassword.length < 8) errors.newPassword = "Must be at least 8 characters"
    if (pwForm.newPassword !== pwForm.confirmPassword) errors.confirmPassword = "Passwords do not match"
    if (Object.keys(errors).length) { setPwErrors(errors); return }
    setPwErrors({})
    startPwPending(async () => {
      const res = await updateAdminPassword(pwForm.currentPassword, pwForm.newPassword)
      if (res.success) {
        toast.success("Password updated successfully.")
        setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        setPwErrors({ form: res.error ?? "Failed to update." })
        toast.error(res.error ?? "Failed to update.")
      }
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground">Account Settings</h1>
        <p className="mt-1 text-sm text-content-secondary">
          Manage your admin profile, email, and password.
        </p>
      </div>

      {/* Role badge */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
        <ShieldCheck className="size-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">{displayName || email}</p>
          <p className="text-xs capitalize text-content-secondary">{role} account</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* — Display name — */}
        <SectionCard
          icon={User}
          title="Display Name"
          description="The name shown in the admin sidebar."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError("") }}
                placeholder="Your name"
                className={inputCls(nameError)}
              />
              {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
            </div>
            <button
              onClick={handleNameSave}
              disabled={namePending || name.trim() === displayName}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Save className="size-4" />
              {namePending ? "Saving…" : "Save"}
            </button>
          </div>
        </SectionCard>

        {/* — Email — */}
        <SectionCard
          icon={Mail}
          title="Email Address"
          description="Your login email. Requires your current password."
        >
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-secondary">
                Current Password
              </label>
              <input
                type="password"
                value={emailForm.currentPassword}
                onChange={(e) => { setEmailForm((f) => ({ ...f, currentPassword: e.target.value })); setEmailErrors({}) }}
                placeholder="••••••••"
                className={inputCls(emailErrors.currentPassword)}
                autoComplete="current-password"
              />
              {emailErrors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{emailErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-secondary">
                New Email Address
              </label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) => { setEmailForm((f) => ({ ...f, newEmail: e.target.value })); setEmailErrors({}) }}
                placeholder="new@example.com"
                className={inputCls(emailErrors.newEmail)}
                autoComplete="email"
              />
              {emailErrors.newEmail && (
                <p className="mt-1 text-xs text-red-500">{emailErrors.newEmail}</p>
              )}
            </div>
            {emailErrors.form && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{emailErrors.form}</p>
            )}
            <button
              onClick={handleEmailSave}
              disabled={emailPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              <Save className="size-4" />
              {emailPending ? "Updating…" : "Update Email"}
            </button>
          </div>
        </SectionCard>

        {/* — Password — */}
        <SectionCard
          icon={KeyRound}
          title="Change Password"
          description="Choose a strong password of at least 8 characters."
        >
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-secondary">
                Current Password
              </label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => { setPwForm((f) => ({ ...f, currentPassword: e.target.value })); setPwErrors({}) }}
                placeholder="••••••••"
                className={inputCls(pwErrors.currentPassword)}
                autoComplete="current-password"
              />
              {pwErrors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">{pwErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-secondary">
                New Password
              </label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => { setPwForm((f) => ({ ...f, newPassword: e.target.value })); setPwErrors({}) }}
                placeholder="Min. 8 characters"
                className={inputCls(pwErrors.newPassword)}
                autoComplete="new-password"
              />
              {pwErrors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{pwErrors.newPassword}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-content-secondary">
                Confirm New Password
              </label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => { setPwForm((f) => ({ ...f, confirmPassword: e.target.value })); setPwErrors({}) }}
                placeholder="Repeat new password"
                className={inputCls(pwErrors.confirmPassword)}
                autoComplete="new-password"
              />
              {pwErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{pwErrors.confirmPassword}</p>
              )}
            </div>
            {pwErrors.form && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-500">{pwErrors.form}</p>
            )}
            <button
              onClick={handlePasswordSave}
              disabled={pwPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              <KeyRound className="size-4" />
              {pwPending ? "Updating…" : "Update Password"}
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
