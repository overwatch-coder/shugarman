import { NextResponse } from "next/server"

import { getSession } from "@/lib/admin-auth"
import { uploadImageFileToStorage } from "@/lib/media-storage"

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const folder = String(formData.get("folder") ?? "uploads").trim() || "uploads"

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Image file is required" }, { status: 400 })
    }

    const upload = await uploadImageFileToStorage(file, folder)

    return NextResponse.json({ success: true, url: upload.url })
  } catch (err) {
    console.error("admin upload route:", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to upload image",
      },
      { status: 500 }
    )
  }
}