"use server"

import { adminDb } from "@/lib/firebase-admin"
import type { BrandDoc } from "@/lib/schemas"

const COLLECTION = "brands"

export async function getBrands(): Promise<BrandDoc[]> {
  try {
    const snap = await adminDb.collection(COLLECTION).orderBy("name", "asc").get()
    return snap.docs.map((doc) => ({ slug: doc.id, ...doc.data() } as BrandDoc))
  } catch {
    return []
  }
}

export async function saveBrand(
  data: BrandDoc
): Promise<{ success: boolean; error?: string }> {
  try {
    const doc: Omit<BrandDoc, "slug"> = {
      name: data.name,
      featured: data.featured ?? false,
      ...(data.logo ? { logo: data.logo } : {}),
    }
    await adminDb.collection(COLLECTION).doc(data.slug).set(doc)
    return { success: true }
  } catch (err) {
    console.error("saveBrand:", err)
    return { success: false, error: "Failed to save brand" }
  }
}

export async function deleteBrand(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.collection(COLLECTION).doc(slug).delete()
    return { success: true }
  } catch (err) {
    console.error("deleteBrand:", err)
    return { success: false, error: "Failed to delete brand" }
  }
}
