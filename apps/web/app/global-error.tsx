"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <p>System Interrupt</p>
          <h1>Something broke.</h1>
          <p>The storefront hit an unexpected error. You can retry this view or return to the homepage.</p>
          {error.digest ? <p>Digest: {error.digest}</p> : null}
          <div>
            <button type="button" onClick={() => reset()}>
              Try Again
            </button>
            <a href="/">Go Home</a>
          </div>
        </main>
      </body>
    </html>
  )
}
