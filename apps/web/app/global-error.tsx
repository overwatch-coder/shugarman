"use client"

import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body className="sf-bg-gradient min-h-screen font-body text-foreground">
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center px-6 py-16">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            System Interrupt
          </p>
          <h1 className="font-display text-6xl uppercase leading-none tracking-tight md:text-7xl">
            Something broke.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-content-secondary">
            The storefront hit an unexpected error. You can retry this view or return to the homepage.
          </p>
          {error.digest ? (
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-content-muted">
              Digest: {error.digest}
            </p>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-sm font-black uppercase tracking-[0.18em] text-white"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-white/10 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-foreground"
            >
              Go Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
