import { Suspense } from "react"
import { StoreShell } from "@/components/storefront/store-shell"
import { ShopPageClient } from "@/components/storefront/shop-page-client"
import { getStorefrontProducts } from "@/lib/storefront-dal"

export default async function ShopPage() {
  const products = await getStorefrontProducts()

  return (
    <StoreShell>
      <Suspense>
        <ShopPageClient products={products} />
      </Suspense>
    </StoreShell>
  )
}
