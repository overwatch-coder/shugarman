import { getCategories } from "@/lib/actions/categories"
import { getBrands } from "@/lib/actions/brands"
import { ProductEditor } from "@/components/admin/product-editor"

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()])
  return (
    <ProductEditor
      product={null}
      categories={categories}
      brands={brands}
    />
  )
}
