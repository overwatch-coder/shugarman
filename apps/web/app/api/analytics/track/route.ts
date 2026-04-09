import { NextResponse, type NextRequest } from "next/server"
import { FieldValue } from "firebase-admin/firestore"

import { adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { pathname?: unknown; isNewSession?: unknown }

    if (typeof body.pathname !== "string" || !body.pathname.startsWith("/") || body.pathname.startsWith("/admin")) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const dateKey = new Date().toISOString().slice(0, 10)
    const docRef = adminDb.collection("analyticsDaily").doc(dateKey)

    await docRef.set(
      {
        date: dateKey,
        pageViews: FieldValue.increment(1),
        sessions: FieldValue.increment(body.isNewSession === true ? 1 : 0),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}