"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand"

type AuthView = "menu" | "customer-signin" | "customer-signup"

interface AuthPanelProps {
  open: boolean
  onClose: () => void
}

// ─── Coming Soon Badge ────────────────────────────────────────────────────────
function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary">
      <Sparkles className="size-2.5" />
      Coming Soon
    </span>
  )
}

// ─── Customer Sign-In Form ────────────────────────────────────────────────────
function CustomerSignIn({ onBack }: { onBack: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs text-content-secondary transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-3 rotate-180" />
          Back
        </button>
        <h2 className="text-xl font-black tracking-tight text-foreground">Welcome back</h2>
        <p className="mt-1 text-sm text-content-secondary">Sign in to your Sugar Man account</p>
        <div className="mt-2">
          <ComingSoonBadge />
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
        <p className="text-sm text-content-secondary">
          Customer accounts are coming soon. You'll be able to track orders, save wishlists, and get
          exclusive deals.
        </p>
      </div>

      {/* Greyed-out form preview */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="pointer-events-none space-y-4 opacity-40"
        aria-hidden="true"
      >
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-content-secondary">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-content-muted"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-content-secondary">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm text-foreground outline-none placeholder:text-content-muted"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white"
        >
          Sign In
          <ArrowRight className="size-4" />
        </button>
      </form>

      {/* Notify CTA */}
      <p className="text-center text-xs text-content-secondary">
        Want early access?{" "}
        <a
          href={`https://wa.me/${encodeURIComponent("+233000000000")}?text=${encodeURIComponent("I'd like to be notified when Sugar Man customer accounts launch!")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          Let us know on WhatsApp →
        </a>
      </p>
    </div>
  )
}

// ─── Customer Sign-Up Form ────────────────────────────────────────────────────
function CustomerSignUp({ onBack }: { onBack: () => void }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex items-center gap-1.5 text-xs text-content-secondary transition-colors hover:text-foreground"
        >
          <ChevronRight className="size-3 rotate-180" />
          Back
        </button>
        <h2 className="text-xl font-black tracking-tight text-foreground">Create account</h2>
        <p className="mt-1 text-sm text-content-secondary">
          Join SHUGARMAN iSTORE for exclusive perks
        </p>
        <div className="mt-2">
          <ComingSoonBadge />
        </div>
      </div>

      {/* Coming soon notice */}
      <div className="rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
        <p className="text-sm text-content-secondary">
          Customer accounts are launching soon with order tracking, wishlists, and flexible
          installment management — all in one place.
        </p>
      </div>

      {/* Greyed-out form preview */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className="pointer-events-none space-y-4 opacity-40"
        aria-hidden="true"
      >
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-content-secondary">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-content-muted"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-content-secondary">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-content-muted"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-content-secondary">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-surface py-3 pl-10 pr-12 text-sm text-foreground outline-none placeholder:text-content-muted"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white"
        >
          Create Account
          <ArrowRight className="size-4" />
        </button>
      </form>

      {/* Notify CTA */}
      <p className="text-center text-xs text-content-secondary">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onBack}
          className="font-semibold text-primary hover:underline"
        >
          Sign in instead
        </button>
      </p>
    </div>
  )
}

// ─── Main Menu ────────────────────────────────────────────────────────────────
function AuthMenu({
  onSignIn,
  onSignUp,
  onClose,
}: {
  onSignIn: () => void
  onSignUp: () => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black tracking-tight text-foreground">My Account</h2>
        <p className="mt-1 text-sm text-content-secondary">
          Sign in or create a free account to get started
        </p>
      </div>

      {/* Customer actions */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onSignIn}
          className="group flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 text-left transition-colors hover:border-primary/30 hover:bg-surface-high"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <User className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Sign In</p>
              <p className="text-xs text-content-secondary">Access your account</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ComingSoonBadge />
            <ChevronRight className="size-4 text-content-muted transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>

        <button
          type="button"
          onClick={onSignUp}
          className="group flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 text-left transition-colors hover:border-primary/30 hover:bg-surface-high"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Create Account</p>
              <p className="text-xs text-content-secondary">Free — takes 30 seconds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ComingSoonBadge />
            <ChevronRight className="size-4 text-content-muted transition-transform group-hover:translate-x-0.5" />
          </div>
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-[10px] uppercase tracking-widest text-content-muted">
            or
          </span>
        </div>
      </div>

      {/* Admin portal */}
      <Link
        href="/admin/login"
        onClick={onClose}
        className="group flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 px-5 py-4 text-left transition-colors hover:border-white/10 hover:bg-black/60"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-neutral-400">
            <Shield className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-200">Admin Portal</p>
            <p className="text-xs text-neutral-500">Staff &amp; store management</p>
          </div>
        </div>
        <ChevronRight className="size-4 text-neutral-600 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}

// ─── Auth Panel ───────────────────────────────────────────────────────────────
export function AuthPanel({ open, onClose }: AuthPanelProps) {
  const [view, setView] = useState<AuthView>("menu")
  const panelRef = useRef<HTMLDivElement>(null)

  // Reset view when panel opens
  useEffect(() => {
    if (open) setView("menu")
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    if (open) document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Account panel"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-content-secondary">
                <User className="size-3.5" />
                Account
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close account panel"
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-full",
                  "text-content-secondary transition-colors hover:bg-surface hover:text-foreground"
                )}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <AnimatePresence mode="wait" initial={false}>
                {view === "menu" && (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}
                  >
                    <AuthMenu
                      onSignIn={() => setView("customer-signin")}
                      onSignUp={() => setView("customer-signup")}
                      onClose={onClose}
                    />
                  </motion.div>
                )}
                {view === "customer-signin" && (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.18 }}
                  >
                    <CustomerSignIn onBack={() => setView("menu")} />
                  </motion.div>
                )}
                {view === "customer-signup" && (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.18 }}
                  >
                    <CustomerSignUp onBack={() => setView("menu")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Panel footer */}
            <div className="border-t border-border px-6 py-4">
              <p className="text-center text-[10px] text-content-muted">
                {BRAND_NAME} - {BRAND_TAGLINE}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
