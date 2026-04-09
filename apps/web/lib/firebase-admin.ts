// Firebase Admin SDK — server-only (route handlers, server actions, middleware)
import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getServiceAccount(): ServiceAccount | undefined {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL

  if (!projectId || !privateKey || !clientEmail) {
    return undefined
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!

  // Prefer split service account env vars, fall back to project-scoped init.
  const serviceAccount = getServiceAccount()

  return initializeApp(
    serviceAccount
      ? { credential: cert(serviceAccount) }
      : { projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID }
  )
}

const adminApp = getAdminApp()

export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export { adminApp }
