"use client"

import { useMemo, useState, useTransition } from "react"
import { Check, ExternalLink, Star, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import type { ReviewDoc, ReviewStatus } from "@/lib/schemas"
import { deleteReview, updateReviewStatus } from "@/lib/actions/reviews"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso)
  )
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground"
          }`}
        />
      ))}
    </span>
  )
}

const STATUS_STYLES: Record<ReviewStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-600 border border-red-500/20",
}

type TabValue = ReviewStatus | "all"

// ─── Main component ───────────────────────────────────────────────────────────

export function ReviewsClient({ initialReviews }: { initialReviews: ReviewDoc[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [activeTab, setActiveTab] = useState<TabValue>("all")
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // ─── Derived list ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = reviews
    if (activeTab !== "all") list = list.filter((r) => r.status === activeTab)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (r) =>
          r.reviewerName.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q)
      )
    }
    return list
  }, [reviews, activeTab, search])

  const counts = useMemo(() => {
    const pending = reviews.filter((r) => r.status === "pending").length
    const approved = reviews.filter((r) => r.status === "approved").length
    const rejected = reviews.filter((r) => r.status === "rejected").length
    return { pending, approved, rejected, all: reviews.length }
  }, [reviews])

  // ─── Actions ────────────────────────────────────────────────────────────────

  function handleStatusChange(id: string, status: ReviewStatus) {
    startTransition(async () => {
      const result = await updateReviewStatus(id, status)
      if (result.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r))
        )
        toast.success(
          status === "approved"
            ? "Review approved and published."
            : "Review rejected."
        )
      } else {
        toast.error(result.error ?? "Failed to update review.")
      }
    })
  }

  function handleDeleteConfirmed() {
    if (!deleteId) return
    const id = deleteId
    setDeleteId(null)
    startTransition(async () => {
      const result = await deleteReview(id)
      if (result.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id))
        toast.success("Review deleted.")
      } else {
        toast.error(result.error ?? "Failed to delete review.")
      }
    })
  }

  const tabs: { value: TabValue; label: string }[] = [
    { value: "all", label: `All (${counts.all})` },
    { value: "pending", label: `Pending (${counts.pending})` },
    { value: "approved", label: `Approved (${counts.approved})` },
    { value: "rejected", label: `Rejected (${counts.rejected})` },
  ]

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Moderate customer reviews before they appear on the storefront.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Tab-style filter */}
        <div className="flex gap-1 rounded-lg border bg-muted/50 p-1 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                activeTab === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Search */}
        <input
          type="search"
          placeholder="Search reviews…"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="h-9 w-full sm:max-w-64 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-lg border border-dashed text-muted-foreground text-sm">
          No reviews found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Author</th>
                <th className="text-left px-4 py-3 font-medium">Rating</th>
                <th className="text-left px-4 py-3 font-medium">Review</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((review) => (
                <tr key={review.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  {/* Product */}
                  <td className="px-4 py-3 min-w-[160px]">
                    <Link
                      href={`/shop/${review.productSlug}`}
                      target="_blank"
                      className="flex items-center gap-1 font-medium hover:underline max-w-[180px] truncate"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                      {review.productName}
                    </Link>
                  </td>
                  {/* Author */}
                  <td className="px-4 py-3 min-w-[130px]">
                    <div className="font-medium truncate max-w-[150px]">{review.reviewerName}</div>
                    {review.reviewerEmail && (
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {review.reviewerEmail}
                      </div>
                    )}
                  </td>
                  {/* Rating */}
                  <td className="px-4 py-3">
                    <StarDisplay rating={review.rating} />
                  </td>
                  {/* Review */}
                  <td className="px-4 py-3 max-w-[280px]">
                    <p className="font-medium truncate">{review.title}</p>
                    <p className="text-muted-foreground text-xs line-clamp-2 mt-0.5">{review.body}</p>
                  </td>
                  {/* Status badge */}
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        STATUS_STYLES[review.status]
                      )}
                    >
                      {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                    {formatDate(review.createdAt)}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {review.status !== "approved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Approve"
                          disabled={isPending}
                          onClick={() => handleStatusChange(review.id, "approved")}
                        >
                          <Check className="h-4 w-4 text-emerald-500" />
                        </Button>
                      )}
                      {review.status !== "rejected" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reject"
                          disabled={isPending}
                          onClick={() => handleStatusChange(review.id, "rejected")}
                        >
                          <X className="h-4 w-4 text-amber-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete permanently"
                        disabled={isPending}
                        onClick={() => setDeleteId(review.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open: boolean) => { if (!open) setDeleteId(null) }}
        title="Delete Review?"
        description="This action is permanent. The review will be removed and the product's rating will be recalculated."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  )
}
