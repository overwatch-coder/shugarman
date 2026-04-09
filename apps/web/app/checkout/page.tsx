import { Suspense } from "react"
import { StoreShell } from "@/components/storefront/store-shell"
import { CheckoutPageClient } from "@/components/storefront/checkout-page-client"

export default function CheckoutPage() {
  return (
    <StoreShell>
      <Suspense>
        <CheckoutPageClient />
      </Suspense>
    </StoreShell>
  )
}
