import { randomUUID } from "node:crypto"

import { adminApp, adminStorage } from "@/lib/firebase-admin"
import { getStorageBucketCandidates } from "@/lib/storage-bucket"

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "-")
}

export function buildFirebaseDownloadUrl(bucketName: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`
}

async function resolveStorageBucket(): Promise<ReturnType<typeof adminStorage.bucket>> {
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
    adminApp.options.projectId?.toString()

  const candidates = getStorageBucketCandidates({
    configuredBucket:
      process.env.FIREBASE_ADMIN_STORAGE_BUCKET ?? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    projectId,
  })

  for (const bucketName of candidates) {
    const bucket = adminStorage.bucket(bucketName)
    const [exists] = await bucket.exists()
    if (exists) {
      return bucket
    }
  }

  throw new Error(
    `No Firebase Storage bucket found. Checked: ${candidates.join(", ") || "<none>"}. Configure FIREBASE_ADMIN_STORAGE_BUCKET or create the default bucket.`
  )
}

async function uploadImageBuffer({
  buffer,
  contentType,
  folder,
  fileName,
  metadata,
}: {
  buffer: Buffer
  contentType: string
  folder: string
  fileName: string
  metadata?: Record<string, string>
}) {
  const bucket = await resolveStorageBucket()
  const extension = contentType.split("/")[1]?.split(";")[0]?.trim() || "jpg"
  const objectPath = `${folder}/${Date.now()}-${randomUUID()}-${sanitizeFileName(fileName)}.${extension}`
  const token = randomUUID()

  await bucket.file(objectPath).save(buffer, {
    metadata: {
      contentType,
      metadata: {
        firebaseStorageDownloadTokens: token,
        ...(metadata ?? {}),
      },
    },
    resumable: false,
  })

  return {
    bucketName: bucket.name,
    objectPath,
    url: buildFirebaseDownloadUrl(bucket.name, objectPath, token),
  }
}

export async function uploadImageFileToStorage(file: File, folder: string) {
  const contentType = file.type || "image/jpeg"

  if (!contentType.startsWith("image/")) {
    throw new Error("Only image uploads are supported")
  }

  const arrayBuffer = await file.arrayBuffer()
  return uploadImageBuffer({
    buffer: Buffer.from(arrayBuffer),
    contentType,
    folder,
    fileName: file.name,
  })
}

export async function importImageUrlToStorage(imageUrl: string, folder: string) {
  const trimmedUrl = imageUrl.trim()
  if (!trimmedUrl) {
    throw new Error("Image URL is required")
  }

  const response = await fetch(trimmedUrl)
  if (!response.ok) {
    throw new Error("Could not download image from the provided URL")
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!contentType.startsWith("image/")) {
    throw new Error("The provided URL does not point to a valid image")
  }

  const arrayBuffer = await response.arrayBuffer()
  const fileName = trimmedUrl.split("/").pop() || "imported-image"

  return uploadImageBuffer({
    buffer: Buffer.from(arrayBuffer),
    contentType,
    folder,
    fileName,
    metadata: {
      sourceUrl: trimmedUrl,
    },
  })
}