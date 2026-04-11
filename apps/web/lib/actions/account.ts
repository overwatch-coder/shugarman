"use server"

import { adminAuth, adminDb } from "@/lib/firebase-admin"
import { getSession } from "@/lib/admin-auth"

/** Verify the admin's current password using the Firebase Auth REST API. */
async function verifyCurrentPassword(email: string, password: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) return false

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: false }),
      }
    )
    return res.ok
  } catch {
    return false
  }
}

export async function updateAdminDisplayName(
  displayName: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  const trimmed = displayName.trim()
  if (!trimmed) return { success: false, error: "Display name cannot be empty" }

  try {
    await Promise.all([
      adminAuth.updateUser(session.uid, { displayName: trimmed }),
      adminDb.collection("admins").doc(session.uid).update({ displayName: trimmed }),
    ])
    return { success: true }
  } catch (err) {
    console.error("updateAdminDisplayName:", err)
    return { success: false, error: "Failed to update display name" }
  }
}

export async function updateAdminEmail(
  currentPassword: string,
  newEmail: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  const email = newEmail.trim().toLowerCase()
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address" }
  }

  const valid = await verifyCurrentPassword(session.email, currentPassword)
  if (!valid) return { success: false, error: "Current password is incorrect" }

  try {
    await Promise.all([
      adminAuth.updateUser(session.uid, { email }),
      adminDb.collection("admins").doc(session.uid).update({ email }),
    ])
    return { success: true }
  } catch (err) {
    console.error("updateAdminEmail:", err)
    return { success: false, error: "Failed to update email" }
  }
}

export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: "Unauthorized" }

  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" }
  }

  const valid = await verifyCurrentPassword(session.email, currentPassword)
  if (!valid) return { success: false, error: "Current password is incorrect" }

  try {
    await adminAuth.updateUser(session.uid, { password: newPassword })
    return { success: true }
  } catch (err) {
    console.error("updateAdminPassword:", err)
    return { success: false, error: "Failed to update password" }
  }
}
