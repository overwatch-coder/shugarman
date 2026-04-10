"use server"

import { adminDb } from "@/lib/firebase-admin"
import { importImageUrlToStorage } from "@/lib/media-storage"
import { getSession } from "@/lib/admin-auth"
import type { BentoCategoryDoc, HomeCategoriesHeadingDoc, HomeContentDoc } from "@/lib/schemas"

const DOC_PATH = "content/home"

export async function getAdminHomeContent(): Promise<Pick<HomeContentDoc, "categoriesHeading" | "categories"> | null> {
  try {
    const doc = await adminDb.doc(DOC_PATH).get()
    if (!doc.exists) return null

    const data = doc.data() as Partial<HomeContentDoc>
    return {
      categoriesHeading: data.categoriesHeading,
      categories: data.categories ?? [],
    }
  } catch {
    return null
  }
}

export async function saveHomeContent(data: {
  categoriesHeading: HomeCategoriesHeadingDoc
  categories: BentoCategoryDoc[]
}): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.doc(DOC_PATH).set(data, { merge: true })
    return { success: true }
  } catch (err) {
    console.error("saveHomeContent:", err)
    return { success: false, error: "Failed to save home content" }
  }
}

export async function importHomeCategoryImageFromUrl(imageUrl: string): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const upload = await importImageUrlToStorage(imageUrl, "storefront/home-categories")

    return {
      success: true,
      url: upload.url,
    }
  } catch (err) {
    console.error("importHomeCategoryImageFromUrl:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to import the image into Firebase storage",
    }
  }
}