"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className="dark antialiased">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">System Error</p>
        <h1 className="mt-4 font-display text-6xl uppercase tracking-tight">Something Broke</h1>
        <p className="mt-4 max-w-md text-sm leading-7 text-content-secondary">
          An unexpected error occurred. Our team has been notified. Try refreshing or return to the store.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-white/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-white/5"
          >
            Back to Home
          </a>
        </div>
      </body>
    </html>
  )
}
