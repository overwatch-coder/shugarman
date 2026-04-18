import { Suspense } from "react"
import { StoreShell } from "@/components/storefront/store-shell"
import { ShopPageClient } from "@/components/storefront/shop-page-client"
import { getStorefrontProducts } from "@/lib/storefront-dal"
import { getCategories } from "@/lib/actions/categories"
import { getBrands } from "@/lib/actions/brands"

export const dynamic = "force-dynamic"

export default async function ShopPage() {
  const [products, categories, brands] = await Promise.all([
    getStorefrontProducts(),
    getCategories(),
    getBrands(),
  ])

  return (
    <StoreShell>
      <Suspense>
        <ShopPageClient
          products={products}
          categories={categories.map((c) => c.name)}
          brands={brands.map((b) => b.name)}
        />
      </Suspense>
    </StoreShell>
  )
}
