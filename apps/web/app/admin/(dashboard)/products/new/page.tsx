import { getCategories } from "@/lib/actions/categories"
import { getBrands } from "@/lib/actions/brands"
import { getProducts } from "@/lib/actions/products"
import { ProductEditor } from "@/components/admin/product-editor"

export default async function NewProductPage() {
  const [categories, brands, products] = await Promise.all([getCategories(), getBrands(), getProducts()])
  return (
    <ProductEditor
      product={null}
      categories={categories}
      brands={brands}
      allProducts={products.map((product) => ({ slug: product.slug, name: product.name }))}
    />
  )
}
