import { CartPageClient } from "@/components/storefront/cart-page-client"
import { StoreShell } from "@/components/storefront/store-shell"

export default function CartPage() {
  return (
    <StoreShell>
      <CartPageClient />
    </StoreShell>
  )
}
