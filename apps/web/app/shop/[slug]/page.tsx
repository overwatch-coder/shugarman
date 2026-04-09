import { notFound } from "next/navigation"

import { ProductDetailPageClient } from "@/components/storefront/product-detail-page-client"
import { StoreShell } from "@/components/storefront/store-shell"
import { productDetails } from "@/lib/storefront-data"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = productDetails[slug]

  if (!product) {
    notFound()
  }

  return (
    <StoreShell>
      <ProductDetailPageClient product={product} />
    </StoreShell>
  )
}
