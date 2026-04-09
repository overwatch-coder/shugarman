import { NextResponse, type NextRequest } from "next/server"
import { FieldValue } from "firebase-admin/firestore"

import { adminDb } from "@/lib/firebase-admin"

function buildPathDocId(dateKey: string, pathname: string) {
  return `${dateKey}__${pathname.replace(/\//g, "__") || "__root"}`
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { pathname?: unknown; isNewSession?: unknown }

    if (typeof body.pathname !== "string" || !body.pathname.startsWith("/") || body.pathname.startsWith("/admin")) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const dateKey = new Date().toISOString().slice(0, 10)
    const docRef = adminDb.collection("analyticsDaily").doc(dateKey)
    const pageDocRef = adminDb.collection("analyticsPagesDaily").doc(buildPathDocId(dateKey, body.pathname))

    const nowIso = new Date().toISOString()
    const batch = adminDb.batch()

    batch.set(
      docRef,
      {
        date: dateKey,
        pageViews: FieldValue.increment(1),
        sessions: FieldValue.increment(body.isNewSession === true ? 1 : 0),
        updatedAt: nowIso,
      },
      { merge: true }
    )

    batch.set(
      pageDocRef,
      {
        date: dateKey,
        path: body.pathname,
        pageViews: FieldValue.increment(1),
        updatedAt: nowIso,
      },
      { merge: true }
    )

    await batch.commit()

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}