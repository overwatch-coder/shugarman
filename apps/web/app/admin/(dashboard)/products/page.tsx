import { getProducts } from "@/lib/actions/products"
import { ProductsClient } from "@/components/admin/products-client"

export default async function AdminProductsPage() {
  const products = await getProducts()
  return <ProductsClient initialProducts={products} />
}
