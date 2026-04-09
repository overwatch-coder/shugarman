import { cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getAuth, type Auth } from "firebase-admin/auth"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

const SEED_APP_NAME = "seed-admin"

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required Firebase Admin env var: ${name}`)
  }

  return value
}

function getSeedApp() {
  const existingApp = getApps().find((app) => app.name === SEED_APP_NAME)

  if (existingApp) {
    return getApp(SEED_APP_NAME)
  }

  const projectId = requireEnv("FIREBASE_ADMIN_PROJECT_ID")
  const clientEmail = requireEnv("FIREBASE_ADMIN_CLIENT_EMAIL")
  const privateKey = requireEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n")

  return initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    },
    SEED_APP_NAME
  )
}

export function getSeedProjectId(): string {
  return requireEnv("FIREBASE_ADMIN_PROJECT_ID")
}

export function getSeedDb(): Firestore {
  return getFirestore(getSeedApp())
}

export function getSeedAdminAuth(): Auth {
  return getAuth(getSeedApp())
}