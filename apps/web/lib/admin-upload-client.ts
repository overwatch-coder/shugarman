export async function uploadAdminImage(file: File, folder: string) {
  const formData = new FormData()
  formData.set("file", file)
  formData.set("folder", folder)

  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    body: formData,
  })

  const payload = (await response.json()) as {
    success: boolean
    url?: string
    error?: string
  }

  if (!response.ok || !payload.success || !payload.url) {
    throw new Error(payload.error ?? "Failed to upload image")
  }

  return payload.url
}