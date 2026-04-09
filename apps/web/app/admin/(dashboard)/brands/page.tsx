import { getBrands } from "@/lib/actions/brands"
import { BrandsClient } from "@/components/admin/brands-client"

export default async function AdminBrandsPage() {
  const brands = await getBrands()
  return <BrandsClient initialBrands={brands} />
}
