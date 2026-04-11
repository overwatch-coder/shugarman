"use server"

import { adminDb } from "@/lib/firebase-admin"
import type { CategoryDoc } from "@/lib/schemas"

const COLLECTION = "categories"

export async function getCategories(): Promise<CategoryDoc[]> {
  try {
    const snap = await adminDb.collection(COLLECTION).orderBy("order", "asc").get()
    return snap.docs.map((doc) => ({ slug: doc.id, ...doc.data() } as CategoryDoc))
  } catch {
    return []
  }
}

export async function saveCategory(
  data: CategoryDoc
): Promise<{ success: boolean; error?: string }> {
  try {
    const doc: Omit<CategoryDoc, "slug"> = {
      name: data.name,
      order: data.order ?? 0,
    }
    await adminDb.collection(COLLECTION).doc(data.slug).set(doc)
    return { success: true }
  } catch (err) {
    console.error("saveCategory:", err)
    return { success: false, error: "Failed to save category" }
  }
}

export async function deleteCategory(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection(COLLECTION).doc(slug).delete()
    return { success: true }
  } catch (err) {
    console.error("deleteCategory:", err)
    return { success: false, error: "Failed to delete category" }
  }
}

/** Batch-update the `order` field for a list of slugs (0-based index). */
export async function reorderCategories(
  slugs: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const batch = adminDb.batch()
    slugs.forEach((slug, index) => {
      batch.update(adminDb.collection(COLLECTION).doc(slug), { order: index })
    })
    await batch.commit()
    return { success: true }
  } catch (err) {
    console.error("reorderCategories:", err)
    return { success: false, error: "Failed to save order" }
  }
}
