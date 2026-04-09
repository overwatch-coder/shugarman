import { notFound } from "next/navigation"
import { getProduct } from "@/lib/actions/products"
import { getCategories } from "@/lib/actions/categories"
import { getBrands } from "@/lib/actions/brands"
import { ProductEditor } from "@/components/admin/product-editor"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, categories, brands] = await Promise.all([
    getProduct(slug),
    getCategories(),
    getBrands(),
  ])

  if (!product) notFound()

  return (
    <ProductEditor
      product={product}
      categories={categories}
      brands={brands}
    />
  )
}
