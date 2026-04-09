import { notFound } from "next/navigation"

import { ProductDetailPageClient } from "@/components/storefront/product-detail-page-client"
import { StoreShell } from "@/components/storefront/store-shell"
import { getStorefrontProductDetail } from "@/lib/storefront-dal"

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getStorefrontProductDetail(slug)

  if (!product) {
    notFound()
  }

  return (
    <StoreShell>
      <ProductDetailPageClient product={product} />
    </StoreShell>
  )
}
