"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase"
import { createSession } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const auth = getFirebaseAuth()
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await credential.user.getIdToken()
      const result = await createSession(idToken)

      if (!result.success) {
        setError(result.error ?? "Login failed")
        setLoading(false)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      if (message.includes("auth/invalid-credential") || message.includes("auth/wrong-password")) {
        setError("Invalid email or password")
      } else if (message.includes("auth/user-not-found")) {
        setError("No account found with this email")
      } else if (message.includes("auth/too-many-requests")) {
        setError("Too many attempts. Try again later.")
      } else {
        setError("Something went wrong. Please try again.")
      }
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D] px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-10 text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">
            Admin Portal
          </p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase tracking-tight text-white">
            Sugar Man iStore
          </h1>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/8 bg-[#141414] p-8"
        >
          <h2 className="text-lg font-bold text-white">Sign in</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Enter your admin credentials to continue.
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                placeholder="admin@sugarman.store"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Password
              </span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/8 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
                placeholder="••••••••"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-xl bg-primary py-4 text-sm font-black uppercase tracking-wider text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-neutral-600">
          Only authorized store administrators can access this portal.
        </p>
      </div>
    </div>
  )
}
