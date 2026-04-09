import { Suspense } from "react"
import { StoreShell } from "@/components/storefront/store-shell"
import { ShopPageClient } from "@/components/storefront/shop-page-client"

export default function ShopPage() {
  return (
    <StoreShell>
      <Suspense>
        <ShopPageClient />
      </Suspense>
    </StoreShell>
  )
}
