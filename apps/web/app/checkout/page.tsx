import { Suspense } from "react"
import { StoreShell } from "@/components/storefront/store-shell"
import { CheckoutPageClient } from "@/components/storefront/checkout-page-client"
import { getStorefrontMetadata } from "@/lib/storefront-dal"

export default async function CheckoutPage() {
  const storeMetadata = await getStorefrontMetadata()

  return (
    <StoreShell>
      <Suspense>
        <CheckoutPageClient storeMetadata={storeMetadata} />
      </Suspense>
    </StoreShell>
  )
}
