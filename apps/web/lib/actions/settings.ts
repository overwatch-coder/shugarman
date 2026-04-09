"use server"

import { adminDb } from "@/lib/firebase-admin"
import type { StoreSettingsDoc } from "@/lib/schemas"

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
