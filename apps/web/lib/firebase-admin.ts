// Firebase Admin SDK — server-only (route handlers, server actions, middleware)
import { initializeApp, getApps, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!

  // Prefer service account JSON from env, fall back to application default credentials
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : undefined

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
