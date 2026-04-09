import { getCategories } from "@/lib/actions/categories"
import { CategoriesClient } from "@/components/admin/categories-client"

export default async function AdminCategoriesPage() {
  const categories = await getCategories()
  return <CategoriesClient initialCategories={categories} />
}
