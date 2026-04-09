import nextEnv from "@next/env"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { getSeedAdminAuth, getSeedDb, getSeedProjectId } from "./lib/seed/firebase-admin-seed"
import { DEFAULT_ADMIN_DISPLAY_NAME, DEFAULT_ADMIN_EMAIL, buildAdminDoc } from "./lib/admin/mappers"
import { parseCreateAdminOptions } from "./lib/admin/options"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDirectory, "..")
const { loadEnvConfig } = nextEnv

function isUserNotFoundError(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "auth/user-not-found"
  )
}

async function main(): Promise<void> {
  loadEnvConfig(appRoot)

  const options = parseCreateAdminOptions(process.argv.slice(2))
  const adminAuth = getSeedAdminAuth()
  const adminDb = getSeedDb()
  const adminEmail = options.email?.trim() || DEFAULT_ADMIN_EMAIL
  const displayName = options.displayName?.trim() || DEFAULT_ADMIN_DISPLAY_NAME

  console.log(`Project ID: ${getSeedProjectId()}`)
  console.log("Auth mode: service-account-env")
  console.log(`Mode: ${options.dryRun ? "dry-run" : "write"}`)
  console.log(`Admin email: ${adminEmail}`)
  console.log(`Display name: ${displayName}`)

  let existingUser: Awaited<ReturnType<typeof adminAuth.getUserByEmail>> | null = null

  try {
    existingUser = await adminAuth.getUserByEmail(adminEmail)
  } catch (error) {
    if (!isUserNotFoundError(error)) {
      throw error
    }
  }

  const authOperation = existingUser ? "update" : "create"
  const nowIso = new Date().toISOString()

  const userRecord = existingUser
    ? options.dryRun
      ? existingUser
      : await adminAuth.updateUser(existingUser.uid, {
          email: adminEmail,
          password: options.password,
          displayName,
        })
    : options.dryRun
      ? { uid: "<new-auth-uid>", email: adminEmail, displayName }
      : await adminAuth.createUser({
          email: adminEmail,
          password: options.password,
          displayName,
        })

  const adminDocRef = adminDb.collection("admins").doc(userRecord.uid)
  const adminSnapshot = userRecord.uid === "<new-auth-uid>" ? null : await adminDocRef.get()
  const adminOperation = adminSnapshot?.exists ? "replace" : "create"
  const adminDoc = buildAdminDoc({
    uid: userRecord.uid,
    email: adminEmail,
    displayName,
    existingCreatedAt: adminSnapshot?.get("createdAt"),
    nowIso,
  })

  if (!options.dryRun) {
    await adminDocRef.set(adminDoc)
  }

  console.log(`Auth user: ${authOperation} ${adminEmail}`)
  console.log(`Admin doc: ${adminOperation} admins/${userRecord.uid}`)
  console.log(`${options.dryRun ? "Dry run complete" : "Admin bootstrap complete"}`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Admin bootstrap failed: ${message}`)
  process.exitCode = 1
})