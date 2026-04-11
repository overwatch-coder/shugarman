"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { submitReview } from "@/lib/actions/reviews"
import type { ReviewDoc } from "@/lib/schemas"

// ─── Star Picker ─────────────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              n <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Static star display ─────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-4 w-4 ${
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground"
          }`}
        />
      ))}
    </span>
  )
}

// ─── Review Form ─────────────────────────────────────────────────────────────

function ReviewForm({
  productSlug,
  productName,
  onSubmitted,
}: {
  productSlug: string
  productName: string
  onSubmitted: () => void
}) {
  const [rating, setRating] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setError("Please select a star rating.")
      return
    }
    setPending(true)
    setError(null)
    const res = await submitReview({
      productSlug,
      productName,
      reviewerName: name,
      reviewerEmail: email,
      rating,
      title,
      body,
    })
    setPending(false)
    if (res.success) {
      onSubmitted()
    } else {
      setError(res.error ?? "Something went wrong.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Your rating <span className="text-destructive">*</span></label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="review-name" className="text-sm font-medium">Name <span className="text-destructive">*</span></label>
          <input
            id="review-name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Jane Smith"
            maxLength={80}
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="review-email" className="text-sm font-medium">Email (optional)</label>
          <input
            id="review-email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            maxLength={120}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-title" className="text-sm font-medium">Review title <span className="text-destructive">*</span></label>
        <input
          id="review-title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          placeholder="Great phone overall"
          maxLength={120}
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="review-body" className="text-sm font-medium">Your review <span className="text-destructive">*</span></label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
          placeholder="Tell others what you think about this product..."
          rows={5}
          maxLength={2000}
          required
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">{body.length}/2000</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  )
}

// ─── Review Card ─────────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: ReviewDoc }) {
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  return (
    <article className="py-6 border-b last:border-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <Stars rating={review.rating} />
          <h4 className="font-semibold mt-1">{review.title}</h4>
        </div>
        <time className="text-sm text-muted-foreground shrink-0">{date}</time>
      </div>
      <p className="mt-2 text-sm/relaxed text-foreground/80">{review.body}</p>
      <p className="mt-2 text-xs text-muted-foreground">— {review.reviewerName}</p>
    </article>
  )
}

// ─── Rating Summary Bar ───────────────────────────────────────────────────────

function RatingSummary({ reviews }: { reviews: ReviewDoc[] }) {
  if (reviews.length === 0) return null
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }))
  return (
    <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-lg bg-muted/50">
      {/* Overall score */}
      <div className="flex flex-col items-center justify-center min-w-[80px]">
        <span className="text-4xl font-bold">{avg.toFixed(1)}</span>
        <Stars rating={Math.round(avg)} />
        <span className="text-xs text-muted-foreground mt-1">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </span>
      </div>
      {/* Distribution */}
      <div className="flex-1 space-y-1">
        {counts.map(({ n, count }) => {
          const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
          return (
            <div key={n} className="flex items-center gap-2 text-sm">
              <span className="w-4 text-right">{n}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-7 text-right text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function ProductReviews({
  productSlug,
  productName,
  initialReviews,
}: {
  productSlug: string
  productName: string
  initialReviews: ReviewDoc[]
}) {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

      {/* Rating summary */}
      <RatingSummary reviews={initialReviews} />

      {/* Reviews list */}
      {initialReviews.length > 0 ? (
        <div className="mt-6">
          {initialReviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No reviews yet. Be the first to share your experience!
        </p>
      )}

      {/* Write a review */}
      <div className="mt-8">
        {submitted ? (
          <div className="rounded-lg border border-green-500/40 bg-green-50 dark:bg-green-950/20 p-4 text-sm text-green-700 dark:text-green-400">
            Thank you for your review! It will appear here once approved by our team.
          </div>
        ) : showForm ? (
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-4">Write a Review</h3>
            <ReviewForm
              productSlug={productSlug}
              productName={productName}
              onSubmitted={() => {
                setShowForm(false)
                setSubmitted(true)
              }}
            />
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="mt-3 text-xs text-muted-foreground underline underline-offset-2"
            >
              Cancel
            </button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>
    </section>
  )
}
