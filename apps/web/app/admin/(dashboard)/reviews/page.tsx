import { ReviewsClient } from "@/components/admin/reviews-client"
import { getReviews } from "@/lib/actions/reviews"

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  const reviews = await getReviews()
  return <ReviewsClient initialReviews={reviews} />
}
