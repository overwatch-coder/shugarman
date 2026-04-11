"use server"

import { adminDb } from "@/lib/firebase-admin"
import type { ReviewDoc, ReviewStatus } from "@/lib/schemas"
import { createNotification } from "@/lib/actions/notifications"

const COLLECTION = "reviews"

// ─── Admin reads ──────────────────────────────────────────────────────────────

export async function getReviews(
  status?: ReviewStatus
): Promise<ReviewDoc[]> {
  try {
    let query = adminDb
      .collection(COLLECTION)
      .orderBy("createdAt", "desc") as FirebaseFirestore.Query
    if (status) {
      query = query.where("status", "==", status)
    }
    const snap = await query.limit(200).get()
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ReviewDoc))
  } catch {
    return []
  }
}

export async function getReviewsForProduct(
  productSlug: string
): Promise<ReviewDoc[]> {
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .where("productSlug", "==", productSlug)
      .orderBy("createdAt", "desc")
      .get()
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ReviewDoc))
  } catch {
    return []
  }
}

// ─── Storefront submit ────────────────────────────────────────────────────────

export async function submitReview(data: {
  productSlug: string
  productName: string
  reviewerName: string
  reviewerEmail: string
  rating: number
  title: string
  body: string
}): Promise<{ success: boolean; error?: string }> {
  // Basic validation
  if (!data.reviewerName.trim()) return { success: false, error: "Name is required." }
  if (!data.title.trim()) return { success: false, error: "Review title is required." }
  if (!data.body.trim()) return { success: false, error: "Review text is required." }
  if (data.rating < 1 || data.rating > 5 || !Number.isInteger(data.rating)) {
    return { success: false, error: "Rating must be between 1 and 5." }
  }
  // Email format (optional field — only validate if provided)
  if (data.reviewerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.reviewerEmail)) {
    return { success: false, error: "Please enter a valid email address." }
  }
  // Sanitise text lengths
  if (data.reviewerName.length > 80) return { success: false, error: "Name is too long." }
  if (data.title.length > 120) return { success: false, error: "Title is too long." }
  if (data.body.length > 2000) return { success: false, error: "Review text is too long (max 2000 characters)." }

  try {
    const now = new Date().toISOString()
    const reviewRef = adminDb.collection(COLLECTION).doc()
    await reviewRef.set({
      productSlug: data.productSlug,
      productName: data.productName,
      reviewerName: data.reviewerName.trim(),
      reviewerEmail: data.reviewerEmail.trim().toLowerCase(),
      rating: data.rating,
      title: data.title.trim(),
      body: data.body.trim(),
      status: "pending" satisfies ReviewStatus,
      createdAt: now,
      updatedAt: now,
    })

    // Notify admin — fire-and-forget, don't block the response
    createNotification({
      event: "new_review",
      level: "info",
      title: "New review pending approval",
      message: `${data.reviewerName.trim()} left a ${data.rating}-star review on "${data.productName}".`,
      resourceSlug: data.productSlug,
      resourceType: "review",
    }).catch((err) => console.error("review notification:", err))

    return { success: true }
  } catch (err) {
    console.error("submitReview:", err)
    return { success: false, error: "Failed to submit review. Please try again." }
  }
}

// ─── Admin moderation ─────────────────────────────────────────────────────────

export async function updateReviewStatus(
  reviewId: string,
  status: ReviewStatus,
  adminNote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const update: Partial<ReviewDoc> & { updatedAt: string } = {
      status,
      updatedAt: new Date().toISOString(),
    }
    if (adminNote !== undefined) update.adminNote = adminNote
    await adminDb.collection(COLLECTION).doc(reviewId).update(update)

    // When approving, recalculate the product's aggregate rating
    if (status === "approved") {
      await recalculateProductRating(
        (await adminDb.collection(COLLECTION).doc(reviewId).get()).data()?.productSlug
      )
    }

    return { success: true }
  } catch (err) {
    console.error("updateReviewStatus:", err)
    return { success: false, error: "Failed to update review." }
  }
}

export async function deleteReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const doc = await adminDb.collection(COLLECTION).doc(reviewId).get()
    const productSlug = doc.data()?.productSlug as string | undefined
    await adminDb.collection(COLLECTION).doc(reviewId).delete()
    if (productSlug) await recalculateProductRating(productSlug)
    return { success: true }
  } catch (err) {
    console.error("deleteReview:", err)
    return { success: false, error: "Failed to delete review." }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recalculates and writes `rating` + `reviewCount` on the product document
 * using only approved reviews — keeping the product aggregate in sync.
 */
async function recalculateProductRating(productSlug?: string) {
  if (!productSlug) return
  try {
    const snap = await adminDb
      .collection(COLLECTION)
      .where("productSlug", "==", productSlug)
      .where("status", "==", "approved")
      .get()

    const count = snap.size
    const avg =
      count === 0
        ? 0
        : snap.docs.reduce((sum, doc) => sum + (doc.data().rating as number), 0) / count

    await adminDb.collection("products").doc(productSlug).update({
      rating: Math.round(avg * 10) / 10,
      reviewCount: count,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error("recalculateProductRating:", err)
  }
}
