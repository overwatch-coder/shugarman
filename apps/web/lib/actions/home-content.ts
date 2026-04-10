"use server"

import { randomUUID } from "node:crypto"

import { adminDb, adminStorage } from "@/lib/firebase-admin"
import type { BentoCategoryDoc, HomeCategoriesHeadingDoc, HomeContentDoc } from "@/lib/schemas"

const DOC_PATH = "content/home"

function buildFirebaseDownloadUrl(bucketName: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`
}

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
  try {
    const trimmedUrl = imageUrl.trim()
    if (!trimmedUrl) {
      return { success: false, error: "Image URL is required" }
    }

    const response = await fetch(trimmedUrl)
    if (!response.ok) {
      return { success: false, error: "Could not download image from the provided URL" }
    }

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.startsWith("image/")) {
      return { success: false, error: "The provided URL does not point to a valid image" }
    }

    const extension = contentType.split("/")[1]?.split(";")[0]?.trim() || "jpg"
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const objectPath = `storefront/home-categories/${Date.now()}-${randomUUID()}.${extension}`
    const token = randomUUID()
    const bucket = adminStorage.bucket()

    await bucket.file(objectPath).save(buffer, {
      metadata: {
        contentType,
        metadata: {
          firebaseStorageDownloadTokens: token,
          sourceUrl: trimmedUrl,
        },
      },
      resumable: false,
    })

    return {
      success: true,
      url: buildFirebaseDownloadUrl(bucket.name, objectPath, token),
    }
  } catch (err) {
    console.error("importHomeCategoryImageFromUrl:", err)
    return { success: false, error: "Failed to import the image into Firebase storage" }
  }
}