import { v2 as cloudinary } from "cloudinary"

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your .env.local"
    )
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
}

function sanitizeFolder(folder: string) {
  const cleaned = folder.trim().replace(/^\/+|\/+$/g, "")
  if (!cleaned || cleaned.includes("..")) {
    throw new Error("Invalid upload folder")
  }
  return cleaned
}

export async function uploadImageFileToStorage(file: File, folder: string) {
  const contentType = file.type || "application/octet-stream"
  if (!contentType.startsWith("image/")) {
    throw new Error("Only image uploads are supported")
  }

  getCloudinaryConfig()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const safeFolder = sanitizeFolder(folder)

  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: safeFolder, resource_type: "image" },
      (error, response) => {
        if (error || !response) {
          reject(error ?? new Error("Cloudinary upload returned no response"))
        } else {
          resolve(response)
        }
      }
    )
    stream.end(buffer)
  })

  return { url: result.secure_url }
}

export async function importImageUrlToStorage(imageUrl: string, folder: string) {
  const trimmedUrl = imageUrl.trim()
  if (!trimmedUrl) {
    throw new Error("Image URL is required")
  }

  getCloudinaryConfig()

  const safeFolder = sanitizeFolder(folder)

  // Cloudinary natively fetches and stores the remote image from the URL
  const result = await cloudinary.uploader.upload(trimmedUrl, {
    folder: safeFolder,
    resource_type: "image",
  })

  return { url: result.secure_url }
}