import { notFound } from "next/navigation"
import { getProduct } from "@/lib/actions/products"
import { getCategories } from "@/lib/actions/categories"
import { getBrands } from "@/lib/actions/brands"
import { getProducts } from "@/lib/actions/products"
import { ProductEditor } from "@/components/admin/product-editor"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, categories, brands, products] = await Promise.all([
    getProduct(slug),
    getCategories(),
    getBrands(),
    getProducts(),
  ])

  if (!product) notFound()

  return (
    <ProductEditor
      product={product}
      categories={categories}
      brands={brands}
      allProducts={products.map((entry) => ({ slug: entry.slug, name: entry.name }))}
    />
  )
}
