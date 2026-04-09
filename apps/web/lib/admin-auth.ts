// Server action: verify Firebase ID token and create a session cookie
"use server"

import { cookies } from "next/headers"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

const SESSION_COOKIE_NAME = "__session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 5 * 1000 // 5 days

export async function createSession(idToken: string) {
  try {
    // Verify the ID token first
    const decoded = await adminAuth.verifyIdToken(idToken)

    // Check if user is an admin
    const adminSnap = await adminDb.collection("admins").doc(decoded.uid).get()
    if (!adminSnap.exists) {
      return { success: false, error: "Not authorized as admin" }
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE,
    })

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE / 1000,
    })

    const adminData = adminSnap.data()
    return {
      success: true,
      admin: {
        uid: decoded.uid,
        email: decoded.email ?? "",
        displayName: adminData?.displayName ?? decoded.name ?? "",
        role: adminData?.role ?? "editor",
      },
    }
  } catch (err) {
    console.error("Session creation failed:", err)
    return { success: false, error: "Authentication failed" }
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  return { success: true }
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value
    if (!sessionCookie) return null

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)

    const adminSnap = await adminDb.collection("admins").doc(decoded.uid).get()
    if (!adminSnap.exists) return null

    const adminData = adminSnap.data()
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      displayName: adminData?.displayName ?? "",
      role: (adminData?.role ?? "editor") as string,
    }
  } catch {
    return null
  }
}
