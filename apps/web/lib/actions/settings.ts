"use server"

import { adminDb } from "@/lib/firebase-admin"
import { importImageUrlToStorage } from "@/lib/media-storage"
import type { StoreSettingsDoc } from "@/lib/schemas"
import { getSession } from "@/lib/admin-auth"

const DOC_PATH = "settings/store"

export async function getStoreSettings(): Promise<StoreSettingsDoc | null> {
  try {
    const doc = await adminDb.doc(DOC_PATH).get()
    if (!doc.exists) return null
    return doc.data() as StoreSettingsDoc
  } catch {
    return null
  }
}

export async function saveStoreSettings(
  data: StoreSettingsDoc
): Promise<{ success: boolean; error?: string }> {
  try {
    await adminDb.doc(DOC_PATH).set(data, { merge: true })
    return { success: true }
  } catch (err) {
    console.error("saveStoreSettings:", err)
    return { success: false, error: "Failed to save settings" }
  }
}

export async function importStoreHeroImageFromUrl(imageUrl: string): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const upload = await importImageUrlToStorage(imageUrl, "storefront/hero")

    return {
      success: true,
      url: upload.url,
    }
  } catch (err) {
    console.error("importStoreHeroImageFromUrl:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to import the image into Firebase storage",
    }
  }
}
