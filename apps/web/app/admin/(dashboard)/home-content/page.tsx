import { HomeContentClient } from "@/components/admin/home-content-client"
import { getAdminHomeContent } from "@/lib/actions/home-content"
import { normalizeHomeCategories, normalizeHomeCategoriesHeading } from "@/lib/home-content"
import { homeCategories, homeCategoriesHeading } from "@/lib/storefront-data"

export default async function AdminHomeContentPage() {
  const content = await getAdminHomeContent()

  const categories = normalizeHomeCategories(content?.categories, homeCategories).map((category, index) => ({
    title: category.title,
    subtitle: category.subtitle,
    href: category.href,
    image: category.image,
    imageAlt: category.imageAlt,
    icon: category.icon,
    variant: category.variant,
    order: index,
    readonlyPreviewVariant: category.variant,
    readonlyPreviewIcon: category.icon,
  }))

  const heading = normalizeHomeCategoriesHeading(content?.categoriesHeading, homeCategoriesHeading)

  return <HomeContentClient initialHeading={heading} initialCategories={categories} />
}