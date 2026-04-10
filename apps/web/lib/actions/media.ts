"use server"

import { getSession } from "@/lib/admin-auth"
import { importImageUrlToStorage } from "@/lib/media-storage"

export async function importAdminImageFromUrl(imageUrl: string, folder: string): Promise<{
  success: boolean
  url?: string
  error?: string
}> {
  const session = await getSession()
  if (!session) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const upload = await importImageUrlToStorage(imageUrl, folder)
    return { success: true, url: upload.url }
  } catch (err) {
    console.error("importAdminImageFromUrl:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to import image into Firebase storage",
    }
  }
}