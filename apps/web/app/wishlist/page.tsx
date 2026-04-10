import { StoreShell } from "@/components/storefront/store-shell"
import { WishlistPageClient } from "@/components/storefront/wishlist-page-client"
import { getStorefrontProducts } from "@/lib/storefront-dal"

export default async function WishlistPage() {
  const products = await getStorefrontProducts()

  return (
    <StoreShell>
      <WishlistPageClient products={products} />
    </StoreShell>
  )
}